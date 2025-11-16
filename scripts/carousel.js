const getMaxScroll = (track) => Math.max(0, track.scrollWidth - track.clientWidth);

const setupCarousel = (wrapper) => {
  const track = wrapper.querySelector('.member__carousel');
  const slides = track ? Array.from(track.querySelectorAll('.member__slide')) : [];
  let slideOffsets = [];

  if (!track) {
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
    } else {
      wrapper.classList.remove('is-single');
    }
  };

  setSingleState(false);

  if (slides.length <= 1) {
    setSingleState(true);
    return;
  }

  const computeOffsets = () => {
    slideOffsets = slides.map((slide) => slide.offsetLeft);
  };

  computeOffsets();

  const updateButtons = () => {
    const maxScroll = getMaxScroll(track);
    const left = track.scrollLeft;
    wrapper.classList.toggle('can-scroll-prev', left > 4);
    wrapper.classList.toggle('can-scroll-next', left < maxScroll - 4);
  };

  track.addEventListener(
    'scroll',
    () => window.requestAnimationFrame(updateButtons),
    { passive: true },
  );

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = slideOffsets.find((pos) => pos > track.scrollLeft + 8);
      const target = typeof next === 'number' ? next : getMaxScroll(track);
      track.scrollTo({ left: target, behavior: 'smooth' });
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = [...slideOffsets].reverse().find((pos) => pos < track.scrollLeft - 8);
      const target = typeof prev === 'number' ? prev : 0;
      track.scrollTo({ left: target, behavior: 'smooth' });
    }
  });

  track.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        track.scrollBy({ left: event.deltaY, behavior: 'auto' });
      }
    },
    { passive: false },
  );

  const resizeHandler = () => {
    computeOffsets();
    window.requestAnimationFrame(updateButtons);
  };
  window.addEventListener('resize', resizeHandler);

  computeOffsets();
  updateButtons();
};

export const initMemberCarousels = () => {
  const wrappers = document.querySelectorAll('[data-member-carousel]');
  wrappers.forEach(setupCarousel);
};
