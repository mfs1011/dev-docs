// SQL 45-bob 2-qism: "Kod" — Amaliyot va EXPLAIN tahlili
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

  // 1. SODDA REJA VA DARAХT (0 -> 18.96s)
  function sSoddaRejaVaDaraxt(t) {
    const k = P(t, 0.3, 1.0);
    hand("45-bob. Kod Tahlili", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("Sodda Reja va Daraxtni O'qish", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("200 000 qatorli buyurtmalar jadvalida EXPLAIN rejalari", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(280, 305, 1360 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Oddiy Seq Scan
      card(140, 340, 780, 480, { fill: C.card, col: C.purple, p: kBox });
      text("1. Filtrlarsiz So'rov (Oddiy Reja):", 180, 390, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("EXPLAIN SELECT * FROM buyurtmalar;", 180, 455, { size: 17, fam: MONO, color: C.ink });

      srect(180, 490, 700, 140, { fill: '#faf5ff', stroke: C.purple });
      text("QUERY PLAN", 200, 525, { size: 15, weight: 700, fam: MONO, color: C.purple });
      text("Seq Scan on buyurtmalar", 200, 560, { size: 17, weight: 700, fam: MONO, color: C.ink });
      text("  (cost=0.00..3082.00 rows=200000 width=16)", 200, 595, { size: 16, fam: MONO, color: C.purple });

      text("• WHERE yo'q — butun jadval ketma-ket o'qiladi.", 180, 670, { size: 18, color: C.ink, fam: UI });
      text("• 200 000 qator, har biri taxminan 16 bayt.", 180, 705, { size: 17, color: C.soft, fam: UI });

      pill("Eng sodda 1 ta tugunli reja", 530, 765, C.purple, kBox, 16);

      // O'ng: Daraxtli reja
      const kTree = P(t, 8.5, 0.8);
      withA(kTree, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.blue, p: kTree });
        text("2. Ko'p Bosqichli Daraxt Rejasi:", 1040, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("SELECT * FROM buyurtmalar WHERE summa > 99000", 1040, 450, { size: 15, fam: MONO, color: C.ink });
        text("ORDER BY summa LIMIT 10;", 1040, 475, { size: 15, fam: MONO, color: C.blue });

        srect(1040, 505, 700, 200, { fill: '#f0f5ff', stroke: C.blue });
        text("Limit (rows=10)", 1060, 535, { size: 16, weight: 700, fam: MONO, color: C.blue });
        text("  -> Gather Merge (rows=2127)", 1060, 570, { size: 15, fam: MONO, color: C.ink });
        text("       -> Sort (Sort Key: summa)", 1060, 605, { size: 15, fam: MONO, color: C.orange });
        text("            -> Parallel Seq Scan on buyurtmalar", 1060, 640, { size: 15, weight: 700, fam: MONO, color: C.green });
        text("                 Filter: (summa > 99000)", 1060, 675, { size: 14, fam: MONO, color: C.soft });

        pill("O'qish pastdan boshlanadi: Scan -> Sort -> Gather -> Limit", 1390, 765, C.blue, kTree, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 14.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Xulosa: Har bir qavat o'zidan pastdagi boladan ma'lumot qabul qiladi!", 960, 905, { size: 23, weight: 700, color: C.ink, fam: UI, align: 'center' });
        text("Parallel ishchilar jadvalni o'qib saralaydi, Gather Merge ularni birlashtiradi va Limit 10 tasini uzatadi.", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. NESTED LOOP VA ANALYZE (18.96 -> 35.81s)
  function sNestedLoopVaAnalyze(t) {
    heading("2. EXPLAIN ANALYZE: NESTED LOOP", "5 ta mijoz va ularning buyurtmalari birlashuvi", t, TM.scenes.nested_loop_va_analyze);

    const kNest = P(t, 20.0, 0.8);
    withA(kNest, () => {
      // Chap: Reja ko'rinishi
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kNest });
      text("Kichik Birlashtirish Rejasi:", 180, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("EXPLAIN ANALYZE SELECT m.shahar, sum(b.summa)", 180, 350, { size: 15, fam: MONO, color: C.ink });
      text("FROM mijozlar m JOIN buyurtmalar b ON ... WHERE m.id <= 5", 180, 375, { size: 15, fam: MONO, color: C.ink });

      srect(180, 405, 700, 210, { fill: '#f6ffed', stroke: C.green });
      text("GroupAggregate (actual rows=1.00 loops=1)", 200, 435, { size: 15, weight: 700, fam: MONO, color: C.ink });
      text("  -> Sort (quicksort Memory: 26kB)", 200, 470, { size: 15, fam: MONO, color: C.soft });
      text("       -> Nested Loop (actual rows=50.00 loops=1)", 200, 505, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("            -> Index Scan on mijozlar (rows=5.00 loops=1)", 200, 540, { size: 15, fam: MONO, color: C.blue });
      text("            -> Bitmap Heap Scan on buyurtmalar", 200, 575, { size: 15, weight: 700, fam: MONO, color: C.orange });
      text("                 (actual rows=10.00 loops=5)", 200, 605, { size: 15, weight: 700, fam: MONO, color: C.orange });

      text("• Tashqi tomon: mijozlar (5 qator).", 180, 655, { size: 18, color: C.ink, fam: UI });
      text("• Ichki tomon: buyurtmalar har mijoz uchun loops=5 marta bajarildi.", 180, 690, { size: 17, color: C.green, fam: UI });

      pill("Nested Loop: Kichik hajmlarda o'ta samarali", 530, 755, C.green, kNest, 16);
    });

    const kPerf = P(t, 27.5, 0.8);
    withA(kPerf, () => {
      // O'ng: Metrikalar va aniqlik
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kPerf });
      text("Ijro Vaqti va Buffers Tahlili:", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f0f5ff', stroke: C.blue });
      text("Planning Time:  0.162 ms", 1060, 380, { size: 18, weight: 700, fam: MONO, color: C.ink });
      text("Execution Time: 0.044 ms  (Yashin tezligida!)", 1060, 420, { size: 18, weight: 700, fam: MONO, color: C.green });
      text("Buffers: shared hit=63    (100% keshda, diskka borilmadi)", 1060, 460, { size: 17, fam: MONO, color: C.blue });

      text("Taxmin va Haqiqat Qiyosi:", 1040, 535, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• buyurtmalar taxmini: rows=10", 1040, 575, { size: 18, fam: MONO, color: C.soft });
      text("• buyurtmalar haqiqati: rows=10.00 (loops=5)", 1040, 610, { size: 18, weight: 700, fam: MONO, color: C.green });
      text("✓ 100% mukammal moslik — optimizer statistikasi ideal holatda!", 1040, 650, { size: 17, weight: 600, color: C.green, fam: UI });

      pill("loops=5 × rows=10 = Jami 50 qator buyurtma", 1390, 745, C.blue, kPerf, 16);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 32.5, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#f4f6fc', col: C.green, p: kFoot2 });
      text("Nested Loop qoidasi: Tashqi jadval qatorlari kam bo'lsa,", 960, 885, { size: 22, weight: 700, color: C.ink, fam: UI, align: 'center' });
      text("ichki jadval indeks orqali har safar darhol topiladi va eng tezkor yechim bo'ladi.", 960, 925, { size: 19, color: C.soft, fam: UI, align: 'center' });
    });
  }

  // 3. KATTA BIRLASHTIRISH HASH JOIN (35.81 -> 52.76s)
  function sKattaBirlashtirishHashJoin(t) {
    heading("3. KATTA BIRLASHTIRISH: HASH JOIN", "Barcha 200 000 buyurtma uchun rejaning o'zgarishi", t, TM.scenes.katta_birlashtirish_hash_join);

    const kHash = P(t, 37.0, 0.8);
    withA(kHash, () => {
      // Chap: Hash Join rejasi
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kHash });
      text("200 000 Qatorda Baza Boshqa Yo'l Tanladi:", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT m.shahar, count(*) FROM mijozlar m", 180, 350, { size: 16, fam: MONO, color: C.ink });
      text("JOIN buyurtmalar b ON b.mijoz_id = m.id GROUP BY ...;", 180, 375, { size: 16, fam: MONO, color: C.ink });

      srect(180, 405, 700, 220, { fill: '#fffaf0', stroke: C.orange });
      text("Finalize GroupAggregate", 200, 435, { size: 15, weight: 700, fam: MONO, color: C.ink });
      text("  -> Hash Join (rows=100000.00 loops=2)", 200, 470, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("       Hash Cond: (b.mijoz_id = m.id)", 200, 505, { size: 15, fam: MONO, color: C.ink });
      text("       -> Parallel Seq Scan on buyurtmalar", 200, 540, { size: 15, fam: MONO, color: C.green });
      text("       -> Hash (Memory: 1194kB, Buckets: 32768)", 200, 575, { size: 15, weight: 700, fam: MONO, color: C.blue });
      text("            -> Seq Scan on mijozlar (rows=20000)", 200, 605, { size: 15, fam: MONO, color: C.soft });

      text("Execution Time: 19.497 ms  (200k qator uchun juda tez!)", 180, 660, { size: 17, weight: 700, color: C.green, fam: UI });

      pill("Nested Loop o'rniga Hash Join ishlatildi", 530, 755, C.orange, kHash, 16);
    });

    const kWhy = P(t, 43.5, 0.8);
    withA(kWhy, () => {
      // O'ng: Nega Hash Join?
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kWhy });
      text("Nega Rejalashtiruvchi Buni Tanladi?", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Taqqoslash: 200 000 ta qatorda nima arzonroq?", 1040, 355, { size: 19, weight: 700, color: C.ink, fam: UI });

      srect(1040, 390, 700, 110, { fill: '#fff1f0', stroke: C.red });
      text("Variant A: Nested Loop", 1060, 420, { size: 16, weight: 700, fam: UI, color: C.red });
      text("200 000 marta indeksdan alohida-alohida qidirish.", 1060, 455, { size: 15, color: C.ink, fam: UI });
      text("Narxi juda yuqori — sekin ishlaydi!", 1060, 480, { size: 15, weight: 600, color: C.red, fam: UI });

      srect(1040, 515, 700, 130, { fill: '#f6ffed', stroke: C.green });
      text("Variant B: Hash Join (Tanlangan)", 1060, 545, { size: 16, weight: 700, fam: UI, color: C.green });
      text("Kichik jadval (mijozlar) RAM'dagi hesh jadvalga yig'iladi (1.2 MB).", 1060, 580, { size: 15, color: C.ink, fam: UI });
      text("Katta jadval (buyurtmalar) 1 marta parallel o'qilib tutashtiriladi.", 1060, 610, { size: 15, color: C.ink, fam: UI });

      text("Xulosa: Bir xil JOIN — ma'lumot hajmiga qarab reja o'zgaradi!", 1040, 680, { size: 17, weight: 700, color: C.blue, fam: UI });

      pill("1.2 MB xotira evaziga butun so'rov 19 millisekundda bitdi", 1390, 745, C.green, kWhy, 15);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 49.0, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#fffaf0', col: C.orange, p: kFoot3 });
      text("Eslatma: Natijalarni boshqa muhitga shunchaki ko'chirmang!", 960, 885, { size: 22, weight: 700, color: C.orange, fam: UI, align: 'center' });
      text("Kichik test bazasida Nested Loop bo'lgan so'rov production'da avtomatik Hash Join bo'lishi mumkin.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. TOPN SORT VA DML (52.76 -> 71.78s)
  function sTopnSortVaDml(t) {
    heading("4. TOP-N HEAPSORT VA XAVFSIZ DML", "Xotirada ixcham saralash va BEGIN/ROLLBACK sinovi", t, TM.scenes.topn_sort_va_dml);

    const kSort = P(t, 53.5, 0.8);
    withA(kSort, () => {
      // Chap: Top-N heapsort
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kSort });
      text("Top-N Heapsort Saralash Usuli:", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT * FROM buyurtmalar", 180, 355, { size: 16, fam: MONO, color: C.ink });
      text("ORDER BY summa DESC, id LIMIT 5;", 180, 385, { size: 16, fam: MONO, color: C.purple });

      srect(180, 425, 700, 150, { fill: '#faf5ff', stroke: C.purple });
      text("Sort (actual rows=4.00 loops=2)", 200, 460, { size: 16, weight: 700, fam: MONO, color: C.ink });
      text("  Sort Key: summa DESC, id", 200, 495, { size: 15, fam: MONO, color: C.soft });
      text("  Sort Method: top-N heapsort  Memory: 25kB", 200, 535, { size: 16, weight: 700, fam: MONO, color: C.purple });

      text("• LIMIT 5 bo'lgani sababli barcha 200k saralanmaydi.", 180, 615, { size: 18, color: C.ink, fam: UI });
      text("• Xotirada faqat 5 ta eng katta qiymat saqlanadi (atigi 25 kB).", 180, 650, { size: 17, color: C.soft, fam: UI });
      text("• Xotira toshib ketishi (diskka filesort) oldi olinadi.", 180, 685, { size: 17, weight: 600, color: C.green, fam: UI });

      pill("Top-N Heapsort: Katta ma'lumotda faqat LIMIT o'lchamini saralaydi", 530, 755, C.purple, kSort, 15);
    });

    const kDml = P(t, 60.5, 0.8);
    withA(kDml, () => {
      // O'ng: BEGIN/ROLLBACK DML sinovi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kDml });
      text("Haqiqiy DML: DELETE Sinovi", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 190, { fill: '#f6ffed', stroke: C.green });
      text("BEGIN;", 1060, 375, { size: 17, weight: 700, fam: MONO, color: C.blue });
      text("EXPLAIN (ANALYZE) DELETE FROM buyurtmalar", 1060, 410, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("  WHERE sana = '2026-03-01';", 1060, 440, { size: 16, fam: MONO, color: C.ink });
      text("-> Delete on buyurtmalar", 1060, 475, { size: 15, fam: MONO, color: C.soft });
      text("     Rows Removed: 199452, O'chirildi: 548 ta", 1060, 505, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("ROLLBACK;  -- Barcha 548 qator joyida qoldi!", 1060, 545, { size: 17, weight: 700, fam: MONO, color: C.green });

      text("• 548 qator haqiqatan o'chirildi, lekin ROLLBACK qaytardi.", 1040, 615, { size: 18, color: C.ink, fam: UI });
      text("• SELECT count(*) qayta tekshirildi: 548 qator saqlangan.", 1040, 650, { size: 17, color: C.soft, fam: UI });

      pill("Production'da UPDATE va DELETE ni xavfsiz audit qilish usuli", 1390, 745, C.green, kDml, 15);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 66.0, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.green, p: kFoot4 });
      text("Xulosa: EXPLAIN ANALYZE kuchi va mas'uliyatini to'g'ri boshqaring!", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Top-N heapsort xotirani tejaydi, BEGIN va ROLLBACK esa bazangiz yaxlitligini kafolatlaydi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.sodda_reja_va_daraxt.e) sSoddaRejaVaDaraxt(t);
    else if (t < TM.scenes.nested_loop_va_analyze.e) sNestedLoopVaAnalyze(t);
    else if (t < TM.scenes.katta_birlashtirish_hash_join.e) sKattaBirlashtirishHashJoin(t);
    else sTopnSortVaDml(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
