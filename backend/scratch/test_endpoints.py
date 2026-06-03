import urllib.request
import json

def test_api():
    print("Testing locally running API on port 8000...")
    
    # 1. Test Login
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_data = json.dumps({
        "username": "mahasiswa",
        "password": "mahasiswa123"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        login_url,
        data=login_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("Login SUCCESS!")
            print("User Object in Response:", json.dumps(res_data.get("user"), indent=2))
            token = res_data.get("access_token")
    except Exception as e:
        print("Login FAILED:", e)
        return

    # 2. Test Get Rooms
    rooms_url = "http://127.0.0.1:8000/api/rooms"
    req_rooms = urllib.request.Request(
        rooms_url,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        method="GET"
    )
    
    try:
        with urllib.request.urlopen(req_rooms) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("\nGet Rooms SUCCESS!")
            print(f"Total Rooms: {len(res_data)}")
            print("First Room Details:", json.dumps(res_data[0], indent=2))
    except Exception as e:
        print("Get Rooms FAILED:", e)

    # 3. Test Get Bookings
    bookings_url = "http://127.0.0.1:8000/api/bookings"
    req_bookings = urllib.request.Request(
        bookings_url,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        method="GET"
    )
    
    try:
        with urllib.request.urlopen(req_bookings) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("\nGet Bookings SUCCESS!")
            print("Bookings count:", len(res_data.get("data", {}).get("bookings", [])))
            print("First Booking details:", json.dumps(res_data.get("data", {}).get("bookings", [])[0], indent=2))
    except Exception as e:
        print("Get Bookings FAILED:", e)

if __name__ == "__main__":
    test_api()
