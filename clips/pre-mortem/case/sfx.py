#!/usr/bin/env python3
"""Sound effects for the pre-mortem clip, placed on the same words as the cues in scenes.js.
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
CUES = [('hook', 'bonk_1', 0.4, 'ยอดจองเต็ม', 'จองเต็ม'), ('hook', 'bonk_2', 0.4, 'ขาดทุน'), ('hook', 'pop_1', 0.3, 'ชะงัก'), ('hook', 'pop_2', 0.3, 'เปิดรับจอง'), ('hook', 'pop_1', 0.3, 'หกเดือน', 'อีกหก'), ('hook', 'drop_2', 0.45, 'อยากเลิกที่สุด', 'ที่สุด'), ('silent', 'pop_1', 0.3, 'กลางโต๊ะ'), ('silent', 'pop_1', 0.3, 'คนรับจอง'), ('silent', 'pop_1', 0.3, 'จัดซื้อ'), ('silent', 'pop_1', 0.3, 'คนทำอาหาร'), ('silent', 'pop_2', 0.3, 'ครึ่งชั่วโมง'), ('silent', 'pop_2', 0.3, 'ห้านาที'), ('silent', 'ding_1', 0.3, 'สามสาเหตุ'), ('silent', 'bonk_2', 0.4, 'เฉลยก่อน'), ('reasons', 'pop_1', 0.3, 'ทีละข้อ', 'ผลัดกันอ่าน'), ('reasons', 'pop_2', 0.3, 'ยังไม่เถียง'), ('reasons', 'pop_1', 0.3, 'ฝนตก', 'หน้าร้าน'), ('reasons', 'bonk_2', 0.4, 'ขายใครล่ะ'), ('reasons', 'pop_1', 0.3, 'เที่ยงสิบห้า', 'มาพร้อมกัน'), ('reasons', 'bonk_2', 0.4, 'ไม่ได้กิน', 'สักที'), ('reasons', 'pop_1', 0.3, 'ขายหมดจริง', 'ใบสุดท้าย'), ('reasons', 'bonk_2', 0.4, 'ราคาเดิม', 'ราคาขึ้น'), ('vote', 'pop_1', 0.3, 'ติดทุกใบ'), ('vote', 'ding_1', 0.3, 'โหวต', 'สามเรื่อง'), ('vote', 'pop_2', 0.3, 'ใครจะเห็นก่อน'), ('vote', 'ding_2', 0.3, 'ยืนยันเวลา', 'หน้าที่'), ('vote', 'pop_1', 0.3, 'แยกยอด', 'คนละช่อง'), ('vote', 'bonk_1', 0.4, 'ขายหมด'), ('owners', 'pop_1', 0.3, 'แบ่งเวลา', 'เป็นรอบ'), ('owners', 'pop_2', 0.3, 'หยุดเพิ่มยอด'), ('owners', 'pop_1', 0.3, 'ฝ่ายจัดซื้อ', 'เช็กราคา'), ('owners', 'ding_1', 0.3, 'ต่ำกว่าเกณฑ์'), ('owners', 'ding_2', 0.3, 'คุยกับเจ้าของ'), ('close', 'tada_1', 0.4, 'พรีมอร์เท็ม', 'นี่คือ'), ('close', 'pop_1', 0.3, 'เล่าว่ามันพัง', 'ลงมือ'), ('close', 'pop_1', 0.3, 'ตารางเวลา'), ('close', 'pop_1', 0.3, 'ชื่อคนดูแล', 'คนดูแลครบ'), ('close', 'pop_2', 0.3, 'วันแรก'), ('close', 'bonk_2', 0.4, 'วันนี้คนมารับ', 'มารับจริงกี่จาน'), ('close', 'pop_1', 0.3, 'ดูวิธี'), ('close', 'tada_2', 0.45, 'เข็มทิศ')]
for sid, snd, g, *w in CUES: add(snd, T(sid, *w), g)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
