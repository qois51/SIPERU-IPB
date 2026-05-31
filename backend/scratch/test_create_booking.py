import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, get_db
from sqlalchemy.ext.asyncio import async_sessionmaker
from app.services import booking_service

async def test():
    # Use the session maker directly
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    # Let's try to create a booking for room_id=1, user_id=1 on 2026-05-28
    payload = {
        "room_id": 1,
        "user_id": 1,
        "nama_peminjam": "Test Peminjam",
        "nim_nip": "G6412345",
        "program_studi": "Ilmu Komputer",
        "email": "test@apps.ipb.ac.id",
        "nomor_hp": "08123456789",
        "activity_name": "Test Acara",
        "jenis_kegiatan": "Akademik",
        "organization": "Himpunan Mahasiswa",
        "participants": 10,
        "purpose": "Rapat Internal",
        "deskripsi_kegiatan": "Membahas proker tahunan",
        "date": "2026-05-28", # Send as string (pydantic will parse it, but create_booking wants date object or handles it?)
        "start_time": "09:00",
        "end_time": "11:00",
        "status": "Pending",
        "facilities": ["Proyektor"]
    }
    
    async with async_session() as db:
        try:
            print("Trying to create booking...")
            ok, result = await booking_service.create_booking(db, payload)
            print("Status OK:", ok)
            if not ok:
                print("Error message:", result)
            else:
                print("Created booking with ID:", result.id)
                print("Booking data dict:", result.to_dict())
        except Exception as e:
            print("Exception raised during creation:")
            import traceback
            traceback.print_exc()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
