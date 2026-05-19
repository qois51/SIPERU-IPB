"""
Upload Service
Handles file upload with validation: extension, size, secure filename.
"""
import os
import uuid
from werkzeug.utils import secure_filename

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
DOCUMENTS_FOLDER = os.path.join(UPLOAD_FOLDER, 'documents')
QR_FOLDER = os.path.join(UPLOAD_FOLDER, 'qr')

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def _ensure_dirs():
    """Create upload directories if they don't exist."""
    os.makedirs(DOCUMENTS_FOLDER, exist_ok=True)
    os.makedirs(QR_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file_storage):
    """
    Save an uploaded file to the documents folder.
    
    Args:
        file_storage: Flask FileStorage object from request.files
    
    Returns:
        (success, filepath_or_error)
    """
    if not file_storage or file_storage.filename == '':
        return False, "File tidak ditemukan."

    if not allowed_file(file_storage.filename):
        return False, f"Format file tidak diizinkan. Gunakan: {', '.join(ALLOWED_EXTENSIONS)}"

    # Check file size
    file_storage.seek(0, os.SEEK_END)
    file_size = file_storage.tell()
    file_storage.seek(0)

    if file_size > MAX_FILE_SIZE:
        return False, f"Ukuran file melebihi batas ({MAX_FILE_SIZE // (1024*1024)}MB)."

    _ensure_dirs()

    # Generate unique filename
    ext = file_storage.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    safe_name = secure_filename(unique_name)
    filepath = os.path.join(DOCUMENTS_FOLDER, safe_name)

    file_storage.save(filepath)

    # Return relative path for storage in DB
    relative_path = f"uploads/documents/{safe_name}"
    return True, relative_path


def get_absolute_path(relative_path):
    """Convert relative upload path to absolute path."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base_dir, relative_path)
