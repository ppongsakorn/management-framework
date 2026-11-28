#!/usr/bin/env python3
"""Sound effects for the weighted-decision-matrix clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'pop_2', 0.3, 'ลูกค้าใหม่'), ('hook', 'pop_2', 0.3, 'วัดกำไร', 'กำไร'), ('hook', 'pop_1', 0.3, 'หัวเราะ'), ('hook', 'pop_1', 0.3, 'สามใบ', 'กระดาษ'), ('hook', 'pop_1', 0.3, 'นับคะแนน', 'เริ่มนับ'), ('hook', 'bonk_2', 0.4, 'แข่งเรื่องอะไร', 'เรื่องอะไร'), ('criteria', 'pop_1', 0.3, 'ใบแรก'), ('criteria', 'pop_1', 0.3, 'ใบที่สอง'), ('criteria', 'pop_1', 0.3, 'ใบที่สาม'), ('criteria', 'pop_2', 0.3, 'คว่ำ'), ('criteria', 'bonk_1', 0.4, 'ต้องดูอะไร'), ('criteria', 'pop_1', 0.3, 'เหลือกำไร', 'อยากเหลือ'), ('criteria', 'pop_1', 0.3, 'ลูกค้าใหม่', 'อยากได้ลูกค้า'), ('criteria', 'ding_1', 0.3, 'เงินเริ่มต้น', 'ใช้เงิน'), ('criteria', 'ding_1', 0.3, 'ทันพักเที่ยง', 'ข้าวทัน'), ('weights', 'drop_1', 0.35, 'ร้อยแต้ม', 'น้ำหนัก'), ('weights', 'pop_1', 0.3, 'ให้กำไร', 'กำไรสี่'), ('weights', 'pop_1', 0.3, 'สามสิบ'), ('weights', 'pop_1', 0.3, 'ยี่สิบ'), ('weights', 'pop_1', 0.3, 'เบาภาระ', 'ภาระครัว'), ('weights', 'ding_1', 0.3, 'ห้าคือ', 'ดีสุด'), ('weights', 'pop_2', 0.3, 'ยิ่งน้อย', 'เงินลงทุนยิ่ง'), ('weights', 'pop_2', 0.3, 'แยกกัน', 'หนึ่งถึงห้า'), ('weights', 'bonk_1', 0.4, 'ใครกำลังเดา', 'กำลังเดา'), ('score', 'pop_1', 0.3, 'แถวแรก'), ('score', 'pop_2', 0.3, 'หนึ่งจุดหก', 'คูณน้ำหนัก'), ('score', 'ding_1', 0.35, 'สามจุดสาม'), ('score', 'ding_1', 0.35, 'สามจุดหนึ่ง'), ('score', 'ding_1', 0.35, 'สามจุดศูนย์'), ('score', 'tada_1', 0.4, 'ตารางตัดสินใจ', 'วิธีใช้'), ('test', 'pop_1', 0.3, 'กำไรสี่นี่', 'รู้จริงหรือยัง'), ('test', 'bonk_2', 0.4, 'จากสี่เป็นสาม', 'ลดคะแนน'), ('test', 'bonk_1', 0.4, 'สองจุดเก้า', 'ตกเหลือ'), ('test', 'tada_1', 0.4, 'ขึ้นนำ'), ('test', 'pop_2', 0.3, 'ทั้งโต๊ะเงียบ', 'เงียบ'), ('test', 'bonk_2', 0.4, 'มารับจริง'), ('close', 'pop_1', 0.3, 'ทดลอง'), ('close', 'pop_1', 0.3, 'ที่มารับ', 'ยอดที่'), ('close', 'pop_1', 0.3, 'ของเหลือ'), ('close', 'pop_1', 0.3, 'กำไรต่อจาน', 'ต่อจาน'), ('close', 'ding_1', 0.3, 'ให้คะแนนใหม่', 'คะแนนใหม่'), ('close', 'pop_2', 0.3, 'ประกาศ', 'เปิดรับจอง'), ('close', 'bonk_1', 0.4, 'ยกมือ'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
