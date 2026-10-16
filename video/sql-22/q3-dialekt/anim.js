// SQL 22-bob 3-qism: "Dialektlar" — MySQL va SQLite da SELECT Farqlari
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
    hand("22-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da SELECT Farqlari", 960, 255, { size: 74, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Aliaslar ko'rinishi, HAVING imkoniyatlari va DUAL jadvali", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 380, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'farqlarga'), 0.8);
    withA(kCards, () => {
      // Postgres card
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• SQL standartiga qat'iy sodiq", 170, 560, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• WHERE va HAVING da alias yo'q", 170, 610, { size: 19, color: C.red, fam: UI });
      text("• ORDER BY da alias ishlaydi", 170, 655, { size: 19, color: C.green, fam: UI });
      text("• DISTINCT ON o'ziga xos qurol", 170, 700, { size: 19, color: C.blue, fam: UI });
      text("• Jadvalsiz: to'g'ridan-to'g'ri SELECT", 170, 745, { size: 19, color: C.soft, fam: UI });
      text("• NUMERIC aniq hisob-kitob", 170, 790, { size: 19, color: C.soft, fam: UI });

      // MySQL card
      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• WHERE da alias ishlamaydi", 710, 560, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• HAVING da alias ISHLAYDI! (Qulaylik)", 710, 610, { size: 19, color: C.green, fam: UI });
      text("• GROUP BY va ORDER BY da alias bor", 710, 655, { size: 19, color: C.green, fam: UI });
      text("• DISTINCT ON mavjud emas", 710, 700, { size: 19, color: C.red, fam: UI });
      text("• FROM DUAL soxta jadvali merosi", 710, 745, { size: 19, color: C.soft, fam: UI });
      text("• DECIMAL yuqori aniqlik", 710, 790, { size: 19, color: C.soft, fam: UI });

      // SQLite card
      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• WHERE da ham alias ISHLAYDI!", 1290, 560, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• HAVING da ham alias qabul qilinadi", 1290, 610, { size: 19, color: C.purple, fam: UI });
      text("• DISTINCT ON mavjud emas", 1290, 655, { size: 19, color: C.red, fam: UI });
      text("• Nostandart: boshqa bazaga ko'chmaydi", 1290, 700, { size: 19, color: C.red, fam: UI });
      text("• Taqribiy floating point hisoblash", 1290, 745, { size: 19, color: C.soft, fam: UI });
      text("• Yengil ichki vosita tabiati", 1290, 790, { size: 19, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL HAVING ALIAS
  function sMysqlHavingAlias(t) {
    heading("MySQL 9: HAVING va ORDER BY da Alias Imkoniyati", t, TM.scenes.mysql_having_alias.s);

    const k1 = P(t, W('L2', 'alias'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("MySQL Kengaytmasi: HAVING da Alias", 520, 260, C.green, k1, 20);

      text("-- MySQL da bu so'rov muvaffaqiyatli bajariladi:", 140, 320, { size: 18, color: C.soft, fam: MONO });
      text("SELECT sotuvchi, SUM(summa) AS jami", 140, 360, { size: 21, weight: 700, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 140, 400, { size: 21, color: C.green, fam: MONO });
      text("GROUP BY sotuvchi", 140, 440, { size: 21, color: C.blue, fam: MONO });
      text("HAVING jami > 800; -- MySQL ruxsat beradi!", 140, 480, { size: 21, weight: 700, color: C.green, fam: MONO });

      sline(140, 525, 880, 525, { col: C.rule, p: k1 });

      text("Muhim qoidalar va taqqoslash:", 140, 570, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. SQL standartida HAVING guruhlashdan keyin, lekin", 140, 615, { size: 19, color: C.soft, fam: UI });
      text("   SELECT dan oldin bajarilishi shart.", 140, 645, { size: 19, color: C.soft, fam: UI });
      text("2. PostgreSQL da HAVING jami > 800 yozsangiz xato beradi!", 140, 690, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   PostgreSQL HAVING SUM(summa) > 800 talab qiladi.", 140, 720, { size: 19, color: C.soft, fam: UI });
      text("3. MySQL dasturchilar qulayligi uchun HAVING da", 140, 765, { size: 19, color: C.green, fam: UI });
      text("   aliaslarni ko'rishga ruxsat bergan.", 140, 795, { size: 19, color: C.green, fam: UI });
      text("4. Ammo MySQL da ham WHERE da alias ishlamaydi!", 140, 845, { size: 19, weight: 700, color: C.red, fam: UI });
      text("5. DISTINCT ON esa MySQL da mutlaqo yo'q.", 140, 890, { size: 19, color: C.red, fam: UI });
    });

    const k2 = P(t, W('L2', 'having'), 0.5);
    withA(k2, () => {
      const mysqlOut = (TTY.mysql && TTY.mysql.mysql_having_alias) || "sotuvchi\tjami\nSobir\t1000.00\nVali\t900.00";
      term(980, 210, 840, 780, "MySQL 9.7.2 Terminali (Amaliy natija)", [{
        b: {
          cmd: "mysql -u dev -p qollanma",
          out: [
            "mysql> SELECT sotuvchi, SUM(summa) AS jami",
            "    -> FROM sotuvlar",
            "    -> GROUP BY sotuvchi",
            "    -> HAVING jami > 800;",
            "+----------+---------+",
            "| sotuvchi | jami    |",
            "+----------+---------+",
            "| Sobir    | 1000.00 |",
            "| Vali     |  900.00 |",
            "+----------+---------+",
            "2 rows in set (0.00 sec)",
            "",
            "-- Lekin DISTINCT ON sinovi:",
            "mysql> SELECT DISTINCT ON (sotuvchi) * FROM sotuvlar;",
            "ERROR 1064 (42000): You have an error in your SQL syntax;",
            "check the manual that corresponds to your MySQL server",
            "version for the right syntax to use near 'ON (sotuvchi)'"
          ].join('\n')
        }
      }], { font: 16, lh: 24 });
    });
  }

  // 3. MYSQL DUAL TABLE
  function sMysqlDualTable(t) {
    heading("MySQL va DUAL Soxta Jadvali Tushunchasi", t, TM.scenes.mysql_dual_table.s);

    const k1 = P(t, W('L3', 'May'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("Jadvalsiz SELECT va DUAL", 520, 260, C.blue, k1, 20);

      text("Klassik SQL merosi: FROM majburiy bo'lgan davrlar", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Oracle va dastlabki relyatsion bazalarda har qanday SELECT", 140, 365, { size: 19, color: C.soft, fam: UI });
      text("albatta FROM bandiga ega bo'lishi talab qilingan.", 140, 395, { size: 19, color: C.soft, fam: UI });

      card(140, 435, 760, 160, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("-- An'anaviy MySQL so'rovi:", 170, 470, { size: 18, color: C.soft, fam: MONO });
      text("SELECT 100 * 1.12 AS hisob FROM DUAL;", 170, 505, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("SELECT NOW(), VERSION() FROM DUAL;", 170, 545, { size: 20, color: C.ink, fam: MONO });

      text("Zamonaviy MySQL va PostgreSQL farqi:", 140, 640, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• MySQL da DUAL hali ham mavjud va moslik uchun ishlaydi.", 140, 685, { size: 19, color: C.green, fam: UI });
      text("• Ammo MySQL 8 va 9 larda DUAL endi majburiy emas:", 140, 725, { size: 19, color: C.green, fam: UI });
      text("  SELECT 100 * 1.12; ham to'liq qonuniy.", 140, 755, { size: 19, color: C.green, fam: MONO });
      text("• PostgreSQL da esa DUAL umuman mavjud EMAS!", 140, 805, { size: 19, weight: 700, color: C.red, fam: UI });
      text("  SELECT 1 FROM DUAL; deb yozsangiz, Postgres", 140, 840, { size: 19, color: C.red, fam: UI });
      text("  relation 'dual' does not exist degan xatoni beradi.", 140, 870, { size: 19, color: C.red, fam: MONO });
    });

    const k2 = P(t, W('L3', 'dual'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.hl, p: k2 });
      pill("Amaliy Sinov Taqqoslash", 1400, 260, C.hl, k2, 20);

      card(1020, 310, 760, 280, { fill: '#fff', col: C.green, p: k2 });
      text("MySQL 9.7 Konsolida:", 1050, 350, { size: 20, weight: 700, color: C.green, fam: UI });
      text("mysql> SELECT 'Salom Dunyo' AS xabar FROM DUAL;", 1050, 395, { size: 17, color: C.ink, fam: MONO });
      text("+-------------+", 1050, 425, { size: 17, color: C.soft, fam: MONO });
      text("| xabar       |", 1050, 450, { size: 17, color: C.soft, fam: MONO });
      text("+-------------+", 1050, 475, { size: 17, color: C.soft, fam: MONO });
      text("| Salom Dunyo |", 1050, 500, { size: 17, color: C.green, fam: MONO });
      text("+-------------+", 1050, 525, { size: 17, color: C.soft, fam: MONO });
      text("1 row in set (0.00 sec) -- DUAL muammosiz qabul qilindi", 1050, 555, { size: 15, color: C.soft, fam: UI });

      card(1020, 620, 760, 330, { fill: '#fff', col: C.red, p: k2 });
      text("PostgreSQL 18 Konsolida:", 1050, 660, { size: 20, weight: 700, color: C.red, fam: UI });
      text("qollanma=# SELECT 'Salom Dunyo' FROM DUAL;", 1050, 705, { size: 17, color: C.ink, fam: MONO });
      text("ERROR:  relation \"dual\" does not exist", 1050, 740, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("LINE 1: SELECT 'Salom Dunyo' FROM DUAL;", 1050, 770, { size: 17, color: C.soft, fam: MONO });
      text("                                  ^", 1050, 795, { size: 17, color: C.red, fam: MONO });
      text("-- To'g'ri PostgreSQL sintaksisi (FROM siz):", 1050, 835, { size: 16, color: C.soft, fam: MONO });
      text("qollanma=# SELECT 'Salom Dunyo' AS xabar;", 1050, 870, { size: 17, color: C.blue, fam: MONO });
      text(" ?column?   -->  Salom Dunyo (1 row)", 1050, 905, { size: 17, color: C.green, fam: MONO });
    });
  }

  // 4. SQLITE WHERE ALIAS
  function sSqliteWhereAlias(t) {
    heading("SQLite: Kutilmagan Qulaylik — WHERE da Alias", t, TM.scenes.sqlite_where_alias.s);

    const k1 = P(t, W('L4', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("SQLite Nostandart Xulqi: WHERE da Alias", 520, 260, C.purple, k1, 20);

      text("-- PostgreSQL va MySQL da XATO bergan so'rov:", 140, 320, { size: 18, color: C.red, fam: MONO });
      text("SELECT sotuvchi, summa * 1.12 AS qqs_bilan", 140, 360, { size: 21, weight: 700, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 140, 400, { size: 21, color: C.ink, fam: MONO });
      text("WHERE qqs_bilan > 700; -- SQLite da ISHLAYDI!", 140, 440, { size: 21, weight: 700, color: C.purple, fam: MONO });

      sline(140, 485, 880, 485, { col: C.rule, p: k1 });

      text("Nega SQLite bunga ruxsat beradi?", 140, 530, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. SQLite dvigateli so'rovni tahlil qilishda aliaslarni", 140, 575, { size: 19, color: C.soft, fam: UI });
      text("   WHERE ifodasiga avtomatik ravishda almashtiradi.", 140, 605, { size: 19, color: C.soft, fam: UI });
      text("2. Bu dasturchiga katta qulaylikdek tuyuladi:", 140, 650, { size: 19, color: C.purple, fam: UI });
      text("   murakkab formulani WHERE da qayta yozish shart emas.", 140, 680, { size: 19, color: C.purple, fam: UI });
      text("3. Shuningdek HAVING shartida ham xuddi shunday ishlaydi.", 140, 725, { size: 19, color: C.soft, fam: UI });

      card(140, 765, 760, 185, { fill: '#fff1f2', col: C.red, p: k1 });
      text("⚠️ DIQQAT: TUZOQ VA XATAR!", 170, 805, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Bu SQL standartiga (ANSI SQL) mutlaqo zid xususiyatdir.", 170, 845, { size: 18, color: C.ink, fam: UI });
      text("• Bunday so'rovlar PostgreSQL, MySQL yoki Oracle da ishlamaydi.", 170, 885, { size: 18, color: C.red, fam: UI });
      text("• Kodingizni faqat SQLite ga bog'lab qo'ymang!", 170, 920, { size: 18, weight: 700, color: C.red, fam: UI });
    });

    const k2 = P(t, W('L4', 'standart'), 0.5);
    withA(k2, () => {
      const sqliteOut = (TTY.sqlite && TTY.sqlite.sqlite_alias) || "╭──────────┬────────────────────╮\n│ sotuvchi │     qqs_bilan      │\n╞══════════╪════════════════════╡\n│ Vali     │ 784.00000000000011 │\n│ Sobir    │ 1008.0000000000001 │\n╰──────────┴────────────────────╯";
      term(980, 210, 840, 780, "SQLite 3.54.0 Terminali (Real natija)", [{
        b: {
          cmd: "sqlite3 dokondb",
          out: [
            "sqlite> .mode box",
            "sqlite> SELECT sotuvchi, summa * 1.12 AS qqs_bilan",
            "   ...> FROM sotuvlar",
            "   ...> WHERE qqs_bilan > 700;",
            sqliteOut,
            "",
            "-- HAVING da ham sinab ko'ramiz:",
            "sqlite> SELECT sotuvchi, sum(summa) AS jami",
            "   ...> FROM sotuvlar GROUP BY sotuvchi HAVING jami > 800;",
            "╭──────────┬──────╮",
            "│ sotuvchi │ jami │",
            "╞══════════╪══════╡",
            "│ Sobir    │ 1000 │",
            "│ Vali     │  900 │",
            "╰──────────┴──────╯"
          ].join('\n')
        }
      }], { font: 16, lh: 24 });
    });
  }

  // 5. SQLITE CAVEATS & FLOATS
  function sSqliteCaveats(t) {
    heading("SQLite Hisob-kitoblari va Portabellik Muammolari", t, TM.scenes.sqlite_caveats.s);

    const k1 = P(t, W('L5', 'taqribiy'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("1-Muammo: Haqiqiy Sonlar Taqribiyligi (REAL)", 520, 260, C.red, k1, 20);

      text("SQLite da alohida aniq DECIMAL turi mavjud emas:", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Ko'paytirish va bo'lish natijalari IEEE-754 suzuvchi vergul", 140, 365, { size: 19, color: C.soft, fam: UI });
      text("(REAL / float) formatida hisoblanadi.", 140, 395, { size: 19, color: C.soft, fam: UI });

      card(140, 440, 760, 220, { fill: '#fff', col: C.red, p: k1 });
      text("Terminaldagi haqiqiy natijaga qarang:", 170, 480, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Vali  summa=700:  700 * 1.12  =>  784.00000000000011", 170, 530, { size: 19, color: C.red, fam: MONO });
      text("Sobir summa=900:  900 * 1.12  =>  1008.0000000000001", 170, 580, { size: 19, color: C.red, fam: MONO });
      text("Kutilgan aniq qiymat: 784.00 va 1008.00", 170, 625, { size: 18, color: C.green, fam: MONO });

      text("Moliyaviy hisob-kitoblar uchun jiddiy ogohlantirish:", 140, 700, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• PostgreSQL da NUMERIC har doim tiyingacha 100% aniq.", 140, 745, { size: 19, color: C.blue, fam: UI });
      text("• SQLite da esa suzuvchi vergul xatolari jamg'arilib boradi.", 140, 785, { size: 19, color: C.red, fam: UI });
      text("• SQLite da pul bilan ishlashda tiyinlarda (INTEGER) saqlash", 140, 835, { size: 19, color: C.green, fam: UI });
      text("  yoki maxsus yaxlitlash (ROUND) funksiyasini qo'llash shart.", 140, 865, { size: 19, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L5', 'Postgres'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("2-Muammo: PostgreSQL ga Ko'chirish Qiyinligi", 1400, 260, C.blue, k2, 20);

      text("Loyihani SQLite dan PostgreSQL ga o'tkazishdagi to'siqlar:", 1020, 320, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1020, 365, 760, 200, { fill: '#fff1f2', col: C.red, p: k2 });
      text("❌ SQLite da yozilgan nostandart kod:", 1050, 405, { size: 19, weight: 700, color: C.red, fam: UI });
      text("SELECT sotuvchi, summa * 1.12 AS narx", 1050, 445, { size: 19, color: C.ink, fam: MONO });
      text("FROM sotuvlar WHERE narx > 500;", 1050, 480, { size: 19, color: C.red, fam: MONO });
      text("-> PostgreSQL ga ko'chirilganda: 500 ta so'rov sinadi!", 1050, 525, { size: 18, weight: 700, color: C.red, fam: UI });

      card(1020, 595, 760, 220, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("✅ Universal va Portabel Yechim (Har ikkalasida ishlaydi):", 1050, 635, { size: 19, weight: 700, color: C.green, fam: UI });
      text("WITH hisoblangan AS (", 1050, 675, { size: 19, color: C.blue, fam: MONO });
      text("  SELECT sotuvchi, summa * 1.12 AS narx FROM sotuvlar", 1050, 705, { size: 19, color: C.blue, fam: MONO });
      text(")", 1050, 735, { size: 19, color: C.blue, fam: MONO });
      text("SELECT * FROM hisoblangan WHERE narx > 500;", 1050, 770, { size: 19, weight: 700, color: C.green, fam: MONO });

      text("CTE (WITH) yordamida har qanday bazaga mos kod yoziladi!", 1020, 850, { size: 20, weight: 700, color: C.ink, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Relyatsion Bazalarda SELECT Qiyosiy Jadvali", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Doimo'), 0.5);
    withA(k1, () => {
      // Comparison Table
      const x0 = 120, y0 = 210, w = 1680, h = 480;
      card(x0, y0, w, h, { fill: C.card, col: C.blue, p: k1 });

      // Table headers
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
        ["WHERE da Alias ishlatish", "❌ Mumkin emas (xato)", "❌ Mumkin emas (xato)", "✅ Ishlaydi (Nostandart)"],
        ["HAVING da Alias", "❌ Mumkin emas", "✅ Qo'llab-quvvatlaydi", "✅ Ishlaydi"],
        ["ORDER BY da Alias", "✅ To'liq ishlaydi", "✅ To'liq ishlaydi", "✅ To'liq ishlaydi"],
        ["DISTINCT ON (ustun)", "✅ Mavjud (juda qulay)", "❌ Yo'q (GROUP BY)", "❌ Mavjud emas"],
        ["Jadvalsiz hisob (DUAL)", "❌ DUAL yo'q (SELECT ...)", "✅ Ixtiyoriy DUAL", "❌ DUAL yo'q"],
        ["Hisob-kitob aniqligi", "✅ NUMERIC (100% aniq)", "✅ DECIMAL (100% aniq)", "⚠️ REAL (Taqribiy float)"]
      ];

      rows.forEach((r, idx) => {
        const ry = y0 + 120 + idx * 56;
        sline(x0 + 20, ry - 18, x0 + w - 20, ry - 18, { col: C.rule, p: k1 });
        text(r[0], cols[0].x, ry + 10, { size: 19, weight: 700, color: C.ink, fam: UI });
        text(r[1], cols[1].x, ry + 10, { size: 18, color: r[1].startsWith('✅') ? C.green : C.red, fam: UI });
        text(r[2], cols[2].x, ry + 10, { size: 18, color: r[2].startsWith('✅') ? C.green : C.red, fam: UI });
        text(r[3], cols[3].x, ry + 10, { size: 18, color: r[3].startsWith('✅') ? C.purple : (r[3].startsWith('⚠️') ? C.red : C.soft), fam: UI });
      });
    });

    const k2 = P(t, W('L6', 'garovidir'), 0.5);
    withA(k2, () => {
      card(120, 720, 1680, 270, { fill: '#f8fafc', col: C.green, p: k2 });
      pill("UCHTA OLTIN QOIDA", 960, 765, C.green, k2, 22);

      card(160, 810, 500, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("1. WHERE da Alias ishlatmang", 190, 850, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("Agar formula kerak bo'lsa,", 190, 890, { size: 17, color: C.soft, fam: UI });
      text("CTE (WITH) yoki subquery oling.", 190, 920, { size: 17, color: C.soft, fam: UI });

      card(710, 810, 500, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. AS so'zini aniq yozing", 740, 850, { size: 20, weight: 700, color: C.green, fam: UI });
      text("Vergul tushib qolganda ustun", 740, 890, { size: 17, color: C.soft, fam: UI });
      text("aliasga aylanib ketishining oldini oling.", 740, 920, { size: 17, color: C.soft, fam: UI });

      card(1260, 810, 500, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("3. Standartga sodiq qoling", 1290, 850, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("Standart SQL yozsangiz, loyihangiz", 1290, 890, { size: 17, color: C.soft, fam: UI });
      text("har qanday bazaga oson ko'chadi.", 1290, 920, { size: 17, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_having_alias.s) sIntro(t);
    else if (t < S.mysql_dual_table.s) sMysqlHavingAlias(t);
    else if (t < S.sqlite_where_alias.s) sMysqlDualTable(t);
    else if (t < S.sqlite_caveats.s) sSqliteWhereAlias(t);
    else if (t < S.xulosa.s) sSqliteCaveats(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.mysql_having_alias.s + 3.0);
  };
})();
