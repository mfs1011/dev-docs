// SQL 43-bob 2-qism: "Kod" — Maxsus indekslar
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

  // 1. LOWER VA UNIQUE (0 -> 16.99s)
  function sLowerVaUnique(t) {
    const k = P(t, 0.3, 1.0);
    hand("43-bob. Maxsus Indekslar Kodu", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Ifoda Indeksi va UNIQUE (lower)", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18: 200 000 qatorli jadvalda ifoda va cheklovlar", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: lower(email) ifoda indeksi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kBox });
      text("Ifoda Indeksi: lower(email)", 180, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("SELECT id FROM f WHERE lower(email) = 'user77@misol.uz';", 180, 495, { size: 15, fam: MONO, color: '#cdd6f4' });
      text("1. Oddiy f_email bilan: Parallel Seq Scan (mos emas)", 180, 530, { size: 15, fam: MONO, color: '#f38ba8' });

      sline(180, 560, 880, 560, { col: '#45475a', w: 1 });
      text("2. Ifoda indeksidan keyin:", 180, 595, { size: 17, weight: 700, fam: UI, color: '#a6e3a1' });
      text("CREATE INDEX f_lower_email ON f (lower(email));", 180, 625, { size: 16, fam: MONO, color: '#89b4fa' });
      text("-> Index Scan using f_lower_email on f ✓", 180, 660, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   Index Cond: (lower(email) = 'user77@misol.uz')", 180, 690, { size: 15, fam: MONO, color: '#cdd6f4' });
      pill("Ifoda B-Tree ichida saqlandi: Index Scan", 530, 765, C.blue, kBox, 16);

      // O'ng: UNIQUE (lower(email)) cheklovi
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kRight });
        text("UNIQUE (lower(email)) Cheklovi:", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("CREATE UNIQUE INDEX ON f (lower(email));", 1040, 495, { size: 16, fam: MONO, color: '#89b4fa' });
        text("INSERT INTO f VALUES (200001, 'USER77@MISOL.UZ');", 1040, 530, { size: 15, fam: MONO, color: '#f38ba8' });

        sline(1040, 565, 1740, 565, { col: '#45475a', w: 1 });
        text("Baza Darajasida Qat'iy Taqiq:", 1040, 600, { size: 18, weight: 700, fam: UI, color: '#fab387' });
        text("ERROR: duplicate key value violates unique constraint", 1040, 635, { size: 15, weight: 700, fam: MONO, color: '#f38ba8' });
        text("DETAIL: Key (lower(email))=(user77@misol.uz) exists!", 1040, 665, { size: 15, fam: MONO, color: '#cdd6f4' });
        text("Harf farqi bilan dublikat kiritish to'liq to'xtatildi.", 1040, 700, { size: 16, fam: UI, color: '#a6adc8' });
        pill("Bir xil pochtani harf farqi bilan kiritib bo'lmaydi", 1390, 765, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Ifoda Indeksi Mohiyati:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("PostgreSQL ifoda indeksini xuddi oddiy ustun kabi ko'radi va so'rovdagi ifoda bilan to'liq mos kelganda", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("B-tree orqali qidiradi. UNIQUE ifoda indeksi esa biznes qoidalarini baza darajasida himoyalaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. LIKE VA TEXT_PATTERN_OPS (16.99 -> 33.87s)
  function sLikeVaPattern(t) {
    heading("LIKE 'prefiks%' va text_pattern_ops (PostgreSQL 18)", t, TM.scenes.like_va_text_pattern_ops.s);

    const kCards = P(t, TM.scenes.like_va_text_pattern_ops.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Standart B-Tree va Collation
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kCards });
      text("Muammo: en_US.UTF-8 Collation", 180, 430, { size: 21, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN (COSTS OFF) SELECT id FROM f", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("WHERE email LIKE 'user77%';", 180, 525, { size: 16, fam: MONO, color: '#f38ba8' });

      sline(180, 555, 880, 555, { col: '#45475a', w: 1 });
      text("Natija: Seq Scan on f!", 180, 590, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
      text("   Filter: (email ~~ 'user77%'::text)", 180, 625, { size: 16, fam: MONO, color: '#f38ba8' });
      text("• Sabab: Standart B-Tree harflarni til qoidalari", 180, 660, { size: 17, fam: UI, color: '#cdd6f4' });
      text("  bo'yicha tartiblaydi, qat'iy baytma-bayt emas.", 180, 690, { size: 17, fam: UI, color: '#a6adc8' });
      pill("Standart B-Tree LIKE prefiksiga yaramaydi", 530, 765, C.red, kCards, 16);

      // O'ng: text_pattern_ops operator klassi
      const kOps = P(t, 25.5, 0.8);
      withA(kOps, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kOps });
        text("Yechim: text_pattern_ops Operator Klassi", 1040, 430, { size: 20, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("CREATE INDEX f_email_pattern", 1040, 495, { size: 17, fam: MONO, color: '#89b4fa' });
        text("ON f (email text_pattern_ops);", 1040, 525, { size: 17, fam: MONO, color: '#89b4fa' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("Natija: Qat'iy Oraliq Index Scan!", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Index Scan using f_email_pattern on f ✓", 1040, 625, { size: 16, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   Index Cond: ((email ~>=~ 'user77') AND (email ~<~ 'user78'))", 1040, 655, { size: 13, fam: MONO, color: '#cdd6f4' });
        text("• LIKE 'user77%' oraliq taqqoslashga aylantirildi!", 1040, 690, { size: 16, fam: UI, color: '#a6adc8' });
        pill("Belgima-belgi qat'iy oraliq bilan tezlashdi", 1390, 765, C.green, kOps, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 29.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Operator Klassi Muhimligi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Agar bazangiz 'C' locale'da bo'lmasa, har qanday LIKE 'prefiks%' qidiruvi uchun", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("text_pattern_ops yoki varchar_pattern_ops indeksini yaratish shart. Aks holda so'rov har doim to'liq skanerlashga tushadi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. QISMAN INDEKS O'LCHOVI (33.87 -> 51.38s)
  function sQismanIndeksOlchovi(t) {
    heading("Qisman Indeks: 21x Kichik Hajm va Tezkor Reja", t, TM.scenes.qisman_indeks_olchovi.s);

    const kCards = P(t, TM.scenes.qisman_indeks_olchovi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Real hajm o'lchovlari
      card(140, 380, 780, 420, { fill: C.card, col: C.green, p: kCards });
      text("Real Disk O'lchovlari (PostgreSQL 18):", 180, 430, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("SELECT relname, pg_size_pretty(...) FROM pg_class;", 180, 495, { size: 16, fam: MONO, color: C.ink });

      text("1. f_holat_full (to'liq indeks):", 180, 540, { size: 18, weight: 700, color: C.red, fam: UI });
      text("   Hajmi: 1 368 kB (barcha 200 000 qator)", 180, 570, { size: 17, fam: MONO, color: C.red });

      text("2. f_yangi (qisman indeks: WHERE holat = 'yangi'):", 180, 620, { size: 18, weight: 700, color: C.green, fam: UI });
      text("   Hajmi: atigi 64 kB! (2 000 ta qator)", 180, 650, { size: 17, weight: 700, fam: MONO, color: C.green });
      pill("21 baravar kam disk va xotira egalladi", 530, 765, C.green, kCards, 16);

      // O'ng: EXPLAIN rejalari
      const kPlans = P(t, 43.5, 0.8);
      withA(kPlans, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kPlans });
        text("So'rov Rejalari (Index Only Scan):", 1040, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. WHERE holat = 'yangi' AND id > 199000;", 1040, 495, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("-> Index Only Scan using f_yangi on f ✓", 1040, 525, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   Index Cond: (id > 199000)", 1040, 555, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("   (holat tekshirilmaydi ham — indeksdagilar 100% yangi!)", 1040, 585, { size: 15, fam: UI, color: '#a6adc8' });

        sline(1040, 615, 1740, 615, { col: '#45475a', w: 1 });
        text("2. WHERE holat = 'faol' AND id > 199000;", 1040, 650, { size: 16, fam: MONO, color: '#f38ba8' });
        text("-> Index Scan using f_pkey (f_yangi da faol yo'q!)", 1040, 680, { size: 16, fam: MONO, color: '#f38ba8' });
        pill("Shart kafolatlanganda qisman indeks tanlanadi", 1390, 765, C.blue, kPlans, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 47.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Qisman Indeks Natijasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Kam uchraydigan qatorlar (yangi buyurtmalar, qayta ishlanmagan xabarlar) uchun qisman indeks eng kuchli vositadir.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("U 21x kichik joy oladi va qolgan 99% qatorlar INSERT yoki UPDATE bo'lganda indeksga zarracha yuk tushmaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. INCLUDE VA HEAP FETCHES (51.38 -> 71.26s)
  function sIncludeVaHeapFetches(t) {
    heading("INCLUDE Ustunlari va VACUUM Heap Fetches", t, TM.scenes.include_va_heap_fetches.s);

    const kCards = P(t, TM.scenes.include_va_heap_fetches.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: VACUUM dan oldin
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.orange, p: kCards });
      text("1. Yangi Jadvalda (VACUUM'siz):", 180, 430, { size: 21, weight: 700, color: '#fab387', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("CREATE INDEX f_id_inc ON f (id) INCLUDE (ism);", 180, 495, { size: 16, fam: MONO, color: '#89b4fa' });
      text("SELECT id, ism FROM f WHERE id BETWEEN 1000 AND 1100;", 180, 525, { size: 15, fam: MONO, color: '#cdd6f4' });

      sline(180, 555, 880, 555, { col: '#45475a', w: 1 });
      text("EXPLAIN ANALYZE Natijasi:", 180, 590, { size: 18, weight: 700, fam: UI, color: '#fab387' });
      text("-> Index Only Scan using f_id_inc", 180, 625, { size: 17, fam: MONO, color: '#89b4fa' });
      text("   Heap Fetches: 101  (Jadvalga 101 marta borildi!) ✗", 180, 660, { size: 16, weight: 700, fam: MONO, color: '#f38ba8' });
      text("• Visibility Map bitlari hali o'rnatilmagan.", 180, 695, { size: 16, fam: UI, color: '#a6adc8' });
      pill("Heap Fetches: 101 (heap sahifalariga murojaat)", 530, 765, C.orange, kCards, 16);

      // O'ng: VACUUM dan keyin
      const kVac = P(t, 61.5, 0.8);
      withA(kVac, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kVac });
        text("2. VACUUM dan Keyin (Mukammal Tezlik):", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("VACUUM f;", 1040, 495, { size: 18, weight: 700, fam: MONO, color: '#fab387' });
        text("EXPLAIN ANALYZE SELECT id, ism ...;", 1040, 525, { size: 16, fam: MONO, color: '#cdd6f4' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("Yangi EXPLAIN Natijasi:", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Index Only Scan using f_id_inc", 1040, 625, { size: 17, fam: MONO, color: '#89b4fa' });
        text("   Heap Fetches: 0 ✓ (Asosiy jadvalga 0 marta!)", 1040, 660, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("• Visibility Map barcha qatorlar ko'rinishini tasdiqladi.", 1040, 695, { size: 16, fam: UI, color: '#a6adc8' });
        pill("Heap Fetches: 0 (javob 100% indeksdan olindi)", 1390, 765, C.green, kVac, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 65.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("PostgreSQL Index Only Scan Sirlari:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("PostgreSQL'da indeksda ko'rinuvchanlik ma'lumoti bo'lmagani uchun, haqiqiy Index Only Scan faqat", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("VACUUM qilingan sahifalarda ishlaydi. INCLUDE esa ko'p ustunli indeksdan ko'ra qidiruv kalitini yengil saqlaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.like_va_text_pattern_ops.s) {
      sLowerVaUnique(t);
    } else if (t < TM.scenes.qisman_indeks_olchovi.s) {
      sLikeVaPattern(t);
    } else if (t < TM.scenes.include_va_heap_fetches.s) {
      sQismanIndeksOlchovi(t);
    } else {
      sIncludeVaHeapFetches(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
