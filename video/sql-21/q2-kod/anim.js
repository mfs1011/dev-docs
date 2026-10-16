// SQL 21-bob 2-qism: "Kod" — PostgreSQL 18 da COPY, ON_ERROR va REJECT_LIMIT Amaliyoti
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
    hand("21-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: COPY Amaliyoti", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CSV Faylni Yuklash, Xatolarni Tashlash va Chegaralash", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'mahsulotlar'), 0.8);
    withA(kBadges, () => {
      pill("1. CSV FAYL TUZILISHI", 360, 520, C.blue, kBadges, 20);
      pill("2. SUKUT BO'YICHA XATO", 780, 520, C.red, kBadges, 20);
      pill("3. ON_ERROR IGNORE", 1200, 520, C.green, kBadges, 20);
      pill("4. REJECT_LIMIT (PG 18)", 1600, 520, C.purple, kBadges, 20);
    });

    const kCsv = P(t, W('L1', 'qiymatlar'), 0.8);
    withA(kCsv, () => {
      card(180, 600, 1560, 320, { fill: C.card, col: C.blue, p: kCsv });
      text("Sinov fayli: mahsulotlar.csv (Ikkita xato narx bilan):", 240, 650, { size: 24, weight: 700, color: C.ink, fam: UI });

      card(240, 680, 700, 210, { fill: '#f6f9fc', col: C.blue, p: kCsv });
      text("sku,nom,narx", 260, 715, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("NON,Non,4000            -- 2-qator (To'g'ri)", 260, 750, { size: 18, color: C.green, fam: MONO });
      text("SUT,Sut,12000           -- 3-qator (To'g'ri)", 260, 785, { size: 18, color: C.green, fam: MONO });
      text("CHOY,Choy,abc           -- 4-qator: narx='abc' (XATO!)", 260, 820, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("TUZ,Tuz,2000            -- 5-qator (To'g'ri)", 260, 855, { size: 18, color: C.green, fam: MONO });

      card(980, 680, 720, 210, { fill: '#faf5ff', col: C.purple, p: kCsv });
      text("Jadval sxemasi (PostgreSQL 18.6):", 1000, 715, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("CREATE TABLE mahsulotlar (", 1000, 755, { size: 18, color: C.ink, fam: MONO });
      text("  sku text PRIMARY KEY,", 1000, 790, { size: 18, color: C.blue, fam: MONO });
      text("  nom text NOT NULL,", 1000, 825, { size: 18, color: C.blue, fam: MONO });
      text("  narx numeric           -- 'abc' numeric ga o'tmaydi!", 1000, 860, { size: 18, weight: 700, color: C.red, fam: MONO });
      text(");", 1000, 885, { size: 18, color: C.ink, fam: MONO });
    });
  }

  // 2. DEFAULT ERROR
  function sDefaultError(t) {
    heading("Sukut Bo'yicha: Birinchi Xatoda Butun Yuklash Bekor", t, TM.scenes.default_error.s);

    const k1 = P(t, W('L2', 'kopi'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Sukut Bo'yicha Buyruq", 530, 270, C.red, k1, 20);

      text("CREATE TABLE mahsulotlar (", 160, 335, { size: 20, color: C.ink, fam: MONO });
      text("  sku text PRIMARY KEY,", 160, 370, { size: 20, color: C.ink, fam: MONO });
      text("  nom text NOT NULL,", 160, 405, { size: 20, color: C.ink, fam: MONO });
      text("  narx numeric", 160, 440, { size: 20, color: C.red, fam: MONO });
      text(");", 160, 475, { size: 20, color: C.ink, fam: MONO });

      text("COPY mahsulotlar", 160, 540, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("FROM '/tmp/mahsulotlar.csv'", 160, 575, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("WITH (FORMAT csv, HEADER true);", 160, 610, { size: 22, weight: 700, color: C.purple, fam: MONO });

      sline(160, 665, 880, 665, { col: C.rule, p: k1 });

      text("Natija tahlili:", 160, 710, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• 4-qatorda narx ustuni 'abc' ga teng.", 160, 750, { size: 20, color: C.soft, fam: UI });
      text("• numeric tipi 'abc' matnini qabul qila olmaydi.", 160, 785, { size: 20, color: C.soft, fam: UI });
      text("• PostgreSQL darhol to'xtaydi va xatoni xabar qiladi.", 160, 820, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Avvalgi NON va SUT qatorlari ham bekor qilinadi!", 160, 865, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Jadval butunlay bo'sh qoladi (0 qator).", 160, 905, { size: 20, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'to‘xtaydi'), 0.5);
    withA(k2, () => {
      const errOut = [
        "qollanma=# COPY mahsulotlar FROM '/tmp/mahsulotlar.csv'",
        "            WITH (FORMAT csv, HEADER true);",
        "",
        "ERROR:  invalid input syntax for type numeric: \"abc\"",
        "CONTEXT:  COPY mahsulotlar, line 4, column narx: \"abc\"",
        "",
        "qollanma=# SELECT count(*) FROM mahsulotlar;",
        " count ",
        "-------",
        "     0",
        "(1 row)",
        "",
        "-- Tranzaksiya to'liq orqaga qaytarildi (Rollback)!"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18.6 Terminali (Xato holati)", [{
        b: {
          cmd: "psql -d qollanma",
          out: errOut.join('\n')
        }
      }], { font: 17, lh: 26 });
    });
  }

  // 3. ON_ERROR IGNORE
  function sOnErrorIgnore(t) {
    heading("PostgreSQL 17+: ON_ERROR ignore va LOG_VERBOSITY", t, TM.scenes.on_error_ignore.s);

    const k1 = P(t, W('L3', 'ignor'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.green, p: k1 });
      pill("ON_ERROR ignore Parametri", 530, 270, C.green, k1, 20);

      text("COPY mahsulotlar", 160, 335, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("FROM '/tmp/mahsulotlar.csv'", 160, 370, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("WITH (", 160, 410, { size: 22, weight: 700, color: C.purple, fam: MONO });
      text("  FORMAT csv,", 190, 445, { size: 21, color: C.ink, fam: MONO });
      text("  HEADER true,", 190, 480, { size: 21, color: C.ink, fam: MONO });
      text("  ON_ERROR ignore,", 190, 515, { size: 21, weight: 700, color: C.green, fam: MONO });
      text("  LOG_VERBOSITY verbose", 190, 550, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text(");", 160, 585, { size: 22, weight: 700, color: C.purple, fam: MONO });

      sline(160, 630, 880, 630, { col: C.rule, p: k1 });

      text("Afzalliklari:", 160, 675, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. Xato qatorlar jadvalga kirmasdan tashlab ketiladi.", 160, 715, { size: 20, color: C.soft, fam: UI });
      text("2. LOG_VERBOSITY verbose qaysi qatorda nima xato bo'lganini", 160, 755, { size: 20, color: C.soft, fam: UI });
      text("   mijozga NOTICE orqali xabar qiladi.", 160, 790, { size: 20, color: C.soft, fam: UI });
      text("3. To'g'ri bo'lgan barcha qatorlar (NON, SUT, TUZ) saqlanadi.", 160, 835, { size: 20, weight: 700, color: C.green, fam: UI });
      text("4. Natijada COPY 3 qaytadi (3 ta qator muvaffaqiyatli).", 160, 880, { size: 20, color: C.blue, fam: UI });
    });

    const k2 = P(t, W('L3', 'uchta'), 0.5);
    withA(k2, () => {
      const ignOut = [
        "qollanma=# COPY mahsulotlar FROM '/tmp/mahsulotlar.csv'",
        "            WITH (FORMAT csv, HEADER true,",
        "                  ON_ERROR ignore, LOG_VERBOSITY verbose);",
        "",
        "NOTICE:  skipping row due to data type incompatibility at line 4 for column \"narx\": \"abc\"",
        "NOTICE:  skipping row due to data type incompatibility at line 6 for column \"narx\": \"narx_yoq\"",
        "NOTICE:  2 rows were skipped due to data type incompatibility",
        "COPY 3",
        "",
        "qollanma=# SELECT * FROM mahsulotlar ORDER BY sku;",
        " sku | nom | narx  ",
        "-----+-----+-------",
        " NON | Non |  4000",
        " SUT | Sut | 12000",
        " TUZ | Tuz |  2000",
        "(3 rows)"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18.6 Terminali (Ignore)", [{
        b: {
          cmd: "psql -d qollanma",
          out: ignOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 4. REJECT LIMIT
  function sRejectLimit(t) {
    heading("PostgreSQL 18: REJECT_LIMIT Chegarasi", t, TM.scenes.reject_limit.s);

    const k1 = P(t, W('L4', 'ridjekt'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.purple, p: k1 });
      pill("REJECT_LIMIT Nazorati", 530, 270, C.purple, k1, 20);

      text("TRUNCATE mahsulotlar;", 160, 335, { size: 21, color: C.ink, fam: MONO });
      text("COPY mahsulotlar FROM '/tmp/mahsulotlar.csv'", 160, 380, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("WITH (", 160, 420, { size: 21, weight: 700, color: C.purple, fam: MONO });
      text("  FORMAT csv, HEADER true,", 190, 455, { size: 20, color: C.ink, fam: MONO });
      text("  ON_ERROR ignore,", 190, 490, { size: 20, color: C.green, fam: MONO });
      text("  REJECT_LIMIT 1   -- Ko'pi bilan 1 ta xatoga ruxsat!", 190, 525, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text(");", 160, 560, { size: 21, weight: 700, color: C.purple, fam: MONO });

      sline(160, 605, 880, 605, { col: C.rule, p: k1 });

      text("Nega REJECT_LIMIT muhim?", 160, 650, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• ON_ERROR ignore cheksiz qo'yilsa, butun fayl buzilgan", 160, 690, { size: 19, color: C.soft, fam: UI });
      text("  bo'lsa ham yuklash 'yashil' o'tib ketishi mumkin.", 160, 725, { size: 19, color: C.soft, fam: UI });
      text("• Masalan: 1 million qatordan 900 mingtasi tashlansa ham!", 160, 765, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• REJECT_LIMIT 1 bilan 2-xato (6-qator 'narx_yoq') kelganda", 160, 810, { size: 19, color: C.soft, fam: UI });
      text("  jarayon to'xtatilib, xato qaytariladi.", 160, 845, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• Bu fayl sifatini avtomatlashtirilgan nazorat qilish vositasi.", 160, 895, { size: 19, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L4', 'to‘xtatish'), 0.5);
    withA(k2, () => {
      const rejOut = [
        "qollanma=# COPY mahsulotlar FROM '/tmp/mahsulotlar.csv'",
        "            WITH (FORMAT csv, HEADER true,",
        "                  ON_ERROR ignore, REJECT_LIMIT 1);",
        "",
        "NOTICE:  skipping row due to data type incompatibility at line 4 for column \"narx\": \"abc\"",
        "",
        "ERROR:  skipped more than REJECT_LIMIT (1) rows due to data type incompatibility",
        "CONTEXT:  COPY mahsulotlar, line 6, column narx: \"narx_yoq\"",
        "",
        "-- Diqqat: xatolar soni 1 tadan oshgani uchun",
        "-- yuklash to'xtatildi va tranzaksiya bekor qilindi!"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18 Terminali (Reject limit)", [{
        b: {
          cmd: "psql -d qollanma",
          out: rejOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 5. SERVER PERM & PSQL \COPY
  function sServerPermPsql(t) {
    heading("Foydalanuvchi Huquqlari va psql Ning \\copy Buyrug'i", t, TM.scenes.server_perm_psql.s);

    const k1 = P(t, W('L5', 'server'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Server COPY: Ruxsat Xatosi", 530, 270, C.red, k1, 20);

      text("SET ROLE talaba; -- Oddiy foydalanuvchi", 160, 335, { size: 19, color: C.soft, fam: MONO });
      text("COPY mahsulotlar FROM '/tmp/mahsulotlar.csv'", 160, 375, { size: 19, color: C.ink, fam: MONO });
      text("WITH (FORMAT csv, HEADER true);", 160, 410, { size: 19, color: C.ink, fam: MONO });

      card(160, 455, 740, 155, { fill: '#fff2f2', col: C.red, p: k1 });
      text("ERROR: permission denied to COPY from a file", 180, 495, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("DETAIL: Only roles with privileges of the", 180, 530, { size: 17, color: C.soft, fam: MONO });
      text("        \"pg_read_server_files\" role may COPY.", 180, 565, { size: 17, color: C.soft, fam: MONO });

      text("Xavfsizlik sababi:", 160, 645, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Server faylini o'qish server OS huquqlaridan foydalanadi.", 160, 685, { size: 19, color: C.soft, fam: UI });
      text("Oddiy ilovalarga bu huquqni berish XAVFLI!", 160, 725, { size: 19, weight: 700, color: C.red, fam: UI });
      text("Chunki ilova serverdagi boshqa maxfiy fayllarni o'qib qo'yishi mumkin.", 160, 765, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'bek-slesh'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 750, { fill: C.card, col: C.green, p: k2 });
      pill("Yechim: \\copy Mijoz Buyrug'i", 1390, 270, C.green, k2, 20);

      text("psql dasturidagi mijoz buyrug'i:", 1020, 335, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1020, 370, 740, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("\\copy mahsulotlar FROM '/tmp/mahsulotlar.csv'", 1040, 410, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("WITH (FORMAT csv, HEADER true, ON_ERROR ignore);", 1040, 445, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("NOTICE: 2 rows were skipped...", 1040, 485, { size: 17, color: C.soft, fam: MONO });
      text("COPY 3", 1040, 515, { size: 18, weight: 700, color: C.blue, fam: MONO });

      text("Nega \\copy hamisha ishlaydi?", 1020, 565, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Faylni mijoz (psql) o'zi o'qiydi.", 1020, 605, { size: 19, color: C.soft, fam: UI });
      text("• Baza serveriga COPY ... FROM STDIN oqimi uzatiladi.", 1020, 640, { size: 19, color: C.soft, fam: UI });
      text("• Server fayl tizimiga to'g'ridan-to'g'ri murojaat bo'lmaydi.", 1020, 675, { size: 19, color: C.soft, fam: UI });
      text("• Har qanday oddiy foydalanuvchi bemalol yuklay oladi!", 1020, 715, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 6. XULOSA & EXPORT
  function sXulosa(t) {
    heading("So'rov Natijasini CSV ga Chiqarish va Xulosa", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'selekt'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("COPY TO STDOUT va Hisobot Eksporti", 960, 270, C.blue, k1, 22);

      // Left: SQL Export Code
      card(160, 330, 780, 260, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SQL So'rov Natijasini Eksport Qilish:", 190, 375, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("COPY (", 190, 420, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("  SELECT sku, narx FROM mahsulotlar", 220, 455, { size: 18, color: C.ink, fam: MONO });
      text("  WHERE narx > 3000 ORDER BY sku", 220, 490, { size: 18, color: C.ink, fam: MONO });
      text(") TO STDOUT WITH (FORMAT csv, HEADER true);", 190, 525, { size: 18, weight: 700, color: C.purple, fam: MONO });

      // Right: CSV output
      card(980, 330, 780, 260, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("Chiqarilgan CSV Natijasi (STDOUT):", 1010, 375, { size: 20, weight: 700, color: C.green, fam: UI });
      text("sku,narx", 1010, 425, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("NON,4000", 1010, 465, { size: 20, color: C.ink, fam: MONO });
      text("SUT,12000", 1010, 505, { size: 20, color: C.ink, fam: MONO });

      sline(160, 625, 1760, 625, { col: C.rule, p: k1 });

      // Summary points
      text("Amaliy Xulosa va Qoidalar:", 160, 670, { size: 24, weight: 700, color: C.ink, fam: UI });

      text("1. Ommaviy yuklashda bittalab INSERT qilish o'rniga har doim COPY yoki \\copy dan foydalaning.", 180, 715, { size: 20, color: C.soft, fam: UI });
      text("2. Fayl sifati shubhali bo'lsa: ON_ERROR ignore va REJECT_LIMIT n kombinatsiyasi ideal yechimdir.", 180, 760, { size: 20, weight: 700, color: C.green, fam: UI });
      text("3. Server fayli faqat superuser uchun; mijoz yoki ilova darajasida \\copy / STDIN ishlatiladi.", 180, 805, { size: 20, color: C.purple, fam: UI });
      text("4. Yuklash tugagach, albatta ANALYZE jadval buyrug'ini ishga tushirishni unutmang!", 180, 850, { size: 20, weight: 700, color: C.red, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.default_error.s) sIntro(t);
    else if (t < S.on_error_ignore.s) sDefaultError(t);
    else if (t < S.reject_limit.s) sOnErrorIgnore(t);
    else if (t < S.server_perm_psql.s) sRejectLimit(t);
    else if (t < S.xulosa.s) sServerPermPsql(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.on_error_ignore.s + 3.0;
    frame(t);
  };
})();
