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
  GITHUB_USERNAME: 'DavisbWells',

  // Personal Access Token — grants higher API rate limits (5000 req/hr vs 60)
  // Create at: https://github.com/settings/tokens → "Fine-grained tokens"
  // Required scopes: public_repo (read-only is sufficient)
  // Leave empty to use unauthenticated requests (60 req/hr limit)
  GITHUB_TOKEN: '',

  // ── Personal Info ──────────────────────────────────────────────────────────
  FULL_NAME: 'Davis Wells',
  TITLE: 'Cybersecurity Student & Aspiring Security Professional',
  EMAIL: 'davisbwells06@gmail.com',
  LINKEDIN_URL: 'https://www.linkedin.com/in/davis-wells-3955923a2',
  GITHUB_PROFILE_URL: 'https://github.com/DavisbWells',

  // ── Supabase ──────────────────────────────────────────────────
  // Get these from supabase.com → your project → Settings → API
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // ── Feature Flags ─────────────────────────────────────────────────────────
  // Set to false to disable the live GitHub API call and use fallback data
  ENABLE_GITHUB_API: true,

  // ── Resume ────────────────────────────────────────────────────────────────
  RESUME_PDF_URL: 'assets/resume.pdf',
};
