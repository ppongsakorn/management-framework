"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearch } from "@/components/useSearch";
import type { Framework } from "@/lib/data";
import { assetBase, searchVariant } from "@/lib/site";

// Phones type whole situations, which substring matching (v0) can't handle; v2 needs no model download.
const variant = searchVariant === "v0" ? "v2" : searchVariant;

const EXAMPLES = ["งานล้นมือ ทุกอย่างด่วนหมด", "ทีมใหม่เถียงกันทุกเรื่อง", "ปัญหาเดิมกลับมาอีก", "เลือก vendor ไม่ถูก", "โปรเจกต์ช้ากว่าแผน", "ลงทุนไปเยอะแล้ว ไม่อยากหยุด"];

/** Full-screen search: the field sits at the top, results are tappable rows. */
export function MSearch({ frameworks }: { frameworks: Framework[] }) {
  const [query, setQuery] = useState("");
  const { hits } = useSearch(variant, frameworks, query, assetBase);
  const bySlug = useMemo(() => new Map(frameworks.map((f) => [f.slug, f])), [frameworks]);
  const q = query.trim();
  const rows = q && hits ? hits.slice(0, 15).map((h) => ({ fw: bySlug.get(h.slug)!, why: h.why })).filter((r) => r.fw) : [];

  return (
    <>
      <header className="m-top m-searchbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เล่าสิ่งที่เจอ…"
          aria-label="ค้นหากรอบความคิด"
          autoFocus
          enterKeyHint="search"
        />
        {query && (
          <button type="button" className="m-clear" onClick={() => setQuery("")}>
            ล้าง
          </button>
        )}
      </header>
      <main className="m-screen">
        {!q && (
          <>
            <p className="m-lead">พิมพ์สถานการณ์ที่เจอด้วยภาษาตัวเอง หรือแตะตัวอย่าง</p>
            <div className="m-chips">
              {EXAMPLES.map((e) => (
                <button key={e} type="button" className="m-chip" onClick={() => setQuery(e)}>
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
        {q && hits && !rows.length && <p className="m-lead">ไม่พบกรอบความคิดที่ตรง ลองเล่าด้วยคำอื่น</p>}
        {rows.length > 0 && (
          <ul className="m-list">
            {rows.map(({ fw, why }) => (
              <li key={fw.slug} className={`g-${fw.group}`}>
                <Link href={`/mobile/f/${fw.slug}`} className="m-row">
                  <span className="m-swatch" />
                  <span className="m-row-main">
                    <b>{fw.name}</b>
                    <small>{fw.when}</small>
                    {why && <small className="m-why">ตรงกับ “{why}”</small>}
                  </span>
                  <span className="m-chev" aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
