// SQL 32-bob 3-qism: "Dialektlar" — MySQL va SQLite da Shartli ifodalar
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
    hand("32-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Shartli Ifodalar", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("GREATEST da NULL, IF va iif qisqartmalari hamda nolga bo'lish farqlari", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Keys,'), 0.8);
    withA(kCards, () => {
      const engines = [
        {
          name: "PostgreSQL 18",
          badge: "Qat'iy va Standart",
          col: C.blue,
          points: [
            "• Standart CASE, COALESCE, NULLIF",
            "• GREATEST NULL ni e'tiborsiz qoldiradi",
            "• IF va IFNULL funksiyalari yo'q",
            "• Nolga bo'lish qat'iy XATO beradi",
          ]
        },
        {
          name: "MySQL 8.0+",
          badge: "Qulay Qisqartmalar",
          col: C.green,
          points: [
            "• GREATEST bitta NULL bo'lsa -> NULL",
            "• IF(shart, a, b) va IFNULL mavjud",
            "• Nolga bo'lish: NULL + Warning 1365",
            "• CASE tiplari erkinroq (VARCHAR)",
          ]
        },
        {
          name: "SQLite 3.35+",
          badge: "max/min va iif()",
          col: C.purple,
          points: [
            "• GREATEST yo'q, ko'p argumentli max()",
            "• iif() ixcham CASE ekvivalenti",
            "• Nolga bo'lish jimgina NULL beradi",
            "• Tiplar dinamik, xato bermaydi",
          ]
        },
      ];

      engines.forEach((item, i) => {
        const bx = 100 + i * 585;
        card(bx, 440, 555, 500, { fill: C.card, col: item.col, p: kCards });
        pill(item.name, bx + 277, 490, item.col, kCards, 22);
        pill(item.badge, bx + 277, 540, '#64748b', kCards, 16);

        item.points.forEach((pt, pi) => {
          text(pt, bx + 35, 615 + pi * 60, { size: 19, weight: 600, color: C.ink, fam: UI });
        });
      });
    });
  }

  // 2. GREATEST VA NULL FARQI
  function sGreatestNull(t) {
    heading("GREATEST va NULL: Standart va PostgreSQL Farqi", t, TM.scenes.greatest_null_farqi.s);

    const k = P(t, TM.scenes.greatest_null_farqi.s + 0.3, 0.8);
    withA(k, () => {
      // Left: The query & results
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("So'rov va Tizimlar Natijasi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Ruchka: narx=3000, eski_narx=NULL", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT nom,", 170, 395, { size: 18, color: '#fff', fam: MONO });
      text("       GREATEST(narx, eski_narx) AS katta,", 170, 435, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("       LEAST(narx, eski_narx)    AS kichik", 170, 475, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar WHERE id = 2; -- Ruchka", 170, 515, { size: 18, color: '#fff', fam: MONO });

      card(140, 560, 760, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("PostgreSQL 18 natijasi:    katta: 3000 | kichik: 3000", 170, 605, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("MySQL 9.7 natijasi:        katta: NULL | kichik: NULL", 170, 655, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("SQLite 3.54 (max bilan):   katta: NULL | kichik: NULL", 170, 705, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text("Bitta so'rov, bitta ma'lumot — natija butunlay boshqacha!", 170, 755, { size: 17, color: '#cbd5e1', fam: UI });

      card(140, 810, 760, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("SQL Standarti: Agar biror argument NULL bo'lsa, natija NULL!", 170, 850, { size: 17, weight: 700, color: C.green, fam: UI });
      text("MySQL va SQLite standartga mos, PostgreSQL esa qulaylik tarafdori.", 170, 885, { size: 16, color: C.soft, fam: UI });

      // Right: Portability Solution
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("Universal Portativ Yechim: COALESCE", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Har uchala tizimda bir xil 3000 olish uchun:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT nom,", 1070, 395, { size: 18, color: '#fff', fam: MONO });
      text("  GREATEST(narx, COALESCE(eski_narx, narx))", 1070, 440, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("    AS katta", 1070, 480, { size: 18, color: '#86efac', fam: MONO });
      text("FROM narxlar WHERE id = 2;", 1070, 520, { size: 18, color: '#fff', fam: MONO });

      card(1040, 580, 740, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qanday ishlaydi?", 1070, 620, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Agar eski_narx NULL bo'lsa, COALESCE uni narxga (3000) tenglaydi.", 1070, 665, { size: 17, color: C.ink, fam: UI });
      text("• GREATEST(3000, 3000) hisoblanadi va natija 3000 chiqadi!", 1070, 705, { size: 17, weight: 700, color: C.green, fam: UI });
      text("• Hech bir tizimda NULL qaytmaydi.", 1070, 740, { size: 17, color: C.soft, fam: UI });

      card(1040, 790, 740, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("Oltin qoida: Tizimlararo portativ kod yozishda", 1070, 835, { size: 18, weight: 700, color: C.green, fam: UI });
      text("GREATEST ichidagi noaniq ustunlarni doim COALESCE qiling!", 1070, 875, { size: 18, color: C.blue, fam: UI });
    });
  }

  // 3. MYSQL QISQARTMALARI
  function sMysql(t) {
    heading("MySQL: IF, IFNULL va Nolga Bo'lish", t, TM.scenes.mysql_qisqartmalari.s);

    const k = P(t, TM.scenes.mysql_qisqartmalari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: IF and IFNULL
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("1. IF() va IFNULL() Qisqartmalari", 520, 250, C.green, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- MySQL ga xos sintaksis:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT IF(narx > 10000, 'ha', 'yo''q') AS qimmatmi,", 170, 395, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       IFNULL(chegirma, 0)             AS toza_cheg", 170, 440, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("FROM narxlar WHERE id = 1;", 170, 480, { size: 18, color: '#fff', fam: MONO });
      text("--> Natija: 'ha' | 0", 170, 520, { size: 18, color: '#fbbf24', fam: MONO });

      card(140, 580, 760, 200, { fill: '#fff5f5', col: C.red, p: k });
      text("PostgreSQL da xato beradi!", 170, 620, { size: 21, weight: 700, color: C.red, fam: UI });
      text("ERROR: function if(boolean, unknown, unknown) does not exist", 170, 665, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      text("Sababi: IF() va IFNULL() SQL standarti emas, faqat MySQL funksiyalari.", 170, 710, { size: 16, color: C.ink, fam: UI });
      text("Standart ekvivalent: CASE WHEN ... va COALESCE().", 170, 745, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(140, 810, 760, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("IFNULL(a, b) aynan COALESCE(a, b) ning 2 argumentli shaklidir.", 170, 850, { size: 17, color: C.ink, fam: UI });
      text("Doimo COALESCE ishlatsangiz, barcha bazalarda ishlaydi.", 170, 885, { size: 17, weight: 700, color: C.green, fam: UI });

      // Right: Division by zero & Type aggregation
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("2. Nolga Bo'lish va Natija Tiplari", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("mysql> SELECT 1000000 / 0;", 1070, 350, { size: 18, color: '#94a3b8', fam: MONO });
      text("+------+", 1070, 390, { size: 18, color: '#64748b', fam: MONO });
      text("| NULL |", 1070, 425, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("+------+", 1070, 460, { size: 18, color: '#64748b', fam: MONO });
      text("1 row in set, 1 warning (0.00 sec)", 1070, 495, { size: 16, color: '#94a3b8', fam: MONO });
      text("Warning 1365: Division by 0", 1070, 525, { size: 17, weight: 700, color: '#f87171', fam: MONO });

      card(1040, 570, 740, 200, { fill: '#fffbeb', col: C.orange, p: k });
      text("PostgreSQL vs MySQL nolga bo'lishda:", 1070, 610, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("• PostgreSQL: So'rov to'xtaydi (Fatal ERROR).", 1070, 655, { size: 17, color: C.red, fam: UI });
      text("• MySQL: So'rov davom etadi, NULL va Warning beradi.", 1070, 695, { size: 17, color: C.blue, fam: UI });
      text("NULLIF(narx, 0) har ikkala tizimda xavfsizlik kafolatidir!", 1070, 740, { size: 17, weight: 700, color: C.green, fam: UI });

      card(1040, 800, 740, 130, { fill: '#eff6ff', col: C.blue, p: k });
      text("CASE tiplari: MySQL da raqam va matn aralashsa,", 1070, 840, { size: 17, color: C.ink, fam: UI });
      text("avtomatik VARCHAR ga aylantiriladi (xato chiqmaydi).", 1070, 880, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. SQLITE QISQARTMALARI
  function sSqlite(t) {
    heading("SQLite: iif, Ko'p Argumentli max/min va Tiplar", t, TM.scenes.sqlite_qisqartmalari.s);

    const k = P(t, TM.scenes.sqlite_qisqartmalari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: max/min instead of GREATEST
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("1. GREATEST Yo'q --> max(a, b)", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("sqlite3> SELECT GREATEST(12000, 15000);", 170, 355, { size: 18, color: '#94a3b8', fam: MONO });
      text("Parse error: no such function: GREATEST", 170, 405, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("-- SQLite da GREATEST yoki LEAST degan nom yo'q!", 170, 460, { size: 17, color: '#fca5a5', fam: MONO });

      card(140, 560, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- SQLite dagi to'g'ri yozilishi:", 170, 600, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT max(12000, 15000), min(12000, 15000);", 170, 645, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("--> Natija: 15000 | 12000", 170, 690, { size: 18, color: '#fbbf24', fam: MONO });
      text("• 1 ta argument bo'lsa: agregat funksiya", 170, 730, { size: 17, color: '#93c5fd', fam: UI });
      text("• 2+ argument bo'lsa: skalyar funksiya bo'lib ishlaydi!", 170, 765, { size: 17, weight: 700, color: '#86efac', fam: UI });

      card(140, 810, 760, 120, { fill: '#faf5ff', col: C.purple, p: k });
      text("SQLite ham bitta argument NULL bo'lsa NULL qaytaradi:", 170, 850, { size: 17, color: C.ink, fam: UI });
      text("max(3000, NULL) --> NULL (MySQL kabi standartga mos).", 170, 885, { size: 17, weight: 700, color: C.purple, fam: UI });

      // Right: iif() function
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("2. iif() va Dinamik Tiplar", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("-- SQLite 3.32+ iif() ifodasi:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT iif(narx > 10000, 'ha', 'yo''q')", 1070, 395, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("FROM narxlar WHERE id = 1;", 1070, 440, { size: 18, color: '#fff', fam: MONO });
      text("--> Natija: 'ha'", 1070, 485, { size: 18, color: '#86efac', fam: MONO });
      text("Qisqa tutashuv bilan aynan CASE kabi ishlaydi!", 1070, 525, { size: 17, color: '#cbd5e1', fam: UI });

      card(1040, 570, 740, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("iif() qulayliklari:", 1070, 610, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• iif(X, Y, Z) = CASE WHEN X THEN Y ELSE Z END", 1070, 655, { size: 17, weight: 700, color: C.blue, fam: MONO });
      text("• SQLite kompilyatori ikkalasiga ham BIR XIL bytecode yasaydi.", 1070, 695, { size: 16, color: C.ink, fam: UI });
      text("• Nolga bo'lish: 1000000 / 0 jimgina NULL bo'ladi.", 1070, 735, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1040, 790, 740, 140, { fill: '#eff6ff', col: C.blue, p: k });
      text("Dinamik tiplar:", 1070, 835, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("CASE THEN 1 ELSE 'matn' hech qachon xato bermaydi,", 1070, 875, { size: 17, color: C.ink, fam: UI });
      text("chunki SQLite har bir katakda alohida tip saqlay oladi.", 1070, 910, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 5. SOLISHTIRMA VA XULOSA
  function sXulosa(t) {
    heading("3 Dialekt Solishtirma Matritsasi va Xulosa", t, TM.scenes.solishtirma_va_xulosa.s);

    const k = P(t, TM.scenes.solishtirma_va_xulosa.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Recommendations
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Portativ Kod Yozish Qoidalari", 520, 250, C.blue, k, 18);

      card(140, 310, 760, 250, { fill: '#1e293b', col: '#334155', p: k });
      text("1. IF() yoki iif() o'rniga doimo CASE ishlating.", 170, 355, { size: 18, color: '#86efac', fam: UI });
      text("   CASE barcha relyatsion bazalarda 100% qo'llab-quvvatlanadi.", 170, 395, { size: 16, color: '#cbd5e1', fam: UI });
      text("2. IFNULL() o'rniga doimo COALESCE() ishlating.", 170, 440, { size: 18, color: '#93c5fd', fam: UI });
      text("   COALESCE 2 tadan ko'p argumentlarni ham bemalol oladi.", 170, 480, { size: 16, color: '#cbd5e1', fam: UI });
      text("3. Nolga bo'lishdan saqlanishda NULLIF(x, 0) eng xavfsiz yo'l.", 170, 525, { size: 18, color: '#fbbf24', fam: UI });

      card(140, 590, 760, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("4. NULL bilan solishtirishda doimo IS NULL:", 170, 630, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("   = NULL yoki <> NULL hech qachon TRUE bo'lmaydi!", 170, 675, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("   Faqat IS NULL va IS NOT NULL ishonchli natija beradi.", 170, 720, { size: 17, color: C.ink, fam: UI });

      card(140, 800, 760, 130, { fill: '#f0fdf4', col: C.green, p: k });
      text("5. GREATEST ishlatganda NULL ehtimoli bo'lsa,", 170, 840, { size: 18, weight: 700, color: C.green, fam: UI });
      text("   ichidagi argumentlarni COALESCE bilan o'rab oling.", 170, 885, { size: 17, color: C.blue, fam: UI });

      // Right: Comparison Matrix
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("3 Dialekt Solishtirma Matritsasi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 430, { fill: '#1e293b', col: '#334155', p: k });
      const rows = [
        { feat: "Xususiyat", pg: "Postgres", my: "MySQL", sq: "SQLite", hdr: true },
        { feat: "CASE, COALESCE, NULLIF", pg: "HA", my: "HA", sq: "HA" },
        { feat: "GREATEST / LEAST", pg: "HA", my: "HA", sq: "max()/min()" },
        { feat: "GREATEST da NULL", pg: "O'tkazadi", my: "NULL", sq: "NULL" },
        { feat: "IF(shart, a, b)", pg: "YO'Q", my: "HA", sq: "HA" },
        { feat: "iif(shart, a, b)", pg: "YO'Q", my: "YO'Q", sq: "HA" },
        { feat: "IFNULL(a, b)", pg: "YO'Q", my: "HA", sq: "HA" },
        { feat: "Nolga bo'lish", pg: "XATO", my: "NULL + 1365", sq: "NULL" },
      ];

      rows.forEach((r, idx) => {
        const ry = 345 + idx * 48;
        const color = r.hdr ? '#93c5fd' : (idx % 2 === 0 ? '#f8fafc' : '#cbd5e1');
        const weight = r.hdr ? 700 : 600;
        text(r.feat, 1065, ry, { size: 16, weight, color, fam: MONO });
        text(r.pg, 1370, ry, { size: 16, weight, color: r.pg === 'HA' ? '#86efac' : (r.hdr ? color : (r.pg === 'XATO' ? '#f87171' : '#93c5fd')), fam: MONO, align: 'center' });
        text(r.my, 1530, ry, { size: 16, weight, color: r.my === 'HA' ? '#86efac' : (r.hdr ? color : '#fbbf24'), fam: MONO, align: 'center' });
        text(r.sq, 1690, ry, { size: 16, weight, color: r.sq === 'HA' ? '#86efac' : (r.hdr ? color : '#c084fc'), fam: MONO, align: 'center' });
        if (r.hdr) {
          text("----------------------------------------------------------------", 1065, ry + 24, { size: 16, color: '#64748b', fam: MONO });
        }
      });

      card(1040, 765, 740, 165, { fill: '#f0fdf4', col: C.green, p: k });
      text("Xulosa: Standart SQL qoidalariga amal qilish", 1070, 810, { size: 19, weight: 700, color: C.green, fam: UI });
      text("ma'lumotlar bazasini almashtirishda (migratsiyada)", 1070, 855, { size: 18, color: C.blue, fam: UI });
      text("kodni 100% o'zgarishsiz ishlashini ta'minlaydi!", 1070, 900, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.greatest_null_farqi.s) {
      sIntro(t);
    } else if (t < TM.scenes.mysql_qisqartmalari.s) {
      sGreatestNull(t);
    } else if (t < TM.scenes.sqlite_qisqartmalari.s) {
      sMysql(t);
    } else if (t < TM.scenes.solishtirma_va_xulosa.s) {
      sSqlite(t);
    } else {
      sXulosa(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
