// SQL 33-bob 1-qism: "Tushuncha" — Matn funksiyalari
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
    hand("33-bob. Matn Funksiyalari", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da Satrlar Bilan Ishlash", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Ulash, uzunlik, kesish, qidirish va regex amallarining dialekt farqlari", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Matn'), 0.8);
    withA(kCards, () => {
      const items = [
        {
          name: "Ulash (Concat)",
          tag: "|| va concat()",
          col: C.blue,
          points: [
            "• Standart: || operatori",
            "• NULL bilan xatti-harakat",
            "• MySQL da || bu mantiqiy OR!",
            "• concat_ws — eng xavfsiz yo'l",
          ]
        },
        {
          name: "Uzunlik",
          tag: "Belgilar vs Baytlar",
          col: C.green,
          points: [
            "• UTF-8 da belgi 1..4 bayt",
            "• PG/SQLite: length = belgilar",
            "• MySQL: LENGTH = baytlar!",
            "• CHAR_LENGTH() — belgilar soni",
          ]
        },
        {
          name: "Asosiy Amallar",
          tag: "Substring, Trim, Case",
          col: C.orange,
          points: [
            "• Indekslar 1 dan boshlanadi",
            "• upper(), lower(), trim()",
            "• split_part vs SUBSTRING_INDEX",
            "• SQLite: upper faqat ASCII",
          ]
        },
        {
          name: "Regex Amallar",
          tag: "Tozalash va Qidirish",
          col: C.purple,
          points: [
            "• regexp_replace bilan tozalash",
            "• PG: sukutda 1-mos ('g' shart)",
            "• MySQL: sukutda hammasi",
            "• SQLite da o'rnatilgan regex yo'q",
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

  // 2. ULASH VA NULL
  function sUlash(t) {
    heading("Satrlarni Ulash: ||, concat va concat_ws", t, TM.scenes.ulash_va_null.s);

    const k = P(t, TM.scenes.ulash_va_null.s + 0.3, 0.8);
    withA(k, () => {
      // Left: || and concat() NULL traps
      card(100, 200, 840, 760, { fill: C.card, col: C.red, p: k });
      pill("1. || va concat() dagi NULL Tuzog'i", 520, 250, C.red, k, 18);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#7f1d1d', p: k });
      text("-- 1. || operatori: bitta NULL bo'lsa natija NULL:", 170, 350, { size: 17, color: '#fca5a5', fam: MONO });
      text("'Ali' || ' ' || NULL  -->  NULL!", 170, 395, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("-- 2. concat() funksiyasi: tizimlar teskari ishlaydi!", 170, 440, { size: 17, color: '#94a3b8', fam: MONO });
      text("PostgreSQL / SQLite:  concat('Ali', ' ', NULL)  -->  'Ali '", 170, 480, { size: 17, color: '#86efac', fam: MONO });
      text("MySQL 9.7:            CONCAT('Ali', ' ', NULL)  -->  NULL!", 170, 515, { size: 17, weight: 700, color: '#f87171', fam: MONO });

      card(140, 580, 760, 180, { fill: '#2d1515', col: '#7f1d1d', p: k });
      text("MySQL da || operatori xavfi:", 170, 620, { size: 21, weight: 700, color: '#f87171', fam: UI });
      text("MySQL da sukut bo'yicha || belgisi satr ulash emas,", 170, 665, { size: 17, color: '#fff', fam: UI });
      text("balki mantiqiy OR bo'lib ishlaydi va 0 qaytaradi!", 170, 705, { size: 18, weight: 700, color: '#fca5a5', fam: UI });
      text("'Ali' || 'Valiyev'  -->  0 (Warning 1287: || is deprecated)", 170, 740, { size: 16, color: '#fbbf24', fam: MONO });

      card(140, 785, 760, 145, { fill: '#fffbeb', col: C.orange, p: k });
      text("Xulosa: || operatoriga NULL tushsa butun satr yo'qoladi,", 170, 825, { size: 17, color: C.ink, fam: UI });
      text("MySQL da esa CONCAT ham NULL beradi.", 170, 865, { size: 18, weight: 700, color: C.red, fam: UI });

      // Right: concat_ws solution
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("2. Qutqaruvchi: concat_ws()", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- concat_ws('ajratuvchi', a, b, c, ...)", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT concat_ws(' ', familiya, ism, otasining)", 1070, 395, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("FROM odamlar;", 1070, 435, { size: 18, color: '#fff', fam: MONO });
      text("otasining = NULL bo'lsa ham:", 1070, 480, { size: 17, color: '#94a3b8', fam: UI });
      text("--> Natija: 'Sobirova Oʻgʻiloy' (Toza va xatosiz!)", 1070, 520, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(1040, 580, 740, 180, { fill: '#f0fdf4', col: C.green, p: k });
      text("concat_ws afzalliklari (Barcha 3 tizimda bir xil!):", 1070, 620, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• NULL argumentlarni to'liq e'tiborsiz qoldiradi.", 1070, 665, { size: 17, color: C.ink, fam: UI });
      text("• O'rtadagi ortiqcha bo'shliqlarni qo'shmaydi.", 1070, 705, { size: 17, color: C.ink, fam: UI });
      text("• Ism-sharif, to'liq manzillar uchun eng ideal usul!", 1070, 745, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(1040, 790, 740, 140, { fill: '#eff6ff', col: C.blue, p: k });
      text("TAVSIYA: Relyatsion bazalarda satrlarni birlashtirishda", 1070, 835, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("doimo concat_ws() dan foydalaning!", 1070, 875, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. UZUNLIK: BELGILAR VA BAYTLAR
  function sUzunlik(t) {
    heading("Uzunlik: Belgilar Soni va Baytlar Farqi", t, TM.scenes.uzunlik_belgi_va_bayt.s);

    const k = P(t, TM.scenes.uzunlik_belgi_va_bayt.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Multi-byte UTF-8
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("UTF-8 Kodirovkasi va Tutuq Belgisi (ʻ)", 520, 250, C.orange, k, 18);

      card(140, 310, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("Satr: 'Oʻgʻiloy'", 170, 355, { size: 21, weight: 700, color: '#fbbf24', fam: MONO });
      text("• Lotincha O, g, i, l, o, y harflari: har biri 1 bayt (jami 6 bayt)", 170, 400, { size: 16, color: '#cbd5e1', fam: UI });
      text("• O'zbekcha tutuq belgisi ʻ (U+02BB): har biri 2 bayt!", 170, 445, { size: 17, weight: 700, color: '#f87171', fam: UI });
      text("--> Jami: 8 ta belgi, ammo 10 ta bayt!", 170, 490, { size: 19, weight: 700, color: '#86efac', fam: MONO });

      card(140, 560, 760, 220, { fill: '#fffbeb', col: C.orange, p: k });
      text("Nega bu muhim?", 170, 605, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• varchar(n) chegarasi belgilarda o'lchanadi (10 belgi sig'adi).", 170, 650, { size: 17, color: C.ink, fam: UI });
      text("• Ammo tarmoq trafigi, disk hajmi va indekslarda bayt hisoblanadi.", 170, 690, { size: 17, color: C.ink, fam: UI });
      text("• Kirill harflari ham UTF-8 da 2 bayt, emojilar esa 4 baytdir!", 170, 730, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(140, 810, 760, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("OCTET_LENGTH(s) — barcha tizimlarda baytlar sonini qaytaradi.", 170, 855, { size: 17, weight: 700, color: C.green, fam: UI });

      // Right: Database functions comparison
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("Tizimlararo LENGTH() Xatti-Harakati", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- 'Oʻgʻiloy' uzunligini o'lchash:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("PostgreSQL:  length('Oʻgʻiloy')  -->  8 (Belgilar!)", 1070, 395, { size: 18, color: '#86efac', fam: MONO });
      text("SQLite:      length('Oʻgʻiloy')  -->  8 (Belgilar!)", 1070, 440, { size: 18, color: '#86efac', fam: MONO });
      text("MySQL 9.7:   LENGTH('Oʻgʻiloy')  -->  10 (BAYTLAR!)", 1070, 485, { size: 19, weight: 700, color: '#f87171', fam: MONO });
      text("MySQL 9.7:   CHAR_LENGTH(...)    -->  8 (Belgilar)", 1070, 525, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(1040, 580, 740, 180, { fill: '#fff5f5', col: C.red, p: k });
      text("Katta tuzoq: MySQL LENGTH()", 1070, 620, { size: 21, weight: 700, color: C.red, fam: UI });
      text("MySQL da LENGTH() deb yozsangiz, u har doim baytlarni sanaydi!", 1070, 665, { size: 17, weight: 700, color: C.red, fam: UI });
      text("Agar belgilar soni kerak bo'lsa, MySQL da majburiy ravishda", 1070, 705, { size: 17, color: C.ink, fam: UI });
      text("CHAR_LENGTH() deb yozish shart!", 1070, 740, { size: 18, weight: 700, color: C.blue, fam: UI });

      card(1040, 790, 740, 140, { fill: '#eff6ff', col: C.blue, p: k });
      text("Portativlik: MySQL da CHAR_LENGTH, PostgreSQL da length,", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("char_length esa har ikkala tizimda bir xil ishlaydi.", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. ASOSIY AMALLAR
  function sAmallar(t) {
    heading("Asosiy Amallar: Kesish, Qidirish va Registr", t, TM.scenes.asosiy_amallar.s);

    const k = P(t, TM.scenes.asosiy_amallar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Substring & Position
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("1. Qism Satr va Qidiruv (1-indeksdan!)", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("-- SQL da pozitsiyalar 1 dan boshlanadi (0 emas!):", 170, 350, { size: 16, color: '#94a3b8', fam: MONO });
      text("SUBSTRING('Valiyev', 1, 3)  --> 'Val' (1-harfdan 3 ta)", 170, 395, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("LEFT('Valiyev', 3)          --> 'Val' (Boshidan 3 ta)", 170, 435, { size: 18, color: '#86efac', fam: MONO });
      text("RIGHT('Valiyev', 2)         --> 'ev'  (Oxiridan 2 ta)", 170, 475, { size: 18, color: '#fbbf24', fam: MONO });
      text("POSITION('@' IN email)      --> 12    (Topilmasa: 0)", 170, 515, { size: 18, color: '#c084fc', fam: MONO });

      card(140, 570, 760, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("TRIM: Bo'shliqlarni tozalash:", 170, 615, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("TRIM('  Jasur  ')  --> 'Jasur' (Ikki tomondan)", 170, 665, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("LTRIM (chapdan) va RTRIM (o'ngdan) tozalaydi.", 170, 710, { size: 17, color: C.ink, fam: UI });
      text("PostgreSQL da btrim() ham xuddi shu vazifani bajaradi.", 170, 745, { size: 16, color: C.soft, fam: UI });

      card(140, 790, 760, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("LPAD bilan kod yasash: lpad('42', 5, '0') --> '00042'", 170, 835, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("Hujjat: agar satr berilgan uzunlikdan uzun bo'lsa, o'ngdan kesiladi.", 170, 875, { size: 15, color: C.ink, fam: UI });

      // Right: Case modification & SQLite ASCII limit
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("2. UPPER / LOWER va SQLite ASCII Cheklovi", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 230, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Emailni taqqoslashdan oldin kichraytirish:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("lower(email) = lower($input)", 1070, 395, { size: 19, weight: 700, color: '#86efac', fam: MONO });
      text("-- Kirill va no-ASCII harflarni kattalashtirish:", 1070, 440, { size: 17, color: '#94a3b8', fam: MONO });
      text("SELECT upper('ўзбек тили');", 1070, 480, { size: 18, color: '#fff', fam: MONO });

      card(1040, 570, 740, 200, { fill: '#faf5ff', col: C.purple, p: k });
      text("SQLite ning kutilmagan cheklovi:", 1070, 615, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("PostgreSQL va MySQL:  'ўзбек тили'  -->  'ЎЗБЕK ТИЛИ'", 1070, 665, { size: 17, color: '#16a34a', fam: MONO });
      text("SQLite 3.54:          'ўзбек тили'  -->  'ўзбек тили' (O'ZGARMADI!)", 1070, 710, { size: 17, weight: 700, color: '#dc2626', fam: MONO });
      text("Sababi: SQLite dagi upper/lower faqat ASCII harflar uchun!", 1070, 755, { size: 16, color: C.ink, fam: UI });

      card(1040, 800, 740, 130, { fill: '#fffbeb', col: C.orange, p: k });
      text("O'zbek lotin alifbosidagi harflar (o'g'iloy) ishlaydi,", 1070, 840, { size: 17, color: C.ink, fam: UI });
      text("ammo kirill yozuvi uchun SQLite ga ICU kengaytmasi zarur.", 1070, 880, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 5. REGEX VA FARQLAR
  function sRegex(t) {
    heading("Regex Funksiyalari va Almashtirish Rejimlari", t, TM.scenes.regex_va_farqlar.s);

    const k = P(t, TM.scenes.regex_va_farqlar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Regex replacement flag trap
      card(100, 200, 840, 760, { fill: C.card, col: C.orange, p: k });
      pill("1. Almashtirish Soni Farqi (Tuzoq!)", 520, 250, C.orange, k, 19);

      card(140, 310, 760, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Telefon raqamidan raqam bo'lmaganlarni tozalash:", 170, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("PostgreSQL (sukutda faqat 1-moslik!):", 170, 395, { size: 17, color: '#fff', fam: UI });
      text("regexp_replace('+998 90', '[^0-9]', '')     --> '998 90' (XATO!)", 170, 435, { size: 17, weight: 700, color: '#f87171', fam: MONO });
      text("regexp_replace('+998 90', '[^0-9]', '', 'g') --> '99890'  (TO'G'RI)", 170, 480, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      text("MySQL (sukut bo'yicha hammasini tozalaydi):", 170, 525, { size: 17, color: '#fff', fam: UI });
      text("REGEXP_REPLACE('+998 90', '[^0-9]', '')     --> '99890'  (HAMMASI)", 170, 565, { size: 17, weight: 700, color: '#86efac', fam: MONO });

      card(140, 640, 760, 280, { fill: '#fff5f5', col: C.red, p: k });
      text("Katta noziklik: 'g' (Global) bayrog'i!", 170, 685, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• PostgreSQL da agar 'g' bayrog'ini qo'ymasangiz,", 170, 735, { size: 17, color: C.ink, fam: UI });
      text("  faqat birinchi uchragan belgi o'chadi, qolgani qolib ketadi!", 170, 775, { size: 17, weight: 700, color: C.red, fam: UI });
      text("• MySQL da esa occurrence sukutda 0 bo'lib, hammasini almashtiradi.", 170, 820, { size: 17, color: C.ink, fam: UI });
      text("• MySQL kodini PostgreSQL ga ko'chirishda 'g' ni doim qo'shing!", 170, 860, { size: 17, weight: 700, color: C.blue, fam: UI });

      // Right: Advanced regex functions & SQLite alternative
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("2. REGEXP_SUBSTR va SQLite Yechimi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("-- Mos keluvchi qismni olish:", 1070, 350, { size: 17, color: '#94a3b8', fam: MONO });
      text("regexp_substr(email, '[a-z]+', 1, 2, 'i')", 1070, 395, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("1-pozitsiyadan, 2-mos kelish, katta-kichik harfga qaramay.", 1070, 440, { size: 16, color: '#cbd5e1', fam: UI });
      text("regexp_count(telefon, '[0-9]')  --> 12 ta raqam bor", 1070, 485, { size: 17, weight: 700, color: '#86efac', fam: MONO });

      card(1040, 560, 740, 200, { fill: '#eff6ff', col: C.blue, p: k });
      text("SQLite da Regex yo'q bo'lsa nima qilinadi?", 1070, 605, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("SQLite da regexp_replace funksiyasi mavjud emas.", 1070, 650, { size: 17, color: C.ink, fam: UI });
      text("Telefon belgilarini tozalash uchun zanjirli replace ishlatiladi:", 1070, 690, { size: 17, color: C.ink, fam: UI });
      text("replace(replace(replace(tel,' ',''),'-',''),'+','')", 1070, 730, { size: 16, weight: 700, color: C.blue, fam: MONO });

      card(1040, 790, 740, 140, { fill: '#f0fdf4', col: C.green, p: k });
      text("Xulosa: Matn funksiyalarida dialekt farqlari eng ko'p,", 1070, 835, { size: 18, weight: 700, color: C.green, fam: UI });
      text("shuning uchun concat_ws va char_length xavfsiz tanlovdir!", 1070, 875, { size: 17, color: C.blue, fam: UI });
    });
  }

  // Asosiy chizish funksiyasi
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.ulash_va_null.s) {
      sIntro(t);
    } else if (t < TM.scenes.uzunlik_belgi_va_bayt.s) {
      sUlash(t);
    } else if (t < TM.scenes.asosiy_amallar.s) {
      sUzunlik(t);
    } else if (t < TM.scenes.regex_va_farqlar.s) {
      sAmallar(t);
    } else {
      sRegex(t);
    }
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
