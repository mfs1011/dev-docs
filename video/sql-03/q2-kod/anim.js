// SQL 3-bob 2-qism: Kod — CLI mijozlar (psql, mysql, sqlite3)
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("3-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Kod: CLI Mijozlar", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("psql · mysql · sqlite3", 960, 510, { size: 64, align: 'center', p: P(t, 1.2, 1.2) });
    marker(560, 550, 800 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'pi-es-kyu-el'), 0.8);
    withA(kBadges, () => {
      pill("psql (PostgreSQL 18.6)", 600, 680, C.blue, kBadges, 26);
      pill("mysql (MySQL 9.7.2)", 960, 680, C.orange, kBadges, 26);
      pill("sqlite3 (SQLite 3.54.0)", 1320, 680, C.teal, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'si-el-ay'), 0.8);
    withA(kDesc, () => {
      card(420, 780, 1080, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Parametrlar, URI satrlari, .pgpass va option fayllar", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Eng muhim meta-buyruqlar: \\dt, \\d, \\x, status, \\G, .tables, .schema", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. PSQL: PARAMETRLAR, URI VA .PGPASS
  function sPsqlConn(t) {
    heading("psql: Ulanish va Xavfsizlik", t, L('L2').s - 0.4);

    const kParams = P(t, W('L2', 'host'), 0.5);
    withA(kParams, () => {
      card(140, 240, 780, 360, { fill: C.card, col: C.blue, p: kParams });
      hand("Parametrlar bilan ulanish", 180, 290, { size: 36, color: C.blue, p: kParams });
      text("-h localhost  →  Server manzili", 180, 350, { size: 23, fam: MONO });
      text("-p 5432       →  Server porti", 180, 395, { size: 23, fam: MONO });
      text("-U postgres   →  Foydalanuvchi", 180, 440, { size: 23, fam: MONO });
      text("-d qollanma   →  Baza nomi", 180, 485, { size: 23, fam: MONO });
      pill("-c 'SQL' : Bitta buyruqni bajarib chiqadi", 450, 545, C.blue, kParams, 20);
    });

    const kUri = P(t, W('L3', 'yu-ar-ay'), 0.5);
    withA(kUri, () => {
      card(960, 240, 820, 360, { fill: C.card, col: C.green, p: kUri });
      hand("URI ulanish satri (Ilovalar uchun)", 1000, 290, { size: 36, color: C.green, p: kUri });
      const uriStr = "postgresql://postgres@localhost:5432/qollanma";
      text(uriStr, 1000, 360, { size: 22, fam: MONO, weight: 700, color: C.ink });

      pill("?application_name=darslik", 1180, 430, C.green, kUri, 22);
      text("Serverda pg_stat_activity da ko'rinadi!", 1000, 490, { size: 24, weight: 600, color: C.green });
      text("Bitta bazaga ko'p servis ulanganda monitoring uchun juda qulay.", 1000, 530, { size: 22, color: C.soft });
    });

    // .pgpass
    const kPass = P(t, W('L4', 'nuqta'), 0.5);
    withA(kPass, () => {
      card(140, 630, 1640, 320, { fill: '#fffdf8', col: C.orange, p: kPass });
      hand("Parolni xavfsiz saqlash: ~/.pgpass fayli", 180, 685, { size: 36, color: C.orange, p: kPass });

      text("PGPASSWORD tavsiya etilmaydi (ps orqali ko'rinadi). Buning o'rniga fayl formati:", 180, 740, { size: 23, color: C.soft });
      text("hostname:port:database:username:password", 180, 785, { size: 24, fam: MONO, weight: 700, color: C.ink });
      text("Masalan: localhost:5432:qollanma:talaba:Maxfiy-2026", 180, 825, { size: 22, fam: MONO, color: C.soft });

      const kChmod = P(t, W('L4', 'ch-mod'), 0.5);
      withA(kChmod, () => {
        pill("QAT'IY TALAB: chmod 600 ~/.pgpass", 420, 890, C.red, kChmod, 22);
        text("Fayl boshqalarga ochiq bo'lsa, PostgreSQL uni e'tiborsiz qoldiradi va xato beradi!", 780, 890, { size: 23, weight: 700, color: C.red });
      });
    });
  }

  // 3. PSQL: META-BUYRUQLAR
  function sPsqlMeta(t) {
    heading("psql Meta-buyruqlari (Teskari chiziq \\)", t, L('L5').s - 0.4);

    const kMeta = P(t, W('L5', 'meta-buyruq'), 0.5);
    withA(kMeta, () => {
      card(140, 240, 680, 480, { fill: C.card, col: C.blue, p: kMeta });
      hand("Asosiy meta-buyruqlar", 180, 290, { size: 36, color: C.blue, p: kMeta });

      const cmds = [
        ["\\l", "Bazalar ro'yxati"],
        ["\\c baza", "Boshqa bazaga ulanish"],
        ["\\dt", "Jadvallar ro'yxati"],
        ["\\d jadval", "Jadval tuzilmasi, tiplar, indekslar"],
        ["\\x", "Natijani vertikal (expanded) chiqarish"],
        ["\\conninfo", "Joriy ulanish haqida ma'lumot"],
        ["\\h BUYRUQ", "SQL sintaksisi bo'yicha yordam"],
        ["\\q", "Chiqish"]
      ];

      cmds.forEach(([c, d], idx) => {
        const y = 350 + idx * 42;
        text(c, 180, y, { size: 22, fam: MONO, weight: 700, color: C.blue });
        text(`— ${d}`, 330, y, { size: 21, color: C.soft });
      });
    });

    // O'ngda: Haqiqiy terminal (TTY.pg.dt va TTY.pg.expanded)
    const kDt = P(t, W('L6', 'de-te'), 0.5);
    withA(kDt, () => {
      const bDt = { cmd: "qollanma=# \\dt", out: (TTY.pg?.dt?.out || "List of tables\npublic | talabalar | table | postgres").split('\n') };
      const bX = { cmd: "qollanma=# \\x", out: ["Expanded display is on."] };
      const bSel = { cmd: "qollanma=# SELECT * FROM talabalar WHERE id = 1;", out: (TTY.pg?.expanded?.out || "-[ RECORD 1 ]\nid   | 1\nism  | Ali\nkurs | 2").split('\n') };

      const relT = Math.max(0, t - W('L6', 'de-te'));
      term(860, 240, 920, 480, {
        title: "psql (PostgreSQL 18.6) — Meta-buyruqlar",
        prompt: /^qollanma=[#>] /,
        items: [
          { b: bDt, t: 0, typeDur: 0.8 },
          { b: bX, t: 3.2, typeDur: 0.6 },
          { b: bSel, t: 5.2, typeDur: 1.0 }
        ],
        t: relT,
        size: 21
      });
    });

    // Superuser prompt
    const kPrompt = P(t, W('L7', 'superuser'), 0.5);
    withA(kPrompt, () => {
      card(140, 750, 1640, 170, { fill: C.card, col: C.purple, p: kPrompt });
      hand("Taklif belgisi siri:", 180, 800, { size: 32, color: C.purple, p: kPrompt });

      pill("=#", 300, 860, C.red, kPrompt, 24);
      text("Superuser (postgres) — ruxsat cheklovlarisiz ishlaydi", 360, 860, { size: 23, weight: 600, color: C.red });

      pill("=>", 1020, 860, C.green, kPrompt, 24);
      text("Oddiy foydalanuvchi — xavfsiz huquqlar bilan ishlaydi", 1080, 860, { size: 23, weight: 600, color: C.green });
    });
  }

  // 4. MYSQL CLI
  function sMysqlCli(t) {
    heading("mysql: CLI va Option Fayli", t, L('L8').s - 0.4);

    const kMyP = P(t, W('L8', 'katta'), 0.5);
    withA(kMyP, () => {
      card(140, 240, 680, 360, { fill: C.card, col: C.orange, p: kMyP });
      hand("Bayroqlar bilan ulanish", 180, 290, { size: 36, color: C.orange, p: kMyP });
      text("-h 127.0.0.1  →  Server manzili", 180, 350, { size: 23, fam: MONO });
      text("-P 3307       →  PORT (Katta harf!)", 180, 395, { size: 23, fam: MONO, weight: 700, color: C.red });
      text("-u talaba     →  Foydalanuvchi", 180, 440, { size: 23, fam: MONO });
      text("-pParol       →  Parol (Kichik harf!)", 180, 485, { size: 23, fam: MONO, color: C.orange });
      pill("Eslatma: -p va parol orasida probel bo'lmasligi kerak", 400, 545, C.orange, kMyP, 20);
    });

    // Option fayl
    const kOpt = P(t, W('L9', 'option'), 0.5);
    withA(kOpt, () => {
      card(860, 240, 920, 360, { fill: C.card, col: C.blue, p: kOpt });
      hand("Option fayli (talaba.cnf)", 900, 290, { size: 36, color: C.blue, p: kOpt });
      text("[client]", 900, 350, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("user=talaba\npassword=Maxfiy-2026\nhost=127.0.0.1\nport=3307", 900, 410, { size: 22, fam: MONO, color: C.ink });

      pill("chmod 600 talaba.cnf", 1100, 545, C.green, kOpt, 22);
      text("mysql --defaults-extra-file=talaba.cnf qollanma", 900, 500, { size: 21, fam: MONO, color: C.soft });
    });

    // Terminal: status va --commands
    const kTerm = P(t, W('L10', 'status'), 0.5);
    withA(kTerm, () => {
      const bStat = { cmd: "mysql> status", out: ["Connection:    127.0.0.1 via TCP/IP", "TCP port:      3307", "Server ver:    9.7.2 Homebrew"] };
      const bCmd = { cmd: "mysql> SELECT 'Salom' AS xabar, 2 + 2 AS natija\\G", out: ["*************************** 1. row ***************************", " xabar: Salom", "natija: 4"] };

      const relT = Math.max(0, t - W('L10', 'status'));
      term(140, 630, 1640, 320, {
        title: "mysql (MySQL 9.7.2) — status va --commands \\G",
        prompt: /^mysql> /,
        items: [
          { b: bStat, t: 0, typeDur: 0.8 },
          { b: bCmd, t: 3.5, typeDur: 1.2 }
        ],
        t: relT,
        size: 21
      });
    });
  }

  // 5. SQLITE CLI
  function sSqliteCli(t) {
    heading("sqlite3: Qobiq va Dot-commands", t, L('L12').s - 0.4);

    const kMem = P(t, W('L12', 'xotiradagi'), 0.5);
    withA(kMem, () => {
      card(140, 240, 680, 320, { fill: '#fff2f0', col: C.red, p: kMem });
      pill("XAVFLI TUZOQ", 260, 290, C.red, kMem, 22);
      text("Faylsiz ishga tushirish: $ sqlite3", 180, 350, { size: 24, fam: MONO, weight: 700, color: C.red });
      text("• Xotiradagi (in-memory) vaqtinchalik baza ochiladi", 180, 400, { size: 22, color: C.ink });
      text("• Dastur yopilgach, barcha kiritilgan ma'lumotlar yo'qoladi!", 180, 445, { size: 22, weight: 700, color: C.red });
      pill("To'g'ri yo'l: sqlite3 dokon.db", 380, 505, C.green, kMem, 22);
    });

    const kCmds = P(t, W('L13', 'teyblz'), 0.5);
    withA(kCmds, () => {
      card(860, 240, 920, 320, { fill: C.card, col: C.teal, p: kCmds });
      hand("Nuqta bilan boshlanuvchi buyruqlar", 900, 290, { size: 36, color: C.teal, p: kCmds });
      text(".tables           →  Jadvallar ro'yxati", 900, 350, { size: 22, fam: MONO });
      text(".schema jadval    →  Jadval CREATE so'rovi", 900, 395, { size: 22, fam: MONO });
      text(".mode box         →  Chiroyli ramkali jadval", 900, 440, { size: 22, fam: MONO });
      text(".mode csv         →  CSV formatida chiqarish", 900, 485, { size: 22, fam: MONO });
      text(".quit             →  Chiqish", 900, 530, { size: 22, fam: MONO });
    });

    // Terminal: sqlite box va ;->
    const kSqlTerm = P(t, W('L14', 'nuqtali'), 0.5);
    withA(kSqlTerm, () => {
      const bTab = { cmd: "SQLite-3.54 dokon.db-> .tables", out: ["mahsulotlar"] };
      const bBox = { cmd: "SQLite-3.54 dokon.db-> SELECT * FROM mahsulotlar;", out: (TTY.sqlite?.box?.out || "╭────┬─────┬───────╮\n│ id │ nom │ narx  │\n╞════╪═════╪═══════╡\n│  1 │ Non │  4000 │\n│  2 │ Sut │ 12000 │\n╰────┴─────┴───────╯").split('\n') };
      const bMulti = { cmd: "SQLite-3.54 dokon.db-> SELECT nom FROM mahsulotlar;", out: ["Non", "Sut"] };

      const relT = Math.max(0, t - W('L14', 'nuqtali'));
      term(140, 590, 1640, 360, {
        title: "sqlite3 (SQLite 3.54.0) — Real Terminal",
        prompt: /^SQLite-3\.54 dokon\.db-> /,
        items: [
          { b: bTab, t: 0, typeDur: 0.8 },
          { b: bBox, t: 2.8, typeDur: 1.0 },
          { b: bMulti, t: 6.0, typeDur: 1.0 }
        ],
        t: relT,
        size: 21
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: CLI Mijozlar", t, L('L15').s - 0.4);

    const kX = P(t, W('L15', 'uchala'), 0.6);
    withA(kX, () => {
      card(260, 240, 1400, 500, { fill: C.card, col: C.blue, p: kX });
      hand("Ushbu qismda ko'rib chiqdik:", 310, 300, { size: 40, color: C.blue, p: kX });

      const points = [
        ["psql", "Parametrlar, URI satri, application_name, .pgpass (chmod 600) va \\dt, \\d, \\x.", C.blue],
        ["Prompt belgilari", "=# belgisi superuser, => belgisi oddiy foydalanuvchini bildiradi.", C.purple],
        ["mysql", "Katta -P port, kichik -p parol, option fayllar (talaba.cnf) va status buyrug'i.", C.orange],
        ["MySQL 9.7 --commands", "Skriptlarda \\G va status ishlashi uchun --commands qo'shilishi shart.", C.red],
        ["sqlite3", "Doim fayl bilan oching (dokon.db). .tables, .schema va .mode box buyruqlari.", C.teal]
      ];

      points.forEach(([tit, desc, col], idx) => {
        const kPt = P(t, W('L15', 'uchala') + 0.3 + idx * 0.5, 0.5);
        withA(kPt, () => {
          const y = 370 + idx * 68;
          pill(tit, 450, y, col, kPt, 22);
          text(`— ${desc}`, 590, y, { size: 23, color: C.ink });
        });
      });
    });

    const kNext = P(t, W('L16', 'keyingi'), 0.6);
    withA(kNext, () => {
      card(260, 770, 1400, 180, { fill: '#f0f7ff', col: C.blue, p: kNext });
      hand("Keyingi qismda (03-3): Dialektlar va Xatolar", 310, 825, { size: 36, color: C.blue, p: kNext });
      text("Uch tizimning ulanish dialektlarini batafsil taqqoslaymiz", 310, 880, { size: 24, weight: 600, color: C.ink });
      text("va amaliyotdagi eng ko'p uchraydigan 6 ta real ulanish xatosini tahlil qilamiz!", 310, 920, { size: 23, color: C.soft });
    });
  }

  function render(time) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    const t = Math.max(0, time);
    const s = TM.scenes;

    if (t < s.psql_conn.s) sIntro(t);
    else if (t < s.psql_meta.s) sPsqlConn(t);
    else if (t < s.mysql_cli.s) sPsqlMeta(t);
    else if (t < s.sqlite_cli.s) sMysqlCli(t);
    else if (t < s.xulosa.s) sSqliteCli(t);
    else sXulosa(t);
  }

  function renderPoster() {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    hand("3-bob", 960, 150, { size: 50, align: 'center', p: 1, color: C.soft });
    hand("Kod: CLI Mijozlar", 960, 240, { size: 80, align: 'center', p: 1, color: C.blue });
    hand("2-qism: psql · mysql · sqlite3", 960, 320, { size: 50, align: 'center', p: 1 });

    card(140, 390, 520, 380, { fill: C.card, col: C.blue, p: 1 });
    hand("psql (PostgreSQL)", 180, 450, { size: 32, color: C.blue, p: 1 });
    text("• -h, -p, -U, -d, -c", 180, 510, { size: 22, fam: MONO });
    text("• postgresql:// URI satri", 180, 550, { size: 22, fam: MONO });
    text("• .pgpass fayli (chmod 600)", 180, 590, { size: 22, fam: MONO });
    text("• \\dt, \\d, \\x, \\conninfo", 180, 630, { size: 22, fam: MONO, color: C.green });
    pill("=# superuser | => oddiy", 400, 710, C.purple, 1, 20);

    card(700, 390, 520, 380, { fill: C.card, col: C.orange, p: 1 });
    hand("mysql (MySQL)", 740, 450, { size: 32, color: C.orange, p: 1 });
    text("• -h, -P (port), -u, -p", 740, 510, { size: 22, fam: MONO });
    text("• Option fayli: talaba.cnf", 740, 550, { size: 22, fam: MONO });
    text("• status (TCP vs UNIX socket)", 740, 590, { size: 22, fam: MONO });
    text("• 9.7 da --commands va \\G", 740, 630, { size: 22, fam: MONO, color: C.red });
    pill("Option fayli: chmod 600", 960, 710, C.orange, 1, 20);

    card(1260, 390, 520, 380, { fill: C.card, col: C.teal, p: 1 });
    hand("sqlite3 (SQLite)", 1300, 450, { size: 32, color: C.teal, p: 1 });
    text("• sqlite3 dokon.db", 1300, 510, { size: 22, fam: MONO });
    text("• Faylsiz = Xotiradagi baza!", 1300, 550, { size: 22, fam: MONO, color: C.red });
    text("• .tables, .schema", 1300, 590, { size: 22, fam: MONO });
    text("• .mode box va .mode csv", 1300, 630, { size: 22, fam: MONO, color: C.teal });
    pill("Taklif: ;-> davom ettirish", 1520, 710, C.teal, 1, 20);

    card(140, 810, 1640, 190, { fill: '#f0f7ff', col: C.blue, p: 1 });
    hand("Haqiqiy CLI tajribasi:", 180, 865, { size: 34, color: C.blue, p: 1 });
    text("PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 sinov muhitida yozib olingan haqiqiy chiqishlar.", 180, 925, { size: 24, color: C.ink });
    text("Parollarni hech qachon buyruq satrida yozmang — doim .pgpass yoki option fayllaridan foydalaning!", 180, 965, { size: 24, weight: 600, color: C.red });
  }

  window.render = render;
  window.renderPoster = renderPoster;
})();
