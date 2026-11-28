#!/usr/bin/env bash
# Layout check before the long render: a still at the end of every scene (0.6 s before it ends), both sizes,
# and one contact sheet per size. Needs voice/words.json and build.py run first.
#   clips/_shared/no-skill/stills.sh clips/<slug>/case <out dir>
set -euo pipefail
C=$(cd "$1" && pwd); OUT=${2:-/tmp}; HERE=$(cd "$(dirname "$0")" && pwd)
T=$(python3 -c "import json;tl=json.load(open('$C/desktop/timeline.json'));print(','.join(str(round(s['end']-0.6,1)) for s in tl['scenes']))")
for sz in desktop mobile; do rm -rf "${C:?}/${sz:?}/check"; node "$HERE/render.mjs" "$C/$sz" "$T" 2>&1 | grep -iE -A6 "error|issue" || true; done
python3 - "$C" "$OUT" <<'PY'
import sys,glob
from PIL import Image
C,OUT=sys.argv[1:]
for sz,(w,h,cols) in {'desktop':(640,360,4),'mobile':(270,480,6)}.items():
    fs=sorted(glob.glob(f'{C}/{sz}/check/t*.png'),key=lambda f: float(f.split('/t')[-1][:-4]))
    rows=(len(fs)+cols-1)//cols; sheet=Image.new('RGB',(w*cols,h*rows),'black')
    for i,f in enumerate(fs): sheet.paste(Image.open(f).resize((w,h)),((i%cols)*w,(i//cols)*h))
    sheet.save(f'{OUT}/sheet-{sz}.png'); print(sz, len(fs), f'{OUT}/sheet-{sz}.png')
PY
