import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";
import { frameworks, groups } from "@/lib/data";

export const metadata: Metadata = {
  title: "Frameworks ทั้งหมด",
  description: "51 กรอบความคิดสำหรับผู้บริหาร จัดกลุ่มตามวงจร วิเคราะห์ → ตัดสินใจ → วางแผน → ลงมือทำ → บริหารคน และคิดให้ชัด",
};

export default function FrameworksPage() {
  return (
    <>
      <div className="page-head">
        <h1>Frameworks ทั้งหมด</h1>
        <p>ค้นหาด้วยสถานการณ์ที่เจอ หรือกรองตามขั้นของวงจร แล้วเปิดการ์ดเพื่อดูขั้นตอน ตัวอย่าง แผนภาพ และปรึกษา AI</p>
      </div>
      <Catalog groups={groups} frameworks={frameworks} />
    </>
  );
}
