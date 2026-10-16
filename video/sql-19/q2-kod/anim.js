// SQL 19-bob 2-qism: "Kod" — PostgreSQL 18 da RETURNING Amaliyoti
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
    hand("19-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: RETURNING Amaliyoti", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Yangi ID, OLD va NEW Qiymatlari, DELETE va WITH CTE Arxivlash", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'ay-di'), 0.8);
    withA(kBadges, () => {
      pill("1. INSERT: YANGI ID OLISH", 360, 540, C.blue, kBadges, 20);
      pill("2. UPDATE: OLD VA NEW TAHLILI", 800, 540, C.green, kBadges, 20);
      pill("3. DELETE: O'CHIRILGAN NUSXA", 1220, 540, C.purple, kBadges, 20);
      pill("4. WITH CTE: ATOMAR ARXIV", 1600, 540, C.red, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'si-ti-i'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Generatsiya qilingan ID larni darhol qaytarib olish, PostgreSQL 18 dagi OLD va NEW sintaksisi,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("Hamda o'chirilgan qatorlarni bitta atomar operatsiyada arxiv jadvaliga ko'chirishni ko'ramiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. INSERT ID
  function sInsertId(t) {
    heading("INSERT RETURNING: Yangi ID va Ko'p Qatorlar", t, TM.scenes.insert_id.s);

    const k1 = P(t, W('L2', 'Mijozlar'), 0.5);
    withA(k1, () => {
      const out1 = [
        " id ",
        "----",
        "  1",
        "(1 row)",
        "INSERT 0 1",
        "",
        " id |  ism  | vaqt ",
        "----+-------+------",
        "  2 | Vali  | t",
        "  3 | Sobir | t",
        "(2 rows)",
        "INSERT 0 2"
      ];
      term(120, 220, 840, 480, "INSERT RETURNING Bajarilishi", [{
        b: {
          cmd: "-- 1. Bitta qator qo'shish va yangi ID ni olish:\nINSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;\n\n-- 2. Ko'p qatorli INSERT va hisoblangan ifodalar:\nINSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir')\nRETURNING id, ism, (yaratilgan IS NOT NULL) AS vaqt;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L2', 'avtomatik'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("Tahlil: Yangi ID Generatsiyasi", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Avtomatik ID Aniq Bog'lanishi:", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Har bir kiritilgan qator uchun baza o'zi bergan ID qaytadi (Ali -> 1).", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Ko'p qatorli INSERT da har bir yozuvga o'z ID si mos ravishda keladi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. Sukut Bo'yicha Qiymatlar va Ifodalar:", 1070, 555, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• yaratilgan timestamptz maydoni bazada now() bilan to'ldi va tekshirildi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• RETURNING da har qanday hisoblangan SQL ifodalarini qo'llash mumkin.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'qaytaradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Amaliy Foydasi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ilovangiz buyurtma yoki to'lov yaratishi bilan uning ID sini zudlik bilan biladi va qo'shimcha so'rov yubormasdan keyingi operatsiyalarni davom ettiradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. UPDATE OLD NEW
  function sUpdateOldNew(t) {
    heading("PostgreSQL 18: UPDATE RETURNING OLD va NEW", t, TM.scenes.update_old_new.s);

    const k1 = P(t, W('L3', 'Postgres'), 0.5);
    withA(k1, () => {
      const out2 = [
        " id | ism  | eski | yangi ",
        "----+------+------+-------",
        "  1 | Ali  |    0 | 50000",
        "  2 | Vali |    0 | 50000",
        "(2 rows)",
        "",
        "UPDATE 2"
      ];
      term(120, 220, 840, 480, "PostgreSQL 18 OLD / NEW", [{
        b: {
          cmd: "-- Balansni 50 000 ga oshirish va eski hamda yangi holatni olish:\nUPDATE mijozlar\nSET balans = balans + 50000\nWHERE ism IN ('Ali', 'Vali')\nRETURNING id, ism, old.balans AS eski, new.balans AS yangi;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L3', 'nyu'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("OLD va NEW Ning Inqilobiy Qulayligi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. Bir Vaqtning O'zida Ikkala Holat:", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• old.balans — o'zgartirishdan oldingi qiymat (0).", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• new.balans — hisoblashdan keyingi yangi qiymat (50000).", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Audit va Moliyaviy Loglar Uchun Ideal:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Ilova avvalgi qiymatni saqlab qolish uchun ortiqcha SELECT yozmaydi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• new.balans - old.balans ifodasi orqali to'g'ridan-to'g'ri delta olinadi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'ko‘rsatadi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Eski Versiyalardan Farqi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("PostgreSQL 17 va undan oldingi versiyalarda UPDATE RETURNING faqat yangi qiymatni ko'rsatardi. PostgreSQL 18 da qo'shilgan OLD va NEW dasturchilar ishini tubdan yengillashtirdi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. DELETE RETURNING
  function sDeleteReturning(t) {
    heading("DELETE RETURNING va Bo'sh Natija Holatlari", t, TM.scenes.delete_returning.s);

    const k1 = P(t, W('L4', 'Dilit'), 0.5);
    withA(k1, () => {
      const out3 = [
        " id |  ism  |          yaratilgan           | balans ",
        "----+-------+-------------------------------+--------",
        "  3 | Sobir | 2026-10-16 12:53:30.318949+05 |      0",
        "(1 row)",
        "DELETE 1",
        "",
        " id ",
        "----",
        "(0 rows)",
        "UPDATE 0"
      ];
      term(120, 220, 840, 480, "DELETE RETURNING Terminali", [{
        b: {
          cmd: "-- 1. O'chirilgan qatorning to'liq nusxasini olish:\nDELETE FROM mijozlar WHERE ism = 'Sobir' RETURNING *;\n\n-- 2. Shartga mos qator bo'lmasa nima bo'ladi?\nUPDATE mijozlar SET balans = 0 WHERE ism = 'Yoq' RETURNING id;",
          out: out3
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L4', 'topilmasa,'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("DELETE RETURNING Xususiyatlari", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("1. O'chirilgan Qator Nusxasi (RETURNING *):", 1070, 375, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• O'chirilgan barcha ustunlar: id, ism, sana va balans qaytarildi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Ilova ushbu ma'lumotni keshdan o'chirish yoki loglash uchun ishlatadi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. 0 Rows — Xato Emas:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Agar WHERE shartiga hech qanday qator to'g'ri kelmasa, buyruq xato bermaydi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Shunchaki (0 rows) natija qaytadi va UPDATE 0 bo'ladi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'qaytadi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Qoidalar:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("RETURNING har doim ta'sir ko'rsatilgan qatorlar soniga teng miqdorda javob satrlarini qaytaradi. Hech narsa o'zgarmasa, javob ham bo'sh bo'ladi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. CTE ARCHIVE
  function sCteArchive(t) {
    heading("WITH CTE Bilan Atomar O'chirish va Arxivlash Oqimi", t, TM.scenes.cte_archive.s);

    const k1 = P(t, W('L5', 'si-ti-i'), 0.5);
    withA(k1, () => {
      const out4 = [
        " id | ism | balans ",
        "----+-----+--------",
        "  4 | Dilnoza |      0",
        "(1 row)",
        "INSERT 0 1",
        "",
        " id | ism  ",
        "----+------",
        "  1 | Ali",
        "  2 | Vali",
        "(2 rows)"
      ];
      term(120, 220, 840, 480, "WITH CTE Arxivlash", [{
        b: {
          cmd: "-- O'chirilgan qatorlarni boshqa jadvalga uzatish:\nWITH ochirilgan AS (\n    DELETE FROM mijozlar WHERE balans = 0\n    RETURNING id, ism, balans\n)\nINSERT INTO arxiv SELECT * FROM ochirilgan RETURNING *;\n\n-- Asosiy jadvalni tekshirish:\nSELECT id, ism FROM mijozlar ORDER BY id;",
          out: out4
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L5', 'atomar'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Data-Modifying Statements in WITH", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. Atomar Ko'chirish Oqimi:", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• DELETE mijozlar jadvalidan balans = 0 qatorlarni o'chiradi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• O'chirilgan natija esa bitta buyruqda arxiv jadvaliga INSERT qilinadi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Poygasiz va Xavfsiz (No Race-Condition):", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Ikki alohida so'rov o'rtasidagi ma'lumotlar yo'qolish xavfi yo'q.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Tranzaksiya ichida ikkala amal ham bir zumda to'liq bajariladi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'ko‘chiradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("PostgreSQL Ning Maxsus Imkoniyati:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("WITH CTE ichida DML buyruqlarini (INSERT, UPDATE, DELETE) ishlatish faqat PostgreSQL ning kuchli afzalligidir. SQLite va MySQL da bu sintaksis mavjud emas.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL 18 da RETURNING Imkoniyatlari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'selekt'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Amaliy Darsdan Olingan 4 Ta Asosiy Qoida", 160, 280, { size: 30, color: C.blue, p: k1 });

      card(160, 340, 380, 320, { fill: '#fff', col: C.blue, p: k1 });
      text("1. INSERT RETURNING", 180, 390, { size: 20, weight: 700, color: C.blue });
      text("Baza bergan barcha avtomatik ID va default qiymatlarni bittalab ham, ko'plab ham oling.", 180, 440, { size: 17, color: C.ink, wrap: 340 });

      card(560, 340, 380, 320, { fill: '#fff', col: C.green, p: k1 });
      text("2. OLD va NEW", 580, 390, { size: 20, weight: 700, color: C.green });
      text("PostgreSQL 18 da eski va yangi qiymatlarni birga olib audit loglarini osonlashtiring.", 580, 440, { size: 17, color: C.ink, wrap: 340 });

      card(960, 340, 380, 320, { fill: '#fff', col: C.purple, p: k1 });
      text("3. DELETE RETURNING", 980, 390, { size: 20, weight: 700, color: C.purple });
      text("O'chirilgan qator nusxasini oling yoki hech narsa topilmasa 0 qator kuting.", 980, 440, { size: 17, color: C.ink, wrap: 340 });

      card(1360, 340, 400, 320, { fill: '#fff', col: C.red, p: k1 });
      text("4. WITH CTE Pipeline", 1380, 390, { size: 20, weight: 700, color: C.red });
      text("DELETE RETURNING natijasini to'g'ridan-to'g'ri INSERT arxivga uzating.", 1380, 440, { size: 17, color: C.ink, wrap: 360 });
    });

    const kDesc = P(t, W('L6', 'ko‘taradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("PostgreSQL 18 ning RETURNING vositasi ma'lumotlar bazasi bilan aloqani eng tezkor, xavfsiz va toza usulda tashkil qilishga imkon beradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.insert_id.s) sIntro(t);
    else if (t < S.update_old_new.s) sInsertId(t);
    else if (t < S.delete_returning.s) sUpdateOldNew(t);
    else if (t < S.cte_archive.s) sDeleteReturning(t);
    else if (t < S.xulosa.s) sCteArchive(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.update_old_new.s + 4.0;
    frame(t);
  };
})();
