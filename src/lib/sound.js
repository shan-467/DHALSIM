// Global sound preference. Only the opening and the full-screen viewer ever play audio;
// every background loop stays muted regardless.
const KEY = 'sf-sound';
const listeners = new Set();

let enabled = true;
try {
  const saved = localStorage.getItem(KEY);
  if (saved !== null) enabled = saved === 'on';
} catch {
  /* storage unavailable: keep the default */
}

export const sound = {
  get enabled() {
    return enabled;
  },
  set(value) {
    enabled = Boolean(value);
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    listeners.forEach((fn) => fn(enabled));
  },
  toggle() {
    this.set(!enabled);
  },
  subscribe(fn) {
    listeners.add(fn);
    fn(enabled);
    return () => listeners.delete(fn);
  },
};

export function bindSoundToggles(root = document) {
  const buttons = [...root.querySelectorAll('[data-sound-toggle]')];
  buttons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.toggle();
    }),
  );
  sound.subscribe((on) => {
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('.sound-toggle__label').textContent = on ? 'Sound on' : 'Sound off';
    });
  });
}
