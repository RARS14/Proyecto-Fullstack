const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

const list = document.getElementById('task-list');
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const message = document.getElementById('message');
const empty = document.getElementById('empty');
const logoutBtn = document.getElementById('logout-btn');

const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token
};

// Si el token expiró o es inválido, regresa al login
function handleExpired(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
    return true;
  }
  return false;
}

// Dibuja una tarea en la lista
function renderTask(task) {
  const li = document.createElement('li');
  if (task.completed) li.classList.add('done');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task._id, checkbox.checked));

  const span = document.createElement('span');
  span.textContent = task.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.className = 'btn-delete';
  deleteBtn.addEventListener('click', () => deleteTask(task._id));

  li.append(checkbox, span, deleteBtn);
  list.appendChild(li);
}

// READ: pedir las tareas al servidor y mostrarlas
async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  list.innerHTML = '';
  tasks.forEach(renderTask);
  empty.textContent = tasks.length === 0 ? 'No hay tareas todavía.' : '';
}

// CREATE: agregar una tarea
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: input.value })
  });
  if (handleExpired(res)) return;
  const data = await res.json();
  if (!res.ok) {
    message.textContent = data.message;
    return;
  }
  input.value = '';
  message.textContent = '';
  loadTasks();
});

// UPDATE: marcar o desmarcar como completada
async function toggleTask(id, completed) {
  const res = await fetch('/api/tasks/' + id, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ completed })
  });
  if (handleExpired(res)) return;
  loadTasks();
}

// DELETE: eliminar una tarea
async function deleteTask(id) {
  const res = await fetch('/api/tasks/' + id, {
    method: 'DELETE',
    headers: authHeaders
  });
  if (handleExpired(res)) return;
  loadTasks();
}

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});

loadTasks();