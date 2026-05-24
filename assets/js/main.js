/**
 * main.js — Core Site Logic
 *
 * Handles: navigation behavior, terminal animation, stats loading,
 * scroll-reveal observer, filter chips, and shared utilities.
 * No external dependencies — vanilla JS only.
 */

'use strict';

/* ── Navigation ─────────────────────────────────────────────── */

const Nav = (() => {
  const nav       = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  // Add scrolled shadow when user scrolls down
  function handleScroll() {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }

  // Mark the current page link as active
  function setActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
      const linkFile = link.getAttribute('href')?.split('/').pop() || '';
      link.classList.toggle(
        'active',
        linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')
      );
    });
  }

  // Toggle mobile drawer
  function toggleMobile() {
    const isOpen = mobileNav?.classList.toggle('open');
    hamburger?.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // Close mobile nav when a link is clicked
  function bindMobileLinks() {
    mobileNav?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  function init() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load in case page is already scrolled
    hamburger?.addEventListener('click', toggleMobile);
    setActiveLink();
    bindMobileLinks();
  }

  return { init };
})();

/* ── Terminal Animator ──────────────────────────────────────── */

class TerminalAnimator {
  /**
   * @param {HTMLElement} bodyEl — the .terminal-body element to write into
   */
  constructor(bodyEl) {
    this.body    = bodyEl;
    this.running = false;

    // Each entry: { text, type, delay } — type maps to a CSS class
    // delay = extra pause BEFORE this line (ms); 0 = no extra pause
    this.script = [
      { text: '[user@cyberops ~]$ ', type: 'prompt',  delay: 0,    speed: 40  },
      { text: 'nmap -sV -p 22,80,443,3389 10.0.1.0/24', type: 'cmd', delay: 0, speed: 55 },
      { text: '\n',                  type: 'output',  delay: 400,  speed: 0   },
      { text: 'Starting Nmap 7.94 ( https://nmap.org )', type: 'output', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: 'Nmap scan report for 10.0.1.12', type: 'output', delay: 200, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: 'PORT     STATE  SERVICE   VERSION', type: 't-output-dim', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '22/tcp   open   ssh       OpenSSH 8.9p1', type: 'output', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '80/tcp   open   http      Apache 2.4.52', type: 'output', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '443/tcp  open   https     nginx 1.24.0', type: 'output', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '3389/tcp filtered ms-wbt-server', type: 't-warn', delay: 0, speed: 18 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: 'Nmap done: 254 IPs scanned in 8.42 seconds', type: 't-success', delay: 300, speed: 18 },
      { text: '\n\n', type: 'output', delay: 0, speed: 0 },
      { text: '[user@cyberops ~]$ ', type: 'prompt',  delay: 800,  speed: 40  },
      { text: 'grep -i "failed password" /var/log/auth.log | tail -5', type: 'cmd', delay: 0, speed: 55 },
      { text: '\n', type: 'output', delay: 400, speed: 0 },
      { text: 'May 24 02:11:43 sshd[3821]: Failed password for root from 185.220.101.34', type: 't-warn', delay: 0, speed: 16 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: 'May 24 02:11:46 sshd[3821]: Failed password for root from 185.220.101.34', type: 't-warn', delay: 0, speed: 16 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: 'May 24 02:11:49 sshd[3821]: Failed password for admin from 185.220.101.34', type: 't-warn', delay: 0, speed: 16 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '[!] 3 failed attempts detected — possible brute force', type: 't-error', delay: 300, speed: 22 },
      { text: '\n\n', type: 'output', delay: 0, speed: 0 },
      { text: '[user@cyberops ~]$ ', type: 'prompt',  delay: 800,  speed: 40  },
      { text: 'python3 analyze.py --input threats.json --report', type: 'cmd', delay: 0, speed: 55 },
      { text: '\n', type: 'output', delay: 400, speed: 0 },
      { text: '[*] Loading IOC database... 2,841 indicators', type: 't-info', delay: 0, speed: 22 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '[*] Malicious IPs: 23  |  Suspicious domains: 7', type: 't-info', delay: 300, speed: 22 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
      { text: '[+] Analysis complete → report saved', type: 't-success', delay: 400, speed: 22 },
      { text: '\n', type: 'output', delay: 0, speed: 0 },
    ];
  }

  // Pause for `ms` milliseconds
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Type a string character-by-character into a span
  async _type(span, text, speed) {
    for (const char of text) {
      if (!this.running) return;
      span.textContent += char;
      this._scrollToBottom();
      if (speed > 0) await this._wait(speed + Math.random() * 20);
    }
  }

  _scrollToBottom() {
    this.body.scrollTop = this.body.scrollHeight;
  }

  // Remove and re-add cursor element
  _moveCursor(afterEl) {
    const existing = this.body.querySelector('.t-cursor');
    existing?.remove();
    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    afterEl.after(cursor);
  }

  async start() {
    this.running = true;
    while (this.running) {
      this.body.innerHTML = '';

      for (const entry of this.script) {
        if (!this.running) break;
        if (entry.delay > 0) await this._wait(entry.delay);
        if (!this.running) break;

        if (entry.text === '\n' || entry.text === '\n\n') {
          // Insert line breaks as <br> elements
          const count = entry.text.length;
          for (let i = 0; i < count; i++) {
            this.body.appendChild(document.createElement('br'));
          }
          continue;
        }

        const span = document.createElement('span');
        // Map entry type to t-* CSS class; if it already starts with 't-', use as-is
        const cls = entry.type.startsWith('t-') ? entry.type
          : entry.type === 'prompt' ? 't-prompt'
          : entry.type === 'cmd'    ? 't-cmd'
          : entry.type === 'output' ? 't-output'
          : 't-output';
        span.className = `t-line ${cls}`;
        this.body.appendChild(span);
        this._moveCursor(span);

        await this._type(span, entry.text, entry.speed);
      }

      // Hold the final state before restarting
      await this._wait(3500);
    }
  }

  stop() {
    this.running = false;
  }
}

/* ── Stats Loader ───────────────────────────────────────────── */

const StatsLoader = (() => {
  // Animate a number from 0 to target
  function animateCount(el, target, duration = 1200) {
    const start     = performance.now();
    const startVal  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(startVal + (target - startVal) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function load() {
    try {
      // Determine base path — one level up when in sections/
      const inSections = window.location.pathname.includes('/sections/');
      const base       = inSections ? '../' : './';

      const [projRes, certRes, labsRes] = await Promise.all([
        fetch(`${base}data/projects.json`),
        fetch(`${base}data/certifications.json`),
        fetch(`${base}data/labs.json`),
      ]);

      const [projData, certData, labsData] = await Promise.all([
        projRes.json(),
        certRes.json(),
        labsRes.json(),
      ]);

      const certsEarned   = certData.certifications.filter(c => c.status === 'earned').length;
      const labsCompleted = labsData.labs.length;
      const projectsBuilt = projData.projects.filter(p => p.status === 'Complete').length;

      // Map stat IDs to values
      const stats = {
        'stat-certs':    certsEarned,
        'stat-labs':     labsCompleted,
        'stat-projects': projectsBuilt,
        'stat-streak':   47, // hardcoded — update manually or via config
      };

      // Animate each stat card number
      Object.entries(stats).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) animateCount(el, value);
      });

    } catch (err) {
      console.warn('Stats loader: could not fetch data files.', err);
    }
  }

  return { load };
})();

/* ── Scroll Reveal ──────────────────────────────────────────── */

const ScrollReveal = (() => {
  let observer;

  function init() {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ── Filter Chips ───────────────────────────────────────────── */

const Filters = (() => {
  function init(filterBarSelector, cardSelector, dataAttr) {
    const bar = document.querySelector(filterBarSelector);
    if (!bar) return;

    bar.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      // Update active chip
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;

      // Show/hide matching cards
      document.querySelectorAll(cardSelector).forEach(card => {
        const cardVal = card.dataset[dataAttr] || '';
        const show    = filter === 'all' || cardVal === filter;
        card.style.display = show ? '' : 'none';
        // Re-trigger reveal animation for newly shown cards
        if (show) card.classList.remove('visible');
        requestAnimationFrame(() => { if (show) card.classList.add('visible'); });
      });
    });
  }

  return { init };
})();

/* ── Project Card Builder ───────────────────────────────────── */

const ProjectCards = (() => {
  function difficultyBadge(level) {
    const map = {
      'Beginner':     'badge-beginner',
      'Intermediate': 'badge-intermediate',
      'Advanced':     'badge-advanced',
      'Expert':       'badge-expert',
    };
    return `<span class="badge ${map[level] || 'badge-beginner'}">${level}</span>`;
  }

  function statusBadge(status) {
    const cls = status === 'Complete' ? 'badge-complete' : 'badge-progress';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function render(project) {
    const tags = project.tech.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    const gh   = project.github
      ? `<a href="${escapeHtml(project.github)}" class="btn btn-sm btn-ghost" target="_blank" rel="noopener noreferrer">&#128279; GitHub</a>`
      : '';
    const demo = project.demo
      ? `<a href="${escapeHtml(project.demo)}" class="btn btn-sm btn-outline" target="_blank" rel="noopener noreferrer">&#9654; Demo</a>`
      : '';

    const el = document.createElement('article');
    el.className  = 'project-card reveal';
    el.dataset.category = project.category;
    el.innerHTML = `
      <div class="project-card-header">
        <h3>${escapeHtml(project.title)}</h3>
        <div class="project-card-meta">
          ${difficultyBadge(project.difficulty)}
          ${statusBadge(project.status)}
        </div>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <div class="tags">${tags}</div>
      <div class="project-card-footer">${gh}${demo}</div>
    `;
    return el;
  }

  async function load(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const inSections = window.location.pathname.includes('/sections/');
      const base       = inSections ? '../' : './';
      const res        = await fetch(`${base}data/projects.json`);
      const data       = await res.json();

      container.innerHTML = '';
      data.projects.forEach((p, i) => {
        const card = render(p);
        card.classList.add(`reveal-delay-${(i % 6) + 1}`);
        container.appendChild(card);
      });

      // Re-run scroll reveal for new elements
      ScrollReveal.init();

    } catch (err) {
      container.innerHTML = '<p class="text-muted">Projects temporarily unavailable. Check back soon.</p>';
      console.error('ProjectCards:', err);
    }
  }

  return { load };
})();

/* ── Lab Card Builder ───────────────────────────────────────── */

const LabCards = (() => {
  function diffBadge(level) {
    const map = { 'Easy': 'badge-beginner', 'Medium': 'badge-intermediate', 'Hard': 'badge-advanced' };
    return `<span class="badge ${map[level] || 'badge-beginner'}">${level}</span>`;
  }

  function render(lab) {
    const skills = lab.skills.map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('');
    const writeup = lab.writeup_url
      ? `<a href="${escapeHtml(lab.writeup_url)}" class="btn btn-sm btn-outline" target="_blank" rel="noopener noreferrer">Read Writeup</a>`
      : '';

    const el = document.createElement('article');
    el.className  = 'lab-card reveal';
    el.dataset.category = lab.category;
    el.innerHTML = `
      <div class="lab-card-header">
        <div>
          <span class="lab-platform">${escapeHtml(lab.platform)}</span>
        </div>
        ${diffBadge(lab.difficulty)}
      </div>
      <h3>${escapeHtml(lab.title)}</h3>
      <div class="lab-notes">${escapeHtml(lab.notes)}</div>
      <div class="tags">${skills}</div>
      <div class="lab-meta">
        <span>&#128197; ${escapeHtml(lab.date_completed)}</span>
        <span>&#128193; ${escapeHtml(lab.category)}</span>
        ${lab.time_spent_mins ? `<span>&#9201; ${lab.time_spent_mins} min</span>` : ''}
      </div>
      ${writeup}
    `;
    return el;
  }

  async function load(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const inSections = window.location.pathname.includes('/sections/');
      const base       = inSections ? '../' : './';
      const res        = await fetch(`${base}data/labs.json`);
      const data       = await res.json();

      container.innerHTML = '';
      data.labs.forEach((lab, i) => {
        const card = render(lab);
        card.classList.add(`reveal-delay-${(i % 6) + 1}`);
        container.appendChild(card);
      });

      ScrollReveal.init();

    } catch (err) {
      container.innerHTML = '<p>Labs temporarily unavailable.</p>';
      console.error('LabCards:', err);
    }
  }

  return { load };
})();

/* ── Certification Card Builder ─────────────────────────────── */

const CertCards = (() => {
  const icons = {
    'earned':      '&#9989;',
    'in-progress': '&#128336;',
    'planned':     '&#128203;',
  };

  function render(cert) {
    const skills = cert.skills.map(s => `<span class="cert-skill-tag">${escapeHtml(s)}</span>`).join('');
    const date   = cert.date_earned
      ? `<span>Earned: ${cert.date_earned}</span>`
      : cert.date_planned
        ? `<span>Target: ${cert.date_planned}</span>`
        : '';

    const el = document.createElement('article');
    el.className  = `cert-card ${cert.status} reveal`;
    el.innerHTML = `
      <div class="cert-icon ${cert.status}" aria-hidden="true">${icons[cert.status] || '&#128203;'}</div>
      <div class="cert-info">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:4px;">
          <h3>${escapeHtml(cert.name)}</h3>
          <span class="badge badge-${cert.status.replace('-','')}">${cert.status.replace('-', ' ')}</span>
        </div>
        <div class="cert-issuer">${escapeHtml(cert.issuer)}${cert.code ? ` · ${cert.code}` : ''} ${date}</div>
        <p class="cert-description">${escapeHtml(cert.description)}</p>
        <div class="progress-wrap">
          <div class="progress-label">
            <span>Progress</span>
            <span>${cert.progress}%</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${cert.progress}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill ${cert.status}" style="width: 0%;" data-target="${cert.progress}"></div>
          </div>
        </div>
        <div class="cert-skills">${skills}</div>
      </div>
    `;
    return el;
  }

  function animateProgressBars() {
    document.querySelectorAll('.progress-fill[data-target]').forEach(bar => {
      // Use IntersectionObserver so bars animate when visible
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            bar.style.width = bar.dataset.target + '%';
            obs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      obs.observe(bar);
    });
  }

  async function load(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const inSections = window.location.pathname.includes('/sections/');
      const base       = inSections ? '../' : './';
      const res        = await fetch(`${base}data/certifications.json`);
      const data       = await res.json();

      container.innerHTML = '';
      data.certifications.forEach((cert, i) => {
        const card = render(cert);
        card.classList.add(`reveal-delay-${(i % 4) + 1}`);
        container.appendChild(card);
      });

      animateProgressBars();
      ScrollReveal.init();

    } catch (err) {
      container.innerHTML = '<p>Certification data temporarily unavailable.</p>';
      console.error('CertCards:', err);
    }
  }

  return { load };
})();

/* ── Utility: Escape HTML ───────────────────────────────────── */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/* ── Page Initializers ──────────────────────────────────────── */

function initHomePage() {
  // Terminal animation
  const termBody = document.querySelector('.terminal-body');
  if (termBody) {
    const animator = new TerminalAnimator(termBody);
    animator.start();

    // Pause when tab is not visible (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) animator.stop();
      else animator.start();
    });
  }

  // Animated stats
  StatsLoader.load();
}

function initProjectsPage() {
  ProjectCards.load('#projects-grid');
  Filters.init('#project-filters', '.project-card', 'category');
}

function initLabsPage() {
  LabCards.load('#labs-grid');
  Filters.init('#lab-filters', '.lab-card', 'category');
}

function initCertsPage() {
  CertCards.load('#certs-grid');
}

/* ── Bootstrap ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  ScrollReveal.init();

  // Route to page-specific init based on <body data-page="...">
  const page = document.body.dataset.page;
  if (page === 'home')          initHomePage();
  if (page === 'projects')      initProjectsPage();
  if (page === 'labs')          initLabsPage();
  if (page === 'certifications') initCertsPage();
});
