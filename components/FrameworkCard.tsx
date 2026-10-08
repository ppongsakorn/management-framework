import Link from "next/link";
import type { Framework } from "@/lib/data";

export function FrameworkCard({ fw }: { fw: Framework }) {
  return (
    <Link href={`/frameworks/${fw.slug}`} className={`card g-${fw.group}`}>
      <h3>{fw.name}</h3>
      <div className="when">{fw.when}</div>
      <p className="how">{fw.how}</p>
      <div className="src">
        <span title={fw.origin}>{fw.origin}</span>
        <b>ดูขั้นตอน →</b>
      </div>
    </Link>
  );
}
