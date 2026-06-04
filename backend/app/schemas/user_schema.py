from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, Any


class UserSchema(BaseModel):
    """Schema response untuk user — semua field Optional agar aman
    saat Pydantic membaca ORM object yang pakai joined-table-inheritance.
    Jangan ubah menjadi wajib; akses kolom subclass butuh async lazy-load.
    """
    id_user: Optional[int] = None
    nama: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    no_telepon: Optional[str] = None
    type: Optional[str] = None

    # Legacy compatibility fields
    id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    nim_nip: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreateSchema(BaseModel):
    """Schema untuk membuat user baru — menerima field yang dikirim frontend.
    Frontend mengirim: username/full_name (nama), email, password, role, nim_nip.
    """
    # Nama bisa datang sebagai 'nama' ATAU 'username' ATAU 'full_name'
    nama: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

    email: EmailStr
    password: str = Field(..., min_length=6)
    no_telepon: Optional[str] = None
    phone: Optional[str] = None

    # Role bisa datang sebagai 'role' (legacy) ATAU 'type' (model field)
    role: Optional[str] = None
    type: Optional[str] = None

    # NIM/NIP bisa datang sebagai 'nim_nip' atau masing-masing
    nim_nip: Optional[str] = None
    nim: Optional[str] = None
    nip: Optional[str] = None

    # Extra optional fields dari frontend
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
