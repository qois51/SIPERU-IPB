"""
AuthController — Business logic untuk authentication.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import random
import time

from app.models.user_model import User
from app.schemas.auth_schema import LoginSchema
from app.schemas.user_schema import UserSchema
from app.utils.auth_middleware import create_access_token


# In-memory OTP store: { email: { otp, expires_at } }
_otp_store: dict = {}


class AuthController:
    """Handles all authentication-related business logic."""

    @staticmethod
    async def login(username: str, password: str, selected_role: str, db: AsyncSession) -> dict:
        """Authenticate user credentials and return JWT token."""
        result = await db.execute(select(User).filter(
            (User.nama == username) | (func.lower(User.email) == func.lower(username))
        ))
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

        access_token = create_access_token(
            identity=username,
            additional_claims={"role": user.role}
        )

        user_data = UserSchema.model_validate(user).model_dump()
        user_data.pop("password", None)

        return {
            "message": "Login Berhasil",
            "access_token": access_token,
            "role": user.role,
            "user": user_data
        }

    @staticmethod
    async def forgot_password(email: str, db: AsyncSession) -> dict:
        """Generate and store OTP for password reset."""
        email = email.strip().lower()
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

    @staticmethod
    async def reset_password(email: str, otp: str, new_password: str, db: AsyncSession) -> dict:
        """Validate OTP and update user password."""
        email = email.strip().lower()
        otp = otp.strip()
        new_password = new_password.strip()

        if not email or not otp or not new_password:
            raise HTTPException(status_code=400, detail="Email, OTP, dan password baru wajib diisi")

        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")

        stored = _otp_store.get(email)
        if not stored:
            raise HTTPException(status_code=400, detail="OTP tidak ditemukan. Silakan minta OTP baru.")

        if time.time() > stored["expires_at"]:
            _otp_store.pop(email, None)
            raise HTTPException(status_code=400, detail="OTP sudah kadaluarsa. Silakan minta OTP baru.")

        if stored["otp"] != otp:
            raise HTTPException(status_code=400, detail="Kode OTP salah")

        result = await db.execute(select(User).filter(User.email.ilike(email)))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        user.set_password(new_password)
        await db.commit()

        _otp_store.pop(email, None)

        return {"message": "Password berhasil diubah! Silakan login dengan password baru."}

    @staticmethod
    def get_me(current_user: dict) -> dict:
        """Return current authenticated user info."""
        return {
            "logged_in_as": {
                "username": current_user.get("username"),
                "role": current_user.get("role")
            }
        }
