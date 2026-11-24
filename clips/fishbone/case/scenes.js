/* Fishbone, episode 3 of the restaurant series: one scene module per id, drawn from scene-local time only.
   Same bright planning-room look as the PDCA episode; helpers (pop, slam, tape, silhouettes) come from cf.js.
   The fish is one SVG per scene (spine, six bones, labels, cause notes) built by fishBuild/fishRender so the five
   Fishbone steps look like the same drawing growing. Cues (T('คำ')) are words in the spoken line. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;

  const LAY = (W, H) => {
    const V = H > W;
    return V
      ? { V, W, H, tx: 80, tapeY: 262, ty: 372, mid: 80, R: { x: 80, y: 640, w: 880, h: 780 }, FA: { x: 60, y: 610, w: 960, h: 860 } }
      : { V, W, H, tx: 110, tapeY: 120, ty: 250, mid: 84, R: { x: 960, y: 300, w: 850, h: 660 }, FA: { x: 640, y: 290, w: 1200, h: 700 } };
  };
  const at = (x, y, extra) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (extra || '');
  const mid = (x, y, extra) => at(x, y) + ' translate(-50%,-50%)' + (extra || '');
  const q = (host, c) => host.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const stepHead = (L, cls, n, en, th) =>
    '<p class="t ' + cls + '" style="font-size:' + (L.V ? 92 : 96) + 'px"><i style="display:inline-block;font-style:normal;min-width:1.15em;text-align:center;margin-right:.22em;padding:0 .1em .08em;border-radius:.22em;background:var(--main);color:#fff;font-size:.82em">' + n + '</i>' + en + '</p>' +
    '<p class="t mute ' + cls + '-th" style="font-size:' + (L.V ? 60 : 56) + 'px;color:var(--main)">' + th + '</p>';

  // ----------------------------------------------------------------------------------------- the fish drawing
  const CATS = [['คน'], ['วิธี', 'ทำงาน'], ['เครื่อง', 'มือ'], ['ข้อมูล', 'วัตถุดิบ'], ['สภาพ', 'แวดล้อม'], ['การวัดผล']];   // 0-2 above the spine, 3-5 below
  const NOTES = [['คนล้างจาน', 'ไม่พอ'], ['ทำทีละโต๊ะ', 'ไม่ทำเป็นชุด'], ['เตาใช้ได้', '2 จาก 3 หัว'], ['ไม่เตรียมของ', 'เมนูขายดี'], ['ครัวร้อน', 'หน้าร้านแน่น'], ['จับเวลาแค่', 'ตอนสั่ง']];
  const VOTED = [2, 3, 5];                      // the three notes the team picks
  const fishGeo = (L) => {
    const V = L.V, W = L.FA.w, H = L.FA.h, sy = H / 2, ext = H * (V ? 0.34 : 0.31), dx = V ? 80 : 100, headW = V ? 210 : 260;
    const xs = (V ? [0.10, 0.30, 0.50] : [0.11, 0.32, 0.53]).map((f) => W * f);
    const bones = CATS.map((c, i) => { const top = i < 3, x = xs[i % 3], s = top ? -1 : 1; return { i, top, s, ox: x, oy: sy + s * ext, ix: x + dx, iy: sy }; });
    return { V, W, H, sy, ext, dx, headW, bones, spineEnd: W - headW, lf: V ? 34 : 38, nf: V ? 24 : 30, nw: V ? 160 : 230, nh: V ? 92 : 112 };
  };
  const esc = (s) => s;
  const fishBuild = (L, cls, o) => {
    const g = fishGeo(L), V = L.V; let s = '';
    s += '<path class="' + cls + '-sp" pathLength="100" d="M24 ' + g.sy + ' H' + g.spineEnd + '" style="fill:none;stroke:#1D2430;stroke-width:' + (V ? 9 : 10) + ';stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100"/>';
    s += '<g class="' + cls + '-hd" style="opacity:0"><path d="M' + (g.spineEnd - 6) + ' ' + (g.sy - (V ? 64 : 70)) + ' H' + (g.W - 20) + ' Q' + g.W + ' ' + (g.sy - (V ? 64 : 70)) + ' ' + g.W + ' ' + (g.sy - (V ? 44 : 50)) + ' V' + (g.sy + (V ? 44 : 50)) + ' Q' + g.W + ' ' + (g.sy + (V ? 64 : 70)) + ' ' + (g.W - 20) + ' ' + (g.sy + (V ? 64 : 70)) + ' H' + (g.spineEnd - 6) + ' Q' + (g.spineEnd - 40) + ' ' + g.sy + ' ' + (g.spineEnd - 6) + ' ' + (g.sy - (V ? 64 : 70)) + ' Z" style="fill:var(--main);stroke:#1D2430;stroke-width:6"/>' +
      '<text x="' + (g.spineEnd + (g.headW - 6) / 2 + 4) + '" y="' + (g.sy - 6) + '" style="font-size:' + (V ? 30 : 34) + 'px;font-weight:700;fill:#fff;text-anchor:middle">เสาร์</text>' +
      '<text x="' + (g.spineEnd + (g.headW - 6) / 2 + 4) + '" y="' + (g.sy + (V ? 32 : 38)) + '" style="font-size:' + (V ? 30 : 34) + 'px;font-weight:700;fill:#fff;text-anchor:middle">ยังช้า</text></g>';
    let ns = '';
    g.bones.forEach((b) => {
      s += '<path class="' + cls + '-bn' + b.i + '" pathLength="100" d="M' + b.ox + ' ' + b.oy + ' L' + b.ix + ' ' + b.iy + '" style="fill:none;stroke:#1D2430;stroke-width:' + (V ? 7 : 8) + ';stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100"/>';
      const lines = CATS[b.i], lh = g.lf * 1.15, h = lines.length * lh + 18, w = Math.max(...lines.map((t) => t.length)) * g.lf * 0.56 + 40, cy = b.top ? b.oy - 6 - h / 2 : b.oy + 6 + h / 2;
      s += '<g class="' + cls + '-lb' + b.i + '" style="opacity:0"><rect x="' + (b.ox - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (h / 2 > 30 ? 26 : h / 2) + '" style="fill:#1D2430"/>' +
        lines.map((t, k) => '<text x="' + b.ox + '" y="' + (cy - h / 2 + 9 + lh * (k + 0.78)) + '" style="font-size:' + g.lf + 'px;font-weight:700;fill:#fff;text-anchor:middle">' + t + '</text>').join('') + '</g>';
      if (o.notes) {
        const ny = b.iy + b.s * g.ext * 0.55, nx = b.ox + g.dx * 0.55 + 18 + g.nw / 2, x0 = nx - g.nw / 2, y0 = ny - g.nh / 2, ln = NOTES[b.i];
        ns += '<g class="' + cls + '-nt' + b.i + '" style="opacity:0"><rect x="' + (x0 + 8) + '" y="' + (y0 + 10) + '" width="' + g.nw + '" height="' + g.nh + '" style="fill:rgba(0,0,0,.14)"/><rect x="' + x0 + '" y="' + y0 + '" width="' + g.nw + '" height="' + g.nh + '" style="fill:#FFE680"/>' +
          ln.map((t, k) => '<text x="' + nx + '" y="' + (y0 + g.nh / 2 + (k - (ln.length - 1) / 2) * g.nf * 1.2 + g.nf * 0.34) + '" style="font-size:' + g.nf + 'px;font-weight:700;fill:#1D2430;text-anchor:middle">' + t + '</text>').join('') + '</g>';
        if (o.vote && VOTED.includes(b.i)) {
          const r = VOTED.indexOf(b.i) + 1;
          ns += '<g class="' + cls + '-vt' + b.i + '" style="opacity:0"><rect x="' + (x0 - 8) + '" y="' + (y0 - 8) + '" width="' + (g.nw + 16) + '" height="' + (g.nh + 16) + '" rx="14" style="fill:none;stroke:#E5402F;stroke-width:8"/><circle cx="' + (x0 + g.nw - 2) + '" cy="' + (y0 - 2) + '" r="30" style="fill:#E5402F;stroke:#fff;stroke-width:4"/><text x="' + (x0 + g.nw - 2) + '" y="' + (y0 + 12) + '" style="font-size:38px;font-weight:700;fill:#fff;text-anchor:middle">' + r + '</text></g>';
        }
      }
    });
    s += ns;
    return '<svg class="art ' + cls + '-svg" width="' + g.W + '" height="' + g.H + '" viewBox="0 0 ' + g.W + ' ' + g.H + '" style="overflow:visible">' + s + '</svg>';
  };
  // spec: {spine:t0, head:t0, bones:[t0 x6], notes:[t0 x6], votes:[t0 x3], dim:t0}
  const fishRender = (host, cls, L, t, sp) => {
    const g = fishGeo(L), svg = host.querySelector('.' + cls + '-svg');
    svg.style.transform = at(L.FA.x, L.FA.y + (sp.dy || 0));
    const sw = host.querySelector('.' + cls + '-sp'); if (sw) sw.style.strokeDashoffset = (100 * (1 - eo(seg(t, sp.spine, sp.spine + 0.5)))).toFixed(1);
    const hd = host.querySelector('.' + cls + '-hd'); if (hd) hd.style.opacity = seg(t, sp.head, sp.head + 0.3).toFixed(2);
    for (let i = 0; i < 6; i++) {
      const t0 = (sp.bones || [])[i]; const bn = host.querySelector('.' + cls + '-bn' + i), lb = host.querySelector('.' + cls + '-lb' + i), nt = host.querySelector('.' + cls + '-nt' + i), vt = host.querySelector('.' + cls + '-vt' + i);
      if (bn && t0 !== undefined) bn.style.strokeDashoffset = (100 * (1 - eo(seg(t, t0 - 0.05, t0 + 0.3)))).toFixed(1);
      if (lb && t0 !== undefined) { const p = eob(seg(t, t0, t0 + 0.35), 1.7); lb.style.opacity = clamp01(p * 3).toFixed(2); }
      if (nt) { const n0 = (sp.notes || [])[i]; let o = n0 === undefined ? 0 : clamp01(eo(seg(t, n0, n0 + 0.3)) * 3); if (sp.dim !== undefined && !VOTED.includes(i)) o *= 1 - 0.78 * seg(t, sp.dim, sp.dim + 0.4); nt.style.opacity = o.toFixed(2); }
      if (vt) { const v0 = (sp.votes || [])[VOTED.indexOf(i)]; vt.style.opacity = v0 === undefined ? 0 : seg(t, v0, v0 + 0.25).toFixed(2); }
    }
  };
  const fishAt = (L, el, t, t0) => { /* nothing: the svg is positioned by fishRender */ };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'hook');
      this.C = { chk: T('เช็กยอดจอง'), slow: T('ยังช้า'), staff: T('พนักงาน'), stove: T('เตา'), end: T('ไม่จบ') };
      const cw = (this.cw = V ? 560 : 520);
      host.insertAdjacentHTML('beforeend', '<div class="lyr hk-cam">' + CF.tape(L, 'hk-tape') +
        line('hk-l1', 'เช็กยอดจองทุกเช้าแล้วนะ…', L.mid * 0.9) + line('hk-l2', 'วันเสาร์ก็ยังช้า!', L.mid, 'red') +
        '<div class="card hk-cal" style="width:' + cw + 'px;padding:26px 34px 32px;text-align:center"><p style="font-weight:700;font-size:44px;color:var(--ink2)">เสาร์ที่ผ่านมา</p><p style="font-weight:700;font-size:' + (V ? 84 : 80) + 'px">⏱ 32 นาที</p><p style="font-weight:700;font-size:38px;color:var(--main)">เป้า 20 นาที</p></div>' +
        '<p class="sticker hk-a" style="font-size:' + (V ? 54 : 50) + 'px;background:#BFD6F2">“เพราะพนักงาน!”</p>' +
        '<p class="sticker hk-b" style="font-size:' + (V ? 54 : 50) + 'px;background:#F7C6BD">“เพราะเตา!”</p>' +
        '<p class="stamp hk-q" style="font-size:' + (V ? 110 : 100) + 'px">?</p></div>');
      Object.assign(this, { cam: q(host, '.hk-cam'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), cal: q(host, '.hk-cal'), a: q(host, '.hk-a'), b: q(host, '.hk-b'), qm: q(host, '.hk-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, cx = R.x + R.w / 2, lh = L.mid * 1.3;
      const jolt = CF.shake(t, C.slow, 10) + CF.shake(t, C.end, 6);
      this.cam.style.transform = at(jolt * 0.6, jolt);
      CF.pop(this.l1, t, C.chk - 0.1, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.slow - 0.1, undefined, at(L.tx, L.ty + lh));
      CF.pop(this.cal, t, 0.1, undefined, mid(cx, V ? R.y + 120 : R.y + 150), -2);
      CF.slam(this.a, t, C.staff, mid(V ? R.x + 220 : R.x + 200, V ? R.y + 420 : R.y + 430), -5, 2.0);
      CF.slam(this.b, t, C.stove, mid(V ? R.x + 640 : R.x + 640, V ? R.y + 560 : R.y + 540), 5, 2.0);
      CF.slam(this.qm, t, C.end, mid(cx, V ? R.y + 700 : R.y + 590), 8, 2.4);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'recap');
      this.C = { find: T('ไล่หา', 'สาเหตุ'), fix: T('ลองแก้', 'แก้'), tangle: T('พันกัน', 'หลายข้อ') };
      const cw = (this.cw = V ? 880 : 520), ch = (this.ch = V ? 300 : 560), ic = V ? 240 : 360;
      const svg = (inner) => '<svg width="' + ic + '" height="' + ic + '" viewBox="0 0 ' + ic + ' ' + ic + '" style="overflow:visible">' + inner + '</svg>';
      let pins = '<rect x="6" y="14" width="' + (ic - 12) + '" height="' + (ic * 0.78) + '" rx="12" style="fill:#8A6444;stroke:#1D2430;stroke-width:6"/>';
      const pc = [[0.2, 0.28], [0.72, 0.24], [0.32, 0.56], [0.76, 0.6], [0.5, 0.82]];
      pins += '<polyline points="' + pc.map(([x, y]) => (x * ic) + ',' + (y * ic)).join(' ') + '" style="fill:none;stroke:#E5402F;stroke-width:5"/>';
      pc.forEach(([x, y]) => { pins += '<rect x="' + (x * ic - 24) + '" y="' + (y * ic - 18) + '" width="48" height="38" style="fill:#FFF4E3;stroke:#1D2430;stroke-width:4"/>'; });
      const wheel = (() => { let s = ''; ['#245FA6', '#2B7A4B', '#C7791A', '#6B3FA0'].forEach((c, i) => { const a0 = (-135 + 90 * i + 2) * Math.PI / 180, a1 = (-45 + 90 * i - 2) * Math.PI / 180, R = ic * 0.42, r = ic * 0.18, cx = ic / 2, cy = ic / 2; s += '<path d="M' + (cx + R * Math.cos(a0)) + ' ' + (cy + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)) + ' ' + (cy + R * Math.sin(a1)) + ' L' + (cx + r * Math.cos(a1)) + ' ' + (cy + r * Math.sin(a1)) + ' A' + r + ' ' + r + ' 0 0 0 ' + (cx + r * Math.cos(a0)) + ' ' + (cy + r * Math.sin(a0)) + ' Z" style="fill:' + c + '"/>'; }); return svg(s); })();
      let tang = ''; [[0.15, 0.2, 0.85, 0.7], [0.2, 0.8, 0.8, 0.25], [0.5, 0.1, 0.45, 0.9], [0.1, 0.5, 0.9, 0.55]].forEach(([a, b, c, d]) => { tang += '<path d="M' + (a * ic) + ' ' + (b * ic) + ' C' + ((a + c) / 2 * ic + 40) + ' ' + (b * ic - 60) + ' ' + ((a + c) / 2 * ic - 40) + ' ' + (d * ic + 60) + ' ' + (c * ic) + ' ' + (d * ic) + '" style="fill:none;stroke:#E5402F;stroke-width:8;stroke-linecap:round"/>'; });
      tang += '<text x="' + (ic / 2) + '" y="' + (ic * 0.62) + '" style="font-size:' + (ic * 0.5) + 'px;font-weight:700;fill:#1D2430;text-anchor:middle">?</text>';
      const card = (cls, icon, label) => '<div class="card ' + cls + '" style="width:' + cw + 'px;height:' + ch + 'px;display:flex;' + (V ? 'flex-direction:row;align-items:center;padding:0 28px;gap:24px' : 'flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:12px') + '"><div style="flex:none;width:' + ic + 'px;height:' + ic + 'px">' + icon + '</div><p style="font-weight:700;font-size:' + (V ? 44 : 42) + 'px;line-height:1.2;text-align:' + (V ? 'left' : 'center') + '">' + label + '</p></div>';
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px;transform:' + at(L.tx - 30, L.tapeY) + ' rotate(-3deg)">ตอนที่แล้ว…</p>' +
        card('rc-a', svg(pins), '5 Whys<br>ไล่หาสาเหตุทีละข้อ') + card('rc-b', wheel, 'PDCA<br>ลองแก้ทีละอย่าง') + card('rc-c', svg(tang), 'แต่สาเหตุ<br>พันกันหลายข้อ'));
      Object.assign(this, { tape: q(host, '.rc-tape'), a: q(host, '.rc-a'), b: q(host, '.rc-b'), c: q(host, '.rc-c') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, cw = this.cw, ch = this.ch;
      const pos = V ? [[L.R.x + cw / 2, 480], [L.R.x + cw / 2, 480 + ch + 36], [L.R.x + cw / 2, 480 + 2 * (ch + 36)]]
                    : [[L.tx + cw / 2, 540], [L.tx + cw + 70 + cw / 2, 540], [L.tx + 2 * (cw + 70) + cw / 2, 540]];
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.a, t, C.find - 0.15, undefined, mid(pos[0][0], pos[0][1]), -1.5);
      CF.pop(this.b, t, C.fix - 0.15, undefined, mid(pos[1][0], pos[1][1]), 1.2);
      CF.pop(this.c, t, C.tangle - 0.15, undefined, mid(pos[2][0], pos[2][1]), -1);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'idea');
      this.C = { name: T('ฟิชโบน', 'fishbone', 'fish'), fish: T('ก้างปลา'), all: T('ครบ', 'ทุกด้าน') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') +
        '<p class="t id-name" style="font-size:' + (V ? 120 : 130) + 'px;color:var(--main)">Fishbone</p>' +
        line('id-sub', 'แตกปัญหาเป็นก้างปลา', L.mid * (V ? 0.95 : 0.78), 'mute') + line('id-sub2', 'ไล่ดูให้ครบทุกด้าน', L.mid * (V ? 0.95 : 0.78), 'mute') +
        fishBuild(L, 'id-f', {}));
      Object.assign(this, { name: q(host, '.id-name'), sub: q(host, '.id-sub'), sub2: q(host, '.id-sub2'), host });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, y0 = V ? L.ty - 10 : L.ty + 10;
      CF.slam(this.name, t, C.name, at(L.tx, y0), -2, 1.8);
      CF.pop(this.sub, t, C.fish, undefined, at(L.tx, y0 + (V ? 170 : 180)));
      CF.pop(this.sub2, t, C.all, undefined, at(L.tx, y0 + (V ? 170 : 180) + L.mid * 1.25));
      const f0 = C.fish - 0.2, b = [0, 1, 2, 3, 4, 5].map((i) => f0 + 0.4 + i * 0.16);
      fishRender(this.host, 'id-f', L, t, { spine: f0, head: f0 + 0.2, bones: b, dy: V ? 90 : 0 });
    },
  };

  // generic step-scene builder for scenes 4-8: heading at the left (top on a phone), the fish at its right
  const stepScene = (id, n, en, th, o) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), T = CF.heard(api, id); this.T = T; this.id = id; this.host = host;
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + stepHead(L, id + '-h', n, en, th) + fishBuild(L, id + '-f', o.build || {}) + (o.extra ? o.extra(L, id) : ''));
      Object.assign(this, { h: q(host, '.' + id + '-h'), th: q(host, '.' + id + '-h-th') });
      this.C = o.cues(T); if (o.init) o.init.call(this, host, L, T);
    },
    render(t) {
      const L = this.L, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128)));
      fishRender(this.host, this.id + '-f', L, t, o.spec(this.C));
      if (o.after) o.after.call(this, t, L);
    },
  });

  // 4 head: the problem sentence at the head
  CF.scenes.head = stepScene('head', '1', 'Head', 'หัวปลา', {
    cues: (T) => ({ head: T('หัวปลา'), one: T('ประโยคเดียว', 'สั้น'), meas: T('วัดได้') }),
    spec: (C) => ({ spine: 0.1, head: C.head - 0.1, bones: [] }),
    extra: (L, id) => '<div class="note ' + id + '-n" style="width:' + (L.V ? 640 : 560) + 'px;font-size:' + (L.V ? 40 : 38) + 'px;background:#FFE680;text-align:center">เสาร์ รออาหารเฉลี่ย 32 นาที<br><span style="font-size:.8em;color:var(--main)">เป้า 20 นาที</span></div>',
    init(host) { this.n = q(host, '.head-n'); },
    after(t, L) {
      const F = L.FA, V = L.V; CF.pop(this.n, t, this.C.one - 0.1, undefined, mid(F.x + F.w / 2 - (V ? 40 : 100), F.y + F.h / 2 + (V ? 330 : 270)), -2);
    },
  });

  // 5 bones: the six categories
  CF.scenes.bones = stepScene('bones', '2', 'Bones', 'วาดก้าง 6 ด้าน', {
    cues: (T) => ({ c: [T('คน'), T('วิธีทำงาน', 'วิธี'), T('เครื่องมือ'), T('ข้อมูล'), T('สภาพแวดล้อม', 'สภาพ'), T('การวัด', 'วัดผล')], six: T('หกด้าน', 'ก้าง') }),
    spec: (C) => ({ spine: 0.05, head: 0.1, bones: C.c }),
  });

  // 6 causes: notes on each bone
  CF.scenes.causes = stepScene('causes', '3', 'Causes', 'ช่วยกันคิดสาเหตุ', {
    build: { notes: true },
    cues: (T) => ({ help: T('ช่วยกันคิด'), where: T('พังตรงไหน', 'ตรงไหน'), judge: T('ตัดสิน', 'รีบ') }),
    spec: (C) => ({ spine: 0.0, head: 0.0, bones: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], notes: [0, 1, 2, 3, 4, 5].map((i) => C.help + 0.2 + i * ((C.where - C.help) / 6)) }),
    extra: (L, id) => '<p class="sticker ' + id + '-nj" style="font-size:' + (L.V ? 48 : 44) + 'px;background:#BFE5CC">ยังไม่ตัดสิน</p>',
    init(host) { this.nj = q(host, '.causes-nj'); },
    after(t, L) { const F = L.FA; CF.slam(this.nj, t, this.C.judge, mid(F.x + F.w * (L.V ? 0.72 : 0.8), F.y + F.h + (L.V ? 14 : -10)), -4, 2.0); },
  });

  // 7 vote: three causes ringed, the rest fade
  CF.scenes.vote = stepScene('vote', '4', 'Vote', 'โหวตเลือก 3 ข้อ', {
    build: { notes: true, vote: true },
    cues: (T) => ({ vote: T('โหวต'), three: T('สามข้อ'), most: T('ที่สุด', 'น่าจะใช่') }),
    spec: (C) => ({ spine: 0.0, head: 0.0, bones: [0, 0, 0, 0, 0, 0].map(() => 0.0), notes: [0, 0, 0, 0, 0, 0], dim: C.three - 0.1, votes: [C.three, C.three + 0.35, C.three + 0.7] }),
  });

  // 8 check: look at real data before fixing
  CF.scenes.check = stepScene('check', '5', 'Check', 'ตรวจก่อนแก้', {
    build: { notes: true, vote: true },
    cues: (T) => ({ data: T('ข้อมูลจริง', 'ข้อมูล'), first: T('ก่อน'), guess: T('เดา') }),
    spec: (C) => ({ spine: 0.0, head: 0.0, bones: [0, 0, 0, 0, 0, 0], notes: [0, 0, 0, 0, 0, 0], dim: 0.0, votes: [0, 0, 0] }),
    extra: (L, id) => '<div class="lyr ' + id + '-mg" style="inset:auto;left:0;top:0"><svg width="220" height="220" viewBox="-110 -110 220 220" style="overflow:visible"><circle cx="-8" cy="-8" r="62" style="fill:rgba(255,255,255,.35);stroke:#1D2430;stroke-width:12"/><path d="M38 38 L92 92" style="stroke:#1D2430;stroke-width:18;stroke-linecap:round"/></svg></div>' +
      '<p class="stamp green ' + id + '-st" style="font-size:' + (L.V ? 64 : 58) + 'px;border-width:9px">ตรวจก่อนแก้</p>' +
      '<p class="stamp ' + id + '-no" style="font-size:' + (L.V ? 70 : 64) + 'px">ไม่ใช่เดา!</p>',
    init(host) { this.mg = q(host, '.check-mg'); this.st = q(host, '.check-st'); this.no = q(host, '.check-no'); },
    after(t, L) {
      const F = L.FA, g = fishGeo(L), V = L.V, ps = VOTED.map((i) => { const b = g.bones[i]; return [F.x + b.ix + (V ? 10 : 6) + g.dx * 0.55 + 18 + g.nw / 2 - g.dx * 0.55 * 0 + 0 - 12, F.y + b.iy + b.s * g.ext * 0.55]; });
      // the magnifier moves over the three voted notes one after another
      const t0 = this.C.data - 0.2, seg3 = (t - t0) / 0.9, k = Math.max(0, Math.min(2, Math.floor(seg3))), f = Math.max(0, Math.min(1, seg3 - k)), a = ps[k], b = ps[Math.min(2, k + 1)], p = eio(f);
      const on = seg(t, t0, t0 + 0.3), x = lerp(a[0], b[0], seg3 >= 2 ? 0 : p), y = lerp(a[1], b[1], seg3 >= 2 ? 0 : p);
      this.mg.style.opacity = on.toFixed(2); this.mg.style.transform = at(x, y, ' translate(-50%,-50%)');
      CF.slam(this.st, t, this.C.first, mid(F.x + F.w * (V ? 0.26 : 0.5), F.y + F.h + (V ? 20 : 22)), -4, 2.0);
      CF.slam(this.no, t, this.C.guess, V ? mid(F.x + F.w * 0.74, L.ty + 40) : mid(L.tx + 330, L.ty + 330), 6, 2.2);
      // the unvoted notes stay dim, the voted ones keep their ring
      const svg = this.host.querySelector('.check-f-svg');
    },
  });

  // =========================================================================================== owner (back into PDCA)
  CF.scenes.owner = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'owner');
      this.C = { own: T('เจ้าของร้าน'), three: T('สามข้อ'), pdca: T('พีดีซีเอ', 'pdca'), goal: T('ถึงเป้า', 'เป้า') };
      const sec = ['#245FA6', '#2B7A4B', '#C7791A', '#6B3FA0'], D = V ? 300 : 340;
      let w = ''; sec.forEach((c, i) => { const a0 = (-135 + 90 * i + 2) * Math.PI / 180, a1 = (-45 + 90 * i - 2) * Math.PI / 180, R = 92, r = 40; w += '<path d="M' + R * Math.cos(a0) + ' ' + R * Math.sin(a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + R * Math.cos(a1) + ' ' + R * Math.sin(a1) + ' L' + r * Math.cos(a1) + ' ' + r * Math.sin(a1) + ' A' + r + ' ' + r + ' 0 0 0 ' + r * Math.cos(a0) + ' ' + r * Math.sin(a0) + ' Z" style="fill:' + c + '"/><text x="' + 66 * Math.cos((-90 + 90 * i) * Math.PI / 180) + '" y="' + (66 * Math.sin((-90 + 90 * i) * Math.PI / 180) + 15) + '" style="font-size:46px;font-weight:700;fill:#fff;text-anchor:middle">' + 'PDCA'[i] + '</text>'; });
      const chips = [2, 3, 5].map((i, k) => '<div class="note ow-c' + k + '" style="width:' + (V ? 360 : 330) + 'px;font-size:' + (V ? 34 : 32) + 'px;padding:16px 20px 20px">' + NOTES[i].join('<br>') + '</div>').join('');
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'ow-tape') + line('ow-l1', 'เจ้าของร้านเอาสามข้อนี้', L.mid * (V ? 1 : 0.85)) + line('ow-l2', 'ไปลองแก้ในพีดีซีเอรอบใหม่', L.mid * (V ? 0.9 : 0.85), 'red') +
        '<div class="lyr ow-wh" style="inset:auto;left:0;top:0;width:' + D + 'px;height:' + D + 'px"><svg width="' + D + '" height="' + D + '" viewBox="-100 -100 200 200" style="overflow:visible">' + w + '</svg></div>' + chips +
        '<div class="card ow-goal" style="padding:18px 34px 24px;border-color:var(--d)"><p style="font-weight:700;font-size:' + (V ? 54 : 50) + 'px;color:var(--d);white-space:nowrap">เวลารอ ≤ 20 นาที ✓</p></div>');
      Object.assign(this, { l1: q(host, '.ow-l1'), l2: q(host, '.ow-l2'), wh: q(host, '.ow-wh'), cs: [0, 1, 2].map((k) => q(host, '.ow-c' + k)), goal: q(host, '.ow-goal') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, lh = L.mid * 1.3;
      CF.pop(this.l1, t, C.own - 0.05, undefined, at(L.tx, L.ty)); CF.pop(this.l2, t, C.pdca - 0.2, undefined, at(L.tx, L.ty + lh));
      const wx = V ? R.x + 640 : R.x + R.w * 0.66, wy = V ? R.y + 500 : R.y + 330;
      const turn = seg(t, C.pdca, C.goal + 1.2);
      this.wh.style.transform = mid(wx, wy, ' rotate(' + (360 * eio(turn)).toFixed(1) + 'deg) scale(' + eob(seg(t, C.pdca - 0.2, C.pdca + 0.3), 1.5).toFixed(3) + ')');
      this.wh.style.opacity = seg(t, C.pdca - 0.2, C.pdca + 0.1).toFixed(2);
      const px = R.x + 30, py = V ? [R.y + 70, R.y + 210, R.y + 350] : [R.y + 70, R.y + 220, R.y + 370];
      this.cs.forEach((c, k) => { const t0 = C.three + k * 0.3; CF.pop(c, t, t0, undefined, mid(px + (V ? 190 : 170), py[k]), [-3, 2, -2][k]); });
      CF.slam(this.goal, t, C.goal, mid(V ? R.x + R.w / 2 : R.x + R.w * 0.5, V ? R.y + 740 : R.y + 590), -3, 2.0);
    },
  };

  // =========================================================================================== close (next: Pareto 80/20; the site; the credit)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { see: T('ดูวิธี'), name: T('เข็มทิศ'), next: T('ตอนหน้า'), par: T('พาเรโต', 'pareto') };
      host.insertAdjacentHTML('beforeend',
        '<p class="stamp cl-pd" style="font-size:' + (V ? 130 : 112) + 'px">Fishbone</p>' +
        line('cl-r1', 'แตกปัญหาให้ครบทุกด้าน ก่อนลงมือแก้', V ? 46 : 46) +
        '<div class="cl-next" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 780) + 'px;padding:30px 40px 36px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
          '<p style="font-weight:700;font-size:' + (V ? 40 : 36) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 96 : 84) + 'px;line-height:1.05">Pareto 80/20 ▶</p>' +
          '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;line-height:1.35">ทรัพยากรจำกัด ต้องเลือกว่า<br>จะลงแรงตรงไหนก่อน</p></div>' +
        line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 88 : 80) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t mute cl-url" style="font-size:' + (V ? 34 : 32) + 'px">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t mute cl-org" style="font-size:' + (V ? 28 : 26) + 'px;font-weight:600">แนวคิดจาก: Quality Management · Kaoru Ishikawa</p>' +
        '<p class="t mute cl-ai" style="font-size:' + (V ? 26 : 24) + 'px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      Object.assign(this, { pd: q(host, '.cl-pd'), r1: q(host, '.cl-r1'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      const P = V ? { pd: [80, 300], r1: [80, 540], next: [520, 860], see: [80, 1100], name: [80, 1165], url: [80, 1355], org: [80, 1405], ai: [80, 1450] }
                  : { pd: [110, 150], r1: [110, 340], next: [1370, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.slam(this.pd, t, 0.15, at(P.pd[0], P.pd[1]), -4, 1.6);
      CF.pop(this.r1, t, 0.5, undefined, at(P.r1[0], P.r1[1]));
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(P.next[0], P.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.par) * 8) * Math.exp(-Math.max(0, t - C.par) * 3);
      this.next.style.transform += ' scale(' + wob.toFixed(3) + ')';
      CF.pop(this.see, t, C.see, undefined, at(P.see[0], P.see[1]));
      CF.pop(this.name, t, C.name, undefined, at(P.name[0], P.name[1]), -2);
      CF.pop(this.url, t, C.name + 0.4, undefined, at(P.url[0], P.url[1]));
      CF.pop(this.org, t, C.name + 0.6, undefined, at(P.org[0], P.org[1]));
      CF.pop(this.ai, t, C.name + 0.8, undefined, at(P.ai[0], P.ai[1]));
    },
  };

  window.clipSetup = (api) => {
    for (const [id, sc] of Object.entries(CF.scenes)) {
      const host = api.stage.querySelector('section.scene[data-scene="' + id + '"]');
      if (host && api.scene(id)) { sc.init(host, api); sc.ready = true; }
    }
  };
  window.clipFrame = (t, api) => {
    for (const [id, sc] of Object.entries(CF.scenes)) if (sc.ready) sc.render(api.local(t, id));
  };
})();
