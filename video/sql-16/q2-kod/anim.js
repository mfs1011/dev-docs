// SQL 16-bob 2-qism: "Kod" — PostgreSQL 18 da ALTER TABLE Amaliyoti
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("16-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: ALTER TABLE Amaliyoti", 960, 280, { size: 74, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ADD COLUMN, ALTER TYPE & USING, DROP CASCADE, TRUNCATE & ROLLBACK", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 410, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres'), 0.8);
    withA(kBadges, () => {
      pill("1. ADD COLUMN (CHECK / DEFAULT)", 350, 540, C.blue, kBadges, 20);
      pill("2. ALTER TYPE & USING", 820, 540, C.purple, kBadges, 20);
      pill("3. DROP TABLE CASCADE", 1240, 540, C.red, kBadges, 20);
      pill("4. TRUNCATE & ROLLBACK", 1630, 540, C.green, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'kolumn,'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Mavjud jadvallarga xavfsiz yangi ustunlar qo'shish va cheklovlar o'rnatish,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("Ustun tipini almashtirishda USING ifodasi hamda tranzaksiyaviy DDL imkoniyatlarini sinovdan o'tkazamiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. ADD COLUMN DEMO
  function sAddColumnDemo(t) {
    heading("ADD COLUMN: CHECK va NOT NULL DEFAULT", t, TM.scenes.add_column_demo.s);

    const k1 = P(t, W('L2', 'Mahsulotlar'), 0.5);
    withA(k1, () => {
      const out1 = [
        "ALTER TABLE",
        "ALTER TABLE",
        " id | nom | narx  | tavsif | soni ",
        "----+-----+-------+--------+------",
        "  1 | Non | 4000  |        |    0",
        "  2 | Sut | 12000 |        |    0",
        "(2 rows)"
      ];
      term(120, 220, 840, 470, "ADD COLUMN Buyruqlari", [{
        b: {
          cmd: "ALTER TABLE mahsulotlar\n    ADD COLUMN tavsif text CHECK (tavsif <> '');\nALTER TABLE mahsulotlar\n    ADD COLUMN soni integer NOT NULL DEFAULT 0;\nSELECT * FROM mahsulotlar;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L2', 'Yangi'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 470, { fill: C.card, col: C.green, p: k2 });
      hand("Tahlil: Mavjud Qatorlar Xavfsizligi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. tavsif text CHECK (tavsif <> ''):", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Mavjud qatorlarda yangi ustun NULL bo'lib tushadi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• CHECK cheklovi NULL ni o'tkazadi (NULL <> '' noma'lum), xato bermaydi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. soni integer NOT NULL DEFAULT 0:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• NOT NULL bilan DEFAULT berilgani uchun har bir qatorga 0 qiymati yoziladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• PostgreSQL 11 dan boshlab bu amal jadvalni to'liq qayta yozmasdan bir lahzada bajariladi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'xavfsiz'), 0.5);
    withA(kDesc, () => {
      card(120, 720, 1680, 210, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim Qoida:", 160, 770, { size: 26, color: C.blue, p: kDesc });
      text("Mavjud ma'lumoti bor jadvalga NOT NULL ustun qo'shishda albatta DEFAULT qiymat bo'lishi shart, aks holda buyruq mavjud qatorlar sababli rad etiladi.", 160, 830, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 3. TYPE USING DEMO
  function sTypeUsingDemo(t) {
    heading("Tipni o‘zgartirish va USING kaliti", t, TM.scenes.type_using_demo.s);

    const k1 = P(t, W('L3', 'Narx'), 0.5);
    withA(k1, () => {
      const errOut = [
        "ERROR: column \"narx\" cannot be cast automatically to type numeric",
        "HINT: You might need to specify \"USING narx::numeric(12,2)\"."
      ];
      term(120, 220, 820, 280, "1. To'g'ridan-to'g'ri o'zgartirish (Xato)", [{
        b: {
          cmd: "ALTER TABLE mahsulotlar\n    ALTER COLUMN narx TYPE numeric(12,2);",
          out: errOut
        },
        t: k1,
        typeDur: 0.8
      }], { font: 15 });
    });

    const kFix = P(t, W('L3', 'Uni'), 0.5);
    withA(kFix, () => {
      const fixOut = [
        "ALTER TABLE",
        "               Table \"public.mahsulotlar\"",
        " Column |     Type      | Collation | Nullable | Default ",
        "--------+---------------+-----------+----------+---------",
        " id     | integer       |           | not null | ",
        " nomi   | text          |           | not null | ",
        " narx   | numeric(12,2) |           |          | ",
        " tavsif | text          |           |          | ",
        " soni   | integer       |           | not null | 0"
      ];
      term(120, 520, 820, 420, "2. USING bilan to'g'ri yechim", [{
        b: {
          cmd: "ALTER TABLE mahsulotlar\n    ALTER COLUMN narx TYPE numeric(12,2)\n    USING narx::numeric;",
          out: fixOut
        },
        t: kFix,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'nyumerik'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 720, { fill: C.card, col: C.purple, p: k2 });
      hand("Nega USING talab etiladi?", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 740, 170, { fill: '#fff', col: C.red, p: k2 });
      text("Avtomatik kasting mavjud emas:", 1050, 365, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• text tipidan numeric tipiga sukut bo'yicha implicit cast yo'q.", 1050, 410, { size: 18, color: C.ink, wrap: 680 });
      text("• Chunki matn ichida harflar bo'lsa, son tipiga aylantirib bo'lmaydi.", 1050, 450, { size: 18, color: C.soft, wrap: 680 });

      card(1020, 510, 740, 180, { fill: '#fff', col: C.green, p: k2 });
      text("USING narx::numeric nima qiladi?", 1050, 555, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• Har bir mavjud qatordagi narx matnini eksplitsit konvertatsiya qiladi.", 1050, 600, { size: 18, color: C.ink, wrap: 680 });
      text("• Agar qatorda '4000' bo'lsa, u muvaffaqiyatli 4000.00 raqamiga o'tadi.", 1050, 640, { size: 18, color: C.soft, wrap: 680 });

      card(1020, 710, 740, 190, { fill: '#fff', col: C.blue, p: k2 });
      text("Murakkab ifodalar ham mumkin:", 1050, 755, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• Masalan: USING round(narx::numeric, 2)", 1050, 800, { size: 18, fam: MONO, color: C.blue, wrap: 680 });
      text("• Yoki: USING CASE WHEN narx = '' THEN 0 ELSE narx::numeric END", 1050, 845, { size: 17, fam: MONO, color: C.ink, wrap: 680 });
    });
  }

  // 4. DROP CASCADE DEMO
  function sDropCascadeDemo(t) {
    heading("Bog‘liqliklar va DROP CASCADE", t, TM.scenes.drop_cascade_demo.s);

    const k1 = P(t, W('L4', 'Tashqi'), 0.5);
    withA(k1, () => {
      const errOut = [
        "ERROR: cannot drop table mahsulotlar because other objects depend on it",
        "DETAIL: constraint qatorlar_mahsulot_id_fkey on table qatorlar depends on table mahsulotlar",
        "HINT: Use DROP ... CASCADE to drop the dependent objects too."
      ];
      term(120, 220, 820, 290, "1. Oddiy DROP (Xato beradi)", [{
        b: {
          cmd: "DROP TABLE mahsulotlar;",
          out: errOut
        },
        t: k1,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'Tranzaksiya'), 0.5);
    withA(k2, () => {
      const dropRollbackOut = [
        "BEGIN",
        "NOTICE: drop cascades to constraint qatorlar_mahsulot_id_fkey on table qatorlar",
        "DROP TABLE",
        "ROLLBACK",
        " mahsulotlar_qaytdi ",
        "--------------------",
        "                  2",
        "(1 row)"
      ];
      term(120, 530, 820, 410, "2. Tranzaksiyada DROP CASCADE & ROLLBACK", [{
        b: {
          cmd: "BEGIN;\nDROP TABLE mahsulotlar CASCADE;\nROLLBACK;\nSELECT count(*) AS mahsulotlar_qaytdi FROM mahsulotlar;",
          out: dropRollbackOut
        },
        t: k2,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k3 = P(t, W('L4', 'bola'), 0.5);
    withA(k3, () => {
      card(980, 220, 820, 720, { fill: C.card, col: C.blue, p: k3 });
      hand("CASCADE Xatti-harakati Tahlili", 1020, 280, { size: 28, color: C.blue, p: k3 });

      card(1020, 330, 740, 180, { fill: '#fff', col: C.purple, p: k3 });
      text("Bola jadval qoladimi yoki o'chadimi?", 1050, 375, { size: 20, weight: 700, color: C.purple, wrap: 680 });
      text("• qatorlar jadvali BUTUNLAY O'CHMAYDI!", 1050, 420, { size: 19, weight: 700, color: C.red, wrap: 680 });
      text("• Faqat uning ustidagi tashqi kalit (foreign key) cheklovi o'chadi.", 1050, 465, { size: 18, color: C.ink, wrap: 680 });

      card(1020, 530, 740, 180, { fill: '#fff', col: C.green, p: k3 });
      text("Tranzaksiyada ROLLBACK qilinganda:", 1050, 575, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• mahsulotlar jadvali barcha qatorlari bilan tiklanadi.", 1050, 620, { size: 18, color: C.ink, wrap: 680 });
      text("• qatorlar jadvalidagi tashqi kalit cheklovi ham joyiga qaytadi.", 1050, 665, { size: 18, color: C.soft, wrap: 680 });

      card(1020, 730, 740, 180, { fill: '#fff', col: C.blue, p: k3 });
      text("PostgreSQL Afzalligi:", 1050, 775, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• DDL amallari to'liq tranzaksiyaviy: xato bo'lsa ROLLBACK qilinadi.", 1050, 820, { size: 18, color: C.ink, wrap: 680 });
      text("• Sinov va migratsiyalarni xavfsiz amalga oshirish mumkin.", 1050, 865, { size: 18, color: C.soft, wrap: 680 });
    });
  }

  // 5. TRUNCATE DEMO
  function sTruncateDemo(t) {
    heading("TRUNCATE va ROLLBACK xavfsizligi", t, TM.scenes.truncate_demo.s);

    const k1 = P(t, W('L5', 'Tashqi'), 0.5);
    withA(k1, () => {
      const errOut = [
        "ERROR: cannot truncate a table referenced in a foreign key constraint",
        "DETAIL: Table \"qatorlar\" references \"mahsulotlar\".",
        "HINT: Truncate table \"qatorlar\" at the same time, or use TRUNCATE ... CASCADE."
      ];
      term(120, 220, 820, 290, "1. Tashqi kalitli jadvalda TRUNCATE", [{
        b: {
          cmd: "TRUNCATE mahsulotlar;",
          out: errOut
        },
        t: k1,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'Shuningdek'), 0.5);
    withA(k2, () => {
      const truncRollbackOut = [
        "BEGIN",
        "TRUNCATE TABLE",
        "ROLLBACK",
        " qatorlar_qaytdi ",
        "-----------------",
        "               1",
        "(1 row)"
      ];
      term(120, 530, 820, 410, "2. Tranzaksiyada TRUNCATE & ROLLBACK", [{
        b: {
          cmd: "BEGIN;\nTRUNCATE qatorlar;\nROLLBACK;\nSELECT count(*) AS qatorlar_qaytdi FROM qatorlar;",
          out: truncRollbackOut
        },
        t: k2,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k3 = P(t, W('L5', 'tranzaksiyaviy'), 0.5);
    withA(k3, () => {
      card(980, 220, 820, 720, { fill: C.card, col: C.green, p: k3 });
      hand("TRUNCATE Mexanizmi va Farqlari", 1020, 280, { size: 28, color: C.green, p: k3 });

      card(1020, 330, 740, 180, { fill: '#fff', col: C.blue, p: k3 });
      text("Nega TRUNCATE juda tez ishlaydi?", 1050, 375, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• DELETE har bir qatorni alohida o'chiradi va WAL ga yozadi.", 1050, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• TRUNCATE esa butun ma'lumot faylini yangisiga almashtiradi.", 1050, 465, { size: 18, color: C.soft, wrap: 680 });

      card(1020, 530, 740, 180, { fill: '#fff', col: C.green, p: k3 });
      text("PostgreSQL da ROLLBACK kafolati:", 1050, 575, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• Ko'p MB tizimlarida TRUNCATE orqaga qaytmaydi.", 1050, 620, { size: 18, color: C.ink, wrap: 680 });
      text("• PostgreSQL da esa eski fayl tranzaksiya commit bo'lmaguncha saqlanadi!", 1050, 665, { size: 18, weight: 700, color: C.green, wrap: 680 });

      card(1020, 730, 740, 180, { fill: '#fff', col: C.purple, p: k3 });
      text("Tashqi Kalit Qoidasi:", 1050, 775, { size: 20, weight: 700, color: C.purple, wrap: 680 });
      text("• Boshqa jadval havola qilsa, yakka o'zini TRUNCATE qilib bo'lmaydi.", 1050, 820, { size: 18, color: C.ink, wrap: 680 });
      text("• Ikkalasini birga TRUNCATE qatorlar, mahsulotlar qilish lozim.", 1050, 865, { size: 18, color: C.soft, wrap: 680 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL Amaliyoti", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Postgres'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 320, { fill: C.card, col: C.blue, p: k1 });
      hand("1. Xavfsiz ADD COLUMN", 180, 290, { size: 26, color: C.blue, p: k1 });
      text("• NOT NULL ustun qo'shishda doimo DEFAULT qiymat belgilang.", 180, 345, { size: 19, color: C.ink, wrap: 700 });
      text("• PostgreSQL 11+ da jadvalni qayta yozmasdan darhol qo'shiladi.", 180, 395, { size: 19, color: C.soft, wrap: 700 });
      text("• CHECK cheklovi NULL qiymatlarni rad etmaydi.", 180, 445, { size: 19, color: C.ink, wrap: 700 });
    });

    const k2 = P(t, W('L6', 'di-di-el'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 320, { fill: C.card, col: C.purple, p: k2 });
      hand("2. Tip O'zgartirish va USING", 1020, 290, { size: 26, color: C.purple, p: k2 });
      text("• Avtomatik kasting bo'lmasa, USING ifodasi talab etiladi.", 1020, 345, { size: 19, color: C.ink, wrap: 720 });
      text("• Murakkab CASE va round() funksiyalaridan foydalanish mumkin.", 1020, 395, { size: 19, color: C.soft, wrap: 720 });
      text("• Yangi tip butun ustundagi mavjud ma'lumotlarga mos bo'lishi shart.", 1020, 445, { size: 19, color: C.ink, wrap: 720 });
    });

    const k3 = P(t, W('L6', 'tranzaksiyada'), 0.5);
    withA(k3, () => {
      card(140, 580, 780, 330, { fill: C.card, col: C.red, p: k3 });
      hand("3. DROP CASCADE Ogohligi", 180, 640, { size: 26, color: C.red, p: k3 });
      text("• CASCADE bola jadvalni emas, uning cheklovini o'chiradi.", 180, 695, { size: 19, color: C.ink, wrap: 700 });
      text("• Tranzaksiya ichida tekshirib, xato bo'lsa ROLLBACK qilish mumkin.", 180, 745, { size: 19, color: C.soft, wrap: 700 });
      text("• Ishlab turgan tizimlarda ehtiyotkorlik bilan qo'llang.", 180, 795, { size: 19, color: C.ink, wrap: 700 });
    });

    const k4 = P(t, W('L6', 'migratsiyalarni'), 0.5);
    withA(k4, () => {
      card(980, 580, 800, 330, { fill: C.card, col: C.green, p: k4 });
      hand("4. Tranzaksiyaviy DDL Imtiyozi", 1020, 640, { size: 26, color: C.green, p: k4 });
      text("• PostgreSQL da ALTER, DROP, TRUNCATE to'liq tranzaksiyaviy.", 1020, 695, { size: 19, color: C.ink, wrap: 720 });
      text("• Migratsiya skripti o'rtada xato bersa, baza yarimta holatda qolib ketmaydi.", 1020, 745, { size: 19, color: C.green, weight: 700, wrap: 720 });
      text("• Barcha DDL operatsiyalari xavfsiz va boshqariladigan bo'ladi.", 1020, 805, { size: 19, color: C.soft, wrap: 720 });
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.add_column_demo.s) sIntro(t);
    else if (t < sc.type_using_demo.s) sAddColumnDemo(t);
    else if (t < sc.drop_cascade_demo.s) sTypeUsingDemo(t);
    else if (t < sc.truncate_demo.s) sDropCascadeDemo(t);
    else if (t < sc.xulosa.s) sTruncateDemo(t);
    else sXulosa(t);
  }

  window.render = render;
  window.renderFrame = render;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.type_using_demo.s + 6.0;
    render(t);
  };
})();
