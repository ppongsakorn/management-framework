/* claude-motion-clip runtime. Every frame is a pure function of t (seconds), so a frame looks the same however
   many times it is drawn and the renderer can step through time one frame at a time.

   index.html loads this after its markup. It reads timeline.json (made by build.py), then:
   - sizes #stage to the clip (width × height) and fits it to the window in preview mode
   - fades each <section class="scene" data-scene="N"> in and out at its scene's times
   - plays the data-* animations (reference/runtime.md), with times relative to the start of their scene
   - shows the caption of each scene while its voice line plays
   - preview (no ?capture): play/pause with the voice track, ←/→ seek, ?t=12 starts there
   Hooks the page may define before this script runs:
     window.clipSetup(api)    once, before animations are collected (build generated DOM here)
     window.clipFrame(t, api) every frame, after the built-in animations (background motion etc.)
   For the renderer: window.__ready (promise), window.__frameAt(t), window.__issues, window.__cues(). */
(() => {
  const qs = new URLSearchParams(location.search);
  const CAPTURE = qs.has("capture");
  const SCALE = +(qs.get("scale") || 1);
  const stage = document.getElementById("stage");
  const issues = [];
  const cues = [];

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const ease = {
    linear: (x) => x,
    out: (x) => 1 - Math.pow(1 - x, 3),
    in: (x) => x * x * x,
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const prog = (t, a, b, f = ease.out) => f(clamp((t - a) / Math.max(1e-6, b - a), 0, 1));
  const norm = (s) => (s || "").replace(/\[[^\]]*\]/g, "").toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, "");
  const desc = (el) => {
    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : "";
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30);
    return `<${el.tagName.toLowerCase()}${cls}>${txt ? " " + txt : ""}`;
  };

  let TL = null, SC = [];
  const sceneOf = (el) => {
    const host = el.closest("[data-scene]");
    if (!host) return null;
    const key = host.dataset.scene;
    const s = SC.find((x) => x.id === key) || SC[+key - 1];
    if (!s) issues.push(`unknown data-scene="${key}" on ${desc(host)}`);
    return s || null;
  };

  /* Time expressions, relative to the start of the element's scene:
     2.5 · v (voice starts) · ve (voice ends) · end (scene ends) · w:GPT (that word is spoken) · w:#3 (3rd word)
     · w:"GPT-4" (quote words that end in -digits), each with an optional +0.3 / -0.2 */
  function wordTime(s, needle) {
    if (/^#\d+$/.test(needle)) {
      const w = s.words[+needle.slice(1) - 1];
      return w ? { t: w.s, est: false } : null;
    }
    const n = norm(needle);
    if (!n) return null;
    const i = s.concat.indexOf(n);
    if (i >= 0) return { t: s.words[s.owner[i]].s, est: false };
    // no word times (or Whisper heard it differently): place it by its position in the spoken text, between
    // the nearest words Whisper did hear
    const j = norm(s.say).indexOf(n);
    if (!s.voice || j < 0) return null;
    const a = anchorsOf(s);
    let k = 0;
    while (k < a.length - 2 && a[k + 1][0] <= j) k++;
    const [p0, t0] = a[k], [p1, t1] = a[k + 1];
    return { t: t0 + ((j - p0) / Math.max(1, p1 - p0)) * (t1 - t0), est: true };
  }
  // [position in the spoken text, time] for every heard word that can be found in the text, in order
  function anchorsOf(s) {
    if (s.anch) return s.anch;
    const say = norm(s.say), a = [[0, s.voice.at]];
    let pos = 0;
    for (const w of s.words) {
      const n = norm(w.w), k = n ? say.indexOf(n, pos) : -1;
      if (k >= 0 && k - pos < 24 && w.s >= a[a.length - 1][1]) { a.push([k, w.s]); pos = k + n.length; }
    }
    a.push([say.length, s.voice.at + s.voice.dur]);
    return (s.anch = a);
  }
  function T(expr, s, el, attr) {
    expr = String(expr).trim();
    const start = s ? s.start : 0;
    let t = NaN, est = false;
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(expr)) t = +expr;
    else {
      const m = expr.match(/^(v|ve|end|w:"[^"]*"|w:.+?)([+-](?:\d+\.?\d*|\.\d+))?$/);
      if (m && s) {
        const off = m[2] ? +m[2] : 0, base = m[1];
        if (base === "v" && s.voice) t = s.voice.at - start + off;
        else if (base === "ve" && s.voice) t = s.voice.at + s.voice.dur - start + off;
        else if (base === "end") t = s.end - start + off;
        else if (base.startsWith("w:")) {
          const r = wordTime(s, base.slice(2).replace(/^"|"$/g, ""));
          if (r) { t = r.t - (TL.cue_lead ?? 0.08) - start + off; est = r.est; }
        }
      }
    }
    if (el) cues.push({ scene: s ? s.index : null, el: desc(el), attr, expr, t: Number.isNaN(t) ? null : +t.toFixed(3), est });
    if (Number.isNaN(t)) { issues.push(`cannot resolve ${attr}="${expr}" on ${desc(el)}${s ? "" : " (no data-scene)"}`); return 0; }
    return t;
  }
  const list = (s, sc, el, attr) => (s || "").split(",").map((x) => x.trim()).filter(Boolean).map((x, i) => (i < 2 ? T(x, sc, el, attr) : +x));
  const ranges = (s, sc, el, attr) => (s || "").split(";").filter((x) => x.trim()).map((r) => r.split("..").map((x) => T(x, sc, el, attr)));

  let anims = [], ons = [], typers = [], counters = [], fills = [], sceneEls = [], caps = [];
  const DUR = { pop: 0.55, grow: 0.4, draw: 0.6, wipe: 0.6 };

  function collect() {
    sceneEls = [...stage.querySelectorAll("section.scene")].map((el) => ({ el, s: sceneOf(el) })).filter((x) => x.s);
    anims = [...stage.querySelectorAll("[data-anim],[data-out],[data-hide],[data-move]")].map((el) => {
      const s = sceneOf(el), d = el.dataset;
      const a = {
        el, s, kind: d.anim || null, in: d.in != null ? T(d.in, s, el, "data-in") : null,
        d: d.d ? +d.d : DUR[d.anim] || 0.5, out: d.out != null ? T(d.out, s, el, "data-out") : null,
        hide: ranges(d.hide, s, el, "data-hide"), move: d.move ? list(d.move, s, el, "data-move") : null,
        swap: d.swap != null, len: 0,
      };
      if (a.kind === "draw" && el.getTotalLength) {
        a.len = el.getTotalLength();
        el.style.strokeDasharray = `${a.len}`;
      }
      if (a.kind && a.in == null) issues.push(`data-anim without data-in on ${desc(el)}`);
      return a;
    });
    ons = [...stage.querySelectorAll("[data-on]")].map((el) => {
      const s = sceneOf(el);
      return { el, s, r: ranges(el.dataset.on, s, el, "data-on"), cls: el.dataset.onClass || "on" };
    });
    const seg = new Intl.Segmenter(TL.lang || "th", { granularity: "grapheme" });
    typers = [...stage.querySelectorAll("[data-type]")].map((el) => {
      const s = sceneOf(el), [a, d] = list(el.dataset.type, s, el, "data-type");
      const src = el.dataset.text ?? el.textContent;
      const parts = [];
      src.replace(/\{([^}]*)\}|([^{]+)/g, (m, hl, plain) => { parts.push({ t: hl ?? plain, hl: hl != null }); return m; });
      parts.forEach((p) => (p.g = [...seg.segment(p.t)].map((x) => x.segment)));
      el.textContent = "";
      return { el, s, a, d, parts, total: parts.reduce((n, p) => n + p.g.length, 0), last: "" };
    });
    counters = [...stage.querySelectorAll("[data-count]")].map((el) => {
      const s = sceneOf(el), v = list(el.dataset.count, s, el, "data-count");
      return { el, s, a: v[0], d: v[1], to: v[2], from: v[3] || 0, dec: v[4] || 0 };
    });
    fills = [...stage.querySelectorAll("[data-fill]")].map((el) => {
      const s = sceneOf(el), v = list(el.dataset.fill, s, el, "data-fill");
      return { el, s, a: v[0], d: v[1], to: v[2], prop: el.dataset.fillProp || "width" };
    });
  }

  function captions() {
    if (TL.captions === false) return;
    const box = document.createElement("div");
    box.id = "cmc-captions";
    stage.appendChild(box);
    caps = SC.filter((s) => s.caption).map((s) => {
      const el = document.createElement("div");
      el.className = "cmc-caption";
      el.textContent = s.caption;
      box.appendChild(el);
      const a = s.voice ? s.voice.at - 0.1 : s.start + 0.2;
      const b = s.voice ? Math.min(s.end - 0.1, s.voice.at + s.voice.dur + 0.5) : s.end - 0.2;
      return { el, a, b };
    });
  }

  const api = {
    get W() { return TL.width; }, get H() { return TL.height; }, get scenes() { return SC; }, get timeline() { return TL; },
    scene: (id) => SC.find((x) => x.id === String(id)) || SC[+id - 1],
    local: (t, id) => t - api.scene(id).start,
    T: (expr, id) => T(expr, api.scene(id), null, "api"),
    clamp, ease, prog, stage,
  };

  function show(el, op) {
    el.style.opacity = op;
    el.style.visibility = op > 0.001 ? "visible" : "hidden";
  }

  function frame(t) {
    const xf = TL.xfade ?? 0.4;
    for (const { el, s } of sceneEls) {
      let op = 1;
      if (s.index > 1) op = Math.min(op, prog(t, s.start - xf / 2, s.start + xf / 2, ease.linear));
      if (s.index < SC.length) op = Math.min(op, 1 - prog(t, s.end - xf / 2, s.end + xf / 2, ease.linear));
      show(el, op);
    }
    for (const a of anims) {
      const lt = t - (a.s ? a.s.start : 0);
      let op = 1, tx = 0, ty = 0, sc = 1, blur = 0;
      if (a.kind && a.in != null) {
        const raw = clamp((lt - a.in) / a.d, 0, 1), p = ease.out(raw);
        switch (a.kind) {
          case "up": ty = (1 - p) * 34; op = p; break;
          case "down": ty = -(1 - p) * 34; op = p; break;
          case "left": tx = -(1 - p) * 80; op = p; break;
          case "right": tx = (1 - p) * 80; op = p; break;
          case "fade": op = p; break;
          case "pop": sc = 0.55 + 0.45 * ease.back(raw); op = clamp(raw * 3, 0, 1); break;
          case "zoom": sc = 1.12 - 0.12 * p; op = p; break;
          case "blur": blur = (1 - p) * 14; op = p; break;
          case "wipe": a.el.style.clipPath = raw >= 1 ? "" : `inset(0 ${(1 - p) * 100}% 0 0)`; op = raw > 0 ? 1 : 0; break;
          case "grow": a.el.style.maxHeight = raw >= 1 ? "" : `${p * a.el.scrollHeight}px`; a.el.style.overflow = raw >= 1 ? "" : "hidden"; ty = (1 - p) * 14; op = p; break;
          case "draw": a.el.style.strokeDashoffset = `${a.len * (1 - p)}`; op = raw > 0 ? 1 : 0; break;
          default: if (!a.warned) { issues.push(`unknown data-anim="${a.kind}" on ${desc(a.el)}`); a.warned = true; }
        }
      }
      if (a.out != null) op *= 1 - prog(lt, a.out, a.out + 0.35, ease.linear);
      for (const [x, y] of a.hide) if (lt >= x && lt < y) op = 0;
      if (a.move) {
        const p = prog(lt, a.move[0], a.move[1], ease.inOut);
        tx += (a.move[2] || 0) * p; ty += (a.move[3] || 0) * p;
      }
      show(a.el, op);
      if (a.swap) a.el.style.display = op > 0.001 ? "" : "none";
      a.el.style.translate = tx || ty ? `${tx}px ${ty}px` : "";
      a.el.style.scale = sc !== 1 ? `${sc}` : "";
      a.el.style.filter = blur > 0.01 ? `blur(${blur}px)` : "";
    }
    for (const o of ons) {
      const lt = t - (o.s ? o.s.start : 0);
      o.el.classList.toggle(o.cls, o.r.some(([x, y]) => lt >= x && lt < y));
    }
    for (const ty of typers) {
      const lt = t - (ty.s ? ty.s.start : 0), p = clamp((lt - ty.a) / ty.d, 0, 1);
      const n = Math.round(p * ty.total), caret = p > 0 && p < 1, key = `${n}|${caret}`;
      if (key === ty.last) continue;
      ty.last = key;
      ty.el.textContent = "";
      let left = n;
      for (const part of ty.parts) {
        if (left <= 0) break;
        const text = part.g.slice(0, left).join("");
        left -= part.g.length;
        if (part.hl) { const sp = document.createElement("span"); sp.className = "hl"; sp.textContent = text; ty.el.appendChild(sp); }
        else ty.el.appendChild(document.createTextNode(text));
      }
      if (caret) { const c = document.createElement("span"); c.className = "caret"; ty.el.appendChild(c); }
    }
    for (const c of counters) {
      const v = c.from + (c.to - c.from) * prog(t - (c.s ? c.s.start : 0), c.a, c.a + c.d);
      c.el.textContent = v.toLocaleString("en-US", { minimumFractionDigits: c.dec, maximumFractionDigits: c.dec });
    }
    for (const f of fills) f.el.style[f.prop] = `${f.to * 100 * prog(t - (f.s ? f.s.start : 0), f.a, f.a + f.d)}%`;
    for (const c of caps) show(c.el, Math.min(prog(t, c.a, c.a + 0.2, ease.linear), 1 - prog(t, c.b - 0.2, c.b, ease.linear)));
    if (typeof window.clipFrame === "function") window.clipFrame(t, api);
  }

  async function loadFonts() {
    const runs = new Map();
    for (const el of stage.querySelectorAll("*")) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
      const text = own + (el.dataset ? el.dataset.text || "" : "");
      if (!text) continue;
      const cs = getComputedStyle(el);
      const key = `${cs.fontStyle} ${cs.fontWeight} 40px ${cs.fontFamily}`;
      runs.set(key, (runs.get(key) || "") + text);
    }
    await Promise.all([...runs].map(([f, s]) => document.fonts.load(f, s.slice(0, 4000)).catch(() => [])));
    await document.fonts.ready;
    const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|emoji|math)$/;
    const families = new Set([...runs.keys()].map((k) => k.replace(/^\S+ \S+ 40px /, "").split(",")[0].trim().replace(/^["']|["']$/g, "")));
    const faces = [...document.fonts];
    for (const fam of families) {
      if (generic.test(fam)) continue;
      const mine = faces.filter((f) => f.family.replace(/^["']|["']$/g, "") === fam);
      if (!mine.length) issues.push(`font "${fam}" has no @font-face: it relies on being installed on this machine`);
      else if (!mine.some((f) => f.status === "loaded")) issues.push(`font "${fam}" did not load (check the url in @font-face)`);
    }
  }

  window.__issues = issues;
  window.__cues = () => cues;
  window.__frameAt = (t) => frame(t);
  window.__ready = (async () => {
    const r = await fetch("timeline.json", { cache: "no-store" });
    if (!r.ok) throw new Error("timeline.json not found: run build.py first");
    TL = await r.json();
    SC = TL.scenes.map((s) => {
      const words = s.words || [], owner = [];
      let concat = "";
      words.forEach((w, i) => { const n = norm(w.w); concat += n; for (let k = 0; k < n.length; k++) owner.push(i); });
      return { ...s, id: String(s.id ?? s.index), words, concat, owner };
    });
    document.documentElement.style.setProperty("--W", `${TL.width}px`);
    document.documentElement.style.setProperty("--H", `${TL.height}px`);
    stage.style.width = `${TL.width}px`;
    stage.style.height = `${TL.height}px`;
    if (typeof window.clipSetup === "function") window.clipSetup(api);
    captions();
    await loadFonts(); // before collect(): typing elements are emptied there
    collect();
    frame(0);
    return true;
  })();

  if (CAPTURE) {
    document.documentElement.classList.add("cmc-capture");
    const st = document.createElement("style");
    st.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
    document.head.appendChild(st);
    stage.style.transformOrigin = "0 0";
    if (SCALE !== 1) stage.style.transform = `scale(${SCALE})`;
    return;
  }

  // preview: fit the stage to the window, play with the voice track
  const fit = () => {
    if (!TL) return;
    const s = Math.min(innerWidth / TL.width, (innerHeight - 56) / TL.height);
    stage.style.transformOrigin = "0 0";
    stage.style.transform = `translate(${(innerWidth - TL.width * s) / 2}px, ${(innerHeight - 56 - TL.height * s) / 2}px) scale(${s})`;
  };
  const bar = document.createElement("div");
  bar.id = "cmc-bar";
  bar.innerHTML = '<button id="cmc-play">▶ Play</button><input id="cmc-seek" type="range" min="0" step="0.01" value="0"><span id="cmc-time">0.00</span>';
  document.body.appendChild(bar);
  const st = document.createElement("style");
  st.textContent = "#cmc-bar{position:fixed;left:0;right:0;bottom:0;height:56px;display:flex;gap:14px;align-items:center;padding:0 16px;background:#111a;color:#fff;font:600 15px system-ui;z-index:99}#cmc-bar button{font:inherit;padding:8px 16px;border-radius:10px;border:0;background:#fff;color:#111;cursor:pointer}#cmc-seek{flex:1}#cmc-time{font-variant-numeric:tabular-nums;min-width:110px;text-align:right}";
  document.head.appendChild(st);
  const audio = new Audio("audio.m4a");
  let t = +(qs.get("t") || 0), playing = false, last = 0;
  const btn = bar.querySelector("#cmc-play"), seek = bar.querySelector("#cmc-seek"), out = bar.querySelector("#cmc-time");
  const draw = () => {
    frame(t);
    seek.value = t;
    const s = SC.find((x) => t >= x.start && t < x.end) || SC[SC.length - 1];
    out.textContent = `${t.toFixed(2)} s · scene ${s ? s.index : "-"}`;
  };
  const setT = (x) => { t = clamp(x, 0, TL.duration); if (playing) audio.currentTime = t; draw(); };
  const tick = (now) => {
    if (!playing) return;
    t = audio.readyState >= 2 && !audio.paused ? audio.currentTime : t + (now - last) / 1000;
    last = now;
    if (t >= TL.duration) { t = TL.duration; playing = false; btn.textContent = "▶ Play"; audio.pause(); }
    draw();
    if (playing) requestAnimationFrame(tick);
  };
  const toggle = () => {
    playing = !playing;
    btn.textContent = playing ? "❚❚ Pause" : "▶ Play";
    if (playing) {
      if (t >= TL.duration - 0.01) t = 0;
      audio.currentTime = t; audio.play().catch(() => {});
      last = performance.now(); requestAnimationFrame(tick);
    } else audio.pause();
  };
  btn.onclick = toggle;
  seek.oninput = () => setT(+seek.value);
  addEventListener("keydown", (e) => {
    if (e.key === " ") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") setT(t + (e.shiftKey ? 0.1 : 1));
    else if (e.key === "ArrowLeft") setT(t - (e.shiftKey ? 0.1 : 1));
    else if (e.key === "Home") setT(0);
  });
  addEventListener("resize", fit);
  window.__ready.then(() => { seek.max = TL.duration; fit(); draw(); }).catch((e) => { out.textContent = String(e.message || e); });
})();
