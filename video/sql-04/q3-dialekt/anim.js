// SQL 4-bob 3-qism: "Dialektlar" — MySQL, SQLite va 6 ta tipik sintaksis xatosi
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("4-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Dialektlar va Tipik Xatolar", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL · MySQL 9.7 · SQLite 3.54", 960, 510, { size: 54, align: 'center', p: P(t, 1.2, 1.2) });
    marker(480, 550, 960 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'postgres'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL 18.6", 640, 680, C.blue, kBadges, 28);
      pill("MySQL 9.7.2", 960, 680, C.orange, kBadges, 28);
      pill("SQLite 3.54.0", 1280, 680, C.teal, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'tuzoqni'), 0.8);
    withA(kDesc, () => {
      card(380, 780, 1160, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Backtick, lower_case_table_names, 64 belgi, binary 0xFF va 5--1", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Tizimlararo ko'chirishda uchraydigan 6 ta eng xavfli sintaksis xatosi va yechimlari", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. IDENTIFIERS & CASE
  function sIdentifiersCase(t) {
    heading("Identifikatorlar va Katta-kichik harf", t, L('L2').s - 0.4);

    // O'rash usullari
    const kWrap = P(t, W('L2', 'bektik'), 0.5);
    withA(kWrap, () => {
      table(140, 230, "Identifikatorlarni o'rash va Kalit so'zni nom qilish", [
        { label: 'Tizim', w: 280 },
        { label: "Standart o'rash", w: 420 },
        { label: "Boshqa usullar", w: 460 },
        { label: "Misol", w: 480 }
      ], [
        ['PostgreSQL', '"nom" (qo\'shtirnoq)', 'Yo\'q (faqat qo\'shtirnoq)', 'CREATE TABLE "order" (id int);'],
        ['MySQL 9.7', '`nom` (backtick)', '"nom" faqat ANSI_QUOTES da', 'CREATE TABLE `order` (id int);'],
        ['SQLite 3.54', '"nom" (standart)', '[nom] (MS Access), `nom` (MySQL)', 'CREATE TABLE [order] (id int);']
      ], { p: kWrap });
    });

    // lower_case_table_names va Linux tuzog'i
    const kCase = P(t, W('L4', 'lower'), 0.5);
    withA(kCase, () => {
      card(140, 590, 1640, 370, { fill: '#fff9e6', col: C.orange, p: kCase });
      pill("DIQQAT: MySQL lower_case_table_names TUZOG'I", 460, 645, C.orange, kCase, 24);
      text("MySQL serverida jadvallar nomining sezgirligi operatsion tizimga bog'liq!", 180, 705, { size: 26, weight: 700, color: C.ink });

      const osItems = [
        { os: "Linux (0)", desc: "Nom yozilganicha saqlanadi, taqqoslash QAT'IY SEZGIR. Mahsulot !== mahsulot!", col: C.red },
        { os: "Windows (1)", desc: "Nomlar kichik harfda saqlanadi, taqqoslash sezgir emas.", col: C.blue },
        { os: "macOS (2)", desc: "Nom yozilganicha saqlanadi, lekin taqqoslashda kichik harfga o'giriladi.", col: C.green }
      ];

      osItems.forEach((oi, i) => {
        const x = 180 + i * 530, y = 745;
        card(x, y, 490, 150, { fill: '#f8fafc', col: oi.col, p: kCase });
        hand(oi.os, x + 25, y + 45, { size: 28, color: oi.col, p: kCase });
        text(oi.desc, x + 25, y + 95, { size: 20, color: C.ink, wrap: 440 });
      });

      text("TAVSIYA: MySQL da baza va jadval nomlarini DOIM kichik harfda yarating!", 180, 930, { size: 22, weight: 700, color: C.red });
    });
  }

  // 3. STRINGS & LENGTH
  function sStringsLength(t) {
    heading("Nom uzunligi va Satrlar farqi", t, L('L6').s - 0.4);

    // Nom uzunligi taqqoslash
    const kLen = P(t, W('L6', 'oltmish'), 0.5);
    withA(kLen, () => {
      card(140, 230, 780, 420, { fill: C.card, col: C.blue, p: kLen });
      hand("Nom uzunligi chegarasi", 180, 285, { size: 36, color: C.blue, p: kLen });
      
      card(170, 330, 720, 140, { fill: '#eff6ff', col: C.blue, p: kLen });
      hand("PostgreSQL: 63 bayt", 195, 370, { size: 26, color: C.blue, p: kLen });
      text("63 baytdan oshgan nom rad etilmaydi, balki OGOHLANTIRISH (NOTICE) berilib, 63 belgiga jimgina qisqartiriladi.", 195, 415, { size: 20, color: C.ink, wrap: 670 });

      card(170, 490, 720, 140, { fill: '#fef2f2', col: C.red, p: kLen });
      hand("MySQL 9.7: 64 belgi", 195, 530, { size: 26, color: C.red, p: kLen });
      text("64 belgidan oshsa, qisqartirmaydi, darhol XATO beradi:\nERROR 1059 (42000): Identifier name '...' is too long", 195, 575, { size: 19, fam: MONO, color: C.red, wrap: 670 });
    });

    // Satrlar va teskari chiziq
    const kStr = P(t, W('L7', 'teskari'), 0.5);
    withA(kStr, () => {
      card(960, 230, 820, 420, { fill: C.card, col: C.green, p: kStr });
      hand("Satrlarda teskari chiziq: 'a\\nb'", 1000, 285, { size: 36, color: C.green, p: kStr });

      card(990, 330, 760, 140, { fill: '#eff6ff', col: C.blue, p: kStr });
      hand("PostgreSQL va SQLite", 1015, 370, { size: 26, color: C.blue, p: kStr });
      text("'a\\nb' oddiy satrda TO'RTTA belgi bo'lib qoladi. Teskari chiziq maxsus emas (standard_conforming_strings = on).", 1015, 415, { size: 20, color: C.ink, wrap: 710 });

      card(990, 490, 760, 140, { fill: '#fef2f2', col: C.orange, p: kStr });
      hand("MySQL 9.7", 1015, 530, { size: 26, color: C.orange, p: kStr });
      text("Teskari chiziq oddiy satrda ham MAXSUS! 'a\\nb' darhol yangi qatorga aylanadi! Qochirish uchun 'a\\\\nb' yozish kerak.", 1015, 575, { size: 20, color: C.ink, wrap: 710 });
    });

    // Terminal ko'rinish
    const kTerm = P(t, W('L8', 'yangi'), 0.5);
    term(140, 680, 1640, 280, "MySQL da satrlar va 64 belgilik chegara", [{
      b: {
        cmd: "SELECT 'Ma''ruf' AS ism, 'Ma\\'ruf' AS backslash; SELECT 'a\\nb' AS oddiy;",
        out: (TTY.mysql && TTY.mysql.strs ? TTY.mysql.strs.split("\n") : ["+--------+-----------+\n| ism    | backslash |\n+--------+-----------+\n| Ma'ruf | Ma'ruf    |\n+--------+-----------+"])
      },
      t: kTerm,
      typeDur: 1.0
    }], { font: 15 });
  }

  // 4. NUMBERS & COMMENTS & OPERATORS
  function sNumbersComments(t) {
    heading("Sonlar, Izohlar va Operatorlar", t, L('L9').s - 0.4);

    const kNum = P(t, W('L9', 'binar'), 0.5);
    withA(kNum, () => {
      table(140, 230, "Muhim farqlar: 0xFF, 1_000, 5--1 va 2 ^ 3", [
        { label: 'Ifoda', w: 220 },
        { label: 'PostgreSQL 18', w: 460 },
        { label: 'MySQL 9.7', w: 500 },
        { label: 'SQLite 3.54', w: 460 }
      ], [
        ['0xFF', '255 (butun son)', 'Binary satr (son uchun + 0 kerak)', '255 (butun son)'],
        ['1_000', '1000 (raqam ajratuvchi)', 'XATO: Unknown column (nom deb o\'ylaydi)', '1000 (raqam ajratuvchi)'],
        ['5--1', '5 (qolgan qism izoh bo\'ladi)', '6 (-- dan keyin probel yo\'q!)', '5 (qolgan qism izoh bo\'ladi)'],
        ['/*! + 1 */', 'Oddiy izoh (e\'tiborsiz)', 'MySQL BAJARADI (shartli izoh)', 'Oddiy izoh (e\'tiborsiz)'],
        ['2 ^ 3', '8 (darajaga ko\'tarish)', '1 (bitli XOR amali!)', '— (funksiya kerak)']
      ], { p: kNum });
    });

    // Terminal ko'rgazma: MySQL natijalari
    const kTerm = P(t, W('L11', 'probel'), 0.5);
    term(140, 620, 1640, 330, "MySQL 9.7 da 0xFF, 5--1 va 2 ^ 3 sinovlari", [{
      b: {
        cmd: "SELECT 0xFF + 0 AS hex_son; SELECT 5--1 AS natija; SELECT 2 ^ 3 AS xor_natija, POW(2, 3) AS daraja;",
        out: [
          "+---------+",
          "| hex_son |",
          "+---------+",
          "|     255 |",
          "+---------+",
          "+--------+",
          "| natija |",
          "+--------+",
          "|      6 |",
          "+--------+",
          "+------------+--------+",
          "| xor_natija | daraja |",
          "+------------+--------+",
          "|          1 |      8 |",
          "+------------+--------+"
        ]
      },
      t: kTerm,
      typeDur: 1.0
    }], { font: 16 });
  }

  // 5. TRAPS (6 ta tipik xato)
  function sTraps(t) {
    heading("6 ta tipik sintaksis xatosi", t, L('L13').s - 0.4);

    const traps = [
      { num: "1", tit: "\"Mahsulot\" deb yaratib, Mahsulot deb chaqirish", err: "PostgreSQL mahsulot ni qidiradi va topmaydi", fix: "Nomlarni kichik harf va pastki chiziqda yozish", col: C.red },
      { num: "2", tit: "ORM yaratgan aralash nomlar (\"userId\")", err: "Har bir so'rovda qo'shtirnoq talab qiladi, unutilsa xato", fix: "ORM nomlash strategiyasini snake_case ga sozlash", col: C.orange },
      { num: "3", tit: "Kalit so'zlarni nom qilish (order, user)", err: "Har joyda o'rash talab qilinadi, ko'chirish qiyin", fix: "Boshqa nom tanlash: buyurtma, foydalanuvchi", col: C.purple },
      { num: "4", tit: "Satr ichida tirnoqni \\' bilan qochirish", err: "PostgreSQL va SQLite da ishlamaydi", fix: "Standart '' (ikkita bitta tirnoq) ishlatish", col: C.blue },
      { num: "5", tit: "a--b ifodalarini probelsiz yozish", err: "PostgreSQL va SQLite da qolgan qism izohga aylanadi", fix: "Operatorlar orasiga probel qo'yish: a - -b", col: C.green },
      { num: "6", tit: "^ belgisini hamma joyda daraja deb bilish", err: "MySQL da bu bitli XOR amali bo'lib qoladi", fix: "Standart power() yoki POW() funksiyasini ishlatish", col: C.teal }
    ];

    traps.forEach((tp, i) => {
      const col = i < 3 ? 0 : 1;
      const row = i % 3;
      const x = 140 + col * 840, y = 230 + row * 240;
      const k = P(t, W('L13', 'oltita') + i * 0.4, 0.5);

      withA(k, () => {
        card(x, y, 800, 215, { fill: C.card, col: tp.col, p: k });
        sellipse(x + 50, y + 45, 25, 25, { fill: tp.col });
        text(tp.num, x + 50, y + 53, { size: 24, weight: 700, color: '#fff', align: 'center', fam: MONO });

        hand(tp.tit, x + 90, y + 50, { size: 24, color: tp.col, p: k });
        text("XATO: " + tp.err, x + 30, y + 105, { size: 20, color: C.red, wrap: 740 });
        text("YECHIM: " + tp.fix, x + 30, y + 160, { size: 20, weight: 600, color: C.green, wrap: 740 });
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Keyingi Bob", t, L('L19').s - 0.4);

    const pillars = [
      { tit: "PostgreSQL", desc: "Standartga juda yaqin. Kichik harfga o'tkazadi. 63 bayt chegara. E'...' escape va $$...$$ dollar satr.", col: C.blue },
      { tit: "MySQL 9.7", desc: "Backtick `...`. lower_case_table_names (Linux xavfi). Oddiy satrda \\n maxsus. 0xFF binar satr.", col: C.orange },
      { tit: "SQLite 3.54", desc: "Ixcham va moslashuvchan: \"...\", `...`, [...]. Ichma-ich izoh yo'q. Case-insensitive jadvallar.", col: C.teal }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L19', 'yakunladik') + i * 0.4, 0.6);
      withA(k, () => {
        const x = 140 + i * 560, y = 240;
        card(x, y, 520, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 40, y + 70, { size: 36, color: p.col, p: k });
        text(p.desc, x + 40, y + 160, { size: 24, color: C.ink, wrap: 440 });
        pill("4-bob yakunlandi", x + 260, y + 360, p.col, k, 20);
      });
    });

    const kNext = P(t, W('L20', 'beshinchi'), 0.6);
    withA(kNext, () => {
      card(140, 710, 1640, 190, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 5-bob: Baza, Sxema va Jadval", 180, 775, { size: 38, color: C.blue, p: kNext });
      text("Ma'lumotlar bazasi ierarxiyasi: Klaster ichida Baza, Baza ichida Sxema, Sxema ichida Jadvallar. search_path va xavfsiz tuzilma.", 180, 840, { size: 26, color: C.ink });
      pill("05-BOB", 1600, 775, C.blue, kNext, 24);
    });
  }

  function render(t) {
    bg();
    if (t < TM.scenes.identifiers_case.s) sIntro(t);
    else if (t < TM.scenes.strings_length.s) sIdentifiersCase(t);
    else if (t < TM.scenes.numbers_comments.s) sStringsLength(t);
    else if (t < TM.scenes.traps.s) sNumbersComments(t);
    else if (t < TM.scenes.xulosa.s) sTraps(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("4-bob: SQL sintaksisi — Dialektlar", 960, 220, { size: 80, align: 'center', color: C.blue });
    hand("PostgreSQL · MySQL 9.7 · SQLite 3.54 taqqoslash doskasi", 960, 320, { size: 48, align: 'center', color: C.ink });

    card(140, 420, 500, 460, { fill: C.card, col: C.blue });
    hand("PostgreSQL 18.6", 180, 480, { size: 34, color: C.blue });
    text("• \"nom\" qo'shtirnoq\n• 63 bayt chegara (NOTICE)\n• E'\\n' escape, $$...$$\n• 2 ^ 3 ^ 2 = 64 (chapdan)", 180, 550, { size: 22, fam: MONO, color: C.ink });
    pill("\"nom\" | 63 bayt | E'\\n'", 390, 810, C.blue, 1, 20);

    card(710, 420, 500, 460, { fill: C.card, col: C.orange });
    hand("MySQL 9.7.2", 750, 480, { size: 34, color: C.orange });
    text("• `nom` backtick\n• lower_case_table_names\n• 64 belgidan oshsa XATO\n• 2 ^ 3 = 1 (bitli XOR!)", 750, 550, { size: 22, fam: MONO, color: C.ink });
    pill("`nom` | 64 limit | 2^3=1", 960, 810, C.orange, 1, 20);

    card(1280, 420, 500, 460, { fill: C.card, col: C.teal });
    hand("SQLite 3.54.0", 1320, 480, { size: 34, color: C.teal });
    text("• \"nom\", `nom`, [nom]\n• Ichma-ich izoh yo'q\n• 1_000_000 va 0xFF son\n• Jadvallar case-insensitive", 1320, 550, { size: 22, fam: MONO, color: C.ink });
    pill("[nom] | 1_000_000", 1530, 810, C.teal, 1, 20);

    pill("6 ta tipik xato va professional yechimlar", 960, 970, C.red, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
