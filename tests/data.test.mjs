import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { DIAGRAM_TYPES, renderDiagram } from "../scripts/diagram-renderer.mjs";

const { groups, frameworks } = JSON.parse(fs.readFileSync("data/frameworks.json", "utf8"));

test("six groups in cycle order", () => {
  assert.deepEqual(
    groups.map((g) => g.id),
    ["diag", "dec", "plan", "exec", "ppl", "think"],
  );
  for (const g of groups) assert.ok(g.title && g.question && g.why, g.id);
});

test("every framework is complete and uniquely addressable", () => {
  assert.equal(frameworks.length, 51);
  const slugs = new Set();
  for (const f of frameworks) {
    assert.match(f.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, f.name);
    assert.ok(!slugs.has(f.slug), `duplicate slug ${f.slug}`);
    slugs.add(f.slug);
    assert.ok(groups.some((g) => g.id === f.group), `${f.name} has unknown group`);
    for (const k of ["name", "when", "how", "example", "origin"]) assert.ok(f[k], `${f.name} missing ${k}`);
    assert.equal(f.steps.length, 5, `${f.name} should have 5 steps`);
  }
});

test("every framework has a diagram spec that renders cleanly", () => {
  for (const f of frameworks) {
    assert.ok(DIAGRAM_TYPES.includes(f.diagram?.type), `${f.slug} has unknown diagram type`);
    const svg = renderDiagram(f.diagram.type, f.diagram.spec);
    assert.ok(svg.startsWith("<svg"), `${f.slug} did not render`);
    assert.ok(!/undefined|NaN/.test(svg), `${f.slug} svg has undefined/NaN`);
    assert.ok(!/<script|on\w+=/i.test(svg), `${f.slug} svg contains script/handlers`);
  }
});
