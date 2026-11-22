import type { Framework } from "@/lib/data";

/** A framework's worked example: a chain of rows when the data has `exampleSteps`, otherwise one paragraph. */
export function Example({ fw, paragraphClass }: { fw: Framework; paragraphClass: string }) {
  if (!fw.exampleSteps?.length) return <p className={paragraphClass}>{fw.example}</p>;
  return (
    <ol className="ex-chain">
      {fw.exampleSteps.map((s, i) => (
        <li key={i} className={s.hl ? "hl" : undefined}>
          {i > 0 && <span className="ex-q">{s.q}</span>}
          <div className="ex-card">
            {s.k && <span className="ex-k">{s.k}</span>}
            <span className="ex-t">{s.t}</span>
            {s.note && <span className="ex-note">{s.note}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
