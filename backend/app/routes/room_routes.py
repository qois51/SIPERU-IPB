from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from app.models.room_model import Room
from app.schemas.room_schema import RoomSchema
from app.utils.auth_middleware import role_required
from typing import List, Optional

room_router = APIRouter()

@room_router.get('/')
async def get_rooms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room))
    rooms = result.scalars().all()
    return [room.to_dict() for room in rooms]

@room_router.get('/{id}')
async def get_room(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).filter_by(id=id))
    room = result.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room.to_dict()

@room_router.post('/', status_code=status.HTTP_201_CREATED)
async def create_room(
    data: RoomSchema, 
    current_user: dict = Depends(role_required(['admin', 'dosen', 'pic'])), 
    db: AsyncSession = Depends(get_db)
):
    new_room = Room(
        name=data.name,
        location=data.location,
        capacity=data.capacity,
        operational_hours=data.operational_hours,
        facilities=data.facilities,
        pic_name=data.pic_name,
        pic_email=data.pic_email,
        pic_phone=data.pic_phone,
        price=data.price,
        image_url=data.image_url,
        pic_image_url=data.pic_image_url
    )
    db.add(new_room)
    await db.commit()
    await db.refresh(new_room)
    return new_room.to_dict()

@room_router.put('/{id}')
async def update_room(
    id: int, 
    data: RoomSchema, 
    current_user: dict = Depends(role_required(['admin', 'dosen', 'pic'])), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Room).filter_by(id=id))
    room = result.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.name = data.name
    room.location = data.location
    room.capacity = data.capacity
    room.operational_hours = data.operational_hours
    room.facilities = data.facilities
    room.pic_name = data.pic_name
    room.pic_email = data.pic_email
    room.pic_phone = data.pic_phone
    room.price = data.price
    room.image_url = data.image_url
    room.pic_image_url = data.pic_image_url

    await db.commit()
    await db.refresh(room)
    return room.to_dict()

@room_router.delete('/{id}')
async def delete_room(
    id: int, 
    current_user: dict = Depends(role_required(['admin', 'dosen', 'pic'])), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Room).filter_by(id=id))
    room = result.scalars().first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    await db.delete(room)
    await db.commit()
    return {"message": "Room deleted"}
