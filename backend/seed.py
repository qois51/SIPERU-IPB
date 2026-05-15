from app import create_app, db
from app.models.user_model import User

def seed_users():
    app = create_app()
    with app.app_context():
        # Cek apakah user sudah ada
        if User.query.first():
            print("Database sudah berisi data. Seeder dibatalkan.")
            return

        print("Sedang mengisi data awal (seeding)...")
        
        users_data = [
            {"username": "admin", "password": "admin123", "role": "admin", "full_name": "Administrator Utama", "nim_nip": "198001012005011001", "email": "admin@sipberu.ac.id"},
            {"username": "mahasiswa", "password": "mahasiswa123", "role": "mahasiswa", "full_name": "Yoga Christofer", "nim_nip": "5311420026", "email": "yoga@students.sipberu.ac.id"},
            {"username": "satpam", "password": "satpam123", "role": "satpam", "full_name": "Budi Santoso", "nim_nip": "197505122010011005", "email": "budi@staff.sipberu.ac.id"}
        ]

        for data in users_data:
            user = User(
                username=data['username'], 
                role=data['role'],
                full_name=data['full_name'],
                nim_nip=data['nim_nip'],
                email=data['email']
            )
            user.set_password(data['password'])
            db.session.add(user)
        
        try:
            db.session.commit()
            print("Seeding berhasil! Akun default telah dibuat:")
            for u in users_data:
                print(f"- {u['username']} ({u['role']})")
        except Exception as e:
            db.session.rollback()
            print(f"Error saat seeding: {e}")

if __name__ == "__main__":
    seed_users()
