// SQL 22-bob 2-qism: "Kod" — PostgreSQL 18 da SELECT, Aliaslar va DISTINCT ON Amaliyoti
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
    hand("22-bob. Kod", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18: SELECT Amaliyoti", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Aliaslar, WHERE xatosi, ORDER BY va DISTINCT ON", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'sotuvlar'), 0.8);
    withA(kBadges, () => {
      pill("1. BAZA SXEMASI", 360, 520, C.blue, kBadges, 20);
      pill("2. WHERE DA ALIAS XATOSI", 780, 520, C.red, kBadges, 20);
      pill("3. ORDER BY DA ALIAS", 1200, 520, C.green, kBadges, 20);
      pill("4. DISTINCT ON AMALIYOTI", 1600, 520, C.purple, kBadges, 20);
    });

    const kTable = P(t, W('L1', 'oltita'), 0.8);
    withA(kTable, () => {
      card(180, 600, 1560, 320, { fill: C.card, col: C.blue, p: kTable });
      text("Sinov jadvali: sotuvlar (Oltita qator ma'lumot bilan):", 240, 650, { size: 24, weight: 700, color: C.ink, fam: UI });

      card(240, 680, 720, 210, { fill: '#f6f9fc', col: C.blue, p: kTable });
      text("CREATE TABLE sotuvlar (", 260, 715, { size: 18, color: C.ink, fam: MONO });
      text("  id int PRIMARY KEY,", 260, 745, { size: 18, color: C.blue, fam: MONO });
      text("  sotuvchi text, shahar text, summa numeric", 260, 775, { size: 18, color: C.blue, fam: MONO });
      text(");", 260, 805, { size: 18, color: C.ink, fam: MONO });
      text("INSERT: Ali (500, 300), Vali (700, 200), Sobir (900, 100)", 260, 845, { size: 17, color: C.green, fam: MONO });

      card(1000, 680, 700, 210, { fill: '#faf5ff', col: C.purple, p: kTable });
      text("Ko'rib chiqiladigan asosiy holatlar:", 1030, 720, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Alias nega WHERE da topilmaydi?", 1030, 765, { size: 19, color: C.red, fam: UI });
      text("• ORDER BY va GROUP BY da alias qanday ishlaydi?", 1030, 805, { size: 19, color: C.green, fam: UI });
      text("• DISTINCT ON birinchi qatorni qanday ajratadi?", 1030, 845, { size: 19, color: C.blue, fam: UI });
    });
  }

  // 2. ALIAS WHERE ERROR
  function sAliasWhereErr(t) {
    heading("WHERE da Alias Xatosi: column does not exist", t, TM.scenes.alias_where_err.s);

    const k1 = P(t, W('L2', 'aliasini'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Xato So'rov Sintaksisi", 530, 270, C.red, k1, 20);

      text("SELECT sotuvchi,", 160, 335, { size: 21, color: C.ink, fam: MONO });
      text("       summa * 1.12 AS qqs_bilan", 160, 375, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("FROM sotuvlar", 160, 415, { size: 21, color: C.green, fam: MONO });
      text("WHERE qqs_bilan > 500; -- XATO!", 160, 455, { size: 21, weight: 700, color: C.red, fam: MONO });

      sline(160, 510, 880, 510, { col: C.rule, p: k1 });

      text("Nega bu xato chiqdi?", 160, 560, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. SQL so'rovini bajarishda WHERE 2-bosqichda ishlaydi.", 160, 605, { size: 20, color: C.soft, fam: UI });
      text("2. SELECT ro'yxati va 'qqs_bilan' aliasi esa 5-bosqichda", 160, 645, { size: 20, color: C.soft, fam: UI });
      text("   hisoblanadi.", 160, 675, { size: 20, color: C.soft, fam: UI });
      text("3. WHERE bajarilayotgan paytda 'qqs_bilan' nomli ustun", 160, 720, { size: 20, color: C.red, fam: UI });
      text("   umuman mavjud emas deb hisoblanadi!", 160, 755, { size: 20, weight: 700, color: C.red, fam: UI });
      text("4. Bu barcha relyatsion ma'lumotlar bazalarining qonunidir.", 160, 810, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'xato'), 0.5);
    withA(k2, () => {
      const errOut = [
        "qollanma=# SELECT sotuvchi, summa * 1.12 AS qqs_bilan",
        "            FROM sotuvlar WHERE qqs_bilan > 500;",
        "",
        "ERROR:  column \"qqs_bilan\" does not exist",
        "LINE 1: ...umma * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan > ...",
        "                                                       ^",
        "HINT:  Perhaps you meant to reference the column \"sotuvlar.summa\".",
        "",
        "-- Xuddi shuningdek HAVING da ham alias ishlamaydi:",
        "qollanma=# SELECT sotuvchi, sum(summa) AS jami",
        "            FROM sotuvlar GROUP BY sotuvchi HAVING jami > 700;",
        "ERROR:  column \"jami\" does not exist"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18.6 Terminali (Real xato)", [{
        b: {
          cmd: "psql -d qollanma",
          out: errOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 3. ALIAS ORDER OK
  function sAliasOrderOk(t) {
    heading("To'g'ri Yo'l: WHERE da Ifoda, ORDER BY da Alias", t, TM.scenes.alias_order_ok.s);

    const k1 = P(t, W('L3', 'To‘g‘ri'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.green, p: k1 });
      pill("To'g'rilangan SQL So'rovi", 530, 270, C.green, k1, 20);

      text("SELECT sotuvchi,", 160, 335, { size: 21, color: C.ink, fam: MONO });
      text("       summa * 1.12 AS qqs_bilan", 160, 375, { size: 21, weight: 700, color: C.blue, fam: MONO });
      text("FROM sotuvlar", 160, 415, { size: 21, color: C.green, fam: MONO });
      text("WHERE summa * 1.12 > 500   -- Ifodani to'liq yozamiz!", 160, 455, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("ORDER BY qqs_bilan DESC;   -- ORDER BY aliasni biladi!", 160, 495, { size: 20, weight: 700, color: C.blue, fam: MONO });

      sline(160, 545, 880, 545, { col: C.rule, p: k1 });

      text("Nega ORDER BY da alias ishlaydi?", 160, 595, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. ORDER BY eng oxirgi (6-bosqich) bosqichda bajariladi.", 160, 640, { size: 20, color: C.soft, fam: UI });
      text("2. SELECT ro'yxati allaqachon hisoblangan va ustunlarga", 160, 680, { size: 20, color: C.soft, fam: UI });
      text("   'qqs_bilan' nomi berilgan.", 160, 715, { size: 20, color: C.blue, fam: UI });
      text("3. Shuning uchun ORDER BY qqs_bilan DESC hech qanday", 160, 760, { size: 20, color: C.soft, fam: UI });
      text("   muammosiz to'g'ri saralaydi.", 160, 795, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L3', 'taniydi'), 0.5);
    withA(k2, () => {
      const okOut = [
        "qollanma=# SELECT sotuvchi, summa * 1.12 AS qqs_bilan",
        "            FROM sotuvlar",
        "            WHERE summa * 1.12 > 500",
        "            ORDER BY qqs_bilan DESC;",
        "",
        " sotuvchi | qqs_bilan ",
        "----------+-----------",
        " Sobir    |   1008.00",
        " Vali     |    784.00",
        " Ali      |    560.00",
        "(3 rows)",
        "",
        "-- GROUP BY va ORDER BY da ustun raqami ham ishlaydi:",
        "qollanma=# SELECT sotuvchi, sum(summa) AS jami",
        "            FROM sotuvlar GROUP BY 1 ORDER BY 2 DESC;",
        " sotuvchi | jami ",
        "----------+------",
        " Sobir    | 1000",
        " Vali     |  900",
        " Ali      |  800",
        "(3 rows)"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18.6 Terminali (Muvaffaqiyat)", [{
        b: {
          cmd: "psql -d qollanma",
          out: okOut.join('\n')
        }
      }], { font: 16, lh: 24 });
    });
  }

  // 4. DISTINCT ON DEMO
  function sDistinctOnDemo(t) {
    heading("PostgreSQL: DISTINCT ON (sotuvchi) Amaliyoti", t, TM.scenes.distinct_on_demo.s);

    const k1 = P(t, W('L4', 'yirik'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.purple, p: k1 });
      pill("Eng Katta Savdoni Topish", 530, 270, C.purple, k1, 20);

      text("SELECT DISTINCT ON (sotuvchi)", 160, 335, { size: 21, weight: 700, color: C.purple, fam: MONO });
      text("       sotuvchi, shahar, summa", 160, 375, { size: 21, color: C.ink, fam: MONO });
      text("FROM sotuvlar", 160, 415, { size: 21, color: C.green, fam: MONO });
      text("ORDER BY sotuvchi, summa DESC;", 160, 455, { size: 21, weight: 700, color: C.blue, fam: MONO });

      sline(160, 510, 880, 510, { col: C.rule, p: k1 });

      text("Qanday ishlaydi?", 160, 560, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. ORDER BY sotuvchi, summa DESC qatorlarni sotuvchilar", 160, 605, { size: 19, color: C.soft, fam: UI });
      text("   bo'yicha guruhlab, har birining ichida summani kamayish", 160, 638, { size: 19, color: C.soft, fam: UI });
      text("   tartibida saralab beradi.", 160, 670, { size: 19, color: C.soft, fam: UI });
      text("2. DISTINCT ON (sotuvchi) har bir sotuvchi guruhidan", 160, 715, { size: 19, color: C.purple, fam: UI });
      text("   FAQAT ENG BIRINCHI qatorni oladi, qolganlarini tashlaydi.", 160, 748, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("3. Natijada har bir sotuvchining eng yirik xaridi chiqadi!", 160, 795, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L4', 'distinkt'), 0.5);
    withA(k2, () => {
      const distOut = [
        "qollanma=# SELECT DISTINCT ON (sotuvchi)",
        "            sotuvchi, shahar, summa",
        "            FROM sotuvlar",
        "            ORDER BY sotuvchi, summa DESC;",
        "",
        " sotuvchi |  shahar   | summa ",
        "----------+-----------+-------",
        " Ali      | Toshkent  |   500  (300 o'rniga 500)",
        " Sobir    | Buxoro    |   900  (100 o'rniga 900)",
        " Vali     | Samarqand |   700  (200 o'rniga 700)",
        "(3 rows)",
        "",
        "-- Agar ORDER BY da summa DESC bo'lmasa,",
        "-- qaysi summa qolishi NOANIQ (tasodifiy) bo'ladi!"
      ];
      term(980, 220, 820, 750, "PostgreSQL 18.6 Terminali (DISTINCT ON)", [{
        b: {
          cmd: "psql -d qollanma",
          out: distOut.join('\n')
        }
      }], { font: 16, lh: 25 });
    });
  }

  // 5. COMMA TRAP & CONST SELECT
  function sCommaTrapDemo(t) {
    heading("Tushib Qolgan Vergul va Jadvalsiz SELECT", t, TM.scenes.comma_trap_demo.s);

    const k1 = P(t, W('L5', 'Vergul'), 0.5);
    withA(k1, () => {
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Tushib Qolgan Vergul Xatosi", 530, 270, C.red, k1, 20);

      text("SELECT sotuvchi shahar FROM sotuvlar WHERE id = 1;", 160, 335, { size: 18, color: C.red, fam: MONO });

      card(160, 375, 740, 130, { fill: '#fff2f2', col: C.red, p: k1 });
      text("Terminal natijasi:", 180, 410, { size: 18, weight: 700, color: C.red, fam: UI });
      text(" shahar ", 180, 445, { size: 18, color: C.soft, fam: MONO });
      text("--------", 180, 470, { size: 18, color: C.soft, fam: MONO });
      text(" Ali    <-- DIQQAT: shahar degan ustunda Ali chiqdi!", 180, 495, { size: 17, weight: 700, color: C.red, fam: MONO });

      text("Sababi: AS ixtiyoriy bo'lgani uchun baza shunday tushundi:", 160, 545, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("SELECT sotuvchi AS shahar FROM sotuvlar ...", 160, 580, { size: 18, color: C.blue, fam: MONO });
      text("Bitta vergul tushib qolsa, ikkita ustun o'rniga bitta ustun qaytadi,", 160, 625, { size: 19, color: C.soft, fam: UI });
      text("lekin sarlavhasi ikkinchi ustun nomi bilan chiqadi!", 160, 660, { size: 19, color: C.red, fam: UI });
      text("Tavsiya: Doim aniq 'AS' kalit so'zini yozing!", 160, 715, { size: 20, weight: 700, color: C.green, fam: UI });
    });

    const k2 = P(t, W('L5', 'jadvalsiz'), 0.5);
    withA(k2, () => {
      card(980, 220, 820, 750, { fill: C.card, col: C.blue, p: k2 });
      pill("Jadvalsiz (Konstanta) SELECT", 1390, 270, C.blue, k2, 20);

      text("PostgreSQL va SQLite da FROM shart emas:", 1020, 335, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1020, 375, 740, 160, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("SELECT 1 + 1 AS ikki, now() IS NOT NULL AS vaqt_bor;", 1040, 415, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("", 1040, 440, { size: 17, color: C.soft, fam: MONO });
      text(" ikki | vaqt_bor ", 1040, 465, { size: 18, color: C.soft, fam: MONO });
      text("------+----------", 1040, 490, { size: 18, color: C.soft, fam: MONO });
      text("    2 | t        ", 1040, 515, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("Qo'llanish o'rinlari:", 1020, 575, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Matematik hisob-kitoblar va formulalarni sinash", 1020, 615, { size: 19, color: C.soft, fam: UI });
      text("• Server sanasi va vaqtini tekshirish", 1020, 650, { size: 19, color: C.soft, fam: UI });
      text("• Mantiqiy ifodalarni (now() IS NOT NULL) tekshirish", 1020, 685, { size: 19, color: C.soft, fam: UI });
      text("• VALUES jadval ifodalarini generatsiya qilish", 1020, 720, { size: 19, color: C.soft, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: PostgreSQL 18 da SELECT Qoidalari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Selekt'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("SELECT Amaliy Qoidalari", 960, 270, C.blue, k1, 22);

      // 4 Summary Boxes
      card(160, 330, 360, 360, { fill: '#fff2f2', col: C.red, p: k1 });
      pill("1. WHERE & ALIAS", 340, 370, C.red, k1, 18);
      text("WHERE va HAVING", 340, 420, { size: 22, weight: 700, align: 'center', color: C.red, fam: UI });
      text("• Alias ishlatmang!", 180, 470, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• Ifodani takror yozing", 180, 510, { size: 18, color: C.soft, fam: UI });
      text("• Yoki WITH (CTE) ishlating", 180, 550, { size: 18, color: C.ink, fam: UI });
      text("• Bosqichlar farqini eslang", 180, 590, { size: 18, color: C.soft, fam: UI });

      card(550, 330, 360, 360, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("2. ORDER & GROUP", 730, 370, C.green, k1, 18);
      text("ORDER BY Alias", 730, 420, { size: 22, weight: 700, align: 'center', color: C.green, fam: UI });
      text("• Alias bemalol ishlaydi", 570, 470, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• Chunki oxirida bajariladi", 570, 510, { size: 18, color: C.soft, fam: UI });
      text("• ORDER BY 1, 2 ham mumkin", 570, 550, { size: 18, color: C.soft, fam: UI });
      text("• Lekin nom xavfsizroq", 570, 590, { size: 18, color: C.soft, fam: UI });

      card(940, 330, 360, 360, { fill: '#f6f9fc', col: C.blue, p: k1 });
      pill("3. AS KALIT SO'ZI", 1120, 370, C.blue, k1, 18);
      text("Verguldan Saqlanish", 1120, 420, { size: 22, weight: 700, align: 'center', color: C.blue, fam: UI });
      text("• Doim 'AS' yozing", 960, 470, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("• Vergul tushib qolsa,", 960, 510, { size: 18, color: C.soft, fam: UI });
      text("  xato darhol seziladi", 960, 545, { size: 18, color: C.green, fam: UI });
      text("• Kalit so'z to'qnashuvi", 960, 580, { size: 18, color: C.soft, fam: UI });
      text("  oldini oladi", 960, 615, { size: 18, color: C.soft, fam: UI });

      card(1330, 330, 360, 360, { fill: '#faf5ff', col: C.purple, p: k1 });
      pill("4. DISTINCT ON", 1510, 370, C.purple, k1, 18);
      text("Guruh Boshlig'i", 1510, 420, { size: 22, weight: 700, align: 'center', color: C.purple, fam: UI });
      text("• Eng katta/kichik qiymat", 1350, 470, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• ORDER BY bilan juftlikda", 1350, 510, { size: 18, color: C.soft, fam: UI });
      text("• 1-ustun bir xil bo'lsin", 1350, 550, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• PostgreSQL maxsus kuchi", 1350, 590, { size: 18, color: C.soft, fam: UI });

      sline(160, 720, 1760, 720, { col: C.rule, p: k1 });

      text("Keyingi qismda:", 160, 765, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("MySQL va SQLite dagi SELECT o'ziga xosliklarini, HAVING da alias ishlashini va kutilmagan farqlarni ko'ramiz.", 160, 810, { size: 20, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.alias_where_err.s) sIntro(t);
    else if (t < S.alias_order_ok.s) sAliasWhereErr(t);
    else if (t < S.distinct_on_demo.s) sAliasOrderOk(t);
    else if (t < S.comma_trap_demo.s) sDistinctOnDemo(t);
    else if (t < S.xulosa.s) sCommaTrapDemo(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.distinct_on_demo.s + 3.0;
    frame(t);
  };
})();
