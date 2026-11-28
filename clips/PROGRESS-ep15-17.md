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
- [x] EP15: Whisper pick, layout stills, render, finish (WebM 5.3/5.1 MB, 2:04), cover at 100 s, previews in Shared/EP15-17/EP15
- [x] EP15 on dev (PR #91 merged), checked live
- [x] EP16 and EP17: Whisper pick, layout fixes, render, finish (WebM ~5 MB each, 2:17 each), covers (EP16 table at 88 s, EP17 owners table at 104 s), previews in Shared/EP15-17/EP16 and EP17
- [x] EP16 and EP17 on dev: PR #92 merged. Its first deploy failed at type check (empty series.next read as never[]); fixed by typing lib/series.ts (fix/series-empty-next, merged). Second deploy succeeded; live check passed (17 clips on /clips, no overflow).
- [ ] Waiting for ContentWriter's review. Promote dev to main only on the owner's word; the owner should listen to the names and pronunciation first.
- [x] EP15 approved by ContentWriter (relaying the owner's go-ahead) and promoted to prd on 2026-11-28 23:24: PR #94 (release/ep15 pinned at dev commit 742813c, EP15 only, merge commit, no stg). prd checked: both WebM play (124 s, 1920x1080 and 1080x1920), no overflow, /clips and /mobile/clips list 16 clips plus the next card, EP16-17 files absent (404). MRR on prd: v2 0.864, v3 0.907.
- [ ] EP16 and EP17: still waiting for review; later dev to main merge is clean because 742813c is an ancestor of dev.
