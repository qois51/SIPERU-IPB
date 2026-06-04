import sys
import os
import asyncio


sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
from sqlalchemy import text
import app.models

async def reset_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Dropping all existing tables...")

        await conn.execute(text("DROP TABLE IF EXISTS booking_facilities, bookings, rooms, users, help_requests CASCADE;"))
        await conn.execute(text('DROP TABLE IF EXISTS peminjaman, ruangan, pic_ruangan, penjaga_ruangan, mahasiswa, "user", help_request CASCADE;'))
        

        await conn.run_sync(Base.metadata.drop_all)
        

        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("Database reset completed successfully!")

if __name__ == "__main__":
    asyncio.run(reset_db())