from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models import Order, OrderItem, Product, Category, User
from backend.auth import get_current_user, RoleChecker
from typing import List, Dict, Any

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)

    # 1. Total revenue stats
    revenue_today = db.query(func.sum(Order.total)).filter(Order.date >= today_start, Order.status == "paid").scalar() or 0.0
    revenue_week = db.query(func.sum(Order.total)).filter(Order.date >= week_start, Order.status == "paid").scalar() or 0.0
    revenue_month = db.query(func.sum(Order.total)).filter(Order.date >= month_start, Order.status == "paid").scalar() or 0.0

    # 2. Transaction counts
    tx_today = db.query(func.count(Order.id)).filter(Order.date >= today_start, Order.status == "paid").scalar() or 0
    tx_week = db.query(func.count(Order.id)).filter(Order.date >= week_start, Order.status == "paid").scalar() or 0
    tx_month = db.query(func.count(Order.id)).filter(Order.date >= month_start, Order.status == "paid").scalar() or 0

    # 3. Average Order Value
    aov_today = revenue_today / tx_today if tx_today > 0 else 0.0

    # 4. Best sellers (Top 5)
    best_sellers_query = db.query(
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label("total_qty"),
        func.sum(OrderItem.quantity * OrderItem.price).label("total_rev")
    ).join(Order).filter(Order.status == "paid").group_by(OrderItem.product_name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    best_sellers = [
        {"name": row[0], "quantity": int(row[1]), "revenue": float(row[2])}
        for row in best_sellers_query
    ]

    # 5. Low stock alerts (< 15 units)
    low_stock_query = db.query(Product).filter(Product.stock < 15).all()
    low_stock = [
        {"id": p.id, "name": p.name, "stock": p.stock}
        for p in low_stock_query
    ]

    # 6. Sales timeline (Last 7 days)
    timeline = []
    for i in range(6, -1, -1):
        day_date = today_start - timedelta(days=i)
        next_day = day_date + timedelta(days=1)
        day_total = db.query(func.sum(Order.total)).filter(
            Order.date >= day_date,
            Order.date < next_day,
            Order.status == "paid"
        ).scalar() or 0.0
        timeline.append({
            "date": day_date.strftime("%b %d"),
            "revenue": float(day_total)
        })

    # 7. Category distribution
    category_sales_query = db.query(
        Category.name,
        func.sum(OrderItem.quantity * OrderItem.price).label("sales")
    ).join(Product, Product.category_id == Category.id)\
     .join(OrderItem, OrderItem.product_id == Product.id)\
     .join(Order, Order.id == OrderItem.order_id)\
     .filter(Order.status == "paid")\
     .group_by(Category.name).all()

    category_sales = [
        {"name": row[0], "value": float(row[1])}
        for row in category_sales_query
    ]

    return {
        "revenue": {
            "today": float(revenue_today),
            "week": float(revenue_week),
            "month": float(revenue_month)
        },
        "transactions": {
            "today": tx_today,
            "week": tx_week,
            "month": tx_month
        },
        "aov_today": float(aov_today),
        "best_sellers": best_sellers,
        "low_stock": low_stock,
        "timeline": timeline,
        "category_sales": category_sales
    }
