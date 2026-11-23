# ต้นฉบับคลิป

โค้ดและไฟล์ที่ใช้สร้างคลิปอธิบาย framework เก็บไว้ที่นี่ จะได้ render ใหม่หรือแก้ต่อได้จากเครื่องไหนก็ได้ โดยไม่ต้องเสียเครดิต ElevenLabs ซ้ำ ส่วนไฟล์คลิปที่ขึ้นเว็บอยู่ที่ `public/videos/` ขั้นตอนทำคลิปและกติกาอยู่ใน [docs/videos/README.md](../docs/videos/README.md)

คลิปสร้างด้วย skill `claude-motion-clip` ในเครื่อง (`~/.ai_skills/video/claude-motion-clip`) ฉากเป็น HTML/CSS ที่วาดจากเวลา `t` แล้วให้ Chrome ในเครื่องถ่ายทีละเฟรม

## โครงสร้าง

```text
clips/
├── _shared/                  ใช้ร่วมกันทุกคลิป
│   ├── fonts/                IBM Plex Sans Thai, Anuphan, IBM Plex Mono (SIL OFL, มีไฟล์ LICENSE)
│   ├── runtime.js            ตัววาดเฟรมของ skill (สำเนารุ่นที่ใช้ render จริง)
│   ├── sound/                เสียงประกอบจาก ElevenLabs (pop, drop, bonk, ding, reveal, tada)
│   ├── restore_times.py      คืนเวลาไฟล์เสียงหลัง clone (ต้องรันก่อน build)
│   └── finish.sh             ใส่เสียงประกอบ → WebM สำหรับเว็บ → ภาพปก
└── <slug>/<ชุด>/             หนึ่งชุด = หนึ่งเรื่อง ทำ 2 ขนาดจากต้นฉบับเดียว
    ├── notes.md              เรื่องย่อ เสียงที่ใช้ take ที่เลือก เครดิต และสถานะ
    ├── index.html            หน้าฉาก (ใช้ร่วมกันทั้ง 2 ขนาด)
    ├── <ชุด>.js              โค้ดวาดฉาก (ใช้ร่วมกันทั้ง 2 ขนาด)
    ├── sfx.py                ตำแหน่งเสียงประกอบ ผูกกับคำที่พูด
    ├── voice/                เสียงพากย์ที่เลือกแล้ว s<N>.flac + words.json (เวลาของแต่ละคำจาก Whisper)
    ├── music/                เพลงประกอบ
    ├── desktop/              16:9 → clip.json ของตัวเอง ที่เหลือเป็น symlink ไปข้างบน
    └── mobile/               9:16 → clip.json ของตัวเอง ที่เหลือเป็น symlink ไปข้างบน
```

ในโฟลเดอร์ `desktop/` และ `mobile/` มีไฟล์จริงแค่ `clip.json` (ขนาดภาพกับชื่อไฟล์ผลลัพธ์) ที่เหลือเป็น symlink ไปที่ไฟล์กลาง จึงแก้ฉากที่เดียวแล้วได้ทั้ง 2 ขนาด และไม่ต้องเก็บเสียงซ้ำ 2 ชุด โค้ดฉากดูขนาดจอเองแล้วจัดวางต่างกัน (เช่น `V = H > W` ใน `case.js`)

## ไม่เก็บอะไรบ้าง

`.gitignore` ในโฟลเดอร์นี้กันไฟล์ที่สร้างใหม่ได้ไว้แล้ว

| ไม่เก็บ | เพราะ |
| --- | --- |
| `out/` (MP4, WebM, ภาพปก) | WebM กับภาพปกไปอยู่ที่ `public/videos/` ส่วน MP4 สำหรับโพสต์ใหญ่และไม่ใช้บนเว็บ |
| `check/`, `timeline.json`, `audio.m4a` | `build.py` และ `check.js` สร้างใหม่ทุกครั้ง |
| `voice/raw/` | take ที่ไม่ได้เลือก ไม่ต้องใช้ตอน render |

repo นี้เป็น public ไฟล์ที่นี่จึงต้องไม่มี API key, token หรือ path ในเครื่องส่วนตัว `clip.json` เก็บแค่ `voice_id` ของเสียงใน Voice Library ซึ่งเป็นเลขสาธารณะ ใช้สร้างเสียงไม่ได้ถ้าไม่มีบัญชี

## Render ใหม่จากต้นฉบับ

ต้องมี skill `claude-motion-clip` (รัน `doctor.sh` ของ skill ถ้าเครื่องยังไม่พร้อม) ffmpeg ที่มี libvpx-vp9 และ Python ที่มี Pillow

```bash
K=~/.ai_skills/video/claude-motion-clip/scripts
SET=clips/5-whys/case

python3 clips/_shared/restore_times.py $SET        # ครั้งแรกหลัง clone หรือ checkout
for size in desktop mobile; do
  python3 $K/build.py $SET/$size                   # timeline.json + audio.m4a ตามเสียงจริง
  node $K/check.js $SET/$size                      # ภาพนิ่ง + ตรวจ layout ดู check/sheet-*.png
  node $K/render.js $SET/$size                     # out/<slug>.mp4
done
clips/_shared/finish.sh $SET 2.0                   # เสียงประกอบ, WebM, ภาพปกจากวินาทีที่ 2.0
```

`finish.sh` สร้างไฟล์ 3 อย่างใน `out/` ของแต่ละขนาด

- `<slug>-final.mp4` สำหรับโพสต์โซเชียล
- `<slug>.webm` (VP9 + Opus)
- `<slug>.webp` ภาพปก

ก๊อป `.webm` กับ `.webp` ไปที่ `public/videos/` แล้วลงทะเบียนด้วย `npm run video:add` ตาม [docs/videos/README.md](../docs/videos/README.md) ขึ้นเว็บเฉพาะ WebM และต้องครบทั้ง 2 ขนาดเสมอ

ทดสอบแล้ว (23 พ.ย. 2026) ว่า clone ใหม่แล้ว render ชุด `5-whys/case` ได้คลิปเดียวกับที่ขึ้นเว็บ ทั้งความยาว 57.6 วินาที ความดัง -14.8 LUFS และภาพที่ PSNR 62 dB (ต่างกันแค่การเข้ารหัส)

## เริ่มคลิปใหม่

1. รัน `npm run video:brief -- <slug>` เพื่อดึงข้อเท็จจริงของ framework
2. เปิดโฟลเดอร์ทำงานด้วย `new_clip.py` ของ skill แล้วย้ายเข้ามาตามโครงสร้างข้างบน (`clips/<slug>/<ชุด>/`) ตั้งแต่เริ่ม
3. ใช้ `../../../_shared/fonts` และ `../../../_shared/runtime.js` ผ่าน symlink แทนการก๊อปซ้ำ
4. เสียงพากย์ทุก take โหลดลง `voice/raw/` (ไม่เข้า git) เลือกแล้วค่อยเป็น `voice/s<N>.flac`
5. เขียน `notes.md` บอกเรื่องย่อ เสียงที่ใช้ take ที่เลือก และเครดิตที่ใช้
