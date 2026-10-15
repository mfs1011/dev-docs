// SQL 9-bob 2-qism: "Kod" — PostgreSQL terminalida jonli amallar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY?.pg || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("9-bob. 2-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL Terminalida Jonli Kod", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("boolean, NULL tuzog'i, UUIDv7 va Enum Amallari", 960, 395, { size: 40, align: 'center', p: P(t, 1.2, 1.2) });
    marker(420, 430, 1080 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kTerm = P(t, W('L2', 'hajmi'), 0.8);
    withA(kTerm, () => {
      // Chap: Terminal
      term(140, 480, 800, 440, "psql: PostgreSQL 18.6", [{
        b: {
          cmd: "SELECT 'PostgreSQL 18.6 tayyor!' AS holat;",
          out: [
            "          holat          ",
            "-------------------------",
            " PostgreSQL 18.6 tayyor! ",
            "(1 row)"
          ]
        },
        t: kTerm,
        typeDur: 1.0
      }], { font: 16 });

      // O'ng: Tushuntirish kartasi
      card(980, 480, 800, 440, { fill: C.card, col: C.blue, p: kTerm });
      pill("JONLI SINAYDIGAN MAVZULARIMIZ", 1280, 535, C.blue, kTerm, 22);
      text("• boolean kiritish shakllari va butun son xatosi.", 1020, 605, { size: 23, color: C.ink, wrap: 720 });
      text("• NULL qiymatli boolean ustunlarida WHERE filtri tuzog'i.", 1020, 660, { size: 23, weight: 700, color: C.red, wrap: 720 });
      text("• Yangi uuidv7() funksiyasi va diskdagi hajm solishtiruvi.", 1020, 715, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("• enum yaratish, saralash tartibi va ALTER TYPE.", 1020, 770, { size: 22, color: C.soft, wrap: 720 });
    });
  }

  // 2. BOOL_SINOV
  function sBoolSinov(t) {
    heading("Boolean: Kiritish Shakllari va Butun Son Xatosi", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'vazifalar'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: Jadval yaratish va kiritish", [{
        b: {
          cmd: "CREATE TABLE vazifalar (nom text, bajarildi boolean);\nINSERT INTO vazifalar VALUES ('xat', TRUE), ('qongiroq', 'no'), ('hisobot', 'on'), ('sinov', NULL);\nSELECT * FROM vazifalar;",
          out: (TTY.bool_sel ? [
            "   nom    | bajarildi ",
            "----------+-----------",
            " xat      | t",
            " qongiroq | f",
            " hisobot  | t",
            " sinov    | ",
            "(4 rows)"
          ] : [
            "xat | t",
            "qongiroq | f"
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'xato'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: Butun son (2) kiritilsa: XATO!", [{
        b: {
          cmd: "INSERT INTO vazifalar VALUES ('xato', 2);",
          out: (TTY.bool_int_err ? TTY.bool_int_err.split("\n") : [
            "ERROR: column \"bajarildi\" is of type boolean but expression is of type integer",
            "HINT: You will need to rewrite or cast the expression."
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L4', 'harflariga'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("POSTGRESQL QAT'IY TIP NAZORATI", 310, 750, C.orange, kDesc, 22);
      text("• 'no', 'on', 'yes', 'off', '1', '0' kabi matnlar avtomatik boolean ga o'girildi va chiqishda 't' va 'f' bo'ldi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Ammo butun son (2) kiritilganda PostgreSQL uni qabul qilmadi va darhol qat'iy xato berdi!", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• MySQL da esa 2 bemalol yozilib ketadi (buni keyingi dialektlar qismida ko'ramiz).", 180, 905, { size: 22, color: C.blue, weight: 600, wrap: 1560 });
    });
  }

  // 3. BOOL_NULL: WHERE filtri tuzog'i
  function sBoolNull(t) {
    heading("Boolean va NULL: WHERE Filtri Tuzog'i", t, L('L5').s - 0.4);

    const k1 = P(t, W('L5', 'bajarildi'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: WHERE bajarildi va WHERE NOT", [{
        b: {
          cmd: "SELECT nom FROM vazifalar WHERE bajarildi;\nSELECT nom FROM vazifalar WHERE NOT bajarildi;",
          out: [
            "   nom   ",
            "---------",
            " xat     ",
            " hisobot ",
            "(2 rows)",
            "",
            "   nom    ",
            "----------",
            " qongiroq ",
            "(1 row)",
            "",
            "# 'sinov' (NULL) qatori ikkalasiga ham tushmadi!"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L7', 'shartidan'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: To'g'ri yechim — IS NOT TRUE", [{
        b: {
          cmd: "SELECT nom, bajarildi IS NOT TRUE AS bajarilmagan\nFROM vazifalar;",
          out: [
            "   nom    | bajarilmagan ",
            "----------+--------------",
            " xat      | f",
            " qongiroq | t",
            " hisobot  | f",
            " sinov    | t",
            "(4 rows)",
            "",
            "# Endi 'sinov' (NULL) ham to'g'ri hisobga olindi!"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L6', 'noma’lum'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("ENG KATTA TUZOQ: NOT NULL HAM NULL BO'LADI!", 380, 750, C.red, kDesc, 22);
      text("• SQL da WHERE sharti faqat ROST (TRUE) bo'lgan qatorlarni qaytaradi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Agar qiymat NULL bo'lsa: NOT NULL ham noma'lum (NULL) bo'lib qoladi va WHERE NOT uni tashlab yuboradi!", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• 'Bajarilmaganlar yoki noma'lumlar' kerak bo'lsa: doimo WHERE bajarildi IS NOT TRUE deb yozing!", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 4. UUID_SINOV
  function sUuidSinov(t) {
    heading("UUIDv4 va UUIDv7: Hajm va Vaqt Tamg'asi", t, L('L8').s - 0.4);

    const k1 = P(t, W('L8', 'uuidv7'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: uuidv7 va vaqtni ajratish", [{
        b: {
          cmd: "SELECT uuid_extract_version(uuidv4()) AS v4_ver,\n       uuid_extract_version(uuidv7()) AS v7_ver;\nSELECT uuid_extract_timestamp(uuidv7()) AS vaqt;",
          out: [
            " v4_ver | v7_ver ",
            "--------+--------",
            "      4 |      7 ",
            "(1 row)",
            "",
            "            vaqt            ",
            "----------------------------",
            " 2026-10-12 10:36:23.508+05 ",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L10', 'olti'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: Diskdagi hajm solishtiruvi", [{
        b: {
          cmd: "SELECT pg_column_size(uuidv4()) AS uuid_bayt,\n       pg_column_size(uuidv4()::text) AS matn_bayt;",
          out: (TTY.uuid_demo?.split("\n\n")[1] ? TTY.uuid_demo.split("\n\n")[1].split("\n") : [
            " uuid_bayt | matn_bayt ",
            "-----------+-----------",
            "        16 |        40 ",
            "(1 row)"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    const kDesc = P(t, W('L10', 'matn'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#eff6ff', col: C.blue, p: kDesc });
      pill("UUIDv7 VA SAQLASH HAJMI SABOQLARI", 300, 750, C.blue, kDesc, 22);
      text("• UUIDv7 ichida millisekundgacha bo'lgan vaqt mavjud. Shuning uchun qiymatlar o'sib boradi va indeksni sekinlashtirmaydi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• uuid tipida saqlaganda atigi 16 bayt! Uni varchar(36) yoki text deb saqlash esa 40 bayt oladi.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
      text("• 10 million qatorda bu qo'shimcha 240 MB degani! Doimo maxsus uuid tipidan foydalaning.", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 5. ENUM_SINOV
  function sEnumSinov(t) {
    heading("Enum Amalda: Tartib va ALTER TYPE", t, L('L11').s - 0.4);

    const k1 = P(t, W('L11', 'holatlarini'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: CREATE TYPE va ORDER BY", [{
        b: {
          cmd: "CREATE TYPE holat AS ENUM ('yangi', 'jarayonda', 'yopildi');\nCREATE TABLE murojaatlar (id int, h holat);\nINSERT INTO murojaatlar VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');\nSELECT * FROM murojaatlar ORDER BY h;\nINSERT INTO murojaatlar VALUES (4, 'bekor');",
          out: [
            " id |     h     ",
            "----+-----------",
            "  2 | yangi     ",
            "  3 | jarayonda ",
            "  1 | yopildi   ",
            "(3 rows)",
            "",
            "ERROR: invalid input value for enum holat: \"bekor\""
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L13', 'kengaydi'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: ALTER TYPE ADD VALUE", [{
        b: {
          cmd: "ALTER TYPE holat ADD VALUE 'bekor' BEFORE 'yopildi';\nSELECT enum_range(NULL::holat);",
          out: (TTY.enum_alter ? [
            "ALTER TYPE",
            "           enum_range            ",
            "---------------------------------",
            " {yangi,jarayonda,bekor,yopildi} ",
            "(1 row)"
          ] : [
            "ALTER TYPE",
            "{yangi,jarayonda,bekor,yopildi}"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L12', 'tartiblandi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#f8fafc', col: C.green, p: kDesc });
      pill("ENUMNING ICHKI TARTIBI VA O'ZGARISHI", 310, 750, C.green, kDesc, 22);
      text("• ORDER BY h qilganda 'yopildi' alifbo bo'yicha emas, e'lon qilingan ro'yxat oxirida bo'lgani uchun oxirida chiqdi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• 'bekor' so'zi ro'yxatda bo'lmagani uchun darhol qat'iy xato berib, so'rovni bekor qildi.", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• ALTER TYPE ... ADD VALUE 'bekor' BEFORE 'yopildi' orqali yangi statusni aniq o'rniga qo'shish mumkin!", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Terminal Saboqlari", t, L('L14').s - 0.4);

    const pillars = [
      { tit: "boolean va IS NOT TRUE", sub: "NULL qatorlarni tashlab ketmaslik uchun WHERE filtrlashda IS NOT TRUE shartini unutmang.", col: C.blue, at: W('L14', 'null') },
      { tit: "uuidv7 kelajak kaliti", sub: "UUIDv7 vaqt tartibiga ega bo'lib, B-Tree indekslarida eng yuqori unumdorlik beradi.", col: C.purple, at: W('L14', 'uuidv7') },
      { tit: "enum e'lon tartibi", sub: "Enum qiymatlari alifbo emas, siz belgilagan tartibda solishtiriladi va saralanadi.", col: C.green, at: W('L14', 'tartibini') },
      { tit: "Dialektlar va tuzoqlar", sub: "Keyingi qismda MySQL TINYINT(1) tuzog'i va SQLite dagi holatlarni ko'rib chiqamiz.", col: C.orange, at: L('L15').s }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, p.at, 0.5);
      withA(k, () => {
        const x = 140 + (i % 2) * 840, y = 260 + Math.floor(i / 2) * 330;
        card(x, y, 800, 280, { fill: C.card, col: p.col, p: k });
        pill(p.tit, x + 240, y + 55, p.col, k, 22);
        text(p.sub, x + 40, y + 130, { size: 23, color: C.ink, wrap: 720 });
      });
    });
  }

  // Asosiy chizish funksiyasi
  function draw(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.bool_sinov.s) sIntro(t);
    else if (t < sc.bool_null.s) sBoolSinov(t);
    else if (t < sc.uuid_sinov.s) sBoolNull(t);
    else if (t < sc.enum_sinov.s) sUuidSinov(t);
    else if (t < sc.xulosa.s) sEnumSinov(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("9-bob: Boolean, UUID va Enum — Jonli Kod", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("psql da boolean literal, NULL filtri, uuidv7 va enum amallari", 960, 290, { size: 40, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("boolean & NULL", 180, 440, { size: 32, color: C.blue });
    text("• 'yes', 'on', 'no' -> t / f\n• 2 int -> XATO!\n• WHERE NOT bajarildi\n  (NULL tushib qoladi!)\n• IS NOT TRUE qutqaradi", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("POSTGRES BOOLEAN", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("UUIDv7 va Hajm", 750, 440, { size: 32, color: C.purple });
    text("• uuidv7() yangi funksiya\n• extract_timestamp(v7)\n• uuid tipi: 16 bayt\n• text tipi: 40 bayt\n• 2.5 baravar ixcham!", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("UUIDv7 STORAGE", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("Enum Amallari", 1320, 440, { size: 32, color: C.green });
    text("• CREATE TYPE holat ENUM\n• Tartib: e'lon ketma-ketligi\n• ORDER BY h to'g'ri ishlaydi\n• Ro'yxatdan tashqari xato\n• ADD VALUE BEFORE", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("ENUM LOGIC", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
