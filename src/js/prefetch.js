const isVideo = (url) => /\.(mp4|webm|mov)$/i.test(url);

const warmImage = (url) => {
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  img.referrerPolicy = 'no-referrer';
  img.src = url;
};

const warmVideo = (url) => {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.src = url;
  video.load();
};

const warmAsset = (url) => {
  if (!url) return;
  if (isVideo(url)) {
    warmVideo(url);
    return;
  }
  warmImage(url);
};

export const warmMemberAssets = (assets = []) => {
  if (!assets.length) return;

  const start = () => {
    assets.forEach(warmAsset);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 0);
  }
};
