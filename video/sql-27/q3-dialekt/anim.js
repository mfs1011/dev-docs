// SQL 27-bob 3-qism: "Dialektlar" — MySQL va SQLite da Subquery Farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("27-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Subquery Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Xato kodlari: 1242, 1248, 1235, 1093 hamda SQLite dagi o'ziga xosliklar", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• Skalyar qat'iy tekshiriladi", 170, 560, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• IN, ANY, ALL to'liq bor", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• IN (... LIMIT n) ruxsat etiladi", 170, 655, { size: 19, color: C.blue, fam: UI });
      text("• UPDATE maqsad jadvaldan o'qiydi", 170, 700, { size: 19, color: C.green, fam: UI });
      text("• Hosila jadvalga alias ixtiyoriy", 170, 745, { size: 19, color: C.soft, fam: UI });
      text("• SQL standartiga to'liq mos", 170, 790, { size: 18, color: C.soft, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• Skalyar ko'p qator: Error 1242", 710, 560, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Derived table: ALIAS SHART (1248)", 710, 610, { size: 19, color: C.orange, fam: UI });
      text("• IN (... LIMIT) TAQIQLANGAN (1235)", 710, 655, { size: 19, color: C.red, fam: UI });
      text("• UPDATE target jadvaldan o'qimaydi (1093)", 710, 700, { size: 19, color: C.red, fam: UI });
      text("• Materializatsiya orqali yechiladi", 710, 745, { size: 19, color: C.green, fam: UI });
      text("• ANY/ALL faqat 1 ustun bilan", 710, 790, { size: 18, color: C.soft, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• ANY, SOME, ALL UMUMAN YO'Q!", 1290, 560, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• MAX / MIN agregatlari bilan yechim", 1290, 610, { size: 19, color: C.green, fam: UI });
      text("• Skalyar ko'p qator: XATO YO'Q!", 1290, 655, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• Jimgina birinchi qatorni oladi", 1290, 700, { size: 19, color: C.ink, fam: UI });
      text("• Hosila jadvalga alias shart emas", 1290, 745, { size: 19, color: C.soft, fam: UI });
      text("• x IN jadval sintaktik kengaytmasi", 1290, 790, { size: 18, color: C.purple, fam: UI });
    });
  }

  // 2. MYSQL ERRORS
  function sMysqlErrors(t) {
    heading("MySQL: 1242 va 1248 Xatolari", t, TM.scenes.mysql_errors.s);

    const k1 = P(t, TM.scenes.mysql_errors.s + 0.3, 0.8);
    withA(k1, () => {
      // Left: Error 1242
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k1 });
      pill("ERROR 1242 (21000): Subquery returns > 1 row", 520, 250, C.red, k1, 19);

      card(140, 310, 760, 150, { fill: '#fff', col: C.red, p: k1 });
      text("SELECT * FROM baholar", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("WHERE ball = (SELECT ball FROM baholar WHERE guruh_id = 1);", 170, 410, { size: 19, weight: 700, color: C.red, fam: MONO });

      card(140, 490, 760, 160, { fill: '#1e293b', col: '#334155', p: k1 });
      text("ERROR 1242 (21000):", 170, 545, { size: 20, weight: 700, color: '#f87171', fam: MONO });
      text("Subquery returns more than 1 row", 170, 595, { size: 22, color: '#fff', fam: MONO });

      card(140, 680, 760, 230, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("Rasmiy hujjat tavsiya qilgan yechim:", 170, 725, { size: 21, weight: 700, color: C.green, fam: UI });
      text("Agar subquery bir nechta qator qaytarishi mumkin bo'lsa,", 170, 770, { size: 19, color: C.ink, fam: UI });
      text("'=' o'rniga '= ANY' yoki 'IN' ishlatilishi kerak:", 170, 810, { size: 19, color: C.ink, fam: UI });
      text("WHERE ball = ANY (SELECT ball FROM baholar ...);", 170, 855, { size: 19, weight: 700, color: C.green, fam: MONO });

      // Right: Error 1248
      card(1000, 200, 820, 760, { fill: '#fff5f5', col: C.orange, p: k1 });
      pill("ERROR 1248 (42000): Alias Majburiy", 1410, 250, C.orange, k1, 19);

      card(1040, 310, 740, 160, { fill: '#fff', col: C.orange, p: k1 });
      text("SELECT avg(soni) FROM", 1070, 360, { size: 19, color: C.ink, fam: MONO });
      text("  (SELECT guruh_id, count(*) AS soni", 1070, 400, { size: 19, color: C.ink, fam: MONO });
      text("   FROM baholar GROUP BY guruh_id); -- ALIASSIZ!", 1070, 440, { size: 19, weight: 700, color: C.red, fam: MONO });

      card(1040, 500, 740, 160, { fill: '#1e293b', col: '#334155', p: k1 });
      text("ERROR 1248 (42000):", 1070, 555, { size: 20, weight: 700, color: '#fb923c', fam: MONO });
      text("Every derived table must have its own alias", 1070, 605, { size: 20, color: '#fff', fam: MONO });

      card(1040, 690, 740, 220, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("To'g'ri yozilishi:", 1070, 735, { size: 21, weight: 700, color: C.green, fam: UI });
      text("SELECT avg(soni) FROM", 1070, 780, { size: 19, color: C.ink, fam: MONO });
      text("  (SELECT ... FROM baholar GROUP BY guruh_id) AS t;", 1070, 825, { size: 19, weight: 700, color: C.green, fam: MONO });
      text("-> avg(soni): 2.0000", 1070, 870, { size: 20, weight: 700, color: C.blue, fam: MONO });
    });
  }

  // 3. MYSQL LIMIT & UPDATE
  function sMysqlLimitUpdate(t) {
    heading("MySQL: LIMIT va UPDATE Cheklovlari hamda Yechimlari", t, TM.scenes.mysql_limit_update.s);

    const k = P(t, TM.scenes.mysql_limit_update.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Error 1235
      card(100, 200, 840, 760, { fill: C.card, col: C.red, p: k });
      pill("ERROR 1235: IN/ALL/ANY ichida LIMIT taqiqlangan", 520, 250, C.red, k, 19);

      card(140, 310, 760, 150, { fill: '#fff', col: C.red, p: k });
      text("SELECT ism FROM baholar WHERE id IN", 170, 360, { size: 18, color: C.ink, fam: MONO });
      text("  (SELECT id FROM baholar ORDER BY ball DESC LIMIT 2);", 170, 405, { size: 17, weight: 700, color: C.red, fam: MONO });

      card(140, 480, 760, 130, { fill: '#1e293b', col: '#334155', p: k });
      text("ERROR 1235 (42000): This version of MySQL doesn't", 170, 525, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("yet support 'LIMIT & IN/ALL/ANY/SOME subquery'", 170, 565, { size: 17, color: '#fff', fam: MONO });

      card(140, 630, 760, 290, { fill: '#f0fdf4', col: C.green, p: k });
      text("MySQL dagi Yechim: Hosila jadvalga o'rash!", 170, 675, { size: 21, weight: 700, color: C.green, fam: UI });
      text("SELECT ism FROM baholar WHERE id IN (", 170, 720, { size: 17, color: C.ink, fam: MONO });
      text("  SELECT id FROM (", 170, 755, { size: 17, color: C.green, fam: MONO });
      text("    SELECT id FROM baholar WHERE ball IS NOT NULL", 170, 790, { size: 17, color: C.green, fam: MONO });
      text("    ORDER BY ball DESC LIMIT 2", 170, 825, { size: 17, color: C.green, fam: MONO });
      text("  ) AS t", 170, 860, { size: 17, weight: 700, color: C.orange, fam: MONO });
      text("); -> Sobir, Vali (2 rows)", 170, 895, { size: 18, weight: 700, color: C.blue, fam: MONO });

      // Right: Error 1093
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("ERROR 1093: O'zgartirilayotgan jadvaldan o'qish", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 150, { fill: '#fff', col: C.orange, p: k });
      text("UPDATE baholar SET ball = (SELECT max(ball) FROM baholar)", 1070, 360, { size: 16, weight: 700, color: C.red, fam: MONO });
      text("WHERE id = 5;", 1070, 400, { size: 17, color: C.ink, fam: MONO });

      card(1040, 480, 740, 130, { fill: '#1e293b', col: '#334155', p: k });
      text("ERROR 1093 (HY000): You can't specify target", 1070, 525, { size: 17, weight: 700, color: '#fb923c', fam: MONO });
      text("table 'baholar' for update in FROM clause", 1070, 565, { size: 17, color: '#fff', fam: MONO });

      card(1040, 630, 740, 290, { fill: '#f0fdf4', col: C.green, p: k });
      text("Yechim: Materializatsiyalangan hosila jadval!", 1070, 675, { size: 21, weight: 700, color: C.green, fam: UI });
      text("UPDATE baholar SET ball = (", 1070, 720, { size: 17, color: C.ink, fam: MONO });
      text("  SELECT m FROM (", 1070, 755, { size: 17, color: C.green, fam: MONO });
      text("    SELECT max(ball) AS m FROM baholar", 1070, 790, { size: 17, color: C.green, fam: MONO });
      text("  ) AS t", 1070, 825, { size: 17, weight: 700, color: C.orange, fam: MONO });
      text(") WHERE id = 5;", 1070, 860, { size: 17, color: C.ink, fam: MONO });
      text("-> Malika bali 92 ga yangilandi!", 1070, 895, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. SQLITE ANY/ALL
  function sSqliteAnyAll(t) {
    heading("SQLite: ANY va ALL Operatorlarining Yo'qligi", t, TM.scenes.sqlite_any_all.s);

    const k = P(t, TM.scenes.sqlite_any_all.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite Sintaksisida ANY, SOME va ALL Mavjud Emas", 960, 255, C.purple, k, 21);

      card(140, 310, 1640, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("SELECT ism, ball FROM baholar WHERE ball > ALL (SELECT ball FROM ...);", 180, 360, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("Parse error near line 13: near \"ALL\": syntax error", 180, 415, { size: 20, weight: 700, color: '#dc2626', fam: MONO });

      // Replacement table
      card(140, 500, 1640, 420, { fill: '#fff', col: C.blue, p: k });
      text("SQLite da Muqobil Usul: MAX va MIN Agregatlari", 180, 550, { size: 24, weight: 700, color: C.blue, fam: UI });

      const swaps = [
        { orig: "> ALL (subquery)", alt: "> (SELECT max(ball) FROM ...)", note: "NULL va bo'sh to'plamda farq qiladi!" },
        { orig: "< ANY (subquery)", alt: "< (SELECT max(ball) FROM ...)", note: "Eng kattasidan kichik bo'lish kifoya" },
        { orig: "> ANY (subquery)", alt: "> (SELECT min(ball) FROM ...)", note: "Eng kichigidan katta bo'lish kifoya" },
      ];

      swaps.forEach((s, i) => {
        const sy = 600 + i * 85;
        card(180, sy, 500, 65, { fill: '#fff1f2', col: C.red, p: k });
        text(s.orig, 200, sy + 40, { size: 20, weight: 700, color: C.red, fam: MONO });

        arrow(700, sy + 32, 770, sy + 32, { col: C.blue, w: 3 });

        card(790, sy, 560, 65, { fill: '#f0fdf4', col: C.green, p: k });
        text(s.alt, 810, sy + 40, { size: 19, weight: 700, color: C.green, fam: MONO });

        text(s.note, 1370, sy + 40, { size: 17, color: C.soft, fam: UI });
      });

      card(180, 850, 1560, 55, { fill: '#eff6ff', col: C.blue, p: k });
      text("Diqqat: MAX() NULL larni tashlaydi (ALL esa NULL beradi); Bo'sh to'plamda MAX() NULL beradi (ALL esa TRUE beradi)!", 200, 885, { size: 17, weight: 600, color: C.blue, fam: UI });
    });
  }

  // 5. SQLITE KENGAYTMA
  function sSqliteKengaytma(t) {
    heading("SQLite: Skalyar Xulqi va Sintaktik Kengaytmalar", t, TM.scenes.sqlite_kengaytma.s);

    const k = P(t, TM.scenes.sqlite_kengaytma.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Skalyar ko'p qator bersa xato yo'q!
      card(100, 200, 840, 760, { fill: '#fffdf5', col: C.orange, p: k });
      pill("DIQQAT: Skalyar Ko'p Qator Qaytarsa XATO YO'Q!", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.orange, p: k });
      text("SELECT (SELECT ism FROM baholar", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("        WHERE guruh_id = 1) AS ism;", 170, 405, { size: 20, weight: 700, color: C.orange, fam: MONO });

      card(140, 490, 760, 180, { fill: '#1e293b', col: '#334155', p: k });
      text("╭─────╮", 170, 535, { size: 20, color: '#64748b', fam: MONO });
      text("│ ism │", 170, 570, { size: 20, weight: 700, color: '#fbbf24', fam: MONO });
      text("╞═════╡", 170, 605, { size: 20, color: '#64748b', fam: MONO });
      text("│ Ali │  <-- Jimgina 1-qator olindi! XATO YO'Q!", 170, 640, { size: 20, weight: 700, color: '#4ade80', fam: MONO });

      card(140, 690, 760, 230, { fill: '#fff5f5', col: C.red, p: k });
      text("Xavf va Oqibat:", 170, 735, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• PostgreSQL va MySQL da bu 100% xato beradi.", 170, 780, { size: 19, color: C.ink, fam: UI });
      text("• SQLite da ORDER BY siz qaysi qator birinchi chiqishi kafolatlanmagan!", 170, 825, { size: 19, color: C.ink, fam: UI });
      text("• Ko'p ustun esa SQLite da ham Parse Error beradi.", 170, 870, { size: 19, weight: 700, color: C.red, fam: UI });

      // Right: Kengaytmalar
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite Qo'shimcha Qulayliklari", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 180, { fill: '#fff', col: C.purple, p: k });
      text("1. Hosila jadvalga alias shart emas:", 1070, 355, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("SELECT avg(soni) FROM", 1070, 395, { size: 19, color: C.ink, fam: MONO });
      text("  (SELECT guruh_id, count(*) AS soni", 1070, 430, { size: 19, color: C.ink, fam: MONO });
      text("   FROM baholar GROUP BY guruh_id); -- Ishlaydi!", 1070, 465, { size: 18, color: C.green, fam: MONO });

      card(1040, 510, 740, 180, { fill: '#fff', col: C.purple, p: k });
      text("2. To'g'ridan-to'g'ri jadval nomini IN da yozish:", 1070, 555, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("SELECT nom FROM guruhlar WHERE id IN baholar;", 1070, 600, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("Bu 'x IN (SELECT * FROM jadval)' ga tengdir.", 1070, 645, { size: 18, color: C.soft, fam: UI });

      card(1040, 710, 740, 210, { fill: '#f0fdf4', col: C.green, p: k });
      text("3. PostgreSQL kabi erkinliklar:", 1070, 755, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• IN (... LIMIT n) subquery'lar ishlaydi.", 1070, 800, { size: 19, color: C.ink, fam: UI });
      text("• UPDATE qilinayotgan jadvaldan subquery'da to'g'ridan-to'g'ri o'qish mumkin.", 1070, 845, { size: 18, color: C.ink, fam: UI });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_errors.s) sIntro(t);
    else if (t < TM.scenes.mysql_limit_update.s) sMysqlErrors(t);
    else if (t < TM.scenes.sqlite_any_all.s) sMysqlLimitUpdate(t);
    else if (t < TM.scenes.sqlite_kengaytma.s) sSqliteAnyAll(t);
    else sSqliteKengaytma(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
