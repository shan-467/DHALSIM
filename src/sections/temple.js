// Temple: the main game cinematic (D0823654) as its own section. Kinetic type is a timeline
// keyed to the video's playhead, so each beat lands on the cut it belongs to:
// statue → the name tracks in · close-up → the name slams in, ignites when his eyes glow ·
// fire → it scatters as YOGA! crashes in with embers · mandala → a gold ring draws, the name signs off.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa, media } from '../lib/dom.js';
import { loadWhenNear, safePlay } from '../lib/video.js';
import { sound } from '../lib/sound.js';

// Cut points in the footage (seconds), measured with scene detection
const CUES = { statueEnd: 1.3, closeUp: 2.47, eyes: 2.98, fire: 3.23, yoga: 3.3, hand: 4.27, mandala: 4.42, end: 6.67 };

const splitChars = (el) => {
  const text = el.textContent;
  el.textContent = '';
  return [...text].map((ch) => {
    const s = document.createElement('span');
    s.className = 'k-ch';
    s.textContent = ch === ' ' ? ' ' : ch;
    el.append(s);
    return s;
  });
};
// Fixed pseudo-random values, so scrubbing or replaying always lands on the same frame
const rnd = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const clock = (s) => `0:${String(Math.max(0, Math.floor(s))).padStart(2, '0')}`;

export function initTemple() {
  const reduced = media.reduced.matches;
  const section = qs('#temple');
  const stage = qs('.temple__stage', section);
  const win = qs('.temple__window', section);
  const video = qs('.temple__video', section);
  const bars = qsa('.temple__bar', section);
  const hud = qs('.temple__hud', section);
  const bar = qs('.temple__progress i', section);
  const time = qs('.temple__time', section);
  const replay = qs('.temple__replay', section);
  const replayLabel = qs('.temple__replay-label', section);
  loadWhenNear([video], '150% 0px');

  // ── kinetic elements ──
  const track = qs('.k-track', section);
  const trackName = qs('.k-track__name', section);
  const trackRules = qsa('.k-track__rule', section);
  const slam = qs('.k-slam', section);
  const outline = splitChars(qs('.k-slam__line--outline', section));
  const fillLine = qs('.k-slam__line--fill', section);
  const fill = splitChars(fillLine);
  const yogaBox = qs('.k-yoga', section);
  const yoga = splitChars(yogaBox);
  const embersBox = qs('.k-embers', section);
  const embers = Array.from({ length: 30 }, () => embersBox.appendChild(document.createElement('i')));
  const ring = qs('.k-ring', section);
  const outer = qs('.k-ring__c--outer', section);
  const inner = qs('.k-ring__c--inner', section);
  const redRing = qs('.k-ring__c--red', section);
  const ticksGroup = qs('.k-ring__ticks', section);
  const ticks = Array.from({ length: 24 }, (_, k) => {
    const a = (k / 24) * Math.PI * 2;
    const r1 = 166;
    const r2 = k % 2 ? 176 : 184;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', String(200 + Math.cos(a) * r1));
    l.setAttribute('y1', String(200 + Math.sin(a) * r1));
    l.setAttribute('x2', String(200 + Math.cos(a) * r2));
    l.setAttribute('y2', String(200 + Math.sin(a) * r2));
    ticksGroup.append(l);
    return l;
  });
  const sign = splitChars(qs('.k-sign__name', section));
  const signRule = qs('.k-sign__rule', section);
  const signChip = qs('.k-sign__chip', section);
  const flash = qs('.k-flash', section);
  const outerLen = 2 * Math.PI * 190;
  outer.style.strokeDasharray = String(outerLen);

  // ── the timeline, in seconds of footage ──
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl
    // statue: the name tracks in between two gold rules
    .fromTo(track, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.5 }, 0.12)
    .fromTo(trackName, { letterSpacing: '1.1em' }, { letterSpacing: '0.14em', duration: 1.1 }, 0.12)
    .fromTo(trackRules, { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 0.25)
    .to(track, { opacity: 0, y: -30, duration: 0.22, ease: 'power2.in' }, CUES.statueEnd - 0.12)
    // close-up: the name slams in as an outline
    .fromTo(outline, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.16, stagger: 0.012, ease: 'power4.in' }, CUES.closeUp - 0.02)
    .fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 0.01 }, CUES.closeUp)
    .fromTo(flash, { opacity: 0.5 }, { opacity: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, CUES.closeUp + 0.12)
    .fromTo(slam, { scale: 1 }, { scale: 1.07, duration: CUES.fire - CUES.closeUp, ease: 'none' }, CUES.closeUp)
    // his eyes glow: gold rises through the outline
    .fromTo(fillLine, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.24, ease: 'power2.out' }, CUES.eyes)
    // fire: the name scatters, YOGA! crashes in, embers burst
    .to([...outline, ...fill], {
      x: (i) => (rnd(i, 1) - 0.5) * 900,
      y: (i) => (rnd(i, 2) - 0.5) * 600,
      rotation: (i) => (rnd(i, 3) - 0.5) * 90,
      opacity: 0,
      duration: 0.32,
      ease: 'power2.in',
    }, CUES.fire)
    .fromTo(yoga, {
      opacity: 0, scale: 2.6,
      rotation: (i) => (rnd(i, 4) - 0.5) * 50,
      yPercent: (i) => (rnd(i, 5) - 0.5) * 60,
    }, { opacity: 1, scale: 1, rotation: 0, yPercent: 0, duration: 0.24, stagger: 0.05, ease: 'back.out(2.2)' }, CUES.yoga)
    .fromTo(flash, { opacity: 0.35 }, { opacity: 0, duration: 0.3, immediateRender: false }, CUES.yoga + 0.05)
    .fromTo(embers, { x: 0, y: 0, scale: 1, opacity: 1 }, {
      x: (i) => Math.cos(rnd(i, 6) * 6.283) * (220 + rnd(i, 7) * 560),
      y: (i) => Math.sin(rnd(i, 6) * 6.283) * (160 + rnd(i, 7) * 380) - 120,
      scale: (i) => 0.5 + rnd(i, 8) * 2,
      opacity: 0,
      duration: (i) => 0.7 + rnd(i, 9) * 0.7,
      ease: 'power2.out',
    }, CUES.fire + 0.04)
    .to(yogaBox, { keyframes: [{ x: -12 }, { x: 9 }, { x: -6 }, { x: 0 }], duration: 0.26, ease: 'none' }, CUES.yoga + 0.32)
    .to(yoga, { yPercent: -130, opacity: 0, duration: 0.28, stagger: 0.03, ease: 'power3.in' }, CUES.hand - 0.18)
    .fromTo(flash, { opacity: 0.25 }, { opacity: 0, duration: 0.25, immediateRender: false }, CUES.hand)
    // mandala: a gold ring draws in around him, then the name signs off
    .fromTo(ring, { opacity: 0, scale: 0.7, rotation: -60 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.9 }, CUES.mandala)
    .fromTo(outer, { strokeDashoffset: outerLen }, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, CUES.mandala)
    .fromTo(inner, { strokeDashoffset: 0 }, { strokeDashoffset: -160, duration: CUES.end - CUES.mandala, ease: 'none' }, CUES.mandala)
    .fromTo(redRing, { strokeDashoffset: 0, opacity: 0 }, { strokeDashoffset: 220, opacity: 1, duration: CUES.end - CUES.mandala, ease: 'none' }, CUES.mandala + 0.2)
    .fromTo(ticks, { opacity: 0, scale: 0.5, svgOrigin: '200 200' }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.015, svgOrigin: '200 200' }, CUES.mandala + 0.3)
    .to(ring, { rotation: 40, duration: CUES.end - CUES.mandala - 0.9, ease: 'none' }, CUES.mandala + 0.9)
    .fromTo(sign, { yPercent: 110 }, { yPercent: 0, duration: 0.55, stagger: 0.045, ease: 'power4.out' }, 5.0)
    .fromTo(signRule, { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, 5.3)
    .fromTo(signChip, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35 }, 5.55)
    .to({}, { duration: 0.01 }, CUES.end);

  const length = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : CUES.end);
  const sync = () => {
    const t = video.currentTime || 0;
    if (!reduced) tl.time(Math.min(t, tl.duration()));
    bar.style.transform = `scaleX(${Math.min(1, t / length())})`;
    time.textContent = `${clock(t)} / ${clock(Math.round(length()))}`;
  };

  const play = (fromStart) => {
    if (fromStart || video.ended) video.currentTime = 0;
    video.muted = !sound.enabled;
    safePlay(video).then((ok) => {
      if (!ok && !video.muted) {
        video.muted = true;
        safePlay(video);
      }
    });
  };
  sound.subscribe((on) => {
    if (!video.paused) video.muted = !on;
  });
  replay.addEventListener('click', () => {
    if (replayLabel) replayLabel.textContent = 'Replay';
    play(true);
  });

  if (reduced) {
    // No autoplay and no kinetic motion: the finished lockup over the poster, playable on request
    tl.time(CUES.end);
    gsap.set(bars, { scaleY: 1 });
    gsap.set(hud, { opacity: 1 });
    if (replayLabel) replayLabel.textContent = 'Play';
    video.addEventListener('timeupdate', sync);
    return;
  }

  tl.time(0);
  // Arriving: the window opens out of the letterbox and the footage settles
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.5 } })
    .fromTo(win, { clipPath: 'inset(16% 12% 16% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out' }, 0)
    .fromTo(video, { scale: 1.22 }, { scale: 1, ease: 'none' }, 0);

  // Holding: bars and player HUD come in while the cinematic runs
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=80%',
    pin: stage,
    onToggle: (self) => gsap.to(bars, { scaleY: self.isActive ? 1 : 0, duration: 0.5, ease: 'power3.out' }),
  });
  gsap.to(hud, { opacity: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 20%', end: 'top top', scrub: true } });

  // Playback follows presence: starts when it fills the screen, pauses when it leaves
  ScrollTrigger.create({
    trigger: section,
    start: 'top 12%',
    end: 'bottom 40%',
    onEnter: () => play(true),
    onEnterBack: () => play(false),
    onLeave: () => video.pause(),
    onLeaveBack: () => video.pause(),
  });
  gsap.ticker.add(sync);
}
