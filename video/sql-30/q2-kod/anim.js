// SQL 30-bob 2-qism: "Kod" — PostgreSQL 18 da Rekursiv CTE amaliyoti
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
    hand("30-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Rekursiv CTE Amaliyoti", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Sonlar ketma-ketligi, tashkilot daraxti, SEARCH va CYCLE imkoniyatlari", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'xodimlar'), 0.8);
    withA(kCards, () => {
      // 2 Tables preview: org and yol
      card(140, 440, 800, 500, { fill: C.card, col: C.blue, p: kCards });
      pill("org (Xodimlar Ierarxiyasi)", 540, 490, C.blue, kCards, 22);

      text("name  | boss", 180, 560, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("------+-------", 180, 590, { size: 20, color: '#94a3b8', fam: MONO });

      const orgRows = [
        "Alice | NULL   (Bosh direktor)",
        "Bob   | Alice  (O'rinbosar)",
        "Cindy | Alice  (O'rinbosar)",
        "Dave  | Bob    (Bob jamoasi)",
        "Emma  | Bob    (Bob jamoasi)",
        "Fred  | Cindy  (Cindy jamoasi)",
        "Gail  | Cindy  (Cindy jamoasi)",
      ];
      orgRows.forEach((r, ri) => {
        text(r, 180, 635 + ri * 40, { size: 18, weight: 600, color: C.ink, fam: MONO });
      });

      card(980, 440, 800, 500, { fill: C.card, col: C.purple, p: kCards });
      pill("yol (Aylanali Graf Tarmog'i)", 1380, 490, C.purple, kCards, 22);

      text("dan | ga", 1020, 560, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("----+---", 1020, 590, { size: 20, color: '#94a3b8', fam: MONO });

      const yolRows = [
        " A  | B",
        " B  | C",
        " C  | A   -- AYLANA! (A -> B -> C -> A)",
        " C  | D",
      ];
      yolRows.forEach((r, ri) => {
        text(r, 1020, 640 + ri * 48, { size: 19, weight: 600, color: ri === 2 ? C.red : C.ink, fam: MONO });
      });

      card(1020, 770, 720, 140, { fill: '#fff5f5', col: C.red, p: kCards });
      text("Xavf: A -> B -> C -> A aylanasi bor!", 1050, 815, { size: 20, weight: 700, color: C.red, fam: UI });
      text("PostgreSQL 18 buni CYCLE bilan qanday to'xtatishini ko'ramiz.", 1050, 860, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 2. SONLAR KETMA-KETLIGI
  function sSonlar(t) {
    heading("1 dan 100 gacha Sonlar Yig'indisi (5050)", t, TM.scenes.sonlar_ketma_ketligi.s);

    const k = P(t, TM.scenes.sonlar_ketma_ketligi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code
      card(100, 200, 880, 760, { fill: C.card, col: C.blue, p: k });
      pill("Sonlar Generatori So'rovi", 540, 250, C.blue, k, 19);

      card(140, 310, 800, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE t(n) AS (", 170, 355, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("    VALUES (1)               -- 0-qadam: 1", 170, 400, { size: 19, color: '#86efac', fam: MONO });
      text("    UNION ALL", 170, 445, { size: 20, weight: 700, color: '#fbbf24', fam: MONO });
      text("    SELECT n + 1 FROM t      -- n-qadam: n + 1", 170, 490, { size: 19, color: '#c084fc', fam: MONO });
      text("    WHERE n < 100            -- To'xtash sharti!", 170, 535, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text(")", 170, 575, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 620, 800, 310, { fill: '#eff6ff', col: C.blue, p: k });
      text("Ishlash mexanizmi:", 170, 665, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("1. Boshlang'ich qism: ishchi jadvalga [1] tushadi.", 170, 715, { size: 18, color: C.ink, fam: UI });
      text("2. Rekursiv qism: [1] olib 1+1=2 qiladi -> ishchi jadval [2].", 170, 765, { size: 18, color: C.ink, fam: UI });
      text("3. Jarayon n = 100 bo'lguncha davom etadi.", 170, 815, { size: 18, color: C.ink, fam: UI });
      text("4. 100-qadamda WHERE n < 100 filtridan hech narsa o'tmaydi!", 170, 865, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: Query & psql Output
      card(1020, 200, 800, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Natijasi: sum(n)", 1420, 250, C.green, k, 19);

      card(1060, 310, 720, 160, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT sum(n) FROM t;", 1090, 360, { size: 22, weight: 700, color: '#86efac', fam: MONO });
      text("psql (PostgreSQL 18.6)", 1090, 420, { size: 16, color: '#94a3b8', fam: MONO });

      card(1060, 500, 720, 210, { fill: '#0f172a', col: '#334155', p: k });
      text(" sum  ", 1090, 545, { size: 22, weight: 700, color: '#86efac', fam: MONO });
      text("------", 1090, 580, { size: 22, color: '#64748b', fam: MONO });
      text(" 5050", 1090, 620, { size: 26, weight: 700, color: '#fbbf24', fam: MONO });
      text("(1 row)", 1090, 665, { size: 17, color: '#94a3b8', fam: MONO });

      card(1060, 740, 720, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("Gauss formulasi: 100 * 101 / 2 = 5050", 1090, 785, { size: 21, weight: 700, color: C.green, fam: MONO });
      text("• Jadvalsiz, sof xotirada 100 ta qator generatsiya qilindi.", 1090, 835, { size: 18, color: C.ink, fam: UI });
      text("• Kalendar, sanalar ro'yxati va test ma'lumotlari uchun ayni muddao!", 1090, 875, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 3. DARAXT VA DARAJALAR
  function sDaraja(t) {
    heading("Tashkilot Ierarxiyasi va Bo'g'in Darajalari", t, TM.scenes.daraxt_va_darajalar.s);

    const k = P(t, TM.scenes.daraxt_va_darajalar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL
      card(100, 200, 880, 760, { fill: C.card, col: C.blue, p: k });
      pill("Darajalarni Hisoblovchi Rekursiv CTE", 540, 250, C.blue, k, 19);

      card(140, 310, 800, 360, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE ostida(name, daraja) AS (", 170, 350, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("  SELECT name, 0", 170, 395, { size: 19, color: '#86efac', fam: MONO });
      text("  FROM org WHERE boss IS NULL  -- Alice (Ildiz)", 170, 435, { size: 18, color: '#cbd5e1', fam: MONO });
      text("  UNION ALL", 170, 480, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("  SELECT o.name, u.daraja + 1", 170, 525, { size: 19, color: '#c084fc', fam: MONO });
      text("  FROM org o JOIN ostida u", 170, 565, { size: 19, color: '#c084fc', fam: MONO });
      text("    ON o.boss = u.name        -- Bo'ysunuvchilar", 170, 605, { size: 18, color: '#cbd5e1', fam: MONO });
      text(")", 170, 645, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 700, 800, 230, { fill: '#eff6ff', col: C.blue, p: k });
      text("Daraja hisoblash qadami:", 170, 745, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• 0-daraja: Alice (rahbari yo'q bo'lgan yagona rahbar).", 170, 790, { size: 18, color: C.ink, fam: UI });
      text("• 1-daraja: o.boss = 'Alice' bo'lgan Bob va Cindy (0 + 1 = 1).", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("• 2-daraja: Bob va Cindy qo'l ostidagi 4 ta xodim (1 + 1 = 2).", 170, 880, { size: 18, color: C.ink, fam: UI });

      // Right: Terminal Output
      card(1020, 200, 800, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Natijasi: ORDER BY daraja, name", 1420, 250, C.green, k, 19);

      card(1060, 310, 720, 420, { fill: '#1e293b', col: '#334155', p: k });
      text(" name  | daraja ", 1090, 350, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("-------+--------", 1090, 385, { size: 20, color: '#64748b', fam: MONO });
      text(" Alice |      0  (Bosh direktor)", 1090, 425, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text(" Bob   |      1  (O'rinbosar)", 1090, 465, { size: 19, color: '#93c5fd', fam: MONO });
      text(" Cindy |      1  (O'rinbosar)", 1090, 505, { size: 19, color: '#93c5fd', fam: MONO });
      text(" Dave  |      2  (Xodim)", 1090, 545, { size: 19, color: '#fff', fam: MONO });
      text(" Emma  |      2  (Xodim)", 1090, 585, { size: 19, color: '#fff', fam: MONO });
      text(" Fred  |      2  (Xodim)", 1090, 625, { size: 19, color: '#fff', fam: MONO });
      text(" Gail  |      2  (Xodim)", 1090, 665, { size: 19, color: '#fff', fam: MONO });
      text("(7 rows)", 1090, 700, { size: 16, color: '#94a3b8', fam: MONO });

      card(1060, 755, 720, 175, { fill: '#f0fdf4', col: C.green, p: k });
      text("Ierarxiya chuqurligi ixtiyoriy bo'lishi mumkin!", 1090, 800, { size: 20, weight: 700, color: C.green, fam: UI });
      text("Kompaniyada 10 ta yoki 100 ta daraja bo'lsa ham,", 1090, 845, { size: 18, color: C.ink, fam: UI });
      text("shu 5 qatorli rekursiv kod ularni avtomatik topib beradi.", 1090, 885, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. DARAXT YO'LI VA CHUQURLIK
  function sYol(t) {
    heading("Daraxt Yo'li (Path) va Vizual Indentatsiya", t, TM.scenes.daraxt_yoli_va_chuqurlik.s);

    const k = P(t, TM.scenes.daraxt_yoli_va_chuqurlik.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code
      card(100, 200, 880, 760, { fill: C.card, col: C.purple, p: k });
      pill("Yo'l Yuritish va repeat() Sintaksisi", 540, 250, C.purple, k, 19);

      card(140, 310, 800, 380, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE ostida(name, daraja, yol) AS (", 170, 350, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("  SELECT name, 0, CAST(name AS text)", 170, 395, { size: 18, color: '#86efac', fam: MONO });
      text("  FROM org WHERE boss IS NULL", 170, 435, { size: 18, color: '#cbd5e1', fam: MONO });
      text("  UNION ALL", 170, 475, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("  SELECT o.name, u.daraja + 1,", 170, 515, { size: 18, color: '#c084fc', fam: MONO });
      text("         u.yol || '/' || o.name  -- Yo'l yig'iladi", 170, 555, { size: 18, color: '#c084fc', fam: MONO });
      text("  FROM org o JOIN ostida u ON o.boss = u.name", 170, 595, { size: 18, color: '#cbd5e1', fam: MONO });
      text(")", 170, 635, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("SELECT repeat('   ', daraja) || name AS daraxt,", 170, 665, { size: 17, color: '#fbbf24', fam: MONO });
      text("       yol FROM ostida ORDER BY yol;", 170, 695, { size: 17, color: '#fbbf24', fam: MONO });

      card(140, 720, 800, 210, { fill: '#faf5ff', col: C.purple, p: k });
      text("Nega ORDER BY yol chuqurlik tartibini beradi?", 170, 765, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• 'Alice/Bob/Dave' alfavit bo'yicha 'Alice/Cindy' dan oldin turadi.", 170, 810, { size: 17, color: C.ink, fam: UI });
      text("• Natijada har bir rahbar ostidagi butun shox to'liq chiqadi.", 170, 850, { size: 17, color: C.ink, fam: UI });
      text("• repeat('   ', daraja) esa vizual probelli daraxt yasaydi.", 170, 890, { size: 17, weight: 700, color: C.green, fam: UI });

      // Right: Indented Tree Display
      card(1020, 200, 800, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Chiqishi: Chuqurlik (Depth-First) Daraxti", 1420, 250, C.green, k, 19);

      card(1060, 310, 720, 420, { fill: '#1e293b', col: '#334155', p: k });
      text("   daraxt   |       yol        ", 1090, 350, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("------------+------------------", 1090, 385, { size: 20, color: '#64748b', fam: MONO });
      text(" Alice      | Alice", 1090, 425, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("    Bob     | Alice/Bob", 1090, 465, { size: 19, color: '#93c5fd', fam: MONO });
      text("       Dave | Alice/Bob/Dave", 1090, 505, { size: 19, color: '#f8fafc', fam: MONO });
      text("       Emma | Alice/Bob/Emma", 1090, 545, { size: 19, color: '#f8fafc', fam: MONO });
      text("    Cindy   | Alice/Cindy", 1090, 585, { size: 19, color: '#c084fc', fam: MONO });
      text("       Fred | Alice/Cindy/Fred", 1090, 625, { size: 19, color: '#f8fafc', fam: MONO });
      text("       Gail | Alice/Cindy/Gail", 1090, 665, { size: 19, color: '#f8fafc', fam: MONO });
      text("(7 rows)", 1090, 700, { size: 16, color: '#94a3b8', fam: MONO });

      card(1060, 755, 720, 175, { fill: '#f0fdf4', col: C.green, p: k });
      text("Web va CLI da daraxt chizishning eng toza usuli!", 1090, 800, { size: 20, weight: 700, color: C.green, fam: UI });
      text("Fayllar tizimi kataloglari, forum javoblari va tashkilot", 1090, 845, { size: 18, color: C.ink, fam: UI });
      text("sxemalarini backend da bir zumda tayyorlab beradi.", 1090, 885, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 5. SEARCH VA CYCLE
  function sCycle(t) {
    heading("PostgreSQL 14+: SEARCH va CYCLE Bandlari", t, TM.scenes.search_va_cycle.s);

    const k = P(t, TM.scenes.search_va_cycle.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SEARCH
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. SEARCH DEPTH FIRST: Avtomatik Tartib", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Yo'l ustunini qo'lda yozish shart emas:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SEARCH DEPTH FIRST BY name SET tartib", 170, 395, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("SELECT daraxt, tartib", 170, 440, { size: 19, color: '#86efac', fam: MONO });
      text("FROM ostida ORDER BY tartib;", 170, 480, { size: 19, color: '#86efac', fam: MONO });

      card(140, 570, 760, 360, { fill: '#eff6ff', col: C.blue, p: k });
      text("SEARCH qulayligi:", 170, 615, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• PostgreSQL o'zi tartib ustunini massiv qilib yaratadi:", 170, 665, { size: 18, color: C.ink, fam: UI });
      text("  Alice      -> {(Alice)}", 170, 710, { size: 18, color: C.blue, fam: MONO });
      text("     Bob     -> {(Alice),(Bob)}", 170, 750, { size: 18, color: C.blue, fam: MONO });
      text("        Dave -> {(Alice),(Bob),(Dave)}", 170, 790, { size: 18, color: C.blue, fam: MONO });
      text("• SEARCH BREADTH FIRST kenglik bo'yicha saralaydi.", 170, 845, { size: 18, color: C.soft, fam: UI });
      text("✓ Qo'lda yo'l yasash va qatorlarni birlashtirish shart emas!", 170, 895, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: CYCLE
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. CYCLE: Aylanani Aniqlash va To'xtatish", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 180, { fill: '#1e293b', col: '#334155', p: k });
      text("CYCLE nuqta SET aylana USING yol_", 1070, 350, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("SELECT nuqta, qadam, aylana, yol_ FROM borish;", 1070, 395, { size: 18, color: '#86efac', fam: MONO });
      text("-- A -> B -> C -> A aylanasi xavfsiz to'xtaydi", 1070, 440, { size: 17, color: '#94a3b8', fam: MONO });

      card(1040, 520, 740, 250, { fill: '#0f172a', col: '#334155', p: k });
      text(" nuqta | qadam | aylana |       yol_        ", 1070, 555, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("-------+-------+--------+-------------------", 1070, 585, { size: 17, color: '#64748b', fam: MONO });
      text(" A     |     0 | f      | {(A)}", 1070, 615, { size: 17, color: '#fff', fam: MONO });
      text(" B     |     1 | f      | {(A),(B)}", 1070, 645, { size: 17, color: '#fff', fam: MONO });
      text(" C     |     2 | f      | {(A),(B),(C)}", 1070, 675, { size: 17, color: '#fff', fam: MONO });
      text(" A     |     3 | t      | {(A),(B),(C),(A)} -- TO'XTADI!", 1070, 705, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text(" D     |     3 | f      | {(A),(B),(C),(D)}", 1070, 735, { size: 17, color: '#fff', fam: MONO });

      card(1040, 800, 740, 130, { fill: '#f0fdf4', col: C.green, p: k });
      text("aylana = true bo'lganda rekursiya to'xtaydi!", 1070, 840, { size: 19, weight: 700, color: C.green, fam: UI });
      text("Hech qanday cheksiz sikl va xotira to'lishi xavfi yo'q.", 1070, 880, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 6. SINTAKSIS CHEKLOVLARI
  function sCheklov(t) {
    heading("Rekursiv Qismdagi Qat'iy Cheklovlar", t, TM.scenes.sintaksis_cheklovlari.s);

    const k = P(t, TM.scenes.sintaksis_cheklovlari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Aggregate forbidden
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("1-Cheklov: Agregat Funksiyalar Taqiqlangan!", 520, 250, C.red, k, 18);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- XATO: Rekursiv qismda max() yoki sum():", 170, 350, { size: 17, color: '#f87171', fam: MONO });
      text("WITH RECURSIVE s(n) AS (", 170, 390, { size: 18, color: '#fff', fam: MONO });
      text("  SELECT 1 UNION ALL", 170, 430, { size: 18, color: '#fff', fam: MONO });
      text("  SELECT max(n) + 1 FROM s WHERE n < 3  -- XATO!", 170, 470, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text(")", 170, 500, { size: 18, color: '#fff', fam: MONO });

      card(140, 530, 760, 200, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  aggregate functions are not allowed", 170, 575, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("        in a recursive query's recursive term", 170, 615, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("LINE 1: ...SELECT max(n) + 1 FROM s...", 170, 660, { size: 17, color: '#f87171', fam: MONO });
      text("                  ^", 170, 695, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(140, 750, 760, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Sababi: Agregat butun guruhni hisoblashi kerak,", 170, 795, { size: 18, color: C.ink, fam: UI });
      text("rekursiv qism esa iteratsiyada faqat ishchi jadvaldagi", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("qatorlarni ko'radi. Shu bois agregat va window taqiqlangan.", 170, 875, { size: 18, color: C.soft, fam: UI });

      // Right: LIMIT / ORDER BY forbidden
      card(1000, 200, 820, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("2-Cheklov: PostgreSQL da Ichki LIMIT/ORDER BY Yo'q", 1410, 250, C.red, k, 18);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- XATO: Rekursiv qism ichiga LIMIT qo'yish:", 1070, 350, { size: 17, color: '#f87171', fam: MONO });
      text("WITH RECURSIVE t(n) AS (", 1070, 390, { size: 18, color: '#fff', fam: MONO });
      text("  SELECT 1 UNION ALL", 1070, 430, { size: 18, color: '#fff', fam: MONO });
      text("  SELECT n + 1 FROM t LIMIT 5  -- XATO!", 1070, 470, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text(")", 1070, 500, { size: 18, color: '#fff', fam: MONO });

      card(1040, 530, 740, 200, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  LIMIT in a recursive query", 1070, 575, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("        is not implemented", 1070, 615, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("LINE 1: ...SELECT n + 1 FROM t LIMIT 5...", 1070, 660, { size: 17, color: '#f87171', fam: MONO });
      text("                               ^", 1070, 695, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 750, 740, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("To'g'ri to'xtatish yo'li:", 1070, 795, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• LIMIT o'rniga har doim WHERE shartidan foydalaning!", 1070, 840, { size: 18, color: C.ink, fam: UI });
      text("• Tashqi asosiy SELECT da esa bemalol LIMIT ishlaydi.", 1070, 885, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.sonlar_ketma_ketligi.s) {
      sIntro(t);
    } else if (t < TM.scenes.daraxt_va_darajalar.s) {
      sSonlar(t);
    } else if (t < TM.scenes.daraxt_yoli_va_chuqurlik.s) {
      sDaraja(t);
    } else if (t < TM.scenes.search_va_cycle.s) {
      sYol(t);
    } else if (t < TM.scenes.sintaksis_cheklovlari.s) {
      sCycle(t);
    } else {
      sCheklov(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
