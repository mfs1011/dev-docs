// SQL 43-bob 3-qism: "Dialektlar" — Maxsus indekslar
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

  // 1. MYSQL KOLLATSIYA VA FUNKSIONAL (0 -> 17.78s)
  function sMysqlKollatsiya(t) {
    const k = P(t, 0.3, 1.0);
    hand("43-bob. Dialektlar Bo'yicha Farqlar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("MySQL: Case-Insensitive Collation va Funksional Indeks", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL 9.7: utf8mb4_0900_ai_ci va ikki qavsli ((LOWER(col))) sintaksisi", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: MySQL Collation siri
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kBox });
      text("MySQL: Sukut Collation Harfni Farqlamaydi", 180, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("Collation: utf8mb4_0900_ai_ci (ci = case-insensitive)", 180, 495, { size: 15, fam: MONO, color: '#fab387' });
      text("SELECT id FROM f WHERE email = 'USER77@MISOL.UZ';", 180, 525, { size: 15, fam: MONO, color: '#cdd6f4' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("Natija: Oddiy f_email Indeksidan Foydalandi!", 180, 585, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
      text("-> Covering index lookup on f using f_email ✓", 180, 620, { size: 16, fam: MONO, color: '#a6e3a1' });
      text("   (Katta harfli so'rov kichik harfli qatorni topdi)", 180, 650, { size: 16, fam: UI, color: '#cdd6f4' });
      text("• MySQL'da oddiy UNIQUE (email) ham harfni farqlamaydi.", 180, 685, { size: 16, fam: UI, color: '#a6adc8' });
      pill("MySQL sukut bo'yicha katta-kichik harfni farqlamaydi", 530, 765, C.blue, kBox, 16);

      // O'ng: Funksional indeks
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kRight });
        text("MySQL Funksional Indeks Sintaksisi:", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("Agar so'rovda LOWER(email) yozilsa oddiy indeks o'chadi.", 1040, 495, { size: 16, fam: UI, color: '#cdd6f4' });
        text("Yechim: Qat'iy IKKI QAVS bilan indeks yarating:", 1040, 530, { size: 17, weight: 700, fam: UI, color: '#fab387' });

        text("CREATE INDEX f_lower ON f ((LOWER(email)));", 1040, 565, { size: 16, fam: MONO, color: '#89b4fa' });
        sline(1040, 595, 1740, 595, { col: '#45475a', w: 1 });

        text("-> Index lookup on f using f_lower ✓", 1040, 630, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("• MySQL buni yashirin virtual generated ustun", 1040, 665, { size: 16, fam: UI, color: '#cdd6f4' });
        text("  sifatida saqlaydi va ustunlar soni hisobiga kiradi.", 1040, 695, { size: 16, fam: UI, color: '#a6adc8' });
        pill("Funksional indeks ikki qavs ((...)) talab qiladi", 1390, 765, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("MySQL Collation Xulosasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("MySQL'da LIKE 'prefiks%' va case-insensitive tenglik uchun text_pattern_ops kerak emas — oddiy indeks yetarli.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Lekin harf farqini qat'iy ajratish kerak bo'lsa, 'utf8mb4_bin' collation'idan foydalanish shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. SQLITE ALGEBRA VA NOCASE (17.78 -> 33.41s)
  function sSqliteAlgebra(t) {
    heading("SQLite: Algebra Yo'qligi va NOCASE Collation", t, TM.scenes.sqlite_algebra_va_nocase.s);

    const kCards = P(t, TM.scenes.sqlite_algebra_va_nocase.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: SQLite algebra qilmaydi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kCards });
      text("SQLite Qoidasi: Rejalashtiruvchi Algebra Qilmaydi!", 180, 430, { size: 20, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("CREATE INDEX f_xy ON f (x + y);", 180, 495, { size: 16, fam: MONO, color: '#89b4fa' });
      sline(180, 520, 880, 520, { col: '#45475a', w: 1 });

      text("1. WHERE x + y = 22;  -> SEARCH (indeks ishlaydi!) ✓", 180, 555, { size: 15, fam: MONO, color: '#a6e3a1' });
      text("2. WHERE y + x = 22;  -> SCAN f (Seq Scan!) ✗", 180, 590, { size: 15, fam: MONO, color: '#f38ba8' });
      text("• Matematik jihatdan teng, lekin SQLite harfma-harf moslik kutadi.", 180, 625, { size: 16, fam: UI, color: '#cdd6f4' });

      text("3. CREATE INDEX ON f (random());", 180, 665, { size: 16, fam: MONO, color: '#f38ba8' });
      text("   Parse error: non-deterministic functions prohibited!", 180, 695, { size: 14, weight: 700, fam: MONO, color: '#f38ba8' });
      pill("So'rov ifodasi indeks bilan aynan bir xil yozilishi shart", 530, 765, C.red, kCards, 16);

      // O'ng: SQLite LIKE va NOCASE
      const kNoCase = P(t, 25.5, 0.8);
      withA(kNoCase, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kNoCase });
        text("SQLite LIKE va COLLATE NOCASE:", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SQLite sukut collation: BINARY (harfni farqlaydi).", 1040, 495, { size: 16, fam: UI, color: '#cdd6f4' });
        text("Oddiy indeksda LIKE 'user77%' to'liq skanerlashga tushadi.", 1040, 525, { size: 16, fam: UI, color: '#f38ba8' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("Yechim: COLLATE NOCASE bilan indekslash:", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#fab387' });
        text("CREATE INDEX f_email_nc ON f (email COLLATE NOCASE);", 1040, 625, { size: 15, fam: MONO, color: '#89b4fa' });
        text("-> SEARCH USING COVERING INDEX (email>? AND email<?) ✓", 1040, 660, { size: 14, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("• LIKE prefiksi darhol oraliq Index Scanga aylandi!", 1040, 695, { size: 16, fam: UI, color: '#cdd6f4' });
        pill("NOCASE indeksi SQLite'da LIKE ni optimallashtiradi", 1390, 765, C.green, kNoCase, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 29.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("SQLite Indeks Taqqoslash Qoidasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("SQLite'da indeks taqqoslash qoidasi so'rov taqqoslash qoidasiga to'liq mos kelishi shart.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Agar ifodada eng kichik nomuvofiqlik bo'lsa yoki collation farq qilsa, baza indeksni tashlab to'liq skanerlaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. QISMAN INDEKS FARQLARI (33.41 -> 48.99s)
  function sQismanIndeksFarqlari(t) {
    heading("Qisman Indeks va INCLUDE Cheklovlari", t, TM.scenes.qisman_indeks_farqlari.s);

    const kCards = P(t, TM.scenes.qisman_indeks_farqlari.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Qisman indeks mavjudligi
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("Qisman Indeks: PG va SQLite vs MySQL", 180, 430, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("CREATE INDEX f_yangi ON f (id) WHERE holat = 'yangi';", 180, 495, { size: 16, fam: MONO, color: C.blue });
      sline(180, 520, 880, 520, { col: C.pencil, w: 1 });

      text("• PostgreSQL: To'liq qo'llab-quvvatlanadi (21x kichik) ✓", 180, 560, { size: 17, weight: 600, color: C.green, fam: UI });
      text("• SQLite: To'liq qo'llab-quvvatlanadi ✓", 180, 600, { size: 17, weight: 600, color: C.green, fam: UI });
      text("• MySQL 9.7: UMUMAN YO'Q!", 180, 640, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  ERROR 1064: syntax error near 'WHERE holat = ...' ✗", 180, 670, { size: 15, fam: MONO, color: C.red });
      text("  (MySQL'da qisman indekslar sintaksis darajasida yo'q)", 180, 705, { size: 16, color: C.soft, fam: UI });
      pill("MySQL qisman indeksni qo'llab-quvvatlamaydi", 530, 765, C.red, kCards, 16);

      // O'ng: INCLUDE klauzasi
      const kInc = P(t, 41.5, 0.8);
      withA(kInc, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.purple, p: kInc });
        text("INCLUDE Klauzasi va Alternativalar:", 1040, 430, { size: 22, weight: 700, color: C.purple, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("CREATE INDEX f_id_inc ON f (id) INCLUDE (ism);", 1040, 495, { size: 16, fam: MONO, color: C.purple });
        sline(1040, 520, 1740, 520, { col: C.pencil, w: 1 });

        text("• PostgreSQL: INCLUDE yuk ustunlarini qo'shadi ✓", 1040, 560, { size: 17, color: C.ink, fam: UI });
        text("• MySQL va SQLite: INCLUDE klauzasi yo'q!", 1040, 600, { size: 18, weight: 700, color: C.orange, fam: UI });
        text("  Muqobil yechim: Ko'p ustunli indeks (id, ism)", 1040, 635, { size: 17, fam: MONO, color: C.ink });
        text("• InnoDB Siri: Har bir ikkilamchi indeksda Primary Key", 1040, 675, { size: 17, weight: 600, color: C.blue, fam: UI });
        text("  avtomatik mavjud bo'lgani uchun id qo'shish shart emas!", 1040, 705, { size: 16, color: C.soft, fam: UI });
        pill("Postgresda INCLUDE, MySQL'da ko'p ustunli indeks", 1390, 765, C.purple, kInc, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 45.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Ko'chirishdagi Ehtiyotkorlik:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Postgres sxemasini MySQL'ga ko'chirganda qisman indeks (WHERE) va INCLUDE xatolik beradi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("MySQL'da bu vazifalarni virtual generated ustunlar yoki ko'p ustunli qoplovchi indekslar orqali hal qilish lozim.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. DIALEKTLAR JADVALI VA XATOLAR (48.99 -> 67.26s)
  function sDialektlarVaXatolar(t) {
    heading("Dialektlar Taqqoslashi va Tipik Xatolar", t, TM.scenes.dialektlar_jadvali_va_xatolar.s);

    const kCards = P(t, TM.scenes.dialektlar_jadvali_va_xatolar.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Taqqoslash jadvali
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("Maxsus Indekslar Bo'yicha Solishtirma:", 180, 430, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Ifoda indeksi:", 180, 495, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: (lower(x)) | MySQL: ((LOWER(x))) | SQLite: (lower(x))", 180, 525, { size: 15, fam: MONO, color: C.blue });

      text("• Qisman indeks (WHERE):", 180, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: Bor (21x tejam) | MySQL: YO'Q | SQLite: Bor", 180, 590, { size: 16, fam: MONO, color: C.green });

      text("• INCLUDE klauzasi:", 180, 625, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: Bor | MySQL: Yo'q (composite) | SQLite: Yo'q", 180, 655, { size: 16, fam: MONO, color: C.purple });

      text("• LIKE prefiks optimizatsiyasi:", 180, 690, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("  PG: text_pattern_ops | MySQL: Sukut B-tree | SQLite: NOCASE", 180, 720, { size: 15, fam: MONO, color: C.orange });
      pill("Har bir dvigatelning o'z maxsus qoidalari bor", 530, 765, C.blue, kCards, 16);

      // O'ng: Tipik xatolar
      const kMistakes = P(t, 55.5, 0.8);
      withA(kMistakes, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.red, p: kMistakes });
        text("Maxsus Indekslardagi Eng Katta Xatolar:", 1040, 430, { size: 21, weight: 700, color: C.red, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. WHERE lower(email) bor, lekin faqat email indeksi:", 1040, 495, { size: 17, weight: 700, color: C.red, fam: UI });
        text("   Indeks ishlatilmaydi! Albatta ifoda indeksi quring.", 1040, 525, { size: 16, color: C.ink, fam: UI });

        text("2. So'rovda ifodani boshqacha yozish (SQLite x+y vs y+x):", 1040, 560, { size: 17, weight: 700, color: C.red, fam: UI });
        text("   Rejalashtiruvchi algebra qilmaydi, aynan bir xil bo'lsin.", 1040, 590, { size: 16, color: C.ink, fam: UI });

        text("3. 1% qator uchun 100% to'liq indeks saqlash:", 1040, 625, { size: 17, weight: 700, color: C.red, fam: UI });
        text("   Qisman indeksdan foydalanib 21 baravar xotirani tejang.", 1040, 655, { size: 16, color: C.ink, fam: UI });

        text("4. PG'da LIKE prefiksi uchun oddiy indeks kutish:", 1040, 690, { size: 17, weight: 700, color: C.red, fam: UI });
        text("   Collation tufayli text_pattern_ops qo'yish majburiydir.", 1040, 720, { size: 16, color: C.ink, fam: UI });
        pill("Maxsus indekslarni real profayling bilan qo'llang", 1390, 765, C.red, kMistakes, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 60.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Oltin Xulosa: Aniq So'rovga Aniq Moslashgan Indeks!", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Maxsus indekslar oddiy indekslar yetib bora olmaydigan nozik joylarni (katta-kichik harf, kam sonli qatorlar, LIKE)", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("yuqori tezlikka olib chiqadi. Har birini o'z o'rnida qo'llang va EXPLAIN orqali tekshiring.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.sqlite_algebra_va_nocase.s) {
      sMysqlKollatsiya(t);
    } else if (t < TM.scenes.qisman_indeks_farqlari.s) {
      sSqliteAlgebra(t);
    } else if (t < TM.scenes.dialektlar_jadvali_va_xatolar.s) {
      sQismanIndeksFarqlari(t);
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
