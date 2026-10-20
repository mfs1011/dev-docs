// SQL 44-bob 1-qism: "Tushuncha" — Indeks turlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. BTREE VA CHEKLOVLAR (0 -> 19.05s)
  function sBtreeCheklovlari(t) {
    const k = P(t, 0.3, 1.0);
    hand("44-bob. Indeks Turlari", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("B-tree va Uning Imkoniyatlari Chegarasi", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("B-tree qachon a'lo ishlaydi va qachon ojiz qoladi?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(320, 305, 1280 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: B-tree kuchi
      card(140, 340, 780, 480, { fill: C.card, col: C.green, p: kBox });
      text("B-tree Qachon Mukammal?", 180, 390, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("Tartiblangan 1 o'lchamli skalyar qiymatlar:", 180, 455, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("✓ Qat'iy tenglik: WHERE id = 42", 180, 495, { size: 18, fam: MONO, color: C.green });
      text("✓ Oraliq (range): WHERE narx BETWEEN 10 AND 50", 180, 535, { size: 18, fam: MONO, color: C.green });
      text("✓ Taqqoslashlar: <, <=, >, >=", 180, 575, { size: 18, fam: MONO, color: C.green });
      text("✓ Prefiks qidiruv: WHERE ism LIKE 'Ali%'", 180, 615, { size: 18, fam: MONO, color: C.green });
      text("✓ Saralash natijasi: ORDER BY id LIMIT 10", 180, 655, { size: 18, fam: MONO, color: C.green });

      pill("CREATE INDEX sukut bo'yicha B-tree quradi", 530, 755, C.green, kBox, 16);

      // O'ng: B-tree qayerda ojiz?
      const kFail = P(t, 9.0, 0.8);
      withA(kFail, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.red, p: kFail });
        text("B-tree Qayerda Yordam Berolmaydi?", 1040, 390, { size: 24, weight: 700, color: C.red, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Ko'p elementli va ko'p o'lchamli so'rovlar:", 1040, 455, { size: 20, weight: 700, color: C.ink, fam: UI });

        text("✗ Massiv ichidan qidiruv:", 1040, 500, { size: 19, weight: 600, color: C.red, fam: UI });
        text("  WHERE teglar @> ARRAY[3, 5]", 1040, 530, { size: 17, fam: MONO, color: C.soft });

        text("✗ Vaqt oraliqlari kesishuvi:", 1040, 575, { size: 19, weight: 600, color: C.red, fam: UI });
        text("  WHERE davr && tsrange('10:00', '11:00')", 1040, 605, { size: 17, fam: MONO, color: C.soft });

        text("✗ Eng yaqin qo'shni (KNN masofa):", 1040, 650, { size: 19, weight: 600, color: C.red, fam: UI });
        text("  ORDER BY nuqta <-> point(500, 100) LIMIT 3", 1040, 680, { size: 17, fam: MONO, color: C.soft });

        pill("Maxsus ma'lumot turlari uchun maxsus indekslar shart", 1390, 755, C.red, kFail, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 16.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.orange, p: kFoot });
        text("Xulosa: PostgreSQL bitta B-tree bilan cheklanmaydi!", 960, 905, { size: 24, weight: 700, color: C.ink, fam: UI, align: 'center' });
        text("Hash, GiST, SP-GiST, GIN, BRIN — har bir ma'lumot tuzilmasi uchun alohida arxitektura mavjud.", 960, 945, { size: 20, color: C.soft, fam: UI, align: 'center' });
      });
    });
  }

  // 2. HASH VA GIST / SP-GIST (19.05 -> 39.06s)
  function sHashGistSpgist(t) {
    heading("2. HASH, GiST VA SP-GiST", "Faqat tenglik, oraliqlar va fazoviy qidiruv", t, TM.scenes.hash_va_gist_spgist);

    const kHash = P(t, 20.0, 0.8);
    withA(kHash, () => {
      // Chap: HASH
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kHash });
      text("HASH Indeksi — O'ta Tez Tenglik", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Sintaksis: CREATE INDEX ON t USING HASH (kod);", 180, 355, { size: 17, fam: MONO, color: C.purple });

      text("• Tuzilishi:", 180, 405, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  Qiymatning 32 bitli hesh kodini saqlaydi.", 180, 435, { size: 18, color: C.ink, fam: UI });
      text("  Uzun matnlar uchun kalit hajmi doim ixcham.", 180, 465, { size: 18, color: C.soft, fam: UI });

      text("• Faqat qat'iy tenglik: WHERE kod = 'K777'", 180, 520, { size: 18, fam: MONO, color: C.green });
      text("  -> Index Scan using t_kod_hash on t", 180, 550, { size: 16, fam: MONO, color: C.green });

      text("• Oraliq qidiruvga yaramaydi: WHERE kod > 'K999'", 180, 605, { size: 18, fam: MONO, color: C.red });
      text("  -> Seq Scan on t (to'liq skanerlashga tushadi!)", 180, 635, { size: 16, fam: MONO, color: C.red });

      pill("Oraliq (<, >) va ORDER BY uchun Hash ishlatib bo'lmaydi", 530, 730, C.purple, kHash, 16);
    });

    const kGist = P(t, 27.5, 0.8);
    withA(kGist, () => {
      // O'ng: GiST va SP-GiST
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kGist });
      text("GiST va SP-GiST — Fazoviy & Oraliqlar", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("GiST: Generalized Search Tree (Range va Shakllar)", 1040, 355, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("• Range kesishuvi: WHERE davr && tsrange(...)", 1040, 395, { size: 17, fam: MONO, color: C.ink });
      text("  EXCLUDE USING GIST (36-bob) aynan shunga tayanadi.", 1040, 425, { size: 17, color: C.soft, fam: UI });

      text("SP-GiST: Space-Partitioned GiST (Muvozanatsiz)", 1040, 480, { size: 19, weight: 700, color: C.teal, fam: UI });
      text("• Nuqtalar (point), prefiks daraxtlar (radix tree, quadtree).", 1040, 515, { size: 17, color: C.ink, fam: UI });

      text("• Eng yaqin qo'shni qidiruvi (KNN - Nearest Neighbor):", 1040, 565, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("  ORDER BY nuqta <-> point(500, 100) LIMIT 3;", 1040, 600, { size: 17, fam: MONO, color: C.orange });
      text("  Indeks ichida masofa hisoblanadi, 200k qator saralanmaydi!", 1040, 630, { size: 17, color: C.soft, fam: UI });

      pill("Ko'p o'lchamli geometriya va vaqt oraliqlarining ustuni", 1390, 730, C.blue, kGist, 16);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 34.0, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#f4f6fc', col: C.blue, p: kFoot2 });
      text("Xulosa: GiST va SP-GiST bitta algoritm emas, universal infratuzilmadir!", 960, 885, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
      text("Ular PostGIS fazoviy ma'lumotlar bazasi va murakkab geometrik hisob-kitoblarning yuragi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 3. GIN: TESKARI INDEKS (39.06 -> 57.62s)
  function sGinTeskariIndeks(t) {
    heading("3. GIN — GENERALIZED INVERTED INDEX", "Massiv, JSONB va to'liq matnli qidiruv", t, TM.scenes.gin_teskari_indeks);

    const kGin = P(t, 40.0, 0.8);
    withA(kGin, () => {
      // Chap: GIN g'oyasi
      card(140, 240, 780, 560, { fill: C.card, col: C.teal, p: kGin });
      text("GIN Qanday Ishlaydi?", 180, 290, { size: 24, weight: 700, color: C.teal, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Teskari Indeks (Inverted Index):", 180, 355, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Bir qiymat ichida ko'p tarkibiy elementlar bo'lsa,", 180, 390, { size: 18, color: C.ink, fam: UI });
      text("har bir element uchun alohida ro'yxat tuzadi:", 180, 420, { size: 18, color: C.ink, fam: UI });

      // Sxema
      srect(180, 460, 700, 160, { fill: '#f7fafc', stroke: C.pencil });
      text("Jadvaldagi qator: teglar = ARRAY[3, 5, 42]", 200, 495, { size: 17, fam: MONO, color: C.blue });
      sline(200, 515, 860, 515, { col: C.pencil, w: 1 });
      text("GIN ro'yxati:", 200, 545, { size: 16, weight: 700, fam: UI, color: C.ink });
      text("  Element 3  -> [qator 1, 14, 50, 1005...]", 200, 575, { size: 16, fam: MONO, color: C.green });
      text("  Element 5  -> [qator 1, 22, 99, 1005...]", 200, 600, { size: 16, fam: MONO, color: C.green });

      text("So'rov: WHERE teglar @> ARRAY[3, 5]", 180, 655, { size: 18, fam: MONO, color: C.purple });
      text("-> 3 va 5 ro'yxatlari kesishmasi darhol olinadi!", 180, 685, { size: 17, weight: 600, color: C.teal, fam: UI });

      pill("CREATE INDEX ON t USING GIN (teglar);", 530, 745, C.teal, kGin, 16);
    });

    const kGinApp = P(t, 46.5, 0.8);
    withA(kGinApp, () => {
      // O'ng: Qo'llanish sohalari
      card(1000, 240, 780, 560, { fill: C.card, col: C.blue, p: kGinApp });
      text("GIN Asosiy Qo'llanish Joylari", 1040, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("1. Massivlar (Arrays, 36-bob):", 1040, 355, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("   Operatorlar: @> (o'z ichiga oladi), && (kesishadi), =", 1040, 385, { size: 17, fam: MONO, color: C.soft });

      text("2. JSONB hujjatlari (35-bob):", 1040, 440, { size: 19, weight: 700, color: C.orange, fam: UI });
      text("   WHERE meta @> '{\"status\": \"active\"}'", 1040, 470, { size: 17, fam: MONO, color: C.soft });
      text("   Hujjat ichidagi ixtiyoriy kalit va qiymatlarni qidirish.", 1040, 500, { size: 17, color: C.ink, fam: UI });

      text("3. To'liq matnli qidiruv (Full-Text Search, 49-bob):", 1040, 555, { size: 19, weight: 700, color: C.green, fam: UI });
      text("   tsvector va tsquery leksik so'zlari bo'yicha indeks.", 1040, 585, { size: 17, color: C.ink, fam: UI });

      text("Eslatma: GIN index-only scan'ni qo'llamaydi (43-bob).", 1040, 645, { size: 17, weight: 600, color: C.red, fam: UI });
      text("Har doim Bitmap Heap Scan orqali jadval qatorlari tekshiriladi.", 1040, 675, { size: 16, color: C.soft, fam: UI });

      pill("Ko'p qiymatli maydonlar uchun eng kuchli vosita", 1390, 745, C.blue, kGinApp, 16);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 52.0, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#e6fffa', col: C.teal, p: kFoot3 });
      text("Xulosa: B-tree faqat butun qiymatni indekslasa, GIN ichki bo'laklarni indekslaydi!", 960, 885, { size: 22, weight: 700, color: C.teal, fam: UI, align: 'center' });
      text("Shu sababli JSONB va massivlar bilan ishlaganda PostgreSQL'da GIN tengsizdir.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. BRIN VA HAJMLAR (57.62 -> 78.34s)
  function sBrinVaHajmlar(t) {
    heading("4. BRIN VA INDEKS HAJMLARI", "Block Range Index: 180 baravar kichikroq xotira", t, TM.scenes.brin_va_hajmlar);

    const kBrin = P(t, 58.5, 0.8);
    withA(kBrin, () => {
      // Chap: BRIN ishlashi
      card(140, 240, 780, 560, { fill: C.card, col: C.orange, p: kBrin });
      text("BRIN Qanday Ishlaydi?", 180, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Block Range Index (Blok Oraliqlari Indeksi):", 180, 355, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Har bir qatorni emas, ketma-ket fizik bloklar", 180, 390, { size: 18, color: C.ink, fam: UI });
      text("guruhi (masalan 128 ta blok) uchun xulosani saqlaydi:", 180, 420, { size: 18, color: C.ink, fam: UI });

      srect(180, 460, 700, 140, { fill: '#fffaf0', stroke: C.orange });
      text("Bloklar 0..127:   min = 2026-01-01, max = 2026-01-02", 200, 495, { size: 16, fam: MONO, color: C.orange });
      text("Bloklar 128..255: min = 2026-01-02, max = 2026-01-03", 200, 530, { size: 16, fam: MONO, color: C.orange });
      text("Bloklar 256..383: min = 2026-01-03, max = 2026-01-04", 200, 565, { size: 16, fam: MONO, color: C.orange });

      text("• Qachon ideal: Qo'shilish tartibida o'suvchi loglar,", 180, 630, { size: 18, weight: 700, color: C.green, fam: UI });
      text("  vaqt belgilari (timestamp), auto-increment ID lar.", 180, 660, { size: 17, color: C.ink, fam: UI });

      text("• Cheklov: Qiymatlar diskda tasodifiy sochilgan bo'lsa foydasiz.", 180, 705, { size: 16, color: C.red, fam: UI });

      pill("Gigabaytlab loglar uchun xotirani misli ko'rilmagan darajada tejaydi", 530, 755, C.orange, kBrin, 15);
    });

    const kSizes = P(t, 65.0, 0.8);
    withA(kSizes, () => {
      // O'ng: Hajmlar jadvali (200k qator)
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kSizes });
      text("200 000 Qatorda Indeks Hajmlari:", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      const rows = [
        ["Indeks Nomi", "Turi", "Hajmi", "Xarakteri"],
        ["t_vaqt_btree", "B-tree", "4408 kB", "Standart (100%)"],
        ["t_kod_hash", "HASH", "6824 kB", "Kattaroq chiqqan"],
        ["t_davr_gist", "GiST", "7120 kB", "Ko'p o'lchamli"],
        ["t_nuqta_spgist", "SP-GiST", "9128 kB", "Fazoviy daraxt"],
        ["t_teglar_gin", "GIN", "696 kB", "Ixcham ro'yxat"],
        ["t_vaqt_brin", "BRIN", "24 kB", "~180 baravar kichik!"]
      ];

      rows.forEach((r, idx) => {
        const yPos = 350 + idx * 45;
        const isHdr = idx === 0, isBrin = idx === 6;
        if (isBrin) {
          srect(1030, yPos - 22, 720, 38, { fill: C.hlGreen, stroke: C.green });
        }
        text(r[0], 1040, yPos, { size: isHdr ? 17 : 16, weight: isHdr || isBrin ? 700 : 500, fam: isHdr ? UI : MONO, color: isBrin ? C.green : isHdr ? C.blue : C.ink });
        text(r[1], 1260, yPos, { size: 16, weight: isHdr ? 700 : 500, fam: UI, color: C.ink });
        text(r[2], 1410, yPos, { size: 16, weight: isBrin || isHdr ? 700 : 500, fam: MONO, color: isBrin ? C.green : C.ink });
        text(r[3], 1540, yPos, { size: 15, weight: isBrin ? 700 : 500, fam: UI, color: isBrin ? C.green : C.soft });
        if (isHdr) sline(1040, yPos + 15, 1740, yPos + 15, { col: C.pencil, w: 1 });
      });

      pill("B-tree: 4408 kB  vs  BRIN: 24 kB", 1390, 745, C.green, kSizes, 18);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 71.0, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.green, p: kFoot4 });
      text("Oltin Qoida: B-tree standart boshlanish, lekin yagona vosita emas!", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Katta jadvallarda ma'lumot tabiatiga qarab to'g'ri indeks tanlash bazani tezlashtiradi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.btree_cheklovlari.e) sBtreeCheklovlari(t);
    else if (t < TM.scenes.hash_va_gist_spgist.e) sHashGistSpgist(t);
    else if (t < TM.scenes.gin_teskari_indeks.e) sGinTeskariIndeks(t);
    else sBrinVaHajmlar(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
