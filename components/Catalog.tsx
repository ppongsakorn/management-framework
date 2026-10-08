"use client";

import { useEffect, useMemo, useState } from "react";
import { FrameworkCard } from "@/components/FrameworkCard";
import type { Framework, Group, GroupId } from "@/lib/data";

export function Catalog({ groups, frameworks }: { groups: Group[]; frameworks: Framework[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<GroupId | "all">("all");

  // Deep links like /frameworks#plan (from the compass) preselect a group.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (groups.some((g) => g.id === id)) setActive(id as GroupId);
  }, [groups]);

  const index = useMemo(
    () =>
      new Map(
        frameworks.map((f) => [f.slug, [f.name, f.when, f.how, f.example, f.origin, ...f.steps].join(" ").toLowerCase()]),
      ),
    [frameworks],
  );

  const q = query.trim().toLowerCase();
  const visible = frameworks.filter(
    (f) => (active === "all" || f.group === active) && (!q || index.get(f.slug)!.includes(q)),
  );

  return (
    <>
      <div className="tools">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา เช่น ลำดับความสำคัญ, ประชุม, ทีมใหม่, ค่าใช้จ่าย, dashboard …"
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
          {q || active !== "all" ? `พบ ${visible.length} กรอบความคิด` : `ทั้งหมด ${frameworks.length} กรอบความคิด ใน ${groups.length} กลุ่ม`}
        </div>
      </div>

      {groups.map((g) => {
        const items = visible.filter((f) => f.group === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} id={g.id} className={`group g-${g.id}`}>
            <header>
              <h2>{g.title}</h2>
              <span className="q">{g.question}</span>
            </header>
            <p className="why">{g.why}</p>
            <div className="grid">
              {items.map((f) => (
                <FrameworkCard key={f.slug} fw={f} />
              ))}
            </div>
          </section>
        );
      })}
      {!visible.length && <p className="empty">ไม่พบกรอบความคิดที่ตรงกับคำค้น — ลองเล่าสถานการณ์ให้ที่ปรึกษา AI ฟังแทน</p>}
    </>
  );
}
