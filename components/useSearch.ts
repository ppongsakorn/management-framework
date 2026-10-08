"use client";

import { useEffect, useRef, useState } from "react";
import { hybridSearch, lexicalEngine, loadSemantic, type Lexical, type LoadProgress } from "@/lib/search/browser";
import type { SearchDoc, SearchHit, Variant } from "@/lib/search/types";

export type SemanticState = "off" | "idle" | "loading" | "ready" | "error";

/** Runs one search variant; v3 shows lexical results at once and upgrades them when the model is ready. */
export function useSearch(variant: Variant, docs: SearchDoc[], query: string, assetBase: string) {
  const [lexical, setLexical] = useState<Lexical | null>(null);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [semState, setSemState] = useState<SemanticState>(variant === "v3" ? "idle" : "off");
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    let alive = true;
    lexicalEngine(variant, docs).then((e) => alive && setLexical(() => e));
    return () => {
      alive = false;
    };
  }, [variant, docs]);

  useEffect(() => {
    const q = query.trim();
    const id = ++seq.current;
    if (!q || !lexical) {
      setHits(null);
      return;
    }
    setHits(lexical(q));
    if (variant !== "v3") return;
    if (semState === "idle") setSemState("loading");
    const t = setTimeout(async () => {
      try {
        const sem = await loadSemantic(assetBase, setProgress);
        if (seq.current !== id) return;
        setSemState("ready");
        const fused = await hybridSearch(sem, lexical, q);
        if (seq.current === id) setHits(fused);
      } catch (e) {
        console.error("semantic search unavailable", e);
        setSemState("error");
      }
    }, 200);
    return () => clearTimeout(t);
    // semState only gates the first load; re-running on it would search twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, lexical, variant, assetBase]);

  return { hits, semState, progress };
}
