from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- Token & Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class PINLogin(BaseModel):
    pin: str

# --- User / Employee ---
class UserBase(BaseModel):
    username: str
    name: str
    role: str
    pin: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Variant & Extra ---
class ProductVariantBase(BaseModel):
    name: str
    price_override: Optional[float] = None

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantOut(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductExtraBase(BaseModel):
    name: str
    price: float

class ProductExtraCreate(ProductExtraBase):
    pass

class ProductExtraOut(ProductExtraBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

# --- Category ---
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    image_url: Optional[str] = None
    availability: bool = True
    is_favorite: bool = False
    stock: int = 100
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    variants: List[ProductVariantOut] = []
    extras: List[ProductExtraOut] = []

    class Config:
        from_attributes = True

# --- Customer ---
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    loyalty_points: int = 0

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Order Items ---
class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    discount: float = 0.0
    selected_variant: Optional[str] = None
    selected_extras: Optional[List[str]] = None

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    discount: float
    selected_variant: Optional[str] = None
    selected_extras: Optional[Any] = None

    class Config:
        from_attributes = True

# --- Order ---
class OrderCreate(BaseModel):
    status: str = "paid"  # paid, draft, cancelled, refunded
    payment_method: str = "cash"  # cash, card, mobile, qr, split
    payment_details: Optional[Any] = None
    subtotal: float
    discount: float = 0.0
    tax: float
    total: float
    customer_id: Optional[int] = None
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    order_number: str
    date: datetime
    status: str
    payment_method: str
    payment_details: Optional[Any] = None
    subtotal: float
    discount: float
    tax: float
    total: float
    customer_id: Optional[int] = None
    cashier_id: Optional[int] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
