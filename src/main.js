import '@fontsource/anton/latin-400.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/sections.css';
import './styles/temple.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { media } from './lib/dom.js';
import { createScroller } from './lib/scroll.js';
import { bindSoundToggles } from './lib/sound.js';
import { applyCopy, buildTornEdges, initMenu, initMeter, bindActions } from './ui/chrome.js';
import { initViewer } from './ui/viewer.js';
import { initIntro } from './sections/intro.js';
import { initIdentity } from './sections/identity.js';
import { initReveal } from './sections/reveal.js';
import { initForms } from './sections/forms.js';
import { initTemple } from './sections/temple.js';
import { initReel } from './sections/reel.js';
import { initVersus } from './sections/versus.js';
import { initFinale } from './sections/finale.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

// Always begin at the title screen, not halfway down a previous visit
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

async function boot() {
  applyCopy();
  buildTornEdges();
  bindSoundToggles();

  const scroller = createScroller({ smooth: !media.reduced.matches });
  scroller.lock();

  // Layout depends on Anton's metrics; measure only once the fonts are in
  await document.fonts.ready;

  const menu = initMenu({ scroller });
  const { replay } = initIntro({ scroller });

  // Scroll-driven sections in page order, so each pin accounts for the ones above it
  initIdentity();
  initReveal();
  initForms();
  initTemple();
  initReel({ scroller });
  initVersus();
  const finale = initFinale();

  initMeter({ onSection: (id) => menu.setCurrent(id) });
  initViewer({ scroller });
  bindActions({
    scroller,
    menu,
    replay: () => {
      finale.continue.reset(); // a new run gets a fresh countdown
      replay();
    },
  });

  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

boot();
