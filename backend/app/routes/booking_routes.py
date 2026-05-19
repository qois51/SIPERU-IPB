"""
Booking Routes — Refactored with Service Layer
Standardized JSON response: { success, message, data }
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.booking_model import Booking
from app.schemas.booking_schema import BookingSchema
from app import db
from datetime import datetime
from marshmallow import ValidationError

booking_bp = Blueprint('bookings', __name__)
schema = BookingSchema()


def success_response(data=None, message="Success", status_code=200):
    return jsonify({"success": True, "message": message, "data": data}), status_code


def error_response(message="Error", status_code=400):
    return jsonify({"success": False, "message": message, "data": None}), status_code


def format_validation_errors(messages):
    formatted = []
    for field, errs in messages.items():
        for err in errs:
            formatted.append(f"- {err}")
    return "\n".join(formatted)


# ============================================================
# PUBLIC / USER ENDPOINTS
# ============================================================

@booking_bp.route('/', methods=['GET'])
def get_all_bookings():
    """
    Get All Bookings (with pagination, search, filter)
    ---
    tags:
      - Bookings
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: status
        in: query
        type: string
        enum: ["Pending", "Approved", "Rejected", "Completed", "all"]
      - name: search
        in: query
        type: string
    responses:
      200:
        description: Paginated list of bookings
    """
    from app.services.booking_service import get_bookings_paginated

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', None)
    search = request.args.get('search', None)

    result = get_bookings_paginated(page=page, per_page=per_page, status=status, search=search)
    return success_response(data=result, message="Daftar booking berhasil diambil.")


@booking_bp.route('/<int:id>', methods=['GET'])
def get_booking(id):
    """
    Get Booking Detail
    ---
    tags:
      - Bookings
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Booking detail
      404:
        description: Booking not found
    """
    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)
    return success_response(data=booking.to_dict(), message="Detail booking.")


@booking_bp.route('/verify-code', methods=['GET'])
def verify_booking_code():
    """
    Verify Booking by Code (for PIC/scanner)
    ---
    tags:
      - Bookings
    parameters:
      - name: code
        in: query
        type: string
        required: true
    responses:
      200:
        description: Booking found and verified
      404:
        description: Booking not found
    """
    code = request.args.get('code', '').strip().upper()
    if not code:
        return error_response("Kode booking tidak boleh kosong.", 400)

    booking = Booking.query.filter_by(booking_code=code).first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)

    return success_response(data=booking.to_dict(), message="Booking ditemukan.")


@booking_bp.route('/check-in', methods=['POST'])
def check_in_booking():
    """
    Check-In: PIC verifies student, hands over key.
    Status Approved → CheckedIn
    ---
    tags:
      - Bookings
    parameters:
      - name: body
        in: body
        schema:
          properties:
            booking_code:
              type: string
    responses:
      200:
        description: Check-in berhasil
      400:
        description: Status tidak valid untuk check-in
      404:
        description: Booking tidak ditemukan
    """
    data = request.get_json() or {}
    code = data.get('booking_code', '').strip().upper()
    if not code:
        return error_response("Kode booking tidak boleh kosong.", 400)

    booking = Booking.query.filter_by(booking_code=code).first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)

    if booking.status == 'CheckedIn':
        return error_response("Booking sudah di-check-in sebelumnya.", 400)
    if booking.status == 'Completed' or booking.status == 'Expired':
        return error_response("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
    if booking.status != 'Approved':
        return error_response(f"Check-in tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

    from datetime import datetime
    booking.status = 'CheckedIn'
    booking.checked_in_at = datetime.utcnow()
    db.session.commit()

    return success_response(data=booking.to_dict(), message="Check-in berhasil! Kunci dapat diserahkan.")


@booking_bp.route('/check-out', methods=['POST'])
def check_out_booking():
    """
    Check-Out: Student returns key. 
    Status CheckedIn → Completed, then Expired.
    ---
    tags:
      - Bookings
    parameters:
      - name: body
        in: body
        schema:
          properties:
            booking_code:
              type: string
    responses:
      200:
        description: Check-out berhasil
      400:
        description: Status tidak valid untuk check-out
      404:
        description: Booking tidak ditemukan
    """
    data = request.get_json() or {}
    code = data.get('booking_code', '').strip().upper()
    if not code:
        return error_response("Kode booking tidak boleh kosong.", 400)

    booking = Booking.query.filter_by(booking_code=code).first()
    if not booking:
        return error_response("Kode booking tidak ditemukan.", 404)

    if booking.status == 'Completed' or booking.status == 'Expired':
        return error_response("E-Pass sudah expired dan tidak bisa digunakan lagi.", 400)
    if booking.status != 'CheckedIn':
        return error_response(f"Check-out tidak bisa dilakukan. Status saat ini: {booking.status}.", 400)

    from datetime import datetime
    now = datetime.utcnow()
    booking.status = 'Completed'
    booking.checked_out_at = now
    booking.expired_at = now
    db.session.commit()

    return success_response(data=booking.to_dict(), message="Check-out berhasil! Kunci telah dikembalikan. E-Pass expired.")


@booking_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    """
    Get Current User's Bookings (with pagination)
    ---
    tags:
      - Bookings
    security:
      - Bearer: []
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: status
        in: query
        type: string
      - name: search
        in: query
        type: string
    responses:
      200:
        description: User's bookings
    """
    from app.services.booking_service import get_bookings_paginated
    from app.models.user_model import User

    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return error_response("User tidak ditemukan.", 404)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', None)
    search = request.args.get('search', None)

    result = get_bookings_paginated(
        page=page, per_page=per_page, status=status, search=search, user_id=user.id
    )
    return success_response(data=result, message="Daftar booking Anda.")


@booking_bp.route('/', methods=['POST'])
def create_booking():
    """
    Create New Booking (with overlap validation)
    ---
    tags:
      - Bookings
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [room_id, user_id, date, start_time, end_time, activity_name, organization, purpose]
          properties:
            room_id:
              type: integer
            user_id:
              type: integer
            nama_peminjam:
              type: string
            nim_nip:
              type: string
            program_studi:
              type: string
            email:
              type: string
            nomor_hp:
              type: string
            activity_name:
              type: string
            jenis_kegiatan:
              type: string
            organization:
              type: string
            participants:
              type: integer
            purpose:
              type: string
            deskripsi_kegiatan:
              type: string
            date:
              type: string
              format: date
            start_time:
              type: string
            end_time:
              type: string
            facilities:
              type: array
              items:
                type: string
    responses:
      201:
        description: Booking created
      400:
        description: Validation error or schedule conflict
    """
    from app.services.booking_service import create_booking as svc_create

    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return error_response(format_validation_errors(err.messages), 400)

    ok, result = svc_create(data)
    if not ok:
        return error_response(result, 400)

    return success_response(data=result.to_dict(), message="Booking berhasil dibuat.", status_code=201)


@booking_bp.route('/<int:id>', methods=['PUT'])
def update_booking(id):
    """
    Update Booking
    ---
    tags:
      - Bookings
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Booking updated
    """
    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    if booking.status not in ['Pending', 'Draft']:
        return error_response("Hanya booking Pending atau Draft yang bisa diubah.", 400)

    try:
        data = schema.load(request.json, partial=True)
    except ValidationError as err:
        return error_response(format_validation_errors(err.messages), 400)

    for key, value in data.items():
        if key != 'facilities':
            setattr(booking, key, value)

    db.session.commit()
    return success_response(data=booking.to_dict(), message="Booking berhasil diupdate.")


@booking_bp.route('/<int:id>', methods=['DELETE'])
def delete_booking(id):
    """
    Delete/Cancel Booking
    ---
    tags:
      - Bookings
    """
    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    db.session.delete(booking)
    db.session.commit()
    return success_response(message="Booking berhasil dihapus.")


# ============================================================
# ROOM AVAILABILITY
# ============================================================

@booking_bp.route('/room/<int:room_id>', methods=['GET'])
def get_room_bookings(room_id):
    """
    Get Bookings for Room on Date
    ---
    tags:
      - Bookings
    parameters:
      - name: room_id
        in: path
        type: integer
        required: true
      - name: date
        in: query
        type: string
        format: date
        required: true
    """
    date_str = request.args.get('date')
    if not date_str:
        return error_response("Parameter 'date' wajib diisi.", 400)

    from app.services.booking_service import get_room_availability
    result, err = get_room_availability(room_id, date_str)
    if err:
        return error_response(err, 400)

    return success_response(data=result, message="Data ketersediaan ruangan.")


@booking_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    """
    Get Bookings for Specific User
    ---
    tags:
      - Bookings
    """
    from app.services.booking_service import get_bookings_paginated

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', None)
    search = request.args.get('search', None)

    result = get_bookings_paginated(
        page=page, per_page=per_page, status=status, search=search, user_id=user_id
    )
    return success_response(data=result, message="Daftar booking user.")


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@booking_bp.route('/<int:id>/approve', methods=['PUT'])
def approve_booking(id):
    """
    Approve Booking (Admin)
    ---
    tags:
      - Admin
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        schema:
          type: object
          properties:
            notes:
              type: string
    responses:
      200:
        description: Booking approved + QR code generated
    """
    from app.services.booking_service import approve_booking as svc_approve

    notes = request.json.get('notes') if request.json else None
    ok, result = svc_approve(id, notes=notes)
    if not ok:
        return error_response(result, 400)

    return success_response(data=result.to_dict(), message="Booking berhasil di-approve. QR Code telah dibuat.")


@booking_bp.route('/<int:id>/reject', methods=['PUT'])
def reject_booking(id):
    """
    Reject Booking (Admin)
    ---
    tags:
      - Admin
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [notes]
          properties:
            notes:
              type: string
              description: Alasan penolakan
    responses:
      200:
        description: Booking rejected
    """
    from app.services.booking_service import reject_booking as svc_reject

    notes = request.json.get('notes') if request.json else None
    ok, result = svc_reject(id, notes=notes)
    if not ok:
        return error_response(result, 400)

    return success_response(data=result.to_dict(), message="Booking berhasil di-reject.")


@booking_bp.route('/<int:id>/status', methods=['PATCH'])
def update_status(id):
    """
    Update Booking Status (Legacy endpoint)
    ---
    tags:
      - Bookings
    """
    booking = Booking.query.get_or_404(id)
    new_status = request.json.get('status')
    if new_status not in ['Approved', 'Rejected', 'Cancelled', 'Completed']:
        return error_response("Status tidak valid.", 400)

    booking.status = new_status
    db.session.commit()
    return success_response(data=booking.to_dict(), message=f"Status diubah menjadi {new_status}.")


# ============================================================
# UPLOAD DOCUMENT
# ============================================================

@booking_bp.route('/<int:id>/upload-document', methods=['POST'])
def upload_document(id):
    """
    Upload Supporting Document for a Booking
    ---
    tags:
      - Bookings
    consumes:
      - multipart/form-data
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: file
        in: formData
        type: file
        required: true
        description: PDF, JPG, or PNG (max 5MB)
    responses:
      200:
        description: Document uploaded successfully
    """
    from app.services.upload_service import save_uploaded_file

    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    if 'file' not in request.files:
        return error_response("File tidak ditemukan dalam request.", 400)

    file = request.files['file']
    ok, result = save_uploaded_file(file)
    if not ok:
        return error_response(result, 400)

    booking.surat_file = result
    db.session.commit()

    return success_response(
        data={"surat_file": result, "booking": booking.to_dict()},
        message="Dokumen berhasil diupload."
    )


# ============================================================
# E-PASS & PDF
# ============================================================

@booking_bp.route('/<int:id>/epass', methods=['GET'])
def get_epass(id):
    """
    Get E-Pass Data for a Booking
    ---
    tags:
      - E-Pass
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: E-Pass data including QR code
    """
    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    epass_data = booking.to_dict()
    epass_data['is_valid'] = booking.status == 'Approved'

    return success_response(data=epass_data, message="Data E-Pass.")


@booking_bp.route('/<int:id>/download-pdf', methods=['GET'])
def download_pdf(id):
    """
    Download E-Pass PDF
    ---
    tags:
      - E-Pass
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: PDF file download
    """
    booking = Booking.query.get(id)
    if not booking:
        return error_response("Booking tidak ditemukan.", 404)

    from app.services.pdf_service import generate_epass_pdf
    pdf_buffer = generate_epass_pdf(booking)

    filename = f"epass_{booking.booking_code}.pdf"
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )


# ============================================================
# DASHBOARD STATS
# ============================================================

@booking_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Get Dashboard Statistics
    ---
    tags:
      - Dashboard
    parameters:
      - name: user_id
        in: query
        type: integer
        description: Optional - filter stats by user
    responses:
      200:
        description: Dashboard statistics
    """
    from app.services.booking_service import get_dashboard_stats as svc_stats

    user_id = request.args.get('user_id', None, type=int)
    result = svc_stats(user_id=user_id)
    return success_response(data=result, message="Statistik dashboard.")
