// SQL 18-bob 2-qism: "Kod" — PostgreSQL 18 da DML Amaliyoti
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
    hand("18-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: DML Amaliyoti", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("INSERT Ko'rinishlari, UPDATE FROM, Tuzoqlar va DELETE USING", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres'), 0.8);
    withA(kBadges, () => {
      pill("1. INSERT USULLARI", 360, 540, C.blue, kBadges, 20);
      pill("2. UPDATE & WHERE SHARTI", 780, 540, C.green, kBadges, 20);
      pill("3. UPDATE FROM SUBQUERY", 1200, 540, C.purple, kBadges, 20);
      pill("4. DELETE USING AMALI", 1600, 540, C.red, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'insert'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Ustunlarni sanash va chapdan to'ldirish orqali INSERT qilish,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("Boshqa jadvalga qarab xavfsiz UPDATE FROM qilish va noaniq birlashuv xavflarini sinab ko'ramiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. INSERT DEMO
  function sInsertDemo(t) {
    heading("INSERT Ko‘rinishlari va Sukut Bo‘yicha Qiymatlar", t, TM.scenes.insert_demo.s);

    const k1 = P(t, W('L2', 'Ombor'), 0.5);
    withA(k1, () => {
      const out1 = [
        "INSERT 0 1",
        "INSERT 0 1",
        "INSERT 0 1",
        "INSERT 0 2",
        " mahsulot_id |  nom   | soni | narx  ",
        "-------------+--------+------+-------",
        "           1 | Non    |  100 |  4000",
        "           2 | Sut    |    0 |     0",
        "           3 | Choy   |    0 |     0",
        "           4 | Tuz    |   50 |  2000",
        "           5 | Shakar |   80 | 11000",
        "(5 rows)"
      ];
      term(120, 220, 840, 480, "INSERT Buyruqlari", [{
        b: {
          cmd: "INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (1, 'Non', 100, 4000);\nINSERT INTO ombor (nom, mahsulot_id) VALUES ('Sut', 2);\nINSERT INTO ombor VALUES (3, 'Choy');\nINSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (4, 'Tuz', 50, 2000), (5, 'Shakar', 80, 11000);\nSELECT * FROM ombor ORDER BY mahsulot_id;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'chapdan'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Tahlil: Qatorlarning To'ldirilishi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Ustunlar Tartibi O'zgarsa Ham:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• (nom, mahsulot_id) ko'rinishida berilgan Sut to'g'ri maydonlarga tushdi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Berilmagan soni va narx ustunlari sukut bo'yicha 0 qiymatini oldi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. VALUES (3, 'Choy') — Chapdan To'ldirish:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• Ustunlar ko'rsatilmasa, qiymatlar chapdan boshlab joylashtiriladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Bu PostgreSQL ning maxsus kengaytmasi hisoblanadi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'nol'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim Qoida:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("INSERT 0 2 javobidagi oxirgi son qo'shilgan qatorlar sonini bildiradi. Bir nechta qatorni bitta INSERT buyrug'i bilan yuborish tarmoq yuklamasini keskin kamaytiradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. UPDATE SIMPLE
  function sUpdateSimple(t) {
    heading("UPDATE va Mavjud Bo‘lmagan Qatorlar", t, TM.scenes.update_simple.s);

    const k1 = P(t, W('L3', 'Narxlarni'), 0.5);
    withA(k1, () => {
      const out2 = [
        "UPDATE 3   /* 3 ta mahsulot narxi 10% ga oshdi */",
        "UPDATE 0   /* 42-mahsulot topilmadi, lekin xato yo'q! */",
        "",
        " mahsulot_id |  nom   | soni |   narx   ",
        "-------------+--------+------+----------",
        "           1 | Non    |  100 |  4400.00",
        "           4 | Tuz    |   50 |  2200.00",
        "           5 | Shakar |   80 | 12100.00"
      ];
      term(120, 220, 840, 480, "UPDATE Buyruqlari Sinovi", [{
        b: {
          cmd: "UPDATE ombor SET narx = narx * 1.10 WHERE narx > 0;\nUPDATE ombor SET soni = 999, narx = 1 WHERE mahsulot_id = 42;\nSELECT mahsulot_id, nom, soni, narx FROM ombor WHERE narx > 0 ORDER BY mahsulot_id;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'ver'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("UPDATE Mexanizmi Tahlili", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. SET Ifodalari (Expressions):", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• SET narx = narx * 1.10 har bir qatorning o'z eski narxiga tayanadi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• SET dagi '=' qiymat berish, WHERE dagi esa tenglikni solishtirishdir.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. UPDATE 0 — Oddiy Holat:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• 42-mahsulot omborda yo'q, shuning uchun 0 ta qator o'zgardi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• SQL da shartga mos qator topilmasligi hech qachon xato hisoblanmaydi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'xato'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Eslatma:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ilova logikasida biron qator o'zgarishi shart bo'lsa, qaytgan sonni (UPDATE soni) dasturiy tekshirib, agar 0 bo'lsa 'Topilmadi' xatoligini chiqarish dasturchi zimmasidadir.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. UPDATE FROM
  function sUpdateFrom(t) {
    heading("UPDATE FROM: Boshqa Jadval Bilan Yangilash", t, TM.scenes.update_from.s);

    const k1 = P(t, W('L4', 'Sotuvlar'), 0.5);
    withA(k1, () => {
      const out3 = [
        "UPDATE 3",
        " mahsulot_id |  nom   | soni |   narx   ",
        "-------------+--------+------+----------",
        "           1 | Non    |   85 |  4400.00",
        "           2 | Sut    |    0 |        0",
        "           3 | Choy   |    0 |        0",
        "           4 | Tuz    |   47 |  2200.00",
        "           5 | Shakar |   60 | 12100.00",
        "(5 rows)"
      ];
      term(120, 220, 840, 480, "UPDATE FROM Bajarilishi", [{
        b: {
          cmd: "UPDATE ombor o\nSET soni = o.soni - k.jami\nFROM (SELECT mahsulot_id, sum(soni) AS jami\n      FROM sotuvlar GROUP BY mahsulot_id) k\nWHERE o.mahsulot_id = k.mahsulot_id;\nSELECT * FROM ombor ORDER BY mahsulot_id;",
          out: out3
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'from'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("Hisob-Kitob Qanday Bajarildi?", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("1. Sotuvlar Avval Jamlandi (GROUP BY):", 1070, 375, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• Non (1-mahsulot) uchun ikkita sotuv bor edi: 10 ta va 5 ta. Jami = 15 ta.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Qoldiq: 100 - 15 = 85 ta qoldi.", 1070, 460, { size: 18, color: C.green, weight: 700, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Boshqa Tovarlar:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Tuz: 50 - 3 = 47 ta qoldi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Shakar: 80 - 20 = 60 ta qoldi.", 1070, 635, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'ayriladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Kuchli Imkoniyat:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("UPDATE FROM sintaksisi orqali boshqa jadvallardagi agregat natijalarni to'g'ridan-to'g'ri asosiy jadvalga bitta tranzaksiyaviy buyruqda o'tkazish mumkin.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. UPDATE PITFALL
  function sUpdatePitfall(t) {
    heading("Tuzoq: Birlashuvda Ixtiyoriy Qator Tanlanishi", t, TM.scenes.update_pitfall.s);

    const k1 = P(t, W('L5', 'Agar'), 0.5);
    withA(k1, () => {
      const outErr = [
        "UPDATE 2",
        " mahsulot_id | soni ",
        "-------------+------",
        "           1 |   10   /* 10 yoki 5 jimgina tanlandi! */",
        "           4 |    3",
        "(2 rows)"
      ];
      term(120, 220, 840, 480, "Noaniq Birlashuv Sinovi", [{
        b: {
          cmd: "BEGIN;\nUPDATE ombor o\nSET soni = s.soni\nFROM sotuvlar s\nWHERE o.mahsulot_id = s.mahsulot_id;\nSELECT mahsulot_id, soni FROM ombor\nWHERE mahsulot_id IN (1, 4) ORDER BY 1;\nROLLBACK;",
          out: outErr
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'ikkita'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.red, p: k2 });
      hand("Nima Uchun Bu Xavfli?", 1040, 280, { size: 28, color: C.red, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. Hech Qanday Xato Chiqmadi:", 1070, 375, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("• 1-mahsulotga 10 va 5 sonli ikkita sotuv mos kelgan edi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• PostgreSQL ulardan birini (10) jimgina tanladi va yangiladi.", 1070, 460, { size: 18, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.orange, p: k2 });
      text("2. Oldindan Aytib Bo'lmaydi (Non-deterministic):", 1070, 555, { size: 20, weight: 700, color: C.orange, wrap: 660 });
      text("• Indeks yoki so'rov plani o'zgarsa, keyingi safar 5 tanlanishi mumkin.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Bu ishlab chiqarishda hisobotlarning chalkashib ketishiga sabab bo'ladi.", 1070, 640, { size: 17, color: C.red, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'tanlanadi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Tavsiya:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("UPDATE FROM da hech qachon ko'p qatorli jadvalni to'g'ridan-to'g'ri ulamang. Har bir maqsad qatoriga aniq 1 ta qator mos kelishi uchun avval subquery bilan jamlang.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. DELETE USING XULOSA
  function sDeleteUsingXulosa(t) {
    heading("DELETE USING va Xulosa", t, TM.scenes.delete_using_xulosa.s);

    const k1 = P(t, W('L6', 'yuzing'), 0.5);
    withA(k1, () => {
      const out4 = [
        "DELETE 1",
        " id | mahsulot_id | soni ",
        "----+-------------+------",
        "  1 |           1 |   10",
        "  2 |           1 |    5",
        "  3 |           4 |    3",
        "(3 rows)"
      ];
      term(120, 220, 800, 480, "DELETE USING Bajarilishi", [{
        b: {
          cmd: "DELETE FROM sotuvlar s USING ombor o\nWHERE s.mahsulot_id = o.mahsulot_id AND o.nom = 'Shakar';\nSELECT * FROM sotuvlar ORDER BY id;",
          out: out4
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L6', 'di-em-el'), 0.5);
    withA(k2, () => {
      card(960, 220, 840, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("DML Amaliyoti Qoidalari", 1000, 280, { size: 28, color: C.blue, p: k2 });

      card(1000, 330, 760, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. DELETE USING Imkoniyati:", 1030, 375, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• Tashqi jadval atributlariga qarab o'chirishni osonlashtiradi.", 1030, 420, { size: 18, color: C.ink, wrap: 700 });
      text("• Shakar mahsulotiga tegishli barcha sotuvlar tozalandi.", 1030, 460, { size: 17, color: C.soft, wrap: 700 });

      card(1000, 510, 760, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. Kalit va Subquery Intizomi:", 1030, 555, { size: 20, weight: 700, color: C.green, wrap: 700 });
      text("• INSERT paytida ustunlarni sanang, UPDATE paytida kalit bo'yicha WHERE bering.", 1030, 600, { size: 18, color: C.ink, wrap: 700 });
      text("• Murakkab yangilashlarni doimo BEGIN va ROLLBACK bilan sinab oling.", 1030, 640, { size: 17, color: C.green, weight: 700, wrap: 700 });
    });

    const kDesc = P(t, W('L6', 'bajaring.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Yakuniy Xulosa:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("DML buyruqlari ma'lumotlar yaxlitligining yuragidir. Shartlarni to'g'ri qo'yish, jamlangan subquery'lardan foydalanish va tranzaksiyaviy xavfsizlikka amal qilish har bir SQL mutaxassisi uchun shartdir.", 180, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.insert_demo.s) sIntro(t);
    else if (t < S.update_simple.s) sInsertDemo(t);
    else if (t < S.update_from.s) sUpdateSimple(t);
    else if (t < S.update_pitfall.s) sUpdateFrom(t);
    else if (t < S.delete_using_xulosa.s) sUpdatePitfall(t);
    else sDeleteUsingXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.update_from.s + 5.0;
    frame(t);
  };
})();
