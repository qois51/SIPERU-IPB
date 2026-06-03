"""
user_routes.py — Thin wrapper; logic ada di UserController.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from app.schemas.user_schema import UserSchema
from app.utils.auth_middleware import get_current_user, role_required
from app.controllers.user_controller import UserController, UserCreate, UserUpdate

user_router = APIRouter()


@user_router.get("/", response_model=List[UserSchema])
async def get_users(
    current_user: dict = Depends(role_required(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    return await UserController.get_all(db)


@user_router.get("/{id}", response_model=UserSchema)
async def get_user(
    id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserController.get_by_id(id, current_user, db)


@user_router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    current_user: dict = Depends(role_required(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    return await UserController.create(data, db)


@user_router.put("/{id}", response_model=UserSchema)
async def update_user(
    id: int,
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await UserController.update(id, data, current_user, db)


@user_router.delete("/{id}")
async def delete_user(
    id: int,
    current_user: dict = Depends(role_required(["admin"])),
    db: AsyncSession = Depends(get_db),
):
    return await UserController.delete(id, db)
