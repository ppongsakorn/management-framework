# บันทึกการผลิตคลิป ซีรีส์ร้านอาหาร

บันทึกนี้เล่าว่าคลิปตอน 1–11 ทำจริงอย่างไร ตั้งแต่รับบทจากเจ้าของจนขึ้นเว็บ prd ใช้คู่กับ [README.md](README.md) (กติกาและสัญญาของคลิป) และ [series.md](series.md) (เส้นเรื่อง ตัวละคร ข้อเท็จจริงกลาง)

ตั้งแต่ตอน 4 คลิปทำในเครื่องที่**ไม่มี** skill `claude-motion-clip` จึงใช้ชุดเครื่องมือแทนใน `clips/_shared/no-skill/` ตัว runtime ของฉาก (`clips/_shared/runtime.js`) และ `finish.sh` เป็นตัวเดียวกับคลิปที่ทำด้วย skill

## ภาพรวม

```text
บทจากเจ้าของ ─► ย่อให้ได้ ~3 นาที ─► clip.json (2 ขนาด บทเดียวกัน)
      │
      ├─► tts.py: ElevenLabs ฉากละ 2 take ─► pick.py: Whisper เลือก take (CER) + เวลาของคำ
      │
      ├─► scenes.js: ฉาก HTML/CSS คำนวณจากเวลา t ผูกการ์ดกับคำที่พูด
      │
      ├─► build.py ─► stills.sh: ภาพนิ่งท้ายทุกฉาก ตรวจทับ/ล้น/ขอบปลอดภัย ─► แก้ จนผ่าน
      │
      ├─► render.mjs (ทุกเฟรม) ─► finish.sh: เสียงประกอบ (sfx.py) · WebM · MP4 · ภาพปก
      │
      ├─► ส่งให้เจ้าของฟังชื่อ ─► เจ้าของ OK
      │
      └─► เว็บ: exampleSteps + แผนภาพ ─► video:add ─► series.json · series.md · changelog
                 ─► PR เข้า dev ─► ตรวจ ─► dev → stg ─► ตรวจ ─► stg → main ─► ตรวจ prd
```

## ที่เก็บของ

| อะไร | อยู่ที่ไหน |
| --- | --- |
| ซอร์สคลิป (บท ฉาก เสียงที่เลือก timeline) | branch ที่ไม่ merge เข้าเว็บ: `feature/pareto-clip` (ตอน 4 + เครื่องมือ no-skill), `feature/clips-ep5-6` (ตอน 5–6), `feature/clips-ep7-9` (ตอน 6 ฉบับมีการ์ดตอนหน้า, 7–11 และเครื่องมือล่าสุด) ใต้ `clips/<slug>/case/` |
| take เสียงดิบ, ไฟล์ `out/` | ไม่เข้า git (`clips/.gitignore`) อยู่ในเครื่องที่ทำเท่านั้น |
| คลิปบนเว็บ | `public/videos/<slug>.webm`, `<slug>-mobile.webm`, `.webp` (เพิ่มด้วย `git add -f`) |
| ทะเบียนคลิป | `data/videos.json` (ผ่าน `npm run video:add`) |
| ลำดับตอน | `data/series.json` (หน้า `/clips` และ `/mobile/clips`) |
| เส้นเรื่อง | `docs/videos/series.md` |
| ไฟล์ตัวอย่างให้เจ้าของฟัง | `.cache/video-briefs/preview-ep*/` (ไม่เข้า git) |

## 1. รับบทและย่อ

เจ้าของส่งบทเต็มแยกฉาก พร้อมความยาวเป้าหมายและแนวเสียงพากย์ บทเต็มมักยาว 4–5 นาที ส่วนเป้าคือราว 3 นาที

กติกาการย่อ (เจ้าของตัดสิน 2026-11-28):

- เก็บ**ครบทุกฉาก** และครบทุกขั้นของ framework (เช่น 7 ระดับของ Delegation, S1–S4 ของ Situational)
- ประโยคเชื่อมจากตอนก่อน และประโยคส่งต่อไปตอนหน้า ใช้ตามต้นฉบับ
- ฉากปิดใช้ข้อความของเจ้าของเกือบทั้งหมด ย่อได้เฉพาะส่วนที่ภาพเล่าแทนได้
- Key Takeaway ขึ้นจอตามที่เจ้าของเขียน ห้ามแก้คำ
- ชื่อตัวละครต้องตรงกับ canon ใน series.md เช่นใช้ "หัวหน้าร้าน" ไม่ใช่ "หัวหน้าหน้าร้าน"

**ประมาณความยาว:** นับตัวอักษรทั้งบท รวมแท็กและช่องว่าง แล้วหารด้วย **12.2 ตัว/วินาที** ตัวเลขนี้รวมช่องเงียบหัวท้ายฉากแล้ว (ตอน 10: 2,366 ตัว ได้ 194 วินาที) ถ้าอยากได้ 3:00 ให้บทยาวราว 2,200–2,300 ตัว นับด้วย `len()` ของ Python เพราะ `awk length` นับเป็นไบต์

**ชื่ออังกฤษในเสียงพากย์** ต้องเขียนเป็นคำอ่านไทย:

| คำ | ในบท |
| --- | --- |
| Skill / Will Matrix | สกิล วิล เมทริกซ์ |
| Situational Leadership | ซิชวลเอชันนัล ลีดเดอร์ชิป |
| Directing / Coaching / Supporting / Delegating | ไดเร็กติง / โค้ชชิง / ซัพพอร์ตติง / เดลิเกตติง |
| Delegation Levels | เดลิเกชัน เลเวลส์ |
| Tell … Delegate | เทล เซล คอนซัลต์ อะกรี แอดไวซ์ อินไควร์ เดลิเกต |
| RACI | ราซี / อาร์ เอ ซี ไอ |
| Kanban | คัมบัง |
| To Do / Doing / Review / Done | ทูดู / ดูอิ้ง / รีวิว / ดัน |
| WIP Limit · Pull System · Blocked | วิป ลิมิต · พูล ซิสเต็ม · บล็อกต์ |
| Eisenhower · Pareto · PDCA · OKR | ไอเซนฮาวร์ · พาเรโต้ · พีดีซีเอ · โอเคอาร์ |
| ชื่อเว็บ | เข็มทิศ… กรอบ… ความคิด… (เว้นจังหวะ ไม่ให้ "กรอบ" หาย) |

แท็กอารมณ์ที่ใช้: `[excited]` `[warm]` `[confident]` `[curious]` `[surprised]` `[laughs]` `[sighs]`

## 2. ตั้งโฟลเดอร์คลิป

คัดลอกจากตอนก่อนหน้า: `cf.js`, `index.html`, `sfx.py` และลิงก์ `music` ไปที่ `../../5-whys/case/music`

ใน `desktop/` และ `mobile/` ทำ symlink ไปที่ `cf.js index.html music scenes.js voice` และ `fonts` กับ `runtime.js` ใน `_shared`

`clip.json` ทั้ง 2 ขนาดมีฉากชุดเดียวกัน ต่างกันแค่ `width`/`height` และ `slug` (ฉบับมือถือลงท้าย `-mobile`) ใน `index.html` ต้องมี `<section class="scene" data-scene="<id>">` ครบทุกฉากตรงกับ `clip.json` ถ้าไม่ตรง render จะขึ้น `unknown data-scene`

## 3. เสียงพากย์

```bash
cd clips/<slug>/case
python3 ../../_shared/no-skill/tts.py 1:a 1:b 2:a 2:b …          # ต้องมี ELEVENLABS_API_KEY
<venv>/bin/python ../../_shared/no-skill/pick.py "$PWD"           # faster-whisper large-v3, CPU
```

- ใช้ `eleven_v4` เสียง Mind (`gbZNaSxK771GgOTJIKRB`) ฉากละ 2 take ตอนหนึ่งใช้เครดิตราว 2 × ความยาวบท (ตอนละ ~4,500–5,500 ตัว) โควตาของ key ต้องพอ เคยติด 5,000 แล้วเจ้าของขยายเป็น 50,000
- `pick.py` เลือก take ที่ CER ต่ำสุด เขียน `voice/s<N>.flac` และ `voice/words.json`
- CER สูง (0.15–0.3) มักมาจากชื่ออังกฤษที่ Whisper ถอดเป็นตัวอักษร ไม่ได้แปลว่าเสียงหาย แต่ Whisper จับพยัญชนะควบที่หายไม่ได้ ชื่อเว็บกับชื่อ framework จึงต้องให้**เจ้าของฟังเอง**ทุกตอน
- ถ้าการเชื่อมต่อหลุดกลางทาง (เกิดตอน 11 ฉาก 12) ให้ดูว่า take ไหนหาย แล้วอัดใหม่เฉพาะฉากนั้นก่อนรัน `pick.py`

## 4. ฉาก (`scenes.js`)

- 1 โมดูลต่อ 1 ฉาก มี `init(host, api)` สร้าง DOM และ `render(t)` วาดจากเวลาท้องถิ่นของฉากเท่านั้น
- ตัวช่วยจาก `cf.js`: `CF.pop` (เด้งเข้า/ออก), `CF.slam` (กระแทก), `CF.tape` (ป้าย "ตัวอย่างสมมติ"), `CF.body`/`CF.chef`/`CF.waiter`, `CF.shake`
- **เวลาของภาพผูกกับคำที่พูด** ผ่านตัวช่วย `HEARD` ที่ทุกตอนใช้ ตัวช่วยนี้หาคำในสิ่งที่ Whisper ได้ยินก่อน ถ้าไม่เจอค่อยหาในบท ถ้าไม่เจอทั้งคู่จะคืน 0.5 วินาที ไม่ทำให้ render ล้ม (`CF.heard` แบบเก่าล้มเมื่อคำไม่อยู่ในบท)

  ```js
  const HEARD = (api, id) => { const sc = api.scene(id), nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, ''), heard = sc.concat || '', say = nm(sc.say || '');
    return (...alts) => { const a = alts.find((w) => heard.includes(nm(w))) || alts.find((w) => say.includes(nm(w))); return a ? api.T('w:' + a, id) : 0.5; }; };
  ```

- ให้คำ cue หลายตัวเลือก เช่น `T('สิบปี', 'พี่ครับ')` เผื่อ Whisper ถอดคำแรกไม่ตรง
- **ฉบับแนวตั้ง (1080×1920):** เว้นข้อความห่างขอบบน 250 ขอบล่าง 420 ขอบขวา 120 px ตำแหน่งล่างสุดที่ใช้ได้จริงคือราว y = 1420–1490
- **ภาษาไทยไม่มีช่องว่างระหว่างคำ:** ข้อความยาวที่ตัดบรรทัดเองจะตัดกลางคำ (เคยเกิดกับ "แต่ละ|คน") ให้ใส่ `<br>` เองตรงจุดที่ควรตัด
- **ทุกตอนจบด้วย:** การ์ด "ตอนหน้า" + "ดูวิธีเต็ม ๆ ได้ที่เว็บ" + กล่องชื่อ "เข็มทิศกรอบความคิด" + URL + "แนวคิดจาก: …" (ตรงกับ `origin` ของ framework) + "คลิปนี้ทำด้วยเครื่องมือ AI"
- ภาพที่ใช้ซ้ำทั้งตอน: ตาราง 2×2 (ตอน 9, 10), กระดาน 4 ช่องที่เลื่อนการ์ดตาม keyframe `[เวลา, ช่อง, แถว]` (ตอน 11)
- `sfx.py`: รายการ `CUES` แบบ `(ฉาก, เสียง, ความดัง, คำ…)` ผูกกับคำเดียวกับภาพ ใช้ไฟล์เสียงใน `_shared/sound/`

## 5. ตรวจ layout ก่อนเรนเดอร์จริง

```bash
python3 clips/_shared/no-skill/build.py clips/<slug>/case/desktop     # และ mobile
clips/_shared/no-skill/stills.sh clips/<slug>/case <โฟลเดอร์รูป>      # ภาพท้ายทุกฉาก + contact sheet
```

เปิด contact sheet ดูทั้ง 2 ขนาด สิ่งที่เคยเจอและแก้:

- ข้อความทับตัวละครหรือกระดาน
- ป้ายเลยขอบปลอดภัยของมือถือ
- การ์ด 12 ใบล้นกระดาน: ลดความสูงแถว
- มาตรวัดทับการ์ด
- ตัดบรรทัดกลางคำ

แก้แล้วถ่ายเฉพาะฉากที่แก้ซ้ำด้วย `render.mjs <dir> <เวลา,เวลา>` จนผ่าน

## 6. เรนเดอร์และเก็บงาน

```bash
node clips/_shared/no-skill/render.mjs clips/<slug>/case/desktop &      # 2 ขนาดพร้อมกัน
node clips/_shared/no-skill/render.mjs clips/<slug>/case/mobile
clips/_shared/finish.sh clips/<slug>/case 3.0                          # เสียงประกอบ · WebM (VP9 2-pass) · ภาพปก
```

- ใช้เวลาราว 25–35 นาทีต่อตอน (3 นาที 2 ขนาด) ส่วนใหญ่หมดไปกับ VP9
- **งานเบื้องหลังรันได้นานสุด 2 ชั่วโมง** การต่อหลายตอนในคำสั่งเดียวเคยถูกตัดกลางคัน (ตอน 9) ให้รันครั้งละ 1–2 ตอน
- ตรวจหลังเสร็จ:
  - ffprobe ต้องได้ 1920×1080 และ 1080×1920 ความยาวเท่ากันทั้ง 2 ขนาด
  - ความดังราว −14 ถึง −15 LUFS
  - ไฟล์ไม่เกิน 20 MB (ที่ผ่านมาได้ 5–8 MB)
  - ดูภาพเฟรมสุดท้ายของทั้ง 2 ขนาด
- คัดลอกไปไว้ที่ `.cache/video-briefs/preview-ep<N>/` แล้วส่งให้เจ้าของ พร้อมรายชื่อคำที่ต้องฟัง
- **ภาพปก:** `python3 clips/_shared/no-skill/cover.py clips/<slug>/case` เลือกเฟรมที่มีเนื้อหามากที่สุดแทนวินาทีที่ 3 (เดิมหลายตอนได้ฉากว่าง) แล้วเปิดดูด้วยตา ถ้าภาพเฉลยตอนจบหรือ 2 ขนาดได้คนละฉาก ให้บังคับวินาทีด้วย `--at` (ตอน 12 ใช้ฉากแนะนำ OKR)
- commit ซอร์สคลิปลง branch ของคลิป ไม่ต้องรอเจ้าของตอบ

## 7. ขึ้นเว็บ (หลังเจ้าของ OK)

ทำบน branch ใหม่จาก `dev` ทุกครั้ง

1. **ตัวอย่างและแผนภาพ:** เขียน JSON ของ framework นั้น (`exampleSteps`, `diagram` และ `how`/`steps`/`origin` ถ้าเปลี่ยน) แล้วรัน
   `node clips/_shared/no-skill/publish/apply-examples.js <ไฟล์>` ที่ root ของเว็บ สคริปต์จะเขียน `example` แบบแบนให้ตรงกับการ์ด ซึ่งมี test ตรวจอยู่
2. `npm test` และ `npm run data` แล้ว `node …/publish/diagram-overlap.mjs <png> <slug>` ต้องได้ overlaps 0 และเปิดภาพดูด้วยตา
   - ตัวตรวจ overflow แบบเก่า (`getBBox`) แจ้งเตือนข้อความที่หมุน 90° ผิด ไม่ต้องเชื่อ
   - ผังพีระมิด 7 ชั้นแคบจนข้อความชั้นบนทับกัน (Delegation Levels) จึงเปลี่ยนเป็นชั้นกว้างเท่ากัน
3. commit เนื้อหาก่อน แล้ว `npm run video:brief -- <slug>` เพื่อเอา `briefHash`
4. คัดลอกคลิปเข้า `public/videos/` แล้วรัน `npm run video:add -- <slug> --size desktop|mobile --file … --poster … --duration m:ss --tool "Claude Motion + ElevenLabs" --title "Name: คำถาม" --date … --hash …` **commit แยกขนาดละ 1 commit** (`git add -f`)
5. เพิ่ม slug ท้าย `episodes` ใน `data/series.json` แล้วเลื่อน `next` ไปตอนถัดไป
6. อัปเดต `series.md`: แถวของตอนใน storyline, พัฒนาการของเจ้าของร้าน และ canon ใหม่
7. เพิ่มรายการบนสุดของ `data/changelog.json`
8. `npm test`, `npm run video:check` แล้ว push

## 8. Deploy

- PR `feature/…` → `dev` แล้ว merge ด้วย **merge commit** รอ Pages แล้วตรวจ dev
- เปิด PR `dev` → `stg` เอง เพราะ workflow "Promote" ยังติดสิทธิ์ ตรวจ stg แล้วเปิด `stg` → `main` ทุกครั้งใช้ merge commit
- รอ deploy ด้วยการ curl จนเจอชื่อไฟล์คลิปหรือข้อความใหม่ (`until curl … | grep -q …; do sleep 20; done`) หรือดูสถานะ Actions งาน deploy ขึ้น Pages บางครั้งค้างอยู่หลายนาที
- ตรวจทุกสภาพแวดล้อมด้วย:
  - `node …/publish/verify-live.mjs <''|dev/|stg/> <dir> <slug>=<ข้อความในเรื่อง>`: คลิปเล่นได้ ขนาดภาพ ความยาว ข้อความเรื่อง และไม่ล้นแนวนอน ทั้งจอคอมและ iPhone 13
  - `node …/publish/clips-page-check.mjs <base url> <dir>` เมื่อหน้า `/clips` เปลี่ยน
  - ที่ prd ดู MRR ใน `search/eval.json` ด้วย ล่าสุด v2 0.873, v3 0.910

## 9. ปัญหาที่เจอและวิธีแก้

| ปัญหา | แก้ |
| --- | --- |
| faster-whisper อ่านไฟล์ผ่าน PyAV แล้วล้ม (`metadata_errors`) | ถอดเสียงเป็น numpy ด้วย ffmpeg ก่อน (อยู่ใน `pick.py`) |
| โควตา ElevenLabs เต็ม (`quota_exceeded`) | เจ้าของขยายโควตาของ key บน iPhone |
| `pgrep -f pick.py` เจอตัวเอง วนรอไม่จบ | รอด้วย PID หรือรอให้มี `words.json` |
| render ล้ม "reading 'className'" | คำ cue ไม่อยู่ในบท แก้ด้วย `HEARD` |
| `unknown data-scene` | `index.html` ยังเป็น id ฉากของตอนเก่า |
| ภาพปกส่งเจ้าของผิดรุ่น (ก่อนแก้แถบเมนู) | ถ่ายใหม่จาก prd แล้วส่งแทน บอกเจ้าของตรง ๆ |
| `rm -rf $C/$sz/check` ถูกระบบความปลอดภัยปฏิเสธ | เขียน `"${C:?}/${sz:?}/check"` |
| ภาพปกว่างเปล่าในหน้าคลิป | `cover.py` (ภาพปกตอน 1–11 เปลี่ยนแล้วใน #73) |
| ทดสอบการเลื่อนเวลาวิดีโอในเครื่องไม่ได้ | `python3 -m http.server` ไม่รองรับ Range ใช้เซิร์ฟเวอร์ที่รองรับ (GitHub Pages รองรับ) |
| `next build` ออกด้วย exit 1 เป็นบางครั้ง | Next.js แจ้งช่องโหว่ของเวอร์ชันที่ใช้ หน้าเว็บ build ครบ ยังต้องอัปเดต Next.js เป็นงานแยก |

## 10. ตอนที่ทำแล้ว

| ตอน | framework | ความยาว | วันที่ | PR บนเว็บ |
| --- | --- | --- | --- | --- |
| 1 | 5 Whys | 0:58 | 2026-11-24 | ทำด้วย skill |
| 2 | PDCA | 1:08 | 2026-11-24 | #41, #45 |
| 3 | Fishbone | 1:12 | 2026-11-25 | #48 |
| 4 | Pareto 80/20 | 3:11 | 2026-11-27 | #52, #53 |
| 5 | Theory of Constraints | 2:05 | 2026-11-27 | #58 |
| 6 | Eisenhower Matrix | 2:02 | 2026-11-27 (การ์ดตอนหน้า 11-28) | #58, #61 |
| 7 | Delegation Levels | 2:59 | 2026-11-28 | #61, #62 |
| 8 | RACI | 2:50 | 2026-11-28 | #61 |
| 9 | Skill / Will Matrix | 3:16 | 2026-11-28 | #61 |
| 10 | Situational Leadership | 3:14 | 2026-11-28 | #65 |
| 11 | Kanban | 3:07 | 2026-11-28 | #70 |
| 12 | OKR | 3:53 | 2026-11-28 | PR ของ `feature/clip-ep12` |

PR ที่ส่งต่อ dev → stg → main ของตอน 7–10: #63, #64, #67, #68 ส่วนหน้า `/clips` ขึ้นใน #66

## 11. ยังค้าง

- ตอน 13 SWOT: ตอน 12 ทิ้งท้ายไว้แล้ว (เปิดสาขาสอง)
- คลิปเก่าที่เรื่องยังไม่ต่อกัน: ภาพ PDCA ยังเขียน "4 เสาร์", ตัวอย่างบนหน้า Pareto ควรบอกว่าเตาครบ 3 หัวแล้ว, คลิป Pareto ยังไม่มีการ์ดตอนหน้า (ดู series.md)
- MP4 สำหรับลงโซเชียล (`out/<slug>-final.mp4`) ยังไม่ได้ส่งออกให้เจ้าของตั้งแต่ตอน 5
- อัปเดต Next.js (ช่องโหว่) และสิทธิ์ของ workflow Promote
