// SQL 18-bob 3-qism: "Dialektlar" — MySQL va SQLite da DML O'ziga Xosliklari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 22) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("18-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: DML Farqlari", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("UPDATE JOIN, ORDER BY LIMIT, Subquery va Qat'iy Rejimlar", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'May'), 0.8);
    withA(kBadges, () => {
      pill("POSTGRESQL: FROM / USING", 400, 540, C.blue, kBadges, 20);
      pill("MYSQL: UPDATE JOIN & LIMIT", 960, 540, C.green, kBadges, 20);
      pill("SQLITE: UPDATE FROM & SUBQUERY", 1520, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'Es-kyu-layt'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("DML buyruqlari standart ANSI SQL da umumiy tamoyillarga asoslangan bo'lsa-da:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Ko'p jadvalli yangilash va o'chirish sintaksisi tizimdan tizimga keskin farq qiladi.", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("MySQL o'zining UPDATE JOIN sintaksisiga ega, SQLite esa ko'proq subquery yondashuvini talab qiladi.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. MYSQL JOIN UPDATE
  function sMysqlJoinUpdate(t) {
    heading("MySQL: UPDATE JOIN va Qat'iy INSERT", t, TM.scenes.mysql_join_update.s);

    const k1 = P(t, W('L2', 'insert'), 0.5);
    withA(k1, () => {
      const outErr = [
        "ERROR 1136 (21S01):",
        "Column count doesn't match value count at row 1",
        "",
        "Query OK, 3 rows affected (0.01 sec)",
        "Rows matched: 3  Changed: 3  Warnings: 0",
        "",
        "mahsulot_id  nom     soni  narx",
        "1            Non     85    4000.00",
        "4            Tuz     47    2000.00",
        "5            Shakar  60    11000.00"
      ];
      term(120, 220, 840, 480, "MySQL 9.7 Terminali", [{
        b: {
          cmd: "# 1. Chapdan to'ldirish MySQL da ishlamaydi:\nINSERT INTO ombor VALUES (3, 'Choy');\n\n# 2. Ko'p jadvalli yangilash:\nUPDATE ombor o\nJOIN sotuvlar s ON o.mahsulot_id = s.mahsulot_id\nSET o.soni = o.soni - s.soni;\n\nSELECT * FROM ombor WHERE mahsulot_id IN (1,4,5);",
          out: outErr
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'joyn'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("MySQL DML O'ziga Xosliklari", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. Qat'iy Ustunlar Sanog'i (Error 1136):", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• MySQL VALUES ro'yxatida ustunlar soni jadval ustunlariga to'liq teng bo'lishini talab qiladi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• PostgreSQL kabi yetishmagan ustunlarni o'z-o'zidan sukut qiymat bilan to'ldirmaydi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. UPDATE JOIN Sintaksisi:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• PostgreSQL dagi UPDATE ... FROM o'rniga to'g'ridan-to'g'ri UPDATE ... JOIN ishlatiladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• JOIN qilingan ikkala jadval ustunlarini bir vaqtda yangilash imkoni ham mavjud.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'ishlatiladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Amaliy Tavsiya:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Agar kodingiz bir nechta DBMS da ishlashi kerak bo'lsa, har doim INSERT INTO ombor (ustun1, ustun2) deb ustunlarni ochiq ko'rsating. Shunda ham Postgres, ham MySQL da xatosiz ishlaydi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. MYSQL ORDER LIMIT
  function sMysqlOrderLimit(t) {
    heading("MySQL: ORDER BY, LIMIT va VALUES ROW", t, TM.scenes.mysql_order_limit.s);

    const k1 = P(t, W('L3', 'order'), 0.5);
    withA(k1, () => {
      const outLimit = [
        "Query OK, 1 row affected (0.00 sec)",
        "Rows matched: 1  Changed: 1  Warnings: 0",
        "",
        "mahsulot_id  narx",
        "5            11001.00",
        "",
        "# VALUES ROW Sintaksisi (MySQL 8.0.19+):",
        "column_0  column_1",
        "1         bir",
        "2         ikki"
      ];
      term(120, 220, 840, 480, "MySQL ORDER BY & LIMIT", [{
        b: {
          cmd: "# Eng qimmat bitta mahsulot narxini oshirish:\nUPDATE ombor\nSET narx = narx + 1\nORDER BY narx DESC\nLIMIT 1;\n\nSELECT mahsulot_id, narx FROM ombor WHERE mahsulot_id = 5;\n\n# Mustaqil jadval hosil qilish:\nVALUES ROW(1, 'bir'), ROW(2, 'ikki');",
          out: outLimit
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L3', 'limit'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("MySQL ning O'ziga Xos Imkoniyatlari", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. UPDATE va DELETE da LIMIT:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• MySQL bitta jadvalda ORDER BY hamda LIMIT qo'llashga ruxsat beradi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Bu navbatdagi eng eski 100 ta qatorni bosqichma-bosqich o'chirishda juda qulay.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("2. VALUES ROW(...) Majburiyati:", 1070, 555, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• PostgreSQL dagi kabi shunchaki VALUES (1, 'bir') deb bo'lmaydi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• MySQL da har bir qator oldiga aniq ROW kalit so'zi qo'yilishi shart.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'etiladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("PostgreSQL va SQLite Solishtirmasi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Postgres va SQLite standartida UPDATE ... LIMIT sintaksisi yo'q. U erda faqat WHERE id IN (SELECT id FROM ... ORDER BY ... LIMIT 1) subquery yoki CTID orqali amalga oshiriladi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. SQLITE UPDATE FROM
  function sSqliteUpdateFrom(t) {
    heading("SQLite: UPDATE FROM va DELETE Cheklovlari", t, TM.scenes.sqlite_update_from.s);

    const k1 = P(t, W('L4', 'from'), 0.5);
    withA(k1, () => {
      const outSqlite = [
        "# UPDATE FROM muvaffaqiyatli bajarildi:",
        "1|Non|85",
        "4|Tuz|47",
        "5|Shakar|60",
        "",
        "# DELETE USING esa xatolik beradi:",
        "Parse error near line 10: near \"USING\": syntax error",
        "  DELETE FROM sotuvlar USING ombor ...",
        "                       ^--- error here"
      ];
      term(120, 220, 840, 480, "SQLite 3.54 Terminali", [{
        b: {
          cmd: "-- SQLite 3.33+ versiyasida UPDATE FROM mavjud:\nUPDATE ombor SET soni = ombor.soni - s.jami\nFROM (SELECT mahsulot_id, SUM(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) s\nWHERE ombor.mahsulot_id = s.mahsulot_id;\n\n-- DELETE USING esa SQLite da mavjud emas:\nDELETE FROM sotuvlar USING ombor\nWHERE sotuvlar.mahsulot_id = ombor.mahsulot_id;\n-- Syntax error!",
          out: outSqlite
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L4', 'yuzing'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("SQLite da O'chirish Strategiyasi", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. UPDATE FROM (3.33+ Versiyadan Boshlab):", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• PostgreSQL bilan to'liq bir xil sintaksisda ishlaydi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Jamlangan hisob-kitoblar subquery orqali bir harakatda ulanadi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("2. DELETE USING Yo'qligi va Alternativa:", 1070, 555, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• SQLite DELETE buyrug'ida USING yoki JOIN klauzalari mavjud emas.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Yechim: WHERE mahsulot_id IN (SELECT mahsulot_id FROM ombor WHERE ...) subquery yozish.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'lozim.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Subquery Ning Ustunligi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("WHERE ustun IN (SELECT ...) yoki WHERE EXISTS (...) uslubidagi o'chirish har qanday SQL tizimida (Postgres, MySQL, SQLite, Oracle) bir xil va barqaror ishlaydi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. DML PITFALLS
  function sDmlPitfalls(t) {
    heading("DML Tuzoqlari va Xavfli Vaziyatlar", t, TM.scenes.dml_pitfalls.s);

    const k1 = P(t, W('L5', 'ver'), 0.5);
    withA(k1, () => {
      card(120, 220, 520, 480, { fill: C.card, col: C.red, p: k1 });
      hand("1. WHERE Siz UPDATE", 160, 280, { size: 28, color: C.red, p: k1 });
      card(150, 330, 460, 160, { fill: '#fff', col: C.red, p: k1 });
      text("UPDATE ombor SET narx = 0;", 170, 380, { size: 18, fam: MONO, weight: 700, color: C.red });
      text("Shart berilmasa jadvaldagi BARCHA qatorlar birdaniga o'zgaradi yoki o'chib ketadi!", 170, 430, { size: 17, color: C.ink, wrap: 420 });

      card(150, 510, 460, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Xavfsizlik Choralari:", 170, 555, { size: 18, weight: 700, color: C.green });
      text("• MySQL da sql_safe_updates = 1 rejimini yoqish.", 170, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• Avval BEGIN qilib, SELECT bilan ko'rib, keyin COMMIT qilish.", 170, 635, { size: 16, color: C.soft, wrap: 420 });
    });

    const k2 = P(t, W('L5', 'not'), 0.5);
    withA(k2, () => {
      card(680, 220, 520, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("2. NOT NULL Cheklovi", 720, 280, { size: 28, color: C.blue, p: k2 });
      card(710, 330, 460, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("UPDATE ombor SET nom = NULL;", 730, 380, { size: 18, fam: MONO, weight: 700, color: C.blue });
      text("NOT NULL maydonga NULL kiritishga urinish barcha zamonaviy tizimlarda xato beradi.", 730, 430, { size: 17, color: C.ink, wrap: 420 });

      card(710, 510, 460, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("Eski MySQL Rejimlari:", 730, 555, { size: 18, weight: 700, color: C.blue });
      text("• Eski MySQL larda ogohlantirish (Warning) berib bo'sh satr yozishi mumkin edi.", 730, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• Bugun qat'iy rejim (STRICT_ALL_TABLES) standartdir.", 730, 635, { size: 16, color: C.soft, wrap: 420 });
    });

    const k3 = P(t, W('L5', 'xatolik'), 0.5);
    withA(k3, () => {
      card(1240, 220, 560, 480, { fill: C.card, col: C.purple, p: k3 });
      hand("3. Noaniq Birlashuv Xavfi", 1280, 280, { size: 28, color: C.purple, p: k3 });
      card(1270, 330, 500, 160, { fill: '#fff', col: C.purple, p: k3 });
      text("UPDATE ... FROM (ko'p qator)", 1290, 380, { size: 18, fam: MONO, weight: 700, color: C.purple });
      text("Agar ikkinchi jadvalda bitta ID ga bir nechta mos qator bo'lsa, ulardan faqat bittasi yoziladi!", 1290, 430, { size: 17, color: C.ink, wrap: 460 });

      card(1270, 510, 500, 160, { fill: '#fff', col: C.green, p: k3 });
      text("Oldini Olish Usuli:", 1290, 555, { size: 18, weight: 700, color: C.green });
      text("• Birlashuvchi jadvalni avval GROUP BY bilan jamlab, yagona satr holiga keltiring.", 1290, 600, { size: 16, color: C.ink, wrap: 460 });
      text("• Noaniq natijalar ma'lumotlar buzilishiga olib keladi.", 1290, 635, { size: 16, color: C.soft, wrap: 460 });
    });

    const kDesc = P(t, W('L5', 'beradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Oltin Qoida:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("DML buyruqlarini (ayniqsa UPDATE va DELETE) production serverda ishlatishdan oldin har doim tranzaksiya ichida sinang va qancha qator o'zgarganini tekshiring.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: DML Dialektlari Solishtirma Matritsasi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'moslashuvchan'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("SQL Dialektlari O'rtasidagi Asosiy Farqlar", 160, 280, { size: 30, color: C.blue, p: k1 });

      // Table Header
      const y0 = 330;
      card(160, y0, 1600, 50, { fill: '#1e293b', col: '#1e293b', p: k1 });
      text("Xususiyat", 200, y0 + 32, { size: 19, weight: 700, color: '#fff' });
      text("PostgreSQL 18", 680, y0 + 32, { size: 19, weight: 700, color: '#93c5fd' });
      text("MySQL 9.7", 1080, y0 + 32, { size: 19, weight: 700, color: '#86efac' });
      text("SQLite 3.54", 1460, y0 + 32, { size: 19, weight: 700, color: '#d8b4fe' });

      // Row 1
      const y1 = y0 + 60;
      card(160, y1, 1600, 50, { fill: '#fff', col: C.border, p: k1 });
      text("Ko'p jadvalli UPDATE", 200, y1 + 32, { size: 18, weight: 700, color: C.ink });
      text("UPDATE ... FROM", 680, y1 + 32, { size: 17, fam: MONO, color: C.blue });
      text("UPDATE ... JOIN", 1080, y1 + 32, { size: 17, fam: MONO, color: C.green });
      text("UPDATE ... FROM (3.33+)", 1460, y1 + 32, { size: 17, fam: MONO, color: C.purple });

      // Row 2
      const y2 = y1 + 55;
      card(160, y2, 1600, 50, { fill: '#f8fafc', col: C.border, p: k1 });
      text("Ko'p jadvalli DELETE", 200, y2 + 32, { size: 18, weight: 700, color: C.ink });
      text("DELETE ... USING", 680, y2 + 32, { size: 17, fam: MONO, color: C.blue });
      text("DELETE t1 FROM t1 JOIN t2", 1080, y2 + 32, { size: 17, fam: MONO, color: C.green });
      text("Subquery (WHERE IN)", 1460, y2 + 32, { size: 17, fam: MONO, color: C.purple });

      // Row 3
      const y3 = y2 + 55;
      card(160, y3, 1600, 50, { fill: '#fff', col: C.border, p: k1 });
      text("ORDER BY & LIMIT", 200, y3 + 32, { size: 18, weight: 700, color: C.ink });
      text("Faqat Subquery orqali", 680, y3 + 32, { size: 17, color: C.soft });
      text("Ha (to'g'ridan-to'g'ri)", 1080, y3 + 32, { size: 17, weight: 700, color: C.green });
      text("Faqat Subquery orqali", 1460, y3 + 32, { size: 17, color: C.soft });

      // Row 4
      const y4 = y3 + 55;
      card(160, y4, 1600, 50, { fill: '#f8fafc', col: C.border, p: k1 });
      text("Qisqa VALUES kiritish", 200, y4 + 32, { size: 18, weight: 700, color: C.ink });
      text("Chapdan to'ldiradi", 680, y4 + 32, { size: 17, color: C.blue });
      text("Xato (to'liq bo'lishi shart)", 1080, y4 + 32, { size: 17, color: C.red });
      text("Xato (ustunlar mos bo'lishi shart)", 1460, y4 + 32, { size: 17, color: C.red });
    });

    const kDesc = P(t, W('L6', 'belgisidir.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("Har bir ma'lumotlar bazasi o'zining kuchli tomonlariga ega: PostgreSQL ning standartga sodiqligi va moslashuvchan FROM/USING sintaksisi, MySQL ning ORDER BY LIMIT kabi qulayliklari, va SQLite ning soddaligi. Ularning nozik jihatlarini bilish har qanday murakkab loyihada xatosiz kod yozish kafolatidir.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_join_update.s) sIntro(t);
    else if (t < S.mysql_order_limit.s) sMysqlJoinUpdate(t);
    else if (t < S.sqlite_update_from.s) sMysqlOrderLimit(t);
    else if (t < S.dml_pitfalls.s) sSqliteUpdateFrom(t);
    else if (t < S.xulosa.s) sDmlPitfalls(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_join_update.s + 5.0;
    frame(t);
  };
})();
