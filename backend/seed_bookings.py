import asyncio
from datetime import datetime, date, timedelta
import random
from sqlalchemy.future import select
from database import AsyncSessionLocal
from app.models.room_model import Room
from app.models.user_model import User
from app.models.booking_model import Booking

async def seed_bookings():
    async with AsyncSessionLocal() as db:
        # Get first room and first user
        room_result = await db.execute(select(Room))
        room = room_result.scalars().first()
        
        user_result = await db.execute(select(User))
        user = user_result.scalars().first()
        
        if not room or not user:
            print("Room or User not found. Run seed_rooms.py first.")
            return

        print("Cleaning up old bookings...")
        # Since we use Async SQL Alchemy, delete using standard statements
        from sqlalchemy import delete
        await db.execute(delete(Booking))
        await db.commit()

        print("Seeding 10 test bookings...")
        
        activities = [
            ("Rapat Himpunan", "HIMA ILKOM"),
            ("Workshop UI/UX", "GDSC UNNES"),
            ("Seminar Nasional", "BEM FT"),
            ("Latihan Tari", "UKM Seni"),
            ("Rapat Panitia", "Panitia Wisuda"),
            ("Diskusi Publik", "DEMA"),
            ("Pelatihan Coding", "Informatics Care"),
            ("Rapat Internal", "Hima Sipil"),
            ("Gathering Alumni", "IKA UNNES"),
            ("Tech Talk", "Google Student Club")
        ]

        pdf_samples = [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
            "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf",
            "http://www.africau.edu/images/default/sample.pdf",
            "https://pdfobject.com/pdf/sample.pdf"
        ]

        for i in range(10):
            activity_name, org = activities[i]
            # Mix of status: 4 Pending, 6 Approved
            status = "Pending" if i < 4 else "Approved"
            # Spread dates over today and next 5 days
            booking_date = date.today() + timedelta(days=random.randint(0, 5))
            
            b = Booking(
                room_id=room.id,
                user_id=user.id,
                date=booking_date,
                start_time=f"{9 + (i % 8):02d}:00",
                end_time=f"{11 + (i % 8):02d}:00",
                status=status,
                activity_name=activity_name,
                organization=org,
                participants=random.randint(10, 50),
                purpose=f"Kegiatan rutin {activity_name} untuk meningkatkan kompetensi mahasiswa.",
                document_url=pdf_samples[i % len(pdf_samples)]
            )
            db.add(b)
        
        await db.commit()
        print("10 test bookings seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_bookings())
