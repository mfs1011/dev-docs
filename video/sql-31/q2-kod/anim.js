// SQL 31-bob 2-qism: "Kod" — PostgreSQL 18 da Window funksiyalar amaliyoti
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

  // 1. KIRISH
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("31-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Window Funksiyalar", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("empsalary jadvali: bo'lim o'rtachasi, reytinglar, running total va lag/lead", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'maoshlari'), 0.8);
    withA(kCards, () => {
      // 3 Department cards preview
      const deps = [
        { name: "develop bo'limi (5 ta xodim)", rows: ["emp  8 | 6000", "emp 10 | 5200", "emp 11 | 5200", "emp  9 | 4500", "emp  7 | 4200"], col: C.blue },
        { name: "personnel bo'limi (2 ta xodim)", rows: ["emp  2 | 3900", "emp  5 | 3500"], col: C.green },
        { name: "sales bo'limi (3 ta xodim)", rows: ["emp  1 | 5000", "emp  3 | 4800", "emp  4 | 4800"], col: C.purple },
      ];

      deps.forEach((d, i) => {
        const bx = 100 + i * 585;
        card(bx, 440, 555, 500, { fill: C.card, col: d.col, p: kCards });
        pill(d.name, bx + 277, 490, d.col, kCards, 20);

        text("empno | salary", bx + 40, 560, { size: 19, weight: 700, color: d.col, fam: MONO });
        text("------+-------", bx + 40, 590, { size: 19, color: '#94a3b8', fam: MONO });

        d.rows.forEach((r, ri) => {
          text(r, bx + 40, 635 + ri * 45, { size: 19, weight: 600, color: C.ink, fam: MONO });
        });
      });
    });
  }

  // 2. BO'LIM O'RTACHASI VA OVER
  function sOrtacha(t) {
    heading("Har Qator Yonida Bo'lim O'rtachasi: avg() OVER", t, TM.scenes.bolim_ortachasi_va_over.s);

    const k = P(t, TM.scenes.bolim_ortachasi_va_over.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("PARTITION BY Bilan Bo'lim O'rtachasi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT depname, empno, salary,", 170, 355, { size: 19, color: '#f8fafc', fam: MONO });
      text("       round(avg(salary) OVER (", 170, 395, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("           PARTITION BY depname", 170, 435, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("       )) AS ortacha", 170, 475, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("FROM empsalary ORDER BY depname, empno;", 170, 510, { size: 18, color: '#cbd5e1', fam: MONO });

      card(140, 560, 760, 370, { fill: '#eff6ff', col: C.blue, p: k });
      text("Asosiy afzalligi:", 170, 605, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("• GROUP BY bo'lganda 10 ta qator 3 taga qisqarib ketardi.", 170, 660, { size: 18, color: C.ink, fam: UI });
      text("• Window funksiya barcha 10 ta xodim qatorini saqladi!", 170, 710, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• develop xodimlari yonida: 5020", 170, 760, { size: 18, color: C.ink, fam: UI });
      text("• personnel xodimlari yonida: 3700", 170, 805, { size: 18, color: C.ink, fam: UI });
      text("• sales xodimlari yonida: 4867", 170, 850, { size: 18, color: C.ink, fam: UI });
      text("✓ O'z bo'limi ko'rsatkichlari bilan solishtirish juda oson!", 170, 900, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: psql Output
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Chiqishi: 10 Rows Saqlandi", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 570, { fill: '#1e293b', col: '#334155', p: k });
      text("  depname  | empno | salary | ortacha ", 1070, 350, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("-----------+-------+--------+---------", 1070, 380, { size: 18, color: '#64748b', fam: MONO });

      const res = [
        " develop   |     7 |   4200 |    5020",
        " develop   |     8 |   6000 |    5020",
        " develop   |     9 |   4500 |    5020",
        " develop   |    10 |   5200 |    5020",
        " develop   |    11 |   5200 |    5020",
        " personnel |     2 |   3900 |    3700",
        " personnel |     5 |   3500 |    3700",
        " sales     |     1 |   5000 |    4867",
        " sales     |     3 |   4800 |    4867",
        " sales     |     4 |   4800 |    4867",
      ];
      res.forEach((r, ri) => {
        text(r, 1070, 415 + ri * 40, { size: 18, weight: 600, color: '#f8fafc', fam: MONO });
      });
      text("(10 rows)", 1070, 840, { size: 16, color: '#94a3b8', fam: MONO });
    });
  }

  // 3. REYTING VA WINDOW
  function sReyting(t) {
    heading("row_number, rank, dense_rank va WINDOW Bandi", t, TM.scenes.reyting_va_window.s);

    const k = P(t, TM.scenes.reyting_va_window.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code with WINDOW clause
      card(100, 200, 860, 760, { fill: C.card, col: C.purple, p: k });
      pill("WINDOW w AS (...) Qulayligi", 530, 250, C.purple, k, 19);

      card(140, 310, 780, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT depname, empno, salary,", 170, 350, { size: 18, color: '#fff', fam: MONO });
      text("       row_number() OVER w AS rn,", 170, 390, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("       rank()       OVER w AS rnk,", 170, 430, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("       dense_rank() OVER w AS drnk", 170, 470, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM empsalary", 170, 510, { size: 18, color: '#fff', fam: MONO });
      text("WINDOW w AS (PARTITION BY depname", 170, 545, { size: 18, weight: 700, color: '#c084fc', fam: MONO });
      text("             ORDER BY salary DESC);", 170, 575, { size: 18, weight: 700, color: '#c084fc', fam: MONO });

      card(140, 620, 780, 310, { fill: '#faf5ff', col: C.purple, p: k });
      text("WINDOW bandining yutug'i:", 170, 665, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Bir xil OVER (PARTITION BY ... ORDER BY ...) matnini", 170, 715, { size: 18, color: C.ink, fam: UI });
      text("  uch marta qayta yozishdan asraydi.", 170, 755, { size: 18, color: C.ink, fam: UI });
      text("• Oynaga 'w' deb nom berib, OVER w deb ishlatiladi.", 170, 805, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("✓ Kod toza, o'qilishi oson va o'zgartirish juda qulay!", 170, 865, { size: 19, weight: 700, color: C.green, fam: UI });

      // Right: develop Department Ties Comparison
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("develop Bo'limida Tenglik Holati (5200 va 5200)", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 320, { fill: '#1e293b', col: '#334155', p: k });
      text("empno | salary | rn | rnk | drnk", 1070, 350, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("------+--------+----+-----+-----", 1070, 385, { size: 19, color: '#64748b', fam: MONO });
      text("    8 |   6000 |  1 |   1 |    1", 1070, 425, { size: 19, color: '#fff', fam: MONO });
      text("   10 |   5200 |  2 |   2 |    2  (Tenglik!)", 1070, 465, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("   11 |   5200 |  3 |   2 |    2  (Tenglik!)", 1070, 505, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("    9 |   4500 |  4 |   4 |    3  (Farq!)", 1070, 545, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("    7 |   4200 |  5 |   5 |    4", 1070, 585, { size: 19, color: '#fff', fam: MONO });

      card(1040, 660, 740, 270, { fill: '#eff6ff', col: C.blue, p: k });
      text("Farqlarni tushunish:", 1070, 705, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• row_number(): qat'iy 1, 2, 3, 4 (tenglarda tasodifiy).", 1070, 755, { size: 18, color: C.ink, fam: UI });
      text("• rank(): ikkalasiga 2 beradi, lekin keyingisi 4 bo'ladi!", 1070, 805, { size: 18, color: C.ink, fam: UI });
      text("• dense_rank(): ikkalasiga 2 beradi va zich 3 deb davom etadi.", 1070, 855, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. TOP 2 VA WHERE XATOSI
  function sTop2(t) {
    heading("Har Bo'limdan Top 2 Xodim va WHERE Xatosi", t, TM.scenes.top2_va_where_xatosi.s);

    const k = P(t, TM.scenes.top2_va_where_xatosi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: WHERE Error
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("XATO: Window Funksiyani WHERE da Filtrlash", 520, 250, C.red, k, 18);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- XATO YOZILISH:", 170, 350, { size: 17, color: '#f87171', fam: MONO });
      text("SELECT depname, empno, salary", 170, 395, { size: 18, color: '#fff', fam: MONO });
      text("FROM empsalary", 170, 435, { size: 18, color: '#fff', fam: MONO });
      text("WHERE row_number() OVER (...) < 3; -- XATO!", 170, 475, { size: 18, weight: 700, color: '#f87171', fam: MONO });

      card(140, 540, 760, 180, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  window functions are not allowed in WHERE", 170, 585, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("LINE 4: WHERE row_number() OVER (...) < 3...", 170, 630, { size: 17, color: '#f87171', fam: MONO });
      text("              ^", 170, 665, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(140, 750, 760, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Sababi: WHERE qatorlarni saralash va oyna", 170, 795, { size: 19, weight: 700, color: C.red, fam: UI });
      text("hisoblaridan OLDIN ishga tushadi.", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("U paytda hali reyting aniqlanmagan bo'ladi!", 170, 875, { size: 18, color: C.soft, fam: UI });

      // Right: Correct Subquery / CTE
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("To'g'ri Yo'l: Subquery yoki CTE Bilan Filtrlash", 1410, 250, C.green, k, 18);

      card(1040, 310, 740, 260, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT depname, empno, salary FROM (", 1070, 350, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("    SELECT depname, empno, salary,", 1070, 390, { size: 18, color: '#cbd5e1', fam: MONO });
      text("           row_number() OVER (PARTITION BY depname", 1070, 430, { size: 18, color: '#86efac', fam: MONO });
      text("                              ORDER BY salary DESC, empno) AS pos", 1070, 470, { size: 18, color: '#86efac', fam: MONO });
      text("    FROM empsalary", 1070, 510, { size: 18, color: '#cbd5e1', fam: MONO });
      text(") AS ss WHERE pos < 3 ORDER BY depname, pos;", 1070, 545, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 600, 740, 330, { fill: '#f0fdf4', col: C.green, p: k });
      text("Natija: Har bo'limdan eng yuqori 2 ta maosh:", 1070, 645, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• develop:   emp 8 (6000), emp 10 (5200)", 1070, 695, { size: 18, color: C.ink, fam: MONO });
      text("• personnel: emp 2 (3900), emp 5 (3500)", 1070, 740, { size: 18, color: C.ink, fam: MONO });
      text("• sales:     emp 1 (5000), emp 3 (4800)", 1070, 785, { size: 18, color: C.ink, fam: MONO });
      text("✓ ORDER BY salary DESC, empno qo'shilgani sababli", 1070, 840, { size: 17, color: C.soft, fam: UI });
      text("  teng maoshlarda natija doimo qat'iy va barqaror!", 1070, 880, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. O'SIB BORUVCHI YIG'INDI
  function sYigindi(t) {
    heading("O'sib Boruvchi Yig'indi: RANGE vs ROWS", t, TM.scenes.osib_boruvchi_yigindi.s);

    const k = P(t, TM.scenes.osib_boruvchi_yigindi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: RANGE (Default)
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("RANGE (Sukut Bo'yicha O'sib Borish)", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 150, { fill: '#1e293b', col: '#334155', p: k });
      text("sum(salary) OVER (ORDER BY salary) AS range_sum", 170, 360, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("-- Teng qatorlar bitta frame bo'ladi!", 170, 410, { size: 17, color: '#94a3b8', fam: MONO });

      card(140, 490, 760, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("empno | salary | range_sum", 170, 525, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("------+--------+----------", 170, 555, { size: 18, color: '#64748b', fam: MONO });
      text("    3 |   4800 |    25700  (Teng: ikkalasiga 25700!)", 170, 595, { size: 18, color: '#fff', fam: MONO });
      text("    4 |   4800 |    25700  (Teng: ikkalasiga 25700!)", 170, 635, { size: 18, color: '#fff', fam: MONO });

      card(140, 715, 760, 215, { fill: '#fffbeb', col: C.orange, p: k });
      text("RANGE qoidasi:", 170, 760, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• Sukut frame joriy qatorning barcha tenglarini oladi.", 170, 805, { size: 18, color: C.ink, fam: UI });
      text("• Shuning uchun maoshi bir xil bo'lgan xodimlarda", 170, 845, { size: 18, color: C.ink, fam: UI });
      text("  yig'indi darhol ularning barchasini qo'shib sakraydi.", 170, 885, { size: 18, color: C.soft, fam: UI });

      // Right: ROWS (Strict row-by-row)
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("ROWS (Qat'iy Qatorma-Qator Yig'ish)", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 150, { fill: '#1e293b', col: '#334155', p: k });
      text("sum(salary) OVER (ORDER BY salary", 1070, 350, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)", 1070, 390, { size: 16, color: '#86efac', fam: MONO });

      card(1040, 490, 740, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("empno | salary | rows_sum", 1070, 525, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("------+--------+---------", 1070, 555, { size: 18, color: '#64748b', fam: MONO });
      text("    4 |   4800 |    20900  (Oldingisi + 4800)", 1070, 595, { size: 18, color: '#fff', fam: MONO });
      text("    3 |   4800 |    25700  (Yana + 4800)", 1070, 635, { size: 18, color: '#fff', fam: MONO });

      card(1040, 715, 740, 215, { fill: '#f0fdf4', col: C.green, p: k });
      text("ROWS qoidasi:", 1070, 760, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• ROWS qatorlarni bittalab ketma-ket qo'shib boradi.", 1070, 805, { size: 18, color: C.ink, fam: UI });
      text("• Natija barqaror bo'lishi uchun ORDER BY da takrorlanmas", 1070, 845, { size: 18, color: C.ink, fam: UI });
      text("  kalit ustun (ORDER BY salary, empno) qo'yish shart!", 1070, 885, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 6. LAG, LEAD VA LAST_VALUE
  function sLag(t) {
    heading("lag, lead va last_value Tuzog'ining Yechimi", t, TM.scenes.lag_lead_va_last_value.s);

    const k = P(t, TM.scenes.lag_lead_va_last_value.s + 0.3, 0.8);
    withA(k, () => {
      // Left: lag and lead output
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. lag() va lead() Bilan Farqlarni Topish", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 340, { fill: '#1e293b', col: '#334155', p: k });
      text("empno | salary | oldingi | farq | keyingi", 170, 350, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("------+--------+---------+------+--------", 170, 380, { size: 18, color: '#64748b', fam: MONO });
      text("    5 |   3500 |    NULL | NULL |    3900", 170, 420, { size: 18, color: '#fff', fam: MONO });
      text("    2 |   3900 |    3500 | +400 |    4200", 170, 460, { size: 18, color: '#86efac', fam: MONO });
      text("    7 |   4200 |    3900 | +300 |    4500", 170, 500, { size: 18, color: '#fff', fam: MONO });
      text("   11 |   5200 |    5200 |    0 |    6000", 170, 540, { size: 18, color: '#fff', fam: MONO });
      text("    8 |   6000 |    5200 | +800 |       0", 170, 580, { size: 18, color: '#86efac', fam: MONO });
      text("-- lead(salary, 1, 0) oxirida sukut 0 qaytardi", 170, 620, { size: 16, color: '#94a3b8', fam: MONO });

      card(140, 680, 760, 250, { fill: '#eff6ff', col: C.blue, p: k });
      text("Foydali jihati:", 170, 725, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• salary - lag(salary): oldingi xodim bilan solishtirish.", 170, 775, { size: 18, color: C.ink, fam: UI });
      text("• lag da 1-qator uchun NULL chiqadi.", 170, 825, { size: 18, color: C.ink, fam: UI });
      text("• lead da 3-argument qilib sukut qiymat (masalan, 0) beriladi.", 170, 875, { size: 18, color: C.green, weight: 700, fam: UI });

      // Right: last_value fix
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. last_value() Frame Kengaytmasi", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("last_value(salary) OVER (", 1070, 350, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("    PARTITION BY depname ORDER BY salary DESC", 1070, 390, { size: 17, color: '#cbd5e1', fam: MONO });
      text("    ROWS BETWEEN UNBOUNDED PRECEDING", 1070, 430, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text("             AND UNBOUNDED FOLLOWING", 1070, 470, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text(") AS eng_kam", 1070, 505, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("-- Butun bo'lak oxirigacha ko'rish shart!", 1070, 545, { size: 16, color: '#94a3b8', fam: MONO });

      card(1040, 620, 740, 310, { fill: '#f0fdf4', col: C.green, p: k });
      text("develop bo'limi natijasi:", 1070, 665, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• eng_kop: 6000 (first_value har qatorda to'g'ri chiqdi).", 1070, 715, { size: 18, color: C.ink, fam: UI });
      text("• last_xato: 6000, 5200, 4500 (sukut frame tuzog'i!).", 1070, 765, { size: 18, color: C.red, fam: UI });
      text("• eng_kam: 4200 (UNBOUNDED FOLLOWING bilan to'g'ri chiqdi!).", 1070, 815, { size: 18, weight: 700, color: C.green, fam: UI });
      text("✓ Har doim last_value ishlatganda frame ni belgilang!", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.bolim_ortachasi_va_over.s) {
      sIntro(t);
    } else if (t < TM.scenes.reyting_va_window.s) {
      sOrtacha(t);
    } else if (t < TM.scenes.top2_va_where_xatosi.s) {
      sReyting(t);
    } else if (t < TM.scenes.osib_boruvchi_yigindi.s) {
      sTop2(t);
    } else if (t < TM.scenes.lag_lead_va_last_value.s) {
      sYigindi(t);
    } else {
      sLag(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
