/* ================================================================
   PORTFOLIO — script.js
   ================================================================ */

'use strict';

const GITHUB_USERNAME = 'gowtham495';
const MAX_REPOS = 12;

/* ── Theme ── */
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    applyTheme(saved);
  } else {
    applyTheme(prefersDark.matches ? 'dark' : 'light');
  }
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ── Nav scroll & burger ── */
const navbar = document.getElementById('navbar');
const navBurger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveLink();
}, { passive: true });

navBurger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (!link) return;
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

/* ── Typed text ── */
const phrases = [
  'Software Developer',
  'Open Source Enthusiast',
  'Problem Solver',
  'Continuous Learner',
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  const currentPhrase = phrases[phraseIndex % phrases.length];
  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }
  typedEl.textContent = currentPhrase.substring(0, charIndex);

  let delay = isDeleting ? 60 : 100;
  if (!isDeleting && charIndex === currentPhrase.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex++;
    delay = 400;
  }
  setTimeout(type, delay);
}
type();

/* ── Footer year ── */
document.getElementById('currentYear').textContent = new Date().getFullYear();

/* ── Reveal on scroll ── */
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, entryIndex) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), entryIndex * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => observer.observe(el));
}
observeReveal();

/* ── Language colour lookup ── */
const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  Go: '#00add8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Dart: '#00b4ab',
};

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8892a4';
}

/* ── GitHub API ── */
async function fetchGitHubData() {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`),
  ]);
  if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');
  const user = await userRes.json();
  const repos = await reposRes.json();
  return { user, repos };
}

function updateStats(user, repos) {
  document.getElementById('repoCount').textContent = user.public_repos ?? repos.length;
  document.getElementById('followerCount').textContent = user.followers ?? '—';
  const stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  document.getElementById('starCount').textContent = stars;
}

function buildFilterBar(repos) {
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  const filterBar = document.getElementById('filterBar');
  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.lang = lang;
    btn.textContent = lang;
    filterBar.appendChild(btn);
  });

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(repos, btn.dataset.lang);
  });
}

function createProjectCard(repo, delay) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.style.animationDelay = `${delay * 0.06}s`;

  const langColor = getLangColor(repo.language);
  const desc = repo.description
    ? (repo.description.length > 100 ? repo.description.slice(0, 97) + '…' : repo.description)
    : 'No description provided.';

  card.innerHTML = `
    <div class="project-card-top">
      <div class="project-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 3h6l2 3H21a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
        </svg>
      </div>
      <div class="project-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener" aria-label="View repository">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        ${repo.homepage ? `
        <a href="${repo.homepage}" target="_blank" rel="noopener" aria-label="Live demo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>` : ''}
      </div>
    </div>
    <h3 class="project-name">${repo.name}</h3>
    <p class="project-desc">${desc}</p>
    <div class="project-footer">
      ${repo.language ? `
      <span class="project-lang">
        <span class="lang-dot" style="background:${langColor};"></span>
        ${repo.language}
      </span>` : ''}
      <span class="project-stat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${repo.stargazers_count}
      </span>
      <span class="project-stat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
        </svg>
        ${repo.forks_count}
      </span>
    </div>
  `;
  return card;
}

function renderProjects(repos, langFilter = 'all') {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';

  const filtered = repos
    .filter(r => !r.fork)
    .filter(r => langFilter === 'all' || r.language === langFilter)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="error-state"><p>No repositories found for this filter.</p></div>';
    return;
  }

  filtered.forEach((repo, i) => {
    grid.appendChild(createProjectCard(repo, i));
  });

  document.getElementById('projectsMore').style.display = 'block';
}

async function initProjects() {
  try {
    const { user, repos } = await fetchGitHubData();
    updateStats(user, repos);
    buildFilterBar(repos);
    renderProjects(repos);
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    document.getElementById('projectsGrid').innerHTML = `
      <div class="error-state">
        <p>Could not load projects at this time.</p>
        <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" rel="noopener" class="btn btn-outline">
          View on GitHub →
        </a>
      </div>`;
  }
}

initProjects();
