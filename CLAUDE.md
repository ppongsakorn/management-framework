# เข็มทิศกรอบความคิด — notes for Claude sessions

Public Thai educational site about management frameworks, with an optional AI advisor.
Live: https://ppongsakorn.github.io/management-framework/ (GitHub Pages, auto-deploys on push to `main`).
Owner: a Data & AI Team Lead; examples in the content are written for a data team on an Azure stack.

## How the owner wants to work

- Reply in Thai. English technical terms are fine where Thai readers use them.
- The repo is public. Be careful with copyright: content is re-explained in our own words, never copied. Crediting the originator of an idea (in the `origin` field) is wanted; otherwise avoid naming people or companies unless necessary. Real-world use cases are the exception: public, sourced cases naming organisations and people are wanted, each with a `sources` link and an `event` line saying which public event it comes from.
- Names (branches, files, slugs) must not reference people or books.
- Be selective about what goes into git: generated files (`data/diagrams.json`, `public/models/`, `public/search/`, `.cache/`, `site/`, `out/`) stay out; research notes and reports live in `research_notes/` and `reports/`, excluded via `.git/info/exclude`.
- Never paste tokens or credentials into chat or the repo.
- Content should keep developing. Every content or feature change gets an entry at the top of `data/changelog.json`; it feeds `/updates`, the home page and the mobile app.
- The owner likes to see things verified on the live site after deploy, with real numbers (screenshots, counts, eval scores). Report limits honestly (what was not verified, vendor-reported results, disputed stories).

## Delivery flow

1. Branch from `main` (`feature/<topic>`), commit with a clear message, push with `git push -u origin <branch>`.
2. Open a PR with the GitHub MCP tools (`gh` is not available), merge with `merge_method: "rebase"`.
3. Pages deploys in a few minutes. Wait for it (poll with curl until the new content appears), then verify live with Playwright (`/opt/node-tools/node_modules/playwright/index.mjs`, Chromium preinstalled).
4. Tell the owner what changed, what was verified, and what is still open.

## Architecture in one breath

Next.js 16 App Router, React 19, TypeScript, plain CSS tokens with dark mode. JSON in `data/` is the single source of truth. On push, GitHub Actions runs tests, renders diagrams, builds the trimmed Thai e5 search model and vectors, runs the search eval, builds the site five times (root = search v3, the owner's choice; `/v0`, `/v1`, `/v2` and `/v3` = comparison builds sharing the root's model; `/v3` just duplicates the root and is kept so earlier links still work) and deploys to Pages. The AI advisor (`/api/chat`, Claude `claude-opus-5-5`, optional Microsoft Foundry) exists only in server mode and is off on Pages. `/architecture` explains all of this with diagrams whose numbers are read from the data at build time.

Routes: desktop pages in `app/(site)/`, phone app in `app/mobile/` (own screens, bottom tab bar; phone-sized screens are redirected there before paint by `lib/mobile.ts`, "เว็บเต็ม" opts out via localStorage). Search variants: the root and the phone app use `DEFAULT_VARIANT` (`lib/site.ts`, v3); only the `/v0` baseline build makes the phone app fall back to v2. The variant banner shows on non-default builds only. Without `public/models` (e.g. a local `npm run dev`) v3 falls back to lexical results; use `SEARCH_VARIANT=v2` to avoid the console error. Every page registers ten read-only WebMCP tools on `document.modelContext` (`components/WebMcp.tsx` registers what `lib/webmcp-tools.ts` builds; the count constant lives in `lib/webmcp.ts` and a console warning fires if they drift). The tools import `data/*.json` lazily on first call: never pass big JSON from a layout to a client component as props, because it is serialised into every page's HTML (that once made every page ~900 KB). The catalogue and the phone search keep `?q=` (and `?g=` on the catalogue) in the URL, and `show_in_catalogue` relies on it. The `search_frameworks` tool uses the phrase engine (v2), so its ranking can differ slightly from the on-screen v3 results; the header chip (`components/WebMcpBadge.tsx`) lights up when a browser exposes the API.

## Data files and how to extend them

- `data/frameworks.json`: 61 frameworks in 6 groups (`diag`, `dec`, `plan`, `exec`, `ppl`, `think`). Each has `when`, `how`, exactly 5 `steps`, an `example` (a data-team situation), `origin`, `related` (`before`/`with`/`after` slugs, 1–3 each, at least one list; a test enforces it; shown as "ใช้ร่วมกับตัวไหนได้บ้าง" and exposed by the `suggest_sequence` WebMCP tool) and a `diagram` spec (`type` from `scripts/diagram-renderer.mjs`: matrix, flow, cycle, stack, split, tree, table, radial, fishbone, lanes, gantt, timeline, bars2, pareto, rings, hier). `|` breaks a line; a parenthesised English term such as `บล็อกเวลาไว้ (Time Boxing)` is rendered smaller automatically. Insert a new framework at the end of its group so the catalogue stays grouped. Counts are read from the data; do not hard-code 61 anywhere.
- `data/use-cases.json`: keyed by slug. Each case: `who`, `event`, `country`, `year` (may be ""), `problem`, `how`, `result`, `searchPhrase`, `sources[{title,url,lang}]`, optional `disputed` + `note`. Only cases whose source was actually opened; flag vendor/self-reported results in `note`. Non-disputed cases are also fed to the AI advisor's system prompt. Add each case's `searchPhrase` to `data/search-phrases.json`.
- `data/search-phrases.json`: ~30 situation phrases per framework. Phrases must be specific; generic ones (e.g. "โค้ชลูกน้องยังไง") steal rank from other frameworks. After changing phrases or frameworks, run `npm run search:index && npm run search:eval` and compare MRR with the previous `public/search/eval.json` (last known: v2 0.87, v3 0.91 on 100 queries). A test query must never equal a phrase exactly.
- `tests/search-queries.json`: 100 blind Thai queries with `relevant` slugs and `difficulty`; add a few for every new framework.
- `data/changelog.json`: newest first; `kind` is launch | content | feature | fix; links are desktop paths (the mobile app maps them).
- README has a generated catalogue section (`## Framework ทั้ง N ตัว`); regenerate it from the data when frameworks change.

## Commands and gotchas

- `npm test` (data shape, counts, changelog order), `npm run typecheck`, `npm run build`. Use `npm run build`, not `npx next build`: the `prebuild` hook regenerates `data/diagrams.json`, and a direct `next build` silently ships pages without diagrams.
- Static export: `STATIC_EXPORT=1 PAGES_BASE_PATH=/management-framework npm run build` (output in `out/`). Serve `out/` under a `management-framework/` folder with `python3 -m http.server` to test base-path behaviour locally.
- Search model tooling needs `ONNXRUNTIME_NODE_INSTALL=skip` in the environment and Python packages `numpy onnx tokenizers wordfreq` (`npm run search:model` downloads the pinned e5 source into `.cache/e5-source`).
- Playwright checks that have paid off: horizontal overflow at 360–390px on every page, long-task count on the search page, model download count (must be 1), a fake `document.modelContext` injected with `addInitScript` to exercise WebMCP tools, screenshots of diagrams in light and dark.
- Diagram text overflow: render a gallery with `scripts/diagram-renderer.mjs` and measure `getBBox()` against the host rect (see the overflow check idea in git history of scratch scripts); split long labels with `|`.
- Deep research runs: parallel subagents share one web-search budget (~200 searches per turn), so give each a cap and expect a second round to fill gaps.

## Open decisions and candidates

- Decided: the root uses search v3 (owner: a ~33 MB model download is acceptable). I had recommended v2; revisit only if real usage data (e.g. Matomo site-search keywords and zero-result rate) shows v3 does not help.
- Whether to keep Jeff Bezos as the originator credit in an `origin` field.
- Skill/Will Matrix has no documented use cases yet; RICE has only 3.
- Pages without a mobile version: `/compare`, `/advisor`, `/architecture`.
- A new framework must also get `related` entries, and existing frameworks that should point at it.
- WebMCP ideas not built yet: `list_groups`, `get_diagram`, `whats_new`, `get_citation`, and `get_audio` if audio clips happen. Keep the total near 10 tools; more makes agents choose worse. Declarative (`<form>` attribute) tools are unverified against the spec.
- Audio clips per framework were proposed (phase 1: browser speechSynthesis button, phase 2: Azure AI Speech files built in CI, not committed); the owner has not decided.
- Candidate frameworks already suggested: Wardley Map, DACI, Balanced Scorecard, SBI Feedback, Chesterton's Fence, Reference Class Forecasting, Three Horizons, Six Thinking Hats, Stakeholder Map, Jobs-to-be-Done, DMAIC, DORA Metrics, Little's Law, Five Dysfunctions, Ladder of Inference.
- Old branches the owner can delete in the GitHub UI: `claude/amazing-thompson-fnganr` and merged `feature/*` branches.
