# คลิปอธิบาย framework

หน้า framework แต่ละตัวมีที่สำหรับคลิปอธิบายสั้น ๆ (60–90 วินาที) repo นี้ไม่ได้ทำคลิปเอง แต่เตรียม **brief** ให้ skill และ tool ที่ทำคลิปใช้เป็นวัตถุดิบ แล้วรับคลิปที่เสร็จกลับมาลงทะเบียนใน `data/videos.json`

```
data/frameworks.json ──► npm run video:brief ──► brief.json · brief.md · diagram.svg
                                                        │
                                          skill + tool ทำคลิป, เจ้าของตรวจ
                                                        │
              YouTube หรือไฟล์ https ◄── อัปโหลด ◄────────┘
                        │
                        ▼
          npm run video:add ──► data/videos.json ──► หน้าเว็บ · การ์ด · แอปมือถือ · WebMCP
```

## เครื่องมือที่ใช้ทำคลิป

| | ชื่อ | ลิงก์ | หมายเหตุ |
|---|---|---|---|
| Skill | _ยังไม่ได้เชื่อม_ | | ขั้นตอนที่ agent ทำตาม: อ่าน brief → สั่ง tool → ส่งให้เจ้าของตรวจ → ลงทะเบียน |
| Tool | _ยังไม่ได้เชื่อม_ | | ตัวทำภาพ เสียงบรรยาย และตัดต่อ |

เมื่อเชื่อมแล้ว ให้เติมตารางนี้ และใช้ชื่อเดียวกันใน `--tool` / `--skill` ตอนลงทะเบียน

## ทำคลิปหนึ่งตัว

1. **สร้าง brief**: `npm run video:brief -- <slug>` (หรือ `--all`) ได้ไฟล์ใน `.cache/video-briefs/<slug>/` (ไม่เข้า git)
   - `brief.json` ให้ skill/tool อ่าน: ฉากตามลำดับ (`scenes`) ข้อความที่พูดได้ (`scenes[].source`) กติกา (`rules`) และสเปกไฟล์ (`deliver`)
   - `brief.md` เนื้อหาเดียวกันสำหรับคนอ่าน
   - `diagram.svg` แผนภาพของ framework สีตามกลุ่ม พื้นขาว ใช้ในฉาก diagram ได้ทันที
2. **ทำคลิป** ด้วย tool ตาม brief: hook → idea → diagram → 5 ขั้นตอน → ตัวอย่างสมมติ → (กรณีจริง ไม่บังคับ) → ปิดด้วยเครดิตและตัวที่ใช้ต่อ
3. **เจ้าของตรวจ** ก่อนเผยแพร่: เนื้อหาไม่เกินจาก brief, ฉากตัวอย่างมีป้าย "ตัวอย่างสมมติ", กรณีจริงแสดงแหล่งอ้างอิงและข้อจำกัดของหลักฐาน, ไม่มีโลโก้ ปกหนังสือ หรือเสียง/ภาพของบุคคลจริง
4. **อัปโหลด** ไป YouTube (Unlisted หรือ Public) หรือที่เก็บไฟล์ที่ให้ URL แบบ https
5. **ลงทะเบียน**:
   ```bash
   npm run video:add -- fishbone-ishikawa --youtube https://youtu.be/<id> --duration 1:24 \
     --tool "<ชื่อ tool>" --skill "<ชื่อ skill>" --title "Fishbone ใน 90 วินาที" --hash <briefHash จาก brief>
   ```
   ไฟล์ที่ host เอง: `--file https://…/fishbone.mp4 --poster https://…/fishbone.jpg --captions https://…/fishbone.th.vtt`
   ถ้าเสียงและภาพไม่ได้สร้างด้วย AI ให้ใส่ `--no-ai` (ค่าเริ่มต้นคือแสดงว่า "สร้างด้วยเครื่องมือ AI")
6. **ส่งขึ้นเว็บ** ตาม flow ปกติ: `npm test` → เพิ่มรายการใน `data/changelog.json` → branch `feature/video-<slug>` จาก `dev` → PR เข้า `dev` → ตรวจบน `/dev/` → promote

## ข้อมูลใน `data/videos.json`

```jsonc
{
  "fishbone-ishikawa": {
    "title": "Fishbone ใน 90 วินาที",
    "durationSec": 84,
    "lang": "th",
    "aspect": "16:9",                                   // หรือ "9:16"
    "source": { "kind": "youtube", "id": "<11 ตัวอักษร>" }, // หรือ { "kind": "file", "src": "https://….mp4" }
    "poster": "https://….jpg",                          // ไม่บังคับ
    "captions": [{ "src": "https://….vtt", "lang": "th", "label": "ไทย" }], // เฉพาะ kind file
    "madeWith": { "tool": "…", "skill": "…", "date": "2026-11-14", "ai": true },
    "briefHash": "91cdd5f29161",                        // brief ที่ใช้ทำคลิป
    "note": "…"                                         // ไม่บังคับ แสดงใต้คลิป
  }
}
```

`npm test` ตรวจทุกรายการ (`scripts/video-lib.mjs` → `videoProblems`): slug มีจริง, ไฟล์ต้องเป็น https นอก repo, YouTube id ถูกรูปแบบ, ความยาว 10–600 วินาที, ต้องบอกว่าใช้ AI หรือไม่, ไม่มี field สะกดผิด

## คลิปที่เนื้อหาเปลี่ยนไปแล้ว

`briefHash` คือลายนิ้วมือของชื่อ ใช้เมื่อ วิธีคิด 5 ขั้นตอน ตัวอย่าง ที่มา และแผนภาพของ framework ถ้าแก้เนื้อหาเหล่านี้หลังทำคลิป `npm run video:check` จะขึ้น `!` พร้อมบอกว่าควรทบทวนคลิปไหน (test ไม่ fail แต่แสดงเป็น diagnostic) ถ้าดูแล้วคลิปยังถูกต้อง ลงทะเบียนซ้ำโดยไม่ใส่ `--hash` เพื่อรับ hash ปัจจุบัน

## หน้าเว็บแสดงคลิปอย่างไร

- หน้า framework บน desktop: หัวข้อ "คลิปอธิบาย" เป็นส่วนแรกก่อนแผนภาพ, มือถือ: ใต้หัวเรื่องก่อนแท็บ
- ก่อนกดเล่นเป็นแค่ภาพปก (ภาพ `poster` หรือปกที่วาดจากชื่อและสีกลุ่ม) ไม่โหลดอะไรจาก YouTube หรือ host ไฟล์ หน้าจึงเบาเท่าเดิมและไม่มี cookie ของบุคคลที่สาม กดแล้วจึงเปิด `youtube-nocookie.com` หรือ `<video>`
- ใต้คลิปบอกความยาวและเครื่องมือที่ใช้ ถ้า `madeWith.ai` เป็น true จะเขียนว่า "สร้างด้วยเครื่องมือ AI"
- การ์ดในหน้า Frameworks และรายการในแอปมือถือมีป้าย "▶ มีคลิป m:ss"
- WebMCP `get_framework` คืน `video` (title, durationSec, url, aiGenerated) หรือ `null`
- framework ที่ยังไม่มีคลิป หน้าเหมือนเดิมทุกอย่าง

## เก็บไฟล์คลิปที่ไหน

ไฟล์วิดีโอห้ามเข้า repo หรือ `public/`: workflow build เว็บ 7 ชุด (prd, /v0–/v3, /stg, /dev) ทุกชุดจะ copy ไฟล์ซ้ำ ขณะที่ GitHub Pages จำกัดเว็บไว้ 1 GB และ repo เป็น public

| | YouTube (Unlisted/Public) | ไฟล์ https เช่น Azure Blob Storage |
|---|---|---|
| ค่าใช้จ่าย | ฟรี | ค่าเก็บ + ค่า egress (คลิปละ ~10–20 MB) |
| เล่นบนมือถือ | ปรับความชัดตามเน็ตอัตโนมัติ | ไฟล์เดียว ความชัดเดียว |
| คำบรรยาย | ใช้ subtitle ของ YouTube | ไฟล์ `.vtt` และต้องเปิด CORS (`Access-Control-Allow-Origin`) ที่ host ทั้งไฟล์คลิปและ `.vtt` ถ้าไม่เปิด คลิปที่มีคำบรรยายจะเล่นไม่ได้เลย |
| ความเป็นส่วนตัว | YouTube เห็นเมื่อผู้ชมกดเล่น | ไม่มีบุคคลที่สาม |
| ใช้ซ้ำที่อื่น | แชร์ / โพสต์ต่อได้ทันที | ต้องอัปโหลดแยก |

## ข้อจำกัดที่รู้แล้ว

- iOS Safari อาจต้องแตะเล่นซ้ำอีกครั้งใน YouTube player
- คลิปละหนึ่งตัวต่อ framework, ยังไม่มีบทย่อย (chapters) ที่กระโดดไปแต่ละขั้นตอน
- ยังไม่มี structured data แบบ VideoObject สำหรับ search engine
