// SQL 7-bob 2-qism: "Kod" — Terminalda jonli sinovlar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, codeCard, outCard, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  const TTY = window.TTY?.pg || {};

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("7-bob: Matn va Binary", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("psql da Jonli Sinovlar", 960, 370, { size: 96, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18.6 terminalida amaliy buyruqlar", 960, 480, { size: 48, align: 'center', p: P(t, 1.2, 1.2) });
    marker(480, 520, 960 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L2', 'tekst'), 0.8);
    withA(kBadges, () => {
      pill("char(4) va varchar(5)", 440, 640, C.blue, kBadges, 24);
      pill("UTF-8 va Oʻzbekiston", 960, 640, C.purple, kBadges, 24);
      pill("Nol bayt va bytea", 1460, 640, C.green, kBadges, 24);
    });

    const kDesc = P(t, W('L1', 'ikkilik'), 0.8);
    withA(kDesc, () => {
      card(280, 740, 1360, 200, { fill: C.card, col: C.blue, p: kDesc });
      text("Uzunlik xatolari, probellar bilan to'ldirish va solishtirish farqi", 960, 800, { size: 28, weight: 700, align: 'center', color: C.ink });
      text("Nega 'O''zbek' ≠ 'Oʻzbek' va fayllarni nega matn ustuniga yozib bo'lmaydi?", 960, 860, { size: 25, align: 'center', color: C.soft });
    });
  }

  // 2. CHAR & VARCHAR
  function sCharVarchar(t) {
    heading("char(4), varchar(5), text va Uzunlik Xatosi", t, L('L3').s - 0.4);

    const k1 = P(t, W('L4', 'to‘qqiz'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 430, "1. varchar(5) ga 'juda uzun' yozilsa: XATO!", [{
        b: {
          cmd: "CREATE TABLE matnlar (c char(4), v varchar(5), t text);\nINSERT INTO matnlar (v) VALUES ('juda uzun');",
          out: [(TTY.ins_too_long_err || "ERROR:  value too long for type character varying(5)")]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L5', 'probellar'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 430, "2. Probellar va CAST bilan kesish", [{
        b: {
          cmd: "INSERT INTO matnlar (v) VALUES ('salom   '), ('juda uzun'::varchar(5));\nSELECT '(' || c || ')' AS c, '(' || v || ')' AS v, octet_length(v) AS bayt\nFROM matnlar;",
          out: (TTY.sel_matnlar || "  c   | c_uzunlik |    v    | bayt \n------+-----------+---------+------\n (ok) |         2 | (ok)    |    2\n      |           | (salom) |    5\n      |           | (juda ) |    5\n(3 rows)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L6', 'kast'), 0.5);
    withA(kDesc, () => {
      card(140, 690, 1640, 260, { fill: C.card, col: C.blue, p: kDesc });
      hand("Uzunlik Cheklovi Qoidalari", 180, 745, { size: 30, color: C.blue, p: kDesc });
      text("• 'juda uzun' (9 belgi) varchar(5) ga sig'madi — PostgreSQL qat'iy xato berib, so'rovni bekor qildi.", 180, 800, { size: 22, color: C.ink });
      text("• 'salom   ' (8 belgi) — ortiqcha qismi faqat probellardan iborat bo'lgani sababli jimgina kesildi.", 180, 845, { size: 22, color: C.green, weight: 600 });
      text("• 'juda uzun'::varchar(5) — aniq CAST o'girmasi orqali ortiqcha belgilar xatosiz kesildi ('juda ').", 180, 890, { size: 22, color: C.blue, weight: 700 });
    });
  }

  // 3. PROBEL CMP
  function sProbelCmp(t) {
    heading("Probellar Bilan Solishtirish: char vs varchar", t, L('L7').s - 0.4);

    const k1 = P(t, W('L7', 'rost'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 430, "1. char(4) va varchar tenglik sinovi", [{
        b: {
          cmd: "SELECT 'ab'::char(4) = 'ab  '::char(4) AS char_teng,\n       'ab'::varchar = 'ab  '::varchar AS varchar_teng;",
          out: (TTY.char_vs_varchar_cmp || " char_teng | varchar_teng \n-----------+--------------\n t         | f\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L8', 'yolg‘on'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 430, { fill: C.card, col: C.purple, p: k2 });
      hand("Nega birida TRUE, ikkinchisida FALSE?", 1020, 290, { size: 32, color: C.purple, p: k2 });

      card(1020, 340, 720, 110, { fill: '#fff', col: C.green, p: k2 });
      text("char(4): 'ab  '  =  'ab  '  -->  ROST (t)", 1050, 395, { size: 24, fam: MONO, weight: 700, color: C.green });

      card(1020, 470, 720, 110, { fill: '#fff', col: C.red, p: k2 });
      text("varchar: 'ab'    ≠  'ab  '  -->  YOLG'ON (f)", 1050, 525, { size: 24, fam: MONO, weight: 700, color: C.red });

      text("char oxiridagi probellarni tenglikda yutadi, varchar da esa ular muhim!", 1020, 625, { size: 21, color: C.soft, wrap: 720 });
    });

    const kDesc = P(t, W('L8', 'probel'), 0.5);
    withA(kDesc, () => {
      card(140, 690, 1640, 260, { fill: '#eff6ff', col: C.blue, p: kDesc });
      hand("Amaliy Xulosa va Qidiruvdagi Xavf", 180, 745, { size: 30, color: C.blue, p: kDesc });
      text("• char(4) da diskda 'ab  ' saqlansa ham, solishtirishda oxirgi probellar tashlab yuboriladi.", 180, 800, { size: 22, color: C.ink });
      text("• varchar da esa foydalanuvchi adashib kiritgan probel ('Ali ') qidiruvda oddiy 'Ali' ga teng kelmaydi!", 180, 845, { size: 22, weight: 700, color: C.red });
      text("• Shuning uchun ilovada matn kiritishda har doim trim() qilish yoki CHECK cheklovi qo'yish kerak.", 180, 890, { size: 22, weight: 600, color: C.blue });
    });
  }

  // 4. BELGI VA BAYT
  function sBelgiBayt(t) {
    heading("Belgi va Bayt: UTF-8 va Tutuq Belgisi (ʻ)", t, L('L9').s - 0.4);

    const k1 = P(t, W('L9', 'oktet'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 430, "1. char_length vs octet_length", [{
        b: {
          cmd: "SELECT char_length('Oʻzbekiston') AS belgi,\n       octet_length('Oʻzbekiston') AS bayt;\nSELECT 'O''zbek' = 'Oʻzbek' AS bir_xilmi;",
          out: [
            " belgi | bayt ",
            "-------+------",
            "    11 |   12",
            "(1 row)",
            "",
            " bir_xilmi ",
            "-----------",
            " f",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L10', 'tutuq'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 430, { fill: C.card, col: C.teal, p: k2 });
      hand("Oʻzbek Tili Lotin Alifbosi Siri", 1020, 290, { size: 32, color: C.teal, p: k2 });

      card(1020, 340, 720, 100, { fill: '#fff', col: C.blue, p: k2 });
      text("ʻ (U+02BB modifier letter turn comma) = 2 bayt", 1045, 395, { size: 22, fam: MONO, weight: 700, color: C.blue });

      card(1020, 460, 720, 100, { fill: '#fff', col: C.orange, p: k2 });
      text("' (U+0027 apostrophe / oddiy tirnoq)  = 1 bayt", 1045, 515, { size: 22, fam: MONO, weight: 700, color: C.orange });

      text("• Ko'rinishi o'xshash, lekin ikkalasi MUTLAQO BOSHQA belgi!", 1020, 595, { size: 22, weight: 700, color: C.red });
      text("• Shu sababli 'O''zbek' = 'Oʻzbek' natijasi FALSE chiqadi.", 1020, 635, { size: 21, color: C.soft });
    });

    const kDesc = P(t, W('L10', 'tirnoqqa'), 0.5);
    withA(kDesc, () => {
      card(140, 690, 1640, 260, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("QIDIRUVNING ISHLAMAY QOLISHI", 300, 740, C.orange, kDesc, 22);
      text("• Agar foydalanuvchi qidiruvda klaviaturadagi oddiy tirnoqni yozsa ('O'zbekiston'),", 180, 795, { size: 23, color: C.ink });
      text("• Bazada esa to'g'ri o'zbekcha tutuq belgisi bilan saqlangan bo'lsa ('Oʻzbekiston') — qidiruv HECH NARSA TOPMAYDI!", 180, 840, { size: 23, weight: 700, color: C.red });
      text("• Yechim: Ilova kiritish qismida tutuq belgilarini bitta standart shaklga normallashtirish shart.", 180, 885, { size: 22, weight: 600, color: C.blue });
    });
  }

  // 5. NUL & BYTEA
  function sNulBytea(t) {
    heading("Nol Bayt (NUL) Xatosi va bytea Imkoniyatlari", t, L('L11').s - 0.4);

    const k1 = P(t, W('L11', 'xatosini'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 430, "1. Matnga nol bayt yozilsa: XATO!", [{
        b: {
          cmd: "SELECT E'a\\000b';",
          out: [(TTY.nul_err || "ERROR:  invalid byte sequence for encoding \"UTF8\": 0x00")]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L12', 'baytea'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 430, "2. bytea: Hex format va nol baytlar", [{
        b: {
          cmd: "CREATE TABLE fayllar (nom text, mazmun bytea);\nINSERT INTO fayllar VALUES ('salom.txt', 'Salom'::bytea), ('nol', '\\x00ff10'::bytea);\nSELECT nom, mazmun, length(mazmun) AS bayt FROM fayllar;\nSELECT upper('Salom'::bytea);",
          out: [
            "    nom    |    mazmun    | bayt ",
            "-----------+--------------+------",
            " salom.txt | \\x53616c6f6d |    5",
            " nol       | \\x00ff10     |    3",
            "(2 rows)",
            "",
            "ERROR:  function upper(bytea) does not exist"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L13', 'apper'), 0.5);
    withA(kDesc, () => {
      card(140, 690, 1640, 260, { fill: C.card, col: C.green, p: kDesc });
      hand("Binary Satrning Maxsus Qoidalari", 180, 745, { size: 30, color: C.green, p: kDesc });
      text("• Matn turlariga nol bayt (0x00) kiritib bo'lmaydi. C tili uni satr oxiri deb o'ylaydi.", 180, 800, { size: 22, color: C.ink });
      text("• bytea tipi esa rasm, PDF, kalit va har qanday xom baytni (jumladan nol baytlarni) bexato saqlaydi.", 180, 845, { size: 22, color: C.green, weight: 600 });
      text("• Unda upper() yoki lower() mavjud emas — kompyuter baytlarning harf yoki raqam ekanini bilmaydi!", 180, 890, { size: 22, weight: 700, color: C.red });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L14').s - 0.4);

    const pillars = [
      { tit: "varchar cheklovi", val: "Uzun matn kelganda qat'iy xato beradi. Probellar esa standart bo'yicha jimgina kesiladi.", col: C.blue },
      { tit: "char tengligi", val: "Diskda probellar bo'lsa ham, tenglikda hisobga olinmaydi. varchar da esa ma'noga ega.", col: C.purple },
      { tit: "Belgi va bayt", val: "char_length belgilarni sanaydi. Oʻzbekcha tutuq belgisi (ʻ) UTF-8 da 2 bayt joy oladi.", col: C.orange },
      { tit: "bytea va nollar", val: "Matnga 0x00 kiritib bo'lmaydi. Fayllar va shifrlangan baytlar uchun faqat bytea ishlatiladi.", col: C.green }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L14', 'chegarani') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 250;
        card(x, y, 380, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 30, y + 60, { size: 30, color: p.col, p: k });
        text(p.val, x + 30, y + 150, { size: 23, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L15', 'tuzoqni'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 3-qismda: MySQL va SQLite Dialektlari", 180, 780, { size: 36, color: C.blue, p: kNext });
      text("MySQL da qator hajmi (65535 bayt) chegarasi, TEXT va BLOB oilalari, SQLite Type Affinity va 6 ta tipik tuzoqni ko'ramiz.", 180, 845, { size: 24, color: C.ink, wrap: 1560 });
      pill("07-3 DIALEKTLAR", 1580, 780, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.char_varchar.s) sIntro(t);
    else if (t < TM.scenes.probel_cmp.s) sCharVarchar(t);
    else if (t < TM.scenes.belgi_bayt.s) sProbelCmp(t);
    else if (t < TM.scenes.nul_bytea.s) sBelgiBayt(t);
    else if (t < TM.scenes.xulosa.s) sNulBytea(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("7-bob: Matn va Binary — Kod", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("PostgreSQL 18.6 psql terminalida jonli sinovlar", 960, 300, { size: 44, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.blue });
    hand("Uzunlik va Xatolar", 180, 460, { size: 34, color: C.blue });
    text("• varchar(5): ortiqchaga xato\n• Probellar jimgina kesiladi\n• ::varchar(5) bilan CAST\n• char(4) probel to'ldiradi\n• char tenglikda probelni yutadi", 180, 540, { size: 21, fam: MONO, color: C.ink });
    pill("CHAR & VARCHAR", 390, 830, C.blue, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.purple });
    hand("Belgi va Bayt", 750, 460, { size: 34, color: C.purple });
    text("• char_length: 11 belgi\n• octet_length: 12 bayt\n• Tutuq belgisi (ʻ) 2 bayt\n• Oddiy tirnoq (') 1 bayt\n• 'O''zbek' ≠ 'Oʻzbek'", 750, 540, { size: 21, fam: MONO, color: C.ink });
    pill("UTF-8 & OʻZBEKISTON", 960, 830, C.purple, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.green });
    hand("Nol Bayt va bytea", 1320, 460, { size: 34, color: C.green });
    text("• Matnda NUL (\\000) taqiqlangan\n• bytea da nol bayt saqlanadi\n• Ekranda hex (\\x53616c...)\n• upper(bytea) xato beradi\n• Rasmlar uchun bytea shart", 1320, 540, { size: 21, fam: MONO, color: C.ink });
    pill("BYTEA VA NUL", 1530, 830, C.green, 1, 20);

    pill("PostgreSQL 18.6 psql", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
