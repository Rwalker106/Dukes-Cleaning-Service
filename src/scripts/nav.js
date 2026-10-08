// Mobile menu (hamburger) toggle and dropdown behavior for BaseLayout.astro's nav.
// Dropdown logic is generic over every .has-dropdown item (About, Services, ...) rather
// than hardcoded to one, so adding another dropdown later doesn't require touching this file.

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks?.classList.toggle('is-open');
});

const dropdowns = Array.from(document.querySelectorAll('.has-dropdown')).map((item) => ({
  toggle: item.querySelector('.dropdown-toggle'),
  menu: item.querySelector('.dropdown-menu'),
}));

function closeDropdown(dropdown) {
  dropdown.toggle?.setAttribute('aria-expanded', 'false');
  dropdown.menu?.classList.remove('is-open');
}

function closeAllDropdowns() {
  dropdowns.forEach(closeDropdown);
}

dropdowns.forEach((dropdown) => {
  dropdown.toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = dropdown.toggle.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns();
    dropdown.toggle.setAttribute('aria-expanded', String(!isOpen));
    dropdown.menu?.classList.toggle('is-open', !isOpen);
  });
});

// Click outside any open dropdown closes it.
document.addEventListener('click', (event) => {
  const target = event.target;
  dropdowns.forEach((dropdown) => {
    if (!dropdown.menu?.classList.contains('is-open')) return;
    if (target instanceof Node && !dropdown.menu.contains(target) && target !== dropdown.toggle) {
      closeDropdown(dropdown);
    }
  });
});

// Escape closes all dropdowns regardless of focus location.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAllDropdowns();
});

// Solid/blurred navbar background once the page scrolls past the top (see #navbar.scrolled in style.css).
const navbar = document.getElementById('navbar');
const SCROLL_THRESHOLD = 50;

function updateScrolledState() {
  navbar?.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}

window.addEventListener('scroll', updateScrolledState, { passive: true });
updateScrolledState();
