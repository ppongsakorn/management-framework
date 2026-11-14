// Explainer clips per framework: the brief a clip-making skill/tool works from,
// and the rules a registered clip in data/videos.json must follow.
// Used by scripts/video.mjs (CLI) and tests/videos.test.mjs. See docs/videos/README.md.
import crypto from "node:crypto";
import { renderDiagram } from "./diagram-renderer.mjs";

export const BRIEF_VERSION = 1;
export const SITE_URL = "https://ppongsakorn.github.io/management-framework";

/** Light-theme values of the CSS tokens in app/globals.css, so a diagram renders outside the site. */
const INK = { "--bg": "#f7f5ef", "--paper": "#ffffff", "--ink": "#1d2430", "--ink2": "#5a6270", "--line": "#e2ded3" };
export const GROUP_COLORS = {
  diag: { c: "#b5322e", cbg: "#fbeeed" },
  dec: { c: "#c7791a", cbg: "#fdf3e3" },
  plan: { c: "#245fa6", cbg: "#e9f0fa" },
  exec: { c: "#2b7a4b", cbg: "#e8f3ec" },
  ppl: { c: "#6b3fa0", cbg: "#f0e9f8" },
  think: { c: "#3f6f78", cbg: "#e6f0f1" },
};

/**
 * Fingerprint of the content a clip narrates. A clip registered with an older hash
 * explains a version of the framework that has since been edited.
 */
export function briefHash(fw) {
  const { name, when, how, steps, example, origin, diagram } = fw;
  const json = JSON.stringify({ name, when, how, steps, example, origin, diagram });
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 12);
}

/** The site's diagram SVG with the CSS variables resolved, on a white card, for use in a video. */
export function standaloneDiagram(fw) {
  const { c, cbg } = GROUP_COLORS[fw.group];
  const vars = { ...INK, "--c": c, "--cbg": cbg };
  const svg = renderDiagram(fw.diagram.type, fw.diagram.spec)
    .replace(/var\((--[a-z0-9]+)\)/g, (m, v) => vars[v] ?? m)
    .replace('font-family="inherit"', 'font-family="Noto Sans Thai, Sarabun, sans-serif"');
  // Paint the background so transparent areas do not turn black in a video tool.
  return svg.replace(/(<svg[^>]*>)/, `$1<rect width="100%" height="100%" fill="${INK["--paper"]}"/>`);
}

const clean = (s) => String(s).replace(/\|/g, " ").replace(/\s+/g, " ").trim();

/** Everything a clip about one framework may say, in scene order, plus the rules and the delivery spec. */
export function buildBrief(fw, { groups, frameworks, useCases }) {
  const group = groups.find((g) => g.id === fw.group);
  const bySlug = new Map(frameworks.map((f) => [f.slug, f]));
  const next = (fw.related?.after ?? []).map((s) => bySlug.get(s)).find(Boolean);
  const kase = (useCases[fw.slug] ?? []).find((c) => !c.disputed);
  const scenes = [
    { id: "hook", seconds: [5, 8], purpose: "ดึงคนดูด้วยสถานการณ์ที่เขาเจอ (พูดเป็นคำถามได้)", onScreen: fw.when, source: { when: fw.when } },
    { id: "idea", seconds: [8, 12], purpose: `บอกชื่อ ${fw.name} และหลักคิดในประโยคเดียว`, onScreen: `${fw.name} — ${fw.how}`, source: { name: fw.name, how: fw.how } },
    { id: "diagram", seconds: [10, 15], purpose: "พาดูแผนภาพ ชี้ทีละส่วนตามลำดับที่อ่าน", visual: "diagram.svg", source: { diagram: fw.diagram } },
    ...fw.steps.map((s, i) => ({ id: `step-${i + 1}`, seconds: [5, 9], purpose: `ขั้นที่ ${i + 1} จาก 5`, onScreen: s, source: { step: s } })),
    { id: "example", seconds: [10, 15], purpose: "เล่าตัวอย่างงานทีมข้อมูล ต้องมีป้าย \"ตัวอย่างสมมติ\" บนจอตลอดฉาก", label: "ตัวอย่างสมมติ", onScreen: fw.example, source: { example: fw.example } },
  ];
  if (kase) {
    scenes.push({
      id: "case",
      optional: true,
      seconds: [8, 12],
      purpose: "กรณีจริงจากแหล่งสาธารณะ แสดงชื่อแหล่งอ้างอิงบนจอ" + (kase.note ? " และพูดข้อจำกัดของหลักฐานด้วย" : ""),
      onScreen: `${kase.who} · ${kase.event}`,
      source: { who: kase.who, event: kase.event, problem: kase.problem, how: kase.how, result: kase.result, note: kase.note ?? null, sources: kase.sources },
    });
  }
  scenes.push({
    id: "close",
    seconds: [5, 8],
    purpose: "ให้เครดิตที่มาของแนวคิด แล้วชวนไปอ่านต่อที่หน้าเว็บ" + (next ? ` และบอกตัวที่ใช้ต่อ (${next.name})` : ""),
    onScreen: `แนวคิดจาก: ${fw.origin}`,
    source: { origin: fw.origin, next: next ? { slug: next.slug, name: next.name } : null, pageUrl: `${SITE_URL}/frameworks/${fw.slug}/` },
  });

  return {
    briefVersion: BRIEF_VERSION,
    briefHash: briefHash(fw),
    slug: fw.slug,
    name: fw.name,
    group: { id: group.id, title: group.title, question: group.question, color: GROUP_COLORS[fw.group].c, background: GROUP_COLORS[fw.group].cbg },
    pageUrl: `${SITE_URL}/frameworks/${fw.slug}/`,
    target: {
      language: "th",
      audience: "หัวหน้าทีมและคนทำงานสายข้อมูล ที่อยากรู้ว่าเมื่อไรควรใช้ framework นี้และใช้อย่างไรใน 1–2 นาที",
      durationSec: { ideal: [60, 90], max: 120 },
      aspect: "16:9",
      tone: "ชัด กระชับ เป็นกันเอง เหมือนหัวหน้าทีมอธิบายให้ลูกทีมฟัง",
    },
    scenes,
    rules: [
      "เล่าด้วยคำของเราเอง จากข้อมูลใน scenes[].source เท่านั้น ห้ามเติมตัวเลข ชื่อคน ชื่อบริษัท หรือข้อเท็จจริงที่ไม่มีใน brief",
      "ตัวอย่างในฉาก example เป็นสถานการณ์สมมติ ต้องมีป้าย \"ตัวอย่างสมมติ\" บนจอ ห้ามเล่าเหมือนเป็นเรื่องจริง",
      "ฉาก case (ถ้าใช้) ต้องแสดงชื่อแหล่งอ้างอิงบนจอ ถ้ามี note ให้พูดข้อจำกัดของหลักฐานด้วย ผลลัพธ์ที่องค์กรรายงานเองห้ามพูดเหมือนเป็นข้อพิสูจน์",
      "ห้ามใช้โลโก้ ปกหนังสือ ภาพหรือเสียงของบุคคลจริง และเพลงที่ไม่มีสิทธิ์ใช้ ภาพเป็นกราฟิกเรียบ ใช้สีกลุ่ม group.color บนพื้น group.background หรือขาว",
      "คำอังกฤษในวงเล็บ เช่น (Time Boxing) ให้คงไว้บนจอ ตัวอักษรไทยใช้ฟอนต์ที่อ่านง่าย ไม่เล็กกว่า 4% ของความสูงภาพ",
      "ใส่คำบรรยายภาษาไทย (ไฟล์ WebVTT แยก หรือ subtitle ของแพลตฟอร์ม) ให้ตรงกับเสียงพูด",
      "ถ้าเสียงหรือภาพสร้างด้วย AI ให้บอกตอนลงทะเบียน (madeWith.ai) หน้าเว็บจะแสดงให้ผู้ชมเห็น",
    ],
    deliver: {
      video: "MP4 (H.264 + AAC) 1920×1080 30fps เปิด faststart หรืออัปโหลด YouTube แบบ Unlisted/Public",
      poster: "JPG 1280×720 (ไม่บังคับ ถ้าไม่มี หน้าเว็บวาดปกให้เองจากชื่อและสีกลุ่ม)",
      captions: "WebVTT ภาษาไทย (สำหรับไฟล์ MP4 ที่ host เอง; YouTube ใช้ subtitle ของ YouTube)",
      hosting: "ห้ามใส่ไฟล์วิดีโอใน repo หรือ public/ ใช้ YouTube หรือที่เก็บไฟล์ที่ให้ URL แบบ https",
      register: `npm run video:add -- ${fw.slug} --youtube <id หรือ URL> --duration <m:ss> --tool "<ชื่อเครื่องมือ>" --skill "<ชื่อ skill>" --title "<ชื่อคลิป>"`,
    },
  };
}

/** The brief as a page a person (or an agent) can read top to bottom. */
export function briefMarkdown(b) {
  const lines = [
    `# คลิปอธิบาย ${b.name}`,
    "",
    `- slug: \`${b.slug}\` · briefHash: \`${b.briefHash}\` · brief v${b.briefVersion}`,
    `- กลุ่ม: ${b.group.title} — ${b.group.question} · สี ${b.group.color} บนพื้น ${b.group.background}`,
    `- หน้าเว็บ: ${b.pageUrl}`,
    `- ผู้ชม: ${b.target.audience}`,
    `- ความยาว: ${b.target.durationSec.ideal.join("–")} วินาที (ไม่เกิน ${b.target.durationSec.max}) · ภาพ ${b.target.aspect} · ภาษา ${b.target.language} · โทน: ${b.target.tone}`,
    "",
    "## ฉาก",
    "",
  ];
  for (const s of b.scenes) {
    lines.push(`### ${s.id}${s.optional ? " (ไม่บังคับ)" : ""} · ${s.seconds.join("–")} วินาที`, "", `- เป้าหมาย: ${s.purpose}`);
    if (s.label) lines.push(`- ป้ายบนจอ: ${s.label}`);
    if (s.onScreen) lines.push(`- บนจอ: ${clean(s.onScreen)}`);
    if (s.visual) lines.push(`- ภาพ: \`${s.visual}\` (ไฟล์ในโฟลเดอร์เดียวกัน)`);
    if (s.source.sources) lines.push(...s.source.sources.map((x) => `- อ้างอิง: ${x.title} — ${x.url}`));
    if (s.source.note) lines.push(`- ข้อจำกัดของหลักฐาน: ${s.source.note}`);
    if (s.id === "case") lines.push(`- ปัญหา: ${s.source.problem}`, `- ใช้อย่างไร: ${s.source.how}`, `- ผลลัพธ์: ${s.source.result}`);
    if (s.id === "close" && s.source.next) lines.push(`- ตัวที่ใช้ต่อ: ${s.source.next.name}`);
    lines.push("");
  }
  lines.push("## กติกา", "", ...b.rules.map((r) => `- ${r}`), "", "## ส่งมอบ", "");
  for (const [k, v] of Object.entries(b.deliver)) lines.push(`- ${k}: ${k === "register" ? `\`${v}\`` : v}`);
  return lines.join("\n") + "\n";
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Accepts a bare id or any common YouTube URL (watch, youtu.be, shorts, embed). */
export function youtubeId(input) {
  const s = String(input ?? "").trim();
  if (YT_ID.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
    return id && YT_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** "84", "1:24" or "01:24" → 84. */
export function parseDuration(input) {
  const s = String(input ?? "").trim();
  const m = s.match(/^(?:(\d+):)?(\d+)$/);
  if (!m) return NaN;
  return m[1] ? Number(m[1]) * 60 + Number(m[2]) : Number(m[2]);
}

const HTTPS = /^https:\/\/[^\s"'<>]+$/;
const KEYS = new Set(["title", "durationSec", "lang", "aspect", "source", "poster", "captions", "madeWith", "briefHash", "note"]);

/** Problems with one registered clip; an empty list means it may be published. */
export function videoProblems(slug, v, slugs) {
  const p = [];
  const need = (ok, msg) => ok || p.push(msg);
  need(slugs.has(slug), `unknown framework ${slug}`);
  if (!v || typeof v !== "object") return [...p, "entry must be an object"];
  for (const k of Object.keys(v)) need(KEYS.has(k), `unknown field ${k}`);
  need(typeof v.title === "string" && v.title.trim().length > 0 && v.title.length <= 80, "title: 1–80 characters");
  need(Number.isInteger(v.durationSec) && v.durationSec >= 10 && v.durationSec <= 600, "durationSec: whole seconds, 10–600");
  need(/^[a-z]{2}$/.test(v.lang ?? ""), "lang: two-letter code, e.g. th");
  need(["16:9", "9:16"].includes(v.aspect), "aspect: 16:9 or 9:16");
  const src = v.source ?? {};
  if (src.kind === "youtube") {
    need(YT_ID.test(src.id ?? ""), "source.id: an 11-character YouTube id");
    need(!v.captions, "captions: YouTube clips use YouTube subtitles; captions is for self-hosted files");
  } else if (src.kind === "file") {
    // Files live outside the repo: Pages builds the site several times over and caps it at 1 GB.
    need(HTTPS.test(src.src ?? "") && /\.(mp4|webm)(\?|$)/i.test(src.src ?? ""), "source.src: an https URL to an .mp4 or .webm file");
  } else p.push("source.kind: youtube or file");
  if (v.poster !== undefined) need(HTTPS.test(v.poster), "poster: an https URL");
  if (v.captions !== undefined) {
    need(Array.isArray(v.captions) && v.captions.length > 0, "captions: a non-empty list");
    for (const c of Array.isArray(v.captions) ? v.captions : []) {
      need(HTTPS.test(c.src ?? "") && /\.vtt(\?|$)/i.test(c.src ?? ""), "captions[].src: an https URL to a .vtt file");
      need(/^[a-z]{2}$/.test(c.lang ?? "") && typeof c.label === "string" && c.label.length > 0, "captions[]: lang and label");
    }
  }
  const mw = v.madeWith ?? {};
  need(typeof mw.tool === "string" && mw.tool.trim().length > 0, "madeWith.tool: the tool that made the clip");
  need(mw.skill === undefined || (typeof mw.skill === "string" && mw.skill.length > 0), "madeWith.skill: a name when given");
  need(/^\d{4}-\d{2}-\d{2}$/.test(mw.date ?? ""), "madeWith.date: YYYY-MM-DD");
  need(typeof mw.ai === "boolean", "madeWith.ai: true when voice or visuals are AI-generated");
  need(/^[0-9a-f]{12}$/.test(v.briefHash ?? ""), "briefHash: from the brief the clip was made from");
  if (v.note !== undefined) need(typeof v.note === "string" && v.note.length > 0, "note: text when given");
  return p;
}
