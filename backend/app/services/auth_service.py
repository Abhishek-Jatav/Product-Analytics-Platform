"""
Business logic for authentication. Routes call this; this calls the
repository. No SQL and no request/response objects belong here.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenPair, UserProfile


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, payload: RegisterRequest) -> TokenPair:
        if self.repo.get_by_email(payload.email):
            raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

        user = self.repo.create(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )
        return self._issue_tokens(user)

    def login(self, payload: LoginRequest) -> TokenPair:
        user = self.repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
        if not user.is_active:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated")

        return self._issue_tokens(user)

    def _issue_tokens(self, user) -> TokenPair:
        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
            user=UserProfile.model_validate(user),
        )
