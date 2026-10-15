// SQL 7-bob 1-qism: "Tushuncha" — Matn va binary ma'lumot turlari
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

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("7-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Matn va Binary Satrlar", 960, 370, { size: 96, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("char, varchar, text va bytea arxitekturasi", 960, 480, { size: 48, align: 'center', p: P(t, 1.2, 1.2) });
    marker(480, 520, 960 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'binary'), 0.8);
    withA(kBadges, () => {
      pill("1. Matnli satr: UTF-8 belgilar", 640, 640, C.blue, kBadges, 26);
      pill("2. Binary satr: xom baytlar (bytea)", 1280, 640, C.green, kBadges, 26);
    });

    const kDesc = P(t, W('L2', 'xom'), 0.8);
    withA(kDesc, () => {
      card(280, 740, 1360, 200, { fill: C.card, col: C.blue, p: kDesc });
      text("Matn kodlash qoidasiga bo'ysunadi (UTF-8). Binary satr esa ixtiyoriy baytlardan iborat.", 960, 800, { size: 28, weight: 700, align: 'center', color: C.ink });
      text("Nega PostgreSQL da text eng yaxshi tanlov va nol bayt nima uchun xato beradi?", 960, 860, { size: 25, align: 'center', color: C.soft });
    });
  }

  // 2. STANDART
  function sStandart(t) {
    heading("SQL Standarti: char(n) va varchar(n)", t, L('L3').s - 0.4);

    const kChar = P(t, W('L3', 'char'), 0.5);
    const kVarchar = P(t, W('L3', 'varcha'), 0.5);

    // Chap: char(n)
    withA(kChar, () => {
      card(140, 240, 800, 440, { fill: C.card, col: C.purple, p: kChar });
      pill("QAT'IY UZUNLIK: char(n)", 360, 300, C.purple, kChar, 22);

      text("• Belgilangan n ta belgi doim diskda to'liq saqlanadi.", 180, 370, { size: 23, color: C.ink, wrap: 720 });
      text("• Qisqa matn yozilsa, qolgan joy probellar bilan to'ldiriladi: 'ok  '", 180, 425, { size: 23, color: C.purple, weight: 600, wrap: 720 });
      text("• O'qishda va boshqa tipga o'tkazishda oxiridagi probellar olib tashlanadi.", 180, 480, { size: 22, color: C.ink, wrap: 720 });
      text("• Tenglikda: 'ab'::char(4) = 'ab  '::char(4)", 180, 545, { size: 22, fam: MONO, color: C.ink, weight: 600 });
      text("  -->  ROST (true, probellar hisobga olinmaydi)", 180, 580, { size: 22, fam: MONO, color: C.green, weight: 700 });
      text("• Qadimiy tizimlarda kesh uchun o'ylab topilgan, bugun kam ishlatiladi.", 180, 625, { size: 21, color: C.soft, wrap: 720 });
    });

    // O'ng: varchar(n)
    withA(kVarchar, () => {
      card(980, 240, 800, 440, { fill: C.card, col: C.blue, p: kVarchar });
      pill("O'ZGARUVCHAN UZUNLIK: varchar(n)", 1240, 300, C.blue, kVarchar, 22);

      text("• Haqiqiy matn uzunligiga qarab joy oladi, probel qo'shilmaydi.", 1020, 370, { size: 23, color: C.ink, wrap: 720 });
      text("• Agar matn n belgidan oshsa — baza qat'iy XATO beradi!", 1020, 425, { size: 23, color: C.red, weight: 700, wrap: 720 });
      text("• Faqat ortiqcha qism butunlay probellardan iborat bo'lsa, ular kesiladi.", 1020, 480, { size: 22, color: C.ink, wrap: 720 });
      text("• Tenglikda: 'ab'::varchar = 'ab  '::varchar", 1020, 545, { size: 22, fam: MONO, color: C.ink, weight: 600 });
      text("  -->  YOLG'ON (false, probellar alohida belgi!)", 1020, 580, { size: 22, fam: MONO, color: C.red, weight: 700 });
      text("• Oxiridagi probellar varchar da alohida ma'noga ega belgi sanaladi.", 1020, 625, { size: 21, color: C.soft, wrap: 720 });
    });

    // Pastda: n — belgi, bayt emas!
    const kNote = P(t, W('L4', 'belgilar'), 0.5);
    withA(kNote, () => {
      card(140, 715, 1640, 220, { fill: '#fff9e6', col: C.orange, p: kNote });
      pill("ENG MUHIM QOIDA: n — BELGI SONI!", 360, 765, C.orange, kNote, 22);
      text("• n ko'rsatkichi diskdagi baytlarni emas, aynan inson ko'radigan belgilarni bildiradi.", 180, 820, { size: 24, color: C.ink, wrap: 1560 });
      text("• UTF-8 da bitta belgi 1 dan 4 baytgacha joy olishi mumkin. Masalan, o'zbekcha 'Oʻzbekiston' — 11 belgi, lekin 12 bayt!", 180, 875, { size: 24, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 3. POSTGRES TEXT
  function sPostgresText(t) {
    heading("PostgreSQL da text: Eng Yaxshi Tanlov", t, L('L6').s - 0.4);

    const pillars = [
      { tit: "Tezlik farqi yo'q!", sub: "char, varchar va text bir xil C funksiyalari orqali ishlanadi. Hech qanday tezlik farqi yo'q.", col: C.green, at: W('L7', 'farqi') },
      { tit: "char(n) eng sekini!", sub: "Probellarni qo'shib to'ldirish va har safar o'qishda kesish ortiqcha protsessor taktlarini yeydi.", col: C.red, at: W('L8', 'sekin') },
      { tit: "Sun'iy chegara qo'ymang", sub: "Biznes qoidasi bo'lmasa, varchar(255) kabi eski chegaralar o'rniga text ishlating.", col: C.blue, at: W('L8', 'tavsiya') }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, p.at, 0.5);
      withA(k, () => {
        const x = 140 + i * 560, y = 240;
        card(x, y, 520, 440, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 30, y + 60, { size: 32, color: p.col, p: k });
        text(p.sub, x + 30, y + 150, { size: 23, color: C.ink, wrap: 460 });
      });
    });

    const kAdvise = P(t, W('L8', 'tekst'), 0.5);
    withA(kAdvise, () => {
      card(140, 715, 1640, 220, { fill: '#eff6ff', col: C.blue, p: kAdvise });
      pill("POSTGRESQL RASMIY HUJJATI TAVSIYASI", 380, 765, C.blue, kAdvise, 22);
      text("• PostgreSQL da text tipi eng asosiy ona matn tipi hisoblanadi. Deyarli barcha funksiyalar text qabul qiladi.", 180, 820, { size: 24, color: C.ink });
      text("• varchar(n) bu oddiygina text ustiga qo'yilgan uzunlik tekshiruvi xolos. Cheklov kerak bo'lmasa — text tanlang!", 180, 875, { size: 24, weight: 700, color: C.green });
    });
  }

  // 4. TOAST
  function sToast(t) {
    heading("Ichki Saqlash va TOAST Mexanizmi", t, L('L9').s - 0.4);

    const kShort = P(t, W('L9', 'sarlavha'), 0.5);
    const kToast = P(t, W('L10', 'toust'), 0.5);

    withA(kShort, () => {
      card(140, 240, 800, 440, { fill: C.card, col: C.blue, p: kShort });
      pill("QISQA VA O'RTACHA MATNLAR", 340, 300, C.blue, kShort, 22);

      text("• 126 baytgacha bo'lgan qisqa satrlar:", 180, 370, { size: 23, weight: 700, color: C.blue });
      text("  1 bayt header + matn (satr ichida inline saqlanadi)", 180, 415, { size: 21, fam: MONO, color: C.ink, wrap: 720 });

      text("• 126 baytdan 2 KB gacha bo'lgan satrlar:", 180, 480, { size: 23, weight: 700, color: C.blue });
      text("  4 bayt header + matn (satr ichida inline saqlanadi)", 180, 525, { size: 21, fam: MONO, color: C.ink, wrap: 720 });

      text("• O'ta ixcham saqlanadi, qo'shimcha jadvalga murojaat qilinmaydi.", 180, 595, { size: 22, color: C.soft, wrap: 720 });
    });

    withA(kToast, () => {
      card(980, 240, 800, 440, { fill: '#f0fdf4', col: C.green, p: kToast });
      pill("KATTA MATNLAR VA TOAST", 1200, 300, C.green, kToast, 22);

      text("• Hajm ~2 KB dan oshganda TOAST avtomatik yoqiladi:", 1020, 370, { size: 23, weight: 700, color: C.green });
      text("  1. Matn avtomatik siqiladi (lz4 yoki pglz algoritmi).", 1020, 420, { size: 22, color: C.ink, wrap: 720 });
      text("  2. Agar yana sig'masa, bo'laklanib alohida TOAST jadvaliga ko'chiriladi.", 1020, 470, { size: 22, color: C.ink, wrap: 720 });
      text("  3. Asosiy jadval qatorida faqat 18 baytlik ko'rsatkich (pointer) qoladi!", 1020, 530, { size: 21, fam: MONO, weight: 700, color: C.purple, wrap: 720 });

      text("• Natija: Katta maqolalar boshqa ustunlar qidiruvini aslo sekinlashtirmaydi!", 1020, 595, { size: 21, weight: 600, color: C.green, wrap: 720 });
    });

    const kCap = P(t, W('L11', 'tezligiga'), 0.5);
    withA(kCap, () => {
      card(140, 715, 1640, 220, { fill: C.card, col: C.purple, p: kCap });
      hand("TOAST ning Mo''jizasi", 180, 765, { size: 32, color: C.purple, p: kCap });
      text("• Boshqa ma'lumotlar bazalarida katta matnlar butun qatorni shishirib, xotirani to'ldiradi.", 180, 820, { size: 24, color: C.ink, wrap: 1560 });
      text("• PostgreSQL da esa 1 GB lik matn saqlansa ham, oddiy SELECT so'rovlari chaqmoqdek tez ishlayveradi!", 180, 875, { size: 24, weight: 700, color: C.purple, wrap: 1560 });
    });
  }

  // 5. BYTEA BLOB
  function sByteaBlob(t) {
    heading("Binary Satrlar: bytea va BLOB", t, L('L12').s - 0.4);

    const kBytea = P(t, W('L12', 'baytea'), 0.5);
    const kNul = P(t, W('L13', 'xatosini'), 0.5);

    withA(kBytea, () => {
      card(140, 240, 800, 450, { fill: C.card, col: C.green, p: kBytea });
      pill("BYTEA: IKKILIK (BINARY) SATR", 340, 300, C.green, kBytea, 22);

      text("• Rasm, PDF, kalitlar va shifrlangan baytlar uchun mo'ljallangan.", 180, 365, { size: 22, color: C.ink, wrap: 720 });
      text("• Sukut bo'yicha ekranga o'n oltilik (hex) formatda chiqadi:", 180, 415, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("  \\x53616c6f6d  ('Salom' so'zi hex ko'rinishida)", 180, 450, { size: 21, fam: MONO, color: C.green, weight: 700, wrap: 720 });
      text("• Unda harflarni katta-kichik qilish funksiyalari (upper, lower) yo'q!", 180, 505, { size: 22, color: C.ink, wrap: 720 });
      text("• Solishtirish baytma-bayt bo'ladi:", 180, 555, { size: 22, color: C.purple, weight: 600, wrap: 720 });
      text("  'Salom'::bytea ≠ 'salom'::bytea  (teng emas)", 180, 590, { size: 21, fam: MONO, color: C.purple, weight: 700, wrap: 720 });
      text("• SQL standartida va boshqa bazalarda bu tur BLOB deb ataladi.", 180, 640, { size: 21, color: C.soft, wrap: 720 });
    });

    withA(kNul, () => {
      card(980, 240, 800, 450, { fill: '#fff2f0', col: C.red, p: kNul });
      pill("XAVFLI TUZOQ: NOL BAYT (0x00)", 1200, 300, C.red, kNul, 22);

      text("• Matn ustunlariga (char, varchar, text) nol bayt (NUL / \\0) kiritib bo'lmaydi!", 1020, 365, { size: 22, weight: 700, color: C.red, wrap: 720 });
      text("• Agar kiritilsa qat'iy xatolik beradi:", 1020, 420, { size: 21, color: C.red, weight: 600, wrap: 720 });
      text("  ERROR: invalid byte sequence for encoding 'UTF8': 0x00", 1020, 455, { size: 18, fam: MONO, weight: 700, color: C.red, wrap: 720 });
      text("• C tili va ko'p tizimlarda nol bayt matn oxiri (string terminator) sanaladi.", 1020, 515, { size: 21, color: C.ink, wrap: 720 });
      text("• Fayllarni yoki siqilgan ma'lumotlarni hech qachon text da saqlamang!", 1020, 570, { size: 21, weight: 700, color: C.orange, wrap: 720 });
      text("• Har doim xom baytlar uchun BYTEA yoki BLOB ishlatilishi shart.", 1020, 625, { size: 21, color: C.green, weight: 600, wrap: 720 });
    });

    const kSum = P(t, W('L14', 'heks'), 0.5);
    withA(kSum, () => {
      card(140, 715, 1640, 220, { fill: C.card, col: C.blue, p: kSum });
      hand("Matn vs Binary Xulosasi", 180, 765, { size: 32, color: C.blue, p: kSum });
      text("• Matn (TEXT) — inson o'qiydigan belgilar, qat'iy UTF-8 kodlash, NUL bayt qat'iyan taqiqlanadi.", 180, 820, { size: 24, color: C.ink });
      text("• Binary (BYTEA) — mashina baytlari, kodlashga bog'liq emas, nol bayt va har qanday xom qiymat sig'adi.", 180, 875, { size: 24, weight: 700, color: C.green });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L15').s - 0.4);

    const pillars = [
      { tit: "text ni tanlang", val: "varchar(255) kabi sun'iy chegaralar qo'ymang. PostgreSQL da tezlik bir xil, cheklovsiz text eng qulay.", col: C.blue },
      { tit: "char(n) dan qoching", val: "Probellarni saqlash va olib tashlash ortiqcha resurs oladi. char ko'pincha eng sekin tur.", col: C.purple },
      { tit: "n — belgi soni", val: "varchar(n) da n bayt emas, belgilar soni. UTF-8 da belgilar bir necha bayt bo'lishi mumkin.", col: C.orange },
      { tit: "Fayllarga bytea", val: "Matnga nol bayt sig'maydi. Fayllar, shifrlash va xom baytlar uchun har doim bytea ishlatiladi.", col: C.green }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L15', 'tekst') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 250;
        card(x, y, 380, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 30, y + 60, { size: 30, color: p.col, p: k });
        text(p.val, x + 30, y + 150, { size: 23, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L16', 'sinab'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 2-qismda: Terminalda Jonli Kod Sinovlari", 180, 780, { size: 36, color: C.blue, p: kNext });
      text("psql da char probellari, octet_length, Oʻzbekiston tutuq belgisi, nol bayt xatosi va bytea hekslarini sinab ko'ramiz.", 180, 845, { size: 24, color: C.ink, wrap: 1560 });
      pill("07-2 KOD", 1580, 780, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.standart.s) sIntro(t);
    else if (t < TM.scenes.postgres_text.s) sStandart(t);
    else if (t < TM.scenes.toast.s) sPostgresText(t);
    else if (t < TM.scenes.bytea_blob.s) sToast(t);
    else if (t < TM.scenes.xulosa.s) sByteaBlob(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("7-bob: Matn va Binary — Tushuncha", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("char, varchar, text arxitekturasi va bytea", 960, 300, { size: 44, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.blue });
    hand("Matn Tiplari", 180, 460, { size: 34, color: C.blue });
    text("• char(n): qat'iy uzunlik\n• varchar(n): o'zgaruvchan\n• text: PostgreSQL tavsiyasi\n• Tezlik farqi yo'q\n• char eng sekini", 180, 540, { size: 22, fam: MONO, color: C.ink });
    pill("TEXT & VARCHAR", 390, 830, C.blue, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.green });
    hand("TOAST Mexanizmi", 750, 460, { size: 34, color: C.green });
    text("• < 126 bayt: 1 bayt header\n• 2 KB+: avtomatik siqiladi\n• Fon jadvaliga ko'chadi\n• Pointer: atigi 18 bayt\n• SELECT sekinlashmaydi", 750, 540, { size: 22, fam: MONO, color: C.ink });
    pill("TOAST STORAGE", 960, 830, C.green, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.orange });
    hand("Binary: bytea", 1320, 460, { size: 34, color: C.orange });
    text("• Xom baytlar va fayllar\n• Hex formati (\\x...)\n• Matnda NUL (0x00) xato!\n• bytea da nol bayt erkin\n• upper/lower mavjud emas", 1320, 540, { size: 22, fam: MONO, color: C.ink });
    pill("BYTEA & BLOB", 1530, 830, C.orange, 1, 20);

    pill("SQL Ma'lumot Turlari", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
