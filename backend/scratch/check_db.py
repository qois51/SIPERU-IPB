import asyncio
from database import engine
from sqlalchemy import text

async def check():
    try:
        async with engine.connect() as conn:
            print("=== ROOMS ===")
            rooms = await conn.execute(text("SELECT id, name FROM rooms"))
            for r in rooms.fetchall():
                print(f"Room ID: {r[0]}, Name: {r[1]}")
                
            print("\n=== USERS ===")
            users = await conn.execute(text("SELECT id, username, role FROM users"))
            for u in users.fetchall():
                print(f"User ID: {u[0]}, Username: {u[1]}, Role: {u[2]}")

            print("\n=== BOOKINGS ===")
            bookings = await conn.execute(text("SELECT id, booking_code, room_id, user_id, date, start_time, end_time, status FROM bookings"))
            for b in bookings.fetchall():
                print(f"Booking ID: {b[0]}, Code: {b[1]}, RoomID: {b[2]}, UserID: {b[3]}, Date: {b[4]}, Time: {b[5]}-{b[6]}, Status: {b[7]}")
    except Exception as e:
        print("Error:", e)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
