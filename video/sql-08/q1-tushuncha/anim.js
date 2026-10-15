// SQL 8-bob 1-qism: "Tushuncha" — Sana va vaqt tushunchalari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, codeCard, outCard, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO: Mahalliy vaqt va lahza
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("8-bob", 960, 210, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Sana va Vaqt Tushunchalari", 960, 310, { size: 90, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Mahalliy vaqt (Local Time) va Aniq Lahza (Instant)", 960, 410, { size: 44, align: 'center', p: P(t, 1.2, 1.2) });
    marker(440, 445, 1040 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kClocks = P(t, W('L2', 'to‘qqiz'), 0.8);
    withA(kClocks, () => {
      // Toshkent soati
      card(140, 490, 780, 260, { fill: C.card, col: C.blue, p: kClocks });
      pill("TOSHKENT: Asia/Tashkent (UTC+5)", 530, 545, C.blue, kClocks, 22);
      text("Devor soatida: 09:00:00", 180, 615, { size: 28, weight: 700, color: C.ink, wrap: 700 });
      text("Xalqaro UTC lahzasi: 04:00:00 UTC", 180, 670, { size: 25, fam: MONO, weight: 600, color: C.blue, wrap: 700 });
      text("Do'kon ochilishi, dars boshlanishi — mahalliy soat", 180, 715, { size: 20, color: C.soft, wrap: 700 });

      // London soati
      card(1000, 490, 780, 260, { fill: C.card, col: C.purple, p: kClocks });
      pill("LONDON: Europe/London (UTC+0)", 1390, 545, C.purple, kClocks, 22);
      text("Devor soatida: 09:00:00", 1040, 615, { size: 28, weight: 700, color: C.ink, wrap: 700 });
      text("Xalqaro UTC lahzasi: 09:00:00 UTC", 1040, 670, { size: 25, fam: MONO, weight: 600, color: C.purple, wrap: 700 });
      text("Toshkentdagi 09:00 bilan orasi 5 soat farq qiladi!", 1040, 715, { size: 20, color: C.soft, wrap: 700 });
    });

    const kBottom = P(t, W('L3', 'instant'), 0.8);
    withA(kBottom, () => {
      card(140, 780, 1640, 170, { fill: '#f0fdf4', col: C.green, p: kBottom });
      pill("IKKI XIL VAQT TUSHUNCHASI", 380, 825, C.green, kBottom, 20);
      text("1. Mahalliy vaqt: faqat kalendar va devor soatidagi raqam. Qaysi joy ekani noma'lum.", 180, 875, { size: 23, color: C.ink, wrap: 1560 });
      text("2. Lahza (Instant): butun koinotda yagona nuqta (masalan to'lov yoki xabar vaqti). UTC asosida belgilanadi.", 180, 915, { size: 23, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 2. TURLAR: PostgreSQL tiplari
  function sTurlar(t) {
    heading("PostgreSQL da Sana va Vaqt Turlari", t, L('L5').s - 0.4);

    const kTypes = P(t, W('L5', 'oltita'), 0.6);
    withA(kTypes, () => {
      table(140, 270, "", [
        { label: "Tip", w: 300 },
        { label: "Hajmi", w: 180 },
        { label: "Ma'nosi", w: 560 },
        { label: "Izoh", w: 600 }
      ], [
        ["date", "4 bayt", "Faqat sana (kun aniqligi)", "Masalan: '2026-10-12'"],
        ["time", "8 bayt", "Faqat kun vaqti (1 mikrosekund)", "Masalan: '09:00:00.123456'"],
        ["timestamp", "8 bayt", "Sana va vaqt, mintaqasiz", "Mintaqasiz kalendar vaqti"],
        ["timestamptz", "8 bayt", "Sana va vaqt, lahza sifatida", "UTC da saqlanadi (PostgreSQL kengaytmasi)"],
        ["interval", "16 bayt", "Vaqt oralig'i (oy, kun, mikrosekund)", "Masalan: '1 year 2 months 3 days'"]
      ], { p: kTypes });
    });

    const kWarn = P(t, W('L7', 'tavsiya'), 0.8);
    withA(kWarn, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kWarn });
      pill("OGOHLANTIRISH: time with time zone TAVSIYA ETILMAYDI", 520, 750, C.red, kWarn, 22);
      text("• SQL standartida time with time zone mavjud, lekin PostgreSQL rasmiy hujjati uni ishlatmaslikni tavsiya qiladi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Sababi: sanasiz faqat soat va zonani bilish yozgi vaqt (DST) qoidalarini aniqlashga yetarli emas!", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• Xulosa: mintaqa kerak bo'lsa, sana va vaqtni doimo birga saqlang — timestamptz ishlating.", 180, 905, { size: 22, color: C.soft, wrap: 1560 });
    });
  }

  // 3. TZ_FARQI: timestamp va timestamptz
  function sTzFarqi(t) {
    heading("timestamp va timestamptz Ning Asl Farqi", t, L('L8').s - 0.4);

    const kLeft = P(t, W('L8', 'timestamptz'), 0.6);
    const kRight = P(t, W('L10', 'tashlab'), 0.6);

    // Chap: timestamptz (lahza)
    withA(kLeft, () => {
      card(140, 240, 800, 460, { fill: C.card, col: C.blue, p: kLeft });
      pill("timestamptz: LAHZA (UTC SAQLANADI)", 450, 295, C.blue, kLeft, 22);

      text("• Nomida 'with time zone' bo'lsa ham, mintaqani saqlamaydi!", 180, 365, { size: 23, weight: 700, color: C.red, wrap: 720 });
      text("• Kiritish paytida qiymat darhol UTC ga aylantiriladi.", 180, 420, { size: 22, color: C.ink, wrap: 720 });
      text("• Diskda faqat va faqat UTC lahzasi (8 bayt) saqlanadi.", 180, 475, { size: 22, color: C.ink, wrap: 720 });
      text("• Qaysi mintaqadan yozilgani bazada eslab qolinmaydi!", 180, 530, { size: 22, color: C.soft, wrap: 720 });
      text("• O'qishda: seansning joriy TimeZone sozlamasiga o'girib beradi.", 180, 585, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("  Masalan: Toshkentda 11:00+05, Londonda 06:00+00", 180, 640, { size: 21, fam: MONO, color: C.blue, wrap: 720 });
    });

    // O'ng: timestamp (mahalliy vaqt)
    withA(kRight, () => {
      card(980, 240, 800, 460, { fill: C.card, col: C.purple, p: kRight });
      pill("timestamp: MAHALLIY (MINTAQASIZ)", 1280, 295, C.purple, kRight, 22);

      text("• Mintaqani umuman bilmaydi va tan olmaydi.", 1020, 365, { size: 23, weight: 700, color: C.ink, wrap: 720 });
      text("• Agar qiymatda mintaqa yozilsa ham (+03, +05):", 1020, 420, { size: 22, color: C.ink, wrap: 720 });
      text("  Mintaqa ko'rsatkichi jimgina TASHAB YUBORILADI!", 1020, 475, { size: 23, weight: 700, color: C.red, wrap: 720 });
      text("• Faqat ko'ringan raqamlar (2026-10-12 09:00:00) saqlanadi.", 1020, 530, { size: 22, color: C.ink, wrap: 720 });
      text("• Seansning TimeZone sozlamasi o'zgarsa ham natija o'zgarmaydi.", 1020, 585, { size: 22, color: C.purple, weight: 600, wrap: 720 });
      text("• Aniq voqealar (buyurtma, to'lov) uchun xavfli!", 1020, 640, { size: 21, color: C.red, wrap: 720 });
    });

    // Pastda oltin qoida
    const kRule = P(t, W('L10', 'timezone'), 0.8);
    withA(kRule, () => {
      card(140, 730, 1640, 210, { fill: '#fff9e6', col: C.orange, p: kRule });
      pill("OLTIN QOIDA: VOQEALAR UCHUN DOIMO timestamptz", 480, 780, C.orange, kRule, 22);
      text("• Server Toshkentda yoki Germaniyada bo'lishidan qat'i nazar, timestamptz doim to'g'ri lahzani saqlaydi.", 180, 840, { size: 24, color: C.ink, wrap: 1560 });
      text("• Foydalanuvchining asl mintaqasi biznes uchun kerak bo'lsa, uni alohida text ustunida saqlang!", 180, 895, { size: 24, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 4. MINTAQALAR: IANA bazasi
  function sMintaqalar(t) {
    heading("Vaqt Mintaqalari va IANA Bazasi", t, L('L11').s - 0.4);

    const kCards = P(t, W('L11', 'iana'), 0.6);
    withA(kCards, () => {
      // 1. To'liq nom
      card(140, 240, 520, 460, { fill: C.card, col: C.green, p: kCards });
      pill("1. TO'LIQ NOM (TAVSIYA)", 400, 295, C.green, kCards, 20);
      text("'Asia/Tashkent'", 180, 360, { size: 24, fam: MONO, weight: 700, color: C.blue, wrap: 440 });
      text("'America/New_York'", 180, 405, { size: 24, fam: MONO, weight: 700, color: C.blue, wrap: 440 });
      text("• Eng to'g'ri va ishonchli usul.", 180, 465, { size: 22, color: C.ink, wrap: 440 });
      text("• Hududning barcha tarixiy va kelajakdagi yozgi/qishki vaqt (DST) qoidalari hisobga olinadi.", 180, 520, { size: 21, color: C.ink, wrap: 440 });
      text("• PostgreSQL IANA bazasidan o'qiydi.", 180, 615, { size: 21, color: C.green, weight: 600, wrap: 440 });

      // 2. Qisqartma
      card(700, 240, 520, 460, { fill: C.card, col: C.purple, p: kCards });
      pill("2. QISQARTMA (CHЕKLANGAN)", 960, 295, C.purple, kCards, 20);
      text("'EST', 'PST', 'UTC'", 740, 360, { size: 24, fam: MONO, weight: 700, color: C.purple, wrap: 440 });
      text("• Faqat qat'iy vaqt farqi (masalan UTC-5).", 740, 425, { size: 22, color: C.ink, wrap: 440 });
      text("• Yozgi vaqt qoidalari mavjud emas!", 740, 485, { size: 22, color: C.red, weight: 700, wrap: 440 });
      text("• Yozda EST kiritilsa ham soat o'zgarmasdan qolaveradi.", 740, 545, { size: 21, color: C.ink, wrap: 440 });
      text("• Faqat qat'iy farqlar uchun mos.", 740, 615, { size: 21, color: C.soft, wrap: 440 });

      // 3. POSIX
      card(1260, 240, 520, 460, { fill: C.card, col: C.red, p: kCards });
      pill("3. POSIX FORMATI", 1520, 295, C.red, kCards, 20);
      text("'EST+5EDT,M3.2.0/2,M11.1.0/2'", 1300, 360, { size: 20, fam: MONO, weight: 600, color: C.ink, wrap: 440 });
      text("• Eski Unix uslubidagi formula.", 1300, 425, { size: 22, color: C.ink, wrap: 440 });
      text("• Murakkab va tushunarsiz.", 1300, 485, { size: 22, color: C.red, wrap: 440 });
      text("• Rasmiy hujjat TAVSIYA QILMAYDI.", 1300, 545, { size: 22, color: C.red, weight: 700, wrap: 440 });
      text("• O'qilishi juda qiyin.", 1300, 615, { size: 21, color: C.soft, wrap: 440 });
    });

    const kNote = P(t, W('L12', 'tashkent'), 0.8);
    withA(kNote, () => {
      card(140, 730, 1640, 210, { fill: '#f8fafc', col: C.blue, p: kNote });
      pill("SIYOSIY QARORLAR VA BAZA YANGILANISHLARI", 460, 780, C.blue, kNote, 22);
      text("• Vaqt mintaqalari tabiat qonuni emas, hukumat qarorlari bilan o'zgaradi (masalan, Qozog'iston 2024-yilda bitta zonaga o'tdi).", 180, 840, { size: 23, color: C.ink, wrap: 1560 });
      text("• PostgreSQL har yangi relizda IANA (Olson) bazasining so'nggi versiyasini o'z ichiga oladi.", 180, 895, { size: 23, weight: 700, color: C.green, wrap: 1560 });
    });
  }

  // 5. INTERVAL: 3 mustaqil maydon
  function sInterval(t) {
    heading("Interval: Uch Mustaqil Maydon", t, L('L13').s - 0.4);

    const kFields = P(t, W('L13', 'mustaqil'), 0.6);
    withA(kFields, () => {
      // 3 maydon
      card(140, 240, 520, 420, { fill: C.card, col: C.blue, p: kFields });
      pill("1. OYLAR (MONTHS)", 400, 295, C.blue, kFields, 20);
      text("• Yillar va oylar saqlanadi.", 180, 360, { size: 22, color: C.ink, wrap: 440 });
      text("• Oydagi kunlar soni har xil (28, 29, 30, 31).", 180, 415, { size: 22, color: C.ink, wrap: 440 });
      text("• 31-mart + 1 oy = 30-aprel!", 180, 470, { size: 23, fam: MONO, weight: 700, color: C.blue, wrap: 440 });
      text("  (Keyingi oyning oxirgi kuni olinadi)", 180, 515, { size: 20, color: C.soft, wrap: 440 });

      card(700, 240, 520, 420, { fill: C.card, col: C.green, p: kFields });
      pill("2. KUNLAR (DAYS)", 960, 295, C.green, kFields, 20);
      text("• Haftalar va kunlar saqlanadi.", 740, 360, { size: 22, color: C.ink, wrap: 440 });
      text("• Kalendar kuni o'zgaradi, kun vaqti esa o'zgarmaydi.", 740, 415, { size: 22, color: C.ink, wrap: 440 });
      text("• '100 weeks' = 700 days bo'lib saqlanadi.", 740, 470, { size: 22, fam: MONO, weight: 600, color: C.green, wrap: 440 });
      text("  (Kunlar oylarga aylantirilmaydi!)", 740, 515, { size: 20, color: C.soft, wrap: 440 });

      card(1260, 240, 520, 420, { fill: C.card, col: C.purple, p: kFields });
      pill("3. MIKROSEKUNDLAR", 1520, 295, C.purple, kFields, 20);
      text("• Soat, minut, sekund va kasrlar.", 1300, 360, { size: 22, color: C.ink, wrap: 440 });
      text("• Aniq vaqt masofasini bildiradi.", 1300, 415, { size: 22, color: C.ink, wrap: 440 });
      text("• '99 hours' kunlarga aylantirilmaydi,", 1300, 470, { size: 22, color: C.ink, wrap: 440 });
      text("  chunki sutka har doim ham 24 soat emas!", 1300, 515, { size: 21, weight: 700, color: C.purple, wrap: 440 });
    });

    // Pastda DST farqi
    const kDst = P(t, W('L15', 'turli'), 0.8);
    withA(kDst, () => {
      card(140, 690, 1640, 250, { fill: '#fff9e6', col: C.orange, p: kDst });
      pill("YOZGI VAQT TUZOG'I: interval '1 day' vs '24 hours'", 490, 740, C.orange, kDst, 22);
      text("• Nyu-Yorkda 2026-yil 8-martda soatlar 1 soat oldinga suriladi (o'tish kuni 23 soatdan iborat!).", 180, 800, { size: 23, color: C.ink, wrap: 1560 });
      text("• '2026-03-07 12:00' + interval '1 day'    -->  2026-03-08 12:00:00  (ertasi kungi ayni soat)", 180, 850, { size: 23, fam: MONO, weight: 700, color: C.blue, wrap: 1560 });
      text("• '2026-03-07 12:00' + interval '24 hours'  -->  2026-03-08 13:00:00  (aniq 24 soatdan keyin!)", 180, 895, { size: 23, fam: MONO, weight: 700, color: C.red, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Sana va Vaqt Qoidalari", t, L('L16').s - 0.4);

    const pillars = [
      { tit: "Voqealar: timestamptz", sub: "Buyurtma, login va xabar vaqtlari uchun doimo timestamptz ishlating. Mintaqa o'zgarsa ham lahza to'g'ri saqlanadi.", col: C.green, at: W('L16', 'timestamptz') },
      { tit: "Oraliqlar: interval", sub: "Obuna muddati, sessiya vaqti va muddatlar uchun interval turi eng qulay va aniq vositadir.", col: C.blue, at: W('L16', 'interval') },
      { tit: "Kiritish: ISO 8601", sub: "Sanani doim 'YYYY-MM-DD HH:MI:SS' ko'rinishida yozing. DateStyle sozlamasidan qat'i nazar bir xil tushuniladi.", col: C.purple, at: W('L16', 'formatidan') },
      { tit: "Terminalda sinash", sub: "Keyingi qismda psql terminalida TimeZone, AT TIME ZONE va interval amallarini jonli ko'ramiz.", col: C.orange, at: L('L17').s }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, p.at, 0.5);
      withA(k, () => {
        const x = 140 + (i % 2) * 840, y = 260 + Math.floor(i / 2) * 330;
        card(x, y, 800, 280, { fill: C.card, col: p.col, p: k });
        pill(p.tit, x + 240, y + 55, p.col, k, 22);
        text(p.sub, x + 40, y + 130, { size: 23, color: C.ink, wrap: 720 });
      });
    });
  }

  // Asosiy chizish funksiyasi
  function draw(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.turlar.s) sIntro(t);
    else if (t < sc.tz_farqi.s) sTurlar(t);
    else if (t < sc.mintaqalar.s) sTzFarqi(t);
    else if (t < sc.interval.s) sMintaqalar(t);
    else if (t < sc.xulosa.s) sInterval(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("8-bob: Sana va Vaqt — Tushuncha", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("Mahalliy vaqt, Lahza, timestamptz va Interval", 960, 290, { size: 42, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("Sana Tiplari", 180, 440, { size: 32, color: C.blue });
    text("• date (4 bayt)\n• time (8 bayt)\n• timestamp (mintaqasiz)\n• timestamptz (UTC lahza)\n• interval (16 bayt)", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("POSTGRESQL TIPLARI", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("timestamptz Sirlari", 750, 440, { size: 32, color: C.purple });
    text("• Zonani o'zida saqlamaydi\n• Doim UTC da saqlanadi\n• TimeZone ga moslab chiqadi\n• timestamp zonani tashlaydi\n• Voqealar uchun eng xavfsiz", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("UTC INSTANT", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.orange });
    hand("Interval va DST", 1320, 440, { size: 32, color: C.orange });
    text("• 3 maydon: oylar, kunlar, us\n• 31-mart + 1 oy = 30-aprel\n• 1 day != 24 hours (DST!)\n• IANA nomli mintaqalari\n• ISO 8601 formati", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("INTERVAL MATH", 1530, 820, C.orange, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
