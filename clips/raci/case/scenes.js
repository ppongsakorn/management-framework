/* RACI Matrix, episode 8 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from
   scene-local time only, same look and helpers (cf.js) as episodes 4–7. The four letters are one set of tiles; the
   build and fix scenes share one RACI table (tasks × roles) that first shows the two problems the team found
   (a task with no A, a task everyone has to approve) and then the agreed roles. Cues are words in the spoken line. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;
  const HEARD = (api, id) => {
    const sc = api.scene(id), nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, ''), heard = sc.concat || '', say = nm(sc.say || '');
    return (...alts) => { const a = alts.find((w) => heard.includes(nm(w))) || alts.find((w) => say.includes(nm(w))); return a ? api.T('w:' + a, id) : 0.5; };
  };
  const LAY = (W, H) => { const V = H > W; return V ? { V, W, H, tx: 80, tapeY: 262, ty: 372 } : { V, W, H, tx: 110, tapeY: 120, ty: 250 }; };
  const at = (x, y, e) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (e || '');
  const mid = (x, y, e) => at(x, y) + ' translate(-50%,-50%)' + (e || '');
  const q = (h, c) => h.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 860 : 760) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 70 : 62) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';
  const COL = { R: '#2B7A4B', A: '#E5402F', C: '#245FA6', I: '#6B3FA0' };
  const LET = [['R', 'Responsible', 'คนลงมือทำ'], ['A', 'Accountable', 'คนรับผิดชอบผลลัพธ์'], ['C', 'Consulted', 'คนที่ต้องถามก่อน'], ['I', 'Informed', 'คนที่ต้องรับรู้']];
  const tile = (cls, k, size) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + size + 'px;height:' + size + 'px;border-radius:' + size * 0.2 + 'px;background:' + COL[k] + ';color:#fff;border:6px solid var(--ink);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:' + size * 0.62 + 'px;box-shadow:8px 10px 0 rgba(0,0,0,.2);transform-origin:50% 50%">' + k + '</div>';

  // ----------------------------------------------------------------------------------------- the RACI table
  const ROLES = ['เจ้าของร้าน', 'หัวหน้าครัว', 'จัดซื้อ', 'หัวหน้าร้าน', 'การเงิน'];
  const TASKS = ['สั่งวัตถุดิบ', 'จัดตารางพนักงาน', 'ตรวจอุปกรณ์', 'เตรียมร้านก่อนเปิด'];
  // before: row 0 has two R and no A; row 1 has three A (everyone approves)
  const BEFORE = [['', 'R', 'R', '', ''], ['A', 'A', '', 'A', ''], ['I', 'A·R', '', '', ''], ['I', 'C', '', 'A·R', '']];
  const AFTER = [['I', 'A', 'R', 'C', 'C'], ['I', 'C', '', 'A·R', 'C'], ['I', 'A·R', '', '', ''], ['I', 'C', '', 'A·R', '']];
  const tabGeo = (L) => L.V ? { x: 60, y: 620, cw0: 210, cw: 134, rh: 118, hh: 96, fs: 24 } : { x: 700, y: 360, cw0: 290, cw: 150, rh: 118, hh: 86, fs: 27 };
  const tableHtml = (L, cls) => {
    const g = tabGeo(L), W = g.cw0 + g.cw * ROLES.length; let s = '<div class="card ' + cls + '" style="width:' + (W + 24) + 'px;padding:12px">';
    s += '<div style="display:flex;height:' + g.hh + 'px;align-items:center;font-weight:700;font-size:' + g.fs + 'px"><div style="width:' + g.cw0 + 'px;color:var(--ink2)">งาน \\ คน</div>' + ROLES.map((r) => '<div style="width:' + g.cw + 'px;text-align:center;line-height:1.15">' + r + '</div>').join('') + '</div>';
    TASKS.forEach((tk, i) => {
      s += '<div class="' + cls + '-row' + i + '" style="display:flex;height:' + g.rh + 'px;align-items:center;border-top:4px solid #E9DFD0;border-radius:12px"><div style="width:' + g.cw0 + 'px;font-weight:700;font-size:' + (g.fs + 4) + 'px;line-height:1.15">' + tk + '</div>';
      ROLES.forEach((_, j) => { s += '<div style="width:' + g.cw + 'px;display:flex;justify-content:center"><b class="' + cls + '-c' + i + '-' + j + '" style="display:inline-flex;min-width:' + (L.V ? 64 : 70) + 'px;height:' + (L.V ? 64 : 70) + 'px;padding:0 8px;border-radius:14px;align-items:center;justify-content:center;color:#fff;font-size:' + (L.V ? 32 : 36) + 'px;opacity:0"></b></div>'; });
      s += '</div>';
    });
    return s + '</div>';
  };
  // fill: cells of `data` appear row by row from t0 (dt per row); flag: {row: [t, text]} red outline
  const tableRender = (host, cls, L, t, tIn, data, t0, dt) => {
    const g = tabGeo(L), el = q(host, '.' + cls); CF.pop(el, t, tIn, undefined, at(g.x, g.y));
    data.forEach((row, i) => row.forEach((v, j) => {
      const c = q(host, '.' + cls + '-c' + i + '-' + j), k = v[0];
      c.textContent = v; c.style.background = v ? COL[k] : 'transparent';
      c.style.opacity = v ? seg(t, t0 + i * dt + j * 0.05, t0 + i * dt + j * 0.05 + 0.2).toFixed(2) : 0;
    }));
  };
  const flagRow = (host, cls, i, on, color) => { const r = q(host, '.' + cls + '-row' + i); r.style.boxShadow = on ? 'inset 0 0 0 7px ' + (color || 'var(--main)') : ''; r.style.background = on ? (color ? '#E3F2E8' : '#FFE4DE') : ''; };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { full: T('เต็มร้าน'), ready: T('พนักงานพร้อม', 'พร้อม'), fridge: T('ตู้เย็น'), none: T('ยังไม่มาส่ง', 'วัตถุดิบหลัก'), chef: T('นึกว่าฝ่ายจัดซื้อ', 'ฝ่ายจัดซื้อสั่ง'), buy: T('นึกว่าหัวหน้าครัว', 'หัวหน้าครัวสั่ง'), who: T('ใครเป็นคน', 'รับผิดชอบ') };
      const fridge = '<svg width="260" height="360" viewBox="0 0 260 360"><rect x="10" y="10" width="240" height="340" rx="22" style="fill:#fff;stroke:#1D2430;stroke-width:9"/><line x1="10" y1="120" x2="250" y2="120" style="stroke:#1D2430;stroke-width:7"/><rect x="40" y="170" width="180" height="10" rx="5" style="fill:#D9D2C4"/><rect x="40" y="250" width="180" height="10" rx="5" style="fill:#D9D2C4"/><text x="130" y="240" style="font-size:90px;font-weight:700;fill:#E5402F;text-anchor:middle">?</text></svg>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + line('hk-l1', 'วันเสาร์ ลูกค้าเต็มร้าน!', V ? 72 : 80) +
        '<p class="t hk-l2" style="font-size:' + (V ? 48 : 50) + 'px">พ่อครัว ✓ เตา ✓ พนักงาน ✓</p>' + '<div class="hk-fr" style="position:absolute;left:0;top:0">' + fridge + '</div>' +
        '<p class="stamp hk-none" style="font-size:' + (V ? 54 : 58) + 'px">วัตถุดิบยังไม่มา!</p>' +
        '<p class="sticker hk-b0" style="font-size:38px;background:#fff">หัวหน้าครัว: นึกว่าจัดซื้อสั่งแล้ว</p><p class="sticker hk-b1" style="font-size:38px;background:#fff">จัดซื้อ: นึกว่าหัวหน้าครัวสั่งแล้ว</p>' +
        line('hk-who', 'ใครรับผิดชอบกันแน่?', V ? 66 : 70, 'red'));
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), fr: q(host, '.hk-fr'), none: q(host, '.hk-none'), b0: q(host, '.hk-b0'), b1: q(host, '.hk-b1'), who: q(host, '.hk-who') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.l1, t, 0.2, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.ready - 0.4, undefined, at(L.tx, L.ty + (V ? 110 : 120)));
      CF.pop(this.fr, t, C.fridge - 0.3, undefined, V ? mid(300, 820) : mid(380, 700), -2);
      CF.slam(this.none, t, C.none - 0.2, V ? mid(700, 760) : mid(780, 560), -6, 2);
      CF.pop(this.b0, t, C.chef - 0.3, undefined, V ? mid(540, 1080) : mid(1350, 430), -2);
      CF.pop(this.b1, t, C.buy - 0.3, undefined, V ? mid(540, 1210) : mid(1400, 600), 2);
      CF.pop(this.who, t, C.who - 0.4, undefined, V ? at(L.tx, 1360) : at(1000, 760));
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { dl: T('เดลิเกชัน', 'เลเวลส์'), decide: T('ตัดสินใจอะไรได้', 'ตัดสินใจ'), who: T('รับผิดชอบงานไหน', 'รับผิดชอบ'), diff: T('ไม่เหมือนกัน') };
      const card = (cls, a, b, red) => '<div class="card ' + cls + '" style="width:' + (V ? 860 : 640) + 'px;padding:26px 32px 30px;' + (red ? 'border-color:var(--main)' : '') + '"><p style="font-weight:700;font-size:' + (V ? 32 : 30) + 'px;color:var(--ink2)">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 50 : 50) + 'px">' + b + '</p></div>';
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' + card('rc-a', 'Delegation Levels', 'ใครตัดสินใจได้แค่ไหน') +
        '<p class="t rc-ne" style="font-size:' + (V ? 110 : 120) + 'px;color:var(--main)">≠</p>' + card('rc-b', 'ยังไม่ชัด', 'ใครรับผิดชอบงานไหน?', true));
      Object.assign(this, { tape: q(host, '.rc-tape'), a: q(host, '.rc-a'), ne: q(host, '.rc-ne'), b: q(host, '.rc-b') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.a, t, C.dl - 0.2, undefined, V ? mid(540, 620) : mid(470, 560), -1.5);
      CF.pop(this.b, t, C.who - 0.3, undefined, V ? mid(540, 1080) : mid(1450, 560), 1.5);
      CF.slam(this.ne, t, C.diff - 0.2, V ? mid(540, 850) : mid(960, 560), 0, 2);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea');
      this.C = { name: T('ราซี'), table: T('ตาราง'), r: T('อาร์'), a: T('เอ'), c: T('ซี'), i: T('ไอ'), buy: T('สั่งวัตถุดิบ') };
      const sz = V ? 180 : 190;
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 110 : 120) + 'px;color:var(--main)">RACI Matrix</p>' +
        line('id-sub', 'บอกบทบาทของทุกคนในแต่ละงาน', V ? 48 : 50, 'mute') + LET.map(([k], i) => tile('id-t' + i, k, sz)).join('') +
        LET.map(([k, en, th], i) => '<p class="t id-w' + i + '" style="font-size:' + (V ? 30 : 30) + 'px;text-align:center;white-space:nowrap">' + en + '</p>').join('') +
        '<p class="pill id-ex" style="font-size:' + (V ? 40 : 40) + 'px">ลองดูจากงาน "สั่งวัตถุดิบ"</p>');
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), sub: q(host, '.id-sub'), ts: [0, 1, 2, 3].map((i) => q(host, '.id-t' + i)), ws: [0, 1, 2, 3].map((i) => q(host, '.id-w' + i)), ex: q(host, '.id-ex') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.sub, t, C.table - 0.2, undefined, at(L.tx, L.ty + (V ? 150 : 160)));
      const X = V ? [180, 420, 660, 900] : [400, 760, 1120, 1480], Y = V ? 900 : 650;
      [C.r, C.a, C.c, C.i].forEach((c0, i) => { CF.pop(this.ts[i], t, c0 - 0.15, undefined, mid(X[i], Y), [-4, 3, -3, 4][i]); CF.pop(this.ws[i], t, c0 + 0.1, undefined, mid(X[i], Y + (V ? 140 : 150))); });
      CF.pop(this.ex, t, C.buy - 0.3, undefined, V ? mid(540, 1280) : mid(960, 930), -1);
    },
  };

  // =========================================================================================== R / A / C / I
  const EX = {
    r: [0, 'พนักงานจัดซื้อ', 'ตรวจรายการ · ติดต่อซัพพลายเออร์ · ส่งคำสั่งซื้อ', 'มีได้มากกว่าหนึ่งคน'],
    a: [1, 'หัวหน้าครัว', 'ไม่ได้โทรสั่งเอง แต่ต้องดูให้วัตถุดิบมาครบและทันเวลา', 'แต่ละงาน มี A คนเดียว!'],
    c: [2, 'หน้าร้าน · การเงิน', 'หน้าร้านรู้ยอดจอง · การเงินรู้งบ', 'ถามก่อน แต่ไม่ต้องลงมือทำ'],
    i: [3, 'เจ้าของร้าน', 'แค่รู้ว่าวัตถุดิบพร้อมหรือยัง', 'ไม่ต้องเข้าประชุม ไม่ต้องอนุมัติทุกขั้น'],
  };
  const letterScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), [i, who, what, rule] = EX[id], [k, en, th] = LET[i];
      this.C = { k: T(['อาร์', 'เอ', 'ซี', 'ไอ'][i]), who: T(...{ r: ['จัดซื้อ'], a: ['หัวหน้าครัว'], c: ['หน้าร้าน', 'ยอดจอง'], i: ['เจ้าของร้าน'] }[id]), rule: T(...{ r: ['มากกว่าหนึ่ง', 'หนึ่งคน'], a: ['คนเดียว', 'แต่ละงาน'], c: ['ฝ่ายการเงิน', 'งบ'], i: ['ไม่ต้องเข้าประชุม', 'ประชุม'] }[id]) };
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + tile(id + '-t', k, V ? 260 : 300) +
        '<p class="t ' + id + '-en" style="font-size:' + (V ? 80 : 90) + 'px">' + en + '</p>' + line(id + '-th', th, V ? 58 : 60, 'red') +
        '<div class="card ' + id + '-ex" style="width:' + (V ? 900 : 900) + 'px;padding:24px 34px 30px"><p style="font-weight:700;font-size:' + (V ? 30 : 28) + 'px;color:var(--ink2)">งานสั่งวัตถุดิบ</p><p style="font-weight:700;font-size:' + (V ? 54 : 54) + 'px"><span style="color:' + COL[k] + '">' + k + '</span> = ' + who + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 36) + 'px;color:var(--ink2)">' + what + '</p></div>' +
        '<p class="sticker ' + id + '-rule" style="font-size:' + (V ? 44 : 46) + 'px">' + rule + '</p>');
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), t: q(host, '.' + id + '-t'), en: q(host, '.' + id + '-en'), th: q(host, '.' + id + '-th'), ex: q(host, '.' + id + '-ex'), rule: q(host, '.' + id + '-rule') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.t, t, Math.max(0.1, C.k - 0.15), V ? mid(220, 560) : mid(300, 520), -4, 1.8);
      CF.pop(this.en, t, C.k + 0.2, undefined, V ? at(390, 460) : at(520, 400));
      CF.pop(this.th, t, C.k + 0.5, undefined, V ? at(390, 570) : at(520, 520));
      CF.pop(this.ex, t, C.who - 0.3, undefined, V ? mid(540, 960) : mid(1280, 760), -1);
      CF.slam(this.rule, t, C.rule - 0.2, V ? mid(540, 1250) : mid(560, 900), -3, 1.6);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = letterScene(id);

  // =========================================================================================== build: the table and the two problems
  CF.scenes.build = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'build'); this.host = host;
      this.C = { team: T('ชวนทีม', 'ทำตาราง'), left: T('ด้านซ้าย'), top: T('ด้านบน'), fill: T('ทีละช่อง'), oh: T('อ๋อ'), noA: T('ไม่มีใครเป็นเอ', 'ไม่มีใคร'), all: T('ทุกคนต้องอนุมัติ', 'อนุมัติ') };
      host.insertAdjacentHTML('beforeend', line('bd-h', 'ชวนทีมทำตาราง RACI', V ? 60 : 68) + tableHtml(L, 'bd-g') +
        '<p class="stamp bd-s0" style="font-size:' + (V ? 44 : 48) + 'px">ไม่มี A!</p><p class="stamp bd-s1" style="font-size:' + (V ? 44 : 48) + 'px">A 3 คน!</p>');
      Object.assign(this, { hh: q(host, '.bd-h'), s0: q(host, '.bd-s0'), s1: q(host, '.bd-s1') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, g = tabGeo(L);
      CF.pop(this.hh, t, 0.1, undefined, at(L.tx, L.ty));
      tableRender(this.host, 'bd-g', L, t, C.team - 0.2, BEFORE, C.fill - 0.2, 0.35);
      flagRow(this.host, 'bd-g', 0, t >= C.noA - 0.2); flagRow(this.host, 'bd-g', 1, t >= C.all - 0.2);
      const rowY = (i) => g.y + 12 + g.hh + g.rh * (i + 0.5);
      CF.slam(this.s0, t, C.noA - 0.1, V ? mid(300, 1300) : mid(g.x - 150, rowY(0)), -6, 2);
      CF.slam(this.s1, t, C.all - 0.1, V ? mid(740, 1300) : mid(g.x - 150, rowY(1)), 5, 2);
    },
  };

  // =========================================================================================== fix: the agreed table
  CF.scenes.fix = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'fix'); this.host = host;
      this.C = { roles: T('บทบาทใหม่', 'กำหนด'), noA: T('ไม่มีเอ', 'หาให้ชัด'), dup: T('ซ้ำซ้อน', 'ตัดออก'), lvl: T('ระดับการมอบอำนาจ', 'มอบอำนาจ'), both: T('ทั้งหน้าที่', 'อำนาจตัดสินใจ') };
      host.insertAdjacentHTML('beforeend', line('fx-h', 'กำหนดบทบาทใหม่: ทุกงานมี A คนเดียว', V ? 46 : 54) + tableHtml(L, 'fx-g') +
        '<p class="pill fx-lv" style="font-size:' + (V ? 36 : 38) + 'px">+ ระดับการมอบอำนาจจากตอนที่แล้ว</p>');
      Object.assign(this, { hh: q(host, '.fx-h'), lv: q(host, '.fx-lv') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.hh, t, 0.1, undefined, at(L.tx, L.ty));
      const swap0 = C.noA - 0.1, swap1 = C.dup - 0.1;
      const data = BEFORE.map((r, i) => (i === 0 && t >= swap0) || (i === 1 && t >= swap1) || (i > 1) ? AFTER[i] : r);
      tableRender(this.host, 'fx-g', L, t, -1, data, -2, 0);
      flagRow(this.host, 'fx-g', 0, t >= swap0 && t < swap0 + 2, '#2B7A4B'); flagRow(this.host, 'fx-g', 1, t >= swap1 && t < swap1 + 2, '#2B7A4B');
      CF.pop(this.lv, t, C.lvl - 0.3, undefined, V ? mid(540, 1300) : mid(L.tx + 300, 950), -1);
    },
  };

  // =========================================================================================== result (+ key takeaway)
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result');
      this.C = { sat: T('วันเสาร์ถัดมา', 'ตรงเวลา'), chef: T('หัวหน้าครัวตรวจ', 'ตรวจ'), buy: T('ฝ่ายจัดซื้อทำ', 'ตามหน้าที่'), own: T('ได้รายงาน', 'รายงาน'), wow: T('เยี่ยม') };
      const ok = (cls, s) => '<p class="t ' + cls + '" style="font-size:' + (V ? 50 : 56) + 'px"><span style="color:var(--d)">✓</span> ' + s + '</p>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'rs-tape') + '<p class="pill rs-wk" style="font-size:' + (V ? 44 : 42) + 'px">วันเสาร์ถัดมา</p>' +
        ok('rs-a', 'วัตถุดิบมาครบ ตรงเวลา') + ok('rs-b', 'หัวหน้าครัว (A) ตรวจความพร้อม') + ok('rs-c', 'จัดซื้อ (R) ทำตามหน้าที่') + ok('rs-d', 'เจ้าของร้าน (I) ได้รายงาน ไม่ต้องเดินถาม') +
        '<p class="sticker rs-wow" style="font-size:' + (V ? 54 : 56) + 'px">งานเดินได้เองแล้ว!</p>' +
        '<p class="t rs-k" style="font-size:' + (V ? 42 : 46) + 'px;white-space:normal;width:' + (V ? 900 : 1700) + 'px;line-height:1.3">ทุกงานต้องมีคนลงมือทำ <span style="color:var(--main)">และมีคนรับผิดชอบผลลัพธ์อย่างชัดเจน</span></p>');
      Object.assign(this, { tape: q(host, '.rs-tape'), wk: q(host, '.rs-wk'), ls: ['a', 'b', 'c', 'd'].map((k) => q(host, '.rs-' + k)), wow: q(host, '.rs-wow'), k: q(host, '.rs-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, y = V ? 560 : 420, dy = V ? 120 : 110;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.wk, t, C.sat - 0.3, undefined, at(L.tx, L.ty), -2);
      [C.sat + 0.4, C.chef, C.buy, C.own].forEach((c0, i) => CF.pop(this.ls[i], t, c0 - 0.2, undefined, at(L.tx, y + i * dy)));
      CF.slam(this.wow, t, C.wow - 0.1, V ? mid(540, 1120) : mid(1450, 600), -4, 1.8);
      CF.pop(this.k, t, C.wow + 0.8, undefined, V ? at(80, 1260) : at(110, 900));
    },
  };

  // =========================================================================================== close (the bridge to Skill / Will)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { see0: T('สังเกต'), p0: T('ทำได้ดีมาก', 'ดีมาก'), p1: T('ตั้งใจสุด', 'ผิดบ่อย'), p2: T('ประสบการณ์สูง', 'ไม่ค่อยอยาก'), why: T('ต่างกัน'), ready: T('ความพร้อม'), next: T('ตอนหน้า'), sw: T('สกิล', 'วิล'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const P = [['ทำได้ดีมาก', '#BFE5CC'], ['ตั้งใจสุด ๆ<br>แต่ยังผิดบ่อย', '#FFE680'], ['ประสบการณ์สูง<br>แต่ไม่อยากรับงานใหม่', '#F7C6BD']];
      host.insertAdjacentHTML('beforeend', line('cl-h', 'หน้าที่ชัด… แต่ผลลัพธ์ต่างกัน?', V ? 58 : 68) +
        P.map(([s, c], i) => '<div class="card cl-p' + i + '" style="width:' + (V ? 300 : 360) + 'px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:8px;background:' + c + '"><svg width="90" height="110" viewBox="-60 -250 120 260">' + CF.body('#1D2430') + '</svg><p style="font-weight:700;font-size:' + (V ? 28 : 32) + 'px;text-align:center;line-height:1.25">' + s + '</p></div>').join('') +
        '<p class="sticker cl-q" style="font-size:' + (V ? 44 : 50) + 'px">หรือปัญหาอยู่ที่ความพร้อมของแต่ละคน?</p>' +
        nextCard(V, 'cl-next', 'Skill / Will Matrix', 'ทักษะ × ความอยากทำ ของแต่ละคน') + siteBlock(V, 'Project Management (RACI)'));
      Object.assign(this, { hh: q(host, '.cl-h'), ps: [0, 1, 2].map((i) => q(host, '.cl-p' + i)), qq: q(host, '.cl-q'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.hh, t, C.see0 - 0.3, out, at(L.tx, L.ty));
      const X = V ? [200, 540, 880] : [460, 960, 1460];
      [C.p0, C.p1, C.p2].forEach((c0, i) => CF.pop(this.ps[i], t, c0 - 0.3, out, mid(X[i], V ? 760 : 600), [-2, 2, -2][i]));
      CF.slam(this.qq, t, C.ready - 0.4, V ? mid(540, 1100) : mid(960, 900), -2, 1.6);
      if (t > out) this.qq.style.opacity = (+this.qq.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const P = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1400, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(P.next[0], P.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.sw) * 8) * Math.exp(-Math.max(0, t - C.sw) * 3);
      this.next.style.transform += ' scale(' + wob.toFixed(3) + ')';
      CF.pop(this.see, t, C.see, undefined, at(P.see[0], P.see[1]));
      CF.pop(this.name, t, C.name, undefined, at(P.name[0], P.name[1]), -2);
      CF.pop(this.url, t, C.name + 0.4, undefined, at(P.url[0], P.url[1]));
      CF.pop(this.org, t, C.name + 0.6, undefined, at(P.org[0], P.org[1]));
      CF.pop(this.ai, t, C.name + 0.8, undefined, at(P.ai[0], P.ai[1]));
    },
  };

  window.clipSetup = (api) => { for (const [id, sc] of Object.entries(CF.scenes)) { const host = api.stage.querySelector('section.scene[data-scene="' + id + '"]'); if (host && api.scene(id)) { sc.init(host, api); sc.ready = true; } } };
  window.clipFrame = (t, api) => { for (const [id, sc] of Object.entries(CF.scenes)) if (sc.ready) sc.render(api.local(t, id)); };
})();
