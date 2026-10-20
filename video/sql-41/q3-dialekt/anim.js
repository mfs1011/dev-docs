// SQL 41-bob 3-qism: "Dialektlar" — Indeks qanday ishlaydi
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

  // 1. MYSQL VA INNODB QOPLAMASI (0 -> 14.88s)
  function sMysqlVaInnodb(t) {
    const k = P(t, 0.3, 1.0);
    hand("41-bob. Dialektlar Bo'yicha Farqlar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("MySQL InnoDB: Birlamchi Kalit va Qoplash", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL 9.7: Table scan vs Index lookup va InnoDB Klasterli tuzilmasi", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: MySQL EXPLAIN FORMAT=TREE
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kBox });
      text("MySQL 9.7: EXPLAIN FORMAT=TREE", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("1. Indekssiz so'rov:", 180, 495, { size: 18, fam: UI, color: '#cdd6f4' });
      text("-> Filter: (mijoz_id = 777)  (cost=20118)", 180, 525, { size: 16, fam: MONO, color: '#f38ba8' });
      text("    -> Table scan on buyurtmalar", 180, 555, { size: 16, fam: MONO, color: '#f38ba8' });

      sline(180, 580, 880, 580, { col: '#45475a', w: 1 });
      text("2. mijoz_id indeksidan keyin:", 180, 615, { size: 18, fam: UI, color: '#cdd6f4' });
      text("-> Index lookup on buyurtmalar using mijoz_idx", 180, 645, { size: 16, fam: MONO, color: '#a6e3a1' });
      text("   (mijoz_id = 777)  (cost=3.5 rows=10)", 180, 675, { size: 16, fam: MONO, color: '#a6e3a1' });
      pill("Cost: 20118 dan 3.5 ga tushdi", 530, 765, C.blue, kBox, 16);

      // O'ng: InnoDB Klasterli tuzilma va avto-qoplash
      const kCov = P(t, 7.5, 0.8);
      withA(kCov, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kCov });
        text("InnoDB Siri: Har Bir Indeksda PK Bor!", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("EXPLAIN FORMAT=TREE", 1040, 495, { size: 17, fam: MONO, color: '#89b4fa' });
        text("SELECT id FROM buyurtmalar WHERE mijoz_id = 777;", 1040, 525, { size: 16, fam: MONO, color: '#cdd6f4' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("Natija: Avtomatik Covering Index!", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Covering index lookup on buyurtmalar", 1040, 625, { size: 17, fam: MONO, color: '#a6e3a1' });
        text("   using mijoz_idx (mijoz_id = 777) (cost=2.01)", 1040, 655, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("• Sabab: InnoDB ikkilamchi indeks bargida", 1040, 695, { size: 17, fam: UI, color: '#cdd6f4' });
        text("  birlamchi kalit 'id' doimo birga saqlanadi!", 1040, 725, { size: 17, weight: 600, fam: UI, color: '#89b4fa' });
        pill("Covering index lookup using mijoz_idx", 1390, 765, C.green, kCov, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 11.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("InnoDB Qoplash Afzalligi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("InnoDB'da ikkilamchi indeks faqat 'mijoz_id' ga qurilgan bo'lsa ham, birlamchi kalit 'id' ni so'rash", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("hech qachon asosiy klasterli jadvalga bormaydi. Indeksning o'zi so'rovni to'liq qoplaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. REJALASHTIRUVCHI XATOSI VA IGNORE INDEX (14.88 -> 31.45s)
  function sRejalashtiruvchiXatosi(t) {
    heading("Rejalashtiruvchi Xato Qilganda: IGNORE INDEX Bilan Tuzatish", t, TM.scenes.rejalashtiruvchi_xatosi_va_ignore_index.s);

    const kCards = P(t, TM.scenes.rejalashtiruvchi_xatosi_va_ignore_index.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Rejalashtiruvchi xatosi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kCards });
      text("MySQL Xatosi: 98% Qatorda Indeks Tanlandi", 180, 430, { size: 22, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("WHERE holat = 'yopilgan'  (196 000 ta qator):", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("• Rejalashtiruvchi taxmini: 99 907 qator kutdi.", 180, 530, { size: 17, fam: UI, color: '#f38ba8' });
      text("• Noto'g'ri hisob tufayli INDEKSNI TANLADI ✗", 180, 565, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });

      sline(180, 600, 880, 600, { col: '#45475a', w: 1 });
      text("EXPLAIN ANALYZE Haqiqiy Vaqti:", 180, 635, { size: 18, weight: 700, fam: UI, color: '#cdd6f4' });
      text("-> Index lookup (actual time=88.5 ms)", 180, 670, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });
      text("   (196 000 marta jadvalga sakrash juda qimmat!)", 180, 705, { size: 16, fam: UI, color: '#a6adc8' });
      pill("Indeks bilan: ~90 ms (3x sekin)", 530, 765, C.red, kCards, 16);

      // O'ng: IGNORE INDEX yechimi
      const kFix = P(t, 23.5, 0.8);
      withA(kFix, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kFix });
        text("Yechim: IGNORE INDEX Buyrug'i", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT sum(summa) FROM buyurtmalar", 1040, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
        text("IGNORE INDEX (buyurtmalar_holat_idx)", 1040, 525, { size: 17, weight: 700, fam: MONO, color: '#fab387' });
        text("WHERE holat = 'yopilgan';", 1040, 555, { size: 17, fam: MONO, color: '#cdd6f4' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("EXPLAIN ANALYZE Haqiqiy Vaqti:", 1040, 620, { size: 18, weight: 700, fam: UI, color: '#cdd6f4' });
        text("-> Table scan (actual time=26.1 ms) ✓", 1040, 655, { size: 18, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   (Ketma-ket o'qish 3 baravar tezroq tugadi!)", 1040, 690, { size: 17, fam: UI, color: '#a6adc8' });
        pill("IGNORE INDEX: ~30 ms (3x tez)", 1390, 765, C.green, kFix, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 27.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("Hujjat Tavsiyasi: Rejalashtiruvchiga Ko'r-ko'rona Ishonmang!", 180, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("Rejalashtiruvchi statistikadagi o'rtacha qiymatlarga tayanib noaniq qaror qabul qilishi mumkin.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Shuning uchun so'rovlarni doimo EXPLAIN ANALYZE orqali haqiqiy vaqt bilan o'lchash shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. SQLITE ROWID VA NOT INDEXED (31.45 -> 47.72s)
  function sSqliteRowid(t) {
    heading("SQLite: SCAN vs SEARCH, rowid va NOT INDEXED", t, TM.scenes.sqlite_rowid_va_not_indexed.s);

    const kCards = P(t, TM.scenes.sqlite_rowid_va_not_indexed.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: SQLite EXPLAIN QUERY PLAN
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kCards });
      text("SQLite 3.54: EXPLAIN QUERY PLAN", 180, 430, { size: 22, weight: 700, color: '#89b4fa', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("1. To'liq skanerlash:", 180, 495, { size: 18, fam: UI, color: '#cdd6f4' });
      text("   `--SCAN buyurtmalar", 180, 525, { size: 17, fam: MONO, color: '#f38ba8' });

      text("2. Birlamchi kalit (INTEGER PRIMARY KEY):", 180, 565, { size: 18, fam: UI, color: '#cdd6f4' });
      text("   `--SEARCH ... USING INTEGER PRIMARY KEY (rowid=?)", 180, 595, { size: 16, fam: MONO, color: '#a6e3a1' });

      text("3. Mijoz indeksi orqali qidiruv:", 180, 635, { size: 18, fam: UI, color: '#cdd6f4' });
      text("   `--SEARCH ... USING INDEX buyurtmalar_mijoz_idx", 180, 665, { size: 16, fam: MONO, color: '#89b4fa' });
      pill("SCAN = Seq Scan | SEARCH = Index/rowid", 530, 765, C.blue, kCards, 16);

      // O'ng: SQLite Qoplash va NOT INDEXED
      const kNot = P(t, 40.0, 0.8);
      withA(kNot, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kNot });
        text("SQLite Qoplash va NOT INDEXED", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("SELECT id FROM buyurtmalar WHERE mijoz_id = 777;", 1040, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("--> SEARCH USING COVERING INDEX", 1040, 525, { size: 17, fam: MONO, color: '#a6e3a1' });
        text("(Chunki SQLite indeksida rowid doim bor)", 1040, 555, { size: 16, fam: UI, color: '#a6adc8' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("NOT INDEXED Ishorasi (98% holatda):", 1040, 620, { size: 18, weight: 700, fam: UI, color: '#fab387' });
        text("FROM buyurtmalar NOT INDEXED WHERE holat='yopilgan'", 1040, 655, { size: 15, fam: MONO, color: '#cdd6f4' });
        text("• Indeks bilan: ~7.2 ms  -->  NOT INDEXED: ~5.6 ms", 1040, 690, { size: 17, weight: 600, fam: UI, color: '#a6e3a1' });
        pill("NOT INDEXED = to'liq skanerlashga majburlash", 1390, 765, C.green, kNot, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 44.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("SQLite Indeks Tuzilmasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("SQLite'da INTEGER PRIMARY KEY ustuni to'g'ridan-to'g'ri 'rowid' bo'lib, jadvalning o'zi B-tree hisoblanadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Har bir ikkilamchi indeks orqasida esa rowid turadi. Shu sababli ikkilamchi indeks id so'rovlarini qoplaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. SOLISHTIRMA VA TIPIK XATOLAR (47.72 -> 65.14s)
  function sSolishtirmaVaXatolar(t) {
    heading("Dialektlar Taqqoslashi va Indekslashdagi Tipik Xatolar", t, TM.scenes.solishtirma_va_tipik_xatolar.s);

    const kCards = P(t, TM.scenes.solishtirma_va_tipik_xatolar.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Dialektlar jadvali
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("3 Ta Dvigatel Bo'yicha Qisqacha Xulosa:", 180, 430, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Indeks turi: Barchasida sukut bo'yicha B-tree.", 180, 495, { size: 19, color: C.ink, fam: UI });
      text("• Jadval saqlanishi:", 180, 535, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("  PG: Heap jadval | MySQL: Klasterli PK | SQLite: rowid", 180, 565, { size: 17, fam: MONO, color: C.blue });

      text("• Rejani ko'rish buyrug'i:", 180, 605, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("  PG: EXPLAIN | MySQL: FORMAT=TREE | SQLite: QUERY PLAN", 180, 635, { size: 17, fam: MONO, color: C.purple });

      text("• Indeksni bekor qilish ishorasi:", 180, 675, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("  PG: enable_*=off | MySQL: IGNORE INDEX | SQLite: NOT INDEXED", 180, 705, { size: 16, fam: MONO, color: C.green });
      pill("Barchasida B-tree daraxti asos bo'ladi", 530, 765, C.blue, kCards, 16);

      // O'ng: Tipik xatolar
      const kMistakes = P(t, 55.5, 0.8);
      withA(kMistakes, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.red, p: kMistakes });
        text("Indekslashdagi Eng Katta Xatolar:", 1040, 430, { size: 22, weight: 700, color: C.red, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. 'Har bir ustunga indeks qo'yish':", 1040, 495, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Yozish 2-3 baravar sekinlashadi, disk hajmi 75% ortadi.", 1040, 525, { size: 17, color: C.ink, fam: UI });

        text("2. WHERE da ustun ustida amal bajarish:", 1040, 560, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   WHERE id + 0 = 777 yoki DATE(sana) indeksni o'chiradi.", 1040, 590, { size: 17, color: C.ink, fam: UI });

        text("3. MySQL'da satr ustunini son bilan solishtirish:", 1040, 625, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Tip nomuvofiqligi indeksdan foydalanishni bekor qiladi.", 1040, 655, { size: 17, color: C.ink, fam: UI });

        text("4. Ishlatilmaydigan (idx_scan = 0) indekslarni saqlash:", 1040, 690, { size: 18, weight: 700, color: C.red, fam: UI });
        text("   Foydasiz indekslarni monitoring qilib darhol o'chiring!", 1040, 720, { size: 17, color: C.ink, fam: UI });
        pill("Keraksiz indekslarni o'chiring", 1390, 765, C.red, kMistakes, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 60.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Oltin Xulosa: EXPLAIN ANALYZE Bilan Doimo Vaqtni O'lchang!", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Indeks shunchaki sehrli tugma emas. U o'qishni tezlashtiruvchi, lekin yozish va xotira narxiga ega bo'lgan vosita.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Har bir indeksni faqat real profayling va statistikaga asoslanib yarating.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.rejalashtiruvchi_xatosi_va_ignore_index.s) {
      sMysqlVaInnodb(t);
    } else if (t < TM.scenes.sqlite_rowid_va_not_indexed.s) {
      sRejalashtiruvchiXatosi(t);
    } else if (t < TM.scenes.solishtirma_va_tipik_xatolar.s) {
      sSqliteRowid(t);
    } else {
      sSolishtirmaVaXatolar(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
