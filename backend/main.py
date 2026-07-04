from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from backend.routers import auth_router, catalog_router, order_router, customer_router, analytics_router
from backend.models import User, Category, Product, ProductVariant, ProductExtra, Customer, Order, OrderItem
from backend.auth import get_password_hash
from datetime import datetime, timedelta
import random

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coffee Shop Premium POS API",
    description="Backend API for high-end Coffee Shop POS System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(catalog_router.router)
app.include_router(order_router.router)
app.include_router(customer_router.router)
app.include_router(analytics_router.router)

# Seed sample data on startup if database is empty
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            admin_user = User(
                username="admin",
                name="Eliza Vance",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                pin="1111"
            )
            manager_user = User(
                username="manager",
                name="John Doe",
                hashed_password=get_password_hash("manager123"),
                role="manager",
                pin="2222"
            )
            cashier_user = User(
                username="cashier",
                name="Sarah Smith",
                hashed_password=get_password_hash("cashier123"),
                role="cashier",
                pin="3333"
            )
            db.add_all([admin_user, manager_user, cashier_user])
            db.commit()

        # 2. Seed Categories
        categories_data = [
            ("Coffee", "Coffee"),
            ("Espresso", "Flame"),
            ("Cappuccino", "CupSoda"),
            ("Latte", "Coffee"),
            ("Mocha", "Coffee"),
            ("Tea", "GlassWater"),
            ("Cold Drinks", "IceCream"),
            ("Desserts", "Cake"),
            ("Sandwiches", "UtensilsCrossed"),
            ("Bakery", "Croissant"),
            ("Snacks", "Cookie")
        ]
        
        if db.query(Category).count() == 0:
            for cat_name, icon_name in categories_data:
                category = Category(name=cat_name, icon=icon_name)
                db.add(category)
            db.commit()

        # 3. Seed Products
        if db.query(Product).count() == 0:
            # Fetch categories to map IDs
            cats = {c.name: c.id for c in db.query(Category).all()}
            
            products_data = [
                # Coffee
                {
                    "name": "House Blend Brew",
                    "description": "Our signature medium roast house blend, brewed fresh daily.",
                    "price": 3.50,
                    "discount_price": 2.99,
                    "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 100,
                    "category_id": cats["Coffee"],
                    "variants": [("Regular", 0), ("Large", 0.75)],
                    "extras": [("Extra shot", 0.80), ("Oat milk", 0.50)]
                },
                {
                    "name": "French Roast Brew",
                    "description": "Bold, smoky, and full-bodied dark roast.",
                    "price": 3.75,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": False,
                    "stock": 85,
                    "category_id": cats["Coffee"],
                    "variants": [("Regular", 0), ("Large", 0.75)],
                    "extras": [("Whipped cream", 0.40)]
                },
                # Espresso
                {
                    "name": "Classic Espresso",
                    "description": "Rich, concentrated shot of our signature espresso blend.",
                    "price": 2.75,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1510707577719-094119f7cc54?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 150,
                    "category_id": cats["Espresso"],
                    "variants": [("Single Shot", 0), ("Double Shot", 0.50)],
                    "extras": []
                },
                # Cappuccino
                {
                    "name": "Classic Cappuccino",
                    "description": "Double espresso topped with equal parts steamed milk and deep foam.",
                    "price": 4.50,
                    "discount_price": 3.99,
                    "image_url": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 120,
                    "category_id": cats["Cappuccino"],
                    "variants": [("Small", 0), ("Medium", 0.50), ("Large", 1.00)],
                    "extras": [("Extra Espresso Shot", 1.00), ("Almond Milk", 0.60)]
                },
                # Latte
                {
                    "name": "Vanilla Latte",
                    "description": "Espresso mixed with steamed milk and premium vanilla syrup.",
                    "price": 4.75,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 90,
                    "category_id": cats["Latte"],
                    "variants": [("Hot", 0), ("Iced", 0.25)],
                    "extras": [("Extra Caramel Drizzle", 0.50), ("Soy Milk", 0.50)]
                },
                # Tea
                {
                    "name": "Matcha Green Tea Latte",
                    "description": "Pure Japanese Uji matcha whisked with steamed milk.",
                    "price": 5.20,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 70,
                    "category_id": cats["Tea"],
                    "variants": [("Hot", 0), ("Iced", 0)],
                    "extras": [("Oat Milk", 0.50)]
                },
                # Cold Drinks
                {
                    "name": "Cold Brew Coffee",
                    "description": "Slow-steeped for 20 hours for an exceptionally smooth flavor.",
                    "price": 4.25,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": False,
                    "stock": 60,
                    "category_id": cats["Cold Drinks"],
                    "variants": [("Regular", 0), ("Large", 0.75)],
                    "extras": [("Vanilla Sweet Cream", 0.75)]
                },
                # Bakery
                {
                    "name": "Butter Croissant",
                    "description": "Flaky, golden-brown puff pastry baked fresh this morning.",
                    "price": 3.25,
                    "discount_price": None,
                    "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": True,
                    "stock": 25,
                    "category_id": cats["Bakery"],
                    "variants": [],
                    "extras": [("Warm up", 0)]
                },
                # Sandwiches
                {
                    "name": "Caprese Panini",
                    "description": "Fresh mozzarella, ripe tomatoes, and basil pesto grilled on sourdough.",
                    "price": 8.50,
                    "discount_price": 7.99,
                    "image_url": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=60",
                    "availability": True,
                    "is_favorite": False,
                    "stock": 8,  # Low stock alert demonstration!
                    "category_id": cats["Sandwiches"],
                    "variants": [],
                    "extras": [("Add Avocado", 1.50)]
                }
            ]

            for p_info in products_data:
                product = Product(
                    name=p_info["name"],
                    description=p_info["description"],
                    price=p_info["price"],
                    discount_price=p_info["discount_price"],
                    image_url=p_info["image_url"],
                    availability=p_info["availability"],
                    is_favorite=p_info["is_favorite"],
                    stock=p_info["stock"],
                    category_id=p_info["category_id"]
                )
                db.add(product)
                db.commit()
                db.refresh(product)
                
                # Add variants
                for var_name, var_override in p_info["variants"]:
                    var = ProductVariant(product_id=product.id, name=var_name, price_override=var_override if var_override > 0 else None)
                    db.add(var)
                
                # Add extras
                for ext_name, ext_price in p_info["extras"]:
                    ext = ProductExtra(product_id=product.id, name=ext_name, price=ext_price)
                    db.add(ext)
            db.commit()

        # 4. Seed Customers
        if db.query(Customer).count() == 0:
            customers = [
                Customer(name="Alice Green", phone="123-456-7890", email="alice@gmail.com", loyalty_points=240),
                Customer(name="Bob Martin", phone="987-654-3210", email="bob@yahoo.com", loyalty_points=85),
                Customer(name="Charlie Thompson", phone="555-019-2834", email="charlie@outlook.com", loyalty_points=12)
            ]
            db.add_all(customers)
            db.commit()

        # 5. Seed Historical Orders (for analytics)
        if db.query(Order).count() == 0:
            # Let's seed mock historical orders for the last 7 days
            cashier_id = db.query(User).filter(User.role == "cashier").first().id
            custs = db.query(Customer).all()
            prods = db.query(Product).all()
            
            for i in range(15):
                days_ago = random.randint(0, 6)
                order_date = datetime.utcnow() - timedelta(days=days_ago) - timedelta(hours=random.randint(1, 10))
                
                subtotal = 0.0
                order_items = []
                selected_prods = random.sample(prods, random.randint(1, 3))
                
                for p in selected_prods:
                    qty = random.randint(1, 2)
                    price = p.discount_price if p.discount_price else p.price
                    subtotal += price * qty
                    order_items.append(OrderItem(
                        product_id=p.id,
                        product_name=p.name,
                        quantity=qty,
                        price=price,
                        discount=0.0
                    ))
                
                discount = 0.0
                tax = round(subtotal * 0.08, 2)
                total = round(subtotal - discount + tax, 2)
                cust = random.choice(custs) if random.random() > 0.3 else None
                
                timestamp = order_date.strftime("%y%m%d%H%M")
                order_num = f"POS-{timestamp}-{random.randint(1000, 9999)}"
                
                order = Order(
                    order_number=order_num,
                    date=order_date,
                    status="paid",
                    payment_method=random.choice(["cash", "card", "mobile", "qr"]),
                    subtotal=round(subtotal, 2),
                    discount=discount,
                    tax=tax,
                    total=total,
                    customer_id=cust.id if cust else None,
                    cashier_id=cashier_id
                )
                db.add(order)
                db.commit()
                db.refresh(order)
                
                for item in order_items:
                    item.order_id = order.id
                    db.add(item)
            db.commit()

    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Premium Coffee POS Backend is operational."}
