const form = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const message = document.getElementById('message');

function showMessage(text, ok) {
  message.textContent = text;
  message.className = ok ? 'message ok' : 'message';
}

async function sendAuth(path) {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Iniciar sesión
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { ok, data } = await sendAuth('login');
  if (ok) {
    localStorage.setItem('token', data.token);
    window.location.href = 'tasks.html';
  } else {
    showMessage(data.message, false);
  }
});

// Registrarse
registerBtn.addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const { ok, data } = await sendAuth('register');
  showMessage(ok ? 'Usuario creado, ahora inicia sesión' : data.message, ok);
});