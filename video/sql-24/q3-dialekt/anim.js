// SQL 24-bob 3-qism: "Dialektlar" — MySQL va SQLite da Saralash Farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("24-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Saralash Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("NULL teskariligi, IS NULL ifodasi, LIMIT m, n va FETCH yo'qligi", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 380, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• NULL har doim eng KATTA", 170, 560, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• ASC da NULL oxirida", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• DESC da NULL boshida!", 170, 655, { size: 19, color: C.red, fam: UI });
      text("• NULLS FIRST / LAST bor", 170, 700, { size: 19, color: C.green, fam: UI });
      text("• FETCH FIRST va WITH TIES bor", 170, 745, { size: 19, color: C.blue, fam: UI });
      text("• LIMIT m, n sintaksisi YO'Q", 170, 790, { size: 18, color: C.soft, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• NULL har doim eng KICHIK (Aksi!)", 710, 560, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• ASC da NULL boshida chiqadi", 710, 610, { size: 19, color: C.red, fam: UI });
      text("• DESC da NULL oxirida chiqadi", 710, 655, { size: 19, color: C.green, fam: UI });
      text("• NULLS FIRST / LAST YO'Q!", 710, 700, { size: 19, color: C.red, fam: UI });
      text("• LIMIT m, n (offset, count) bor", 710, 745, { size: 19, color: C.soft, fam: UI });
      text("• FETCH FIRST / WITH TIES YO'Q", 710, 790, { size: 18, color: C.red, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• NULL saralashda eng KICHIK", 1290, 560, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• ASC da NULL boshida chiqadi", 1290, 610, { size: 19, color: C.red, fam: UI });
      text("• NULLS FIRST / LAST qo'llaydi", 1290, 655, { size: 19, color: C.green, fam: UI });
      text("• LIMIT m, n sintaksisi bor", 1290, 700, { size: 19, color: C.soft, fam: UI });
      text("• LIMIT -1 (cheksiz) qabul qiladi", 1290, 745, { size: 19, color: C.purple, fam: UI });
      text("• FETCH FIRST / WITH TIES YO'Q", 1290, 790, { size: 18, color: C.red, fam: UI });
    });
  }

  // 2. MYSQL NULLS ORDER
  function sMysqlNullsOrder(t) {
    heading("MySQL: NULL Eng Kichik va IS NULL Usuli", t, TM.scenes.mysql_nulls_order.s);

    const k1 = P(t, W('L2', 'kichik'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("PostgreSQL ga Butunlay Teskari!", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 150, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- MySQL da oddiy ORDER BY ball (ASC):", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT ism, ball FROM t2 ORDER BY ball;", 170, 385, { size: 19, color: C.ink, fam: MONO });
      text("--> Sobir (NULL) ENG BOSHIDA chiqadi!", 170, 420, { size: 20, weight: 700, color: C.red, fam: MONO });

      card(140, 490, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("MySQL da NULLS LAST ishlatib ko'rsak:", 170, 530, { size: 18, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST;", 170, 565, { size: 19, color: C.red, fam: MONO });
      text("--> ERROR 1064 (42000): Syntax error near 'NULLS LAST'", 170, 605, { size: 17, weight: 700, color: C.red, fam: MONO });

      card(140, 675, 760, 190, { fill: '#fff', col: C.green, p: k1 });
      pill("MySQL Yechimi: IS NULL Ifodasi", 520, 710, C.green, k1, 18);
      text("SELECT ism, ball FROM t2", 170, 755, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball IS NULL, ball DESC;", 170, 795, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("ball IS NULL: agar NULL bo'lsa 1, aks holda 0 bo'ladi!", 170, 835, { size: 16, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'iz'), 0.5);
    withA(k2, () => {
      const termOut = [
        "mysql> SELECT ism, ball FROM t2 ORDER BY ball;",
        "+---------+------+",
        "| ism     | ball |",
        "+---------+------+",
        "| Sobir   | NULL | <-- MySQL da NULL eng kichik!",
        "| Malika  |   78 |",
        "| Ali     |   85 |",
        "| Jasur   |   85 |",
        "| Vali    |   92 |",
        "| Dilnoza |   92 |",
        "+---------+------+",
        "",
        "mysql> SELECT ism, ball FROM t2 ORDER BY ball IS NULL, ball DESC;",
        "+---------+------+",
        "| ism     | ball |",
        "+---------+------+",
        "| Vali    |   92 |",
        "| Dilnoza |   92 |",
        "| Ali     |   85 |",
        "| Jasur   |   85 |",
        "| Malika  |   78 |",
        "| Sobir   | NULL | <-- Sobir oxiriga tushdi!",
        "+---------+------+"
      ];
      term(980, 210, 840, 780, "MySQL 9.7.2 Terminali (Amaliy ijro)", [{
        b: {
          cmd: "mysql -u dev -p qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 23 });
    });
  }

  // 3. MYSQL LIMIT SYNTAX
  function sMysqlLimitSyntax(t) {
    heading("MySQL: LIMIT m, n Tuzog'i va FETCH Yo'qligi", t, TM.scenes.mysql_limit_syntax.s);

    const k1 = P(t, W('L3', 'limit'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("1. LIMIT m, n Tuzog'i", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT ism, ball FROM t2", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC LIMIT 2, 2;", 170, 390, { size: 21, weight: 700, color: C.red, fam: MONO });
      text("-- Dasturchi buni '2 ta qator, 2-dan boshlab' deb o'qiydi.", 170, 430, { size: 16, color: C.soft, fam: MONO });

      text("DIQQAT: LIMIT m, n da birinchi son OFFSET dir!", 140, 505, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• m = 2 (OFFSET: dastlabki 2 ta qatorni o'tkazib yubor)", 140, 550, { size: 18, color: C.soft, fam: MONO });
      text("• n = 2 (COUNT: ko'pi bilan 2 ta qator qaytar)", 140, 585, { size: 18, color: C.soft, fam: MONO });
      text("• Boshlang'ich qatorning ofseti 0 dir, 1 emas!", 140, 625, { size: 18, color: C.ink, fam: UI });

      card(140, 675, 760, 190, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("Tavsiya: Chalkashlikdan qochish uchun:", 170, 715, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("LIMIT 2 OFFSET 2 deb yozing!", 170, 755, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("Bu barcha bazalarda bir xil o'qiladi va xato qildirmaydi.", 170, 800, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L3', 'fech'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.purple, p: k2 });
      pill("2. Standart FETCH FIRST Yo'q", 1400, 260, C.purple, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k2 });
      text("SELECT ism, ball FROM t2", 1050, 350, { size: 18, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC FETCH FIRST 2 ROWS ONLY;", 1050, 385, { size: 18, color: C.red, fam: MONO });
      text("--> ERROR 1064 (42000): near 'FETCH FIRST 2 ROWS ONLY'", 1050, 425, { size: 17, weight: 700, color: C.red, fam: MONO });

      card(1020, 500, 760, 310, { fill: '#fff', col: C.green, p: k2 });
      text("MySQL Terminal Natijasi (LIMIT 2, 2):", 1050, 540, { size: 19, weight: 700, color: C.green, fam: UI });
      text("+-------+------+", 1050, 580, { size: 17, color: C.soft, fam: MONO });
      text("| ism   | ball |", 1050, 610, { size: 17, color: C.ink, fam: MONO });
      text("+-------+------+", 1050, 640, { size: 17, color: C.soft, fam: MONO });
      text("| Ali   |   85 |  <-- 3-qator (ofset 2 dan boshlab)", 1050, 670, { size: 17, color: C.green, fam: MONO });
      text("| Jasur |   85 |  <-- 4-qator", 1050, 700, { size: 17, color: C.green, fam: MONO });
      text("+-------+------+", 1050, 730, { size: 17, color: C.soft, fam: MONO });
      text("2 rows in set (0.00 sec)", 1050, 765, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 4. SQLITE NULLS & LIMIT
  function sSqliteNullsLimit(t) {
    heading("SQLite: NULLS LAST va Manfiy LIMIT Xususiyati", t, TM.scenes.sqlite_nulls_limit.s);

    const k1 = P(t, W('L4', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("SQLite da NULL va NULLS LAST", 520, 260, C.purple, k1, 20);

      text("SQLite da NULL munosabati:", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• MySQL kabi, SQLite ham NULL ni eng kichik deb biladi.", 140, 365, { size: 18, color: C.soft, fam: UI });
      text("• Ammo MySQL dan farqli ravishda, SQLite da:", 140, 405, { size: 18, color: C.purple, fam: UI });

      card(140, 445, 760, 150, { fill: '#f5f3ff', col: C.purple, p: k1 });
      text("SELECT ism, ball FROM t2", 170, 485, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS FIRST LIMIT 3;", 170, 520, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("--> NULLS FIRST va NULLS LAST to'liq ishlaydi! ✅", 170, 555, { size: 17, color: C.green, fam: UI });

      card(140, 625, 760, 230, { fill: '#fff', col: C.purple, p: k1 });
      pill("Kutilmagan Qulaylik: Manfiy LIMIT", 520, 660, C.purple, k1, 18);
      text("sqlite> SELECT * FROM t2 LIMIT -1 OFFSET 2;", 170, 710, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("• LIMIT manfiy son (-1) bo'lsa:", 170, 755, { size: 18, color: C.ink, fam: UI });
      text("  '2-qatordan boshlab OXIRIGACHA barcha qatorlarni ol!'", 170, 790, { size: 18, color: C.purple, fam: UI });
      text("• Qatorlar soniga chegara qo'yilmaydi.", 170, 825, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'last'), 0.5);
    withA(k2, () => {
      const termOut = [
        "sqlite> SELECT ism, ball FROM t2 ORDER BY ball;",
        "╭─────────┬──────╮",
        "│   ism   │ ball │",
        "╞═════════╪══════╡",
        "│ Sobir   │      │ <-- SQLite da ham NULL boshida!",
        "│ Malika  │   78 │",
        "│ Ali     |   85 │",
        "│ Jasur   │   85 │",
        "│ Vali    │   92 │",
        "│ Dilnoza │   92 │",
        "╰─────────┴──────╯",
        "",
        "sqlite> SELECT ism, ball FROM t2",
        "   ...> ORDER BY ball DESC NULLS FIRST LIMIT 3;",
        "╭─────────┬──────╮",
        "│   ism   │ ball │",
        "╞═════════╪══════╡",
        "│ Sobir   │      │",
        "│ Vali    │   92 │",
        "│ Dilnoza │   92 │",
        "╰─────────┴──────╯"
      ];
      term(980, 210, 840, 780, "SQLite 3.54.0 Terminali (Real natijalar)", [{
        b: {
          cmd: "sqlite3 dokondb",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 23 });
    });
  }

  // 5. COMPARISON MATRIX
  function sComparisonMatrix(t) {
    heading("Sahifalash va Ofset Qoidalari: Barqaror Tizim", t, TM.scenes.comparison_matrix.s);

    const k1 = P(t, W('L5', 'Barcha'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("1. Noldan Boshlanuvchi Ofset", 520, 260, C.blue, k1, 20);

      text("Barcha relyatsion bazalarda umumiy qoida:", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Ofset har doim 0 dan boshlanadi (1 emas!).", 140, 365, { size: 19, weight: 700, color: C.blue, fam: UI });

      card(140, 415, 760, 200, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("Sahifa raqamidan ofset hisoblash formulasi:", 170, 455, { size: 19, color: C.ink, fam: UI });
      text("const offset = (pageNumber - 1) * pageSize;", 170, 500, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("1-sahifa (page 1): (1 - 1) * 10 = OFFSET 0", 170, 545, { size: 18, color: C.soft, fam: MONO });
      text("2-sahifa (page 2): (2 - 1) * 10 = OFFSET 10", 170, 580, { size: 18, color: C.soft, fam: MONO });

      card(140, 645, 760, 210, { fill: '#fff', col: C.green, p: k1 });
      pill("Doimo Takrorlanmas Ustun", 520, 680, C.green, k1, 18);
      text("ORDER BY ustun DESC, id ASC", 170, 730, { size: 21, weight: 700, color: C.green, fam: MONO });
      text("Agar ikkinchi ustun (id) qo'yilmasa, bir xil qiymatli", 170, 775, { size: 18, color: C.ink, fam: UI });
      text("qatorlar sahifalar orasida o'z joyini almashtirib turadi.", 170, 810, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'mustahkamlanishi'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("2. Unumdorlik: Katta OFFSET dan Qochish", 1400, 260, C.purple, k2, 20);

      text("OFFSET qanday ishlaydi?", 1020, 320, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1020, 365, 760, 180, { fill: '#fff1f2', col: C.red, p: k2 });
      text("SELECT * FROM xodimlar", 1050, 405, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY id LIMIT 20 OFFSET 1000000; -- 1 million!", 1050, 440, { size: 19, weight: 700, color: C.red, fam: MONO });
      text("Server 1,000,020 ta qatorni o'qiydi va 1 milliontasini tashlaydi!", 1050, 485, { size: 17, color: C.red, fam: UI });

      card(1020, 575, 760, 220, { fill: '#f0fdf4', col: C.green, p: k2 });
      pill("Yechim: Keyset Pagination (Cursor)", 1400, 610, C.green, k2, 18);
      text("SELECT * FROM xodimlar", 1050, 655, { size: 19, color: C.ink, fam: MONO });
      text("WHERE id > :oxirgi_ko_rilgan_id", 1050, 690, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("ORDER BY id LIMIT 20;", 1050, 725, { size: 19, color: C.green, fam: MONO });
      text("Indeks orqali to'g'ridan-to'g'ri kerakli joyga sakraydi! (0.1 ms)", 1050, 765, { size: 16, color: C.green, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Relyatsion Bazalarda Saralash Qiyosiy Jadvali", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Doimo'), 0.5);
    withA(k1, () => {
      // Comparison Table
      const x0 = 120, y0 = 210, w = 1680, h = 480;
      card(x0, y0, w, h, { fill: C.card, col: C.blue, p: k1 });

      const cols = [
        { title: "Xususiyat / Qoida", x: 160, w: 460 },
        { title: "PostgreSQL 18", x: 640, w: 340 },
        { title: "MySQL 9", x: 1010, w: 340 },
        { title: "SQLite 3", x: 1380, w: 380 }
      ];

      ctx.save();
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x0 + 10, y0 + 10, w - 20, 60);
      ctx.restore();

      cols.forEach(c => {
        text(c.title, c.x, y0 + 48, { size: 22, weight: 700, color: C.ink, fam: UI });
      });

      const rows = [
        ["NULL qiymati saralashda", "Eng KATTA (+cheksiz)", "Eng KICHIK (-cheksiz)", "Eng KICHIK (-cheksiz)"],
        ["NULLS FIRST / LAST", "✅ Standart qo'llab-quvvatlaydi", "❌ Yo'q (ORDER BY x IS NULL)", "✅ Qo'llab-quvvatlaydi"],
        ["LIMIT n OFFSET m", "✅ Ha", "✅ Ha", "✅ Ha"],
        ["LIMIT m, n (offset, limit)", "❌ Yo'q (faqat LIMIT..OFFSET)", "✅ Mavjud (m=offset)", "✅ Mavjud (m=offset)"],
        ["FETCH FIRST .. ONLY", "✅ Standart mavjud", "❌ Yo'q", "❌ Yo'q"],
        ["WITH TIES (teng ballilar)", "✅ Mavjud (adolatli tanlash)", "❌ Yo'q (window kerak)", "❌ Yo'q"]
      ];

      rows.forEach((r, idx) => {
        const ry = y0 + 120 + idx * 56;
        sline(x0 + 20, ry - 18, x0 + w - 20, ry - 18, { col: C.rule, p: k1 });
        text(r[0], cols[0].x, ry + 10, { size: 19, weight: 700, color: C.ink, fam: UI });
        text(r[1], cols[1].x, ry + 10, { size: 18, color: r[1].startsWith('✅') ? C.green : (r[1].startsWith('❌') ? C.red : C.ink), fam: UI });
        text(r[2], cols[2].x, ry + 10, { size: 18, color: r[2].startsWith('✅') ? C.green : (r[2].startsWith('❌') ? C.red : C.ink), fam: UI });
        text(r[3], cols[3].x, ry + 10, { size: 18, color: r[3].startsWith('✅') ? C.purple : (r[3].startsWith('❌') ? C.red : C.ink), fam: UI });
      });
    });

    const k2 = P(t, W('L6', 'ta’minlaydi'), 0.5);
    withA(k2, () => {
      card(120, 720, 1680, 270, { fill: '#f8fafc', col: C.green, p: k2 });
      pill("UCHTA OLTIN QOIDA", 960, 765, C.green, k2, 22);

      card(160, 810, 500, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("1. NULL Tartibini Biling", 190, 850, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("Postgres da NULL eng katta,", 190, 890, { size: 17, color: C.soft, fam: UI });
      text("MySQL va SQLite da eng kichik!", 190, 920, { size: 17, color: C.soft, fam: UI });

      card(710, 810, 500, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. LIMIT OFFSET yozing", 740, 850, { size: 20, weight: 700, color: C.green, fam: UI });
      text("LIMIT m, n tuzog'iga tushmaslik", 740, 890, { size: 17, color: C.soft, fam: UI });
      text("uchun doim ochiq OFFSET yozing.", 740, 920, { size: 17, color: C.soft, fam: UI });

      card(1260, 810, 500, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("3. Har Doim Deterministik Qiling", 1290, 850, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("Sahifalashda so'rov oxiriga", 1290, 890, { size: 17, color: C.soft, fam: UI });
      text("doimo takrorlanmas ustun (id) qo'shing.", 1290, 920, { size: 17, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_nulls_order.s) sIntro(t);
    else if (t < S.mysql_limit_syntax.s) sMysqlNullsOrder(t);
    else if (t < S.sqlite_nulls_limit.s) sMysqlLimitSyntax(t);
    else if (t < S.comparison_matrix.s) sSqliteNullsLimit(t);
    else if (t < S.xulosa.s) sComparisonMatrix(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.mysql_nulls_order.s + 3.0);
  };
})();
