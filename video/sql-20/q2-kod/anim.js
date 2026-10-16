// SQL 20-bob 2-qism: "Kod" — PostgreSQL 18 da UPSERT va MERGE Amaliyoti
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 22) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("20-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: UPSERT va MERGE", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ON CONFLICT DO UPDATE, EXCLUDED Jadvali va Standart MERGE", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'konflikt,'), 0.8);
    withA(kBadges, () => {
      pill("1. ON CONFLICT DO UPDATE", 360, 540, C.blue, kBadges, 20);
      pill("2. EXCLUDED BILAN YANGILASH", 780, 540, C.green, kBadges, 20);
      pill("3. DO NOTHING & CHEKLOVLAR", 1200, 540, C.purple, kBadges, 20);
      pill("4. STANDART SQL MERGE", 1600, 540, C.red, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'eksklyuded'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("So'zlar lug'ati hisoblagichini yaratish, EXCLUDED maxsus jadvalidan qiymatlarni qo'shish,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("Hamda ombor tovarlarini yangi_kelgan jadvali bilan bir so'rovda MERGE qilishni o'rganamiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. ON CONFLICT DEMO
  function sOnConflictDemo(t) {
    heading("INSERT ON CONFLICT: Hisoblagich va RETURNING", t, TM.scenes.on_conflict_demo.s);

    const k1 = P(t, W('L2', 'Lug‘at'), 0.5);
    withA(k1, () => {
      const out1 = [
        " soz  | soni | yangi ",
        "------+------+-------",
        " olma |    1 | t",
        "(1 row)",
        "INSERT 0 1",
        "",
        " soz  | soni | yangi ",
        "------+------+-------",
        " olma |    2 | f",
        "(1 row)",
        "INSERT 0 1"
      ];
      term(120, 220, 840, 480, "ON CONFLICT DO UPDATE Terminali", [{
        b: {
          cmd: "-- 1. Birinchi marta kiritish (qator yo'q bo'lsa):\nINSERT INTO lugat (soz) VALUES ('olma')\nON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1\nRETURNING *, (old.soz IS NULL) AS yangi;\n\n-- 2. Xuddi shu buyruqni ikkinchi marta berish:\nINSERT INTO lugat (soz) VALUES ('olma')\nON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1\nRETURNING *, (old.soz IS NULL) AS yangi;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'apdeyt'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Tahlil: Hisoblagich Mexanizmi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Birinchi Safar — Qator Qo'shildi:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• 'olma' so'zi jadvalda yo'q edi, shuning uchun INSERT qilindi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• old.soz IS NULL qiymati 't' (rost) bo'lib qaytdi, soni = 1 bo'ldi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. Ikkinchi Safar — Qator Yangilandi:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• 'olma' allaqachon bor, PRIMARY KEY to'qnashuvi yuz berdi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• DO UPDATE SET soni = soni + 1 ishlab, soni = 2 ga aylandi. yangi = 'f'.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'qaytaradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Amaliy Foydasi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ushbu yagona so'rov veb-sayt sahifalari ko'rilishi sonini, teglarni va so'z qidiruvlari hisoblagichlarini parallel yuklamada 100% xatosiz yuritish imkonini beradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. EXCLUDED USAGE
  function sExcludedUsage(t) {
    heading("EXCLUDED: Ommaviy Kiritishda Yangi Qiymat", t, TM.scenes.excluded_usage.s);

    const k1 = P(t, W('L3', 'eksklyuded'), 0.5);
    withA(k1, () => {
      const out2 = [
        " soz  | eski | yangi ",
        "------+------+-------",
        " nok  |      |    10",
        " olma |    2 |     7",
        "(2 rows)",
        "",
        "INSERT 0 2"
      ];
      term(120, 220, 840, 480, "EXCLUDED Jadvalidan Foydalanish", [{
        b: {
          cmd: "-- Ko'p qatorli INSERT va EXCLUDED bilan yangilash:\nINSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5)\nON CONFLICT (soz) DO UPDATE\nSET soni = lugat.soni + EXCLUDED.soni\nRETURNING soz, old.soni AS eski, new.soni AS yangi;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L3', 'chetlatilgan'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("EXCLUDED Ustunlarini Birlashtirish", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. 'nok' Qatori (Yangi Yozuv):", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Jadvalda yo'q edi: eski = NULL, yangi = 10 bo'lib qo'shildi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Hech qanday konflikt yuz bermadi, oddiy INSERT bo'ldi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. 'olma' Qatori (Konflikt va EXCLUDED):", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• lugat.soni = 2 (mavjud) + EXCLUDED.soni = 5 (yangi).", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Yangi qiymat new.soni = 7 ga teng bo'ldi!", 1070, 635, { size: 17, color: C.green, weight: 700, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'yangilaydi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("EXCLUDED Nimani Anglatadi?", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("EXCLUDED — bu konflikt tufayli jadvalga to'g'ridan-to'g'ri kiritilmasdan chetlatilgan, ammo SET iborasida hisoblash uchun taqdim etilgan yangi qatordir.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. CONFLICT RULES
  function sConflictRules(t) {
    heading("Konflikt Maqsadi va Qat'iy Qoidalar", t, TM.scenes.conflict_rules.s);

    const k1 = P(t, W('L4', 'yunik'), 0.5);
    withA(k1, () => {
      const outRules = [
        " soz | soni ",
        "-----+------",
        "(0 rows)",
        "INSERT 0 0",
        "",
        "ERROR: ON CONFLICT DO UPDATE command cannot affect row a second time",
        "HINT: Ensure that no rows proposed for insertion have duplicate constrained values.",
        "",
        "ERROR: there is no unique or exclusion constraint matching ON CONFLICT"
      ];
      term(120, 220, 840, 480, "Xatolar va Qoidalar Sinovi", [{
        b: {
          cmd: "-- 1. DO NOTHING va RETURNING:\nINSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT DO NOTHING RETURNING *;\n\n-- 2. Bitta buyruqda bir xil kalit ikki marta kelsa:\nINSERT INTO lugat (soz) VALUES ('anor'), ('anor')\nON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1;\n\n-- 3. UNIQUE bo'lmagan ustun berilsa:\nINSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT (soni) DO NOTHING;",
          out: outRules
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L4', 'ikki'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.red, p: k2 });
      hand("PostgreSQL Qat'iy Qoidalari", 1040, 280, { size: 28, color: C.red, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. Deterministik Amallar Qoidasi:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• Bitta INSERT buyrug'i bitta qatorni faqat bir marta o'zgartirishi mumkin.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• ('anor'), ('anor') kelsa baza qaysi birini birinchi yangilashni bilmaydi va xato beradi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Hakam Cheklov (Unique Constraint):", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• ON CONFLICT (soni) xato berdi, chunki soni ustunida UNIQUE indeks yo'q.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Maqsad sifatida faqat takrorlanmas cheklovli ustunlar ko'rsatilishi shart.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'beradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Tavsiya:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ommaviy ma'lumot kiritishdan oldin takror kalitlar bo'lsa, ularni avval ilova yoki GROUP BY orqali birlashtirib, keyin bitta toza UPSERT so'rovi bilan yuborish lozim.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. MERGE DEMO
  function sMergeDemo(t) {
    heading("Standart MERGE: Uchta Amal Bitta So'rovda", t, TM.scenes.merge_demo.s);

    const k1 = P(t, W('L5', 'myorj'), 0.5);
    withA(k1, () => {
      const outMerge = [
        " merge_action | sku  | soni | narx ",
        "--------------+------+------+------",
        " UPDATE       | NON  |   30 | 4200",
        " INSERT       | TUZ  |   30 | 2000",
        " DELETE       | CHOY |    3 | 9000",
        "(3 rows)",
        "",
        "MERGE 3",
        " sku | soni | narx  ",
        "-----+------+-------",
        " NON |   30 |  4200",
        " SUT |    5 | 12000",
        " TUZ |   30 |  2000"
      ];
      term(120, 220, 840, 480, "MERGE INTO Terminali", [{
        b: {
          cmd: "MERGE INTO ombor o\nUSING yangi_kelgan y ON o.sku = y.sku\nWHEN MATCHED AND y.ochirilsin THEN DELETE\nWHEN MATCHED THEN UPDATE SET soni = o.soni + y.soni, narx = y.narx\nWHEN NOT MATCHED THEN INSERT (sku, soni, narx) VALUES (y.sku, y.soni, y.narx)\nRETURNING merge_action(), o.*;\n\nSELECT * FROM ombor ORDER BY sku;",
          out: outMerge
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L5', 'yangiladi,'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("MERGE Natijalari Tahlili", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. Har Qator Uchun Alohida Amal:", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• NON: mavjud edi -> UPDATE bo'ldi (soni 30, narx 4200).", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• TUZ: yo'q edi -> INSERT bo'ldi (yangidan qo'shildi).", 1070, 455, { size: 17, color: C.ink, wrap: 660 });
      text("• CHOY: ochirilsin = true edi -> DELETE bo'ldi (omboridan o'chirildi).", 1070, 490, { size: 17, color: C.red, weight: 700, wrap: 660 });

      card(1040, 525, 720, 145, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Tegilmagan Qatorlar:", 1070, 565, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• SUT tovari yangi_kelgan ro'yxatida yo'q edi, shuning uchun u tegilmasdan o'z holicha saqlanib qoldi.", 1070, 610, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'o‘chirdi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Standartning Kuchli Tomoni:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("Bitta MERGE buyrug'i omborni yangi tovarlar ro'yxatiga to'liq muvofiqlashtirdi. merge_action() funksiyasi esa qaysi qator qanday qayta ishlanganini hisobot uchun taqdim etdi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL 18 da UPSERT va MERGE", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'parallellik'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Qachon Qaysi Buyruqni Ishlatish Kerak?", 160, 280, { size: 30, color: C.blue, p: k1 });

      card(160, 340, 760, 320, { fill: '#fff', col: C.blue, p: k1 });
      text("1. INSERT ... ON CONFLICT", 190, 390, { size: 24, weight: 700, color: C.blue });
      text("Qachon:", 190, 435, { size: 18, weight: 700, color: C.ink });
      text("• Yuqori parallellik ostida bitta jadvalga kiritish va yangilash.", 190, 470, { size: 17, color: C.ink, wrap: 700 });
      text("• Hisoblagichlar, keshlar va savatcha buyurtmalari.", 190, 505, { size: 17, color: C.ink, wrap: 700 });
      text("• Tezkor, yengil va parallel to'qnashuvlarda qulf kutishlari minimal.", 190, 545, { size: 17, color: C.green, weight: 700, wrap: 700 });

      card(960, 340, 800, 320, { fill: '#fff', col: C.purple, p: k1 });
      text("2. Standart MERGE Buyrug'i", 990, 390, { size: 24, weight: 700, color: C.purple });
      text("Qachon:", 990, 435, { size: 18, weight: 700, color: C.ink });
      text("• Tashqi manba jadvali bilan ombor yoki kataloglarni to'liq sinxronlash.", 990, 470, { size: 17, color: C.ink, wrap: 740 });
      text("• Bitta buyruqda ham INSERT, ham UPDATE, ham DELETE zarur bo'lganda.", 990, 505, { size: 17, color: C.ink, wrap: 740 });
      text("• Standart SQL ga to'liq mos keladi va merge_action() beradi.", 990, 545, { size: 17, color: C.purple, weight: 700, wrap: 740 });
    });

    const kDesc = P(t, W('L6', 'vositadir.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("Ikkala buyruq ham zamonaviy SQL ning eng kuchli vositalaridir. Keyingi qismda MySQL va SQLite da bu amallar qanday bajarilishi va qanday tuzoqlar borligini ko'rib chiqamiz.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.on_conflict_demo.s) sIntro(t);
    else if (t < S.excluded_usage.s) sOnConflictDemo(t);
    else if (t < S.conflict_rules.s) sExcludedUsage(t);
    else if (t < S.merge_demo.s) sConflictRules(t);
    else if (t < S.xulosa.s) sMergeDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.merge_demo.s + 4.0;
    frame(t);
  };
})();
