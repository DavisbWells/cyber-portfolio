/**
 * dashboard.js — Security Dashboard Simulation
 *
 * ⚠ SIMULATION ONLY — All data generated client-side.
 * No external connections. This is a training/portfolio showcase.
 *
 * Generates: live threat feed entries, scrolling log viewer,
 * animated metric counters, and uptime ticker.
 */

'use strict';

/* ── Fake data pools ────────────────────────────────────────── */

const THREAT_SOURCES = [
  '185.220.101.34', '45.33.32.156', '198.51.100.42',
  '203.0.113.195',  '91.108.4.184', '162.247.74.201',
  '144.76.0.0',     '89.248.165.0', '176.111.174.54',
  '104.131.0.0',
];

const THREAT_EVENTS = [
  { sev: 'high',   desc: 'Brute force SSH attempt detected', cat: 'AUTH' },
  { sev: 'high',   desc: 'SQL injection attempt on /login endpoint', cat: 'WEB' },
  { sev: 'high',   desc: 'Outbound C2 beacon detected — port 4444', cat: 'C2' },
  { sev: 'medium', desc: 'Unusual port scan from external IP', cat: 'RECON' },
  { sev: 'medium', desc: 'Failed authentication — 5 attempts in 2s', cat: 'AUTH' },
  { sev: 'medium', desc: 'Suspicious DNS query to known bad domain', cat: 'DNS' },
  { sev: 'medium', desc: 'Large data transfer to external host', cat: 'EXFIL' },
  { sev: 'low',    desc: 'New host joined network segment', cat: 'NET' },
  { sev: 'low',    desc: 'TLS certificate expiring in 7 days', cat: 'CERT' },
  { sev: 'low',    desc: 'Scheduled task created by non-admin user', cat: 'PRIV' },
  { sev: 'info',   desc: 'Firewall ruleset updated by admin', cat: 'CONFIG' },
  { sev: 'info',   desc: 'Vulnerability scan initiated', cat: 'SCAN' },
  { sev: 'info',   desc: 'Backup completed successfully', cat: 'SYS' },
];

const LOG_TEMPLATES = [
  ts => `${ts} firewall[kern]: BLOCK IN=eth0 SRC=185.220.101.34 DST=10.0.1.5 PROTO=TCP DPT=22`,
  ts => `${ts} sshd[3821]: Failed password for invalid user admin from 185.220.101.34 port 54321`,
  ts => `${ts} nginx[access]: 192.168.1.102 "GET /wp-admin/install.php" 404 0.002s`,
  ts => `${ts} sysmon[1]: Process Create: python3.exe -c "import socket; s=socket.socket()"`,
  ts => `${ts} auditd[syscall]: execve /bin/bash uid=1001 ppid=2384 key=priv_esc`,
  ts => `${ts} named[query]: client 10.0.1.34: query malware-c2.xyz A REFUSED`,
  ts => `${ts} auth.log: pam_unix(sudo:auth): authentication failure user=www-data`,
  ts => `${ts} snort[alert]: [1:2001219:20] ET SCAN Potential SSH Scan OUTBOUND`,
  ts => `${ts} filebeat: index=windows-event event_id=4625 failure_reason=unknown_user`,
  ts => `${ts} wazuh[alert]: Rule 100002 fired. Agent: web-server-01. Rootkit detected.`,
];

/* ── Utilities ──────────────────────────────────────────────── */

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function randomIP() {
  return randomItem(THREAT_SOURCES);
}

/* ── Metric counters ────────────────────────────────────────── */

const Metrics = (() => {
  // Starting values for this session
  const state = {
    blocked:  Math.floor(Math.random() * 300) + 1500,
    events:   Math.floor(Math.random() * 5000) + 12000,
    alerts:   Math.floor(Math.random() * 40) + 80,
    uptime:   99.94,
  };

  function tick() {
    // Randomly increment counters to simulate live activity
    if (Math.random() > 0.6) state.blocked  += Math.floor(Math.random() * 3) + 1;
    if (Math.random() > 0.3) state.events   += Math.floor(Math.random() * 12) + 1;
    if (Math.random() > 0.85) state.alerts  += 1;

    // Update DOM elements
    const el = (id) => document.getElementById(id);
    if (el('metric-blocked')) el('metric-blocked').textContent = state.blocked.toLocaleString();
    if (el('metric-events'))  el('metric-events').textContent  = state.events.toLocaleString();
    if (el('metric-alerts'))  el('metric-alerts').textContent  = state.alerts.toLocaleString();
    if (el('metric-uptime'))  el('metric-uptime').textContent  = state.uptime.toFixed(2) + '%';
  }

  function init() {
    tick(); // populate immediately
    setInterval(tick, 2000);
  }

  return { init };
})();

/* ── Uptime clock ───────────────────────────────────────────── */

function initUptimeClock() {
  const el = document.getElementById('uptime-clock');
  if (!el) return;

  let seconds = Math.floor(Math.random() * 86400) + 3600; // start at random point
  function fmt(s) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sc = s % 60;
    return `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
  }

  el.textContent = fmt(seconds);
  setInterval(() => {
    seconds++;
    el.textContent = fmt(seconds);
  }, 1000);
}

/* ── Threat Feed ────────────────────────────────────────────── */

const ThreatFeed = (() => {
  const MAX_ENTRIES = 60;

  function createEntry() {
    const event   = randomItem(THREAT_EVENTS);
    const ts      = nowTimestamp();
    const srcIP   = randomIP();

    const el = document.createElement('div');
    el.className = 'threat-entry';
    el.setAttribute('role', 'log');
    el.innerHTML = `
      <span class="threat-time">${ts}</span>
      <span class="threat-sev-${event.sev}">[${event.sev.toUpperCase().padEnd(6)}]</span>
      <span class="threat-desc">${event.desc}</span>
      <span class="threat-src">${srcIP}</span>
    `;
    return el;
  }

  function init() {
    const body = document.querySelector('.threat-feed-body');
    if (!body) return;

    // Seed with initial entries
    for (let i = 0; i < 10; i++) body.appendChild(createEntry());
    body.scrollTop = body.scrollHeight;

    // Add new entry every 2.5–4 seconds
    function addEntry() {
      const entry = createEntry();
      body.appendChild(entry);
      body.scrollTop = body.scrollHeight;

      // Trim old entries to keep DOM lean
      while (body.children.length > MAX_ENTRIES) {
        body.removeChild(body.firstChild);
      }

      // Schedule next entry
      setTimeout(addEntry, 2500 + Math.random() * 1500);
    }

    setTimeout(addEntry, 2000);
  }

  return { init };
})();

/* ── Log Viewer ─────────────────────────────────────────────── */

const LogViewer = (() => {
  const MAX_LINES = 80;

  function sevClass(line) {
    if (/error|fail|BLOCK|alert|rootkit/i.test(line)) return 'log-error';
    if (/warn|REFUSED|snort|wazuh|OUTBOUND/i.test(line)) return 'log-warn';
    return 'log-info';
  }

  function createLine(text) {
    const el = document.createElement('div');
    el.className = `log-line ${sevClass(text)}`;
    el.innerHTML = `<span class="log-body-text">${escapeHtmlDash(text)}</span>`;
    return el;
  }

  function init() {
    const body = document.querySelector('.log-body');
    if (!body) return;

    // Seed initial log lines
    for (let i = 0; i < 12; i++) {
      const ts   = nowTimestamp();
      const tmpl = randomItem(LOG_TEMPLATES);
      body.appendChild(createLine(tmpl(ts)));
    }
    body.scrollTop = body.scrollHeight;

    function addLine() {
      const ts   = nowTimestamp();
      const tmpl = randomItem(LOG_TEMPLATES);
      const line = createLine(tmpl(ts));
      body.appendChild(line);
      body.scrollTop = body.scrollHeight;

      while (body.children.length > MAX_LINES) {
        body.removeChild(body.firstChild);
      }

      setTimeout(addLine, 1200 + Math.random() * 2000);
    }

    setTimeout(addLine, 1500);
  }

  return { init };
})();

/* ── Simple HTML escape for log text ───────────────────────── */
function escapeHtmlDash(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── Dashboard Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'dashboard') return;

  Metrics.init();
  initUptimeClock();
  ThreatFeed.init();
  LogViewer.init();
});
