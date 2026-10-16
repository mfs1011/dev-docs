// SQL 10-bob 2-qism: "Kod" — PostgreSQL 18 da jonli amallar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY?.pg || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("10-bob. 2-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL Terminalida Jonli Kod", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("NULL solishtirish, IS DISTINCT FROM, agregatsiya va CAST", 960, 395, { size: 40, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kTerm = P(t, W('L1', 'terminalida'), 0.8);
    withA(kTerm, () => {
      // Chap: Terminal
      term(140, 480, 800, 440, "psql: PostgreSQL 18.6", [{
        b: {
          cmd: "SELECT 'PostgreSQL 18.6: NULL va CAST sinovlari' AS holat;",
          out: [
            "                   holat                   ",
            "-------------------------------------------",
            " PostgreSQL 18.6: NULL va CAST sinovlari   ",
            "(1 row)"
          ]
        },
        t: kTerm,
        typeDur: 1.0
      }], { font: 16 });

      // O'ng: Reja kartasi
      card(980, 480, 800, 440, { fill: C.card, col: C.blue, p: kTerm });
      pill("JONLI SINAYDIGAN MAVZULARIMIZ", 1280, 535, C.blue, kTerm, 22);
      text("• 7 = NULL va NULL = NULL nega bo'sh chiqadi?", 1020, 605, { size: 23, color: C.ink, wrap: 720 });
      text("• Jadvalda WHERE tel <> '+998...' nega Sobirni tashlab ketdi?", 1020, 660, { size: 23, weight: 700, color: C.red, wrap: 720 });
      text("• count(*) va count(ustun) o'rtasidagi asosiy farq.", 1020, 715, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("• text = integer solishtirganda qat'iy tip xatosi.", 1020, 770, { size: 22, color: C.soft, wrap: 720 });
    });
  }

  // 2. NULL TAQQOSLASH
  function sNullCmp(t) {
    heading("NULL Bilan Taqqoslash va Predikatlar", t, L('L2').s - 0.4);

    const k1 = P(t, W('L2', 'barobar'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: 7 = NULL va NULL = NULL", [{
        b: {
          cmd: "SELECT 7 = NULL AS teng, 7 <> NULL AS teng_emas, NULL = NULL AS null_null;\nSELECT NULL IS NULL AS a, 7 IS DISTINCT FROM NULL AS b, NULL IS NOT DISTINCT FROM NULL AS c;",
          out: [
            " teng | teng_emas | null_null ",
            "------+-----------+-----------",
            "      |           | ",
            "(1 row)",
            "",
            " a | b | c ",
            "---+---+---",
            " t | t | t",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L3', 'tru'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Taqqoslash Natijasi Tahlili", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 140, { fill: '#fff', col: C.red, p: k2 });
      text("7 = NULL va NULL = NULL  -->  NULL", 1050, 380, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("psql terminalida ustunlar bo'sh chiqdi!", 1050, 420, { size: 21, weight: 700, color: C.ink, wrap: 660 });
      text("Ikki noma'lum qiymatning tengligi doim noma'lum.", 1050, 450, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 490, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("IS NULL va IS DISTINCT FROM  -->  't' (TRUE)", 1050, 535, { size: 22, fam: MONO, weight: 700, color: C.green });
      text("Predikatlar uch qiymatli emas, ikki qiymatli rost qaytaradi.", 1050, 580, { size: 20, color: C.ink, wrap: 660 });
      text("NULL tekshirishda faqat shu predikatlar ishonchli!", 1050, 615, { size: 19, weight: 700, color: C.blue, wrap: 660 });
    });

    const k3 = P(t, W('L3', 'distinkt'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.blue, p: k3 });
      text("Eslab qoling: PostgreSQL da 't' harfi TRUE (rost) deganidir!", 180, 755, { size: 25, weight: 700, color: C.blue });
      text("Oddiy taqqoslashda NULL qatnashsa, natija hech qachon 't' bo'lmaydi va WHERE filtri uni o'tkazmaydi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Predikatlar esa NULL ni to'g'ri idrok qiladi va barqaror rost yoki yolg'on qaytaradi.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 3. JADVALDA NULL VA IS DISTINCT FROM
  function sJadvalNull(t) {
    heading("Jadvalda NULL va IS DISTINCT FROM", t, L('L4').s - 0.4);

    const k1 = P(t, W('L4', 'kiritamiz'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "2. psql: Telefonlar jadvali va WHERE", [{
        b: {
          cmd: "SELECT ism FROM telefonlar WHERE tel = NULL;\nSELECT ism FROM telefonlar WHERE tel <> '+998901234567';\nSELECT ism FROM telefonlar WHERE tel IS DISTINCT FROM '+998901234567';",
          out: [
            " ism \n-----",
            "(0 rows)   -- WHERE tel = NULL hech narsa topmadi!",
            "",
            " ism \n-----",
            " Vali      -- Qani Sobir?! NULL bo'lgani uchun tushib qoldi",
            "(1 row)",
            "",
            "  ism  \n-------",
            " Vali",
            " Sobir     -- IS DISTINCT FROM Sobirni ham topdi!",
            "(2 rows)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L5', 'ro‘yxatga'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.red, p: k2 });
      hand("Nega Sobir Chiqmay Qoldi?", 1020, 290, { size: 28, color: C.red, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("WHERE tel <> '+998901234567'", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("Sobirning telefoni NULL (noma'lum).", 1050, 415, { size: 20, weight: 700, color: C.ink, wrap: 660 });
      text("NULL <> '+998...' amali NULL natijasini berdi.", 1050, 445, { size: 19, color: C.soft, wrap: 660 });
      text("WHERE esa NULL qatorlarni o'tkazmaydi!", 1050, 470, { size: 19, color: C.red, weight: 700, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("WHERE tel IS DISTINCT FROM '+998...'", 1050, 540, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("IS DISTINCT FROM operatori NULL ni alohida qiymatdek ko'radi.", 1050, 580, { size: 20, color: C.ink, wrap: 660 });
      text("Sobirning NULL raqami Alinikidan farq qiladi deb topildi!", 1050, 615, { size: 19, weight: 700, color: C.blue, wrap: 660 });
    });

    const k3 = P(t, W('L6', 'topiladi'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Amaliy qoida: 'Alidan boshqalar' deyilganda diqqat qiling!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("Oddiy <> yozsangiz, bazadagi NULL qatorlar hisobotdan yoki ro'yxatdan tushib qoladi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Barcha farqli qiymatlarni (shu jumladan NULL ni) qamrab olish uchun doimo IS DISTINCT FROM ishlating.", 180, 855, { size: 21, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 4. AGREGATSIYA VA MATN ULASH
  function sNullExpr(t) {
    heading("Ifodalarda NULL va Agregatsiya", t, L('L7').s - 0.4);

    const k1 = P(t, W('L7', 'kaunt'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "3. psql: count(*) vs count(tel) va concat", [{
        b: {
          cmd: "SELECT count(*) AS hammasi, count(tel) AS tel_bor FROM telefonlar;\nSELECT 1 + NULL AS yigindi, 'Salom ' || NULL AS ulash, concat('Salom ', NULL) AS concat_bilan;",
          out: [
            " hammasi | tel_bor ",
            "---------+---------",
            "       3 |       2    -- Sobir NULL bo'lgani uchun sanalmadi!",
            "(1 row)",
            "",
            " yigindi | ulash | concat_bilan ",
            "---------+-------+--------------",
            "         |       | Salom ",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L8', 'konkat'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.blue, p: k2 });
      hand("Agregatsiya va Matn Qoidalari", 1020, 290, { size: 28, color: C.blue, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("count(*)  vs  count(ustun)", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.purple });
      text("count(*) jadvallardagi barcha qatorlarni sanaydi (3 ta).", 1050, 415, { size: 20, color: C.ink, wrap: 660 });
      text("count(ustun) esa faqat NULL bo'lmagan qiymatlarni sanaydi (2 ta).", 1050, 450, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("|| operatori  vs  concat() funksiyasi", 1050, 540, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("'Salom ' || NULL butun natijani NULL qilib yuboradi.", 1050, 580, { size: 20, color: C.ink, wrap: 660 });
      text("concat('Salom ', NULL) esa NULL ni tashlab, 'Salom' qaytaradi!", 1050, 615, { size: 19, weight: 700, color: C.green, wrap: 660 });
    });

    const k3 = P(t, W('L8', 'ulaydi'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.purple, p: k3 });
      text("Muhim: Foydalanuvchi ism-familiyasini ulaganda concat() ishlating!", 180, 755, { size: 25, weight: 700, color: C.purple });
      text("Agar otasining ismi NULL bo'lsa, 'ism || ota_ismi' butunlay bo'sh bo'lib qoladi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("concat(ism, ' ', ota_ismi) esa xavfsiz ishlaydi va mavjud qismlarni to'g'ri birlashtiradi.", 180, 855, { size: 21, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 5. TIP KONVERSIYASI VA XATOLAR
  function sTypeConv(t) {
    heading("Aniq va Yashirin Tip Konversiyasi", t, L('L9').s - 0.4);

    const k1 = P(t, W('L9', 'int'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "4. psql: CAST va xatolar", [{
        b: {
          cmd: "SELECT '42'::int + 1 AS a, 1 + '1' AS literal;\nSELECT 1 + '1.5';\nSELECT n FROM sonlar WHERE t = n;",
          out: [
            " a  | literal ",
            "----+---------",
            " 43 |       2   -- '42'::int va '1' noma'lum literal ishladi!",
            "(1 row)",
            "",
            "ERROR:  invalid input syntax for type integer: \"1.5\"",
            "",
            "ERROR:  operator does not exist: text = integer",
            "HINT:   You might need to add explicit type casts."
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L10', 'xato'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("PostgreSQL Tiplash Siyosati", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("Noma'lum Literallar (unknown literal)", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Tirnoqdagi '1' tipi oldindan aniq emas, shuning uchun kontekstga qarab moslashadi.", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("1 + '1' = 2 bo'lib ishlashi shundan.", 1050, 455, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("Ustundagi Matn vs Son: Qat'iy Xato!", 1050, 540, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("WHERE t = n solishtiruvida PostgreSQL yashirin o'girmaydi.", 1050, 580, { size: 19, color: C.ink, wrap: 660 });
      text("To'g'ri yozuv: WHERE t = n::text yoki WHERE t::int = n", 1050, 615, { size: 19, fam: MONO, weight: 700, color: C.blue, wrap: 660 });
    });

    const k3 = P(t, W('L11', 'operator'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.red, p: k3 });
      text("Ogohlantirish: MySQL kabi boshqa tizimlarda bu xato bermaydi!", 180, 755, { size: 25, weight: 700, color: C.red });
      text("Boshqa bazalar matnni jimgina songa aylantirib, kutilmagan natijalar va indeks buzilishiga olib keladi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("PostgreSQL'ning qat'iy xato berishi — bu kamchilik emas, eng katta xavfsizlik afzalligidir.", 180, 855, { size: 21, weight: 700, color: C.green, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L12').s - 0.4);

    const k = P(t, W('L12', 'kast'), 0.6);
    withA(k, () => {
      card(140, 230, 520, 480, { fill: C.card, col: C.blue, p: k });
      pill("1. TAQQOSLASH", 400, 285, C.blue, k, 22);
      text("• 7 = NULL bo'sh (NULL) qaytaradi.", 170, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• WHERE tel = NULL hech qachon ishlamaydi.", 170, 430, { size: 22, color: C.red, weight: 700, wrap: 460 });
      text("• IS NULL va IS DISTINCT FROM ishlating.", 170, 510, { size: 22, color: C.green, weight: 700, wrap: 460 });

      card(700, 230, 520, 480, { fill: C.card, col: C.purple, p: k });
      pill("2. AGREGATSIYA", 960, 285, C.purple, k, 22);
      text("• count(*) qatorlar sonini to'liq sanaydi.", 730, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• count(ustun) NULL larni tashlab ketadi.", 730, 430, { size: 22, color: C.purple, weight: 700, wrap: 460 });
      text("• Matn ulashda xavfsiz concat() ishlating.", 730, 510, { size: 22, color: C.ink, wrap: 460 });

      card(1260, 230, 520, 480, { fill: C.card, col: C.green, p: k });
      pill("3. QAT'IY KAST", 1520, 285, C.green, k, 22);
      text("• CAST(x AS tip) yoki x::tip ishlating.", 1290, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• text ustunni songa aniq o'giring.", 1290, 430, { size: 22, color: C.blue, weight: 700, wrap: 460 });
      text("• Yashirin konversiyaga suyanmang.", 1290, 510, { size: 22, color: C.green, weight: 700, wrap: 460 });

      card(140, 740, 1640, 170, { fill: '#fff', col: C.blue, p: k });
      text("Keyingi qismda: Dialektlar taqqoslash doskasi!", 180, 790, { size: 25, weight: 700, color: C.blue });
      text("MySQL <=> operatori, WHERE satr = 0 falokati va SQLite STRICT jadvallari bilan tanishamiz.", 180, 840, { size: 22, color: C.ink, wrap: 1560 });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.null_cmp.s) sIntro(t);
    else if (t < TM.scenes.jadval_null.s) sNullCmp(t);
    else if (t < TM.scenes.null_expr.s) sJadvalNull(t);
    else if (t < TM.scenes.type_conv.s) sNullExpr(t);
    else if (t < TM.scenes.xulosa.s) sTypeConv(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("10-bob: NULL va Tip Konversiyasi — Kod", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("PostgreSQL 18 psql da jonli sinovlar va qat'iy tip tekshiruvi", 960, 290, { size: 38, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("Taqqoslash", 180, 440, { size: 32, color: C.blue });
    text("• 7 = NULL -> NULL\n• NULL = NULL -> NULL\n• IS NULL -> 't'\n• IS DISTINCT FROM\n• WHERE tel = NULL bo'sh", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("NULL COMPARISON", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("Ifodalar & Agregatsiya", 750, 440, { size: 32, color: C.purple });
    text("• count(*) -> barcha qatorlar\n• count(col) -> faqat NOT NULL\n• 1 + NULL -> NULL\n• 'Salom ' || NULL -> NULL\n• concat('Salom', NULL) OK", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("EXPRESSIONS & COUNT", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("CAST & Qat'iy Xato", 1320, 440, { size: 32, color: C.green });
    text("• '42'::int + 1 -> 43\n• 1 + '1' -> 2 (literal)\n• 1 + '1.5' -> ERROR\n• text = integer -> ERROR\n• Aniq tip ko'rsatish shart", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("TYPE SAFETY", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
