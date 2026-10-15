// SQL 7-bob 3-qism: "Dialektlar" — MySQL, SQLite va 6 ta tipik xato
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
    hand("7-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Matn va Binary: Dialektlar", 960, 360, { size: 85, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL, SQLite va 6 ta Tipik Xato", 960, 470, { size: 50, align: 'center', p: P(t, 1.2, 1.2) });
    marker(500, 510, 920 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'may'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: 65 535 bayt & TEXT", 480, 630, C.orange, kBadges, 26);
      pill("SQLite: VARCHAR & NUL", 960, 630, C.green, kBadges, 26);
      pill("6 ta xavfli xato", 1420, 630, C.red, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'oltita'), 0.8);
    withA(kDesc, () => {
      card(240, 730, 1440, 210, { fill: C.card, col: C.red, p: kDesc });
      text("MySQL dagi umumiy qator chegarasi, SQLite dagi erkin tiplash,", 960, 790, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("katta-kichik harf farqlari va amaliyotdagi jiddiy tuzoqlarni ko'rib chiqamiz", 960, 850, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. MYSQL
  function sMysql(t) {
    heading("MySQL: Qator hajmi (65 535 B) va TEXT oilasi", t, L('L2').s - 0.4);

    // Terminal 1: Qator hajmi chegarasi (Row size too large)
    const k1 = P(t, W('L3', 'oltmish'), 0.5);
    withA(k1, () => {
      term(120, 220, 810, 380, "1. Qator hajmi chegarasi (65 535 bayt)", [{
        b: {
          cmd: "CREATE TABLE katta (\n  a VARCHAR(16000),\n  b VARCHAR(16000)\n);",
          out: (TTY.mysql && TTY.mysql.rowsize_err ? TTY.mysql.rowsize_err.split("\n") : [
            "ERROR 1118 (42000): Row size too large.",
            "The maximum row size for the used table type,",
            "not counting BLOBs, is 65535. Change some columns to TEXT."
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Terminal 2: TEXT/BLOB da DEFAULT taqiqlangan & Collation _ci
    const k2 = P(t, W('L4', 'difolt'), 0.5);
    withA(k2, () => {
      term(970, 220, 830, 380, "2. BLOB DEFAULT xatosi va Collation", [{
        b: {
          cmd: "CREATE TABLE b (x BLOB DEFAULT 'a');\nSELECT 'Salom' = 'salom' AS teng;",
          out: (TTY.mysql && TTY.mysql.blob_def_err ? [
            TTY.mysql.blob_def_err,
            "+------+",
            "| teng |",
            "+------+",
            "|    1 |",
            "+------+"
          ] : [
            "ERROR 1101 (42000): BLOB/TEXT column can't have default value",
            "+------+",
            "| teng |",
            "+------+",
            "|    1 |",
            "+------+"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Pastdagi tushuntirish
    const kExplain = P(t, W('L5', 'tashqari'), 0.6);
    withA(kExplain, () => {
      card(120, 630, 1680, 350, { fill: C.card, col: C.orange, p: kExplain });
      pill("MYSQL DA MATN VA BINAR XUSUSIYATLARI", 380, 680, C.orange, kExplain, 22);

      text("• Qator hajmi 65 535 bayt: utf8mb4 da 16000 belgi 64 000 baytgacha yetadi. Ikkita katta VARCHAR sig'maydi!", 160, 735, { size: 22, weight: 700, color: C.red });
      text("• TEXT oilasi: TINYTEXT (255 B), TEXT (64 KB), MEDIUMTEXT (16 MB), LONGTEXT (4 GB). DEFAULT berib bo'lmaydi!", 160, 785, { size: 22, color: C.ink });
      text("• Sukut bo'yicha Collation: utf8mb4_0900_ai_ci katta-kichik harfni farqlamaydi ('Salom' = 'salom' rost!).", 160, 835, { size: 22, weight: 600, color: C.green });
      text("• CHAR va VARCHAR: CHAR(n) o'qishda probellarni olib tashlaydi, VARCHAR esa oxirgi probellarni saqlaydi.", 160, 885, { size: 21, color: C.soft });

      card(160, 915, 1600, 50, { fill: '#fff', col: C.orange, p: kExplain });
      text("VARCHAR(n) — belgilar soni, lekin umumiy qator hajmi (65 535 bayt) jadvallarni cheklaydi!", 180, 943, { size: 19, fam: MONO, weight: 600, color: C.orange });
    });
  }

  // 3. SQLITE
  function sSqlite(t) {
    heading("SQLite: Type Affinity va Cheksiz VARCHAR", t, L('L6').s - 0.4);

    // Chap tomon: Terminal: VARCHAR(5) ga 18 belgi yozish
    const k1 = P(t, W('L6', 'qat‘iy'), 0.5);
    withA(k1, () => {
      term(120, 220, 820, 400, "1. VARCHAR(5) ga uzun matn kiritish", [{
        b: {
          cmd: "CREATE TABLE matnlar (c CHAR(4), v VARCHAR(5));\nINSERT INTO matnlar VALUES ('ab', 'juda ham uzun matn');\nSELECT '(' || c || ')' AS c, v, length(v) AS len, typeof(v) AS tip\nFROM matnlar;",
          out: (TTY.sqlite && TTY.sqlite.out ? TTY.sqlite.out.split("\n").slice(0, 5) : [
            " c            v           len  tip ",
            "----  ------------------  ---  ----",
            "(ab)  juda ham uzun matn   18  text"
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    // O'ng tomon: BLOB literali va NUL bayti
    const k2 = P(t, W('L8', 'nol'), 0.5);
    withA(k2, () => {
      term(980, 220, 820, 400, "2. BLOB literali va NUL baytlari", [{
        b: {
          cmd: "SELECT x'53616C6F6D' AS blob, typeof(x'53616C6F6D') AS tip;\n-- SQLite matn ichida nol baytlarni (0x00) bemalol qabul qiladi:\nSELECT 'a' || char(0) || 'b' AS nul_matn;",
          out: [
            "blob   tip ",
            "-----  ----",
            "Salom  blob",
            "",
            "nul_matn: 'a\\0b' (PostgreSQL da bu qat'iy xato beradi!)"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Pastki xulosa
    const kFoot = P(t, W('L7', 'milliard'), 0.5);
    withA(kFoot, () => {
      card(120, 650, 1680, 330, { fill: C.card, col: C.green, p: kFoot });
      hand("SQLite da Matn va Binary Qoidalari", 160, 705, { size: 30, color: C.green, p: kFoot });
      text("• Qavsdagi uzunlik e'tiborsiz: VARCHAR(5) yozsangiz ham 18 ta belgi xatosiz yoziladi. Faqat 1 GB limit bor.", 160, 760, { size: 22, color: C.ink });
      text("• CHAR(n) probel bilan to'ldirmaydi (padding yo'q). Binar ma'lumotlar uchun esa x'...' literali bor.", 160, 810, { size: 22, color: C.ink });
      text("• Muhim: Agar uzunlikni cheklash kerak bo'lsa, CHECK (length(nom) <= 5) shartini qo'yish kerak!", 160, 860, { size: 22, weight: 700, color: C.red });
      text("• Matnda NUL baytlari: SQLite ruxsat beradi, PostgreSQL da esa invalid byte sequence xatosi chiqadi.", 160, 910, { size: 21, color: C.soft });
    });
  }

  // 4. COMPARISON TABLE
  function sComparison(t) {
    heading("Uch Tizim Taqqoslash Taxtasi", t, L('L9').s - 0.4);

    const kTable = P(t, W('L9', 'uchala'), 0.6);
    withA(kTable, () => {
      const x = 120, y = 220, w = 1680;
      card(x, y, w, 760, { fill: C.card, col: C.blue, p: kTable });

      // Header row
      card(x, y, w, 65, { fill: '#1e293b', col: '#1e293b' });
      text("Xususiyat", x + 30, y + 33, { size: 24, weight: 700, fam: UI, color: '#fff' });
      text("PostgreSQL 18", x + 380, y + 33, { size: 24, weight: 700, fam: UI, color: '#93c5fd' });
      text("MySQL 9 (utf8mb4)", x + 820, y + 33, { size: 24, weight: 700, fam: UI, color: '#fdba74' });
      text("SQLite 3", x + 1280, y + 33, { size: 24, weight: 700, fam: UI, color: '#86efac' });

      // Qatorlar
      const rows = [
        {
          prop: "Asosiy matn turi",
          pg: "text; varchar(n), char(n)",
          my: "VARCHAR(n), TEXT oilasi",
          sq: "TEXT (Type Affinity)",
          at: W('L9', 'postgres')
        },
        {
          prop: "Uzunlik n o'lchovi",
          pg: "Belgilar soni",
          my: "Belgilar (TEXT baytlarda)",
          sq: "Butunlay e'tiborsiz",
          at: W('L9', 'uzunlik')
        },
        {
          prop: "Uzun qiymat yozilsa",
          pg: "Qat'iy XATO beradi",
          my: "Qat'iyda xato, no-strict: kesadi",
          sq: "Xatosiz qabul qiladi",
          at: W('L10', 'kesib')
        },
        {
          prop: "'Salom' = 'salom'",
          pg: "Yolg'on (f, case-sensitive)",
          my: "Rost (1, _ci collation)",
          sq: "Yolg'on (0)",
          at: W('L10', 'rejim')
        },
        {
          prop: "Qator hajmi limiti",
          pg: "Umumiy limit yo'q (TOAST)",
          my: "65 535 bayt (barcha ustunlar)",
          sq: "1 GB umumiy limit",
          at: W('L11', 'uzunlikni')
        },
        {
          prop: "Matnda NUL (0x00)",
          pg: "Taqiqlangan (xato beradi)",
          my: "Mumkin",
          sq: "Mumkin",
          at: W('L11', 'chek')
        }
      ];

      rows.forEach((r, idx) => {
        const rowY = y + 65 + idx * 115;
        const kRow = P(t, r.at, 0.4);
        withA(kRow, () => {
          if (idx % 2 === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x, rowY, w, 115);
          }
          sline(x, rowY, x + w, rowY, { p: 1, w: 1, col: 'rgba(0,0,0,0.08)' });

          text(r.prop, x + 30, rowY + 58, { size: 21, weight: 700, color: C.ink });
          text(r.pg, x + 380, rowY + 58, { size: 19, fam: MONO, weight: 600, color: C.blue, wrap: 400 });
          text(r.my, x + 820, rowY + 58, { size: 19, fam: MONO, weight: 600, color: C.orange, wrap: 420 });
          text(r.sq, x + 1280, rowY + 58, { size: 19, fam: MONO, weight: 600, color: C.green, wrap: 380 });
        });
      });
    });
  }

  // 5. 6 TA TIPIK XATO (Traps)
  function sTraps(t) {
    heading("Matn va Binary Bo'yicha 6 ta Tipik Xato", t, L('L12').s - 0.4);

    const traps = [
      { num: "1", tit: "PostgreSQL da varchar(255) yozish", desc: "Tezlik foydasi yo'q, 255 — asossiz chegara. Oddiy text yoki biznes qoidasi bo'lsa CHECK ma'qul.", col: C.blue, at: W('L13', 'birinchi') },
      { num: "2", tit: "MySQL TEXT ga 65 535 belgi sig'adi deb o'ylash", desc: "Chegara baytlarda! utf8mb4 da 4 baytli belgilar sababli 4 marta kam sig'adi. Yechim: MEDIUMTEXT.", col: C.orange, at: W('L14', 'ikkinchi') },
      { num: "3", tit: "MySQL da ko'p katta VARCHAR ochish", desc: "Ikkita VARCHAR(16000) umumiy 65 535 baytdan oshib ketadi. Katta ustunlarni TEXT ga o'tkazing.", col: C.red, at: W('L15', 'uchinchi') },
      { num: "4", tit: "SQLite VARCHAR(50) ga ishonish", desc: "SQLite uzunlikni umuman tekshirmaydi. Cheklash uchun CHECK (length(nom) <= 50) yozish shart.", col: C.green, at: W('L16', 'to‘rtinchi') },
      { num: "5", tit: "MySQL dan PG ga o'tganda 'salom' ni izlash", desc: "MySQL _ci kollatsiya tufayli kichik harf bilan topardi, PostgreSQL da topmaydi! lower() kerak.", col: C.purple, at: W('L17', 'beshinchi') },
      { num: "6", tit: "Fayllarni text ustunida saqlash", desc: "Binar fayllardagi nol baytlar va no-UTF8 belgilar xato beradi. Faqat bytea yoki BLOB ishlatilsin!", col: C.red, at: W('L18', 'oltinchi') }
    ];

    traps.forEach((trap, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 120 + col * 860, y = 220 + row * 255;
      const k = P(t, trap.at, 0.4);
      withA(k, () => {
        const isCurrent = t >= trap.at && (i === 5 || t < traps[i + 1].at);
        const fill = isCurrent ? '#fef2f2' : C.card;
        const bcol = isCurrent ? C.red : trap.col;

        card(x, y, 820, 235, { fill, col: bcol, p: k });
        pill(`XATO #${trap.num}`, x + 85, y + 40, bcol, k, 19);
        hand(trap.tit, x + 180, y + 40, { size: 24, color: bcol, p: k });

        text(trap.desc, x + 30, y + 120, { size: 20, color: C.ink, wrap: 760 });
        if (isCurrent) {
          marker(x + 25, y + 175, 770, 12, C.hlRed, 1);
        }
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Keyingi Bob", t, L('L19').s - 0.4);

    const pillars = [
      { tit: "PostgreSQL", sub: "Qat'iy aniqlik", desc: "Matn uchun text tavsiya etiladi. Binar uchun bytea. Belgilar soni qat'iy tekshiriladi, NUL baytlari taqiqlangan.", col: C.blue },
      { tit: "MySQL", sub: "65 535 bayt limit", desc: "Qator chegarasiga e'tibor bering. TEXT ga DEFAULT berib bo'lmaydi. _ci kollatsiya katta-kichik harfni teng ko'radi.", col: C.orange },
      { tit: "SQLite", sub: "Type Affinity", desc: "VARCHAR uzunlikni cheklamaydi, CHECK shart. BLOB uchun x'...' literali ishlatiladi. Matnda NUL ruxsat etilgan.", col: C.green }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L19', 'to‘liq') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 120 + i * 580, y = 240;
        card(x, y, 540, 440, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 40, y + 60, { size: 36, color: p.col, p: k });
        pill(p.sub, x + 270, y + 120, p.col, k, 20);
        text(p.desc, x + 40, y + 210, { size: 23, color: C.ink, wrap: 460 });
      });
    });

    const kNext = P(t, W('L19', 'sana'), 0.6);
    withA(kNext, () => {
      card(120, 720, 1680, 210, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 8-bobda: Sana va Vaqt Ma'lumot Turlari", 160, 785, { size: 36, color: C.blue, p: kNext });
      text("DATE, TIME, TIMESTAMP, TIMESTAMPTZ, vaqt zonalari va INTERVAL hisob-kitoblari sirlarini o'rganamiz.", 160, 855, { size: 25, color: C.ink });
      pill("08 SANA VA VAQT", 1540, 785, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.mysql.s) sIntro(t);
    else if (t < TM.scenes.sqlite.s) sMysql(t);
    else if (t < TM.scenes.comparison.s) sSqlite(t);
    else if (t < TM.scenes.traps.s) sComparison(t);
    else if (t < TM.scenes.xulosa.s) sTraps(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("7-bob: Matn va Binary — Dialektlar", 960, 190, { size: 76, align: 'center', color: C.blue });
    hand("MySQL (65535 bayt, TEXT), SQLite (Type Affinity) va 6 ta tipik xato", 960, 285, { size: 42, align: 'center', color: C.ink });

    card(120, 380, 520, 500, { fill: C.card, col: C.orange });
    hand("MySQL Xususiyatlari", 160, 440, { size: 34, color: C.orange });
    text("• 65 535 bayt qator limiti\n• TEXT ga DEFAULT taqiqlangan\n• _ci: 'Salom' = 'salom'\n• CHAR probellarni tozalaydi\n• utf8mb4: 1 belgi 4 baytgacha", 160, 520, { size: 21, fam: MONO, color: C.ink });
    pill("MySQL Dialekti", 380, 820, C.orange, 1, 20);

    card(680, 380, 520, 500, { fill: C.card, col: C.green });
    hand("SQLite Affinity", 720, 440, { size: 34, color: C.green });
    text("• VARCHAR(5) uzunlik e'tiborsiz\n• Matnda NUL (0x00) mumkin\n• BLOB literali: x'53616C6F6D'\n• Cheklash uchun CHECK shart\n• 1 GB umumiy hajm limiti", 720, 520, { size: 21, fam: MONO, color: C.ink });
    pill("SQLite Affinity", 940, 820, C.green, 1, 20);

    card(1240, 380, 560, 500, { fill: C.card, col: C.red });
    hand("6 ta Tipik Xato", 1280, 440, { size: 34, color: C.red });
    text("1. PG da varchar(255) yozish\n2. MySQL TEXT sig'imi (baytda)\n3. MySQL 65 535 B qator xatosi\n4. SQLite VARCHAR tekshirmaydi\n5. Harf kattaligi farqi (_ci)\n6. Faylni text da saqlash", 1280, 520, { size: 20, fam: MONO, color: C.ink });
    pill("6 ta amaliy tuzoq", 1520, 820, C.red, 1, 20);

    pill("PostgreSQL vs MySQL vs SQLite", 960, 960, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
