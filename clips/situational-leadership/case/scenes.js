/* Situational Leadership, episode 10 of the restaurant series (docs/videos/series.md). One scene module per id, drawn
   from scene-local time only, same look and helpers (cf.js) as episodes 4–9. One directive × supportive grid is shared
   by the four style scenes (the current style lit, who needs it, what the owner does and two level meters); the apply
   scene places the whole team on the grid. Tone: warm, never judging the staff. Cues are spoken words. */
(() => {
  const CF = window.CF, K = CF.K, { seg, lerp } = K;
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
  const person = (w) => fig(CF.body('#1D2430'), w, 255), chef = (w) => fig(CF.chef('#1D2430'), w, 335);
  const nextCard = (V, cls, title, sub) => '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + (V ? 880 : 800) + 'px;padding:26px 36px 32px;background:var(--accent);color:var(--ink);border-radius:20px;border:7px solid var(--ink);box-shadow:12px 14px 0 rgba(0,0,0,.25);transform-origin:50% 50%">' +
    '<p style="font-weight:700;font-size:' + (V ? 38 : 34) + 'px;color:var(--main)">ตอนหน้า</p><p style="font-weight:700;font-size:' + (V ? 60 : 58) + 'px;line-height:1.05;white-space:nowrap">' + title + ' ▶</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 36 : 32) + 'px;line-height:1.35">' + sub + '</p></div>';
  const siteBlock = (V, org) => line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
    '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
    '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
    '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: ' + org + '</p>' +
    '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>';

  // ----------------------------------------------------------------------------------------- the grid
  // x = supportive (low → high), y = directive (high on top): 0 S1 Directing, 1 S2 Coaching, 2 S4 Delegating, 3 S3 Supporting
  const QD = [['S1 Directing', 'ชี้แนะมาก · สนับสนุนน้อย', '#F7C6BD'], ['S2 Coaching', 'ชี้แนะมาก · สนับสนุนมาก', '#FFE680'], ['S4 Delegating', 'ชี้แนะน้อย · สนับสนุนน้อย', '#BFE5CC'], ['S3 Supporting', 'ชี้แนะน้อย · สนับสนุนมาก', '#BFD6F2']];
  const gridGeo = (L, big) => L.V ? { x: 120, y: big ? 560 : 520, w: 840, h: big ? 700 : 560 } : { x: big ? 860 : 120, y: big ? 260 : 440, w: big ? 900 : 760, h: big ? 700 : 520 };
  const gridHtml = (L, cls, big) => {
    const g = gridGeo(L, big); let s = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px;height:' + g.h + 'px;transform-origin:0 0">';
    QD.forEach(([a, b, c], i) => {
      s += '<div class="' + cls + '-q' + i + '" style="position:absolute;left:' + (i % 2) * g.w / 2 + 'px;top:' + Math.floor(i / 2) * g.h / 2 + 'px;width:' + (g.w / 2 - 10) + 'px;height:' + (g.h / 2 - 10) + 'px;background:' + c + ';border:6px solid var(--ink);border-radius:20px;padding:14px 18px">' +
        '<p style="font-weight:700;font-size:' + (L.V ? 38 : (big ? 40 : 34)) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (big ? 26 : 24) + 'px;color:var(--ink2)">' + b + '</p></div>';
    });
    s += '<p style="position:absolute;left:0;top:' + (g.h + 10) + 'px;width:' + g.w + 'px;text-align:center;font-weight:700;font-size:30px;color:var(--ink2)">การสนับสนุน →</p>';
    s += '<p style="position:absolute;left:-70px;top:' + g.h / 2 + 'px;transform:rotate(-90deg) translate(-50%,0);transform-origin:0 0;font-weight:700;font-size:30px;color:var(--ink2);white-space:nowrap">การชี้แนะ →</p>';
    return s + '</div>';
  };
  const gridRender = (host, cls, L, big, t, tIn, lit, t0) => {
    const g = gridGeo(L, big), root = q(host, '.' + cls); root.style.transform = at(g.x, g.y);
    QD.forEach((_, i) => {
      const e = q(host, '.' + cls + '-q' + i); CF.pop(e, t, (tIn || [])[i] ?? -1, undefined, '');
      if (lit !== undefined && lit >= 0) { const d = seg(t, t0, t0 + 0.3); e.style.opacity = (+e.style.opacity * (i === lit ? 1 : 1 - 0.65 * d)).toFixed(2); e.style.boxShadow = i === lit && d > 0.5 ? '0 0 0 8px var(--main)' : ''; }
    });
  };
  const quadCentre = (L, big, i) => { const g = gridGeo(L, big); return [g.x + (i % 2 + 0.5) * g.w / 2, g.y + (Math.floor(i / 2) + 0.5) * g.h / 2]; };

  // two level meters (directive, supportive), four blocks each
  const meterHtml = (V, cls) => '<div class="card ' + cls + '" style="padding:16px 28px 20px">' + ['ชี้แนะ', 'สนับสนุน'].map((n, r) =>
    '<div style="display:flex;align-items:center;gap:12px;margin:4px 0"><p style="font-weight:700;font-size:' + (V ? 34 : 34) + 'px;width:' + (V ? 170 : 170) + 'px">' + n + '</p>' +
    [0, 1, 2, 3].map((k) => '<span class="' + cls + '-b' + r + k + '" style="display:inline-block;width:' + (V ? 92 : 96) + 'px;height:34px;border:5px solid var(--ink);border-radius:10px;background:var(--paper)"></span>').join('') + '</div>').join('') + '</div>';
  const meterRender = (host, cls, t, t0, lv) => lv.forEach((n, r) => [0, 1, 2, 3].forEach((k) => {
    const e = q(host, '.' + cls + '-b' + r + k), on = k < n && t > t0 + r * 0.35 + k * 0.1; e.style.background = on ? (r ? 'var(--p)' : 'var(--main)') : 'var(--paper)';
  }));

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { go: T('เดินไปบอก', 'หัวหน้าครัว'), a: T('เตรียมของ'), b: T('จัดจาน'), look: T('หันมามอง'), ten: T('สิบปี', 'พี่ครับ'), oh: T('อ้าว'), ann: T('น่ารำคาญ') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') +
        '<div class="hk-o" style="position:absolute;left:0;top:0">' + person(V ? 190 : 210) + '<p class="t" style="position:relative;font-size:' + (V ? 32 : 34) + 'px;text-align:center">เจ้าของร้าน</p></div>' +
        '<div class="hk-c" style="position:absolute;left:0;top:0">' + chef(V ? 190 : 210) + '<p class="t" style="position:relative;font-size:' + (V ? 32 : 34) + 'px;text-align:center">หัวหน้าครัว</p></div>' +
        '<p class="note blue hk-n0" style="font-size:' + (V ? 38 : 44) + 'px">ต้องเตรียมของยังไง!</p><p class="note blue hk-n1" style="font-size:' + (V ? 38 : 44) + 'px">ต้องจัดจานแบบไหน!</p>' +
        '<p class="sticker hk-r" style="font-size:' + (V ? 42 : 48) + 'px">พี่ครับ ผมทำงานนี้มาสิบปีแล้วนะครับ!</p>' +
        '<p class="stamp hk-st" style="font-size:' + (V ? 50 : 62) + 'px">หัวหน้าที่ดี → หัวหน้าน่ารำคาญ?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), o: q(host, '.hk-o'), c: q(host, '.hk-c'), n0: q(host, '.hk-n0'), n1: q(host, '.hk-n1'), r: q(host, '.hk-r'), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.o, t, 0.15, undefined, V ? mid(270, 1000) : mid(480, 600));
      CF.pop(this.c, t, C.go - 0.3, undefined, V ? mid(810, 1000) : mid(1440, 600) + ' rotate(' + (CF.shake(t, C.look, 3)).toFixed(2) + 'deg)');
      CF.pop(this.n0, t, C.a - 0.3, C.ten - 0.3, V ? mid(480, 560) : mid(900, 300), -3);
      CF.pop(this.n1, t, C.b - 0.3, C.ten - 0.3, V ? mid(560, 700) : mid(980, 450), 2);
      CF.slam(this.r, t, C.ten - 0.3, V ? mid(540, 640) : mid(1150, 180), -2, 1.6);
      CF.slam(this.st, t, C.ann - 0.6, V ? mid(540, 1400) : mid(960, 990), -3, 1.8);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { sw: T('สกิล', 'เมทริกซ์'), diff: T('ไม่เท่ากัน'), q0: T('ช่วยแค่ไหน', 'แค่ไหน'), q1: T('ปล่อยให้', 'ทำเอง') };
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        '<div class="card rc-c" style="width:' + (V ? 880 : 900) + 'px;padding:22px 32px 28px"><p style="font-weight:700;font-size:' + (V ? 32 : 30) + 'px;color:var(--ink2)">ตอน 9</p><p style="font-weight:700;font-size:' + (V ? 60 : 64) + 'px">Skill / Will Matrix</p>' +
        '<p class="rc-d" style="font-weight:700;font-size:' + (V ? 40 : 42) + 'px;color:var(--main)">แต่ละคนพร้อมไม่เท่ากัน</p></div>' +
        '<p class="note rc-q0" style="font-size:' + (V ? 44 : 50) + 'px">ควรเข้าไปช่วยแค่ไหน?</p><p class="note green rc-q1" style="font-size:' + (V ? 44 : 50) + 'px">เมื่อไหร่ควรปล่อยให้ทำเอง?</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), c: q(host, '.rc-c'), d: q(host, '.rc-d'), q0: q(host, '.rc-q0'), q1: q(host, '.rc-q1') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.c, t, C.sw - 0.4, undefined, V ? mid(540, 600) : mid(700, 480), -1);
      this.d.style.opacity = seg(t, C.diff - 0.5, C.diff - 0.2).toFixed(2);
      CF.pop(this.q0, t, C.q0 - 0.4, undefined, V ? mid(480, 950) : mid(1380, 720), -3);
      CF.pop(this.q1, t, C.q1 - 0.4, undefined, V ? mid(600, 1150) : mid(1100, 880), 2);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea'); this.host = host;
      this.C = { name: T('ซิชวล', 'ลีดเดอร์ชิป'), d: T('การชี้แนะ', 'ชี้แนะ'), s: T('การสนับสนุน', 'สนับสนุน'), four: T('สี่แบบ') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 96 : 96) + 'px;color:var(--main)">Situational<br>Leadership</p>' +
        '<p class="pill id-d" style="font-size:' + (V ? 36 : 36) + 'px">ชี้แนะ = บอกวิธีทำมากแค่ไหน</p><p class="pill id-s" style="font-size:' + (V ? 36 : 36) + 'px">สนับสนุน = รับฟัง ให้กำลังใจแค่ไหน</p>' + gridHtml(L, 'id-g', true));
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), d: q(host, '.id-d'), s: q(host, '.id-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.d, t, C.d - 0.3, undefined, V ? at(L.tx, 1290) : at(L.tx, 640), -2);
      CF.pop(this.s, t, C.s - 0.3, undefined, V ? at(L.tx, 1380) : at(L.tx, 740), 2);
      gridRender(this.host, 'id-g', L, true, t, [0, 1, 3, 2].map((k) => C.four - 0.3 + k * 0.15));
      if (V) q(this.host, '.id-g').style.transform = at(120, 600) + ' scale(.86)';
    },
  };

  // =========================================================================================== the four styles
  const EX = {
    s1: { qi: 0, n: 'แบบที่ 1', h: 'ชี้แนะชัดเจน', who: 'พนักงานใหม่ วันแรก|อยากทำ แต่ยังทำไม่เป็น', acts: ['ขั้นตอนชัด', 'ตัวอย่างให้ดู', 'ดูระหว่างทาง'], quote: 'แล้วจะให้เริ่มตรงไหนล่ะครับพี่!', lv: [4, 1],
      cue: { who: ['วันแรก', 'พนักงานใหม่'], a0: ['ขั้นตอน'], a2: ['ระหว่างทาง'], quote: ['เริ่มตรงไหน', 'จะให้เริ่ม'], lv: ['ชี้แนะมาก'] } },
    s2: { qi: 1, n: 'แบบที่ 2', h: 'สอนพร้อมให้กำลังใจ', who: 'วันเสาร์ ลูกค้าเข้าหลายโต๊ะ|ทำผิด จนเสียความมั่นใจ', acts: ['อธิบายเหตุผล', 'สาธิตให้ดู', 'ชมเมื่อดีขึ้น'], quote: '', lv: [4, 4],
      cue: { who: ['วันเสาร์'], a0: ['อธิบายเหตุผล', 'อธิบาย'], a2: ['ชมเมื่อ', 'ทำได้ดีขึ้น'], quote: [], lv: ['ชี้แนะมาก'] } },
    s3: { qi: 3, n: 'แบบที่ 3', h: 'สนับสนุน', who: 'คล่องแล้ว|แต่ยังไม่กล้าตัดสินใจเอง', acts: ['ถามกลับ', 'รับฟัง', 'ลองตัดสินใจในขอบเขต'], quote: 'ถ้าเป็นเรา จะจัดการยังไง?', lv: [2, 4],
      cue: { who: ['คล่องแล้ว', 'เริ่มคล่อง'], a0: ['ถามกลับ'], a2: ['ขอบเขต'], quote: ['ถ้าเป็นเรา'], lv: ['ชี้แนะน้อยลง', 'น้อยลง'] } },
    s4: { qi: 2, n: 'แบบสุดท้าย', h: 'มอบหมาย', who: 'หัวหน้าครัว|ประสบการณ์สูง', acts: ['เป้าหมาย', 'ขอบเขต', 'วิธีทำ เลือกเอง'], quote: 'ไม่ขัดจังหวะคนที่ทำเป็นอยู่แล้ว!', lv: [1, 1],
      cue: { who: ['หัวหน้าครัว'], a0: ['เป้าหมาย'], a2: ['เลือกเอง'], quote: ['ขัดจังหวะ'], lv: ['เป้าหมาย'] } },
  };
  const styleScene = (id) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, id), X = EX[id]; this.host = host; this.X = X;
      this.C = { who: T(...X.cue.who), a0: T(...X.cue.a0), a2: T(...X.cue.a2), quote: X.quote ? T(...X.cue.quote) : 0, lv: T(...X.cue.lv) };
      const [w1, w2] = X.who.split('|');
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + '<p class="pill ' + id + '-n" style="font-size:36px">' + X.n + ' · ' + QD[X.qi][0] + '</p>' + line(id + '-h', X.h, V ? 64 : 70) + gridHtml(L, id + '-g', false) +
        '<div class="card ' + id + '-ex" style="width:' + (V ? 900 : 860) + 'px;padding:20px 30px 26px"><div style="display:flex;gap:20px;align-items:center">' + (X.qi === 2 ? chef(V ? 76 : 80) : person(V ? 80 : 84)) +
          '<div><p style="font-weight:700;font-size:' + (V ? 40 : 42) + 'px;line-height:1.2">' + w1 + '</p><p style="font-weight:700;font-size:' + (V ? 32 : 34) + 'px;line-height:1.2;color:var(--ink2)">' + w2 + '</p></div></div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:14px">' + X.acts.map((a, k) => '<span class="' + id + '-a' + k + '" style="display:inline-block;background:' + QD[X.qi][2] + ';border:5px solid var(--ink);border-radius:999px;padding:4px 22px 8px;font-weight:700;font-size:' + (V ? 34 : 34) + 'px">' + a + '</span>').join('') + '</div></div>' +
        meterHtml(V, id + '-m') + (X.quote ? '<p class="sticker ' + id + '-q" style="font-size:' + (V ? 40 : 42) + 'px">' + X.quote + '</p>' : ''));
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), n: q(host, '.' + id + '-n'), h: q(host, '.' + id + '-h'), ex: q(host, '.' + id + '-ex'), m: q(host, '.' + id + '-m'), as: X.acts.map((_, k) => q(host, '.' + id + '-a' + k)), qq: q(host, '.' + id + '-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, X = this.X;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.n, t, 0.1, undefined, at(L.tx, L.ty - 10), -2);
      CF.slam(this.h, t, 0.3, at(L.tx, L.ty + 80), -1, 1.4);
      gridRender(this.host, id + '-g', L, false, t, [-1, -1, -1, -1], X.qi, 0.4);
      if (V) q(this.host, '.' + id + '-g').style.transform = at(250, 560) + ' scale(.72)';
      CF.pop(this.ex, t, C.who - 0.3, undefined, V ? mid(540, 1085) : mid(1380, 530), -1);
      this.as.forEach((a, k) => { const t0 = lerp(C.a0, Math.max(C.a0 + 0.6, C.a2), k / 2) - 0.2; a.style.opacity = seg(t, t0, t0 + 0.2).toFixed(2); });
      CF.pop(this.m, t, C.lv - 0.5, undefined, V ? mid(540, 1320) : mid(1380, 775));
      meterRender(this.host, id + '-m', t, C.lv - 0.3, X.lv);
      if (this.qq) CF.slam(this.qq, t, C.quote - 0.3, V ? mid(540, 1455) : mid(1380, 935), -2, 1.5);
    },
  });
  for (const id of Object.keys(EX)) CF.scenes[id] = styleScene(id);

  // =========================================================================================== twist: same chef, different job
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'twist');
      this.C = { wait: T('เดี๋ยวก่อน'), cook: T('คนเดิม', 'หัวหน้าครัว'), stock: T('ระบบสต็อก', 'สต็อก'), back: T('อีกครั้ง', 'กลับไป'), not: T('ตำแหน่ง'), ready: T('ความพร้อม'), job: T('กำลังทำอยู่', 'ในงาน') };
      const R = [['ทำอาหาร', 'S4 มอบหมาย', '#BFE5CC'], ['ระบบสต็อกใหม่', 'S1 ชี้แนะใหม่', '#F7C6BD']];
      host.insertAdjacentHTML('beforeend', '<p class="sticker tw-w" style="font-size:' + (V ? 56 : 64) + 'px">แต่เดี๋ยวก่อน!</p>' +
        '<div class="tw-c" style="position:absolute;left:0;top:0">' + chef(V ? 150 : 170) + '</div>' +
        R.map(([a, b, c], i) => '<div class="card tw-r' + i + '" style="width:' + (V ? 760 : 980) + 'px;padding:18px 30px;display:flex;justify-content:space-between;align-items:center;background:' + c + '"><p style="font-weight:700;font-size:' + (V ? 42 : 48) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 42 : 48) + 'px">→ ' + b + '</p></div>').join('') +
        '<p class="stamp tw-st" style="font-size:' + (V ? 44 : 52) + 'px">ไม่ได้ดูจากตำแหน่ง · อายุงาน</p>' +
        '<p class="t tw-k" style="font-size:' + (V ? 50 : 56) + 'px;white-space:normal;width:' + (V ? 900 : 1500) + 'px;line-height:1.3">ดูจาก <span style="color:var(--main)">ความพร้อม ในงานที่กำลังทำอยู่</span></p>');
      Object.assign(this, { w: q(host, '.tw-w'), c: q(host, '.tw-c'), rs: [0, 1].map((i) => q(host, '.tw-r' + i)), st: q(host, '.tw-st'), k: q(host, '.tw-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.slam(this.w, t, C.wait - 0.3, V ? mid(540, 400) : mid(420, 200), -3, 1.8);
      CF.pop(this.c, t, C.cook - 0.3, undefined, V ? mid(160, 690) : mid(260, 500));
      CF.pop(this.rs[0], t, C.cook - 0.1, undefined, V ? mid(620, 610) : mid(960, 420), -1);
      CF.pop(this.rs[1], t, C.stock - 0.3, undefined, V ? mid(620, 770) : mid(960, 580), 1);
      CF.slam(this.st, t, C.not - 0.3, V ? mid(540, 1020) : mid(960, 770), -3, 1.8);
      CF.pop(this.k, t, C.ready - 0.4, undefined, V ? at(80, 1160) : at(220, 880));
    },
  };

  // =========================================================================================== apply: the whole team on the grid
  CF.scenes.apply = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'apply'); this.host = host;
      this.C = { h: T('ปรับวิธี'), p: [T('คนใหม่'), T('เริ่มทำได้'), T('ยังไม่มั่นใจ'), T('คนที่พร้อม', 'อำนาจ')] };
      const P = [['คนใหม่', 'เรียนเป็นขั้นตอน', 0], ['เริ่มทำได้', 'ฝึก + คำแนะนำ', 1], ['ยังไม่มั่นใจ', 'ได้กำลังใจ', 3], ['พร้อมแล้ว', 'ได้อำนาจตัดสินใจ', 2]];
      this.P = P;
      host.insertAdjacentHTML('beforeend', line('ap-h', 'ทั้งร้าน ปรับตามความพร้อม', V ? 56 : 64) + gridHtml(L, 'ap-g', !V) +
        P.map(([a, b], i) => line('ap-l' + i, '<span style="color:var(--main)">' + a + '</span> → ' + b, V ? 40 : 46)).join('') +
        P.map(([a], i) => '<p class="pill ap-p' + i + '" style="font-size:' + (V ? 30 : 34) + 'px">' + a + '</p>').join(''));
      Object.assign(this, { hh: q(host, '.ap-h'), ls: [0, 1, 2, 3].map((i) => q(host, '.ap-l' + i)), ps: [0, 1, 2, 3].map((i) => q(host, '.ap-p' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.hh, t, C.h - 0.4, undefined, at(L.tx, L.ty));
      const big = !V; gridRender(this.host, 'ap-g', L, big, t, [-1, -1, -1, -1]);
      const g = gridGeo(L, big), sc = V ? 0.86 : 1, gx = V ? 120 : g.x, gy = V ? 900 : g.y;
      if (V) q(this.host, '.ap-g').style.transform = at(gx, gy) + ' scale(' + sc + ')';
      this.P.forEach(([, , qi], i) => {
        const c0 = C.p[i] - 0.3, [cx, cy] = quadCentre(L, big, qi);
        CF.pop(this.ls[i], t, c0, undefined, V ? at(L.tx, 500 + i * 88) : at(L.tx, 420 + i * 110));
        CF.pop(this.ps[i], t, c0 + 0.1, undefined, mid(gx + (cx - g.x) * sc, gy + (cy - g.y) * sc + (V ? 40 : 60)), [-3, 2, -2, 3][i]);
      });
    },
  };

  // =========================================================================================== result (+ key takeaway)
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result');
      this.C = { wk: T('หลายสัปดาห์'), a: T('ทำงานได้เอง'), b: T('อิสระ'), c: T('ดูแลทีม'), free: T('ยืนคุม', 'ไม่ต้อง'), lead: T('หน้าที่ของผู้นำ', 'หน้าที่') };
      const ok = (cls, s) => '<p class="t ' + cls + '" style="font-size:' + (V ? 46 : 54) + 'px"><span style="color:var(--d)">✓</span> ' + s + '</p>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'rs-tape') + '<p class="pill rs-wk" style="font-size:' + (V ? 44 : 42) + 'px">หลายสัปดาห์ต่อมา</p>' +
        ok('rs-a', 'พนักงานใหม่ทำงานได้เอง') + ok('rs-b', 'หัวหน้าครัวปรับระบบได้อิสระ') + ok('rs-c', 'หัวหน้าร้านดูแลทีมแทนได้มากขึ้น') +
        '<p class="sticker rs-f" style="font-size:' + (V ? 44 : 48) + 'px">ไม่ต้องยืนคุมทุกคนแล้ว!</p>' +
        '<p class="t rs-k" style="font-size:' + (V ? 48 : 52) + 'px;white-space:normal;width:' + (V ? 900 : 1700) + 'px;line-height:1.3">ผู้นำที่ดี ไม่ได้บริหารทุกคนเหมือนกัน<br><span style="color:var(--main)">แต่ปรับวิธีบริหารให้เหมาะกับ' + (V ? '<br>' : '') + 'ความพร้อมของแต่ละคน</span></p>');
      Object.assign(this, { tape: q(host, '.rs-tape'), wk: q(host, '.rs-wk'), ls: ['a', 'b', 'c'].map((k) => q(host, '.rs-' + k)), f: q(host, '.rs-f'), k: q(host, '.rs-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, y = V ? 540 : 420, dy = V ? 120 : 125;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.wk, t, C.wk - 0.3, undefined, at(L.tx, L.ty), -2);
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.ls[i], t, c0 - 0.6, undefined, at(L.tx, y + i * dy)));
      CF.slam(this.f, t, C.free - 0.5, V ? mid(540, 960) : mid(1450, 280), -3, 1.6);
      CF.slam(this.k, t, C.lead - 0.2, V ? at(80, 1070) : at(110, 830), -1, 1.3);
    },
  };

  // =========================================================================================== close (the bridge to Kanban)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { new: T('ปัญหาใหม่'), q0: T('ระบบสต็อก', 'สต็อก'), q1: T('อบรม'), q2: T('ซัพพลายเออร์'), walk: T('ทั้งวัน', 'เดินถาม'), see0: T('สถานะงาน', 'เห็นสถานะ'), next: T('ตอนหน้า'), kb: T('คัมบัง'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const Q = ['หัวหน้าครัว: ระบบสต็อกถึงไหนแล้ว?', 'หัวหน้าร้าน: อบรมเสร็จหรือยัง?', 'จัดซื้อ: ซัพพลายเออร์เรียบร้อยไหม?'];
      host.insertAdjacentHTML('beforeend', line('cl-h', 'ปัญหาใหม่…', V ? 64 : 72) + Q.map((s, i) => '<p class="note cl-q' + i + '" style="font-size:' + (V ? 34 : 38) + 'px;background:' + ['#BFD6F2', '#FFE680', '#BFE5CC'][i] + '">' + s + '</p>').join('') +
        '<p class="sticker cl-l" style="font-size:' + (V ? 40 : 46) + 'px">ไม่ต้องสั่งแล้ว… แต่ยังเดินถามทั้งวัน!</p>' +
        nextCard(V, 'cl-next', 'Kanban', 'ทุกคนเห็นสถานะงานร่วมกัน ไม่ต้องเดินถาม') + siteBlock(V, 'Leadership Studies · Paul Hersey & Ken Blanchard'));
      Object.assign(this, { hh: q(host, '.cl-h'), qs: [0, 1, 2].map((i) => q(host, '.cl-q' + i)), l: q(host, '.cl-l'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.hh, t, C.new - 0.4, out, at(L.tx, L.ty));
      const P = V ? [[540, 600], [540, 760], [540, 920]] : [[560, 480], [960, 640], [1360, 480]];
      [C.q0, C.q1, C.q2].forEach((c0, i) => CF.pop(this.qs[i], t, c0 - 0.5, out, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.slam(this.l, t, C.walk - 0.6, V ? mid(540, 1120) : mid(960, 860), -2, 1.6);
      if (t > out) this.l.style.opacity = (+this.l.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.kb) * 8) * Math.exp(-Math.max(0, t - C.kb) * 3);
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
