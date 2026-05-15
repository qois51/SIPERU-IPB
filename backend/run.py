from app import create_app, db
from app.models.user_model import User

app = create_app()

with app.app_context():
    # Ini akan membuat tabel jika belum ada
    # Pastikan koneksi Postgre sudah benar di .env
    try:
        db.create_all()
        print("Database tables created successfully.")
    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
