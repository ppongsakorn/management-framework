"use client";

import { useEffect, useRef, useState } from "react";
import { hybridSearch, lexicalEngine, loadSemantic, shouldPreload, type Lexical, type LoadProgress, type Semantic } from "@/lib/search/browser";
import type { SearchDoc, SearchHit, Variant } from "@/lib/search/types";

export type SemanticState = "off" | "idle" | "loading" | "ready" | "error";

/**
 * Runs one search variant. Results always appear immediately; nothing makes
 * the visitor wait. v3 preloads its semantic model silently once the page is
 * idle; queries typed after that get fused results (a few tens of ms), and
 * queries typed before it get lexical results. A list on screen is never
 * swapped when the model finishes loading — the next keystroke uses it.
 */
export function useSearch(variant: Variant, docs: SearchDoc[], query: string, assetBase: string) {
  const [lexical, setLexical] = useState<Lexical | null>(null);
  const semantic = useRef<Semantic | null>(null);
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
        semantic.current = s;
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
    const sem = semantic.current;
    if (variant !== "v3" || !sem) {
      setHits(lexical(q));
      if (variant === "v3") startSemantic.current(); // no preload (Data Saver) → load now
      return;
    }
    // Fused results normally take a few tens of ms; if they are slower, show lexical ones meanwhile.
    let fallbackShown = false;
    const fallback = setTimeout(() => {
      if (seq.current !== id) return;
      fallbackShown = true;
      setHits(lexical(q));
    }, 100);
    hybridSearch(sem, lexical, q)
      .then((fused) => {
        clearTimeout(fallback);
        if (seq.current === id && !fallbackShown) setHits(fused);
      })
      .catch(() => {
        clearTimeout(fallback);
        if (seq.current === id) setHits(lexical(q));
      });
    return () => clearTimeout(fallback);
  }, [query, lexical, variant]);

  return { hits, semState, progress };
}
