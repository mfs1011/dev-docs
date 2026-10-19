// SQL 36-bob 1-qism: "Tushuncha" — Massiv, range, domain va composite
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

  // 1. KIRISH (0s - 17.58s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("36-bob. Massiv, Range, Domain va Composite", 960, 160, { size: 52, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL Maxsus Kuchaytirish Tiplari", 960, 255, { size: 74, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Massivlar, oraliqlar, exclusion cheklovi, domenlar va kompozit turlar arxitekturasi", 960, 345, { size: 29, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('l1', 'Postgres'), 0.8);
    withA(kCards, () => {
      const items = [
        {
          name: "Massiv (Array)",
          tag: "text[], integer[]",
          col: C.blue,
          points: [
            "• Indekslar 1 dan boshlanadi",
            "• ANY, @>, && qidiruvlari",
            "• unnest bilan qatorlarga",
            "• O'lcham cheklanmaydi"
          ]
        },
        {
          name: "Range (Oraliq)",
          tag: "daterange, tsrange",
          col: C.green,
          points: [
            "• [boshi, oxiri) kanonik shakl",
            "• @> ichidami, && kesishadimi",
            "• multirange birlashmasi",
            "• Vaqt oraliqlari uchun qulay"
          ]
        },
        {
          name: "Exclusion (GIST)",
          tag: "Kesishmaslik cheklovi",
          col: C.orange,
          points: [
            "• UNIQUE oraliqqa yetarli emas",
            "• EXCLUDE USING GIST",
            "• Bronlarni DB darajasida himoyalash",
            "• Poyga holatlarini yo'qotish"
          ]
        },
        {
          name: "Domain & Composite",
          tag: "Domen va Kompozit",
          col: C.purple,
          points: [
            "• Domain: Tip + global CHECK",
            "• Composite: Qator tipi (ROW)",
            "• (manzil).shahar qavsli murojaat",
            "• Qayta ishlatiluvchi qoidalar"
          ]
        }
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

  // 2. MASSIVLAR (17.58s - 33.56s)
  function sMassivlar(t) {
    heading("Massivlar: Indekslash va Loyihalash Qoidalari", t, TM.scenes.massivlar.s);

    const k = P(t, TM.scenes.massivlar.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Indekslar va o'lcham
      card(80, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("1. Massiv E'loni va Indekslar (1-indexed)", 505, 220, C.blue, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("CREATE TABLE maqolalar (", 135, 305, { size: 16, color: '#93c5fd', fam: MONO });
      text("    id       int PRIMARY KEY,", 135, 340, { size: 16, color: '#fff', fam: MONO });
      text("    sarlavha text,", 135, 375, { size: 16, color: '#fff', fam: MONO });
      text("    teglar   text[],", 135, 410, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });
      text("    baholar  int[]", 135, 445, { size: 16, color: '#86efac', fam: MONO });
      text(");", 135, 480, { size: 16, color: '#93c5fd', fam: MONO });

      card(110, 555, 790, 230, { fill: '#0f172a', col: '#334155', p: k });
      text("Muhim indekslash qoidasi:", 135, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text("• teglar[1]  -> 'sql'     (Birinchi element 1 dan boshlanadi!)", 135, 650, { size: 16, color: '#86efac', fam: MONO });
      text("• teglar[0]  -> NULL      (0-indeks sukut bo'yicha bo'sh)", 135, 690, { size: 16, color: '#f87171', fam: MONO });
      text("• teglar[10] -> NULL      (Chegaradan oshsa xato emas, NULL)", 135, 730, { size: 16, color: '#93c5fd', fam: MONO });
      text("• cardinality(teglar)     -> elementlar soni", 135, 765, { size: 15, color: '#fbbf24', fam: MONO });

      card(110, 810, 790, 165, { fill: '#eff6ff', col: C.blue, p: k });
      text("O'lcham aldovi:", 135, 850, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("Ustunni text[3] yoki text[][] deb e'lon qilsangiz ham, Postgres uni cheklamaydi!", 135, 895, { size: 16, weight: 700, color: C.red, fam: UI });
      text("Cheklash faqat CHECK (cardinality(teglar) <= 3) orqali amalga oshiriladi.", 135, 930, { size: 15, color: C.ink, fam: UI });

      // O'ng: Hujjat ogohlantirishi va qidiruv
      card(990, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("2. Qidiruv va Hujjat Ogohlantirishi", 1415, 220, C.orange, k, 19);

      card(1020, 270, 790, 240, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("-- 1. Element borligini tekshirish:", 1045, 305, { size: 15, color: '#fed7aa', fam: MONO });
      text("WHERE 'postgres' = ANY (teglar);", 1045, 335, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      sline(1045, 355, 1780, 355, { col: '#475569', w: 1 });
      text("-- 2. O'z ichiga olish (containment):", 1045, 385, { size: 15, color: '#fed7aa', fam: MONO });
      text("WHERE teglar @> ARRAY['json','mysql'];", 1045, 415, { size: 16, color: '#fbbf24', fam: MONO });
      sline(1045, 435, 1780, 435, { col: '#475569', w: 1 });
      text("-- 3. Kesishish (overlap):", 1045, 465, { size: 15, color: '#fed7aa', fam: MONO });
      text("WHERE teglar && ARRAY['sql','mysql'];", 1045, 495, { size: 16, color: '#93c5fd', fam: MONO });

      card(1020, 535, 790, 245, { fill: '#fff7ed', col: C.orange, p: k });
      text("PostgreSQL rasmiy hujjatidan jiddiy ogohlantirish:", 1045, 575, { size: 20, weight: 700, color: C.orange, fam: UI });
      text("«Massivlar to'plam emas; massiv ichidan muayyan elementlarni", 1045, 620, { size: 16, color: C.ink, fam: UI });
      text("qidirish ma'lumotlar bazasi noto'g'ri loyihalanganining belgisi bo'lishi", 1045, 655, { size: 16, color: C.ink, fam: UI });
      text("mumkin. Alohida jadval (maqola_teglari) ko'rib chiqing!»", 1045, 690, { size: 16, weight: 700, color: C.red, fam: UI });
      text("Alohida jadvalda indeks, tashqi kalit va guruhlash 10 baravar osonroq.", 1045, 730, { size: 15, color: C.blue, fam: UI });

      card(1020, 805, 790, 170, { fill: '#f0fdf4', col: C.green, p: k });
      text("Massiv qachon to'g'ri tanlov?", 1045, 845, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Tartiblangan kichik ro'yxatlar (masalan, so'nggi 5 ta baho).", 1045, 890, { size: 16, color: C.ink, fam: UI });
      text("• Kam o'zgaradigan va butunicha o'qiladigan atributlar.", 1045, 930, { size: 16, weight: 700, color: C.green, fam: UI });
    });
  }

  // 3. RANGE TIPLARI (33.56s - 50.06s)
  function sRange(t) {
    heading("Range Tiplari: Chegaralar va Kanonik Shakl", t, TM.scenes.range_tiplari.s);

    const k = P(t, TM.scenes.range_tiplari.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Chegaralar va kanonik ko'rinish
      card(80, 170, 850, 840, { fill: C.card, col: C.green, p: k });
      pill("1. Oraliq Chegaralari va Kanonik Shakl", 505, 220, C.green, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#166534', p: k });
      text("SELECT daterange('2026-02-01', '2026-02-05', '[]') AS yopiq,", 135, 310, { size: 15, color: '#86efac', fam: MONO });
      text("       int4range(1, 10, '(]')                      AS r;", 135, 350, { size: 15, color: '#fbbf24', fam: MONO });
      sline(135, 380, 870, 380, { col: '#475569', w: 1.5 });
      text("Natija (Postgres avtomatik kanonik qiladi):", 135, 415, { size: 15, color: '#94a3b8', fam: MONO });
      text("yopiq: [2026-02-01, 2026-02-06)  -- 5-fevral kiradi!", 135, 455, { size: 16, weight: 700, color: '#86efac', fam: MONO });
      text("r:     [2, 11)                   -- 1 kirmaydi, 10 kiradi!", 135, 495, { size: 16, color: '#fbbf24', fam: MONO });

      card(110, 555, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Chegara belgilari qoidasi:", 135, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text("• [ yoki ] : Chegara kiradi (inclusive)", 135, 650, { size: 16, color: '#86efac', fam: MONO });
      text("• ( yoki ) : Chegara kirmaydi (exclusive)", 135, 690, { size: 16, color: '#f87171', fam: MONO });
      text("• Diskret tiplarda (date, int) doimo: [boshi, oxiri)", 135, 730, { size: 16, weight: 700, color: '#fbbf24', fam: MONO });

      card(110, 790, 790, 185, { fill: '#f0fdf4', col: C.green, p: k });
      text("Nega yarim ochiq [boshi, oxiri) afzal?", 135, 830, { size: 21, weight: 700, color: C.green, fam: UI });
      text("Ketma-ket oraliqlar tutashganda kesishmaydi!", 135, 875, { size: 16, weight: 700, color: C.green, fam: UI });
      text("Masalan: [1-fevral, 5-fevral) va [5-fevral, 10-fevral) 5-kunda to'qnashmaydi.", 135, 915, { size: 15, color: C.ink, fam: UI });
      text("Mehmon 5-kuni tushda chiqib, keyingi mehmon bemalol kira oladi.", 135, 945, { size: 15, color: C.blue, fam: UI });

      // O'ng: Operatorlar va multirange
      card(990, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("2. Range Operatorlari va Multirange", 1415, 220, C.blue, k, 19);

      card(1020, 270, 790, 260, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("-- 1. @> : Qiymat yoki oraliq ichidami?", 1045, 305, { size: 15, color: '#93c5fd', fam: MONO });
      text("daterange('2026-02-01','2026-02-05') @> date '2026-02-03';", 1045, 340, { size: 15, color: '#86efac', fam: MONO });
      text("--> true", 1045, 370, { size: 15, weight: 700, color: '#86efac', fam: MONO });
      sline(1045, 390, 1780, 390, { col: '#475569', w: 1 });
      text("-- 2. && : Ikki oraliq kesishadimi?", 1045, 420, { size: 15, color: '#93c5fd', fam: MONO });
      text("daterange('2026-02-01','2026-02-05') &&", 1045, 450, { size: 15, color: '#fbbf24', fam: MONO });
      text("daterange('2026-02-04','2026-02-10'); --> true (4-kunda)", 1045, 480, { size: 15, color: '#fbbf24', fam: MONO });

      card(1020, 555, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Multirange imkoniyati (PG 14+):", 1045, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 610, 1780, 610, { col: '#475569', w: 1.5 });
      text("SELECT datemultirange(", 1045, 645, { size: 15, color: '#fff', fam: MONO });
      text("  daterange('2026-02-01','2026-02-05'),", 1065, 675, { size: 15, color: '#93c5fd', fam: MONO });
      text("  daterange('2026-02-03','2026-02-08')  -- Birlashadi!", 1065, 705, { size: 15, color: '#fbbf24', fam: MONO });
      text("); --> {[2026-02-01, 2026-02-08)}", 1045, 735, { size: 15, weight: 700, color: '#86efac', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#eff6ff', col: C.blue, p: k });
      text("Foydali yordamchi funksiyalar:", 1045, 830, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• lower(r) va upper(r) : Quyi va yuqori chegaralarni ajratadi.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("• isempty(r) : Bo'sh oraliqni aniqlaydi (masalan, [5, 5)).", 1045, 915, { size: 16, color: C.ink, fam: UI });
      text("• GiST indekslari bilan oraliq qidiruvi soniyaning mingdan birida ishlaydi.", 1045, 945, { size: 15, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. EXCLUSION CONSTRAINT (50.06s - 65.69s)
  function sExclusion(t) {
    heading("Exclusion Constraint: Kesishmaslik Kafolati", t, TM.scenes.exclusion_constraint.s);

    const k = P(t, TM.scenes.exclusion_constraint.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: EXCLUDE jadval e'loni
      card(80, 170, 850, 840, { fill: C.card, col: C.orange, p: k });
      pill("1. EXCLUDE USING GIST Tuzilishi", 505, 220, C.orange, k, 19);

      card(110, 270, 790, 260, { fill: '#1e293b', col: '#7c2d12', p: k });
      text("CREATE EXTENSION IF NOT EXISTS btree_gist;", 135, 305, { size: 15, color: '#86efac', fam: MONO });
      text("CREATE TABLE bron (", 135, 345, { size: 16, color: '#fff', fam: MONO });
      text("    xona int,", 135, 380, { size: 16, color: '#93c5fd', fam: MONO });
      text("    davr tsrange,", 135, 415, { size: 16, color: '#fbbf24', fam: MONO });
      text("    EXCLUDE USING GIST (xona WITH =, davr WITH &&)", 135, 455, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      text(");", 135, 490, { size: 16, color: '#fff', fam: MONO });

      card(110, 555, 790, 210, { fill: '#0f172a', col: '#334155', p: k });
      text("Cheklov qoidasi:", 135, 595, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 610, 870, 610, { col: '#475569', w: 1.5 });
      text("• xona WITH =  : Bir xil xona bo'lsa", 135, 650, { size: 16, color: '#93c5fd', fam: MONO });
      text("• davr WITH && : Ularning vaqt oraliqlari KESISHMASIN!", 135, 690, { size: 16, weight: 700, color: '#f87171', fam: MONO });
      text("• btree_gist oddiy ustun (int) bilan rangeni bitta indeksga ulaydi.", 135, 730, { size: 15, color: '#86efac', fam: MONO });

      card(110, 790, 790, 185, { fill: '#fff7ed', col: C.orange, p: k });
      text("Nega UNIQUE oraliqqa yaramaydi?", 135, 830, { size: 21, weight: 700, color: C.orange, fam: UI });
      text("UNIQUE faqat ikkita qiymatning tengligini (=) tekshiradi.", 135, 875, { size: 16, color: C.ink, fam: UI });
      text("Vaqt oraliqlari esa teng bo'lmasa ham bir-birining ustiga tushishi mumkin!", 135, 915, { size: 16, weight: 700, color: C.red, fam: UI });
      text("EXCLUDE cheklovi kesishishni (&&) bazaviy darajada bloklaydi.", 135, 945, { size: 15, color: C.green, fam: UI });

      // O'ng: Amaliy sinov va xato
      card(990, 170, 850, 840, { fill: C.card, col: C.red, p: k });
      pill("2. Haqiqiy Mehmonxona Sinovi", 1415, 220, C.red, k, 19);

      card(1020, 270, 790, 250, { fill: '#1e293b', col: '#991b1b', p: k });
      text("-- 1. Xona 101: 10:00 dan 12:00 gacha (OK)", 1045, 305, { size: 14, color: '#86efac', fam: MONO });
      text("INSERT INTO bron VALUES (101, '[10:00, 12:00)');", 1045, 335, { size: 15, color: '#fff', fam: MONO });
      text("-- 2. Xona 101: 12:00 dan 13:00 gacha (OK - tutashgan)", 1045, 370, { size: 14, color: '#86efac', fam: MONO });
      text("INSERT INTO bron VALUES (101, '[12:00, 13:00)');", 1045, 400, { size: 15, color: '#fff', fam: MONO });
      text("-- 3. Xona 101: 11:30 dan 12:30 gacha (KESISHADI!)", 1045, 435, { size: 14, color: '#f87171', fam: MONO });
      text("INSERT INTO bron VALUES (101, '[11:30, 12:30)');", 1045, 465, { size: 15, weight: 700, color: '#f87171', fam: MONO });

      card(1020, 545, 790, 220, { fill: '#0f172a', col: '#334155', p: k });
      text("PostgreSQL bergan real xato:", 1045, 585, { size: 15, weight: 700, color: '#f87171', fam: MONO });
      sline(1045, 600, 1780, 600, { col: '#475569', w: 1.5 });
      text("ERROR: conflicting key value violates exclusion constraint", 1045, 635, { size: 14, color: '#f87171', fam: MONO });
      text("DETAIL: Key (xona, davr)=(101, [\"11:30\",\"12:30\"))", 1045, 670, { size: 14, color: '#fbbf24', fam: MONO });
      text("conflicts with existing key (101, [\"10:00\",\"12:00\")).", 1045, 705, { size: 14, color: '#fbbf24', fam: MONO });

      card(1020, 790, 790, 185, { fill: '#fef2f2', col: C.red, p: k });
      text("Poyga holatlaridan (Race Condition) to'liq himoya:", 1045, 830, { size: 21, weight: 700, color: C.red, fam: UI });
      text("Ilova darajasida 'SELECT + INSERT' qilish parallel so'rovlarda pand beradi.", 1045, 875, { size: 16, color: C.ink, fam: UI });
      text("Exclusion constraint esa xonalarni ikki marta bron qilinishini 100% to'xtatadi!", 1045, 915, { size: 16, weight: 700, color: C.red, fam: UI });
      text("Tranzaksiyalar va parallel mijozlar uchun eng ishonchli arxitektura.", 1045, 945, { size: 15, color: C.ink, fam: UI });
    });
  }

  // 5. DOMAIN VA COMPOSITE (65.69s - 82.4s)
  function sDomainComposite(t) {
    heading("Domain va Composite Tiplari", t, TM.scenes.domain_va_composite.s);

    const k = P(t, TM.scenes.domain_va_composite.s + 0.3, 0.8);
    withA(k, () => {
      // Chap: Domain
      card(80, 170, 850, 840, { fill: C.card, col: C.purple, p: k });
      pill("1. DOMAIN: Cheklovli Foydalanuvchi Tipi", 505, 220, C.purple, k, 19);

      card(110, 270, 790, 240, { fill: '#1e293b', col: '#581c87', p: k });
      text("CREATE DOMAIN telefon_raqam AS text", 135, 305, { size: 15, color: '#c084fc', fam: MONO });
      text("    CHECK (VALUE ~ '^\\+998[0-9]{9}$');", 135, 340, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });
      text("CREATE DOMAIN musbat_summa AS numeric(12,2)", 135, 380, { size: 15, color: '#c084fc', fam: MONO });
      text("    CHECK (VALUE > 0);", 135, 415, { size: 15, weight: 700, color: '#86efac', fam: MONO });
      text("-- O'nlab jadvallarda ustun tipi sifatida ishlatiladi!", 135, 465, { size: 14, color: '#94a3b8', fam: MONO });

      card(110, 535, 790, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("Nozik jihat: Operatsiyadan keyingi tip!", 135, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(135, 590, 870, 590, { col: '#475569', w: 1.5 });
      text("• summa :: musbat_summa  -> musbat_summa", 135, 630, { size: 15, color: '#86efac', fam: MONO });
      text("• summa - 1              -> oddiy numeric! (cheklov yo'q!)", 135, 670, { size: 15, color: '#fbbf24', fam: MONO });
      text("• (summa - 20000)::musbat_summa -> ERROR: check violated!", 135, 710, { size: 15, color: '#f87171', fam: MONO });
      text("Qayta tekshirish uchun yangi qiymatni domain tipiga o'girish shart.", 135, 745, { size: 14, color: '#64748b', fam: MONO });

      card(110, 800, 790, 175, { fill: '#faf5ff', col: C.purple, p: k });
      text("Domain bo'yicha oltin qoida:", 135, 840, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• NOT NULL ni domain ichiga emas, jadval ustuniga qo'ying.", 135, 885, { size: 16, color: C.ink, fam: UI });
      text("• Sababi: LEFT JOIN paytida domain'dagi NOT NULL chetlab o'tilishi mumkin.", 135, 925, { size: 15, color: C.ink, fam: UI });
      text("• Bitta joyda o'zgartirilgan domen qoidasi barcha jadvallarga tarqaladi.", 135, 955, { size: 15, weight: 700, color: C.purple, fam: UI });

      // O'ng: Composite
      card(990, 170, 850, 840, { fill: C.card, col: C.blue, p: k });
      pill("2. COMPOSITE: Bir Nechta Maydonli Yozuv Tipi", 1415, 220, C.blue, k, 19);

      card(1020, 270, 790, 240, { fill: '#1e293b', col: '#1e3a8a', p: k });
      text("CREATE TYPE manzil AS (shahar text, kocha text, uy int);", 1045, 305, { size: 14, color: '#93c5fd', fam: MONO });
      text("CREATE TABLE mijozlar (id int, manzil manzil);", 1045, 340, { size: 15, color: '#fff', fam: MONO });
      text("INSERT INTO mijozlar VALUES", 1045, 375, { size: 15, color: '#fff', fam: MONO });
      text("  (1, ROW('Toshkent', 'Navoiy', 12));", 1045, 410, { size: 15, color: '#86efac', fam: MONO });
      text("SELECT (manzil).shahar FROM mijozlar;  -- Qavs SHART!", 1045, 455, { size: 15, weight: 700, color: '#fbbf24', fam: MONO });

      card(1020, 535, 790, 240, { fill: '#0f172a', col: '#334155', p: k });
      text("Keng tarqalgan sintaksis xatosi:", 1045, 575, { size: 16, weight: 700, color: '#94a3b8', fam: MONO });
      sline(1045, 590, 1780, 590, { col: '#475569', w: 1.5 });
      text("• SELECT manzil.shahar FROM mijozlar;", 1045, 630, { size: 15, color: '#f87171', fam: MONO });
      text("  ERROR: missing FROM-clause entry for table \"manzil\"", 1045, 670, { size: 14, color: '#f87171', fam: MONO });
      text("• Sababi: Qavssiz yozilsa, Postgres 'manzil'ni jadval deb o'ylaydi!", 1045, 710, { size: 15, color: '#fbbf24', fam: MONO });
      text("• UPDATE da esa qavssiz yoziladi: SET manzil.uy = 14", 1045, 745, { size: 14, color: '#86efac', fam: MONO });

      card(1020, 800, 790, 175, { fill: '#eff6ff', col: C.blue, p: k });
      text("Amaliy xulosa:", 1045, 840, { size: 21, weight: 700, color: C.blue, fam: UI });
      text("• Composite tip maydonlariga indeks va cheklov qo'yish murakkab.", 1045, 885, { size: 15, color: C.ink, fam: UI });
      text("• Ko'p hollarda oddiy relyatsion ustunlar (shahar, kocha, uy) qulayroq.", 1045, 925, { size: 15, color: C.ink, fam: UI });
      text("• Composite tip asosan funksiyalardan qator qaytarishda qo'l keladi.", 1045, 955, { size: 15, weight: 700, color: C.blue, fam: UI });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.massivlar.s) {
      sIntro(t);
    } else if (t < TM.scenes.range_tiplari.s) {
      sMassivlar(t);
    } else if (t < TM.scenes.exclusion_constraint.s) {
      sRange(t);
    } else if (t < TM.scenes.domain_va_composite.s) {
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
