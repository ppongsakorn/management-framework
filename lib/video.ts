import { assetBase } from "@/lib/site";

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
  /**
   * A YouTube id, or a file: either kept in the repo under public/videos/ and named by its
   * site-relative path ("videos/5-whys.webm"), or an https URL elsewhere.
   */
  source: { kind: "youtube"; id: string } | { kind: "file"; src: string };
  /** Same forms as a file source: "videos/5-whys.webp" or an https URL. */
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

/**
 * Where a file named in data/videos.json is served: https URLs as they are, repo files from the root
 * build (assetBase), so the /v0 … /v3 comparison builds share its copy.
 */
export function mediaUrl(src: string): string {
  return /^https:\/\//.test(src) ? src : `${assetBase}/${src}`;
}

/** True when the file comes from another site (cross-origin subtitles then need CORS there). */
export const isExternal = (src: string) => /^https:\/\//.test(src);

/** Where a visitor (or an agent) can watch the clip on its own: YouTube, or the file itself (a site path for repo files). */
export function watchUrl(v: FrameworkVideo): string {
  return v.source.kind === "youtube" ? `https://www.youtube.com/watch?v=${v.source.id}` : mediaUrl(v.source.src);
}
