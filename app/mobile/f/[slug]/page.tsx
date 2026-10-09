import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Diagram } from "@/components/Diagram";
import { MTabs } from "@/components/mobile/MTabs";
import { MTop } from "@/components/mobile/MTop";
import { UseCases } from "@/components/UseCases";
import { frameworks, frameworksIn, getDiagram, getFramework, getGroup, getUseCases } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return frameworks.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const fw = getFramework((await params).slug);
  return fw ? { title: fw.name } : {};
}

export default async function MobileFramework({ params }: { params: Promise<{ slug: string }> }) {
  const fw = getFramework((await params).slug);
  if (!fw) notFound();
  const group = getGroup(fw.group);
  const svg = getDiagram(fw.slug);
  const cases = getUseCases(fw.slug);
  const siblings = frameworksIn(fw.group);
  const i = siblings.findIndex((f) => f.slug === fw.slug);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];

  const tabs = [
    {
      id: "steps",
      label: "ขั้นตอน",
      content: (
        <ol className="m-steps">
          {fw.steps.map((s, k) => (
            <li key={k}>{s}</li>
          ))}
        </ol>
      ),
    },
    ...(svg
      ? [
          {
            id: "diagram",
            label: "แผนภาพ",
            content: (
              <>
                <p className="m-hint">เลื่อนซ้าย-ขวาเพื่อดูส่วนที่เหลือ หรือแตะเพื่อขยายเต็มจอ แล้วหมุนจอแนวนอน</p>
                <div className="m-viz-scroll">
                  <Diagram svg={svg} title={fw.name} group={fw.group} />
                </div>
              </>
            ),
          },
        ]
      : []),
    {
      id: "example",
      label: "ตัวอย่าง",
      content: (
        <>
          <p className="m-example">{fw.example}</p>
          <p className="m-origin">แนวคิดจาก: {fw.origin}</p>
        </>
      ),
    },
    ...(cases.length
      ? [{ id: "cases", label: `กรณีจริง ${cases.length}`, content: <UseCases cases={cases} /> }]
      : []),
  ];

  return (
    <div className={`g-${fw.group}`}>
      <MTop back={{ href: `/mobile/g/${group.id}`, label: group.title }} />
      <main className="m-screen m-fw">
        <header className="m-head">
          <span className="m-tag">
            <span className="m-dot" />
            {group.title}
          </span>
          <h1>{fw.name}</h1>
          <p className="m-when">
            <b>ใช้เมื่อ</b> {fw.when}
          </p>
          <p className="m-how">{fw.how}</p>
        </header>
        <MTabs tabs={tabs} />
        <nav className="m-pager" aria-label="ก่อนหน้า / ถัดไป">
          {prev ? (
            <Link href={`/mobile/f/${prev.slug}`}>
              <small>ก่อนหน้า</small>‹ {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/mobile/f/${next.slug}`} className="next">
              <small>ถัดไป</small>
              {next.name} ›
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
    </div>
  );
}
