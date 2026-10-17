// DHAILSM's entrance: the name rises over a red brush stroke, an ink splash bursts open
// to reveal him (reference: character art living inside black ink), then the ink recedes
// and he settles into the concrete page, the same ground as his poster.
import { gsap } from 'gsap';
import { qs, qsa, media, splitLetters } from '../lib/dom.js';
import { splashMask } from '../lib/shapes.js';

export function initReveal() {
  const section = qs('#dhailsm');
  const stage = qs('.reveal__stage');
  const figure = qs('.reveal__figure');
  const img = qs('.reveal__img');
  const ink = qs('.reveal__ink');
  const brush = qs('.reveal__brush');
  const name = qs('.reveal__name');
  const meta = qsa('.reveal__meta > *');

  figure.style.setProperty('--splash', splashMask(31, { radius: 54, arms: 9, drops: 14 }));
  figure.style.setProperty('--splash-ink', splashMask(57, { radius: 58, arms: 11, drops: 18 }));

  // The settled state: the poster with softly feathered edges, no rectangle visible
  const soft = img.cloneNode();
  soft.className = 'reveal__img reveal__img--soft';
  soft.alt = '';
  soft.setAttribute('aria-hidden', 'true');
  figure.append(soft);

  // An outline copy of the name sits in front of the figure so the name reads across him
  const letters = splitLetters(name);
  const front = name.cloneNode(true);
  front.className = 'reveal__name reveal__name--front';
  front.removeAttribute('id');
  front.removeAttribute('data-hero-name');
  front.setAttribute('aria-hidden', 'true');
  stage.append(front);
  const frontLetters = qsa('.ltr', front);

  if (media.reduced.matches) {
    gsap.set(brush, { clipPath: 'inset(0 0% 0 0)' });
    gsap.set([img, ink], { opacity: 0 });
    gsap.set(soft, { opacity: 1 });
    gsap.set(front, { opacity: 1 });
    return;
  }

  gsap.set(soft, { opacity: 0 });
  gsap.set(front, { opacity: 0 });

  // Entering: letters rise, the brush sweeps
  gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 5%', scrub: 0.6 } })
    .from(letters, { yPercent: 108, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0)
    .from(frontLetters, { yPercent: 108, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0)
    .to(brush, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power2.inOut' }, 0.25);

  // Pinned: the splash bursts open, then settles
  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const { desktop } = ctx.conditions;
    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: desktop ? '+=170%' : '+=130%', pin: stage, scrub: 0.8 },
      })
      .fromTo(figure, { '--ink-size': '0%' }, { '--ink-size': '190%', duration: 0.42, ease: 'power2.in' }, 0)
      .fromTo(figure, { '--splash-size': '0%' }, { '--splash-size': '178%', duration: 0.42, ease: 'power2.in' }, 0.04)
      .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 0.55, ease: 'power2.out' }, 0.04)
      .fromTo(name, { scale: 1.06 }, { scale: 1, duration: 0.5 }, 0)
      .to(soft, { opacity: 1, duration: 0.2 }, 0.5)
      .to([img, ink], { opacity: 0, duration: 0.22 }, 0.54)
      .to(front, { opacity: 1, duration: 0.2 }, 0.56)
      .from(meta, { y: 26, opacity: 0, duration: 0.16, stagger: 0.05, ease: 'power2.out' }, 0.7)
      .to({}, { duration: 0.15 });
  });
}
