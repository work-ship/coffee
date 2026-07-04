from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserOut, UserLogin, PINLogin, Token
from backend.auth import verify_password, get_password_hash, create_access_token, get_current_user, RoleChecker

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin", "manager"]))):
    # Verify unique username
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        name=user_in.name,
        hashed_password=hashed,
        role=user_in.role,
        pin=user_in.pin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }

@router.post("/login-pin", response_model=Token)
def login_pin(pin_data: PINLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.pin == pin_data.pin).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect quick login PIN",
        )
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/employees", response_model=list[UserOut])
def list_employees(db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin", "manager"]))):
    return db.query(User).all()
