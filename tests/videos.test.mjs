import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { briefHash, buildBrief, parseDuration, standaloneDiagram, videoProblems, youtubeId } from "../scripts/video-lib.mjs";

const { groups, frameworks } = JSON.parse(fs.readFileSync("data/frameworks.json", "utf8"));
const useCases = JSON.parse(fs.readFileSync("data/use-cases.json", "utf8"));
const videos = JSON.parse(fs.readFileSync("data/videos.json", "utf8"));
const slugs = new Set(frameworks.map((f) => f.slug));

test("every registered clip is complete, hosted outside the repo and tied to a brief", (t) => {
  for (const [slug, v] of Object.entries(videos)) {
    assert.deepEqual(videoProblems(slug, v, slugs), [], slug);
    const now = briefHash(frameworks.find((f) => f.slug === slug));
    // Not a failure: content may be edited before the clip is remade. `npm run video:check` lists these.
    if (v.briefHash !== now) t.diagnostic(`${slug}: framework changed since the clip was made (${v.briefHash} → ${now})`);
  }
  t.diagnostic(`${Object.keys(videos).length}/${frameworks.length} frameworks have a clip`);
});

test("clip rules reject what would break the site", () => {
  const ok = { title: "5 Whys ใน 1 นาที", durationSec: 84, lang: "th", aspect: "16:9", source: { kind: "youtube", id: "dQw4w9WgXcQ" }, madeWith: { tool: "Tool", date: "2026-11-14", ai: true }, briefHash: "0123456789ab" };
  assert.deepEqual(videoProblems("5-whys", ok, slugs), []);
  const bad = (patch) => videoProblems("5-whys", { ...ok, ...patch }, slugs);
  assert.ok(bad({ source: { kind: "file", src: "/videos/5-whys.mp4" } }).length, "a file inside the site is refused");
  assert.ok(bad({ source: { kind: "file", src: "http://example.com/a.mp4" } }).length, "plain http is refused");
  assert.deepEqual(bad({ source: { kind: "file", src: "https://cdn.example.com/a.mp4?v=2" } }), []);
  assert.ok(bad({ captions: [{ src: "https://cdn.example.com/a.vtt", lang: "th", label: "ไทย" }] }).length, "YouTube clips use YouTube subtitles");
  assert.ok(bad({ durationSec: 84.5 }).length);
  assert.ok(bad({ madeWith: { tool: "Tool", date: "2026-11-14" } }).length, "the AI flag is required");
  assert.ok(bad({ titel: "typo" }).length, "unknown fields are refused");
  assert.ok(videoProblems("no-such-framework", ok, slugs).length);
});

test("YouTube links and durations are read the way people paste them", () => {
  for (const u of ["dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3", "https://youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"]) {
    assert.equal(youtubeId(u), "dQw4w9WgXcQ", u);
  }
  assert.equal(youtubeId("https://example.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(parseDuration("1:24"), 84);
  assert.equal(parseDuration("84"), 84);
  assert.ok(Number.isNaN(parseDuration("1m24s")));
});

test("every framework has a brief a clip maker can work from", () => {
  for (const fw of frameworks) {
    const b = buildBrief(fw, { groups, frameworks, useCases });
    assert.equal(b.briefHash, briefHash(fw));
    assert.equal(b.scenes.filter((s) => s.id.startsWith("step-")).length, 5, fw.slug);
    assert.ok(b.scenes.find((s) => s.id === "example")?.label === "ตัวอย่างสมมติ", `${fw.slug} example must be labelled hypothetical`);
    const kase = b.scenes.find((s) => s.id === "case");
    if (kase) assert.ok(!kase.source.disputed && kase.source.sources.length > 0, `${fw.slug} case must be sourced and undisputed`);
    const svg = standaloneDiagram(fw);
    assert.ok(!/var\(--/.test(svg), `${fw.slug} diagram still uses CSS variables`);
  }
});
