# timeline.json + audio.m4a for one size folder, from clip.json and voice/s<N>.flac + voice/words.json
# scene i: start = previous end; voice.at = start + lead; end = voice.at + dur + tail (frame-aligned). words are absolute seconds.
import json, subprocess, sys, os
d=sys.argv[1]; c=json.load(open(f'{d}/clip.json')); W=json.load(open(f'{d}/voice/words.json')); fps=c.get('fps',30)
fr=lambda x: round(x*fps)/fps
dur=lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
t=0; sc=[]
for i,s in enumerate(c['scenes'],1):
    vd=dur(f'{d}/voice/s{i}.flac'); at=fr(t+s.get('lead',c.get('lead',.3))); end=fr(at+vd+s.get('tail',c.get('tail',.5)))
    sc.append({'id':s['id'],'index':i,'say':s['say'],'start':round(t,3),'end':end,'voice':{'file':f'voice/s{i}.flac','at':at,'dur':round(vd,3)},
               'words':[{'w':w['w'],'s':round(at+w['s'],3),'e':round(at+w['e'],3)} for w in W[str(i)]['words']]})
    t=end
tl={k:c[k] for k in ('title','slug','lang','width','height','fps','captions','xfade','cue_lead') if k in c}; tl['duration']=round(t,3); tl['scenes']=sc
json.dump(tl,open(f'{d}/timeline.json','w'),ensure_ascii=False,indent=1)
args=['ffmpeg','-v','error','-y']; f=[]
for i,s in enumerate(sc): args+=['-i',f"{d}/{s['voice']['file']}"]; ms=int(s['voice']['at']*1000); f.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{i}]')
n=len(sc); m=c['music']; args+=['-stream_loop','-1','-i',f"{d}/{m['file']}"]
f.append(''.join(f'[v{i}]' for i in range(n))+f'amix=inputs={n}:normalize=0,apad,atrim=0:{t},asplit=2[vo][sc]')
f.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{t},volume={m.get('gain_db',-14)}dB,afade=t=out:st={max(0,t-2)}:d=2[mu]")
f.append('[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md]' if m.get('duck') else '[mu]anull[md]')
f.append('[vo][md]amix=inputs=2:normalize=0[a]')
subprocess.run(args+['-filter_complex',';'.join(f),'-map','[a]','-c:a','aac','-b:a','192k',f'{d}/audio.m4a'],check=True)
print(d,'duration',round(t,2),'s')
