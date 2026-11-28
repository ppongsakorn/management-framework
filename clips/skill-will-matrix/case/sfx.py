#!/usr/bin/env python3
"""Sound effects for the skill-will-matrix clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'pop_1', 0.3, 'คนแรก'), ('hook', 'pop_1', 0.3, 'อีกคน'), ('hook', 'pop_2', 0.3, 'อยากทำแต่'), ('hook', 'pop_2', 0.3, 'ทำเป็นแต่'), ('hook', 'bonk_1', 0.45, 'เหมือนกันไหม'), ('recap', 'pop_1', 0.3, 'ไอเซนฮาวร์'), ('recap', 'pop_1', 0.3, 'เดลิเกชัน'), ('recap', 'pop_1', 0.3, 'ราซี'), ('recap', 'drop_1', 0.45, 'ไม่ได้แปลว่า'), ('idea', 'drop_2', 0.5, 'สกิล วิล', 'เมทริกซ์'), ('idea', 'pop_2', 0.3, 'ทำเป็นไหม'), ('idea', 'pop_2', 0.3, 'อยากทำไหม'), ('idea', 'tada_1', 0.35, 'สี่แบบ'), ('guide', 'drop_1', 0.35, 'แบบ'), ('excite', 'drop_1', 0.35, 'แบบ'), ('direct', 'drop_1', 0.35, 'แบบ'), ('delegate', 'drop_1', 0.35, 'แบบ'), ('guide', 'ding_1', 0.3, 'สอน'), ('excite', 'ding_1', 0.3, 'ลองคุย', 'คุยก่อน'), ('direct', 'ding_1', 0.3, 'ความคาดหวัง'), ('direct', 'bonk_2', 0.4, 'ปรับบทบาท'), ('delegate', 'tada_1', 0.35, 'นี่แหละ'), ('twist', 'pop_1', 0.3, 'ยังทำไม่เป็น'), ('twist', 'pop_1', 0.3, 'หมดไฟ'), ('twist', 'pop_1', 0.3, 'พร้อมแล้ว'), ('twist', 'bonk_1', 0.5, 'แบบเดียวกัน'), ('apply', 'pop_1', 0.3, 'ทีละคน'), ('apply', 'bonk_2', 0.4, 'ติดป้าย'), ('apply', 'pop_2', 0.3, 'คนเดียวกัน'), ('result', 'ding_2', 0.35, 'แม่นขึ้น'), ('result', 'ding_2', 0.35, 'มีส่วนร่วม'), ('result', 'ding_2', 0.35, 'พัฒนาระบบ'), ('result', 'tada_1', 0.4, 'พัฒนาทีม'), ('close', 'pop_2', 0.3, 'สอนมากแค่ไหน'), ('close', 'pop_2', 0.3, 'ปล่อยให้ลอง'), ('close', 'pop_2', 0.3, 'ถอยออกมา'), ('close', 'bonk_2', 0.4, 'ผู้นำ'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'ลีดเดอร์ชิป'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
