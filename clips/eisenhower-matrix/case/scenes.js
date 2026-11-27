/* Eisenhower Matrix, episode 6 of the restaurant series (docs/videos/series.md): one scene module per id, drawn from
   scene-local time only. Same planning-room look and helpers (cf.js) as the Pareto and TOC episodes. The owner's twelve
   jobs are one set of sticky notes that every scene reuses: a messy wall, then sorted into the 2x2 (important × urgent),
   then the week calendar shows no hour for "important, not urgent" until the Monday 10-minute re-plan.
   Cues (T('คำ')) are words in the spoken line. */
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

  // twelve jobs: [text, quadrant] quadrant 0 do (important+urgent) 1 plan (important) 2 delegate (urgent) 3 drop
  const JOBS = [['เตาหัวที่ 2<br>จุดไม่ติด', 0], ['หาคนล้างจาน<br>เพิ่ม', 1], ['ตอบแชต<br>เวลาเปิดร้าน', 2], ['เปลี่ยนสี<br>ป้ายร้าน', 3],
    ['ของสดมาไม่ครบ', 0], ['วางแผน<br>ดูแลเตา', 1], ['รับโทร<br>เซลส์', 2], ['ดูคลิป<br>ร้านคู่แข่ง', 3],
    ['คุยซัพพลายเออร์', 1], ['วางแผน<br>ขยายร้าน', 1], ['สั่งทิชชู', 2], ['จัดชั้น<br>ในโกดังใหม่', 3]];
  const KEY4 = [0, 1, 2, 3];
  const QN = [['ทำเองวันนี้', 'สำคัญ + ด่วน', '#F7C6BD'], ['วางแผน จองเวลา', 'สำคัญ + ไม่ด่วน', '#BFD6F2'], ['มอบหมาย', 'ไม่สำคัญ + ด่วน', '#FFE680'], ['ตัดทิ้ง', 'ไม่สำคัญ + ไม่ด่วน', '#D9D2C4']];
  const COL = ['#FFE680', '#BFE5CC', '#BFD6F2', '#F7C6BD'];
  const gridGeo = (L) => L.V ? { x: 80, y: 640, w: 920, h: 820 } : { x: 860, y: 230, w: 980, h: 760 };
  const notesHtml = (L, cls) => JOBS.map(([s], i) => '<div class="note ' + cls + i + '" style="width:' + (L.V ? 200 : 190) + 'px;min-height:' + (L.V ? 104 : 100) + 'px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:' + (L.V ? 28 : 27) + 'px;line-height:1.2;padding:8px;background:' + COL[i % 4] + '">' + s + '</div>').join('');
  // where a note sits on the messy wall
  const wallPos = (L, i) => L.V ? [180 + (i % 4) * 240, 700 + Math.floor(i / 4) * 170] : [1110 + (i % 4) * 215, 420 + Math.floor(i / 4) * 175];
  // where a note sits inside its quadrant (k = its rank among notes of that quadrant)
  const quadPos = (L, qd, k) => {
    const g = gridGeo(L), cw = g.w / 2, ch = g.h / 2, cx = g.x + (qd % 2) * cw, cy = g.y + Math.floor(qd / 2) * ch;
    return [cx + cw / 2 + ((k % 2) - 0.5) * (L.V ? 220 : 210), cy + 178 + Math.floor(k / 2) * (L.V ? 120 : 108)];
  };
  const rank = JOBS.map(([, qd], i) => JOBS.slice(0, i).filter(([, d]) => d === qd).length);
  const gridHtml = (L, cls) => {
    const g = gridGeo(L);
    let s = '<div class="' + cls + '" style="position:absolute;left:0;top:0;width:' + g.w + 'px;height:' + g.h + 'px">';
    QN.forEach(([a, b, c], i) => {
      s += '<div class="' + cls + '-q' + i + '" style="position:absolute;left:' + (i % 2) * g.w / 2 + 'px;top:' + Math.floor(i / 2) * g.h / 2 + 'px;width:' + (g.w / 2 - 12) + 'px;height:' + (g.h / 2 - 12) + 'px;background:' + c + ';border:6px solid var(--ink);border-radius:20px;padding:14px 20px">' +
        '<p style="font-weight:700;font-size:' + (L.V ? 38 : 38) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (L.V ? 26 : 26) + 'px;color:var(--ink2)">' + b + '</p></div>';
    });
    return s + '</div>';
  };
  const gridRender = (host, cls, L, t, t0s) => {
    const g = gridGeo(L), root = q(host, '.' + cls);
    root.style.transform = at(g.x, g.y);
    QN.forEach((_, i) => { const e = q(host, '.' + cls + '-q' + i); CF.pop(e, t, t0s[i] ?? -1, undefined, ''); });
  };

  // =========================================================================================== hook
  CF.scenes.hook = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'hook');
      this.C = { more: T('มากขึ้น', 'ลูกค้า'), run: T('วิ่งทั้งวัน', 'วิ่ง'), close: T('ปิดร้าน'), wall: T('โน้ตงาน', 'กำแพง'), urgent: T('ด่วนไปหมด', 'ด่วน') };
      const owner = '<svg class="art hk-own" width="300" height="360" viewBox="-150 -340 300 360" style="overflow:visible">' + CF.body('var(--ink)') + '</svg>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'hk-tape') + line('hk-l1', 'ร้านรับลูกค้าได้มากขึ้นแล้ว!', V ? 70 : 70) +
        '<p class="t hk-l2" style="font-size:' + (V ? 60 : 64) + 'px">แต่เจ้าของร้าน… <span style="color:var(--main)">วิ่งทั้งวัน</span></p>' + owner + notesHtml(L, 'hk-n') +
        '<p class="stamp hk-st" style="font-size:' + (V ? 70 : 76) + 'px">ด่วนไปหมด!</p>');
      Object.assign(this, { tape: q(host, '.hk-tape'), l1: q(host, '.hk-l1'), l2: q(host, '.hk-l2'), own: q(host, '.hk-own'), ns: JOBS.map((_, i) => q(host, '.hk-n' + i)), st: q(host, '.hk-st') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.l1, t, 0.2, undefined, at(L.tx, L.ty));
      CF.pop(this.l2, t, C.run - 0.3, undefined, at(L.tx, L.ty + (V ? 110 : 120)));
      // the owner runs left and right
      const run = Math.max(0, t - C.run), sx = Math.sin(run * 3) * (V ? 260 : 200), ox = V ? 540 + sx : 420 + sx, oy = V ? 1480 : 980;
      CF.pop(this.own, t, C.run - 0.2, undefined, at(ox - 150, oy - 340, ' scaleX(' + (Math.cos(run * 3) >= 0 ? 1 : -1) + ')'));
      this.ns.forEach((n, i) => { const [x, y] = wallPos(L, i); CF.pop(n, t, C.wall - 0.3 + i * 0.12, undefined, mid(x + CF.shake(t, C.urgent, 5) * (i % 2 ? 1 : -1), y), [-5, 4, -3, 6, -4, 3, -6, 5, -2, 4, -5, 3][i]); });
      CF.slam(this.st, t, C.urgent - 0.1, V ? mid(540, 1180) : mid(1340, 900), -6, 2.2);
    },
  };

  // =========================================================================================== recap
  CF.scenes.recap = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'recap');
      this.C = { toc: T('ทีโอซี', 'toc'), stove: T('เตา'), moved: T('ย้ายไป', 'ล้างจาน'), grow: T('โตขึ้น', 'เพิ่มขึ้น') };
      const card = (cls, a, b, c) => '<div class="card ' + cls + '" style="width:' + (V ? 860 : 520) + 'px;padding:26px 30px 30px;' + (c ? 'border-color:var(--main)' : '') + '"><p style="font-weight:700;font-size:' + (V ? 48 : 46) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (V ? 36 : 34) + 'px;color:var(--ink2)">' + b + '</p></div>';
      host.insertAdjacentHTML('beforeend', '<p class="tape rc-tape" style="font-size:' + (V ? 40 : 36) + 'px">ตอนที่แล้ว…</p>' +
        card('rc-a', 'TOC: แก้คอขวดที่เตา', 'เตา 60 → 96 จาน/ชม.') + card('rc-b', 'คอขวดย้ายไปที่ล้างจาน', 'จานสะอาดหมดก่อน', true) + card('rc-c', 'งานเจ้าของร้านเพิ่มขึ้น', 'ตามร้านที่โตขึ้น'));
      Object.assign(this, { tape: q(host, '.rc-tape'), a: q(host, '.rc-a'), b: q(host, '.rc-b'), c: q(host, '.rc-c') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 30, L.tapeY), -3);
      const P = V ? [[540, 560], [540, 820], [540, 1080]] : [[400, 560], [960, 560], [1520, 560]];
      CF.pop(this.a, t, C.toc - 0.2, undefined, mid(P[0][0], P[0][1]), -1.5);
      CF.pop(this.b, t, C.moved - 0.2, undefined, mid(P[1][0], P[1][1]), 1.2);
      CF.pop(this.c, t, C.grow - 0.4, undefined, mid(P[2][0], P[2][1]), -1);
    },
  };

  // =========================================================================================== idea
  CF.scenes.idea = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'idea');
      this.C = { name: T('ไอเซนฮาวร์', 'เมทริกซ์'), imp: T('สำคัญไหม', 'สำคัญ'), urg: T('ด่วนไหม', 'ด่วน'), four: T('สี่ช่อง'), q0: T('ทำเอง'), q1: T('วางแผน'), q2: T('มอบหมาย'), q3: T('ตัดทิ้ง') };
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'id-tape') + '<p class="t id-name" style="font-size:' + (V ? 96 : 110) + 'px;color:var(--main)">Eisenhower<br>Matrix</p>' +
        '<p class="pill id-i" style="font-size:' + (V ? 44 : 44) + 'px">สำคัญไหม?</p><p class="pill id-u" style="font-size:' + (V ? 44 : 44) + 'px">ด่วนไหม?</p>' + gridHtml(L, 'id-g'));
      Object.assign(this, { tape: q(host, '.id-tape'), name: q(host, '.id-name'), i: q(host, '.id-i'), u: q(host, '.id-u'), host });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.slam(this.name, t, C.name - 0.1, at(L.tx, L.ty - 20), -2, 1.6);
      CF.pop(this.i, t, C.imp - 0.1, undefined, V ? at(L.tx, 565) : at(L.tx, 620), -2);
      CF.pop(this.u, t, C.urg - 0.1, undefined, V ? at(L.tx + 300, 565) : at(L.tx + 330, 620), 2);
      gridRender(this.host, 'id-g', L, t, [C.q0, C.q1, C.q2, C.q3].map((x) => x - 0.15));
    },
  };

  const stepScene = (id, n, en, th, o) => ({
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), T = CF.heard(api, id); this.id = id; this.host = host;
      host.insertAdjacentHTML('beforeend', CF.tape(L, id + '-tape') + (n ? stepHead(L, id + '-h', n, en, th) : '') + (o.extra ? o.extra(L, id) : ''));
      Object.assign(this, { tape: q(host, '.' + id + '-tape'), h: q(host, '.' + id + '-h'), th: q(host, '.' + id + '-h-th') });
      this.C = o.cues(T); if (o.init) o.init.call(this, host, L);
    },
    render(t) {
      const L = this.L, V = L.V;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      if (this.h) { CF.pop(this.h, t, 0.1, undefined, at(L.tx, L.ty)); CF.pop(this.th, t, 0.25, undefined, at(L.tx, L.ty + (V ? 112 : 118))); }
      if (o.after) o.after.call(this, t, L);
    },
  });

  CF.scenes.list = stepScene('list', '1', 'List', 'ลิสต์ทุกงานที่ค้าง', {
    cues: (T) => ({ all: T('ทุกงาน'), nopick: T('ไม่ต้องคัด', 'คัด'), twelve: T('สิบสองงาน', 'สิบสอง') }),
    extra: (L) => notesHtml(L, 'ls-n') + '<p class="sticker ls-12" style="font-size:' + (L.V ? 64 : 64) + 'px">12 งาน!</p>',
    init(host) { this.ns = JOBS.map((_, i) => q(host, '.ls-n' + i)); this.e12 = q(host, '.ls-12'); },
    after(t, L) {
      const C = this.C, V = L.V;
      this.ns.forEach((n, i) => { const [x, y] = wallPos(L, i); CF.pop(n, t, lerp(C.all - 0.2, Math.max(C.all + 0.6, C.twelve - 0.3), i / 11), undefined, mid(x, y + (V ? 0 : 60)), [-3, 2, -2, 3][i % 4]); });
      CF.slam(this.e12, t, C.twelve, V ? mid(540, 1300) : mid(L.tx + 260, 700), -4, 2);
    },
  });

  CF.scenes.ask = stepScene('ask', '2', 'Ask', 'ถาม 2 คำถาม ทีละงาน', {
    cues: (T) => ({ imp: T('สำคัญไหม', 'สำคัญ'), goal: T('เป้าหมาย'), urg: T('ด่วนไหม', 'ด่วน'), two: T('สองวัน') }),
    extra: (L) => {
      const w = L.V ? 900 : 760, card = (cls, a, b) => '<div class="card ' + cls + '" style="width:' + w + 'px;padding:28px 36px 34px"><p style="font-weight:700;font-size:' + (L.V ? 64 : 64) + 'px">' + a + '</p><p style="font-weight:700;font-size:' + (L.V ? 40 : 40) + 'px;color:var(--ink2)">' + b + '</p></div>';
      return card('ak-a', 'สำคัญไหม?', 'กระทบเป้าหมายของร้านหรือเปล่า') + card('ak-b', 'ด่วนไหม?', 'ต้องเสร็จภายใน 2 วันหรือเปล่า');
    },
    init(host) { this.a = q(host, '.ak-a'); this.b = q(host, '.ak-b'); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.a, t, C.imp - 0.15, undefined, V ? mid(540, 800) : mid(1300, 420), -1.5);
      CF.pop(this.b, t, C.urg - 0.15, undefined, V ? mid(540, 1100) : mid(1300, 720), 1.5);
    },
  });

  CF.scenes.sort = stepScene('sort', '3', 'Sort', 'แยกลง 4 ช่อง', {
    cues: (T) => ({ s0: T('เตาหัวที่สอง', 'จุดไม่ติด'), d0: T('ทำเองวันนี้', 'ทำเอง'), s1: T('หาคนล้างจาน', 'คนล้างจาน'), d1: T('จองเวลา'), s2: T('ตอบแชต', 'แชต'), d2: T('มอบหมาย', 'แคชเชียร์'), s3: T('สีป้าย', 'ป้ายร้าน'), d3: T('ตัดทิ้ง') }),
    extra: (L) => gridHtml(L, 'so-g') + notesHtml(L, 'so-n'),
    init(host) { this.host = host; this.ns = JOBS.map((_, i) => q(host, '.so-n' + i)); },
    after(t, L) {
      const C = this.C, V = L.V;
      gridRender(this.host, 'so-g', L, t, [-1, -1, -1, -1]);
      const d = [C.d0, C.d1, C.d2, C.d3], s = [C.s0, C.s1, C.s2, C.s3];
      this.ns.forEach((n, i) => {
        const qd = JOBS[i][1], [wx, wy] = V ? [180 + (i % 4) * 240, 560 - 400 + 0] : [L.tx + 100 + (i % 3) * 210, 470 + Math.floor(i / 3) * 130], [qx, qy] = quadPos(L, qd, rank[i]);
        // the four named jobs move on their words; the other eight follow after the last one
        const t0 = i < 4 ? d[i] - 0.3 : lerp(C.d1, Math.max(C.d1 + 0.5, C.d3 - 0.2), (i - 4) / 7), p = eio(seg(t, t0, t0 + 0.55));
        if (V) CF.pop(n, t, t0 + 0.2, undefined, mid(qx, qy), [-3, 2, -2, 3][i % 4]);
        else CF.pop(n, t, 0.3 + i * 0.05, undefined, mid(lerp(wx, qx, p), lerp(wy, qy, p)), [-3, 2, -2, 3][i % 4] * (1 - p));
      });
    },
  });

  // the week: 7 columns × 4 blocks; before = all red "fire", after = blue "important" blocks first
  const weekHtml = (L, cls) => {
    const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'], w = L.V ? 900 : 900, cw = w / 7;
    let s = '<div class="card ' + cls + '" style="width:' + w + 'px;padding:20px 0 24px"><div style="display:flex">';
    days.forEach((d, i) => {
      s += '<div style="width:' + cw + 'px;display:flex;flex-direction:column;align-items:center;gap:10px"><p style="font-weight:700;font-size:34px">' + d + '</p>';
      for (let k = 0; k < 4; k++) s += '<div class="' + cls + '-b' + (i * 4 + k) + '" style="width:' + (cw - 22) + 'px;height:' + (L.V ? 74 : 70) + 'px;border-radius:10px;background:#D9D2C4"></div>';
      s += '</div>';
    });
    return s + '</div></div>';
  };
  // which blocks become "important" (blue) after the re-plan: Monday morning + one block on four days
  const BLUE = new Set([0, 8, 16, 24, 9]);
  const weekRender = (host, cls, t, red0, blue0) => {
    for (let b = 0; b < 28; b++) {
      const e = q(host, '.' + cls + '-b' + b), r = seg(t, red0 + b * 0.025, red0 + b * 0.025 + 0.15), bl = blue0 === undefined ? 0 : seg(t, blue0 + [...BLUE].indexOf(b) * 0.25, blue0 + [...BLUE].indexOf(b) * 0.25 + 0.2);
      e.style.background = BLUE.has(b) && bl > 0.5 ? '#245FA6' : r > 0.5 ? (blue0 !== undefined && t > blue0 && !BLUE.has(b) && b % 4 === 3 ? '#FFE680' : '#E5402F') : '#D9D2C4';
    }
  };

  CF.scenes.twist = stepScene('twist', '4', 'Check', 'งานสำคัญได้เวลาไหม?', {
    cues: (T) => ({ look: T('สำคัญแต่ไม่ด่วน', 'ไม่ด่วน'), zero: T('สักชั่วโมง', 'ไม่มีเวลา'), fire: T('ดับไฟ'), never: T('ไม่เคยได้เริ่ม', 'ไม่เคย') }),
    extra: (L) => weekHtml(L, 'tw-w') + '<p class="pill tw-l" style="font-size:' + (L.V ? 40 : 40) + 'px">สำคัญแต่ไม่ด่วน: <span style="color:#FFC21A">0 ชั่วโมง</span></p>' +
      '<p class="stamp tw-st" style="font-size:' + (L.V ? 74 : 78) + 'px">ดับไฟทั้งสัปดาห์!</p>',
    init(host) { this.host = host; Object.assign(this, { wk: q(host, '.tw-w'), l: q(host, '.tw-l'), st: q(host, '.tw-st') }); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.wk, t, C.look - 0.5, undefined, V ? mid(540, 860) : mid(1300, 560));
      weekRender(this.host, 'tw-w', t, C.look);
      CF.pop(this.l, t, C.zero - 0.2, undefined, V ? mid(540, 1240) : mid(1300, 920), -1);
      CF.slam(this.st, t, C.fire - 0.1, V ? mid(540, 1420) : mid(L.tx + 330, 720), -6, 2);
    },
  });

  CF.scenes.weekly = stepScene('weekly', '5', 'Repeat', 'ทุกเช้าวันจันทร์ 10 นาที', {
    cues: (T) => ({ mon: T('วันจันทร์', 'จันทร์'), ten: T('สิบนาที'), first: T('งานสำคัญก่อน', 'สำคัญก่อน'), deleg: T('มอบหมาย') }),
    extra: (L) => weekHtml(L, 'wk-w') + '<p class="sticker wk-10" style="font-size:' + (L.V ? 56 : 56) + 'px">⏱ 10 นาที</p>' +
      '<div class="wk-key" style="position:absolute;left:0;top:0;display:flex;gap:28px;font-weight:700;font-size:' + (L.V ? 34 : 34) + 'px"><span><b style="display:inline-block;width:30px;height:30px;border-radius:6px;background:#245FA6;vertical-align:-4px"></b> งานสำคัญ</span><span><b style="display:inline-block;width:30px;height:30px;border-radius:6px;background:#FFE680;vertical-align:-4px"></b> มอบหมายแล้ว</span></div>',
    init(host) { this.host = host; Object.assign(this, { wk: q(host, '.wk-w'), e10: q(host, '.wk-10'), key: q(host, '.wk-key') }); },
    after(t, L) {
      const C = this.C, V = L.V;
      CF.pop(this.wk, t, 0.3, undefined, V ? mid(540, 860) : mid(1300, 560));
      weekRender(this.host, 'wk-w', t, -2, C.first - 0.2);
      CF.slam(this.e10, t, C.ten - 0.1, V ? mid(540, 1190) : mid(L.tx + 260, 620), -4, 1.8);
      CF.pop(this.key, t, C.first, undefined, V ? at(140, 1300) : at(860, 900));
    },
  });

  // =========================================================================================== result
  CF.scenes.result = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'result');
      this.C = { weeks: T('สองสัปดาห์'), wash: T('คนล้างจาน', 'ล้างจาน'), clean: T('ไม่ขาด', 'จานสะอาด'), plan: T('วางแผนขยาย', 'ขยายร้าน') };
      const ok = (cls, s) => '<p class="t ' + cls + '" style="font-size:' + (V ? 56 : 60) + 'px"><span style="color:var(--d)">✓</span> ' + s + '</p>';
      host.insertAdjacentHTML('beforeend', CF.tape(L, 'rs-tape') + '<p class="pill rs-wk" style="font-size:' + (V ? 44 : 42) + 'px">2 สัปดาห์ต่อมา</p>' +
        ok('rs-a', '+1 คนล้างจาน') + ok('rs-b', 'จานสะอาดไม่ขาดอีก') + ok('rs-c', 'มีเวลาวางแผนขยายร้านทุกสัปดาห์'));
      Object.assign(this, { tape: q(host, '.rs-tape'), wk: q(host, '.rs-wk'), a: q(host, '.rs-a'), b: q(host, '.rs-b'), c: q(host, '.rs-c') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V, y = V ? 640 : 440, dy = V ? 150 : 140;
      CF.pop(this.tape, t, 0.02, undefined, at(L.tx - 120, L.tapeY), -3);
      CF.pop(this.wk, t, C.weeks - 0.1, undefined, at(L.tx, L.ty), -2);
      CF.pop(this.a, t, C.wash - 0.2, undefined, at(L.tx, y));
      CF.pop(this.b, t, C.clean - 0.3, undefined, at(L.tx, y + dy));
      CF.pop(this.c, t, C.plan - 0.3, undefined, at(L.tx, y + 2 * dy));
    },
  };

  // =========================================================================================== close (the owner's arc; the six episodes; the site)
  const EPS = ['5 Whys', 'PDCA', 'Fishbone', 'Pareto', 'TOC', 'Eisenhower'];
  CF.scenes.close = {
    init(host, api) {
      const L = this.L = LAY(api.W, api.H), V = L.V, T = CF.heard(api, 'close');
      this.C = { fire: T('วิ่งดับไฟ', 'ดับไฟ'), boss: T('ผู้บริหาร'), all: T('ทุกอย่างเอง', 'ไม่ต้องทำ'), self: T('ควรทำเอง'), see: T('ดูวิธี'), name: T('เข็มทิศ') };
      host.insertAdjacentHTML('beforeend',
        '<p class="t cl-a" style="font-size:' + (V ? 54 : 58) + 'px;color:var(--ink2)"><s>คอยวิ่งดับไฟ</s></p>' +
        '<p class="t cl-b" style="font-size:' + (V ? 66 : 72) + 'px">→ <span style="color:var(--main)">ผู้บริหาร</span>ที่รู้ว่าเวลาควรไปอยู่ตรงไหน</p>' +
        '<div class="cl-eps" style="position:absolute;left:0;top:0;display:flex;flex-wrap:wrap;gap:12px;width:' + (V ? 900 : 1700) + 'px">' + EPS.map((e, i) => '<span class="pill" style="position:static;font-size:' + (V ? 32 : 32) + 'px;' + (i === 5 ? 'background:var(--main)' : '') + '">' + (i + 1) + ' · ' + e + '</span>').join('') + '</div>' +
        line('cl-r', 'ไม่ต้องทำทุกอย่างเอง แต่ต้องรู้ว่าอะไรควรทำเอง!', V ? 46 : 50) +
        line('cl-see', 'ดูวิธีเต็ม ๆ ได้ที่เว็บ', V ? 44 : 40) +
        '<p class="cl-name" style="position:absolute;left:0;top:0;font-weight:700;font-size:' + (V ? 84 : 76) + 'px;background:var(--ink);color:#fff;padding:10px 40px 22px;border-radius:22px;box-shadow:12px 12px 0 var(--main);white-space:nowrap;transform-origin:0 50%">เข็มทิศกรอบความคิด</p>' +
        '<p class="t mute cl-url" style="font-size:' + (V ? 32 : 30) + 'px">ppongsakorn.github.io/management-framework</p>' +
        '<p class="t mute cl-org" style="font-size:26px;font-weight:600">แนวคิดจาก: Time Management · Dwight D. Eisenhower</p>' +
        '<p class="t mute cl-ai" style="font-size:24px;font-weight:600">คลิปนี้ทำด้วยเครื่องมือ AI</p>');
      Object.assign(this, { a: q(host, '.cl-a'), b: q(host, '.cl-b'), eps: q(host, '.cl-eps'), r: q(host, '.cl-r'), see: q(host, '.cl-see'), name: q(host, '.cl-name'), url: q(host, '.cl-url'), org: q(host, '.cl-org'), ai: q(host, '.cl-ai') });
    },
    render(t) {
      const L = this.L, C = this.C, V = L.V;
      const P = V ? { a: [80, 300], b: [80, 380], eps: [80, 560], r: [80, 720], see: [80, 960], name: [80, 1025], url: [80, 1215], org: [80, 1265], ai: [80, 1310] }
                  : { a: [110, 130], b: [110, 210], eps: [110, 340], r: [110, 450], see: [110, 600], name: [110, 680], url: [110, 860], org: [110, 910], ai: [110, 970] };
      if (V) this.b.style.whiteSpace = 'normal', this.b.style.width = '900px';
      CF.pop(this.a, t, C.fire - 0.2, undefined, at(P.a[0], P.a[1]));
      CF.pop(this.b, t, C.boss - 0.2, undefined, at(P.b[0], P.b[1]));
      CF.pop(this.eps, t, C.boss + 0.8, undefined, at(P.eps[0], P.eps[1]));
      CF.pop(this.r, t, C.all - 0.3, undefined, at(P.r[0], P.r[1]));
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
