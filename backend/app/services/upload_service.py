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

import json
import urllib.request
import urllib.error

def save_uploaded_file(upload_file):
    """
    Save an uploaded file to Supabase Storage if configured,
    otherwise fallback to local documents folder.
    
    Args:
        upload_file: FastAPI UploadFile object
    
    Returns:
        (success, filepath_or_url_or_error)
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

    # Generate unique filename
    ext = upload_file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    safe_name = secure_filename(unique_name)

    # Read the file content
    try:
        file_bytes = upload_file.file.read()
        # Reset pointer just in case
        upload_file.file.seek(0)
    except Exception as e:
        return False, f"Gagal membaca file: {str(e)}"

    # Check if Supabase Storage is configured in config settings
    from config import settings
    supabase_url = getattr(settings, 'supabase_url', None) or os.environ.get('SUPABASE_URL')
    supabase_key = getattr(settings, 'supabase_key', None) or os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        ok, res = upload_to_supabase("documents", safe_name, file_bytes, "application/pdf")
        if ok:
            return True, res
        else:
            print(f"[Supabase Storage Warning] Upload failed ({res}). Falling back to local storage...")

    # Fallback / Default: Local Storage
    _ensure_dirs()
    filepath = os.path.join(DOCUMENTS_FOLDER, safe_name)
    try:
        with open(filepath, "wb") as buffer:
            buffer.write(file_bytes)
        relative_path = f"uploads/documents/{safe_name}"
        return True, relative_path
    except Exception as e:
        return False, f"Gagal menyimpan file secara lokal: {str(e)}"

def upload_to_supabase(bucket: str, filename: str, file_bytes: bytes, content_type: str):
    """
    Upload raw file bytes directly to a Supabase Storage bucket via REST API.
    """
    from config import settings
    supabase_url = getattr(settings, 'supabase_url', None) or os.environ.get('SUPABASE_URL')
    supabase_key = getattr(settings, 'supabase_key', None) or os.environ.get('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        return False, "Kredensial Supabase belum dikonfigurasi."

    try:
        url = supabase_url.rstrip('/')
        # Target endpoint: POST /storage/v1/object/{bucket}/{filename}
        upload_url = f"{url}/storage/v1/object/{bucket}/{filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key,
            "Content-Type": content_type,
            "Content-Length": str(len(file_bytes))
        }
        
        req = urllib.request.Request(
            upload_url,
            data=file_bytes,
            headers=headers,
            method="POST"
        )
        
        with urllib.request.urlopen(req) as response:
            json.loads(response.read().decode('utf-8'))
            
        # If upload succeeds, construct public URL
        public_url = f"{url}/storage/v1/object/public/{bucket}/{filename}"
        return True, public_url
        
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except Exception:
            error_body = "Gagal membaca isi respon error."
        error_msg = f"Gagal unggah ke Supabase Storage (HTTP {e.code}): {error_body}"
        print(f"[Supabase Storage Error] {error_msg}")
        return False, error_msg
    except Exception as e:
        error_msg = f"Gagal unggah ke Supabase Storage (Unexpected): {str(e)}"
        print(f"[Supabase Storage Error] {error_msg}")
        return False, error_msg

def save_qrcode_file(booking_code: str, img_bytes: bytes):
    """
    Save generated QR code PNG bytes to Supabase 'qrcode' bucket,
    falling back to local uploads/qr folder if Supabase is unconfigured or fails.
    """
    filename = f"qr_{booking_code}.png"
    
    # Check if Supabase is configured
    from config import settings
    supabase_url = getattr(settings, 'supabase_url', None) or os.environ.get('SUPABASE_URL')
    supabase_key = getattr(settings, 'supabase_key', None) or os.environ.get('SUPABASE_KEY')
    
    if supabase_url and supabase_key:
        ok, res = upload_to_supabase("qrcode", filename, img_bytes, "image/png")
        if ok:
            return True, res
        else:
            print(f"[Supabase Storage] QR Code upload to bucket 'qrcode' failed ({res}). Falling back to local...")
            
    # Fallback: Local Storage
    _ensure_dirs()
    filepath = os.path.join(QR_FOLDER, filename)
    try:
        with open(filepath, "wb") as buffer:
            buffer.write(img_bytes)
        relative_path = f"uploads/qr/{filename}"
        return True, relative_path
    except Exception as e:
        return False, f"Gagal menyimpan QR code secara lokal: {str(e)}"

def get_absolute_path(relative_path):
    """Convert relative upload path to absolute path."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.join(base_dir, relative_path)

def delete_from_supabase(bucket: str, filename: str):
    """
    Delete an object from a Supabase Storage bucket via REST API.
    """
    from config import settings
    supabase_url = getattr(settings, 'supabase_url', None) or os.environ.get('SUPABASE_URL')
    supabase_key = getattr(settings, 'supabase_key', None) or os.environ.get('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        print("[Supabase Storage] Supabase not configured. Skipping deletion.")
        return False

    try:
        url = supabase_url.rstrip('/')
        # Target endpoint: DELETE /storage/v1/object/{bucket}/{filename}
        delete_url = f"{url}/storage/v1/object/{bucket}/{filename}"
        
        headers = {
            "Authorization": f"Bearer {supabase_key}",
            "apikey": supabase_key
        }
        
        req = urllib.request.Request(
            delete_url,
            headers=headers,
            method="DELETE"
        )
        
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            print(f"[Supabase Storage] Successfully deleted {filename} from bucket '{bucket}': {res_data}")
        return True
        
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except Exception:
            error_body = ""
        print(f"[Supabase Storage Error] Failed to delete {filename} (HTTP {e.code}): {error_body}")
        return False
    except Exception as e:
        print(f"[Supabase Storage Error] Unexpected error deleting {filename}: {str(e)}")
        return False

def delete_uploaded_file(filepath: str):
    """
    Delete an uploaded file either from local storage or from Supabase Storage
    depending on the filepath format.
    """
    if not filepath:
        return
    
    # 1. Check if it's a Supabase URL
    if "storage/v1/object/public/" in filepath:
        try:
            # Parse bucket and filename from URL
            parts = filepath.split("/storage/v1/object/public/")
            if len(parts) > 1:
                bucket_and_file = parts[1]
                bucket_parts = bucket_and_file.split("/", 1)
                if len(bucket_parts) == 2:
                    bucket, filename = bucket_parts
                    delete_from_supabase(bucket, filename)
        except Exception as e:
            print(f"[Storage Warning] Failed to parse Supabase URL for deletion: {str(e)}")
            
    # 2. Local fallback / Local path
    else:
        # Resolve absolute path
        abs_path = get_absolute_path(filepath)
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
                print(f"[Storage] Successfully deleted local file: {abs_path}")
            except Exception as e:
                print(f"[Storage Warning] Failed to delete local file {abs_path}: {str(e)}")
