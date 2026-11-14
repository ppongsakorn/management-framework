#!/usr/bin/env node
// Explainer clips: the hand-off between this repo and the skill/tool that makes the clips.
// See docs/videos/README.md for the whole flow.
//
//   node scripts/video.mjs brief <slug…> | --all [--out .cache/video-briefs]
//       writes <out>/<slug>/brief.json, brief.md and diagram.svg for the clip maker
//   node scripts/video.mjs add <slug> --size desktop|mobile (--youtube <id|url> | --file <videos/x.webm | https url>)
//       --duration <m:ss> --tool <name> [--skill <name>] [--title <text>] [--poster <videos/x.webp | url>]
//       [--captions <videos/x.th.vtt | url>] [--date YYYY-MM-DD] [--no-ai] [--note <text>] [--hash <briefHash>]
//       registers (or replaces) one size of a framework's clip in data/videos.json; every clip needs both sizes
//   node scripts/video.mjs remove <slug>
//   node scripts/video.mjs check
//       lists clips made from an older version of their framework, and frameworks without a clip
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { SIZES, briefHash, briefMarkdown, buildBrief, parseDuration, standaloneDiagram, videoProblems, youtubeId } from "./video-lib.mjs";

const VIDEOS = "data/videos.json";
const PUBLIC = "public";
// "public/videos/x.webm" and "videos/x.webm" name the same file; the entry keeps the site-relative form
const sitePath = (v) => (v && !/^https:/.test(v) ? v.replace(/^\.?\/?public\//, "") : v);
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const { groups, frameworks } = read("data/frameworks.json");
const useCases = read("data/use-cases.json");
const slugs = new Set(frameworks.map((f) => f.slug));
const bySlug = new Map(frameworks.map((f) => [f.slug, f]));

function fail(msg) {
  console.error(`video: ${msg}`);
  process.exit(1);
}

function framework(slug) {
  const fw = bySlug.get(slug);
  if (!fw) fail(`unknown framework "${slug}" (see data/frameworks.json for slugs)`);
  return fw;
}

/** Keys in catalogue order, so a diff shows where a clip was added. */
function save(videos) {
  const out = {};
  for (const f of frameworks) if (videos[f.slug]) out[f.slug] = videos[f.slug];
  fs.writeFileSync(VIDEOS, JSON.stringify(out, null, 2) + "\n");
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "brief") {
  const { values, positionals } = parseArgs({ args: rest, allowPositionals: true, options: { all: { type: "boolean" }, out: { type: "string", default: ".cache/video-briefs" } } });
  const list = values.all ? frameworks : positionals.map(framework);
  if (!list.length) fail("name one or more slugs, or --all");
  for (const fw of list) {
    const dir = path.join(values.out, fw.slug);
    fs.mkdirSync(dir, { recursive: true });
    const brief = buildBrief(fw, { groups, frameworks, useCases });
    fs.writeFileSync(path.join(dir, "brief.json"), JSON.stringify(brief, null, 2) + "\n");
    fs.writeFileSync(path.join(dir, "brief.md"), briefMarkdown(brief));
    fs.writeFileSync(path.join(dir, "diagram.svg"), standaloneDiagram(fw) + "\n");
    console.log(`${dir}/  (briefHash ${brief.briefHash})`);
  }
} else if (cmd === "add") {
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      size: { type: "string" },
      youtube: { type: "string" },
      file: { type: "string" },
      duration: { type: "string" },
      tool: { type: "string" },
      skill: { type: "string" },
      title: { type: "string" },
      poster: { type: "string" },
      captions: { type: "string", multiple: true },
      lang: { type: "string", default: "th" },
      date: { type: "string", default: new Date().toISOString().slice(0, 10) },
      "no-ai": { type: "boolean" },
      note: { type: "string" },
      hash: { type: "string" },
    },
  });
  const fw = framework(positionals[0]);
  if (!!values.youtube === !!values.file) fail("give exactly one of --youtube or --file");
  let source;
  if (values.youtube) {
    const id = youtubeId(values.youtube);
    if (!id) fail(`not a YouTube id or URL: ${values.youtube}`);
    source = { kind: "youtube", id };
  } else source = { kind: "file", src: sitePath(values.file) };
  const current = briefHash(fw);
  if (values.hash && values.hash !== current) {
    console.warn(`video: warning: the clip was made from brief ${values.hash}, but ${fw.slug} has changed since (now ${current}); "check" will list it as outdated`);
  }
  if (!SIZES[values.size]) fail("give --size desktop (16:9) or --size mobile (9:16)");
  const clip = {
    title: values.title ?? `${fw.name} ใน ${Math.round(parseDuration(values.duration) / 60) || 1} นาที`,
    durationSec: parseDuration(values.duration),
    aspect: SIZES[values.size],
    source,
    ...(values.poster && { poster: sitePath(values.poster) }),
    ...(values.captions && { captions: values.captions.map((src) => ({ src: sitePath(src), lang: values.lang, label: values.lang === "th" ? "ไทย" : values.lang.toUpperCase() })) }),
  };
  const videos = fs.existsSync(VIDEOS) ? read(VIDEOS) : {};
  const old = videos[fw.slug] ?? {};
  // shared facts follow the latest registration; the other size is kept as it was
  const entry = {
    lang: values.lang,
    desktop: values.size === "desktop" ? clip : old.desktop,
    mobile: values.size === "mobile" ? clip : old.mobile,
    madeWith: { tool: values.tool, ...(values.skill && { skill: values.skill }), date: values.date, ai: !values["no-ai"] },
    briefHash: values.hash ?? current,
    ...((values.note ?? old.note) && { note: values.note ?? old.note }),
  };
  Object.keys(entry).forEach((k) => entry[k] === undefined && delete entry[k]);
  const problems = videoProblems(fw.slug, entry, slugs, { publicDir: PUBLIC, partial: true });
  if (problems.length) fail(`not registered:\n  - ${problems.join("\n  - ")}`);
  videos[fw.slug] = entry;
  save(videos);
  const other = values.size === "desktop" ? "mobile" : "desktop";
  console.log(`${values.size} clip of ${fw.slug} saved in ${VIDEOS}` + (entry[other] ? "; next: npm test, then add a data/changelog.json entry" : `; now add the ${other} size (${SIZES[other]}) — npm test fails until both are there`));
} else if (cmd === "remove") {
  const videos = read(VIDEOS);
  const slug = rest[0];
  if (!videos[slug]) fail(`no clip registered for "${slug}"`);
  delete videos[slug];
  save(videos);
  console.log(`removed ${slug} from ${VIDEOS}`);
} else if (cmd === "check") {
  const videos = read(VIDEOS);
  let bad = 0;
  for (const [slug, v] of Object.entries(videos)) {
    const problems = videoProblems(slug, v, slugs, { publicDir: PUBLIC });
    if (problems.length) {
      bad++;
      console.log(`✗ ${slug}: ${problems.join("; ")}`);
    } else if (v.briefHash !== briefHash(bySlug.get(slug))) {
      console.log(`! ${slug}: content changed since the clip was made (clip ${v.briefHash}, now ${briefHash(bySlug.get(slug))}); review it, then re-register or remake`);
    } else console.log(`✓ ${slug}`);
  }
  const missing = frameworks.filter((f) => !videos[f.slug]).map((f) => f.slug);
  console.log(`${Object.keys(videos).length}/${frameworks.length} frameworks have a clip${missing.length ? `; without: ${missing.join(" ")}` : ""}`);
  if (bad) process.exit(1);
} else {
  fail("usage: video.mjs brief|add|remove|check (see the header of scripts/video.mjs)");
}
