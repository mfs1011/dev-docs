// SQL 14-bob 2-qism: "Kod" — PostgreSQL 18 da Cheklovlar amaliyoti
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
    hand("14-bob. Kod", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Cheklovlar Amaliyoti", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CHECK Xatolari, NULL O'tishi, CASCADE va DEFERRABLE Sinovlari", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(380, 430, 1160 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'terminalida'), 0.8);
    withA(kBadges, () => {
      pill("1. CHECK: musbat_narx & NULL", 400, 580, C.blue, kBadges, 21);
      pill("2. UNIQUE: NULLS NOT DISTINCT", 840, 580, C.purple, kBadges, 21);
      pill("3. FOREIGN KEY: CASCADE / RESTRICT", 1300, 580, C.green, kBadges, 21);
      pill("4. DEFERRABLE", 1640, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'kaskadlari'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("CHECK cheklovi manfiy qiymatlarni qanday to'xtatishi, NULL nima uchun jimgina o'tib ketishi,", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("CASCADE orqali bog'liq qatorlar tozalanishi va aylana kalitlarni kechiktirib tekshirishni ko'ramiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. CHECK DEMO
  function sCheckDemo(t) {
    heading("CHECK Xatolari va NULL Qabul Qilinishi", t, TM.scenes.check_demo.s);

    const k1 = P(t, W('L2', 'musbat_narx'), 0.5);
    withA(k1, () => {
      const checkOut = TTY.check_err ? TTY.check_err.split('\n') : [
        "DROP TABLE",
        "CREATE TABLE",
        "INSERT 0 1",
        "ERROR:  new row for relation \"mahsulotlar\" violates check constraint \"musbat_narx\"",
        "DETAIL:  Failing row contains (2, Sut, -5, null, SUT-1)."
      ];
      term(140, 220, 800, 450, "1. musbat_narx CHECK xatosi", [{
        b: {
          cmd: "INSERT INTO mahsulotlar VALUES (2, 'Sut', -5, NULL, 'SUT-1');",
          out: checkOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L3', 'bermaydi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.red, p: k2 });
      hand("Nega NULL O'tib Ketdi?", 1020, 280, { size: 28, color: C.red, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("INSERT INTO mahsulotlar VALUES (4, 'Tuz', NULL, NULL, NULL);", 1050, 365, { size: 17, fam: MONO, weight: 700, color: C.ink, wrap: 660 });
      text("Natija: INSERT 0 1 (Qator qabul qilindi!)", 1050, 410, { size: 19, weight: 700, color: C.green, wrap: 660 });
      text("Sababi: (NULL > 0) mantiqiy ifodasi NULL qaytaradi, FALSE emas!", 1050, 455, { size: 18, color: C.red, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("Oltin Qoida: NOT NULL Alohida Shart!", 1050, 545, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("CHECK faqat aniq FALSE bo'lgandagina xato beradi. Agar ustunga qiymat kiritilishi majburiy bo'lsa, albatta NOT NULL yozilishi shart!", 1050, 595, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'ko‘rsatadi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Jadval Darajasidagi CHECK (narx > chegirma):", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Agar chegirma narxdan katta bo'lsa (masalan narx=9000, chegirma=9500), tizim 'mahsulotlar_check' xatosini qaytaradi. Bu bir nechta ustunlararo munosabatni ishonchli ta'minlaydi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. UNIQUE DEMO
  function sUniqueDemo(t) {
    heading("UNIQUE va NULLS NOT DISTINCT Sinovi", t, TM.scenes.unique_demo.s);

    const k1 = P(t, W('L4', 'distinkt'), 0.5);
    withA(k1, () => {
      const uniqOut = TTY.unique_nulls ? TTY.unique_nulls.split('\n') : [
        "DROP TABLE",
        "CREATE TABLE",
        "INSERT 0 1",
        "ERROR:  duplicate key value violates unique constraint \"t_unique_kod_key\"",
        "DETAIL:  Key (kod)=(null) already exists."
      ];
      term(140, 220, 800, 450, "UNIQUE NULLS NOT DISTINCT Sinovi", [{
        b: {
          cmd: "CREATE TABLE t_unique (kod text UNIQUE NULLS NOT DISTINCT);\nINSERT INTO t_unique VALUES (NULL); -- 1-marta o'tdi\nINSERT INTO t_unique VALUES (NULL); -- 2-marta XATO!",
          out: uniqOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L4', 'etiladi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("NULL va UNIQUE Nozikliklari:", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.soft, p: k2 });
      text("1. Odatiy UNIQUE xatti-harakati:", 1050, 365, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Standartga ko'ra ikkita NULL teng hisoblanmaydi.", 1050, 410, { size: 19, color: C.ink, wrap: 660 });
      text("• Natijada odatiy UNIQUE ustunga istalgancha NULL yozish mumkin.", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("2. PostgreSQL 15+ Yangiligi:", 1050, 545, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• 'NULLS NOT DISTINCT' qo'shilsa, NULL lar ham yagona qiymat sifatida qaraladi va ikkinchi NULL da xato beradi!", 1050, 590, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'takror'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Xulosa: Biznes Talabiga Qarab Tanlang", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Agar maydon ixtiyoriy bo'lsa (masalan pasport seriyasi faqat borlarga), odatiy UNIQUE yetarli. Agar NULL ham faqat bitta qatorda bo'lishi shart bo'lsa, NULLS NOT DISTINCT tanlanadi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. FK DEMO
  function sFkDemo(t) {
    heading("FOREIGN KEY: CASCADE va RESTRICT Sinovi", t, TM.scenes.fk_demo.s);

    const k1 = P(t, W('L5', 'kaskad'), 0.5);
    withA(k1, () => {
      const fkOut = [
        "DELETE 1 (ota id=1 o'chirildi)",
        "SELECT * FROM bola_cascade; -> (0 rows) [Avtomatik o'chdi!]",
        "DELETE FROM ota WHERE id = 2;",
        "ERROR: update or delete on table \"ota\" violates RESTRICT setting of foreign key constraint",
        "DETAIL: Key (id)=(2) is referenced from table \"bola_restrict\"."
      ];
      term(140, 220, 800, 450, "FOREIGN KEY: CASCADE va RESTRICT", [{
        b: {
          cmd: "DELETE FROM ota WHERE id = 1; -- CASCADE orqali bolasi ham ketadi\nDELETE FROM ota WHERE id = 2; -- RESTRICT taqiqlaydi!",
          out: fkOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'taqiqlaydi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.green, p: k2 });
      hand("Harakatlar Mohiyati:", 1020, 280, { size: 28, color: C.green, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.soft, p: k2 });
      text("1. ON DELETE CASCADE (Kaskadli Tozalash):", 1050, 365, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• Ota qator o'chirilishi bilan unga bog'langan bola qatorlar ham birga o'chib ketadi.", 1050, 410, { size: 19, color: C.ink, wrap: 660 });
      text("• Masalan: Buyurtma o'chirilsa, uning qatorlari ham o'chishi to'g'ri.", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("2. ON DELETE RESTRICT (Qat'iy Himoya):", 1050, 545, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• Bolasi bor ota qatorni o'chirishga ruxsat bermaydi va ERROR qaytaradi.", 1050, 590, { size: 18, color: C.ink, wrap: 660 });
      text("• Masalan: Mahsulot buyurtmalarda mavjud bo'lsa, uni o'chirish taqiqlanadi.", 1050, 630, { size: 17, color: C.red, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'sinovida'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Tashqi Kalit va Unumdorlik:", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Ota qator o'chirilganda bola jadvalda qidiruv bo'ladi. Agar bola ustunga (ota_id) indeks yaratilmagan bo'lsa, butun bola jadvali to'liq skan (Seq Scan) qilinadi. Shuning uchun tashqi kalitlarga doimo indeks qo'ying!", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 5. DEFERRABLE DEMO
  function sDeferrableDemo(t) {
    heading("DEFERRABLE Bilan Aylana Bog'lanish", t, TM.scenes.deferrable_demo.s);

    const k1 = P(t, W('L6', 'kechiktiriladi'), 0.5);
    withA(k1, () => {
      const defOut = TTY.deferrable_demo ? TTY.deferrable_demo.split('\n') : [
        "DROP TABLE",
        "CREATE TABLE",
        "BEGIN",
        "INSERT 0 1",
        "INSERT 0 1",
        "COMMIT",
        " id | keyingi ",
        "----+---------",
        "  1 |       2",
        "  2 |       1",
        "(2 rows)"
      ];
      term(140, 220, 800, 450, "DEFERRABLE INITIALLY DEFERRED", [{
        b: {
          cmd: "BEGIN;\nINSERT INTO aylana VALUES (1, 2); -- 2 hali bazada yo'q!\nINSERT INTO aylana VALUES (2, 1); -- endi 2 qo'shildi\nCOMMIT; -- tekshiruv muvaffaqiyatli!",
          out: defOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L6', 'saqlanadi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.blue, p: k2 });
      hand("Kechiktirish Qanday Ishlaydi?", 1020, 280, { size: 28, color: C.blue, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.soft, p: k2 });
      text("Odatiy Cheklov Bo'lsa Nima Bo'lardi?", 1050, 365, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• (1, 2) yozilgan paytda 2-qator hali mavjud bo'lmagani uchun darhol ERROR berib to'xtardi.", 1050, 410, { size: 19, color: C.ink, wrap: 660 });
      text("• Ikkala qatorni ham qo'shib bo'lmasdi (tovuq va tuxum muammosi).", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("DEFERRABLE Yechimi:", 1050, 545, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• Tekshiruv tranzaksiya oxiriga (COMMIT ga) qoldiriladi.", 1050, 590, { size: 18, color: C.ink, wrap: 660 });
      text("• COMMIT vaqtida 1 ham, 2 ham mavjud bo'lgani sababli cheklov to'liq qanoatlantiriladi!", 1050, 630, { size: 17, weight: 700, color: C.green, wrap: 660 });
    });

    const kDesc = P(t, W('L6', 'bog‘liqlikda'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Eslatma: Hamma Cheklov Ham Kechiktirilmaydi!", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Faqat UNIQUE, PRIMARY KEY, EXCLUDE va REFERENCES (tashqi kalit) cheklovlari DEFERRABLE bo'lishi mumkin. CHECK va NOT NULL har doim darhol tekshiriladi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L7', 'kafolatlay'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "CHECK da NULL dan Saqlaning",
          desc: "CHECK NULL da xato bermaydi. Shuning uchun CHECK bilan birga doimo NOT NULL qo'shing.",
          col: C.blue
        },
        {
          num: "2",
          title: "NULLS NOT DISTINCT",
          desc: "Agar UNIQUE ustunda NULL lar ham takrorlanmasligi shart bo'lsa, PostgreSQL 15+ sintaksisidan foydalaning.",
          col: C.green
        },
        {
          num: "3",
          title: "FOREIGN KEY Indekslari",
          desc: "ON DELETE amallari sekinlashib ketmasligi uchun bola ustunlarga har doim B-tree indeks yarating.",
          col: C.purple
        },
        {
          num: "4",
          title: "DEFERRABLE Qulayligi",
          desc: "Aylana bog'liqliklar yoki ommaviy ko'chirishlarda cheklovni COMMIT gacha kechiktiring.",
          col: C.orange
        }
      ];

      items.forEach((it, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const x = 140 + colIdx * 840;
        const y = 220 + rowIdx * 350;

        card(x, y, 800, 310, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, y + 55, it.col, k, 24);
        hand(it.title, x + 90, y + 62, { size: 26, color: it.col, p: k });

        card(x + 40, y + 105, 720, 175, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 65, y + 160, { size: 21, color: C.ink, wrap: 670 });
      });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.check_demo.s) sIntro(t);
    else if (t < S.unique_demo.s) sCheckDemo(t);
    else if (t < S.fk_demo.s) sUniqueDemo(t);
    else if (t < S.deferrable_demo.s) sFkDemo(t);
    else if (t < S.xulosa.s) sDeferrableDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 2-sahna (CHECK Demo) bo'yicha chiroyli poster kadri
    const t = TM.scenes.check_demo.s + 6.0;
    frame(t);
  };
})();
