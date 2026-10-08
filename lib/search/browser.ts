// Browser-side engine factory. Lexical engines are cheap and synchronous;
// the semantic model (~35MB) is fetched only the first time v3 needs it and
// then served from the browser cache.
import { bm25Engine, phraseEngine, substringEngine } from "./lexical";
import { decodeIndex, fuse, rankByVector, type VectorIndex, type VectorIndexJson } from "./semantic";
import type { SearchDoc, SearchHit, Variant } from "./types";

export type Lexical = (q: string) => SearchHit[];

export async function lexicalEngine(variant: Variant, docs: SearchDoc[]): Promise<Lexical> {
  if (variant === "v0") return substringEngine(docs);
  if (variant === "v1") return bm25Engine(docs);
  const phrases = (await import("@/data/search-phrases.json")).default as Record<string, string[]>;
  return phraseEngine(docs, phrases);
}

export interface Semantic {
  embed: (q: string) => Promise<Float32Array>;
  index: VectorIndex;
}

export type LoadProgress = { loaded: number; total: number };
let semantic: Promise<Semantic> | null = null;
const listeners = new Set<(p: LoadProgress) => void>();

export function loadSemantic(assetBase: string, onProgress?: (p: LoadProgress) => void): Promise<Semantic> {
  if (onProgress) listeners.add(onProgress);
  semantic ??= (async () => {
    const { env, pipeline } = await import("@huggingface/transformers");
    // Serve the model as a "remote" model hosted on this site. As a local model,
    // Transformers.js fetches every file in full just to learn its size when a
    // progress callback is set, so the 35MB model would be downloaded twice.
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    env.remoteHost = `${location.origin}${assetBase}/models/`;
    env.remotePathTemplate = "{model}/";
    const files = new Map<string, LoadProgress>();
    const [extractor, index] = await Promise.all([
      pipeline("feature-extraction", "e5-small-th", {
        dtype: "q8",
        device: "wasm",
        progress_callback: (e: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (e.status !== "progress" || !e.file || !e.total) return;
          files.set(e.file, { loaded: e.loaded ?? 0, total: e.total });
          const sum = [...files.values()].reduce((a, f) => ({ loaded: a.loaded + f.loaded, total: a.total + f.total }), { loaded: 0, total: 0 });
          listeners.forEach((l) => l(sum));
        },
      }),
      fetch(`${assetBase}/search/vectors.json`)
        .then((r) => r.json() as Promise<VectorIndexJson>)
        .then(decodeIndex),
    ]);
    const embed = async (q: string) =>
      (await extractor(`query: ${q}`, { pooling: "mean", normalize: true })).data as Float32Array;
    await embed("warm up"); // the first inference is slow; pay it before the visitor types
    return { index, embed };
  })();
  semantic.catch(() => (semantic = null));
  return semantic;
}

export async function hybridSearch(sem: Semantic, lexical: Lexical, q: string): Promise<SearchHit[]> {
  return fuse([lexical(q), rankByVector(sem.index, await sem.embed(q))]);
}
