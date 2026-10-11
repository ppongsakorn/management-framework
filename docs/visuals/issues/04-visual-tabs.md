# [P2] เชื่อมภาพต้นแบบ 3 framework เป็นแท็บ โดยใช้สีและข้อมูลของเว็บเดิม

## เป้าหมาย

ให้ผู้อ่านเลือกดูแผนภาพเดิมและภาพอธิบายรูปแบบใหม่ของ Fishbone, Eisenhower Matrix และ RACI บน desktop/mobile แล้วดูว่ารูปแบบไหนเข้าใจง่ายกว่า เจ้าของต้องการ minimal but powerful และสีที่เข้ากับเว็บเดิม

## งานเตรียมที่มีบน branch codex/visual-tab-prototype

- public/images/frameworks/{fishbone,priority-matrix,raci}/: minimal-v1.png และ illustrated-v1.png รวม 6 ภาพ
- data/frameworks.json: เพิ่ม visuals เฉพาะ 3 slug พร้อม src, alt/caption ภาษาไทย, dimensions, provenance, promptId และ contentNotes
- lib/data.ts: FrameworkVisual และ visuals optional
- data/visual-prompts.json: prompt ที่ใช้สร้างแต่ละภาพ
- docs/visuals/README.md: index ภาพ กติกาการใช้และข้อจำกัด
- ยังไม่มี UI ภาพใหม่; ภาพทุกไฟล์มี status prototype

## สีและเนื้อหา

- ใช้ tokens จาก app/globals.css: พื้น --bg #f7f5ef, แผ่น --paper #fff, ตัวอักษร --ink #1d2430
- Fishbone เน้น --diag #b5322e; priority matrix เน้น --dec #c7791a; RACI เน้น --exec #2b7a4b
- ภาพ minimal มีข้อความอังกฤษจากตัวอย่างสมมติใน repo; ต้องมีคำอธิบายไทยที่อ่านเป็นข้อความจริงได้ด้วย
- ภาพ illustrated เป็นชุดอ้างอิงที่เจ้าของเห็นว่ายังไม่เป็นมืออาชีพ อย่าเลือกเป็นค่าเริ่มต้น; ใช้เปรียบเทียบเฉพาะเมื่อระบุสถานะและได้รับเลือก
- PNG ไม่เปลี่ยนสีตาม CSS: ใน dark mode คงสีภาพบนพื้นที่แสดงภาพที่อ่านได้ ไม่ใส่ filter กลับสีที่บิดสีเนื้อหา

## งานที่ต้องทำ

- ทำ visual selector ร่วมสำหรับ desktop/mobile; รูปแบบแนะนำ: แผนภาพเดิม / ภาพ Minimal (และภาพแนวคิดหากเจ้าของเลือก)
- รองรับ zoom/fullscreen และ keyboard/focus management, aria tablist/tab/tabpanel ที่ id ไม่ซ้ำกับ MTabs
- รักษา RACI ตารางแบบข้อความที่เข้าถึงได้ และ Fishbone หมวด/สาเหตุ ไม่ให้เหลือข้อมูลเฉพาะ pixels
- src ใน data ไม่มี base path; เติม basePath เพียงครั้งเดียว และตรวจ GitHub Pages /management-framework รวม comparison builds /v0–/v3
- แสดงสถานการณ์สมมติให้ชัด; ไม่ผูกภาพสมมติเข้ากับผลลัพธ์กรณีศึกษาจริง
- โหลดเฉพาะภาพที่จำเป็น ใช้ width/height ป้องกัน layout shift; อาจทำ WebP สำเนาสำหรับส่งเว็บโดยเก็บ PNG ต้นฉบับใน Git
- update get_current_page ของ WebMCP ให้รู้ active visual โดยไม่สับสนกับแท็บขั้นตอน/กรณีจริงบนมือถือ

## ตรวจรับ

- [ ] สลับมุมมองและขยายภาพได้บนทั้ง 3 framework; framework อื่นยังทำงานได้
- [ ] สีหน้าตรงกับ tokens เดิมใน light/dark; มี screenshots ใน PR
- [ ] ตรวจจอ 360–390px, desktop และ URL ที่มี base path; ไม่มีภาพ 404 หรือ horizontal overflow ของหน้าทั้งหน้า
- [ ] keyboard เลือกแท็บ เปิด/ปิด modal และกลับ focus ได้
- [ ] ภาพ/ข้อความตรงกับ example/diagram.spec โดยเฉพาะ RACI ทุกแถวมี A คนเดียว
- [ ] WebMCP 10 tools เดิมยังเรียกได้ และ active visual ตรงหน้าจอ

ภาพสร้างใน session เป็น static assets จึงไม่ต้องมี API key หรือสร้างภาพใหม่เมื่อผู้ใช้เปิดหน้าเว็บ

## วิธีส่งมอบ

- อ่าน `CLAUDE.md` และตรวจสถานะ repo ล่าสุดก่อนเริ่ม; หลักฐานด้านล่างอ้างอิง commit `a34cae3` วันที่ตรวจ 11 ต.ค. 2026
- ทำใน worktree แยกและ branch ของงานนี้ แล้วเปิด PR ให้เจ้าของ review ก่อน merge
- เพิ่มรายการใน `data/changelog.json` ตามข้อกำหนดของ repo
- รัน `npm test`, `npm run typecheck` และ static build ที่ใช้ base path `/management-framework`; ถ้าเปลี่ยนหน้าเว็บให้ตรวจ desktop/mobile และ light/dark พร้อมหลักฐานใน PR
- โฟกัสการรวบรวมและนำเสนอเนื้อหา framework ตามเป้าหมายของเจ้าของ

