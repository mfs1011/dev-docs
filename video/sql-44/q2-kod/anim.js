// SQL 44-bob 2-qism: "Kod" — Amaliyot va EXPLAIN tahlili
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

  // 1. HASH SINOVI (0 -> 17.01s)
  function sHashSinovi(t) {
    const k = P(t, 0.3, 1.0);
    hand("44-bob. Kod Tahlili", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("Hash Indeksi: Tenglik va Oraliq Sinovi", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.purple });
    hand("200 000 qatorli jadvalda kod ustuniga EXPLAIN (COSTS OFF)", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(300, 305, 1320 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Tenglik so'rovi
      card(140, 340, 780, 480, { fill: C.card, col: C.green, p: kBox });
      text("1. Qat'iy Tenglik So'rovi:", 180, 390, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("EXPLAIN SELECT * FROM t WHERE kod = 'K777';", 180, 455, { size: 17, fam: MONO, color: C.ink });

      srect(180, 490, 700, 140, { fill: '#f6ffed', stroke: C.green });
      text("QUERY PLAN", 200, 525, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("Index Scan using t_kod_hash on t", 200, 560, { size: 17, weight: 700, fam: MONO, color: C.green });
      text("  Index Cond: (kod = 'K777'::text)", 200, 595, { size: 16, fam: MONO, color: C.ink });

      text("✓ Hash indeksi qiymatni O(1) tezlikda topdi.", 180, 670, { size: 18, color: C.green, fam: UI });
      text("  32-bitli hash kodi orqali diskdan 1 ta qator o'qildi.", 180, 700, { size: 17, color: C.soft, fam: UI });

      pill("Index Scan: Hash orqali yashin tezligida", 530, 765, C.green, kBox, 16);

      // O'ng: Oraliq so'rovi (fail)
      const kFail = P(t, 8.5, 0.8);
      withA(kFail, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.red, p: kFail });
        text("2. Oraliq (Range) So'rovi:", 1040, 390, { size: 24, weight: 700, color: C.red, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("EXPLAIN SELECT * FROM t WHERE kod > 'K999998';", 1040, 455, { size: 17, fam: MONO, color: C.ink });

        srect(1040, 490, 700, 140, { fill: '#fff1f0', stroke: C.red });
        text("QUERY PLAN", 1060, 525, { size: 15, weight: 700, fam: MONO, color: C.red });
        text("Seq Scan on t", 1060, 560, { size: 17, weight: 700, fam: MONO, color: C.red });
        text("  Filter: (kod > 'K999998'::text)", 1060, 595, { size: 16, fam: MONO, color: C.ink });

        text("✗ So'rov juda kam qator qaytarsa ham,", 1040, 670, { size: 18, color: C.red, fam: UI });
        text("  Hash indeksi oraliqqa mutlaqo yaramaydi!", 1040, 700, { size: 17, weight: 700, color: C.red, fam: UI });

        pill("Seq Scan: Butun jadval 200 000 qator to'liq o'qildi", 1390, 765, C.red, kFail, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 14.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.purple, p: kFoot });
        text("Xulosa: Hash indeksi faqat '=' tenglik uchun mo'ljallangan!", 960, 905, { size: 24, weight: 700, color: C.purple, fam: UI, align: 'center' });
        text("Oraliqlar (<, >, BETWEEN) yoki saralash (ORDER BY) kerak bo'lsa, B-tree shart.", 960, 945, { size: 20, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. GIN VA GIST SINOVI (17.01 -> 34.12s)
  function sGinVaGistSinovi(t) {
    heading("2. GIN VA GiST: MASSIV VA RANGE", "Bitmap Index Scan va qayta tekshiruv (Recheck Cond)", t, TM.scenes.gin_va_gist_sinovi);

    const kGin = P(t, 18.0, 0.8);
    withA(kGin, () => {
      // Chap: GIN massiv
      card(140, 240, 780, 560, { fill: C.card, col: C.teal, p: kGin });
      text("GIN: Massiv Elementlari (@>)", 180, 290, { size: 24, weight: 700, color: C.teal, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM t WHERE teglar @> ARRAY[3, 5];", 180, 355, { size: 17, fam: MONO, color: C.ink });

      srect(180, 395, 700, 190, { fill: '#e6fffa', stroke: C.teal });
      text("Bitmap Heap Scan on t", 200, 430, { size: 17, weight: 700, fam: MONO, color: C.teal });
      text("  Recheck Cond: (teglar @> '{3,5}'::integer[])", 200, 465, { size: 15, fam: MONO, color: C.soft });
      text("  ->  Bitmap Index Scan on t_teglar_gin", 200, 510, { size: 17, weight: 700, fam: MONO, color: C.blue });
      text("        Index Cond: (teglar @> '{3,5}'::integer[])", 200, 545, { size: 15, fam: MONO, color: C.ink });

      text("• GIN 3 va 5 elementlari bor bo'lgan qatorlar", 180, 625, { size: 18, color: C.ink, fam: UI });
      text("  ro'yxatini birlashtirib bitmap hosil qildi.", 180, 655, { size: 18, color: C.ink, fam: UI });
      text("• B-tree bunday massiv ichki qidiruvini qila olmaydi.", 180, 695, { size: 17, weight: 600, color: C.teal, fam: UI });

      pill("Bitmap Index Scan: GIN massivlarni tez filtrlaydi", 530, 745, C.teal, kGin, 16);
    });

    const kGist = P(t, 25.5, 0.8);
    withA(kGist, () => {
      // O'ng: GiST range
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kGist });
      text("GiST: Oraliqlar Kesishuvi (&&)", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM t WHERE davr && tsrange('10:00', '10:05');", 1040, 355, { size: 16, fam: MONO, color: C.ink });

      srect(1040, 395, 700, 190, { fill: '#f0f5ff', stroke: C.blue });
      text("Bitmap Heap Scan on t", 1060, 430, { size: 17, weight: 700, fam: MONO, color: C.blue });
      text("  Recheck Cond: (davr && '[\"2026-02-01 10:00:00\"...)'::tsrange)", 1060, 465, { size: 14, fam: MONO, color: C.soft });
      text("  ->  Bitmap Index Scan on t_davr_gist", 1060, 510, { size: 17, weight: 700, fam: MONO, color: C.purple });
      text("        Index Cond: (davr && '[\"2026-02-01 10:00:00\"...)'::tsrange)", 1060, 545, { size: 14, fam: MONO, color: C.ink });

      text("• && — oraliqlarning vaqt bo'yicha kesishuvi.", 1040, 625, { size: 18, color: C.ink, fam: UI });
      text("• GiST ko'p o'lchamli chegaralarni tekshiradi.", 1040, 655, { size: 18, color: C.ink, fam: UI });
      text("• Bandlik jadvallari va bron tizimlari uchun asosiy tayanch.", 1040, 695, { size: 17, weight: 600, color: C.blue, fam: UI });

      pill("GiST: Vaqt intervallari kesishuvida yetakchi", 1390, 745, C.blue, kGist, 16);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 31.0, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#f4f6fc', col: C.blue, p: kFoot2 });
      text("Har ikki indeks ham Bitmap Index Scan orqali ishlaydi:", 960, 885, { size: 22, weight: 700, color: C.ink, fam: UI, align: 'center' });
      text("Indeksdan mos bloklar ro'yxati olinadi va heap sahifalari ketma-ket tartibda bir marta o'qiladi.", 960, 925, { size: 19, color: C.soft, fam: UI, align: 'center' });
    });
  }

  // 3. SP-GIST KNN SINOVI (34.12 -> 50.42s)
  function sSpgistKnnSinovi(t) {
    heading("3. SP-GiST: ENG YAQUIN QO'SHNI (KNN)", "Masofa operatori (<->) va indeks ichida saralash", t, TM.scenes.spgist_knn_sinovi);

    const kPlan = P(t, 35.0, 0.8);
    withA(kPlan, () => {
      // Chap: Reja
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kPlan });
      text("SP-GiST EXPLAIN Rejasi:", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("EXPLAIN SELECT id FROM t", 180, 355, { size: 17, fam: MONO, color: C.ink });
      text("ORDER BY nuqta <-> point(500, 100) LIMIT 3;", 180, 385, { size: 17, fam: MONO, color: C.orange });

      srect(180, 430, 700, 160, { fill: '#fffaf0', stroke: C.orange });
      text("Limit", 200, 465, { size: 17, weight: 700, fam: MONO, color: C.ink });
      text("  ->  Index Scan using t_nuqta_spgist on t", 200, 505, { size: 17, weight: 700, fam: MONO, color: C.orange });
      text("        Order By: (nuqta <-> '(500,100)'::point)", 200, 545, { size: 16, fam: MONO, color: C.green });

      text("• E'tibor bering: EXPLAIN'da alohida 'Sort' tuguni YO'Q!", 180, 630, { size: 18, weight: 700, color: C.green, fam: UI });
      text("  Indeksning o'zi daraxt bo'ylab eng yaqin nuqtalarni", 180, 665, { size: 17, color: C.ink, fam: UI });
      text("  masofa o'sishi bo'yicha to'g'ridan-to'g'ri o'qib beradi.", 180, 695, { size: 17, color: C.soft, fam: UI });

      pill("Xotirada 200 000 ta qatorni saralash tejaldi", 530, 745, C.orange, kPlan, 16);
    });

    const kRes = P(t, 42.0, 0.8);
    withA(kRes, () => {
      // O'ng: Natijalar jadvali
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRes });
      text("Haqiqiy Chiqqan Natijalar:", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id, nuqta FROM t", 1040, 355, { size: 17, fam: MONO, color: C.ink });
      text("ORDER BY nuqta <-> point(500, 100) LIMIT 3;", 1040, 385, { size: 17, fam: MONO, color: C.blue });

      srect(1040, 430, 700, 190, { fill: '#f6ffed', stroke: C.green });
      text("   id   |   nuqta   | Masofa (r)", 1060, 465, { size: 16, weight: 700, fam: MONO, color: C.green });
      sline(1060, 485, 1720, 485, { col: C.pencil, w: 1 });
      text(" 100500 | (500,100) | 0.00 (Aynan o'zi!)", 1060, 520, { size: 16, fam: MONO, color: C.ink });
      text("  99500 | (500,99)  | 1.00 birlik", 1060, 555, { size: 16, fam: MONO, color: C.ink });
      text(" 101500 | (500,101) | 1.00 birlik", 1060, 590, { size: 16, fam: MONO, color: C.ink });

      text("• point(500, 100) koordinatasiga eng yaqin 3 ta nuqta.", 1040, 655, { size: 18, color: C.ink, fam: UI });
      text("• SP-GiST: quadtree va k-d tree fazoviy tuzilmasi.", 1040, 690, { size: 17, color: C.soft, fam: UI });

      pill("KNN qidiruvi: Kuryer, taksi va xarita xizmatlarining asosi", 1390, 745, C.green, kRes, 15);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 46.5, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.orange, p: kFoot3 });
      text("SP-GiST xususiyati: Muvozanatlanmagan daraxtlar bilan ishlaydi", 960, 885, { size: 22, weight: 700, color: C.orange, fam: UI, align: 'center' });
      text("Fazoviy nuqtalar va prefikslar (telefon raqamlar, IP manzillar) uchun o'ta samarali.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. BRIN LOSSY SINOVI (50.42 -> 69.8s)
  function sBrinLossySinovi(t) {
    heading("4. BRIN: LOSSY BLOKLAR VA HAJM", "Block Range Index: 128 ta blok o'qildi, 24 kB hajm", t, TM.scenes.brin_lossy_sinovi);

    const kBrinEx = P(t, 51.5, 0.8);
    withA(kBrinEx, () => {
      // Chap: EXPLAIN ANALYZE
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kBrinEx });
      text("EXPLAIN (ANALYZE) t_vaqt_brin:", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT count(*) FROM t WHERE vaqt BETWEEN", 180, 355, { size: 16, fam: MONO, color: C.ink });
      text("  '2026-01-02 00:00' AND '2026-01-02 00:10';", 180, 385, { size: 16, fam: MONO, color: C.orange });

      srect(180, 425, 700, 200, { fill: '#fffaf0', stroke: C.orange });
      text("Bitmap Heap Scan on t (actual rows=601)", 200, 460, { size: 16, weight: 700, fam: MONO, color: C.ink });
      text("  Rows Removed by Index Recheck: 8359", 200, 495, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("  Heap Blocks: lossy=128", 200, 535, { size: 17, weight: 700, fam: MONO, color: C.orange });
      text("  Buffers: shared hit=136", 200, 570, { size: 16, fam: MONO, color: C.green });
      text("  -> Bitmap Index Scan on t_vaqt_brin", 200, 605, { size: 16, weight: 700, fam: MONO, color: C.blue });

      text("• BRIN aniq qatorlarni emas, 128 ta blokni topdi.", 180, 660, { size: 18, color: C.ink, fam: UI });
      text("• 8960 qatordan 601 tasi qoldi, 8359 tasi tashlandi.", 180, 695, { size: 17, color: C.soft, fam: UI });

      pill("Lossy bloklar: Diskdan atigi 136 sahifa o'qildi", 530, 755, C.orange, kBrinEx, 16);
    });

    const kBrinCard = P(t, 59.0, 0.8);
    withA(kBrinCard, () => {
      // O'ng: Hajm va xulosalar
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kBrinCard });
      text("Hajm Taqqosi va BRIN Sehr-Jozibasi:", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 140, { fill: '#f6ffed', stroke: C.green });
      text("B-tree indeksi: 4408 kB (Standart daraxt)", 1060, 380, { size: 18, weight: 700, fam: MONO, color: C.ink });
      text("BRIN indeksi:     24 kB (~180 baravar kichik!)", 1060, 420, { size: 20, weight: 700, fam: MONO, color: C.green });
      text("Tejalgan joy:  4384 kB (99.5% xotira tejaldi)", 1060, 460, { size: 17, fam: MONO, color: C.blue });

      text("Qachon BRIN ishlatish kerak?", 1040, 520, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("1. Ma'lumot fizik ketma-ketlikda yozilsa (vaqt, loglar).", 1040, 555, { size: 17, color: C.ink, fam: UI });
      text("2. Jadval yuz millionlab qatorli ulkan hajmga ega bo'lsa.", 1040, 590, { size: 17, color: C.ink, fam: UI });
      text("3. RAM xotirasi cheklangan va diskni tejash zarur bo'lsa.", 1040, 625, { size: 17, color: C.ink, fam: UI });

      text("Eslatma: Tasodifiy tartibda BRIN butunlay samarasiz!", 1040, 680, { size: 17, weight: 600, color: C.red, fam: UI });

      pill("BRIN: Katta ma'lumotlar ombori uchun eng tejamkor vosita", 1390, 755, C.green, kBrinCard, 15);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 64.0, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.green, p: kFoot4 });
      text("Xulosa: Har bir indeks turining o'z o'rni va roli bor!", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Tenglikka — Hash; Massivga — GIN; Oraliq va KNN ga — GiST; Katta loglarga — BRIN.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.hash_sinovi.e) sHashSinovi(t);
    else if (t < TM.scenes.gin_va_gist_sinovi.e) sGinVaGistSinovi(t);
    else if (t < TM.scenes.spgist_knn_sinovi.e) sSpgistKnnSinovi(t);
    else sBrinLossySinovi(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
