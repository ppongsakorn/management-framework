import type { UseCase } from "@/lib/data";

const LANG: Record<string, string> = {
  en: "EN", ja: "日本語", zh: "中文", ko: "한국어", de: "DE", fr: "FR", es: "ES", th: "ไทย", it: "IT", pt: "PT", nl: "NL", sv: "SV", vi: "VI", id: "ID",
};

/** Real-world cases, each with the sources it was checked against. */
export function UseCases({ cases }: { cases: UseCase[] }) {
  return (
    <ol className="cases">
      {cases.map((c, i) => (
        <li key={i} className="case">
          <div className="case-who">
            <b>{c.who}</b>
            <span>
              {[c.country, c.year].filter(Boolean).join(" · ")}
            </span>
          </div>
          <p className="case-event">เหตุการณ์: {c.event}</p>
          <dl>
            <dt>ปัญหา</dt>
            <dd>{c.problem}</dd>
            <dt>ใช้อย่างไร</dt>
            <dd>{c.how}</dd>
            <dt>ผลลัพธ์</dt>
            <dd>{c.result}</dd>
          </dl>
          {c.disputed && <p className="case-note">⚠ เรื่องนี้เล่าต่อกันแพร่หลาย แต่รายละเอียดยังเป็นที่ถกเถียง{c.note ? ` — ${c.note}` : ""}</p>}
          <p className="case-src">
            อ้างอิง:{" "}
            {c.sources.map((s, j) => (
              <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" title={s.title}>
                {s.title}
                <small>{LANG[s.lang] ?? s.lang.toUpperCase()}</small>
              </a>
            ))}
          </p>
        </li>
      ))}
    </ol>
  );
}
