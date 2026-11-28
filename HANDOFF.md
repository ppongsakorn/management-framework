# Handoff: เข็มทิศกรอบความคิด · ซีรีส์คลิปร้านอาหาร

เอกสารส่งต่องานให้ OpenBot ทำต่อ เขียนเมื่อ 2026-11-28 หลังจบตอน 14 อ่านไฟล์นี้ก่อน แล้วค่อยอ่าน `CLAUDE.md`, `docs/videos/production.md` และ `docs/videos/series.md`

> **English summary.** Public Thai site of management frameworks (Next.js static export on GitHub Pages; `main` = prd, `dev`; stg is no longer used). A continuing restaurant clip series, one episode per framework, in 16:9 and 9:16, with each framework page's example rewritten to tell the clip's story. Episodes 1–12 are live. Episodes 1–14 are live (13 SWOT and 14 Porter's Five Forces published together). Next episode: 15, Ansoff Matrix. Reply to the owner in Thai. Never publish before the owner OKs a clip; always verify on the live site with real numbers.

## 1. สถานะตอนนี้

| | สถานะ |
| --- | --- |
| เว็บ prd | https://ppongsakorn.github.io/management-framework/ คลิปตอน 1–12 ขึ้นแล้ว, หน้า `/clips` (ซีรีส์เรียงตอน), ปุ่มตอนถัดไปในวิดีโอ, ภาพปกแบบ best shot |
| สภาพแวดล้อม | เหลือ 2 ชั้น: `dev` (`/dev/`) และ `main` (prd) ตามที่เจ้าของตัดสินใจ 2026-11-28 ไม่ใช้ stg แล้ว |
| ตอน 13 SWOT | ขึ้น prd แล้ว 3:43 (PR #84, #86) |
| ตอน 14 Porter's 5 Forces | ขึ้น prd แล้ว 3:03 (PR #84, #86) |
| ตอน 15 | Ansoff Matrix (ตอน 14 ทิ้งท้ายไว้แล้ว) เจ้าของยังไม่ส่งบท |
| คะแนนค้นหาล่าสุดบน prd | MRR v2 0.867, v3 0.910 (100 queries) |

## 2. เจ้าของและวิธีทำงานที่เจ้าของต้องการ

- เจ้าของเป็น Data & AI Team Lead **ตอบเป็นภาษาไทย** ใช้คำศัพท์อังกฤษได้
- เจ้าของส่งบทเต็มแยกฉาก พร้อมความยาวเป้า แนวเสียงพากย์ และ Key Takeaway บนจอ
- **เจ้าของต้องฟังคลิปก่อนขึ้นเว็บทุกตอน** โดยฟังชื่ออังกฤษ ชื่อเว็บ "เข็มทิศกรอบความคิด" และตัวเลข เพราะ Whisper จับพยัญชนะควบที่หายไม่ได้
- ส่งไฟล์ตัวอย่างเป็น **MP4** ด้วย เพราะไฟล์ WebM เปิดบนบางแอปหรือบน iPhone แล้วอาจไม่มีเสียง เจ้าของเคยถามว่า "ใส่เสียงรึยัง"
- ขึ้นเว็บเมื่อเจ้าของตอบ "OK" หรือ "deploy ได้" เท่านั้น
- หลัง deploy เจ้าของอยากเห็นผลตรวจบนเว็บจริงพร้อมตัวเลข เช่น ขนาดภาพ ความยาว ภาพหน้าจอ และ MRR และให้บอกตรง ๆ ว่าอะไรยังไม่ได้ตรวจ
- repo เป็น public:
  - ห้ามวาง token หรือ key ในแชตหรือใน repo
  - ชื่อ branch และไฟล์ห้ามอ้างชื่อคนหรือชื่อหนังสือ
  - เนื้อหาต้องเรียบเรียงใหม่เอง ไม่คัดลอก
- **ห้ามสร้าง claude.ai Artifact สำหรับคลิป** แม้แต่ preview
- ทุกการเปลี่ยนเนื้อหาหรือฟีเจอร์ต้องเพิ่มรายการบนสุดของ `data/changelog.json`
- กติกาครบอยู่ใน `CLAUDE.md` ที่ root

## 3. งานที่ต้องทำต่อทันที

### 3.1 ขั้นตอนขึ้นเว็บหนึ่งตอน (ตอน 13–14 ทำตามนี้แล้ว ใช้เป็นแบบสำหรับตอนต่อไป)

ไฟล์พร้อมใช้อยู่บน branch `feature/clips-ep7-9`:

| ตอน | ไฟล์คลิป (ตั้งชื่อแบบ `public/videos/` แล้ว) | ร่างเนื้อหาเว็บ |
| --- | --- | --- |
| 13 | `clips/swot/case/release/swot{,-mobile}.{webm,webp}` | `clips/swot/case/web.json` |
| 14 | `clips/porters-5-forces/case/release/porters-5-forces{,-mobile}.{webm,webp}` | `clips/porters-5-forces/case/web.json` |

ขั้นตอน ทำซ้ำทีละตอน (รายละเอียดอยู่ใน `docs/videos/production.md` ข้อ 7–8):

1. แตก branch `feature/clip-ep13` ออกจาก `dev`
2. ใส่ตัวอย่างและแผนภาพ: `node clips/_shared/no-skill/publish/apply-examples.js clips/swot/case/web.json`
   - สคริปต์และ `web.json` อยู่บน branch `feature/clips-ep7-9` ให้ checkout ไฟล์มาก่อน หรือเปิด worktree แยก
   - สั่งรันที่ root ของเว็บ
3. ตรวจด้วย `npm test` (ต้องผ่าน 17/17) และ `npm run data` แล้วเปิดดูแผนภาพด้วยตา
4. commit เนื้อหา แล้วสั่ง `npm run video:brief -- swot` เพื่อเอา `briefHash`
5. คัดลอกไฟล์ใน `release/` ไปไว้ที่ `public/videos/` แล้วลงทะเบียนทีละขนาด **commit แยกขนาดละ 1 commit** และใช้ `git add -f` เพราะ `.git/info/exclude` ignore โฟลเดอร์ videos ไว้

   ```bash
   npm run video:add -- swot --size desktop --file videos/swot.webm --poster videos/swot.webp --duration 3:43 --tool "Claude Motion + ElevenLabs" --title "SWOT: ร้านแรกขายดี เปิดร้านที่สองแล้วจะรวยขึ้นจริงเหรอ?" --date <วันที่> --hash <briefHash>
   ```

   - ตอน 14 ใช้ `--duration 3:03` และ title "Porter's 5 Forces: ยังไม่ทันเปิดร้าน ทำไมเหมือนโดนล้อมไว้หมดแล้ว?"
6. `data/series.json`:
   - เพิ่ม `swot` แล้ว `porters-5-forces` ต่อท้าย `episodes`
   - ตั้ง `next` เป็น `ansoff-matrix` พร้อม teaser "โตได้หลายทาง ไม่ต้องเปิดสาขาก่อน"
7. `docs/videos/series.md`: เพิ่มแถวของตอน 13–14 ใน storyline, พัฒนาการของเจ้าของร้าน และ canon ใหม่ ดูเนื้อหาจาก `web.json` และ `trimmed.txt`
8. `data/changelog.json` และตาราง "ตอนที่ทำแล้ว" ใน `docs/videos/production.md`
9. PR เข้า `dev` แล้ว merge ด้วย **merge commit** ตรวจ `/dev/` ผ่านแล้ว เปิด PR `dev → main` เอง (merge commit) แล้วตรวจ prd ไม่ใช้ stg แล้ว ห้ามใช้ rebase หรือ squash เพราะ branch จะไม่ตรงกัน
10. ตรวจทุกชั้นด้วยสคริปต์ใน `clips/_shared/no-skill/publish/`:
    - `verify-live.mjs <''|dev/> <dir> swot="ข้อความในการ์ด"`
    - `clips-page-check.mjs <base url> <dir>`
    - ทดสอบปุ่มตอนถัดไป เช่น จบ OKR แล้วต้องไป SWOT และเล่นเอง

### 3.2 ตอน 15 Ansoff Matrix

รอเจ้าของส่งบท ทำตาม `docs/videos/production.md` ข้อ 1–6 ตัวอย่างบนหน้า Ansoff ปัจจุบันยังเป็นเรื่องทีมข้อมูล ต้องเปลี่ยนเป็นเรื่องร้านตอนขึ้นคลิป

## 4. งานค้างอื่น

- **ความต่อเนื่องในคลิปเก่า** (ดู `series.md` ส่วน "จุดที่ยังไม่ต่อเนื่อง"):
  - ภาพ PDCA ยังเขียน "4 เสาร์"
  - ตัวอย่างบนหน้า Pareto ควรบอกว่าเตาครบ 3 หัวแล้ว
  - คลิป Pareto ยังไม่มีการ์ดตอนหน้า
- **คำอ่าน SWOT ไม่ตรงกัน:** ฉากปิดตอน 12 อ่าน "สว็อต อนาลิซิส" ส่วนตอน 13 อ่าน "สวอต อะนาลิซิส" ตามบทของเจ้าของ อัดเฉพาะฉากปิดตอน 12 ใหม่ได้ถ้าเจ้าของต้องการ
- **เปลี่ยนตัวอย่างเป็นร้านอาหาร:** ยังไม่ได้ทำกับ framework ที่ไม่มีคลิป เจ้าของสั่งให้ทำทีละกลุ่ม 1 PR ต่อกลุ่ม แต่ให้ถามเจ้าของก่อนเริ่มแต่ละกลุ่ม

  | กลุ่ม | มีการ์ดร้านอาหารแล้ว |
  | --- | --- |
  | diag | 10/10 |
  | dec | 2/12 |
  | plan | 2/10 |
  | exec | 3/9 |
  | ppl | 3/11 |
  | think | 0/9 |

- **MP4 สำหรับโซเชียล:** `out/<slug>-final.mp4` ยังไม่ได้ส่งให้เจ้าของตั้งแต่ตอน 5 ไฟล์อยู่ในเครื่องที่เรนเดอร์ ไม่ได้อยู่ใน git
- **Next.js มีช่องโหว่:** `next build` จะเตือน และบางครั้ง exit 1 แม้หน้าเว็บ build ครบ ควรอัปเดตเป็นงานแยก แล้วรันเทสต์และตรวจทุกหน้า
- **branch `stg`:** workflow ไม่ใช้แล้ว (`pages.yml` build แค่ main และ dev, Promote มีแค่ dev → main) เหลือแค่ตัว branch ใน git ถ้าจะลบ ต้องถามเจ้าของก่อน
- **workflow Promote:** สร้าง PR เองไม่ได้ เจ้าของต้องเปิดสิทธิ์ "Actions allowed to create PRs"

## 5. ที่เก็บของ

| อะไร | ที่ไหน |
| --- | --- |
| เว็บ | repo `ppongsakorn/management-framework` branch `main` (prd) และ `dev` (branch `stg` ยังอยู่แต่ไม่ใช้แล้ว) |
| ซอร์สคลิปตอน 7–14, ร่าง `web.json`, ไฟล์ release ของตอน 13–14, เครื่องมือ no-skill | branch `feature/clips-ep7-9` ใต้ `clips/` (ไม่ merge เข้าเว็บ) |
| ซอร์สตอน 4 และ 5–6 | `feature/pareto-clip`, `feature/clips-ep5-6` |
| ขั้นตอนผลิตทีละขั้น | `docs/videos/production.md` |
| เส้นเรื่อง ตัวละคร ตัวเลขกลาง | `docs/videos/series.md` |
| กติกาและสัญญาของคลิป | `docs/videos/README.md` |
| ทะเบียนคลิป / ลำดับตอน | `data/videos.json` / `data/series.json` |
| ข้อมูล framework | `data/frameworks.json` (ห้าม hard-code จำนวน 61) |

## 6. เครื่องมือที่ต้องมีในเครื่องที่ทำคลิป

- **Node 20+** และ Playwright กับ Chromium สำหรับเรนเดอร์ทีละเฟรมและตรวจเว็บ
- **ffmpeg และ ffprobe** ที่มี libvpx-vp9, libopus และ libx264
- **Python 3:** `numpy` และ `Pillow` สำหรับ `cover.py` และ `stills.sh` ส่วนการเลือก take ใช้ venv ที่มี `faster-whisper` ใช้ model `large-v3` ซึ่งรันบน CPU ได้แต่ช้า
- **ElevenLabs:**
  - key อยู่ใน env `ELEVENLABS_API_KEY` ห้ามพิมพ์ค่าออกมาหรือ commit
  - โมเดล `eleven_v4` เสียง Mind (`gbZNaSxK771GgOTJIKRB`) ตามที่ตั้งไว้ใน `clip.json`
  - หนึ่งตอนใช้เครดิตราว 4,500–6,000 ตัวอักษร (2 take ต่อฉาก) ถ้าโควตาเต็ม ให้บอกเจ้าของไปขยายเอง
- **ฟอนต์:** IBM Plex Sans Thai อยู่ใน `clips/_shared/fonts`
- **งานหนัก:** ห้ามรัน `pick.py` กับการเรนเดอร์พร้อมกัน เพราะใช้ CPU หนักทั้งคู่ และงานเบื้องหลังหนึ่งงานควรจบใน 2 ชั่วโมง

## 7. บทเรียนที่ต้องรู้

- **ย่อบท:**
  - นับตัวอักษรทั้งบทแล้วหารด้วย 12.2 จะได้จำนวนวินาที
  - เก็บครบทุกฉาก ประโยคเชื่อมตอน และ Key Takeaway
  - เขียนชื่ออังกฤษเป็นคำอ่านไทย (ดูตารางใน production.md)
- **ภาษาไทยไม่มีช่องว่างระหว่างคำ:** ข้อความยาวบนจอจะตัดกลางคำ ให้ใส่ `<br>` เอง
- **ขอบปลอดภัยฉบับแนวตั้ง:** เว้นบน 250, ล่าง 420, ขวา 120 px ตรวจด้วย `stills.sh` ก่อนเรนเดอร์จริงทุกครั้ง
- **`index.html` ของคลิป:** ต้องมี `data-scene` ครบตรงกับ `clip.json`
- **ภาพปก:** ใช้ `cover.py` แบบ best shot และห้ามใช้ฉากที่เฉลยตอนจบ ถ้าภาพที่ได้ไม่เหมาะ ให้ใช้ `--at` กำหนดวินาทีเอง
- **ทดสอบวิดีโอในเครื่อง:** `python3 -m http.server` ไม่รองรับ Range request จึงเลื่อนเวลาวิดีโอไม่ได้ ใช้เซิร์ฟเวอร์ที่รองรับ Range แทน
- **คำสั่ง `rm -rf`:** ตัวแปรต้องเขียนแบบ `"${C:?}/…"` เพื่อกันลบผิดที่
- **ตัวรอ deploy:** ต้องเช็กเนื้อหาที่ใหม่จริง ไม่ใช่สิ่งที่มีอยู่แล้ว เคยพลาดเพราะคลาส `vid-` มีอยู่ก่อนแล้ว
- **รายการปัญหาที่เคยเจอทั้งหมด:** อยู่ใน production.md ข้อ 9

## 8. ตอนที่ทำแล้ว

| ตอน | framework | ความยาว | PR บนเว็บ |
| --- | --- | --- | --- |
| 1 | 5 Whys | 0:58 | ทำด้วย skill |
| 2 | PDCA | 1:08 | #41, #45 |
| 3 | Fishbone | 1:12 | #48 |
| 4 | Pareto 80/20 | 3:11 | #52, #53 |
| 5 | Theory of Constraints | 2:05 | #58 |
| 6 | Eisenhower Matrix | 2:02 | #58, #61 |
| 7 | Delegation Levels | 2:59 | #61, #62 |
| 8 | RACI | 2:50 | #61 |
| 9 | Skill / Will Matrix | 3:16 | #61 |
| 10 | Situational Leadership | 3:14 | #65 |
| 11 | Kanban | 3:07 | #70 |
| 12 | OKR | 3:53 | #75 |
| 13 | SWOT | 3:43 | #84 |
| 14 | Porter's 5 Forces | 3:03 | #84 |

ฟีเจอร์ที่เกี่ยวกับคลิป:

| ฟีเจอร์ | PR |
| --- | --- |
| หน้า `/clips` และแท็บ "คลิป" ในแอปมือถือ | #66 |
| ภาพปก best shot | #73 |
| ปุ่มตอนถัดไปในวิดีโอ | #74 |
| บันทึกการผลิต | #69, #78 |
