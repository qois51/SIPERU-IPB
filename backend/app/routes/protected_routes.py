from fastapi import APIRouter, Depends
from app.utils.auth_middleware import role_required

protected_router = APIRouter()

@protected_router.get('/mahasiswa')
async def mahasiswa_only(current_user: dict = Depends(role_required(['mahasiswa', 'admin']))):
    return {"message": "Halo Mahasiswa!"}

@protected_router.get('/admin')
async def admin_only(current_user: dict = Depends(role_required(['admin']))):
    return {"message": "Halo Admin! Anda punya akses penuh."}

@protected_router.get('/satpam')
async def satpam_only(current_user: dict = Depends(role_required(['satpam', 'admin']))):
    return {"message": "Halo Satpam! Laporan keamanan hari ini?"}
