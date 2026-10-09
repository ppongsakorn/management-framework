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
  assert.ok(frameworks.length >= 51, `expected at least 51 frameworks, got ${frameworks.length}`);
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

test("every use case names its event and cites a source", () => {
  const cases = JSON.parse(fs.readFileSync("data/use-cases.json", "utf8"));
  const slugs = new Set(frameworks.map((f) => f.slug));
  for (const [slug, list] of Object.entries(cases)) {
    assert.ok(slugs.has(slug), `use cases for unknown framework ${slug}`);
    for (const c of list) {
      for (const k of ["who", "event", "problem", "how", "result", "searchPhrase"]) assert.ok(c[k], `${slug} / ${c.who} missing ${k}`);
      assert.ok(c.sources.length > 0, `${slug} / ${c.who} has no source`);
      for (const s of c.sources) assert.match(s.url, /^https?:\/\//, `${slug} / ${c.who} source url`);
    }
  }
});

test("history log is valid and newest first", () => {
  const log = JSON.parse(fs.readFileSync("data/changelog.json", "utf8"));
  assert.ok(log.length > 0);
  let prev = "9999-12-31";
  for (const c of log) {
    assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/, c.title);
    assert.ok(c.date <= prev, `${c.title} is out of order`);
    prev = c.date;
    assert.ok(["launch", "content", "feature", "fix"].includes(c.kind), `${c.title} kind`);
    assert.ok(c.title && c.items.length > 0, `${c.date} needs a title and items`);
    for (const l of c.links ?? []) assert.match(l.href, /^\//, `${c.title} links must be site paths`);
  }
});

test("related frameworks point at real, different frameworks", () => {
  const slugs = new Set(frameworks.map((f) => f.slug));
  for (const f of frameworks) {
    const rel = f.related ?? {};
    assert.ok(Object.values(rel).flat().length > 0, `${f.slug} has no related frameworks`);
    for (const [kind, list] of Object.entries(rel)) {
      assert.ok(["before", "with", "after"].includes(kind), `${f.slug} related.${kind}`);
      assert.ok(list.length <= 3, `${f.slug} related.${kind} has more than 3`);
      for (const s of list) {
        assert.ok(slugs.has(s), `${f.slug} relates to unknown ${s}`);
        assert.notEqual(s, f.slug, `${f.slug} relates to itself`);
      }
    }
  }
});
