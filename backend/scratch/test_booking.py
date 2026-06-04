import asyncio
import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import AsyncSessionLocal, engine
from sqlalchemy.future import select
from app.models.user_model import Mahasiswa
from app.models.room_model import Ruangan
from app.services.booking_service import BookingService

async def test_booking():
    async with AsyncSessionLocal() as db:

        m_result = await db.execute(select(Mahasiswa))
        mahasiswa = m_result.scalars().first()
        if not mahasiswa:
            print("No Mahasiswa found in database! Please run seeder first.")
            return

        print(f"Found Mahasiswa: {mahasiswa.nama} (ID: {mahasiswa.id_user})")


        r_result = await db.execute(select(Ruangan))
        room = r_result.scalars().first()
        if not room:
            print("No Ruangan found in database! Please run seeder first.")
            return

        print(f"Found Ruangan: {room.nama_ruangan} (ID: {room.id_ruangan})")


        svc = BookingService(db)
        booking_data = {
            "room_id": room.id_ruangan,
            "user_id": mahasiswa.id_user,
            "activity_name": "Test Peminjaman Baru",
            "date": "2026-06-10",
            "start_time": "09:00",
            "end_time": "11:00",
            "surat_file": "dummy_path.pdf",
            "facilities": ["AC", "Sound System"]
        }
        
        print("Creating booking with payload:", booking_data)
        ok, res = await svc.create_booking(booking_data)
        if ok:
            print(f"SUCCESS: Booking created with ID {res.id_booking}, code {res.id_epass}")
        else:
            print("FAILED:", res)

if __name__ == "__main__":
    asyncio.run(test_booking())