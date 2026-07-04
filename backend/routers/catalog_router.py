from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Category, Product, ProductVariant, ProductExtra, User
from backend.schemas import (
    CategoryCreate, CategoryOut,
    ProductCreate, ProductOut,
    ProductVariantCreate, ProductExtraCreate
)
from backend.auth import get_current_user, RoleChecker
from typing import List, Optional

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])

# --- Categories ---

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategoryOut)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    existing = db.query(Category).filter(Category.name == cat_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = Category(name=cat_in.name, icon=cat_in.icon)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/categories/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    category = db.query(Category).filter(Category.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return

# --- Products ---

@router.get("/products", response_model=List[ProductOut])
def get_products(category_id: Optional[int] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if q:
        query = query.filter(
            Product.name.like(f"%{q}%") | Product.description.like(f"%{q}%")
        )
    return query.all()

@router.post("/products", response_model=ProductOut)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == prod_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid Category ID")
    
    product = Product(
        name=prod_in.name,
        description=prod_in.description,
        price=prod_in.price,
        discount_price=prod_in.discount_price,
        image_url=prod_in.image_url,
        availability=prod_in.availability,
        is_favorite=prod_in.is_favorite,
        stock=prod_in.stock,
        category_id=prod_in.category_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{prod_id}", response_model=ProductOut)
def update_product(
    prod_id: int,
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    product = db.query(Product).filter(Product.id == prod_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, val in prod_in.dict().items():
        setattr(product, key, val)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{prod_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    prod_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    product = db.query(Product).filter(Product.id == prod_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return

# --- Variants & Extras Management ---

@router.post("/products/{prod_id}/variants", response_model=ProductOut)
def add_variant(
    prod_id: int,
    var_in: ProductVariantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    product = db.query(Product).filter(Product.id == prod_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variant = ProductVariant(product_id=prod_id, name=var_in.name, price_override=var_in.price_override)
    db.add(variant)
    db.commit()
    db.refresh(product)
    return product

@router.post("/products/{prod_id}/extras", response_model=ProductOut)
def add_extra(
    prod_id: int,
    ext_in: ProductExtraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"]))
):
    product = db.query(Product).filter(Product.id == prod_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    extra = ProductExtra(product_id=prod_id, name=ext_in.name, price=ext_in.price)
    db.add(extra)
    db.commit()
    db.refresh(product)
    return product
