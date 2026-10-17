import { VIDEOS } from '../config.js';
import { media } from './dom.js';

/** Picks the encode that matches the viewport: phones get the lighter file. */
export function sourceFor(name) {
  const v = VIDEOS[name];
  const width = media.desktop.matches ? v.desktop : v.mobile;
  return `/media/video/${name}-${width}.mp4`;
}

/** Assigns the source on first need, so below-the-fold video costs nothing until it is close. */
export function ensureSource(video, preload = 'auto') {
  if (video.dataset.loaded) return;
  video.dataset.loaded = 'true';
  video.preload = preload;
  video.src = sourceFor(video.dataset.video);
}

/** play() that never throws: resolves true when playback actually started. */
export async function safePlay(video) {
  try {
    await video.play();
    return true;
  } catch {
    return false;
  }
}

/** Loads videos as they approach the viewport (either axis, for the horizontal reel). */
export function loadWhenNear(videos, margin = '80% 120%') {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        ensureSource(e.target);
        io.unobserve(e.target);
      }
    },
    { rootMargin: margin },
  );
  videos.forEach((v) => io.observe(v));
}

/**
 * Muted loops that play only while mostly visible and pause otherwise.
 * With reduced motion they stay on their poster frame; the viewer still plays them on request.
 */
export function loopWhileVisible(videos) {
  loadWhenNear(videos);
  if (media.reduced.matches) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.intersectionRatio >= 0.35) {
          ensureSource(v);
          safePlay(v);
        } else if (!v.paused) {
          v.pause();
        }
      }
    },
    { threshold: [0, 0.35, 0.6] },
  );
  videos.forEach((v) => io.observe(v));
}
