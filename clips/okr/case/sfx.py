#!/usr/bin/env python3
"""Sound effects for the okr clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'ding_1', 0.3, 'สต็อก'), ('hook', 'ding_1', 0.3, 'อบรม'), ('hook', 'ding_1', 0.3, 'เตา'), ('hook', 'tada_1', 0.35, 'ยี่สิบ'), ('hook', 'bonk_1', 0.45, 'อ้าว'), ('hook', 'bonk_2', 0.4, 'ไม่ไปไหน', 'ทำไมธุรกิจ'), ('recap', 'pop_2', 0.3, 'คัมบัง'), ('recap', 'pop_1', 0.3, 'ผิดทาง'), ('recap', 'bonk_2', 0.35, 'ห่าง'), ('recap', 'pop_2', 0.3, 'ทางไหน'), ('idea', 'drop_2', 0.5, 'โอเคอาร์'), ('idea', 'pop_2', 0.3, 'ออบเจกทีฟ'), ('idea', 'pop_2', 0.3, 'คีย์', 'รีซัลท์ส'), ('objective', 'pop_1', 0.3, 'ครัว'), ('objective', 'pop_1', 0.3, 'หน้าร้าน'), ('objective', 'pop_1', 0.3, 'เจ้าของร้านอยาก', 'กำไร'), ('objective', 'tada_1', 0.4, 'ไตรมาส', 'ออบเจกทีฟ'), ('kr', 'bonk_2', 0.35, 'วัดยังไง'), ('kr', 'ding_1', 0.3, 'หนึ่ง'), ('kr', 'ding_1', 0.3, 'สอง'), ('kr', 'ding_1', 0.3, 'สาม'), ('output', 'pop_1', 0.3, 'ยกมือ'), ('output', 'pop_2', 0.3, 'ถามกลับ'), ('output', 'bonk_1', 0.4, 'อ๋อ', 'ไม่สำเร็จ'), ('output', 'pop_2', 0.3, 'เอาต์พุต'), ('output', 'tada_1', 0.35, 'เอาต์คัม'), ('teams', 'pop_1', 0.3, 'ครัว'), ('teams', 'pop_1', 0.3, 'หน้าร้าน'), ('teams', 'pop_1', 0.3, 'จัดซื้อ'), ('teams', 'ding_2', 0.35, 'เป้าหมายเดียวกัน', 'เดียวกัน'), ('track', 'bonk_2', 0.4, 'ลิ้นชัก'), ('track', 'pop_2', 0.3, 'ทุกสัปดาห์'), ('track', 'ding_1', 0.3, 'พีดีซีเอ'), ('twist', 'ding_2', 0.3, 'เร็วขึ้นชัด', 'เร็วขึ้น'), ('twist', 'bonk_1', 0.4, 'ไม่พอ'), ('twist', 'pop_1', 0.3, 'รสชาติ'), ('twist', 'pop_1', 0.3, 'บริการ'), ('twist', 'tada_1', 0.35, 'ถูกทาง'), ('result', 'ding_2', 0.35, 'ลูกค้ากลับมาซ้ำ', 'กลับมาซ้ำ'), ('result', 'ding_2', 0.35, 'ภายในสิบห้า', 'ได้อาหาร'), ('result', 'ding_2', 0.35, 'อัตรากำไร'), ('result', 'tada_1', 0.4, 'ดีขึ้นตรงไหน', 'ดีขึ้น'), ('sum', 'pop_2', 0.3, 'ออบเจกทีฟ'), ('sum', 'pop_2', 0.3, 'คีย์', 'รีซัลท์ส'), ('sum', 'pop_2', 0.3, 'งานที่ทำ'), ('sum', 'tada_1', 0.4, 'ทำให้อะไรดีขึ้น', 'ดีขึ้นบ้าง'), ('close', 'pop_1', 0.3, 'สาขาที่สอง', 'สาขา'), ('close', 'bonk_1', 0.4, 'เดี๋ยวก่อน'), ('close', 'pop_2', 0.3, 'จุดแข็ง'), ('close', 'pop_2', 0.3, 'จุดอ่อน'), ('close', 'pop_2', 0.3, 'โอกาส'), ('close', 'pop_2', 0.3, 'ความเสี่ยง'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'สว็อต', 'อนาลิซิส'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
