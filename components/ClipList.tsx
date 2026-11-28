import Link from "next/link";
import { episodes, upcoming } from "@/lib/series";
import { formatDuration, mediaUrl, type ClipSize } from "@/lib/video";

/**
 * The clip series as a list in episode order: poster, episode number, framework and the episode's question.
 * Each item opens the framework page, where the clip plays; only posters load here (about 10 KB each).
 * `size` picks the poster: 16:9 on the desktop page, 9:16 in the phone app.
 */
export function ClipList({ size, href }: { size: ClipSize; href: (slug: string) => string }) {
  const list = episodes(size);
  const tall = size === "mobile";
  return (
    <ol className={`clips${tall ? " clips-tall" : ""}`}>
      {list.map((e) => (
        <li key={e.slug}>
          <Link href={href(e.slug)} className={`clip g-${e.group}`}>
            <span className="clip-poster">
              {e.poster && <img src={mediaUrl(e.poster)} alt="" width={tall ? 270 : 480} height={tall ? 480 : 270} loading={e.n > 3 ? "lazy" : undefined} decoding="async" />}
              <span className="clip-len">▶ {formatDuration(e.durationSec)}</span>
            </span>
            <span className="clip-body">
              <span className="clip-ep">ตอนที่ {e.n}</span>
              <b className="clip-name">{e.name}</b>
              <span className="clip-q">{e.title}</span>
            </span>
          </Link>
        </li>
      ))}
      {upcoming().map((u) => (
        <li key={u.slug}>
          <Link href={href(u.slug)} className={`clip clip-soon g-${u.group}`}>
            <span className="clip-poster">
              <span className="clip-soon-mark">เร็ว ๆ นี้</span>
            </span>
            <span className="clip-body">
              <span className="clip-ep">ตอนที่ {u.n} · ตอนหน้า</span>
              <b className="clip-name">{u.name}</b>
              <span className="clip-q">{u.teaser}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
