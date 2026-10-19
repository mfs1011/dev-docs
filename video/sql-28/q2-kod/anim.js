// SQL 28-bob 2-qism: "Kod" — PostgreSQL 18 da Real Set Amallari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("28-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Amaliy Set Amallari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Real terminal: UNION [ALL], INTERSECT [ALL], EXCEPT [ALL] va Ustuvorlik", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'jadvallaridan'), 0.8);
    withA(kCards, () => {
      // 3 Table previews (a, b, c)
      const tables = [
        { name: "a Jadvali", rows: ["1 | 2", "2 | 3", "3 | 4"], col: C.blue, note: "3 ta qator" },
        { name: "b Jadvali", rows: ["1 | 2  (a bilan umumiy)", "1 | 3", "3 | 4  (a bilan umumiy)"], col: C.green, note: "3 ta qator" },
        { name: "c Jadvali", rows: ["1 | 3  (1-marta)", "1 | 3  (2-marta takror!)", "3 | 4"], col: C.purple, note: "3 ta qator (takrorli)" },
      ];

      tables.forEach((item, i) => {
        const bx = 100 + i * 585;
        card(bx, 440, 555, 500, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + 277, 490, item.col, kCards, 22);

        text("m | n", bx + 40, 560, { size: 20, weight: 700, color: item.col, fam: MONO });
        text("----+---", bx + 40, 590, { size: 20, color: '#94a3b8', fam: MONO });

        item.rows.forEach((r, ri) => {
          text(r, bx + 40, 635 + ri * 45, { size: 19, weight: 600, color: C.ink, fam: MONO });
        });

        text(item.note, bx + 40, 830, { size: 18, weight: 700, color: C.soft, fam: UI });
      });
    });
  }

  // 2. UNION VA ALL
  function sUnionVaAll(t) {
    heading("UNION vs UNION ALL: Takrorlarni Filtrlash", t, TM.scenes.union_va_all.s);

    const k = P(t, TM.scenes.union_va_all.s + 0.3, 0.8);
    withA(k, () => {
      // Left: UNION (DISTINCT)
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("SELECT * FROM a UNION SELECT * FROM b;", 520, 250, C.blue, k, 18);

      card(140, 310, 760, 280, { fill: '#1e293b', col: '#334155', p: k });
      text(" m | n ", 170, 355, { size: 20, weight: 700, color: '#93c5fd', fam: MONO });
      text("---+---", 170, 390, { size: 20, color: '#64748b', fam: MONO });
      text(" 1 | 2  (ikkala jadvalda bor edi, 1 marta qoldi)", 170, 430, { size: 18, color: '#4ade80', fam: MONO });
      text(" 1 | 3  (b jadvalidan)", 170, 470, { size: 18, color: '#fff', fam: MONO });
      text(" 2 | 3  (a jadvalidan)", 170, 510, { size: 18, color: '#fff', fam: MONO });
      text(" 3 | 4  (ikkala jadvalda bor edi, 1 marta qoldi)", 170, 550, { size: 18, color: '#4ade80', fam: MONO });

      card(140, 630, 760, 280, { fill: '#eff6ff', col: C.blue, p: k });
      text("Natija: 4 rows (Takrorlar olib tashlandi)", 170, 680, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("• (1,2) va (3,4) ikkala jadvalda ham bor edi.", 170, 735, { size: 19, color: C.ink, fam: UI });
      text("• UNION ularni avtomatik DISTINCT qilib bittadan qoldirdi.", 170, 785, { size: 19, color: C.ink, fam: UI });
      text("• Baza ichki tartiblash (Sort/Hash) bilan takrorlarni qidiradi.", 170, 835, { size: 18, color: C.soft, fam: UI });

      // Right: UNION ALL
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("SELECT * FROM a UNION ALL SELECT * FROM b;", 1410, 250, C.green, k, 18);

      card(1040, 310, 740, 340, { fill: '#1e293b', col: '#334155', p: k });
      text(" m | n ", 1070, 350, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("---+---", 1070, 380, { size: 20, color: '#64748b', fam: MONO });
      text(" 1 | 2  (a dan)", 1070, 415, { size: 18, color: '#fff', fam: MONO });
      text(" 1 | 2  (b dan — takror saqlandi!)", 1070, 450, { size: 18, color: '#fbbf24', fam: MONO });
      text(" 1 | 3  (b dan)", 1070, 485, { size: 18, color: '#fff', fam: MONO });
      text(" 2 | 3  (a dan)", 1070, 520, { size: 18, color: '#fff', fam: MONO });
      text(" 3 | 4  (a dan)", 1070, 555, { size: 18, color: '#fff', fam: MONO });
      text(" 3 | 4  (b dan — takror saqlandi!)", 1070, 590, { size: 18, color: '#fbbf24', fam: MONO });
      text("(6 rows) -- 3 + 3 = 6 qator to'liq chiqdi", 1070, 625, { size: 17, color: '#94a3b8', fam: MONO });

      card(1040, 690, 740, 220, { fill: '#f0fdf4', col: C.green, p: k });
      text("Natija: 6 rows (Barcha qatorlar qo'shildi)", 1070, 740, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• Hech qanday saralash yoki takror qidirish bo'lmaydi.", 1070, 790, { size: 19, color: C.ink, fam: UI });
      text("• Eng tezkor usul: doimo UNION ALL ni afzal ko'ring!", 1070, 835, { size: 19, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 3. INTERSECT VA EXCEPT
  function sIntersectVaExcept(t) {
    heading("INTERSECT (Kesishma) va EXCEPT (Ayirma)", t, TM.scenes.intersect_va_except.s);

    const k = P(t, TM.scenes.intersect_va_except.s + 0.3, 0.8);
    withA(k, () => {
      // Left: INTERSECT
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("SELECT * FROM a INTERSECT SELECT * FROM b;", 520, 250, C.green, k, 18);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text(" m | n ", 170, 360, { size: 20, weight: 700, color: '#86efac', fam: MONO });
      text("---+---", 170, 395, { size: 20, color: '#64748b', fam: MONO });
      text(" 1 | 2  <-- a da ham, b da ham bor", 170, 440, { size: 19, color: '#4ade80', fam: MONO });
      text(" 3 | 4  <-- a da ham, b da ham bor", 170, 485, { size: 19, color: '#4ade80', fam: MONO });

      card(140, 570, 760, 340, { fill: '#f0fdf4', col: C.green, p: k });
      text("Natija: 2 rows (Umumiy kesishma)", 170, 620, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• Faqat har ikkala jadvalda mavjud bo'lgan qatorlar olindi.", 170, 675, { size: 19, color: C.ink, fam: UI });
      text("• Kommutativ amal: a INTERSECT b == b INTERSECT a.", 170, 725, { size: 19, color: C.blue, fam: UI });
      text("• INNER JOIN ga o'xshaydi, ammo ustunlar yonma-yon qo'shilmaydi.", 170, 775, { size: 18, color: C.soft, fam: UI });

      // Right: EXCEPT
      card(1000, 200, 820, 760, { fill: C.card, col: C.red, p: k });
      pill("SELECT * FROM a EXCEPT SELECT * FROM b;", 1410, 250, C.red, k, 18);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#334155', p: k });
      text(" m | n ", 1070, 360, { size: 20, weight: 700, color: '#f87171', fam: MONO });
      text("---+---", 1070, 395, { size: 20, color: '#64748b', fam: MONO });
      text(" 2 | 3  <-- a da bor, lekin b da YO'Q!", 1070, 440, { size: 19, color: '#f87171', fam: MONO });

      card(1040, 570, 740, 340, { fill: '#fff5f5', col: C.red, p: k });
      text("Natija: 1 row (Faqat a da qolgan ayirma)", 1070, 620, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• a jadvalidagi (1,2) va (3,4) b jadvalida borligi uchun o'chirildi.", 1070, 675, { size: 19, color: C.ink, fam: UI });
      text("• DIQQAT: b EXCEPT a qilinsa, natija (1,3) bo'ladi!", 1070, 735, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• EXCEPT kommutativ EMAS: o'rin almashtirib bo'lmaydi!", 1070, 785, { size: 19, weight: 700, color: C.red, fam: UI });
    });
  }

  // 4. ALL HISOBI
  function sAllHisobi(t) {
    heading("Takrorlar Matematikasi: INTERSECT ALL va EXCEPT ALL", t, TM.scenes.all_hisobi.s);

    const k = P(t, TM.scenes.all_hisobi.s + 0.3, 0.8);
    withA(k, () => {
      // Top: c table reminder
      card(100, 200, 1720, 120, { fill: '#faf5ff', col: C.purple, p: k });
      text("c jadvali tarkibi: (1,3) — 2 marta takror, (3,4) — 1 marta.", 140, 250, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("a jadvali tarkibi: (1,2) — 1 marta, (2,3) — 1 marta, (3,4) — 1 marta.", 140, 290, { size: 20, color: C.ink, fam: UI });

      // Left: INTERSECT ALL
      card(100, 350, 840, 610, { fill: C.card, col: C.green, p: k });
      pill("c INTERSECT ALL c", 520, 400, C.green, k, 19);

      card(140, 460, 760, 180, { fill: '#1e293b', col: '#334155', p: k });
      text(" m | n ", 170, 500, { size: 18, color: '#86efac', fam: MONO });
      text("---+---", 170, 530, { size: 18, color: '#64748b', fam: MONO });
      text(" 1 | 3  (1-nusxa)", 170, 565, { size: 18, color: '#4ade80', fam: MONO });
      text(" 1 | 3  (2-nusxa)", 170, 600, { size: 18, color: '#4ade80', fam: MONO });

      card(140, 670, 760, 240, { fill: '#f0fdf4', col: C.green, p: k });
      text("Mantiq: min(m, n) = min(2, 2) = 2 ta (1,3)", 170, 720, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Har ikki tomonda nechtadan takror bo'lsa, eng kami saqlanadi.", 170, 770, { size: 18, color: C.ink, fam: UI });
      text("• DISTINCT bo'lganda edi, faqat bitta (1,3) qolardi.", 170, 820, { size: 18, color: C.soft, fam: UI });

      // Right: EXCEPT ALL vs EXCEPT
      card(1000, 350, 820, 610, { fill: C.card, col: C.red, p: k });
      pill("c EXCEPT ALL a  vs  c EXCEPT a", 1410, 400, C.red, k, 19);

      card(1040, 460, 740, 180, { fill: '#1e293b', col: '#334155', p: k });
      text("c EXCEPT ALL a -> 2 rows (1,3 dan 2 ta)", 1070, 505, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("c EXCEPT a     -> 1 row  (1,3 dan 1 ta)", 1070, 555, { size: 18, color: '#fb923c', fam: MONO });

      card(1040, 670, 740, 240, { fill: '#fff5f5', col: C.red, p: k });
      text("Mantiq: max(m - n, 0) = max(2 - 0, 0) = 2 ta (1,3)", 1070, 720, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• (3,4) esa c da 1 ta, a da 1 ta: max(1 - 1, 0) = 0 ta (o'chirildi).", 1070, 770, { size: 18, color: C.ink, fam: UI });
      text("• ALL siz variantda takrorlar qisqarib faqat 1 ta (1,3) qoladi.", 1070, 820, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 5. USTUVORLIK
  function sUstuvorlik(t) {
    heading("Ustuvorlik: INTERSECT Har Doim Avval Bajariladi", t, TM.scenes.ustuvorlik.s);

    const k = P(t, TM.scenes.ustuvorlik.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.purple, p: k });
      pill("SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c;", 960, 255, C.purple, k, 20);

      card(140, 320, 1640, 140, { fill: '#fff', col: C.purple, p: k });
      text("Bu so'rov qanday tartibda bajariladi?", 180, 365, { size: 22, weight: 700, color: C.purple, fam: UI });
      text("PostgreSQL va MySQL da: a UNION (b INTERSECT c)  -- INTERSECT ustunroq!", 180, 415, { size: 22, weight: 700, color: C.blue, fam: MONO });

      // Step by step
      card(140, 490, 790, 420, { fill: '#fdf4ff', col: C.purple, p: k });
      text("1-qadam: b INTERSECT c hisoblanadi:", 170, 540, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("b = {(1,2), (1,3), (3,4)}", 170, 590, { size: 19, color: C.ink, fam: MONO });
      text("c = {(1,3), (1,3), (3,4)}", 170, 630, { size: 19, color: C.ink, fam: MONO });
      text("Kesishma = {(1,3), (3,4)}", 170, 680, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("2-qadam: a UNION (kesishma):", 170, 740, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("{(1,2), (2,3), (3,4)} UNION {(1,3), (3,4)}", 170, 785, { size: 18, color: C.ink, fam: MONO });
      text("= {(1,2), (1,3), (2,3), (3,4)}  --> 4 rows!", 170, 835, { size: 21, weight: 700, color: C.blue, fam: MONO });

      card(970, 490, 810, 420, { fill: '#fff5f5', col: C.red, p: k });
      text("DIQQAT: Agar chapdan o'ngga bajarilganda:", 1000, 540, { size: 20, weight: 700, color: C.red, fam: UI });
      text("(a UNION b) INTERSECT c bo'lardi:", 1000, 590, { size: 19, color: C.ink, fam: MONO });
      text("Natija faqat 2 qator: {(1,3), (3,4)} bo'lib qolardi!", 1000, 640, { size: 20, weight: 700, color: C.red, fam: UI });
      text("PostgreSQL va MySQL da har doim to'g'ri 4 qator chiqadi.", 1000, 700, { size: 19, color: C.green, fam: UI });
      text("KATTA OGOHLANTIRISH: SQLite da ustuvorlik yo'q va u aynan 2 qator beradi (chapdan o'ngga)!", 1000, 760, { size: 19, weight: 700, color: C.red, fam: UI, maxW: 750 });
    });
  }

  // 6. ORDER VA XATOLAR
  function sOrderVaXatolar(t) {
    heading("ORDER BY Qoidalari, Moslik va Xatolar", t, TM.scenes.order_va_xatolar.s);

    const k = P(t, TM.scenes.order_va_xatolar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: ORDER BY rules
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("ORDER BY Faqat Natija Ustuni Bo'yicha", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT m AS x, n FROM a UNION SELECT * FROM b", 170, 355, { size: 18, color: C.blue, fam: MONO });
      text("ORDER BY x DESC, n LIMIT 2;", 170, 400, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("Natija: (3,4) va (2,3) -- 'x' nomi bo'yicha to'g'ri saralandi!", 170, 440, { size: 17, color: C.green, fam: UI });

      card(140, 500, 760, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("ERROR: ORDER BY m + n -- IFODA BILAN SARALASH XATO!", 170, 545, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("ERROR: invalid UNION/INTERSECT/EXCEPT ORDER BY clause", 170, 590, { size: 16, color: C.red, fam: MONO });
      text("DETAIL: Only result column names can be used.", 170, 625, { size: 16, color: C.soft, fam: MONO });

      card(140, 690, 760, 220, { fill: '#f0fdf4', col: C.green, p: k });
      text("Bir qismga LIMIT: Qavsdan foydalaniladi:", 170, 735, { size: 19, weight: 700, color: C.green, fam: UI });
      text("(SELECT m FROM a ORDER BY m DESC LIMIT 1)", 170, 780, { size: 16, color: C.ink, fam: MONO });
      text("UNION (SELECT m FROM b ORDER BY m LIMIT 1) ORDER BY m;", 170, 815, { size: 16, color: C.ink, fam: MONO });
      text("Natija: 1 va 3 (2 rows).", 170, 865, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: Compat & NULL
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("Moslik Xatolari va NULL Qoidasi", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("1. Ustunlar soni farqi:", 1070, 350, { size: 18, weight: 700, color: C.red, fam: UI });
      text("SELECT m, n FROM a UNION SELECT m FROM b;", 1070, 390, { size: 16, color: C.ink, fam: MONO });
      text("ERROR: each UNION query must have same number of cols", 1070, 430, { size: 16, color: C.red, fam: MONO });

      card(1040, 490, 740, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("2. Tip mos kelmasligi:", 1070, 530, { size: 18, weight: 700, color: C.red, fam: UI });
      text("SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;", 1070, 570, { size: 16, color: C.ink, fam: MONO });
      text("ERROR: invalid input syntax for type integer: 'matn'", 1070, 610, { size: 16, color: C.red, fam: MONO });

      card(1040, 675, 740, 235, { fill: '#f0fdf4', col: C.green, p: k });
      text("3. NULL takror hisoblanadi:", 1070, 715, { size: 18, weight: 700, color: C.green, fam: UI });
      text("SELECT 1, 'x' UNION SELECT NULL, NULL UNION SELECT NULL, NULL;", 1070, 755, { size: 15, color: C.ink, fam: MONO });
      text("Natija: Faqat 2 ta qator (NULL lardan biri o'chirildi!).", 1070, 805, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("To'plam amallarida NULL = NULL har doim TENG!", 1070, 850, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.union_va_all.s) sIntro(t);
    else if (t < TM.scenes.intersect_va_except.s) sUnionVaAll(t);
    else if (t < TM.scenes.all_hisobi.s) sIntersectVaExcept(t);
    else if (t < TM.scenes.ustuvorlik.s) sAllHisobi(t);
    else if (t < TM.scenes.order_va_xatolar.s) sUstuvorlik(t);
    else sOrderVaXatolar(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
