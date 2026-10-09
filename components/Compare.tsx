"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SemanticStatus } from "@/components/SemanticStatus";
import { useSearch } from "@/components/useSearch";
import type { Framework } from "@/lib/data";
import { VARIANTS, type Variant } from "@/lib/search/types";
import { DEFAULT_VARIANT, assetBase } from "@/lib/site";

const ORDER: Variant[] = ["v0", "v1", "v2", "v3"];
const EXAMPLES = ["งานเข้ามาเยอะจนไม่รู้จะเริ่มอะไรก่อน", "ทีมใหม่เถียงกันทุกเรื่อง", "เลือก vendor จาก 3 เจ้า", "ลูกทีมไม่กล้าบอกปัญหา", "root cause"];

type Metric = Record<"hit@1" | "hit@3" | "hit@5" | "mrr", number>;
interface Eval {
  queries: number;
  metrics: Record<string, { all: Metric; easy: Metric; medium: Metric; hard: Metric }>;
}

function Column({ variant, frameworks, query }: { variant: Variant; frameworks: Framework[]; query: string }) {
  const { hits, semState, progress } = useSearch(variant, frameworks, query, assetBase);
  const name = new Map(frameworks.map((f) => [f.slug, f]));
  return (
    <section className="cmp-col">
      <h2>{VARIANTS[variant].label}</h2>
      <p className="muted">{VARIANTS[variant].summary}</p>
      <SemanticStatus state={semState} progress={progress} />
      {!query.trim() ? (
        <p className="muted">—</p>
      ) : hits && hits.length ? (
        <ol>
          {hits.slice(0, 5).map((h) => {
            const f = name.get(h.slug)!;
            return (
              <li key={h.slug} className={`g-${f.group}`}>
                <Link href={`/frameworks/${f.slug}`}>
                  <span className="dot" /> {f.name}
                </Link>
                {h.why && <small>ตรงกับ “{h.why}”</small>}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="muted">ไม่พบผล</p>
      )}
      <a className="try" href={`${assetBase}${variant === DEFAULT_VARIANT ? "" : `/${variant}`}/frameworks/`}>
        ลองใช้ทั้งเว็บ ({variant === DEFAULT_VARIANT ? "เว็บหลัก" : `/${variant}/`}) →
      </a>
    </section>
  );
}

export function Compare({ frameworks }: { frameworks: Framework[] }) {
  const [query, setQuery] = useState("");
  const [evalData, setEvalData] = useState<Eval | null>(null);

  useEffect(() => {
    fetch(`${assetBase}/search/eval.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setEvalData)
      .catch(() => setEvalData(null));
  }, []);

  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <>
      <div className="tools">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="พิมพ์สถานการณ์ที่เจอ…" aria-label="คำค้น" />
        <div className="filters">
          {EXAMPLES.map((x) => (
            <button key={x} type="button" className="filter" onClick={() => setQuery(x)}>
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="cmp-grid">
        {ORDER.map((v) => (
          <Column key={v} variant={v} frameworks={frameworks} query={query} />
        ))}
      </div>

      {evalData && (
        <section className="panel cmp-eval">
          <h2>คะแนนจากชุดคำค้นทดสอบ ({evalData.queries} คำค้น)</h2>
          <p className="muted">
            hit@k = มี framework ที่ถูกต้องอยู่ใน k อันดับแรก · MRR = ค่าเฉลี่ยของ 1/อันดับที่เจอคำตอบถูก (1.00 = อันดับ 1 ทุกครั้ง)
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>วิธี</th>
                  <th>hit@1</th>
                  <th>hit@3</th>
                  <th>hit@5</th>
                  <th>MRR</th>
                  <th>hit@3 ง่าย</th>
                  <th>hit@3 กลาง</th>
                  <th>hit@3 ยาก</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(evalData.metrics).map(([name, m]) => (
                  <tr key={name}>
                    <td>{VARIANTS[name as Variant]?.label ?? name}</td>
                    <td>{pct(m.all["hit@1"])}</td>
                    <td>{pct(m.all["hit@3"])}</td>
                    <td>{pct(m.all["hit@5"])}</td>
                    <td>{m.all.mrr.toFixed(2)}</td>
                    <td>{pct(m.easy["hit@3"])}</td>
                    <td>{pct(m.medium["hit@3"])}</td>
                    <td>{pct(m.hard["hit@3"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
