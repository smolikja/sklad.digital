export const initMediaSlides = ({ openLightbox, autoplayObserver }) => {
  const slides = document.querySelectorAll('.member__slide');

  slides.forEach((slide) => {
    const media = slide.querySelector('video, img');
    if (!media) {
      return;
    }

    const caption = slide.querySelector('figcaption')?.textContent?.trim() ?? '';
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
      media.addEventListener('canplay', () => {
        if (!autoplayObserver) {
          media
            .play()
            .catch(() => {
              /* autoplay ignored */
            });
        }
      });
      autoplayObserver?.observe(media);
    }

    media.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox?.(media, caption);
    });

    media.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox?.(media, caption);
      }
    });
  });
};
