#!/usr/bin/env python3
"""Sound effects for the PDCA clip, placed on the same words as the cues in scenes.js.
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
# hook: checklist ticked, then the bust
add('drop_1', .2, .25); add('tada_1', T('hook', 'รู้สาเหตุ'), .35)
add('bonk_2', T('hook', 'เจ๊ง', 'เจ๋ง'), .6); add('bonk_1', T('hook', 'บริการ'), .5)
# recap: three cards
add('bonk_1', T('recap', 'ไล่พ่อครัว', 'ไล่'), .45); add('pop_1', T('recap', 'ไฟว์วายส์', 'ไฟวาย', 'whys', 'wise'), .35); add('pop_2', T('recap', 'สาเหตุ', 'ขั้นตอน', 'เช็กยอดจอง'), .35)
# idea: the wheel
add('drop_2', T('idea', 'พีดีซีเอ', 'pdca'), .55); add('reveal_1', T('idea', 'วงล้อ') - .2, .3)
for w in ('วางแผน', 'ลงมือ', 'ตรวจ', 'ปรับ'): add('pop_1', T('idea', w), .3)
# four steps
add('drop_1', st('plan') + .15, .3); add('pop_2', T('plan', 'ตั้งเป้า', 'เป้า'), .3); add('pop_1', T('plan', 'เช็กยอดจอง'), .3); add('pop_2', T('plan', 'วิธีวัด', 'วัด'), .3)
add('drop_1', st('do') + .15, .3); add('pop_1', T('do', 'ลองเล็ก'), .3); add('pop_2', T('do', 'สองวัน', 'วันเสาร์'), .3)
add('drop_1', st('check') + .15, .3); add('pop_1', T('check', 'เทียบ'), .3); add('pop_2', T('check', 'ตัวเลข'), .3); add('ding_1', T('check', 'ดีขึ้น'), .4); add('bonk_2', T('check', 'ไม่ถึงเป้า', 'ถึงเป้า', 'เป้า'), .55)
add('drop_1', st('act') + .15, .3); add('pop_1', T('act', 'ได้ผล'), .3); add('drop_2', T('act', 'มาตรฐาน'), .5); add('pop_2', T('act', 'ไม่ถึงเป้า', 'เป้า'), .3); add('reveal_2', T('act', 'สมมติฐานใหม่', 'สมมติฐาน'), .3)
# owner
add('pop_1', T('owner', 'เจ้าของร้าน'), .35); add('ding_2', T('owner', 'ไม่เจ๊ง'), .4); add('ding_1', T('owner', 'ไม่แย่'), .4)
# twist
add('bonk_1', T('twist', 'แต่แล้ว'), .5); add('bonk_2', T('twist', 'ยังช้า'), .55); add('reveal_1', T('twist', 'ปัญหาจริง'), .3); add('reveal_2', T('twist', 'ฟิชโบน', 'ก้างปลา', 'ฟิช') - .5, .35)
# close
add('drop_2', st('close') + .1, .5); add('pop_1', T('close', 'ดูวิธี'), .3); add('tada_2', T('close', 'เข็มทิศ'), .45); add('drop_1', T('close', 'ตอนหน้า'), .4); add('pop_2', T('close', 'ฟิชโบน', 'ฟิช'), .35)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
