// SQL 31-bob 3-qism: "Dialektlar" — MySQL va SQLite da Window funksiyalar
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
    hand("31-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Window Funksiyalar", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Qo'llab-quvvatlanish, ramka (frame) cheklovlari va oyna zanjiri farqlari", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'oyna'), 0.8);
    withA(kCards, () => {
      const engines = [
        {
          name: "PostgreSQL 18",
          badge: "Standart va Mukammal",
          col: C.blue,
          points: [
            "• SQL:2016 standartiga to'liq mos",
            "• ROWS, RANGE, GROUPS to'liq",
            "• EXCLUDE barcha 4 varianti bor",
            "• FILTER (WHERE ...) qo'llab-quvvatlaydi",
          ]
        },
        {
          name: "MySQL 8.0+",
          badge: "Cheklovlar Mavjud",
          col: C.green,
          points: [
            "• ROWS va RANGE to'liq ishlaydi",
            "• GROUPS sintaksisda bor, xato 1235!",
            "• EXCLUDE qo'llab-quvvatlanmaydi (1235)",
            "• FILTER yo'q (CASE WHEN zarur)",
          ]
        },
        {
          name: "SQLite 3.28+",
          badge: "To'liq Frame va Zanjir",
          col: C.purple,
          points: [
            "• GROUPS va EXCLUDE to'liq ishlaydi!",
            "• FILTER (WHERE ...) oyna bilan ishlaydi",
            "• WINDOW zanjiri (Window Chaining)",
            "• Yengil bazada to'liq standart!",
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

  // 2. MYSQL GROUPS VA EXCLUDE (1235 XATOSI)
  function sMysqlGroups(t) {
    heading("MySQL: GROUPS va EXCLUDE Yo'qligi (1235 Xatosi)", t, TM.scenes.mysql_groups_va_exclude.s);

    const k = P(t, TM.scenes.mysql_groups_va_exclude.s + 0.3, 0.8);
    withA(k, () => {
      // Left: The query that fails
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("GROUPS / EXCLUDE So'rovi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- MySQL da bajarishga urinish:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT empno, salary,", 170, 390, { size: 18, color: '#93c5fd', fam: MONO });
      text("       sum(salary) OVER (", 170, 430, { size: 18, color: '#fff', fam: MONO });
      text("         ORDER BY salary", 170, 470, { size: 18, color: '#fff', fam: MONO });
      text("         GROUPS BETWEEN 1 PRECEDING", 170, 510, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("                    AND 1 FOLLOWING", 170, 550, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("       ) AS g FROM empsalary;", 170, 590, { size: 18, color: '#fff', fam: MONO });

      card(140, 600, 760, 320, { fill: '#fff5f5', col: C.red, p: k });
      text("EXCLUDE sintaksisi ham tahlil qilinadi:", 170, 645, { size: 21, weight: 700, color: C.red, fam: UI });
      text("ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING", 170, 695, { size: 17, color: C.ink, fam: MONO });
      text("EXCLUDE CURRENT ROW -- sintaksis tushuniladi, lekin...", 170, 735, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("• MySQL parseri (grammatikasi) bu so'zlarni taniydi,", 170, 790, { size: 18, color: C.ink, fam: UI });
      text("  ammo ijro mexanizmi (runtime) ularni qo'llab-quvvatlamaydi!", 170, 830, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Natijada darhol 1235 xatosi yuzaga keladi.", 170, 875, { size: 18, color: C.soft, fam: UI });

      // Right: MySQL 1235 Runtime Error
      card(1000, 200, 820, 760, { fill: C.card, col: C.red, p: k });
      pill("MySQL 9.7 Terminal Xatosi (1235)", 1410, 250, C.red, k, 19);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("mysql> SELECT ... GROUPS ... ;", 1070, 355, { size: 18, color: '#94a3b8', fam: MONO });
      text("ERROR 1235 (42000):", 1070, 405, { size: 20, weight: 700, color: '#f87171', fam: MONO });
      text("This version of MySQL doesn't yet support", 1070, 450, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("'GROUPS'", 1070, 490, { size: 20, weight: 700, color: '#fca5a5', fam: MONO });

      card(1040, 560, 740, 160, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("mysql> SELECT ... EXCLUDE ... ;", 1070, 600, { size: 18, color: '#94a3b8', fam: MONO });
      text("ERROR 1235 (42000):", 1070, 645, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("This version of MySQL doesn't yet support 'EXCLUDE'", 1070, 685, { size: 17, weight: 700, color: '#fca5a5', fam: MONO });

      card(1040, 750, 740, 175, { fill: '#f0fdf4', col: C.green, p: k });
      text("MySQL dagi xavfsiz ramka variantlari:", 1070, 795, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• ROWS BETWEEN N PRECEDING AND M FOLLOWING", 1070, 840, { size: 17, color: C.ink, fam: MONO });
      text("• RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", 1070, 880, { size: 16, color: C.blue, fam: MONO });
    });
  }

  // 3. MYSQL FILTER VA CHEKLOVLAR
  function sMysqlFilter(t) {
    heading("MySQL: FILTER Yo'qligi va DISTINCT Cheklovi", t, TM.scenes.mysql_filter_va_limitations.s);

    const k = P(t, TM.scenes.mysql_filter_va_limitations.s + 0.3, 0.8);
    withA(k, () => {
      // Left: FILTER (WHERE ...) vs CASE WHEN
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("1. FILTER Bandi Yo'qligi", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- PostgreSQL va SQLite da standart FILTER:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("COUNT(*) FILTER (WHERE salary > 5000)", 170, 395, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("    OVER (PARTITION BY depname) AS katta_maoshlar", 170, 435, { size: 18, color: '#93c5fd', fam: MONO });
      text("-- MySQL da bu sintaksis XATO (Syntax Error)!", 170, 485, { size: 17, weight: 700, color: '#f87171', fam: MONO });

      card(140, 560, 760, 200, { fill: '#f0fdf4', col: C.green, p: k });
      text("MySQL dagi to'g'ri yechim: CASE WHEN", 170, 605, { size: 21, weight: 700, color: C.green, fam: UI });
      text("SUM(CASE WHEN salary > 5000 THEN 1 ELSE 0 END)", 170, 655, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("    OVER (PARTITION BY depname) AS katta_maoshlar", 170, 695, { size: 18, color: C.ink, fam: MONO });
      text("Barcha SQL dialektlarida universal ishlaydi!", 170, 740, { size: 18, color: C.green, fam: UI });

      card(140, 790, 760, 140, { fill: '#eff6ff', col: C.blue, p: k });
      text("CASE WHEN ifodasi agregat ichida hisoblanadi,", 170, 835, { size: 18, color: C.ink, fam: UI });
      text("shart bajarilmaganda 0 yoki NULL qaytaradi.", 170, 875, { size: 18, weight: 700, color: C.blue, fam: UI });

      // Right: DISTINCT in window function
      card(1000, 200, 820, 760, { fill: C.card, col: C.red, p: k });
      pill("2. DISTINCT Oyna Ichida Taqiqlangan", 1410, 250, C.red, k, 19);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("-- Barcha tizimlarda xato beruvchi so'rov:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT COUNT(DISTINCT empno)", 1070, 395, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("       OVER (PARTITION BY depname)", 1070, 435, { size: 18, color: '#fff', fam: MONO });
      text("FROM empsalary;", 1070, 475, { size: 18, color: '#fff', fam: MONO });

      card(1040, 560, 740, 180, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("MySQL Xatosi 1235:", 1070, 600, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("ERROR 1235: This version of MySQL doesn't yet support", 1070, 640, { size: 16, weight: 700, color: '#fca5a5', fam: MONO });
      text("'<window function>(DISTINCT)'", 1070, 675, { size: 18, weight: 700, color: '#fca5a5', fam: MONO });
      text("PostgreSQL va SQLite ham oyna ichida DISTINCT ga ruxsat bermaydi!", 1070, 715, { size: 15, color: '#cbd5e1', fam: UI });

      card(1040, 770, 740, 160, { fill: '#fffbeb', col: C.orange, p: k });
      text("Yechim: DENSE_RANK() yoki alohida CTE:", 1070, 810, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("Noyob qiymatlarni hisoblash uchun oldindan CTE da", 1070, 850, { size: 17, color: C.ink, fam: UI });
      text("GROUP BY qilib olinadi, keyin oyna funksiyasi beriladi.", 1070, 890, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. SQLITE TO'LIQ FRAME VA ZANJIR
  function sSqliteMukammal(t) {
    heading("SQLite: To'liq Frame va Oyna Zanjiri (Chaining)", t, TM.scenes.sqlite_mukammal_frame.s);

    const k = P(t, TM.scenes.sqlite_mukammal_frame.s + 0.3, 0.8);
    withA(k, () => {
      // Left: SQLite full frame support
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("SQLite: GROUPS va EXCLUDE To'liq Ishlaydi!", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("sqlite3> SELECT empno, salary,", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("         sum(salary) OVER (", 170, 390, { size: 18, color: '#fff', fam: MONO });
      text("           ORDER BY salary", 170, 425, { size: 18, color: '#fff', fam: MONO });
      text("           GROUPS BETWEEN 1 PRECEDING AND 1 FOLLOWING", 170, 465, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("           EXCLUDE GROUP", 170, 500, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("         ) AS g FROM empsalary;", 170, 535, { size: 18, color: '#fff', fam: MONO });

      card(140, 560, 760, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("SQLite 3.54 real natijasi:", 170, 595, { size: 17, color: '#94a3b8', fam: MONO });
      text("╭───────┬────────┬──────┬────────╮", 170, 630, { size: 16, color: '#64748b', fam: MONO });
      text("│ empno │ salary │  g   │ boshqa │", 170, 660, { size: 16, weight: 700, color: '#93c5fd', fam: MONO });
      text("│     5 │   3500 │ 3500 │      0 │", 170, 690, { size: 16, color: '#86efac', fam: MONO });
      text("│     2 │   3900 │ 7400 │      1 │", 170, 720, { size: 16, color: '#86efac', fam: MONO });
      text("╰───────┴────────┴──────┴────────╯", 170, 750, { size: 16, color: '#64748b', fam: MONO });

      card(140, 790, 760, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("SQLite 3.28 dan boshlab SQL:2016 ning barcha", 170, 835, { size: 18, weight: 700, color: C.green, fam: UI });
      text("ramka spetsifikatsiyalarini 100% qo'llab-quvvatlaydi!", 170, 875, { size: 18, color: C.ink, fam: UI });

      // Right: Window Chaining (Oyna Zanjiri)
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("Oyna Zanjiri (Window Chaining)", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- SQLite va MySQL da mavjud oynaga tayanish:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("WINDOW w1 AS (PARTITION BY depname),", 1070, 395, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("       w2 AS (w1 ORDER BY salary", 1070, 440, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("             ROWS BETWEEN 1 PRECEDING", 1070, 480, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text("                      AND 1 FOLLOWING)", 1070, 515, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });

      card(1040, 580, 740, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Zanjir (Chaining) qulayliklari:", 1070, 620, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• w1 faqat bo'lim (PARTITION BY) ni belgilaydi.", 1070, 665, { size: 17, color: C.ink, fam: UI });
      text("• w2 unga tayanib tartib (ORDER BY) va ramka qo'shadi.", 1070, 705, { size: 17, color: C.ink, fam: UI });
      text("• Bir xil partitsiyani qayta-qayta yozish shart emas!", 1070, 745, { size: 17, weight: 700, color: C.green, fam: UI });

      card(1040, 790, 740, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("FILTER bandi ham SQLite da oyna bilan birga", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("mukammal ishlaydi: COUNT(*) FILTER (WHERE ...)", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: MONO });
    });
  }

  // 5. SOLISHTIRMA MATRITSA VA XULOSA
  function sXulosa(t) {
    heading("3 Dialekt Solishtirma Matritsasi va Xulosa", t, TM.scenes.solishtirma_va_xulosa.s);

    const k = P(t, TM.scenes.solishtirma_va_xulosa.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Sukutdagi ramka qoidasi
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Sukutdagi Ramka (Barcha Tizimda Bir Xil!)", 520, 250, C.blue, k, 18);

      card(140, 310, 760, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("Agar OVER (ORDER BY col) yozilib,", 170, 355, { size: 18, color: '#94a3b8', fam: UI });
      text("ramka ko'rsatilmasa, barcha 3 ta tizim sukut bo'yicha:", 170, 395, { size: 18, color: '#fff', fam: UI });
      text("RANGE BETWEEN UNBOUNDED PRECEDING", 170, 445, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("          AND CURRENT ROW", 170, 485, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("deb qabul qiladi!", 170, 530, { size: 18, weight: 700, color: '#86efac', fam: UI });

      card(140, 570, 760, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Oqibati: Teng qiymatli dublikatlar birga qo'shiladi!", 170, 615, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("Agar har bir qator alohida yig'ilishi kerak bo'lsa,", 170, 665, { size: 18, color: C.ink, fam: UI });
      text("doimo ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", 170, 710, { size: 16, weight: 700, color: C.blue, fam: MONO });
      text("deb aniq ko'rsatish tavsiya etiladi.", 170, 750, { size: 17, color: C.ink, fam: UI });

      card(140, 780, 760, 150, { fill: '#f0fdf4', col: C.green, p: k });
      text("Agar ORDER BY berilmasa:", 170, 820, { size: 19, weight: 700, color: C.green, fam: UI });
      text("Butun partitsiya bitta ramka bo'ladi (ortiqcha ORDER BY qilmang).", 170, 865, { size: 17, color: C.soft, fam: UI });

      // Right: Comparison Matrix
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("3 Dialekt Solishtirma Matritsasi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 420, { fill: '#1e293b', col: '#334155', p: k });
      const rows = [
        { feature: "Xususiyat", pg: "Postgres", my: "MySQL", sq: "SQLite", hdr: true },
        { feature: "Window funksiyalari", pg: "HA", my: "HA", sq: "HA" },
        { feature: "ROWS va RANGE", pg: "HA", my: "HA", sq: "HA" },
        { feature: "GROUPS ramkasi", pg: "HA", my: "YO'Q (1235)", sq: "HA" },
        { feature: "EXCLUDE bandi", pg: "HA", my: "YO'Q (1235)", sq: "HA" },
        { feature: "FILTER (WHERE ...)", pg: "HA", my: "YO'Q (CASE)", sq: "HA" },
        { feature: "Oyna zanjiri (Chaining)", pg: "Qisman", my: "HA", sq: "HA" },
        { feature: "DISTINCT oyna ichida", pg: "YO'Q", my: "YO'Q", sq: "YO'Q" },
      ];

      rows.forEach((r, idx) => {
        const ry = 345 + idx * 48;
        const color = r.hdr ? '#93c5fd' : (idx % 2 === 0 ? '#f8fafc' : '#cbd5e1');
        const weight = r.hdr ? 700 : 600;
        text(r.feature, 1065, ry, { size: 16, weight, color, fam: MONO });
        text(r.pg, 1370, ry, { size: 16, weight, color: r.pg === 'HA' ? '#86efac' : (r.hdr ? color : '#f87171'), fam: MONO, align: 'center' });
        text(r.my, 1530, ry, { size: 16, weight, color: r.my === 'HA' ? '#86efac' : (r.hdr ? color : '#fbbf24'), fam: MONO, align: 'center' });
        text(r.sq, 1690, ry, { size: 16, weight, color: r.sq === 'HA' ? '#86efac' : (r.hdr ? color : '#c084fc'), fam: MONO, align: 'center' });
        if (r.hdr) {
          text("----------------------------------------------------------------", 1065, ry + 24, { size: 16, color: '#64748b', fam: MONO });
        }
      });

      card(1040, 755, 740, 175, { fill: '#f0fdf4', col: C.green, p: k });
      text("Xulosa: Murakkab ramkalar (GROUPS, EXCLUDE) uchun", 1070, 800, { size: 19, weight: 700, color: C.green, fam: UI });
      text("PostgreSQL va SQLite eng boy imkoniyatga ega!", 1070, 845, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("MySQL da esa ROWS va CASE WHEN xavfsiz va portativ yo'ldir.", 1070, 890, { size: 17, color: C.soft, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_groups_va_exclude.s) {
      sIntro(t);
    } else if (t < TM.scenes.mysql_filter_va_limitations.s) {
      sMysqlGroups(t);
    } else if (t < TM.scenes.sqlite_mukammal_frame.s) {
      sMysqlFilter(t);
    } else if (t < TM.scenes.solishtirma_va_xulosa.s) {
      sSqliteMukammal(t);
    } else {
      sXulosa(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
