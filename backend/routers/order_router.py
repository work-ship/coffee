from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Order, OrderItem, Product, User, Customer
from backend.schemas import OrderCreate, OrderOut
from backend.auth import get_current_user
from datetime import datetime
import uuid
from typing import List

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Order).order_by(Order.date.desc()).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate unique readable order number
    timestamp = datetime.utcnow().strftime("%y%m%d%H%M")
    unique_suffix = str(uuid.uuid4().int)[:4]
    order_number = f"POS-{timestamp}-{unique_suffix}"

    # Verify and update stock
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_name} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock}"
            )
        # Decrement stock
        product.stock -= item.quantity

    # Loyalty points processing
    if order_in.customer_id:
        customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
        if customer:
            # Earn 1 point per $1 spent (rounded down)
            points_earned = int(order_in.total)
            customer.loyalty_points += points_earned

    # Create Order
    new_order = Order(
        order_number=order_number,
        status=order_in.status,
        payment_method=order_in.payment_method,
        payment_details=order_in.payment_details,
        subtotal=order_in.subtotal,
        discount=order_in.discount,
        tax=order_in.tax,
        total=order_in.total,
        customer_id=order_in.customer_id,
        cashier_id=current_user.id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create Order Items
    for item in order_in.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price,
            discount=item.discount,
            selected_variant=item.selected_variant,
            selected_extras=item.selected_extras
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.post("/{order_id}/refund", response_model=OrderOut)
def refund_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status == "refunded":
        raise HTTPException(status_code=400, detail="Order is already refunded")

    # Return items back to stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity

    # Deduct loyalty points
    if order.customer_id:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        if customer:
            points_deducted = int(order.total)
            customer.loyalty_points = max(0, customer.loyalty_points - points_deducted)

    order.status = "refunded"
    db.commit()
    db.refresh(order)
    return order
