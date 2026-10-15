// SQL 9-bob 3-qism: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("9-bob. 3-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Boolean, UUID va Enum: Dialektlar", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL, SQLite va 6 ta Xavfli Tuzoq", 960, 395, { size: 42, align: 'center', p: P(t, 1.2, 1.2) });
    marker(440, 430, 1040 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'may'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: TINYINT(1) & ENUM indeksi", 460, 600, C.orange, kBadges, 24);
      pill("SQLite: Tip yo'q (INTEGER, CHECK)", 960, 600, C.green, kBadges, 24);
      pill("6 ta amaliy xavfli tuzoq", 1440, 600, C.red, kBadges, 24);
    });

    const kDesc = P(t, W('L2', 'farqlar'), 0.8);
    withA(kDesc, () => {
      card(200, 700, 1520, 240, { fill: C.card, col: C.blue, p: kDesc });
      text("MySQL va SQLite bu uchta turga standartdan butunlay boshqacha yondashadi:", 960, 760, { size: 28, weight: 700, align: 'center', color: C.ink });
      text("MySQL da boolean yo'q (TINYINT(1)), UUID esa 1-versiya bo'lib oldindan taxmin qilinadi.", 960, 815, { size: 24, align: 'center', color: C.soft });
      text("SQLite da esa bu turlarning hech biri yo'q — faqat oddiy sonlar va CHECK cheklovlari ishlaydi.", 960, 865, { size: 24, weight: 700, align: 'center', color: C.red });
    });
  }

  // 2. MYSQL_BOOL: TINYINT(1) tuzog'i
  function sMysqlBool(t) {
    heading("MySQL: Boolean Yo'q, TINYINT(1) Tuzog'i", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'tayni-int'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "MySQL: boolean ustuniga 2 va -5 yozilishi", [{
        b: {
          cmd: "CREATE TABLE v (nom VARCHAR(20), bajarildi BOOLEAN);\nINSERT INTO v VALUES ('xat', TRUE), ('qongiroq', FALSE), ('xato', 2), ('salbiy', -5);\nSELECT nom, bajarildi, bajarildi = TRUE AS teng_true, IF(bajarildi, 'ha', 'yoq') AS shart FROM v;",
          out: (TTY.mysql?.bool_trap ? [
            "+----------+-----------+-----------+-------+",
            "| nom      | bajarildi | teng_true | shart |",
            "+----------+-----------+-----------+-------+",
            "| xat      |         1 |         1 | ha    |",
            "| qongiroq |         0 |         0 | yoq   |",
            "| xato     |         2 |         0 | ha    |",
            "| salbiy   |        -5 |         0 | ha    |",
            "+----------+-----------+-----------+-------+"
          ] : [
            "xat\t1\t1\tha",
            "xato\t2\t0\tha"
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'tushib'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.red, p: k2 });
      hand("ENG KATTA TUZOQ: = TRUE", 1020, 290, { size: 30, color: C.red, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.green, p: k2 });
      text("IF(bajarildi, 'ha', 'yoq')  -->  ROST ('ha')", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Chunki shartda noldan farqli har qanday son (2, -5) ROST!", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.red, p: k2 });
      text("bajarildi = TRUE  -->  YOLG'ON (0) !", 1050, 500, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("Chunki MySQL da TRUE = 1. '2 = 1' esa yolg'ondir!", 1050, 540, { size: 18, color: C.red });

      text("WHERE bajarildi = TRUE yozsangiz 2 va -5 qatorlari TUSHIB QOLADI!", 1020, 625, { size: 19, color: C.red, weight: 700, wrap: 720 });
    });

    const kDesc = P(t, W('L5', 'qatorlarni'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("MYSQL DA TO'G'RI YO'L", 270, 750, C.orange, kDesc, 22);
      text("• MySQL da hech qachon WHERE ustun = TRUE deb yozmang! Shunchaki WHERE ustun deb yozing.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Agar aniq 0 va 1 bo'lishini xohlasangiz, ustunga CHECK (bajarildi IN (0, 1)) cheklovini qo'ying.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
      text("• PostgreSQL da bu muammo umuman yo'q, chunki PostgreSQL da boolean butun son emas, haqiqiy alohida tip!", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 3. MYSQL_UUID_ENUM: UUID va indekslangan ENUM
  function sMysqlUuidEnum(t) {
    heading("MySQL: UUID va Indekslangan ENUM", t, L('L6').s - 0.4);

    const k1 = P(t, W('L6', 'mavjud'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. MySQL: UUID() va UUID_TO_BIN()", [{
        b: {
          cmd: "SELECT UUID() AS v1;\nSELECT HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db')) AS oddiy,\n       HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db', 1)) AS almashtirilgan;",
          out: [
            "v1: e1b420a0-c5fe-11f1-8519-64d60596df9d",
            "# 1-versiya: vaqt + MAC manzilga asoslangan!",
            "",
            "oddiy:          6CCD780CBABA102695645B8C656024DB",
            "almashtirilgan: 1026BABA6CCD780C95645B8C656024DB",
            "# vaqt qismi o'ngga surilib, indekslash tezlashadi"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L8', 'raqamlar'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. MySQL: Ustun ichidagi ENUM", [{
        b: {
          cmd: "CREATE TABLE m (id INT, h ENUM('yangi', 'jarayonda', 'yopildi') NOT NULL);\nINSERT INTO m VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');\nSELECT id, h, h + 0 AS indeks FROM m ORDER BY h;",
          out: (TTY.mysql?.enum_demo ? [
            "+------+-----------+--------+",
            "| id   | h         | indeks |",
            "+------+-----------+--------+",
            "|    2 | yangi     |      1 |",
            "|    3 | jarayonda |      2 |",
            "|    1 | yopildi   |      3 |",
            "+------+-----------+--------+"
          ] : [
            "2\tyangi\t1",
            "1\tyopildi\t3"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L7', 'taxmin'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("IKKITA MUHIM OGOHLANTIRISH", 290, 750, C.red, kDesc, 22);
      text("1. MySQL UUID() funksiyasi 1-versiyadagi UUID beradi: uni oldindan taxmin qilish mumkin! Maxfiy tokenlar uchun ishlatmang.", 180, 810, { size: 22, color: C.red, weight: 700, wrap: 1560 });
      text("2. MySQL ENUM ichida qiymat raqam (1..n) bo'lib saqlanadi. ENUM('1', '2', '3') deb sonli nomlar berishdan saqlaning (indeks bilan adashadi!).", 180, 860, { size: 22, color: C.ink, wrap: 1560 });
      text("3. NOT NULL enum ustunida qiymat berilmasa — sukut bo'yicha ro'yxatdagi birinchi qiymat ('yangi') olinadi.", 180, 905, { size: 22, color: C.blue, weight: 600, wrap: 1560 });
    });
  }

  // 4. SQLITE_TIPLAR: Maxsus tip yo'q
  function sSqliteTiplar(t) {
    heading("SQLite: Hech Qanday Maxsus Tip Yo'q!", t, L('L9').s - 0.4);

    const k1 = P(t, W('L10', 'matn'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. SQLite: BOOLEAN ustuniga har narsa yoziladi", [{
        b: {
          cmd: "CREATE TABLE v (b BOOLEAN);\nINSERT INTO v VALUES (TRUE), (2), ('ha');\nSELECT b, typeof(b) FROM v;",
          out: (TTY.sqlite?.bool_demo ? TTY.sqlite.bool_demo.split("\n") : [
            "1  | integer",
            "2  | integer",
            "ha | text"
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L11', 'chek'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. SQLite: UUID va Enum yo'q", [{
        b: {
          cmd: "SELECT uuid();\n\n-- Enum o'rniga CHECK ishlatiladi:\nCREATE TABLE m (\n  h TEXT CHECK (h IN ('yangi', 'jarayonda', 'yopildi'))\n);",
          out: [
            "Parse error: no such function: uuid",
            "  SELECT uuid();",
            "         ^--- xato!",
            "",
            "# UUID ilovada yaratiladi (BLOB yoki TEXT)",
            "# Enum o'rniga CHECK (h IN (...)) beriladi"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L10', 'bermaydi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#f8fafc', col: C.blue, p: kDesc });
      pill("SQLITE FE'L-ATVORI", 240, 750, C.blue, kDesc, 22);
      text("• SQLite da BOOLEAN deb e'lon qilingan ustun NUMERIC affinity oladi, lekin unga matn ham yozilaveradi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• UUID va ENUM turlari umuman yo'q. Dasturchi ularni CHECK cheklovi yoki ilova darajasida nazorat qilishi shart.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 5. TUZOQLAR: 6 ta xavfli tuzoq
  function sTuzoqlar(t) {
    heading("Amaliyotdagi Eng Xavfli 6 ta Tuzoq", t, L('L12').s - 0.4);

    const traps = [
      { tit: "1. WHERE NOT faol", sub: "NULL qatorlar yo'qolib qoladi! Doimo WHERE faol IS NOT TRUE deb yozing.", col: C.red, at: W('L12', 'yo‘qoladi') },
      { tit: "2. MySQL da = TRUE", sub: "WHERE bajarildi = TRUE yozsangiz 2 va -5 tushib qoladi. Faqat WHERE bajarildi yozing.", col: C.red, at: W('L13', 'saqlaning') },
      { tit: "3. 'Y'/'N' matni", sub: "Boolean o'rniga char(1) da 'Y'/'N' saqlamang. Tekshiruvsiz xato qiymatlar tushadi.", col: C.orange, at: W('L13', 'isrof') },
      { tit: "4. UUID ni matn qilish", sub: "UUID ni varchar(36) da saqlash 2.5 baravar ko'p joy oladi. Doim uuid tipidan foydalaning.", col: C.orange, at: W('L13', 'disk') },
      { tit: "5. MySQL UUID() tokeni", sub: "1-versiya UUID oldindan taxmin qilinishi mumkin. Maxfiy tokenlar uchun ishlatmang.", col: C.red, at: W('L14', 'o‘zgaruvchan') },
      { tit: "6. Enum o'chmasligi", sub: "PostgreSQL enum dan qiymatni o'chirib bo'lmaydi. Tez o'zgaruvchan statusga jadval ishlating.", col: C.purple, at: W('L14', 'o‘chirib') }
    ];

    traps.forEach((p, i) => {
      const k = P(t, p.at, 0.5);
      withA(k, () => {
        const x = 140 + (i % 3) * 560, y = 260 + Math.floor(i / 3) * 330;
        card(x, y, 520, 290, { fill: C.card, col: p.col, p: k });
        pill(p.tit, x + 200, y + 55, p.col, k, 20);
        text(p.sub, x + 30, y + 130, { size: 21, color: C.ink, wrap: 460 });
      });
    });
  }

  // 6. XULOSA: Taqqoslash jadvali
  function sXulosa(t) {
    heading("Taqqoslash Jadvali va Yakuniy Xulosa", t, L('L15').s - 0.4);

    const kTable = P(t, W('L15', 'postgre'), 0.5);
    withA(kTable, () => {
      table(140, 240, "", [
        { label: "Xususiyat", w: 380 },
        { label: "PostgreSQL", w: 420 },
        { label: "MySQL", w: 420 },
        { label: "SQLite", w: 420 }
      ], [
        ["Boolean tipi", "Haqiqiy boolean (1 B)", "TINYINT(1) sinonimi", "0 / 1 butun son"],
        ["Ustunga 2 yozish", "Qat'iy XATO", "Bemalol yoziladi", "Bemalol yoziladi"],
        ["UUID tipi", "uuid (16 bayt, v4/v7)", "Yo'q: VARBINARY(16)", "Yo'q: BLOB / TEXT"],
        ["UUID yaratish", "uuidv4(), uuidv7()", "UUID() — 1-versiya", "Ichki funksiya yo'q"],
        ["Enum tipi", "CREATE TYPE ... AS ENUM", "Ustunda ENUM(...)", "Yo'q (CHECK bilan)"]
      ], { p: kTable });
    });

    const kDesc = P(t, W('L16', 'bobda'), 0.5);
    withA(kDesc, () => {
      card(140, 680, 1640, 260, { fill: '#f8fafc', col: C.blue, p: kDesc });
      pill("YAKUNIY XULOSA", 240, 730, C.blue, kDesc, 22);
      text("1. PostgreSQL barcha standartlarga to'liq javob beruvchi eng mukammal va xavfsiz tizimdir.", 180, 785, { size: 23, color: C.green, weight: 700, wrap: 1560 });
      text("2. MySQL da = TRUE tuzog'idan va 1-versiya UUID taxmin qilinishidan ehtiyot bo'ling.", 180, 835, { size: 23, color: C.orange, weight: 700, wrap: 1560 });
      text("3. Keyingi 10-bobda ma'lumotlar bazasidagi eng sirli va bahsli mavzu — NULL qiymati va tip konversiyasi bilan tanishamiz!", 180, 885, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // Asosiy chizish funksiyasi
  function draw(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.mysql_bool.s) sIntro(t);
    else if (t < sc.mysql_uuid_enum.s) sMysqlBool(t);
    else if (t < sc.sqlite_tiplar.s) sMysqlUuidEnum(t);
    else if (t < sc.tuzoqlar.s) sSqliteTiplar(t);
    else if (t < sc.xulosa.s) sTuzoqlar(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("9-bob: Boolean, UUID va Enum — Dialektlar", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("MySQL, SQLite va 6 ta Xavfli Tuzoq", 960, 290, { size: 40, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.orange });
    hand("MySQL Dialekti", 180, 440, { size: 32, color: C.orange });
    text("• Boolean = TINYINT(1)\n• = TRUE tuzog'i (2 tushadi)\n• UUID() v1 taxmin qilinadi\n• ENUM ichida indeks (1..n)\n• NOT NULL da 1-qiymat", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("MYSQL TUZOQLARI", 390, 820, C.orange, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.green });
    hand("SQLite Dialekti", 750, 440, { size: 32, color: C.green });
    text("• Tip yo'q (INTEGER 0/1)\n• 'ha' matni ham yoziladi\n• uuid() funksiyasi yo'q\n• ENUM yo'q\n• CHECK (h IN (...))", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("SQLITE CHEKLOVLARI", 960, 820, C.green, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.red });
    hand("6 ta Xavfli Tuzoq", 1320, 440, { size: 32, color: C.red });
    text("• WHERE NOT da NULL yo'qoladi\n• IS NOT TRUE qutqaradi\n• 'Y'/'N' deb saqlamang\n• UUID ni matn qilmang (40B)\n• Enum dan qiymat o'chmaydi", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("6 TA TUZOQ", 1530, 820, C.red, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
