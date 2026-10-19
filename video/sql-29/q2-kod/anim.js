// SQL 29-bob 2-qism: "Kod" — PostgreSQL 18 da CTE amaliyoti
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
    hand("29-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Real CTE Amaliyoti", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Zanjirli so'rovlar, ustun nomlari, sintaksis qoidalari va DELETE + RETURNING", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'guruhlar'), 0.8);
    withA(kCards, () => {
      // 3 Table previews (guruhlar, baholar, arxiv)
      const tables = [
        {
          name: "guruhlar",
          header: "id | nom",
          rows: [" 1 | A", " 2 | B", " 3 | C"],
          col: C.blue,
          note: "3 ta guruh"
        },
        {
          name: "baholar",
          header: "id | guruh_id | ism     | ball",
          rows: [" 1 |        1 | Ali     |   85", " 2 |        2 | Vali    |   92", " 3 |        1 | Sobir   |   90", " 4 |        2 | Dilnoza |   88", " 5 |        1 | Malika  | NULL", " 6 |     NULL | Jasur   |   70"],
          col: C.green,
          note: "6 ta talaba bahosi"
        },
        {
          name: "arxiv",
          header: "id | guruh_id | ism     | ball",
          rows: ["(dastlab bo'sh jadval)", "DELETE + RETURNING", "orqali to'ldiriladi"],
          col: C.purple,
          note: "Arxivlash maqsadi"
        },
      ];

      const widths = [480, 680, 480];
      const xs = [100, 620, 1340];
      tables.forEach((item, i) => {
        const bx = xs[i], bw = widths[i];
        card(bx, 440, bw, 500, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + bw / 2, 490, item.col, kCards, 22);

        text(item.header, bx + 30, 560, { size: 19, weight: 700, color: item.col, fam: MONO });
        text("-".repeat(item.header.length + 4), bx + 30, 590, { size: 19, color: '#94a3b8', fam: MONO });

        item.rows.forEach((r, ri) => {
          text(r, bx + 30, 635 + ri * 42, { size: 18, weight: 600, color: C.ink, fam: MONO });
        });

        text(item.note, bx + 30, 890, { size: 18, weight: 700, color: C.soft, fam: UI });
      });
    });
  }

  // 2. ZANJIRLI CTE
  function sZanjir(t) {
    heading("Zanjirli va Ko'p Murojaatli CTE", t, TM.scenes.zanjirli_cte.s);

    const k = P(t, TM.scenes.zanjirli_cte.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQL Code
      card(100, 200, 940, 760, { fill: C.card, col: C.blue, p: k });
      pill("Zanjirli CTE So'rovi", 570, 250, C.blue, k, 19);

      card(130, 300, 880, 390, { fill: '#1e293b', col: '#334155', p: k });
      const sqlLines = [
        { s: "WITH guruh_ortacha AS (", c: '#93c5fd', b: 700 },
        { s: "  SELECT guruh_id, avg(ball) AS ortacha", c: '#f8fafc' },
        { s: "  FROM baholar WHERE guruh_id IS NOT NULL", c: '#cbd5e1' },
        { s: "  GROUP BY guruh_id", c: '#cbd5e1' },
        { s: "),", c: '#93c5fd', b: 700 },
        { s: "eng_yaxshi AS (", c: '#a78bfa', b: 700 },
        { s: "  SELECT guruh_id FROM guruh_ortacha", c: '#f8fafc' },
        { s: "  WHERE ortacha = (SELECT max(ortacha) FROM guruh_ortacha)", c: '#fbbf24' },
        { s: ")", c: '#a78bfa', b: 700 },
        { s: "SELECT b.ism, b.ball FROM baholar b", c: '#86efac', b: 700 },
        { s: "WHERE b.guruh_id IN (SELECT guruh_id FROM eng_yaxshi)", c: '#86efac' },
        { s: "ORDER BY b.ball DESC;", c: '#86efac' },
      ];
      sqlLines.forEach((ln, idx) => {
        text(ln.s, 155, 335 + idx * 30, { size: 17, weight: ln.b || 500, color: ln.c, fam: MONO });
      });

      card(130, 715, 880, 215, { fill: '#eff6ff', col: C.blue, p: k });
      text("Zanjir mantiqi:", 160, 755, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("1. guruh_ortacha — guruhlar bo'yicha o'rtacha ballni hisoblaydi.", 160, 800, { size: 18, color: C.ink, fam: UI });
      text("2. eng_yaxshi — guruh_ortacha ga 2 marta murojaat qilib eng kattasini topadi.", 160, 845, { size: 18, color: C.ink, fam: UI });
      text("3. Asosiy so'rov — eng yaxshi guruh talabalarini ajratadi.", 160, 890, { size: 18, color: C.green, weight: 700, fam: UI });

      // Right: Resolution & Real Output
      card(1080, 200, 740, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Natijasi va Tahlil", 1450, 250, C.green, k, 19);

      card(1110, 300, 680, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("psql (PostgreSQL 18.6)", 1135, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("  ism   | ball ", 1135, 375, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("---------+------", 1135, 410, { size: 20, color: '#64748b', fam: MONO });
      text(" Vali    |   92", 1135, 445, { size: 20, color: '#fff', fam: MONO });
      text(" Dilnoza |   88", 1135, 480, { size: 20, color: '#fff', fam: MONO });
      text("(2 rows)", 1135, 510, { size: 16, color: '#94a3b8', fam: MONO });

      card(1110, 560, 680, 370, { fill: '#f0fdf4', col: C.green, p: k });
      text("Natija tahlili:", 1140, 605, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• A guruh o'rtachasi: (85 + 90) / 2 = 87.5", 1140, 655, { size: 19, color: C.ink, fam: UI });
      text("• B guruh o'rtachasi: (92 + 88) / 2 = 90.0  (ENG YUQORI!)", 1140, 705, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("• B guruhi talabalari: Vali (92) va Dilnoza (88).", 1140, 755, { size: 19, color: C.ink, fam: UI });
      text("• guruh_ortacha natijasi ikkita alohida joyda qayta", 1140, 815, { size: 18, color: C.soft, fam: UI });
      text("  ishlatildi — kod ixcham va o'qilishi juda oson!", 1140, 855, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. USTUN NOMLARI
  function sUstunlar(t) {
    heading("CTE Nomidan So'ng Ustun Nomlarini Belgilash", t, TM.scenes.ustun_nomlari.s);

    const k = P(t, TM.scenes.ustun_nomlari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Syntax & Aliases
      card(100, 200, 860, 760, { fill: C.card, col: C.blue, p: k });
      pill("Aniq Ustun Nomlari Sintaksisi", 530, 250, C.blue, k, 19);

      card(140, 310, 780, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH s (guruh, soni) AS (", 170, 355, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("  SELECT guruh_id, count(*)", 170, 395, { size: 19, color: '#f8fafc', fam: MONO });
      text("  FROM baholar", 170, 435, { size: 19, color: '#cbd5e1', fam: MONO });
      text("  GROUP BY guruh_id", 170, 475, { size: 19, color: '#cbd5e1', fam: MONO });
      text(")", 170, 515, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 580, 780, 350, { fill: '#eff6ff', col: C.blue, p: k });
      text("Ustunlarni qavsda berish afzalliklari:", 170, 625, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("1. Ichki SELECT da 'AS yangi_nom' deb yozish shart emas.", 170, 675, { size: 18, color: C.ink, fam: UI });
      text("2. CTE tashqaridan qanday ustunlar qaytarishini", 170, 725, { size: 18, color: C.ink, fam: UI });
      text("   bir qarashda sarlavhasidan ko'rish mumkin.", 170, 765, { size: 18, color: C.ink, fam: UI });
      text("3. Rekursiv CTE larda ustun nomlarini aniq ko'rsatish", 170, 820, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("   tavsiya etiladi va kodni xatolardan asraydi.", 170, 860, { size: 18, color: C.soft, fam: UI });

      // Right: Query & Result
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("Asosiy So'rov va Terminal Natijasi", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 160, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT g.nom, s.soni", 1070, 355, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("FROM guruhlar g", 1070, 395, { size: 19, color: '#f8fafc', fam: MONO });
      text("JOIN s ON s.guruh = g.id", 1070, 435, { size: 19, color: '#f8fafc', fam: MONO });
      text("ORDER BY g.nom;", 1070, 475, { size: 19, color: '#cbd5e1', fam: MONO });

      card(1040, 500, 740, 220, { fill: '#1e293b', col: '#334155', p: k });
      text(" nom | soni ", 1070, 545, { size: 21, weight: 700, color: '#86efac', fam: MONO });
      text("-----+------", 1070, 580, { size: 21, color: '#64748b', fam: MONO });
      text(" A   |    3", 1070, 620, { size: 21, color: '#fff', fam: MONO });
      text(" B   |    2", 1070, 660, { size: 21, color: '#fff', fam: MONO });
      text("(2 rows)", 1070, 695, { size: 17, color: '#94a3b8', fam: MONO });

      card(1040, 750, 740, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Ustun bog'lanishi:", 1070, 790, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• s.guruh -> guruh_id qiymatiga mos tushdi.", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("• s.soni -> count(*) hisobiga mos keldi.", 1070, 875, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 4. SINTAKSIS XATOLARI
  function sXatolar(t) {
    heading("Ko'p Uchraydigan Sintaksis Xatolari", t, TM.scenes.sintaksis_xatolari.s);

    const k = P(t, TM.scenes.sintaksis_xatolari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: 1-xato (Ikkita WITH)
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("1-Xato: Ketma-ket Ikkita WITH", 520, 250, C.red, k, 19);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- XATO YOZILISH:", 170, 350, { size: 17, color: '#f87171', fam: MONO });
      text("WITH a AS (SELECT 1 AS x)", 170, 390, { size: 18, color: '#fff', fam: MONO });
      text("WITH b AS (SELECT 2 AS y)  -- XATO!", 170, 430, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("SELECT * FROM a, b;", 170, 470, { size: 18, color: '#cbd5e1', fam: MONO });

      card(140, 530, 760, 170, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  syntax error at or near \"WITH\"", 170, 570, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("LINE 1: ...AS (SELECT 1 AS x) WITH b AS...", 170, 610, { size: 17, color: '#f87171', fam: MONO });
      text("                              ^", 170, 645, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(140, 720, 760, 210, { fill: '#f0fdf4', col: C.green, p: k });
      text("To'g'ri yozilishi:", 170, 765, { size: 21, weight: 700, color: C.green, fam: UI });
      text("WITH a AS (SELECT 1 AS x),", 170, 810, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("     b AS (SELECT 2 AS y)", 170, 850, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("SELECT * FROM a, b;  -- Faqat vergul bilan!", 170, 890, { size: 18, color: C.ink, fam: MONO });

      // Right: 2-xato (Oldinga murojaat)
      card(1000, 200, 820, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("2-Xato: Oldinga Murojaat (Forward Reference)", 1410, 250, C.red, k, 19);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- XATO YOZILISH:", 1070, 350, { size: 17, color: '#f87171', fam: MONO });
      text("WITH a AS (SELECT * FROM b), -- 'b' hali yo'q!", 1070, 390, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("     b AS (SELECT 1 AS x)", 1070, 430, { size: 18, color: '#fff', fam: MONO });
      text("SELECT * FROM a;", 1070, 470, { size: 18, color: '#cbd5e1', fam: MONO });

      card(1040, 530, 740, 170, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  relation \"b\" does not exist", 1070, 570, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("LINE 1: WITH a AS (SELECT * FROM b)...", 1070, 610, { size: 17, color: '#f87171', fam: MONO });
      text("                                 ^", 1070, 645, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 720, 740, 210, { fill: '#eff6ff', col: C.blue, p: k });
      text("Mantiqiy qoida:", 1070, 765, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• SQL yuqoridan pastga ketma-ket aniqlanadi.", 1070, 810, { size: 18, color: C.ink, fam: UI });
      text("• CTE faqat o'zidan OLDIN e'lon qilingan CTE ga", 1070, 850, { size: 18, color: C.ink, fam: UI });
      text("  murojaat qila oladi (SQLite dan tashqari!).", 1070, 890, { size: 18, weight: 700, color: C.purple, fam: UI });
    });
  }

  // 5. MATERIALIZATSIYA EXPLAIN
  function sExplain(t) {
    heading("EXPLAIN Rejasi: Standart Inline vs MATERIALIZED", t, TM.scenes.materializatsiya_explain.s);

    const k = P(t, TM.scenes.materializatsiya_explain.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Inline (Default)
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("Standart CTE (PostgreSQL 12+ Inline)", 520, 250, C.green, k, 19);

      card(140, 310, 760, 150, { fill: '#1e293b', col: '#334155', p: k });
      text("EXPLAIN (COSTS OFF)", 170, 350, { size: 18, color: '#94a3b8', fam: MONO });
      text("WITH w AS (SELECT * FROM baholar)", 170, 390, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("SELECT * FROM w WHERE id = 2;", 170, 430, { size: 19, weight: 700, color: '#fff', fam: MONO });

      card(140, 480, 760, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("                QUERY PLAN                ", 170, 520, { size: 18, color: '#94a3b8', fam: MONO });
      text("------------------------------------------", 170, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" Index Scan using baholar_pkey on baholar", 170, 595, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("   Index Cond: (id = 2)", 170, 635, { size: 18, color: '#fbbf24', fam: MONO });

      card(140, 700, 760, 230, { fill: '#f0fdf4', col: C.green, p: k });
      text("Inline tahlili:", 170, 745, { size: 21, weight: 700, color: C.green, fam: UI });
      text("✓ Optimizer CTE ni asosiy so'rov bilan birlashtirdi (inlining).", 170, 790, { size: 18, color: C.ink, fam: UI });
      text("✓ WHERE id = 2 sharti bevosita asosiy jadvalga tushirildi.", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("✓ Birlamchi kalit indeksi ishlatildi — eng yuqori tezlik!", 170, 880, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: MATERIALIZED
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("AS MATERIALIZED (To'siq / Alohida Hisoblash)", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 150, { fill: '#1e293b', col: '#334155', p: k });
      text("EXPLAIN (COSTS OFF)", 1070, 350, { size: 18, color: '#94a3b8', fam: MONO });
      text("WITH w AS MATERIALIZED (SELECT * FROM baholar)", 1070, 390, { size: 18, weight: 700, color: '#f59e0b', fam: MONO });
      text("SELECT * FROM w WHERE id = 2;", 1070, 430, { size: 19, weight: 700, color: '#fff', fam: MONO });

      card(1040, 480, 740, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("         QUERY PLAN          ", 1070, 520, { size: 18, color: '#94a3b8', fam: MONO });
      text("-----------------------------", 1070, 555, { size: 18, color: '#64748b', fam: MONO });
      text(" CTE Scan on w", 1070, 595, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("   Filter: (id = 2)", 1070, 625, { size: 18, color: '#f87171', fam: MONO });
      text("   CTE w -> Seq Scan on baholar", 1070, 655, { size: 18, color: '#fbbf24', fam: MONO });

      card(1040, 700, 740, 230, { fill: '#fffbeb', col: C.orange, p: k });
      text("Materialized tahlili:", 1070, 745, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("⚠ Optimizer so'rovlarni birlashtira olmadi (Optimization Barrier).", 1070, 790, { size: 18, color: C.ink, fam: UI });
      text("⚠ Avval butun baholar jadvali xotiraga to'liq o'qildi (Seq Scan).", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("⚠ Shundan so'ng id = 2 qatori filtrlandi — katta bazalarda sekin!", 1070, 880, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 6. QATORLARNI KO'CHIRUVCHI CTE
  function sKochiruvchi(t) {
    heading("DELETE + RETURNING: Bitta Tranzaksiyada Ko'chirish", t, TM.scenes.qatorlarni_kochiruvchi_cte.s);

    const k = P(t, TM.scenes.qatorlarni_kochiruvchi_cte.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Code
      card(100, 200, 860, 760, { fill: C.card, col: C.purple, p: k });
      pill("Data-Modifying CTE (PostgreSQL Xususiyati)", 530, 250, C.purple, k, 19);

      card(140, 310, 780, 260, { fill: '#1e293b', col: '#334155', p: k });
      text("WITH kochirilgan AS (", 170, 355, { size: 20, weight: 700, color: '#c084fc', fam: MONO });
      text("    DELETE FROM baholar", 170, 400, { size: 20, weight: 700, color: '#f87171', fam: MONO });
      text("    WHERE ball < 86", 170, 440, { size: 19, color: '#f8fafc', fam: MONO });
      text("    RETURNING *", 170, 480, { size: 20, weight: 700, color: '#fbbf24', fam: MONO });
      text(")", 170, 520, { size: 20, weight: 700, color: '#c084fc', fam: MONO });
      text("INSERT INTO arxiv SELECT * FROM kochirilgan;", 170, 560, { size: 20, weight: 700, color: '#86efac', fam: MONO });

      card(140, 600, 780, 330, { fill: '#faf5ff', col: C.purple, p: k });
      text("Bu qanday ishlaydi?", 170, 645, { size: 22, weight: 700, color: C.purple, fam: UI });
      text("1. DELETE baholar jadvalidan ball < 86 bo'lgan qatorlarni o'chiradi.", 170, 695, { size: 18, color: C.ink, fam: UI });
      text("2. RETURNING * o'chirilgan qatorlarni CTE natijasi qilib chiqaradi.", 170, 745, { size: 18, color: C.ink, fam: UI });
      text("3. INSERT INTO arxiv o'sha qatorlarni to'g'ridan-to'g'ri arxivga yozadi.", 170, 795, { size: 18, color: C.ink, fam: UI });
      text("✓ Bitta SQL amali, oraliq jadvalsiz va to'liq xavfsiz!", 170, 855, { size: 19, weight: 700, color: C.green, fam: UI });

      // Right: Result in Arxiv
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Natijasi va Arxiv Jadvali", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 160, { fill: '#1e293b', col: '#334155', p: k });
      text("psql (PostgreSQL 18.6)", 1070, 345, { size: 16, color: '#94a3b8', fam: MONO });
      text("INSERT 0 2", 1070, 395, { size: 22, weight: 700, color: '#86efac', fam: MONO });
      text("-- 2 ta qator muvaffaqiyatli arxivlandi", 1070, 435, { size: 17, color: '#94a3b8', fam: MONO });

      card(1040, 500, 740, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT ism, ball FROM arxiv ORDER BY id;", 1070, 540, { size: 18, color: '#94a3b8', fam: MONO });
      text("  ism  | ball ", 1070, 580, { size: 21, weight: 700, color: '#86efac', fam: MONO });
      text("-------+------", 1070, 615, { size: 21, color: '#64748b', fam: MONO });
      text(" Ali   |   85", 1070, 650, { size: 21, color: '#fff', fam: MONO });
      text(" Jasur |   70", 1070, 685, { size: 21, color: '#fff', fam: MONO });
      text("(2 rows)", 1070, 715, { size: 16, color: '#94a3b8', fam: MONO });

      card(1040, 750, 740, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Bitta Tranzaksiya Kafolati:", 1070, 790, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Agar INSERT da biron xatolik yuz bersa, DELETE ham", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("  avtomatik bekor bo'ladi (ROLLBACK) — ma'lumot yo'qolmaydi!", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.zanjirli_cte.s) {
      sIntro(t);
    } else if (t < TM.scenes.ustun_nomlari.s) {
      sZanjir(t);
    } else if (t < TM.scenes.sintaksis_xatolari.s) {
      sUstunlar(t);
    } else if (t < TM.scenes.materializatsiya_explain.s) {
      sXatolar(t);
    } else if (t < TM.scenes.qatorlarni_kochiruvchi_cte.s) {
      sExplain(t);
    } else {
      sKochiruvchi(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
