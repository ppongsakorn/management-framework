import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { MAX_FILE_MB, SIZES, briefHash, buildBrief, parseDuration, standaloneDiagram, videoProblems, youtubeId } from "../scripts/video-lib.mjs";

const { groups, frameworks } = JSON.parse(fs.readFileSync("data/frameworks.json", "utf8"));
const useCases = JSON.parse(fs.readFileSync("data/use-cases.json", "utf8"));
const videos = JSON.parse(fs.readFileSync("data/videos.json", "utf8"));
const slugs = new Set(frameworks.map((f) => f.slug));

test("every registered clip is complete, its files present and small, and tied to a brief", (t) => {
  for (const [slug, v] of Object.entries(videos)) {
    assert.deepEqual(videoProblems(slug, v, slugs, { publicDir: "public" }), [], slug);
    const now = briefHash(frameworks.find((f) => f.slug === slug));
    // Not a failure: content may be edited before the clip is remade. `npm run video:check` lists these.
    if (v.briefHash !== now) t.diagnostic(`${slug}: framework changed since the clip was made (${v.briefHash} → ${now})`);
  }
  t.diagnostic(`${Object.keys(videos).length}/${frameworks.length} frameworks have a clip`);
});

const clip = (patch = {}) => ({ title: "5 Whys ใน 1 นาที", durationSec: 84, aspect: "16:9", source: { kind: "youtube", id: "dQw4w9WgXcQ" }, ...patch });
const entry = (patch = {}) => ({ lang: "th", desktop: clip(), mobile: clip({ aspect: "9:16" }), madeWith: { tool: "Tool", date: "2026-11-14", ai: true }, briefHash: "0123456789ab", ...patch });

test("clip rules reject what would break the site", () => {
  assert.deepEqual(videoProblems("5-whys", entry(), slugs), []);
  const bad = (patch) => videoProblems("5-whys", entry(patch), slugs);
  const desk = (patch) => bad({ desktop: clip(patch) });
  assert.ok(desk({ source: { kind: "file", src: "/videos/5-whys.mp4" } }).length, "a repo file is named without a leading slash");
  assert.ok(desk({ source: { kind: "file", src: "models/5-whys.webm" } }).length, "repo files live in public/videos/ only");
  assert.ok(desk({ source: { kind: "file", src: "videos/5-whys.mov" } }).length, "webm or mp4 only");
  assert.ok(desk({ source: { kind: "file", src: "http://example.com/a.mp4" } }).length, "plain http is refused");
  assert.deepEqual(desk({ source: { kind: "file", src: "https://cdn.example.com/a.mp4?v=2" } }), []);
  assert.ok(desk({ captions: [{ src: "https://cdn.example.com/a.vtt", lang: "th", label: "ไทย" }] }).length, "YouTube clips use YouTube subtitles");
  assert.ok(desk({ durationSec: 84.5 }).length);
  assert.ok(desk({ aspect: "9:16" }).length, "the desktop size is 16:9");
  assert.ok(bad({ mobile: clip({ aspect: "16:9" }) }).length, "the mobile size is 9:16");
  assert.ok(bad({ madeWith: { tool: "Tool", date: "2026-11-14" } }).length, "the AI flag is required");
  assert.ok(bad({ titel: "typo" }).length, "unknown fields are refused");
  assert.ok(videoProblems("no-such-framework", entry(), slugs).length);
});

test("every clip comes in both sizes, desktop and mobile", () => {
  const { mobile, ...onlyDesktop } = entry();
  assert.match(videoProblems("5-whys", onlyDesktop, slugs).join(), /both sizes/);
  assert.deepEqual(videoProblems("5-whys", onlyDesktop, slugs, { partial: true }), [], "video:add may register one size first");
  assert.deepEqual(SIZES, { desktop: "16:9", mobile: "9:16" });
});

test("a clip kept in the repo must be there and stay under the size cap", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clips-"));
  fs.mkdirSync(path.join(dir, "videos"));
  const files = (name, aspect) => clip({ aspect, source: { kind: "file", src: `videos/${name}.webm` }, poster: `videos/${name}.webp`, captions: [{ src: `videos/${name}.th.vtt`, lang: "th", label: "ไทย" }] });
  const e = entry({ desktop: files("5-whys", "16:9"), mobile: files("5-whys-mobile", "9:16") });
  assert.equal(videoProblems("5-whys", e, slugs, { publicDir: dir }).length, 6, "all six files are missing");
  for (const n of ["5-whys", "5-whys-mobile"]) for (const ext of ["webm", "webp", "th.vtt"]) fs.writeFileSync(path.join(dir, "videos", `${n}.${ext}`), "x");
  assert.deepEqual(videoProblems("5-whys", e, slugs, { publicDir: dir }), []);
  fs.truncateSync(path.join(dir, "videos", "5-whys-mobile.webm"), (MAX_FILE_MB + 1) * 1048576);
  assert.match(videoProblems("5-whys", e, slugs, { publicDir: dir }).join(), /over the \d+ MB cap/);
  fs.rmSync(dir, { recursive: true, force: true });
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
