/* Skill / Will Matrix, episode 9 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from
   scene-local time only, same look and helpers (cf.js) as episodes 4–8. One Skill × Will grid is shared by the four
   quadrant scenes (the current quadrant lit, its person and the support it needs); the apply scene moves one person's
   dot across quadrants for different jobs. Tone: understanding, never blaming the staff. Cues are spoken words. */
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
  const person = (fill, w) => '<svg width="' + w + '" height="' + w * 1.2 + '" viewBox="-75 -255 150 265">' + CF.body(fill) + '</svg>';
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 800) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 60 : 58) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  // ----------------------------------------------------------------------------------------- the grid
  // quadrants by [skill high?, will high?]: 0 guide (low skill, high will) 1 delegate (high, high) 2 direct (low, low) 3 excite (high, low)
  const QD = [['สอน · ฝึก', 'ทักษะต่ำ · ตั้งใจสูง', '#BFD6F2'], ['มอบหมาย', 'ทักษะสูง · ตั้งใจสูง', '#BFE5CC'], ['กำกับใกล้ชิด', 'ทักษะต่ำ · ตั้งใจต่ำ', '#F7C6BD'], ['รับฟัง · กระตุ้น', 'ทักษะสูง · ตั้งใจต่ำ', '#FFE680']];
  const gridGeo = (L, big) => L.V ? { x: 120, y: big ? 560 : 520, w: 840, h: big ? 700 : 560 } : { x: big ? 860 : 120, y: big ? 260 : 440, w: big ? 900 : 760, h: big ? 700 : 520 };
  const gridHtml = (L, cls, big) => {
    const g = gridGeo(L, big); let s = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px;height:' + g.h + 'px">';
    QD.forEach(([a, b, c], i) => {
      s += '<div class="' + cls + '-q' + i + '" style="position:absolute;left:' + (i % 2) * g.w / 2 + 'px;top:' + Math.floor(i / 2) * g.h / 2 + 'px;width:' + (g.w / 2 - 10) + 'px;height:' + (g.h / 2 - 10) + 'px;background:' + c + ';border:6px solid var(--ink);border-radius:20px;padding:14px 18px">' +
        '<p style="font-weight:700;font-size:' + (L.V ? 38 : (big ? 40 : 34)) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (L.V ? 26 : 26) + 'px;color:var(--ink2)">' + b + '</p></div>';
    });
    s += '<p style="position:absolute;left:0;top:' + (g.h + 10) + 'px;width:' + g.w + 'px;text-align:center;font-weight:700;font-size:30px;color:var(--ink2)">Skill (ทักษะ) →</p>';
    s += '<p style="position:absolute;left:-70px;top:' + g.h / 2 + 'px;transform:rotate(-90deg) translate(-50%,0);transform-origin:0 0;font-weight:700;font-size:30px;color:var(--ink2);white-space:nowrap">← Will (ความตั้งใจ)</p>';
    return s + '</div>';
  };
  // lit: quadrant index lit at t0 (others dimmed); tIn per quadrant pop time
  const gridRender = (host, cls, L, big, t, tIn, lit, t0) => {
    const g = gridGeo(L, big), root = q(host, '.' + cls); root.style.transform = at(g.x, g.y);
    QD.forEach((_, i) => {
      const e = q(host, '.' + cls + '-q' + i); CF.pop(e, t, (tIn || [])[i] ?? -1, undefined, '');
      if (lit !== undefined && lit >= 0) { const d = seg(t, t0, t0 + 0.3); e.style.opacity = (+e.style.opacity * (i === lit ? 1 : 1 - 0.65 * d)).toFixed(2); e.style.boxShadow = i === lit && d > 0.5 ? '0 0 0 8px var(--main)' : ''; }
    });
  };
  // the grid's quadrants sit at: top row = will high (guide | delegate), bottom row = will low (direct | excite)
  const quadCentre = (L, big, i) => { const g = gridGeo(L, big); return [g.x + (i % 2 + 0.5) * g.w / 2, g.y + (Math.floor(i / 2) + 0.5) * g.h / 2]; };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { two: T('สองคน'), a: T('คนแรก'), aw: T('ผิดบ่อย'), b: T('อีกคน'), bw: T('ไม่ค่อยอยาก', 'ช่วงหลัง'), q1: T('อยากทำแต่', 'ยังทำไม่เป็น'), q2: T('ทำเป็นแต่'), same: T('เหมือนกันไหม') };
      const card = (cls, c, a, b) => '<div class="card ' + cls + '" style="width:' + (V ? 430 : 520) + 'px;padding:22px;display:flex;flex-direction:column;align-items:center;gap:8px;background:' + c + '">' + person('#1D2430', V ? 120 : 140) +
        '<p style="font-weight:700;font-size:' + (V ? 32 : 36) + 'px;text-align:center;line-height:1.25">' + a + '</p><p class="' + cls + '-w" style="font-weight:700;font-size:' + (V ? 30 : 34) + 'px;color:var(--main);text-align:center">' + b + '</p></div>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + line('hk-l1', 'พนักงานสองคน งานเดียวกัน', V ? 64 : 76) +
        card('hk-a', '#BFD6F2', 'ตั้งใจ ยิ้มแย้ม ขยัน', 'แต่รับออร์เดอร์ผิดบ่อย') + card('hk-b', '#FFE680', 'ทำมาหลายปี คล่องมาก', 'แต่ไม่ค่อยอยากทำเพิ่ม') +
        '<p class="pill hk-pa" style="font-size:' + (V ? 34 : 38) + 'px">อยากทำ แต่ยังทำไม่เป็น</p><p class="pill hk-pb" style="font-size:' + (V ? 34 : 38) + 'px">ทำเป็น แต่ไม่ค่อยอยากทำ</p>' +
        '<p class="sticker hk-q" style="font-size:' + (V ? 50 : 56) + 'px">บริหารเหมือนกันดีไหม?</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), a: q(host, '.hk-a'), b: q(host, '.hk-b'), aw: q(host, '.hk-a-w'), bw: q(host, '.hk-b-w'), pa: q(host, '.hk-pa'), pb: q(host, '.hk-pb'), qq: q(host, '.hk-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.l1, t, C.two - 0.4, undefined, at(L.tx, L.ty));
      const PA = V ? [290, 760] : [560, 620], PB = V ? [790, 760] : [1360, 620];
      CF.pop(this.a, t, C.a - 0.2, undefined, mid(PA[0], PA[1]), -2); CF.pop(this.b, t, C.b - 0.2, undefined, mid(PB[0], PB[1]), 2);
      this.aw.style.opacity = seg(t, C.aw - 0.3, C.aw).toFixed(2); this.bw.style.opacity = seg(t, C.bw - 0.3, C.bw).toFixed(2);
      CF.pop(this.pa, t, C.q1 - 0.2, undefined, V ? mid(290, 1080) : mid(560, 900), -2); CF.pop(this.pb, t, C.q2 - 0.2, undefined, V ? mid(790, 1160) : mid(1360, 900), 2);
      CF.slam(this.qq, t, C.same - 0.6, V ? mid(540, 1340) : mid(960, 1000), -3, 1.8);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { e: T('ไอเซนฮาวร์'), d: T('เดลิเกชัน', 'มอบอำนาจ'), r: T('ราซี'), but: T('ไม่ได้แปลว่า', 'พร้อม') };
      const B = [['6', 'Eisenhower', 'จัดลำดับงาน'], ['7', 'Delegation Levels', 'มอบอำนาจ'], ['8', 'RACI', 'กำหนดหน้าที่']];
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ที่ผ่านมา…</p>' +
        B.map(([n, a, b], i) => '<div class="card rc-' + i + '" style="width:' + (V ? 860 : 520) + 'px;padding:20px 28px 24px"><p style="font-weight:700;font-size:' + (V ? 30 : 28) + 'px;color:var(--ink2)">ตอน ' + n + ' · ' + b + '</p><p style="font-weight:700;font-size:' + (V ? 50 : 48) + 'px">' + a + '</p></div>').join('') +
        '<p class="sticker rc-q" style="font-size:' + (V ? 46 : 52) + 'px">รู้ว่าต้องทำอะไร ≠ พร้อมทำเท่ากัน!</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), cs: [0, 1, 2].map((i) => q(host, '.rc-' + i)), qq: q(host, '.rc-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      const P = V ? [[540, 520], [540, 700], [540, 880]] : [[400, 480], [960, 480], [1520, 480]];
      [C.e, C.d, C.r].forEach((c0, i) => CF.pop(this.cs[i], t, c0 - 0.2, undefined, mid(P[i][0], P[i][1]), [-1.5, 1, -1][i]));
      CF.slam(this.qq, t, C.but - 0.2, V ? mid(540, 1120) : mid(960, 760), -3, 1.8);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea'); this.host = host;
      this.C = { name: T('สกิล วิล', 'เมทริกซ์'), skill: T('ทำเป็นไหม'), will: T('อยากทำไหม'), four: T('สี่แบบ'), diff: T('ต่างกัน') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 96 : 100) + 'px;color:var(--main)">Skill / Will<br>Matrix</p>' +
        '<p class="pill id-s" style="font-size:' + (V ? 38 : 40) + 'px">Skill = ทำเป็นไหม?</p><p class="pill id-w" style="font-size:' + (V ? 38 : 40) + 'px">Will = อยากทำไหม?</p>' + gridHtml(L, 'id-g', true));
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), s: q(host, '.id-s'), w: q(host, '.id-w') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.s, t, C.skill - 0.3, undefined, V ? at(L.tx, 1330) : at(L.tx, 640), -2);
      CF.pop(this.w, t, C.will - 0.3, undefined, V ? at(L.tx + 450, 1330) : at(L.tx, 740), 2);
      gridRender(this.host, 'id-g', L, true, t, [0, 1, 2, 3].map((i) => C.four - 0.3 + i * 0.15));
      if (V) q(this.host, '.id-g').style.transform = at(120, 600) + ' scale(.86)';
    },
  };

  // =========================================================================================== the four quadrants
  const EX = {
    guide: [0, 'พนักงานใหม่ ยังไม่คุ้นเมนู', ['สอน', 'ฝึก', 'มีคนช่วยข้าง ๆ'], 'อย่าเอาแต่ตำหนิ'],
    excite: [3, 'พนักงานเก่า เริ่มไม่มีส่วนร่วม', ['คุยก่อน', 'ปรับภาระงาน', 'เป้าหมายใหม่'], 'อย่ารีบสรุปว่าขี้เกียจ'],
    direct: [2, 'รับหน้าที่ใหม่ ยังไม่เข้าใจว่าสำคัญยังไง', ['ตั้งความคาดหวัง', 'แบ่งงานเป็นขั้นเล็ก', 'ติดตามใกล้ชิด'], 'ไม่ดีขึ้นตามเวลาที่ตกลง → คุยเรื่องปรับบทบาท'],
    delegate: [1, 'หัวหน้าครัว ชอบคิดวิธีปรับปรุงงาน', ['เป้าหมายชัด', 'อำนาจที่เหมาะสม', 'เปิดพื้นที่'], 'พร้อมรับงานมากขึ้น!'],
  };
  const NUM = { guide: 'แบบที่ 1', excite: 'แบบที่ 2', direct: 'แบบที่ 3', delegate: 'แบบสุดท้าย' };
  const quadScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), [qi, who, acts, rule] = EX[id]; this.host = host; this.qi = qi;
      this.C = { h: 0.15, who: T('อย่างพนักงาน', 'อย่างหัวหน้าครัว', 'เริ่มจากคุย', 'อย่ารีบ', 'อย่าง'), a0: T(...{ guide: ['สอน'], excite: ['ลองคุย', 'คุยก่อน'], direct: ['ความคาดหวัง'], delegate: ['เป้าหมายชัด'] }[id]), a2: T(...{ guide: ['มีคนช่วย', 'ข้าง'], excite: ['เป้าหมายใหม่'], direct: ['ติดตาม'], delegate: ['เปิดพื้นที่'] }[id]), rule: T(...{ guide: ['ตำหนิ'], excite: ['ขี้เกียจ'], direct: ['ปรับบทบาท'], delegate: ['นี่แหละ', 'พร้อมรับงาน'] }[id]) };
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + '<p class="pill ' + id + '-n" style="font-size:' + (V ? 36 : 36) + 'px">' + NUM[id] + '</p>' + line(id + '-h', QD[qi][1], V ? 64 : 70) + gridHtml(L, id + '-g', false) +
        '<div class="card ' + id + '-ex" style="width:' + (V ? 900 : 860) + 'px;padding:22px 32px 28px"><div style="display:flex;gap:20px;align-items:center">' + person('#1D2430', V ? 80 : 90) + '<p style="font-weight:700;font-size:' + (V ? 40 : 42) + 'px;line-height:1.25">' + who + '</p></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:14px">' + acts.map((a, k) => '<span class="' + id + '-a' + k + '" style="display:inline-block;background:' + QD[qi][2] + ';border:5px solid var(--ink);border-radius:999px;padding:4px 22px 8px;font-weight:700;font-size:' + (V ? 36 : 36) + 'px">' + a + '</span>').join('') + '</div></div>' +
        '<p class="sticker ' + id + '-rule" style="font-size:' + (V ? 38 : 42) + 'px;white-space:normal;max-width:' + (V ? 860 : 820) + 'px">' + rule + '</p>');
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), n: q(host, '.' + id + '-n'), h: q(host, '.' + id + '-h'), ex: q(host, '.' + id + '-ex'), as: acts.map((_, k) => q(host, '.' + id + '-a' + k)), rule: q(host, '.' + id + '-rule') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.slam(this.h, t, 0.3, at(L.tx, L.ty + (V ? 80 : 80)), -1, 1.4);
      gridRender(this.host, id + '-g', L, false, t, [-1, -1, -1, -1], this.qi, 0.4);
      if (V) q(this.host, '.' + id + '-g').style.transform = at(240, 560) + ' scale(.72)';
      CF.pop(this.ex, t, C.who - 0.3, undefined, V ? mid(540, 1160) : mid(1380, 560), -1);
      this.as.forEach((a, k) => { const t0 = lerp(C.a0, Math.max(C.a0 + 0.6, C.a2), k / 2) - 0.2; a.style.opacity = seg(t, t0, t0 + 0.2).toFixed(2); });
      CF.slam(this.rule, t, C.rule - 0.3, V ? mid(540, 1410) : mid(1380, 860), -2, 1.5);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = quadScene(id);

  // =========================================================================================== twist
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'twist');
      this.C = { a: T('ยังทำไม่เป็น'), b: T('หมดไฟ'), c: T('พร้อมแล้ว'), same: T('แบบเดียวกัน'), no: T('ไม่ได้ผล') };
      const R = [['ยังทำไม่เป็น', 'การสอน', '#BFD6F2'], ['หมดไฟ', 'การรับฟัง', '#FFE680'], ['พร้อมแล้ว', 'ความไว้ใจ', '#BFE5CC']];
      host.insertAdjacentHTML('beforeend', line('tw-h', 'คนต่างกัน… ต้องการต่างกัน', V ? 60 : 72) +
        R.map(([a, b, c], i) => '<div class="card tw-r' + i + '" style="width:' + (V ? 900 : 1100) + 'px;padding:18px 30px;display:flex;justify-content:space-between;align-items:center;background:' + c + '"><p style="font-weight:700;font-size:' + (V ? 44 : 48) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 44 : 48) + 'px">→ ' + b + '</p></div>').join('') +
        '<p class="stamp tw-st" style="font-size:' + (V ? 50 : 60) + 'px">บริหารทุกคนแบบเดียวกัน = ไม่ได้ผล!</p>');
      Object.assign(this, { hh: q(host, '.tw-h'), rs: [0, 1, 2].map((i) => q(host, '.tw-r' + i)), st: q(host, '.tw-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.hh, t, 0.1, undefined, at(L.tx, L.ty));
      const Y = V ? [600, 760, 920] : [440, 580, 720];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.rs[i], t, c0 - 0.3, undefined, mid(V ? 540 : 700, Y[i]), [-1, 1, -1][i]));
      CF.slam(this.st, t, C.same - 0.4, V ? mid(540, 1180) : mid(960, 900), -3, 1.8);
    },
  };

  // =========================================================================================== apply: same person, different jobs
  CF.scenes.apply = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'apply'); this.host = host;
      this.C = { talk: T('ทีละคน'), pick: T('เลือกวิธี'), rem: T('จำไว้นะ'), label: T('ติดป้าย'), same: T('คนเดียวกัน'), change: T('เปลี่ยนได้') };
      host.insertAdjacentHTML('beforeend', line('ap-h', 'คุยทีละคน ดูจากงานจริง', V ? 56 : 64) + gridHtml(L, 'ap-g', false) +
        '<div class="ap-dot" style="position:absolute;left:0;top:0;width:76px;height:76px;border-radius:50%;background:var(--main);border:7px solid var(--ink);box-shadow:6px 8px 0 rgba(0,0,0,.2)"></div>' +
        '<p class="pill ap-job" style="font-size:' + (V ? 36 : 36) + 'px">งาน: รับออร์เดอร์</p>' +
        '<p class="stamp ap-st" style="font-size:' + (V ? 46 : 52) + 'px">ไม่ใช่ป้าย "เก่ง / ขี้เกียจ"</p>' +
        line('ap-r', 'คนเดียวกัน อยู่คนละช่องในแต่ละงาน และเปลี่ยนได้เสมอ', V ? 38 : 42, 'red'));
      Object.assign(this, { hh: q(host, '.ap-h'), dot: q(host, '.ap-dot'), job: q(host, '.ap-job'), st: q(host, '.ap-st'), r: q(host, '.ap-r') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.hh, t, C.talk - 0.4, undefined, at(L.tx, L.ty));
      gridRender(this.host, 'ap-g', L, false, t, [-1, -1, -1, -1]);
      if (V) q(this.host, '.ap-g').style.transform = at(120, 560) + ' scale(.96)';
      // one person across three jobs: taking orders (guide) → explaining the menu (delegate) → closing up (excite)
      const jobs = [['รับออร์เดอร์', 0], ['แนะนำเมนู', 1], ['ปิดร้าน', 3]], t0 = C.same - 0.3, k = t < t0 ? 0 : Math.min(2, Math.floor((t - t0) / 1.2) + 1);
      const from = quadCentre(L, false, jobs[Math.max(0, k - 1)][1]), to = quadCentre(L, false, jobs[k][1]), p = k === 0 ? 1 : eio(seg(t, t0 + (k - 1) * 1.2, t0 + (k - 1) * 1.2 + 0.6));
      const sc = V ? 0.96 : 1, gx = V ? 120 : 0, gy = V ? 560 : 0, g = gridGeo(L, false);
      const fx = (x) => V ? gx + (x - g.x) * sc : x, fy = (y) => V ? gy + (y - g.y) * sc : y;
      CF.pop(this.dot, t, C.pick - 0.3, undefined, mid(fx(lerp(from[0], to[0], p)) + 90, fy(lerp(from[1], to[1], p)) + 40));
      this.job.textContent = 'งาน: ' + jobs[k][0];
      CF.pop(this.job, t, C.pick - 0.2, undefined, V ? mid(540, 1240) : mid(1400, 620), -1);
      CF.slam(this.st, t, C.label - 0.3, V ? mid(540, 1360) : mid(1400, 420), -3, 1.6);
      CF.pop(this.r, t, C.same - 0.3, undefined, V ? at(80, 1440) : at(1000, 780));
      this.r.style.whiteSpace = 'normal'; this.r.style.width = V ? '900px' : '820px';
    },
  };

  // =========================================================================================== result (+ key takeaway)
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result');
      this.C = { wk: T('หลายสัปดาห์'), a: T('แม่นขึ้น'), b: T('มีส่วนร่วม'), c: T('พัฒนาระบบ'), team: T('พัฒนาทีม') };
      const ok = (cls, s) => '<p class="t ' + cls + '" style="font-size:' + (V ? 48 : 56) + 'px"><span style="color:var(--d)">✓</span> ' + s + '</p>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'rs-tape') + '<p class="pill rs-wk" style="font-size:' + (V ? 44 : 42) + 'px">หลายสัปดาห์ต่อมา</p>' +
        ok('rs-a', 'พนักงานใหม่รับออร์เดอร์แม่นขึ้น') + ok('rs-b', 'คนที่เคยหมดไฟกลับมามีส่วนร่วม') + ok('rs-c', 'หัวหน้าครัวได้พัฒนาระบบของตัวเอง') +
        '<p class="t rs-k" style="font-size:' + (V ? 50 : 56) + 'px;white-space:normal;width:' + (V ? 900 : 1700) + 'px;line-height:1.3">คนต่างกัน <span style="color:var(--main)">ต้องการการสนับสนุนที่ต่างกัน</span></p>');
      Object.assign(this, { tape: q(host, '.rs-tape'), wk: q(host, '.rs-wk'), ls: ['a', 'b', 'c'].map((k) => q(host, '.rs-' + k)), k: q(host, '.rs-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, y = V ? 560 : 440, dy = V ? 130 : 130;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.wk, t, C.wk - 0.3, undefined, at(L.tx, L.ty), -2);
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.ls[i], t, c0 - 0.6, undefined, at(L.tx, y + i * dy)));
      CF.slam(this.k, t, C.team - 0.2, V ? at(80, 1100) : at(110, 860), -1, 1.4);
    },
  };

  // =========================================================================================== close (the bridge to Situational Leadership)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { new: T('คำถามใหม่'), q0: T('สอนมากแค่ไหน'), q1: T('ปล่อยให้ลอง', 'เมื่อไหร่'), q2: T('ถอยออกมา', 'เข้าไปช่วย'), lead: T('ผู้นำ'), next: T('ตอนหน้า'), sl: T('ลีดเดอร์ชิป', 'ซิชวล'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const Q = ['คนที่ยังไม่พร้อม: สอนมากแค่ไหน?', 'คนที่เริ่มทำได้: ปล่อยให้ลองเมื่อไหร่?', 'คนที่เก่งแล้ว: เข้าไปช่วย หรือถอยออกมา?'];
      host.insertAdjacentHTML('beforeend', line('cl-h', 'คำถามใหม่…', V ? 64 : 72) + Q.map((s, i) => '<p class="note cl-q' + i + '" style="font-size:' + (V ? 34 : 38) + 'px;background:' + ['#BFD6F2', '#FFE680', '#BFE5CC'][i] + '">' + s + '</p>').join('') +
        '<p class="sticker cl-l" style="font-size:' + (V ? 40 : 46) + 'px">จะปรับวิธีเป็นผู้นำให้เหมาะกับแต่ละคนยังไง?</p>' +
        nextCard(V, 'cl-next', 'Situational Leadership', 'ปรับสไตล์ผู้นำตามความพร้อมของแต่ละคน') + siteBlock(V, 'Coaching / Performance Management · Max Landsberg'));
      Object.assign(this, { hh: q(host, '.cl-h'), qs: [0, 1, 2].map((i) => q(host, '.cl-q' + i)), l: q(host, '.cl-l'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.hh, t, C.new - 0.4, out, at(L.tx, L.ty));
      const P = V ? [[540, 600], [540, 760], [540, 920]] : [[560, 480], [960, 640], [1360, 480]];
      [C.q0, C.q1, C.q2].forEach((c0, i) => CF.pop(this.qs[i], t, c0 - 0.6, out, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.slam(this.l, t, C.lead - 0.4, V ? mid(540, 1120) : mid(960, 860), -2, 1.6);
      if (t > out) this.l.style.opacity = (+this.l.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.sl) * 8) * Math.exp(-Math.max(0, t - C.sl) * 3);
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
