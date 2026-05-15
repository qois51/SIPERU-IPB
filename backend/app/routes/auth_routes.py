from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.schemas.auth_schema import LoginSchema
from app.models.user_model import User
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User Login
    ---
    tags:
      - Authentication
    summary: Authenticate user and get JWT token
    description: Login dengan username dan password untuk mendapatkan access token
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: "mahasiswa1"
            password:
              type: string
              example: "password123"
    responses:
      200:
        description: Login berhasil
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Login Berhasil"
            access_token:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            role:
              type: string
              example: "mahasiswa"
            user:
              type: object
              properties:
                id:
                  type: integer
                username:
                  type: string
                full_name:
                  type: string
                email:
                  type: string
                nim_nip:
                  type: string
                role:
                  type: string
      400:
        description: Validation error - data tidak lengkap atau format salah
        schema:
          type: object
          properties:
            message:
              type: string
      401:
        description: Unauthorized - username atau password salah
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Username atau Password salah"
    """
    schema = LoginSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity={"username": username, "role": user.role})
        from app.schemas.user_schema import user_schema
        return jsonify(
            message="Login Berhasil",
            access_token=access_token,
            role=user.role,
            user=user_schema.dump(user)
        ), 200

    return jsonify({"message": "Username atau Password salah"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get Current User Profile
    ---
    tags:
      - Authentication
    summary: Retrieve current logged-in user profile
    description: Dapatkan profil user yang sedang login (memerlukan JWT token)
    security:
      - Bearer: []
    responses:
      200:
        description: User profile data
        schema:
          type: object
          properties:
            logged_in_as:
              type: object
              properties:
                username:
                  type: string
                  example: "mahasiswa1"
                role:
                  type: string
                  example: "mahasiswa"
      401:
        description: Unauthorized - token tidak valid atau expired
    """
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
