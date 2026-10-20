// SQL 42-bob 3-qism: "Dialektlar" — Ko'p ustunli indeks
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

  // 1. MYSQL SKIP SCAN VA SARALASH (0 -> 15.58s)
  function sMysqlSkipScan(t) {
    const k = P(t, 0.3, 1.0);
    hand("42-bob. Dialektlar Bo'yicha Farqlar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("MySQL: Skip Scan va Aralash Saralash", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL 9.7: Covering Index Skip Scan va Table Scan xatarlari", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: MySQL Covering Index Skip Scan
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kBox });
      text("MySQL 9.7: Covering Index Skip Scan", 180, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN FORMAT=TREE", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("SELECT count(*) FROM xodimlar WHERE boy = 180;", 180, 525, { size: 16, fam: MONO, color: '#cdd6f4' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("-> Covering index skip scan on xodimlar", 180, 585, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
      text("   using x_rol_boy over boy = 180", 180, 615, { size: 16, fam: MONO, color: '#a6e3a1' });
      text("• Qat'iy Shart: So'rov faqat indeksdagi", 180, 655, { size: 17, fam: UI, color: '#fab387' });
      text("  ustunlarni (rol, boy) o'z ichiga olishi shart!", 180, 685, { size: 17, weight: 600, fam: UI, color: '#89b4fa' });
      pill("Covering index skip scan ishlatildi", 530, 765, C.blue, kBox, 16);

      // O'ng: Aralash saralashda Table Scan
      const kRight = P(t, 7.5, 0.8);
      withA(kRight, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kRight });
        text("Aralash Saralash: Xavfli Table Scan", 1040, 430, { size: 21, weight: 700, color: '#f38ba8', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT * FROM xodimlar", 1040, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("ORDER BY bolim ASC, familiya DESC LIMIT 5;", 1040, 525, { size: 16, fam: MONO, color: '#fab387' });

        sline(1040, 550, 1740, 550, { col: '#45475a', w: 1 });
        text("Natija: Butun Jadvalni To'liq Skanerlash!", 1040, 585, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
        text("-> Sort: bolim, familiya DESC", 1040, 620, { size: 16, fam: MONO, color: '#f38ba8' });
        text("    -> Table scan on xodimlar (rows=200000) ✗", 1040, 650, { size: 16, weight: 700, fam: MONO, color: '#f38ba8' });
        text("Postgres kabi Incremental Sort yo'q, hamma o'qiladi!", 1040, 685, { size: 16, fam: UI, color: '#a6adc8' });
        pill("Descending indeks bo'lmasa to'liq skanerlaydi", 1390, 765, C.red, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("MySQL Saralash Xulosasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("MySQL aralash yo'nalishli so'rovda oddiy indeksdan qisman ham foydalana olmaydi va butun jadvalni o'qiydi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Shuning uchun MySQL'da bunday so'rovlar uchun albatta (col1, col2 DESC) indeksini yarating.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. SQLITE ANALIZ VA ANY QOIDASI (15.58 -> 31.28s)
  function sSqliteAnaliz(t) {
    heading("SQLite: ANALYZE va ANY() Sharti", t, TM.scenes.sqlite_analiz_va_any_qoidasi.s);

    const kCards = P(t, TM.scenes.sqlite_analiz_va_any_qoidasi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: ANALYZE dan oldin vs keyin
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("SQLite 3.54: EXPLAIN QUERY PLAN", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("So'rov: SELECT count(*) FROM xodimlar WHERE boy = 180;", 180, 495, { size: 15, fam: MONO, color: '#cdd6f4' });
      sline(180, 520, 880, 520, { col: '#45475a', w: 1 });

      text("1. ANALYZE dan oldin (Statistikasiz):", 180, 555, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
      text("`--SCAN xodimlar USING COVERING INDEX x_rol_boy", 180, 590, { size: 15, fam: MONO, color: '#f38ba8' });
      text("   (Butun indeks boshidan oxirigacha o'qildi!)", 180, 620, { size: 16, fam: UI, color: '#a6adc8' });

      text("2. ANALYZE dan keyin (Statistika bilan):", 180, 660, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
      text("`--SEARCH ... USING COVERING INDEX (ANY(rol) AND boy=?)", 180, 695, { size: 14, weight: 700, fam: MONO, color: '#a6e3a1' });
      pill("ANY(rol) = SQLite skip scan belgisi", 530, 765, C.blue, kCards, 16);

      // O'ng: Sabab va qoidalar
      const kWhy = P(t, 23.5, 0.8);
      withA(kWhy, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kWhy });
        text("Nega ANALYZE Bo'lishi Shart?", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Standart Taxmin: 10 ta takror:", 1040, 495, { size: 18, weight: 700, color: C.ink, fam: UI });
        text("   Statistikasiz SQLite chap ustunda o'rtacha", 1040, 525, { size: 17, color: C.soft, fam: UI });
        text("   atigi 10 ta takror bor deb o'ylaydi.", 1040, 555, { size: 17, color: C.soft, fam: UI });

        text("2. Skip Scan Chegarasi: >= 18 ta takror:", 1040, 600, { size: 18, weight: 700, color: C.green, fam: UI });
        text("   Rasmiy hujjatga ko'ra, skip scan har bir qiymatga", 1040, 630, { size: 17, color: C.ink, fam: UI });
        text("   18 va undan ortiq takror bo'lsagina foyda beradi.", 1040, 660, { size: 17, weight: 600, color: C.green, fam: UI });

        sline(1040, 700, 1740, 700, { col: C.pencil, w: 1 });
        pill("Statistikasiz skip scan hech qachon yoqilmaydi", 1390, 765, C.green, kWhy, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 27.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("SQLite Hujjatidagi Qat'iy Ogohlantirish:", 180, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("ANALYZE buyrug'isiz SQLite ko'p ustunli indekslarda hech qachon skip scan'ni tanlamaydi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Ishlab chiqarish muhitida so'rovlar tez ishlashi uchun vaqti-vaqti bilan ANALYZE ishga tushirilishi shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. MULTI-INDEX VA INDEX MERGE (31.28 -> 47.13s)
  function sMultiIndex(t) {
    heading("OR Shartlari: MySQL Index Merge vs SQLite MULTI-INDEX", t, TM.scenes.multi_index_va_index_merge.s);

    const kCards = P(t, TM.scenes.multi_index_va_index_merge.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: MySQL Index Merge
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("MySQL: Sort-deduplicate by row ID", 180, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("EXPLAIN FORMAT=TREE", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("SELECT * FROM xodimlar WHERE bolim = 5 OR boy = 199;", 180, 525, { size: 15, fam: MONO, color: '#cdd6f4' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("-> Filter: ((bolim = 5) or (boy = 199))", 180, 585, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("    -> Sort-deduplicate by row ID", 180, 615, { size: 17, weight: 700, fam: MONO, color: '#fab387' });
      text("        -> Index range scan on x_bolim_fam", 180, 650, { size: 16, fam: MONO, color: '#89b4fa' });
      text("        -> Index range scan on x_boy", 180, 680, { size: 16, fam: MONO, color: '#a6e3a1' });
      pill("Row ID bo'yicha saralash va dublikatni tozalash", 530, 765, C.blue, kCards, 16);

      // O'ng: SQLite MULTI-INDEX OR
      const kSqlite = P(t, 39.5, 0.8);
      withA(kSqlite, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kSqlite });
        text("SQLite: MULTI-INDEX OR", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("EXPLAIN QUERY PLAN", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("SELECT * FROM xodimlar WHERE bolim = 5 OR boy = 199;", 1040, 525, { size: 15, fam: MONO, color: '#cdd6f4' });

        sline(1040, 550, 1740, 550, { col: '#45475a', w: 1 });
        text("`--MULTI-INDEX OR", 1040, 585, { size: 18, weight: 700, fam: MONO, color: '#fab387' });
        text("   |--INDEX 1", 1040, 620, { size: 16, fam: MONO, color: '#89b4fa' });
        text("   |  `--SEARCH USING INDEX x_bolim_fam (bolim=?)", 1040, 650, { size: 15, fam: MONO, color: '#89b4fa' });
        text("   `--INDEX 2", 1040, 685, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("      `--SEARCH USING INDEX x_boy (boy=?)", 1040, 715, { size: 15, fam: MONO, color: '#a6e3a1' });
        pill("Ikkala indeks alohida qidirilib birlashtirildi", 1390, 765, C.green, kSqlite, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 43.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Dvigatellarning OR Strategiyasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Postgres (BitmapOr), MySQL (Index Merge) va SQLite (MULTI-INDEX) barchasi bitta g'oyadan foydalanadi:", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Har bir indeksdan manzil ro'yxatini olib xotirada birlashtiradi va asosiy jadvalga faqat bir marta murojaat qiladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. DIALEKTLAR JADVALI VA XATOLAR (47.13 -> 65.10s)
  function sDialektlarVaXatolar(t) {
    heading("Dialektlar Taqqoslashi va Tipik Xatolar", t, TM.scenes.dialektlar_jadvali_va_xatolar.s);

    const kCards = P(t, TM.scenes.dialektlar_jadvali_va_xatolar.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Dialektlar jadvali
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("3 Ta Dvigatel Bo'yicha Taqqoslash:", 180, 430, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Maksimal ustunlar soni:", 180, 495, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: 32 ta | MySQL: 16 ta | SQLite: chegarasiz", 180, 525, { size: 16, fam: MONO, color: C.blue });

      text("• Skip scan yondashuvi:", 180, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: B-Tree searches | MySQL: Covering | SQLite: ANY()", 180, 590, { size: 15, fam: MONO, color: C.green });

      text("• Aralash saralash (bolim ASC, familiya DESC):", 180, 625, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: Incremental Sort | MySQL: Table Scan | SQLite: Temp B-tree", 180, 655, { size: 15, fam: MONO, color: C.purple });

      text("• OR birlashtirish:", 180, 690, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: BitmapOr | MySQL: Sort-deduplicate | SQLite: MULTI-INDEX", 180, 720, { size: 15, fam: MONO, color: C.orange });
      pill("Barcha bazalar ko'p ustunli indeksni qo'llab-quvvatlaydi", 530, 765, C.blue, kCards, 16);

      // O'ng: Tipik xatolar
      const kMistakes = P(t, 55.5, 0.8);
      withA(kMistakes, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.red, p: kMistakes });
        text("Ko'p Ustunli Indekslardagi Tipik Xatolar:", 1040, 430, { size: 21, weight: 700, color: C.red, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. (a, b) bor joyda yana alohida (a) saqlash:", 1040, 495, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   (a, b) indeksi 'a' ni to'liq qoplaydi. (a) ortiqcha yuk!", 1040, 525, { size: 17, color: C.ink, fam: UI });

        text("2. Ustunlar tartibini o'ylamasdan tuzish:", 1040, 560, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Tenglik ustunlarini chapga, oraliq shartlarini o'ngga qo'ying.", 1040, 590, { size: 17, color: C.ink, fam: UI });

        text("3. Skip scan'ga ko'r-ko'rona ishonish:", 1040, 625, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Chap ustunda qiymat ko'p bo'lsa skip scan ishlamaydi.", 1040, 655, { size: 17, color: C.ink, fam: UI });

        text("4. ORDER BY a, b DESC uchun oddiy indeks kutish:", 1040, 690, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Aralash tartib uchun doimo DESC indeks yarating!", 1040, 720, { size: 17, color: C.ink, fam: UI });
        pill("Ortiqcha va noto'g'ri indekslardan saqlaning", 1390, 765, C.red, kMistakes, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 60.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Oltin Xulosa: So'rov Profiliga Mos Indeks Tuzing!", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Ko'p ustunli indeks bitta so'rovda bir nechta shartni birlashtirishning eng kuchli qurolidir.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Tenglik ustunlarini chapga qo'ying, kerakli tartibda DESC indeksdan foydalaning va rejani EXPLAIN bilan tekshiring.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.sqlite_analiz_va_any_qoidasi.s) {
      sMysqlSkipScan(t);
    } else if (t < TM.scenes.multi_index_va_index_merge.s) {
      sSqliteAnaliz(t);
    } else if (t < TM.scenes.dialektlar_jadvali_va_xatolar.s) {
      sMultiIndex(t);
    } else {
      sDialektlarVaXatolar(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
