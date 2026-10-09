import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chat } from "@/components/Chat";
import { Diagram } from "@/components/Diagram";
import { UseCases } from "@/components/UseCases";
import { frameworks, frameworksIn, getDiagram, getFramework, getGroup, getUseCases } from "@/lib/data";
import { aiEnabled } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return frameworks.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const fw = getFramework((await params).slug);
  if (!fw) return {};
  return { title: fw.name, description: `ใช้เมื่อ ${fw.when} — ${fw.how}` };
}

export default async function FrameworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const fw = getFramework((await params).slug);
  if (!fw) notFound();
  const group = getGroup(fw.group);
  const svg = getDiagram(fw.slug);
  const cases = getUseCases(fw.slug);
  const siblings = frameworksIn(fw.group).filter((f) => f.slug !== fw.slug);
  const idx = frameworks.findIndex((f) => f.slug === fw.slug);
  const prev = frameworks[idx - 1];
  const next = frameworks[idx + 1];

  const starters = [
    {
      label: "ปรับขั้นตอนให้เข้ากับทีมของฉัน (เติมบริบทก่อนส่ง)",
      prompt: `ช่วยปรับขั้นตอน ${fw.name} ให้เข้ากับงานของฉัน\nทีม/บทบาท: \nสถานการณ์ที่เจอ: \nเป้าหมาย: `,
      prefill: true,
    },
    { label: `ขอตัวอย่างอื่นของ ${fw.name} อีก 2 แบบ`, prompt: `ขอตัวอย่างการใช้ ${fw.name} อีก 2 แบบ ในบริบทที่ต่างกัน พร้อมผลลัพธ์ที่ได้` },
    { label: "ทำเป็นเทมเพลตสำหรับประชุม/นำเสนอ", prompt: `ทำ ${fw.name} เป็นเทมเพลตพร้อมใช้ในการประชุม 1 ชั่วโมง: วาระ, ตาราง/แบบฟอร์ม, และคำถามนำ` },
    { label: "ข้อผิดพลาดที่พบบ่อยเวลาใช้", prompt: `ข้อผิดพลาดที่พบบ่อยเวลาใช้ ${fw.name} คืออะไร และป้องกันอย่างไร` },
    { label: "ควรใช้คู่กับ framework ไหน", prompt: `${fw.name} ควรใช้คู่กับ framework ไหนก่อนหรือหลัง เพื่อให้ได้ผลจริง` },
  ];

  return (
    <div className={`g-${fw.group}`}>
      <nav className="crumbs" aria-label="breadcrumb">
        <Link href="/frameworks">Frameworks</Link> / <Link href={`/frameworks#${group.id}`}>{group.title}</Link> / {fw.name}
      </nav>

      <header className="fw-head">
        <span className="tag">
          <span className="dot" />
          {group.title} — {group.question}
        </span>
        <h1>{fw.name}</h1>
        <div className="when">{fw.when}</div>
        <p className="how">{fw.how}</p>
        {aiEnabled && (
          <a href="#ask-ai" className="jump-ai">
            ถาม AI เกี่ยวกับ {fw.name} ↓
          </a>
        )}
      </header>

      <div className={aiEnabled ? "fw-layout" : "fw-layout solo"}>
        <article className="fw-main">
          {svg && (
            <>
              <h2>แผนภาพตัวอย่าง</h2>
              <Diagram svg={svg} title={fw.name} group={fw.group} />
            </>
          )}

          <h2>ขั้นตอนลงมือทำ</h2>
          <ol className="steps">
            {fw.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <h2>ตัวอย่างสถานการณ์</h2>
          <p className="example">{fw.example}</p>
          <p className="source">แนวคิดจาก: {fw.origin}</p>

          {cases.length > 0 && (
            <>
              <h2>เคยถูกใช้แก้ปัญหาจริงที่ไหนบ้าง</h2>
              <UseCases cases={cases} />
            </>
          )}

          <h2>ตัวอื่นในกลุ่ม &quot;{group.title}&quot;</h2>
          <div className="related">
            {siblings.map((f) => (
              <Link key={f.slug} href={`/frameworks/${f.slug}`}>
                {f.name}
                <span>{f.when}</span>
              </Link>
            ))}
          </div>

          <nav className="pager" aria-label="ก่อนหน้า / ถัดไป">
            {prev ? <Link href={`/frameworks/${prev.slug}`}>← {prev.name}</Link> : <span />}
            {next ? <Link href={`/frameworks/${next.slug}`}>{next.name} →</Link> : <span />}
          </nav>
        </article>

        {aiEnabled && (
        <Chat
          key={fw.slug}
          id="ask-ai"
          variant="side"
          slug={fw.slug}
          title="ที่ปรึกษา AI"
          subtitle={`ช่วยนำ ${fw.name} ไปใช้กับงานจริง`}
          intro={`ถามอะไรก็ได้เกี่ยวกับ ${fw.name} หรือเล่าสถานการณ์ของคุณให้ช่วยปรับใช้`}
          starters={starters}
        />
        )}
      </div>
    </div>
  );
}
