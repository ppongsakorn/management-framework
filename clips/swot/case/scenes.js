/* SWOT, episode 13 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from scene-local
   time only, same look and helpers (cf.js) as episodes 4–12. One SWOT board (S W on top = inside the shop, O T below =
   outside) is shared by the four box scenes, inside/outside and the not-yet scene; the options scene pairs the boxes.
   Tone: bright and curious, the team searching for the answer together. Cues are spoken words. */
(() => {
  const CF = window.CF, K = CF.K, { seg, lerp, eio } = K;
  const HEARD = (api, id) => {
    const sc = api.scene(id), nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, ''), heard = sc.concat || '', say = nm(sc.say || '');
    return (...alts) => { const a = alts.find((w) => heard.includes(nm(w))) || alts.find((w) => say.includes(nm(w))); return a ? api.T('w:' + a, id) : 0.5; };
  };
  const LAY = (W, H) => { const V = H > W; return V ? { V, W, H, tx: 80, tapeY: 262, ty: 372 } : { V, W, H, tx: 110, tapeY: 120, ty: 250 }; };
  const at = (x, y, e) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (e || '');
  const mid = (x, y, e) => at(x, y) + ' translate(-50%,-50%)' + (e || '');
  const q = (h, c) => h.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const fig = (inner, w, top) => '<svg width="' + w + '" height="' + (w * (top + 10) / 150).toFixed(0) + '" viewBox="-75 ' + -top + ' 150 ' + (top + 10) + '">' + inner + '</svg>';
  const chef = (w) => fig(CF.chef('#1D2430'), w, 335);
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 800) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 60 : 58) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  const person = (w) => fig(CF.body('#1D2430'), w, 255);
  // ----------------------------------------------------------------------------------------- the SWOT board
  // 0 S (top left) 1 W (top right) 2 O (bottom left) 3 T (bottom right): top row inside the shop, bottom row outside
  const QD = [['S', 'Strengths', 'จุดแข็ง', '#BFE5CC'], ['W', 'Weaknesses', 'จุดอ่อน', '#F7C6BD'], ['O', 'Opportunities', 'โอกาส', '#BFD6F2'], ['T', 'Threats', 'ภัยคุกคาม', '#FFE680']];
  const gridGeo = (L, big) => L.V ? { x: 120, y: big ? 560 : 520, w: 840, h: big ? 700 : 560 } : { x: big ? 860 : 120, y: big ? 260 : 440, w: big ? 900 : 760, h: big ? 700 : 520 };
  const gridHtml = (L, cls, big) => {
    const g = gridGeo(L, big); let s = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px;height:' + g.h + 'px;transform-origin:0 0">';
    QD.forEach(([a, b, c, col], i) => {
      s += '<div class="' + cls + '-q' + i + '" style="position:absolute;left:' + (i % 2) * g.w / 2 + 'px;top:' + Math.floor(i / 2) * g.h / 2 + 'px;width:' + (g.w / 2 - 10) + 'px;height:' + (g.h / 2 - 10) + 'px;background:' + col + ';border:6px solid var(--ink);border-radius:20px;padding:12px 18px">' +
        '<p style="font-weight:700;font-size:' + (big ? 64 : 54) + 'px;line-height:1;color:var(--main)">' + a + '</p><p style="font-weight:700;font-size:' + (big ? 34 : 30) + 'px">' + c + '</p><p style="font-weight:700;font-size:' + (big ? 24 : 22) + 'px;color:var(--ink2)">' + b + '</p></div>';
    });
    return s + '</div>';
  };
  const gridRender = (host, cls, L, big, t, tIn, lit, t0) => {
    const g = gridGeo(L, big), root = q(host, '.' + cls); root.style.transform = at(g.x, g.y);
    QD.forEach((_, i) => {
      const e = q(host, '.' + cls + '-q' + i); CF.pop(e, t, (tIn || [])[i] ?? -1, undefined, '');
      if (lit !== undefined && lit >= 0) { const d = seg(t, t0, t0 + 0.3); e.style.opacity = (+e.style.opacity * (i === lit ? 1 : 1 - 0.65 * d)).toFixed(2); e.style.boxShadow = i === lit && d > 0.5 ? '0 0 0 8px var(--main)' : ''; }
    });
  };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { ten: T('สิบสาขา', 'สิบเท่า'), chef: T('ครัวสาขาใหม่', 'หัวหน้าครัว'), front: T('หาลูกค้า', 'หัวหน้าร้าน'), dream: T('ฝัน'), not: T('ไม่ใช่เรื่องเดียวกัน', 'เรื่องเดียวกัน') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        '<div class="card hk-c" style="width:' + (V ? 760 : 620) + 'px;padding:18px 28px 22px"><p style="font-weight:700;font-size:' + (V ? 34 : 34) + 'px;color:var(--ink2)">🧮 เครื่องคิดเลขของเจ้าของร้าน</p><p style="font-weight:700;font-size:' + (V ? 50 : 52) + 'px">1 ร้าน = 💰</p><p class="hk-c2" style="font-weight:700;font-size:' + (V ? 56 : 60) + 'px;color:var(--d)">10 ร้าน = 💰×10!</p></div>' +
        '<p class="note blue hk-q0" style="font-size:' + (V ? 36 : 40) + 'px">หัวหน้าครัว: ใครดูแลครัวสาขาใหม่ครับ?</p>' +
        '<p class="note pink hk-q1" style="font-size:' + (V ? 36 : 40) + 'px">หัวหน้าร้าน: หาลูกค้าจากไหนคะ?</p>' +
        '<p class="sticker hk-d" style="font-size:' + (V ? 40 : 46) + 'px">ขอฝันให้จบก่อนได้ไหม!</p>' +
        '<p class="stamp hk-st" style="font-size:' + (V ? 42 : 54) + 'px">ร้านเดียวรอด ≠ ขยายแล้วรอด</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), c: q(host, '.hk-c'), c2: q(host, '.hk-c2'), q0: q(host, '.hk-q0'), q1: q(host, '.hk-q1'), d: q(host, '.hk-d'), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.c, t, 0.15, undefined, V ? mid(540, 520) : mid(520, 420), -2);
      this.c2.style.opacity = seg(t, C.ten - 0.4, C.ten - 0.1).toFixed(2);
      CF.pop(this.q0, t, C.chef - 0.3, undefined, V ? mid(540, 760) : mid(1340, 330), 2);
      CF.pop(this.q1, t, C.front - 0.3, undefined, V ? mid(540, 900) : mid(1340, 500), -2);
      CF.slam(this.d, t, C.dream - 0.4, V ? mid(540, 1060) : mid(1340, 680), -3, 1.6);
      CF.slam(this.st, t, C.not - 0.8, V ? mid(540, 1260) : mid(960, 900), -2, 1.7);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { was: T('เกือบเจ๊ง'), a: T('สี่สิบสาม'), b: T('สิบห้า'), c: T('ทำงานได้เอง'), q: T('ขยาย') };
      const P = [['ลูกค้ากลับมาซ้ำ', '43%'], ['อัตรากำไร', '15%'], ['ทีมทำงานได้เอง', '✓']];
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">12 ตอนที่ผ่านมา…</p>' +
        '<p class="t rc-was" style="font-size:' + (V ? 50 : 56) + 'px">จากร้านที่ <span style="color:var(--main)">เคยเกือบเจ๊ง</span></p>' +
        P.map(([a, b], i) => '<div class="card rc-' + i + '" style="width:' + (V ? 860 : 480) + 'px;padding:16px 26px 20px;background:#BFE5CC;display:flex;justify-content:space-between;align-items:center"><p style="font-weight:700;font-size:' + (V ? 38 : 38) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 60 : 64) + 'px">' + b + '</p></div>').join('') +
        '<p class="sticker rc-q" style="font-size:' + (V ? 44 : 50) + 'px">ถึงเวลาขยายแล้วหรือยัง?</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), was: q(host, '.rc-was'), cs: [0, 1, 2].map((i) => q(host, '.rc-' + i)), qq: q(host, '.rc-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.was, t, C.was - 0.6, undefined, at(L.tx, L.ty));
      const P = V ? [[540, 560], [540, 720], [540, 880]] : [[420, 520], [960, 520], [1500, 520]];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.cs[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-2, 1, -1][i]));
      CF.slam(this.qq, t, C.q - 0.4, V ? mid(540, 1080) : mid(960, 780), -2, 1.6);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea'); this.host = host;
      this.C = { q: T('พร้อม'), name: T('สวอต', 'อะนาลิซิส'), l: [T('เอส'), T('ดับเบิลยู'), T('โอ โอกาส', 'โอกาส'), T('ที ภัย', 'ภัยคุกคาม')], ask: T('สาขาสอง', 'หรือยัง') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 110 : 112) + 'px;color:var(--main);line-height:1">SWOT<br>Analysis</p>' + gridHtml(L, 'id-g', true) +
        '<p class="sticker id-q" style="font-size:' + (V ? 40 : 42) + 'px">พร้อมเปิดสาขาสองหรือยัง?</p>');
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), qq: q(host, '.id-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      gridRender(this.host, 'id-g', L, true, t, C.l.map((c0) => c0 - 0.3));
      if (V) q(this.host, '.id-g').style.transform = at(120, 640) + ' scale(.86)';
      CF.slam(this.qq, t, C.ask - 0.6, V ? mid(540, 1300) : mid(420, 760), -2, 1.5);
    },
  };

  // =========================================================================================== S, W, O, T
  const EX = {
    s: { qi: 0, h: 'จุดแข็ง (ภายใน)', items: ['ครัวมีระบบ อาหารออกเร็ว', 'ลูกค้าประจำเยอะขึ้น', 'พนักงานดูแลลูกค้าได้เอง', 'กำไรดีขึ้น + มีข้อมูลวัดผล'], cues: [['ครัวมีระบบ', 'อาหารออกเร็ว'], ['ลูกค้าประจำ'], ['พนักงาน'], ['กำไรดีขึ้น', 'ข้อมูลวัดผล']], quote: '', rule: 'ต้องมีข้อมูลยืนยัน ไม่ใช่แค่คิดว่าเก่ง', rc: ['ข้อมูลยืนยัน', 'ไม่ใช่แค่'] },
    w: { qi: 1, h: 'จุดอ่อน (ภายใน)', items: ['หัวหน้าครัวมีคนเดียว', 'ระบบจัดซื้อไม่เคยใช้กับ 2 สาขา', 'เงินสำรองยังไม่พอ'], cues: [['มีคนเดียว'], ['จัดซื้อ'], ['เงินสำรอง']], quote: 'ถ้าผมไปสาขาใหม่ ใครดูแลครัวเดิมครับ?', qc: ['ใครดูแลครัวเดิม', 'ยกมือ'], rule: 'รู้จุดอ่อน = รู้ว่าต้องเตรียมอะไรเพิ่ม', rc: ['รู้จุดอ่อน', 'เตรียมอะไร'] },
    o: { qi: 2, h: 'โอกาส (ภายนอก)', items: ['ออฟฟิศเปิดใหม่ในย่าน', 'คนทำงานอยากได้มื้อกลางวันเร็ว', 'ตรงกับจุดแข็ง: อาหารออกเร็ว'], cues: [['ออฟฟิศเปิด'], ['มื้อกลางวัน'], ['ตรงกับจุดแข็ง', 'จุดแข็งเรา']], quote: '', rule: 'โอกาส = สมมติฐาน ไม่ใช่ยอดขาย', rc: ['สมมติฐาน'] },
    t: { qi: 3, h: 'ภัยคุกคาม (ภายนอก)', items: ['ค่าเช่าสูงขึ้น', 'วัตถุดิบผันผวน', 'ร้านเชนใหญ่จะเข้ามา', 'เดลิเวอรี่เต็มไปหมด'], cues: [['ค่าเช่า'], ['วัตถุดิบ'], ['เชนใหญ่', 'ร้านเชน'], ['เดลิเวอรี่']], quote: 'ทำเลทอง → สนามรบ!', qc: ['สนามรบ', 'ทำเลทอง'], rule: 'คุมไม่ได้ แต่เตรียมรับมือได้', rc: ['เตรียมรับมือ', 'คุมไม่ได้'] },
  };
  const swScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), X = EX[id]; this.host = host; this.X = X;
      this.C = { it: X.cues.map((c) => T(...c)), quote: X.quote ? T(...X.qc) : 0, rule: T(...X.rc) };
      const col = QD[X.qi][3];
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + '<p class="pill ' + id + '-n" style="font-size:36px">' + QD[X.qi][0] + ' · ' + QD[X.qi][1] + '</p>' + line(id + '-h', X.h, V ? 60 : 66) + gridHtml(L, id + '-g', false) +
        X.items.map((s, k) => '<p class="note ' + id + '-i' + k + '" style="font-size:' + (V ? 34 : 36) + 'px;background:' + col + ';padding:12px 22px 16px">' + s + '</p>').join('') +
        (X.quote ? '<p class="sticker ' + id + '-q" style="font-size:' + (V ? 36 : 40) + 'px">' + X.quote + '</p>' : '') +
        '<p class="stamp ' + (id === 's' || id === 'o' ? 'green ' : '') + id + '-r" style="font-size:' + (V ? 38 : 42) + 'px">' + X.rule + '</p>');
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), n: q(host, '.' + id + '-n'), h: q(host, '.' + id + '-h'), its: X.items.map((_, k) => q(host, '.' + id + '-i' + k)), qq: q(host, '.' + id + '-q'), r: q(host, '.' + id + '-r') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, X = this.X;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.slam(this.h, t, 0.3, at(L.tx, L.ty + 80), -1, 1.4);
      gridRender(this.host, id + '-g', L, false, t, [-1, -1, -1, -1], X.qi, 0.4);
      if (V) q(this.host, '.' + id + '-g').style.transform = at(250, 560) + ' scale(.6)';
      const P = V ? X.items.map((_, k) => [540, 940 + k * 110]) : X.items.map((_, k) => [1340, 380 + k * 125]);
      this.its.forEach((e, k) => CF.pop(e, t, C.it[k] - 0.4, undefined, mid(P[k][0], P[k][1]), [-2, 1.5, -1, 2][k]));
      if (this.qq) CF.slam(this.qq, t, C.quote - 0.4, V ? mid(540, 460 + 0) : mid(960, 180), -2, 1.5);
      if (this.qq && V) this.qq.style.opacity = (+this.qq.style.opacity * (1 - seg(t, C.it[0] - 0.8, C.it[0] - 0.5))).toFixed(2);
      CF.slam(this.r, t, C.rule - 0.4, V ? mid(540, 1420) : mid(1340, 920), -2, 1.5);
      if (V) { this.r.style.whiteSpace = 'normal'; this.r.style.width = '900px'; this.r.style.textAlign = 'center'; }
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = swScene(id);

  // =========================================================================================== inside vs outside
  CF.scenes.inout = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'inout'); this.host = host;
      this.C = { inn: T('ภายในร้าน', 'ภายใน'), own: T('ปรับปรุงได้เอง'), out: T('ภายนอก'), use: T('ใช้ประโยชน์', 'ปรับตัว') };
      host.insertAdjacentHTML('beforeend', line('io-h', 'ภายใน vs ภายนอก', V ? 60 : 66) + gridHtml(L, 'io-g', true) +
        '<p class="pill io-a" style="font-size:' + (V ? 32 : 34) + 'px">ภายใน · ทีม ระบบ เงินทุน → ปรับปรุงได้เอง</p>' +
        '<p class="pill io-b" style="font-size:' + (V ? 32 : 34) + 'px;background:var(--p)">ภายนอก · ลูกค้า คู่แข่ง ค่าเช่า → ใช้ประโยชน์ ปรับตัว รับมือ</p>');
      Object.assign(this, { h: q(host, '.io-h'), a: q(host, '.io-a'), b: q(host, '.io-b') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      gridRender(this.host, 'io-g', L, true, t, [0.05, 0.05, 0.05, 0.05]);
      const g = q(this.host, '.io-g'); g.style.transform = V ? at(120, 560) + ' scale(.86)' : at(590, 390) + ' scale(.8)';
      const up = seg(t, C.inn - 0.3, C.inn), dn = seg(t, C.out - 0.3, C.out);
      [0, 1].forEach((i) => (q(this.host, '.io-g-q' + i).style.boxShadow = up > 0.5 && dn < 0.5 ? '0 0 0 8px var(--d)' : ''));
      [2, 3].forEach((i) => (q(this.host, '.io-g-q' + i).style.boxShadow = dn > 0.5 ? '0 0 0 8px var(--p)' : ''));
      CF.pop(this.a, t, C.own - 0.6, undefined, V ? mid(540, 480) : mid(960, 350));
      CF.pop(this.b, t, C.use - 0.6, undefined, V ? mid(540, 1240) : mid(960, 990));
      if (V) { [this.a, this.b].forEach((e) => { e.style.whiteSpace = 'normal'; e.style.width = '900px'; e.style.textAlign = 'center'; }); }
    },
  };

  // =========================================================================================== four boxes ≠ a strategy
  CF.scenes.notyet = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'notyet'); this.host = host;
      this.C = { full: T('ครบสี่ช่อง', 'ครบ'), ask: T('เปิดสาขาได้', 'ตกลง'), no: T('ยังไม่รู้'), oh: T('อ้าว'), not: T('ไม่ได้แปลว่า', 'กลยุทธ์'), pair: T('จับคู่') };
      host.insertAdjacentHTML('beforeend', gridHtml(L, 'ny-g', true) + '<p class="note ny-q" style="font-size:' + (V ? 42 : 46) + 'px">ตกลงเปิดสาขาได้ยัง?</p>' +
        '<p class="sticker ny-n" style="font-size:' + (V ? 46 : 52) + 'px">ยังไม่รู้ครับ! 😅</p>' +
        '<p class="stamp ny-st" style="font-size:' + (V ? 44 : 52) + 'px">ครบ 4 ช่อง ≠ มีกลยุทธ์</p>' + line('ny-p', 'ต้องจับคู่ข้อมูล → สร้างทางเลือก', V ? 42 : 46, 'red'));
      Object.assign(this, { qq: q(host, '.ny-q'), n: q(host, '.ny-n'), st: q(host, '.ny-st'), p: q(host, '.ny-p') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      gridRender(this.host, 'ny-g', L, true, t, [0, 1, 2, 3].map((i) => 0.05 + i * 0.1));
      q(this.host, '.ny-g').style.transform = V ? at(120, 560) + ' scale(.86)' : at(860, 200) + ' scale(.9)';
      CF.pop(this.qq, t, C.ask - 0.4, undefined, V ? mid(540, 420) : mid(420, 300), -2);
      CF.slam(this.n, t, C.no - 0.3, V ? mid(540, 900) : mid(420, 480), -3, 1.6);
      CF.slam(this.st, t, C.not - 0.6, V ? mid(540, 1260) : mid(440, 700), -2, 1.6);
      CF.pop(this.p, t, C.pair - 0.4, undefined, V ? at(L.tx, 1380) : at(110, 860));
    },
  };

  // =========================================================================================== pair the boxes into options
  CF.scenes.options = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'options');
      this.C = { a: T('อาหารเร็ว'), b: T('หัวหน้าครัวมีคนเดียว', 'ฝึกคนใหม่'), c: T('ค่าเช่าแพง', 'ร้านเล็ก'), d: T('เงินสำรอง', 'ชะลอ'), ok: T('ลงมือได้จริง', 'ทางเลือก') };
      const O = [['S × O', 'อาหารเร็ว × มื้อกลางวันออฟฟิศ', 'ลองขายชุดกลางวันก่อน ไม่ต้องเปิดร้าน', '#BFE5CC'], ['W', 'หัวหน้าครัวมีคนเดียว', 'ฝึกหัวหน้าครัวคนใหม่', '#F7C6BD'], ['T', 'ค่าเช่าแพง · เชนใหญ่', 'ร้านเล็ก ต้นทุนคงที่ต่ำ', '#FFE680'], ['W × T', 'เงินสำรองไม่พอ · ค่าเช่าขึ้น', 'ชะลอการลงทุนไว้ก่อน', '#E9DFD0']];
      host.insertAdjacentHTML('beforeend', line('op-h', 'จับคู่ → ทางเลือก', V ? 60 : 66) + O.map(([a, b, c, col], i) => '<div class="card op-' + i + '" style="width:' + (V ? 900 : 820) + 'px;padding:12px 24px 16px;background:' + col + ';display:flex;gap:18px;align-items:center"><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px;color:var(--main);white-space:nowrap;min-width:' + (V ? 150 : 150) + 'px">' + a + '</p><div><p style="font-weight:700;font-size:' + (V ? 28 : 28) + 'px;color:var(--ink2)">' + b + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 38) + 'px">→ ' + c + '</p></div></div>').join('') +
        '<p class="stamp green op-st" style="font-size:' + (V ? 44 : 52) + 'px">ทางเลือกที่ลงมือได้จริง!</p>');
      Object.assign(this, { h: q(host, '.op-h'), os: [0, 1, 2, 3].map((i) => q(host, '.op-' + i)), st: q(host, '.op-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      const P = V ? [[540, 560], [540, 720], [540, 880], [540, 1040]] : [[540, 470], [1380, 470], [540, 680], [1380, 680]];
      [C.a, C.b, C.c, C.d].forEach((c0, i) => CF.pop(this.os[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-1, 1, 1, -1][i] * 0.8));
      CF.slam(this.st, t, C.ok - 0.6, V ? mid(540, 1260) : mid(960, 900), -2, 1.6);
    },
  };

  // =========================================================================================== check the three biggest questions first
  CF.scenes.check = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'check');
      this.C = { p: T('พาเรโต้'), q: [T('ต้องการจริง'), T('หัวหน้าทีม'), T('คุ้มความเสี่ยง', 'รายได้')], kb: T('คัมบัง'), all: T('ใช้ร่วมกัน', 'เครื่องมือ') };
      const Q = ['ลูกค้าย่านใหม่ ต้องการจริงแค่ไหน?', 'สร้างหัวหน้าทีมเพิ่มได้ทันไหม?', 'รายได้คุ้มต้นทุนและความเสี่ยงไหม?'];
      host.insertAdjacentHTML('beforeend', '<p class="pill cx-p" style="font-size:' + (V ? 36 : 38) + 'px">Pareto: เลือก 3 เรื่องที่กระทบแผนที่สุด</p>' +
        Q.map((s, i) => '<div class="card cx-' + i + '" style="width:' + (V ? 900 : 900) + 'px;padding:14px 26px 18px;display:flex;gap:18px;align-items:center"><p style="font-weight:700;font-size:' + (V ? 56 : 60) + 'px;color:var(--main)">' + (i + 1) + '</p><p style="font-weight:700;font-size:' + (V ? 38 : 42) + 'px">' + s + '</p></div>').join('') +
        '<p class="pill cx-kb" style="font-size:' + (V ? 34 : 36) + 'px;background:var(--p)">→ ขึ้นกระดานคัมบัง · ตั้งผลลัพธ์ให้ชัด</p>' +
        '<p class="sticker cx-all" style="font-size:' + (V ? 36 : 42) + 'px">Pareto · Kanban · OKR · SWOT ใช้ร่วมกัน!</p>');
      Object.assign(this, { p: q(host, '.cx-p'), qs: [0, 1, 2].map((i) => q(host, '.cx-' + i)), kb: q(host, '.cx-kb'), all: q(host, '.cx-all') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.p, t, C.p - 0.3, undefined, at(L.tx, V ? L.ty : L.ty - 40), -1);
      const Y = V ? [580, 760, 940] : [430, 590, 750];
      this.qs.forEach((e, i) => CF.pop(e, t, C.q[i] - 0.6, undefined, mid(V ? 540 : 660, Y[i]), [-1, 1, -1][i] * 0.6));
      CF.pop(this.kb, t, C.kb - 0.4, undefined, V ? mid(540, 1100) : mid(1500, 300));
      CF.slam(this.all, t, C.all - 0.6, V ? mid(540, 1260) : mid(960, 930), -2, 1.5);
      if (V) { this.kb.style.whiteSpace = 'normal'; this.kb.style.width = '900px'; this.kb.style.textAlign = 'center'; }
    },
  };

  // =========================================================================================== sum (+ key takeaway)
  CF.scenes.sum = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'sum');
      this.C = { sign: T('สัญญาเช่า'), why: T('ต้องเช็ก', 'รู้แล้ว'), rem: T('จำไว้นะ'), two: T('สองด้าน') };
      host.insertAdjacentHTML('beforeend', '<p class="stamp sm-s" style="font-size:' + (V ? 44 : 52) + 'px">ยังไม่เซ็นสัญญาเช่า ✍️✗</p>' +
        '<p class="note green sm-w" style="font-size:' + (V ? 36 : 40) + 'px">ไม่ใช่หมดมั่นใจ แต่รู้ว่าต้องเช็กอะไรอีก</p>' +
        '<p class="t sm-k" style="font-size:' + (V ? 46 : 52) + 'px;white-space:normal;width:' + (V ? 920 : 1500) + 'px;line-height:1.3">อย่าตัดสินอนาคต<br>จากความสำเร็จในอดีตเพียงอย่างเดียว</p>' +
        '<p class="t sm-k2" style="font-size:' + (V ? 38 : 42) + 'px;white-space:normal;width:' + (V ? 920 : 1600) + 'px;line-height:1.35;color:var(--main)">รู้จุดแข็ง เข้าใจจุดอ่อน' + (V ? '<br>' : ' ') + 'มองหาโอกาส และเตรียมรับมือความเสี่ยง</p>' +
        '<p class="t mute sm-e" style="font-size:' + (V ? 34 : 38) + 'px">Know Yourself. Know Your Environment.</p>');
      Object.assign(this, { s: q(host, '.sm-s'), w: q(host, '.sm-w'), k: q(host, '.sm-k'), k2: q(host, '.sm-k2'), e: q(host, '.sm-e') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.rem - 0.3;
      CF.slam(this.s, t, C.sign - 0.4, V ? mid(540, 480) : mid(960, 260), -2, 1.6);
      CF.pop(this.w, t, C.why - 0.6, undefined, V ? mid(540, 640) : mid(960, 420), 2);
      CF.pop(this.k, t, C.rem - 0.2, undefined, V ? at(L.tx, 800) : at(L.tx + 100, 540));
      CF.pop(this.k2, t, C.rem + 0.6, undefined, V ? at(L.tx, 1000) : at(L.tx + 100, 700));
      CF.pop(this.e, t, C.two - 0.3, undefined, V ? at(L.tx, 1140) : at(L.tx + 100, 800));
    },
  };

  // =========================================================================================== close (the bridge to Porter's Five Forces)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { go: T('ดูทำเล'), a: T('คู่แข่ง'), b: T('เชนใหญ่'), c: T('แอปเดลิเวอรี่', 'เดลิเวอรี่'), d: T('จองหลายราย', 'เจ้าของพื้นที่'), sur: T('โดนล้อม'), q: T('ซัพพลายเออร์'), next: T('ตอนหน้า'), pf: T('พอร์เตอร์ส', 'ฟอร์ซิส'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const A = [['🍜 ร้านคู่แข่ง', '#F7C6BD'], ['🏢 ร้านเชนใหญ่', '#FFE680'], ['📱 เดลิเวอรี่ ×10', '#BFD6F2'], ['🔑 มีคนจองพื้นที่หลายราย', '#E9DFD0']];
      host.insertAdjacentHTML('beforeend', '<p class="t cl-shop" style="font-size:' + (V ? 130 : 150) + 'px">🏪</p>' + A.map(([s, c], i) => '<p class="note cl-a' + i + '" style="font-size:' + (V ? 32 : 36) + 'px;background:' + c + '">' + s + '</p>').join('') +
        '<p class="sticker cl-s" style="font-size:' + (V ? 40 : 46) + 'px">ยังไม่ทันเปิด ก็โดนล้อมแล้ว!</p>' +
        nextCard(V, 'cl-next', "Porter's 5 Forces", 'การแข่งขัน มีมากกว่าคู่แข่งที่ขายเหมือนเรา') + siteBlock(V, 'Strategic Management'));
      Object.assign(this, { shop: q(host, '.cl-shop'), as: [0, 1, 2, 3].map((i) => q(host, '.cl-a' + i)), s: q(host, '.cl-s'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      const cx = V ? 540 : 960, cy = V ? 820 : 520;
      CF.pop(this.shop, t, C.go - 0.3, out, mid(cx, cy));
      const P = V ? [[290, 560], [790, 640], [290, 1060], [760, 1140]] : [[560, 300], [1360, 300], [560, 740], [1360, 740]];
      [C.a, C.b, C.c, C.d].forEach((c0, i) => CF.pop(this.as[i], t, c0 - 0.4, out, mid(P[i][0], P[i][1]), [-3, 3, 2, -2][i]));
      CF.slam(this.s, t, C.sur - 0.5, V ? mid(540, 1320) : mid(960, 940), -2, 1.6);
      if (t > out) this.s.style.opacity = (+this.s.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.pf) * 8) * Math.exp(-Math.max(0, t - C.pf) * 3);
      this.next.style.transform += ' scale(' + wob.toFixed(3) + ')';
      CF.pop(this.see, t, C.see, undefined, at(Pp.see[0], Pp.see[1]));
      CF.pop(this.name, t, C.name, undefined, at(Pp.name[0], Pp.name[1]), -2);
      CF.pop(this.url, t, C.name + 0.4, undefined, at(Pp.url[0], Pp.url[1]));
      CF.pop(this.org, t, C.name + 0.6, undefined, at(Pp.org[0], Pp.org[1]));
      CF.pop(this.ai, t, C.name + 0.8, undefined, at(Pp.ai[0], Pp.ai[1]));
    },
  };

  window.clipSetup = (api) => { for (const [id, sc] of Object.entries(CF.scenes)) { const host = api.stage.querySelector('section.scene[data-scene="' + id + '"]'); if (host && api.scene(id)) { sc.init(host, api); sc.ready = true; } } };
  window.clipFrame = (t, api) => { for (const [id, sc] of Object.entries(CF.scenes)) if (sc.ready) sc.render(api.local(t, id)); };
})();
