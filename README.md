# Cyber Operations Portfolio

A production-ready cybersecurity student portfolio — static site with a dark SOC aesthetic,
built using semantic HTML, modular CSS, and vanilla JavaScript only.
No frameworks. No unnecessary dependencies.

---

## Project Structure

```
cyber-portfolio/
├── index.html                  # Home page (entry point)
├── config.js                   # API keys & config (gitignored — see setup)
├── config.example.js           # Config template (safe to commit)
├── .gitignore
│
├── sections/
│   ├── projects.html           # Projects card grid
│   ├── certifications.html     # Cert tracker with progress bars + timeline
│   ├── labs.html               # Lab writeups with filter chips
│   ├── homelab.html            # Homelab documentation
│   ├── resume.html             # Web resume (printable)
│   └── dashboard.html          # Simulated SOC dashboard
│
├── assets/
│   ├── css/
│   │   ├── main.css            # Design tokens, base styles, nav, layout
│   │   ├── components.css      # Cards, buttons, terminal, badges, skill bars
│   │   └── animations.css      # Keyframes, scroll-reveal, reduced-motion
│   ├── js/
│   │   ├── main.js             # Core: nav, terminal, stats, filters, card builders
│   │   ├── github.js           # GitHub API integration with rate-limit fallback
│   │   └── dashboard.js        # Client-side threat feed & log simulation
│   └── images/
│       └── icons/              # Local icons (add your own)
│
└── data/
    ├── projects.json           # Project entries — edit to add new projects
    ├── certifications.json     # Cert journey data
    └── labs.json               # Lab writeup entries
```

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/cyber-portfolio.git
cd cyber-portfolio
```

### 2. Configure your settings

```bash
cp config.example.js config.js
```

Open `config.js` and fill in:

| Key | Description |
|-----|-------------|
| `GITHUB_USERNAME` | Your GitHub username (required for the repo widget) |
| `GITHUB_TOKEN` | Optional PAT for higher rate limits (5000 vs 60 req/hr) |
| `FULL_NAME` | Your full name |
| `EMAIL` | Contact email |
| `LINKEDIN_URL` | LinkedIn profile URL |

> **Security:** `config.js` is in `.gitignore`. Never commit it. Never push it.

### 3. Update the content

All content is driven by JSON files — no HTML changes needed for new entries:

- **New project:** Add an entry to `data/projects.json`
- **New cert:** Add an entry to `data/certifications.json`
- **New lab writeup:** Add an entry to `data/labs.json`

### 4. Add your resume PDF

Place your resume at `assets/resume.pdf` — the Resume page links directly to it.

### 5. Open locally

Since the site fetches JSON files via `fetch()`, you need a local server (not `file://`):

```bash
# Python 3
python -m http.server 8080

# Node.js (if installed)
npx serve .

# VS Code: install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:8080` in your browser.

---

## Adding Content

### New Project (`data/projects.json`)

```json
{
  "id": 5,
  "title": "Your Project Name",
  "description": "What it does and why you built it.",
  "category": "Security Tools",
  "tech": ["Python", "Nmap", "Linux"],
  "difficulty": "Intermediate",
  "github": "https://github.com/yourusername/your-repo",
  "demo": null,
  "status": "Complete",
  "date": "2026-06",
  "featured": false
}
```

**`category` options:** `Security Tools`, `Scripting`, `Web`, `Research`
**`difficulty` options:** `Beginner`, `Intermediate`, `Advanced`, `Expert`
**`status` options:** `Complete`, `In Progress`

### New Lab Writeup (`data/labs.json`)

```json
{
  "id": 6,
  "title": "Room Name — Platform",
  "platform": "TryHackMe",
  "difficulty": "Medium",
  "date_completed": "2026-06-01",
  "skills": ["Web Security", "SQLi", "Burp Suite"],
  "category": "Web Exploitation",
  "writeup_url": null,
  "notes": "Key takeaway from the lab...",
  "platform_url": "https://tryhackme.com",
  "time_spent_mins": 90
}
```

**`category` options:** `Forensics`, `Network Analysis`, `OSINT`, `Web Exploitation`, `CTF`

### New Certification (`data/certifications.json`)

```json
{
  "id": 5,
  "name": "Certified Cloud Security Professional",
  "code": "CCSP",
  "issuer": "ISC²",
  "status": "planned",
  "progress": 0,
  "date_earned": null,
  "date_planned": "2028-01",
  "badge_url": null,
  "credential_url": null,
  "description": "Advanced cloud security certification.",
  "skills": ["Cloud Architecture", "Data Security", "IAM"],
  "study_hours": 0
}
```

**`status` options:** `earned`, `in-progress`, `planned`

---

## Personalizing the Site

### Your name and title
- Edit `index.html` hero section text
- Edit `sections/resume.html` summary and contact info
- Edit `config.js` → `FULL_NAME`, `TITLE`

### Study streak stat
The study streak counter in `main.js` (`StatsLoader`) is hardcoded to `47`.
Update this value in `main.js` → `StatsLoader.load()` function body.

### Colors
All color tokens are in `assets/css/main.css` → `:root {}`. Change `--green` to
swap the accent color across the entire site.

---

## Deployment — GitHub Pages

1. Push your repo to GitHub (make sure `config.js` is in `.gitignore` and not committed)

2. Go to your repo → **Settings** → **Pages**

3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`

4. Click **Save** — your site will be live at `https://yourusername.github.io/cyber-portfolio/`

5. Update your nav links if you're using a custom domain — set a `CNAME` file in the root.

> The site uses only relative paths, so it works in a subfolder without any configuration changes.

### GitHub Actions (optional CI)

Add `.github/workflows/pages.yml` to auto-deploy on push:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/deploy-pages@v4
```

---

## Security Notes

This site was built with security as a first-class concern — not an afterthought.

### Content Security Policy (CSP)
Every HTML page includes a `Content-Security-Policy` meta tag that:
- Restricts scripts to `'self'` only (no inline JS, no CDN scripts)
- Restricts styles to self + Google Fonts CDN
- Restricts images to self, data URIs, and HTTPS
- Restricts API connections to self + `api.github.com`
- Sets `frame-ancestors 'none'` to prevent clickjacking

### No Inline JavaScript
All JavaScript is in external files loaded with `<script src="...">`. Zero inline
`onclick`, `onload`, or `<script>` blocks in HTML. This satisfies the `script-src 'self'`
CSP directive and is a security best practice.

### Input Sanitization
All user-facing text rendered from JSON or API data is passed through `escapeHtml()`
before being inserted into the DOM via `innerHTML`. This prevents XSS from malicious
JSON content or API responses.

### API Keys
- `config.js` is in `.gitignore` — it must never be committed
- The GitHub token is optional — without it, the API works at 60 req/hr (sufficient for a portfolio)
- Even a read-only GitHub PAT should be treated as a secret

### SRI (Subresource Integrity)
Google Fonts CDN does not support SRI because the CSS response varies by browser
User-Agent to serve optimal font formats. For full SRI compliance, self-host the fonts:

```bash
# Download fonts using google-webfonts-helper:
# https://gwfh.mranftl.com/fonts/inter?subsets=latin
# Place .woff2 files in assets/fonts/
# Update main.css @font-face blocks to point to assets/fonts/
# Remove the Google Fonts <link> tags from HTML
```

### Other Headers
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` — controls referrer leakage
- `X-Frame-Options` equivalent via `frame-ancestors 'none'` in CSP

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Performance | 90+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 85+ |

Key optimizations built in:
- `font-display: swap` via Google Fonts (prevents invisible text during load)
- `loading="lazy"` on images (add when you add real images)
- `IntersectionObserver` for scroll-reveal (no scroll listener jank)
- `requestAnimationFrame` for all counter animations
- `{ passive: true }` on scroll event listeners
- `preconnect` hints for Google Fonts CDN

---

## Accessibility

- All interactive elements have `:focus-visible` styles
- `aria-label` attributes on nav, sections, and icon-only buttons
- `aria-expanded` on the hamburger button, updated by JavaScript
- `role="list"` on nav `<ul>` elements (Safari VoiceOver fix)
- `aria-live="polite"` on terminal (off — screen readers skip the animation)
- Stat counters use semantic numbers in the DOM
- Print stylesheet on resume page
- `prefers-reduced-motion` media query disables all animations

---

## Maintenance

- **Adding a project:** Edit `data/projects.json` only
- **Updating cert progress:** Edit `data/certifications.json` → `progress` field
- **Adding a lab:** Edit `data/labs.json` only
- **Changing accent color:** Edit `--green` in `assets/css/main.css :root`
- **Changing your name:** Edit `config.js` + `index.html` hero + `resume.html`
- **Updating study streak:** Edit the hardcoded `47` in `assets/js/main.js` → `StatsLoader.load()`

---

## License

MIT — use this as a template for your own portfolio. Attribution appreciated but not required.
