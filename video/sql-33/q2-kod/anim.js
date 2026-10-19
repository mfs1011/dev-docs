// SQL 33-bob 2-qism: "Kod" — Matn funksiyalari
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

  // 1. KIRISH VA JADVAL (0s - 12.44s)
  function sKirish(t) {
    heading("Matn Funksiyalari: Amaliy So'rovlar va NULL Bilan Ishlash", t, TM.scenes.kirish.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      // Chap: odamlar jadvali
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Boshlang'ich Jadval: odamlar", 520, 240, C.blue, k, 19);

      // Jadval boshi va qatorlari
      const rows = [
        { id: 1, ism: 'Ali', fam: 'Valiyev', ota: 'Karimovich', email: 'ali.valiyev@misol.uz', tel: '+998 (90) 123-45-67' },
        { id: 2, ism: 'Oʻgʻiloy', fam: 'Sobirova', ota: 'NULL', email: 'Misol.UZ', tel: '907654321' },
        { id: 3, ism: '  Jasur  ', fam: 'Tursunov', ota: 'NULL', email: 'NULL', tel: '+998-90-111-22-33' },
      ];

      card(130, 290, 780, 260, { fill: '#1e293b', col: '#334155', p: k });
      text("id  ism          familiya   otasining_ismi  email", 155, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(155, 345, 880, 345, { col: '#475569', w: 1.5 });

      rows.forEach((r, idx) => {
        const ry = 380 + idx * 50;
        text(`${r.id}`, 155, ry, { size: 16, color: '#fbbf24', fam: MONO });
        text(`${r.ism.padEnd(12)}`, 195, ry, { size: 16, color: '#fff', fam: MONO });
        text(`${r.fam.padEnd(10)}`, 320, ry, { size: 16, color: '#fff', fam: MONO });
        text(`${r.ota.padEnd(15)}`, 435, ry, { size: 16, color: r.ota === 'NULL' ? '#f87171' : '#86efac', fam: MONO });
        text(`${r.email}`, 590, ry, { size: 15, color: r.email === 'NULL' ? '#f87171' : '#93c5fd', fam: MONO });
      });

      card(130, 580, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Tuzoq: || bilan birlashtirish", 160, 620, { size: 21, weight: 700, color: C.red, fam: UI });
      text("SELECT ism || ' ' || otasining_ismi || ' ' || familiya;", 160, 665, { size: 17, weight: 700, color: '#991b1b', fam: MONO });
      text("• 1-qator: 'Ali Karimovich Valiyev' (To'g'ri)", 160, 705, { size: 16, color: C.ink, fam: UI });
      text("• 2 va 3-qator: NULL! Bitta NULL butun natijani yutib yuboradi!", 160, 740, { size: 17, weight: 700, color: C.red, fam: UI });

      card(130, 785, 780, 145, { fill: '#eff6ff', col: C.blue, p: k });
      text("Relyatsion ma'lumotlarda otasining ismi, korpus, kvartira", 160, 825, { size: 16, color: C.ink, fam: UI });
      text("kabi ustunlar juda tez-tez NULL bo'ladi. || operatori xavflidir!", 160, 865, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: concat_ws yechimi
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Toza Natija: CONCAT_WS()", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 260, { fill: '#1e293b', col: '#166534', p: k });
      text("-- concat_ws('ajratuvchi', ustun1, ustun2, ...)", 1040, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT id, CONCAT_WS(' ', familiya, ism, otasining_ismi)", 1040, 375, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("       AS toliq_ism", 1040, 410, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("FROM odamlar;", 1040, 445, { size: 17, color: '#94a3b8', fam: MONO });
      sline(1040, 465, 1750, 465, { col: '#334155', w: 1.5 });
      text("Natija: NULL lar o'tkazib yuboriladi, bo'shliqlar toza!", 1040, 505, { size: 16, color: '#86efac', fam: MONO });

      card(1010, 580, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("Jadvaldagi aniq chiqish:", 1040, 620, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1 | Valiyev Ali Karimovich", 1040, 665, { size: 18, weight: 700, color: C.ink, fam: MONO });
      text("2 | Sobirova Oʻgʻiloy       <-- ortiqcha bo'shliq yo'q!", 1040, 705, { size: 18, weight: 700, color: '#15803d', fam: MONO });
      text("3 | Tursunov   Jasur       <-- ismda bo'shliqlar bor!", 1040, 745, { size: 18, color: C.ink, fam: MONO });

      card(1010, 785, 780, 145, { fill: '#fffbeb', col: C.orange, p: k });
      text("Navbatdagi muammo: 3-qatordagi ism ichida keraksiz bo'shliqlar bor,", 1040, 825, { size: 16, color: C.ink, fam: UI });
      text("2-qatorda esa tutuq belgisi mavjud. Buni qanday tozalaymiz?", 1040, 865, { size: 17, weight: 700, color: C.orange, fam: UI });
    });
  }

  // 2. UZUNLIK VA TOZALASH (12.44s - 24.28s)
  function sUzunlik(t) {
    heading("Uzunlikni O'lchash va Tozalash: CHAR_LENGTH, TRIM va LOWER", t, TM.scenes.uzunlik_va_tozalash.s);

    const k = P(t, TM.scenes.uzunlik_va_tozalash.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Tutuq belgisi va baytlar
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. Belgilar vs Baytlar: 'Oʻgʻiloy'", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Oʻgʻiloy ismida 2 ta o'zbek tutuq belgisi (ʻ) bor:", 155, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT CHAR_LENGTH('Oʻgʻiloy')  AS belgilar,   -- 8", 155, 380, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       OCTET_LENGTH('Oʻgʻiloy') AS baytlar;    -- 10", 155, 425, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });
      sline(155, 455, 880, 455, { col: '#475569', w: 1.5 });
      text("Lotin harflari (O, g, i, l, o, y): har biri 1 bayt (jami 6 bayt)", 155, 490, { size: 15, color: '#cbd5e1', fam: UI });
      text("Tutuq belgisi (U+02BB modifier): har biri 2 bayt (jami 4 bayt)", 155, 525, { size: 15, weight: 700, color: '#f87171', fam: UI });

      card(130, 600, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("MySQL LENGTH() Tuzog'i:", 160, 640, { size: 21, weight: 700, color: C.red, fam: UI });
      text("PostgreSQL va SQLite da length('Oʻgʻiloy') --> 8 (Belgi)", 160, 685, { size: 17, color: C.ink, fam: MONO });
      text("MySQL 9.7 da LENGTH('Oʻgʻiloy')        --> 10 (BAYT!)", 160, 725, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("MySQL da belgilar soni uchun CHAR_LENGTH() yozish shart!", 160, 760, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qoida: Portativ SQL uchun doimo CHAR_LENGTH() funksiyasini ishlating.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: TRIM va LOWER
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. Bo'shliqlar va Registrni Tozalash", 1400, 240, C.purple, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- TRIM bilan bo'shliqlarni olib tashlash:", 1040, 330, { size: 16, color: '#c084fc', fam: MONO });
      text("SELECT TRIM('  Jasur  ')  AS toza_ism; -- 'Jasur'", 1040, 380, { size: 18, weight: 700, color: '#fff', fam: MONO });
      text("-- Emailni solishtirish uchun kichik harfga keltirish:", 1040, 425, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT LOWER('Misol.UZ')  AS toza_email; -- 'misol.uz'", 1040, 470, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("SELECT UPPER(familiya)   AS katta_familiya; -- 'VALIYEV'", 1040, 515, { size: 18, color: '#93c5fd', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#faf5ff', col: C.purple, p: k });
      text("Amaliy foydalanish:", 1040, 640, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Foydalanuvchi forma to'ldirganda telefon yoki email boshida", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("  tasodifiy bo'shliqlar qolib ketadi. TRIM ularni yo'qotadi.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("• LOWER(email) esa dublikat hisoblarni oldini oladi.", 1040, 755, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(1010, 805, 780, 125, { fill: '#f0fdf4', col: C.green, p: k });
      text("Barcha relyatsion bazalarda TRIM, LOWER, UPPER standartdir.", 1040, 850, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. KESISH VA QIDIRISH (24.28s - 35.56s)
  function sKesish(t) {
    heading("Kesish va Qidirish: SUBSTRING, LEFT, RIGHT va SPLIT_PART", t, TM.scenes.kesish_va_qidirish.s);

    const k = P(t, TM.scenes.kesish_va_qidirish.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: SUBSTRING va LEFT/RIGHT
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Kesib Olish: SUBSTRING, LEFT, RIGHT", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 290, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Familiya: 'Valiyev'", 155, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT SUBSTRING('Valiyev', 1, 3); -- 'Val' (1-o'rindan 3 ta)", 155, 375, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("SELECT LEFT('Valiyev', 3);          -- 'Val' (boshidan 3 ta)", 155, 420, { size: 18, color: '#86efac', fam: MONO });
      text("SELECT RIGHT('Valiyev', 2);         -- 'ev'  (oxiridan 2 ta)", 155, 465, { size: 18, color: '#fbbf24', fam: MONO });
      sline(155, 495, 880, 495, { col: '#475569', w: 1.5 });
      text("ESLATMA: SQL da indeks 1 dan boshlanadi (0 emas!)", 155, 535, { size: 17, weight: 700, color: '#f87171', fam: MONO });

      card(130, 610, 780, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Qidiruv: POSITION yoki INSTR", 160, 650, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("POSITION('@' IN 'ali@misol.uz')  --> 4", 160, 695, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("Agar belgi topilmasa, funksiya 0 qaytaradi.", 160, 735, { size: 16, color: C.ink, fam: UI });
      text("Belgining o'rnini topib, kesish chegarasini aniqlash mumkin.", 160, 765, { size: 16, color: C.soft, fam: UI });

      card(130, 815, 780, 115, { fill: '#f0fdf4', col: C.green, p: k });
      text("LEFT(s, n) va RIGHT(s, n) ko'plab dialektlarda qulay yordamchidir.", 160, 855, { size: 17, weight: 700, color: C.green, fam: UI });

      // O'ng: SPLIT_PART va SUBSTRING_INDEX
      card(980, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("2. Belgiga Ko'ra Ajratish: Email Domeni", 1400, 240, C.orange, k, 19);

      card(1010, 290, 780, 290, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- Email: 'ali.valiyev@misol.uz' dan domenni ajratish:", 1040, 330, { size: 16, color: '#fbbf24', fam: MONO });
      text("PostgreSQL:", 1040, 370, { size: 17, weight: 700, color: '#86efac', fam: UI });
      text("SPLIT_PART(email, '@', 2)             --> 'misol.uz'", 1040, 405, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("MySQL:", 1040, 445, { size: 17, weight: 700, color: '#93c5fd', fam: UI });
      text("SUBSTRING_INDEX(email, '@', -1)       --> 'misol.uz'", 1040, 480, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("SQLite:", 1040, 520, { size: 17, weight: 700, color: '#cbd5e1', fam: UI });
      text("SUBSTR(email, INSTR(email, '@') + 1)  --> 'misol.uz'", 1040, 555, { size: 17, weight: 700, color: '#fff', fam: MONO });

      card(1010, 610, 780, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Nega SPLIT_PART eng oson?", 1040, 650, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("PostgreSQL dagi SPLIT_PART satrni ajratuvchi bo'yicha", 1040, 695, { size: 16, color: C.ink, fam: UI });
      text("massiv kabi bo'lib, xohlagan qismini raqam bilan oladi.", 1040, 730, { size: 16, color: C.ink, fam: UI });
      text("MySQL dagi SUBSTRING_INDEX da -1 belgisi oxirgi qismni bildiradi.", 1040, 765, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(1010, 815, 780, 115, { fill: '#eff6ff', col: C.blue, p: k });
      text("Email tahlili va URL manzilini ajratishda bu usullar juda qo'l keladi.", 1040, 855, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. LPAD VA FORMATLASH (35.56s - 46.60s)
  function sLpad(t) {
    heading("Formatlash va To'ldirish: LPAD va RPAD", t, TM.scenes.lpad_va_format.s);

    const k = P(t, TM.scenes.lpad_va_format.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: LPAD bilan hisob raqami
      card(100, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("1. Kod Generatsiyasi: LPAD(id, 5, '0')", 520, 240, C.green, k, 19);

      card(130, 290, 780, 290, { fill: '#1e293b', col: '#14532d', p: k });
      text("-- Identifikatorni 5 xonali hisob raqamiga aylantirish:", 155, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT id,", 155, 375, { size: 18, color: '#fff', fam: MONO });
      text("       LPAD(CAST(id AS varchar), 5, '0') AS kod,", 155, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       ism", 155, 455, { size: 18, color: '#fff', fam: MONO });
      text("FROM odamlar;", 155, 495, { size: 18, color: '#94a3b8', fam: MONO });
      sline(155, 520, 880, 520, { col: '#334155', w: 1.5 });
      text("Natija: 1 -> '00001', 2 -> '00002', 3 -> '00003'", 155, 555, { size: 18, weight: 700, color: '#fbbf24', fam: MONO });

      card(130, 610, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("LPAD qanday ishlaydi?", 160, 650, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1. Satr uzunligini tekshiradi.", 160, 695, { size: 16, color: C.ink, fam: UI });
      text("2. Agar ko'rsatilgan sondan kam bo'lsa, chapdan belgi qo'shadi.", 160, 730, { size: 16, color: C.ink, fam: UI });
      text("3. Agar satr uzunligi oshib ketsa, o'ngdan kesib tashlaydi!", 160, 765, { size: 16, weight: 700, color: C.red, fam: UI });

      card(130, 815, 780, 115, { fill: '#eff6ff', col: C.blue, p: k });
      text("Shartnoma raqami, invoys kodi, kvitansiya formatida keng qo'llanadi.", 160, 855, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: RPAD va SQLite dialekti
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. RPAD va SQLite PRINTF Muqobili", 1400, 240, C.blue, k, 19);

      card(1010, 290, 780, 290, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- RPAD: o'ng tomondan to'ldirish:", 1040, 330, { size: 16, color: '#93c5fd', fam: MONO });
      text("SELECT RPAD('Ali', 10, '.');      -- 'Ali.......'", 1040, 375, { size: 18, weight: 700, color: '#fff', fam: MONO });
      sline(1040, 410, 1750, 410, { col: '#334155', w: 1.5 });
      text("-- DIALEKT FARQI: SQLite da LPAD funksiyasi yo'q!", 1040, 445, { size: 16, color: '#f87171', fam: MONO });
      text("SQLite da PRINTF funksiyasidan foydalaniladi:", 1040, 485, { size: 16, color: '#cbd5e1', fam: UI });
      text("SELECT PRINTF('%05d', id) AS kod  -- '00001'", 1040, 525, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM odamlar;", 1040, 560, { size: 18, color: '#94a3b8', fam: MONO });

      card(1010, 610, 780, 180, { fill: '#fffbeb', col: C.orange, p: k });
      text("Dialekt Tavsiyasi:", 1040, 650, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• PostgreSQL va MySQL da: LPAD / RPAD standart.", 1040, 695, { size: 17, color: C.ink, fam: UI });
      text("• SQLite da: PRINTF('%05d', son) yoki printf formatlash.", 1040, 735, { size: 17, weight: 700, color: C.blue, fam: UI });
      text("Har ikkala usul bir xil 5 xonali natijani ta'minlaydi.", 1040, 770, { size: 16, color: C.soft, fam: UI });

      card(1010, 815, 780, 115, { fill: '#f0fdf4', col: C.green, p: k });
      text("Matn va sonlarni chiroyli tizmaga keltirishda LPAD/RPAD juda samarali.", 1040, 855, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. REGEX TOZALASH (46.60s - 59.58s)
  function sRegex(t) {
    heading("RegEx Bilan Tozalash: Telefon Raqamlarini Normallashtirish", t, TM.scenes.regex_tozalash.s);

    const k = P(t, TM.scenes.regex_tozalash.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Telefonlarni tozalash
      card(100, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("1. REGEXP_REPLACE Bilan Raqamlarni Ajratish", 520, 240, C.purple, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- Telefon raqamlaridan barcha ortiqcha belgilarni tozalash:", 155, 330, { size: 15, color: '#c084fc', fam: MONO });
      text("SELECT telefon,", 155, 375, { size: 17, color: '#fff', fam: MONO });
      text("       REGEXP_REPLACE(telefon, '[^0-9]', '', 'g') AS toza,", 155, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("       REGEXP_COUNT(telefon, '[0-9]')             AS soni", 155, 455, { size: 18, color: '#fbbf24', fam: MONO });
      text("FROM odamlar;", 155, 495, { size: 17, color: '#94a3b8', fam: MONO });
      sline(155, 520, 880, 520, { col: '#475569', w: 1.5 });
      text("PostgreSQL da barcha mosliklarni tozalash uchun 'g' shart!", 155, 550, { size: 16, weight: 700, color: '#f87171', fam: MONO });

      card(130, 600, 780, 185, { fill: '#faf5ff', col: C.purple, p: k });
      text("Haqiqiy Ma'lumotlar Chiqishi:", 160, 640, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("1 | +998 (90) 123-45-67  -->  998901234567  (12 xona)", 160, 685, { size: 17, weight: 700, color: '#16a34a', fam: MONO });
      text("2 | 907654321            -->  907654321     (9 xona)", 160, 725, { size: 17, weight: 700, color: C.ink, fam: MONO });
      text("3 | +998-90-111-22-33    -->  998901112233  (12 xona)", 160, 765, { size: 17, weight: 700, color: '#16a34a', fam: MONO });

      card(130, 810, 780, 120, { fill: '#fff5f5', col: C.red, p: k });
      text("OGOHLANTIRISH: PostgreSQL da 'g' bayrog'i qo'yilmasa,", 160, 850, { size: 16, weight: 700, color: C.red, fam: UI });
      text("faqat birinchi belgi (+) tozalanadi, qolgan belgilar qolib ketadi!", 160, 890, { size: 16, color: C.ink, fam: UI });

      // O'ng: Yakuniy Xulosa
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Matn Funksiyalari: Amaliy Xulosa", 1400, 240, C.green, k, 19);

      const items = [
        { title: "Birlashtirish (Concatenation)", desc: "Doimo CONCAT_WS() dan foydalaning. U NULL qiymatlarni xavfsiz chetlab o'tadi va ajratuvchini toza qo'yadi.", col: C.green },
        { title: "Uzunlik va Kodirovkalar", desc: "Ko'p baytli UTF-8 (tutuq belgisi, kirill, emojilar) uchun har doim CHAR_LENGTH() ni tanlang.", col: C.blue },
        { title: "Tozalash va Registr", desc: "Kiritilgan foydalanuvchi ma'lumotlarini TRIM bilan bo'shliqlardan, LOWER bilan registrdan tozalang.", col: C.orange },
        { title: "Formatlash va Regex", desc: "Kod yasashda LPAD/RPAD, murakkab matnlarni tozalashda REGEXP_REPLACE eng kuchli vositadir.", col: C.purple },
      ];

      items.forEach((it, i) => {
        const iy = 290 + i * 140;
        card(1010, iy, 780, 125, { fill: '#f8fafc', col: it.col, p: k });
        text(it.title, 1035, iy + 35, { size: 19, weight: 700, color: it.col, fam: UI });
        text(it.desc, 1035, iy + 75, { size: 15, color: C.ink, fam: UI, maxW: 730 });
      });

      card(1010, 855, 780, 75, { fill: '#f0fdf4', col: C.green, p: k });
      text("Keyingi qismda: PostgreSQL, MySQL va SQLite dialekt tafovutlarini ko'ramiz!", 1035, 900, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.uzunlik_va_tozalash.s) {
      sKirish(t);
    } else if (t < TM.scenes.kesish_va_qidirish.s) {
      sUzunlik(t);
    } else if (t < TM.scenes.lpad_va_format.s) {
      sKesish(t);
    } else if (t < TM.scenes.regex_tozalash.s) {
      sLpad(t);
    } else {
      sRegex(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
