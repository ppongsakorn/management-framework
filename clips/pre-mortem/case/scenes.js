/* Pre-mortem, episode 17 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from
   scene-local time only, same look and helpers (cf.js) as episodes 4–16. Before the pre-booking button goes live the team
   imagines it failed six months from now, writes causes in silence, reads them out without arguing, votes the three that
   hurt most and gives each an owner and a first move. The last frame is an empty table waiting for day-one data: no sales
   figures, no trial result, no next-episode title. Cues are spoken words (HEARD finds them in what Whisper heard). */
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
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';
  const phone = (cls, V, inner) => '<div class="card ' + cls + '" style="width:' + (V ? 400 : 380) + 'px;padding:18px 22px 24px;background:#fff;text-align:center">' + inner + '</div>';
  const btn = (txt, V) => '<p style="display:inline-block;margin-top:10px;padding:6px 26px 12px;border-radius:16px;background:var(--main);color:#fff;font-weight:700;font-size:' + (V ? 34 : 34) + 'px">' + txt + '</p>';

  // the three risks, owners and first moves (same wording as the web table)
  const RISK = [
    { t: 'จองแล้วไม่มารับ', w: 'ยอดจอง เทียบ ยอดรับจริง + ของเหลือ', o: 'หน้าร้านยืนยันเวลารับก่อนแจ้งครัว', c: 'pink' },
    { t: 'รับพร้อมกันจนโต๊ะในร้านรอ', w: 'เวลารอ เทียบเกณฑ์ที่ตกลงไว้', o: 'หัวหน้าครัวแบ่งรอบ · หยุดเพิ่มยอดรอบที่เต็ม', c: 'blue' },
    { t: 'ราคาวัตถุดิบสูงจนกำไรหาย', w: 'ต้นทุนล่าสุด + กำไรต่อจาน', o: 'ฝ่ายจัดซื้อเช็กก่อนเปิดจอง · แจ้งเจ้าของร้านเมื่อต่ำกว่าเกณฑ์', c: 'green' },
  ];

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { full: T('ยอดจองเต็ม', 'จองเต็ม'), loss: T('ขาดทุน'), stop: T('ชะงัก'), btn: T('ปุ่มเปิดรับจอง', 'เปิดรับจอง'), six: T('หกเดือน', 'อีกหก'), quit: T('เลิกรับจอง', 'เลิกไปแล้ว'), most: T('อยากเลิกที่สุด', 'ที่สุด') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        '<p class="sticker hk-q" style="font-size:' + (V ? 42 : 60) + 'px">ยอดจองเต็ม แต่ร้านขาดทุน…?</p>' +
        '<p class="t hk-d" style="font-size:' + (V ? 110 : 130) + 'px">📉</p>' +
        phone('hk-p', V, '<p style="font-weight:600;font-size:26px;color:var(--ink2)">รับจองอาหารล่วงหน้า</p>' + btn('เปิดรับจอง', V)) +
        '<p class="t hk-f" style="font-size:' + (V ? 90 : 110) + 'px">☝️</p>' +
        '<p class="note blue hk-s" style="font-size:' + (V ? 36 : 42) + 'px">“สมมตินะพี่ อีก 6 เดือน<br>เราเลิกรับจองไปแล้ว”</p>' +
        '<p class="stamp hk-st" style="font-size:' + (V ? 40 : 52) + 'px;white-space:normal;width:' + (V ? 900 : 1100) + 'px;text-align:center">วันไหนที่เราอยากเลิกที่สุด?</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), qq: q(host, '.hk-q'), d: q(host, '.hk-d'), p: q(host, '.hk-p'), f: q(host, '.hk-f'), s: q(host, '.hk-s'), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.qq, t, 0.2, V ? mid(540, 480) : mid(1000, 330), -2, 1.7);
      CF.pop(this.d, t, C.loss - 0.3, undefined, V ? mid(830, 640) : mid(1560, 560), 6);
      CF.pop(this.p, t, C.stop - 0.4, undefined, V ? mid(380, 790) : mid(560, 640), -2);
      CF.pop(this.f, t, C.btn - 0.3, undefined, (V ? mid(470, 880) : mid(640, 740)) + ' translateY(' + (Math.sin(t * 5) * 6).toFixed(1) + 'px)', 0);
      CF.pop(this.s, t, C.six - 0.5, undefined, V ? mid(540, 1080) : mid(1360, 600), 2);
      CF.slam(this.st, t, C.most - 0.6, V ? mid(540, 1300) : mid(1000, 880), -2, 1.6);
    },
  };

  // =========================================================================================== silent writing
  CF.scenes.silent = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'silent');
      this.C = { mid: T('กลางโต๊ะ'), ppl: [T('คนรับจอง'), T('จัดซื้อ'), T('คนทำอาหาร')], half: T('ครึ่งชั่วโมง'), five: T('ห้านาที'), three: T('สามสาเหตุ'), spoil: T('เฉลยก่อน'), fold: T('พับกระดาษ', 'เก็บเอา') };
      const PPL = [['🧾', 'คนรับจอง'], ['📦', 'ฝ่ายจัดซื้อ'], ['👩‍🍳', 'คนทำอาหาร']];
      host.insertAdjacentHTML('beforeend', '<p class="pill sl-n" style="font-size:36px">ก่อนเปิดรับจอง</p>' +
        PPL.map(([e, n], i) => '<div class="card sl-p' + i + '" style="width:' + (V ? 270 : 330) + 'px;padding:10px 12px 14px;text-align:center"><p style="font-size:' + (V ? 70 : 84) + 'px;line-height:1.1">' + e + '</p><p style="font-weight:700;font-size:' + (V ? 30 : 34) + 'px">' + n + '</p></div>').join('') +
        '<p class="sticker sl-h" style="font-size:' + (V ? 40 : 50) + 'px">⏱️ ครึ่งชั่วโมง</p>' +
        '<p class="note sl-w" style="font-size:' + (V ? 34 : 40) + 'px">🤫 เขียนเงียบ ๆ 5 นาที<br>คนละ 3 สาเหตุ</p>' +
        '<p class="stamp sl-x" style="font-size:' + (V ? 40 : 50) + 'px;white-space:normal;width:' + (V ? 900 : 1100) + 'px;text-align:center">เจ้าของร้านเฉลยก่อน → คนอื่นพับกระดาษเก็บ</p>');
      Object.assign(this, { n: q(host, '.sl-n'), ps: [0, 1, 2].map((i) => q(host, '.sl-p' + i)), h: q(host, '.sl-h'), w: q(host, '.sl-w'), x: q(host, '.sl-x') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, C.mid - 0.4, undefined, at(L.tx, L.ty - 10), -2);
      this.ps.forEach((e, i) => CF.pop(e, t, C.ppl[i] - 0.5, undefined, V ? mid(200 + i * 340, 560) : mid(340 + i * 400, 440), [-2, 1, 2][i]));
      CF.slam(this.h, t, C.half - 0.5, V ? mid(540, 800) : mid(560, 690), -2, 1.5);
      CF.pop(this.w, t, C.five - 0.5, undefined, V ? mid(540, 960) : mid(1420, 690), 2);
      CF.slam(this.x, t, C.spoil - 0.6, V ? mid(540, 1230) : mid(960, 900), -2, 1.5);
    },
  };

  // =========================================================================================== read out loud, no arguing
  CF.scenes.reasons = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'reasons');
      this.C = { read: T('ทีละข้อ', 'ผลัดกันอ่าน'), calm: T('ยังไม่เถียง'), a: T('ฝนตก', 'หน้าร้าน'), a2: T('ขายใครล่ะ'), b: T('เที่ยงสิบห้า', 'มาพร้อมกัน'), b2: T('ไม่ได้กิน', 'สักที'), c: T('ขายหมดจริง', 'ใบสุดท้าย'), c2: T('ราคาเดิม', 'ราคาขึ้น') };
      const R = [['หน้าร้าน', '“จองหมด… แต่พอฝนตก คนไม่มารับ”', 'อาหารที่เตรียมแล้ว ขายใครล่ะ?', 'pink'], ['ครัว', '“คนมาครบ… แต่มาพร้อมกันตอน 12:15”', 'โต๊ะที่รออยู่เลยไม่ได้กิน', 'blue'], ['ฝ่ายจัดซื้อ', '“ขายหมดจริง… แต่วัตถุดิบรอบนั้นราคาขึ้น”', 'เรายังขายราคาเดิม', 'green']];
      host.insertAdjacentHTML('beforeend', '<p class="pill rs-n" style="font-size:36px">วนอ่านทีละใบ</p>' +
        R.map((r, k) => '<div class="note ' + r[3] + ' rs-r' + k + '" style="width:' + (V ? 880 : 900) + 'px"><p style="font-size:' + (V ? 26 : 28) + 'px;color:var(--ink2)">' + r[0] + '</p><p style="font-size:' + (V ? 34 : 38) + 'px">' + r[1] + '</p><p class="rs-e' + k + '" style="font-size:' + (V ? 32 : 36) + 'px;color:var(--main);opacity:0">→ ' + r[2] + '</p></div>').join('') +
        '<p class="stamp green rs-c" style="font-size:' + (V ? 40 : 50) + 'px">ยังไม่เถียง · ฟังก่อน</p>');
      Object.assign(this, { n: q(host, '.rs-n'), rs: [0, 1, 2].map((k) => q(host, '.rs-r' + k)), es: [0, 1, 2].map((k) => q(host, '.rs-e' + k)), c: q(host, '.rs-c') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, C.read - 0.5, undefined, at(L.tx, L.ty - 10), -2);
      const s = [C.a, C.b, C.c], e = [C.a2, C.b2, C.c2];
      this.rs.forEach((el, k) => { CF.pop(el, t, s[k] - 0.5, undefined, V ? mid(540, 590 + k * 250) : mid(960, 440 + k * 215), [-1, 1, -1][k]); this.es[k].style.opacity = seg(t, e[k] - 0.4, e[k] - 0.1).toFixed(2); });
      CF.slam(this.c, t, C.calm - 0.5, V ? mid(540, 1400) : mid(1500, 980), -2, 1.5);
      this.c.style.display = ''; if (!V) this.c.style.fontSize = '44px';
    },
  };

  // =========================================================================================== vote, then who sees it first
  CF.scenes.vote = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'vote');
      this.C = { pin: T('ติดทุกใบ'), vote: T('โหวต', 'สามเรื่อง'), ask: T('ใครจะเห็นก่อน'), move: T('ยืนยันเวลา', 'หน้าที่'), sep: T('แยกยอด', 'คนละช่อง'), gone: T('ขายหมด') };
      host.insertAdjacentHTML('beforeend', '<p class="pill vt-n" style="font-size:36px">โหวต 3 เรื่องที่เจ็บที่สุด</p>' +
        RISK.map((r, k) => '<div class="note ' + r.c + ' vt-k' + k + '" style="width:' + (V ? 880 : 560) + 'px;font-size:' + (V ? 34 : 36) + 'px">' + r.t + '<span class="vt-v' + k + '" style="float:right;opacity:0">🔴🔴🔴</span></div>').join('') +
        '<p class="sticker vt-q" style="font-size:' + (V ? 36 : 44) + 'px">ใครจะเห็นก่อน? วันนั้นทำอะไรได้?</p>' +
        '<div class="card vt-s" style="width:' + (V ? 880 : 900) + 'px;padding:12px 26px 18px"><p style="font-weight:700;font-size:' + (V ? 32 : 36) + 'px">🧾 หน้าร้านยืนยันเวลารับ ก่อนส่งยอดให้ครัว</p><p style="font-weight:700;font-size:' + (V ? 30 : 34) + 'px;color:var(--ink2);margin-top:6px">ยอดจอง <span style="color:var(--main)">|</span> ยอดมารับจริง <span style="color:var(--main)">|</span> ของเหลือ</p></div>' +
        '<p class="stamp vt-x" style="font-size:' + (V ? 36 : 44) + 'px;white-space:normal;width:' + (V ? 900 : 1100) + 'px;text-align:center">ของเหลือไม่หายไปในคำว่า “ขายหมด”</p>');
      Object.assign(this, { n: q(host, '.vt-n'), ks: [0, 1, 2].map((k) => q(host, '.vt-k' + k)), vs: [0, 1, 2].map((k) => q(host, '.vt-v' + k)), qq: q(host, '.vt-q'), s: q(host, '.vt-s'), x: q(host, '.vt-x') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      this.ks.forEach((e, k) => { CF.pop(e, t, C.pin - 0.4 + k * 0.2, undefined, V ? mid(540, 520 + k * 130) : mid(520, 400 + k * 150), [-2, 1, -1][k]); this.vs[k].style.opacity = seg(t, C.vote - 0.2 + k * 0.2, C.vote + 0.1 + k * 0.2).toFixed(2); });
      CF.slam(this.qq, t, C.ask - 0.4, V ? mid(540, 960) : mid(1380, 470), -2, 1.5);
      CF.pop(this.s, t, C.move - 0.5, undefined, V ? mid(540, 1120) : mid(1380, 700), 1);
      CF.slam(this.x, t, C.gone - 0.6, V ? mid(540, 1380) : mid(960, 900), -2, 1.5);
    },
  };

  // =========================================================================================== owners and first moves (the web table)
  CF.scenes.owners = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'owners');
      this.C = { r1: 0.4, r2: T('แบ่งเวลา', 'เป็นรอบ'), r3: T('ฝ่ายจัดซื้อ', 'เช็กราคา'), hold: T('หยุดเพิ่มยอด'), low: T('ต่ำกว่าเกณฑ์'), talk: T('คุยกับเจ้าของ') };
      host.insertAdjacentHTML('beforeend', '<p class="pill ow-n" style="font-size:36px">ความเสี่ยง → คนดูแล</p>' +
        RISK.map((r, k) => '<div class="card ow-r' + k + '" style="width:' + (V ? 880 : 1700) + 'px;padding:12px 22px 16px;background:' + ['#FBE6E1', '#E3EEFB', '#E3F3EA'][k] + ';' + (V ? '' : 'display:grid;grid-template-columns:520px 460px 1fr;gap:26px;align-items:center') + '">' +
          '<p style="font-weight:700;font-size:' + (V ? 32 : 38) + 'px">⚠️ ' + r.t + '</p><p style="font-weight:600;font-size:' + (V ? 26 : 30) + 'px;color:var(--ink2)">👀 ' + r.w + '</p><p style="font-weight:700;font-size:' + (V ? 28 : 32) + 'px">✅ ' + r.o + '</p></div>').join(''));
      Object.assign(this, { n: q(host, '.ow-n'), rs: [0, 1, 2].map((k) => q(host, '.ow-r' + k)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      const s = [C.r1, C.r2 - 0.4, C.r3 - 0.5];
      this.rs.forEach((e, k) => CF.pop(e, t, s[k], undefined, V ? mid(540, 560 + k * 270) : mid(960, 420 + k * 200), [-1, 1, -1][k]));
    },
  };

  // =========================================================================================== close: the name, the schedule, the empty table
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { name: T('พรีมอร์เท็ม', 'นี่คือ'), tell: T('เล่าว่ามันพัง', 'ลงมือ'), owner: T('มีคนดูแล', 'ความเสี่ยง'), sched: T('ตารางเวลา'), who: T('ชื่อคนดูแล', 'คนดูแลครบ'), day1: T('วันแรก'), ask: T('วันนี้คนมารับ', 'มารับจริงกี่จาน'), see: T('ดูวิธี'), site: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend', '<p class="t red cl-nm" style="font-size:' + (V ? 110 : 140) + 'px;line-height:1.05">Pre-mortem</p>' +
        '<p class="pill cl-d" style="font-size:' + (V ? 32 : 38) + 'px;white-space:normal;width:' + (V ? 900 : 1300) + 'px">ก่อนเริ่มงาน ให้คนลงมือเล่าว่า “มันพังไปแล้ว” ได้ยังไง</p>' +
        phone('cl-p', V, '<p style="font-weight:600;font-size:24px;color:var(--ink2)">รับจองอาหารล่วงหน้า</p><p style="font-weight:700;font-size:28px;margin-top:6px">🕒 ตารางเวลารับ</p><p style="font-weight:700;font-size:28px">👤 ชื่อคนดูแล</p>' + btn('เปิดรับจอง', V)) +
        '<p class="sticker cl-q" style="font-size:' + (V ? 34 : 44) + 'px;white-space:normal;width:' + (V ? 880 : 1200) + 'px;text-align:center">“วันนี้คนมารับจริงกี่จาน แล้วโต๊ะในร้านยังได้กินทันไหม?”</p>' +
        '<div class="card cl-e" style="width:' + (V ? 880 : 1100) + 'px;padding:12px 18px 16px;background:#fff;border-style:dashed"><p style="font-weight:700;font-size:' + (V ? 28 : 32) + 'px;color:var(--ink2)">วันที่ 1 · รอข้อมูล</p>' +
          '<div style="display:flex;gap:10px;margin-top:8px">' + ['มารับจริง', 'โต๊ะรอเกินเกณฑ์', 'กำไรต่อจาน'].map((s) => '<div style="flex:1;text-align:center;border:4px dashed #B9AFA2;border-radius:14px;padding:6px 6px 10px"><p style="font-weight:600;font-size:' + (V ? 22 : 26) + 'px;color:var(--ink2)">' + s + '</p><p style="font-weight:700;font-size:' + (V ? 44 : 54) + 'px;color:#B9AFA2">?</p></div>').join('') + '</div></div>' + siteBlock(V, 'Risk Management · Gary Klein'));
      Object.assign(this, { nm: q(host, '.cl-nm'), d: q(host, '.cl-d'), p: q(host, '.cl-p'), qq: q(host, '.cl-q'), e: q(host, '.cl-e'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.see - 0.3;
      CF.slam(this.nm, t, C.name - 0.1, out, V ? at(L.tx, L.ty - 20) : at(L.tx, L.ty - 40), -2, 1.5);
      CF.pop(this.d, t, C.tell - 0.4, out, V ? at(L.tx, 560) : at(L.tx, 440), 0);
      CF.pop(this.p, t, C.sched - 0.5, out, V ? mid(540, 920) : mid(520, 760), -2);
      CF.slam(this.qq, t, C.ask - 0.5, out, V ? mid(540, 1170) : mid(1200, 760), -2, 1.5);
      CF.pop(this.e, t, C.day1 - 0.4, out, V ? mid(540, 1360) : mid(1100, 940), 1);
      const Pp = V ? { see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.see, t, C.see, undefined, at(Pp.see[0], Pp.see[1]));
      CF.pop(this.name, t, C.site, undefined, at(Pp.name[0], Pp.name[1]), -2);
      CF.pop(this.url, t, C.site + 0.4, undefined, at(Pp.url[0], Pp.url[1]));
      CF.pop(this.org, t, C.site + 0.6, undefined, at(Pp.org[0], Pp.org[1]));
      CF.pop(this.ai, t, C.site + 0.8, undefined, at(Pp.ai[0], Pp.ai[1]));
    },
  };

  window.clipSetup = (api) => { for (const [id, sc] of Object.entries(CF.scenes)) { const host = api.stage.querySelector('section.scene[data-scene="' + id + '"]'); if (host && api.scene(id)) { sc.init(host, api); sc.ready = true; } } };
  window.clipFrame = (t, api) => { for (const [id, sc] of Object.entries(CF.scenes)) if (sc.ready) sc.render(api.local(t, id)); };
})();
