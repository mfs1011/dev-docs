// SQL 25-bob 1-qism: "Tushuncha" — JOIN turlari va bog'lanish mantig'i
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("25-bob. Tushuncha", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da JOIN Turlari va Bog'lanish Mantig'i", 960, 255, { size: 74, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Relyatsion jadvallarni bitta yaxlit natijaga birlashtirish asoslari", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g1', 'joyn'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Relyatsion Modelning Asosi: Jadvallarni Birlashtirish", 190, 495, { size: 25, weight: 700, color: C.ink, fam: UI });

      // Table 1 preview
      card(190, 540, 460, 380, { fill: '#f6f9fc', col: C.blue, p: kCards });
      pill("Jadval 1: t1", 420, 580, C.blue, kCards, 20);
      text("num  | name", 220, 640, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("-----+------", 220, 675, { size: 20, color: C.pencil, fam: MONO });
      text("  1  | a", 220, 715, { size: 20, color: C.ink, fam: MONO });
      text("  2  | b", 220, 755, { size: 20, color: C.ink, fam: MONO });
      text("  3  | c", 220, 795, { size: 20, color: C.ink, fam: MONO });
      text("(3 qator)", 220, 850, { size: 17, color: C.soft, fam: UI });

      // Join operator in middle
      card(680, 540, 560, 380, { fill: '#fffdfa', col: C.orange, p: kCards });
      pill("JOIN Amali", 960, 580, C.orange, kCards, 20);
      text("• Ikki jadval qatorlarini qo'shadi", 710, 645, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• Natija yangi 'birlashgan jadval'", 710, 690, { size: 18, color: C.soft, fam: UI });
      text("• FROM ichida turadi, yana qo'shiladi", 710, 735, { size: 18, color: C.soft, fam: UI });
      text("• Bog'lanish sharti (ON / USING)", 710, 785, { size: 19, color: C.blue, fam: UI });
      text("• Har qanday tur Dekartdan boshlanadi", 710, 835, { size: 18, weight: 700, color: C.orange, fam: UI });

      // Table 2 preview
      card(1270, 540, 470, 380, { fill: '#f0fdf4', col: C.green, p: kCards });
      pill("Jadval 2: t2", 1505, 580, C.green, kCards, 20);
      text("num  | value", 1300, 640, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("-----+-------", 1300, 675, { size: 20, color: C.pencil, fam: MONO });
      text("  1  | xxx", 1300, 715, { size: 20, color: C.ink, fam: MONO });
      text("  3  | yyy", 1300, 755, { size: 20, color: C.ink, fam: MONO });
      text("  5  | zzz", 1300, 795, { size: 20, color: C.ink, fam: MONO });
      text("(3 qator)", 1300, 850, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 2. DEKART KO'PAYTMASI
  function sDekart(t) {
    heading("Dekart Ko'paytmasi va CROSS JOIN", t, TM.scenes.dekart.s);

    const k1 = P(t, W('g2', 'Dekart'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("CROSS JOIN Mantig'i", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 140, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT * FROM t1 CROSS JOIN t2;", 170, 355, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("-- yoki oddiy: FROM t1, t2;", 170, 400, { size: 18, color: C.soft, fam: MONO });

      text("Formula va qoidalar:", 140, 490, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. N x M qator hosil bo'ladi:", 140, 535, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("   3 ta qator (t1) x 3 ta qator (t2) = 9 ta qator natija.", 140, 575, { size: 18, color: C.soft, fam: UI });
      text("2. Hech qanday shart tekshirilmaydi.", 140, 625, { size: 19, color: C.ink, fam: UI });
      text("   Har bir t1 qatori har bir t2 qatori bilan juftlanadi.", 140, 665, { size: 18, color: C.soft, fam: UI });
      text("3. Barcha boshqa JOIN turlari shu to'plamdan", 140, 715, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("   shart bo'yicha saralab yoki qo'shib olinadi.", 140, 755, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g3', 'Kross'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fffdfa', col: C.orange, p: k2 });
      pill("Natija: 3 × 3 = 9 Qator", 1400, 260, C.orange, k2, 20);

      card(1020, 310, 760, 460, { fill: '#fff', col: C.pencil, p: k2 });
      text("t1.num | t1.name | t2.num | t2.value", 1050, 350, { size: 19, weight: 700, color: C.orange, fam: MONO });
      text("-------+---------+--------+---------", 1050, 385, { size: 19, color: C.pencil, fam: MONO });
      text("   1   |    a    |   1    |   xxx", 1050, 425, { size: 18, color: C.ink, fam: MONO });
      text("   1   |    a    |   3    |   yyy", 1050, 465, { size: 18, color: C.ink, fam: MONO });
      text("   1   |    a    |   5    |   zzz", 1050, 505, { size: 18, color: C.ink, fam: MONO });
      text("   2   |    b    |   1    |   xxx", 1050, 545, { size: 18, color: C.ink, fam: MONO });
      text("   2   |    b    |   3    |   yyy", 1050, 585, { size: 18, color: C.ink, fam: MONO });
      text("   2   |    b    |   5    |   zzz", 1050, 625, { size: 18, color: C.ink, fam: MONO });
      text("   3   |    c    |   1    |   xxx", 1050, 665, { size: 18, color: C.ink, fam: MONO });
      text("   3   |    c    |   3    |   yyy", 1050, 705, { size: 18, color: C.ink, fam: MONO });
      text("   3   |    c    |   5    |   zzz", 1050, 745, { size: 18, color: C.ink, fam: MONO });

      text("⚠️ Shartsiz JOIN juda katta resurs talab qilishi mumkin!", 1020, 810, { size: 19, weight: 700, color: C.red, fam: UI });
      text("1000 qator x 1000 qator = 1,000,000 qator!", 1020, 850, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 3. INNER VA TASHQI JOIN TURLARI
  function sIchkiVaTashqi(t) {
    heading("INNER va Tashqi (OUTER) JOIN Turlari", t, TM.scenes.ichki_va_tashqi.s);

    const k1 = P(t, W('g4', 'Inner'), 0.5);
    withA(k1, () => {
      // Top Left: INNER JOIN
      card(100, 210, 840, 360, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("1. INNER JOIN (Ichki)", 520, 255, C.green, k1, 19);
      text("SELECT * FROM t1 INNER JOIN t2 ON t1.num = t2.num;", 130, 305, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("• Faqat shart ROST bo'lgan juftliklar olinadi", 130, 355, { size: 18, color: C.ink, fam: UI });
      text("• t1.num = 1 (xxx) va t1.num = 3 (yyy) chiqadi", 130, 395, { size: 18, color: C.soft, fam: UI });
      text("• Jufti yo'q qatorlar (2 va 5) tashlab yuboriladi (2 qator)", 130, 435, { size: 18, weight: 700, color: C.green, fam: UI });

      // Bottom Left: LEFT JOIN
      card(100, 600, 840, 390, { fill: '#eff6ff', col: C.blue, p: k1 });
      pill("2. LEFT OUTER JOIN (Chap)", 520, 645, C.blue, k1, 19);
      text("SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num;", 130, 695, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("• t1 ning BARCHA qatorlari natijada qoladi", 130, 745, { size: 18, color: C.ink, fam: UI });
      text("• Jufti bo'lsa t2 ustunlari to'ldiriladi", 130, 785, { size: 18, color: C.soft, fam: UI });
      text("• Jufti bo'lmasa: 2 | b | NULL | NULL bilan chiqadi (3 qator)", 130, 825, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("• Eng ko'p ishlatiladigan tashqi birlashtirish turi!", 130, 865, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g5', 'left'), 0.5);
    withA(k2, () => {
      // Top Right: RIGHT JOIN
      card(980, 210, 840, 360, { fill: '#faf5ff', col: C.purple, p: k2 });
      pill("3. RIGHT OUTER JOIN (O'ng)", 1400, 255, C.purple, k2, 19);
      text("SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num;", 1010, 305, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("• t2 ning BARCHA qatorlari natijada qoladi", 1010, 355, { size: 18, color: C.ink, fam: UI });
      text("• Chapda jufti bo'lmagan 5 qatori NULL bilan chiqadi", 1010, 395, { size: 18, color: C.soft, fam: UI });
      text("• T1 RIGHT JOIN T2 = T2 LEFT JOIN T1 (3 qator)", 1010, 435, { size: 18, weight: 700, color: C.purple, fam: UI });

      // Bottom Right: FULL JOIN
      card(980, 600, 840, 390, { fill: '#fff7ed', col: C.orange, p: k2 });
      pill("4. FULL OUTER JOIN (To'liq)", 1400, 645, C.orange, k2, 19);
      text("SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num;", 1010, 695, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("• Ikkala tomonning barcha qatorlari saqlanadi", 1010, 745, { size: 18, color: C.ink, fam: UI });
      text("• Jufti yo'q chap tomon ham, o'ng tomon ham NULL oladi", 1010, 785, { size: 18, color: C.soft, fam: UI });
      text("• Jami 4 qator: 1, 2, 3 va 5 qatorlar natijada bo'ladi", 1010, 825, { size: 18, weight: 700, color: C.orange, fam: UI });
      text("• Diqqat: MySQL da FULL JOIN yo'q (UNION ishlatiladi)!", 1010, 865, { size: 17, weight: 700, color: C.red, fam: UI });
    });
  }

  // 4. ON VA WHERE FARQI
  function sOnVaWhere(t) {
    heading("Tashqi Birlashtirishda ON va WHERE Farqi", t, TM.scenes.on_va_where.s);

    const k1 = P(t, W('g6', 'on'), 0.5);
    withA(k1, () => {
      // Left Card: ON condition
      card(100, 210, 840, 780, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("ON — Birlashtirish Paytida (To'g'ri)", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff', col: C.green, p: k1 });
      text("SELECT * FROM t1", 170, 355, { size: 20, color: C.ink, fam: MONO });
      text("LEFT JOIN t2 ON t1.num = t2.num", 170, 395, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("            AND t2.value = 'xxx';", 170, 435, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("Qanday ishlaydi:", 140, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. ON sharti faqat juftlikni aniqlash uchun ishlaydi.", 140, 555, { size: 19, color: C.ink, fam: UI });
      text("2. 3 c qatorining yyy jufti 'xxx' ga to'g'ri kelmaydi.", 140, 600, { size: 18, color: C.soft, fam: UI });
      text("3. LEKIN LEFT JOIN bo'lgani uchun 3 c qatori", 140, 645, { size: 19, weight: 700, color: C.green, fam: UI });
      text("   NULL lar bilan natijada SAQLANIB QOLADI!", 140, 685, { size: 19, weight: 700, color: C.green, fam: UI });
      text("4. Natijada 3 ta qator chiqadi: 1, 2, 3.", 140, 735, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g7', 'filtr'), 0.5);
    withA(k2, () => {
      // Right Card: WHERE filter
      card(980, 210, 840, 780, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("WHERE — Birlashtirishdan Keyin (Tuzoq)", 1400, 260, C.red, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff', col: C.red, p: k2 });
      text("SELECT * FROM t1", 1050, 355, { size: 20, color: C.ink, fam: MONO });
      text("LEFT JOIN t2 ON t1.num = t2.num", 1050, 395, { size: 20, color: C.ink, fam: MONO });
      text("WHERE t2.value = 'xxx';", 1050, 435, { size: 20, weight: 700, color: C.red, fam: MONO });

      text("Tuzoq qayerda?", 1020, 510, { size: 22, weight: 700, color: C.red, fam: UI });
      text("1. Birlashtirish to'liq bajariladi.", 1020, 555, { size: 19, color: C.ink, fam: UI });
      text("2. Keyin WHERE butun natijani filtrlaydi.", 1020, 600, { size: 18, color: C.soft, fam: UI });
      text("3. Juftsiz qolgan 2 va 3 qatorlaridagi NULL lar", 1020, 645, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   WHERE filtridan O'TMASDAN TASHAB YUBORILADI!", 1020, 685, { size: 19, weight: 700, color: C.red, fam: UI });
      text("4. Natija oddiy INNER JOIN ga aylanib qoladi (1 qator)!", 1020, 735, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 5. LATERAL VA XULOSA
  function sLateralVaXulosa(t) {
    heading("LATERAL Subquery va Xulosa", t, TM.scenes.lateral_va_xulosa.s);

    const k1 = P(t, W('g8', 'Lateral'), 0.5);
    withA(k1, () => {
      card(100, 210, 940, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("LATERAL Nimani O'zgartiradi?", 570, 260, C.purple, k1, 20);

      card(140, 310, 860, 240, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT g.nom, t.ism, t.ball FROM guruhlar g", 170, 355, { size: 19, color: C.ink, fam: MONO });
      text("LEFT JOIN LATERAL (", 170, 395, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("    SELECT b.ism, b.ball FROM baholar b", 170, 435, { size: 19, color: C.ink, fam: MONO });
      text("    WHERE b.guruh_id = g.id  -- chapdagi ustun!", 170, 475, { size: 19, weight: 700, color: C.orange, fam: MONO });
      text("    ORDER BY b.ball DESC LIMIT 2", 170, 515, { size: 19, color: C.ink, fam: MONO });
      text(") AS t ON true;", 170, 555, { size: 19, weight: 700, color: C.purple, fam: MONO });

      text("Muhim xususiyatlar:", 140, 600, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Ichki so'rov tashqi FROM ustunlarini ko'ra oladi", 140, 645, { size: 19, color: C.ink, fam: UI });
      text("• Chap tomonning har bir qatori uchun alohida bajariladi", 140, 690, { size: 18, color: C.soft, fam: UI });
      text("• 'Har bir guruhdan eng yuqori N ta' masalalariga mukammal yechim", 140, 735, { size: 18, color: C.blue, fam: UI });
    });

    const k2 = P(t, W('g9', 'Postgres'), 0.5);
    withA(k2, () => {
      card(1080, 210, 740, 780, { fill: '#f6f9fc', col: C.blue, p: k2 });
      pill("Keyingi Qadamlar", 1450, 260, C.blue, k2, 20);

      card(1120, 320, 660, 420, { fill: '#fff', col: C.blue, p: k2 });
      text("25.2-video darsida:", 1150, 375, { size: 24, weight: 700, color: C.blue, fam: UI });
      text("• PostgreSQL 18 da real jadvallar", 1150, 430, { size: 19, color: C.ink, fam: UI });
      text("• CROSS, INNER, LEFT, RIGHT, FULL", 1150, 480, { size: 19, color: C.ink, fam: UI });
      text("• USING va NATURAL farqlari", 1150, 530, { size: 19, color: C.ink, fam: UI });
      text("• Juftsiz qatorlarni topish (IS NULL)", 1150, 580, { size: 19, color: C.ink, fam: UI });
      text("• LATERAL bilan TOP-N hisoblash", 1150, 630, { size: 19, color: C.ink, fam: UI });

      marker(1120, 770, 660 * eio(k2), 16, C.hl, 1);
      text("PostgreSQL 18 terminalida ko'ramiz!", 1450, 810, { size: 24, weight: 700, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.dekart.s) {
      sIntro(t);
    } else if (t < TM.scenes.ichki_va_tashqi.s) {
      sDekart(t);
    } else if (t < TM.scenes.on_va_where.s) {
      sIchkiVaTashqi(t);
    } else if (t < TM.scenes.lateral_va_xulosa.s) {
      sOnVaWhere(t);
    } else {
      sLateralVaXulosa(t);
    }
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.ichki_va_tashqi.s + 3.0);
  };
})();
