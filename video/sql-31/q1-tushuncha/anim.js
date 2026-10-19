// SQL 31-bob 1-qism: "Tushuncha" — Window funksiyalar
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
    hand("31-bob. Window Funksiyalar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Oyna Funksiyalari (Window Functions)", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Qatorlarni birlashtirmasdan, har bir satr yonida guruh statistikalarini hisoblash", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBox = P(t, W('intro', 'Window'), 0.8);
    withA(kBox, () => {
      card(140, 440, 1640, 500, { fill: C.card, col: C.blue, p: kBox });
      pill("GROUP BY vs Window Funksiya", 960, 490, C.blue, kBox, 22);

      // Left: GROUP BY
      card(180, 540, 740, 360, { fill: '#fff5f5', col: C.red, p: kBox });
      pill("GROUP BY (26-bob)", 550, 580, C.red, kBox, 19);
      text("• Natijadagi qatorlar: Har bir guruhga FAQAT 1 TA qator.", 210, 640, { size: 19, color: C.ink, fam: UI });
      text("• Boshqa alohida ustunlar yo'qoladi (collapse).", 210, 690, { size: 19, color: C.ink, fam: UI });
      text("• Masalan: 10 ta xodimdan iborat 3 ta bo'lim uchun", 210, 740, { size: 18, color: C.soft, fam: UI });
      text("  natijada faqat 3 ta qator qaytadi.", 210, 780, { size: 18, color: C.soft, fam: UI });
      text("• Xodim ismi va oyligini birga ko'rib bo'lmaydi.", 210, 835, { size: 19, weight: 700, color: C.red, fam: UI });

      // Right: Window Function
      card(960, 540, 780, 360, { fill: '#f0fdf4', col: C.green, p: kBox });
      pill("Window Funksiya (31-bob)", 1350, 580, C.green, kBox, 19);
      text("• Natijadagi qatorlar: BARCHA 10 TA QATOR SAQLANADI!", 990, 640, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• Barcha ustunlar: xodim ismi, maoshi o'z joyida qoladi.", 990, 690, { size: 19, color: C.ink, fam: UI });
      text("• Har bir qator yoniga uning bo'limi o'rtacha maoshi,", 990, 740, { size: 18, color: C.ink, fam: UI });
      text("  tartib raqami yoki bo'limdagi ulushi qo'shiladi.", 990, 780, { size: 18, color: C.ink, fam: UI });
      text("✓ Analitika, reyting va hisobotlar uchun eng kuchli vosita!", 990, 835, { size: 19, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 2. OVER BANDI VA PARTITION
  function sOver(t) {
    heading("OVER Bandi: PARTITION BY va ORDER BY", t, TM.scenes.over_bandi_va_partition.s);

    const k = P(t, TM.scenes.over_bandi_va_partition.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Syntax
      card(100, 200, 880, 760, { fill: C.card, col: C.blue, p: k });
      pill("Window Funksiyaning Asosiy Sintaksisi", 540, 250, C.blue, k, 19);

      card(140, 310, 800, 260, { fill: '#1e293b', col: '#334155', p: k });
      text("funksiya(argumentlar) OVER (", 170, 355, { size: 21, weight: 700, color: '#93c5fd', fam: MONO });
      text("    PARTITION BY bo'lim_nomi    -- 1. Bo'laklarga bo'lish", 170, 405, { size: 19, color: '#86efac', fam: MONO });
      text("    ORDER BY maosh DESC         -- 2. Bo'lak ichida tartib", 170, 455, { size: 19, color: '#fbbf24', fam: MONO });
      text("    [frame ramkasi]             -- 3. Hisoblash chegarasi", 170, 505, { size: 19, color: '#c084fc', fam: MONO });
      text(")", 170, 545, { size: 21, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 600, 800, 330, { fill: '#eff6ff', col: C.blue, p: k });
      text("Har bir qism vazifasi:", 170, 645, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("• OVER — funksiyani oddiy agregatdan oynaga aylantiradi.", 170, 695, { size: 18, color: C.ink, fam: UI });
      text("• PARTITION BY — qatorlarni mustaqil bo'laklarga ajratadi.", 170, 745, { size: 18, color: C.ink, fam: UI });
      text("• ORDER BY — bo'lak ichida qatorlar qaysi tartibda o'qilishini", 170, 795, { size: 18, color: C.ink, fam: UI });
      text("  va oyna ramkasi (frame) qanday kengayishini belgilaydi.", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("✓ Agar PARTITION BY bo'lmasa, butun jadval bitta bo'lak hisoblanadi.", 170, 885, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: Visual Partition Box
      card(1020, 200, 800, 760, { fill: C.card, col: C.green, p: k });
      pill("Vizual Namuna: 3 Ta Bo'lak (Partition)", 1420, 250, C.green, k, 19);

      const parts = [
        { dep: "develop bo'limi (5 ta xodim)", avg: "5020", col: C.blue, rows: ["emp 8: 6000", "emp 10: 5200", "emp 11: 5200", "emp 9: 4500", "emp 7: 4200"] },
        { dep: "personnel bo'limi (2 ta xodim)", avg: "3700", col: C.purple, rows: ["emp 2: 3900", "emp 5: 3500"] },
        { dep: "sales bo'limi (3 ta xodim)", avg: "4867", col: C.green, rows: ["emp 1: 5000", "emp 3: 4800", "emp 4: 4800"] },
      ];

      parts.forEach((pItem, pIdx) => {
        const py = 310 + pIdx * 210;
        card(1060, py, 720, 185, { fill: '#fff', col: pItem.col, p: k });
        pill(pItem.dep, 1260, py + 30, pItem.col, k, 17);
        text("Bo'lim o'rtachasi: " + pItem.avg, 1500, py + 30, { size: 18, weight: 700, color: C.green, fam: MONO });

        text(pItem.rows.join("  |  "), 1090, py + 95, { size: 17, weight: 600, color: C.ink, fam: MONO });
        text("Har bir xodim o'z bo'limi ichidagi " + pItem.avg + " raqami bilan solishtiriladi.", 1090, py + 140, { size: 16, color: C.soft, fam: UI });
      });
    });
  }

  // 3. FRAME TUSHUNCHASI
  function sFrame(t) {
    heading("Frame (Oyna Ramkasi) va Sukut Qoidasi", t, TM.scenes.frame_tushunchasi.s);

    const k = P(t, TM.scenes.frame_tushunchasi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: 3 Frame modes
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("3 Ta Frame Rejimi: ROWS, RANGE, GROUPS", 520, 250, C.blue, k, 19);

      const frames = [
        {
          name: "ROWS (Qat'iy qatorlar soni)",
          code: "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW",
          desc: "Fizik qatorlar sonini sanaydi: joriy qatordan 1 ta oldingi va o'zi.",
          col: C.blue
        },
        {
          name: "RANGE (Qiymatlar oralig'i)",
          code: "RANGE BETWEEN 300 PRECEDING AND 300 FOLLOWING",
          desc: "ORDER BY dagi qiymat bo'yicha: maoshi ±300 oralig'idagi barcha xodimlar.",
          col: C.green
        },
        {
          name: "GROUPS (Tenglar guruhi)",
          code: "GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW",
          desc: "Teng qiymatli qatorlarni bitta yaxlit guruh deb hisoblaydi.",
          col: C.purple
        },
      ];

      frames.forEach((fr, fi) => {
        const fy = 310 + fi * 210;
        card(140, fy, 760, 185, { fill: '#fff', col: fr.col, p: k });
        text(fr.name, 170, fy + 35, { size: 20, weight: 700, color: fr.col, fam: UI });
        text(fr.code, 170, fy + 80, { size: 16, weight: 700, color: C.ink, fam: MONO });
        text(fr.desc, 170, fy + 130, { size: 17, color: C.soft, fam: UI, wrap: 700 });
      });

      // Right: Default Frame Trap
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("Sukut Bo'yicha Frame (Default Frame)", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 190, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Sukut qoidasi:", 1070, 345, { size: 17, color: '#94a3b8', fam: MONO });
      text("RANGE BETWEEN UNBOUNDED PRECEDING", 1070, 390, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("          AND CURRENT ROW", 1070, 430, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 520, 740, 410, { fill: '#fffbeb', col: C.orange, p: k });
      text("Bu nimani anglatadi?", 1070, 565, { size: 22, weight: 700, color: C.orange, fam: UI });
      text("1. ORDER BY bo'lsa: Bo'lak boshidan joriy qatorning", 1070, 615, { size: 18, color: C.ink, fam: UI });
      text("   oxirgi tengigacha hisoblaydi -> O'sib boruvchi yig'indi (running total)!", 1070, 655, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("2. ORDER BY bo'lmasa: Barcha qatorlar bir-biriga teng deb", 1070, 715, { size: 18, color: C.ink, fam: UI });
      text("   hisoblanadi va butun bo'lak to'liq olinadi.", 1070, 755, { size: 18, color: C.ink, fam: UI });
      text("⚠ Diqqat: sum(salary) OVER (ORDER BY salary) bo'lak jami emas,", 1070, 815, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  balki o'sib boruvchi yig'indi qaytaradi!", 1070, 855, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 4. REYTING FUNKSIYALARI
  function sReyting(t) {
    heading("Reyting Funksiyalari: row_number vs rank vs dense_rank", t, TM.scenes.reyting_funksiyalari.s);

    const k = P(t, TM.scenes.reyting_funksiyalari.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.purple, p: k });
      pill("Teng Qiymatlarda (Masalan, 5200 va 5200) Natijalar Solishtiruvi", 960, 250, C.purple, k, 20);

      card(140, 310, 1640, 420, { fill: '#1e293b', col: '#334155', p: k });
      const tableRows = [
        { emp: "Xodim", sal: "Maosh", rn: "row_number()", rnk: "rank()", drnk: "dense_rank()", desc: "Izoh", hdr: true },
        { emp: "emp 8", sal: "6000", rn: "1", rnk: "1", drnk: "1", desc: "Eng yuqori maosh" },
        { emp: "emp 10", sal: "5200", rn: "2", rnk: "2", drnk: "2", desc: "Teng maosh (1-xodim)" },
        { emp: "emp 11", sal: "5200", rn: "3", rnk: "2", drnk: "2", desc: "Teng maosh: rank ikkalasiga 2 berdi!" },
        { emp: "emp 9", sal: "4500", rn: "4", rnk: "4", drnk: "3", desc: "rank 3 ni tashlab 4 qildi, dense_rank 3 qildi!" },
        { emp: "emp 7", sal: "4200", rn: "5", rnk: "5", drnk: "4", desc: "Ketma-ket davom etadi" },
      ];

      tableRows.forEach((r, idx) => {
        const ry = 350 + idx * 56;
        const col = r.hdr ? '#93c5fd' : (idx === 3 || idx === 4 ? '#fbbf24' : '#f8fafc');
        const weight = r.hdr ? 700 : 600;
        text(r.emp, 170, ry, { size: 19, weight, color: col, fam: MONO });
        text(r.sal, 370, ry, { size: 19, weight, color: col, fam: MONO });
        text(r.rn, 570, ry, { size: 19, weight, color: col, fam: MONO, align: 'center' });
        text(r.rnk, 780, ry, { size: 19, weight, color: col, fam: MONO, align: 'center' });
        text(r.drnk, 1000, ry, { size: 19, weight, color: col, fam: MONO, align: 'center' });
        text(r.desc, 1140, ry, { size: 18, color: r.hdr ? col : (idx === 3 || idx === 4 ? '#f87171' : '#94a3b8'), fam: UI });
        if (r.hdr) {
          text("------------------------------------------------------------------------------------------------------", 170, ry + 28, { size: 16, color: '#64748b', fam: MONO });
        }
      });

      card(140, 760, 1640, 170, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qachon qaysi biri ishlatiladi?", 170, 805, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• row_number(): Faqat aniq 10 ta yoki har guruhdan Top 2 tani qat'iy ajratish uchun.", 170, 855, { size: 18, color: C.ink, fam: UI });
      text("• rank() va dense_rank(): Musobaqa va olimpiada o'rinlari (agar 2 kishi 2-o'rin olsa, keyingisi 3 mi yoki 4 mi?).", 170, 895, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 5. SILJISH VA QIYMATLAR
  function sSiljish(t) {
    heading("Siljish: lag, lead, first_value va last_value Tuzog'i", t, TM.scenes.siljish_va_qiymatlar.s);

    const k = P(t, TM.scenes.siljish_va_qiymatlar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: lag and lead
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. lag() va lead(): Qo'shni Qatorlar", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("lag(salary)          -- 1 ta oldingi qator maoshi", 170, 355, { size: 18, color: '#93c5fd', fam: MONO });
      text("salary - lag(salary) -- Oldingi xodim bilan farq", 170, 405, { size: 18, color: '#86efac', fam: MONO });
      text("lead(salary, 1, 0)   -- 1 ta keyingi qator (yo'qsa 0)", 170, 455, { size: 18, color: '#fbbf24', fam: MONO });

      card(140, 580, 760, 350, { fill: '#eff6ff', col: C.blue, p: k });
      text("Eng ko'p ishlatiladigan vaziyatlar:", 170, 625, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Oylik o'sish dinamikasi (MoM): joriy oy va o'tgan oy tushumi.", 170, 675, { size: 18, color: C.ink, fam: UI });
      text("• Foydalanuvchi qadamlar oralig'idagi vaqt farqi.", 170, 725, { size: 18, color: C.ink, fam: UI });
      text("• O'zidan oldingi yoki keyingi hodisalarni solishtirish.", 170, 775, { size: 18, color: C.ink, fam: UI });
      text("✓ Alohida SELF JOIN qilmasdan oson va tez bajariladi!", 170, 840, { size: 19, weight: 700, color: C.green, fam: UI });

      // Right: last_value trap
      card(1000, 200, 820, 760, { fill: C.card, col: C.red, p: k });
      pill("2. last_value() Tuzog'i va To'g'ri Yechimi", 1410, 250, C.red, k, 19);

      card(1040, 310, 740, 200, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("-- XATO: Sukut frame bilan last_value():", 1070, 350, { size: 17, color: '#fca5a5', fam: MONO });
      text("last_value(salary) OVER (PARTITION BY ...)", 1070, 395, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("Natija: Har qatorda O'Z QIYMATINI qaytaradi!", 1070, 440, { size: 18, weight: 700, color: '#fca5a5', fam: UI });
      text("Chunki frame CURRENT ROW da to'xtaydi.", 1070, 475, { size: 17, color: '#fca5a5', fam: UI });

      card(1040, 540, 740, 390, { fill: '#f0fdf4', col: C.green, p: k });
      text("To'g'ri yechim: Butun bo'lakka kengaytirish:", 1070, 585, { size: 21, weight: 700, color: C.green, fam: UI });
      text("last_value(salary) OVER (", 1070, 635, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("    PARTITION BY depname ORDER BY salary DESC", 1070, 675, { size: 17, color: C.ink, fam: MONO });
      text("    ROWS BETWEEN UNBOUNDED PRECEDING", 1070, 715, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("             AND UNBOUNDED FOLLOWING", 1070, 755, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text(")", 1070, 790, { size: 18, color: C.green, fam: MONO });
      text("✓ Yoki first_value(salary) ni aksincha ORDER BY salary ASC", 1070, 845, { size: 18, weight: 700, color: C.green, fam: UI });
      text("  qilib yozish orqali ham eng kichik maoshni olish mumkin!", 1070, 885, { size: 18, color: C.ink, fam: UI });
    });
  }

  // 6. BAJARILISH TARTIBI
  function sTartib(t) {
    heading("Bajarilish Ketma-ketligi va WHERE Cheklovi", t, TM.scenes.bajarilish_tartibi.s);

    const k = P(t, TM.scenes.bajarilish_tartibi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Execution lifecycle
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("SQL Operatorlarining Bajarilish Tartibi", 520, 250, C.blue, k, 19);

      const querySteps = [
        { step: "1. FROM va JOIN", desc: "Jadvallar bog'lanadi", col: '#94a3b8' },
        { step: "2. WHERE", desc: "Qatorlar filtrlanadi", col: '#94a3b8' },
        { step: "3. GROUP BY & HAVING", desc: "Guruhlar hisoblanadi", col: '#94a3b8' },
        { step: "4. SELECT (WINDOW FUNKSIYALAR)", desc: "Oyna hisoblari aynan shu yerda ishlaydi!", col: C.green, active: true },
        { step: "5. DISTINCT", desc: "Takrorlar olinadi", col: '#94a3b8' },
        { step: "6. ORDER BY & LIMIT", desc: "Natija saralanadi va qirqiladi", col: '#94a3b8' },
      ];

      querySteps.forEach((qs, qi) => {
        const qy = 310 + qi * 105;
        card(140, qy, 760, 85, { fill: qs.active ? '#f0fdf4' : '#fff', col: qs.col, p: k });
        text(qs.step, 170, qy + 42, { size: 19, weight: 700, color: qs.active ? C.green : C.ink, fam: MONO });
        text(qs.desc, 510, qy + 42, { size: 17, color: qs.active ? C.green : C.soft, fam: UI });
      });

      // Right: Error and Solution
      card(1000, 200, 820, 760, { fill: C.card, col: C.red, p: k });
      pill("Nega WHERE row_number() < 3 XATO?", 1410, 250, C.red, k, 19);

      card(1040, 310, 740, 200, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("ERROR:  window functions are not allowed in WHERE", 1070, 360, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("Sababi: WHERE bajarilayotgan paytda (2-bosqich)", 1070, 415, { size: 18, color: '#fff', fam: UI });
      text("window funksiyalar (4-bosqich) hali mavjud emas!", 1070, 460, { size: 18, weight: 700, color: '#f87171', fam: UI });

      card(1040, 540, 740, 390, { fill: '#f0fdf4', col: C.green, p: k });
      text("Yagona To'g'ri Yo'l: Subquery yoki CTE:", 1070, 585, { size: 21, weight: 700, color: C.green, fam: UI });
      text("WITH xodimlar AS (", 1070, 635, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("  SELECT depname, empno, salary,", 1070, 675, { size: 18, color: C.ink, fam: MONO });
      text("         row_number() OVER (PARTITION BY depname", 1070, 715, { size: 18, color: C.purple, fam: MONO });
      text("                            ORDER BY salary DESC) AS pos", 1070, 755, { size: 18, color: C.purple, fam: MONO });
      text("  FROM empsalary", 1070, 795, { size: 18, color: C.ink, fam: MONO });
      text(")", 1070, 830, { size: 19, weight: 700, color: C.blue, fam: MONO });
      text("SELECT * FROM xodimlar WHERE pos <= 2; -- TO'G'RI!", 1070, 875, { size: 19, weight: 700, color: C.green, fam: MONO });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.over_bandi_va_partition.s) {
      sIntro(t);
    } else if (t < TM.scenes.frame_tushunchasi.s) {
      sOver(t);
    } else if (t < TM.scenes.reyting_funksiyalari.s) {
      sFrame(t);
    } else if (t < TM.scenes.siljish_va_qiymatlar.s) {
      sReyting(t);
    } else if (t < TM.scenes.bajarilish_tartibi.s) {
      sSiljish(t);
    } else {
      sTartib(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
