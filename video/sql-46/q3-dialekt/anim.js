// SQL 46-bob 3-qism: "Dialektlar" — Planner va Statistika
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

  // 1. MYSQL GISTOGRAMMA (0 -> 21.12s)
  function sMysqlGistogramma(t) {
    const k = P(t, 0.3, 1.0);
    hand("46-bob. Planner va Statistika", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL: Indekssiz Ustunlarda Gistogramma", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL optimizatori va information_schema.column_statistics tahlili", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Asosiy qoida va buyruq
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("1. Muhim Qoida: Qachon Kerak?", 180, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("MySQL hujjatining oltin qoidasi:", 180, 455, { size: 18, weight: 700, fam: UI, color: C.ink });
      text("Gistogrammalar asosan INDEKSI YO'Q ustunlar uchun foydali!", 180, 485, { size: 18, weight: 700, fam: UI, color: C.red });

      srect(180, 520, 700, 130, { fill: '#f0f5ff', stroke: C.blue });
      text("-- Indekssiz holat ustuniga 10 chelakli gistogramma:", 200, 555, { size: 15, fam: MONO, color: C.soft });
      text("ANALYZE TABLE b", 200, 590, { size: 17, weight: 700, fam: MONO, color: C.blue });
      text("UPDATE HISTOGRAM ON holat WITH 10 BUCKETS;", 200, 620, { size: 17, weight: 700, fam: MONO, color: C.blue });

      text("• Indeksli ustunda: Range optimizer va index dives afzal ko'riladi.", 180, 680, { size: 16, fam: UI, color: C.ink });
      text("• Indekssiz ustunda: Gistogramma to'g'ri selektivlik beradi.", 180, 710, { size: 16, weight: 700, fam: UI, color: C.green });

      pill("Indeksli ustunga qo'yilgan gistogramma rejani o'zgartirmaydi", 530, 780, C.blue, kBox, 15);

      // O'ng: EXPLAIN filtered o'zgarishi
      const kRight = P(t, 10.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.purple, p: kRight });
        text("2. EXPLAIN: filtered 10% dan 2% ga", 1040, 390, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("EXPLAIN FORMAT=TRADITIONAL SELECT * FROM b WHERE holat='yangi';", 1040, 445, { size: 13, fam: MONO, color: C.ink });

        srect(1040, 470, 700, 95, { fill: '#fff1f0', stroke: C.red });
        text("Gistogrammasiz: type=ALL | rows=199876 | filtered=10.00%", 1060, 505, { size: 15, weight: 700, fam: MONO, color: C.red });
        text("-> Optimizatorning umumiy taxmini: har qanday shartda 10%", 1060, 535, { size: 14, fam: UI, color: C.soft });

        srect(1040, 575, 700, 95, { fill: '#f6ffed', stroke: C.green });
        text("Gistogramma bilan: type=ALL | rows=199876 | filtered=2.00%", 1060, 610, { size: 15, weight: 700, fam: MONO, color: C.green });
        text("-> Haqiqiy 2% yangi aniqlandi (singleton: 0.02 va 1.0)", 1060, 640, { size: 14, fam: UI, color: C.green });

        text("Indekssiz reja baribir ALL, lekin JOIN larda jadvallar", 1040, 695, { size: 16, color: C.ink, fam: UI });
        text("tartibini tanlashda 2% bilan 10% juda katta farq qiladi!", 1040, 725, { size: 16, weight: 700, color: C.purple, fam: UI });

        pill("Gistogramma JOIN tartibini optimallashtiradi", 1390, 780, C.purple, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 16.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("MySQL'da gistogramma avtomatik emas — kerakli ustunlar uchun qo'lda yaratiladi!", 960, 905, { size: 23, weight: 700, color: C.blue, fam: UI, align: 'center' });
        text("Indeksli ustunda esa rejalashtiruvchi noo'rin indeks tanlasa nima qilish kerak?", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. MYSQL OPTIMIZER HINTS (21.12 -> 40.109s)
  function sMysqlOptimizerHints(t) {
    heading("2. MYSQL: OPTIMIZER HINT VA 3x TEZLASHUV", "/*+ NO_INDEX(...) */ yordamida sekin indeksni aylanib o'tish", t, TM.scenes.mysql_optimizer_hints);

    const kBox = P(t, 22.0, 0.8);
    withA(kBox, () => {
      // Chap: Indeksli muammo
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. Indeksli Reja: 93 ms (Sekin!)", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT sum(summa) FROM b WHERE holat = 'yopilgan';", 180, 350, { size: 15, fam: MONO, color: C.ink });

      srect(180, 380, 700, 150, { fill: '#fff1f0', stroke: C.red });
      text("holat ustunida indeks bor (98% 'yopilgan')", 200, 415, { size: 16, weight: 700, fam: UI, color: C.red });
      text("• MySQL optimizatori indeksni tanladi (rows=99938)", 200, 450, { size: 15, fam: MONO, color: C.ink });
      text("• Aslida 196 000 ta qator topildi!", 200, 480, { size: 15, fam: MONO, color: C.red });
      text("Bajarilish vaqti: ~93 ms", 200, 510, { size: 18, weight: 700, fam: MONO, color: C.red });

      text("Deyarli barcha qatorlar o'qilayotganda indeksdan foydalanish", 180, 565, { size: 17, fam: UI, color: C.ink });
      text("diskdan tasodifiy sakrab o'qish sababli sekin ishlaydi!", 180, 595, { size: 17, weight: 700, color: C.red, fam: UI });

      pill("Katta ulushli shartlarda indeks to'liq skandan sekinroq", 530, 745, C.red, kBox, 16);

      // O'ng: Optimizer Hint yechimi
      const kRight = P(t, 27.5, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
        text("2. Hint Bilan: ~30 ms (3x Tezroq!)", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        text("EXPLAIN ANALYZE SELECT /*+ NO_INDEX(b b_holat) */", 1040, 345, { size: 15, weight: 700, fam: MONO, color: C.blue });
        text("  sum(summa) FROM b WHERE holat = 'yopilgan';", 1040, 370, { size: 15, weight: 700, fam: MONO, color: C.blue });

        srect(1040, 400, 700, 160, { fill: '#f6ffed', stroke: C.green });
        text("-> Aggregate: sum(b.summa) (cost=66162 rows=1)", 1060, 430, { size: 14, fam: MONO, color: C.ink });
        text("    -> Filter: (b.holat = 'yopilgan') (cost=20108)", 1060, 460, { size: 14, fam: MONO, color: C.ink });
        text("        -> Table scan on b (200 000 rows)", 1060, 490, { size: 16, weight: 700, fam: MONO, color: C.green });
        text("Execution Time: ~30.3 ms (vs 93 ms!)", 1060, 530, { size: 18, weight: 700, fam: MONO, color: C.green });

        card(1040, 580, 700, 120, { fill: '#fff8e7', col: C.orange, p: kRight });
        text("Hint xususiyati: faqat bitta so'rovga ta'sir qiladi!", 1390, 615, { size: 19, weight: 700, color: C.orange, fam: UI, align: 'center' });
        text("Noto'g'ri yozilsa xato bermaydi (Warning 3128 e'tiborsiz qoladi).", 1390, 650, { size: 16, color: C.ink, fam: UI, align: 'center' });
        text("Shuning uchun har doim SHOW WARNINGS tekshirilishi kerak.", 1390, 675, { size: 15, color: C.soft, fam: UI, align: 'center' });

        pill("To'liq skan 3 baravar tezroq bajarildi", 1390, 745, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 34.5, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#f6ffed', col: C.green, p: kFoot });
        text("MySQL'da /*+ ... */ optimizer hintlari so'rov darajasida rejani boshqarishga imkon beradi.", 960, 890, { size: 23, weight: 700, color: C.green, fam: UI, align: 'center' });
        text("Endi SQLite tizimi statistikani qanday saqlashi va qanday boshqarilishini ko'rib chiqamiz.", 960, 935, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 3. SQLITE STATISTIKA VA PRAGMA (40.109 -> 59.82s)
  function sSqliteStatistikaPragma(t) {
    heading("3. SQLITE: sqlite_stat1 VA PRAGMA optimize", "Indekslar bo'yicha o'rtacha takrorlanish va avtomatik yig'ish", t, TM.scenes.sqlite_statistika_pragma);

    const kBox = P(t, 41.0, 0.8);
    withA(kBox, () => {
      // Chap: sqlite_stat1
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("1. Statistika Formati: sqlite_stat1", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT * FROM sqlite_stat1;", 180, 350, { size: 16, fam: MONO, color: C.ink });

      srect(180, 385, 700, 140, { fill: '#f0f5ff', stroke: C.blue });
      text("jadval | indeks  | qatorlar va takrorlanish", 200, 415, { size: 16, weight: 700, fam: MONO, color: C.blue });
      sline(200, 435, 860, 435, { col: C.pencil, w: 1 });
      text("b      | b_mijoz | 200000 10", 200, 465, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("b      | b_holat | 200000 100000", 200, 495, { size: 16, weight: 700, fam: MONO, color: C.orange });

      text("• b_mijoz: Har bir mijozga o'rtacha 10 ta qator (yuqori selektiv!).", 180, 555, { size: 16, fam: UI, color: C.ink });
      text("• b_holat: Har bir holatga o'rtacha 100 000 ta qator (past selektiv!).", 180, 590, { size: 16, fam: UI, color: C.ink });
      text("• Statistikasiz: SQLite chap ustunda o'rtacha 10 ta deb hisoblaydi.", 180, 630, { size: 16, weight: 700, color: C.red, fam: UI });

      pill("sqlite_stat1 — qatorlar soni va o'rtacha takrorlanish", 530, 745, C.blue, kBox, 16);

      // O'ng: PRAGMA optimize
      const kRight = P(t, 48.0, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.purple, p: kRight });
        text("2. Hujjat Tavsiyasi: PRAGMA optimize", 1040, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        text("PRAGMA optimize; -- kerak bo'lsa o'zi ANALYZE qiladi", 1040, 350, { size: 15, weight: 700, fam: MONO, color: C.purple });

        srect(1040, 385, 700, 160, { fill: '#faf5ff', stroke: C.purple });
        text("Qachon chaqirish kerak?", 1060, 415, { size: 17, weight: 700, fam: UI, color: C.purple });
        text("1. Qisqa ulanishlar: ulanishni yopishdan oldin chaqirish.", 1060, 450, { size: 16, fam: UI, color: C.ink });
        text("2. Uzoq ulanishlar: ochilganda (PRAGMA optimize=0x10002;)", 1060, 485, { size: 16, fam: UI, color: C.ink });
        text("3. Sxema o'zgarganda: ayniqsa CREATE INDEX'dan keyin doim!", 1060, 520, { size: 16, weight: 700, fam: UI, color: C.orange });

        text("3.46.0 versiyasidan beri PRAGMA optimize katta bazalarda ham", 1040, 580, { size: 16, color: C.ink, fam: UI });
        text("tez tugashi uchun ANALYZE hajmini o'zi cheklaydi (2001 taxmin).", 1040, 610, { size: 16, weight: 700, color: C.green, fam: UI });

        pill("PRAGMA optimize statistikani dolzarb saqlaydi", 1390, 745, C.purple, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 53.5, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("SQLite'da to'liq ANALYZE majburiy emas, ammo PRAGMA optimize orqali yangilab turish tavsiya etiladi.", 960, 890, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
        text("Agar SQLite boshqa indeksni tanlashga majbur qilinishi kerak bo'lsa-chi?", 960, 935, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 4. SQLITE INDEXED BY VA XULOSA (59.82 -> 82.24s)
  function sSqliteIndexedBy(t) {
    heading("4. SQLITE: INDEXED BY VA DIRECTIVALAR", "Maslahat emas, qat'iy buyruq: INDEXED BY va NOT INDEXED", t, TM.scenes.sqlite_indexed_by);

    const kBox = P(t, 60.5, 0.8);
    withA(kBox, () => {
      // Chap: SQLite direktivalari
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kBox });
      text("1. Rejani Majburlash: INDEXED BY", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      srect(180, 340, 700, 100, { fill: '#f6ffed', stroke: C.green });
      text("-- 1. Odatiy so'rov: optimizator eng yaxshisini tanlaydi", 200, 365, { size: 14, fam: MONO, color: C.soft });
      text("SELECT * FROM b WHERE holat='yangi' AND mijoz=50;", 200, 395, { size: 15, fam: MONO, color: C.ink });
      text("-> SEARCH b USING INDEX b_mijoz (selektiv: 10 qator)", 200, 425, { size: 14, weight: 700, fam: MONO, color: C.green });

      srect(180, 450, 700, 95, { fill: '#fff7e6', stroke: C.orange });
      text("SELECT * FROM b NOT INDEXED WHERE mijoz=50;", 200, 480, { size: 15, fam: MONO, color: C.ink });
      text("-> SCAN b (indeks butunlay chetlab o'tildi)", 200, 515, { size: 14, weight: 700, fam: MONO, color: C.orange });

      srect(180, 555, 700, 95, { fill: '#fff1f0', stroke: C.red });
      text("SELECT * FROM b INDEXED BY b_holat WHERE mijoz=50;", 200, 585, { size: 15, fam: MONO, color: C.ink });
      text("-> SCAN b USING INDEX b_holat (hatto samarasiz bo'lsa ham!)", 200, 620, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("Muhim: INDEXED BY 'maslahat' emas, majburiy buyruq!", 180, 680, { size: 17, weight: 700, color: C.red, fam: UI });

      pill("INDEXED BY hatto yomon bo'lsa ham majburlaydi", 530, 745, C.orange, kBox, 16);

      // O'ng: Uchala bazaning taqqoslash jadvali
      const kRight = P(t, 69.5, 0.8);
      withA(kRight, () => {
        card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kRight });
        text("2. 46-bob Xulosasi: Uch Baza Taqqoslovi", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
        sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

        srect(1040, 340, 700, 350, { fill: '#ffffff', stroke: C.blue });
        text("Xususiyat | PostgreSQL | MySQL | SQLite", 1060, 375, { size: 15, weight: 700, fam: MONO, color: C.blue });
        sline(1060, 395, 1720, 395, { col: C.pencil, w: 1 });

        text("Statistika | ANALYZE, auto | ANALYZE TABLE | PRAGMA optimize", 1060, 430, { size: 14, fam: MONO, color: C.ink });
        text("Kataloglar | pg_stats      | column_stats  | sqlite_stat1", 1060, 475, { size: 14, fam: MONO, color: C.ink });
        text("Taqsimot   | MCV + hist    | Singleton/hist| O'rtacha takror", 1060, 520, { size: 14, fam: MONO, color: C.ink });
        text("Bog'liqlik | CREATE STATS  | Mavjud emas   | Mavjud emas", 1060, 565, { size: 14, weight: 700, fam: MONO, color: C.green });
        text("Hint / Majb| enable_*      | /*+ ... */    | INDEXED BY", 1060, 610, { size: 14, fam: MONO, color: C.orange });
        text("Xatolik    | 33x (stale)   | 3x (noto'g'ri)| Default 10", 1060, 655, { size: 14, weight: 700, fam: MONO, color: C.red });

        pill("Statistikani dolzarb saqlang — optimizator adashmaydi!", 1390, 745, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 75.5, 0.8);
      withA(kFoot, () => {
        card(280, 840, 1360, 160, { fill: '#f6ffed', col: C.green, p: kFoot });
        text("Xulosa: Planner statistikaga to'liq tayanadi. Baza yangilanganda doim ANALYZE qiling!", 960, 890, { size: 24, weight: 700, color: C.green, fam: UI, align: 'center' });
        text("46-bob yakunlandi. Keyingi boblarda so'rov optimizatsiyasini chuqur o'rganishda davom etamiz.", 960, 935, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  window.renderFrame = function (t) {
    bg('#f8fafc');
    const { mysql_gistogramma, mysql_optimizer_hints, sqlite_statistika_pragma, sqlite_indexed_by } = TM.scenes;

    if (t < mysql_optimizer_hints.s) {
      sMysqlGistogramma(t);
    } else if (t < sqlite_statistika_pragma.s) {
      sMysqlOptimizerHints(t);
    } else if (t < sqlite_indexed_by.s) {
      sSqliteStatistikaPragma(t);
    } else {
      sSqliteIndexedBy(t);
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
