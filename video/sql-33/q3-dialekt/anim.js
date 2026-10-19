// SQL 33-bob 3-qism: "Dialektlar" — Matn funksiyalari tafovuti
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

  // 1. KIRISH VA DIALEKTLAR (0s - 13.71s)
  function sKirish(t) {
    const k = P(t, 0.3, 1.0);
    hand("33-bob. Matn Funksiyalari", 960, 150, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Dialektlar Bo'yicha Asosiy Farqlar", 960, 240, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL, MySQL va SQLite o'rtasidagi jiddiy nozikliklar", 960, 325, { size: 28, align: 'center', p: P(t, 1.1, 1.2) });
    marker(250, 355, 1420 * eio(P(t, 1.6, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Matn'), 0.8);
    withA(kCards, () => {
      const dbs = [
        {
          name: "PostgreSQL 18.6",
          tag: "Standart va Boy Imkoniyat",
          col: C.blue,
          points: [
            "• || standarti to'liq ishlaydi",
            "• length() belgilar sonini beradi",
            "• split_part() juda qulay",
            "• regexp_replace da 'g' bayrog'i shart",
            "• UTF-8 va Unicode to'liq qo'llab-quvvatlanadi",
          ]
        },
        {
          name: "MySQL 9.7",
          tag: "O'ziga Xos Xatti-Harakat",
          col: C.orange,
          points: [
            "• || mantiqiy OR bo'lib 0 qaytaradi!",
            "• CONCAT(a, NULL) butunlay NULL beradi",
            "• LENGTH() har doim baytlarni o'lchaydi",
            "• Belgilar soni uchun CHAR_LENGTH shart",
            "• SUBSTRING_INDEX bilan bo'linadi",
          ]
        },
        {
          name: "SQLite 3.54",
          tag: "Yengil va Sodda Dvigatel",
          col: C.green,
          points: [
            "• || va concat() ishlaydi",
            "• UPPER/LOWER faqat ASCII harflar uchun!",
            "• LPAD mavjud emas (PRINTF kerak)",
            "• O'rnatilgan RegEx yo'q",
            "• UTF-8 matnlar bayt/belgi farqi bor",
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

  // 2. ULASH FARQLARI (13.71s - 32.13s)
  function sUlash(t) {
    heading("1. Satrlarni Ulash va NULL Bilan Xatti-Harakat", t, TM.scenes.ulash_farqlari.s);

    const k = P(t, TM.scenes.ulash_farqlari.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: || operatori va MySQL xatosi
      card(100, 190, 840, 770, { fill: C.card, col: C.red, p: k });
      pill("1. || Operatori: MySQL dagi Katta Tuzoq", 520, 240, C.red, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#991b1b', p: k });
      text("-- Satrlarni || bilan ulash so'rovi:", 155, 330, { size: 16, color: '#fca5a5', fam: MONO });
      text("SELECT 'Ali' || ' ' || 'Valiyev';", 155, 375, { size: 19, weight: 700, color: '#fff', fam: MONO });
      sline(155, 405, 880, 405, { col: '#475569', w: 1.5 });
      text("PostgreSQL 18.6:  --> 'Ali Valiyev' (To'g'ri)", 155, 445, { size: 17, color: '#86efac', fam: MONO });
      text("SQLite 3.54:      --> 'Ali Valiyev' (To'g'ri)", 155, 485, { size: 17, color: '#86efac', fam: MONO });
      text("MySQL 9.7.2:      --> 0 (Mantiqiy OR bo'ldi!)", 155, 530, { size: 19, weight: 700, color: '#f87171', fam: MONO });

      card(130, 600, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Nega MySQL da 0 chiqadi?", 160, 640, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• MySQL da || sukut bo'yicha satr ulash emas, mantiqiy OR hisoblanadi.", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("• 'Ali' son emas (0), 'Valiyev' son emas (0). 0 OR 0 = 0 beradi!", 160, 720, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• MySQL Warning 1287: '|| as OR is deprecated' ogohlantirishini beradi.", 160, 755, { size: 15, color: C.soft, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Yechim: MySQL da PIPES_AS_CONCAT sql_mode yoqilishi kerak.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: CONCAT vs CONCAT_WS
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. CONCAT() va CONCAT_WS() Solishtiruvi", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("-- NULL qiymat qatnashganda CONCAT xatti-harakati:", 1040, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("Postgres / SQLite:  concat('Ali', NULL)  --> 'Ali'", 1040, 375, { size: 17, color: '#86efac', fam: MONO });
      text("MySQL 9.7:          CONCAT('Ali', NULL)  --> NULL! (Xavfli)", 1040, 420, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      sline(1040, 450, 1750, 450, { col: '#334155', w: 1.5 });
      text("-- CONCAT_WS barcha bazalarda bir xil ishlaydi:", 1040, 485, { size: 16, color: '#86efac', fam: MONO });
      text("CONCAT_WS(' ', 'Ali', NULL, 'Valiyev') --> 'Ali Valiyev'", 1040, 525, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(1010, 600, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("CONCAT_WS nima uchun qutqaruvchi?", 1040, 640, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1. PostgreSQL, MySQL va SQLite 3 da bir xil standartda ishlaydi.", 1040, 685, { size: 16, color: C.ink, fam: UI });
      text("2. NULL qiymatlarni butunlay e'tiborsiz qoldiradi.", 1040, 720, { size: 16, color: C.ink, fam: UI });
      text("3. Keraksiz ortiqcha bo'shliqlarni o'z-o'zidan tozalaydi.", 1040, 755, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("TAVSIYA: Portativ va ishonchli SQL uchun har doim CONCAT_WS ishlating!", 1040, 850, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 3. UZUNLIK VA REGISTR (32.13s - 47.54s)
  function sUzunlik(t) {
    heading("2. Uzunlik (LENGTH vs CHAR_LENGTH) va Registr Farqlari", t, TM.scenes.uzunlik_va_registr.s);

    const k = P(t, TM.scenes.uzunlik_va_registr.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: LENGTH vs CHAR_LENGTH
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. MySQL LENGTH() Baytlar Tuzog'i", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 290, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- 'Oʻgʻiloy' ismida 2 ta tutuq belgisi (ʻ) bor:", 155, 330, { size: 16, color: '#fbbf24', fam: MONO });
      text("PostgreSQL 18:  length('Oʻgʻiloy')       --> 8  (Belgilar)", 155, 375, { size: 17, color: '#86efac', fam: MONO });
      text("SQLite 3.54:    length('Oʻgʻiloy')       --> 8  (Belgilar)", 155, 415, { size: 17, color: '#86efac', fam: MONO });
      text("MySQL 9.7:      LENGTH('Oʻgʻiloy')       --> 10 (BAYTLAR!)", 155, 460, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("MySQL 9.7:      CHAR_LENGTH('Oʻgʻiloy')  --> 8  (Belgilar)", 155, 505, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(155, 530, 880, 530, { col: '#475569', w: 1.5 });
      text("Baytlarni aniqlash: OCTET_LENGTH('Oʻgʻiloy') --> 10", 155, 555, { size: 16, color: '#cbd5e1', fam: MONO });

      card(130, 610, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Nega bu xato yuz beradi?", 160, 650, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• MySQL da LENGTH() har doim baytlarni hisoblaydi.", 160, 695, { size: 16, color: C.ink, fam: UI });
      text("• O'zbek tutuq belgisi (ʻ) UTF-8 da 2 bayt, shuning uchun 8+2=10 bo'ladi.", 160, 730, { size: 16, color: C.ink, fam: UI });
      text("• Belgilar soni kerak bo'lsa, MySQL da CHAR_LENGTH() yozish majburiydir!", 160, 765, { size: 16, weight: 700, color: C.red, fam: UI });

      card(130, 815, 780, 115, { fill: '#eff6ff', col: C.blue, p: k });
      text("Portativ qoida: Barcha tizimlarda xavfsiz ishlash uchun CHAR_LENGTH yozing.", 160, 855, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: UPPER / LOWER va SQLite ASCII cheklovi
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. SQLite dagi UPPER / LOWER ASCII Cheklovi", 1400, 240, C.purple, k, 19);

      card(1010, 290, 780, 290, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- Kirillcha 'ўзбеk тили' matnini kattalashtirish:", 1040, 330, { size: 16, color: '#c084fc', fam: MONO });
      text("PostgreSQL 18:  upper('ўзбек')  --> 'ЎЗБЕК' (To'g'ri)", 1040, 375, { size: 17, color: '#86efac', fam: MONO });
      text("MySQL 9.7:      UPPER('ўзбек')  --> 'ЎЗБЕК' (To'g'ri)", 1040, 420, { size: 17, color: '#86efac', fam: MONO });
      text("SQLite 3.54:    upper('ўзбек')  --> 'ўзбек' (O'ZGARMADI!)", 1040, 465, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      sline(1040, 495, 1750, 495, { col: '#334155', w: 1.5 });
      text("Lotincha:       upper('ogiloy') --> 'OGILOY' (Ishlaydi)", 1040, 535, { size: 17, color: '#93c5fd', fam: MONO });

      card(1010, 610, 780, 180, { fill: '#faf5ff', col: C.purple, p: k });
      text("SQLite nega shunday ishlaydi?", 1040, 650, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• SQLite o'zining ixcham hajmini saqlash uchun sukut bo'yicha", 1040, 695, { size: 16, color: C.ink, fam: UI });
      text("  faqat 128 ta ASCII belgilariga upper/lower qo'llaydi.", 1040, 730, { size: 16, color: C.ink, fam: UI });
      text("• Kirill, arab yoki boshqa Unicode harflar o'zgarmay qoladi.", 1040, 765, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(1010, 815, 780, 115, { fill: '#fffbeb', col: C.orange, p: k });
      text("Yechim: SQLite da Unicode registr uchun ICU kengaytmasi zarur bo'ladi.", 1040, 855, { size: 17, weight: 700, color: C.orange, fam: UI });
    });
  }

  // 4. KESISH VA FORMAT (47.54s - 62.65s)
  function sKesish(t) {
    heading("3. Satrni Bo'lish (SPLIT) va Formatlash (LPAD)", t, TM.scenes.kesish_va_format.s);

    const k = P(t, TM.scenes.kesish_va_format.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: SPLIT_PART vs SUBSTRING_INDEX vs INSTR
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. Ajratuvchi Bo'yicha Bo'lish (Email Domeni)", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 290, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- 'ali@misol.uz' dan 'misol.uz' domenini ajratish:", 155, 330, { size: 16, color: '#93c5fd', fam: MONO });
      text("PostgreSQL 18:", 155, 370, { size: 17, weight: 700, color: '#86efac', fam: UI });
      text("SPLIT_PART(email, '@', 2)             --> 'misol.uz'", 155, 405, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("MySQL 9.7:", 155, 445, { size: 17, weight: 700, color: '#fbbf24', fam: UI });
      text("SUBSTRING_INDEX(email, '@', -1)       --> 'misol.uz'", 155, 480, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("SQLite 3.54:", 155, 520, { size: 17, weight: 700, color: '#cbd5e1', fam: UI });
      text("SUBSTR(email, INSTR(email, '@') + 1)  --> 'misol.uz'", 155, 555, { size: 17, weight: 700, color: '#fff', fam: MONO });

      card(130, 610, 780, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("Funksiyalar farqi:", 160, 650, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• PostgreSQL dagi SPLIT_PART barcha holatlarda eng qulayi.", 160, 695, { size: 16, color: C.ink, fam: UI });
      text("• MySQL dagi SUBSTRING_INDEX da -1 oxiridan 1-bo'lakni bildiradi.", 160, 730, { size: 16, color: C.ink, fam: UI });
      text("• SQLite da split yo'q, faqat substr + instr kombinatsiyasi ishlatiladi.", 160, 765, { size: 16, color: C.soft, fam: UI });

      card(130, 815, 780, 115, { fill: '#f0fdf4', col: C.green, p: k });
      text("Ko'p qismli matnlarda (masalan, CSV yoki URL) har bir tizim o'z usuliga ega.", 160, 855, { size: 17, weight: 700, color: C.green, fam: UI });

      // O'ng: LPAD va SQLite PRINTF
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Nollar Bilan To'ldirish: LPAD vs PRINTF", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 290, { fill: '#1e293b', col: '#14532d', p: k });
      text("-- id=1 ni 5 xonali '00001' qilish:", 1040, 330, { size: 16, color: '#86efac', fam: MONO });
      text("PostgreSQL 18:", 1040, 370, { size: 17, weight: 700, color: '#86efac', fam: UI });
      text("LPAD(CAST(id AS text), 5, '0')        --> '00001'", 1040, 405, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("MySQL 9.7:", 1040, 445, { size: 17, weight: 700, color: '#fbbf24', fam: UI });
      text("LPAD(id, 5, '0')                       --> '00001'", 1040, 480, { size: 17, weight: 700, color: '#fff', fam: MONO });
      text("SQLite 3.54 (LPAD yo'q!):", 1040, 520, { size: 17, weight: 700, color: '#f87171', fam: UI });
      text("PRINTF('%05d', id)                     --> '00001'", 1040, 555, { size: 17, weight: 700, color: '#86efac', fam: MONO });

      card(1010, 610, 780, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("SQLite da LPAD yo'qligi:", 1040, 650, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• SQLite da LPAD yoki RPAD o'rnatilmagan.", 1040, 695, { size: 16, color: C.ink, fam: UI });
      text("• Lekin juda kuchli PRINTF() (yoki FORMAT) funksiyasi mavjud.", 1040, 730, { size: 16, color: C.ink, fam: UI });
      text("• %05d orqali nollar bilan to'ldirilgan raqam hosil qilinadi.", 1040, 765, { size: 16, weight: 700, color: C.blue, fam: UI });

      card(1010, 815, 780, 115, { fill: '#eff6ff', col: C.blue, p: k });
      text("Invoys, schyot-faktura raqamlarida har uch usul ham bir xil natija beradi.", 1040, 855, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 5. REGEX VA XULOSA (62.65s - 80.74s)
  function sRegex(t) {
    heading("4. RegEx Qo'llab-Quvvatlashi va Solishtirma Matritsa", t, TM.scenes.regex_va_xulosa.s);

    const k = P(t, TM.scenes.regex_va_xulosa.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: REGEXP_REPLACE bayroqlari
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. REGEXP_REPLACE dagi 'g' Bayrog'i", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 280, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- Telefon: '+998 (90) 123-45-67' dan raqamlarni ajratish:", 155, 330, { size: 15, color: '#fbbf24', fam: MONO });
      text("PostgreSQL 18:", 155, 370, { size: 17, weight: 700, color: '#86efac', fam: UI });
      text("REGEXP_REPLACE(tel, '[^0-9]', '', 'g')  --> '998901234567'", 155, 405, { size: 17, color: '#86efac', fam: MONO });
      text("REGEXP_REPLACE(tel, '[^0-9]', '')       --> '998 (90) 123-45-67'", 155, 445, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      sline(155, 475, 880, 475, { col: '#475569', w: 1.5 });
      text("MySQL 9.7 (sukutda barcha mosliklar tozalaydi):", 155, 510, { size: 16, weight: 700, color: '#93c5fd', fam: UI });
      text("REGEXP_REPLACE(tel, '[^0-9]', '')       --> '998901234567'", 155, 545, { size: 17, color: '#86efac', fam: MONO });

      card(130, 600, 780, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Katta noziklik: PostgreSQL sukutda 1-moslikni o'chiradi!", 160, 640, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• PostgreSQL da to'rtinchi parametr bo'lib 'g' (global) qo'yilmasa,", 160, 685, { size: 16, color: C.ink, fam: UI });
      text("  faqat birinchi uchragan belgi (+) o'chiriladi, qolganlari qoladi!", 160, 720, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• SQLite da esa o'rnatilgan REGEXP yo'q (tashqi kengaytma zarur).", 160, 755, { size: 16, color: C.soft, fam: UI });

      card(130, 805, 780, 125, { fill: '#eff6ff', col: C.blue, p: k });
      text("Xulosa: Regex ishlatganda har doim tizim sukutiy bayroqlarini tekshiring.", 160, 850, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: Yakuniy Matritsa
      card(980, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("2. 3 Dialekt Yakuniy Solishtirma Jadvali", 1400, 240, C.blue, k, 19);

      // Solishtirma jadvali
      card(1010, 290, 780, 390, { fill: '#1e293b', col: '#334155', p: k });
      text("Amal               Postgres 18      MySQL 9.7        SQLite 3.54", 1035, 330, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1035, 345, 1750, 345, { col: '#475569', w: 1.5 });

      const matrix = [
        { op: "|| (Satr ulash)", pg: "Ha", my: "0 (OR amali!)", sq: "Ha", alert: true },
        { op: "CONCAT(NULL)", pg: "E'tiborsiz", my: "NULL beradi!", sq: "E'tiborsiz", alert: true },
        { op: "LENGTH()", pg: "Belgilar soni", my: "Baytlar soni!", sq: "Belgilar soni", alert: true },
        { op: "CHAR_LENGTH()", pg: "Ha", my: "Ha (Tavsiya)", sq: "length()", alert: false },
        { op: "UPPER/LOWER", pg: "To'liq UTF-8", my: "To'liq UTF-8", sq: "Faqat ASCII!", alert: true },
        { op: "SPLIT", pg: "split_part()", my: "SUBSTRING_INDEX", sq: "substr+instr", alert: false },
        { op: "LPAD", pg: "Ha", my: "Ha", sq: "Yo'q (printf)", alert: false },
        { op: "RegEx Replace", pg: "Ha ('g' shart)", my: "Ha (sukutda)", sq: "Yo'q", alert: true },
      ];

      matrix.forEach((m, idx) => {
        const myy = 380 + idx * 36;
        text(m.op.padEnd(19), 1035, myy, { size: 14, color: '#fff', fam: MONO });
        text(m.pg.padEnd(17), 1210, myy, { size: 14, color: '#86efac', fam: MONO });
        text(m.my.padEnd(17), 1380, myy, { size: 14, color: m.alert ? '#fca5a5' : '#fbbf24', fam: MONO });
        text(m.sq, 1550, myy, { size: 14, color: m.sq.includes('Faqat') || m.sq === 'Yo\'q' ? '#fca5a5' : '#cbd5e1', fam: MONO });
      });

      card(1010, 710, 780, 220, { fill: '#f0fdf4', col: C.green, p: k });
      text("Portativ Kod Bo'yicha Oltin Qoidalar:", 1040, 755, { size: 21, weight: 700, color: C.green, fam: UI });
      text("1. Satrlarni ulashda har doim CONCAT_WS() funksiyasini tanlang.", 1040, 805, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("2. Belgilar sonini hisoblashda CHAR_LENGTH() dan foydalaning.", 1040, 845, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("3. SQLite da Unicode harflar uchun maxsus kengaytmalardan foydalaning.", 1040, 885, { size: 16, color: C.blue, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.ulash_farqlari.s) {
      sKirish(t);
    } else if (t < TM.scenes.uzunlik_va_registr.s) {
      sUlash(t);
    } else if (t < TM.scenes.kesish_va_format.s) {
      sUzunlik(t);
    } else if (t < TM.scenes.regex_va_xulosa.s) {
      sKesish(t);
    } else {
      sRegex(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
