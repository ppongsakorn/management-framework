/* 5 Whys case-file clip: one scene module per id, drawn from scene-local time only.
   Shared by the 9:16 and 16:9 folders (same file); the layout comes from the stage size. */
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

  // ---- scene: hook (who did it? → wrong question → why ×5 → 5 Whys)
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, fs = L.fs;
      // cues from the spoken line (estimated from the text until the voice exists)
      // a word Whisper may write another way (numbers as digits) is tried in each spelling; the first one heard wins
      const heard = api.scene('hook').concat || '', nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, '');
      const T = (...alts) => api.T('w:' + (alts.find((w) => heard.includes(nm(w))) || alts[0]), 'hook');
      const who = T('ใครผิด'), wrong = T('ผิดคำถาม'), why = T('ทำไม'), stamp = T('ไฟว์วายส์', 'ไฟวาย', 'whys', 'wise');
      this.HK = { lights: [0.15, 0.55, 0.95], who, nums: [T('หนึ่ง', '1'), T('สอง', '2'), T('สาม', '3')], wrong, flip: Math.max(wrong + 0.75, why - 0.45),
        whys: [0, 1, 2, 3, 4].map((i) => why + i * Math.min(0.3, Math.max(0.18, (stamp - why - 0.25) / 5))), stamp };
      const [wx, wy, ww, wh] = L.wall;
      let lineup = '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" style="fill:var(--wall)"/>';
      for (let k = 0, y = wy + 60; y < L.floor - 30; k++, y += 80) {
        lineup += '<rect x="' + wx + '" y="' + y + '" width="' + ww + '" height="4" style="fill:var(--second);opacity:.14"/>';
        if (k % 2 === 0) lineup += '<text x="' + (wx + 22) + '" y="' + (y - 10) + '" style="font-size:24px;font-weight:600;fill:var(--second);opacity:.35">' + (180 - k * 10) + '</text>';
      }
      lineup += '<defs><radialGradient id="hook-glow" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFF4E3" stop-opacity=".45"/><stop offset="1" stop-color="#FFF4E3" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="hook-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4E3" stop-opacity=".24"/><stop offset="1" stop-color="#FFF4E3" stop-opacity="0"/></linearGradient></defs>';
      L.sx.forEach((x, i) => {
        lineup += '<g class="hook-sp' + i + '"><path d="M' + (x - 40) + ' ' + wy + ' L' + (x - 112 * fs) + ' ' + L.floor + ' H' + (x + 112 * fs) + ' L' + (x + 40) + ' ' + wy + ' Z" style="fill:url(#hook-cone)"/>' +
          '<ellipse cx="' + x + '" cy="' + (L.floor - 165 * fs) + '" rx="' + 124 * fs + '" ry="' + 195 * fs + '" style="fill:url(#hook-glow)"/></g>';
      });
      lineup += '<rect x="' + wx + '" y="' + (L.floor - 4) + '" width="' + ww + '" height="' + (V ? 80 : 140) + '" style="fill:#100D14"/>';
      const fig = [CF.chef, CF.waiter, CF.cashier];
      L.sx.forEach((x, i) => { lineup += '<g class="hook-s' + i + '">' + fig[i](CF.INK) + '</g>'; });
      L.sx.forEach((x, i) => { lineup += CF.placard('hook-p' + i, i + 1); });
      lineup += '<rect class="hook-dim" x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + (wh + 140) + '" style="fill:var(--ground);opacity:0"/>';
      // the evidence board that takes over: cards still face down, the culprit's card last
      const [bx, by, bw, bh] = L.board, cards = V ? [[800, 500, 4], [760, 760, -3], [815, 1010, 3], [770, 1270, -4]] : [[1270, 250, -4], [1640, 330, 3], [1290, 590, 2], [1650, 760, -3]];
      let board = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="10" style="fill:var(--cork-dark)"/><rect x="' + (bx + 16) + '" y="' + (by + 16) + '" width="' + (bw - 32) + '" height="' + (bh - 32) + '" rx="4" style="fill:var(--cork)"/>';
      for (let i = 0; i < 180; i++) board += '<circle cx="' + (bx + 30 + (i * 397) % (bw - 60)) + '" cy="' + (by + 30 + (i * 211) % (bh - 60)) + '" r="' + (2 + i % 3) + '" style="fill:#76543A"/>';
      board += '<polyline points="' + cards.map((c) => c[0] + ',' + (c[1] - 120)).join(' ') + '" style="fill:none;stroke:var(--main);stroke-width:6;stroke-linejoin:round;opacity:.9"/>';
      cards.forEach(([x, y, r], i) => {
        board += '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + (V ? 0.74 : 0.6) + ')">' +
          CF.card(300, 310, '<text y="34" style="font-size:110px;font-weight:700;fill:' + (i === 3 ? 'var(--main)' : '#B9AC99') + ';text-anchor:middle">?</text>', i === 3 ? 'ตัวการ?' : '') + '</g>' + CF.pin(x, y - 120);
      });
      board += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" style="fill:var(--ground);opacity:.25"/>';
      const whyHtml = [0, 1, 2, 3, 4].map((i) => '<p class="why hook-why' + i + (i === 4 ? ' last' : '') + '" style="font-size:' + L.why.size + 'px"><i>' + (i + 1) + '</i>ทำไม?</p>').join('');
      host.insertAdjacentHTML('beforeend', '<div class="lyr hook-cam">' +
        '<div class="lyr hook-lineup">' + CF.svg(L, lineup) + ['พ่อครัว', 'พนักงานเสิร์ฟ', 'แคชเชียร์'].map((n, i) => '<p class="name hook-n' + i + '" style="font-size:' + (V ? 30 : 26) + 'px">' + n + '</p>').join('') + '</div>' +
        '<div class="lyr hook-board" style="opacity:0">' + CF.svg(L, board) + '</div>' +
        '<p class="tape hook-tape" style="font-size:' + (V ? 34 : 30) + 'px">ตัวอย่างสมมติ · ร้านอาหาร</p>' +
        '<p class="t hook-head" style="font-size:' + L.mid + 'px">อาหารช้าทุกเสาร์…</p>' +
        '<p class="t who hook-who" style="font-size:' + L.big + 'px">ใครผิด?</p>' +
        '<div class="hook-strike" style="position:absolute;left:0;top:0;height:' + Math.round(L.big * 0.11) + 'px;background:var(--second);border:6px solid var(--ink);border-radius:12px;transform-origin:0 50%"></div>' +
        '<p class="sticker hook-wrong" style="font-size:' + (V ? 64 : 56) + 'px">ผิดคำถาม!</p>' + whyHtml +
        '<p class="stamp hook-stamp" style="font-size:' + L.stamp.size + 'px">5 Whys</p></div>' +
        '<p class="cap hook-c1" style="font-size:' + L.cap + 'px;color:var(--accent)">คุณว่าใคร? เมนต์มา 1 2 หรือ 3</p>' +
        '<p class="cap hook-c2" style="font-size:' + L.cap + 'px">ไม่ถามว่า "ใคร" แต่ถาม <b>"ทำไม" ×5</b></p>');
      const q = (c) => host.querySelector(c);
      Object.assign(this, { cam: q('.hook-cam'), lineup: q('.hook-lineup'), board: q('.hook-board'), dim: q('.hook-dim'), tape: q('.hook-tape'), head: q('.hook-head'), who: q('.hook-who'),
        strike: q('.hook-strike'), wrong: q('.hook-wrong'), stamp: q('.hook-stamp'), c1: q('.hook-c1'), c2: q('.hook-c2'),
        sp: [0, 1, 2].map((i) => q('.hook-sp' + i)), su: [0, 1, 2].map((i) => q('.hook-s' + i)), pl: [0, 1, 2].map((i) => q('.hook-p' + i)), nm: [0, 1, 2].map((i) => q('.hook-n' + i)),
        why: [0, 1, 2, 3, 4].map((i) => q('.hook-why' + i)) });
    },
    render(t) {
      const { seg, eio, lerp, clamp01 } = K, L = this.L, V = L.V, fs = L.fs, HK = this.HK;
      // camera: a slow push-in on the lineup, a jolt on each hit
      const jolt = CF.shake(t, HK.who + 0.1, 10) + CF.shake(t, HK.wrong, 14) + CF.shake(t, HK.stamp + 0.1, 12);
      const push = 1 + 0.035 * eio(seg(t, 0, HK.flip));
      this.cam.style.transform = 'translate(' + (jolt * 0.6).toFixed(1) + 'px,' + jolt.toFixed(1) + 'px)';
      this.lineup.style.transform = 'translateX(' + (-L.W * eio(seg(t, HK.flip, HK.flip + 0.4))).toFixed(1) + 'px) scale(' + push.toFixed(4) + ')';
      // lights come on one by one; the suspects breathe until the freeze
      const tf = Math.min(t, HK.wrong);
      HK.lights.forEach((t0, i) => {
        const on = seg(t, t0, t0 + 0.12), dip = 1 - 0.35 * seg(t, t0 + 0.12, t0 + 0.18) + 0.35 * seg(t, t0 + 0.18, t0 + 0.3);
        this.sp[i].style.opacity = (on * dip).toFixed(3);
        const k = [1.03, 0.99, 0.95][i] * fs, br = 1 + 0.008 * Math.sin(tf * 2.2 + i);
        this.su[i].setAttribute('transform', 'translate(' + L.sx[i] + ' ' + L.floor + ') scale(' + (k * br).toFixed(4) + ' ' + (k / br).toFixed(4) + ')');
        // numbers: held up from the start, each bounces when it is called
        const b = seg(t, HK.nums[i], HK.nums[i] + 0.35), hop = Math.sin(Math.PI * b) * 26 * fs;
        this.pl[i].setAttribute('transform', 'translate(' + L.sx[i] + ' ' + (L.floor - 128 * fs - hop).toFixed(1) + ') rotate(' + ([-3, 2, -2][i] + 6 * Math.sin(Math.PI * b)).toFixed(1) + ') scale(' + (fs / 1.7 * (1 + 0.15 * Math.sin(Math.PI * b))).toFixed(3) + ')');
        this.nm[i].style.transform = 'translate(' + L.sx[i] + 'px,' + (L.floor + 8) + 'px) translateX(-50%)';
      });
      // the freeze darkens the room; a whip pan swaps the lineup for the evidence board
      const whip = eio(seg(t, HK.flip, HK.flip + 0.4));
      this.dim.style.opacity = (0.45 * seg(t, HK.wrong, HK.wrong + 0.15)).toFixed(3);
      this.board.style.opacity = whip > 0 ? 1 : 0;
      this.board.style.transform = 'translateX(' + (L.W * (1 - whip)).toFixed(1) + 'px)';
      const lift = 'translateX(' + (-L.W * whip).toFixed(1) + 'px)';
      // once the pan is over, what left the frame is hidden
      const gone = whip > 0.97 ? 'hidden' : 'visible';
      [this.lineup, this.tape, this.head, this.who, this.strike, this.wrong].forEach((el) => { el.style.visibility = gone; });
      this.tape.style.transform = 'translate(' + (L.tx - 120) + 'px,' + L.tapeY + 'px) ' + lift + ' rotate(-3deg)';
      this.head.style.transform = 'translate(' + L.tx + 'px,' + L.headY + 'px) ' + lift;
      CF.slam(this.who, t, HK.who, 'translate(' + (L.tx - 10) + 'px,' + L.whoY + 'px) ' + lift, -4);
      // "wrong question": a bar strikes it through and a sticker slaps on
      const sw = K.eo(seg(t, HK.wrong, HK.wrong + 0.18));
      this.strike.style.width = Math.round((V ? 820 : 740) * sw) + 'px';
      this.strike.style.opacity = sw > 0 ? 1 : 0;
      this.strike.style.transform = 'translate(' + (L.tx - 20) + 'px,' + (L.whoY + L.big * 0.6) + 'px) ' + lift + ' rotate(-4deg)';
      CF.pop(this.wrong, t, HK.wrong + 0.08, undefined, 'translate(560px,' + (V ? L.whoY - 10 : L.whoY - 20) + 'px) ' + lift, 7);
      if (t < HK.wrong + 0.08) this.wrong.style.opacity = 0;
      // why, five times, each a step deeper; the last one is red
      this.why.forEach((el, i) => {
        CF.pop(el, t, HK.whys[i], undefined, 'translate(' + (L.why.x + i * L.why.dx) + 'px,' + (L.why.y + i * L.why.dy) + 'px)');
        if (t < HK.whys[i]) el.style.opacity = 0;
      });
      CF.slam(this.stamp, t, HK.stamp, 'translate(' + L.stamp.x + 'px,' + L.stamp.y + 'px) translate(-50%,-50%)', -10, 2.6);
      // captions at the foot: the guess, then the rule
      CF.pop(this.c1, t, HK.nums[0] - 0.1, HK.flip, 'translate(' + L.capX + 'px,' + L.capY + 'px) translate(-50%,-50%)');
      CF.pop(this.c2, t, HK.whys[0] + 0.2, undefined, 'translate(' + L.capX + 'px,' + L.capY + 'px) translate(-50%,-50%)');
      if (t < HK.nums[0] - 0.1) this.c1.style.opacity = 0;
      if (t < HK.whys[0] + 0.2) this.c2.style.opacity = 0;
    },
  };

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

  // ---- scene: board (five whys pinned on the evidence board, one card per answer)
  CF.scenes.board = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, T = CF.heard(api, 'board');
      const A = [T('ครัวทำไม่ทัน', 'ครัวทําไม่ทัน', 'ไม่ทัน'), T('พ่อครัว'), T('ของที่เตรียม'), T('เตรียมแค่'), T('ไม่มีใคร')];
      const Q = [T('ทำไมช้า'), A[1] - 0.6, A[2] - 0.6, A[3] - 0.6, T('แล้วทำไม')];
      this.A = A; this.Q = Q;
      const [bx, by, bw, bh] = V ? [56, 640, 968, 850] : [990, 90, 880, 900];
      this.pos = V ? [[290, 850], [790, 900], [290, 1120], [790, 1170], [540, 1355]] : [[1180, 260], [1650, 300], [1200, 560], [1660, 590], [1420, 830]];
      this.sc = V ? 0.74 : 0.6; this.rot = [-4, 3, 2, -3, 1];
      const art = [
        CF.ticket(-72, 0, -8) + CF.ticket(-8, -6, 4) + CF.ticket(56, 2, 10),
        '<g transform="translate(-40 100) scale(.6)">' + CF.chef('var(--ink)') + '</g><path d="M40 -80 v170 M110 -80 v170 M40 -80 h70 M40 -20 h70 M40 40 h70" style="stroke:var(--ink);stroke-width:7;fill:none"/>',
        CF.tubBox(-80, 70, 64, 100, '#FFC21A', '') + CF.tubBox(0, 70, 64, 100, '#E5402F', '') + CF.tubBox(80, 70, 64, 100, '#F28C28', ''),
        [0, 1, 2, 3, 4, 5].map((i) => '<rect x="' + (-120 + i * 42) + '" y="' + (i === 5 ? -70 : 30 - (i % 2) * 8) + '" width="30" height="' + (i === 5 ? 150 : 50 + (i % 2) * 8) + '" rx="4" style="fill:' + (i === 5 ? 'var(--main)' : '#9C9184') + '"/>').join('') +
          '<path d="M-130 20 H130" style="stroke:var(--accent);stroke-width:7;stroke-dasharray:16 10"/><rect x="-130" y="80" width="260" height="7" style="fill:var(--ink)"/><text x="90" y="-80" style="font-size:30px;font-weight:700;fill:var(--main);text-anchor:middle">ส.</text>',
        CF.book(-10, 6, 1.05) + '<path d="M40 -90 L110 -90 L110 -20 M110 -90 L60 -40 M110 -90 L80 -30" style="stroke:#8C8273;stroke-width:3;fill:none"/><circle cx="80" cy="-70" r="34" style="fill:var(--main)"/><text x="80" y="-52" style="font-size:52px;font-weight:700;fill:var(--card);text-anchor:middle">!</text>',
      ];
      const caps = ['ครัวไม่ทัน', 'พ่อครัวทิ้งเตา', 'ของหมด', 'เตรียมเท่าวันธรรมดา', 'ไม่มีใครดูยอดจอง'];
      let board = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="10" style="fill:var(--cork-dark)"/><rect x="' + (bx + 16) + '" y="' + (by + 16) + '" width="' + (bw - 32) + '" height="' + (bh - 32) + '" rx="4" style="fill:var(--cork)"/>';
      for (let i = 0; i < 180; i++) board += '<circle cx="' + (bx + 30 + (i * 397) % (bw - 60)) + '" cy="' + (by + 30 + (i * 211) % (bh - 60)) + '" r="' + (2 + i % 3) + '" style="fill:#76543A"/>';
      for (let i = 1; i < 5; i++) { const [x0, y0] = this.pos[i - 1], [x1, y1] = this.pos[i], dy = 155 * this.sc; board += '<path class="bd-str' + i + '" pathLength="100" d="M' + x0 + ' ' + (y0 - dy) + ' L' + x1 + ' ' + (y1 - dy) + '" style="fill:none;stroke:var(--main);stroke-width:6;stroke-dasharray:100 100;stroke-dashoffset:100"/>'; }
      this.pos.forEach(([x, y], i) => { board += '<g class="bd-c' + i + '">' + CF.card(300, 310, art[i], caps[i]) + (i === 4 ? '<rect x="-150" y="-155" width="300" height="310" style="fill:none;stroke:var(--accent);stroke-width:10"/>' : '') + '</g><g class="bd-p' + i + '">' + CF.pin(0, 0) + '</g>'; });
      const labels = [0, 1, 2, 3, 4].map((i) => '<p class="t bd-q' + i + '" style="font-size:' + (V ? 46 : 42) + 'px;color:var(--main)">ทำไม? <span style="color:var(--second);opacity:.6">' + (i + 1) + '/5</span></p>').join('');
      const answers = ['ครัวทำไม่ทัน!', 'พ่อครัวต้องทิ้งเตา<br>ไปหาของ!', 'ของที่เตรียมไว้หมด!', 'เตรียมแค่เท่า<br>วันธรรมดา!', 'ไม่มีใครดู<br>ยอดจองวันเสาร์!'];
      const ans = answers.map((a, i) => '<p class="t bd-a' + i + '" style="font-size:' + (V ? 72 : 68) + 'px;white-space:normal;width:' + (V ? 920 : 820) + 'px;line-height:1.12' + (i === 4 ? ';color:var(--accent)' : '') + '">' + a + '</p>').join('');
      host.insertAdjacentHTML('beforeend', '<div class="lyr bd-cam">' + CF.svg(L, board) + '</div>' + CF.tape(L, 'bd-tape') + labels + ans +
        '<div class="bd-dots" style="position:absolute;left:' + L.tx + 'px;top:' + (V ? 590 : 600) + 'px;display:flex;gap:14px">' + [0, 1, 2, 3, 4].map((i) => '<b class="bd-d' + i + '" style="width:64px;height:16px;border-radius:9px;background:#3A3340"></b>').join('') + '</div>');
      const q = (c) => host.querySelector(c);
      Object.assign(this, { cam: q('.bd-cam'), c: [0, 1, 2, 3, 4].map((i) => q('.bd-c' + i)), p: [0, 1, 2, 3, 4].map((i) => q('.bd-p' + i)), s: [1, 2, 3, 4].map((i) => q('.bd-str' + i)),
        qs: [0, 1, 2, 3, 4].map((i) => q('.bd-q' + i)), as: [0, 1, 2, 3, 4].map((i) => q('.bd-a' + i)), d: [0, 1, 2, 3, 4].map((i) => q('.bd-d' + i)) });
    },
    render(t) {
      const { seg, eio, eo, lerp } = K, L = this.L, V = L.V, A = this.A, Q = this.Q;
      // the camera drifts toward the newest card
      let k = -1; A.forEach((a, i) => { if (t >= a) k = i; });
      const fx = k < 0 ? L.W * 0.5 : this.pos[k][0], fy = k < 0 ? L.H * 0.6 : this.pos[k][1];
      const z = 1.03 + 0.02 * Math.sin(t * 0.6);
      this.cam.style.transformOrigin = fx + 'px ' + fy + 'px';
      this.cam.style.transform = 'scale(' + z.toFixed(4) + ')';
      this.pos.forEach(([x, y], i) => {
        const a = seg(t, A[i] - 0.05, A[i] + 0.35), land = K.eob(a, 1.6);
        this.c[i].setAttribute('transform', 'translate(' + x + ' ' + lerp(y - 160, y, land).toFixed(1) + ') rotate(' + (this.rot[i] + (1 - a) * 12).toFixed(1) + ') scale(' + (this.sc * lerp(1.25, 1, eo(a))).toFixed(3) + ')');
        this.c[i].style.opacity = t < A[i] - 0.05 ? 0 : 1;
        CF.put(this.p[i], x, y - 155 * this.sc, 1, 0, t, A[i] + 0.3);
        if (i > 0) this.s[i - 1].style.strokeDashoffset = (100 * (1 - eio(seg(t, A[i] + 0.3, A[i] + 0.7)))).toFixed(1);
        const on = t >= A[i] + 0.3;
        this.d[i].style.background = on ? 'var(--main)' : '#3A3340';
        // the question, then its answer, until the next question
        const next = i < 4 ? Q[i + 1] : 1e9;
        CF.pop(this.qs[i], t, Q[i], next - 0.05, 'translate(' + L.tx + 'px,' + (V ? 340 : 360) + 'px)');
        CF.hideBefore(this.qs[i], t, Q[i]);
        CF.pop(this.as[i], t, A[i], next - 0.05, 'translate(' + L.tx + 'px,' + (V ? 395 : 420) + 'px)');
        CF.hideBefore(this.as[i], t, A[i]);
      });
    },
  };

  // ---- scene: reveal (the culprit is not a person: it is the missing step)
  CF.scenes.reveal = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, T = CF.heard(api, 'reveal');
      this.R = { t1: 0.15, not: T('ไม่ใช่คน'), step: T('ขั้นตอน'), slot: T('เช็กยอดจอง', 'เช็คยอดจอง', 'ยอดจอง') };
      this.cb = V ? [540, 930] : [1400, 520];
      this.row = V ? { x: [250, 540, 830], y: 1480, s: 0.5 } : { x: [230, 450, 670], y: 980, s: 0.5 };
      const [cx, cy] = this.cb;
      let art = '<defs><linearGradient id="rv-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4E3" stop-opacity=".32"/><stop offset="1" stop-color="#FFF4E3" stop-opacity=".03"/></linearGradient>' +
        '<radialGradient id="rv-glow"><stop offset="0" stop-color="#E5402F" stop-opacity=".6"/><stop offset="1" stop-color="#E5402F" stop-opacity="0"/></radialGradient></defs>' +
        '<path class="rv-cone" d="M' + (cx - 70) + ' ' + (cy - 520) + ' L' + (cx - 360) + ' ' + (cy + 340) + ' H' + (cx + 360) + ' L' + (cx + 70) + ' ' + (cy - 520) + ' Z" style="fill:url(#rv-cone);opacity:0"/>' +
        '<g class="rv-board">' + CF.clipboard(560, 600) + CF.line('rv-l1', -210, -170, 'เปิดเตา', true) + CF.line('rv-l2', -210, -70, 'ล้างผัก', true) +
        '<ellipse class="rv-glow" cx="0" cy="100" rx="320" ry="150" style="fill:url(#rv-glow)"/><rect class="rv-slot" x="-230" y="30" width="460" height="150" rx="18" style="fill:var(--card);stroke:var(--main);stroke-width:9;stroke-dasharray:26 16"/>' +
        '<g class="rv-what">' + CF.book(-160, 105, 0.62) + '<text x="-100" y="90" style="font-size:44px;font-weight:700;fill:var(--main)">เช็กยอดจอง</text><text x="-100" y="148" style="font-size:44px;font-weight:700;fill:var(--main)">ก่อนเตรียมของ</text></g>' +
        '<g class="rv-stamp"><rect x="-130" y="-46" width="260" height="92" rx="12" style="fill:rgba(255,244,227,.6);stroke:var(--main);stroke-width:10"/><text y="18" style="font-size:54px;font-weight:700;fill:var(--main);text-anchor:middle">ตัวการ!</text></g></g>';
      const fig = [CF.chef, CF.waiter, CF.cashier];
      this.row.x.forEach((x, i) => { art += '<g class="rv-s' + i + '">' + fig[i]('#3A3340') + '</g>'; });
      host.insertAdjacentHTML('beforeend', CF.svg(L, art) + CF.tape(L, 'rv-tape') +
        '<p class="t rv-t1" style="font-size:' + (V ? 72 : 64) + 'px">คนร้ายตัวจริง…</p>' +
        '<p class="t who rv-t2" style="font-size:' + (V ? 190 : 170) + 'px">ไม่ใช่คน!</p>' +
        this.row.x.map((x, i) => '<p class="name rv-n' + i + '" style="font-size:' + (V ? 28 : 24) + 'px;background:#1E9E6A">✓ พ้นผิด</p>').join(''));
      const q = (c) => host.querySelector(c);
      Object.assign(this, { cone: q('.rv-cone'), board: q('.rv-board'), glow: q('.rv-glow'), slot: q('.rv-slot'), what: q('.rv-what'), stamp: q('.rv-stamp'), t1: q('.rv-t1'), t2: q('.rv-t2'),
        s: [0, 1, 2].map((i) => q('.rv-s' + i)), n: [0, 1, 2].map((i) => q('.rv-n' + i)) });
    },
    render(t) {
      const { seg, eo, eob, lerp } = K, L = this.L, V = L.V, R = this.R, [cx, cy] = this.cb;
      CF.pop(this.t1, t, R.t1, undefined, 'translate(' + L.tx + 'px,' + (V ? 262 + 70 : 210) + 'px)');
      CF.slam(this.t2, t, R.not, 'translate(' + (L.tx - 10) + 'px,' + (V ? 410 : 280) + 'px)', -3);
      // the cleared suspects step back into the dark
      this.row.x.forEach((x, i) => {
        const back = eo(seg(t, R.not + 0.2 + i * 0.12, R.not + 0.6 + i * 0.12));
        this.s[i].setAttribute('transform', 'translate(' + x + ' ' + this.row.y + ') scale(' + (this.row.s * [1.03, 0.99, 0.95][i]).toFixed(3) + ')');
        this.s[i].style.opacity = (1 - 0.5 * back).toFixed(2);
        CF.pop(this.n[i], t, R.not + 0.3 + i * 0.12, undefined, 'translate(' + x + 'px,' + (this.row.y - 330 * this.row.s) + 'px) translate(-50%,-50%)');
        CF.hideBefore(this.n[i], t, R.not + 0.3 + i * 0.12);
      });
      // the light swings onto the kitchen's routine; the empty slot glows; the stamp lands on it
      const on = seg(t, R.step - 0.35, R.step);
      this.cone.style.opacity = on.toFixed(3);
      const rise = eob(seg(t, R.step - 0.35, R.step + 0.25), 1.4);
      this.board.setAttribute('transform', 'translate(' + cx + ' ' + lerp(cy + 120, cy, rise).toFixed(1) + ') rotate(-2) scale(' + (V ? 0.95 : 0.82) + ')');
      this.board.style.opacity = on.toFixed(3);
      this.glow.style.opacity = (seg(t, R.slot - 0.2, R.slot + 0.2) * (0.75 + 0.25 * Math.sin(t * 6))).toFixed(3);
      this.slot.style.strokeDashoffset = (-t * 40).toFixed(1);
      this.what.style.opacity = seg(t, R.slot - 0.1, R.slot + 0.2).toFixed(3);
      const st = seg(t, R.slot + 0.35, R.slot + 0.55), land = eob(seg(t, R.slot + 0.5, R.slot + 0.8), 2);
      this.stamp.setAttribute('transform', 'translate(150 250) rotate(-10) scale(0.8) scale(' + (lerp(2.4, 1, K.ei(st)) * (0.96 + 0.04 * land)).toFixed(3) + ')');
      this.stamp.style.opacity = st > 0 ? 1 : 0;
    },
  };

  // ---- scene: fix (case closed: check bookings every morning; running out to buy more only treats the symptom)
  CF.scenes.fix = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, T = CF.heard(api, 'fix');
      this.F = { closed: T('ปิดคดี'), chef: T('หัวหน้าครัว'), check: T('เช็กยอดจอง', 'เช็คยอดจอง', 'ยอดจอง'), run: T('วิ่ง'), only: T('แค่แก้อาการ', 'แค่แก่อาการ', 'อาการ') };
      this.cb = V ? [560, 760, 0.9] : [800, 560, 0.8];
      this.chef = V ? [170, 1080, 0.8] : [400, 900, 0.8];
      this.tubX = V ? [790, 860, 930] : [1130, 1210, 1290]; this.tubY = V ? 1090 : 840;
      this.run = V ? [300, 1460, 0.82] : [1620, 960, 0.78];
      let art = '<g class="fx-board">' + CF.clipboard(560, 600) + CF.line('fx-l1', -210, -170, 'เปิดเตา', true) + CF.line('fx-l2', -210, -70, 'ล้างผัก', true) + CF.line('fx-l3', -210, 40, '', false) + '</g>';
      art += '<g class="fx-chef">' + CF.cook('fx-cook', '<g transform="translate(108 -120) rotate(-8) scale(.8)">' + CF.openBook('fx-ob') + '</g>') + '</g>';
      this.tubX.forEach((x, i) => { art += '<g class="fx-tub' + i + '">' + CF.tubBox(0, 0, 60, 84, ['#FFC21A', '#E5402F', '#F28C28'][i], 'fx-f' + i) + '</g>'; });
      art += '<g class="fx-run"><path class="fx-sp" d="M-118 -170 H-170 M-104 -126 H-178 M-118 -82 H-162" style="fill:none;stroke:#6B6270;stroke-width:9;stroke-linecap:round"/>' +
        '<g class="fx-leg1" transform="translate(-12 -66)"><path d="M0 0 V66" style="stroke:var(--card);stroke-width:20;stroke-linecap:round"/></g><g class="fx-leg2" transform="translate(12 -66)"><path d="M0 0 V66" style="stroke:var(--card);stroke-width:20;stroke-linecap:round"/></g>' +
        '<path d="M-56 -62 Q-62 -160 -40 -178 H40 Q62 -160 56 -62 Z" style="fill:var(--card)"/><circle cy="-210" r="32" style="fill:#3A3340"/><g transform="translate(0 -268)">' + CF.hat() + '</g>' +
        '<path d="M40 -150 L92 -112" style="stroke:var(--card);stroke-width:20;stroke-linecap:round"/><g transform="translate(96 -100)"><path d="M-16 4 Q0 -22 16 4" style="fill:none;stroke:var(--card);stroke-width:6"/><path d="M-30 4 H30 L24 74 H-24 Z" style="fill:var(--accent);stroke:var(--ink);stroke-width:6;stroke-linejoin:round"/></g></g>';
      art += '<g class="fx-x">' + ['M-110 -300 L110 -10', 'M110 -300 L-110 -10'].map((d, i) => '<path class="fx-x' + i + '" pathLength="100" d="' + d + '" style="fill:none;stroke:var(--ink);stroke-width:44;stroke-linecap:round;stroke-dasharray:100 100;stroke-dashoffset:100"/><path class="fx-x' + i + '" pathLength="100" d="' + d + '" style="fill:none;stroke:var(--main);stroke-width:26;stroke-linecap:round;stroke-dasharray:100 100;stroke-dashoffset:100"/>').join('') + '</g>';
      host.insertAdjacentHTML('beforeend', CF.svg(L, art) + CF.tape(L, 'fx-tape') +
        '<p class="stamp fx-closed" style="font-size:' + (V ? 110 : 96) + 'px;color:#5BE0A5;border-color:#5BE0A5">ปิดคดี!</p>' +
        '<p class="t fx-new" style="font-size:' + Math.round(46 * this.cb[2]) + 'px;color:var(--ink)">เช็กยอดจองทุกเช้า</p>' +
        '<p class="t fx-runl" style="font-size:' + (V ? 50 : 46) + 'px">วิ่งซื้อของกลางคัน…</p>' +
        '<p class="sticker fx-only" style="font-size:' + (V ? 62 : 56) + 'px">= แค่แก้อาการ</p>');
      const q = (c) => host.querySelector(c), qa = (c) => [...host.querySelectorAll(c)];
      Object.assign(this, { board: q('.fx-board'), v3: q('.fx-l3-v'), chefG: q('.fx-chef'), ob: qa('.fx-ob-v'), tubs: [0, 1, 2].map((i) => q('.fx-tub' + i)), fills: [0, 1, 2].map((i) => q('.fx-f' + i)),
        runG: q('.fx-run'), l1: q('.fx-leg1'), l2: q('.fx-leg2'), sp: q('.fx-sp'), x: q('.fx-x'), x0: qa('.fx-x0'), x1: qa('.fx-x1'), closed: q('.fx-closed'), nw: q('.fx-new'), runl: q('.fx-runl'), only: q('.fx-only') });
    },
    render(t) {
      const { seg, eo, eio, lerp, clamp01 } = K, L = this.L, V = L.V, F = this.F, [bx, by, bs] = this.cb;
      CF.slam(this.closed, t, F.closed, 'translate(' + (V ? 540 : 580) + 'px,' + (V ? 360 : 200) + 'px) translate(-50%,-50%)', -8, 2.4);
      this.board.setAttribute('transform', 'translate(' + bx + ' ' + by + ') rotate(-2) scale(' + bs + ')');
      // the missing line is written in and ticked as the voice says it
      const wr = eo(seg(t, F.check, F.check + 0.4));
      this.nw.style.opacity = wr.toFixed(3);
      const lx = bx + (-210 + 92) * bs, ly = by + 40 * bs;
      this.nw.style.transform = 'translate(' + (lx + 20 * (1 - wr)).toFixed(1) + 'px,' + ly.toFixed(1) + 'px) rotate(-2deg) translateY(-55%)';
      this.v3.style.strokeDashoffset = (100 * (1 - eo(seg(t, F.check + 0.4, F.check + 0.7)))).toFixed(1);
      // the head chef with the bookings; the tubs fill to match
      CF.put(this.chefG, this.chef[0], this.chef[1] + 4 * Math.sin(t * 2.4), this.chef[2], 0, t, F.chef - 0.1);
      this.ob.forEach((el, i) => { el.style.strokeDashoffset = (100 * (1 - eo(seg(t, F.check + 0.1 + i * 0.25, F.check + 0.35 + i * 0.25)))).toFixed(1); });
      this.tubX.forEach((x, i) => {
        CF.put(this.tubs[i], x, this.tubY, V ? 1 : 0.95, 0, t, F.chef + 0.2 + i * 0.1);
        const lvl = lerp(0.05, 0.9, K.eob(seg(t, F.check + 0.6 + i * 0.15, F.check + 1.2 + i * 0.15), 1.3));
        this.fills[i].setAttribute('height', (72 * lvl).toFixed(1));
        this.fills[i].setAttribute('y', (-6 - 72 * lvl).toFixed(1));
      });
      // running out mid-service: he dashes in, keeps running, and gets crossed out
      const [rx0, ry, rs] = this.run, ph = t * 14, rx = rx0 + (V ? -1 : 1) * 0 + 300 * (1 - eo(seg(t, F.run, F.run + 0.5)));
      this.runG.style.opacity = t < F.run ? 0 : 1;
      this.runG.setAttribute('transform', 'translate(' + rx.toFixed(1) + ' ' + (ry - 8 * Math.abs(Math.sin(ph))).toFixed(1) + ') scale(' + rs + ') rotate(8)');
      this.l1.setAttribute('transform', 'translate(-12 -66) rotate(' + (32 * Math.sin(ph)).toFixed(1) + ')');
      this.l2.setAttribute('transform', 'translate(12 -66) rotate(' + (-32 * Math.sin(ph)).toFixed(1) + ')');
      this.sp.style.opacity = (0.5 + 0.5 * Math.sin(ph * 0.5)).toFixed(2);
      CF.pop(this.runl, t, F.run, undefined, V ? 'translate(560px,1190px)' : 'translate(1290px,420px)');
      CF.hideBefore(this.runl, t, F.run);
      this.x.setAttribute('transform', 'translate(' + rx.toFixed(1) + ' ' + ry + ') scale(' + rs + ')');
      const d0 = (100 * (1 - eo(seg(t, F.only - 0.05, F.only + 0.12)))).toFixed(1), d1 = (100 * (1 - eo(seg(t, F.only + 0.08, F.only + 0.25)))).toFixed(1);
      this.x0.forEach((el) => { el.style.strokeDashoffset = d0; }); this.x1.forEach((el) => { el.style.strokeDashoffset = d1; });
      CF.pop(this.only, t, F.only + 0.1, undefined, V ? 'translate(590px,1300px)' : 'translate(1300px,520px)', -4);
      CF.hideBefore(this.only, t, F.only + 0.1);
    },
  };

  // ---- scene: rules (the detective's three rules = the 5 Whys tips)
  CF.scenes.rules = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, T = CF.heard(api, 'rules');
      this.at = [T('หลักฐาน'), T('ระบบ'), T('อาการ')];
      const icons = [
        '<circle cx="-8" cy="-8" r="34" style="fill:none;stroke:var(--ink);stroke-width:12"/><path d="M18 18 L46 46" style="stroke:var(--ink);stroke-width:14;stroke-linecap:round"/>',
        '<rect x="-56" y="-20" width="34" height="40" rx="6" style="fill:var(--ink)"/><rect x="-6" y="-20" width="34" height="40" rx="6" style="fill:var(--main)"/><path d="M-22 0 H-6 M28 0 H44" style="stroke:var(--ink);stroke-width:8"/><circle cx="54" cy="0" r="12" style="fill:var(--ink)"/>',
        '<path d="M-36 -10 A40 40 0 1 1 -24 26" style="fill:none;stroke:var(--ink);stroke-width:12;stroke-linecap:round"/><path d="M-50 -22 L-36 -6 L-20 -24" style="fill:none;stroke:var(--ink);stroke-width:10;stroke-linecap:round;stroke-linejoin:round"/><path d="M-16 0 l12 12 l24 -26" style="fill:none;stroke:var(--main);stroke-width:12;stroke-linecap:round;stroke-linejoin:round"/>',
      ];
      const words = ['ใช้หลักฐาน', 'โทษระบบ<br><span style="color:var(--main)">ไม่โทษคน</span>', 'แก้แล้ว<br>อาการไม่กลับมา'];
      const cw = V ? 900 : 540, ch = V ? 250 : 360;
      this.cards = V ? [[90, 560], [90, 860], [90, 1160]] : [[110, 470], [690, 470], [1270, 470]];
      host.insertAdjacentHTML('beforeend', '<p class="stamp rl-title" style="font-size:' + (V ? 100 : 90) + 'px;color:var(--accent);border-color:var(--accent)">กฎนักสืบ</p>' +
        '<p class="t rl-sub" style="font-size:' + (V ? 40 : 36) + 'px;opacity:.75">ของ 5 Whys</p>' +
        words.map((w, i) => '<div class="rl-c' + i + '" style="position:absolute;left:0;top:0;width:' + cw + 'px;height:' + ch + 'px;background:var(--card);color:var(--ink);border-radius:18px;box-shadow:12px 14px 0 rgba(0,0,0,.45);display:flex;' + (V ? 'align-items:center;gap:36px;padding:0 40px' : 'flex-direction:column;justify-content:center;gap:22px;padding:0 40px') + ';transform-origin:50% 50%">' +
          '<svg width="130" height="130" viewBox="-65 -65 130 130" style="flex:none">' + icons[i] + '</svg><p style="font-weight:700;font-size:' + (V ? 62 : 54) + 'px;line-height:1.18">' + w + '</p>' +
          '<b style="position:absolute;top:14px;right:22px;font-size:34px;color:#B9AC99">' + (i + 1) + '</b></div>').join(''));
      const q = (c) => host.querySelector(c);
      Object.assign(this, { title: q('.rl-title'), sub: q('.rl-sub'), c: [0, 1, 2].map((i) => q('.rl-c' + i)) });
    },
    render(t) {
      const L = this.L, V = L.V;
      CF.slam(this.title, t, 0.05, 'translate(' + (V ? 80 : 110) + 'px,' + (V ? 270 : 120) + 'px)', -4, 1.8);
      CF.pop(this.sub, t, 0.4, undefined, 'translate(' + (V ? 90 : 120) + 'px,' + (V ? 440 : 300) + 'px)');
      CF.hideBefore(this.sub, t, 0.4);
      this.c.forEach((el, i) => {
        const [x, y] = this.cards[i];
        CF.pop(el, t, this.at[i] - 0.15, undefined, 'translate(' + x + 'px,' + y + 'px)', [-1.5, 1, -1][i]);
        CF.hideBefore(el, t, this.at[i] - 0.15);
      });
    },
  };

  // ---- scene: close (recap, next case PDCA, the site)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = CF.L(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { next: T('คดีหน้า'), pdca: T('พีดีซีเอ', 'pdca'), site: T('ดูวิธี'), name: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend',
        '<p class="stamp cl-5w" style="font-size:' + (V ? 140 : 120) + 'px">5 Whys</p>' +
        '<p class="t cl-r1" style="font-size:' + (V ? 64 : 58) + 'px">ถามทำไม จนถึงราก</p>' +
        '<p class="t cl-r2" style="font-size:' + (V ? 64 : 58) + 'px;color:var(--accent)">ไม่ใช่แค่อาการ</p>' +
        '<div class="cl-next" style="position:absolute;left:0;top:0;width:' + (V ? 900 : 700) + 'px;padding:30px 40px 36px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.5);transform-origin:50% 50%">' +
          '<p style="font-weight:700;font-size:' + (V ? 40 : 36) + 'px;color:var(--main)">แฟ้มคดีหน้า</p><p class="cl-pdca" style="font-weight:700;font-size:' + (V ? 120 : 110) + 'px;line-height:1.05">PDCA ▶</p>' +
          '<p style="font-weight:700;font-size:' + (V ? 40 : 36) + 'px">วางแผน → ทำ → ตรวจ → ปรับ</p></div>' +
        '<p class="t cl-see" style="font-size:' + (V ? 44 : 40) + 'px">ดูวิธีเต็ม ๆ ได้ที่เว็บ</p>' +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 92 : 84) + 'px;background:var(--ink);color:var(--second);padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t cl-url" style="font-size:' + (V ? 34 : 32) + 'px;font-weight:600;opacity:.85">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t cl-ai" style="font-size:' + (V ? 26 : 24) + 'px;font-weight:600;opacity:.55">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      const q = (c) => host.querySelector(c);
      Object.assign(this, { w5: q('.cl-5w'), r1: q('.cl-r1'), r2: q('.cl-r2'), next: q('.cl-next'), pdca: q('.cl-pdca'), see: q('.cl-see'), name: q('.cl-name'), url: q('.cl-url'), ai: q('.cl-ai') });
    },
    render(t) {
      const L = this.L, V = L.V, C = this.C;
      const P = V ? { w5: [80, 270], r1: [90, 470], r2: [90, 550], next: [80, 690], see: [90, 1120], name: [80, 1180], url: [90, 1330], ai: [90, 1410] }
                  : { w5: [110, 120], r1: [120, 330], r2: [120, 410], next: [1110, 220], see: [120, 560], name: [110, 620], url: [120, 770], ai: [120, 960] };
      CF.slam(this.w5, t, 0.05, 'translate(' + P.w5[0] + 'px,' + P.w5[1] + 'px)', -6, 1.8);
      CF.pop(this.r1, t, 0.35, undefined, 'translate(' + P.r1[0] + 'px,' + P.r1[1] + 'px)'); CF.hideBefore(this.r1, t, 0.35);
      CF.pop(this.r2, t, 0.6, undefined, 'translate(' + P.r2[0] + 'px,' + P.r2[1] + 'px)'); CF.hideBefore(this.r2, t, 0.6);
      CF.pop(this.next, t, C.next - 0.1, undefined, 'translate(' + P.next[0] + 'px,' + P.next[1] + 'px)', 2); CF.hideBefore(this.next, t, C.next - 0.1);
      const b = K.seg(t, C.pdca, C.pdca + 0.35);
      this.pdca.style.transform = 'scale(' + (1 + 0.12 * Math.sin(Math.PI * b)).toFixed(3) + ')';
      this.pdca.style.transformOrigin = '0 50%';
      CF.pop(this.see, t, C.site, undefined, 'translate(' + P.see[0] + 'px,' + P.see[1] + 'px)'); CF.hideBefore(this.see, t, C.site);
      CF.pop(this.name, t, C.name, undefined, 'translate(' + P.name[0] + 'px,' + P.name[1] + 'px)', -2); CF.hideBefore(this.name, t, C.name);
      CF.pop(this.url, t, C.name + 0.4, undefined, 'translate(' + P.url[0] + 'px,' + P.url[1] + 'px)'); CF.hideBefore(this.url, t, C.name + 0.4);
      CF.pop(this.ai, t, C.name + 0.7, undefined, 'translate(' + P.ai[0] + 'px,' + P.ai[1] + 'px)'); CF.hideBefore(this.ai, t, C.name + 0.7);
    },
  };

  // runtime hooks: build each scene into its <section>, then draw it from its own local time
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
