import asyncio
from database import engine
from sqlalchemy import text

async def test():
    try:
        print("Connecting to:", engine.url)
        async with engine.connect() as conn:
            print("Successfully connected!")
            result = await conn.execute(text("SELECT id, username, password_hash, role FROM users"))
            rows = result.fetchall()
            print("Total users in database:", len(rows))
            for row in rows:
                print(f"ID: {row[0]}, Username: {row[1]}, Hash: {repr(row[2])}, Role: {row[3]}")
    except Exception as e:
        print("Error details:", str(e))
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
