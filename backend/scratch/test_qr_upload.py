import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.future import select
from app.models.booking_model import Booking
from app.services import qr_service

async def test_qr():
    print("=== QR CODE SUPABASE UPLOAD TEST ===")
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as db:
        try:
            # Let's query an existing booking (e.g. Booking ID 13)
            result = await db.execute(select(Booking).filter_by(id=13))
            booking = result.scalars().first()
            
            if not booking:
                print("Booking ID 13 not found in database. Trying to get first booking...")
                result = await db.execute(select(Booking).limit(1))
                booking = result.scalars().first()
                
            if not booking:
                print("Error: No bookings found in database to test.")
                return
                
            print(f"Loaded Booking: ID {booking.id}, Code {booking.booking_code}, Room {booking.room_id}")
            
            # Make sure booking has a code to construct filename
            if not booking.booking_code:
                booking.booking_code = "BK-2026-TEST"
                
            print("Generating and uploading QR code...")
            qr_path = qr_service.generate_qr_for_booking(booking)
            
            print("Resulting QR path/URL:", qr_path)
            if qr_path and qr_path.startswith("http"):
                print("SUCCESS: QR Code successfully uploaded to Supabase Storage!")
            else:
                print("WARNING: Saved locally (or failed). Check console outputs.")
                
        except Exception as e:
            print("Exception raised:")
            import traceback
            traceback.print_exc()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_qr())
