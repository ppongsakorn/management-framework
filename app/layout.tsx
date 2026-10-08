import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { aiEnabled } from "@/lib/site";
import "./globals.css";

const plex = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "เข็มทิศกรอบความคิด — หยิบ Framework ให้ถูกสถานการณ์", template: "%s · เข็มทิศกรอบความคิด" },
  description:
    "เรียนรู้ 51 management framework จัดกลุ่มตามคำถามที่ผู้บริหารกำลังถาม พร้อมขั้นตอนลงมือทำ ตัวอย่าง และแผนภาพสำหรับนำเสนอ",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

function CompassMark() {
  const colors = ["--diag", "--dec", "--plan", "--exec", "--ppl", "--think"];
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      {colors.map((c, i) => {
        const a0 = ((i * 60 - 90) * Math.PI) / 180;
        const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
        const p = (a: number, r: number) => `${14 + r * Math.cos(a)} ${14 + r * Math.sin(a)}`;
        return <path key={c} d={`M${p(a0, 13)} A13 13 0 0 1 ${p(a1, 13)} L${p(a1, 7)} A7 7 0 0 0 ${p(a0, 7)} Z`} fill={`var(${c})`} />;
      })}
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={plex.variable}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              <CompassMark />
              <span>เข็มทิศกรอบความคิด</span>
            </Link>
            <nav className="nav" aria-label="หลัก">
              <Link href="/frameworks">Frameworks</Link>
              {aiEnabled && (
                <Link href="/advisor" className="cta">
                  ปรึกษา AI
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap site-footer">
          เนื้อหาเรียบเรียงใหม่จากแนวคิดด้านการบริหารที่เผยแพร่ทั่วไป และให้เครดิตผู้ริเริ่มแนวคิดไว้ในหน้าของแต่ละ framework ·
          ชื่อ framework บางรายการอาจเป็นเครื่องหมายการค้าของเจ้าของ · ตัวอย่างทั้งหมดเป็นสถานการณ์สมมติ
          {aiEnabled && " · คำแนะนำจาก AI เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำตัดสินแทนคุณ"}
        </footer>
      </body>
    </html>
  );
}
