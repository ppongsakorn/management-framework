/* Weighted Decision Matrix, episode 16 of the restaurant series (docs/videos/series.md). One scene module per id, drawn
   from scene-local time only, same look and helpers (cf.js) as episodes 4–15. The three growth ideas left on the table in
   episode 15 become the rows of a scoring table (hypothetical scores, 1–5 per criterion, weights summing to 100); one
   assumption changes (profit 4 → 3) and the ranking flips, so the team runs a small trial instead of deciding on a guess.
   Cues are spoken words (HEARD finds them in what Whisper heard). */
(() => {
  const CF = window.CF, K = CF.K, { seg } = K;
  const HEARD = (api, id) => {
    const sc = api.scene(id), nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, ''), heard = sc.concat || '', say = nm(sc.say || '');
    return (...alts) => { const a = alts.find((w) => heard.includes(nm(w))) || alts.find((w) => say.includes(nm(w))); return a ? api.T('w:' + a, id) : 0.5; };
  };
  const LAY = (W, H) => { const V = H > W; return V ? { V, W, H, tx: 80, tapeY: 262, ty: 372 } : { V, W, H, tx: 110, tapeY: 120, ty: 250 }; };
  const at = (x, y, e) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (e || '');
  const mid = (x, y, e) => at(x, y) + ' translate(-50%,-50%)' + (e || '');
  const q = (h, c) => h.querySelector(c);
  const fade = (el, k) => { el.style.opacity = (+el.style.opacity * (1 - k)).toFixed(2); };
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 800) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 60 : 58) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  // the three options left on the table in episode 15, the four criteria and the hypothetical scores (1–5; total = weighted sum, out of 5)
  const OPT = [
    { n: 'จองอาหาร<br>ล่วงหน้า', s: 'จองอาหารล่วงหน้า', c: '', sc: [4, 1, 5, 4], tot: '3.3' },
    { n: 'ชุดมื้อด่วน', s: 'ชุดมื้อด่วน', c: 'blue', sc: [4, 2, 3, 3], tot: '3.1' },
    { n: 'ส่งออฟฟิศ', s: 'ส่งไปย่านสำนักงาน', c: 'green', sc: [2, 5, 2, 3], tot: '3.0' },
  ];
  const CRIT = [['กำไร', '40'], ['ลูกค้าใหม่', '30'], ['ลงทุนน้อย', '20'], ['ครัวรับไหว', '10']];
  const BG = ['#FFF4E3', '#E3EEFB', '#E3F3EA'];

  // scoring table: rows 0 = header, 1–3 = options; columns 0 = option, 1–4 = criteria, 5 = weighted total. Cells are .<cls>-c<i>_<j>
  const tblHtml = (cls, L) => {
    const V = L.V, fs = V ? 26 : 34, cell = (i, j, inner, extra) => '<div class="' + cls + '-c' + i + '_' + j + '" style="display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;line-height:1.15;font-size:' + fs + 'px;' + (extra || '') + '">' + inner + '</div>';
    let h = '<div class="card ' + cls + '-t" style="width:' + (V ? 880 : 1700) + 'px;padding:10px;display:grid;grid-template-columns:' + (V ? '230px repeat(4,1fr) 120px' : '420px repeat(4,1fr) 220px') + ';grid-auto-rows:' + (V ? '104px' : '124px') + ';gap:6px;background:#fff">';
    h += cell(0, 0, '', '') + CRIT.map((c, k) => cell(0, k + 1, c[0] + '<br><span style="color:var(--main);font-size:' + (V ? 24 : 30) + 'px">' + c[1] + '%</span>')).join('') + cell(0, 5, 'รวม<br><span style="color:var(--ink2);font-size:' + (V ? 20 : 26) + 'px">เต็ม 5</span>');
    OPT.forEach((o, r) => { h += cell(r + 1, 0, o.n, 'background:' + BG[r] + ';border-radius:12px;font-size:' + (V ? 26 : 34) + 'px') + o.sc.map((v, k) => cell(r + 1, k + 1, '<span class="' + cls + '-v' + r + '_' + k + '">' + v + '</span>', 'font-size:' + (V ? 40 : 52) + 'px;border-radius:12px;background:#F6F2EA')).join('') + cell(r + 1, 5, '<span class="' + cls + '-tot' + r + '">' + o.tot + '</span>', 'font-size:' + (V ? 44 : 58) + 'px;border-radius:12px;background:#FFE680'); });
    return h + '</div>';
  };
  const tblEls = (host, cls) => { const m = {}; host.querySelectorAll('[class*="' + cls + '-c"]').forEach((e) => { m[e.className.match(/-c(\d+_\d+)/)[1]] = e; }); return m; };
  const tblPos = (L) => L.V ? { x: 40, y: 520 } : { x: 110, y: 330 };
  const setRow = (E, r, o) => { for (let j = 0; j <= 5; j++) E[r + '_' + j].style.opacity = o; };

  // =========================================================================================== hook: two people claim the win
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { a: T('ลูกค้าใหม่'), b: T('วัดกำไร', 'กำไร'), laugh: T('หัวเราะ'), three: T('สามใบ', 'กระดาษ'), count: T('นับคะแนน', 'เริ่มนับ'), what: T('แข่งเรื่องอะไร', 'เรื่องอะไร') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        '<p class="note pink hk-a" style="font-size:' + (V ? 40 : 46) + 'px">“ของผมชนะ<br>ถ้าวัดลูกค้าใหม่”</p><p class="note blue hk-b" style="font-size:' + (V ? 40 : 46) + 'px">“ของผมชนะ<br>ถ้าวัดกำไร”</p>' +
        '<p class="t hk-o" style="font-size:' + (V ? 120 : 150) + 'px">😄</p>' +
        OPT.map((o, i) => '<div class="note ' + o.c + ' hk-i' + i + '" style="font-size:' + (V ? 30 : 34) + 'px;width:' + (V ? 250 : 300) + 'px;text-align:center">' + o.s + '</div>').join('') +
        '<p class="sticker hk-s" style="font-size:' + (V ? 36 : 44) + 'px">นับคะแนน: ✓ ✓ ✓ ✓ …</p>' +
        '<p class="stamp hk-st" style="font-size:' + (V ? 48 : 64) + 'px">แข่งเรื่องอะไร?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), a: q(host, '.hk-a'), b: q(host, '.hk-b'), o: q(host, '.hk-o'), is: [0, 1, 2].map((i) => q(host, '.hk-i' + i)), s: q(host, '.hk-s'), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.a, t, 0.15, V ? mid(330, 500) : mid(520, 400), -3, 1.7);
      CF.slam(this.b, t, C.b - 0.5, V ? mid(750, 640) : mid(1250, 400), 3, 1.7);
      CF.pop(this.o, t, C.laugh - 0.3, undefined, V ? mid(540, 820) : mid(960, 620), 0);
      this.is.forEach((e, i) => CF.pop(e, t, C.three - 0.5 + i * 0.15, undefined, V ? mid(200 + i * 340, 1010) : mid(560 + i * 400, 840), [-2, 1, 2][i]));
      CF.pop(this.s, t, C.count - 0.3, undefined, V ? mid(540, 1170) : mid(960, 980), -2);
      CF.slam(this.st, t, C.what - 0.6, V ? mid(540, 1340) : mid(960, 560), -2, 1.7);
    },
  };

  // =========================================================================================== criteria: what are we measuring?
  CF.scenes.criteria = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'criteria');
      this.C = { o: [T('ใบแรก'), T('ใบที่สอง'), T('ใบที่สาม')], flip: T('คว่ำ'), ask: T('ต้องดูอะไร'), cr: [T('เหลือกำไร', 'อยากเหลือ'), T('ลูกค้าใหม่', 'อยากได้ลูกค้า'), T('เงินเริ่มต้น', 'ใช้เงิน'), T('ทันพักเที่ยง', 'ข้าวทัน')] };
      const CR = [['💰 กำไร', 'ครัวอยากได้'], ['🧑‍🤝‍🧑 ลูกค้าใหม่', 'หน้าร้านอยากได้'], ['🪙 เงินเริ่มต้นไหว', 'ทั้งคู่เห็นตรงกัน'], ['🍽️ โต๊ะในร้านยังทันพักเที่ยง', 'ทั้งคู่เห็นตรงกัน']];
      host.insertAdjacentHTML('beforeend', '<p class="pill cr-n" style="font-size:36px">ก่อนให้คะแนน</p>' +
        OPT.map((o, i) => '<div class="note ' + o.c + ' cr-i' + i + '" style="font-size:' + (V ? 30 : 36) + 'px;width:' + (V ? 260 : 340) + 'px;text-align:center"><span style="color:var(--ink2);font-size:' + (V ? 22 : 26) + 'px">ใบที่ ' + (i + 1) + '</span><br>' + o.s + '</div>').join('') +
        '<p class="sticker cr-q" style="font-size:' + (V ? 40 : 54) + 'px">ต้องดูอะไรกันแน่?</p>' +
        CR.map((c, k) => '<div class="card cr-k' + k + '" style="width:' + (V ? 880 : 760) + 'px;padding:10px 24px 14px"><p style="font-weight:700;font-size:' + (V ? 34 : 38) + 'px">' + c[0] + '</p><p style="font-weight:600;font-size:' + (V ? 24 : 26) + 'px;color:var(--ink2)">' + c[1] + '</p></div>').join(''));
      Object.assign(this, { n: q(host, '.cr-n'), is: [0, 1, 2].map((i) => q(host, '.cr-i' + i)), qq: q(host, '.cr-q'), ks: [0, 1, 2, 3].map((k) => q(host, '.cr-k' + k)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      this.is.forEach((e, i) => { CF.pop(e, t, C.o[i] - 0.4, undefined, V ? mid(210 + i * 330, 520) : mid(300 + i * 420, 400), [-2, 1, 2][i]); e.style.filter = 'none'; if (t > C.flip) { const k = seg(t, C.flip, C.flip + 0.4); e.style.opacity = (+e.style.opacity * (1 - 0.55 * k)).toFixed(2); } });
      CF.slam(this.qq, t, C.ask - 0.4, V ? mid(540, 700) : mid(1500, 400), -2, 1.5);
      this.ks.forEach((e, k) => CF.pop(e, t, C.cr[k] - 0.5, undefined, V ? mid(540, 830 + k * 150) : mid(960, 520 + k * 130), [-1, 1, -1, 1][k]));
    },
  };

  // =========================================================================================== weights (sum 100) and the 1–5 scale
  CF.scenes.weights = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'weights');
      this.C = { hund: T('ร้อยแต้ม', 'น้ำหนัก'), w: [T('ให้กำไร', 'กำไรสี่'), T('สามสิบ'), T('ยี่สิบ'), T('เบาภาระ', 'ภาระครัว')], five: T('ห้าคือ', 'ดีสุด'), less: T('ยิ่งน้อย', 'เงินลงทุนยิ่ง'), sep: T('แยกกัน', 'หนึ่งถึงห้า'), avg: T('เฉลี่ย'), guess: T('ใครกำลังเดา', 'กำลังเดา') };
      host.insertAdjacentHTML('beforeend', '<p class="pill wt-n" style="font-size:36px">น้ำหนักรวม = 100</p>' +
        CRIT.map((c, k) => '<div class="card wt-b' + k + '" style="width:' + (V ? 880 : 760) + 'px;padding:10px 22px 14px;background:#fff"><p style="font-weight:700;font-size:' + (V ? 32 : 36) + 'px">' + c[0] + ' <span style="color:var(--main)">' + c[1] + '</span></p><div style="height:' + (V ? 22 : 26) + 'px;border-radius:999px;background:#EEE6D6;margin-top:6px"><div class="wt-f' + k + '" style="height:100%;border-radius:999px;background:var(--main);width:0"></div></div></div>').join('') +
        '<p class="sticker wt-s" style="font-size:' + (V ? 34 : 40) + 'px">ให้คะแนน 1 – 5 · ห้า = ดีสุด</p>' +
        '<p class="note blue wt-l" style="font-size:' + (V ? 30 : 34) + 'px">ลงทุนยิ่งน้อย → คะแนนยิ่งสูง</p>' +
        '<p class="note green wt-a" style="font-size:' + (V ? 30 : 34) + 'px">ให้คะแนนแยกกันก่อน แล้วค่อยเฉลี่ย</p>' +
        '<p class="stamp wt-g" style="font-size:' + (V ? 36 : 44) + 'px">ตรงไหนที่ใครกำลังเดา?</p>');
      Object.assign(this, { n: q(host, '.wt-n'), bs: [0, 1, 2, 3].map((k) => q(host, '.wt-b' + k)), fs: [0, 1, 2, 3].map((k) => q(host, '.wt-f' + k)), s: q(host, '.wt-s'), l: q(host, '.wt-l'), a: q(host, '.wt-a'), g: q(host, '.wt-g') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, C.hund - 0.4, undefined, at(L.tx, L.ty - 10), -2);
      this.bs.forEach((e, k) => { CF.pop(e, t, C.w[k] - 0.4, undefined, V ? mid(540, 500 + k * 130) : mid(560, 380 + k * 130), [-1, 1, -1, 1][k]); this.fs[k].style.width = (seg(t, C.w[k] - 0.2, C.w[k] + 0.5) * +CRIT[k][1] * 2.4 + 0).toFixed(1) + '%'; });
      CF.pop(this.s, t, C.five - 0.5, undefined, V ? mid(540, 1090) : mid(1500, 420), -2);
      CF.pop(this.l, t, C.less - 0.5, undefined, V ? mid(540, 1200) : mid(1500, 580), 2);
      CF.pop(this.a, t, C.sep - 0.5, undefined, V ? mid(540, 1310) : mid(1500, 740), -2);
      CF.slam(this.g, t, C.guess - 0.7, V ? mid(540, 1440) : mid(1300, 930), -2, 1.5);
    },
  };

  // =========================================================================================== score: the table, row by row
  CF.scenes.score = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'score'); this.host = host;
      this.C = { first: T('แถวแรก'), four: T('ให้สี่', 'มีกำไรดี'), calc: T('หนึ่งจุดหก', 'คูณน้ำหนัก'), rest: T('อีกสามช่อง', 'ถ่วงน้ำหนัก'), t0: T('สามจุดสาม'), t1: T('สามจุดหนึ่ง', 'ชุดมื้อด่วน'), t2: T('สามจุดศูนย์', 'ส่งออฟฟิศ'), name: T('ตารางตัดสินใจ', 'วิธีใช้') };
      host.insertAdjacentHTML('beforeend', '<p class="pill sc-n" style="font-size:36px">Weighted Decision Matrix</p>' + tblHtml('sc', L) +
        '<p class="sticker sc-k" style="font-size:' + (V ? 34 : 44) + 'px">4 × 40% = 1.6 แต้ม</p>' +
        '<p class="stamp green sc-w" style="font-size:' + (V ? 34 : 46) + 'px;white-space:normal;width:' + (V ? 900 : 1200) + 'px;text-align:center">คะแนน × น้ำหนัก แล้วรวมกัน</p>');
      this.E = tblEls(host, 'sc');
      Object.assign(this, { n: q(host, '.sc-n'), tbl: q(host, '.sc-t'), k: q(host, '.sc-k'), w: q(host, '.sc-w') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, E = this.E, P = tblPos(L);
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.pop(this.tbl, t, 0.3, undefined, at(P.x, P.y), 0);
      // header + option names at once; each option's scores arrive with the words, totals at the numbers said
      for (let j = 0; j <= 5; j++) E['0_' + j].style.opacity = 1;
      for (let r = 1; r <= 3; r++) E[r + '_0'].style.opacity = 1;
      const when = [C.first - 0.3, C.t1 - 1.6, C.t2 - 1.6], tot = [C.t0 - 0.2, C.t1 - 0.2, C.t2 - 0.2];
      for (let r = 1; r <= 3; r++) {
        for (let j = 1; j <= 4; j++) E[r + '_' + j].style.opacity = seg(t, when[r - 1] + (j - 1) * 0.12, when[r - 1] + (j - 1) * 0.12 + 0.2).toFixed(2);
        E[r + '_5'].style.opacity = seg(t, tot[r - 1], tot[r - 1] + 0.25).toFixed(2);
      }
      const ky = V ? 1130 : 940;
      CF.pop(this.k, t, C.calc - 0.5, C.rest + 0.2, mid(540 + (V ? 0 : 420), ky), -2);
      CF.slam(this.w, t, C.name - 0.4, V ? mid(540, 1290) : mid(960, 960), -2, 1.5);
      // the winning row gets a ring once its total is read
      const ring = seg(t, C.t2 + 0.6, C.t2 + 1.0);
      E['1_5'].style.boxShadow = ring > 0.5 ? '0 0 0 6px var(--d)' : '';
    },
  };

  // =========================================================================================== test: change one assumption, the ranking flips
  CF.scenes.test = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'test'); this.host = host;
      this.C = { q: T('กำไรสี่นี่', 'รู้จริงหรือยัง'), three: T('จากสี่เป็นสาม', 'ลดคะแนน'), nine: T('สองจุดเก้า', 'ตกเหลือ'), lead: T('ขึ้นนำ', 'ชุดมื้อด่วนขึ้น'), quiet: T('ทั้งโต๊ะเงียบ', 'เงียบ'), real: T('มารับจริง') };
      host.insertAdjacentHTML('beforeend', '<p class="pill ts-n" style="font-size:36px">ลองเปลี่ยนสมมติฐานเดียว</p>' + tblHtml('ts', L) +
        '<p class="note pink ts-q" style="font-size:' + (V ? 34 : 42) + 'px">กำไรสี่นี่… รู้จริงหรือยังว่า<br>จองแล้วมารับครบ?</p>' +
        '<p class="sticker ts-d" style="font-size:' + (V ? 34 : 42) + 'px">กำไรของ “จองอาหารล่วงหน้า” 4 → 3</p>' +
        '<p class="stamp ts-u" style="font-size:' + (V ? 44 : 56) + 'px">มารับจริง?</p>' +
        '<p class="pill ts-1" style="font-size:' + (V ? 32 : 36) + 'px;background:var(--d)">ขึ้นนำทันที</p>');
      this.E = tblEls(host, 'ts');
      Object.assign(this, { n: q(host, '.ts-n'), tbl: q(host, '.ts-t'), qq: q(host, '.ts-q'), d: q(host, '.ts-d'), u: q(host, '.ts-u'), one: q(host, '.ts-1'), v00: q(host, '.ts-v0_0'), tot0: q(host, '.ts-tot0') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, E = this.E, P = tblPos(L);
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.pop(this.tbl, t, 0.2, undefined, at(P.x, P.y), 0);
      for (const k of Object.keys(E)) E[k].style.opacity = 1;
      CF.pop(this.qq, t, C.q - 0.4, undefined, V ? mid(540, 1150) : mid(1450, 910), -2);
      CF.pop(this.d, t, C.three - 0.4, undefined, V ? mid(540, 1290) : mid(560, 910), 2);
      const k = seg(t, C.three, C.three + 0.3);                      // profit 4 → 3 for the first option
      this.v00.textContent = k > 0.5 ? '3' : '4'; E['1_1'].style.background = k > 0.5 ? '#F7C6BD' : '#F6F2EA';
      const k2 = seg(t, C.nine, C.nine + 0.3); this.tot0.textContent = k2 > 0.5 ? '2.9' : '3.3'; E['1_5'].style.background = k2 > 0.5 ? '#F7C6BD' : '#FFE680';
      const k3 = seg(t, C.lead, C.lead + 0.3); E['2_5'].style.boxShadow = k3 > 0.5 ? '0 0 0 6px var(--d)' : '';
      CF.pop(this.one, t, C.lead - 0.2, undefined, V ? mid(540, 1000) : mid(1500, 700), -2);
      CF.slam(this.u, t, C.real - 0.5, V ? mid(540, 1420) : mid(1450, 990), -3, 1.7);
    },
  };

  // =========================================================================================== close: run a small trial first
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { trial: T('ทดลอง'), small: T('วงเล็ก'), got: T('ที่มารับ', 'ยอดที่'), left: T('ของเหลือ'), prof: T('กำไรต่อจาน', 'ต่อจาน'), again: T('ให้คะแนนใหม่', 'คะแนนใหม่'), ann: T('ประกาศ', 'เปิดรับจอง'), hand: T('ยกมือ'), pre: T('ไปไม่รอด', 'ก่อนเปิด'), five: T('ห้านาที'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend', '<p class="pill cl-t" style="font-size:' + (V ? 34 : 36) + 'px">ทดลองก่อน · วงเล็ก</p>' +
        ['📥 ยอดที่มารับจริง', '♻️ ของเหลือ', '💰 กำไรต่อจาน'].map((s, k) => '<p class="sticker cl-m' + k + '" style="font-size:' + (V ? 34 : 42) + 'px">' + s + '</p>').join('') +
        '<p class="note green cl-r" style="font-size:' + (V ? 34 : 40) + 'px">🔁 เอากลับมาให้คะแนนใหม่</p>' +
        '<p class="note cl-a" style="font-size:' + (V ? 34 : 40) + 'px">📣 กำลังจะประกาศเปิดรับจอง…</p>' +
        '<p class="sticker cl-h" style="font-size:' + (V ? 36 : 46) + 'px;white-space:normal;width:' + (V ? 860 : 1100) + 'px;text-align:center">✋ “ก่อนเปิด… ขอลองคิดตอนไปไม่รอด สักห้านาทีได้ไหม?”</p>' +
        nextCard(V, 'cl-next', 'Pre-mortem', 'คิดย้อนจากวันที่มัน “ไปไม่รอด” ก่อนเริ่มจริง') + siteBlock(V, 'Decision Analysis / Multi-Criteria Decision Making'));
      Object.assign(this, { t: q(host, '.cl-t'), ms: [0, 1, 2].map((k) => q(host, '.cl-m' + k)), r: q(host, '.cl-r'), a: q(host, '.cl-a'), h: q(host, '.cl-h'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.see - 0.3;
      CF.pop(this.t, t, C.trial - 0.4, out, at(L.tx, L.ty - 10), -2);
      const MP = V ? [[540, 520], [540, 650], [540, 780]] : [[620, 380], [620, 520], [620, 660]];
      [C.got, C.left, C.prof].forEach((c0, k) => CF.pop(this.ms[k], t, c0 - 0.4, out, mid(MP[k][0], MP[k][1]), [-2, 2, -1][k]));
      CF.pop(this.r, t, C.again - 0.4, out, V ? mid(540, 930) : mid(1380, 520), 2);
      CF.pop(this.a, t, C.ann - 0.5, out, V ? mid(540, 1060) : mid(1380, 700), -2);
      CF.slam(this.h, t, C.hand - 0.4, out, V ? mid(540, 1250) : mid(960, 890), -2, 1.5);
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.see - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
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
