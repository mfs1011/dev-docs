// SQL 23-bob 2-qism: "Kod" — PostgreSQL 18 da Filtrlash Amaliyoti
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
    hand("23-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Filtrlash Amaliyoti", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("BETWEEN SYMMETRIC, NOT IN dagi NULL va IS DISTINCT FROM", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 380, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'mijozlar'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Sinov Jadvali: mijozlar (Real 5 ta qator ma'lumot bilan):", 190, 495, { size: 24, weight: 700, color: C.ink, fam: UI });

      card(190, 535, 780, 380, { fill: '#f6f9fc', col: C.blue, p: kCards });
      pill("Jadval Tuzilishi va INSERT", 580, 575, C.blue, kCards, 18);
      text("CREATE TABLE mijozlar (", 220, 625, { size: 18, color: C.ink, fam: MONO });
      text("  id int PRIMARY KEY, ism text, telefon text,", 220, 655, { size: 18, color: C.blue, fam: MONO });
      text("  shahar text, yosh int", 220, 685, { size: 18, color: C.blue, fam: MONO });
      text(");", 220, 715, { size: 18, color: C.ink, fam: MONO });
      text("1 | Ali      | +998901234567 | Toshkent  | 25", 220, 755, { size: 16, color: C.green, fam: MONO });
      text("2 | aliya    | +998935550011 | Samarqand | 31", 220, 785, { size: 16, color: C.green, fam: MONO });
      text("3 | Vali     | 998-90-111... | Toshkent  | NULL", 220, 815, { size: 16, color: C.soft, fam: MONO });
      text("4 | Sobir_2  | +998977770000 | NULL      | 40", 220, 845, { size: 16, color: '#ea580c', fam: MONO });
      text("5 | Dilnoza  | +79161234567  | Buxoro    | 19", 220, 875, { size: 16, color: C.green, fam: MONO });

      card(1010, 535, 730, 380, { fill: '#faf5ff', col: C.purple, p: kCards });
      pill("Amaliy Sinov Rejasi", 1375, 575, C.purple, kCards, 18);
      text("Bugun ko'rib chiqiladigan real holatlar:", 1040, 630, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("1. BETWEEN SYMMETRIC teskari argumentlarda", 1040, 680, { size: 19, color: C.ink, fam: UI });
      text("2. NOT IN ('Toshkent', NULL) nima uchun 0 beradi?", 1040, 730, { size: 19, color: C.red, fam: UI });
      text("3. IS DISTINCT FROM bilan NULL shaharni qutqarish", 1040, 780, { size: 19, color: C.green, fam: UI });
      text("4. ILIKE va POSIX Regex (~) amaliy sinovi", 1040, 830, { size: 19, color: C.blue, fam: UI });
    });
  }

  // 2. BETWEEN VA BETWEEN SYMMETRIC
  function sBetweenDemo(t) {
    heading("PostgreSQL 18: BETWEEN va BETWEEN SYMMETRIC Sinovi", t, TM.scenes.between_demo.s);

    const k1 = P(t, W('L2', 'bitvin'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("So'rovlar va Chegaralar", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 190, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("-- 1. Oddiy BETWEEN:", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism FROM mijozlar", 170, 380, { size: 19, color: C.ink, fam: MONO });
      text("WHERE yosh BETWEEN 25 AND 31; -- 2 qator (Ali, aliya)", 170, 415, { size: 19, color: C.green, fam: MONO });
      text("-- 2. Teskari chegaralar:", 170, 450, { size: 17, color: C.soft, fam: MONO });
      text("WHERE yosh BETWEEN 31 AND 25; -- 0 qator!", 170, 480, { size: 19, color: C.red, fam: MONO });

      card(140, 525, 760, 140, { fill: '#f5f3ff', col: C.purple, p: k1 });
      text("-- 3. SYMMETRIC kalit so'zi:", 170, 565, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism, yosh FROM mijozlar", 170, 595, { size: 19, color: C.ink, fam: MONO });
      text("WHERE yosh BETWEEN SYMMETRIC 31 AND 25;", 170, 630, { size: 20, weight: 700, color: C.purple, fam: MONO });

      text("Nega SYMMETRIC kerak?", 140, 705, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Foydalanuvchi interfeysidan (UI) sanalar yoki narxlar", 140, 745, { size: 19, color: C.soft, fam: UI });
      text("oralig'i kiritilganda, min va max qiymatlar o'rni", 140, 775, { size: 19, color: C.soft, fam: UI });
      text("almashib qolishi mumkin. SYMMETRIC buni o'zi to'g'irlaydi!", 140, 805, { size: 19, color: C.purple, fam: UI });
      text("Boshqa bazalarda esa LEAST() va GREATEST() kerak bo'lardi.", 140, 850, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'to‘g‘ri'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT id, ism, yosh FROM mijozlar",
        "            WHERE yosh BETWEEN 31 AND 25;",
        " id | ism | yosh ",
        "----+-----+------",
        "(0 rows)",
        "",
        "qollanma=# SELECT id, ism, yosh FROM mijozlar",
        "            WHERE yosh BETWEEN SYMMETRIC 31 AND 25;",
        " id |  ism  | yosh ",
        "----+-------+------",
        "  1 | Ali   |   25",
        "  2 | aliya |   31",
        "(2 rows)"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Real ijro)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 16, lh: 26 });
    });
  }

  // 3. NOT IN DAGI NULL TUZOG'I
  function sNullInDemo(t) {
    heading("Xavfli Tuzoq: NOT IN Ro'yxatidagi NULL Qiymat", t, TM.scenes.null_in_demo.s);

    const k1 = P(t, W('L3', 'not'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("So'rov va Mantiqiy Tahlil", 520, 260, C.red, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT id, shahar FROM mijozlar", 170, 350, { size: 20, color: C.ink, fam: MONO });
      text("WHERE shahar NOT IN ('Toshkent', NULL);", 170, 395, { size: 21, weight: 700, color: C.red, fam: MONO });
      text("-- NATIJA: 0 rows (Kutilmagan xatti-harakat!)", 170, 435, { size: 17, color: C.red, fam: MONO });

      text("Tahlil: Nima uchun bitta ham qator chiqmadi?", 140, 510, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("PostgreSQL har bir qator uchun quyidagicha hisoblaydi:", 140, 555, { size: 19, color: C.soft, fam: UI });

      card(140, 600, 760, 210, { fill: '#fff', col: C.red, p: k1 });
      text("Masalan: Samarqand qatori uchun:", 170, 635, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  'Samarqand' <> 'Toshkent'  -->  TRUE", 170, 675, { size: 18, color: C.green, fam: MONO });
      text("  'Samarqand' <> NULL        -->  NULL", 170, 715, { size: 18, color: C.red, fam: MONO });
      text("  TRUE AND NULL              -->  NULL! (TRUE emas)", 170, 755, { size: 18, weight: 700, color: C.red, fam: MONO });

      text("WHERE faqat natijasi TRUE bo'lgan qatorlarni oladi!", 140, 845, { size: 19, weight: 700, color: C.red, fam: UI });
      text("Shuning uchun barcha qatorlar bekor qilinadi.", 140, 880, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L3', 'nolta'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT id, shahar FROM mijozlar",
        "            WHERE shahar NOT IN ('Toshkent', NULL);",
        " id | shahar ",
        "----+--------",
        "(0 rows)",
        "",
        "-- TO'G'RI YECHIM: NULL ni ro'yxatdan chiqarish:",
        "qollanma=# SELECT id, shahar FROM mijozlar",
        "            WHERE shahar NOT IN ('Toshkent');",
        " id |  shahar   ",
        "----+-----------",
        "  2 | Samarqand",
        "  5 | Buxoro",
        "(2 rows)"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Real natija)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 16, lh: 26 });
    });
  }

  // 4. IS DISTINCT FROM
  function sDistinctDemo(t) {
    heading("IS DISTINCT FROM: NULL-Xavfsiz Filtrlash Amaliyoti", t, TM.scenes.distinct_demo.s);

    const k1 = P(t, W('L4', 'noma’lum'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("NULL Shaharni Qutqarish", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff', col: C.red, p: k1 });
      text("-- 1. Oddiy tengsizlik bilan sinab ko'ramiz:", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism, shahar FROM mijozlar", 170, 385, { size: 19, color: C.ink, fam: MONO });
      text("WHERE shahar <> 'Toshkent'; -- Sobir_2 (NULL) TUSHIB QOLADI!", 170, 420, { size: 18, color: C.red, fam: MONO });

      card(140, 500, 760, 160, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- 2. IS DISTINCT FROM yordamida:", 170, 540, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism, shahar FROM mijozlar", 170, 575, { size: 19, color: C.ink, fam: MONO });
      text("WHERE shahar IS DISTINCT FROM 'Toshkent';", 170, 615, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("Farqi nimada?", 140, 700, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• <> operatorida NULL <> 'Toshkent' --> NULL bo'ladi.", 140, 745, { size: 18, color: C.red, fam: UI });
      text("• IS DISTINCT FROM da esa NULL 'Toshkent' dan farqli", 140, 785, { size: 18, color: C.green, fam: UI });
      text("  deb baholanadi va TRUE qaytaradi!", 140, 815, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Sobir_2 ning shahri noma'lum bo'lsa ham yo'qolmaydi.", 140, 860, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'distinkt'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT id, ism, shahar FROM mijozlar",
        "            WHERE shahar <> 'Toshkent';",
        " id |   ism   |  shahar   ",
        "----+---------+-----------",
        "  2 | aliya   | Samarqand",
        "  5 | Dilnoza | Buxoro",
        "(2 rows) -- Sobir_2 tushib qoldi!",
        "",
        "qollanma=# SELECT id, ism, shahar FROM mijozlar",
        "            WHERE shahar IS DISTINCT FROM 'Toshkent';",
        " id |   ism   |  shahar   ",
        "----+---------+-----------",
        "  2 | aliya   | Samarqand",
        "  4 | Sobir_2 | ",
        "  5 | Dilnoza | Buxoro",
        "(3 rows) -- Sobir_2 (NULL) ham chiqdi!"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Real natija)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 5. ILIKE VA POSIX REGEX
  function sLikeRegexDemo(t) {
    heading("ILIKE va POSIX Regex (~) Amaliy Sinovi", t, TM.scenes.like_regex_demo.s);

    const k1 = P(t, W('L5', 'ay-layk'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("So'rovlar Sintaksisi", 520, 260, C.purple, k1, 20);

      card(140, 310, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("-- 1. ILIKE (katta-kichik harf farqsiz):", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism FROM mijozlar", 170, 380, { size: 19, color: C.ink, fam: MONO });
      text("WHERE ism ILIKE 'ali%'; -- Ali ham, aliya ham", 170, 415, { size: 19, weight: 700, color: C.blue, fam: MONO });

      card(140, 485, 760, 150, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("-- 2. POSIX Regex (~):", 170, 525, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, telefon FROM mijozlar", 170, 555, { size: 19, color: C.ink, fam: MONO });
      text("WHERE telefon ~ '^\\+998'; -- O'zbekiston raqamlari", 170, 590, { size: 19, weight: 700, color: C.purple, fam: MONO });

      card(140, 660, 760, 150, { fill: '#fff', col: C.green, p: k1 });
      text("-- 3. Escape bilan ostki chiziqni qidirish:", 170, 700, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism FROM mijozlar", 170, 730, { size: 19, color: C.ink, fam: MONO });
      text("WHERE ism LIKE '%\\_%'; -- Sobir_2", 170, 765, { size: 19, weight: 700, color: C.green, fam: MONO });

      text("PostgreSQL da escape belgisi sukut bo'yicha teskari chiziqdir.", 140, 850, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'pozikz'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT id, ism FROM mijozlar WHERE ism ILIKE 'ali%';",
        " id |  ism  ",
        "----+-------",
        "  1 | Ali",
        "  2 | aliya",
        "(2 rows)",
        "",
        "qollanma=# SELECT id, telefon FROM mijozlar WHERE telefon ~ '^\\+998';",
        " id |    telefon    ",
        "----+---------------",
        "  1 | +998901234567",
        "  2 | +998935550011",
        "  4 | +998977770000",
        "(3 rows)",
        "",
        "qollanma=# SELECT id, ism FROM mijozlar WHERE ism LIKE '%\\_%';",
        " id |   ism   ",
        "----+---------",
        "  4 | Sobir_2",
        "(1 row)"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Real natijalar)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 24 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Filtrlashda Eng Muhim 4 Tavsiya", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'operatorning'), 0.5);
    withA(k1, () => {
      card(120, 210, 1680, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("AMALIY TAVSIYALAR", 960, 260, C.blue, k1, 22);

      card(160, 320, 780, 280, { fill: '#fff', col: C.purple, p: k1 });
      pill("1. BETWEEN SYMMETRIC", 550, 360, C.purple, k1, 18);
      text("• Katta-kichik chegaralarni tekshirish shart emas.", 190, 420, { size: 19, color: C.ink, fam: UI });
      text("• Foydalanuvchi filtrlari uchun ideal tanlov.", 190, 465, { size: 19, color: C.purple, fam: UI });
      text("• Sanalarda esa >= va < orqali yozish aniqroq.", 190, 510, { size: 19, color: C.soft, fam: UI });

      card(980, 320, 780, 280, { fill: '#fff', col: C.red, p: k1 });
      pill("2. NOT IN va NULL dan Saqlanish", 1370, 360, C.red, k1, 18);
      text("• Ro'yxatda bitta NULL bo'lsa butun so'rov sinadi.", 1010, 420, { size: 19, color: C.red, fam: UI });
      text("• NULL bo'lishi mumkin bo'lsa NOT EXISTS ishlating.", 1010, 465, { size: 19, color: C.green, fam: UI });
      text("• Yoki WHERE ustun IS NOT NULL shartini qo'shing.", 1010, 510, { size: 19, color: C.ink, fam: UI });

      card(160, 630, 780, 320, { fill: '#fff', col: C.green, p: k1 });
      pill("3. IS DISTINCT FROM ning Kuchi", 550, 670, C.green, k1, 18);
      text("• NULL ni qiymat sifatida qabul qiladi.", 190, 730, { size: 19, color: C.green, fam: UI });
      text("• Noma'lum qatorlar (NULL) ro'yxatdan tushib qolmaydi.", 190, 775, { size: 19, color: C.ink, fam: UI });
      text("• Moliyaviy va mijoz hisobotlarida ma'lumot yo'qolmaydi.", 190, 820, { size: 19, color: C.green, fam: UI });

      card(980, 630, 780, 320, { fill: '#fff', col: C.blue, p: k1 });
      pill("4. Qidiruv Aniq va Xavfsiz Bo'lsin", 1370, 670, C.blue, k1, 18);
      text("• Katta-kichik harfga qaramaslik uchun ILIKE qulay.", 1010, 730, { size: 19, color: C.blue, fam: UI });
      text("• Formatlarni tekshirish uchun POSIX regex (~) a'lo qurol.", 1010, 775, { size: 19, color: C.purple, fam: UI });
      text("• Ostki chiziqni qidirishda teskari chiziq (\\_) unutilmasin.", 1010, 820, { size: 19, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.between_demo.s) sIntro(t);
    else if (t < S.null_in_demo.s) sBetweenDemo(t);
    else if (t < S.distinct_demo.s) sNullInDemo(t);
    else if (t < S.like_regex_demo.s) sDistinctDemo(t);
    else if (t < S.xulosa.s) sLikeRegexDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.between_demo.s + 3.0);
  };
})();
