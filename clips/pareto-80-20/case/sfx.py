#!/usr/bin/env python3
"""Sound effects for the Pareto 80/20 clip, placed on the same words as the cues in scenes.js.
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
# hook: good news, the eight notes, the owner's head, money / time / people, the question
add('ding_1', T('hook', 'ดีแล้ว', 'กลับมา'), .35); add('pop_1', T('hook', 'ลูกค้า'), .3)
for w in ('เตา', 'วัตถุดิบ', 'ออร์เดอร์'): add('pop_2', T('hook', w), .3)
o = T('hook', 'ออร์เดอร์'); e = T('hook', 'แปดเรื่อง', 'แปด')
for k in range(5): add('pop_1', o + .35 + k * max(.1, (e - o - .5) / 4), .2)
add('bonk_1', e, .5); add('drop_1', T('hook', 'กุมขมับ', 'กุม'), .4)
for w in ('เงิน', 'เวลา', 'คนที่ไหน'): add('pop_2', T('hook', w), .3)
add('bonk_2', T('hook', 'ทั้งหมด'), .5)
# recap
add('drop_1', st('recap') + .1, .3); add('pop_1', T('recap', 'ฟิชโบน', 'fishbone'), .35); add('pop_2', T('recap', 'ไม่ได้แปลว่า', 'แปลว่า'), .3); add('bonk_1', T('recap', 'เรื่องไหน'), .45)
# idea
add('drop_2', T('idea', 'พาเรโต้', 'พาเรโต', 'pareto'), .55); add('pop_1', T('idea', 'แปดสิบ', 'กฎ'), .3); add('reveal_1', T('idea', 'ไม่กี่อย่าง', 'ปัจจัย') - .4, .3); add('ding_1', T('idea', 'ทรัพยากร'), .35)
# 1 collect
add('drop_1', st('collect') + .15, .3)
c0, c1 = T('collect', 'จด'), T('collect', 'กี่นาที')
for k in range(5): add('pop_2', c0 + k * max(.15, (c1 + .4 - c0) / 4), .2)
add('pop_1', T('collect', 'หนึ่งเดือน', 'เดือน'), .3); add('drop_2', T('collect', 'รวมกัน'), .45); add('tada_1', T('collect', 'หนึ่งพัน', 'พัน') + .2, .35)
# 2 sort
add('drop_1', st('sort') + .15, .3)
for w in (('เตรียมวัตถุดิบ', 'วัตถุดิบ'), ('รอใช้เตา', 'เตา'), ('ออร์เดอร์',)): add('pop_1', T('sort', *w), .35)
d = T('sort', 'ห้าเรื่อง', 'ที่เหลือ')
for k in range(5): add('pop_2', d + .1 + k * .18, .18)
# 3 chart
add('drop_1', st('chart') + .15, .3); add('reveal_1', T('chart', 'เปอร์เซ็นต์'), .25)
add('pop_1', T('chart', 'เรื่องแรก'), .35); add('pop_1', T('chart', 'หกสิบสาม', 'เรื่องที่สอง'), .35)
p3 = T('chart', 'แปดสิบเปอร์เซ็นต์พอดี', 'พอดี'); add('drop_2', p3, .55); add('tada_2', p3 + .1, .4)
# twist
add('bonk_1', st('twist') + .1, .5); add('reveal_2', T('twist', 'แค่สามเรื่อง', 'สามเรื่อง'), .35); add('drop_2', T('twist', 'แปดร้อย'), .5)
add('bonk_2', T('twist', 'กระจาย'), .4); add('ding_1', T('twist', 'เริ่มจาก', 'สามเรื่องนี้'), .4); add('tada_1', T('twist', 'ประโยชน์'), .4)
# action
add('pop_1', st('action') + .2, .3); add('pop_2', T('action', 'สาเหตุที่แท้จริง', 'แท้จริง'), .3); add('reveal_2', T('action', 'พีดีซีเอ', 'pdca'), .35)
for w in (('ปรับวิธี', 'เตรียมวัตถุดิบ'), ('จัดลำดับ',), ('ตรวจสอบ', 'ขั้นตอน')): add('pop_1', T('action', *w), .35)
add('ding_2', T('action', 'อีกครั้ง', 'เก็บข้อมูล'), .35)
# caution
add('bonk_1', T('caution', 'จำไว้นะ'), .45); add('pop_1', T('caution', 'เป๊ะ'), .35); add('pop_2', T('caution', 'ไม่สำคัญ', 'ที่เหลือ'), .35); add('drop_2', T('caution', 'ความปลอดภัย', 'ปลอดภัย'), .5); add('bonk_2', T('caution', 'ทันที'), .4)
# close: the four tools, the takeaway, the site
for w in (('ฟิชโบน', 'fishbone'), ('พาเรโต้', 'พาเรโต'), ('ไฟว์วายส์', 'ไฟว์'), ('พีดีซีเอ', 'pdca')): add('pop_1', T('close', *w), .35)
add('drop_2', T('close', 'จำไว้นะ', 'จำไว้'), .5); add('ding_1', T('close', 'ไม่จำเป็น'), .35); add('pop_1', T('close', 'ดูวิธี'), .3); add('tada_2', T('close', 'เข็มทิศ'), .45)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
