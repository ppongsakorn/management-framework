import json, os, sys, urllib.request
clip=json.load(open('desktop/clip.json')); v=clip['voice']
for arg in sys.argv[1:]:
    i,take=arg.split(':'); s=clip['scenes'][int(i)-1]
    out=f'voice/raw/s{i}_{take}.mp3'
    body=json.dumps({'text':s['say'],'model_id':v['model_id']}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}?output_format=mp3_44100_192",data=body,headers={'xi-api-key':os.environ['ELEVENLABS_API_KEY'],'Content-Type':'application/json','Accept':'audio/mpeg'})
    try:
        with urllib.request.urlopen(req,timeout=300) as r: open(out,'wb').write(r.read()); print('ok',out,r.headers.get('x-character-count') or r.headers.get('character-cost'),flush=True)
    except urllib.error.HTTPError as e: print('ERR',out,e.code,e.read()[:300],flush=True)
