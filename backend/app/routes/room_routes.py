
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from app.schemas.room_schema import RoomSchema
from app.utils.auth_middleware import role_required
from app.controllers.room_controller import RoomController

room_router = APIRouter()


@room_router.get("/")
async def get_rooms(db: AsyncSession = Depends(get_db)):
    return await RoomController.get_all(db)


@room_router.get("/{id}")
async def get_room(id: int, db: AsyncSession = Depends(get_db)):
    return await RoomController.get_by_id(id, db)


@room_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_room(
    data: RoomSchema,
    current_user: dict = Depends(role_required(["admin", "dosen", "pic"])),
    db: AsyncSession = Depends(get_db),
):
    return await RoomController.create(data, db)


@room_router.put("/{id}")
async def update_room(
    id: int,
    data: RoomSchema,
    current_user: dict = Depends(role_required(["admin", "dosen", "pic"])),
    db: AsyncSession = Depends(get_db),
):
    return await RoomController.update(id, data, db)


@room_router.delete("/{id}")
async def delete_room(
    id: int,
    current_user: dict = Depends(role_required(["admin", "dosen", "pic"])),
    db: AsyncSession = Depends(get_db),
):
    return await RoomController.delete(id, db)