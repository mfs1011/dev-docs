// SQL 17-bob 2-qism: "Kod" — PostgreSQL 18 da View va Materialized View Amaliyoti
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
    hand("17-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: View Amaliyoti", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Updatable View, WITH CHECK OPTION, GROUP BY Cheklovi va REFRESH", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres'), 0.8);
    withA(kBadges, () => {
      pill("1. UPDATABLE VIEW", 360, 540, C.blue, kBadges, 20);
      pill("2. WITH CHECK OPTION", 780, 540, C.purple, kBadges, 20);
      pill("3. GROUP BY XATOLIGI", 1200, 540, C.red, kBadges, 20);
      pill("4. MATERIALIZED REFRESH", 1600, 540, C.green, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'vyu'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("View orqali asosiy jadvalga INSERT va UPDATE qilish mexanizmi,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("WITH CHECK OPTION himoyasi hamda Materialized View'ni CONCURRENTLY yangilashni sinovdan o'tkazamiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. UPDATABLE VIEW
  function sUpdatableView(t) {
    heading("Yangilanadigan View Orqali Yozish", t, TM.scenes.updatable_view.s);

    const k1 = P(t, W('L2', 'Faol_mahsulotlar'), 0.5);
    withA(k1, () => {
      const out1 = [
        "UPDATE 1",
        "INSERT 0 1",
        " id |    nom    | narx  | faol ",
        "----+-----------+-------+------",
        "  1 | Non       |  4500 | t",
        "  2 | Sut       | 12000 | t",
        "  3 | Eski choy |  9000 | f",
        "  4 | Tuz       |  2000 | t",
        "(4 rows)"
      ];
      term(120, 220, 840, 480, "View Orqali INSERT va UPDATE", [{
        b: {
          cmd: "CREATE VIEW faol_mahsulotlar AS\n    SELECT id, nom, narx FROM mahsulotlar WHERE faol;\nUPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;\nINSERT INTO faol_mahsulotlar VALUES (4, 'Tuz', 2000);\nSELECT * FROM mahsulotlar ORDER BY id;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L2', 'to‘g‘ridan-to‘g‘ri'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Tahlil: Asosiy Jadvalga Ta'siri", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Asosiy Jadval O'zgardi:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Non mahsulotining narxi 4000 dan 4500 ga yangilandi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Yangi Tuz mahsuloti to'g'ridan-to'g'ri mahsulotlar jadvaliga qo'shildi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. Ko'rsatilmagan Ustunlar:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• faol ustuni view so'rovida qatnashmadi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Baza unga jadvaldagi sukut bo'yicha qiymatni (DEFAULT true) avtomatik berdi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'qiymat'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim Xulosa:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("PostgreSQL 9.3 dan boshlab bitta jadval ustiga qurilgan oddiy view'lar avtomatik yangilanadigan (updatable) hisoblanadi va hech qanday qo'shimcha trigger talab qilmaydi.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 3. CHECK OPTION
  function sCheckOption(t) {
    heading("WITH CHECK OPTION Xavfsizligi", t, TM.scenes.check_option.s);

    const k1 = P(t, W('L3', 'Arzonlar'), 0.5);
    withA(k1, () => {
      const errOut = [
        "INSERT 0 1",
        "ERROR: new row violates check option for view \"arzonlar\"",
        "DETAIL: Failing row contains (6, Go'sht, 90000, t)."
      ];
      term(120, 220, 840, 480, "CHECK OPTION Xatolik Sinovi", [{
        b: {
          cmd: "CREATE VIEW arzonlar AS\n    SELECT id, nom, narx FROM mahsulotlar\n    WHERE narx < 5000\n    WITH CHECK OPTION;\nINSERT INTO arzonlar VALUES (5, 'Shakar', 3000);\nINSERT INTO arzonlar VALUES (6, 'Go''sht', 90000);",
          out: errOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'chek'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("Nega Rad Etildi?", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("Chegara Buzilishi:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• View sharti: WHERE narx < 5000", 1070, 420, { size: 19, fam: MONO, color: C.ink, wrap: 660 });
      text("• Kiritilayotgan qator: Go'sht narxi 90,000 > 5000", 1070, 460, { size: 18, color: C.red, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("WITH CHECK OPTION Kafolati:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• View orqali faqat shu view'da ko'rinadigan qatorlarni yozish mumkin.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Shuningdek UPDATE narx = 99999 qilish ham qat'iy bloklanadi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'rad'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Arxitektura Qoidasi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Agar view ko'p ijarachili (multi-tenant) tizimda alohida mijoz ma'lumotlarini ajratib ko'rsatish uchun ishlatilsa, WITH CHECK OPTION begona mijoz ma'lumotlarini kiritishdan saqlovchi mustahkam qalqondir.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. NOT UPDATABLE
  function sNotUpdatable(t) {
    heading("GROUP BY va Yangilanmaydigan Viewlar", t, TM.scenes.not_updatable.s);

    const k1 = P(t, W('L4', 'Statistika'), 0.5);
    withA(k1, () => {
      const errOut = [
        " faol | soni | ortacha ",
        "------+------+---------",
        " f    |    1 | 9000.00",
        " t    |    3 | 6166.67",
        "(2 rows)",
        "",
        "ERROR: cannot update view \"statistika\"",
        "DETAIL: Views containing GROUP BY are not automatically updatable."
      ];
      term(120, 220, 840, 480, "Agregatli View da UPDATE Xatoligi", [{
        b: {
          cmd: "CREATE VIEW statistika AS\n    SELECT faol, count(*) AS soni, avg(narx) AS ortacha\n    FROM mahsulotlar GROUP BY faol;\nSELECT * FROM statistika ORDER BY faol;\nUPDATE statistika SET soni = 0;",
          out: errOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'agregatsiyasi'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.red, p: k2 });
      hand("Nega Agregatli View Yangilanmaydi?", 1040, 280, { size: 28, color: C.red, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("Noaniqlik Muammosi (Ambiguity):", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• soni = 3 bo'lgan guruhda soni = 0 qilib o'zgartirilsa, asosiy jadvaldagi aynan qaysi qatorlar o'chishi yoki o'zgarishi kerak?", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Baza buni mantiqan mustaqil hal qila olmaydi.", 1070, 465, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("Yechim Kerak Bo'lsa:", 1070, 555, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• Bunday murakkab holatlarda INSTEAD OF trigger yoki ON UPDATE DO INSTEAD qoidalari yoziladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Dasturchi o'zi xatti-harakat logikasini belgilab beradi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'xatolik'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Eslab Qoling:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("GROUP BY, DISTINCT, HAVING, UNION yoki hisoblangan maydonlari bor viewlar PostgreSQL'da faqat o'qish (read-only) rejimida ishlaydi.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 5. MATERIALIZED REFRESH
  function sMaterializedRefresh(t) {
    heading("Materialized View va REFRESH CONCURRENTLY", t, TM.scenes.materialized_refresh.s);

    const k1 = P(t, W('L5', 'Narx_hisoboti'), 0.5);
    withA(k1, () => {
      const outMat = [
        "/* 1. Yangi Guruch qo'shildi, lekin viewda eski natija */",
        "eski_natija  | f    | 1 |  9000",
        "eski_natija  | t    | 2 | 16500",
        "",
        "/* 2. REFRESH dan keyin natija yangilandi */",
        "yangi_natija | f    | 1 |  9000",
        "yangi_natija | t    | 3 | 31500"
      ];
      term(120, 220, 840, 480, "REFRESH Natijalari", [{
        b: {
          cmd: "CREATE MATERIALIZED VIEW narx_hisoboti AS\n    SELECT faol, count(*) AS soni, sum(narx) AS jami\n    FROM mahsulotlar GROUP BY faol;\nINSERT INTO mahsulotlar VALUES (7, 'Guruch', 15000, true);\nSELECT 'eski_natija', * FROM narx_hisoboti;\nREFRESH MATERIALIZED VIEW narx_hisoboti;\nSELECT 'yangi_natija', * FROM narx_hisoboti;",
          out: outMat
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'refresh,'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("CONCURRENTLY va UNIQUE Indeks", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("Indekssiz Xato Beradi:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;", 1070, 415, { size: 17, fam: MONO, color: C.ink, wrap: 660 });
      text("• ERROR: cannot refresh materialized view concurrently (HINT: Create a unique index with no WHERE clause).", 1070, 455, { size: 17, color: C.red, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("To'g'ri Ketma-ketlik:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("1. CREATE UNIQUE INDEX ON narx_hisoboti (faol);", 1070, 600, { size: 18, fam: MONO, color: C.blue, wrap: 660 });
      text("2. REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;", 1070, 640, { size: 18, fam: MONO, color: C.green, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'ishlatiladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Foydasi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("CONCURRENTLY rejimi yangilanish vaqtida o'qish so'rovlarini aslo to'xtatmaydi (Exclusive lock qo'ymaydi). Foydalanuvchilar hisobotlarni uzilishlarsiz o'qishda davom etadi.", 160, 835, { size: 21, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL Amaliyoti", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Oddiy'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 320, { fill: C.card, col: C.blue, p: k1 });
      hand("1. Oddiy Updatable View", 180, 290, { size: 26, color: C.blue, p: k1 });
      text("• Bitta jadvalga tayangan sodda viewlar orqali to'g'ridan-to'g'ri INSERT va UPDATE qilish mumkin.", 180, 345, { size: 19, color: C.ink, wrap: 700 });
      text("• Asosiy jadvaldagi o'zgarishlar darhol view'da aks etadi.", 180, 400, { size: 19, color: C.soft, wrap: 700 });
      text("• Ko'rsatilmagan ustunlar sukut bo'yicha qiymat oladi.", 180, 450, { size: 19, color: C.ink, wrap: 700 });
    });

    const k2 = P(t, W('L6', 'chek'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 320, { fill: C.card, col: C.purple, p: k2 });
      hand("2. WITH CHECK OPTION", 1020, 290, { size: 26, color: C.purple, p: k2 });
      text("• Filtrlangan view orqali noto'g'ri qator kiritishning oldini oladi.", 1020, 345, { size: 19, color: C.ink, wrap: 720 });
      text("• Qator view chegarasidan chiqib ketishiga yo'l qo'ymaydi.", 1020, 400, { size: 19, color: C.soft, wrap: 720 });
      text("• Xavfsiz ko'p ijarachili tizimlarning asosi.", 1020, 450, { size: 19, color: C.green, weight: 700, wrap: 720 });
    });

    const k3 = P(t, W('L6', 'og‘ir'), 0.5);
    withA(k3, () => {
      card(140, 580, 780, 330, { fill: C.card, col: C.red, p: k3 });
      hand("3. Yangilanmaydigan Viewlar", 180, 640, { size: 26, color: C.red, p: k3 });
      text("• GROUP BY, DISTINCT, UNION va agregatlar view'ni faqat o'qishga aylantiradi.", 180, 695, { size: 19, color: C.ink, wrap: 700 });
      text("• Baza noaniqlik sababli UPDATE yoki INSERT ni qat'iy rad etadi.", 180, 750, { size: 19, color: C.soft, wrap: 700 });
      text("• Yechim: INSTEAD OF triggerlar yaratish.", 180, 800, { size: 19, color: C.purple, wrap: 700 });
    });

    const k4 = P(t, W('L6', 'yunik'), 0.5);
    withA(k4, () => {
      card(980, 580, 800, 330, { fill: C.card, col: C.green, p: k4 });
      hand("4. Materialized View Strategiyasi", 1020, 640, { size: 26, color: C.green, p: k4 });
      text("• Natijani diskda saqlab, ultra-tezkor o'qishni ta'minlaydi.", 1020, 695, { size: 19, color: C.ink, wrap: 720 });
      text("• Asosiy jadval o'zgarganda REFRESH bilan yangilanadi.", 1020, 750, { size: 19, color: C.soft, wrap: 720 });
      text("• UNIQUE indeks bilan REFRESH CONCURRENTLY qilsangiz, o'qish to'xtamaydi.", 1020, 805, { size: 19, color: C.green, weight: 700, wrap: 720 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.updatable_view.s) sIntro(t);
    else if (t < S.check_option.s) sUpdatableView(t);
    else if (t < S.not_updatable.s) sCheckOption(t);
    else if (t < S.materialized_refresh.s) sNotUpdatable(t);
    else if (t < S.xulosa.s) sMaterializedRefresh(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.check_option.s + 5.0;
    frame(t);
  };
})();
