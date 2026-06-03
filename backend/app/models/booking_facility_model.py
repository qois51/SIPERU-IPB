from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class BookingFacility(Base):
    __tablename__ = 'booking_facilities'

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey('peminjaman.id_booking', ondelete='CASCADE'), nullable=False)
    facility_name = Column(String(100), nullable=False)

    peminjaman = relationship('Peminjaman', back_populates='facilities')

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "facility_name": self.facility_name
        }
