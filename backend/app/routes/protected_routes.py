from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth_middleware import role_required

protected_bp = Blueprint('protected', __name__)

@protected_bp.route('/mahasiswa', methods=['GET'])
@jwt_required()
@role_required(['mahasiswa', 'admin'])
def mahasiswa_only():
    """
    Mahasiswa Only Endpoint
    ---
    tags:
      - Protected
    summary: Access mahasiswa-only resource
    description: Endpoint yang hanya dapat diakses oleh mahasiswa atau admin
    security:
      - Bearer: []
    responses:
      200:
        description: Access granted
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Halo Mahasiswa!"
      401:
        description: Unauthorized - token tidak valid
      403:
        description: Forbidden - role tidak memiliki akses
    """
    return jsonify(message="Halo Mahasiswa!")

@protected_bp.route('/admin', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def admin_only():
    """
    Admin Only Endpoint
    ---
    tags:
      - Protected
    summary: Access admin-only resource
    description: Endpoint yang hanya dapat diakses oleh admin
    security:
      - Bearer: []
    responses:
      200:
        description: Access granted
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Halo Admin! Anda punya akses penuh."
      401:
        description: Unauthorized - token tidak valid
      403:
        description: Forbidden - hanya admin yang dapat mengakses
    """
    return jsonify(message="Halo Admin! Anda punya akses penuh.")

@protected_bp.route('/satpam', methods=['GET'])
@jwt_required()
@role_required(['satpam', 'admin'])
def satpam_only():
    """
    Satpam Only Endpoint
    ---
    tags:
      - Protected
    summary: Access satpam-only resource
    description: Endpoint yang hanya dapat diakses oleh satpam atau admin
    security:
      - Bearer: []
    responses:
      200:
        description: Access granted
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Halo Satpam! Laporan keamanan hari ini?"
      401:
        description: Unauthorized - token tidak valid
      403:
        description: Forbidden - role tidak memiliki akses
    """
    return jsonify(message="Halo Satpam! Laporan keamanan hari ini?")
