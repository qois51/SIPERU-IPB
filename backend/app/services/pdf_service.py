"""
PDF Service
Generates E-Pass PDF documents for approved bookings using ReportLab.
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


# Brand colors
BLUE_PRIMARY = HexColor('#1e3a8a')
BLUE_DARK = HexColor('#0f1d45')
BLUE_LIGHT = HexColor('#3b82f6')
GOLD = HexColor('#d4a843')
WHITE = HexColor('#ffffff')
GRAY = HexColor('#6b7280')
GREEN = HexColor('#16a34a')
RED = HexColor('#dc2626')


def generate_epass_pdf(booking):
    """
    Generate an E-Pass PDF for an approved booking.
    
    Returns: BytesIO buffer containing the PDF.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # --- Header Background ---
    c.setFillColor(BLUE_PRIMARY)
    c.rect(0, height - 100, width, 100, fill=1, stroke=0)

    # --- Header Text ---
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(30, height - 45, "SIPBeRu")
    c.setFont("Helvetica", 10)
    c.drawString(30, height - 62, "Sistem Peminjaman Ruangan")

    # --- E-Pass Badge ---
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(width - 30, height - 45, "E-PASS DIGITAL")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 11)
    c.drawRightString(width - 30, height - 62, f"{booking.booking_code}")

    # --- Status Badge ---
    status = booking.status
    if status == 'Approved':
        badge_color = GREEN
        status_text = "DISETUJUI"
    elif status == 'Rejected':
        badge_color = RED
        status_text = "DITOLAK"
    elif status == 'Completed':
        badge_color = BLUE_LIGHT
        status_text = "SELESAI"
    else:
        badge_color = GOLD
        status_text = "PENDING"

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

    # --- QR Code Section (right side) ---
    try:
        from app.services.qr_service import get_qr_image_bytes
        qr_buffer = get_qr_image_bytes(booking)
        qr_image = ImageReader(qr_buffer)
        c.drawImage(qr_image, width - 180, y - 180, 150, 150)
    except Exception as e:
        c.setFillColor(GRAY)
        c.setFont("Helvetica", 9)
        c.drawString(width - 170, y - 100, "QR Code tidak tersedia")

    # --- Booking Info Section ---
    y -= 30
    c.setFillColor(BLUE_DARK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(30, y, "Informasi Peminjaman")

    y -= 25
    info_items = [
        ("Kode Booking", booking.booking_code or "-"),
        ("Nama Peminjam", booking.nama_peminjam or (booking.user.username if booking.user else "-")),
        ("NIM/NIP", booking.nim_nip or "-"),
        ("Program Studi", booking.program_studi or "-"),
        ("Email", booking.email or "-"),
        ("Nomor HP", booking.nomor_hp or "-"),
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

    room_name = booking.room_data.name if booking.room_data else "-"
    room_location = booking.room_data.location if booking.room_data else "-"

    # Safe date helper
    def format_date_pdf(d):
        if not d:
            return "-"
        if hasattr(d, 'strftime'):
            return d.strftime('%d %B %Y')
        return str(d)

    kegiatan_items = [
        ("Nama Kegiatan", booking.activity_name or "-"),
        ("Jenis Kegiatan", booking.jenis_kegiatan or "-"),
        ("Organisasi", booking.organization or "-"),
        ("Jumlah Peserta", str(booking.participants or 0)),
        ("Ruangan", room_name),
        ("Lokasi", room_location),
        ("Tanggal", format_date_pdf(booking.date)),
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
        facilities_text = ", ".join([f.facility_name for f in booking.facilities])
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
    c.drawCentredString(width / 2, 18, "SIPBeRu - Sistem Peminjaman Ruangan | Institut Pertanian Bogor")
    c.drawCentredString(width / 2, 8, "Dokumen ini digenerate secara otomatis dan sah tanpa tanda tangan.")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
