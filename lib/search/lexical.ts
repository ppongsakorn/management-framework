import MiniSearch from "minisearch";
import { isLatin, tokenize } from "./tokenize";
import type { SearchDoc, SearchHit } from "./types";

const searchOptions = {
  tokenize,
  processTerm: (t: string) => t,
  fuzzy: (term: string) => (isLatin(term) && term.length > 4 ? 0.2 : 0),
  prefix: (term: string) => isLatin(term) && term.length > 2,
  combineWith: "OR" as const,
};

/** v0 — the original behaviour: substring filter, catalogue order, no ranking. */
export function substringEngine(docs: SearchDoc[]) {
  const text = new Map(
    docs.map((d) => [d.slug, [d.name, d.when, d.how, d.example, d.origin, ...d.steps].join(" ").toLowerCase()]),
  );
  return (query: string): SearchHit[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return docs.filter((d) => text.get(d.slug)!.includes(q)).map((d) => ({ slug: d.slug, score: 1 }));
  };
}

/** v1 — BM25 over the framework text with Thai word segmentation and field boosts. */
export function bm25Engine(docs: SearchDoc[]) {
  const ms = new MiniSearch<SearchDoc & { stepsText: string }>({
    idField: "slug",
    fields: ["name", "when", "how", "stepsText", "example", "origin"],
    tokenize,
    processTerm: (t) => t,
    searchOptions: { ...searchOptions, boost: { name: 4, when: 3, how: 2, stepsText: 1, example: 0.7, origin: 0.5 } },
  });
  ms.addAll(docs.map((d) => ({ ...d, stepsText: d.steps.join(" ") })));
  return (query: string): SearchHit[] =>
    query.trim() ? ms.search(query).map((r) => ({ slug: r.id as string, score: r.score })) : [];
}

/**
 * v2 — v1 plus a knowledge base of situation phrases (what people type when
 * stuck). Each framework's score = its own text score + its best phrase match
 * + a small bonus for further matching phrases.
 */
export function phraseEngine(docs: SearchDoc[], phrases: Record<string, string[]>) {
  const textSearch = bm25Engine(docs);
  const ms = new MiniSearch<{ id: number; slug: string; phrase: string }>({
    fields: ["phrase"],
    storeFields: ["slug", "phrase"],
    tokenize,
    processTerm: (t) => t,
    searchOptions,
  });
  let id = 0;
  for (const [slug, list] of Object.entries(phrases)) for (const phrase of list) ms.add({ id: id++, slug, phrase });

  return (query: string): SearchHit[] => {
    if (!query.trim()) return [];
    const bySlug = new Map<string, { best: number; why: string; extra: number; text: number }>();
    const entry = (slug: string) => {
      let e = bySlug.get(slug);
      if (!e) bySlug.set(slug, (e = { best: 0, why: "", extra: 0, text: 0 }));
      return e;
    };
    for (const r of ms.search(query)) {
      const e = entry(r.slug as string);
      if (r.score > e.best) {
        e.extra += e.best * 0.15;
        e.best = r.score;
        e.why = r.phrase as string;
      } else e.extra += r.score * 0.15;
    }
    for (const r of textSearch(query)) entry(r.slug).text = r.score;
    return [...bySlug.entries()]
      .map(([slug, e]) => ({ slug, score: e.best + Math.min(e.extra, e.best) + e.text * 0.6, why: e.why || undefined }))
      .sort((a, b) => b.score - a.score);
  };
}
