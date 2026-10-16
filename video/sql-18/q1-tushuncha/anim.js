// SQL 18-bob 1-qism: "Tushuncha" — INSERT, UPDATE, DELETE
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("18-bob. Tushuncha", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("INSERT, UPDATE, DELETE", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Relyatsion DML Asoslari, Xavfsiz WHERE va Ko'p Jadvalli O'zgartirishlar", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'di-em-el'), 0.8);
    withA(kBadges, () => {
      pill("1. INSERT (Faqat butun qator)", 360, 540, C.blue, kBadges, 20);
      pill("2. UPDATE & DELETE (Qat'iy WHERE)", 800, 540, C.red, kBadges, 20);
      pill("3. UPDATE FROM / DELETE USING", 1240, 540, C.purple, kBadges, 20);
      pill("4. VALUES Jadvali", 1600, 540, C.green, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'apdeyt'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion ma'lumotlar bazasida ma'lumotlar bilan ishlashning asosi — DML buyruqlaridir:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Qatorlarni xavfsiz kiritish va sukut bo'yicha qiymatlar taqsimoti,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("WHERE shartining nozikliklari hamda boshqa jadvallarga tayanib o'zgartirishdagi tuzoqlarni ko'rib chiqamiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. INSERT USULLARI
  function sInsertUsullari(t) {
    heading("INSERT: Butun Qator va Turli Usullar", t, TM.scenes.insert_usullari.s);

    const k1 = P(t, W('L2', 'Relyatsion'), 0.6);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Asosiy Qoida: Faqat Butun Qator", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("To'liq Bo'lmagan Qator Bo'lmaydi:", 210, 365, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• Bir nechta ustun ko'rsatilsa ham, baza to'liq qator yaratadi.", 210, 410, { size: 18, color: C.ink, wrap: 640 });
      text("• Ko'rsatilmagan barcha maydonlar DEFAULT yoki NULL qiymat oladi.", 210, 455, { size: 18, color: C.soft, wrap: 640 });

      card(180, 500, 700, 180, { fill: '#fff', col: C.green, p: k1 });
      text("Eng Yaxshi Amaliyot (Ustunlarni Sanash):", 210, 545, { size: 20, weight: 700, color: C.green, wrap: 640 });
      text("• INSERT INTO ombor (nom, narx) VALUES ('Non', 4000);", 210, 590, { size: 18, fam: MONO, color: C.blue, wrap: 640 });
      text("• Kelajakda jadvalga yangi ustun qo'shilsa ham, bu so'rov buzilmaydi.", 210, 635, { size: 17, color: C.ink, wrap: 640 });
    });

    const k2 = P(t, W('L2', 'sanab'), 0.6);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("INSERT Ko'rinishlari", 1000, 280, { size: 30, color: C.purple, p: k2 });

      card(1000, 320, 740, 100, { fill: '#fff', col: C.purple, p: k2 });
      text("1. Ko'p Qatorli VALUES (…), (…):", 1030, 360, { size: 19, weight: 700, color: C.purple, wrap: 680 });
      text("• Bitta tarmoq so'rovi bilan yuzlab qatorlarni bir yo'la kiritadi.", 1030, 395, { size: 17, color: C.ink, wrap: 680 });

      card(1000, 435, 740, 115, { fill: '#fff', col: C.blue, p: k2 });
      text("2. INSERT … SELECT So'rovi:", 1030, 470, { size: 19, weight: 700, color: C.blue, wrap: 680 });
      text("• Boshqa jadvaldan filtrlangan ma'lumotlarni arxiv jadvaliga ko'chiradi.", 1030, 510, { size: 17, color: C.ink, wrap: 680 });

      card(1000, 565, 740, 115, { fill: '#fff', col: C.green, p: k2 });
      text("3. INSERT INTO t DEFAULT VALUES:", 1030, 600, { size: 19, weight: 700, color: C.green, wrap: 680 });
      text("• Butun qatorni to'liq sukut bo'yicha qiymatlar bilan to'ldiradi.", 1030, 640, { size: 17, color: C.ink, wrap: 680 });
    });

    const kDesc = P(t, W('L2', 'asraydi.'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Oltin Qoida:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("Jadvaldagi ustunlar tartibiga aslo tayanmang. Doimo ustun nomlarini INSERT so'rovida aniq ko'rsatib yozing.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. UPDATE DELETE QOIDALARI
  function sUpdateDeleteQoidalari(t) {
    heading("UPDATE va DELETE: Qat’iy WHERE Shartlari", t, TM.scenes.update_delete_qoidalari.s);

    const k1 = P(t, W('L3', 'Apdeyt'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.red, p: k1 });
      hand("Katta Xavf: WHERE Bo'lmasa Nima Bo'ladi?", 180, 280, { size: 28, color: C.red, p: k1 });

      card(180, 330, 700, 160, { fill: '#fff', col: C.red, p: k1 });
      text("SQL So'ramasdan Bajaraveradi:", 210, 375, { size: 20, weight: 700, color: C.red, wrap: 640 });
      text("• UPDATE ombor SET narx = 0; -> BARCHA tovarlar narxi 0 bo'ladi!", 210, 420, { size: 18, color: C.ink, wrap: 640 });
      text("• DELETE FROM ombor; -> Jadvaldagi hamma qator o'chib ketadi!", 210, 460, { size: 18, color: C.red, wrap: 640 });

      card(180, 510, 700, 160, { fill: '#fff', col: C.orange, p: k1 });
      text("Ogohlantirish Yo'q:", 210, 555, { size: 20, weight: 700, color: C.orange, wrap: 640 });
      text("• SQL 'rostdan ham hammasini o'zgartirmoqchimisiz?' deb so'ramaydi.", 210, 600, { size: 18, color: C.ink, wrap: 640 });
      text("• Buyruq muvaffaqiyatli 'UPDATE 100000' qaytaradi.", 210, 640, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L3', 'birlamchi'), 0.5);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Xavfsiz Qator Tanlash", 1000, 280, { size: 28, color: C.green, p: k2 });

      card(1000, 330, 740, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. Birlamchi Kalit Bo'yicha WHERE:", 1030, 375, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• Bitta aniq qatorga murojaat qilishning yagona ishonchli yo'li — PRIMARY KEY.", 1030, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• WHERE mahsulot_id = 42 faqat 1 ta qatorni o'zgartirishni kafolatlaydi.", 1030, 460, { size: 17, color: C.soft, wrap: 680 });

      card(1000, 510, 740, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. UPDATE 0 Xato Emas:", 1030, 555, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• Agar WHERE shartiga birorta ham qator mos kelmasa, baza xato bermaydi.", 1030, 600, { size: 18, color: C.ink, wrap: 680 });
      text("• UPDATE 0 qaytaradi, bu odatiy holat.", 1030, 640, { size: 18, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L3', 'shart.'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Amaliy Maslahat:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ishlab turgan bazada UPDATE yoki DELETE bajarishdan oldin, xuddi shu WHERE shartini SELECT bilan tekshirib ko'rish eng foydali odatdir.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. BOSHQA JADVALLARGA TAYANISH
  function sBoshqaJadvallargaTayanish(t) {
    heading("UPDATE FROM va DELETE USING Xavflari", t, TM.scenes.boshqa_jadvallarga_tayanish.s);

    const k1 = P(t, W('L4', 'Postgres'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.purple, p: k1 });
      hand("Boshqa Jadvalga Tayanish", 180, 280, { size: 28, color: C.purple, p: k1 });

      card(180, 330, 700, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("PostgreSQL Kengaytmalari:", 210, 375, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• UPDATE ombor o SET soni = o.soni - k.jami FROM ...", 210, 420, { size: 18, fam: MONO, color: C.ink, wrap: 640 });
      text("• DELETE FROM sotuvlar s USING ombor o WHERE ...", 210, 460, { size: 18, fam: MONO, color: C.soft, wrap: 640 });

      card(180, 510, 700, 160, { fill: '#fff', col: C.green, p: k1 });
      text("To'g'ri Yondashuv: Jamlangan Subquery:", 210, 555, { size: 20, weight: 700, color: C.green, wrap: 640 });
      text("• Kunlik sotuvlarni mahsulot bo'yicha GROUP BY bilan jamlab ulaymiz.", 210, 600, { size: 18, color: C.ink, wrap: 640 });
      text("• Har bir ombor mahsulotiga aniq BITTA qator mos keladi.", 210, 640, { size: 17, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L4', 'ixtiyoriy'), 0.5);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.red, p: k2 });
      hand("Katta Tuzoq: Noaniq Birlashuv!", 1000, 280, { size: 28, color: C.red, p: k2 });

      card(1000, 330, 740, 165, { fill: '#fff', col: C.red, p: k2 });
      text("Agar Bir Nechta Mos Qator Bo'lsa:", 1030, 375, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• 1-mahsulotga 10 va 5 sonli ikkita sotuv qatori to'g'ri kelsa,", 1030, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• PostgreSQL ulardan IXTIYORIY BITTASINI jimgina tanlaydi!", 1030, 460, { size: 18, weight: 700, color: C.red, wrap: 680 });

      card(1000, 515, 740, 160, { fill: '#fff', col: C.orange, p: k2 });
      text("Xato Chiqmaydi, Natija Noto'g'ri:", 1030, 560, { size: 20, weight: 700, color: C.orange, wrap: 680 });
      text("• Qaysi biri olinishini oldindan aytib bo'lmaydi.", 1030, 605, { size: 18, color: C.ink, wrap: 680 });
      text("• Ombor qoldig'i 85 o'rniga 90 yoki 95 bo'lib, hisob-kitob buziladi.", 1030, 645, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L4', 'tug‘diradi.'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Xavfsizlik Qoidasi:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("UPDATE FROM da har bir maqsad qatoriga eng ko'pi bilan bitta qator mos kelishini ta'minlang, buning uchun doimo subquery va GROUP BY dan foydalaning.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Relyatsion DML Standartlari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L5', 'Xavfli'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("DML Xavfsizlik Qoidalari", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 330, 700, 540, { fill: '#fff', col: C.blue, p: k1 });
      text("• Ustunlarni sanab yozish: INSERT paytida doimo ustun nomlarini aniq ko'rsating.", 210, 385, { size: 19, weight: 700, color: C.blue, wrap: 640 });
      text("• Faqat butun qator: Chala qator bo'lmaydi, qolgan ustunlar DEFAULT oladi.", 210, 455, { size: 18, color: C.ink, wrap: 640 });
      text("• Qat'iy WHERE: Birlamchi kalitsiz shart berilsa bir nechta qator o'zgaradi.", 210, 525, { size: 18, color: C.red, weight: 700, wrap: 640 });
      text("• SELECT bilan tekshirish: UPDATE va DELETE dan oldin WHERE ni sinab ko'ring.", 210, 595, { size: 18, color: C.green, wrap: 640 });
      text("• Tranzaksiyada sinash: BEGIN; UPDATE ...; tekshirib keyin COMMIT yoki ROLLBACK.", 210, 665, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L5', 'jamlangan'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 680, { fill: C.card, col: C.purple, p: k2 });
      hand("Ko'p Jadvalli O'zgartirishlar", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 330, 720, 540, { fill: '#fff', col: C.purple, p: k2 });
      text("• UPDATE FROM (PostgreSQL): Boshqa jadval bilan birlashtirib yangilash.", 1050, 385, { size: 19, weight: 700, color: C.purple, wrap: 660 });
      text("• Noaniqlik xavfi: 1 ta qatorga ko'p qator mos kelsa, faqat 1 tasi olinadi.", 1050, 455, { size: 18, color: C.red, wrap: 660 });
      text("• Jamlangan Subquery: Doimo GROUP BY bilan 1:1 moslikka keltiring.", 1050, 525, { size: 18, color: C.green, weight: 700, wrap: 660 });
      text("• DELETE USING: Tashqi jadval shartlariga ko'ra tozalash.", 1050, 595, { size: 18, color: C.blue, wrap: 660 });
      text("• VALUES Jadvali: Alohida o'zi mustaqil qatorlar jadvali bo'la oladi.", 1050, 665, { size: 18, color: C.soft, wrap: 660 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.insert_usullari.s) sIntro(t);
    else if (t < S.update_delete_qoidalari.s) sInsertUsullari(t);
    else if (t < S.boshqa_jadvallarga_tayanish.s) sUpdateDeleteQoidalari(t);
    else if (t < S.xulosa.s) sBoshqaJadvallargaTayanish(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.insert_usullari.s + 5.0;
    frame(t);
  };
})();
