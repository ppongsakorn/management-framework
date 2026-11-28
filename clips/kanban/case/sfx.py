#!/usr/bin/env python3
"""Sound effects for the kanban clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'pop_1', 0.3, 'สต็อก'), ('hook', 'pop_1', 0.3, 'อบรม'), ('hook', 'pop_1', 0.3, 'คิวอาหาร', 'ปรับคิว'), ('hook', 'pop_1', 0.3, 'เตา'), ('hook', 'bonk_1', 0.45, 'เสร็จบ้าง', 'มีอะไรเสร็จ'), ('recap', 'pop_2', 0.3, 'มอบหมาย'), ('recap', 'pop_2', 0.3, 'กำหนดหน้าที่', 'หน้าที่'), ('recap', 'pop_2', 0.3, 'ปรับวิธี'), ('recap', 'bonk_2', 0.4, 'ค้าง', 'งานเก่า'), ('idea', 'drop_2', 0.5, 'คัมบัง'), ('idea', 'pop_2', 0.3, 'เห็นร่วมกัน'), ('idea', 'tada_1', 0.35, 'ไหล'), ('board', 'pop_1', 0.3, 'ทูดู'), ('board', 'pop_1', 0.3, 'ดูอิ้ง'), ('board', 'pop_1', 0.3, 'รีวิว'), ('board', 'pop_1', 0.3, 'ดัน', 'เสร็จแล้ว'), ('board', 'ding_1', 0.3, 'เลื่อน'), ('reveal', 'bonk_1', 0.45, 'สิบสอง'), ('reveal', 'bonk_2', 0.4, 'สลับ'), ('wip', 'drop_1', 0.35, 'วิป', 'ลิมิต'), ('wip', 'ding_1', 0.3, 'ไม่เกินสาม', 'สามงาน'), ('wip', 'bonk_2', 0.4, 'ห้ามเริ่ม'), ('wip', 'tada_1', 0.35, 'มากขึ้น ก็ไม่ได้', 'แปลว่า'), ('pull', 'ding_2', 0.3, 'ดึง'), ('pull', 'pop_2', 0.3, 'พูล', 'ซิสเต็ม'), ('pull', 'bonk_1', 0.4, 'ตะโกน'), ('blocked', 'bonk_2', 0.45, 'บล็อกต์', 'ติดป้าย'), ('blocked', 'pop_1', 0.3, 'ใครช่วย', 'ต้องการ'), ('blocked', 'bonk_1', 0.4, 'ซ่อน'), ('done', 'ding_1', 0.3, 'สอนจบ'), ('done', 'ding_1', 0.3, 'ตกลง'), ('done', 'tada_1', 0.35, 'ผลลัพธ์'), ('measure', 'pop_2', 0.3, 'กี่งาน'), ('measure', 'pop_2', 0.3, 'นานแค่ไหน'), ('measure', 'pop_2', 0.3, 'ขั้นไหน'), ('measure', 'bonk_2', 0.35, 'ตรวจช้า'), ('result', 'ding_2', 0.35, 'ต่อเนื่อง'), ('result', 'pop_1', 0.3, 'ทุกเช้า'), ('result', 'tada_1', 0.4, 'แค่มอง', 'มองกระดาน'), ('close', 'tada_2', 0.35, 'หนึ่งเดือน'), ('close', 'pop_2', 0.3, 'ซื้อซ้ำ'), ('close', 'pop_2', 0.3, 'กำไร'), ('close', 'bonk_2', 0.4, 'สร้างผลลัพธ์', 'ผลลัพธ์อะไร'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'โอเคอาร์'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
