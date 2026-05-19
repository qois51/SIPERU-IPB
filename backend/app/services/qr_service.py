"""
QR Code Service
Generates QR codes for approved bookings containing E-Pass information.
"""
import os
import qrcode
from io import BytesIO

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
QR_FOLDER = os.path.join(UPLOAD_FOLDER, 'qr')


def _ensure_qr_dir():
    os.makedirs(QR_FOLDER, exist_ok=True)


def generate_qr_for_booking(booking):
    """
    Generate a QR code image for an approved booking.
    
    QR content includes:
    - booking_code
    - nama peminjam
    - room name
    - tanggal
    - jam
    
    Returns: relative path to saved QR image, or None on error.
    """
    try:
        _ensure_qr_dir()

        # Safe date helper
        def format_date(d):
            if not d:
                return 'N/A'
            if hasattr(d, 'strftime'):
                return d.strftime('%d/%m/%Y')
            return str(d)

        # Build QR content
        room_name = booking.room_data.name if booking.room_data else "N/A"
        peminjam_name = booking.nama_peminjam or (booking.user.username if booking.user else "N/A")
        qr_content = (
            f"SIPERU E-Pass\n"
            f"Kode: {booking.booking_code}\n"
            f"Peminjam: {peminjam_name}\n"
            f"Ruangan: {room_name}\n"
            f"Tanggal: {format_date(booking.date)}\n"
            f"Jam: {booking.start_time} - {booking.end_time}\n"
            f"Status: {booking.status}"
        )

        # Generate QR image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_content)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Save to file
        filename = f"qr_{booking.booking_code}.png"
        filepath = os.path.join(QR_FOLDER, filename)
        img.save(filepath)

        return f"uploads/qr/{filename}"

    except Exception as e:
        print(f"Error generating QR code: {e}")
        return None


def get_qr_image_bytes(booking):
    """
    Generate QR code and return as bytes (for embedding in PDF).
    """
    room_name = booking.room_data.name if booking.room_data else "N/A"
    
    # Safe date helper
    def format_date(d):
        if not d:
            return 'N/A'
        if hasattr(d, 'strftime'):
            return d.strftime('%d/%m/%Y')
        return str(d)

    peminjam_name = booking.nama_peminjam or (booking.user.username if booking.user else "N/A")
    qr_content = (
        f"SIPERU E-Pass\n"
        f"Kode: {booking.booking_code}\n"
        f"Peminjam: {peminjam_name}\n"
        f"Ruangan: {room_name}\n"
        f"Tanggal: {format_date(booking.date)}\n"
        f"Jam: {booking.start_time} - {booking.end_time}"
    )

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(qr_content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer
