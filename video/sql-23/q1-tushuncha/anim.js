// SQL 23-bob 1-qism: "Tushuncha" — WHERE va Filtrlash Asoslari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO: WHERE va 3 Qiymatli Mantiq
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("23-bob. Tushuncha", 960, 150, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da Filtrlash va WHERE Bandi", 960, 245, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Uch qiymatli mantiq: TRUE, FALSE va NULL qoidalari", 960, 335, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 370, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'rost'), 0.8);
    withA(kCards, () => {
      // Logic diagram
      card(140, 430, 1640, 530, { fill: C.card, col: C.blue, p: kCards });
      text("WHERE Qanday Qaror Qabul Qiladi? (Three-Valued Logic)", 190, 485, { size: 26, weight: 700, color: C.ink, fam: UI });

      // 3 outcomes boxes
      // TRUE
      card(190, 535, 480, 380, { fill: '#f0fdf4', col: C.green, p: kCards });
      pill("1. SHART ROST (TRUE)", 430, 580, C.green, kCards, 22);
      text("Natija: Qator o'tkaziladi ✅", 230, 650, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• So'rov natijasiga qo'shiladi", 230, 700, { size: 20, color: C.ink, fam: UI });
      text("• Masalan: yosh = 25", 230, 745, { size: 18, color: C.soft, fam: MONO });
      text("• Qator keyingi bosqichga o'tadi", 230, 790, { size: 19, color: C.soft, fam: UI });

      // FALSE
      card(710, 535, 480, 380, { fill: '#fef2f2', col: C.red, p: kCards });
      pill("2. SHART YOLG'ON (FALSE)", 950, 580, C.red, kCards, 22);
      text("Natija: Qator tashlanadi ❌", 750, 650, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• Shartga to'g'ri kelmadi", 750, 700, { size: 20, color: C.ink, fam: UI });
      text("• Masalan: 19 = 25 -> FALSE", 750, 745, { size: 18, color: C.soft, fam: MONO });
      text("• Butunlay chiqarib tashlanadi", 750, 790, { size: 19, color: C.soft, fam: UI });

      // NULL
      card(1230, 535, 510, 380, { fill: '#fff7ed', col: '#ea580c', p: kCards });
      pill("3. SHART NOANIQ (NULL)", 1485, 580, '#ea580c', kCards, 22);
      text("Natija: Qator TASHLANADI! ⚠️", 1270, 650, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• NULL = 25 natijasi: NULL", 1270, 700, { size: 20, color: C.ink, fam: UI });
      text("• WHERE faqat TRUE bo'lsa oladi!", 1270, 745, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• NULL FALSE emas, lekin tashlanadi", 1270, 790, { size: 19, color: C.soft, fam: UI });
      text("• Eng ko'p adashiladigan holat!", 1270, 835, { size: 18, color: '#c2410c', fam: UI });
    });
  }

  // 2. BETWEEN VA BETWEEN SYMMETRIC
  function sBetweenRange(t) {
    heading("Taqqoslov va Oraliqlar: BETWEEN hamda BETWEEN SYMMETRIC", t, TM.scenes.between_range.s);

    const k1 = P(t, W('L2', 'Bitvin'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("Oddiy BETWEEN Sintaksisi", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT * FROM mijozlar", 170, 355, { size: 20, color: C.ink, fam: MONO });
      text("WHERE yosh BETWEEN 25 AND 31;", 170, 400, { size: 22, weight: 700, color: C.blue, fam: MONO });

      text("Teng kuchli mantiqiy ifoda:", 140, 500, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("yosh >= 25 AND yosh <= 31", 140, 545, { size: 22, weight: 700, color: C.green, fam: MONO });

      sline(140, 595, 880, 595, { col: C.rule, p: k1 });

      text("Muhim xususiyatlar:", 140, 645, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Ikkala chegara ham oraliqqa KIRADI (25 ham, 31 ham).", 140, 690, { size: 19, color: C.green, fam: UI });
      text("• NOT BETWEEN esa oraliqdan tashqarini oladi.", 140, 735, { size: 19, color: C.soft, fam: UI });
      text("• Agar chegaralar teskari yozilsa nima bo'ladi?", 140, 785, { size: 20, weight: 700, color: C.red, fam: UI });
      text("  yosh BETWEEN 31 AND 25  --> 0 qator qaytadi!", 140, 825, { size: 20, color: C.red, fam: MONO });
      text("  Chunki yosh >= 31 AND yosh <= 25 hech qachon bajarilmaydi.", 140, 865, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'simmetrik'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.purple, p: k2 });
      pill("PostgreSQL Yechimi: BETWEEN SYMMETRIC", 1400, 260, C.purple, k2, 20);

      card(1020, 310, 760, 180, { fill: '#fff', col: C.purple, p: k2 });
      text("-- Chegaralar qaysi biri kattaligidan qat'i nazar:", 1050, 350, { size: 18, color: C.soft, fam: MONO });
      text("SELECT id, ism, yosh FROM mijozlar", 1050, 390, { size: 20, color: C.ink, fam: MONO });
      text("WHERE yosh BETWEEN SYMMETRIC 31 AND 25;", 1050, 435, { size: 21, weight: 700, color: C.purple, fam: MONO });

      text("SYMMETRIC Qanday Ishlaydi?", 1020, 530, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("PostgreSQL ikkala argumentni solishtiradi:", 1020, 575, { size: 19, color: C.soft, fam: UI });
      text("• Agar chap tomon o'ngdan katta bo'lsa, ularni avtomatik", 1020, 615, { size: 19, color: C.purple, fam: UI });
      text("  o'rnini almashtiradi (min(x,y) va max(x,y)).", 1020, 645, { size: 19, color: C.purple, fam: UI });

      card(1020, 695, 760, 220, { fill: '#f5f3ff', col: C.purple, p: k2 });
      text("PostgreSQL 18 Terminal Natijasi:", 1050, 735, { size: 19, weight: 700, color: C.purple, fam: UI });
      text(" id |  ism  | yosh ", 1050, 775, { size: 18, color: C.ink, fam: MONO });
      text("----+-------+------", 1050, 805, { size: 18, color: C.soft, fam: MONO });
      text("  1 | Ali   |   25", 1050, 835, { size: 18, color: C.green, fam: MONO });
      text("  2 | aliya |   31", 1050, 865, { size: 18, color: C.green, fam: MONO });
      text("(2 rows) -- Muammosiz 2 ta qator topildi!", 1050, 895, { size: 16, color: C.soft, fam: UI });
    });
  }

  // 3. IN VA NOT IN DAGI NULL TUZOG'I
  function sInNullTrap(t) {
    heading("Xavfli Tuzoq: NOT IN Ro'yxatidagi NULL Qiymat", t, TM.scenes.in_null_trap.s);

    const k1 = P(t, W('L3', 'In'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("1. IN Qanday Ishlaydi?", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 140, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("shahar IN ('Toshkent', 'Samarqand', NULL)", 170, 360, { size: 21, weight: 700, color: C.ink, fam: MONO });
      text("= shahar='Toshkent' OR shahar='Samarqand' OR shahar=NULL", 170, 405, { size: 17, color: C.blue, fam: MONO });

      text("IN uchun NULL xavfli emas:", 140, 490, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("Agar shahar 'Toshkent' bo'lsa:", 140, 535, { size: 19, color: C.soft, fam: UI });
      text("TRUE OR FALSE OR NULL  -->  TRUE ✅", 140, 575, { size: 21, weight: 700, color: C.green, fam: MONO });
      text("Chunki mantiqiy OR amali bitta TRUE bilan ham qanoatlanadi.", 140, 620, { size: 18, color: C.soft, fam: UI });

      card(140, 675, 760, 260, { fill: '#fff', col: C.blue, p: k1 });
      text("Qoidaning xulosasi:", 170, 715, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("IN ro'yxatida NULL bo'lsa ham, mos kelgan boshqa", 170, 760, { size: 19, color: C.soft, fam: UI });
      text("qatorlar to'g'ri topilaveradi.", 170, 790, { size: 19, color: C.soft, fam: UI });
      text("Lekin NOT IN ga kelganda holat butunlay o'zgaradi!", 170, 845, { size: 19, weight: 700, color: C.red, fam: UI });
    });

    const k2 = P(t, W('L3', 'not'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("2. NOT IN dagi Falokat: Bo'sh Natija", 1400, 260, C.red, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff', col: C.red, p: k2 });
      text("SELECT * FROM mijozlar", 1050, 350, { size: 20, color: C.ink, fam: MONO });
      text("WHERE shahar NOT IN ('Toshkent', NULL);", 1050, 395, { size: 21, weight: 700, color: C.red, fam: MONO });
      text("-- Kutilgan: Samarqand, Buxoro... LEKIN NATIJA: 0 QATOR!", 1050, 435, { size: 17, color: C.red, fam: MONO });

      text("Nega birorta ham qator chiqmadi?", 1020, 510, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("NOT IN mantiqan AND bilan yoyiladi:", 1020, 555, { size: 19, color: C.soft, fam: UI });
      text("shahar <> 'Toshkent' AND shahar <> NULL", 1020, 600, { size: 20, weight: 700, color: C.red, fam: MONO });

      card(1020, 645, 760, 290, { fill: '#fff', col: C.red, p: k2 });
      text("Samarqand uchun tekshiramiz:", 1050, 685, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("1. 'Samarqand' <> 'Toshkent' --> TRUE", 1050, 725, { size: 18, color: C.green, fam: MONO });
      text("2. 'Samarqand' <> NULL       --> NULL", 1050, 765, { size: 18, color: C.red, fam: MONO });
      text("3. TRUE AND NULL              --> NULL! (TRUE emas)", 1050, 805, { size: 18, weight: 700, color: C.red, fam: MONO });
      text("WHERE esa NULL natijali qatorlarni tashlab yuboradi!", 1050, 850, { size: 18, weight: 700, color: C.red, fam: UI });
      text("Natijada BARCHA qatorlar tashlanadi!", 1050, 885, { size: 18, color: C.red, fam: UI });
    });
  }

  // 4. IS DISTINCT FROM
  function sDistinctFrom(t) {
    heading("IS DISTINCT FROM: NULL-Xavfsiz Filtrlash", t, TM.scenes.distinct_from.s);

    const k1 = P(t, W('L4', 'tengsizlik'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("Oddiy Tengsizlik (<>) dagi Xato", 520, 260, C.red, k1, 20);

      text("Vazifa: Toshkentlik bo'lmagan barcha mijozlarni topish.", 140, 320, { size: 20, weight: 700, color: C.ink, fam: UI });

      card(140, 360, 760, 140, { fill: '#f6f9fc', col: C.red, p: k1 });
      text("SELECT * FROM mijozlar", 170, 400, { size: 20, color: C.ink, fam: MONO });
      text("WHERE shahar <> 'Toshkent';", 170, 445, { size: 22, weight: 700, color: C.red, fam: MONO });

      text("Shahri noma'lum (NULL) bo'lgan mijozlar nima bo'ladi?", 140, 540, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Sobir_2 ning shahri NULL.", 140, 585, { size: 19, color: C.soft, fam: UI });
      text("• NULL <> 'Toshkent' ifodasi NULL qaytaradi.", 140, 625, { size: 19, color: C.red, fam: MONO });
      text("• Natijada Sobir_2 ro'yxatdan tushib qoladi!", 140, 670, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• Biz esa 'shahri Toshkent bo'lmaganlar'ni so'ragan edik;", 140, 715, { size: 19, color: C.soft, fam: UI });
      text("  noma'lum shahar ham Toshkent emas edi!", 140, 745, { size: 19, color: C.soft, fam: UI });

      card(140, 795, 760, 150, { fill: '#fff1f2', col: C.red, p: k1 });
      text("Oddiy <> operatori NULL larni yo'qotadi!", 170, 835, { size: 20, weight: 700, color: C.red, fam: UI });
      text("Bu esa hisobotlarda ma'lumotlar kam chiqishiga sabab bo'ladi.", 170, 880, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'distinkt'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.green, p: k2 });
      pill("To'g'ri Yechim: IS DISTINCT FROM", 1400, 260, C.green, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff', col: C.green, p: k2 });
      text("SELECT id, ism, shahar FROM mijozlar", 1050, 350, { size: 20, color: C.ink, fam: MONO });
      text("WHERE shahar IS DISTINCT FROM 'Toshkent';", 1050, 395, { size: 21, weight: 700, color: C.green, fam: MONO });
      text("-- NULL ni oddiy qiymat kabi hisoblaydi!", 1050, 435, { size: 17, color: C.soft, fam: MONO });

      text("Haqiqat Jadvali Taqqoslash:", 1020, 510, { size: 22, weight: 700, color: C.ink, fam: UI });

      card(1020, 550, 760, 210, { fill: '#fff', col: C.green, p: k2 });
      text("Qiymat        | <> 'Toshkent' | IS DISTINCT FROM", 1050, 590, { size: 18, color: C.ink, fam: MONO });
      text("--------------+---------------+------------------", 1050, 620, { size: 18, color: C.soft, fam: MONO });
      text("'Samarqand'   | TRUE          | TRUE  (Chiqadi)", 1050, 655, { size: 18, color: C.green, fam: MONO });
      text("'Toshkent'    | FALSE         | FALSE (Tashlanadi)", 1050, 690, { size: 18, color: C.soft, fam: MONO });
      text("NULL          | NULL (Yo'q)   | TRUE  (Chiqadi!)", 1050, 725, { size: 18, weight: 700, color: C.green, fam: MONO });

      card(1020, 790, 760, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("Natija: aliya (Samarqand), Sobir_2 (NULL), Dilnoza (Buxoro)", 1050, 830, { size: 18, weight: 700, color: C.green, fam: UI });
      text("3 ta qator to'liq va xatosiz olindi!", 1050, 875, { size: 18, color: C.green, fam: UI });
    });
  }

  // 5. PATTERN SEARCH: LIKE, ILIKE, REGEX
  function sPatternSearch(t) {
    heading("Matnlarni Qidirish: LIKE, ILIKE va POSIX Regex", t, TM.scenes.pattern_search.s);

    const k1 = P(t, W('L5', 'layk'), 0.5);
    withA(k1, () => {
      // 3 columns comparison
      card(100, 210, 530, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("1. Standart LIKE", 365, 260, C.blue, k1, 20);
      text("• An'anaviy SQL standarti", 130, 320, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• %  --> 0 yoki bir nechta belgi", 130, 365, { size: 18, color: C.soft, fam: MONO });
      text("• _  --> Aniq 1 ta ixtiyoriy belgi", 130, 405, { size: 18, color: C.soft, fam: MONO });

      card(130, 450, 470, 180, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("WHERE ism LIKE 'Ali%';", 150, 490, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("Natija: 'Ali' chiqadi,", 150, 535, { size: 17, color: C.ink, fam: UI });
      text("lekin 'aliya' CHIQMAYDI!", 150, 570, { size: 17, weight: 700, color: C.red, fam: UI });

      text("• Katta-kichik harfga sezgir (case-sensitive).", 130, 670, { size: 18, color: C.soft, fam: UI });
      text("• Escape: '%\\_%' (ostki chiziqni qidirish).", 130, 715, { size: 18, color: C.soft, fam: UI });
      text("• Boshidagi % indeksni ishlatmaydi!", 130, 770, { size: 18, weight: 700, color: C.red, fam: UI });

      // ILIKE
      card(660, 210, 550, 780, { fill: C.card, col: C.green, p: k1 });
      pill("2. PostgreSQL ILIKE", 935, 260, C.green, k1, 20);
      text("• Case-insensitive LIKE", 690, 320, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• Registrga umuman qaramaydi", 690, 365, { size: 18, color: C.soft, fam: UI });

      card(690, 450, 490, 180, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("WHERE ism ILIKE 'ali%';", 710, 490, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("Natija: 'Ali' ham,", 710, 535, { size: 17, color: C.green, fam: UI });
      text("'aliya' ham CHIQADI! ✅", 710, 570, { size: 17, weight: 700, color: C.green, fam: UI });

      text("• PostgreSQL ga xos juda qulay kengaytma.", 690, 670, { size: 18, color: C.soft, fam: UI });
      text("• MySQL da esa oddiy LIKE ham shunday.", 690, 715, { size: 18, color: C.soft, fam: UI });

      // POSIX Regex
      card(1240, 210, 580, 780, { fill: C.card, col: C.purple, p: k1 });
      pill("3. POSIX Regex (~, ~*)", 1530, 260, C.purple, k1, 20);
      text("• Eng kuchli qidiruv quroli", 1270, 320, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• ~   --> Sezgir regex", 1270, 365, { size: 18, color: C.soft, fam: MONO });
      text("• ~*  --> Sezgir bo'lmagan regex", 1270, 405, { size: 18, color: C.soft, fam: MONO });

      card(1270, 450, 520, 180, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("WHERE telefon ~ '^\\+998';", 1290, 490, { size: 18, weight: 700, color: C.purple, fam: MONO });
      text("Natija: faqat O'zbekiston", 1290, 535, { size: 17, color: C.ink, fam: UI });
      text("raqamlari (+998...) filtrlanadi.", 1290, 570, { size: 17, color: C.purple, fam: UI });

      text("• Satrning istalgan joyidan qidiradi.", 1270, 670, { size: 18, color: C.soft, fam: UI });
      text("• Xavf: foydalanuvchi kiritgan regex", 1270, 720, { size: 18, weight: 700, color: C.red, fam: UI });
      text("  protsessor vaqtini tugatib qo'yishi mumkin!", 1270, 755, { size: 17, color: C.red, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Filtrlashning Oltin Qoidalari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'Shartlarni'), 0.5);
    withA(k1, () => {
      card(120, 210, 1680, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("DOIMO YODDA TUTING: 4 TA ASOSIY QOIDA", 960, 260, C.blue, k1, 22);

      // Card 1: 3-Valued Logic
      card(160, 320, 780, 280, { fill: '#fff', col: C.blue, p: k1 });
      pill("1. Uch Qiymatli Mantiq (NULL)", 550, 360, C.blue, k1, 18);
      text("• WHERE faqat TRUE bo'lgan qatorlarni oladi.", 190, 420, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• FALSE va NULL qatorlar tashlanadi.", 190, 465, { size: 19, color: C.soft, fam: UI });
      text("• NULL bilan solishtirishda oddiy = va <> ishlamaydi;", 190, 510, { size: 19, color: C.red, fam: UI });
      text("  doimo IS NULL yoki IS DISTINCT FROM qo'llang.", 190, 550, { size: 19, weight: 700, color: C.green, fam: UI });

      // Card 2: NOT IN and NULL trap
      card(980, 320, 780, 280, { fill: '#fff', col: C.red, p: k1 });
      pill("2. NOT IN dagi NULL Xavfi", 1370, 360, C.red, k1, 18);
      text("• NOT IN ro'yxatida bitta NULL bo'lsa: natija 0 qator!", 1010, 420, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Chunki har qanday x <> NULL natijasi NULL bo'ladi.", 1010, 465, { size: 19, color: C.soft, fam: UI });
      text("• Xavfsiz usul: ro'yxatdan NULL ni olib tashlash", 1010, 510, { size: 19, color: C.ink, fam: UI });
      text("  yoki NOT EXISTS subquery ishlatish.", 1010, 550, { size: 19, weight: 700, color: C.green, fam: UI });

      // Card 3: BETWEEN SYMMETRIC
      card(160, 630, 780, 320, { fill: '#fff', col: C.purple, p: k1 });
      pill("3. Oraliqlar va BETWEEN", 550, 670, C.purple, k1, 18);
      text("• BETWEEN da ikkala chegara ham oraliqqa kiradi.", 190, 730, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• Chegaralar tartibi teskari bo'lsa oddiy BETWEEN 0 beradi;", 190, 775, { size: 19, color: C.red, fam: UI });
      text("  PostgreSQL da BETWEEN SYMMETRIC dan foydalaning.", 190, 815, { size: 19, color: C.purple, fam: UI });
      text("• Sanalarda (timestamp) BETWEEN o'rniga >= va < yaxshiroq.", 190, 870, { size: 18, color: C.soft, fam: UI });

      // Card 4: Pattern Search and Performance
      card(980, 630, 780, 320, { fill: '#fff', col: C.green, p: k1 });
      pill("4. Qidiruv va Unumdorlik", 1370, 670, C.green, k1, 18);
      text("• LIKE 'Ali%' indeksdan samarali foydalanadi (tez).", 1010, 730, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• LIKE '%Ali%' esa jadvalni to'liq aylanadi (Seq Scan).", 1010, 775, { size: 19, color: C.red, fam: UI });
      text("• Foydalanuvchi kiritgan regex bilan ehtiyot bo'ling (DoS).", 1010, 820, { size: 19, color: C.red, fam: UI });
      text("• Registrga sezgir bo'lmagan qidiruvda ILIKE qulay.", 1010, 870, { size: 19, color: C.soft, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.between_range.s) sIntro(t);
    else if (t < S.in_null_trap.s) sBetweenRange(t);
    else if (t < S.distinct_from.s) sInNullTrap(t);
    else if (t < S.pattern_search.s) sDistinctFrom(t);
    else if (t < S.xulosa.s) sPatternSearch(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.between_range.s + 3.0);
  };
})();
