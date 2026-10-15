// SQL 4-bob 2-qism: "Kod" — PostgreSQL 18 psql da jonli amaliyot
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
    hand("4-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Kod: Jonli Amaliyot", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18.6 psql terminali", 960, 510, { size: 54, align: 'center', p: P(t, 1.2, 1.2) });
    marker(520, 550, 880 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'pi-es-kyu-el'), 0.8);
    withA(kBadges, () => {
      pill("psql 18.6", 640, 680, C.blue, kBadges, 28);
      pill("qollanma bazasi", 960, 680, C.purple, kBadges, 28);
      pill("Lokal ulanish (5432)", 1280, 680, C.green, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'terminalida'), 0.8);
    withA(kDesc, () => {
      card(380, 780, 1160, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Katta-kichik harf, qo'shtirnoq, escape va dollar satrlar", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("63 bayt chegara, 5--1 izoh tuzog'i va operatorlar tartibi haqiqiy terminalda", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. CASE SENSITIVITY
  function sCase(t) {
    heading("Katta-kichik harf va \"Mahsulot\" siri", t, L('L2').s - 0.4);

    // Terminal: yaratish va kichik harf
    const k1 = P(t, W('L2', 'mahsulot'), 0.5);
    withA(k1, () => {
      term(140, 230, 780, 420, "1. Qo'shtirnoqsiz yaratish", [{
        b: {
          cmd: "CREATE TABLE Mahsulot (Nom text);\nINSERT INTO MAHSULOT VALUES ('Non');\nSELECT nom FROM mahsulot;",
          out: (TTY.case1 || "CREATE TABLE\nINSERT 0 1\n nom \n-----\n Non\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.2
      }], { font: 16 });
    });

    // Terminal: "Mahsulot" xatosi
    const k2 = P(t, W('L3', 'qo‘shtirnoq'), 0.5);
    withA(k2, () => {
      term(960, 230, 820, 420, "2. Qo'shtirnoqli qidirish (XATO)", [{
        b: {
          cmd: 'SELECT * FROM "Mahsulot";',
          out: (TTY.not_exist || 'ERROR: relation "Mahsulot" does not exist\nLINE 1: SELECT * FROM "Mahsulot";\n                      ^').split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Terminal: Qo'shtirnoq bilan ikkinchi jadval va \dt
    const k3 = P(t, W('L4', 'ikkita'), 0.5);
    withA(k3, () => {
      term(140, 680, 1640, 280, "3. Qo'shtirnoq bilan ikkinchi jadval: CREATE TABLE \"Mahsulot\" va \\dt", [{
        b: {
          cmd: 'CREATE TABLE "Mahsulot" ("Nom" text); \\dt',
          out: (TTY.case2 || 'CREATE TABLE\n\n            List of tables\n Schema |   Name    | Type  |  Owner   \n--------+-----------+-------+----------\n public | Mahsulot  | table | postgres\n public | mahsulot  | table | postgres\n(2 rows)').split("\n")
        },
        t: k3,
        typeDur: 1.2
      }], { font: 15 });
    });
  }

  // 3. KEYWORDS & LENGTH
  function sKeywords(t) {
    heading("Kalit so'z va 63 bayt chegara", t, L('L6').s - 0.4);

    // Terminal: ORDER xatosi va yechimi
    const k1 = P(t, W('L6', 'order'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "Kalit so'zni nom qilish (ORDER)", [{
        b: {
          cmd: "CREATE TABLE order (id integer);",
          out: (TTY.order_err || 'ERROR: syntax error at or near "order"\nLINE 1: CREATE TABLE order (id integer);\n                     ^').split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Qo'shtirnoqli muvaffaqiyat
    const k2 = P(t, W('L7', 'muvaffaqiyatli'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "Qo'shtirnoq bilan to'g'ri yechim", [{
        b: {
          cmd: 'CREATE TABLE "order" (id integer);',
          out: [(TTY.order_ok || "CREATE TABLE")]
        },
        t: k2,
        typeDur: 0.8
      }], { font: 16 });
    });

    // 70 harfli nom qisqarishi
    const k3 = P(t, W('L8', 'oltmish'), 0.5);
    withA(k3, () => {
      term(140, 700, 1640, 260, "70 harfli nom: 63 baytgacha qisqarish (NOTICE)", [{
        b: {
          cmd: "CREATE TABLE aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa (id int);",
          out: (TTY.trunc || 'NOTICE: identifier "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" will be truncated to "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"').split("\n")
        },
        t: k3,
        typeDur: 1.0
      }], { font: 15 });
    });
  }

  // 4. STRINGS
  function sStrings(t) {
    heading("Satrlar: Oddiy, Escape, Dollar va Birlashish", t, L('L9').s - 0.4);

    // Tutuq belgisi
    const k1 = P(t, W('L9', 'tutuq'), 0.5);
    withA(k1, () => {
      term(140, 230, 780, 320, "1. O'zbekcha tutuq belgisi: ''", [{
        b: {
          cmd: "SELECT 'Ma''ruf' AS ism;",
          out: (TTY.str || "  ism   \n--------\n Ma'ruf\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 0.8
      }], { font: 16 });
    });

    // Escape satr
    const k2 = P(t, W('L10', 'escape'), 0.5);
    withA(k2, () => {
      term(960, 230, 820, 320, "2. Oddiy vs Escape satr: E'a\\nb'", [{
        b: {
          cmd: "SELECT 'a\\nb' AS oddiy, E'a\\nb' AS escape;",
          out: (TTY.esc || " oddiy | escape \n-------+--------\n a\\nb  | a     +\n       | b\n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Dollar satr
    const k3 = P(t, W('L11', 'dollar'), 0.5);
    withA(k3, () => {
      term(140, 580, 780, 370, "3. Dollar satr: $$...$$", [{
        b: {
          cmd: "SELECT $$Ma'ruf \"aka\" \\n$$ AS dollar;",
          out: (TTY.dollar || "    dollar     \n---------------\n Ma'ruf \"aka\" \\n\n(1 row)").split("\n")
        },
        t: k3,
        typeDur: 0.8
      }], { font: 16 });
    });

    // Ikki qator birlashishi
    const k4 = P(t, W('L12', 'birlashtiradi'), 0.5);
    withA(k4, () => {
      term(960, 580, 820, 370, "4. Ikki qatorli satrlarning birlashishi", [{
        b: {
          cmd: "SELECT 'Salom, '\n'dunyo' AS ikki_qator;",
          out: (TTY.lines || "  ikki_qator  \n--------------\n Salom, dunyo\n(1 row)").split("\n")
        },
        t: k4,
        typeDur: 0.8
      }], { font: 16 });
    });
  }

  // 5. NUMBERS
  function sNumbers(t) {
    heading("Sonlar va Boshlang'ich tiplar", t, L('L13').s - 0.4);

    // Sonlar formatlari
    const k1 = P(t, W('L13', 'millionni'), 0.5);
    withA(k1, () => {
      term(140, 240, 1640, 320, "1. Tagchiziq va Sanoq sistemalari: 1_000_000, 0xFF, 0b1010, 0o755", [{
        b: {
          cmd: "SELECT 1_000_000 AS million, 0xFF AS hex, 0b1010 AS bin, 0o755 AS oct;",
          out: (TTY.nums || " million | hex | bin | oct \n---------+-----+-----+-----\n 1000000 | 255 |  10 | 493\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 17 });
    });

    // Boshlang'ich tiplar: pg_typeof
    const k2 = P(t, W('L14', 'pi-ji'), 0.5);
    withA(k2, () => {
      term(140, 600, 1640, 350, "2. Boshlang'ich tiplar: pg_typeof()", [{
        b: {
          cmd: "SELECT pg_typeof(42) AS a, pg_typeof(3000000000) AS b, pg_typeof(3.5) AS c;",
          out: (TTY.types || "    a    |   b    |    c    \n---------+--------+---------\n integer | bigint | numeric\n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 17 });
    });
  }

  // 6. COMMENTS & PRECEDENCE
  function sTraps(t) {
    heading("Izoh tuzog'i (5--1) va Ustuvorlik", t, L('L16').s - 0.4);

    // 5--1 tuzog'i
    const k1 = P(t, W('L16', 'besh'), 0.5);
    withA(k1, () => {
      term(140, 230, 780, 340, "1. Tuzoq: SELECT 5--1;", [{
        b: {
          cmd: "SELECT 5--1\n;",
          out: (TTY.comm5 || " ?column? \n----------\n        5\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 0.8
      }], { font: 16 });
    });

    // 5 - -1 yechimi
    const k2 = P(t, W('L17', 'olti'), 0.5);
    withA(k2, () => {
      term(960, 230, 820, 340, "2. To'g'ri yechim: Probel qo'yish", [{
        b: {
          cmd: "SELECT 5 - -1 AS natija;",
          out: (TTY.comm6 || " natija \n--------\n      6\n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 0.8
      }], { font: 16 });
    });

    // Ichma-ich izoh
    const k3 = P(t, W('L18', 'ichma-ich'), 0.5);
    withA(k3, () => {
      term(140, 600, 780, 350, "3. Ichma-ich ko'p qatorli izoh", [{
        b: {
          cmd: "SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1 AS natija;",
          out: (TTY.nested || " natija \n--------\n      2\n(1 row)").split("\n")
        },
        t: k3,
        typeDur: 0.8
      }], { font: 16 });
    });

    // Ustuvorlik: 2 ^ 3 ^ 2
    const k4 = P(t, W('L19', 'oltmish'), 0.5);
    withA(k4, () => {
      term(960, 600, 820, 350, "4. Chapdan bog'lanish: 2 ^ 3 ^ 2", [{
        b: {
          cmd: "SELECT 2 + 3 * 4 AS a, (2 + 3) * 4 AS b, 2 ^ 3 ^ 2 AS daraja;",
          out: (TTY.precedence || " a  | b  | daraja \n----+----+--------\n 14 | 20 |     64\n(1 row)").split("\n")
        },
        t: k4,
        typeDur: 1.0
      }], { font: 16 });
    });
  }

  // 7. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Dialektlar farqi", t, L('L20').s - 0.4);

    const findings = [
      { tit: "Kichik harfga o'tish", val: "PostgreSQL barcha nomlarni kichik harfga aylantiradi", col: C.blue },
      { tit: "Qo'shtirnoq \"...\"", val: "Nomni katta-kichik harfga sezgir qiladi va kalit so'zni nom qilishga imkon beradi", col: C.purple },
      { tit: "Escape va Dollar", val: "E'\\n' bilan maxsus belgilar, $$...$$ bilan tirnoqsiz erkin matn", col: C.green },
      { tit: "Izohlar va Probellar", val: "5--1 da qolgan qism izoh bo'lib ketmasligi uchun operator atrofida probel shart", col: C.orange }
    ];

    findings.forEach((f, i) => {
      const k = P(t, W('L20', 'nozik') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 250;
        card(x, y, 380, 420, { fill: C.card, col: f.col, p: k });
        hand(f.tit, x + 30, y + 60, { size: 30, color: f.col, p: k });
        text(f.val, x + 30, y + 150, { size: 24, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L21', 'may'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi qismda: MySQL va SQLite dialektlari", 180, 780, { size: 36, color: C.blue, p: kNext });
      text("MySQL lower_case_table_names xavfi, 64 belgilik xato, oddiy satrda \\n, 0xFF binary satr va 6 ta tipik xatoni o'rganamiz.", 180, 845, { size: 26, color: C.ink });
      pill("04-3 DIALEKTLAR", 1580, 780, C.blue, kNext, 22);
    });
  }

  function render(t) {
    bg();
    if (t < TM.scenes.case_sensitivity.s) sIntro(t);
    else if (t < TM.scenes.keywords_length.s) sCase(t);
    else if (t < TM.scenes.strings.s) sKeywords(t);
    else if (t < TM.scenes.numbers.s) sStrings(t);
    else if (t < TM.scenes.comments_traps.s) sNumbers(t);
    else if (t < TM.scenes.xulosa.s) sTraps(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("4-bob: SQL sintaksisi — Kod", 960, 220, { size: 80, align: 'center', color: C.blue });
    hand("PostgreSQL 18.6 psql terminalida jonli sinovlar", 960, 320, { size: 48, align: 'center', color: C.ink });

    card(140, 420, 500, 460, { fill: C.card, col: C.blue });
    hand("Katta-kichik harf", 180, 480, { size: 34, color: C.blue });
    text("• CREATE TABLE Mahsulot\n• SELECT nom FROM mahsulot\n• SELECT * FROM \"Mahsulot\" (ERROR)\n• CREATE TABLE \"order\" (OK)", 180, 550, { size: 22, fam: MONO, color: C.ink });
    pill("\"Mahsulot\" !== mahsulot", 390, 810, C.blue, 1, 20);

    card(710, 420, 500, 460, { fill: C.card, col: C.green });
    hand("Satrlar va Tiplar", 750, 480, { size: 34, color: C.green });
    text("• 'Ma''ruf' (tutuq belgisi)\n• E'a\\nb' (escape satr)\n• $$Ma'ruf \"aka\" \\n$$\n• 1_000_000, 0xFF, pg_typeof", 750, 550, { size: 22, fam: MONO, color: C.ink });
    pill("E'\\n'  $$...$$", 960, 810, C.green, 1, 20);

    card(1280, 420, 500, 460, { fill: C.card, col: C.orange });
    hand("Izohlar va Ustuvorlik", 1320, 480, { size: 34, color: C.orange });
    text("• SELECT 5--1;  -->  5 (izoh!)\n• SELECT 5 - -1; -->  6 (probel!)\n• 1 /* /* */ */ + 1 = 2 (ichma-ich)\n• 2 ^ 3 ^ 2 = 64 (chapdan)", 1320, 550, { size: 20, fam: MONO, color: C.ink });
    pill("5--1 = 5  |  5 - -1 = 6", 1530, 810, C.orange, 1, 20);

    pill("PostgreSQL 18.6 psql", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
