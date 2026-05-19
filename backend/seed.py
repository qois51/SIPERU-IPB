import asyncio
from sqlalchemy.future import select
from database import AsyncSessionLocal, Base
from app.models.user_model import User

async def seed_users():
    async with AsyncSessionLocal() as db:
        print("Sedang menyelaraskan data pengguna default...")
        
        users_data = [
            {"username": "admin", "password": "admin123", "role": "admin", "full_name": "Administrator Utama", "nim_nip": "198001012005011001", "email": "admin@sipberu.ac.id"},
            {"username": "mahasiswa", "password": "mahasiswa123", "role": "mahasiswa", "full_name": "Yoga Christofer", "nim_nip": "5311420026", "email": "yoga@students.sipberu.ac.id"},
            {"username": "satpam", "password": "satpam123", "role": "satpam", "full_name": "Budi Santoso", "nim_nip": "197505122010011005", "email": "budi@staff.sipberu.ac.id"}
        ]

        for data in users_data:
            # Check if user already exists
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
        
        try:
            await db.commit()
            print("Seeding berhasil! Akun default telah dibuat:")
            for u in users_data:
                print(f"- {u['username']} ({u['role']})")
        except Exception as e:
            await db.rollback()
            print(f"Error saat seeding: {e}")

if __name__ == "__main__":
    asyncio.run(seed_users())
