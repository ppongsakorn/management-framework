#!/usr/bin/env python3
"""Lay sound effects on the clip's beats (same cues as case.js, read from timeline.json) over the rendered MP4.
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
    raise SystemExit(f'{sid}: none of {alts} heard')
st = lambda sid: S[sid]['start']
fx = []
add = lambda k, t, g: fx.append((k, t, g))
# hook
for t in (0.15, 0.55, 0.95): add('drop_1', t, .2)
fired = T('hook', 'ไล่พ่อครัว', 'ไล่', 'ครัว'); add('bonk_2', fired, .5)
who, wrong, why, stamp = T('hook', 'ใครผิด'), T('hook', 'ผิดคำถาม'), T('hook', 'ทำไม'), T('hook', 'ไฟว์วายส์', 'ไฟวาย', 'whys', 'wise')
add('bonk_1', who, .5)
for a in (('หนึ่ง', '1'), ('สอง', '2'), ('สาม', '3')): add('pop_1', T('hook', *a), .35)
add('bonk_2', wrong, .55); add('reveal_1', max(wrong + .75, why - .45), .3)
gap = min(.3, max(.18, (stamp - why - .25) / 5))
for i in range(5): add('pop_2', why + i * gap, .2)
add('drop_2', stamp, .6)
# board
A = [T('board', 'ครัวทำไม่ทัน', 'ครัวทําไม่ทัน', 'ไม่ทัน'), T('board', 'พ่อครัว'), T('board', 'ของที่เตรียม'), T('board', 'เตรียมแค่'), T('board', 'ไม่มีใคร')]
for i, a in enumerate(A):
    add('drop_2', st('board') + a, .28); add('pop_1', st('board') + a + .3, .3)
add('ding_1', st('board') + A[4] + .5, .4)
# reveal
add('bonk_1', st('reveal') + T('reveal', 'ไม่ใช่คน'), .5)
add('drop_1', st('reveal') + T('reveal', 'ขั้นตอน') - .35, .3)
slot = st('reveal') + T('reveal', 'เช็กยอดจอง', 'เช็คยอดจอง', 'ยอดจอง')
add('reveal_2', slot, .35); add('drop_2', slot + .5, .6)
# fix
add('tada_1', st('fix') + T('fix', 'ปิดคดี'), .45)
add('pop_2', st('fix') + T('fix', 'เช็กยอดจอง', 'เช็คยอดจอง', 'ยอดจอง') + .4, .3)
add('drop_1', st('fix') + T('fix', 'วิ่ง'), .3)
add('bonk_2', st('fix') + T('fix', 'แค่แก้อาการ', 'แค่แก่อาการ', 'อาการ'), .55)
# rules
add('drop_2', st('rules') + .05, .5)
for w in ('หลักฐาน', 'ระบบ', 'อาการ'): add('pop_1', st('rules') + T('rules', w) - .15, .35)
# close
add('drop_2', st('close') + .05, .5); add('pop_1', st('close') + T('close', 'คดีหน้า') - .1, .35); add('tada_2', st('close') + T('close', 'เข็มทิศ'), .45)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
