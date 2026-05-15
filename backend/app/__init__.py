from flask import Flask
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_cors import CORS
from config import Config

jwt = JWTManager()
ma = Marshmallow()
db = SQLAlchemy()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure Swagger
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/",
        "title": "Room Management API",
        "description": "API untuk manajemen booking ruangan dengan sistem role-based access",
        "version": "1.0.0",
        "termsOfService": "",
        "contact": {
            "email": "support@example.com"
        },
        "license": {
            "name": "MIT"
        }
    }
    
    swagger = Swagger(app, config=swagger_config)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.protected_routes import protected_bp
    from app.routes.room_routes import room_bp
    from app.routes.booking_routes import booking_bp
    from app.routes.user_routes import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(protected_bp, url_prefix='/api/data')
    app.register_blueprint(room_bp, url_prefix='/api/rooms')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(user_bp, url_prefix='/api/users')

    @app.route('/')
    def index():
        return {"message": "Server is running", "docs": "/apidocs/"}

    return app
