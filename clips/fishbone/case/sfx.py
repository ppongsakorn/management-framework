#!/usr/bin/env python3
"""Sound effects for the Fishbone clip, placed on the same words as the cues in scenes.js.
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
# hook
add('drop_1', .2, .25); add('bonk_1', T('hook', 'ยังช้า'), .55); add('pop_1', T('hook', 'พนักงาน'), .35); add('pop_2', T('hook', 'เตา'), .35); add('bonk_2', T('hook', 'ไม่จบ'), .5)
# recap: three cards
add('pop_1', T('recap', 'ไล่หา', 'สาเหตุ'), .35); add('pop_1', T('recap', 'ลองแก้', 'แก้'), .35); add('pop_2', T('recap', 'พันกัน', 'หลายข้อ'), .4)
# idea
add('drop_2', T('idea', 'ฟิชโบน', 'fishbone', 'fish'), .55); add('reveal_1', T('idea', 'ก้างปลา') - .1, .3); add('pop_1', T('idea', 'ครบ', 'ทุกด้าน'), .3)
# steps 1-5
add('drop_1', st('head') + .15, .3); add('pop_1', T('head', 'หัวปลา'), .3); add('pop_2', T('head', 'ประโยคเดียว', 'สั้น'), .3); add('ding_1', T('head', 'วัดได้'), .4)
add('drop_1', st('bones') + .15, .3)
for w in (('คน',), ('วิธีทำงาน', 'วิธี'), ('เครื่องมือ',), ('ข้อมูล',), ('สภาพแวดล้อม', 'สภาพ'), ('การวัด', 'วัดผล')): add('pop_1', T('bones', *w), .3)
add('drop_1', st('causes') + .15, .3)
c0, c1 = T('causes', 'ช่วยกันคิด'), T('causes', 'พังตรงไหน', 'ตรงไหน')
for i in range(6): add('pop_2', c0 + .2 + i * (c1 - c0) / 6, .22)
add('pop_1', T('causes', 'ตัดสิน', 'รีบ'), .35)
add('drop_1', st('vote') + .15, .3); add('pop_1', T('vote', 'โหวต'), .3)
v = T('vote', 'สามข้อ')
for k in range(3): add('ding_1', v + k * .35, .4)
add('drop_1', st('check') + .15, .3); add('reveal_1', T('check', 'ข้อมูลจริง', 'ข้อมูล'), .3); add('drop_2', T('check', 'ก่อน'), .5); add('bonk_2', T('check', 'เดา'), .55)
# owner
add('pop_1', T('owner', 'เจ้าของร้าน'), .35); w3 = T('owner', 'สามข้อ')
for k in range(3): add('pop_2', w3 + k * .3, .25)
add('reveal_2', T('owner', 'พีดีซีเอ', 'pdca'), .35); add('ding_2', T('owner', 'ถึงเป้า', 'เป้า'), .4); add('tada_1', T('owner', 'ถึงเป้า', 'เป้า') + .1, .35)
# close
add('drop_2', st('close') + .1, .5); add('pop_1', T('close', 'ดูวิธี'), .3); add('tada_2', T('close', 'เข็มทิศ'), .45); add('drop_1', T('close', 'ตอนหน้า'), .4); add('pop_2', T('close', 'พาเรโต', 'pareto'), .35)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
