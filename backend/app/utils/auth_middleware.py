from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_jwt_identity()
            if user['role'] not in roles:
                return jsonify(message="Akses ditolak! Role tidak sesuai."), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
