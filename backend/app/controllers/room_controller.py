"""
RoomController — Business logic untuk manajemen ruangan.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.models.room_model import Ruangan as Room
from app.models.user_model import PICRuangan
from app.schemas.room_schema import RoomSchema


class RoomController:
    """Handles all room-related CRUD logic."""

    @staticmethod
    async def get_all(db: AsyncSession) -> list:
        """Return all rooms."""
        result = await db.execute(select(Room))
        rooms = result.scalars().all()
        return [room.to_dict() for room in rooms]

    @staticmethod
    async def get_by_id(id: int, db: AsyncSession) -> dict:
        """Return a single room by its ID."""
        result = await db.execute(select(Room).filter(Room.id_ruangan == id))
        room = result.scalars().first()
        if not room:
            raise HTTPException(status_code=404, detail="Room tidak ditemukan")
        return room.to_dict()

    @staticmethod
    async def _resolve_pic_id(data: RoomSchema, db: AsyncSession) -> int:
        """Resolve PIC ID from data or fallback to lookup by email/name."""
        id_pic = data.id_pic
        if id_pic:
            return id_pic

        # Try to find PIC by email or name
        pic_email = data.pic_email or ""
        pic_name = data.pic_name or ""
        if pic_email or pic_name:
            filters = []
            if pic_email:
                filters.append(PICRuangan.email == pic_email)
            if pic_name:
                filters.append(PICRuangan.nama == pic_name)
            from sqlalchemy import or_
            pic_res = await db.execute(select(PICRuangan).filter(or_(*filters)))
            pic = pic_res.scalars().first()
            if pic:
                return pic.id_user

        # Fallback: use first available PIC
        pic_res = await db.execute(select(PICRuangan))
        pic = pic_res.scalars().first()
        if not pic:
            raise HTTPException(
                status_code=400,
                detail="PIC Ruangan tidak ditemukan di sistem."
            )
        return pic.id_user

    @staticmethod
    async def create(data: RoomSchema, db: AsyncSession) -> dict:
        """Create a new room."""
        id_pic = await RoomController._resolve_pic_id(data, db)

        # Resolve display name
        nama_ruangan = data.nama_ruangan or data.name
        if not nama_ruangan:
            raise HTTPException(status_code=422, detail="nama_ruangan atau name wajib diisi.")

        kapasitas = data.kapasitas if data.kapasitas is not None else data.capacity
        fasilitas = data.fasilitas or data.facilities or ""
        biaya = data.biaya_peminjaman if data.biaya_peminjaman is not None else (data.price or 0)

        new_room = Room(
            nama_ruangan=nama_ruangan,
            kapasitas=kapasitas,
            fasilitas=fasilitas,
            biaya_peminjaman=biaya,
            id_pic=id_pic,
            location=data.location,
            operational_hours=data.operational_hours,
            image_url=data.image_url,
            pic_image_url=data.pic_image_url,
        )
        db.add(new_room)
        await db.commit()
        await db.refresh(new_room)
        return new_room.to_dict()

    @staticmethod
    async def update(id: int, data: RoomSchema, db: AsyncSession) -> dict:
        """Update an existing room."""
        result = await db.execute(select(Room).filter(Room.id_ruangan == id))
        room = result.scalars().first()
        if not room:
            raise HTTPException(status_code=404, detail="Room tidak ditemukan")

        # Resolve PIC if provided
        if data.id_pic or data.pic_email or data.pic_name:
            resolved_pic = await RoomController._resolve_pic_id(data, db)
            room.id_pic = resolved_pic

        room.nama_ruangan = data.nama_ruangan or data.name or room.nama_ruangan
        if data.kapasitas is not None:
            room.kapasitas = data.kapasitas
        elif data.capacity is not None:
            room.kapasitas = data.capacity

        room.fasilitas = data.fasilitas or data.facilities or room.fasilitas

        if data.biaya_peminjaman is not None:
            room.biaya_peminjaman = data.biaya_peminjaman
        elif data.price is not None:
            room.biaya_peminjaman = data.price

        if data.location is not None:
            room.location = data.location
        if data.operational_hours is not None:
            room.operational_hours = data.operational_hours
        if data.image_url is not None:
            room.image_url = data.image_url
        if data.pic_image_url is not None:
            room.pic_image_url = data.pic_image_url

        await db.commit()
        await db.refresh(room)
        return room.to_dict()

    @staticmethod
    async def delete(id: int, db: AsyncSession) -> dict:
        """Delete a room."""
        result = await db.execute(select(Room).filter(Room.id_ruangan == id))
        room = result.scalars().first()
        if not room:
            raise HTTPException(status_code=404, detail="Room tidak ditemukan")

        await db.delete(room)
        await db.commit()
        return {"message": "Room berhasil dihapus"}
