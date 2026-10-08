// Light/dark theme toggle. Initial theme is applied synchronously in BaseLayout.astro's
// inline <script is:inline> (before paint, to avoid a flash of the wrong theme) — this file
// only handles the button click, persistence, and keeping secondary UI (theme-color meta) in sync.

const THEME_STORAGE_KEY = 'theme';
const LIGHT_THEME_COLOR = '#1E3A8A';
const DARK_THEME_COLOR = '#0F172A';

const themeToggle = document.getElementById('theme-toggle');
// Two tags exist (light/dark prefers-color-scheme variants) — once the user manually
// toggles, both get set to the same resolved color so OS preference no longer overrides it.
const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  const color = theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  themeColorMetas.forEach((meta) => meta.setAttribute('content', color));
}

// Sync the button's aria-label/theme-color meta with whatever the inline script already applied.
applyTheme(document.documentElement.getAttribute('data-theme') || 'light');

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch (e) {}
});
