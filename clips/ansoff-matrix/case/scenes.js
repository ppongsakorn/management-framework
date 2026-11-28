/* Ansoff Matrix, episode 15 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from
   scene-local time only, same look and helpers (cf.js) as episodes 4–14. Four growth ideas land one by one as sticky
   notes, then fall into the 2×2 (products as rows, markets as columns); the last scene parks the riskiest card and asks
   which of the other three to pick first. Cues are spoken words (HEARD finds them in what Whisper heard). */
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
  const slamO = (el, t, t0, out, base, rot, from) => { CF.slam(el, t, t0, base, rot, from); fade(el, seg(t, out, out + 0.25)); };
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 800) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 56 : 54) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  // the four growth ideas (rows = product, columns = market)
  const IDEA = [
    { n: '①', c: '', pos: 'ของเดิม × ลูกค้าเดิม', t: 'เปิดให้จองอาหารเดิมล่วงหน้า', s: 'จองอาหารล่วงหน้า', en: 'Market Penetration', th: 'เจาะตลาดเดิม', proof: 'คนจองจะมารับจริงไหม?' },
    { n: '②', c: 'blue', pos: 'สินค้าใหม่ × ลูกค้าเดิม', t: 'ชุดมื้อด่วน', s: 'ชุดมื้อด่วน', en: 'Product Development', th: 'พัฒนาสินค้า', proof: 'ทันพักเที่ยงสั้นไหม?' },
    { n: '③', c: 'green', pos: 'เมนูเดิม × ตลาดใหม่', t: 'ส่งอาหารเดิมให้คนทำงานย่านสำนักงาน', s: 'ส่งย่านสำนักงาน', en: 'Market Development', th: 'ขยายตลาด', proof: 'คนย่านนั้นอยากสั่งไหม?' },
    { n: '④', c: 'pink', pos: 'สินค้าใหม่ × ตลาดใหม่', t: 'ชุดอาหารพร้อมปรุง สำหรับคนทำอาหารเอง', s: 'ชุดอาหารพร้อมปรุง', en: 'Diversification', th: 'กระจายธุรกิจ', proof: 'ต้องลองทั้งสูตร แพ็ก และหาคนซื้อ' },
  ];
  const ideaHtml = (cls, i, L) => '<div class="note ' + IDEA[i].c + ' ' + cls + '" style="width:' + (L.V ? 800 : 640) + 'px"><p style="font-size:' + (L.V ? 26 : 28) + 'px;color:var(--ink2)">' + IDEA[i].n + ' ' + IDEA[i].pos + '</p><p style="font-size:' + (L.V ? 38 : 42) + 'px">' + IDEA[i].t + '</p></div>';

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { ppl: T('คนเดินเยอะ', 'เดินเยอะ'), eat: T('เรียงกัน', 'เต็มถนน'), rent: T('ค่าเช่า', 'เริ่มนับ'), none: T('ยังไม่มีใคร', 'รับปาก') };
      const N = [['🚶 คนเดินเยอะ', ''], ['🏬 ร้านอาหารเรียงเต็มถนน', 'pink'], ['💸 ค่าเช่านับตั้งแต่วันเซ็น', 'blue'], ['🙋 ลูกค้า… ยังไม่มีใครรับปาก', 'green']];
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + '<p class="t hk-shop" style="font-size:' + (V ? 130 : 160) + 'px">🏪</p>' +
        '<p class="sticker hk-q" style="font-size:' + (V ? 46 : 62) + 'px">ถ้าไม่เช่าที่นี่… จะโตยังไง?</p>' +
        '<div class="card hk-paper" style="width:' + (V ? 560 : 520) + 'px;padding:14px 24px 18px;background:#FFF4E3"><p style="font-weight:700;font-size:30px;color:var(--ink2)">ใบเสนอราคา</p><p style="font-weight:700;font-size:' + (V ? 40 : 42) + 'px">ค่าเช่า เริ่มนับวันที่เซ็น</p></div>' +
        N.map(([s, c], i) => '<p class="note ' + c + ' hk-n' + i + '" style="font-size:' + (V ? 34 : 38) + 'px">' + s + '</p>').join(''));
      Object.assign(this, { tape: q(host, '.hk-tape'), shop: q(host, '.hk-shop'), qq: q(host, '.hk-q'), paper: q(host, '.hk-paper'), ns: [0, 1, 2, 3].map((i) => q(host, '.hk-n' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.qq, t, 0.2, V ? mid(540, 480) : mid(1080, 330), -2, 1.7);
      CF.pop(this.shop, t, 0.5, undefined, V ? mid(280, 720) : mid(330, 600));
      CF.pop(this.paper, t, 1.6, undefined, V ? mid(700, 720) : mid(1000, 560), 2);
      const P = V ? [[540, 930], [540, 1060], [540, 1190], [540, 1320]] : [[1500, 520], [1480, 650], [1380, 790], [1340, 930]];
      [C.ppl, C.eat, C.rent, C.none].forEach((c0, i) => CF.pop(this.ns[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-2, 2, -1, 2][i]));
    },
  };

  // =========================================================================================== idea scenes: fish / lunch / market
  const EX = {
    again: { lab: 'ไอเดียที่ 1', em: '📅', quote: '“ลูกค้าโต๊ะริมหน้าต่างอยากมากินบ่อยกว่านี้ แต่พักเที่ยงสั้น”', qc: ['ริมหน้าต่าง', 'โต๊ะริมหน้าต่าง'],
      chips: [['⏱️ พักเที่ยงสั้น', ['พักเที่ยงสั้น', 'พักเที่ยง']], ['📝 จองอาหารก่อนมาถึง', ['จองอาหาร', 'ก่อนมาถึง']]], ideas: [[0, ['ของเดิม', 'ลูกค้าเดิม']]], prev: [],
      rule: 'ให้คนที่ชอบเราอยู่แล้ว กลับมากินบ่อยขึ้น', rc: ['บ่อยขึ้น', 'กลับมากิน'] },
    lunch: { lab: 'ไอเดียที่ 2', em: '⏱️', quote: '“ลูกค้าประจำพักเที่ยงสั้น มาทีไรต้องรีบกลับทุกที”', qc: ['พักเที่ยง', 'เที่ยงสั้น'],
      chips: [['🏃 รีบกลับทุกที', ['รีบกลับ', 'ทุกที']], ['⚡ ชุดมื้อด่วน', ['ชุดมื้อด่วน', 'มื้อด่วน']]], ideas: [[1, ['จดอีกใบ', 'อีกใบ']]], prev: [0],
      rule: 'โต = ทำงานคนละอย่าง', rc: ['คนละอย่าง', 'คำเดียว'] },
    market: { lab: 'ไอเดียที่ 3–4', em: '🛵', quote: '“ส่งอาหารที่ร้านขายอยู่แล้ว ให้พนักงานในย่านที่เราเพิ่งไปดู”', qc: ['ย่านที่เราเพิ่ง', 'พนักงานในย่าน'],
      chips: [['🤔 คนย่านนั้นอยากสั่งไหม?', ['อยากสั่งไหม', 'ต้องพิสูจน์']]], ideas: [[2, ['กลุ่มใหม่', 'ลูกค้าเป็นกลุ่มใหม่']], [3, ['อาหารพร้อมปรุง', 'พร้อมปรุง']]], prev: [0, 1],
      rule: 'ชุดอาหารพร้อมปรุง = ใหม่ทั้งของที่ขาย และคนที่ซื้อ', rc: ['ใหม่พร้อมกัน', 'ทั้งสองด้าน'] },
  };
  const ideaScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), X = EX[id]; this.X = X;
      this.C = { quote: T(...X.qc), chips: X.chips.map((c) => T(...c[1])), ideas: X.ideas.map((c) => T(...c[1])), rule: T(...X.rc) };
      host.insertAdjacentHTML('beforeend', '<p class="pill ' + id + '-n" style="font-size:36px">' + X.lab + '</p>' +
        '<div class="card ' + id + '-q" style="width:' + (V ? 880 : 820) + 'px;padding:18px 28px 22px"><p style="font-weight:700;font-size:' + (V ? 36 : 38) + 'px;line-height:1.35;white-space:normal">' + X.quote + '</p></div>' +
        '<p class="t ' + id + '-em" style="font-size:' + (V ? 150 : 190) + 'px">' + X.em + '</p>' +
        X.prev.map((p, k) => '<p class="pill ' + id + '-p' + k + '" style="font-size:' + (V ? 26 : 28) + 'px;background:var(--ink2)">' + IDEA[p].n + ' ' + IDEA[p].s + '</p>').join('') +
        X.chips.map((c, k) => '<p class="sticker ' + id + '-c' + k + '" style="font-size:' + (V ? 32 : 36) + 'px">' + c[0] + '</p>').join('') +
        X.ideas.map((c, k) => ideaHtml(id + '-i' + k, c[0], L)).join('') +
        '<p class="stamp green ' + id + '-r" style="font-size:' + (V ? 36 : 40) + 'px;white-space:normal;width:' + (V ? 900 : 1500) + 'px;text-align:center">' + X.rule + '</p>');
      Object.assign(this, { n: q(host, '.' + id + '-n'), qq: q(host, '.' + id + '-q'), em: q(host, '.' + id + '-em'), ps: X.prev.map((_, k) => q(host, '.' + id + '-p' + k)), cs: X.chips.map((_, k) => q(host, '.' + id + '-c' + k)), is: X.ideas.map((_, k) => q(host, '.' + id + '-i' + k)), r: q(host, '.' + id + '-r') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, X = this.X;
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      this.ps.forEach((e, k) => CF.pop(e, t, 0.3 + k * 0.1, undefined, V ? at(L.tx + 380 + k * 250, L.ty - 8) : at(L.tx + 330 + k * 280, L.ty - 6), 0));
      CF.pop(this.qq, t, C.quote - 0.5, undefined, V ? at(L.tx, 450) : at(L.tx, 340), -1);
      CF.pop(this.em, t, C.quote - 0.2, undefined, V ? mid(540, 780) : mid(1500, 400), 4);
      const CP = V ? [[540, 910], [540, 1020]] : [[430, 600], [430, 700]];
      this.cs.forEach((e, k) => CF.pop(e, t, C.chips[k] - 0.4, undefined, mid(CP[k][0], CP[k][1]), [-2, 2][k]));
      const IP = V ? [[540, 1160], [540, 1290]] : [[1420, 590], [1420, 780]];
      this.is.forEach((e, k) => CF.pop(e, t, C.ideas[k] - 0.4, undefined, mid(IP[k][0], IP[k][1]), [-2, 2][k]));
      CF.slam(this.r, t, C.rule - 0.5, V ? mid(540, X.ideas.length > 1 ? 1440 : 1380) : mid(960, 960), -2, 1.5);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = ideaScene(id);

  // =========================================================================================== the matrix
  CF.scenes.matrix = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'matrix');
      this.C = { what: T('ขายอะไร'), who: T('ขายให้ใคร'), four: T('สี่ใบ', 'กระดาษ'), name: T('แอนซอฟฟ์', 'เมทริกซ์'), proof: T('หลักฐาน', 'วงสิ่งที่') };
      const cw = V ? 340 : 400, ch = V ? 300 : 270;
      host.insertAdjacentHTML('beforeend', '<p class="pill mx-n" style="font-size:36px">ไอเดียโต 4 แบบ</p>' +
        '<p class="t red mx-name" style="font-size:' + (V ? 96 : 120) + 'px;line-height:1.05">' + (V ? 'Ansoff Matrix' : 'Ansoff<br>Matrix') + '</p>' +
        '<p class="t mute mx-sub" style="font-size:' + (V ? 36 : 44) + 'px">ขายอะไร × ขายให้ใคร</p>' +
        '<p class="t mx-r0" style="font-size:' + (V ? 28 : 34) + 'px">เมนูเดิม</p><p class="t mx-r1" style="font-size:' + (V ? 28 : 34) + 'px">สินค้าใหม่</p>' +
        '<p class="t mx-c0" style="font-size:' + (V ? 30 : 34) + 'px">ลูกค้าเดิม</p><p class="t mx-c1" style="font-size:' + (V ? 30 : 34) + 'px">ตลาดใหม่</p>' +
        // cell order: 0 = row0 col0, 1 = row1 col0, 2 = row0 col1, 3 = row1 col1
        IDEA.map((d, i) => '<div class="card mx-k' + i + '" style="width:' + cw + 'px;height:' + ch + 'px;padding:12px 16px;background:' + ['#FFF4E3', '#E3EEFB', '#E3F3EA', '#FBE6E1'][i] + '"><p style="font-weight:600;font-size:' + (V ? 20 : 22) + 'px;color:var(--ink2)">' + d.en + '</p><p style="font-weight:700;font-size:' + (V ? 32 : 36) + 'px;line-height:1.15">' + d.n + ' ' + d.th + '</p><p style="font-weight:600;font-size:' + (V ? 26 : 28) + 'px;line-height:1.25">' + d.s + '</p>' +
          '<p class="mx-p' + i + '" style="position:absolute;left:12px;right:12px;bottom:10px;font-weight:700;font-size:' + (V ? 22 : 24) + 'px;line-height:1.2;color:var(--main);border:4px dashed var(--main);border-radius:14px;padding:2px 10px 6px;opacity:0">🔍 ' + d.proof + '</p></div>').join(''));
      Object.assign(this, { n: q(host, '.mx-n'), nm: q(host, '.mx-name'), sub: q(host, '.mx-sub'), r: [0, 1].map((i) => q(host, '.mx-r' + i)), c: [0, 1].map((i) => q(host, '.mx-c' + i)), k: [0, 1, 2, 3].map((i) => q(host, '.mx-k' + i)), p: [0, 1, 2, 3].map((i) => q(host, '.mx-p' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, cw = V ? 340 : 400, ch = V ? 300 : 270;
      const gx = V ? 190 : 1010, gy = V ? 640 : 360, gap = 20;
      const cell = (i) => { const row = [0, 1, 0, 1][i], col = [0, 0, 1, 1][i]; return [gx + col * (cw + gap) + cw / 2, gy + row * (ch + gap) + ch / 2]; };
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.slam(this.nm, t, C.name - 0.1, V ? at(L.tx, 430) : at(L.tx, 340), -2, 1.5);
      CF.pop(this.sub, t, C.name + 0.5, undefined, V ? at(L.tx, 590 - 70 + 0) : at(L.tx, 580));
      this.sub.style.display = V ? 'none' : '';
      CF.pop(this.r[0], t, C.what - 0.3, undefined, V ? mid(130, cell(0)[1]) : mid(gx - 110, cell(0)[1]));
      CF.pop(this.r[1], t, C.what - 0.2, undefined, V ? mid(130, cell(1)[1]) : mid(gx - 110, cell(1)[1]));
      CF.pop(this.c[0], t, C.who - 0.3, undefined, mid(gx + cw / 2, gy - 36));
      CF.pop(this.c[1], t, C.who - 0.2, undefined, mid(gx + cw + gap + cw / 2, gy - 36));
      this.k.forEach((e, i) => { const t0 = V ? C.four - 0.4 + i * 0.45 : C.four - 0.4; CF.pop(e, t, t0, undefined, mid(cell(i)[0], cell(i)[1]), [-1, 1, 1, -1][i]); });
      this.p.forEach((e, i) => { e.style.opacity = seg(t, C.proof - 0.2 + i * 0.25, C.proof + 0.1 + i * 0.25).toFixed(2); });
    },
  };

  // =========================================================================================== close: park the risky card, pick one
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close'); this.host = host;
      this.C = { back: T('ชุดพร้อมปรุงกลับมา', 'พร้อมปรุง'), a: T('ทั้งสูตร', 'สูตร'), b: T('ทั้งแพ็ก', 'แพ็ก'), c: T('หาคนซื้อ', 'คนซื้อ'), park: T('พักไว้ก่อน', 'ขอพัก'), three: T('สามใบ'), ask: T('ถ้าลองได้ทีละอย่าง', 'ทีละอย่าง'), which: T('ควรหยิบใบไหน', 'ใบไหนก่อน'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend', '<p class="pill cl-t" style="font-size:' + (V ? 34 : 36) + 'px">บนโต๊ะ ตอนนี้</p>' +
        IDEA.map((d, i) => '<div class="note ' + d.c + ' cl-i' + i + '" style="width:' + (V ? 400 : 380) + 'px;text-align:center"><p style="font-size:' + (V ? 24 : 26) + 'px;color:var(--ink2)">' + d.n + '</p><p style="font-size:' + (V ? 32 : 34) + 'px">' + d.s + '</p></div>').join('') +
        '<p class="stamp cl-pk" style="font-size:' + (V ? 40 : 44) + 'px">พักไว้ก่อน</p>' +
        ['สูตร', 'แพ็ก', 'หาคนซื้อ'].map((s, k) => '<p class="sticker cl-w' + k + '" style="font-size:' + (V ? 34 : 40) + 'px">' + s + '</p>').join('') +
        '<p class="sticker cl-ask" style="font-size:' + (V ? 40 : 56) + 'px;white-space:normal;width:' + (V ? 880 : 1300) + 'px;text-align:center">ลองได้ทีละอย่าง… ควรหยิบใบไหนก่อน?</p>' +
        nextCard(V, 'cl-next', 'Weighted Decision Matrix', 'เลือกทีละใบ ด้วยคะแนนที่ตกลงกันก่อน') + siteBlock(V, 'Strategic Planning · Igor Ansoff'));
      Object.assign(this, { t: q(host, '.cl-t'), is: [0, 1, 2, 3].map((i) => q(host, '.cl-i' + i)), pk: q(host, '.cl-pk'), ws: [0, 1, 2].map((k) => q(host, '.cl-w' + k)), ask: q(host, '.cl-ask'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.see - 0.3;
      CF.pop(this.t, t, 0.1, out, at(L.tx, L.ty - 10), -2);
      const P = V ? [[290, 560], [790, 560], [290, 720], [790, 720]] : [[420, 400], [830, 400], [1240, 400], [1650, 400]];
      this.is.forEach((e, i) => { CF.pop(e, t, 0.2 + i * 0.12, out, mid(P[i][0], P[i][1]), [-2, 2, -1, 2][i]); });
      // the fourth card is parked: it slides away and dims once "พักไว้ก่อน" is said, leaving three
      const pk = seg(t, C.park - 0.2, C.park + 0.5);
      this.is[3].style.opacity = (+this.is[3].style.opacity * (1 - 0.65 * pk)).toFixed(2);
      slamO(this.pk, t, C.park - 0.3, out, V ? mid(790, 720) : mid(1650, 400), -8, 1.6);
      const WP = V ? [[290, 880], [540, 880], [790, 880]] : [[700, 640], [1010, 640], [1320, 640]];
      [C.a, C.b, C.c].forEach((c0, k) => CF.pop(this.ws[k], t, c0 - 0.3, C.which - 0.5, mid(WP[k][0], WP[k][1]), [-2, 2, -1][k]));
      slamO(this.ask, t, C.which - 0.6, out, V ? mid(540, 1120) : mid(960, 800), -2, 1.5);
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
