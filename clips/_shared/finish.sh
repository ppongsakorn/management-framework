#!/usr/bin/env bash
# Finish a rendered clip set: sound effects → WebM for the site → poster.
#   clips/_shared/finish.sh <set dir> [poster second]      e.g. clips/_shared/finish.sh clips/5-whys/case 2.0
# Needs each size rendered first (render.js → <size>/out/<slug>.mp4). Writes, per size:
#   out/<slug>-final.mp4  MP4 with effects (for social posts, stays out of git)
#   out/<slug>.webm       VP9 + Opus for public/videos/
#   out/<slug>.webp       poster for public/videos/ (1280×720 or 720×1280)
set -euo pipefail
set_dir=$(cd "$1" && pwd); at=${2:-2.0}
for size in desktop mobile; do
  d="$set_dir/$size"
  slug=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["slug"])' "$d/clip.json")
  mp4="$d/out/$slug.mp4"; final="$d/out/$slug-final.mp4"; webm="$d/out/$slug.webm"
  [ -f "$mp4" ] || { echo "missing $mp4: run render.js on $d first" >&2; exit 1; }
  if [ -f "$set_dir/sfx.py" ]; then python3 "$set_dir/sfx.py" "$d" "$mp4" "$final"; else cp "$mp4" "$final"; fi
  log="$d/out/.vp9-$size"
  ffmpeg -loglevel error -y -i "$final" -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -pass 1 -passlogfile "$log" -an -f null /dev/null
  ffmpeg -loglevel error -y -i "$final" -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -pass 2 -passlogfile "$log" -c:a libopus -b:a 96k "$webm"
  rm -f "$log"*
  png="$d/out/.poster.png"
  ffmpeg -loglevel error -y -ss "$at" -i "$final" -frames:v 1 "$png"
  python3 - "$png" "$d/out/$slug.webp" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im.resize((1280, 720) if im.width > im.height else (720, 1280), Image.LANCZOS).save(sys.argv[2], quality=80, method=6)
PY
  rm -f "$png"
  printf '%s: %s (%s bytes), %s\n' "$size" "$webm" "$(stat -f%z "$webm" 2>/dev/null || stat -c%s "$webm")" "$d/out/$slug.webp"
done
