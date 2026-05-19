from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from app.schemas.auth_schema import LoginSchema
from app.schemas.user_schema import UserSchema
from app.models.user_model import User
from app.utils.auth_middleware import create_access_token, get_current_user
import random
import time
from typing import Optional
from pydantic import BaseModel

auth_router = APIRouter()

# In-memory OTP store: { email: { otp, expires_at } }
_otp_store = {}

class LoginRequest(LoginSchema):
    role: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

@auth_router.post('/login')
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    username = data.username
    password = data.password
    selected_role = data.role.strip() if data.role else ""

    result = await db.execute(select(User).filter_by(username=username))
    user = result.scalars().first()

    if not user or not user.check_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau Password salah"
        )

    # Role enforcement: if user selected a role, it must match their actual role
    if selected_role and user.role != selected_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau Password salah"
        )

    access_token = create_access_token(identity=username, additional_claims={"role": user.role})
    
    # We can dump user via Pydantic UserSchema.model_validate(user).model_dump()
    user_data = UserSchema.model_validate(user).model_dump()
    if 'password' in user_data:
        del user_data['password']

    return {
        "message": "Login Berhasil",
        "access_token": access_token,
        "role": user.role,
        "user": user_data
    }

@auth_router.post('/forgot-password')
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email wajib diisi")

    result = await db.execute(select(User).filter(User.email.ilike(email)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Email tidak terdaftar di sistem")

    otp = str(random.randint(100000, 999999))
    _otp_store[email] = {"otp": otp, "expires_at": time.time() + 600}  # 10 menit

    # For development, log to console
    print(f"[DEV] OTP untuk {email}: {otp}")

    return {
        "message": f"Kode OTP telah dikirim ke {email}. Berlaku 10 menit.",
        "dev_otp": otp  # Hapus di production
    }

@auth_router.post('/reset-password')
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = data.email.strip().lower()
    otp = data.otp.strip()
    new_password = data.new_password.strip()

    if not email or not otp or not new_password:
        raise HTTPException(status_code=400, detail="Email, OTP, dan password baru wajib diisi")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")

    stored = _otp_store.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="OTP tidak ditemukan. Silakan minta OTP baru.")

    if time.time() > stored['expires_at']:
        if email in _otp_store:
            del _otp_store[email]
        raise HTTPException(status_code=400, detail="OTP sudah kadaluarsa. Silakan minta OTP baru.")

    if stored['otp'] != otp:
        raise HTTPException(status_code=400, detail="Kode OTP salah")

    result = await db.execute(select(User).filter(User.email.ilike(email)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.set_password(new_password)
    await db.commit()
    
    if email in _otp_store:
        del _otp_store[email]

    return {"message": "Password berhasil diubah! Silakan login dengan password baru."}

@auth_router.get('/me')
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {"logged_in_as": {"username": current_user.get("username"), "role": current_user.get("role")}}
