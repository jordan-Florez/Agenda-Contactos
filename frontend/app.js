// Variables globales
let db;
const STORAGE_KEY = 'libreta_contactos_db_b64';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function escapeHtml(s) { 
  return String(s || '').replace(/[&<>"]|'/g, c => 
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[c]
  ); 
}

function saveDbToLocalStorage() {
  const data = db.export();
  const b64 = arrayBufferToBase64(data);
  localStorage.setItem(STORAGE_KEY, b64);
}

function loadDbFromLocalStorage() {
  const b64 = localStorage.getItem(STORAGE_KEY);
  if (!b64) return false;
  const u8 = base64ToUint8Array(b64);
  db = new SQL.Database(u8);
  return true;
}

function initializeDatabase(SQLLib) {
  window.SQL = SQLLib;
  const loaded = (function() {
    const b64 = localStorage.getItem(STORAGE_KEY);
    if (!b64) return false;
    try { 
      db = new SQLLib.Database(base64ToUint8Array(b64)); 
      return true; 
    } catch(e) { 
      console.warn('No se pudo cargar DB desde localStorage', e); 
      return false; 
    }
  })();
  if (!loaded) {
    db = new SQLLib.Database();
    db.run(`CREATE TABLE IF NOT EXISTS contactos (
      idContacto INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      empresa TEXT,
      cargo TEXT,
      telefono TEXT,
      nota TEXT,
      fechaCreacion TEXT
    );`);
    saveDbToLocalStorage();
  }
  renderContactos();
}

function renderContactos() {
  if (!db) return;
  const tbody = document.querySelector('#tablaContactos tbody');
  const res = db.exec('SELECT idContacto, nombre, apellido, empresa, cargo, telefono, nota, fechaCreacion FROM contactos ORDER BY fechaCreacion DESC');
  tbody.innerHTML = '';
  if (res.length === 0) return;
  const rows = res[0].values;
  rows.forEach(row => {
    const [id, nombre, apellido, empresa, cargo, telefono, nota, fechaCreacion] = row;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(nombre)}</td>
      <td>${escapeHtml(apellido)}</td>
      <td>${escapeHtml(empresa || '')}</td>
      <td>${escapeHtml(cargo || '')}</td>
      <td>${escapeHtml(telefono || '')}</td>
      <td>${escapeHtml(nota || '')}</td>
      <td>${escapeHtml(fechaCreacion || '')}</td>
      <td>
        <button class="small-btn edit" data-id="${id}">Editar</button>
        <button class="small-btn del" data-id="${id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarContacto(id) {
  const res = db.exec('SELECT idContacto, nombre, apellido, empresa, cargo, telefono, nota FROM contactos WHERE idContacto = ?', [id]);
  if (!res || res.length === 0) return alert('Contacto no encontrado');
  const row = res[0].values[0];
  const [nid, nombre, apellido, empresa, cargo, telefono, nota] = row;
  document.getElementById('idContacto').value = nid;
  document.getElementById('nombre').value = nombre;
  document.getElementById('apellido').value = apellido;
  document.getElementById('empresa').value = empresa || '';
  document.getElementById('cargo').value = cargo || '';
  document.getElementById('telefono').value = telefono || '';
  document.getElementById('nota').value = nota || '';
}

function eliminarContacto(id) {
  if (!confirm('¿Eliminar contacto?')) return;
  db.run('DELETE FROM contactos WHERE idContacto = ?', [id]);
  saveDbToLocalStorage();
  renderContactos();
}

function guardarContacto(event) {
  event.preventDefault();
  const id = document.getElementById('idContacto').value;
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const empresa = document.getElementById('empresa').value.trim();
  const cargo = document.getElementById('cargo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const nota = document.getElementById('nota').value.trim();
  const fechaCreacion = new Date().toLocaleString();
  if (!nombre || !apellido) { 
    alert('Nombre y apellido son obligatorios'); 
    return; 
  }
  if (id) {
    db.run('UPDATE contactos SET nombre = ?, apellido = ?, empresa = ?, cargo = ?, telefono = ?, nota = ? WHERE idContacto = ?', 
      [nombre, apellido, empresa, cargo, telefono, nota, id]);
  } else {
    db.run('INSERT INTO contactos (nombre, apellido, empresa, cargo, telefono, nota, fechaCreacion) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [nombre, apellido, empresa, cargo, telefono, nota, fechaCreacion]);
  }
  saveDbToLocalStorage();
  document.getElementById('contactForm').reset();
  document.getElementById('idContacto').value = '';
  renderContactos();
}

function exportarDB() {
  if (!db) return alert('DB no iniciada');
  const data = db.export();
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'libreta_contactos.db';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importarDB(event) {
  const f = event.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = function() {
    const u8 = new Uint8Array(this.result);
    try {
      db = new SQL.Database(u8);
      saveDbToLocalStorage();
      renderContactos();
      alert('BD importada correctamente');
    } catch(e) { 
      alert('Error al importar: ' + e.message); 
    }
  };
  reader.readAsArrayBuffer(f);
}

document.addEventListener('DOMContentLoaded', () => {
  const locateFile = file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`;
  initSqlJs({ locateFile })
    .then(initializeDatabase)
    .catch(err => console.error('Error al inicializar sql.js', err));
  const tbody = document.querySelector('#tablaContactos tbody');
  tbody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('edit')) {
      editarContacto(id);
    } else if (btn.classList.contains('del')) {
      eliminarContacto(id);
    }
  });
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', guardarContacto);
  document.getElementById('btnExport').addEventListener('click', exportarDB);
  const fileInput = document.getElementById('fileInput');
  document.getElementById('btnImport').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', importarDB);
});