from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class RoomSchema(BaseModel):
    # Core fields — pakai nama asli DB tapi keduanya opsional
    # supaya route bisa fallback ke field alias (name, capacity, dll.)
    id_ruangan: Optional[int] = None
    nama_ruangan: Optional[str] = Field(None, min_length=3, max_length=100)
    kapasitas: Optional[int] = None
    fasilitas: Optional[str] = None
    biaya_peminjaman: Optional[int] = None
    # id_pic opsional — RoomController akan resolve via pic_email/pic_name
    id_pic: Optional[int] = None

    # Alias / legacy fields dari frontend lama
    id: Optional[int] = None
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    operational_hours: Optional[str] = None
    facilities: Optional[str] = None
    pic_name: Optional[str] = None
    pic_email: Optional[EmailStr] = None
    pic_phone: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None
    pic_image_url: Optional[str] = None

    class Config:
        from_attributes = True
