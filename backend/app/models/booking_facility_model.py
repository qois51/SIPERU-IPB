from app import db


class BookingFacility(db.Model):
    __tablename__ = 'booking_facilities'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    facility_name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "facility_name": self.facility_name
        }
