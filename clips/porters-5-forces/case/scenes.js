/* Porter's Five Forces, episode 14 of the restaurant series (docs/videos/series.md). One scene module per id, drawn
   from scene-local time only, same look and helpers (cf.js) as episodes 4–13. One five-forces map (rivals in the centre,
   new entrants above, suppliers left, buyers right, substitutes below) is shared by every force scene, the rated board
   and the name card. Tone: fun, pressure building from every side, then a new way to see growth. Cues are spoken words. */
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

  // ----------------------------------------------------------------------------------------- the five forces
  // 0 rivals (centre) 1 new entrants (top) 2 suppliers (left) 3 buyers (right) 4 substitutes (bottom)
  const F = [['⚔️', 'คู่แข่งเดิม', 'สูง'], ['🚪', 'ผู้เล่นรายใหม่', 'สูง'], ['🚚', 'ซัพพลายเออร์', 'ปานกลาง'], ['📱', 'ลูกค้า', 'สูง'], ['🏪', 'สินค้าทดแทน', 'สูง']];
  const fgeo = (L) => L.V ? { cx: 540, cy: 840, dx: 290, dy: 250, w: 250 } : { cx: 1360, cy: 540, dx: 340, dy: 300, w: 290 };
  const fpos = (g, i) => [[g.cx, g.cy], [g.cx, g.cy - g.dy], [g.cx - g.dx, g.cy], [g.cx + g.dx, g.cy], [g.cx, g.cy + g.dy]][i];
  const forcesHtml = (L, cls) => {
    const g = fgeo(L); let s = '<svg class="' + cls + '-ln" style="position:absolute;left:0;top:0;overflow:visible" width="' + L.W + '" height="' + L.H + '">';
    [1, 2, 3, 4].forEach((i) => { const [x, y] = fpos(g, i), [x0, y0] = fpos(g, 0); s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x0 + (x - x0) * 0.42) + '" y2="' + (y0 + (y - y0) * 0.42) + '" stroke="#1D2430" stroke-width="7" stroke-dasharray="14 10"/>'; });
    s += '</svg>';
    return s + F.map(([ic, n], i) => '<div class="card ' + cls + '-f' + i + '" style="width:' + g.w + 'px;padding:10px 16px 14px;text-align:center;background:' + (i ? 'var(--paper)' : '#FFF4E3') + '"><p style="font-size:' + (L.V ? 44 : 48) + 'px;line-height:1.1">' + ic + '</p><p style="font-weight:700;font-size:' + (L.V ? 30 : 32) + 'px">' + n + '</p>' +
      '<p class="' + cls + '-l' + i + '" style="display:inline-block;margin-top:4px;padding:0 14px 4px;border-radius:999px;font-weight:700;font-size:' + (L.V ? 26 : 28) + 'px;color:#fff;background:' + (F[i][2] === 'สูง' ? 'var(--main)' : 'var(--c)') + ';opacity:0">' + F[i][2] + '</p></div>').join('');
  };
  // tIn: when each node pops; lit: the node in focus (others dimmed) from t0; lv: when each level badge shows
  const forcesRender = (host, cls, L, t, tIn, lit, t0, lv) => {
    const g = fgeo(L); q(host, '.' + cls + '-ln').style.opacity = seg(t, Math.min(...tIn), Math.min(...tIn) + 0.3).toFixed(2);
    F.forEach((_, i) => {
      const e = q(host, '.' + cls + '-f' + i), [x, y] = fpos(g, i); CF.pop(e, t, tIn[i], undefined, mid(x, y));
      if (lit !== undefined && lit >= 0) { const d = seg(t, t0, t0 + 0.3); e.style.opacity = (+e.style.opacity * (i === lit ? 1 : 1 - 0.6 * d)).toFixed(2); e.style.boxShadow = i === lit && d > 0.5 ? '0 0 0 8px var(--main)' : ''; }
      if (lv) q(host, '.' + cls + '-l' + i).style.opacity = seg(t, lv[i], lv[i] + 0.2).toFixed(2);
    });
  };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { gold: T('ทำเลทอง'), a: T('ห้าร้าน', 'คู่แข่ง'), b: T('ซัพพลายเออร์'), c: T('แอป', 'เทียบราคา'), war: T('ออกรบ') };
      const N = [['⚔️ คู่แข่ง 5 ร้าน!', 'pink'], ['🚚 วัตถุดิบจะขึ้นราคา!', ''], ['📱 ลูกค้าเทียบราคาในแอป!', 'blue']];
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + '<p class="t hk-shop" style="font-size:' + (V ? 130 : 150) + 'px">🏪</p><p class="sticker hk-g" style="font-size:' + (V ? 44 : 50) + 'px">ทำเลทองชัด ๆ! ✨</p>' +
        N.map(([s, c], i) => '<p class="note ' + c + ' hk-n' + i + '" style="font-size:' + (V ? 36 : 40) + 'px">' + s + '</p>').join('') +
        '<p class="stamp hk-st" style="font-size:' + (V ? 46 : 56) + 'px">เปิดร้าน หรือออกรบเนี่ย?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), shop: q(host, '.hk-shop'), g: q(host, '.hk-g'), ns: [0, 1, 2].map((i) => q(host, '.hk-n' + i)), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, cx = V ? 540 : 960, cy = V ? 760 : 520;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.shop, t, 0.2, undefined, mid(cx, cy, ' rotate(' + CF.shake(t, C.a, 4).toFixed(1) + 'deg)'));
      CF.pop(this.g, t, C.gold - 0.3, C.a - 0.3, V ? mid(540, 560) : mid(960, 300), -2);
      const P = V ? [[540, 480], [300, 1000], [780, 1100]] : [[960, 250], [460, 640], [1460, 640]];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.ns[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-3, 3, -2][i]));
      CF.slam(this.st, t, C.war - 0.6, V ? mid(540, 1320) : mid(960, 900), -2, 1.7);
    },
  };

  // =========================================================================================== recap + name
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap'); this.host = host;
      this.C = { sw: T('สวอต'), q: T('ทำกำไร'), name: T('พอร์เตอร์ส', 'ฟอร์ซิส'), five: T('ห้าด้าน') };
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        '<div class="card rc-c" style="width:' + (V ? 860 : 560) + 'px;padding:16px 26px 20px"><p style="font-weight:700;font-size:30px;color:var(--ink2)">ตอน 13 · SWOT</p><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px">ร้านเราพร้อมแค่ไหน ✓</p></div>' +
        '<p class="sticker rc-q" style="font-size:' + (V ? 42 : 46) + 'px">ตลาดนี้ทำกำไรได้จริงไหม?</p>' +
        '<p class="t rc-name" style="font-size:' + (V ? 80 : 84) + 'px;color:var(--main);line-height:1.05">Porter\'s<br>Five Forces</p>' + forcesHtml(L, 'rc-x'));
      Object.assign(this, { tape: q(host, '.rc-tape'), c: q(host, '.rc-c'), qq: q(host, '.rc-q'), name: q(host, '.rc-name') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.name - 0.3;
      CF.pop(this.tape, t, 0.02, out, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.c, t, C.sw - 0.4, out, V ? mid(540, 520) : mid(420, 330), -1);
      CF.pop(this.qq, t, C.q - 0.5, out, V ? mid(540, 720) : mid(420, 520), -2);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, V ? L.ty - 60 : L.ty), -2, 1.5);
      forcesRender(this.host, 'rc-x', L, t, [0, 1, 2, 3, 4].map((i) => C.five - 0.4 + i * 0.12));
    },
  };

  // =========================================================================================== the five force scenes
  const EX = {
    rivals: { i: 0, n: 'แรงที่ 1', h: 'คู่แข่งเดิม', notes: ['ร้าน A ลดราคา', 'ร้าน B ซื้อ 1 แถม 1'], nc: [['ลดราคา'], ['แถม']], quote: 'ยังไม่ทันเปิด ก็เกือบต้องลดราคา!', qc: ['ยังไม่ทันเปิด', 'เกือบต้อง'], rule: 'ทำไมลูกค้าต้องเลือกเรา?', rc: ['ทำไมลูกค้า', 'เลือกเรา'] },
    entrants: { i: 1, n: 'แรงที่ 2', h: 'ผู้เล่นรายใหม่', notes: ['เช่าที่ + ซื้อเตา = เปิดแข่งได้ทันที'], nc: [['ซื้อเตา', 'เช่าที่']], quote: 'ยิ่งเข้าง่าย ยิ่งกดดัน', qc: ['เข้าง่าย'], rule: 'สร้างสิ่งที่ลอกยาก: แบรนด์ · ลูกค้าประจำ · ระบบงาน', rc: ['ลอกยาก', 'แบรนด์'] },
    suppliers: { i: 2, n: 'แรงที่ 3', h: 'อำนาจต่อรองของซัพพลายเออร์', notes: ['📞 "เดือนหน้าขึ้นราคา 10% นะครับ!"'], nc: [['สิบเปอร์เซ็นต์', 'ขึ้นราคา']], quote: 'ไม่ซื้อเจ้านี้ แล้วจะซื้อใคร?', qc: ['จะซื้อใคร', 'อ้าว'], rule: 'หาทางเลือกเพิ่ม โดยไม่ลดคุณภาพ', rc: ['ทางเลือกเพิ่ม', 'ไม่ลดคุณภาพ'] },
    buyers: { i: 3, n: 'แรงที่ 4', h: 'อำนาจต่อรองของลูกค้า', notes: ['เทียบราคา · รีวิว · เมนู ในมือถือ', 'ขึ้นราคาแต่ไม่ต่าง → ย้ายร้าน'], nc: [['เทียบราคา', 'มือถือ'], ['ย้ายร้าน']], quote: '', rule: 'ไม่ใช่ขายถูกลง แต่ให้เหตุผลที่อยากกลับมา', rc: ['ขายถูกลง', 'อยากกลับมา'] },
    subs: { i: 4, n: 'แรงที่ 5', h: 'สินค้าทดแทน', notes: ['🥪 อาหารพร้อมทาน ร้านสะดวกซื้อ', '🍳 ทำกินเอง', '🛵 ครัวเดลิเวอรี่'], nc: [['สะดวกซื้อ', 'พร้อมทาน'], ['ทำกินเอง'], ['ครัวเดลิเวอรี่', 'เดลิเวอรี่']], quote: 'คู่แข่งต้องเป็นร้านอาหารไหม?', qc: ['ต้องเป็นร้านอาหาร', 'คู่แข่งร้านอาหาร'], rule: 'ไม่ได้ขายแบบเรา แต่แย่งลูกค้าเราได้!', rc: ['แย่งลูกค้า', 'ไม่ได้ขายแบบเรา'] },
  };
  const forceScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), X = EX[id]; this.host = host; this.X = X;
      this.C = { ns: X.nc.map((c) => T(...c)), quote: X.quote ? T(...X.qc) : 0, rule: T(...X.rc) };
      host.insertAdjacentHTML('beforeend', '<p class="pill ' + id + '-n" style="font-size:36px">' + X.n + '</p>' + line(id + '-h', X.h, V ? 52 : 56) + forcesHtml(L, id + '-x') +
        X.notes.map((s, k) => '<p class="note ' + ['', 'blue', 'pink'][k] + ' ' + id + '-i' + k + '" style="font-size:' + (V ? 30 : 36) + 'px">' + s + '</p>').join('') +
        (X.quote ? '<p class="sticker ' + id + '-q" style="font-size:' + (V ? 36 : 40) + 'px">' + X.quote + '</p>' : '') +
        '<p class="stamp green ' + id + '-r" style="font-size:' + (V ? 36 : 38) + 'px;white-space:normal;width:' + (V ? 900 : 820) + 'px;text-align:center">' + X.rule + '</p>');
      Object.assign(this, { n: q(host, '.' + id + '-n'), h: q(host, '.' + id + '-h'), its: X.notes.map((_, k) => q(host, '.' + id + '-i' + k)), qq: q(host, '.' + id + '-q'), r: q(host, '.' + id + '-r') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, X = this.X;
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.slam(this.h, t, 0.3, at(L.tx, L.ty + 70), -1, 1.4);
      forcesRender(this.host, id + '-x', L, t, [0, 0, 0, 0, 0], X.i, 0.4);
      const P = V ? X.notes.map((_, k) => [540, 1225 + k * 75]) : X.notes.map((_, k) => [470, 430 + k * 105]);
      this.its.forEach((e, k) => { CF.pop(e, t, C.ns[k] - 0.4, undefined, mid(P[k][0], P[k][1]), [-2, 2, -1][k]); if (V) e.style.opacity = (+e.style.opacity * (1 - seg(t, C.rule - 0.6, C.rule - 0.3))).toFixed(2); });
      if (this.qq) CF.slam(this.qq, t, C.quote - 0.4, V ? mid(540, 1420) : mid(470, 770), -2, 1.5);
      if (this.qq && V) this.qq.style.opacity = (+this.qq.style.opacity * (1 - seg(t, C.rule - 0.7, C.rule - 0.4))).toFixed(2);
      CF.slam(this.r, t, C.rule - 0.4, V ? mid(540, 1300) : mid(470, 910), -2, 1.5);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = forceScene(id);

  // =========================================================================================== all five, rated
  CF.scenes.board = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'board'); this.host = host;
      this.C = { lv: [T('คู่แข่ง'), T('รายใหม่'), T('ซัพพลายเออร์'), T('ลูกค้า'), T('สินค้าทดแทน', 'ทดแทน')], sigh: T('เยอะขนาดนี้', 'ทำเลทอง'), not: T('ไม่ได้แปลว่า', 'กลยุทธ์') };
      host.insertAdjacentHTML('beforeend', line('bd-h', 'รวมทั้งห้าแรง', V ? 56 : 62) + forcesHtml(L, 'bd-x') +
        '<p class="sticker bd-s" style="font-size:' + (V ? 40 : 44) + 'px">ทำเลทอง… กดดันรอบด้าน!</p>' +
        '<p class="stamp bd-r" style="font-size:' + (V ? 36 : 40) + 'px;white-space:normal;width:' + (V ? 900 : 760) + 'px;text-align:center">กดดันสูง = กำไรรักษายาก<br>แต่แข่งได้ ถ้ามีกลยุทธ์ที่เหมาะ</p>');
      Object.assign(this, { h: q(host, '.bd-h'), s: q(host, '.bd-s'), r: q(host, '.bd-r') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      forcesRender(this.host, 'bd-x', L, t, [0, 0, 0, 0, 0], undefined, 0, C.lv.map((c0) => c0 + 0.3));
      CF.slam(this.s, t, C.sigh - 0.6, V ? mid(540, 1260) : mid(470, 470), -3, 1.6);
      CF.slam(this.r, t, C.not - 0.6, V ? mid(540, 1400) : mid(470, 720), -2, 1.5);
    },
  };

  // =========================================================================================== twist: growth without a new branch
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'twist');
      this.C = { a: T('สี่สิบสาม'), b: T('สิบห้า'), why: T('ลงทุน', 'ทำไม'), o1: T('ชุดกลางวัน'), o2: T('ลูกค้าเดิม'), wait: T('เดี๋ยวนะ'), grow: T('ไม่ได้มีแค่', 'สาขาใหม่') };
      host.insertAdjacentHTML('beforeend', line('tw-h', 'กลับมาดูร้านเดิม', V ? 56 : 62) +
        [['ลูกค้ากลับมาซ้ำ', '43%'], ['อัตรากำไร', '15%']].map(([a, b], i) => '<div class="card tw-k' + i + '" style="width:' + (V ? 420 : 420) + 'px;padding:14px 22px 18px;background:#BFE5CC;text-align:center"><p style="font-weight:700;font-size:30px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 64 : 70) + 'px">' + b + '</p></div>').join('') +
        '<p class="note pink tw-q" style="font-size:' + (V ? 36 : 40) + 'px">รีบลงทุนในตลาดที่กดดันสูงทำไม?</p>' +
        '<p class="note blue tw-o1" style="font-size:' + (V ? 36 : 40) + 'px">🍱 ชุดกลางวันให้ออฟฟิศ (ยังไม่เปิดสาขา)</p>' +
        '<p class="note green tw-o2" style="font-size:' + (V ? 36 : 40) + 'px">🧡 ขายลูกค้าเดิมให้มากขึ้น</p>' +
        '<p class="stamp green tw-st" style="font-size:' + (V ? 42 : 52) + 'px">เติบโต ≠ เปิดสาขาใหม่อย่างเดียว!</p>');
      Object.assign(this, { h: q(host, '.tw-h'), ks: [0, 1].map((i) => q(host, '.tw-k' + i)), qq: q(host, '.tw-q'), o1: q(host, '.tw-o1'), o2: q(host, '.tw-o2'), st: q(host, '.tw-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      const P = V ? [[300, 560], [780, 560]] : [[400, 470], [860, 470]];
      [C.a, C.b].forEach((c0, i) => CF.pop(this.ks[i], t, c0 - 0.5, undefined, mid(P[i][0], P[i][1]), [-2, 2][i]));
      CF.pop(this.qq, t, C.why - 0.5, undefined, V ? mid(540, 760) : mid(1420, 330), -2);
      CF.pop(this.o1, t, C.o1 - 0.5, undefined, V ? mid(540, 900) : mid(1420, 500), 2);
      CF.pop(this.o2, t, C.o2 - 0.5, undefined, V ? mid(540, 1040) : mid(1420, 660), -2);
      CF.slam(this.st, t, C.grow - 0.8, V ? mid(540, 1260) : mid(960, 900), -2, 1.6);
      if (V) { this.st.style.whiteSpace = 'normal'; this.st.style.width = '900px'; this.st.style.textAlign = 'center'; }
    },
  };

  // =========================================================================================== close (+ key takeaway, bridge to Ansoff)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { who: T('กดดันกำไร', 'ใครกำลัง'), kt: T('ตลาดที่ขายดี', 'ขายดี'), q: T('อยากโต', 'ทางไหน'), next: T('ตอนหน้า'), an: T('แอนซอฟฟ์', 'เมทริกซ์'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend', '<p class="pill cl-w" style="font-size:' + (V ? 34 : 36) + 'px">Five Forces = ใครกำลังกดดันกำไรของเรา</p>' +
        '<p class="t cl-k" style="font-size:' + (V ? 50 : 56) + 'px;white-space:normal;width:' + (V ? 920 : 1600) + 'px;line-height:1.3">ตลาดที่ขายดี<br><span style="color:var(--main)">ไม่จำเป็นต้องเป็นตลาดที่ทำกำไรได้ดี</span></p>' +
        '<p class="t mute cl-e" style="font-size:' + (V ? 34 : 38) + 'px">A Growing Market Is Not Always a Profitable Market.</p>' +
        nextCard(V, 'cl-next', 'Ansoff Matrix', 'โตได้หลายทาง ไม่ต้องเปิดสาขาก่อน') + siteBlock(V, 'Strategic Management · Michael Porter'));
      Object.assign(this, { w: q(host, '.cl-w'), k: q(host, '.cl-k'), e: q(host, '.cl-e'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.w, t, C.who - 0.6, out, at(L.tx, L.ty), -1);
      if (V) { this.w.style.whiteSpace = 'normal'; this.w.style.width = '900px'; }
      CF.pop(this.k, t, C.kt - 0.3, out, V ? at(L.tx, 560) : at(L.tx, 420));
      CF.pop(this.e, t, C.kt + 0.6, out, V ? at(L.tx, 800) : at(L.tx, 620));
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.an) * 8) * Math.exp(-Math.max(0, t - C.an) * 3);
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
