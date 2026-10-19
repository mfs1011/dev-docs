// SQL 29-bob 1-qism: "Tushuncha" — CTE (Common Table Expression)
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
    hand("29-bob. CTE", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da CTE (Common Table Expression)", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("WITH bilan e'lon qilinadigan nomli vaqtinchalik natijalar va view'lar", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBox = P(t, W('intro', 'si-ti-i'), 0.8);
    withA(kBox, () => {
      card(140, 440, 1640, 500, { fill: C.card, col: C.blue, p: kBox });
      pill("Umumiy Sintaksis va Mantiq", 960, 490, C.blue, kBox, 22);

      card(180, 540, 1560, 200, { fill: '#fff', col: C.blue, p: kBox });
      text("WITH nom1 AS (", 210, 585, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("  SELECT guruh_id, avg(ball) AS ortacha FROM baholar GROUP BY guruh_id", 250, 625, { size: 20, color: C.ink, fam: MONO });
      text("),", 210, 665, { size: 22, weight: 700, color: C.blue, fam: MONO });
      text("nom2 AS (SELECT * FROM nom1 WHERE ortacha >= 90)", 250, 705, { size: 20, color: C.purple, fam: MONO });

      card(180, 770, 1560, 130, { fill: '#f0fdf4', col: C.green, p: kBox });
      text("SELECT * FROM nom2 JOIN guruhlar ON guruhlar.id = nom2.guruh_id;", 210, 820, { size: 22, weight: 700, color: C.green, fam: MONO });
      text("Asosiy maqsad: Murakkab, ichma-ich ko'milgan so'rovlarni o'qilishi oson, sodda qismlarga bo'lish.", 210, 865, { size: 19, color: C.ink, fam: UI });
    });
  }

  // 2. AFZALLIKLARI
  function sAfzalliklari(t) {
    heading("CTE va Hosila Jadval (Derived Table) Solishtiruvi", t, TM.scenes.afzalliklari.s);

    const k = P(t, TM.scenes.afzalliklari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Hosila jadval kamchiliklari
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("Hosila Jadval (Derived Table — 27-bob)", 520, 250, C.red, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.red, p: k });
      text("SELECT * FROM (", 170, 355, { size: 19, color: C.ink, fam: MONO });
      text("  SELECT guruh_id, count(*) AS soni FROM ...", 170, 395, { size: 18, color: C.soft, fam: MONO });
      text(") AS t WHERE soni > 1;", 170, 435, { size: 19, color: C.ink, fam: MONO });

      text("Kamchiliklari:", 140, 520, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• So'rovda faqat BIR MARTA ishlatiladi (takrorlab bo'lmaydi).", 140, 570, { size: 19, color: C.ink, fam: UI });
      text("• O'zidan oldingi yoki keyingi jadvallarga murojaat qila olmaydi.", 140, 620, { size: 19, color: C.ink, fam: UI });
      text("• Ichma-ich ko'milib ketadi — o'qish va tushunish juda qiyin.", 140, 670, { size: 19, color: C.ink, fam: UI });
      text("• Rekursiv imkoniyatga ega emas.", 140, 720, { size: 19, color: C.soft, fam: UI });

      // Right: CTE afzalliklari
      card(1000, 200, 820, 760, { fill: '#f0fdf4', col: C.green, p: k });
      pill("CTE (Common Table Expression — 29-bob)", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 160, { fill: '#fff', col: C.green, p: k });
      text("WITH s AS (", 1070, 355, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("  SELECT guruh_id, count(*) AS soni FROM ...", 1070, 395, { size: 18, color: C.ink, fam: MONO });
      text(")", 1070, 435, { size: 19, weight: 700, color: C.blue, fam: MONO });

      text("Katta afzalliklari:", 1040, 520, { size: 22, weight: 700, color: C.green, fam: UI });
      text("✓ Bitta so'rovda BIR NECHA JOYDA qayta murojaat qilinadi (reusable).", 1040, 570, { size: 19, weight: 700, color: C.green, fam: UI });
      text("✓ Bitta CTE o'zidan oldingi CTE ga bemalol tayana oladi (zanjir).", 1040, 625, { size: 19, color: C.ink, fam: UI });
      text("✓ Kod boshida aniq turadi — modulli va toza arxitektura.", 1040, 675, { size: 19, color: C.ink, fam: UI });
      text("✓ O'z-o'ziga murojaat qilish imkoniyati: Rekursiv CTE (30-bob).", 1040, 725, { size: 19, color: C.purple, fam: UI });
    });
  }

  // 3. QOIDALAR
  function sQoidalar(t) {
    heading("Sintaksis Qoidalari va Ustun Nomlarini Belgilash", t, TM.scenes.qoidalar.s);

    const k = P(t, TM.scenes.qoidalar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Syntax rules & mistakes
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Sintaksis va Murojaat Qoidalari", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("XATO: Ketma-ket ikkita WITH yozish:", 170, 350, { size: 18, weight: 700, color: C.red, fam: UI });
      text("WITH a AS (...) WITH b AS (...)  -- SYNTAX ERROR!", 170, 395, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("To'g'ri: WITH a AS (...), b AS (...)  (faqat vergul!)", 170, 440, { size: 18, weight: 700, color: C.green, fam: MONO });

      card(140, 500, 760, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("XATO: Oldinga murojaat (Forward Reference):", 170, 545, { size: 18, weight: 700, color: C.red, fam: UI });
      text("WITH a AS (SELECT * FROM b), b AS (...) -- XATO!", 170, 590, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("ERROR: relation 'b' does not exist", 170, 635, { size: 18, color: C.red, fam: MONO });

      card(140, 710, 760, 210, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qat'iy qoida: CTE faqat o'zidan OLDIN yozilgan", 170, 760, { size: 20, weight: 700, color: C.green, fam: UI });
      text("boshqa CTE'larga murojaat qila oladi. Har doim", 170, 805, { size: 20, color: C.ink, fam: UI });
      text("mantiqiy ketma-ketlikda yozilishi shart!", 170, 850, { size: 20, weight: 700, color: C.blue, fam: UI });

      // Right: Explicit Column names
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("Ustun Nomlarini CTE Nomidan So'ng Belgilash", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 180, { fill: '#fff', col: C.purple, p: k });
      text("WITH s (guruh, soni) AS (", 1070, 360, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("  SELECT guruh_id, count(*)", 1070, 400, { size: 20, color: C.ink, fam: MONO });
      text("  FROM baholar GROUP BY guruh_id", 1070, 440, { size: 20, color: C.ink, fam: MONO });
      text(")", 1070, 480, { size: 20, weight: 700, color: C.purple, fam: MONO });

      card(1040, 520, 740, 390, { fill: '#faf5ff', col: C.purple, p: k });
      text("Afzalliklari:", 1070, 565, { size: 22, weight: 700, color: C.purple, fam: UI });
      text("• Ichki SELECT da har bir ustunga 'AS nom' yozish shart emas.", 1070, 615, { size: 19, color: C.ink, fam: UI });
      text("• Tashqarida aniq s.guruh va s.soni deb chaqiriladi.", 1070, 665, { size: 19, color: C.ink, fam: UI });
      text("• Ayniqsa rekursiv CTE'larda (30-bob) ustun nomlarini", 1070, 715, { size: 19, color: C.soft, fam: UI });
      text("  oldindan e'lon qilish kodni nihoyatda tartibli qiladi.", 1070, 760, { size: 19, color: C.soft, fam: UI });
    });
  }

  // 4. MATERIALIZATSIYA
  function sMaterializatsiya(t) {
    heading("Materializatsiya: AS MATERIALIZED va NOT MATERIALIZED", t, TM.scenes.materializatsiya.s);

    const k = P(t, TM.scenes.materializatsiya.s + 0.3, 0.8);
    withA(k, () => {
      // Left: MATERIALIZED
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("AS MATERIALIZED (Vaqtinchalik Jadvalga Saqlash)", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.orange, p: k });
      text("WITH w AS MATERIALIZED (", 170, 355, { size: 20, weight: 700, color: C.orange, fam: MONO });
      text("  SELECT * FROM baholar", 170, 395, { size: 20, color: C.ink, fam: MONO });
      text(") SELECT * FROM w WHERE id = 2;", 170, 435, { size: 20, color: C.ink, fam: MONO });

      card(140, 490, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("CTE Scan on w", 170, 535, { size: 19, weight: 700, color: '#fb923c', fam: MONO });
      text("  Filter: (id = 2)", 170, 570, { size: 19, color: '#fff', fam: MONO });
      text("  CTE w", 170, 605, { size: 19, color: '#fb923c', fam: MONO });
      text("    ->  Seq Scan on baholar", 170, 640, { size: 19, color: '#f87171', fam: MONO });

      card(140, 715, 760, 200, { fill: '#fffdfa', col: C.orange, p: k });
      text("Xususiyati: Avval butun jadval xotiraga to'liq o'qiladi,", 170, 760, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("so'ngra filtrlash bajariladi. Qimmat hisoblarni keshlab,", 170, 805, { size: 18, color: C.ink, fam: UI });
      text("bir necha joyda qayta ishlatishda juda qo'l keladi.", 170, 845, { size: 18, color: C.soft, fam: UI });

      // Right: NOT MATERIALIZED (INLINE)
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("AS NOT MATERIALIZED (Inline / Qo'shib Yuborish)", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 160, { fill: '#fff', col: C.blue, p: k });
      text("WITH w AS ( -- yoki NOT MATERIALIZED", 1070, 355, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("  SELECT * FROM baholar", 1070, 395, { size: 19, color: C.ink, fam: MONO });
      text(") SELECT * FROM w WHERE id = 2;", 1070, 435, { size: 19, color: C.ink, fam: MONO });

      card(1040, 490, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("Index Scan using baholar_pkey on baholar", 1070, 535, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("  Index Cond: (id = 2)", 1070, 575, { size: 19, color: '#4ade80', fam: MONO });
      text("(CTE Scan yo'q — to'g'ridan-to'g'ri indeksga tushdi!)", 1070, 625, { size: 17, color: '#86efac', fam: MONO });

      card(1040, 715, 740, 200, { fill: '#eff6ff', col: C.blue, p: k });
      text("PostgreSQL 12+ Sukut Qoidasi:", 1070, 760, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• Agar CTE faqat 1 marta ishlatilsa: avtomatik inline bo'ladi.", 1070, 805, { size: 18, color: C.ink, fam: UI });
      text("• Agar 2 yoki undan ko'p ishlatilsa: avtomatik materializatsiya!", 1070, 845, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. OZGARTIRUVCHI CTE
  function sOzgartiruvchiCte(t) {
    heading("PostgreSQL: Ma'lumotni O'zgartiruvchi CTE (Data-Modifying)", t, TM.scenes.ozgartiruvchi_cte.s);

    const k = P(t, TM.scenes.ozgartiruvchi_cte.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.green, p: k });
      pill("Bitta Tranzaksiyada Qatorlarni O'chirish va Arxivga Ko'chirish", 960, 255, C.green, k, 21);

      card(140, 310, 1640, 200, { fill: '#fff', col: C.green, p: k });
      text("WITH kochirilgan AS (", 180, 360, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("  DELETE FROM baholar WHERE ball < 86", 220, 405, { size: 21, weight: 700, color: C.red, fam: MONO });
      text("  RETURNING *  -- O'chirilgan qatorlarni natija sifatida qaytaradi", 220, 445, { size: 21, weight: 700, color: C.green, fam: MONO });
      text(")", 180, 485, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("INSERT INTO arxiv SELECT * FROM kochirilgan;", 180, 525, { size: 22, weight: 700, color: C.purple, fam: MONO });

      card(140, 560, 1640, 360, { fill: '#f0fdf4', col: C.green, p: k });
      text("Bu nima beradi?", 180, 610, { size: 24, weight: 700, color: C.green, fam: UI });
      text("1. Atomik operatsiya: O'chirish va qo'shish bitta SQL buyrug'ida bajariladi — bitta tranzaksiya!", 180, 660, { size: 20, color: C.ink, fam: UI });
      text("2. Ikki bosqichli skriptga hojat yo'q: Ali (85) va Jasur (70) baholar jadvalidan o'chib, bir lahzada arxivga tushdi.", 180, 715, { size: 19, color: C.ink, fam: UI });
      text("3. Bir xil Snapshot (Snapshot Isolation): Barcha qismlar bitta lahzadagi holatni ko'radi.", 180, 770, { size: 19, color: C.purple, fam: UI });
      text("4. Diqqat: Bu qobiliyat PostgreSQL da mavjud, MySQL va SQLite da CTE faqat SELECT bilan ishlaydi.", 180, 825, { size: 19, weight: 700, color: C.orange, fam: UI });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.afzalliklari.s) sIntro(t);
    else if (t < TM.scenes.qoidalar.s) sAfzalliklari(t);
    else if (t < TM.scenes.materializatsiya.s) sQoidalar(t);
    else if (t < TM.scenes.ozgartiruvchi_cte.s) sMaterializatsiya(t);
    else sOzgartiruvchiCte(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
