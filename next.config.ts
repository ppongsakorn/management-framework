import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a static site (GitHub Pages): no server, so the AI
// advisor is switched off. Otherwise a standalone Node server with /api/chat.
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = isStatic ? process.env.PAGES_BASE_PATH ?? "" : "";
// SEARCH_VARIANT picks the catalogue search engine (v0–v3, see lib/search/types.ts).
// PAGES_ASSET_BASE is where the shared model/vectors/eval files are served from
// (the variant builds under /v0 … /v3 reuse the root site's copy).
// The default is v3 (the main site); without public/models, e.g. a local `npm run dev`,
// it falls back to lexical results, or run with SEARCH_VARIANT=v2.
const searchEnv = {
  NEXT_PUBLIC_SEARCH_VARIANT: process.env.SEARCH_VARIANT ?? "v3",
  NEXT_PUBLIC_ASSET_BASE: isStatic ? process.env.PAGES_ASSET_BASE ?? basePath : "",
};

const nextConfig: NextConfig = isStatic
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
      // Route handlers can't be exported; only *.tsx / *.ts pages are built,
      // so app/api/chat/route.server.ts is skipped in this mode.
      pageExtensions: ["tsx", "ts"],
      env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_AI_ENABLED: "false", ...searchEnv },
      poweredByHeader: false,
    }
  : {
      output: "standalone",
      pageExtensions: ["tsx", "ts", "server.ts"],
      env: { NEXT_PUBLIC_AI_ENABLED: "true", ...searchEnv },
      poweredByHeader: false,
    };

export default nextConfig;
