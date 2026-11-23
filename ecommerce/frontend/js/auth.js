// Shared auth utilities across all pages

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function updateNavAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const loginLink = document.getElementById('loginLink');
  const userMenu = document.getElementById('userMenu');
  const ordersLink = document.getElementById('ordersLink');
  const userNameEl = document.getElementById('userName');

  if (token && user.name) {
    if (loginLink) loginLink.style.display = 'none';
    if (userMenu) { userMenu.style.display = 'flex'; }
    if (userNameEl) userNameEl.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name}`;
    if (ordersLink) ordersLink.style.display = 'inline-flex';
  } else {
    if (loginLink) loginLink.style.display = 'inline-flex';
    if (userMenu) userMenu.style.display = 'none';
    if (ordersLink) ordersLink.style.display = 'none';
  }
}

async function updateCartBadge() {
  const token = localStorage.getItem('token');
  const badge = document.getElementById('cartBadge');
  if (!badge || !token) return;

  try {
    const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const { items } = await res.json();
      const count = items.reduce((sum, i) => sum + i.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  } catch (e) { /* ignore */ }
}

// Run on page load
updateNavAuth();
updateCartBadge();
