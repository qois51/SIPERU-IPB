import os
import uuid
from werkzeug.utils import secure_filename
import shutil

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
DOCUMENTS_FOLDER = os.path.join(UPLOAD_FOLDER, 'documents')
QR_FOLDER = os.path.join(UPLOAD_FOLDER, 'qr')

ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def _ensure_dirs():
    """Create upload directories if they don't exist."""
    os.makedirs(DOCUMENTS_FOLDER, exist_ok=True)
    os.makedirs(QR_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(upload_file):
    """
    Save an uploaded file to the documents folder.
    
    Args:
        upload_file: FastAPI UploadFile object
    
    Returns:
        (success, filepath_or_error)
    """
    if not upload_file or upload_file.filename == '':
        return False, "File tidak ditemukan."

    if not allowed_file(upload_file.filename):
        return False, "Format file tidak diizinkan. Harap unggah dokumen dalam format PDF."

    # Check file size (FastAPI UploadFile has size attribute or we can read it)
    file_size = getattr(upload_file, 'size', None)
    if file_size is None:
        try:
            upload_file.file.seek(0, os.SEEK_END)
            file_size = upload_file.file.tell()
            upload_file.file.seek(0)
        except Exception:
            file_size = 0

    if file_size > MAX_FILE_SIZE:
        return False, f"Ukuran file melebihi batas ({MAX_FILE_SIZE // (1024*1024)}MB)."

    _ensure_dirs()

    # Generate unique filename
    ext = upload_file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    safe_name = secure_filename(unique_name)
    filepath = os.path.join(DOCUMENTS_FOLDER, safe_name)

    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    # Return relative path for storage in DB
    relative_path = f"uploads/documents/{safe_name}"
    return True, relative_path

def get_absolute_path(relative_path):
    """Convert relative upload path to absolute path."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base_dir, relative_path)
