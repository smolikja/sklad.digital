const getMaxScroll = (track) => Math.max(0, track.scrollWidth - track.clientWidth);

const setupCarousel = (wrapper) => {
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

  const updateButtons = () => {
    const maxScroll = getMaxScroll(track);
    const left = track.scrollLeft;
    prevButton.disabled = left <= 4;
    nextButton.disabled = left >= maxScroll - 4;
    wrapper.classList.toggle('can-scroll-prev', left > 4);
    wrapper.classList.toggle('can-scroll-next', left < maxScroll - 4);
  };

  const scrollByOffset = (direction) => {
    const offset = track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: offset, behavior: 'smooth' });
  };

  prevButton.addEventListener('click', () => scrollByOffset(-1));
  nextButton.addEventListener('click', () => scrollByOffset(1));

  track.addEventListener(
    'scroll',
    () => window.requestAnimationFrame(updateButtons),
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
};

export const initMemberCarousels = () => {
  const wrappers = document.querySelectorAll('[data-member-carousel]');
  wrappers.forEach(setupCarousel);
};
