/**
 * github.js — GitHub API Integration
 *
 * Fetches public repositories for a configured GitHub username,
 * renders repo cards in a widget, and handles rate limiting gracefully
 * with a static fallback display.
 *
 * Requires: config.js loaded before this script.
 * Requires: escapeHtml() from main.js.
 */

'use strict';

/* ── Language → color mapping (GitHub conventions) ─────────── */
const LANG_COLORS = {
  'Python':     '#3572A5',
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Bash':       '#89e051',
  'Shell':      '#89e051',
  'HTML':       '#e34c26',
  'CSS':        '#563d7c',
  'Go':         '#00ADD8',
  'Rust':       '#dea584',
  'C':          '#555555',
  'C++':        '#f34b7d',
  'Java':       '#b07219',
  'Ruby':       '#701516',
  'PHP':        '#4F5D95',
  'PowerShell': '#012456',
  'default':    '#6e7681',
};

function langColor(lang) {
  return LANG_COLORS[lang] || LANG_COLORS.default;
}

/* ── API Fetch with auth header ─────────────────────────────── */
async function fetchGithubRepos(username, token) {
  const headers = { Accept: 'application/vnd.github.v3+json' };

  // Include auth header only if a token is provided — reduces rate limit risk
  if (token) headers['Authorization'] = `token ${token}`;

  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6&type=public`;

  const res = await fetch(url, { headers });

  // Check for rate limit headers (GitHub sends these on every response)
  const remaining = parseInt(res.headers.get('X-RateLimit-Remaining') || '60');
  const resetAt   = parseInt(res.headers.get('X-RateLimit-Reset') || '0');

  if (res.status === 403 || remaining === 0) {
    const resetDate = new Date(resetAt * 1000).toLocaleTimeString();
    throw new RateLimitError(`GitHub API rate limit reached. Resets at ${resetDate}.`);
  }

  if (res.status === 404) {
    throw new Error(`GitHub user "${username}" not found.`);
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* Custom error class for rate limit handling */
class RateLimitError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'RateLimitError';
  }
}

/* ── Render a single repo card ──────────────────────────────── */
function renderRepoCard(repo) {
  const color       = langColor(repo.language);
  const lang        = repo.language || 'Unknown';
  const stars       = repo.stargazers_count ?? 0;
  const forks       = repo.forks_count ?? 0;
  const description = repo.description || 'No description provided.';
  const updated     = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const el = document.createElement('a');
  el.className  = 'repo-card reveal';
  el.href       = repo.html_url;
  el.target     = '_blank';
  el.rel        = 'noopener noreferrer';
  el.setAttribute('aria-label', `GitHub repository: ${repo.name}`);
  el.innerHTML = `
    <div class="repo-card-header">
      <span class="repo-icon" aria-hidden="true">&#128193;</span>
      <span class="repo-name">${escapeHtml(repo.name)}</span>
      ${repo.fork ? '<span class="badge badge-planned" style="margin-left:auto">Fork</span>' : ''}
    </div>
    <p class="repo-description">${escapeHtml(description)}</p>
    <div class="repo-meta">
      <span>
        <span class="repo-lang-dot" style="background:${color}" aria-hidden="true"></span>
        ${escapeHtml(lang)}
      </span>
      <span title="Stars">&#11088; ${stars}</span>
      <span title="Forks">&#128337; ${forks}</span>
      <span title="Updated" style="margin-left:auto">&#128197; ${updated}</span>
    </div>
  `;
  return el;
}

/* ── Skeleton loading placeholder ───────────────────────────── */
function renderSkeletons(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'repo-card';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="skeleton skeleton-line w-50" style="height:18px;margin-bottom:12px"></div>
      <div class="skeleton skeleton-line" style="margin-bottom:6px"></div>
      <div class="skeleton skeleton-line w-75"></div>
      <div class="skeleton skeleton-line w-33" style="margin-top:16px;height:12px"></div>
    `;
    container.appendChild(el);
  }
}

/* ── Fallback static display when API is unavailable ────────── */
function renderFallback(container, username) {
  container.innerHTML = `
    <div class="alert alert-sim" style="grid-column:1/-1">
      <span aria-hidden="true">&#128279;</span>
      <div>
        <strong>Live GitHub data unavailable</strong><br>
        Viewing static fallback.
        <a href="https://github.com/${encodeURIComponent(username)}" target="_blank" rel="noopener noreferrer">
          View all repositories on GitHub &#8599;
        </a>
      </div>
    </div>
  `;
}

/* ── Rate limit message ─────────────────────────────────────── */
function renderRateLimitMessage(container, message, username) {
  container.innerHTML = `
    <div class="alert alert-warn" style="grid-column:1/-1">
      <span aria-hidden="true">&#9888;</span>
      <div>
        <strong>GitHub API rate limit reached.</strong> ${escapeHtml(message)}<br>
        <a href="https://github.com/${encodeURIComponent(username)}" target="_blank" rel="noopener noreferrer">
          View repositories directly on GitHub &#8599;
        </a>
      </div>
    </div>
  `;
}

/* ── Main initializer ───────────────────────────────────────── */
async function initGitHub() {
  const container = document.querySelector('.repos-grid');
  if (!container) return;

  // Read config — CONFIG is defined in config.js
  const username = (typeof CONFIG !== 'undefined' && CONFIG.GITHUB_USERNAME) || '';
  const token    = (typeof CONFIG !== 'undefined' && CONFIG.GITHUB_TOKEN)    || '';
  const enabled  = (typeof CONFIG !== 'undefined') ? CONFIG.ENABLE_GITHUB_API !== false : true;

  // Update "view all" link with real username
  const viewAllLink = document.querySelector('.github-view-all');
  if (viewAllLink && username) {
    viewAllLink.href = `https://github.com/${encodeURIComponent(username)}`;
  }

  if (!username || !enabled) {
    renderFallback(container, username || 'yourusername');
    return;
  }

  // Show loading skeletons while fetching
  renderSkeletons(container);

  try {
    const repos = await fetchGithubRepos(username, token);

    container.innerHTML = '';
    if (repos.length === 0) {
      container.innerHTML = '<p class="text-muted" style="grid-column:1/-1">No public repositories found.</p>';
      return;
    }

    // Render up to 6 repos
    repos.slice(0, 6).forEach((repo, i) => {
      const card = renderRepoCard(repo);
      card.style.transitionDelay = `${i * 60}ms`;
      container.appendChild(card);
    });

    // Trigger scroll reveal for new cards
    if (typeof ScrollReveal !== 'undefined') ScrollReveal.init();

  } catch (err) {
    console.error('GitHub widget error:', err);

    if (err instanceof RateLimitError) {
      renderRateLimitMessage(container, err.message, username);
    } else {
      renderFallback(container, username);
    }
  }
}

/* ── Init on DOM ready ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initGitHub);
