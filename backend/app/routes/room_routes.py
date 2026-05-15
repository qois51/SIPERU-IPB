from flask import Blueprint, request, jsonify
from app.models.room_model import Room
from app.schemas.room_schema import RoomSchema
from app import db
from marshmallow import ValidationError

room_bp = Blueprint('rooms', __name__)
schema = RoomSchema()

@room_bp.route('/', methods=['GET'])
def get_rooms():
    """
    Get All Rooms
    ---
    tags:
      - Rooms
    summary: Retrieve all available rooms
    description: Mendapatkan daftar semua ruangan yang tersedia di sistem
    responses:
      200:
        description: List of all rooms
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              name:
                type: string
              location:
                type: string
              capacity:
                type: integer
              operational_hours:
                type: string
              facilities:
                type: array
                items:
                  type: string
              pic_name:
                type: string
              pic_email:
                type: string
              pic_phone:
                type: string
              image_url:
                type: array
                items:
                  type: string
              pic_image_url:
                type: string
    """
    rooms = Room.query.all()
    return jsonify([room.to_dict() for room in rooms]), 200

@room_bp.route('/<int:id>', methods=['GET'])
def get_room(id):
    """
    Get Room by ID
    ---
    tags:
      - Rooms
    summary: Retrieve specific room details
    description: Mendapatkan detail ruangan berdasarkan ID
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: Room ID
    responses:
      200:
        description: Room details
        schema:
          type: object
          properties:
            id:
              type: integer
            name:
              type: string
            location:
              type: string
            capacity:
              type: integer
            operational_hours:
              type: string
            facilities:
              type: array
              items:
                type: string
            pic_name:
              type: string
            pic_email:
              type: string
            pic_phone:
              type: string
            image_url:
              type: array
              items:
                type: string
            pic_image_url:
              type: string
      404:
        description: Room not found
    """
    room = Room.query.get_or_404(id)
    return jsonify(room.to_dict()), 200

@room_bp.route('/', methods=['POST'])
def create_room():
    """
    Create New Room
    ---
    tags:
      - Rooms
    summary: Create a new room
    description: Membuat ruangan baru dalam sistem
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - name
            - location
            - capacity
            - operational_hours
            - facilities
            - pic_name
            - pic_email
            - pic_phone
          properties:
            name:
              type: string
              example: "Ruang Meeting A"
            location:
              type: string
              example: "Gedung A, Lantai 2"
            capacity:
              type: integer
              example: 20
            operational_hours:
              type: string
              example: "08:00 - 17:00"
            facilities:
              type: string
              example: "Projector,WhiteBoard,AC"
              description: Fasilitas dipisahkan dengan koma
            pic_name:
              type: string
              example: "Siti Nurhaliza"
            pic_email:
              type: string
              example: "siti@email.com"
            pic_phone:
              type: string
              example: "081234567890"
            image_url:
              type: string
              nullable: true
              description: URL atau Base64 gambar ruangan
            pic_image_url:
              type: string
              nullable: true
              description: URL atau Base64 foto PIC
    responses:
      201:
        description: Room created successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            name:
              type: string
            location:
              type: string
            capacity:
              type: integer
            operational_hours:
              type: string
            facilities:
              type: array
              items:
                type: string
      400:
        description: Bad request - validation error
    """
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        print(f"Validation Error: {err.messages}")
        return jsonify(err.messages), 400

    new_room = Room(**data)
    db.session.add(new_room)
    db.session.commit()
    return jsonify(new_room.to_dict()), 201

@room_bp.route('/<int:id>', methods=['PUT'])
def update_room(id):
    """
    Update Room
    ---
    tags:
      - Rooms
    summary: Update room information
    description: Mengupdate data ruangan (semua field optional)
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: Room ID
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            location:
              type: string
            capacity:
              type: integer
            operational_hours:
              type: string
            facilities:
              type: string
            pic_name:
              type: string
            pic_email:
              type: string
            pic_phone:
              type: string
            image_url:
              type: string
            pic_image_url:
              type: string
    responses:
      200:
        description: Room updated successfully
      400:
        description: Bad request - validation error
      404:
        description: Room not found
    """
    room = Room.query.get_or_404(id)
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        print(f"Validation Error: {err.messages}")
        return jsonify(err.messages), 400

    for key, value in data.items():
        setattr(room, key, value)
    
    db.session.commit()
    return jsonify(room.to_dict()), 200

@room_bp.route('/<int:id>', methods=['DELETE'])
def delete_room(id):
    """
    Delete Room
    ---
    tags:
      - Rooms
    summary: Delete a room
    description: Menghapus ruangan dari sistem
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: Room ID
    responses:
      200:
        description: Room deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Room deleted"
      404:
        description: Room not found
    """
    room = Room.query.get_or_404(id)
    db.session.delete(room)
    db.session.commit()
    return jsonify({"message": "Room deleted"}), 200
