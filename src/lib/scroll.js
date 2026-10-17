import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Smooth wheel scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in sync.
 * Touch keeps native scrolling. With reduced motion, Lenis is skipped entirely.
 */
export function createScroller({ smooth }) {
  let lenis = null;
  if (smooth) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const resolve = (target) => (typeof target === 'string' ? document.getElementById(target) : target);

  return {
    lenis,
    lock() {
      document.body.classList.add('is-locked');
      lenis?.stop();
    },
    unlock() {
      document.body.classList.remove('is-locked');
      lenis?.start();
    },
    /** Smoothly scrolls to a section id/element, or 0 for the top. */
    to(target, { immediate = false } = {}) {
      const el = target === 0 ? 0 : resolve(target);
      if (el === null) return;
      if (lenis) {
        lenis.scrollTo(el, { immediate, duration: 1.6, force: true });
      } else {
        const top = el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: immediate || !smooth ? 'auto' : 'smooth' });
      }
    },
  };
}
