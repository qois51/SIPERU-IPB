"""
PDFService (OOP) — Generates E-Pass PDF documents for approved bookings.
"""
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Brand colours
BLUE_PRIMARY = HexColor("#1e3a8a")
BLUE_DARK = HexColor("#0f1d45")
BLUE_LIGHT = HexColor("#3b82f6")
GOLD = HexColor("#d4a843")
WHITE = HexColor("#ffffff")
GRAY = HexColor("#6b7280")
GREEN = HexColor("#16a34a")
RED = HexColor("#dc2626")

STATUS_MAP = {
    "Approved": (GREEN, "DISETUJUI"),
    "Rejected": (RED, "DITOLAK"),
    "Completed": (BLUE_LIGHT, "SELESAI"),
}


class PDFService:
    """Handles PDF generation for booking E-Passes."""

    @staticmethod
    def _format_date(d) -> str:
        if not d:
            return "-"
        if hasattr(d, "strftime"):
            return d.strftime("%d %B %Y")
        return str(d)

    def generate_epass_pdf(self, booking) -> BytesIO:
        """Generate an E-Pass PDF for an approved booking.

        Returns: BytesIO buffer containing the PDF.
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # --- Header ---
        c.setFillColor(BLUE_PRIMARY)
        c.rect(0, height - 100, width, 100, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(30, height - 45, "SIPBeRu")
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 62, "Sistem Peminjaman Ruangan")

        c.setFillColor(GOLD)
        c.setFont("Helvetica-Bold", 14)
        c.drawRightString(width - 30, height - 45, "E-PASS DIGITAL")
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 11)
        c.drawRightString(width - 30, height - 62, f"{booking.booking_code}")

        # --- Status Badge ---
        badge_color, status_text = STATUS_MAP.get(
            booking.status, (GOLD, "PENDING")
        )
        c.setFillColor(badge_color)
        c.roundRect(width - 150, height - 90, 120, 22, 6, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(width - 90, height - 84, status_text)

        # --- Divider ---
        y = height - 120
        c.setStrokeColor(BLUE_LIGHT)
        c.setLineWidth(2)
        c.line(30, y, width - 30, y)

        # --- QR Code ---
        try:
            from app.services.qr_service import QRService
            qr_svc = QRService()
            qr_buffer = qr_svc.get_qr_image_bytes(booking)
            qr_image = ImageReader(qr_buffer)
            c.drawImage(qr_image, width - 180, y - 180, 150, 150)
        except Exception as e:
            c.setFillColor(GRAY)
            c.setFont("Helvetica", 9)
            c.drawString(width - 170, y - 100, "QR Code tidak tersedia")

        # --- Booking Info ---
        y -= 30
        c.setFillColor(BLUE_DARK)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(30, y, "Informasi Peminjaman")

        y -= 25

        # Fix: use mahasiswa relationship (not .user which doesn't exist)
        peminjam_name = (
            booking.mahasiswa.nama if booking.mahasiswa else "-"
        )
        nim_nip = (
            booking.mahasiswa.nim if booking.mahasiswa else "-"
        )
        email = booking.mahasiswa.email if booking.mahasiswa else "-"
        nomor_hp = booking.mahasiswa.no_telepon if booking.mahasiswa else "-"

        info_items = [
            ("Kode Booking", booking.booking_code or "-"),
            ("Nama Peminjam", peminjam_name),
            ("NIM/NIP", nim_nip),
            ("Program Studi", booking.program_studi or "-"),
            ("Email", email),
            ("Nomor HP", nomor_hp),
        ]

        for label, value in info_items:
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY)
            c.drawString(30, y, label)
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLUE_DARK)
            c.drawString(150, y, str(value))
            y -= 18

        # --- Kegiatan Section ---
        y -= 15
        c.setFillColor(BLUE_PRIMARY)
        c.roundRect(30, y - 5, width - 240, 22, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(40, y, "Data Kegiatan")
        y -= 25

        room_name = booking.ruangan.nama_ruangan if booking.ruangan else "-"
        room_location = booking.ruangan.location if booking.ruangan else "-"

        kegiatan_items = [
            ("Nama Kegiatan", booking.activity_name or "-"),
            ("Jenis Kegiatan", booking.jenis_kegiatan or "-"),
            ("Organisasi", booking.organization or "-"),
            ("Jumlah Peserta", str(booking.participants or 0)),
            ("Ruangan", room_name),
            ("Lokasi", room_location or "-"),
            ("Tanggal", self._format_date(booking.date)),
            ("Jam", f"{booking.start_time} - {booking.end_time}"),
        ]

        for label, value in kegiatan_items:
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY)
            c.drawString(30, y, label)
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLUE_DARK)
            c.drawString(150, y, str(value))
            y -= 18

        # --- Facilities ---
        if booking.facilities:
            y -= 10
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLUE_DARK)
            c.drawString(30, y, "Fasilitas Tambahan:")
            y -= 16
            facilities_text = ", ".join(
                [f.facility_name for f in booking.facilities]
            )
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY)
            c.drawString(30, y, facilities_text)
            y -= 18

        # --- Notes ---
        if booking.notes:
            y -= 10
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(BLUE_DARK)
            c.drawString(30, y, "Catatan Admin:")
            y -= 16
            c.setFont("Helvetica", 9)
            c.setFillColor(GRAY)
            c.drawString(30, y, booking.notes[:100])

        # --- Footer ---
        c.setFillColor(BLUE_PRIMARY)
        c.rect(0, 0, width, 40, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 8)
        c.drawCentredString(
            width / 2, 18,
            "SIPBeRu - Sistem Peminjaman Ruangan | Institut Pertanian Bogor"
        )
        c.drawCentredString(
            width / 2, 8,
            "Dokumen ini digenerate secara otomatis dan sah tanpa tanda tangan."
        )

        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer


# ---------------------------------------------------------------------------
# Backward-compatibility shim
# ---------------------------------------------------------------------------

def generate_epass_pdf(booking) -> BytesIO:
    return PDFService().generate_epass_pdf(booking)
