"""
QRService (OOP) — Generates QR codes for approved bookings.
"""
import os
from io import BytesIO

import qrcode

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
QR_FOLDER = os.path.join(UPLOAD_FOLDER, "qr")


class QRService:
    """Handles QR code generation for booking E-Passes."""

    def _ensure_qr_dir(self):
        os.makedirs(QR_FOLDER, exist_ok=True)

    def _format_date(self, d) -> str:
        if not d:
            return "N/A"
        if hasattr(d, "strftime"):
            return d.strftime("%d/%m/%Y")
        return str(d)

    def _build_qr_content(self, booking) -> str:
        """Build the text content embedded in the QR code."""
        room_name = booking.ruangan.nama_ruangan if booking.ruangan else "N/A"
        # Fix: use .mahasiswa instead of .user (old broken reference)
        peminjam_name = (
            booking.mahasiswa.nama if booking.mahasiswa else "N/A"
        )
        return (
            f"SIPERU E-Pass\n"
            f"Kode: {booking.booking_code}\n"
            f"Peminjam: {peminjam_name}\n"
            f"Ruangan: {room_name}\n"
            f"Tanggal: {self._format_date(booking.date)}\n"
            f"Jam: {booking.start_time} - {booking.end_time}\n"
            f"Status: {booking.status}"
        )

    def _make_qr_image(self, content: str, box_size: int = 10, border: int = 4):
        """Generate a QR code PIL image from text content."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=box_size,
            border=border,
        )
        qr.add_data(content)
        qr.make(fit=True)
        return qr.make_image(fill_color="black", back_color="white")

    def generate_qr_for_booking(self, booking) -> str | None:
        """Generate and save a QR code image for an approved booking.

        Returns the relative (or Supabase) path to the saved QR image, or None on error.
        """
        try:
            self._ensure_qr_dir()
            content = self._build_qr_content(booking)
            img = self._make_qr_image(content)

            buf = BytesIO()
            img.save(buf, format="PNG")
            img_bytes = buf.getvalue()

            from app.services.upload_service import UploadService
            upload_svc = UploadService()
            ok, res_path = upload_svc.save_qrcode_file(booking.booking_code, img_bytes)
            return res_path if ok else None
        except Exception as e:
            print(f"[QRService] Error generating QR code: {e}")
            return None

    def get_qr_image_bytes(self, booking) -> BytesIO:
        """Generate a QR code and return its bytes (for embedding in PDF)."""
        content = self._build_qr_content(booking)
        img = self._make_qr_image(content, box_size=8, border=3)

        buf = BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf


# ---------------------------------------------------------------------------
# Backward-compatibility shims (module-level functions for any callers that
# haven't been migrated yet)
# ---------------------------------------------------------------------------

def generate_qr_for_booking(booking) -> str | None:
    return QRService().generate_qr_for_booking(booking)


def get_qr_image_bytes(booking) -> BytesIO:
    return QRService().get_qr_image_bytes(booking)
