// SQL 27-bob 1-qism: "Tushuncha" — Subquery tushunchasi va turlari
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
    hand("27-bob. Subquery'lar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da Subquery Tushunchasi va Turlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Boshqa so'rov ichida qavsga olingan SELECT: tashqi va ichki so'rov", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBox = P(t, 2.5, 0.8);
    withA(kBox, () => {
      // Outer query card
      card(200, 440, 1520, 500, { fill: C.card, col: C.blue, p: kBox });
      text("Tashqi so'rov (Outer Query):", 240, 500, { size: 26, weight: 700, color: C.blue, fam: UI });
      text("SELECT ism, ball FROM baholar", 240, 555, { size: 24, weight: 700, color: C.ink, fam: MONO });
      text("WHERE ball > ", 240, 615, { size: 24, weight: 700, color: C.ink, fam: MONO });

      // Inner subquery nested card
      const kInner = P(t, 4.0, 0.8);
      withA(kInner, () => {
        card(450, 570, 1220, 160, { fill: '#f0fdf4', col: C.green, p: kInner });
        text("Ichki so'rov — Subquery (qavs ichidagi SELECT):", 480, 615, { size: 22, weight: 700, color: C.green, fam: UI });
        text("(SELECT avg(ball) FROM baholar)", 480, 675, { size: 28, weight: 700, color: C.ink, fam: MONO });
        pill("85.0", 1120, 675, C.green, kInner, 22);
      });

      text("ORDER BY ball DESC;", 240, 780, { size: 24, weight: 700, color: C.ink, fam: MONO });

      const kExplain = P(t, 5.5, 0.8);
      withA(kExplain, () => {
        card(240, 830, 1440, 80, { fill: '#fff', col: C.blue, p: kExplain });
        text("Mantiq: Avval ichki so'rov hisoblanadi (85.0), so'ng tashqi so'rov shu qiymat bilan filtrlaydi.", 270, 880, { size: 22, color: C.ink, fam: UI });
      });
    });
  }

  // 2. SKALYAR VA TURLAR
  function sSkalyarVaTurlar(t) {
    heading("Subquery Natija Shakliga Ko'ra 4 Ta Tur", t, TM.scenes.skalyar_va_turlar.s);

    const kCards = P(t, TM.scenes.skalyar_va_turlar.s + 0.3, 0.8);
    withA(kCards, () => {
      // 4 cards for 4 types
      const types = [
        { name: "Skalyar (Scalar)", shape: "1 qator × 1 ustun", where: "Oddiy qiymat turadigan hamma joyda", col: C.blue },
        { name: "Ustun (Column)", shape: "Ko'p qator × 1 ustun", where: "IN, ANY, ALL ning o'ng tomonida", col: C.green },
        { name: "Qator (Row)", shape: "1 qator × Ko'p ustun", where: "Qator taqqoslash: (a, b) = (SELECT ...)", col: C.purple },
        { name: "Hosila jadval (Table)", shape: "Ko'p qator × Ko'p ustun", where: "FROM ichida (derived table), EXISTS", col: C.orange },
      ];

      types.forEach((item, i) => {
        const bx = 100 + i * 435;
        card(bx, 200, 415, 340, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + 207, 250, item.col, kCards, 18);
        text("Shakli:", bx + 30, 320, { size: 18, weight: 700, color: C.soft, fam: UI });
        text(item.shape, bx + 30, 360, { size: 22, weight: 700, color: C.ink, fam: UI });
        text("Qayerda ishlatiladi:", bx + 30, 420, { size: 18, weight: 700, color: C.soft, fam: UI });
        text(item.where, bx + 30, 460, { size: 18, color: C.ink, fam: UI, maxW: 360 });
      });

      // Skalyar qoidasi
      const kRule = P(t, W('skalyar', 'bitta'), 0.8);
      withA(kRule, () => {
        card(100, 580, 1720, 380, { fill: '#fff', col: C.blue, p: kRule });
        text("Skalyar Subquery Qat'iy Qoidalari:", 140, 635, { size: 26, weight: 700, color: C.blue, fam: UI });

        const rules = [
          { badge: "Aynan 1×1", desc: "Aynan bitta qator va bitta ustun qaytarishi shart.", col: C.green },
          { badge: "Ko'p qator = XATO", desc: "ERROR: more than one row returned by a subquery used as expression.", col: C.red },
          { badge: "Ko'p ustun = XATO", desc: "ERROR: subquery must return only one column.", col: C.red },
          { badge: "Qator yo'q = NULL", desc: "Agar mos qator topilmasa, xato bermaydi — natija NULL bo'ladi.", col: C.orange },
        ];

        rules.forEach((r, i) => {
          const ry = 690 + i * 65;
          pill(r.badge, 260, ry, r.col, kRule, 18);
          text(r.desc, 420, ry + 6, { size: 21, weight: 600, color: C.ink, fam: UI });
        });
      });
    });
  }

  // 3. KORRELYATSIYA
  function sKorrelyatsiya(t) {
    heading("Korrelyatsiyalangan vs Oddiy Bog'lanmagan Subquery", t, TM.scenes.korrelyatsiya.s);

    const k = P(t, TM.scenes.korrelyatsiya.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Oddiy bog'lanmagan
      card(100, 200, 830, 760, { fill: C.card, col: C.blue, p: k });
      pill("Oddiy (Bog'lanmagan) Subquery", 515, 250, C.blue, k, 20);

      card(140, 310, 750, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT ism, ball FROM baholar", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("WHERE ball > (SELECT avg(ball) FROM baholar);", 170, 410, { size: 20, weight: 700, color: C.blue, fam: MONO });

      text("Xususiyatlari:", 140, 520, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Tashqi so'rov ustunlariga murojaat QILMAYDI.", 140, 570, { size: 20, color: C.ink, fam: UI });
      text("• Baza uni butun so'rov davomida FAQAT 1 MARTA hisoblaydi.", 140, 620, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• Natijasi keshlanadi va barcha tashqi qatorlar uchun qayta ishlatiladi.", 140, 670, { size: 20, color: C.soft, fam: UI });

      // Right: Korrelyatsiyalangan
      card(990, 200, 830, 760, { fill: '#fdfbfe', col: C.purple, p: k });
      pill("Korrelyatsiyalangan (Correlated) Subquery", 1405, 250, C.purple, k, 20);

      card(1030, 310, 750, 180, { fill: '#fff', col: C.purple, p: k });
      text("SELECT nom,", 1060, 355, { size: 20, color: C.ink, fam: MONO });
      text("  (SELECT max(b.ball) FROM baholar b", 1060, 395, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("   WHERE b.guruh_id = g.id) AS eng_yuqori", 1060, 435, { size: 20, weight: 700, color: C.purple, fam: MONO });
      text("FROM guruhlar g ORDER BY nom;", 1060, 475, { size: 20, color: C.ink, fam: MONO });

      text("Xususiyatlari:", 1030, 530, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Tashqi so'rov ustuniga (g.id) to'g'ridan-to'g'ri bog'lanadi.", 1030, 580, { size: 20, color: C.ink, fam: UI });
      text("• Har bir tashqi qator uchun QAYTADAN hisoblanadi!", 1030, 630, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• Tashqi ustun bitta subquery siklida konstanta (o'zgarmas) bo'ladi.", 1030, 680, { size: 20, color: C.soft, fam: UI });
      text("• Har qatorga alohida hisoblash katta jadvallarda sekinlashishi mumkin.", 1030, 730, { size: 20, color: C.red, fam: UI });
    });
  }

  // 4. EXISTS VA IN
  function sExistsVaIn(t) {
    heading("EXISTS, IN, ANY va ALL Operatorlari", t, TM.scenes.exists_va_in.s);

    const k = P(t, TM.scenes.exists_va_in.s + 0.3, 0.8);
    withA(k, () => {
      // Left: EXISTS
      card(100, 200, 830, 760, { fill: C.card, col: C.green, p: k });
      pill("EXISTS (subquery)", 515, 250, C.green, k, 20);

      card(140, 310, 750, 160, { fill: '#fff', col: C.green, p: k });
      text("SELECT nom FROM guruhlar g", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("WHERE EXISTS (SELECT 1 FROM baholar b", 170, 400, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("              WHERE b.guruh_id = g.id);", 170, 440, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("Asosiy afzalliklari:", 140, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Kamida bitta qator topsa darhol TRUE beradi.", 140, 560, { size: 20, color: C.ink, fam: UI });
      text("• Birinchi qatorda to'xtaydi (oxirigacha sanamaydi).", 140, 610, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• JOIN dan farqi: tashqi qatorni hech qachon takrorlamaydi!", 140, 660, { size: 20, color: C.ink, fam: UI });
      text("• Faqat TRUE yoki FALSE qaytaradi — HECH QACHON NULL EMAS!", 140, 710, { size: 20, weight: 700, color: C.blue, fam: UI });

      // Right: IN, ANY, ALL
      card(990, 200, 830, 760, { fill: C.card, col: C.blue, p: k });
      pill("IN, ANY / SOME va ALL", 1405, 250, C.blue, k, 20);

      const ops = [
        { op: "x IN (subquery)", desc: "Subquery'da x ga teng qiymat bo'lsa TRUE.", col: C.blue },
        { op: "x = ANY (subquery)", desc: "IN ning to'liq ekvivalenti (SOME sinonim).", col: C.green },
        { op: "x > ANY (subquery)", desc: "Hech bo'lmasa 1 qatordan katta bo'lsa kifoya.", col: C.purple },
        { op: "x > ALL (subquery)", desc: "Barcha qatorlardan katta bo'lsa TRUE.", col: C.orange },
        { op: "x NOT IN (subquery)", desc: "x <> ALL (subquery) ga to'liq tengdir.", col: C.red },
      ];

      ops.forEach((o, i) => {
        const oy = 320 + i * 85;
        card(1030, oy, 750, 75, { fill: '#fff', col: o.col, p: k });
        pill(o.op, 1180, oy + 37, o.col, k, 16);
        text(o.desc, 1340, oy + 42, { size: 18, weight: 600, color: C.ink, fam: UI });
      });

      card(1030, 760, 750, 160, { fill: '#eff6ff', col: C.blue, p: k });
      text("Tengliklar (PostgreSQL va SQL standarti):", 1060, 805, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("IN  ≡  = ANY", 1060, 855, { size: 22, weight: 700, color: C.ink, fam: MONO });
      text("NOT IN  ≡  <> ALL", 1060, 895, { size: 22, weight: 700, color: C.red, fam: MONO });
    });
  }

  // 5. TUZOQ VA DERIVED
  function sTuzoqVaDerived(t) {
    heading("NOT IN Tuzog'i va Hosila Jadvallar", t, TM.scenes.tuzoq_va_derived.s);

    const k = P(t, TM.scenes.tuzoq_va_derived.s + 0.3, 0.8);
    withA(k, () => {
      // Left: NOT IN and NULL Trap
      card(100, 200, 830, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("DIQQAT: NOT IN va NULL Tuzog'i!", 515, 250, C.red, k, 20);

      card(140, 310, 750, 150, { fill: '#fff', col: C.red, p: k });
      text("SELECT nom FROM guruhlar", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("WHERE id NOT IN (SELECT guruh_id FROM baholar);", 170, 410, { size: 20, weight: 700, color: C.red, fam: MONO });

      card(140, 480, 750, 120, { fill: '#ffebeb', col: C.red, p: k });
      text("Natija: 0 rows (BO'SH NATIJA!)", 170, 530, { size: 22, weight: 700, color: C.red, fam: MONO });
      text("Sabab: baholar jadvalida Jasurning guruh_id qiymati NULL edi!", 170, 570, { size: 18, color: C.ink, fam: UI });

      text("Mantiq: NOT IN bu <> ALL demakdir:", 140, 640, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("3 <> 1 AND 3 <> 2 AND 3 <> NULL  ==>  NULL (Noma'lum)", 140, 680, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("Shart NULL bo'lsa, WHERE uni o'tkazmaydi!", 140, 725, { size: 19, color: C.ink, fam: UI });

      card(140, 770, 750, 150, { fill: '#e6fffa', col: C.green, p: k });
      text("To'g'ri yechimlar:", 170, 810, { size: 20, weight: 700, color: C.green, fam: UI });
      text("1. NOT EXISTS (... WHERE b.guruh_id = g.id)  -- Eng xavfsiz!", 170, 850, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("2. WHERE id NOT IN (SELECT ... WHERE guruh_id IS NOT NULL)", 170, 890, { size: 19, color: C.ink, fam: MONO });

      // Right: Derived Table
      card(990, 200, 830, 760, { fill: C.card, col: C.blue, p: k });
      pill("Hosila Jadval (Derived Table)", 1405, 250, C.blue, k, 20);

      card(1030, 310, 750, 180, { fill: '#fff', col: C.blue, p: k });
      text("SELECT avg(soni)", 1060, 360, { size: 20, color: C.ink, fam: MONO });
      text("FROM (", 1060, 400, { size: 20, color: C.blue, fam: MONO });
      text("  SELECT guruh_id, count(*) AS soni", 1060, 435, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("  FROM baholar GROUP BY guruh_id", 1060, 470, { size: 20, color: C.blue, fam: MONO });
      text(") AS t; -- Standartda AS t majburiy!", 1060, 505, { size: 20, color: C.orange, fam: MONO });

      text("Asosiy xususiyatlari:", 1030, 560, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• FROM ichidagi subquery hosila jadval deyiladi.", 1030, 610, { size: 20, color: C.ink, fam: UI });
      text("• Agregat ustidan agregat: AVG(COUNT(*)) o'rniga ishlatiladi.", 1030, 660, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• SQL standarti hosila jadvalga ALIAS (nom) berishni talab qiladi.", 1030, 710, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("• PostgreSQL alias siz ruxsat beradi, ammo MySQL da 1248 xatosi beradi!", 1030, 760, { size: 20, color: C.red, fam: UI });

      pill("avg: 2.0", 1405, 850, C.blue, k, 24);
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.skalyar_va_turlar.s) sIntro(t);
    else if (t < TM.scenes.korrelyatsiya.s) sSkalyarVaTurlar(t);
    else if (t < TM.scenes.exists_va_in.s) sKorrelyatsiya(t);
    else if (t < TM.scenes.tuzoq_va_derived.s) sExistsVaIn(t);
    else sTuzoqVaDerived(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
