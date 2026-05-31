from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
import ssl
from config import settings

connect_args = {}
if "supabase" in settings.db_host or "pooler" in settings.db_host:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=3,
    max_overflow=2
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
