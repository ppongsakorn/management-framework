#!/usr/bin/env python3
"""Best-shot poster: replace out/<slug>.webp of each size with the frame that has the most drawn content.
   Samples one frame a second (skips the first 2 s and the last 25 s, the close card), scores ink + colour
   against the cream ground, writes 1280×720 / 720×1280 WebP and prints the chosen second. Check the result by eye.
   python3 cover.py clips/<slug>/case [--at <second>]   (--at forces a second for both sizes)"""
import json, subprocess, sys, os
import numpy as np
from PIL import Image
case = sys.argv[1]; force = float(sys.argv[sys.argv.index('--at') + 1]) if '--at' in sys.argv else None
ground = np.array([0xF3, 0xEE, 0xE4])
for size in ('desktop', 'mobile'):
    d = os.path.join(case, size); slug = json.load(open(os.path.join(d, 'clip.json')))['slug']
    src = os.path.join(d, 'out', slug + '.webm')
    if force is None:
        dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).decode())
        w, h = (96, 54) if size == 'desktop' else (54, 96)
        raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps=1,scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
        fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(int); best = (-1, 3)
        for i, f in enumerate(fr):
            if i < 2 or i > dur - 25: continue
            s = (np.abs(f - ground).sum(-1) > 60).mean() + 0.8 * ((f.max(-1) - f.min(-1)) > 60).mean()
            best = max(best, (s, i))
        at = best[1]
    else: at = force
    png = os.path.join(d, 'out', '.cover.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(at), '-i', src, '-frames:v', '1', png], check=True)
    im = Image.open(png).convert('RGB')
    im.resize((1280, 720) if im.width > im.height else (720, 1280), Image.LANCZOS).save(os.path.join(d, 'out', slug + '.webp'), quality=80, method=6)
    os.remove(png); print(size, 'poster at', at, 's')
