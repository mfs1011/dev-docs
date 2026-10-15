// SQL 6-bob 3-qism: "Dialektlar" — MySQL, SQLite va 6 ta tipik xato
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
    hand("6-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Dialektlar va 6 ta Tipik Xato", 960, 370, { size: 90, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL vs MySQL vs SQLite", 960, 480, { size: 50, align: 'center', p: P(t, 1.2, 1.2) });
    marker(500, 520, 920 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'may'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: UNSIGNED & DIV", 500, 640, C.orange, kBadges, 26);
      pill("SQLite: Type Affinity", 960, 640, C.green, kBadges, 26);
      pill("6 ta xavfli tuzoq", 1400, 640, C.red, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'oltita'), 0.8);
    withA(kDesc, () => {
      card(280, 740, 1360, 200, { fill: C.card, col: C.red, p: kDesc });
      text("Oraliqdan oshganda sonlarning buzilishi, sukut bo'yicha kasr bo'linma", 960, 800, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("va amaliyotda eng ko'p uchraydigan moliyaviy xatolarni tahlil qilamiz", 960, 860, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. MYSQL
  function sMysql(t) {
    heading("MySQL: UNSIGNED, Qat'iy Rejim va DIV", t, L('L2').s - 0.4);

    // Terminal 1: Eskirgan atributlar
    const k1 = P(t, W('L2', 'ansaynd'), 0.5);
    term(140, 230, 780, 360, "1. Eskirgan atributlar: ZEROFILL va UNSIGNED", [{
      b: {
        cmd: "CREATE TABLE eskirgan (a INT(4) ZEROFILL, b DECIMAL(5,2) UNSIGNED);\nSHOW WARNINGS;",
        out: (TTY.mysql && TTY.mysql.warnings ? TTY.mysql.warnings.split("\n").slice(0, 8) : [
          "Warning 1681: The ZEROFILL attribute is deprecated",
          "Warning 1681: Integer display width is deprecated",
          "Warning 1681: UNSIGNED for decimal is deprecated"
        ])
      },
      t: k1,
      typeDur: 1.0
    }], { font: 14 });

    // Terminal 2: Qat'iy rejim o'chganda (sql_mode = '') kesilish
    const k2 = P(t, W('L3', 'kesib'), 0.5);
    term(960, 230, 820, 360, "2. Qat'iy rejim o'chsa: son chegaragacha kesiladi!", [{
      b: {
        cmd: "SET SESSION sql_mode = '';\nINSERT INTO sonlar (t, tu) VALUES (128, -1);\nSELECT t, tu FROM sonlar WHERE t IS NOT NULL;",
        out: (TTY.mysql && TTY.mysql.relaxed ? TTY.mysql.relaxed.split("\n") : [
          "+------+------+",
          "| t    | tu   |",
          "+------+------+",
          "|  127 |    0 |",
          "+------+------+"
        ])
      },
      t: k2,
      typeDur: 1.0
    }], { font: 16 });

    // Pastdagi tushuntirish & Bo'lish amali
    const kExplain = P(t, W('L4', 'o‘nni'), 0.6);
    withA(kExplain, () => {
      card(140, 630, 1640, 350, { fill: C.card, col: C.orange, p: kExplain });
      pill("MySQL DA BO'LISH VA QAT'IY REJIM", 380, 680, C.orange, kExplain, 22);

      text("• DIQQAT: sql_mode = '' bo'lsa, 128 kiritilsa 127 qoladi, -1 kiritilsa 0 bo'ladi! Ma'lumot jimgina buziladi.", 180, 735, { size: 22, weight: 700, color: C.red });
      text("• Bo'lish amali: MySQL da 10 / 4 har doim 2.5000 (kasr) beradi. Butun bo'lish uchun 10 DIV 4 ishlatiladi.", 180, 785, { size: 23, color: C.green });
      text("• Eskirgan atributlar: INT(4) kengligi va DECIMAL UNSIGNED kelajakda butunlay olib tashlanadi.", 180, 835, { size: 22, color: C.ink });

      // Mini terminal: bo'lish natijasi
      card(180, 875, 1560, 80, { fill: '#fff', col: C.blue, p: kExplain });
      text("SELECT 10 / 4 AS bolish (2.5000), 10 DIV 4 AS butun_bolish (2), 10 % 4 AS qoldiq (2);", 210, 915, { size: 21, fam: MONO, weight: 600, color: C.blue });
    });
  }

  // 3. SQLITE
  function sSqlite(t) {
    heading("SQLite: Moslashuvchan Tiplash (Affinity) va Kasrlar", t, L('L6').s - 0.4);

    // Chap tomon: Type Affinity kartasi
    const kAff = P(t, W('L6', 'ustunga'), 0.5);
    withA(kAff, () => {
      card(140, 230, 780, 430, { fill: '#f0fdf4', col: C.green, p: kAff });
      hand("SQLite Type Affinity Qoidasi", 180, 280, { size: 30, color: C.green, p: kAff });
      text("SQLite da tip ustunga emas, qiymatga tegishli!", 180, 330, { size: 22, weight: 600, color: C.ink });

      card(180, 370, 700, 70, { fill: '#fff', col: C.blue, p: kAff });
      pill("DECIMAL(5,2)", 300, 405, C.purple, kAff, 18);
      text("Qavslar e'tiborsiz, qiymat REAL bo'lib qoladi!", 430, 405, { size: 19, color: C.ink });

      card(180, 460, 700, 70, { fill: '#fff', col: C.green, p: kAff });
      pill("'3.0e+5' matni", 285, 495, C.green, kAff, 18);
      text("NUMERIC da butun 300000 ga aylanadi", 395, 495, { size: 19, color: C.ink });

      card(180, 550, 700, 85, { fill: '#fef2f2', col: C.red, p: kAff });
      pill("To'lib ketish", 270, 590, C.red, kAff, 18);
      text("INTEGER oshib ketsa, xato bermay REAL ga o'tadi!", 380, 590, { size: 19, weight: 700, color: C.red });
    });

    // O'ng tomon: Terminal: SQLite chiqishlari
    const kTerm = P(t, W('L8', 'chegarasidan'), 0.5);
    term(960, 230, 820, 430, "SQLite da sonlar va decimal_add()", [{
      b: {
        cmd: "SELECT 9223372036854775807 + 1 AS natija, typeof(...) AS tip;\nSELECT 0.1 + 0.2 AS yigindi;\nSELECT decimal_add('0.1', '0.2') AS aniq;",
        out: [
          "natija                  tip",
          "----------------------  ----",
          "9.2233720368547758e+18  real",
          "",
          "yigindi              aniq",
          "-------------------  ----",
          "0.30000000000000004  0.3"
        ]
      },
      t: kTerm,
      typeDur: 1.0
    }], { font: 16 });

    // Pastki xulosa
    const kFoot = P(t, W('L8', 'desimal'), 0.5);
    withA(kFoot, () => {
      card(140, 690, 1640, 260, { fill: C.card, col: C.blue, p: kFoot });
      hand("SQLite da Pulni Qanday Saqlash Kerak?", 180, 745, { size: 30, color: C.blue, p: kFoot });
      text("• SQLite da rasmiy DECIMAL tipi yo'q. Ustunni DECIMAL(10,2) deb e'lon qilsangiz ham, u REAL kasr bo'lib saqlanadi.", 180, 800, { size: 22, color: C.ink });
      text("• Yechim 1: Pulni har doim eng kichik birlikda (tiyinlarda) INTEGER qilib saqlang (masalan, 400000 tiyin).", 180, 845, { size: 22, weight: 700, color: C.green });
      text("• Yechim 2: Matn sifatida saqlab, sqlite3 CLI dagi maxsus decimal_add() kengaytmasidan foydalaning.", 180, 890, { size: 21, color: C.soft });
    });
  }

  // 4. COMPARISON TABLE
  function sComparison(t) {
    heading("Uch Tizim Taqqoslash Taxtasi", t, L('L9').s - 0.4);

    const kTable = P(t, W('L9', 'uchala'), 0.6);
    withA(kTable, () => {
      const x = 140, y = 230, w = 1640;
      card(x, y, w, 750, { fill: C.card, col: C.blue, p: kTable });

      // Header row
      card(x, y, w, 70, { fill: '#1e293b', col: '#1e293b' });
      text("Xususiyat", x + 30, y + 35, { size: 24, weight: 700, fam: UI, color: '#fff' });
      text("PostgreSQL 18", x + 430, y + 35, { size: 24, weight: 700, fam: UI, color: '#93c5fd' });
      text("MySQL 9", x + 850, y + 35, { size: 24, weight: 700, fam: UI, color: '#fdba74' });
      text("SQLite 3", x + 1270, y + 35, { size: 24, weight: 700, fam: UI, color: '#86efac' });

      // Qatorlar
      const rows = [
        {
          prop: "Butun son turlari",
          pg: "smallint, integer, bigint",
          my: "+ TINYINT, MEDIUMINT, UNSIGNED",
          sq: "Bitta INTEGER klassi (8 bayt)",
          at: W('L9', 'may')
        },
        {
          prop: "Aniq kasr tipi",
          pg: "numeric(p, s), 1000 xonagacha",
          my: "DECIMAL(M, D), 65 xonagacha",
          sq: "Yo'q (decimal_add kengaytmasi)",
          at: W('L9', 'es-kyu-layt')
        },
        {
          prop: "0.1 literali tabiati",
          pg: "NUMERIC (mutlaq aniq)",
          my: "DECIMAL (mutlaq aniq)",
          sq: "REAL (taqribiy kasr)",
          at: W('L10', 'nol')
        },
        {
          prop: "Sig'maydigan son yozilsa",
          pg: "Qat'iy XATO (overflow)",
          my: "Qat'iyda xato, aks holda kesadi",
          sq: "Qabul qilaveradi",
          at: W('L11', 'xato')
        },
        {
          prop: "10 / 4 amali natijasi",
          pg: "2 (butun bo'lish)",
          my: "2.5000 (kasr bo'lish; DIV=2)",
          sq: "2 (butun bo'lish)",
          at: W('L11', 'qabul')
        }
      ];

      rows.forEach((r, idx) => {
        const rowY = y + 70 + idx * 130;
        const kRow = P(t, r.at, 0.4);
        withA(kRow, () => {
          if (idx % 2 === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x, rowY, w, 130);
          }
          sline(x, rowY, x + w, rowY, { p: 1, w: 1, col: 'rgba(0,0,0,0.08)' });

          text(r.prop, x + 30, rowY + 65, { size: 22, weight: 700, color: C.ink });
          text(r.pg, x + 430, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.blue, wrap: 380 });
          text(r.my, x + 850, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.orange, wrap: 380 });
          text(r.sq, x + 1270, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.green, wrap: 360 });
        });
      });
    });
  }

  // 5. 6 TA TIPIK XATO (Traps)
  function sTraps(t) {
    heading("Raqamlar Bo'yicha 6 ta Tipik Xato", t, L('L12').s - 0.4);

    const traps = [
      { num: "1", tit: "Pulni float/double da saqlash", desc: "Taqribiy kasrlar (0.1 + 0.2 ≠ 0.3) sababli yig'indilarda tiyinlar yo'qoladi. Faqat NUMERIC!", col: C.red, at: W('L13', 'birinchi') },
      { num: "2", tit: "Kasrlarni '=' bilan solishtirish", desc: "Taqribiy qiymat aynan teng chiqmaydi. Aniq tip yoki ruxsat etilgan farq qo'llang.", col: C.orange, at: W('L14', 'ikkinchi') },
      { num: "3", tit: "Katta ID larga INTEGER qo'yish", desc: "2.14 milliarddan keyin har bir INSERT xato beradi. Yirik jadvallarda boshidan BIGINT!", col: C.purple, at: W('L15', 'uchinchi') },
      { num: "4", tit: "10 / 4 ni hamma joyda 2.5 deb kutish", desc: "PostgreSQL va SQLite da butun bo'linadi (2). Kasr natija uchun 10 / 4.0 deb yozing.", col: C.blue, at: W('L16', 'tortinchi') },
      { num: "5", tit: "MySQL qat'iy rejimini o'chirish", desc: "Oraliqdan oshgan son xato bermay chegaragacha kesiladi (128 → 127). Ma'lumot buziladi!", col: C.red, at: W('L17', 'beshinchi') },
      { num: "6", tit: "SQLite da DECIMAL pulni saqlaydi deb o'ylash", desc: "Qavslar e'tiborsiz, qiymat REAL bo'lib qoladi. Tiyinlarda INTEGER qilib saqlang.", col: C.green, at: W('L18', 'oltinchi') }
    ];

    traps.forEach((trap, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 140 + col * 840, y = 230 + row * 240;
      const k = P(t, trap.at, 0.4);
      withA(k, () => {
        const isCurrent = t >= trap.at && (i === 5 || t < traps[i + 1].at);
        const fill = isCurrent ? '#fef2f2' : C.card;
        const bcol = isCurrent ? C.red : trap.col;

        card(x, y, 800, 215, { fill, col: bcol, p: k });
        pill(`XATO #${trap.num}`, x + 90, y + 45, bcol, k, 20);
        hand(trap.tit, x + 200, y + 45, { size: 28, color: bcol, p: k });

        text(trap.desc, x + 30, y + 125, { size: 22, color: C.ink, wrap: 740 });
        if (isCurrent) {
          marker(x + 25, y + 175, 750, 12, C.hlRed, 1);
        }
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Keyingi Bob", t, L('L19').s - 0.4);

    const pillars = [
      { tit: "PostgreSQL", sub: "Qat'iy aniqlik", desc: "Oddiy sonlar sukut bo'yicha NUMERIC. 10/4=2. Qat'iy oraliq nazorati va overflow xatolari.", col: C.blue },
      { tit: "MySQL", sub: "UNSIGNED & DIV", desc: "Qat'iy rejim shart. Bo'lish doim kasr (2.5000), butun bo'lish uchun DIV. ZEROFILL eskirgan.", col: C.orange },
      { tit: "SQLite", sub: "Type Affinity", desc: "Qat'iy tiplash yo'q. DECIMAL qavslari e'tiborsiz (REAL). Pul uchun tiyinlarda INTEGER ma'qul.", col: C.green }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L19', 'raqamli') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 560, y = 250;
        card(x, y, 520, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 40, y + 60, { size: 36, color: p.col, p: k });
        pill(p.sub, x + 260, y + 120, p.col, k, 20);
        text(p.desc, x + 40, y + 210, { size: 24, color: C.ink, wrap: 440 });
      });
    });

    const kNext = P(t, W('L19', 'yettinchi'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 200, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 7-bobda: Matn va Binar Ma'lumot Turlari", 180, 785, { size: 38, color: C.blue, p: kNext });
      text("VARCHAR, CHAR, TEXT, bo'sh joylarni kesish (padding), kollatsiya sirlari va BYTEA binar ma'lumotlar.", 180, 855, { size: 26, color: C.ink });
      pill("07 MATN", 1560, 785, C.blue, kNext, 22);
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
    hand("6-bob: Raqamlar — Dialektlar", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("MySQL (UNSIGNED, DIV), SQLite (Affinity) va 6 ta tipik xato", 960, 300, { size: 46, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.orange });
    hand("MySQL Xususiyatlari", 180, 460, { size: 34, color: C.orange });
    text("• TINYINT, UNSIGNED\n• sql_mode='' da son kesiladi\n• 10 / 4 = 2.5000 (kasr)\n• 10 DIV 4 = 2 (butun)\n• ZEROFILL eskirgan", 180, 540, { size: 22, fam: MONO, color: C.ink });
    pill("MySQL Dialekti", 390, 830, C.orange, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.green });
    hand("SQLite Affinity", 750, 460, { size: 34, color: C.green });
    text("• DECIMAL tipi yo'q (REAL)\n• 0.1 literali taqribiy\n• To'lib ketsa REAL ga o'tadi\n• decimal_add() kengaytmasi\n• Tiyinlarda INTEGER tavsiya", 750, 540, { size: 21, fam: MONO, color: C.ink });
    pill("SQLite Affinity", 960, 830, C.green, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.red });
    hand("6 ta Tipik Xato", 1320, 460, { size: 34, color: C.red });
    text("1. Pulni float da saqlash\n2. Kasrlarni '=' bilan tekshirish\n3. ID ga INTEGER to'lib qolishi\n4. 10/4 dan 2.5 kutish\n5. MySQL qat'iy rejimini o'chirish\n6. SQLite DECIMAL ga ishonish", 1320, 540, { size: 20, fam: MONO, color: C.ink });
    pill("6 ta amaliy tuzoq", 1530, 830, C.red, 1, 20);

    pill("PostgreSQL vs MySQL vs SQLite", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
