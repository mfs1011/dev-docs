// SQL 26-bob 2-qism: "Kod" — PostgreSQL 18 da Real Agregatsiya va GROUP BY
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("26-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Amaliy Agregatsiya", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Real terminal: COUNT, SUM, AVG, GROUP BY, HAVING, FILTER va ROLLUP", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g1', 'jadvallarini'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Sinov Jadvallari: guruhlar va baholar", 190, 495, { size: 24, weight: 700, color: C.ink, fam: UI });

      // Table 1
      card(190, 535, 780, 380, { fill: '#f6f9fc', col: C.blue, p: kCards });
      pill("guruhlar Jadvali", 580, 575, C.blue, kCards, 18);
      text("CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar);", 220, 625, { size: 17, color: C.ink, fam: MONO });
      text("INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');", 220, 665, { size: 17, color: C.blue, fam: MONO });
      text("1 | A  -- 3 ta talaba", 220, 725, { size: 18, color: C.green, fam: MONO });
      text("2 | B  -- 2 ta talaba", 220, 765, { size: 18, color: C.green, fam: MONO });
      text("3 | C  -- Talabasi yo'q bo'sh guruh!", 220, 805, { size: 18, weight: 700, color: C.orange, fam: MONO });

      // Table 2
      card(1010, 535, 730, 380, { fill: '#f0fdf4', col: C.green, p: kCards });
      pill("baholar Jadvali", 1375, 575, C.green, kCards, 18);
      text("1 | 1 | Ali     | 85", 1040, 625, { size: 18, color: C.ink, fam: MONO });
      text("2 | 2 | Vali    | 92", 1040, 665, { size: 18, color: C.ink, fam: MONO });
      text("3 | 1 | Sobir   | 90", 1040, 705, { size: 18, color: C.ink, fam: MONO });
      text("4 | 2 | Dilnoza | 88", 1040, 745, { size: 18, color: C.ink, fam: MONO });
      text("5 | 1 | Malika  | NULL -- Bali yo'q!", 1040, 785, { size: 18, color: C.orange, fam: MONO });
      text("6 | NULL | Jasur| 70   -- Guruhi yo'q!", 1040, 825, { size: 18, color: C.purple, fam: MONO });
    });
  }

  // 2. ASOSIY VA BOSH TOPLAM
  function sAsosiyVaBoshToplam(t) {
    heading("Asosiy Agregatlar va Bo'sh To'plam Sinovi", t, TM.scenes.asosiy_va_bosh_toplam.s);

    const k1 = P(t, W('g2', 'kaunt'), 0.5);
    withA(k1, () => {
      // Top: Main aggs
      card(100, 210, 1720, 430, { fill: C.card, col: C.blue, p: k1 });
      pill("6 ta Qatordan Hisoblangan Agregatlar", 960, 255, C.blue, k1, 20);

      text("SELECT count(*), count(ball), count(DISTINCT guruh_id), sum(ball), round(avg(ball), 1), min(ball), max(ball) FROM baholar;", 140, 310, { size: 17, color: C.ink, fam: MONO });

      term(140, 345, 1640, 200, [
        " count | count | count | sum |  avg  | min | max ",
        "-------+-------+-------+-----+-------+-----+-----",
        "     6 |     5 |     2 | 425 |  85.0 |  70 |  92 ",
        "(1 row)"
      ], { title: "psql (PostgreSQL 18.6)" });

      text("• count(*) = 6 (hamma qator), count(ball) = 5 (Malika NULL sanalmadi)", 140, 580, { size: 18, color: C.blue, fam: UI });
      text("• count(DISTINCT guruh_id) = 2 (1 va 2; NULL sanalmadi), avg = 425 / 5 = 85.0!", 140, 615, { size: 18, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('g3', 'nol'), 0.5);
    withA(k2, () => {
      // Bottom: Empty set
      card(100, 670, 1720, 320, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("Bo'sh To'plam: Qator Topilmaganda", 960, 715, C.red, k2, 20);

      text("SELECT count(*), sum(ball) FROM baholar WHERE ball > 100;", 140, 770, { size: 19, weight: 700, color: C.ink, fam: MONO });

      term(140, 810, 800, 160, [
        " count | sum ",
        "-------+-----",
        "     0 |    ",
        "(1 row)"
      ], { title: "psql 18 (WHERE ball > 100)" });

      card(980, 810, 800, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("Xulosa va Yechim:", 1010, 845, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• COUNT(*) = 0 chiqadi", 1010, 885, { size: 18, color: C.ink, fam: UI });
      text("• SUM(ball) = NULL chiqadi (0 emas!)", 1010, 920, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Nol kerak bo'lsa: COALESCE(sum(ball), 0)", 1010, 950, { size: 17, color: C.green, fam: MONO });
    });
  }

  // 3. GROUP BY VA HAVING
  function sGroupByVaHaving(t) {
    heading("GROUP BY va HAVING Amaliyoti", t, TM.scenes.group_by_va_having.s);

    const k1 = P(t, W('g4', 'Grup'), 0.5);
    withA(k1, () => {
      // Left: GROUP BY
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("GROUP BY guruh_id", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 110, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT guruh_id, count(*) AS soni, max(ball)", 170, 350, { size: 18, color: C.ink, fam: MONO });
      text("FROM baholar GROUP BY guruh_id ORDER BY guruh_id;", 170, 385, { size: 18, weight: 700, color: C.blue, fam: MONO });

      term(140, 440, 760, 290, [
        " guruh_id | soni | eng_yuqori ",
        "----------+------+------------",
        "        1 |    3 |         90",
        "        2 |    2 |         92",
        "          |    1 |         70",
        "(3 rows)"
      ], { title: "psql 18 (guruhlash)" });

      text("• 1-guruhda 3 ta, 2-guruhda 2 ta talaba", 140, 760, { size: 19, color: C.ink, fam: UI });
      text("• Jasurning guruhi yo'q (NULL) — u bitta guruh bo'ldi!", 140, 800, { size: 18, color: C.purple, fam: UI });
    });

    const k2 = P(t, W('g5', 'Heving'), 0.5);
    withA(k2, () => {
      // Right: HAVING
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("HAVING count(*) > 1", 1400, 260, C.purple, k2, 20);

      card(1020, 310, 760, 110, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("SELECT guruh_id, count(*) FROM baholar", 1050, 350, { size: 18, color: C.ink, fam: MONO });
      text("GROUP BY guruh_id HAVING count(*) > 1;", 1050, 385, { size: 18, weight: 700, color: C.purple, fam: MONO });

      term(1020, 440, 760, 250, [
        " guruh_id | count ",
        "----------+-------",
        "        1 |     3",
        "        2 |     2",
        "(2 rows)"
      ], { title: "psql 18 (HAVING filtri)" });

      text("• HAVING guruhlangan natijalarni elaydi", 1020, 720, { size: 19, color: C.ink, fam: UI });
      text("• Faqat talabasi 1 tadan ko'p bo'lgan guruhlar qoldi", 1020, 760, { size: 18, color: C.purple, fam: UI });
      text("• Yolg'iz Jasurning NULL guruhi (1 ta) tashlab yuborildi!", 1020, 800, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 4. FUNKSIONAL BOGLANISH VA FILTER
  function sFunksionalBoglanishVaFilter(t) {
    heading("Funksional Bog'liqlik va FILTER Amaliyoti", t, TM.scenes.funksional_boglanish_va_filter.s);

    const k1 = P(t, W('g6', 'Birlamchi'), 0.5);
    withA(k1, () => {
      // Left: Primary key functional dependency
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("Funksional Bog'liqlik: g.id (PRIMARY KEY)", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 130, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("SELECT g.id, g.nom, count(b.id) AS soni", 170, 350, { size: 18, color: C.ink, fam: MONO });
      text("FROM guruhlar g LEFT JOIN baholar b ON b.guruh_id = g.id", 170, 385, { size: 17, color: C.soft, fam: MONO });
      text("GROUP BY g.id ORDER BY g.id;", 170, 415, { size: 18, weight: 700, color: C.green, fam: MONO });

      term(140, 460, 760, 260, [
        " id | nom | soni ",
        "----+-----+------",
        "  1 | A   |    3",
        "  2 | B   |    2",
        "  3 | C   |    0",
        "(3 rows)"
      ], { title: "psql 18 (g.nom funksional bog'liq)" });

      text("• g.nom GROUP BY da yo'q, lekin g.id birlamchi kalit!", 140, 750, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• count(b.id) ishlatildi — bo'sh C guruhi to'g'ri 0 ta bo'ldi!", 140, 790, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g7', 'Filtr'), 0.5);
    withA(k2, () => {
      // Right: FILTER clause
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("FILTER (WHERE shart)", 1400, 260, C.purple, k2, 20);

      card(1020, 310, 760, 130, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("SELECT count(*) AS hammasi,", 1050, 350, { size: 18, color: C.ink, fam: MONO });
      text("       count(*) FILTER (WHERE ball >= 88) AS alochi", 1050, 385, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("FROM baholar;", 1050, 415, { size: 18, color: C.ink, fam: MONO });

      term(1020, 460, 760, 220, [
        " hammasi | alochi ",
        "---------+--------",
        "       6 |      3 ",
        "(1 row)"
      ], { title: "psql 18 (shartli agregat)" });

      text("• Bitta so'rovda bir nechta shartli hisoblar olish mumkin", 1020, 720, { size: 18, color: C.ink, fam: UI });
      text("• 88 dan yuqori: Vali (92), Sobir (90), Dilnoza (88) = 3 ta!", 1020, 760, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("• CASE WHEN ga qaraganda ancha ixcham va toza sintaksis", 1020, 800, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 5. ROLLUP DEMO
  function sRollupDemo(t) {
    heading("PostgreSQL 18: ROLLUP va GROUPING Jamilar", t, TM.scenes.rollup_demo.s);

    const k1 = P(t, W('g8', 'Rollap'), 0.5);
    withA(k1, () => {
      // Left: Query
      card(100, 210, 800, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("GROUP BY ROLLUP (g.nom, b.ism)", 500, 260, C.purple, k1, 20);

      card(130, 310, 740, 200, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT g.nom, b.ism, sum(b.ball),", 150, 355, { size: 18, color: C.ink, fam: MONO });
      text("       grouping(g.nom, b.ism) AS gr", 150, 395, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("FROM baholar b JOIN guruhlar g ON g.id = b.guruh_id", 150, 435, { size: 17, color: C.ink, fam: MONO });
      text("GROUP BY ROLLUP (g.nom, b.ism);", 150, 475, { size: 18, weight: 700, color: C.purple, fam: MONO });

      text("GROUPING (gr) bitmaski:", 140, 550, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• gr = 0: Oddiy qator (ikkala ustun qatnashgan)", 140, 595, { size: 18, color: C.ink, fam: UI });
      text("• gr = 1: Guruh oraliq jamisi (ism qatnashmagan)", 140, 640, { size: 18, weight: 700, color: C.orange, fam: UI });
      text("• gr = 3: Umumiy Grand Total (ikkalasi ham qatnashmagan)", 140, 685, { size: 18, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('g8', 'oraliq'), 0.5);
    withA(k2, () => {
      // Right: Result table
      card(940, 210, 880, 780, { fill: '#f6f9fc', col: C.blue, p: k2 });
      pill("Real ROLLUP Natijasi", 1380, 260, C.blue, k2, 20);

      term(970, 310, 820, 380, [
        " nom |   ism   | sum | gr ",
        "-----+---------+-----+----",
        " A   | Ali     |  85 |  0 ",
        " A   | Malika  |     |  0 ",
        " A   | Sobir   |  90 |  0 ",
        " A   |         | 175 |  1  <-- A guruhi jamisi",
        " B   | Dilnoza |  88 |  0 ",
        " B   | Vali    |  92 |  0 ",
        " B   |         | 180 |  1  <-- B guruhi jamisi",
        "     |         | 355 |  3  <-- UMUMIY GRAND TOTAL!",
        "(8 rows)"
      ], { title: "psql 18 (ROLLUP)" });

      card(970, 720, 820, 230, { fill: '#fff', col: C.green, p: k2 });
      text("Muhim xulosa:", 1000, 765, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Malikaning sum = NULL (chunki bali yo'q edi)", 1000, 810, { size: 18, color: C.soft, fam: UI });
      text("• grouping() funksiyasi haqiqiy NULL bilan jami NULL ni ajratadi!", 1000, 850, { size: 18, color: C.ink, fam: UI });
      text("Keyingi qismda: MySQL va SQLite dialektlari!", 1000, 895, { size: 19, weight: 700, color: C.orange, fam: UI });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.asosiy_va_bosh_toplam.s) {
      sIntro(t);
    } else if (t < TM.scenes.group_by_va_having.s) {
      sAsosiyVaBoshToplam(t);
    } else if (t < TM.scenes.funksional_boglanish_va_filter.s) {
      sGroupByVaHaving(t);
    } else if (t < TM.scenes.rollup_demo.s) {
      sFunksionalBoglanishVaFilter(t);
    } else {
      sRollupDemo(t);
    }
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.group_by_va_having.s + 3.0);
  };
})();
