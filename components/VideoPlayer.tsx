"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SeriesPlace } from "@/lib/series";
import { formatDuration, isExternal, mediaUrl, watchUrl, type ClipSize, type FrameworkVideo } from "@/lib/video";

const mime = (src: string) => (/\.webm(\?|$)/i.test(src) ? "video/webm" : "video/mp4");

/**
 * Explainer clip of a framework, in the size for this page (16:9 desktop, 9:16 phone).
 * Until the visitor presses play it is only a poster
 * (the clip's image, or one drawn in the group colour): nothing is fetched from the
 * video host and no third-party player loads, so the page stays light and private.
 *
 * A clip in the restaurant series (`place`) links to the next episode: a chip appears in the last 25 s, when the
 * clip shows its own "ตอนหน้า" card, and an end screen offers the next episode or a replay. The link carries
 * `?play=1`, so the next page starts its clip at once; if the browser blocks playback with sound, a tap starts it.
 */
export function VideoPlayer({ video, size, name, place, base }: { video: FrameworkVideo; size: ClipSize; name: string; place?: SeriesPlace; base?: string }) {
  const clip = video[size];
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(false);
  const [ended, setEnded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const fig = useRef<HTMLElement>(null);
  const player = useRef<HTMLIFrameElement & HTMLVideoElement>(null);
  const len = formatDuration(clip.durationSec);
  const { source } = clip;
  const poster = clip.poster ? mediaUrl(clip.poster) : undefined;
  // Subtitles from another site need CORS there, so the player asks for it only in that case.
  const cors = source.kind === "file" && !!clip.captions?.length && [source.src, ...clip.captions.map((c) => c.src)].some(isExternal);

  // The play button is replaced by the player; keep keyboard focus on it.
  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  // Arrived from the previous episode's "next" link: start this clip and bring it into view.
  useEffect(() => {
    if (source.kind !== "file" || !/[?&]play=1\b/.test(window.location.search)) return;
    setPlaying(true);
    fig.current?.scrollIntoView({ block: "center" });
    // Drop the flag so a shared or reloaded link does not start the clip on its own.
    const u = new URL(window.location.href);
    u.searchParams.delete("play");
    window.history.replaceState(window.history.state, "", u.pathname + u.search + u.hash);
  }, [source.kind]);

  const next = place?.next;
  const nextHref = next && base ? `${base}${next.slug}/${next.soon ? "" : "?play=1"}` : undefined;
  const nextLabel = next ? `ตอนที่ ${next.n}: ${next.name}${next.soon ? " · เร็ว ๆ นี้" : ""}` : "";
  const replay = () => { const v = player.current; if (!v) return; setEnded(false); v.currentTime = 0; v.play().catch(() => setBlocked(true)); };

  return (
    <figure ref={fig} className={`vid${clip.aspect === "9:16" ? " vid-tall" : ""}`}>
      <div className="vid-frame">
        {!playing ? (
          <button type="button" className="vid-facade" onClick={() => setPlaying(true)} aria-label={`เล่นคลิปอธิบาย ${name} ยาว ${len} นาที`}>
            {poster ? (
              <img src={poster} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="vid-name" aria-hidden="true">
                {name}
              </span>
            )}
            <span className="vid-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            </span>
            <span className="vid-len" aria-hidden="true">
              {len}
            </span>
          </button>
        ) : source.kind === "youtube" ? (
          <iframe
            ref={player}
            src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=${video.lang}&hl=${video.lang}`}
            title={clip.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video
            ref={player}
            controls
            autoPlay
            playsInline
            preload="metadata"
            poster={poster}
            crossOrigin={cors ? "anonymous" : undefined}
            onPlay={() => { setBlocked(false); setEnded(false); }}
            onTimeUpdate={(e) => { const v = e.currentTarget; setNear(v.duration > 0 && v.currentTime >= v.duration - 25); }}
            onEnded={() => setEnded(true)}
            onLoadedData={(e) => { const v = e.currentTarget; if (v.paused && !v.ended) v.play().catch(() => setBlocked(true)); }}
          >
            <source src={mediaUrl(source.src)} type={mime(source.src)} />
            {clip.captions?.map((c, i) => (
              <track key={c.src} kind="subtitles" src={mediaUrl(c.src)} srcLang={c.lang} label={c.label} default={i === 0} />
            ))}
          </video>
        )}
        {playing && source.kind === "file" && blocked && !ended && (
          <button type="button" className="vid-tap" onClick={() => player.current?.play().then(() => setBlocked(false), () => {})}>
            <span className="vid-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            </span>
            <span className="vid-tap-t">แตะเพื่อเล่น {name}</span>
          </button>
        )}
        {playing && nextHref && near && !ended && (
          <Link href={nextHref} className="vid-next">
            <span>ตอนหน้า</span> {next!.name} ▶
          </Link>
        )}
        {playing && ended && (
          <div className="vid-end" role="group" aria-label="จบคลิป">
            {place && <p className="vid-end-ep">จบตอนที่ {place.n}</p>}
            {nextHref && (
              <Link href={nextHref} className="vid-end-next">
                {next!.soon ? "ดู framework ตอนถัดไป" : "▶ ดูตอนต่อไป"}
                <b>{nextLabel}</b>
              </Link>
            )}
            <button type="button" className="vid-end-again" onClick={replay}>
              ↺ ดูอีกครั้ง
            </button>
          </div>
        )}
      </div>
      <figcaption className="vid-cap">
        <b>{clip.title}</b>
        {source.kind === "youtube" && (
          <span>
            <a href={watchUrl(clip)} target="_blank" rel="noopener noreferrer">
              เปิดใน YouTube
            </a>
          </span>
        )}
        {video.note && <span>{video.note}</span>}
      </figcaption>
    </figure>
  );
}
