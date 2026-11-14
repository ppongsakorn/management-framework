# คลิปอธิบาย framework

หน้า framework แต่ละตัวมีที่สำหรับคลิปอธิบายสั้น ๆ (60–120 วินาที) repo นี้เตรียม **brief** ให้เครื่องมือทำคลิปใช้เป็นวัตถุดิบ แล้วรับคลิปที่เสร็จกลับมาเก็บใน `public/videos/` และลงทะเบียนใน `data/videos.json`

```
data/frameworks.json ──► npm run video:brief ──► brief.json · brief.md · diagram.svg
                                                        │
                              ภาพ: Claude Motion · เสียง: ElevenLabs · เจ้าของตรวจ
                                                        │
              public/videos/<slug>.webm ◄── เข้ารหัส WebM ◄┘
                        │
                        ▼
          npm run video:add ──► data/videos.json ──► หน้าเว็บ · การ์ด · แอปมือถือ · WebMCP
```

## เครื่องมือที่ใช้ทำคลิป

| | ชื่อ | หมายเหตุ |
|---|---|---|
| ภาพ | Claude Motion (artifact แบบ Motion บน claude.ai) | ภาพเป็นโค้ดแอนิเมชัน ไม่มีเสียงในตัว ได้ไฟล์วิดีโอจากปุ่ม Export บนหน้าคลิป หรือเรนเดอร์ทีละเฟรมในเครื่องด้วยตัวเรนเดอร์ของ Motion |
| เสียงพากย์ | ElevenLabs `eleven_v3` | ภาษาไทยใช้ได้เฉพาะรุ่น v3/v4 (รุ่น multilingual v2 และ flash ไม่มีไทย) ตั้ง `language_code: "th"` และใช้ endpoint `with-timestamps` เพื่อได้เวลาของแต่ละตัวอักษรไว้จัดจังหวะภาพและซับ |
| ตรวจการออกเสียง | Whisper large-v3 ในเครื่อง (`check_takes.py` ของชุดเครื่องมือพากย์เสียง) | วัด CER ของเสียงเทียบบท ค่าที่ผิดจากชื่ออังกฤษหรือตัวเลขไม่ใช่ความผิดของเสียง แต่ยังต้องฟังเองเรื่องวรรณยุกต์ |

ใส่ชื่อเครื่องมือเดียวกันใน `--tool` ตอนลงทะเบียน หน้าเว็บแสดงชื่อนี้ใต้คลิป

## ทำคลิปหนึ่งตัว

1. **สร้าง brief**: `npm run video:brief -- <slug>` ได้ไฟล์ใน `.cache/video-briefs/<slug>/` (ไม่เข้า git)
   - `brief.json` ฉากตามลำดับ (`scenes`) ข้อความที่พูดได้ (`scenes[].source`) กติกา (`rules`) และสเปกไฟล์ (`deliver`)
   - `brief.md` เนื้อหาเดียวกันสำหรับคนอ่าน, `diagram.svg` แผนภาพสีตามกลุ่ม
2. **เขียนบทพากย์แยกตามฉาก** จากข้อมูลใน brief เท่านั้น ชื่ออังกฤษเขียนตามเสียงอ่าน (เช่น "ไฟว์วายส์") ส่วนซับใช้ตัวสะกดจริง
3. **สร้างเสียงก่อนภาพ** ทีละฉาก แล้วใช้ความยาวเสียงจริงกำหนดความยาวฉาก (ปัดเป็นจำนวนเฟรมเต็มที่ 30fps ให้ภาพกับเสียงไม่เลื่อน) และเวลาของคำสำคัญกำหนดจังหวะที่ของบนจอโผล่
4. **ทำภาพใน Claude Motion** ตาม brief: hook → หลักคิด → แผนภาพ → 5 ขั้นตอน → ตัวอย่างสมมติ (มีป้ายตลอดฉาก) → กรณีจริงพร้อมแหล่งอ้างอิงบนจอ (ไม่บังคับ) → ปิดด้วยเครดิตและตัวที่ใช้ต่อ
5. **เจ้าของตรวจ** ก่อนเผยแพร่: เนื้อหาไม่เกินจาก brief, ไม่มีโลโก้ ปกหนังสือ หรือเสียง/ภาพของบุคคลจริง, ฟังการออกเสียงคำที่ Whisper ทักไว้
6. **เข้ารหัสเป็น WebM** (VP9 + Opus) แล้ววางใน `public/videos/` พร้อมภาพปกและซับ:
   ```bash
   ffmpeg -framerate 30 -i frames/%05d.png -i narration.wav -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 \
     -pix_fmt yuv420p -c:a libopus -b:a 64k -ac 1 -shortest public/videos/<slug>.webm
   ```
   ภาพปกเป็น WebP 1280×720 (`public/videos/<slug>.webp`) ซับเป็น WebVTT (`public/videos/<slug>.th.vtt`)
7. **ลงทะเบียน**:
   ```bash
   npm run video:add -- 5-whys --file videos/5-whys.webm --poster videos/5-whys.webp \
     --captions videos/5-whys.th.vtt --duration 1:49 --tool "Claude Motion + ElevenLabs" --hash <briefHash จาก brief>
   ```
   ถ้าเสียงและภาพไม่ได้สร้างด้วย AI ให้ใส่ `--no-ai` (ค่าเริ่มต้นคือแสดงว่า "สร้างด้วยเครื่องมือ AI")
8. **ส่งขึ้นเว็บ** ตาม flow ปกติ: `npm test` → เพิ่มรายการใน `data/changelog.json` → branch `feature/video-<slug>` จาก `dev` → PR เข้า `dev` → ตรวจบน `/dev/` → promote

## ข้อมูลใน `data/videos.json`

```jsonc
{
  "5-whys": {
    "title": "5 Whys ใน 2 นาที",
    "durationSec": 109,
    "lang": "th",
    "aspect": "16:9",                                        // หรือ "9:16"
    "source": { "kind": "file", "src": "videos/5-whys.webm" }, // ไฟล์ใน public/ (ไม่มี / นำหน้า), หรือ https URL, หรือ { "kind": "youtube", "id": "…" }
    "poster": "videos/5-whys.webp",                          // ไม่บังคับ
    "captions": [{ "src": "videos/5-whys.th.vtt", "lang": "th", "label": "ไทย" }], // เฉพาะ kind file
    "madeWith": { "tool": "Claude Motion + ElevenLabs", "date": "2026-11-14", "ai": true },
    "briefHash": "6989e68ffe67",                             // brief ที่ใช้ทำคลิป
    "note": "…"                                              // ไม่บังคับ แสดงใต้คลิป
  }
}
```

`npm test` ตรวจทุกรายการ (`scripts/video-lib.mjs` → `videoProblems`): slug มีจริง, ไฟล์ใน repo ต้องอยู่ใน `public/videos/` มีอยู่จริงและไม่เกิน 20 MB ต่อไฟล์, ไฟล์ภายนอกต้องเป็น https, YouTube id ถูกรูปแบบ, ความยาว 10–600 วินาที, ต้องบอกว่าใช้ AI หรือไม่, ไม่มี field สะกดผิด

## คลิปที่เนื้อหาเปลี่ยนไปแล้ว

`briefHash` คือลายนิ้วมือของชื่อ ใช้เมื่อ วิธีคิด 5 ขั้นตอน ตัวอย่าง ที่มา และแผนภาพของ framework ถ้าแก้เนื้อหาเหล่านี้หลังทำคลิป `npm run video:check` จะขึ้น `!` พร้อมบอกว่าควรทบทวนคลิปไหน (test ไม่ fail แต่แสดงเป็น diagnostic) ถ้าดูแล้วคลิปยังถูกต้อง ลงทะเบียนซ้ำโดยไม่ใส่ `--hash` เพื่อรับ hash ปัจจุบัน

## หน้าเว็บแสดงคลิปอย่างไร

- หน้า framework บน desktop: หัวข้อ "คลิปอธิบาย" เป็นส่วนแรกก่อนแผนภาพ, มือถือ: ใต้หัวเรื่องก่อนแท็บ
- ก่อนกดเล่นเป็นแค่ภาพปก ไม่โหลดตัวคลิป กดแล้วจึงเปิด `<video>` (หรือ `youtube-nocookie.com` สำหรับคลิป YouTube)
- ใต้คลิปบอกความยาวและเครื่องมือที่ใช้ ถ้า `madeWith.ai` เป็น true จะเขียนว่า "สร้างด้วยเครื่องมือ AI"
- การ์ดในหน้า Frameworks และรายการในแอปมือถือมีป้าย "▶ มีคลิป m:ss"
- WebMCP `get_framework` คืน `video` (title, durationSec, url, aiGenerated) หรือ `null`
- framework ที่ยังไม่มีคลิป หน้าเหมือนเดิมทุกอย่าง

## เก็บไฟล์คลิปที่ไหน

เจ้าของเลือก (14 พ.ย. 2026) ให้เก็บคลิปใน repo ที่ `public/videos/` เป็น **WebM (VP9 + Opus)** เพราะไฟล์เล็กกว่า MP4 ที่คุณภาพเท่ากัน และหน้าเว็บดึงจากเว็บเดียวกัน ไม่ต้องพึ่งบริการภายนอก ซับจากเว็บเดียวกันจึงไม่ต้องตั้ง CORS

- **ไม่ให้ไฟล์ซ้ำเกินจำเป็น**: workflow build เว็บ 7 ชุด แต่ `/v0`–`/v3` ลบ `public/videos` ก่อน build และดึงจากชุดหลักผ่าน `assetBase` (เหมือนโมเดลค้นหา) จึงมีสำเนาเฉพาะ prd, `/stg/` และ `/dev/` GitHub Pages จำกัดเว็บไว้ 1 GB
- **เพดาน 20 MB ต่อไฟล์** (test บังคับ) GitHub เตือนที่ 50 MB และไม่รับไฟล์เกิน 100 MB
- **ประวัติ git โตทุกครั้งที่แทนไฟล์** แม้ลบภายหลังก็ยังอยู่ใน history จึงควรแทนคลิปเมื่อจำเป็นจริงเท่านั้น
- ยังลงทะเบียนคลิป YouTube หรือไฟล์ https ภายนอกได้เหมือนเดิม ไฟล์ภายนอกที่มีซับต้องเปิด CORS ที่ host

## ข้อจำกัดที่รู้แล้ว

- WebM เล่นได้ใน Chrome, Edge, Firefox และ Android ส่วน Safari/iPhone รุ่นเก่าบางรุ่นอาจเล่นไม่ได้ (ยังไม่ได้ทดสอบบนอุปกรณ์จริง) ถ้าเจอปัญหา ให้เพิ่มไฟล์ MP4 สำรอง
- iOS Safari อาจต้องแตะเล่นซ้ำอีกครั้งใน YouTube player
- คลิปละหนึ่งตัวต่อ framework, ยังไม่มีบทย่อย (chapters) ที่กระโดดไปแต่ละขั้นตอน
- ยังไม่มี structured data แบบ VideoObject สำหรับ search engine
