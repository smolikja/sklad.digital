let activeMedia = null;
let activeMediaWasPaused = true;
let activeMediaIsVideo = false;

export const initLightbox = () => {
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
    if (activeMediaIsVideo && activeMedia && typeof activeMedia.play === 'function' && !activeMediaWasPaused) {
      activeMedia
        .play()
        .catch(() => {
          /* resume is best-effort */
        });
    }
    activeMedia = null;
    activeMediaWasPaused = true;
    activeMediaIsVideo = false;

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
    activeMediaIsVideo = media.tagName === 'VIDEO';

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

  return { openLightbox, closeLightbox };
};
