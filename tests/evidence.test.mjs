import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const cases = Object.values(JSON.parse(fs.readFileSync("data/use-cases.json", "utf8"))).flat();

// data/diagrams.json is generated (npm run data) and lib/data.ts imports it; CI runs the tests before any build.
execFileSync("npm", ["run", "--silent", "data"], { stdio: "ignore" });

/** Run a snippet of TypeScript against the app's own modules (path aliases work under tsx). */
function tsx(code) {
  return execFileSync("npx", ["tsx", "-e", code], { encoding: "utf8", maxBuffer: 1 << 26 });
}

test("the advisor prompt carries every non-disputed case's evidence note and source URLs", () => {
  const system = JSON.parse(tsx(`import { ADVISOR_SYSTEM } from "./lib/prompt"; console.log(JSON.stringify(ADVISOR_SYSTEM))`));
  const included = cases.filter((c) => !c.disputed);
  assert.ok(included.some((c) => c.note), "expected some non-disputed cases with notes");
  for (const c of included) {
    if (c.note) assert.ok(system.includes(c.note), `note missing from the advisor prompt: ${c.who}`);
    for (const s of c.sources) assert.ok(system.includes(s.url), `source missing from the advisor prompt: ${c.who}`);
  }
  for (const c of cases.filter((c) => c.disputed)) assert.ok(!system.includes(c.who + " [" + c.event), `disputed case leaked into the prompt: ${c.who}`);
  assert.match(system, /ข้อจำกัดของหลักฐาน/);
});

test("the case list shows every note, as a caveat or as the disputed warning, never an empty box", () => {
  const html = tsx(`import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { UseCases } from "./components/UseCases";
import uc from "./data/use-cases.json";
const all = Object.values(uc as Record<string, any[]>).flat();
console.log(JSON.stringify(renderToStaticMarkup(createElement(UseCases, { cases: all }))));`);
  const out = JSON.parse(html);
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  for (const c of cases) if (c.note) assert.ok(out.includes(esc(c.note)), `note not rendered: ${c.who}`);
  const withNote = cases.filter((c) => c.note && !c.disputed).length;
  assert.equal(out.split("case-caveat").length - 1, withNote, "one caveat box per non-disputed case with a note");
  assert.ok(!out.includes("<p class=\"case-note case-caveat\"><b>หมายเหตุเรื่องหลักฐาน:</b> </p>"));
});

test("WebMCP case tools tell agents to quote evidence notes", () => {
  const src = fs.readFileSync("lib/webmcp-tools.ts", "utf8");
  assert.ok(!/the verified result/.test(src), "tool descriptions must not call case results verified");
  assert.equal((src.match(/never present such results as proof/g) ?? []).length, 2);
});
