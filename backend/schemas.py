from pydantic import BaseModel, EmailStr

# Data yang dikirim User saat mendaftar
class MahasiswaCreate(BaseModel):
    nama: str
    email: str
    password: str
    no_telp: str
    nim: str

# Data yang kita kirim balik ke User (Response)
class MahasiswaOut(BaseModel):
    id_user: int
    nama: str
    nim: str
    email: str

    class Config:
        from_attributes = True # Agar Pydantic bisa baca objek SQLAlchemy
