import type { Variant } from "@/lib/search/types";

/**
 * Build-time switches (see next.config.ts):
 * - basePath: set when the site is served from a sub-path, e.g. GitHub Pages `/<repo>`.
 * - assetBase: where the shared search assets (model, vectors, eval) live; the
 *   variant builds under /v1, /v2, /v3 share the root site's copy.
 * - aiEnabled: false for the static export, which has no server for /api/chat.
 * - searchVariant: which search engine the catalogue uses (see lib/search/types.ts).
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const assetBase = process.env.NEXT_PUBLIC_ASSET_BASE ?? basePath;
export const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED !== "false";
export const searchVariant = (process.env.NEXT_PUBLIC_SEARCH_VARIANT || "v0") as Variant;
