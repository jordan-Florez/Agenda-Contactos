# tests/test_main.py
import sys
import os
import pytest

# Añadir la carpeta /app al path para que Python encuentre main.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
