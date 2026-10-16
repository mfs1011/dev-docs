// SQL 10-bob 3-qism: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("10-bob. 3-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("NULL va Tip Konversiyasi: Dialektlar", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL <=> operatori, WHERE satr = 0 va SQLite STRICT", 960, 395, { size: 40, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'farqlari'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: <=> operatori va CONCAT(NULL)", 460, 600, C.orange, kBadges, 24);
      pill("MySQL tuzog'i: satr ustun = 0", 960, 600, C.red, kBadges, 24);
      pill("SQLite: Dynamic affinity & STRICT", 1460, 600, C.green, kBadges, 24);
    });

    const kDesc = P(t, W('L1', 'nul'), 0.8);
    withA(kDesc, () => {
      card(200, 700, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Tizimlar orasidagi eng xavfli farqlar aynan NULL va tip konversiyasida yuzaga keladi:", 960, 760, { size: 27, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("MySQL da IS NOT DISTINCT FROM o'rniga <=> ishlatiladi, satr va 0 solishtiruvi barcha indekslarni o'ldiradi.", 960, 815, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("SQLite esa matndan sonni kesib oladi va faqat STRICT jadvallardagina qat'iy tekshiruv qiladi.", 960, 865, { size: 23, weight: 700, align: 'center', color: C.red, wrap: 1440 });
    });
  }

  // 2. MYSQL_NULL: <=> VA CONCAT
  function sMysqlNull(t) {
    heading("MySQL: NULL-xavfsiz Tenglik (<=>) va CONCAT", t, L('L2').s - 0.4);

    const k1 = P(t, W('L2', 'distinkt'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "MySQL 9.7: NULL solishtirish va CONCAT", [{
        b: {
          cmd: "SELECT 1 = NULL AS teng, NULL <=> NULL AS null_xavfsiz, 1 <=> NULL AS bir_null;\nSELECT CONCAT('Salom ', NULL) AS concat_null, CONCAT(2, ' ta') AS son_matn;",
          out: [
            "+------+--------------+----------+",
            "| teng | null_xavfsiz | bir_null |",
            "+------+--------------+----------+",
            "| NULL |            1 |        0 |",
            "+------+--------------+----------+",
            "",
            "+-------------+----------+",
            "| concat_null | son_matn |",
            "+-------------+----------+",
            "| NULL        | 2 ta     |",
            "+-------------+----------+"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'konkat'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.orange, p: k2 });
      hand("MySQL dagi Asosiy Farqlar", 1020, 290, { size: 28, color: C.orange, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("NULL-xavfsiz Tenglik: <=> operatori", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("MySQL da 'IS NOT DISTINCT FROM' sintaksisi yo'q!", 1050, 415, { size: 20, color: C.ink, wrap: 660 });
      text("Uning o'rniga <=> operatori yoziladi: NULL <=> NULL = 1 (TRUE).", 1050, 445, { size: 19, color: C.soft, wrap: 660 });
      text("1 <=> NULL esa 0 (FALSE) qaytaradi.", 1050, 470, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("CONCAT('Salom ', NULL)  -->  NULL", 1050, 540, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("MySQL CONCAT() funksiyasiga NULL kelsa, butun natija NULL bo'ladi!", 1050, 580, { size: 19, weight: 700, color: C.red, wrap: 660 });
      text("PostgreSQL da esa concat() NULL ni e'tiborsiz qoldirar edi.", 1050, 615, { size: 19, color: C.ink, wrap: 660 });
    });

    const k3 = P(t, W('L3', 'aylanadi'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.orange, p: k3 });
      text("Tavsiya: MySQL da matn ulashda COALESCE yoki CONCAT_WS ishlating!", 180, 755, { size: 25, weight: 700, color: C.orange });
      text("CONCAT_WS('', 'Salom ', NULL) yoki CONCAT('Salom ', COALESCE(ism, '')) NULL ni xavfsiz chetlab o'tadi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Aks holda bitta NULL sababli butun foydalanuvchi ma'lumotlari bo'shab qolishi mumkin.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 3. MYSQL_TRAP: WHERE SATR = 0
  function sMysqlTrap(t) {
    heading("MySQL: Satr Ustun va Nol Solishtiruvi — Eng Katta Tuzoq!", t, L('L4').s - 0.4);

    const k1 = P(t, W('L5', 'nolga'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "MySQL 9.7: WHERE c3 = 0 va WHERE c3 = '0'", [{
        b: {
          cmd: "CREATE TABLE t1 (c1 INT, c3 VARCHAR(25));\nINSERT INTO t1 VALUES (1, 'grape'), (2, 'apple'), (3, '0'), (4, '0abc');\nSELECT * FROM t1 WHERE c3 = 0;\nSELECT * FROM t1 WHERE c3 = '0';",
          out: [
            "+------+-------+",
            "| c1   | c3    |",
            "+------+-------+",
            "|    1 | grape |   -- 'grape' son sifatida 0 bo'ldi!",
            "|    2 | apple |   -- 'apple' son sifatida 0 bo'ldi!",
            "|    3 | 0     |",
            "|    4 | 0abc  |   -- '0abc' ham 0 bo'ldi!",
            "+------+-------+   -- BARCHA QATORLAR CHIQDI!",
            "",
            "+------+------+",
            "| c1   | c3   |    -- WHERE c3 = '0' to'g'ri:",
            "+------+------+",
            "|    3 | 0    |    -- faqat 1 ta qator!",
            "+------+------+"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L5', 'ishlamaydi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.red, p: k2 });
      hand("Nega Bu Qadar Xavfli?", 1020, 290, { size: 28, color: C.red, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("1. Barcha satrlar 0 ga aylanadi", 1050, 375, { size: 21, weight: 700, color: C.red });
      text("MySQL satr va sonni solishtirganda ikkalasini DOUBLE qiladi.", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("Raqam bilan boshlanmagan har qanday so'z 0 deb olinadi!", 1050, 445, { size: 19, color: C.soft, wrap: 660 });
      text("Natijada WHERE c3 = 0 deyarli butun jadvalni qaytaradi.", 1050, 470, { size: 19, color: C.red, weight: 700, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("2. Indeks Butunlay Ishlamay Qoladi!", 1050, 540, { size: 21, weight: 700, color: C.purple });
      text("Ustunga indeks qo'yilgan bo'lsa ham, baza har bir satrni songa o'girish uchun to'liq skan (Full Table Scan) qiladi.", 1050, 580, { size: 19, color: C.ink, wrap: 660 });
      text("Millionlab qatorli bazada tizim qotib qoladi!", 1050, 620, { size: 19, weight: 700, color: C.red, wrap: 660 });
    });

    const k3 = P(t, W('L6', 'saynd'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.red, p: k3 });
      text("MySQL da CAST farqlari:", 180, 755, { size: 25, weight: 700, color: C.red });
      text("• CAST('42' AS INTEGER) xato beradi! MySQL da SIGNED yoki UNSIGNED yozish shart.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("• CAST(3.7 AS SIGNED) qiymatni 4 ga yaxlitlaydi (SQLite esa 3 deb kesib tashlaydi).", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 4. SQLITE_STRICT
  function sSqliteStrict(t) {
    heading("SQLite: Dynamic Affinity va STRICT Jadvallar", t, L('L7').s - 0.4);

    const k1 = P(t, W('L7', 'kesib'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "SQLite 3.54: CAST va STRICT jadval", [{
        b: {
          cmd: "SELECT CAST('42abc' AS INTEGER) AS a, CAST(3.9 AS INTEGER) AS c;\nCREATE TABLE q (n INTEGER, m TEXT) STRICT;\nINSERT INTO q VALUES ('42', 'salom');\nINSERT INTO q VALUES ('abc', 'salom');",
          out: [
            "╭────┬───╮",
            "│ a  │ c │",
            "╞════╪═══╡",
            "│ 42 │ 3 │   -- '42abc' dan 42 olinib kesildi, 3.9 esa 3 bo'ldi!",
            "╰────┴───╯",
            "",
            "-- STRICT jadval sinovi:",
            "INSERT INTO q VALUES ('42', 'salom');  -- OK, '42' integer bo'ldi",
            "INSERT INTO q VALUES ('abc', 'salom');",
            "Error: cannot store TEXT value in INTEGER column q.n"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L8', 'rad'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.green, p: k2 });
      hand("SQLite da Tip Boshqaruvi", 1020, 290, { size: 28, color: C.green, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Standart SQLite: Juda Moslashuvchan", 1050, 375, { size: 21, weight: 700, color: C.blue });
      text("Tip ustunga emas, qiymatga tegishli (Dynamic Typing).", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("CAST('42abc' AS INTEGER) matnning boshidagi sonni ajratib oladi.", 1050, 445, { size: 19, color: C.soft, wrap: 660 });
      text("Agar umuman son bo'lmasa, 0 qaytaradi.", 1050, 470, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. STRICT Jadvallar (SQLite 3.37+)", 1050, 540, { size: 21, weight: 700, color: C.green });
      text("CREATE TABLE ... STRICT deb yaratilsa, tiplar qat'iylashadi.", 1050, 580, { size: 19, color: C.ink, wrap: 660 });
      text("Noto'g'ri qiymat kiritilsa, xuddi PostgreSQL kabi darhol xato beradi!", 1050, 615, { size: 19, weight: 700, color: C.green, wrap: 660 });
    });

    const k3 = P(t, W('L8', 'strikt'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Xulosa: SQLite da yangi loyiha boshlasangiz, doimo STRICT ishlating!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("STRICT jadvallar ma'lumotlarning buzilishini oldini oladi va PostgreSQL bilan to'liq muvofiqlikni ta'minlaydi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Ruxsat etilgan tiplar: INT, INTEGER, REAL, TEXT, BLOB, ANY.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 5. PITFALLS: 6 TA AMALIY TUZOQ
  function sPitfalls(t) {
    heading("Oltita Xavfli Amaliy Tuzoq", t, L('L9').s - 0.4);

    const k = P(t, W('L9', 'saqlaning'), 0.6);
    withA(k, () => {
      // 1-qator: 3 ta karta
      card(140, 230, 520, 220, { fill: C.card, col: C.red, p: k });
      text("1. WHERE ustun = NULL", 170, 275, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Hech qachon birorta ham qator qaytarmaydi!", 170, 315, { size: 20, color: C.ink, wrap: 460 });
      text("To'g'ri yo'l: WHERE ustun IS NULL", 170, 360, { size: 20, weight: 700, color: C.green, wrap: 460 });

      card(700, 230, 520, 220, { fill: C.card, col: C.red, p: k });
      text("2. WHERE ustun <> 'x'", 730, 275, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("NULL qatorlar avtomatik tushib qoladi!", 730, 315, { size: 20, color: C.ink, wrap: 460 });
      text("To'g'ri yo'l: IS DISTINCT FROM 'x'", 730, 360, { size: 20, weight: 700, color: C.green, wrap: 460 });

      card(1260, 230, 520, 220, { fill: C.card, col: C.red, p: k });
      text("3. NULL va '' bir xil deb bilish", 1290, 275, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Noma'lumlik va bo'sh matn butunlay boshqa.", 1290, 315, { size: 20, color: C.ink, wrap: 460 });
      text("IS NULL bo'sh satrni aslo topmaydi!", 1290, 360, { size: 20, weight: 700, color: C.green, wrap: 460 });

      // 2-qator: 3 ta karta
      card(140, 480, 520, 220, { fill: C.card, col: C.red, p: k });
      text("4. count(ustun) bilan sanash", 170, 525, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Ustundagi NULL qiymatlar sanalmaydi!", 170, 565, { size: 20, color: C.ink, wrap: 460 });
      text("To'g'ri yo'l: qatorlar uchun count(*)", 170, 610, { size: 20, weight: 700, color: C.green, wrap: 460 });

      card(700, 480, 520, 220, { fill: C.card, col: C.red, p: k });
      text("5. MySQL: WHERE matn = 0", 730, 525, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Barcha so'zlar 0 bo'lib chiqadi, indeks o'ladi!", 730, 565, { size: 20, color: C.ink, wrap: 460 });
      text("To'g'ri yo'l: WHERE matn = '0'", 730, 610, { size: 20, weight: 700, color: C.green, wrap: 460 });

      card(1260, 480, 520, 220, { fill: C.card, col: C.red, p: k });
      text("6. PostgreSQL: int4('7')", 1290, 525, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Ko'p so'zli tiplarda ishlamaydi.", 1290, 565, { size: 20, color: C.ink, wrap: 460 });
      text("To'g'ri yo'l: CAST(x AS ...) yoki x::tip", 1290, 610, { size: 20, weight: 700, color: C.green, wrap: 460 });

      // Pastki xulosa
      card(140, 730, 1640, 180, { fill: '#fff', col: C.blue, p: k });
      text("Ushbu 6 ta qoidaga rioya qilish ko'plab jiddiy xatolarning oldini oladi!", 180, 780, { size: 25, weight: 700, color: C.blue });
      text("SQL so'rovlarini yozishda har doim NULL mavjudligini hisobga oling va tiplarni aniq belgilang.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L10').s - 0.4);

    const k = P(t, W('L10', 'boshqarish'), 0.6);
    withA(k, () => {
      card(140, 230, 520, 480, { fill: C.card, col: C.blue, p: k });
      pill("1. POSTGRESQL", 400, 285, C.blue, k, 22);
      text("• Qat'iy tip xavfsizligi.", 170, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• IS DISTINCT FROM to'liq ishlaydi.", 170, 430, { size: 22, color: C.green, weight: 700, wrap: 460 });
      text("• text = integer xato beradi (xavfsiz).", 170, 510, { size: 22, color: C.blue, weight: 700, wrap: 460 });

      card(700, 230, 520, 480, { fill: C.card, col: C.orange, p: k });
      pill("2. MYSQL", 960, 285, C.orange, k, 22);
      text("• IS NOT DISTINCT FROM o'rniga <=>.", 730, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• CONCAT(..., NULL) butunlay NULL.", 730, 430, { size: 22, color: C.orange, weight: 700, wrap: 460 });
      text("• WHERE matn = 0 xavfidan saqlaning!", 730, 510, { size: 22, color: C.red, weight: 700, wrap: 460 });

      card(1260, 230, 520, 480, { fill: C.card, col: C.green, p: k });
      pill("3. SQLITE", 1520, 285, C.green, k, 22);
      text("• Dynamic Affinity boshqaruvi.", 1290, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• CAST('42abc' AS INT) = 42 (kesadi).", 1290, 430, { size: 22, color: C.blue, weight: 700, wrap: 460 });
      text("• Yangi jadvallarda STRICT ishlating.", 1290, 510, { size: 22, color: C.green, weight: 700, wrap: 460 });

      card(140, 740, 1640, 170, { fill: '#fff', col: C.blue, p: k });
      text("10-bob yakuni:", 180, 790, { size: 25, weight: 700, color: C.blue });
      text("Keyingi 11-bobda matnlarni kodlash, collation va tartiblash qoidalari bilan tanishamiz.", 180, 840, { size: 22, color: C.ink, wrap: 1560 });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.mysql_null.s) sIntro(t);
    else if (t < TM.scenes.mysql_trap.s) sMysqlNull(t);
    else if (t < TM.scenes.sqlite_strict.s) sMysqlTrap(t);
    else if (t < TM.scenes.pitfalls.s) sSqliteStrict(t);
    else if (t < TM.scenes.xulosa.s) sPitfalls(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("10-bob: NULL va Tip Konversiyasi — Dialektlar", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("PostgreSQL, MySQL va SQLite solishtiruvi hamda 6 ta xavfli tuzoq", 960, 290, { size: 38, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("PostgreSQL", 180, 440, { size: 32, color: C.blue });
    text("• Standartga qat'iy sodiq\n• IS DISTINCT FROM\n• concat('a', NULL) -> 'a'\n• text = int -> ERROR\n• Yashirin o'girish yo'q", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("STRICT SAFETY", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.orange });
    hand("MySQL", 750, 440, { size: 32, color: C.orange });
    text("• <=> operatori\n• CONCAT(a, NULL) -> NULL\n• WHERE matn = 0 xavfi!\n• Indeks ishlamay qolishi\n• CAST(... AS SIGNED)", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("MYSQL OPERATORS", 960, 820, C.orange, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("SQLite", 1320, 440, { size: 32, color: C.green });
    text("• Dynamic Affinity\n• CAST boshini oladi ('42')\n• CAST(3.9 AS INT) -> 3\n• STRICT jadvallar\n• Tez va yengil", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("SQLITE STRICT", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
