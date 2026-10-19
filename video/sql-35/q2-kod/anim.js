// SQL 35-bob 2-qism: "Kod" — JSON amaliyoti
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

  // 1. KIRISH VA OPERATORLAR (0s - 22.77s)
  function sKirish(t) {
    heading("JSON Bilan Ishlash: Qiymat Ajratish (->, ->>, #>>)", t, TM.scenes.kirish.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      // Chap: buyurtmalar jadvali
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Boshlang'ich Jadval: buyurtmalar", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 310, { fill: '#1e293b', col: '#334155', p: k });
      text("CREATE TABLE buyurtmalar (id int PRIMARY KEY, hujjat jsonb);", 130, 310, { size: 15, color: '#93c5fd', fam: MONO });
      sline(130, 325, 870, 325, { col: '#475569', w: 1.5 });

      text("id | hujjat (jsonb formati)", 130, 355, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      sline(130, 370, 870, 370, { col: '#475569', w: 1 });

      text(" 1 | {\"mijoz\": \"Ali\", \"shahar\": \"Toshkent\",", 130, 400, { size: 14, color: '#fff', fam: MONO });
      text("   |  \"teglar\": [\"tez\", \"sovga\"], \"mahsulotlar\": [...] }", 130, 425, { size: 14, color: '#94a3b8', fam: MONO });

      text(" 2 | {\"mijoz\": \"Vali\", \"shahar\": \"Samarqand\",", 130, 460, { size: 14, color: '#fff', fam: MONO });
      text("   |  \"teglar\": [\"tez\"], \"mahsulotlar\": [{\"nom\":\"Kitob\"...}]}", 130, 485, { size: 14, color: '#94a3b8', fam: MONO });

      text(" 3 | {\"mijoz\": \"Sobir\", \"shahar\": \"Toshkent\", \"mahsulotlar\": []}", 130, 520, { size: 14, color: '#fff', fam: MONO });

      card(110, 605, 790, 215, { fill: '#eff6ff', col: C.blue, p: k });
      text("Operatorlar farqi:", 135, 645, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• ->  : Elementni JSON sifatida qaytaradi (qo'shtirnoq bilan: \"Ali\").", 135, 690, { size: 16, color: C.ink, fam: UI });
      text("• ->> : Elementni toza matn sifatida qaytaradi (qo'shtirnoqsiz: Ali).", 135, 730, { size: 16, color: C.ink, fam: UI });
      text("• #>> : Ichki massiv yoki ob'ekt yo'li bo'yicha qiymat sug'urib oladi.", 135, 770, { size: 16, weight: 700, color: C.purple, fam: UI });

      card(110, 840, 790, 130, { fill: '#f0fdf4', col: C.green, p: k });
      text("Taqqoslash va WHERE shartlarida doimo ->> (matn) ishlatiladi!", 135, 885, { size: 17, weight: 700, color: C.green, fam: UI });
      text("Yo'q element so'ralsa xato bermaydi, NULL qaytaradi.", 135, 925, { size: 15, color: C.ink, fam: UI });

      // O'ng: SQL so'rovi va natija
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. SQL So'rovi va PostgreSQL Natijasi", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT id,", 1045, 310, { size: 16, color: '#fff', fam: MONO });
      text("       hujjat -> 'mijoz'                AS json_qiymat,", 1045, 345, { size: 16, color: '#93c5fd', fam: MONO });
      text("       hujjat ->> 'mijoz'               AS matn,", 1045, 380, { size: 16, color: '#86efac', fam: MONO });
      text("       hujjat #>> '{mahsulotlar,0,nom}'  AS birinchi", 1045, 415, { size: 16, color: '#fbbf24', fam: MONO });
      text("FROM buyurtmalar ORDER BY id;", 1045, 455, { size: 16, color: '#94a3b8', fam: MONO });

      card(1020, 555, 790, 265, { fill: '#0f172a', col: '#334155', p: k });
      text("id | json_qiymat | matn  | birinchi", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text(" 1 | \"Ali\"       | Ali   | Daftar", 1045, 645, { size: 16, color: '#86efac', fam: MONO });
      text(" 2 | \"Vali\"      | Vali  | Kitob", 1045, 685, { size: 16, color: '#86efac', fam: MONO });
      text(" 3 | \"Sobir\"     | Sobir | (NULL)", 1045, 725, { size: 16, color: '#fbbf24', fam: MONO });
      sline(1045, 750, 1780, 750, { col: '#475569', w: 1 });
      text("(3 rows)", 1045, 780, { size: 15, color: '#64748b', fam: MONO });

      card(1020, 840, 790, 130, { fill: '#fff7ed', col: C.orange, p: k });
      text("E'tibor bering: 3-qatorda mahsulotlar bo'sh bo'lgani uchun", 1045, 885, { size: 17, weight: 700, color: C.orange, fam: UI });
      text("hujjat #>> '{mahsulotlar,0,nom}' xavfsiz ravishda NULL qaytardi.", 1045, 925, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 2. FILTRLASH: @> VA ? (22.77s - 37.66s)
  function sContainment(t) {
    heading("Filtrlash: Containment (@>) va Kalit Tekshiruvi (?)", t, TM.scenes.containment_va_filter.s);

    const k = P(t, TM.scenes.containment_va_filter.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: @> operatori
      card(80, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("1. Containment: @> (O'z Ichiga Olish)", 505, 220, C.green, k, 19);

      card(110, 270, 790, 240, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Shahari Toshkent bo'lgan barcha hujjatlar:", 135, 310, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT id, hujjat ->> 'mijoz' AS mijoz", 135, 350, { size: 17, color: '#fff', fam: MONO });
      text("FROM buyurtmalar", 135, 390, { size: 17, color: '#fff', fam: MONO });
      text("WHERE hujjat @> '{\"shahar\": \"Toshkent\"}'", 135, 430, { size: 17, weight: 700, color: '#fbbf24', fam: MONO });
      text("ORDER BY id;", 135, 470, { size: 17, color: '#94a3b8', fam: MONO });

      card(110, 535, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("id | mijoz", 135, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 590, 870, 590, { col: '#475569', w: 1.5 });
      text(" 1 | Ali", 135, 625, { size: 16, color: '#86efac', fam: MONO });
      text(" 3 | Sobir", 135, 665, { size: 16, color: '#86efac', fam: MONO });
      sline(135, 690, 870, 690, { col: '#475569', w: 1 });
      text("(2 rows)  -- Vali Samarqandda, shuning uchun tushib qoldi", 135, 720, { size: 14, color: '#64748b', fam: MONO });

      card(110, 780, 790, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("@> operatorining afzalliklari:", 135, 820, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• JSON tuzilmasining aniq qismini solishtiradi.", 135, 865, { size: 16, color: C.ink, fam: UI });
      text("• GIN indeksi bilan bevosita ishlaydi va o'ta tez ishlaydi!", 135, 905, { size: 16, weight: 700, color: C.blue, fam: UI });
      text("• Murakkab obyekt va massivlar ichini ham chuqur qidiradi.", 135, 940, { size: 15, color: C.ink, fam: UI });

      // O'ng: ? va kalit mavjudligi
      card(990, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("2. Kalit yoki Element Mavjudligi: ?", 1415, 220, C.purple, k, 19);

      card(1020, 270, 790, 250, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- 1. 'teglar' massivida 'sovga' qiymati bormi?", 1045, 310, { size: 15, color: '#c084fc', fam: MONO });
      text("SELECT id FROM buyurtmalar", 1045, 345, { size: 16, color: '#fff', fam: MONO });
      text("WHERE hujjat -> 'teglar' ? 'sovga';", 1045, 380, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("--> Natija: id = 1 (faqat Ali sovga tegi olgan)", 1045, 415, { size: 14, color: '#86efac', fam: MONO });
      sline(1045, 435, 1780, 435, { col: '#475569', w: 1 });
      text("-- 2. Yuqori darajada 'teglar' kaliti mavjudmi?", 1045, 465, { size: 15, color: '#c084fc', fam: MONO });
      text("SELECT id FROM buyurtmalar WHERE hujjat ? 'teglar';", 1045, 495, { size: 16, color: '#fff', fam: MONO });

      card(1020, 545, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Ikkinchi so'rov natijasi:", 1045, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 600, 1780, 600, { col: '#475569', w: 1.5 });
      text(" id ", 1045, 630, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("----", 1045, 650, { size: 16, color: '#475569', fam: MONO });
      text("  1 ", 1045, 675, { size: 16, color: '#86efac', fam: MONO });
      text("  2 ", 1045, 705, { size: 16, color: '#86efac', fam: MONO });
      text("(2 rows)  -- Sobirda 'teglar' kaliti yo'q, shuning uchun kirmadi", 1045, 735, { size: 14, color: '#64748b', fam: MONO });

      card(1020, 780, 790, 190, { fill: '#faf5ff', col: C.purple, p: k });
      text("Muhim operatorlar oilasi:", 1045, 820, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• ?  : Ko'rsatilgan kalit/satr bormi? (bitta qiymat)", 1045, 865, { size: 16, color: C.ink, fam: UI });
      text("• ?| : Massivdagi kalitlardan kamida bittasi bormi? (OR sharti)", 1045, 905, { size: 16, color: C.ink, fam: UI });
      text("• ?& : Berilgan barcha kalitlar bir vaqtda bormi? (AND sharti)", 1045, 940, { size: 16, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 3. SQL/JSON: JSON_VALUE VA JSON_EXISTS (37.66s - 54.44s)
  function sSqlJson(t) {
    heading("SQL/JSON Standarti: JSON_VALUE va JSON_EXISTS", t, TM.scenes.sql_json_functions.s);

    const k = P(t, TM.scenes.sql_json_functions.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: JSON_VALUE
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. JSON_VALUE (SQL Tipiga O'girish)", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("SELECT id,", 135, 310, { size: 16, color: '#fff', fam: MONO });
      text("       JSON_VALUE(hujjat, '$.mahsulotlar[0].narx'", 135, 350, { size: 16, weight: 700, color: '#93c5fd', fam: MONO });
      text("                  RETURNING int) AS narx", 135, 390, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("FROM buyurtmalar", 135, 430, { size: 16, color: '#fff', fam: MONO });
      text("ORDER BY id;", 135, 470, { size: 16, color: '#94a3b8', fam: MONO });

      card(110, 555, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("id | narx", 135, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text(" 1 | 12000", 135, 645, { size: 16, color: '#86efac', fam: MONO });
      text(" 2 | 85000", 135, 685, { size: 16, color: '#86efac', fam: MONO });
      text(" 3 | (NULL)", 135, 725, { size: 16, color: '#fbbf24', fam: MONO });

      card(110, 790, 790, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("JSON_VALUE xususiyati:", 135, 830, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• RETURNING orqali natija tipi darhol int, text, date bo'ladi.", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("• Qo'shimcha ::int yoki CAST chaqirish talab qilinmaydi.", 135, 915, { size: 16, color: C.ink, fam: UI });
      text("• SQL standartiga to'liq mos keladi (Postgres 17+, Oracle, MySQL).", 135, 950, { size: 15, weight: 700, color: C.green, fam: UI });

      // O'ng: JSON_EXISTS
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. JSON_EXISTS va jsonpath Filtri", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("SELECT id,", 1045, 310, { size: 16, color: '#fff', fam: MONO });
      text("       JSON_EXISTS(hujjat,", 1045, 350, { size: 16, weight: 700, color: '#fed7aa', fam: MONO });
      text("         '$.mahsulotlar[*] ? (@.narx > 50000)')", 1045, 390, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("         AS qimmat_bor", 1045, 430, { size: 16, color: '#93c5fd', fam: MONO });
      text("FROM buyurtmalar ORDER BY id;", 1045, 470, { size: 16, color: '#94a3b8', fam: MONO });

      card(1020, 555, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("id | qimmat_bor", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text(" 1 | false  (12000 va 3000 <= 50000)", 1045, 645, { size: 16, color: '#f87171', fam: MONO });
      text(" 2 | true   (Kitob narxi 85000 > 50000)", 1045, 685, { size: 16, color: '#86efac', fam: MONO });
      text(" 3 | false  (Mahsulotlar massivi bo'sh)", 1045, 725, { size: 16, color: '#f87171', fam: MONO });

      card(1020, 790, 790, 180, { fill: '#fff7ed', col: C.orange, p: k });
      text("jsonpath imkoniyatlari:", 1045, 830, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• [*] : Massivning barcha elementlari bo'yicha iteratsiya qiladi.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("• ? (@.narx > 50000) : @ joriy elementni bildiradi.", 1045, 915, { size: 16, weight: 700, color: C.orange, fam: UI });
      text("• Natija rost yoki yolg'on (boolean) qaytaradi.", 1045, 950, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 4. JSON_TABLE VA AGREGATSIYA (54.44s - 68.93s)
  function sJsonTable(t) {
    heading("JSON_TABLE: Massivni Qatorlarga Yoyish va Agregatsiya", t, TM.scenes.json_table_va_agregatsiya.s);

    const k = P(t, TM.scenes.json_table_va_agregatsiya.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: JSON_TABLE so'rovi
      card(80, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("1. JSON_TABLE Standart So'rovi", 505, 220, C.green, k, 19);

      card(110, 270, 790, 280, { fill: '#1e293b', col: '#166534', p: k });
      text("SELECT b.id, jt.*", 135, 310, { size: 16, color: '#fff', fam: MONO });
      text("FROM buyurtmalar b,", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("     JSON_TABLE(b.hujjat, '$.mahsulotlar[*]'", 135, 380, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("       COLUMNS (", 135, 415, { size: 16, color: '#86efac', fam: MONO });
      text("         nom  text PATH '$.nom',", 135, 450, { size: 16, color: '#93c5fd', fam: MONO });
      text("         soni int  PATH '$.soni',", 135, 485, { size: 16, color: '#fbbf24', fam: MONO });
      text("         narx int  PATH '$.narx'", 135, 520, { size: 16, color: '#fbbf24', fam: MONO });
      text("       )) AS jt ORDER BY b.id, jt.nom;", 135, 555, { size: 15, color: '#94a3b8', fam: MONO });

      card(110, 580, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("id |  nom   | soni | narx", 135, 620, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 635, 870, 635, { col: '#475569', w: 1.5 });
      text(" 1 | Daftar |    2 | 12000", 135, 670, { size: 16, color: '#86efac', fam: MONO });
      text(" 1 | Ruchka |    5 |  3000", 135, 710, { size: 16, color: '#86efac', fam: MONO });
      text(" 2 | Kitob  |    1 | 85000", 135, 750, { size: 16, color: '#86efac', fam: MONO });

      card(110, 815, 790, 160, { fill: '#f0fdf4', col: C.green, p: k });
      text("Har bir element alohida relyatsion qatorga aylandi!", 135, 855, { size: 18, weight: 700, color: C.green, fam: UI });
      text("Endi bu qatorlar ustida har qanday SQL amallarini bajarish mumkin.", 135, 895, { size: 16, color: C.ink, fam: UI });
      text("Bo'sh massivlar uchun satr hosil bo'lmaydi (INNER JOIN kabi).", 135, 935, { size: 15, color: C.ink, fam: UI });

      // O'ng: Agregatsiya va hisob-kitob
      card(990, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("2. Relyatsion Agregatsiya va Summa", 1415, 220, C.blue, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- Har bir buyurtmaning jami summasi:", 1045, 310, { size: 15, color: '#93c5fd', fam: MONO });
      text("SELECT b.id,", 1045, 350, { size: 16, color: '#fff', fam: MONO });
      text("       sum(jt.soni * jt.narx) AS jami", 1045, 390, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("FROM buyurtmalar b,", 1045, 430, { size: 16, color: '#fff', fam: MONO });
      text("     JSON_TABLE(...) AS jt", 1045, 470, { size: 16, color: '#86efac', fam: MONO });
      text("GROUP BY b.id ORDER BY b.id;", 1045, 510, { size: 16, color: '#94a3b8', fam: MONO });

      card(1020, 555, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("id | jami", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text(" 1 | 39000  (2 * 12000 + 5 * 3000)", 1045, 650, { size: 16, color: '#86efac', fam: MONO });
      text(" 2 | 85000  (1 * 85000)", 1045, 690, { size: 16, color: '#86efac', fam: MONO });
      sline(1045, 715, 1780, 715, { col: '#475569', w: 1 });
      text("Eslatma: LEFT JOIN LATERAL bilan 3-id ham NULL chiqadi.", 1045, 745, { size: 14, color: '#64748b', fam: MONO });

      card(1020, 800, 790, 175, { fill: '#eff6ff', col: C.blue, p: k });
      text("Eng kuchli tomoni:", 1045, 840, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Murakkab no-SQL massivlar oddiy jadvallarga aylanadi.", 1045, 885, { size: 16, color: C.ink, fam: UI });
      text("• Standart SQL funksiyalari (SUM, COUNT, GROUP BY) to'liq ishlaydi.", 1045, 925, { size: 16, weight: 700, color: C.blue, fam: UI });
      text("• Hisobotlar uchun dastur darajasida parse qilish shart emas!", 1045, 960, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 5. O'ZGARTIRISH VA GIN INDEKSI (68.93s - 87.32s)
  function sUpdateVaGin(t) {
    heading("O'zgartirish va GIN Indeksi", t, TM.scenes.update_va_gin.s);

    const k = P(t, TM.scenes.update_va_gin.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: jsonb_set va ||
      card(80, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("1. Hujjatni Yangilash (jsonb_set va ||)", 505, 220, C.purple, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- 1. Mavjud kalitni o'zgartirish:", 135, 305, { size: 14, color: '#c084fc', fam: MONO });
      text("UPDATE buyurtmalar", 135, 335, { size: 15, color: '#fff', fam: MONO });
      text("SET hujjat = jsonb_set(hujjat, '{shahar}', '\"Buxoro\"')", 135, 365, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      text("WHERE id = 3;", 135, 395, { size: 15, color: '#fff', fam: MONO });
      sline(135, 415, 870, 415, { col: '#475569', w: 1 });
      text("-- 2. Yangi maydon qo'shish yoki birlashtirish:", 135, 445, { size: 14, color: '#c084fc', fam: MONO });
      text("UPDATE buyurtmalar", 135, 475, { size: 15, color: '#fff', fam: MONO });
      text("SET hujjat = hujjat || '{\"tolangan\": true}'", 135, 505, { size: 15, weight: 700, color: '#86efac', fam: MONO });
      text("WHERE id = 3;", 135, 535, { size: 15, color: '#fff', fam: MONO });

      card(110, 555, 790, 180, { fill: '#0f172a', col: '#334155', p: k });
      text("Natija (id = 3):", 135, 595, { size: 15, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text("{", 135, 640, { size: 15, color: '#fff', fam: MONO });
      text("  \"mijoz\": \"Sobir\", \"shahar\": \"Buxoro\",", 160, 665, { size: 15, color: '#86efac', fam: MONO });
      text("  \"tolangan\": true, \"mahsulotlar\": []", 160, 690, { size: 15, color: '#fbbf24', fam: MONO });
      text("}", 135, 715, { size: 15, color: '#fff', fam: MONO });

      card(110, 755, 790, 220, { fill: '#faf5ff', col: C.purple, p: k });
      text("Qat'iy qoida va ogohlantirish:", 135, 795, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• jsonb_set dagi yangi qiymat JSON string bo'lishi shart: '\"Buxoro\"'.", 135, 840, { size: 15, weight: 700, color: C.purple, fam: UI });
      text("• Noto'g'ri JSON (masalan, ortiqcha vergul ,}) xato beradi:", 135, 880, { size: 15, color: C.red, fam: UI });
      text("  ERROR: invalid input syntax for type json (Expected string...)", 135, 915, { size: 14, color: C.red, fam: MONO });
      text("• PostgreSQL noto'g'ri formatli JSONni bazaga kiritmaydi!", 135, 950, { size: 15, weight: 700, color: C.green, fam: UI });

      // O'ng: GIN indeksi
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. GIN Indeksi va Muhim Qopqon", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 160, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("CREATE INDEX buyurtmalar_gin", 1045, 310, { size: 16, color: '#fff', fam: MONO });
      text("ON buyurtmalar USING GIN (hujjat);", 1045, 350, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("-- Indeks butun JSON daraxtining kalit va qiymatlarini saqlaydi", 1045, 395, { size: 14, color: '#94a3b8', fam: MONO });

      card(1020, 455, 790, 260, { fill: '#0f172a', col: '#334155', p: k });
      text("1. WHERE hujjat @> '{\"shahar\": \"Toshkent\"}';", 1045, 495, { size: 15, color: '#86efac', fam: MONO });
      text("   -> Bitmap Index Scan on buyurtmalar_gin (ISHLA YDI!)", 1045, 525, { size: 14, weight: 700, color: '#86efac', fam: MONO });
      sline(1045, 550, 1780, 550, { col: '#475569', w: 1 });
      text("2. WHERE hujjat ->> 'shahar' = 'Toshkent';", 1045, 585, { size: 15, color: '#f87171', fam: MONO });
      text("   -> Seq Scan! (GIN ISHLAMAYDI, butun jadval tekshiriladi!)", 1045, 615, { size: 14, weight: 700, color: '#f87171', fam: MONO });
      sline(1045, 640, 1780, 640, { col: '#475569', w: 1 });
      text("Tuzatish: ->> uchun alohida ifoda indeksi kerak:", 1045, 670, { size: 14, color: '#fbbf24', fam: MONO });
      text("CREATE INDEX ON buyurtmalar ((hujjat ->> 'shahar'));", 1045, 695, { size: 14, color: '#93c5fd', fam: MONO });

      card(1020, 740, 790, 235, { fill: '#fff7ed', col: C.orange, p: k });
      text("Asosiy xulosa:", 1045, 780, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• GIN faqat @>, ?, ?|, ?& kabi containment operatorlari bilan ishlaydi.", 1045, 825, { size: 15, color: C.ink, fam: UI });
      text("• ->> operatori matn qaytargani sababli GIN unga tatbiq qilinmaydi.", 1045, 865, { size: 15, color: C.ink, fam: UI });
      text("• Agar maydon bo'yicha tenglik qidirilsa, ifoda indeksi yarating.", 1045, 905, { size: 15, weight: 700, color: C.blue, fam: UI });
      text("• Yoki so'rovni @> formatida yozing!", 1045, 945, { size: 15, weight: 700, color: C.green, fam: UI });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.containment_va_filter.s) {
      sKirish(t);
    } else if (t < TM.scenes.sql_json_functions.s) {
      sContainment(t);
    } else if (t < TM.scenes.json_table_va_agregatsiya.s) {
      sSqlJson(t);
    } else if (t < TM.scenes.update_va_gin.s) {
      sJsonTable(t);
    } else {
      sUpdateVaGin(t);
    }
  }

  window.renderFrame = function (t) {
    draw(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
