import sqlite3

conn = sqlite3.connect('agenda_contactos.db')
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
print("Base de datos agenda_contactos.db creada correctamente.")
