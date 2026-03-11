# SIPERU-IPB Fullstack Starter

Starter project fullstack dengan:

- Frontend: React + Vite
- Backend: Python Flask

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
Backend API aktif di `http://127.0.0.1:5000`.

## 3) Catatan Akses Aplikasi

- Walaupun backend aktif di port 5000, akses aplikasi tetap dari `http://127.0.0.1:5173`.
- Jika endpoint backend di 5000 tidak bisa diakses langsung dari browser, frontend tetap digunakan sebagai entry point.
- Request API diteruskan dari frontend ke backend lewat Vite proxy untuk path `/api`.

## Opsional: Environment Frontend

Kalau ingin pakai URL API non-proxy, copy `frontend/.env.example` menjadi `frontend/.env`.

```bash
cd frontend
copy .env.example .env
```
