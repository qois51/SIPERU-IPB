from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime


class BookingSchema(BaseModel):
    id_booking: Optional[int] = None
    waktu_mulai: Optional[datetime] = None
    waktu_selesai: Optional[datetime] = None
    keperluan: Optional[str] = None
    status: Optional[str] = "Pending"
    path_file_bukti: Optional[str] = None
    id_epass: Optional[str] = None
    id_mahasiswa: Optional[int] = None
    id_ruangan: Optional[int] = None

    # Fallback/alias fields untuk kompatibilitas frontend
    id: Optional[int] = None
    booking_code: Optional[str] = None
    room_id: Optional[int] = None
    user_id: Optional[int] = None
    nama_peminjam: Optional[str] = None
    nim_nip: Optional[str] = None
    program_studi: Optional[str] = None
    email: Optional[str] = None
    nomor_hp: Optional[str] = None
    activity_name: Optional[str] = None
    jenis_kegiatan: Optional[str] = None
    organization: Optional[str] = "-"
    participants: Optional[int] = 1
    purpose: Optional[str] = None
    deskripsi_kegiatan: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    surat_file: Optional[str] = None
    document_url: Optional[str] = None
    qr_code: Optional[str] = None
    notes: Optional[str] = None
    facilities: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator("nomor_hp")
    def validate_nomor_hp(cls, v):
        if v:
            if not (10 <= len(v) <= 20):
                raise ValueError("Nomor HP harus antara 10 sampai 20 karakter")
            if not v.startswith("08"):
                raise ValueError("Nomor HP harus diawali 08")
        return v

    class Config:
        from_attributes = True
