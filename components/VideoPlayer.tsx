"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration, isExternal, mediaUrl, watchUrl, type FrameworkVideo } from "@/lib/video";

const mime = (src: string) => (/\.webm(\?|$)/i.test(src) ? "video/webm" : "video/mp4");

/**
 * Explainer clip of a framework. Until the visitor presses play it is only a poster
 * (the clip's image, or one drawn in the group colour): nothing is fetched from the
 * video host and no third-party player loads, so the page stays light and private.
 */
export function VideoPlayer({ video, name }: { video: FrameworkVideo; name: string }) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<HTMLIFrameElement & HTMLVideoElement>(null);
  const len = formatDuration(video.durationSec);
  const { source } = video;
  const poster = video.poster ? mediaUrl(video.poster) : undefined;
  // Subtitles from another site need CORS there, so the player asks for it only in that case.
  const cors = source.kind === "file" && !!video.captions?.length && [source.src, ...video.captions.map((c) => c.src)].some(isExternal);

  // The play button is replaced by the player; keep keyboard focus on it.
  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  return (
    <figure className={`vid${video.aspect === "9:16" ? " vid-tall" : ""}`}>
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
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video ref={player} controls autoPlay playsInline preload="metadata" poster={poster} crossOrigin={cors ? "anonymous" : undefined}>
            <source src={mediaUrl(source.src)} type={mime(source.src)} />
            {video.captions?.map((c, i) => (
              <track key={c.src} kind="subtitles" src={mediaUrl(c.src)} srcLang={c.lang} label={c.label} default={i === 0} />
            ))}
          </video>
        )}
      </div>
      <figcaption className="vid-cap">
        <b>{video.title}</b>
        <span>
          {len} นาที · {video.madeWith.ai ? `สร้างด้วยเครื่องมือ AI (${video.madeWith.tool})` : `ผลิตด้วย ${video.madeWith.tool}`}
          {source.kind === "youtube" && (
            <>
              {" · "}
              <a href={watchUrl(video)} target="_blank" rel="noopener noreferrer">
                เปิดใน YouTube
              </a>
            </>
          )}
        </span>
        {video.note && <span>{video.note}</span>}
      </figcaption>
    </figure>
  );
}
