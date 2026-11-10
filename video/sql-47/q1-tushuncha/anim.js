// SQL 47-bob 1-qism: "Tushuncha" — Sekin so'rovlar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 18) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. FUNKSIYA VA IFODA INDEKSI (0 -> 17.72s)
  function sFunksiyaVaIfodaIndeksi(t) {
    const k = P(t, 0.3, 1.0);
    hand("47-bob. Sekin So'rovlar", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("Ustun Funksiya Ichida: Ifoda Indeksi", 960, 195, { size: 60, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Indeks bor, lekin rejalashtiruvchi undan nega foydalana olmaydi?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(260, 305, 1400 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Muammo
      card(140, 340, 780, 480, { fill: C.card, col: C.red, p: kBox });
      text("Muammo: Ustun Funksiya Bilan O'ralgan", 180, 390, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("WHERE lower(email) = 'mijoz500@misol.uz'", 180, 455, { size: 17, weight: 700, fam: MONO, color: C.red });
      text("WHERE extract(year FROM sana) = 2025", 180, 490, { size: 17, weight: 700, fam: MONO, color: C.red });

      srect(180, 520, 700, 130, { fill: '#fff2f0', stroke: C.red });
      text("Nega B-tree indeksi yordam bermaydi?", 200, 555, { size: 18, weight: 700, fam: UI, color: C.red });
      text("• Indeksda 'email' ning o'zi saqlangan, lower() natijasi emas.", 200, 590, { size: 16, fam: UI, color: C.ink, wrap: 660 });
      text("• Natija: Seq Scan — 100 000 qator to'liq o'qiladi (10 ms)!", 200, 620, { size: 16, weight: 700, fam: UI, color: C.red });

      text("Rejalashtiruvchi ifodaning statistikasini ham bilmaydi,", 180, 680, { size: 17, color: C.soft, fam: UI, wrap: 700 });
      text("shuning uchun qaytadigan qatorlar sonini ham adashtiradi.", 180, 710, { size: 17, color: C.soft, fam: UI, wrap: 700 });

      pill("Funksiya ustunning indeks kalitini yopib qo'yadi", 530, 780, C.red, kBox, 15);

      // O'ng: Yechim
      const kRight = P(t, 8.4, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.green, p: kRight });
        text("Yechim: Ifoda Indeksi yoki Oraliq Shart", 1040, 390, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("1-yo'l: Ifoda indeksi (Expression Index):", 1040, 455, { size: 18, weight: 700, color: C.green, fam: UI });
        srect(1040, 475, 700, 60, { fill: '#f6ffed', stroke: C.green });
        text("CREATE INDEX m_email_lower ON mijozlar (lower(email));", 1055, 510, { size: 15, fam: MONO, color: C.green });

        text("2-yo'l: Shartni oraliqqa aylantirish (Sana misoli):", 1040, 565, { size: 18, weight: 700, color: C.blue, fam: UI });
        srect(1040, 585, 700, 80, { fill: '#e6f7ff', stroke: C.blue });
        text("WHERE sana >= '2025-01-01' AND sana < '2026-01-01'", 1055, 620, { size: 15, fam: MONO, color: C.blue });
        text("Ustun yalang'och qoladi -> B-tree oralig'i ishlaydi!", 1055, 650, { size: 14, fam: UI, color: C.soft });

        text("Taqqoslash: Seq Scan 10 ms  vs  Index Scan 0.02 ms (400x tezroq)", 1040, 700, { size: 17, weight: 700, color: C.ink, fam: UI, wrap: 700 });

        pill("To'g'ri shart = 400 baravar tezlashuv", 1390, 780, C.green, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Oltin qoida: Ustunni o'z holicha (yalang'och) qoldiring yoki ifoda indeksi yarating!", 960, 905, { size: 23, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Funksiya indeksda saqlanmasa, baza har bitta qator uchun funksiyani qayta hisoblashga majbur bo'ladi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. YASHIRIN TUR O'ZGARISHI (17.72 -> 35.62s)
  function sYashirinTurOzgarishi(t) {
    heading("2. YASHIRIN TURNI O'ZGARTIRISH (IMPLICIT CASTING)", "Matn ustuni son bilan solishtirilganda nima yuz beradi?", t, TM.scenes.yashirin_tur_ozgarishi);

    const kCast = P(t, 18.5, 0.8);
    withA(kCast, () => {
      // Chap: PostgreSQL
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kCast });
      text("PostgreSQL: Qat'iy Tip Tekshiruvi", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE telefon = 998900000500;", 180, 355, { size: 14, fam: MONO, color: C.ink });

      srect(180, 390, 700, 140, { fill: '#fff2f0', stroke: C.red });
      text("ERROR: operator does not exist: text = bigint", 200, 425, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("HINT: No operator matches the given name and argument types.", 200, 455, { size: 14, fam: MONO, color: C.soft });
      text("You might need to add explicit type casts.", 200, 480, { size: 14, fam: MONO, color: C.soft });
      text("Postgres yashirin aylantirmaydi — darhol xato beradi!", 200, 510, { size: 15, weight: 700, color: C.red, fam: UI });

      text("Nega bu yaxshi va xavfsiz?", 180, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• Xato kod yozish paytidayoq fosh bo'ladi.", 180, 595, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Production bazada sekin so'rov bo'lib yashirinib yotmaydi.", 180, 630, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Qo'shtirnoq bilan yozilganda: Index Scan (0.016 ms)!", 180, 665, { size: 17, weight: 700, color: C.green, fam: UI, wrap: 700 });

      pill("Postgres qat'iy tiplar orqali kodingizni himoyalaydi", 530, 755, C.purple, kCast, 15);
    });

    const kMy = P(t, 26.5, 0.8);
    withA(kMy, () => {
      // O'ng: MySQL
      card(1000, 240, 780, 560, { fill: C.card, col: C.orange, p: kMy });
      text("MySQL: Yashirin Skanerlash Xavfi", 1040, 290, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id FROM mijozlar WHERE telefon = 998900000500;", 1040, 355, { size: 14, fam: MONO, color: C.ink });

      srect(1040, 390, 700, 140, { fill: '#fffbe6', stroke: C.orange });
      text("SHOW WARNINGS;", 1060, 420, { size: 15, weight: 700, fam: MONO, color: C.orange });
      text("Warning 1739: Cannot use ref access on index 'm_telefon'", 1060, 450, { size: 14, fam: MONO, color: C.ink });
      text("due to type or collation conversion on field 'telefon'", 1060, 475, { size: 14, fam: MONO, color: C.ink });
      text("100 000 qator to'liq skan qilindi! Vaqt: 9.8 ms", 1060, 505, { size: 16, weight: 700, fam: UI, color: C.red });

      text("Nega MySQL bunday qiladi?", 1040, 560, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• '1', ' 1', '1a' kabi satrlar ham 1 ga tenglashishi mumkin.", 1040, 595, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Shuning uchun har qatorni songa aylantirib chiqadi.", 1040, 630, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Ilovada bitta qo'shtirnoq unutilsa, so'rov 2400x sekinlashadi!", 1040, 665, { size: 17, weight: 700, color: C.red, fam: UI, wrap: 700 });

      pill("Yashirin tur o'zgarishi — sekin so'rovlarning 1-raqamli qotili", 1390, 755, C.orange, kMy, 15);
    });

    const kSum = P(t, 31.0, 0.8);
    withA(kSum, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kSum });
      text("Xulosa: Telefon, karta, pochta indeksi doim string bo'lsa, ilovadan ham string yuboring!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("ORM yoki API parametrida raqam emas, matn turi uzatilishini qat'iy nazorat qiling.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. OR SHARTI VA BITMAP (35.62 -> 54.08s)
  function sOrShartiVaBitmap(t) {
    heading("3. TURLI USTUNLARDA OR VA BITMAP'LAR", "Bitta indeks ikkala shartni qamray olmaydi — yechim nima?", t, TM.scenes.or_sharti_va_bitmap);

    const kOr = P(t, 36.5, 0.8);
    withA(kOr, () => {
      // Chap: OR muammosi
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kOr });
      text("OR Shartida Bitta Indeks Yetarli Emas", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("WHERE email = 'Mijoz7@...' OR telefon = '99890...'", 180, 355, { size: 16, weight: 700, fam: MONO, color: C.ink });

      srect(180, 395, 700, 130, { fill: '#fff2f0', stroke: C.red });
      text("Bitta indeks nima uchun ojiz?", 200, 430, { size: 18, weight: 700, fam: UI, color: C.red });
      text("• (email, telefon) kompozit indeksi faqat AND bo'lganda ishlaydi.", 200, 465, { size: 16, fam: UI, color: C.ink, wrap: 660 });
      text("• OR bo'lganda bir shart ikkinchi indeksda, boshqasi narigisida.", 200, 495, { size: 16, fam: UI, color: C.ink, wrap: 660 });

      text("Xavf: Agar ikkala ustunning bittasida indeks bo'lmasa:", 180, 560, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Masalan email'da indeks bor, lekin telefon'da yo'q.", 180, 595, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Rejalashtiruvchi indekslarni birlashtira olmaydi!", 180, 630, { size: 17, color: C.ink, fam: UI, wrap: 700 });
      text("• Butun jadval Seq Scan qilinishiga majbur bo'ladi.", 180, 665, { size: 17, weight: 700, color: C.red, fam: UI, wrap: 700 });

      pill("OR ning bitta oyog'i indekssiz bo'lsa — butun reja qulaydi", 530, 755, C.red, kOr, 15);
    });

    const kBit = P(t, 44.5, 0.8);
    withA(kBit, () => {
      // O'ng: BitmapOr yechimi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kBit });
      text("Yechim: BitmapOr va Index Merge", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("1. Bitmap Index Scan on m_email  -> [0, 1, 0, 0, ...]", 1060, 375, { size: 15, fam: MONO, color: C.ink });
      text("2. Bitmap Index Scan on m_telefon -> [0, 0, 0, 1, ...]", 1060, 410, { size: 15, fam: MONO, color: C.ink });
      text("3. BitmapOr (xotirada mantiqiy OR) -> [0, 1, 0, 1, ...]", 1060, 445, { size: 15, weight: 700, fam: MONO, color: C.blue });
      text("4. Bitmap Heap Scan: disk bloklari fizik tartibda 1 marta o'qiladi!", 1060, 480, { size: 14, weight: 700, fam: UI, color: C.green });

      text("Dialektlardagi nomlanishi:", 1040, 530, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• PostgreSQL: Bitmap Index Scan + BitmapOr", 1040, 565, { size: 17, fam: MONO, color: C.blue });
      text("• MySQL: Index Merge (Using union(m_email, m_telefon))", 1040, 600, { size: 17, fam: MONO, color: C.orange });
      text("• SQLite: MULTI-INDEX OR (har indeks alohida qidiriladi)", 1040, 635, { size: 17, fam: MONO, color: C.purple });

      text("Natija: 2 ta alohida indeks bilan OR so'rovi bor-yo'g'i 0.05 ms!", 1040, 680, { size: 17, weight: 700, color: C.green, fam: UI, wrap: 700 });

      pill("Ikkala ustunda alohida indeks bo'lsa, OR ham tez ishlaydi", 1390, 755, C.green, kBit, 15);
    });

    const kBot = P(t, 49.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Diqqat: BitmapOr indeks tartibini yo'qotadi!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Chunki bloklar xotirada fizik tartib bo'yicha saralanadi — ORDER BY bo'lsa alohida saralash talab etiladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. COUNT(*) VA MVCC (54.08 -> 76.02s)
  function sCountStarVaMvcc(t) {
    heading("4. COUNT(*) NEGA JADVAL HAJMIGA PROPORSIONAL?", "Nega bazalar qatorlar sonini bitta registrda saqlab qo'ymaydi?", t, TM.scenes.count_star_va_mvcc);

    const kMvcc = P(t, 55.0, 0.8);
    withA(kMvcc, () => {
      // Chap: MVCC sababi
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kMvcc });
      text("MVCC Sababli Qatorlar Soni O'zgaruvchan", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT count(*) FROM mijozlar;", 180, 355, { size: 16, weight: 700, fam: MONO, color: C.ink });

      srect(180, 395, 700, 140, { fill: '#e6f7ff', stroke: C.blue });
      text("Nega tayyor son (counter) saqlanmaydi?", 200, 430, { size: 18, weight: 700, fam: UI, color: C.blue });
      text("• Tranzaksiya A: Yangi qator qo'shdi (lekin COMMIT qilmadi).", 200, 465, { size: 15, fam: UI, color: C.ink, wrap: 660 });
      text("• Tranzaksiya B: Qatorni o'chirdi.", 200, 495, { size: 15, fam: UI, color: C.ink, wrap: 660 });
      text("• Har bir sessiya faqat o'ziga ko'rinadigan qatorlarni sanashi shart!", 200, 525, { size: 15, weight: 700, color: C.red, fam: UI });

      text("Bajarilish narxi:", 180, 570, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• 100 000 qator: Seq Scan (2.2 ms)", 180, 605, { size: 17, fam: MONO, color: C.ink });
      text("• 1 000 000 qator: Parallel Index Only Scan (12.4 ms)", 180, 640, { size: 17, fam: MONO, color: C.orange });
      text("• Jadval 10x kattalashsa, sarflanadigan vaqt ham 10x oshadi!", 180, 675, { size: 17, weight: 700, color: C.red, fam: UI });

      pill("COUNT(*) har bir qatorning ko'rinishini (visibility) tekshiradi", 530, 755, C.blue, kMvcc, 15);
    });

    const kSol = P(t, 64.0, 0.8);
    withA(kSol, () => {
      // O'ng: Amaliy yechimlar
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kSol });
      text("Amaliy Yechimlar va Muqobillar", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 100, { fill: '#f6ffed', stroke: C.green });
      text("1. Taxminiy son (Approximation) — Darhol javob:", 1060, 375, { size: 17, weight: 700, fam: UI, color: C.green });
      text("SELECT reltuples FROM pg_class WHERE relname='mijozlar';", 1060, 410, { size: 14, fam: MONO, color: C.ink });

      srect(1040, 460, 700, 100, { fill: '#fffbe6', stroke: C.orange });
      text("2. MySQL da SHOW TABLE STATUS:", 1060, 495, { size: 17, weight: 700, fam: UI, color: C.orange });
      text("InnoDB taxminiy Rows qiymatini millisekundsiz beradi.", 1060, 530, { size: 15, fam: UI, color: C.ink, wrap: 660 });

      text("3. Ilova darajasidagi hisoblagich (Counter table):", 1040, 590, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• Tranzaksiyalar har INSERT'da maxsus hisoblagichni oshiradi.", 1040, 625, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Sahifalashda (pagination) har safar COUNT(*) chaqirmang!", 1040, 660, { size: 17, weight: 700, color: C.red, fam: UI, wrap: 700 });

      pill("Sahifalashda cursor-based pagination yoki taxminiy son qo'llang", 1390, 755, C.green, kSol, 15);
    });

    const kFinal = P(t, 69.5, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Xulosa: Indeks borligi so'rov tez bo'lishini kafolatlamaydi!", 960, 885, { size: 21, weight: 700, color: C.red, fam: UI, align: 'center', wrap: 1300 });
      text("Shartlarni to'g'ri yozish va bazaning ichki ishlash mexanizmini tushunish sekin so'rovlarning oldini oladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.funksiya_va_ifoda_indeksi.e) {
      sFunksiyaVaIfodaIndeksi(t);
    } else if (t < TM.scenes.yashirin_tur_ozgarishi.e) {
      sYashirinTurOzgarishi(t);
    } else if (t < TM.scenes.or_sharti_va_bitmap.e) {
      sOrShartiVaBitmap(t);
    } else {
      sCountStarVaMvcc(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
