/* Theory of Constraints, episode 5 of the restaurant series (docs/videos/series.md): one scene module per id, drawn
   from scene-local time only. Same planning-room look and helpers (cf.js) as the Pareto episode. The kitchen is one
   chain of stations with dishes-per-hour numbers (chainBuild/chainRender) that every step reuses, so the bottleneck
   is always the same box: the stove 60 → 72 (exploit) → 96 (4th burner), then dishwashing (75) becomes the new one.
   Numbers are the canon: peak Saturday orders 80 dishes an hour. Cues (T('คำ')) are words in the spoken line. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;
  const LAY = (W, H) => {
    const V = H > W;
    return V ? { V, W, H, tx: 80, tapeY: 262, ty: 372, mid: 72 } : { V, W, H, tx: 110, tapeY: 120, ty: 250, mid: 80 };
  };
  const at = (x, y, extra) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (extra || '');
  const mid = (x, y, extra) => at(x, y) + ' translate(-50%,-50%)' + (extra || '');
  const q = (host, c) => host.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const stepHead = (L, cls, n, en, th) =>
    '<p class="t ' + cls + '" style="font-size:' + (L.V ? 86 : 92) + 'px"><i style="display:inline-block;font-style:normal;min-width:1.15em;text-align:center;margin-right:.22em;padding:0 .1em .08em;border-radius:.22em;background:var(--main);color:#fff;font-size:.82em">' + n + '</i>' + en + '</p>' +
    '<p class="t mute ' + cls + '-th" style="font-size:' + (L.V ? 56 : 54) + 'px;color:var(--main)">' + th + '</p>';

  // ----------------------------------------------------------------------------------------- the kitchen chain
  const ST = [['รับออร์เดอร์', 120], ['เตรียมของ', 100], ['เตา', 60], ['จัดจาน', 90], ['เสิร์ฟ', 120]];
  const STOVE = 2;
  const chainGeo = (L) => L.V
    ? { V: true, pos: ST.map((_, i) => [400, 690 + i * 162]), w: 520, h: 120, dish: [815, 1176], pile: [700, 976] }
    : { V: false, pos: ST.map((_, i) => [230 + i * 365, 620]), w: 270, h: 170, dish: [1325, 900], pile: [960, 450] };
  const chainBuild = (L, cls, o) => {
    const g = chainGeo(L); let s = '';
    ST.forEach(([n, v], i) => {
      s += '<div class="card ' + cls + '-s' + i + '" style="width:' + g.w + 'px;height:' + g.h + 'px;display:flex;' + (g.V ? 'flex-direction:row;justify-content:space-between;padding:0 34px' : 'flex-direction:column;justify-content:center') + ';align-items:center;gap:4px">' +
        '<p style="font-weight:700;font-size:' + (g.V ? 44 : 40) + 'px">' + n + '</p><p style="font-weight:700;font-size:' + (g.V ? 50 : 54) + 'px;color:var(--ink2)"><span class="' + cls + '-v' + i + '">' + v + '</span><span style="font-size:.55em"> จาน/ชม.</span></p></div>';
      if (i < ST.length - 1) s += '<p class="t ' + cls + '-a' + i + '" style="font-size:' + (g.V ? 54 : 64) + 'px;color:var(--ink2)">' + (g.V ? '↓' : '→') + '</p>';
    });
    if (o && o.dish) s += '<div class="card ' + cls + '-dish" style="width:' + (g.V ? 250 : 300) + 'px;height:' + (g.V ? 140 : 150) + 'px;display:flex;flex-direction:column;justify-content:center;align-items:center;border-color:var(--main)"><p style="font-weight:700;font-size:40px">ล้างจาน</p><p style="font-weight:700;font-size:48px;color:var(--main)">75<span style="font-size:.55em"> จาน/ชม.</span></p></div>' +
      '<p class="t ' + cls + '-da" style="font-size:' + (g.V ? 54 : 60) + 'px;color:var(--main)">' + (g.V ? '↖' : '↑') + '</p>';
    // a stack of dishes waiting (drawn as plates)
    let plates = '';
    for (let k = 0; k < 10; k++) plates += '<ellipse class="' + cls + '-pl' + k + '" cx="70" cy="' + (200 - k * 18) + '" rx="62" ry="16" style="fill:#FFF4E3;stroke:#1D2430;stroke-width:5;opacity:0"/>';
    s += '<svg class="art ' + cls + '-pile" width="140" height="220" viewBox="0 0 140 220" style="overflow:visible">' + plates + '</svg>';
    return s;
  };
  // sp: {in:[t0 x5], hl:t (stove turns red), v:{i:[from,to,t0,t1]}, pile:{at:'stove'|'dish', t0, t1, n}, dish:t0, dim:t}
  const chainRender = (host, cls, L, t, sp) => {
    const g = chainGeo(L);
    ST.forEach(([, v], i) => {
      const el = q(host, '.' + cls + '-s' + i), [x, y] = g.pos[i];
      CF.pop(el, t, (sp.in || [])[i] ?? -1, undefined, mid(x, y));
      const red = i === STOVE && sp.hl !== undefined && t >= sp.hl, dish = sp.dish !== undefined && t >= sp.dish;
      el.style.borderColor = red && !dish ? 'var(--main)' : ''; el.style.background = red && !dish ? '#FFE4DE' : '';
      if (sp.dim !== undefined && i !== STOVE) el.style.opacity = (+el.style.opacity * (1 - 0.55 * seg(t, sp.dim, sp.dim + 0.4))).toFixed(2);
      const ve = q(host, '.' + cls + '-v' + i), vv = (sp.v || {})[i];
      ve.textContent = vv ? Math.round(lerp(vv[0], vv[1], eo(seg(t, vv[2], vv[3])))) : v;
      ve.style.color = vv && t >= vv[2] ? 'var(--d)' : '';
      if (i < ST.length - 1) { const a = q(host, '.' + cls + '-a' + i), p0 = g.pos[i], p1 = g.pos[i + 1]; CF.pop(a, t, ((sp.in || [])[i + 1] ?? -1) - 0.1, undefined, mid((p0[0] + p1[0]) / 2 + (g.V ? 0 : 0), (p0[1] + p1[1]) / 2)); }
    });
    const d = q(host, '.' + cls + '-dish');
    if (d) { CF.pop(d, t, sp.dish ?? 1e9, undefined, mid(g.dish[0], g.dish[1]), 0); CF.pop(q(host, '.' + cls + '-da'), t, g.V ? 1e9 : (sp.dish ?? 1e9) + 0.2, undefined, mid(g.dish[0] + 20, g.dish[1] - 140)); }
    const pile = q(host, '.' + cls + '-pile'), P = sp.pile;
    if (!P) { pile.style.opacity = 0; return; }
    const atDish = P.at === 'dish', base = atDish ? g.dish : g.pos[STOVE];
    const px = atDish ? (g.V ? base[0] - 70 : base[0] + 210) : (g.V ? base[0] + 330 : base[0] - 70), py = atDish ? (g.V ? base[1] - 330 : base[1] - 150) : (g.V ? base[1] - 150 : base[1] - 320);
    pile.style.opacity = 1; pile.style.transform = at(px, py);
    const n = Math.round(P.n * seg(t, P.t0, P.t1));
    for (let k = 0; k < 10; k++) q(host, '.' + cls + '-pl' + k).style.opacity = k < n ? 1 : 0;
  };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'hook');
      this.C = { better: T('ดีขึ้น'), more: T('เยอะขึ้น', 'กลับมา'), add: T('เพิ่มพนักงาน', 'ทดลอง'), two: T('สองคน'), hope: T('หวังว่า', 'รองรับ') };
      let crowd = '';
      for (let k = 0; k < 8; k++) crowd += '<g class="hk-c' + k + '" style="opacity:0">' + CF.body('#5A6270') + '</g>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        line('hk-l1', 'บริการดีขึ้น ลูกค้าเยอะขึ้น!', V ? 76 : 84) +
        '<p class="t hk-l2" style="font-size:' + (V ? 54 : 54) + 'px">ทดลองเพิ่มพนักงานเสิร์ฟ <span style="color:var(--main)">+2 คน</span></p>' +
        '<svg class="art hk-crowd" width="' + api.W + '" height="' + api.H + '" viewBox="0 0 ' + api.W + ' ' + api.H + '">' + crowd + '</svg>' +
        '<svg class="art hk-w" width="' + api.W + '" height="' + api.H + '" viewBox="0 0 ' + api.W + ' ' + api.H + '"><g class="hk-w0">' + CF.waiter('var(--main)') + '</g><g class="hk-w1">' + CF.waiter('var(--main)') + '</g></svg>' +
        '<p class="sticker hk-hope" style="font-size:' + (V ? 60 : 60) + 'px">รับลูกค้าได้มากขึ้น?</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), cs: [...Array(8)].map((_, k) => q(host, '.hk-c' + k)), ws: [0, 1].map((k) => q(host, '.hk-w' + k)), hope: q(host, '.hk-hope') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.l1, t, C.better - 0.2, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.add - 0.1, undefined, at(L.tx, L.ty + (V ? 120 : 130)));
      this.cs.forEach((c, k) => {
        const x = V ? 140 + (k % 4) * 230 : 960 + (k % 4) * 210, y = V ? 1180 + Math.floor(k / 4) * 260 : 640 + Math.floor(k / 4) * 330;
        CF.put(c, x, y, V ? 0.62 : 0.72, 0, t, C.more - 0.2 + k * 0.12);
      });
      this.ws.forEach((w, k) => CF.put(w, V ? 260 + k * 260 : 320 + k * 260, V ? 900 : 960, V ? 0.8 : 0.9, 0, t, C.two - 0.15 + k * 0.2));
      CF.pop(this.hope, t, C.hope, undefined, V ? mid(540, 1480) : mid(560, 560), -3);
    },
  };

  // =========================================================================================== puzzle
  CF.scenes.puzzle = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'puzzle');
      this.C = { weeks: T('สองสัปดาห์'), num: T('ตัวเลข'), sixty: T('หกสิบ'), same: T('เท่าเดิม'), ready: T('พร้อม'), what: T('อะไรกันแน่', 'จำกัด') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'pz-tape') +
        '<p class="pill pz-wk" style="font-size:' + (V ? 44 : 42) + 'px">ทดลอง 2 สัปดาห์</p>' +
        '<div class="card pz-card" style="width:' + (V ? 860 : 760) + 'px;padding:30px 40px 36px"><p style="font-weight:700;font-size:' + (V ? 40 : 38) + 'px;color:var(--ink2)">จานที่ครัวทำได้ ช่วงพีควันเสาร์</p>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px"><div><p style="font-weight:700;font-size:34px;color:var(--ink2)">ก่อน</p><p style="font-weight:700;font-size:' + (V ? 96 : 100) + 'px">60</p></div>' +
          '<p style="font-weight:700;font-size:60px;color:var(--ink2)">→</p><div><p style="font-weight:700;font-size:34px;color:var(--ink2)">หลัง +2 คน</p><p style="font-weight:700;font-size:' + (V ? 96 : 100) + 'px;color:var(--main)">60</p></div></div>' +
          '<p style="font-weight:700;font-size:34px;color:var(--ink2)">จาน/ชม.</p></div>' +
        '<p class="stamp pz-st" style="font-size:' + (V ? 90 : 90) + 'px">เท่าเดิม!</p>' +
        line('pz-q', 'อะไรจำกัดความเร็วของร้าน?', V ? 62 : 70));
      Object.assign(this, { tape: q(host, '.pz-tape'), wk: q(host, '.pz-wk'), card: q(host, '.pz-card'), st: q(host, '.pz-st'), qq: q(host, '.pz-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.wk, t, C.weeks - 0.1, undefined, at(L.tx, L.ty), -2);
      CF.pop(this.card, t, C.num - 0.1, undefined, V ? mid(540, 820) : mid(560, 600), -1);
      CF.slam(this.st, t, C.same, V ? mid(700, 1120) : mid(1050, 760), -8, 2.2);
      CF.pop(this.qq, t, C.what - 0.2, undefined, V ? at(L.tx, 1300) : at(1000, 420));
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'idea');
      this.C = { name: T('ทฤษฎีข้อจำกัด', 'ทฤษฎี'), toc: T('ทีโอซี', 'toc'), slow: T('ช้าที่สุด'), neck: T('คอขวด') };
      const bottle = '<svg width="300" height="420" viewBox="0 0 300 420"><path d="M120 20 H180 V120 Q180 150 230 190 Q270 220 270 280 V380 Q270 405 245 405 H55 Q30 405 30 380 V280 Q30 220 70 190 Q120 150 120 120 Z" style="fill:#BFD6F2;stroke:#1D2430;stroke-width:9;stroke-linejoin:round"/><rect x="110" y="6" width="80" height="26" rx="8" style="fill:#1D2430"/><circle class="id-drop" cx="150" cy="90" r="16" style="fill:#E5402F"/></svg>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') +
        '<p class="t id-name" style="font-size:' + (V ? 96 : 120) + 'px;color:var(--main)">Theory of<br>Constraints</p>' +
        line('id-sub', 'ทฤษฎีข้อจำกัด (TOC)', V ? 56 : 58, 'mute') +
        '<div class="id-bot" style="position:absolute;left:0;top:0">' + bottle + '</div>' +
        line('id-r1', 'ทั้งระบบเร็วได้แค่เท่า', V ? 56 : 56) + '<p class="t id-r2" style="font-size:' + (V ? 56 : 56) + 'px">จุดที่ช้าที่สุด = <span style="color:var(--main)">คอขวด</span></p>');
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), sub: q(host, '.id-sub'), bot: q(host, '.id-bot'), drop: q(host, '.id-drop'), r1: q(host, '.id-r1'), r2: q(host, '.id-r2') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.sub, t, C.toc, undefined, at(L.tx, L.ty + (V ? 230 : 290)));
      CF.pop(this.bot, t, C.slow - 0.4, undefined, V ? mid(540, 1050) : mid(1460, 560), 4);
      this.drop.setAttribute('cy', (90 - 60 * ((t * 1.6) % 1)).toFixed(1));
      CF.pop(this.r1, t, C.slow - 0.3, undefined, V ? at(L.tx, 1300) : at(L.tx, 640));
      CF.pop(this.r2, t, C.neck - 0.2, undefined, V ? at(L.tx, 1390) : at(L.tx, 730));
    },
  };

  // generic step scene: heading + the chain
  const stepScene = (id, n, en, th, o) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), T = CF.heard(api, id); this.id = id; this.host = host;
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + (n ? stepHead(L, id + '-h', n, en, th) : '') + chainBuild(L, id + '-k', o.build) + (o.extra ? o.extra(L, id) : ''));
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), h: q(host, '.' + id + '-h'), th: q(host, '.' + id + '-h-th') });
      this.C = o.cues(T); if (o.init) o.init.call(this, host, L);
    },
    render(t) {
      const L = this.L, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      if (this.h) { CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 112 : 118))); }
      chainRender(this.host, this.id + '-k', L, t, o.spec(this.C));
      if (o.after) o.after.call(this, t, L);
    },
  });
  const ALL = [-1, -1, -1, -1, -1];

  CF.scenes.map = stepScene('map', '1', 'Map', 'วาดเส้นทางของจาน', {
    cues: (T) => ({ draw: T('วาดเส้นทาง', 'วาด'), order: T('สั่ง'), serve: T('เสิร์ฟ'), each: T('แต่ละขั้น', 'ชั่วโมงละ') }),
    spec: (C) => ({ in: ST.map((_, i) => lerp(C.draw, Math.max(C.draw + 1, C.each + 0.6), i / 4)) }),
  });

  CF.scenes.find = stepScene('find', '2', 'Find', 'หาคอขวด', {
    cues: (T) => ({ pile: T('กองรอ', 'จานกอง'), stove: T('หน้าเตา'), sixty: T('หกสิบ'), eighty: T('แปดสิบ'), more: T('เพิ่มคน'), all: T('ทุกจาน') }),
    extra: (L) => '<p class="sticker find-80" style="font-size:' + (L.V ? 44 : 52) + 'px">ลูกค้าสั่ง 80 จาน/ชม.</p>' +
      '<p class="stamp find-neck" style="font-size:' + (L.V ? 64 : 66) + 'px">คอขวด!</p>' +
      '<p class="t find-all" style="font-size:' + (L.V ? 48 : 52) + 'px">ทุกจานต้องผ่าน<span style="color:var(--main)">เตา</span></p>',
    init(host) { Object.assign(this, { e80: q(host, '.find-80'), neck: q(host, '.find-neck'), all: q(host, '.find-all') }); },
    spec: (C) => ({ in: ALL, hl: C.stove, pile: { at: 'stove', t0: C.pile, t1: C.eighty + 0.5, n: 9 } }),
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.e80, t, C.eighty - 0.1, undefined, V ? mid(700, 575) : mid(1500, 300), -3);
      CF.slam(this.neck, t, C.stove, V ? mid(800, 1014 + 110) : mid(960, 790), -6, 2);
      CF.pop(this.all, t, C.all - 0.2, undefined, V ? at(L.tx, 1430) : at(L.tx, 900));
    },
  });

  CF.scenes.exploit = stepScene('exploit', '3', 'Exploit', 'รีดคอขวดให้เต็มที่', {
    cues: (T) => ({ kit: T('เตรียมของเป็นชุด', 'เป็นชุด'), only: T('ผัดอย่างเดียว', 'อย่างเดียว'), idle: T('ไม่ปล่อยให้เตาว่าง', 'ว่าง'), up: T('เจ็ดสิบสอง', 'เพิ่มเป็น') }),
    extra: (L) => (L.V ? ['เตรียมของ<br>เป็นชุด', 'คนคุมเตา<br>ผัดอย่างเดียว', 'เตาไม่ว่าง<br>แม้นาทีเดียว'] : ['เตรียมของเป็นชุดพร้อมผัด', 'คนคุมเตาผัดอย่างเดียว', 'เตาไม่ว่างแม้นาทีเดียว']).map((s, i) => '<p class="note ex-n' + i + '" style="font-size:' + (L.V ? 30 : 36) + 'px;white-space:nowrap">' + s + '</p>').join(''),
    init(host) { this.ns = [0, 1, 2].map((i) => q(host, '.ex-n' + i)); },
    spec: (C) => ({ in: ALL, hl: -1, v: { [STOVE]: [60, 72, C.up - 0.2, C.up + 0.6] }, pile: { at: 'stove', t0: -1, t1: 0, n: 9 } }),
    after(t, L) {
      const C = this.C, V = L.V, ts = [C.kit, C.only, C.idle];
      this.ns.forEach((n, i) => CF.pop(n, t, ts[i] - 0.15, undefined, V ? mid(820, 760 + i * 230) : mid(400 + i * 520, 900), [-3, 2, -2][i]));
      const pile = q(this.host, '.exploit-k-pile'), n = Math.round(9 - 5 * seg(t, C.up - 0.2, C.up + 0.8));
      for (let k = 0; k < 10; k++) q(this.host, '.exploit-k-pl' + k).style.opacity = k < n ? 1 : 0;
    },
  });

  CF.scenes.pace = stepScene('pace', '4', 'Pace', 'เดินตามจังหวะเตา', {
    cues: (T) => ({ all: T('ทุกขั้น'), send: T('ส่งออร์เดอร์', 'ออร์เดอร์'), fast: T('เร่ง'), pile: T('จานกอง', 'กอง') }),
    extra: (L) => '<p class="sticker pc-rule" style="font-size:' + (L.V ? 42 : 46) + 'px">ส่งเข้าครัวเท่าที่เตาทำทัน</p>' +
      '<p class="t pc-no" style="font-size:' + (L.V ? 44 : 46) + 'px"><span style="color:var(--main)">✗</span> หน้าร้านเร่ง = จานกองหน้าเตา</p>',
    init(host) { Object.assign(this, { rule: q(host, '.pc-rule'), no: q(host, '.pc-no') }); },
    spec: (C) => ({ in: ALL, v: { [STOVE]: [72, 72, -1, 0] }, dim: C.all, pile: { at: 'stove', t0: C.fast, t1: C.pile + 0.6, n: 7 } }),
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.rule, t, C.send - 0.1, V ? C.fast - 0.2 : undefined, V ? mid(540, 1460) : mid(1450, 300), -3);
      CF.pop(this.no, t, C.fast - 0.1, undefined, V ? at(L.tx, 1430) : at(L.tx, 900));
      // tickets released one by one at the stove's pace
      const pile = q(this.host, '.pace-k-pile'); if (t < C.fast) pile.style.opacity = 0;
    },
  });

  CF.scenes.elevate = stepScene('elevate', '5', 'Elevate', 'ยกระดับคอขวด', {
    cues: (T) => ({ notyet: T('ยังไม่พอ'), num: T('ดูตัวเลข', 'ตัวเลข'), fourth: T('หัวที่สี่', 'สี่'), up: T('เก้าสิบหก'), easy: T('สบาย') }),
    extra: (L) => '<p class="sticker el-4" style="font-size:' + (L.V ? 40 : 56) + 'px">+ เตาหัวที่ 4</p>' +
      '<p class="t el-ok" style="font-size:' + (L.V ? 48 : 52) + 'px"><span style="color:var(--d)">✓</span> รับลูกค้า 80 จาน/ชม. ได้สบาย</p>',
    init(host) { Object.assign(this, { e4: q(host, '.el-4'), ok: q(host, '.el-ok') }); },
    spec: (C) => ({ in: ALL, hl: -1, v: { [STOVE]: [72, 96, C.up - 0.3, C.up + 0.6] } }),
    after(t, L) {
      const C = this.C, V = L.V;
      CF.slam(this.e4, t, C.fourth - 0.1, V ? mid(820, 1014) : mid(960, 360), -4, 1.8);
      CF.pop(this.ok, t, C.easy - 0.3, undefined, V ? at(L.tx, 1430) : at(L.tx, 900));
    },
  });

  CF.scenes.moved = stepScene('moved', null, null, null, {
    build: { dish: true },
    cues: (T) => ({ fast: T('เตาเร็วขึ้น', 'เร็วขึ้น'), clean: T('จานสะอาด'), moved: T('ย้ายไป', 'ย้าย'), again: T('กลับไป', 'ทุกครั้ง') }),
    extra: (L) => line('mv-h', 'แต่พอเตาเร็วขึ้น…', L.V ? 70 : 76) +
      '<p class="stamp mv-st" style="font-size:' + (L.V ? 64 : 66) + 'px">คอขวดย้ายแล้ว!</p>' +
      '<p class="pill mv-loop" style="font-size:' + (L.V ? 40 : 40) + 'px">↺ กลับไปขั้นที่ 2: หาคอขวดใหม่</p>',
    init(host) { Object.assign(this, { hh: q(host, '.mv-h'), st: q(host, '.mv-st'), loop: q(host, '.mv-loop') }); },
    spec: (C) => ({ in: ALL, v: { [STOVE]: [96, 96, -1, 0] }, dish: C.clean - 0.2, pile: { at: 'dish', t0: C.clean, t1: C.moved + 0.4, n: 8 } }),
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.hh, t, 0.1, undefined, at(L.tx, L.ty));
      CF.slam(this.st, t, C.moved - 0.1, V ? mid(560, 555) : mid(1450, 330), -5, 2);
      CF.pop(this.loop, t, C.again - 0.2, undefined, V ? mid(540, 1460) : mid(560, 900), -1);
    },
  });

  // =========================================================================================== close
  const TASKS = ['หาคนล้างจานเพิ่ม', 'วางแผนดูแลเตา', 'คุยซัพพลายเออร์', 'ดูแลลูกค้า', 'วางแผนขยายร้าน'];
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { fast: T('เร็วขึ้น'), full: T('ล้นมือ'), t0: T('คนล้างจาน', 'ล้างจาน'), t1: T('ดูแลเตา'), t2: T('ซัพพลายเออร์'), t3: T('ดูแลลูกค้า', 'ลูกค้า'), t4: T('ขยายร้าน'), how: T('ยังไงดี', 'จัดการ'), next: T('ตอนหน้า'), eis: T('ไอเซนฮาวร์', 'เมทริกซ์'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const owner = '<svg class="art cl-own" width="300" height="360" viewBox="-150 -340 300 360" style="overflow:visible">' + CF.body('var(--ink)', '<path d="M-58 -150 Q-120 -210 -40 -238 M58 -150 Q120 -210 40 -238" style="fill:none;stroke:var(--ink);stroke-width:22;stroke-linecap:round"/>') + '</svg>';
      host.insertAdjacentHTML('beforeend', line('cl-h', 'ร้านเร็วขึ้น… แต่เจ้าของร้านงานล้นมือ!', V ? 52 : 62) + owner +
        TASKS.map((s, i) => '<p class="note cl-n' + i + '" style="font-size:' + (V ? 36 : 34) + 'px;background:' + ['#FFE680', '#BFE5CC', '#BFD6F2', '#F7C6BD', '#FFE680'][i] + '">' + s + '</p>').join('') +
        '<p class="sticker cl-q" style="font-size:' + (V ? 54 : 56) + 'px">จะจัดการยังไงดี?</p>' +
        '<div class="cl-next" style="position:absolute;left:0;top:0;width:' + (V ? 860 : 720) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
          '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 72 : 62) + 'px;line-height:1.05;white-space:nowrap">Eisenhower Matrix ▶</p>' +
          '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">งานไหนสำคัญ งานไหนแค่ด่วน</p></div>' +
        line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: Operations Management · Eliyahu M. Goldratt</p>' +
        '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      Object.assign(this, { hh: q(host, '.cl-h'), own: q(host, '.cl-own'), ns: TASKS.map((_, i) => q(host, '.cl-n' + i)), qq: q(host, '.cl-q'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.2;
      CF.pop(this.hh, t, 0.1, out, at(L.tx, L.ty));
      CF.pop(this.own, t, C.full - 0.2, out, V ? at(390, 900, ' rotate(' + CF.shake(t, C.full, 3).toFixed(2) + 'deg)') : at(260, 520, ' rotate(' + CF.shake(t, C.full, 3).toFixed(2) + 'deg)'));
      const NP = V ? [[280, 1330], [760, 1330], [280, 1460], [760, 1460], [540, 1250]] : [[900, 470], [1360, 470], [900, 640], [1360, 640], [1130, 810]];
      [C.t0, C.t1, C.t2, C.t3, C.t4].forEach((c0, i) => CF.pop(this.ns[i], t, c0 - 0.1, out, mid(NP[i][0], NP[i][1]), [-4, 3, -2, 4, -3][i]));
      CF.slam(this.qq, t, C.how - 0.1, V ? mid(540, 560) : mid(1660, 870), -4, 1.8);
      if (t > out) this.qq.style.opacity = (+this.qq.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const P = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] }
                  : { next: [1400, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(P.next[0], P.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.eis) * 8) * Math.exp(-Math.max(0, t - C.eis) * 3);
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
