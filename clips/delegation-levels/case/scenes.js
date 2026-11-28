/* Delegation Levels, episode 7 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from
   scene-local time only, on the same planning-room look and helpers (cf.js) as episodes 4–6.
   The seven levels share one "ladder": seven steps, the current one lit, and a slider showing who decides
   (owner ←→ team). Each level scene adds its restaurant example. Cues (T('คำ')) are words in the spoken line. */
(() => {
  const CF = window.CF, K = CF.K, { clamp01, seg, eo, eio, eob, lerp } = K;
  // a cue on the first alternative Whisper heard, else the first one that is in the spoken text (never unresolvable)
  const HEARD = (api, id) => {
    const sc = api.scene(id), nm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, ''), heard = sc.concat || '', say = nm(sc.say || '');
    return (...alts) => { const a = alts.find((w) => heard.includes(nm(w))) || alts.find((w) => say.includes(nm(w))); return a ? api.T('w:' + a, id) : 0.5; };
  };
  const LAY = (W, H) => { const V = H > W; return V ? { V, W, H, tx: 80, tapeY: 262, ty: 372 } : { V, W, H, tx: 110, tapeY: 120, ty: 250 }; };
  const at = (x, y, e) => 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (e || '');
  const mid = (x, y, e) => at(x, y) + ' translate(-50%,-50%)' + (e || '');
  const q = (h, c) => h.querySelector(c);
  const line = (cls, text, size, color) => '<p class="t ' + (color || '') + ' ' + cls + '" style="font-size:' + size + 'px">' + text + '</p>';
  const owner = (cls, arms) => '<svg class="art ' + cls + '" width="300" height="360" viewBox="-150 -340 300 360" style="overflow:visible">' + CF.body('var(--ink)', arms ? '<path d="M-58 -150 Q-120 -210 -40 -238 M58 -150 Q120 -210 40 -238" style="fill:none;stroke:var(--ink);stroke-width:22;stroke-linecap:round"/>' : '') + '</svg>';
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 860 : 760) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 72 : 64) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  // ----------------------------------------------------------------------------------------- the ladder
  const LV = [['Tell', 'บอกให้ทำ'], ['Sell', 'ตัดสินใจแล้วอธิบาย'], ['Consult', 'ปรึกษาก่อนตัดสินใจ'], ['Agree', 'ตัดสินใจร่วมกัน'], ['Advise', 'ให้คำแนะนำ'], ['Inquire', 'ตัดสินใจแล้วถามผล'], ['Delegate', 'มอบอำนาจเต็มที่']];
  const ladderGeo = (L) => L.V ? { x: 80, y: 520, w: 920, sh: 58, gap: 7 } : { x: 110, y: 470, w: 760, sh: 62, gap: 8 };
  const ladderHtml = (L, cls) => {
    const g = ladderGeo(L); let s = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px">';
    LV.forEach(([en, th], i) => {
      const w = g.w * (0.42 + 0.58 * (i / 6));
      s += '<div class="' + cls + '-s' + i + '" style="display:flex;align-items:center;gap:14px;height:' + g.sh + 'px;margin-bottom:' + g.gap + 'px;width:' + w + 'px;background:#E9DFD0;border-radius:14px;padding:0 20px;font-weight:700;font-size:' + (L.V ? 32 : 30) + 'px;transition:none">' +
        '<b style="display:inline-block;min-width:44px;height:44px;border-radius:12px;background:var(--ink);color:#fff;text-align:center;line-height:40px">' + (i + 1) + '</b><span>' + en + '</span><span style="color:var(--ink2);font-size:.85em">' + th + '</span></div>';
    });
    return s + '</div>';
  };
  // cur: which step is lit (−1 none); shown: steps appear one by one until t reaches tIn[i]
  const ladderRender = (host, cls, L, t, tIn, cur, t0) => {
    const g = ladderGeo(L), root = q(host, '.' + cls); root.style.transform = at(g.x, g.y);
    LV.forEach((_, i) => {
      const s = q(host, '.' + cls + '-s' + i); CF.pop(s, t, tIn[i] ?? -1, undefined, '');
      const on = i === cur && t >= (t0 ?? -1);
      s.style.background = on ? 'var(--accent)' : (cur >= 0 && i !== cur ? '#EFE8DC' : '#E9DFD0');
      s.style.opacity = (+s.style.opacity * (cur >= 0 && i !== cur ? 0.55 : 1)).toFixed(2);
      s.style.boxShadow = on ? '0 0 0 6px var(--ink)' : '';
    });
  };
  // who decides: a bar from owner (left) to team (right) with a marker
  const sliderHtml = (L, cls) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (L.V ? 920 : 760) + 'px">' +
    '<div style="display:flex;justify-content:space-between;font-weight:700;font-size:' + (L.V ? 30 : 28) + 'px;color:var(--ink2);margin-bottom:10px"><span>เจ้าของร้านตัดสินใจ</span><span>ทีมตัดสินใจ</span></div>' +
    '<div style="position:relative;height:26px;border-radius:13px;background:linear-gradient(90deg,#E5402F,#FFC21A,#2B7A4B)"><b class="' + cls + '-m" style="position:absolute;top:-14px;width:54px;height:54px;border-radius:50%;background:#fff;border:7px solid var(--ink);margin-left:-27px"></b></div></div>';
  const sliderRender = (host, cls, L, t, a, b, t0, t1, tIn) => {
    const el = q(host, '.' + cls); CF.pop(el, t, tIn ?? -1, undefined, L.V ? at(80, 1300) : at(1000, 880));
    q(host, '.' + cls + '-m').style.left = (100 * lerp(a, b, eio(seg(t, t0, t1)))).toFixed(1) + '%';
  };

  // =========================================================================================== hook
  const ASK = ['พี่ครับ อันนี้ทำได้ไหมครับ?', 'พี่คะ อันนี้ต้องทำยังไงคะ?', 'พี่ครับ ขออนุมัติหน่อยครับ!'];
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { done: T('เรียบร้อย'), plan: T('วางแผน'), book: T('เปิดสมุด', 'สมุด'), a0: T('ทำได้ไหม'), a1: T('ทำยังไง'), a2: T('ขออนุมัติ'), wait: T('เดี๋ยวนะ'), swap: T('เปลี่ยนคน', 'มาถาม') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + line('hk-l1', 'มอบหมายงานเรียบร้อยแล้ว!', V ? 70 : 76) +
        '<p class="t hk-l2" style="font-size:' + (V ? 50 : 52) + 'px">จะได้นั่ง<span style="color:var(--main)">วางแผนพัฒนาร้าน</span>สักที…</p>' + owner('hk-own') +
        ASK.map((s, i) => '<p class="sticker hk-a' + i + '" style="font-size:' + (V ? 40 : 40) + 'px;background:#fff">' + s + '</p>').join('') +
        '<p class="stamp hk-st" style="font-size:' + (V ? 54 : 60) + 'px">มอบหมายแล้ว<br>หรือแค่เปลี่ยนคนมาถาม?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), own: q(host, '.hk-own'), as: ASK.map((_, i) => q(host, '.hk-a' + i)), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.l1, t, 0.2, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.plan - 0.3, undefined, at(L.tx, L.ty + (V ? 110 : 120)));
      CF.pop(this.own, t, C.done, undefined, V ? at(700, 960, ' rotate(' + CF.shake(t, C.wait, 3).toFixed(2) + 'deg)') : at(260, 560, ' rotate(' + CF.shake(t, C.wait, 3).toFixed(2) + 'deg)'));
      const P = V ? [[540, 640], [540, 780], [540, 920]] : [[1300, 380], [1360, 520], [1300, 660]];
      [C.a0, C.a1, C.a2].forEach((c0, i) => CF.pop(this.as[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.slam(this.st, t, C.swap - 0.6, V ? mid(540, 1420) : mid(1250, 870), -4, 1.8);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { eis: T('ไอเซนฮาวร์', 'เมทริกซ์'), power: T('อำนาจ'), neck: T('คอขวด'), self: T('เจ้าของร้านเอง', 'เอง') };
      const bottle = '<svg width="260" height="360" viewBox="0 0 300 420"><path d="M120 20 H180 V120 Q180 150 230 190 Q270 220 270 280 V380 Q270 405 245 405 H55 Q30 405 30 380 V280 Q30 220 70 190 Q120 150 120 120 Z" style="fill:#BFD6F2;stroke:#1D2430;stroke-width:9;stroke-linejoin:round"/><g transform="translate(150 118) scale(.32)">' + CF.body('#E5402F') + '</g></svg>';
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        '<div class="card rc-a" style="width:' + (V ? 860 : 620) + 'px;padding:24px 30px 28px"><p style="font-weight:700;font-size:' + (V ? 44 : 42) + 'px">Eisenhower: แยกงานที่ควรมอบหมาย</p></div>' +
        '<div class="card rc-b" style="width:' + (V ? 860 : 620) + 'px;padding:24px 30px 28px;border-color:var(--main)"><p style="font-weight:700;font-size:' + (V ? 44 : 42) + 'px">แต่อำนาจตัดสินใจ… ยังอยู่ที่เจ้าของร้าน!</p></div>' +
        '<div class="rc-bot" style="position:absolute;left:0;top:0">' + bottle + '</div>' + '<p class="stamp rc-st" style="font-size:' + (V ? 58 : 62) + 'px">คอขวด = เจ้าของร้าน!</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), a: q(host, '.rc-a'), b: q(host, '.rc-b'), bot: q(host, '.rc-bot'), st: q(host, '.rc-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.a, t, C.eis - 0.2, undefined, V ? mid(540, 520) : mid(480, 420), -1.5);
      CF.pop(this.b, t, C.power - 0.2, undefined, V ? mid(540, 700) : mid(480, 600), 1);
      CF.pop(this.bot, t, C.neck - 0.2, undefined, V ? mid(540, 1050) : mid(1400, 520), 3);
      CF.slam(this.st, t, C.self - 0.3, V ? mid(540, 1360) : mid(1400, 860), -4, 2);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea');
      this.C = { not: T('ไม่ได้แปลว่า'), name: T('เดลิเกชัน', 'เลเวลส์'), who: T('ใครตัดสินใจ', 'แค่ไหน'), seven: T('เจ็ดระดับ', 'เจ็ด') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 100 : 110) + 'px;color:var(--main)">Delegation<br>Levels</p>' +
        line('id-r', 'มอบงาน ≠ มอบอำนาจตัดสินใจ', V ? 50 : 50) + ladderHtml(L, 'id-l') + '<p class="sticker id-7" style="font-size:' + (V ? 60 : 60) + 'px">7 ระดับ!</p>');
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), r: q(host, '.id-r'), e7: q(host, '.id-7'), host });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.r, t, C.not - 0.2, C.name - 0.3, at(L.tx, L.ty));
      CF.slam(this.name, t, C.name - 0.1, V ? at(L.tx, L.ty - 20) : at(1000, L.ty - 20), -2, 1.6);
      ladderRender(this.host, 'id-l', V ? { ...L, V } : L, t, LV.map((_, i) => C.seven - 0.6 + i * 0.12), -1);
      if (V) q(this.host, '.id-l').style.transform = at(80, 640);
      else q(this.host, '.id-l').style.transform = at(110, 380);
      CF.slam(this.e7, t, C.seven, V ? mid(780, 1400) : mid(1400, 820), -5, 2);
    },
  };

  // =========================================================================================== levels 1–7
  // [id, index, decider position on the slider (0 owner … 1 team), example lines]
  const EX = {
    tell: [0, 0.03, 'สั่งหยุดใช้วัตถุดิบ<br>ที่ไม่ปลอดภัยทันที', 'คำสั่งต้องชัด ไม่ใช่ต่างคนต่างตัดสินใจ'],
    sell: [1, 0.18, 'เปลี่ยนวิธีจัดคิวออร์เดอร์', 'บอกเหตุผล: ลดจานกองหน้าเตา'],
    consult: [2, 0.33, 'ปรับเวลาทำงานคนล้างจาน', 'ถามหัวหน้าครัวและทีมก่อน → เจ้าของร้านตัดสินใจ'],
    agree: [3, 0.5, 'แบ่งหน้าที่หน้าร้าน × ครัว', 'ทุกคนเสนอ แล้วตกลงร่วมกัน'],
    advise: [4, 0.67, 'วิธีเตรียมวัตถุดิบ', 'เจ้าของร้านแนะนำ → หัวหน้าครัวตัดสินใจ'],
    inquire: [5, 0.82, 'จัดตารางพนักงานหน้าร้าน', 'หัวหน้าร้านทำเลย → เจ้าของร้านถามผลทีหลัง'],
    delegate: [6, 0.97, 'จัดโต๊ะ · ตอบลูกค้า<br>แก้ปัญหาบริการทั่วไป', 'ทำได้เลย ภายในขอบเขตที่ตกลง'],
  };
  const levelScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), [i] = EX[id], [en, th] = LV[i]; this.host = host; this.i = i;
      this.C = { name: T(['เทล', 'เซล', 'คอนซัลต์', 'อะกรี', 'แอดไวซ์', 'อินไควร์', 'เดลิเกต'][i]), ex: T('เช่น', 'อย่าง', 'จัดโต๊ะ'), half: api.scene(id).voice ? api.scene(id).voice.at - api.scene(id).start + api.scene(id).voice.dur * 0.55 : 2 };
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') +
        '<p class="t ' + id + '-h" style="font-size:' + (V ? 92 : 96) + 'px"><i style="display:inline-block;font-style:normal;min-width:1.15em;text-align:center;margin-right:.22em;padding:0 .1em .08em;border-radius:.22em;background:var(--main);color:#fff;font-size:.82em">' + (i + 1) + '</i>' + en + '</p>' +
        line(id + '-th', th, V ? 58 : 56, 'red') + ladderHtml(L, id + '-l') + sliderHtml(L, id + '-sl') +
        '<div class="card ' + id + '-ex" style="width:' + (V ? 900 : 820) + 'px;padding:24px 34px 30px"><p style="font-weight:700;font-size:' + (V ? 30 : 28) + 'px;color:var(--ink2)">ในร้านเรา</p><p style="font-weight:700;font-size:' + (V ? 48 : 48) + 'px;line-height:1.25">' + EX[id][2] + '</p><p style="font-weight:700;font-size:' + (V ? 34 : 32) + 'px;color:var(--main);margin-top:6px">' + EX[id][3] + '</p></div>');
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), h: q(host, '.' + id + '-h'), th: q(host, '.' + id + '-th'), ex: q(host, '.' + id + '-ex') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, i = this.i, prev = i === 0 ? 0 : EX[Object.keys(EX)[i - 1]][1];
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.h, t, Math.max(0.1, C.name - 0.15), at(L.tx, L.ty), -2, 1.5);
      CF.pop(this.th, t, C.name + 0.3, undefined, at(L.tx, L.ty + (V ? 118 : 124)));
      ladderRender(this.host, id + '-l', L, t, LV.map(() => -1), i, C.name);
      q(this.host, '.' + id + '-l').style.transform = V ? at(80, 610) : at(110, 470);
      sliderRender(this.host, id + '-sl', L, t, prev, EX[id][1], C.name, C.name + 0.8, 0.3);
      if (V) q(this.host, '.' + id + '-sl').style.transform = at(80, 1090); else q(this.host, '.' + id + '-sl').style.transform = at(1000, 860);
      CF.pop(this.ex, t, Math.min(C.ex - 0.2, C.half), undefined, V ? mid(540, 1335) : mid(1410, 560), -1.5);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = levelScene(id);

  // =========================================================================================== twist
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'twist');
      this.C = { q7: T('ระดับเจ็ด', 'เจ็ด'), no: T('ไม่จำเป็น'), risk: T('เสี่ยง'), cx: T('ซับซ้อน'), ready: T('พร้อม'), self: T('ตัดสินใจเองได้'), ask: T('ต้องปรึกษา'), ok: T('ขออนุมัติ'), bound: T('ขอบเขต'), back: T('แจ้งกลับ') };
      const rows = [['✓', 'ตัดสินใจเองได้'], ['?', 'ต้องปรึกษา'], ['!', 'ต้องขออนุมัติ']];
      host.insertAdjacentHTML('beforeend', line('tw-q', 'ทุกงานต้องถึงระดับ 7?', V ? 66 : 76) + '<p class="stamp green tw-no" style="font-size:' + (V ? 80 : 84) + 'px">ไม่จำเป็น!</p>' +
        ['ความเสี่ยง', 'ความซับซ้อน', 'ความพร้อมของคน'].map((s, i) => '<p class="pill tw-p' + i + '" style="font-size:' + (V ? 40 : 40) + 'px">' + s + '</p>').join('') +
        '<div class="card tw-card" style="width:' + (V ? 900 : 760) + 'px;padding:26px 34px 30px"><p style="font-weight:700;font-size:' + (V ? 36 : 34) + 'px;color:var(--ink2)">ตกลงกันให้ชัดทุกเรื่อง</p>' +
          rows.map(([a, b], i) => '<p class="tw-r' + i + '" style="font-weight:700;font-size:' + (V ? 48 : 46) + 'px;margin-top:6px"><b style="display:inline-block;width:56px;color:var(--main)">' + a + '</b>' + b + '</p>').join('') +
          '<p class="tw-b" style="font-weight:700;font-size:' + (V ? 34 : 32) + 'px;color:var(--main);margin-top:10px">+ ขอบเขต · งบ · เรื่องที่ต้องแจ้งกลับ</p></div>');
      Object.assign(this, { qq: q(host, '.tw-q'), no: q(host, '.tw-no'), ps: [0, 1, 2].map((i) => q(host, '.tw-p' + i)), card: q(host, '.tw-card'), rs: [0, 1, 2].map((i) => q(host, '.tw-r' + i)), b: q(host, '.tw-b') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.qq, t, 0.1, undefined, at(L.tx, L.ty - 40));
      CF.slam(this.no, t, C.no, V ? mid(700, 590) : mid(1500, 240), -5, 2);
      const P = V ? [[260, 770], [560, 770], [400, 860]] : [[300, 480], [620, 480], [460, 580]];
      [C.risk, C.cx, C.ready].forEach((c0, i) => CF.pop(this.ps[i], t, c0 - 0.15, undefined, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.pop(this.card, t, C.self - 0.4, undefined, V ? mid(540, 1170) : mid(1380, 620), -1);
      [C.self, C.ask, C.ok].forEach((c0, i) => { this.rs[i].style.opacity = seg(t, c0 - 0.2, c0).toFixed(2); });
      this.b.style.opacity = seg(t, C.bound - 0.2, C.bound).toFixed(2);
    },
  };

  // =========================================================================================== result (+ key takeaway)
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result');
      this.C = { set: T('กำหนดระดับ', 'ระดับ'), r0: T('จัดโต๊ะ'), r1: T('สั่งวัตถุดิบ'), r2: T('ลงทุนใหญ่', 'ลงทุน'), quiet: T('เงียบลง', 'โทรศัพท์'), eis: T('ไอเซนฮาวร์', 'เมทริกซ์') };
      const R = [['หน้าร้านจัดโต๊ะ', '7 · Delegate', '#BFE5CC'], ['หัวหน้าครัวสั่งวัตถุดิบในงบ', '6 · Inquire', '#BFD6F2'], ['ลงทุนครั้งใหญ่', 'ผ่านเจ้าของร้าน', '#F7C6BD']];
      host.insertAdjacentHTML('beforeend', line('rs-h', 'กำหนดระดับให้งานแต่ละประเภท', V ? 56 : 64) +
        R.map(([a, b, c], i) => '<div class="card rs-r' + i + '" style="width:' + (V ? 900 : 900) + 'px;padding:18px 30px;display:flex;justify-content:space-between;align-items:center;gap:20px;background:' + c + '"><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px;white-space:nowrap">' + b + '</p></div>').join('') +
        '<p class="sticker rs-ph" style="font-size:' + (V ? 54 : 56) + 'px">☎ โทรศัพท์เงียบลง!</p>' +
        '<p class="t rs-k" style="font-size:' + (V ? 44 : 46) + 'px;white-space:normal;width:' + (V ? 900 : 1700) + 'px;line-height:1.3">มอบหมายงานอย่างเดียวไม่พอ <span style="color:var(--main)">ต้องกำหนดอำนาจตัดสินใจให้ชัดเจน</span></p>');
      Object.assign(this, { hh: q(host, '.rs-h'), rs: [0, 1, 2].map((i) => q(host, '.rs-r' + i)), ph: q(host, '.rs-ph'), k: q(host, '.rs-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.hh, t, C.set - 0.3, undefined, at(L.tx, L.ty));
      const Y = V ? [580, 720, 860] : [460, 590, 720];
      [C.r0, C.r1, C.r2].forEach((c0, i) => CF.pop(this.rs[i], t, c0 - 0.2, undefined, mid(V ? 540 : 560, Y[i]), [-1, 1, -1][i]));
      CF.slam(this.ph, t, C.quiet - 0.2, V ? mid(540, 1080) : mid(1460, 560), -4, 2);
      CF.pop(this.k, t, C.eis + 0.4, undefined, V ? at(80, 1260) : at(110, 900));
    },
  };

  // =========================================================================================== close (the bridge to RACI)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { miss: T('มาไม่ถึง'), chef: T('นึกว่าฝ่ายจัดซื้อ', 'ฝ่ายจัดซื้อสั่ง'), buy: T('นึกว่าหัวหน้าครัว', 'เป็นคนสั่ง'), who: T('ใครรับผิดชอบ', 'รับผิดชอบ'), next: T('ตอนหน้า'), raci: T('ราซี'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const box = '<svg width="200" height="170" viewBox="0 0 200 170"><path d="M20 60 L100 20 L180 60 V140 L100 165 L20 140 Z" style="fill:#E9C890;stroke:#1D2430;stroke-width:8;stroke-linejoin:round"/><path d="M20 60 L100 95 L180 60 M100 95 V165" style="fill:none;stroke:#1D2430;stroke-width:8"/><text x="100" y="80" style="font-size:70px;font-weight:700;fill:#E5402F;text-anchor:middle">?</text></svg>';
      host.insertAdjacentHTML('beforeend', line('cl-h', 'วัตถุดิบมาไม่ถึงร้าน!', V ? 66 : 76) + '<div class="cl-box" style="position:absolute;left:0;top:0">' + box + '</div>' +
        '<p class="sticker cl-b0" style="font-size:' + (V ? 38 : 38) + 'px;background:#fff">หัวหน้าครัว: นึกว่าจัดซื้อสั่งแล้ว</p>' +
        '<p class="sticker cl-b1" style="font-size:' + (V ? 38 : 38) + 'px;background:#fff">จัดซื้อ: นึกว่าหัวหน้าครัวสั่ง</p>' +
        '<p class="stamp cl-who" style="font-size:' + (V ? 62 : 66) + 'px">ใครรับผิดชอบ?</p>' +
        nextCard(V, 'cl-next', 'RACI Matrix', 'ใครทำ ใครรับผิดชอบ ใครต้องรู้') + siteBlock(V, 'Management 3.0 · Jurgen Appelo (Delegation Poker)'));
      Object.assign(this, { hh: q(host, '.cl-h'), box: q(host, '.cl-box'), b0: q(host, '.cl-b0'), b1: q(host, '.cl-b1'), who: q(host, '.cl-who'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.hh, t, C.miss - 0.4, out, at(L.tx, L.ty));
      CF.pop(this.box, t, C.miss - 0.2, out, V ? mid(540, 700) : mid(400, 560), 4);
      CF.pop(this.b0, t, C.chef - 0.2, out, V ? mid(540, 900) : mid(1200, 430), -2);
      CF.pop(this.b1, t, C.buy - 0.2, out, V ? mid(540, 1040) : mid(1250, 600), 2);
      CF.slam(this.who, t, C.who - 0.2, V ? mid(540, 1250) : mid(1200, 820), -4, 2);
      if (t > out) this.who.style.opacity = (+this.who.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const P = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1400, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(P.next[0], P.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.raci) * 8) * Math.exp(-Math.max(0, t - C.raci) * 3);
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
