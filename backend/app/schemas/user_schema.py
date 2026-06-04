from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, Any


class UserSchema(BaseModel):

    id_user: Optional[int] = None
    nama: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    no_telepon: Optional[str] = None
    type: Optional[str] = None


    id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    nim_nip: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):

    nama: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

    email: EmailStr
    password: str = Field(..., min_length=6)
    no_telepon: Optional[str] = None
    phone: Optional[str] = None


    role: Optional[str] = None
    type: Optional[str] = None


    nim_nip: Optional[str] = None
    nim: Optional[str] = None
    nip: Optional[str] = None


    unit_kerja: Optional[str] = None
    jabatan: Optional[str] = None
    profile_image: Optional[str] = None


class MahasiswaOut(BaseModel):
    id_user: int
    nama: str
    nim: str
    email: str

    class Config:
        from_attributes = True