/* PDCA, episode 2 of the restaurant series: one scene module per id, drawn from scene-local time only.
   Shared by the 9:16 and 16:9 folders (same file); the layout comes from the stage size.
   Helpers (pop, slam, tape, silhouettes) come from cf.js, which is a copy of the ones in the 5 Whys case clip.
   The cues (T('คำ')) are words in the spoken line; a word the voice transcript does not contain is placed by its
   position in the text, so the scenes can be checked before the voice exists. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;

  // ---- layout: the text column (top on a phone) and the visual area R, per size. The phone keeps clear of the top 250 px
  // and the bottom 420 px, where the social apps put their buttons.
  const LAY = (W, H) => {
    const V = H > W;
    return V
      ? { V, W, H, tx: 80, tapeY: 262, ty: 372, mid: 80, small: 46, R: { x: 80, y: 640, w: 880, h: 780 }, wheel: { x: 880, y: 340, d: 170 }, capX: 540, capY: 1462 }
      : { V, W, H, tx: 110, tapeY: 120, ty: 250, mid: 84, small: 44, R: { x: 960, y: 300, w: 850, h: 660 }, wheel: { x: 1730, y: 170, d: 160 }, capX: 540, capY: 990 };
  };
  const SEC = ['var(--p)', 'var(--d)', 'var(--c)', 'var(--a)'], LET = ['P', 'D', 'C', 'A'], TH = ['วางแผน', 'ลงมือ', 'ตรวจ', 'ปรับ'];
  const pt = (r, deg) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
  const at = (x, y, extra) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (extra || '');
  const mid = (x, y, extra) => at(x, y) + ' translate(-50%,-50%)' + (extra || '');
  const q = (host, c) => host.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';

  // the four-part wheel; every quarter is a group pl-<cls><i> whose opacity says whether it is lit
  const wheelHtml = (cls, size, thai) => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      const a0 = -135 + 90 * i + 2, a1 = -45 + 90 * i - 2, R = 92, r = 40;
      const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0), [lx, ly] = pt(66, -90 + 90 * i);
      s += '<g class="' + cls + i + '"><path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        ' A' + r + ' ' + r + ' 0 0 0 ' + x3.toFixed(1) + ' ' + y3.toFixed(1) + ' Z" style="fill:' + SEC[i] + '"/>' +
        '<text x="' + lx.toFixed(1) + '" y="' + (ly + (thai ? 4 : 15)).toFixed(1) + '" style="font-size:' + (thai ? 34 : 46) + 'px;font-weight:700;fill:#fff;text-anchor:middle">' + LET[i] + '</text>' +
        (thai ? '<text x="' + lx.toFixed(1) + '" y="' + (ly + 22).toFixed(1) + '" style="font-size:13px;font-weight:700;fill:#fff;text-anchor:middle">' + TH[i] + '</text>' : '') + '</g>';
    }
    s += '<circle r="24" style="fill:var(--ground);stroke:var(--ink);stroke-width:4"/><path d="M-9 -3 A10 10 0 1 1 -4 8" style="fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round"/><path d="M-13 -1 L-8 -8 L-3 0" style="fill:none;stroke:var(--ink);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>';
    return '<div class="lyr ' + cls + '-w" style="inset:auto;left:0;top:0;width:' + size + 'px;height:' + size + 'px"><svg width="' + size + '" height="' + size + '" viewBox="-100 -100 200 200" style="overflow:visible">' + s + '</svg></div>';
  };
  const wheelRender = (host, cls, t, lit, pos, rot, scale) => {
    host.querySelector('.' + cls + '-w').style.transform = mid(pos[0], pos[1], ' rotate(' + (rot || 0).toFixed(1) + 'deg) scale(' + (scale || 1).toFixed(3) + ')');
    for (let i = 0; i < 4; i++) { const g = host.querySelector('.' + cls + i); if (g) g.style.opacity = (0.22 + 0.78 * lit[i]).toFixed(3); }
  };
  // the little wheel in the corner of the four step scenes; `on` is the lit quarter
  const cornerWheel = (L, cls) => wheelHtml(cls, L.wheel.d, false);
  const cornerRender = (host, L, cls, t, on, t0) => {
    const p = eob(seg(t, t0, t0 + 0.4), 1.6), lit = [0, 1, 2, 3].map((i) => (i === on ? 1 : i < on ? 0.55 : 0));
    wheelRender(host, cls, t, lit, [L.wheel.x, L.wheel.y], 0, p);
  };
  const stepHead = (L, cls, n, en, th, color) =>
    '<p class="t ' + cls + '" style="font-size:' + (L.V ? 92 : 96) + 'px"><i style="display:inline-block;font-style:normal;min-width:1.15em;text-align:center;margin-right:.22em;padding:0 .1em .08em;border-radius:.22em;background:' + color + ';color:#fff;font-size:.82em">' + n + '</i>' + en + '</p>' +
    '<p class="t mute ' + cls + '-th" style="font-size:' + (L.V ? 60 : 56) + 'px;color:' + color + '">' + th + '</p>';
  const grow = (el, t, t0, d) => { const p = eo(seg(t, t0, t0 + d)); el.style.opacity = clamp01(p * 4).toFixed(3); return p; };
  const fadeIn = (el, t, t0, base, dy) => { const p = eo(seg(t, t0, t0 + 0.4)); el.style.opacity = p.toFixed(3); el.style.transform = base + ' translateY(' + ((1 - p) * (dy === undefined ? 26 : dy)).toFixed(1) + 'px)'; };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'hook');
      this.C = { know: T('รู้สาเหตุ'), bust: T('เจ๊ง', 'เจ๋ง'), bad: T('บริการ') };
      const cw = (this.cw = V ? 760 : 700), ch = (this.ch = V ? 600 : 580);
      const rows = ['เปิดเตา', 'ล้างผัก', 'เช็กยอดจองทุกเช้า'].map((w, i) => '<div style="display:flex;align-items:center;gap:22px;margin-top:' + (i ? 30 : 0) + 'px"><span style="display:inline-grid;place-items:center;width:64px;height:64px;border:7px solid var(--ink);border-radius:14px;font-size:44px;font-weight:700;color:var(--d)">✓</span><span style="font-size:' + (V ? 48 : 44) + 'px;font-weight:700">' + w + '</span></div>').join('');
      host.insertAdjacentHTML('beforeend', '<div class="lyr hk-cam">' + CF.tape(L, 'hk-tape') +
        '<div class="card hk-card" style="width:' + cw + 'px;height:' + ch + 'px;padding:40px 44px"><p style="font-weight:700;font-size:34px;color:var(--ink2);margin-bottom:30px">งานเช้าของครัว</p>' + rows + '</div>' +
        '<p class="stamp green hk-ok" style="font-size:' + (V ? 92 : 84) + 'px">ปิดคดี!</p>' +
        line('hk-l1', 'รู้สาเหตุแล้ว…', L.mid) + line('hk-l2', 'ร้านยังเจ๊งได้!', L.mid, 'red') + line('hk-l3', 'บริการก็ยังแย่!', L.mid, 'red') +
        '<p class="stamp hk-bust" style="font-size:' + (V ? 124 : 112) + 'px">เจ๊ง!</p>' +
        '<p class="sticker hk-bad" style="font-size:' + (V ? 68 : 62) + 'px">บริการแย่ ☹</p></div>');
      Object.assign(this, { cam: q(host, '.hk-cam'), card: q(host, '.hk-card'), ok: q(host, '.hk-ok'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), l3: q(host, '.hk-l3'), bust: q(host, '.hk-bust'), bad: q(host, '.hk-bad') });
    },
    render(t) {
      const L = this.L, C = this.C, cx = L.R.x + L.R.w / 2, cy = L.R.y + L.R.h / 2 - (L.V ? 0 : 60), lh = L.mid * 1.3;
      const jolt = CF.shake(t, C.bust, 12) + CF.shake(t, C.bad, 7);
      this.cam.style.transform = at(jolt * 0.6, jolt);
      CF.pop(this.card, t, 0.04, undefined, mid(cx, cy), -2);
      const g = seg(t, C.bust, C.bust + 0.3);
      this.card.style.filter = 'grayscale(' + g.toFixed(2) + ') brightness(' + (1 - 0.18 * g).toFixed(2) + ')';
      CF.slam(this.ok, t, C.know, mid(cx + this.cw * 0.2, cy - this.ch * 0.4), -10, 2.4);
      CF.pop(this.l1, t, C.know - 0.05, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.bust - 0.05, undefined, at(L.tx, L.ty + lh));
      CF.pop(this.l3, t, C.bad - 0.05, undefined, at(L.tx, L.ty + 2 * lh));
      CF.slam(this.bust, t, C.bust, mid(cx, cy + 10), 8, 2.6);
      CF.pop(this.bad, t, C.bad, undefined, mid(cx - this.cw * 0.12, cy + this.ch * 0.42), -5);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'recap');
      this.C = { fire: T('ไล่พ่อครัว', 'ไล่'), why: T('ไฟว์วายส์', 'ไฟวาย', 'whys', 'wise'), root: T('สาเหตุ', 'ขั้นตอน', 'เช็กยอดจอง') };
      const cw = (this.cw = V ? 880 : 520), ch = (this.ch = V ? 340 : 620), ic = V ? 300 : 440;
      const svg = (inner, w, h) => '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="overflow:visible">' + inner + '</svg>';
      const chef = svg('<g transform="translate(' + (ic / 2) + ' ' + (ic * 0.93) + ') scale(' + (ic / 430) + ')">' + CF.chef('#1D2430') + '</g>', ic, ic);
      let pins = '<rect x="6" y="20" width="' + (ic - 12) + '" height="' + (ic * 0.78) + '" rx="12" style="fill:#8A6444;stroke:#1D2430;stroke-width:6"/>';
      const pc = [[0.2, 0.28], [0.72, 0.24], [0.32, 0.56], [0.76, 0.6], [0.5, 0.82]];
      pins += '<polyline points="' + pc.map(([x, y]) => (x * ic) + ',' + (y * ic)).join(' ') + '" style="fill:none;stroke:#E5402F;stroke-width:5"/>';
      pc.forEach(([x, y], i) => { pins += '<rect x="' + (x * ic - 30) + '" y="' + (y * ic - 24) + '" width="60" height="48" style="fill:#FFF4E3;stroke:#1D2430;stroke-width:4"/><circle cx="' + (x * ic) + '" cy="' + (y * ic - 24) + '" r="8" style="fill:#E5402F"/>' + (i === 4 ? '<text x="' + (x * ic) + '" y="' + (y * ic + 12) + '" style="font-size:30px;font-weight:700;fill:#E5402F;text-anchor:middle">!</text>' : ''); });
      const list = svg('<rect x="' + (ic * 0.1) + '" y="10" width="' + (ic * 0.8) + '" height="' + (ic * 0.9) + '" rx="14" style="fill:#FFF4E3;stroke:#1D2430;stroke-width:7"/>' +
        [0, 1].map((i) => '<rect x="' + (ic * 0.18) + '" y="' + (44 + i * 66) + '" width="40" height="40" rx="8" style="fill:#fff;stroke:#1D2430;stroke-width:5"/><path d="M' + (ic * 0.18 + 8) + ' ' + (64 + i * 66) + ' l9 10 l16 -22" style="fill:none;stroke:#2B7A4B;stroke-width:7;stroke-linecap:round"/><rect x="' + (ic * 0.18 + 60) + '" y="' + (54 + i * 66) + '" width="' + (ic * 0.38) + '" height="14" rx="7" style="fill:#B9AFA2"/>').join('') +
        '<rect x="' + (ic * 0.16) + '" y="172" width="' + (ic * 0.68) + '" height="64" rx="10" style="fill:none;stroke:#E5402F;stroke-width:5;stroke-dasharray:14 9"/><text x="' + (ic * 0.5) + '" y="214" style="font-size:24px;font-weight:700;fill:#E5402F;text-anchor:middle">เช็กยอดจอง?</text>', ic, ic);
      const card = (cls, icon, label, stamp) => '<div class="card ' + cls + '" style="width:' + cw + 'px;height:' + ch + 'px;display:flex;' + (V ? 'flex-direction:row;align-items:center;padding:0 28px;gap:24px' : 'flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:12px') + '">' +
        '<div style="position:relative;width:' + ic + 'px;height:' + ic + 'px;flex:none">' + icon + (stamp ? '<p class="stamp ' + cls + '-s" style="font-size:' + (V ? 44 : 50) + 'px;border-width:8px;padding:0 18px 8px">' + stamp + '</p>' : '') + '</div>' +
        '<p style="font-weight:700;font-size:' + (V ? 46 : 44) + 'px;line-height:1.2;text-align:' + (V ? 'left' : 'center') + '">' + label + '</p></div>';
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px;transform:' + at(L.tx - 30, L.tapeY) + ' rotate(-3deg)">ตอนที่แล้ว…</p>' +
        card('rc-a', chef, 'ไล่พ่อครัวผิดคน', 'ไล่ออก!') + card('rc-b', svg(pins, ic, ic), 'ไฟว์วายส์ ถามทำไม ×5') + card('rc-c', list, 'สาเหตุราก: ไม่เช็กยอดจอง'));
      Object.assign(this, { tape: q(host, '.rc-tape'), a: q(host, '.rc-a'), b: q(host, '.rc-b'), c: q(host, '.rc-c'), as: q(host, '.rc-a-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, cw = this.cw, ch = this.ch;
      const pos = V ? [[L.R.x + cw / 2, 470], [L.R.x + cw / 2, 470 + ch + 36], [L.R.x + cw / 2, 470 + 2 * (ch + 36)]]
                    : [[L.tx + cw / 2, 540], [L.tx + cw + 70 + cw / 2, 540], [L.tx + 2 * (cw + 70) + cw / 2, 540]];
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.a, t, C.fire - 0.15, undefined, mid(pos[0][0], pos[0][1]), -1.5);
      CF.pop(this.b, t, C.why - 0.15, undefined, mid(pos[1][0], pos[1][1]), 1.2);
      CF.pop(this.c, t, C.root - 0.15, undefined, mid(pos[2][0], pos[2][1]), -1);
      CF.slam(this.as, t, C.fire + 0.15, 'translate(-50%,-50%) translate(' + (V ? 150 : 215) + 'px,' + (V ? 140 : 190) + 'px)', -12, 2.3);
      this.as.style.left = '0'; this.as.style.top = '0';
    },
  };

  // =========================================================================================== idea (what PDCA is)
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'idea');
      this.C = { name: T('พีดีซีเอ', 'pdca'), ring: T('วงล้อ'), p: T('วางแผน'), d: T('ลงมือ'), c: T('ตรวจ'), a: T('ปรับ') };
      const big = V ? 150 : 170;
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') +
        '<p class="t id-name" style="font-size:' + big + 'px;letter-spacing:.02em"><span style="color:var(--p)">P</span><span style="color:var(--d)">D</span><span style="color:var(--c)">C</span><span style="color:var(--a)">A</span></p>' +
        line('id-sub', 'วงล้อสี่ขั้น', L.mid, 'mute') + line('id-sub2', 'วนเป็นรอบสั้นๆ', L.mid * 0.8, 'mute') +
        wheelHtml('id-wh', V ? 700 : 640, true));
      Object.assign(this, { name: q(host, '.id-name'), sub: q(host, '.id-sub'), sub2: q(host, '.id-sub2') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, host = this.sub.parentNode;
      CF.slam(this.name, t, C.name, at(L.tx, V ? L.ty - 10 : L.ty + 20), -2, 1.8);
      CF.pop(this.sub, t, C.ring, undefined, at(L.tx, (V ? L.ty - 10 : L.ty + 20) + (V ? 190 : 210)));
      CF.pop(this.sub2, t, C.d + 0.3, undefined, at(L.tx, (V ? L.ty - 10 : L.ty + 20) + (V ? 190 : 210) + L.mid * 1.2));
      const lit = [C.p, C.d, C.c, C.a].map((t0) => seg(t, t0 - 0.05, t0 + 0.2));
      const turn = eio(seg(t, C.a + 0.5, C.a + 2.6));
      wheelRender(host, 'id-wh', t, lit, [L.R.x + L.R.w / 2, L.R.y + L.R.h / 2 + (V ? 0 : 0)], 360 * turn, eob(seg(t, 0.1, 0.6), 1.5));
    },
  };

  // =========================================================================================== plan
  CF.scenes.plan = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'plan');
      this.C = { goal: T('ตั้งเป้า', 'เป้า'), idea: T('เช็กยอดจอง'), meas: T('วิธีวัด', 'วัด') };
      const s = L.small;
      const ruler = '<svg width="150" height="56" viewBox="0 0 150 56" style="vertical-align:middle;margin-left:12px"><rect x="2" y="8" width="146" height="40" rx="6" style="fill:#fff;stroke:#1D2430;stroke-width:4"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => '<path d="M' + (14 + i * 15.5) + ' 8 v' + (i % 2 ? 14 : 22) + '" style="stroke:#1D2430;stroke-width:4"/>').join('') + '</svg>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'pl-tape') + stepHead(L, 'pl-h', '1', 'Plan', 'วางแผน', 'var(--p)') + cornerWheel(L, 'pl-cw') +
        '<div class="note green pl-n1" style="width:' + (V ? 560 : 420) + 'px;font-size:' + (s + 10) + 'px">เป้า: เวลารอลด</div>' +
        '<div class="note pl-n2" style="width:' + (V ? 700 : 520) + 'px;font-size:' + s + 'px">ถ้า <u>เช็กยอดจองทุกเช้า</u><br>→ เวลารอจะลดลง</div>' +
        '<div class="note blue pl-n3" style="width:' + (V ? 740 : 600) + 'px;font-size:' + s + 'px">วัดด้วย "เวลารอเฉลี่ย" (นาที) ' + ruler + '</div>');
      Object.assign(this, { h: q(host, '.pl-h'), th: q(host, '.pl-h-th'), n1: q(host, '.pl-n1'), n2: q(host, '.pl-n2'), n3: q(host, '.pl-n3') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, host = this.h.parentNode;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128)));
      cornerRender(host, L, 'pl-cw', t, 0, 0.1);
      const P = V ? [[R.x, R.y + 10], [R.x + 150, R.y + 270], [R.x + 40, R.y + 540]] : [[R.x + 10, R.y + 10], [R.x + 300, R.y + 170], [R.x + 60, R.y + 400]];
      CF.pop(this.n1, t, C.goal - 0.1, undefined, at(P[0][0], P[0][1]), -3);
      CF.pop(this.n2, t, C.idea - 0.15, undefined, at(P[1][0], P[1][1]), 2);
      CF.pop(this.n3, t, C.meas - 0.1, undefined, at(P[2][0], P[2][1]), -1.5);
    },
  };

  // =========================================================================================== do
  CF.scenes.do = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'do');
      this.C = { small: T('ลองเล็ก'), two: T('สองวัน', 'วันเสาร์') };
      const cell = (i) => '<div class="do-c' + i + '" style="position:relative;width:' + (V ? 380 : 360) + 'px;height:' + (V ? 250 : 250) + 'px;border:6px solid var(--ink);border-radius:18px;background:#fff;display:grid;place-items:center;text-align:center">' +
        '<p style="font-weight:700;font-size:' + (V ? 50 : 48) + 'px;line-height:1.1">เสาร์ที่ ' + (i + 1) + '</p>' + '<p class="do-m' + i + '" style="font-weight:700;font-size:' + (V ? 54 : 52) + 'px;color:var(--d);margin-top:-18px">' + (i < 2 ? 'ลอง ✓' : '') + '</p></div>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'do-tape') + stepHead(L, 'do-h', '2', 'Do', 'ลงมือ', 'var(--d)') + cornerWheel(L, 'do-cw') +
        '<div class="card do-cal" style="width:' + (V ? 880 : 850) + 'px;padding:34px 38px 38px"><p style="font-weight:700;font-size:40px;color:var(--ink2);margin-bottom:22px">วันเสาร์ 4 ครั้ง</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;justify-items:center">' + [0, 1, 2, 3].map(cell).join('') + '</div>' +
        '<p class="do-note" style="margin-top:26px;font-weight:700;font-size:' + (V ? 44 : 42) + 'px;color:var(--d);text-align:center">ลองเล็ก ๆ ก่อน ไม่ต้องทั้งร้าน</p></div>');
      Object.assign(this, { h: q(host, '.do-h'), th: q(host, '.do-h-th'), cal: q(host, '.do-cal'), cs: [0, 1, 2, 3].map((i) => q(host, '.do-c' + i)), ms: [0, 1].map((i) => q(host, '.do-m' + i)), note: q(host, '.do-note') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, host = this.h.parentNode;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128)));
      cornerRender(host, L, 'do-cw', t, 1, 0.1);
      CF.pop(this.cal, t, 0.2, undefined, mid(R.x + R.w / 2, R.y + R.h / 2 + (V ? 20 : 10)));
      this.cs.forEach((c, i) => { if (i < 2) { const on = seg(t, C.two + i * 0.35, C.two + i * 0.35 + 0.25); c.style.background = on > 0 ? 'rgb(' + Math.round(lerp(255, 255, on)) + ',' + Math.round(lerp(255, 230, on)) + ',' + Math.round(lerp(255, 128, on)) + ')' : '#fff'; this.ms[i].style.opacity = on.toFixed(2); } else c.style.opacity = (1 - 0.55 * seg(t, C.two, C.two + 0.4)).toFixed(2); });
      fadeIn(this.note, t, C.two + 0.6, '', 10);
    },
  };

  // =========================================================================================== check
  CF.scenes.check = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'check');
      this.C = { cmp: T('เทียบ'), num: T('ตัวเลข'), better: T('ดีขึ้น'), goal: T('ไม่ถึงเป้า', 'ถึงเป้า', 'เป้า') };
      const cw = (this.cw = V ? 880 : 850), ch = (this.ch = V ? 700 : 640), base = ch - 120, sc = (ch - 230) / 45;   // minutes -> px
      this.geo = { base, sc, x0: cw * 0.2, x1: cw * 0.6, bw: cw * 0.22 };
      const bar = (cls, x, color, label, val) => '<rect class="' + cls + '" x="' + x + '" y="' + (base) + '" width="' + this.geo.bw + '" height="0" style="fill:' + color + ';stroke:#1D2430;stroke-width:5"/>' +
        '<text class="' + cls + '-v" x="' + (x + this.geo.bw / 2) + '" y="' + (base - val * sc - 18) + '" style="font-size:44px;font-weight:700;fill:#1D2430;text-anchor:middle;opacity:0">' + val + ' นาที</text>' +
        '<text x="' + (x + this.geo.bw / 2) + '" y="' + (base + 56) + '" style="font-size:42px;font-weight:700;fill:#1D2430;text-anchor:middle">' + label + '</text>';
      const gy = base - 20 * sc;
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'ck-tape') + stepHead(L, 'ck-h', '3', 'Check', 'ตรวจ', 'var(--c)') + cornerWheel(L, 'ck-cw') +
        '<div class="card ck-card" style="width:' + cw + 'px;height:' + ch + 'px"><svg width="' + cw + '" height="' + ch + '" viewBox="0 0 ' + cw + ' ' + ch + '" style="overflow:visible"><text x="30" y="52" style="font-size:36px;font-weight:700;fill:#5A6270">เวลารอเฉลี่ยของลูกค้า</text>' +
        '<path d="M40 ' + base + ' H' + (cw - 40) + '" style="stroke:#1D2430;stroke-width:6;stroke-linecap:round"/>' +
        bar('ck-b0', this.geo.x0, '#B9AFA2', 'ก่อน', 40) + bar('ck-b1', this.geo.x1, 'var(--d)', 'หลัง', 32) +
        '<g class="ck-goal" style="opacity:0"><path d="M40 ' + gy + ' H' + (cw - 40) + '" style="stroke:#E5402F;stroke-width:6;stroke-dasharray:18 12"/><text x="' + (cw - 40) + '" y="' + (gy - 14) + '" style="font-size:40px;font-weight:700;fill:#E5402F;text-anchor:end">เป้า 20 นาที</text></g>' +
        '<g class="ck-ok" style="opacity:0"><circle cx="' + (this.geo.x1 + this.geo.bw / 2) + '" cy="' + (base - 32 * sc - 90) + '" r="34" style="fill:#2B7A4B"/><path d="M' + (this.geo.x1 + this.geo.bw / 2 - 16) + ' ' + (base - 32 * sc - 90) + ' l11 12 l22 -26" style="fill:none;stroke:#fff;stroke-width:8;stroke-linecap:round;stroke-linejoin:round"/></g></svg></div>' +
        '<p class="sticker ck-no" style="font-size:' + (V ? 64 : 58) + 'px;background:#F7C6BD">ยังไม่ถึงเป้า!</p>');
      Object.assign(this, { h: q(host, '.ck-h'), th: q(host, '.ck-h-th'), card: q(host, '.ck-card'), b0: q(host, '.ck-b0'), b1: q(host, '.ck-b1'), v0: q(host, '.ck-b0-v'), v1: q(host, '.ck-b1-v'), goal: q(host, '.ck-goal'), ok: q(host, '.ck-ok'), no: q(host, '.ck-no') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, host = this.h.parentNode, g = this.geo, cx = R.x + R.w / 2, cy = R.y + R.h / 2 + (V ? 20 : 10);
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128)));
      cornerRender(host, L, 'ck-cw', t, 2, 0.1);
      CF.pop(this.card, t, 0.2, undefined, mid(cx, cy), 0);
      const h0 = eo(seg(t, C.cmp, C.cmp + 0.5)) * 40 * g.sc, h1 = eo(seg(t, C.num, C.num + 0.5)) * 32 * g.sc;
      this.b0.setAttribute('y', g.base - h0); this.b0.setAttribute('height', h0); this.v0.style.opacity = seg(t, C.cmp + 0.3, C.cmp + 0.5).toFixed(2);
      this.b1.setAttribute('y', g.base - h1); this.b1.setAttribute('height', h1); this.v1.style.opacity = seg(t, C.num + 0.3, C.num + 0.5).toFixed(2);
      this.ok.style.opacity = seg(t, C.better, C.better + 0.25).toFixed(2);
      this.goal.style.opacity = seg(t, C.goal - 0.1, C.goal + 0.3).toFixed(2);
      CF.slam(this.no, t, C.goal, mid(cx - (V ? 0 : 20), cy - this.ch / 2 + (V ? 90 : 40)), -4, 2);
    },
  };

  // =========================================================================================== act
  CF.scenes.act = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'act');
      this.C = { good: T('ได้ผล'), std: T('มาตรฐาน'), miss: T('ไม่ถึงเป้า', 'เป้า'), hyp: T('สมมติฐานใหม่', 'สมมติฐาน') };
      const w = (this.w = V ? 880 : 850), h = (this.h2 = V ? 340 : 300);
      const lane = (cls, color, tag, body) => '<div class="card ' + cls + '" style="width:' + w + 'px;height:' + h + 'px;border-color:' + color + ';display:flex;align-items:center;gap:28px;padding:0 34px"><p style="flex:none;font-weight:700;font-size:' + (V ? 54 : 52) + 'px;color:' + color + ';line-height:1.15;width:' + (V ? 250 : 240) + 'px">' + tag + '</p>' + body + '</div>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'ac-tape') + stepHead(L, 'ac-h', '4', 'Act', 'ปรับ', 'var(--a)') + cornerWheel(L, 'ac-cw') +
        lane('ac-g', '#2B7A4B', 'ได้ผล<br>→ ทำต่อ', '<div style="position:relative;flex:1"><div style="background:#FFF4E3;border:5px solid var(--ink);border-radius:12px;padding:18px 22px;font-weight:700;font-size:' + (V ? 40 : 38) + 'px;line-height:1.3">ขั้นตอนงาน<br>เช็กยอดจองทุกเช้า</div><p class="stamp green ac-st" style="font-size:' + (V ? 54 : 50) + 'px;border-width:8px;padding:0 16px 8px">มาตรฐาน!</p></div>') +
        lane('ac-r', '#E5402F', 'ไม่ถึงเป้า<br>→ กลับไป', '<div class="note pink ac-hy" style="position:relative;flex:1;font-size:' + (V ? 44 : 42) + 'px;box-shadow:6px 8px 0 rgba(0,0,0,.14)">สมมติฐานใหม่ ↻<br><span style="font-size:.7em;font-weight:600">แล้ววนอีกรอบ</span></div>'));
      Object.assign(this, { hd: q(host, '.ac-h'), th: q(host, '.ac-h-th'), g: q(host, '.ac-g'), r: q(host, '.ac-r'), st: q(host, '.ac-st'), hy: q(host, '.ac-hy') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, host = this.hd.parentNode, cx = R.x + R.w / 2, top = V ? R.y + 40 : R.y + 20, gap = (V ? 40 : 30);
      CF.pop(this.hd, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128)));
      cornerRender(host, L, 'ac-cw', t, 3, 0.1);
      CF.pop(this.g, t, C.good - 0.15, undefined, mid(cx, top + this.h2 / 2), -1);
      CF.slam(this.st, t, C.std, 'translate(' + (V ? 40 : 60) + 'px,' + (V ? 30 : 24) + 'px) translate(-50%,-50%)', -8, 2.2); this.st.style.left = (V ? '48%' : '40%'); this.st.style.top = '70%';
      CF.pop(this.r, t, C.miss - 0.15, undefined, mid(cx, top + this.h2 * 1.5 + gap), 1);
      CF.pop(this.hy, t, C.hyp - 0.05, undefined, 'translate(0,0)');
    },
  };

  // =========================================================================================== owner (the owner runs the shop by the wheel)
  CF.scenes.owner = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'owner');
      this.C = { own: T('เจ้าของร้าน'), ok: T('ไม่เจ๊ง'), bad: T('ไม่แย่') };
      const fig = '<svg width="360" height="420" viewBox="-180 -380 360 420" style="overflow:visible"><g transform="scale(1.15)">' + CF.body('#1D2430') + '<rect x="-34" y="-172" width="68" height="100" rx="10" style="fill:#E5402F"/><path d="M-60 -166 L-90 -120" style="stroke:#1D2430;stroke-width:22;stroke-linecap:round"/></g></svg>';
      const badge = (cls, text, size) => '<div class="card ' + cls + '" style="padding:18px 34px 24px;border-color:var(--d)"><p style="font-weight:700;font-size:' + size + 'px;color:var(--d);white-space:nowrap">' + text + '</p></div>';
      const rules = ['ลองเล็ก', 'วัดด้วยตัวเลข', 'จดผลทุกรอบ'].map((r, i) => '<div class="pill ow-r' + i + '" style="font-size:' + (V ? 42 : 40) + 'px;background:' + ['#245FA6', '#C7791A', '#6B3FA0'][i] + '">' + r + '</div>').join('');
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'ow-tape') + line('ow-l1', 'เจ้าของร้าน', L.mid) + line('ow-l2', 'วนวงล้อทุกเสาร์', L.mid, 'red') + '<div class="lyr ow-fig" style="inset:auto;left:0;top:0">' + fig + '</div>' +
        badge('ow-b1', 'ร้านรอด ✓', V ? 70 : 64) + badge('ow-b2', 'บริการดี ✓', V ? 70 : 64) + rules + wheelHtml('ow-wh', V ? 220 : 200, false));
      Object.assign(this, { l1: q(host, '.ow-l1'), l2: q(host, '.ow-l2'), fig: q(host, '.ow-fig'), b1: q(host, '.ow-b1'), b2: q(host, '.ow-b2'), rs: [0, 1, 2].map((i) => q(host, '.ow-r' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, host = this.l1.parentNode, lh = L.mid * 1.3;
      CF.pop(this.l1, t, C.own - 0.05, undefined, at(L.tx, L.ty)); CF.pop(this.l2, t, C.own + 0.5, undefined, at(L.tx, L.ty + lh));
      const fx = V ? R.x + 200 : R.x + 170, fy = V ? R.y + 520 : R.y + 560;
      const bob = Math.sin(t * 4) * 5 * seg(t, C.ok, C.ok + 0.3);
      CF.pop(this.fig, t, 0.15, undefined, at(fx, fy - 380 + bob), 0);
      CF.pop(this.b1, t, C.ok - 0.05, undefined, mid(V ? R.x + 640 : R.x + 600, V ? R.y + 80 : R.y + 70), -4);
      CF.pop(this.b2, t, C.bad - 0.05, undefined, mid(V ? R.x + 640 : R.x + 600, V ? R.y + 240 : R.y + 230), 3);
      const rx = V ? [R.x + 580, R.x + 520, R.x + 580] : [R.x + 600, R.x + 580, R.x + 600], ry = V ? [R.y + 400, R.y + 500, R.y + 600] : [R.y + 380, R.y + 470, R.y + 560];
      this.rs.forEach((r, i) => CF.pop(r, t, C.bad + 0.7 + i * 0.4, undefined, mid(rx[i], ry[i]), [-3, 2, -2][i]));
      wheelRender(host, 'ow-wh', t, [1, 1, 1, 1], [V ? R.x + 780 : R.x + 760, V ? R.y + 720 : R.y + 640], 80 * t, eob(seg(t, C.own, C.own + 0.5), 1.5) * (V ? 0.9 : 0.85));
    },
  };

  // =========================================================================================== twist (still slow: the problem has many causes)
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'twist');
      this.C = { but: T('แต่แล้ว'), slow: T('ยังช้า'), real: T('ปัญหาจริง'), fish: T('ฟิชโบน', 'ก้างปลา', 'ฟิช') };
      const W = (this.fw = V ? 880 : 850), H = (this.fh = V ? 520 : 460);
      // fish skeleton: spine, head at the right, six bones with a question mark each
      let bones = '<path class="tw-sp" pathLength="100" d="M30 ' + H / 2 + ' H' + (W - 190) + '" style="fill:none;stroke:#1D2430;stroke-width:9;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100"/>';
      const xs = [W * 0.2, W * 0.42, W * 0.64];
      xs.forEach((x, i) => { [-1, 1].forEach((s, j) => { const k = i * 2 + j; bones += '<path class="tw-bn' + k + '" pathLength="100" d="M' + (x + 60) + ' ' + H / 2 + ' L' + x + ' ' + (H / 2 + s * 150) + '" style="fill:none;stroke:#1D2430;stroke-width:7;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100"/>' +
        '<g class="tw-q' + k + '" style="opacity:0"><circle cx="' + x + '" cy="' + (H / 2 + s * 178) + '" r="30" style="fill:#FFC21A;stroke:#1D2430;stroke-width:5"/><text x="' + x + '" y="' + (H / 2 + s * 178 + 14) + '" style="font-size:42px;font-weight:700;fill:#1D2430;text-anchor:middle">?</text></g>'; }); });
      bones += '<g class="tw-hd" style="opacity:0"><rect x="' + (W - 200) + '" y="' + (H / 2 - 60) + '" width="190" height="120" rx="20" style="fill:#E5402F;stroke:#1D2430;stroke-width:6"/><text x="' + (W - 105) + '" y="' + (H / 2 - 4) + '" style="font-size:34px;font-weight:700;fill:#fff;text-anchor:middle">เสาร์</text><text x="' + (W - 105) + '" y="' + (H / 2 + 36) + '" style="font-size:34px;font-weight:700;fill:#fff;text-anchor:middle">ยังช้า</text></g>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'tw-tape') + line('tw-l1', 'แต่แล้ว…', L.mid) + line('tw-l2', 'วันเสาร์ก็ยังช้า!', L.mid, 'red') +
        '<div class="card tw-cal" style="width:' + (V ? 560 : 520) + 'px;padding:26px 36px 32px;text-align:center"><p style="font-weight:700;font-size:44px;color:var(--ink2)">เสาร์ถัดมา</p><p style="font-weight:700;font-size:' + (V ? 70 : 64) + 'px">⏱ ยังรอนาน</p></div>' +
        '<p class="sticker tw-no" style="font-size:' + (V ? 70 : 64) + 'px;background:#F7C6BD">ยังช้า!</p>' +
        '<svg class="art tw-fish" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + bones + '</svg>' +
        line('tw-l3', 'ปัญหาจริงๆ มีอะไรบ้าง?', L.mid * 0.8, 'mute'));
      Object.assign(this, { l1: q(host, '.tw-l1'), l2: q(host, '.tw-l2'), l3: q(host, '.tw-l3'), cal: q(host, '.tw-cal'), no: q(host, '.tw-no'), fish: q(host, '.tw-fish'), sp: q(host, '.tw-sp'), hd: q(host, '.tw-hd'),
        bn: [0, 1, 2, 3, 4, 5].map((i) => q(host, '.tw-bn' + i)), qs: [0, 1, 2, 3, 4, 5].map((i) => q(host, '.tw-q' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, R = L.R, lh = L.mid * 1.3;
      CF.pop(this.l1, t, C.but - 0.05, undefined, at(L.tx, L.ty)); CF.pop(this.l2, t, C.slow - 0.1, undefined, at(L.tx, L.ty + lh));
      CF.pop(this.l3, t, C.real - 0.05, undefined, at(L.tx, L.ty + 2 * lh + 6));
      const calOut = seg(t, C.real + 0.3, C.real + 0.7);
      CF.pop(this.cal, t, 0.2, undefined, mid(V ? R.x + 300 : R.x + 280, V ? R.y + 110 : R.y + 120), -2);
      CF.slam(this.no, t, C.slow, mid(V ? R.x + 560 : R.x + 540, V ? R.y + 150 : R.y + 150), 8, 2.2);
      this.cal.style.opacity = (1 - 0.0 * calOut).toFixed(2);
      // the fish arrives when "ฟิชโบน" is said: spine first, then the bones one by one, then the question marks and the head
      const f0 = C.fish - 0.4;
      CF.pop(this.fish, t, f0, undefined, mid(R.x + R.w / 2, V ? R.y + 520 : R.y + 430), 0);
      this.sp.style.strokeDashoffset = (100 * (1 - eo(seg(t, f0, f0 + 0.5)))).toFixed(1);
      this.bn.forEach((b, i) => { b.style.strokeDashoffset = (100 * (1 - eo(seg(t, f0 + 0.5 + i * 0.12, f0 + 0.8 + i * 0.12)))).toFixed(1); this.qs[i].style.opacity = seg(t, f0 + 0.9 + i * 0.12, f0 + 1.1 + i * 0.12).toFixed(2); });
      this.hd.style.opacity = seg(t, f0 + 0.2, f0 + 0.5).toFixed(2);
    },
  };

  // =========================================================================================== close (next: Fishbone; the site; the credit)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { see: T('ดูวิธี'), name: T('เข็มทิศ'), next: T('ตอนหน้า'), fish: T('ฟิชโบน', 'ฟิช') };
      host.insertAdjacentHTML('beforeend',
        '<p class="stamp cl-pd" style="font-size:' + (V ? 140 : 120) + 'px;color:var(--d);border-color:var(--d)">PDCA</p>' +
        line('cl-r1', 'วนวงล้อ จนปัญหาไม่กลับมา', V ? 54 : 52) +
        '<div class="cl-next" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 780) + 'px;padding:30px 40px 36px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
          '<p style="font-weight:700;font-size:' + (V ? 40 : 36) + 'px;color:var(--main)">ตอนหน้า</p><p class="cl-fb" style="font-weight:700;font-size:' + (V ? 112 : 100) + 'px;line-height:1.05">Fishbone ▶</p>' +
          '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;line-height:1.35">แตกปัญหาเป็นก้าง<br>คน · วิธี · เครื่องมือ · วัตถุดิบ · สภาพแวดล้อม · การวัด</p></div>' +
        line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 88 : 80) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t mute cl-url" style="font-size:' + (V ? 34 : 32) + 'px">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t mute cl-org" style="font-size:' + (V ? 28 : 26) + 'px;font-weight:600">แนวคิดจาก: Quality Management · Walter Shewhart / W. Edwards Deming</p>' +
        '<p class="t mute cl-ai" style="font-size:' + (V ? 26 : 24) + 'px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      Object.assign(this, { pd: q(host, '.cl-pd'), r1: q(host, '.cl-r1'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      const P = V ? { pd: [80, 330], r1: [80, 520], next: [520, 960], see: [80, 1240], name: [80, 1316], url: [80, 1424], org: [80, 1472], ai: [80, 1512] }
                  : { pd: [110, 150], r1: [110, 340], next: [1370, 330], see: [110, 560], name: [110, 650], url: [110, 790], org: [110, 850], ai: [110, 960] };
      CF.slam(this.pd, t, 0.15, at(P.pd[0], P.pd[1]), -4, 1.6);
      CF.pop(this.r1, t, 0.5, undefined, at(P.r1[0], P.r1[1]));
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(P.next[0], P.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.fish) * 8) * Math.exp(-Math.max(0, t - C.fish) * 3);
      this.next.style.transform += ' scale(' + wob.toFixed(3) + ')';
      CF.pop(this.see, t, C.see, undefined, at(P.see[0], P.see[1]));
      CF.pop(this.name, t, C.name, undefined, at(P.name[0], P.name[1]), -2);
      CF.pop(this.url, t, C.name + 0.4, undefined, at(P.url[0], P.url[1]));
      CF.pop(this.org, t, C.name + 0.6, undefined, at(P.org[0], P.org[1]));
      CF.pop(this.ai, t, C.name + 0.8, undefined, at(P.ai[0], P.ai[1]));
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
