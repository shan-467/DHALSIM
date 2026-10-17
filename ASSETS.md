# Asset map

Originals in the project root are never modified. `scripts/encode-media.sh` builds the web copies in `public/media/`.

All six source videos are 2160×3840 (9:16) HEVC at 60 fps with the actual picture letterboxed inside black bars. The script crops the bars, transcodes to H.264/AAC at 30 fps (plays in every browser), and writes a desktop and a mobile width.

## Videos

| Source file | Content | Picture after crop | Web files | Section | Playback |
|---|---|---|---|---|---|
| `F6C53A94-100D-4993-AFB4-4FDF0B64BD3D.MP4` | Player-select screen cycling characters, lands on DHAILSM (0–2.65 s), hard cut to live-action DHAILSM in a neon club (2.75–4.43 s) | 2160×988 (≈2.19:1) | `video/intro-1920.mp4`, `intro-1280.mp4`, `poster/intro.jpg`, `poster/intro-end.jpg` | 1 · Opening / ROUND ONE | Eager load. Starts on "Press start" with sound, falls back to muted. ROUND ONE synced to the 2.75 s cut |
| `92596AEA-8995-44F7-8301-69324C4C2F84.MP4` | Fiery Street Fighter logo forming on purple grunge | 2160×930 (≈2.32:1) | `video/logo-*.mp4`, `poster/logo.jpg` | 2 · Identity | Lazy, muted, plays when in view, holds on last frame |
| `7920E696-2444-4480-AC8C-BFFE302C4D07.MP4` | Game cinematic: DHAILSM turns, joins palms, sits in lotus pose before an elephant | 2086×1184 (16:9) | `video/meditation-*.mp4`, `poster/meditation.jpg` | 5 · Reel | Lazy, muted loop in view; full-screen with sound on click |
| `D0823654-7310-4965-9C5C-AF04C8996660.MP4` | Golden deity statue (0–1.3 s), meditation by candlelight (1.3–2.47 s), face close-up with the eyes igniting (2.47–3.23 s), fire burst on "Yoga!" (3.23–4.27 s), levitating inside a gold mandala (4.42 s on) | 2086×1184 (16:9) | `video/temple-*.mp4`, `poster/temple.jpg`, `poster/still-gaze.jpg`, `poster/still-mandala.jpg` | 5 · Temple (its own section); stills in 6 · Reel | Lazy. Plays with sound when the section fills the screen; kinetic type is keyed to the cut points above |
| `CA6AFB03-2D5E-4258-A5C7-1BCACF0C79BC.MP4` | Gameplay cinematic: inverted yoga moves, glitch transition, crowd, fighting stance | 2160×2852 (≈3:4 portrait) | `video/yoga-1080.mp4`, `yoga-720.mp4`, `poster/yoga.jpg` | 5 · Reel (tall panel) | Lazy, muted loop in view; full-screen with sound on click |
| `B80C628D-B5E6-4397-A266-0ACB9EBE4A78.MP4` | Close-up, then a golden multi-armed radiance ascending in light | 2086×1184 (16:9) | `video/radiance-*.mp4`, `poster/radiance.jpg` | 7 · Finale | Lazy, muted, plays once in view, holds on the golden last frame |

## Images

| Source file | Content | Web file | Section |
|---|---|---|---|
| `WhatsApp Image 2026-10-14 at 7.31.13 PM.jpeg` | DHAILSM live-action poster (Vidyut Jammwal), brush "D", concrete background | `img/dhailsm-live-action.jpg` | 3 · Reveal, 4 · Two forms, 6 · VS (player 1) |
| `WhatsApp Image 2026-10-14 at 7.32.40 PM.jpeg` | DHAILSM game art: breathing fire, gold background, smoke swirls | `img/dhailsm-game-art.jpg` | 4 · Two forms, 5 · Reel |
| `WhatsApp Image 2026-10-14 at 7.31.31 PM.jpeg` | Ken poster (Noah Centineo) | `img/ken.jpg` | 6 · VS roster |
| `WhatsApp Image 2026-10-14 at 7.31.44 PM (1).jpeg` | Guile poster (Cody Rhodes) | `img/guile.jpg` | 6 · VS roster |
| `WhatsApp Image 2026-10-14 at 7.31.22 PM.jpeg` | M. Bison poster (David Dastmalchian) | `img/m-bison.jpg` | 6 · VS roster |
| `WhatsApp Image 2026-10-14 at 7.32.07 PM.jpeg` | Zangief poster (Olivier Richters), 9:16, carries a "DreaminaAI" watermark bottom-right | `img/zangief.jpg` | 6 · VS roster (cropped above the watermark) |

## Design references (not displayed on the site)

| Source file | What it contributes |
|---|---|
| `WhatsApp Image 2026-10-14 at 7.28.45 PM.jpeg` | Black ink-splash silhouette on white textured paper; character art living inside the ink; red sub-headings |
| `WhatsApp Image 2026-10-14 at 7.29.24 PM.jpeg` | Red and black brush strokes over white; stepped navigation; a row of character portraits with one highlighted in red |
| `WhatsApp Image 2026-10-14 at 7.46.54 PM.jpeg` | Black hero into white paper; a black ink spine running down the page; red blocks for attributes; large numerals |
| `WhatsApp Image 2026-10-14 at 7.52.07 PM.jpeg` | Diagonal black ink band cutting across white paper; gold hairline ornaments; cards overlapping the band |

## Not supplied

No fonts, documents, character descriptions or standalone logo files were provided. Type uses Anton and Barlow (self-hosted through Fontsource). Copy is limited to what the assets themselves state.
