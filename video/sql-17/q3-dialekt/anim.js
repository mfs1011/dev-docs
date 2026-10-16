// SQL 17-bob 3-qism: "Dialektlar" — MySQL va SQLite da View Xususiyatlari
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
    hand("17-bob. Dialektlar", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: View Xususiyatlari", 960, 280, { size: 70, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CASCADED CHECK, Buzilgan Viewlar, Fake MatView va INSTEAD OF", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Materialayzd'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL: Qat'iy Bog'liqlik & MatView", 350, 540, C.blue, kBadges, 20);
      pill("MySQL: CASCADED & Buzilgan Viewlar", 920, 540, C.orange, kBadges, 20);
      pill("SQLite: INSTEAD OF Trigger & Faqat O'qish", 1500, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'farqlarga'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Har bir ma'lumotlar bazasi view va uning yangilanishiga har xil qaraydi:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("MySQL da view tayanayotgan ustunni o'chirib yuborish mumkin, natijada view buziladi.", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("SQLite da viewlar doim faqat o'qiladi, lekin INSTEAD OF triggerlar yordamida yozishni yo'lga qo'yish mumkin.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. MYSQL VIEWS
  function sMysqlViews(t) {
    heading("MySQL: CASCADED CHECK OPTION va Yangilanish", t, TM.scenes.mysql_views.s);

    const k1 = P(t, W('L2', 'May'), 0.5);
    withA(k1, () => {
      const out1 = [
        "ERROR 1369: CHECK OPTION failed 'qollanma.arzonlar'",
        "ERROR 1288: The target table statistika of the UPDATE is not updatable",
        "",
        "+------------------+--------------+--------------+",
        "| TABLE_NAME       | IS_UPDATABLE | CHECK_OPTION |",
        "+------------------+--------------+--------------+",
        "| arzonlar         | YES          | CASCADED     |",
        "| statistika       | NO           | NONE         |",
        "+------------------+--------------+--------------+"
      ];
      term(120, 220, 840, 480, "MySQL 9.7 Terminali: View Sinovlari", [{
        b: {
          cmd: "CREATE VIEW arzonlar AS\n    SELECT id, nom, narx FROM mahsulotlar\n    WHERE narx < 5000 WITH CHECK OPTION;\nINSERT INTO arzonlar VALUES (6, 'Gosht', 90000);\nCREATE VIEW statistika AS\n    SELECT faol, COUNT(*) AS soni FROM mahsulotlar GROUP BY faol;\nUPDATE statistika SET soni = 0;\nSELECT TABLE_NAME, IS_UPDATABLE, CHECK_OPTION\nFROM information_schema.VIEWS WHERE TABLE_SCHEMA='qollanma';",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'kaskeydid'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.orange, p: k2 });
      hand("MySQL Qoidalari Tahlili", 1040, 280, { size: 28, color: C.orange, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Birga-bir (1:1) Moslik Talabi:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• View qatori bilan asosiy jadval qatori o'rtasida to'liq 1:1 bog'liqlik bo'lsa yangilanadi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• GROUP BY, UNION, DISTINCT yoki TEMPTABLE algoritmi yangilanishni to'xtatadi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. Sukut Bo'yicha CASCADED:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• MySQL da WITH CHECK OPTION sukut bo'yicha CASCADED rejimida ishlaydi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Ya'ni view ostidagi barcha zanjirli viewlarning WHERE shartlari ham qat'iy tekshiriladi.", 1070, 640, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'tarqaladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Katalog Tekshiruvi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("MySQL da istalgan view yangilanadimi yoki yo'qligini bilish uchun information_schema.VIEWS jadvalidagi IS_UPDATABLE ustunini tekshirish kifoya.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 3. MYSQL BROKEN VIEWS
  function sMysqlBrokenViews(t) {
    heading("MySQL: Bog‘liqlik Tekshiruvi Yo‘qligi", t, TM.scenes.mysql_broken_views.s);

    const k1 = P(t, W('L3', 'Xavfli'), 0.5);
    withA(k1, () => {
      const out2 = [
        "ALTER TABLE /* Muvaffaqiyatli! Xato chiqmadi */",
        "",
        "ERROR 1356 (HY000): View 'qollanma.faol_mahsulotlar'",
        "references invalid table(s) or column(s) or function(s)",
        "or definer/invoker of view lack rights to use them"
      ];
      term(120, 220, 820, 480, "Ustun O'chirilganda Viewning Buzilishi", [{
        b: {
          cmd: "CREATE VIEW faol_mahsulotlar AS\n    SELECT id, nom, narx FROM mahsulotlar WHERE faol;\nALTER TABLE mahsulotlar DROP COLUMN narx;\nSELECT * FROM faol_mahsulotlar;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'buzilib'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 480, { fill: C.card, col: C.red, p: k2 });
      hand("Taqqoslash: PostgreSQL vs MySQL", 1020, 280, { size: 28, color: C.red, p: k2 });

      card(1020, 330, 740, 165, { fill: '#fff', col: C.green, p: k2 });
      text("PostgreSQL da (Xavfsiz):", 1050, 375, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• ALTER TABLE mahsulotlar DROP COLUMN narx; buyrug'i DARHOL RAD ETILADI.", 1050, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• DETAIL: view faol_mahsulotlar depends on column narx. CASCADE so'raydi.", 1050, 460, { size: 17, color: C.soft, wrap: 680 });

      card(1020, 515, 740, 160, { fill: '#fff', col: C.red, p: k2 });
      text("MySQL da (Tuzoq!):", 1050, 560, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• DROP COLUMN so'roviga jimgina ruxsat beradi!", 1050, 605, { size: 18, color: C.ink, wrap: 680 });
      text("• Natijada view yaroqsiz holatga keladi va keyingi SELECT da xato portlaydi.", 1050, 645, { size: 17, color: C.red, wrap: 680 });
    });

    const kDesc = P(t, W('L3', 'qoladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Ogohlantirish:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("MySQL da jadvallardan ustun o'chirishdan oldin, loyihadagi qaysi view'lar shu ustunga tayanayotganini dasturchi o'zi qo'lda tekshirishi shart!", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 4. MYSQL FAKE MATVIEW
  function sMysqlFakeMatview(t) {
    heading("MySQL Community: Materialized View Yo‘qligi", t, TM.scenes.mysql_fake_matview.s);

    const k1 = P(t, W('L4', 'Community'), 0.5);
    withA(k1, () => {
      const outFake = [
        "faol   soni",
        "1      2    /* Qator darhol ko'rindi! Saqlanmagan */",
        "",
        "ERROR 1064 (42000): You have an error in your SQL syntax;",
        "near 'REFRESH MATERIALIZED VIEW mv'"
      ];
      term(120, 220, 820, 480, "MySQL da 'Materialized' Sinovi", [{
        b: {
          cmd: "CREATE TABLE m (id INT PRIMARY KEY, faol BOOLEAN);\nINSERT INTO m VALUES (1, TRUE);\nCREATE MATERIALIZED VIEW mv AS\n    SELECT faol, COUNT(*) AS soni FROM m GROUP BY faol;\nINSERT INTO m VALUES (2, TRUE);\nSELECT * FROM mv;\nREFRESH MATERIALIZED VIEW mv;",
          out: outFake
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'oddiy'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 480, { fill: C.card, col: C.orange, p: k2 });
      hand("Nima Uchun Bunday Bo'ldi?", 1020, 280, { size: 28, color: C.orange, p: k2 });

      card(1020, 330, 740, 165, { fill: '#fff', col: C.blue, p: k2 });
      text("Faqat HeatWave Imkoniyati:", 1050, 375, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• MySQL hujjatiga ko'ra Materialized View faqat MySQL HeatWave bulutli xizmatida mavjud.", 1050, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• Oddiy MySQL Community bu sintaksisni parserdan o'tkazadi, lekin oddiy view kabi ishlatadi.", 1050, 460, { size: 17, color: C.soft, wrap: 680 });

      card(1020, 515, 740, 160, { fill: '#fff', col: C.orange, p: k2 });
      text("REFRESH Buyrug'i Mavjud Emas:", 1050, 560, { size: 20, weight: 700, color: C.orange, wrap: 680 });
      text("• Community serverida REFRESH MATERIALIZED VIEW buyrug'i umuman yo'q.", 1050, 605, { size: 18, color: C.ink, wrap: 680 });
      text("• Shuning uchun MySQL da og'ir keshlar uchun alohida jadval va Cron ishlatiladi.", 1050, 645, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L4', 'beradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Yechim:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Agar MySQL da kesh jadvali kerak bo'lsa, CREATE TABLE hisobot AS SELECT ... qilinadi va kerak paytda TRUNCATE hamda INSERT INTO hisobot SELECT ... bilan yangilab turiladi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. SQLITE VIEWS
  function sSqliteViews(t) {
    heading("SQLite: Faqat O‘qish va INSTEAD OF Trigger", t, TM.scenes.sqlite_views.s);

    const k1 = P(t, W('L5', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      const outSqlite = [
        "1. UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;",
        "Parse error: cannot modify faol_mahsulotlar because it is a view",
        "",
        "2. CREATE TRIGGER faol_narx INSTEAD OF UPDATE ...",
        "UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;",
        "1|Non|4500|1 /* Muvaffaqiyatli yangilandi! */",
        "",
        "3. CREATE MATERIALIZED VIEW x AS SELECT 1;",
        "Parse error: near \"MATERIALIZED\": syntax error"
      ];
      term(120, 220, 820, 480, "SQLite 3.54: View va Trigger Sinovi", [{
        b: {
          cmd: "CREATE VIEW faol_mahsulotlar AS\n    SELECT id, nom, narx FROM mahsulotlar WHERE faol = 1;\nUPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;\nCREATE TRIGGER faol_narx INSTEAD OF UPDATE OF narx ON faol_mahsulotlar\nBEGIN\n    UPDATE mahsulotlar SET narx = NEW.narx WHERE id = OLD.id;\nEND;\nUPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;\nSELECT * FROM mahsulotlar WHERE id = 1;",
          out: outSqlite
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L5', 'insted'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("INSTEAD OF Trigger Sehrlari", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 330, 740, 165, { fill: '#fff', col: C.red, p: k2 });
      text("Viewlar Qat'iy Faqat O'qish Uchun:", 1030, 375, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• SQLite avtomatik yangilanadigan viewlarni qo'llamaydi.", 1030, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• Har qanday to'g'ridan-to'g'ri UPDATE/INSERT/DELETE xato beradi.", 1030, 460, { size: 17, color: C.soft, wrap: 680 });

      card(1020, 515, 740, 160, { fill: '#fff', col: C.green, p: k2 });
      text("INSTEAD OF Trigger Qutqaradi:", 1030, 560, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• View ustiga INSTEAD OF trigger o'rnatilsa, baza view'ga yo'naltirilgan buyruqni tutib oladi.", 1030, 605, { size: 18, color: C.ink, wrap: 680 });
      text("• Va uning o'rniga asosiy jadvalga NEW va OLD qiymatlari bilan yozadi.", 1030, 645, { size: 17, color: C.green, weight: 700, wrap: 680 });
    });

    const kDesc = P(t, W('L5', 'mumkin.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.purple, p: kDesc });
      hand("Materialized View:", 160, 780, { size: 26, color: C.purple, p: kDesc });
      text("SQLite da Materialized View umuman yo'q. Agar tahliliy hisobot keshlanishi kerak bo'lsa, oddiy jadval ochib, ma'lumotni tranzaksiya ichida to'ldirish kerak.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
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
      text("• Updatable view: 1 ta jadval bo'lsa avtomatik ishlaydi.", 190, 380, { size: 19, weight: 700, color: C.blue, wrap: 380 });
      text("• WITH CHECK OPTION: to'liq qo'llab-quvvatlanadi.", 190, 445, { size: 18, color: C.ink, wrap: 380 });
      text("• Bog'liqlik: ustunni o'chirishga yo'l qo'ymaydi (CASCADE shart).", 190, 510, { size: 18, color: C.green, weight: 700, wrap: 380 });
      text("• Materialized view: to'liq bor, REFRESH CONCURRENTLY bilan.", 190, 580, { size: 18, color: C.soft, wrap: 380 });
    });

    const k2 = P(t, W('L6', 'May'), 0.5);
    withA(k2, () => {
      card(680, 230, 540, 680, { fill: C.card, col: C.orange, p: k2 });
      hand("MySQL", 720, 290, { size: 30, color: C.orange, p: k2 });
      card(720, 330, 460, 540, { fill: '#fff', col: C.orange, p: k2 });
      text("• Updatable view: 1:1 qator mosligi bo'lsa yangilanadi.", 750, 380, { size: 19, weight: 700, color: C.orange, wrap: 400 });
      text("• WITH CHECK OPTION: sukut bo'yicha CASCADED rejimida.", 750, 445, { size: 18, color: C.ink, wrap: 400 });
      text("• Bog'liqlik: ustun o'chsa ham xato bermaydi, view buziladi!", 750, 510, { size: 18, color: C.red, weight: 700, wrap: 400 });
      text("• Materialized view: Community da yo'q (faqat HeatWave).", 750, 580, { size: 18, color: C.soft, wrap: 400 });
    });

    const k3 = P(t, W('L6', 'Es-kyu-layt'), 0.5);
    withA(k3, () => {
      card(1260, 230, 540, 680, { fill: C.card, col: C.purple, p: k3 });
      hand("SQLite", 1300, 290, { size: 30, color: C.purple, p: k3 });
      card(1300, 330, 460, 540, { fill: '#fff', col: C.purple, p: k3 });
      text("• Updatable view: avtomatik yo'q, faqat o'qish (read-only).", 1330, 380, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• INSTEAD OF trigger: view orqali yozish imkonini yaratadi.", 1330, 445, { size: 18, color: C.green, weight: 700, wrap: 400 });
      text("• WITH CHECK OPTION: mavjud emas.", 1330, 510, { size: 18, color: C.soft, wrap: 400 });
      text("• Materialized view: mavjud emas (oddiy jadval kesh).", 1330, 580, { size: 18, color: C.ink, wrap: 400 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_views.s) sIntro(t);
    else if (t < S.mysql_broken_views.s) sMysqlViews(t);
    else if (t < S.mysql_fake_matview.s) sMysqlBrokenViews(t);
    else if (t < S.sqlite_views.s) sMysqlFakeMatview(t);
    else if (t < S.xulosa.s) sSqliteViews(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.mysql_broken_views.s + 5.0;
    frame(t);
  };
})();
