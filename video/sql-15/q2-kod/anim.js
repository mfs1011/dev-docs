// SQL 15-bob 2-qism: "Kod" — PostgreSQL 18 da Generated Ustunlar
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
    hand("15-bob. Kod", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Generated Ustunlar Amaliyoti", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Virtual va Stored Maydonlar, UPDATE Sinovlari, pg_attribute va Xatolar", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 430, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Postgres'), 0.8);
    withA(kBadges, () => {
      pill("1. VIRTUAL & STORED Sinovi", 400, 580, C.blue, kBadges, 21);
      pill("2. UPDATE da Avto-yangilanish", 860, 580, C.green, kBadges, 21);
      pill("3. pg_attribute: v vs s", 1320, 580, C.purple, kBadges, 21);
      pill("4. now() va Zanjir Xatoliklari", 1660, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'virtual'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("GENERATED ALWAYS AS sintaksisi yordamida virtual va stored ustunlar yaratish,", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("UPDATE paytida avtomatik qayta hisoblash hamda katalog va xatoliklarni tekshirishni ko'ramiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. TURLAR DEMO
  function sTurlarDemo(t) {
    heading("Virtual va Stored Generated Ustunlar", t, TM.scenes.turlar_demo.s);

    const k1 = P(t, W('L2', 'Buyurtma_qatorlari'), 0.5);
    withA(k1, () => {
      const out1 = [
        "DROP TABLE",
        "CREATE TABLE",
        "INSERT 0 2",
        " id |   narx   | soni |  summa   | summa_s  ",
        "----+----------+------+----------+----------",
        "  1 |  4000.00 |    3 | 12000.00 | 12000.00",
        "  2 | 12000.00 |    2 | 24000.00 | 24000.00",
        "(2 rows)"
      ];
      term(140, 220, 800, 450, "1. Virtual va Stored Ustunlar Yaratish", [{
        b: {
          cmd: "CREATE TABLE buyurtma_qatorlari (\n    id integer PRIMARY KEY,\n    narx numeric(12,2) NOT NULL,\n    soni integer NOT NULL,\n    summa numeric(14,2) GENERATED ALWAYS AS (narx * soni),\n    summa_s numeric(14,2) GENERATED ALWAYS AS (narx * soni) STORED\n);\nINSERT INTO buyurtma_qatorlari VALUES (1, 4000, 3), (2, 12000, 2);\nSELECT * FROM buyurtma_qatorlari;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L2', 'summa_s'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("Natija Tahlili: Bir Xil Qiymat, Turli Saqlash", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. summa — VIRTUAL (sukut bo'yicha):", 1050, 365, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Diskda 0 bayt joy oladi. SELECT qilinganida formuladan parvozda hisoblanadi.", 1050, 410, { size: 18, color: C.ink, wrap: 660 });
      text("• PostgreSQL 18 da sukut bo'yicha aynan virtual yaratiladi.", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("2. summa_s — STORED:", 1050, 545, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• Diskda oddiy ustun kabi joy oladi. Qator kiritilganda bir marta hisoblab yoziladi.", 1050, 590, { size: 18, color: C.ink, wrap: 660 });
      text("• O'qish so'rovlari juda tez ishlaydi, hisoblash talab etilmaydi.", 1050, 625, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'avtomatik'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Asosiy Afzallik:", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Ilova dasturchisi summa yoki summa_s ustuniga qiymat hisoblab yuborishi shart emas. Narx va soni kiritilishi bilanoq, ma'lumotlar bazasi hisob-kitobni to'liq o'z zimmasiga oladi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. UPDATE DEMO
  function sUpdateDemo(t) {
    heading("UPDATE Paytida Avtomatik Qayta Hisoblash", t, TM.scenes.update_demo.s);

    const k1 = P(t, W('L3', 'apdeyt'), 0.5);
    withA(k1, () => {
      const out2 = [
        "UPDATE 1",
        " id | soni |  summa   | summa_s  ",
        "----+------+----------+----------",
        "  1 |    5 | 20000.00 | 20000.00",
        "(1 row)"
      ];
      term(140, 220, 800, 450, "UPDATE Bajarilishi", [{
        b: {
          cmd: "UPDATE buyurtma_qatorlari SET soni = 5 WHERE id = 1;\nSELECT id, soni, summa, summa_s FROM buyurtma_qatorlari WHERE id = 1;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L3', 'hisoblanadi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.green, p: k2 });
      hand("Hisoblash Dinamikasi", 1020, 280, { size: 28, color: C.green, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("Oldingi holat: soni = 3 -> summa = 12,000", 1050, 365, { size: 20, weight: 700, color: C.ink, wrap: 660 });
      text("Yangi holat: soni = 5 -> summa = 20,000", 1050, 410, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("Hech qanday qo'shimcha UPDATE yoki trigger talab qilinmadi!", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("Tranzaksiyaviy Butunlik:", 1050, 545, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("Qator yangilanishi bilan bir vaqtda stored ustun qayta yoziladi, virtual ustun esa o'qilganda yangi qiymatni qaytaradi. Nomuvofiqlik ehtimoli 0 ga teng.", 1050, 595, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'jenerated'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.green, p: kDesc });
      hand("Nega bu Dastur Kodidan Yaxshiroq?", 180, 750, { size: 28, color: C.green, p: kDesc });
      text("Agar summa ilova kodida hisoblansa, bir nechta servislar (masalan veb-sayt, mobil ilova va fon jarayoni) alohida hisob-kitob qilishi kerak bo'ladi va ulardan birida xato ketsa baza ifloslanadi. Generated ustun esa barcha ilovalar uchun bitta haqiqat manbaidir.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. KATALOG VA INSERT
  function sKatalogVaInsert(t) {
    heading("pg_attribute Katalogi va Qo'lda Yozish Taqiqi", t, TM.scenes.katalog_va_insert.s);

    const k1 = P(t, W('L4', 'attribyut'), 0.5);
    withA(k1, () => {
      const out3 = [
        " attname | attgenerated ",
        "---------+--------------",
        " summa   | v",
        " summa_s | s",
        "(2 rows)"
      ];
      term(140, 220, 800, 450, "pg_attribute: attgenerated", [{
        b: {
          cmd: "SELECT attname, attgenerated FROM pg_attribute\nWHERE attrelid = 'buyurtma_qatorlari'::regclass\n  AND attname LIKE 'summa%';",
          out: out3
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L4', 'taqiqlanadi'), 0.5);
    withA(k2, () => {
      const out4 = [
        "ERROR:  cannot insert a non-DEFAULT value into column \"summa\"",
        "DETAIL:  Column \"summa\" is a generated column.",
        "",
        "-- To'g'ri yo'l:",
        "INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (3, 1, 1, DEFAULT);",
        "INSERT 0 1"
      ];
      term(980, 220, 800, 450, "Qo'lda Qiymat Kiritish Taqiqi", [{
        b: {
          cmd: "INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (3, 1, 1, 999);",
          out: out4
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    const kDesc = P(t, W('L4', 'difolt'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.purple, p: kDesc });
      hand("Qat'iy Himoya Qoidasi:", 180, 750, { size: 28, color: C.purple, p: kDesc });
      text("Generated ustunga qiymat majburlab yozilishi mutlaqo man etiladi. Agar so'rovda bu ustun ko'rsatilishi shart bo'lsa (masalan ORM yoki INSERT generatori tufayli), faqat DEFAULT kalit so'zi berilishi mumkin.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 5. TAQIQLANGAN DEMO
  function sTaqiqlanganDemo(t) {
    heading("Taqiqlangan Ifodalar: now() va Zanjir Xatolari", t, TM.scenes.taqiqlangan_demo.s);

    const k1 = P(t, W('L5', 'Nau'), 0.5);
    withA(k1, () => {
      const out5 = [
        "DROP TABLE",
        "ERROR:  generation expression is not immutable"
      ];
      term(140, 220, 800, 450, "1. now() Taqiqi (Immutable Emas)", [{
        b: {
          cmd: "CREATE TABLE xato1 (\n    a int,\n    vaqt timestamptz GENERATED ALWAYS AS (now()) STORED\n);",
          out: out5
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L5', 'xatolik'), 0.5);
    withA(k2, () => {
      const out6 = [
        "ERROR:  cannot use generated column \"b\" in column generation expression",
        "LINE 1: ...RATED ALWAYS AS (a * 2), c int GENERATED ALWAYS AS (b + 1));",
        "                                                               ^",
        "DETAIL:  A generated column cannot reference another generated column."
      ];
      term(980, 220, 800, 450, "2. Boshqa Generated Ustunga Tayanish Taqiqi", [{
        b: {
          cmd: "CREATE TABLE xato2 (\n    a int,\n    b int GENERATED ALWAYS AS (a * 2),\n    c int GENERATED ALWAYS AS (b + 1)\n);",
          out: out6
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L5', 'o‘zgaruvchan'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.red, p: kDesc });
      hand("Nega bu Cheklovlar O'rnatilgan?", 180, 750, { size: 28, color: C.red, p: kDesc });
      text("now() har safar har xil vaqt beradi va qatorda o'zgarmas natija kafolatlanmaydi (vaqt uchun DEFAULT now() ishlatiladi). Generated ustunlar zanjiri esa ziddiyatlar va hisoblash tartibi noaniqligining oldini olish uchun PostgreSQL da taqiqlangan.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L6', 'tejaydi'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "Virtual — Sukut Bo'yicha",
          desc: "PostgreSQL 18 da VIRTUAL sukut bo'yicha tanlanadi va disk xotirasini tejaydi.",
          col: C.blue
        },
        {
          num: "2",
          title: "Qo'lda Yozib Bo'lmaydi",
          desc: "Generated ustunga soxta qiymat kiritilmaydi, formula yaxlitligi kafolatlanadi.",
          col: C.green
        },
        {
          num: "3",
          title: "Faqat O'zgarmas Formulalar",
          desc: "Ifodada faqat deterministik amallardan foydalaning, now() uchun DEFAULT ishlating.",
          col: C.purple
        }
      ];

      items.forEach((it, idx) => {
        const x = 140 + idx * 560;
        card(x, 220, 520, 430, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, 275, it.col, k, 24);
        hand(it.title, x + 90, 282, { size: 22, color: it.col, p: k });

        card(x + 25, 330, 470, 290, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 50, 395, { size: 21, color: C.ink, wrap: 420 });
      });

      card(140, 690, 1640, 220, { fill: C.card, col: C.blue, p: k });
      hand("PostgreSQL 18 da Generated Ustunlar — Xavfsiz va Ishonchli Formula Arxitekturasi!", 960, 755, { size: 34, align: 'center', color: C.blue, p: k });
      text("Hisob-kitoblarni bazaga o'tkazish orqali barcha ilovalar uchun yagona va o'zgarmas standart yaratiladi.", 960, 825, { size: 23, align: 'center', color: C.ink, wrap: 1540 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.turlar_demo.s) sIntro(t);
    else if (t < S.update_demo.s) sTurlarDemo(t);
    else if (t < S.katalog_va_insert.s) sUpdateDemo(t);
    else if (t < S.taqiqlangan_demo.s) sKatalogVaInsert(t);
    else if (t < S.xulosa.s) sTaqiqlanganDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 2-sahna (Turlar demo terminali) bo'yicha chiroyli poster
    const t = TM.scenes.turlar_demo.s + 5.0;
    frame(t);
  };
})();
