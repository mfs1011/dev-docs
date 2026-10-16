// SQL 21-bob 3-qism: "Dialektlar" — MySQL LOAD DATA va SQLite .import
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
    hand("21-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: Ommaviy Yuklash", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("LOAD DATA, LOCAL Xatarlari va SQLite .import Vositalari", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'May'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: LOAD DATA INFILE", 440, 520, C.blue, kBadges, 22);
      pill("SQLite: .import BUYRUG'I", 960, 520, C.green, kBadges, 22);
      pill("PostgreSQL: COPY & \\copy", 1480, 520, C.purple, kBadges, 22);
    });

    const kCards = P(t, W('L1', 'Es-kyu-layt'), 0.8);
    withA(kCards, () => {
      card(140, 600, 500, 320, { fill: C.card, col: C.blue, p: kCards });
      pill("MySQL 9.7", 390, 640, C.blue, kCards, 18);
      text("• LOAD DATA INFILE: 20x tezroq", 170, 700, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• secure_file_priv katalog cheklovi", 170, 740, { size: 19, color: C.ink, fam: UI });
      text("• LOCAL INFILE: mijoz fayli", 170, 780, { size: 19, color: C.ink, fam: UI });
      text("• LOCAL tuzog'i: IGNORE kabi ishlaydi", 170, 825, { size: 19, color: C.red, fam: UI });
      text("• Xato narxlar 0.00 ga aylanadi!", 170, 870, { size: 18, weight: 700, color: C.red, fam: UI });

      card(710, 600, 500, 320, { fill: C.card, col: C.green, p: kCards });
      pill("SQLite 3.54", 960, 640, C.green, kCards, 18);
      text("• CLI vositasi: .import --csv", 740, 700, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Jadval bo'lsa: --skip 1 sarlavha uchun", 740, 740, { size: 19, color: C.ink, fam: UI });
      text("• Jadval yo'q bo'lsa: tipsiz yaratadi", 740, 780, { size: 19, color: C.red, fam: UI });
      text("• Sukut bo'yicha tekshiruv yo'q (text)", 740, 825, { size: 19, color: C.soft, fam: UI });
      text("• STRICT jadvallar himoya qiladi", 740, 870, { size: 18, color: C.green, fam: UI });

      card(1280, 600, 500, 320, { fill: C.card, col: C.purple, p: kCards });
      pill("PostgreSQL 18", 1530, 640, C.purple, kCards, 18);
      text("• COPY va \\copy standart mexanizmi", 1310, 700, { size: 19, color: C.ink, fam: UI });
      text("• ON_ERROR ignore xato qatorni tashlaydi", 1310, 745, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• REJECT_LIMIT xatolar sonini cheklaydi", 1310, 790, { size: 19, color: C.ink, fam: UI });
      text("• Ma'lumotlarni jimgina buzmaydi!", 1310, 835, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• Barcha dialektlar orasida eng xavfsiz", 1310, 875, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL LOAD DATA
  function sMysqlLoadData(t) {
    heading("MySQL: LOAD DATA INFILE va Xavfsizlik Sozlamalari", t, TM.scenes.mysql_load_data.s);

    const k1 = P(t, W('L2', 'deyta'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("MySQL Yuklash Turlari", 530, 270, C.blue, k1, 20);

      text("1. Server Fayli: LOAD DATA INFILE", 160, 335, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("LOAD DATA INFILE '/var/lib/mysql-files/data.csv'", 160, 375, { size: 18, color: C.ink, fam: MONO });
      text("INTO TABLE mahsulotlar FIELDS TERMINATED BY ',';", 160, 410, { size: 18, color: C.ink, fam: MONO });

      text("Xavfsizlik: secure_file_priv tizim o'zgaruvchisi", 160, 470, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• NULL — server import/eksportni butunlay o'chiradi", 180, 505, { size: 19, color: C.soft, fam: UI });
      text("• Papka yo'li — faqat shu papkadan o'qish mumkin", 180, 540, { size: 19, color: C.green, fam: UI });
      text("• Bo'sh qiymat — xavfli, har qanday fayl o'qiladi", 180, 575, { size: 19, color: C.red, fam: UI });

      sline(160, 620, 880, 620, { col: C.rule, p: k1 });

      text("2. Mijoz Fayli: LOAD DATA LOCAL INFILE", 160, 665, { size: 21, weight: 700, color: C.green, fam: UI });
      text("LOAD DATA LOCAL INFILE 'noutbukdagi_fayl.csv'", 160, 705, { size: 18, color: C.green, fam: MONO });
      text("INTO TABLE mahsulotlar FIELDS TERMINATED BY ',';", 160, 740, { size: 18, color: C.green, fam: MONO });

      text("Talab: local_infile ham serverda, ham mijozda", 160, 795, { size: 19, color: C.ink, fam: UI });
      text("yoqilgan bo'lishi shart! (Sukut bo'yicha o'chiq)", 160, 830, { size: 19, color: C.soft, fam: UI });
      text("Tezlik: INSERT lardan 20 baravargacha tez!", 160, 885, { size: 20, weight: 700, color: C.blue, fam: UI });
    });

    const k2 = P(t, W('L2', 'sekyur'), 0.5);
    withA(k2, () => {
      const mySecOut = [
        "mysql> SELECT @@local_infile, @@secure_file_priv;",
        "+----------------+--------------------+",
        "| @@local_infile | @@secure_file_priv |",
        "+----------------+--------------------+",
        "|              0 | NULL               |",
        "+----------------+--------------------+",
        "",
        "-- Sukut bo'yicha ikkalasi ham o'chiq!",
        "-- secure_file_priv = NULL bo'lsa:",
        "ERROR 1290 (HY000): The MySQL server is running",
        "with the --secure-file-priv option so it cannot",
        "execute this statement.",
        "",
        "-- LOCAL ishlatish uchun ikkala tomonda yoqiladi:",
        "mysql> SET GLOBAL local_infile = 1;",
        "$ mysql --local-infile=1 -u root ..."
      ];
      term(980, 220, 820, 750, "MySQL 9.7 Terminali (Xavfsizlik)", [{
        b: {
          cmd: "mysql -u root",
          out: mySecOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 3. MYSQL LOCAL TRAP
  function sMysqlLocalTrap(t) {
    heading("MySQL LOCAL Tuzog'i: Ma'lumotlarning Jimgina Buzilishi", t, TM.scenes.mysql_local_trap.s);

    const k1 = P(t, W('L3', 'Lokal'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("LOCAL = IGNORE Mexanizmi", 530, 270, C.red, k1, 20);

      text("MySQL hujjati aytadi:", 160, 335, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("Agar REPLACE ko'rsatilmagan bo'lsa,", 160, 375, { size: 20, color: C.soft, fam: UI });
      text("LOCAL avtomatik ravishda IGNORE rejimini yoqadi!", 160, 410, { size: 20, weight: 700, color: C.red, fam: UI });

      card(160, 455, 740, 155, { fill: '#fff2f2', col: C.red, p: k1 });
      text("1. Noto'g'ri qiymat ('abc') xato BERMAYDI!", 180, 495, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   U sukut bo'yicha 0.00 ga aylanadi va jadvalga kiradi!", 180, 530, { size: 18, color: C.ink, fam: UI });
      text("2. Takroriy kalit (PRIMARY KEY) jimgina tashlanadi!", 180, 565, { size: 19, weight: 700, color: C.red, fam: UI });

      text("Nega bu xavfli?", 160, 645, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Dasturchi buyruq xatosiz o'tdi deb o'ylaydi.", 160, 685, { size: 19, color: C.soft, fam: UI });
      text("Aslida esa narxlar 0 ga aylanib, bazaga soxta ma'lumot tushgan!", 160, 720, { size: 19, weight: 700, color: C.red, fam: UI });
      text("Takror qatorlar esa yo'qolib ketgan.", 160, 755, { size: 19, color: C.soft, fam: UI });

      text("Qat'iy qoida: SHOW WARNINGS ni har doim tekshiring!", 160, 825, { size: 20, weight: 700, color: C.blue, fam: UI });
    });

    const k2 = P(t, W('L3', 'nolga'), 0.5);
    withA(k2, () => {
      const myTrapOut = [
        "mysql> LOAD DATA LOCAL INFILE '/tmp/sql21_my.csv'",
        "       INTO TABLE mahsulotlar FIELDS TERMINATED BY ',';",
        "Query OK, 3 rows affected, 2 warnings (0.01 sec)",
        "",
        "mysql> SHOW WARNINGS;",
        "+---------+------+--------------------------------------------+",
        "| Level   | Code | Message                                    |",
        "+---------+------+--------------------------------------------+",
        "| Warning | 1366 | Incorrect decimal value: 'abc' at row 3    |",
        "| Warning | 1062 | Duplicate entry 'NON' for PRIMARY KEY      |",
        "+---------+------+--------------------------------------------+",
        "",
        "mysql> SELECT * FROM mahsulotlar;",
        "+------+------+----------+",
        "| sku  | nom  | narx     |",
        "+------+------+----------+",
        "| CHOY | Choy |     0.00 | <-- DIQQAT: 'abc' 0.00 bo'lib qoldi!",
        "| NON  | Non  |  4000.00 |",
        "| SUT  | Sut  | 12000.00 |",
        "+------+------+----------+"
      ];
      term(980, 220, 820, 750, "MySQL LOAD DATA LOCAL (Buzilgan narx)", [{
        b: {
          cmd: "mysql -u root test",
          out: myTrapOut.join('\n')
        }
      }], { font: 15, lh: 24 });
    });
  }

  // 4. SQLITE IMPORT
  function sSqliteImport(t) {
    heading("SQLite: .import Buyrug'i va Tipsiz Jadvallar", t, TM.scenes.sqlite_import.s);

    const k1 = P(t, W('L4', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.green, p: k1 });
      pill("SQLite .import Ishlash Qoidasi", 530, 270, C.green, k1, 20);

      text("1-HOLAT: Jadval avvaldan mavjud bo'lsa", 160, 335, { size: 21, weight: 700, color: C.green, fam: UI });
      text("CREATE TABLE mahsulotlar (sku TEXT, narx NUMERIC);", 160, 375, { size: 18, color: C.ink, fam: MONO });
      text(".import --csv --skip 1 fayl.csv mahsulotlar", 160, 410, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("• --skip 1 sarlavhani o'tkazib yuboradi.", 180, 455, { size: 19, color: C.soft, fam: UI });
      text("• Ma'lumotlar mavjud sxemaga mos yuklanadi.", 180, 490, { size: 19, color: C.soft, fam: UI });

      sline(160, 535, 880, 535, { col: C.rule, p: k1 });

      text("2-HOLAT: Jadval mavjud bo'lmasa (XAVF!)", 160, 580, { size: 21, weight: 700, color: C.red, fam: UI });
      text(".import --csv fayl.csv yangi_jadval", 160, 620, { size: 18, color: C.red, fam: MONO });
      text("• SQLite jadvalni o'zi avtomatik yaratadi.", 180, 665, { size: 19, color: C.soft, fam: UI });
      text("• Lekin barcha ustunlar TIPSIZ bo'lib qoladi!", 180, 700, { size: 19, weight: 700, color: C.red, fam: UI });

      card(160, 735, 740, 115, { fill: '#fff2f2', col: C.red, p: k1 });
      text("CREATE TABLE yangi_jadval(\"sku\", \"nom\", \"narx\");", 180, 775, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("-- Hech qanday tip, cheklov yoki kalit yo'q!", 180, 815, { size: 18, color: C.soft, fam: MONO });

      text("Tavsiya: Jadvalni avval SQL bilan aniq yarating!", 160, 885, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L4', 'tipsiz'), 0.5);
    withA(k2, () => {
      const sqlImpOut = [
        "sqlite3 ombor.db",
        "sqlite> CREATE TABLE mahsulotlar (",
        "   ...>   sku TEXT PRIMARY KEY,",
        "   ...>   nom TEXT NOT NULL,",
        "   ...>   narx NUMERIC",
        "   ...> );",
        "",
        "sqlite> .import --csv --skip 1 mahsulotlar.csv mahsulotlar",
        "",
        "sqlite> SELECT sku, narx, typeof(narx) FROM mahsulotlar;",
        "╭────────┬──────────┬──────────────╮",
        "│  sku   │   narx   │ typeof(narx) │",
        "╞════════╪══════════╪══════════════╡",
        "│ NON    │     4000 │ integer      │",
        "│ SUT    │    12000 │ integer      │",
        "│ CHOY   │ abc      │ text         │ <-- XATO NARX YUKLANDI!",
        "│ TUZ    │     2000 │ integer      │",
        "│ SHAKAR │ narx_yoq │ text         │ <-- BU HAM MATN BO'LDI!",
        "╰────────┴──────────┴──────────────╯"
      ];
      term(980, 220, 820, 750, "SQLite 3.54 CLI (Affinity natijasi)", [{
        b: {
          cmd: "sqlite3 ombor.db",
          out: sqlImpOut.join('\n')
        }
      }], { font: 15, lh: 24 });
    });
  }

  // 5. STRICT AND CHECKS
  function sStrictAndChecks(t) {
    heading("SQLite da Ma'lumotlar Sifatini Nazorat Qilish", t, TM.scenes.strict_and_checks.s);

    const k1 = P(t, W('L5', 'matn'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Sukut Bo'yicha Bo'shashgan Nazorat", 530, 270, C.red, k1, 20);

      text("Type Affinity (Tur yaqinligi) xususiyati:", 160, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("SQLite odatiy jadvallarda ustun turini qat'iy majburlamaydi.", 160, 375, { size: 19, color: C.soft, fam: UI });
      text("Agar narx numeric bo'lsa-da, 'abc' kelsa, uni shunchaki", 160, 410, { size: 19, color: C.soft, fam: UI });
      text("text sifatida jadvalga yozib qo'yaveradi.", 160, 445, { size: 19, weight: 700, color: C.red, fam: UI });

      card(160, 490, 740, 160, { fill: '#fff2f2', col: C.red, p: k1 });
      text("-- Oddiy jadval:", 180, 525, { size: 18, color: C.soft, fam: MONO });
      text("CREATE TABLE mahsulotlar (sku TEXT, narx NUMERIC);", 180, 560, { size: 18, color: C.ink, fam: MONO });
      text(".import --csv ... mahsulotlar", 180, 595, { size: 18, color: C.ink, fam: MONO });
      text("-- Hech qanday xato ham, ogohlantirish ham yo'q!", 180, 630, { size: 18, weight: 700, color: C.red, fam: MONO });

      text("Oqibatda hisob-kitoblarda (SUM, AVG) xatolar chiqadi.", 160, 690, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'strikt'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 750, { fill: C.card, col: C.green, p: k2 });
      pill("Yechim: STRICT Jadvallar (3.37+)", 1390, 270, C.green, k2, 20);

      text("Qat'iy Tiplash: STRICT Kalit So'zi", 1020, 335, { size: 21, weight: 700, color: C.green, fam: UI });

      card(1020, 375, 740, 200, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("CREATE TABLE mahsulotlar (", 1040, 410, { size: 18, color: C.ink, fam: MONO });
      text("  sku TEXT PRIMARY KEY,", 1040, 445, { size: 18, color: C.ink, fam: MONO });
      text("  nom TEXT NOT NULL,", 1040, 480, { size: 18, color: C.ink, fam: MONO });
      text("  narx REAL CHECK (narx > 0)", 1040, 515, { size: 18, color: C.green, fam: MONO });
      text(") STRICT; -- Qat'iy nazorat!", 1040, 550, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("Natija:", 1020, 610, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• 'abc' matni REAL ustuniga kiritilganda darhol xato beradi:", 1020, 650, { size: 19, color: C.soft, fam: UI });
      text("  Runtime error: cannot store TEXT value in REAL column", 1040, 685, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("• CHECK (narx > 0) manfiy narxlarni to'xtatadi.", 1020, 730, { size: 19, color: C.soft, fam: UI });
      text("• Ma'lumotlar bazasi butunligi to'liq himoyalanadi!", 1020, 775, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Ommaviy Yuklash Dialektlari Taqqoslashi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Xulosa'), 0.5);
    withA(k1, () => {
      // Big Comparison Table
      card(120, 220, 1680, 540, { fill: C.card, col: C.blue, p: k1 });
      text("Ma'lumotlar Bazalarida Ommaviy Yuklash Xususiyatlari", 960, 275, { size: 26, weight: 700, align: 'center', color: C.ink, fam: UI });

      // Table Headers
      sline(160, 310, 1760, 310, { col: C.rule, p: k1 });
      text("Xususiyat", 180, 345, { size: 20, weight: 700, color: C.soft, fam: UI });
      text("PostgreSQL 18", 580, 345, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("MySQL 9.7", 1020, 345, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("SQLite 3.54", 1440, 345, { size: 20, weight: 700, color: C.green, fam: UI });
      sline(160, 370, 1760, 370, { col: C.rule, p: k1 });

      // Row 1
      text("Asosiy Buyruq", 180, 410, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("COPY / \\copy", 580, 410, { size: 18, color: C.purple, fam: MONO });
      text("LOAD DATA INFILE", 1020, 410, { size: 18, color: C.blue, fam: MONO });
      text(".import --csv", 1440, 410, { size: 18, color: C.green, fam: MONO });

      // Row 2
      text("Server Fayli", 180, 465, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("pg_read_server_files", 580, 465, { size: 18, color: C.purple, fam: MONO });
      text("secure_file_priv", 1020, 465, { size: 18, color: C.blue, fam: MONO });
      text("— (Fayl = Baza)", 1440, 465, { size: 18, color: C.soft, fam: UI });

      // Row 3
      text("Mijoz Fayli", 180, 520, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("\\copy / STDIN", 580, 520, { size: 18, color: C.green, fam: MONO });
      text("LOAD DATA LOCAL", 1020, 520, { size: 18, color: C.blue, fam: MONO });
      text(".import --skip 1", 1440, 520, { size: 18, color: C.green, fam: MONO });

      // Row 4
      text("Noto'g'ri qiymat", 180, 575, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Xato / ON_ERROR ignore", 580, 575, { size: 18, color: C.green, fam: UI });
      text("0.00 ga aylanadi (xavf!)", 1020, 575, { size: 18, color: C.red, fam: UI });
      text("text bo'lib yuklanadi", 1440, 575, { size: 18, color: C.soft, fam: UI });

      // Row 5
      text("Xatolar chegarasi", 180, 630, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("REJECT_LIMIT n (PG 18)", 580, 630, { size: 18, color: C.green, fam: MONO });
      text("Yo'q (faqat warnings)", 1020, 630, { size: 18, color: C.soft, fam: UI });
      text("Yo'q", 1440, 630, { size: 18, color: C.soft, fam: UI });

      // Row 6
      text("Sifatni saqlash", 180, 685, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Aniq nazorat va hisobot", 580, 685, { size: 18, color: C.green, fam: UI });
      text("SHOW WARNINGS zarur", 1020, 685, { size: 18, color: C.blue, fam: UI });
      text("STRICT jadval zarur", 1440, 685, { size: 18, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L6', 'asosidir.'), 0.5);
    withA(k2, () => {
      card(120, 790, 1680, 180, { fill: C.card, col: C.green, p: k2 });
      text("Amaliy Tavsiya:", 160, 840, { size: 24, weight: 700, color: C.green, fam: UI });
      text("• Tezlik uchun bittalab INSERT emas, har doim COPY / LOAD DATA / .import vositalaridan foydalaning.", 160, 885, { size: 20, color: C.ink, fam: UI });
      text("• Yuklashdan so'ng ma'lumotlar buzilmaganini tekshiring va PostgreSQL da ANALYZE o'tkazishni unutmang!", 160, 925, { size: 20, weight: 700, color: C.blue, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_load_data.s) sIntro(t);
    else if (t < S.mysql_local_trap.s) sMysqlLoadData(t);
    else if (t < S.sqlite_import.s) sMysqlLocalTrap(t);
    else if (t < S.strict_and_checks.s) sSqliteImport(t);
    else if (t < S.xulosa.s) sStrictAndChecks(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_load_data.s + 3.0;
    frame(t);
  };
})();
