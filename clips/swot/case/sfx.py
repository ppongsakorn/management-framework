#!/usr/bin/env python3
"""Sound effects for the swot clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'tada_1', 0.35, 'สิบสาขา', 'สิบเท่า'), ('hook', 'pop_2', 0.3, 'ครัวสาขาใหม่', 'หัวหน้าครัว'), ('hook', 'pop_2', 0.3, 'หาลูกค้า', 'หัวหน้าร้าน'), ('hook', 'bonk_1', 0.4, 'ฝัน'), ('hook', 'bonk_2', 0.4, 'ไม่ใช่เรื่องเดียวกัน', 'เรื่องเดียวกัน'), ('recap', 'ding_2', 0.3, 'สี่สิบสาม'), ('recap', 'ding_2', 0.3, 'สิบห้า'), ('recap', 'ding_2', 0.3, 'ทำงานได้เอง'), ('recap', 'pop_2', 0.3, 'ขยาย'), ('idea', 'drop_2', 0.5, 'สวอต', 'อะนาลิซิส'), ('idea', 'pop_1', 0.3, 'เอส'), ('idea', 'pop_1', 0.3, 'ดับเบิลยู'), ('idea', 'pop_1', 0.3, 'โอ โอกาส', 'โอกาส'), ('idea', 'pop_1', 0.3, 'ที ภัย', 'ภัยคุกคาม'), ('s', 'drop_1', 0.35, 'จุดแข็ง'), ('w', 'drop_1', 0.35, 'จุดอ่อน'), ('o', 'drop_1', 0.35, 'โอกาส'), ('t', 'drop_1', 0.35, 'ภัยคุกคาม'), ('s', 'pop_2', 0.3, 'ครัวมีระบบ', 'อาหารออกเร็ว'), ('s', 'pop_2', 0.3, 'ลูกค้าประจำ'), ('s', 'pop_2', 0.3, 'พนักงาน'), ('s', 'pop_2', 0.3, 'กำไรดีขึ้น', 'ข้อมูลวัดผล'), ('s', 'tada_1', 0.35, 'ข้อมูลยืนยัน', 'ไม่ใช่แค่'), ('w', 'bonk_1', 0.4, 'ใครดูแลครัวเดิม', 'ยกมือ'), ('w', 'pop_2', 0.3, 'มีคนเดียว'), ('w', 'pop_2', 0.3, 'จัดซื้อ'), ('w', 'pop_2', 0.3, 'เงินสำรอง'), ('o', 'pop_2', 0.3, 'ออฟฟิศเปิด'), ('o', 'pop_2', 0.3, 'มื้อกลางวัน'), ('o', 'ding_1', 0.3, 'ตรงกับจุดแข็ง', 'จุดแข็งเรา'), ('o', 'bonk_2', 0.4, 'สมมติฐาน'), ('t', 'pop_2', 0.3, 'ค่าเช่า'), ('t', 'pop_2', 0.3, 'วัตถุดิบ'), ('t', 'pop_2', 0.3, 'เชนใหญ่', 'ร้านเชน'), ('t', 'pop_2', 0.3, 'เดลิเวอรี่'), ('t', 'bonk_1', 0.4, 'สนามรบ', 'ทำเลทอง'), ('inout', 'ding_1', 0.3, 'ภายในร้าน', 'ภายใน'), ('inout', 'ding_1', 0.3, 'ภายนอก'), ('notyet', 'pop_2', 0.3, 'เปิดสาขาได้', 'ตกลง'), ('notyet', 'bonk_1', 0.45, 'ยังไม่รู้'), ('notyet', 'bonk_2', 0.4, 'ไม่ได้แปลว่า', 'กลยุทธ์'), ('options', 'pop_1', 0.3, 'อาหารเร็ว'), ('options', 'pop_1', 0.3, 'หัวหน้าครัวมีคนเดียว', 'ฝึกคนใหม่'), ('options', 'pop_1', 0.3, 'ค่าเช่าแพง', 'ร้านเล็ก'), ('options', 'pop_1', 0.3, 'เงินสำรอง', 'ชะลอ'), ('options', 'tada_1', 0.35, 'ลงมือได้จริง', 'ทางเลือก'), ('check', 'pop_2', 0.3, 'พาเรโต้'), ('check', 'ding_1', 0.3, 'ต้องการจริง'), ('check', 'ding_1', 0.3, 'หัวหน้าทีม'), ('check', 'ding_1', 0.3, 'คุ้มความเสี่ยง', 'รายได้'), ('check', 'pop_2', 0.3, 'คัมบัง'), ('sum', 'bonk_2', 0.4, 'สัญญาเช่า'), ('sum', 'tada_1', 0.4, 'จำไว้นะ'), ('close', 'pop_1', 0.3, 'คู่แข่ง'), ('close', 'pop_1', 0.3, 'เชนใหญ่'), ('close', 'pop_1', 0.3, 'แอปเดลิเวอรี่', 'เดลิเวอรี่'), ('close', 'pop_1', 0.3, 'จองหลายราย', 'เจ้าของพื้นที่'), ('close', 'bonk_1', 0.4, 'โดนล้อม'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'พอร์เตอร์ส', 'ฟอร์ซิส'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
