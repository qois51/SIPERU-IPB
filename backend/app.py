from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

class MessageResponse(BaseModel):
    message: str

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="FastAPI backend is running")

@app.get("/api/message", response_model=MessageResponse)
async def message():
    return MessageResponse(message="Hello from FastAPI backend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
