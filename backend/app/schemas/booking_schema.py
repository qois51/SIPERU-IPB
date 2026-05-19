from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
import re

class BookingSchema(BaseModel):
    id: Optional[int] = None
    booking_code: Optional[str] = None

    # Foreign keys
    room_id: int
    user_id: int

    # Data Peminjam
    nama_peminjam: Optional[str] = Field(None, max_length=100)
    nim_nip: Optional[str] = Field(None, max_length=30)
    program_studi: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = None
    nomor_hp: Optional[str] = None

    # Data Kegiatan
    activity_name: str = Field(..., min_length=3, max_length=200)
    jenis_kegiatan: Optional[str] = Field(None, max_length=100)
    organization: Optional[str] = Field("-", max_length=200)
    participants: Optional[int] = 1
    purpose: Optional[str] = Field("", max_length=500)
    deskripsi_kegiatan: Optional[str] = None

    # Schedule
    date: date
    start_time: str
    end_time: str

    # Status & Documents
    status: Optional[str] = "Pending"
    surat_file: Optional[str] = None
    document_url: Optional[str] = None
    qr_code: Optional[str] = None
    notes: Optional[str] = None

    # Facilities (list of facility names)
    facilities: Optional[List[str]] = []

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('email')
    def validate_email(cls, v):
        if v and not v.endswith('@apps.ipb.ac.id'):
            raise ValueError('Harap gunakan email @apps.ipb.ac.id')
        return v

    @field_validator('nomor_hp')
    def validate_nomor_hp(cls, v):
        if v:
            if not (10 <= len(v) <= 20):
                raise ValueError('Nomor HP harus antara 10 sampai 20 karakter')
            if not v.startswith('08'):
                raise ValueError('Nomor HP harus diawali 08')
        return v

    class Config:
        from_attributes = True
