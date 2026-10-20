// SQL 42-bob 2-qism: "Kod" — Ko'p ustunli indeks
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

  // 1. CHAP USTUN AMALIYOTI (0 -> 16.70s)
  function sChapUstunAmaliyoti(t) {
    const k = P(t, 0.3, 1.0);
    hand("42-bob. Ko'p Ustunli Indeks Kodu", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Chap Ustunlar Qoidasi: EXPLAIN Tahlili", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18: 200 000 qatorli xodimlar jadvalida real rejalar", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Ikkala ustun berilganda
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kBox });
      text("1. Ikkala Ustun: rol = 'talaba' AND boy = 180", 180, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN (COSTS OFF) SELECT count(*)", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("FROM xodimlar WHERE rol = 'talaba' AND boy = 180;", 180, 525, { size: 16, fam: MONO, color: '#cdd6f4' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("-> Bitmap Heap Scan on xodimlar", 180, 585, { size: 18, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   Recheck Cond: (rol = 'talaba' AND boy = 180)", 180, 615, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("   -> Bitmap Index Scan on x_rol_boy", 180, 650, { size: 17, fam: MONO, color: '#89b4fa' });
      text("         Index Cond: ((rol = 'talaba') AND (boy = 180))", 180, 680, { size: 15, fam: MONO, color: '#a6e3a1' });
      pill("Indeks to'liq ishlatildi ✓", 530, 765, C.green, kBox, 16);

      // O'ng: Faqat rol berilganda (selektivlik past)
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kRight });
        text("2. Faqat 1-ustun: WHERE rol = 'talaba'", 1040, 430, { size: 21, weight: 700, color: '#f38ba8', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("EXPLAIN (COSTS OFF) SELECT count(*)", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("FROM xodimlar WHERE rol = 'talaba';", 1040, 525, { size: 16, fam: MONO, color: '#cdd6f4' });

        sline(1040, 550, 1740, 550, { col: '#45475a', w: 1 });
        text("-> Parallel Seq Scan on xodimlar", 1040, 585, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });
        text("   Filter: (rol = 'talaba')", 1040, 615, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("• Sabab: 'talaba' qatorlarning 66% qismi!", 1040, 650, { size: 17, fam: UI, color: '#fab387' });
        text("• Rejalashtiruvchi indeksdan voz kechdi (Seq Scan)", 1040, 680, { size: 17, weight: 600, fam: UI, color: '#f38ba8' });
        pill("66% qatorda ketma-ket o'qish tezroq", 1390, 765, C.red, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Chap Ustun va Selektivlik Xulosasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Chap ustun qoidasi mavjud bo'lsa ham, agar chap ustun jadvalning katta qismini tashkil qilsa,", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("rejalashtiruvchi indeksdan foydalanmaydi. Ikkala ustun birgalikda esa yuqori selektivlik beradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. SKIP SCAN TAJRIBASI (16.70 -> 32.58s)
  function sSkipScanTajribasi(t) {
    heading("Skip Scan: Chap Ustunsiz Qidiruv (PostgreSQL 18)", t, TM.scenes.skip_scan_tajribasi.s);

    const kCards = P(t, TM.scenes.skip_scan_tajribasi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: EXPLAIN ANALYZE rejasi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("So'rovda rol Yo'q: WHERE boy = 180", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN (ANALYZE, COSTS OFF) SELECT count(*)", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("FROM xodimlar WHERE boy = 180;", 180, 525, { size: 16, fam: MONO, color: '#fab387' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("-> Bitmap Heap Scan on xodimlar (rows=4000)", 180, 585, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   Buffers: shared hit=1469 read=5", 180, 615, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("   -> Bitmap Index Scan on x_rol_boy", 180, 650, { size: 17, fam: MONO, color: '#89b4fa' });
      text("         Index Searches: 5, Buffers: read=5", 180, 680, { size: 16, weight: 700, fam: MONO, color: '#fab387' });
      pill("Index Searches: 5 ta alohida sakrash", 530, 765, C.blue, kCards, 16);

      // O'ng: Tahlil
      const kAnalysis = P(t, 24.5, 0.8);
      withA(kAnalysis, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kAnalysis });
        text("PostgreSQL 18 Skip Scan Tahlili:", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Nega Index Searches: 5 bo'ldi?", 1040, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("   PostgreSQL 'rol' ustunining har bir qiymati bo'ylab", 1040, 525, { size: 17, color: C.ink, fam: UI });
        text("   B-tree daraxtida alohida ikkilik qidiruv bajardi.", 1040, 555, { size: 17, color: C.soft, fam: UI });

        text("2. Tejalgan disk hajmi:", 1040, 600, { size: 19, weight: 700, color: C.green, fam: UI });
        text("   Jadvaldagi 200 000 qatorni to'liq o'qish o'rniga,", 1040, 630, { size: 17, color: C.ink, fam: UI });
        text("   atigi 22 ta indeks sahifasi bilan cheklandi!", 1040, 660, { size: 17, weight: 600, color: C.green, fam: UI });

        sline(1040, 700, 1740, 700, { col: C.pencil, w: 1 });
        pill("Kam xil qiymatli chap ustun skip scan beradi", 1390, 765, C.green, kAnalysis, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 28.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("B-Tree Sakrashi (Skip Scan):", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Postgres 18 birinchi ustun qiymatlari kam bo'lsa, xuddi 'WHERE rol = ? AND boy = 180' qilib", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("ichki qidiruvlarni birlashtiradi. Bu eski versiyalardagi to'liq skanerlash majburiyatini bekor qiladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. ORDER BY VA DESCENDING INDEKS (32.58 -> 48.29s)
  function sOrderByVaDesc(t) {
    heading("ORDER BY va Descending Indeks Kodu", t, TM.scenes.order_by_va_descending_indeks.s);

    const kCards = P(t, TM.scenes.order_by_va_descending_indeks.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Teskari yo'nalish (Index Scan Backward)
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kCards });
      text("Teskari Saralash: Index Scan Backward", 180, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("SELECT * FROM xodimlar", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("ORDER BY bolim DESC, familiya DESC LIMIT 5;", 180, 525, { size: 16, fam: MONO, color: '#89b4fa' });

      sline(180, 555, 880, 555, { col: '#45475a', w: 1 });
      text("EXPLAIN Natijasi:", 180, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
      text("-> Limit", 180, 625, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("   -> Index Scan Backward using x_bolim_fam", 180, 655, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   (Saralash amali yo'q, daraxt orqadan o'qildi!)", 180, 690, { size: 16, fam: UI, color: '#a6adc8' });
      pill("Sort yo'q: 0 ms saralash vaqti ✓", 530, 765, C.green, kCards, 16);

      // O'ng: Aralash yo'nalish va maxsus indeks
      const kMixed = P(t, 41.5, 0.8);
      withA(kMixed, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.orange, p: kMixed });
        text("Aralash Tartib: CREATE INDEX ... DESC", 1040, 430, { size: 21, weight: 700, color: '#fab387', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT * FROM xodimlar", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("ORDER BY bolim ASC, familiya DESC LIMIT 5;", 1040, 525, { size: 16, fam: MONO, color: '#fab387' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("CREATE INDEX x_bolim_fam_desc", 1040, 590, { size: 17, fam: MONO, color: '#89b4fa' });
        text("ON xodimlar (bolim, familiya DESC);", 1040, 620, { size: 17, fam: MONO, color: '#89b4fa' });

        text("Natija: Incremental Sort yo'qoldi!", 1040, 660, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Index Scan using x_bolim_fam_desc ✓", 1040, 690, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        pill("Aralash saralash ham saralashsiz bo'ldi", 1390, 765, C.orange, kMixed, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 45.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Saralashda Indeks Ahamiyati:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Har ikkala ustun bir xil yo'nalishda (ikkisi ASC yoki ikkisi DESC) bo'lsa oddiy indeks yetarli.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Lekin biri ASC, biri DESC bo'lsa, albatta indeksni ham aynan shu yo'nalish bilan yarating.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. BITMAP OR BIRLASHTIRISH (48.29 -> 67.04s)
  function sBitmapOrBirlashtirish(t) {
    heading("OR Sharti va BitmapOr Birlashtirish", t, TM.scenes.bitmap_or_birlashtirish.s);

    const kCards = P(t, TM.scenes.bitmap_or_birlashtirish.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: EXPLAIN BitmapOr rejasi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("EXPLAIN: WHERE bolim = 5 OR boy = 199", 180, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("-> Bitmap Heap Scan on xodimlar", 180, 495, { size: 18, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   Recheck Cond: ((bolim = 5) OR (boy = 199))", 180, 525, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("   -> BitmapOr", 180, 560, { size: 18, weight: 700, fam: MONO, color: '#fab387' });
      text("         -> Bitmap Index Scan on x_bolim_fam", 180, 595, { size: 16, fam: MONO, color: '#89b4fa' });
      text("               Index Cond: (bolim = 5)", 180, 625, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("         -> Bitmap Index Scan on x_boy", 180, 660, { size: 16, fam: MONO, color: '#a6e3a1' });
      text("               Index Cond: (boy = 199)", 180, 690, { size: 16, fam: MONO, color: '#cdd6f4' });
      pill("BitmapOr orqali 2 ta indeks birlashtirildi", 530, 765, C.blue, kCards, 16);

      // O'ng: Ishlash mexanikasi
      const kMech = P(t, 57.5, 0.8);
      withA(kMech, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.purple, p: kMech });
        text("Bitmap Birlashtirish Qanday Ishlaydi?", 1040, 430, { size: 22, weight: 700, color: C.purple, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Har bir indeks alohida skanerlanadi:", 1040, 495, { size: 18, weight: 700, color: C.ink, fam: UI });
        text("   Sahifalardagi mos qatorlar 0 va 1 bitlar bilan belgilanadi.", 1040, 525, { size: 17, color: C.soft, fam: UI });

        text("2. Xotirada Mantiqiy OR Amali:", 1040, 570, { size: 18, weight: 700, color: C.purple, fam: UI });
        text("   Ikkala bit-xarita bitta birlashgan xaritaga keltiriladi.", 1040, 600, { size: 17, color: C.soft, fam: UI });

        text("3. Jadval Faqat Bir Marta O'qiladi:", 1040, 645, { size: 18, weight: 700, color: C.green, fam: UI });
        text("   Disk bloklari fizik tartibda birma-bir o'qiladi.", 1040, 675, { size: 17, color: C.ink, fam: UI });
        text("   (Asl indeks tartibi yo'qoladi, lekin IO tejaladi!)", 1040, 705, { size: 16, weight: 600, color: C.blue, fam: UI });
        pill("Jadval bloklari fizik tartibda o'qiladi", 1390, 765, C.purple, kMech, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 61.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("OR Shartlarida Oltin Qoida:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("OR sharti bilan so'rovlar ko'p bo'lsa, ko'p ustunli indeks emas, har bir ustunga alohida indeks qo'ying.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("PostgreSQL ularni BitmapOr orqali, MySQL esa Index Merge orqali samarali birlashtira oladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.skip_scan_tajribasi.s) {
      sChapUstunAmaliyoti(t);
    } else if (t < TM.scenes.order_by_va_descending_indeks.s) {
      sSkipScanTajribasi(t);
    } else if (t < TM.scenes.bitmap_or_birlashtirish.s) {
      sOrderByVaDesc(t);
    } else {
      sBitmapOrBirlashtirish(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
