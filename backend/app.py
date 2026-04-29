from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from database import get_db
from models import Mahasiswa
import schemas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

class MessageResponse(BaseModel):
    message: str

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="FastAPI backend is running")

@app.get("/api/message", response_model=MessageResponse)
async def message():
    return MessageResponse(message="Hello from FastAPI backend")

@app.get("/test-db")
async def test_db_connection(db: AsyncSession = Depends(get_db)):
    try:
        # Melakukan query simple 'SELECT 1' untuk cek koneksi
        result = await db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Koneksi Supabase Aman!", "data": result.scalar()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Koneksi Gagal: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Digital Signage API is running"}

@app.post("/test-insert-mahasiswa", response_model=schemas.MahasiswaOut)
async def create_mahasiswa(data: schemas.MahasiswaCreate, db: AsyncSession = Depends(get_db)):
    query = select(Mahasiswa).where(Mahasiswa.email == data.email)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email sudah digunakan")

    new_mahasiswa = Mahasiswa(
        nama=data.nama,
        email=data.email,
        password=data.password,
        no_telp=data.no_telp,
        nim=data.nim
    )

    db.add(new_mahasiswa)
    await db.commit()
    await db.refresh(new_mahasiswa)

    return new_mahasiswa

@app.get("/test-get-mahasiswa", response_model=list[schemas.MahasiswaOut])
async def get_all_mahasiswa(db: AsyncSession = Depends(get_db)):
    # Ambil semua data mahasiswa
    query = select(Mahasiswa)
    result = await db.execute(query)
    mahasiswas = result.scalars().all()

    return mahasiswas

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
