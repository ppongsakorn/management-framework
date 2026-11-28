#!/usr/bin/env python3
"""Sound effects for the ansoff-matrix clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'pop_2', 0.3, 'คนเดินเยอะ', 'เดินเยอะ'), ('hook', 'pop_2', 0.3, 'เรียงกัน', 'เต็มถนน'), ('hook', 'bonk_1', 0.4, 'ค่าเช่า', 'เริ่มนับ'), ('hook', 'pop_1', 0.3, 'ยังไม่มีใคร', 'รับปาก'), ('again', 'pop_1', 0.3, 'ริมหน้าต่าง'), ('again', 'pop_1', 0.3, 'พักเที่ยง'), ('again', 'pop_1', 0.3, 'จองอาหาร', 'ก่อนมาถึง'), ('again', 'ding_1', 0.3, 'ของเดิม', 'ลูกค้าเดิม'), ('again', 'ding_2', 0.3, 'บ่อยขึ้น', 'กลับมากิน'), ('lunch', 'pop_1', 0.3, 'พักเที่ยง', 'เที่ยงสั้น'), ('lunch', 'pop_1', 0.3, 'รีบกลับ'), ('lunch', 'pop_1', 0.3, 'ชุดมื้อด่วน', 'มื้อด่วน'), ('lunch', 'ding_1', 0.3, 'จดอีกใบ', 'อีกใบ'), ('lunch', 'bonk_2', 0.4, 'คนละอย่าง', 'คำเดียว'), ('market', 'pop_1', 0.3, 'ย่านที่เราเพิ่ง', 'พนักงานในย่าน'), ('market', 'ding_1', 0.3, 'กลุ่มใหม่'), ('market', 'pop_1', 0.3, 'อยากสั่งไหม'), ('market', 'ding_1', 0.3, 'อาหารพร้อมปรุง', 'พร้อมปรุง'), ('market', 'bonk_2', 0.4, 'ใหม่พร้อมกัน', 'ทั้งสองด้าน'), ('matrix', 'pop_1', 0.3, 'ขายอะไร'), ('matrix', 'pop_1', 0.3, 'ขายให้ใคร'), ('matrix', 'pop_2', 0.3, 'สี่ใบ', 'กระดาษ'), ('matrix', 'tada_1', 0.4, 'แอนซอฟฟ์', 'เมทริกซ์'), ('matrix', 'ding_2', 0.3, 'หลักฐาน', 'วงสิ่งที่'), ('close', 'pop_1', 0.3, 'พร้อมปรุง'), ('close', 'pop_1', 0.3, 'ทั้งสูตร', 'สูตร'), ('close', 'pop_1', 0.3, 'ทั้งแพ็ก', 'แพ็ก'), ('close', 'pop_1', 0.3, 'หาคนซื้อ', 'คนซื้อ'), ('close', 'bonk_2', 0.4, 'พักไว้ก่อน', 'ขอพัก'), ('close', 'ding_1', 0.3, 'สามใบ'), ('close', 'drop_2', 0.45, 'ควรหยิบใบไหน', 'ใบไหนก่อน'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
