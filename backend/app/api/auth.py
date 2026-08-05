"""
Authentication endpoints: register, login, profile, logout.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserProfile
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    tokens = AuthService(db).register(payload)
    return success_response("Account created successfully", tokens.model_dump())


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    tokens = AuthService(db).login(payload)
    return success_response("Logged in successfully", tokens.model_dump())


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    return success_response("Profile fetched", UserProfile.model_validate(current_user).model_dump())


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT: logout is handled client-side by discarding tokens.
    # Kept as an explicit endpoint so the frontend has a consistent call
    # to hit (and a place to add token-blacklisting via Redis later).
    return success_response("Logged out successfully")
