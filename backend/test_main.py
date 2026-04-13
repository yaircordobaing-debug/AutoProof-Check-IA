from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_report_endpoint_working():
    payload = {
        "trip_id": "TEST-123",
        "driver_name": "Test Driver",
        "vehicle_plate": "XYZ-999",
        "items": [
            {
                "id": "ia_fugas",
                "name": "Fugas",
                "status": "Cumple",
                "method": "IA-V",
                "observation": "Sin fugas",
                "detected_values": ""
            }
        ],
        "score": 100,
        "status": "APTO",
        "email": "test@example.com"
    }

    # As it attempts to write to disk in /reports, the test checks if that doesn't fail
    response = client.post("/v1/generate-report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["report_id"] == "TEST-123"
    assert "url" in data
