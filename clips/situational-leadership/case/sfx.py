#!/usr/bin/env python3
"""Sound effects for the situational-leadership clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'pop_1', 0.3, 'เตรียมของ'), ('hook', 'pop_1', 0.3, 'จัดจาน'), ('hook', 'bonk_1', 0.45, 'สิบปี', 'พี่ครับ'), ('hook', 'bonk_2', 0.45, 'น่ารำคาญ'), ('recap', 'pop_1', 0.3, 'สกิล', 'เมทริกซ์'), ('recap', 'pop_2', 0.3, 'ช่วยแค่ไหน', 'แค่ไหน'), ('recap', 'pop_2', 0.3, 'ปล่อยให้', 'ทำเอง'), ('idea', 'drop_2', 0.5, 'ซิชวล', 'ลีดเดอร์ชิป'), ('idea', 'pop_2', 0.3, 'การชี้แนะ', 'ชี้แนะ'), ('idea', 'pop_2', 0.3, 'การสนับสนุน', 'สนับสนุน'), ('idea', 'tada_1', 0.35, 'สี่แบบ'), ('s1', 'drop_1', 0.35, 'แบบ'), ('s2', 'drop_1', 0.35, 'แบบ'), ('s3', 'drop_1', 0.35, 'แบบ'), ('s4', 'drop_1', 0.35, 'แบบ'), ('s1', 'bonk_2', 0.4, 'เริ่มตรงไหน', 'จะให้เริ่ม'), ('s1', 'ding_1', 0.3, 'ชี้แนะมาก'), ('s2', 'ding_1', 0.3, 'อธิบายเหตุผล', 'อธิบาย'), ('s2', 'ding_2', 0.3, 'ชี้แนะมาก'), ('s3', 'pop_2', 0.3, 'ถ้าเป็นเรา'), ('s3', 'ding_1', 0.3, 'น้อยลง'), ('s4', 'ding_1', 0.3, 'เป้าหมาย'), ('s4', 'tada_1', 0.35, 'ขัดจังหวะ'), ('twist', 'bonk_1', 0.45, 'เดี๋ยวก่อน'), ('twist', 'pop_1', 0.3, 'สต็อก'), ('twist', 'bonk_2', 0.4, 'ตำแหน่ง'), ('twist', 'ding_2', 0.35, 'ความพร้อม'), ('apply', 'pop_1', 0.3, 'คนใหม่'), ('apply', 'pop_1', 0.3, 'เริ่มทำได้'), ('apply', 'pop_1', 0.3, 'ยังไม่มั่นใจ'), ('apply', 'pop_1', 0.3, 'คนที่พร้อม', 'อำนาจ'), ('result', 'ding_2', 0.35, 'ทำงานได้เอง'), ('result', 'ding_2', 0.35, 'อิสระ'), ('result', 'ding_2', 0.35, 'ดูแลทีม'), ('result', 'tada_1', 0.4, 'ยืนคุม'), ('close', 'pop_2', 0.3, 'สต็อก'), ('close', 'pop_2', 0.3, 'อบรม'), ('close', 'pop_2', 0.3, 'ซัพพลายเออร์'), ('close', 'bonk_2', 0.4, 'ทั้งวัน', 'เดินถาม'), ('close', 'drop_2', 0.45, 'ตอนหน้า'), ('close', 'pop_1', 0.35, 'คัมบัง'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
