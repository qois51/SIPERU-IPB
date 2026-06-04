
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from database import get_db
from app.utils.auth_middleware import get_current_user
from app.controllers.auth_controller import AuthController

auth_router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


@auth_router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await AuthController.login(
        username=data.username,
        password=data.password,
        selected_role=data.role.strip() if data.role else "",
        db=db,
    )


@auth_router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
):
    return await AuthController.forgot_password(email=data.email, db=db)


@auth_router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
):
    return await AuthController.reset_password(
        email=data.email, otp=data.otp, new_password=data.new_password, db=db
    )


@auth_router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return AuthController.get_me(current_user)