/**
 * login.js — Admin login page logic
 * External file required by CSP (script-src 'self' blocks inline scripts).
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Redirect immediately if already logged in
  if (SupabaseClient.isAuthenticated()) {
    window.location.href = 'admin.html';
    return;
  }

  const form      = document.getElementById('login-form');
  const errorEl   = document.getElementById('login-error');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorEl.textContent = 'Please enter your email and password.';
      errorEl.classList.add('visible');
      return;
    }

    errorEl.classList.remove('visible');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      await SupabaseClient.signIn(email, password);
      window.location.href = 'admin.html';
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed. Check your credentials.';
      errorEl.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
      document.getElementById('password').value = '';
    }
  });
});
