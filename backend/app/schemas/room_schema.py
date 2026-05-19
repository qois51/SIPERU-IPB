from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class RoomSchema(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=3, max_length=100)
    location: str
    capacity: int
    operational_hours: str
    facilities: str
    pic_name: str
    pic_email: EmailStr
    pic_phone: str
    price: int
    image_url: Optional[str] = None
    pic_image_url: Optional[str] = None
    
    class Config:
        from_attributes = True
