// SQL 30-bob 3-qism: "Dialektlar" — MySQL va SQLite da Rekursiv CTE
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
    hand("30-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Rekursiv CTE", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Sintaksis talablari, tiplar kengligi, daraja chegarasi va navbat boshqaruvi", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'rekursiv'), 0.8);
    withA(kCards, () => {
      const engines = [
        {
          name: "PostgreSQL 18",
          badge: "Standart va Qulay",
          col: C.blue,
          points: [
            "• SEARCH DEPTH/BREADTH FIRST",
            "• CYCLE aylanani aniqlash",
            "• Rekursiv qismda LIMIT/ORDER BY yo'q",
            "• RECURSIVE kalit so'zi majburiy",
          ]
        },
        {
          name: "MySQL 8.0+",
          badge: "Cheklovlar va Himoya",
          col: C.green,
          points: [
            "• VALUES ROW(1) talabi",
            "• SEARCH va CYCLE yo'q (CONCAT qo'lda)",
            "• cte_max_recursion_depth = 1000",
            "• Rekursiv qismda LIMIT mumkin",
          ]
        },
        {
          name: "SQLite 3.35+",
          badge: "Navbat va Moslashuvchan",
          col: C.purple,
          points: [
            "• FIFO Navbat (Queue) mexanizmi",
            "• Ichki ORDER BY bilan DFS/BFS boshqaruvi",
            "• Ichki LIMIT va OFFSET ruxsat etilgan",
            "• RECURSIVE so'zi ixtiyoriy (shart emas!)",
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

  // 2. MYSQL LIMIT VA SYNTAX
  function sMysqlSyntax(t) {
    heading("MySQL: VALUES ROW() Talabi va SEARCH/CYCLE Yo'qligi", t, TM.scenes.mysql_limit_va_syntax.s);

    const k = P(t, TM.scenes.mysql_limit_va_syntax.s + 0.3, 0.8);
    withA(k, () => {
      // Left: VALUES ROW()
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. VALUES ROW() Sintaksisi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- PostgreSQL: VALUES (1) -- To'g'ri", 170, 350, { size: 18, color: '#94a3b8', fam: MONO });
      text("-- MySQL DA SYNTAX ERROR:", 170, 390, { size: 18, color: '#f87171', fam: MONO });
      text("WITH RECURSIVE t(n) AS (", 170, 430, { size: 18, color: '#fff', fam: MONO });
      text("    VALUES (1)  -- XATO 1064! ROW() talab qilinadi", 170, 470, { size: 18, weight: 700, color: '#f87171', fam: MONO });

      card(140, 540, 760, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("MySQL dagi to'g'ri yozilishi:", 170, 580, { size: 21, weight: 700, color: C.green, fam: UI });
      text("WITH RECURSIVE t(n) AS (", 170, 625, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("    VALUES ROW(1)  -- Yoki SELECT 1", 170, 665, { size: 19, weight: 700, color: C.green, fam: MONO });
      text(")", 170, 700, { size: 19, color: C.ink, fam: MONO });

      card(140, 750, 760, 170, { fill: '#eff6ff', col: C.blue, p: k });
      text("MySQL ning VALUES operatori qat'iy ravishda", 170, 795, { size: 18, color: C.ink, fam: UI });
      text("har bir qator uchun ROW() kalit so'zini talab qiladi.", 170, 840, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: No SEARCH/CYCLE, CONCAT
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("2. SEARCH va CYCLE Yo'q (Qo'lda CONCAT)", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- MySQL da yo'lni qo'lda yig'ish:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT name, 0, CAST(name AS CHAR(200))", 1070, 390, { size: 18, color: '#93c5fd', fam: MONO });
      text("UNION ALL", 1070, 430, { size: 18, color: '#fbbf24', fam: MONO });
      text("SELECT o.name, u.daraja + 1,", 1070, 470, { size: 18, color: '#86efac', fam: MONO });
      text("       CONCAT(u.yol, '/', o.name)", 1070, 510, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 580, 740, 340, { fill: '#fffbeb', col: C.orange, p: k });
      text("Muhim nozikliklar:", 1070, 625, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• || belgisi MySQL da sukut bo'yicha mantiqiy OR bo'lib ishlaydi!", 1070, 675, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  Shuning uchun matnlarni birlashtirishda CONCAT shart.", 1070, 720, { size: 18, color: C.ink, fam: UI });
      text("• SEARCH va CYCLE yo'q: aylanani aniqlash uchun", 1070, 775, { size: 18, color: C.ink, fam: UI });
      text("  yol ustunida INSTR(u.yol, o.name) = 0 tekshiruvi qo'yiladi.", 1070, 815, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("• REPEAT('   ', daraja) bilan daraxt chiroyli chiqadi.", 1070, 870, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 3. MYSQL TIPLARI VA LIMIT
  function sMysqlTiplar(t) {
    heading("MySQL: Ustun Kengligi va Daraja Cheklovi", t, TM.scenes.mysql_tiplar_va_limit.s);

    const k = P(t, TM.scenes.mysql_tiplar_va_limit.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Column width error
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("1. XATO 1406: Data Too Long For Column", 520, 250, C.red, k, 18);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE cte AS (", 170, 350, { size: 18, color: '#fff', fam: MONO });
      text("    SELECT 1 AS n, 'abc' AS str  -- VARCHAR(3) bo'ldi!", 170, 395, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("    UNION ALL", 170, 435, { size: 18, color: '#fff', fam: MONO });
      text("    SELECT n + 1, CONCAT(str, str) FROM cte WHERE n < 3", 170, 475, { size: 18, color: '#fff', fam: MONO });
      text(")", 170, 505, { size: 18, color: '#fff', fam: MONO });

      card(140, 560, 760, 160, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR 1406 (22001): Data too long for column 'str'", 170, 605, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("Sababi: 2-qadamda 'abcabc' (6 belgi) bo'ladi,", 170, 650, { size: 17, color: '#f87171', fam: UI });
      text("lekin ustun tipi boshlang'ich qismdagi 3 belgiga qotib qolgan!", 170, 685, { size: 17, color: '#f87171', fam: UI });

      card(140, 750, 760, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Yechim: Boshida CAST bilan zaxira joy berish:", 170, 795, { size: 20, weight: 700, color: C.green, fam: UI });
      text("SELECT 1 AS n, CAST('abc' AS CHAR(200)) AS str", 170, 840, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("Shunda rekursiyada yo'l o'sib borsa ham xato chiqmaydi!", 170, 885, { size: 18, color: C.ink, fam: UI });

      // Right: Depth limit
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. cte_max_recursion_depth (1000 Iteratsiya)", 1410, 250, C.green, k, 18);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Cheksiz sikl bo'lsa, MySQL 1000 qadamdan so'ng to'xtatadi:", 1070, 350, { size: 16, color: '#94a3b8', fam: MONO });
      text("ERROR 3636 (HY000): Recursive query aborted", 1070, 395, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("after 1001 iterations. Try increasing", 1070, 435, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("@@cte_max_recursion_depth to a larger value.", 1070, 475, { size: 17, color: '#fca5a5', fam: MONO });

      card(1040, 540, 740, 170, { fill: '#eff6ff', col: C.blue, p: k });
      text("Rekursiv qismda LIMIT qo'llab-quvvatlanadi!", 1070, 580, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("PostgreSQL da ichki LIMIT taqiqlangan edi,", 1070, 625, { size: 18, color: C.ink, fam: UI });
      text("MySQL da esa: SELECT ... FROM yol JOIN borish LIMIT 8", 1070, 665, { size: 18, weight: 700, color: C.green, fam: MONO });

      card(1040, 740, 740, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("Chegara sozlamalari:", 1070, 785, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• SET SESSION cte_max_recursion_depth = 5000;", 1070, 830, { size: 18, color: C.ink, fam: MONO });
      text("• Bitta so'rov uchun: /*+ SET_VAR(cte_max_recursion_depth = 1M) */", 1070, 875, { size: 17, color: C.blue, fam: MONO });
    });
  }

  // 4. SQLITE QUEUE VA ORDER BY
  function sSqliteQueue(t) {
    heading("SQLite: Navbat Algoritmi va Ichki ORDER BY", t, TM.scenes.sqlite_queue_va_order_by.s);

    const k = P(t, TM.scenes.sqlite_queue_va_order_by.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Queue algorithm
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite Navbat (Queue) Bajarilishi", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("1. Boshlang'ich qatorlar Navbatga (Queue) solinadi.", 170, 355, { size: 19, color: '#86efac', fam: UI });
      text("2. Har qadamda navbatdan BITTA qator olinadi.", 170, 400, { size: 19, color: '#93c5fd', fam: UI });
      text("3. Rekursiv qism faqat shu qator bilan bajariladi.", 170, 445, { size: 19, color: '#c084fc', fam: UI });
      text("4. Chiqqan yangi qatorlar navbatga qo'shiladi.", 170, 490, { size: 19, color: '#fbbf24', fam: UI });

      card(140, 560, 760, 370, { fill: '#faf5ff', col: C.purple, p: k });
      text("Navbat algoritmining farqi:", 170, 605, { size: 22, weight: 700, color: C.purple, fam: UI });
      text("• PostgreSQL barcha qatorlarni 'to'plam' (set) qilib,", 170, 660, { size: 18, color: C.ink, fam: UI });
      text("  kenglik bo'yicha iteratsiyada hisoblaydi.", 170, 700, { size: 18, color: C.ink, fam: UI });
      text("• SQLite esa qatorlarni alohida-alohida navbatdan oladi.", 170, 750, { size: 18, color: C.ink, fam: UI });
      text("• Bu xususiyat rekursiv qism ichida ORDER BY qo'llashga", 170, 805, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("  va qidiruv strategiyasini boshqarishga imkon beradi!", 170, 845, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: ORDER BY in recursive query
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("Ichki ORDER BY: DFS yoki BFS Tanlovi", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 260, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH RECURSIVE ostida(name, daraja) AS (", 1070, 350, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("  SELECT name, 0 FROM org WHERE boss IS NULL", 1070, 390, { size: 18, color: '#86efac', fam: MONO });
      text("  UNION ALL", 1070, 430, { size: 18, color: '#fbbf24', fam: MONO });
      text("  SELECT o.name, u.daraja + 1 FROM org o ...", 1070, 470, { size: 18, color: '#c084fc', fam: MONO });
      text("  ORDER BY 2 DESC  -- Chuqurlik bo'yicha (DFS)!", 1070, 515, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text(")", 1070, 545, { size: 18, color: '#93c5fd', fam: MONO });

      card(1040, 600, 740, 180, { fill: '#0f172a', col: '#334155', p: k });
      text("sqlite3 natijasi (Tashqi ORDER BY siz):", 1070, 635, { size: 17, color: '#94a3b8', fam: MONO });
      text("Alice -> ...Bob -> ......Dave -> ......Emma -> ...Cindy...", 1070, 680, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("Avtomatik ravishda chuqurlik tartibida chiqdi!", 1070, 730, { size: 18, color: '#fff', fam: UI });

      card(1040, 810, 740, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("ORDER BY 2 ASC qilinsa — kenglik (BFS) bo'ladi.", 1070, 855, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("Ichki LIMIT va OFFSET ham to'liq ishlaydi!", 1070, 895, { size: 18, color: C.green, fam: UI });
    });
  }

  // 5. SQLITE IXTIYORIY RECURSIVE VA XULOSA
  function sSqliteIxtiyoriy(t) {
    heading("SQLite da Ixtiyoriy RECURSIVE va Dialektlar Xulosasi", t, TM.scenes.sqlite_ixtiyoriy_recursive.s);

    const k = P(t, TM.scenes.sqlite_ixtiyoriy_recursive.s + 0.3, 0.8);
    withA(k, () => {
      // Left: RECURSIVE optional
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite: RECURSIVE So'zi Majburiy Emas!", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- RECURSIVE so'zisiz yozilgan so'rov:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("WITH ostida(name) AS (", 170, 390, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("  SELECT name FROM org WHERE name = 'Bob'", 170, 430, { size: 18, color: '#86efac', fam: MONO });
      text("  UNION ALL", 170, 465, { size: 18, color: '#fbbf24', fam: MONO });
      text("  SELECT o.name FROM org o JOIN ostida u ...", 170, 500, { size: 18, color: '#c084fc', fam: MONO });
      text(")", 170, 530, { size: 18, color: '#93c5fd', fam: MONO });

      card(140, 560, 760, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("PostgreSQL va MySQL: ERROR relation 'ostida' does not exist", 170, 605, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("SQLite natijasi:      Bob, Dave, Emma (XATOSIZ ISHLADI!)", 170, 655, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("Sababi: SQLite SQL Server va Oracle mosligi uchun", 170, 705, { size: 18, color: '#cbd5e1', fam: UI });
      text("RECURSIVE kalit so'zini talab qilmaydi.", 170, 740, { size: 18, color: '#cbd5e1', fam: UI });

      card(140, 790, 760, 140, { fill: '#fffbeb', col: C.orange, p: k });
      text("TAVSIYA: Kodni portativ qilish uchun doimo", 170, 835, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("WITH RECURSIVE deb standartga rioya qiling!", 170, 880, { size: 19, weight: 700, color: C.blue, fam: UI });

      // Right: Comparison Matrix
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("3 Dialekt Solishtirma Matritsasi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 420, { fill: '#1e293b', col: '#334155', p: k });
      const rows = [
        { feature: "Xususiyat", pg: "Postgres", my: "MySQL", sq: "SQLite", hdr: true },
        { feature: "Rekursiv CTE", pg: "HA", my: "HA", sq: "HA" },
        { feature: "VALUES (1) sintaksisi", pg: "HA", my: "ROW() shart", sq: "HA" },
        { feature: "SEARCH / CYCLE", pg: "HA (standart)", my: "YO'Q", sq: "YO'Q" },
        { feature: "Rekursivda LIMIT", pg: "YO'Q", my: "HA", sq: "HA" },
        { feature: "Rekursivda ORDER BY", pg: "YO'Q", my: "YO'Q", sq: "HA (DFS/BFS)" },
        { feature: "RECURSIVE majburiy", pg: "HA", my: "HA", sq: "Ixtiyoriy" },
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

      card(1040, 755, 740, 175, { fill: '#f0fdf4', col: C.green, p: k });
      text("Xulosa: PostgreSQL SEARCH/CYCLE bilan eng toza,", 1070, 800, { size: 19, weight: 700, color: C.green, fam: UI });
      text("MySQL himoyaga boy, SQLite esa eng erkin!", 1070, 845, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("Standart SQL bilimi barcha tizimlarda ishonchli ishlaydi.", 1070, 890, { size: 17, color: C.soft, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_limit_va_syntax.s) {
      sIntro(t);
    } else if (t < TM.scenes.mysql_tiplar_va_limit.s) {
      sMysqlSyntax(t);
    } else if (t < TM.scenes.sqlite_queue_va_order_by.s) {
      sMysqlTiplar(t);
    } else if (t < TM.scenes.sqlite_ixtiyoriy_recursive.s) {
      sSqliteQueue(t);
    } else {
      sSqliteIxtiyoriy(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
