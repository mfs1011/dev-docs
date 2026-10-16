// SQL 27-bob 2-qism: "Kod" — PostgreSQL 18 da Real Subquery Amaliyoti
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
    hand("27-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Amaliy Subquery", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Real terminal: Skalyar, Korrelyatsiya, EXISTS, IN, ANY, ALL va Hosila Jadval", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'guruhlar'), 0.8);
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
      text("1 | 1    | Ali     | 85", 1040, 625, { size: 18, color: C.ink, fam: MONO });
      text("2 | 2    | Vali    | 92", 1040, 665, { size: 18, color: C.ink, fam: MONO });
      text("3 | 1    | Sobir   | 90", 1040, 705, { size: 18, color: C.ink, fam: MONO });
      text("4 | 2    | Dilnoza | 88", 1040, 745, { size: 18, color: C.ink, fam: MONO });
      text("5 | 1    | Malika  | NULL -- Bali yo'q!", 1040, 785, { size: 18, color: C.orange, fam: MONO });
      text("6 | NULL | Jasur   | 70   -- Guruhi yo'q!", 1040, 825, { size: 18, color: C.purple, fam: MONO });
    });
  }

  // 2. SKALYAR
  function sSkalyar(t) {
    heading("Skalyar Subquery va Xatolar Sinovi", t, TM.scenes.skalyar.s);

    const k1 = P(t, TM.scenes.skalyar.s + 0.3, 0.8);
    withA(k1, () => {
      // Left: O'rtachadan yuqori ball
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k1 });
      pill("O'rtachadan Yuqori Ball Olganlar", 520, 250, C.blue, k1, 20);

      card(140, 300, 760, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("SELECT ism, ball FROM baholar", 170, 345, { size: 19, color: C.ink, fam: MONO });
      text("WHERE ball > (SELECT avg(ball) FROM baholar)", 170, 385, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("ORDER BY ball DESC; -- avg = 85.0", 170, 425, { size: 18, color: C.soft, fam: MONO });

      card(140, 480, 760, 240, { fill: '#1e293b', col: '#334155', p: k1 });
      text("   ism   | ball", 170, 525, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("---------+------", 170, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" Vali    |   92", 170, 590, { size: 18, color: '#4ade80', fam: MONO });
      text(" Sobir   |   90", 170, 625, { size: 18, color: '#4ade80', fam: MONO });
      text(" Dilnoza |   88", 170, 660, { size: 18, color: '#4ade80', fam: MONO });
      text("(3 rows) -- Subquery faqat 1 marta hisoblandi", 170, 700, { size: 16, color: '#94a3b8', fam: MONO });

      // Right: Xatolar
      card(1000, 200, 820, 760, { fill: '#fff5f5', col: C.red, p: k1 });
      pill("Qat'iy Skalyar Xatolari", 1410, 250, C.red, k1, 20);

      card(1040, 300, 740, 140, { fill: '#fff', col: C.red, p: k1 });
      text("-- Ko'p qator qaytsa (guruh_id = 1):", 1070, 340, { size: 16, color: C.soft, fam: MONO });
      text("ERROR: more than one row returned by a subquery", 1070, 380, { size: 16, weight: 700, color: C.red, fam: MONO });
      text("       used as an expression", 1070, 410, { size: 16, weight: 700, color: C.red, fam: MONO });

      card(1040, 460, 740, 120, { fill: '#fff', col: C.red, p: k1 });
      text("-- Ko'p ustun qaytsa (SELECT ism, ball):", 1070, 500, { size: 16, color: C.soft, fam: MONO });
      text("ERROR: subquery must return only one column", 1070, 540, { size: 16, weight: 700, color: C.red, fam: MONO });

      card(1040, 600, 740, 150, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- Hech qanday qator topilmasa (id = 99):", 1070, 640, { size: 16, color: C.soft, fam: MONO });
      text("SELECT (SELECT ism FROM baholar WHERE id = 99) AS yoq;", 1070, 675, { size: 16, color: C.ink, fam: MONO });
      text(" yoq | NULL (1 row) -- XATO EMAS!", 1070, 715, { size: 17, weight: 700, color: C.green, fam: MONO });
    });
  }

  // 3. KORRELYATSIYA
  function sKorrelyatsiya(t) {
    heading("Korrelyatsiyalangan Subquery: Har Tashqi Qatorga Qayta Hisoblash", t, TM.scenes.korrelyatsiya.s);

    const k = P(t, TM.scenes.korrelyatsiya.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Har guruhning eng yuqori bali
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("SELECT Ro'yxatida: Har Guruhning Maksimal Bali", 520, 250, C.purple, k, 19);

      card(140, 300, 760, 160, { fill: '#fff', col: C.purple, p: k });
      text("SELECT nom,", 170, 340, { size: 18, color: C.ink, fam: MONO });
      text("  (SELECT max(b.ball) FROM baholar b", 170, 375, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("   WHERE b.guruh_id = g.id) AS eng_yuqori", 170, 410, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("FROM guruhlar g ORDER BY nom;", 170, 445, { size: 18, color: C.ink, fam: MONO });

      card(140, 480, 760, 230, { fill: '#1e293b', col: '#334155', p: k });
      text(" nom | eng_yuqori", 170, 525, { size: 18, weight: 700, color: '#c084fc', fam: MONO });
      text("-----+------------", 170, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" A   |         90", 170, 590, { size: 18, color: '#fff', fam: MONO });
      text(" B   |         92", 170, 625, { size: 18, color: '#fff', fam: MONO });
      text(" C   |            (NULL — bo'sh guruh)", 170, 660, { size: 18, color: '#f59e0b', fam: MONO });

      // Right: WHERE da eng yuqori ballilar
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("WHERE da: O'z Guruhida Yetakchi Bo'lganlar", 1410, 250, C.blue, k, 19);

      card(1040, 300, 740, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT ism, ball FROM baholar b", 1070, 340, { size: 18, color: C.ink, fam: MONO });
      text("WHERE ball = (SELECT max(ball) FROM baholar b2", 1070, 375, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("              WHERE b2.guruh_id = b.guruh_id)", 1070, 410, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("ORDER BY ism;", 1070, 445, { size: 18, color: C.ink, fam: MONO });

      card(1040, 480, 740, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("  ism  | ball", 1070, 525, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("-------+------", 1070, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" Sobir |   90", 1070, 590, { size: 18, color: '#4ade80', fam: MONO });
      text(" Vali  |   92", 1070, 625, { size: 18, color: '#4ade80', fam: MONO });
      text("(2 rows) -- Jasur (guruh_id = NULL) chiqmadi!", 1070, 670, { size: 16, color: '#f59e0b', fam: MONO });
    });
  }

  // 4. EXISTS VA IN
  function sExistsVaIn(t) {
    heading("Talabasi Bor Guruhlarni Aniqlash: EXISTS va IN", t, TM.scenes.exists_va_in.s);

    const k = P(t, TM.scenes.exists_va_in.s + 0.3, 0.8);
    withA(k, () => {
      // Left: EXISTS
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("EXISTS (SELECT 1 ...)", 520, 250, C.green, k, 20);

      card(140, 300, 760, 160, { fill: '#fff', col: C.green, p: k });
      text("SELECT nom FROM guruhlar g", 170, 345, { size: 19, color: C.ink, fam: MONO });
      text("WHERE EXISTS (SELECT 1 FROM baholar b", 170, 385, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("              WHERE b.guruh_id = g.id);", 170, 425, { size: 19, weight: 700, color: C.green, fam: MONO });

      card(140, 480, 760, 210, { fill: '#1e293b', col: '#334155', p: k });
      text(" nom", 170, 525, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("-----", 170, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" A", 170, 590, { size: 18, color: '#fff', fam: MONO });
      text(" B", 170, 625, { size: 18, color: '#fff', fam: MONO });
      text("(2 rows) -- Kamida bitta moslik bo'lsa kifoya!", 170, 665, { size: 16, color: '#94a3b8', fam: MONO });

      // Right: IN
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("id IN (SELECT guruh_id ...)", 1410, 250, C.blue, k, 20);

      card(1040, 300, 740, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT nom FROM guruhlar", 1070, 345, { size: 19, color: C.ink, fam: MONO });
      text("WHERE id IN (SELECT guruh_id FROM baholar);", 1070, 385, { size: 19, weight: 700, color: C.blue, fam: MONO });

      card(1040, 480, 740, 210, { fill: '#1e293b', col: '#334155', p: k });
      text(" nom", 1070, 525, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("-----", 1070, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" A", 1070, 590, { size: 18, color: '#fff', fam: MONO });
      text(" B", 1070, 625, { size: 18, color: '#fff', fam: MONO });
      text("(2 rows) -- A va B bir martadan chiqdi!", 1070, 665, { size: 16, color: '#94a3b8', fam: MONO });

      card(140, 720, 1640, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("Muhim taqqoslash:", 180, 765, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("• Agar INNER JOIN ishlatilsa, A guruhida 3 ta talaba bo'lgani uchun A uch marta chiqardi.", 180, 810, { size: 19, color: C.ink, fam: UI });
      text("• EXISTS va IN esa tashqi qatorni hech qachon takrorlamaydi va faqat 1 martadan chiqaradi!", 180, 855, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. TUZOQ VA ANY/ALL
  function sTuzoqVaAnyAll(t) {
    heading("NOT IN Tuzog'i va ANY / ALL Operatorlari", t, TM.scenes.tuzoq_va_any_all.s);

    const k = P(t, TM.scenes.tuzoq_va_any_all.s + 0.3, 0.8);
    withA(k, () => {
      // Left: NOT IN Trap
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("NOT IN va NULL: Xato vs To'g'ri", 520, 250, C.red, k, 19);

      card(140, 300, 760, 120, { fill: '#ffebeb', col: C.red, p: k });
      text("SELECT nom FROM guruhlar WHERE id NOT IN", 170, 340, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("  (SELECT guruh_id FROM baholar);  --> (0 rows!)", 170, 380, { size: 17, weight: 700, color: C.red, fam: MONO });

      card(140, 440, 760, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("SELECT nom FROM guruhlar g WHERE NOT EXISTS", 170, 480, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("  (SELECT 1 FROM baholar b WHERE b.guruh_id = g.id); --> 'C'", 170, 520, { size: 17, weight: 700, color: C.green, fam: MONO });

      card(140, 580, 760, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("SELECT nom FROM guruhlar WHERE id NOT IN", 170, 620, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("  (SELECT guruh_id FROM baholar WHERE guruh_id IS NOT NULL); --> 'C'", 170, 660, { size: 16, weight: 700, color: C.blue, fam: MONO });

      // Right: ANY and ALL
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("ALL va ANY Natijalari", 1410, 250, C.blue, k, 19);

      card(1040, 300, 740, 160, { fill: '#fff', col: C.green, p: k });
      text("-- A guruhining har bir balidan yuqori:", 1070, 335, { size: 16, color: C.soft, fam: MONO });
      text("WHERE ball > ALL (SELECT ball FROM baholar", 1070, 370, { size: 16, weight: 700, color: C.green, fam: MONO });
      text("                  WHERE guruh_id = 1 AND ball IS NOT NULL);", 1070, 400, { size: 16, color: C.green, fam: MONO });
      text("-> Vali | 92 (1 row) -- NULL filtrlangani uchun to'g'ri ishladi!", 1070, 435, { size: 16, weight: 700, color: C.ink, fam: UI });

      card(1040, 480, 740, 130, { fill: '#fff5f5', col: C.red, p: k });
      text("-- NULL filtrlanmagan ALL:", 1070, 515, { size: 16, color: C.soft, fam: MONO });
      text("WHERE ball > ALL (SELECT ball FROM baholar WHERE guruh_id = 1);", 1070, 550, { size: 15, weight: 700, color: C.red, fam: MONO });
      text("-> (0 rows) -- 92 > NULL noma'lum bo'lib, natija yo'qoldi!", 1070, 585, { size: 16, weight: 700, color: C.red, fam: UI });

      card(1040, 630, 740, 140, { fill: '#f6f9fc', col: C.purple, p: k });
      text("-- B guruhining biron balidan past: < ANY (88, 92)", 1070, 665, { size: 16, color: C.soft, fam: MONO });
      text("WHERE ball < ANY (SELECT ball FROM baholar WHERE guruh_id = 2);", 1070, 700, { size: 15, color: C.purple, fam: MONO });
      text("-> Ali (85), Dilnoza (88), Jasur (70), Sobir (90) — 4 rows!", 1070, 740, { size: 16, weight: 700, color: C.ink, fam: UI });
    });
  }

  // 6. DERIVED VA UPDATE
  function sDerivedVaUpdate(t) {
    heading("Hosila Jadval (Derived Table) va UPDATE", t, TM.scenes.derived_va_update.s);

    const k = P(t, TM.scenes.derived_va_update.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Derived table
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Agregat Ustidan Agregat: AVG(COUNT(*))", 520, 250, C.blue, k, 19);

      card(140, 300, 760, 200, { fill: '#fff', col: C.blue, p: k });
      text("SELECT avg(soni)", 170, 350, { size: 20, color: C.ink, fam: MONO });
      text("FROM (", 170, 395, { size: 20, color: C.blue, fam: MONO });
      text("  SELECT guruh_id, count(*) AS soni", 170, 435, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("  FROM baholar GROUP BY guruh_id", 170, 475, { size: 20, color: C.blue, fam: MONO });
      text(") AS t;", 170, 515, { size: 20, weight: 700, color: C.orange, fam: MONO });

      card(140, 530, 760, 160, { fill: '#1e293b', col: '#334155', p: k });
      text("        avg", 170, 580, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------------------", 170, 615, { size: 20, color: '#64748b', fam: MONO });
      text(" 2.0000000000000000 (1 row)", 170, 655, { size: 20, weight: 700, color: '#4ade80', fam: MONO });

      // Right: UPDATE
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("UPDATE da Subquery Ishlatish", 1410, 250, C.green, k, 19);

      card(1040, 300, 740, 180, { fill: '#fff', col: C.green, p: k });
      text("UPDATE baholar", 1070, 350, { size: 20, color: C.ink, fam: MONO });
      text("SET ball = (SELECT max(ball) FROM baholar)", 1070, 395, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("WHERE id = 5; -- Malikaga eng yuqori ball", 1070, 440, { size: 20, color: C.soft, fam: MONO });

      card(1040, 510, 740, 180, { fill: '#1e293b', col: '#334155', p: k });
      text("UPDATE 1", 1070, 560, { size: 20, color: '#4ade80', fam: MONO });
      text("  ism   | ball", 1070, 605, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+------", 1070, 640, { size: 20, color: '#64748b', fam: MONO });
      text(" Malika |   92 (1 row) -- NULL dan 92 ga o'zgardi!", 1070, 675, { size: 18, color: '#4ade80', fam: MONO });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.skalyar.s) sIntro(t);
    else if (t < TM.scenes.korrelyatsiya.s) sSkalyar(t);
    else if (t < TM.scenes.exists_va_in.s) sKorrelyatsiya(t);
    else if (t < TM.scenes.tuzoq_va_any_all.s) sExistsVaIn(t);
    else if (t < TM.scenes.derived_va_update.s) sTuzoqVaAnyAll(t);
    else sDerivedVaUpdate(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
