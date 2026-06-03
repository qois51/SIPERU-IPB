"""
help_routes.py — Thin wrapper; logic ada di HelpController.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from app.schemas.help_schema import HelpRequestCreate, HelpRequestOut, HelpRequestReply
from app.utils.auth_middleware import get_current_user
from app.controllers.help_controller import HelpController

help_router = APIRouter()


@help_router.post("/", response_model=dict)
async def submit_help_request(
    data: HelpRequestCreate, db: AsyncSession = Depends(get_db)
):
    return await HelpController.submit(data, db)


@help_router.get("/", response_model=List[HelpRequestOut])
async def get_all_help_requests(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Akses ditolak")
    return await HelpController.get_all(db)


@help_router.post("/{id}/reply", response_model=dict)
async def reply_help_request(
    id: int,
    data: HelpRequestReply,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Akses ditolak")
    return await HelpController.reply(id, data, db)
