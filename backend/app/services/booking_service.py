
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from datetime import datetime, date as py_date, timedelta
from typing import Optional, Tuple, List
import math

from app.models.booking_model import Peminjaman, generate_booking_code
from app.models.room_model import Ruangan
from app.models.user_model import Mahasiswa
from app.models.booking_facility_model import BookingFacility


class BookingService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_room_availability(
        self,
        room_id: int,
        date_val,
        start_time: str,
        end_time: str,
        exclude_booking_id: Optional[int] = None
    ) -> Tuple[bool, list]:

        if isinstance(date_val, str):
            try:
                date_val = datetime.strptime(date_val, "%Y-%m-%d").date()
            except ValueError:
                pass
        elif isinstance(date_val, datetime):
            date_val = date_val.date()

        date_str = date_val.strftime("%Y-%m-%d")
        try:
            start_dt = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
            end_dt = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
        except ValueError:
            return False, []

        query = select(Peminjaman).filter(
            Peminjaman.id_ruangan == room_id,
            Peminjaman.status.in_(["Pending", "Approved", "CheckedIn"]),
            Peminjaman.waktu_mulai < end_dt,
            Peminjaman.waktu_selesai > start_dt,
        )
        if exclude_booking_id:
            query = query.filter(Peminjaman.id_booking != exclude_booking_id)

        result = await self.db.execute(query)
        conflicts = result.scalars().all()
        return len(conflicts) == 0, conflicts

    async def create_booking(
        self,
        data: dict,
        facilities_list: Optional[list] = None
    ) -> Tuple[bool, any]:

        room_id = data.get("room_id") or data.get("id_ruangan")
        user_id = data.get("user_id") or data.get("id_mahasiswa")
        keperluan = (
            data.get("activity_name")
            or data.get("purpose")
            or data.get("keperluan")
            or "Peminjaman Ruangan"
        )
        path_file_bukti = data.get("surat_file") or data.get("path_file_bukti")

        date_input = data.get("date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if isinstance(date_input, str):
            try:
                date_val = datetime.strptime(date_input, "%Y-%m-%d").date()
            except ValueError:
                return False, "Format tanggal tidak valid. Gunakan YYYY-MM-DD."
        elif isinstance(date_input, datetime):
            date_val = date_input.date()
        else:
            date_val = date_input

        date_str = date_val.strftime("%Y-%m-%d")
        try:
            start_dt = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
            end_dt = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
        except (ValueError, TypeError):
            return False, "Format jam mulai atau selesai tidak valid. Gunakan HH:MM."


        room_result = await self.db.execute(
            select(Ruangan).filter(Ruangan.id_ruangan == room_id)
        )
        room = room_result.scalars().first()
        if not room:
            return False, "Ruangan tidak ditemukan."


        user_result = await self.db.execute(
            select(Mahasiswa).filter(Mahasiswa.id_user == user_id)
        )
        user = user_result.scalars().first()
        if not user:
            return False, "Mahasiswa tidak ditemukan. Pastikan user terdaftar sebagai mahasiswa."


        is_available, conflicts = await self.check_room_availability(
            room_id, date_val, start_time, end_time
        )
        if not is_available:
            conflict_info = [
                f"{c.waktu_mulai.strftime('%H:%M')}-{c.waktu_selesai.strftime('%H:%M')} ({c.keperluan})"
                for c in conflicts
            ]
            return False, f"Jadwal bentrok dengan booking lain: {', '.join(conflict_info)}"

        facilities = data.get("facilities") or facilities_list or []
        id_epass = generate_booking_code()

        peminjaman = Peminjaman(
            id_ruangan=room_id,
            id_mahasiswa=user_id,
            waktu_mulai=start_dt,
            waktu_selesai=end_dt,
            keperluan=keperluan,
            status="Pending",
            path_file_bukti=path_file_bukti,
            id_epass=id_epass,
        )
        self.db.add(peminjaman)
        await self.db.flush()

        for facility_name in facilities:
            facility = BookingFacility(
                booking_id=peminjaman.id_booking,
                facility_name=facility_name,
            )
            self.db.add(facility)

        await self.db.commit()
        await self.db.refresh(peminjaman)
        return True, peminjaman

    async def approve_booking(
        self, booking_id: int, notes: Optional[str] = None
    ) -> Tuple[bool, any]:

        result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = result.scalars().first()
        if not booking:
            return False, "Booking tidak ditemukan."

        if booking.status != "Pending":
            return False, f"Booking tidak bisa di-approve. Status saat ini: {booking.status}"

        booking.status = "Approved"
        booking.notes = notes

        if not booking.id_epass:
            booking.id_epass = generate_booking_code()


        from app.services.qr_service import QRService
        qr_svc = QRService()
        qr_path = qr_svc.generate_qr_for_booking(booking)
        if qr_path:
            booking.qr_code = qr_path

        await self.db.commit()

        fresh_result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = fresh_result.scalars().first()
        return True, booking

    async def reject_booking(
        self, booking_id: int, notes: Optional[str] = None
    ) -> Tuple[bool, any]:

        result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = result.scalars().first()
        if not booking:
            return False, "Booking tidak ditemukan."

        if booking.status != "Pending":
            return False, f"Booking tidak bisa di-reject. Status saat ini: {booking.status}"

        booking.status = "Rejected"
        booking.notes = notes or "Ditolak oleh admin."
        await self.db.commit()

        fresh_result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = fresh_result.scalars().first()
        return True, booking

    async def complete_booking(self, booking_id: int) -> Tuple[bool, any]:

        result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = result.scalars().first()
        if not booking:
            return False, "Booking tidak ditemukan."

        if booking.status != "Approved":
            return False, f"Hanya booking Approved yang bisa di-complete. Status: {booking.status}"

        booking.status = "Completed"
        await self.db.commit()

        fresh_result = await self.db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == booking_id)
        )
        booking = fresh_result.scalars().first()
        return True, booking

    async def get_bookings_paginated(
        self,
        page: int = 1,
        per_page: int = 10,
        status: Optional[str] = None,
        search: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> dict:

        query = select(Peminjaman)

        if user_id:
            query = query.filter(Peminjaman.id_mahasiswa == user_id)

        if status and status != "all":
            query = query.filter(Peminjaman.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Peminjaman.id_epass.ilike(search_term),
                    Peminjaman.keperluan.ilike(search_term),
                )
            )

        query = query.order_by(Peminjaman.created_at.desc())

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        result = await self.db.execute(query)
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
            },
        }

    async def get_dashboard_stats(self, user_id: Optional[int] = None) -> dict:

        base_query = select(func.count(Peminjaman.id_booking))
        if user_id:
            base_query = base_query.filter(Peminjaman.id_mahasiswa == user_id)

        async def _count(extra_filter=None):
            q = base_query
            if extra_filter is not None:
                q = q.filter(extra_filter)
            r = await self.db.execute(q)
            return r.scalar()

        total = await _count()
        pending = await _count(Peminjaman.status == "Pending")
        approved = await _count(Peminjaman.status == "Approved")
        rejected = await _count(Peminjaman.status == "Rejected")
        completed = await _count(Peminjaman.status == "Completed")
        draft = await _count(Peminjaman.status == "Draft")

        today = datetime.now()
        upcoming_query = select(Peminjaman).filter(
            Peminjaman.status == "Approved",
            Peminjaman.waktu_mulai >= today,
        )
        if user_id:
            upcoming_query = upcoming_query.filter(Peminjaman.id_mahasiswa == user_id)
        upcoming_query = upcoming_query.order_by(Peminjaman.waktu_mulai.asc()).limit(5)
        upcoming_result = await self.db.execute(upcoming_query)
        upcoming = upcoming_result.scalars().all()

        rooms_count_result = await self.db.execute(
            select(func.count(Ruangan.id_ruangan))
        )
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
            "upcoming": [b.to_dict() for b in upcoming],
        }

    async def get_room_availability(
        self, room_id: int, date_str: str
    ) -> Tuple[Optional[dict], Optional[str]]:

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None, "Format tanggal tidak valid. Gunakan YYYY-MM-DD."

        room_result = await self.db.execute(
            select(Ruangan).filter(Ruangan.id_ruangan == room_id)
        )
        room = room_result.scalars().first()
        if not room:
            return None, "Ruangan tidak ditemukan."

        start_of_day = datetime.combine(date_obj, datetime.min.time())
        end_of_day = datetime.combine(date_obj, datetime.max.time())

        bookings_result = await self.db.execute(
            select(Peminjaman).filter(
                Peminjaman.id_ruangan == room_id,
                Peminjaman.waktu_mulai >= start_of_day,
                Peminjaman.waktu_mulai <= end_of_day,
                Peminjaman.status.in_(["Pending", "Approved", "CheckedIn"]),
            ).order_by(Peminjaman.waktu_mulai.asc())
        )
        bookings = bookings_result.scalars().all()

        booked_slots = [
            {
                "start_time": b.waktu_mulai.strftime("%H:%M"),
                "end_time": b.waktu_selesai.strftime("%H:%M"),
                "status": b.status,
                "activity_name": b.keperluan,
            }
            for b in bookings
        ]

        return {
            "room_id": room_id,
            "room_name": room.nama_ruangan,
            "date": date_str,
            "booked_slots": booked_slots,
        }, None

    async def get_reports_stats(self, period: str) -> dict:

        today = datetime.now().date()

        period_map = {
            "1month": timedelta(days=30),
            "6months": timedelta(days=180),
            "1year": timedelta(days=365),
        }

        query = select(Peminjaman).filter(Peminjaman.status != "Draft")
        if period in period_map:
            start_date = today - period_map[period]
            start_dt = datetime.combine(start_date, datetime.min.time())
            query = query.filter(Peminjaman.waktu_mulai >= start_dt)

        query = query.order_by(Peminjaman.waktu_mulai.desc())
        result = await self.db.execute(query)
        bookings = result.scalars().all()

        total_bookings = len(bookings)
        total_approved = sum(
            1 for b in bookings if b.status in ["Approved", "CheckedIn", "Completed"]
        )
        total_completed = sum(1 for b in bookings if b.status == "Completed")
        total_pending = sum(1 for b in bookings if b.status == "Pending")
        total_rejected = sum(1 for b in bookings if b.status == "Rejected")

        total_duration_hours = 0.0
        for b in bookings:
            if b.waktu_mulai and b.waktu_selesai:
                duration = (b.waktu_selesai - b.waktu_mulai).total_seconds() / 3600.0
                if duration > 0:
                    total_duration_hours += duration

        room_stats: dict = {}
        dept_stats: dict = {}
        status_stats = {
            "Pending": 0, "Approved": 0, "Rejected": 0,
            "CheckedIn": 0, "Completed": 0, "Expired": 0, "Cancelled": 0,
        }

        for b in bookings:
            status_stats[b.status] = status_stats.get(b.status, 0) + 1

            room_name = (
                b.ruangan.nama_ruangan if b.ruangan else f"Ruangan ID {b.id_ruangan}"
            )
            if room_name not in room_stats:
                room_stats[room_name] = {"count": 0, "hours": 0.0}
            room_stats[room_name]["count"] += 1

            if b.waktu_mulai and b.waktu_selesai:
                duration = (b.waktu_selesai - b.waktu_mulai).total_seconds() / 3600.0
                if duration > 0:
                    room_stats[room_name]["hours"] += duration

            dept_name = b.mahasiswa.nim if b.mahasiswa else "Umum"
            dept_stats[dept_name] = dept_stats.get(dept_name, 0) + 1

        by_room = sorted(
            [{"room_name": k, "count": v["count"], "hours": round(v["hours"], 1)}
             for k, v in room_stats.items()],
            key=lambda x: x["count"],
            reverse=True,
        )
        by_department = sorted(
            [{"program_studi": k, "count": v} for k, v in dept_stats.items()],
            key=lambda x: x["count"],
            reverse=True,
        )
        by_organization = [{"organization": "Individu", "count": total_bookings}]

        return {
            "summary": {
                "total_bookings": total_bookings,
                "total_approved": total_approved,
                "total_completed": total_completed,
                "total_pending": total_pending,
                "total_rejected": total_rejected,
                "total_participants": total_bookings,
                "total_duration_hours": round(total_duration_hours, 1),
            },
            "by_room": by_room,
            "by_department": by_department,
            "by_organization": by_organization,
            "status_breakdown": status_stats,
            "bookings": [b.to_dict() for b in bookings],
        }