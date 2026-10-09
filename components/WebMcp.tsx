"use client";

import { useEffect } from "react";
import { buildTools, warmUp } from "@/lib/webmcp-tools";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp";

/**
 * WebMCP (W3C WebML CG draft): registers the site's search and content as
 * tools that an in-browser AI agent can call (see lib/webmcp-tools.ts). It
 * renders nothing, and does nothing on browsers without document.modelContext.
 */

interface ModelContext {
  registerTool: (tool: ReturnType<typeof buildTools>[number], options?: { signal?: AbortSignal }) => Promise<void>;
}

function modelContext(): ModelContext | undefined {
  const d = document as Document & { modelContext?: ModelContext };
  const n = navigator as Navigator & { modelContext?: ModelContext }; // earlier drafts
  return d.modelContext ?? n.modelContext;
}

export function WebMcp() {
  useEffect(() => {
    const ctx = modelContext();
    if (!ctx) return;
    const ac = new AbortController();
    const tools = buildTools();
    if (tools.length !== WEBMCP_TOOL_COUNT) console.warn("WebMCP tool count differs from WEBMCP_TOOL_COUNT", tools.length);
    for (const t of tools) ctx.registerTool(t, { signal: ac.signal }).catch((e) => console.warn("WebMCP register failed", t.name, e));
    warmUp();
    return () => ac.abort();
  }, []);
  return null;
}
