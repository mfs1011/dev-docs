// SQL 34-bob 2-qism: "Kod" — Sana funksiyalari amalda
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

  // 1. JADVAL VA EXTRACT (0s - 13.22s)
  function sKirish(t) {
    heading("Sana Funksiyalari: Amaliy So'rovlar va EXTRACT", t, TM.scenes.kirish.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      // Chap: sotuvlar jadvali
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Boshlang'ich Jadval: sotuvlar", 520, 240, C.blue, k, 19);

      const rows = [
        { id: 1, vaqt: '2026-01-30 09:12:00', summa: 120 },
        { id: 2, vaqt: '2026-01-31 18:47:30', summa:  80 },
        { id: 3, vaqt: '2026-02-02 10:05:00', summa: 200 },
        { id: 4, vaqt: '2026-02-02 10:21:00', summa:  50 },
        { id: 5, vaqt: '2026-02-05 23:59:59', summa:  70 },
        { id: 6, vaqt: '2026-03-01 00:00:00', summa:  90 },
      ];

      card(130, 290, 780, 290, { fill: '#1e293b', col: '#334155', p: k });
      text("id   vaqt                   summa", 155, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(155, 345, 880, 345, { col: '#475569', w: 1.5 });

      rows.forEach((r, idx) => {
        const ry = 375 + idx * 36;
        text(`${r.id}`, 155, ry, { size: 15, color: '#fbbf24', fam: MONO });
        text(`${r.vaqt}`, 200, ry, { size: 15, color: '#fff', fam: MONO });
        text(`${r.summa} $`, 430, ry, { size: 15, color: '#86efac', fam: MONO });
      });

      card(130, 610, 780, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Jadvaldagi ma'lumotlar xususiyati:", 160, 650, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Yanvar, Fevral va Mart oylari bo'yicha savdolar.", 160, 695, { size: 16, color: C.ink, fam: UI });
      text("• 3 va 4-qatorlar bir xil soatda (10:05 va 10:21) sodir bo'lgan.", 160, 730, { size: 16, color: C.ink, fam: UI });
      text("• 6-qator: 2026-03-01 — Yakshanba kuni!", 160, 765, { size: 16, weight: 700, color: C.orange, fam: UI });

      card(130, 815, 780, 115, { fill: '#f0fdf4', col: C.green, p: k });
      text("Ushbu ma'lumotlar bilan sana qismlarini ajratamiz va hisobotlar quramiz.", 160, 855, { size: 17, weight: 700, color: C.green, fam: UI });

      // O'ng: EXTRACT so'rovi
      card(980, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("2. EXTRACT Bilan Yil, Oy va Hafta Kuni", 1400, 240, C.orange, k, 19);

      card(1010, 290, 780, 290, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT id, vaqt,", 1035, 330, { size: 16, color: '#fff', fam: MONO });
      text("       extract(year FROM vaqt)   AS yil,", 1035, 365, { size: 16, color: '#93c5fd', fam: MONO });
      text("       extract(month FROM vaqt)  AS oy,", 1035, 400, { size: 16, color: '#93c5fd', fam: MONO });
      text("       extract(dow FROM vaqt)    AS dow,", 1035, 435, { size: 16, color: '#f87171', fam: MONO });
      text("       extract(isodow FROM vaqt) AS isodow", 1035, 470, { size: 16, color: '#86efac', fam: MONO });
      text("FROM sotuvlar ORDER BY id;", 1035, 505, { size: 16, color: '#94a3b8', fam: MONO });
      sline(1035, 530, 1750, 530, { col: '#334155', w: 1.5 });
      text("Natija: 2026-03-01 da DOW = 0, ammo ISODOW = 7!", 1035, 555, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });

      card(1010, 610, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Hafta kuni farqiga diqqat!", 1040, 650, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• DOW (Day Of Week): Yakshanba = 0, Dushanba = 1, Shanba = 6.", 1040, 695, { size: 16, color: C.ink, fam: UI });
      text("• ISODOW (ISO 8601): Dushanba = 1, Shanba = 6, Yakshanba = 7.", 1040, 730, { size: 16, weight: 700, color: '#16a34a', fam: UI });
      text("• Biznes hisobotlarida adashmaslik uchun doimo ISODOW ishlating!", 1040, 765, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(1010, 815, 780, 115, { fill: '#eff6ff', col: C.blue, p: k });
      text("ISODOW tufayli Dushanba 1-kun, Yakshanba esa 7-kun deb to'g'ri olinadi.", 1040, 855, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 2. OYLIK HISOBOT: DATE_TRUNC (13.22s - 25.16s)
  function sTrunc(t) {
    heading("Oylik Hisobot: date_trunc Bilan Guruhlash", t, TM.scenes.oylik_hisobot_trunc.s);

    const k = P(t, TM.scenes.oylik_hisobot_trunc.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: SQL so'rovi
      card(100, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("1. Oylik Guruhlash So'rovi", 520, 240, C.green, k, 19);

      card(130, 290, 780, 270, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Oy boshiga yaxlitlab hisobot qurish:", 155, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT date_trunc('month', vaqt) AS oy,", 155, 375, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       count(*)                  AS soni,", 155, 415, { size: 18, color: '#fff', fam: MONO });
      text("       sum(summa)                AS jami", 155, 455, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      text("FROM sotuvlar", 155, 495, { size: 18, color: '#fff', fam: MONO });
      text("GROUP BY 1 ORDER BY 1;", 155, 530, { size: 18, color: '#94a3b8', fam: MONO });

      card(130, 590, 780, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qanday ishlaydi?", 160, 630, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• date_trunc('month', ...) barcha vaqtlarni oy boshiga keltirib beradi.", 160, 675, { size: 16, color: C.ink, fam: UI });
      text("• 2026-01-30 va 2026-01-31 ikkalasi ham '2026-01-01 00:00:00' bo'ladi.", 160, 715, { size: 16, color: C.ink, fam: UI });
      text("• GROUP BY 1 esa aynan shu oy boshi bo'yicha birlashtiradi.", 160, 750, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("Yil va oylar to'liq saqlangani uchun turli yillarning oylari aralashib ketmaydi.", 160, 855, { size: 16, weight: 700, color: C.blue, fam: UI });

      // O'ng: Natijalar jadvali
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. Haqiqiy PostgreSQL Chiqishi", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 270, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("         oy          | soni | jami ", 1035, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });
      text(" 2026-01-01 00:00:00 |    2 |  200", 1035, 390, { size: 18, color: '#86efac', fam: MONO });
      text(" 2026-02-01 00:00:00 |    3 |  320", 1035, 435, { size: 18, color: '#86efac', fam: MONO });
      text(" 2026-03-01 00:00:00 |    1 |   90", 1035, 480, { size: 18, color: '#86efac', fam: MONO });
      sline(1035, 510, 1750, 510, { col: '#334155', w: 1.5 });
      text("(3 rows) — Jami 6 ta savdo 3 oyga to'g'ri taqsimlandi!", 1035, 535, { size: 16, color: '#fbbf24', fam: MONO });

      card(1010, 590, 780, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("Nega EXTRACT(month) emas?", 1040, 630, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• EXTRACT(month) faqat 1, 2, 3 sonlarini qaytaradi.", 1040, 675, { size: 16, color: C.ink, fam: UI });
      text("• Agar ma'lumotlar bazasida bir necha yil bo'lsa, 2025-yanvar va", 1040, 715, { size: 16, color: C.ink, fam: UI });
      text("  2026-yanvar bitta guruhga qo'shilib xato beradi! date_trunc xavfsizdir.", 1040, 750, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Barcha analitik SQL hisobotlarida davriy guruhlash uchun date_trunc eng yaxshi tanlov.", 1040, 855, { size: 16, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. DATE_BIN VA CHORAK (25.16s - 36.72s)
  function sBin(t) {
    heading("15 Daqiqalik Oraliqlar: date_bin", t, TM.scenes.date_bin_va_chorak.s);

    const k = P(t, TM.scenes.date_bin_va_chorak.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: So'rov
      card(100, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("1. date_bin Bilan 15 Daqiqalik Savat", 520, 240, C.purple, k, 19);

      card(130, 290, 780, 270, { fill: '#1e293b', col: '#581c87', p: k });
      text("SELECT id, vaqt,", 155, 330, { size: 17, color: '#fff', fam: MONO });
      text("       date_trunc('hour', vaqt) AS soat,", 155, 370, { size: 17, color: '#93c5fd', fam: MONO });
      text("       date_bin('15 minutes', vaqt,", 155, 410, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("                timestamp '2026-01-01') AS chorak", 155, 445, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("FROM sotuvlar", 155, 485, { size: 17, color: '#fff', fam: MONO });
      text("WHERE id IN (3, 4) ORDER BY id;", 155, 520, { size: 17, color: '#94a3b8', fam: MONO });

      card(130, 590, 780, 190, { fill: '#faf5ff', col: C.purple, p: k });
      text("date_bin parametrlari:", 160, 630, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("1. Qadam (stride): '15 minutes', '5 seconds', '6 hours' kabi oraliq.", 160, 675, { size: 16, color: C.ink, fam: UI });
      text("2. Manba (source): tekshirilayotgan timestamp ustuni.", 160, 715, { size: 16, color: C.ink, fam: UI });
      text("3. Boshlanish (origin): hisoblash boshlanadigan tayanch nuqta.", 160, 750, { size: 16, color: C.ink, fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("date_bin soniyalar va daqiqalar bo'yicha nozik guruhlash uchun mo'ljallangan.", 160, 855, { size: 16, weight: 700, color: C.blue, fam: UI });

      // O'ng: Natijalar
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. Savatlarga Ajratish Natijasi", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 270, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("id |        vaqt         |        soat         |       chorak", 1035, 330, { size: 15, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });
      text(" 3 | 2026-02-02 10:05:00 | 2026-02-02 10:00:00 | 2026-02-02 10:00:00", 1035, 395, { size: 14, color: '#86efac', fam: MONO });
      text(" 4 | 2026-02-02 10:21:00 | 2026-02-02 10:00:00 | 2026-02-02 10:15:00", 1035, 445, { size: 14, color: '#fbbf24', fam: MONO });
      sline(1035, 480, 1750, 480, { col: '#334155', w: 1.5 });
      text("Ikkala sotuv bir soatda, lekin 1- va 2-choraklarda!", 1035, 515, { size: 16, color: '#86efac', fam: MONO });

      card(1010, 590, 780, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("Amaliy foydalanish:", 1040, 630, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Veb-saytdagi har daqiqalik trafigini 5 daqiqalik savatlarga joylash.", 1040, 675, { size: 16, color: C.ink, fam: UI });
      text("• Bank to'lov tizimlarida har 15 daqiqalik yuklamani hisoblash.", 1040, 715, { size: 16, color: C.ink, fam: UI });
      text("• date_trunc bunga qodir emas (chunki 15 daqiqa butun kalendar birligi emas).", 1040, 750, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(1010, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Monitoring va IoT tizimlari uchun date_bin o'ta kuchli qurol.", 1040, 855, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. BO'SH KUNLAR: GENERATE_SERIES (36.72s - 48.32s)
  function sBoshKunlar(t) {
    heading("Bo'sh Kunlarni To'ldirish: generate_series + LEFT JOIN", t, TM.scenes.bosh_kunlar_generate_series.s);

    const k = P(t, TM.scenes.bosh_kunlar_generate_series.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: So'rov
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. To'liq Kalendar Bilan LEFT JOIN", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT k.kun::date AS kun, count(s.id) AS soni,", 155, 330, { size: 16, color: '#fff', fam: MONO });
      text("       COALESCE(sum(s.summa), 0) AS jami", 155, 365, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("FROM generate_series('2026-02-01'::timestamp,", 155, 400, { size: 16, color: '#fbbf24', fam: MONO });
      text("                     '2026-02-06'::timestamp,", 155, 435, { size: 16, color: '#fbbf24', fam: MONO });
      text("                     '1 day'::interval) AS k(kun)", 155, 470, { size: 16, color: '#fbbf24', fam: MONO });
      text("LEFT JOIN sotuvlar s", 155, 505, { size: 16, weight: 700, color: '#93c5fd', fam: MONO });
      text("  ON s.vaqt >= k.kun AND s.vaqt < k.kun + interval '1 day'", 155, 535, { size: 15, color: '#93c5fd', fam: MONO });
      text("GROUP BY k.kun ORDER BY k.kun;", 155, 565, { size: 16, color: '#94a3b8', fam: MONO });

      card(130, 600, 780, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Nega yarim ochiq oraliq (>= va <)?", 160, 640, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• 5-qator: 2026-02-05 23:59:59 da sodir bo'lgan.", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("• 's.vaqt < 2026-02-06 00:00:00' sharti tufayli u 5-fevralga tushadi.", 160, 720, { size: 16, color: C.ink, fam: UI });
      text("• vaqt::date = kun dan ko'ra yarim ochiq oraliq indeks bilan ishlaydi!", 160, 755, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("count(s.id) — bo'sh kunlarga to'g'ri 0 chiqarish uchun juda muhim.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: Haqiqiy Natijalar
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Olti Kunlik Toza Kalendar Chiqishi", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("    kun     | soni | jami ", 1035, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });
      text(" 2026-02-01 |    0 |    0   <-- Savdo bo'lmagan", 1035, 380, { size: 16, color: '#fca5a5', fam: MONO });
      text(" 2026-02-02 |    2 |  250   <-- 2 ta savdo!", 1035, 415, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text(" 2026-02-03 |    0 |    0   <-- Bo'sh kun", 1035, 450, { size: 16, color: '#fca5a5', fam: MONO });
      text(" 2026-02-04 |    0 |    0   <-- Bo'sh kun", 1035, 485, { size: 16, color: '#fca5a5', fam: MONO });
      text(" 2026-02-05 |    1 |   70   <-- 23:59:59 dagi savdo", 1035, 520, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text(" 2026-02-06 |    0 |    0   <-- Bo'sh kun", 1035, 555, { size: 16, color: '#fca5a5', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Grafiklar uchun ideal ko'rinish:", 1040, 640, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Oddiy GROUP BY ishlatilganda faqat 2026-02-02 va 02-05 chiqardi.", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("• 4 ta bo'sh kun hisobotdan tushib qolib, grafik uzilib qolar edi.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("• generate_series to'liq 6 kunlik uzluksiz chiziq hosil qilib berdi.", 1040, 755, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Har doim dashboard va hisobotlarda bo'sh kunlarni generate_series bilan to'ldiring.", 1040, 850, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 5. FARQ VA OY OXIRI (48.32s - 62.42s)
  function sFarq(t) {
    heading("Sanalar Farqi (age) va Oy Oxirini Topish", t, TM.scenes.farq_oy_oxiri_va_now.s);

    const k = P(t, TM.scenes.farq_oy_oxiri_va_now.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: age va ayirma
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Sanalar Farqi: age() va Interval", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("SELECT age(timestamp '2026-03-01', timestamp '2024-01-15') AS yosh,", 155, 330, { size: 15, color: '#fff', fam: MONO });
      text("       timestamp '2026-03-01' - timestamp '2024-01-15'     AS ayirma,", 155, 365, { size: 15, color: '#fff', fam: MONO });
      text("       date '2026-03-01' - date '2024-01-15'               AS kunlar;", 155, 400, { size: 15, color: '#fff', fam: MONO });
      sline(155, 425, 880, 425, { col: '#475569', w: 1.5 });
      text("yosh:   2 years 1 mon 17 days  (Foydalanuvchiga qulay)", 155, 465, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("ayirma: 776 days               (Interval)", 155, 505, { size: 16, color: '#93c5fd', fam: MONO });
      text("kunlar: 776                    (Butun son)", 155, 545, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });

      card(130, 600, 780, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qaysi biri qachon kerak?", 160, 640, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• age(): ish staji, mijoz yoshi yoki kafolat muddatini ko'rsatishda.", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("• date - date: to'lov kechikkan kunlar sonini jarima hisoblashda.", 160, 720, { size: 16, color: C.ink, fam: UI });
      text("• Ikkalasi ham bir xil muddatni turli maqsadlar uchun ifodalaydi.", 160, 755, { size: 16, color: C.soft, fam: UI });

      card(130, 805, 780, 125, { fill: '#f0fdf4', col: C.green, p: k });
      text("PostgreSQL dagi age() funksiyasi taqvimiy oylar uzunligini hisobga oladi.", 160, 850, { size: 17, weight: 700, color: C.green, fam: UI });

      // O'ng: Oy oxiri va Formatlash
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Oy Oxirini Topish va to_char", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Oyning oxirgi kunini hisoblash:", 1040, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT (date_trunc('month', date '2026-02-10')", 1040, 370, { size: 17, color: '#fff', fam: MONO });
      text("       + interval '1 month - 1 day')::date AS oy_oxiri;", 1040, 405, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("--> Natija: '2026-02-28' (Fevral oxiri to'g'ri topildi!)", 1040, 445, { size: 16, color: '#fbbf24', fam: MONO });
      sline(1040, 470, 1750, 470, { col: '#334155', w: 1.5 });
      text("-- Formatlash:", 1040, 500, { size: 16, color: '#94a3b8', fam: MONO });
      text("to_char(vaqt, 'DD.MM.YYYY HH24:MI')  --> '05.02.2026 23:59'", 1040, 535, { size: 16, color: '#fff', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Oy oxirining matematik formulasi:", 1040, 640, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1. date_trunc('month', d) orqali oy boshiga kelamiz (01-kun).", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("2. Unga 1 oy qo'shib, keyingi oy boshiga o'tamiz.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("3. 1 kun ayirsak, avvalgi oyning eng oxirgi kuni hosil bo'ladi!", 1040, 755, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Keyingi qismda: MySQL va SQLite dagi farqlar va LAST_DAY funksiyasini ko'ramiz!", 1040, 850, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.oylik_hisobot_trunc.s) {
      sKirish(t);
    } else if (t < TM.scenes.date_bin_va_chorak.s) {
      sTrunc(t);
    } else if (t < TM.scenes.bosh_kunlar_generate_series.s) {
      sBin(t);
    } else if (t < TM.scenes.farq_oy_oxiri_va_now.s) {
      sBoshKunlar(t);
    } else {
      sFarq(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
