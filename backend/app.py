from flask import Flask, jsonify
from flask_cors import CORS


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok", "message": "Flask backend is running"})

    @app.get("/api/message")
    def message():
        return jsonify({"message": "Hello from Flask backend"})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
