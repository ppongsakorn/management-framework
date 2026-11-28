# สร้างคลิปโดยไม่มี skill `claude-motion-clip`

ใช้ตอนทำคลิป Pareto 80/20 (27 พ.ย. 2026) ในเครื่องที่ไม่มี skill ใช้ `runtime.js` และ `finish.sh` ตัวเดียวกับคลิปอื่น

| ไฟล์ | ทำอะไร |
| --- | --- |
| `tts.py` | สร้างเสียงพากย์จาก `desktop/clip.json` ด้วย ElevenLabs ลง `voice/raw/s<N>_<take>.mp3` (ต้องมี `ELEVENLABS_API_KEY`) เช่น `python3 tts.py 1:a 1:b` (รันในโฟลเดอร์ชุดคลิป) |
| `pick.py` | ให้ Whisper large-v3 (`faster-whisper`) ฟังทุก take วัด CER เทียบบท เลือก take ที่ดีที่สุดเป็น `voice/s<N>.flac` และเขียน `voice/words.json` |
| `build.py` | แทน `build.py` ของ skill: `timeline.json` + `audio.m4a` (เสียงพากย์ + เพลงลดเสียงตอนพูด) ของโฟลเดอร์ขนาดหนึ่ง |
| `render.mjs` | แทน `render.js`: เปิดหน้าด้วย Chromium (Playwright) วาดทีละเฟรมผ่าน `__frameAt` ส่งเข้า ffmpeg ได้ `out/<slug>.mp4` ใส่เวลาคั่นด้วย `,` เป็นอาร์กิวเมนต์ที่ 2 เพื่อถ่ายภาพนิ่งลง `check/` แทน |

```bash
SET=clips/pareto-80-20/case
for size in desktop mobile; do
  python3 clips/_shared/no-skill/build.py $SET/$size
  node clips/_shared/no-skill/render.mjs $SET/$size
done
clips/_shared/finish.sh $SET 3.0
```

## เพิ่มเติม (ตอน 7–11)

| ไฟล์ | ทำอะไร |
| --- | --- |
| `stills.sh` | ภาพนิ่งท้ายทุกฉากทั้ง 2 ขนาด + contact sheet ใช้ตรวจ layout ก่อนเรนเดอร์จริง |
| `publish/apply-examples.js` | เขียน `exampleSteps` + `example` แบบแบน + `diagram` (และ `how`/`steps`/`origin`) ลง `data/frameworks.json` |
| `publish/diagram-overlap.mjs` | นับข้อความที่ทับกันในแผนภาพหนึ่งตัวด้วยฟอนต์จริง |
| `publish/verify-live.mjs` | ตรวจหน้าเว็บจริง (prd/stg/dev): ข้อความเรื่อง คลิปเล่นได้ ขนาด ความยาว ไม่ล้น ทั้งจอคอมและ iPhone 13 |
| `publish/clips-page-check.mjs` | ตรวจหน้า `/clips` และ `/mobile/clips` |

ขั้นตอนเต็มและบทเรียนทั้งหมด: `docs/videos/production.md` ในเว็บ (branch `dev`)
