// SQL 36-bob 3-qism: "Dialektlar" — PostgreSQL, MySQL, SQLite solishtirmasi
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

  // 1. KIRISH (0s - 15.23s)
  function sIntro(t) {
    heading("SQL Dialektlar: PG Maxsus Tiplari Muqobillari", t, TM.scenes.dialektlar_kirish.s);

    const k = P(t, 0.4, 0.8);
    withA(k, () => {
      const dbs = [
        {
          name: "PostgreSQL",
          sub: "To'liq Mahalliy Qo'llab-quvvatlash",
          col: C.blue,
          points: [
            "• tip[] massivlari va GIN indeksi",
            "• daterange, tsrange va multirange",
            "• EXCLUDE USING GIST cheklovi",
            "• CREATE DOMAIN (qayta ishlatiluvchi CHECK)",
            "• CREATE TYPE ... AS (...) kompozit"
          ]
        },
        {
          name: "MySQL",
          sub: "Ekvivalenti Yo'q (Muqobil Yechimlar)",
          col: C.orange,
          points: [
            "• Massiv yo'q -> JSON massiv (MEMBER OF)",
            "• Range yo'q -> 2 ustun (boshi, oxiri)",
            "• Exclusion yo'q -> Dasturiy qulf / tranzaksiya",
            "• Domain yo'q -> Har bir ustunda CHECK",
            "• Composite yo'q -> Oddiy ustunlar"
          ]
        },
        {
          name: "SQLite",
          sub: "Tip Affinity va Oddiy Matn",
          col: C.purple,
          points: [
            "• Massiv yo'q -> JSON massiv (json_each)",
            "• text[] xato bermaydi, lekin oddiy TEXT!",
            "• Range yo'q -> 2 ustun (boshi, oxiri)",
            "• Domain yo'q -> CHECK cheklovi",
            "• Composite yo'q -> Alohida jadval"
          ]
        }
      ];

      dbs.forEach((db, i) => {
        const bx = 80 + i * 595;
        card(bx, 170, 570, 640, { fill: C.card, col: db.col, p: k });
        pill(db.name, bx + 285, 220, db.col, k, 20);
        pill(db.sub, bx + 285, 265, '#64748b', k, 15);

        db.points.forEach((pt, pi) => {
          text(pt, bx + 35, 335 + pi * 55, { size: 17, color: C.ink, fam: UI });
        });
      });

      card(80, 835, 1760, 135, { fill: '#eff6ff', col: C.blue, p: k });
      text("Asosiy xulosa:", 115, 875, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("Agar loyihani boshqa ma'lumotlar bazalariga ko'chirish (portativlik) zarur bo'lsa, relyatsion loyihalash eng to'g'ri yo'ldir!", 115, 920, { size: 17, color: C.ink, fam: UI });
    });
  }

  // 2. MYSQL MUQOBILLARI (15.23s - 30.29s)
  function sMysql(t) {
    heading("MySQL Muqobillari: JSON Massiv va Cheklovlar", t, TM.scenes.mysql_muqobillari.s);

    const k = P(t, TM.scenes.mysql_muqobillari.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: JSON massiv
      card(80, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("1. Massiv O'rniga JSON Massiv (MySQL)", 505, 220, C.orange, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- 1. JSON massiv ustuni va tekshiruv:", 135, 305, { size: 15, color: '#fed7aa', fam: MONO });
      text("CREATE TABLE a2 (", 135, 340, { size: 16, color: '#fff', fam: MONO });
      text("    id int PRIMARY KEY,", 135, 375, { size: 16, color: '#fff', fam: MONO });
      text("    teglar JSON,", 135, 410, { size: 16, color: '#fbbf24', fam: MONO });
      text("    CHECK (JSON_TYPE(teglar) = 'ARRAY')", 135, 445, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text(");", 135, 480, { size: 16, color: '#fff', fam: MONO });

      card(110, 555, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Qidiruv: MEMBER OF operatori", 135, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text("INSERT INTO a2 VALUES (1, '[\"sql\",\"postgres\"]');", 135, 650, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT id FROM a2 WHERE 'postgres' MEMBER OF (teglar);", 135, 690, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      text("--> Natija: id = 1", 135, 725, { size: 15, color: '#86efac', fam: MONO });

      card(110, 800, 790, 175, { fill: '#fff7ed', col: C.orange, p: k });
      text("Indekslash imkoniyati:", 135, 840, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("• MySQL 8.0.17 dan boshlab Multi-valued indekslar mavjud.", 135, 885, { size: 16, color: C.ink, fam: UI });
      text("• CAST(teglar AS CHAR(20) ARRAY) orqali massiv indekslanadi.", 135, 925, { size: 16, color: C.ink, fam: UI });
      text("• Oddiy ustunga massiv yozish xato beradi (ERROR 1064).", 135, 955, { size: 15, color: C.red, fam: UI });

      // O'ng: Range va Domain
      card(990, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("2. Range va Domain Muqobillari", 1415, 220, C.blue, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- Oraliq: 2 ta alohida ustun saqlash:", 1045, 305, { size: 15, color: '#93c5fd', fam: MONO });
      text("CREATE TABLE bron (", 1045, 340, { size: 16, color: '#fff', fam: MONO });
      text("    xona int,", 1045, 375, { size: 16, color: '#fff', fam: MONO });
      text("    boshlanish datetime NOT NULL,", 1045, 410, { size: 16, color: '#86efac', fam: MONO });
      text("    tugash     datetime NOT NULL,", 1045, 445, { size: 16, color: '#fbbf24', fam: MONO });
      text("    CHECK (boshlanish < tugash)", 1045, 480, { size: 16, color: '#93c5fd', fam: MONO });
      text(");", 1045, 510, { size: 16, color: '#fff', fam: MONO });

      card(1020, 555, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Kesishmaslik sharti (SELECT bilan):", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text("WHERE xona = :xona", 1045, 645, { size: 15, color: '#fff', fam: MONO });
      text("  AND :yangi_boshi < tugash", 1045, 680, { size: 15, color: '#fbbf24', fam: MONO });
      text("  AND boshlanish < :yangi_oxiri;", 1045, 715, { size: 15, color: '#fbbf24', fam: MONO });
      text("Diqqat: Parallel so'rovlarda FOR UPDATE qulflash shart!", 1045, 745, { size: 14, color: '#f87171', fam: MONO });

      card(1020, 800, 790, 175, { fill: '#eff6ff', col: C.blue, p: k });
      text("Domain muqobili:", 1045, 840, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• MySQL'da CREATE DOMAIN yo'q (ERROR 1064).", 1045, 885, { size: 16, color: C.red, fam: UI });
      text("• Har bir jadval ustuniga alohida CHECK qo'yiladi.", 1045, 925, { size: 16, color: C.ink, fam: UI });
      text("• Qoidani o'zgartirish har bir jadvalda alohida bajariladi.", 1045, 955, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 3. SQLITE NOZIKLIKLARI (30.29s - 44.23s)
  function sSqlite(t) {
    heading("SQLite: text[] Tuzog'i va Affinity Qoidasi", t, TM.scenes.sqlite_nozikliklari.s);

    const k = P(t, TM.scenes.sqlite_nozikliklari.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Katta tuzoq
      card(80, 170, 850, 840, { fill: C.card, col: C.red, p: k });
      pill("1. text[] Tuzog'i: Xatosiz Lekin Massiv Emas!", 505, 220, C.red, k, 19);

      card(110, 270, 790, 240, { fill: '#1e293b', col: '#991b1b', p: k });
      text("-- SQLite bu so'rovni bemalol qabul qiladi:", 135, 305, { size: 15, color: '#f87171', fam: MONO });
      text("CREATE TABLE a1 (teglar text[]);", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("INSERT INTO a1 VALUES ('{a,b}');", 135, 385, { size: 16, color: '#86efac', fam: MONO });
      sline(135, 410, 870, 410, { col: '#475569', w: 1 });
      text("SELECT teglar, typeof(teglar) FROM a1;", 135, 445, { size: 15, color: '#fbbf24', fam: MONO });

      card(110, 535, 790, 230, { fill: '#0f172a', col: '#334155', p: k });
      text("SQLite natijasi (Haqiqiy TTY):", 135, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 590, 870, 590, { col: '#475569', w: 1.5 });
      text("teglar | typeof(teglar)", 135, 630, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      text("{a,b}  | text", 135, 670, { size: 16, color: '#86efac', fam: MONO });
      sline(135, 700, 870, 700, { col: '#475569', w: 1 });
      text("Diqqat: teglar[1] ishlamaydi! ANY va @> ishlamaydi!", 135, 735, { size: 15, weight: 700, color: '#f87171', fam: MONO });

      card(110, 790, 790, 185, { fill: '#fef2f2', col: C.red, p: k });
      text("Nega bunday bo'ldi?", 135, 830, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• SQLite Type Affinity qoidasi bo'yicha tip nomida 'TEXT' so'zi", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("  qatnashsa (hatto text[] bo'lsa ham), ustunni oddiy TEXT deb oladi.", 135, 915, { size: 16, color: C.ink, fam: UI });
      text("• Bu massiv emas, shunchaki '{a,b}' degan oddiy satr!", 135, 945, { size: 15, weight: 700, color: C.red, fam: UI });

      // O'ng: SQLite'dagi to'g'ri yo'l
      card(990, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("2. SQLite'dagi To'g'ri Yechimlar", 1415, 220, C.purple, k, 19);

      card(1020, 270, 790, 250, { fill: '#1e293b', col: '#581c87', p: k });
      text("-- 1-yechim: JSON massiv ishlatish (35-bob):", 1045, 305, { size: 15, color: '#c084fc', fam: MONO });
      text("CREATE TABLE a2 (teglar text CHECK(json_valid(teglar)));", 1045, 340, { size: 14, color: '#fff', fam: MONO });
      text("INSERT INTO a2 VALUES ('[\"a\",\"b\"]');", 1045, 375, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT m.value FROM a2, json_each(a2.teglar) m;", 1045, 415, { size: 15, color: '#fbbf24', fam: MONO });
      sline(1045, 435, 1780, 435, { col: '#475569', w: 1 });
      text("-- 2-yechim: Alohida relyatsion jadval:", 1045, 465, { size: 15, color: '#c084fc', fam: MONO });
      text("CREATE TABLE maqola_teglari (maqola_id int, teg text);", 1045, 495, { size: 14, color: '#fff', fam: MONO });

      card(1020, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("Range, Domain va Composite SQLite'da:", 1045, 585, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 600, 1780, 600, { col: '#475569', w: 1.5 });
      text("• CREATE DOMAIN -> Parse error near 'DOMAIN'!", 1045, 640, { size: 15, color: '#f87171', fam: MONO });
      text("• CREATE TYPE   -> Parse error near 'TYPE'!", 1045, 680, { size: 15, color: '#f87171', fam: MONO });
      text("• EXCLUDE       -> Exclusion constraint mavjud emas.", 1045, 720, { size: 15, color: '#93c5fd', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#faf5ff', col: C.purple, p: k });
      text("SQLite xulosasi:", 1045, 830, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• SQLite minimalistik tizim bo'lib, faqat 5 ta asosiy tipga ega.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("• Murakkab ma'lumotlar uchun doimo alohida relyatsion jadvallar quring.", 1045, 915, { size: 16, weight: 700, color: C.green, fam: UI });
      text("• Yoki JSON funksiyalaridan foydalaning.", 1045, 945, { size: 15, color: C.blue, fam: UI });
    });
  }

  // 4. SOLISHTIRMA JADVAL (44.23s - 58.85s)
  function sSolishtirma(t) {
    heading("Dialektlar Solishtirma Matritsasi", t, TM.scenes.solishtirma_jadval.s);

    const k = P(t, TM.scenes.solishtirma_jadval.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Matritsa
      card(80, 170, 1150, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Asosiy Imkoniyatlar Matritsasi", 655, 220, C.blue, k, 19);

      const headers = ["Xususiyat", "PostgreSQL", "MySQL", "SQLite"];
      const rows = [
        ["Massiv turi", "tip[] (1-indexed)", "Yo'q (JSON massiv)", "Yo'q (text[] — oddiy TEXT!)"],
        ["Massiv qidiruvi", "ANY, @>, &&", "MEMBER OF", "json_each() orqali"],
        ["Massiv -> Qator", "unnest()", "JSON_TABLE()", "json_each()"],
        ["Qator -> Massiv", "array_agg()", "JSON_ARRAYAGG()", "json_group_array()"],
        ["Range / Oraliq", "daterange, tsrange", "Yo'q (2 ta ustun)", "Yo'q (2 ta ustun)"],
        ["Multirange", "Ha (PG 14+)", "Yo'q", "Yo'q"],
        ["Kesishmaslik cheklovi", "EXCLUDE USING GIST", "Yo'q (dasturda qulf)", "Yo'q (tranzaksiya)"],
        ["Domen (Domain)", "CREATE DOMAIN", "Yo'q (ustunda CHECK)", "Yo'q (CHECK)"],
        ["Kompozit (Composite)", "CREATE TYPE ... AS", "Yo'q", "Yo'q"]
      ];

      card(110, 265, 1090, 525, { fill: '#1e293b', col: '#334155', p: k });
      headers.forEach((h, hi) => {
        const hx = hi === 0 ? 135 : (hi === 1 ? 380 : (hi === 2 ? 650 : 890));
        text(h, hx, 305, { size: 16, weight: 700, color: '#fbbf24', fam: UI });
      });
      sline(130, 325, 1170, 325, { col: '#475569', w: 1.5 });

      rows.forEach((r, ri) => {
        const ry = 360 + ri * 45;
        text(r[0], 135, ry, { size: 14, weight: 600, color: '#e2e8f0', fam: UI });
        text(r[1], 380, ry, { size: 13, color: '#93c5fd', fam: MONO });
        text(r[2], 650, ry, { size: 13, color: '#fed7aa', fam: MONO });
        text(r[3], 890, ry, { size: 13, color: '#86efac', fam: MONO });
        if (ri < rows.length - 1) sline(130, ry + 15, 1170, ry + 15, { col: '#334155', w: 1 });
      });

      card(110, 810, 1090, 165, { fill: '#eff6ff', col: C.blue, p: k });
      text("Exclusion constraint ustunligi:", 135, 850, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• Faqat PostgreSQL oraliqlarning kesishmasligini DB darajasida kafolatlaydi.", 135, 890, { size: 15, color: C.ink, fam: UI });
      text("• MySQL va SQLite da bu qoida dasturchi yozgan SELECT + qulf orqali bajariladi.", 135, 930, { size: 15, color: C.ink, fam: UI });

      // O'ng: Tezkor xulosa
      card(1260, 170, 580, 840, { fill: C.card, col: C.green, p: k });
      pill("2. Tizim Tanlash Maslahati", 1550, 220, C.green, k, 19);

      const items = [
        {
          t: "Qachon PostgreSQL?",
          d: "Bron tizimlari, vaqt oraliqlari (range), murakkab domenli moliyaviy tizimlar va geofazoviy tahlillarda PostgreSQL tengsizdir."
        },
        {
          t: "Qachon MySQL & SQLite?",
          d: "Standart relyatsion modellar, veb ilovalar va mikroservislarda. Har qanday murakkab tiplarni alohida jadvallar bilan hal qiling."
        },
        {
          t: "Portativ Kod Yozish",
          d: "Loyiha bir bazadan ikkinchisiga ko'chishi mumkin bo'lsa, massiv yoki composite emas, standart relyatsion jadvallardan foydalaning."
        }
      ];

      items.forEach((it, idx) => {
        const iy = 280 + idx * 230;
        card(1285, iy, 530, 205, { fill: '#f0fdf4', col: C.green, p: k });
        text(it.t, 1310, iy + 45, { size: 20, weight: 700, color: C.green, fam: UI });
        text(it.d, 1310, iy + 90, { size: 15, color: C.ink, fam: UI, maxW: 480 });
      });
    });
  }

  // 5. LOYIHALASH VA XULOSALAR (58.85s - 76.62s)
  function sXulosa(t) {
    heading("Arxitektura va Portativlik Xulosasi", t, TM.scenes.loyihalash_va_xulosalar.s);

    const k = P(t, TM.scenes.loyihalash_va_xulosalar.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Oltin me'yorlar
      card(80, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("1. Ma'lumotlar Bazasi Arxitekturasi Qoidalari", 505, 220, C.green, k, 19);

      const rules = [
        {
          n: "1. Massiv o'rniga alohida jadval quring",
          d: "Teglar, rollar, kategoriyalar uchun alohida jadval (many-to-many) quring. Bu tashqi kalit, indeks va hisobotlarni ancha osonlashtiradi."
        },
        {
          n: "2. [boshi, oxiri) yarim ochiq chegaradan foydalaning",
          d: "Ketma-ket sanalar va vaqt oraliqlari tutashgan joyda to'qnashmasligi uchun doimo oxirgi chegara kirmaydigan qilib saqlang."
        },
        {
          n: "3. NOT NULL ni ustunga qo'ying",
          d: "Domen yaratganda cheklovni NULL ruxsat beradigan qiling, NOT NULL talabini esa bevosita jadval ustuniga yozing."
        },
        {
          n: "4. Composite o'rniga oddiy ustunlar",
          d: "Manzil uchun composite tip emas, oddiy shahar, kocha, uy ustunlarini ochish so'rov va indekslar uchun ancha qulay."
        }
      ];

      rules.forEach((r, ri) => {
        const ry = 280 + ri * 175;
        card(110, ry, 790, 155, { fill: '#f0fdf4', col: C.green, p: k });
        text(r.n, 135, ry + 40, { size: 18, weight: 700, color: C.green, fam: UI });
        text(r.d, 135, ry + 78, { size: 15, color: C.ink, fam: UI, maxW: 740 });
      });

      // O'ng: Tipik xatolar
      card(990, 170, 850, 840, { fill: C.card, col: C.red, p: k });
      pill("2. Tipik Xatolar va Ehtiyot Choralari", 1415, 220, C.red, k, 19);

      const traps = [
        {
          w: "Massiv indeksini 0 dan boshlash",
          f: "PG massivlari 1 dan boshlanadi, [0] esa NULL qaytaradi! (JSON massivlari esa 0 dan boshlanadi)."
        },
        {
          w: "text[3] o'lchamni cheklaydi deb o'ylash",
          f: "Postgres e'lon qilingan o'lchamni tekshirmaydi. Cheklov uchun CHECK (cardinality(x) <= 3) shart."
        },
        {
          w: "SQLite'da text[] ni massiv deb bilish",
          f: "SQLite uni oddiy TEXT deb oladi, indeks bo'yicha qidiruv ishlamaydi. JSON yoki jadval ishlating."
        },
        {
          w: "Kesishmaslikni faqat kodda tekshirish",
          f: "Parallel bron kelganda ikkala so'rov ham o'tib ketadi. PG da EXCLUDE USING GIST ishlating."
        }
      ];

      traps.forEach((tp, ti) => {
        const ty = 280 + ti * 175;
        card(1020, ty, 790, 155, { fill: '#fef2f2', col: C.red, p: k });
        text("Xato: " + tp.w, 1045, ty + 40, { size: 18, weight: 700, color: C.red, fam: UI });
        text("Sabab: " + tp.f, 1045, ty + 78, { size: 15, color: C.ink, fam: UI, maxW: 740 });
      });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.mysql_muqobillari.s) {
      sIntro(t);
    } else if (t < TM.scenes.sqlite_nozikliklari.s) {
      sMysql(t);
    } else if (t < TM.scenes.solishtirma_jadval.s) {
      sSqlite(t);
    } else if (t < TM.scenes.loyihalash_va_xulosalar.s) {
      sSolishtirma(t);
    } else {
      sXulosa(t);
    }
  }

  window.renderFrame = function (t) {
    draw(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
