import Link from "next/link";
import type { Framework } from "@/lib/data";
import { formatDuration } from "@/lib/video";

/** `video` is the length in seconds of the framework's explainer clip, when it has one. */
export function FrameworkCard({ fw, why, video }: { fw: Framework; why?: string; video?: number }) {
  return (
    <Link href={`/frameworks/${fw.slug}`} className={`card g-${fw.group}`}>
      <h3>{fw.name}</h3>
      {video && <span className="card-vid">▶ มีคลิป {formatDuration(video)}</span>}
      <div className="when">{fw.when}</div>
      <p className="how">{fw.how}</p>
      {why && <p className="match">ตรงกับ “{why}”</p>}
      <div className="src">
        <span title={fw.origin}>{fw.origin}</span>
        <b>ดูขั้นตอน →</b>
      </div>
    </Link>
  );
}
