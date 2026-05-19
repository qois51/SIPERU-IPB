from database import Base
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

class Room(Base):
    __tablename__ = 'rooms'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    capacity = Column(Integer, nullable=False)
    operational_hours = Column(String(100), nullable=False)
    facilities = Column(String(500), nullable=False) # Store as comma separated string
    pic_name = Column(String(100), nullable=False)
    pic_email = Column(String(100), nullable=False)
    pic_phone = Column(String(20), nullable=False)
    price = Column(Integer, nullable=False, default=0)
    image_url = Column(Text, nullable=True)
    pic_image_url = Column(Text, nullable=True)
    
    # Relationship to bookings with cascade delete
    room_bookings = relationship('Booking', back_populates='room_data', cascade='all, delete-orphan', lazy="selectin")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "capacity": self.capacity,
            "price": self.price,
            "operational_hours": self.operational_hours,
            "facilities": self.facilities.split(',') if self.facilities else [],
            "pic_name": self.pic_name,
            "pic_email": self.pic_email,
            "pic_phone": self.pic_phone,
            "image_url": self.image_url.split('|') if self.image_url else [],
            "pic_image_url": self.pic_image_url
        }
