import asyncio
from database import engine, Base
from app.models.help_model import HelpRequest

async def create_table():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_table())
