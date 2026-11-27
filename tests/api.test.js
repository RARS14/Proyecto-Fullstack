jest.setTimeout(60000);
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const call = async (path, method = 'GET', body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: 'Bearer ' + token })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
};

const user = 'test' + Date.now();
const pass = 'clave1234';
let token;

describe('Pruebas funcionales', () => {
  test('registro de usuario nuevo', async () => {
    const r = await call('/api/auth/register', 'POST', { username: user, password: pass });
    expect([200, 201]).toContain(r.status);
  });

  test('login devuelve token', async () => {
    const r = await call('/api/auth/login', 'POST', { username: user, password: pass });
    expect(r.status).toBe(200);
    expect(r.data.token).toBeDefined();
    token = r.data.token;
  });

  test('crear, listar y eliminar una tarea', async () => {
    const c = await call('/api/tasks', 'POST', { title: 'tarea de prueba' }, token);
    expect(c.status).toBe(201);
    const l = await call('/api/tasks?page=1&limit=50');
    expect(l.status).toBe(200);
    expect(l.data.data.some(t => t._id === c.data._id)).toBe(true);
    const d = await call('/api/tasks/' + c.data._id, 'DELETE', null, token);
    expect(d.status).toBe(200);
  });

  test('conversión de moneda válida', async () => {
    const r = await call('/api/rates/convert?amount=10');
    expect(r.status).toBe(200);
    expect(r.data.mxn).toBeGreaterThan(0);
  });
});

describe('Pruebas de seguridad', () => {
  test('ruta protegida sin token responde 401', async () => {
    expect((await call('/api/tasks', 'POST', { title: 'x' })).status).toBe(401);
  });

  test('token falso responde 401', async () => {
    expect((await call('/api/tasks', 'POST', { title: 'x' }, 'token.falso.123')).status).toBe(401);
  });

  test('usuario normal no accede a la ruta de admin (403)', async () => {
    expect((await call('/api/auth/users', 'GET', null, token)).status).toBe(403);
  });

  test('sin token no accede a la ruta de admin (401)', async () => {
    expect((await call('/api/auth/users')).status).toBe(401);
  });

  test('contraseña incorrecta responde 401', async () => {
    expect((await call('/api/auth/login', 'POST', { username: user, password: 'incorrecta1' })).status).toBe(401);
  });

  test('ID inválido es rechazado (400)', async () => {
    expect((await call('/api/tasks/abc', 'DELETE', null, token)).status).toBe(400);
  });

  test('inyección NoSQL en el login es rechazada (400)', async () => {
    const r = await call('/api/auth/login', 'POST', { username: { $ne: null }, password: { $ne: null } });
    expect(r.status).toBe(400);
  });
});