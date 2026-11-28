#!/usr/bin/env python3
"""Sound effects for the raci clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'ding_1', 0.3, 'เต็มร้าน'), ('hook', 'pop_1', 0.3, 'ตู้เย็น'), ('hook', 'bonk_1', 0.55, 'ยังไม่มาส่ง', 'วัตถุดิบหลัก'), ('hook', 'pop_2', 0.3, 'นึกว่าฝ่ายจัดซื้อ'), ('hook', 'pop_2', 0.3, 'นึกว่าหัวหน้าครัว'), ('hook', 'bonk_2', 0.45, 'ใครเป็นคน'), ('recap', 'pop_1', 0.3, 'เดลิเกชัน'), ('recap', 'pop_1', 0.3, 'รับผิดชอบงานไหน'), ('recap', 'drop_1', 0.45, 'ไม่เหมือนกัน'), ('idea', 'drop_2', 0.5, 'ราซี'), ('idea', 'pop_2', 0.3, 'อาร์'), ('idea', 'pop_2', 0.3, 'เอ'), ('idea', 'pop_2', 0.3, 'ซี'), ('idea', 'pop_2', 0.3, 'ไอ'), ('r', 'drop_1', 0.35, 'อาร์'), ('a', 'drop_1', 0.35, 'เอ'), ('c', 'drop_1', 0.35, 'ซี'), ('i', 'drop_1', 0.35, 'ไอ'), ('r', 'pop_1', 0.3, 'จัดซื้อ'), ('a', 'pop_1', 0.3, 'หัวหน้าครัว'), ('a', 'ding_2', 0.4, 'คนเดียว'), ('c', 'pop_1', 0.3, 'หน้าร้าน'), ('i', 'pop_1', 0.3, 'เจ้าของร้าน'), ('build', 'pop_1', 0.3, 'ชวนทีม'), ('build', 'pop_2', 0.25, 'ทีละช่อง'), ('build', 'reveal_1', 0.3, 'อ๋อ'), ('build', 'bonk_1', 0.5, 'ไม่มีใครเป็นเอ'), ('build', 'bonk_2', 0.45, 'ทุกคนต้องอนุมัติ'), ('fix', 'ding_1', 0.35, 'ไม่มีเอ'), ('fix', 'ding_1', 0.35, 'ซ้ำซ้อน'), ('fix', 'pop_1', 0.3, 'ระดับการมอบอำนาจ'), ('result', 'ding_2', 0.35, 'ตรงเวลา'), ('result', 'tada_1', 0.4, 'เยี่ยม'), ('close', 'pop_1', 0.3, 'ดีมาก'), ('close', 'pop_1', 0.3, 'ผิดบ่อย'), ('close', 'pop_1', 0.3, 'ไม่ค่อยอยาก'), ('close', 'bonk_2', 0.4, 'ความพร้อม'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'สกิล'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
