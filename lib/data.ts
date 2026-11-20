import raw from "@/data/frameworks.json";
import diagrams from "@/data/diagrams.json";
import useCases from "@/data/use-cases.json";
import videos from "@/data/videos.json";
import type { ClipSize, FrameworkVideo } from "@/lib/video";

export type GroupId = "diag" | "dec" | "plan" | "exec" | "ppl" | "think";

export interface Group {
  id: GroupId;
  title: string;
  question: string;
  why: string;
}

/** One row of a step-by-step example: `q` is the question on the arrow into it, `k` its label, `hl` marks the key row. */
export interface ExampleStep {
  q?: string;
  k?: string;
  t: string;
  note?: string;
  hl?: boolean;
}

export interface Framework {
  slug: string;
  name: string;
  group: GroupId;
  when: string;
  how: string;
  steps: string[];
  /** Plain text read by search, the AI advisor and WebMCP. With `exampleSteps` it must be their flattened form (a test checks). */
  example: string;
  /** Optional: the example as a chain of rows, shown instead of the paragraph. */
  exampleSteps?: ExampleStep[];
  /** Discipline the idea comes from, plus its originator when widely credited. */
  origin: string;
  /** Other frameworks to use first, alongside, or next (slugs). */
  related?: { before?: string[]; with?: string[]; after?: string[] };
  diagram: { type: string; spec: unknown };
}

export const groups = raw.groups as Group[];
export const frameworks = raw.frameworks as Framework[];

/** The "which sentence are you saying right now?" router, in cycle order. */
export const routerPrompts: Record<GroupId, { sentence: string; color: string }> = {
  diag: { sentence: "ยังไม่รู้ว่าปัญหาจริง ๆ คืออะไร", color: "สีแดง = สัญญาณเตือน" },
  dec: { sentence: "มีหลายทาง ไม่รู้จะเลือกอะไร", color: "สีเหลืองอำพัน = ทางแยก" },
  plan: { sentence: "รู้แล้วว่าจะทำอะไร แต่จะไปยังไง", color: "สีน้ำเงิน = พิมพ์เขียว" },
  exec: { sentence: "แผนมีแล้ว แต่ทำไม่ทัน / ทำแล้วหลุด", color: "สีเขียว = ไปได้" },
  ppl: { sentence: "ปัญหาไม่ได้อยู่ที่งาน อยู่ที่คน", color: "สีม่วง = เรื่องของคน" },
  think: { sentence: "รู้สึกว่าคิดไม่ตรง / กำลังหลอกตัวเอง", color: "สีเขียวคราม = น้ำใส" },
};

export function getGroup(id: GroupId): Group {
  const g = groups.find((x) => x.id === id);
  if (!g) throw new Error(`unknown group ${id}`);
  return g;
}

export function getFramework(slug: string): Framework | undefined {
  return frameworks.find((f) => f.slug === slug);
}

export function frameworksIn(group: GroupId): Framework[] {
  return frameworks.filter((f) => f.group === group);
}

/** Pre-rendered SVG (from scripts/render-diagrams.mjs). Trusted, repo-owned markup. */
export function getDiagram(slug: string): string | undefined {
  return (diagrams as Record<string, string>)[slug];
}

/** A documented, sourced case of a person or organisation using a framework. */
export interface UseCase {
  who: string;
  /** The public event or document the case comes from, e.g. "เหตุฐานข้อมูล GitLab.com ล่ม 31 ม.ค. 2017". */
  event: string;
  country: string;
  year: string;
  problem: string;
  how: string;
  result: string;
  searchPhrase: string;
  sources: { title: string; url: string; lang: string }[];
  disputed?: boolean;
  note?: string;
}

export function getUseCases(slug: string): UseCase[] {
  return (useCases as Record<string, UseCase[]>)[slug] ?? [];
}

/** The explainer clip of a framework (both sizes), if one has been made (data/videos.json). */
export function getVideo(slug: string): FrameworkVideo | undefined {
  return (videos as unknown as Record<string, FrameworkVideo>)[slug];
}

/** slug → clip length in seconds, for the "has a clip" marks in lists. */
export function videoLengths(size: ClipSize = "desktop"): Record<string, number> {
  return Object.fromEntries(Object.entries(videos as unknown as Record<string, FrameworkVideo>).map(([s, v]) => [s, v[size].durationSec]));
}
