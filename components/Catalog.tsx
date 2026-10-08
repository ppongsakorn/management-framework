"use client";

import { useEffect, useMemo, useState } from "react";
import { FrameworkCard } from "@/components/FrameworkCard";
import { SemanticStatus } from "@/components/SemanticStatus";
import { useSearch } from "@/components/useSearch";
import type { Framework, Group, GroupId } from "@/lib/data";
import { aiEnabled, assetBase, searchVariant } from "@/lib/site";

const RESULT_LIMIT = 12;

export function Catalog({ groups, frameworks }: { groups: Group[]; frameworks: Framework[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<GroupId | "all">("all");
  const { hits, semState, progress, pending } = useSearch(searchVariant, frameworks, query, assetBase);
  const bySlug = useMemo(() => new Map(frameworks.map((f) => [f.slug, f])), [frameworks]);

  // Deep links like /frameworks#plan (from the compass) preselect a group.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (groups.some((g) => g.id === id)) setActive(id as GroupId);
  }, [groups]);

  const inGroup = (f: Framework) => active === "all" || f.group === active;
  // v0 keeps the original behaviour (filter, catalogue order); v1+ show a ranked list.
  const ranked = searchVariant !== "v0" && (hits !== null || pending);
  const matched = hits ? new Set(hits.map((h) => h.slug)) : null;
  const visible = ranked
    ? (hits ?? []).map((h) => ({ fw: bySlug.get(h.slug)!, why: h.why })).filter((r) => r.fw && inGroup(r.fw)).slice(0, RESULT_LIMIT)
    : frameworks.filter((f) => inGroup(f) && (!matched || matched.has(f.slug))).map((fw) => ({ fw, why: undefined }));

  return (
    <>
      <div className="tools">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เล่าสิ่งที่เจอ เช่น งานล้นมือ, ทีมใหม่ทะเลาะกัน, ตัดสินใจเลือก vendor …"
          aria-label="ค้นหากรอบความคิด"
        />
        <div className="filters" role="group" aria-label="กรองตามกลุ่ม">
          <button type="button" className="filter" aria-pressed={active === "all"} onClick={() => setActive("all")}>
            ทั้งหมด
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`filter g-${g.id}`}
              aria-pressed={active === g.id}
              onClick={() => setActive(active === g.id ? "all" : g.id)}
            >
              <span className="dot" />
              {g.title}
            </button>
          ))}
        </div>
        <div className="count" aria-live="polite">
          {pending
            ? "กำลังค้นหา…"
            : ranked
            ? `${visible.length} framework ที่เกี่ยวข้องที่สุด เรียงตามความใกล้เคียง`
            : query.trim() || active !== "all"
              ? `พบ ${visible.length} กรอบความคิด`
              : `ทั้งหมด ${frameworks.length} กรอบความคิด ใน ${groups.length} กลุ่ม`}{" "}
          <SemanticStatus state={semState} progress={progress} />
        </div>
      </div>

      {ranked ? (
        <section className="results">
          <div className="grid">
            {visible.map(({ fw, why }) => (
              <FrameworkCard key={fw.slug} fw={fw} why={why} />
            ))}
          </div>
        </section>
      ) : (
        groups.map((g) => {
          const items = visible.filter((r) => r.fw.group === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} id={g.id} className={`group g-${g.id}`}>
              <header>
                <h2>{g.title}</h2>
                <span className="q">{g.question}</span>
              </header>
              <p className="why">{g.why}</p>
              <div className="grid">
                {items.map(({ fw }) => (
                  <FrameworkCard key={fw.slug} fw={fw} />
                ))}
              </div>
            </section>
          );
        })
      )}
      {!visible.length && !pending && (
        <p className="empty">
          ไม่พบกรอบความคิดที่ตรงกับคำค้น — ลองใช้คำอื่นที่อธิบายสถานการณ์
          {aiEnabled && " หรือเล่าให้ที่ปรึกษา AI ฟัง"}
        </p>
      )}
    </>
  );
}
