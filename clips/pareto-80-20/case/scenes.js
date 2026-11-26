/* Pareto 80/20, episode 4 of the restaurant series: one scene module per id, drawn from scene-local time only.
   Same bright planning-room look as the PDCA and Fishbone episodes; helpers (pop, slam, tape, silhouettes) come from cf.js.
   The Pareto chart is one SVG per scene built by chartBuild/chartRender, so steps 2-3 and the twist look like the
   same drawing growing. Numbers are the owner's script: 1,000 minutes lost in a month, 8 problems, the top 3 = 80%.
   Cues (T('คำ')) are words in the spoken line. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;

  const LAY = (W, H) => {
    const V = H > W;
    return V
      ? { V, W, H, tx: 80, tapeY: 262, ty: 372, mid: 72, CH: { x: 70, y: 800, w: 890, h: 620 }, R: { x: 80, y: 700, w: 880, h: 760 } }
      : { V, W, H, tx: 110, tapeY: 120, ty: 250, mid: 80, CH: { x: 860, y: 250, w: 980, h: 700 }, R: { x: 960, y: 300, w: 850, h: 660 } };
  };
  const at = (x, y, extra) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (extra || '');
  const mid = (x, y, extra) => at(x, y) + ' translate(-50%,-50%)' + (extra || '');
  const q = (host, c) => host.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const stepHead = (L, cls, n, en, th) =>
    '<p class="t ' + cls + '" style="font-size:' + (L.V ? 92 : 96) + 'px"><i style="display:inline-block;font-style:normal;min-width:1.15em;text-align:center;margin-right:.22em;padding:0 .1em .08em;border-radius:.22em;background:var(--main);color:#fff;font-size:.82em">' + n + '</i>' + en + '</p>' +
    '<p class="t mute ' + cls + '-th" style="font-size:' + (L.V ? 60 : 56) + 'px;color:var(--main)">' + th + '</p>';
  // fade an element in at a and out at b (b optional), keeping a placing transform
  const fade = (el, t, a, b, base) => {
    let o = clamp01((t - a) / 0.3);
    if (b !== undefined) o *= 1 - clamp01((t - b) / 0.3);
    el.style.opacity = o.toFixed(3);
    if (base !== undefined) el.style.transform = base;
  };
  const wheelSvg = (size) => {
    let s = '';
    const R = size * 0.46, r = size * 0.2, c = size / 2;
    ['#245FA6', '#2B7A4B', '#C7791A', '#6B3FA0'].forEach((col, i) => {
      const a0 = (-135 + 90 * i + 2) * Math.PI / 180, a1 = (-45 + 90 * i - 2) * Math.PI / 180, am = (a0 + a1) / 2;
      s += '<path d="M' + (c + R * Math.cos(a0)) + ' ' + (c + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 0 1 ' + (c + R * Math.cos(a1)) + ' ' + (c + R * Math.sin(a1)) +
        ' L' + (c + r * Math.cos(a1)) + ' ' + (c + r * Math.sin(a1)) + ' A' + r + ' ' + r + ' 0 0 0 ' + (c + r * Math.cos(a0)) + ' ' + (c + r * Math.sin(a0)) + ' Z" style="fill:' + col + '"/>' +
        '<text x="' + (c + (R + r) / 2 * Math.cos(am)) + '" y="' + (c + (R + r) / 2 * Math.sin(am) + size * 0.06) + '" style="font-size:' + (size * 0.17) + 'px;font-weight:700;fill:#fff;text-anchor:middle">' + 'PDCA'[i] + '</text>';
    });
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible">' + s + '</svg>';
  };

  // ----------------------------------------------------------------------------------------- the Pareto chart
  // minutes lost in a month, sorted; the first three are the ones the script names
  const DATA = [['วัตถุดิบ', 380], ['เตา', 250], ['สั่งผิด', 170], ['จาน', 80], ['ยกเสิร์ฟ', 60], ['เมนู', 30], ['หน้าร้าน', 20], ['อื่นๆ', 10]];
  const TOTAL = 1000;
  const chartGeo = (L) => {
    const V = L.V, c = L.CH, n = DATA.length, ax = V ? 74 : 84, gap = V ? 14 : 18, bw = (c.w - ax - 70 - gap * (n - 1)) / n;
    const top = 70, base = c.h - (V ? 70 : 80), y = (p) => base - (base - top) * p;
    const xs = DATA.map((_, i) => ax + i * (bw + gap));
    let cum = 0;
    const pts = DATA.map(([, v], i) => { cum += v; return [xs[i] + bw / 2, y(cum / TOTAL), Math.round(cum / TOTAL * 100)]; });
    return { V, c, n, ax, gap, bw, top, base, y, xs, pts, lf: V ? 26 : 28, vf: V ? 28 : 30 };
  };
  const chartBuild = (L, cls) => {
    const g = chartGeo(L); let s = '';
    [0, 0.5, 1].forEach((p) => {
      s += '<line x1="' + g.ax + '" y1="' + g.y(p) + '" x2="' + (g.c.w - 60) + '" y2="' + g.y(p) + '" style="stroke:#D9D2C4;stroke-width:3"/>' +
        '<text x="' + (g.ax - 14) + '" y="' + (g.y(p) + 10) + '" style="font-size:' + (g.V ? 24 : 26) + 'px;font-weight:600;fill:#5A6270;text-anchor:end">' + Math.round(p * 100) + '%</text>';
    });
    s += '<line x1="' + g.ax + '" y1="' + g.base + '" x2="' + (g.c.w - 60) + '" y2="' + g.base + '" style="stroke:#1D2430;stroke-width:5"/>';
    // the 80% line and the box round the first three bars
    s += '<g class="' + cls + '-l80" style="opacity:0"><line x1="' + g.ax + '" y1="' + g.y(0.8) + '" x2="' + (g.c.w - 60) + '" y2="' + g.y(0.8) + '" style="stroke:#E5402F;stroke-width:5;stroke-dasharray:16 12"/>' +
      '<text x="' + (g.c.w - 56) + '" y="' + (g.y(0.8) - 14) + '" style="font-size:' + (g.V ? 34 : 36) + 'px;font-weight:700;fill:#E5402F;text-anchor:end">80%</text></g>';
    const bx = g.xs[0] - 14, bxw = g.xs[2] + g.bw - g.xs[0] + 28, by = g.y(0.42) - 20;
    s += '<rect class="' + cls + '-box" x="' + bx + '" y="' + by + '" width="' + bxw + '" height="' + (g.base - by + 12) + '" rx="18" style="fill:none;stroke:#E5402F;stroke-width:9;opacity:0"/>';
    DATA.forEach(([lab, v], i) => {
      const x = g.xs[i], cx = x + g.bw / 2;
      s += '<rect class="' + cls + '-b' + i + '" x="' + x + '" y="' + g.base + '" width="' + g.bw + '" height="0" rx="6" style="fill:' + (i < 3 ? '#E5402F' : '#B9AFA2') + '"/>';
      s += '<text class="' + cls + '-m' + i + '" x="' + cx + '" y="' + (g.y(v / TOTAL) - 12) + '" style="font-size:' + g.vf + 'px;font-weight:700;fill:#1D2430;text-anchor:middle;opacity:0">' + v + '</text>';
      s += '<text class="' + cls + '-p' + i + '" x="' + cx + '" y="' + (g.y(v / TOTAL) - 12) + '" style="font-size:' + g.vf + 'px;font-weight:700;fill:#1D2430;text-anchor:middle;opacity:0">' + Math.round(v / TOTAL * 100) + '%</text>';
      s += '<text class="' + cls + '-lb' + i + '" x="' + cx + '" y="' + (g.base + g.lf + 14) + '" style="font-size:' + g.lf + 'px;font-weight:700;fill:#1D2430;text-anchor:middle;opacity:0">' + lab + '</text>';
    });
    // cumulative line through the bar centres, dots and the first three running totals
    s += '<polyline class="' + cls + '-cum" pathLength="100" points="' + g.pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" style="fill:none;stroke:#1D2430;stroke-width:6;stroke-linejoin:round;stroke-dasharray:100;stroke-dashoffset:100"/>';
    g.pts.forEach((p, i) => {
      s += '<circle class="' + cls + '-d' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i < 3 ? 13 : 9) + '" style="fill:' + (i < 3 ? '#FFC21A' : '#1D2430') + ';stroke:#1D2430;stroke-width:5;opacity:0"/>';
      const bw2 = g.V ? 104 : 116, bh2 = g.V ? 50 : 56, bx2 = i === 0 ? p[0] - bw2 - 22 : p[0] - bw2 / 2, by2 = i === 0 ? p[1] - bh2 / 2 - 40 : p[1] - bh2 - 22;
      if (i < 3) s += '<g class="' + cls + '-cv' + i + '" style="opacity:0"><rect x="' + bx2 + '" y="' + by2 + '" width="' + bw2 + '" height="' + bh2 + '" rx="12" style="fill:#1D2430"/>' +
        '<text x="' + (bx2 + bw2 / 2) + '" y="' + (by2 + bh2 * 0.74) + '" style="font-size:' + (g.V ? 32 : 36) + 'px;font-weight:700;fill:#fff;text-anchor:middle">' + p[2] + '%</text></g>';
    });
    return '<svg class="art ' + cls + '-svg" width="' + g.c.w + '" height="' + g.c.h + '" viewBox="0 0 ' + g.c.w + ' ' + g.c.h + '" style="overflow:visible">' + s + '</svg>';
  };
  // spec: {rise:[t0 x8], mins:t (minute labels on), pct:t (percent labels replace minutes), cum:[t0 x8] (line reaches point i),
  //        l80:t, dim:t (bars 4-8 fade), box:t, dy}
  const chartRender = (host, cls, L, t, sp) => {
    const g = chartGeo(L), svg = q(host, '.' + cls + '-svg');
    svg.style.transform = at(g.c.x, g.c.y + (sp.dy || 0));
    const dimP = sp.dim === undefined ? 0 : seg(t, sp.dim, sp.dim + 0.45);
    DATA.forEach(([, v], i) => {
      const t0 = (sp.rise || [])[i], b = q(host, '.' + cls + '-b' + i), m = q(host, '.' + cls + '-m' + i), p = q(host, '.' + cls + '-p' + i), lb = q(host, '.' + cls + '-lb' + i);
      const k = t0 === undefined ? 0 : eob(seg(t, t0, t0 + 0.45), 1.4), hgt = (g.base - g.y(v / TOTAL)) * k;
      b.setAttribute('y', (g.base - hgt).toFixed(1)); b.setAttribute('height', Math.max(0, hgt).toFixed(1));
      const dim = i >= 3 ? 1 - 0.7 * dimP : 1;
      b.style.opacity = dim.toFixed(2);
      const shown = t0 === undefined ? 0 : seg(t, t0 + 0.2, t0 + 0.45);
      const toPct = sp.pct === undefined ? 0 : seg(t, sp.pct, sp.pct + 0.35);
      m.style.opacity = (shown * (1 - toPct) * dim).toFixed(2);
      // the first running total equals the first bar, so its badge takes over that bar's own label
      const c0 = (sp.cum || [])[0], cover = i === 0 && c0 !== undefined ? seg(t, c0 + 0.25, c0 + 0.4) : 0;
      p.style.opacity = (shown * toPct * dim * (1 - cover)).toFixed(2);
      lb.style.opacity = (shown * dim).toFixed(2);
    });
    const cum = sp.cum || [], cl = q(host, '.' + cls + '-cum');
    // the line grows from point to point: fraction of its length up to point i ≈ i / 7
    let reach = -1;
    cum.forEach((c0, i) => { if (t >= c0) reach = Math.max(reach, i - 1 + seg(t, c0, c0 + 0.35)); });
    cl.style.strokeDashoffset = (100 * (1 - clamp01(reach / (DATA.length - 1)))).toFixed(1);
    cl.style.opacity = cum.length && t >= cum[0] ? 1 : 0;
    g.pts.forEach((_, i) => {
      const c0 = cum[i], d = q(host, '.' + cls + '-d' + i), cv = q(host, '.' + cls + '-cv' + i);
      const o = c0 === undefined ? 0 : seg(t, c0 + 0.25, c0 + 0.4);
      d.style.opacity = o.toFixed(2);
      if (cv) { const pp = c0 === undefined ? 0 : eob(seg(t, c0 + 0.25, c0 + 0.6), 1.6); cv.style.opacity = clamp01(pp * 3).toFixed(2); }
    });
    q(host, '.' + cls + '-l80').style.opacity = sp.l80 === undefined ? 0 : seg(t, sp.l80, sp.l80 + 0.3).toFixed(2);
    q(host, '.' + cls + '-box').style.opacity = sp.box === undefined ? 0 : seg(t, sp.box, sp.box + 0.25).toFixed(2);
  };
  const FULL = { rise: DATA.map(() => -1), cum: DATA.map(() => -1) };

  // =========================================================================================== 1 hook
  const NOTES = [['เตา', 'ไม่พอ'], ['วัตถุดิบ', 'ไม่ทัน'], ['ออร์เดอร์', 'ผิด'], ['รอจาน', 'สะอาด'], ['คนยก', 'เสิร์ฟ'], ['เมนูพิเศษ', 'ทำนาน'], ['หน้าร้าน', 'แน่น'], ['อื่น ๆ', '']];
  const NOTE_COL = ['#FFE680', '#BFE5CC', '#BFD6F2', '#F7C6BD', '#FFE680', '#BFD6F2', '#BFE5CC', '#F7C6BD'];
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'hook');
      this.C = { good: 0.25, cust: T('ลูกค้า'), own: T('เจ้าของร้าน'), meet: T('ประชุม'), stove: T('เตา'), mat: T('วัตถุดิบ'), ord: T('ออร์เดอร์'),
                 eight: T('แปดเรื่อง', 'แปด'), head: T('กุมขมับ', 'กุม'), money: T('เงิน'), time: T('เวลา'), ppl: T('คนที่ไหน', 'คน'), all: T('ทั้งหมด') };
      const nw = V ? 200 : 190, nh = V ? 130 : 124;
      let notes = '';
      NOTES.forEach((n, i) => {
        notes += '<div class="note hk-n' + i + '" style="width:' + nw + 'px;height:' + nh + 'px;background:' + NOTE_COL[i] + ';display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:' + (V ? 36 : 34) + 'px;text-align:center;padding:10px">' + n[0] + (n[1] ? '<br>' + n[1] : '') + '</div>';
      });
      const owner = '<svg class="art hk-own" width="360" height="380" viewBox="-180 -360 360 380" style="overflow:visible">' + CF.body('var(--ink)', '<path d="M-58 -150 Q-120 -210 -40 -238 M58 -150 Q120 -210 40 -238" style="fill:none;stroke:var(--ink);stroke-width:22;stroke-linecap:round"/>') + '</svg>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        line('hk-l1', 'ร้านกลับมาดีแล้ว!', V ? 92 : 96) + line('hk-l2', 'แต่เจ้าของยังอยาก<br>ให้เร็วกว่านี้อีก', V ? 56 : 54, 'mute') +
        '<div class="card hk-timer" style="width:' + (V ? 620 : 560) + 'px;padding:30px 36px 36px"><p style="font-weight:700;font-size:' + (V ? 36 : 34) + 'px;color:var(--ink2)">เวลารออาหาร วันเสาร์</p>' +
          '<p style="font-weight:700;font-size:' + (V ? 92 : 88) + 'px;line-height:1.1">≤ 20 นาที <span style="color:var(--d)">✓</span></p><p style="font-weight:700;font-size:' + (V ? 34 : 32) + 'px;color:var(--d)">ถึงเป้าแล้ว</p></div>' +
        line('hk-m1', 'ประชุมทีม… ปัญหาเพียบ!', V ? 76 : 80) +
        notes + '<p class="sticker hk-8" style="font-size:' + (V ? 84 : 80) + 'px">8 เรื่อง!</p>' + owner +
        '<p class="pill hk-p0" style="font-size:' + (V ? 44 : 42) + 'px">เงิน?</p><p class="pill hk-p1" style="font-size:' + (V ? 44 : 42) + 'px">เวลา?</p><p class="pill hk-p2" style="font-size:' + (V ? 44 : 42) + 'px">คน?</p>' +
        line('hk-q', 'จะแก้หมดไหวเหรอ?!', V ? 84 : 88, 'red'));
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), timer: q(host, '.hk-timer'), m1: q(host, '.hk-m1'),
        ns: NOTES.map((_, i) => q(host, '.hk-n' + i)), e8: q(host, '.hk-8'), own: q(host, '.hk-own'), ps: [0, 1, 2].map((i) => q(host, '.hk-p' + i)), qq: q(host, '.hk-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      const out = C.meet - 0.1;
      CF.pop(this.l1, t, C.good, out, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.own - 0.1, out, at(L.tx, L.ty + (V ? 140 : 150)));
      CF.pop(this.timer, t, C.cust - 0.1, out, V ? mid(540, 1050) : mid(1380, 560), -2);
      CF.pop(this.m1, t, C.meet, C.all - 0.15, at(L.tx, L.ty));
      // the eight notes: the three named on their word, the rest in a quick burst before "แปดเรื่อง"
      const named = [C.stove, C.mat, C.ord];
      const rest = [3, 4, 5, 6, 7].map((k, j) => lerp(C.ord + 0.35, Math.max(C.ord + 0.5, C.eight - 0.15), j / 4));
      const t0s = named.concat(rest);
      const cols = 4, gx = V ? 225 : 215, gy = V ? 160 : 150;
      const ox = V ? 540 - 1.5 * gx : 1350 - 1.5 * gx, oy = V ? 820 : 450;
      const shrink = seg(t, C.head - 0.1, C.head + 0.5);
      this.ns.forEach((n, i) => {
        const x = ox + (i % cols) * gx, y = oy + Math.floor(i / cols) * gy + CF.shake(t, C.head, 6) * (i % 2 ? 1 : -1);
        const sx = V ? x : lerp(x, x + 40, shrink), sy = V ? lerp(y, y - 60, shrink) : y;
        CF.pop(n, t, t0s[i], undefined, mid(sx, sy), [-4, 3, -2, 4, -3, 2, -4, 3][i]);
      });
      CF.slam(this.e8, t, C.eight, V ? mid(780, 1170 - 60 * shrink) : mid(1660, 790), -6, 2.2);
      // the owner holds his head; money / time / people pop round him; the big question
      const ox2 = V ? 260 : 330, oy2 = V ? 1480 : 1000;
      CF.pop(this.own, t, C.head - 0.15, undefined, at(ox2 - 180, oy2 - 360, ' rotate(' + CF.shake(t, C.head, 3).toFixed(2) + 'deg)'));
      const pp = V ? [[560, 1290], [740, 1380], [900, 1290]] : [[560, 660], [610, 770], [560, 880]];
      [C.money, C.time, C.ppl].forEach((c0, k) => CF.pop(this.ps[k], t, c0, undefined, mid(pp[k][0], pp[k][1]), [-6, 4, -3][k]));
      CF.slam(this.qq, t, C.all, at(L.tx, L.ty + (V ? 0 : 0)), -2, 1.6);
      this.m1.style.opacity = Math.min(+this.m1.style.opacity, 1 - seg(t, C.all - 0.1, C.all)).toFixed(2);
    },
  };

  // =========================================================================================== 2 recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'recap');
      this.C = { fish: T('ฟิชโบน', 'fishbone'), find: T('ค้นหาสาเหตุ', 'สาเหตุ'), know: T('การรู้', 'รู้ว่า'), not: T('ไม่ได้แปลว่า', 'แปลว่า'), all: T('ทุกเรื่อง'), which: T('เรื่องไหน'), first: T('ควรแก้ก่อน', 'ก่อน') };
      const fw = V ? 520 : 520, fh = V ? 300 : 300;
      let fish = '<path d="M30 ' + fh / 2 + ' H' + (fw - 120) + '" style="stroke:#1D2430;stroke-width:9;stroke-linecap:round"/>';
      [0.18, 0.4, 0.62].forEach((f) => { const x = fw * f; fish += '<path d="M' + x + ' 40 L' + (x + 60) + ' ' + fh / 2 + ' M' + x + ' ' + (fh - 40) + ' L' + (x + 60) + ' ' + fh / 2 + '" style="stroke:#1D2430;stroke-width:7;stroke-linecap:round"/>'; });
      fish += '<path d="M' + (fw - 126) + ' ' + (fh / 2 - 56) + ' H' + (fw - 10) + ' V' + (fh / 2 + 56) + ' H' + (fw - 126) + ' Q' + (fw - 160) + ' ' + fh / 2 + ' ' + (fw - 126) + ' ' + (fh / 2 - 56) + ' Z" style="fill:#E5402F;stroke:#1D2430;stroke-width:6"/>';
      [[0.1, 0.12], [0.33, 0.12], [0.55, 0.12], [0.1, 0.8], [0.33, 0.8], [0.55, 0.8]].forEach(([a, b]) => { fish += '<rect x="' + (fw * a) + '" y="' + (fh * b - 18) + '" width="70" height="40" style="fill:#FFE680;stroke:#1D2430;stroke-width:3"/>'; });
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        '<div class="card rc-card" style="width:' + (fw + 80) + 'px;padding:30px 40px 34px;display:flex;flex-direction:column;align-items:center;gap:14px"><svg width="' + fw + '" height="' + fh + '" viewBox="0 0 ' + fw + ' ' + fh + '">' + fish + '</svg>' +
          '<p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px">Fishbone: เห็นสาเหตุครบ</p></div>' +
        line('rc-l1', 'รู้ว่ามีปัญหาอะไรบ้าง', V ? 66 : 64) +
        '<p class="t rc-l2" style="font-size:' + (V ? 66 : 64) + 'px">≠ ต้องแก้<span style="color:var(--main)">ทุกเรื่อง</span>พร้อมกัน</p>' +
        '<p class="sticker rc-q" style="font-size:' + (V ? 80 : 76) + 'px">เรื่องไหนควรแก้ก่อน?</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), card: q(host, '.rc-card'), l1: q(host, '.rc-l1'), l2: q(host, '.rc-l2'), qq: q(host, '.rc-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.card, t, C.fish - 0.15, undefined, V ? mid(540, 640) : mid(560, 600), -2);
      CF.pop(this.l1, t, C.know - 0.1, undefined, V ? at(L.tx, 940) : at(1000, 400));
      CF.pop(this.l2, t, C.not, undefined, V ? at(L.tx, 1040) : at(1000, 500));
      CF.slam(this.qq, t, C.which - 0.1, V ? mid(540, 1300) : mid(1400, 760), -4, 2.0);
    },
  };

  // =========================================================================================== 3 idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'idea');
      this.C = { name: T('พาเรโต้', 'พาเรโต', 'pareto'), rule: T('แปดสิบ', 'กฎ'), most: T('ผลกระทบส่วนใหญ่', 'ผลกระทบ'), few: T('ไม่กี่อย่าง', 'ปัจจัย'),
                 found: T('หาเจอ'), res: T('ทรัพยากร'), first: T('เรื่องไหนก่อน', 'ก่อน') };
      const bw = V ? 860 : 900, bh = V ? 110 : 110;
      const bar = (cls, red, label, redLab, greyLab) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + bw + 'px">' +
        '<p style="font-weight:700;font-size:' + (V ? 38 : 36) + 'px;color:var(--ink2);margin-bottom:8px">' + label + '</p>' +
        '<div style="display:flex;height:' + bh + 'px;border:6px solid var(--ink);border-radius:16px;overflow:hidden;font-weight:700;font-size:' + (V ? 40 : 40) + 'px">' +
        (red === 'left' ? '<div style="width:20%;background:var(--main);color:#fff;display:flex;align-items:center;justify-content:center">' + redLab + '</div><div style="flex:1;background:#D9D2C4;display:flex;align-items:center;justify-content:center">' + greyLab + '</div>'
                        : '<div style="width:80%;background:var(--main);color:#fff;display:flex;align-items:center;justify-content:center">' + redLab + '</div><div style="flex:1;background:#D9D2C4;display:flex;align-items:center;justify-content:center">' + greyLab + '</div>') +
        '</div></div>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') +
        '<p class="t id-name" style="font-size:' + (V ? 120 : 130) + 'px;color:var(--main)">Pareto 80/20</p>' +
        line('id-sub', 'กฎแปดสิบยี่สิบ', V ? 60 : 58, 'mute') +
        bar('id-b1', 'left', 'ปัจจัยไม่กี่อย่าง…', '20%', '') + bar('id-b2', 'right', '…สร้างผลกระทบส่วนใหญ่', '80%', '') +
        line('id-res', 'รู้ว่าควรลงแรงกับเรื่องไหนก่อน', V ? 54 : 56) );
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), sub: q(host, '.id-sub'), b1: q(host, '.id-b1'), b2: q(host, '.id-b2'), res: q(host, '.id-res') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name, at(L.tx, V ? L.ty : L.ty - 10), -2, 1.8);
      CF.pop(this.sub, t, C.rule, undefined, at(L.tx, (V ? L.ty : L.ty - 10) + (V ? 165 : 175)));
      const bx = V ? 110 : 110, y1 = V ? 820 : 560, y2 = V ? 1060 : 760;
      CF.pop(this.b1, t, C.few - 0.4, undefined, at(bx, y1));
      CF.pop(this.b2, t, C.few + 0.2, undefined, at(bx, y2));
      CF.pop(this.res, t, C.res - 0.2, undefined, V ? at(L.tx, 1330) : at(L.tx, 960));
    },
  };

  // generic step scene: heading at the left (top on a phone) and the chart
  const stepScene = (id, n, en, th, o) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), T = CF.heard(api, id); this.T = T; this.id = id; this.host = host;
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + (n ? stepHead(L, id + '-h', n, en, th) : '') + (o.chart ? chartBuild(L, id + '-c') : '') + (o.extra ? o.extra(L, id) : ''));
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), h: q(host, '.' + id + '-h'), th: q(host, '.' + id + '-h-th') });
      this.C = o.cues(T); if (o.init) o.init.call(this, host, L, T);
    },
    render(t) {
      const L = this.L, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      if (this.h) { CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 120 : 128))); }
      if (o.chart) chartRender(this.host, this.id + '-c', L, t, o.spec(this.C, t));
      if (o.after) o.after.call(this, t, L);
    },
  });

  // =========================================================================================== 4 collect
  const LOG = [['เตาเต็ม', 12], ['ของหมด', 15], ['สั่งผิด', 9], ['รอจาน', 6], ['ของหมด', 11]];
  CF.scenes.collect = stepScene('collect', '1', 'Collect', 'เก็บข้อมูลจริง', {
    cues: (T) => ({ note: T('จด'), what: T('เรื่องอะไร'), min: T('กี่นาที'), month: T('หนึ่งเดือน', 'เดือน'), sum: T('รวมกัน'), k: T('หนึ่งพันนาที', 'หนึ่งพัน', 'พัน') }),
    extra: (L) => {
      const V = L.V, w = V ? 860 : 700;
      let rows = '';
      LOG.forEach(([a, m], i) => { rows += '<div class="cl-r' + i + '" style="display:flex;justify-content:space-between;font-weight:700;font-size:' + (V ? 44 : 44) + 'px;border-bottom:4px dashed #D9D2C4;padding:10px 4px">' + '<span>อาหารช้า · ' + a + '</span><span style="color:var(--main)">' + m + ' นาที</span></div>'; });
      return '<div class="card cl-log" style="width:' + w + 'px;padding:30px 40px 30px"><p style="font-weight:700;font-size:' + (V ? 38 : 36) + 'px;color:var(--ink2)">สมุดจดเวลาที่เสียไป</p>' + rows + '<p style="font-weight:700;font-size:40px;color:var(--ink2);padding-top:6px">…</p></div>' +
        '<p class="pill cl-month" style="font-size:' + (V ? 46 : 44) + 'px">ครบ 1 เดือน</p>' +
        '<p class="sticker cl-sum" style="font-size:' + (V ? 96 : 104) + 'px"><span class="cl-num">0</span> นาที!</p>';
    },
    init(host) { this.log = q(host, '.cl-log'); this.rows = LOG.map((_, i) => q(host, '.cl-r' + i)); this.month = q(host, '.cl-month'); this.sum = q(host, '.cl-sum'); this.num = q(host, '.cl-num'); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.log, t, C.note - 0.2, undefined, V ? mid(540, 900) : mid(1340, 520), -1.5);
      this.rows.forEach((r, i) => { const t0 = lerp(C.note, Math.max(C.note + 0.6, C.min + 0.4), i / (LOG.length - 1)); r.style.opacity = seg(t, t0, t0 + 0.2).toFixed(2); });
      CF.pop(this.month, t, C.month - 0.1, undefined, V ? mid(540, 1290) : mid(L.tx + 220, 640), -3);
      CF.slam(this.sum, t, C.sum, V ? mid(540, 1420) : mid(L.tx + 330, 830), -4, 1.8);
      const n = Math.round(1000 * eo(seg(t, C.sum, C.k + 0.3)));
      this.num.textContent = n.toLocaleString('en-US');
    },
  });

  // =========================================================================================== 5 sort
  const SAY = [['เตรียมวัตถุดิบไม่ทัน', 380], ['รอใช้เตาปรุงอาหาร', 250], ['ออร์เดอร์ผิด ต้องทำใหม่', 170], ['อีก 5 เรื่องรวมกัน', 200]];
  CF.scenes.sort = stepScene('sort', '2', 'Sort', 'เรียงจากมากไปน้อย', {
    chart: true,
    cues: (T) => ({ a: T('เตรียมวัตถุดิบ', 'วัตถุดิบ'), b: T('รอใช้เตา', 'เตา'), c: T('ออร์เดอร์'), d: T('ห้าเรื่อง', 'ที่เหลือ'), e: T('สองร้อยนาที', 'แค่') }),
    extra: (L) => SAY.map(([s, m], i) => '<p class="t sort-s' + i + '" style="font-size:' + (L.V ? 46 : 48) + 'px">' + s + ' <span style="color:var(--main)">' + m + ' นาที</span></p>').join(''),
    init(host) { this.say = SAY.map((_, i) => q(host, '.sort-s' + i)); },
    spec: (C) => ({ rise: [C.a, C.b, C.c].concat([0, 1, 2, 3, 4].map((k) => C.d + 0.1 + k * 0.18)) }),
    after(t, L) {
      const C = this.C, V = L.V, ts = [C.a, C.b, C.c, C.d], y = V ? L.ty + 230 : L.ty + 260;
      this.say.forEach((el, i) => {
        if (V) CF.pop(el, t, ts[i] - 0.1, i < 3 ? ts[i + 1] - 0.15 : undefined, at(L.tx, y));
        else CF.pop(el, t, ts[i] - 0.1, undefined, at(L.tx, y + i * 90));
      });
    },
  });

  // =========================================================================================== 6 chart (cumulative %)
  CF.scenes.chart = stepScene('chart', '3', 'Chart', 'เปอร์เซ็นต์สะสม', {
    chart: true,
    cues: (T) => ({ pct: T('เปอร์เซ็นต์'), bar: T('กราฟแท่ง', 'กราฟ'), add: T('ค่อย', 'บวก'), line: T('เส้นเปอร์เซ็นต์สะสม', 'สะสม'), p1: T('เรื่องแรก'), p2: T('หกสิบสาม', 'เรื่องที่สอง'), p3: T('แปดสิบเปอร์เซ็นต์พอดี', 'พอดี') }),
    extra: (L) => '<p class="sticker chart-80" style="font-size:' + (L.V ? 78 : 96) + 'px">80% พอดี!</p>',
    init(host) { this.s80 = q(host, '.chart-80'); },
    spec: (C) => ({ rise: DATA.map(() => -1), pct: C.pct, cum: [C.p1, C.p2, C.p3 - 0.1, C.p3 + 0.6, C.p3 + 0.75, C.p3 + 0.9, C.p3 + 1.05, C.p3 + 1.2], l80: C.p3 }),
    after(t, L) { CF.slam(this.s80, t, this.C.p3 + 0.05, L.V ? mid(700, 680) : mid(L.tx + 330, 700), -5, 2.2); },
  });

  // =========================================================================================== 7 twist
  CF.scenes.twist = stepScene('twist', null, null, null, {
    chart: true,
    cues: (T) => ({ wait: 0.1, all8: T('ทั้งแปดเรื่อง', 'แปดเรื่อง'), three: T('แค่สามเรื่อง', 'สามเรื่อง'), k800: T('แปดร้อย'), spread: T('กระจาย'), start: T('เริ่มจาก', 'สามเรื่องนี้'), why: T('ประโยชน์'), name: T('พาเรโต้', 'พาเรโต') }),
    extra: (L) => line('tw-h', 'เดี๋ยวนะ!', L.V ? 110 : 120, 'red') +
      '<p class="sticker tw-800" style="font-size:' + (L.V ? 64 : 64) + 'px">3 จาก 8 เรื่อง = 800 นาที!</p>' +
      '<p class="t tw-no" style="font-size:' + (L.V ? 50 : 52) + 'px"><span style="color:var(--main)">✗</span> กระจายแรงแก้ทั้ง 8 เรื่อง</p>' +
      '<p class="t tw-yes" style="font-size:' + (L.V ? 50 : 52) + 'px"><span style="color:var(--d)">✓</span> เริ่มจาก 3 เรื่องนี้ก่อน</p>' +
      '<p class="stamp green tw-st" style="font-size:' + (L.V ? 70 : 72) + 'px">ประโยชน์ของ Pareto!</p>',
    init(host) { Object.assign(this, { hh: q(host, '.tw-h'), s8: q(host, '.tw-800'), no: q(host, '.tw-no'), yes: q(host, '.tw-yes'), st: q(host, '.tw-st') }); },
    spec: (C) => ({ ...FULL, pct: -1, l80: -1, dim: C.three - 0.2, box: C.three }),
    after(t, L) {
      const C = this.C, V = L.V;
      CF.slam(this.hh, t, C.wait, at(L.tx, L.ty - 20), -3, 1.8);
      if (V) {
        CF.slam(this.s8, t, C.k800, mid(540, 640), -3, 1.8);
        if (t > C.spread - 0.1) this.s8.style.opacity = (1 - seg(t, C.spread - 0.1, C.spread + 0.15)).toFixed(2);
        CF.pop(this.no, t, C.spread, C.why - 0.2, at(L.tx, 560)); CF.pop(this.yes, t, C.start, C.why - 0.2, at(L.tx, 650));
      } else {
        CF.slam(this.s8, t, C.k800, mid(L.tx + 380, 500), -3, 1.8);
        CF.pop(this.no, t, C.spread, undefined, at(L.tx, 640)); CF.pop(this.yes, t, C.start, undefined, at(L.tx, 730));
      }
      CF.slam(this.st, t, C.why, V ? mid(540, 640) : mid(L.tx + 370, 900), -6, 2.0);
    },
  });

  // =========================================================================================== 8 action
  const FIX = [['เตรียมวัตถุดิบไม่ทัน', 'ปรับวิธีเตรียมวัตถุดิบ'], ['รอใช้เตา', 'จัดลำดับการใช้เตา'], ['ออร์เดอร์ผิด', 'ปรับขั้นตอนตรวจสอบออร์เดอร์']];
  CF.scenes.action = stepScene('action', null, null, null, {
    cues: (T) => ({ root: T('สาเหตุที่แท้จริง', 'แท้จริง'), pdca: T('พีดีซีเอ', 'pdca'), f0: T('ปรับวิธี', 'เตรียมวัตถุดิบ'), f1: T('จัดลำดับ'), f2: T('ตรวจสอบ', 'ขั้นตอน'), again: T('อีกครั้ง', 'เก็บข้อมูล'), real: T('ลดลงจริง', 'ลดลง') }),
    extra: (L) => {
      const V = L.V, cw = V ? 900 : 880;
      let s = line('ac-h', 'ลงแรงกับ 3 เรื่องนี้ก่อน', V ? 70 : 76) +
        '<p class="pill ac-root" style="font-size:' + (V ? 42 : 40) + 'px">หาสาเหตุที่แท้จริง (5 Whys)</p>' +
        '<div class="ac-wh" style="position:absolute;left:0;top:0;transform-origin:50% 50%">' + wheelSvg(V ? 230 : 260) + '</div>' +
        '<p class="t ac-wl" style="font-size:' + (V ? 40 : 40) + 'px">ทดลองใน PDCA รอบใหม่</p>';
      FIX.forEach(([p, f], i) => { s += '<div class="card ac-c' + i + '" style="width:' + cw + 'px;padding:18px 32px 22px"><p style="font-weight:700;font-size:' + (V ? 34 : 34) + 'px;color:var(--ink2)">' + p + '</p><p style="font-weight:700;font-size:' + (V ? 50 : 50) + 'px"><span style="color:var(--main)">→</span> ' + f + '</p></div>'; });
      s += '<div class="note green ac-again" style="font-size:' + (V ? 42 : 44) + 'px">เก็บข้อมูลอีกครั้ง:<br>เวลาที่เสียไป ลดลงจริงไหม?</div>';
      return s;
    },
    init(host) { Object.assign(this, { hh: q(host, '.ac-h'), root: q(host, '.ac-root'), wh: q(host, '.ac-wh'), wl: q(host, '.ac-wl'), cs: FIX.map((_, i) => q(host, '.ac-c' + i)), again: q(host, '.ac-again') }); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.hh, t, 0.15, undefined, at(L.tx, L.ty));
      CF.pop(this.root, t, C.root - 0.2, undefined, V ? at(L.tx, L.ty + 130) : at(L.tx, L.ty + 140), -2);
      const wx = V ? 840 : 1640, wy = V ? 600 : 330;
      this.wh.style.opacity = seg(t, C.pdca - 0.2, C.pdca + 0.1).toFixed(2);
      this.wh.style.transform = mid(wx, wy, ' rotate(' + (200 * eio(seg(t, C.pdca, C.real + 1))).toFixed(1) + 'deg) scale(' + eob(seg(t, C.pdca - 0.2, C.pdca + 0.3), 1.5).toFixed(3) + ')');
      CF.pop(this.wl, t, C.pdca + 0.1, undefined, V ? at(L.tx, L.ty + 230) : at(1300, 500));
      const cy = V ? [810, 970, 1130] : [560, 720, 880], cx = V ? 540 : L.tx + 440;
      [C.f0, C.f1, C.f2].forEach((c0, k) => CF.pop(this.cs[k], t, c0 - 0.15, undefined, mid(cx, cy[k]), [-1.5, 1, -1][k]));
      CF.pop(this.again, t, C.again - 0.1, undefined, V ? mid(540, 1340) : mid(1560, 780), 3);
    },
  });

  // =========================================================================================== 9 caution
  CF.scenes.caution = stepScene('caution', null, null, null, {
    cues: (T) => ({ rem: T('จำไว้นะ'), exact: T('เป๊ะ'), rest: T('ไม่สำคัญ', 'ที่เหลือ'), safe: T('ความปลอดภัย', 'ปลอดภัย'), once: T('ครั้งเดียว'), now: T('ทันที') }),
    extra: (L) => {
      const V = L.V, cw = V ? 900 : 820;
      const warn = '<svg width="120" height="110" viewBox="0 0 120 110"><path d="M60 6 L114 102 H6 Z" style="fill:#FFC21A;stroke:#1D2430;stroke-width:8;stroke-linejoin:round"/><rect x="54" y="38" width="12" height="36" rx="5" style="fill:#1D2430"/><circle cx="60" cy="86" r="7" style="fill:#1D2430"/></svg>';
      return line('cu-h', 'แต่จำไว้นะ!', V ? 100 : 110, 'red') +
        '<div class="card cu-a" style="width:' + cw + 'px;padding:24px 36px 30px"><p style="font-weight:700;font-size:' + (V ? 54 : 54) + 'px">ไม่ต้อง <s style="text-decoration-color:var(--main);text-decoration-thickness:8px">80 : 20</s> เป๊ะ ๆ</p><p style="font-weight:700;font-size:' + (V ? 38 : 36) + 'px;color:var(--ink2)">แค่ดูว่าส่วนน้อยสร้างผลส่วนใหญ่</p></div>' +
        '<div class="card cu-b" style="width:' + cw + 'px;padding:24px 36px 30px"><p style="font-weight:700;font-size:' + (V ? 54 : 54) + 'px">เรื่องที่เหลือ ≠ ไม่สำคัญ</p></div>' +
        '<div class="card cu-c" style="width:' + cw + 'px;padding:24px 36px 30px;border-color:var(--main);display:flex;gap:28px;align-items:center">' + warn + '<div><p style="font-weight:700;font-size:' + (V ? 50 : 50) + 'px;color:var(--main)">ความปลอดภัย</p><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px">เกิดครั้งเดียว ก็ต้องรีบแก้ทันที!</p></div></div>';
    },
    init(host) { Object.assign(this, { hh: q(host, '.cu-h'), a: q(host, '.cu-a'), b: q(host, '.cu-b'), c: q(host, '.cu-c') }); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.slam(this.hh, t, Math.max(0.1, C.rem - 0.1), at(L.tx, L.ty - 10), -3, 1.6);
      const cx = V ? 540 : 960, ys = V ? [760, 990, 1240] : [450, 640, 850];
      CF.pop(this.a, t, C.exact - 0.4, undefined, mid(cx, ys[0]), -1.5);
      CF.pop(this.b, t, C.rest - 0.3, undefined, mid(cx, ys[1]), 1);
      CF.slam(this.c, t, C.safe - 0.1, mid(cx, ys[2] + CF.shake(t, C.now, 8)), -1.5, 1.6);
    },
  });

  // =========================================================================================== 10 close (the four tools; the site; the credit)
  const CHAIN = [['Fishbone', 'เห็นสาเหตุครบ'], ['Pareto 80/20', 'รู้ว่าเรื่องไหนก่อน'], ['5 Whys', 'เจอสาเหตุที่แท้จริง'], ['PDCA', 'ลองแก้ วัดผลเป็นระบบ']];
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { c0: T('ฟิชโบน', 'fishbone'), c1: T('พาเรโต้', 'พาเรโต'), c2: T('ไฟว์วายส์', 'ไฟว์', 'วายส์'), c3: T('พีดีซีเอ', 'pdca'), rem: T('จำไว้นะ', 'จำไว้'), take: T('ไม่จำเป็น'),
                 see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const cw = V ? 420 : 400, ch = V ? 250 : 250;
      let chain = '';
      CHAIN.forEach(([a, b], i) => {
        chain += '<div class="card cl-k' + i + '" style="width:' + cw + 'px;height:' + ch + 'px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;' + (i === 1 ? 'border-color:var(--main);background:#FFF4E3' : '') + '">' +
          '<p style="font-weight:700;font-size:' + (V ? 58 : 56) + 'px;color:' + (i === 1 ? 'var(--main)' : 'var(--ink)') + '">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 34) + 'px;color:var(--ink2)">' + b + '</p></div>';
        if (i < 3) chain += '<p class="t cl-a' + i + '" style="font-size:' + (V ? 80 : 80) + 'px;color:var(--main)">' + (V ? (i === 1 ? '↙' : '→') : '→') + '</p>';
      });
      host.insertAdjacentHTML('beforeend', chain +
        '<p class="stamp cl-pd" style="font-size:' + (V ? 110 : 104) + 'px">Pareto 80/20</p>' +
        line('cl-r1', 'ไม่ต้องแก้ทุกเรื่องพร้อมกัน', V ? 54 : 52) + '<p class="t cl-r2" style="font-size:' + (V ? 54 : 52) + 'px">แต่ต้องรู้ว่า<span style="color:var(--main)">เรื่องไหนควรแก้ก่อน!</span></p>' +
        line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 88 : 80) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t mute cl-url" style="font-size:' + (V ? 34 : 32) + 'px">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t mute cl-org" style="font-size:' + (V ? 26 : 26) + 'px;font-weight:600">แนวคิดจาก: Economics &amp; Quality Management · Vilfredo Pareto, Joseph Juran</p>' +
        '<p class="t mute cl-ai" style="font-size:' + (V ? 26 : 24) + 'px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      Object.assign(this, { ks: CHAIN.map((_, i) => q(host, '.cl-k' + i)), as: [0, 1, 2].map((i) => q(host, '.cl-a' + i)), pd: q(host, '.cl-pd'), r1: q(host, '.cl-r1'), r2: q(host, '.cl-r2'),
        see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.rem - 0.15;
      const kp = V ? [[290, 560], [790, 560], [290, 900], [790, 900]] : [[290, 420], [745, 600], [1200, 420], [1650, 600]];
      const ap = V ? [[540, 560], [540, 730], [540, 900]] : [[517, 500], [972, 500], [1427, 500]];
      [C.c0, C.c1, C.c2, C.c3].forEach((c0, i) => CF.pop(this.ks[i], t, c0 - 0.15, out, mid(kp[i][0], kp[i][1]), [-2, 1.5, -1.5, 2][i]));
      [C.c1, C.c2, C.c3].forEach((c0, i) => CF.pop(this.as[i], t, c0 - 0.3, out, mid(ap[i][0], ap[i][1])));
      const P = V ? { pd: [80, 300], r1: [80, 520], r2: [80, 610], see: [80, 1000], name: [80, 1065], url: [80, 1255], org: [80, 1305], ai: [80, 1350] }
                  : { pd: [110, 150], r1: [110, 330], r2: [110, 410], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.slam(this.pd, t, C.rem, at(P.pd[0], P.pd[1]), -4, 1.6);
      CF.pop(this.r1, t, C.take - 0.1, undefined, at(P.r1[0], P.r1[1]));
      CF.pop(this.r2, t, C.take + 0.9, undefined, at(P.r2[0], P.r2[1]));
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
