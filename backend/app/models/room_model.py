from app import db

class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    operational_hours = db.Column(db.String(100), nullable=False)
    facilities = db.Column(db.String(500), nullable=False) # Store as comma separated string
    pic_name = db.Column(db.String(100), nullable=False)
    pic_email = db.Column(db.String(100), nullable=False)
    pic_phone = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.Text, nullable=True)
    pic_image_url = db.Column(db.Text, nullable=True)
    
    # Relationship to bookings with cascade delete
    room_bookings = db.relationship('Booking', backref='room_parent', cascade='all, delete-orphan', lazy=True)

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
