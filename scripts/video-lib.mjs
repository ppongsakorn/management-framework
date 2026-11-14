// Explainer clips per framework: the brief a clip-making skill/tool works from,
// and the rules a registered clip in data/videos.json must follow.
// Used by scripts/video.mjs (CLI) and tests/videos.test.mjs. See docs/videos/README.md.
import crypto from "node:crypto";
import fs from "node:fs";
import { renderDiagram } from "./diagram-renderer.mjs";

export const BRIEF_VERSION = 2;
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
    { id: "example", seconds: [15, 25], purpose: "แต่งตัวอย่างสมมติจากธุรกิจที่คนทั่วไปเข้าใจง่าย (ร้านอาหาร โรงแรม ฟาร์ม ร้านค้า) ใช้โครงเดียวกับตัวอย่างใน source ซึ่งเป็นงานทีมข้อมูล ห้ามยกตัวอย่างทีมข้อมูลมาใช้ตรง ๆ ต้องมีป้าย \"ตัวอย่างสมมติ\" บนจอตลอดฉาก", label: "ตัวอย่างสมมติ", source: { example: fw.example } },
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
    purpose: "ให้เครดิตที่มาของแนวคิด ชวนไปดูวิธีเต็มที่หน้าเว็บ" + (next ? ` และทิ้งท้ายให้อยากดูตัวต่อไป (${next.name})` : "") + " แล้วบอกว่าคลิปสร้างด้วยเครื่องมือ AI",
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
      audience: "คนทั่วไปที่เลื่อนเจอบนโซเชียลหรือเปิดจากหน้าเว็บ อยากเข้าใจว่า framework นี้คืออะไร ใช้ตอนไหน ภายในราว 1 นาที",
      durationSec: { ideal: [45, 75], max: 90 },
      sizes: { desktop: "16:9 (1920×1080) สำหรับหน้าเว็บ", mobile: "9:16 (1080×1920) สำหรับแอปมือถือและโซเชียล ข้อความห่างขอบบน 250 ล่าง 420 ขวา 120 px" },
      tone: "สนุก ตื่นเต้น ชวนค้นหา จังหวะเร็วแบบเกมโชว์สั้น ๆ แต่ข้อเท็จจริงตรงกับ brief และจบแบบอยากดู framework ตัวต่อไป",
    },
    scenes,
    rules: [
      "เล่าด้วยคำของเราเอง ข้อเท็จจริงของ framework (ชื่อ หลักคิด ขั้นตอน ที่มา กรณีจริง) มาจาก scenes[].source เท่านั้น ห้ามเติมตัวเลข ชื่อคน ชื่อบริษัท หรือข้อเท็จจริงที่ไม่มีใน brief",
      "ฉาก example แต่งใหม่จากธุรกิจที่คนทั่วไปเข้าใจง่าย เป็นสถานการณ์สมมติ ต้องมีป้าย \"ตัวอย่างสมมติ\" บนจอ ห้ามเล่าเหมือนเป็นเรื่องจริง ห้ามใช้ชื่อร้านหรือแบรนด์จริง",
      "ฉาก case (ถ้าใช้) ต้องแสดงชื่อแหล่งอ้างอิงบนจอ ถ้ามี note ให้พูดข้อจำกัดของหลักฐานด้วย ผลลัพธ์ที่องค์กรรายงานเองห้ามพูดเหมือนเป็นข้อพิสูจน์",
      "ห้ามใช้โลโก้ ปกหนังสือ ภาพหรือเสียงของบุคคลจริง และเพลงที่ไม่มีสิทธิ์ใช้ ภาพเป็นกราฟิกสีสดได้ ไม่มีหน้าคนสมจริง",
      "คำอังกฤษในวงเล็บ เช่น (Time Boxing) ให้คงไว้บนจอ ตัวอักษรไทยใช้ฟอนต์ที่อ่านง่าย ไม่เล็กกว่า 4% ของความสูงภาพ",
      "ทำ 2 ขนาดจากเรื่องเดียวกัน: 16:9 สำหรับหน้าเว็บ desktop และ 9:16 สำหรับมือถือและโซเชียล จัดภาพใหม่ทั้งคู่ ห้าม crop",
      "ข้อความบนจอขึ้นตามเสียงพูดและใช้แทนซับ เพราะคนดูโซเชียลมักปิดเสียง",
      "ถ้าเสียงหรือภาพสร้างด้วย AI ให้บอกในคลิปและตอนลงทะเบียน (madeWith.ai) หน้าเว็บจะแสดงให้ผู้ชมเห็น",
    ],
    deliver: {
      web: `WebM (VP9 + Opus) 30fps 2 ไฟล์ใน public/videos/: ${fw.slug}.webm (1920×1080) และ ${fw.slug}-mobile.webm (1080×1920) ไม่เกิน 20 MB ต่อไฟล์`,
      poster: `WebP ${fw.slug}.webp (1280×720) และ ${fw.slug}-mobile.webp (720×1280)`,
      social: "MP4 (H.264 + AAC, faststart) ทั้ง 2 ขนาด สำหรับ Facebook, Instagram, TikTok ไม่เข้า git โพสต์พร้อมลิงก์กลับหน้า framework (ติด utm_source ตามแพลตฟอร์ม)",
      sound: "เสียงพากย์ เพลง และเสียงประกอบจาก ElevenLabs ผสมหลังเรนเดอร์ภาพ (Claude Motion ใส่ไฟล์เสียงเองไม่ได้)",
      register: `npm run video:add -- ${fw.slug} --size desktop --file videos/${fw.slug}.webm --poster videos/${fw.slug}.webp --duration <m:ss> --tool "<ชื่อเครื่องมือ>" --hash ${briefHash(fw)} แล้วทำซ้ำด้วย --size mobile --file videos/${fw.slug}-mobile.webm --poster videos/${fw.slug}-mobile.webp`,
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
    `- ความยาว: ${b.target.durationSec.ideal.join("–")} วินาที (ไม่เกิน ${b.target.durationSec.max}) · ขนาด ${Object.values(b.target.sizes).join(" และ ")} · ภาษา ${b.target.language} · โทน: ${b.target.tone}`,
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
// Clips kept in the repo live in public/videos/ and are named by a path relative to the site
// (e.g. "videos/5-whys.webm"). The page resolves it against the root build's base path, so the
// comparison builds share one copy. Each file is capped so the repo and the Pages site stay small.
export const SITE_MEDIA_DIR = "videos";
export const MAX_FILE_MB = 20;
const SITE_PATH = (ext) => new RegExp(`^${SITE_MEDIA_DIR}/[a-z0-9][a-z0-9.-]*\\.(${ext})$`);
const VIDEO_PATH = SITE_PATH("webm|mp4"), POSTER_PATH = SITE_PATH("webp|jpg|jpeg|png"), VTT_PATH = SITE_PATH("vtt");
const KEYS = new Set(["lang", "desktop", "mobile", "madeWith", "briefHash", "note"]);
const CLIP_KEYS = new Set(["title", "durationSec", "aspect", "source", "poster", "captions"]);
/** Every framework's clip comes in both sizes: 16:9 for the desktop page, 9:16 for the phone app and social posts. */
export const SIZES = { desktop: "16:9", mobile: "9:16" };

/**
 * Problems with one registered clip ([] means it may be published). With `publicDir`, files kept in the
 * repo must also exist there and stay under MAX_FILE_MB. `partial` lets `video:add` register one size first.
 */
export function videoProblems(slug, v, slugs, { publicDir, partial } = {}) {
  const p = [];
  const need = (ok, msg) => ok || p.push(msg);
  const local = (path, what) => {
    if (!publicDir) return;
    const file = `${publicDir}/${path}`;
    if (!fs.existsSync(file)) return p.push(`${what}: ${path} is not in public/`);
    const mb = fs.statSync(file).size / 1048576;
    need(mb <= MAX_FILE_MB, `${what}: ${path} is ${mb.toFixed(1)} MB, over the ${MAX_FILE_MB} MB cap`);
  };
  const place = (value, re, ext, what) => {
    if (HTTPS.test(value ?? "")) return need(new RegExp(`\\.(${ext})(\\?|$)`, "i").test(value), `${what}: an https URL to a .${ext.split("|").join(" or .")} file`);
    if (re.test(value ?? "")) return local(value, what);
    p.push(`${what}: an https URL, or a file in public/${SITE_MEDIA_DIR}/ named like ${SITE_MEDIA_DIR}/<slug>.${ext.split("|")[0]}`);
  };
  need(slugs.has(slug), `unknown framework ${slug}`);
  if (!v || typeof v !== "object") return [...p, "entry must be an object"];
  for (const k of Object.keys(v)) need(KEYS.has(k), `unknown field ${k}`);
  need(/^[a-z]{2}$/.test(v.lang ?? ""), "lang: two-letter code, e.g. th");
  for (const [size, aspect] of Object.entries(SIZES)) {
    const c = v[size];
    if (c === undefined) {
      if (!partial) p.push(`${size}: every clip needs both sizes; the ${aspect} ${size} one is missing`);
      continue;
    }
    if (!c || typeof c !== "object") { p.push(`${size}: must be an object`); continue; }
    for (const k of Object.keys(c)) need(CLIP_KEYS.has(k), `${size}: unknown field ${k}`);
    need(typeof c.title === "string" && c.title.trim().length > 0 && c.title.length <= 80, `${size}.title: 1–80 characters`);
    need(Number.isInteger(c.durationSec) && c.durationSec >= 10 && c.durationSec <= 600, `${size}.durationSec: whole seconds, 10–600`);
    need(c.aspect === aspect, `${size}.aspect: ${aspect}`);
    const src = c.source ?? {};
    if (src.kind === "youtube") {
      need(YT_ID.test(src.id ?? ""), `${size}.source.id: an 11-character YouTube id`);
      need(!c.captions, `${size}.captions: YouTube clips use YouTube subtitles; captions is for files`);
    } else if (src.kind === "file") place(src.src, VIDEO_PATH, "webm|mp4", `${size}.source.src`);
    else p.push(`${size}.source.kind: youtube or file`);
    if (c.poster !== undefined) place(c.poster, POSTER_PATH, "webp|jpg|jpeg|png", `${size}.poster`);
    if (c.captions !== undefined) {
      need(Array.isArray(c.captions) && c.captions.length > 0, `${size}.captions: a non-empty list`);
      for (const cap of Array.isArray(c.captions) ? c.captions : []) {
        place(cap.src, VTT_PATH, "vtt", `${size}.captions[].src`);
        need(/^[a-z]{2}$/.test(cap.lang ?? "") && typeof cap.label === "string" && cap.label.length > 0, `${size}.captions[]: lang and label`);
      }
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
