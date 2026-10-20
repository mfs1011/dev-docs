// SQL 45-bob 1-qism: "Tushuncha" — EXPLAIN va Rejani O'qish
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

  // 1. REJA VA DARAXT (0 -> 18.37s)
  function sRejaVaDaraxt(t) {
    const k = P(t, 0.3, 1.0);
    hand("45-bob. EXPLAIN", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("So'rov Rejasi va Daraxt Tuzilmasi", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("SQL deklarativ til: biz 'nima', rejalashtiruvchi esa 'qanday' bajarishni aytadi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(260, 305, 1400 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Rejalashtiruvchi jarayoni
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("So'rov Rejasi Qanday Hosil Bo'ladi?", 180, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      srect(180, 445, 700, 70, { fill: '#f0f5ff', stroke: C.blue });
      text("1. SQL So'rovi: SELECT ... WHERE ...", 200, 488, { size: 17, weight: 700, fam: MONO, color: C.ink });

      arrow(530, 525, 530, 565, { col: C.blue, w: 2 });

      srect(180, 575, 700, 70, { fill: '#fffaf0', stroke: C.orange });
      text("2. Optimizer (Planner): Narxlarni hisoblaydi", 200, 618, { size: 17, weight: 700, fam: MONO, color: C.orange });

      arrow(530, 655, 530, 695, { col: C.green, w: 2 });

      srect(180, 705, 700, 70, { fill: '#f6ffed', stroke: C.green });
      text("3. Execution Plan: Eng arzon reja daraxti", 200, 748, { size: 17, weight: 700, fam: MONO, color: C.green });

      pill("EXPLAIN — shu reja daraxtini ko'rsatib beradi", 530, 800, C.blue, kBox, 15);

      // O'ng: Daraxt tuzilishi
      const kTree = P(t, 8.5, 0.8);
      withA(kTree, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.green, p: kTree });
        text("Reja Daraxtining Qavatlari:", 1040, 390, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Yuqori: Natijani shakllantirish tugunlari", 1040, 455, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("  -> Limit, Aggregate, Sort, HashAggregate", 1040, 485, { size: 17, fam: MONO, color: C.blue });

        text("O'rta: Birlashtirish (Join) tugunlari", 1040, 545, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("  -> Nested Loop, Hash Join, Merge Join", 1040, 575, { size: 17, fam: MONO, color: C.purple });

        text("Pastda: Skanerlash tugunlari (Boshlang'ich qatorlar)", 1040, 635, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("  -> Seq Scan, Index Scan, Bitmap Heap Scan", 1040, 665, { size: 17, fam: MONO, color: C.green });

        text("O'qish yo'nalishi: Pastdan yuqoriga va ichkaridan tashqariga!", 1040, 725, { size: 17, weight: 700, color: C.red, fam: UI });

        pill("Qatorlar daraxt bo'ylab pastdan yuqoriga oqadi", 1390, 780, C.green, kTree, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 14.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Xulosa: Har bir '->' belgisi ota tugunning bolasini bildiradi!", 960, 905, { size: 23, weight: 700, color: C.ink, fam: UI, align: 'center' });
        text("Rejani to'g'ri o'qish uchun doimo eng chuqur surilgan pastki tugundan boshlang.", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. TAXMINIY NARX (18.37 -> 35.98s)
  function sTaxminiyNarx(t) {
    heading("2. TAXMINIY NARX (COST, ROWS, WIDTH)", "So'rov bajarilmasdan oldingi analitik baholash", t, TM.scenes.taxminiy_narx);

    const kPlan = P(t, 19.5, 0.8);
    withA(kPlan, () => {
      // Chap: Misol qator
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kPlan });
      text("EXPLAIN Chiquvchi Qatori Tahlili:", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Oddiy EXPLAIN so'rovni BAJARMAYDI!", 180, 355, { size: 19, weight: 700, color: C.red, fam: UI });

      srect(180, 395, 700, 150, { fill: '#faf5ff', stroke: C.purple });
      text("Seq Scan on buyurtmalar", 200, 440, { size: 18, weight: 700, fam: MONO, color: C.ink });
      text("  (cost=0.00..3082.00 rows=200000 width=16)", 200, 485, { size: 17, weight: 700, fam: MONO, color: C.purple });

      text("• cost=0.00.. : Boshlash narxi (start cost)", 180, 580, { size: 18, color: C.ink, fam: UI });
      text("  Birinchi qatorni berishdan oldin qilinadigan ish.", 180, 610, { size: 16, color: C.soft, fam: UI });

      text("• ..3082.00 : To'liq narx (total cost)", 180, 650, { size: 18, color: C.ink, fam: UI });
      text("  Tugun oxirigacha to'liq bajarilsa sarflanadigan yuk.", 180, 680, { size: 16, color: C.soft, fam: UI });

      pill("Taxminiy hisob-kitoblar statistikaga tayanadi", 530, 745, C.purple, kPlan, 16);
    });

    const kCost = P(t, 26.5, 0.8);
    withA(kCost, () => {
      // O'ng: Narx va Rows tushunchasi
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kCost });
      text("Cost Nima va U Qanday Birlik?", 1040, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 120, { fill: '#fff1f0', stroke: C.red });
      text("DIQQAT: cost millisekund EMAS!", 1060, 380, { size: 20, weight: 700, fam: UI, color: C.red });
      text("Bu disk sahifasini o'qish (1.0) ga asoslangan shartli ball.", 1060, 420, { size: 16, fam: UI, color: C.ink });

      text("Qavs ichidagi boshqa sonlar:", 1040, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• rows=200000 : Kutilayotgan qatorlar soni", 1040, 535, { size: 18, color: C.green, fam: UI });
      text("  Tugun to'liq tugasa shuncha qator qaytaradi.", 1040, 565, { size: 16, color: C.soft, fam: UI });

      text("• width=16 : Bitta qatorning taxminiy o'rtacha kengligi (bayt).", 1040, 615, { size: 17, color: C.ink, fam: UI });
      text("  Xotira (RAM) ehtiyojini hisoblashda ishlatiladi.", 1040, 645, { size: 16, color: C.soft, fam: UI });

      text("• Ota tugun narxi bolalarining narxini O'Z ICHIGA OLADI.", 1040, 695, { size: 17, weight: 700, color: C.blue, fam: UI });

      pill("Cost — variantlarni solishtirish uchun ichki shkala", 1390, 745, C.orange, kCost, 16);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 32.0, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.orange, p: kFoot2 });
      text("Xulosa: Rejalashtiruvchi turli yo'llarni narxlab, eng past cost'lisini tanlaydi!", 960, 885, { size: 22, weight: 700, color: C.orange, fam: UI, align: 'center' });
      text("Agar statistika eskirgan bo'lsa, cost hisobi adashadi va noto'g'ri reja tanlanadi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 3. HAQIQIY NATIJA ANALYZE (35.98 -> 52.09s)
  function sHaqiqiyNatijaAnalyze(t) {
    heading("3. HAQIQIY NATIJA: EXPLAIN ANALYZE", "Haqiqiy bajarilish vaqti, rows va loops ko'paytuvchisi", t, TM.scenes.haqiqiy_natija_analyze);

    const kAn = P(t, 36.5, 0.8);
    withA(kAn, () => {
      // Chap: EXPLAIN ANALYZE
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kAn });
      text("EXPLAIN ANALYZE Farqi Nima?", 180, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("So'rov HAQIQATAN bajariladi va o'lchanadi:", 180, 355, { size: 19, weight: 700, color: C.ink, fam: UI });

      srect(180, 395, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Index Scan on mijozlar", 200, 430, { size: 16, weight: 700, fam: MONO, color: C.ink });
      text("  (cost=0.29..8.38 rows=5 width=13)", 200, 465, { size: 15, fam: MONO, color: C.soft });
      text("  (actual time=0.002..0.002 rows=5.00 loops=1)", 200, 505, { size: 16, weight: 700, fam: MONO, color: C.green });

      text("• actual time : Millisekundlarda haqiqiy vaqt!", 180, 590, { size: 18, weight: 700, color: C.green, fam: UI });
      text("  0.002 ms — birinchi qator, 0.002 ms — oxirgi qator.", 180, 620, { size: 16, color: C.soft, fam: UI });

      text("• actual rows : Haqiqatda chiqqan qatorlar soni.", 180, 660, { size: 18, color: C.ink, fam: UI });
      text("  Taxmin bilan haqiqat mos kelsa — statistika a'lo!", 180, 690, { size: 17, weight: 600, color: C.green, fam: UI });

      pill("Taxminiy va haqiqiy qatorlar mosligi — eng muhim signal", 530, 745, C.green, kAn, 15);
    });

    const kLoop = P(t, 43.5, 0.8);
    withA(kLoop, () => {
      // O'ng: Loops va Buffers
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kLoop });
      text("Loops Ko'paytuvchisi va BUFFERS:", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 140, { fill: '#fffaf0', stroke: C.orange });
      text("-> Bitmap Heap Scan on buyurtmalar", 1060, 375, { size: 16, weight: 700, fam: MONO, color: C.ink });
      text("   (actual time=0.002..0.004 rows=10.00 loops=5)", 1060, 415, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("   Jami qatorlar = rows (10) × loops (5) = 50 ta!", 1060, 455, { size: 16, weight: 700, fam: MONO, color: C.green });

      text("MUHIM QOIDA: actual time va rows — bitta loop o'rtachasi!", 1040, 515, { size: 18, weight: 700, color: C.red, fam: UI });
      text("Nested loop'da ichki tugun umumiy vaqti = time × loops.", 1040, 545, { size: 17, color: C.ink, fam: UI });

      text("BUFFERS ma'lumotlari (PostgreSQL 18 da avtomatik):", 1040, 605, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("• shared hit=63 : Bloklar RAM keshda topildi (diskka borilmadi).", 1040, 640, { size: 16, color: C.green, fam: UI });
      text("• read=3 : Bloklar bevosita sekin diskdan o'qildi.", 1040, 675, { size: 16, color: C.red, fam: UI });

      pill("Umumiy bajarilish vaqti va disk murojaatlarini aniq ko'rsatadi", 1390, 745, C.blue, kLoop, 15);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 48.0, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#f0f5ff', col: C.blue, p: kFoot3 });
      text("Xulosa: Performance tuning uchun doimo EXPLAIN ANALYZE kerak!", 960, 885, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
      text("Taxminiy rows bilan haqiqiy rows o'rtasidagi tafovut optimallashtirishning 1-raqamli nishonidir.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. OGOHLANTIRISH VA DML (52.09 -> 69.66s)
  function sOgohlantirishVaDml(t) {
    heading("4. OGOHLANTIRISH VA DML XAVFSIZLIGI", "DELETE va UPDATE bilan ishlashda xavfsiz BEGIN/ROLLBACK", t, TM.scenes.ogohlantirish_va_dml);

    const kDml = P(t, 53.0, 0.8);
    withA(kDml, () => {
      // Chap: Xavf va yechim
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kDml });
      text("KATTA XAVF: ANALYZE Bajaradi!", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("EXPLAIN ANALYZE DELETE ... yozsangiz,", 180, 355, { size: 18, color: C.ink, fam: UI });
      text("qatorlar bazadan HAQIQATAN o'chiriladi!", 180, 385, { size: 20, weight: 700, color: C.red, fam: UI });

      srect(180, 425, 700, 200, { fill: '#f6ffed', stroke: C.green });
      text("XAVFSIZ TEKSHIRISH ANDOZASI:", 200, 460, { size: 16, weight: 700, fam: UI, color: C.green });
      text("BEGIN;", 200, 495, { size: 18, weight: 700, fam: MONO, color: C.blue });
      text("EXPLAIN ANALYZE", 200, 530, { size: 18, weight: 700, fam: MONO, color: C.orange });
      text("  DELETE FROM buyurtmalar WHERE ...;", 200, 565, { size: 16, fam: MONO, color: C.ink });
      text("ROLLBACK;  -- Barcha o'zgarishlar bekor!", 200, 605, { size: 18, weight: 700, fam: MONO, color: C.green });

      text("• Rejani va o'chirilgan qatorlarni ko'rasiz,", 180, 655, { size: 17, color: C.ink, fam: UI });
      text("  ammo ma'lumotlar bazangizga ziyon yetmaydi.", 180, 685, { size: 17, color: C.green, fam: UI });

      pill("DML so'rovlarida ANALYZE qilsangiz, ROLLBACK shart!", 530, 755, C.red, kDml, 16);
    });

    const kCaveats = P(t, 59.5, 0.8);
    withA(kCaveats, () => {
      // O'ng: Hujjatdagi ogohlantirishlar
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kCaveats });
      text("Ehtiyot Bo'ladigan 3 Ta Holat:", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("1. Kichik jadvaldagi reja katta jadvalga to'g'ri kelmaydi:", 1040, 360, { size: 18, weight: 700, color: C.orange, fam: UI });
      text("   Kichik jadvalda indeks bo'lsa ham baza Seq Scan qiladi.", 1040, 395, { size: 16, color: C.ink, fam: UI });
      text("   Testlarni doim real production hajmida bajaring!", 1040, 425, { size: 16, color: C.green, fam: UI });

      text("2. LIMIT erta to'xtatgan tugunlar:", 1040, 480, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("   Taxminiy rows 200 000 bo'lib, actual rows 10 bo'lishi normal.", 1040, 515, { size: 16, color: C.soft, fam: UI });

      text("3. O'lchashning o'z narxi bor (overhead):", 1040, 570, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("   Har tugun vaqtini mikrosekundda o'lchash so'rovni sekinlashtiradi.", 1040, 605, { size: 16, color: C.soft, fam: UI });
      text("   Kerak bo'lsa: EXPLAIN (ANALYZE, TIMING OFF)", 1040, 640, { size: 16, fam: MONO, color: C.blue });

      pill("Production testlarida rejalashtiruvchi tabiatini inobatga oling", 1390, 755, C.blue, kCaveats, 15);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 64.5, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.green, p: kFoot4 });
      text("Oltin qoida: EXPLAIN tahlili — eng samarali SQL mutaxassisining qurolidir!", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("So'rov nima uchun sekin ishlayotganini taxmin qilmang — EXPLAIN rejasidan ko'ring.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.reja_va_daraxt.e) sRejaVaDaraxt(t);
    else if (t < TM.scenes.taxminiy_narx.e) sTaxminiyNarx(t);
    else if (t < TM.scenes.haqiqiy_natija_analyze.e) sHaqiqiyNatijaAnalyze(t);
    else sOgohlantirishVaDml(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
