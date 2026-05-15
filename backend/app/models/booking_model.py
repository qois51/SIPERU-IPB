from app import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(10), nullable=False) # Format HH:MM
    end_time = db.Column(db.String(10), nullable=False)   # Format HH:MM
    status = db.Column(db.String(20), default='Pending') # Pending, Approved, Rejected, Cancelled
    activity_name = db.Column(db.String(200), nullable=False)
    organization = db.Column(db.String(200), nullable=False)
    participants = db.Column(db.Integer, default=1)
    purpose = db.Column(db.String(500), nullable=False)
    document_url = db.Column(db.Text, nullable=True) # Supporting Base64 or URL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    room_data = db.relationship('Room', backref=db.backref('bookings_list', lazy=True), viewonly=True) # View only to avoid conflict
    user = db.relationship('User', backref=db.backref('bookings', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "room_id": self.room_id,
            "user_id": self.user_id,
            "room_name": self.room_data.name,
            "room_price": self.room_data.price,
            "user_name": self.user.username,
            "date": self.date.strftime('%Y-%m-%d'),
            "start_time": self.start_time,
            "end_time": self.end_time,
            "status": self.status,
            "activity_name": self.activity_name,
            "organization": self.organization,
            "participants": self.participants,
            "purpose": self.purpose,
            "document_url": self.document_url,
            "created_at": self.created_at.isoformat()
        }
