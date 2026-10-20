// SQL 46-bob 2-qism: "Kod" — Planner va Statistika
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

  // 1. PG_STATS KORINISHI (0 -> 17.256s)
  function sPgStatsKorinishi(t) {
    const k = P(t, 0.3, 1.0);
    hand("46-bob. Planner va Statistika", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("pg_stats: Statistika Ma'lumotlarini O'qish", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL statistik kataloglari va namuna asosidagi selektivlik ko'rsatkichlari", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Jadval tuzilishi
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("1. Sinov Jadvali: 100 000 ta Manzil", 180, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("CREATE TABLE manzillar (", 180, 455, { size: 16, fam: MONO, color: C.ink });
      text("  id int PRIMARY KEY,", 180, 485, { size: 16, fam: MONO, color: C.ink });
      text("  viloyat text, tuman text, holat text", 180, 515, { size: 16, fam: MONO, color: C.ink });
      text(");", 180, 545, { size: 16, fam: MONO, color: C.ink });

      srect(180, 575, 700, 130, { fill: '#f0f5ff', stroke: C.blue });
      text("Haqiqiy taqsimot:", 200, 605, { size: 17, weight: 700, fam: UI, color: C.blue });
      text("• 10 ta viloyat ('V0'..'V9'), 100 ta tuman ('T0'..'T99')", 200, 635, { size: 16, fam: UI, color: C.ink });
      text("• Har tuman bitta viloyatga tegishli (to'liq bog'liq!)", 200, 665, { size: 16, fam: UI, color: C.orange, weight: 700 });
      text("• holat: 98% 'faol', 2% 'yangi'", 200, 695, { size: 16, fam: UI, color: C.green });

      pill("100 000 qator va 541 sahifa (ANALYZE qilingan)", 530, 780, C.blue, kBox, 16);

      // O'ng: pg_stats natijalari
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.purple, p: kRight });
        text("2. pg_stats Natijalari (Namuna Asosida)", 1040, 390, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("SELECT attname, n_distinct, most_common_vals,", 1040, 450, { size: 15, fam: MONO, color: C.ink });
        text("       most_common_freqs FROM pg_stats;", 1040, 475, { size: 15, fam: MONO, color: C.ink });

        srect(1040, 505, 700, 180, { fill: '#faf5ff', stroke: C.purple });
        text("attname | n_distinct | most_common_vals | most_common_freqs", 1060, 535, { size: 14, weight: 700, fam: MONO, color: C.purple });
        sline(1060, 550, 1720, 550, { col: C.pencil, w: 1 });
        text("holat   |          2 | {faol,yangi}     | {0.9797, 0.0203}", 1060, 580, { size: 14, fam: MONO, color: C.ink });
        text("viloyat |         10 | {V8,V5,V4,...}   | {0.1039, 0.1019,...}", 1060, 615, { size: 14, fam: MONO, color: C.ink });
        text("tuman   |        100 | {T7,T17,...}     | {0.0102, 0.0101,...}", 1060, 650, { size: 14, fam: MONO, color: C.ink });

        text("Taxmin: holat='yangi' uchun 100 000 * 2.03% = ~2033 qator", 1040, 715, { size: 16, weight: 700, color: C.green, fam: UI });

        pill("Statistika namuna orqali olinadi — taxminiy hisob", 1390, 780, C.purple, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Bitta ustun shartlarida pg_stats juda yuqori aniqlik beradi!", 960, 905, { size: 23, weight: 700, color: C.blue, fam: UI, align: 'center' });
        text("Ammo ikkita yoki undan ortiq ustunlar birga kelganda nima bo'ladi?", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. BOG'LIQ USTUNLAR XATOSI (17.256 -> 29.776s)
  function sBogliqUstunlarXatosi(t) {
    heading("2. BOG'LIQ USTUNLAR: 11 BARAVAR XATOLIK", "WHERE tuman = 'T17' AND viloyat = 'V7' so'rovi tahlili", t, TM.scenes.bogliq_ustunlar_xatosi);

    const kBox = P(t, 18.0, 0.8);
    withA(kBox, () => {
      // Chap: Rejalashtiruvchi qanday hisobladi?
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kBox });
      text("1. Mustaqil Ustunlar Gipotezasi (Xato)", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Planner har ikkala shartni mustaqil deb o'ylaydi:", 180, 360, { size: 18, fam: UI, color: C.ink });

      srect(180, 395, 700, 150, { fill: '#fff7e6', stroke: C.orange });
      text("P(viloyat = 'V7') = 10% (10 ta viloyat)", 200, 435, { size: 18, fam: MONO, color: C.ink });
      text("P(tuman = 'T17')  = 1%  (100 ta tuman)", 200, 475, { size: 18, fam: MONO, color: C.ink });
      text("Birgalikda: 10% * 1% = 0.1% (0.001)", 200, 515, { size: 18, weight: 700, fam: MONO, color: C.red });

      text("100 000 qator * 0.001 ≈ 89..100 qator kutiladi!", 180, 585, { size: 19, weight: 700, color: C.red, fam: UI });

      text("Ammo haqiqatda 'T17' tumanining barcha 1000 ta manzili", 180, 635, { size: 17, color: C.ink, fam: UI });
      text("aynan 'V7' viloyatida joylashgan! Ikkinchi shart filtrlashmaydi!", 180, 665, { size: 17, weight: 700, color: C.orange, fam: UI });

      pill("Mustaqillik farazi 11x kam baholashga olib keldi", 530, 745, C.orange, kBox, 16);

      // O'ng: EXPLAIN natijasi
      const kRight = P(t, 22.0, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.red, p: kRight });
        text("2. EXPLAIN ANALYZE Natijasi", 1040, 290, { size: 24, weight: 700, color: C.red, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        text("EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)", 1040, 350, { size: 15, fam: MONO, color: C.ink });
        text("SELECT * FROM manzillar WHERE tuman='T17' AND viloyat='V7';", 1040, 375, { size: 15, fam: MONO, color: C.ink });

        srect(1040, 410, 700, 160, { fill: '#fff1f0', stroke: C.red });
        text("Seq Scan on manzillar", 1060, 445, { size: 16, weight: 700, fam: MONO, color: C.red });
        text("  (cost=0.00..2041.00 rows=89 width=15)", 1060, 475, { size: 16, weight: 700, fam: MONO, color: C.red });
        text("  (actual rows=1000.00 loops=1)", 1060, 510, { size: 16, weight: 700, fam: MONO, color: C.blue });
        text("  Filter: ((tuman = 'T17') AND (viloyat = 'V7'))", 1060, 545, { size: 14, fam: MONO, color: C.soft });

        card(1040, 600, 700, 110, { fill: '#ffffff', col: C.red, p: kRight });
        text("Taxmin: 89 qator  <--->  Haqiqat: 1000 qator", 1390, 645, { size: 22, weight: 700, color: C.red, fam: UI, align: 'center' });
        text("Xatolik: 11.2 baravar! JOIN rejalarini buzuvchi asosiy sabab.", 1390, 680, { size: 17, color: C.ink, fam: UI, align: 'center' });

        pill("Katta so'rovda bu noto'g'ri Nested Loop tanlaydi", 1390, 745, C.red, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 26.5, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#fff8e7', col: C.orange, p: kFoot });
        text("Rejalashtiruvchi tuman viloyatga bog'liqligini qayerdan bilishi mumkin?", 960, 890, { size: 23, weight: 700, color: C.orange, fam: UI, align: 'center' });
        text("Buning uchun PostgreSQL kengaytirilgan statistika mexanizmini beradi: CREATE STATISTICS!", 960, 935, { size: 20, weight: 700, color: C.blue, fam: UI, align: 'center' });
      });
    });
  }

  // 3. CREATE STATISTICS YECHIMI (29.776 -> 46.547s)
  function sCreateStatisticsYechimi(t) {
    heading("3. CREATE STATISTICS VA TO'G'RI TAXMIN", "Funksional bog'liqlik (dependencies) hisobga olinganda", t, TM.scenes.create_statistics_yechimi);

    const kBox = P(t, 30.5, 0.8);
    withA(kBox, () => {
      // Chap: CREATE STATISTICS buyrug'i
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kBox });
      text("1. Funksional Bog'liqlik Yaratish", 180, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("-- Bog'liq ustunlar uchun maxsus statistika:", 180, 355, { size: 15, fam: MONO, color: C.soft });
      text("CREATE STATISTICS manzil_dep (dependencies)", 180, 385, { size: 16, weight: 700, fam: MONO, color: C.blue });
      text("ON viloyat, tuman FROM manzillar;", 180, 415, { size: 16, weight: 700, fam: MONO, color: C.blue });
      text("ANALYZE manzillar;", 180, 450, { size: 16, weight: 700, fam: MONO, color: C.green });

      srect(180, 490, 700, 140, { fill: '#f6ffed', stroke: C.green });
      text("pg_stats_ext katalogidagi natija:", 200, 525, { size: 17, weight: 700, fam: UI, color: C.green });
      text("statistics_name: manzil_dep", 200, 560, { size: 16, fam: MONO, color: C.ink });
      text("dependencies:    {\"3 => 2\": 1.000000}", 200, 595, { size: 17, weight: 700, fam: MONO, color: C.green });

      text("{\"3 => 2\": 1.0} -> 3-ustun (tuman) 2-ustunni (viloyat)", 180, 665, { size: 17, fam: UI, color: C.ink });
      text("100% (1.0) to'liq belgilaydi deb aniqlandi!", 180, 695, { size: 17, weight: 700, fam: UI, color: C.green });

      pill("dependencies turi bir-birini belgilovchi ustunlar uchun", 530, 745, C.green, kBox, 16);

      // O'ng: Yangilangan EXPLAIN rejasi
      const kRight = P(t, 37.0, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kRight });
        text("2. Yangilangan EXPLAIN Natijasi", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        text("EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)", 1040, 350, { size: 15, fam: MONO, color: C.ink });
        text("SELECT * FROM manzillar WHERE tuman='T17' AND viloyat='V7';", 1040, 375, { size: 15, fam: MONO, color: C.ink });

        srect(1040, 410, 700, 160, { fill: '#e6f7ff', stroke: C.blue });
        text("Seq Scan on manzillar", 1060, 445, { size: 16, weight: 700, fam: MONO, color: C.ink });
        text("  (cost=0.00..2041.00 rows=963 width=15)", 1060, 475, { size: 18, weight: 700, fam: MONO, color: C.green });
        text("  (actual rows=1000.00 loops=1)", 1060, 510, { size: 16, weight: 700, fam: MONO, color: C.blue });
        text("  Filter: ((tuman = 'T17') AND (viloyat = 'V7'))", 1060, 545, { size: 14, fam: MONO, color: C.soft });

        card(1040, 600, 700, 110, { fill: '#ffffff', col: C.green, p: kRight });
        text("Eski taxmin: 89  -->  Yangi taxmin: 963!", 1390, 645, { size: 23, weight: 700, color: C.green, fam: UI, align: 'center' });
        text("Haqiqat (1000 qator) bilan deyarli to'liq mos keldi!", 1390, 680, { size: 17, color: C.ink, fam: UI, align: 'center' });

        pill("11 baravar xatolik to'liq bartaraf etildi", 1390, 745, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 42.0, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#f6ffed', col: C.green, p: kFoot });
        text("Xulosa: Bog'liq ustunlar bo'yicha filter yoki JOIN bo'lsa, CREATE STATISTICS shart!", 960, 890, { size: 23, weight: 700, color: C.green, fam: UI, align: 'center' });
        text("Aks holda optimizator noto'g'ri arzon reja tanlab so'rovni sekinlashtiradi.", 960, 935, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 4. ESKIRGAN STATISTIKA VA ENABLE (46.547 -> 66.92s)
  function sEskirganStatistikaVaEnable(t) {
    heading("4. ESKIRGAN STATISTIKA VA REJANI TEKSHIRISH", "200k yangi qator kiritilganda va enable_seqscan ta'siri", t, TM.scenes.eskirgan_statistika_va_enable);

    const kBox = P(t, 47.0, 0.8);
    withA(kBox, () => {
      // Chap: Eskirgan statistika (Stale statistics)
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. Eskirgan Statistika (33x Xatolik)", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("200 000 ta 'yangi' qator qo'shildi va ANALYZE qilinmadi:", 180, 350, { size: 16, fam: UI, color: C.ink });

      srect(180, 380, 700, 100, { fill: '#fff1f0', stroke: C.red });
      text("ANALYZE'siz: rows=6026 (actual rows=202000)", 200, 420, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("-> 33 baravar kam taxmin! Chunki ulush hali ham 2% deb o'yladi.", 200, 455, { size: 15, fam: UI, color: C.ink });

      srect(180, 495, 700, 100, { fill: '#f6ffed', stroke: C.green });
      text("ANALYZE'dan so'ng: rows=202490 (actual rows=202000)", 200, 535, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("-> Yangi statistika yuklangach, taxmin 100% aniq bo'ldi!", 200, 570, { size: 15, fam: UI, color: C.ink });

      text("Oltin qoida: Har qanday katta INSERT yoki COPY'dan so'ng", 180, 630, { size: 17, weight: 700, color: C.orange, fam: UI });
      text("albatta jadvalda ANALYZE bajarilishi shart!", 180, 660, { size: 17, weight: 700, color: C.red, fam: UI });

      pill("Katta yuklashdan so'ng ANALYZE qilish majburiy", 530, 745, C.red, kBox, 16);

      // O'ng: enable_seqscan = off
      const kRight = P(t, 54.0, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kRight });
        text("2. enable_* Bilan Gipotezani Tekshirish", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        text("SET enable_seqscan = off;", 1040, 350, { size: 16, weight: 700, fam: MONO, color: C.blue });
        text("-- Ketma-ket skanni 'taqiqlamaydi', narxini juda oshiradi:", 1040, 380, { size: 14, fam: MONO, color: C.soft });

        srect(1040, 410, 700, 140, { fill: '#f0f5ff', stroke: C.blue });
        text("-> Parallel Bitmap Heap Scan on manzillar", 1060, 445, { size: 15, weight: 700, fam: MONO, color: C.blue });
        text("     -> Bitmap Index Scan on m_holat", 1060, 475, { size: 15, fam: MONO, color: C.soft });
        text("Execution Time: 6.145 ms (Seq Scan: 6.753 ms)", 1060, 515, { size: 16, weight: 700, fam: MONO, color: C.green });

        card(1040, 575, 700, 130, { fill: '#fff8e7', col: C.orange, p: kRight });
        text("Hujjat tavsiyasi: enable_* faqat tekshiruv uchun!", 1390, 615, { size: 20, weight: 700, color: C.orange, fam: UI, align: 'center' });
        text("Production tizimda bu doimiy yechim emas.", 1390, 650, { size: 17, color: C.ink, fam: UI, align: 'center' });
        text("Asosiy yechim — to'g'ri statistika va indeks dizayni.", 1390, 680, { size: 16, color: C.soft, fam: UI, align: 'center' });

        pill("enable_* faqat benchmark va diagnostika uchun", 1390, 745, C.blue, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 60.5, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#f0f5ff', col: C.blue, p: kFoot });
        text("Xulosa: Planner statistika asosida ishlaydi — uni toza va dolzarb saqlang!", 960, 890, { size: 24, weight: 700, color: C.blue, fam: UI, align: 'center' });
        text("Keyingi qismda MySQL gistogrammalari va SQLite optimizatsiyasini ko'rib chiqamiz.", 960, 935, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  window.renderFrame = function (t) {
    bg('#f8fafc');
    const { pg_stats_korinishi, bogliq_ustunlar_xatosi, create_statistics_yechimi, eskirgan_statistika_va_enable } = TM.scenes;

    if (t < bogliq_ustunlar_xatosi.s) {
      sPgStatsKorinishi(t);
    } else if (t < create_statistics_yechimi.s) {
      sBogliqUstunlarXatosi(t);
    } else if (t < eskirgan_statistika_va_enable.s) {
      sCreateStatisticsYechimi(t);
    } else {
      sEskirganStatistikaVaEnable(t);
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
