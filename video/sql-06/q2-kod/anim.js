// SQL 6-bob 2-qism: "Kod" — PostgreSQL 18 psql da jonli amaliyot
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
    hand("6-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Kod: Jonli Amaliyot", 960, 370, { size: 96, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL 18.6 psql terminalida sinovlar", 960, 480, { size: 50, align: 'center', p: P(t, 1.2, 1.2) });
    marker(500, 520, 920 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'psql'), 0.8);
    withA(kBadges, () => {
      pill("psql 18.6", 520, 640, C.blue, kBadges, 26);
      pill("0.1 + 0.2", 800, 640, C.purple, kBadges, 26);
      pill("numeric(5, 2)", 1100, 640, C.green, kBadges, 26);
      pill("10 / 4 bo'lish", 1420, 640, C.orange, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'jonli'), 0.8);
    withA(kDesc, () => {
      card(280, 740, 1360, 200, { fill: C.card, col: C.blue, p: kDesc });
      text("Raqamli tiplar aniqligi, to'lib ketish (overflow) va bo'lish qoidalari", 960, 800, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("psql terminalida haqiqiy buyruqlar va xatolarni tekshiramiz", 960, 860, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. POINT 1: 0.1 + 0.2
  function sPoint1(t) {
    heading("0.1 + 0.2 va Tenglik Sinovi (numeric vs float8)", t, L('L2').s - 0.4);

    // Terminal 1: Yig'indi
    const k1 = P(t, W('L2', 'nol'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 420, "1. SELECT 0.1 + 0.2 va float8 yig'indisi", [{
        b: {
          cmd: "SELECT 0.1 + 0.2 AS numeric_yigindi, 0.1::float8 + 0.2::float8 AS float_yigindi;",
          out: (TTY.point1 || " numeric_yigindi |    float_yigindi    \n-----------------+---------------------\n             0.3 | 0.30000000000000004\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Terminal 2: Tenglik
    const k2 = P(t, W('L4', 'flout'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 420, "2. Kasr sonlarni tenglikka solishtirish", [{
        b: {
          cmd: "SELECT 0.1::float8 + 0.2::float8 = 0.3::float8 AS teng_mi,\n       0.1 + 0.2 = 0.3 AS numeric_teng_mi;",
          out: (TTY.compare || " teng_mi | numeric_teng_mi \n---------+-----------------\n f       | t\n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Pastda tushuntirish
    const kDesc = P(t, W('L3', 'mutlaq'), 0.5);
    withA(kDesc, () => {
      card(140, 680, 1640, 270, { fill: C.card, col: C.blue, p: kDesc });
      hand("Nega birida 0.3, ikkinchisida 0.30000000000000004?", 180, 735, { size: 30, color: C.blue, p: kDesc });
      text("• PostgreSQL da oddiy son literallari (0.1, 0.2) sukut bo'yicha NUMERIC deb qabul qilinadi.", 180, 790, { size: 23, color: C.ink });
      text("• NUMERIC aniq arifmetika qilgani sababli 0.1 + 0.2 mutlaq to'g'ri 0.3 chiqadi va tenglik rost (t) bo'ladi.", 180, 835, { size: 23, weight: 600, color: C.green });
      text("• FLOAT8 (double) esa ikkilik kasr bo'lgani uchun xato yig'iladi va tenglik YOLG'ON (f) chiqadi!", 180, 880, { size: 23, weight: 700, color: C.red });
    });
  }

  // 3. OVERFLOW
  function sOverflow(t) {
    heading("Oraliqdan Chiqish (Overflow) va bigint", t, L('L5').s - 0.4);

    // Terminal 1: smallint va integer xatosi
    const k1 = P(t, W('L5', 'smol-int'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 420, "1. smallint va integer to'lib qolishi", [{
        b: {
          cmd: "SELECT 32767::smallint + 1::smallint;\nSELECT 2147483647 + 1;",
          out: [
            (TTY.smallint_err || "ERROR:  smallint out of range"),
            (TTY.int_err || "ERROR:  integer out of range")
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Terminal 2: bigint ga o'tkazish
    const k2 = P(t, W('L7', 'big-int'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 420, "2. bigint orqali xavfsiz hisob", [{
        b: {
          cmd: "SELECT 2147483647::bigint + 1 AS bigint_bilan;",
          out: (TTY.bigint || " bigint_bilan \n--------------\n   2147483648\n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Pastda tushuntirish
    const kDesc = P(t, W('L6', 'intijer'), 0.5);
    withA(kDesc, () => {
      card(140, 680, 1640, 270, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("POSTGRESQL QAT'IY XAVFSIZLIK QOIDASI", 410, 735, C.orange, kDesc, 22);
      text("• Ikkita integer sonining qo'shilishi ham integer bo'ladi.", 180, 790, { size: 23, color: C.ink });
      text("• Natija sig'masa, PostgreSQL boshqa dasturlash tillari kabi jimgina orqaga aylanmaydi (wrap-around) va kattaroq tipga o'tmaydi — xato beradi!", 180, 835, { size: 22, weight: 700, color: C.red });
      text("• Shuning uchun kattalashishi kutilgan ifodalarda oldindan bigint ga o'giring: (x::bigint + 1).", 180, 880, { size: 22, weight: 600, color: C.blue });
    });
  }

  // 4. NUMERIC EXP
  function sNumericExp(t) {
    heading("numeric(5, 2): Yaxlitlash va Overflow Xatosi", t, L('L8').s - 0.4);

    // Terminal 1: Yaxlitlanish
    const k1 = P(t, W('L8', 'besh'), 0.5);
    withA(k1, () => {
      term(140, 230, 780, 430, "1. CREATE TABLE narxlar (n numeric(5,2));", [{
        b: {
          cmd: "CREATE TABLE narxlar (n numeric(5,2));\nINSERT INTO narxlar VALUES (123.456), (999.994);\nSELECT * FROM narxlar;",
          out: (TTY.narxlar || "   n    \n--------\n 123.46\n 999.99\n(2 rows)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    // Terminal 2: 999.995 to'lib ketishi
    const k2 = P(t, W('L10', 'xato'), 0.5);
    withA(k2, () => {
      term(960, 230, 820, 430, "2. 999.995 kiritilsa: XATO!", [{
        b: {
          cmd: "INSERT INTO narxlar VALUES (999.995);",
          out: (TTY.num_overflow || "ERROR:  numeric field overflow\nDETAIL:  A field with precision 5, scale 2 must round to an absolute value less than 10^3.").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Pastda tushuntirish
    const kDesc = P(t, W('L9', 'sig‘adi'), 0.5);
    withA(kDesc, () => {
      card(140, 690, 1640, 260, { fill: C.card, col: C.green, p: kDesc });
      hand("Yaxlitlash va To'lib Ketish Zanjiri", 180, 745, { size: 30, color: C.green, p: kDesc });
      text("• 123.456 → scale 2 bo'lgani uchun 123.46 bo'lib yaxlitlandi (sig'di).", 180, 800, { size: 22, color: C.ink });
      text("• 999.994 → 999.99 bo'lib sig'di (butun qismi 3 ta raqam: 999).", 180, 840, { size: 22, color: C.ink });
      text("• 999.995 → yaxlitlanganda 1000.00 bo'ladi. U 4 ta butun xonaga ega, precision(5) − scale(2) = 3 ta raqamga esa SIG'MAYDI!", 180, 880, { size: 22, weight: 700, color: C.red });
    });
  }

  // 5. DIVISION
  function sDivision(t) {
    heading("Bo'lish Qoidasi: 10 / 4 Butun Bo'lish Siri", t, L('L11').s - 0.4);

    const k1 = P(t, W('L11', 'o‘nni'), 0.5);
    const k2 = P(t, W('L12', 'kasr'), 0.5);
    const k3 = P(t, W('L13', 'natija'), 0.5);

    // Chap: 3 ta aniq matematik quti (Formula kartalari)
    // 1. Butun bo'lish
    withA(k1, () => {
      card(140, 230, 800, 130, { fill: '#fef2f2', col: C.red, p: k1 });
      pill("BUTUN BO'LISH (INTEGER)", 300, 265, C.red, k1, 18);
      text("SELECT 10 / 4;  -->  2", 170, 315, { size: 28, fam: MONO, weight: 700, color: '#991b1b' });
      text("(2.5 emas! Nolga qarab kesiladi)", 560, 315, { size: 20, color: C.soft });
    });

    // 2. Kasr natija
    withA(k2, () => {
      card(140, 385, 800, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      pill("HAQIQIY KASR NATIJA", 280, 420, C.green, k2, 18);
      text("SELECT 10 / 4.0;         -->  2.5000000000000000", 170, 470, { size: 24, fam: MONO, weight: 700, color: C.green });
      text("SELECT 10::numeric / 4;  -->  2.5000000000000000", 170, 510, { size: 24, fam: MONO, color: C.ink });
    });

    // 3. Qoldiq (%)
    withA(k2, () => {
      card(140, 570, 800, 130, { fill: '#eff6ff', col: C.blue, p: k2 });
      pill("QOLDIQ OPERATORI (%)", 280, 605, C.blue, k2, 18);
      text("SELECT 10 % 4;  -->  2", 170, 655, { size: 28, fam: MONO, weight: 700, color: C.blue });
      text("(10 = 4 × 2 + 2 qoldiq)", 540, 655, { size: 20, color: C.soft });
    });

    // O'ng: Tushuntirish taxtasi
    withA(k1, () => {
      card(980, 230, 800, 470, { fill: C.card, col: C.blue, p: k1 });
      hand("Nega 2.5 emas, 2 chiqadi?", 1020, 290, { size: 34, color: C.blue, p: k1 });

      card(1020, 340, 720, 100, { fill: '#fff', col: C.red, p: k1 });
      text("INTEGER / INTEGER  =  INTEGER", 1045, 395, { size: 26, fam: MONO, weight: 800, color: C.red });

      text("• PostgreSQL da amallar qat'iy tiplashga asoslangan.", 1020, 480, { size: 22, color: C.ink });
      text("• Ikkita butun son nisbatida tiplar avtomatik kasrga o'tmaydi.", 1020, 525, { size: 22, color: C.ink });
      text("• Kasr kerak bo'lsa: operandlardan birini kamida kasr (4.0 yoki ::numeric) qilib belgilash shart!", 1020, 575, { size: 22, weight: 700, color: C.green, wrap: 720 });
    });

    // Pastda: Xulosa banneri
    withA(k3, () => {
      card(140, 725, 1640, 225, { fill: '#fff9e6', col: C.orange, p: k3 });
      pill("UCHTA NATIJA TAQQOSI", 300, 770, C.orange, k3, 22);

      const items = [
        { label: "10 / 4", res: "2", sub: "butun bo'lish", col: C.red },
        { label: "10 / 4.0", res: "2.5", sub: "kasr natija", col: C.green },
        { label: "10 % 4", res: "2", sub: "qoldiq", col: C.blue }
      ];
      items.forEach((it, idx) => {
        const cx = 350 + idx * 480;
        card(cx - 190, 810, 380, 115, { fill: '#fff', col: it.col, p: k3 });
        text(it.label + "  =  " + it.res, cx, 855, { size: 26, weight: 800, fam: MONO, color: it.col, align: 'center' });
        text(it.sub, cx, 895, { size: 20, color: C.soft, align: 'center' });
      });
    });
  }

  // 6. ROUND DIFF
  function sRoundDiff(t) {
    heading("round() Funksiyasi: numeric vs double precision", t, L('L14').s - 0.4);

    // Terminal 1: round() farqi
    const k1 = P(t, W('L14', 'raund'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. round(x::numeric) vs round(x::double)", [{
        b: {
          cmd: "SELECT x, round(x::numeric) AS num_round, round(x::double precision) AS dbl_round\nFROM generate_series(-2.5, 2.5, 1) AS x;",
          out: (TTY.round || "  x   | num_round | dbl_round \n------+-----------+-----------\n -2.5 |        -3 |        -2\n -1.5 |        -2 |        -2\n -0.5 |        -1 |        -0\n  0.5 |         1 |         0\n  1.5 |         2 |         2\n  2.5 |         3 |         2\n(6 rows)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Terminal 2: Maxsus qiymatlar va manfiy scale
    const k2 = P(t, W('L16', 'cheksizlik'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. NaN, Infinity va manfiy scale (15+)", [{
        b: {
          cmd: "SELECT 'NaN'::numeric = 'NaN'::numeric AS nan_teng,\n       'Infinity'::numeric + 1 AS cheksiz;\nSELECT 1234.5::numeric(2,-3) AS minglik;",
          out: (TTY.special ? TTY.special.split("\n") : [
            " nan_teng | cheksiz  ",
            "----------+----------",
            " t        | Infinity",
            "(1 row)",
            "",
            " minglik ",
            "---------",
            "    1000",
            "(1 row)"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    // Pastda tushuntirish
    const kDesc = P(t, W('L15', 'uch'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 260, { fill: '#eff6ff', col: C.purple, p: kDesc });
      hand("Yaxlitlash Farqi Siri", 180, 755, { size: 30, color: C.purple, p: kDesc });
      text("• NUMERIC: Noldan uzoqqa yaxlitlaydi (2.5 → 3, -2.5 → -3). Biz maktabda o'rgangan standart qoida.", 180, 810, { size: 22, color: C.ink });
      text("• DOUBLE: IEEE 754 bo'yicha eng yaqin JUFT songa yaxlitlaydi (2.5 → 2, 3.5 → 4, banker's rounding).", 180, 855, { size: 22, weight: 700, color: C.purple });
      text("• PostgreSQL 15+ dan boshlab numeric(2, -3) kabi manfiy scale bilan mingtalikkacha yaxlitlash mumkin!", 180, 900, { size: 21, color: C.blue });
    });
  }

  // 7. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L17').s - 0.4);

    const pillars = [
      { tit: "0.1 + 0.2 aniqligi", val: "PostgreSQL literallari sukut bo'yicha NUMERIC. Float esa 0.3000...04 bo'lib tenglik bermaydi.", col: C.blue },
      { tit: "Oraliq to'lishi", val: "smallint va integer chegaradan oshsa xato beradi. Katta IDlar uchun boshidan bigint ishlating.", col: C.purple },
      { tit: "10 / 4 butun bo'lish", val: "Butun sonlar bo'linsa natija butun son bo'ladi (2). Kasr natija uchun kamida bittasiga .0 qo'ying.", col: C.green },
      { tit: "numeric yaxlitlash", val: "Sig'maydigan kasrlar yaxlitlanadi, butun qism oshsa overflow xatosi chiqadi.", col: C.orange }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L17', 'xotirani') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 250;
        card(x, y, 380, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 30, y + 60, { size: 30, color: p.col, p: k });
        text(p.val, x + 30, y + 160, { size: 23, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L18', 'may'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 3-qismda: MySQL va SQLite Dialektlari", 180, 780, { size: 36, color: C.blue, p: kNext });
      text("MySQL da UNSIGNED, qat'iy rejim o'chganda son kesilishi, 10 DIV 4, SQLite Type Affinity va 6 ta tipik xatoni ko'rib chiqamiz.", 180, 845, { size: 24, color: C.ink, wrap: 1560 });
      pill("06-3 DIALEKTLAR", 1580, 780, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.point1.s) sIntro(t);
    else if (t < TM.scenes.overflow.s) sPoint1(t);
    else if (t < TM.scenes.numeric_exp.s) sOverflow(t);
    else if (t < TM.scenes.division.s) sNumericExp(t);
    else if (t < TM.scenes.round_diff.s) sDivision(t);
    else if (t < TM.scenes.xulosa.s) sRoundDiff(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("6-bob: Raqamlar — Kod", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("PostgreSQL 18.6 psql terminalida jonli sinovlar", 960, 300, { size: 46, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.blue });
    hand("0.1 + 0.2 va Tenglik", 180, 460, { size: 34, color: C.blue });
    text("• 0.1 + 0.2 = 0.3 (numeric)\n• 0.1::float8 + 0.2::float8\n  = 0.30000000000000004\n• float8 tenglik: FALSE\n• numeric tenglik: TRUE", 180, 540, { size: 21, fam: MONO, color: C.ink });
    pill("numeric vs float8", 390, 830, C.blue, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.green });
    hand("numeric(5, 2) Sinovi", 750, 460, { size: 34, color: C.green });
    text("• 123.456 → 123.46 (yaxlit)\n• 999.994 → 999.99 (sig'di)\n• 999.995 → OVERFLOW!\n• Butun qism 3 tadan oshdi\n• Qat'iy xato beradi", 750, 540, { size: 21, fam: MONO, color: C.ink });
    pill("numeric(5, 2)", 960, 830, C.green, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.orange });
    hand("Bo'lish va round()", 1320, 460, { size: 34, color: C.orange });
    text("• 10 / 4 = 2 (butun bo'lish)\n• 10 / 4.0 = 2.5 (kasr)\n• 10 % 4 = 2 (qoldiq)\n• round(2.5) = 3 (numeric)\n• round(2.5) = 2 (double)", 1320, 540, { size: 21, fam: MONO, color: C.ink });
    pill("Bo'lish & Yaxlitlash", 1530, 830, C.orange, 1, 20);

    pill("PostgreSQL 18.6 psql", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
