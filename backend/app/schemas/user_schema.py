from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal

class UserSchema(BaseModel):
    id_user: Optional[int] = None
    nama: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: Optional[str] = Field(None, min_length=6)
    no_telepon: str = Field(..., min_length=10, max_length=20)
    type: Literal['mahasiswa', 'pic_ruangan', 'penjaga_ruangan', 'user']

    # Legacy properties for compatibility with frontend and old services
    id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    nim_nip: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class MahasiswaOut(BaseModel):
    id_user: int
    nama: str
    nim: str
    email: str

    class Config:
        from_attributes = True
