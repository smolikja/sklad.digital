import { playIfInView } from './autoplay.js';

export const initMediaSlides = ({ openLightbox, autoplayObserver }) => {
  const slides = document.querySelectorAll('.member__slide');

  slides.forEach((slide) => {
    const media = slide.querySelector('video, img');
    if (!media) {
      return;
    }

    const caption = slide.querySelector('figcaption')?.textContent?.trim() ?? media.getAttribute('alt') ?? '';
    media.dataset.caption = caption;
    media.setAttribute('tabindex', '0');
    media.setAttribute('role', 'button');
    media.setAttribute('aria-label', caption ? `Otevřít detail: ${caption}` : 'Otevřít detail ukázky');

    if (media.tagName === 'VIDEO') {
      media.muted = true;
      media.autoplay = false;
      media.loop = true;
      media.playsInline = true;
      media.setAttribute('playsinline', '');
      media.setAttribute('webkit-playsinline', '');
      media.removeAttribute('autoplay');
      media.preload = 'auto';
      media.load();
      media.addEventListener('canplay', () => {
        if (!autoplayObserver) {
          media
            .play()
            .catch(() => {
              /* autoplay ignored */
            });
        } else {
          playIfInView(media);
        }
      });
      media.addEventListener('loadeddata', () => playIfInView(media));
      autoplayObserver?.observe(media);
      playIfInView(media);
    }

    media.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox?.(media, caption);
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.target.closest('.member__control')) {
      return;
    }
    const slide = event.target.closest('.member__slide');
    if (!slide) {
      return;
    }
    const media = slide.querySelector('video, img');
    if (!media) {
      return;
    }
    event.preventDefault();
    openLightbox?.(media, media.dataset.caption ?? '');
  });
};
