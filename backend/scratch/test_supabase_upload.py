import os
import sys
import urllib.request
import urllib.error
import json

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings

def test_upload():
    print("=== SUPABASE UPLOAD TEST ===")
    supabase_url = settings.supabase_url
    supabase_key = settings.supabase_key
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase URL or Key is missing from settings.")
        return
        
    url = supabase_url.rstrip('/')
    safe_name = "test_connection_file.pdf"
    upload_url = f"{url}/storage/v1/object/documents/{safe_name}"
    
    print(f"Target URL: {upload_url}")
    print(f"Using Key: {supabase_key[:15]}...")
    
    # Dummy file bytes (just some plain text bytes representing a PDF)
    file_bytes = b"%PDF-1.4 test dummy data"
    
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "apikey": supabase_key,
        "Content-Type": "application/pdf"
    }
    
    req = urllib.request.Request(
        upload_url,
        data=file_bytes,
        headers=headers,
        method="POST"
    )
    
    try:
        print("Sending POST request to Supabase Storage API...")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            print("Upload Success!")
            print("Response Body:", res_body)
            print("Public URL:", f"{url}/storage/v1/object/public/documents/{safe_name}")
    except urllib.error.HTTPError as e:
        print(f"\n[HTTP Error] Status Code: {e.code}")
        try:
            error_body = e.read().decode('utf-8')
            print("Response Body:", error_body)
        except Exception as read_err:
            print("Failed to read error body:", read_err)
    except Exception as e:
        print("\n[Unexpected Error]:", e)

if __name__ == "__main__":
    test_upload()
