// SQL 46-bob 1-qism: "Tushuncha" — Planner va Statistika
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. PLANNER VA SELEKTIVLIK (0 -> 16.30s)
  function sPlannerVaSelektivlik(t) {
    const k = P(t, 0.3, 1.0);
    hand("46-bob. Planner va Statistika", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("Planner va Shartlar Selektivligi", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Rejalashtiruvchi jadvalni o'qimasdan oldin 'Nechta qator qaytadi?' deb hisoblaydi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Selektivlik mohiyati
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("Selektivlik (Selectivity) Nima?", 180, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("Selektivlik = Shartga mos qatorlar ulushi (0.0 .. 1.0)", 180, 455, { size: 18, weight: 700, fam: UI, color: C.ink });

      srect(180, 490, 700, 120, { fill: '#f6ffed', stroke: C.green });
      text("Yuqori Selektivlik (Kam sonli qatorlar: masalan 1%):", 200, 525, { size: 17, weight: 700, fam: UI, color: C.green });
      text("-> Indeks skanerlash (Index Scan) tanlanadi.", 200, 560, { size: 16, fam: MONO, color: C.green });
      text("-> Faqat kerakli sahifalarga boriladi.", 200, 590, { size: 15, color: C.soft, fam: UI });

      srect(180, 625, 700, 120, { fill: '#fffaf0', stroke: C.orange });
      text("Past Selektivlik (Ko'p sonli qatorlar: masalan 95%):", 200, 660, { size: 17, weight: 700, fam: UI, color: C.orange });
      text("-> Ketma-ket skanerlash (Seq Scan) tanlanadi.", 200, 695, { size: 16, fam: MONO, color: C.orange });
      text("-> Diskdan tasodifiy sakrab o'qish ortiqcha ish!", 200, 725, { size: 15, color: C.soft, fam: UI });

      pill("Optimizator narxni selektivlikka qarab baholaydi", 530, 780, C.blue, kBox, 15);

      // O'ng: Nega oldindan taxmin?
      const kRight = P(t, 8.0, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.green, p: kRight });
        text("Nega Jadval Oldindan O'qilmaydi?", 1040, 390, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Millionlab qatorli jadvalni har bir so'rov oldidan", 1040, 455, { size: 18, color: C.ink, fam: UI });
        text("sanab chiqish so'rovning o'zidan ham qimmatga tushadi!", 1040, 485, { size: 18, weight: 700, color: C.red, fam: UI });

        text("Shuning uchun ma'lumotlar bazasi:", 1040, 540, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("1. Jadvallar hajmini (qatorlar, disk sahifalari) saqlaydi.", 1040, 575, { size: 17, color: C.ink, fam: UI });
        text("2. Har bir ustundagi qiymatlar tarqalishini keshlaydi.", 1040, 610, { size: 17, color: C.ink, fam: UI });
        text("3. ANALYZE buyrug'i namunalar (samples) o'qiydi.", 1040, 645, { size: 17, color: C.green, fam: UI });

        pill("Statistika — tezkor reja tuzishning kaliti", 1390, 780, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Oltin qoida: Noto'g'ri statistika = Noto'g'ri reja = Sekin so'rov!", 960, 905, { size: 23, weight: 700, color: C.red, fam: UI, align: 'center' });
        text("Baza qancha qator chiqishini bilmasa, eng yomon indeksni yoki ortiqcha to'liq skanni tanlaydi.", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. PG_STATS TUZILISHI (16.30 -> 33.14s)
  function sPgStatsTuzilishi(t) {
    heading("2. POSTGRESQL STATISTIKASI: pg_stats", "pg_class jadvali va pg_stats katalogi ichida nimalar bor?", t, TM.scenes.pg_stats_tuzilishi);

    const kCat = P(t, 17.5, 0.8);
    withA(kCat, () => {
      // Chap: pg_class
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kCat });
      text("1. Jadval Hajmi: pg_class", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT reltuples, relpages FROM pg_class WHERE relname='manzillar';", 180, 355, { size: 14, fam: MONO, color: C.ink });

      srect(180, 395, 700, 120, { fill: '#faf5ff', stroke: C.purple });
      text("reltuples | relpages", 200, 430, { size: 17, weight: 700, fam: MONO, color: C.purple });
      sline(200, 450, 860, 450, { col: C.pencil, w: 1 });
      text("  100000 |      541", 200, 485, { size: 18, weight: 700, fam: MONO, color: C.ink });

      text("• reltuples: Jadvaldagi taxminiy qatorlar soni (100k).", 180, 545, { size: 17, color: C.ink, fam: UI });
      text("• relpages: Diskda egallagan sahifalar soni (541 ta 8kB blok).", 180, 580, { size: 17, color: C.ink, fam: UI });
      text("• Har INSERT'da yangilanmaydi! ANALYZE yangilaydi.", 180, 620, { size: 17, weight: 700, color: C.orange, fam: UI });

      pill("reltuples va relpages — narx hisobining poydevori", 530, 745, C.purple, kCat, 15);
    });

    const kStats = P(t, 24.5, 0.8);
    withA(kStats, () => {
      // O'ng: pg_stats
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kStats });
      text("2. Ustun Statistikasi: pg_stats", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 230, { fill: '#f0f5ff', stroke: C.blue });
      text("n_distinct:        2 (turli xil qiymatlar soni)", 1060, 375, { size: 15, fam: MONO, color: C.ink });
      text("most_common_vals:  {faol, yangi}", 1060, 410, { size: 15, fam: MONO, color: C.blue });
      text("most_common_freqs: {0.9797, 0.0203} (chastotalar)", 1060, 445, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("histogram_bounds:  Qolgan qiymatlar chegaralari", 1060, 480, { size: 15, fam: MONO, color: C.soft });
      text("correlation:       Tartib bog'liqligi (BRIN uchun)", 1060, 515, { size: 15, fam: MONO, color: C.orange });
      text("default_statistics_target = 100 (namuna aniqligi)", 1060, 550, { size: 14, fam: MONO, color: C.soft });

      text("• Autovacuum bu ma'lumotlarni fonda avtomatik yig'adi.", 1040, 600, { size: 17, color: C.ink, fam: UI });
      text("• Katta yuklashlardan keyin: ANALYZE jadval; qilish shart!", 1040, 635, { size: 17, weight: 700, color: C.green, fam: UI });

      pill("MCV va Gistogramma orqali selektivlik hisoblanadi", 1390, 745, C.blue, kStats, 15);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 29.5, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#f4f6fc', col: C.blue, p: kFoot2 });
      text("ANALYZE butun jadvalni emas, tasodifiy namunani o'qiydi!", 960, 885, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
      text("Shu sababli 2% lik qiymat statistikada 2.03% bo'lib chiqadi — bu yetarlicha aniq.", 960, 925, { size: 19, color: C.soft, fam: UI, align: 'center' });
    });
  }

  // 3. BOGLIQ USTUNLAR CREATE STATS (33.14 -> 50.43s)
  function sBogliqUstunlarCreateStats(t) {
    heading("3. BOG'LIQ USTUNLAR: CREATE STATISTICS", "Mustaqillik farazining qulashi va Extended Statistics", t, TM.scenes.bogliq_ustunlar_create_stats);

    const kProb = P(t, 34.5, 0.8);
    withA(kProb, () => {
      // Chap: Muammo
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kProb });
      text("Mustaqillik Farazi Qanday Adashadi?", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("So'rov: WHERE tuman = 'T17' AND viloyat = 'V7'", 180, 355, { size: 16, fam: MONO, color: C.ink });

      srect(180, 395, 700, 150, { fill: '#fff1f0', stroke: C.red });
      text("Planner hisobi (Ustunlarni mustaqil deb o'ylaydi):", 200, 430, { size: 16, weight: 700, fam: UI, color: C.red });
      text("P(tuman='T17') = 1%  va  P(viloyat='V7') = 10%", 200, 465, { size: 15, fam: MONO, color: C.ink });
      text("Birgalikda = 1% × 10% = 0.1%  -> Taxmin: 89 qator!", 200, 500, { size: 16, weight: 700, fam: MONO, color: C.red });

      text("Haqiqat: T17 tumani faqat V7 viloyatida bor!", 180, 575, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("Tuman viloyatni 100% aniqlaydi (funksional bog'liqlik).", 180, 605, { size: 17, color: C.ink, fam: UI });
      text("Haqiqiy natija: 1000 qator! (11 baravar tafovut!)", 180, 645, { size: 18, weight: 700, color: C.red, fam: UI });

      pill("11 baravar xato -> Noto'g'ri JOIN va yomon reja tanlanadi", 530, 745, C.red, kProb, 15);
    });

    const kSol = P(t, 41.5, 0.8);
    withA(kSol, () => {
      // O'ng: Yechim — CREATE STATISTICS
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kSol });
      text("Yechim: Extended Statistics Yaratish", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("CREATE STATISTICS manzil_dep (dependencies)", 1040, 355, { size: 16, fam: MONO, color: C.blue });
      text("  ON viloyat, tuman FROM manzillar;", 1040, 385, { size: 16, fam: MONO, color: C.blue });
      text("ANALYZE manzillar;", 1040, 415, { size: 16, fam: MONO, color: C.green });

      srect(1040, 450, 700, 150, { fill: '#f6ffed', stroke: C.green });
      text("pg_stats_ext katalogi:", 1060, 485, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("dependencies: {\"3 => 2\": 1.000000}", 1060, 520, { size: 17, weight: 700, fam: MONO, color: C.green });
      text("3-ustun (tuman) 2-ustunni (viloyat) to'liq aniqlaydi!", 1060, 555, { size: 15, fam: UI, color: C.ink });

      text("Natija: Taxmin 89 dan 963 qatorga ko'tarildi!", 1040, 635, { size: 18, weight: 700, color: C.green, fam: UI });
      text("Endi rejalashtiruvchi haqiqiy bog'liqlikni hisobga oladi.", 1040, 670, { size: 17, color: C.soft, fam: UI });

      pill("CREATE STATISTICS: Bog'liq ustunlar muammosini hal qiladi", 1390, 745, C.green, kSol, 15);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 46.5, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#e6fffa', col: C.green, p: kFoot3 });
      text("Nega PostgreSQL buni avtomatik qilmaydi?", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Jadvaldagi barcha ustunlar kombinatsiyasi eksponentsial ko'p — faqat bog'liqlarini dasturchi belgilaydi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. REJAGA TASIR VA DIALEKTLAR (50.43 -> 69.92s)
  function sRejagaTasirVaDialektlar(t) {
    heading("4. REJAGA TA'SIR QILISH VA DIALEKTLAR", "enable_* parametrlari, MySQL hintlar va SQLite optimize", t, TM.scenes.rejaga_tasir_va_dialektlar);

    const kPg = P(t, 51.5, 0.8);
    withA(kPg, () => {
      // Chap: Postgres enable_*
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kPg });
      text("PostgreSQL: Rejani Boshqarish", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("PostgreSQL'da so'rov ichida HINTLAR YO'Q!", 180, 355, { size: 18, weight: 700, color: C.red, fam: UI });

      text("Vaqtinchalik sinov uchun enable_* parametrlari:", 180, 410, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• SET enable_seqscan = off;   -- Seq Scan narxini sun'iy oshiradi", 180, 445, { size: 15, fam: MONO, color: C.blue });
      text("• SET enable_indexscan = off; -- Indeksni tekshirish uchun", 180, 480, { size: 15, fam: MONO, color: C.blue });
      text("• SET enable_hashjoin = off;  -- Nested loop bilan solishtirish", 180, 515, { size: 15, fam: MONO, color: C.blue });

      text("To'g'ri doimiy yo'llar:", 180, 580, { size: 19, weight: 700, color: C.green, fam: UI });
      text("1. ANALYZE qilish va statistikani yangilash.", 180, 615, { size: 17, color: C.green, fam: UI });
      text("2. SET STATISTICS n bilan namuna sonini oshirish.", 180, 650, { size: 17, color: C.ink, fam: UI });
      text("3. CREATE STATISTICS bilan bog'liqlikni berish.", 180, 685, { size: 17, color: C.blue, fam: UI });

      pill("enable_* faqat benchmark va sinov uchun, production'ga emas!", 530, 745, C.blue, kPg, 15);
    });

    const kDia = P(t, 58.5, 0.8);
    withA(kDia, () => {
      // O'ng: MySQL va SQLite
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kDia });
      text("MySQL va SQLite Boshqaruvi:", 1040, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("MySQL Optimizer Hints & Histogram:", 1040, 355, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("• So'rov ichida hint: /*+ NO_INDEX(t idx) */", 1040, 390, { size: 16, fam: MONO, color: C.orange });
      text("• Histogramma: ANALYZE TABLE b UPDATE HISTOGRAM", 1040, 425, { size: 15, fam: MONO, color: C.ink });
      text("  (Indekssiz ustunlar selektivligini yaxshilaydi).", 1040, 455, { size: 15, color: C.soft, fam: UI });

      text("SQLite: INDEXED BY & PRAGMA optimize:", 1040, 515, { size: 19, weight: 700, color: C.teal, fam: UI });
      text("• SELECT * FROM t INDEXED BY i; -- Indeksga majburlash", 1040, 550, { size: 15, fam: MONO, color: C.teal });
      text("• PRAGMA optimize; -- SQLite tavsiya qilgan aqlli yangilash", 1040, 585, { size: 15, fam: MONO, color: C.ink });
      text("  (Ilova yopilishidan oldin yoki kuniga 1 marta ishlatiladi).", 1040, 615, { size: 15, color: C.soft, fam: UI });

      text("sqlite_stat1: Jadvallar va indekslar o'rtacha takrorlanishlari.", 1040, 670, { size: 16, color: C.ink, fam: UI });

      pill("Har bir bazaning o'z boshqaruv va statistika mexanizmi bor", 1390, 745, C.orange, kDia, 15);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 64.5, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.green, p: kFoot4 });
      text("Xulosa: Eng yaxshi reja — yangi va to'liq statistikaga tayanadi!", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Katta yuklashlardan keyin ANALYZE qiling, bog'liq ustunlarga CREATE STATISTICS qo'ying.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.planner_va_selektivlik.e) sPlannerVaSelektivlik(t);
    else if (t < TM.scenes.pg_stats_tuzilishi.e) sPgStatsTuzilishi(t);
    else if (t < TM.scenes.bogliq_ustunlar_create_stats.e) sBogliqUstunlarCreateStats(t);
    else sRejagaTasirVaDialektlar(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
