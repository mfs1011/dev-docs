// SQL 1-bob, 3-video: Dialektlar — chapda tizimlar orasida almashadigan haqiqiy terminal, o'ngda natijalar taxtasi.
// Chiqishlar: ../natijalar/{pg,my,sqlite,sqlite-pragma}-tty.txt (pty orqali yozilgan interaktiv sessiyalar).
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, arrow, marker, card, heading, codeCard, sticky, check, cross, bg, tw, MONO, blocks, term } = K;

  const SYS = {
    pg: { title: 'psql — PostgreSQL 18.6', prompt: /^qollanma=# /, col: C.blue, name: 'PostgreSQL', b: blocks(window.TTY.pg, /^qollanma=# /) },
    my: { title: 'mysql — MySQL 9.7.2 (sukut rejimi)', prompt: /^mysql> /, col: C.orange, name: 'MySQL', b: blocks(window.TTY.my, /^mysql> /) },
    sl: { title: 'sqlite3 — SQLite 3.54.0 (DQS=0)', prompt: /^SQLite-3\.54 memory-> /, col: C.teal, name: 'SQLite', b: blocks(window.TTY.sqlite, /^SQLite-3\.54 memory-> /) },
  };
  const blk = (sys, cmd, n = 0) => {
    const list = SYS[sys].b.filter((b) => b.cmd.slice(b.cmd.match(SYS[sys].prompt)[0].length) === cmd);
    if (!list[n]) throw new Error(`blok yo'q: ${sys} ${cmd}`);
    return list[n];
  };
  const CONCAT = "SELECT 'Salom, ' || 'dunyo' AS natija;";
  const NARROW = { x: 60, y: 150, w: 1180, h: 790 }, WIDE = { x: 60, y: 150, w: 1800, h: 790 };

  // "Kadrlar": har biri bitta tizim terminali, vaqt oralig'i va buyruqlar (t — buyruq yozila boshlagan payt)
  const shots = () => [
    { from: W('L3', 'postgres') - 0.4, sys: 'pg', items: [[blk('pg', CONCAT), W('L3', 'postgres') - 0.2]] },
    { from: W('L3', 'es-kyu-layt') - 0.3, sys: 'sl', items: [[blk('sl', CONCAT), W('L3', 'es-kyu-layt')]] },
    { from: W('L4', 'may') - 0.3, sys: 'my', items: [[blk('my', CONCAT), W('L4', 'may') - 0.1]], hl: [{ match: '3 warnings', col: 'rgba(240,140,46,0.35)', from: W('L4', 'uchta') }] },
    { from: W('L5', 'ogohlantirishlarni') - 0.3, sys: 'my', wide: true, items: [[blk('my', CONCAT), -99], [blk('my', 'SHOW WARNINGS;'), W('L5', 'ogohlantirishlarni')]],
      hl: [{ match: '1287', col: 'rgba(240,80,60,0.28)', from: W('L5', 'yoki') }, { match: '1292', col: 'rgba(240,140,46,0.28)', from: W('L5', 'songa') }] },
    { from: W('L7', 'postgres') - 0.4, sys: 'pg', items: [[blk('pg', 'SELECT "salom";'), W('L7', 'postgres') - 0.2]] },
    { from: W('L8', 'may') - 0.3, sys: 'my', items: [[blk('my', 'SELECT "salom";'), W('L8', 'may') - 0.1]] },
    { from: W('L9', 'es-kyu-laytda') - 0.3, sys: 'sl', items: [[blk('sl', 'SELECT "salom";'), W('L9', 'es-kyu-laytda')]] },
    { from: W('L10', 'di-bi-konfig') - 0.4, sys: 'sl', items: [[blk('sl', 'SELECT "salom";'), -99], [blk('sl', '.dbconfig dqs_dml on'), W('L10', 'di-bi-konfig') - 0.2], [blk('sl', 'SELECT "salom";', 1), W('L10', 'xuddi')]] },
    { from: W('L13', 'postgres') - 0.6, sys: 'pg', items: [[blk('pg', 'CREATE TABLE sinov (n integer);'), W('L13', 'postgres') - 0.6], [blk('pg', "INSERT INTO sinov VALUES ('abc');"), W('L13', 'postgres') + 0.6]] },
    { from: W('L14', 'may') - 0.6, sys: 'my', items: [[blk('my', 'CREATE TABLE sinov (n integer);'), W('L14', 'may') - 0.6], [blk('my', "INSERT INTO sinov VALUES ('abc');"), W('L14', 'may') + 0.4]] },
    { from: W('L15', 'es-kyu-layt') - 0.6, sys: 'sl', items: [[blk('sl', 'CREATE TABLE sinov (n integer);'), W('L15', 'es-kyu-layt') - 0.6], [blk('sl', "INSERT INTO sinov VALUES ('abc');"), W('L15', 'es-kyu-layt') + 0.4], [blk('sl', 'SELECT n, typeof(n) FROM sinov;'), W('L15', 'qabul')]] },
    { from: W('L16', 'may') - 0.3, sys: 'my', wide: true, items: [[blk('my', 'SELECT @@sql_mode AS sql_mode;'), W('L16', 'may')]], hl: [{ match: 'STRICT_TRANS_TABLES', col: 'rgba(240,140,46,0.3)', from: W('L16', 'qatiy') }] },
    { from: W('L17', 'ensi') - 0.4, sys: 'my', wide: true, items: [[blk('my', "SET SESSION sql_mode = 'ANSI';"), W('L17', 'ensi') - 0.3], [blk('my', CONCAT, 1), W('L17', 'ikki') - 0.4], [blk('my', 'SELECT "salom";', 1), W('L17', 'qoshtirnoq') - 0.3]] },
  ];
  let SH = null;
  const scoreboard = {
    concat: [['pg', 'Salom, dunyo', 'ok', W('L3', 'kutilgandek')], ['my', '0  +  3 ogohlantirish', 'warn', W('L4', 'nol')], ['sl', 'Salom, dunyo', 'ok', W('L3', 'xuddi')]],
    tirnoq: [['pg', 'ERROR: ustun yo‘q', 'err', W('L7', 'xato')], ['my', 'salom (satr)', 'warn', W('L8', 'satr')], ['sl', 'ERROR (DQS=0)', 'err', W('L9', 'xato')], ['sl', 'dqs_dml on → salom', 'warn', W('L10', 'satr')]],
    tip: [['pg', 'ERROR: invalid input', 'err', W('L13', 'xato')], ['my', 'ERROR 1366', 'err', W('L14', 'xato')], ['sl', "qabul: 'abc' → text", 'warn', W('L15', 'qabul')]],
  };
  function drawBoard(key, t, x = 1290) {
    const rows = scoreboard[key];
    hand('Natijalar', x, 190, { size: 44, color: C.ink });
    rows.forEach(([sys, s, kind, at], i) => {
      const k = P(t, at, 0.5), y = 250 + i * 150;
      card(x, y, 560, 120, { a: k, seed: 500 + i, fill: kind === 'ok' ? '#effaf2' : kind === 'err' ? '#fff1ee' : '#fff8e6' });
      withA(k, () => {
        text(SYS[sys].name, x + 28, y + 38, { size: 28, weight: 700, color: SYS[sys].col });
        text(s, x + 28, y + 84, { size: 28, weight: 600, fam: MONO, color: kind === 'ok' ? C.green : kind === 'err' ? C.red : C.orange });
        if (kind === 'ok') check(x + 510, y + 60, k); else if (kind === 'err') cross(x + 510, y + 60, k, 0.7); else hand('⚠', x + 510, y + 64, { size: 50, align: 'center', color: C.orange });
      });
    });
  }
  function drawTerm(t, scFrom, scTo) {
    SH = SH || shots();
    const vis = SH.filter((s) => s.from >= scFrom && s.from < scTo);
    let cur = null, prev = null;
    vis.forEach((s, i) => { if (t >= s.from) { prev = cur; cur = s; } });
    if (!cur) return null;
    const draw = (s, a) => withA(a, () => {
      const g = s.wide ? WIDE : NARROW, cfg = SYS[s.sys];
      term(g.x, g.y, g.w, g.h, { title: cfg.title, prompt: cfg.prompt, t, size: s.wide ? 23 : 24, hl: s.hl, items: s.items.map(([b, at]) => (at < 0 ? { b, t: 0, typeDur: 0.01, outDur: 0.01 } : { b, t: at })) });
      // tizim belgisi
      ctx.save(); ctx.fillStyle = cfg.col; ctx.fillRect(g.x, g.y + 38, g.w, 4); ctx.restore();
    });
    const k = P(t, cur.from, 0.3);
    if (prev && k < 1) draw(prev, 1 - k);
    draw(cur, k);
    return cur;
  }

  function sIntro(t) {
    hand('1-bob · Dialektlar', 960, 300, { size: 64, align: 'center', p: P(t, 0.3, 1), color: C.soft });
    hand('Bitta so‘rov — uch xil javob', 960, 430, { size: 86, align: 'center', p: P(t, 0.8, 1.4), color: C.blue });
    marker(500, 470, 920 * eio(P(t, 2.2, 0.7)), 18, C.hl, 1);
    [['PostgreSQL', C.blue, 'postgres'], ['MySQL', C.orange, 'may'], ['SQLite', C.teal, 'es-kyu-laytda']].forEach(([n, col, w], i) => {
      const k = eback(P(t, W('L1', w), 0.5));
      withA(clamp(k), () => { card(420 + i * 400, 600, 320, 120, { seed: 520 + i }); hand(n, 580 + i * 400, 660, { size: 44, align: 'center', color: col }); });
    });
  }

  function sConcat(t) {
    const sc = TM.scenes.concat;
    heading('|| bilan satr ulash', t, L('L2').s - 0.4);
    withA(P(t, L('L2').s, 0.5) * (1 - P(t, W('L3', 'postgres') - 0.4, 0.4)), () => {
      codeCard(360, 380, 1200, ["'Salom, ' || 'dunyo'   →   'Salom, dunyo'"], { size: 40, typed: P(t, L('L2').s, 1.2) });
      hand('standart: || — satrlarni ulash', 960, 560, { size: 48, align: 'center', color: C.blue, p: P(t, W('L2', 'ulash'), 0.8) });
    });
    const cur = drawTerm(t, sc.s, sc.e);
    if (!cur || !cur.wide) withA(P(t, W('L3', 'postgres'), 0.5) * (1 - P(t, W('L5', 'ogohlantirishlarni') - 0.3, 0.3)), () => drawBoard('concat', t));
    withA(P(t, W('L5', 'konkat'), 0.5), () => sticky(1180, 760, 640, 130, "MySQL: CONCAT('Salom, ', 'dunyo')", '#c9f2cf', P(t, W('L5', 'konkat'), 0.5), -0.02));
    withA(P(t, W('L5', 'yoki'), 0.5) * (1 - P(t, W('L5', 'konkat'), 0.3)), () => sticky(1240, 760, 560, 120, 'MySQL’da || = OR (YOKI)', '#ffd9cf', 1, 0.02));
  }

  function sTirnoq(t) {
    const sc = TM.scenes.tirnoq;
    heading('Qo‘shtirnoq: nom yoki satr?', t, L('L6').s - 0.4);
    withA(P(t, L('L6').s, 0.5) * (1 - P(t, W('L7', 'postgres') - 0.4, 0.4)), () => {
      card(360, 330, 560, 260, { seed: 530 }); card(1000, 330, 560, 260, { seed: 531 });
      text("'salom'", 640, 420, { size: 64, weight: 800, fam: MONO, color: C.green, align: 'center' }); hand('satr', 640, 520, { size: 48, align: 'center', color: C.green, p: P(t, W('L6', 'satr'), 0.6) });
      text('"salom"', 1280, 420, { size: 64, weight: 800, fam: MONO, color: C.blue, align: 'center' }); hand('nom (identifikator)', 1280, 520, { size: 44, align: 'center', color: C.blue, p: P(t, W('L6', 'nomi'), 0.6) });
    });
    drawTerm(t, sc.s, sc.e);
    withA(P(t, W('L7', 'postgres'), 0.5) * (1 - P(t, W('L11', 'qoida') - 0.2, 0.4)), () => drawBoard('tirnoq', t));
    // PRAGMA compile_options dan haqiqiy parcha
    const kP = P(t, W('L9', 'di-kyu-es'), 0.5) * (1 - P(t, W('L10', 'di-bi-konfig') - 0.4, 0.4));
    withA(kP, () => {
      const lines = window.TTY.pragma.split('\n'), i = lines.findIndex((l) => l.includes('DQS=0'));
      term(420, 560, 760, 300, { title: 'sqlite3 — PRAGMA compile_options (parcha)', prompt: /^$/, t: 99, size: 24, items: [{ b: { cmd: '', out: ['…', ...lines.slice(i - 2, i + 3), '…'] }, t: 0, typeDur: 0.01, outDur: 0.01 }], hl: [{ match: 'DQS=0', col: 'rgba(60,200,120,0.3)', from: 0 }] });
    });
    withA(P(t, W('L10', 'xato'), 0.5) * (1 - P(t, W('L11', 'qoida') - 0.2, 0.4)), () => hand('SQLite hujjati: “misfeature”', 1290, 880, { size: 40, color: C.red }));
    const kR = P(t, W('L11', 'qoida'), 0.6);
    withA(kR, () => {
      ctx.fillStyle = 'rgba(251,247,238,0.92)'; ctx.fillRect(0, 140, 1920, 940);
      sticky(460, 380, 1000, 260, "satr — doim bitta tirnoq: 'salom'", '#c9f2cf', kR, -0.015);
      hand('uchala tizimda bir xil ishlaydi', 960, 720, { size: 48, align: 'center', color: C.green, p: P(t, W('L11', 'uchala'), 0.8) });
    });
  }

  function sTip(t) {
    const sc = TM.scenes.tip;
    heading('Ustun tipiga mos kelmaydigan qiymat', t, L('L12').s - 0.4);
    withA(P(t, L('L12').s, 0.5) * (1 - P(t, W('L13', 'postgres') - 0.6, 0.4)), () => codeCard(420, 380, 1080, ['CREATE TABLE sinov (n integer);', "INSERT INTO sinov VALUES ('abc');"], { size: 40, typed: P(t, L('L12').s, 1.4) }));
    drawTerm(t, sc.s, sc.e);
    withA(P(t, W('L13', 'postgres'), 0.5), () => drawBoard('tip', t));
    withA(P(t, W('L15', 'moslashuvchan'), 0.5), () => sticky(1290, 760, 560, 120, 'SQLite: flexible typing', '#ffe58a', P(t, W('L15', 'moslashuvchan'), 0.5), -0.02));
  }

  function sSqlmode(t) {
    const sc = TM.scenes.sqlmode;
    heading('MySQL: sql_mode', t, L('L16').s - 0.4);
    drawTerm(t, sc.s, sc.e);
    withA(P(t, W('L16', 'qatiy'), 0.5) * (1 - P(t, W('L17', 'ensi') - 0.4, 0.3)), () => sticky(1180, 720, 640, 130, 'STRICT_TRANS_TABLES — qat’iy rejim', '#ffe58a', 1, -0.02));
    withA(P(t, W('L17', 'ikki'), 0.5) * (1 - P(t, L('L18').s, 0.3)), () => sticky(1180, 720, 640, 150, 'ANSI: || ulaydi, "…" — nom', '#c9f2cf', 1, 0.02));
    const kW = P(t, W('L18', 'ehtiyot'), 0.6);
    withA(kW, () => {
      ctx.fillStyle = 'rgba(251,247,238,0.9)'; ctx.fillRect(0, 140, 1920, 940);
      sticky(380, 340, 1160, 300, '', '#ffd9cf', kW, -0.01);
      hand('Bitta so‘rov — rejimga qarab boshqa natija', 960, 440, { size: 50, align: 'center', color: C.red, p: P(t, W('L18', 'bitta'), 0.9) });
      hand('partitsiyalangan jadvallardan keyin', 960, 530, { size: 44, align: 'center', p: P(t, W('L18', 'partitsiyalangan'), 0.9) });
      hand('sql_mode’ni o‘zgartirmang', 960, 600, { size: 44, align: 'center', color: C.red, p: P(t, W('L18', 'ozgartirmaslikni'), 0.9) });
    });
  }

  function sXulosa(t) {
    hand('Tipik xatolar', 960, 160, { size: 60, align: 'center', p: P(t, L('L19').s - 0.3, 0.8) });
    const items = [
      ['ORDER BY siz tartibga tayanish', 'order', 'L19'], ['satrni "qo‘shtirnoq" bilan yozish', 'satrni', 'L19'], ['MySQL ogohlantirishlariga qaramaslik', 'may', 'L20'],
      ['SQLite noto‘g‘ri tipni ham qabul qiladi', 'es-kyu-layt', 'L20'], ['dialektni hujjatdan tekshirmaslik', 'har', 'L21'],
    ];
    items.forEach(([s, w, l], i) => {
      const k = P(t, W(l, w), 0.5), y = 270 + i * 120;
      withA(k, () => { cross(420, y, k, 0.8); hand(s, 470, y + 4, { size: 46, p: k }); });
    });
    withA(P(t, W('L21', 'rahmat'), 0.6), () => { ctx.fillStyle = 'rgba(251,247,238,0.94)'; ctx.fillRect(0, 0, 1920, 1080); hand('Rahmat!', 960, 470, { size: 140, align: 'center', color: C.blue }); hand('Batafsil — SQL qo‘llanmasi, 1-bob', 960, 620, { size: 44, align: 'center', color: C.soft }); });
  }

  const SCENES = { intro: sIntro, concat: sConcat, tirnoq: sTirnoq, tip: sTip, sqlmode: sSqlmode, xulosa: sXulosa };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    bg();
    for (const [name, fn] of Object.entries(SCENES)) {
      const sc = TM.scenes[name];
      if (t >= sc.s && t < sc.e) withA(Math.min(name === 'intro' ? 1 : P(t, sc.s, 0.5), 1 - P(t, sc.e - 0.5, 0.5)), () => fn(t));
    }
    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1920, 1080); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.DURATION = TM.end;
  window.renderPoster = () => {
    render(0.001); ctx.globalAlpha = 1; bg();
    hand('1-bob · Dialektlar', 110, 200, { size: 52, color: C.soft }); hand('Bitta so‘rov —', 110, 310, { size: 86, color: C.blue }); hand('uch xil javob', 110, 410, { size: 86, color: C.blue });
    [['PostgreSQL', 'Salom, dunyo', C.green], ['MySQL', '0  ⚠ 3 warnings', C.orange], ['SQLite', 'Salom, dunyo', C.green]].forEach(([n, r, col], i) => { card(1180, 560 + i * 150, 620, 120, { seed: 540 + i }); text(n, 1210, 600 + i * 150, { size: 28, weight: 700, color: SYS[['pg', 'my', 'sl'][i]].col }); text(r, 1210, 645 + i * 150, { size: 28, weight: 600, fam: MONO, color: col }); });
    text("SELECT 'Salom, ' || 'dunyo';", 110, 560, { size: 36, weight: 700, fam: MONO, color: C.ink });
  };
  if (location.hash === '#play') { const t0 = performance.now(); const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); }; document.fonts.ready.then(loop); } else render(0);
})();
