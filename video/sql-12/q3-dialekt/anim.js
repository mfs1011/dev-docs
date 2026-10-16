// SQL 12-bob 3-qism: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("12-bob: Dialektlar", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite Farqlari", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CREATE TABLE, DEFAULT va 6 Ta Amaliy Xavf", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'farqlari'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: Qavsli Ifodalar & INVISIBLE", 440, 580, C.red, kBadges, 22);
      pill("SQLite: rowid & randomblob", 960, 580, C.purple, kBadges, 22);
      pill("PostgreSQL: Standart & Tizim Ustunlari", 1480, 580, C.blue, kBadges, 22);
    });

    const kDesc = P(t, W('L1', 'tuzoqlarini'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Har bir ma'lumotlar bazasi CREATE TABLE va DEFAULT sintaksisida o'ziga xos talablarga ega:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("MySQL dagi majburiy qavslar, TEXT/BLOB cheklovlari va SQLite dagi rowid mexanizmi", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("tizimlararo migratsiyada eng ko'p xatolarga sabab bo'ladi. Keling, bularni amalda tahlil qilamiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. MYSQL EXPRESSION & TEXT/BLOB DEFAULTS
  function sMySQLExpr(t) {
    heading("MySQL: Qavsli Ifodalar va TEXT/BLOB DEFAULT Qoidasi", t, TM.scenes.mysql_expr.s);

    const kTerm = P(t, TM.scenes.mysql_expr.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "MySQL 9.7 CLI (Sintaksis Xatolari)",
        prompt: "mysql> ",
        lines: [
          "-- 1. Qavssiz dinamik ifoda yozamiz:",
          "CREATE TABLE xato1 (",
          "  d DATE DEFAULT CURRENT_DATE + INTERVAL 1 YEAR",
          ");",
          "ERROR 1064 (42000): You have an error in your SQL",
          "syntax; check manual near 'CURRENT_DATE + ...'",
          "",
          "-- To'g'ri usul: majburiy qavs ichiga olish:",
          "CREATE TABLE togri1 (",
          "  d DATE DEFAULT (CURRENT_DATE + INTERVAL 1 YEAR)",
          ");",
          "Query OK, 0 rows affected (0.01 sec)",
          "",
          "-- 2. TEXT ustuniga oddiy DEFAULT beramiz:",
          "CREATE TABLE xato2 (t TEXT DEFAULT 'abc');",
          "ERROR 1101 (42000): BLOB, TEXT, GEOMETRY or",
          "JSON column 't' can't have a default value",
          "",
          "-- To'g'ri usul: ifoda sifatida qavsda yozish:",
          "CREATE TABLE togri2 (t TEXT DEFAULT ('abc'));",
          "Query OK, 0 rows affected (0.01 sec)"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L2', 'qavs'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.red, p: k1 });
      hand("Hisoblanuvchi Ifodalarda Qavs Majburiy", 1000, 275, { size: 28, color: C.red, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("MySQL sintaksisining qat'iy talabi:", 1030, 355, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("• DEFAULT CURRENT_DATE + INTERVAL 1 YEAR -> ERROR 1064!", 1030, 395, { size: 18, fam: MONO, color: C.red, wrap: 720 });
      text("• To'g'ri: DEFAULT (CURRENT_DATE + INTERVAL 1 YEAR)", 1030, 435, { size: 18, fam: MONO, color: C.green, wrap: 720 });
      text("• Har qanday operator yoki funksiyali ifoda qavsga olinishi shart.", 1030, 480, { size: 19, color: C.ink, wrap: 720 });
    });

    const k2 = P(t, W('L3', 'yozilishi'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.blue, p: k2 });
      hand("TEXT, BLOB va JSON dagi DEFAULT", 1000, 655, { size: 28, color: C.blue, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("MySQL dagi tarixiy cheklov:", 1030, 735, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• TEXT DEFAULT 'abc' to'g'ridan-to'g'ri ERROR 1101 beradi!", 1030, 775, { size: 19, color: C.red, wrap: 720 });
      text("• MySQL 8.0.13 dan boshlab bu tiplarga faqat ifoda ruxsat etiladi.", 1030, 815, { size: 19, color: C.ink, wrap: 720 });
      text("• Shuning uchun oddiy satr ham: DEFAULT ('abc') deb yozilishi shart!", 1030, 860, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });
  }

  // 3. MYSQL INVISIBLE COLUMNS & LIKE
  function sMySQLFeatures(t) {
    heading("MySQL: INVISIBLE Ustunlar va Indekslarni Nusxalash", t, TM.scenes.mysql_features.s);

    const kTerm = P(t, TM.scenes.mysql_features.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "MySQL 9.7 CLI (INVISIBLE Ustunlar)",
        prompt: "mysql> ",
        lines: [
          "-- INVISIBLE ustun bilan jadval yaratamiz:",
          "CREATE TABLE mahsulotlar_my (",
          "    id INT PRIMARY KEY,",
          "    nom VARCHAR(50) NOT NULL,",
          "    izoh VARCHAR(100) INVISIBLE",
          ");",
          "INSERT INTO mahsulotlar_my VALUES (1, 'Non', 'Maxfiy');",
          "",
          "-- Yulduzcha bilan so'raymiz:",
          "SELECT * FROM mahsulotlar_my;",
          "+----+-----+",
          "| id | nom |",
          "+----+-----+",
          "|  1 | Non |",
          "+----+-----+",
          "-- 'izoh' ustuni SELECT * da ko'rinmadi!",
          "",
          "-- Nomi bilan murojaat qilamiz:",
          "SELECT id, izoh FROM mahsulotlar_my;",
          "+----+--------+",
          "| id | izoh   |",
          "+----+--------+",
          "|  1 | Maxfiy |",
          "+----+--------+"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L4', 'invizibl'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("Ko'rinmas Ustunlar (Invisible Columns)", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("Asosiy maqsad: Ilg'or orqaga moslik (Backward Compatibility):", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• Eski dastur 'SELECT *' qilib ustunlar soniga qat'iy tayansa,", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("  yangi ustun qo'shilganda eski ilova sinmaydi.", 1030, 435, { size: 19, color: C.ink, wrap: 720 });
      text("• Yangi ilovalar esa ustun nomini yozib bemalol ishlatadi.", 1030, 480, { size: 19, color: C.green, wrap: 720 });
    });

    const k2 = P(t, W('L5', 'avtomatik'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.green, p: k2 });
      hand("LIKE Buyrug'ida Indekslar Ko'chishi", 1000, 655, { size: 28, color: C.green, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("MySQL vs PostgreSQL LIKE farqi:", 1030, 735, { size: 21, weight: 700, color: C.green, wrap: 720 });
      text("• PostgreSQL da LIKE sukutda indekslarni ko'chirmaydi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• MySQL da esa: CREATE TABLE nusxa LIKE mahsulotlar;", 1030, 815, { size: 19, fam: MONO, color: C.ink, wrap: 720 });
      text("  PRIMARY KEY va barcha B-tree indekslar avtomatik nusxalanadi!", 1030, 855, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });
  }

  // 4. SQLITE ROWID AND DEFAULTS
  function sSQLiteDefaults(t) {
    heading("SQLite: rowid va randomblob DEFAULT Amaliyoti", t, TM.scenes.sqlite_defaults.s);

    const kTerm = P(t, TM.scenes.sqlite_defaults.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "SQLite 3.54.0 CLI (Terminal)",
        prompt: "sqlite> ",
        lines: [
          "-- SQLite da jadval yaratamiz:",
          "CREATE TABLE mahsulotlar (",
          "    id INTEGER,",
          "    nom TEXT,",
          "    narx NUMERIC DEFAULT 0,",
          "    kod BLOB DEFAULT (randomblob(8)),",
          "    yaratilgan TEXT DEFAULT CURRENT_TIMESTAMP",
          ");",
          "INSERT INTO mahsulotlar (id, nom)",
          "VALUES (1, 'Non'), (2, 'Sut');",
          "",
          "SELECT rowid, id, nom, hex(kod), yaratilgan",
          "FROM mahsulotlar;",
          "┌───────┬────┬─────┬──────────────────┬─────────────────────┐",
          "│ rowid │ id │ nom │ hex(kod)         │ yaratilgan          │",
          "├───────┼────┼─────┼──────────────────┼─────────────────────┤",
          "│     1 │  1 │ Non │ 9526A055E1713804 │ 2026-10-16 03:51:24 │",
          "│     2 │  2 │ Sut │ 5AE63E2A7D390957 │ 2026-10-16 03:51:24 │",
          "└───────┴────┴─────┴──────────────────┴─────────────────────┘"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L6', 'rou-ay-di'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.purple, p: k1 });
      hand("SQLite dagi Yashirin 'rowid'", 1000, 275, { size: 28, color: C.purple, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("Har bir qatordagi 64-bitli ichki kalit:", 1030, 355, { size: 21, weight: 700, color: C.purple, wrap: 720 });
      text("• Jadvalda PRIMARY KEY bo'lmasa ham SQLite rowid yaratadi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• Agar ustun 'INTEGER PRIMARY KEY' deb e'lon qilinsa, u rowid ga aylanadi.", 1030, 435, { size: 19, color: C.ink, wrap: 720 });
      text("• 'WITHOUT ROWID' kaliti bilan rowid ni butunlay o'chirish mumkin.", 1030, 480, { size: 19, color: C.soft, wrap: 720 });
    });

    const k2 = P(t, W('L6', 'yu-ti-si'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.blue, p: k2 });
      hand("randomblob va UTC Vaqti", 1000, 655, { size: 28, color: C.blue, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("SQLite DEFAULT xususiyatlari:", 1030, 735, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• randomblob(8): har bir qatorga yangi tasodifiy baytlar beradi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• CURRENT_TIMESTAMP: joriy UTC vaqtini matn ko'rinishida beradi.", 1030, 815, { size: 19, color: C.ink, wrap: 720 });
      text("• Barcha ifodalar SQLite da ham majburiy qavs ichida bo'lishi shart!", 1030, 860, { size: 19, weight: 700, color: C.red, wrap: 720 });
    });
  }

  // 5. 6 PITFALLS GRID
  function sPitfalls(t) {
    heading("Baza Dasturchilari Uchun 6 Ta Amaliy Tuzoq", t, TM.scenes.pitfalls.s);

    const k = P(t, TM.scenes.pitfalls.s + 0.3, 0.8);
    const grid = [
      { col: 140, row: 220, color: C.red, num: "1", title: "MySQL: Qavssiz DEFAULT Ifodasi", body: "Dinamik ifodalar qavssiz yozilsa ERROR 1064 beradi. Doimo DEFAULT (ifoda) deb yozing!" },
      { col: 1000, row: 220, color: C.blue, num: "2", title: "MySQL: TEXT / BLOB DEFAULT Qoidasi", body: "Bu tiplarga oddiy matn ham faqat ifoda ko'rinishida DEFAULT ('abc') sifatida beriladi (ERROR 1101)!" },
      { col: 140, row: 470, color: C.purple, num: "3", title: "SQLite: rowid ga Haddan Ortmaslik", body: "VACUUM yoki baza qayta ochilganda rowid o'zgarishi mumkin, doimo aniq PRIMARY KEY belgilang!" },
      { col: 1000, row: 470, color: C.green, num: "4", title: "PostgreSQL: ctid ni ID Qilmang", body: "ctid qator yangilanganda (UPDATE) o'zgaradi, uni hech qachon birlamchi kalit deb hisoblamang!" },
      { col: 140, row: 720, color: C.red, num: "5", title: "Barcha Bazalar: Dublikat Qatorlar", body: "PRIMARY KEY yoki UNIQUE bo'lmasa, baza mutlaqo bir xil qatorlarni qabul qilaveradi!" },
      { col: 1000, row: 720, color: C.purple, num: "6", title: "LIKE Nusxalashdagi Farqlar", body: "MySQL indekslarni avtomatik ko'chiradi, Postgres da esa INCLUDING INDEXES / INCLUDING ALL shart!" }
    ];

    withA(k, () => {
      grid.forEach((item, idx) => {
        const ki = P(t, TM.scenes.pitfalls.s + 0.3 + idx * 0.2, 0.5);
        withA(ki, () => {
          card(item.col, item.row, 780, 220, { fill: C.card, col: item.color, p: ki });
          pill(item.num, item.col + 40, item.row + 45, item.color, ki, 20);
          text(item.title, item.col + 80, item.row + 45, { size: 23, weight: 700, color: item.color, wrap: 660 });
          text(item.body, item.col + 30, item.row + 115, { size: 20, color: C.ink, wrap: 720 });
        });
      });
    });
  }

  // 6. XULOSA
  function sOutro(t) {
    heading("Xulosa: Tizimlar Bo'yicha Asosiy Tavsiyalar", t, TM.scenes.xulosa.s);

    const k = P(t, TM.scenes.xulosa.s + 0.3, 0.8);
    withA(k, () => {
      card(140, 220, 500, 560, { fill: C.card, col: C.blue, p: k });
      hand("PostgreSQL", 170, 280, { size: 30, color: C.blue, p: k });
      card(170, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Qat'iy SQL standarti va boy tizim ustunlari (ctid, xmin).", 190, 360, { size: 19, weight: 700, color: C.blue, wrap: 400 });
      text("• LIKE INCLUDING ALL bilan to'liq nusxa oling.", 190, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Kesh uchun UNLOGGED, seans uchun TEMP jadvallardan foydalaning.", 190, 500, { size: 18, color: C.ink, wrap: 400 });

      card(710, 220, 500, 560, { fill: C.card, col: C.red, p: k });
      hand("MySQL", 740, 280, { size: 30, color: C.red, p: k });
      card(740, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• DEFAULT ifodalarini doimo qavs ichiga oling.", 760, 360, { size: 19, weight: 700, color: C.red, wrap: 400 });
      text("• TEXT/BLOB ga sukut qiymatni ('abc') shaklida bering.", 760, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• INVISIBLE ustunlar bilan eski ilovalar mosligini saqlang.", 760, 500, { size: 18, color: C.ink, wrap: 400 });

      card(1280, 220, 500, 560, { fill: C.card, col: C.purple, p: k });
      hand("SQLite", 1310, 280, { size: 30, color: C.purple, p: k });
      card(1310, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• rowid avtomatik yaratiladi, ammo PRIMARY KEY tavsiya etiladi.", 1330, 360, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• randomblob va CURRENT_TIMESTAMP dan foydalaning.", 1330, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Barcha hisoblanuvchi ifodalarni qavsga oling.", 1330, 500, { size: 18, color: C.ink, wrap: 400 });

      const kBanner = P(t, W('L9', 'xususiyatlarini'), 0.6);
      withA(kBanner, () => {
        card(140, 810, 1640, 160, { fill: C.card, col: C.green, p: kBanner });
        text("Har uchala tizimning o‘ziga xos xususiyatlarini bilish ishonchli va ko‘chma arxitektura qurish poydevoridir.", 960, 895, { size: 26, weight: 700, align: 'center', color: C.green, wrap: 1560 });
      });
    });
  }

  function draw(t) {
    bg();
    const sc = TM.scenes;
    if (t < sc.mysql_expr.s) sIntro(t);
    else if (t < sc.mysql_features.s) sMySQLExpr(t);
    else if (t < sc.sqlite_defaults.s) sMySQLFeatures(t);
    else if (t < sc.pitfalls.s) sSQLiteDefaults(t);
    else if (t < sc.xulosa.s) sPitfalls(t);
    else sOutro(t);
  }

  function renderPoster() {
    bg();
    hand("12-bob: Dialektlar", 960, 160, { size: 48, align: 'center', p: 1, color: C.soft });
    hand("MySQL va SQLite Farqlari", 960, 245, { size: 74, align: 'center', p: 1, color: C.blue });
    hand("CREATE TABLE, DEFAULT va 6 Ta Amaliy Xavf", 960, 325, { size: 32, align: 'center', p: 1 });
    marker(400, 355, 1120, 14, C.hl, 1);

    pill("MySQL: Qavsli Ifodalar & INVISIBLE", 440, 430, C.red, 1, 22);
    pill("SQLite: rowid & randomblob", 960, 430, C.purple, 1, 22);
    pill("PostgreSQL: Standart & Tizim Ustunlari", 1480, 430, C.blue, 1, 22);

    const grid = [
      { col: 140, row: 490, color: C.red, num: "1", title: "MySQL: Qavssiz DEFAULT Ifodasi", body: "Dinamik ifodalar qavssiz yozilsa ERROR 1064 beradi. Doimo DEFAULT (ifoda) deb yozing!" },
      { col: 1000, row: 490, color: C.blue, num: "2", title: "MySQL: TEXT / BLOB DEFAULT Qoidasi", body: "Bu tiplarga oddiy matn ham faqat ifoda ko'rinishida DEFAULT ('abc') shaklida beriladi!" },
      { col: 140, row: 660, color: C.purple, num: "3", title: "SQLite: rowid O'zgaruvchanligi", body: "VACUUM da rowid o'zgarishi mumkin, doimo aniq PRIMARY KEY belgilang!" },
      { col: 1000, row: 660, color: C.green, num: "4", title: "PostgreSQL: ctid ni ID Qilmang", body: "ctid UPDATE da o'zgaradi, uni hech qachon birlamchi kalit deb hisoblamang!" },
      { col: 140, row: 830, color: C.red, num: "5", title: "Dublikat Qatorlar Xavfi", body: "PRIMARY KEY yoki UNIQUE bo'lmasa, baza bir xil qatorlarni qabul qilaveradi!" },
      { col: 1000, row: 830, color: C.purple, num: "6", title: "LIKE Nusxalashdagi Farqlar", body: "MySQL indekslarni avtomatik ko'chiradi, Postgres da INCLUDING INDEXES shart!" }
    ];
    grid.forEach((item) => {
      card(item.col, item.row, 780, 150, { fill: C.card, col: item.color, p: 1 });
      pill(item.num, item.col + 35, item.row + 38, item.color, 1, 18);
      text(item.title, item.col + 70, item.row + 38, { size: 21, weight: 700, color: item.color, wrap: 670 });
      text(item.body, item.col + 25, item.row + 90, { size: 18, color: C.ink, wrap: 730 });
    });
  }

  window.render = draw;
  window.renderFrame = draw;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;
})();
