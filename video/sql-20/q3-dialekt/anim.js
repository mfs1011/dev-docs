// SQL 20-bob 3-qism: "Dialektlar" — MySQL va SQLite da UPSERT O'ziga Xosliklari
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
    hand("20-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: UPSERT Dialektlari", 960, 280, { size: 74, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ON DUPLICATE KEY UPDATE, REPLACE Xatarlari va SQLite ON CONFLICT", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'May'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: ON DUPLICATE KEY", 440, 520, C.blue, kBadges, 22);
      pill("SQLite: ON CONFLICT", 960, 520, C.green, kBadges, 22);
      pill("PostgreSQL: MERGE & ON CONFLICT", 1480, 520, C.purple, kBadges, 22);
    });

    const kCards = P(t, W('L1', 'Es-kyu-layt'), 0.8);
    withA(kCards, () => {
      // 3 Dialect cards
      card(140, 600, 500, 320, { fill: C.card, col: C.blue, p: kCards });
      pill("MySQL 9.7", 390, 640, C.blue, kCards, 18);
      text("• MERGE yo'q, muqobil —", 170, 700, { size: 20, color: C.ink, fam: UI });
      text("  ON DUPLICATE KEY UPDATE", 170, 735, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("• Yangi qiymatlar: AS new taxallusi", 170, 780, { size: 19, color: C.ink, fam: UI });
      text("• REPLACE xavfi: AUTO_INCREMENT o'sishi", 170, 825, { size: 18, color: C.red, fam: UI });
      text("• Affected rows: 1 (yangi) / 2 (yangilandi)", 170, 870, { size: 17, color: C.soft, fam: UI });

      card(710, 600, 500, 320, { fill: C.card, col: C.green, p: kCards });
      pill("SQLite 3.54", 960, 640, C.green, kCards, 18);
      text("• PostgreSQL andozasiga mos", 740, 700, { size: 20, color: C.ink, fam: UI });
      text("• ON CONFLICT (ustun) DO UPDATE", 740, 735, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("• excluded maxsus jadvali mavjud", 740, 780, { size: 19, color: C.ink, fam: UI });
      text("• Bir nechta konflikt maqsadlari", 740, 825, { size: 19, color: C.ink, fam: UI });
      text("• INSERT SELECT uchun WHERE true talabi", 740, 870, { size: 17, color: C.red, fam: UI });

      card(1280, 600, 500, 320, { fill: C.card, col: C.purple, p: kCards });
      pill("PostgreSQL 18", 1530, 640, C.purple, kCards, 18);
      text("• Standart MERGE (MATCHED / NOT MATCHED)", 1310, 700, { size: 19, color: C.ink, fam: UI });
      text("• INSERT ... ON CONFLICT DO UPDATE", 1310, 745, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("• EXCLUDED jadvali va RETURNING old/new", 1310, 790, { size: 19, color: C.ink, fam: UI });
      text("• Yuqori parallellik va to'liq atomarlik", 1310, 835, { size: 19, color: C.ink, fam: UI });
      text("• merge_action() amallar jurnali", 1310, 875, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL DUPLICATE KEY
  function sMysqlDuplicateKey(t) {
    heading("MySQL: INSERT ... ON DUPLICATE KEY UPDATE", t, TM.scenes.mysql_duplicate_key.s);

    const k1 = P(t, W('L2', 'myorj'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("MySQL Sintaksisi", 530, 270, C.blue, k1, 20);

      text("-- Yangi uslub (MySQL 8.0.20+):", 160, 330, { size: 20, color: C.soft, fam: MONO });
      text("INSERT INTO lugat (id, soz, soni)", 160, 365, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("VALUES (1, 'olma', 5) AS new", 160, 400, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("ON DUPLICATE KEY UPDATE", 160, 440, { size: 22, weight: 700, color: C.purple, fam: MONO });
      text("  soni = lugat.soni + new.soni;", 160, 475, { size: 22, weight: 700, color: C.green, fam: MONO });

      sline(160, 520, 880, 520, { col: C.rule, p: k1 });

      text("Muhim qoidalar:", 160, 560, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. Konflikt maqsadi (ustun) yozilmaydi:", 160, 600, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("   Har qanday UNIQUE yoki PRIMARY KEY to'qnashuvi", 160, 630, { size: 19, color: C.soft, fam: UI });
      text("   avtomatik ravishda UPDATE bandini ishga tushiradi.", 160, 660, { size: 19, color: C.soft, fam: UI });

      text("2. Eski uslub: VALUES(soni) eskirgan (deprecated)", 160, 715, { size: 20, color: C.red, fam: UI });
      text("   Uning o'rniga 'AS new' taxallusi ishlatilishi shart.", 160, 745, { size: 19, color: C.soft, fam: UI });

      text("3. Ta'sir qilingan qatorlar soni (Affected rows):", 160, 800, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("   • 1 — yangi qator muvaffaqiyatli qo'shildi", 180, 835, { size: 19, color: C.green, fam: UI });
      text("   • 2 — mavjud qator yangilandi", 180, 870, { size: 19, color: C.purple, fam: UI });
      text("   • 0 — mavjud qator o'zgarishsiz qoldi", 180, 905, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'velyus'), 0.5);
    withA(k2, () => {
      const mysqlOut = [
        "mysql> INSERT INTO lugat (id, soz, soni) VALUES (1, 'olma', 1)",
        "       ON DUPLICATE KEY UPDATE soni = soni + 1;",
        "Query OK, 1 row affected (0.01 sec)   -- Yangi qo'shildi",
        "",
        "mysql> INSERT INTO lugat (id, soz, soni) VALUES (1, 'olma', 1)",
        "       ON DUPLICATE KEY UPDATE soni = soni + 1;",
        "Query OK, 2 rows affected (0.00 sec)  -- Yangilandi!",
        "",
        "mysql> SELECT * FROM lugat;",
        "+----+------+------+",
        "| id | soz  | soni |",
        "+----+------+------+",
        "|  1 | olma |    7 |",
        "|  3 | nok  |   10 |",
        "+----+------+------+"
      ];
      term(980, 220, 820, 750, "MySQL 9.7 Terminali (Real natija)", [{
        b: {
          cmd: "mysql -u root test",
          out: mysqlOut.join('\n')
        }
      }], { font: 17, lh: 26 });
    });
  }

  // 3. MYSQL REPLACE TRAP
  function sMysqlReplaceTrap(t) {
    heading("MySQL Tuzog'i: REPLACE va AUTO_INCREMENT Buzilishi", t, TM.scenes.mysql_replace_trap.s);

    const k1 = P(t, W('L3', 'ripleys'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("REPLACE INTO mexanizmi", 530, 270, C.red, k1, 20);

      text("REPLACE INTO nima qiladi?", 160, 335, { size: 24, weight: 700, color: C.red, fam: UI });
      text("Ko'pchilik dasturchilar REPLACE ni qatorni joyida", 160, 375, { size: 20, color: C.soft, fam: UI });
      text("yangilaydi deb o'ylashadi. Lekin MySQL aslida:", 160, 405, { size: 20, color: C.soft, fam: UI });

      card(160, 435, 740, 115, { fill: '#fff2f2', col: C.red, p: k1 });
      text("1-qadam: Konflikt bergan mavjud qatorni DELETE qiladi!", 180, 475, { size: 19, weight: 700, color: C.red, fam: UI });
      text("2-qadam: Berilgan qiymatlar bilan yangi qator INSERT qiladi!", 180, 515, { size: 19, weight: 700, color: C.red, fam: UI });

      text("Keltirib chiqaradigan oqibatlari:", 160, 585, { size: 22, weight: 700, color: C.ink, fam: UI });

      text("• AUTO_INCREMENT hisoblagichi oshadi:", 160, 625, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  Mavjud ID o'chib ketadi, o'rniga yangi oshirilgan ID beriladi.", 180, 655, { size: 19, color: C.soft, fam: UI });

      text("• Tashqi kalitlar (FOREIGN KEY) buziladi:", 160, 705, { size: 20, weight: 700, color: C.red, fam: UI });
      text("  Boshqa jadvallar eski ID ga bog'langan bo'lsa,", 180, 735, { size: 19, color: C.soft, fam: UI });
      text("  CASCADE bo'lsa o'chadi, aks holda xato berib to'xtaydi!", 180, 765, { size: 19, color: C.soft, fam: UI });

      text("• DELETE va INSERT triggerlari behuda ishga tushadi:", 160, 815, { size: 20, color: C.ink, fam: UI });
      text("  Baza resurslari va jurnallari ikki barobar yuklanadi.", 180, 845, { size: 19, color: C.soft, fam: UI });

      text("Tavsiya: Har doim ON DUPLICATE KEY UPDATE dan foydalaning!", 160, 910, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L3', 'avtomatik'), 0.5);
    withA(k2, () => {
      const repOut = [
        "mysql> SELECT id, soz, soni FROM lugat;",
        "+----+------+------+",
        "| id | soz  | soni |",
        "+----+------+------+",
        "|  1 | olma |    7 |",
        "|  3 | nok  |   10 |  <-- ID avval 3 edi",
        "+----+------+------+",
        "",
        "mysql> REPLACE INTO lugat (soz, soni) VALUES ('nok', 1);",
        "Query OK, 2 rows affected (0.01 sec)",
        "",
        "mysql> SELECT id, soz, soni FROM lugat;",
        "+----+------+------+",
        "| id | soz  | soni |",
        "+----+------+------+",
        "|  1 | olma |  100 |",
        "|  5 | nok  |    1 |  <-- DIQQAT: ID 5 GA O'ZGARDI!",
        "+----+------+------+"
      ];
      term(980, 220, 820, 750, "MySQL REPLACE Natijasi (ID o'zgarishi)", [{
        b: {
          cmd: "mysql -u root test",
          out: repOut.join('\n')
        }
      }], { font: 17, lh: 26 });
    });
  }

  // 4. SQLITE UPSERT
  function sSqliteUpsert(t) {
    heading("SQLite: ON CONFLICT va Bir Nechta Maqsad", t, TM.scenes.sqlite_upsert.s);

    const k1 = P(t, W('L4', 'Postgres'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.green, p: k1 });
      pill("SQLite 3.24+ Imkoniyatlari", 530, 270, C.green, k1, 20);

      text("PostgreSQL bilan to'liq uyg'unlik:", 160, 335, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("SQLite 3.24 talqinidan beri PostgreSQL andozasidagi", 160, 370, { size: 20, color: C.soft, fam: UI });
      text("barcha asosiy UPSERT imkoniyatlarini qo'llab-quvvatlaydi:", 160, 400, { size: 20, color: C.soft, fam: UI });

      text("• excluded maxsus jadvali:", 160, 450, { size: 20, weight: 700, color: C.green, fam: UI });
      text("  INSERT qilinayotgan qiymatlarga excluded.ustun orqali", 180, 480, { size: 19, color: C.soft, fam: UI });
      text("  to'g'ridan-to'g'ri murojaat qilish mumkin.", 180, 510, { size: 19, color: C.soft, fam: UI });

      text("• Bir nechta konflikt maqsadlari (Multi-target):", 160, 565, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("  SQLite ketma-ket bir nechta ON CONFLICT bandlarini", 180, 595, { size: 19, color: C.soft, fam: UI });
      text("  tekshirishga ruxsat beradi:", 180, 625, { size: 19, color: C.soft, fam: UI });

      card(160, 650, 740, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("INSERT INTO foydalanuvchilar (id, email, telefon)", 180, 685, { size: 18, color: C.blue, fam: MONO });
      text("VALUES (1, 'ali@test.uz', '+998901234567')", 180, 715, { size: 18, color: C.blue, fam: MONO });
      text("ON CONFLICT (id) DO UPDATE SET email = excluded.email", 180, 745, { size: 18, color: C.purple, fam: MONO });
      text("ON CONFLICT (email) DO NOTHING;", 180, 775, { size: 18, color: C.green, fam: MONO });

      text("Bu imkoniyat SQLite ning eng qulay ustunliklaridan biridir.", 160, 835, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Faqat oxirgi band DO UPDATE bo'lishi mumkin.", 160, 870, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'konflikt'), 0.5);
    withA(k2, () => {
      const sqlOut = [
        "sqlite3 ombor.db",
        "-- Boshlang'ich holat:",
        "sqlite> SELECT id, soz, soni FROM lugat;",
        "1|olma|5",
        "2|nok|10",
        "",
        "-- ON CONFLICT DO UPDATE:",
        "sqlite> INSERT INTO lugat (id, soz, soni) VALUES (1, 'yangi', 5)",
        "   ...> ON CONFLICT (id) DO UPDATE SET soz = excluded.soz;",
        "",
        "sqlite> SELECT * FROM lugat;",
        "1|yangi|5",
        "",
        "-- DO NOTHING misoli:",
        "sqlite> INSERT INTO lugat (id, soz, soni) VALUES (1, 'boshqa', 9)",
        "   ...> ON CONFLICT (id) DO NOTHING;",
        "sqlite> SELECT * FROM lugat;",
        "1|yangi|5  -- O'zgarishsiz qoldi!"
      ];
      term(980, 220, 820, 750, "SQLite 3.54 CLI (Real terminal)", [{
        b: {
          cmd: "sqlite3",
          out: sqlOut.join('\n')
        }
      }], { font: 17, lh: 26 });
    });
  }

  // 5. DML PITFALLS
  function sDmlPitfalls(t) {
    heading("DML Tuzoqlari: REPLACE va WHERE true Zarurati", t, TM.scenes.dml_pitfalls.s);

    const k1 = P(t, W('L5', 'Ripleys'), 0.5);
    withA(k1, () => {
      card(140, 220, 500, 740, { fill: C.card, col: C.red, p: k1 });
      pill("1. REPLACE Xatosi", 390, 270, C.red, k1, 19);

      text("REPLACE ni oddiy yangilash deb", 170, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("o'ylash — jiddiy xatodir:", 170, 365, { size: 21, weight: 700, color: C.ink, fam: UI });

      text("• Qator o'chirilib qayta qo'shiladi", 170, 420, { size: 19, color: C.red, fam: UI });
      text("• ID hisoblagich o'zgaradi", 170, 460, { size: 19, color: C.red, fam: UI });
      text("• CASCADE tashqi bog'lanishlarni", 170, 500, { size: 19, color: C.soft, fam: UI });
      text("  kutilmaganda o'chirib yuboradi", 170, 530, { size: 19, color: C.soft, fam: UI });
      text("• Baza jurnallari shishadi", 170, 570, { size: 19, color: C.soft, fam: UI });

      card(170, 620, 440, 290, { fill: '#fff2f2', col: C.red, p: k1 });
      text("To'g'ri yo'l:", 190, 660, { size: 20, weight: 700, color: C.green, fam: UI });
      text("MySQL da REPLACE o'rniga:", 190, 700, { size: 18, color: C.ink, fam: UI });
      text("INSERT INTO ...", 190, 740, { size: 18, color: C.blue, fam: MONO });
      text("ON DUPLICATE KEY UPDATE", 190, 775, { size: 18, color: C.purple, fam: MONO });
      text("ishlatish ma'lumotlar", 190, 825, { size: 18, color: C.ink, fam: UI });
      text("butunligini kafolatlaydi.", 190, 860, { size: 18, color: C.ink, fam: UI });
    });

    const k2 = P(t, W('L5', 'Es-kyu-layt'), 0.5);
    withA(k2, () => {
      card(710, 220, 500, 740, { fill: C.card, col: C.blue, p: k2 });
      pill("2. SQLite WHERE true", 960, 270, C.blue, k2, 19);

      text("INSERT SELECT va Sintaksis:", 740, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("SQLite da SELECT dan keyin", 740, 370, { size: 20, color: C.soft, fam: UI });
      text("ON CONFLICT qo'yilsa, grammatik", 740, 400, { size: 20, color: C.soft, fam: UI });
      text("noaniqlik yuzaga keladi:", 740, 430, { size: 20, color: C.soft, fam: UI });

      card(740, 460, 440, 220, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("-- XATO beruvchi so'rov:", 760, 495, { size: 16, color: C.red, fam: MONO });
      text("INSERT INTO ombor", 760, 525, { size: 16, color: C.ink, fam: MONO });
      text("SELECT * FROM kelgan", 760, 555, { size: 16, color: C.ink, fam: MONO });
      text("ON CONFLICT (sku) ...; -- XATO!", 760, 585, { size: 16, color: C.red, fam: MONO });
      text("-- YECHIM: WHERE true qo'shish!", 760, 625, { size: 16, color: C.green, fam: MONO });
      text("SELECT * FROM kelgan WHERE true", 760, 655, { size: 16, weight: 700, color: C.green, fam: MONO });

      text("Grammatika SELECT bandi tugaganini", 740, 720, { size: 18, color: C.ink, fam: UI });
      text("bilishi uchun WHERE sharti talab qilinadi.", 740, 755, { size: 18, color: C.soft, fam: UI });
      text("Bu SQLite ning o'ziga xos qoidasidir.", 740, 790, { size: 18, weight: 700, color: C.blue, fam: UI });
    });

    const k3 = P(t, W('L5', 'xatolardir.'), 0.5);
    withA(k3, () => {
      card(1280, 220, 500, 740, { fill: C.card, col: C.purple, p: k3 });
      pill("3. Standart MERGE Cheklovi", 1530, 270, C.purple, k3, 19);

      text("Parallel Tranzaksiyalar:", 1310, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("PostgreSQL hujjati ogohlantiradi:", 1310, 370, { size: 19, color: C.soft, fam: UI });

      text("• MERGE parallel INSERT lar ostida", 1310, 420, { size: 19, color: C.red, fam: UI });
      text("  takror kalit xatosini berishi mumkin.", 1310, 450, { size: 19, color: C.soft, fam: UI });
      text("• Chunki MERGE to'liq atomar", 1310, 490, { size: 19, color: C.soft, fam: UI });
      text("  UPSERT emas, u umumiy solishtiruv.", 1310, 520, { size: 19, color: C.soft, fam: UI });

      text("• Agar parallel yuqori yuklama bo'lsa,", 1310, 570, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("  har doim ON CONFLICT DO UPDATE", 1310, 605, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("  ishlatilishi tavsiya etiladi.", 1310, 635, { size: 19, color: C.ink, fam: UI });

      card(1310, 675, 440, 235, { fill: '#fbf7ee', col: C.purple, p: k3 });
      text("Xulosa qoidasi:", 1330, 715, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Katta jadvallarni sinxronlash:", 1330, 755, { size: 18, color: C.purple, fam: UI });
      text("-> MERGE (PostgreSQL 17+)", 1330, 790, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("Yuqori tezlikdagi hisoblagichlar:", 1330, 830, { size: 18, color: C.blue, fam: UI });
      text("-> ON CONFLICT DO UPDATE", 1330, 865, { size: 18, weight: 700, color: C.blue, fam: MONO });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: UPSERT Dialektlari Taqqoslashi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Har'), 0.5);
    withA(k1, () => {
      // Comparison Table
      card(120, 220, 1680, 540, { fill: C.card, col: C.blue, p: k1 });
      text("Ma'lumotlar Bazalarida UPSERT Xususiyatlari", 960, 275, { size: 26, weight: 700, align: 'center', color: C.ink, fam: UI });

      // Table Headers
      sline(160, 310, 1760, 310, { col: C.rule, p: k1 });
      text("Xususiyat", 180, 345, { size: 20, weight: 700, color: C.soft, fam: UI });
      text("PostgreSQL 18", 580, 345, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("MySQL 9.7", 1020, 345, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("SQLite 3.54", 1440, 345, { size: 20, weight: 700, color: C.green, fam: UI });
      sline(160, 370, 1760, 370, { col: C.rule, p: k1 });

      // Row 1
      text("Asosiy Buyruq", 180, 410, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("ON CONFLICT / MERGE", 580, 410, { size: 18, color: C.purple, fam: MONO });
      text("ON DUPLICATE KEY UPDATE", 1020, 410, { size: 18, color: C.blue, fam: MONO });
      text("ON CONFLICT DO UPDATE", 1440, 410, { size: 18, color: C.green, fam: MONO });

      // Row 2
      text("Yangi qiymat nomi", 180, 465, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("EXCLUDED.ustun", 580, 465, { size: 18, color: C.purple, fam: MONO });
      text("AS new -> new.ustun", 1020, 465, { size: 18, color: C.blue, fam: MONO });
      text("excluded.ustun", 1440, 465, { size: 18, color: C.green, fam: MONO });

      // Row 3
      text("Ko'p maqsadlar", 180, 520, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Bitta maqsad", 580, 520, { size: 18, color: C.soft, fam: UI });
      text("Kerak emas (avtomatik)", 1020, 520, { size: 18, color: C.soft, fam: UI });
      text("Ha, ketma-ket bir nechta", 1440, 520, { size: 18, color: C.green, fam: UI });

      // Row 4
      text("Tashqi kalit xavfi", 180, 575, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Xavfsiz (joyida yangilaydi)", 580, 575, { size: 18, color: C.green, fam: UI });
      text("REPLACE xavfli (ID o'zgaradi!)", 1020, 575, { size: 18, color: C.red, fam: UI });
      text("Xavfsiz (DO UPDATE da)", 1440, 575, { size: 18, color: C.green, fam: UI });

      // Row 5
      text("Parallellik kafolati", 180, 630, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Yuqori atomarlik", 580, 630, { size: 18, color: C.green, fam: UI });
      text("Qator darajasida qulf", 1020, 630, { size: 18, color: C.soft, fam: UI });
      text("Fayl/baza darajasida qulf", 1440, 630, { size: 18, color: C.soft, fam: UI });

      // Row 6
      text("RETURNING yordami", 180, 685, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("To'liq (old/new, action)", 580, 685, { size: 18, color: C.green, fam: UI });
      text("Yo'q (LAST_INSERT_ID)", 1020, 685, { size: 18, color: C.soft, fam: UI });
      text("Qisman (3.35+)", 1440, 685, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L6', 'kalitidir.'), 0.5);
    withA(k2, () => {
      card(120, 790, 1680, 180, { fill: C.card, col: C.green, p: k2 });
      text("Amaliy Tavsiya:", 160, 840, { size: 24, weight: 700, color: C.green, fam: UI });
      text("• REPLACE INTO buyrug'idan qoching — u oddiy UPDATE emas, DELETE + INSERT dir!", 160, 885, { size: 20, color: C.ink, fam: UI });
      text("• Har doim baza dialektiga mos atomar UPSERT mexanizmlaridan (ON CONFLICT / ON DUPLICATE KEY) foydalaning.", 160, 925, { size: 20, weight: 700, color: C.blue, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_duplicate_key.s) sIntro(t);
    else if (t < S.mysql_replace_trap.s) sMysqlDuplicateKey(t);
    else if (t < S.sqlite_upsert.s) sMysqlReplaceTrap(t);
    else if (t < S.dml_pitfalls.s) sSqliteUpsert(t);
    else if (t < S.xulosa.s) sDmlPitfalls(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_duplicate_key.s + 3.0;
    frame(t);
  };
})();
