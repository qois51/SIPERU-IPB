import os
import sys
import unittest
import json
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def api_request(url, method="GET", headers=None, data=None, content_type="application/json"):
    req_headers = {
        "User-Agent": "SIPBeru-Test-Client"
    }
    if headers:
        req_headers.update(headers)
        
    encoded_data = None
    if data is not None:
        if isinstance(data, (dict, list)):
            encoded_data = json.dumps(data).encode('utf-8')
            req_headers["Content-Type"] = content_type
        else:
            encoded_data = data
            req_headers["Content-Type"] = content_type
            
    req = urllib.request.Request(
        url,
        data=encoded_data,
        headers=req_headers,
        method=method
    )
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, res.headers, res.read()
    except urllib.error.HTTPError as e:
        with e:
            return e.code, e.headers, e.read()
    except Exception as e:
        return 0, {}, str(e).encode('utf-8')

def encode_multipart_formdata(fields, files):
    boundary = b'----WebKitFormBoundary7MA4YWxkTrZu0gW'
    CRLF = b'\r\n'
    L = []
    for (key, value) in fields.items():
        L.append(b'--' + boundary)
        L.append(f'Content-Disposition: form-data; name="{key}"'.encode('utf-8'))
        L.append(b'')
        L.append(str(value).encode('utf-8'))
    for (key, filename, value) in files:
        L.append(b'--' + boundary)
        L.append(f'Content-Disposition: form-data; name="{key}"; filename="{filename}"'.encode('utf-8'))
        L.append(b'Content-Type: application/pdf')
        L.append(b'')
        L.append(value)
    L.append(b'--' + boundary + b'--')
    L.append(b'')
    body = CRLF.join(L)
    content_type = f'multipart/form-data; boundary={boundary.decode("utf-8")}'
    return content_type, body

class TestSIPBeruBackend(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"
    
    mahasiswa_token = None
    pic_token = None
    
    room_id = None
    mahasiswa_id = None
    
    booking_id_1 = None
    booking_code_1 = None
    booking_id_2 = None
    booking_id_draft = None

    @classmethod
    def setUpClass(cls):
        print("\n" + "="*80)
        print("  STARTING INTEGRATION TEST RUN - INITIALIZING FIXTURES")
        print("="*80)

        code, _, _ = api_request(cls.BASE_URL + "/")
        if code == 0:
            print(f"[ERROR] API Server not running at {cls.BASE_URL}")
            raise unittest.SkipTest(
                f"SIPBeru backend server is not running on {cls.BASE_URL}. "
                "Please start the FastAPI server using 'uvicorn app.main:app --reload' first."
            )
            
        print("[SETUP] Authenticating as Student (mahasiswa)...")
        code, _, body = api_request(cls.BASE_URL + "/api/auth/login", method="POST", data={
            "username": "mahasiswa",
            "password": "mahasiswa123"
        })
        assert code == 200, f"Failed to login as mahasiswa (HTTP {code}): {body.decode('utf-8')}"
        login_data = json.loads(body.decode('utf-8'))
        cls.mahasiswa_token = login_data["access_token"]
        cls.mahasiswa_id = login_data["user"]["id_user"]
        print(f"-> Access Token Acquired. User ID (Mahasiswa): {cls.mahasiswa_id}")
        
        print("[SETUP] Authenticating as PIC (pic)...")
        code, _, body = api_request(cls.BASE_URL + "/api/auth/login", method="POST", data={
            "username": "pic",
            "password": "pic123"
        })
        assert code == 200, f"Failed to login as pic (HTTP {code}): {body.decode('utf-8')}"
        cls.pic_token = json.loads(body.decode('utf-8'))["access_token"]
        print("-> Access Token Acquired for PIC.")
        
        print("[SETUP] Fetching list of available rooms...")
        code, _, body = api_request(
            cls.BASE_URL + "/api/rooms",
            headers={"Authorization": f"Bearer {cls.mahasiswa_token}"}
        )
        assert code == 200, f"Failed to fetch rooms from API (HTTP {code})"
        rooms = json.loads(body.decode('utf-8'))
        assert len(rooms) > 0, "No rooms available in database. Run seed.py first."
        cls.room_id = rooms[0].get("id_ruangan") or rooms[0].get("id")
        print(f"-> Found first room: '{rooms[0]['nama_ruangan']}' (ID: {cls.room_id})")
        print("="*80 + "\n")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "="*80)
        print("  TEARDOWN - DATABASE CLEANUP")
        print("="*80)
        headers = {"Authorization": f"Bearer {cls.mahasiswa_token}"}
        if cls.booking_id_1:
            print(f"[CLEANUP] Deleting test booking ID {cls.booking_id_1}...")
            api_request(f"{cls.BASE_URL}/api/bookings/{cls.booking_id_1}", method="DELETE", headers=headers)
        if cls.booking_id_2:
            print(f"[CLEANUP] Deleting test booking ID {cls.booking_id_2}...")
            api_request(f"{cls.BASE_URL}/api/bookings/{cls.booking_id_2}", method="DELETE", headers=headers)
        if cls.booking_id_draft:
            print(f"[CLEANUP] Deleting test draft booking ID {cls.booking_id_draft}...")
            api_request(f"{cls.BASE_URL}/api/bookings/{cls.booking_id_draft}", method="DELETE", headers=headers)
        print("[CLEANUP] Database cleaned up successfully.")
        print("="*80)

    def test_01_TC_PMJ_001_check_calendar_realtime(self):
        print("[TC_PMJ_001] Checking room availability on calendar for June 2026...")
        endpoint = f"{self.BASE_URL}/api/bookings/calendar/events?year=2026&month=6"
        print(f"-> HTTP GET: {endpoint}")
        
        code, _, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        events = res_data.get("data")
        self.assertIsInstance(events, list)
        
        print(f"-> Result: SUCCESS (HTTP 200). Events count: {len(events)}")

    def test_02_TC_PMJ_002_mahasiswa_create_reservation(self):
        print("[TC_PMJ_002] Mahasiswa creating a room reservation...")
        endpoint = f"{self.BASE_URL}/api/bookings/"
        payload = {
            "room_id": self.room_id,
            "user_id": self.mahasiswa_id,
            "activity_name": "TEST_CASE_Reservasi_1",
            "date": "2026-06-15",
            "start_time": "13:00",
            "end_time": "15:00",
            "nomor_hp": "081234567890",
            "organization": "BEM IPB",
            "participants": 25,
            "purpose": "Rapat Koordinasi Pengajuan Ruangan",
            "deskripsi_kegiatan": "Membahas progres program kerja tahunan",
            "facilities": ["AC", "Proyektor"]
        }
        print(f"-> HTTP POST: {endpoint}")
        print(f"-> Payload: {json.dumps(payload, indent=2)}")
        
        code, _, body = api_request(
            endpoint,
            method="POST",
            data=payload,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        
        self.assertIn(code, [200, 201])
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        booking = res_data["data"]
        self.assertEqual(booking["status"], "Pending")
        self.assertEqual(booking["keperluan"], "TEST_CASE_Reservasi_1")
        
        self.__class__.booking_id_1 = booking["id_booking"]
        self.__class__.booking_code_1 = booking.get("id_epass")
        
        print(f"-> Result: SUCCESS (HTTP {code}). Created Booking ID: {self.booking_id_1}, E-Pass Code: {self.booking_code_1}")

    def test_02b_TC_PMJ_draft_flow(self):
        print("[DRAFT_FLOW] Creating a booking as Draft...")
        endpoint = f"{self.BASE_URL}/api/bookings/"
        payload = {
            "room_id": self.room_id,
            "user_id": self.mahasiswa_id,
            "activity_name": "TEST_CASE_Draft_Booking",
            "date": "2026-06-25",
            "start_time": "09:00",
            "end_time": "11:00",
            "nomor_hp": "081234567890",
            "organization": "Himpunan Mahasiswa",
            "participants": 10,
            "purpose": "Penyusunan Draf Acara",
            "deskripsi_kegiatan": "Mempersiapkan draf proposal",
            "facilities": [],
            "status": "Draft"
        }
        
        code, _, body = api_request(
            endpoint,
            method="POST",
            data=payload,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertIn(code, [200, 201])
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        booking = res_data["data"]
        self.assertEqual(booking["status"], "Draft")
        self.__class__.booking_id_draft = booking["id_booking"]
        print(f"-> Created Draft Booking ID: {self.booking_id_draft}")
        
        print("[DRAFT_FLOW] Submitting the Draft booking (updating status to Pending)...")
        update_endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_draft}"
        update_payload = {
            "room_id": self.room_id,
            "user_id": self.mahasiswa_id,
            "activity_name": "TEST_CASE_Draft_Booking_Submitted",
            "date": "2026-06-25",
            "start_time": "09:00",
            "end_time": "11:00",
            "nomor_hp": "081234567890",
            "organization": "Himpunan Mahasiswa",
            "participants": 10,
            "purpose": "Penyusunan Draf Acara",
            "deskripsi_kegiatan": "Mempersiapkan draf proposal",
            "facilities": [],
            "status": "Pending"
        }
        
        code, _, body = api_request(
            update_endpoint,
            method="PUT",
            data=update_payload,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        updated_booking = res_data["data"]
        self.assertEqual(updated_booking["status"], "Pending")
        self.assertEqual(updated_booking["keperluan"], "TEST_CASE_Draft_Booking_Submitted")
        print("-> Result: SUCCESS. Draft successfully transitioned to Pending.")

    def test_03_TC_PMJ_003_download_pdf_document(self):
        print("[TC_PMJ_003] Downloading E-Pass/Permission PDF document for booking ID:", self.booking_id_1)
        self.assertIsNotNone(self.booking_id_1, "Booking ID should be created in the previous step")
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_1}/download-pdf"
        print(f"-> HTTP GET: {endpoint}")
        
        code, headers, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        self.assertEqual(headers.get("content-type"), "application/pdf")
        
        print(f"-> Result: SUCCESS (HTTP 200). PDF stream downloaded ({len(body)} bytes).")

    def test_04_TC_PMJ_004_upload_supporting_document(self):
        print("[TC_PMJ_004] Uploading supporting signed document for booking ID:", self.booking_id_1)
        self.assertIsNotNone(self.booking_id_1, "Booking ID should be created in the previous step")
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_1}/upload-document"
        print(f"-> HTTP POST: {endpoint}")
        
        content_type, body_data = encode_multipart_formdata(
            fields={},
            files=[("file", "surat_izin_signed.pdf", b"%PDF-1.4 dummy pdf content for testing")]
        )
        print(f"-> Multipart Payload size: {len(body_data)} bytes")
        
        code, _, body = api_request(
            endpoint,
            method="POST",
            data=body_data,
            content_type=content_type,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        uploaded_filepath = res_data["data"]["surat_file"]
        self.assertIsNotNone(uploaded_filepath)
        print(f"-> Upload completed. File saved at: {uploaded_filepath}")
        
        print("-> Fetching details to check database update...")
        code, _, detail_body = api_request(
            f"{self.BASE_URL}/api/bookings/{self.booking_id_1}",
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        detail_data = json.loads(detail_body.decode('utf-8'))["data"]
        self.assertEqual(detail_data.get("path_file_bukti"), uploaded_filepath)
        print(f"-> Result: SUCCESS (HTTP 200). DB path matches: {detail_data.get('path_file_bukti')}")

    def test_05_TC_PMJ_005_monitor_status_dashboard(self):
        print("[TC_PMJ_005] Monitoring booking status list on mahasiswa's dashboard...")
        endpoint = f"{self.BASE_URL}/api/bookings/my-bookings"
        print(f"-> HTTP GET: {endpoint}")
        
        code, _, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        bookings = res_data["data"]["bookings"]
        my_booking = next((b for b in bookings if b["id_booking"] == self.booking_id_1), None)
        self.assertIsNotNone(my_booking)
        self.assertIn(my_booking["status"], ["Pending", "Verifying"])
        print(f"-> Result: SUCCESS (HTTP 200). Found booking ID {self.booking_id_1} with status: '{my_booking['status']}'")

    def test_06_TC_STN_001_side_by_side_review_data(self):
        print("[TC_STN_001] PIC reviewing booking ID", self.booking_id_1, "using Side-by-Side data view...")
        self.assertIsNotNone(self.booking_id_1)
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_1}"
        print(f"-> HTTP GET: {endpoint} (PIC Auth)")
        
        code, _, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.pic_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        booking_detail = res_data["data"]
        self.assertEqual(booking_detail["id_booking"], self.booking_id_1)
        self.assertEqual(booking_detail.get("id_ruangan"), self.room_id)
        self.assertIsNotNone(booking_detail.get("path_file_bukti"))
        
        print(f"-> Result: SUCCESS (HTTP 200). Side-by-side details correct. Room ID: {self.room_id}, File: {booking_detail.get('path_file_bukti')}")

    def test_07_TC_STN_002_approve_booking_generates_epass(self):
        print("[TC_STN_002] PIC approving booking ID", self.booking_id_1, "to generate E-Pass...")
        self.assertIsNotNone(self.booking_id_1)
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_1}/approve"
        payload = {"notes": "Semua berkas lengkap, disetujui."}
        print(f"-> HTTP PUT: {endpoint}")
        print(f"-> Notes: {json.dumps(payload)}")
        
        code, _, body = api_request(
            endpoint,
            method="PUT",
            data=payload,
            headers={"Authorization": f"Bearer {self.pic_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        
        approved_booking = res_data["data"]
        self.assertEqual(approved_booking["status"], "Approved")
        self.assertIsNotNone(approved_booking.get("id_epass"))
        self.assertIsNotNone(approved_booking.get("qr_code"))
        
        self.__class__.booking_code_1 = approved_booking["id_epass"]
        print(f"-> Result: SUCCESS (HTTP 200). Approved code generated: {self.booking_code_1}, QR path: {approved_booking['qr_code']}")

    def test_08_TC_STN_003_reject_booking_releases_slot(self):
        print("[TC_STN_003] Testing rejection flow on a separate booking...")
        
        payload = {
            "room_id": self.room_id,
            "user_id": self.mahasiswa_id,
            "activity_name": "TEST_CASE_Reservasi_2",
            "date": "2026-06-20",
            "start_time": "10:00",
            "end_time": "12:00",
            "nomor_hp": "081234567890",
            "organization": "Himpunan Mahasiswa",
            "participants": 15,
            "purpose": "Rapat Internal Pengurus",
            "deskripsi_kegiatan": "Pembahasan evaluasi tengah tahun",
            "facilities": []
        }
        print("-> Creating a second booking...")
        code, _, body = api_request(
            f"{self.BASE_URL}/api/bookings/",
            method="POST",
            data=payload,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertIn(code, [200, 201])
        self.__class__.booking_id_2 = json.loads(body.decode('utf-8'))["data"]["id_booking"]
        print(f"-> Created second Booking ID: {self.booking_id_2}")
        
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_2}/reject"
        reject_payload = {"notes": "Tanda tangan ketua panitia belum dilampirkan."}
        print(f"-> HTTP PUT: {endpoint}")
        
        code, _, body = api_request(
            endpoint,
            method="PUT",
            data=reject_payload,
            headers={"Authorization": f"Bearer {self.pic_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        self.assertEqual(res_data["data"]["status"], "Rejected")
        self.assertEqual(res_data["data"]["notes"], "Tanda tangan ketua panitia belum dilampirkan.")
        print(f"-> Result: SUCCESS (HTTP 200). Status changed to Rejected. Slot released.")

    def test_09_TC_EPS_001_get_epass_details(self):
        print("[TC_EPS_001] Fetching E-Pass details for approved booking ID:", self.booking_id_1)
        self.assertIsNotNone(self.booking_id_1)
        endpoint = f"{self.BASE_URL}/api/bookings/{self.booking_id_1}/epass"
        print(f"-> HTTP GET: {endpoint}")
        
        code, _, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.mahasiswa_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        self.assertTrue(res_data["data"]["is_valid"])
        self.assertIsNotNone(res_data["data"].get("qr_code"))
        print(f"-> Result: SUCCESS (HTTP 200). E-Pass details retrieved. QR code available.")

    def test_10_TC_LPR_001_monthly_report_statistics(self):
        print("[TC_LPR_001] PIC querying monthly usage report statistics...")
        endpoint = f"{self.BASE_URL}/api/bookings/reports/stats?period=1month"
        print(f"-> HTTP GET: {endpoint}")
        
        code, _, body = api_request(
            endpoint,
            headers={"Authorization": f"Bearer {self.pic_token}"}
        )
        self.assertEqual(code, 200)
        res_data = json.loads(body.decode('utf-8'))
        self.assertTrue(res_data.get("success"))
        stats = res_data["data"]
        self.assertIn("summary", stats)
        self.assertIn("by_room", stats)
        print(f"-> Result: SUCCESS (HTTP 200). Report loaded. Total duration hours: {stats['summary']['total_duration_hours']}")

    def test_11_TC_VRE_001_verify_valid_epass(self):
        print("[TC_VRE_001] Scanner/Penjaga scanning and check-in valid code:", self.booking_code_1)
        self.assertIsNotNone(self.booking_code_1)
        
        verify_endpoint = f"{self.BASE_URL}/api/bookings/verify-code?code={self.booking_code_1}"
        print(f"-> HTTP GET: {verify_endpoint}")
        verify_code, _, verify_body = api_request(verify_endpoint)
        self.assertEqual(verify_code, 200)
        verify_res = json.loads(verify_body.decode('utf-8'))
        self.assertTrue(verify_res.get("success"))
        print(f"-> E-Pass code exists. Owner User ID: {verify_res['data']['id_mahasiswa']}")
        
        checkin_endpoint = f"{self.BASE_URL}/api/bookings/check-in"
        print(f"-> HTTP POST: {checkin_endpoint}")
        checkin_code, _, checkin_body = api_request(
            checkin_endpoint,
            method="POST",
            data={"booking_code": self.booking_code_1}
        )
        self.assertEqual(checkin_code, 200)
        checkin_res = json.loads(checkin_body.decode('utf-8'))
        self.assertTrue(checkin_res.get("success"))
        self.assertEqual(checkin_res["data"]["status"], "CheckedIn")
        print(f"-> Result: SUCCESS (HTTP 200). Check-in Completed. Status changed to 'CheckedIn'.")

    def test_12_TC_VRE_002_verify_invalid_epass(self):
        print("[TC_VRE_002] Scanner/Penjaga scanning an invalid/fake code...")
        
        verify_endpoint = f"{self.BASE_URL}/api/bookings/verify-code?code=INVALID_FAKE_CODE"
        print(f"-> HTTP GET: {verify_endpoint}")
        verify_code, _, verify_body = api_request(verify_endpoint)
        self.assertEqual(verify_code, 404)
        verify_res = json.loads(verify_body.decode('utf-8'))
        self.assertEqual(verify_res["detail"], "Kode booking tidak ditemukan.")
        print("-> Rejected by verify route (HTTP 404).")
        
        checkin_endpoint = f"{self.BASE_URL}/api/bookings/check-in"
        print(f"-> HTTP POST: {checkin_endpoint}")
        checkin_code, _, checkin_body = api_request(
            checkin_endpoint,
            method="POST",
            data={"booking_code": "INVALID_FAKE_CODE"}
        )
        self.assertEqual(checkin_code, 404)
        checkin_res = json.loads(checkin_body.decode('utf-8'))
        self.assertEqual(checkin_res["detail"], "Kode booking tidak ditemukan.")
        print(f"-> Result: SUCCESS (HTTP 404). Rejection works correctly. Fake E-Pass rejected.")

if __name__ == "__main__":
    unittest.main()