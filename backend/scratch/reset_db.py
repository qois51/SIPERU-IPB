import sys
import os
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
from sqlalchemy import text
import app.models # Evaluates and registers all new models on Base

async def reset_db():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Dropping all existing tables...")
        # Execute each DROP TABLE statement separately
        await conn.execute(text("DROP TABLE IF EXISTS booking_facilities, bookings, rooms, users, help_requests CASCADE;"))
        await conn.execute(text('DROP TABLE IF EXISTS peminjaman, ruangan, pic_ruangan, penjaga_ruangan, mahasiswa, "user", help_request CASCADE;'))
        
        # Drop all registered tables in Base metadata just in case
        await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables according to new models
        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)
        
    print("Database reset completed successfully!")

if __name__ == "__main__":
    asyncio.run(reset_db())
