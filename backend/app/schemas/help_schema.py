from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class HelpRequestCreate(BaseModel):
    nama: str
    email: EmailStr
    pesan: str

class HelpRequestReply(BaseModel):
    reply_message: str

class HelpRequestOut(BaseModel):
    id: int
    nama: str
    email: EmailStr
    pesan: str
    status: str
    reply: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
