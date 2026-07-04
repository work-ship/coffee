from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Customer, User
from backend.schemas import CustomerCreate, CustomerOut
from backend.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerOut])
def get_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Customer).all()

@router.post("", response_model=CustomerOut)
def create_customer(
    cust_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Customer).filter(
        (Customer.phone == cust_in.phone) | (Customer.email == cust_in.email)
    ).first() if cust_in.phone or cust_in.email else None

    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email or phone already exists")
    
    customer = Customer(
        name=cust_in.name,
        phone=cust_in.phone,
        email=cust_in.email,
        loyalty_points=cust_in.loyalty_points
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.put("/{cust_id}", response_model=CustomerOut)
def update_customer(
    cust_id: int,
    cust_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == cust_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, val in cust_in.dict().items():
        setattr(customer, key, val)
        
    db.commit()
    db.refresh(customer)
    return customer
