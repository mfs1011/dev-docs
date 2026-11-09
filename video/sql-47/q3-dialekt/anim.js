// SQL 47-bob 3-qism: "Dialektlar" — Sekin so'rovlar
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

  // 1. MYSQL_COLLATION_VA_FUNCTIONAL_KEYS (0 -> 16.17s)
  function sMysqlCollation(t) {
    const k = P(t, 0.3, 1.0);
    hand("47-bob. Sekin So'rovlar", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL: Kollatsiya va Funksional Indeks", 960, 195, { size: 56, align: 'center', p: P(t, 0.6, 1.2), color: C.orange });
    hand("Kollatsiya sababli lower() ko'pincha MySQL da umuman shart emas", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Kollatsiya
      card(140, 340, 780, 480, { fill: C.card, col: C.orange, p: kBox });
      text("1. Standart Kollatsiya: utf8mb4_0900_ai_ci", 180, 390, { size: 22, weight: 700, color: C.orange, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT @@collation_database;", 180, 450, { size: 15, fam: MONO, color: C.ink });

      srect(180, 475, 700, 130, { fill: '#fffbe6', stroke: C.orange });
      text("utf8mb4_0900_ai_ci", 200, 510, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("• _ci: case-insensitive (katta-kichik harfga befarq)", 200, 540, { size: 15, fam: UI, color: C.ink });
      text("• _ai: accent-insensitive (urg'u belgilariga befarq)", 200, 570, { size: 15, fam: UI, color: C.ink });

      text("Natija: WHERE email = 'mijoz500@...' so'rovi", 180, 640, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("'Mijoz500@...' qatorini oddiy indeks bilan topadi!", 180, 670, { size: 17, weight: 700, color: C.green, fam: UI });
      text("Hech qanday lower() yoki ifoda indeksi shart emas.", 180, 700, { size: 16, color: C.soft, fam: UI });

      pill("Standart kollatsiyada registrga befarq qidiruv tayyor", 530, 780, C.orange, kBox, 15);

      // O'ng: Funksional kalit qismi
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.blue, p: kRight });
        text("2. Funksional Indeks: Ikkita Qavs ((expr))", 1040, 390, { size: 22, weight: 700, color: C.blue, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("CREATE INDEX m_email_lower ON mijozlar ((lower(email)));", 1040, 450, { size: 13, fam: MONO, color: C.blue });

        srect(1040, 475, 700, 130, { fill: '#e6f7ff', stroke: C.blue });
        text("EXPLAIN FORMAT=TRADITIONAL ...", 1060, 505, { size: 14, fam: MONO, color: C.ink });
        text("type: ref | key: m_email_lower | rows: 1 | filtered: 100%", 1060, 535, { size: 14, weight: 700, fam: MONO, color: C.blue });
        text("Extra: NULL (B-tree qidiruv to'liq ishladi)", 1060, 565, { size: 14, fam: MONO, color: C.green });

        text("• MySQL da ifoda indeksi ikkita qavs ichida beriladi.", 1040, 640, { size: 16, color: C.ink, fam: UI });
        text("• Faqat _bin (binary) yoki case-sensitive kollatsiyalarda kerak.", 1040, 670, { size: 16, color: C.ink, fam: UI });
        text("• Qolgan hollarda oddiy indeksning o'zi yetarli.", 1040, 700, { size: 16, color: C.soft, fam: UI });

        pill("MySQL funksional kalit qismi: ((ifoda)) sintaksisi", 1390, 780, C.blue, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Eslatma: MySQL da lower() yozishdan oldin kollatsiyani tekshiring!", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Keraksiz lower() qo'yish oddiy indeksni to'xtatib qo'yishi mumkin.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. MYSQL_IMPLICIT_CONVERSION_OGOHLANTIRISH (16.17 -> 34.22s)
  function sMysqlImplicit(t) {
    heading("2. MYSQL: YASHIRIN SKANERLASH VA WARNING 1739", "Matn ustuniga son berilganda xato bermaydi, lekin 2400x sekinlashadi", t, TM.scenes.mysql_implicit_conversion_ogohlantirish);

    const kBox = P(t, 17.0, 0.8);
    withA(kBox, () => {
      // Chap: Warning 1739
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. Warning 1739: Indeks Qidiruvi To'xtadi", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE telefon = 998900000500;", 180, 350, { size: 13, fam: MONO, color: C.ink });

      srect(180, 380, 700, 160, { fill: '#fff2f0', stroke: C.red });
      text("SHOW WARNINGS;", 200, 410, { size: 14, weight: 700, fam: MONO, color: C.orange });
      text("Warning 1739: Cannot use ref access on index 'm_telefon'", 200, 440, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("due to type or collation conversion on field 'telefon'", 200, 470, { size: 13, fam: MONO, color: C.ink });
      text("Covering index scan: rows=100000, Actual Time: 9.81 ms!", 200, 500, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("Taqqoslash:", 180, 570, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Qo'shtirnoqsiz (raqam): 100 000 qator skan, 9.81 ms.", 180, 605, { size: 16, color: C.red, fam: UI, weight: 700 });
      text("• Qo'shtirnoq bilan (string): 1 qator lookup, 0.004 ms!", 180, 635, { size: 16, color: C.green, fam: UI, weight: 700 });
      text("• Farq: 2400 baravardan ko'proq sekinlashuv!", 180, 665, { size: 16, color: C.ink, fam: UI });

      pill("MySQL xato bermaydi, lekin so'rovni 2400x sekinlashtiradi", 530, 755, C.red, kBox, 15);
    });

    const kMerge = P(t, 26.5, 0.8);
    withA(kMerge, () => {
      // O'ng: Index Merge va COUNT(*)
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kMerge });
      text("2. Index Merge va COUNT(*) Mexanizmi", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("OR sharti: EXPLAIN FORMAT=TRADITIONAL ...", 1060, 370, { size: 13, fam: MONO, color: C.ink });
      text("type: index_merge | key: m_email,m_telefon", 1060, 400, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("Extra: Using union(m_email,m_telefon); Using where", 1060, 430, { size: 13, weight: 700, fam: MONO, color: C.blue });
      text("Har ikkala indeks birlashtirildi (rows: 2).", 1060, 460, { size: 14, fam: UI, color: C.green });

      srect(1040, 515, 700, 140, { fill: '#fffbe6', stroke: C.orange });
      text("COUNT(*) — Eng kichik ikkilamchi indeks tanlanadi:", 1060, 545, { size: 15, weight: 700, fam: UI, color: C.orange });
      text("• m_sana: key_len = 3 bayt (eng ixcham)", 1060, 575, { size: 14, fam: MONO, color: C.ink });
      text("• m_email: key_len = 402 bayt (katta)", 1060, 605, { size: 14, fam: MONO, color: C.soft });
      text("InnoDB doim eng kichik indeksni o'qib chiqadi.", 1060, 630, { size: 14, fam: UI, color: C.ink });

      pill("MySQL OR uchun Using union, COUNT uchun kichik indeksni tanlaydi", 1390, 755, C.green, kMerge, 15);
    });

    const kBot = P(t, 30.5, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Diqqat: SHOW WARNINGS buyrug'ini tekshirishni odat qiling!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Aks holda ilovadagi bitta noto'g'ri tip bazada millionlab qatorlarni behuda skan qiladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. SQLITE_TYPE_AFFINITY_MOJIZASI (34.22 -> 51.12s)
  function sSqliteAffinity(t) {
    heading("3. SQLITE: TYPE AFFINITY VA MULTI-INDEX OR", "SQLite'da qanday qilib raqam berilsa ham indeks ishlaydi?", t, TM.scenes.sqlite_type_affinity_mojizasi);

    const kBox = P(t, 35.0, 0.8);
    withA(kBox, () => {
      // Chap: TEXT affinity
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kBox });
      text("1. Type Affinity: Son Matnga Aylanadi", 180, 290, { size: 22, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("EXPLAIN QUERY PLAN SELECT id FROM mijozlar", 180, 350, { size: 13, fam: MONO, color: C.ink });
      text("WHERE telefon = 998900000500;", 180, 375, { size: 13, fam: MONO, color: C.ink });

      srect(180, 405, 700, 140, { fill: '#faf5ff', stroke: C.purple });
      text("QUERY PLAN", 200, 435, { size: 14, weight: 700, fam: MONO, color: C.purple });
      text("`--SEARCH mijozlar USING INDEX m_telefon (telefon=?)", 200, 465, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("Natija: SEARCH — indeksda qidiruv to'liq ishladi!", 200, 505, { size: 15, weight: 700, fam: UI, color: C.green });

      text("Nima uchun indeks ishlaydi?", 180, 570, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• telefon ustuni TEXT moyilligiga ega.", 180, 605, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• O'ng tarafdagi son literalining esa turi yo'q.", 180, 635, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Qoida: solishtirishdan oldin son matnga aylantiriladi!", 180, 665, { size: 16, weight: 700, color: C.purple, fam: UI, wrap: 700 });

      pill("SQLite moyilligi: son satrga aylanib indeksli qidiruv saqlanadi", 530, 755, C.purple, kBox, 15);
    });

    const kOr = P(t, 43.0, 0.8);
    withA(kOr, () => {
      // O'ng: MULTI-INDEX OR
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kOr });
      text("2. MULTI-INDEX OR va COVERING INDEX", 1040, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#e6f7ff', stroke: C.blue });
      text("QUERY PLAN", 1060, 370, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("`--MULTI-INDEX OR", 1060, 400, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("   |--INDEX 1: SEARCH mijozlar USING INDEX m_email", 1060, 430, { size: 13, fam: MONO, color: C.ink });
      text("   `--INDEX 2: SEARCH mijozlar USING INDEX m_telefon", 1060, 460, { size: 13, fam: MONO, color: C.ink });

      srect(1040, 515, 700, 140, { fill: '#f6ffed', stroke: C.green });
      text("COUNT(*) — COVERING INDEX:", 1060, 545, { size: 15, weight: 700, fam: UI, color: C.green });
      text("`--SCAN mijozlar USING COVERING INDEX m_email_lower", 1060, 575, { size: 13, fam: MONO, color: C.ink });
      text("SQLite ham butun indeksni boshidan oxirigacha sanaydi.", 1060, 610, { size: 15, fam: UI, color: C.ink, wrap: 660 });

      pill("SQLite da OR shartlari MULTI-INDEX OR ga aylanadi", 1390, 755, C.blue, kOr, 15);
    });

    const kBot = P(t, 47.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Muhim: MULTI-INDEX OR ishlashi uchun har bir qismda indeks bo'lishi shart!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Aks holda SQLite butun jadvalni to'liq skan (SCAN TABLE) qiladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. UCH_TIZIM_TAQQOSLASH_JADVALI (51.12 -> 71.98s)
  function sTaqqosTaxtasi(t) {
    heading("4. UCH TIZIM TAQQOSLASH JADVALI VA XULOSA", "PostgreSQL, MySQL va SQLite taqqoslash xulosasi", t, TM.scenes.uch_tizim_taqqoslash_jadvali);

    const kTable = P(t, 52.0, 0.8);
    withA(kTable, () => {
      card(140, 240, 1640, 570, { fill: C.card, col: C.blue, p: kTable });
      text("Uch Ma'lumotlar Bazasi Taqqosi", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      const cols = [
        { label: "Holat / Xususiyat", w: 320, align: 'left' },
        { label: "PostgreSQL 18", w: 420, align: 'left' },
        { label: "MySQL 9", w: 450, align: 'left' },
        { label: "SQLite 3", w: 390, align: 'left' }
      ];
      const rows = [
        ["Ifoda indeksi", "CREATE INDEX (lower(email))", "CREATE INDEX ((lower(email)))", "CREATE INDEX (lower(email))"],
        ["Registrga befarq", "lower() + Ifoda indeksi", "Standart _ci kollatsiya (tayyor)", "lower() + Ifoda indeksi"],
        ["text = raqam", "Xato: operator does not exist", "Warning 1739 + 100k to'liq skan", "TEXT affinity: indeksli SEARCH"],
        ["OR turli ustunlarda", "BitmapOr (Bitlar xaritasi)", "index_merge (Using union)", "MULTI-INDEX OR"],
        ["COUNT(*) usuli", "Butun jadval yoki indeks skan", "Eng kichik ikkilamchi indeks", "Butun indeks skan (SCAN)"],
        ["Tezkor taxmin", "pg_class.reltuples (0.001 ms)", "SHOW TABLE STATUS", "—"]
      ];

      // Jadval chizish
      const startX = 180, startY = 340, rowH = 40;
      srect(startX, startY, 1560, 35, { fill: '#f0f5ff', stroke: C.blue });
      cols.reduce((x, c) => {
        text(c.label, x + 10, startY + 23, { size: 16, weight: 700, fam: UI, color: C.blue });
        return x + c.w;
      }, startX);

      rows.forEach((r, i) => {
        const y = startY + 35 + i * 36;
        if (i % 2 === 1) srect(startX, y, 1560, 36, { fill: '#fafafa', stroke: 'transparent' });
        sline(startX, y + 36, startX + 1560, y + 36, { col: '#e8e8e8', w: 1 });
        let curX = startX;
        r.forEach((cell, j) => {
          const colColor = j === 0 ? C.ink : j === 1 ? C.blue : j === 2 ? C.orange : C.purple;
          const weight = (j === 2 && i === 2) || (j === 1 && i === 2) ? 700 : 500;
          text(cell, curX + 10, y + 24, { size: 14, weight, fam: j === 0 ? UI : MONO, color: colColor });
          curX += cols[j].w;
        });
      });

      pill("Postgres qat'iy nazoratda, MySQL qulaylikda, SQLite moslashuvchanlikda ajraladi", 960, 770, C.blue, kTable, 16);
    });

    const kFinal = P(t, 61.0, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Oltin qoidalar: Ustunni funksiyasiz qoldiring, turlarni moslang va jadvallarni ANALYZE qiling!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Shunda ma'lumotlar bazangiz qaysi dialekt bo'lishidan qat'i nazar eng yuqori tezlikda ishlaydi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.mysql_collation_va_functional_keys.e) {
      sMysqlCollation(t);
    } else if (t < TM.scenes.mysql_implicit_conversion_ogohlantirish.e) {
      sMysqlImplicit(t);
    } else if (t < TM.scenes.sqlite_type_affinity_mojizasi.e) {
      sSqliteAffinity(t);
    } else {
      sTaqqosTaxtasi(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
