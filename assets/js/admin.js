/**
 * admin.js — Admin Panel Logic
 *
 * Handles the content management dashboard: tabbed navigation,
 * listing records, add/edit forms, and delete with confirmation.
 * Requires: supabase-client.js, main.js (for escapeHtml).
 */

'use strict';

/* ── Auth guard — redirect to login if not authenticated ─────── */
function requireAuth() {
  if (!SupabaseClient.isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

/* ── Tab switching ───────────────────────────────────────────── */
function initTabs() {
  const tabs    = document.querySelectorAll('.admin-tab');
  const panels  = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel)?.classList.add('active');
      loadPanel(tab.dataset.panel);
    });
  });
}

/* ── Load data into a panel ──────────────────────────────────── */
async function loadPanel(panelId) {
  const tableMap = {
    'panel-projects': 'projects',
    'panel-labs':     'labs',
    'panel-certs':    'certifications',
  };
  const table = tableMap[panelId];
  if (!table) return;

  const container = document.querySelector(`#${panelId} .admin-table-wrap`);
  if (!container) return;

  container.innerHTML = '<p class="admin-loading">Loading...</p>';

  try {
    const rows = await SupabaseClient.getAll(table);
    if (rows.length === 0) {
      container.innerHTML = '<p class="admin-empty">No entries yet. Click "Add New" to get started.</p>';
      return;
    }
    container.innerHTML = renderTable(table, rows);
    bindTableActions(table, container);
  } catch (err) {
    container.innerHTML = `<p class="admin-error">Error loading data: ${escapeHtml(err.message)}</p>`;
  }
}

/* ── Render a data table ─────────────────────────────────────── */
function renderTable(table, rows) {
  const colMap = {
    projects: ['title', 'category', 'difficulty', 'status', 'date'],
    labs:     ['title', 'platform', 'difficulty', 'date_completed', 'category'],
    certifications: ['name', 'issuer', 'status', 'progress', 'date_planned'],
  };

  const cols = colMap[table] || Object.keys(rows[0]).slice(0, 5);

  const headers = cols.map(c =>
    `<th>${c.replace(/_/g, ' ')}</th>`
  ).join('');

  const bodyRows = rows.map(row => {
    const cells = cols.map(c => {
      const val = row[c];
      if (c === 'progress') return `<td>${val}%</td>`;
      return `<td>${escapeHtml(String(val ?? '—'))}</td>`;
    }).join('');
    return `
      <tr>
        ${cells}
        <td class="admin-actions">
          <button class="btn btn-sm btn-ghost edit-btn" data-id="${row.id}" data-table="${table}">Edit</button>
          <button class="btn btn-sm btn-outline delete-btn" data-id="${row.id}" data-table="${table}" style="border-color:var(--red);color:var(--red)">Delete</button>
        </td>
      </tr>`;
  }).join('');

  return `
    <table class="admin-table">
      <thead><tr>${headers}<th>Actions</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
}

/* ── Bind edit / delete buttons ──────────────────────────────── */
function bindTableActions(table, container) {
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(table, btn.dataset.id, container));
  });

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Re-fetch the row data and open form
      SupabaseClient.getAll(table).then(rows => {
        const row = rows.find(r => String(r.id) === btn.dataset.id);
        if (row) openForm(table, row);
      });
    });
  });
}

/* ── Delete with confirmation ────────────────────────────────── */
async function handleDelete(table, id, container) {
  const confirmed = window.confirm('Delete this entry? This cannot be undone.');
  if (!confirmed) return;

  try {
    await SupabaseClient.remove(table, id);
    showToast('Entry deleted.', 'success');
    loadPanel(`panel-${table === 'certifications' ? 'certs' : table}`);
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  }
}

/* ── Form fields config per table ────────────────────────────── */
const FORM_FIELDS = {
  projects: [
    { key: 'title',       label: 'Title',        type: 'text',     required: true },
    { key: 'description', label: 'Description',  type: 'textarea', required: true },
    { key: 'category',    label: 'Category',     type: 'select',   options: ['Security Tools','Scripting','Web','Research'], required: true },
    { key: 'difficulty',  label: 'Difficulty',   type: 'select',   options: ['Beginner','Intermediate','Advanced','Expert'], required: true },
    { key: 'status',      label: 'Status',       type: 'select',   options: ['In Progress','Complete'], required: true },
    { key: 'tech',        label: 'Tech Stack',   type: 'text',     placeholder: 'Python, Nmap, Linux (comma separated)' },
    { key: 'github',      label: 'GitHub URL',   type: 'url' },
    { key: 'demo',        label: 'Demo URL',     type: 'url' },
    { key: 'date',        label: 'Date (YYYY-MM)', type: 'text',   placeholder: '2026-06' },
    { key: 'featured',    label: 'Featured',     type: 'checkbox' },
  ],
  labs: [
    { key: 'title',          label: 'Title',           type: 'text',     required: true },
    { key: 'platform',       label: 'Platform',        type: 'select',   options: ['TryHackMe','Hack The Box','Blue Team Labs','PentesterLab','Other'], required: true },
    { key: 'difficulty',     label: 'Difficulty',      type: 'select',   options: ['Easy','Medium','Hard'], required: true },
    { key: 'category',       label: 'Category',        type: 'select',   options: ['Forensics','Network Analysis','OSINT','Web Exploitation','CTF','Malware Analysis'], required: true },
    { key: 'date_completed', label: 'Date Completed',  type: 'date' },
    { key: 'skills',         label: 'Skills',          type: 'text',     placeholder: 'Nmap, Wireshark (comma separated)' },
    { key: 'notes',          label: 'Notes / Takeaways', type: 'textarea' },
    { key: 'writeup_url',    label: 'Writeup URL',     type: 'url' },
    { key: 'platform_url',   label: 'Platform URL',    type: 'url' },
    { key: 'time_spent_mins',label: 'Time (minutes)',  type: 'number' },
  ],
  certifications: [
    { key: 'name',           label: 'Name',            type: 'text',     required: true },
    { key: 'code',           label: 'Exam Code',       type: 'text' },
    { key: 'issuer',         label: 'Issuer',          type: 'text',     required: true },
    { key: 'status',         label: 'Status',          type: 'select',   options: ['earned','in-progress','planned'], required: true },
    { key: 'progress',       label: 'Progress (0-100)', type: 'number' },
    { key: 'date_earned',    label: 'Date Earned',     type: 'text',     placeholder: 'YYYY-MM' },
    { key: 'date_planned',   label: 'Target Date',     type: 'text',     placeholder: 'YYYY-MM' },
    { key: 'description',    label: 'Description',     type: 'textarea' },
    { key: 'skills',         label: 'Skills',          type: 'text',     placeholder: 'TCP/IP, Subnetting (comma separated)' },
    { key: 'study_hours',    label: 'Study Hours',     type: 'number' },
  ],
};

/* ── Open add/edit form ──────────────────────────────────────── */
function openForm(table, existingRow = null) {
  const modal  = document.getElementById('admin-modal');
  const title  = document.getElementById('modal-title');
  const form   = document.getElementById('modal-form');
  const fields = FORM_FIELDS[table] || [];

  title.textContent = existingRow ? `Edit ${table.slice(0, -1)}` : `Add ${table.slice(0, -1)}`;

  form.innerHTML = fields.map(f => {
    const val = existingRow ? (existingRow[f.key] ?? '') : '';
    const req  = f.required ? 'required' : '';

    if (f.type === 'textarea') {
      return `
        <div class="form-group">
          <label for="f-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
          <textarea id="f-${f.key}" name="${f.key}" rows="3" ${req} placeholder="${escapeHtml(f.placeholder || '')}">${escapeHtml(String(val))}</textarea>
        </div>`;
    }

    if (f.type === 'select') {
      const opts = f.options.map(o =>
        `<option value="${o}" ${String(val) === o ? 'selected' : ''}>${o}</option>`
      ).join('');
      return `
        <div class="form-group">
          <label for="f-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
          <select id="f-${f.key}" name="${f.key}" ${req}>${opts}</select>
        </div>`;
    }

    if (f.type === 'checkbox') {
      return `
        <div class="form-group form-group-inline">
          <input type="checkbox" id="f-${f.key}" name="${f.key}" ${val ? 'checked' : ''}>
          <label for="f-${f.key}">${f.label}</label>
        </div>`;
    }

    const displayVal = Array.isArray(val) ? val.join(', ') : String(val === null ? '' : val);
    return `
      <div class="form-group">
        <label for="f-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
        <input type="${f.type || 'text'}" id="f-${f.key}" name="${f.key}"
          value="${escapeHtml(displayVal)}" ${req}
          placeholder="${escapeHtml(f.placeholder || '')}">
      </div>`;
  }).join('');

  // Submit button
  form.innerHTML += `
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">${existingRow ? 'Save Changes' : 'Add Entry'}</button>
      <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
    </div>`;

  // Bind submit
  form.onsubmit = (e) => handleFormSubmit(e, table, existingRow?.id);
  document.getElementById('modal-cancel').addEventListener('click', closeForm);

  modal.classList.add('open');
}

function closeForm() {
  document.getElementById('admin-modal').classList.remove('open');
}

/* ── Handle form submission ──────────────────────────────────── */
async function handleFormSubmit(e, table, existingId) {
  e.preventDefault();
  const form   = e.target;
  const fields = FORM_FIELDS[table] || [];
  const row    = {};

  fields.forEach(f => {
    const el = form.querySelector(`[name="${f.key}"]`);
    if (!el) return;

    if (f.type === 'checkbox')  { row[f.key] = el.checked; return; }
    if (f.type === 'number')    { row[f.key] = el.value ? Number(el.value) : null; return; }

    // Fields that store as arrays in the DB
    if (['tech', 'skills'].includes(f.key)) {
      row[f.key] = el.value
        ? el.value.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      return;
    }

    row[f.key] = el.value.trim() || null;
  });

  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (existingId) {
      await SupabaseClient.update(table, existingId, row);
      showToast('Entry updated successfully.', 'success');
    } else {
      await SupabaseClient.insert(table, row);
      showToast('Entry added successfully.', 'success');
    }
    closeForm();
    // Reload the active panel
    const panelId = `panel-${table === 'certifications' ? 'certs' : table}`;
    loadPanel(panelId);
  } catch (err) {
    showToast(`Save failed: ${err.message}`, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = existingId ? 'Save Changes' : 'Add Entry';
  }
}

/* ── Toast notifications ─────────────────────────────────────── */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.admin-toast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ── Sign out ────────────────────────────────────────────────── */
async function handleSignOut() {
  await SupabaseClient.signOut();
  window.location.href = 'login.html';
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  // Show logged-in user
  const userEl = document.getElementById('admin-user');
  if (userEl) userEl.textContent = SupabaseClient.currentUser() || 'Admin';

  initTabs();

  // Load the first panel by default
  loadPanel('panel-projects');

  // "Add New" buttons
  document.querySelectorAll('.add-new-btn').forEach(btn => {
    btn.addEventListener('click', () => openForm(btn.dataset.table));
  });

  // Close modal on backdrop click
  document.getElementById('admin-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeForm();
  });

  // Sign out
  document.getElementById('signout-btn')?.addEventListener('click', handleSignOut);
});
