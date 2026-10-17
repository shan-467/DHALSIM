// Finale: the golden radiance cinematic (B80C628D) with the name rising in gold, then the
// letterbox closes to a single gold line, and an arcade "Continue?" counts down.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa, media, splitLetters } from '../lib/dom.js';
import { loadWhenNear, safePlay } from '../lib/video.js';

export function initFinale() {
  const reduced = media.reduced.matches;
  const section = qs('#finale');
  const stage = qs('.finale__stage');
  const video = qs('.finale__video');
  const letters = splitLetters(qs('.finale__name'));
  loadWhenNear([video], '120% 0px');

  // The cinematic plays once per arrival and holds on its golden last frame
  if (!reduced) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      onEnter: () => {
        video.currentTime = 0;
        safePlay(video);
      },
      onLeaveBack: () => video.pause(),
    });

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', pin: stage, scrub: 0.7 },
      })
      .from(letters, { yPercent: 108, duration: 0.3, stagger: 0.035, ease: 'power3.out' }, 0)
      .from('.finale__release', { opacity: 0, y: 20, duration: 0.15 }, 0.28)
      .to({}, { duration: 0.2 })
      .to('.finale__bar', { scaleY: 1, duration: 0.32, ease: 'power2.in' }, 0.62)
      .to('.finale__seam', { opacity: 1, scaleX: 1, duration: 0.08 }, 0.9);
  }

  return { continue: initContinue(reduced) };
}

function initContinue(reduced) {
  const box = qs('#continue');
  const label = qs('#continue-label');
  const count = qs('#continue-count');
  let n = 9;
  let timer = null;

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  const tick = () => {
    n -= 1;
    count.textContent = String(n);
    if (!reduced) gsap.fromTo(count, { scale: 1.25 }, { scale: 1, duration: 0.35, ease: 'power3.out' });
    if (n === 0) {
      stop();
      box.classList.add('is-over');
      label.textContent = 'Thanks for playing';
    }
  };
  const run = () => {
    if (timer || n === 0) return;
    timer = setInterval(tick, 1000);
  };

  ScrollTrigger.create({
    trigger: box,
    start: 'top 55%',
    end: 'bottom 45%',
    onToggle: (self) => (self.isActive ? run() : stop()),
  });

  return {
    reset() {
      stop();
      n = 9;
      count.textContent = '9';
      box.classList.remove('is-over');
      label.textContent = 'Continue?';
    },
  };
}
