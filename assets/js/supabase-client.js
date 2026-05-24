/**
 * supabase-client.js — Lightweight Supabase REST API wrapper
 *
 * Pure fetch() against the Supabase REST + Auth APIs.
 * No SDK required — keeps the project dependency-free.
 *
 * Requires: config.js loaded first (SUPABASE_URL, SUPABASE_ANON_KEY).
 */

'use strict';

const SupabaseClient = (() => {

  // Pull config values
  function cfg() {
    return {
      url: (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL)      || '',
      key: (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_ANON_KEY) || '',
    };
  }

  function isConfigured() {
    const c = cfg();
    return !!(c.url && c.key);
  }

  // Session token stored in sessionStorage (cleared on tab close)
  function getToken()        { return sessionStorage.getItem('sb_token') || ''; }
  function setToken(t)       { sessionStorage.setItem('sb_token', t); }
  function clearSession()    {
    sessionStorage.removeItem('sb_token');
    sessionStorage.removeItem('sb_email');
  }

  // Build headers for REST calls
  function makeHeaders(authenticated = false) {
    const token = authenticated ? getToken() : cfg().key;
    return {
      'Content-Type':  'application/json',
      'apikey':        cfg().key,
      'Authorization': `Bearer ${token}`,
      'Prefer':        'return=representation',
    };
  }

  // ── Auth ────────────────────────────────────────────────────────

  async function signIn(email, password) {
    const { url, key } = cfg();
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed.');

    setToken(data.access_token);
    sessionStorage.setItem('sb_email', data.user?.email || email);
    return data;
  }

  async function signOut() {
    if (!isConfigured()) return;
    await fetch(`${cfg().url}/auth/v1/logout`, {
      method:  'POST',
      headers: makeHeaders(true),
    }).catch(() => {});
    clearSession();
  }

  function isAuthenticated() { return !!getToken(); }
  function currentUser()     { return sessionStorage.getItem('sb_email') || null; }

  // ── Data (CRUD) ─────────────────────────────────────────────────

  // Read all rows from a table, ordered by created_at descending
  async function getAll(table) {
    if (!isConfigured()) return [];
    const res = await fetch(
      `${cfg().url}/rest/v1/${table}?select=*&order=created_at.desc`,
      { headers: makeHeaders() }
    );
    if (!res.ok) throw new Error(`Failed to read "${table}": ${res.status}`);
    return res.json();
  }

  // Insert a new row — returns the inserted record
  async function insert(table, row) {
    const res = await fetch(`${cfg().url}/rest/v1/${table}`, {
      method:  'POST',
      headers: makeHeaders(true),
      body:    JSON.stringify(row),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Insert failed.');
    return Array.isArray(data) ? data[0] : data;
  }

  // Update an existing row by id — returns updated record
  async function update(table, id, row) {
    const res = await fetch(`${cfg().url}/rest/v1/${table}?id=eq.${id}`, {
      method:  'PATCH',
      headers: makeHeaders(true),
      body:    JSON.stringify(row),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Update failed.');
    return Array.isArray(data) ? data[0] : data;
  }

  // Delete a row by id
  async function remove(table, id) {
    const res = await fetch(`${cfg().url}/rest/v1/${table}?id=eq.${id}`, {
      method:  'DELETE',
      headers: makeHeaders(true),
    });
    if (!res.ok) throw new Error('Delete failed.');
    return true;
  }

  return {
    isConfigured,
    isAuthenticated,
    currentUser,
    signIn,
    signOut,
    getAll,
    insert,
    update,
    remove,
  };
})();
