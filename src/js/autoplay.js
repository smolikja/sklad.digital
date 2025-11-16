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
    { threshold: 0.35 },
  );
};
