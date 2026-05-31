from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routes.auth_routes import auth_router
from app.routes.protected_routes import protected_router
from app.routes.room_routes import room_router
from app.routes.booking_routes import booking_router
from app.routes.user_routes import user_router
from app.routes.help_routes import help_router

app = FastAPI(
    title="Room Management API",
    description="API untuk manajemen booking ruangan dengan sistem role-based access",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(protected_router, prefix="/api/data", tags=["Protected"])
app.include_router(room_router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(booking_router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(help_router, prefix="/api/help", tags=["HelpCenter"])

from sqlalchemy import text
from database import engine as async_engine

@app.get('/')
def index():
    return {"message": "Server is running", "docs": "/docs"}

@app.get('/api/test-db')
async def test_db_endpoint():
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            return {
                "status": "success",
                "message": "Database connection (asyncpg) to Supabase works perfectly!"
            }
    except Exception as e:
        return {
            "status": "failed",
            "message": f"Database connection failed: {str(e)}"
        }

# Serve uploaded files (surat, documents)
UPLOAD_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_BASE, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_BASE), name="uploads")
