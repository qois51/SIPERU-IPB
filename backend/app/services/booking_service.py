"""
Booking Service Layer
Handles all booking business logic: create, approve, reject, availability check, pagination.
"""
from app import db
from app.models.booking_model import Booking
from app.models.booking_facility_model import BookingFacility
from app.models.room_model import Room
from app.models.user_model import User
from datetime import datetime
from sqlalchemy import and_, or_


def check_room_availability(room_id, date, start_time, end_time, exclude_booking_id=None):
    """
    Check if a room is available for a given date and time range.
    Returns (is_available, conflicting_bookings).

    Overlap logic: A new booking (S2, E2) conflicts with existing (S1, E1) if:
    S2 < E1 AND E2 > S1
    """
    query = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.date == date,
        Booking.status.in_(['Pending', 'Approved']),
        # Overlap condition
        Booking.start_time < end_time,
        Booking.end_time > start_time,
    )

    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    conflicts = query.all()
    return len(conflicts) == 0, conflicts


def create_booking(data, facilities_list=None):
    """
    Create a new booking with validation.
    Returns (success, result_or_error).
    """
    # Validate room exists
    room = Room.query.get(data.get('room_id'))
    if not room:
        return False, "Ruangan tidak ditemukan."

    # Validate user exists
    user = User.query.get(data.get('user_id'))
    if not user:
        return False, "User tidak ditemukan."

    # Check room availability
    is_available, conflicts = check_room_availability(
        data['room_id'], data['date'], data['start_time'], data['end_time']
    )
    if not is_available:
        conflict_info = [
            f"{c.start_time}-{c.end_time} ({c.activity_name})"
            for c in conflicts
        ]
        return False, f"Jadwal bentrok dengan booking lain: {', '.join(conflict_info)}"

    # Remove facilities from data before creating Booking
    facilities = data.pop('facilities', []) if 'facilities' in data else (facilities_list or [])

    # Create booking
    booking = Booking(**data)
    db.session.add(booking)
    db.session.flush()  # Get the ID before committing

    # Add facilities
    for facility_name in facilities:
        facility = BookingFacility(
            booking_id=booking.id,
            facility_name=facility_name
        )
        db.session.add(facility)

    db.session.commit()
    return True, booking


def approve_booking(booking_id, notes=None):
    """Approve a booking and generate QR code."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Pending':
        return False, f"Booking tidak bisa di-approve. Status saat ini: {booking.status}"

    booking.status = 'Approved'
    booking.notes = notes
    db.session.commit()

    # Generate QR code after approval
    from app.services.qr_service import generate_qr_for_booking
    qr_path = generate_qr_for_booking(booking)
    if qr_path:
        booking.qr_code = qr_path
        db.session.commit()

    return True, booking


def reject_booking(booking_id, notes=None):
    """Reject a booking with reason."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Pending':
        return False, f"Booking tidak bisa di-reject. Status saat ini: {booking.status}"

    booking.status = 'Rejected'
    booking.notes = notes or "Ditolak oleh admin."
    db.session.commit()
    return True, booking


def complete_booking(booking_id):
    """Mark a booking as completed."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Approved':
        return False, f"Hanya booking Approved yang bisa di-complete. Status: {booking.status}"

    booking.status = 'Completed'
    db.session.commit()
    return True, booking


def get_bookings_paginated(page=1, per_page=10, status=None, search=None, user_id=None):
    """
    Get bookings with pagination, filter, and search.
    Returns (bookings_list, pagination_info).
    """
    query = Booking.query

    # Filter by user
    if user_id:
        query = query.filter(Booking.user_id == user_id)

    # Filter by status
    if status and status != 'all':
        query = query.filter(Booking.status == status)

    # Search by booking_code, activity_name, or nama_peminjam
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Booking.booking_code.ilike(search_term),
                Booking.activity_name.ilike(search_term),
                Booking.nama_peminjam.ilike(search_term),
                Booking.organization.ilike(search_term),
            )
        )

    # Order by newest first
    query = query.order_by(Booking.created_at.desc())

    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return {
        "bookings": [b.to_dict() for b in pagination.items],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        }
    }


def get_dashboard_stats(user_id=None):
    """Get dashboard statistics, optionally filtered by user."""
    base_query = Booking.query
    if user_id:
        base_query = base_query.filter(Booking.user_id == user_id)

    total = base_query.count()
    pending = base_query.filter(Booking.status == 'Pending').count()
    approved = base_query.filter(Booking.status == 'Approved').count()
    rejected = base_query.filter(Booking.status == 'Rejected').count()
    completed = base_query.filter(Booking.status == 'Completed').count()
    draft = base_query.filter(Booking.status == 'Draft').count()

    # Upcoming activities (Approved bookings from today onwards)
    today = datetime.now().date()
    upcoming_query = Booking.query.filter(
        Booking.status == 'Approved',
        Booking.date >= today
    )
    if user_id:
        upcoming_query = upcoming_query.filter(Booking.user_id == user_id)

    upcoming = upcoming_query.order_by(
        Booking.date.asc(), Booking.start_time.asc()
    ).limit(5).all()

    room_count = Room.query.count()

    return {
        "stats": {
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "completed": completed,
            "draft": draft,
            "total_rooms": room_count,
        },
        "upcoming": [b.to_dict() for b in upcoming]
    }


def get_room_availability(room_id, date_str):
    """
    Get all booked slots for a room on a specific date.
    Returns list of taken time slots.
    """
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None, "Format tanggal tidak valid. Gunakan YYYY-MM-DD."

    room = Room.query.get(room_id)
    if not room:
        return None, "Ruangan tidak ditemukan."

    bookings = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.date == date_obj,
        Booking.status.in_(['Pending', 'Approved']),
    ).order_by(Booking.start_time.asc()).all()

    booked_slots = [
        {
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "activity_name": b.activity_name,
        }
        for b in bookings
    ]

    return {
        "room_id": room_id,
        "room_name": room.name,
        "date": date_str,
        "booked_slots": booked_slots,
    }, None
