// Single source of truth for names, credits and media.
// Facts here come only from the supplied posters and footage (see ASSETS.md).

// The posters and opening video spell the name "DHALSIM". The brief asks for "DHAILSM";
// change it here and every heading, label and aria-label follows.
export const HERO_NAME = 'DHAILSM';

export const RELEASE_LINE = 'Only in theatres 2026';

export const HERO = {
  name: HERO_NAME,
  actor: 'Vidyut Jammwal',
  image: '/media/img/dhailsm-live-action.jpg',
  gameArt: '/media/img/dhailsm-game-art.jpg',
  width: 736,
  height: 920,
  face: '50% 29%',
};

// Opponents for the versus screen, in the order they appear in the roster.
// `face` is the focal point used for tight crops; `frame` positions the full poster.
export const OPPONENTS = [
  { id: 'ken', name: 'Ken', actor: 'Noah Centineo', image: '/media/img/ken.jpg', width: 735, height: 913, face: '60% 19%', frame: '50% 20%' },
  { id: 'guile', name: 'Guile', actor: 'Cody Rhodes', image: '/media/img/guile.jpg', width: 735, height: 917, face: '54% 25%', frame: '50% 20%' },
  { id: 'm-bison', name: 'M. Bison', actor: 'David Dastmalchian', image: '/media/img/m-bison.jpg', width: 735, height: 921, face: '50% 15%', frame: '50% 10%' },
  // 9:16 poster with a generator watermark in the bottom-right corner: always framed from the top
  { id: 'zangief', name: 'Zangief', actor: 'Olivier Richters', image: '/media/img/zangief.jpg', width: 900, height: 1600, face: '50% 17%', frame: '50% 0%' },
];

// Web encodes built by scripts/encode-media.sh. Widths are the encoded pixel widths.
export const VIDEOS = {
  intro: { desktop: 1920, mobile: 1280, duration: 4.43 },
  logo: { desktop: 1920, mobile: 1280, duration: 3.09 },
  meditation: { desktop: 1920, mobile: 1280, duration: 4.63 },
  temple: { desktop: 1920, mobile: 1280, duration: 6.67 },
  yoga: { desktop: 1080, mobile: 720, duration: 10.1 },
  radiance: { desktop: 1920, mobile: 1280, duration: 7.64 },
};

// Moments inside the opening video (seconds), measured from scene cuts in F6C53A94.
export const INTRO_CUES = {
  round: 2.72, // hard cut from the player-select screen to live-action DHAILSM
  fight: 3.95,
};

// Sections in page order: drives the menu and the progress meter.
export const SECTIONS = [
  { id: 'round-one', label: 'Round one' },
  { id: 'identity', label: 'Street Fighter' },
  { id: 'dhailsm', label: HERO_NAME },
  { id: 'forms', label: 'On screen, in game' },
  { id: 'temple', label: 'Temple' },
  { id: 'reel', label: 'In motion' },
  { id: 'versus', label: 'Versus' },
  { id: 'finale', label: 'Finale' },
];
