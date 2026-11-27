const { createApp, reactive } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// ---------- Sesión ----------
function parseRole(t) {
  try {
    const p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(p)).role || 'user';
  } catch { return null; }
}
const stored = localStorage.getItem('token');
const session = reactive({ token: stored, role: stored ? parseRole(stored) : null });

function setToken(t) {
  session.token = t;
  session.role = parseRole(t);
  localStorage.setItem('token', t);
}
function logout() {
  session.token = null;
  session.role = null;
  localStorage.removeItem('token');
  router.push('/login');
}

// ---------- Helper de API ----------
async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session.token && { Authorization: 'Bearer ' + session.token })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401 && session.token) logout(); // token vencido
  const data = await res.json();
  return { ok: res.ok, data };
}

// ---------- Vistas ----------
const Login = {
  template: `
    <div class="card">
      <h2>Iniciar sesión</h2>
      <input v-model="username" placeholder="Usuario">
      <input v-model="password" type="password" placeholder="Contraseña">
      <button @click="login">Iniciar sesión</button>
      <button class="sec" @click="register">Registrarme</button>
      <p class="msg">{{ msg }}</p>
    </div>`,
  data() { return { username: '', password: '', msg: '' }; },
  methods: {
    async login() {
      const { ok, data } = await api('/api/auth/login', 'POST', { username: this.username, password: this.password });
      if (!ok) { this.msg = data.message; return; }
      setToken(data.token);
      router.push('/tasks');
    },
    async register() {
      const { ok, data } = await api('/api/auth/register', 'POST', { username: this.username, password: this.password });
      this.msg = data.message || '';
      if (ok) await this.login();
    }
  }
};

const Tasks = {
  template: `
    <div class="card">
      <h2>Mis tareas</h2>
      <form @submit.prevent="add">
        <input v-model="title" placeholder="Nueva tarea" required>
        <button>Agregar</button>
      </form>
      <p class="msg">{{ msg }}</p>
      <ul>
        <li v-for="t in tasks" :key="t._id" :class="{ done: t.completed }">
          <input type="checkbox" :checked="t.completed" @change="toggle(t)">
          <span>{{ t.title }}</span>
          <button class="del" @click="remove(t)">Eliminar</button>
        </li>
      </ul>
      <p v-if="!tasks.length">No hay tareas todavía.</p>
    </div>`,
  data() { return { tasks: [], title: '', msg: '' }; },
  mounted() { this.load(); },
  methods: {
    async load() { const { data } = await api('/api/tasks'); this.tasks = data; },
    async add() {
      const { ok, data } = await api('/api/tasks', 'POST', { title: this.title });
      this.msg = ok ? '' : data.message;
      if (ok) { this.title = ''; this.load(); }
    },
    async toggle(t) { await api('/api/tasks/' + t._id, 'PUT', { completed: !t.completed }); this.load(); },
    async remove(t) { await api('/api/tasks/' + t._id, 'DELETE'); this.load(); }
  }
};

// Ruta dinámica: /convert/:amount
const Convert = {
  template: `
    <div class="card">
      <h2>Dólares a pesos</h2>
      <input v-model="amount" type="number" min="1" placeholder="Cantidad en USD">
      <button @click="go">Convertir</button>
      <p v-if="result">{{ result.usd }} USD = <b>{{ result.mxn }} MXN</b> (tipo de cambio {{ result.rate }})</p>
      <p class="msg">{{ msg }}</p>
    </div>`,
  data() { return { amount: this.$route.params.amount || '', result: null, msg: '' }; },
  watch: { '$route.params.amount': { immediate: true, handler(a) { this.load(a); } } },
  methods: {
    go() { this.$router.push('/convert/' + this.amount); },
    async load(a) {
      this.result = null; this.msg = '';
      if (!a) return;
      const { ok, data } = await api('/api/rates/convert?amount=' + encodeURIComponent(a));
      if (ok) this.result = data; else this.msg = data.message;
    }
  }
};

const Admin = {
  template: `
    <div class="card">
      <h2>Usuarios (solo admin)</h2>
      <p class="msg">{{ msg }}</p>
      <ul>
        <li v-for="u in users" :key="u._id">
          <span>{{ u.username }}</span><b style="margin-left:auto">{{ u.role || 'user' }}</b>
        </li>
      </ul>
    </div>`,
  data() { return { users: [], msg: '' }; },
  async mounted() {
    const { ok, data } = await api('/api/auth/users');
    if (ok) this.users = data; else this.msg = data.message;
  }
};

// ---------- Rutas y protección ----------
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/tasks' },
    { path: '/login', component: Login },
    { path: '/tasks', component: Tasks, meta: { auth: true } },
    { path: '/convert/:amount?', component: Convert, meta: { auth: true } },
    { path: '/admin', component: Admin, meta: { auth: true, admin: true } },
    { path: '/:pathMatch(.*)*', redirect: '/tasks' }
  ]
});

router.beforeEach(to => {
  if (to.meta.auth && !session.token) return '/login';
  if (to.meta.admin && session.role !== 'admin') return '/tasks';
  if (to.path === '/login' && session.token) return '/tasks';
});

// ---------- App ----------
createApp({
  data() { return { session }; },
  methods: { logout },
  template: `
    <nav v-if="session.token">
      <router-link to="/tasks">Tareas</router-link>
      <router-link to="/convert">Dólar</router-link>
      <router-link v-if="session.role === 'admin'" to="/admin">Admin</router-link>
      <button class="sec" @click="logout">Cerrar sesión</button>
    </nav>
    <router-view />`
}).use(router).mount('#app');