// SQL 5-bob 2-qism: "Kod" — PostgreSQL 18 psql da jonli amaliyot
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("5-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Kod: Jonli Amaliyot", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18.6 psql terminali", 960, 510, { size: 54, align: 'center', p: P(t, 1.2, 1.2) });
    marker(520, 550, 880 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'pi-es-kyu-el'), 0.8);
    withA(kBadges, () => {
      pill("psql 18.6", 640, 680, C.blue, kBadges, 28);
      pill("dokon bazasi", 960, 680, C.purple, kBadges, 28);
      pill("ombor & savdo sxemalari", 1280, 680, C.green, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'terminalida'), 0.8);
    withA(kDesc, () => {
      card(380, 780, 1160, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Klasterdagi bazalar, CREATE DATABASE va bitta ulanish bitta baza qoidasi", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Sxemalar ochish, search_path ni o'zgartirish va CASCADE bilan tozalash", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. DBS & TEMPLATE
  function sDbsTemplate(t) {
    heading("Klasterdagi bazalar va CREATE DATABASE", t, L('L2').s - 0.4);

    // Terminal: pg_database
    const k1 = P(t, W('L2', 'pi-ji'), 0.5);
    term(140, 230, 800, 420, "1. Klasterdagi bazalar (pg_database)", [{
      b: {
        cmd: "SELECT datname, datistemplate, datallowconn FROM pg_database WHERE datname IN ('postgres', 'qollanma', 'template0', 'template1') ORDER BY datname;",
        out: (TTY.dbs || "  datname  | datistemplate | datallowconn \n-----------+---------------+--------------\n postgres  | f             | t\n qollanma  | f             | t\n template0 | t             | f\n template1 | t             | t\n(4 rows)").split("\n")
      },
      t: k1,
      typeDur: 1.0
    }], { font: 15 });

    // Terminal: CREATE DATABASE va tranzaksiya taqiqi
    const k2 = P(t, W('L4', 'dokon'), 0.5);
    term(980, 230, 800, 420, "2. CREATE DATABASE va Tranzaksiya taqiqi", [{
      b: {
        cmd: "CREATE DATABASE dokon;\nBEGIN; CREATE DATABASE dokon2; COMMIT;",
        out: [
          (TTY.createdb || "CREATE DATABASE"),
          (TTY.tx_err || "ERROR: CREATE DATABASE cannot run inside a transaction block")
        ]
      },
      t: k2,
      typeDur: 1.0
    }], { font: 16 });

    // Tushuntirish kartasi
    const kDesc = P(t, W('L3', 'templeyt'), 0.5);
    withA(kDesc, () => {
      card(140, 680, 1640, 280, { fill: '#fff9e6', col: C.orange, p: kDesc });
      hand("Shablon bazalar siri: template1 vs template0", 180, 735, { size: 30, color: C.orange, p: kDesc });
      text("• template1: Sukut bo'yicha shablon. Barcha yangi bazalar undan klonlanadi.", 180, 790, { size: 22, color: C.ink });
      text("• template0: Sof boshlang'ich etalon. Ulanish taqiqlangan (datallowconn = false), hech qachon o'zgarmaydi.", 180, 835, { size: 22, color: C.ink });
      text("• CREATE DATABASE butun fayl tizimini nusxalagani sababli tranzaksiya ichida ishlay olmaydi!", 180, 880, { size: 22, weight: 600, color: C.red });
    });
  }

  // 3. CROSS DB
  function sCrossDb(t) {
    heading("Bitta ulanish — Bitta baza!", t, L('L5').s - 0.4);

    const kCross = P(t, W('L6', 'talabalar'), 0.5);
    // Chap: terminal
    term(140, 230, 820, 420, "psql: dokon bazasidan qollanmaga so'rov", [{
      b: {
        cmd: "\\c dokon\nSELECT current_database();\nSELECT * FROM qollanma.public.talabalar;",
        out: (TTY.cross_err ? ("current_database: dokon\n\n" + TTY.cross_err).split("\n") : [
          "current_database: dokon",
          "ERROR: cross-database references are not implemented: \"qollanma.public.talabalar\"",
          "LINE 1: SELECT * FROM qollanma.public.talabalar;",
          "                      ^"
        ])
      },
      t: kCross,
      typeDur: 1.2
    }], { font: 16 });

    // O'ng: Vizual arxitektura diagrammasi
    withA(kCross, () => {
      card(990, 230, 790, 420, { fill: '#fff5f5', col: C.red, p: kCross });
      hand("Bitta ulanish — Bitta baza!", 1020, 280, { size: 28, color: C.red, p: kCross });
      text("Bitta ulanish ichidan boshqa bazaga to'g'ridan-to'g'ri kirish taqiqlangan.", 1020, 325, { size: 20, color: C.ink, wrap: 720 });

      dbCylinder(1080, 360, 140, 80, { col: C.blue, p: kCross });
      text("dokon", 1150, 465, { size: 20, fam: MONO, align: 'center', weight: 700, color: C.blue });

      dbCylinder(1520, 360, 140, 80, { col: C.purple, p: kCross });
      text("qollanma", 1590, 465, { size: 20, fam: MONO, align: 'center', weight: 700, color: C.purple });

      arrow(1240, 400, 1490, 400, { col: C.red, w: 3 });
      cross(1365, 400, 24, C.red);
      pill("TAQIQLANGAN: cross-database yo'q", 1365, 520, C.red, kCross, 18);
    });

    const kExplain = P(t, W('L7', 'bitta'), 0.6);
    withA(kExplain, () => {
      card(140, 680, 1640, 280, { fill: '#fef2f2', col: C.red, p: kExplain });
      pill("QAT'IY CHEKLOV", 260, 735, C.red, kExplain, 22);
      text("PostgreSQL'da bazalararo to'g'ridan-to'g'ri so'rov yuborish imkoni YO'Q!", 390, 740, { size: 26, weight: 700, color: C.red });

      text("• MySQL kabi baza.jadval orqali boshqa bazani JOIN qilib bo'lmaydi.", 180, 805, { size: 23, color: C.ink });
      text("• Agar modullar orasida jadvallarni bog'lash kerak bo'lsa, ularni ALOHIDA BAZALARGA emas, bitta bazadagi ALOHIDA SXEMALARGA ajratish shart!", 180, 855, { size: 23, weight: 700, color: C.green });
      text("• Bazalararo aloqa faqat maxsus postgres_fdw yoki dblink kengaytmalari orqali mumkin.", 180, 905, { size: 20, color: C.soft });
    });
  }

  // 4. SCHEMAS SEARCH
  function sSchemas(t) {
    heading("Sxemalar va ombor/savdo misoli", t, L('L8').s - 0.4);

    // Terminal 1: Sxemalar yaratish va mahsulot jadvallari
    const k1 = P(t, W('L9', 'ombor'), 0.5);
    term(140, 230, 800, 440, "1. Ikki sxemada bir xil jadval yaratish", [{
      b: {
        cmd: "CREATE SCHEMA ombor; CREATE SCHEMA savdo;\nCREATE TABLE ombor.mahsulot (id int, nom text);\nCREATE TABLE savdo.mahsulot (id int, narx numeric);\nINSERT INTO ombor.mahsulot VALUES (1, 'Non');\nINSERT INTO savdo.mahsulot VALUES (1, 4000);",
        out: [
          "CREATE SCHEMA",
          "CREATE SCHEMA",
          "CREATE TABLE",
          "CREATE TABLE",
          "INSERT 0 1",
          "INSERT 0 1"
        ]
      },
      t: k1,
      typeDur: 1.0
    }], { font: 16 });

    // Terminal 2: Prefikssiz chaqirish xatosi
    const k2 = P(t, W('L10', 'prefikssiz'), 0.5);
    term(980, 230, 800, 440, "2. Prefikssiz SELECT: XATO", [{
      b: {
        cmd: "SELECT * FROM mahsulot;",
        out: (TTY.no_rel_err || "ERROR: relation \"mahsulot\" does not exist\nLINE 1: SELECT * FROM mahsulot;\n                      ^").split("\n")
      },
      t: k2,
      typeDur: 0.8
    }], { font: 16 });

    // Pastda tushuntirish
    const kDesc = P(t, W('L8', 'sörch'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 260, { fill: C.card, col: C.blue, p: kDesc });
      hand("Nega xato berdi?", 180, 755, { size: 30, color: C.blue, p: kDesc });
      text("Chunki bazada ikkita mahsulot jadvali bor, lekin search_path hozir faqat public va \"$user\" ni biladi.", 180, 810, { size: 24, color: C.ink });
      text("Tizim qaysi mahsulot jadvalini o'qishni bilmaydi. Uni search_path ga qo'shish yoki malakali nom ishlatish kerak!", 180, 860, { size: 22, weight: 600, color: C.orange });
    });
  }

  // 5. PATH SWITCH
  function sPathSwitch(t) {
    heading("search_path o'zgarishi va Turli natijalar", t, L('L11').s - 0.4);

    // Terminal 1: savdo, ombor
    const k1 = P(t, W('L11', 'savdo'), 0.5);
    term(140, 230, 780, 440, "1. SET search_path TO savdo, ombor;", [{
      b: {
        cmd: "SET search_path TO savdo, ombor;\nSELECT * FROM mahsulot;",
        out: (TTY.path_savdo || "SET\n id | narx \n----+------\n  1 | 4000\n(1 row)").split("\n")
      },
      t: k1,
      typeDur: 1.0
    }], { font: 17 });

    // Terminal 2: ombor, savdo
    const k2 = P(t, W('L12', 'ombor'), 0.5);
    term(960, 230, 820, 440, "2. SET search_path TO ombor, savdo;", [{
      b: {
        cmd: "SET search_path TO ombor, savdo;\nSELECT * FROM mahsulot;",
        out: (TTY.path_ombor || "SET\n id | nom \n----+-----\n  1 | Non\n(1 row)").split("\n")
      },
      t: k2,
      typeDur: 1.0
    }], { font: 17 });

    // Pastda tushuntirish
    const kWarn = P(t, W('L14', 'ko‘rib'), 0.5);
    withA(kWarn, () => {
      card(140, 700, 1640, 260, { fill: '#fff9e6', col: C.orange, p: kWarn });
      pill("DIQQAT: BIR XIL SO'ROV — TURLI NATIJA!", 410, 755, C.orange, kWarn, 24);
      text("Aynan bir xil SELECT * FROM mahsulot so'rovi search_path tartibiga qarab BUTUNLAY BOSHQA jadvalni o'qidi!", 180, 815, { size: 24, weight: 700, color: C.ink });
      text("TAVSIYA: Ilova kodlarida va muhim SQL skriptlarda har doim malakali nom (ombor.mahsulot, savdo.mahsulot) yozing!", 180, 870, { size: 22, weight: 600, color: C.blue });
    });
  }

  // 6. CREATE DROP
  function sCreateDrop(t) {
    heading("Joriy sxemaga tushish va CASCADE", t, L('L15').s - 0.4);

    // Terminal: joriy sxemaga yangi jadval tushishi
    const k1 = P(t, W('L15', 'yangi'), 0.5);
    term(140, 230, 800, 440, "1. Prefikssiz CREATE TABLE birinchi sxemaga tushadi", [{
      b: {
        cmd: "CREATE TABLE yangi (x int);\nSELECT schemaname, tablename FROM pg_tables WHERE tablename IN ('mahsulot', 'yangi') ORDER BY 1, 2;",
        out: (TTY.tables ? TTY.tables.split("\n") : [
          "CREATE TABLE",
          " schemaname | tablename ",
          "------------+-----------",
          " ombor      | mahsulot",
          " ombor      | yangi",
          " savdo      | mahsulot",
          "(3 rows)"
        ])
      },
      t: k1,
      typeDur: 1.0
    }], { font: 15 });

    // Terminal: DROP SCHEMA CASCADE
    const k2 = P(t, W('L16', 'kaskad'), 0.5);
    term(980, 230, 800, 440, "2. Sxemani o'chirish: CASCADE", [{
      b: {
        cmd: "DROP SCHEMA ombor;          -- xato (bo'sh emas)\nDROP SCHEMA ombor CASCADE;  -- muvaffaqiyat",
        out: [
          "ERROR: cannot drop schema ombor because other objects depend on it",
          "DETAIL: table ombor.mahsulot depends on schema ombor",
          "table ombor.yangi depends on schema ombor",
          "HINT: Use DROP ... CASCADE to drop the dependent objects too.",
          "DROP SCHEMA"
        ]
      },
      t: k2,
      typeDur: 1.0
    }], { font: 15 });

    // Pastda tushuntirish
    const kDesc = P(t, W('L17', 'kaskad'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 260, { fill: C.card, col: C.green, p: kDesc });
      hand("CASCADE qoidasi", 180, 755, { size: 30, color: C.green, p: kDesc });
      text("• Standart DROP SCHEMA faqat bo'sh sxemalarnigina o'chirishga ruxsat beradi.", 180, 810, { size: 22, color: C.ink });
      text("• CASCADE esa sxema ichidagi barcha jadvallar, view'lar va funksiyalarni birvarakayiga tozalab tashlaydi.", 180, 855, { size: 22, color: C.ink });
      text("• Ehtiyot bo'ling: CASCADE bilan o'chirish qaytarib bo'lmas amallardan biridir!", 180, 900, { size: 22, weight: 600, color: C.red });
    });
  }

  // 7. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L18').s - 0.4);

    const pillars = [
      { tit: "Bitta ulanish = bitta baza", val: "Boshqa bazaga murojaat yo'q. Loyiha qismlarini bitta bazada, alohida sxemalarda yuriting.", col: C.blue },
      { tit: "search_path tartibi", val: "Prefikssiz so'rovlar yo'ldagi birinchi jadvalni o'qiydi. Noaniqlik bo'lmasligi uchun sxema.jadval yozing.", col: C.purple },
      { tit: "Yangi obyektlar joyi", val: "Sxema ko'rsatilmasa, jadval yo'ldagi birinchi sxemaga (sukut bo'yicha public) tushadi.", col: C.green },
      { tit: "CASCADE xavfsizligi", val: "Sxemani o'chirishda ichidagi hamma obyektni birdan yo'q qiladi. Ehtiyotkorlik bilan qo'llang.", col: C.orange }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L18', 'jonli') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 250;
        card(x, y, 380, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 30, y + 60, { size: 30, color: p.col, p: k });
        text(p.val, x + 30, y + 160, { size: 23, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L19', 'may'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi qismda: MySQL (baza = sxema) va SQLite (ATTACH)", 180, 780, { size: 36, color: C.blue, p: kNext });
      text("MySQL da bazalararo JOIN, No database selected xatosi, SQLite da fayllarni ulash va 6 ta tipik xatoni ko'rib chiqamiz.", 180, 845, { size: 26, color: C.ink });
      pill("05-3 DIALEKTLAR", 1580, 780, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.dbs_template.s) sIntro(t);
    else if (t < TM.scenes.cross_db.s) sDbsTemplate(t);
    else if (t < TM.scenes.schemas_search.s) sCrossDb(t);
    else if (t < TM.scenes.path_switch.s) sSchemas(t);
    else if (t < TM.scenes.create_drop.s) sPathSwitch(t);
    else if (t < TM.scenes.xulosa.s) sCreateDrop(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("5-bob: Baza, sxema va jadval — Kod", 960, 220, { size: 80, align: 'center', color: C.blue });
    hand("PostgreSQL 18.6 psql terminalida jonli sinovlar", 960, 320, { size: 48, align: 'center', color: C.ink });

    card(140, 420, 500, 460, { fill: C.card, col: C.blue });
    hand("Bazalar va Shablonlar", 180, 480, { size: 34, color: C.blue });
    text("• pg_database jadvali\n• template1 (sukut shablon)\n• template0 (toza boshlang'ich)\n• CREATE DATABASE dokon;", 180, 550, { size: 22, fam: MONO, color: C.ink });
    pill("Klasterdagi bazalar", 390, 810, C.blue, 1, 20);

    card(710, 420, 500, 460, { fill: C.card, col: C.purple });
    hand("Bitta ulanish = bitta baza", 750, 480, { size: 34, color: C.purple });
    text("• SELECT * FROM qollanma.table\n• ERROR: cross-database yo'q!\n• ombor.mahsulot\n• savdo.mahsulot", 750, 550, { size: 22, fam: MONO, color: C.ink });
    pill("Bitta ulanish bitta baza", 960, 810, C.purple, 1, 20);

    card(1280, 420, 500, 460, { fill: C.card, col: C.green });
    hand("search_path va CASCADE", 1320, 480, { size: 34, color: C.green });
    text("• SET search_path TO savdo, ombor\n• Bir xil so'rov, turli natija!\n• CREATE TABLE yangi (birinchiga)\n• DROP SCHEMA ombor CASCADE", 1320, 550, { size: 22, fam: MONO, color: C.ink });
    pill("search_path va CASCADE", 1530, 810, C.green, 1, 20);

    pill("PostgreSQL 18.6 psql", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
