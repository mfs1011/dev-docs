// SQL 24-bob 1-qism: "Tushuncha" — ORDER BY, LIMIT va Sahifalash Asoslari
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

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("24-bob. Tushuncha", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da Saralash va Cheklash Asoslari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ORDER BY nima uchun shart, LIMIT va sahifalash determinizmi", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(240, 380, 1440 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('L1', 'order'), 0.8);
    withA(kCards, () => {
      card(140, 440, 1640, 520, { fill: C.card, col: C.blue, p: kCards });
      text("Relyatsion Modelning Asosiy Qoidasi: Tartib Kafolatlanmaydi!", 190, 495, { size: 25, weight: 700, color: C.ink, fam: UI });

      // Box 1: Unordered Set
      card(190, 540, 500, 380, { fill: '#fff1f2', col: C.red, p: kCards });
      pill("1. Tartibsiz To'plam", 440, 580, C.red, kCards, 20);
      text("• Jadval qatorlari tartibsiz to'plamdir", 220, 645, { size: 19, color: C.ink, fam: UI });
      text("• Diskdagi bloklar joylashuvi", 220, 690, { size: 18, color: C.soft, fam: UI });
      text("• Parallel skanerlash rejalari", 220, 735, { size: 18, color: C.soft, fam: UI });
      text("• Tartib har safar o'zgarishi mumkin!", 220, 785, { size: 19, weight: 700, color: C.red, fam: UI });

      // Box 2: ORDER BY
      card(720, 540, 500, 380, { fill: '#f0fdf4', col: C.green, p: kCards });
      pill("2. ORDER BY Majburiy", 970, 580, C.green, kCards, 20);
      text("• Aniq tartib faqat ORDER BY", 750, 645, { size: 19, weight: 700, color: C.green, fam: UI });
      text("  yozilgandagina kafolatlanadi", 750, 680, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• ASC — o'sish tartibi (A-Z, 1-9)", 750, 735, { size: 18, color: C.ink, fam: UI });
      text("• DESC — kamayish tartibi (Z-A, 9-1)", 750, 785, { size: 18, color: C.ink, fam: UI });

      // Box 3: LIMIT & FETCH
      card(1250, 540, 490, 380, { fill: '#faf5ff', col: C.purple, p: kCards });
      pill("3. LIMIT va Sahifalash", 1495, 580, C.purple, kCards, 20);
      text("• LIMIT soni OFFSET boshlash", 1280, 645, { size: 18, color: C.purple, fam: MONO });
      text("• Natijadan kerakli bo'lakni olish", 1280, 700, { size: 18, color: C.ink, fam: UI });
      text("• FETCH FIRST va WITH TIES", 1280, 745, { size: 18, color: C.purple, fam: UI });
      text("• Deterministik saralash shart!", 1280, 795, { size: 18, weight: 700, color: C.ink, fam: UI });
    });
  }

  // 2. ASC VA DESC QOIDALARI
  function sAscDescRules(t) {
    heading("ASC va DESC Qoidalari: Sintaksis Tuzog'i", t, TM.scenes.asc_desc_rules.s);

    const k1 = P(t, W('L2', 'Ask'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("Qanday Saralanadi?", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 150, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT * FROM talabalar2", 170, 355, { size: 20, color: C.ink, fam: MONO });
      text("ORDER BY guruh ASC, ball DESC;", 170, 400, { size: 22, weight: 700, color: C.blue, fam: MONO });

      text("Asosiy qoidalar:", 140, 500, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("1. ASC (sukut bo'yicha) — o'sish tartibi (kichikdan kattaga).", 140, 545, { size: 19, color: C.green, fam: UI });
      text("2. DESC — kamayish tartibi (kattadan kichikka).", 140, 590, { size: 19, color: C.purple, fam: UI });
      text("3. Bir nechta ustun ko'rsatilganda:", 140, 640, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("   Avval 1-ustun bo'yicha saralanadi;", 140, 680, { size: 18, color: C.soft, fam: UI });
      text("   2-ustun faqat 1-ustun qiymatlari TENG bo'lgandagina", 140, 715, { size: 18, color: C.soft, fam: UI });
      text("   o'sha qatorlar orasida tartiblaydi.", 140, 745, { size: 18, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L2', 'desk'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("⚠️ Ko'p Tarqalgan Tuzoq", 1400, 260, C.red, k2, 20);

      card(1020, 310, 760, 160, { fill: '#fff', col: C.red, p: k2 });
      text("-- Dasturchi ikkalasini ham kamayish deb o'ylaydi:", 1050, 350, { size: 17, color: C.soft, fam: MONO });
      text("ORDER BY guruh, ball DESC;", 1050, 395, { size: 22, weight: 700, color: C.red, fam: MONO });
      text("-- ASLIDA BU QUYIDAGICHA TUSHUNILADI:", 1050, 435, { size: 17, color: C.red, fam: MONO });

      card(1020, 500, 760, 140, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("ORDER BY guruh ASC, ball DESC;", 1050, 545, { size: 22, weight: 700, color: C.green, fam: MONO });
      text("guruh o'sish tartibida, ball esa kamayish tartibida!", 1050, 590, { size: 17, color: C.ink, fam: UI });

      text("Muhim xulosa:", 1020, 680, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• DESC kalit so'zi butun ro'yxatga emas,", 1020, 725, { size: 19, color: C.soft, fam: UI });
      text("  faqat o'zidan oldin turgan ustungagina ta'sir qiladi!", 1020, 760, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• Chalkashmaslik uchun har bir ustunga yo'nalishni aniq yozing.", 1020, 810, { size: 18, color: C.green, fam: UI });
    });
  }

  // 3. NULL NING O'RNI VA NULLS LAST
  function sNullsPosition(t) {
    heading("PostgreSQL da NULL ning O'rni: NULLS LAST", t, TM.scenes.nulls_position.s);

    const k1 = P(t, W('L3', 'Postgres'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.red, p: k1 });
      pill("PostgreSQL Qoidasi: NULL Har Doim Katta", 520, 260, C.red, k1, 20);

      text("PostgreSQL saralashda NULL ni barcha sonlardan", 140, 320, { size: 20, color: C.soft, fam: UI });
      text("katta deb hisoblaydi (+cheksizlik kabi).", 140, 355, { size: 20, weight: 700, color: C.red, fam: UI });

      card(140, 400, 760, 200, { fill: '#fff1f2', col: C.red, p: k1 });
      text("SELECT ism, ball FROM talabalar2", 170, 440, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC; -- Eng yuqori ballilar!", 170, 480, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("Natija boshida: Sobir (NULL) chiqib qoladi!", 170, 525, { size: 19, weight: 700, color: C.red, fam: UI });
      text("Chunki kamayishda eng kattasi (NULL) birinchi keladi.", 170, 560, { size: 17, color: C.soft, fam: UI });

      card(140, 635, 760, 180, { fill: '#fff', col: C.soft, p: k1 });
      text("Sukut bo'yicha tartib:", 170, 675, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• ORDER BY ball ASC   --> NULL oxirida", 170, 720, { size: 18, color: C.green, fam: MONO });
      text("• ORDER BY ball DESC  --> NULL boshida (Muammo!)", 170, 765, { size: 18, color: C.red, fam: MONO });
    });

    const k2 = P(t, W('L3', 'nulls'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.green, p: k2 });
      pill("To'g'ri Yechim: NULLS LAST", 1400, 260, C.green, k2, 20);

      card(1020, 310, 760, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("SELECT ism, ball FROM talabalar2", 1050, 350, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST;", 1050, 395, { size: 22, weight: 700, color: C.green, fam: MONO });
      text("-- Bali borlar birinchi, NULL esa eng oxiriga tushadi!", 1050, 435, { size: 16, color: C.soft, fam: MONO });

      card(1020, 500, 760, 310, { fill: '#fff', col: C.green, p: k2 });
      text("Natija Ro'yxati:", 1050, 540, { size: 19, weight: 700, color: C.green, fam: UI });
      text("Vali     | 92  (1-o'rin)", 1050, 585, { size: 18, color: C.ink, fam: MONO });
      text("Dilnoza  | 92  (1-o'rin)", 1050, 620, { size: 18, color: C.ink, fam: MONO });
      text("Ali      | 85", 1050, 655, { size: 18, color: C.ink, fam: MONO });
      text("Jasur    | 85", 1050, 690, { size: 18, color: C.ink, fam: MONO });
      text("Malika   | 78", 1050, 725, { size: 18, color: C.ink, fam: MONO });
      text("Sobir    | NULL (Oxirida!)", 1050, 765, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("Top reyting so'rovlarida doimo NULLS LAST yozing!", 1020, 845, { size: 19, weight: 700, color: C.green, fam: UI });
    });
  }

  // 4. LIMIT VA OFFSET
  function sLimitOffset(t) {
    heading("Sahifalash: LIMIT, OFFSET va Determinizm", t, TM.scenes.limit_offset.s);

    const k1 = P(t, W('L4', 'Limit'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("LIMIT va OFFSET Asoslari", 520, 260, C.blue, k1, 20);

      card(140, 310, 760, 160, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT ism, ball FROM talabalar2", 170, 350, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST, id", 170, 390, { size: 19, color: C.blue, fam: MONO });
      text("LIMIT 2 OFFSET 0; -- 1-sahifa (2 ta qator)", 170, 430, { size: 19, weight: 700, color: C.green, fam: MONO });

      text("Sahifalar formulasi:", 140, 510, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• 1-sahifa: LIMIT 2 OFFSET 0  (1 - 2)", 140, 555, { size: 19, color: C.soft, fam: MONO });
      text("• 2-sahifa: LIMIT 2 OFFSET 2  (3 - 4)", 140, 595, { size: 19, color: C.soft, fam: MONO });
      text("• 3-sahifa: LIMIT 2 OFFSET 4  (5 - 6)", 140, 635, { size: 19, color: C.soft, fam: MONO });

      card(140, 695, 760, 170, { fill: '#fff1f2', col: C.red, p: k1 });
      text("Katta OFFSET Muammosi (Unumdorlik):", 170, 735, { size: 19, weight: 700, color: C.red, fam: UI });
      text("OFFSET 1000000 yozilsa, server 1 millionta qatorni", 170, 775, { size: 18, color: C.ink, fam: UI });
      text("baribir o'qib, saralab, keyin tashlab yuboradi! Juda sekin.", 170, 810, { size: 17, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L4', 'saralashsiz'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fff1f2', col: C.red, p: k2 });
      pill("⚠️ ORDER BY siz LIMIT — Xavfli Tuzoq!", 1400, 260, C.red, k2, 20);

      text("Agar ORDER BY yozilmasa nima bo'ladi?", 1020, 320, { size: 21, weight: 700, color: C.red, fam: UI });
      text("SELECT * FROM talabalar2 LIMIT 2 OFFSET 2;", 1020, 365, { size: 19, color: C.ink, fam: MONO });
      text("Qaysi qatorlar 2-sahifaga tushishi tasodifiy bo'lib qoladi!", 1020, 410, { size: 18, weight: 700, color: C.red, fam: UI });

      card(1020, 460, 760, 220, { fill: '#fff', col: C.purple, p: k2 });
      pill("Deterministik Saralash", 1400, 500, C.purple, k2, 18);
      text("Agar ustunda teng qiymatlar bo'lsa (Vali=92, Dilnoza=92):", 1050, 545, { size: 18, color: C.ink, fam: UI });
      text("Ular sahifalar orasida 'sakrab' yurishi mumkin.", 1050, 580, { size: 18, color: C.soft, fam: UI });
      text("Yechim: oxiriga doimo takrorlanmas ustun (id) qo'shing:", 1050, 620, { size: 18, weight: 700, color: C.green, fam: UI });
      text("ORDER BY ball DESC, id ASC", 1050, 655, { size: 19, color: C.green, fam: MONO });

      text("Har doim tartib 100% barqaror va qaytariluvchi bo'ladi!", 1020, 720, { size: 18, color: C.green, fam: UI });
    });
  }

  // 5. WITH TIES STANDARTI
  function sWithTiesStandart(t) {
    heading("SQL Standarti: FETCH FIRST va WITH TIES Imkoniyati", t, TM.scenes.with_ties_standart.s);

    const k1 = P(t, W('L5', 'fech'), 0.5);
    withA(k1, () => {
      card(100, 210, 840, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("1. FETCH FIRST Standart Sintaksisi", 520, 260, C.blue, k1, 20);

      text("ANSI SQL standartiga mos rasmiy cheklash:", 140, 320, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(140, 365, 760, 160, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("SELECT ism, ball FROM talabalar2", 170, 405, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST", 170, 440, { size: 19, color: C.blue, fam: MONO });
      text("OFFSET 0 ROWS FETCH FIRST 2 ROWS ONLY;", 170, 480, { size: 19, weight: 700, color: C.green, fam: MONO });

      text("• Bu LIMIT 2 bilan bir xil ishlaydi.", 140, 560, { size: 19, color: C.soft, fam: UI });
      text("• ROWS va FIRST so'zlari standart talabi hisoblanadi.", 140, 600, { size: 19, color: C.soft, fam: UI });
      text("• PostgreSQL, Oracle, DB2 kabi bazalarda to'liq qo'llanadi.", 140, 645, { size: 19, color: C.soft, fam: UI });
    });

    const k2 = P(t, W('L5', 'tayz'), 0.5);
    withA(k2, () => {
      card(980, 210, 840, 780, { fill: '#fafcfe', col: C.purple, p: k2 });
      pill("2. Sehrli Kalit So'z: WITH TIES", 1400, 260, C.purple, k2, 20);

      text("Vazifa: Eng yuqori ball olgan 2 ta talabani toping.", 1020, 320, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Lekin Vali=92 va Dilnoza=92 bir xil ball olishgan!", 1020, 360, { size: 19, color: C.soft, fam: UI });

      card(1020, 405, 760, 160, { fill: '#faf5ff', col: C.purple, p: k2 });
      text("SELECT ism, ball FROM talabalar2", 1050, 440, { size: 19, color: C.ink, fam: MONO });
      text("ORDER BY ball DESC NULLS LAST", 1050, 475, { size: 19, color: C.purple, fam: MONO });
      text("FETCH FIRST 2 ROWS WITH TIES;", 1050, 515, { size: 21, weight: 700, color: C.purple, fam: MONO });

      card(1020, 600, 760, 220, { fill: '#fff', col: C.purple, p: k2 });
      text("Natija tahlili:", 1050, 640, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("• Oxirgi o'rindagi (2-o'rin) qiymat 92 ball.", 1050, 680, { size: 18, color: C.ink, fam: UI });
      text("• WITH TIES yana qaysi talaba 92 ball olgan bo'lsa,", 1050, 720, { size: 18, color: C.ink, fam: UI });
      text("  ulardan hech birini qoldirmasdan ro'yxatga qo'shadi!", 1050, 755, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Adolatli sovrindorlar ro'yxati shakllanadi.", 1050, 795, { size: 18, color: C.green, fam: UI });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Saralash va Cheklashning Oltin Qoidalari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'barqaror'), 0.5);
    withA(k1, () => {
      card(120, 210, 1680, 780, { fill: C.card, col: C.blue, p: k1 });
      pill("4 TA ASOSIY QOIDA", 960, 260, C.blue, k1, 22);

      card(160, 320, 780, 280, { fill: '#fff', col: C.blue, p: k1 });
      pill("1. Aniq ORDER BY", 550, 360, C.blue, k1, 18);
      text("• Tartib faqat ORDER BY bilan kafolatlanadi.", 190, 420, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("• ORDER BY siz LIMIT qo'llash tasodifiy natija beradi.", 190, 465, { size: 19, color: C.red, fam: UI });
      text("• Har bir ustunga ASC yoki DESC ni aniq yozing.", 190, 510, { size: 19, color: C.soft, fam: UI });

      card(980, 320, 780, 280, { fill: '#fff', col: C.green, p: k1 });
      pill("2. NULLS LAST dan Foydalaning", 1370, 360, C.green, k1, 18);
      text("• PostgreSQL da NULL eng katta qiymatdir.", 1010, 420, { size: 19, color: C.ink, fam: UI });
      text("• DESC da NULL boshiga chiqib qolmasligi uchun", 1010, 465, { size: 19, color: C.green, fam: UI });
      text("  doimo ORDER BY ustun DESC NULLS LAST yozing.", 1010, 505, { size: 19, weight: 700, color: C.green, fam: UI });

      card(160, 630, 780, 320, { fill: '#fff', col: C.purple, p: k1 });
      pill("3. Deterministik Sahifalash", 550, 670, C.purple, k1, 18);
      text("• Teng qiymatlar sahifalar orasida sakramasin.", 190, 730, { size: 19, color: C.purple, fam: UI });
      text("• Saralash oxiriga doimo takrorlanmas ustun qo'shing:", 190, 775, { size: 18, color: C.ink, fam: UI });
      text("  ORDER BY ball DESC, id ASC.", 190, 815, { size: 19, color: C.green, fam: MONO });
      text("• Sahifalar har doim 100% barqaror bo'ladi.", 190, 870, { size: 18, color: C.soft, fam: UI });

      card(980, 630, 780, 320, { fill: '#fff', col: C.red, p: k1 });
      pill("4. Katta OFFSET Tuzog'i", 1370, 670, C.red, k1, 18);
      text("• Katta ofsetlarda (OFFSET 100000) server barcha", 1010, 730, { size: 19, color: C.red, fam: UI });
      text("  oldingi qatorlarni o'qib chiqadi — sekinlashadi.", 1010, 775, { size: 18, color: C.soft, fam: UI });
      text("• Katta hajmlarda keyset sahifalash (WHERE id > last_id)", 1010, 820, { size: 18, weight: 700, color: C.green, fam: UI });
      text("  ishlatish ancha samaraliroq.", 1010, 860, { size: 18, color: C.green, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.asc_desc_rules.s) sIntro(t);
    else if (t < S.nulls_position.s) sAscDescRules(t);
    else if (t < S.limit_offset.s) sNullsPosition(t);
    else if (t < S.with_ties_standart.s) sLimitOffset(t);
    else if (t < S.xulosa.s) sWithTiesStandart(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;
  window.renderPoster = function () {
    bg();
    frame(TM.scenes.asc_desc_rules.s + 3.0);
  };
})();
