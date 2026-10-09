import Link from "next/link";
import { MTop } from "@/components/mobile/MTop";
import { WebMcpBadge } from "@/components/WebMcpBadge";
import { changelog, thaiDate } from "@/lib/changelog";
import { frameworks, frameworksIn, groups, routerPrompts } from "@/lib/data";

export default function MobileHome() {
  const latest = changelog[0];
  return (
    <>
      <MTop />
      <main className="m-screen">
        <section className="m-hero">
          <h1>หยิบ Framework ให้ถูกสถานการณ์</h1>
          <p>{frameworks.length} กรอบความคิดด้านการบริหาร เรียงตามวงจรงานผู้บริหาร</p>
          <Link href="/mobile/search" className="m-searchpill">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.8 4.8-1.4 1.4-4.8-4.8A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" fill="currentColor" />
            </svg>
            เล่าสิ่งที่เจอ เช่น งานล้นมือ
          </Link>
          <WebMcpBadge />
        </section>

        <h2 className="m-h2">ตอนนี้คุณกำลังพูดประโยคไหน?</h2>
        <ul className="m-list">
          {groups.map((g) => (
            <li key={g.id} className={`g-${g.id}`}>
              <Link href={`/mobile/g/${g.id}`} className="m-row m-group">
                <span className="m-swatch" />
                <span className="m-row-main">
                  <b>&quot;{routerPrompts[g.id].sentence}&quot;</b>
                  <small>
                    {g.title} · {frameworksIn(g.id).length} framework
                  </small>
                </span>
                <span className="m-chev" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="m-h2">อัปเดตล่าสุด</h2>
        <Link href="/mobile/updates" className="m-card m-latest">
          <time dateTime={latest.date}>{thaiDate(latest.date)}</time>
          <b>{latest.title}</b>
          <span>ดูประวัติการอัปเดตทั้งหมด ›</span>
        </Link>
      </main>
    </>
  );
}
