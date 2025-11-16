import { initNav } from './nav.js';
import { updateCurrentYear } from './year.js';
import { initMemberCarousels } from './carousel.js';
import { initLightbox } from './lightbox.js';
import { createAutoplayObserver } from './autoplay.js';
import { initMediaSlides } from './media-slides.js';

const root = document.documentElement;
root.classList.remove('no-js');
root.classList.add('js-enabled');

initNav();
updateCurrentYear();
initMemberCarousels();
const { openLightbox } = initLightbox();
const videoAutoplayObserver = createAutoplayObserver();
initMediaSlides({ openLightbox, autoplayObserver: videoAutoplayObserver });
