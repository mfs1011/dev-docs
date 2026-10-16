// SQL 25-bob 2-qism: "Kod" — PostgreSQL 18 da Real Jadvallar va JOIN Amallari
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
    hand("25-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Real Jadvallar va JOIN Amallari", 960, 255, { size: 70, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("INNER, LEFT, RIGHT, FULL, ON vs WHERE hamda LATERAL sinovlari", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g1', 'jadvallarini'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("PostgreSQL 18.6 Sinov Jadvallari: t1 va t2", 190, 495, { size: 24, weight: 700, color: C.ink, fam: UI });

      // Table 1
      card(190, 535, 780, 380, { fill: '#f6f9fc', col: C.blue, p: kCards });
      pill("t1 Jadvali", 580, 575, C.blue, kCards, 18);
      text("CREATE TABLE t1 (num int, name varchar(10));", 220, 625, { size: 18, color: C.ink, fam: MONO });
      text("INSERT INTO t1 VALUES (1,'a'), (2,'b'), (3,'c');", 220, 665, { size: 18, color: C.blue, fam: MONO });
      text(" num | name", 220, 725, { size: 18, weight: 700, color: C.ink, fam: MONO });
      text("-----+------", 220, 755, { size: 18, color: C.pencil, fam: MONO });
      text("   1 | a", 220, 790, { size: 18, color: C.ink, fam: MONO });
      text("   2 | b    -- Jufti yo'q qator!", 220, 825, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("   3 | c", 220, 860, { size: 18, color: C.ink, fam: MONO });

      // Table 2
      card(1010, 535, 730, 380, { fill: '#f0fdf4', col: C.green, p: kCards });
      pill("t2 Jadvali", 1375, 575, C.green, kCards, 18);
      text("CREATE TABLE t2 (num int, value varchar(10));", 1040, 625, { size: 18, color: C.ink, fam: MONO });
      text("INSERT INTO t2 VALUES (1,'xxx'), (3,'yyy'), (5,'zzz');", 1040, 665, { size: 18, color: C.green, fam: MONO });
      text(" num | value", 1040, 725, { size: 18, weight: 700, color: C.ink, fam: MONO });
      text("-----+-------", 1040, 755, { size: 18, color: C.pencil, fam: MONO });
      text("   1 | xxx", 1040, 790, { size: 18, color: C.ink, fam: MONO });
      text("   3 | yyy", 1040, 825, { size: 18, color: C.ink, fam: MONO });
      text("   5 | zzz  -- Jufti yo'q qator!", 1040, 860, { size: 18, weight: 700, color: C.orange, fam: MONO });
    });
  }

  // 2. INNER JOIN VA NATURAL
  function sInnerVaNatural(t) {
    heading("INNER JOIN: ON, USING va NATURAL Farqlari", t, TM.scenes.inner_va_natural.s);

    const k1 = P(t, W('g2', 'Inner'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("ON t1.num = t2.num", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 110, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("SELECT * FROM t1", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("INNER JOIN t2 ON t1.num = t2.num;", 170, 385, { size: 19, weight: 700, color: C.green, fam: MONO });

      term(140, 440, 760, 270, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "   3 | c    |   3 | yyy",
        "(2 rows)"
      ], { title: "psql (PostgreSQL 18.6)" });

      text("• Faqat ikkala tomonda bor 1 va 3 qaytdi", 140, 750, { size: 19, color: C.ink, fam: UI });
      text("• ON ishlatilganda num ustuni 2 marta chiqadi!", 140, 790, { size: 18, weight: 700, color: C.orange, fam: UI });
    });

    const k2 = P(t, W('g3', 'Yuzing'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("USING (num) va NATURAL", 1400, 260, C.blue, k2, 20);

      card(1020, 310, 760, 110, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("SELECT * FROM t1", 1050, 350, { size: 19, color: C.ink, fam: MONO });
      text("INNER JOIN t2 USING (num);", 1050, 385, { size: 19, weight: 700, color: C.blue, fam: MONO });

      term(1020, 440, 760, 270, [
        " num | name | value ",
        "-----+------+-------",
        "   1 | a    | xxx",
        "   3 | c    | yyy",
        "(2 rows)"
      ], { title: "psql (PostgreSQL 18.6)" });

      text("• USING umumiy ustunni 1 marta ko'rsatadi", 1020, 750, { size: 19, color: C.ink, fam: UI });
      text("• NATURAL JOIN ham bir xil nomli ustunlarni avtomatik oladi", 1020, 790, { size: 18, color: C.soft, fam: UI });
      text("⚠️ Sxema o'zgarsa NATURAL jimgina buzilishi mumkin!", 1020, 830, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 3. TASHQI BIRLASHTIRISHLAR
  function sTashqiBirlashtirishlar(t) {
    heading("Tashqi Birlashtirishlar: LEFT, RIGHT, FULL", t, TM.scenes.tashqi_birlashtirishlar.s);

    const k1 = P(t, W('g4', 'Left'), 0.5);
    withA(k1, () => {
      // LEFT JOIN
      card(100, 210, 540, 780, { fill: '#eff6ff', col: C.blue, p: k1 });
      pill("LEFT JOIN", 370, 260, C.blue, k1, 19);
      text("SELECT * FROM t1", 130, 310, { size: 17, color: C.ink, fam: MONO });
      text("LEFT JOIN t2 ON t1.num = t2.num;", 130, 340, { size: 16, weight: 700, color: C.blue, fam: MONO });

      term(120, 380, 500, 310, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "   2 | b    |     | ",
        "   3 | c    |   3 | yyy",
        "(3 rows)"
      ], { title: "psql 18" });

      text("• t1 ning hammasi qoldi", 130, 730, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("• 2 qatori uchun o'ng tomon NULL", 130, 770, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g4', 'rayt'), 0.5);
    withA(k2, () => {
      // RIGHT JOIN
      card(680, 210, 540, 780, { fill: '#faf5ff', col: C.purple, p: k2 });
      pill("RIGHT JOIN", 950, 260, C.purple, k2, 19);
      text("SELECT * FROM t1", 710, 310, { size: 17, color: C.ink, fam: MONO });
      text("RIGHT JOIN t2 ON t1.num = t2.num;", 710, 340, { size: 16, weight: 700, color: C.purple, fam: MONO });

      term(700, 380, 500, 310, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "   3 | c    |   3 | yyy",
        "     |      |   5 | zzz",
        "(3 rows)"
      ], { title: "psql 18" });

      text("• t2 ning hammasi qoldi", 710, 730, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("• 5 qatori uchun chap tomon NULL", 710, 770, { size: 17, color: C.soft, fam: UI });
    });

    const k3 = P(t, W('g5', 'Full'), 0.5);
    withA(k3, () => {
      // FULL JOIN
      card(1260, 210, 560, 780, { fill: '#fff7ed', col: C.orange, p: k3 });
      pill("FULL JOIN", 1540, 260, C.orange, k3, 19);
      text("SELECT * FROM t1", 1290, 310, { size: 17, color: C.ink, fam: MONO });
      text("FULL JOIN t2 ON t1.num = t2.num;", 1290, 340, { size: 16, weight: 700, color: C.orange, fam: MONO });

      term(1280, 380, 520, 330, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "   2 | b    |     | ",
        "   3 | c    |   3 | yyy",
        "     |      |   5 | zzz",
        "(4 rows)"
      ], { title: "psql 18" });

      text("• Ikkala tomon qatorlari saqlandi (4 ta)", 1290, 750, { size: 18, weight: 700, color: C.orange, fam: UI });
      text("• 2 va 5 qatorlar bo'sh ustunlar bilan chiqdi", 1290, 790, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 4. ON VS WHERE VA FILTRLASH
  function sOnVsWhere(t) {
    heading("ON vs WHERE va Juftsiz Qatorlarni Topish", t, TM.scenes.on_vs_where_va_filtrlash.s);

    const k1 = P(t, W('g6', 'on'), 0.5);
    withA(k1, () => {
      // ON condition
      card(100, 210, 840, 480, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("ON sharti bilan (3 qator)", 520, 255, C.green, k1, 19);
      text("SELECT * FROM t1 LEFT JOIN t2", 130, 305, { size: 17, color: C.ink, fam: MONO });
      text("ON t1.num = t2.num AND t2.value = 'xxx';", 130, 335, { size: 17, weight: 700, color: C.green, fam: MONO });

      term(130, 370, 780, 240, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "   2 | b    |     | ",
        "   3 | c    |     | ",
        "(3 rows)"
      ], { title: "psql 18 (ON sharti)" });

      text("• 3 c qatorining qiymati 'xxx' emas, lekin LEFT bo'lgani uchun qoldi!", 130, 640, { size: 17, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('g6', 'veer'), 0.5);
    withA(k2, () => {
      // WHERE filter
      card(980, 210, 840, 480, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("WHERE filtri bilan (1 qator)", 1400, 255, C.red, k2, 19);
      text("SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num", 1010, 305, { size: 17, color: C.ink, fam: MONO });
      text("WHERE t2.value = 'xxx';", 1010, 335, { size: 17, weight: 700, color: C.red, fam: MONO });

      term(1010, 370, 780, 200, [
        " num | name | num | value ",
        "-----+------+-----+-------",
        "   1 | a    |   1 | xxx",
        "(1 row)"
      ], { title: "psql 18 (WHERE filtri)" });

      text("• WHERE tashqi birlashtirishdan KEYIN ishlaydi", 1010, 600, { size: 17, color: C.ink, fam: UI });
      text("• 2 va 3 qatorlardagi NULL lar elakdan o'tmay yo'qoladi!", 1010, 640, { size: 17, weight: 700, color: C.red, fam: UI });
    });

    const k3 = P(t, W('g7', 'iz'), 0.5);
    withA(k3, () => {
      // Bottom strip: Finding unmatched rows
      card(100, 720, 1720, 270, { fill: '#faf5ff', col: C.purple, p: k3 });
      pill("Juftsiz Qatorlarni Topish (Antijoin)", 960, 760, C.purple, k3, 20);

      text("SELECT t1.* FROM t1 LEFT JOIN t2 ON t1.num = t2.num WHERE t2.num IS NULL;", 140, 815, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("Natija: num: 2, name: 'b' (1 row)  -- t2 da umuman jufti bo'lmagan yagona qator!", 140, 865, { size: 19, color: C.ink, fam: UI });
      text("⚠️ Muhim: IS NULL sharti o'ng jadvalning PRIMARY KEY yoki NOT NULL ustuniga qo'yilishi shart!", 140, 915, { size: 18, color: C.orange, fam: UI });
    });
  }

  // 5. LATERAL DEMO
  function sLateralDemo(t) {
    heading("PostgreSQL 18: LATERAL Subquery Amaliyoti", t, TM.scenes.lateral_demo.s);

    const k1 = P(t, W('g8', 'Lateral'), 0.5);
    withA(k1, () => {
      // Left: Query code
      card(100, 210, 900, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("Guruhlardan TOP 2 Talaba", 550, 260, C.purple, k1, 20);

      card(130, 310, 840, 360, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT g.nom, t.ism, t.ball FROM guruhlar g", 150, 350, { size: 18, color: C.ink, fam: MONO });
      text("LEFT JOIN LATERAL (", 150, 385, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("    SELECT b.ism, b.ball FROM baholar b", 150, 420, { size: 18, color: C.ink, fam: MONO });
      text("    WHERE b.guruh_id = g.id  -- g.id ga murojaat!", 150, 455, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("    ORDER BY b.ball DESC", 150, 490, { size: 18, color: C.ink, fam: MONO });
      text("    LIMIT 2", 150, 525, { size: 18, color: C.ink, fam: MONO });
      text(") AS t ON true", 150, 560, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("ORDER BY g.nom, t.ball DESC;", 150, 595, { size: 18, color: C.ink, fam: MONO });

      text("• Ichki so'rov tashqi 'g' jadvalidan foydalandi", 140, 710, { size: 19, color: C.ink, fam: UI });
      text("• Har bir guruh uchun alohida 2 tadan ball olindi", 140, 750, { size: 18, color: C.soft, fam: UI });
      text("• LATERAL siz bunday so'rov sintaktik xato beradi!", 140, 790, { size: 18, weight: 700, color: C.red, fam: UI });
    });

    const k2 = P(t, W('g8', 'yuqori'), 0.5);
    withA(k2, () => {
      // Right: Result terminal
      card(1040, 210, 780, 780, { fill: '#f6f9fc', col: C.blue, p: k2 });
      pill("Real Terminal Natijasi", 1430, 260, C.blue, k2, 20);

      term(1070, 320, 720, 340, [
        " nom |   ism   | ball ",
        "-----+---------+------",
        " A   | Sobir   |   90",
        " A   | Ali     |   85",
        " B   | Vali    |   92",
        " B   | Dilnoza |   88",
        " C   |         |     ",
        "(5 rows)"
      ], { title: "psql (PostgreSQL 18.6)" });

      card(1070, 690, 720, 260, { fill: '#fff', col: C.green, p: k2 });
      text("Muhim kuzatish:", 1100, 735, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• C guruhida birorta ham talaba yo'q edi", 1100, 780, { size: 18, color: C.ink, fam: UI });
      text("• LEKIN LEFT JOIN LATERAL ... ON true tufayli", 1100, 820, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("  C guruhi ham NULL qiymatlar bilan ro'yxatda qoldi!", 1100, 860, { size: 18, color: C.soft, fam: UI });
      text("  3-qismda: MySQL va SQLite dialektlari!", 1100, 910, { size: 19, weight: 700, color: C.orange, fam: UI });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.inner_va_natural.s) {
      sIntro(t);
    } else if (t < TM.scenes.tashqi_birlashtirishlar.s) {
      sInnerVaNatural(t);
    } else if (t < TM.scenes.on_vs_where_va_filtrlash.s) {
      sTashqiBirlashtirishlar(t);
    } else if (t < TM.scenes.lateral_demo.s) {
      sOnVsWhere(t);
    } else {
      sLateralDemo(t);
    }
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.tashqi_birlashtirishlar.s + 3.0);
  };
})();
