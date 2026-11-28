/* Helpers shared with the 5 Whys case clip: layout, pop/slam, silhouettes, cards, props.
   Copied from clips/5-whys/case/case.js (the CF object and the shared props) so that clip stays untouched.
   The PDCA scenes are in scenes.js. */
(() => {
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const K = {
    clamp01, lerp: (a, b, x) => a + (b - a) * x,
    seg: (t, a, b) => clamp01((t - a) / Math.max(1e-6, b - a)),
    eo: (x) => 1 - Math.pow(1 - x, 3), ei: (x) => x * x * x,
    eio: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    eob: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  };
  const CF = (window.CF = {
    K,
    L(W, H) {
      const V = H > W;
      return V
        ? { V, W, H, tx: 80, tapeY: 262, headY: 345, whoY: 430, big: 230, mid: 74,
            wall: [0, 640, 1080, 730], floor: 1352, sx: [250, 540, 830], fs: 1.7,
            capX: 540, capY: 1462, cap: 48, why: { x: 96, y: 320, dx: 46, dy: 160, size: 124 }, stamp: { x: 430, y: 1250, size: 116 },
            board: [56, 300, 968, 1180] }
        : { V, W, H, tx: 110, tapeY: 130, headY: 215, whoY: 300, big: 210, mid: 70,
            wall: [960, 0, 960, 1080], floor: 940, sx: [1190, 1450, 1710], fs: 1.32,
            capX: 470, capY: 1000, cap: 44, why: { x: 120, y: 120, dx: 44, dy: 132, size: 104 }, stamp: { x: 700, y: 850, size: 104 },
            board: [990, 90, 880, 900] };
    },
    svg(L, inner) { return '<svg class="art" width="' + L.W + '" height="' + L.H + '" viewBox="0 0 ' + L.W + ' ' + L.H + '">' + inner + '</svg>'; },
    // a sticker or word pops in at t0 with overshoot and (if t1) leaves at t1; base keeps a placing translate
    pop(el, t, t0, t1, base, rot) {
      const a = clamp01((t - t0) / 0.36), e = K.eob(a, 1.8);
      let o = clamp01((t - t0) / 0.1), sc = 0.35 + 0.65 * e;
      if (t1 !== undefined && t > t1) { const b = clamp01((t - t1) / 0.25); o *= 1 - b; sc *= 1 - 0.2 * b; }
      el.style.opacity = o.toFixed(3);
      el.style.transform = (base || '') + ' scale(' + sc.toFixed(3) + ') rotate(' + ((rot || 0) + (1 - a) * -6).toFixed(2) + 'deg)';
    },
    // a slam: big and fast, lands with a bump
    slam(el, t, t0, base, rot, from) {
      const a = clamp01((t - t0) / 0.2), land = K.eob(clamp01((t - t0 - 0.12) / 0.3), 2.2);
      el.style.opacity = t < t0 ? 0 : clamp01((t - t0) / 0.06).toFixed(3);
      el.style.transform = (base || '') + ' scale(' + (K.lerp(from || 2.2, 1, K.ei(a)) * (0.97 + 0.03 * land)).toFixed(3) + ') rotate(' + (rot || 0) + 'deg)';
    },
    shake(t, t0, amp) { const d = t - t0; return d < 0 ? 0 : amp * Math.sin(d * 42) * Math.exp(-d * 7); },
    INK: 'var(--ink)',
    // faceless figures, feet on (0,0), about 320 units tall
    body(fill, extra) {
      return '<path d="M-24 0 V-70 M24 0 V-70" style="fill:none;stroke:' + fill + ';stroke-width:22;stroke-linecap:round"/>' +
        '<path d="M-58 -62 Q-64 -160 -40 -178 H40 Q64 -160 58 -62 Z" style="fill:' + fill + '"/><circle cy="-210" r="34" style="fill:' + fill + '"/>' + (extra || '');
    },
    chef(fill) { return CF.body(fill, '<path d="M-32 -234 V-272 Q-52 -282 -42 -306 Q-26 -330 0 -316 Q26 -330 42 -306 Q52 -282 32 -272 V-234 Z" style="fill:' + fill + '"/>'); },
    waiter(fill) {
      return CF.body(fill, '<path d="M40 -160 L92 -230" style="stroke:' + fill + ';stroke-width:22;stroke-linecap:round"/>' +
        '<rect x="40" y="-252" width="110" height="14" rx="7" style="fill:' + fill + '"/><path d="M62 -252 Q95 -300 128 -252 Z" style="fill:' + fill + '"/>');
    },
    cashier(fill) { return CF.body(fill, '<path d="M-36 -236 Q0 -268 36 -236 Z M30 -238 H66 V-230 H30 Z" style="fill:' + fill + '"/>'); },
    placard(cls, n) {
      return '<g class="' + cls + '"><rect x="-62" y="-44" width="124" height="88" rx="8" style="fill:var(--card);stroke:var(--ink);stroke-width:6"/>' +
        '<text y="22" style="font-size:64px;font-weight:700;fill:var(--ink);text-anchor:middle">' + n + '</text></g>';
    },
    card(w, h, inner, cap) {
      return '<rect x="' + (-w / 2 + 10) + '" y="' + (-h / 2 + 14) + '" width="' + w + '" height="' + h + '" style="fill:rgba(0,0,0,.35)"/>' +
        '<rect x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h + '" style="fill:var(--card)"/>' +
        '<rect x="' + (-w / 2 + 16) + '" y="' + (-h / 2 + 16) + '" width="' + (w - 32) + '" height="' + (h - 90) + '" style="fill:#E9DFD0"/>' +
        '<g transform="translate(0 ' + (-h / 2 + 16 + (h - 90) / 2) + ')">' + (inner || '') + '</g>' +
        (cap ? '<text y="' + (h / 2 - 28) + '" style="font-size:32px;font-weight:700;fill:var(--ink);text-anchor:middle">' + cap + '</text>' : '');
    },
    pin(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="15" style="fill:var(--main);stroke:var(--ink);stroke-width:5"/><circle cx="' + (x - 5) + '" cy="' + (y - 5) + '" r="5" style="fill:#FFB3A8"/>'; },
    scenes: {},
  });

  // ---- props shared by the later scenes
  Object.assign(CF, {
    tape(L, cls) { return '<p class="tape ' + cls + '" style="font-size:' + (L.V ? 34 : 30) + 'px;transform:translate(' + (L.tx - 120) + 'px,' + L.tapeY + 'px) rotate(-3deg)">ตัวอย่างสมมติ · ร้านอาหาร</p>'; },
    hat(fill) { return '<path d="M-30 38 V2 Q-48 -8 -38 -30 Q-24 -52 0 -40 Q24 -52 38 -30 Q48 -8 30 2 V38 Z" style="fill:' + (fill || 'var(--card)') + ';stroke:var(--ink);stroke-width:7;stroke-linejoin:round"/>'; },
    ticket(x, y, r) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><rect x="-30" y="-44" width="60" height="88" rx="5" style="fill:var(--card);stroke:var(--ink);stroke-width:5"/><rect x="-18" y="-26" width="36" height="7" rx="3" style="fill:var(--ink)"/><rect x="-18" y="-10" width="26" height="7" rx="3" style="fill:#B9AFA2"/><rect x="-18" y="6" width="30" height="7" rx="3" style="fill:#B9AFA2"/></g>'; },
    tubBox(x, y, w, h, color, cls) {
      return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + -w / 2 + '" y="' + -h + '" width="' + w + '" height="' + h + '" rx="8" style="fill:var(--card);stroke:var(--ink);stroke-width:6"/>' +
        '<rect class="' + (cls || '') + '" x="' + (-w / 2 + 6) + '" y="' + (-h + 6) + '" width="' + (w - 12) + '" height="' + (h - 12) + '" style="fill:' + color + '"/>' +
        '<rect x="' + (-w / 2 - 6) + '" y="' + (-h - 10) + '" width="' + (w + 12) + '" height="13" rx="5" style="fill:var(--ink)"/></g>';
    },
    book(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-46" y="-58" width="92" height="116" rx="8" style="fill:var(--main);stroke:var(--ink);stroke-width:7"/><rect x="-46" y="-58" width="18" height="116" style="fill:var(--ink)"/><rect x="-14" y="-30" width="46" height="10" rx="5" style="fill:var(--card)"/><rect x="-14" y="-12" width="34" height="10" rx="5" style="fill:var(--card)"/></g>'; },
    openBook(cls) {
      let h = '<g class="' + cls + '"><path d="M0 -38 Q-44 -56 -84 -44 V44 Q-44 32 0 50 Z" style="fill:var(--card);stroke:var(--ink);stroke-width:7;stroke-linejoin:round"/><path d="M0 -38 Q44 -56 84 -44 V44 Q44 32 0 50 Z" style="fill:var(--card);stroke:var(--ink);stroke-width:7;stroke-linejoin:round"/>';
      [-22, 0, 22].forEach((y, i) => { h += '<rect x="-68" y="' + (y - 4) + '" width="' + (52 - i * 8) + '" height="8" rx="4" style="fill:#B9AFA2"/><path class="' + cls + '-v" pathLength="100" d="M18 ' + y + ' l8 8 l16 -16" style="fill:none;stroke:var(--main);stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100 100;stroke-dashoffset:100"/>'; });
      return h + '</g>';
    },
    // a cream silhouette in a chef's coat (for the lit kitchen scenes), feet on (0,0)
    cook(cls, arm) {
      return '<g class="' + cls + '"><path d="M-22 0 V-70 M22 0 V-70" style="fill:none;stroke:var(--card);stroke-width:20;stroke-linecap:round"/>' +
        '<path d="M-56 -62 Q-62 -160 -40 -178 H40 Q62 -160 56 -62 Z" style="fill:var(--card)"/><circle cy="-140" r="6" style="fill:var(--ink)"/><circle cy="-110" r="6" style="fill:var(--ink)"/>' +
        '<circle cy="-210" r="32" style="fill:#3A3340"/><g transform="translate(0 -268)">' + CF.hat() + '</g>' + (arm || '') + '</g>';
    },
    clipboard(w, h) {
      return '<rect x="' + (-w / 2 + 10) + '" y="' + (-h / 2 + 12) + '" width="' + w + '" height="' + h + '" rx="26" style="fill:#000;opacity:.4"/>' +
        '<rect x="' + -w / 2 + '" y="' + -h / 2 + '" width="' + w + '" height="' + h + '" rx="26" style="fill:var(--card);stroke:var(--ink);stroke-width:10"/>' +
        '<rect x="-100" y="' + (-h / 2 - 34) + '" width="200" height="70" rx="16" style="fill:var(--ink)"/><g transform="translate(0 ' + (-h / 2) + ') scale(.6)">' + CF.hat() + '</g>';
    },
    line(cls, x, y, word, done) {
      return '<g class="' + cls + '"><rect x="' + x + '" y="' + (y - 32) + '" width="64" height="64" rx="12" style="fill:var(--card);stroke:var(--ink);stroke-width:8"/>' +
        '<path class="' + cls + '-v" pathLength="100" d="M' + (x + 14) + ' ' + y + ' l14 16 l28 -34" style="fill:none;stroke:var(--main);stroke-width:11;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:100 100;stroke-dashoffset:' + (done ? 0 : 100) + '"/>' +
        '<text x="' + (x + 92) + '" y="' + (y + 16) + '" style="font-size:48px;font-weight:700;fill:var(--ink)">' + word + '</text></g>';
    },
    // place an SVG group: translate, scale, rotate; pops from its origin when t0 is given
    put(el, x, y, s, r, t, t0) {
      let sc = s, op = 1;
      if (t0 !== undefined) { const a = clamp01((t - t0) / 0.36); sc = s * (0.35 + 0.65 * K.eob(a, 1.8)); op = clamp01((t - t0) / 0.1); }
      el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(3) + ') rotate(' + (r || 0) + ')');
      el.style.opacity = op;
    },
    hideBefore(el, t, t0) { if (t < t0) el.style.opacity = 0; },
    heard(api, id) {
      const heard = api.scene(id).concat || '', nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, '');
      return (...alts) => api.T('w:' + (alts.find((w) => heard.includes(nm(w))) || alts[0]), id);
    },
  });
})();
