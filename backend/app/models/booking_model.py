from database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import random
import string

def generate_booking_code():
    """Generate unique booking code: BK-YYYY-XXXX"""
    year = datetime.utcnow().strftime('%Y')
    rand = ''.join(random.choices(string.digits, k=4))
    return f"BK-{year}-{rand}"

class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True)
    booking_code = Column(String(20), unique=True, nullable=True)  # BK-2026-1234

    # Foreign keys
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # --- Data Peminjam ---
    nama_peminjam = Column(String(100), nullable=True)
    nim_nip = Column(String(30), nullable=True)
    program_studi = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    nomor_hp = Column(String(20), nullable=True)

    # --- Data Kegiatan ---
    activity_name = Column(String(200), nullable=False)
    jenis_kegiatan = Column(String(100), nullable=True)
    organization = Column(String(200), nullable=True, default='-')
    participants = Column(Integer, default=1)
    purpose = Column(String(500), nullable=True, default='')
    deskripsi_kegiatan = Column(Text, nullable=True)

    # --- Booking Schedule ---
    date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)  # Format HH:MM
    end_time = Column(String(10), nullable=False)     # Format HH:MM

    # --- Status & Documents ---
    status = Column(String(20), default='Pending')  # Pending, Approved, Rejected, CheckedIn, Completed, Expired
    surat_file = Column(String(500), nullable=True)  # Path ke file upload
    document_url = Column(Text, nullable=True)       # Legacy: Base64 or URL
    qr_code = Column(String(500), nullable=True)     # Path ke QR image
    notes = Column(Text, nullable=True)               # Admin notes (alasan reject, dll)

    # --- Timestamps ---
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)

    # --- Relationships ---
    room_data = relationship('Room', back_populates='room_bookings', lazy="selectin")
    user = relationship('User', lazy="selectin")
    facilities = relationship('BookingFacility', back_populates='booking', lazy="selectin", cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "booking_code": self.booking_code,
            "room_id": self.room_id,
            "user_id": self.user_id,
            "room_name": self.room_data.name if self.room_data else None,
            "room_location": self.room_data.location if self.room_data else None,
            "room_price": self.room_data.price if self.room_data else None,
            "room_pic_name": self.room_data.pic_name if self.room_data else None,
            "room_pic_email": self.room_data.pic_email if self.room_data else None,
            "room_pic_phone": self.room_data.pic_phone if self.room_data else None,
            "room_pic_image_url": self.room_data.pic_image_url if self.room_data else None,
            "user_name": self.user.username if self.user else None,
            # Data Peminjam
            "nama_peminjam": self.nama_peminjam,
            "nim_nip": self.nim_nip,
            "program_studi": self.program_studi,
            "email": self.email,
            "nomor_hp": self.nomor_hp,
            # Data Kegiatan
            "activity_name": self.activity_name,
            "jenis_kegiatan": self.jenis_kegiatan,
            "organization": self.organization,
            "participants": self.participants,
            "purpose": self.purpose,
            "deskripsi_kegiatan": self.deskripsi_kegiatan,
            # Schedule
            "date": self.date.strftime('%Y-%m-%d') if self.date else None,
            "start_time": self.start_time,
            "end_time": self.end_time,
            # Status & Documents
            "status": self.status,
            "surat_file": self.surat_file,
            "document_url": self.document_url,
            "qr_code": self.qr_code,
            "notes": self.notes,
            # Facilities
            "facilities": [f.facility_name for f in self.facilities] if self.facilities else [],
            # Timestamps
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "checked_in_at": self.checked_in_at.isoformat() if self.checked_in_at else None,
            "checked_out_at": self.checked_out_at.isoformat() if self.checked_out_at else None,
            "expired_at": self.expired_at.isoformat() if self.expired_at else None,
        }
