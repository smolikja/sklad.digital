const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const navMediaQuery = window.matchMedia('(min-width: 640px)');

const syncNav = (isDesktop) => {
  if (!navMenu) {
    return;
  }

  if (isDesktop) {
    navMenu.hidden = false;
    navMenu.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  } else {
    const shouldHide = navToggle?.getAttribute('aria-expanded') !== 'true';
    navMenu.hidden = shouldHide;
  }
};

if (navMenu) {
  navMenu.hidden = true;
  syncNav(navMediaQuery.matches);
  const handler = (event) => syncNav(event.matches);
  if (typeof navMediaQuery.addEventListener === 'function') {
    navMediaQuery.addEventListener('change', handler);
  } else if (typeof navMediaQuery.addListener === 'function') {
    navMediaQuery.addListener(handler);
  }
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    navMenu.classList.toggle('is-open', !isExpanded);
    navMenu.hidden = isExpanded;
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      if (!navMediaQuery.matches) {
        navMenu.hidden = true;
      }
    });
  });
}

const currentYear = document.getElementById('current-year');
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const carouselWrappers = document.querySelectorAll('[data-member-carousel]');

carouselWrappers.forEach((wrapper) => {
  const track = wrapper.querySelector('.member__carousel');
  const slides = track ? Array.from(track.querySelectorAll('.member__slide')) : [];
  const prevButton = wrapper.querySelector('[data-direction="prev"]');
  const nextButton = wrapper.querySelector('[data-direction="next"]');

  if (!track || !prevButton || !nextButton) {
    return;
  }

  if (!track.hasAttribute('tabindex')) {
    track.setAttribute('tabindex', '0');
  }

  track.setAttribute('role', 'region');
  track.setAttribute('aria-roledescription', 'carousel');

  const setSingleState = (isSingle) => {
    if (isSingle) {
      wrapper.classList.add('is-single');
      prevButton.disabled = true;
      nextButton.disabled = true;
    } else {
      wrapper.classList.remove('is-single');
    }
  };

  setSingleState(false);

  if (slides.length <= 1) {
    setSingleState(true);
    return;
  }

  const getMaxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  const updateButtons = () => {
    const maxScroll = getMaxScroll();
    const left = track.scrollLeft;
    prevButton.disabled = left <= 4;
    nextButton.disabled = left >= maxScroll - 4;
  };

  const scrollByOffset = (direction) => {
    const offset = track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  prevButton.addEventListener('click', () => scrollByOffset(-1));
  nextButton.addEventListener('click', () => scrollByOffset(1));

  track.addEventListener(
    'scroll',
    () => {
      window.requestAnimationFrame(updateButtons);
    },
    { passive: true },
  );

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByOffset(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByOffset(-1);
    }
  });

  const resizeHandler = () => window.requestAnimationFrame(updateButtons);
  window.addEventListener('resize', resizeHandler);

  updateButtons();
});

const lightbox = document.getElementById('media-lightbox');
const lightboxMedia = lightbox?.querySelector('.lightbox__media');
const lightboxCaption = lightbox?.querySelector('.lightbox__caption');

const clearLightbox = () => {
  if (!lightbox || !lightboxMedia || !lightboxCaption) {
    return;
  }
  const videos = lightboxMedia.querySelectorAll('video');
  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
  lightboxMedia.innerHTML = '';
  lightboxCaption.textContent = '';
};

const closeLightbox = () => {
  if (!lightbox) {
    return;
  }
  if (typeof lightbox.close === 'function' && lightbox.open) {
    lightbox.close();
  } else {
    lightbox.removeAttribute('open');
    clearLightbox();
  }
};

const openLightbox = (media, caption) => {
  if (!lightbox || !lightboxMedia || !lightboxCaption) {
    return;
  }

  clearLightbox();
  const tag = media.tagName;
  let element;

  if (tag === 'VIDEO') {
    element = document.createElement('video');
    element.src = media.currentSrc || media.getAttribute('src') || '';
    element.controls = true;
    element.preload = 'metadata';
    element.setAttribute('playsinline', '');
    element.setAttribute('webkit-playsinline', '');
    const poster = media.getAttribute('poster');
    if (poster) {
      element.poster = poster;
    }
  } else {
    element = document.createElement('img');
    element.src = media.currentSrc || media.getAttribute('src') || '';
    element.alt = media.getAttribute('alt') || caption || '';
    element.decoding = 'async';
    element.loading = 'lazy';
  }

  element.classList.add('lightbox__asset');
  lightboxMedia.appendChild(element);

  if (caption) {
    lightboxCaption.textContent = caption;
  } else if (tag === 'IMG') {
    lightboxCaption.textContent = media.getAttribute('alt') || '';
  }

  if (typeof lightbox.showModal === 'function') {
    lightbox.showModal();
  } else {
    lightbox.setAttribute('open', '');
  }

  if (element.tagName === 'VIDEO') {
    element
      .play()
      .catch(() => {
        /* ignore autoplay errors */
      });
  }
};

const mediaSlides = document.querySelectorAll('.member__slide');
mediaSlides.forEach((slide) => {
  const media = slide.querySelector('video, img');
  if (!media) {
    return;
  }

  const caption = slide.querySelector('figcaption')?.textContent?.trim() ?? '';
  media.setAttribute('tabindex', '0');
  media.setAttribute('role', 'button');
  media.setAttribute('aria-label', caption ? `Otevřít detail: ${caption}` : 'Otevřít detail ukázky');

  media.addEventListener('click', () => openLightbox(media, caption));

  media.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(media, caption);
    }
  });
});

if (lightbox) {
  lightbox.addEventListener('close', clearLightbox);
  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });

  lightbox.addEventListener('click', (event) => {
    const rect = lightbox.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      closeLightbox();
    }
  });

  const closeButton = lightbox.querySelector('.lightbox__close');
  closeButton?.addEventListener('click', (event) => {
    event.preventDefault();
    closeLightbox();
  });
}
