// SQL 48-bob 3-qism: "Dialektlar" — Sahifalash
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 18) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. MYSQL_OFFSET_VA_ROW_CONSTRUCTOR_SCAN (0 -> 17.37s)
  function sMysqlOffsetVaScan(t) {
    const k = P(t, 0.3, 1.0);
    hand("48-bob. Sahifalash", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL: OFFSET va Qator Konstruktori", 960, 195, { size: 56, align: 'center', p: P(t, 0.6, 1.2), color: C.orange });
    hand("Nega MySQL 9 da (sana, id) > (...) indeks qidiruvini ishlatmadi?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: OFFSET 900000
      card(140, 340, 780, 480, { fill: C.card, col: C.orange, p: kBox });
      text("1. MySQL da OFFSET 900000: 73 ms", 180, 390, { size: 22, weight: 700, color: C.orange, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT id, sana FROM buyurtmalar", 180, 450, { size: 14, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20 OFFSET 900000;", 180, 475, { size: 14, fam: MONO, color: C.ink });

      srect(180, 500, 700, 130, { fill: '#fffbe6', stroke: C.orange });
      text("Limit/Offset: 20/900000 row(s)", 200, 530, { size: 14, weight: 700, fam: MONO, color: C.orange });
      text("  -> Covering index scan on buyurtmalar using b_sana_id", 200, 560, { size: 13, fam: MONO, color: C.ink });
      text("       actual rows=900020 loops=1", 200, 590, { size: 13, fam: MONO, color: C.soft });
      text("Actual Time: 73.2 ms (900k qator o'qildi)", 200, 620, { size: 14, weight: 700, fam: MONO, color: C.orange });

      text("• Xuddi Postgresdagidek: 900 020 ta qator o'qildi.", 180, 660, { size: 16, color: C.ink, fam: UI });
      text("• Vaqt: 73.2 millisekund.", 180, 690, { size: 16, color: C.soft, fam: UI });

      pill("OFFSET 900k: 900 020 qator elandi (73 ms)", 530, 780, C.orange, kBox, 15);

      // O'ng: Qator konstruktori xatosi
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.red, p: kRight });
        text("2. Qator Konstruktori: 90 ms To'liq Skan!", 1040, 390, { size: 22, weight: 700, color: C.red, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("WHERE (sana, id) > ('2025-07-28 08:00:00', 900000);", 1040, 450, { size: 13, fam: MONO, color: C.ink });

        srect(1040, 485, 700, 145, { fill: '#fff2f0', stroke: C.red });
        text("EXPLAIN FORMAT=TRADITIONAL:", 1060, 515, { size: 14, weight: 700, fam: MONO, color: C.red });
        text("type: index | key: b_sana_id | possible_keys: NULL", 1060, 545, { size: 14, weight: 700, fam: MONO, color: C.red });
        text("rows: 900020 | Extra: Using where; Using index", 1060, 575, { size: 13, fam: MONO, color: C.ink });
        text("Actual Time: 90.2 ms (OFFSET dan ham sekin!)", 1060, 605, { size: 14, weight: 700, fam: MONO, color: C.red });

        text("• possible_keys = NULL: Indeks qidiruvga ishlamadi!", 1040, 655, { size: 16, weight: 700, color: C.red, fam: UI });
        text("• Butun indeks o'qilib har qator tekshirildi (90 ms).", 1040, 685, { size: 16, color: C.ink, fam: UI });

        pill("MySQL 9 da qator konstruktori oraliqqa aylanmadi", 1390, 780, C.red, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Kutilmagan xulosa: PostgreSQL da ishlagan (sana, id) > (...) MySQL da sekin to'liq skanga tushdi!", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Bunday holatda MySQL optimizatori uchun shartni boshqacha yozish talab etiladi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. MYSQL_OR_YOZUVI_150X_TEZLASHUV (17.37 -> 36.40s)
  function sMysqlOrTezlashuv(t) {
    heading("2. MYSQL: OR YOZUVI VA 150x TEZLASHUV", "Qator konstruktori o'rniga OR yozilganda nima yuz beradi?", t, TM.scenes.mysql_or_yozuvi_150x_tezlashuv);

    const kBox = P(t, 18.5, 0.8);
    withA(kBox, () => {
      // Chap: OR yozuvi va 0.58 ms
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kBox });
      text("1. OR Bilan Teng Ifodaga Qayta Yozish", 180, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("WHERE sana > '2025-07-28 08:00:00'", 180, 345, { size: 13, fam: MONO, color: C.ink });
      text("   OR (sana = '2025-07-28 08:00:00' AND id > 900000)", 180, 370, { size: 13, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20;", 180, 395, { size: 13, fam: MONO, color: C.ink });

      srect(180, 420, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Covering index range scan on buyurtmalar using b_sana_id", 200, 450, { size: 13, weight: 700, fam: MONO, color: C.green });
      text("  over (sana = '08:00:00' AND 900000 < id) OR ('08:00:00' < sana)", 200, 480, { size: 12, fam: MONO, color: C.blue });
      text("  actual rows=20 loops=1", 200, 510, { size: 13, fam: MONO, color: C.soft });
      text("Actual Time: 0.58 ms (90 ms dan 0.58 ms ga — 150x tez!)", 200, 545, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("MySQL rasmiy hujjati (10.2.1.22):", 180, 605, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• (c2, c3) > (1, 1) ni c2 > 1 OR (c2 = 1 AND c3 > 1) ga", 180, 640, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("  aylantirish indeksdan to'liqroq foydalanishga olib keladi.", 180, 670, { size: 16, color: C.green, fam: UI, weight: 700, wrap: 700 });

      pill("MySQL da OR yozuvi: range scan va 0.58 ms!", 530, 755, C.green, kBox, 15);
    });

    const kDiff = P(t, 28.0, 0.8);
    withA(kDiff, () => {
      // O'ng: PG vs MySQL paradoksi
      card(1000, 240, 780, 560, { fill: C.card, col: C.purple, p: kDiff });
      text("2. Ikki Baza — Ikki Teskari Tavsiya!", 1040, 290, { size: 22, weight: 700, color: C.purple, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 140, { fill: '#e6f7ff', stroke: C.blue });
      text("PostgreSQL 18:", 1060, 370, { size: 16, weight: 700, fam: UI, color: C.blue });
      text("• (sana, id) > (...) -> Index Cond (0.020 ms) ✓", 1060, 400, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("• sana > ... OR ...  -> Filter (29.19 ms) ✗", 1060, 430, { size: 14, fam: MONO, color: C.red });

      srect(1040, 495, 700, 140, { fill: '#fffbe6', stroke: C.orange });
      text("MySQL 9:", 1060, 525, { size: 16, weight: 700, fam: UI, color: C.orange });
      text("• (sana, id) > (...) -> possible_keys NULL (90.2 ms) ✗", 1060, 555, { size: 14, fam: MONO, color: C.red });
      text("• sana > ... OR ...  -> Range Scan (0.58 ms) ✓", 1060, 585, { size: 14, weight: 700, fam: MONO, color: C.green });

      pill("Har bir bazada optimizator har xil ishlaydi", 1390, 755, C.purple, kDiff, 15);
    });

    const kBot = P(t, 32.5, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Xulosa: PostgreSQL da ROW(...), MySQL da esa OR yozuvi to'g'ri tanlovdir!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Ilovangiz qaysi bazada ishlashiga qarab SQL shartini moslashtirish yuqori tezlik garovidir.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. SQLITE_ROW_VALUES_VA_SEARCH (36.40 -> 52.88s)
  function sSqliteRowValues(t) {
    heading("3. SQLITE: ROW VALUES VA SEARCH MEXANIZMI", "SQLite'da qator qiymatlari (Row Values) qanday ishlaydi?", t, TM.scenes.sqlite_row_values_va_search);

    const kBox = P(t, 37.5, 0.8);
    withA(kBox, () => {
      // Chap: SEARCH rejasi
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("1. Row Values: SEARCH Mexanizmi (0.028 ms)", 180, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("EXPLAIN QUERY PLAN SELECT id, sana FROM buyurtmalar", 180, 350, { size: 13, fam: MONO, color: C.ink });
      text("WHERE (sana, id) > ('2025-07-28 08:00:00', 900000)", 180, 375, { size: 13, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20;", 180, 400, { size: 13, fam: MONO, color: C.ink });

      srect(180, 430, 700, 140, { fill: '#e6f7ff', stroke: C.blue });
      text("QUERY PLAN", 200, 460, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("`--SEARCH buyurtmalar USING COVERING INDEX b_sana_id (sana>?)", 200, 490, { size: 13, weight: 700, fam: MONO, color: C.green });
      text("Run Time: 0.000028s (0.028 ms!)", 200, 530, { size: 15, weight: 700, fam: MONO, color: C.green });

      text("SQLite Row Values (3.1-bo'lim):", 180, 590, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• SQLite xuddi Postgres kabi qator konstruktorini qo'llaydi.", 180, 625, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• B-tree indeksi bo'ylab to'g'ridan-to'g'ri qidiruv (SEARCH).", 180, 655, { size: 16, color: C.green, fam: UI, weight: 700, wrap: 700 });

      pill("SQLite da Row Values to'liq optimallashgan (0.028 ms)", 530, 755, C.blue, kBox, 15);
    });

    const kScan = P(t, 44.5, 0.8);
    withA(kScan, () => {
      // O'ng: OFFSET 900k SCAN bo'ldi
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kScan });
      text("2. OFFSET 900000: SCAN Bo'lib 7.7 ms", 1040, 290, { size: 22, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("ORDER BY sana, id LIMIT 20 OFFSET 900000;", 1040, 355, { size: 14, fam: MONO, color: C.ink });

      srect(1040, 390, 700, 140, { fill: '#fffbe6', stroke: C.orange });
      text("QUERY PLAN", 1060, 420, { size: 14, weight: 700, fam: MONO, color: C.orange });
      text("`--SCAN buyurtmalar USING COVERING INDEX b_sana_id", 1060, 450, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("Run Time: 0.007743s (7.7 ms — 275x sekinroq!)", 1060, 490, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("Taqqoslash:", 1040, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• SCAN: Indeks boshidan 900 000 ta yozuvni sanaydi (7.7 ms).", 1040, 595, { size: 16, color: C.red, fam: UI, wrap: 700 });
      text("• SEARCH: Kerakli nuqtaga sakrab darhol qaytadi (0.028 ms).", 1040, 625, { size: 16, color: C.green, fam: UI, weight: 700, wrap: 700 });
      text("• Keyset SQLite da ham 275 baravar ustun!", 1040, 655, { size: 16, color: C.blue, fam: UI, weight: 700, wrap: 700 });

      pill("SQLite da ham keyset OFFSET dan 275 baravar tez", 1390, 755, C.orange, kScan, 15);
    });

    const kBot = P(t, 49.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("SQLite hujjati: Scrolling window (aylanuvchi darcha) uchun keyset eng mukammal yechim!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Mobil va desktop ilovalarda SQLite keyset bilan hatto millionlab yozuvlarda ham sezilarsiz ishlaydi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. SAHIFALASH_UCH_TIZIM_XULOSASI (52.88 -> 73.06s)
  function sSahifalashXulosa(t) {
    heading("4. UCH TIZIM TAQQOSLASH JADVALI VA XULOSA", "PostgreSQL, MySQL va SQLite sahifalash ko'rsatkichlari", t, TM.scenes.sahifalash_uch_tizim_xulosasi);

    const kTable = P(t, 53.5, 0.8);
    withA(kTable, () => {
      card(140, 240, 1640, 570, { fill: C.card, col: C.blue, p: kTable });
      text("Sahifalash Bo'yicha Uch Tizim Qiyosi (1M qatorda)", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      const cols = [
        { label: "Sahifalash Usuli", w: 380, align: 'left' },
        { label: "PostgreSQL 18", w: 410, align: 'left' },
        { label: "MySQL 9", w: 420, align: 'left' },
        { label: "SQLite 3", w: 370, align: 'left' }
      ];
      const rows = [
        ["OFFSET 900 000 (1M qator)", "36.26 ms (900k o'qildi)", "73.20 ms (900k o'qildi)", "7.74 ms (SCAN)"],
        ["Keyset (sana, id) > (?, ?)", "0.020 ms (Index Cond) ✓", "90.20 ms (possible_keys NULL) ✗", "0.028 ms (SEARCH) ✓"],
        ["Keyset sana > ? OR (...)", "29.19 ms (Filter) ✗", "0.58 ms (range scan) ✓", "— (sinalmagan)"],
        ["Rasmiy hujjat tavsiyasi", "Row Constructor (9.25)", "Konstruktorsiz teng ifoda", "Row Values (3.1)"],
        ["Surilish (drift) dan himoya", "100% barqaror (qiymat)", "100% barqaror (qiymat)", "100% barqaror (qiymat)"],
        ["Foydalanish sohasi", "Cheksiz lenta, API kursor", "Cheksiz lenta, API kursor", "Mobil lenta, offlayn kesh"]
      ];

      // Jadval chizish
      const startX = 180, startY = 340;
      srect(startX, startY, 1560, 35, { fill: '#f0f5ff', stroke: C.blue });
      cols.reduce((x, c) => {
        text(c.label, x + 10, startY + 23, { size: 16, weight: 700, fam: UI, color: C.blue });
        return x + c.w;
      }, startX);

      rows.forEach((r, i) => {
        const y = startY + 35 + i * 36;
        if (i % 2 === 1) srect(startX, y, 1560, 36, { fill: '#fafafa', stroke: 'transparent' });
        sline(startX, y + 36, startX + 1560, y + 36, { col: '#e8e8e8', w: 1 });
        let curX = startX;
        r.forEach((cell, j) => {
          const colColor = j === 0 ? C.ink : j === 1 ? C.blue : j === 2 ? C.orange : C.purple;
          const weight = (j === 1 && i === 1) || (j === 2 && i === 2) || (j === 3 && i === 1) ? 700 : 500;
          text(cell, curX + 10, y + 24, { size: 14, weight, fam: j === 0 ? UI : MONO, color: colColor });
          curX += cols[j].w;
        });
      });

      pill("Postgres va SQLite da qator konstruktori, MySQL da OR sharti eng optimal", 960, 770, C.blue, kTable, 16);
    });

    const kFinal = P(t, 63.0, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Bosh tavsiya: Har bir bazada EXPLAIN rejasini tekshirib, eng samarali keyset sintaksisini tanlang!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Bu orqali ilovangiz millionlab foydalanuvchilar oqimida ham barqaror va chaqmoqdek tez ishlaydi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.mysql_offset_va_row_constructor_scan.e) {
      sMysqlOffsetVaScan(t);
    } else if (t < TM.scenes.mysql_or_yozuvi_150x_tezlashuv.e) {
      sMysqlOrTezlashuv(t);
    } else if (t < TM.scenes.sqlite_row_values_va_search.e) {
      sSqliteRowValues(t);
    } else {
      sSahifalashXulosa(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
