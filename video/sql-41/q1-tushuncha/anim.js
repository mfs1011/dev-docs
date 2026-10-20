// SQL 41-bob 1-qism: "Tushuncha" — Indeks qanday ishlaydi
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. INDEKSSIZ VS INDEKS (0 -> 17.46s)
  function sIndekssizVsIndeks(t) {
    const k = P(t, 0.3, 1.0);
    hand("41-bob. Indeks Qanday Ishlaydi", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Indekssiz Qidiruv va Kitob Ko'rsatkichi", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("To'liq skanerlash (Seq Scan) vs Ikkilik qidiruv (B-Tree Index)", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Indekssiz
      card(140, 380, 780, 420, { fill: C.card, col: C.red, p: kBox });
      text("Indekssiz Qidiruv: To'liq Skanerlash (Seq Scan)", 180, 430, { size: 23, weight: 700, color: C.red, fam: UI });
      text("SELECT * FROM buyurtmalar WHERE mijoz_id = 777;", 180, 465, { size: 18, color: C.soft, fam: MONO });

      sline(180, 495, 880, 495, { col: C.pencil, w: 1.5 });
      text("• Tizim 100 000 qatorning barchasini o'qib chiqadi.", 180, 540, { size: 21, color: C.ink, fam: UI });
      text("• 10 ta qator topish uchun 99 990 qator tashlanadi.", 180, 585, { size: 21, weight: 600, color: C.red, fam: UI });
      text("• Murakkabligi: O(N) — qatorlar ortgani sari sekinlashadi.", 180, 630, { size: 20, fam: UI, color: C.ink });
      text("• 600 dan ortiq disk sahifasi (buffer) o'qiladi.", 180, 675, { size: 21, color: C.ink, fam: UI });
      pill("O(N) to'liq skanerlash yuklamasi", 530, 755, C.red, kBox, 18);

      // O'ng: Indeks bilan
      const kIdx = P(t, 7.5, 0.8);
      withA(kIdx, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kIdx });
        text("Indeks: Kitob Oxiridagi Alifbo Ko'rsatkichi", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        text("CREATE INDEX buyurtmalar_mijoz_idx ON (mijoz_id);", 1040, 465, { size: 18, color: C.soft, fam: MONO });

        sline(1040, 495, 1740, 495, { col: C.pencil, w: 1.5 });
        text("• Tartiblangan nusxa: [ mijoz_id | qator ko'rsatkichi ].", 1040, 540, { size: 21, color: C.ink, fam: UI });
        text("• Ikkilik qidiruv (Binary Search): O(log N).", 1040, 585, { size: 21, weight: 600, color: C.green, fam: UI });
        text("• 10 million qatorda qidiruv 1 million baravar tezlashadi!", 1040, 630, { size: 21, weight: 700, color: C.blue, fam: UI });
        text("• 600 ta sahifa o'rniga atigi 12 ta sahifa o'qiladi.", 1040, 675, { size: 21, color: C.ink, fam: UI });
        pill("O(log N) tezkor B-tree daraxti", 1390, 755, C.green, kIdx, 18);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Kitob O'xshatishi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Kitobdan ma'lumot izlaganda 1000 betni boshidan o'qib chiqmaymiz, balki orqa ko'rsatkichdan kerakli", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("sahifa raqamini topib darhol o'sha sahifani ochamiz. Indeks aynan shu vazifani bajaradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. B-TREE TUZILISHI (17.46 -> 35.43s)
  function sBTreeTuzilishi(t) {
    heading("B-Tree Daraxti va Tartiblangan Tuzilma", t, TM.scenes.b_tree_tuzilishi.s);

    const kCards = P(t, TM.scenes.b_tree_tuzilishi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Daraxt ierarxiyasi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("B-Tree Ierarxik Daraxt Tuzilishi:", 180, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("               [ Root Node: 100 | 500 ]", 180, 500, { size: 19, fam: MONO, color: '#89b4fa' });
      text("                  /         |         \\", 180, 530, { size: 19, fam: MONO, color: '#6c7086' });
      text("     [ Branch: 1..99 ]  [ 100..499 ]  [ 500..999 ]", 180, 560, { size: 18, fam: MONO, color: '#f9e2af' });
      text("        /       \\          /     \\        /     \\", 180, 590, { size: 19, fam: MONO, color: '#6c7086' });
      text("    [Leaf]    [Leaf]    [Leaf]  [Leaf]  [Leaf]  [Leaf]", 180, 620, { size: 18, fam: MONO, color: '#a6e3a1' });

      sline(180, 660, 880, 660, { col: '#45475a', w: 1 });
      text("• Barglarda (Leaf): [ Kalit | Qator Manzili (TID) ]", 180, 700, { size: 19, fam: MONO, color: '#cdd6f4' });
      pill("Root -> Branch -> Leaf (Atigi 3-4 pog'ona)", 530, 765, C.blue, kCards, 16);

      // O'ng: Tartiblanganlik yutuqlari
      const kAd = P(t, 25.5, 0.8);
      withA(kAd, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kAd });
        text("Tartiblanganlik Imkoniyatlari:", 1040, 430, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Aniq Tenglik: WHERE mijoz_id = 777", 1040, 500, { size: 20, weight: 600, fam: MONO, color: C.blue });
        text("2. Oraliq Shartlar: WHERE mijoz_id BETWEEN 100 AND 200", 1040, 545, { size: 19, weight: 600, fam: MONO, color: C.green });
        text("3. Saralash: ORDER BY mijoz_id (qo'shimcha sortsiz!)", 1040, 590, { size: 19, weight: 600, fam: MONO, color: C.purple });
        text("4. Ekstremum: MIN(mijoz_id) va MAX(mijoz_id)", 1040, 635, { size: 19, weight: 600, fam: MONO, color: C.orange });
        text("   (Daraxtning eng chap yoki eng o'ng bitta bargidan olinadi)", 1040, 670, { size: 17, color: C.soft, fam: UI });

        sline(1040, 710, 1740, 710, { col: C.pencil, w: 1.5 });
        pill("=, <, >, BETWEEN, ORDER BY, MIN/MAX", 1390, 765, C.green, kAd, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 30.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("B-Tree Balanslangan Daraxtdir:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Daraxtning barcha barglari bir xil chuqurlikda joylashadi. 1 million qatorda ham, 100 million qatorda ham", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("istalgan qiymatni topish uchun atigi 3 yoki 4 ta tugunni tekshirish kifoya qiladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. QOPLOVCHI INDEKS (35.43 -> 52.01s)
  function sQoplovchiIndeks(t) {
    heading("Qoplovchi Indeks (Covering Index) va Index Only Scan", t, TM.scenes.qoplovchi_indeks.s);

    const kCards = P(t, TM.scenes.qoplovchi_indeks.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Oddiy Index Scan vs Qoplovchi
      card(140, 380, 780, 420, { fill: C.card, col: C.purple, p: kCards });
      text("Oddiy Indeks vs Qoplovchi Indeks:", 180, 430, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("Oddiy Indeks Scan (2 ta qadam):", 180, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("1. Indeksdan manzil (TID / rowid) olinadi.", 180, 535, { size: 19, color: C.ink, fam: UI });
      text("2. Jadval sahifasiga borib qolgan ustunlar o'qiladi.", 180, 570, { size: 19, color: C.soft, fam: UI });

      text("Qoplovchi Indeks (Atigi 1 ta qadam):", 180, 625, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• So'ralgan barcha ustunlar indeksning o'zida bor!", 180, 660, { size: 19, weight: 600, color: C.green, fam: UI });
      text("• Asosiy jadval sahifasiga murojaat nolga teng!", 180, 695, { size: 19, weight: 600, color: C.green, fam: UI });
      pill("Jadval sahifasiga murojaat qilinmaydi", 530, 765, C.purple, kCards, 16);

      // O'ng: PostgreSQL va MySQL misollari
      const kEx = P(t, 43.5, 0.8);
      withA(kEx, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kEx });
        text("Terminal: Qoplovchi So'rovlar", 1040, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("PostgreSQL: Index Only Scan", 1040, 495, { size: 20, weight: 700, color: '#89b4fa', fam: UI });
        text("EXPLAIN SELECT count(*) FROM buyurtmalar WHERE holat = 'yangi';", 1040, 530, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("--> Index Only Scan using buyurtmalar_holat_idx ✓", 1040, 565, { size: 18, fam: MONO, color: '#a6e3a1' });

        sline(1040, 605, 1740, 605, { col: '#45475a', w: 1 });
        text("MySQL InnoDB: Birlamchi Kalit Qoplamasi", 1040, 645, { size: 20, weight: 700, color: '#f9e2af', fam: UI });
        text("EXPLAIN SELECT id FROM buyurtmalar WHERE mijoz_id = 777;", 1040, 680, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("--> Covering index lookup using mijoz_id ✓", 1040, 715, { size: 18, fam: MONO, color: '#a6e3a1' });
        text("(Chunki InnoDB ikkilamchi indeksida PK 'id' doim mavjud)", 1040, 750, { size: 16, color: '#a6adc8', fam: UI });
      });

      // Pastki xulosa
      const kFoot = P(t, 47.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.green, p: kFoot });
        text("Eng Katta Unumdorlik Sirri:", 180, 875, { size: 23, weight: 700, color: C.green, fam: UI });
        text("Agar tez-tez bajariladigan so'rovga kerakli 2-3 ta ustun indeksga qo'shilsa (covering index),", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("ma'lumotlar bazasi diskka yoki jadval heap'iga kirmasdan javob qaytaradi. Tezlik 10 baravargacha oshadi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. SELEKTIVLIK VA REJALASHTIRUVCHI (52.01 -> 68.79s)
  function sSelektivlik(t) {
    heading("Selektivlik va Rejalashtiruvchi: Indeks Qachon Ishlamaydi?", t, TM.scenes.selektivlik_va_rejalashtiruvchi.s);

    const kCards = P(t, TM.scenes.selektivlik_va_rejalashtiruvchi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: 2% yangi (Yuqori selektivlik)
      card(140, 380, 780, 420, { fill: C.card, col: C.green, p: kCards });
      text("Yuqori Selektivlik: 2% Qatorlar ('yangi')", 180, 430, { size: 23, weight: 700, color: C.green, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("WHERE holat = 'yangi' (2 000 ta qator):", 180, 500, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("• 100 000 qatordan atigi 2% qator tanlanadi.", 180, 545, { size: 20, color: C.ink, fam: UI });
      text("• Indeks juda foydali: 98% qator chetlab o'tiladi.", 180, 590, { size: 20, color: C.ink, fam: UI });
      text("• Rejalashtiruvchi INDEKSNI TANLAYDI ✓", 180, 635, { size: 21, weight: 700, color: C.green, fam: UI });
      text("--> Index Only Scan / Index Lookup", 180, 675, { size: 19, fam: MONO, color: C.blue });
      pill("2% qator = Indeks juda samarali", 530, 765, C.green, kCards, 16);

      // O'ng: 98% yopilgan (Past selektivlik)
      const kLow = P(t, 60.5, 0.8);
      withA(kLow, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.red, p: kLow });
        text("Past Selektivlik: 98% Qatorlar ('yopilgan')", 1040, 430, { size: 23, weight: 700, color: C.red, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("WHERE holat = 'yopilgan' (98 000 ta qator):", 1040, 500, { size: 20, weight: 600, fam: MONO, color: C.ink });
        text("• Jadvalning deyarli barcha qatorlari kerak.", 1040, 545, { size: 20, color: C.ink, fam: UI });
        text("• Indeks orqali 98 000 marta sakrash qimmatga tushadi!", 1040, 590, { size: 20, weight: 600, color: C.red, fam: UI });
        text("• Rejalashtiruvchi INDEKSDAN VOZ KECHADI ✗", 1040, 635, { size: 21, weight: 700, color: C.red, fam: UI });
        text("--> Seq Scan (Ketma-ket o'qish tezroq!)", 1040, 675, { size: 19, fam: MONO, color: C.red });
        pill("98% qator = Seq Scan tezroq", 1390, 765, C.red, kLow, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 64.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("Katta Qoida: Ko'p Qator Kerak Bo'lsa, Ketma-ket O'qish Tezroq!", 180, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("Indeks orqali qatorlarni o'qish disk bo'ylab tasodifiy sakrashlarni talab qiladi. To'liq skanerlash esa", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("sahifalarni blokma-blok ketma-ket (sequential) o'qiydi. Shuning uchun indeks har doim ham ishlatilmaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. INDEKS NARXI (68.79 -> 87.14s)
  function sIndeksNarxi(t) {
    heading("Indeksning Xotira va Yozish Narxi: Qachon Indeks Qo'ymaslik Kerak?", t, TM.scenes.indeks_narxi.s);

    const kCards = P(t, TM.scenes.indeks_narxi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Indeks narxi
      card(140, 380, 780, 420, { fill: C.card, col: C.orange, p: kCards });
      text("Indeksning Yashirin Xarajatlari:", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("1. Disk va RAM Hajmi:", 180, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("   Jadval 5 MB bo'lsa, 3 ta indeks yana 4 MB oladi (+75%).", 180, 535, { size: 19, color: C.ink, fam: UI });

      text("2. Yozish Amallari Sekinlashishi:", 180, 585, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("   Har bir INSERT, UPDATE, DELETE barcha indekslarni yangilaydi.", 180, 620, { size: 19, color: C.red, fam: UI });
      text("   100 000 qator kiritish: 155 ms dan 391 ms ga cho'zildi (2.5x sekin).", 180, 655, { size: 19, fam: UI, color: C.red });

      text("3. Katta Jadvalda CREATE INDEX Yozishni Bloklaydi:", 180, 700, { size: 19, weight: 600, color: C.ink, fam: UI });
      pill("Indeks o'qishni tezlashtiradi, yozishni sekinlashtiradi", 530, 765, C.orange, kCards, 16);

      // O'ng: Foydasiz indekslarni o'chirish
      const kClean = P(t, 77.5, 0.8);
      withA(kClean, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.blue, p: kClean });
        text("Audit: Ishlatilmaydigan Indekslarni Topish", 1040, 430, { size: 23, weight: 700, color: C.blue, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("SELECT indexrelname, idx_scan FROM pg_stat_user_indexes;", 1040, 500, { size: 17, fam: MONO, color: C.blue });

        text("indexrelname          | idx_scan", 1040, 550, { size: 20, weight: 700, fam: MONO, color: C.ink });
        sline(1040, 570, 1740, 570, { col: C.pencil, w: 1 });
        text("buyurtmalar_mijoz_idx |        3  (Ishlatilmoqda ✓)", 1040, 610, { size: 19, fam: MONO, color: C.green });
        text("buyurtmalar_holat_idx |        0  (HECH QACHON! ✗)", 1040, 655, { size: 19, weight: 700, fam: MONO, color: C.red });

        text("• idx_scan = 0 bo'lgan indekslar diskni va yozishni", 1040, 705, { size: 19, color: C.soft, fam: UI });
        text("  behuda isrof qiladi. Ularni darhol DROP qiling!", 1040, 735, { size: 19, weight: 600, color: C.red, fam: UI });
        pill("idx_scan = 0 bo'lsa o'chiring", 1390, 765, C.blue, kClean, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 81.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Xulosa: Indekslashning Oltin Balansi", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("1. Indeksni faqat tez-tez qidiriladigan va yuqori selektiv ustunlarga qo'ying.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("2. WHERE shartida ustunga amal qo'llamang.  3. Doimo EXPLAIN bilan rejani va vaqtni tekshiring.", 180, 960, { size: 20, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.b_tree_tuzilishi.s) {
      sIndekssizVsIndeks(t);
    } else if (t < TM.scenes.qoplovchi_indeks.s) {
      sBTreeTuzilishi(t);
    } else if (t < TM.scenes.selektivlik_va_rejalashtiruvchi.s) {
      sQoplovchiIndeks(t);
    } else if (t < TM.scenes.indeks_narxi.s) {
      sSelektivlik(t);
    } else {
      sIndeksNarxi(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
