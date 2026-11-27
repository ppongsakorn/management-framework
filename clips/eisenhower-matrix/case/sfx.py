#!/usr/bin/env python3
"""Sound effects for the eisenhower-matrix clip, placed on the same words as the cues in scenes.js.
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
# hook: running, the wall of notes, everything urgent
add('ding_1', st('hook') + .2, .3); add('pop_1', T('hook', 'วิ่งทั้งวัน', 'วิ่ง'), .3)
w = T('hook', 'โน้ตงาน', 'กำแพง')
for k in range(12): add('pop_2', w - .3 + k * .12, .15)
add('bonk_1', T('hook', 'ด่วนไปหมด', 'ด่วน'), .55)
# recap
add('pop_1', T('recap', 'ทีโอซี', 'toc'), .3); add('pop_2', T('recap', 'ย้ายไป', 'ล้างจาน'), .3); add('pop_1', T('recap', 'โตขึ้น', 'เพิ่มขึ้น'), .3)
# idea
add('drop_2', T('idea', 'ไอเซนฮาวร์', 'เมทริกซ์'), .55); add('pop_1', T('idea', 'สำคัญไหม', 'สำคัญ'), .3); add('pop_1', T('idea', 'ด่วนไหม', 'ด่วน'), .3)
for x in ('ทำเอง', 'วางแผน', 'มอบหมาย', 'ตัดทิ้ง'): add('pop_2', T('idea', x), .3)
# 1 list
add('drop_1', st('list') + .15, .3); l0, l1 = T('list', 'ทุกงาน'), T('list', 'สิบสองงาน', 'สิบสอง')
for k in range(12): add('pop_2', l0 - .2 + k * max(.07, (l1 - .1 - l0) / 11), .14)
add('drop_2', l1, .45)
# 2 ask
add('drop_1', st('ask') + .15, .3); add('pop_1', T('ask', 'สำคัญไหม', 'สำคัญ'), .35); add('pop_1', T('ask', 'ด่วนไหม', 'ด่วน'), .35)
# 3 sort: the four named jobs land
add('drop_1', st('sort') + .15, .3)
for x in (('ทำเองวันนี้', 'ทำเอง'), ('จองเวลา',), ('มอบหมาย', 'แคชเชียร์'), ('ตัดทิ้ง',)): add('ding_1', T('sort', *x), .3)
# 4 check: the red week
add('drop_1', st('twist') + .15, .3); add('reveal_1', T('twist', 'สำคัญแต่ไม่ด่วน', 'ไม่ด่วน'), .3); add('bonk_1', T('twist', 'สักชั่วโมง', 'ไม่มีเวลา'), .5); add('bonk_2', T('twist', 'ดับไฟ'), .45)
# 5 weekly
add('drop_1', st('weekly') + .15, .3); add('drop_2', T('weekly', 'สิบนาที'), .45); add('reveal_2', T('weekly', 'งานสำคัญก่อน', 'สำคัญก่อน'), .35); add('pop_1', T('weekly', 'มอบหมาย'), .3)
# result
add('pop_1', T('result', 'สองสัปดาห์'), .3)
for x in (('คนล้างจาน', 'ล้างจาน'), ('ไม่ขาด', 'จานสะอาด'), ('วางแผนขยาย', 'ขยายร้าน')): add('ding_2', T('result', *x), .35)
add('tada_1', T('result', 'วางแผนขยาย', 'ขยายร้าน') + .3, .35)
# close
add('pop_1', T('close', 'วิ่งดับไฟ', 'ดับไฟ'), .3); add('drop_2', T('close', 'ผู้บริหาร'), .5); add('ding_1', T('close', 'ควรทำเอง'), .35)
add('pop_1', T('close', 'ดูวิธี'), .3); add('tada_2', T('close', 'เข็มทิศ'), .45)
args, filt, labs = ['ffmpeg', '-loglevel', 'error', '-y', '-i', src], [], ['[0:a]']
for i, (k, t, g) in enumerate(fx, 1):
    args += ['-i', f'{SND}/{k}.mp3']; ms = max(0, int(t * 1000))
    filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g},adelay={ms}|{ms}[e{i}]'); labs.append(f'[e{i}]')
filt.append(f'{"".join(labs)}amix=inputs={len(labs)}:normalize=0,atrim=0:{tl["duration"]},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(args + ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], check=True)
print(out, len(fx), 'effects')
