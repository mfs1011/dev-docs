// SQL 16-bob 3-qism: "Dialektlar" — MySQL va SQLite da Jadvalni O'zgartirish
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("16-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: ALTER TABLE Xususiyatlari", 960, 280, { size: 70, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MODIFY COLUMN, INSTANT DDL, Implicit Commit va 12 Qadamli Usul", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres,'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL: Tranzaksiyaviy DDL", 350, 540, C.blue, kBadges, 20);
      pill("MySQL: INSTANT DDL & Yashirin COMMIT", 900, 540, C.orange, kBadges, 20);
      pill("SQLite: Matnli Sxema & 12 Qadam", 1480, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'farqlariga'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Har bir ma'lumotlar bazasi jadvallarni o'zgartirishga turlicha yondashadi:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("MySQL onlayn DDL tezligini beradi, lekin tranzaksiyani avtomatik commit qilib yuboradi.", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("SQLite esa sxemani oddiy matn sifatida saqlagani uchun ko'plab amallarni to'liq qayta qurish orqali bajaradi.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. MYSQL INSTANT
  function sMysqlInstant(t) {
    heading("MySQL: MODIFY COLUMN va INSTANT DDL", t, TM.scenes.mysql_instant.s);

    const k1 = P(t, W('L2', 'May'), 0.5);
    withA(k1, () => {
      const out1 = [
        "id   nomi   narx       soni",
        "1    Non    4000.00    0",
        "2    Sut    12000.00   0"
      ];
      term(120, 220, 840, 480, "MySQL 9.7 Terminali: ALTER TABLE", [{
        b: {
          cmd: "ALTER TABLE mahsulotlar\n    ADD COLUMN soni INT NOT NULL DEFAULT 0,\n    ALGORITHM = INSTANT;\nALTER TABLE mahsulotlar\n    MODIFY COLUMN narx DECIMAL(12,2);\nALTER TABLE mahsulotlar\n    RENAME COLUMN nom TO nomi;\nSELECT * FROM mahsulotlar;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L2', 'Algoritm'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.orange, p: k2 });
      hand("MySQL Xususiyatlari Tahlili", 1040, 280, { size: 28, color: C.orange, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. MODIFY COLUMN (Tip va Atributlar):", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Ustun tipi va cheklovlarini bitta buyruqda o'zgartiradi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• USING kaliti yo'q — MySQL o'zining ichki qoidalari bilan avtomatik konvertatsiya qiladi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 515, 720, 155, { fill: '#fff', col: C.green, p: k2 });
      text("2. ALGORITHM = INSTANT (Onlayn DDL):", 1070, 560, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• Jadvalni diskda qayta yozmasdan, faqat metadata orqali qo'shadi.", 1070, 605, { size: 18, color: C.ink, wrap: 660 });
      text("• Millionlab qatorli jadvallarda ham bir lahzada (millisekundda) ishlaydi.", 1070, 640, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'lahzada'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Farq:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("PostgreSQL da ALTER COLUMN TYPE ... USING sintaksisi ishlatilsa, MySQL da MODIFY COLUMN va avtomatik konversiya qo'llaniladi.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 3. MYSQL IMPLICIT COMMIT
  function sMysqlImplicitCommit(t) {
    heading("MySQL: Yashirin COMMIT va TRUNCATE", t, TM.scenes.mysql_implicit_commit.s);

    const k1 = P(t, W('L3', 'Eng'), 0.5);
    withA(k1, () => {
      const out2 = [
        "id   nomi",
        "1    Non",
        "2    Sut",
        "3    Choy",
        "/* ROLLBACK ishlamadi! Choy bazada qoldi */"
      ];
      term(120, 220, 820, 360, "Yashirin COMMIT Sinovi", [{
        b: {
          cmd: "START TRANSACTION;\nINSERT INTO mahsulotlar (id, nomi) VALUES (3, 'Choy');\nALTER TABLE mahsulotlar ADD COLUMN izoh VARCHAR(100);\nROLLBACK;\nSELECT id, nomi FROM mahsulotlar ORDER BY id;",
          out: out2
        },
        t: k1,
        typeDur: 0.8
      }], { font: 15 });
    });

    const kTrunc = P(t, W('L3', 'trankeyt'), 0.5);
    withA(kTrunc, () => {
      const truncErr = [
        "ERROR 1701: Cannot truncate a table referenced in a foreign key constraint",
        "ERROR 3730: Cannot drop table referenced by a foreign key constraint"
      ];
      term(120, 600, 820, 330, "TRUNCATE va DROP CASCADE Farqlari", [{
        b: {
          cmd: "TRUNCATE TABLE mahsulotlar;\nDROP TABLE mahsulotlar CASCADE;",
          out: truncErr
        },
        t: kTrunc,
        typeDur: 0.8
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'yashirin'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 710, { fill: C.card, col: C.red, p: k2 });
      hand("Eng Xavfli Farq: Non-transactional DDL", 1020, 280, { size: 28, color: C.red, p: k2 });

      card(1020, 330, 740, 170, { fill: '#fff', col: C.red, p: k2 });
      text("1. DDL yashirin COMMIT qiladi:", 1050, 375, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• ALTER, CREATE, DROP chaqirilishi bilanoq tranzaksiya yopiladi.", 1050, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• Keyin ROLLBACK qilsangiz ham, oldingi INSERT yoki UPDATE lar qaytmaydi!", 1050, 460, { size: 18, weight: 700, color: C.red, wrap: 680 });

      card(1020, 520, 740, 180, { fill: '#fff', col: C.orange, p: k2 });
      text("2. TRUNCATE — DDL hisoblanadi:", 1050, 565, { size: 20, weight: 700, color: C.orange, wrap: 680 });
      text("• Jadvalni o'chirib yangidan ochadi, yashirin commit qiladi.", 1050, 610, { size: 18, color: C.ink, wrap: 680 });
      text("• Hech qachon ROLLBACK bilan orqaga qaytarib bo'lmaydi!", 1050, 650, { size: 18, color: C.ink, wrap: 680 });

      card(1020, 720, 740, 180, { fill: '#fff', col: C.purple, p: k2 });
      text("3. DROP TABLE ... CASCADE 'hech narsa qilmaydi':", 1050, 765, { size: 20, weight: 700, color: C.purple, wrap: 680 });
      text("• MySQL da CASCADE kalit so'zi faqat sintaktik moslik uchun qabul qilinadi.", 1050, 810, { size: 18, color: C.ink, wrap: 680 });
      text("• Tashqi kaliti bor jadval baribir o'chmaydi va xato beradi.", 1050, 850, { size: 18, color: C.soft, wrap: 680 });
    });
  }

  // 4. SQLITE LIMITS
  function sSqliteLimits(t) {
    heading("SQLite: Cheklangan ALTER TABLE", t, TM.scenes.sqlite_limits.s);

    const k1 = P(t, W('L4', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      const errOut = [
        "Error: Cannot add a column with non-constant default",
        "Parse error: Cannot add a UNIQUE column",
        "Parse error: near \"TRUNCATE\": syntax error"
      ];
      term(120, 220, 820, 480, "SQLite 3.54: Xatolar Sinovi", [{
        b: {
          cmd: "CREATE TABLE m (id INT PRIMARY KEY, nom TEXT);\nALTER TABLE m ADD COLUMN soni INT NOT NULL DEFAULT 0;\nALTER TABLE m ADD COLUMN vaqt TEXT DEFAULT CURRENT_TIMESTAMP;\nALTER TABLE m ADD COLUMN kod TEXT UNIQUE;\nTRUNCATE TABLE m;",
          out: errOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'sxema'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("Sxema Qanday Saqlanadi?", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 330, 740, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("sqlite_schema jadvalida oddiy matn:", 1050, 375, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• SQLite jadvallarni ichki metadata sifatida emas, asl CREATE TABLE matni ko'rinishida saqlaydi.", 1050, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• ALTER TABLE ishlaganda shu matn o'zgaradi va sxema qayta tahlil qilinadi.", 1050, 455, { size: 17, color: C.soft, wrap: 680 });

      card(1020, 510, 740, 165, { fill: '#fff', col: C.purple, p: k2 });
      text("Qat'iy Cheklovlar:", 1050, 555, { size: 20, weight: 700, color: C.purple, wrap: 680 });
      text("• ADD COLUMN da UNIQUE yoki PRIMARY KEY qo'shib bo'lmaydi.", 1050, 600, { size: 18, color: C.ink, wrap: 680 });
      text("• CURRENT_TIMESTAMP yoki ifodali DEFAULT qo'yib bo'lmaydi.", 1050, 635, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L4', 'trankeyt'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("TRUNCATE Buyrug'i SQLite da Umuman Yo'q!", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("SQLite da barcha qatorlarni tozalash uchun oddiy DELETE FROM jadval; ishlatiladi. SQLite o'zi ichkarida buni tezkor tozalashga optimallashtiradi.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 5. SQLITE 12 STEPS
  function sSqlite12Steps(t) {
    heading("SQLite: 12 qadamli jadval qayta qurish", t, TM.scenes.sqlite_12_steps.s);

    const k1 = P(t, W('L5', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      card(120, 220, 800, 710, { fill: C.card, col: C.blue, p: k1 });
      hand("12 Qadamli Rasmiy Ketma-ketlik", 160, 280, { size: 28, color: C.blue, p: k1 });

      const steps = [
        "1. PRAGMA foreign_keys = OFF;",
        "2. BEGIN TRANSACTION;",
        "3. Indeks, trigger va view larni saqlab qolish;",
        "4. Yangi tuzilmada CREATE TABLE new_m (...);",
        "5. INSERT INTO new_m SELECT ... FROM m;",
        "6. DROP TABLE m;",
        "7. ALTER TABLE new_m RENAME TO m;",
        "8. Indeks va triggerlarni yangidan yaratish;",
        "9. Ta'sirlangan view larni qayta tiklash;",
        "10. PRAGMA foreign_key_check;",
        "11. COMMIT;",
        "12. PRAGMA foreign_keys = ON;"
      ];

      steps.forEach((s, idx) => {
        const y = 330 + idx * 48;
        ctx.fillStyle = idx % 2 === 0 ? '#1e293b' : '#334155';
        ctx.font = `600 17px ${MONO}`;
        ctx.fillText(s, 160, y);
      });
    });

    const k2 = P(t, W('L5', 'hujjat'), 0.5);
    withA(k2, () => {
      card(960, 220, 840, 710, { fill: C.card, col: C.purple, p: k2 });
      hand("Nega Aynan Shu Ketma-ketlik?", 1000, 280, { size: 28, color: C.purple, p: k2 });

      card(1000, 330, 760, 180, { fill: '#fff', col: C.red, p: k2 });
      text("Qisqa usul nima uchun xavfli?", 1030, 375, { size: 20, weight: 700, color: C.red, wrap: 700 });
      text("• Eski jadvalni birdan RENAME qilib olish tashqi kalitlar, triggerlar va view larni buzib yuborishi mumkin.", 1030, 420, { size: 18, color: C.ink, wrap: 700 });
      text("• Shuning uchun yangi jadval ochib, ma'lumotni ko'chirish shart.", 1030, 465, { size: 18, color: C.soft, wrap: 700 });

      card(1000, 530, 760, 180, { fill: '#fff', col: C.green, p: k2 });
      text("Tranzaksiya va Tekshiruv Kafolati:", 1030, 575, { size: 20, weight: 700, color: C.green, wrap: 700 });
      text("• Butun operatsiya BEGIN va COMMIT ichida bo'lgani sababli xavfsiz.", 1030, 620, { size: 18, color: C.ink, wrap: 700 });
      text("• 10-qadamdagi foreign_key_check yangi jadval bog'liqliklarini tekshiradi.", 1030, 665, { size: 18, color: C.soft, wrap: 700 });

      card(1000, 730, 760, 175, { fill: '#fff', col: C.blue, p: k2 });
      text("Keng Qo'llanishi:", 1030, 775, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• Ustun tipini o'zgartirish, NOT NULL yoki PRIMARY KEY qo'shish kabi barcha amallar shu usulda qilinadi.", 1030, 820, { size: 18, color: C.ink, wrap: 700 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Dialektlar Taqqoslovi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Postgres'), 0.5);
    withA(k1, () => {
      card(120, 230, 520, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("PostgreSQL", 160, 290, { size: 30, color: C.blue, p: k1 });
      card(160, 330, 440, 540, { fill: '#fff', col: C.blue, p: k1 });
      text("• To'liq Tranzaksiyaviy DDL: ALTER, DROP, TRUNCATE orqaga qaytadi.", 190, 380, { size: 19, weight: 700, color: C.blue, wrap: 380 });
      text("• USING ifodasi: tiplarni istalgan ifoda bilan moslash.", 190, 450, { size: 18, color: C.ink, wrap: 380 });
      text("• DROP CASCADE: bola jadval qolib faqat kalit o'chadi.", 190, 520, { size: 18, color: C.soft, wrap: 380 });
      text("• Fast DEFAULT: 11+ da jadvalni qayta yozmasdan qo'shish.", 190, 590, { size: 18, color: C.ink, wrap: 380 });
    });

    const k2 = P(t, W('L6', 'May'), 0.5);
    withA(k2, () => {
      card(680, 230, 540, 680, { fill: C.card, col: C.orange, p: k2 });
      hand("MySQL", 720, 290, { size: 30, color: C.orange, p: k2 });
      card(720, 330, 460, 540, { fill: '#fff', col: C.orange, p: k2 });
      text("• Onlayn DDL: ALGORITHM = INSTANT bir zumda ishlaydi.", 750, 380, { size: 19, weight: 700, color: C.green, wrap: 400 });
      text("• MODIFY COLUMN: tip va cheklovlar bir yo'la o'zgaradi.", 750, 450, { size: 18, color: C.ink, wrap: 400 });
      text("• Yashirin COMMIT: DDL tranzaksiyani yakunlaydi!", 750, 520, { size: 18, weight: 700, color: C.red, wrap: 400 });
      text("• TRUNCATE: DDL, orqaga qaytarib bo'lmaydi.", 750, 590, { size: 18, color: C.soft, wrap: 400 });
    });

    const k3 = P(t, W('L6', 'Es-kyu-layt'), 0.5);
    withA(k3, () => {
      card(1260, 230, 540, 680, { fill: C.card, col: C.purple, p: k3 });
      hand("SQLite", 1300, 290, { size: 30, color: C.purple, p: k3 });
      card(1300, 330, 460, 540, { fill: '#fff', col: C.purple, p: k3 });
      text("• Sxema matn: sqlite_schema da oddiy CREATE TABLE matni.", 1330, 380, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• Cheklangan ALTER: UNIQUE yoki dinamik DEFAULT yo'q.", 1330, 450, { size: 18, color: C.ink, wrap: 400 });
      text("• 12 Qadamli Usul: murakkab o'zgarishlar yangi jadval orqali.", 1330, 520, { size: 18, color: C.ink, wrap: 400 });
      text("• TRUNCATE yo'q: DELETE FROM ishlatiladi.", 1330, 590, { size: 18, color: C.soft, wrap: 400 });
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.mysql_instant.s) sIntro(t);
    else if (t < sc.mysql_implicit_commit.s) sMysqlInstant(t);
    else if (t < sc.sqlite_limits.s) sMysqlImplicitCommit(t);
    else if (t < sc.sqlite_12_steps.s) sSqliteLimits(t);
    else if (t < sc.xulosa.s) sSqlite12Steps(t);
    else sXulosa(t);
  }

  window.render = render;
  window.renderFrame = render;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_implicit_commit.s + 5.0;
    render(t);
  };
})();
