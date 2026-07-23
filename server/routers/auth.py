from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime
from models.user import RegisterRequest, LoginRequest
from database.db import get_db
from auth.jwt_handler import create_access_token, verify_token
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain[:72], hashed)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.post("/register")
def register(data: RegisterRequest):
    db = get_db()
    existing = db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "created_at": datetime.utcnow()
    }
    result = db.users.insert_one(user)
    return {"message": "User registered successfully", "id": str(result.inserted_id)}

@router.post("/login")
def login(data: LoginRequest):
    db = get_db()
    user = db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "name": user["name"]})
    return {"access_token": token, "token_type": "bearer", "name": user["name"]}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["sub"], "email": current_user["email"], "name": current_user["name"]}