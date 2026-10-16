// SQL 26-bob 3-qism: "Dialektlar" — MySQL va SQLite da Agregatsiya Farqlari
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
    hand("26-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Agregatsiya Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ONLY_FULL_GROUP_BY, GROUP_CONCAT, Bare Columns va TOTAL xulqi", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g1', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• Qat'iy GROUP BY qoidalari", 170, 560, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• string_agg(x, sep ORDER BY)", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• FILTER (WHERE shart) bor", 170, 655, { size: 19, color: C.blue, fam: UI });
      text("• ROLLUP, CUBE, GROUPING SETS", 170, 700, { size: 19, color: C.green, fam: UI });
      text("• any_value() funksiyasi bor", 170, 745, { size: 19, color: C.soft, fam: UI });
      text("• Standard SQL ga to'liq mos", 170, 790, { size: 18, color: C.soft, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• ONLY_FULL_GROUP_BY (sukut)", 710, 560, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• ANY_VALUE(ism) ruxsat etiladi", 710, 610, { size: 19, color: C.blue, fam: UI });
      text("• GROUP_CONCAT (max 1024 bayt)", 710, 655, { size: 19, color: C.orange, fam: UI });
      text("• FILTER YO'Q (CASE WHEN kerak)", 710, 700, { size: 19, color: C.red, fam: UI });
      text("• WITH ROLLUP bor, CUBE YO'Q", 710, 745, { size: 19, color: C.orange, fam: UI });
      text("• Sum/Avg DECIMAL qaytaradi", 710, 790, { size: 18, color: C.soft, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• Bare Columns (yalang'och ustun)", 1290, 560, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• MAX/MIN qatori avtomatik olinadi", 1290, 610, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• FILTER (WHERE shart) bor", 1290, 655, { size: 19, color: C.blue, fam: UI });
      text("• TOTAL() bo'sh to'plamda 0.0 beradi", 1290, 700, { size: 19, color: C.purple, fam: UI });
      text("• group_concat va string_agg bor", 1290, 745, { size: 19, color: C.soft, fam: UI });
      text("• ROLLUP va CUBE sintaksisda YO'Q", 1290, 790, { size: 18, color: C.red, fam: UI });
    });
  }

  // 2. MYSQL XUSUSIYATLARI
  function sMysqlXususiyatlari(t) {
    heading("MySQL: ONLY_FULL_GROUP_BY va GROUP_CONCAT", t, TM.scenes.mysql_xususiyatlari.s);

    const k1 = P(t, W('g2', 'onli'), 0.5);
    withA(k1, () => {
      // Left: ANY_VALUE
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("ONLY_FULL_GROUP_BY va ANY_VALUE()", 520, 260, C.green, k1, 19);

      card(140, 310, 760, 140, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("SELECT guruh_id, ANY_VALUE(ism) AS ism, max(ball)", 170, 355, { size: 18, color: C.ink, fam: MONO });
      text("FROM baholar GROUP BY guruh_id ORDER BY guruh_id;", 170, 395, { size: 18, weight: 700, color: C.green, fam: MONO });

      term(140, 475, 760, 240, [
        "+----------+-------+-----------+",
        "| guruh_id | ism   | max(ball) |",
        "+----------+-------+-----------+",
        "|     NULL | Jasur |        70 |",
        "|        1 | Ali   |        90 |",
        "|        2 | Vali  |        92 |",
        "+----------+-------+-----------+"
      ], { title: "mysql 9.7 (ANY_VALUE)" });

      text("• ONLY_FULL_GROUP_BY sukut bo'yicha yoqilgan", 140, 740, { size: 18, color: C.ink, fam: UI });
      text("• ANY_VALUE guruhdan istalgan qiymatni oladi (Ali chiqdi)", 140, 780, { size: 18, color: C.soft, fam: UI });
      text("⚠️ E'tibor bering: 90 ball Sobirniki bo'lsa ham Ali chiqdi!", 140, 820, { size: 18, weight: 700, color: C.red, fam: UI });
    });

    const k2 = P(t, W('g3', 'string'), 0.5);
    withA(k2, () => {
      // Right: GROUP_CONCAT
      card(980, 210, 840, 780, { fill: C.card, col: C.orange, p: k2 });
      pill("GROUP_CONCAT va Uzunlik Cheklovi", 1400, 260, C.orange, k2, 19);

      card(1020, 310, 760, 140, { fill: '#fffdfa', col: C.orange, p: k2 });
      text("SELECT guruh_id,", 1050, 350, { size: 18, color: C.ink, fam: MONO });
      text("       GROUP_CONCAT(ism ORDER BY ism SEPARATOR ', ')", 1050, 385, { size: 17, weight: 700, color: C.orange, fam: MONO });
      text("FROM baholar GROUP BY guruh_id;", 1050, 420, { size: 18, color: C.ink, fam: MONO });

      term(1020, 475, 760, 240, [
        "+----------+--------------------+",
        "| guruh_id | ismlar             |",
        "+----------+--------------------+",
        "|     NULL | Jasur              |",
        "|        1 | Ali, Malika, Sobir |",
        "|        2 | Dilnoza, Vali      |",
        "+----------+--------------------+"
      ], { title: "mysql 9.7 (GROUP_CONCAT)" });

      text("• MySQL da string_agg YO'Q, GROUP_CONCAT ishlatiladi", 1020, 740, { size: 18, color: C.ink, fam: UI });
      text("• ⚠️ group_concat_max_len: sukut bo'yicha 1024 bayt!", 1020, 780, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  Uzun matnlar jimgina kesilib ketadi (Row cut warning)!", 1020, 820, { size: 18, color: C.red, fam: UI });
    });
  }

  // 3. MYSQL FILTER VA ROLLUP
  function sMysqlFilterVaRollup(t) {
    heading("MySQL: FILTER Sintaksisi Yo'qligi va ROLLUP", t, TM.scenes.mysql_filter_va_rollup.s);

    const k1 = P(t, W('g4', 'filtr'), 0.5);
    withA(k1, () => {
      // Left: FILTER workaround
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("FILTER O'rniga: sum(shart) va CASE", 520, 260, C.blue, k1, 19);

      card(140, 310, 760, 140, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT count(*) FILTER (WHERE ball >= 88) FROM baholar;", 160, 355, { size: 17, color: C.red, fam: MONO });
      text("--> ERROR 1064 (42000): Syntax error near 'FILTER ...'", 160, 400, { size: 17, weight: 700, color: C.red, fam: MONO });

      card(140, 475, 760, 160, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- MySQL da to'g'ri yechimlar:", 160, 510, { size: 17, color: C.soft, fam: MONO });
      text("SELECT count(*) AS hammasi,", 160, 545, { size: 18, color: C.ink, fam: MONO });
      text("       sum(ball >= 88) AS alochi,       -- Mantiqiy 1/0", 160, 580, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("       count(CASE WHEN ball >= 88 THEN 1 END) AS alochi2;", 160, 615, { size: 16, weight: 700, color: C.green, fam: MONO });

      term(140, 660, 760, 220, [
        "+---------+--------+---------+",
        "| hammasi | alochi | alochi2 |",
        "+---------+--------+---------+",
        "|       6 |      3 |       3 |",
        "+---------+--------+---------+"
      ], { title: "mysql 9.7 (shartli agregat)" });

      text("• count(CASE ...) barcha tizimlarda portativ ishlaydi!", 140, 910, { size: 18, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('g5', 'Rollap'), 0.5);
    withA(k2, () => {
      // Right: WITH ROLLUP
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("WITH ROLLUP Bor, CUBE Yo'q", 1400, 260, C.purple, k2, 19);

      card(1020, 310, 760, 160, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("-- MySQL da ikkala yozuv ham ishlaydi:", 1050, 350, { size: 17, color: C.soft, fam: MONO });
      text("GROUP BY g.nom, b.ism WITH ROLLUP;", 1050, 390, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("GROUP BY ROLLUP (g.nom, b.ism); -- Muqobil yozuv", 1050, 430, { size: 18, color: C.ink, fam: MONO });

      text("Muhim cheklovlar:", 1020, 520, { size: 22, weight: 700, color: C.purple, fam: UI });
      text("• GROUPING(g.nom, b.ism) funksiyasi MySQL da bor", 1020, 570, { size: 19, color: C.ink, fam: UI });
      text("• Natija PostgreSQL bilan bir xil (oraliq va grand total)", 1020, 615, { size: 18, color: C.soft, fam: UI });
      text("• LEKIN GROUPING SETS va CUBE MySQL da YO'Q!", 1020, 665, { size: 19, weight: 700, color: C.red, fam: UI });
      text("  (Urinilsa: Secondary engine operation failed xatosi)", 1020, 705, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 4. SQLITE BARE COLUMNS
  function sSqliteBareColumns(t) {
    heading("SQLite: Bare Columns va TOTAL() Funksiyasi", t, TM.scenes.sqlite_bare_columns.s);

    const k1 = P(t, W('g6', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      // Left: Bare columns
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("Bare Columns: MAX/MIN Qatori Olinadi!", 520, 260, C.purple, k1, 19);

      card(140, 310, 760, 130, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT guruh_id, ism, max(ball) FROM baholar", 160, 350, { size: 18, color: C.ink, fam: MONO });
      text("GROUP BY guruh_id ORDER BY guruh_id;", 160, 390, { size: 18, weight: 700, color: C.purple, fam: MONO });

      term(140, 465, 760, 270, [
        "╭──────────┬─────────┬───────────╮",
        "│ guruh_id │ ism     │ max(ball) │",
        "╞══════════╪═════════╪═══════════╡",
        "│          │ Jasur   │        70 │",
        "│        1 │ Sobir   │        90 │ <-- Sobir 90!",
        "│        2 │ Vali    │        92 │ <-- Vali 92!",
        "╰──────────┴─────────┴───────────╯"
      ], { title: "sqlite3 3.54 (MAX qatoridagi ism!)" });

      text("• PG va MySQL rad etgan so'rov SQLite da ishladi!", 140, 765, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• So'rovda bitta MAX bo'lsa, ism aynan o'sha qatordan olinadi!", 140, 805, { size: 18, color: C.ink, fam: UI });
      text("  (min(ball) yozilsa — Ali 85 olinadi)", 140, 840, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g8', 'total'), 0.5);
    withA(k2, () => {
      // Right: TOTAL vs SUM
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("TOTAL() vs SUM() Bo'sh To'plamda", 1400, 260, C.blue, k2, 19);

      card(1020, 310, 760, 130, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("SELECT sum(ball), total(ball)", 1050, 350, { size: 19, color: C.ink, fam: MONO });
      text("FROM baholar WHERE 0; -- Bo'sh to'plam!", 1050, 390, { size: 19, weight: 700, color: C.blue, fam: MONO });

      term(1020, 465, 760, 230, [
        "╭───────────┬─────────────╮",
        "│ sum(ball) │ total(ball) │",
        "╞═══════════╪═════════════╡",
        "│           │         0.0 │",
        "╰───────────┴─────────────╯"
      ], { title: "sqlite3 3.54 (SUM vs TOTAL)" });

      text("• sum(ball) = NULL (SQL standart talabi)", 1020, 725, { size: 18, color: C.ink, fam: UI });
      text("• total(ball) = 0.0 (doim haqiqiy son, hech qachon NULL bo'lmaydi)", 1020, 765, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• FILTER (WHERE ...) SQLite da ham to'liq bor!", 1020, 805, { size: 18, color: C.purple, fam: UI });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Agregatsiya va GROUP BY Qiyosiy Jadvali", t, TM.scenes.xulosa.s);

    const k = P(t, W('g9', 'xatosiz'), 0.5);
    withA(k, () => {
      card(140, 210, 1640, 780, { fill: C.card, col: C.blue, p: k });
      pill("Agregat Funksiyalari Matritsasi", 960, 260, C.blue, k, 22);

      // Table comparison
      card(190, 310, 1540, 470, { fill: '#fff', col: C.pencil, p: k });
      text("Xususiyat / Amaliyot            | PostgreSQL 18      | MySQL 9.7          | SQLite 3.54", 220, 360, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("--------------------------------+--------------------+--------------------+-------------------", 220, 395, { size: 19, color: C.pencil, fam: MONO });
      text("FILTER (WHERE shart)            | Bor                | YO'Q (CASE kerak)  | Bor", 220, 440, { size: 19, color: C.ink, fam: MONO });
      text("Satrlarni birlashtirish         | string_agg         | GROUP_CONCAT (1024)| ikkalasi ham bor", 220, 490, { size: 19, color: C.ink, fam: MONO });
      text("Bare columns (guruhlanmagan)    | Xato               | ANY_VALUE()        | Ruxsat (MAX/MIN)", 220, 540, { size: 19, color: C.ink, fam: MONO });
      text("Bo'sh to'plamda nol             | coalesce(sum, 0)   | coalesce(sum, 0)   | total() = 0.0", 220, 590, { size: 19, color: C.ink, fam: MONO });
      text("ROLLUP ierarxik jami            | Bor                | Bor (WITH ROLLUP)  | Yo'q", 220, 640, { size: 19, color: C.ink, fam: MONO });
      text("CUBE va GROUPING SETS           | Bor                | YO'Q               | Yo'q", 220, 690, { size: 19, color: C.ink, fam: MONO });

      marker(190, 810, 1540 * eio(k), 16, C.hl, 1);
      text("26-bob: Agregatsiya va GROUP BY to'liq o'rganildi!", 960, 860, { size: 26, weight: 700, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.mysql_xususiyatlari.s) {
      sIntro(t);
    } else if (t < TM.scenes.mysql_filter_va_rollup.s) {
      sMysqlXususiyatlari(t);
    } else if (t < TM.scenes.sqlite_bare_columns.s) {
      sMysqlFilterVaRollup(t);
    } else if (t < TM.scenes.xulosa.s) {
      sSqliteBareColumns(t);
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
