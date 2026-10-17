// Full-screen viewer for the reel: videos play with controls (and sound, if on),
// stills show at full size. Arrow keys step through; Esc or Close returns to the page.
import { qs, qsa } from '../lib/dom.js';
import { sourceFor } from '../lib/video.js';
import { sound } from '../lib/sound.js';

export function initViewer({ scroller }) {
  const dialog = qs('#viewer');
  const stage = qs('#viewer-media');
  const title = qs('#viewer-title');
  const count = qs('#viewer-count');
  const items = qsa('[data-lightbox]');
  let index = 0;
  let opener = null;

  function render() {
    const item = items[index];
    stage.replaceChildren();
    if (item.dataset.kind === 'video') {
      const v = document.createElement('video');
      v.src = sourceFor(item.dataset.name);
      v.poster = qs('video', item)?.poster ?? '';
      v.controls = true;
      v.playsInline = true;
      v.muted = !sound.enabled;
      v.setAttribute('aria-label', item.getAttribute('aria-label').replace(/^Watch /, '').replace(/ full screen$/, ''));
      stage.append(v);
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    } else {
      const img = new Image();
      img.src = item.dataset.src;
      img.alt = qs('img', item)?.alt ?? '';
      stage.append(img);
    }
    title.textContent = item.dataset.title;
    count.textContent = `${index + 1} of ${items.length}`;
  }

  const step = (d) => {
    index = (index + d + items.length) % items.length;
    render();
  };

  items.forEach((item, i) =>
    item.addEventListener('click', () => {
      opener = item;
      index = i;
      render();
      dialog.showModal();
      scroller.lenis?.stop();
    }),
  );

  dialog.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-viewer]');
    if (btn) {
      const what = btn.dataset.viewer;
      if (what === 'close') dialog.close();
      else step(what === 'next' ? 1 : -1);
      return;
    }
    if (e.target === stage) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'VIDEO') return; // arrows seek inside the player
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dialog.addEventListener('close', () => {
    stage.replaceChildren();
    scroller.lenis?.start();
    opener?.focus({ preventScroll: true });
  });
}
