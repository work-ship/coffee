from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="cashier")  # cashier, manager, admin
    pin = Column(String, nullable=True)  # quick cash login pin
    is_active = Column(Boolean, default=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)  # Name of Lucide Icon

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    availability = Column(Boolean, default=True)
    is_favorite = Column(Boolean, default=False)
    stock = Column(Integer, default=100)
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    extras = relationship("ProductExtra", back_populates="product", cascade="all, delete-orphan")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, nullable=False)  # e.g. Medium, Large, Soy Milk
    price_override = Column(Float, nullable=True)

    product = relationship("Product", back_populates="variants")

class ProductExtra(Base):
    __tablename__ = "product_extras"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    name = Column(String, nullable=False)  # e.g. Extra Espresso Shot, Caramel Syrup
    price = Column(Float, nullable=False, default=0.0)

    product = relationship("Product", back_populates="extras")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    loyalty_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="paid")  # paid, draft, cancelled, refunded
    payment_method = Column(String, default="cash")  # cash, card, mobile, qr, split
    payment_details = Column(JSON, nullable=True) # stores details for split or metadata
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    tax = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    cashier_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    selected_variant = Column(String, nullable=True)
    selected_extras = Column(JSON, nullable=True)  # list of strings/objects

    order = relationship("Order", back_populates="items")
