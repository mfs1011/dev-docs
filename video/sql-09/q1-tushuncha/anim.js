// SQL 9-bob 1-qism: "Tushuncha" — Boolean, UUID va Enum tushunchalari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("9-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Boolean, UUID va Enum", 960, 300, { size: 88, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Har kuni ishlatiladigan uchta muhim va qulay tip", 960, 395, { size: 42, align: 'center', p: P(t, 1.2, 1.2) });
    marker(420, 430, 1080 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'boolean'), 0.8);
    withA(kBadges, () => {
      pill("1. boolean: 1 bayt (ha / yo'q)", 440, 580, C.blue, kBadges, 24);
      pill("2. UUID: 16 bayt (global yagona)", 960, 580, C.purple, kBadges, 24);
      pill("3. enum: 4 bayt (maxsus ro'yxat)", 1480, 580, C.green, kBadges, 24);
    });

    const kDesc = P(t, W('L2', 'identifikator'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 240, { fill: C.card, col: C.blue, p: kDesc });
      text("Uchta kichik, ammo amaliy dasturlashda eng ko'p qo'llaniladigan ma'lumot turlari:", 960, 740, { size: 27, weight: 700, align: 'center', color: C.ink });
      text("Mantiqiy holatlar uchun boolean, taqsimlangan tizimlarda sequence o'rniga UUID,", 960, 795, { size: 24, align: 'center', color: C.soft });
      text("hamda cheklangan va tartiblangan statuslar uchun enum arxitekturasi.", 960, 845, { size: 24, weight: 700, align: 'center', color: C.blue });
    });
  }

  // 2. BOOLEAN
  function sBoolean(t) {
    heading("Boolean va Uch Qiymatli Mantiq", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'bayt'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      pill("UCHTA HOLAT (3-VALUED LOGIC)", 440, 285, C.blue, k1, 22);

      card(180, 335, 720, 90, { fill: '#fff', col: C.green, p: k1 });
      text("TRUE  -->  Rost (to'langan, faol, tasdiqlangan)", 210, 390, { size: 22, weight: 700, color: C.green });

      card(180, 435, 720, 90, { fill: '#fff', col: C.red, p: k1 });
      text("FALSE -->  Yolg'on (bekor qilingan, o'chirilgan)", 210, 490, { size: 22, weight: 700, color: C.red });

      card(180, 535, 720, 90, { fill: '#fff', col: C.soft, p: k1 });
      text("NULL  -->  Noma'lum (hali kiritilmagan)", 210, 590, { size: 22, weight: 700, color: C.soft });

      text("Diskda atigi 1 bayt joy oladi.", 180, 645, { size: 20, color: C.soft });
    });

    const k2 = P(t, W('L5', 'standartga'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Kiritish Variantlari", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 120, { fill: '#fff', col: C.green, p: k2 });
      text("Rost qiymatlar:", 1050, 375, { size: 21, weight: 700, color: C.green });
      text("'true', 'yes', 'on', '1', 't', 'y'", 1050, 415, { size: 21, fam: MONO, color: C.ink });

      card(1020, 470, 720, 120, { fill: '#fff', col: C.red, p: k2 });
      text("Yolg'on qiymatlar:", 1050, 510, { size: 21, weight: 700, color: C.red });
      text("'false', 'no', 'off', '0', 'f', 'n'", 1050, 550, { size: 21, fam: MONO, color: C.ink });

      text("Chiqishda PostgreSQL doim 't' yoki 'f' qilib ko'rsatadi.", 1020, 635, { size: 20, color: C.soft, wrap: 720 });
    });

    const kDesc = P(t, W('L5', 'kalit'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("STANDART TAVSIYASI", 270, 750, C.orange, kDesc, 22);
      text("• SQL so'rovlarida doimo TRUE va FALSE kalit so'zlarini tirnoqsiz yozing.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• PostgreSQL butun sonni (2, -1) avtomatik boolean'ga aylantirmaydi va qat'iy xato beradi (MySQL dan farqli ravishda!).", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• WHERE bajarildi yoki WHERE NOT bajarildi deb to'g'ridan-to'g'ri yozish eng toza usul.", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 3. UUID
  function sUuid(t) {
    heading("UUID: v4 Tasodifiy va v7 Vaqt Tartibi", t, L('L6').s - 0.4);

    const k1 = P(t, W('L6', 'universal'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      pill("UUID TUSHUNCHASI (128 BIT)", 320, 285, C.blue, k1, 22);

      text("• 128 bitlik yagona identifikator (16 bayt).", 180, 360, { size: 23, color: C.ink, wrap: 720 });
      text("• Standart ko'rinishi 32 ta heks raqam va 4 ta chiziqcha:", 180, 410, { size: 22, color: C.soft, wrap: 720 });
      text("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", 180, 465, { size: 20, fam: MONO, weight: 700, color: C.blue, wrap: 720 });
      text("• Guruhlar: 8 - 4 - 4 - 4 - 12 shaklida bo'linadi.", 180, 520, { size: 21, color: C.ink, wrap: 720 });
      text("• Taqsimlangan mikroservislar va klasterlar uchun ideal.", 180, 575, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("• Sequence kabi bitta markaziy bazaga bog'lanib qolmaydi.", 180, 625, { size: 21, color: C.soft, wrap: 720 });
    });

    const k2 = P(t, W('L7', 'yettinchi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("v4 (Tasodifiy) vs v7 (Vaqt Tartibi)", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.purple, p: k2 });
      text("v4: uuidv4() / gen_random_uuid()", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.purple });
      text("Butunlay tasodifiy sonlar. Tartibi yo'q, B-Tree indeksini sochib yuboradi.", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.green, p: k2 });
      text("v7: uuidv7() (PostgreSQL 18 dan)", 1050, 500, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Vaqt (ms) bo'yicha o'suvchi tartib! B-Tree indekslarida juda tez ishlaydi.", 1050, 540, { size: 18, color: C.green });

      text("v7 ichidan uuid_extract_timestamp() orqali vaqtni ajratib olish mumkin!", 1020, 625, { size: 19, color: C.blue, weight: 600, wrap: 720 });
    });

    const kDesc = P(t, W('L8', 'olti'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#eff6ff', col: C.blue, p: kDesc });
      pill("HAJM: uuid TIPI vs TEXT", 270, 750, C.blue, kDesc, 22);
      text("• uuid tipi diskda atigi 16 bayt joy egallaydi.", 180, 810, { size: 24, color: C.ink, wrap: 1560 });
      text("• Agar UUID matn sifatida (varchar(36) yoki text) saqlansa — kamida 40 bayt joy oladi (2.5 baravar ortiqcha!).", 180, 860, { size: 24, color: C.red, weight: 700, wrap: 1560 });
      text("• Xulosa: identifikatorlar uchun doimo maxsus uuid tipidan foydalaning.", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 4. ENUM
  function sEnum(t) {
    heading("Enum: Maxsus Tartiblangan Turlar", t, L('L9').s - 0.4);

    const k1 = P(t, W('L9', 'cheklangan'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.green, p: k1 });
      pill("MUSTAQIL TIP YARATISH", 300, 285, C.green, k1, 22);

      text("CREATE TYPE holat AS ENUM", 180, 360, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("  ('yangi', 'jarayonda', 'yopildi');", 180, 400, { size: 22, fam: MONO, weight: 700, color: C.blue });

      text("• PostgreSQL da enum avval alohida tip qilib e'lon qilinadi.", 180, 460, { size: 22, color: C.ink, wrap: 720 });
      text("• Har bir qiymat diskda atigi 4 bayt joy oladi.", 180, 515, { size: 22, color: C.green, weight: 600, wrap: 720 });
      text("• Ro'yxatda yo'q qiymat kiritilsa — baza darhol qat'iy XATO beradi!", 180, 570, { size: 22, color: C.red, weight: 700, wrap: 720 });
      text("• Katta-kichik harf sezgir: 'yangi' ≠ 'Yangi'.", 180, 625, { size: 21, color: C.soft, wrap: 720 });
    });

    const k2 = P(t, W('L10', 'tartib'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.orange, p: k2 });
      hand("E'lon Qilingan Tartib Ahamiyati", 1020, 290, { size: 28, color: C.orange, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.blue, p: k2 });
      text("1. 'yangi'  <  2. 'jarayonda'  <  3. 'yopildi'", 1050, 380, { size: 21, fam: MONO, weight: 700, color: C.blue });
      text("Tartib alifbo bo'yicha emas, aynan e'lon qilingan navbat bo'yicha!", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.red, p: k2 });
      text("ENG MUHIM CHEKLOV: O'chirish mumkin emas!", 1050, 500, { size: 21, weight: 700, color: C.red });
      text("ALTER TYPE ... ADD VALUE bilan yangi qiymat qo'shsa bo'ladi,", 1050, 535, { size: 18, color: C.ink });
      text("lekin mavjud qiymatni o'chirib bo'lmaydi!", 1050, 560, { size: 18, color: C.red, weight: 700 });

      text("Tez-tez o'zgaradigan ro'yxatlar uchun alohida ma'lumotnoma jadvali kerak.", 1020, 625, { size: 19, color: C.soft, wrap: 720 });
    });

    const kDesc = P(t, W('L11', 'o‘chirib'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("ENUM ISHLATISH TAVSIYALARI", 280, 750, C.red, kDesc, 22);
      text("• O'zgarmas biznes statuslari (masalan: to'lov holatlari, buyurtma bosqichlari) uchun enum juda qulay va tez.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Agar ro'yxat keyinchalik qisqarishi yoki foydalanuvchi tomonidan boshqarilishi kerak bo'lsa — enum o'rniga jadval va FOREIGN KEY ishlating.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Boolean, UUID va Enum", t, L('L12').s - 0.4);

    const pillars = [
      { tit: "boolean (1 bayt)", sub: "Uch qiymatli mantiq (TRUE, FALSE, NULL). Kalit so'zlar bilan yozing va WHERE da to'g'ri tekshiring.", col: C.blue, at: W('L12', 'boolean') },
      { tit: "uuid (16 bayt)", sub: "Taqsimlangan tizimlar uchun v4 (tasodifiy) yoki v7 (vaqt tartibidagi) yagona identifikator.", col: C.purple, at: W('L12', 'uuid') },
      { tit: "enum (4 bayt)", sub: "O'zgarmas statuslar uchun tartiblangan va tip-xavfsiz ro'yxat. O'chirib bo'lmasligini yodda tuting.", col: C.green, at: W('L12', 'enum') },
      { tit: "Terminalda sinash", sub: "Keyingi qismda psql da NULL filtri, uuidv7 va enum tartibini jonli buyruqlar bilan ko'ramiz.", col: C.orange, at: L('L13').s }
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
    if (t < sc.boolean.s) sIntro(t);
    else if (t < sc.uuid.s) sBoolean(t);
    else if (t < sc.enum.s) sUuid(t);
    else if (t < sc.xulosa.s) sEnum(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("9-bob: Boolean, UUID va Enum — Tushuncha", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("Mantiqiy holatlar, Global kalitlar va Tartiblangan statuslar", 960, 290, { size: 40, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("boolean (1 bayt)", 180, 440, { size: 32, color: C.blue });
    text("• TRUE, FALSE, NULL\n• Uch qiymatli mantiq\n• 'yes', 'on', '1', 'true'\n• 'no', 'off', '0', 'false'\n• Chiqishda: 't' yoki 'f'", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("BOOLEAN LOGIC", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("UUID (16 bayt)", 750, 440, { size: 32, color: C.purple });
    text("• 128 bit global yagona\n• v4: butunlay tasodifiy\n• v7: vaqt bo'yicha o'suvchi\n• B-Tree da juda tez\n• text da 40 bayt oladi", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("UUIDv4 & UUIDv7", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("enum (4 bayt)", 1320, 440, { size: 32, color: C.green });
    text("• CREATE TYPE ... ENUM\n• E'lon tartibi bo'yicha\n• <, >, ORDER BY ishlaydi\n• Ro'yxatdan tashqari xato\n• O'chirib bo'lmaydi!", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("ENUMERATED TYPES", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
