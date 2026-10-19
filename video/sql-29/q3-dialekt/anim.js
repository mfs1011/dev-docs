// SQL 29-bob 3-qism: "Dialektlar" — MySQL va SQLite da CTE farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. KIRISH
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("29-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da CTE Xususiyatlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Sintaksis cheklovlari, 1093 xatosi yechimi, MATERIALIZED maslahati va xatti-harakatlar", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'si-ti-i'), 0.8);
    withA(kCards, () => {
      const engines = [
        {
          name: "PostgreSQL 18",
          badge: "To'liq Standart",
          col: C.blue,
          points: [
            "• Standart CTE va Rekursiv CTE",
            "• MATERIALIZED / NOT MATERIALIZED",
            "• Data-modifying (DELETE/UPDATE + RETURNING)",
            "• Qat'iy qoidalar: oldinga murojaat xato",
          ]
        },
        {
          name: "MySQL 8.0+",
          badge: "Keng Qo'llaniladi",
          col: C.green,
          points: [
            "• WITH ... SELECT, UPDATE, DELETE",
            "• WITH bilan INSERT boshlab bo'lmaydi",
            "• Mashhur 1093 xatosini hal qiladi",
            "• MATERIALIZED sintaksisi yo'q",
          ]
        },
        {
          name: "SQLite 3.35+",
          badge: "Ixcham va Moslashuvchan",
          col: C.purple,
          points: [
            "• Standart CTE va Rekursiv CTE",
            "• MATERIALIZED faqat maslahat (hint)",
            "• Oldinga murojaatga ruxsat beradi",
            "• CTE ichida DELETE/UPDATE yo'q",
          ]
        },
      ];

      engines.forEach((item, i) => {
        const bx = 100 + i * 585;
        card(bx, 440, 555, 500, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + 277, 490, item.col, kCards, 22);
        pill(item.badge, bx + 277, 540, '#64748b', kCards, 16);

        item.points.forEach((pt, pi) => {
          text(pt, bx + 35, 615 + pi * 60, { size: 19, weight: 600, color: C.ink, fam: UI });
        });
      });
    });
  }

  // 2. MYSQL LIMIT VA UPDATE (1093)
  function sMysql(t) {
    heading("MySQL: INSERT Cheklovi va 1093 Xatosi Yechimi", t, TM.scenes.mysql_limit_va_update.s);

    const k = P(t, TM.scenes.mysql_limit_va_update.s + 0.3, 0.8);
    withA(k, () => {
      // Left: WITH bilan INSERT boshlab bo'lmasligi
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("MySQL Cheklovi: WITH bilan INSERT Boshlanmaydi", 520, 250, C.red, k, 18);

      card(140, 310, 760, 190, { fill: '#1e293b', col: '#334155', p: k });
      text("-- MySQL DA SYNTAX ERROR:", 170, 345, { size: 17, color: '#f87171', fam: MONO });
      text("WITH t AS (SELECT 1 AS val)", 170, 385, { size: 18, color: '#fff', fam: MONO });
      text("INSERT INTO arxiv SELECT * FROM t; -- XATO!", 170, 425, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("ERROR 1064 (42000): syntax error...", 170, 465, { size: 17, color: '#fca5a5', fam: MONO });

      card(140, 530, 760, 210, { fill: '#f0fdf4', col: C.green, p: k });
      text("To'g'ri shakl (INSERT dan keyin WITH):", 170, 570, { size: 21, weight: 700, color: C.green, fam: UI });
      text("INSERT INTO arxiv", 170, 615, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("WITH t AS (SELECT 1)", 170, 655, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("SELECT * FROM baholar WHERE id = 4;", 170, 695, { size: 19, color: C.ink, fam: MONO });

      card(140, 765, 760, 165, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qoida: PostgreSQL va SQLite da WITH eng boshida turadi,", 170, 810, { size: 18, color: C.ink, fam: UI });
      text("MySQL da esa INSERT buyrug'i WITH dan oldin kelishi shart!", 170, 855, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: 1093 Error Solution
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("1093 Xatosini CTE Bilan Yechish", 1410, 250, C.green, k, 18);

      card(1040, 310, 740, 170, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("MySQL ning eng mashhur xatosi:", 1070, 345, { size: 18, color: '#fca5a5', fam: UI });
      text("ERROR 1093 (HY000): You can't specify target", 1070, 390, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("table 'baholar' for update in FROM clause", 1070, 430, { size: 17, weight: 700, color: '#f87171', fam: MONO });

      card(1040, 505, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- CTE bilan oson va toza yechim:", 1070, 540, { size: 17, color: '#86efac', fam: MONO });
      text("WITH m AS (SELECT max(ball) AS mx FROM baholar)", 1070, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("UPDATE baholar", 1070, 620, { size: 18, weight: 700, color: '#fff', fam: MONO });
      text("SET ball = (SELECT mx FROM m)", 1070, 660, { size: 18, color: '#fbbf24', fam: MONO });
      text("WHERE id = 5;  -- UPDATE 1 (Muvaffaqiyatli!)", 1070, 700, { size: 18, color: '#86efac', fam: MONO });

      card(1040, 770, 740, 160, { fill: '#f0fdf4', col: C.green, p: k });
      text("CTE o'sha jadvalni vaqtinchalik xotiraga olib beradi,", 1070, 815, { size: 18, color: C.ink, fam: UI });
      text("shu sababli MySQL bir vaqtda o'qish va yozish ziddiyatini sezmaydi!", 1070, 860, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. SQLITE MATERIALIZED HINT
  function sSqliteMat(t) {
    heading("SQLite: MATERIALIZED Majburiy Emas, Shunchaki Maslahat", t, TM.scenes.sqlite_materialized_hint.s);

    const k = P(t, TM.scenes.sqlite_materialized_hint.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQLite Syntax & Result
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite 3.35+ MATERIALIZED Sintaksisi", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH w AS MATERIALIZED (", 170, 355, { size: 20, weight: 700, color: '#c084fc', fam: MONO });
      text("  SELECT * FROM baholar", 170, 400, { size: 19, color: '#f8fafc', fam: MONO });
      text(")", 170, 440, { size: 20, weight: 700, color: '#c084fc', fam: MONO });
      text("SELECT count(*) FROM w;", 170, 485, { size: 20, weight: 700, color: '#86efac', fam: MONO });

      card(140, 560, 760, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("sqlite3 -box natijasi:", 170, 595, { size: 17, color: '#94a3b8', fam: MONO });
      text("╭──────────╮", 170, 635, { size: 20, color: '#64748b', fam: MONO });
      text("│ count(*) │", 170, 670, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("╞══════════╡", 170, 700, { size: 20, color: '#64748b', fam: MONO });
      text("│        6 │", 170, 730, { size: 20, weight: 700, color: '#fff', fam: MONO });
      text("╰──────────╯", 170, 755, { size: 20, color: '#64748b', fam: MONO });

      card(140, 785, 760, 145, { fill: '#faf5ff', col: C.purple, p: k });
      text("NOT MATERIALIZED ham qo'llab-quvvatlanadi,", 170, 830, { size: 19, color: C.ink, fam: UI });
      text("ikkala kalit so'z ham SQLite da sintaktik jihatdan to'g'ri.", 170, 875, { size: 18, color: C.ink, fam: UI });

      // Right: Hint vs Strict Barrier
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("Taqqoslash: PostgreSQL vs SQLite Xatti-harakati", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 280, { fill: '#eff6ff', col: C.blue, p: k });
      text("PostgreSQL da (Qat'iy To'siq):", 1070, 355, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• MATERIALIZED optimizatorga qat'iy buyruq hisoblanadi.", 1070, 405, { size: 18, color: C.ink, fam: UI });
      text("• Baza CTE ni alohida hisoblashga majbur.", 1070, 455, { size: 18, color: C.ink, fam: UI });
      text("• Tashqi WHERE shartlarini CTE ichiga tushirmaydi.", 1070, 505, { size: 18, color: C.ink, fam: UI });
      text("• Bajarilish rejasi to'liq o'zgaradi.", 1070, 555, { size: 18, color: C.soft, fam: UI });

      card(1040, 620, 740, 310, { fill: '#fffbeb', col: C.orange, p: k });
      text("SQLite da (Faqat Maslahat / Hint):", 1070, 665, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• MATERIALIZED — qat'iy buyruq EMAS, maslahat!", 1070, 715, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("• Optimizator o'zi hisob-kitob qilib, agar inline qilish", 1070, 765, { size: 18, color: C.ink, fam: UI });
      text("  foydaliroq bo'lsa, bu so'zni inkor qilishi mumkin.", 1070, 810, { size: 18, color: C.ink, fam: UI });
      text("• SQLite har doim xotira va tezlikni o'zi tanlaydi.", 1070, 865, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. SQLITE FORWARD REFERENCE
  function sSqliteForward(t) {
    heading("SQLite da Oldinga Murojaat (Forward Reference)", t, TM.scenes.sqlite_forward_ref.s);

    const k = P(t, TM.scenes.sqlite_forward_ref.s + 0.3, 0.8);
    withA(k, () => {
      // Left: PostgreSQL and MySQL error
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("PostgreSQL va MySQL: Qat'iy Xato!", 520, 250, C.red, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH a AS (SELECT * FROM b), -- 'b' hali e'lon qilinmagan!", 170, 355, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("     b AS (SELECT 1 AS x)", 170, 400, { size: 18, color: '#fff', fam: MONO });
      text("SELECT * FROM a;", 170, 440, { size: 18, color: '#cbd5e1', fam: MONO });

      card(140, 560, 760, 160, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("PostgreSQL: ERROR: relation \"b\" does not exist", 170, 605, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("MySQL:      ERROR 1146 (42S02): Table 'b' doesn't exist", 170, 655, { size: 17, weight: 700, color: '#fca5a5', fam: MONO });

      card(140, 750, 760, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Sababi: Standart SQL bo'yicha e'lon qilish", 170, 795, { size: 20, weight: 700, color: C.red, fam: UI });
      text("tartibi yuqoridan pastga qat'iy bo'lishi shart.", 170, 840, { size: 18, color: C.ink, fam: UI });
      text("Kelajakdagi CTE larga tayanib bo'lmaydi.", 170, 885, { size: 18, color: C.soft, fam: UI });

      // Right: SQLite surprise!
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite: Jimgina Ishlab Ketadi!", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("sqlite3 :memory:", 1070, 345, { size: 16, color: '#94a3b8', fam: MONO });
      text("WITH a AS (SELECT * FROM b),", 1070, 390, { size: 18, color: '#cbd5e1', fam: MONO });
      text("     b AS (SELECT 1 AS x)", 1070, 430, { size: 18, color: '#fff', fam: MONO });
      text("SELECT * FROM a;", 1070, 470, { size: 18, color: '#cbd5e1', fam: MONO });

      card(1040, 560, 740, 160, { fill: '#0f172a', col: '#334155', p: k });
      text("╭───╮", 1070, 595, { size: 19, color: '#64748b', fam: MONO });
      text("│ x │", 1070, 625, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("╞═══╡", 1070, 655, { size: 19, color: '#64748b', fam: MONO });
      text("│ 1 │  -- XATOSIZ ISHLADI!", 1070, 685, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("╰───╯", 1070, 715, { size: 19, color: '#64748b', fam: MONO });

      card(1040, 750, 740, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Muhim Tavsiya (Portability):", 1070, 790, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("• SQLite barcha CTE larni oldindan yig'ib oladi.", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("• Lekin bu xususiyatga TAYANMANG! Kodni PostgreSQL", 1070, 875, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  yoki MySQL ga ko'chirganda darhol xato beradi.", 1070, 915, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 5. CHEGARALAR VA XULOSA
  function sChegaralar(t) {
    heading("O'zgartiruvchi CTE Cheklovlari va Dialektlar Xulosasi", t, TM.scenes.chegaralar.s);

    const k = P(t, TM.scenes.chegaralar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Data-modifying limitation
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("MySQL va SQLite: DELETE/UPDATE CTE Yo'q", 520, 250, C.red, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Faqat PostgreSQL da ishlaydigan kod:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("WITH d AS (", 170, 390, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("  DELETE FROM baholar RETURNING *  -- XATO!", 170, 430, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text(")", 170, 470, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("INSERT INTO arxiv SELECT * FROM d;", 170, 510, { size: 19, color: '#cbd5e1', fam: MONO });

      card(140, 560, 760, 370, { fill: '#fff', col: C.red, p: k });
      text("Cheklov tushuntirishi:", 170, 605, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• MySQL va SQLite tizimlarida CTE faqat", 170, 660, { size: 19, color: C.ink, fam: UI });
      text("  SELECT so'rovlari uchun mo'ljallangan.", 170, 705, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("• CTE ichida DELETE, UPDATE yoki INSERT yozish", 170, 755, { size: 19, color: C.ink, fam: UI });
      text("  sintaksis xatosi hisoblanadi.", 170, 800, { size: 19, color: C.ink, fam: UI });
      text("• Agar bunday amallar kerak bo'lsa, alohida tranzaksiya", 170, 855, { size: 18, color: C.soft, fam: UI });
      text("  va oraliq vaqtinchalik jadvallardan foydalaniladi.", 170, 895, { size: 18, color: C.soft, fam: UI });

      // Right: Comparison Matrix
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("3 Dialekt Solishtirma Matritsasi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 420, { fill: '#1e293b', col: '#334155', p: k });
      const rows = [
        { feature: "Xususiyat", pg: "Postgres", my: "MySQL", sq: "SQLite", hdr: true },
        { feature: "Oddiy CTE (WITH)", pg: "HA", my: "HA", sq: "HA" },
        { feature: "Rekursiv CTE (30-bob)", pg: "HA", my: "HA", sq: "HA" },
        { feature: "MATERIALIZED sint.", pg: "HA (qat'iy)", my: "YO'Q", sq: "Maslahat" },
        { feature: "WITH ... INSERT", pg: "HA", my: "YO'Q*", sq: "HA" },
        { feature: "Oldinga murojaat", pg: "Xato", my: "Xato", sq: "Ruxsat" },
        { feature: "Data-modifying CTE", pg: "HA", my: "YO'Q", sq: "YO'Q" },
      ];

      rows.forEach((r, idx) => {
        const ry = 345 + idx * 52;
        const color = r.hdr ? '#93c5fd' : (idx % 2 === 0 ? '#f8fafc' : '#cbd5e1');
        const weight = r.hdr ? 700 : 600;
        text(r.feature, 1065, ry, { size: 17, weight, color, fam: MONO });
        text(r.pg, 1370, ry, { size: 17, weight, color: r.pg === 'HA' ? '#86efac' : (r.hdr ? color : '#f87171'), fam: MONO, align: 'center' });
        text(r.my, 1530, ry, { size: 17, weight, color: r.my === 'HA' ? '#86efac' : (r.hdr ? color : '#fbbf24'), fam: MONO, align: 'center' });
        text(r.sq, 1690, ry, { size: 17, weight, color: r.sq === 'HA' ? '#86efac' : (r.hdr ? color : '#c084fc'), fam: MONO, align: 'center' });
        if (r.hdr) {
          text("----------------------------------------------------------------", 1065, ry + 26, { size: 16, color: '#64748b', fam: MONO });
        }
      });

      card(1040, 750, 740, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("* MySQL da faqat: INSERT ... WITH tartibida ishlaydi.", 1070, 790, { size: 17, color: C.soft, fam: MONO });
      text("Xulosa: PostgreSQL barcha imkoniyatlarga to'liq ega,", 1070, 835, { size: 19, weight: 700, color: C.green, fam: UI });
      text("MySQL va SQLite da esa standart sintaksisga rioya qiling!", 1070, 875, { size: 19, weight: 700, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_limit_va_update.s) {
      sIntro(t);
    } else if (t < TM.scenes.sqlite_materialized_hint.s) {
      sMysql(t);
    } else if (t < TM.scenes.sqlite_forward_ref.s) {
      sSqliteMat(t);
    } else if (t < TM.scenes.chegaralar.s) {
      sSqliteForward(t);
    } else {
      sChegaralar(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
