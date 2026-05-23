from app.main import app
import uvicorn
import os

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))
    if "PORT" in os.environ:
        host = "0.0.0.0"
    uvicorn.run("app:app", host=host, port=port, reload=("PORT" not in os.environ))
