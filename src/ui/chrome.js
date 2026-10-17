import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_NAME, RELEASE_LINE, SECTIONS } from '../config.js';
import { qs, qsa } from '../lib/dom.js';
import { tornMask } from '../lib/shapes.js';

/** Applies names and release copy from config so the spelling lives in one place. */
export function applyCopy() {
  qsa('[data-hero-name]').forEach((el) => (el.textContent = HERO_NAME));
  qsa('[data-release-line]').forEach((el) => (el.textContent = RELEASE_LINE));
  document.title = `Street Fighter: ${HERO_NAME}`;
  qs('#intro-video').setAttribute(
    'aria-label',
    `Player select screen landing on ${HERO_NAME}, then a cut to ${HERO_NAME} in a neon-lit club`,
  );
}

/** Torn paper edges: textured grounds cut by a generated mask. */
export function buildTornEdges() {
  qsa('[data-torn]').forEach((el) => {
    el.classList.add(`torn--${el.dataset.tornFill}`);
    const mask = tornMask(Number(el.dataset.tornSeed));
    el.style.webkitMaskImage = mask;
    el.style.maskImage = mask;
    el.style.webkitMaskSize = '100% 100%';
    el.style.maskSize = '100% 100%';
  });
}

export function initMenu({ scroller }) {
  const button = qs('#menu-button');
  const menu = qs('#menu');
  const list = qs('#menu-list');
  const label = qs('.topbar__menu-label');

  SECTIONS.forEach((s) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'menu__link';
    a.href = `#${s.id}`;
    a.textContent = s.label;
    a.dataset.section = s.id;
    li.append(a);
    list.append(li);
  });

  let open = false;
  const setOpen = (value, { restoreFocus = true } = {}) => {
    open = value;
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      scroller.lenis?.stop();
      qs('.menu__link', menu)?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      scroller.lenis?.start();
      setTimeout(() => !open && (menu.hidden = true), 600);
      if (restoreFocus) button.focus({ preventScroll: true });
    }
  };

  button.addEventListener('click', () => setOpen(!open));
  document.addEventListener('keydown', (e) => {
    if (open && e.key === 'Escape') setOpen(false);
  });
  list.addEventListener('click', (e) => {
    const link = e.target.closest('.menu__link');
    if (!link) return;
    e.preventDefault();
    setOpen(false, { restoreFocus: false });
    scroller.to(link.dataset.section);
  });

  return {
    setCurrent(id) {
      qsa('.menu__link', list).forEach((a) => a.setAttribute('aria-current', String(a.dataset.section === id)));
    },
    close: () => open && setOpen(false, { restoreFocus: false }),
  };
}

/** Super meter: one segment per section, filled as each is scrolled through. */
export function initMeter({ onSection }) {
  const track = qs('#meter-track');
  const label = qs('#meter-label');
  SECTIONS.forEach((s) => {
    const el = document.getElementById(s.id);
    const seg = document.createElement('span');
    seg.className = 'meter__seg';
    const fill = document.createElement('i');
    seg.append(fill);
    track.append(seg);
    const setFill = (p) => {
      gsap.set(fill, { scaleX: p });
      seg.classList.toggle('is-full', p >= 1);
    };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onUpdate: (self) => setFill(self.progress),
      onLeave: () => setFill(1),
      onLeaveBack: () => setFill(0),
      onToggle: (self) => {
        if (!self.isActive) return;
        label.textContent = s.label;
        onSection?.(s.id);
      },
    });
  });
}

/** Buttons that jump to a section or replay the opening, wherever they are on the page. */
export function bindActions({ scroller, replay, menu }) {
  document.addEventListener('click', (e) => {
    const jump = e.target.closest('[data-scroll-to]');
    if (jump) {
      e.preventDefault();
      menu.close();
      scroller.to(jump.dataset.scrollTo);
      return;
    }
    const action = e.target.closest('[data-action="replay"]');
    if (action) {
      e.preventDefault();
      menu.close();
      replay();
    }
  });
}
