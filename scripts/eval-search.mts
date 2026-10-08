// Score every search variant on the labelled Thai query set (tests/search-queries.json).
//
// Usage: npx tsx scripts/eval-search.mts [out.json]
// Needs the generated model (public/models/e5-small-th) and index (public/search/vectors.json).
import fs from "node:fs";
import { env, pipeline } from "@huggingface/transformers";
import { bm25Engine, phraseEngine, substringEngine } from "../lib/search/lexical";
import { decodeIndex, fuse, rankByVector, type VectorIndexJson } from "../lib/search/semantic";
import type { SearchDoc, SearchHit } from "../lib/search/types";

interface Query {
  q: string;
  relevant: string[];
  difficulty: "easy" | "medium" | "hard";
  kind: string;
}

const out = process.argv[2] ?? "public/search/eval.json";
const { frameworks } = JSON.parse(fs.readFileSync("data/frameworks.json", "utf8")) as { frameworks: SearchDoc[] };
const phrases = JSON.parse(fs.readFileSync("data/search-phrases.json", "utf8")) as Record<string, string[]>;
const queries = JSON.parse(fs.readFileSync("tests/search-queries.json", "utf8")) as Query[];
const index = decodeIndex(JSON.parse(fs.readFileSync("public/search/vectors.json", "utf8")) as VectorIndexJson);

env.allowRemoteModels = false;
env.localModelPath = "public/models/";
const embed = await pipeline("feature-extraction", "e5-small-th", { dtype: "q8" });
const embedQuery = async (q: string) =>
  (await embed(`query: ${q}`, { pooling: "mean", normalize: true })).data as Float32Array;

const v0 = substringEngine(frameworks);
const v1 = bm25Engine(frameworks);
const v2 = phraseEngine(frameworks, phrases);

type Engine = (q: string) => Promise<SearchHit[]> | SearchHit[];
const engines: Record<string, Engine> = {
  v0,
  v1,
  v2,
  "v3-semantic-only": async (q) => rankByVector(index, await embedQuery(q)),
  v3: async (q) => fuse([v2(q), rankByVector(index, await embedQuery(q))]),
};

const ks = [1, 3, 5] as const;
const report: Record<string, unknown> = {};
const perQuery: Record<string, { q: string; relevant: string[]; difficulty: string; top: Record<string, string[]> }> = {};

for (const [name, engine] of Object.entries(engines)) {
  const rows: { difficulty: string; rank: number }[] = [];
  for (const query of queries) {
    const hits = (await engine(query.q)).slice(0, 10);
    const rank = hits.findIndex((h) => query.relevant.includes(h.slug)) + 1; // 0 = not found in top 10
    rows.push({ difficulty: query.difficulty, rank });
    (perQuery[query.q] ??= { q: query.q, relevant: query.relevant, difficulty: query.difficulty, top: {} }).top[name] =
      hits.slice(0, 5).map((h) => h.slug);
  }
  const score = (subset: typeof rows) => ({
    n: subset.length,
    ...Object.fromEntries(ks.map((k) => [`hit@${k}`, subset.filter((r) => r.rank > 0 && r.rank <= k).length / subset.length])),
    mrr: subset.reduce((s, r) => s + (r.rank ? 1 / r.rank : 0), 0) / subset.length,
    noResult: subset.filter((r) => r.rank === 0).length,
  });
  report[name] = {
    all: score(rows),
    easy: score(rows.filter((r) => r.difficulty === "easy")),
    medium: score(rows.filter((r) => r.difficulty === "medium")),
    hard: score(rows.filter((r) => r.difficulty === "hard")),
  };
}

fs.mkdirSync(out.replace(/\/[^/]+$/, ""), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ queries: queries.length, metrics: report, perQuery: Object.values(perQuery) }, null, 1));

const pct = (x: number) => `${(x * 100).toFixed(0)}%`.padStart(5);
console.log(`\n${queries.length} queries — hit@k = a correct framework in the top k; MRR = mean 1/rank\n`);
console.log("variant            hit@1 hit@3 hit@5   MRR | hit@3 easy  med  hard");
for (const [name, r] of Object.entries(report) as [string, Record<string, Record<string, number>>][]) {
  console.log(
    `${name.padEnd(18)} ${pct(r.all["hit@1"])} ${pct(r.all["hit@3"])} ${pct(r.all["hit@5"])}  ${r.all.mrr.toFixed(2)} |      ${pct(r.easy["hit@3"])}${pct(r.medium["hit@3"])}${pct(r.hard["hit@3"])}`,
  );
}
