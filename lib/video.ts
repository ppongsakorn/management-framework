/**
 * Explainer clip of one framework (data/videos.json, keyed by slug).
 * Kept free of data imports so client components can use it without bundling the JSON.
 * The rules a clip must meet are in scripts/video-lib.mjs; the flow in docs/videos/README.md.
 */
export interface FrameworkVideo {
  title: string;
  durationSec: number;
  lang: string;
  aspect: "16:9" | "9:16";
  /** Clips are never stored in the repo: a YouTube id, or an https file elsewhere. */
  source: { kind: "youtube"; id: string } | { kind: "file"; src: string };
  poster?: string;
  /** WebVTT subtitles for a self-hosted file (YouTube clips use YouTube's own). */
  captions?: { src: string; lang: string; label: string }[];
  /** Which tool (and skill) made it, when, and whether voice or visuals are AI-generated. */
  madeWith: { tool: string; skill?: string; date: string; ai: boolean };
  /** Fingerprint of the framework content the clip narrates; see `npm run video:check`. */
  briefHash: string;
  note?: string;
}

/** 84 → "1:24". */
export function formatDuration(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** Where a visitor (or an agent) can watch the clip outside this site. */
export function watchUrl(v: FrameworkVideo): string {
  return v.source.kind === "youtube" ? `https://www.youtube.com/watch?v=${v.source.id}` : v.source.src;
}
