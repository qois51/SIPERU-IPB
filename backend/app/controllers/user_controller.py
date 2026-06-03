"""
UserController — Business logic untuk manajemen pengguna.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.user_model import User, Mahasiswa, PICRuangan, PenjagaRuangan
from app.schemas.user_schema import UserSchema


class UserCreate(UserSchema):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    nim_nip: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


class UserController:
    """Handles all user-related CRUD operations."""

    @staticmethod
    async def get_all(db: AsyncSession) -> list:
        """Return all users (admin only)."""
        result = await db.execute(select(User))
        users = result.scalars().all()
        return users

    @staticmethod
    async def get_by_id(id: int, current_user: dict, db: AsyncSession):
        """Return user by ID, enforcing ownership for non-admins."""
        # Resolve calling user's DB record
        db_user_stmt = await db.execute(
            select(User).filter(User.nama == current_user.get("username"))
        )
        db_user = db_user_stmt.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        if db_user.role != "admin" and db_user.id_user != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak!"
            )

        result = await db.execute(select(User).filter(User.id_user == id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        return user

    @staticmethod
    async def create(data: UserCreate, db: AsyncSession):
        """Create a new user with the appropriate type."""
        username_val = data.nama or data.username
        if not username_val:
            raise HTTPException(status_code=422, detail="nama atau username wajib diisi.")

        result = await db.execute(select(User).filter(User.nama == username_val))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username/nama sudah digunakan")

        email_val = data.email
        no_telepon_val = data.no_telepon or data.phone or "08123456789"
        role_val = data.role or "user"
        nim_nip_val = data.nim_nip or "12345"

        if role_val == "mahasiswa":
            new_user = Mahasiswa(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="mahasiswa",
                nim=nim_nip_val,
            )
        elif role_val == "pic":
            new_user = PICRuangan(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="pic_ruangan",
                nip=nim_nip_val,
                unit_kerja="Bagian Sarana Prasarana",
                jabatan="PIC Staff",
            )
        elif role_val == "satpam":
            new_user = PenjagaRuangan(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="penjaga_ruangan",
                nip=nim_nip_val,
                unit_kerja="Bagian Keamanan",
            )
        else:
            new_user = User(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="user",
            )

        new_user.set_password(data.password)
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    @staticmethod
    async def update(id: int, data: UserUpdate, current_user: dict, db: AsyncSession):
        """Update user details, enforcing ownership for non-admins."""
        db_user_stmt = await db.execute(
            select(User).filter(User.nama == current_user.get("username"))
        )
        db_user = db_user_stmt.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        if db_user.role != "admin" and db_user.id_user != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak!"
            )

        result = await db.execute(select(User).filter(User.id_user == id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        update_username = data.username or data.full_name
        if update_username and update_username != user.nama:
            if db_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hanya admin yang dapat mengubah username/nama."
                )
            check_result = await db.execute(
                select(User).filter(User.nama == update_username)
            )
            if check_result.scalars().first():
                raise HTTPException(status_code=400, detail="Username/nama sudah digunakan")
            user.nama = update_username

        if data.password:
            user.set_password(data.password)

        if data.nim_nip is not None:
            if db_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hanya admin yang dapat mengubah NIM/NIP."
                )
            if isinstance(user, Mahasiswa):
                user.nim = data.nim_nip
            elif isinstance(user, (PICRuangan, PenjagaRuangan)):
                user.nip = data.nim_nip

        if data.email is not None:
            user.email = data.email

        if data.phone is not None:
            user.no_telepon = data.phone

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete(id: int, db: AsyncSession) -> dict:
        """Delete a user (admin only)."""
        result = await db.execute(select(User).filter(User.id_user == id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        await db.delete(user)
        await db.commit()
        return {"message": "User berhasil dihapus"}
