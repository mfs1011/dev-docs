// SQL 45-bob 3-qism: "Dialektlar" — MySQL va SQLite EXPLAIN farqlari
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

  // 1. MYSQL TRADITIONAL (0 -> 16.49s)
  function sMysqlTraditional(t) {
    const k = P(t, 0.3, 1.0);
    hand("45-bob. Dialektlar", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL: TRADITIONAL Jadval Formati", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Har bir jadvalga bitta qator: type, key, rows va Extra ustunlari", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(280, 305, 1360 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Traditional jadval
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("EXPLAIN FORMAT=TRADITIONAL Natijasi:", 180, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      srect(180, 440, 700, 180, { fill: '#f0f5ff', stroke: C.blue });
      text("table | type  | key      | rows | filtered | Extra", 200, 475, { size: 15, weight: 700, fam: MONO, color: C.blue });
      sline(200, 495, 860, 495, { col: C.pencil, w: 1 });
      text("m     | range | PRIMARY  |    5 |   100.00 | Using where; temporary", 200, 530, { size: 14, fam: MONO, color: C.ink });
      text("b     | ref   | mijoz_id |   10 |   100.00 | NULL", 200, 565, { size: 14, fam: MONO, color: C.ink });

      text("• type: 'range' (indeks oralig'i) va 'ref' (tenglik qidiruv).", 180, 650, { size: 17, color: C.ink, fam: UI });
      text("• rows: Baza tekshirishni rejalashtirgan qatorlar soni.", 180, 680, { size: 17, color: C.soft, fam: UI });

      pill("Har bir jadval bo'yicha indeks tanlovi va holati", 530, 765, C.blue, kBox, 16);

      // O'ng: Type iyerarxiyasi va xavflar
      const kRank = P(t, 8.0, 0.8);
      withA(kRank, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.red, p: kRank });
        text("Type Iyerarxiyasi va Xavfli Belgilar:", 1040, 390, { size: 24, weight: 700, color: C.red, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Tezlik tartibi (Eng yaxshisidan eng yomoniga):", 1040, 450, { size: 18, weight: 700, color: C.ink, fam: UI });
        text("const > eq_ref > ref > range > index > ALL", 1040, 485, { size: 17, weight: 700, fam: MONO, color: C.green });

        srect(1040, 520, 700, 110, { fill: '#fff1f0', stroke: C.red });
        text("XAVFLI BELGI 1: type = ALL (To'liq jadval skan!)", 1060, 555, { size: 16, weight: 700, fam: MONO, color: C.red });
        text("XAVFLI BELGI 2: Extra = Using filesort", 1060, 595, { size: 16, weight: 700, fam: MONO, color: C.red });

        text("Using filesort — saralash indeks orqali emas,", 1040, 660, { size: 17, color: C.ink, fam: UI });
        text("alohida qimmat saralash algoritmi orqali bajariladi.", 1040, 690, { size: 16, color: C.soft, fam: UI });

        pill("ALL va Using filesort ko'rsangiz — indeks kerak!", 1390, 765, C.red, kRank, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Xulosa: MySQL TRADITIONAL formati jadvallar ketma-ketligini aniq ko'rsatadi!", 960, 905, { size: 23, weight: 700, color: C.ink, fam: UI, align: 'center' });
        text("Yuqoridagi jadval tashqi (outer), pastdagi esa ichki (inner) jadval hisoblanadi.", 960, 945, { size: 19, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. MYSQL TREE VA ANALYZE (16.49 -> 32.54s)
  function sMysqlTreeVaAnalyze(t) {
    heading("2. MySQL: TREE VA EXPLAIN ANALYZE", "Iterator vaqtlari va Postgres bilan birlashtirish farqi", t, TM.scenes.mysql_tree_va_analyze);

    const kTree = P(t, 17.5, 0.8);
    withA(kTree, () => {
      // Chap: MySQL Tree formati
      card(140, 240, 780, 560, { fill: C.card, col: C.green, p: kTree });
      text("MySQL TREE Formati (EXPLAIN ANALYZE):", 180, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Har bir iterator uchun real vaqt va loops o'lchanadi:", 180, 355, { size: 18, color: C.ink, fam: UI });

      srect(180, 395, 700, 180, { fill: '#f6ffed', stroke: C.green });
      text("-> Nested loop inner join (rows=50 loops=1)", 200, 430, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("   (actual time=0.0224..0.0511 ms)", 200, 460, { size: 15, fam: MONO, color: C.soft });
      text("   -> Index range scan on m using PRIMARY", 200, 495, { size: 15, fam: MONO, color: C.blue });
      text("   -> Index lookup on b using mijoz_id", 200, 530, { size: 15, weight: 700, fam: MONO, color: C.orange });
      text("        (actual time=0.008 rows=10 loops=5)", 200, 555, { size: 14, fam: MONO, color: C.orange });

      text("• PostgreSQL kabi daraxt ko'rinishida taqdim etiladi.", 180, 615, { size: 18, color: C.ink, fam: UI });
      text("• Iterator executor orqali har bir bosqich millisekundda.", 180, 650, { size: 17, color: C.soft, fam: UI });

      pill("TREE: Zamonaviy MySQL'dagi asosiy tahlil usuli", 530, 745, C.green, kTree, 16);
    });

    const kDiff = P(t, 24.5, 0.8);
    withA(kDiff, () => {
      // O'ng: Katta birlashtirish farqi
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kDiff });
      text("200 000 Qatorda Postgres vs MySQL Farqi:", 1040, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 120, { fill: '#f0f5ff', stroke: C.blue });
      text("PostgreSQL 18:", 1060, 375, { size: 17, weight: 700, fam: UI, color: C.blue });
      text("-> Hash Join (1.2 MB xotira, parallel o'qish)", 1060, 410, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("Vaqt: atigi 19.5 millisekund!", 1060, 440, { size: 16, fam: UI, color: C.green });

      srect(1040, 475, 700, 140, { fill: '#fffaf0', stroke: C.orange });
      text("MySQL 9:", 1060, 510, { size: 17, weight: 700, fam: UI, color: C.orange });
      text("-> Nested loop inner join (loops=20000 marta!)", 1060, 545, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("20 000 ta alohida indeks qidiruvi, vaqt: ~62 ms.", 1060, 580, { size: 15, fam: UI, color: C.ink });

      text("DML cheklovi: MySQL'da bitta jadvalli DELETE ni", 1040, 645, { size: 17, color: C.red, fam: UI });
      text("EXPLAIN ANALYZE qilib bo'lmaydi (xato beradi).", 1040, 675, { size: 17, weight: 700, color: C.red, fam: UI });

      pill("PostgreSQL Hash Join hisobiga 3 baravar tezroq chiqdi", 1390, 745, C.orange, kDiff, 15);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 29.5, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.orange, p: kFoot2 });
      text("Eslatma: Har bir bazaning o'z rejalashtiruvchi optimizator mantig'i bor!", 960, 885, { size: 22, weight: 700, color: C.orange, fam: UI, align: 'center' });
      text("MySQL indeksli nested loopni arzon deb bildi, Postgres esa xotiraga yuklab Hash Join qilishni ma'qul ko'rdi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 3. SQLITE QUERY PLAN (32.54 -> 48.60s)
  function sSqliteQueryPlan(t) {
    heading("3. SQLite: EXPLAIN QUERY PLAN", "SCAN va SEARCH so'zlari orqali yuqori darajadagi tahlil", t, TM.scenes.sqlite_query_plan);

    const kEqp = P(t, 33.5, 0.8);
    withA(kEqp, () => {
      // Chap: EQP formati
      card(140, 240, 780, 560, { fill: C.card, col: C.teal, p: kEqp });
      text("SQLite: Nega EXPLAIN QUERY PLAN?", 180, 290, { size: 24, weight: 700, color: C.teal, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("• Oddiy EXPLAIN: Virtual mashina baytkodini chiqaradi.", 180, 355, { size: 18, color: C.red, fam: UI });
      text("  (Faqat SQLite dasturchilari va ichki tuzilma uchun).", 180, 385, { size: 16, color: C.soft, fam: UI });

      text("• EXPLAIN QUERY PLAN: Inson o'qiydigan reja daraxti!", 180, 435, { size: 18, weight: 700, color: C.green, fam: UI });

      srect(180, 475, 700, 170, { fill: '#e6fffa', stroke: C.teal });
      text("QUERY PLAN", 200, 510, { size: 16, weight: 700, fam: MONO, color: C.teal });
      text("|--SEARCH m USING INTEGER PRIMARY KEY (rowid<?)", 200, 545, { size: 15, fam: MONO, color: C.ink });
      text("|--SEARCH b USING INDEX buyurtmalar_mijoz_idx", 200, 580, { size: 15, fam: MONO, color: C.green });
      text("`--USE TEMP B-TREE FOR GROUP BY", 200, 615, { size: 15, fam: MONO, color: C.orange });

      text("SEARCH — indeks ishlatildi; TEMP B-TREE — saralash keshda.", 180, 680, { size: 17, color: C.ink, fam: UI });

      pill("Doimo: EXPLAIN QUERY PLAN deb yozing", 530, 745, C.teal, kEqp, 16);
    });

    const kKeys = P(t, 40.5, 0.8);
    withA(kKeys, () => {
      // O'ng: Asosiy atamalar va cheklovlar
      card(1000, 240, 780, 560, { fill: C.card, col: C.purple, p: kKeys });
      text("Asosiy Yozuvlar va SQLite Cheklovlari:", 1040, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Lug'at:", 1040, 350, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• SCAN t : Butun jadval ketma-ket o'qildi (Seq Scan).", 1040, 385, { size: 17, color: C.red, fam: UI });
      text("• SEARCH t USING INDEX : Indeks orqali aniq qidirildi.", 1040, 420, { size: 17, color: C.green, fam: UI });
      text("• USE TEMP B-TREE : ORDER BY yoki GROUP BY uchun kesh.", 1040, 455, { size: 17, color: C.orange, fam: UI });

      text("Muhim Cheklovlar:", 1040, 515, { size: 19, weight: 700, color: C.red, fam: UI });
      text("1. Haqiqiy vaqt va cost ko'rsatilmaydi (faqat reja tuzilishi).", 1040, 550, { size: 17, color: C.ink, fam: UI });
      text("2. Barcha JOIN lar faqat NESTED LOOP bilan bajariladi.", 1040, 585, { size: 17, color: C.ink, fam: UI });
      text("3. Vaqtni o'lchash uchun SQLite CLI da .timer ON kerak.", 1040, 620, { size: 17, color: C.soft, fam: UI });

      pill("SQLite: Yengil, sodda va faqat Nested Loop", 1390, 745, C.purple, kKeys, 16);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 45.5, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#f0f5ff', col: C.teal, p: kFoot3 });
      text("SQLite CLI foydali buyruqlari:", 960, 885, { size: 22, weight: 700, color: C.teal, fam: UI, align: 'center' });
      text(".eqp on — har so'rovdan oldin avtomatik reja; .timer on — har so'rov ijro vaqtini chiqaradi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. TAQQOSLASH VA XATOLAR (48.60 -> 65.84s)
  function sTaqqoslashVaXatolar(t) {
    heading("4. TAQQOSLASH JADVALI VA TIPIK XATOLAR", "Arxitekturaviy farqlar va mutaxassis xulosalari", t, TM.scenes.taqqoslash_va_xatolar);

    const kTab = P(t, 49.5, 0.8);
    withA(kTab, () => {
      // Chap: Taqqoslash jadvali
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kTab });
      text("EXPLAIN Imkoniyatlari Qiyosi:", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      const matrix = [
        ["Imkoniyat", "Postgres", "MySQL", "SQLite"],
        ["Faqat reja", "EXPLAIN", "TREE/TRAD", "QUERY PLAN"],
        ["Real ijro (ANALYZE)", "✓ Ha (ms)", "✓ Ha (ms)", "✗ Yo'q (.timer)"],
        ["Taxminiy narx (cost)", "✓ cost=..", "✓ cost=..", "✗ Yo'q"],
        ["Haqiqiy rows", "✓ actual rows", "✓ actual rows", "✗ Yo'q"],
        ["BUFFERS (kesh/disk)", "✓ shared hit", "✗ Yo'q", "✗ Yo'q"],
        ["Birlashtirish turlari", "Loop, Hash, Merge", "Loop, Hash", "Faqat Loop"],
        ["DML tahlili", "✓ BEGIN/ROLLBACK", "Ko'p jadvalli", "✗ Yo'q"]
      ];

      matrix.forEach((r, idx) => {
        const yPos = 345 + idx * 42;
        const isHdr = idx === 0;
        text(r[0], 180, yPos, { size: isHdr ? 16 : 15, weight: isHdr ? 700 : 600, fam: isHdr ? UI : MONO, color: isHdr ? C.blue : C.ink });
        text(r[1], 440, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[1].startsWith('✓') ? C.green : C.soft });
        text(r[2], 610, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[2].startsWith('✓') ? C.green : C.soft });
        text(r[3], 760, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[3].startsWith('✓') ? C.green : C.soft });
        if (isHdr) sline(180, yPos + 12, 880, yPos + 12, { col: C.pencil, w: 1 });
      });

      pill("PostgreSQL eng chuqur va batafsil EXPLAIN ga ega", 530, 745, C.blue, kTab, 16);
    });

    const kTraps = P(t, 55.5, 0.8);
    withA(kTraps, () => {
      // O'ng: Tipik xatolar
      card(1000, 240, 780, 560, { fill: C.card, col: C.red, p: kTraps });
      text("Keng Tarqalgan Tipik Xatolar:", 1040, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("1. Cost ni millisekund deb o'ylash:", 1040, 360, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Cost — shartli hisob-kitob. Real vaqt faqat ANALYZE da!", 1040, 395, { size: 17, color: C.ink, fam: UI });

      text("2. Loops ko'paytuvchisini unutish:", 1040, 450, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Ichki tugun vaqti va qatorlari bitta loop uchun beriladi.", 1040, 485, { size: 17, color: C.soft, fam: UI });
      text("   Umumiy hisob: time × loops bo'lishi shart!", 1040, 515, { size: 17, weight: 700, color: C.green, fam: UI });

      text("3. Tranzaksiyasiz EXPLAIN ANALYZE DELETE:", 1040, 570, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Ma'lumot o'chib ketadi! Doim BEGIN; ... ROLLBACK; ishlating.", 1040, 605, { size: 17, color: C.red, fam: UI });

      text("4. Using filesort va type=ALL ga e'tiborsiz qarash:", 1040, 660, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Bu ikkisi so'rovlarning eng asosiy sekinlashtiruvchilaridir.", 1040, 695, { size: 17, color: C.soft, fam: UI });

      pill("Xatolarni bartaraf qilish — so'rovlarni o'nlab baravar tezlashtiradi", 1390, 745, C.red, kTraps, 15);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 60.5, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.blue, p: kFoot4 });
      text("Xulosa: EXPLAIN o'qishni bilish — professional muhandislik belgisidir!", 960, 885, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
      text("Taxmin qilmang, rejani ko'ring, to'siqlarni aniqlang va aniq indekslar bilan muammoni hal eting.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.mysql_traditional.e) sMysqlTraditional(t);
    else if (t < TM.scenes.mysql_tree_va_analyze.e) sMysqlTreeVaAnalyze(t);
    else if (t < TM.scenes.sqlite_query_plan.e) sSqliteQueryPlan(t);
    else sTaqqoslashVaXatolar(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
