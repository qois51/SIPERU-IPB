from pydantic import BaseModel, Field
from typing import Literal, Optional

class LoginSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)

class RegisterSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    role: Literal['mahasiswa', 'admin', 'satpam', 'dosen', 'pic']
    email: Optional[str] = None
    no_telepon: Optional[str] = None
    nim_nip: Optional[str] = None
    nama: Optional[str] = None