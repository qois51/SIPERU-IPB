import urllib.request
import urllib.error
import json
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_add_room():
    print("Logging in to get token...")
    # 1. Login as admin
    login_url = "http://127.0.0.1:8000/api/auth/login"
    login_data = json.dumps({
        "username": "admin",
        "password": "admin123"
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
            token = res_data.get("access_token")
    except Exception as e:
        print("Login failed:", e)
        return

    # 2. Add Room
    add_room_url = "http://127.0.0.1:8000/api/rooms/"
    room_payload = {
        "name": "Ruangan Rapat Baru",
        "location": "Gedung C Lantai 2",
        "capacity": 25,
        "operational_hours": "08:00 - 17:00",
        "facilities": "AC, Proyektor",
        "pic_name": "pic",
        "pic_email": "hendra@staff.sipberu.ac.id",
        "pic_phone": "08123456783",
        "price": 100000
    }
    
    print("Payload to send:", json.dumps(room_payload, indent=2))
    
    req_add = urllib.request.Request(
        add_room_url,
        data=json.dumps(room_payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_add) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("Add Room SUCCESS!")
            print("Response:", json.dumps(res_data, indent=2))
    except urllib.error.HTTPError as e:
        print("HTTP Error code:", e.code)
        print("HTTP Error response:", e.read().decode('utf-8'))
    except Exception as e:
        print("Error details:", e)

if __name__ == "__main__":
    test_add_room()
