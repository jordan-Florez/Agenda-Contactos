from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os

app = FastAPI()

# Inicialización automática de la base de datos y tabla
DB_PATH = "agenda_contactos.db"
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        empresa TEXT,
        cargo TEXT,
        telefono TEXT,
        nota TEXT
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# Permitir peticiones desde cualquier origen (frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Contacto(BaseModel):
    nombre: str
    apellido: str
    empresa: str = ""
    cargo: str = ""
    telefono: str = ""
    nota: str = ""

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
def read_root():
    return {"message": "¡API de Agenda-Contactos funcionando!"}

@app.get("/contactos")
def get_contactos():
    conn = get_db()
    cursor = conn.execute("SELECT * FROM contactos")
    contactos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return contactos

@app.post("/contactos")
def add_contacto(contacto: Contacto):
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO contactos (nombre, apellido, empresa, cargo, telefono, nota) VALUES (?, ?, ?, ?, ?, ?)",
        (contacto.nombre, contacto.apellido, contacto.empresa, contacto.cargo, contacto.telefono, contacto.nota)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, **contacto.dict()}

@app.get("/contactos/{contacto_id}")
def get_contacto(contacto_id: int):
    conn = get_db()
    cursor = conn.execute("SELECT * FROM contactos WHERE id = ?", (contacto_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    else:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")

@app.delete("/contactos/{contacto_id}")
def delete_contacto(contacto_id: int):
    conn = get_db()
    cursor = conn.execute("DELETE FROM contactos WHERE id = ?", (contacto_id,))
    conn.commit()
    conn.close()
    if cursor.rowcount:
        return {"ok": True}
    else:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
