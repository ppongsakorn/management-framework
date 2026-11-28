#!/usr/bin/env python3
"""Sound effects for the delegation-levels clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'ding_1', 0.3, 'เรียบร้อย'), ('hook', 'pop_1', 0.3, 'ทำได้ไหม'), ('hook', 'pop_2', 0.3, 'ทำยังไง'), ('hook', 'pop_1', 0.3, 'ขออนุมัติ'), ('hook', 'bonk_1', 0.5, 'เปลี่ยนคน', 'มาถาม'), ('recap', 'pop_1', 0.3, 'ไอเซนฮาวร์'), ('recap', 'pop_2', 0.3, 'อำนาจ'), ('recap', 'bonk_2', 0.45, 'เจ้าของร้านเอง', 'เอง'), ('idea', 'drop_2', 0.5, 'เดลิเกชัน', 'เลเวลส์'), ('idea', 'tada_1', 0.35, 'เจ็ดระดับ', 'เจ็ด'), ('tell', 'drop_1', 0.35, 'เทล'), ('sell', 'drop_1', 0.35, 'เซล'), ('consult', 'drop_1', 0.35, 'คอนซัลต์'), ('agree', 'drop_1', 0.35, 'อะกรี'), ('advise', 'drop_1', 0.35, 'แอดไวซ์'), ('inquire', 'drop_1', 0.35, 'อินไควร์'), ('delegate', 'drop_1', 0.35, 'เดลิเกต'), ('tell', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('sell', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('consult', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('agree', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('advise', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('inquire', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('delegate', 'pop_2', 0.3, 'เช่น', 'อย่าง', 'จัดโต๊ะ', 'หัวหน้าครัว'), ('twist', 'pop_1', 0.3, 'ระดับเจ็ด'), ('twist', 'drop_2', 0.5, 'ไม่จำเป็น'), ('twist', 'ding_1', 0.3, 'ตัดสินใจเองได้'), ('twist', 'ding_1', 0.3, 'ต้องปรึกษา'), ('twist', 'ding_1', 0.3, 'ขออนุมัติ'), ('result', 'pop_1', 0.3, 'จัดโต๊ะ'), ('result', 'pop_1', 0.3, 'สั่งวัตถุดิบ'), ('result', 'pop_1', 0.3, 'ลงทุนใหญ่'), ('result', 'tada_1', 0.4, 'เงียบลง'), ('close', 'bonk_1', 0.45, 'มาไม่ถึง'), ('close', 'pop_2', 0.3, 'นึกว่าฝ่ายจัดซื้อ'), ('close', 'pop_2', 0.3, 'นึกว่าหัวหน้าครัว'), ('close', 'bonk_2', 0.45, 'ใครรับผิดชอบ'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'ราซี'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
