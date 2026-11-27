# score each take with Whisper (CER vs the script), keep the best as voice/sN.flac, write voice/words.json
import json, os, re, subprocess, sys, numpy as np
from faster_whisper import WhisperModel
os.chdir(sys.argv[1]); clip=json.load(open('desktop/clip.json'))
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
norm=lambda s: re.sub(r'[^฀-๿a-z0-9]','',re.sub(r'\[[^\]]*\]','',s).lower())
def cer(a,b):
    a,b=norm(a),norm(b); d=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        p,d[0]=d[0],i
        for j,cb in enumerate(b,1): p,d[j]=d[j],min(d[j]+1,d[j-1]+1,p+(ca!=cb))
    return d[len(b)]/max(1,len(a))
def load(f):
    raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.int16).astype(np.float32)/32768
out={}; rep=[]
for i,s in enumerate(clip['scenes'],1):
    best=None
    for tk in 'abcdef':
        f=f'voice/raw/s{i}_{tk}.mp3'
        if not os.path.exists(f): continue
        segs,_=m.transcribe(load(f),language='th',beam_size=5,word_timestamps=True,initial_prompt='พาเรโต้ ฟิชโบน ไฟว์วายส์ พีดีซีเอ เข็มทิศกรอบความคิด')
        segs=list(segs); txt=''.join(x.text for x in segs); words=[{'w':w.word.strip(),'s':round(w.start,2),'e':round(w.end,2)} for x in segs for w in x.words if w.word.strip()]
        c=cer(s['say'],txt); rep.append((i,tk,round(c,3),round(float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f])),2),txt))
        if best is None or c<best[0]: best=(c,f,words,txt)
    c,f,words,txt=best
    subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-ar','44100','-ac','1',f'voice/s{i}.flac'],check=True)
    out[str(i)]={'text':s['say'],'cer':round(c,3),'take':os.path.basename(f),'heard':txt,'words':words}
json.dump(out,open('voice/words.json','w'),ensure_ascii=False,indent=1)
for r in rep: print(*r[:4], r[4][:90])
