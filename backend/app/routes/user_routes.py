from flask import Blueprint, request, jsonify
from app import db
from app.models.user_model import User
from app.schemas.user_schema import user_schema, users_schema
from marshmallow import ValidationError

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    """
    Get All Users
    ---
    tags:
      - Users
    summary: Retrieve all users
    description: Mendapatkan daftar semua user yang terdaftar di sistem
    responses:
      200:
        description: List of all users
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
                example: 1
              username:
                type: string
                example: "mahasiswa1"
              full_name:
                type: string
                example: "Budi Santoso"
              nim_nip:
                type: string
                example: "2024001"
              email:
                type: string
                example: "budi@email.com"
              role:
                type: string
                enum: ["mahasiswa", "admin", "satpam"]
                example: "mahasiswa"
              profile_image:
                type: string
                nullable: true
    """
    users = User.query.all()
    return jsonify(users_schema.dump(users)), 200

@user_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    """
    Get User by ID
    ---
    tags:
      - Users
    summary: Retrieve specific user details
    description: Mendapatkan detail user berdasarkan ID
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: User ID
    responses:
      200:
        description: User details
        schema:
          type: object
          properties:
            id:
              type: integer
            username:
              type: string
            full_name:
              type: string
            nim_nip:
              type: string
            email:
              type: string
            role:
              type: string
            profile_image:
              type: string
      404:
        description: User not found
    """
    user = User.query.get_or_404(id)
    return jsonify(user_schema.dump(user)), 200

@user_bp.route('/', methods=['POST'])
def create_user():
    """
    Create New User
    ---
    tags:
      - Users
    summary: Create a new user account
    description: Membuat user baru dengan role mahasiswa, admin, atau satpam
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
            - role
            - full_name
            - nim_nip
            - email
          properties:
            username:
              type: string
              example: "mahasiswa2"
              description: Unique username
            password:
              type: string
              example: "securepass123"
              description: User password (will be hashed)
            role:
              type: string
              enum: ["mahasiswa", "admin", "satpam"]
              example: "mahasiswa"
            full_name:
              type: string
              example: "Andi Wijaya"
            nim_nip:
              type: string
              example: "2024002"
            email:
              type: string
              example: "andi@email.com"
            profile_image:
              type: string
              nullable: true
              description: Base64 atau URL profil gambar
    responses:
      201:
        description: User created successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            username:
              type: string
            role:
              type: string
            full_name:
              type: string
            nim_nip:
              type: string
            email:
              type: string
      400:
        description: Bad request - username sudah ada atau data tidak lengkap
        schema:
          type: object
          properties:
            message:
              type: string
    """
    json_data = request.get_json()
    if not json_data:
        return jsonify({"message": "No input data provided"}), 400
    
    try:
        data = user_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username already exists"}), 400
    
    password = json_data.get('password')
    if not password:
        return jsonify({"message": "Password is required"}), 400

    new_user = User(
        username=data['username'],
        role=data['role'],
        full_name=data['full_name'],
        nim_nip=data['nim_nip'],
        email=data['email'],
        profile_image=data.get('profile_image')
    )
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(user_schema.dump(new_user)), 201

@user_bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    """
    Update User
    ---
    tags:
      - Users
    summary: Update user information
    description: Mengupdate data user (semua field optional)
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: User ID
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
              example: "mahasiswa_baru"
            password:
              type: string
              example: "newpass123"
              description: Password baru (optional)
            role:
              type: string
              enum: ["mahasiswa", "admin", "satpam"]
            full_name:
              type: string
            nim_nip:
              type: string
            email:
              type: string
            profile_image:
              type: string
              nullable: true
    responses:
      200:
        description: User updated successfully
        schema:
          type: object
          properties:
            id:
              type: integer
            username:
              type: string
            role:
              type: string
            full_name:
              type: string
            nim_nip:
              type: string
            email:
              type: string
      400:
        description: Bad request atau username sudah ada
      404:
        description: User not found
    """
    user = User.query.get_or_404(id)
    json_data = request.get_json()
    
    try:
        data = user_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Username already exists"}), 400
        user.username = data['username']
        
    if 'password' in json_data and json_data['password']:
        user.set_password(json_data['password'])
        
    user.role = data.get('role', user.role)
    user.full_name = data.get('full_name', user.full_name)
    user.nim_nip = data.get('nim_nip', user.nim_nip)
    user.email = data.get('email', user.email)
    user.profile_image = data.get('profile_image', user.profile_image)
    
    db.session.commit()
    return jsonify(user_schema.dump(user)), 200

@user_bp.route('/<int:id>', methods=['DELETE'])
def delete_user(id):
    """
    Delete User
    ---
    tags:
      - Users
    summary: Delete a user account
    description: Menghapus user dari sistem
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: User ID
    responses:
      200:
        description: User deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: "User deleted successfully"
      404:
        description: User not found
    """
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200
