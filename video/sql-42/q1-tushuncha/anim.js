// SQL 42-bob 1-qism: "Tushuncha" — Ko'p ustunli indeks
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

  // 1. KO'P USTUNLI TUZILMA (0 -> 16.94s)
  function sKopUstunliTuzilma(t) {
    const k = P(t, 0.3, 1.0);
    hand("42-bob. Ko'p Ustunli Indeks", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Tartiblangan Massiv va Telefon Kitobi", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Bir nechta ustun qiymatlarining yagona tartiblangan zanjiri", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Telefon kitobi modeli
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kBox });
      text("Telefon Kitobi Modeli: (familiya, ism)", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("CREATE INDEX xodimlar_idx ON xodimlar (familiya, ism);", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      sline(180, 520, 880, 520, { col: '#45475a', w: 1 });

      text("Tartiblangan B-Tree massivi:", 180, 555, { size: 18, weight: 700, fam: UI, color: '#fab387' });
      text("[ Karimov | Ali    | TID: (0, 1) ]", 180, 590, { size: 17, fam: MONO, color: '#a6e3a1' });
      text("[ Karimov | Vali   | TID: (0, 2) ]", 180, 625, { size: 17, fam: MONO, color: '#a6e3a1' });
      text("[ Saidov  | Jasur  | TID: (1, 4) ]", 180, 660, { size: 17, fam: MONO, color: '#89b4fa' });
      text("[ Saidov  | Nodir  | TID: (1, 9) ]", 180, 695, { size: 17, fam: MONO, color: '#89b4fa' });
      pill("Avval 1-ustun, teng bo'lsa 2-ustun tartiblanadi", 530, 765, C.blue, kBox, 16);

      // O'ng: Qidiruv imkoniyatlari
      const kRight = P(t, 7.5, 0.8);
      withA(kRight, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kRight });
        text("Qidiruv Imkoniyatlari va Cheklov:", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. WHERE familiya = 'Karimov' AND ism = 'Ali'", 1040, 500, { size: 17, weight: 600, fam: MONO, color: C.green });
        text("   -> Aniq bitta qator topiladi (O(log N)) ✓", 1040, 530, { size: 17, color: C.soft, fam: UI });

        text("2. WHERE familiya = 'Karimov'", 1040, 575, { size: 17, weight: 600, fam: MONO, color: C.blue });
        text("   -> Karimovlar guruhi darhol topiladi ✓", 1040, 605, { size: 17, color: C.soft, fam: UI });

        text("3. WHERE ism = 'Ali'  (familiyasiz)", 1040, 650, { size: 17, weight: 700, fam: MONO, color: C.red });
        text("   -> 'Ali'lar butun kitob bo'ylab sochilgan! ✗", 1040, 680, { size: 17, weight: 600, color: C.red, fam: UI });
        text("   -> Butun jadvalni to'liq skanerlash kerak (Seq Scan).", 1040, 710, { size: 16, color: C.soft, fam: UI });
        pill("Chap ustunsiz indeks yordam bermaydi", 1390, 765, C.red, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Ko'p Ustunli Indeksning Mohiyati:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Indeks alohida jadvallar emas, balki bir nechta ustunlarni yagona kalit qilib birlashtirgan B-tree daraxtidir.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Unda qidiruv chapdan o'ngga qat'iy ierarxiya asosida amalga oshiriladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. CHAP USTUNLAR QOIDASI (16.94 -> 32.66s)
  function sChapUstunlar(t) {
    heading("Chap Ustunlar Qoidasi (Leftmost Prefix)", t, TM.scenes.chap_ustunlar_qoidasi.s);

    const kCards = P(t, TM.scenes.chap_ustunlar_qoidasi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Qaysi so'rovlar ishlaydi
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("Indeks: (col1, col2, col3)", 180, 430, { size: 23, weight: 700, color: C.blue, fam: MONO });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("Qaysi shartlar indeksdan foydalanadi?", 180, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• WHERE col1 = ...                  -> ISHLAYDI ✓", 180, 535, { size: 17, fam: MONO, color: C.green });
      text("• WHERE col1 = ... AND col2 = ...    -> ISHLAYDI ✓", 180, 570, { size: 17, fam: MONO, color: C.green });
      text("• WHERE col1 = ... AND col2 AND col3 -> ISHLAYDI ✓", 180, 605, { size: 17, fam: MONO, color: C.green });

      sline(180, 640, 880, 640, { col: C.pencil, w: 1 });
      text("• WHERE col2 = ... (col1 yo'q)      -> ISHLAMAYDI ✗", 180, 675, { size: 17, fam: MONO, color: C.red });
      text("• WHERE col2 = ... AND col3 = ...    -> ISHLAMAYDI ✗", 180, 710, { size: 17, fam: MONO, color: C.red });
      pill("Chap tayanchsiz qidiruv ishlamaydi", 530, 765, C.blue, kCards, 16);

      // O'ng: Oltin qoida (Tenglik va Oraliq)
      const kGold = P(t, 24.5, 0.8);
      withA(kGold, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kGold });
        text("Oltin Qoida: Tenglik va Oraliq Shartlar", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("Misol: WHERE a = 5 AND b >= 42 AND c < 77", 1040, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
        sline(1040, 520, 1740, 520, { col: '#45475a', w: 1 });

        text("1. a = 5 (tenglik):", 1040, 555, { size: 18, weight: 700, fam: UI, color: '#89b4fa' });
        text("   Indeksning faqat 'a = 5' qismini cheklaydi.", 1040, 585, { size: 17, fam: UI, color: '#cdd6f4' });

        text("2. b >= 42 (birinchi tengsizlik):", 1040, 620, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("   Qidiruv oralig'ini keskin qisqartiradi.", 1040, 650, { size: 17, fam: UI, color: '#cdd6f4' });

        text("3. c < 77 (keyingi shart):", 1040, 685, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
        text("   Oraliqni kamaytirmaydi, faqat filtr vazifasini bajaradi.", 1040, 715, { size: 17, fam: UI, color: '#a6adc8' });
        pill("Tenglik chapda, oraliq shartlari o'ngda bo'lsin", 1390, 765, C.green, kGold, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 28.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Indeks Qurishning Asosiy Strategiyasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Doimo so'rovlarda tenglik ('=') bilan qidiriladigan eng selektiv ustunlarni indeksning eng chap qismiga qo'ying.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Oraliq shartlari ('>', '<', 'BETWEEN') va saralash ustunlari esa ulardan keyin joylashishi kerak.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. SKIP SCAN MEXANIKASI (32.66 -> 48.32s)
  function sSkipScan(t) {
    heading("Skip Scan: Chap Ustun Yo'q Bo'lganda Qidiruv", t, TM.scenes.skip_scan_mexanikasi.s);

    const kCards = P(t, TM.scenes.skip_scan_mexanikasi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Skip scan qanday ishlaydi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("Skip Scan Mexanikasi (PostgreSQL 18)", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("Indeks: (rol, boy)  -- rol: 'oqituvchi', 'talaba'", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      text("So'rov: SELECT * FROM xodimlar WHERE boy = 180;", 180, 525, { size: 16, fam: MONO, color: '#fab387' });

      sline(180, 550, 880, 550, { col: '#45475a', w: 1 });
      text("Baza avtomatik tarzda 2 ta qidiruvga bo'ladi:", 180, 585, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
      text("1. WHERE rol = 'oqituvchi' AND boy = 180 -> topildi", 180, 620, { size: 16, fam: MONO, color: '#a6e3a1' });
      text("2. Keyingi rolga sakraydi (skip scan) ->", 180, 655, { size: 17, fam: UI, color: '#cdd6f4' });
      text("   WHERE rol = 'talaba' AND boy = 180   -> topildi", 180, 685, { size: 16, fam: MONO, color: '#a6e3a1' });
      pill("Index Searches: 5 ta qidiruv bilan natija", 530, 765, C.blue, kCards, 16);

      // O'ng: Tizimlardagi farqlar
      const kSys = P(t, 41.5, 0.8);
      withA(kSys, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kSys });
        text("Dvigatellarning Skip Scan Shartlari:", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. PostgreSQL 18:", 1040, 495, { size: 19, weight: 700, color: C.blue, fam: UI });
        text("   B-tree'da chap ustunda kam xil qiymat bo'lsa ishlaydi.", 1040, 525, { size: 17, color: C.ink, fam: UI });

        text("2. MySQL 9.7 (Skip Scan Range Access):", 1040, 565, { size: 19, weight: 700, color: C.green, fam: UI });
        text("   Faqat so'rov barcha ustunlari indeksda bo'lsa (covering).", 1040, 595, { size: 17, color: C.ink, fam: UI });

        text("3. SQLite 3.54 (ANY optimallashtirish):", 1040, 635, { size: 19, weight: 700, color: C.purple, fam: UI });
        text("   Faqat ANALYZE qilingan va takrorlar soni >= 18 bo'lsa.", 1040, 665, { size: 17, color: C.ink, fam: UI });

        sline(1040, 705, 1740, 705, { col: C.pencil, w: 1 });
        pill("Chap ustunda qiymatlar kam bo'lishi shart", 1390, 765, C.green, kSys, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 45.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Skip Scan Cheklovi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Agar chap ustunda minglab xil qiymatlar bo'lsa, har bir qiymatga sakrash juda ko'p IO talab qiladi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Bunday holatda baza skip scan'dan voz kechib jadvalni to'liq o'qishni afzal ko'radi. Shuning uchun skip scan'ga ko'r-ko'rona suyanmang.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. ORDER BY VA DESCENDING (48.32 -> 62.99s)
  function sOrderBy(t) {
    heading("ORDER BY Saralash va Descending Indeks", t, TM.scenes.order_by_va_descending.s);

    const kCards = P(t, TM.scenes.order_by_va_descending.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Bir yo'nalishli saralash
      card(140, 380, 780, 420, { fill: C.card, col: C.green, p: kCards });
      text("Bir Xil Yo'nalish: Qo'shimcha Sortsiz!", 180, 430, { size: 23, weight: 700, color: C.green, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("Indeks: (bolim, familiya)", 180, 495, { size: 18, weight: 700, fam: MONO, color: C.ink });
      text("1. Oldinga saralash (ASC, ASC):", 180, 535, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   ORDER BY bolim, familiya LIMIT 5", 180, 565, { size: 17, fam: MONO, color: C.green });
      text("   -> Index Scan on xodimlar (saralash vaqti: 0 ms) ✓", 180, 595, { size: 16, color: C.soft, fam: UI });

      text("2. Orqaga saralash (DESC, DESC):", 180, 635, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   ORDER BY bolim DESC, familiya DESC LIMIT 5", 180, 665, { size: 16, fam: MONO, color: C.green });
      text("   -> Index Scan Backward (teskari o'qish: 0 ms) ✓", 180, 695, { size: 16, color: C.soft, fam: UI });
      pill("B-Tree oldinga va orqaga birdek tez o'qiladi", 530, 765, C.green, kCards, 16);

      // O'ng: Aralash yo'nalish va Descending indeks
      const kDesc = P(t, 56.5, 0.8);
      withA(kDesc, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.orange, p: kDesc });
        text("Aralash Yo'nalish: (bolim ASC, familiya DESC)", 1040, 430, { size: 21, weight: 700, color: '#fab387', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. Oddiy (bolim, familiya) indeksida:", 1040, 495, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
        text("   -> Incremental Sort (PG) yoki Sort + Table Scan (MySQL)", 1040, 525, { size: 15, fam: MONO, color: '#f38ba8' });
        text("   (Aralash yo'nalishni bitta o'tishda o'qib bo'lmaydi)", 1040, 555, { size: 16, fam: UI, color: '#a6adc8' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("2. Yechim: Maxsus Descending Indeks!", 1040, 620, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("   CREATE INDEX ON xodimlar (bolim, familiya DESC);", 1040, 655, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("   -> Index Scan using x_bolim_fam_desc (Sort yo'q!) ✓", 1040, 690, { size: 16, fam: MONO, color: '#89b4fa' });
        pill("Aralash saralash uchun maxsus yo'nalishli indeks", 1390, 765, C.orange, kDesc, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 59.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Saralashda Indeks Ahamiyati:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("ORDER BY ... LIMIT so'rovlarida indeks bo'lsa, butun jadvalni saralamasdan birinchi N ta qator darhol olinadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Aralash tartib (biri o'suvchi, biri kamayuvchi) kerak bo'lsa, indeksni ham aynan shu tartibda yarating.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. OR VA BITMAP BIRLASHTIRISH (62.99 -> 80.86s)
  function sOrVaBitmap(t) {
    heading("OR Shartlari va Indekslarni Birlashtirish (Bitmap Scan)", t, TM.scenes.or_va_bitmap_birlashtirish.s);

    const kCards = P(t, TM.scenes.or_va_bitmap_birlashtirish.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Nega bitta ko'p ustunli indeks yaramaydi
      card(140, 380, 780, 420, { fill: C.card, col: C.red, p: kCards });
      text("Nega Bitta Ko'p Ustunli Indeks OR ga Yaramaydi?", 180, 430, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("So'rov: WHERE bolim = 5 OR boy = 199;", 180, 495, { size: 18, weight: 700, fam: MONO, color: C.red });
      text("Indeks: (bolim, boy)", 180, 530, { size: 17, fam: MONO, color: C.ink });

      sline(180, 560, 880, 560, { col: C.pencil, w: 1 });
      text("• 'bolim = 5' bo'lgan qatorlar daraxtning bir joyida.", 180, 600, { size: 18, color: C.ink, fam: UI });
      text("• 'boy = 199' bo'lgan boshqa bo'limlar esa butun daraxtda!", 180, 635, { size: 18, weight: 600, color: C.red, fam: UI });
      text("• Bitta B-tree skanerlashi ikkala novdani qamrab ololmaydi.", 180, 670, { size: 18, color: C.ink, fam: UI });
      text("• Natija: Ko'p ustunli indeks OR shartida ishlamaydi ✗", 180, 705, { size: 18, weight: 700, color: C.red, fam: UI });
      pill("Bitta indeks OR shartiga yaramaydi", 530, 765, C.red, kCards, 16);

      // O'ng: Alohida indekslar va BitmapOr
      const kBit = P(t, 71.0, 0.8);
      withA(kBit, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kBit });
        text("Yechim: BitmapOr (PostgreSQL) / Index Merge (MySQL)", 1040, 430, { size: 20, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. Indeks 1: Bitmap Index Scan on x_bolim", 1040, 495, { size: 17, fam: MONO, color: '#89b4fa' });
        text("   -> 'bolim = 5' qatorlari xotirada bit-xaritaga olinadi", 1040, 525, { size: 16, fam: UI, color: '#cdd6f4' });

        text("2. Indeks 2: Bitmap Index Scan on x_boy", 1040, 565, { size: 17, fam: MONO, color: '#a6e3a1' });
        text("   -> 'boy = 199' qatorlari alohida bit-xaritaga olinadi", 1040, 595, { size: 16, fam: UI, color: '#cdd6f4' });

        text("3. Xotirada: BitmapOr (xaritalar birlashtiriladi)", 1040, 635, { size: 17, weight: 700, fam: MONO, color: '#fab387' });
        text("4. Jadvaldan faqat mos bloklar fizik tartibda o'qiladi:", 1040, 670, { size: 17, fam: UI, color: '#cdd6f4' });
        text("   -> Bitmap Heap Scan on xodimlar ✓", 1040, 700, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        pill("Ikkala indeks birlashtirilib jadval bir marta o'qiladi", 1390, 765, C.green, kBit, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 75.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Xulosa: Qachon Ko'p Ustunli, Qachon Alohida Indeks?", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Doimiy AND shartlari va tartiblangan ORDER BY uchun ko'p ustunli bitta indeks eng tezkori hisoblanadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Alohida yoki OR shartlari bilan qidiriladigan ustunlar uchun esa alohida indekslar va ularni birlashtirish ma'qul.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.chap_ustunlar_qoidasi.s) {
      sKopUstunliTuzilma(t);
    } else if (t < TM.scenes.skip_scan_mexanikasi.s) {
      sChapUstunlar(t);
    } else if (t < TM.scenes.order_by_va_descending.s) {
      sSkipScan(t);
    } else if (t < TM.scenes.or_va_bitmap_birlashtirish.s) {
      sOrderBy(t);
    } else {
      sOrVaBitmap(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
