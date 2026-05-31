# SIPERU-IPB Fullstack Starter

Starter project fullstack dengan:

- Frontend: React + Vite
- Backend: FastAPI

### Tech Stack Backend
- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy[asyncio]`
- `asyncpg`
- `pydantic`
- `pydantic-settings`
- `python-dotenv`
- `alembic`

## Struktur Folder

```
SIPERU-IPB/
|- frontend/
|  |- src/
|  |- package.json
|  |- vite.config.js
|- backend/
|  |- app.py
|  |- requirements.txt
|- README.md
```

## 1) Initial Setup (Jalankan Sekali)

### Backend (Flask)

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend (React)

```bash
cd frontend
npm install
```

## 2) Development Run (Jalankan Tiap Kali Development)

### Jalankan Backend

```bash
cd backend
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
python app.py
```

### Jalankan Frontend

```bash
cd frontend
npm run dev
```

Frontend dev server aktif di `http://127.0.0.1:5173`.
Backend API aktif di `http://127.0.0.1:8000`.

## 3) Catatan Akses Aplikasi

- Walaupun backend aktif di port 8000, akses aplikasi tetap dari `http://127.0.0.1:5173`.
- Jika endpoint backend di 8000 tidak bisa diakses langsung dari browser, frontend tetap digunakan sebagai entry point.
- Periksa status endpoint dengan `http://127.0.0.1:8000/docs`.
- Request API diteruskan dari frontend ke backend lewat Vite proxy untuk path `/api`.

## Opsional: Environment Frontend

Kalau ingin pakai URL API non-proxy, copy `frontend/.env.example` menjadi `frontend/.env`.

```bash
cd frontend
copy .env.example .env
```

## Tutorial Database Migrations (Alembic)

| Perintah | Deskripsi |
|---|---|
| `alembic revision --autogenerate -m "pesan"` | Membuat file migrasi baru berdasarkan perubahan di models.py. |
| `alembic upgrade head` | Menerapkan semua migrasi yang tertunda ke database. |
| `alembic downgrade -1` | Membatalkan migrasi terakhir. |
| `alembic current` | Melihat status migrasi saat ini. |

