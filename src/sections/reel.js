// "In motion": on desktop the reel is a pinned horizontal track with frames drifting inside
// their windows; on phones it becomes a vertical sequence. Loops only play while visible.
import { gsap } from 'gsap';
import { qs, qsa, clamp } from '../lib/dom.js';
import { loopWhileVisible } from '../lib/video.js';

export function initReel({ scroller }) {
  const pin = qs('.reel__pin');
  const track = qs('#reel-track');
  loopWhileVisible(qsa('.reel__media[data-video]', track));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });

    // Parallax inside each window: uses the independent `translate` property so the
    // hover zoom on `transform` keeps working
    qsa('.reel__item', track).forEach((item) => {
      const m = qs('.reel__media', item);
      gsap.fromTo(
        m,
        { '--drift': '-4%' },
        {
          '--drift': '4%',
          ease: 'none',
          scrollTrigger: { trigger: item, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
        },
      );
    });

    // The title drifts slower than the track for depth
    gsap.to('.reel__intro', {
      x: () => window.innerWidth * 0.18,
      ease: 'none',
      scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
    });

    // Keyboard focus can't scroll a translated track into view, so bring the focused
    // frame to the centre by moving the page to the matching point of the pin
    const onFocus = (e) => {
      const item = e.target.closest('.reel__item');
      if (!item) return;
      pin.scrollLeft = 0; // undo the browser's own attempt on the clipped container
      const st = slide.scrollTrigger;
      const offset = item.offsetLeft + item.offsetWidth / 2 - window.innerWidth / 2;
      const y = st.start + clamp(offset / distance(), 0, 1) * (st.end - st.start);
      if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 0.7, force: true });
      else window.scrollTo(0, y);
    };
    track.addEventListener('focusin', onFocus);
    return () => track.removeEventListener('focusin', onFocus);
  });
}
