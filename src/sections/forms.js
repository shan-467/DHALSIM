// Live action vs game art: a full-bleed comparison. The divider also splits the ground
// (concrete paper vs gold-black) and the typography, so the whole frame changes world.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, clamp, media } from '../lib/dom.js';

export function initForms() {
  const stage = qs('#forms-stage');
  const range = qs('#forms-range');
  const grip = qs('.forms__grip');
  const hint = qs('.forms__hint');
  const state = { v: 50 };
  let demo = null;

  const set = (v) => {
    state.v = clamp(v, 0, 100);
    stage.style.setProperty('--split', `${state.v}%`);
    range.value = String(Math.round(state.v));
    range.setAttribute('aria-valuetext', `Live action ${Math.round(state.v)}%, game art ${Math.round(100 - state.v)}%`);
  };
  const takeOver = () => {
    demo?.kill();
    demo = null;
    gsap.to(hint, { autoAlpha: 0, duration: 0.3 });
  };
  const pct = (clientX) => {
    const r = stage.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };
  set(50);

  // Mouse/pen: press anywhere and drag. Touch: the grip drags; elsewhere only a clearly
  // horizontal swipe takes over, so vertical scrolling is never hijacked.
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const onGrip = grip.contains(e.target);
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, active: e.pointerType !== 'touch' || onGrip };
    if (drag.active) {
      takeOver();
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-dragging');
      set(pct(e.clientX));
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.active) {
      const dx = Math.abs(e.clientX - drag.x);
      const dy = Math.abs(e.clientY - drag.y);
      if (dx > 10 && dx > dy * 1.4) {
        drag.active = true;
        takeOver();
        stage.setPointerCapture(e.pointerId);
        stage.classList.add('is-dragging');
      } else return;
    }
    set(pct(e.clientX));
  });
  const end = () => {
    drag = null;
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  range.addEventListener('input', () => {
    takeOver();
    set(Number(range.value));
  });

  if (media.reduced.matches) return;

  // One demonstration sweep the first time it comes into view, so the interaction is discoverable
  ScrollTrigger.create({
    trigger: stage,
    start: 'top 35%',
    once: true,
    onEnter: () => {
      demo = gsap
        .timeline({ onUpdate: () => set(state.v), onComplete: () => (demo = null) })
        .to(state, { v: 82, duration: 0.9, ease: 'power2.inOut' })
        .to(state, { v: 18, duration: 1.3, ease: 'power2.inOut' })
        .to(state, { v: 50, duration: 0.9, ease: 'power2.inOut' });
    },
  });
}
