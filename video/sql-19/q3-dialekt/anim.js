// SQL 19-bob 3-qism: "Dialektlar" — MySQL va SQLite da RETURNING Muqobillari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 22) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("19-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: RETURNING Farqlari", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("LAST_INSERT_ID, ROW_COUNT, SQLite Cheklovlari va Xatolar", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres'), 0.8);
    withA(kBadges, () => {
      pill("POSTGRESQL: TO'LIQ RETURNING & CTE", 380, 540, C.blue, kBadges, 20);
      pill("MYSQL: LAST_INSERT_ID & ROW_COUNT", 960, 540, C.green, kBadges, 20);
      pill("SQLITE: DML RETURNING (3.35+)", 1540, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'May'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("RETURNING klauzasi barcha ma'lumotlar bazalarida bir xil mavjud emas:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("PostgreSQL va SQLite da u ishlasa-da, MySQL 9 da bu buyruq umuman yo'q.", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("MySQL o'rniga maxsus sessiya funksiyalaridan foydalanadi, SQLite da esa qat'iy cheklovlar bor.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. MYSQL NO RETURNING
  function sMysqlNoReturning(t) {
    heading("MySQL: RETURNING Yo'qligi va LAST_INSERT_ID()", t, TM.scenes.mysql_no_returning.s);

    const k1 = P(t, W('L2', 'May'), 0.5);
    withA(k1, () => {
      const outErr = [
        "ERROR 1064 (42000):",
        "You have an error in your SQL syntax; check manual",
        "near 'RETURNING id' at line 1",
        "",
        "+----------+----------+",
        "| yangi_id | qatorlar |",
        "+----------+----------+",
        "|        1 |        1 |",
        "+----------+----------+"
      ];
      term(120, 220, 840, 480, "MySQL 9.7 Terminali", [{
        b: {
          cmd: "# 1. MySQL da RETURNING ishlamaydi:\nINSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;\n# ERROR 1064!\n\n# 2. To'g'ri yo'l — funksiyalardan foydalanish:\nINSERT INTO mijozlar (ism) VALUES ('Ali');\nSELECT LAST_INSERT_ID() AS yangi_id, ROW_COUNT() AS qatorlar;",
          out: outErr
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'last'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("MySQL da Yangi ID Olish Mexanizmi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. RETURNING Sintaksisi Mavjud Emas:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• MySQL DML buyruqlaridan bevosita qatorlar to'plamini qaytarishni qo'llab-quvvatlamaydi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• RETURNING yozilganda sintaktik xato beradi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. LAST_INSERT_ID() Funksiyasi:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• Ulanishga (sessiyaga) tegishli bo'lib, eng oxirgi avtomatik yaratilgan AUTO_INCREMENT qiymatini beradi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Parallel boshqa mijozlar bu qiymatni buzib qo'ya olmaydi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'olinadi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Asosiy Kamchilik:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("MySQL da o'zgartirilgan yoki o'chirilgan qatorning to'liq mazmunini (yoki PostgreSQL 18 dagi eski va yangi qiymatlarini) to'g'ridan-to'g'ri qaytarishning iloji yo'q.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. MYSQL PITFALLS
  function sMysqlPitfalls(t) {
    heading("MySQL Tuzoqlari: Ko'p Qatorli INSERT va ROW_COUNT()", t, TM.scenes.mysql_pitfalls.s);

    const k1 = P(t, W('L3', 'ko‘p'), 0.5);
    withA(k1, () => {
      const outPitfall = [
        "+-------------+",
        "| birinchi_id |",
        "+-------------+",
        "|           2 |",
        "+-------------+",
        "",
        "+----------+",
        "| ozgargan |",
        "+----------+",
        "|        2 |",
        "+----------+",
        "+-------------------------+",
        "| ozgargan_ikkinchi_marta |",
        "+-------------------------+",
        "|                       0 |",
        "+-------------------------+"
      ];
      term(120, 220, 840, 480, "MySQL Tuzoqlari Terminali", [{
        b: {
          cmd: "-- 1. Ko'p qatorli INSERT da ID:\nINSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir');\nSELECT LAST_INSERT_ID() AS birinchi_id;\n# Natija: 2 (Faqat birinchi qator ID si!)\n\n-- 2. ROW_COUNT() tahlili:\nUPDATE mijozlar SET balans = 50000 WHERE ism IN ('Ali', 'Vali');\nSELECT ROW_COUNT() AS ozgargan;\n# Yana shu buyruq qayta berilsa:\nSELECT ROW_COUNT() AS ozgargan_ikkinchi_marta;",
          out: outPitfall
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L3', 'birinchi'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.red, p: k2 });
      hand("MySQL DML Nozikliklari", 1040, 280, { size: 28, color: C.red, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. LAST_INSERT_ID FAQAT BIRINCHISI:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• Vali (2) va Sobir (3) qo'shilganda LAST_INSERT_ID faqat 2 ni beradi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Sobirning ID si 3 bo'lishini ilova o'zi hisoblashi kerak bo'ladi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. ROW_COUNT() Va O'zgargan Qatorlar:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Ikkinchi marta UPDATE qilinganda 2 ta qator topildi, lekin balans allaqachon 50000 bo'lgani uchun ROW_COUNT = 0 qaytdi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• PostgreSQL esa doimo mos kelgan (topilgan) qatorlar sonini beradi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'sanaydi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim Eslatma:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("MySQL ulanishida CLIENT_FOUND_ROWS parametri yoqilmasa, ROW_COUNT = 0 javobini 'bunday qatorlar bazada yo'q ekan' deb xato talqin qilish xavfi bor.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. SQLITE RETURNING
  function sSqliteReturning(t) {
    heading("SQLite 3.35+: RETURNING va Uning Cheklovlari", t, TM.scenes.sqlite_returning.s);

    const k1 = P(t, W('L4', 'retyorning'), 0.5);
    withA(k1, () => {
      const outSqlite = [
        "1|Ali",
        "2|Vali",
        "",
        "2|Vali|2026-10-16 07:53:30|0",
        "",
        "# Cheklov 1: Subquery sifatida ishlamaydi:",
        "Parse error: near \"INSERT\": syntax error",
        "  SELECT * FROM (INSERT ... RETURNING id);",
        "",
        "# Cheklov 2: Agregat funksiyalar taqiqlangan:",
        "Parse error: misuse of aggregate function sum()"
      ];
      term(120, 220, 840, 480, "SQLite 3.54 Terminali", [{
        b: {
          cmd: "-- SQLite 3.35+ versiyasida RETURNING mavjud:\nINSERT INTO mijozlar (ism) VALUES ('Ali'), ('Vali') RETURNING id, ism;\nDELETE FROM mijozlar WHERE ism = 'Vali' RETURNING *;\n\n-- Cheklovlar:\nSELECT * FROM (INSERT INTO mijozlar (ism) VALUES ('X') RETURNING id);\nUPDATE mijozlar SET balans = 1 RETURNING sum(balans);",
          out: outSqlite
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L4', 'ixtiyoriydir.'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("SQLite da RETURNING Cheklovlari", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. Nima Ishlaydi:", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• INSERT, UPDATE va DELETE da ustunlar to'g'ridan-to'g'ri qaytariladi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• last_insert_rowid() — MySQL dan farqli o'laroq OXIRGI qator ID sini beradi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("2. Asosiy Cheklovlar:", 1070, 555, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• Subquery yoki CTE ga ulab bo'lmaydi (faqat ilovaga qaytadi).", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Natija qatorlari tartibi ixtiyoriy, kiritilgan tartibda kelishi kafolatlanmaydi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'bo‘lmaydi'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Trigger Cheklovi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("SQLite da AFTER triggerlar kiritgan keyingi o'zgarishlar RETURNING natijasida ko'rinmaydi. PostgreSQL da esa triggerlar o'zgartirgan yakuniy qator ko'rinadi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. DML PITFALLS
  function sDmlPitfalls(t) {
    heading("DML Xatolari: max(id) Tuzog'i va O'zboshimcha Tartib", t, TM.scenes.dml_pitfalls.s);

    const k1 = P(t, W('L5', 'Maksimal'), 0.5);
    withA(k1, () => {
      card(120, 220, 520, 480, { fill: C.card, col: C.red, p: k1 });
      hand("1. SELECT max(id)", 160, 280, { size: 28, color: C.red, p: k1 });
      card(150, 330, 460, 160, { fill: '#fff', col: C.red, p: k1 });
      text("SELECT max(id) FROM t;", 170, 380, { size: 18, fam: MONO, weight: 700, color: C.red });
      text("Parallel ulanishlar bo'lsa, boshqa birovning ID sini olib qo'yish (poyga xavfi).", 170, 430, { size: 17, color: C.ink, wrap: 420 });

      card(150, 510, 460, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Yechim:", 170, 555, { size: 18, weight: 700, color: C.green });
      text("• PostgreSQL/SQLite: RETURNING id", 170, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• MySQL: LAST_INSERT_ID()", 170, 635, { size: 16, color: C.green, weight: 700, wrap: 420 });
    });

    const k2 = P(t, W('L5', 'Es-kyu-layt'), 0.5);
    withA(k2, () => {
      card(680, 220, 520, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("2. Natija Tartibi", 720, 280, { size: 28, color: C.blue, p: k2 });
      card(710, 330, 460, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("RETURNING id, ism", 730, 380, { size: 18, fam: MONO, weight: 700, color: C.blue });
      text("SQLite hujjatiga ko'ra natija qatorlari tartibi ixtiyoriydir.", 730, 430, { size: 17, color: C.ink, wrap: 420 });

      card(710, 510, 460, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("Yechim:", 730, 555, { size: 18, weight: 700, color: C.blue });
      text("• Qatorlar tartibiga tayanmaslik.", 730, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• Dastur kodida ID yoki ism bo'yicha bog'lab olish.", 730, 635, { size: 16, color: C.soft, wrap: 420 });
    });

    const k3 = P(t, W('L5', 'xatolarni'), 0.5);
    withA(k3, () => {
      card(1240, 220, 560, 480, { fill: C.card, col: C.purple, p: k3 });
      hand("3. MySQL Ko'p Qatorli ID", 1280, 280, { size: 28, color: C.purple, p: k3 });
      card(1270, 330, 500, 160, { fill: '#fff', col: C.purple, p: k3 });
      text("INSERT INTO t VALUES (..), (..)", 1290, 380, { size: 18, fam: MONO, weight: 700, color: C.purple });
      text("LAST_INSERT_ID faqat 1-qator ID sini qaytaradi, oxirgisini emas!", 1290, 430, { size: 17, color: C.ink, wrap: 460 });

      card(1270, 510, 500, 160, { fill: '#fff', col: C.green, p: k3 });
      text("Yechim:", 1290, 555, { size: 18, weight: 700, color: C.green });
      text("• ID larni bittalab kiritish yoki birinchisiga qarab oraliqni hisoblash.", 1290, 600, { size: 16, color: C.ink, wrap: 460 });
      text("• Yoki PostgreSQL ga o'tib to'liq RETURNING dan foydalanish.", 1290, 635, { size: 16, color: C.soft, wrap: 460 });
    });

    const kDesc = P(t, W('L5', 'chiqaradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Tavsiya:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("Ko'p platformali dastur tuzayotganda ushbu dialektik farqlarni hisobga oling yoki ORM / drayverning ID olish funksiyalariga tayaning.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: RETURNING Dialektlari Solishtirma Matritsasi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'generatsiya'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("SQL Tizimlarida O'zgarishlarni Qaytarish Imkoniyatlari", 160, 280, { size: 30, color: C.blue, p: k1 });

      // Table Header
      const y0 = 330;
      card(160, y0, 1600, 50, { fill: '#1e293b', col: '#1e293b', p: k1 });
      text("Xususiyat", 190, y0 + 32, { size: 19, weight: 700, color: '#fff' });
      text("PostgreSQL 18", 610, y0 + 32, { size: 19, weight: 700, color: '#93c5fd' });
      text("MySQL 9.7", 1020, y0 + 32, { size: 19, weight: 700, color: '#86efac' });
      text("SQLite 3.54", 1380, y0 + 32, { size: 19, weight: 700, color: '#d8b4fe' });

      // Row 1
      const y1 = y0 + 60;
      card(160, y1, 1600, 50, { fill: '#fff', col: C.border, p: k1 });
      text("RETURNING Sintaksisi", 190, y1 + 32, { size: 18, weight: 700, color: C.ink });
      text("INSERT, UPDATE, DELETE, MERGE", 610, y1 + 32, { size: 16, fam: MONO, color: C.blue });
      text("Mavjud emas (xato)", 1020, y1 + 32, { size: 17, fam: MONO, color: C.red });
      text("INSERT, UPDATE, DELETE (3.35+)", 1380, y1 + 32, { size: 15, fam: MONO, color: C.purple });

      // Row 2
      const y2 = y1 + 55;
      card(160, y2, 1600, 50, { fill: '#f8fafc', col: C.border, p: k1 });
      text("Eski va Yangi Qiymat", 190, y2 + 32, { size: 18, weight: 700, color: C.ink });
      text("old.* va new.* birga", 610, y2 + 32, { size: 17, weight: 700, color: C.green });
      text("Yo'q", 1020, y2 + 32, { size: 17, color: C.soft });
      text("Faqat bittasi (o'zgargani)", 1380, y2 + 32, { size: 17, color: C.soft });

      // Row 3
      const y3 = y2 + 55;
      card(160, y3, 1600, 50, { fill: '#fff', col: C.border, p: k1 });
      text("WITH CTE Oqimi", 190, y3 + 32, { size: 18, weight: 700, color: C.ink });
      text("Ha (to'liq qo'llab-quvvatlanadi)", 610, y3 + 32, { size: 17, weight: 700, color: C.blue });
      text("Yo'q", 1020, y3 + 32, { size: 17, color: C.soft });
      text("Yo'q (taqiqlangan)", 1380, y3 + 32, { size: 17, color: C.soft });

      // Row 4
      const y4 = y3 + 55;
      card(160, y4, 1600, 50, { fill: '#f8fafc', col: C.border, p: k1 });
      text("Yangi ID Olish Usuli", 190, y4 + 32, { size: 18, weight: 700, color: C.ink });
      text("RETURNING id", 610, y4 + 32, { size: 17, color: C.blue });
      text("LAST_INSERT_ID() (faqat 1-si)", 1020, y4 + 32, { size: 17, color: C.green });
      text("last_insert_rowid() (oxirgisi)", 1380, y4 + 32, { size: 17, color: C.purple });
    });

    const kDesc = P(t, W('L6', 'poydevoridir.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("PostgreSQL ning to'liq RETURNING imkoniyati ma'lumotlar yaxlitligi va tezlik bo'yicha etakchilik qiladi. MySQL va SQLite bilan ishlaganda esa ularning o'ziga xos sessiya funksiyalari va cheklovlarini to'g'ri qo'llash lozim.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_no_returning.s) sIntro(t);
    else if (t < S.mysql_pitfalls.s) sMysqlNoReturning(t);
    else if (t < S.sqlite_returning.s) sMysqlPitfalls(t);
    else if (t < S.dml_pitfalls.s) sSqliteReturning(t);
    else if (t < S.xulosa.s) sDmlPitfalls(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_no_returning.s + 4.0;
    frame(t);
  };
})();
