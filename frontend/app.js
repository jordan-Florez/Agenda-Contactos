// Función de utilidad para escapar HTML
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&lt;', '"': '&quot;', "'": "&#39;" })[c]
  );
}

function getBackendUrl(path) {
  // Si está en localhost, usa localhost; si está en contenedor, usa el nombre del servicio
  // const host = window.location.hostname === 'localhost' ? 'localhost' : 'agenda_backend';
  const host = window.location.hostname === 'localhost' ? 'localhost' : 'backend';
  return `http://${host}:8000${path}`;
}

function renderContactos() {
  const tbody = document.querySelector('#tablaContactos tbody');
  fetch(getBackendUrl('/contactos'))
    .then(res => res.json())
    .then(rows => {
      tbody.innerHTML = '';
      if (!rows.length) return;
      rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(row.nombre)}</td>
          <td>${escapeHtml(row.apellido)}</td>
          <td>${escapeHtml(row.empresa || '')}</td>
          <td>${escapeHtml(row.cargo || '')}</td>
          <td>${escapeHtml(row.telefono || '')}</td>
          <td>${escapeHtml(row.nota || '')}</td>
          <td></td>
          <td>
            <button class="small-btn edit" data-id="${row.id}">Editar</button>
            <button class="small-btn del" data-id="${row.id}">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(() => {
      tbody.innerHTML = '<tr><td colspan="8">Error al cargar contactos</td></tr>';
    });
}

function editarContacto(id) {
  fetch(getBackendUrl(`/contactos/${id}`))
    .then(res => {
      if (!res.ok) throw new Error('Contacto no encontrado');
      return res.json();
    })
    .then(row => {
      document.getElementById('idContacto').value = row.id;
      document.getElementById('nombre').value = row.nombre;
      document.getElementById('apellido').value = row.apellido;
      document.getElementById('empresa').value = row.empresa || '';
      document.getElementById('cargo').value = row.cargo || '';
      document.getElementById('telefono').value = row.telefono || '';
      document.getElementById('nota').value = row.nota || '';
    })
    .catch(() => alert('Contacto no encontrado'));
}

function eliminarContacto(id) {
  if (!confirm('¿Eliminar contacto?')) return;
  fetch(getBackendUrl(`/contactos/${id}`), {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('No se pudo eliminar');
      return res.json();
    })
    .then(() => {
      renderContactos();
    })
    .catch(() => alert('No se pudo eliminar'));
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

  if (!nombre || !apellido) {
    alert('Nombre y apellido son obligatorios');
    return;
  }

  const contacto = { nombre, apellido, empresa, cargo, telefono, nota };

  if (id) {
    fetch(getBackendUrl(`/contactos/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contacto)
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo actualizar');
        return res.json();
      })
      .then(() => {
        document.getElementById('contactForm').reset();
        document.getElementById('idContacto').value = '';
        renderContactos();
      })
      .catch(() => alert('No se pudo actualizar'));
    return;
  }

  // Crear contacto
  fetch(getBackendUrl('/contactos'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contacto)
  })
    .then(res => {
      if (!res.ok) throw new Error('No se pudo guardar');
      return res.json();
    })
    .then(() => {
      document.getElementById('contactForm').reset();
      document.getElementById('idContacto').value = '';
      renderContactos();
    })
    .catch(() => alert('No se pudo guardar'));
}

document.addEventListener('DOMContentLoaded', () => {
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

  renderContactos();
});
