import type { Framework, Group, UseCase } from "@/lib/data";
import { phraseEngine } from "@/lib/search/lexical";
import { tokenize } from "@/lib/search/tokenize";
import { basePath } from "@/lib/site";

/**
 * WebMCP tools (document.modelContext, W3C WebML CG draft). Every tool is
 * read-only. The site data is imported lazily, so visitors whose browser has
 * no WebMCP never download it, and agents pay for it only on the first call.
 */

export interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

interface Data {
  frameworks: Framework[];
  groups: Group[];
  useCases: Record<string, UseCase[]>;
  bySlug: Map<string, Framework>;
  search: (q: string) => { slug: string; score: number; why?: string }[];
}

let loading: Promise<Data> | null = null;
function load(): Promise<Data> {
  loading ??= (async () => {
    const [fw, uc, ph] = await Promise.all([import("@/data/frameworks.json"), import("@/data/use-cases.json"), import("@/data/search-phrases.json")]);
    const frameworks = fw.default.frameworks as unknown as Framework[];
    return {
      frameworks,
      groups: fw.default.groups as unknown as Group[],
      useCases: uc.default as unknown as Record<string, UseCase[]>,
      bySlug: new Map(frameworks.map((f) => [f.slug, f])),
      search: phraseEngine(frameworks, ph.default as Record<string, string[]>),
    };
  })();
  return loading;
}

const isMobile = () => location.pathname.startsWith(`${basePath}/mobile`);
const pageFor = (slug: string) => `${basePath}${isMobile() ? `/mobile/f/${slug}/` : `/frameworks/${slug}/`}`;
const absolute = (path: string) => `${location.origin}${path}`;
const url = (slug: string) => absolute(pageFor(slug));
const summary = (f: Framework) => ({ slug: f.slug, name: f.name, group: f.group, when: f.when, how: f.how, url: url(f.slug) });
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const clamp = (v: unknown, def: number, max: number) => Math.min(Math.max(Math.floor(Number(v)) || def, 1), max);
const unknownSlug = (slug: unknown) => ({ error: `unknown slug: ${String(slug)}`, hint: "call list_frameworks or search_frameworks for valid slugs" });

/** Country names an agent or user is likely to say → ISO code (use-case data uses ISO codes). */
const COUNTRY: Record<string, string> = {
  ไทย: "TH", thailand: "TH", ญี่ปุ่น: "JP", japan: "JP", สหรัฐ: "US", อเมริกา: "US", usa: "US", us: "US", อังกฤษ: "GB", uk: "GB", britain: "GB",
  จีน: "CN", china: "CN", เกาหลี: "KR", korea: "KR", เยอรมัน: "DE", germany: "DE", ฝรั่งเศส: "FR", france: "FR", อินเดีย: "IN", india: "IN",
  สิงคโปร์: "SG", singapore: "SG", ออสเตรเลีย: "AU", australia: "AU", แคนาดา: "CA", canada: "CA", บราซิล: "BR", brazil: "BR", เม็กซิโก: "MX", mexico: "MX",
  อิตาลี: "IT", italy: "IT", สวิตเซอร์แลนด์: "CH", สวิส: "CH", switzerland: "CH", สวีเดน: "SE", sweden: "SE", เนเธอร์แลนด์: "NL", netherlands: "NL",
  เวียดนาม: "VN", vietnam: "VN", อินโดนีเซีย: "ID", indonesia: "ID", มาเลเซีย: "MY", malaysia: "MY", ฟิลิปปินส์: "PH", philippines: "PH", ไต้หวัน: "TW", taiwan: "TW",
  อิสราเอล: "IL", israel: "IL", เดนมาร์ก: "DK", denmark: "DK", ฟินแลนด์: "FI", finland: "FI", สเปน: "ES", spain: "ES",
};
const toCountry = (v: string) => COUNTRY[v.toLowerCase()] ?? v.toUpperCase();

/** What the visitor is looking at right now: page kind, framework/group, search state, visible results. */
function currentPage(d: Data) {
  const mobile = isMobile();
  const rel = (location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length) : location.pathname).replace(/\/+$/, "") || "/";
  const p = mobile ? rel.slice("/mobile".length) || "/" : rel;
  const out: Record<string, unknown> = { view: mobile ? "mobile" : "desktop", url: location.href, title: document.title };
  const slugsIn = (sel: string) => [...document.querySelectorAll<HTMLAnchorElement>(sel)].map((a) => a.getAttribute("href")?.replace(/\/+$/, "").split("/").pop() ?? "").filter((s) => d.bySlug.has(s));
  let m: RegExpMatchArray | null;
  if (p === "/") out.kind = "home";
  else if ((m = p.match(/^\/(?:f|frameworks)\/([a-z0-9-]+)$/))) {
    const f = d.bySlug.get(m[1]);
    out.kind = "framework";
    if (f) out.framework = summary(f);
    const tab = document.querySelector('[role="tab"][aria-selected="true"]');
    if (tab) out.activeTab = tab.textContent?.trim();
  } else if ((m = p.match(/^\/g\/([a-z]+)$/))) {
    const g = d.groups.find((x) => x.id === m![1]);
    out.kind = "group";
    if (g) out.group = { id: g.id, title: g.title, question: g.question };
    out.frameworksListed = slugsIn(".m-list a");
  } else if (p === "/frameworks" || p === "/search") {
    out.kind = "catalogue";
    out.query = document.querySelector<HTMLInputElement>('input[type="search"]')?.value ?? "";
    const pressed = document.querySelector('.filter[aria-pressed="true"]');
    out.activeGroup = pressed?.className.match(/\bg-([a-z]+)/)?.[1] ?? "all";
    out.visibleResults = slugsIn(".card, .m-list a.m-row");
  } else out.kind = p.replace(/^\//, "") || "other";
  return out;
}

export function buildTools(): ModelContextTool[] {
  return [
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
        const q = str(query);
        if (!q) return { results: [] };
        const d = await load();
        const hits = d.search(q).slice(0, clamp(limit, 5, 10));
        return { query: q, results: hits.map((h) => ({ ...summary(d.bySlug.get(h.slug)!), matchedPhrase: h.why ?? null })) };
      },
    },
    {
      name: "list_frameworks",
      title: "รายการ framework ทั้งหมด",
      description: "List all frameworks on this site, grouped by the stage of the management cycle (diag, dec, plan, exec, ppl, think), with a one-line 'use when' for each.",
      inputSchema: { type: "object", properties: { group: { type: "string", enum: ["diag", "dec", "plan", "exec", "ppl", "think"], description: "Optional: only this group" } } },
      annotations: { readOnlyHint: true },
      execute: async ({ group }) => {
        const d = await load();
        return { frameworks: d.frameworks.filter((f) => !group || f.group === group).map((f) => ({ slug: f.slug, name: f.name, group: f.group, when: f.when })) };
      },
    },
    {
      name: "get_framework",
      title: "รายละเอียด framework",
      description: "Get one framework by slug: when to use it, how it works in one line, its five steps, a worked example, where the idea comes from and which frameworks to use before, alongside and after it.",
      inputSchema: { type: "object", properties: { slug: { type: "string", description: "Framework slug, e.g. '5-whys' (from search_frameworks or list_frameworks)" } }, required: ["slug"] },
      annotations: { readOnlyHint: true },
      execute: async ({ slug }) => {
        const d = await load();
        const f = d.bySlug.get(str(slug));
        if (!f) return unknownSlug(slug);
        return { ...summary(f), steps: f.steps, example: f.example, origin: f.origin, related: f.related ?? {}, useCaseCount: (d.useCases[f.slug] ?? []).length };
      },
    },
    {
      name: "suggest_sequence",
      title: "ลำดับการใช้ framework",
      description:
        "Given a framework slug, return the order to use related frameworks in: those to use before it, those that work alongside it, and those to use next, each with its 'use when' line and page URL. Use it to turn one recommendation into a short plan.",
      inputSchema: { type: "object", properties: { slug: { type: "string", description: "Framework slug, e.g. 'okr' (from search_frameworks)" } }, required: ["slug"] },
      annotations: { readOnlyHint: true },
      execute: async ({ slug }) => {
        const d = await load();
        const f = d.bySlug.get(str(slug));
        if (!f) return unknownSlug(slug);
        const pick = (list?: string[]) => (list ?? []).map((s) => d.bySlug.get(s)).filter((x): x is Framework => !!x).map(summary);
        return { framework: summary(f), before: pick(f.related?.before), alongside: pick(f.related?.with), next: pick(f.related?.after) };
      },
    },
    {
      name: "compare_frameworks",
      title: "เปรียบเทียบ framework",
      description:
        "Compare two or three frameworks side by side: when to use each, how it works, its five steps, a worked example and origin, plus whether they are in the same group and how they relate (one is listed as 'use before', 'alongside' or 'next' to the other). Use it for questions like 'X vs Y'.",
      inputSchema: {
        type: "object",
        properties: { slugs: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3, description: "Two or three framework slugs" } },
        required: ["slugs"],
      },
      annotations: { readOnlyHint: true },
      execute: async ({ slugs }) => {
        const d = await load();
        const list = (Array.isArray(slugs) ? slugs : []).map(str).filter(Boolean);
        if (list.length < 2 || list.length > 3) return { error: "give two or three slugs", hint: "call search_frameworks or list_frameworks to find slugs" };
        const fws = list.map((s) => d.bySlug.get(s));
        const missing = list.filter((_, i) => !fws[i]);
        if (missing.length) return { error: `unknown slug: ${missing.join(", ")}`, hint: "call list_frameworks for valid slugs" };
        const found = fws as Framework[];
        const kinds = { before: "ใช้ก่อน", with: "ใช้คู่กัน", after: "ใช้ต่อ" } as const;
        const relationships = found.flatMap((a) =>
          found.filter((b) => b !== a).flatMap((b) =>
            (Object.keys(kinds) as (keyof typeof kinds)[]).filter((k) => a.related?.[k]?.includes(b.slug)).map((k) => ({ framework: a.slug, lists: b.slug, as: k, meaning: `${a.name}: ${b.name} อยู่ในกลุ่ม "${kinds[k]}"` })),
          ),
        );
        return {
          sameGroup: new Set(found.map((f) => f.group)).size === 1,
          frameworks: found.map((f) => ({ ...summary(f), steps: f.steps, example: f.example, origin: f.origin })),
          relationships,
        };
      },
    },
    {
      name: "search_use_cases",
      title: "ค้นกรณีจริงข้ามทุก framework",
      description:
        "Search the documented real-world cases across all frameworks by country (ISO code or name such as 'TH', 'Thailand', 'ญี่ปุ่น'), organisation or person (e.g. 'Toyota'), framework slug and/or free text. Each case has the public event, problem, how it was applied, the verified result and source links; disputed cases are flagged. Call with no arguments to get an overview of countries and counts.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free text matched against the case (Thai or English)" },
          country: { type: "string", description: "ISO code or country name" },
          who: { type: "string", description: "Organisation or person name, e.g. 'Toyota'" },
          slug: { type: "string", description: "Only cases of this framework" },
          includeDisputed: { type: "boolean", default: true },
          limit: { type: "integer", minimum: 1, maximum: 20, default: 10 },
        },
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ query, country, who, slug, includeDisputed, limit }) => {
        const d = await load();
        const all = Object.entries(d.useCases).flatMap(([s, list]) => list.map((c) => ({ slug: s, c })));
        const q = str(query), cc = str(country) ? toCountry(str(country)) : "", w = str(who).toLowerCase(), sl = str(slug);
        if (!q && !cc && !w && !sl) {
          const counts = new Map<string, number>();
          for (const { c } of all) counts.set(c.country, (counts.get(c.country) ?? 0) + 1);
          return { totalCases: all.length, frameworksWithCases: Object.keys(d.useCases).length, countries: [...counts].sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ country: code, count })), hint: "pass country, who, slug or query to filter" };
        }
        if (sl && !d.bySlug.has(sl)) return unknownSlug(sl);
        const terms = tokenize(q);
        const need = Math.max(1, Math.ceil(terms.length / 2));
        const scored = all
          .filter(({ slug: s, c }) => (!sl || s === sl) && (!cc || c.country === cc) && (!w || c.who.toLowerCase().includes(w)) && (includeDisputed !== false || !c.disputed))
          .map(({ slug: s, c }) => {
            const text = `${c.who} ${c.event} ${c.problem} ${c.how} ${c.result} ${c.note ?? ""} ${d.bySlug.get(s)?.name ?? ""}`.toLowerCase();
            return { slug: s, c, score: terms.filter((t) => text.includes(t)).length };
          })
          .filter((x) => !terms.length || x.score >= need)
          .sort((a, b) => b.score - a.score || Number(!!a.c.disputed) - Number(!!b.c.disputed));
        const max = clamp(limit, 10, 20);
        return {
          totalMatches: scored.length,
          cases: scored.slice(0, max).map(({ slug: s, c }) => ({
            framework: { slug: s, name: d.bySlug.get(s)?.name, url: url(s) },
            who: c.who, event: c.event, country: c.country, year: c.year, problem: c.problem, how: c.how, result: c.result,
            disputed: !!c.disputed, note: c.note ?? null, sources: c.sources,
          })),
        };
      },
    },
    {
      name: "get_current_page",
      title: "หน้าที่ผู้ใช้กำลังดูอยู่",
      description:
        "Describe what the visitor is looking at right now: the page kind (home, catalogue, framework, group, updates...), the framework or group, the current search text and group filter, the open tab on the phone view and which frameworks are visible in the results. Call it first when the user says 'this', 'this page' or 'explain this'.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => currentPage(await load()),
    },
    {
      name: "show_in_catalogue",
      title: "แสดงผลค้นหาให้ผู้ใช้เห็นบนหน้าจอ",
      description:
        "Take the visitor to the catalogue with a search already typed in and/or a group filter applied, so they can browse on screen. The on-screen search can rank differently from search_frameworks (the desktop catalogue may match exact words only), so quote the frameworks you found and use open_framework when you want one specific page. On the phone view a group without text opens that group's list.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "Text to put in the search box" }, group: { type: "string", enum: ["diag", "dec", "plan", "exec", "ppl", "think"] } },
      },
      annotations: { readOnlyHint: true },
      execute: async ({ query, group }) => {
        const q = str(query), g = str(group);
        if (g && !["diag", "dec", "plan", "exec", "ppl", "think"].includes(g)) return { error: `unknown group: ${g}`, hint: "diag, dec, plan, exec, ppl or think" };
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        let path: string;
        if (isMobile()) path = g && !q ? `${basePath}/mobile/g/${g}/` : `${basePath}/mobile/search/${params.size ? `?${params}` : ""}`;
        else {
          if (g) params.set("g", g);
          path = `${basePath}/frameworks/${params.size ? `?${params}` : ""}`;
        }
        location.assign(path);
        return { opened: absolute(path) };
      },
    },
    {
      name: "list_use_cases",
      title: "กรณีจริงของ framework",
      description: "Documented real-world cases for one framework: the public event, the problem, how it was applied, the verified result and source links. Cases flagged disputed are stories whose details are contested. Use search_use_cases to search across frameworks.",
      inputSchema: { type: "object", properties: { slug: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 20, default: 10 } }, required: ["slug"] },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async ({ slug, limit }) => {
        const d = await load();
        const f = d.bySlug.get(str(slug));
        if (!f) return unknownSlug(slug);
        const cases = (d.useCases[f.slug] ?? []).slice(0, clamp(limit, 10, 20));
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
        const d = await load();
        const f = d.bySlug.get(str(slug));
        if (!f) return unknownSlug(slug);
        location.assign(pageFor(f.slug));
        return { opened: url(f.slug) };
      },
    },
  ];
}
