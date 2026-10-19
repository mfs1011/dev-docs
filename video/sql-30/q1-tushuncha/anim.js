// SQL 30-bob 1-qism: "Tushuncha" — Rekursiv CTE
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
    hand("30-bob. Rekursiv CTE", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("WITH RECURSIVE Qudrati", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("O'z natijasiga qayta murojaat qiluvchi va ierarxiyalarni yechuvchi mexanizm", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBox = P(t, W('intro', 'rekursiv'), 0.8);
    withA(kBox, () => {
      card(140, 440, 1640, 500, { fill: C.card, col: C.blue, p: kBox });
      pill("Oddiy CTE vs Rekursiv CTE", 960, 490, C.blue, kBox, 22);

      // Left: Oddiy CTE
      card(180, 540, 740, 360, { fill: '#eff6ff', col: C.blue, p: kBox });
      pill("Oddiy CTE (29-bob)", 550, 580, C.blue, kBox, 19);
      text("• Faqat bir martalik vaqtinchalik jadval.", 210, 640, { size: 20, color: C.ink, fam: UI });
      text("• O'z-o'ziga murojaat qila olmaydi.", 210, 690, { size: 20, color: C.ink, fam: UI });
      text("• Ichma-ich ko'milgan subquery'lar o'rnini", 210, 740, { size: 19, color: C.soft, fam: UI });
      text("  bosuvchi sintaktik qulaylik (syntactic sugar).", 210, 780, { size: 19, color: C.soft, fam: UI });
      text("✓ O'qilishi oson, lekin imkoniyati cheklangan.", 210, 840, { size: 20, weight: 700, color: C.blue, fam: UI });

      // Right: Rekursiv CTE
      card(960, 540, 780, 360, { fill: '#f0fdf4', col: C.green, p: kBox });
      pill("WITH RECURSIVE (30-bob)", 1350, 580, C.green, kBox, 19);
      text("• O'zining oldingi qadamdagi natijasiga tayanadi.", 990, 640, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Standart SQL da boshqa hech narsa bilan", 990, 690, { size: 20, color: C.ink, fam: UI });
      text("  yechib bo'lmaydigan muammolarni hal qiladi!", 990, 730, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• Daraxtlar, tashkilot tuzilmasi, izohlar zanjiri,", 990, 785, { size: 19, color: C.soft, fam: UI });
      text("  shaharlararo yo'llar grafigi va sonlar ketma-ketligi.", 990, 825, { size: 19, color: C.soft, fam: UI });
      text("✓ To'liq Turing-mukammal darajadagi kuch!", 990, 870, { size: 20, weight: 700, color: C.green, fam: UI });
    });
  }

  // 2. TUZILISHI
  function sTuzilishi(t) {
    heading("Rekursiv CTE ning Umumiy Tuzilishi (3 Qism)", t, TM.scenes.tuzilishi.s);

    const k = P(t, TM.scenes.tuzilishi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code Template
      card(100, 200, 880, 760, { fill: C.card, col: C.blue, p: k });
      pill("Sintaksis Qolipi", 540, 250, C.blue, k, 19);

      card(140, 310, 800, 400, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE nom (ustunlar) AS (", 170, 350, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("  -- 1. Boshlang'ich qism (Anchor / Seed)", 170, 395, { size: 17, color: '#94a3b8', fam: MONO });
      text("  SELECT id, nom, ota_id, 0 AS daraja", 170, 435, { size: 19, color: '#86efac', fam: MONO });
      text("  FROM xodimlar WHERE ota_id IS NULL", 170, 475, { size: 19, color: '#86efac', fam: MONO });
      text("  UNION ALL", 170, 520, { size: 20, weight: 700, color: '#fbbf24', fam: MONO });
      text("  -- 2. Rekursiv qism (Recursive term)", 170, 560, { size: 17, color: '#94a3b8', fam: MONO });
      text("  SELECT x.id, x.nom, x.ota_id, r.daraja + 1", 170, 600, { size: 19, color: '#c084fc', fam: MONO });
      text("  FROM xodimlar x JOIN nom r ON x.ota_id = r.id", 170, 640, { size: 19, color: '#c084fc', fam: MONO });
      text(")", 170, 680, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 735, 800, 195, { fill: '#f0fdf4', col: C.green, p: k });
      text("-- 3. Tashqi asosiy so'rov:", 170, 775, { size: 18, color: '#64748b', fam: MONO });
      text("SELECT * FROM nom ORDER BY daraja, id;", 170, 820, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("Natija barcha darajadagi bo'g'inlarni to'liq qamrab oladi.", 170, 875, { size: 18, color: C.ink, fam: UI });

      // Right: 3 Component Explanations
      card(1020, 200, 800, 760, { fill: C.card, col: C.purple, p: k });
      pill("3 Asosiy Komponent Vazifasi", 1420, 250, C.purple, k, 19);

      const items = [
        {
          title: "1. Boshlang'ich qism (Non-recursive / Anchor)",
          desc: "Birinchi bo'lib bajariladi. O'ziga hech qachon murojaat qilmaydi. Ierarxiyaning eng yuqori nuqtasini (masalan, ildiz yoki direktor) ajratib oladi.",
          col: C.green,
          bg: '#f0fdf4'
        },
        {
          title: "2. UNION ALL (yoki UNION)",
          desc: "Boshlang'ich natija bilan keyingi barcha qadamlarda chiqqan qatorlarni birlashtiruvchi ko'prik. Takrorlar bo'lmasligi uchun ba'zan UNION qo'llaniladi.",
          col: C.orange,
          bg: '#fffbeb'
        },
        {
          title: "3. Rekursiv qism (Recursive Term)",
          desc: "CTE nomiga FROM bandida faqat bir marta murojaat qiladi. Har gal oldingi qadamda topilgan satrlarning bolalarini (bog'langan qatorlarini) topib beradi.",
          col: C.purple,
          bg: '#faf5ff'
        },
      ];

      items.forEach((it, idx) => {
        const iy = 310 + idx * 210;
        card(1060, iy, 720, 185, { fill: it.bg, col: it.col, p: k });
        text(it.title, 1090, iy + 35, { size: 20, weight: 700, color: it.col, fam: UI });
        text(it.desc, 1090, iy + 90, { size: 18, color: C.ink, fam: UI, wrap: 660, lh: 26 });
      });
    });
  }

  // 3. ALGORITM VA ISHCHI JADVAL
  function sAlgoritm(t) {
    heading("Bajarilish Algoritmi va Ishchi Jadval (Working Table)", t, TM.scenes.algoritm_va_ishchi_jadval.s);

    const k = P(t, TM.scenes.algoritm_va_ishchi_jadval.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.blue, p: k });
      pill("Nomiga Qaramay, Baza Ichida Iteratsiya (Takrorlash) Bajariladi", 960, 250, C.blue, k, 20);

      const steps = [
        {
          step: "0-Qadam: Seed (Anchor)",
          box1: "Boshlang'ich so'rov",
          box2: "Working Table = [Alice (daraja 0)]",
          box3: "Jami natija = [Alice]",
          col: C.blue
        },
        {
          step: "1-Iteratsiya",
          box1: "Rekursiv qism faqat Working Table dagi Alice ni oladi",
          box2: "Yangi Working Table = [Bob, Cindy (daraja 1)]",
          box3: "Jami natija = [Alice, Bob, Cindy]",
          col: C.green
        },
        {
          step: "2-Iteratsiya",
          box1: "Faqat Bob va Cindy ning qo'l ostidagilari topiladi",
          box2: "Yangi Working Table = [Dave, Emma, Fred, Gail]",
          box3: "Jami natija = 7 ta xodim",
          col: C.purple
        },
        {
          step: "3-Iteratsiya (To'xtash)",
          box1: "Dave, Emma, Fred, Gail ning qo'l ostida hech kim yo'q",
          box2: "Yangi Working Table = [] (BO'SH!)",
          box3: "So'rov yakunlanadi va to'liq natija qaytariladi",
          col: C.orange
        },
      ];

      steps.forEach((st, idx) => {
        const sy = 320 + idx * 145;
        card(140, sy, 1640, 125, { fill: '#fff', col: st.col, p: k });
        pill(st.step, 300, sy + 35, st.col, k, 18);

        text(st.box1, 460, sy + 35, { size: 19, weight: 600, color: C.ink, fam: UI });
        text("→", 1020, sy + 35, { size: 24, weight: 700, color: st.col, fam: UI });
        text(st.box2, 1060, sy + 35, { size: 18, color: st.col, weight: 700, fam: MONO });
        text(st.box3, 460, sy + 85, { size: 18, color: C.soft, fam: UI });
      });

      text("Xulosa: Rekursiv so'rov har qadamda avvalgi barcha qatorlarni emas, FAQAT oxirgi chiqqan qatorlarni o'qiydi!", 160, 915, { size: 20, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. DARAXT VA GRAF
  function sDaraxt(t) {
    heading("Ierarxiya Turlari: Daraxt (Tree) va Graf (Graph)", t, TM.scenes.daraxt_va_graf.s);

    const k = P(t, TM.scenes.daraxt_va_graf.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Tree
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. Daraxt (Tree) Ierarxiyasi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("Tashkilot Tuzilmasi (Har kimda 1 ta ota bor):", 170, 345, { size: 18, color: '#94a3b8', fam: UI });
      text("              Alice (Direktor)", 170, 395, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("             /     \\", 170, 435, { size: 20, color: '#64748b', fam: MONO });
      text("          Bob       Cindy", 170, 475, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("         /   \\     /     \\", 170, 515, { size: 20, color: '#64748b', fam: MONO });
      text("      Dave   Emma Fred   Gail", 170, 555, { size: 20, color: '#f8fafc', fam: MONO });

      card(140, 620, 760, 290, { fill: '#eff6ff', col: C.blue, p: k });
      text("Daraxt xususiyatlari:", 170, 665, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Aniq ierarxiya: har bir bo'g'inning 1 ta otasi bor.", 170, 715, { size: 18, color: C.ink, fam: UI });
      text("• Aylana (cycle) bo'lishi mumkin emas.", 170, 765, { size: 18, color: C.ink, fam: UI });
      text("• Misollar: Xodimlar, kategoriyalar daraxti, izohlar zanjiri.", 170, 815, { size: 18, color: C.ink, fam: UI });
      text("• Rekursiya barglarga (oxirgi xodimlarga) yetgach tabiiy to'xtaydi.", 170, 865, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: Graph
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("2. Graf (Graph) Tarmog'i", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("Yo'llar Tarmog'i (Ixtiyoriy bog'lanishlar):", 1070, 345, { size: 18, color: '#94a3b8', fam: UI });
      text("      A ────> B ────> C ────> D", 1070, 420, { size: 22, weight: 700, color: '#c084fc', fam: MONO });
      text("      ^               │", 1070, 470, { size: 22, color: '#f87171', fam: MONO });
      text("      └───────────────┘  (AYLANA: C dan A ga!)", 1070, 520, { size: 20, weight: 700, color: '#f87171', fam: MONO });

      card(1040, 620, 740, 290, { fill: '#faf5ff', col: C.purple, p: k });
      text("Graf xususiyatlari:", 1070, 665, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Tugunlar o'rtasida ko'p yo'nalishli aloqalar mavjud.", 1070, 715, { size: 18, color: C.ink, fam: UI });
      text("• Aylanalar (cycle): A -> B -> C -> A sikli paydo bo'lishi mumkin.", 1070, 765, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Misollar: Shaharlararo yo'llar, do'stlik tarmog'i, marshrutlar.", 1070, 815, { size: 18, color: C.ink, fam: UI });
      text("• Agar himoya chorasi ko'rilmasa, so'rov cheksiz aylanib qoladi!", 1070, 865, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 5. CHUQURLIK VA KENGLIK
  function sTartib(t) {
    heading("Natijalarni Saralash: Kenglik (BFS) vs Chuqurlik (DFS)", t, TM.scenes.chuqurlik_va_kenglik.s);

    const k = P(t, TM.scenes.chuqurlik_va_kenglik.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Breadth-first
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Kenglik Bo'yicha (Breadth-First)", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 270, { fill: '#1e293b', col: '#334155', p: k });
      text("Tartib: Daraja bo'yicha qavatma-qavat", 170, 350, { size: 18, color: '#94a3b8', fam: UI });
      text("1. Alice       (Daraja 0 - Bosh direktor)", 170, 395, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("2. Bob         (Daraja 1 - O'rinbosar)", 170, 440, { size: 19, color: '#93c5fd', fam: MONO });
      text("3. Cindy       (Daraja 1 - O'rinbosar)", 170, 480, { size: 19, color: '#93c5fd', fam: MONO });
      text("4. Dave, Emma, Fred, Gail  (Daraja 2 - Xodimlar)", 170, 525, { size: 18, color: '#cbd5e1', fam: MONO });

      card(140, 610, 760, 300, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qanday olinadi?", 170, 655, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• ORDER BY daraja, name orqali saralanadi.", 170, 705, { size: 18, color: C.ink, fam: UI });
      text("• Avval 0-daraja, so'ng butun 1-daraja, keyin 2-daraja chiqadi.", 170, 755, { size: 18, color: C.ink, fam: UI });
      text("• Algoritm amalda kenglik bo'yicha qator chiqaradi.", 170, 805, { size: 18, color: C.soft, fam: UI });
      text("• PostgreSQL: SEARCH BREADTH FIRST BY name SET tartib", 170, 860, { size: 17, weight: 700, color: C.blue, fam: MONO });

      // Right: Depth-first
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("Chuqurlik Bo'yicha (Depth-First)", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 270, { fill: '#1e293b', col: '#334155', p: k });
      text("Tartib: Har bir shoxni oxirigacha ko'rish", 1070, 350, { size: 18, color: '#94a3b8', fam: UI });
      text("1. Alice", 1070, 395, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("2.    Bob -> Dave -> Emma", 1070, 440, { size: 19, color: '#fbbf24', fam: MONO });
      text("3.    Cindy -> Fred -> Gail", 1070, 480, { size: 19, color: '#c084fc', fam: MONO });
      text("Har bir rahbar ketidan darhol uning jamoasi keladi!", 1070, 525, { size: 18, color: '#94a3b8', fam: UI });

      card(1040, 610, 740, 300, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qanday olinadi?", 1070, 655, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Yo'l (path) ustuni hisoblanib, ORDER BY yol qilinadi.", 1070, 705, { size: 18, color: C.ink, fam: UI });
      text("• 'Alice/Bob/Dave' kabi alfavit tartibi shoxni to'liq beradi.", 1070, 755, { size: 18, color: C.ink, fam: UI });
      text("• Vizual ierarxik menyular uchun aynan DFS eng qulay shakl!", 1070, 805, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• PostgreSQL: SEARCH DEPTH FIRST BY name SET tartib", 1070, 860, { size: 17, weight: 700, color: C.green, fam: MONO });
    });
  }

  // 6. AYLANALAR VA XAVFSIZLIK
  function sAylana(t) {
    heading("Cheksiz Sikllar va Aylanalarni Aniqlash (Cycle Detection)", t, TM.scenes.aylanalar_va_xavfsizlik.s);

    const k = P(t, TM.scenes.aylanalar_va_xavfsizlik.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Threat of cycle
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("Cheksiz Sikl Xavfi (A -> B -> C -> A)", 520, 250, C.red, k, 19);

      card(140, 310, 760, 200, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("Cheksiz aylanish muammosi:", 170, 350, { size: 19, weight: 700, color: '#fca5a5', fam: UI });
      text("Agar grafda A -> B -> C -> A aylanasi bo'lsa,", 170, 395, { size: 18, color: '#fff', fam: UI });
      text("rekursiya hech qachon to'xtamaydi!", 170, 440, { size: 19, weight: 700, color: '#f87171', fam: UI });
      text("Server xotirasi to'ladi va so'rov qulab tushadi.", 170, 480, { size: 18, color: '#fca5a5', fam: UI });

      card(140, 540, 760, 370, { fill: '#fff', col: C.red, p: k });
      text("Himoyalanish choralari:", 170, 585, { size: 21, weight: 700, color: C.red, fam: UI });
      text("1. To'xtash sharti: WHERE qadam < 100", 170, 635, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("   Har qanday rekursiyada xavfsiz chegara qo'yish shart.", 170, 675, { size: 18, color: C.ink, fam: UI });
      text("2. UNION (DISTINCT) dan foydalanish:", 170, 730, { size: 19, weight: 700, color: C.orange, fam: MONO });
      text("   Agar qo'shimcha o'zgaruvchi bo'lmasa, takror tugunlar", 170, 770, { size: 18, color: C.ink, fam: UI });
      text("   tashlanadi va aylana tabiiy ravishda to'xtaydi.", 170, 805, { size: 18, color: C.ink, fam: UI });
      text("3. Ma'lumotlar bazasi chegaralari: MySQL 1000 iteratsiya.", 170, 860, { size: 18, color: C.soft, fam: UI });

      // Right: Path tracking and CYCLE
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("O'tilgan Yo'lni Tekshirish va CYCLE", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("1. Qo'lda massiv / yo'l yuritish:", 1070, 350, { size: 18, color: '#94a3b8', fam: UI });
      text("ARRAY[id] || j.id", 1070, 390, { size: 19, color: '#93c5fd', fam: MONO });
      text("WHERE NOT (j.id = ANY(yol))  -- PG", 1070, 430, { size: 19, color: '#86efac', fam: MONO });
      text("WHERE INSTR(yol, id) = 0     -- MySQL/SQLite", 1070, 470, { size: 19, color: '#fbbf24', fam: MONO });
      text("Yangi tugun o'tilgan yo'lda bor bo'lsa, o'tkazilmaydi!", 1070, 515, { size: 18, color: '#cbd5e1', fam: UI });

      card(1040, 580, 740, 330, { fill: '#f0fdf4', col: C.green, p: k });
      text("2. PostgreSQL 14+ Standart CYCLE:", 1070, 625, { size: 21, weight: 700, color: C.green, fam: UI });
      text("CYCLE nuqta SET aylana USING yol_", 1070, 675, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("• 'aylana' degan boolean ustun ochadi.", 1070, 725, { size: 18, color: C.ink, fam: UI });
      text("• Agar tugun takrorlansa, aylana = true bo'ladi", 1070, 770, { size: 18, color: C.ink, fam: UI });
      text("  va shu nuqtadan so'ng rekursiya to'xtatiladi.", 1070, 810, { size: 18, color: C.ink, fam: UI });
      text("✓ Eng toza, standart va qulay yechim!", 1070, 865, { size: 20, weight: 700, color: C.green, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.tuzilishi.s) {
      sIntro(t);
    } else if (t < TM.scenes.algoritm_va_ishchi_jadval.s) {
      sTuzilishi(t);
    } else if (t < TM.scenes.daraxt_va_graf.s) {
      sAlgoritm(t);
    } else if (t < TM.scenes.chuqurlik_va_kenglik.s) {
      sDaraxt(t);
    } else if (t < TM.scenes.aylanalar_va_xavfsizlik.s) {
      sTartib(t);
    } else {
      sAylana(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
