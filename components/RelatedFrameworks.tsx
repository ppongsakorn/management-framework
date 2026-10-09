import Link from "next/link";
import type { Framework } from "@/lib/data";

const COLUMNS = [
  { key: "before", label: "ใช้ก่อน", hint: "ทำเรื่องนี้ก่อนจะได้ผลดีกว่า" },
  { key: "with", label: "ใช้คู่กัน", hint: "เสริมกันในสถานการณ์เดียวกัน" },
  { key: "after", label: "ใช้ต่อ", hint: "ขั้นถัดไปหลังจากนี้" },
] as const;

/** "Use first / alongside / next" chips. `hrefFor` lets the phone app link to its own screens. */
export function RelatedFrameworks({ fw, all, hrefFor }: { fw: Framework; all: Framework[]; hrefFor: (slug: string) => string }) {
  const bySlug = new Map(all.map((f) => [f.slug, f]));
  const cols = COLUMNS.map((c) => ({ ...c, items: (fw.related?.[c.key] ?? []).map((s) => bySlug.get(s)).filter((f): f is Framework => !!f) })).filter((c) => c.items.length);
  if (!cols.length) return null;
  return (
    <div className="related-flow">
      {cols.map((c) => (
        <div key={c.key} className={`rel-col rel-${c.key}`}>
          <div className="rel-head">
            <b>{c.label}</b>
            <small>{c.hint}</small>
          </div>
          {c.items.map((f) => (
            <Link key={f.slug} href={hrefFor(f.slug)} className={`rel-item g-${f.group}`}>
              <span className="rel-dot" />
              <span>
                {f.name}
                <small>{f.when}</small>
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
