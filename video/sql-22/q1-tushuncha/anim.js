// SQL 22-bob 1-qism: "Tushuncha" — SELECT Anatomiyasi va Mantiqiy Bajarilish Tartibi
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("22-bob. SELECT anatomiyasi", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SELECT ning Yozilish Tartibi", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Bandlar qanday yoziladi va nega bajarilish tartibi boshqacha?", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'from,'), 0.8);
    withA(kBadges, () => {
      pill("1. WITH (CTE)", 280, 520, C.purple, kBadges, 20);
      pill("2. SELECT", 560, 520, C.blue, kBadges, 20);
      pill("3. FROM & JOIN", 860, 520, C.green, kBadges, 20);
      pill("4. WHERE", 1140, 520, C.red, kBadges, 20);
      pill("5. GROUP BY & HAVING", 1460, 520, C.hl, kBadges, 20);
      pill("6. ORDER BY & LIMIT", 1740, 520, C.blue, kBadges, 20);
    });

    const kCode = P(t, W('L1', 'limit'), 0.8);
    withA(kCode, () => {
      card(180, 600, 1560, 320, { fill: C.card, col: C.blue, p: kCode });
      text("SELECT buyrug'ining odatiy yozilish sintaksisi:", 240, 650, { size: 24, weight: 700, color: C.ink, fam: UI });

      card(240, 680, 680, 210, { fill: '#f6f9fc', col: C.blue, p: kCode });
      text("SELECT ustun1, ustun2 AS alias", 260, 715, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("FROM jadval", 260, 750, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("WHERE shart", 260, 785, { size: 19, weight: 700, color: C.red, fam: MONO });
      text("GROUP BY ustun1 HAVING shart", 260, 820, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("ORDER BY alias DESC LIMIT 10;", 260, 855, { size: 19, weight: 700, color: C.blue, fam: MONO });

      card(960, 680, 740, 210, { fill: '#fff7ed', col: C.hl, p: kCode });
      text("Eng muhim qoida:", 990, 720, { size: 22, weight: 700, color: C.red, fam: UI });
      text("Dasturchi SELECT ni birinchi qatorda yozadi,", 990, 765, { size: 20, color: C.soft, fam: UI });
      text("lekin ma'lumotlar bazasi SELECT bandini faqat 6-bosqichda bajaradi!", 990, 805, { size: 20, weight: 700, color: C.red, fam: UI });
      text("Barcha 'Nega alias WHERE da ishlamaydi?' savollari shundan kelib chiqadi.", 990, 850, { size: 19, color: C.soft, fam: UI });
    });
  }

  // 2. EXECUTION ORDER
  function sExecutionOrder(t) {
    heading("SELECT ning Mantiqiy Bajarilish Tartibi", t, TM.scenes.execution_order.s);

    const k1 = P(t, W('L2', 'Lekin'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("SQL Dvigateli Qadamlari (Execution Pipeline)", 960, 270, C.blue, k1, 22);

      // 6 Step Horizontal Pipeline
      const steps = [
        { num: "1", name: "FROM / JOIN", desc: "Jadvallar yuklanadi va birlashtiriladi", col: C.green },
        { num: "2", name: "WHERE", desc: "Qatorlar shart bo'yicha filtrlanadi", col: C.red },
        { num: "3", name: "GROUP BY", desc: "Qatorlar guruhlarga ajratiladi", col: C.purple },
        { num: "4", name: "HAVING", desc: "Guruhlar filtrlari tekshiriladi", col: C.purple },
        { num: "5", name: "SELECT", desc: "Ustunlar hisoblanadi & Alias beriladi", col: C.blue },
        { num: "6", name: "ORDER / LIMIT", desc: "Saralanadi va kesib olinadi", col: C.hl }
      ];

      steps.forEach((st, i) => {
        const x = 160 + i * 270;
        card(x, 340, 250, 260, { fill: '#f8fafc', col: st.col, p: k1 });
        pill(`${st.num}-BOSQICH`, x + 125, 380, st.col, k1, 16);
        text(st.name, x + 125, 435, { size: 20, weight: 700, align: 'center', color: st.col, fam: MONO });
        text(st.desc, x + 125, 485, { size: 16, align: 'center', color: C.soft, wrap: 220 });

        if (i < steps.length - 1) {
          arrow(x + 255, 470, x + 265, 470, { col: C.rule, p: k1 });
        }
      });

      sline(160, 640, 1760, 640, { col: C.rule, p: k1 });

      text("PostgreSQL rasmiy tushuntirishi (Queries Overview):", 160, 685, { size: 24, weight: 700, color: C.ink, fam: UI });
      text("1. FROM, WHERE, GROUP BY, HAVING bosqichlari birgalikda oraliq virtual jadval (virtual relation) yaratadi.", 180, 735, { size: 20, color: C.soft, fam: UI });
      text("2. SELECT ro'yxati esa hosil bo'lgan shu oraliq jadvaldan qaysi ustunlar mijozga qaytishini belgilaydi.", 180, 780, { size: 20, color: C.blue, fam: UI });
      text("3. Shuning uchun WHERE bajarilayotgan paytda SELECT dagi hech bir ustun aliasi hali dunyoga kelmagan bo'ladi!", 180, 825, { size: 20, weight: 700, color: C.red, fam: UI });
    });
  }

  // 3. ALIAS TIMING & WHERE ERROR
  function sAliasTiming(t) {
    heading("Nega Alias WHERE da Ishlamaydi?", t, TM.scenes.alias_timing.s);

    const k1 = P(t, W('L3', 'alias'), 0.5);
    withA(k1, () => {
      // Left: Error Code
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Xato Beruvchi So'rov", 530, 270, C.red, k1, 20);

      text("-- 6-bosqichda yaratiladigan alias:", 160, 335, { size: 18, color: C.soft, fam: MONO });
      text("SELECT sotuvchi,", 160, 370, { size: 22, color: C.ink, fam: MONO });
      text("       summa * 1.12 AS qqs_bilan", 160, 405, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("FROM sotuvlar", 160, 440, { size: 22, color: C.green, fam: MONO });
      text("WHERE qqs_bilan > 500; -- XATO!", 160, 475, { size: 22, weight: 700, color: C.red, fam: MONO });

      card(160, 520, 740, 160, { fill: '#fff2f2', col: C.red, p: k1 });
      text("ERROR: column \"qqs_bilan\" does not exist", 180, 560, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("LINE 1: ... FROM sotuvlar WHERE qqs_bilan > 500", 180, 600, { size: 17, color: C.soft, fam: MONO });
      text("                                ^", 180, 630, { size: 17, weight: 700, color: C.red, fam: MONO });

      text("Tushuntirish:", 160, 715, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("WHERE 2-bosqichda tekshiriladi.", 160, 755, { size: 20, color: C.soft, fam: UI });
      text("Bu paytda 'qqs_bilan' aliasi hali hisoblanmagan va mavjud emas!", 160, 790, { size: 20, weight: 700, color: C.red, fam: UI });
      text("Baza faqat asl ustunlarni ('summa') taniydi.", 160, 830, { size: 20, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L3', 'uchinchi'), 0.5);
    withA(k2, () => {
      // Right: Solution Code
      card(980, 220, 820, 750, { fill: C.card, col: C.green, p: k2 });
      pill("To'g'ri Yozish Usullari", 1390, 270, C.green, k2, 20);

      text("1-YECHIM: Ifodani to'liq takrorlash", 1020, 335, { size: 21, weight: 700, color: C.green, fam: UI });
      card(1020, 370, 740, 150, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("SELECT sotuvchi, summa * 1.12 AS qqs_bilan", 1040, 410, { size: 18, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 1040, 445, { size: 18, color: C.green, fam: MONO });
      text("WHERE summa * 1.12 > 500; -- To'g'ri!", 1040, 480, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("2-YECHIM: Subquery yoki CTE (WITH) ishlatish", 1020, 555, { size: 21, weight: 700, color: C.blue, fam: UI });
      card(1020, 590, 740, 190, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("WITH hisob AS (", 1040, 625, { size: 18, color: C.purple, fam: MONO });
      text("  SELECT sotuvchi, summa * 1.12 AS qqs_bilan", 1060, 655, { size: 18, color: C.ink, fam: MONO });
      text("  FROM sotuvlar", 1060, 685, { size: 18, color: C.ink, fam: MONO });
      text(")", 1040, 715, { size: 18, color: C.purple, fam: MONO });
      text("SELECT * FROM hisob WHERE qqs_bilan > 500;", 1040, 745, { size: 18, weight: 700, color: C.blue, fam: MONO });

      text("CTE ichidagi alias tashqi WHERE uchun haqiqiy ustun bo'lib qoladi!", 1020, 815, { size: 19, weight: 700, color: C.ink, fam: UI });
    });
  }

  // 4. DISTINCT AND ORDER
  function sDistinctAndOrder(t) {
    heading("ORDER BY Nega Aliasni Taniydi? (DISTINCT Bosqichi)", t, TM.scenes.distinct_and_order.s);

    const k1 = P(t, W('L4', 'Saralash'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("ORDER BY — 8-Bosqich", 530, 270, C.blue, k1, 20);

      text("SELECT sotuvchi, summa * 1.12 AS qqs_bilan", 160, 335, { size: 19, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 160, 370, { size: 19, color: C.green, fam: MONO });
      text("WHERE summa * 1.12 > 500", 160, 405, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY qqs_bilan DESC; -- ISHLAYDI!", 160, 440, { size: 19, weight: 700, color: C.blue, fam: MONO });

      card(160, 485, 740, 180, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("Nega ORDER BY da alias ishlaydi?", 180, 525, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("Chunki ORDER BY 8-bosqichda, ya'ni SELECT (5-bosqich)", 180, 565, { size: 19, color: C.ink, fam: UI });
      text("va DISTINCT (7-bosqich) dan KEYIN bajariladi!", 180, 600, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("Bu paytda 'qqs_bilan' aliasi ro'yxatga to'liq kiritilgan.", 180, 635, { size: 18, color: C.soft, fam: UI });

      text("Ustun tartib raqami (GROUP BY 1, ORDER BY 2):", 160, 705, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("ORDER BY 2 DESC deb ham yozish mumkin.", 160, 745, { size: 19, color: C.soft, fam: UI });
      text("Lekin katta loyihalarda ustun nomini yozish xavfsizroq.", 160, 780, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'order'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 750, { fill: C.card, col: C.purple, p: k2 });
      pill("DISTINCT vs DISTINCT ON", 1390, 270, C.purple, k2, 20);

      text("1. Standart DISTINCT (Barcha ustunlar):", 1020, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      card(1020, 370, 740, 130, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("SELECT DISTINCT shahar FROM sotuvlar;", 1040, 410, { size: 18, color: C.purple, fam: MONO });
      text("-- Barcha takrorlanuvchi shaharlar olib tashlanadi", 1040, 445, { size: 17, color: C.soft, fam: UI });
      text("-- NULL qiymatlar ham o'zaro teng deb hisoblanadi!", 1040, 475, { size: 17, weight: 700, color: C.purple, fam: UI });

      text("2. PostgreSQL DISTINCT ON (Guruhdan 1-qator):", 1020, 535, { size: 21, weight: 700, color: C.blue, fam: UI });
      card(1020, 570, 740, 160, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("SELECT DISTINCT ON (sotuvchi) sotuvchi, summa", 1040, 610, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("FROM sotuvlar", 1040, 645, { size: 17, color: C.ink, fam: MONO });
      text("ORDER BY sotuvchi, summa DESC;", 1040, 680, { size: 17, weight: 700, color: C.green, fam: MONO });

      text("Har bir sotuvchining eng yirik summasini tanlab beradi!", 1020, 765, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. COMMA TRAP
  function sCommaTrap(t) {
    heading("Tushib Qolgan Vergul Tuzog'i: SELECT a b FROM ...", t, TM.scenes.comma_trap.s);

    const k1 = P(t, W('L5', 'Ustunlar'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Xato: Vergul Unutildi", 530, 270, C.red, k1, 20);

      text("Kutilgan niyat:", 160, 335, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("SELECT sotuvchi, shahar FROM sotuvlar; -- 2 ta ustun", 160, 375, { size: 18, color: C.green, fam: MONO });

      text("Qo'lda yozilganda adashib ketildi:", 160, 435, { size: 20, weight: 700, color: C.red, fam: UI });
      text("SELECT sotuvchi shahar FROM sotuvlar WHERE id = 1;", 160, 475, { size: 18, weight: 700, color: C.red, fam: MONO });

      card(160, 520, 740, 150, { fill: '#fff2f2', col: C.red, p: k1 });
      text("Natija: XATO CHIQMAYDI!", 180, 560, { size: 20, weight: 700, color: C.red, fam: UI });
      text(" shahar ", 180, 600, { size: 18, color: C.soft, fam: MONO });
      text("--------", 180, 625, { size: 18, color: C.soft, fam: MONO });
      text(" Ali    <-- Shoxobcha nomida Ali chiqdi!", 180, 650, { size: 18, weight: 700, color: C.red, fam: MONO });

      text("Nima sodir bo'ldi?", 160, 705, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("Chunki AS so'zi SQL da ixtiyoriy!", 160, 745, { size: 20, color: C.soft, fam: UI });
      text("Baza 'shahar' so'zini 'sotuvchi' ustunining ALIASI deb tushundi.", 160, 780, { size: 20, weight: 700, color: C.red, fam: UI });
      text("Natijada bitta ustun qaytdi, lekin noto'g'ri sarlavha bilan!", 160, 825, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'ez'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 750, { fill: C.card, col: C.green, p: k2 });
      pill("Himoya: Har Doim AS Yozing", 1390, 270, C.green, k2, 20);

      text("Rasmiy Hujjat Tavsiyasi:", 1020, 335, { size: 22, weight: 700, color: C.green, fam: UI });
      text("Barcha SQL standartlari va hujjatlar har doim", 1020, 375, { size: 20, color: C.soft, fam: UI });
      text("aniq 'AS' kalit so'zini yozishni maslahat beradi:", 1020, 410, { size: 20, color: C.soft, fam: UI });

      card(1020, 450, 740, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("SELECT", 1040, 490, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("  sotuvchi AS s,", 1060, 525, { size: 19, color: C.green, fam: MONO });
      text("  shahar AS sh", 1060, 560, { size: 19, color: C.green, fam: MONO });
      text("FROM sotuvlar;", 1040, 595, { size: 19, color: C.ink, fam: MONO });

      text("Afzalliklari:", 1020, 645, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("1. Vergul qolib ketsa, sintaksis xatosi chiqadi va", 1020, 685, { size: 19, color: C.soft, fam: UI });
      text("   xato darhol seziladi.", 1020, 715, { size: 19, weight: 700, color: C.green, fam: UI });
      text("2. Kelajakda yangi qo'shiladigan SQL kalit so'zlari bilan", 1020, 755, { size: 19, color: C.soft, fam: UI });
      text("   to'qnashuvlardan to'liq himoya qiladi.", 1020, 785, { size: 19, color: C.soft, fam: UI });
    });
  }

  // 6. DISTINCT ON
  function sDistinctOn(t) {
    heading("PostgreSQL: DISTINCT ON (ifoda) va ORDER BY Bog'liqligi", t, TM.scenes.distinct_on.s);

    const k1 = P(t, W('L6', 'Postgres'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("Guruhdan Birinchi Qatorni Tanlash", 960, 270, C.blue, k1, 22);

      // Left code
      card(160, 330, 780, 260, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT DISTINCT ON (sotuvchi)", 190, 380, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("       sotuvchi, shahar, summa", 190, 420, { size: 21, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 190, 460, { size: 21, color: C.green, fam: MONO });
      text("ORDER BY sotuvchi, summa DESC;", 190, 500, { size: 21, weight: 700, color: C.purple, fam: MONO });

      // Right output
      card(980, 330, 780, 260, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("Natija (Har sotuvchining eng katta savdosi):", 1010, 375, { size: 20, weight: 700, color: C.green, fam: UI });
      text(" sotuvchi |  shahar   | summa ", 1010, 425, { size: 18, color: C.soft, fam: MONO });
      text("----------+-----------+-------", 1010, 455, { size: 18, color: C.soft, fam: MONO });
      text(" Ali      | Toshkent  |   500  -- (300 tashlandi)", 1010, 485, { size: 18, color: C.ink, fam: MONO });
      text(" Sobir    | Buxoro    |   900  -- (100 tashlandi)", 1010, 515, { size: 18, color: C.ink, fam: MONO });
      text(" Vali     | Samarqand |   700  -- (200 tashlandi)", 1010, 545, { size: 18, color: C.ink, fam: MONO });

      sline(160, 625, 1760, 625, { col: C.rule, p: k1 });

      text("DISTINCT ON ning Oltin Qoidasi:", 160, 675, { size: 24, weight: 700, color: C.red, fam: UI });
      text("• DISTINCT ON (ustun) ishlatilganda, ORDER BY dagi birinchi ustun ham AYNAN SHU ustun bo'lishi shart!", 180, 725, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Ikkinchi ustun ('summa DESC') esa guruh ichida 'birinchi' bo'lib qaysi qator qolishini aniq belgilaydi.", 180, 770, { size: 20, color: C.soft, fam: UI });
      text("• Agar ORDER BY berilmasa, qaysi qator qolishi noaniq (tasodifiy) bo'ladi.", 180, 815, { size: 20, color: C.soft, fam: UI });
      text("• Standartda yo'q (PostgreSQL kengaytmasi), lekin juda qulay va tezkor yechimdir.", 180, 860, { size: 20, color: C.blue, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.execution_order.s) sIntro(t);
    else if (t < S.alias_timing.s) sExecutionOrder(t);
    else if (t < S.distinct_and_order.s) sAliasTiming(t);
    else if (t < S.comma_trap.s) sDistinctAndOrder(t);
    else if (t < S.distinct_on.s) sCommaTrap(t);
    else sDistinctOn(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.execution_order.s + 3.0;
    frame(t);
  };
})();
