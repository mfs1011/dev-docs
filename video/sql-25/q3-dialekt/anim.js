// SQL 25-bob 3-qism: "Dialektlar" — MySQL va SQLite da JOIN Farqlari
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
    hand("25-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da JOIN Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("FULL JOIN yo'qligi, UNION yechimi, vergul ustuvorligi va LATERAL", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g1', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• To'liq standart SQL sintaksisi", 170, 560, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• FULL JOIN to'liq mavjud", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• ON siz INNER JOIN xato beradi", 170, 655, { size: 19, color: C.blue, fam: UI });
      text("• JOIN verguldan oldin bajariladi", 170, 700, { size: 19, color: C.soft, fam: UI });
      text("• LATERAL subquery to'liq bor", 170, 745, { size: 19, color: C.green, fam: UI });
      text("• Barqaror va qat'iy tekshiruv", 170, 790, { size: 18, color: C.soft, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• FULL JOIN UMUMAN YO'Q!", 710, 560, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• FULL so'zi jadval tahlusi bo'ladi", 710, 610, { size: 19, color: C.red, fam: UI });
      text("• Yechim: LEFT va RIGHT UNION", 710, 655, { size: 19, color: C.green, fam: UI });
      text("• ON siz ham qabul qiladi (Dekart)", 710, 700, { size: 19, color: C.orange, fam: UI });
      text("• LATERAL qo'llab-quvvatlanadi", 710, 745, { size: 19, color: C.green, fam: UI });
      text("• RIGHT o'rniga LEFT tavsiya qilinadi", 710, 790, { size: 18, color: C.soft, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• RIGHT va FULL JOIN bor", 1290, 560, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• CROSS JOIN optimizator buyrug'i", 1290, 610, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("• Tartibni o'zgartirishni taqiqlaydi", 1290, 655, { size: 19, color: C.soft, fam: UI });
      text("• Barcha JOIN teng ustuvorlikda", 1290, 700, { size: 19, color: C.blue, fam: UI });
      text("• LATERAL subquery YO'Q", 1290, 745, { size: 19, color: C.red, fam: UI });
      text("• Erkin va ochiq sintaksis", 1290, 790, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL XUSUSIYATLARI
  function sMysqlXususiyatlari(t) {
    heading("MySQL: FULL JOIN Yo'qligi va Shartsiz Birlashtirish", t, TM.scenes.mysql_xususiyatlari.s);

    const k1 = P(t, W('g2', 'kross'), 0.5);
    withA(k1, () => {
      // Left: ON siz JOIN
      card(100, 210, 840, 780, { fill: C.card, col: C.orange, p: k1 });
      pill("ON siz JOIN = Dekart Ko'paytma", 520, 260, C.orange, k1, 20);

      card(140, 310, 760, 150, { fill: '#fffdfa', col: C.orange, p: k1 });
      text("SELECT count(*) FROM t1 JOIN t2;", 170, 360, { size: 20, weight: 700, color: C.orange, fam: MONO });
      text("-- Standartda xato! Lekin MySQL da ruxsat:", 170, 405, { size: 17, color: C.soft, fam: MONO });

      term(140, 490, 760, 180, [
        "+----------+",
        "| count(*) |",
        "+----------+",
        "|        9 |",
        "+----------+"
      ], { title: "mysql 9.7 (ON siz JOIN)" });

      text("• MySQL da JOIN, CROSS JOIN, INNER JOIN teng!", 140, 710, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("• Agar ON shartini unutib qoldirsangiz, xato bermaydi,", 140, 755, { size: 18, color: C.ink, fam: UI });
      text("  balki jimgina N x M ta qator qaytarib yuboradi!", 140, 795, { size: 18, color: C.red, fam: UI });
    });

    const k2 = P(t, W('g3', 'full'), 0.5);
    withA(k2, () => {
      // Right: FULL JOIN trap and UNION workaround
      card(980, 210, 840, 780, { fill: C.card, col: C.green, p: k2 });
      pill("FULL JOIN Tuzog'i va UNION Yechimi", 1400, 260, C.green, k2, 20);

      card(1020, 305, 760, 150, { fill: '#fff1f2', col: C.red, p: k2 });
      text("SELECT * FROM t1 FULL JOIN t2 ON ...", 1050, 345, { size: 18, color: C.red, fam: MONO });
      text("ERROR 1054: Unknown column 't1.num' in 'on clause'", 1050, 385, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("Chunki 't1 AS FULL' deb o'qiladi (zahiralangan so'z emas!)", 1050, 420, { size: 16, color: C.soft, fam: UI });

      card(1020, 475, 760, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("-- To'g'ri yechim: LEFT + RIGHT va UNION:", 1050, 510, { size: 17, color: C.soft, fam: MONO });
      text("SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num", 1050, 545, { size: 17, color: C.ink, fam: MONO });
      text("UNION", 1050, 580, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num;", 1050, 615, { size: 17, color: C.ink, fam: MONO });

      term(1020, 655, 760, 290, [
        "+------+------+------+-------+",
        "| num  | name | num  | value |",
        "+------+------+------+-------+",
        "|    1 | a    |    1 | xxx   |",
        "|    2 | b    | NULL | NULL  |",
        "|    3 | c    |    3 | yyy   |",
        "| NULL | NULL |    5 | zzz   |",
        "+------+------+------+-------+"
      ], { title: "mysql 9.7 (UNION yechimi — 4 qator)" });
    });
  }

  // 3. SQLITE XUSUSIYATLARI
  function sSqliteXususiyatlari(t) {
    heading("SQLite: FULL JOIN va CROSS JOIN Optimizatori", t, TM.scenes.sqlite_xususiyatlari.s);

    const k1 = P(t, W('g5', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      // Left: SQLite FULL JOIN
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("SQLite da RIGHT va FULL JOIN Bor!", 520, 260, C.purple, k1, 20);

      card(140, 310, 760, 130, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT * FROM t1", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("FULL JOIN t2 ON t1.num = t2.num;", 170, 390, { size: 20, weight: 700, color: C.purple, fam: MONO });

      term(140, 465, 760, 340, [
        "╭─────┬──────┬─────┬───────╮",
        "│ num │ name │ num │ value │",
        "╞═════╪══════╪═════╪═══════╡",
        "│     │      │   5 │ zzz   │",
        "│   1 │ a    │   1 │ xxx   │",
        "│   2 │ b    │     │       │",
        "│   3 │ c    │   3 │ yyy   │",
        "╰─────┴──────┴─────┴───────╯"
      ], { title: "sqlite3 3.54 (FULL JOIN native)" });

      text("• SQLite zamonaviy versiyalarida FULL JOIN to'liq ishlaydi", 140, 840, { size: 18, color: C.ink, fam: UI });
      text("• NULL eng kichik bo'lgani uchun 5 qatori 1-o'rinda chiqadi!", 140, 880, { size: 18, weight: 700, color: C.purple, fam: UI });
    });

    const k2 = P(t, W('g6', 'kross'), 0.5);
    withA(k2, () => {
      // Right: CROSS JOIN special optimizer control
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("CROSS JOIN: Optimizator Buyrug'i", 1400, 260, C.blue, k2, 20);

      card(1020, 310, 760, 160, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("SELECT * FROM tableA CROSS JOIN tableB;", 1050, 360, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("Optimizatorga qat'iy ko'rsatma beradi:", 1050, 415, { size: 18, color: C.ink, fam: UI });

      text("Maxsus qoida:", 1020, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. Oddiy holatda SQLite optimizatori jadvallar tartibini", 1020, 555, { size: 19, color: C.ink, fam: UI });
      text("   eng tez bajariladigan qilib o'zgartirishi mumkin.", 1020, 595, { size: 18, color: C.soft, fam: UI });
      text("2. Lekin CROSS JOIN yozilsa, optimizatorga", 1020, 645, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("   tartibni o'zgartirish QAT'IYAN TAQIQLANADI!", 1020, 685, { size: 19, weight: 700, color: C.red, fam: UI });
      text("3. tableA har doim birinchi, tableB ikkinchi o'qiladi.", 1020, 735, { size: 18, color: C.soft, fam: UI });
      text("4. Bu so'rov rejasini qo'lda boshqarish qurolidir.", 1020, 785, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 4. VERGUL VA LATERAL
  function sVergulVaLateral(t) {
    heading("Vergul Ustuvorligi va LATERAL Qo'llab-quvvatlashi", t, TM.scenes.vergul_va_lateral.s);

    const k1 = P(t, W('g7', 'vergul'), 0.5);
    withA(k1, () => {
      // Left: Comma precedence
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("Vergul va JOIN Ustuvorligi", 520, 260, C.red, k1, 20);

      card(140, 310, 760, 130, { fill: '#fff', col: C.red, p: k1 });
      text("SELECT * FROM t1, t2 JOIN t2 AS t3", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("ON t1.num = t3.num;", 170, 390, { size: 19, weight: 700, color: C.red, fam: MONO });

      card(140, 465, 760, 170, { fill: '#fff1f2', col: C.red, p: k1 });
      text("PostgreSQL va MySQL:", 170, 505, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• JOIN verguldan oldin bajariladi!", 170, 545, { size: 18, color: C.ink, fam: UI });
      text("• Xato: Unknown column 't1.num' (t1 hali ko'rinmaydi)", 170, 585, { size: 17, color: C.soft, fam: MONO });

      card(140, 660, 760, 160, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("SQLite da esa:", 170, 700, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• Barcha birlashtirishlar chapdan o'ngga teng ishlaydi", 170, 740, { size: 18, color: C.ink, fam: UI });
      text("• Yuqoridagi so'rov SQLite da xatosiz ishlaydi!", 170, 780, { size: 18, weight: 700, color: C.green, fam: UI });

      text("Tavsiya: Hech qachon vergul bilan JOIN ni aralashtirmang!", 140, 860, { size: 18, weight: 700, color: C.orange, fam: UI });
    });

    const k2 = P(t, W('g8', 'lateral'), 0.5);
    withA(k2, () => {
      // Right: LATERAL support
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("LATERAL Subqueries Qo'llanishi", 1400, 260, C.blue, k2, 20);

      card(1020, 310, 760, 200, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("PostgreSQL 18 va MySQL 9.7+", 1050, 350, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• LEFT JOIN LATERAL (...) AS t ON true", 1050, 395, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("• Har bir guruh uchun eng yuqori N ta elementni", 1050, 440, { size: 18, color: C.ink, fam: UI });
      text("  hisoblash uchun ajoyib qulaylik!", 1050, 475, { size: 18, color: C.ink, fam: UI });

      card(1020, 535, 760, 200, { fill: '#fff1f2', col: C.red, p: k2 });
      text("SQLite da LATERAL:", 1050, 575, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Sintaksisda umuman mavjud emas (Parse error)", 1050, 620, { size: 18, color: C.red, fam: UI });
      text("• 'Har bir guruhdan TOP N' masalasi SQLite da", 1050, 665, { size: 18, color: C.ink, fam: UI });
      text("  Window funksiyalari (ROW_NUMBER) bilan yechiladi!", 1050, 705, { size: 18, weight: 700, color: C.purple, fam: UI });

      text("Tizimlararo portativlikda buni doim hisobga oling!", 1020, 775, { size: 19, weight: 700, color: C.orange, fam: UI });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa: JOIN Turlarining Qiyosiy Jadvali", t, TM.scenes.xulosa.s);

    const k = P(t, W('g9', 'xavfsiz'), 0.5);
    withA(k, () => {
      card(140, 210, 1640, 780, { fill: C.card, col: C.blue, p: k });
      pill("Yakuniy Qiyosiy Matritsa", 960, 260, C.blue, k, 22);

      // Table comparison
      card(190, 310, 1540, 470, { fill: '#fff', col: C.pencil, p: k });
      text("Xususiyat / Amaliyot            | PostgreSQL 18      | MySQL 9.7          | SQLite 3.54", 220, 360, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("--------------------------------+--------------------+--------------------+-------------------", 220, 395, { size: 19, color: C.pencil, fam: MONO });
      text("FULL OUTER JOIN                 | Bor                | YO'Q (UNION kerak) | Bor", 220, 440, { size: 19, color: C.ink, fam: MONO });
      text("ON siz oddiy JOIN               | Xato (sintaktik)   | Bor (Dekart 9 ta)  | Bor (Dekart 9 ta)", 220, 490, { size: 19, color: C.ink, fam: MONO });
      text("NATURAL va USING                | Bor                | Bor                | Bor", 220, 540, { size: 19, color: C.ink, fam: MONO });
      text("CROSS JOIN ning ma'nosi         | Oddiy Dekart       | Oddiy Dekart       | Optimizator buyrug'i", 220, 590, { size: 19, color: C.ink, fam: MONO });
      text("JOIN verguldan oldin bajariladi | Ha (Standart)      | Ha                 | Yo'q (chapdan o'ngga)", 220, 640, { size: 19, color: C.ink, fam: MONO });
      text("LATERAL Subqueries              | Bor                | Bor                | YO'Q (Window funksiya)", 220, 690, { size: 19, color: C.ink, fam: MONO });

      marker(190, 810, 1540 * eio(k), 16, C.hl, 1);
      text("25-bob bo'yicha barcha tushunchalar va amaliyotlar yakunlandi!", 960, 860, { size: 26, weight: 700, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.mysql_xususiyatlari.s) {
      sIntro(t);
    } else if (t < TM.scenes.sqlite_xususiyatlari.s) {
      sMysqlXususiyatlari(t);
    } else if (t < TM.scenes.vergul_va_lateral.s) {
      sSqliteXususiyatlari(t);
    } else if (t < TM.scenes.xulosa.s) {
      sVergulVaLateral(t);
    } else {
      sXulosa(t);
    }
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.mysql_xususiyatlari.s + 3.0);
  };
})();
