import series from "@/data/series.json";
import { getFramework, getVideo } from "@/lib/data";
import type { ClipSize } from "@/lib/video";

/** One episode of the clip series, ready for a list: number, framework, title, poster and length of one size. */
export interface Episode {
  n: number;
  slug: string;
  name: string;
  group: string;
  title: string;
  poster?: string;
  durationSec: number;
}

/** The series in episode order (data/series.json); every listed slug has a clip (a test checks it). */
export function episodes(size: ClipSize): Episode[] {
  return series.episodes.map((slug, i) => {
    const fw = getFramework(slug)!, clip = getVideo(slug)![size];
    // Titles read "Name: question"; the list shows the name on its own line, so keep the part after the colon.
    const title = clip.title.includes(":") ? clip.title.slice(clip.title.indexOf(":") + 1).trim() : clip.title;
    return { n: i + 1, slug, name: fw.name, group: fw.group, title, poster: clip.poster, durationSec: clip.durationSec };
  });
}

/** Episodes announced but not made yet, numbered after the last one. */
export function upcoming(): { n: number; slug: string; name: string; group: string; teaser: string }[] {
  return series.next.map((x, i) => {
    const fw = getFramework(x.slug)!;
    return { n: series.episodes.length + i + 1, slug: x.slug, name: fw.name, group: fw.group, teaser: x.teaser };
  });
}

export const seriesName = series.name;
export const seriesAbout = series.about;

/** Where a framework sits in the series: its episode number and the episode after it (made or announced). */
export interface SeriesPlace {
  n: number;
  next?: { n: number; slug: string; name: string; soon: boolean };
}

export function seriesPlace(slug: string): SeriesPlace | undefined {
  const i = series.episodes.indexOf(slug);
  if (i < 0) return undefined;
  const nextSlug = series.episodes[i + 1] ?? series.next[0]?.slug;
  const fw = nextSlug ? getFramework(nextSlug) : undefined;
  return { n: i + 1, next: fw ? { n: i + 2, slug: fw.slug, name: fw.name, soon: !series.episodes.includes(fw.slug) } : undefined };
}
