#!/usr/bin/env python3
"""Sound effects for the porters-5-forces clip, placed on the same words as the cues in scenes.js.
   words[].s in timeline.json are absolute seconds, so T() already gives clip time (no scene start is added).
   python3 sfx.py <clip dir> <in.mp4> <out.mp4>"""
import json, os, re, subprocess, sys
d, src, out = sys.argv[1:4]
SND = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_shared', 'sound')
tl = json.load(open(f'{d}/timeline.json')); lead = tl.get('cue_lead', 0.08)
nm = lambda s: re.sub(r'[^\w฀-๿]', '', s.lower()).replace('_', '')
S = {s['id']: s for s in tl['scenes']}
def T(sid, *alts):
    s = S[sid]; cat, own = '', []
    for i, w in enumerate(s['words']):
        n = nm(w['w']); cat += n; own += [i] * len(n)
    for a in alts:
        k = cat.find(nm(a))
        if k >= 0: return s['words'][own[k]]['s'] - lead
    return s['voice']['at'] + 0.5            # word not heard: fall back to just after the voice starts
st = lambda sid: S[sid]['start']
fx = []
add = lambda k, t, g: fx.append((k, t, g))
for sid in S: add('drop_1', st(sid) + .12, .22) if sid not in ('hook',) else None
CUES = [('hook', 'tada_1', 0.3, 'ทำเลทอง'), ('hook', 'bonk_1', 0.4, 'ห้าร้าน', 'คู่แข่ง'), ('hook', 'pop_2', 0.3, 'ซัพพลายเออร์'), ('hook', 'pop_2', 0.3, 'แอป', 'เทียบราคา'), ('hook', 'bonk_2', 0.4, 'ออกรบ'), ('recap', 'pop_2', 0.3, 'สวอต'), ('recap', 'pop_2', 0.3, 'ทำกำไร'), ('recap', 'drop_2', 0.5, 'พอร์เตอร์ส', 'ฟอร์ซิส'), ('recap', 'tada_1', 0.35, 'ห้าด้าน'), ('rivals', 'drop_1', 0.35, 'แรงที่หนึ่ง', 'คู่แข่งเดิม'), ('entrants', 'drop_1', 0.35, 'แรงที่สอง', 'รายใหม่'), ('suppliers', 'drop_1', 0.35, 'แรงที่สาม', 'ซัพพลายเออร์'), ('buyers', 'drop_1', 0.35, 'แรงที่สี่', 'ลูกค้า'), ('subs', 'drop_1', 0.35, 'แรงที่ห้า', 'สินค้าทดแทน'), ('rivals', 'pop_1', 0.3, 'ลดราคา'), ('rivals', 'pop_1', 0.3, 'แถม'), ('rivals', 'bonk_1', 0.4, 'ยังไม่ทันเปิด', 'เกือบต้อง'), ('rivals', 'ding_1', 0.3, 'ทำไมลูกค้า', 'เลือกเรา'), ('entrants', 'pop_1', 0.3, 'ซื้อเตา', 'เช่าที่'), ('entrants', 'ding_1', 0.3, 'ลอกยาก', 'แบรนด์'), ('suppliers', 'bonk_2', 0.4, 'สิบเปอร์เซ็นต์', 'ขึ้นราคา'), ('suppliers', 'bonk_1', 0.4, 'จะซื้อใคร', 'อ้าว'), ('suppliers', 'ding_1', 0.3, 'ทางเลือกเพิ่ม', 'ไม่ลดคุณภาพ'), ('buyers', 'pop_1', 0.3, 'เทียบราคา', 'มือถือ'), ('buyers', 'pop_1', 0.3, 'ย้ายร้าน'), ('buyers', 'ding_1', 0.3, 'ขายถูกลง', 'อยากกลับมา'), ('subs', 'pop_1', 0.3, 'สะดวกซื้อ', 'พร้อมทาน'), ('subs', 'pop_1', 0.3, 'ทำกินเอง'), ('subs', 'pop_1', 0.3, 'ครัวเดลิเวอรี่', 'เดลิเวอรี่'), ('subs', 'bonk_2', 0.4, 'แย่งลูกค้า', 'ไม่ได้ขายแบบเรา'), ('board', 'bonk_2', 0.3, 'คู่แข่ง'), ('board', 'bonk_2', 0.3, 'รายใหม่'), ('board', 'pop_2', 0.3, 'ซัพพลายเออร์'), ('board', 'bonk_2', 0.3, 'ลูกค้า'), ('board', 'bonk_2', 0.3, 'สินค้าทดแทน', 'ทดแทน'), ('board', 'bonk_1', 0.4, 'เยอะขนาดนี้', 'ทำเลทอง'), ('twist', 'ding_2', 0.3, 'สี่สิบสาม'), ('twist', 'ding_2', 0.3, 'สิบห้า'), ('twist', 'pop_1', 0.3, 'ชุดกลางวัน'), ('twist', 'pop_1', 0.3, 'ลูกค้าเดิม'), ('twist', 'tada_1', 0.4, 'ไม่ได้มีแค่', 'สาขาใหม่'), ('close', 'tada_1', 0.35, 'ตลาดที่ขายดี', 'ขายดี'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'แอนซอฟฟ์', 'เมทริกซ์'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
