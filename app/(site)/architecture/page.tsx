import type { Metadata } from "next";
import Link from "next/link";
import { ContentDiagram, RoutingDiagram, SearchDiagram, SystemDiagram, type ArchNumbers } from "@/components/arch/Diagrams";
import phrases from "@/data/search-phrases.json";
import useCases from "@/data/use-cases.json";
import queries from "@/tests/search-queries.json";
import { frameworks } from "@/lib/data";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp";

export const metadata: Metadata = {
  title: "สถาปัตยกรรมระบบ",
  description: "เว็บเข็มทิศกรอบความคิดสร้างอย่างไร: static site บน GitHub Pages, ค้นหาด้วยโมเดล AI ในเบราว์เซอร์, แอปมือถือ และเส้นทางของเนื้อหา",
};

const REPO = "https://github.com/ppongsakorn/management-framework";

const phraseCount = Object.values(phrases as Record<string, string[]>).reduce((s, l) => s + l.length, 0);
const n: ArchNumbers = {
  frameworks: frameworks.length,
  cases: Object.values(useCases as Record<string, unknown[]>).reduce((s, l) => s + l.length, 0),
  phrases: phraseCount,
  vectors: frameworks.length + phraseCount,
  queries: (queries as unknown[]).length,
};

const STACK: [string, string, string][] = [
  ["Framework", "Next.js 16 (App Router) · React 19 · TypeScript", "โหมด static export สำหรับ GitHub Pages และโหมด server สำหรับ AI"],
  ["หน้าตา", "CSS ล้วน + design tokens · IBM Plex Sans Thai", "สีตามกลุ่ม รองรับ dark mode ไม่ใช้ UI framework"],
  ["แผนภาพ", "SVG ที่ render ตอน build (scripts/diagram-renderer.mjs)", "16 แบบ เช่น matrix, flow, fishbone · ไม่มี JS ฝั่งผู้ใช้"],
  ["ค้นหาตามคำ", "MiniSearch (BM25) + Intl.Segmenter('th')", "ตัดคำไทยด้วยเบราว์เซอร์ ไม่ต้องโหลดพจนานุกรม"],
  ["ค้นหาตามความหมาย", "multilingual-e5-small (int8 ONNX, MIT) · Transformers.js 4 · ONNX Runtime Web", "ตัด vocab จาก 250k เหลือ 32.5k คำย่อย ผลตัดคำเหมือนต้นฉบับ"],
  ["WebMCP", "document.modelContext (W3C WebML CG draft)", `ลงทะเบียน ${WEBMCP_TOOL_COUNT} tool แบบอ่านอย่างเดียวให้ AI agent ในเบราว์เซอร์เรียก ค้นหา/อ่านเนื้อหา/เปรียบเทียบ/ลำดับการใช้/กรณีจริง/รู้ว่าผู้ใช้ดูอะไรอยู่`],
  ["CI/CD", "GitHub Actions → GitHub Pages", "push เข้า main = ทดสอบ, สร้างโมเดล, ประเมินผล, deploy อัตโนมัติ"],
  ["AI (ทางเลือก)", "Anthropic SDK · claude-opus-5-5 · Microsoft Foundry", "prompt caching, effort ปรับได้, rate limit ต่อ IP"],
  ["ทดสอบ", "node:test · eval 80 คำค้นแบบ blind", "ตรวจข้อมูลทุกไฟล์ และวัดคะแนนค้นหา (hit@k, MRR) ทุกครั้งที่ deploy"],
];

const DECISIONS: [string, string][] = [
  ["Static ก่อน", "ทุกหน้า render เป็น HTML ตอน build จึงโฮสต์ฟรีบน GitHub Pages เร็ว และไม่มี server ให้ดูแลหรือถูกโจมตี"],
  ["AI ค้นหาในเบราว์เซอร์", "คำค้นไม่ออกจากเครื่องผู้ใช้ ไม่มีค่า API ต่อครั้ง และใช้งานได้แม้ไม่มี backend — แลกกับการโหลดโมเดล ~25 MB ครั้งแรก (ครั้งต่อไปมาจาก cache)"],
  ["เวกเตอร์คำนวณล่วงหน้า", `เนื้อหาทั้ง ${n.vectors.toLocaleString("en-US")} ชิ้นถูกแปลงเป็นเวกเตอร์ int8 ตอน build เบราว์เซอร์จึงคำนวณแค่คำค้นของผู้ใช้`],
  ["Web Worker", "โมเดลทำงานนอก main thread หน้าเว็บจึงไม่ค้างขณะโหลดโมเดลหรือคำนวณ"],
  ["ไม่ให้ผู้ใช้รอ", "แสดงผลค้นตามคำทันทีเสมอ ผลที่รวมความหมายจะใช้เมื่อพร้อม และไม่สลับรายการที่ผู้ใช้กำลังดู"],
  ["วัดผลก่อนเลือก", "สร้างการค้นหา 4 แบบ deploy แยก /v1–/v3 แล้ววัดด้วยคำค้นทดสอบ 80 ข้อและให้ AI ตัดสินแบบ blind"],
  ["JSON เป็นแหล่งเดียว", "เนื้อหา กรณีจริง วลีค้นหา และประวัติอัปเดตเป็นไฟล์ JSON ใน git ตรวจด้วย npm test ทุกครั้งก่อน deploy"],
  ["หน้ามือถือแยก", "/mobile มีหน้าจอของตัวเองแต่ใช้ข้อมูลชุดเดียวกัน แทนการบีบหน้า desktop ให้เล็กลง"],
  ["AI เป็นส่วนเสริม", "ที่ปรึกษา AI แยกเป็นโหมด server เปิดเมื่อมี API key โดยไม่กระทบเว็บ static"],
];

export default function ArchitecturePage() {
  return (
    <div className="arch">
      <div className="page-head">
        <h1>สถาปัตยกรรมระบบ</h1>
        <p>
          เว็บนี้สร้างแบบ static-first: เนื้อหาเป็นไฟล์ JSON ใน git ทุกครั้งที่ push จะถูกทดสอบ สร้างโมเดลค้นหา และ deploy เป็นไฟล์ static
          บน GitHub Pages ส่วนการค้นหาด้วย AI ทำงานในเบราว์เซอร์ของผู้ใช้เอง
        </p>
      </div>

      <dl className="arch-stats">
        <div><dt>Framework</dt><dd>{n.frameworks}</dd></div>
        <div><dt>กรณีจริง</dt><dd>{n.cases.toLocaleString("en-US")}</dd></div>
        <div><dt>เวกเตอร์ค้นหา</dt><dd>{n.vectors.toLocaleString("en-US")}</dd></div>
        <div><dt>โมเดลในเบราว์เซอร์</dt><dd>~25 MB</dd></div>
        <div><dt>ค่าโฮสต์</dt><dd>0 บาท</dd></div>
      </dl>

      <h2>1. ภาพรวมระบบ</h2>
      <p>
        ข้อมูลทั้งหมดอยู่ใน repo เมื่อ push เข้า <code>main</code> GitHub Actions จะทดสอบ render แผนภาพเป็น SVG สร้างโมเดลค้นหาภาษาไทยและเวกเตอร์
        ประเมินคุณภาพการค้นหา แล้ว build เว็บ 5 ชุด (เว็บหลักซึ่งใช้การค้นหา v3 และเวอร์ชันเปรียบเทียบ /v0–/v3) ขึ้น GitHub Pages ทั้งหมดใช้เวลาไม่กี่นาที
      </p>
      <SystemDiagram n={n} />

      <h2>2. การค้นหา</h2>
      <p>
        ผู้ใช้พิมพ์สถานการณ์ด้วยภาษาตัวเอง ระบบค้นสองทางพร้อมกัน: ค้นตามคำและวลีสถานการณ์ (ทันที) กับค้นตามความหมายด้วยโมเดล e5 ใน Web Worker
        แล้วรวมอันดับด้วย Reciprocal Rank Fusion ผลทดสอบล่าสุดกับคำค้น 100 ข้อ: v2 MRR 0.87, v3 MRR 0.91 เว็บหลักใช้ v3 ผู้ใช้ที่เปิดโหมดประหยัดเน็ตจะไม่โหลดโมเดลล่วงหน้า แต่เริ่มโหลดเมื่อค้นครั้งแรกและได้ผลแบบ v2 ระหว่างรอ —{" "}
        <Link href="/compare">ดูหน้าเปรียบเทียบ</Link>
      </p>
      <SearchDiagram n={n} />

      <h2>3. หน้าเว็บและหน้ามือถือ</h2>
      <p>
        หน้า desktop อยู่ใน <code>app/(site)</code> และแอปมือถืออยู่ใน <code>app/mobile</code> ใช้ข้อมูลและคอมโพเนนต์ร่วมกัน ต่างกันที่โครงหน้าจอ
      </p>
      <RoutingDiagram />

      <h2>4. เนื้อหาและการอัปเดต</h2>
      <p>กรณีจริงทุกกรณีผ่านการตรวจแหล่งอ้างอิง แล้วถูกใช้ซ้ำในสามที่ ส่วนประวัติการอัปเดตเขียนครั้งเดียวแสดงได้ทุกหน้าจอ</p>
      <ContentDiagram />

      <h2 id="webmcp">5. WebMCP: ให้ AI agent เรียกใช้เว็บเป็นเครื่องมือ</h2>
      <p>
        ทุกหน้าลงทะเบียนเครื่องมือผ่าน <code>document.modelContext</code> ตามร่างมาตรฐาน WebMCP เพื่อให้ agent ในเบราว์เซอร์ (เช่น Edge Canary เปิด flag{" "}
        <code>enable-webmcp-testing</code>) ค้นหาและอ่านเนื้อหาแบบมีโครงสร้างแทนการอ่านหน้าจอ เครื่องมือทั้งหมดอ่านอย่างเดียวและติดป้าย{" "}
        <code>readOnlyHint</code> เบราว์เซอร์ที่ไม่รองรับจะไม่เห็นอะไรเปลี่ยนและไม่ต้องโหลดข้อมูลเพิ่ม เพราะข้อมูลของ tool (framework กรณีจริง วลีค้นหา) ถูกโหลดแบบ lazy เฉพาะเมื่อมี agent เรียกใช้จริง
      </p>
      <div className="arch-table">
        <table>
          <thead>
            <tr><th>Tool</th><th>รับ</th><th>คืน</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">search_frameworks</th><td>สถานการณ์เป็นภาษาคน</td><td>framework ที่ตรง พร้อมวลีที่ตรงและ URL จัดอันดับเหมือนช่องค้นหาบนหน้าจอ (วลี + โมเดลความหมาย v3 เมื่อโหลดเสร็จ ถ้ายังไม่เสร็จตอบทันทีด้วยผลแบบวลีและบอกสถานะ)</td></tr>
            <tr><th scope="row">get_current_page</th><td>—</td><td>หน้าที่ผู้ใช้กำลังดู: ชนิดหน้า framework/กลุ่ม คำค้น ตัวกรอง แท็บบนมือถือ และ framework ที่เห็นในผลลัพธ์</td></tr>
            <tr><th scope="row">list_frameworks</th><td>กลุ่ม (ไม่บังคับ)</td><td>รายการทั้งหมดพร้อม "ใช้เมื่อ"</td></tr>
            <tr><th scope="row">get_framework</th><td>slug</td><td>ขั้นตอน 5 ข้อ ตัวอย่าง แนวคิดต้นทาง</td></tr>
            <tr><th scope="row">compare_frameworks</th><td>2–3 slug</td><td>ตารางเทียบ ใช้เมื่อ / วิธี / ขั้นตอน / ตัวอย่าง / ต้นทาง พร้อมความสัมพันธ์ระหว่างกัน</td></tr>
            <tr><th scope="row">suggest_sequence</th><td>slug</td><td>ลำดับการใช้ ใช้ก่อน / ใช้คู่ / ใช้ต่อ พร้อม "ใช้เมื่อ" และ URL ของแต่ละตัว</td></tr>
            <tr><th scope="row">list_use_cases</th><td>slug</td><td>กรณีจริงพร้อมเหตุการณ์ ผลลัพธ์ และลิงก์อ้างอิง (ติดป้าย untrustedContentHint เพราะมีข้อความจากแหล่งภายนอก)</td></tr>
            <tr><th scope="row">search_use_cases</th><td>ประเทศ / องค์กร / slug / คำสำคัญ</td><td>กรณีจริงข้ามทุก framework (ไม่ใส่อะไรจะได้ภาพรวมจำนวนตามประเทศ)</td></tr>
            <tr><th scope="row">show_in_catalogue</th><td>คำค้น + กลุ่ม</td><td>พาผู้ใช้ไปแคตตาล็อกพร้อมคำค้นและกลุ่มใน URL (<code>?q=…&amp;g=…</code>) แชร์และรีโหลดได้</td></tr>
            <tr><th scope="row">open_framework</th><td>slug</td><td>พาแท็บนี้ไปหน้านั้น</td></tr>
          </tbody>
        </table>
      </div>

      <h2>6. เทคโนโลยีที่ใช้</h2>
      <div className="arch-table">
        <table>
          <thead>
            <tr><th>ส่วน</th><th>เทคโนโลยี</th><th>หมายเหตุ</th></tr>
          </thead>
          <tbody>
            {STACK.map(([a, b, c]) => (
              <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>7. การตัดสินใจเชิงสถาปัตยกรรม</h2>
      <ul className="arch-decisions">
        {DECISIONS.map(([t, d]) => (
          <li key={t}><b>{t}</b><span>{d}</span></li>
        ))}
      </ul>

      <h2>8. โครงสร้างโค้ด</h2>
      <pre className="arch-tree">{`app/(site)/        เว็บ desktop: หน้าแรก, frameworks, updates, compare, architecture
app/mobile/        แอปมือถือ: หน้าแรก, search, g/[group], f/[slug], updates
app/api/chat/      ที่ปรึกษา AI (เฉพาะโหมด server)
components/        Catalog, Diagram, UseCases, Changelog, WebMcp, mobile/*, arch/*
lib/search/        tokenize, lexical (BM25 + วลี), semantic, worker, RRF
data/              frameworks · use-cases · search-phrases · changelog (.json)
scripts/           render แผนภาพ, ตัดโมเดล, สร้างเวกเตอร์, ประเมินผล
tests/             ตรวจข้อมูล + คำค้นทดสอบ 80 ข้อ
.github/workflows/ build + deploy GitHub Pages`}</pre>
      <p className="muted">
        ซอร์สโค้ดทั้งหมดเปิดอยู่ที่{" "}
        <a href={REPO} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        พร้อม README อธิบายการติดตั้งและการเพิ่มเนื้อหา
      </p>
    </div>
  );
}
