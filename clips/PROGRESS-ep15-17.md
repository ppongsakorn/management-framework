# EP15–17 progress (branch feature/clips-ep15-17)

Brief: editorial v1 from ContentWriter (EP15 Ansoff Matrix, EP16 Weighted Decision Matrix, EP17 Pre-mortem). Work on dev only; ContentWriter reviews before anything goes to prd. Environments: dev and prd only (stg dropped).

Canon fixes applied to the editorial text: "หัวหน้าหน้าร้าน" → "หัวหน้าร้าน", "พนักงานจัดซื้อ/คนจัดซื้อ" → "ฝ่ายจัดซื้อ", "เจ้าของ" → "เจ้าของร้าน", "แอนซอฟ" → "แอนซอฟฟ์" (as spoken in EP14's closing card). EP16 scene 2 and 3 got two small fluency fixes. Estimated length (chars ÷ 12.2): EP15 ~2:03, EP16 ~2:08, EP17 ~2:08.

## Status
- [x] trimmed scripts (clips/<slug>/case/trimmed.txt)
- [x] scaffolds (clip.json, index.html, symlinks)
- [x] editorial v2 applied (no specific menu: booking / waiting time / cost / actual pickup); v1 voice for EP15 discarded and regenerated
- [x] EP15–17 narration takes generated (ElevenLabs eleven_v4, voice Mind, 2 takes per scene)
- [x] scenes.js written for EP15, EP16, EP17; sfx.py cues for all three
- [x] render.mjs and publish/*.mjs accept PLAYWRIGHT_MJS (fallback to /opt/node-tools)
- [ ] Whisper take pick (running, CPU), build, layout stills, render, finish, previews
