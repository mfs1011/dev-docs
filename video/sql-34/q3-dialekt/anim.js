// SQL 34-bob 3-qism: "Dialektlar" — Sana funksiyalari tafovuti
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

  // 1. KIRISH VA DIALEKTLAR (0s - 13.48s)
  function sKirish(t) {
    const k = P(t, 0.3, 1.0);
    hand("34-bob. Sana Funksiyalari", 960, 150, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Dialektlar Bo'yicha Asosiy Farqlar", 960, 240, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL, MySQL va SQLite dagi sana funksiyalari va modifikatorlar", 960, 325, { size: 28, align: 'center', p: P(t, 1.1, 1.2) });
    marker(250, 355, 1420 * eio(P(t, 1.6, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Sana'), 0.8);
    withA(kCards, () => {
      const dbs = [
        {
          name: "PostgreSQL 18.6",
          tag: "Boy va Aniq Standart",
          col: C.blue,
          points: [
            "• timestamp va timestamptz tiplari",
            "• date_trunc va date_bin mavjud",
            "• generate_series bilan oson kalendar",
            "• now() = tranzaksiya boshi",
            "• isodow: Dushanba=1 .. Yakshanba=7",
          ]
        },
        {
          name: "MySQL 9.7",
          tag: "O'ziga Xos Funksiyalar",
          col: C.orange,
          points: [
            "• DATETIME va TIMESTAMP tiplari",
            "• date_trunc yo'q (DATE_FORMAT satr)",
            "• LAST_DAY() o'rnatilgan funksiyasi",
            "• DAYOFWEEK: Yakshanba=1, Dushanba=2!",
            "• NOW() = operator, SYSDATE() = daqiqa",
          ]
        },
        {
          name: "SQLite 3.54",
          tag: "Yengil va Modifikatorli",
          col: C.green,
          points: [
            "• Sana tipi yo'q (text/ISO 8601)",
            "• date() va modifikatorlar tizimi",
            "• 'start of month', 'end of month'",
            "• strftime() matn qaytaradi",
            "• Bo'sh kunlar: Rekursiv CTE",
          ]
        },
      ];

      dbs.forEach((db, i) => {
        const bx = 100 + i * 590;
        card(bx, 400, 550, 550, { fill: C.card, col: db.col, p: kCards });
        pill(db.name, bx + 275, 450, db.col, kCards, 22);
        pill(db.tag, bx + 275, 500, '#64748b', kCards, 16);

        db.points.forEach((pt, pi) => {
          text(pt, bx + 35, 570 + pi * 70, { size: 19, weight: 600, color: C.ink, fam: UI });
        });
      });
    });
  }

  // 2. HAFTA KUNI VA TRUNC (13.48s - 27.61s)
  function sHaftaKuni(t) {
    heading("1. Hafta Kuni va date_trunc Muqobillari", t, TM.scenes.hafta_kuni_va_trunc.s);

    const k = P(t, TM.scenes.hafta_kuni_va_trunc.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: date_trunc yo'qligi
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. date_trunc Yo'qligi va Muqobillar", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("PostgreSQL (Standart):", 155, 330, { size: 16, color: '#86efac', fam: UI });
      text("SELECT date_trunc('month', vaqt);      -- Sana qaytaradi", 155, 365, { size: 16, color: '#fff', fam: MONO });
      text("MySQL 9.7 (date_trunc YO'Q!):", 155, 410, { size: 16, color: '#f87171', fam: UI });
      text("SELECT DATE_FORMAT(vaqt, '%Y-%m-01');   -- SATR qaytaradi!", 155, 445, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("SQLite 3.54 (Modifikator bilan):", 155, 490, { size: 16, color: '#93c5fd', fam: UI });
      text("SELECT date(vaqt, 'start of month');    -- ISO 8601 matn", 155, 525, { size: 16, color: '#fff', fam: MONO });

      card(130, 600, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("MySQL DATE_FORMAT xususiyati:", 160, 640, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• DATE_FORMAT sana emas, balki string (VARCHAR) qaytaradi.", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("• Agar unga sana arifmetikasi qo'llanilsa, qayta konvertatsiya zarur.", 160, 720, { size: 16, color: C.ink, fam: UI });
      text("• PostgreSQL dagi date_trunc esa sana tipini to'liq saqlab qoladi.", 160, 755, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("SQLite dagi date(v, 'start of month') juda qulay va ixcham ishlaydi.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: Hafta kuni farqi
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. Hafta Kuni Raqamlash: Dushanba Nechinchi?", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- Dushanba kuni (masalan: 2026-02-02) uchun:", 1035, 330, { size: 16, color: '#93c5fd', fam: MONO });
      text("PG isodow:          extract(isodow ...)   --> 1 (Standart)", 1035, 375, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("PG dow:             extract(dow ...)      --> 1", 1035, 415, { size: 17, color: '#cbd5e1', fam: MONO });
      text("MySQL DAYOFWEEK:    DAYOFWEEK(...)        --> 2 (ODBC!)", 1035, 460, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("MySQL WEEKDAY:      WEEKDAY(...)          --> 0 (0 dan bosh!)", 1035, 505, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text("SQLite %u:          strftime('%u', ...)   --> 1 (ISO 8601)", 1035, 550, { size: 17, color: '#86efac', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Nega MySQL da 2 ta alohida funksiya bor?", 1040, 640, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• DAYOFWEEK: ODBC standarti bo'yicha Yakshanba=1, Dushanba=2.", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("• WEEKDAY: Dasturlash tillari kabi Dushanba=0, Yakshanba=6.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("• Bir-biri bilan adashtirilsa, hisobotlar bir kunga surilib ketadi!", 1040, 755, { size: 16, weight: 700, color: C.red, fam: UI });

      card(1010, 805, 780, 125, { fill: '#f0fdf4', col: C.green, p: k });
      text("Oltin qoida: Har doim ISO 8601 (PG isodow yoki SQLite '%u') ni tanlang.", 1040, 850, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. BO'SH KUNLAR VA CTE (27.61s - 40.07s)
  function sBoshKunlar(t) {
    heading("2. Bo'sh Kunlar: generate_series vs Rekursiv CTE", t, TM.scenes.bosh_kunlar_va_cte.s);

    const k = P(t, TM.scenes.bosh_kunlar_va_cte.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: PostgreSQL
      card(100, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("1. PostgreSQL: generate_series", 520, 240, C.green, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("-- O'rnatilgan qatorlar generatori:", 155, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT k.kun::date AS kun", 155, 375, { size: 18, color: '#fff', fam: MONO });
      text("FROM generate_series(", 155, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       '2026-02-01'::timestamp,", 155, 455, { size: 18, color: '#fbbf24', fam: MONO });
      text("       '2026-02-06'::timestamp,", 155, 495, { size: 18, color: '#fbbf24', fam: MONO });
      text("       '1 day'::interval", 155, 535, { size: 18, color: '#fbbf24', fam: MONO });
      text(") AS k(kun);", 155, 570, { size: 18, color: '#fff', fam: MONO });

      card(130, 600, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("PostgreSQL qulayligi:", 160, 640, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• generate_series to'g'ridan-to'g'ri timestamp va interval oladi.", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("• Hech qanday rekursiya chuqurligi yoki murakkab sintaksis shart emas.", 160, 720, { size: 16, color: C.ink, fam: UI });
      text("• 1 qatorda to'liq uzluksiz kalendar jadvali hosil qilinadi.", 160, 755, { size: 16, weight: 700, color: C.green, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Lekin bu ajoyib funksiya MySQL va SQLite da mavjud emas!", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: MySQL va SQLite CTE
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. MySQL va SQLite: Rekursiv CTE", 1400, 240, C.purple, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#581c87', p: k });
      text("WITH RECURSIVE k(kun) AS (", 1035, 330, { size: 16, weight: 700, color: '#c084fc', fam: MONO });
      text("  SELECT DATE '2026-02-01'                    -- Boshlang'ich", 1035, 370, { size: 16, color: '#fff', fam: MONO });
      text("  UNION ALL", 1035, 405, { size: 16, color: '#c084fc', fam: MONO });
      text("  SELECT kun + INTERVAL 1 DAY                 -- MySQL qadami", 1035, 440, { size: 16, color: '#86efac', fam: MONO });
      text("  -- SQLite: date(kun, '+1 day')", 1035, 475, { size: 16, color: '#94a3b8', fam: MONO });
      text("  FROM k WHERE kun < '2026-02-06'             -- To'xtash sharti", 1035, 510, { size: 16, color: '#fbbf24', fam: MONO });
      text(")", 1035, 545, { size: 16, color: '#c084fc', fam: MONO });
      text("SELECT * FROM k;", 1035, 575, { size: 16, color: '#fff', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#faf5ff', col: C.purple, p: k });
      text("Rekursiv CTE xususiyatlari:", 1040, 640, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• MySQL va SQLite da universal ishlaydi.", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("• 30-bobda o'rganilgan cte_max_recursion_depth sukutda 1000 qator.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("• Katta oraliqlar (3 yildan ortiq) uchun sozlamani oshirish zarur.", 1040, 755, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(1010, 805, 780, 125, { fill: '#f0fdf4', col: C.green, p: k });
      text("Har ikkala usul yakunda LEFT JOIN bilan bir xil toza hisobot beradi.", 1040, 850, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. FARQ VA OY OXIRI (40.07s - 53.95s)
  function sFarq(t) {
    heading("3. Sanalar Farqi va LAST_DAY Imkoniyatlari", t, TM.scenes.farq_va_oy_oxiri.s);

    const k = P(t, TM.scenes.farq_va_oy_oxiri.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Farq
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Farq: TIMESTAMPDIFF va DATEDIFF", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- 2024-01-15 va 2026-03-01 farqi (MySQL):", 155, 330, { size: 16, color: '#93c5fd', fam: MONO });
      text("SELECT TIMESTAMPDIFF(MONTH, '2024-01-15', '2026-03-01');", 155, 375, { size: 17, color: '#86efac', fam: MONO });
      text("--> 25 (Oylar soni butun son sifatida)", 155, 410, { size: 16, color: '#fbbf24', fam: MONO });
      text("SELECT DATEDIFF('2026-03-01', '2024-01-15');", 155, 455, { size: 17, color: '#86efac', fam: MONO });
      text("--> 776 (Kunlar soni)", 155, 490, { size: 16, color: '#fbbf24', fam: MONO });
      sline(155, 520, 880, 520, { col: '#334155', w: 1.5 });
      text("DIQQAT: TIMESTAMPDIFF(birlik, a, b) = b - a, DATEDIFF(a, b) = a - b!", 155, 555, { size: 14, weight: 700, color: '#f87171', fam: MONO });

      card(130, 600, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Argumentlar tartibidagi tuzoq!", 160, 640, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• MySQL da TIMESTAMPDIFF da avval kichik sana, keyin katta sana qo'yiladi.", 160, 685, { size: 15, color: C.ink, fam: UI });
      text("• DATEDIFF da esa avval katta sana, keyin kichik sana qo'yiladi!", 160, 720, { size: 15, weight: 700, color: C.red, fam: UI });
      text("• SQLite da esa julianday(b) - julianday(a) orqali kunlar topiladi.", 160, 755, { size: 15, color: C.soft, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("PostgreSQL dagi age() esa inson tushunadigan ramziy yil-oy-kun beradi.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: LAST_DAY
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Oy Oxirini Topish: LAST_DAY vs Modifikator", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("-- 2026-02-10 ning oy oxirgi kuni:", 1035, 330, { size: 16, color: '#86efac', fam: MONO });
      text("MySQL 9.7 (O'rnatilgan LAST_DAY):", 1035, 370, { size: 17, color: '#fff', fam: UI });
      text("SELECT LAST_DAY('2026-02-10');              --> '2026-02-28'", 1035, 405, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("SQLite 3.54 (Modifikator bilan):", 1035, 450, { size: 17, color: '#fff', fam: UI });
      text("SELECT date('2026-02-10', 'end of month');   --> '2026-02-28'", 1035, 485, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("PostgreSQL (Interval arifmetikasi):", 1035, 525, { size: 17, color: '#fff', fam: UI });
      text("(date_trunc('month', d) + '1 mon - 1 day')::date", 1035, 555, { size: 16, color: '#fbbf24', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("LAST_DAY afzalligi:", 1040, 640, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Kabisa yillarini (masalan: 2024-fevral 29 kun) avtomatik hisoblaydi.", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("• Oylik buxgalteriya yopilishi va oylik hisobotlarda juda ommabop.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("• SQLite dagi 'end of month' ham xuddi shu vazifani o'ta qulay bajaradi.", 1040, 755, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Uchala tizimda ham oy oxirini topish mexanizmi mavjud va ishonchli.", 1040, 850, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 5. JORIY VAQT VA MATRITSA (53.95s - 70.08s)
  function sJoriyVaqt(t) {
    heading("4. Joriy Vaqt va Solishtirma Matritsa", t, TM.scenes.joriy_vaqt_va_matritsa.s);

    const k = P(t, TM.scenes.joriy_vaqt_va_matritsa.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: now vs NOW vs SYSDATE
      card(100, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("1. now(), NOW() va SYSDATE() Farqi", 520, 240, C.purple, k, 19);

      card(130, 290, 780, 270, { fill: '#1e293b', col: '#581c87', p: k });
      text("PostgreSQL: now()", 155, 330, { size: 17, weight: 700, color: '#86efac', fam: UI });
      text("• TRANZAKSIYA boshlangan vaqtda qotib turadi.", 155, 365, { size: 16, color: '#fff', fam: UI });
      text("• Tranzaksiya 1 soat davom etsa ham, now() o'zgarmaydi!", 155, 400, { size: 16, color: '#cbd5e1', fam: UI });
      sline(155, 425, 880, 425, { col: '#475569', w: 1.5 });
      text("MySQL 9.7: NOW() vs SYSDATE()", 155, 460, { size: 17, weight: 700, color: '#fbbf24', fam: UI });
      text("• NOW() faqat OPERATOR boshlangan vaqtni beradi.", 155, 495, { size: 16, color: '#fff', fam: UI });
      text("• SYSDATE() esa chaqirilgan LAHZA vaqtini beradi (SLEEP da o'zgaradi!).", 155, 530, { size: 15, weight: 700, color: '#fca5a5', fam: UI });

      card(130, 590, 780, 190, { fill: '#faf5ff', col: C.purple, p: k });
      text("Nega bu muhim?", 160, 630, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• SYSDATE() replikatsiyada xavfli bo'lishi mumkin (master va slave farqi).", 160, 675, { size: 16, color: C.ink, fam: UI });
      text("• Shuning uchun MySQL da ham odatda NOW() ishlatiladi.", 160, 715, { size: 16, color: C.ink, fam: UI });
      text("• SQLite da esa 'now' bitta qadam ichida bir xil qiymat saqlaydi.", 160, 750, { size: 16, color: C.soft, fam: UI });

      card(130, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Har qanday biznes tizimida tranzaksiyaviy izchillik uchun now() ideal vosita.", 160, 855, { size: 17, weight: 700, color: C.green, fam: UI });

      // O'ng: Solishtirma matritsa
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. 3 Dialekt Yakuniy Solishtirma Jadvali", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 380, { fill: '#1e293b', col: '#334155', p: k });
      text("Vazifa               Postgres 18      MySQL 9.7        SQLite 3.54", 1035, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });

      const matrix = [
        { op: "Sana Tipi", pg: "timestamp(tz)", my: "DATETIME", sq: "text (ISO 8601)", alert: false },
        { op: "Oy boshi", pg: "date_trunc()", my: "DATE_FORMAT", sq: "start of month", alert: true },
        { op: "15 daqiqa savat", pg: "date_bin()", my: "Yo'q", sq: "Yo'q", alert: true },
        { op: "Dushanba kuni", pg: "1 (isodow)", my: "2 (DAYOFWEEK)", sq: "1 (%u)", alert: true },
        { op: "Bo'sh kunlar", pg: "generate_series", my: "Recursive CTE", sq: "Recursive CTE", alert: true },
        { op: "Oy oxiri", pg: "+1 mon -1 day", my: "LAST_DAY()", sq: "end of month", alert: false },
        { op: "Sanalar farqi", pg: "age(), interval", my: "TIMESTAMPDIFF", sq: "julianday, diff", alert: false },
        { op: "now() doimiylik", pg: "Tranzaksiya", my: "Operator", sq: "Step davomida", alert: true },
      ];

      matrix.forEach((m, idx) => {
        const myy = 380 + idx * 35;
        text(m.op.padEnd(19), 1035, myy, { size: 14, color: '#fff', fam: MONO });
        text(m.pg.padEnd(17), 1210, myy, { size: 14, color: '#86efac', fam: MONO });
        text(m.my.padEnd(17), 1380, myy, { size: 14, color: m.alert ? '#fca5a5' : '#fbbf24', fam: MONO });
        text(m.sq, 1550, myy, { size: 14, color: '#cbd5e1', fam: MONO });
      });

      card(1010, 700, 780, 230, { fill: '#f0fdf4', col: C.green, p: k });
      text("Portativ SQL Tavsiyalari:", 1040, 745, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1. Sanalarni saqlashda sana tipidan foydalaning, hech qachon satrga o'girmang.", 1040, 795, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("2. Hafta kunlarida doimo ISO 8601 (isodow yoki %u) standartini tanlang.", 1040, 835, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("3. Davriy hisobotlarda bo'sh kunlarni kalendar generatori bilan to'ldiring.", 1040, 875, { size: 16, color: C.blue, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.hafta_kuni_va_trunc.s) {
      sKirish(t);
    } else if (t < TM.scenes.bosh_kunlar_va_cte.s) {
      sHaftaKuni(t);
    } else if (t < TM.scenes.farq_va_oy_oxiri.s) {
      sBoshKunlar(t);
    } else if (t < TM.scenes.joriy_vaqt_va_matritsa.s) {
      sFarq(t);
    } else {
      sJoriyVaqt(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
