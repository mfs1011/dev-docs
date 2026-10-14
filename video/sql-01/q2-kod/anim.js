// SQL 1-bob, 2-video: Kod — chapda haqiqiy psql (../natijalar/pg-tty.txt), o'ngda daftar natijani tushuntiradi.
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, arrow, marker, card, heading, table, RH, HH, rowCenter, kf, sticky, check, cross, bg, tw, MONO, blocks, term } = K;

  const PG = blocks(window.TTY.pg, /^qollanma=# /);
  const B = (start) => PG.find((b) => b.cmd.startsWith('qollanma=# ' + start));
  const bCreate = B('CREATE TABLE talabalar'), bInsert = B('INSERT INTO talabalar'), bSel1 = PG.filter((b) => b.cmd === 'qollanma=# SELECT * FROM talabalar;')[0];
  const bUpd = B('UPDATE'), bSel2 = PG.filter((b) => b.cmd === 'qollanma=# SELECT * FROM talabalar;')[1], bOrd = B('SELECT * FROM talabalar ORDER BY');
  const bCnt = B('SELECT is_supported'), bFeat = B('SELECT feature_id');
  const TCOLS = [{ label: 'id', w: 90 }, { label: 'ism', w: 210 }, { label: 'kurs', w: 130, align: 'right' }];
  const TT = { x: 70, y: 150, w: 1060, h: 780 };
  const typeDur = (b) => Math.min(2.4, 0.4 + b.cmd.length * 0.03);
  const outAt = (it) => it.t + (it.typeDur ?? typeDur(it.b)) + 0.15;
  const psql = (t, items, hl) => term(TT.x, TT.y, TT.w, TT.h, { title: 'psql — PostgreSQL 18.6 · baza: qollanma', prompt: /^qollanma=# /, items, t, size: 24, hl });

  function sIntro(t) {
    hand('1-bob · Kod', 960, 330, { size: 70, align: 'center', p: P(t, 0.3, 1), color: C.soft });
    hand('Qatorlar tartibi va sql_features', 960, 460, { size: 84, align: 'center', p: P(t, 0.7, 1.4), color: C.blue });
    marker(520, 500, 880 * eio(P(t, 2.0, 0.7)), 18, C.hl, 1);
    withA(P(t, W('L1', 'haqiqiy'), 0.6), () => { text('PostgreSQL 18.6 — haqiqiy terminal, haqiqiy natija', 960, 620, { size: 34, weight: 600, fam: MONO, color: C.green, align: 'center' }); });
  }

  // jadval, update, orderby — bitta uzluksiz psql sessiyasi
  const sessionItems = () => [
    { b: bCreate, t: W('L2', 'yaratamiz') - 0.6 },
    { b: bInsert, t: W('L2', 'uchta') - 0.3 },
    { b: bSel1, t: W('L3', 'selekt') - 0.2 },
    { b: bUpd, t: W('L4', 'ozgartiramiz') - 0.4 },
    { b: bSel2, t: W('L4', 'qaytaramiz') },
    { b: bOrd, t: W('L7', 'order') - 0.3 },
  ];
  function sSession(t) {
    const it = sessionItems();
    const tIns = outAt(it[1]), tSel1 = outAt(it[2]), tUpd = outAt(it[3]), tSel2 = outAt(it[4]), tOrd = outAt(it[5]);
    heading(t < L('L4').s - 0.3 ? 'Jadval va SELECT' : t < L('L7').s - 0.3 ? 'UPDATE dan keyin' : 'ORDER BY', t, L('L2').s - 0.4);
    psql(t, it, [
      { match: ' Ali ', col: 'rgba(255, 214, 10, 0.28)', from: tSel2 + 0.4, to: tOrd },
      { match: ' Ali ', col: 'rgba(60, 200, 120, 0.28)', from: tOrd + 0.4 },
    ]);
    // daftar: talabalar
    const x = 1300, y = 300;
    const rows = [[1, 'Ali', 1], [2, 'Vali', 2], [3, 'Dilnoza', 1]];
    const slot = (i) => kf(t, [[0, i], [tSel2 + 0.3, [2, 0, 1][i]], [tOrd + 0.3, i]], 0.9);
    table(x, y, 'talabalar', TCOLS, rows, {
      p: P(t, tIns, 0.9),
      row: (i) => ({ slot: slot(i), hl: i === 0 ? Math.max(P(t, tUpd, 0.4) * (1 - P(t, tOrd, 0.4)), 0) : P(t, tSel1, 0.3) * (1 - P(t, tSel1 + 1.2, 0.4)), hlCol: i === 0 ? C.hl : C.hlGreen }),
    });
    // kurs 1 -> 2
    const kU = P(t, tUpd, 0.5);
    if (kU > 0) {
      const ry = y + HH + slot(0) * RH;
      ctx.save(); ctx.fillStyle = '#fffdf8'; ctx.fillRect(x + 305, ry + 6, 120, RH - 12); ctx.restore();
      withA(1 - kU, () => text('1', x + 412, ry + RH / 2 + 1, { size: 29, fam: MONO, align: 'right' }));
      withA(kU, () => text('2', x + 412, ry + RH / 2 + 1, { size: 29, fam: MONO, align: 'right', color: C.green, weight: 700 }));
    }
    // natija tartibi yorliqlari
    withA(P(t, tSel1, 0.5) * (1 - P(t, tUpd, 0.3)), () => hand('qo‘shilgan tartibda', x, y + HH + 3 * RH + 60, { size: 38, color: C.green }));
    withA(P(t, W('L5', 'oxirida'), 0.4) * (1 - P(t, tOrd, 0.4)), () => { hand('Ali — oxirida!', x, y + HH + 3 * RH + 60, { size: 44, color: C.red }); hand('!', x + 470, y + HH + 2 * RH + 30, { size: 90, color: C.red }); });
    // MVCC: eski versiya o'chirilgan, yangisi oxirida
    const kM = P(t, W('L6', 'yangi'), 0.6) * (1 - P(t, tOrd, 0.4));
    withA(kM, () => {
      card(x - 20, 640, 560, 250, { seed: 300 });
      text("(1, 'Ali', 1)", x + 20, 700, { size: 28, fam: MONO, color: C.soft });
      sline(x + 14, 700, x + 230, 700, { col: C.red, w: 4, seed: 301 });
      hand('eski versiya', x + 260, 700, { size: 32, color: C.red });
      text("(1, 'Ali', 2)", x + 20, 770, { size: 28, fam: MONO, weight: 700, color: C.green });
      hand('yangi versiya', x + 260, 770, { size: 32, color: C.green });
      withA(P(t, W('L6', 'em-vi-si-si'), 0.5), () => hand('MVCC → 52-bob', x + 20, 845, { size: 34, color: C.purple }));
    });
    // ORDER BY — kafolat
    withA(P(t, tOrd + 0.6, 0.5), () => { check(x - 40, y + HH + 3 * RH + 62, P(t, tOrd + 0.6, 0.4)); hand('ORDER BY id — tartib kafolatlanadi', x, y + HH + 3 * RH + 60, { size: 38, color: C.green }); });
  }

  function sFeatures(t) {
    heading('sql_features', t, L('L8').s - 0.4);
    const items = [{ b: bCnt, t: W('L9', 'guruhlab') - 0.4 }, { b: bFeat, t: W('L11', 'torttasini') - 0.3 }];
    const tCnt = outAt(items[0]), tFeat = outAt(items[1]);
    const codes = [['E011', 'e', 'raqamli tiplar', null], ['F302', 'f', 'INTERSECT', '28-bob'], ['T611', 't', 'window funksiyalar', '31-bob'], ['T626', 't', 'ANY_VALUE', '26-bob']];
    // E011 — "E", F302 — "F", T611/T626 — birinchi va ikkinchi "olti" ("t" bilan qidirsak "tiplar"ga tushadi)
    const codeT = (i) => [W('L12', 'e'), W('L12', 'f'), W('L12', 'olti', 0), W('L12', 'olti', 1)][i];
    psql(t, items, codes.map(([c], i) => ({ match: ' ' + c + ' ', col: 'rgba(80,150,255,0.3)', from: codeT(i), to: i < 3 ? codeT(i + 1) : codeT(i) + 3 })));
    const x = 1210;
    // information_schema -> sql_features
    const kI = P(t, L('L8').s, 0.6);
    withA(kI * (1 - P(t, tCnt + 0.5, 0.5)), () => {
      card(x, 220, 640, 300, { seed: 310 });
      text('9075-11 · SQL/Schemata', x + 30, 270, { size: 26, fam: MONO, color: C.soft });
      hand('information_schema', x + 30, 330, { size: 46, color: C.blue });
      arrow(x + 60, 360, x + 60, 440, { col: C.blue, w: 3, seed: 311, p: P(t, W('L8', 'es-kyu-el'), 0.5) });
      hand('sql_features', x + 90, 460, { size: 44, color: C.purple, p: P(t, W('L8', 'es-kyu-el'), 0.8) });
    });
    // ustunlar diagrammasi: YES 320, NO 295 (haqiqiy natija)
    const kB = P(t, tCnt + 0.3, 0.6);
    withA(kB * (1 - P(t, tFeat - 0.2, 0.5)), () => {
      const base = 760, maxH = 420;
      [['YES', 320, C.green], ['NO', 295, C.pencil]].forEach(([l, n, col], i) => {
        const h = (n / 320) * maxH * eio(P(t, tCnt + 0.3 + i * 0.2, 1.0)), bx = x + 80 + i * 280;
        ctx.save(); ctx.fillStyle = col; ctx.globalAlpha *= 0.8; ctx.fillRect(bx, base - h, 180, h); ctx.restore();
        srect(bx, base - h, 180, h, { col: '#2b2d42', w: 2.4, seed: 320 + i });
        text(String(n), bx + 90, base - h - 30, { size: 40, weight: 800, fam: MONO, align: 'center' });
        hand(l, bx + 90, base + 40, { size: 40, align: 'center', color: col });
      });
      withA(P(t, W('L10', 'kor'), 0.5), () => hand('Core + ixtiyoriy — birga', x + 40, 880, { size: 38, color: C.orange }));
    });
    // kodlar
    codes.forEach(([c, , nm, bob], i) => {
      const k = P(t, codeT(i), 0.5), yy = 260 + i * 130;
      if (k <= 0) return;
      card(x, yy, 640, 105, { a: k, seed: 330 + i });
      withA(k, () => { text(c, x + 30, yy + 52, { size: 36, weight: 800, fam: MONO, color: C.blue }); hand(nm, x + 170, yy + 52, { size: 38 }); if (bob) text(bob, x + 610, yy + 52, { size: 26, fam: MONO, color: C.soft, align: 'right' }); });
    });
    withA(P(t, W('L13', 'taqribiy'), 0.5), () => sticky(x + 40, 800, 560, 110, 'ro‘yxat taqribiy — aniq javob hujjatda', '#ffd9cf', P(t, W('L13', 'taqribiy'), 0.5), -0.02));
  }

  function sXulosa(t) {
    const t14 = L('L14').s;
    hand('Xulosa', 960, 220, { size: 60, align: 'center', p: P(t, t14 - 0.3, 0.8) });
    withA(P(t, W('L14', 'tayanmang'), 0.5), () => { cross(560, 470, P(t, W('L14', 'tayanmang'), 0.5), 1.3); hand('natija tartibiga tayanish', 640, 470, { size: 52, color: C.red }); });
    withA(P(t, W('L14', 'doim'), 0.5), () => { check(560, 620, P(t, W('L14', 'doim'), 0.5), C.green); hand('tartib kerak → doim', 640, 620, { size: 52, color: C.green }); text('ORDER BY', 1160, 622, { size: 56, weight: 800, fam: MONO, color: C.blue }); });
    withA(P(t, W('L14', 'doim') + 1.5, 0.6), () => hand('Keyingi video: dialektlar →', 960, 840, { size: 48, align: 'center', color: C.purple }));
  }

  const SCENES = { intro: sIntro, jadval: sSession, update: sSession, orderby: sSession, features: sFeatures, xulosa: sXulosa };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    bg();
    const sc = TM.scenes;
    // jadval → update → orderby — bitta sessiya: sahnalar orasida o'chib yonmaydi
    const group = (name) => (['jadval', 'update', 'orderby'].includes(name) ? { s: sc.jadval.s, e: sc.orderby.e } : sc[name]);
    for (const name of ['intro', 'jadval', 'features', 'xulosa']) {
      const r = group(name);
      if (t >= r.s && t < r.e) withA(Math.min(name === 'intro' ? 1 : P(t, r.s, 0.5), 1 - P(t, r.e - 0.5, 0.5)), () => SCENES[name](t));
    }
    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1920, 1080); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.DURATION = TM.end;
  window.renderPoster = () => {
    render(0.001); ctx.globalAlpha = 1; bg();
    hand('1-bob · Kod', 120, 220, { size: 54, color: C.soft }); hand('Qatorlar tartibi', 120, 330, { size: 90, color: C.blue }); hand('va sql_features', 120, 440, { size: 70 });
    term(1080, 560, 760, 420, { title: 'psql — PostgreSQL 18.6', prompt: /^qollanma=# /, items: [{ b: bSel2, t: 0, typeDur: 0.01, outDur: 0.01 }], t: 99, size: 22, hl: [{ match: ' Ali ', from: 0 }] });
  };
  if (location.hash === '#play') { const t0 = performance.now(); const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); }; document.fonts.ready.then(loop); } else render(0);
})();
