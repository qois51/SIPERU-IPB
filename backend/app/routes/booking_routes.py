
from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from database import get_db
from app.schemas.booking_schema import BookingSchema
from app.utils.auth_middleware import get_current_user, role_required
from app.controllers.booking_controller import BookingController

booking_router = APIRouter()


class CodeRequest(BaseModel):
    booking_code: str


class NotesRequest(BaseModel):
    notes: Optional[str] = None


class StatusRequest(BaseModel):
    status: str






@booking_router.get("/my-bookings")
async def get_my_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_my_bookings(
        page, per_page, status, search, current_user, db
    )


@booking_router.get("/verify-code")
async def verify_booking_code(
    code: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.verify_code(code, db)


@booking_router.post("/check-in")
async def check_in(data: CodeRequest, db: AsyncSession = Depends(get_db)):
    return await BookingController.check_in(data.booking_code, db)


@booking_router.post("/check-out")
async def check_out(data: CodeRequest, db: AsyncSession = Depends(get_db)):
    return await BookingController.check_out(data.booking_code, db)


@booking_router.get("/dashboard/stats")
async def get_dashboard_stats(
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_dashboard_stats(user_id, db)


@booking_router.get("/reports/stats")
async def get_reports_stats(
    period: str = Query("1month"),
    current_user: dict = Depends(role_required(["admin", "dosen", "pic"])),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_reports_stats(period, db)


@booking_router.get("/calendar/events")
async def get_calendar_events(
    year: int = Query(...),
    month: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_calendar_events(year, month, db)


@booking_router.get("/room/{room_id}")
async def get_room_bookings(
    room_id: int,
    date: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_room_bookings(room_id, date, db)


@booking_router.get("/user/{user_id}")
async def get_user_bookings(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_user_bookings(
        user_id, page, per_page, status, search, db
    )






@booking_router.get("/")
async def get_all_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.get_all(page, per_page, status, search, db)


@booking_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_booking(data: BookingSchema, db: AsyncSession = Depends(get_db)):
    return await BookingController.create(data, db)






@booking_router.get("/{id}")
async def get_booking(id: int, db: AsyncSession = Depends(get_db)):
    return await BookingController.get_by_id(id, db)


@booking_router.put("/{id}")
async def update_booking(
    id: int, data: BookingSchema, db: AsyncSession = Depends(get_db)
):
    return await BookingController.update(id, data, db)


@booking_router.delete("/{id}")
async def delete_booking(id: int, db: AsyncSession = Depends(get_db)):
    return await BookingController.delete(id, db)


@booking_router.put("/{id}/approve")
async def approve_booking(
    id: int, data: NotesRequest, db: AsyncSession = Depends(get_db)
):
    return await BookingController.approve(id, data.notes, db)


@booking_router.put("/{id}/reject")
async def reject_booking(
    id: int, data: NotesRequest, db: AsyncSession = Depends(get_db)
):
    return await BookingController.reject(id, data.notes, db)


@booking_router.patch("/{id}/status")
async def update_status(
    id: int, data: StatusRequest, db: AsyncSession = Depends(get_db)
):
    return await BookingController.update_status(id, data.status, db)


@booking_router.post("/{id}/upload-document")
async def upload_document(
    id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    return await BookingController.upload_document(id, file, db)


@booking_router.get("/{id}/epass")
async def get_epass(id: int, db: AsyncSession = Depends(get_db)):
    return await BookingController.get_epass(id, db)


@booking_router.get("/{id}/download-pdf")
async def download_pdf(id: int, db: AsyncSession = Depends(get_db)):
    return await BookingController.download_pdf(id, db)