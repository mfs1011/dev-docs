// SQL 35-bob 3-qism: "Dialektlar" — PostgreSQL, MySQL, SQLite
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

  // 1. TIPLАR VА TEKSHIRUV (0s - 17.69s)
  function sTiplar(t) {
    heading("JSON Dialektlari: Tiplar va Kiritishda Tekshiruv", t, TM.scenes.tiplar_va_tekshiruv.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      const dbs = [
        {
          name: "PostgreSQL",
          tip: "jsonb (ikkilik) va json",
          col: C.blue,
          valid: "Avtomatik qat'iy tekshiruv",
          points: [
            "• jsonb binar daraxtda saqlanadi",
            "• Takror kalitlardan faqat oxirgisi qoladi",
            "• Bo'shliqlar va format tozalanadi",
            "• Noto'g'ri JSON darhol ERROR beradi"
          ],
          code: "hujjat jsonb\n-- Invalid input syntax for type json"
        },
        {
          name: "MySQL",
          tip: "JSON (mahalliy ikkilik)",
          col: C.orange,
          valid: "Avtomatik qat'iy tekshiruv",
          points: [
            "• RFC 8259 bo'yicha ikkilik format",
            "• Tahlilda kalitlar normallashtiriladi",
            "• Alohida 'aniq matn' turi yo'q",
            "• Noto'g'ri JSON: ERROR 3140"
          ],
          code: "hujjat JSON\n-- ERROR 3140: Invalid JSON text"
        },
        {
          name: "SQLite",
          tip: "Alohida tip yo'q (TEXT)",
          col: C.purple,
          valid: "Tekshiruv sukut bo'yicha YO'Q!",
          points: [
            "• typeof(hujjat) -> 'text'",
            "• Noto'g'ri JSON ham bazaga yozilib ketadi!",
            "• json_valid(hujjat) funksiyasi bor",
            "• Himoya uchun CHECK cheklovi shart"
          ],
          code: "hujjat text CHECK (json_valid(hujjat))\n-- CHECK constraint failed!"
        }
      ];

      dbs.forEach((db, i) => {
        const bx = 80 + i * 595;
        card(bx, 170, 570, 640, { fill: C.card, col: db.col, p: k });
        pill(db.name, bx + 285, 220, db.col, k, 20);
        pill(db.tip, bx + 285, 265, '#64748b', k, 15);

        card(bx + 25, 305, 520, 50, { fill: db.col === C.purple ? '#fef2f2' : '#f0fdf4', col: db.col, p: k });
        text(db.valid, bx + 285, 337, { size: 16, weight: 700, color: db.col === C.purple ? C.red : C.green, fam: UI, align: 'center' });

        db.points.forEach((pt, pi) => {
          text(pt, bx + 35, 395 + pi * 45, { size: 16, color: C.ink, fam: UI });
        });

        card(bx + 25, 595, 520, 185, { fill: '#1e293b', col: '#334155', p: k });
        db.code.split('\n').forEach((cl, ci) => {
          text(cl, bx + 45, 640 + ci * 38, { size: 14, color: ci === 0 ? '#fbbf24' : '#f87171', fam: MONO });
        });
      });

      card(80, 835, 1760, 135, { fill: '#eff6ff', col: C.blue, p: k });
      text("Muhim xavfsizlik darsi:", 115, 875, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("SQLite'da JSON ustun yaratganda doimo CHECK (json_valid(ustun)) yozing, aks holda bazaga buzilgan ma'lumot tushadi!", 115, 920, { size: 17, color: C.ink, fam: UI });
    });
  }

  // 2. OPERATORLAR VA YO'LLAR (17.69s - 31.65s)
  function sOperatorlar(t) {
    heading("Operatorlar va Yo'llar: PG vs MySQL vs SQLite", t, TM.scenes.operatorlar_va_yollar.s);

    const k = P(t, TM.scenes.operatorlar_va_yollar.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: PostgreSQL uslubi
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. PostgreSQL: Kalit Nomi va #>>", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 270, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- O'ng tomon: to'g'ridan-to'g'ri kalit nomi", 135, 310, { size: 15, color: '#93c5fd', fam: MONO });
      text("SELECT id,", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("       hujjat -> 'mijoz'                AS json_qiymat,", 135, 380, { size: 16, color: '#93c5fd', fam: MONO });
      text("       hujjat ->> 'mijoz'               AS matn,", 135, 415, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("       hujjat #>> '{mahsulotlar,0,nom}'  AS birinchi", 135, 450, { size: 16, color: '#fbbf24', fam: MONO });
      text("FROM buyurtmalar;", 135, 490, { size: 16, color: '#94a3b8', fam: MONO });

      card(110, 565, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("PostgreSQL operatorlari qoidasi:", 135, 605, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 620, 870, 620, { col: '#475569', w: 1.5 });
      text("• ->  : JSON (qo'shtirnoq bilan: \"Ali\")", 135, 660, { size: 16, color: '#93c5fd', fam: MONO });
      text("• ->> : Matn (toza satr: Ali)", 135, 700, { size: 16, color: '#86efac', fam: MONO });
      text("• #>> : Ichki massiv/obyekt yo'li '{kalit,0,nom}'", 135, 740, { size: 16, color: '#fbbf24', fam: MONO });

      card(110, 810, 790, 165, { fill: '#eff6ff', col: C.blue, p: k });
      text("Postgres afzalligi:", 135, 850, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("Oddiy satr kalitlari uchun qo'shimcha '$.' yozish shart emas.", 135, 895, { size: 16, color: C.ink, fam: UI });
      text("Yo'l ko'rsatishda esa figurali qavs ichidagi massiv ko'rinishida beriladi.", 135, 930, { size: 15, color: C.ink, fam: UI });

      // O'ng: MySQL va SQLite
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. MySQL va SQLite: JSON Yo'li ($.path)", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 270, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- MySQL: o'ng tomon doimo '$.' bilan boshlanishi SHART!", 1045, 310, { size: 15, color: '#fed7aa', fam: MONO });
      text("SELECT id,", 1045, 345, { size: 16, color: '#fff', fam: MONO });
      text("       hujjat -> '$.mijoz'               AS json_qiymat,", 1045, 380, { size: 16, color: '#fed7aa', fam: MONO });
      text("       hujjat ->> '$.mijoz'              AS matn,", 1045, 415, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("       hujjat ->> '$.mahsulotlar[0].nom' AS birinchi", 1045, 450, { size: 16, color: '#fbbf24', fam: MONO });
      text("FROM buyurtmalar;", 1045, 490, { size: 16, color: '#94a3b8', fam: MONO });

      card(1020, 565, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("SQLite imkoniyati:", 1045, 605, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 620, 1780, 620, { col: '#475569', w: 1.5 });
      text("• SQLite ikkala usulni ham tushunadi!", 1045, 660, { size: 16, color: '#86efac', fam: MONO });
      text("  hujjat ->> 'mijoz'     --> 'Ali'", 1045, 700, { size: 16, color: '#93c5fd', fam: MONO });
      text("  hujjat ->> '$.mijoz'   --> 'Ali'", 1045, 740, { size: 16, color: '#fbbf24', fam: MONO });

      card(1020, 810, 790, 165, { fill: '#fff7ed', col: C.orange, p: k });
      text("Muhim dialekt farqi:", 1045, 850, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("MySQL'da hujjat -> 'mijoz' yozsangiz xato beradi! Chunki '$.' shart.", 1045, 895, { size: 16, weight: 700, color: C.red, fam: UI });
      text("MySQL va SQLite da yo'llar massiv indeksi bilan to'g'ridan-to'g'ri yoziladi: [0].nom.", 1045, 930, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 3. MASSIVLAR VA QIDIRUV (31.65s - 48.51s)
  function sMassivlar(t) {
    heading("Massivlar va Qidiruv: Containment va Qatorlarga Yoyish", t, TM.scenes.massivlar_va_qidiruv.s);

    const k = P(t, TM.scenes.massivlar_va_qidiruv.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Qidiruv operatorlari
      card(80, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("1. Qidiruv: Containment vs JSON_CONTAINS", 505, 220, C.purple, k, 19);

      card(110, 270, 790, 250, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- 1. PostgreSQL:", 135, 305, { size: 15, color: '#93c5fd', fam: MONO });
      text("WHERE hujjat @> '{\"shahar\": \"Toshkent\"}';", 135, 335, { size: 15, color: '#fff', fam: MONO });
      text("WHERE hujjat -> 'teglar' ? 'sovga';", 135, 365, { size: 15, color: '#fbbf24', fam: MONO });
      sline(135, 385, 870, 385, { col: '#475569', w: 1 });
      text("-- 2. MySQL muqobili:", 135, 415, { size: 15, color: '#fed7aa', fam: MONO });
      text("WHERE JSON_CONTAINS(hujjat, '{\"shahar\": \"Toshkent\"}');", 135, 445, { size: 14, color: '#fff', fam: MONO });
      text("WHERE 'sovga' MEMBER OF (hujjat -> '$.teglar');", 135, 475, { size: 14, color: '#fbbf24', fam: MONO });

      card(110, 545, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Qidiruv ekvivalenti:", 135, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 600, 870, 600, { col: '#475569', w: 1.5 });
      text("Postgres: @>      <-->  MySQL: JSON_CONTAINS()", 135, 640, { size: 16, color: '#86efac', fam: MONO });
      text("Postgres: ?       <-->  MySQL: MEMBER OF", 135, 680, { size: 16, color: '#fbbf24', fam: MONO });
      text("Postgres: ? 'kalit'<-->  MySQL: JSON_CONTAINS_PATH()", 135, 720, { size: 16, color: '#93c5fd', fam: MONO });

      card(110, 780, 790, 190, { fill: '#faf5ff', col: C.purple, p: k });
      text("MEMBER OF qulayligi:", 135, 820, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• Massiv ichida skalyar qiymat qidirishda o'qilishi juda tabiiy.", 135, 865, { size: 16, color: C.ink, fam: UI });
      text("• MySQL 8.0.17+ da Multi-valued indekslar bilan to'g'ridan-to'g'ri ishlaydi.", 135, 905, { size: 16, weight: 700, color: C.purple, fam: UI });
      text("• SQLite'da esa bularning barchasi json_each orqali bajariladi.", 135, 940, { size: 15, color: C.ink, fam: UI });

      // O'ng: JSON_TABLE vs json_each
      card(990, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("2. Massivni Yoyish: JSON_TABLE vs json_each", 1415, 220, C.green, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#166534', p: k });
      text("-- PG va MySQL: JSON_TABLE standarti", 1045, 305, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT b.id, jt.* FROM buyurtmalar b,", 1045, 335, { size: 15, color: '#fff', fam: MONO });
      text("     JSON_TABLE(b.hujjat, '$.mahsulotlar[*]' COLUMNS (", 1045, 365, { size: 15, color: '#86efac', fam: MONO });
      text("       nom text PATH '$.nom', soni int PATH '$.soni'", 1045, 395, { size: 15, color: '#fbbf24', fam: MONO });
      text("     )) AS jt;", 1045, 425, { size: 15, color: '#86efac', fam: MONO });
      sline(1045, 445, 1780, 445, { col: '#475569', w: 1 });
      text("-- SQLite muqobili: json_each jadval funksiyasi", 1045, 475, { size: 15, color: '#93c5fd', fam: MONO });
      text("SELECT b.id, m.value ->> 'nom' AS nom", 1045, 505, { size: 15, color: '#fff', fam: MONO });
      text("FROM buyurtmalar b, json_each(b.hujjat, '$.mahsulotlar') m;", 1045, 535, { size: 14, color: '#93c5fd', fam: MONO });

      card(1020, 555, 790, 200, { fill: '#0f172a', col: '#334155', p: k });
      text("Ikkalasida ham olingan natija bir xil:", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text("id |  nom   | soni | narx", 1045, 645, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text(" 1 | Daftar |    2 | 12000", 1045, 680, { size: 16, color: '#86efac', fam: MONO });
      text(" 1 | Ruchka |    5 |  3000", 1045, 715, { size: 16, color: '#86efac', fam: MONO });

      card(1020, 780, 790, 190, { fill: '#f0fdf4', col: C.green, p: k });
      text("SQLite json_each xususiyati:", 1045, 820, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• JSON_TABLE kabi ustunlarni avtomat o'girmaydi, 'value' beradi.", 1045, 865, { size: 16, color: C.ink, fam: UI });
      text("• m.value ustida yana ->> ishlatib kerakli maydonlar olinadi.", 1045, 905, { size: 16, color: C.ink, fam: UI });
      text("• Chuqur daraxtlar uchun json_tree() rekursiv funksiyasi bor.", 1045, 940, { size: 15, weight: 700, color: C.blue, fam: UI });
    });
  }

  // 4. INDEKSLASH (48.51s - 71.28s)
  function sIndekslash(t) {
    heading("Indekslash: GIN, Generated Column va Ifoda Indeksi", t, TM.scenes.indekslash.s);

    const k = P(t, TM.scenes.indekslash.s + 0.3, 0.8);
    withA(k, () => {
      const items = [
        {
          name: "PostgreSQL: GIN",
          col: C.blue,
          code: "CREATE INDEX buyurtmalar_gin\nON buyurtmalar USING GIN (hujjat);\n\n-- @> va ? operatorlari bilan ishlaydi\n-- ->> uchun ifoda indeksi zarur:\nCREATE INDEX ON t ((hujjat ->> 'k'));",
          expl: [
            "• Butun hujjatni bitta indeksga oladi",
            "• Kalitlar va qiymatlar to'liq indekslanadi",
            "• ->> da ishlamasligi asosiy tuzoqdir!"
          ]
        },
        {
          name: "MySQL: Generated & Multi-Valued",
          col: C.orange,
          code: "-- 1. Skalyar qiymat (shahar):\nALTER TABLE t ADD shahar VARCHAR(30)\n  AS (hujjat ->> '$.shahar') VIRTUAL,\n  ADD INDEX (shahar);\n\n-- 2. Massiv (teglar):\nALTER TABLE t ADD INDEX teglar_idx\n  ((CAST(hujjat->'$.teglar' AS CHAR(20) ARRAY)));",
          expl: [
            "• JSON ustuniga to'g'ridan-to'g'ri indeks YO'Q (xato 3152)",
            "• Skalyar uchun VIRTUAL ustun yaratiladi",
            "• Massiv uchun Multi-Valued indeks (N:1) shart"
          ]
        },
        {
          name: "SQLite: Ifoda Indeksi",
          col: C.green,
          code: "-- To'g'ridan-to'g'ri ifoda indeksi:\nCREATE INDEX shahar_idx\nON buyurtmalar (hujjat ->> '$.shahar');\n\n-- EXPLAIN QUERY PLAN natijasi:\n-- SEARCH buyurtmalar USING INDEX shahar_idx",
          expl: [
            "• SQLite'da ifoda indeksi juda oson ishlaydi",
            "• ->> natijasi to'g'ridan-to'g'ri B-tree ga tushadi",
            "• Qo'shimcha virtual ustunlar talab qilinmaydi"
          ]
        }
      ];

      items.forEach((item, i) => {
        const bx = 80 + i * 595;
        card(bx, 170, 570, 840, { fill: C.card, col: item.col, p: k });
        pill(item.name, bx + 285, 220, item.col, k, 19);

        card(bx + 25, 270, 520, 310, { fill: '#1e293b', col: '#334155', p: k });
        item.code.split('\n').forEach((cl, ci) => {
          text(cl, bx + 45, 305 + ci * 28, { size: 13, color: cl.startsWith('--') ? '#94a3b8' : (cl.includes('INDEX') ? '#fbbf24' : '#fff'), fam: MONO });
        });

        card(bx + 25, 605, 520, 205, { fill: '#f8fafc', col: item.col, p: k });
        text("Mexanizm xususiyati:", bx + 45, 645, { size: 18, weight: 700, color: item.col, fam: UI });
        item.expl.forEach((e, ei) => {
          text(e, bx + 45, 690 + ei * 40, { size: 15, color: C.ink, fam: UI });
        });

        card(bx + 25, 830, 520, 150, { fill: '#eff6ff', col: C.blue, p: k });
        text("Muhim xulosa:", bx + 45, 870, { size: 17, weight: 700, color: C.blue, fam: UI });
        if (i === 0) text("PG da tez-tez qidiriladigan skalyar kalitlar uchun alohida ifoda indeksi quring.", bx + 45, 910, { size: 14, color: C.ink, fam: UI });
        if (i === 1) text("MySQL da massiv qidiruvida Multi-Valued indeks 10-100 baravar tezlatadi.", bx + 45, 910, { size: 14, color: C.ink, fam: UI });
        if (i === 2) text("SQLite da ifoda indeksi kabi sodda va samarali yechim yetarli bo'ladi.", bx + 45, 910, { size: 14, color: C.ink, fam: UI });
      });
    });
  }

  // 5. SOLISHTIRMA MATRITSA VA XULOSA (71.28s - 90.54s)
  function sSolishtirma(t) {
    heading("Dialektlar Solishtirma Matritsasi va Xulosa", t, TM.scenes.solishtirma_xulosa.s);

    const k = P(t, TM.scenes.solishtirma_xulosa.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Solishtirma jadval
      card(80, 170, 1150, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Asosiy Xususiyatlar Solishtirmasi", 655, 220, C.blue, k, 19);

      const headers = ["Xususiyat", "PostgreSQL", "MySQL", "SQLite"];
      const rows = [
        ["Ma'lumot tipi", "jsonb (ikkilik) / json", "JSON (ikkilik)", "text (alohida tip yo'q)"],
        ["Kiritishda nazorat", "Avtomatik qat'iy", "Avtomatik qat'iy", "CHECK (json_valid)"],
        ["Takroriy kalitlar", "jsonb: oxirgisi qoladi", "Oxirgisi qoladi", "Barchasi saqlanadi"],
        ["Operator yo'li", "-> 'kalit', #>> '{yo'l}'", "-> '$.kalit' ($. shart)", "-> 'kalit' yoki '$.kalit'"],
        ["Containment", "@> operatori", "JSON_CONTAINS()", "json_each() orqali"],
        ["Massivda element", "? operatori", "MEMBER OF", "json_each() orqali"],
        ["Massiv -> Qator", "JSON_TABLE", "JSON_TABLE", "json_each() jadval funksiyasi"],
        ["Indekslash", "GIN indeksi, Ifoda", "Generated, Multi-valued", "Ifoda indeksi (B-tree)"],
        ["JSON5 o'qish", "Yo'q", "Yo'q", "Ha (3.42+ trailing comma)"]
      ];

      card(110, 265, 1090, 525, { fill: '#1e293b', col: '#334155', p: k });
      headers.forEach((h, hi) => {
        const hx = hi === 0 ? 135 : (hi === 1 ? 390 : (hi === 2 ? 650 : 890));
        text(h, hx, 305, { size: 16, weight: 700, color: '#fbbf24', fam: UI });
      });
      sline(130, 325, 1170, 325, { col: '#475569', w: 1.5 });

      rows.forEach((r, ri) => {
        const ry = 360 + ri * 45;
        text(r[0], 135, ry, { size: 14, weight: 600, color: '#e2e8f0', fam: UI });
        text(r[1], 390, ry, { size: 13, color: '#93c5fd', fam: MONO });
        text(r[2], 650, ry, { size: 13, color: '#fed7aa', fam: MONO });
        text(r[3], 890, ry, { size: 13, color: '#86efac', fam: MONO });
        if (ri < rows.length - 1) sline(130, ry + 15, 1170, ry + 15, { col: '#334155', w: 1 });
      });

      card(110, 810, 1090, 165, { fill: '#eff6ff', col: C.blue, p: k });
      text("Eng muhim eslatma:", 135, 850, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• SQLite 3.42+ JSON5 dagi oxirgi vergulni (trailing comma) bemalol o'qiy oladi.", 135, 890, { size: 15, color: C.ink, fam: UI });
      text("• Ammo SQLite'ning 'jsonb' funksiyalari PostgreSQL bilan mutlaqo mos emas (mos kelmaydi)!", 135, 930, { size: 15, weight: 700, color: C.red, fam: UI });

      // O'ng: Amaliy tavsiyalar
      card(1260, 170, 580, 840, { fill: C.card, col: C.green, p: k });
      pill("2. Arxitektura Qoidalari", 1550, 220, C.green, k, 19);

      const tips = [
        {
          t: "1. Doimo Gibrid Loyihalang",
          d: "Qidiriladigan, guruhlanadigan va cheklov qo'yiladigan maydonlarni oddiy SQL ustunlari qiling. Faqat o'zgaruvchan atributlarni JSONda saqlang."
        },
        {
          t: "2. Matn emas, ->> ishlating",
          d: "Taqqoslashlarda -> o'rniga doimo ->> (toza matn) ishlating, sonlar bilan solishtirishda esa darhol ::int yoki JSON_VALUE orqali tipga o'giring."
        },
        {
          t: "3. SQLite'da CHECK unutmang",
          d: "SQLite'da CHECK (json_valid(ustun)) qo'yish orqali xato JSON saqlanishining oldini oling."
        },
        {
          t: "4. Portativlik Sharti",
          d: "Tizimlar o'rtasida ma'lumot almashishda binar jsonb emas, standart JSON matnidan foydalaning."
        }
      ];

      tips.forEach((tip, ti) => {
        const ty = 280 + ti * 175;
        card(1285, ty, 530, 155, { fill: '#f0fdf4', col: C.green, p: k });
        text(tip.t, 1310, ty + 35, { size: 18, weight: 700, color: C.green, fam: UI });
        text(tip.d, 1310, ty + 70, { size: 14, color: C.ink, fam: UI, maxW: 480 });
      });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.operatorlar_va_yollar.s) {
      sTiplar(t);
    } else if (t < TM.scenes.massivlar_va_qidiruv.s) {
      sOperatorlar(t);
    } else if (t < TM.scenes.indekslash.s) {
      sMassivlar(t);
    } else if (t < TM.scenes.solishtirma_xulosa.s) {
      sIndekslash(t);
    } else {
      sSolishtirma(t);
    }
  }

  window.renderFrame = function (t) {
    draw(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
