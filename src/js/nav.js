const navMediaQuery = window.matchMedia('(min-width: 640px)');

const toggleNavClasses = (navMenu, navToggle, isDesktop) => {
  if (!navMenu) {
    return;
  }

  if (isDesktop) {
    navMenu.classList.remove('is-open');
    navMenu.removeAttribute('hidden');
    navToggle?.setAttribute('aria-expanded', 'false');
    return;
  }

  const isExpanded = navToggle?.getAttribute('aria-expanded') === 'true';
  navMenu.classList.toggle('is-open', Boolean(isExpanded));
  if (isExpanded) {
    navMenu.removeAttribute('hidden');
  } else {
    navMenu.setAttribute('hidden', '');
  }
};

export const initNav = () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (!navMenu) {
    return;
  }

  toggleNavClasses(navMenu, navToggle, navMediaQuery.matches);

  const handler = (event) => toggleNavClasses(navMenu, navToggle, event.matches);
  if (typeof navMediaQuery.addEventListener === 'function') {
    navMediaQuery.addEventListener('change', handler);
  } else if (typeof navMediaQuery.addListener === 'function') {
    navMediaQuery.addListener(handler);
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (navMediaQuery.matches) {
        return;
      }

      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      toggleNavClasses(navMenu, navToggle, false);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMediaQuery.matches) {
        return;
      }
      navToggle?.setAttribute('aria-expanded', 'false');
      toggleNavClasses(navMenu, navToggle, false);
    });
  });
};
