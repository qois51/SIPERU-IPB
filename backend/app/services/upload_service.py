"""
UploadService (OOP) — File upload/delete for documents and QR codes.
Saves to Supabase Storage if configured, falls back to local disk.
"""
import os
import uuid
import json
import urllib.request
import urllib.error
import shutil

from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"
)
DOCUMENTS_FOLDER = os.path.join(UPLOAD_FOLDER, "documents")
QR_FOLDER = os.path.join(UPLOAD_FOLDER, "qr")

ALLOWED_EXTENSIONS = {"pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class UploadService:
    """Manages file uploads and deletions (local or Supabase)."""

    # ------------------------------------------------------------------ #
    #  Helpers                                                             #
    # ------------------------------------------------------------------ #

    def _ensure_dirs(self):
        os.makedirs(DOCUMENTS_FOLDER, exist_ok=True)
        os.makedirs(QR_FOLDER, exist_ok=True)

    @staticmethod
    def _allowed_file(filename: str) -> bool:
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
        )

    @staticmethod
    def _get_supabase_creds():
        from config import settings
        url = getattr(settings, "supabase_url", None) or os.environ.get("SUPABASE_URL")
        key = getattr(settings, "supabase_key", None) or os.environ.get("SUPABASE_KEY")
        return url, key

    # ------------------------------------------------------------------ #
    #  Supabase Storage                                                    #
    # ------------------------------------------------------------------ #

    def upload_to_supabase(
        self, bucket: str, filename: str, file_bytes: bytes, content_type: str
    ) -> tuple[bool, str]:
        """Upload raw bytes to a Supabase Storage bucket via REST API."""
        supabase_url, supabase_key = self._get_supabase_creds()
        if not supabase_url or not supabase_key:
            return False, "Kredensial Supabase belum dikonfigurasi."

        try:
            url = supabase_url.rstrip("/")
            upload_url = f"{url}/storage/v1/object/{bucket}/{filename}"
            headers = {
                "Authorization": f"Bearer {supabase_key}",
                "apikey": supabase_key,
                "Content-Type": content_type,
                "Content-Length": str(len(file_bytes)),
            }
            req = urllib.request.Request(
                upload_url, data=file_bytes, headers=headers, method="POST"
            )
            with urllib.request.urlopen(req) as response:
                json.loads(response.read().decode("utf-8"))

            public_url = f"{url}/storage/v1/object/public/{bucket}/{filename}"
            return True, public_url

        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode("utf-8")
            except Exception:
                error_body = ""
            msg = f"Supabase upload failed (HTTP {e.code}): {error_body}"
            print(f"[UploadService] {msg}")
            return False, msg
        except Exception as e:
            msg = f"Supabase upload unexpected error: {str(e)}"
            print(f"[UploadService] {msg}")
            return False, msg

    def delete_from_supabase(self, bucket: str, filename: str) -> bool:
        """Delete an object from a Supabase Storage bucket."""
        supabase_url, supabase_key = self._get_supabase_creds()
        if not supabase_url or not supabase_key:
            return False

        try:
            url = supabase_url.rstrip("/")
            delete_url = f"{url}/storage/v1/object/{bucket}/{filename}"
            headers = {
                "Authorization": f"Bearer {supabase_key}",
                "apikey": supabase_key,
            }
            req = urllib.request.Request(
                delete_url, headers=headers, method="DELETE"
            )
            with urllib.request.urlopen(req) as response:
                response.read()
            return True
        except Exception as e:
            print(f"[UploadService] Supabase delete error for {filename}: {e}")
            return False

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def save_uploaded_file(self, upload_file) -> tuple[bool, str]:
        """Save an uploaded document (PDF) to Supabase or local storage.

        Args:
            upload_file: FastAPI UploadFile object.

        Returns:
            (success, filepath_or_url_or_error_message)
        """
        if not upload_file or upload_file.filename == "":
            return False, "File tidak ditemukan."

        if not self._allowed_file(upload_file.filename):
            return False, "Format file tidak diizinkan. Harap unggah dokumen dalam format PDF."

        # Check size
        file_size = getattr(upload_file, "size", None)
        if file_size is None:
            try:
                upload_file.file.seek(0, os.SEEK_END)
                file_size = upload_file.file.tell()
                upload_file.file.seek(0)
            except Exception:
                file_size = 0

        if file_size > MAX_FILE_SIZE:
            return False, f"Ukuran file melebihi batas ({MAX_FILE_SIZE // (1024 * 1024)}MB)."

        ext = upload_file.filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        safe_name = secure_filename(unique_name)

        try:
            file_bytes = upload_file.file.read()
            upload_file.file.seek(0)
        except Exception as e:
            return False, f"Gagal membaca file: {str(e)}"

        supabase_url, supabase_key = self._get_supabase_creds()
        if supabase_url and supabase_key:
            ok, res = self.upload_to_supabase("documents", safe_name, file_bytes, "application/pdf")
            if ok:
                return True, res
            print(f"[UploadService] Supabase upload failed ({res}). Using local fallback.")

        # Local fallback
        self._ensure_dirs()
        filepath = os.path.join(DOCUMENTS_FOLDER, safe_name)
        try:
            with open(filepath, "wb") as buf:
                buf.write(file_bytes)
            return True, f"uploads/documents/{safe_name}"
        except Exception as e:
            return False, f"Gagal menyimpan file secara lokal: {str(e)}"

    def save_qrcode_file(self, booking_code: str, img_bytes: bytes) -> tuple[bool, str]:
        """Save QR code PNG bytes to Supabase 'qrcode' bucket, or local storage."""
        filename = f"qr_{booking_code}.png"

        supabase_url, supabase_key = self._get_supabase_creds()
        if supabase_url and supabase_key:
            ok, res = self.upload_to_supabase("qrcode", filename, img_bytes, "image/png")
            if ok:
                return True, res
            print(f"[UploadService] QR Supabase upload failed ({res}). Using local fallback.")

        self._ensure_dirs()
        filepath = os.path.join(QR_FOLDER, filename)
        try:
            with open(filepath, "wb") as buf:
                buf.write(img_bytes)
            return True, f"uploads/qr/{filename}"
        except Exception as e:
            return False, f"Gagal menyimpan QR code secara lokal: {str(e)}"

    def delete_uploaded_file(self, filepath: str):
        """Delete a file from local storage or Supabase Storage."""
        if not filepath:
            return

        if "storage/v1/object/public/" in filepath:
            try:
                parts = filepath.split("/storage/v1/object/public/")
                if len(parts) > 1:
                    bucket_and_file = parts[1]
                    bucket_parts = bucket_and_file.split("/", 1)
                    if len(bucket_parts) == 2:
                        bucket, filename = bucket_parts
                        self.delete_from_supabase(bucket, filename)
            except Exception as e:
                print(f"[UploadService] Failed to parse Supabase URL for deletion: {e}")
        else:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            abs_path = os.path.join(base_dir, filepath)
            if os.path.exists(abs_path):
                try:
                    os.remove(abs_path)
                except Exception as e:
                    print(f"[UploadService] Failed to delete local file {abs_path}: {e}")

    def get_absolute_path(self, relative_path: str) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        return os.path.join(base_dir, relative_path)


# ---------------------------------------------------------------------------
# Backward-compatibility shims (module-level functions)
# ---------------------------------------------------------------------------

def save_uploaded_file(upload_file):
    return UploadService().save_uploaded_file(upload_file)


def save_qrcode_file(booking_code: str, img_bytes: bytes):
    return UploadService().save_qrcode_file(booking_code, img_bytes)


def delete_uploaded_file(filepath: str):
    return UploadService().delete_uploaded_file(filepath)


def get_absolute_path(relative_path: str) -> str:
    return UploadService().get_absolute_path(relative_path)
