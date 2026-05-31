import asyncio
from database import engine
from sqlalchemy import text

async def migrate():
    try:
        print("Connecting to database...")
        async with engine.connect() as conn:
            print("Successfully connected!")
            
            # Add phone column if not exists
            print("Adding 'phone' column to 'users' table...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)"))
            
            # Add bio column if not exists
            print("Adding 'bio' column to 'users' table...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
            
            # Commit changes
            await conn.commit()
            print("Migration completed successfully! Added 'phone' and 'bio' columns to 'users' table.")
            
    except Exception as e:
        print("Error during migration:", str(e))
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
