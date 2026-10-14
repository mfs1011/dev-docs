// SQL 2-bob, 2-video: Kod — chapda haqiqiy psql, mysql va sqlite terminallari, o'ngda daftar tushuntiradi.
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, arrow, marker, card, heading, table, RH, HH, rowCenter, kf, sticky, check, cross, bg, tw, MONO, blocks, term } = K;

  const PG = blocks(window.TTY.pg, /^qollanma=# /);
  const MY = blocks(window.TTY.my, /^mysql> /);
  const SL = blocks(window.TTY.sqlite, /^\$ /);

  const TT = { x: 70, y: 150, w: 1060, h: 780 };
  const typeDur = (b) => Math.min(2.4, 0.4 + b.cmd.length * 0.03);
  const outAt = (it) => it.t + (it.typeDur ?? typeDur(it.b)) + 0.15;

  function sIntro(t) {
    hand('2-bob · Kod', 960, 320, { size: 70, align: 'center', p: P(t, 0.3, 1), color: C.soft });
    hand('Jarayonlar, threadlar va SQLite fayli', 960, 450, { size: 80, align: 'center', p: P(t, 0.7, 1.4), color: C.blue });
    marker(450, 490, 1020 * eio(P(t, 1.8, 0.7)), 18, C.hl, 1);
    withA(P(t, W('L1', 'haqiqiy'), 0.6), () => {
      text('PostgreSQL 18.6 · MySQL 9.7.2 · SQLite 3.54.0', 960, 600, { size: 34, weight: 600, fam: MONO, color: C.green, align: 'center' });
      text('Haqiqiy terminallar, haqiqiy chiqishlar', 960, 660, { size: 28, fam: MONO, color: C.soft, align: 'center' });
    });
  }

  function sPostgres(t) {
    heading('PostgreSQL: jarayonlar (pg_stat_activity)', t, L('L2').s - 0.4);
    const bSel = PG.find((b) => b.cmd.includes('pg_stat_activity'));
    const items = [{ b: bSel, t: W('L3', 'koramiz') - 0.4 }];
    const tOut = outAt(items[0]);
    term(TT.x, TT.y, TT.w, TT.h, {
      title: 'psql — PostgreSQL 18.6 · pg_stat_activity',
      prompt: /^qollanma=# /,
      items, t, size: 22,
      hl: [
        { match: 'pg_sleep', col: 'rgba(255, 214, 10, 0.28)', from: tOut + 0.3 },
        { match: 'ORDER BY pid', col: 'rgba(80, 150, 255, 0.25)', from: tOut + 0.3 }
      ]
    });

    const x = 1200, y = 220;
    // ps daraxti
    const kTree = P(t, L('L2').s, 0.8);
    withA(kTree, () => {
      card(x, y, 650, 320, { seed: 101 });
      hand('Operatsion tizim jarayonlari (ps)', x + 30, y + 45, { size: 32, color: C.blue });
      text('PID   PPID  COMMAND', x + 30, y + 95, { size: 22, weight: 700, fam: MONO, color: C.soft });
      text('44311     1  postgres (bosh jarayon)', x + 30, y + 140, { size: 22, fam: MONO });
      text('├── 51798  postgres: mijoz 1 (sleep)', x + 30, y + 185, { size: 22, weight: 600, fam: MONO, color: C.green });
      text('├── 51799  postgres: mijoz 2 (sleep)', x + 30, y + 230, { size: 22, weight: 600, fam: MONO, color: C.green });
      text('└── 51879  postgres: joriy seans', x + 30, y + 275, { size: 22, fam: MONO, color: C.purple });
    });

    // Har bir ulanishga PID
    const kPID = P(t, W('L4', 'har'), 0.8);
    withA(kPID, () => {
      card(x, y + 360, 650, 220, { seed: 102, fill: '#f1f8f3' });
      hand('Har ulanishga yangi PID', x + 30, y + 410, { size: 36, color: C.green });
      text('Har bir mijoz uchun alohida OS jarayoni.', x + 30, y + 465, { size: 24 });
      text('Uchinchi qator — so‘rov yuborgan mijozning o‘zi.', x + 30, y + 510, { size: 24, color: C.soft });
      check(x + 580, y + 410, 1);
    });
  }

  function sMysql(t) {
    heading('MySQL: bitta jarayon, threadlar va engine', t, L('L5').s - 0.4);
    const bPl = MY.find((b) => b.cmd.includes('PROCESSLIST'));
    const bTh = MY.find((b) => b.cmd.includes('threads'));
    const bEng = MY.find((b) => b.cmd.includes('ENGINES'));
    const items = [
      { b: bPl, t: W('L6', 'proses-list') - 0.4 },
      { b: bTh, t: W('L7', 'performans') - 0.4 },
      { b: bEng, t: W('L8', 'storidj') - 0.4 }
    ];
    term(TT.x, TT.y, TT.w, TT.h, {
      title: 'mysql — MySQL 9.7.2 · information_schema & performance_schema',
      prompt: /^mysql> /,
      items, t, size: 20,
      hl: [
        { match: 'thread/sql/one_connection', col: 'rgba(80, 150, 255, 0.3)', from: outAt(items[1]) + 0.3 },
        { match: 'InnoDB', col: 'rgba(60, 200, 120, 0.3)', from: outAt(items[2]) + 0.3 }
      ]
    });

    const x = 1200, y = 200;
    // Bitta jarayon (mysqld)
    const kProc = P(t, L('L5').s, 0.8);
    withA(kProc, () => {
      card(x, y, 650, 180, { seed: 201 });
      hand('Faqat 1 ta server jarayoni (ps)', x + 30, y + 40, { size: 30, color: C.orange });
      text('PID   PPID  COMMAND', x + 30, y + 85, { size: 22, weight: 700, fam: MONO, color: C.soft });
      text('44433     1  mysqld (bitta ko‘p oqimli)', x + 30, y + 130, { size: 22, weight: 700, fam: MONO, color: C.orange });
    });

    // one_connection
    const kOne = P(t, W('L7', 'van'), 0.8);
    withA(kOne, () => {
      card(x, y + 210, 650, 190, { seed: 202 });
      hand('one_connection: bitta ulanish = bitta thread', x + 30, y + 250, { size: 28, color: C.blue });
      text('Ulanishlar jarayon ichidagi oqimlar orqali.', x + 30, y + 300, { size: 24 });
      text('Yangi operatsion tizim jarayoni ochilmaydi.', x + 30, y + 340, { size: 24, color: C.soft });
    });

    // InnoDB tranzaksiyalar
    const kInno = P(t, W('L9', 'inno-di-bi'), 0.8);
    withA(kInno, () => {
      card(x, y + 430, 650, 220, { seed: 203, fill: '#f1f8f3' });
      hand('InnoDB — TRANSACTIONS = YES', x + 30, y + 475, { size: 32, color: C.green });
      check(x + 580, y + 475, 1);
      text('Faqat InnoDB tranzaksiyalarni (ACID) qo‘llaydi!', x + 30, y + 530, { size: 23, weight: 700, fam: MONO });
      text('MyISAM, MEMORY, CSV — tranzaksiyasiz.', x + 30, y + 575, { size: 23, fam: MONO, color: C.red });
    });
  }

  function sSqlite(t) {
    heading('SQLite: bitta fayl (sqlite3, ls, od, cp)', t, L('L10').s - 0.4);
    const bTbl = SL.find((b) => b.cmd.includes('CREATE TABLE'));
    const bIns = SL.find((b) => b.cmd.includes('INSERT INTO'));
    const bSel = SL.find((b) => b.cmd === '$ sqlite3 dokon.db "SELECT * FROM mahsulotlar;"');
    const bLs = SL.find((b) => b.cmd.startsWith('$ ls -l'));
    const bHead = SL.find((b) => b.cmd.startsWith('$ head'));
    const bCp = SL.find((b) => b.cmd.startsWith('$ cp'));
    const bCnt = SL.find((b) => b.cmd.includes('count(*)'));

    const items = [
      { b: bTbl, t: W('L10', 'es-kyu-layt') - 0.2 },
      { b: bIns, t: W('L11', 'ikkita') - 0.3 },
      { b: bSel, t: W('L11', 'selekt') - 0.2 },
      { b: bLs, t: W('L12', 'fayli') - 0.3 },
      { b: bHead, t: W('L12', 'birinchi') - 0.3 },
      { b: bCp, t: W('L14', 'se-pe') - 0.4 },
      { b: bCnt, t: W('L14', 'nusxa') }
    ];

    term(TT.x, TT.y, TT.w, TT.h, {
      title: 'bash — SQLite 3.54.0 · bitta fayl bilan ishlash',
      prompt: /^\$ /,
      items, t, size: 20,
      hl: [
        { match: 'SQLite format 3', col: 'rgba(60, 200, 120, 0.35)', from: outAt(items[4]) + 0.3 },
        { match: 'dokon.db', col: 'rgba(80, 150, 255, 0.25)', from: outAt(items[3]) + 0.3 }
      ]
    });

    const x = 1200, y = 200;
    // Bitta fayl kartasi
    const kF = P(t, L('L12').s, 0.8);
    withA(kF, () => {
      card(x, y, 650, 220, { seed: 301 });
      hand('Katalogdagi bitta fayl', x + 30, y + 45, { size: 34, color: C.teal });
      text('dokon.db — 8192 bayt (8 KB)', x + 30, y + 105, { size: 28, weight: 700, fam: MONO, color: C.blue });
      text('Baza server talab qilmaydi, oddiy fayl!', x + 30, y + 160, { size: 24, color: C.soft });
    });

    // 16 bayt format
    const k16 = P(t, L('L13').s, 0.8);
    withA(k16, () => {
      card(x, y + 250, 650, 220, { seed: 302, fill: '#f1f8f3' });
      hand('16 bayt: SQLite format 3\\0', x + 30, y + 295, { size: 32, color: C.green });
      check(x + 580, y + 295, 1);
      text('Rasmiy SQLite fayl imzosi (magic bytes).', x + 30, y + 350, { size: 24 });
      text('Har bir haqiqiy SQLite fayli shu bilan boshlanadi.', x + 30, y + 395, { size: 24, color: C.soft });
    });

    // cp bilan nusxa
    const kCp = P(t, L('L14').s, 0.8);
    withA(kCp, () => {
      card(x, y + 500, 650, 190, { seed: 303 });
      hand('cp dokon.db nusxa.db', x + 30, y + 545, { size: 30, color: C.purple });
      text('Zaxiralash yoki ko‘chirish uchun oddiy nusxa!', x + 30, y + 595, { size: 24 });
      text('Natija count(*): 2 ta qator nusxada ham mavjud.', x + 30, y + 635, { size: 24, color: C.soft });
    });
  }

  function sXulosa(t) {
    heading('Xulosa', t, L('L15').s - 0.4);
    const x = 200, y = 320;
    const cards = [
      ['PostgreSQL', 'Jarayonlar (fork)', 'Har ulanishga yangi OS jarayoni (PID) · pg_stat_activity', C.blue],
      ['MySQL', 'Threadlar (mysqld)', 'Bitta jarayon ichida threadlar · InnoDB engine', C.orange],
      ['SQLite', 'Bitta fayl', 'Kutubxona · dokon.db bitta fayl · SQLite format 3\\0', C.teal],
    ];
    cards.forEach(([name, mode, desc, col], i) => {
      const k = P(t, L('L15').s + i * 0.4, 0.6);
      withA(k, () => {
        card(x + i * 520, y, 480, 380, { seed: 401 + i });
        text(name, x + 240 + i * 520, y + 60, { size: 38, weight: 700, fam: MONO, align: 'center', color: col });
        hand(mode, x + 240 + i * 520, y + 130, { size: 32, align: 'center', color: col });
        text(desc.split(' · ')[0], x + 240 + i * 520, y + 210, { size: 22, fam: MONO, align: 'center' });
        text(desc.split(' · ')[1], x + 240 + i * 520, y + 260, { size: 22, fam: MONO, align: 'center', color: C.soft });
      });
    });
  }

  window.render = function (t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    const sc = TM.scenes;
    if (t < sc.postgres.s) sIntro(t);
    else if (t < sc.mysql.s) sPostgres(t);
    else if (t < sc.sqlite.s) sMysql(t);
    else if (t < sc.xulosa.s) sSqlite(t);
    else sXulosa(t);
  };

  window.renderPoster = () => {
    ctx.globalAlpha = 1; bg();
    hand('2-bob · Kod', 330, 310, { size: 56, color: C.soft });
    hand('Jarayonlar, threadlar va SQLite fayli', 330, 430, { size: 80, color: C.blue });
    hand('psql · mysqld · sqlite3 terminallari', 330, 540, { size: 56 });
    text('PostgreSQL (PID) · MySQL (threadlar) · SQLite (bitta fayl)', 330, 680, { size: 30, weight: 600, fam: MONO, color: C.green });
  };
  window.DURATION = TM.end;
})();
