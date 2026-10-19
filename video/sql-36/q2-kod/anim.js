// SQL 36-bob 2-qism: "Kod" — Massiv, range, domain va composite amalda
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

  // 1. MASSIVLAR AMALDA (0s - 14.80s)
  function sMassivlar(t) {
    heading("Massivlar Amalda: Indekslash va Qidiruv", t, TM.scenes.massivlar_amalda.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      // Chap: Jadval va indekslash
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Boshlang'ich Jadval va Indekslar", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 240, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("INSERT INTO maqolalar VALUES", 135, 305, { size: 15, color: '#93c5fd', fam: MONO });
      text("  (1, 'SQL asoslari', ARRAY['sql','postgres'], '{5,4,5}'),", 135, 340, { size: 14, color: '#fff', fam: MONO });
      text("  (2, 'JSON',         '{json,postgres,mysql}', '{3}'),", 135, 375, { size: 14, color: '#fff', fam: MONO });
      text("  (3, 'Git',          '{}',                   NULL);", 135, 410, { size: 14, color: '#fff', fam: MONO });
      sline(135, 435, 870, 435, { col: '#475569', w: 1 });
      text("SELECT id, teglar[1] AS birinchi, cardinality(teglar) AS soni ...", 135, 465, { size: 14, color: '#fbbf24', fam: MONO });

      card(110, 535, 790, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("id |        teglar         | birinchi | yoq | soni", 135, 575, { size: 15, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 590, 870, 590, { col: '#475569', w: 1.5 });
      text(" 1 | {sql,postgres}        | sql      |     |    2", 135, 630, { size: 15, color: '#86efac', fam: MONO });
      text(" 2 | {json,postgres,mysql} | json     |     |    3", 135, 670, { size: 15, color: '#86efac', fam: MONO });
      text(" 3 | {}                    | (NULL)   |     |    0", 135, 710, { size: 15, color: '#fbbf24', fam: MONO });
      sline(135, 735, 870, 735, { col: '#475569', w: 1 });
      text("teglar[10] chegaradan oshsa NULL qaytaradi (xato bermaydi).", 135, 760, { size: 14, color: '#64748b', fam: MONO });

      card(110, 800, 790, 175, { fill: '#eff6ff', col: C.blue, p: k });
      text("Muhim xususiyatlar:", 135, 840, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• ARRAY[...] yoki matnli '{a,b}' sintaksisi bir xil ishlaydi.", 135, 885, { size: 16, color: C.ink, fam: UI });
      text("• Bo'sh massivda cardinality = 0, array_length esa NULL beradi.", 135, 925, { size: 16, weight: 700, color: C.purple, fam: UI });
      text("• Massiv indekslari doimo 1 dan boshlanadi!", 135, 955, { size: 15, weight: 700, color: C.green, fam: UI });

      // O'ng: Qidiruv operatorlari
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. Massivdan Qidiruv Operatorlari", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 270, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- 1. Element borligi (ANY):", 1045, 305, { size: 15, color: '#fed7aa', fam: MONO });
      text("SELECT id FROM maqolalar WHERE 'postgres' = ANY (teglar);", 1045, 340, { size: 15, weight: 700, color: '#86efac', fam: MONO });
      text("--> Natija: id 1 va 2", 1045, 370, { size: 14, color: '#86efac', fam: MONO });
      sline(1045, 390, 1780, 390, { col: '#475569', w: 1 });
      text("-- 2. O'z ichiga olish (@>):", 1045, 415, { size: 15, color: '#fed7aa', fam: MONO });
      text("SELECT id FROM maqolalar WHERE teglar @> ARRAY['json','mysql'];", 1045, 445, { size: 14, color: '#fbbf24', fam: MONO });
      text("--> Natija: id 2 (faqat 2 da ikkalasi bor)", 1045, 475, { size: 14, color: '#fbbf24', fam: MONO });
      sline(1045, 495, 1780, 495, { col: '#475569', w: 1 });
      text("-- 3. Kesishish (&&):", 1045, 520, { size: 15, color: '#fed7aa', fam: MONO });
      text("SELECT id FROM maqolalar WHERE teglar && ARRAY['sql','mysql'];", 1045, 550, { size: 14, color: '#93c5fd', fam: MONO });

      card(1020, 565, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Qidiruv tezligi va GIN indeksi:", 1045, 605, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 620, 1780, 620, { col: '#475569', w: 1.5 });
      text("• CREATE INDEX ON maqolalar USING GIN (teglar);", 1045, 660, { size: 15, color: '#fbbf24', fam: MONO });
      text("• GIN indeksi @> va && operatorlarini 1000 baravar tezlatadi!", 1045, 700, { size: 15, color: '#86efac', fam: MONO });
      text("• ANY operatori esa odatda ketma-ket (Seq Scan) o'qishi mumkin.", 1045, 740, { size: 15, color: '#94a3b8', fam: MONO });

      card(1020, 800, 790, 175, { fill: '#fff7ed', col: C.orange, p: k });
      text("Asosiy xulosa:", 1045, 840, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• Massiv ichidagi elementlarni qidirishda @> va && juda qulay.", 1045, 885, { size: 16, color: C.ink, fam: UI });
      text("• Lekin murakkab biznes qoidalarida alohida jadval ancha yaxshi ishlaydi.", 1045, 925, { size: 16, color: C.ink, fam: UI });
      text("• GIN indeksisiz katta massivlarni qidirish tavsiya etilmaydi.", 1045, 955, { size: 15, weight: 700, color: C.orange, fam: UI });
    });
  }

  // 2. UNNEST VA AGREGATSIYA (14.80s - 29.47s)
  function sUnnest(t) {
    heading("unnest va array_agg: Qatorlarga Yoyish va Yig'ish", t, TM.scenes.unnest_va_agregatsiya.s);

    const k = P(t, TM.scenes.unnest_va_agregatsiya.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: unnest bilan guruhlash
      card(80, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("1. unnest: Massivni Qatorlarga Yoyish", 505, 220, C.green, k, 19);

      card(110, 270, 790, 250, { fill: '#1e293b', col: '#166534', p: k });
      text("-- Har teg bo'yicha maqolalar soni hisoboti:", 135, 305, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT t.teg, count(*)", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("FROM maqolalar m, unnest(m.teglar) AS t(teg)", 135, 385, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("GROUP BY t.teg", 135, 420, { size: 16, color: '#fff', fam: MONO });
      text("ORDER BY count(*) DESC, t.teg;", 135, 455, { size: 16, color: '#94a3b8', fam: MONO });

      card(110, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("teg      | count", 135, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 600, 870, 600, { col: '#475569', w: 1.5 });
      text("postgres |     2", 135, 640, { size: 16, color: '#86efac', fam: MONO });
      text("json     |     1", 135, 675, { size: 16, color: '#86efac', fam: MONO });
      text("mysql    |     1", 135, 710, { size: 16, color: '#86efac', fam: MONO });
      text("sql      |     1", 135, 745, { size: 16, color: '#86efac', fam: MONO });

      card(110, 790, 790, 185, { fill: '#f0fdf4', col: C.green, p: k });
      text("Qanday ishlaydi?", 135, 830, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• unnest massivdagi har bir elementni alohida satrga aylantiradi.", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("• Keyin oddiy relyatsion GROUP BY orqali umumiy hisob-kitob qilinadi.", 135, 915, { size: 16, color: C.ink, fam: UI });
      text("• Bo'sh massivlar uchun satr hosil bo'lmaydi.", 135, 945, { size: 15, weight: 700, color: C.blue, fam: UI });

      // O'ng: array_agg va ko'p o'lcham
      card(990, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("2. array_agg va O'lcham Cheklanmasligi", 1415, 220, C.purple, k, 19);

      card(1020, 270, 790, 240, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- Teskarisi: Qatorlarni massivga yig'ish:", 1045, 305, { size: 15, color: '#c084fc', fam: MONO });
      text("SELECT array_agg(sarlavha ORDER BY id) FROM maqolalar;", 1045, 345, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      sline(1045, 370, 1780, 370, { col: '#475569', w: 1 });
      text("--> Natija: {\"SQL asoslari\",JSON,Git}", 1045, 405, { size: 16, color: '#86efac', fam: MONO });
      sline(1045, 430, 1780, 430, { col: '#475569', w: 1 });
      text("-- Ikki o'lchamli massiv yozish:", 1045, 460, { size: 15, color: '#c084fc', fam: MONO });
      text("INSERT INTO maqolalar VALUES (4, 'x', '{{a,b},{c,d}}', '{1}');", 1045, 490, { size: 14, color: '#fff', fam: MONO });

      card(1020, 535, 790, 230, { fill: '#0f172a', col: '#334155', p: k });
      text("Ko'p o'lchamli tekshiruv natijasi:", 1045, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 590, 1780, 590, { col: '#475569', w: 1.5 });
      text("SELECT id, teglar, array_ndims(teglar) FROM maqolalar WHERE id = 4;", 1045, 630, { size: 14, color: '#fbbf24', fam: MONO });
      text("id |    teglar     | array_ndims", 1045, 670, { size: 15, weight: 700, color: '#94a3b8', fam: MONO });
      text(" 4 | {{a,b},{c,d}} |           2", 1045, 710, { size: 15, color: '#86efac', fam: MONO });
      text("Ustun text[] (1-o'lcham) bo'lsa ham, 2-o'lchamli massiv qabul qilindi!", 1045, 745, { size: 14, color: '#f87171', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#faf5ff', col: C.purple, p: k });
      text("O'lcham nazorati kerak bo'lsa:", 1045, 830, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Postgres massiv o'lchamini sukut bo'yicha cheklamaydi.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("• Faqat bir o'lchamli bo'lishini ta'minlash uchun cheklov qo'shing:", 1045, 915, { size: 15, color: C.ink, fam: UI });
      text("  CHECK (array_ndims(teglar) = 1)", 1045, 945, { size: 16, weight: 700, color: C.purple, fam: MONO });
    });
  }

  // 3. RANGE AMALDA (29.47s - 44.25s)
  function sRange(t) {
    heading("Range: Chegaralar, Operatorlar va Multirange", t, TM.scenes.range_amalda.s);

    const k = P(t, TM.scenes.range_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Kanonik chegaralar
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Kanonik Chegaralar va Tekshiruv", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 250, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("SELECT daterange('2026-02-01', '2026-02-05', '[]') AS yopiq,", 135, 305, { size: 15, color: '#93c5fd', fam: MONO });
      text("       int4range(1, 10, '(]')                      AS r,", 135, 340, { size: 15, color: '#fbbf24', fam: MONO });
      text("       daterange(...) @> date '2026-02-05'         AS ichidami,", 135, 375, { size: 15, color: '#f87171', fam: MONO });
      text("       daterange(...) && daterange(...)            AS kesishadi;", 135, 410, { size: 15, color: '#86efac', fam: MONO });
      sline(135, 435, 870, 435, { col: '#475569', w: 1 });
      text("-- Haqiqiy PostgreSQL 18.6 javobi:", 135, 465, { size: 14, color: '#94a3b8', fam: MONO });

      card(110, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("          yopiq          |   r    | ichidami | kesishadi", 135, 585, { size: 15, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 600, 870, 600, { col: '#475569', w: 1.5 });
      text(" [2026-02-01,2026-02-06) | [2,11) | f        | t", 135, 650, { size: 16, color: '#86efac', fam: MONO });
      sline(135, 680, 870, 680, { col: '#475569', w: 1 });
      text("E'tibor bering: 5-fevral oraliqqa kirmagani uchun ichidami = f bo'ldi!", 135, 715, { size: 14, color: '#fbbf24', fam: MONO });
      text("Chunki sukut bo'yicha [) yarim ochiq chegara qo'llaniladi.", 135, 745, { size: 14, color: '#64748b', fam: MONO });

      card(110, 790, 790, 185, { fill: '#eff6ff', col: C.blue, p: k });
      text("Yarim ochiq oraliqning afzalligi:", 135, 830, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• [1-fevral, 5-fevral) va [5-fevral, 8-fevral) 5-kuni kesishmaydi.", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("• Xona bo'shagan kuniyoq yangi mijoz qabul qilinishi mumkin.", 135, 915, { size: 16, weight: 700, color: C.green, fam: UI });
      text("• Hisob-kitoblar aniq va ziddiyatsiz bo'ladi.", 135, 945, { size: 15, color: C.blue, fam: UI });

      // O'ng: Multirange birlashmasi
      card(990, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("2. Multirange: Avtomatik Birlashish", 1415, 220, C.green, k, 19);

      card(1020, 270, 790, 250, { fill: '#1e293b', col: '#166534', p: k });
      text("SELECT datemultirange(", 1045, 305, { size: 16, color: '#86efac', fam: MONO });
      text("    daterange('2026-02-01','2026-02-05'),", 1065, 340, { size: 15, color: '#fff', fam: MONO });
      text("    daterange('2026-02-03','2026-02-08'),", 1065, 375, { size: 15, color: '#fbbf24', fam: MONO });
      text("    daterange('2026-03-01','2026-03-02')", 1065, 410, { size: 15, color: '#fff', fam: MONO });
      text(") AS birlashma;", 1045, 445, { size: 16, color: '#86efac', fam: MONO });

      card(1020, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("PostgreSQL 18.6 multirange natijasi:", 1045, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 600, 1780, 600, { col: '#475569', w: 1.5 });
      text("{[2026-02-01,2026-02-08), [2026-03-01,2026-03-02)}", 1045, 650, { size: 17, weight: 700, color: '#86efac', fam: MONO });
      sline(1045, 680, 1780, 680, { col: '#475569', w: 1 });
      text("1-fevraldan 5-gacha va 3-dan 8-gacha oraliqlar kesishgani sababli", 1045, 715, { size: 14, color: '#fbbf24', fam: MONO });
      text("avtomatik bitta [2026-02-01, 2026-02-08) oralig'iga birlashdi!", 1045, 745, { size: 14, color: '#86efac', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#f0fdf4', col: C.green, p: k });
      text("Multirange imkoniyati:", 1045, 830, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Xodimning ta'tillar jadvali yoki xonaning bo'sh vaqtlari kabi", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("  bir nechta uzuq-yuluq oraliqlarni bitta ustunda saqlaydi.", 1045, 915, { size: 16, color: C.ink, fam: UI });
      text("• Ustida @> va && operatorlari oddiy range kabi ishlaydi.", 1045, 945, { size: 15, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. EXCLUSION AMALDA (44.25s - 58.70s)
  function sExclusion(t) {
    heading("Exclusion Constraint: Bron Tizimi Amalda", t, TM.scenes.exclusion_amalda.s);

    const k = P(t, TM.scenes.exclusion_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Jadval yaratish
      card(80, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("1. btree_gist va EXCLUDE Yaratilishi", 505, 220, C.orange, k, 19);

      card(110, 270, 790, 250, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("CREATE EXTENSION IF NOT EXISTS btree_gist;", 135, 305, { size: 15, color: '#86efac', fam: MONO });
      text("CREATE TABLE bron (", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("    xona int,", 135, 380, { size: 16, color: '#93c5fd', fam: MONO });
      text("    davr tsrange,", 135, 415, { size: 16, color: '#fbbf24', fam: MONO });
      text("    EXCLUDE USING GIST (xona WITH =, davr WITH &&)", 135, 455, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      text(");", 135, 490, { size: 16, color: '#fff', fam: MONO });

      card(110, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Bron so'rovlari ketma-ketligi:", 135, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 600, 870, 600, { col: '#475569', w: 1.5 });
      text("1. INSERT (101, '[10:00, 12:00)')  --> INSERT 0 1 (OK)", 135, 640, { size: 15, color: '#86efac', fam: MONO });
      text("2. INSERT (102, '[11:00, 13:00)')  --> INSERT 0 1 (Boshqa xona)", 135, 680, { size: 15, color: '#86efac', fam: MONO });
      text("3. INSERT (101, '[12:00, 13:00)')  --> INSERT 0 1 (Tutashgan, OK)", 135, 720, { size: 15, color: '#86efac', fam: MONO });
      text("4. INSERT (101, '[11:30, 12:30)')  --> KESISHADI (XATO!)", 135, 755, { size: 15, weight: 700, color: '#f87171', fam: MONO });

      card(110, 790, 790, 185, { fill: '#fff7ed', col: C.orange, p: k });
      text("Muhim arxitektura sabog'i:", 135, 830, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("Ikkita so'rov parallel kelganda ilovadagi tekshiruvlar o'tkazib yuboradi.", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("Exclusion constraint esa ma'lumotlar bazasi yadrosida qulflaydi va", 135, 915, { size: 16, weight: 700, color: C.red, fam: UI });
      text("xona hech qachon bir vaqtda ikki kishiga berilmasligini kafolatlaydi.", 135, 945, { size: 15, color: C.green, fam: UI });

      // O'ng: Haqiqiy xato
      card(990, 170, 850, 840, { fill: C.card, col: C.red, p: k });
      pill("2. PostgreSQL Qaytargan Haqiqiy ERROR", 1415, 220, C.red, k, 19);

      card(1020, 270, 790, 250, { fill: '#1e293b', col: '#991b1b', p: k });
      text("-- 4-qator kiritilganda:", 1045, 305, { size: 15, color: '#f87171', fam: MONO });
      text("INSERT INTO bron VALUES", 1045, 345, { size: 16, color: '#fff', fam: MONO });
      text("  (101, '[2026-02-02 11:30:00, 2026-02-02 12:30:00)');", 1045, 385, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      sline(1045, 415, 1780, 415, { col: '#475569', w: 1 });
      text("Postgres tranzaksiyani bekor qildi va xatolik berdi:", 1045, 455, { size: 15, color: '#94a3b8', fam: MONO });

      card(1020, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("ERROR: conflicting key value violates exclusion constraint", 1045, 585, { size: 14, color: '#f87171', fam: MONO });
      text("       \"bron_xona_davr_excl\"", 1045, 615, { size: 14, color: '#f87171', fam: MONO });
      sline(1045, 635, 1780, 635, { col: '#475569', w: 1 });
      text("DETAIL: Key (xona, davr)=(101, [\"11:30:00\",\"12:30:00\"))", 1045, 670, { size: 14, color: '#fbbf24', fam: MONO });
      text("conflicts with existing key (101, [\"10:00:00\",\"12:00:00\")).", 1045, 705, { size: 14, color: '#fbbf24', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#fef2f2', col: C.red, p: k });
      text("100% ishonchli bron tizimi:", 1045, 830, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• Xona raqamlari teng (=) va vaqtlari kesishuvchi (&&) bo'lsa xato beradi.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("• Boshqa xonalar (102) esa bemalol bir vaqtda band qilinaveradi.", 1045, 915, { size: 16, color: C.ink, fam: UI });
      text("• Ushbu yechim ko'plab booking va jadval servislarining asosi hisoblanadi.", 1045, 945, { size: 15, weight: 700, color: C.green, fam: UI });
    });
  }

  // 5. DOMAIN VA COMPOSITE AMALDA (58.70s - 74.52s)
  function sDomainComposite(t) {
    heading("Domain va Composite Tip Amaliyoti", t, TM.scenes.domain_va_composite_amalda.s);

    const k = P(t, TM.scenes.domain_va_composite_amalda.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Domain amalda
      card(80, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("1. DOMAIN: Validatsiya va Cheklov", 505, 220, C.purple, k, 19);

      card(110, 270, 790, 240, { fill: '#1e293b', col: '#581c87', p: k });
      text("CREATE DOMAIN telefon_raqam AS text", 135, 305, { size: 15, color: '#c084fc', fam: MONO });
      text("    CHECK (VALUE ~ '^\\+998[0-9]{9}$');", 135, 340, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      text("CREATE TABLE tolovlar (id int, telefon telefon_raqam NOT NULL);", 135, 380, { size: 14, color: '#fff', fam: MONO });
      sline(135, 400, 870, 400, { col: '#475569', w: 1 });
      text("INSERT INTO tolovlar VALUES (1, '+998901234567');  -- OK", 135, 430, { size: 14, color: '#86efac', fam: MONO });
      text("INSERT INTO tolovlar VALUES (2, '901234567');       -- XATO!", 135, 465, { size: 14, color: '#f87171', fam: MONO });

      card(110, 535, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Haqiqiy xatolik xabari:", 135, 575, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      sline(135, 590, 870, 590, { col: '#475569', w: 1.5 });
      text("ERROR: value for domain telefon_raqam", 135, 630, { size: 15, color: '#f87171', fam: MONO });
      text("       violates check constraint \"telefon_raqam_check\"", 135, 665, { size: 15, color: '#f87171', fam: MONO });
      sline(135, 695, 870, 695, { col: '#475569', w: 1 });
      text("Regexga to'g'ri kelmagan har qanday satr darhol rad etiladi.", 135, 725, { size: 14, color: '#94a3b8', fam: MONO });

      card(110, 780, 790, 195, { fill: '#faf5ff', col: C.purple, p: k });
      text("Domen afzalligi:", 135, 820, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Telefon formati o'zgarsa, faqat ALTER DOMAIN qilinadi.", 135, 865, { size: 16, color: C.ink, fam: UI });
      text("• O'nlab jadvallardagi cheklovlarni birma-bir o'zgartirish shart emas.", 135, 905, { size: 16, color: C.ink, fam: UI });
      text("• Loyiha bo'yicha yagona ma'lumot standarti vujudga keladi.", 135, 940, { size: 15, weight: 700, color: C.purple, fam: UI });

      // O'ng: Composite amalda
      card(990, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("2. COMPOSITE: To'g'ri Murojaat va UPDATE", 1415, 220, C.blue, k, 19);

      card(1020, 270, 790, 240, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("CREATE TYPE manzil AS (shahar text, kocha text, uy int);", 1045, 305, { size: 14, color: '#93c5fd', fam: MONO });
      text("CREATE TABLE mijozlar2 (id int, ism text, manzil manzil);", 1045, 340, { size: 14, color: '#fff', fam: MONO });
      text("INSERT INTO mijozlar2 VALUES", 1045, 375, { size: 14, color: '#fff', fam: MONO });
      text("    (1, 'Ali', ROW('Toshkent', 'Navoiy', 12));", 1045, 410, { size: 14, color: '#86efac', fam: MONO });
      text("SELECT (manzil).shahar FROM mijozlar2;  -- (manzil) QAVS BILAN!", 1045, 455, { size: 14, weight: 700, color: '#fbbf24', fam: MONO });

      card(1020, 535, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Maydonni yangilash va yoyish:", 1045, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 590, 1780, 590, { col: '#475569', w: 1.5 });
      text("-- SET da qavssiz yoziladi:", 1045, 630, { size: 14, color: '#94a3b8', fam: MONO });
      text("UPDATE mijozlar2 SET manzil.uy = 14 WHERE id = 1;", 1045, 660, { size: 15, weight: 700, color: '#86efac', fam: MONO });
      text("-- Hamma maydonlarni alohida ustunlarga yoyish:", 1045, 695, { size: 14, color: '#94a3b8', fam: MONO });
      text("SELECT (manzil).* FROM mijozlar2 WHERE id = 1;", 1045, 725, { size: 15, color: '#fbbf24', fam: MONO });

      card(1020, 780, 790, 195, { fill: '#eff6ff', col: C.blue, p: k });
      text("Asosiy xulosa:", 1045, 820, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• (manzil).shahar — qavsli sintaksis jadval nomlari bilan adashishdan asraydi.", 1045, 865, { size: 15, color: C.ink, fam: UI });
      text("• UPDATE da esa oddiy nuqta bilan maydon ko'rsatiladi.", 1045, 905, { size: 15, color: C.ink, fam: UI });
      text("• (manzil).* orqali kompozit struktura to'liq SQL qatorlariga yoyiladi.", 1045, 940, { size: 15, weight: 700, color: C.blue, fam: UI });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.unnest_va_agregatsiya.s) {
      sMassivlar(t);
    } else if (t < TM.scenes.range_amalda.s) {
      sUnnest(t);
    } else if (t < TM.scenes.exclusion_amalda.s) {
      sRange(t);
    } else if (t < TM.scenes.domain_va_composite_amalda.s) {
      sExclusion(t);
    } else {
      sDomainComposite(t);
    }
  }

  window.renderFrame = function (t) {
    draw(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
