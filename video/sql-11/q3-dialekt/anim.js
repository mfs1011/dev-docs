// SQL 11-bob 3-qism: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("11-bob: Dialektlar", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite Farqlari", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Kodlash, Collation va Baza Dasturchilarining 6 Ta Tuzog'i", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'kodlash'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL: To'liq UTF-8 & ICU", 440, 580, C.blue, kBadges, 22);
      pill("MySQL: utf8mb4 & _ai_ci Sukut", 960, 580, C.red, kBadges, 22);
      pill("SQLite: BINARY, NOCASE & ASCII", 1480, 580, C.purple, kBadges, 22);
    });

    const kDesc = P(t, W('L1', 'kollatsiyaning'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Har bir relyatsion ma'lumotlar bazasi matnlarni o'ziga xos tarzda saqlaydi va solishtiradi:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Bir xil SQL so'rovi va UNIQUE indeks turli tizimlarda butunlay farqli natija berishi mumkin.", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("Keling, MySQL va SQLite tizimlaridagi eng muhim amaliy tuzoqlarni birgalikda o'rganamiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. MYSQL: UTF8MB4 VS UTF8MB3
  function sMySQLUtf8(t) {
    heading("MySQL: utf8mb4 va Eskirgan utf8mb3 Xatosi", t, TM.scenes.mysql_utf8.s);

    const kTerm = P(t, TM.scenes.mysql_utf8.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "MySQL 9.7 CLI (Terminal)",
        prompt: "mysql> ",
        lines: [
          "-- MySQL da 'utf8' deb jadval ochamiz:",
          "CREATE TABLE xabarlar (",
          "  id INT PRIMARY KEY,",
          "  matn VARCHAR(100) CHARACTER SET utf8",
          ");",
          "",
          "-- Oddiy matn xatosiz yoziladi:",
          "INSERT INTO xabarlar VALUES (1, 'Salom!');",
          "",
          "-- Ammo emoji yozilsa nima bo'ladi?",
          "INSERT INTO xabarlar VALUES (2, 'Salom 😀');",
          "ERROR 1366 (HY000): Incorrect string value:",
          "'\\xF0\\x9F\\x98\\x80' for column 'matn' at row 1",
          "",
          "-- To'g'ri yechim: utf8mb4 ga o'girish:",
          "ALTER TABLE xabarlar CONVERT TO",
          "  CHARACTER SET utf8mb4;",
          "INSERT INTO xabarlar VALUES (3, 'Salom 😀 🚀 🇺🇿');",
          "Query OK, 1 row affected (0.01 sec)"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L2', 'oddiy'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.red, p: k1 });
      hand("MySQL dagi Tarixiy 'utf8' Tuzog'i", 1000, 275, { size: 28, color: C.red, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("MySQL da 'utf8' nomi aslida 'utf8mb3' ni anglatadi!", 1030, 355, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("• utf8mb3 bitta belgi uchun ko'pi bilan 3 bayt saqlaydi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• Emojilar (😀, 🚀, 🇺🇿) va yangi Unicode belgilari 4 bayt talab qiladi.", 1030, 430, { size: 19, color: C.ink, wrap: 720 });
      text("• Natija: ERROR 1366 xatosi yoki satr kesilib ketishi xavfi yuzaga keladi.", 1030, 475, { size: 19, weight: 700, color: C.red, wrap: 720 });
    });

    const k2 = P(t, W('L3', 'to‘liq'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.green, p: k2 });
      hand("Yechim: Doimo utf8mb4 Ishlatish Shart", 1000, 655, { size: 28, color: C.green, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("Zamonaviy loyihalarda yagona to'g'ri standart:", 1030, 735, { size: 21, weight: 700, color: C.green, wrap: 720 });
      text("• utf8mb4 to'liq 4 baytli Unicode standartini to'liq qo'llaydi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• MySQL 8.0+ versiyalarida standart kollatsiya: utf8mb4_0900_ai_ci.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• Har bir jadvalda CHARACTER SET utf8mb4 deb aniq ko'rsating!", 1030, 855, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });
  }

  // 3. MYSQL: CASE INSENSITIVITY AND UNIQUE
  function sMySQLCI(t) {
    heading("MySQL: Sukut Bo'yicha Katta-Kichik Harfga Sezgir Emas", t, TM.scenes.mysql_ci.s);

    const kTerm = P(t, TM.scenes.mysql_ci.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "MySQL 9.7 CLI (Kollatsiya va UNIQUE Testi)",
        prompt: "mysql> ",
        lines: [
          "-- MySQL da katta-kichik harf tengligi:",
          "SELECT 'Salom' = 'salom' AS katta_kichik,",
          "       'cafe' = 'café'   AS urgu;",
          "+--------------+------+",
          "| katta_kichik | urgu |",
          "+--------------+------+",
          "|            1 |    1 |",
          "+--------------+------+",
          "",
          "-- UNIQUE indeks bilan xavfli holat:",
          "CREATE TABLE foydalanuvchilar (",
          "  email VARCHAR(100) UNIQUE",
          ");",
          "INSERT INTO foydalanuvchilar VALUES ('Ali@Mail.uz');",
          "Query OK, 1 row affected (0.01 sec)",
          "",
          "-- Kichik harflar bilan kiritamiz:",
          "INSERT INTO foydalanuvchilar VALUES ('ali@mail.uz');",
          "ERROR 1062 (23000): Duplicate entry 'ali@mail.uz'",
          "for key 'foydalanuvchilar.email'"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L4', 'katta-kichik'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("Kollatsiyadagi '_ai_ci' Belgisi Ma'nosi", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("MySQL sukutdagi utf8mb4_0900_ai_ci kollatsiyasi:", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• ai = Accent Insensitive (urg'uga sezgir emas, 'e' = 'é')", 1030, 395, { size: 19, fam: MONO, color: C.ink, wrap: 720 });
      text("• ci = Case Insensitive (registrga sezgir emas, 'Salom' = 'salom')", 1030, 430, { size: 19, fam: MONO, color: C.ink, wrap: 720 });
      text("Postgres da esa sukut bo'yicha CS (Case-Sensitive): 'Salom' <> 'salom'!", 1030, 475, { size: 19, weight: 700, color: C.red, wrap: 720 });
    });

    const k2 = P(t, W('L5', 'elektron'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.purple, p: k2 });
      hand("UNIQUE Indeks va Qidiruv Oqibatlari", 1000, 655, { size: 28, color: C.purple, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("Amaliy tizimlarda e'tibor berish zarur bo'lgan jihatlar:", 1030, 735, { size: 21, weight: 700, color: C.purple, wrap: 720 });
      text("• UNIQUE (email): 'Ali@Mail.uz' bor bo'lsa, 'ali@mail.uz' rad etiladi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• WHERE login = 'admin' so'rovi 'Admin', 'ADMIN' larni ham topadi.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• Aniq registr kerak bo'lsa (tokenlar, parollar): utf8mb4_bin ishlating!", 1030, 855, { size: 19, weight: 700, color: C.purple, wrap: 720 });
    });
  }

  // 4. SQLITE: NOCASE AND ASCII UPPER()
  function sSQLiteNOCASE(t) {
    heading("SQLite: Faqat 3 Ta Kollatsiya va ASCII upper() Cheklovi", t, TM.scenes.sqlite_nocase.s);

    const kTerm = P(t, TM.scenes.sqlite_nocase.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "SQLite 3.54.0 CLI (Terminal)",
        prompt: "sqlite> ",
        lines: [
          "-- SQLite da kollatsiya tekshiruvi:",
          "SELECT 'a' = 'A' COLLATE NOCASE AS nocase_ascii,",
          "       'o‘' = 'O‘' COLLATE NOCASE AS nocase_unicode;",
          "┌──────────────┬────────────────┐",
          "│ nocase_ascii │ nocase_unicode │",
          "├──────────────┼────────────────┤",
          "│ 1            │ 0              │",
          "└──────────────┴────────────────┘",
          "",
          "-- upper() funksiyasining cheklovi:",
          "SELECT upper('salom')    AS ascii,",
          "       upper('ölma')     AS nemis,",
          "       upper('тошкент')  AS kirill;",
          "┌───────┬──────┬─────────┐",
          "│ ascii │ nemis│ kirill  │",
          "├───────┼──────┼─────────┤",
          "│ SALOM │ öLMA │ тошкент │",
          "└───────┴──────┴─────────┘",
          "-- Kirill va no-ASCII harflar o'zgarmadi!"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L6', 'ichki'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("SQLite dagi 3 Ta Ichki Kollatsiya", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("SQLite faqat 3 ta o'rnatilgan kollatsiyaga ega:", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("1. BINARY — sukut bo'yicha baytma-bayt memcmp (katta-kichikka sezgir).", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("2. NOCASE — faqat 26 ta lotin ASCII harflarini registrga sezmas qiladi.", 1030, 430, { size: 19, color: C.ink, wrap: 720 });
      text("3. RTRIM — satr oxiridagi bo'sh joylarni e'tiborsiz qoldiradi.", 1030, 475, { size: 19, color: C.ink, wrap: 720 });
    });

    const k2 = P(t, W('L7', 'faqat'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.red, p: k2 });
      hand("Katta Tuzoq: Unicode Harflarini Tanimaydi!", 1000, 655, { size: 28, color: C.red, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("SQLite ning NOCASE va upper() / lower() cheklovlari:", 1030, 735, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("• Faqat ASCII 127 gacha bo'lgan harflarni o'zgartiradi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• O'zbekcha 'o‘', Kirill va maxsus Unicode belgilarini kattalashtirmaydi.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• Yechim: Registrni backend ilovasida bajaring yoki ICU yuklang!", 1030, 855, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });
  }

  // 5. 6 PITFALLS GRID
  function sPitfalls(t) {
    heading("Baza Dasturchilari Uchun 6 Ta Amaliy Tuzoq", t, TM.scenes.pitfalls.s);

    const k = P(t, TM.scenes.pitfalls.s + 0.3, 0.8);
    const grid = [
      { col: 140, row: 220, color: C.red, num: "1", title: "MySQL: 'utf8' != To'liq UTF-8", body: "Oddiy 'utf8' aslida utf8mb3 bo'lib, 4 baytli emojilarni saqlay olmaydi. Har doim utf8mb4 tanlang!" },
      { col: 1000, row: 220, color: C.blue, num: "2", title: "MySQL: Kutilmagan '_ai_ci' Tengligi", body: "Parollar, API tokenlar va hash kodlarda sukutdagi 'ci' tufayli xatolar bo'lmasligi uchun utf8mb4_bin ishlating!" },
      { col: 140, row: 470, color: C.purple, num: "3", title: "SQLite: NOCASE Faqat ASCII da", body: "O'zbekcha, Kirill va no-ASCII harflarda NOCASE va upper() ishlamaydi. Registrni ilovada (backend) o'zgartiring!" },
      { col: 1000, row: 470, color: C.green, num: "4", title: "PostgreSQL: OS va Libc Yangilanishi", body: "OS yangilanganda libc kollatsiyasi o'zgarib indekslar buzilishi mumkin. Ishonchli yechim — ICU provayderi!" },
      { col: 140, row: 720, color: C.red, num: "5", title: "UNIQUE Indeks va Registr", body: "MySQL da 'admin' bor bo'lsa 'Admin' kiritib bo'lmaydi, Postgres da esa kiritiladi. Baza almashganda ehtiyot bo'ling!" },
      { col: 1000, row: 720, color: C.purple, num: "6", title: "ORDER BY Tartibi Har Xil", body: "C (bayt), en_US va uz-u-co-search kollatsiyalari har xil tartib beradi. O'zbek alifbosi uchun maxsus ICU kollatsiya shart!" }
    ];

    withA(k, () => {
      grid.forEach((item, idx) => {
        const ki = P(t, TM.scenes.pitfalls.s + 0.3 + idx * 0.2, 0.5);
        withA(ki, () => {
          card(item.col, item.row, 780, 220, { fill: C.card, col: item.color, p: ki });
          pill(item.num, item.col + 40, item.row + 45, item.color, ki, 20);
          text(item.title, item.col + 80, item.row + 45, { size: 23, weight: 700, color: item.color, wrap: 660 });
          text(item.body, item.col + 30, item.row + 115, { size: 20, color: C.ink, wrap: 720 });
        });
      });
    });
  }

  // 6. XULOSA VA TAVSIYALAR
  function sOutro(t) {
    heading("Xulosa: Tizimlar Bo'yicha Asosiy Tavsiyalar", t, TM.scenes.xulosa.s);

    const k = P(t, TM.scenes.xulosa.s + 0.3, 0.8);
    withA(k, () => {
      // 3 vertical cards
      card(140, 220, 500, 560, { fill: C.card, col: C.blue, p: k });
      hand("PostgreSQL", 170, 280, { size: 30, color: C.blue, p: k });
      card(170, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Sukut bo'yicha to'liq UTF-8 va CS.", 190, 350, { size: 19, weight: 700, color: C.blue, wrap: 400 });
      text("• O'zbek alifbosi uchun ICU:", 190, 395, { size: 18, color: C.ink, wrap: 400 });
      text("  COLLATE \"uz-u-co-search\"", 190, 430, { size: 17, fam: MONO, color: C.blue, wrap: 400 });
      text("• O‘, G‘, Ch, Sh harflari alifbo oxiriga to'g'ri saralanadi.", 190, 475, { size: 17, color: C.soft, wrap: 400 });
      text("• Indeks barqarorligi uchun libc o'rniga ICU dan foydalaning.", 190, 545, { size: 17, color: C.ink, wrap: 400 });

      card(710, 220, 500, 560, { fill: C.card, col: C.red, p: k });
      hand("MySQL", 740, 280, { size: 30, color: C.red, p: k });
      card(740, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Doimo CHARACTER SET utf8mb4.", 760, 350, { size: 19, weight: 700, color: C.red, wrap: 400 });
      text("• Sukutda: utf8mb4_0900_ai_ci.", 760, 395, { size: 18, fam: MONO, color: C.ink, wrap: 400 });
      text("• Registrga va urg'uga sezgir emas ('Salom' = 'salom').", 760, 440, { size: 17, color: C.soft, wrap: 400 });
      text("• UNIQUE indekslar registrni bir xil deb hisoblashini unutmang.", 760, 505, { size: 17, color: C.ink, wrap: 400 });
      text("• Parol va tokenlarda utf8mb4_bin dan foydalaning.", 760, 575, { size: 17, weight: 700, color: C.red, wrap: 400 });

      card(1280, 220, 500, 560, { fill: C.card, col: C.purple, p: k });
      hand("SQLite", 1310, 280, { size: 30, color: C.purple, p: k });
      card(1310, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Yengil, sodda va tezkor ichki UTF-8.", 1330, 350, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• Ichki 3 ta kollatsiya: BINARY, NOCASE, RTRIM.", 1330, 395, { size: 18, color: C.ink, wrap: 400 });
      text("• NOCASE va upper() faqat ASCII 26 ta lotin harfini taniydi.", 1330, 460, { size: 17, color: C.soft, wrap: 400 });
      text("• O'zbekcha va Kirill matnlarni ilova darajasida boshqaring.", 1330, 530, { size: 17, weight: 700, color: C.purple, wrap: 400 });

      // Bottom highlight banner
      const kBanner = P(t, W('L9', 'butunligi'), 0.6);
      withA(kBanner, () => {
        card(140, 810, 1640, 160, { fill: C.card, col: C.green, p: kBanner });
        text("To‘g‘ri sozlangan kodlash va kollatsiya matnlaringiz butunligi va qidiruv aniqligining asosidir.", 960, 895, { size: 27, weight: 700, align: 'center', color: C.green, wrap: 1560 });
      });
    });
  }

  function draw(t) {
    bg();
    const sc = TM.scenes;
    if (t < sc.mysql_utf8.s) sIntro(t);
    else if (t < sc.mysql_ci.s) sMySQLUtf8(t);
    else if (t < sc.sqlite_nocase.s) sMySQLCI(t);
    else if (t < sc.pitfalls.s) sSQLiteNOCASE(t);
    else if (t < sc.xulosa.s) sPitfalls(t);
    else sOutro(t);
  }

  function renderPoster() {
    bg();
    hand("11-bob: Dialektlar", 960, 160, { size: 48, align: 'center', p: 1, color: C.soft });
    hand("MySQL va SQLite Farqlari", 960, 245, { size: 74, align: 'center', p: 1, color: C.blue });
    hand("Kodlash, Collation va Baza Dasturchilarining 6 Ta Amaliy Tuzog'i", 960, 325, { size: 32, align: 'center', p: 1 });
    marker(400, 355, 1120, 14, C.hl, 1);

    pill("PostgreSQL: To'liq UTF-8 & ICU", 440, 430, C.blue, 1, 22);
    pill("MySQL: utf8mb4 & _ai_ci Sukut", 960, 430, C.red, 1, 22);
    pill("SQLite: BINARY, NOCASE & ASCII", 1480, 430, C.purple, 1, 22);

    const grid = [
      { col: 140, row: 490, color: C.red, num: "1", title: "MySQL: 'utf8' != To'liq UTF-8", body: "Oddiy 'utf8' aslida utf8mb3 bo'lib emojilarni saqlay olmaydi. Har doim utf8mb4 tanlang!" },
      { col: 1000, row: 490, color: C.blue, num: "2", title: "MySQL: Kutilmagan '_ai_ci' Tengligi", body: "Parol va tokenlarda sukutdagi 'ci' xato bermasligi uchun utf8mb4_bin ishlating!" },
      { col: 140, row: 660, color: C.purple, num: "3", title: "SQLite: NOCASE Faqat ASCII da", body: "O'zbekcha va Kirill harflarida NOCASE va upper() ishlamaydi. Registrni ilovada boshqaring!" },
      { col: 1000, row: 660, color: C.green, num: "4", title: "PostgreSQL: OS va Libc Yangilanishi", body: "OS yangilanganda indeks buzilmasligi uchun ishonchli ICU provayderidan foydalaning!" },
      { col: 140, row: 830, color: C.red, num: "5", title: "UNIQUE Indeks va Registr", body: "MySQL da 'admin' bor bo'lsa 'Admin' kiritib bo'lmaydi, Postgres da esa kiritiladi!" },
      { col: 1000, row: 830, color: C.purple, num: "6", title: "ORDER BY Tartibi Har Xil", body: "O'zbek alifbosi tartibi uchun maxsus ICU kollatsiyasi (uz-u-co-search) shart!" }
    ];
    grid.forEach((item) => {
      card(item.col, item.row, 780, 150, { fill: C.card, col: item.color, p: 1 });
      pill(item.num, item.col + 35, item.row + 38, item.color, 1, 18);
      text(item.title, item.col + 70, item.row + 38, { size: 21, weight: 700, color: item.color, wrap: 670 });
      text(item.body, item.col + 25, item.row + 90, { size: 18, color: C.ink, wrap: 730 });
    });
  }

  window.render = draw;
  window.renderFrame = draw;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;
})();
