from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from app.models.user_model import User
from app.schemas.user_schema import UserSchema
from typing import List, Optional
from pydantic import BaseModel, EmailStr

user_router = APIRouter()

class UserCreate(UserSchema):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    nim_nip: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image: Optional[str] = None

@user_router.get('/', response_model=List[UserSchema])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@user_router.get('/{id}', response_model=UserSchema)
async def get_user(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter_by(id=id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@user_router.post('/', response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username exists
    result = await db.execute(select(User).filter_by(username=data.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        username=data.username,
        role=data.role,
        full_name=data.full_name,
        nim_nip=data.nim_nip,
        email=data.email,
        profile_image=data.profile_image
    )
    new_user.set_password(data.password)
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@user_router.put('/{id}', response_model=UserSchema)
async def update_user(id: int, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter_by(id=id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.username and data.username != user.username:
        check_result = await db.execute(select(User).filter_by(username=data.username))
        if check_result.scalars().first():
            raise HTTPException(status_code=400, detail="Username already exists")
        user.username = data.username

    if data.password:
        user.set_password(data.password)

    if data.role is not None:
        user.role = data.role
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.nim_nip is not None:
        user.nim_nip = data.nim_nip
    if data.email is not None:
        user.email = data.email
    if data.profile_image is not None:
        user.profile_image = data.profile_image

    await db.commit()
    await db.refresh(user)
    return user

@user_router.delete('/{id}')
async def delete_user(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter_by(id=id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}
