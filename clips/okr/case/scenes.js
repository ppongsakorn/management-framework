/* OKR, episode 12 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from scene-local
   time only, same look and helpers (cf.js) as episodes 4–11. The three Key Results are one shared row set (baseline,
   target tick, reached value), used to set them, track them and read the quarter's result. Tone: proud, then the
   twist, then growth with a shared goal. Cues are spoken words. */
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
  // ----------------------------------------------------------------------------------------- key result rows
  // [label, from, to, max, got?]: a bar from 0 to max, filled to `from` (or animated to `got`), a target tick at `to`
  const KR = [['ลูกค้ากลับมาซื้อซ้ำ', 30, 45, 60, 43], ['ได้อาหารภายใน 15 นาที', 80, 95, 100, 96], ['อัตรากำไร', 12, 16, 20, 15]];
  const krHtml = (V, cls, w) => KR.map(([a, f, to, mx], i) => '<div class="card ' + cls + i + '" style="width:' + w + 'px;padding:14px 26px 18px">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><p style="font-weight:700;font-size:' + (V ? 31 : 38) + 'px;white-space:nowrap">KR' + (i + 1) + ' ' + a + '</p>' +
    '<p class="' + cls + i + '-v" style="font-weight:700;font-size:' + (V ? 32 : 42) + 'px;white-space:nowrap">' + f + '% → <span style="color:var(--main)">' + to + '%</span></p></div>' +
    '<div style="position:relative;height:30px;margin-top:8px;border:5px solid var(--ink);border-radius:10px;background:var(--paper)"><div class="' + cls + i + '-f" style="position:absolute;left:0;top:0;bottom:0;width:' + (f / mx * 100).toFixed(1) + '%;background:#BFD6F2;border-radius:5px"></div>' +
    '<div style="position:absolute;top:-12px;bottom:-12px;left:' + (to / mx * 100).toFixed(1) + '%;width:7px;margin-left:-3px;background:var(--main)"></div></div></div>').join('');
  // fill the bars from `from` to the value they reached (`got`), and rewrite the value text
  const krReach = (host, cls, t, T0) => KR.forEach(([, f, to, mx, got], i) => {
    const u = eio(seg(t, T0[i], T0[i] + 0.8)), v = Math.round(lerp(f, got, u)), e = q(host, '.' + cls + i + '-f');
    e.style.width = (v / mx * 100).toFixed(1) + '%'; e.style.background = u > 0.99 ? (got >= to ? 'var(--d)' : '#FFC21A') : '#BFD6F2';
    if (u > 0) q(host, '.' + cls + i + '-v').innerHTML = f + '% → <b>' + v + '%</b> <span style="color:var(--ink2);font-size:.7em">(เป้า ' + to + '%)</span>' + (u > 0.99 ? (got >= to ? ' ✓' : '') : '');
  });
  const objCard = (V, cls, w) => '<div class="card ' + cls + '" style="width:' + w + 'px;padding:16px 30px 20px;background:#FFF4E3"><p style="font-weight:700;font-size:' + (V ? 30 : 30) + 'px;color:var(--main)">Objective · ไตรมาสนี้</p>' +
    '<p style="font-weight:700;font-size:' + (V ? 42 : 44) + 'px;line-height:1.25">ร้านที่ลูกค้าอยากกลับมาอีก<br>และเติบโตอย่างมีกำไร</p></div>';

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { a: T('สต็อก'), b: T('อบรม'), c: T('เตา'), n: T('ยี่สิบ'), open: T('ผลประกอบการ'), oh: T('อ้าว'), rep: T('ซื้อซ้ำ'), pr: T('กำไร'), why: T('ไม่ไปไหน', 'ทำไมธุรกิจ') };
      const J = ['ระบบสต็อก', 'อบรมพนักงาน', 'ตารางดูแลเตา'];
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + J.map((s, i) => '<p class="note green hk-j' + i + '" style="font-size:' + (V ? 40 : 44) + 'px">✓ ' + s + ' เสร็จ!</p>').join('') +
        '<div class="card hk-n" style="padding:12px 30px 18px;background:#BFE5CC"><p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px">เดือนนี้เสร็จ <span style="font-size:' + (V ? 86 : 96) + 'px">20</span> เรื่อง 🎉</p></div>' +
        '<div class="card hk-r" style="width:' + (V ? 880 : 760) + 'px;padding:18px 30px 24px"><p style="font-weight:700;font-size:' + (V ? 32 : 32) + 'px;color:var(--ink2)">ผลประกอบการ</p>' +
        '<p class="hk-r0" style="font-weight:700;font-size:' + (V ? 42 : 44) + 'px">ลูกค้ากลับมาซื้อซ้ำ <span style="color:var(--main)">ยังน้อย ↘</span></p><p class="hk-r1" style="font-weight:700;font-size:' + (V ? 42 : 44) + 'px">กำไร <span style="color:var(--main)">แทบไม่เพิ่ม →</span></p></div>' +
        '<p class="stamp hk-st" style="font-size:' + (V ? 50 : 60) + 'px">งานเสร็จเยอะ… ธุรกิจไม่ไปไหน?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), js: [0, 1, 2].map((i) => q(host, '.hk-j' + i)), n: q(host, '.hk-n'), r: q(host, '.hk-r'), r0: q(host, '.hk-r0'), r1: q(host, '.hk-r1'), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.open - 0.2;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      const P = V ? [[540, 480], [540, 620], [540, 760]] : [[520, 380], [960, 300], [1400, 380]];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.js[i], t, c0 - 0.3, out, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.slam(this.n, t, C.n - 0.4, V ? mid(540, 960) : mid(960, 600), -2, 1.6);
      if (t > out) this.n.style.opacity = (+this.n.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      CF.pop(this.r, t, C.open - 0.1, undefined, V ? mid(540, 700) : mid(960, 470), -1);
      this.r0.style.opacity = seg(t, C.rep - 0.3, C.rep).toFixed(2); this.r1.style.opacity = seg(t, C.pr - 0.3, C.pr).toFixed(2);
      CF.slam(this.st, t, C.why - 0.6, V ? mid(540, 1080) : mid(960, 860), -3, 1.7);
      if (V) { this.st.style.whiteSpace = 'normal'; this.st.style.width = '900px'; this.st.style.textAlign = 'center'; }
    },
  };

  // =========================================================================================== recap: fast, but the wrong way
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { kb: T('คัมบัง'), not: T('ไม่ได้แปลว่า'), run: T('วิ่งเร็ว'), wrong: T('ผิดทาง'), far: T('ห่าง'), where: T('ทางไหน') };
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        '<div class="card rc-c" style="width:' + (V ? 880 : 760) + 'px;padding:18px 28px 22px"><p style="font-weight:700;font-size:' + (V ? 30 : 28) + 'px;color:var(--ink2)">ตอน 11 · Kanban</p><p style="font-weight:700;font-size:' + (V ? 44 : 44) + 'px">ส่งงานเสร็จต่อเนื่อง ✓</p></div>' +
        '<p class="t rc-flag" style="font-size:' + (V ? 110 : 120) + 'px">🚩</p><p class="t mute rc-fl" style="font-size:30px">เป้าหมาย</p>' +
        '<div class="rc-p" style="position:absolute;left:0;top:0">' + person(V ? 120 : 140) + '</div>' +
        '<p class="t rc-sp" style="font-size:' + (V ? 70 : 80) + 'px;color:var(--ink2)">≡</p>' +
        '<p class="sticker rc-s" style="font-size:' + (V ? 42 : 48) + 'px">ยิ่งเร็ว ยิ่งห่างจุดหมาย!</p>' +
        '<p class="note rc-q" style="font-size:' + (V ? 42 : 48) + 'px">เรากำลังพาร้านไปทางไหน?</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), c: q(host, '.rc-c'), flag: q(host, '.rc-flag'), fl: q(host, '.rc-fl'), p: q(host, '.rc-p'), sp: q(host, '.rc-sp'), s: q(host, '.rc-s'), qq: q(host, '.rc-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      CF.pop(this.c, t, C.kb - 0.4, undefined, V ? mid(540, 480) : mid(560, 330), -1);
      const y = V ? 900 : 640, fx = V ? 150 : 260;
      CF.pop(this.flag, t, C.run - 0.4, undefined, at(fx - 40, y - (V ? 120 : 130)));
      CF.pop(this.fl, t, C.run - 0.2, undefined, at(fx - 50, y + (V ? 10 : 10)));
      const run = Math.max(0, t - C.wrong), x = (V ? 460 : 700) + Math.min(run, 6) * (V ? 70 : 140);
      CF.pop(this.p, t, C.run - 0.3, undefined, mid(x, y - (V ? 40 : 60), ' rotate(' + (Math.sin(t * 14) * 4).toFixed(1) + 'deg)'));
      CF.pop(this.sp, t, C.wrong, undefined, mid(x - (V ? 110 : 130), y - (V ? 60 : 80)));
      CF.slam(this.s, t, C.far - 0.5, V ? mid(540, 1130) : mid(1400, 330), -3, 1.6);
      CF.pop(this.qq, t, C.where - 0.5, undefined, V ? mid(540, 1320) : mid(960, 920), -2);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea');
      this.C = { name: T('โอเคอาร์'), o: T('ออบเจกทีฟ'), kr: T('คีย์', 'รีซัลท์ส'), q0: T('จะไปไหน'), q1: T('ไปถึงแล้ว', 'รู้ได้ยังไง') };
      const box = (cls, a, b, c, d) => '<div class="card ' + cls + '" style="width:' + (V ? 900 : 760) + 'px;padding:18px 30px 22px;background:' + d + '"><p style="font-weight:700;font-size:' + (V ? 50 : 54) + 'px"><span style="color:var(--main)">' + a + '</span> ' + b + '</p><p class="' + cls + '-q" style="font-weight:700;font-size:' + (V ? 40 : 42) + 'px">' + c + '</p></div>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 140 : 150) + 'px;color:var(--main)">OKR</p>' +
        '<p class="t mute id-full" style="font-size:' + (V ? 40 : 42) + 'px">Objectives and Key Results</p>' +
        box('id-o', 'O', 'Objective', 'เราจะไปไหน?', '#FFF4E3') + box('id-k', 'KR', 'Key Results', 'รู้ได้ยังไงว่าไปถึงแล้ว? (วัดได้)', '#BFD6F2'));
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), full: q(host, '.id-full'), o: q(host, '.id-o'), k: q(host, '.id-k'), oq: q(host, '.id-o-q'), kq: q(host, '.id-k-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 30), -2, 1.6);
      CF.pop(this.full, t, C.name + 0.3, undefined, V ? at(L.tx, L.ty + 160) : at(L.tx, L.ty + 170));
      CF.pop(this.o, t, C.o - 0.3, undefined, V ? mid(540, 820) : mid(1340, 380), -1);
      CF.pop(this.k, t, C.kr - 0.3, undefined, V ? mid(540, 1060) : mid(1340, 640), 1);
      this.oq.style.opacity = seg(t, C.q0 - 0.4, C.q0 - 0.1).toFixed(2); this.kq.style.opacity = seg(t, C.q1 - 0.5, C.q1 - 0.2).toFixed(2);
    },
  };

  // =========================================================================================== objective
  CF.scenes.objective = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'objective');
      this.C = { q: T('สามเดือน'), a: T('ครัว'), b: T('หน้าร้าน'), c: T('เจ้าของร้านอยาก', 'กำไร'), obj: T('ไตรมาส', 'ออบเจกทีฟ') };
      const W = [['หัวหน้าครัว', 'อยากให้อาหารดีขึ้น', 'blue'], ['หัวหน้าร้าน', 'อยากให้ลูกค้าประทับใจ', ''], ['เจ้าของร้าน', 'อยากให้ลูกค้ากลับมา + มีกำไร', 'pink']];
      host.insertAdjacentHTML('beforeend', line('ob-h', 'อีก 3 เดือน อยากเห็นอะไร?', V ? 56 : 64) +
        W.map(([a, b, c], i) => '<div class="note ' + c + ' ob-w' + i + '" style="font-size:' + (V ? 34 : 36) + 'px;white-space:nowrap"><span style="color:var(--ink2);font-size:.8em">' + a + '</span><br>' + b + '</div>').join('') + objCard(V, 'ob-o', V ? 900 : 1100));
      Object.assign(this, { h: q(host, '.ob-h'), ws: [0, 1, 2].map((i) => q(host, '.ob-w' + i)), o: q(host, '.ob-o') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, C.q - 0.5, undefined, at(L.tx, L.ty));
      const P = V ? [[540, 540], [540, 720], [540, 900]] : [[420, 470], [960, 470], [1500, 470]];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.ws[i], t, c0 - 0.4, undefined, mid(P[i][0], P[i][1]), [-3, 2, -2][i]));
      CF.slam(this.o, t, C.obj - 0.3, V ? mid(540, 1200) : mid(960, 800), -1, 1.4);
    },
  };

  // =========================================================================================== key results
  CF.scenes.kr = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'kr'); this.host = host;
      this.C = { how: T('วัดยังไง'), data: T('ข้อมูลจริง'), k: [T('หนึ่ง'), T('สอง'), T('สาม')], end: T('สิบหก') };
      host.insertAdjacentHTML('beforeend', '<p class="sticker kr-q" style="font-size:' + (V ? 44 : 48) + 'px">"อยากกลับมาอีก" วัดยังไง?</p>' + objCard(V, 'kr-o', V ? 900 : 840) +
        '<p class="pill kr-t" style="font-size:' + (V ? 34 : 36) + 'px">Key Results · ภายใน 3 เดือน</p>' + krHtml(V, 'kr-r', V ? 900 : 1000));
      Object.assign(this, { qq: q(host, '.kr-q'), o: q(host, '.kr-o'), tt: q(host, '.kr-t'), rs: [0, 1, 2].map((i) => q(host, '.kr-r' + i)) });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.qq, t, C.how - 0.5, C.data - 0.2, V ? mid(540, 420) : mid(960, 180), -2);
      CF.pop(this.o, t, 0.1, undefined, V ? mid(540, 470) : mid(470, 560), -1);
      CF.pop(this.tt, t, C.data - 0.3, undefined, V ? at(L.tx, 640) : at(1000, 120));
      const Y = V ? [810, 1040, 1270] : [330, 560, 790];
      this.rs.forEach((e, i) => CF.pop(e, t, C.k[i] - 0.3, undefined, mid(V ? 540 : 1400, Y[i]), [-1, 1, -1][i] * 0.6));
    },
  };

  // =========================================================================================== output vs outcome
  CF.scenes.output = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'output');
      this.C = { hand: T('ยกมือ'), add: T('ห้าครั้ง', 'อบรมพนักงาน'), ask: T('ถามกลับ'), same: T('เหมือนเดิม', 'สำเร็จไหม'), no: T('อ๋อ', 'ไม่สำเร็จ'), op: T('เอาต์พุต'), oc: T('เอาต์คัม'), real: T('ประทับใจ', 'อยากกลับมา') };
      const col = (cls, a, b, c, d) => '<div class="card ' + cls + '" style="width:' + (V ? 900 : 700) + 'px;padding:16px 28px 22px;background:' + d + '"><p style="font-weight:700;font-size:' + (V ? 44 : 48) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 32 : 34) + 'px;color:var(--ink2)">' + b + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 38) + 'px;margin-top:6px">' + c + '</p></div>';
      host.insertAdjacentHTML('beforeend', '<p class="note ot-kr" style="font-size:' + (V ? 40 : 44) + 'px">KR4: อบรมพนักงานครบ 5 ครั้ง ✋</p>' +
        '<p class="sticker ot-ask" style="font-size:' + (V ? 34 : 38) + 'px;white-space:normal;width:' + (V ? 880 : 760) + 'px">อบรมครบ แต่ลูกค้าได้บริการเหมือนเดิม<br>= สำเร็จไหม?</p>' +
        '<p class="t ot-x" style="font-size:' + (V ? 150 : 170) + 'px;color:var(--main)">✗</p>' +
        col('ot-a', 'Output', 'สิ่งที่เราทำ', 'อบรม 5 ครั้ง', '#E9DFD0') + col('ot-b', 'Outcome ✓', 'ผลที่เกิดขึ้นจริง', 'ลูกค้าประทับใจ อยากกลับมา', '#BFE5CC'));
      Object.assign(this, { kr: q(host, '.ot-kr'), ask: q(host, '.ot-ask'), x: q(host, '.ot-x'), a: q(host, '.ot-a'), b: q(host, '.ot-b') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.kr, t, C.hand - 0.2, undefined, V ? mid(540, 440) : mid(560, 230), -2);
      CF.pop(this.ask, t, C.ask - 0.3, C.op - 0.4, V ? mid(540, 640) : mid(1300, 300), 2);
      CF.slam(this.x, t, C.no - 0.2, V ? mid(900, 440) : mid(1000, 220), 0, 2);
      CF.pop(this.a, t, C.op - 0.3, undefined, V ? mid(540, 840) : mid(500, 640), -1);
      CF.pop(this.b, t, C.oc - 0.3, undefined, V ? mid(540, 1100) : mid(1300, 640), 1);
      const glow = t > C.real ? '0 0 0 8px var(--d)' : ''; this.b.style.boxShadow = glow || '10px 12px 0 rgba(0,0,0,.16)';
    },
  };

  // =========================================================================================== teams: one goal, different work
  CF.scenes.teams = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'teams');
      this.C = { own: T('คิดเอง'), a: T('ครัว'), b: T('หน้าร้าน'), c: T('จัดซื้อ'), one: T('เป้าหมายเดียวกัน', 'เดียวกัน'), kb: T('คัมบัง') };
      const TM = [['ครัว', 'ลดออร์เดอร์ผิด', '#BFD6F2'], ['หน้าร้าน', 'เก็บความพึงพอใจลูกค้า', '#FFE680'], ['จัดซื้อ', 'ลดของเสีย คุมต้นทุน', '#F7C6BD']];
      host.insertAdjacentHTML('beforeend', objCard(V, 'tm-o', V ? 900 : 900) + TM.map(([a, b, c], i) => '<div class="card tm-t' + i + '" style="width:' + (V ? 900 : 520) + 'px;padding:14px 24px 18px;background:' + c + '"><p style="font-weight:700;font-size:' + (V ? 32 : 32) + 'px;color:var(--ink2)">ทีม' + a + '</p><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px">' + b + '</p></div>' +
        '<p class="t tm-a' + i + '" style="font-size:' + (V ? 50 : 60) + 'px">↑</p>').join('') +
        '<p class="pill tm-kb" style="font-size:' + (V ? 34 : 36) + 'px">งานทั้งหมด → กระดานคัมบัง</p>');
      Object.assign(this, { o: q(host, '.tm-o'), ts: [0, 1, 2].map((i) => q(host, '.tm-t' + i)), as: [0, 1, 2].map((i) => q(host, '.tm-a' + i)), kb: q(host, '.tm-kb') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.o, t, 0.1, undefined, V ? mid(540, 470) : mid(960, 260), -1);
      const P = V ? [[540, 740], [540, 960], [540, 1180]] : [[380, 700], [960, 700], [1540, 700]];
      [C.a, C.b, C.c].forEach((c0, i) => { CF.pop(this.ts[i], t, c0 - 0.3, undefined, mid(P[i][0], P[i][1]), [-2, 1, 2][i]); });
      this.as.forEach((e, i) => { CF.pop(e, t, C.one - 0.3 + i * 0.1, undefined, V ? mid(900, 640 + i * 220) : mid(P[i][0], 470)); if (V && i) e.style.opacity = 0; });
      CF.pop(this.kb, t, C.kb - 0.4, undefined, V ? mid(540, 1380) : mid(960, 920), -1);
    },
  };

  // =========================================================================================== track every week
  CF.scenes.track = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'track'); this.host = host;
      this.C = { drawer: T('ลิ้นชัก'), week: T('ทุกสัปดาห์'), q: [T('กลับมาเพิ่ม'), T('ทันเวลา'), T('กำไรดีขึ้น', 'กำไร')], pdca: T('พีดีซีเอ') };
      host.insertAdjacentHTML('beforeend', '<p class="stamp tr-d" style="font-size:' + (V ? 42 : 48) + 'px">ตั้งแล้วเก็บใส่ลิ้นชัก ✗</p>' +
        '<p class="pill tr-w" style="font-size:' + (V ? 38 : 40) + 'px">ทุกสัปดาห์ ดูตัวเลขร่วมกัน</p>' + krHtml(V, 'tr-r', V ? 900 : 1000) +
        '<p class="sticker tr-p" style="font-size:' + (V ? 40 : 44) + 'px">ไม่ขยับ? → PDCA ลองวิธีใหม่</p>');
      Object.assign(this, { d: q(host, '.tr-d'), w: q(host, '.tr-w'), rs: [0, 1, 2].map((i) => q(host, '.tr-r' + i)), p: q(host, '.tr-p') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.slam(this.d, t, C.drawer - 0.4, V ? mid(540, 440) : mid(560, 200), -3, 1.6);
      CF.pop(this.w, t, C.week - 0.4, undefined, V ? at(L.tx, 560) : at(1000, 150));
      const Y = V ? [740, 960, 1180] : [330, 560, 790];
      this.rs.forEach((e, i) => { CF.pop(e, t, C.q[i] - 0.4, undefined, mid(V ? 540 : 1400, Y[i])); });
      CF.slam(this.p, t, C.pdca - 0.5, V ? mid(540, 1400) : mid(500, 640), -2, 1.6);
    },
  };

  // =========================================================================================== twist: fast food alone is not enough
  CF.scenes.twist = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'twist');
      this.C = { m: T('หนึ่งเดือน'), fast: T('เร็วขึ้นชัด', 'เร็วขึ้น'), small: T('นิดเดียว'), not: T('ไม่พอ'), talk: T('คุยกับลูกค้า'), taste: T('รสชาติ'), svc: T('บริการ'), cut: T('ตัดงาน'), way: T('ถูกทาง') };
      const meter = (cls, a, b, c) => '<div class="card ' + cls + '" style="width:' + (V ? 900 : 780) + 'px;padding:14px 26px 18px"><div style="display:flex;justify-content:space-between"><p style="font-weight:700;font-size:' + (V ? 36 : 40) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px;color:' + c + '">' + b + '</p></div></div>';
      host.insertAdjacentHTML('beforeend', '<p class="pill tw-m" style="font-size:' + (V ? 38 : 40) + 'px">หนึ่งเดือนต่อมา</p>' + meter('tw-a', 'ได้อาหารภายใน 15 นาที', '↑ ขึ้นชัด', 'var(--d)') + meter('tw-b', 'ลูกค้ากลับมาซื้อซ้ำ', '↗ นิดเดียว', 'var(--main)') +
        '<p class="sticker tw-s" style="font-size:' + (V ? 44 : 50) + 'px">เร็วอย่างเดียวไม่พอ!</p>' +
        ['"รสชาติไม่เหมือนครั้งก่อน"', '"บริการแต่ละวันไม่เท่ากัน"'].map((s, i) => '<p class="note ' + (i ? 'pink' : 'blue') + ' tw-n' + i + '" style="font-size:' + (V ? 36 : 40) + 'px">' + s + '</p>').join('') +
        '<p class="stamp green tw-st" style="font-size:' + (V ? 42 : 50) + 'px">OKR บอกว่าเดินถูกทางไหม</p>');
      Object.assign(this, { m: q(host, '.tw-m'), a: q(host, '.tw-a'), b: q(host, '.tw-b'), s: q(host, '.tw-s'), ns: [0, 1].map((i) => q(host, '.tw-n' + i)), st: q(host, '.tw-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.m, t, C.m - 0.3, undefined, at(L.tx, V ? L.ty : L.ty - 60), -2);
      CF.pop(this.a, t, C.fast - 0.3, undefined, V ? mid(540, 500) : mid(560, 330), -1);
      CF.pop(this.b, t, C.small - 0.6, undefined, V ? mid(540, 640) : mid(560, 470), 1);
      CF.slam(this.s, t, C.not - 0.4, V ? mid(540, 800) : mid(1440, 260), -3, 1.6);
      CF.pop(this.ns[0], t, C.taste - 0.4, undefined, V ? mid(500, 980) : mid(1360, 480), -3);
      CF.pop(this.ns[1], t, C.svc - 0.4, undefined, V ? mid(580, 1140) : mid(1400, 640), 2);
      CF.slam(this.st, t, C.way - 0.6, V ? mid(540, 1380) : mid(960, 900), -2, 1.6);
    },
  };

  // =========================================================================================== result after the quarter
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result'); this.host = host;
      this.C = { q: T('สามเดือน'), k: [T('ลูกค้ากลับมาซ้ำ', 'กลับมาซ้ำ'), T('ภายในสิบห้า', 'ได้อาหาร'), T('อัตรากำไร')], not: T('ยังไม่ถึง'), better: T('ดีขึ้นตรงไหน', 'ดีขึ้น') };
      host.insertAdjacentHTML('beforeend', '<p class="pill rs-q" style="font-size:' + (V ? 40 : 42) + 'px">สามเดือนผ่านไป</p>' + krHtml(V, 'rs-r', V ? 900 : 1100) +
        '<p class="sticker rs-s" style="font-size:' + (V ? 40 : 44) + 'px">ยังไม่ถึงทุกข้อ แต่รู้แล้วว่าดีขึ้นตรงไหน!</p>');
      Object.assign(this, { qq: q(host, '.rs-q'), rs: [0, 1, 2].map((i) => q(host, '.rs-r' + i)), s: q(host, '.rs-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.qq, t, C.q - 0.3, undefined, at(L.tx, V ? L.ty : L.ty - 60), -2);
      const Y = V ? [580, 810, 1040] : [360, 580, 800];
      this.rs.forEach((e, i) => CF.pop(e, t, C.k[i] - 0.5, undefined, mid(V ? 540 : 960, Y[i])));
      krReach(this.host, 'rs-r', t, C.k.map((c0) => c0 + 0.3));
      CF.slam(this.s, t, C.not - 0.4, V ? mid(540, 1300) : mid(960, 990), -2, 1.5);
      if (V) { this.s.style.whiteSpace = 'normal'; this.s.style.width = '880px'; this.s.style.textAlign = 'center'; }
    },
  };

  // =========================================================================================== sum (+ key takeaway)
  CF.scenes.sum = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'sum');
      this.C = { o: T('ออบเจกทีฟ'), kr: T('คีย์', 'รีซัลท์ส'), w: T('งานที่ทำ'), ask: T('ทำให้อะไรดีขึ้น', 'ดีขึ้นบ้าง') };
      const R = [['Objective', 'เราจะไปไหน', '#FFF4E3'], ['Key Results', 'เข้าใกล้แค่ไหน', '#BFD6F2'], ['งานที่ทำ (Kanban)', 'วิธีพาเราไปถึง', '#E9DFD0']];
      host.insertAdjacentHTML('beforeend', line('sm-h', 'จำไว้นะ!', V ? 60 : 64) + R.map(([a, b, c], i) => '<div class="card sm-r' + i + '" style="width:' + (V ? 900 : 820) + 'px;padding:12px 26px 16px;display:flex;justify-content:space-between;align-items:center;background:' + c + '"><p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 40) + 'px">→ ' + b + '</p></div>').join('') +
        '<p class="sticker sm-q" style="font-size:' + (V ? 40 : 44) + 'px">สิ่งที่เราทำ ทำให้อะไรดีขึ้นบ้าง?</p>' +
        '<p class="t sm-k" style="font-size:' + (V ? 44 : 44) + 'px;white-space:normal;width:' + (V ? 920 : 900) + 'px;line-height:1.3">ความสำเร็จไม่ได้วัดจากจำนวนงานที่เสร็จ<br><span style="color:var(--main)">แต่วัดจากผลลัพธ์ที่เกิดขึ้น</span></p>' +
        '<p class="t mute sm-e" style="font-size:' + (V ? 34 : 36) + 'px">Focus on Outcomes, Not Just Outputs.</p>');
      Object.assign(this, { h: q(host, '.sm-h'), rs: [0, 1, 2].map((i) => q(host, '.sm-r' + i)), qq: q(host, '.sm-q'), k: q(host, '.sm-k'), e: q(host, '.sm-e') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      const P = V ? [[540, 520], [540, 650], [540, 780]] : [[540, 440], [540, 580], [540, 720]];
      [C.o, C.kr, C.w].forEach((c0, i) => CF.pop(this.rs[i], t, c0 - 0.3, undefined, mid(P[i][0], P[i][1]), [-1, 1, -1][i] * 0.6));
      CF.slam(this.qq, t, C.ask - 1.2, V ? mid(540, 940) : mid(1400, 300), -2, 1.5);
      CF.pop(this.k, t, C.ask + 0.2, undefined, V ? at(L.tx, 1060) : at(990, 480));
      CF.pop(this.e, t, C.ask + 0.8, undefined, V ? at(L.tx, 1260) : at(990, 660));
    },
  };

  // =========================================================================================== close (the bridge to SWOT)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { reg: T('ลูกค้าประจำ'), win: T('หน้าต่าง'), two: T('สาขาที่สอง', 'สาขา'), wait: T('เดี๋ยวก่อน'), s: T('จุดแข็ง'), w: T('จุดอ่อน'), o: T('โอกาส'), r: T('ความเสี่ยง'), next: T('ตอนหน้า'), swot: T('สว็อต', 'อนาลิซิส'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const Q = [['S', 'จุดแข็ง?', '#BFE5CC'], ['W', 'จุดอ่อน?', '#F7C6BD'], ['O', 'โอกาส?', '#BFD6F2'], ['T', 'ความเสี่ยง?', '#FFE680']];
      host.insertAdjacentHTML('beforeend', '<p class="note green cl-reg" style="font-size:' + (V ? 40 : 44) + 'px">เคยเกือบเจ๊ง → มีลูกค้าประจำแล้ว</p>' +
        '<div class="card cl-two" style="padding:14px 30px 20px"><p style="font-weight:700;font-size:' + (V ? 56 : 60) + 'px">🏪 → 🏪🏪 ?</p><p style="font-weight:700;font-size:' + (V ? 36 : 38) + 'px">เปิดสาขาที่สองดีไหมนะ?</p></div>' +
        Q.map(([a, b, c], i) => '<p class="note cl-q' + i + '" style="font-size:' + (V ? 38 : 42) + 'px;background:' + c + '"><b style="color:var(--main)">' + a + '</b> ' + b + '</p>').join('') +
        nextCard(V, 'cl-next', 'SWOT Analysis', 'ก่อนเปิดสาขาสอง: แข็ง อ่อน โอกาส เสี่ยง') + siteBlock(V, 'Goal Setting · Andy Grove'));
      Object.assign(this, { reg: q(host, '.cl-reg'), two: q(host, '.cl-two'), qs: [0, 1, 2, 3].map((i) => q(host, '.cl-q' + i)), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.reg, t, C.reg - 0.6, C.wait - 0.2, V ? mid(540, 460) : mid(600, 260), -2);
      CF.pop(this.two, t, C.two - 0.5, out, V ? mid(540, 620) : mid(1300, 300), 2);
      const P = V ? [[300, 860], [780, 860], [300, 1060], [780, 1060]] : [[560, 560], [1000, 560], [560, 760], [1000, 760]];
      [C.s, C.w, C.o, C.r].forEach((c0, i) => CF.pop(this.qs[i], t, c0 - 0.3, out, mid(P[i][0], P[i][1]), [-3, 2, 2, -2][i]));
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.swot) * 8) * Math.exp(-Math.max(0, t - C.swot) * 3);
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
