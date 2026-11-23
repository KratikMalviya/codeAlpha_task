// ── Shared utilities ────────────────────────────────────────────
const API = '';   // same origin

function getToken() { return localStorage.getItem('sm_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('sm_user') || 'null'); }
function setSession(token, user) {
  localStorage.setItem('sm_token', token);
  localStorage.setItem('sm_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('sm_token');
  localStorage.removeItem('sm_user');
}
function logout() { clearSession(); window.location.href = '/login.html'; }

// Redirect to login if not authenticated
function requireAuth() {
  if (!getToken()) window.location.href = '/login.html';
}

// ── Fetch wrapper ───────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Toast ───────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;
      font-size:.9rem;font-weight:500;z-index:9999;opacity:0;transition:opacity .3s;max-width:300px;
      box-shadow:0 4px 20px rgba(0,0,0,.2);color:#fff;`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.opacity = '0', 3000);
}

// ── Avatar (initials) ────────────────────────────────────────────
function avatar(name = '?', size = 40) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981','#3b82f6'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};
    display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;
    font-size:${size*0.38}px;flex-shrink:0;">${initials}</div>`;
}

// ── Relative time ────────────────────────────────────────────────
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

// ── Nav active link ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path || (path==='/' && a.getAttribute('href')==='/index.html'))
      a.classList.add('active');
  });
  const user = getUser();
  const nameEl = document.getElementById('navUserName');
  if (nameEl && user) nameEl.textContent = user.name;
  const avatarEl = document.getElementById('navAvatar');
  if (avatarEl && user) avatarEl.innerHTML = avatar(user.name, 34);
});
