import asyncio
from database import engine, Base, AsyncSessionLocal
from app.models import User, Room, Booking, BookingFacility

async def seed_rooms():
    # Refresh database schema
    print("Refreshing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    rooms = [
        Room(
            name="Ruangan Seminar D",
            location="Gedung Rektorat, Lantai 4",
            capacity=30,
            price=150000,
            operational_hours="Senin-Jumat, 07.00-21.00 WIB",
            facilities="AC,Sound System,Proyektor",
            pic_name="Dr. Ahmad Wijaya",
            pic_email="Ahmad@gmail.com",
            pic_phone="08123456789",
            image_url="/loginAsset/ruanganTerdaftar.png",
            pic_image_url=""
        ),
        Room(
            name="Lab Komputer 1",
            location="Gedung Fakultas Teknik, Lantai 2",
            capacity=40,
            price=200000,
            operational_hours="Senin-Sabtu, 08.00-18.00 WIB",
            facilities="AC,PC High End,Internet 1Gbps",
            pic_name="Irfan Hakim",
            pic_email="irfan@gmail.com",
            pic_phone="087712345678",
            image_url="/loginAsset/ruanganTerdaftar.png",
            pic_image_url=""
        ),
        Room(
            name="Auditorium Utama",
            location="Gedung Serbaguna, Lantai 1",
            capacity=500,
            price=1000000,
            operational_hours="Setiap Hari, 08.00-22.00 WIB",
            facilities="AC,Sound System,Panggung,Lighting",
            pic_name="Siti Aminah",
            pic_email="siti@gmail.com",
            pic_phone="081299998888",
            image_url="/loginAsset/ruanganTerdaftar.png",
            pic_image_url=""
        )
    ]
    
    async with AsyncSessionLocal() as db:
        db.add_all(rooms)
        await db.commit()
    print("Room data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_rooms())
