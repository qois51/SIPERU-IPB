import asyncio
import sys
import argparse
import random
import string
from datetime import date, datetime, timedelta
from sqlalchemy.future import select
from sqlalchemy import delete
from database import AsyncSessionLocal
from app.models import User, Mahasiswa, PICRuangan, PenjagaRuangan, Ruangan, Peminjaman

async def seed_users(db):
    print("\n--- Menyelaraskan data pengguna default ---")
    

    users_data = [
        {
            "class": User,
            "data": {
                "nama": "admin", 
                "email": "admin@sipberu.ac.id", 
                "password": "admin123", 
                "type": "user",
                "no_telepon": "08123456789"
            }
        },
        {
            "class": Mahasiswa,
            "data": {
                "nama": "mahasiswa", 
                "email": "yoga@students.sipberu.ac.id", 
                "password": "mahasiswa123", 
                "type": "mahasiswa",
                "nim": "5311420026",
                "no_telepon": "08123456780"
            }
        },
        {
            "class": PenjagaRuangan,
            "data": {
                "nama": "satpam", 
                "email": "budi@staff.sipberu.ac.id", 
                "password": "satpam123", 
                "type": "penjaga_ruangan",
                "nip": "197505122010011005",
                "unit_kerja": "Bagian Keamanan",
                "no_telepon": "08123456781"
            }
        },
        {
            "class": User,
            "data": {
                "nama": "dosen", 
                "email": "anas@lecturer.sipberu.ac.id", 
                "password": "dosen123", 
                "type": "user",
                "no_telepon": "08123456782"
            }
        },
        {
            "class": PICRuangan,
            "data": {
                "nama": "pic", 
                "email": "hendra@staff.sipberu.ac.id", 
                "password": "pic123", 
                "type": "pic_ruangan",
                "nip": "198503152011011003",
                "unit_kerja": "Bagian Sarana Prasarana",
                "jabatan": "Kepala Subbagian",
                "no_telepon": "08123456783"
            }
        }
    ]

    for item in users_data:
        model_cls = item["class"]
        data = item["data"]
        

        stmt = select(User).where(User.email == data['email'])
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        if user:
            print(f"Mengupdate data untuk user: {data['nama']} ({data['type']})")
            user.nama = data['nama']
            user.no_telepon = data['no_telepon']
            user.set_password(data['password'])
            

            if isinstance(user, Mahasiswa) and 'nim' in data:
                user.nim = data['nim']
            elif isinstance(user, PICRuangan):
                if 'nip' in data: user.nip = data['nip']
                if 'unit_kerja' in data: user.unit_kerja = data['unit_kerja']
                if 'jabatan' in data: user.jabatan = data['jabatan']
            elif isinstance(user, PenjagaRuangan):
                if 'nip' in data: user.nip = data['nip']
                if 'unit_kerja' in data: user.unit_kerja = data['unit_kerja']
        else:
            print(f"Membuat user baru: {data['nama']} ({data['type']})")
            raw_password = data.pop('password')
            user_obj = model_cls(**data)
            user_obj.set_password(raw_password)
            db.add(user_obj)
            
    print("Seeding user selesai.")

async def seed_rooms(db):
    print("\n--- Menyelaraskan data ruangan default ---")
    

    pic_result = await db.execute(select(PICRuangan))
    pic = pic_result.scalars().first()
    if not pic:
        print("Peringatan: PIC tidak ditemukan. Lewati seeding ruangan.")
        return
        
    rooms_data = [
        {
            "nama_ruangan": "Ruangan Seminar D",
            "location": "Gedung Rektorat, Lantai 4",
            "kapasitas": 30,
            "biaya_peminjaman": 150000,
            "operational_hours": "Senin-Jumat, 07.00-21.00 WIB",
            "fasilitas": "AC,Sound System,Proyektor",
            "id_pic": pic.id_user,
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        },
        {
            "nama_ruangan": "Lab Komputer 1",
            "location": "Gedung Fakultas Teknik, Lantai 2",
            "kapasitas": 40,
            "biaya_peminjaman": 200000,
            "operational_hours": "Senin-Sabtu, 08.00-18.00 WIB",
            "fasilitas": "AC,PC High End,Internet 1Gbps",
            "id_pic": pic.id_user,
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        },
        {
            "nama_ruangan": "Auditorium Utama",
            "location": "Gedung Serbaguna, Lantai 1",
            "kapasitas": 500,
            "biaya_peminjaman": 1000000,
            "operational_hours": "Setiap Hari, 08.00-22.00 WIB",
            "fasilitas": "AC,Sound System,Panggung,Lighting",
            "id_pic": pic.id_user,
            "image_url": "/loginAsset/ruanganTerdaftar.png",
            "pic_image_url": ""
        }
    ]

    for r_data in rooms_data:
        stmt = select(Ruangan).where(Ruangan.nama_ruangan == r_data['nama_ruangan'])
        result = await db.execute(stmt)
        room = result.scalars().first()
        
        if room:
            print(f"Mengupdate data untuk ruangan: {r_data['nama_ruangan']}")
            for k, v in r_data.items():
                setattr(room, k, v)
        else:
            print(f"Membuat ruangan baru: {r_data['nama_ruangan']}")
            room_obj = Ruangan(**r_data)
            db.add(room_obj)
            
    print("Seeding ruangan selesai.")

async def seed_bookings(db):
    print("\n--- Menyelaraskan data peminjaman uji coba ---")
    
    room_result = await db.execute(select(Ruangan))
    room = room_result.scalars().first()
    
    mahasiswa_result = await db.execute(select(Mahasiswa))
    mahasiswa = mahasiswa_result.scalars().first()
    
    if not room or not mahasiswa:
        print("Peringatan: Ruangan atau Mahasiswa tidak ditemukan. Lewati seeding peminjaman.")
        return

    print("Membersihkan data peminjaman lama...")
    await db.execute(delete(Peminjaman))

    print("Membuat 10 data peminjaman uji coba baru...")
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
        

        start_hour = 9 + (i % 8)
        end_hour = 11 + (i % 8)
        waktu_mulai = datetime.combine(booking_date, datetime.min.time()) + timedelta(hours=start_hour)
        waktu_selesai = datetime.combine(booking_date, datetime.min.time()) + timedelta(hours=end_hour)
        

        year = waktu_mulai.strftime('%Y')
        rand = ''.join(random.choices(string.digits, k=4))
        id_epass = f"BK-{year}-{rand}"
        
        b = Peminjaman(
            id_ruangan=room.id_ruangan,
            id_mahasiswa=mahasiswa.id_user,
            waktu_mulai=waktu_mulai,
            waktu_selesai=waktu_selesai,
            keperluan=f"{activity_name} oleh {org}",
            status=status,
            path_file_bukti=pdf_samples[i % len(pdf_samples)],
            id_epass=id_epass
        )
        db.add(b)
        
    print("10 data peminjaman uji coba berhasil dibuat.")

async def main():
    parser = argparse.ArgumentParser(description="SIPERU-IPB Database Seeder")
    parser.add_argument('--bookings', action='store_true', help='Jalankan seeder booking uji coba')
    args, unknown = parser.parse_known_args()

    async with AsyncSessionLocal() as db:
        try:
            await seed_users(db)
            await db.commit()
            
            await seed_rooms(db)
            await db.commit()
            
            if args.bookings:
                await seed_bookings(db)
                await db.commit()
                
            print("\nSeeding selesai dengan sukses!")
        except Exception as e:
            await db.rollback()
            print(f"\nError saat eksekusi seeding: {e}")

if __name__ == "__main__":
    asyncio.run(main())