import Link from "next/link";
import { CompassMark } from "@/components/CompassMark";
import { WebMcp } from "@/components/WebMcp";
import { WebMcpBadge } from "@/components/WebMcpBadge";
import { aiEnabled, assetBase, basePath, searchVariant } from "@/lib/site";
import { VARIANTS } from "@/lib/search/types";
import { mobileRedirectScript } from "@/lib/mobile";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Phones go to the app view unless the visitor chose the full site. Runs before paint. */}
      <script dangerouslySetInnerHTML={{ __html: mobileRedirectScript(basePath) }} />
      {searchVariant !== "v0" && (
        <div className="variant-bar">
          <div className="wrap">
            <b>เวอร์ชันทดลองค้นหา {VARIANTS[searchVariant].label}</b>
            <span>{VARIANTS[searchVariant].summary}</span>
            <a href={`${assetBase}/compare/`}>เปรียบเทียบทุกเวอร์ชัน →</a>
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="wrap">
          <Link href="/" className="brand">
            <CompassMark />
            <span>เข็มทิศกรอบความคิด</span>
          </Link>
          <nav className="nav" aria-label="หลัก">
            <WebMcpBadge />
            <Link href="/frameworks">Frameworks</Link>
            <Link href="/updates">อัปเดต</Link>
            {aiEnabled && (
              <Link href="/advisor" className="cta">
                ปรึกษา AI
              </Link>
            )}
          </nav>
        </div>
      </header>
      <WebMcp />
      <main className="wrap">{children}</main>
      <footer className="wrap site-footer">
        เนื้อหาเรียบเรียงใหม่จากแนวคิดด้านการบริหารที่เผยแพร่ทั่วไป และให้เครดิตผู้ริเริ่มแนวคิดไว้ในหน้าของแต่ละ framework ·
        ชื่อ framework บางรายการอาจเป็นเครื่องหมายการค้าของเจ้าของ · ตัวอย่างสถานการณ์เป็นเรื่องสมมติ ส่วนกรณีจริงมีแหล่งอ้างอิงกำกับ
        {aiEnabled && " · คำแนะนำจาก AI เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำตัดสินแทนคุณ"}
        <span className="footer-links">
          <Link href="/updates">ประวัติการอัปเดต</Link> · <Link href="/architecture">สถาปัตยกรรมระบบ</Link>
        </span>
        <a className="to-mobile" href={`${basePath}/mobile/`} data-view="mobile">
          เปิดแบบแอปมือถือ
        </a>
      </footer>
    </>
  );
}
