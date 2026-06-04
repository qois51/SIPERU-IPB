
from fastapi import HTTPException, status, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime
from calendar import monthrange
from typing import Optional

from app.models.user_model import User
from app.models.booking_model import Peminjaman
from app.schemas.booking_schema import BookingSchema
from app.services.booking_service import BookingService
from app.services.upload_service import UploadService
from app.services.pdf_service import PDFService


def _success(data=None, message="Success") -> dict:
    return {"success": True, "message": message, "data": data}


def _error(message="Error", code=400):
    raise HTTPException(status_code=code, detail=message)


class BookingController:

    @staticmethod
    async def get_all(page: int, per_page: int, status: Optional[str],
                      search: Optional[str], db: AsyncSession) -> dict:

        svc = BookingService(db)
        result = await svc.get_bookings_paginated(
            page=page, per_page=per_page, status=status, search=search
        )
        return _success(data=result, message="Daftar booking berhasil diambil.")

    @staticmethod
    async def get_my_bookings(page: int, per_page: int, status: Optional[str],
                              search: Optional[str], current_user: dict,
                              db: AsyncSession) -> dict:

        username = current_user.get("username")
        result_user = await db.execute(select(User).filter(
            (User.nama == username) | (func.lower(User.email) == func.lower(username))
        ))
        user = result_user.scalars().first()
        if not user:
            _error("User tidak ditemukan.", 404)

        svc = BookingService(db)
        result = await svc.get_bookings_paginated(
            page=page, per_page=per_page, status=status,
            search=search, user_id=user.id_user
        )
        return _success(data=result, message="Daftar booking Anda.")

    @staticmethod
    async def verify_code(code: str, db: AsyncSession) -> dict:

        code_upper = code.strip().upper()
        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_epass == code_upper)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Kode booking tidak ditemukan.", 404)
        return _success(data=booking.to_dict(), message="Booking ditemukan.")

    @staticmethod
    async def get_by_id(id: int, db: AsyncSession) -> dict:

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)
        return _success(data=booking.to_dict(), message="Detail booking.")

    @staticmethod
    async def get_dashboard_stats(user_id: Optional[int], db: AsyncSession) -> dict:

        svc = BookingService(db)
        result = await svc.get_dashboard_stats(user_id=user_id)
        return _success(data=result, message="Statistik dashboard.")

    @staticmethod
    async def get_reports_stats(period: str, db: AsyncSession) -> dict:

        svc = BookingService(db)
        result = await svc.get_reports_stats(period=period)
        return _success(data=result, message="Statistik laporan berhasil diambil.")

    @staticmethod
    async def get_calendar_events(year: int, month: int, db: AsyncSession) -> dict:

        first_day = datetime(year, month, 1)
        last_day = datetime(year, month, monthrange(year, month)[1], 23, 59, 59)

        result = await db.execute(
            select(Peminjaman).filter(
                Peminjaman.waktu_mulai >= first_day,
                Peminjaman.waktu_mulai <= last_day,
                Peminjaman.status != "Draft",
            ).order_by(Peminjaman.waktu_mulai.asc())
        )
        bookings = result.scalars().all()
        return _success(data=[b.to_dict() for b in bookings], message="Data kalender berhasil diambil.")

    @staticmethod
    async def get_room_bookings(room_id: int, date: str, db: AsyncSession) -> dict:

        svc = BookingService(db)
        result, err = await svc.get_room_availability(room_id, date)
        if err:
            _error(err, 400)
        return _success(data=result, message="Data ketersediaan ruangan.")

    @staticmethod
    async def get_user_bookings(user_id: int, page: int, per_page: int,
                                status: Optional[str], search: Optional[str],
                                db: AsyncSession) -> dict:

        svc = BookingService(db)
        result = await svc.get_bookings_paginated(
            page=page, per_page=per_page, status=status,
            search=search, user_id=user_id
        )
        return _success(data=result, message="Daftar booking user.")

    @staticmethod
    async def get_epass(id: int, db: AsyncSession) -> dict:

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        epass_data = booking.to_dict()
        epass_data["is_valid"] = booking.status == "Approved"
        return _success(data=epass_data, message="Data E-Pass.")





    @staticmethod
    async def create(data: BookingSchema, db: AsyncSession) -> dict:

        raw_data = data.model_dump()
        svc = BookingService(db)
        ok, result = await svc.create_booking(raw_data)
        if not ok:
            _error(result, 400)
        return _success(data=result.to_dict(), message="Booking berhasil dibuat.")

    @staticmethod
    async def update(id: int, data: BookingSchema, db: AsyncSession) -> dict:

        from datetime import date as date_type
        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        if booking.status not in ["Pending", "Draft"]:
            _error("Hanya booking Pending atau Draft yang bisa diubah.", 400)

        raw_data = data.model_dump(exclude_unset=True)

        if "date" in raw_data or "start_time" in raw_data or "end_time" in raw_data:
            date_val = raw_data.get("date") or booking.waktu_mulai.date()
            start_time = raw_data.get("start_time") or booking.waktu_mulai.strftime("%H:%M")
            end_time = raw_data.get("end_time") or booking.waktu_selesai.strftime("%H:%M")

            date_str = (
                date_val.strftime("%Y-%m-%d")
                if isinstance(date_val, (date_type, datetime))
                else str(date_val)
            )
            booking.waktu_mulai = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
            booking.waktu_selesai = datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")

        if "keperluan" in raw_data:
            booking.keperluan = raw_data["keperluan"]
        elif "activity_name" in raw_data:
            booking.keperluan = raw_data["activity_name"]

        if "path_file_bukti" in raw_data:
            booking.path_file_bukti = raw_data["path_file_bukti"]
        elif "surat_file" in raw_data:
            booking.path_file_bukti = raw_data["surat_file"]

        await db.commit()
        await db.refresh(booking)
        return _success(data=booking.to_dict(), message="Booking berhasil diupdate.")

    @staticmethod
    async def delete(id: int, db: AsyncSession) -> dict:

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        upload_svc = UploadService()
        if booking.path_file_bukti:
            upload_svc.delete_uploaded_file(booking.path_file_bukti)
        if booking.qr_code:
            upload_svc.delete_uploaded_file(booking.qr_code)

        await db.delete(booking)
        await db.commit()
        return _success(message="Booking berhasil dihapus.")

    @staticmethod
    async def approve(id: int, notes: Optional[str], db: AsyncSession) -> dict:

        svc = BookingService(db)
        ok, result = await svc.approve_booking(id, notes=notes)
        if not ok:
            _error(result, 400)
        return _success(data=result.to_dict(), message="Booking berhasil di-approve. QR Code telah dibuat.")

    @staticmethod
    async def reject(id: int, notes: Optional[str], db: AsyncSession) -> dict:

        svc = BookingService(db)
        ok, result = await svc.reject_booking(id, notes=notes)
        if not ok:
            _error(result, 400)
        return _success(data=result.to_dict(), message="Booking berhasil di-reject.")

    @staticmethod
    async def update_status(id: int, new_status: str, db: AsyncSession) -> dict:

        VALID_STATUSES = {"Approved", "Rejected", "Cancelled", "Completed"}
        if new_status not in VALID_STATUSES:
            _error("Status tidak valid.", 400)

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        booking.status = new_status
        await db.commit()
        return _success(data=booking.to_dict(), message=f"Status diubah menjadi {new_status}.")

    @staticmethod
    async def check_in(booking_code: str, db: AsyncSession) -> dict:

        code = booking_code.strip().upper()
        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_epass == code)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Kode booking tidak ditemukan.", 404)

        if booking.status == "CheckedIn":
            _error("Booking sudah di-check-in sebelumnya.", 400)
        if booking.status in ["Completed", "Expired"]:
            _error("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
        if booking.status != "Approved":
            _error(f"Check-in tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

        booking.status = "CheckedIn"
        await db.commit()
        return _success(data=booking.to_dict(), message="Check-in berhasil! Kunci dapat diserahkan.")

    @staticmethod
    async def check_out(booking_code: str, db: AsyncSession) -> dict:

        code = booking_code.strip().upper()
        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_epass == code)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Kode booking tidak ditemukan.", 404)

        if booking.status in ["Completed", "Expired"]:
            _error("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
        if booking.status != "CheckedIn":
            _error(f"Check-out tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

        booking.status = "Completed"
        await db.commit()
        return _success(data=booking.to_dict(), message="Check-out berhasil! Kunci telah dikembalikan.")

    @staticmethod
    async def upload_document(id: int, file: UploadFile, db: AsyncSession) -> dict:

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        upload_svc = UploadService()
        ok, filepath = upload_svc.save_uploaded_file(file)
        if not ok:
            _error(filepath, 400)

        booking.path_file_bukti = filepath
        await db.commit()
        return _success(
            data={"surat_file": filepath, "booking": booking.to_dict()},
            message="Dokumen berhasil diupload."
        )

    @staticmethod
    async def download_pdf(id: int, db: AsyncSession) -> StreamingResponse:

        result = await db.execute(
            select(Peminjaman).filter(Peminjaman.id_booking == id)
        )
        booking = result.scalars().first()
        if not booking:
            _error("Booking tidak ditemukan.", 404)

        pdf_svc = PDFService()
        pdf_buffer = pdf_svc.generate_epass_pdf(booking)
        filename = f"epass_{booking.id_epass or booking.id_booking}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )