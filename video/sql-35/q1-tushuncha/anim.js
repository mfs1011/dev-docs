// SQL 35-bob 1-qism: "Tushuncha" — JSON
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

  // 1. KIRISH (0s - 13.53s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("35-bob. JSON Bilan Ishlash", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Relyatsion Bazalarda Dinamik Hujjatlar", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("json vs jsonb, operatorlar, containment, GIN indeksi va gibrid loyihalash", 960, 345, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'Jey-son'), 0.8);
    withA(kCards, () => {
      const items = [
        {
          name: "json vs jsonb",
          tag: "Matn vs Ikkilik",
          col: C.blue,
          points: [
            "• json: aniq matn nusxasi",
            "• jsonb: ikkilik binar shakl",
            "• Takror kalitlar tozalanadi",
            "• O'qish tezligi va GIN indeksi",
          ]
        },
        {
          name: "Operatorlar",
          tag: "->, ->>, #>, #>>",
          col: C.green,
          points: [
            "• -> JSON qaytaradi (\"Ali\")",
            "• ->> toza matn qaytaradi (Ali)",
            "• #>> yo'l bo'yicha oladi",
            "• Massiv indeksi 0 dan boshlanadi",
          ]
        },
        {
          name: "Filtrlash",
          tag: "Containment (@>) va ?",
          col: C.orange,
          points: [
            "• @>: o'z ichiga olish sharti",
            "• ?: kalit mavjudligini tekshirish",
            "• JSON_TABLE bilan relyatsion ko'rinish",
            "• jsonpath qidiruv sintaksisi",
          ]
        },
        {
          name: "Loyihalash",
          tag: "Gibrid Model va GIN",
          col: C.purple,
          points: [
            "• Har UPDATE butun qatorni qulflaydi",
            "• Qidiriladigan maydonlar — ustun",
            "• Dinamik xususiyatlar — JSONB",
            "• GIN indeksi bilan tezlashtirish",
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

  // 2. JSON VS JSONB (13.53s - 27.05s)
  function sTypes(t) {
    heading("1. PostgreSQL: json va jsonb Tiplari Farqi", t, TM.scenes.json_vs_jsonb.s);

    const k = P(t, TM.scenes.json_vs_jsonb.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: json tipi
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. json Tipi (Matn Nusxasi)", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 230, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT '{\"b\": 1,   \"a\": 2, \"b\": 3}'::json;", 155, 335, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      sline(155, 365, 880, 365, { col: '#475569', w: 1.5 });
      text("Natija: {\"b\": 1,   \"a\": 2, \"b\": 3}", 155, 410, { size: 18, color: '#fff', fam: MONO });
      text("• Bo'shliqlar va kalitlar tartibi aynan saqlanadi.", 155, 455, { size: 16, color: '#cbd5e1', fam: UI });
      text("• Ikkita 'b' kaliti ham saqlanadi (tarixiy nusxa).", 155, 490, { size: 16, color: '#f87171', fam: UI });

      card(130, 550, 780, 220, { fill: '#fffbeb', col: C.orange, p: k });
      text("json tipining kamchiliklari:", 160, 595, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• Har safar o'qilganda matn noldan tahlil (parse) qilinadi.", 160, 640, { size: 16, color: C.ink, fam: UI });
      text("• Kalitlarni qidirish sekin, hujjat ichidagi elementga indeks yo'q.", 160, 680, { size: 16, color: C.ink, fam: UI });
      text("• Faqat kiritilgan matnni asl holida saqlash kerak bo'lganda ishlatiladi.", 160, 720, { size: 16, color: C.soft, fam: UI });

      card(130, 800, 780, 130, { fill: '#eff6ff', col: C.blue, p: k });
      text("Faqat yozish tezligi kerak bo'lsa (loglar) qo'llanilishi mumkin.", 160, 845, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: jsonb tipi
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. jsonb Tipi (Ikkilik Binar — TAVSIYA!)", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 230, { fill: '#1e293b', col: '#166534', p: k });
      text("SELECT '{\"b\": 1,   \"a\": 2, \"b\": 3}'::jsonb;", 1035, 335, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      sline(1035, 365, 1750, 365, { col: '#334155', w: 1.5 });
      text("Natija: {\"a\": 2, \"b\": 3}", 1035, 410, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("• Ikkilik formatda normallashtiriladi, bo'shliqlar tozalanadi.", 1035, 455, { size: 16, color: '#cbd5e1', fam: UI });
      text("• Takror kalitlardan faqat oxirgisi saqlanadi ('b': 3).", 1035, 490, { size: 16, color: '#86efac', fam: UI });

      card(1010, 550, 780, 220, { fill: '#f0fdf4', col: C.green, p: k });
      text("jsonb ning katta ustunliklari:", 1040, 595, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• O'qish juda tez: tahlil qilingan daraxt ko'rinishida saqlanadi.", 1040, 640, { size: 16, color: C.ink, fam: UI });
      text("• GIN indeksi orqali millionlab hujjatlar ichidan lahzada topadi.", 1040, 680, { size: 16, weight: 700, color: '#15803d', fam: UI });
      text("• Boy operatorlar: @>, ?, jsonb_set va birlashtirish (||).", 1040, 720, { size: 16, color: C.ink, fam: UI });

      card(1010, 800, 780, 130, { fill: '#f0fdf4', col: C.green, p: k });
      text("XULOSA: Relyatsion bazalarda doimo jsonb tipidan foydalaning!", 1040, 845, { size: 18, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. OPERATORLAR (27.05s - 41.28s)
  function sOps(t) {
    heading("2. Ajratish Operatorlari: ->, ->> va #>>", t, TM.scenes.operatorlar.s);

    const k = P(t, TM.scenes.operatorlar.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: -> vs ->>
      card(100, 190, 840, 770, { fill: C.card, col: C.blue, p: k });
      pill("1. -> (JSON) va ->> (Matn) Farqi", 520, 240, C.blue, k, 19);

      card(130, 290, 780, 250, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- Hujjat: '{\"mijoz\": \"Ali\", \"yosh\": 25}'", 155, 330, { size: 16, color: '#94a3b8', fam: MONO });
      text("SELECT hujjat -> 'mijoz';   --> \"Ali\"  (JSON qiymat!)", 155, 375, { size: 18, color: '#93c5fd', fam: MONO });
      text("SELECT hujjat ->> 'mijoz';  --> Ali    (Toza matn!)", 155, 420, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(155, 450, 880, 450, { col: '#475569', w: 1.5 });
      text("SELECT hujjat -> 'yosh';    --> 25     (JSON son)", 155, 485, { size: 17, color: '#93c5fd', fam: MONO });
      text("SELECT hujjat ->> 'yosh';   --> '25'   (VARCHAR matn)", 155, 520, { size: 17, color: '#fbbf24', fam: MONO });

      card(130, 570, 780, 210, { fill: '#fff5f5', col: C.red, p: k });
      text("Katta Tuzoq: -> bilan solishtirish!", 160, 610, { size: 21, weight: 700, color: C.red, fam: UI });
      text("WHERE hujjat -> 'mijoz' = 'Ali'  --> FALSE! (XATO!)", 160, 655, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("Chunki \"Ali\" (qo'shtirnoqli JSON) hech qachon Ali matniga teng emas.", 160, 695, { size: 16, color: C.ink, fam: UI });
      text("Solishtirish va ko'rsatishda doimo ->> ishlatiladi!", 160, 730, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("Sonli taqqoslash uchun cast kerak: (hujjat ->> 'yosh')::int > 18.", 160, 855, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: Yo'l bo'yicha #> va #>>
      card(980, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("2. Ichma-ich Yo'llar: #> va #>>", 1400, 240, C.purple, k, 19);

      card(1010, 290, 780, 250, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- mahsulotlar massividan 1-elementning nomini olish:", 1035, 330, { size: 16, color: '#c084fc', fam: MONO });
      text("hujjat #> '{mahsulotlar, 0, nom}'   --> \"Daftar\"", 1035, 380, { size: 18, color: '#93c5fd', fam: MONO });
      text("hujjat #>> '{mahsulotlar, 0, nom}'  --> Daftar (Matn)", 1035, 425, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(1035, 455, 1750, 455, { col: '#334155', w: 1.5 });
      text("DIQQAT: JSON massivlarida indeks 0 dan boshlanadi!", 1035, 495, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });

      card(1010, 570, 780, 210, { fill: '#faf5ff', col: C.purple, p: k });
      text("Yo'l sintaksisi qoidalari:", 1040, 610, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• #> '{kalit1, kalit2, indeks}' massiv va obyektlarni kesib o'tadi.", 1040, 655, { size: 16, color: C.ink, fam: UI });
      text("• SQL massivlari 1 dan boshlansa, JSON massivlari doim 0 dan boshlanadi.", 1040, 695, { size: 16, color: C.ink, fam: UI });
      text("• Agar yo'ldagi element mavjud bo'lmasa, xato bermasdan NULL qaytadi.", 1040, 730, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(1010, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Murakkab ichma-ich tuzilmalardan qiymat olishda #>> eng toza usuldir.", 1040, 855, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. CONTAINMENT VA FILTER (41.28s - 54.38s)
  function sContain(t) {
    heading("3. Containment (@>) va Kalit Tekshiruvi (?)", t, TM.scenes.containment_va_filter.s);

    const k = P(t, TM.scenes.containment_va_filter.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Containment @>
      card(100, 190, 840, 770, { fill: C.card, col: C.orange, p: k });
      pill("1. O'z Ichiga Olish: @> Operatori", 520, 240, C.orange, k, 19);

      card(130, 290, 780, 260, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- Shahari Toshkent bo'lgan barcha buyurtmalar:", 155, 330, { size: 16, color: '#fbbf24', fam: MONO });
      text("SELECT id, hujjat ->> 'mijoz' FROM buyurtmalar", 155, 375, { size: 18, color: '#fff', fam: MONO });
      text("WHERE hujjat @> '{\"shahar\": \"Toshkent\"}';", 155, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(155, 445, 880, 445, { col: '#475569', w: 1.5 });
      text("Massivda containment: [1, 2, 3] @> [3, 1]  --> TRUE", 155, 485, { size: 16, color: '#86efac', fam: MONO });
      text("Elementlar tartibi va ortiqcha qiymatlar muhim emas!", 155, 520, { size: 15, color: '#cbd5e1', fam: UI });

      card(130, 580, 780, 200, { fill: '#fffbeb', col: C.orange, p: k });
      text("@> qanday ishlaydi?", 160, 620, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• Chapdagi hujjat o'ngdagi hujjatni to'liq o'z ichiga oladimi?", 160, 665, { size: 16, color: C.ink, fam: UI });
      text("• Obyekt ichida mos kalit va qiymat bo'lishi shart.", 160, 700, { size: 16, color: C.ink, fam: UI });
      text("• Eng katta yutug'i: @> operatori GIN indeksidan to'liq foydalanadi!", 160, 735, { size: 17, weight: 700, color: '#15803d', fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("JSON filtrlashda ->> o'rniga @> ishlatilsa, indeks orqali so'rov tezlashadi.", 160, 855, { size: 16, weight: 700, color: C.blue, fam: UI });

      // O'ng: ? va kalitlar
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. Kalit va Element Mavjudligi: ?", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 260, { fill: '#1e293b', col: '#166534', p: k });
      text("-- 'teglar' massivida 'sovga' bormi?", 1035, 330, { size: 16, color: '#86efac', fam: MONO });
      text("SELECT id FROM buyurtmalar", 1035, 375, { size: 18, color: '#fff', fam: MONO });
      text("WHERE hujjat -> 'teglar' ? 'sovga';", 1035, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(1035, 445, 1750, 445, { col: '#334155', w: 1.5 });
      text("-- Hujjatda 'teglar' degan kalitning o'zi bormi?", 1035, 480, { size: 16, color: '#94a3b8', fam: MONO });
      text("WHERE hujjat ? 'teglar';", 1035, 515, { size: 18, color: '#fbbf24', fam: MONO });

      card(1010, 580, 780, 200, { fill: '#f0fdf4', col: C.green, p: k });
      text("Mavjudlik operatorlari:", 1040, 620, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• j ? 'kalit': bitta kalit yoki massiv elementi bormi?", 1040, 665, { size: 16, color: C.ink, fam: UI });
      text("• j ?| array['a', 'b']: kamida bittasi bormi? (OR)", 1040, 700, { size: 16, color: C.ink, fam: UI });
      text("• j ?& array['a', 'b']: ikkalasi ham bormi? (AND)", 1040, 735, { size: 16, weight: 700, color: C.green, fam: UI });

      card(1010, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("Ushbu operatorlar teglash (tagging) tizimlari uchun juda qulay.", 1040, 855, { size: 17, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 5. LOYIHALASH VA INDEKS (54.38s - 69.22s)
  function sDesign(t) {
    heading("4. JSON Loyihalash Qoidalari va GIN Indeksi", t, TM.scenes.loyihalash_va_indeks.s);

    const k = P(t, TM.scenes.loyihalash_va_indeks.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Loyihalash
      card(100, 190, 840, 770, { fill: C.card, col: C.purple, p: k });
      pill("1. JSON Loyihalash: Gibrid Model", 520, 240, C.purple, k, 19);

      card(130, 290, 780, 270, { fill: '#fff5f5', col: C.red, p: k });
      text("QAT'IY OGOHLANTIRISH: Qator Qulflanishi!", 160, 330, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• JSON ichidagi bitta qiymat o'zgarsa ham, butun qator qulflanadi.", 160, 375, { size: 16, color: C.ink, fam: UI });
      text("• Barcha ma'lumotni bitta gigant JSON ustunga yig'ish tizimni sekinlashtiradi.", 160, 415, { size: 16, color: C.ink, fam: UI });
      text("• Tashqi kalit (FOREIGN KEY) va cheklovlar JSON ichida ishlamaydi!", 160, 455, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• Shuning uchun relyatsion ustunlar va JSON muvozanatda bo'lishi shart.", 160, 495, { size: 16, color: C.soft, fam: UI });

      card(130, 590, 780, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("Oltin qoidalar:", 160, 630, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Id, sana, mijoz, summa, holat — DOIMO alohida relyatsion ustun.", 160, 675, { size: 16, weight: 700, color: '#15803d', fam: UI });
      text("• Mahsulot xususiyatlari (rang, o'lcham, xotira) — JSONB ustunida.", 160, 715, { size: 16, color: C.ink, fam: UI });
      text("• Kam so'raladigan dinamik metadata — JSONB da juda mos.", 160, 750, { size: 16, color: C.soft, fam: UI });

      card(130, 810, 780, 120, { fill: '#eff6ff', col: C.blue, p: k });
      text("Gibrid arxitektura: Relatsion intizom + JSON moslashuvchanligi.", 160, 855, { size: 17, weight: 700, color: C.blue, fam: UI });

      // O'ng: GIN indeksi
      card(980, 190, 840, 770, { fill: C.card, col: C.green, p: k });
      pill("2. GIN Indeksi Bilan Tezlashtirish", 1400, 240, C.green, k, 19);

      card(1010, 290, 780, 270, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Butun JSONB hujjatiga GIN indeksi qurish:", 1035, 330, { size: 16, color: '#86efac', fam: MONO });
      text("CREATE INDEX buyurtmalar_gin", 1035, 375, { size: 18, color: '#fff', fam: MONO });
      text("ON buyurtmalar USING GIN (hujjat);", 1035, 415, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      sline(1035, 445, 1750, 445, { col: '#334155', w: 1.5 });
      text("Qo'llab-quvvatlaydigan operatorlar:", 1035, 480, { size: 16, color: '#94a3b8', fam: UI });
      text("@>, ?, ?|, ?&, @?, @@  --> Bitmap Index Scan!", 1035, 520, { size: 18, weight: 700, color: '#86efac', fam: MONO });

      card(1010, 590, 780, 190, { fill: '#fffbeb', col: C.orange, p: k });
      text("Indeks tuzog'i:", 1040, 630, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• GIN indeksi hujjat @> '...' kabi operatorlar bilan ishlaydi.", 1040, 675, { size: 16, color: C.ink, fam: UI });
      text("• Ammo hujjat ->> 'shahar' = 'Toshkent' yozsangiz, GIN ISHLAMAYDI!", 1040, 715, { size: 16, weight: 700, color: C.red, fam: UI });
      text("• Buning uchun alohida ifoda indeksi qurish kerak bo'ladi.", 1040, 750, { size: 16, color: C.soft, fam: UI });

      card(1010, 810, 780, 120, { fill: '#f0fdf4', col: C.green, p: k });
      text("Keyingi qismda: JSON_TABLE va buyurtmalar jadvalida amaliy SQL ko'ramiz!", 1040, 855, { size: 17, weight: 700, color: C.green, fam: UI });
    });
  }

  // FRAME RENDERER
  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.json_vs_jsonb.s) {
      sIntro(t);
    } else if (t < TM.scenes.operatorlar.s) {
      sTypes(t);
    } else if (t < TM.scenes.containment_va_filter.s) {
      sOps(t);
    } else if (t < TM.scenes.loyihalash_va_indeks.s) {
      sContain(t);
    } else {
      sDesign(t);
    }
  };

  window.renderPoster = () => window.renderFrame(5.0);
})();
