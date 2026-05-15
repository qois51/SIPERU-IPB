import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.room_model import Room

app = create_app()

with app.app_context():
    # Refresh database schema
    print("Refreshing database schema...")
    db.drop_all()
    db.create_all()
    
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
    
    db.session.bulk_save_objects(rooms)
    db.session.commit()
    print("Room data seeded successfully!")
