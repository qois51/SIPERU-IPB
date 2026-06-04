
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.help_model import HelpRequest
from app.schemas.help_schema import HelpRequestCreate, HelpRequestReply
from app.utils.email_service import send_help_reply_email


class HelpController:

    @staticmethod
    async def submit(data: HelpRequestCreate, db: AsyncSession) -> dict:

        try:
            new_request = HelpRequest(
                nama=data.nama.strip(),
                email=data.email.strip(),
                pesan=data.pesan.strip(),
            )
            db.add(new_request)
            await db.commit()
            return {"message": "Pengajuan berhasil dikirim! Admin akan membalas melalui email Anda."}
        except Exception:
            await db.rollback()
            raise HTTPException(status_code=500, detail="Gagal mengirim pengajuan.")

    @staticmethod
    async def get_all(db: AsyncSession) -> list:

        result = await db.execute(
            select(HelpRequest).order_by(HelpRequest.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def reply(id: int, data: HelpRequestReply, db: AsyncSession) -> dict:

        result = await db.execute(
            select(HelpRequest).filter(HelpRequest.id == id)
        )
        request_obj = result.scalars().first()
        if not request_obj:
            raise HTTPException(status_code=404, detail="Request tidak ditemukan")

        reply_msg = data.reply_message.strip()
        if not reply_msg:
            raise HTTPException(status_code=400, detail="Pesan balasan tidak boleh kosong")

        request_obj.reply = reply_msg
        request_obj.status = "Replied"

        email_sent = send_help_reply_email(
            to_email=request_obj.email,
            name=request_obj.nama,
            original_message=request_obj.pesan,
            reply_message=reply_msg,
        )

        await db.commit()

        if not email_sent:
            return {
                "message": "Balasan tersimpan di database, tetapi gagal mengirim email. "
                           "Pastikan kredensial SMTP valid."
            }
        return {"message": "Balasan berhasil dikirim melalui email!"}