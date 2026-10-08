"use client";

import { useEffect, useRef, useState } from "react";
import { hybridSearch, lexicalEngine, loadSemantic, type Lexical, type LoadProgress, type Semantic } from "@/lib/search/browser";
import type { SearchDoc, SearchHit, Variant } from "@/lib/search/types";

export type SemanticState = "off" | "idle" | "loading" | "ready" | "error";

/** Skip the background download on Data Saver or very slow connections; such visitors load it on first search. */
function shouldPreload(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !(c?.saveData || c?.effectiveType === "slow-2g" || c?.effectiveType === "2g");
}

/**
 * Runs one search variant. v3 preloads its semantic model once the page is
 * idle, so by the time the visitor types it is usually ready and results
 * arrive already fused (no reshuffle). Until then lexical results are shown.
 */
export function useSearch(variant: Variant, docs: SearchDoc[], query: string, assetBase: string) {
  const [lexical, setLexical] = useState<Lexical | null>(null);
  const [semantic, setSemantic] = useState<Semantic | null>(null);
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

  const startSemantic = useRef(() => {});
  startSemantic.current = () => {
    if (variant !== "v3" || semState !== "idle") return;
    setSemState("loading");
    loadSemantic(assetBase, setProgress)
      .then((s) => {
        setSemantic(s);
        setSemState("ready");
      })
      .catch((e) => {
        console.error("semantic search unavailable", e);
        setSemState("error");
      });
  };

  // Preload in the background after the page has settled.
  useEffect(() => {
    if (variant !== "v3" || !shouldPreload()) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => startSemantic.current(), { timeout: 3000 });
    return () => cancel(handle);
  }, [variant]);

  useEffect(() => {
    const q = query.trim();
    const id = ++seq.current;
    if (!q || !lexical) {
      setHits(null);
      return;
    }
    if (variant !== "v3" || !semantic) {
      setHits(lexical(q));
      if (variant === "v3") startSemantic.current(); // no preload (Data Saver) → load now
      return;
    }
    // Model ready: show only fused results (keep the previous list until they arrive) so nothing reshuffles.
    hybridSearch(semantic, lexical, q).then((fused) => {
      if (seq.current === id) setHits(fused);
    });
  }, [query, lexical, semantic, variant]);

  const pending = query.trim() !== "" && hits === null && variant !== "v0";
  return { hits, semState, progress, pending };
}
