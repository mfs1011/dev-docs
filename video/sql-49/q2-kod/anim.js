// SQL 49-bob 2-qism: "Kod" — To'liq matnli qidiruv
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

  // 1. TSVECTOR VA LUG'ATLAR (0 -> 16.613s)
  function sTsvectorLugatlar(t) {
    const k = P(t, 0.3, 1.0);
    hand("49-bob. To'liq Matnli Qidiruv", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL: tsvector va Lug'atlar", 960, 195, { size: 60, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("to_tsvector('simple', ...) va to_tsvector('english', ...) farqi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: simple lug'ati
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("1. simple Konfiguratsiyasi (O'zbek tili uchun)", 180, 390, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT to_tsvector('simple',", 180, 450, { size: 14, fam: MONO, color: C.ink });
      text("  'Bitta tarmoqdagi konteynerlar bir-birini...');", 180, 475, { size: 14, fam: MONO, color: C.ink });

      srect(180, 505, 700, 130, { fill: '#e6f4ff', stroke: C.blue });
      text("to_tsvector natijasi:", 200, 530, { size: 14, weight: 700, fam: UI, color: C.blue });
      text("'bilan':8 'bir':5 'bir-birini':4 'birini':6", 200, 560, { size: 14, fam: MONO, color: C.ink });
      text("'bitta':1 'konteynerlar':3 'nomi':7 'topadi':9", 200, 590, { size: 14, fam: MONO, color: C.ink });
      text("Qo'shimchalar qolgan: 'konteynerlar', 'tarmoqdagi'", 200, 620, { size: 13, weight: 700, fam: MONO, color: C.blue });

      text("• So'zlar faqat kichik harfga o'tadi va o'rni saqlanadi.", 180, 665, { size: 16, color: C.ink, fam: UI });
      text("• Qo'shimchalar olib tashlanmaydi (stemming yo'q).", 180, 695, { size: 16, weight: 700, color: C.blue, fam: UI });

      pill("simple: qo'shimchalar o'zgarishsiz saqlanadi", 530, 780, C.blue, kBox, 15);

      // O'ng: english lug'ati
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.green, p: kRight });
        text("2. english Konfiguratsiyasi (Ingliz tili uchun)", 1040, 390, { size: 22, weight: 700, color: C.green, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("SELECT to_tsvector('english',", 1040, 450, { size: 14, fam: MONO, color: C.ink });
        text("  'The container runs the application; containers are isolated.');", 1040, 475, { size: 13, fam: MONO, color: C.ink, wrap: 700 });

        srect(1040, 505, 700, 130, { fill: '#f6ffed', stroke: C.green });
        text("to_tsvector natijasi:", 1060, 530, { size: 14, weight: 700, fam: UI, color: C.green });
        text("'applic':5 'contain':2,6 'isol':8 'run':3", 1060, 565, { size: 16, weight: 700, fam: MONO, color: C.green });
        text("To'xtash so'zlari ('the', 'are') tashlab yuborildi!", 1060, 595, { size: 14, fam: UI, color: C.ink });
        text("container va containers -> bitta 'contain' leksemasi!", 1060, 620, { size: 14, weight: 700, fam: MONO, color: C.green });

        text("• Ingliz tilida so'z o'zagini topish (stemming) to'liq ishlaydi.", 1040, 665, { size: 16, color: C.ink, fam: UI });
        text("• Shuning uchun 'container' so'rovi 'containers' ni ham topadi.", 1040, 695, { size: 16, color: C.soft, fam: UI });

        pill("english: to'xtash so'zlari tushadi, leksemalar birlashadi", 1390, 780, C.green, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("PostgreSQL 18 da o'zbek tili uchun lug'at yo'q — shuning uchun 'simple' ishlatiladi.", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("O'zbek tilida qo'shimchalarni to'g'ri qidirish uchun prefiks so'rovlari (:*) yordam beradi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. QIDIRUV VA PREFIKS (16.613 -> 30.805s)
  function sQidiruvVaPrefiks(t) {
    heading("2. QIDIRUV VA PREFIKS SINTAKSISI", "Aniq so'z va prefiks (:*) qidiruvlarining taqqosi", t, TM.scenes.pg_qidiruv_va_prefiks);

    const kBox = P(t, 17.5, 0.8);
    withA(kBox, () => {
      // Chap: Aniq so'z qidiruvi
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("Aniq So'z Qidiruvi: to_tsquery('simple', 'konteyner')", 180, 290, { size: 20, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id, sarlavha FROM maqolalar", 180, 350, { size: 14, fam: MONO, color: C.ink });
      text("WHERE to_tsvector('simple', sarlavha || ' ' || matn)", 180, 375, { size: 13, fam: MONO, color: C.ink });
      text("      @@ to_tsquery('simple', 'konteyner');", 180, 400, { size: 14, weight: 700, fam: MONO, color: C.red });

      srect(180, 430, 700, 140, { fill: '#fff2f0', stroke: C.red });
      text("Natija (psql chiqishi):", 200, 455, { size: 14, weight: 700, fam: UI, color: C.red });
      text(" id |       sarlavha       ", 200, 485, { size: 14, fam: MONO, color: C.ink });
      text("----+----------------------", 200, 505, { size: 14, fam: MONO, color: C.pencil });
      text("  1 | Docker konteynerlari ", 200, 525, { size: 14, fam: MONO, color: C.ink });
      text("  2 | Konteyner tarmoqlari ", 200, 545, { size: 14, fam: MONO, color: C.ink });

      text("5-maqola nima bo'ldi? ('Konteynerda baza')", 180, 600, { size: 17, weight: 700, color: C.red, fam: UI });
      text("• 'konteynerda' so'zi 'konteyner' bilan mos kelmadi va TUSHIB QOLDI!", 180, 630, { size: 15, weight: 700, color: C.red, fam: UI, wrap: 700 });
      text("• Foydalanuvchi bu maqolani qidiruvda ko'ra olmaydi.", 180, 660, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("Aniq so'z qidiruvida qo'shimchali so'zlar topilmaydi", 530, 765, C.red, kBox, 15);
    });

    const kRight = P(t, 23.0, 0.8);
    withA(kRight, () => {
      // O'ng: Prefiks qidiruvi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("Prefiks Qidiruvi: to_tsquery('simple', 'konteyner:*')", 1040, 290, { size: 20, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id, sarlavha FROM maqolalar", 1040, 350, { size: 14, fam: MONO, color: C.ink });
      text("WHERE to_tsvector('simple', sarlavha || ' ' || matn)", 1040, 375, { size: 13, fam: MONO, color: C.ink });
      text("      @@ to_tsquery('simple', 'konteyner:*');", 1040, 400, { size: 14, weight: 700, fam: MONO, color: C.green });

      srect(1040, 430, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Natija (psql chiqishi):", 1060, 455, { size: 14, weight: 700, fam: UI, color: C.green });
      text(" id |       sarlavha       ", 1060, 485, { size: 14, fam: MONO, color: C.ink });
      text("----+----------------------", 1060, 505, { size: 14, fam: MONO, color: C.pencil });
      text("  1 | Docker konteynerlari ", 1060, 525, { size: 14, fam: MONO, color: C.ink });
      text("  2 | Konteyner tarmoqlari ", 1060, 545, { size: 14, fam: MONO, color: C.ink });
      text("  5 | Konteynerda baza     <-- ENDI TOPILDI! ✓", 1060, 565, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("• ':*' prefiksi 'konteyner' bilan boshlanuvchi hamma so'zni topdi.", 1040, 620, { size: 15, weight: 700, color: C.green, fam: UI, wrap: 700 });
      text("• 'konteynerda', 'konteynerlari', 'konteynerlar' hammasi kirdi.", 1040, 650, { size: 15, color: C.ink, fam: UI, wrap: 700 });
      text("• O'zbek tili uchun eng ishonchli va amaliy yechim shu!", 1040, 680, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("':*' prefiksi bilan barcha qo'shimchali so'zlar to'liq topildi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 27.0, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("Amaliy qoida: O'zbekcha matnlar uchun doim 'soz:*' prefiksidan foydalaning.", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Aks holda kelishik va ko'plik qo'shimchalari sababli ko'plab maqolalar qidiruvda tushib qoladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. REYTING VA WEBSEARCH (30.805 -> 45.238s)
  function sReytingVaWebsearch(t) {
    heading("3. REYTING VA FOYDALANUVCHI SO'ROVI", "ts_rank va xavfsiz websearch_to_tsquery", t, TM.scenes.pg_reyting_va_websearch);

    const kBox = P(t, 31.5, 0.8);
    withA(kBox, () => {
      // Chap: ts_rank
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("1. ts_rank: Natijalarni Moslik Bo'yicha Saralash", 180, 290, { size: 20, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id, sarlavha, round(ts_rank(hujjat, q)::numeric, 4) AS reyting", 180, 350, { size: 12, fam: MONO, color: C.ink });
      text("FROM maqolalar, to_tsquery('simple', 'konteyner:* & ilova:*') q", 180, 375, { size: 12, fam: MONO, color: C.ink });
      text("WHERE hujjat @@ q ORDER BY reyting DESC;", 180, 400, { size: 13, weight: 700, fam: MONO, color: C.blue });

      srect(180, 430, 700, 130, { fill: '#e6f4ff', stroke: C.blue });
      text("Natija (eng mos maqola birinchi o'rinda):", 200, 455, { size: 14, weight: 700, fam: UI, color: C.blue });
      text(" id |       sarlavha       | reyting ", 200, 485, { size: 14, fam: MONO, color: C.ink });
      text("----+----------------------+---------", 200, 505, { size: 14, fam: MONO, color: C.pencil });
      text("  1 | Docker konteynerlari |  0.1878 ", 200, 525, { size: 14, weight: 700, fam: MONO, color: C.blue });

      text("• '&' (VA) operatori ikkala so'z ham bo'lgan maqolani topdi.", 180, 585, { size: 15, color: C.ink, fam: UI });
      text("• ts_rank so'zlarning chastotasi va o'rnini hisobga oladi.", 180, 615, { size: 15, color: C.ink, fam: UI });
      text("• Natijalar eng mosidan boshlab kamayish tartibida chiqadi.", 180, 645, { size: 15, color: C.soft, fam: UI });

      pill("ts_rank eng mos hujjatlarni ro'yxat boshiga chiqaradi", 530, 765, C.blue, kBox, 15);
    });

    const kRight = P(t, 38.0, 0.8);
    withA(kRight, () => {
      // O'ng: websearch_to_tsquery
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("2. websearch_to_tsquery: Sintaksis Xatolarisiz", 1040, 290, { size: 20, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Foydalanuvchi qidiruvi uchun eng xavfsiz funksiya:", 1040, 350, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("WHERE hujjat @@ websearch_to_tsquery('simple', 'konteyner -docker');", 1040, 380, { size: 12, weight: 700, fam: MONO, color: C.green });

      srect(1040, 415, 700, 150, { fill: '#f6ffed', stroke: C.green });
      text("Natija (docker so'zi bo'lmagan maqola):", 1060, 440, { size: 14, weight: 700, fam: UI, color: C.green });
      text(" id |       sarlavha       ", 1060, 470, { size: 14, fam: MONO, color: C.ink });
      text("----+----------------------", 1060, 490, { size: 14, fam: MONO, color: C.pencil });
      text("  2 | Konteyner tarmoqlari ", 1060, 510, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("1-maqola ('Docker konteynerlari') -docker sababli chiqarildi!", 1060, 535, { size: 13, fam: UI, color: C.ink });

      text("Nega to_tsquery emas, aynan websearch?", 1040, 595, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("• to_tsquery('soz1 soz2') operatorlarsiz sintaksis xatosi beradi!", 1040, 625, { size: 15, weight: 700, color: C.red, fam: UI, wrap: 700 });
      text("• websearch_to_tsquery esa HECH QACHON xato bermaydi.", 1040, 655, { size: 15, weight: 700, color: C.green, fam: UI, wrap: 700 });
      text("• Google kabi qidiruv sintaksisini (qo'shtirnoq, minus) qo'llaydi.", 1040, 685, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("websearch_to_tsquery xatosiz va qidiruv tizimlari kabi ishlaydi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 41.5, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("Frontend yoki API dan kelgan qidiruv matnlarini bevosita websearch_to_tsquery ga uzating.", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Bu foydalanuvchi xato kiritganda ham serverda SQL xatosi paydo bo'lishining oldini oladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. GIN VA TRGM BENCHMARK (45.238 -> 64.68s)
  function sGinVaTrgmBenchmark(t) {
    heading("4. GIN VA PG_TRGM BENCHMARK NIKOHI", "100 000 qatorda LIKE (4.88 ms) vs GIN (0.030 ms) va Trigramma", t, TM.scenes.pg_gin_va_trgm_benchmark);

    const kBox = P(t, 46.0, 0.8);
    withA(kBox, () => {
      // Chap: Benchmark LIKE vs GIN
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kBox });
      text("1. 100 000 Qatorda LIKE vs GIN Taqqosi", 180, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      // LIKE box
      srect(180, 345, 700, 120, { fill: '#fff2f0', stroke: C.red });
      text("A) SELECT count(*) FROM katta WHERE matn LIKE '%konteyner%';", 200, 375, { size: 12, fam: MONO, color: C.red });
      text("Seq Scan on katta (cost=0.00..2975.00 rows=10) (actual rows=20)", 200, 405, { size: 12, fam: MONO, color: C.ink });
      text("Filter: (matn ~~ '%konteyner%') | Rows Removed: 99980", 200, 430, { size: 12, weight: 700, fam: MONO, color: C.red });
      text("Execution Time: 4.882 ms", 200, 455, { size: 13, weight: 700, fam: MONO, color: C.red });

      // GIN box
      srect(180, 480, 700, 130, { fill: '#f6ffed', stroke: C.green });
      text("B) SELECT count(*) FROM katta WHERE hujjat @@ 'konteyner'::tsquery;", 200, 510, { size: 12, fam: MONO, color: C.green });
      text("Bitmap Heap Scan on katta (actual rows=20.00 loops=1)", 200, 540, { size: 12, fam: MONO, color: C.ink });
      text("  -> Bitmap Index Scan on katta_hujjat (Heap Blocks: 20)", 200, 565, { size: 12, weight: 700, fam: MONO, color: C.green });
      text("Execution Time: 0.030 ms (160 BARAVAR TEZROQ!)", 200, 595, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("• LIKE 99 980 ta qatorni disk/xotiradan o'qib filtrdan o'tkazdi.", 180, 640, { size: 15, color: C.ink, fam: UI });
      text("• GIN indeksi esa darhol kerakli 20 ta blokni topdi va tugatdi.", 180, 670, { size: 15, weight: 700, color: C.green, fam: UI });

      pill("GIN indeksi qidiruvni 160 baravar tezlashtirdi (0.030 ms)", 530, 765, C.green, kBox, 15);
    });

    const kRight = P(t, 53.0, 0.8);
    withA(kRight, () => {
      // O'ng: Trigramma
      card(1000, 240, 780, 560, { fill: C.card, col: C.purple, p: kRight });
      text("2. pg_trgm: LIKE So'rovini Indekslash", 1040, 290, { size: 22, weight: 700, color: C.purple, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("So'rovni o'zgartirmasdan tezlashtirish siri:", 1040, 350, { size: 17, weight: 700, color: C.ink, fam: UI });

      srect(1040, 380, 700, 160, { fill: '#f9f0ff', stroke: C.purple });
      text("CREATE EXTENSION pg_trgm;", 1060, 410, { size: 14, fam: MONO, color: C.ink });
      text("CREATE INDEX katta_trgm ON katta USING gin (matn gin_trgm_ops);", 1060, 435, { size: 13, weight: 700, fam: MONO, color: C.purple });
      text("EXPLAIN ANALYZE SELECT count(*) FROM katta", 1060, 465, { size: 12, fam: MONO, color: C.ink });
      text("WHERE matn LIKE '%konteyner%';", 1060, 485, { size: 13, fam: MONO, color: C.ink });
      text("-> Bitmap Index Scan on katta_trgm (Heap Blocks: 20)", 1060, 510, { size: 12, weight: 700, fam: MONO, color: C.purple });
      text("Execution Time: 0.038 ms (Oldingi 4.88 ms o'rniga!)", 1060, 530, { size: 13, weight: 700, fam: MONO, color: C.purple });

      text("• Trigramma indeksi LIKE '%...%' ni ham indeksli qiladi.", 1040, 575, { size: 15, weight: 700, color: C.purple, fam: UI });
      text("• similarity('konteyner', 'kontener') = 0.5833", 1040, 605, { size: 15, fam: MONO, color: C.ink });
      text("• Xato yozilgan so'zlar ham % operatori bilan oson topiladi.", 1040, 635, { size: 15, color: C.soft, fam: UI });
      text("• LIKE so'rovlarini 130 baravargacha tezlashtiradi.", 1040, 665, { size: 15, color: C.soft, fam: UI });

      pill("pg_trgm yordamida oddiy LIKE 130 baravar tezlashadi", 1390, 765, C.purple, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 58.5, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("To'liq matnli qidiruvda eng yuqori unumdorlik: generatsiya qilinadigan tsvector ustuni + GIN indeksi,", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("o'zboshimcha satr bo'laklari va imlo xatolari uchun esa pg_trgm kengaytmasidir.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  function renderScene(t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    if (t < TM.scenes.pg_qidiruv_va_prefiks.s) {
      sTsvectorLugatlar(t);
    } else if (t < TM.scenes.pg_reyting_va_websearch.s) {
      sQidiruvVaPrefiks(t);
    } else if (t < TM.scenes.pg_gin_va_trgm_benchmark.s) {
      sReytingVaWebsearch(t);
    } else {
      sGinVaTrgmBenchmark(t);
    }
  }

  window.renderScene = window.render = window.renderFrame = renderScene;
  window.renderPoster = function () {
    window.renderFrame(10.0);
  };
})();
