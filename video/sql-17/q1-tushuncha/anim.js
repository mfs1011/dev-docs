// SQL 17-bob 1-qism: "Tushuncha" — View va Materialized View
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
    hand("17-bob. Tushuncha", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("View va Materialized View", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Virtual So'rovlar, Yangilanadigan Viewlar va Tezkor Kesh", 960, 375, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 410, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'vyular,'), 0.8);
    withA(kBadges, () => {
      pill("1. VIEW (Virtual)", 360, 540, C.blue, kBadges, 20);
      pill("2. UPDATABLE VIEW", 760, 540, C.green, kBadges, 20);
      pill("3. WITH CHECK OPTION", 1160, 540, C.purple, kBadges, 20);
      pill("4. MATERIALIZED VIEW", 1560, 540, C.orange, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'materialayzd'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu darsda ma'lumotlar bazasida view'larning o'rni va afzalliklarini ko'rib chiqamiz:", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Oddiy view qanday qilib murakkab jadvallarni o'zgarmas interfeys ortiga yashirishi,", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("View orqali xavfsiz yozish qoidalari hamda materialized view yordamida tezyurar kesh yaratishni o'rganamiz.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. VIEW TUSHUNCHASI
  function sViewTushunchasi(t) {
    heading("View: Nomlangan Virtual So‘rov", t, TM.scenes.view_tushunchasi.s);

    const k1 = P(t, W('L2', 'Vyu'), 0.6);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("View Nima?", 180, 280, { size: 30, color: C.blue, p: k1 });

      card(180, 320, 700, 170, { fill: '#fff', col: C.blue, p: k1 });
      text("Nomlangan SQL So'rovi (Named Query):", 210, 365, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• CREATE VIEW faol_mahsulotlar AS SELECT ...", 210, 410, { size: 19, fam: MONO, color: C.ink, wrap: 640 });
      text("• Diskda alohida jadval yoki ma'lumot fayli ochilmaydi (0 bayt).", 210, 455, { size: 18, color: C.soft, wrap: 640 });

      card(180, 510, 700, 160, { fill: '#fff', col: C.purple, p: k1 });
      text("Har Doim Yangi Natija:", 210, 555, { size: 20, weight: 700, color: C.purple, wrap: 640 });
      text("• View'ga SELECT qilinganda, uning tagidagi so'rov o'sha lahzada qayta bajariladi.", 210, 600, { size: 18, color: C.ink, wrap: 640 });
      text("• Asosiy jadvaldagi o'zgarishlar view'da bir zumda aks etadi.", 210, 640, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L2', 'interfeys'), 0.6);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.green, p: k2 });
      hand("Asosiy Afzalliklari", 1000, 280, { size: 30, color: C.green, p: k2 });

      card(1000, 320, 740, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. O'zgarmas Interfeys (Abstraction):", 1030, 365, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• Ilova jadvallarning ichki murakkab tuzilmasi bilan emas, toza view bilan ishlaydi.", 1030, 410, { size: 18, color: C.ink, wrap: 680 });
      text("• Jadvallar bo'linsa yoki o'zgartirilsa ham, view interfeysi o'zgarmas qoladi.", 1030, 450, { size: 18, color: C.soft, wrap: 680 });

      card(1000, 500, 740, 170, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Xavfsizlik va Ruxsatlar Cheklovi:", 1030, 545, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• Foydalanuvchiga butun jadvalga emas, faqat kerakli ustun va qatorlarni o'z ichiga olgan view'ga ruxsat berish mumkin.", 1030, 595, { size: 18, color: C.ink, wrap: 680 });
      text("• Masalan: maxfiy narx yoki parol maydonlarini tashqariga chiqarmaslik.", 1030, 640, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L2', 'bajariladi.'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Xulosa:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("View — bu virtual oyna bo'lib, har gal chaqirilganda asosiy jadvallardagi joriy ma'lumotni hisoblab ko'rsatib beradi.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. UPDATABLE VA CHECK
  function sUpdatableVaCheck(t) {
    heading("Yangilanadigan View va WITH CHECK OPTION", t, TM.scenes.updatable_va_check.s);

    const k1 = P(t, W('L3', 'Oddiy'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Qachon View Yangilanadi (Updatable)?", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 330, 700, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Ruxsat Berilgan Shartlar:", 210, 375, { size: 20, weight: 700, color: C.green, wrap: 640 });
      text("• FROM qismida faqat BITTA asosiy jadval bo'lishi kerak.", 210, 420, { size: 18, color: C.ink, wrap: 640 });
      text("• View orqali INSERT, UPDATE, DELETE qilinsa, o'zgarish asosiy jadvalga yoziladi.", 210, 460, { size: 18, color: C.soft, wrap: 640 });

      card(180, 510, 700, 160, { fill: '#fff', col: C.red, p: k1 });
      text("Taqiqlangan Elementlar:", 210, 555, { size: 20, weight: 700, color: C.red, wrap: 640 });
      text("• GROUP BY, HAVING, DISTINCT, LIMIT, OFFSET bo'lsa — yangilanmaydi.", 210, 600, { size: 18, color: C.ink, wrap: 640 });
      text("• UNION, INTERSECT yoki agregat funksiyali viewlar faqat o'qish uchun.", 210, 640, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L3', 'chek'), 0.5);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("WITH CHECK OPTION Xavfsizligi", 1000, 280, { size: 28, color: C.purple, p: k2 });

      card(1000, 330, 740, 165, { fill: '#fff', col: C.red, p: k2 });
      text("Muammo (CHECK OPTION bo'lmasa):", 1030, 375, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• WHERE narx < 5000 view'i orqali narxi 90,000 bo'lgan mahsulot kiritilsa, u asosiy jadvalga tushadi, lekin view'dan 'yo'qolib' qoladi!", 1030, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• Ilova o'zi qo'shgan qatorni ko'ra olmay chalkashadi.", 1030, 465, { size: 17, color: C.soft, wrap: 680 });

      card(1000, 515, 740, 160, { fill: '#fff', col: C.green, p: k2 });
      text("Yechim: WITH CHECK OPTION:", 1030, 560, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• View chegarasidan tashqariga chiqadigan har qanday INSERT yoki UPDATE ni BAZA RAD ETADI.", 1030, 605, { size: 18, weight: 700, color: C.green, wrap: 680 });
      text("• Natijada faqat view'da ko'rinadigan to'g'ri ma'lumotlar saqlanadi.", 1030, 645, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L3', 'rad'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Oltin Qoida:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("Filtrlangan view orqali ma'lumot kiritish rejalashtirilgan bo'lsa, adashib noto'g'ri ma'lumot tushib qolmasligi uchun doimo WITH CHECK OPTION qo'llang.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. MATERIALIZED VIEW
  function sMaterializedView(t) {
    heading("Materialized View va REFRESH Mexanizmi", t, TM.scenes.materialized_view.s);

    const k1 = P(t, W('L4', 'Materialayzd'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 480, { fill: C.card, col: C.orange, p: k1 });
      hand("Materialized View Arxitekturasi", 180, 280, { size: 28, color: C.orange, p: k1 });

      card(180, 330, 700, 160, { fill: '#fff', col: C.orange, p: k1 });
      text("Natija Diskda Jadvaldek Saqlanadi:", 210, 375, { size: 20, weight: 700, color: C.orange, wrap: 640 });
      text("• Og'ir agregatsiya va millionlab qatorli JOIN natijalari oldindan hisoblanib diskka yoziladi.", 210, 420, { size: 18, color: C.ink, wrap: 640 });
      text("• O'qish so'rovlari millisekundlarda, oddiy jadvaldek chaqmoqdek tez ishlaydi.", 210, 460, { size: 18, color: C.soft, wrap: 640 });

      card(180, 510, 700, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("Ma'lumot Yangiligi (Statiklik):", 210, 555, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• Asosiy jadval o'zgargani bilan materialized view o'z-o'zidan yangilanmaydi.", 210, 600, { size: 18, color: C.ink, wrap: 640 });
      text("• Uni qayta hisoblash uchun alohida buyruq berish lozim.", 210, 640, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L4', 'refresh'), 0.5);
    withA(k2, () => {
      card(960, 220, 820, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("REFRESH va CONCURRENTLY", 1000, 280, { size: 28, color: C.purple, p: k2 });

      card(1000, 330, 740, 165, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Oddiy REFRESH MATERIALIZED VIEW:", 1030, 375, { size: 20, weight: 700, color: C.blue, wrap: 680 });
      text("• Mazmunni to'liq yangisiga almashtiradi, tezroq bajariladi.", 1030, 420, { size: 18, color: C.ink, wrap: 680 });
      text("• Lekin yangilanish davomida o'qish so'rovlarini to'xtatib qo'yadi (Exclusive lock).", 1030, 460, { size: 18, color: C.soft, wrap: 680 });

      card(1000, 515, 740, 160, { fill: '#fff', col: C.green, p: k2 });
      text("2. REFRESH ... CONCURRENTLY:", 1030, 560, { size: 20, weight: 700, color: C.green, wrap: 680 });
      text("• Foydalanuvchilar o'qishini to'xtatmasdan fonga yangilaydi!", 1030, 605, { size: 18, weight: 700, color: C.green, wrap: 680 });
      text("• Majburiy shart: Materialized view ustida kamida bitta UNIQUE indeks bo'lishi shart.", 1030, 645, { size: 17, color: C.soft, wrap: 680 });
    });

    const kDesc = P(t, W('L4', 'boriladi.'), 0.5);
    withA(kDesc, () => {
      card(140, 730, 1640, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Amaliy Maslahat:", 180, 780, { size: 26, color: C.blue, p: kDesc });
      text("Ishlab turgan (production) tizimlarda kunlik yoki soatlik hisobotlarni yangilashda sayt to'xtab qolmasligi uchun doimo UNIQUE indeks va CONCURRENTLY qo'llang.", 180, 835, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa: View va Materialized View Taqqoslovi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L5', 'virtual'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("Oddiy View", 180, 290, { size: 30, color: C.blue, p: k1 });

      card(180, 330, 700, 540, { fill: '#fff', col: C.blue, p: k1 });
      text("• Saqlash: Diskda 0 bayt, faqat so'rov matni saqlanadi.", 210, 385, { size: 19, weight: 700, color: C.blue, wrap: 640 });
      text("• Yangilik darajasi: Har doim 100% yangi ma'lumot (onlayn).", 210, 445, { size: 19, color: C.ink, wrap: 640 });
      text("• Tezlik: Har gal so'rov qayta hisoblanadi (jadval tezligida).", 210, 505, { size: 19, color: C.soft, wrap: 640 });
      text("• Yozish imkoniyati: Oddiy viewlar orqali INSERT/UPDATE mumkin.", 210, 565, { size: 19, color: C.ink, wrap: 640 });
      text("• Xavfsizlik: WITH CHECK OPTION chegaralarni mustahkamlaydi.", 210, 625, { size: 19, color: C.green, weight: 700, wrap: 640 });
      text("• Maqsad: Abstraksiya, toza interfeys va kirish ruxsatlarini boshqarish.", 210, 685, { size: 19, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L5', 'Materialayzd'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 680, { fill: C.card, col: C.orange, p: k2 });
      hand("Materialized View", 1020, 290, { size: 30, color: C.orange, p: k2 });

      card(1020, 330, 720, 540, { fill: '#fff', col: C.orange, p: k2 });
      text("• Saqlash: Diskda to'liq jadval kabi joy egallaydi.", 1050, 385, { size: 19, weight: 700, color: C.orange, wrap: 660 });
      text("• Yangilik darajasi: REFRESH qilingan lahzadagi surat (snapshot).", 1050, 445, { size: 19, color: C.ink, wrap: 660 });
      text("• Tezlik: Juda yuqori (oldindan hisoblangan tayyor natija).", 1050, 505, { size: 19, color: C.green, weight: 700, wrap: 660 });
      text("• Yozish imkoniyati: To'g'ridan-to'g'ri INSERT/UPDATE qilib bo'lmaydi.", 1050, 565, { size: 19, color: C.red, wrap: 660 });
      text("• Yangilash: REFRESH yoki parallel REFRESH CONCURRENTLY.", 1050, 625, { size: 19, color: C.blue, weight: 700, wrap: 660 });
      text("• Maqsad: Og'ir dashboardlar, hisobotlar va tahliliy keshlar.", 1050, 685, { size: 19, color: C.soft, wrap: 660 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.view_tushunchasi.s) sIntro(t);
    else if (t < S.updatable_va_check.s) sViewTushunchasi(t);
    else if (t < S.materialized_view.s) sUpdatableVaCheck(t);
    else if (t < S.xulosa.s) sMaterializedView(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.view_tushunchasi.s + 5.0;
    frame(t);
  };
})();
