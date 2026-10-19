// SQL 32-bob 2-qism: "Kod" — Shartli ifodalar amalda
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

  // 1. KIRISH VA CASE TOIFALASH
  function sIntro(t) {
    heading("Kod: narxlar Jadvali va CASE Bilan Toifalash", t, TM.scenes.kirish.s);

    const k = P(t, TM.scenes.kirish.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Source Table narxlar
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("narxlar Jadvali (PostgreSQL 18.6)", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 260, { fill: '#1e293b', col: '#334155', p: k });
      const rows = [
        { id: "id", nom: "nom", narx: "narx", cheg: "chegirma", eski: "eski_narx", hdr: true },
        { id: "1", nom: "Daftar", narx: "12000", cheg: "NULL", eski: "15000" },
        { id: "2", nom: "Ruchka", narx: "3000", cheg: "500", eski: "NULL" },
        { id: "3", nom: "Kitob", narx: "85000", cheg: "0", eski: "90000" },
        { id: "4", nom: "Sumka", narx: "0", cheg: "NULL", eski: "NULL" },
      ];

      rows.forEach((r, idx) => {
        const ry = 345 + idx * 46;
        const color = r.hdr ? '#93c5fd' : '#f8fafc';
        const weight = r.hdr ? 700 : 600;
        text(r.id, 165, ry, { size: 16, weight, color, fam: MONO });
        text(r.nom, 250, ry, { size: 16, weight, color, fam: MONO });
        text(r.narx, 410, ry, { size: 16, weight, color: r.narx === '0' ? '#fbbf24' : color, fam: MONO });
        text(r.cheg, 560, ry, { size: 16, weight, color: r.cheg === 'NULL' ? '#f87171' : color, fam: MONO });
        text(r.eski, 720, ry, { size: 16, weight, color: r.eski === 'NULL' ? '#94a3b8' : color, fam: MONO });
        if (r.hdr) {
          text("----------------------------------------------------------------", 165, ry + 22, { size: 16, color: '#64748b', fam: MONO });
        }
      });

      card(140, 600, 760, 320, { fill: '#eff6ff', col: C.blue, p: k });
      text("CASE sharti: narxga qarab 4 toifa:", 170, 645, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("SELECT nom, narx,", 170, 695, { size: 18, color: C.ink, fam: MONO });
      text("       CASE WHEN narx >= 50000 THEN 'qimmat'", 170, 735, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("            WHEN narx >= 10000 THEN 'o''rta'", 170, 775, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("            WHEN narx > 0      THEN 'arzon'", 170, 815, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("            ELSE 'tekin' END AS toifa", 170, 855, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("FROM narxlar ORDER BY id;", 170, 895, { size: 18, color: C.ink, fam: MONO });

      // Right: Query Output
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("psql Natijasi: Toifalar", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 360, { fill: '#1e293b', col: '#334155', p: k });
      text("  nom   | narx  | toifa  ", 1070, 360, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+-------+--------", 1070, 395, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar | 12000 | o'rta", 1070, 440, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text(" Ruchka |  3000 | arzon", 1070, 485, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text(" Kitob  | 85000 | qimmat", 1070, 530, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text(" Sumka  |     0 | tekin", 1070, 575, { size: 18, weight: 700, color: '#f87171', fam: MONO });
      text("(4 rows)", 1070, 620, { size: 17, color: '#94a3b8', fam: MONO });

      card(1040, 700, 740, 220, { fill: '#f0fdf4', col: C.green, p: k });
      text("Muhim xulosa:", 1070, 745, { size: 21, weight: 700, color: C.green, fam: UI });
      text("Kitob (85000) narxi >= 10000 shartiga ham to'g'ri keladi,", 1070, 790, { size: 17, color: C.ink, fam: UI });
      text("ammo >= 50000 sharti birinchi rost bo'lgani uchun", 1070, 830, { size: 17, color: C.ink, fam: UI });
      text("to'xtadi va unga 'qimmat' toifasi berildi!", 1070, 870, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 2. NULL VA TIPLIK MOSLIK
  function sNullTiplar(t) {
    heading("CASE da NULL va Natija Tiplari Mosligi", t, TM.scenes.null_va_tiplar.s);

    const k = P(t, TM.scenes.null_va_tiplar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: NULL comparison
      card(100, 200, 840, 760, { fill: C.card, col: C.red, p: k });
      pill("1. chegirma = NULL vs IS NULL", 520, 250, C.red, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom,", 170, 350, { size: 18, color: '#fff', fam: MONO });
      text("  CASE WHEN chegirma = NULL  THEN 'yo''q' ELSE 'bor' END", 170, 395, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("       AS xato,", 170, 430, { size: 17, color: '#fca5a5', fam: MONO });
      text("  CASE WHEN chegirma IS NULL THEN 'yo''q' ELSE 'bor' END", 170, 475, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("       AS togri", 170, 510, { size: 17, color: '#86efac', fam: MONO });
      text("FROM narxlar ORDER BY id;", 170, 545, { size: 18, color: '#fff', fam: MONO });

      card(140, 580, 760, 340, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   | xato | togri ", 170, 620, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+------+-------", 170, 655, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar | bor  | yo'q   <-- Daftar chegirmasi NULL edi!", 170, 700, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text(" Ruchka | bor  | bor", 170, 740, { size: 17, color: '#86efac', fam: MONO });
      text(" Kitob  | bor  | bor", 170, 780, { size: 17, color: '#86efac', fam: MONO });
      text(" Sumka  | bor  | yo'q   <-- xato ustunda 'bor' chiqdi!", 170, 820, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("Xulosa: = NULL doim NULL beradi, faqat IS NULL to'g'ri!", 170, 875, { size: 17, weight: 700, color: '#86efac', fam: UI });

      // Right: Result Type Match Error
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("2. Natija Tiplari Mosligi (Type Match)", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("-- Har xil tipli natijalar berilsa:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT CASE WHEN 1 = 1 THEN 1", 1070, 395, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("            ELSE 'matn'", 1070, 440, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("       END AS x;", 1070, 480, { size: 19, color: '#fff', fam: MONO });

      card(1040, 560, 740, 180, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("PostgreSQL 18.6 Xatosi:", 1070, 605, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("ERROR: invalid input syntax for type integer: \"matn\"", 1070, 650, { size: 16, weight: 700, color: '#fca5a5', fam: MONO });
      text("PostgreSQL natijalarni yagona tipga (integer) keltirishga", 1070, 695, { size: 16, color: '#cbd5e1', fam: UI });
      text("urinadi va 'matn' ni songa aylantira olmay xato beradi.", 1070, 730, { size: 16, color: '#cbd5e1', fam: UI });

      card(1040, 770, 740, 160, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qoida: Barcha THEN va ELSE natijalari", 1070, 810, { size: 20, weight: 700, color: C.green, fam: UI });
      text("yagona ma'lumot turiga (type) mos bo'lishi shart!", 1070, 855, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("(MySQL va SQLite da bu qoida ancha yumshoq).", 1070, 895, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 3. COALESCE AMALDA
  function sCoalesce(t) {
    heading("COALESCE: Matnlar va Yakuniy Narx Hisobi", t, TM.scenes.coalesce_amalda.s);

    const k = P(t, TM.scenes.coalesce_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Left: COALESCE with Strings
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. Birinchi Mavjud Matnni Tanlash", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom,", 170, 350, { size: 18, color: '#fff', fam: MONO });
      text("       COALESCE(tavsif, qisqa, '(yo''q)') AS matn", 170, 395, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar ORDER BY id;", 170, 440, { size: 18, color: '#fff', fam: MONO });

      card(140, 540, 760, 370, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   |         matn          ", 170, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+-----------------------", 170, 615, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar | Katak daftar 48 varaq  <-- tavsif bor", 170, 660, { size: 17, color: '#f8fafc', fam: MONO });
      text(" Ruchka | Ruchka                 <-- tavsif yo'q, qisqa olindi", 170, 705, { size: 17, color: '#86efac', fam: MONO });
      text(" Kitob  | (yo'q)                 <-- ikkisi ham NULL, sukut!", 170, 750, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text(" Sumka  | Bo'sh                  <-- tavsif bor", 170, 795, { size: 17, color: '#f8fafc', fam: MONO });
      text("Barcha NULL bo'lmaguncha zanjir davom etadi.", 170, 850, { size: 17, color: '#cbd5e1', fam: UI });

      // Right: Arithmetic Protection
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. Arifmetikada NULL Himoyasi", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom,", 1070, 350, { size: 18, color: '#fff', fam: MONO });
      text("       narx - COALESCE(chegirma, 0) AS yakuniy", 1070, 395, { size: 19, weight: 700, color: '#93c5fd', fam: MONO });
      text("FROM narxlar ORDER BY id;", 1070, 440, { size: 18, color: '#fff', fam: MONO });

      card(1040, 540, 740, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   | yakuniy ", 1070, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+---------", 1070, 615, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar |   12000  (12000 - 0)", 1070, 660, { size: 18, color: '#86efac', fam: MONO });
      text(" Ruchka |    2500  (3000 - 500)", 1070, 700, { size: 18, color: '#86efac', fam: MONO });
      text(" Kitob  |   85000  (85000 - 0)", 1070, 740, { size: 18, color: '#86efac', fam: MONO });

      card(1040, 785, 740, 140, { fill: '#fff5f5', col: C.red, p: k });
      text("Agar COALESCE bo'lmasa nima bo'lardi?", 1070, 825, { size: 18, weight: 700, color: C.red, fam: UI });
      text("12000 - NULL = NULL bo'lib, Daftar narxi yo'qolardi!", 1070, 870, { size: 18, weight: 700, color: C.red, fam: MONO });
    });
  }

  // 4. NULLIF AMALDA
  function sNullif(t) {
    heading("NULLIF: Bo'sh Satr va Nolga Bo'lishdan Himoya", t, TM.scenes.nullif_amalda.s);

    const k = P(t, TM.scenes.nullif_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Empty string -> NULL
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("1. Bo'sh Satrni NULL ga Aylantirish", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom, NULLIF(qisqa, '') AS qisqa", 170, 360, { size: 19, weight: 700, color: '#fbbf24', fam: MONO });
      text("FROM narxlar ORDER BY id;", 170, 410, { size: 18, color: '#fff', fam: MONO });

      card(140, 540, 760, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   | qisqa  ", 170, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+--------", 170, 615, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar | Daftar", 170, 660, { size: 17, color: '#86efac', fam: MONO });
      text(" Ruchka | Ruchka", 170, 695, { size: 17, color: '#86efac', fam: MONO });
      text(" Kitob  |          (NULL edi, o'zgarmadi)", 170, 730, { size: 16, color: '#94a3b8', fam: MONO });
      text(" Sumka  |          ('' edi, endi haqiqiy NULL!)", 170, 765, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });

      card(140, 810, 760, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Bo'sh satrlar ma'lumotlar bazasida ko'p chalkashlik keltiradi.", 170, 850, { size: 17, color: C.ink, fam: UI });
      text("NULLIF(col, '') ularni haqiqiy NULL ga tozalaydi.", 170, 885, { size: 17, weight: 700, color: C.green, fam: UI });

      // Right: Division by Zero
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. Nolga Bo'lishdan To'liq Himoya", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom,", 1070, 350, { size: 18, color: '#fff', fam: MONO });
      text("       1000000 / NULLIF(narx, 0) AS nisbat", 1070, 395, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar ORDER BY id;", 1070, 440, { size: 18, color: '#fff', fam: MONO });

      card(1040, 540, 740, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   | nisbat ", 1070, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+--------", 1070, 615, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar |     83  (1M / 12000)", 1070, 660, { size: 17, color: '#86efac', fam: MONO });
      text(" Ruchka |    333  (1M / 3000)", 1070, 695, { size: 17, color: '#86efac', fam: MONO });
      text(" Kitob  |     11  (1M / 85000)", 1070, 730, { size: 17, color: '#86efac', fam: MONO });
      text(" Sumka  |         (1M / NULL -> NULL!)", 1070, 765, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 810, 740, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Agar NULLIF bo'lmasa: Sumka da 1000000 / 0 bo'lib,", 1070, 850, { size: 17, color: C.red, fam: UI });
      text("PostgreSQL ERROR: division by zero xatosini berardi!", 1070, 885, { size: 17, weight: 700, color: C.red, fam: UI });
    });
  }

  // 5. GREATEST VA LEAST AMALDA
  function sGreatestLeast(t) {
    heading("GREATEST va LEAST Amalda", t, TM.scenes.greatest_least_amalda.s);

    const k = P(t, TM.scenes.greatest_least_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Greatest / Least query & results
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("GREATEST / LEAST Natijalari (PostgreSQL)", 520, 250, C.purple, k, 18);

      card(140, 310, 760, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT nom,", 170, 350, { size: 18, color: '#fff', fam: MONO });
      text("       GREATEST(narx, eski_narx) AS katta,", 170, 395, { size: 18, weight: 700, color: '#c084fc', fam: MONO });
      text("       LEAST(narx, eski_narx)    AS kichik", 170, 435, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar ORDER BY id;", 170, 475, { size: 18, color: '#fff', fam: MONO });

      card(140, 540, 760, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("  nom   | katta | kichik ", 170, 580, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("--------+-------+--------", 170, 615, { size: 18, color: '#64748b', fam: MONO });
      text(" Daftar | 15000 |  12000  (12k vs 15k)", 170, 660, { size: 17, color: '#86efac', fam: MONO });
      text(" Ruchka |  3000 |   3000  (3k vs NULL -> 3k)", 170, 695, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text(" Kitob  | 90000 |  85000  (85k vs 90k)", 170, 730, { size: 17, color: '#86efac', fam: MONO });
      text(" Sumka  |     0 |      0  (0 vs NULL -> 0)", 170, 765, { size: 17, color: '#86efac', fam: MONO });

      card(140, 810, 760, 120, { fill: '#faf5ff', col: C.purple, p: k });
      text("PostgreSQL bitta argument NULL bo'lsa uni o'tkazib yuboradi.", 170, 850, { size: 17, color: C.ink, fam: UI });
      text("MySQL va SQLite da esa natija NULL bo'ladi (3-qismda ko'ramiz).", 170, 885, { size: 17, weight: 700, color: C.purple, fam: UI });

      // Right: CASE in aggregate & ORDER BY
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("CASE Agregat Ichida va ORDER BY da", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- 1. Shartli hisoblash (FILTER o'rniga):", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT sum(CASE WHEN narx > 10000", 1070, 395, { size: 18, color: '#93c5fd', fam: MONO });
      text("                THEN 1 ELSE 0 END) AS qimmatlar", 1070, 435, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM narxlar;  --> Natija: 2", 1070, 480, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 580, 740, 200, { fill: '#1e293b', col: '#334155', p: k });
      text("-- 2. Chegirmasi borlarni oldinga chiqarish:", 1070, 620, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT nom FROM narxlar", 1070, 665, { size: 18, color: '#fff', fam: MONO });
      text("ORDER BY CASE WHEN chegirma IS NULL", 1070, 705, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("              THEN 1 ELSE 0 END, id;", 1070, 745, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 810, 740, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Natija tartibi: Ruchka, Kitob (chegirmalilar oldin),", 1070, 850, { size: 17, weight: 700, color: C.green, fam: UI });
      text("so'ngra Daftar va Sumka. Juda qulay va universal usul!", 1070, 885, { size: 17, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.null_va_tiplar.s) {
      sIntro(t);
    } else if (t < TM.scenes.coalesce_amalda.s) {
      sNullTiplar(t);
    } else if (t < TM.scenes.nullif_amalda.s) {
      sCoalesce(t);
    } else if (t < TM.scenes.greatest_least_amalda.s) {
      sNullif(t);
    } else {
      sGreatestLeast(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
