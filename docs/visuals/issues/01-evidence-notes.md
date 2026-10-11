# [P1] แสดงข้อจำกัดของหลักฐานกรณีศึกษาให้ครบในหน้าเว็บและ AI

## ปัญหา

326 กรณีศึกษามี note 216 กรณี และ disputed 14 กรณี; **202 กรณีมี note แต่ไม่ disputed** จึงไม่แสดงหมายเหตุบนหน้าเว็บ ข้อจำกัดที่หายไปมีทั้งผลที่ผู้ขายรายงานเอง ผลแบบจำลอง การตีความย้อนหลัง และหลักฐานเฉพาะบทคัดย่อ

## หลักฐาน

- [components/UseCases.tsx:28](https://github.com/ppongsakorn/management-framework/blob/a34cae3e063197e92ba4ce1efff16898ff112fcc/components/UseCases.tsx#L28) แสดง note เฉพาะ c.disputed; component ใช้ทั้ง desktop/mobile
- [lib/prompt.ts:10–13](https://github.com/ppongsakorn/management-framework/blob/a34cae3e063197e92ba4ce1efff16898ff112fcc/lib/prompt.ts#L10) AI รับ who/event/problem/result แต่ไม่รับ note หรือ sources
- lib/webmcp-tools.ts คืน note/sources อยู่แล้ว แต่ description บางตัวใช้คำว่า verified result โดยไม่สะท้อนข้อจำกัด

## งานที่ต้องทำ

- แสดง note ทุกกรณีที่มีข้อความ พร้อมคงคำเตือน disputed แยกจากหมายเหตุทั่วไป และไม่แสดงซ้ำ
- ให้ AI ได้ข้อจำกัดและ source URL ของกรณีที่มันใช้อ้างอิง พร้อมคำสั่งไม่ยกผลจำลอง/self-reported เป็นผลพิสูจน์เชิงเหตุและผล; คงการกรอง disputed
- ปรับคำอธิบาย WebMCP ให้สอดคล้องกับคุณภาพหลักฐาน

## ตรวจรับ

- [ ] non-disputed มี note แสดงบน desktop/mobile; ไม่มี note ไม่แสดงกล่องว่าง
- [ ] disputed มีคำเตือนพร้อม note โดยไม่ซ้ำ
- [ ] ตรวจ VSM Ziehl-Abegg (vendor report), VSM โรงพยาบาลสเปน (simulation), PDCA โรงพยาบาลสงขลานครินทร์ (ผลสองด้าน)
- [ ] system prompt เก็บ caveat และ source URL ของตัวอย่าง; ตรวจการประกอบ prompt โดยไม่ต้องเรียก AI API
- [ ] มี regression test สำหรับการรักษาข้อจำกัดของหลักฐาน

## วิธีส่งมอบ

- อ่าน `CLAUDE.md` และตรวจสถานะ repo ล่าสุดก่อนเริ่ม; หลักฐานด้านล่างอ้างอิง commit `a34cae3` วันที่ตรวจ 11 ต.ค. 2026
- ทำใน worktree แยกและ branch ของงานนี้ แล้วเปิด PR ให้เจ้าของ review ก่อน merge
- เพิ่มรายการใน `data/changelog.json` ตามข้อกำหนดของ repo
- รัน `npm test`, `npm run typecheck` และ static build ที่ใช้ base path `/management-framework`; ถ้าเปลี่ยนหน้าเว็บให้ตรวจ desktop/mobile และ light/dark พร้อมหลักฐานใน PR
- โฟกัสการรวบรวมและนำเสนอเนื้อหา framework ตามเป้าหมายของเจ้าของ

