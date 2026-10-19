// SQL 32-bob 1-qism: "Tushuncha" — Shartli ifodalar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. KIRISH
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("32-bob. Shartli Ifodalar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da If / Else Mexanizmlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CASE, COALESCE, NULLIF hamda GREATEST va LEAST ifodalarining mohiyati", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'keys,'), 0.8);
    withA(kCards, () => {
      const items = [
        {
          name: "CASE",
          tag: "Umumiy Shartlar",
          col: C.blue,
          points: [
            "• Dasturlashdagi if / else",
            "• Ketma-ket tekshirish",
            "• Birinchi rost shartda to'xtash",
            "• SELECT, WHERE, ORDER BY da",
          ]
        },
        {
          name: "COALESCE",
          tag: "Birinchi Mavjud",
          col: C.green,
          points: [
            "• Birinchi NOT NULL qiymat",
            "• NULL o'rniga sukut berish",
            "• Arifmetikada NULL himoyasi",
            "• Faqat kerakligini hisoblaydi",
          ]
        },
        {
          name: "NULLIF",
          tag: "Teng Bo'lsa NULL",
          col: C.orange,
          points: [
            "• a = b bo'lsa -> NULL",
            "• Nolga bo'lishdan saqlanish",
            "• Bo'sh satrni NULL qilish",
            "• COALESCE ning teskarisi",
          ]
        },
        {
          name: "GREATEST / LEAST",
          tag: "Qatordagi Max / Min",
          col: C.purple,
          points: [
            "• Bir qator ichida solishtirish",
            "• Agregat emas, skalyar",
            "• 2 yoki undan ortiq ustun",
            "• NULL bo'yicha dialekt farqlari",
          ]
        },
      ];

      items.forEach((item, i) => {
        const bx = 80 + i * 445;
        card(bx, 440, 420, 500, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + 210, 490, item.col, kCards, 22);
        pill(item.tag, bx + 210, 540, '#64748b', kCards, 16);

        item.points.forEach((pt, pi) => {
          text(pt, bx + 30, 615 + pi * 60, { size: 19, weight: 600, color: C.ink, fam: UI });
        });
      });
    });
  }

  // 2. CASE IFODASI
  function sCase(t) {
    heading("CASE Ifodasi: Umumiy Shakl va Qisqa Tutashuv", t, TM.scenes.case_ifodasi.s);

    const k = P(t, TM.scenes.case_ifodasi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Syntax & Structure
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. Umumiy va Oddiy Shakllar", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- 1. Umumiy shakl (Har xil shartlar):", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("CASE WHEN narx >= 50000 THEN 'qimmat'", 170, 395, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("     WHEN narx >= 10000 THEN 'o''rta'", 170, 435, { size: 18, color: '#86efac', fam: MONO });
      text("     ELSE 'arzon'", 170, 475, { size: 18, color: '#fbbf24', fam: MONO });
      text("END AS toifa", 170, 515, { size: 18, color: '#fff', fam: MONO });

      card(140, 580, 760, 170, { fill: '#eff6ff', col: C.blue, p: k });
      text("-- 2. Oddiy shakl (Bitta ifodani solishtirish):", 170, 620, { size: 17, color: '#64748b', fam: MONO });
      text("CASE id WHEN 1 THEN 'bir' WHEN 2 THEN 'ikki'", 170, 665, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("        ELSE 'boshqa' END", 170, 705, { size: 18, color: C.ink, fam: MONO });

      card(140, 780, 760, 150, { fill: '#f0fdf4', col: C.green, p: k });
      text("Diqqat: Agar ELSE yozilmasa va hech bir shart mos", 170, 825, { size: 18, color: C.ink, fam: UI });
      text("kelmasa, sukut bo'yicha NULL qaytadi!", 170, 870, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: Execution rule & Short circuit
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. Qisqa Tutashuv (Short-Circuit)", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("Ketma-ket bajarilish qoidasi:", 1070, 350, { size: 18, color: '#86efac', fam: UI });
      text("1. Shartlar yuqoridan pastga qat'iy tartibda tekshiriladi.", 1070, 395, { size: 17, color: '#fff', fam: UI });
      text("2. BIRINCHI rost (TRUE) shart topilgach,", 1070, 440, { size: 18, weight: 700, color: '#fbbf24', fam: UI });
      text("   uning THEN qiymati olinadi va CASE to'xtaydi!", 1070, 480, { size: 18, weight: 700, color: '#fbbf24', fam: UI });
      text("3. Qolgan WHEN tarmoqlari umuman tekshirilmaydi.", 1070, 520, { size: 17, color: '#94a3b8', fam: UI });

      card(1040, 580, 740, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Shartlar tartibi nihoyatda muhim!", 1070, 620, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("Har doim eng tor shartdan keng shartga qarab yozing.", 1070, 665, { size: 17, color: C.ink, fam: UI });
      text("Agar >= 10000 ni >= 50000 dan oldin qo'ysangiz,", 1070, 705, { size: 17, color: C.ink, fam: UI });
      text("85000 ham 'o'rta' bo'lib ketadi va 50000 ga hech yetmaydi!", 1070, 740, { size: 17, weight: 700, color: C.red, fam: UI });

      card(1040, 790, 740, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("Nolga bo'lishdan himoya:", 1070, 835, { size: 18, weight: 700, color: C.green, fam: UI });
      text("CASE WHEN x <> 0 THEN y / x ELSE NULL END", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: MONO });
    });
  }

  // 3. NULL TUZOG'I
  function sNullTrap(t) {
    heading("NULL Tuzog'i: Nega = NULL Hech Qachon Ishlamaydi?", t, TM.scenes.null_tuzogi.s);

    const k = P(t, TM.scenes.null_tuzogi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: The Mistake (= NULL)
      card(100, 200, 840, 760, { fill: '#fff5f5', col: C.red, p: k });
      pill("XATO USUL: = NULL Bilan Solishtirish", 520, 250, C.red, k, 18);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("-- Katta xato keltirib chiqaruvchi kod:", 170, 350, { size: 17, color: '#fca5a5', fam: MONO });
      text("SELECT nom,", 170, 395, { size: 18, color: '#fff', fam: MONO });
      text("       CASE WHEN chegirma = NULL", 170, 435, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("            THEN 'yo''q' ELSE 'bor' END AS xato", 170, 475, { size: 18, color: '#fff', fam: MONO });

      card(140, 540, 760, 210, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("Natija: Hamma qatorda 'bor' chiqadi!", 170, 585, { size: 21, weight: 700, color: '#fca5a5', fam: UI });
      text("Nega? SQL da NULL bilan har qanday tenglik:", 170, 630, { size: 18, color: '#fff', fam: UI });
      text("NULL = NULL  -->  NULL (Noma'lum, rost emas!)", 170, 675, { size: 19, weight: 700, color: '#fca5a5', fam: MONO });
      text("Shart rost bo'lmagani uchun doimo ELSE qismiga tushadi.", 170, 720, { size: 17, color: '#cbd5e1', fam: UI });

      card(140, 780, 760, 150, { fill: '#fffbeb', col: C.orange, p: k });
      text("Shuningdek oddiy CASE da ham: CASE chegirma WHEN NULL ...", 170, 825, { size: 17, color: C.ink, fam: MONO });
      text("hech qachon ishlamaydi, chunki u ichkarida = ishlatadi!", 170, 870, { size: 17, weight: 700, color: C.red, fam: UI });

      // Right: The Correct Way (IS NULL)
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("TO'G'RI USUL: Doimo IS NULL Ishlatish", 1410, 250, C.green, k, 18);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- To'g'ri va ishonchli yozilishi:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT nom,", 1070, 395, { size: 18, color: '#fff', fam: MONO });
      text("       CASE WHEN chegirma IS NULL", 1070, 435, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("            THEN 'yo''q' ELSE 'bor' END AS togri", 1070, 475, { size: 18, color: '#fff', fam: MONO });

      card(1040, 540, 740, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Haqiqiy natija (Barcha tizimda bir xil):", 1070, 580, { size: 18, color: '#94a3b8', fam: MONO });
      text("Daftar:  chegirma = NULL  -->  'yo''q'", 1070, 625, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("Ruchka:  chegirma = 500   -->  'bor'", 1070, 665, { size: 18, color: '#93c5fd', fam: MONO });
      text("Kitob:   chegirma = 0     -->  'bor'", 1070, 705, { size: 18, color: '#93c5fd', fam: MONO });

      card(1040, 780, 740, 150, { fill: '#f0fdf4', col: C.green, p: k });
      text("ESDA TUTING: NULL mavjud emaslik holatidir.", 1070, 825, { size: 19, weight: 700, color: C.green, fam: UI });
      text("Uni faqat IS NULL yoki IS NOT NULL bilan tekshiring!", 1070, 870, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. COALESCE VA NULLIF
  function sCoalesceNullif(t) {
    heading("COALESCE va NULLIF: Birinchi Mavjud va Bo'shatish", t, TM.scenes.coalesce_va_nullif.s);

    const k = P(t, TM.scenes.coalesce_va_nullif.s + 0.3, 0.8);
    withA(k, () => {
      // Left: COALESCE
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("1. COALESCE(a, b, c, ...)", 520, 250, C.green, k, 19);

      card(140, 310, 760, 210, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Sukutdagi matnni tanlash:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT COALESCE(tavsif, qisqa, '(yo''q)')", 170, 395, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("-- Arifmetikada NULL ni 0 ga almashtirish:", 170, 440, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT narx - COALESCE(chegirma, 0) AS yakuniy", 170, 480, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });

      card(140, 550, 760, 200, { fill: '#f0fdf4', col: C.green, p: k });
      text("Nega COALESCE shart?", 170, 595, { size: 21, weight: 700, color: C.green, fam: UI });
      text("SQL da har qanday amal: 12000 - NULL  -->  NULL!", 170, 640, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("Chegirma yo'q bo'lsa butun yakuniy narx yo'qolib ketmasligi", 170, 685, { size: 17, color: C.ink, fam: UI });
      text("uchun COALESCE(chegirma, 0) bilan nol deb olinadi.", 170, 720, { size: 17, color: C.ink, fam: UI });

      card(140, 780, 760, 150, { fill: '#eff6ff', col: C.blue, p: k });
      text("Standart funksiya: MySQL dagi IFNULL va", 170, 825, { size: 18, color: C.ink, fam: UI });
      text("Oracle dagi NVL o'rnini bosuvchi universal standartdir.", 170, 865, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: NULLIF
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("2. NULLIF(a, b)", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 210, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Nolga bo'lishdan to'liq himoya:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT 1000000 / NULLIF(narx, 0) AS nisbat", 1070, 395, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("-- Bo'sh satrni NULL ga aylantirish:", 1070, 440, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT NULLIF(qisqa, '') AS toza_qisqa", 1070, 480, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(1040, 550, 740, 200, { fill: '#fffbeb', col: C.orange, p: k });
      text("Nolga bo'lish muammosi va yechimi:", 1070, 595, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("PostgreSQL da 1000000 / 0  -->  ERROR: division by zero!", 1070, 640, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("NULLIF(narx, 0) berilsa narx=0 bo'lsa NULL bo'ladi,", 1070, 685, { size: 17, color: C.ink, fam: UI });
      text("1000000 / NULL esa xatosiz NULL qaytaradi!", 1070, 720, { size: 18, weight: 700, color: C.green, fam: MONO });

      card(1040, 780, 740, 150, { fill: '#f0fdf4', col: C.green, p: k });
      text("COALESCE va NULLIF birgalikda:", 1070, 825, { size: 19, weight: 700, color: C.green, fam: UI });
      text("COALESCE(NULLIF(x, ''), 'sukut') -- bo'sh satrni ham ushlaydi!", 1070, 865, { size: 17, weight: 700, color: C.blue, fam: MONO });
    });
  }

  // 5. GREATEST VA LEAST
  function sGreatestLeast(t) {
    heading("GREATEST va LEAST: Qatordagi Solishtirish", t, TM.scenes.greatest_va_least.s);

    const k = P(t, TM.scenes.greatest_va_least.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Concept
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("Skalyar vs Agregat Solishtirish", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT GREATEST(narx, eski_narx) AS katta,", 170, 355, { size: 19, weight: 700, color: '#c084fc', fam: MONO });
      text("       LEAST(narx, eski_narx)    AS kichik", 170, 400, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar;", 170, 445, { size: 18, color: '#fff', fam: MONO });
      text("-- Har bir qatordagi narx va eski_narx solishtiriladi.", 170, 490, { size: 16, color: '#94a3b8', fam: MONO });

      card(140, 560, 760, 200, { fill: '#faf5ff', col: C.purple, p: k });
      text("Agregat MAX/MIN bilan adashtirmang!", 170, 605, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• MAX(narx) — jadvaldagi barcha QATORLAR bo'ylab eng katta.", 170, 655, { size: 17, color: C.ink, fam: UI });
      text("• GREATEST(a, b, c) — bitta qatordagi USTUNLAR ichida eng katta.", 170, 705, { size: 17, weight: 700, color: C.blue, fam: UI });
      text("Qatorlar soni o'zgarmaydi, har qatorda hisoblanadi.", 170, 750, { size: 17, color: C.soft, fam: UI });

      card(140, 790, 760, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("Xulosa: SQL shartli ifodalari ma'lumotlarni", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("baza darajasida o'zgartirish va tozalashda asosiy quroldir.", 170, 875, { size: 18, weight: 700, color: C.green, fam: UI });

      // Right: NULL handling differences
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("NULL Bo'yicha Tizimlar Farqi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Ruchka: narx=3000, eski_narx=NULL", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("GREATEST(3000, NULL) natijasi:", 1070, 395, { size: 18, color: '#fff', fam: MONO });
      text("PostgreSQL:  3000  (NULL e'tiborga olinmaydi)", 1070, 445, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("MySQL:       NULL  (Bitta NULL kelsa -> NULL!)", 1070, 485, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("SQLite:      NULL  (max(3000, NULL) -> NULL)", 1070, 525, { size: 18, weight: 700, color: '#c084fc', fam: MONO });

      card(1040, 570, 740, 190, { fill: '#fffbeb', col: C.orange, p: k });
      text("Standart SQL talabi:", 1070, 610, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("SQL standartiga ko'ra bitta argument NULL bo'lsa,", 1070, 655, { size: 17, color: C.ink, fam: UI });
      text("natija ham NULL bo'lishi kerak (MySQL va SQLite standartga mos).", 1070, 695, { size: 17, color: C.ink, fam: UI });
      text("PostgreSQL esa qulaylik uchun NULL ni o'tkazib yuboradi.", 1070, 735, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(1040, 790, 740, 140, { fill: '#eff6ff', col: C.blue, p: k });
      text("Portativ yozish qoidasi:", 1070, 835, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("GREATEST(narx, COALESCE(eski_narx, narx)) -- universal!", 1070, 875, { size: 17, weight: 700, color: C.green, fam: MONO });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.case_ifodasi.s) {
      sIntro(t);
    } else if (t < TM.scenes.null_tuzogi.s) {
      sCase(t);
    } else if (t < TM.scenes.coalesce_va_nullif.s) {
      sNullTrap(t);
    } else if (t < TM.scenes.greatest_va_least.s) {
      sCoalesceNullif(t);
    } else {
      sGreatestLeast(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
