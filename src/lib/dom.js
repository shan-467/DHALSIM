export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const media = {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
  desktop: window.matchMedia('(min-width: 900px)'),
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
};

/** Wraps each character in a clipping mask so letters can rise into view. */
export function splitLetters(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.replaceChildren(
    ...[...text].map((ch) => {
      const mask = document.createElement('span');
      mask.className = 'ltr-mask';
      mask.setAttribute('aria-hidden', 'true');
      const ltr = document.createElement('span');
      ltr.className = 'ltr';
      ltr.textContent = ch === ' ' ? ' ' : ch;
      mask.append(ltr);
      return mask;
    }),
  );
  return qsa('.ltr', el);
}
