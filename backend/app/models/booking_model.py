from database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List
import random
import string

def generate_booking_code():
    """Generate unique booking code: BK-YYYY-XXXX"""
    year = datetime.utcnow().strftime('%Y')
    rand = ''.join(random.choices(string.digits, k=4))
    return f"BK-{year}-{rand}"

class Peminjaman(Base):
    __tablename__ = 'peminjaman'

    id_booking: Mapped[int] = mapped_column(Integer, primary_key=True)
    waktu_mulai: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    waktu_selesai: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    keperluan: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default='Pending') # Pending, Approved, Rejected, CheckedIn, Completed, Expired
    path_file_bukti: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    id_epass: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)

    id_mahasiswa: Mapped[int] = mapped_column(ForeignKey('mahasiswa.id_user'), nullable=False)
    id_ruangan: Mapped[int] = mapped_column(ForeignKey('ruangan.id_ruangan'), nullable=False)

    # Optional columns to support existing UI services
    qr_code: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    # lazy="selectin" diperlukan agar async SQLAlchemy tidak error MissingGreenlet
    # saat to_dict() mengakses field relasi di luar context await
    mahasiswa: Mapped["Mahasiswa"] = relationship("Mahasiswa", back_populates="peminjamans", lazy="selectin")
    ruangan: Mapped["Ruangan"] = relationship("Ruangan", back_populates="peminjamans", lazy="selectin")
    facilities: Mapped[List["BookingFacility"]] = relationship("BookingFacility", back_populates="peminjaman", cascade="all, delete-orphan", lazy="selectin")

    # Compatibility properties for legacy routes and services
    @property
    def id(self) -> int:
        return self.id_booking

    @property
    def booking_code(self) -> str:
        return self.id_epass or ""

    @property
    def room_id(self) -> int:
        return self.id_ruangan

    @property
    def user_id(self) -> int:
        return self.id_mahasiswa

    @property
    def room_data(self) -> "Ruangan":
        return self.ruangan

    @property
    def nama_peminjam(self) -> str:
        return self.mahasiswa.nama if self.mahasiswa else ""

    @property
    def nim_nip(self) -> str:
        return self.mahasiswa.nim if self.mahasiswa else ""

    @property
    def program_studi(self) -> str:
        return "Umum"

    @property
    def email(self) -> str:
        return self.mahasiswa.email if self.mahasiswa else ""

    @property
    def nomor_hp(self) -> str:
        return self.mahasiswa.no_telepon if self.mahasiswa else ""

    @property
    def activity_name(self) -> str:
        return self.keperluan

    @property
    def jenis_kegiatan(self) -> str:
        return "Kegiatan"

    @property
    def organization(self) -> str:
        return "Individu"

    @property
    def participants(self) -> int:
        return 1

    @property
    def date(self) -> datetime.date:
        return self.waktu_mulai.date() if self.waktu_mulai else datetime.utcnow().date()

    @property
    def start_time(self) -> str:
        return self.waktu_mulai.strftime('%H:%M') if self.waktu_mulai else "09:00"

    @property
    def end_time(self) -> str:
        return self.waktu_selesai.strftime('%H:%M') if self.waktu_selesai else "10:00"

    @property
    def surat_file(self) -> str:
        return self.path_file_bukti or ""

    def to_dict(self):
        return {
            "id_booking": self.id_booking,
            "waktu_mulai": self.waktu_mulai.isoformat() if self.waktu_mulai else None,
            "waktu_selesai": self.waktu_selesai.isoformat() if self.waktu_selesai else None,
            "keperluan": self.keperluan,
            "status": self.status,
            "path_file_bukti": self.path_file_bukti,
            "id_epass": self.id_epass,
            "id_mahasiswa": self.id_mahasiswa,
            "id_ruangan": self.id_ruangan,
            "qr_code": self.qr_code,
            "notes": self.notes,
            # Fallback mappings for existing frontend compatibility
            "id": self.id_booking,
            "booking_code": self.id_epass,
            "room_id": self.id_ruangan,
            "user_id": self.id_mahasiswa,
            "room_name": self.ruangan.nama_ruangan if self.ruangan else None,
            "room_location": self.ruangan.location if self.ruangan else None,
            "room_price": self.ruangan.biaya_peminjaman if self.ruangan else None,
            "room_pic_name": self.ruangan.pic.nama if self.ruangan and self.ruangan.pic else None,
            "room_pic_email": self.ruangan.pic.email if self.ruangan and self.ruangan.pic else None,
            "room_pic_phone": self.ruangan.pic.no_telepon if self.ruangan and self.ruangan.pic else None,
            "user_name": self.mahasiswa.nama if self.mahasiswa else None,
            "nama_peminjam": self.mahasiswa.nama if self.mahasiswa else None,
            "nim_nip": self.mahasiswa.nim if self.mahasiswa else None,
            "email": self.mahasiswa.email if self.mahasiswa else None,
            "nomor_hp": self.mahasiswa.no_telepon if self.mahasiswa else None,
            "activity_name": self.keperluan,
            "purpose": self.keperluan,
            "date": self.waktu_mulai.strftime('%Y-%m-%d') if self.waktu_mulai else None,
            "start_time": self.waktu_mulai.strftime('%H:%M') if self.waktu_mulai else None,
            "end_time": self.waktu_selesai.strftime('%H:%M') if self.waktu_selesai else None,
            "surat_file": self.path_file_bukti,
            "facilities": [f.facility_name for f in self.facilities] if self.facilities else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

Booking = Peminjaman
