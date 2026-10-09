import { Arrow, Box, Fig, Lane, Note } from "@/components/arch/svg";

export interface ArchNumbers {
  frameworks: number;
  cases: number;
  phrases: number;
  vectors: number;
  queries: number;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** Repo → GitHub Actions → GitHub Pages → browser, plus the optional server mode. */
export function SystemDiagram({ n }: { n: ArchNumbers }) {
  const id = "sys";
  const W = 205, X = [10, 255, 500, 745];
  const rows = (i: number) => 64 + i * 56;
  return (
    <Fig id={id} h={530} title="ภาพรวมระบบ: ข้อมูลใน repo ถูก build บน GitHub Actions แล้วเผยแพร่เป็นไฟล์ static บน GitHub Pages ให้เบราว์เซอร์ทำงานเอง รวมถึงเปิดเครื่องมือ WebMCP ให้ AI agent">
      <Lane x={X[0] - 6} y={4} w={W + 12} h={346} t="1 ข้อมูลใน repo" s="JSON คือแหล่งความจริงเดียว" tone="plan" />
      <Lane x={X[1] - 6} y={4} w={W + 12} h={346} t="2 GitHub Actions" s="รันทุกครั้งที่ push เข้า main" tone="dec" />
      <Lane x={X[2] - 6} y={4} w={W + 12} h={346} t="3 GitHub Pages" s="ไฟล์ static ผ่าน CDN + HTTPS" tone="exec" />
      <Lane x={X[3] - 6} y={4} w={W + 12} h={346} t="4 เบราว์เซอร์ผู้ใช้" s="ประมวลผลในเครื่อง ไม่ส่งคำค้นออก" tone="ppl" />

      <Box x={X[0]} y={rows(0)} w={W} t="frameworks.json" s={`${n.frameworks} framework + spec แผนภาพ`} tone="plan" />
      <Box x={X[0]} y={rows(1)} w={W} t="use-cases.json" s={`${fmt(n.cases)} กรณีจริง + แหล่งอ้างอิง`} tone="plan" />
      <Box x={X[0]} y={rows(2)} w={W} t="search-phrases.json" s={`${fmt(n.phrases)} วลีสถานการณ์`} tone="plan" />
      <Box x={X[0]} y={rows(3)} w={W} t="changelog.json" s="ประวัติการอัปเดต" tone="plan" />
      <Box x={X[0]} y={rows(4)} w={W} t="search-queries.json" s={`${n.queries} คำค้นทดสอบแบบ blind`} tone="plan" />

      <Box x={X[1]} y={rows(0)} w={W} t="npm test" s="ตรวจความครบของข้อมูล" tone="dec" />
      <Box x={X[1]} y={rows(1)} w={W} t="render-diagrams" s="spec → SVG ล่วงหน้า" tone="dec" />
      <Box x={X[1]} y={rows(2)} w={W} t="build-search-model" s="ตัด vocab e5 เหลือ 34.8 MB" tone="dec" />
      <Box x={X[1]} y={rows(3)} w={W} t="search:index + eval" s={`${fmt(n.vectors)} เวกเตอร์ + คะแนน`} tone="dec" />
      <Box x={X[1]} y={rows(4)} w={W} t="next build × 4" s="root (v0) · v1 · v2 · v3" tone="dec" strong />

      <Box x={X[2]} y={rows(0)} w={W} t="/  เว็บหลัก (desktop)" s="HTML ที่ render ไว้แล้ว" tone="exec" />
      <Box x={X[2]} y={rows(1)} w={W} t="/mobile  แอปมือถือ" s="หน้าจอแยกสำหรับมือถือ" tone="exec" />
      <Box x={X[2]} y={rows(2)} w={W} t="/v1 /v2 /v3 + /compare" s="เวอร์ชันทดลองการค้นหา" tone="exec" />
      <Box x={X[2]} y={rows(3)} w={W} t="/models/e5-small-th" s="ONNX int8 · gzip ~25 MB" tone="exec" />
      <Box x={X[2]} y={rows(4)} w={W} t="/search/vectors.json" s="เวกเตอร์ int8 ที่คำนวณไว้" tone="exec" />

      <Box x={X[3]} y={rows(0)} w={W} t="หน้าเว็บ (React)" s="ไม่มี server · ไม่มี database" tone="ppl" />
      <Box x={X[3]} y={rows(1)} w={W} t="ค้นหาตามคำ + วลี" s="BM25 + phrase · main thread" tone="ppl" />
      <Box x={X[3]} y={rows(2)} w={W} t="Web Worker" s="Transformers.js + ONNX (wasm)" tone="ppl" strong />
      <Box x={X[3]} y={rows(3)} w={W} t="jsDelivr CDN" s="ONNX Runtime wasm ~5.5 MB" tone="ppl" />
      <Box x={X[3]} y={rows(4)} w={W} t="WebMCP tools" s="document.modelContext · 5 tools" tone="ppl" strong />

      {[0, 1, 2].map((i) => (
        <Arrow key={i} id={id} d={`M${X[i] + W + 8} 190 H${X[i + 1] - 9}`} />
      ))}
      <Note x={X[0] + W + 28} y={180} anchor="middle">push</Note>
      <Note x={X[1] + W + 28} y={180} anchor="middle">deploy</Note>
      <Note x={X[2] + W + 28} y={180} anchor="middle">HTTPS</Note>

      <rect x={4} y={372} width={952} height={152} rx={12} fill="none" stroke="var(--line)" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={18} y={396} fontSize={13.5} fontWeight={700} fill="var(--think)">
        โหมด server (ทางเลือก) — เปิดที่ปรึกษา AI
      </text>
      <Note x={18} y={414}>เว็บบน GitHub Pages ปิดส่วนนี้ไว้ เพราะต้องมี server เก็บ API key</Note>
      <Box x={18} y={436} w={185} h={56} t="Next.js standalone" s="next start / Docker" tone="think" />
      <Box x={243} y={436} w={185} h={56} t="/api/chat" s="rate limit ต่อ IP · stream" tone="think" />
      <Box x={468} y={436} w={210} h={56} t="System prompt" s="แคตตาล็อก + กรณีจริง · prompt cache" tone="think" />
      <Box x={718} y={428} w={225} h={36} t="Claude API (claude-opus-5-5)" tone="think" strong />
      <Box x={718} y={472} w={225} h={36} t="หรือ Microsoft Foundry" tone="think" />
      <Arrow id={id} d="M205 464 H241" />
      <Arrow id={id} d="M430 464 H466" />
      <Arrow id={id} d="M680 458 L716 446" />
      <Arrow id={id} d="M680 470 L716 488" />
    </Fig>
  );
}

/** Query → lexical and semantic rankings → reciprocal-rank fusion. */
export function SearchDiagram({ n }: { n: ArchNumbers }) {
  const id = "srch";
  return (
    <Fig id={id} h={370} title="การค้นหา: ค้นตามคำและวลีบน main thread และค้นตามความหมายใน Web Worker แล้วรวมอันดับด้วย RRF">
      <Box x={10} y={140} w={100} h={56} t="คำค้น" s="ภาษาคน" strong tone="ink" />
      <Arrow id={id} d="M110 168 H118 V88 H128" />
      <Arrow id={id} d="M110 168 H118 V248 H128" />

      <text x={130} y={42} fontSize={13} fontWeight={700} fill="var(--plan)">ค้นตามคำ — main thread, ทันที</text>
      <Box x={130} y={60} w={165} h={56} t="ตัดคำไทย" s="Intl.Segmenter + stopwords" tone="plan" />
      <Box x={315} y={60} w={165} h={56} t="BM25  (v1)" s="MiniSearch · ถ่วงชื่อ/ใช้เมื่อ" tone="plan" />
      <Box x={500} y={60} w={165} h={56} t="วลีสถานการณ์  (v2)" s={`${fmt(n.phrases)} วลี → บอกเหตุผล`} tone="plan" />
      <Arrow id={id} d="M295 88 H313" />
      <Arrow id={id} d="M480 88 H498" />

      <text x={130} y={300} fontSize={13} fontWeight={700} fill="var(--ppl)">ค้นตามความหมาย — Web Worker (v3)</text>
      <Box x={130} y={220} w={165} h={56} t="e5-small int8" s="'query:' + ข้อความ" tone="ppl" strong />
      <Box x={315} y={220} w={165} h={56} t="เวกเตอร์ 384 มิติ" s="normalize" tone="ppl" />
      <Box x={500} y={220} w={165} h={56} t="cosine" s={`กับ ${fmt(n.vectors)} เวกเตอร์ที่คำนวณไว้`} tone="ppl" />
      <Arrow id={id} d="M295 248 H313" />
      <Arrow id={id} d="M480 248 H498" />

      <Arrow id={id} d="M665 88 H765 V138" />
      <Arrow id={id} d="M665 248 H765 V198" />
      <Box x={700} y={140} w={130} h={56} t="RRF  k=60" s="รวมสองอันดับ" tone="dec" strong />
      <Arrow id={id} d="M830 168 H848" />
      <Box x={850} y={140} w={100} h={56} t="ผลลัพธ์" s="+ 'ตรงกับ…'" tone="exec" strong />

      <Note x={10} y={334}>• โมเดลโหลดเงียบ ๆ ตอนหน้าเว็บว่าง (requestIdleCallback) และข้ามเมื่อเปิดโหมดประหยัดเน็ต</Note>
      <Note x={10} y={356}>• ถ้าผลรวมช้าเกิน 100 ms แสดงผลค้นตามคำก่อน และไม่สลับรายการที่แสดงอยู่ — ผู้ใช้จึงไม่ต้องรอ</Note>
    </Fig>
  );
}

/** How a visit is routed to the desktop pages or the phone app. */
export function RoutingDiagram() {
  const id = "route";
  return (
    <Fig id={id} h={200} title="การแยกหน้ามือถือ: สคริปต์ inline ตรวจขนาดจอก่อนแสดงผลแล้วพาไปหน้ามือถือที่ตรงกัน">
      <Box x={10} y={70} w={150} h={56} t="เปิด URL ใดก็ได้" s="เช่น /frameworks/pdca/" tone="ink" strong />
      <Arrow id={id} d="M160 98 H198" />
      <Box x={200} y={62} w={300} h={72} t="จอ ≤ 760px และยังไม่เลือกเว็บเต็ม?" s="สคริปต์ inline ทำงานก่อน paint (lib/mobile.ts)" tone="dec" strong />
      <Arrow id={id} d="M500 86 H560 V44 H598" label="ใช่" lx={530} ly={78} />
      <Arrow id={id} d="M500 112 H560 V154 H598" label="ไม่" lx={530} ly={130} />
      <Box x={600} y={16} w={350} h={56} t="/mobile/f/pdca/  — แอปมือถือ" s="app/mobile · แถบเมนูล่าง · แท็บ" tone="ppl" strong />
      <Box x={600} y={126} w={350} h={56} t="/frameworks/pdca/  — เว็บ desktop" s="app/(site) · header + footer" tone="exec" strong />
      <Note x={10} y={194}>แตะ "เว็บเต็ม" ในแอป = จำค่า view=full ใน localStorage · ลิงก์ "เปิดแบบแอปมือถือ" ท้ายหน้าเว็บ = ล้างค่า</Note>
    </Fig>
  );
}

/** Research → verified data → every surface that uses it. */
export function ContentDiagram() {
  const id = "cont";
  return (
    <Fig id={id} h={270} title="เส้นทางของเนื้อหา: งานวิจัยกลายเป็นข้อมูล JSON ที่ถูกใช้ทั้งในหน้าเว็บ ที่ปรึกษา AI และระบบค้นหา">
      <Box x={10} y={40} w={180} h={56} t="Deep research" s="agent ค้นหลายภาษา" tone="think" />
      <Box x={220} y={40} w={190} h={56} t="ตรวจแหล่งอ้างอิง" s="เปิดอ่านจริง · ติดป้ายเหตุการณ์" tone="think" />
      <Box x={440} y={40} w={160} h={56} t="use-cases.json" s="+ npm test" tone="plan" strong />
      <Arrow id={id} d="M190 68 H218" />
      <Arrow id={id} d="M410 68 H438" />
      <Box x={650} y={4} w={300} h={44} t="หน้า framework: กรณีจริง + ลิงก์อ้างอิง" tone="exec" />
      <Box x={650} y={56} w={300} h={44} t="ที่ปรึกษา AI: ยกกรณีจริง ห้ามแต่งเอง" tone="exec" />
      <Box x={650} y={108} w={300} h={44} t="ค้นหา: วลีปัญหา → เวกเตอร์" tone="exec" />
      <Arrow id={id} d="M600 60 H622 V26 H648" />
      <Arrow id={id} d="M600 72 H648" />
      <Arrow id={id} d="M600 84 H622 V130 H648" />

      <Box x={220} y={190} w={190} h={56} t="ทุกครั้งที่แก้เนื้อหา" s="เพิ่มรายการบนสุด" tone="think" />
      <Box x={440} y={190} w={160} h={56} t="changelog.json" s="+ npm test" tone="plan" strong />
      <Box x={650} y={196} w={300} h={44} t="/updates · หน้าแรก · แท็บอัปเดตในแอป" tone="exec" />
      <Arrow id={id} d="M410 218 H438" />
      <Arrow id={id} d="M600 218 H648" />
    </Fig>
  );
}
