/**
 * resume-editor.js — Live inline editor for the Resume page.
 *
 * All resume content is stored as a plain JS object and persisted to
 * localStorage. Editing any field in the side panel re-renders the
 * corresponding section of the live resume preview instantly.
 *
 * Depends on: main.js (escapeHtml, ScrollReveal)
 */

'use strict';

const ResumeEditor = (() => {
  const STORAGE_KEY = 'resume_data_v1';

  const DEFAULTS = {
    summary: 'Cybersecurity student pursuing CompTIA Network+ and Security+ certifications with hands-on experience through a virtualized homelab, TryHackMe/HTB labs, and personal security tool development. Strong foundational knowledge in networking protocols, log analysis, SIEM platforms, and Python scripting. Targeting entry-level SOC analyst and security analyst roles in the government contracting sector, with a long-term goal of working in federal cybersecurity.',
    education: {
      degree: 'Bachelor of Science — Cybersecurity',
      school: 'North Carolina Wesleyan University',
      date: 'Expected May 2027',
      gpa: 'X.X',
      coursework: 'Network Security, Cryptography, Digital Forensics, Ethical Hacking',
      activities: 'Cybersecurity Club, Capture the Flag (CTF) Team',
    },
    certifications: [
      { title: 'Google Cybersecurity Professional Certificate', org: 'Google / Coursera', date: 'Jan 2026' },
      { title: 'CompTIA Network+ (N10-008)', org: 'CompTIA', date: 'In Progress — Target Aug 2026' },
      { title: 'CompTIA Security+ (SY0-701)', org: 'CompTIA', date: 'Planned — Dec 2026' },
    ],
    skills: [
      {
        category: 'Networking',
        items: [
          { name: 'TCP/IP & Subnetting', level: 'Strong', pct: 82 },
          { name: 'Routing & Switching', level: 'Developing', pct: 60 },
          { name: 'Wireshark / PCAP Analysis', level: 'Proficient', pct: 75 },
          { name: 'pfSense / Firewall Rules', level: 'Developing', pct: 55 },
        ],
      },
      {
        category: 'Security Tools',
        items: [
          { name: 'Nmap', level: 'Proficient', pct: 80 },
          { name: 'Splunk SIEM', level: 'Developing', pct: 60 },
          { name: 'Burp Suite', level: 'Familiar', pct: 45 },
          { name: 'Metasploit', level: 'Familiar', pct: 40 },
        ],
      },
      {
        category: 'Programming & Scripting',
        items: [
          { name: 'Python', level: 'Proficient', pct: 75 },
          { name: 'Bash / Shell', level: 'Proficient', pct: 70 },
          { name: 'SQL', level: 'Familiar', pct: 55 },
          { name: 'PowerShell', level: 'Familiar', pct: 45 },
        ],
      },
      {
        category: 'Operating Systems',
        items: [
          { name: 'Linux (Kali, Ubuntu)', level: 'Proficient', pct: 78 },
          { name: 'Windows / Windows Server', level: 'Proficient', pct: 72 },
        ],
      },
    ],
    experience: [
      {
        title: 'IT Help Desk Assistant',
        org: 'University IT Department',
        date: 'Sep 2025 – Present',
        bullets: [
          'Provided Tier 1 technical support for 500+ students and faculty',
          'Resolved network connectivity, account access, and software issues via ticket system',
          'Assisted with workstation imaging, patch deployment, and endpoint configuration',
        ],
      },
      {
        title: 'Freelance Technical Troubleshooting',
        org: 'Self-Employed',
        date: '2023 – 2025',
        bullets: [
          'Diagnosed and resolved hardware and software issues for small businesses',
          'Configured home network infrastructure including routers, switches, and basic security',
        ],
      },
    ],
    projects: [
      {
        title: 'Network Packet Analyzer',
        tech: 'Python · Scapy · Wireshark',
        desc: 'Built a Python packet capture tool using Scapy to detect suspicious network patterns including port scans, ARP spoofing, and malformed packets. Outputs structured JSON reports.',
      },
      {
        title: 'OSINT Reconnaissance Framework',
        tech: 'Python · Shodan API · DNS',
        desc: 'Modular passive reconnaissance toolkit aggregating WHOIS, DNS, certificate transparency logs, and Shodan data. Designed for authorized penetration testing engagements.',
      },
    ],
  };

  let data        = {};
  let renderTimer = null;
  let saveTimer   = null;
  let activeTab   = 'summary';

  /* ── Persistence ───────────────────────────────────────────── */

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      data = saved ? JSON.parse(saved) : clone(DEFAULTS);
    } catch {
      data = clone(DEFAULTS);
    }
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderResume, 120);
  }

  function scheduleSave() {
    const statusEl = document.getElementById('editor-save-status');
    if (statusEl) { statusEl.textContent = 'Saving…'; statusEl.classList.add('saving'); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (statusEl) { statusEl.textContent = 'All changes saved'; statusEl.classList.remove('saving'); }
    }, 500);
  }

  function onChange() { scheduleRender(); scheduleSave(); }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  /* ── Resume renderer ───────────────────────────────────────── */

  function renderResume() {
    const container = document.getElementById('resume-content');
    if (!container) return;

    container.innerHTML =
      buildSummary() +
      buildEducation() +
      buildCertifications() +
      buildSkills() +
      buildExperience() +
      buildProjects();

    // Animate progress bars via IntersectionObserver
    container.querySelectorAll('.progress-fill[data-target]').forEach(bar => {
      bar.style.width = '0';
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { bar.style.width = bar.dataset.target + '%'; obs.disconnect(); }
        });
      }, { threshold: 0.3 });
      obs.observe(bar);
    });

    if (typeof ScrollReveal !== 'undefined') ScrollReveal.init();
  }

  function e(str) { return typeof escapeHtml === 'function' ? escapeHtml(str) : String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

  function buildSummary() {
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Summary</div>
        <p style="font-size:0.95rem;line-height:1.75;color:var(--text-secondary)">${e(data.summary)}</p>
      </div>`;
  }

  function buildEducation() {
    const ed = data.education;
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Education</div>
        <div class="resume-entry">
          <div class="resume-entry-header">
            <div>
              <div class="resume-entry-title">${e(ed.degree)}</div>
              <div class="resume-entry-org">${e(ed.school)}</div>
            </div>
            <div class="resume-entry-date">${e(ed.date)}</div>
          </div>
          <ul style="list-style:disc;padding-left:1.25rem;margin-top:.5rem">
            ${ed.coursework ? `<li style="font-size:.875rem;color:var(--text-muted);margin-bottom:4px">Relevant coursework: ${e(ed.coursework)}</li>` : ''}
            ${ed.gpa ? `<li style="font-size:.875rem;color:var(--text-muted);margin-bottom:4px">GPA: ${e(ed.gpa)} / 4.0</li>` : ''}
            ${ed.activities ? `<li style="font-size:.875rem;color:var(--text-muted)">Member: ${e(ed.activities)}</li>` : ''}
          </ul>
        </div>
      </div>`;
  }

  function buildCertifications() {
    const rows = data.certifications.map(c => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <div>
            <div class="resume-entry-title">${e(c.title)}</div>
            <div class="resume-entry-org">${e(c.org)}</div>
          </div>
          <div class="resume-entry-date">${e(c.date)}</div>
        </div>
      </div>`).join('');
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Certifications</div>
        ${rows}
      </div>`;
  }

  function levelClass(lvl) {
    return (lvl === 'Strong' || lvl === 'Proficient' || lvl === 'Expert') ? 'earned' : 'in-progress';
  }

  function buildSkills() {
    const cats = data.skills.map(cat => `
      <div class="skill-category">
        <h3 class="skill-category-title" style="font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);font-weight:600;margin-bottom:.75rem">${e(cat.category)}</h3>
        <div class="skill-list">
          ${cat.items.map(sk => `
            <div class="skill-item">
              <div class="skill-meta"><span class="skill-name">${e(sk.name)}</span><span class="skill-level">${e(sk.level)}</span></div>
              <div class="progress-track"><div class="progress-fill ${levelClass(sk.level)}" style="width:0" data-target="${sk.pct}"></div></div>
            </div>`).join('')}
        </div>
      </div>`).join('');
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Technical Skills</div>
        <div class="skills-grid-resume">${cats}</div>
      </div>`;
  }

  function buildExperience() {
    const rows = data.experience.map(exp => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <div>
            <div class="resume-entry-title">${e(exp.title)}</div>
            <div class="resume-entry-org">${e(exp.org)}</div>
          </div>
          <div class="resume-entry-date">${e(exp.date)}</div>
        </div>
        <ul style="list-style:disc;padding-left:1.25rem;margin-top:.5rem">
          ${exp.bullets.map((b, i) => `<li style="font-size:.875rem;color:var(--text-muted)${i < exp.bullets.length - 1 ? ';margin-bottom:4px' : ''}">${e(b)}</li>`).join('')}
        </ul>
      </div>`).join('');
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Experience</div>
        ${rows}
      </div>`;
  }

  function buildProjects() {
    const rows = data.projects.map(p => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <div>
            <div class="resume-entry-title">${e(p.title)}</div>
            <div class="resume-entry-org" style="font-size:.8rem;color:var(--text-muted)">${e(p.tech)}</div>
          </div>
        </div>
        <div class="resume-entry-desc">${e(p.desc)}</div>
      </div>`).join('');
    return `
      <div class="resume-section reveal">
        <div class="resume-section-title">Notable Projects</div>
        ${rows}
      </div>`;
  }

  /* ── Editor panel DOM ──────────────────────────────────────── */

  function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'resume-editor-panel';
    panel.className = 'resume-editor-panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Resume editor');
    panel.innerHTML = `
      <div class="editor-header">
        <span class="editor-title">&#9998; Edit Resume</span>
        <button class="editor-close-btn" id="editor-close" aria-label="Close editor">&#10005;</button>
      </div>
      <div class="editor-tabs" role="tablist" aria-label="Resume sections">
        <button class="editor-tab active" data-section="summary"       role="tab">Summary</button>
        <button class="editor-tab"        data-section="education"     role="tab">Education</button>
        <button class="editor-tab"        data-section="certifications" role="tab">Certs</button>
        <button class="editor-tab"        data-section="skills"        role="tab">Skills</button>
        <button class="editor-tab"        data-section="experience"    role="tab">Experience</button>
        <button class="editor-tab"        data-section="projects"      role="tab">Projects</button>
      </div>
      <div class="editor-body" id="editor-body"></div>
      <div class="editor-footer">
        <span class="editor-save-status" id="editor-save-status">All changes saved</span>
        <button class="btn btn-sm btn-ghost" id="editor-reset">Reset defaults</button>
      </div>`;
    document.body.appendChild(panel);

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'resume-edit-toggle';
    toggleBtn.className = 'resume-edit-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'resume-editor-panel');
    toggleBtn.innerHTML = '&#9998; Edit';
    document.body.appendChild(toggleBtn);

    // Open / close
    toggleBtn.addEventListener('click', () => openPanel(panel, toggleBtn));
    document.getElementById('editor-close').addEventListener('click', () => closePanel(panel, toggleBtn));

    // Close on backdrop click (for mobile sheet)
    panel.addEventListener('click', e => { if (e.target === panel) closePanel(panel, toggleBtn); });

    // Section tabs
    panel.querySelector('.editor-tabs').addEventListener('click', e => {
      const tab = e.target.closest('.editor-tab');
      if (!tab) return;
      panel.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.section;
      renderSection();
    });

    // Reset
    document.getElementById('editor-reset').addEventListener('click', () => {
      if (!confirm('Reset all resume content to defaults? This cannot be undone.')) return;
      data = clone(DEFAULTS);
      localStorage.removeItem(STORAGE_KEY);
      renderResume();
      renderSection();
      const s = document.getElementById('editor-save-status');
      if (s) s.textContent = 'Reset to defaults';
    });

    renderSection();
  }

  function openPanel(panel, btn) {
    panel.classList.add('open');
    btn.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closePanel(panel, btn) {
    panel.classList.remove('open');
    btn.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'false');
  }

  /* ── Section form renderers ────────────────────────────────── */

  function renderSection() {
    const body = document.getElementById('editor-body');
    if (!body) return;
    body.innerHTML = '';
    ({
      summary:        buildSummaryForm,
      education:      buildEducationForm,
      certifications: buildCertsForm,
      skills:         buildSkillsForm,
      experience:     buildExperienceForm,
      projects:       buildProjectsForm,
    }[activeTab] || (() => {}))(body);
    body.scrollTop = 0;
  }

  /* Helper: labelled field wrapper */
  function wrapField(label, inputEl) {
    const wrap = document.createElement('div');
    wrap.className = 'editor-field';
    const lbl = document.createElement('label');
    lbl.className = 'editor-label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    wrap.appendChild(inputEl);
    return wrap;
  }

  function makeInput(val, setter) {
    const el = document.createElement('input');
    el.type = 'text';
    el.className = 'editor-input';
    el.value = val;
    el.addEventListener('input', () => { setter(el.value); onChange(); });
    return el;
  }

  function makeTextarea(val, setter) {
    const el = document.createElement('textarea');
    el.className = 'editor-textarea';
    el.value = val;
    el.addEventListener('input', () => { setter(el.value); onChange(); });
    return el;
  }

  function makeSelect(options, selected, setter) {
    const el = document.createElement('select');
    el.className = 'editor-select';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      if (opt === selected) o.selected = true;
      el.appendChild(o);
    });
    el.addEventListener('change', () => { setter(el.value); onChange(); });
    return el;
  }

  function makeRemoveBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'editor-remove-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  /* ── Summary ───────────────────────────────────────────────── */
  function buildSummaryForm(body) {
    body.appendChild(wrapField('Summary Text', makeTextarea(data.summary, v => { data.summary = v; })));
  }

  /* ── Education ─────────────────────────────────────────────── */
  function buildEducationForm(body) {
    const ed = data.education;
    body.appendChild(wrapField('Degree / Program',     makeInput(ed.degree,     v => { ed.degree     = v; })));
    body.appendChild(wrapField('School / University',  makeInput(ed.school,     v => { ed.school     = v; })));
    body.appendChild(wrapField('Date',                 makeInput(ed.date,       v => { ed.date       = v; })));
    body.appendChild(wrapField('GPA',                  makeInput(ed.gpa,        v => { ed.gpa        = v; })));
    body.appendChild(wrapField('Relevant Coursework',  makeInput(ed.coursework, v => { ed.coursework = v; })));
    body.appendChild(wrapField('Activities / Clubs',   makeInput(ed.activities, v => { ed.activities = v; })));
  }

  /* ── Certifications ────────────────────────────────────────── */
  function buildCertsForm(body) {
    data.certifications.forEach((cert, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'editor-list-item';

      const hdr = document.createElement('div');
      hdr.className = 'editor-list-item-header';
      const lbl = document.createElement('span');
      lbl.className = 'editor-item-num';
      lbl.textContent = `Cert ${i + 1}`;
      hdr.appendChild(lbl);
      hdr.appendChild(makeRemoveBtn('Remove', () => {
        data.certifications.splice(i, 1);
        onChange(); renderSection();
      }));
      wrap.appendChild(hdr);

      wrap.appendChild(wrapField('Title',        makeInput(cert.title, v => { cert.title = v; })));
      wrap.appendChild(wrapField('Organization', makeInput(cert.org,   v => { cert.org   = v; })));
      wrap.appendChild(wrapField('Date',         makeInput(cert.date,  v => { cert.date  = v; })));
      body.appendChild(wrap);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm btn-outline editor-add-btn';
    addBtn.textContent = '+ Add Certification';
    addBtn.addEventListener('click', () => {
      data.certifications.push({ title: 'New Certification', org: '', date: '' });
      onChange(); renderSection();
    });
    body.appendChild(addBtn);
  }

  /* ── Skills ────────────────────────────────────────────────── */
  function buildSkillsForm(body) {
    const LEVELS = ['Familiar', 'Developing', 'Proficient', 'Strong', 'Expert'];

    data.skills.forEach((cat, ci) => {
      const wrap = document.createElement('div');
      wrap.className = 'editor-skill-category';

      // Category name row
      const catHdr = document.createElement('div');
      catHdr.className = 'editor-skill-cat-header';
      const catInput = document.createElement('input');
      catInput.type = 'text';
      catInput.className = 'editor-input editor-cat-name';
      catInput.value = cat.category;
      catInput.addEventListener('input', () => { cat.category = catInput.value; onChange(); });
      catHdr.appendChild(catInput);
      catHdr.appendChild(makeRemoveBtn('Remove', () => {
        if (!confirm(`Remove "${cat.category}" and all its skills?`)) return;
        data.skills.splice(ci, 1);
        onChange(); renderSection();
      }));
      wrap.appendChild(catHdr);

      // Skill rows
      cat.items.forEach((sk, si) => {
        const row = document.createElement('div');
        row.className = 'editor-skill-row';

        const nameIn = document.createElement('input');
        nameIn.type = 'text';
        nameIn.className = 'editor-input';
        nameIn.value = sk.name;
        nameIn.addEventListener('input', () => { sk.name = nameIn.value; onChange(); });

        const lvlSel = makeSelect(LEVELS, sk.level, v => { sk.level = v; });

        const pctWrap = document.createElement('div');
        pctWrap.className = 'editor-pct-wrap';
        const slider = document.createElement('input');
        slider.type = 'range'; slider.min = 0; slider.max = 100; slider.step = 5;
        slider.value = sk.pct;
        slider.className = 'editor-slider';
        const pctNum = document.createElement('span');
        pctNum.className = 'editor-pct-num';
        pctNum.textContent = sk.pct + '%';
        slider.addEventListener('input', () => {
          sk.pct = Number(slider.value);
          pctNum.textContent = sk.pct + '%';
          onChange();
        });
        pctWrap.appendChild(slider);
        pctWrap.appendChild(pctNum);

        const rmBtn = document.createElement('button');
        rmBtn.className = 'editor-remove-btn editor-remove-skill';
        rmBtn.textContent = '✕';
        rmBtn.setAttribute('aria-label', `Remove ${sk.name}`);
        rmBtn.addEventListener('click', () => {
          cat.items.splice(si, 1);
          onChange(); renderSection();
        });

        row.appendChild(nameIn);
        row.appendChild(lvlSel);
        row.appendChild(pctWrap);
        row.appendChild(rmBtn);
        wrap.appendChild(row);
      });

      const addSkillBtn = document.createElement('button');
      addSkillBtn.className = 'btn btn-sm btn-ghost editor-add-skill-btn';
      addSkillBtn.textContent = '+ Add Skill';
      addSkillBtn.addEventListener('click', () => {
        cat.items.push({ name: 'New Skill', level: 'Familiar', pct: 40 });
        onChange(); renderSection();
      });
      wrap.appendChild(addSkillBtn);
      body.appendChild(wrap);
    });

    const addCatBtn = document.createElement('button');
    addCatBtn.className = 'btn btn-sm btn-outline editor-add-btn';
    addCatBtn.textContent = '+ Add Category';
    addCatBtn.addEventListener('click', () => {
      data.skills.push({ category: 'New Category', items: [] });
      onChange(); renderSection();
    });
    body.appendChild(addCatBtn);
  }

  /* ── Experience ────────────────────────────────────────────── */
  function buildExperienceForm(body) {
    data.experience.forEach((exp, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'editor-list-item';

      const hdr = document.createElement('div');
      hdr.className = 'editor-list-item-header';
      const lbl = document.createElement('span');
      lbl.className = 'editor-item-num';
      lbl.textContent = `Position ${i + 1}`;
      hdr.appendChild(lbl);
      hdr.appendChild(makeRemoveBtn('Remove', () => {
        data.experience.splice(i, 1);
        onChange(); renderSection();
      }));
      wrap.appendChild(hdr);

      wrap.appendChild(wrapField('Job Title',    makeInput(exp.title, v => { exp.title = v; })));
      wrap.appendChild(wrapField('Organization', makeInput(exp.org,   v => { exp.org   = v; })));
      wrap.appendChild(wrapField('Date Range',   makeInput(exp.date,  v => { exp.date  = v; })));

      // Bullet points
      const bullLbl = document.createElement('label');
      bullLbl.className = 'editor-label';
      bullLbl.textContent = 'Bullet Points';
      wrap.appendChild(bullLbl);

      exp.bullets.forEach((bullet, bi) => {
        const bRow = document.createElement('div');
        bRow.className = 'editor-bullet-row';
        const bIn = document.createElement('input');
        bIn.type = 'text'; bIn.className = 'editor-input'; bIn.value = bullet;
        bIn.addEventListener('input', () => { exp.bullets[bi] = bIn.value; onChange(); });
        const rmB = document.createElement('button');
        rmB.className = 'editor-remove-btn editor-remove-skill';
        rmB.textContent = '✕';
        rmB.addEventListener('click', () => { exp.bullets.splice(bi, 1); onChange(); renderSection(); });
        bRow.appendChild(bIn);
        bRow.appendChild(rmB);
        wrap.appendChild(bRow);
      });

      const addBulletBtn = document.createElement('button');
      addBulletBtn.className = 'btn btn-sm btn-ghost editor-add-skill-btn';
      addBulletBtn.textContent = '+ Add Bullet';
      addBulletBtn.addEventListener('click', () => {
        exp.bullets.push('');
        onChange(); renderSection();
      });
      wrap.appendChild(addBulletBtn);
      body.appendChild(wrap);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm btn-outline editor-add-btn';
    addBtn.textContent = '+ Add Position';
    addBtn.addEventListener('click', () => {
      data.experience.push({ title: 'New Position', org: '', date: '', bullets: [] });
      onChange(); renderSection();
    });
    body.appendChild(addBtn);
  }

  /* ── Projects ──────────────────────────────────────────────── */
  function buildProjectsForm(body) {
    data.projects.forEach((proj, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'editor-list-item';

      const hdr = document.createElement('div');
      hdr.className = 'editor-list-item-header';
      const lbl = document.createElement('span');
      lbl.className = 'editor-item-num';
      lbl.textContent = `Project ${i + 1}`;
      hdr.appendChild(lbl);
      hdr.appendChild(makeRemoveBtn('Remove', () => {
        data.projects.splice(i, 1);
        onChange(); renderSection();
      }));
      wrap.appendChild(hdr);

      wrap.appendChild(wrapField('Project Title', makeInput(proj.title, v => { proj.title = v; })));
      wrap.appendChild(wrapField('Tech Stack',    makeInput(proj.tech,  v => { proj.tech  = v; })));
      wrap.appendChild(wrapField('Description',   makeTextarea(proj.desc, v => { proj.desc = v; })));
      body.appendChild(wrap);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm btn-outline editor-add-btn';
    addBtn.textContent = '+ Add Project';
    addBtn.addEventListener('click', () => {
      data.projects.push({ title: 'New Project', tech: '', desc: '' });
      onChange(); renderSection();
    });
    body.appendChild(addBtn);
  }

  /* ── Public ────────────────────────────────────────────────── */

  function init() {
    load();
    renderResume();
    createPanel();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ResumeEditor.init());
