const root = document.documentElement;
root.classList.remove('no-js');
root.classList.add('js-enabled');

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const navMediaQuery = window.matchMedia('(min-width: 640px)');

const updateNavVisibility = (isDesktop) => {
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

if (navMenu) {
  updateNavVisibility(navMediaQuery.matches);
  const handler = (event) => updateNavVisibility(event.matches);
  if (typeof navMediaQuery.addEventListener === 'function') {
    navMediaQuery.addEventListener('change', handler);
  } else if (typeof navMediaQuery.addListener === 'function') {
    navMediaQuery.addListener(handler);
  }
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    if (navMediaQuery.matches) {
      return;
    }

    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    navToggle.setAttribute('aria-expanded', String(nextState));
    updateNavVisibility(false);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMediaQuery.matches) {
        return;
      }

      navToggle.setAttribute('aria-expanded', 'false');
      updateNavVisibility(false);
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

// (Removed) JS-based highlight — using semantic <mark> in HTML instead.

const lightbox = document.getElementById('media-lightbox');
const lightboxMedia = lightbox?.querySelector('.lightbox__media');
const lightboxCaption = lightbox?.querySelector('.lightbox__caption');
let activeMedia = null;
let activeMediaWasPaused = true;

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
  if (activeMedia && !activeMediaWasPaused) {
    activeMedia
      .play()
      .catch(() => {
        /* resume is best-effort */
      });
  }
  activeMedia = null;
  activeMediaWasPaused = true;
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

  activeMedia = media;
  activeMediaWasPaused = media.paused;

  clearLightbox();
  const tag = media.tagName;
  let element;

  if (tag === 'VIDEO') {
    const sourceTime = media.currentTime ?? 0;
    element = document.createElement('video');
    element.src = media.currentSrc || media.getAttribute('src') || '';
    element.controls = true;
    element.preload = 'auto';
    element.setAttribute('playsinline', '');
    element.setAttribute('webkit-playsinline', '');
    element.muted = false;
    element.removeAttribute('muted');
    element.loop = true;
    const poster = media.getAttribute('poster');
    if (poster) {
      element.poster = poster;
    }
    const syncTime = () => {
      if (sourceTime > 0) {
        try {
          element.currentTime = Math.min(sourceTime, element.duration || sourceTime);
        } catch {
          /* ignore invalid seek */
        }
      }
    };
    element.addEventListener('loadedmetadata', syncTime, { once: true });
    if (element.readyState >= 1) {
      syncTime();
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

const intersectionSupported = 'IntersectionObserver' in window;
const videoAutoplayObserver = intersectionSupported
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* ignore autoplay errors */
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 },
    )
  : null;

const mediaSlides = document.querySelectorAll('.member__slide');
mediaSlides.forEach((slide) => {
  const media = slide.querySelector('video, img');
  if (!media) {
    return;
  }

  if (media.tagName === 'VIDEO') {
    media.muted = true;
    media.autoplay = false;
    media.loop = true;
    media.playsInline = true;
    media.setAttribute('playsinline', '');
    media.setAttribute('webkit-playsinline', '');
    media.removeAttribute('autoplay');
    media.addEventListener('canplay', () => {
      if (!videoAutoplayObserver) {
        media
          .play()
          .catch(() => {
            /* autoplay ignored */
          });
      }
    });
    videoAutoplayObserver?.observe(media);
  }

  const caption = slide.querySelector('figcaption')?.textContent?.trim() ?? '';
  media.setAttribute('tabindex', '0');
  media.setAttribute('role', 'button');
  media.setAttribute('aria-label', caption ? `Otevřít detail: ${caption}` : 'Otevřít detail ukázky');

  media.addEventListener('click', (event) => {
    event.preventDefault();
    openLightbox(media, caption);
  });

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
