// The footage arrived letterboxed, so the title opens like a letterbox: a gold slit
// widens into the band where the Street Fighter logo forms (92596AEA).
import { gsap } from 'gsap';
import { qs, media } from '../lib/dom.js';
import { loadWhenNear, safePlay } from '../lib/video.js';

export function initIdentity() {
  const section = qs('#identity');
  const stage = qs('.identity__stage');
  const aperture = qs('.identity__aperture');
  const slit = qs('.identity__slit');
  const release = qs('.identity__release');
  const video = qs('.identity__video');
  loadWhenNear([video], '150% 0px');

  if (media.reduced.matches) {
    // Final composition, no scroll choreography; the poster already shows the finished logo
    gsap.set(aperture, { clipPath: 'inset(0% 0 0% 0)' });
    gsap.set(release, { opacity: 1 });
    return;
  }

  // The slit draws itself while the section scrolls into place
  gsap.to(slit, {
    scaleX: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 5%', scrub: 0.5 },
  });

  let played = false;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=130%',
      pin: stage,
      scrub: 0.6,
      onUpdate(self) {
        if (!played && self.progress > 0.12) {
          played = true;
          video.currentTime = 0;
          safePlay(video);
        }
      },
      onLeaveBack() {
        played = false;
        video.pause();
      },
    },
  });

  tl.to(aperture, { clipPath: 'inset(0% 0 0% 0)', duration: 0.45, ease: 'power3.inOut' }, 0)
    .to(slit, { opacity: 0, duration: 0.12 }, 0.28)
    .fromTo(video, { scale: 1.22 }, { scale: 1, duration: 0.75 }, 0)
    .fromTo(release, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.55)
    .to({}, { duration: 0.25 });
}
