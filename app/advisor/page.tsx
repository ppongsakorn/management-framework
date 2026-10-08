import type { Metadata } from "next";
import Link from "next/link";
import { Chat, type Starter } from "@/components/Chat";
import { groups, routerPrompts } from "@/lib/data";

export const metadata: Metadata = {
  title: "ที่ปรึกษา AI",
  description: "เล่าสถานการณ์ให้ที่ปรึกษา AI ฟัง แล้วรับคำแนะนำว่าควรใช้ framework ไหน พร้อมขั้นตอนที่ปรับเข้ากับงานของคุณ",
};

const starters: Starter[] = [
  {
    label: "เล่าสถานการณ์ของฉันเอง (เติมบริบทก่อนส่ง)",
    prompt: "ทีม/บทบาทของฉัน: \nสถานการณ์ที่เจอ: \nสิ่งที่ลองไปแล้ว: \nอยากได้อะไรจากการคุยนี้: ",
    prefill: true,
  },
  ...groups.map((g) => ({
    label: `"${routerPrompts[g.id].sentence}"`,
    prompt: `ตอนนี้ฉันรู้สึกว่า "${routerPrompts[g.id].sentence}" ช่วยถามคำถามเพื่อวินิจฉัยสถานการณ์ แล้วแนะนำ framework ที่เหมาะ`,
    group: g.id,
  })),
];

const scenarios = [
  "ค่า cloud ของทีม Data ขึ้นทุกเดือน ไม่รู้จะเริ่มลดตรงไหน",
  "Dashboard ใหม่ทำเสร็จแล้ว แต่ไม่มีใครใช้",
  "ทีมรับงาน ad-hoc จนงานหลักไม่คืบ",
  "ต้องเลือกระหว่าง 3 vendor ภายในเดือนนี้",
  "ทีมใหม่ 4 คน เริ่มทะเลาะกันเรื่องวิธีทำงาน",
  "Pipeline SLA หลุดบ่อย แก้แล้วก็กลับมาอีก",
];

export default function AdvisorPage() {
  return (
    <>
      <div className="page-head">
        <h1>ที่ปรึกษา AI</h1>
        <p>
          ที่ปรึกษาด้านการบริหารที่รู้จักทั้ง 51 กรอบความคิดในเว็บนี้ เล่าสถานการณ์จริง แล้วจะช่วยวินิจฉัยว่าคุณอยู่ขั้นไหน แนะนำ framework
          ที่เหมาะ และปรับขั้นตอนให้เข้ากับทีมของคุณ
        </p>
      </div>
      <div className="advisor-layout">
        <aside className="advisor-aside">
          <div className="panel">
            <h2>ตัวอย่างสถานการณ์</h2>
            <ul>
              {scenarios.map((s) => (
                <li key={s}>
                  <span className="muted">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <h2>เคล็ดลับให้ได้คำตอบดี</h2>
            <ul className="muted">
              <li>บอกขนาดทีม เครื่องมือ และตัวเลขที่มี</li>
              <li>บอกว่าลองอะไรไปแล้วและผลเป็นยังไง</li>
              <li>ขอให้ทำเป็นตาราง / เทมเพลตได้ เพื่อนำไปนำเสนอ</li>
            </ul>
            <Link href="/frameworks" className="btn" style={{ width: "100%", justifyContent: "center" }}>
              ดู Framework ทั้งหมด
            </Link>
          </div>
        </aside>
        <Chat
          title="ที่ปรึกษาเข็มทิศ"
          subtitle="ผู้เชี่ยวชาญ management framework"
          intro="เลือกประโยคที่ตรงกับคุณที่สุด หรือพิมพ์เล่าสถานการณ์ได้เลย"
          starters={starters}
        />
      </div>
    </>
  );
}
