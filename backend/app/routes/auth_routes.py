from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.schemas.auth_schema import LoginSchema
from app.models.user_model import User
from marshmallow import ValidationError
import random, time

auth_bp = Blueprint('auth', __name__)

# In-memory OTP store: { email: { otp, expires_at } }
_otp_store = {}


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User Login
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [username, password]
          properties:
            username:
              type: string
            password:
              type: string
            role:
              type: string
              description: Role yang dipilih user di form login
    responses:
      200:
        description: Login berhasil
      401:
        description: Credentials atau role tidak cocok
    """
    schema = LoginSchema()
    try:
        data = schema.load(request.json or {})
    except ValidationError as err:
        return jsonify(err.messages), 400

    username = data['username']
    password = data['password']
    selected_role = (request.json or {}).get('role', '').strip()

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Username atau Password salah"}), 401

    # Role enforcement: if user selected a role, it must match their actual role
    if selected_role and user.role != selected_role:
        return jsonify({"message": "Username atau Password salah"}), 401

    access_token = create_access_token(identity=username, additional_claims={"role": user.role})
    from app.schemas.user_schema import user_schema
    return jsonify(
        message="Login Berhasil",
        access_token=access_token,
        role=user.role,
        user=user_schema.dump(user)
    ), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Forgot Password — Send OTP to email
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [email]
          properties:
            email:
              type: string
    responses:
      200:
        description: OTP dikirim ke email
      404:
        description: Email tidak ditemukan
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({"message": "Email wajib diisi"}), 400

    user = User.query.filter(User.email.ilike(email)).first()
    if not user:
        return jsonify({"message": "Email tidak terdaftar di sistem"}), 404

    otp = str(random.randint(100000, 999999))
    _otp_store[email] = {"otp": otp, "expires_at": time.time() + 600}  # 10 menit

    # In production: kirim email via SMTP/SendGrid
    # Untuk development: log ke konsol
    print(f"[DEV] OTP untuk {email}: {otp}")

    return jsonify({
        "message": f"Kode OTP telah dikirim ke {email}. Berlaku 10 menit.",
        "dev_otp": otp  # Hapus di production
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset Password using OTP
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [email, otp, new_password]
          properties:
            email:
              type: string
            otp:
              type: string
            new_password:
              type: string
    responses:
      200:
        description: Password berhasil diubah
      400:
        description: OTP salah atau kadaluarsa
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()
    new_password = data.get('new_password', '').strip()

    if not email or not otp or not new_password:
        return jsonify({"message": "Email, OTP, dan password baru wajib diisi"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "Password baru minimal 6 karakter"}), 400

    stored = _otp_store.get(email)
    if not stored:
        return jsonify({"message": "OTP tidak ditemukan. Silakan minta OTP baru."}), 400

    if time.time() > stored['expires_at']:
        del _otp_store[email]
        return jsonify({"message": "OTP sudah kadaluarsa. Silakan minta OTP baru."}), 400

    if stored['otp'] != otp:
        return jsonify({"message": "Kode OTP salah"}), 400

    user = User.query.filter(User.email.ilike(email)).first()
    if not user:
        return jsonify({"message": "User tidak ditemukan"}), 404

    user.set_password(new_password)
    from app import db
    db.session.commit()
    del _otp_store[email]

    return jsonify({"message": "Password berhasil diubah! Silakan login dengan password baru."}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get Current User Profile
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: User profile data
    """
    from flask_jwt_extended import get_jwt
    current_user = get_jwt_identity()
    claims = get_jwt()
    return jsonify(logged_in_as={"username": current_user, "role": claims.get("role")}), 200

