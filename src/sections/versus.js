// Versus screen: DHAILSM is always player one; the roster picks player two.
// Hovering a portrait previews it (as on a real select screen), clicking or arrow keys lock it in.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OPPONENTS } from '../config.js';
import { qs, qsa, media } from '../lib/dom.js';
import { inkBandPath } from '../lib/shapes.js';

export function initVersus() {
  const reduced = media.reduced.matches;
  const section = qs('#versus');
  const roster = qs('#roster');
  const p1 = qs('.fighter--p1');
  const p2 = qs('#opponent');
  const p2Frame = qs('.fighter__frame', p2);
  const p2Img = qs('#opponent-img');
  const p2Name = qs('#opponent-name');
  const p2Actor = qs('#opponent-actor');
  const vsBox = qs('.versus__vs');
  const vs = qsa('.versus__vs span');
  gsap.set(vsBox, { skewX: -10 });
  const status = qs('#versus-status');

  qs('[data-ink-band]', section).setAttribute('d', inkBandPath(5));

  // Roster tiles
  const tiles = OPPONENTS.map((o, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'roster__tile';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(i === 0));
    b.tabIndex = i === 0 ? 0 : -1;
    b.dataset.id = o.id;
    b.innerHTML = `<span class="roster__portrait" style="--face:${o.face}"><img src="${o.image}" width="${o.width}" height="${o.height}" alt="" loading="lazy" decoding="async"></span><span class="roster__label">${o.name}</span>`;
    b.setAttribute('aria-label', `${o.name}, played by ${o.actor}`);
    roster.append(b);
    return b;
  });

  // Warm the poster cache so swaps are instant
  ScrollTrigger.create({
    trigger: section,
    start: 'top 200%',
    once: true,
    onEnter: () => OPPONENTS.forEach((o) => (new Image().src = o.image)),
  });

  let current = OPPONENTS[0].id;
  gsap.set(p2Img, { '--frame': OPPONENTS[0].frame });

  function select(id, { announce = true } = {}) {
    if (id === current) return;
    current = id;
    const o = OPPONENTS.find((x) => x.id === id);
    tiles.forEach((t) => {
      const on = t.dataset.id === id;
      t.setAttribute('aria-checked', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (announce) status.textContent = `${o.name} selected, played by ${o.actor}`;

    const swap = () => {
      p2Img.src = o.image;
      p2Img.width = o.width;
      p2Img.height = o.height;
      p2Img.alt = `${o.name}, played by ${o.actor}`;
      p2Img.style.setProperty('--frame', o.frame);
      p2Name.textContent = o.name;
      p2Actor.textContent = o.actor;
    };
    if (reduced) return swap();

    // The swap animates the image inside its window and the VS container, leaving the
    // scroll-driven entrance (frame + VS letters) untouched
    gsap.killTweensOf([p2Img, vsBox]);
    gsap
      .timeline()
      .to(p2Img, { xPercent: 22, opacity: 0, duration: 0.14, ease: 'power2.in', onComplete: swap })
      .fromTo(p2Img, { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.42, ease: 'power4.out' })
      .fromTo(vsBox, { scale: 1.35 }, { scale: 1, duration: 0.32, ease: 'back.out(3)' }, '<');
  }

  tiles.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.id));
    t.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') select(t.dataset.id);
    });
    t.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tiles[(i + step + tiles.length) % tiles.length];
      next.focus();
      select(next.dataset.id);
    });
  });

  if (reduced) return;

  // Fighters slide in from opposite sides as the screen arrives
  gsap
    .timeline({ scrollTrigger: { trigger: section, start: 'top 65%', end: 'top 10%', scrub: 0.6 } })
    .from(qs('.fighter__frame', p1), { xPercent: -45, opacity: 0, duration: 1 }, 0)
    .from(p2Frame, { xPercent: 45, opacity: 0, duration: 1 }, 0)
    .from(vs, { scale: 2.2, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.in' }, 0.35)
    .from('.versus__title', { yPercent: 40, opacity: 0, duration: 0.6 }, 0)
    .from(tiles, { y: 30, opacity: 0, duration: 0.4, stagger: 0.08 }, 0.5);
}
