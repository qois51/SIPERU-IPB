
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import with_polymorphic
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.user_model import User, Mahasiswa, PICRuangan, PenjagaRuangan
from app.schemas.user_schema import UserSchema, UserCreateSchema



UserCreate = UserCreateSchema


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

    @staticmethod
    async def get_all(db: AsyncSession) -> list:

        poly = with_polymorphic(User, [Mahasiswa, PICRuangan, PenjagaRuangan])
        result = await db.execute(select(poly))
        users = result.scalars().unique().all()
        return [u.to_dict() for u in users]

    @staticmethod
    async def get_by_id(id: int, current_user: dict, db: AsyncSession):

        poly = with_polymorphic(User, [Mahasiswa, PICRuangan, PenjagaRuangan])


        db_user_stmt = await db.execute(
            select(poly).filter(User.nama == current_user.get("username"))
        )
        db_user = db_user_stmt.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        if db_user.role != "admin" and db_user.id_user != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak!"
            )

        result = await db.execute(select(poly).filter(User.id_user == id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        return user.to_dict()

    @staticmethod
    async def create(data: UserCreateSchema, db: AsyncSession):

        username_val = data.nama or data.full_name or data.username
        if not username_val:
            raise HTTPException(status_code=422, detail="Nama / username wajib diisi.")

        result = await db.execute(select(User).filter(User.nama == username_val))
        if result.scalars().first():
            raise HTTPException(status_code=400, detail="Username/nama sudah digunakan")


        result_email = await db.execute(select(User).filter(User.email == data.email))
        if result_email.scalars().first():
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

        email_val      = data.email
        no_telepon_val = data.no_telepon or data.phone or "08123456789"
        role_val       = data.role or data.type or "mahasiswa"
        nim_nip_val    = data.nim_nip or data.nim or data.nip or "00000000"

        if role_val == "mahasiswa":
            new_user = Mahasiswa(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="mahasiswa",
                nim=nim_nip_val,
            )
        elif role_val in ("pic", "pic_ruangan"):
            new_user = PICRuangan(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="pic_ruangan",
                nip=nim_nip_val,
                unit_kerja=data.unit_kerja or "Bagian Sarana Prasarana",
                jabatan=data.jabatan or "PIC Staff",
            )
        elif role_val in ("satpam", "penjaga_ruangan"):
            new_user = PenjagaRuangan(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type="penjaga_ruangan",
                nip=nim_nip_val,
                unit_kerja=data.unit_kerja or "Bagian Keamanan",
            )
        else:

            new_user = User(
                nama=username_val,
                email=email_val,
                no_telepon=no_telepon_val,
                type=role_val,
            )

        new_user.set_password(data.password)
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user.to_dict()

    @staticmethod
    async def update(id: int, data: UserUpdate, current_user: dict, db: AsyncSession):

        poly = with_polymorphic(User, [Mahasiswa, PICRuangan, PenjagaRuangan])


        db_user_stmt = await db.execute(
            select(poly).filter(User.nama == current_user.get("username"))
        )
        db_user = db_user_stmt.scalars().first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        if db_user.role != "admin" and db_user.id_user != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak!"
            )


        result = await db.execute(select(poly).filter(User.id_user == id))
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
        return user.to_dict()

    @staticmethod
    async def delete(id: int, db: AsyncSession) -> dict:

        result = await db.execute(select(User).filter(User.id_user == id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        await db.delete(user)
        await db.commit()
        return {"message": "User berhasil dihapus"}