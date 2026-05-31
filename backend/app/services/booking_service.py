from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from app.models.booking_model import Booking
from app.models.booking_facility_model import BookingFacility
from app.models.room_model import Room
from app.models.user_model import User
from datetime import datetime
import math

async def check_room_availability(db: AsyncSession, room_id: int, date, start_time: str, end_time: str, exclude_booking_id: int = None):
    from datetime import date as py_date, datetime as py_datetime
    if isinstance(date, str):
        try:
            date = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            pass
    elif isinstance(date, py_datetime):
        date = date.date()

    query = select(Booking).filter(
        Booking.room_id == room_id,
        Booking.date == date,
        Booking.status.in_(['Pending', 'Approved', 'CheckedIn']),
        Booking.start_time < end_time,
        Booking.end_time > start_time,
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    
    result = await db.execute(query)
    conflicts = result.scalars().all()
    return len(conflicts) == 0, conflicts

async def create_booking(db: AsyncSession, data: dict, facilities_list: list = None):
    from datetime import date as py_date, datetime as py_datetime
    date_val = data.get('date')
    if isinstance(date_val, str):
        try:
            data['date'] = datetime.strptime(date_val, '%Y-%m-%d').date()
        except ValueError:
            return False, "Format tanggal tidak valid. Gunakan YYYY-MM-DD."
    elif isinstance(date_val, py_datetime):
        data['date'] = date_val.date()

    room_result = await db.execute(select(Room).filter_by(id=data.get('room_id')))
    room = room_result.scalars().first()
    if not room:
        return False, "Ruangan tidak ditemukan."

    user_result = await db.execute(select(User).filter_by(id=data.get('user_id')))
    user = user_result.scalars().first()
    if not user:
        return False, "User tidak ditemukan."

    is_available, conflicts = await check_room_availability(
        db, data['room_id'], data['date'], data['start_time'], data['end_time']
    )
    if not is_available:
        conflict_info = [
            f"{c.start_time}-{c.end_time} ({c.activity_name})"
            for c in conflicts
        ]
        return False, f"Jadwal bentrok dengan booking lain: {', '.join(conflict_info)}"

    facilities = data.pop('facilities', []) if 'facilities' in data else (facilities_list or [])

    booking = Booking(**data)
    db.add(booking)
    await db.flush()

    for facility_name in facilities:
        facility = BookingFacility(
            booking_id=booking.id,
            facility_name=facility_name
        )
        db.add(facility)

    await db.commit()
    await db.refresh(booking)
    return True, booking

async def approve_booking(db: AsyncSession, booking_id: int, notes: str = None):
    result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = result.scalars().first()
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Pending':
        return False, f"Booking tidak bisa di-approve. Status saat ini: {booking.status}"

    booking.status = 'Approved'
    booking.notes = notes

    # Generate booking code if it doesn't exist
    from app.models.booking_model import generate_booking_code
    if not booking.booking_code:
        booking.booking_code = generate_booking_code()

    # Generate QR code first before commit while relationships are still loaded in session
    from app.services.qr_service import generate_qr_for_booking
    qr_path = generate_qr_for_booking(booking)
    if qr_path:
        booking.qr_code = qr_path

    await db.commit()
    
    # Re-query booking to fully load and refresh relationships (lazy="selectin")
    # to avoid lazy-loading MissingGreenlet errors inside route handler's .to_dict() call
    fresh_result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = fresh_result.scalars().first()

    return True, booking

async def reject_booking(db: AsyncSession, booking_id: int, notes: str = None):
    result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = result.scalars().first()
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Pending':
        return False, f"Booking tidak bisa di-reject. Status saat ini: {booking.status}"

    booking.status = 'Rejected'
    booking.notes = notes or "Ditolak oleh admin."
    await db.commit()
    
    # Re-query booking to fully load and refresh relationships (lazy="selectin")
    fresh_result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = fresh_result.scalars().first()
    
    return True, booking

async def complete_booking(db: AsyncSession, booking_id: int):
    result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = result.scalars().first()
    if not booking:
        return False, "Booking tidak ditemukan."

    if booking.status != 'Approved':
        return False, f"Hanya booking Approved yang bisa di-complete. Status: {booking.status}"

    booking.status = 'Completed'
    await db.commit()
    
    # Re-query booking to fully load and refresh relationships (lazy="selectin")
    fresh_result = await db.execute(select(Booking).filter_by(id=booking_id))
    booking = fresh_result.scalars().first()
    
    return True, booking

async def get_bookings_paginated(db: AsyncSession, page=1, per_page=10, status=None, search=None, user_id=None):
    query = select(Booking)

    if user_id:
        query = query.filter(Booking.user_id == user_id)

    if status and status != 'all':
        query = query.filter(Booking.status == status)

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

    query = query.order_by(Booking.created_at.desc())

    # Count query
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Offset pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    total_pages = math.ceil(total / per_page) if per_page > 0 else 0

    return {
        "bookings": [b.to_dict() for b in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }

async def get_dashboard_stats(db: AsyncSession, user_id=None):
    base_query = select(func.count(Booking.id))
    if user_id:
        base_query = base_query.filter(Booking.user_id == user_id)

    total_result = await db.execute(base_query)
    total = total_result.scalar()

    pending_result = await db.execute(base_query.filter(Booking.status == 'Pending'))
    pending = pending_result.scalar()

    approved_result = await db.execute(base_query.filter(Booking.status == 'Approved'))
    approved = approved_result.scalar()

    rejected_result = await db.execute(base_query.filter(Booking.status == 'Rejected'))
    rejected = rejected_result.scalar()

    completed_result = await db.execute(base_query.filter(Booking.status == 'Completed'))
    completed = completed_result.scalar()

    draft_result = await db.execute(base_query.filter(Booking.status == 'Draft'))
    draft = draft_result.scalar()

    today = datetime.now().date()
    upcoming_query = select(Booking).filter(
        Booking.status == 'Approved',
        Booking.date >= today
    )
    if user_id:
        upcoming_query = upcoming_query.filter(Booking.user_id == user_id)

    upcoming_query = upcoming_query.order_by(
        Booking.date.asc(), Booking.start_time.asc()
    ).limit(5)
    upcoming_result = await db.execute(upcoming_query)
    upcoming = upcoming_result.scalars().all()

    rooms_count_result = await db.execute(select(func.count(Room.id)))
    room_count = rooms_count_result.scalar()

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

async def get_room_availability(db: AsyncSession, room_id: int, date_str: str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None, "Format tanggal tidak valid. Gunakan YYYY-MM-DD."

    room_result = await db.execute(select(Room).filter_by(id=room_id))
    room = room_result.scalars().first()
    if not room:
        return None, "Ruangan tidak ditemukan."

    bookings_result = await db.execute(
        select(Booking).filter(
            Booking.room_id == room_id,
            Booking.date == date_obj,
            Booking.status.in_(['Pending', 'Approved', 'CheckedIn']),
        ).order_by(Booking.start_time.asc())
    )
    bookings = bookings_result.scalars().all()

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

async def get_reports_stats(db: AsyncSession, period: str):
    from datetime import datetime, timedelta
    from sqlalchemy.future import select
    from app.models.booking_model import Booking

    today = datetime.now().date()
    start_date = None

    if period == '1month':
        start_date = today - timedelta(days=30)
    elif period == '6months':
        start_date = today - timedelta(days=180)
    elif period == '1year':
        start_date = today - timedelta(days=365)
    
    query = select(Booking).filter(Booking.status != 'Draft')
    if start_date:
        query = query.filter(Booking.date >= start_date)
    
    query = query.order_by(Booking.date.desc())
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Summaries
    total_bookings = len(bookings)
    total_approved = sum(1 for b in bookings if b.status in ['Approved', 'CheckedIn', 'Completed'])
    total_completed = sum(1 for b in bookings if b.status == 'Completed')
    total_pending = sum(1 for b in bookings if b.status == 'Pending')
    total_rejected = sum(1 for b in bookings if b.status == 'Rejected')
    total_participants = sum(b.participants or 0 for b in bookings)

    # Durations calculation
    total_duration_hours = 0.0
    for b in bookings:
        if b.start_time and b.end_time:
            try:
                sh, sm = map(int, b.start_time.split(':'))
                eh, em = map(int, b.end_time.split(':'))
                duration = (eh * 60 + em - (sh * 60 + sm)) / 60.0
                if duration > 0:
                    total_duration_hours += duration
            except Exception:
                pass

    # Aggregations
    room_stats = {}
    dept_stats = {}
    org_stats = {}
    status_stats = {
        "Pending": 0,
        "Approved": 0,
        "Rejected": 0,
        "CheckedIn": 0,
        "Completed": 0,
        "Expired": 0,
        "Cancelled": 0
    }

    for b in bookings:
        # Status stats
        status_stats[b.status] = status_stats.get(b.status, 0) + 1

        # Room stats
        room_name = b.room_data.name if b.room_data else f"Ruangan ID {b.room_id}"
        if room_name not in room_stats:
            room_stats[room_name] = {"count": 0, "hours": 0.0}
        room_stats[room_name]["count"] += 1
        
        # Calculate duration for this booking
        if b.start_time and b.end_time:
            try:
                sh, sm = map(int, b.start_time.split(':'))
                eh, em = map(int, b.end_time.split(':'))
                duration = (eh * 60 + em - (sh * 60 + sm)) / 60.0
                if duration > 0:
                    room_stats[room_name]["hours"] += duration
            except Exception:
                pass

        # Department / Program Studi stats
        dept_name = b.program_studi or "Umum / Non-Akademik"
        dept_name = dept_name.strip()
        if not dept_name or dept_name == '-':
            dept_name = "Umum / Non-Akademik"
        
        dept_stats[dept_name] = dept_stats.get(dept_name, 0) + 1

        # Organization stats
        org_name = b.organization or "Individu"
        org_name = org_name.strip()
        if not org_name or org_name == '-':
            org_name = "Individu"
        
        org_stats[org_name] = org_stats.get(org_name, 0) + 1

    # Convert to sorted lists
    by_room = [
        {"room_name": name, "count": info["count"], "hours": round(info["hours"], 1)}
        for name, info in room_stats.items()
    ]
    by_room = sorted(by_room, key=lambda x: x["count"], reverse=True)

    by_department = [
        {"program_studi": name, "count": count}
        for name, count in dept_stats.items()
    ]
    by_department = sorted(by_department, key=lambda x: x["count"], reverse=True)

    by_organization = [
        {"organization": name, "count": count}
        for name, count in org_stats.items()
    ]
    by_organization = sorted(by_organization, key=lambda x: x["count"], reverse=True)

    return {
        "summary": {
            "total_bookings": total_bookings,
            "total_approved": total_approved,
            "total_completed": total_completed,
            "total_pending": total_pending,
            "total_rejected": total_rejected,
            "total_participants": total_participants,
            "total_duration_hours": round(total_duration_hours, 1)
        },
        "by_room": by_room,
        "by_department": by_department,
        "by_organization": by_organization,
        "status_breakdown": status_stats,
        "bookings": [b.to_dict() for b in bookings]
    }
