// SQL 34-bob 1-qism: "Tushuncha" — Sana funksiyalari
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

  // 1. KIRISH (0s - 12.14s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("34-bob. Sana Funksiyalari", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Hisobotlar, Yaxlitlash va Guruhlarni Qurish", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("EXTRACT, date_trunc, bo'sh kunlarni to'ldirish va tranzaksiya vaqti", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Sana'), 0.8);
    withA(kCards, () => {
      const items = [
        {
          name: "Qismini Ajratish",
          tag: "EXTRACT(field FROM t)",
          col: C.blue,
          points: [
            "• year, month, day, hour",
            "• Hafta kuni: dow vs isodow",
            "• Tizimlararo raqamlash farqi",
            "• epoch: 1970 dan soniyalar",
          ]
        },
        {
          name: "Yaxlitlash",
          tag: "date_trunc & date_bin",
          col: C.green,
          points: [
            "• date_trunc('month', ...)",
            "• Yilni to'liq saqlaydi",
            "• date_bin: 15 daqiqalik savat",
            "• Oylik hisobotlarning asosi",
          ]
        },
        {
          name: "Bo'sh Kunlar",
          tag: "generate_series & JOIN",
          col: C.orange,
          points: [
            "• GROUP BY bo'sh kunni tashlaydi",
            "• Kalendar bilan LEFT JOIN",
            "• count(id) vs count(*)",
            "• COALESCE(sum, 0) bilan to'ldirish",
          ]
        },
        {
          name: "Farq va Joriy Vaqt",
          tag: "age() va now()",
          col: C.purple,
          points: [
            "• age: ramziy yil-oy-kun",
            "• now() = tranzaksiya boshi",
            "• statement_timestamp: operator",
            "• clock_timestamp: real soat",
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

  // 2. EXTRACT VA HAFTA KUNI (12.14s - 29.02s)
  function sExtract(t) {
    heading("1. EXTRACT va Hafta Kuni Raqamlash Tuzog'i", t, TM.scenes.extract_va_hafta_kuni.s);

    const k = P(t, TM.scenes.extract_va_hafta_kuni.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: EXTRACT maydonlari
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. EXTRACT(maydon FROM vaqt)", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 250, { fill: '#1e293b', col: '#334155', p: k });
      text("-- EXTRACT sana/vaqtdan qismni numeric sifatida oladi:", 155, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT EXTRACT(year   FROM vaqt) AS yil,   -- 2026", 155, 375, { size: 18, color: '#fff', fam: MONO });
      text("       EXTRACT(month  FROM vaqt) AS oy,    -- 2", 155, 415, { size: 18, color: '#fff', fam: MONO });
      text("       EXTRACT(day    FROM vaqt) AS kun,   -- 2", 155, 455, { size: 18, color: '#fff', fam: MONO });
      text("       EXTRACT(epoch  FROM vaqt) AS epoch; -- 1770026700", 155, 495, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(130, 570, 780, 200, { fill: '#eff6ff', col: C.blue, p: k });
      text("Asosiy maydonlar:", 160, 610, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• year, month, day, hour, minute, second", 160, 655, { size: 17, color: C.ink, fam: UI });
      text("• epoch: 1970-01-01 UTC dan boshlab o'tgan soniyalar soni.", 160, 695, { size: 17, color: C.ink, fam: UI });
      text("• dow va isodow: hafta kunini ifodalovchi sonlar.", 160, 735, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(130, 800, 780, 130, { fill: '#fffbeb', col: C.orange, p: k });
      text("Katta noziklik: Hafta kunini hisoblashda turli tizimlar", 160, 840, { size: 17, color: C.ink, fam: UI });
      text("dushanba va yakshanbaga har xil raqam beradi!", 160, 880, { size: 18, weight: 700, color: C.orange, fam: UI });

      // O'ng: Hafta kuni taqqoslash jadvali
      card(980, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("2. Hafta Kuni: Tizimlararo Solishtiruv", 1400, 240, C.orange, k, 19);

      card(1010, 290, 780, 310, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("Funksiya                  Dushanba   Shanba   Yakshanba", 1035, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });

      const wdays = [
        { name: "PG extract(dow ...)", d: "1", sh: "6", ya: "0 (Tuzoq!)", alert: true },
        { name: "PG extract(isodow ...)", d: "1", sh: "6", ya: "7 (ISO 8601)", alert: false },
        { name: "MySQL DAYOFWEEK()", d: "2", sh: "7", ya: "1 (ODBC)", alert: true },
        { name: "MySQL WEEKDAY()", d: "0", sh: "5", ya: "6", alert: true },
        { name: "SQLite strftime('%w')", d: "1", sh: "6", ya: "0", alert: true },
        { name: "SQLite strftime('%u')", d: "1", sh: "6", ya: "7 (ISO 8601)", alert: false },
      ];

      wdays.forEach((w, idx) => {
        const wy = 380 + idx * 36;
        text(w.name.padEnd(25), 1035, wy, { size: 15, color: '#fff', fam: MONO });
        text(w.d.padEnd(11), 1300, wy, { size: 15, color: '#86efac', fam: MONO });
        text(w.sh.padEnd(9), 1420, wy, { size: 15, color: '#cbd5e1', fam: MONO });
        text(w.ya, 1530, wy, { size: 15, weight: 700, color: w.alert ? '#fca5a5' : '#86efac', fam: MONO });
      });

      card(1010, 630, 780, 190, { fill: '#fff5f5', col: C.red, p: k });
      text("TAVSIYA: ISO 8601 Standarti (isodow)", 1040, 670, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• O'zbekistonda va xalqaro ISO 8601 da hafta Dushanbadan boshlanadi.", 1040, 715, { size: 16, color: C.ink, fam: UI });
      text("• Dushanba = 1, Seshanba = 2, ..., Yakshanba = 7.", 1040, 750, { size: 16, weight: 700, color: '#16a34a', fam: UI });
      text("• PostgreSQL da isodow, SQLite da '%u' dan foydalaning!", 1040, 785, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(1010, 845, 780, 85, { fill: '#f0fdf4', col: C.green, p: k });
      text("Standart isodow adashishlarning va haftalik xatoliklarning oldini oladi.", 1040, 895, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. YAXLITLASH: TRUNC VA BIN (29.02s - 42.39s)
  function sYaxlitlash(t) {
    heading("2. Yaxlitlash: date_trunc va date_bin", t, TM.scenes.yaxlitlash_trunc_va_bin.s);

    const k = P(t, TM.scenes.yaxlitlash_trunc_va_bin.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: date_trunc
      card(100, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("1. Oylik Hisobot: date_trunc('month', ...)", 520, 240, C.green, k, 19);

      card(130, 290, 780, 250, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Oy boshiga yaxlitlab guruhlash:", 155, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT date_trunc('month', vaqt) AS oy,", 155, 375, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       count(*) AS soni, sum(summa) AS jami", 155, 415, { size: 18, color: '#fff', fam: MONO });
      text("FROM sotuvlar GROUP BY 1 ORDER BY 1;", 155, 455, { size: 18, color: '#94a3b8', fam: MONO });
      sline(155, 480, 880, 480, { col: '#334155', w: 1.5 });
      text("2026-02-15 10:20:00  -->  2026-02-01 00:00:00", 155, 510, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });

      card(130, 570, 780, 210, { fill: '#f0fdf4', col: C.green, p: k });
      text("Nega EXTRACT(month ...) emas?", 160, 610, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Agar EXTRACT(month) bilan guruhlasangiz, 2025-yil fevrali bilan", 160, 655, { size: 16, color: C.ink, fam: UI });
      text("  2026-yil fevrali bitta '2' guruhiga qo'shilib ketadi!", 160, 690, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• date_trunc esa YILNI saqlaydi (2025-02-01 va 2026-02-01 alohida).", 160, 725, { size: 16, weight: 700, color: C.green, fam: UI });
      text("• Har qanday davriy hisobotda doimo date_trunc ishlatiladi.", 160, 760, { size: 16, color: C.soft, fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("date_trunc('hour', t) — soat boshiga, date_trunc('year', t) — yil boshiga.", 160, 855, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: date_bin
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. Oraliq Savatlar: date_bin('15 minutes', ...)", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 250, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- Ixtiyoriy 15 daqiqalik oraliqqa bo'lish:", 1040, 330, { size: 16, color: '#93c5fd', fam: MONO });
      text("SELECT id, vaqt,", 1040, 375, { size: 18, color: '#fff', fam: MONO });
      text("       date_bin('15 minutes', vaqt, '2026-01-01') AS chorak", 1040, 415, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("FROM sotuvlar WHERE id IN (3, 4);", 1040, 455, { size: 18, color: '#94a3b8', fam: MONO });
      sline(1040, 480, 1750, 480, { col: '#334155', w: 1.5 });
      text("10:05:00 -> 10:00:00 (1-chorak), 10:21:00 -> 10:15:00 (2-chorak)", 1040, 510, { size: 16, color: '#86efac', fam: MONO });

      card(1010, 570, 780, 210, { fill: '#eff6ff', col: C.blue, p: k });
      text("date_bin ning afzalligi:", 1040, 610, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• date_trunc faqat kalendar birliklariga (soat, kun, oy) yaxlitlaydi.", 1040, 655, { size: 16, color: C.ink, fam: UI });
      text("• date_bin esa ixtiyoriy oraliq: 15 daqiqa, 5 soniya, 6 soat.", 1040, 690, { size: 16, weight: 700, color: C.blue, fam: UI });
      text("• Monitoring, sensorlar (IoT) va server yuklamasini tahlil qilishda zarur.", 1040, 725, { size: 16, color: C.ink, fam: UI });
      text("• PostgreSQL 14+ versiyasida kiritilgan standart funksiya.", 1040, 760, { size: 15, color: C.soft, fam: UI });

      card(1010, 810, 780, 120, { fill: '#fffbeb', col: C.orange, p: k });
      text("MySQL muqobili: DATE_FORMAT, SQLite da esa start of month modifikatori.", 1040, 855, { size: 17, weight: 700, color: C.orange, fam: UI });
    });
  }

  // 4. BO'SH KUNLAR VA ORALIQ (42.39s - 55.52s)
  function sBoshKunlar(t) {
    heading("3. Bo'sh Kunlarni To'ldirish (Gap-Filling)", t, TM.scenes.bosh_kunlar_va_oraliq.s);

    const k = P(t, TM.scenes.bosh_kunlar_va_oraliq.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Muammo va So'rov
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. Kalendar Generator: generate_series", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 270, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT k.kun::date AS kun, count(s.id) AS soni,", 155, 330, { size: 17, color: '#fff', fam: MONO });
      text("       COALESCE(sum(s.summa), 0) AS jami", 155, 365, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("FROM generate_series('2026-02-01'::timestamp,", 155, 405, { size: 17, color: '#fbbf24', fam: MONO });
      text("                     '2026-02-06'::timestamp,", 155, 440, { size: 17, color: '#fbbf24', fam: MONO });
      text("                     '1 day'::interval) AS k(kun)", 155, 475, { size: 17, color: '#fbbf24', fam: MONO });
      text("LEFT JOIN sotuvlar s", 155, 510, { size: 17, weight: 700, color: '#93c5fd', fam: MONO });
      text("  ON s.vaqt >= k.kun AND s.vaqt < k.kun + interval '1 day'", 155, 540, { size: 16, color: '#93c5fd', fam: MONO });

      card(130, 590, 780, 190, { fill: '#fffbeb', col: C.orange, p: k });
      text("Kutilayotgan natija (Bo'sh kunlar 0 bilan chiqadi):", 160, 630, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("2026-02-01 | soni: 0 | jami: 0   <-- Savdo bo'lmagan!", 160, 675, { size: 17, weight: 700, color: '#b45309', fam: MONO });
      text("2026-02-02 | soni: 2 | jami: 250 <-- Savdo bor", 160, 715, { size: 17, weight: 700, color: '#15803d', fam: MONO });
      text("2026-02-03 | soni: 0 | jami: 0   <-- Kalendar buzilmaydi", 160, 750, { size: 17, color: C.ink, fam: MONO });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("Chizma va grafiklarga ma'lumot berishda uzluksiz kunlar ketma-ketligi shart.", 160, 855, { size: 16, weight: 700, color: C.blue, fam: UI });

      // O'ng: 3 ta qoida
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. Hisobotdagi 3 Ta Oltin Qoida", 1400, 240, C.purple, k, 19);

      const rules = [
        {
          num: "1",
          title: "Yarim Ochiq Oraliq (>= va <)",
          desc: "s.vaqt >= kun AND s.vaqt < kun + 1 day. 23:59:59 dagi savdo ham to'g'ri kunga tushadi. vaqt::date = kun dan ko'ra indeksga qulay!",
          col: C.blue,
        },
        {
          num: "2",
          title: "count(s.id) — count(*) emas!",
          desc: "LEFT JOIN bo'sh kunga NULL qator ulaydi. count(*) bo'sh kunga 1 deb xato hisoblaydi! count(s.id) esa to'g'ri 0 beradi.",
          col: C.red,
        },
        {
          num: "3",
          title: "COALESCE(sum(summa), 0)",
          desc: "Bo'sh kunda hech qanday summa bo'lmagani uchun sum() NULL qaytaradi. COALESCE uni 0 ga aylantirib hisobotni toza qiladi.",
          col: C.green,
        },
      ];

      rules.forEach((r, i) => {
        const ry = 300 + i * 165;
        card(1010, ry, 780, 145, { fill: '#faf5ff', col: r.col, p: k });
        text(`${r.num}. ${r.title}`, 1035, ry + 40, { size: 20, weight: 700, color: r.col, fam: UI });
        text(r.desc, 1035, ry + 80, { size: 15, color: C.ink, fam: UI, maxW: 730 });
      });

      card(1010, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("MySQL va SQLite da generate_series o'rniga RECURSIVE CTE ishlatiladi.", 1040, 855, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. FARQ VA JORIY VAQT (55.52s - 70.72s)
  function sFarq(t) {
    heading("4. Sanalar Farqi va Joriy Vaqt Tranzaksiyada", t, TM.scenes.farq_va_joriy_vaqt.s);

    const k = P(t, TM.scenes.farq_va_joriy_vaqt.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Sanalar farqi
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Sanalar Farqini O'lchash", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 270, { fill: '#1e293b', col: '#334155', p: k });
      text("-- 2026-03-01 va 2024-01-15 orasidagi farq:", 155, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT age('2026-03-01', '2024-01-15');", 155, 375, { size: 18, color: '#fff', fam: MONO });
      text("--> '2 years 1 mon 17 days' (Ramziy natija!)", 155, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(155, 440, 880, 440, { col: '#475569', w: 1.5 });
      text("timestamp - timestamp  --> '776 days' (interval)", 155, 475, { size: 17, color: '#93c5fd', fam: MONO });
      text("date - date            --> 776 (butun son, kunlar)", 155, 515, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });

      card(130, 590, 780, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("Farqlarning mohiyati:", 160, 630, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• age(b, a): odamning yoshi yoki tajribasini ko'rsatishda ideal.", 160, 675, { size: 16, color: C.ink, fam: UI });
      text("• date ayirmasi: to'g'ridan-to'g'ri kunlar sonini butun son qilib beradi.", 160, 715, { size: 16, color: C.ink, fam: UI });
      text("• MySQL da TIMESTAMPDIFF(MONTH, a, b) yoki DATEDIFF(b, a) ishlatiladi.", 160, 750, { size: 16, color: C.soft, fam: UI });

      card(130, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qulaylik: Hisob-kitob uchun son (kunlar), foydalanuvchiga esa age() ko'rsatiladi.", 160, 855, { size: 16, weight: 700, color: C.green, fam: UI });

      // O'ng: Joriy vaqt tranzaksiyada
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. now() va Tranzaksiya Xususiyati", 1400, 240, C.purple, k, 19);

      card(1010, 290, 780, 270, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- Tranzaksiya ichida vaqt tekshiruvi:", 1040, 330, { size: 16, color: '#c084fc', fam: MONO });
      text("BEGIN;", 1040, 370, { size: 18, color: '#fff', fam: MONO });
      text("SELECT now();                 -- Masalan: 12:00:00.000", 1040, 405, { size: 17, color: '#86efac', fam: MONO });
      text("SELECT pg_sleep(5);          -- 5 soniya kutish", 1040, 440, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT now();                 -- Hali ham: 12:00:00.000!", 1040, 475, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("SELECT clock_timestamp();     -- Haqiqiy: 12:00:05.000", 1040, 510, { size: 17, color: '#fbbf24', fam: MONO });
      text("COMMIT;", 1040, 545, { size: 18, color: '#fff', fam: MONO });

      card(1010, 590, 780, 190, { fill: '#faf5ff', col: C.purple, p: k });
      text("Nega now() tranzaksiyada o'zgarmaydi?", 1040, 630, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Tranzaksiyadagi barcha jadvallarga bir xil vaqt belgisi tushishi shart.", 1040, 675, { size: 16, color: C.ink, fam: UI });
      text("• Masalan: order va order_items bir vaqtda yaratilgan bo'lishi kerak.", 1040, 715, { size: 16, weight: 700, color: C.purple, fam: UI });
      text("• statement_timestamp() operator boshini, clock_timestamp() real soatni beradi.", 1040, 750, { size: 16, color: C.ink, fam: UI });

      card(1010, 810, 780, 120, { fill: '#fffbeb', col: C.orange, p: k });
      text("MySQL da NOW() operator boshini, SYSDATE() chaqirilgan paytni beradi.", 1040, 855, { size: 17, weight: 700, color: C.orange, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.extract_va_hafta_kuni.s) {
      sIntro(t);
    } else if (t < TM.scenes.yaxlitlash_trunc_va_bin.s) {
      sExtract(t);
    } else if (t < TM.scenes.bosh_kunlar_va_oraliq.s) {
      sYaxlitlash(t);
    } else if (t < TM.scenes.farq_va_joriy_vaqt.s) {
      sBoshKunlar(t);
    } else {
      sFarq(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
