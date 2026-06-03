import asyncio
import sys
import argparse
import random
from datetime import date, timedelta
from sqlalchemy.future import select
from sqlalchemy import delete
from database import AsyncSessionLocal
from app.models import User, Room, Booking

async def seed_users(db):
    print("\n--- Menyelaraskan data pengguna default ---")
    users_data = [
        {"username": "admin", "password": "admin123", "role": "admin", "full_name": "Administrator Utama", "nim_nip": "198001012005011001", "email": "admin@sipberu.ac.id"},
        {"username": "mahasiswa", "password": "mahasiswa123", "role": "mahasiswa", "full_name": "Yoga Christofer", "nim_nip": "5311420026", "email": "yoga@students.sipberu.ac.id"},
        {"username": "satpam", "password": "satpam123", "role": "satpam", "full_name": "Budi Santoso", "nim_nip": "197505122010011005", "email": "budi@staff.sipberu.ac.id"},
        {"username": "dosen", "password": "dosen123", "role": "dosen", "full_name": "Dr. Ir. Anas Miftah", "nim_nip": "197808242003121002", "email": "anas@lecturer.sipberu.ac.id"},
        {"username": "pic", "password": "pic123", "role": "pic", "full_name": "Hendra Wijaya (PIC)", "nim_nip": "198503152011011003", "email": "hendra@staff.sipberu.ac.id"}
    ]

    for data in users_data:
        stmt = select(User).where(User.username == data['username'])
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        if user:
            print(f"Mengupdate password/data untuk user: {data['username']}")
            user.role = data['role']
            user.full_name = data['full_name']
            user.nim_nip = data['nim_nip']
            user.email = data['email']
            user.set_password(data['password'])
        else:
            print(f"Membuat user baru: {data['username']}")
            user = User(
                username=data['username'], 
                role=data['role'],
                full_name=data['full_name'],
                nim_nip=data['nim_nip'],
                email=data['email']
            )
            user.set_password(data['password'])
            db.add(user)
    print("User seeding selesai.")

async def seed_rooms(db):
    print("\n--- Menyelaraskan data ruangan default ---")
    rooms_data = [
        {
            "name": "Ruangan Seminar D",
            "location": "Gedung Rektorat, Lantai 4",
            "capacity": 30,
            "price": 150000,
            "operational_hours": "Senin-Jumat, 07.00-21.00 WIB",
            "facilities": "AC,Sound System,Proyektor",
            "pic_name": "Dr. Ahmad Wijaya",
            "pic_email": "Ahmad@gmail.com",
            "pic_phone": "08123456789",
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        },
        {
            "name": "Lab Komputer 1",
            "location": "Gedung Fakultas Teknik, Lantai 2",
            "capacity": 40,
            "price": 200000,
            "operational_hours": "Senin-Sabtu, 08.00-18.00 WIB",
            "facilities": "AC,PC High End,Internet 1Gbps",
            "pic_name": "Irfan Hakim",
            "pic_email": "irfan@gmail.com",
            "pic_phone": "087712345678",
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        },
        {
            "name": "Auditorium Utama",
            "location": "Gedung Serbaguna, Lantai 1",
            "capacity": 500,
            "price": 1000000,
            "operational_hours": "Setiap Hari, 08.00-22.00 WIB",
            "facilities": "AC,Sound System,Panggung,Lighting",
            "pic_name": "Siti Aminah",
            "pic_email": "siti@gmail.com",
            "pic_phone": "081299998888",
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        }
    ]

    for r_data in rooms_data:
        stmt = select(Room).where(Room.name == r_data['name'])
        result = await db.execute(stmt)
        room = result.scalars().first()
        if room:
            print(f"Mengupdate data untuk ruangan: {r_data['name']}")
            for k, v in r_data.items():
                setattr(room, k, v)
        else:
            print(f"Membuat ruangan baru: {r_data['name']}")
            room = Room(**r_data)
            db.add(room)
    print("Room seeding selesai.")

async def seed_bookings(db):
    print("\n--- Menyelaraskan data booking uji coba ---")
    room_result = await db.execute(select(Room))
    room = room_result.scalars().first()
    
    user_result = await db.execute(select(User).where(User.role == 'mahasiswa'))
    user = user_result.scalars().first()
    
    if not room or not user:
        print("Peringatan: Room atau User (role mahasiswa) tidak ditemukan. Lewati seeding bookings.")
        return

    print("Membersihkan data booking lama...")
    await db.execute(delete(Booking))

    print("Membuat 10 data booking uji coba baru...")
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
        status = "Pending" if i < 4 else "Approved"
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
    print("10 data booking uji coba berhasil dibuat.")

async def main():
    parser = argparse.ArgumentParser(description="SIPERU-IPB Database Seeder")
    parser.add_argument('--bookings', action='store_true', help='Jalankan seeder booking uji coba')
    args, unknown = parser.parse_known_args()

    async with AsyncSessionLocal() as db:
        try:
            await seed_users(db)
            await seed_rooms(db)
            if args.bookings:
                await seed_bookings(db)
            
            await db.commit()
            print("\nSeeding selesai dengan sukses!")
        except Exception as e:
            await db.rollback()
            print(f"\nError saat eksekusi seeding: {e}")

if __name__ == "__main__":
    asyncio.run(main())
