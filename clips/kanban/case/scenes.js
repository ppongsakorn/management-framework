/* Kanban, episode 11 of the restaurant series (docs/videos/series.md). One scene module per id, drawn from scene-local
   time only, same look and helpers (cf.js) as episodes 4–10. A four-column board (To Do / Doing / Review / Done) is
   shared by the board scenes; each scene lists its cards with keyframes [time, column, row] and the board moves them.
   Tone: fast and busy in the hook, calm and clear once the work is visible. Cues are spoken words. */
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

  // ----------------------------------------------------------------------------------------- the board
  const COLS = [['To Do', 'ยังไม่เริ่ม', '#E9DFD0'], ['Doing', 'กำลังทำ', '#FFE680'], ['Review', 'รอตรวจ', '#BFD6F2'], ['Done', 'เสร็จแล้ว', '#BFE5CC']];
  const geo = (L) => L.V ? { x: 60, y: 560, w: 960, h: 760 } : { x: 860, y: 200, w: 960, h: 800 };
  // cards: [{t: text, who: owner, kf: [[time, col, row], ...], c?: colour}], rowH/cardH set the stacking
  const board = (host, L, cls, cards, o) => {
    const g = geo(L), cw = g.w / 4, rowH = (o && o.rowH) || 96, cardH = (o && o.cardH) || 84, fs = (o && o.fs) || 26;
    let h = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px;height:' + g.h + 'px;transform-origin:0 0;background:var(--paper);border:6px solid var(--ink);border-radius:22px;box-shadow:10px 12px 0 rgba(0,0,0,.16)">';
    COLS.forEach(([a, b, c], i) => {
      h += '<div class="' + cls + '-c' + i + '" style="position:absolute;left:' + i * cw + 'px;top:0;width:' + cw + 'px;height:100%;border-left:' + (i ? '4px dashed var(--line)' : '0') + '">' +
        '<div style="margin:10px 8px 0;background:' + c + ';border:4px solid var(--ink);border-radius:12px;padding:2px 10px 6px;text-align:center"><p style="font-weight:700;font-size:' + (L.V ? 32 : 30) + 'px;line-height:1.1">' + a + '</p><p style="font-weight:700;font-size:20px;color:var(--ink2)">' + b + '</p></div></div>';
    });
    cards.forEach((k, j) => {
      h += '<div class="' + cls + '-k' + j + '" style="position:absolute;left:0;top:0;width:' + (cw - 22) + 'px;height:' + cardH + 'px;background:' + (k.c || '#FFF4E3') + ';border:4px solid var(--ink);border-radius:10px;padding:4px 10px;box-shadow:4px 5px 0 rgba(0,0,0,.18);overflow:hidden">' +
        '<p style="font-weight:700;font-size:' + fs + 'px;line-height:1.15;white-space:nowrap">' + k.t + '</p>' + (k.who ? '<p style="font-weight:700;font-size:' + (fs - 6) + 'px;color:var(--ink2);white-space:nowrap">' + k.who + '</p>' : '') + '</div>';
    });
    host.insertAdjacentHTML('beforeend', h + '</div>');
    const root = q(host, '.' + cls), heads = [0, 1, 2, 3].map((i) => q(host, '.' + cls + '-c' + i)), els = cards.map((_, j) => q(host, '.' + cls + '-k' + j));
    const slot = (c, r) => [c * cw + 11, 96 + r * rowH];
    return {
      root, heads, els, g,
      render(t, tBoard, tCols) {
        CF.pop(root, t, tBoard, undefined, at(g.x, g.y));
        heads.forEach((e, i) => { e.style.opacity = (tCols ? seg(t, tCols[i] - 0.2, tCols[i]) : 1).toFixed(2); });
        cards.forEach((k, j) => {
          const kf = k.kf, e = els[j]; let p = slot(kf[0][1], kf[0][2]);
          for (let i = 1; i < kf.length; i++) { const a = slot(kf[i - 1][1], kf[i - 1][2]), b = slot(kf[i][1], kf[i][2]), u = eio(seg(t, kf[i][0], kf[i][0] + 0.5)); if (t >= kf[i][0]) p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
          CF.pop(e, t, kf[0][0], k.out, at(p[0], p[1]), k.rot || 0);
        });
      },
    };
  };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'hook');
      this.C = { a: T('สต็อก'), b: T('อบรม'), c: T('คิวอาหาร', 'ปรับคิว'), d: T('เตา'), all: T('ทุกอย่าง'), done: T('เสร็จบ้าง', 'มีอะไรเสร็จ') };
      const J = ['ระบบสต็อกใหม่', 'อบรมพนักงานใหม่', 'ปรับคิวอาหาร', 'บำรุงรักษาเตา'];
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + J.map((s, i) => '<div class="card hk-j' + i + '" style="width:' + (V ? 560 : 600) + 'px;padding:16px 26px 20px;background:' + ['#FFF4E3', '#BFD6F2', '#BFE5CC', '#F7C6BD'][i] + '"><p style="font-weight:700;font-size:' + (V ? 42 : 46) + 'px">' + s + '</p>' +
        '<p class="hk-s' + i + '" style="display:inline-block;margin-top:6px;background:var(--accent);border:4px solid var(--ink);border-radius:999px;padding:0 18px 4px;font-weight:700;font-size:' + (V ? 32 : 34) + 'px">กำลังทำ…</p></div>').join('') +
        '<div class="card hk-n" style="padding:14px 30px 20px;background:var(--paper)"><p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px">เสร็จแล้ว: <span style="color:var(--main);font-size:' + (V ? 90 : 96) + 'px">0</span></p></div>' +
        '<p class="sticker hk-q" style="font-size:' + (V ? 46 : 54) + 'px">แล้วมีอะไรเสร็จบ้างเนี่ย?!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), js: [0, 1, 2, 3].map((i) => q(host, '.hk-j' + i)), ss: [0, 1, 2, 3].map((i) => q(host, '.hk-s' + i)), n: q(host, '.hk-n'), qq: q(host, '.hk-q') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, T0 = [C.a, C.b, C.c, C.d];
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      const P = V ? [[540, 470], [540, 640], [540, 810], [540, 980]] : [[480, 330], [1000, 420], [560, 610], [1080, 700]];
      this.js.forEach((e, i) => { CF.pop(e, t, T0[i] - 0.3, undefined, mid(P[i][0], P[i][1]), [-3, 2, -2, 3][i] + CF.shake(t, C.all, 2)); this.ss[i].style.opacity = seg(t, T0[i] + 0.4, T0[i] + 0.55).toFixed(2); });
      CF.pop(this.n, t, C.done - 0.9, undefined, V ? mid(540, 1200) : mid(1560, 560), 3);
      CF.slam(this.qq, t, C.done - 0.4, V ? mid(540, 1380) : mid(960, 930), -3, 1.8);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'recap');
      this.C = { a: T('มอบหมาย'), b: T('กำหนดหน้าที่', 'หน้าที่'), c: T('ปรับวิธี'), own: T('ทำงานได้เอง', 'ได้เอง'), where: T('ไปถึงไหน'), pile: T('ค้าง', 'งานเก่า') };
      const B = [['7', 'Delegation Levels', 'มอบหมายงาน'], ['8', 'RACI', 'กำหนดหน้าที่'], ['10', 'Situational', 'ปรับวิธีบริหาร']];
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ที่ผ่านมา…</p>' +
        B.map(([n, a, b], i) => '<div class="card rc-' + i + '" style="width:' + (V ? 860 : 520) + 'px;padding:18px 28px 22px"><p style="font-weight:700;font-size:' + (V ? 30 : 28) + 'px;color:var(--ink2)">ตอน ' + n + ' · ' + b + '</p><p style="font-weight:700;font-size:' + (V ? 48 : 46) + 'px">' + a + '</p></div>').join('') +
        '<p class="pill rc-own" style="font-size:' + (V ? 40 : 42) + 'px">ทีมทำงานได้เองแล้ว ✓</p>' +
        '<p class="note rc-w" style="font-size:' + (V ? 44 : 50) + 'px">แต่… งานไปถึงไหนแล้ว?</p>' +
        '<p class="sticker rc-p" style="font-size:' + (V ? 40 : 46) + 'px">เริ่มงานใหม่ ทั้งที่งานเก่ายังค้าง!</p>');
      Object.assign(this, { tape: q(host, '.rc-tape'), cs: [0, 1, 2].map((i) => q(host, '.rc-' + i)), own: q(host, '.rc-own'), w: q(host, '.rc-w'), p: q(host, '.rc-p') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      const P = V ? [[540, 480], [540, 640], [540, 800]] : [[400, 400], [960, 400], [1520, 400]];
      [C.a, C.b, C.c].forEach((c0, i) => CF.pop(this.cs[i], t, c0 - 0.2, undefined, mid(P[i][0], P[i][1]), [-1.5, 1, -1][i]));
      CF.pop(this.own, t, C.own - 0.4, undefined, V ? mid(540, 950) : mid(960, 590));
      CF.pop(this.w, t, C.where - 0.6, undefined, V ? mid(540, 1120) : mid(600, 780), -3);
      CF.slam(this.p, t, C.pile - 0.6, V ? mid(540, 1320) : mid(1280, 900), -2, 1.6);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'idea');
      this.C = { name: T('คัมบัง'), head: T('ออกจากหัว', 'เอางาน'), see: T('เห็นร่วมกัน'), not: T('ไม่ใช่แค่', 'กระดาน'), flow: T('ไหล'), done: T('ต่อเนื่อง', 'ส่งงานเสร็จ') };
      const F = ['ยังไม่เริ่ม', 'กำลังทำ', 'รอตรวจ', 'เสร็จ'];
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 120 : 130) + 'px;color:var(--main)">Kanban</p><p class="t mute id-th" style="font-size:' + (V ? 44 : 46) + 'px">คัมบัง</p>' +
        '<p class="note blue id-head" style="font-size:' + (V ? 40 : 44) + 'px">งานในหัว → บนกระดาน ให้ทุกคนเห็น</p>' +
        '<div class="id-flow" style="position:absolute;left:0;top:0;display:flex;gap:' + (V ? 10 : 16) + 'px;align-items:center">' + F.map((s, i) => '<span class="id-f' + i + '" style="background:' + COLS[i][2] + ';border:5px solid var(--ink);border-radius:14px;padding:8px ' + (V ? 14 : 22) + 'px 12px;font-weight:700;font-size:' + (V ? 34 : 40) + 'px">' + s + '</span>' + (i < 3 ? '<b class="id-a' + i + '" style="font-size:' + (V ? 40 : 48) + 'px">→</b>' : '')).join('') + '</div>' +
        '<p class="stamp green id-st" style="font-size:' + (V ? 46 : 56) + 'px">งานไหล · เสร็จต่อเนื่อง</p>');
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), th: q(host, '.id-th'), head: q(host, '.id-head'), flow: q(host, '.id-flow'), fs: [0, 1, 2, 3].map((i) => q(host, '.id-f' + i)), as: [0, 1, 2].map((i) => q(host, '.id-a' + i)), st: q(host, '.id-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.th, t, C.name + 0.2, undefined, at(L.tx + (V ? 10 : 560), V ? L.ty + 140 : L.ty + 40));
      CF.pop(this.head, t, C.head - 0.3, undefined, V ? mid(540, 700) : mid(1300, 330), -2);
      CF.pop(this.flow, t, C.see - 0.3, undefined, V ? mid(540, 900) : mid(960, 600));
      this.fs.forEach((e, i) => { e.style.opacity = seg(t, C.see - 0.3 + i * 0.25, C.see + i * 0.25).toFixed(2); });
      this.as.forEach((e, i) => { e.style.opacity = seg(t, C.see - 0.1 + i * 0.25, C.see + 0.1 + i * 0.25).toFixed(2); });
      CF.slam(this.st, t, C.flow - 0.3, V ? mid(540, 1160) : mid(960, 850), -3, 1.7);
    },
  };

  // =========================================================================================== board: make the work visible
  CF.scenes.board = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'board');
      this.C = { b: T('กระดาน'), c: [T('ทูดู'), T('ดูอิ้ง'), T('รีวิว'), T('ดัน', 'เสร็จแล้ว')], card: T('การ์ด'), who: T('รับผิดชอบ'), move: T('เลื่อน') };
      const C = this.C, k0 = C.card - 0.3;
      host.insertAdjacentHTML('beforeend', line('bd-h', 'ขั้นที่ 1: ทำให้งานมองเห็นได้', V ? 54 : 60) +
        '<p class="note bd-n" style="font-size:' + (V ? 34 : 38) + 'px;white-space:normal;width:' + (V ? 900 : 620) + 'px">การ์ด 1 ใบ = งาน 1 เรื่อง<br>+ ชื่อคนรับผิดชอบ</p>');
      this.B = board(host, L, 'bd-b', [
        { t: 'ระบบสต็อก', who: 'หัวหน้าครัว', kf: [[k0, 0, 0], [C.move, 1, 0]] },
        { t: 'อบรมพนักงาน', who: 'หัวหน้าร้าน', kf: [[k0 + 0.2, 0, 1]] },
        { t: 'แผนดูแลเตา', who: 'หัวหน้าครัว', kf: [[k0 + 0.4, 0, 2]] }]);
      Object.assign(this, { h: q(host, '.bd-h'), n: q(host, '.bd-n') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      this.B.render(t, C.b - 0.3, C.c);
      CF.pop(this.n, t, C.who - 0.6, undefined, V ? at(L.tx, 440) : at(L.tx, 520), -2);
    },
  };

  // =========================================================================================== reveal: twelve in Doing, none done
  CF.scenes.reveal = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'reveal');
      this.C = { up: T('ขึ้นกระดาน', 'ครบ'), wow: T('โอ้โห'), n: T('สิบสอง'), empty: T('ว่างเปล่า'), chef: T('หัวหน้าครัว'), busy: T('ยุ่งจริง', 'ยุ่ง'), sw: T('สลับ') };
      const C = this.C, N = ['ระบบสต็อก', 'ปรับเมนู', 'อบรมพนักงาน', 'แผนดูแลเตา', 'ตารางกะ', 'ป้ายเมนู', 'ร้านค้าออนไลน์', 'สูตรใหม่', 'จัดห้องเก็บของ', 'ใบสั่งซื้อ', 'โปรวันเกิด', 'ทาสีผนัง'];
      this.B = board(host, L, 'rv-b', N.map((s, i) => ({ t: s, kf: [[C.up - 0.2 + i * 0.08, 1, i]] })), { rowH: 54, cardH: 46, fs: 23 });
      host.insertAdjacentHTML('beforeend', '<div class="card rv-n" style="padding:12px 28px 18px"><p style="font-weight:700;font-size:' + (V ? 40 : 44) + 'px">กำลังทำ <span style="color:var(--main);font-size:' + (V ? 80 : 90) + 'px">12</span>  ·  เสร็จ <span style="color:var(--main);font-size:' + (V ? 80 : 90) + 'px">0</span></p></div>' +
        '<div class="rv-c" style="position:absolute;left:0;top:0">' + chef(V ? 120 : 150) + '</div>' +
        ['ระบบสต็อก', 'ปรับเมนู', 'อบรมพนักงาน'].map((s, i) => '<p class="note rv-j' + i + '" style="font-size:' + (V ? 28 : 30) + 'px;padding:10px 16px 14px;background:' + ['#FFF4E3', '#BFD6F2', '#BFE5CC'][i] + '">' + s + '</p>').join('') +
        '<p class="stamp rv-st" style="font-size:' + (V ? 48 : 56) + 'px">ยุ่ง ≠ เสร็จ</p>');
      Object.assign(this, { n: q(host, '.rv-n'), c: q(host, '.rv-c'), js: [0, 1, 2].map((i) => q(host, '.rv-j' + i)), st: q(host, '.rv-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      this.B.render(t, C.up - 0.5);
      CF.slam(this.n, t, C.n - 0.3, V ? mid(540, 400) : mid(420, 300), -2, 1.6);
      const cx = V ? 200 : 300, cy = V ? 1000 : 640;
      if (V) { this.c.style.opacity = 0; this.js.forEach((e) => (e.style.opacity = 0)); }
      else {
        CF.pop(this.c, t, C.chef - 0.3, undefined, mid(cx, cy));
        this.js.forEach((e, i) => { const a = (t - C.chef) * 3.2 + i * 2.09, r = 190; CF.pop(e, t, C.chef - 0.1 + i * 0.15, undefined, mid(cx + 40 + Math.cos(a) * r, cy - 60 + Math.sin(a) * r * 0.55)); });
      }
      CF.slam(this.st, t, C.sw - 0.4, V ? mid(540, 1420) : mid(420, 930), -3, 1.8);
    },
  };

  // =========================================================================================== wip: limit work in progress
  CF.scenes.wip = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'wip');
      this.C = { name: T('วิป', 'ลิมิต'), three: T('ไม่เกินสาม', 'สามงาน'), stop: T('ห้ามเริ่ม'), close: T('ปิดงานเดิม', 'ช่วยกัน'), neck: T('คอขวด'), pile: T('กองหน้าเตา', 'ออร์เดอร์'), more: T('มากขึ้น ก็ไม่ได้', 'แปลว่า') };
      const C = this.C, N = ['ระบบสต็อก', 'อบรมพนักงาน', 'แผนดูแลเตา', 'ปรับเมนู', 'ตารางกะ', 'สูตรใหม่'];
      this.B = board(host, L, 'wp-b', N.map((s, i) => ({ t: s, kf: i < 3 ? [[0.05, 1, i]] : [[0.05, 1, i], [C.three + 0.1 + (i - 3) * 0.15, 0, i - 3]] })));
      host.insertAdjacentHTML('beforeend', line('wp-h', 'ขั้นที่ 2: WIP Limit', V ? 58 : 64) + line('wp-s', 'จำกัดงานที่กำลังทำ (Work in Progress)', V ? 32 : 34, 'mute') +
        '<p class="pill wp-lim" style="font-size:' + (V ? 34 : 34) + 'px;background:var(--main)">Doing ≤ 3</p>' +
        '<p class="sticker wp-stop" style="font-size:' + (V ? 40 : 44) + 'px">เต็มแล้ว ห้ามเริ่มใหม่ ช่วยกันปิดงานเดิม!</p>' +
        '<div class="card wp-neck" style="width:' + (V ? 900 : 660) + 'px;padding:16px 26px 20px"><p style="font-weight:700;font-size:' + (V ? 32 : 32) + 'px;color:var(--ink2)">เหมือนคอขวดตอน 5</p><p style="font-weight:700;font-size:' + (V ? 38 : 40) + 'px">ออร์เดอร์กองหน้าเตา ≠ อาหารออกเร็วขึ้น</p></div>' +
        '<p class="t wp-k" style="font-size:' + (V ? 48 : 52) + 'px;white-space:normal;width:' + (V ? 900 : 680) + 'px;line-height:1.25">เริ่มงานมากขึ้น <span style="color:var(--main)">≠ เสร็จมากขึ้น</span></p>');
      Object.assign(this, { h: q(host, '.wp-h'), s: q(host, '.wp-s'), lim: q(host, '.wp-lim'), stop: q(host, '.wp-stop'), neck: q(host, '.wp-neck'), k: q(host, '.wp-k') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.slam(this.h, t, C.name - 0.3, at(L.tx, L.ty), -1, 1.4);
      CF.pop(this.s, t, C.name + 0.3, undefined, at(L.tx, L.ty + (V ? 80 : 90)));
      this.B.render(t, -1);
      const g = this.B.g; CF.pop(this.lim, t, C.three - 0.3, undefined, mid(g.x + g.w * 0.375, g.y - (V ? 34 : 30)), -3);
      CF.pop(this.stop, t, C.stop - 0.4, C.neck - 0.4, V ? mid(540, 1420) : mid(1340, 1040), -2);
      CF.pop(this.neck, t, C.neck - 0.4, undefined, V ? mid(540, 1420) : mid(450, 560), -1);
      if (V) this.neck.style.opacity = (+this.neck.style.opacity * (1 - seg(t, C.more - 0.6, C.more - 0.3))).toFixed(2);
      CF.slam(this.k, t, C.more - 0.4, V ? at(80, 1380) : at(L.tx, 760), -1, 1.4);
    },
  };

  // =========================================================================================== pull: take the next card only when there is room
  CF.scenes.pull = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'pull');
      this.C = { when: T('เมื่อไหร่'), free: T('ว่าง'), pull: T('ดึง'), name: T('พูล', 'ซิสเต็ม'), ord: T('ไอเซนฮาวร์', 'พาเรโต้'), shout: T('ตะโกน') };
      const C = this.C;
      this.B = board(host, L, 'pl-b', [
        { t: 'ระบบสต็อก', kf: [[0.05, 1, 0]] }, { t: 'อบรมพนักงาน', kf: [[0.05, 1, 1]] },
        { t: 'แผนดูแลเตา', kf: [[0.05, 1, 2], [C.free - 0.4, 2, 0], [C.free + 0.3, 3, 0]] },
        { t: 'ปรับเมนู', c: '#FFC21A', kf: [[0.05, 0, 0], [C.pull, 1, 2]] }, { t: 'ตารางกะ', kf: [[0.05, 0, 1], [C.pull + 0.2, 0, 0]] }, { t: 'สูตรใหม่', kf: [[0.05, 0, 2], [C.pull + 0.3, 0, 1]] }]);
      host.insertAdjacentHTML('beforeend', line('pl-h', 'ขั้นที่ 3: ดึงงาน เมื่อมีที่ว่าง', V ? 54 : 58) +
        '<p class="pill pl-n" style="font-size:' + (V ? 40 : 44) + 'px">Pull System</p>' +
        '<div class="card pl-o" style="width:' + (V ? 900 : 620) + 'px;padding:16px 26px 20px"><p style="font-weight:700;font-size:' + (V ? 32 : 32) + 'px;color:var(--ink2)">งานไหนก่อน?</p><p style="font-weight:700;font-size:' + (V ? 40 : 40) + 'px">Eisenhower + Pareto</p></div>' +
        '<p class="stamp pl-s" style="font-size:' + (V ? 40 : 44) + 'px">ใครตะโกนดังสุด ✗</p>');
      Object.assign(this, { h: q(host, '.pl-h'), n: q(host, '.pl-n'), o: q(host, '.pl-o'), s: q(host, '.pl-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      this.B.render(t, -1);
      CF.pop(this.n, t, C.name - 0.3, undefined, V ? at(L.tx, 460) : at(L.tx, 420), -2);
      CF.pop(this.o, t, C.ord - 0.4, undefined, V ? mid(540, 1420) : mid(450, 640), -1);
      if (V) this.o.style.opacity = (+this.o.style.opacity * (1 - seg(t, C.shout - 0.6, C.shout - 0.3))).toFixed(2);
      CF.slam(this.s, t, C.shout - 0.4, V ? mid(540, 1420) : mid(450, 860), -4, 1.8);
    },
  };

  // =========================================================================================== blocked
  CF.scenes.blocked = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'blocked');
      this.C = { q: T('ทำต่อไม่ได้'), sup: T('ซัพพลายเออร์', 'รอข้อมูล'), tag: T('บล็อกต์', 'ติดป้าย'), help: T('ใครช่วย', 'ต้องการ'), hide: T('ซ่อน'), good: T('ดูดี') };
      this.B = board(host, L, 'bl-b', [{ t: 'ระบบสต็อก', who: 'หัวหน้าครัว', kf: [[0.05, 1, 0]] }, { t: 'อบรมพนักงาน', who: 'หัวหน้าร้าน', kf: [[0.05, 1, 1]] }, { t: 'ปรับเมนู', who: 'หัวหน้าครัว', kf: [[0.05, 1, 2]] }, { t: 'แผนดูแลเตา', kf: [[0.05, 3, 0]] }]);
      host.insertAdjacentHTML('beforeend', line('bl-h', 'งานที่ติดปัญหา?', V ? 58 : 64) +
        '<p class="bl-tag" style="position:absolute;left:0;top:0;background:var(--main);color:#fff;font-weight:700;font-size:' + (V ? 30 : 30) + 'px;padding:2px 16px 6px;border:4px solid var(--ink);border-radius:10px;transform-origin:50% 50%">BLOCKED</p>' +
        '<p class="note pink bl-n" style="font-size:' + (V ? 28 : 36) + 'px;white-space:normal;width:' + (V ? 900 : 640) + 'px">ติด: รอข้อมูลซัพพลายเออร์<br>ต้องการ: ฝ่ายจัดซื้อ</p>' +
        '<p class="stamp bl-s" style="font-size:' + (V ? 40 : 44) + 'px">ย้ายกลับไปซ่อนใน To Do ✗</p>');
      Object.assign(this, { h: q(host, '.bl-h'), tag: q(host, '.bl-tag'), n: q(host, '.bl-n'), s: q(host, '.bl-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, g = this.B.g;
      CF.pop(this.h, t, C.q - 0.5, undefined, at(L.tx, L.ty));
      this.B.render(t, -1);
      const e = this.B.els[0]; e.style.boxShadow = t > C.tag ? '0 0 0 6px var(--main)' : e.style.boxShadow;
      CF.slam(this.tag, t, C.tag - 0.3, mid(g.x + g.w * 0.375 + 40, g.y + 84), -6, 1.8);
      CF.pop(this.n, t, C.help - 0.6, undefined, V ? at(L.tx, 428) : at(L.tx, 480), -1);
      CF.slam(this.s, t, C.hide - 0.3, V ? mid(540, 1420) : mid(450, 840), -3, 1.7);
    },
  };

  // =========================================================================================== done: what "done" means
  CF.scenes.done = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'done');
      this.C = { a: T('สอนจบ'), b: T('ได้ถูกด้วย', 'รับออร์เดอร์'), agree: T('ตกลง'), res: T('ผลลัพธ์') };
      const box = (cls, s) => '<div style="display:flex;gap:18px;align-items:center;margin:12px 0"><span class="' + cls + '" style="display:inline-grid;place-items:center;width:58px;height:58px;border:6px solid var(--ink);border-radius:12px;font-weight:700;font-size:44px;color:var(--d)"></span><p style="font-weight:700;font-size:' + (V ? 42 : 46) + 'px">' + s + '</p></div>';
      host.insertAdjacentHTML('beforeend', line('dn-h', 'แบบไหนถึงเรียกว่า "เสร็จ"?', V ? 56 : 64) +
        '<div class="card dn-c" style="width:' + (V ? 900 : 1000) + 'px;padding:22px 34px 26px"><p style="font-weight:700;font-size:' + (V ? 44 : 50) + 'px">การ์ด: อบรมพนักงานใหม่</p>' + box('dn-b0', 'สอนจบแล้ว') + box('dn-b1', 'รับออร์เดอร์ได้ถูกต้องจริง') + '</div>' +
        '<p class="sticker dn-no" style="font-size:' + (V ? 40 : 44) + 'px">แค่นี้ยังไม่พอ!</p>' +
        '<p class="stamp green dn-st" style="font-size:' + (V ? 46 : 56) + 'px">Done = ได้ผลลัพธ์ ไม่ใช่แค่ทำกิจกรรม</p>');
      Object.assign(this, { h: q(host, '.dn-h'), c: q(host, '.dn-c'), b0: q(host, '.dn-b0'), b1: q(host, '.dn-b1'), no: q(host, '.dn-no'), st: q(host, '.dn-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      CF.pop(this.c, t, C.a - 0.8, undefined, V ? mid(540, 760) : mid(820, 560), -1);
      this.b0.textContent = t > C.a + 0.3 ? '✓' : ''; this.b1.textContent = t > C.agree ? '✓' : '';
      CF.pop(this.no, t, C.a + 0.4, C.agree - 0.3, V ? mid(700, 1000) : mid(1500, 400), 4);
      CF.slam(this.st, t, C.res - 0.4, V ? mid(540, 1200) : mid(960, 900), -2, 1.6);
      this.st.style.whiteSpace = V ? 'normal' : 'nowrap'; if (V) this.st.style.width = '900px';
    },
  };

  // =========================================================================================== measure the flow
  CF.scenes.measure = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'measure');
      this.C = { m: [T('กี่งาน'), T('นานแค่ไหน'), T('ขั้นไหน')], rev: T('รีวิว'), slow: T('ตรวจช้า'), pdca: T('พีดีซีเอ') };
      const M = [['เสร็จต่อสัปดาห์', 'กี่งาน?'], ['เริ่ม → เสร็จ', 'ใช้เวลานานแค่ไหน?'], ['งานติดที่', 'ขั้นไหน?']];
      host.insertAdjacentHTML('beforeend', line('ms-h', 'ขั้นที่ 4: วัดการไหลของงาน', V ? 54 : 60) +
        M.map(([a, b], i) => '<div class="card ms-m' + i + '" style="width:' + (V ? 900 : 520) + 'px;padding:14px 26px 18px"><p style="font-weight:700;font-size:' + (V ? 30 : 30) + 'px;color:var(--ink2)">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 44 : 44) + 'px">' + b + '</p></div>').join('') +
        '<div class="ms-col" style="position:absolute;left:0;top:0;display:flex;gap:10px;align-items:flex-end">' + COLS.map(([a, , c], i) => '<div style="text-align:center"><div class="ms-bar' + i + '" style="width:' + (V ? 150 : 150) + 'px;background:' + c + ';border:5px solid var(--ink);border-radius:10px"></div><p style="font-weight:700;font-size:28px">' + a + '</p></div>').join('') + '</div>' +
        '<p class="sticker ms-s" style="font-size:' + (V ? 40 : 42) + 'px">ทำไมตรวจช้า? → ปรับด้วย PDCA</p>');
      Object.assign(this, { h: q(host, '.ms-h'), ms: [0, 1, 2].map((i) => q(host, '.ms-m' + i)), col: q(host, '.ms-col'), bars: [0, 1, 2, 3].map((i) => q(host, '.ms-bar' + i)), s: q(host, '.ms-s') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty));
      const P = V ? [[540, 520], [540, 680], [540, 840]] : [[400, 470], [400, 640], [400, 810]];
      this.ms.forEach((e, i) => CF.pop(e, t, C.m[i] - 0.6, undefined, mid(P[i][0], P[i][1]), [-1, 1, -1][i]));
      CF.pop(this.col, t, C.rev - 0.6, undefined, V ? at(L.tx + 30, 1000) : at(1020, 330));
      const H = [80, 120, 340, 140], u = eio(seg(t, C.rev - 0.4, C.rev + 0.4));
      this.bars.forEach((e, i) => { e.style.height = (40 + (H[i] - 40) * u).toFixed(0) + 'px'; e.style.boxShadow = i === 2 && u > 0.9 ? '0 0 0 6px var(--main)' : ''; });
      CF.slam(this.s, t, C.slow - 0.4, V ? mid(540, 1480) : mid(1360, 880), -2, 1.6);
    },
  };

  // =========================================================================================== result (+ key takeaway)
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'result');
      this.C = { from: T('สิบสอง'), flow: T('ต่อเนื่อง'), morn: T('ทุกเช้า'), ask: T('เดินถาม'), look: T('แค่มอง', 'มองกระดาน') };
      const C = this.C, N = ['ระบบสต็อก', 'อบรมพนักงาน', 'ปรับเมนู', 'แผนดูแลเตา', 'ตารางกะ', 'ใบสั่งซื้อ', 'สูตรใหม่'];
      this.B = board(host, L, 'rs-b', N.map((s, i) => ({ t: s, kf: i < 3 ? [[C.from - 0.2, 1, i]] : [[C.from - 0.2, 0, i - 3], [C.flow - 0.6 + (i - 3) * 0.35, 3, i - 3]] })));
      host.insertAdjacentHTML('beforeend', '<p class="pill rs-a" style="font-size:' + (V ? 36 : 38) + 'px">กำลังทำ 12 → 3</p>' +
        '<p class="note green rs-m" style="font-size:' + (V ? 36 : 40) + 'px">ทุกเช้า ดูกระดานด้วยกันสั้น ๆ</p>' +
        '<p class="sticker rs-l" style="font-size:' + (V ? 40 : 44) + 'px">ไม่ต้องเดินถาม แค่มองกระดาน!</p>' +
        '<p class="t rs-k" style="font-size:' + (V ? 48 : 52) + 'px;white-space:normal;width:' + (V ? 920 : 700) + 'px;line-height:1.3">หยุดเริ่มงานเพิ่ม<br><span style="color:var(--main)">แล้วเริ่มทำงานที่ค้างอยู่ให้เสร็จ</span></p>' +
        '<p class="t mute rs-e" style="font-size:' + (V ? 36 : 38) + 'px">Stop Starting, Start Finishing.</p>');
      Object.assign(this, { a: q(host, '.rs-a'), m: q(host, '.rs-m'), l: q(host, '.rs-l'), k: q(host, '.rs-k'), e: q(host, '.rs-e') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      this.B.render(t, C.from - 0.5);
      if (V) this.B.root.style.transform += ' scale(.86)';
      CF.pop(this.a, t, C.from - 0.3, undefined, V ? at(L.tx, 280) : at(L.tx, 230), -2);
      CF.pop(this.m, t, C.morn - 0.4, undefined, V ? at(L.tx, 380) : at(L.tx, 360), -2);
      CF.slam(this.l, t, C.ask - 0.4, V ? mid(540, 500) : mid(450, 900), -2, 1.6);
      CF.pop(this.k, t, C.look - 0.2, undefined, V ? at(L.tx, 1240) : at(L.tx, 560));
      CF.pop(this.e, t, C.look + 0.4, undefined, V ? at(L.tx, 1390) : at(L.tx, 760));
      if (V) { this.k.style.opacity = (+this.k.style.opacity).toFixed(2); this.m.style.opacity = (+this.m.style.opacity * (1 - seg(t, C.look - 0.5, C.look - 0.2))).toFixed(2); }
    },
  };

  // =========================================================================================== close (the bridge to OKR)
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = HEARD(api, 'close');
      this.C = { month: T('หนึ่งเดือน'), happy: T('ดีใจ'), open: T('ผลประกอบการ'), q0: T('ซื้อซ้ำ'), q1: T('กำไร'), res: T('สร้างผลลัพธ์', 'ผลลัพธ์อะไร'), next: T('ตอนหน้า'), okr: T('โอเคอาร์'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      const C = this.C;
      host.insertAdjacentHTML('beforeend', '<p class="pill cl-m" style="font-size:' + (V ? 42 : 42) + 'px">หนึ่งเดือนต่อมา</p>' +
        '<div class="card cl-d" style="padding:14px 30px 20px;background:#BFE5CC"><p style="font-weight:700;font-size:' + (V ? 44 : 48) + 'px">Done: <span style="font-size:' + (V ? 80 : 90) + 'px">32</span> การ์ด 🎉</p></div>' +
        ['ลูกค้ากลับมาซื้อซ้ำ… ไม่เพิ่ม?', 'กำไร… ยังไม่ดีขึ้น?'].map((s, i) => '<p class="note ' + (i ? 'pink' : 'blue') + ' cl-q' + i + '" style="font-size:' + (V ? 38 : 42) + 'px">' + s + '</p>').join('') +
        '<p class="sticker cl-l" style="font-size:' + (V ? 40 : 46) + 'px">วัดงานเสร็จ ≠ วัดผลลัพธ์</p>' +
        nextCard(V, 'cl-next', 'OKR', 'งานเสร็จเยอะ… แต่ธุรกิจดีขึ้นจริงไหม?') + siteBlock(V, 'Lean · Kanban Method'));
      Object.assign(this, { m: q(host, '.cl-m'), d: q(host, '.cl-d'), qs: [0, 1].map((i) => q(host, '.cl-q' + i)), l: q(host, '.cl-l'), next: q(host, '.cl-next'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, out = C.next - 0.25;
      CF.pop(this.m, t, C.month - 0.3, out, at(L.tx, L.ty), -2);
      CF.pop(this.d, t, C.month + 0.2, out, V ? mid(540, 600) : mid(560, 470), -2);
      const P = V ? [[540, 790], [540, 950]] : [[1300, 380], [1360, 560]];
      [C.q0, C.q1].forEach((c0, i) => CF.pop(this.qs[i], t, c0 - 0.5, out, mid(P[i][0], P[i][1]), [-3, 2][i]));
      CF.slam(this.l, t, C.res - 0.6, V ? mid(540, 1150) : mid(960, 820), -2, 1.6);
      if (t > out) this.l.style.opacity = (+this.l.style.opacity * (1 - seg(t, out, out + 0.3))).toFixed(2);
      const Pp = V ? { next: [540, 560], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] } : { next: [1380, 330], see: [110, 560], name: [110, 650], url: [110, 830], org: [110, 890], ai: [110, 970] };
      CF.pop(this.next, t, C.next - 0.1, undefined, mid(Pp.next[0], Pp.next[1]), -2);
      const wob = 1 + 0.03 * Math.sin(Math.max(0, t - C.okr) * 8) * Math.exp(-Math.max(0, t - C.okr) * 3);
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
