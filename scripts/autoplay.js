export const createAutoplayObserver = () => {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
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
    { threshold: 0.1 },
  );
};

export const playIfInView = (video) => {
  const rect = video.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const isVisible =
    rect.top < viewportHeight * 0.9 &&
    rect.bottom > viewportHeight * 0.1 &&
    rect.left < viewportWidth &&
    rect.right > 0;

  if (isVisible) {
    video
      .play()
      .catch(() => {
        /* ignore autoplay errors */
      });
  }
};
