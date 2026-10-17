// Title screen → opening video (F6C53A94) → ROUND ONE on the cut to live action → FIGHT!
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { INTRO_CUES } from '../config.js';
import { qs, qsa, media } from '../lib/dom.js';
import { sourceFor, safePlay } from '../lib/video.js';
import { sound } from '../lib/sound.js';

const LOAD_TIMEOUT = 4500; // never hold the visitor on the title screen for a slow connection

export function initIntro({ scroller }) {
  const reduced = media.reduced.matches;
  const start = qs('#start');
  const press = qs('#press-start');
  const status = qs('#start-status');
  const loadBar = qs('.start__load-bar');
  const video = qs('#intro-video');
  const frame = qs('.intro__frame');
  const hud = qs('.intro__hud');
  const fills = qsa('.lifebar__fill');
  const round = qs('.call--round');
  const roundSmall = qs('.call__small', round);
  const roundBig = qs('.call__big', round);
  const fight = qs('.call--fight');
  const flash = qs('.intro__flash');
  const replayBtn = qs('.intro__replay');
  const scrollCue = qs('.intro__scroll');
  const announcer = qs('#intro-announcer');

  // ── Loading ────────────────────────────────────────────
  video.src = sourceFor('intro');
  video.preload = 'auto';
  let ready = false;
  let loadedEnough = false;
  let failed = false;

  const setProgress = (p) => (loadBar.style.transform = `scaleX(${Math.min(1, p)})`);
  const tryReady = () => {
    if (ready) return;
    ready = true;
    setProgress(1);
    press.disabled = false;
    start.classList.add('is-ready');
    status.textContent = failed
      ? 'The opening video could not load. Press start to continue.'
      : 'Press start or any key';
    press.focus({ preventScroll: true });
  };
  const onVideoReady = () => {
    loadedEnough = true;
    tryReady();
  };
  video.addEventListener('progress', () => {
    if (!video.duration || !video.buffered.length) return;
    setProgress(video.buffered.end(video.buffered.length - 1) / video.duration);
  });
  // Events may already have fired by the time fonts finish loading, so check the state too
  if (video.readyState >= 3) onVideoReady();
  video.addEventListener('canplaythrough', onVideoReady, { once: true });
  video.addEventListener('loadeddata', () => setTimeout(onVideoReady, 600), { once: true });
  video.addEventListener('error', () => {
    failed = true;
    loadedEnough = true;
    tryReady();
  });
  setTimeout(() => {
    loadedEnough = true;
    tryReady();
  }, LOAD_TIMEOUT);

  // ── Title animation ───────────────────────────────────
  const brush = qs('.start__brush');
  if (reduced) {
    gsap.set(brush, { clipPath: 'inset(0 0% 0 0)' });
  } else {
    const split = new SplitText('.start__line', { type: 'chars' });
    const [top, bottom] = qsa('.start__line');
    const topChars = split.chars.filter((c) => top.contains(c));
    const bottomChars = split.chars.filter((c) => bottom.contains(c));
    gsap
      .timeline({ delay: 0.25 })
      .from(topChars, { xPercent: -140, opacity: 0, skewX: 35, duration: 0.75, stagger: 0.035, ease: 'power4.out' })
      .from(bottomChars, { xPercent: 140, opacity: 0, skewX: -35, duration: 0.75, stagger: { each: 0.035, from: 'end' }, ease: 'power4.out' }, '<0.1')
      .to(brush, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'expo.out' }, '-=0.55')
      .from('.start__panel', { opacity: 0, y: 18, duration: 0.5, ease: 'power2.out' }, '-=0.35');
  }
  // ── Press start ───────────────────────────────────────
  let started = false;
  const onKey = (e) => {
    if (['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    if (e.target.closest('[data-sound-toggle]')) return;
    begin();
  };
  document.addEventListener('keydown', onKey);
  start.addEventListener('click', (e) => {
    if (e.target.closest('[data-sound-toggle]')) return;
    begin();
  });

  async function begin() {
    if (started || press.disabled) return;
    started = true;
    document.removeEventListener('keydown', onKey);

    // play() is called inside the gesture, so sound is allowed when the visitor wants it
    video.currentTime = 0;
    video.muted = !sound.enabled;
    let playing = await safePlay(video);
    if (!playing && !video.muted) {
      video.muted = true;
      playing = await safePlay(video);
    }

    gsap.to(start, {
      autoAlpha: 0,
      duration: reduced ? 0.01 : 0.55,
      ease: 'power2.out',
      onComplete: () => (start.hidden = true),
    });
    document.body.classList.add('is-started');
    scroller.unlock();
    runSequence(playing);
  }

  sound.subscribe((on) => {
    if (started && !video.paused) video.muted = !on;
  });

  // ── The round call ────────────────────────────────────
  let ticker = null;
  let timers = [];

  const shake = () =>
    reduced
      ? gsap.timeline()
      : gsap
          .timeline()
          .to(video, { x: 'random(-14, 14)', y: 'random(-9, 9)', duration: 0.045, repeat: 5, yoyo: true, ease: 'none' })
          .to(video, { x: 0, y: 0, duration: 0.06 });

  function resetCalls() {
    if (ticker) gsap.ticker.remove(ticker);
    timers.forEach((t) => t.kill());
    timers = [];
    gsap.killTweensOf([round, roundSmall, roundBig, fight, flash, hud, fills, replayBtn, scrollCue]);
    gsap.set([round, fight], { autoAlpha: 0, scale: 1 });
    gsap.set(hud, { opacity: 0 });
    gsap.set(fills, { scaleX: 0 });
    gsap.set([replayBtn, scrollCue], { autoAlpha: 0 });
    announcer.textContent = '';
  }

  function playRound() {
    announcer.textContent = 'Round one';
    gsap
      .timeline()
      .set(round, { autoAlpha: 1 })
      .to(hud, { opacity: 1, duration: 0.25 }, 0)
      .to(fills, { scaleX: 1, duration: 0.9, ease: 'power2.out', stagger: 0 }, 0.05)
      .fromTo(flash, { opacity: 0.5 }, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 0)
      .fromTo(roundSmall, { opacity: 0, y: -24, letterSpacing: '0.7em' }, { opacity: 1, y: 0, letterSpacing: '0.08em', duration: reduced ? 0.01 : 0.5, ease: 'power3.out' }, 0)
      .fromTo(roundBig, { scale: reduced ? 1 : 2.8, opacity: 0 }, { scale: 1, opacity: 1, duration: reduced ? 0.2 : 0.38, ease: 'power4.in' }, 0.12)
      .add(shake(), 0.5);
  }

  function playFight() {
    announcer.textContent = 'Fight!';
    gsap
      .timeline()
      .to(round, { autoAlpha: 0, scale: 0.92, duration: 0.18, ease: 'power2.in' })
      .set(fight, { autoAlpha: 1 })
      .fromTo(fight, { scale: reduced ? 1 : 3.2, opacity: 0 }, { scale: 1, opacity: 1, duration: reduced ? 0.2 : 0.32, ease: 'power4.in' })
      .fromTo(flash, { opacity: 0.75 }, { opacity: 0, duration: 0.45 }, '>')
      .add(shake(), '<');
  }

  function showEnd() {
    gsap
      .timeline({ delay: 0.9 })
      .to(fight, { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in' })
      .set(fight, { y: 0 })
      .to([replayBtn, scrollCue], { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, '-=0.1');
  }

  function runSequence(playing) {
    resetCalls();
    const fired = { round: false, fight: false };
    const fire = (key, fn) => {
      if (fired[key]) return;
      fired[key] = true;
      fn();
    };

    if (!playing) {
      // No playback (blocked or failed): keep the poster and run the calls on the clock instead
      timers.push(gsap.delayedCall(0.6, () => fire('round', playRound)));
      timers.push(gsap.delayedCall(2.0, () => fire('fight', playFight)));
      timers.push(gsap.delayedCall(2.1, showEnd));
      return;
    }
    ticker = () => {
      const t = video.currentTime;
      if (t >= INTRO_CUES.round) fire('round', playRound);
      if (t >= INTRO_CUES.fight) fire('fight', playFight);
    };
    gsap.ticker.add(ticker);
    video.addEventListener(
      'ended',
      () => {
        gsap.ticker.remove(ticker);
        fire('round', playRound);
        fire('fight', playFight);
        showEnd();
      },
      { once: true },
    );
  }

  // ── Replay (from anywhere on the page) ────────────────
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  document.body.append(curtain);

  async function replay() {
    if (!started) return;
    resetCalls();
    video.pause();
    video.muted = !sound.enabled;
    video.currentTime = 0;
    // Start playback while still inside the click, then cut to the top under a black curtain
    let playing = await safePlay(video);
    if (!playing && !video.muted) {
      video.muted = true;
      playing = await safePlay(video);
    }
    if (playing) video.pause();
    await gsap.to(curtain, { autoAlpha: 1, duration: reduced ? 0.01 : 0.35, ease: 'power2.in' });
    scroller.to(0, { immediate: true });
    video.currentTime = 0;
    if (playing) playing = await safePlay(video);
    runSequence(playing);
    gsap.to(curtain, { autoAlpha: 0, duration: reduced ? 0.01 : 0.5, delay: 0.1, ease: 'power2.out' });
  }

  // ── Leaving the opening ───────────────────────────────
  if (!reduced) {
    const st = { trigger: '#round-one', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(frame, { opacity: 0.25, ease: 'none', scrollTrigger: st });
    gsap.to(video, { scale: 1.12, ease: 'none', scrollTrigger: { ...st } });
    gsap.to(['.intro__calls', '.intro__hud'], { yPercent: -30, ease: 'none', scrollTrigger: { ...st } });
  }

  return { replay };
}
