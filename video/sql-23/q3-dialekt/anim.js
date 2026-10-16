// SQL 23-bob 3-qism: "Dialektlar" — MySQL va SQLite da Filtrlash Farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("23-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Filtrlash Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Registr sezgirligi, <=> operatori, ASCII vs Unicode va GLOB", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 380, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• LIKE registrga sezgir", 170, 560, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• ILIKE registrga sezgir emas", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• IS DISTINCT FROM mavjud", 170, 655, { size: 19, color: C.green, fam: UI });
      text("• BETWEEN SYMMETRIC bor", 170, 700, { size: 19, color: C.blue, fam: UI });
      text("• Sukut bo'yicha escape: \\", 170, 745, { size: 19, color: C.soft, fam: UI });
      text("• POSIX Regex (~, ~*)", 170, 790, { size: 19, color: C.purple, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• LIKE sukut bo'yicha registrga qaramaydi", 710, 560, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• IS DISTINCT FROM yo'q (ERROR 1064)", 710, 610, { size: 19, color: C.red, fam: UI });
      text("• NULL-xavfsiz tenglik: <=>", 710, 655, { size: 19, color: C.green, fam: UI });
      text("• BETWEEN SYMMETRIC yo'q", 710, 700, { size: 19, color: C.red, fam: UI });
      text("• Sukut bo'yicha escape: \\", 710, 745, { size: 19, color: C.soft, fam: UI });
      text("• REGEXP operatori mavjud", 710, 790, { size: 19, color: C.purple, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• LIKE faqat ASCII uchun sezgir emas", 1290, 560, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• Unicode da esa sezgir! (Tuzoq)", 1290, 610, { size: 19, color: C.red, fam: UI });
      text("• IS NOT operatori bor (NULL-xavfsiz)", 1290, 655, { size: 19, color: C.green, fam: UI });
      text("• Escape belgisi sukut bo'yicha YO'Q!", 1290, 700, { size: 19, color: C.red, fam: UI });
      text("• GLOB: fayl namunalari uslubi (*, ?)", 1290, 745, { size: 19, color: C.blue, fam: UI });
      text("• REGEXP kutubxonada sukut bo'yicha yo'q", 1290, 790, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL LIKE & <=>
  function sMysqlLikeNullsafe(t) {
    heading("MySQL: LIKE Registri va NULL-Xavfsiz <=> Operator", t, TM.scenes.mysql_like_nullsafe.s);

    const k1 = P(t, W('L2', 'layk'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("1. LIKE Registrga Qaramaydi", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 150, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- MySQL da oddiy LIKE ham 'Ali' va 'aliya' ni topadi:", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT id, ism FROM mijozlar", 170, 385, { size: 19, color: C.ink, fam: MONO });
      text("WHERE ism LIKE 'ali%'; -- Collation sababli!", 170, 420, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("Nega bunday? Collation kuchi:", 140, 500, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("MySQL sukut bo'yicha utf8mb4_0900_ai_ci collation ishlatadi.", 140, 545, { size: 18, color: C.soft, fam: UI });
      text("'_ci' — case-insensitive (katta-kichik harf farqsiz) demakdir.", 140, 580, { size: 18, color: C.soft, fam: UI });

      card(140, 630, 760, 180, { fill: '#fff1f2', col: C.red, p: k1 });
      pill("2. IS DISTINCT FROM Yo'q!", 520, 665, C.red, k1, 18);
      text("WHERE shahar IS DISTINCT FROM 'Toshkent';", 170, 715, { size: 18, color: C.ink, fam: MONO });
      text("--> ERROR 1064 (42000): Syntax error near 'DISTINCT'", 170, 755, { size: 17, weight: 700, color: C.red, fam: MONO });

      text("O'rniga: NOT (shahar <=> 'Toshkent') yoziladi!", 140, 850, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L2', 'tenglik'), 0.5);
    withA(k2, () => {
      const termOut = [
        "mysql> SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%';",
        "+----+-------+",
        "| id | ism   |",
        "+----+-------+",
        "|  1 | Ali   |",
        "|  2 | aliya |",
        "+----+-------+",
        "2 rows in set (0.00 sec) -- ILIKE shart emas!",
        "",
        "mysql> SELECT id, shahar FROM mijozlar",
        "    -> WHERE NOT (shahar <=> 'Toshkent');",
        "+----+-----------+",
        "| id | shahar    |",
        "+----+-----------+",
        "|  2 | Samarqand |",
        "|  4 | NULL      |",
        "|  5 | Buxoro    |",
        "+----+-----------+",
        "3 rows in set (0.00 sec) -- NULL shahar ham chiqdi!"
      ];
      term(980, 210, 840, 780, "MySQL 9.7.2 Terminali (Amaliy natija)", [{
        b: {
          cmd: "mysql -u dev -p qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 24 });
    });
  }

  // 3. SQLITE ASCII VS UNICODE
  function sSqliteAsciiUnicode(t) {
    heading("SQLite: LIKE va ASCII vs Unicode Tuzog'i", t, TM.scenes.sqlite_ascii_unicode.s);

    const k1 = P(t, W('L3', 'aski'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("SQLite ning Kutilmagan Xususiyati", 520, 260, C.purple, k1, 20);

      text("1. Oddiy ASCII harflari (A-Z, a-z):", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });
      card(140, 355, 760, 120, { fill: '#f5f3ff', col: C.purple, p: k1 });
      text("SELECT * FROM mijozlar WHERE ism LIKE 'ali%';", 170, 400, { size: 19, weight: 700, color: C.ink, fam: MONO });
      text("--> Ali va aliya ikkalasi ham chiqadi (ASCII tenglashdi).", 170, 440, { size: 16, color: C.green, fam: UI });

      text("2. Lekin UNICODE harflariga kelganda (Ö, Ä, æ, o'):", 140, 520, { size: 21, weight: 700, color: C.red, fam: UI });
      card(140, 560, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT * FROM mijozlar WHERE ism LIKE 'ölma%';", 170, 600, { size: 19, color: C.ink, fam: MONO });
      text("Agar bazada 'Ölma' bo'lsa -> TOPILMAYDI! (0 qator)", 170, 645, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("Sababi: SQLite sukut bo'yicha faqat ASCII registrini biladi!", 170, 685, { size: 16, color: C.soft, fam: UI });

      text("To'liq Unicode uchun nima kerak?", 140, 765, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• SQLite ga alohida ICU (Unicode) kengaytmasi o'rnatilishi shart.", 140, 810, { size: 18, color: C.soft, fam: UI });
      text("• PRAGMA case_sensitive_like = ON bilan to'liq sezgir qilish mumkin.", 140, 855, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L3', 'registrga'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.blue, p: k2 });
      pill("SQLite Sinovlari va GLOB", 1400, 260, C.blue, k2, 20);

      card(1020, 310, 760, 220, { fill: '#fff', col: C.purple, p: k2 });
      text("SQLite 3 Terminalida Sinov:", 1050, 350, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("sqlite> SELECT 'a' LIKE 'A';  --> 1 (Rost, ASCII)", 1050, 395, { size: 18, color: C.green, fam: MONO });
      text("sqlite> SELECT 'ölma' LIKE 'Ölma'; --> 0 (Yolg'on, Unicode!)", 1050, 440, { size: 18, color: C.red, fam: MONO });
      text("sqlite> SELECT 'æ' LIKE 'Æ';  --> 0 (Yolg'on, Unicode!)", 1050, 485, { size: 18, color: C.red, fam: MONO });

      card(1020, 560, 760, 380, { fill: '#fff', col: C.blue, p: k2 });
      pill("PRAGMA case_sensitive_like", 1400, 600, C.blue, k2, 18);
      text("sqlite> PRAGMA case_sensitive_like = ON;", 1050, 650, { size: 18, color: C.blue, fam: MONO });
      text("sqlite> SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%';", 1050, 690, { size: 17, color: C.ink, fam: MONO });
      text("2|aliya", 1050, 730, { size: 18, color: C.green, fam: MONO });
      text("-- 'Ali' endi chiqmaydi, chunki registrga qattiq qaraydi!", 1050, 770, { size: 16, color: C.soft, fam: UI });

      text("Xulosa: SQLite dagi bu farqni bilmaslik qidiruvda", 1050, 830, { size: 18, weight: 700, color: C.red, fam: UI });
      text("o'zbekcha so'zlarni topilmay qolishiga olib kelishi mumkin.", 1050, 865, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 4. SQLITE GLOB & ESCAPE
  function sSqliteGlobEscape(t) {
    heading("SQLite: GLOB va Sukut Bo'yicha ESCAPE Yo'qligi", t, TM.scenes.sqlite_glob_escape.s);

    const k1 = P(t, W('L4', 'chiziq'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("Tuzoq: SQLite da \\ Escape Emas!", 520, 260, C.red, k1, 20);

      text("PostgreSQL va MySQL da teskari chiziq (\\) doim escape:", 140, 320, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("'%\\_%' yozilsa, ostki chiziq belgisi qidiriladi.", 140, 360, { size: 18, color: C.soft, fam: UI });

      card(140, 400, 760, 200, { fill: '#fff1f2', col: C.red, p: k1 });
      text("Lekin SQLite da bunday emas:", 170, 440, { size: 19, weight: 700, color: C.red, fam: UI });
      text("sqlite> SELECT 'Sobir_2' LIKE '%\\_%';", 170, 485, { size: 19, color: C.ink, fam: MONO });
      text("--> Natija: 0 (Topilmadi!)", 170, 525, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("Chunki SQLite \\ belgisini oddiy harf deb tushunadi!", 170, 565, { size: 17, color: C.soft, fam: UI });

      card(140, 630, 760, 210, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("SQLite dagi To'g'ri Yechim: Aniq ESCAPE", 520, 665, C.green, k1, 18);
      text("sqlite> SELECT 'Sobir_2' LIKE '%!_%' ESCAPE '!';", 170, 715, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("--> Natija: 1 (Topildi! ✅)", 170, 760, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("SQLite da doimo qaysi belgi escape ekanini ko'rsatish shart.", 170, 805, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'glob'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: C.card, col: C.blue, p: k2 });
      pill("GLOB: Unix Fayl Namunalari Uslubi", 1400, 260, C.blue, k2, 20);

      text("GLOB operatori SQLite ga xos Unix uslubidagi qidiruv:", 1020, 320, { size: 20, weight: 700, color: C.ink, fam: UI });

      card(1020, 360, 760, 220, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("• *  --> Istalgan uzunlikdagi belgilar (LIKE dagi % kabi)", 1050, 405, { size: 18, color: C.blue, fam: MONO });
      text("• ?  --> Aniq 1 ta belgi (LIKE dagi _ kabi)", 1050, 445, { size: 18, color: C.blue, fam: MONO });
      text("• [a-z] --> Belgilar to'plami yoki oralig'i", 1050, 485, { size: 18, color: C.blue, fam: MONO });
      text("• GLOB har doim registrga SEZGIRDIR! (Case-sensitive)", 1050, 535, { size: 18, weight: 700, color: C.purple, fam: UI });

      card(1020, 610, 760, 250, { fill: '#fff', col: C.blue, p: k2 });
      text("SQLite 3 Terminali:", 1050, 650, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("sqlite> SELECT id, ism FROM mijozlar WHERE ism GLOB 'A*';", 1050, 695, { size: 17, color: C.ink, fam: MONO });
      text("1|Ali", 1050, 735, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("-- 'aliya' esa KICHIK 'a' bilan bo'lgani uchun chiqmaydi!", 1050, 775, { size: 16, color: C.soft, fam: UI });
      text("sqlite> SELECT 'fayl.txt' GLOB '*.txt'; --> 1 (Rost)", 1050, 820, { size: 17, color: C.green, fam: MONO });
    });
  }

  // 5. SQLITE IS NOT VA REGEXP
  function sSqliteIsNot(t) {
    heading("SQLite: IS NOT va REGEXP Haqiqati", t, TM.scenes.sqlite_is_not.s);

    const k1 = P(t, W('L5', 'not'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("1. IS NOT: Qulay va NULL-Xavfsiz", 520, 260, C.green, k1, 20);

      text("SQLite da ikkita ajoyib sintaksis bor:", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(140, 365, 760, 160, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- Standart usul:", 170, 405, { size: 17, color: C.soft, fam: MONO });
      text("WHERE shahar IS DISTINCT FROM 'Toshkent';", 170, 440, { size: 19, color: C.ink, fam: MONO });
      text("-- SQLite ning qisqa muqobili:", 170, 480, { size: 17, color: C.soft, fam: MONO });
      text("WHERE shahar IS NOT 'Toshkent'; -- 100% bir xil!", 170, 515, { size: 20, weight: 700, color: C.green, fam: MONO });

      card(140, 560, 760, 280, { fill: '#fff', col: C.green, p: k1 });
      text("SQLite Terminal Natijasi:", 170, 600, { size: 19, weight: 700, color: C.green, fam: UI });
      text("╭────┬─────────┬───────────╮", 170, 640, { size: 17, color: C.soft, fam: MONO });
      text("│ id │   ism   │  shahar   │", 170, 670, { size: 17, color: C.ink, fam: MONO });
      text("╞════╪═════════╪═══════════╡", 170, 700, { size: 17, color: C.soft, fam: MONO });
      text("│  2 │ aliya   │ Samarqand │", 170, 730, { size: 17, color: C.ink, fam: MONO });
      text("│  4 │ Sobir_2 │           │  <-- NULL shahar ham chiqdi!", 170, 760, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("│  5 │ Dilnoza │ Buxoro    │", 170, 790, { size: 17, color: C.ink, fam: MONO });
      text("╰────┴─────────┴───────────╯", 170, 820, { size: 17, color: C.soft, fam: MONO });
    });

    const k2 = P(t, W('L5', 'reg-eks'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("2. REGEXP Operatorining Sirlari", 1400, 260, C.purple, k2, 20);

      text("Nega REGEXP ba'zan ishlaydi, ba'zan xato beradi?", 1020, 320, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1020, 365, 760, 200, { fill: '#fff', col: C.purple, p: k2 });
      text("• SQLite arxitekturasida: x REGEXP y  ifodasi", 1050, 405, { size: 18, color: C.ink, fam: UI });
      text("  aslida regexp(y, x) funksiyasini chaqiradi.", 1050, 445, { size: 18, color: C.purple, fam: MONO });
      text("• Standart SQLite C-kutubxonasida bu funksiya YO'Q!", 1050, 495, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Dasturchi (Node.js, Python, Go) uni o'zi ulashi kerak.", 1050, 535, { size: 18, color: C.soft, fam: UI });

      card(1020, 595, 760, 240, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("Lekin sqlite3 CLI (terminalida):", 1050, 635, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("sqlite> SELECT id FROM mijozlar WHERE telefon REGEXP '^\\+998';", 1050, 680, { size: 16, color: C.ink, fam: MONO });
      text("1", 1050, 720, { size: 17, color: C.green, fam: MONO });
      text("2", 1050, 745, { size: 17, color: C.green, fam: MONO });
      text("-- CLI dasturiga regex kengaytmasi oldindan kiritilgan!", 1050, 785, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Filtrlashda Tizimlararo Qiyosiy Jadval", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Doimo'), 0.5);
    withA(k1, () => {
      // Comparison Table
      const x0 = 120, y0 = 210, w = 1680, h = 480;
      card(x0, y0, w, h, { fill: C.card, col: C.blue, p: k1 });

      const cols = [
        { title: "Xususiyat / Qoida", x: 160, w: 460 },
        { title: "PostgreSQL 18", x: 640, w: 340 },
        { title: "MySQL 9", x: 1010, w: 340 },
        { title: "SQLite 3", x: 1380, w: 380 }
      ];

      ctx.save();
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x0 + 10, y0 + 10, w - 20, 60);
      ctx.restore();

      cols.forEach(c => {
        text(c.title, c.x, y0 + 48, { size: 22, weight: 700, color: C.ink, fam: UI });
      });

      const rows = [
        ["LIKE katta-kichik harf", "Sezgir (case-sensitive)", "Sezgir emas (Collation)", "Faqat ASCII sezgir emas"],
        ["Katta-kichiksiz qidiruv", "✅ ILIKE kengaytmasi", "✅ Sukut bo'yicha shunday", "PRAGMA yoki ICU kengaytmasi"],
        ["NULL-xavfsiz tengsizlik", "✅ IS DISTINCT FROM", "✅ NOT (a <=> b)", "✅ IS NOT yoki IS DISTINCT FROM"],
        ["BETWEEN SYMMETRIC", "✅ Mavjud (juda qulay)", "❌ Yo'q (LEAST/GREATEST)", "❌ Mavjud emas"],
        ["Sukut bo'yicha escape", "✅ '\\' (teskari chiziq)", "✅ '\\' (teskari chiziq)", "❌ Yo'q (ESCAPE shart)"],
        ["Unix uslubida GLOB", "❌ Yo'q", "❌ Yo'q", "✅ GLOB mavjud (*, ?)"]
      ];

      rows.forEach((r, idx) => {
        const ry = y0 + 120 + idx * 56;
        sline(x0 + 20, ry - 18, x0 + w - 20, ry - 18, { col: C.rule, p: k1 });
        text(r[0], cols[0].x, ry + 10, { size: 19, weight: 700, color: C.ink, fam: UI });
        text(r[1], cols[1].x, ry + 10, { size: 18, color: r[1].startsWith('✅') ? C.green : C.soft, fam: UI });
        text(r[2], cols[2].x, ry + 10, { size: 18, color: r[2].startsWith('✅') ? C.green : (r[2].startsWith('❌') ? C.red : C.soft), fam: UI });
        text(r[3], cols[3].x, ry + 10, { size: 18, color: r[3].startsWith('✅') ? C.purple : (r[3].startsWith('❌') ? C.red : C.soft), fam: UI });
      });
    });

    const k2 = P(t, W('L6', 'garovidir'), 0.5);
    withA(k2, () => {
      card(120, 720, 1680, 270, { fill: '#f8fafc', col: C.green, p: k2 });
      pill("UCHTA MUHIM XULOSA", 960, 765, C.green, k2, 22);

      card(160, 810, 500, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("1. NULL larni Unutmang", 190, 850, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("Tengsizlikda doimo IS DISTINCT", 190, 890, { size: 17, color: C.soft, fam: UI });
      text("FROM yoki <=> ni esda tuting.", 190, 920, { size: 17, color: C.soft, fam: UI });

      card(710, 810, 500, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. ESCAPE ni Aniq Ko'rsating", 740, 850, { size: 20, weight: 700, color: C.green, fam: UI });
      text("SQLite bilan ishlaganda ostki", 740, 890, { size: 17, color: C.soft, fam: UI });
      text("chiziqni doim ESCAPE bilan belgilang.", 740, 920, { size: 17, color: C.soft, fam: UI });

      card(1260, 810, 500, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("3. Portabel SQL Yozing", 1290, 850, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("Faqat bitta bazaga xos qoidaga", 1290, 890, { size: 17, color: C.soft, fam: UI });
      text("bog'lanmasdan, standartga mos yozing.", 1290, 920, { size: 17, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_like_nullsafe.s) sIntro(t);
    else if (t < S.sqlite_ascii_unicode.s) sMysqlLikeNullsafe(t);
    else if (t < S.sqlite_glob_escape.s) sSqliteAsciiUnicode(t);
    else if (t < S.sqlite_is_not.s) sSqliteGlobEscape(t);
    else if (t < S.xulosa.s) sSqliteIsNot(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.mysql_like_nullsafe.s + 3.0);
  };
})();
