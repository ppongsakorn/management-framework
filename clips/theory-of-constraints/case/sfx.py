#!/usr/bin/env python3
"""Sound effects for the theory-of-constraints clip, placed on the same words as the cues in scenes.js.
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
# hook: more customers, two more waiters, the hope
add('ding_1', T('hook', 'ดีขึ้น'), .35)
c = T('hook', 'เยอะขึ้น', 'กลับมา')
for k in range(8): add('pop_1', c - .2 + k * .12, .18)
s = T('hook', 'สองคน'); add('pop_2', s - .15, .35); add('pop_2', s + .05, .35); add('pop_1', T('hook', 'หวังว่า', 'รองรับ'), .3)
# puzzle: same 60
add('drop_1', st('puzzle') + .1, .3); add('pop_1', T('puzzle', 'ตัวเลข'), .3); add('bonk_1', T('puzzle', 'เท่าเดิม'), .55); add('pop_2', T('puzzle', 'อะไรกันแน่', 'จำกัด'), .3)
# idea
add('drop_2', T('idea', 'ทฤษฎีข้อจำกัด', 'ทฤษฎี'), .55); add('pop_1', T('idea', 'ทีโอซี', 'toc'), .3); add('reveal_1', T('idea', 'ช้าที่สุด') - .3, .3); add('ding_1', T('idea', 'คอขวด'), .4)
# 1 map: five stations
add('drop_1', st('map') + .15, .3); m0, m1 = T('map', 'วาดเส้นทาง', 'วาด'), T('map', 'แต่ละขั้น', 'ชั่วโมงละ')
for k in range(5): add('pop_2', m0 + k * max(.2, (m1 + .6 - m0) / 4), .25)
# 2 find
add('drop_1', st('find') + .15, .3); p0 = T('find', 'กองรอ', 'จานกอง')
for k in range(5): add('pop_1', p0 + k * .25, .16)
add('bonk_1', T('find', 'หน้าเตา'), .55); add('pop_2', T('find', 'แปดสิบ'), .3); add('bonk_2', T('find', 'ทุกจาน'), .4)
# 3 exploit
add('drop_1', st('exploit') + .15, .3)
for w in (('เตรียมของเป็นชุด', 'เป็นชุด'), ('ผัดอย่างเดียว', 'อย่างเดียว'), ('ไม่ปล่อยให้เตาว่าง', 'ว่าง')): add('pop_1', T('exploit', *w), .3)
add('ding_2', T('exploit', 'เจ็ดสิบสอง', 'เพิ่มเป็น'), .4)
# 4 pace
add('drop_1', st('pace') + .15, .3); add('pop_1', T('pace', 'ส่งออร์เดอร์', 'ออร์เดอร์'), .35); add('bonk_2', T('pace', 'เร่ง'), .4)
# 5 elevate
add('drop_1', st('elevate') + .15, .3); add('drop_2', T('elevate', 'หัวที่สี่', 'สี่'), .5); add('ding_2', T('elevate', 'เก้าสิบหก'), .4); add('tada_1', T('elevate', 'สบาย'), .35)
# moved
add('reveal_2', T('moved', 'จานสะอาด'), .35); add('bonk_1', T('moved', 'ย้ายไป', 'ย้าย'), .55); add('pop_1', T('moved', 'กลับไป', 'ทุกครั้ง'), .3)
# close
add('drop_1', T('close', 'ล้นมือ'), .4)
for w in (('คนล้างจาน', 'ล้างจาน'), ('ดูแลเตา',), ('ซัพพลายเออร์',), ('ดูแลลูกค้า', 'ลูกค้า'), ('ขยายร้าน',)): add('pop_2', T('close', *w), .3)
add('bonk_2', T('close', 'ยังไงดี', 'จัดการ'), .45); add('drop_2', T('close', 'ตอนหน้า'), .45); add('pop_1', T('close', 'ไอเซนฮาวร์', 'เมทริกซ์'), .35)
add('pop_1', T('close', 'ดูวิธี'), .3); add('tada_2', T('close', 'เข็มทิศ'), .45)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
