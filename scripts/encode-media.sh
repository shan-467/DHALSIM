#!/usr/bin/env bash
# Builds web-ready media from the supplied originals (originals are never modified).
# - Crops the black letterbox bars baked into the 9:16 HEVC source files
# - Transcodes HEVC -> H.264 (plays in every browser) at desktop + mobile widths
# - Extracts poster stills and gallery frames
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/media
mkdir -p "$OUT/video" "$OUT/poster" "$OUT/img"

# name | source | crop (w:h:x:y in source pixels) | desktop width | mobile width | poster time
JOBS=(
  "intro|F6C53A94-100D-4993-AFB4-4FDF0B64BD3D.MP4|2160:988:0:1468|1920|1280|0.2"
  "logo|92596AEA-8995-44F7-8301-69324C4C2F84.MP4|2160:930:0:1456|1920|1280|2.0"
  "meditation|7920E696-2444-4480-AC8C-BFFE302C4D07.MP4|2086:1184:74:1300|1920|1280|3.4"
  "radiance|B80C628D-B5E6-4397-A266-0ACB9EBE4A78.MP4|2086:1184:74:1300|1920|1280|6.6"
  "temple|D0823654-7310-4965-9C5C-AF04C8996660.MP4|2086:1184:74:1300|1920|1280|1.6"
  "yoga|CA6AFB03-2D5E-4258-A5C7-1BCACF0C79BC.MP4|2160:2852:0:448|1080|720|8.6"
)

for job in "${JOBS[@]}"; do
  IFS='|' read -r name src crop dw mw pt <<<"$job"
  for w in "$dw" "$mw"; do
    crf=$([ "$w" = "$dw" ] && echo 22 || echo 24)
    ffmpeg -v error -y -i "$src" \
      -vf "crop=$crop,scale=$w:-2:flags=lanczos,fps=30,format=yuv420p" \
      -c:v libx264 -preset slow -crf "$crf" -profile:v high -level 4.1 \
      -c:a aac -b:a 128k -ac 2 -movflags +faststart \
      "$OUT/video/$name-$w.mp4"
  done
  ffmpeg -v error -y -ss "$pt" -i "$src" -vf "crop=$crop,scale=$dw:-2:flags=lanczos" -frames:v 1 -q:v 3 "$OUT/poster/$name.jpg"
  echo "done: $name"
done

# Gallery stills pulled from the supplied footage
ffmpeg -v error -y -ss 3.0  -i D0823654-7310-4965-9C5C-AF04C8996660.MP4 -vf "crop=2086:1184:74:1300,scale=1920:-2:flags=lanczos" -frames:v 1 -q:v 3 "$OUT/poster/still-gaze.jpg"
ffmpeg -v error -y -ss 5.6  -i D0823654-7310-4965-9C5C-AF04C8996660.MP4 -vf "crop=2086:1184:74:1300,scale=1920:-2:flags=lanczos" -frames:v 1 -q:v 3 "$OUT/poster/still-mandala.jpg"
ffmpeg -v error -y -ss 3.6  -i F6C53A94-100D-4993-AFB4-4FDF0B64BD3D.MP4 -vf "crop=2160:988:0:1468,scale=1920:-2:flags=lanczos" -frames:v 1 -q:v 3 "$OUT/poster/still-neon.jpg"
ffmpeg -v error -y -ss 4.4  -i F6C53A94-100D-4993-AFB4-4FDF0B64BD3D.MP4 -vf "crop=2160:988:0:1468,scale=1920:-2:flags=lanczos" -frames:v 1 -q:v 3 "$OUT/poster/intro-end.jpg"

# Character images: copied byte-for-byte under URL-safe names (see ASSETS.md for the mapping)
cp "WhatsApp Image 2026-10-14 at 7.31.13 PM.jpeg"     "$OUT/img/dhailsm-live-action.jpg"
cp "WhatsApp Image 2026-10-14 at 7.32.40 PM.jpeg"     "$OUT/img/dhailsm-game-art.jpg"
cp "WhatsApp Image 2026-10-14 at 7.31.31 PM.jpeg"     "$OUT/img/ken.jpg"
cp "WhatsApp Image 2026-10-14 at 7.31.44 PM (1).jpeg" "$OUT/img/guile.jpg"
cp "WhatsApp Image 2026-10-14 at 7.31.22 PM.jpeg"     "$OUT/img/m-bison.jpg"
cp "WhatsApp Image 2026-10-14 at 7.32.07 PM.jpeg"     "$OUT/img/zangief.jpg"
echo "all media built"
