from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal

class UserSchema(BaseModel):
    id: Optional[int] = None
    username: str = Field(..., min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=6)
    role: Literal['mahasiswa', 'admin', 'satpam', 'dosen', 'pic']
    full_name: str = Field(..., min_length=1, max_length=100)
    nim_nip: str = Field(..., min_length=1, max_length=20)
    email: EmailStr
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True
