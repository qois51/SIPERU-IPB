from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from app.schemas.help_schema import HelpRequestCreate, HelpRequestOut, HelpRequestReply
from app.models.user_model import User
from app.models.help_model import HelpRequest
from app.utils.auth_middleware import get_current_user
from app.utils.email_service import send_help_reply_email
from typing import List

help_router = APIRouter()

@help_router.post('/', response_model=dict)
async def submit_help_request(data: HelpRequestCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_request = HelpRequest(
            nama=data.nama.strip(),
            email=data.email.strip(),
            pesan=data.pesan.strip()
        )
        db.add(new_request)
        await db.commit()
        return {"message": "Pengajuan berhasil dikirim! Admin akan membalas melalui email Anda."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Gagal mengirim pengajuan.")

@help_router.get('/', response_model=List[HelpRequestOut])
async def get_all_help_requests(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")
        
    result = await db.execute(select(HelpRequest).order_by(HelpRequest.created_at.desc()))
    return result.scalars().all()

@help_router.post('/{id}/reply', response_model=dict)
async def reply_help_request(id: int, data: HelpRequestReply, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")
        
    result = await db.execute(select(HelpRequest).filter(HelpRequest.id == id))
    request_obj = result.scalars().first()
    
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request tidak ditemukan")
        
    reply_msg = data.reply_message.strip()
    if not reply_msg:
        raise HTTPException(status_code=400, detail="Pesan balasan tidak boleh kosong")
        
    request_obj.reply = reply_msg
    request_obj.status = "Replied"
    
    # Send email
    email_sent = send_help_reply_email(
        to_email=request_obj.email,
        name=request_obj.nama,
        original_message=request_obj.pesan,
        reply_message=reply_msg
    )
    
    await db.commit()
    
    if not email_sent:
        return {"message": "Balasan tersimpan di database, tetapi gagal mengirim email ke pengguna. Pastikan kredensial SMTP valid."}
        
    return {"message": "Balasan berhasil dikirim melalui email!"}
