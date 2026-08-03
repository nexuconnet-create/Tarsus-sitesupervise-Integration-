import requests
import time
import json
import uuid
import sys
import os

BASE_URL = "http://127.0.0.1:8000"
API_BASE_URL = f"{BASE_URL}/api/v1/scans"
AUTH_URL = f"{BASE_URL}/api/v1/auth/token/"

def authenticate(username, password):
    print(f"Authenticating as {username}...")
    try:
        response = requests.post(AUTH_URL, json={"username": username, "password": password})
        response.raise_for_status()
        token = response.json()["access"]
        print("Authentication successful.")
        return token
    except Exception as e:
        print(f"Authentication failed: {e}")
        print("Ensure the server is running and the user exists.")
        print("Run 'python manage.py createsuperuser' in the backend directory to create a test user.")
        sys.exit(1)

def run_mock_scanner(token):
    headers = {"Authorization": f"Bearer {token}"}
    print("--- Tersus MVP S1 Mock Scanner ---")
    project_id = str(uuid.uuid4())
    scanner_id = "TER-S1-001"
    
    # 1. Start Session
    print("\n1. Starting Scan Session...")
    session_payload = {
        "project_id": project_id,
        "scanner_id": scanner_id,
        "timestamp": "2026-08-01T12:00:00Z",
        "sensors_used": ["lidar", "rgb", "thermal", "rtk_gps"],
        "expected_size_mb": 1500
    }
    try:
        response = requests.post(f"{API_BASE_URL}/session/", json=session_payload, headers=headers)
        response.raise_for_status()
        session_data = response.json()
        session_id = session_data["session_id"]
        upload_url = session_data["upload_url"]
        print(f"Session started successfully. ID: {session_id}")
        print(f"Target upload URL: {upload_url}")
    except Exception as e:
        print(f"Failed to start session: {e}")
        if response is not None:
            print(response.text)
        return

    time.sleep(1)
    
    # 2. Submit Metadata
    print("\n2. Submitting Metadata...")
    metadata_payload = {
        "location": {
            "latitude": 45.123,
            "longitude": -75.123,
            "elevation": 12.5
        },
        "operator_id": "OP-99",
        "notes": "Test scan for integration"
    }
    try:
        response = requests.post(f"{API_BASE_URL}/{session_id}/metadata/", json=metadata_payload, headers=headers)
        response.raise_for_status()
        print("Metadata submitted successfully.")
    except Exception as e:
        print(f"Failed to submit metadata: {e}")
        return

    time.sleep(1)

    # 3. Simulate Upload
    print("\n3. Simulating data upload to S3...")
    for i in range(1, 4):
        print(f"Uploading chunk {i}/3...")
        time.sleep(0.5)
    print("Upload complete.")

    time.sleep(1)

    # 4. Finalize
    print("\n4. Finalizing upload...")
    try:
        response = requests.post(f"{API_BASE_URL}/{session_id}/finalize/", headers=headers)
        response.raise_for_status()
        print(f"Finalize response: {response.json()}")
    except Exception as e:
        print(f"Failed to finalize: {e}")

if __name__ == "__main__":
    username = os.environ.get("SCANNER_USER", "admin")
    password = os.environ.get("SCANNER_PASS", "admin")
    token = authenticate(username, password)
    run_mock_scanner(token)
