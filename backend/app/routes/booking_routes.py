from flask import Blueprint, request, jsonify
from app.models.booking_model import Booking
from app.schemas.booking_schema import BookingSchema
from app import db
from datetime import datetime
from marshmallow import ValidationError

booking_bp = Blueprint('bookings', __name__)
schema = BookingSchema()

@booking_bp.route('/', methods=['GET'])
def get_all_bookings():
    """
    Get All Bookings
    ---
    tags:
      - Bookings
    summary: Retrieve all room bookings
    description: Mendapatkan daftar semua booking ruangan, terurut dari yang terbaru
    responses:
      200:
        description: List of all bookings
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              room_id:
                type: integer
              user_id:
                type: integer
              room_name:
                type: string
              user_name:
                type: string
              date:
                type: string
                format: date
              start_time:
                type: string
              end_time:
                type: string
              status:
                type: string
                enum: ["Pending", "Approved", "Rejected", "Cancelled"]
              activity_name:
                type: string
              organization:
                type: string
              participants:
                type: integer
              purpose:
                type: string
              document_url:
                type: string
              created_at:
                type: string
                format: date-time
    """
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200

@booking_bp.route('/', methods=['POST'])
def create_booking():
    """
    Create New Booking
    ---
    tags:
      - Bookings
    summary: Create a new room booking
    description: Membuat booking ruangan baru dengan status awal Pending
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - room_id
            - user_id
            - date
            - start_time
            - end_time
            - activity_name
            - organization
            - purpose
          properties:
            room_id:
              type: integer
              example: 1
            user_id:
              type: integer
              example: 1
            date:
              type: string
              format: date
              example: "2026-05-20"
            start_time:
              type: string
              example: "10:00"
              description: Format HH:MM
            end_time:
              type: string
              example: "12:00"
              description: Format HH:MM
            activity_name:
              type: string
              example: "Rapat Koordinasi"
            organization:
              type: string
              example: "Tim Teknologi"
            participants:
              type: integer
              example: 10
            purpose:
              type: string
              example: "Diskusi project terbaru"
            document_url:
              type: string
              nullable: true
              description: URL atau Base64 dokumen pendukung
    responses:
      201:
        description: Booking created successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            room_id:
              type: integer
            user_id:
              type: integer
            room_name:
              type: string
            user_name:
              type: string
            date:
              type: string
            start_time:
              type: string
            end_time:
              type: string
            status:
              type: string
              example: "Pending"
            activity_name:
              type: string
            organization:
              type: string
            participants:
              type: integer
            purpose:
              type: string
            created_at:
              type: string
      400:
        description: Bad request - validation error
    """
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Basic overlap check could go here
    new_booking = Booking(**data)
    db.session.add(new_booking)
    db.session.commit()
    return jsonify(new_booking.to_dict()), 201

@booking_bp.route('/room/<int:room_id>', methods=['GET'])
def get_room_bookings(room_id):
    """
    Get Bookings for Specific Room
    ---
    tags:
      - Bookings
    summary: Retrieve bookings for a room on a specific date
    description: Mendapatkan semua booking untuk ruangan tertentu pada tanggal tertentu
    parameters:
      - name: room_id
        in: path
        type: integer
        required: true
        description: Room ID
      - name: date
        in: query
        type: string
        format: date
        required: true
        example: "2026-05-20"
        description: Tanggal yang diinginkan (format YYYY-MM-DD)
    responses:
      200:
        description: List of bookings for the room on specified date
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              room_id:
                type: integer
              user_id:
                type: integer
              date:
                type: string
              start_time:
                type: string
              end_time:
                type: string
              status:
                type: string
              activity_name:
                type: string
      400:
        description: Bad request - date parameter required
    """
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"message": "Date parameter is required"}), 400
    
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    bookings = Booking.query.filter_by(room_id=room_id, date=date_obj).all()
    
    return jsonify([b.to_dict() for b in bookings]), 200

@booking_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    """
    Get Bookings for Specific User
    ---
    tags:
      - Bookings
    summary: Retrieve all bookings made by a user
    description: Mendapatkan semua booking yang dibuat oleh user tertentu
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: User ID
    responses:
      200:
        description: List of bookings made by the user
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              room_id:
                type: integer
              user_id:
                type: integer
              room_name:
                type: string
              user_name:
                type: string
              date:
                type: string
              start_time:
                type: string
              end_time:
                type: string
              status:
                type: string
              activity_name:
                type: string
              organization:
                type: string
              participants:
                type: integer
              purpose:
                type: string
              created_at:
                type: string
    """
    bookings = Booking.query.filter_by(user_id=user_id).all()
    return jsonify([b.to_dict() for b in bookings]), 200

@booking_bp.route('/<int:id>/status', methods=['PATCH'])
def update_status(id):
    """
    Update Booking Status
    ---
    tags:
      - Bookings
    summary: Update the status of a booking
    description: Mengubah status booking (Pending -> Approved/Rejected, atau Cancelled)
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: Booking ID
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - status
          properties:
            status:
              type: string
              enum: ["Approved", "Rejected", "Cancelled"]
              example: "Approved"
    responses:
      200:
        description: Booking status updated successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            room_id:
              type: integer
            user_id:
              type: integer
            room_name:
              type: string
            date:
              type: string
            status:
              type: string
            activity_name:
              type: string
            created_at:
              type: string
      400:
        description: Bad request - invalid status
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Invalid status"
      404:
        description: Booking not found
    """
    booking = Booking.query.get_or_404(id)
    new_status = request.json.get('status')
    if new_status not in ['Approved', 'Rejected', 'Cancelled']:
        return jsonify({"message": "Invalid status"}), 400
    
    booking.status = new_status
    db.session.commit()
    return jsonify(booking.to_dict()), 200

@booking_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Get Dashboard Statistics
    ---
    tags:
      - Dashboard
    summary: Retrieve counts for pending, active bookings and rooms
    description: Mendapatkan statistik ringkasan untuk dashboard admin
    responses:
      200:
        description: Dashboard statistics and upcoming activities
    """
    from app.models.room_model import Room
    
    pending_count = Booking.query.filter_by(status='Pending').count()
    active_count = Booking.query.filter_by(status='Approved').count()
    room_count = Room.query.count()
    
    # Upcoming activities (Approved bookings from today onwards)
    today = datetime.now().date()
    upcoming = Booking.query.filter(
        Booking.status == 'Approved',
        Booking.date >= today
    ).order_by(Booking.date.asc(), Booking.start_time.asc()).limit(5).all()
    
    return jsonify({
        "stats": {
            "pending": pending_count,
            "active": active_count,
            "total_rooms": room_count
        },
        "upcoming": [b.to_dict() for b in upcoming]
    }), 200
