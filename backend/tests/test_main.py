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
    """Prueba del endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "¡API de Agenda-Contactos funcionando!"

def test_get_contactos_empty():
    """Prueba obtener contactos cuando la base de datos está vacía o tiene datos"""
    response = client.get("/contactos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_contacto():
    """Prueba crear un nuevo contacto"""
    new_contact = {
        "nombre": "Juan",
        "apellido": "Pérez",
        "empresa": "Tech Corp",
        "cargo": "Developer",
        "telefono": "1234567890",
        "nota": "Contacto de prueba"
    }
    response = client.post("/contactos", json=new_contact)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["nombre"] == "Juan"
    assert data["apellido"] == "Pérez"
    return data["id"]  # Retornar ID para otras pruebas

def test_get_contacto_by_id():
    """Prueba obtener un contacto específico por ID"""
    # Primero crear un contacto
    new_contact = {
        "nombre": "María",
        "apellido": "García",
        "empresa": "Design Studio",
        "cargo": "Designer",
        "telefono": "9876543210",
        "nota": "Contacto de prueba 2"
    }
    create_response = client.post("/contactos", json=new_contact)
    contact_id = create_response.json()["id"]
    
    # Ahora obtener el contacto
    response = client.get(f"/contactos/{contact_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "María"
    assert data["apellido"] == "García"

def test_get_contacto_not_found():
    """Prueba obtener un contacto que no existe"""
    response = client.get("/contactos/99999")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_update_contacto():
    """Prueba actualizar un contacto existente"""
    # Crear contacto
    new_contact = {
        "nombre": "Carlos",
        "apellido": "López",
        "empresa": "Marketing Inc",
        "cargo": "Manager",
        "telefono": "5551234567",
        "nota": "Contacto inicial"
    }
    create_response = client.post("/contactos", json=new_contact)
    contact_id = create_response.json()["id"]
    
    # Actualizar contacto
    updated_contact = {
        "nombre": "Carlos",
        "apellido": "López",
        "empresa": "Marketing Inc",
        "cargo": "Senior Manager",
        "telefono": "5551234567",
        "nota": "Contacto actualizado"
    }
    response = client.put(f"/contactos/{contact_id}", json=updated_contact)
    assert response.status_code == 200
    data = response.json()
    assert data["cargo"] == "Senior Manager"
    assert data["nota"] == "Contacto actualizado"

def test_update_contacto_not_found():
    """Prueba actualizar un contacto que no existe"""
    updated_contact = {
        "nombre": "Test",
        "apellido": "User",
        "empresa": "",
        "cargo": "",
        "telefono": "",
        "nota": ""
    }
    response = client.put("/contactos/99999", json=updated_contact)
    assert response.status_code == 404

def test_delete_contacto():
    """Prueba eliminar un contacto existente"""
    # Crear contacto
    new_contact = {
        "nombre": "Ana",
        "apellido": "Martínez",
        "empresa": "Sales Corp",
        "cargo": "Sales Rep",
        "telefono": "5559876543",
        "nota": "Para eliminar"
    }
    create_response = client.post("/contactos", json=new_contact)
    contact_id = create_response.json()["id"]
    
    # Eliminar contacto
    response = client.delete(f"/contactos/{contact_id}")
    assert response.status_code == 200
    assert response.json()["ok"] == True
    
    # Verificar que ya no existe
    get_response = client.get(f"/contactos/{contact_id}")
    assert get_response.status_code == 404

def test_delete_contacto_not_found():
    """Prueba eliminar un contacto que no existe"""
    response = client.delete("/contactos/99999")
    assert response.status_code == 404
    assert "detail" in response.json()