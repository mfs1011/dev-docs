// SQL 41-bob 2-qism: "Kod" — Indeks qanday ishlaydi
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. SEQ SCAN VS INDEX SCAN (0 -> 17.39s)
  function sSeqScanVsIndexScan(t) {
    const k = P(t, 0.3, 1.0);
    hand("41-bob. Indeks Amaliyotda", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Seq Scan vs Index Scan (PostgreSQL 18)", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("100 000 qatorli jadvalda real EXPLAIN ANALYZE o'lchovlari", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Indekssiz Seq Scan
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kBox });
      text("Terminal 1: Indekssiz To'liq Skanerlash", 180, 430, { size: 22, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN ANALYZE SELECT * FROM buyurtmalar", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("WHERE mijoz_id = 777;", 180, 525, { size: 17, fam: MONO, color: '#cdd6f4' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("-> Seq Scan on buyurtmalar (rows=10)", 180, 585, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });
      text("   Filter: (mijoz_id = 777)", 180, 615, { size: 17, fam: MONO, color: '#a6adc8' });
      text("   Rows Removed by Filter: 99990", 180, 645, { size: 17, fam: MONO, color: '#f38ba8' });
      text("   Buffers: shared hit=637 (barcha sahifalar!)", 180, 680, { size: 17, weight: 700, fam: MONO, color: '#fab387' });
      pill("637 ta sahifa to'liq o'qildi", 530, 765, C.red, kBox, 16);

      // O'ng: B-Tree Index Scan
      const kIdx = P(t, 9.0, 0.8);
      withA(kIdx, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kIdx });
        text("Terminal 2: B-Tree Indeksidan Keyin", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("CREATE INDEX ON buyurtmalar(mijoz_id);", 1040, 495, { size: 17, fam: MONO, color: '#89b4fa' });
        text("EXPLAIN (ANALYZE, BUFFERS) SELECT ...;", 1040, 525, { size: 17, fam: MONO, color: '#cdd6f4' });

        sline(1040, 550, 1740, 550, { col: '#45475a', w: 1 });
        text("-> Bitmap Heap Scan (rows=10)", 1040, 585, { size: 18, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   Buffers: shared hit=10 read=2 (JAMI: 12)", 1040, 615, { size: 18, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   -> Bitmap Index Scan on mijoz_idx", 1040, 650, { size: 17, fam: MONO, color: '#89b4fa' });
        text("      Index Searches: 1, Buffers: read=2", 1040, 680, { size: 17, fam: MONO, color: '#cdd6f4' });
        pill("637 ta sahifa o'rniga atigi 12 ta!", 1390, 765, C.green, kIdx, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Haqiqiy O'lchov Xulosasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Indeks tufayli disk/kesh sahifalariga murojaat 637 tadan 12 tagacha (50 baravar) qisqardi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("99 990 ta keraksiz qatorni filtrlash o'rniga, faqat 10 ta kerakli qator to'g'ridan-to'g'ri olindi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. USTUNGA AMAL XATOSI (17.39 -> 33.82s)
  function sUstungaAmal(t) {
    heading("Ustunga Amal Qo'llash: Indeks Nega O'chib Qoladi?", t, TM.scenes.ustunga_amal_xatosi.s);

    const kCards = P(t, TM.scenes.ustunga_amal_xatosi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Xato kod va oqibat
      card(140, 380, 780, 420, { fill: C.card, col: C.red, p: kCards });
      text("Xato: Ustun Ustida Har Qanday Amal", 180, 430, { size: 23, weight: 700, color: C.red, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("1. Arifmetik amal:", 180, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   WHERE mijoz_id + 0 = 777;", 180, 525, { size: 17, fam: MONO, color: C.red });

      text("2. Tipni o'zgartirish (cast / funksiya):", 180, 565, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   WHERE mijoz_id::text = '777';", 180, 595, { size: 17, fam: MONO, color: C.red });
      text("   WHERE DATE(yaratilgan) = '2026-10-20';", 180, 625, { size: 17, fam: MONO, color: C.red });

      sline(180, 660, 880, 660, { col: C.pencil, w: 1 });
      text("Oqibat: Indeks to'liq bekor qilinadi -> Seq Scan!", 180, 700, { size: 20, weight: 700, color: C.red, fam: UI });
      pill("Indeks ifodani tanimaydi: Seq Scan", 530, 765, C.red, kCards, 16);

      // O'ng: Sabab va to'g'ri yo'l
      const kFix = P(t, 25.5, 0.8);
      withA(kFix, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kFix });
        text("To'g'ri Yechim: Ustunni Toza Qoldirish", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Shartni qiymat tomoniga ko'chiring:", 1040, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("   WHERE mijoz_id = 777;  (amal yo'q)", 1040, 525, { size: 17, fam: MONO, color: C.green });

        text("2. Sana oralig'idan foydalaning:", 1040, 565, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("   WHERE yaratilgan >= '2026-10-20 00:00:00'", 1040, 595, { size: 16, fam: MONO, color: C.green });
        text("     AND yaratilgan <  '2026-10-21 00:00:00';", 1040, 625, { size: 16, fam: MONO, color: C.green });

        sline(1040, 660, 1740, 660, { col: C.pencil, w: 1 });
        text("3. Yoki maxsus Ifoda Indeksi (43-bob) quring:", 1040, 700, { size: 18, color: C.soft, fam: UI });
        text("   CREATE INDEX ON buyurtmalar (DATE(yaratilgan));", 1040, 730, { size: 16, fam: MONO, color: C.blue });
        pill("Ustun doimo sof holatda qolsin", 1390, 765, C.green, kFix, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 29.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("Nega Bunday Bo'ladi?", 180, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("B-tree daraxtida sof 'mijoz_id' qiymatlari tartiblangan. Baza 'mijoz_id + 0' amali har bir qatorda", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("qanday natija berishini oldindan bilmaydi va butun jadvalni boshidan oxirigacha tekshirishga majbur bo'ladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. SELEKTIVLIK TAJRIBASI (33.82 -> 50.17s)
  function sSelektivlik(t) {
    heading("Selektivlik Sinovi: 2% Yangi vs 98% Yopilgan", t, TM.scenes.selektivlik_tajribasi.s);

    const kCards = P(t, TM.scenes.selektivlik_tajribasi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: 2% Yangi buyurtmalar
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kCards });
      text("2% Selektivlik: holat = 'yangi'", 180, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("SELECT count(*) FROM buyurtmalar", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("WHERE holat = 'yangi';  (4 000 qator / 2%)", 180, 525, { size: 17, fam: MONO, color: '#89b4fa' });

      sline(180, 555, 880, 555, { col: '#45475a', w: 1 });
      text("EXPLAIN ANALYZE Natijasi:", 180, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
      text("-> Index Only Scan using buyurtmalar_holat_idx", 180, 625, { size: 17, fam: MONO, color: '#a6e3a1' });
      text("   Index Cond: (holat = 'yangi')", 180, 655, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("   (Asosiy jadval sahifalariga bormaydi!)", 180, 685, { size: 16, fam: UI, color: '#a6adc8' });
      pill("2% = Qoplovchi Index Only Scan ✓", 530, 765, C.green, kCards, 16);

      // O'ng: 98% Yopilgan buyurtmalar
      const kLow = P(t, 42.0, 0.8);
      withA(kLow, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kLow });
        text("98% Selektivlik: holat = 'yopilgan'", 1040, 430, { size: 22, weight: 700, color: '#f38ba8', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT count(*) FROM buyurtmalar", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("WHERE holat = 'yopilgan'; (196 000 qator / 98%)", 1040, 525, { size: 17, fam: MONO, color: '#f38ba8' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("EXPLAIN ANALYZE Natijasi:", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
        text("-> Seq Scan on buyurtmalar (indekssiz!)", 1040, 625, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });
        text("   Filter: (holat = 'yopilgan')", 1040, 655, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("   (Rejalashtiruvchi indeksdan voz kechdi)", 1040, 685, { size: 16, fam: UI, color: '#a6adc8' });
        pill("98% = To'liq Seq Scan tezroq ✗", 1390, 765, C.red, kLow, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 46.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Rejalashtiruvchining O'ta Muhim Mantig'i:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Bir xil indeks 'yangi' shartida juda yaxshi ishladi, ammo 'yopilgan' shartida butunlay tashlab ketildi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Chunki deyarli hamma qator kerak bo'lsa, xotiradagi sahifalarni ketma-ket o'qish tasodifiy sakrashlardan ancha tezdir.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. YOZISH NARXI VA STATISTIKA (50.17 -> 69.32s)
  function sYozishNarxi(t) {
    heading("Indeks Hajmi, Yozish Narxi va Audit (pg_stat_user_indexes)", t, TM.scenes.yozish_narxi_va_statistika.s);

    const kCards = P(t, TM.scenes.yozish_narxi_va_statistika.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Disk hajmi va yozish sekinlashishi
      card(140, 380, 780, 420, { fill: C.card, col: C.orange, p: kCards });
      text("Indeks Hajmi va Yozish Xarajati:", 180, 430, { size: 23, weight: 700, color: C.orange, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("Real Disk O'lchovlari (PostgreSQL 18):", 180, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• buyurtmalar jadvali:    5 096 kB", 180, 530, { size: 17, fam: MONO, color: C.ink });
      text("• buyurtmalar_pkey:       2 208 kB", 180, 560, { size: 17, fam: MONO, color: C.ink });
      text("• buyurtmalar_mijoz_idx:    936 kB", 180, 590, { size: 17, fam: MONO, color: C.ink });
      text("• buyurtmalar_holat_idx:    704 kB", 180, 620, { size: 17, fam: MONO, color: C.ink });

      sline(180, 655, 880, 655, { col: C.pencil, w: 1 });
      text("100 000 INSERT vaqti:", 180, 690, { size: 19, weight: 700, color: C.red, fam: UI });
      text("1 ta indeksda: 155 ms  -->  3 ta indeksda: 391 ms (2.5x sekin)", 180, 720, { size: 17, weight: 600, fam: UI, color: C.red });
      pill("Jadval 5 MB, indekslar yana 4 MB (+75%)", 530, 765, C.orange, kCards, 16);

      // O'ng: Foydasiz indekslarni audit qilish
      const kStat = P(t, 59.0, 0.8);
      withA(kStat, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kStat });
        text("Audit: pg_stat_user_indexes", 1040, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT indexrelname, idx_scan", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("FROM pg_stat_user_indexes WHERE relname='buyurtmalar';", 1040, 525, { size: 16, fam: MONO, color: '#a6adc8' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("indexrelname          | idx_scan", 1040, 590, { size: 18, weight: 700, fam: MONO, color: '#cdd6f4' });
        sline(1040, 605, 1740, 605, { col: '#45475a', w: 1 });
        text("buyurtmalar_mijoz_idx |        3  (Foydali ✓)", 1040, 635, { size: 18, fam: MONO, color: '#a6e3a1' });
        text("buyurtmalar_holat_idx |        0  (HECH QACHON! ✗)", 1040, 670, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });

        text("idx_scan = 0 bo'lsa darhol DROP INDEX qiling!", 1040, 715, { size: 17, weight: 600, fam: UI, color: '#f38ba8' });
        pill("idx_scan = 0 bo'lgan indeksni o'chiring", 1390, 765, C.blue, kStat, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 63.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Yodda Tutish Shart Bo'lgan Oltin Qoida:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Indeks o'qishni tezlashtiradi, lekin yozishni sekinlashtiradi va xotirani band qiladi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Shuning uchun har bir yangi indeksni 'kerak bo'lib qolar' deb emas, haqiqiy ehtiyoj va statistikaga qarab qo'ying.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.ustunga_amal_xatosi.s) {
      sSeqScanVsIndexScan(t);
    } else if (t < TM.scenes.selektivlik_tajribasi.s) {
      sUstungaAmal(t);
    } else if (t < TM.scenes.yozish_narxi_va_statistika.s) {
      sSelektivlik(t);
    } else {
      sYozishNarxi(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
