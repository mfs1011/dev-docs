// SQL 47-bob 2-qism: "Kod" — Sekin so'rovlar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 18) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. PG_LOWER_VA_IFODA_INDEKSI (0 -> 21.63s)
  function sPgLowerVaIfodaIndeksi(t) {
    const k = P(t, 0.3, 1.0);
    hand("47-bob. Sekin So'rovlar", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL: lower() va Ifoda Indeksi", 960, 195, { size: 56, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("100 000 qatorli mijozlar jadvalida lower(email) so'rovi sinovi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Oddiy indeks bilan Seq Scan
      card(140, 340, 780, 480, { fill: C.card, col: C.red, p: kBox });
      text("1. Oddiy Indeks Bor: Ammo Seq Scan", 180, 390, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE lower(email) = '...';", 180, 450, { size: 14, fam: MONO, color: C.ink });

      srect(180, 475, 700, 145, { fill: '#fff2f0', stroke: C.red });
      text("Seq Scan on mijozlar (cost=0.00..2425.00 rows=500)", 200, 510, { size: 14, weight: 700, fam: MONO, color: C.red });
      text("  Filter: (lower(email) = 'mijoz500@misol.uz'::text)", 200, 540, { size: 13, fam: MONO, color: C.ink });
      text("  Rows Removed by Filter: 99999", 200, 570, { size: 14, weight: 700, fam: MONO, color: C.red });
      text("Execution Time: 10.075 ms", 200, 600, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("• Jadvalda m_email indeksi bor, lekin ishlamadi!", 180, 650, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• 99 999 qator filtrda o'chirildi, vaqt 10 millisekund.", 180, 680, { size: 16, color: C.ink, fam: UI });
      text("• Chunki indeksda lower() emas, asl email saqlangan.", 180, 710, { size: 16, color: C.soft, fam: UI });

      pill("Oddiy indeks funksiyani ko'ra olmaydi: Seq Scan 10 ms", 530, 780, C.red, kBox, 15);

      // O'ng: Ifoda indeksi bilan Index Scan
      const kRight = P(t, 10.0, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.green, p: kRight });
        text("2. Ifoda Indeksi Bilan: 400x Tezroq", 1040, 390, { size: 22, weight: 700, color: C.green, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("CREATE INDEX m_email_lower ON mijozlar (lower(email));", 1040, 450, { size: 14, fam: MONO, color: C.green });

        srect(1040, 475, 700, 145, { fill: '#f6ffed', stroke: C.green });
        text("Index Scan using m_email_lower on mijozlar", 1060, 510, { size: 14, weight: 700, fam: MONO, color: C.green });
        text("  Index Cond: (lower(email) = 'mijoz500@misol.uz'::text)", 1060, 540, { size: 13, fam: MONO, color: C.ink });
        text("  Index Searches: 1", 1060, 570, { size: 14, fam: MONO, color: C.soft });
        text("Execution Time: 0.023 ms (400x tezroq!)", 1060, 600, { size: 14, weight: 700, fam: MONO, color: C.green });

        text("• Index Cond da aynan lower(email) ifodasi qidirildi.", 1040, 650, { size: 16, weight: 700, color: C.green, fam: UI });
        text("• ANALYZE dan so'ng ifoda statistikasi yig'ildi (rows=1).", 1040, 680, { size: 16, color: C.ink, fam: UI });
        text("• Vaqt 10 ms dan 0.023 ms ga tushdi!", 1040, 710, { size: 16, weight: 700, color: C.blue, fam: UI });

        pill("Ifoda indeksi = 0.023 ms bilan bir zumda topiladi", 1390, 780, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 17.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Xulosa: Registrga befarq qidiruv uchun ifoda indeksi (lower(email)) yarating!", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("PostgreSQL ifoda indekslari qiymatlarining statistikasini ham pg_statistic da saqlaydi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. PG_SANA_EXTRACT_VA_ORALIQ (21.63 -> 38.26s)
  function sPgSanaExtractVaOraliq(t) {
    heading("2. SANA: EXTRACT VA ORALIQ SHART", "WHERE extract(year FROM sana) = 2025 vs Oraliq shart", t, TM.scenes.pg_sana_extract_va_oraliq);

    const kBox = P(t, 22.5, 0.8);
    withA(kBox, () => {
      // Chap: extract() Seq Scan
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. EXTRACT(year): 54x Xato va Seq Scan", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT count(*) FROM mijozlar WHERE extract(year FROM sana) = 2025;", 180, 350, { size: 13, fam: MONO, color: C.ink });

      srect(180, 380, 700, 170, { fill: '#fff2f0', stroke: C.red });
      text("Aggregate (cost=2426.25..2426.26 rows=1)", 200, 415, { size: 14, weight: 700, fam: MONO, color: C.red });
      text("  -> Seq Scan on mijozlar (rows=500 actual rows=26900)", 200, 445, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("       Filter: (EXTRACT(year FROM sana) = '2025'::numeric)", 200, 475, { size: 13, fam: MONO, color: C.ink });
      text("       Rows Removed by Filter: 73100", 200, 505, { size: 13, fam: MONO, color: C.soft });
      text("Execution Time: 7.800 ms", 200, 535, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("Xatoliklar:", 180, 580, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Planner taxmini: rows=500, haqiqatda: 26 900 (54x xato!).", 180, 615, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• extract() uchun statistika yo'qligi sababli 0.5% default olindi.", 180, 645, { size: 16, color: C.soft, fam: UI, wrap: 700 });
      text("• 73 100 qator filtrda o'chirildi, vaqt: 7.8 ms.", 180, 675, { size: 16, color: C.ink, fam: UI, wrap: 700 });

      pill("54 baravar xato taxmin JOIN rejalarini ham buzadi", 530, 755, C.red, kBox, 15);
    });

    const kRange = P(t, 30.0, 0.8);
    withA(kRange, () => {
      // O'ng: sana >= ... AND sana < ...
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRange });
      text("2. Oraliq Shart: B-tree Indeksi va Aniq Taxmin", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("WHERE sana >= '2025-01-01' AND sana < '2026-01-01';", 1040, 350, { size: 13, fam: MONO, color: C.green });

      srect(1040, 380, 700, 170, { fill: '#f6ffed', stroke: C.green });
      text("Bitmap Heap Scan on mijozlar (rows=26651 actual=26900)", 1060, 415, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("  Recheck Cond: ((sana >= '2025-01-01') AND (sana < '2026-01-01'))", 1060, 445, { size: 13, fam: MONO, color: C.ink });
      text("  -> Bitmap Index Scan on m_sana (cost=0.00..358.80)", 1060, 475, { size: 13, weight: 700, fam: MONO, color: C.blue });
      text("       Index Cond: ((sana >= '2025-01-01') AND (sana < '2026-01-01'))", 1060, 505, { size: 13, fam: MONO, color: C.soft });
      text("Execution Time: 1.245 ms (6x tezroq)", 1060, 535, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("Afzalliklari:", 1040, 580, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• m_sana indeksi oraliq bo'yicha to'g'ridan-to'g'ri ishga tushdi.", 1040, 615, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Taxmin rows=26651 haqiqiy 26900 ga deyarli teng (aniq statistika).", 1040, 645, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Vaqt 7.8 ms dan 1.2 ms ga qisqardi!", 1040, 675, { size: 16, weight: 700, color: C.green, fam: UI, wrap: 700 });

      pill("Oraliq shart: B-tree va statistika to'liq ishlaydi (1.2 ms)", 1390, 755, C.green, kRange, 15);
    });

    const kBot = P(t, 34.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Qoida: Sanadan yil yoki oyni ajratmang — sana oralig'ini bering!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Ustunni yalang'och qoldirish B-tree indeksining butun kuchini ochib beradi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. PG_TELEFON_TIP_XATOSI (38.26 -> 52.79s)
  function sPgTelefonTipXatosi(t) {
    heading("3. TIP MOSLIGI: text = bigint XATOSI", "PostgreSQL tur mos kelmaganda qanday yo'l tutadi?", t, TM.scenes.pg_telefon_tip_xatosi);

    const kBox = P(t, 39.0, 0.8);
    withA(kBox, () => {
      // Chap: Raqam bilan so'ralganda xato
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. Raqam Bilan: operator does not exist", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE telefon = 998900000500;", 180, 350, { size: 13, fam: MONO, color: C.ink });

      srect(180, 380, 700, 160, { fill: '#fff2f0', stroke: C.red });
      text("ERROR:  operator does not exist: text = bigint", 200, 415, { size: 15, weight: 700, fam: MONO, color: C.red });
      text("LINE 1: ... WHERE telefon = 998900000500;", 200, 445, { size: 13, fam: MONO, color: C.ink });
      text("HINT:  No operator matches the given name and argument types.", 200, 475, { size: 13, fam: MONO, color: C.soft });
      text("       You might need to add explicit type casts.", 200, 505, { size: 13, fam: MONO, color: C.soft });

      text("Nega bu xato ishlab chiquvchi foydasiga?", 180, 570, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Postgres jim o'tirmaydi va sekin skanerlashga tushmaydi.", 180, 605, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Muammo ishlab chiqish paytida aniqlanadi.", 180, 635, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Production bazada yashirin sekinlik bo'lib yig'ilmaydi.", 180, 665, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("PostgreSQL implicit cast qilmaydi — xavfsiz arxitektura", 530, 755, C.red, kBox, 15);
    });

    const kStr = P(t, 46.0, 0.8);
    withA(kStr, () => {
      // O'ng: Satr bilan so'ralganda
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kStr });
      text("2. Satr Bilan: Index Scan va 0.016 ms", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE telefon = '998900000500';", 1040, 350, { size: 13, fam: MONO, color: C.green });

      srect(1040, 380, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Index Scan using m_telefon on mijozlar", 1060, 415, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("  Index Cond: (telefon = '998900000500'::text)", 1060, 445, { size: 13, fam: MONO, color: C.ink });
      text("  Index Searches: 1", 1060, 475, { size: 13, fam: MONO, color: C.soft });
      text("Execution Time: 0.016 ms (Chaqmoqdek tez!)", 1060, 505, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("To'g'ri yondashuv:", 1040, 570, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Telefon raqami matn bo'lsa, ilovadan ham string yuboriladi.", 1040, 605, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• m_telefon indeksi darhol aniq qatorni diskdan topadi.", 1040, 635, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Natija 0.016 ms da tayyor bo'ladi.", 1040, 665, { size: 16, weight: 700, color: C.blue, fam: UI, wrap: 700 });

      pill("To'g'ri tur berilsa — Index Scan 0.016 ms", 1390, 755, C.green, kStr, 15);
    });

    const kBot = P(t, 49.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Eslatma: ORM yoki API da parametr turlarini doim tekshiring!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Raqamli satrlarni (telefon, STIR, pochta indeksi) hech qachon son (integer) bilan qidirmang.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. PG_OR_VA_COUNT_AMALDA (52.79 -> 74.52s)
  function sPgOrVaCountAmalda(t) {
    heading("4. OR BITMAP'LAR VA COUNT(*) AMALDA", "BitmapOr va 100k hamda 1M qatorlarda COUNT(*) sinovi", t, TM.scenes.pg_or_va_count_amalda);

    const kOr = P(t, 53.5, 0.8);
    withA(kOr, () => {
      // Chap: BitmapOr
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kOr });
      text("1. Turli Ustunlarda OR: BitmapOr", 180, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("WHERE email = 'Mijoz7@...' OR telefon = '998900000500';", 180, 350, { size: 13, fam: MONO, color: C.ink });

      srect(180, 380, 700, 180, { fill: '#f6ffed', stroke: C.blue });
      text("Bitmap Heap Scan on mijozlar (actual rows=2)", 200, 415, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("  -> BitmapOr (cost=8.87..8.87 rows=2)", 200, 445, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("       -> Bitmap Index Scan on m_email (cost=0.00..4.43)", 200, 475, { size: 13, fam: MONO, color: C.ink });
      text("       -> Bitmap Index Scan on m_telefon (cost=0.00..4.43)", 200, 505, { size: 13, fam: MONO, color: C.ink });
      text("Execution Time: 0.052 ms (2 ta indeks birlashdi!)", 200, 535, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("• Ikkala ustunda alohida indeks borligi sababli tez.", 180, 590, { size: 16, weight: 700, color: C.green, fam: UI });
      text("• Bitlar xaritasi xotirada mantiqiy OR qilinadi.", 180, 620, { size: 16, color: C.ink, fam: UI });
      text("• Agar bittasida indeks bo'lmasa: Majburiy Seq Scan 10 ms!", 180, 650, { size: 16, weight: 700, color: C.red, fam: UI });

      pill("BitmapOr: 2 ta alohida indeks bilan OR atigi 0.052 ms", 530, 755, C.blue, kOr, 15);
    });

    const kCnt = P(t, 62.0, 0.8);
    withA(kCnt, () => {
      // O'ng: COUNT(*) va reltuples
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kCnt });
      text("2. COUNT(*) va reltuples Taqqosi", 1040, 290, { size: 22, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 190, { fill: '#fffbe6', stroke: C.orange });
      text("100 000 qator: Seq Scan -> 2.188 ms", 1060, 375, { size: 14, weight: 700, fam: MONO, color: C.ink });
      text("1 000 000 qator: Parallel Index Only Scan -> 12.383 ms", 1060, 405, { size: 14, weight: 700, fam: MONO, color: C.red });
      text("  (1 million yozuv o'qildi: hajm 10x oshsa, ish ham 10x!)", 1060, 435, { size: 13, fam: UI, color: C.soft });
      sline(1060, 455, 1720, 455, { col: C.pencil, w: 1 });
      text("SELECT reltuples FROM pg_class WHERE relname='mijozlar';", 1060, 485, { size: 13, fam: MONO, color: C.blue });
      text("-> 100000 (Darhol: 0.001 ms, disk o'qilmaydi!)", 1060, 515, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("Xulosa va Tavsiya:", 1040, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• MVCC tufayli COUNT(*) butun jadval yoki indeksni sanaydi.", 1040, 595, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Katta jadvallarda reltuples yoki hisoblagich kesh ishlating.", 1040, 625, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Sahifalashda (pagination) har safar COUNT(*) chaqirmang!", 1040, 655, { size: 16, weight: 700, color: C.red, fam: UI, wrap: 700 });

      pill("reltuples: disk o'qimasdan bir zumda taxminiy son beradi", 1390, 755, C.orange, kCnt, 15);
    });

    const kFinal = P(t, 68.0, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Xulosa: Indeks borligi yetarli emas — so'rov sintaksisi va tiplar mos bo'lishi shart!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Shartlarni qayta yozish va ifoda indekslari orqali so'rovlar yuzlab baravarga tezlashadi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.pg_lower_va_ifoda_indeksi.e) {
      sPgLowerVaIfodaIndeksi(t);
    } else if (t < TM.scenes.pg_sana_extract_va_oraliq.e) {
      sPgSanaExtractVaOraliq(t);
    } else if (t < TM.scenes.pg_telefon_tip_xatosi.e) {
      sPgTelefonTipXatosi(t);
    } else {
      sPgOrVaCountAmalda(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
