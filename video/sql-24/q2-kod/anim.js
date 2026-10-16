// SQL 24-bob 2-qism: "Kod" — PostgreSQL 18 da Saralash va Sahifalash Amaliyoti
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY.pg) || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("24-bob. Kod", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: Saralash Amaliyoti", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ORDER BY, NULLS LAST, Sahifalash va WITH TIES", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 380, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'talabalar'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Sinov Jadvali: talabalar2 (Oltita qator ma'lumot bilan):", 190, 495, { size: 24, weight: 700, color: C.ink, fam: UI });

      card(190, 535, 780, 380, { fill: '#f6f9fc', col: C.blue, p: kCards });
      pill("Jadval Tuzilishi", 580, 575, C.blue, kCards, 18);
      text("CREATE TABLE talabalar2 (", 220, 625, { size: 18, color: C.ink, fam: MONO });
      text("  id int PRIMARY KEY, ism text, guruh text, ball int", 220, 655, { size: 18, color: C.blue, fam: MONO });
      text(");", 220, 685, { size: 18, color: C.ink, fam: MONO });
      text("1 | Ali     | A | 85", 220, 725, { size: 17, color: C.green, fam: MONO });
      text("2 | Vali    | B | 92  -- Eng yuqori ball", 220, 755, { size: 17, color: C.green, fam: MONO });
      text("3 | Sobir   | A | NULL -- Bali noma'lum!", 220, 785, { size: 17, color: '#ea580c', fam: MONO });
      text("4 | Dilnoza | B | 92  -- Eng yuqori ball (teng)", 220, 815, { size: 17, color: C.green, fam: MONO });
      text("5 | Malika  | A | 78", 220, 845, { size: 17, color: C.soft, fam: MONO });
      text("6 | Jasur   | B | 85", 220, 875, { size: 17, color: C.soft, fam: MONO });

      card(1010, 535, 730, 380, { fill: '#faf5ff', col: C.purple, p: kCards });
      pill("Amaliy Sinov Rejasi", 1375, 575, C.purple, kCards, 18);
      text("Ko'rib chiqiladigan real holatlar:", 1040, 630, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("1. ORDER BY ball DESC da Sobir nima uchun 1-chi bo'ldi?", 1040, 680, { size: 18, color: C.red, fam: UI });
      text("2. NULLS LAST yordamida Sobirni oxiriga tushirish", 1040, 730, { size: 18, color: C.green, fam: UI });
      text("3. LIMIT 2 OFFSET 0 va OFFSET 2 sahifalash", 1040, 780, { size: 18, color: C.blue, fam: UI });
      text("4. WITH TIES orqali 92 balli ikkala g'olibni olish", 1040, 830, { size: 18, color: C.purple, fam: UI });
    });
  }

  // 2. NULLS ORDER DEMO
  function sNullsOrderDemo(t) {
    heading("PostgreSQL 18: NULL ning O'rni va NULLS LAST", t, TM.scenes.nulls_order_demo.s);

    const k1 = P(t, W('L2', 'Kamayish'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("Muammo va NULLS LAST Yechimi", 520, 260, C.red, k1, 20);

      card(140, 310, 760, 160, { fill: '#fff1f2', col: C.red, p: k1 });
      text("-- 1. Oddiy DESC saralash:", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT ism, ball FROM talabalar2", 170, 385, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC; -- Sobir (NULL) 1-o'rinda!", 170, 420, { size: 19, weight: 700, color: C.red, fam: MONO });

      card(140, 500, 760, 160, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("-- 2. To'g'ri PostgreSQL yozuvi:", 170, 540, { size: 17, color: C.soft, fam: MONO });
      text("SELECT ism, ball FROM talabalar2", 170, 575, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST; -- Sobir oxirida!", 170, 615, { size: 20, weight: 700, color: C.green, fam: MONO });

      text("Nima uchun shunday?", 140, 700, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• PostgreSQL da NULL barcha sonlardan katta hisoblanadi.", 140, 745, { size: 18, color: C.soft, fam: UI });
      text("• Shuning uchun DESC (kamayish) da u eng birinchi chiqadi.", 140, 785, { size: 18, color: C.soft, fam: UI });
      text("• NULLS LAST buyrug'i NULL larni ro'yxat oxiriga suradi.", 140, 830, { size: 18, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L2', 'Sobir'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT ism, ball FROM talabalar2 ORDER BY ball DESC;",
        "   ism   | ball ",
        "---------+------",
        " Sobir   |      <-- Xato: 1-o'rinda!",
        " Vali    |   92",
        " Dilnoza |   92",
        " Ali     |   85",
        " Jasur   |   85",
        " Malika  |   78",
        "(6 rows)",
        "",
        "qollanma=# SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST;",
        "   ism   | ball ",
        "---------+------",
        " Vali    |   92",
        " Dilnoza |   92",
        " Ali     |   85",
        " Jasur   |   85",
        " Malika  |   78",
        " Sobir   |      <-- To'g'ri: oxirida!",
        "(6 rows)"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Real ijro)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 23 });
    });
  }

  // 3. PAGINATION DEMO
  function sPaginationDemo(t) {
    heading("Sahifalash: LIMIT, OFFSET va Determinizm Amaliyoti", t, TM.scenes.pagination_demo.s);

    const k1 = P(t, W('L3', 'Limit'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("Sahifalash So'rovlari", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("-- 1-Sahifa (2 ta qator):", 170, 350, { size: 17, color: C.soft, fam: MONO });
      text("SELECT ism, ball FROM talabalar2", 170, 380, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST, id LIMIT 2 OFFSET 0;", 170, 415, { size: 18, weight: 700, color: C.blue, fam: MONO });

      card(140, 485, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("-- 2-Sahifa (Keyingi 2 ta qator):", 170, 525, { size: 17, color: C.soft, fam: MONO });
      text("SELECT ism, ball FROM talabalar2", 170, 555, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST, id LIMIT 2 OFFSET 2;", 170, 590, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("Nega ikkinchi ustun sifatida id berildi?", 140, 680, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Vali va Dilnoza bir xil (92 ball) olgan.", 140, 725, { size: 18, color: C.soft, fam: UI });
      text("• Ali va Jasur ham bir xil (85 ball) olgan.", 140, 765, { size: 18, color: C.soft, fam: UI });
      text("• Agar id qo'shilmasa, qatorlar sahifalar orasida", 140, 810, { size: 18, color: C.red, fam: UI });
      text("  almashib qolishi mumkin. id 100% barqaror qiladi!", 140, 845, { size: 18, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L3', 'barqaror'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT ism, ball FROM talabalar2",
        "            ORDER BY ball DESC NULLS LAST, id",
        "            LIMIT 2 OFFSET 0;",
        "   ism   | ball ",
        "---------+------",
        " Vali    |   92",
        " Dilnoza |   92",
        "(2 rows) -- 1-sahifa yakunlandi",
        "",
        "qollanma=# SELECT ism, ball FROM talabalar2",
        "            ORDER BY ball DESC NULLS LAST, id",
        "            LIMIT 2 OFFSET 2;",
        "  ism  | ball ",
        "-------+------",
        " Ali   |   85",
        " Jasur |   85",
        "(2 rows) -- 2-sahifa to'liq mos keldi!"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (Sahifalar)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 24 });
    });
  }

  // 4. WITH TIES DEMO
  function sWithTiesDemo(t) {
    heading("FETCH FIRST va WITH TIES: Teng Ballilar Amaliyoti", t, TM.scenes.with_ties_demo.s);

    const k1 = P(t, W('L4', 'fech'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("Standart SQL: WITH TIES", 520, 260, C.purple, k1, 20);

      card(140, 310, 760, 160, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("SELECT ism, ball FROM talabalar2", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST", 170, 385, { size: 19, color: C.purple, fam: MONO });
      text("FETCH FIRST 2 ROWS WITH TIES;", 170, 425, { size: 21, weight: 700, color: C.purple, fam: MONO });

      text("Bu qanday ishlaydi?", 140, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. Biz 2 ta qator so'radik (FIRST 2 ROWS).", 140, 555, { size: 19, color: C.soft, fam: UI });
      text("2. 2-o'rindagi talaba Dilnoza (92 ball).", 140, 595, { size: 19, color: C.soft, fam: UI });
      text("3. Vali ham xuddi shunday 92 ball olgan.", 140, 635, { size: 19, color: C.soft, fam: UI });
      text("4. WITH TIES bo'lsa, oxirgi o'ringa teng bo'lgan", 140, 680, { size: 19, color: C.purple, fam: UI });
      text("   barcha talabalar avtomatik ravishda qo'shiladi!", 140, 715, { size: 19, weight: 700, color: C.green, fam: UI });
      text("5. Hech bir g'olib nohaq chetda qolib ketmaydi.", 140, 765, { size: 18, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L4', 'Vali'), 0.5);
    withA(k2, () => {
      const termOut = [
        "qollanma=# SELECT ism, ball FROM talabalar2",
        "            ORDER BY ball DESC NULLS LAST",
        "            FETCH FIRST 2 ROWS WITH TIES;",
        "   ism   | ball ",
        "---------+------",
        " Vali    |   92",
        " Dilnoza |   92",
        "(2 rows)",
        "",
        "-- Agar LIMIT 1 bilan bitta o'rin so'ralsa:",
        "qollanma=# SELECT ism, ball FROM talabalar2",
        "            ORDER BY ball DESC NULLS LAST",
        "            FETCH FIRST 1 ROW WITH TIES;",
        "   ism   | ball ",
        "---------+------",
        " Vali    |   92",
        " Dilnoza |   92",
        "(2 rows) -- Bitta so'ralsa ham tenglar chiqdi!"
      ];
      term(980, 210, 840, 780, "PostgreSQL 18.6 Terminali (WITH TIES)", [{
        b: {
          cmd: "psql -d qollanma",
          out: termOut.join('\n')
        }
      }], { font: 15, lh: 23 });
    });
  }

  // 5. MULTI COLUMN DEMO
  function sMultiColumnDemo(t) {
    heading("Ko'p Ustunli Saralash: Guruh va Ball Alohida", t, TM.scenes.multi_column_demo.s);

    const k1 = P(t, W('L5', 'ustun'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.green, p: k1 });
      pill("Murakkab ORDER BY Sintaksisi", 520, 260, C.green, k1, 20);

      card(140, 310, 760, 170, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("SELECT ism, guruh, ball FROM talabalar2", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY guruh ASC,", 170, 385, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("         ball DESC NULLS LAST,", 170, 420, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("         ism ASC;", 170, 455, { size: 20, weight: 700, color: C.purple, fam: MONO });

      text("Saralash bosqichlari:", 140, 520, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("1. Avval guruh bo'yicha saralanadi (A guruhi, keyin B).", 140, 565, { size: 18, color: C.blue, fam: UI });
      text("2. Har bir guruh ichida ball kamayish tartibida.", 140, 605, { size: 18, color: C.green, fam: UI });
      text("3. Guruhdagi balli yo'q talaba oxiriga tushadi.", 140, 645, { size: 18, color: C.soft, fam: UI });
      text("4. Agar ballar ham teng bo'lsa, ism alifbo bo'yicha.", 140, 685, { size: 18, color: C.purple, fam: UI });

      card(140, 735, 760, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Har bir ustun mustaqil yo'nalishga ega!", 170, 775, { size: 19, weight: 700, color: C.green, fam: UI });
      text("Guruh ASC bo'lgani bilan ball DESC bo'lishiga xalaqit bermaydi.", 170, 815, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'guruh'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.blue, p: k2 });
      pill("Guruhlangan Natija Ko'rinishi", 1400, 260, C.blue, k2, 20);

      card(1020, 310, 760, 400, { fill: '#fff', col: C.blue, p: k2 });
      text("PostgreSQL 18 Konsolida:", 1050, 350, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("  ism   | guruh | ball ", 1050, 395, { size: 18, color: C.ink, fam: MONO });
      text("--------+-------+------", 1050, 425, { size: 18, color: C.soft, fam: MONO });
      text(" Ali    | A     |   85  <-- A guruhi (yuqori ball)", 1050, 460, { size: 17, color: C.blue, fam: MONO });
      text(" Malika | A     |   78  <-- A guruhi", 1050, 495, { size: 17, color: C.blue, fam: MONO });
      text(" Sobir  | A     |       <-- A guruhi (NULL oxirida)", 1050, 530, { size: 17, color: C.soft, fam: MONO });
      text(" Dilnoza| B     |   92  <-- B guruhi (yuqori ball)", 1050, 565, { size: 17, color: C.green, fam: MONO });
      text(" Vali   | B     |   92  <-- B guruhi (teng)", 1050, 600, { size: 17, color: C.green, fam: MONO });
      text(" Jasur  | B     |   85  <-- B guruhi", 1050, 635, { size: 17, color: C.green, fam: MONO });
      text("(6 rows)", 1050, 670, { size: 17, color: C.soft, fam: MONO });

      text("Har bir guruh alohida intizom bilan saralandi!", 1020, 745, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL da Saralashning Asosiy Qoidalari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Baza'), 0.5);
    withA(k1, () => {
      card(120, 210, 1680, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("AMALIY TAVSIYALAR", 960, 260, C.blue, k1, 22);

      card(160, 320, 780, 280, { fill: '#fff', col: C.green, p: k1 });
      pill("1. NULLS LAST dan Doim Foydalaning", 550, 360, C.green, k1, 18);
      text("• PostgreSQL da NULL eng katta hisoblanadi.", 190, 420, { size: 19, color: C.ink, fam: UI });
      text("• Kamayish (DESC) da NULL boshiga chiqib qolmasin.", 190, 465, { size: 19, color: C.red, fam: UI });
      text("• Har doim ORDER BY ball DESC NULLS LAST yozing.", 190, 510, { size: 19, weight: 700, color: C.green, fam: UI });

      card(980, 320, 780, 280, { fill: '#fff', col: C.blue, p: k1 });
      pill("2. Deterministik Sahifalash (id)", 1370, 360, C.blue, k1, 18);
      text("• Teng ballilar sahifalar orasida sakrab yurmasin.", 1010, 420, { size: 19, color: C.ink, fam: UI });
      text("• Saralash oxiriga doimo takrorlanmas ustun qo'shing:", 1010, 465, { size: 18, color: C.ink, fam: UI });
      text("  ORDER BY ball DESC, id ASC.", 1010, 505, { size: 19, weight: 700, color: C.green, fam: MONO });

      card(160, 630, 780, 320, { fill: '#fff', col: C.purple, p: k1 });
      pill("3. WITH TIES Bilan Adolatli Tanlash", 550, 670, C.purple, k1, 18);
      text("• Eng yaxshi talabalar tanlanganda teng ballilarni", 190, 730, { size: 18, color: C.ink, fam: UI });
      text("  tushirib qoldirmaslik uchun FETCH FIRST n ROWS", 190, 765, { size: 18, color: C.purple, fam: UI });
      text("  WITH TIES konstruksiyasidan foydalaning.", 190, 805, { size: 18, weight: 700, color: C.purple, fam: UI });

      card(980, 630, 780, 320, { fill: '#fff', col: C.red, p: k1 });
      pill("4. Katta OFFSET dan Qoching", 1370, 670, C.red, k1, 18);
      text("• LIMIT 20 OFFSET 500000 juda sekin ishlaydi.", 1010, 730, { size: 19, color: C.red, fam: UI });
      text("• Katta jadvallarda keyset sahifalashdan (WHERE id > x)", 1010, 775, { size: 18, color: C.green, fam: UI });
      text("  foydalaning. Bu indeks orqali 100 baravar tez ishlaydi.", 1010, 815, { size: 18, color: C.green, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.nulls_order_demo.s) sIntro(t);
    else if (t < S.pagination_demo.s) sNullsOrderDemo(t);
    else if (t < S.with_ties_demo.s) sPaginationDemo(t);
    else if (t < S.multi_column_demo.s) sWithTiesDemo(t);
    else if (t < S.xulosa.s) sMultiColumnDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.nulls_order_demo.s + 3.0);
  };
})();
