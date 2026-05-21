const API = 'http://localhost:3000/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('token');
}

function saveToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

// Wraps fetch() to always include the Authorization header when a token exists.
// Returns parsed JSON or throws an Error with the server's message.
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // NestJS error responses have a `message` field
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(msg || 'Something went wrong');
  }
  return data;
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideError(elementId) {
  document.getElementById(elementId).classList.add('hidden');
}

// ── Auth state ────────────────────────────────────────────────────────────────

function showDashboard(user) {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('user-info').textContent = `${user.email}`;
  loadPosts();
}

function showAuth() {
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
}

// On every page load: check for ?token= in URL (Google OAuth callback),
// then check localStorage, then decide which view to show.
async function init() {
  // Google OAuth redirects back here with ?token=<jwt>
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    saveToken(urlToken);
    // Remove the token from the URL without a page reload
    window.history.replaceState({}, '', window.location.pathname);
  }

  const token = getToken();
  if (!token) return showAuth();

  try {
    // Validate the token and get the current user's id + email
    const user = await apiFetch('/auth/me');
    localStorage.setItem('currentUser', JSON.stringify(user));
    showDashboard(user);
  } catch {
    // Token is expired or invalid
    clearToken();
    showAuth();
  }
}

// ── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('login-tab').classList.add('hidden');
    document.getElementById('register-tab').classList.add('hidden');
    document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('login-error');
  const form = e.target;

  try {
    const { access_token } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    });
    saveToken(access_token);

    const user = await apiFetch('/auth/me');
    localStorage.setItem('currentUser', JSON.stringify(user));
    showDashboard(user);
  } catch (err) {
    showError('login-error', err.message);
  }
});

// ── Google Login ──────────────────────────────────────────────────────────────

// Redirects the browser to the NestJS Google OAuth route.
// After Google login, the server redirects back here with ?token=<jwt>
// which init() picks up on the next page load.
document.getElementById('google-btn').addEventListener('click', () => {
  window.location.href = `${API}/auth/google`;
});

// ── Register ──────────────────────────────────────────────────────────────────

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('register-error');
  const form = e.target;

  try {
    // Step 1: create the user
    await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
      }),
    });

    // Step 2: immediately log them in
    const { access_token } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    });
    saveToken(access_token);

    const user = await apiFetch('/auth/me');
    localStorage.setItem('currentUser', JSON.stringify(user));
    showDashboard(user);
  } catch (err) {
    showError('register-error', err.message);
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  showAuth();
});

// ── Posts ─────────────────────────────────────────────────────────────────────

async function loadPosts() {
  const container = document.getElementById('posts-list');
  container.textContent = 'Loading...';

  try {
    const posts = await apiFetch('/posts');

    if (posts.length === 0) {
      container.textContent = 'No posts yet.';
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="post-item">
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-meta">
          <span class="post-status ${post.published ? 'published' : 'draft'}">
            ${post.published ? 'Published' : 'Draft'}
          </span>
          <button class="delete-btn" data-id="${post.id}">Delete</button>
        </div>
      </div>
    `).join('');

    // Attach delete handlers
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deletePost(btn.dataset.id));
    });
  } catch (err) {
    container.textContent = `Error: ${err.message}`;
  }
}

document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError('post-error');
  const form = e.target;
  const user = getCurrentUser();

  try {
    await apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title.value,
        content: form.content.value,
        published: form.published.checked,
        authorId: user.id,
      }),
    });
    form.reset();
    loadPosts();
  } catch (err) {
    showError('post-error', err.message);
  }
});

async function deletePost(id) {
  try {
    await apiFetch(`/posts/${id}`, { method: 'DELETE' });
    loadPosts();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
}

// Prevent XSS — never put user content into innerHTML without escaping
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
