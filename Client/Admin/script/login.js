import { api } from '/script/api.js';

api('/auth/me')
  .then(() => {
    window.location.href = '/admin/dashboard';
  })
  .catch(() => {});

const form = document.getElementById('login-form');
const err = document.getElementById('login-error');
const btn = document.getElementById('login-submit');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  err?.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    await api('/auth/login', {
      method: 'POST',
      body: {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      },
    });
    window.location.href = '/admin/dashboard';
  } catch (ex) {
    err.textContent = ex.message || 'Login failed.';
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});
