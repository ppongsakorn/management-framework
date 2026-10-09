import type { Metadata } from "next";
import { Compare } from "@/components/Compare";
import { frameworks } from "@/lib/data";

export const metadata: Metadata = {
  title: "เปรียบเทียบวิธีค้นหา",
  description: "ทดลองคำค้นเดียวกันกับทุกวิธีค้นหา พร้อมคะแนนจากชุดคำค้นทดสอบ",
  robots: { index: false },
};

export default function ComparePage() {
  return (
    <>
      <div className="page-head">
        <h1>เปรียบเทียบวิธีค้นหา</h1>
        <p>
          พิมพ์สถานการณ์ที่เจอ แล้วดูว่าแต่ละวิธีหยิบ framework ไหนขึ้นมา (5 อันดับแรก) — คะแนนด้านล่างวัดจากชุดคำค้นทดสอบภาษาไทย
          ที่เขียนแยกจากข้อมูลที่ใช้สร้างระบบค้นหา
        </p>
      </div>
      <Compare frameworks={frameworks} />
    </>
  );
}
