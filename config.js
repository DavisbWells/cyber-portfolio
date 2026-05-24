/**
 * config.js — API Keys & Site Configuration
 *
 * ⚠ SECURITY WARNING: This file is listed in .gitignore.
 * It must NEVER be committed to a public repository.
 * Exposing API tokens in version control is an irreversible security incident.
 *
 * Setup: Copy config.example.js to config.js and fill in your values.
 */

const CONFIG = {
  // ── GitHub Integration ─────────────────────────────────────────────────────
  // Your GitHub username (public — safe to store here)
  GITHUB_USERNAME: 'yourusername',

  // Personal Access Token — grants higher API rate limits (5000 req/hr vs 60)
  // Create at: https://github.com/settings/tokens → "Fine-grained tokens"
  // Required scopes: public_repo (read-only is sufficient)
  // Leave empty to use unauthenticated requests (60 req/hr limit)
  GITHUB_TOKEN: '',

  // ── Personal Info ──────────────────────────────────────────────────────────
  FULL_NAME: 'Your Name',
  TITLE: 'Cybersecurity Student & Aspiring Security Professional',
  EMAIL: 'your.email@example.com',
  LINKEDIN_URL: 'https://www.linkedin.com/in/yourprofile',
  GITHUB_PROFILE_URL: 'https://github.com/yourusername',

  // ── Feature Flags ─────────────────────────────────────────────────────────
  // Set to false to disable the live GitHub API call and use fallback data
  ENABLE_GITHUB_API: true,

  // ── Resume ────────────────────────────────────────────────────────────────
  RESUME_PDF_URL: 'assets/resume.pdf',
};
