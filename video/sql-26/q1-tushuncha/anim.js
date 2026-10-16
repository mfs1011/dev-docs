// SQL 26-bob 1-qism: "Tushuncha" — Agregatsiya va GROUP BY Asoslari
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

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("26-bob. Tushuncha", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da Agregatsiya va GROUP BY Asoslari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Ko'p qatordan bitta qiymat: COUNT, SUM, AVG, GROUP BY va HAVING", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('g2', 'Kaunt'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Asosiy Agregat Funksiyalar (Ko'p qator -> Bitta qiymat):", 190, 495, { size: 24, weight: 700, color: C.ink, fam: UI });

      // 5 function boxes
      const funcs = [
        { name: "COUNT(*)", desc: "Qatorlar umumiy soni", col: C.blue, note: "NULL larni ham sanaydi" },
        { name: "SUM(x)", desc: "Qiymatlar yig'indisi", col: C.green, note: "Bo'sh to'plamda NULL!" },
        { name: "AVG(x)", desc: "O'rtacha arifmetik", col: C.orange, note: "NULL lar o'rtachani tushirmaydi" },
        { name: "MIN(x)", desc: "Eng kichik qiymat", col: C.purple, note: "Indeksdan foydalanadi" },
        { name: "MAX(x)", desc: "Eng katta qiymat", col: C.red, note: "Indeksdan foydalanadi" },
      ];

      funcs.forEach((f, i) => {
        const bx = 180 + i * 315;
        card(bx, 550, 295, 360, { fill: '#fff', col: f.col, p: kCards });
        pill(f.name, bx + 147, 595, f.col, kCards, 20);
        text(f.desc, bx + 147, 680, { size: 19, weight: 700, color: C.ink, fam: UI, align: 'center' });
        text(f.note, bx + 147, 750, { size: 16, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. NULL VA BOSH TOPLAM
  function sNullVaBoshToplam(t) {
    heading("NULL Qoidasi va Bo'sh To'plam Xulqi", t, TM.scenes.null_va_bosh_toplam.s);

    const k1 = P(t, W('g3', 'yulduzcha'), 0.5);
    withA(k1, () => {
      // Left: NULL rule
      card(100, 210, 840, 780, { fill: C.card, col: C.orange, p: k1 });
      pill("NULL Qanday Hisoblanadi?", 520, 260, C.orange, k1, 20);

      card(140, 310, 760, 160, { fill: '#fffdfa', col: C.orange, p: k1 });
      text("SELECT count(*), count(ball), avg(ball)", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("FROM baholar; -- 6 ta qatordan 1 tasida ball NULL", 170, 410, { size: 18, color: C.soft, fam: MONO });

      text("Muhim qoidalar:", 140, 520, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. COUNT(*) — jadvaldagi barcha 6 ta qatorni sanaydi.", 140, 570, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("2. COUNT(ball) — faqat NOT NULL qiymatlarni sanaydi (5 ta).", 140, 620, { size: 19, color: C.green, fam: UI });
      text("3. SUM, AVG, MIN, MAX — NULL larni TASHAB YUBORADI!", 140, 670, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("   AVG = 425 / 5 = 85.0 (6 ga bo'linmaydi!)", 140, 715, { size: 18, color: C.soft, fam: UI });
      text("   NULL o'rtachani 'tushirib' yubormaydi.", 140, 755, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g4', 'nol'), 0.5);
    withA(k2, () => {
      // Right: Empty set trap
      card(980, 210, 840, 780, { fill: C.card, col: C.red, p: k2 });
      pill("⚠️ Bo'sh To'plamda SUM = NULL (Nol Emas!)", 1400, 260, C.red, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k2 });
      text("-- Mos qator topilmagan holat:", 1050, 350, { size: 18, color: C.soft, fam: MONO });
      text("SELECT count(*), sum(ball)", 1050, 385, { size: 20, color: C.ink, fam: MONO });
      text("FROM baholar WHERE ball > 100;", 1050, 420, { size: 20, weight: 700, color: C.red, fam: MONO });

      card(1020, 490, 760, 150, { fill: '#fff', col: C.pencil, p: k2 });
      text("count | sum ", 1050, 535, { size: 19, weight: 700, color: C.ink, fam: MONO });
      text("------+-----", 1050, 565, { size: 19, color: C.pencil, fam: MONO });
      text("    0 | NULL  <-- DIQQAT: NOL EMAS, NULL!", 1050, 600, { size: 19, weight: 700, color: C.red, fam: MONO });

      card(1020, 660, 760, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      pill("To'g'ri Yechim: COALESCE", 1400, 700, C.green, k2, 19);
      text("SELECT COALESCE(sum(ball), 0) FROM ...;", 1050, 755, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("Natija: 0 (nol) chiqadi, dasturda xato bermaydi!", 1050, 795, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 3. GROUP BY VA HAVING
  function sGroupByVaHaving(t) {
    heading("GROUP BY va HAVING Mexanizmi", t, TM.scenes.group_by_va_having.s);

    const k1 = P(t, W('g5', 'guruhlaydi'), 0.5);
    withA(k1, () => {
      // Left: GROUP BY
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("GROUP BY — Guruhlarga Ajratish", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT guruh_id, count(*), max(ball)", 170, 355, { size: 19, color: C.ink, fam: MONO });
      text("FROM baholar", 170, 395, { size: 19, color: C.ink, fam: MONO });
      text("GROUP BY guruh_id ORDER BY guruh_id;", 170, 430, { size: 19, weight: 700, color: C.blue, fam: MONO });

      text("Qanday ishlaydi:", 140, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• guruh_id ustunida bir xil qiymatli qatorlar bitta bo'ladi", 140, 560, { size: 19, color: C.ink, fam: UI });
      text("• 1-guruh: 3 ta talaba (eng yuqori: 90)", 140, 610, { size: 18, color: C.soft, fam: UI });
      text("• 2-guruh: 2 ta talaba (eng yuqori: 92)", 140, 655, { size: 18, color: C.soft, fam: UI });
      text("• NULL guruh: 1 ta talaba (eng yuqori: 70)", 140, 700, { size: 18, color: C.soft, fam: UI });
      text("• NULL lar ham bitta alohida guruhga birlashadi!", 140, 750, { size: 19, weight: 700, color: C.blue, fam: UI });
    });

    const k2 = P(t, W('g6', 'heving'), 0.5);
    withA(k2, () => {
      // Right: WHERE vs HAVING
      card(980, 210, 840, 780, { fill: C.card, col: C.purple, p: k2 });
      pill("WHERE vs HAVING Farqi", 1400, 260, C.purple, k2, 20);

      card(1020, 310, 760, 170, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("SELECT guruh_id, count(*)", 1050, 350, { size: 19, color: C.ink, fam: MONO });
      text("FROM baholar", 1050, 385, { size: 19, color: C.ink, fam: MONO });
      text("WHERE ball >= 80  -- 1. Qatorlarni filtrlaydi", 1050, 420, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("GROUP BY guruh_id", 1050, 455, { size: 18, color: C.ink, fam: MONO });
      text("HAVING count(*) > 1; -- 2. Guruhlarni filtrlaydi!", 1050, 490, { size: 18, weight: 700, color: C.purple, fam: MONO });

      text("Tartib va Qoidalar:", 1020, 540, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• WHERE — guruhlashdan OLDIN qatorlarni elaydi.", 1020, 590, { size: 19, color: C.blue, fam: UI });
      text("  (Agregat funksiyani WHERE ichida ishlatib bo'lmaydi!)", 1020, 630, { size: 17, color: C.red, fam: UI });
      text("• HAVING — guruhlashdan KEYIN guruhlarni elaydi.", 1020, 680, { size: 19, color: C.purple, fam: UI });
      text("  (Faqat agregat natijalarini filtrlash uchun xizmat qiladi)", 1020, 720, { size: 17, color: C.soft, fam: UI });
    });
  }

  // 4. FUNKSIONAL BOGLIQLIK
  function sFunksionalBogliqlik(t) {
    heading("Guruhlanmagan Ustun va Funksional Bog'liqlik", t, TM.scenes.funksional_bogliqlik.s);

    const k1 = P(t, W('g7', 'ustunlarni'), 0.5);
    withA(k1, () => {
      // Left: Group by error
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("❌ Qat'iy Qoida: Guruhlanmagan Ustun", 520, 260, C.red, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT guruh_id, ism, max(ball)", 170, 360, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("FROM baholar GROUP BY guruh_id;", 170, 410, { size: 20, color: C.ink, fam: MONO });

      text("Nega xato beradi?", 140, 520, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• 1-guruhda 3 ta talaba bor: Ali, Malika, Sobir.", 140, 570, { size: 19, color: C.ink, fam: UI });
      text("• Server bitta guruh qatori uchun qaysi ismni ko'rsatsin?", 140, 620, { size: 18, color: C.soft, fam: UI });
      text("• Aniq bitta qiymat yo'q! Shu sababli PostgreSQL rad etadi:", 140, 670, { size: 18, color: C.soft, fam: UI });
      text("  'column baholar.ism must appear in GROUP BY'", 140, 715, { size: 18, weight: 700, color: C.red, fam: MONO });
    });

    const k2 = P(t, W('g8', 'birlamchi'), 0.5);
    withA(k2, () => {
      // Right: Functional dependency
      card(980, 210, 840, 780, { fill: C.card, col: C.green, p: k2 });
      pill("✅ Istisno: Funksional Bog'liqlik", 1400, 260, C.green, k2, 20);

      card(1020, 310, 760, 170, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("SELECT g.id, g.nom, count(b.id)", 1050, 350, { size: 19, color: C.ink, fam: MONO });
      text("FROM guruhlar g", 1050, 385, { size: 19, color: C.ink, fam: MONO });
      text("LEFT JOIN baholar b ON b.guruh_id = g.id", 1050, 420, { size: 18, color: C.soft, fam: MONO });
      text("GROUP BY g.id; -- g.nom GROUP BY da yo'q!", 1050, 455, { size: 19, weight: 700, color: C.green, fam: MONO });

      text("Nega bu ruxsat etiladi?", 1020, 530, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• g.id — guruhlar jadvalining PRIMARY KEY ustunidir.", 1020, 580, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• Birlamchi kalit bitta yagona qatorni aniqlaydi.", 1020, 625, { size: 18, color: C.soft, fam: UI });
      text("• Demak, g.nom har doim bitta aniq qiymatga ega!", 1020, 670, { size: 18, color: C.soft, fam: UI });
      text("• Funksional bog'liq ustunlarni ortiqcha yozish shart emas.", 1020, 715, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. QOSHIMCHALAR VA XULOSA
  function sQoshimchalarVaXulosa(t) {
    heading("FILTER, ROLLUP va Ko'p Darajali Jamilar", t, TM.scenes.qoshimchalar_va_xulosa.s);

    const k1 = P(t, W('g9', 'filtr'), 0.5);
    withA(k1, () => {
      card(100, 210, 940, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("Zamonaviy Agregatsiya Imkoniyatlari", 570, 260, C.purple, k1, 20);

      // Feature 1: FILTER
      card(140, 310, 860, 160, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("1. FILTER (WHERE shart) — Shartli agregat:", 160, 350, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("SELECT count(*) AS jami,", 160, 390, { size: 18, color: C.ink, fam: MONO });
      text("       count(*) FILTER (WHERE ball >= 88) AS alochi", 160, 425, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("FROM baholar; -- Bitta so'rovda turli filtrli hisoblar!", 160, 460, { size: 16, color: C.soft, fam: MONO });

      // Feature 2: string_agg
      card(140, 490, 860, 140, { fill: '#fffdfa', col: C.orange, p: k1 });
      text("2. Agregat ichida ORDER BY:", 160, 525, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("SELECT string_agg(ism, ', ' ORDER BY ism) FROM baholar;", 160, 570, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("Satrlarni birlashtirishda aniq tartibni kafolatlaydi.", 160, 610, { size: 17, color: C.soft, fam: UI });

      // Feature 3: ROLLUP
      card(140, 650, 860, 160, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("3. ROLLUP va CUBE — Ierarxik jamilar:", 160, 690, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("GROUP BY ROLLUP (g.nom, b.ism)", 160, 730, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("Oraliq jamilar (subtotals) va umumiy jami (grand total) bitta so'rovda!", 160, 775, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('g10', 'Postgres'), 0.5);
    withA(k2, () => {
      card(1080, 210, 740, 780, { fill: '#f6f9fc', col: C.blue, p: k2 });
      pill("Keyingi Video Dars", 1450, 260, C.blue, k2, 20);

      card(1120, 320, 660, 420, { fill: '#fff', col: C.blue, p: k2 });
      text("26.2-video darsida:", 1150, 375, { size: 24, weight: 700, color: C.blue, fam: UI });
      text("• PostgreSQL 18 da real jadvallar", 1150, 430, { size: 19, color: C.ink, fam: UI });
      text("• COUNT, SUM, AVG natija tiplari", 1150, 480, { size: 19, color: C.ink, fam: UI });
      text("• GROUP BY va HAVING amaliyoti", 1150, 530, { size: 19, color: C.ink, fam: UI });
      text("• FILTER va ROLLUP natijalari", 1150, 580, { size: 19, color: C.ink, fam: UI });
      text("• GROUPING(g.nom, b.ism) bitmaski", 1150, 630, { size: 19, color: C.ink, fam: UI });

      marker(1120, 770, 660 * eio(k2), 16, C.hl, 1);
      text("PostgreSQL 18 terminalida ko'ramiz!", 1450, 810, { size: 24, weight: 700, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // FRAME DISPATCHER
  function frame(t) {
    bg();
    if (t < TM.scenes.null_va_bosh_toplam.s) {
      sIntro(t);
    } else if (t < TM.scenes.group_by_va_having.s) {
      sNullVaBoshToplam(t);
    } else if (t < TM.scenes.funksional_bogliqlik.s) {
      sGroupByVaHaving(t);
    } else if (t < TM.scenes.qoshimchalar_va_xulosa.s) {
      sFunksionalBogliqlik(t);
    } else {
      sQoshimchalarVaXulosa(t);
    }
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.null_va_bosh_toplam.s + 3.0);
  };
})();
