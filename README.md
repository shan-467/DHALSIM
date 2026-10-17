# Street Fighter: DHAILSM

An interactive, cinematic one-page experience built from the supplied posters, game art and footage. DHAILSM is the protagonist throughout.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

The web-ready media in `public/media/` is already built. To rebuild it from the original files in the project root (needs ffmpeg and Python with numpy and Pillow):

```bash
npm run media                       # crop letterbox bars, HEVC to H.264, posters and stills
python scripts/make-textures.py     # concrete, film grain and dry-brush strokes
```

## The journey

| # | Section | What happens |
|---|---|---|
| 0 | Title screen | STREET FIGHTER slams in over a red brush stroke. Press start (or any key) begins the game with sound, if it is on. |
| 1 | Round one | The opening video `F6C53A94` plays: player select lands on DHAILSM. On the cut to live action, ROUND ONE hits, the lifebars fill, then FIGHT! |
| 2 | Street Fighter | A gold slit opens into a letterbox where the logo forms in fire (`92596AEA`). |
| 3 | DHAILSM | The name rises, an ink splash bursts open to reveal him, then he settles into the concrete page. |
| 4 | On screen, in game | A full-bleed comparison between the live-action poster and the game art. Drag, swipe or use the arrow keys. |
| 5 | Temple | The main game cinematic full screen with sound, framed by letterbox bars and a player HUD. Kinetic type follows its cuts: the name tracks in over the statue, slams in on the close-up and ignites when his eyes glow, YOGA! crashes in with embers, and a gold ring spins up in the mandala as the name signs off. |
| 6 | In motion | The other cinematics and frames in a horizontal reel (vertical on phones). Select any one to watch it full screen with sound. |
| 7 | Versus | DHAILSM is always player one. Pick Ken, Guile, M. Bison or Zangief as player two. |
| 8 | Finale | The golden radiance cinematic, the name in gold, the letterbox closing, then an arcade Continue? countdown with a replay. |

## Structure

```
index.html               page markup, all sections
src/config.js           name spelling, credits, roster, video sizes, intro cue times
src/main.js             boot order: fonts, scroll, sections, chrome
src/sections/*.js       one module per section
src/ui/                 menu, progress meter, torn edges, media viewer
src/lib/                video loading, sound preference, smooth scroll, procedural ink shapes
src/styles/             tokens and base, chrome, sections
public/media/           encoded video, posters, images, textures
scripts/                media and texture build scripts
ASSETS.md               every source file and where it is used
```

## Notes

- **Name spelling:** the posters and opening video spell the name *DHALSIM*. The site uses *DHAILSM* as briefed. Change `HERO_NAME` in `src/config.js` to switch every heading and label.
- **Video:** the sources are 4K HEVC, which Firefox and many Chrome setups can't play. Every video is served as H.264 in two sizes, and phones get the lighter file. Only the opening loads up front; the rest load as they approach and play only while visible.
- **Sound:** only the opening and the full-screen viewer play audio, and the sound toggle (top right) controls both. Background loops are always muted.
- **Reduced motion:** smooth scrolling, pinning, scrubbing and autoplaying loops are turned off. Every section shows its finished composition, and the reel becomes a vertical list.
- **Zangief's poster** carries a generator watermark in its bottom-right corner. It is always framed from the top so the mark stays out of view.
- **Libraries:** GSAP with ScrollTrigger and SplitText, Lenis, and Fontsource (Anton, Barlow, Barlow Condensed). Fonts are self-hosted.
