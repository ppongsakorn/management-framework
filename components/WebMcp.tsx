"use client";

import { useEffect } from "react";
import { phraseEngine } from "@/lib/search/lexical";
import type { Framework, UseCase } from "@/lib/data";
import { basePath } from "@/lib/site";

/**
 * WebMCP (W3C WebML CG draft): registers the site's search and content as
 * tools that an in-browser AI agent can call. Every tool is read-only. On
 * browsers without document.modelContext this renders nothing and does nothing.
 */

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}
interface ModelContext {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => Promise<void>;
}

function modelContext(): ModelContext | undefined {
  const d = document as Document & { modelContext?: ModelContext };
  const n = navigator as Navigator & { modelContext?: ModelContext }; // earlier drafts
  return d.modelContext ?? n.modelContext;
}

const isMobile = () => location.pathname.startsWith(`${basePath}/mobile`);
const pageFor = (slug: string) => `${basePath}${isMobile() ? `/mobile/f/${slug}/` : `/frameworks/${slug}/`}`;
const url = (slug: string) => `${location.origin}${pageFor(slug)}`;

export function WebMcp({ frameworks, useCases }: { frameworks: Framework[]; useCases: Record<string, UseCase[]> }) {
  useEffect(() => {
    const ctx = modelContext();
    if (!ctx) return;
    const ac = new AbortController();
    const bySlug = new Map(frameworks.map((f) => [f.slug, f]));
    const summary = (f: Framework) => ({ slug: f.slug, name: f.name, group: f.group, when: f.when, how: f.how, url: url(f.slug) });
    let search: ((q: string) => { slug: string; score: number; why?: string }[]) | null = null;
    const engine = async () => {
      if (!search) {
        const phrases = (await import("@/data/search-phrases.json")).default as Record<string, string[]>;
        search = phraseEngine(frameworks, phrases);
      }
      return search;
    };

    const tools: ModelContextTool[] = [
      {
        name: "search_frameworks",
        title: "ค้นหา framework จากสถานการณ์",
        description:
          "Find management frameworks for a situation described in plain Thai or English (e.g. 'ทีมใหม่เถียงกันทุกเรื่อง', 'backlog too long'). Returns the best matches with the phrase each one matched and a page URL. Use get_framework for the full steps.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The situation or problem, in the user's own words" },
            limit: { type: "integer", minimum: 1, maximum: 10, default: 5 },
          },
          required: ["query"],
        },
        annotations: { readOnlyHint: true },
        execute: async ({ query, limit }) => {
          const q = String(query ?? "").trim();
          if (!q) return { results: [] };
          const hits = (await engine())(q).slice(0, Math.min(Number(limit) || 5, 10));
          return { query: q, results: hits.map((h) => ({ ...summary(bySlug.get(h.slug)!), matchedPhrase: h.why ?? null })) };
        },
      },
      {
        name: "list_frameworks",
        title: "รายการ framework ทั้งหมด",
        description: "List all frameworks on this site, grouped by the stage of the management cycle (diag, dec, plan, exec, ppl, think), with a one-line 'use when' for each.",
        inputSchema: { type: "object", properties: { group: { type: "string", enum: ["diag", "dec", "plan", "exec", "ppl", "think"], description: "Optional: only this group" } } },
        annotations: { readOnlyHint: true },
        execute: async ({ group }) => ({
          frameworks: frameworks.filter((f) => !group || f.group === group).map((f) => ({ slug: f.slug, name: f.name, group: f.group, when: f.when })),
        }),
      },
      {
        name: "get_framework",
        title: "รายละเอียด framework",
        description: "Get one framework by slug: when to use it, how it works in one line, its five steps, a worked example and where the idea comes from.",
        inputSchema: { type: "object", properties: { slug: { type: "string", description: "Framework slug, e.g. '5-whys' (from search_frameworks or list_frameworks)" } }, required: ["slug"] },
        annotations: { readOnlyHint: true },
        execute: async ({ slug }) => {
          const f = bySlug.get(String(slug));
          if (!f) return { error: `unknown slug: ${slug}`, hint: "call list_frameworks for valid slugs" };
          return { ...summary(f), steps: f.steps, example: f.example, origin: f.origin, useCaseCount: (useCases[f.slug] ?? []).length };
        },
      },
      {
        name: "list_use_cases",
        title: "กรณีจริงของ framework",
        description: "Documented real-world cases where a named organisation or person used the framework: the public event, the problem, how it was applied, the verified result and source links. Cases flagged disputed are stories whose details are contested.",
        inputSchema: { type: "object", properties: { slug: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 20, default: 10 } }, required: ["slug"] },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async ({ slug, limit }) => {
          const f = bySlug.get(String(slug));
          if (!f) return { error: `unknown slug: ${slug}` };
          const cases = (useCases[f.slug] ?? []).slice(0, Math.min(Number(limit) || 10, 20));
          return { framework: f.name, url: url(f.slug), cases: cases.map((c) => ({ who: c.who, event: c.event, country: c.country, year: c.year, problem: c.problem, how: c.how, result: c.result, disputed: !!c.disputed, note: c.note ?? null, sources: c.sources })) };
        },
      },
      {
        name: "open_framework",
        title: "เปิดหน้า framework",
        description: "Navigate this tab to the framework's page so the user can read it.",
        inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
        annotations: { readOnlyHint: true },
        execute: async ({ slug }) => {
          const f = bySlug.get(String(slug));
          if (!f) return { error: `unknown slug: ${slug}` };
          location.assign(pageFor(f.slug));
          return { opened: url(f.slug) };
        },
      },
    ];

    for (const t of tools) ctx.registerTool(t, { signal: ac.signal }).catch((e) => console.warn("WebMCP register failed", t.name, e));
    return () => ac.abort();
  }, [frameworks, useCases]);
  return null;
}
