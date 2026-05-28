from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from app.models.booking_model import Booking
from app.models.user_model import User
from app.schemas.booking_schema import BookingSchema
from app.services import booking_service
from app.services.upload_service import save_uploaded_file, delete_uploaded_file
from app.services.pdf_service import generate_epass_pdf
from app.utils.auth_middleware import get_current_user, role_required
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

booking_router = APIRouter()

class CodeRequest(BaseModel):
    booking_code: str

class NotesRequest(BaseModel):
    notes: Optional[str] = None

class StatusRequest(BaseModel):
    status: str

def success_response(data=None, message="Success"):
    return {"success": True, "message": message, "data": data}

def error_response(message="Error", status_code=400):
    raise HTTPException(status_code=status_code, detail=message)

@booking_router.get('/')
async def get_all_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await booking_service.get_bookings_paginated(
        db, page=page, per_page=per_page, status=status, search=search
    )
    return success_response(data=result, message="Daftar booking berhasil diambil.")

@booking_router.get('/my-bookings')
async def get_my_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    username = current_user.get("username")
    result_user = await db.execute(select(User).filter_by(username=username))
    user = result_user.scalars().first()
    if not user:
        return error_response("User tidak ditemukan.", 404)

    result = await booking_service.get_bookings_paginated(
        db, page=page, per_page=per_page, status=status, search=search, user_id=user.id
    )
    return success_response(data=result, message="Daftar booking Anda.")

@booking_router.get('/verify-code')
async def verify_booking_code(
    code: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    code_upper = code.strip().upper()
    result = await db.execute(select(Booking).filter_by(booking_code=code_upper))
    booking = result.scalars().first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)
    return success_response(data=booking.to_dict(), message="Booking ditemukan.")

@booking_router.post('/check-in')
async def check_in_booking(data: CodeRequest, db: AsyncSession = Depends(get_db)):
    code = data.booking_code.strip().upper()
    result = await db.execute(select(Booking).filter_by(booking_code=code))
    booking = result.scalars().first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)

    if booking.status == 'CheckedIn':
        return error_response("Booking sudah di-check-in sebelumnya.", 400)
    if booking.status in ['Completed', 'Expired']:
        return error_response("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
    if booking.status != 'Approved':
        return error_response(f"Check-in tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

    booking.status = 'CheckedIn'
    booking.checked_in_at = datetime.utcnow()
    await db.commit()

    return success_response(data=booking.to_dict(), message="Check-in berhasil! Kunci dapat diserahkan.")

@booking_router.post('/check-out')
async def check_out_booking(data: CodeRequest, db: AsyncSession = Depends(get_db)):
    code = data.booking_code.strip().upper()
    result = await db.execute(select(Booking).filter_by(booking_code=code))
    booking = result.scalars().first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)

    if booking.status in ['Completed', 'Expired']:
        return error_response("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
    if booking.status != 'CheckedIn':
        return error_response(f"Check-out tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

    now = datetime.utcnow()
    booking.status = 'Completed'
    booking.checked_out_at = now
    booking.expired_at = now
    await db.commit()

    return success_response(data=booking.to_dict(), message="Check-out berhasil! Kunci telah dikembalikan. E-Pass expired.")

@booking_router.get('/reports/stats')
async def get_reports_stats(
    period: str = Query('1month'),
    current_user: dict = Depends(role_required(['admin', 'karyawan'])),
    db: AsyncSession = Depends(get_db)
):
    result = await booking_service.get_reports_stats(db, period=period)
    return success_response(data=result, message="Statistik laporan berhasil diambil.")

@booking_router.get('/{id}')
async def get_booking(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)
    return success_response(data=booking.to_dict(), message="Detail booking.")

@booking_router.post('/', status_code=status.HTTP_201_CREATED)
async def create_booking(data: BookingSchema, db: AsyncSession = Depends(get_db)):
    # Convert Pydantic to Dict
    raw_data = data.model_dump()
    ok, result = await booking_service.create_booking(db, raw_data)
    if not ok:
        return error_response(result, 400)

    return success_response(data=result.to_dict(), message="Booking berhasil dibuat.")

@booking_router.put('/{id}')
async def update_booking(id: int, data: BookingSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    if booking.status not in ['Pending', 'Draft']:
        return error_response("Hanya booking Pending atau Draft yang bisa diubah.", 400)

    raw_data = data.model_dump(exclude_unset=True)
    for key, value in raw_data.items():
        if key != 'facilities':
            setattr(booking, key, value)

    await db.commit()
    await db.refresh(booking)
    return success_response(data=booking.to_dict(), message="Booking berhasil diupdate.")

@booking_router.delete('/{id}')
async def delete_booking(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    # Clean up uploaded supporting document and QR code
    if booking.surat_file:
        delete_uploaded_file(booking.surat_file)
    if booking.qr_code:
        delete_uploaded_file(booking.qr_code)

    await db.delete(booking)
    await db.commit()
    return success_response(message="Booking berhasil dihapus.")

@booking_router.get('/room/{room_id}')
async def get_room_bookings(room_id: int, date: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    result, err = await booking_service.get_room_availability(db, room_id, date)
    if err:
        return error_response(err, 400)
    return success_response(data=result, message="Data ketersediaan ruangan.")

@booking_router.get('/user/{user_id}')
async def get_user_bookings(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await booking_service.get_bookings_paginated(
        db, page=page, per_page=per_page, status=status, search=search, user_id=user_id
    )
    return success_response(data=result, message="Daftar booking user.")

@booking_router.put('/{id}/approve')
async def approve_booking(id: int, data: NotesRequest, db: AsyncSession = Depends(get_db)):
    ok, result = await booking_service.approve_booking(db, id, notes=data.notes)
    if not ok:
        return error_response(result, 400)
    return success_response(data=result.to_dict(), message="Booking berhasil di-approve. QR Code telah dibuat.")

@booking_router.put('/{id}/reject')
async def reject_booking(id: int, data: NotesRequest, db: AsyncSession = Depends(get_db)):
    ok, result = await booking_service.reject_booking(db, id, notes=data.notes)
    if not ok:
        return error_response(result, 400)
    return success_response(data=result.to_dict(), message="Booking berhasil di-reject.")

@booking_router.patch('/{id}/status')
async def update_status(id: int, data: StatusRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    new_status = data.status
    if new_status not in ['Approved', 'Rejected', 'Cancelled', 'Completed']:
        return error_response("Status tidak valid.", 400)

    booking.status = new_status
    await db.commit()
    return success_response(data=booking.to_dict(), message=f"Status diubah menjadi {new_status}.")

@booking_router.post('/{id}/upload-document')
async def upload_document(id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    ok, filepath = save_uploaded_file(file)
    if not ok:
        return error_response(filepath, 400)

    booking.surat_file = filepath
    await db.commit()

    return success_response(
        data={"surat_file": filepath, "booking": booking.to_dict()},
        message="Dokumen berhasil diupload."
    )

@booking_router.get('/{id}/epass')
async def get_epass(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    epass_data = booking.to_dict()
    epass_data['is_valid'] = booking.status == 'Approved'
    return success_response(data=epass_data, message="Data E-Pass.")

@booking_router.get('/{id}/download-pdf')
async def download_pdf(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booking).filter_by(id=id))
    booking = result.scalars().first()
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    pdf_buffer = generate_epass_pdf(booking)
    filename = f"epass_{booking.booking_code}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@booking_router.get('/dashboard/stats')
async def get_dashboard_stats(user_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db)):
    result = await booking_service.get_dashboard_stats(db, user_id=user_id)
    return success_response(data=result, message="Statistik dashboard.")
