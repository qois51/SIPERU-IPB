from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import settings

# Create async engine
engine = create_async_engine(settings.database_url, echo=True)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# Dependency untuk FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
