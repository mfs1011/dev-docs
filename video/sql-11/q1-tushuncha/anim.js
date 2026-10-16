// SQL 11-bob 1-qism: "Tushuncha" — Kodlash va collation tushunchalari
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
    hand("11-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Kodlash va Collation", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Matnlarni saqlash, solishtirish va o'zbek alifbosi tartibi", 960, 395, { size: 38, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'kodlash'), 0.8);
    withA(kBadges, () => {
      pill("1. Encoding: harflar va kodlar", 440, 580, C.blue, kBadges, 24);
      pill("2. Collation: saralash qoidalari", 960, 580, C.purple, kBadges, 24);
      pill("3. ICU: platformadan mustaqil", 1480, 580, C.green, kBadges, 24);
    });

    const kDesc = P(t, W('L1', 'kollatsiya'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion bazalarda matnli ma'lumotlarni boshqaruvchi ikkita ajralmas tushuncha:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Kodlash har bir belgiga raqamli bayt beradi, collation esa ushbu belgilarni qanday saralash,", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("katta-kichik harfni qanday solishtirish va qidiruvni qanday bajarishni belgilaydi.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. CONCEPTS: ENCODING VS COLLATION
  function sConcepts(t) {
    heading("Kodlash vs Collation Mohiyati", t, L('L2').s - 0.4);

    const k1 = P(t, W('L2', 'karakter'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("Belgilar To'plami (Character Set)", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 335, 720, 150, { fill: '#fff', col: C.blue, p: k1 });
      text("Belgilar va ularning raqamli kodlari:", 210, 375, { size: 21, weight: 700, color: C.blue });
      text("• 'A'  -->  0 raqami (bayt kodi)", 210, 415, { size: 20, fam: MONO, color: C.ink });
      text("• 'B'  -->  1 raqami", 210, 445, { size: 20, fam: MONO, color: C.ink });
      text("• 'a'  -->  2 raqami, 'b'  -->  3 raqami", 210, 475, { size: 20, fam: MONO, color: C.ink });

      card(180, 500, 720, 150, { fill: '#fff', col: C.soft, p: k1 });
      text("Standart: UTF-8 (Unicode)", 210, 540, { size: 21, weight: 700, color: C.ink });
      text("Dunyoning barcha yozuvlari va emojilarini o'z ichiga oladi.", 210, 580, { size: 19, color: C.soft, wrap: 660 });
      text("Har bir belgi 1 dan 4 baytgacha joy oladi.", 210, 615, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L3', 'solishtirish'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Collation — Solishtirish Qoidalari", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("Belgilarni saralash va taqqoslash:", 1050, 375, { size: 21, weight: 700, color: C.purple });
      text("0 < 1 bo'lgani uchun: 'A' < 'B' deb topiladi.", 1050, 415, { size: 20, fam: MONO, color: C.ink });
      text("Binary collation: qat'iy bayt kodlari bo'yicha.", 1050, 450, { size: 19, color: C.soft, wrap: 660 });
      text("Case-insensitive: 'A' = 'a' deb hisoblaydi.", 1050, 475, { size: 19, color: C.purple, weight: 700, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("Milliy Alifbolar va Qo'shma Harflar", 1050, 540, { size: 21, weight: 700, color: C.green });
      text("O'zbek alifbosida: 'sh', 'ch', 'oʻ', 'gʻ' alohida harflar!", 1050, 580, { size: 20, weight: 700, color: C.ink, wrap: 660 });
      text("Ular alifbo oxiriga joylashishi collation orqali hal bo'ladi.", 1050, 615, { size: 19, color: C.blue, weight: 700, wrap: 660 });
    });

    const k3 = P(t, W('L3', 'oldin'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.blue, p: k3 });
      text("Farq juda oddiy:", 180, 755, { size: 25, weight: 700, color: C.blue });
      text("• Kodlash (Encoding) — xotirada qanday saqlanishi (baytlar).", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("• Collation — foydalanuvchiga qanday saralanib ko'rsatilishi va solishtirilishi (mantiq).", 180, 855, { size: 21, color: C.purple, weight: 700, wrap: 1560 });
    });
  }

  // 3. EFFECTS: COLLATION NIMALARGA TA'SIR QILADI
  function sEffects(t) {
    heading("Collation Nimalarga Ta'sir Qiladi", t, L('L4').s - 0.4);

    const k1 = P(t, W('L4', 'order'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("Collation Boshqaradigan Amallar", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 335, 720, 95, { fill: '#fff', col: C.blue, p: k1 });
      text("ORDER BY va Taqqoslash (<, >, =)", 210, 375, { size: 21, weight: 700, color: C.blue });
      text("Qatorlarning qaysi tartibda saralanishini belgilaydi.", 210, 410, { size: 19, color: C.soft, wrap: 660 });

      card(180, 445, 720, 95, { fill: '#fff', col: C.purple, p: k1 });
      text("upper(), lower(), initcap() funksiyalari", 210, 485, { size: 21, weight: 700, color: C.purple });
      text("Harflarni katta yoki kichikka to'g'ri o'girish.", 210, 520, { size: 19, color: C.soft, wrap: 660 });

      card(180, 555, 720, 95, { fill: '#fff', col: C.green, p: k1 });
      text("LIKE, SIMILAR TO va Regex qidiruvlari", 210, 595, { size: 21, weight: 700, color: C.green });
      text("Namunaga qarab qidirish va katta-kichik harfni hisobga olish.", 210, 630, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L5', 'sekinlashtirishi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.red, p: k2 });
      hand("Mintaqaning Tezlik Narxi", 1020, 290, { size: 28, color: C.red, p: k2 });

      card(1020, 335, 720, 140, { fill: '#fff', col: C.green, p: k2 });
      text("C / POSIX Mintaqasi — Eng Tezkor", 1050, 375, { size: 21, weight: 700, color: C.green });
      text("Faqat bayt kodlari bo'yicha saralaydi (hech qanday til qoidasisiz).", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("B-Tree indekslar eng yuqori unumdorlik bilan ishlaydi.", 1050, 445, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 490, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("Murakkab Milliy Mintaqalar", 1050, 530, { size: 21, weight: 700, color: C.red });
      text("Til qoidalarini tekshirish matnli amallarni sekinlashtiradi.", 1050, 570, { size: 19, color: C.ink, wrap: 660 });
      text("Oddiy B-Tree indekslari LIKE uchun yaroqsiz bo'lib qolishi mumkin.", 1050, 600, { size: 19, color: C.red, weight: 700, wrap: 660 });
      text("(Buning uchun 43-bobda maxsus indekslar ko'riladi).", 1050, 625, { size: 18, color: C.soft, wrap: 660 });
    });

    const k3 = P(t, W('L5', 'tez'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.blue, p: k3 });
      text("Hujjat tavsiyasi: Mintaqani faqat kerakli joyda ishlating!", 180, 755, { size: 25, weight: 700, color: C.blue });
      text("Texnik identifikatorlar, kodlar va kalitlar uchun doim 'C' collation eng to'g'ri tanlovdir.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Foydalanuvchi ko'radigan matnlar uchungina milliy alifbo collation'larini qo'llang.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 4. PROVIDERS: LIBC, ICU, BUILTIN
  function sProviders(t) {
    heading("Mintaqa Provayderlari (libc, ICU, builtin)", t, L('L6').s - 0.4);

    const k1 = P(t, W('L6', 'provayderlari'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("PostgreSQL 18 Provayderlari", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 335, 720, 95, { fill: '#fff', col: C.blue, p: k1 });
      text("1. libc — Operatsion Tizim Kutubxonasi", 210, 375, { size: 21, weight: 700, color: C.blue });
      text("Linux, macOS yoki Windows'dagi C kutubxonasiga tayanadi.", 210, 410, { size: 19, color: C.soft, wrap: 660 });

      card(180, 440, 720, 105, { fill: '#fff', col: C.green, p: k1 });
      text("2. icu — Xalqaro ICU Kutubxonasi", 210, 480, { size: 21, weight: 700, color: C.green });
      text("Platformadan mustaqil! Linux dan Windows ga o'tganda natija bir xil chiqadi.", 210, 520, { size: 19, color: C.ink, wrap: 660 });

      card(180, 555, 720, 95, { fill: '#fff', col: C.soft, p: k1 });
      text("3. builtin — PostgreSQL'ning O'zi", 210, 595, { size: 21, weight: 700, color: C.ink });
      text("C, C.UTF-8 va PG_UNICODE_FAST qat'iy kodlari.", 210, 630, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L7', 'cheklov'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.red, p: k2 });
      hand("ENG MUHIM CHEKLOV", 1020, 290, { size: 28, color: C.red, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("LC_COLLATE va LC_CTYPE O'zgarmaydi!", 1050, 375, { size: 21, weight: 700, color: C.red });
      text("Baza yaratilganda (initdb yoki CREATE DATABASE) belgilanadi.", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("Keyinchalik ularni bazada o'zgartirib bo'lmaydi!", 1050, 445, { size: 19, color: C.red, weight: 700, wrap: 660 });
      text("Chunki B-Tree indekslar tartibi buzilib ketadi.", 1050, 470, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("Yechim: Alohida Ustunga Collation Berish", 1050, 540, { size: 21, weight: 700, color: C.green });
      text("Baza en_US bo'lsa ham, alohida jadval yoki ustunga:", 1050, 580, { size: 19, color: C.ink, wrap: 660 });
      text("ism text COLLATE \"uz-Latn-x-icu\" deb berish mumkin!", 1050, 615, { size: 19, fam: MONO, weight: 700, color: C.blue, wrap: 660 });
    });

    const k3 = P(t, W('L7', 'o‘zgartirib'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Tavsiya: Yangi bazalarni ICU bilan yarating!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("libc operatsion tizim yangilanishi bilan saralash tartibini o'zgartirishi va indekslarni buzishi mumkin.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("ICU esa barqaror va platformadan mustaqil saralashni kafolatlaydi.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 5. DETERMINISTIC VS NONDETERMINISTIC
  function sDeterministic(t) {
    heading("Deterministik va Nondeterministik Collation", t, L('L8').s - 0.4);

    const k1 = P(t, W('L8', 'deterministik'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("Deterministik Collation (Standart)", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 335, 720, 140, { fill: '#fff', col: C.blue, p: k1 });
      text("Faqat baytlari 100% teng satrlar tengdir", 210, 375, { size: 21, weight: 700, color: C.blue });
      text("'Salom' = 'salom'  -->  FALSE", 210, 415, { size: 20, fam: MONO, weight: 700, color: C.red });
      text("Barcha tayyor va standart collation'lar shunday ishlaydi.", 210, 450, { size: 19, color: C.soft, wrap: 660 });

      card(180, 490, 720, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Afzalliklari: Juda Tez va Xavfsiz", 210, 530, { size: 21, weight: 700, color: C.green });
      text("B-Tree indekslarida deduplikatsiya to'liq ishlaydi.", 210, 570, { size: 19, color: C.ink, wrap: 660 });
      text("Hech qanday noaniqlik va kutilmagan tengliklar bo'lmaydi.", 210, 605, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L9', 'nondeterministik'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Nondeterministik Collation", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 140, { fill: '#fff', col: C.purple, p: k2 });
      text("Baytlari har xil satrlar ham teng bo'lishi mumkin", 1050, 375, { size: 21, weight: 700, color: C.purple });
      text("'Salom' = 'salom'  -->  TRUE (ci bilan)", 1050, 415, { size: 20, fam: MONO, weight: 700, color: C.green });
      text("Katta-kichik harf yoki urg'uni hisobga olmaslik mumkin.", 1050, 450, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 490, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("Amaliy Foyda: Takrorlanmas Email", 1050, 530, { size: 21, weight: 700, color: C.purple });
      text("CREATE TABLE foydalanuvchilar (email text COLLATE ci UNIQUE);", 1050, 570, { size: 18, fam: MONO, color: C.ink, wrap: 660 });
      text("Foydalanuvchi Ali@Mail.uz va ali@mail.uz deb ikki marta ro'yxatdan o'ta olmaydi!", 1050, 610, { size: 19, weight: 700, color: C.blue, wrap: 660 });
    });

    const k3 = P(t, W('L9', 'teng'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.purple, p: k3 });
      text("PostgreSQL 18 relizidagi yangilik:", 180, 755, { size: 25, weight: 700, color: C.purple });
      text("Endilikda nondeterministik collation'lar bilan LIKE amali ham to'g'ridan-to'g'ri ishlaydi!", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Lekin nondeterministik collation biroz sekinroq bo'lgani uchun faqat kerakli ustunlarga qo'llang.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L10').s - 0.4);

    const k = P(t, W('L10', 'saralash'), 0.6);
    withA(k, () => {
      card(140, 230, 520, 480, { fill: C.card, col: C.blue, p: k });
      pill("1. KODLASH VA COLLATION", 400, 285, C.blue, k, 22);
      text("• Kodlash: xotiradagi raqamlar.", 170, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• Collation: ORDER BY va taqqoslash.", 170, 430, { size: 22, color: C.blue, weight: 700, wrap: 460 });
      text("• Doimo UTF-8 kodlashini tanlang.", 170, 510, { size: 22, color: C.green, weight: 700, wrap: 460 });

      card(700, 230, 520, 480, { fill: C.card, col: C.purple, p: k });
      pill("2. ICU PROVAYDERI", 960, 285, C.purple, k, 22);
      text("• Platformadan mustaqil.", 730, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• O'zbek tili: uz-Latn-x-icu.", 730, 430, { size: 22, color: C.purple, weight: 700, wrap: 460 });
      text("• 'oʻ', 'gʻ', 'sh', 'ch' to'g'ri saralanadi.", 730, 510, { size: 22, color: C.ink, wrap: 460 });

      card(1260, 230, 520, 480, { fill: C.card, col: C.green, p: k });
      pill("3. CI VA XAVFSIZLIK", 1520, 285, C.green, k, 22);
      text("• Nondeterministik ci bilan case-insensitive.", 1290, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• UNIQUE email xavfsizligi.", 1290, 430, { size: 22, color: C.green, weight: 700, wrap: 460 });
      text("• Hamma joyda emas, kerakli ustunda.", 1290, 510, { size: 22, color: C.blue, weight: 700, wrap: 460 });

      card(140, 740, 1640, 170, { fill: '#fff', col: C.blue, p: k });
      text("Keyingi qismda:", 180, 790, { size: 25, weight: 700, color: C.blue });
      text("Ushbu qoidalarni PostgreSQL 18 psql terminalida o'zbekcha so'zlar bilan jonli sinab ko'ramiz.", 180, 840, { size: 22, color: C.ink, wrap: 1560 });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.concepts.s) sIntro(t);
    else if (t < TM.scenes.effects.s) sConcepts(t);
    else if (t < TM.scenes.providers.s) sEffects(t);
    else if (t < TM.scenes.deterministic.s) sProviders(t);
    else if (t < TM.scenes.xulosa.s) sDeterministic(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("11-bob: Kodlash va Collation — Tushuncha", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("Matnlarni saqlash, saralash tartibi va o'zbek alifbosi collation'lari", 960, 290, { size: 38, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("Kodlash (Encoding)", 180, 440, { size: 32, color: C.blue });
    text("• Harflar va raqamli baytlar\n• UTF-8: 1–4 bayt\n• Unicode barcha belgilar\n• server_encoding = UTF8\n• client_encoding", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("CHARACTER SET", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("Collation & Mintaqa", 750, 440, { size: 32, color: C.purple });
    text("• ORDER BY va taqqoslash\n• upper() va lower()\n• LC_COLLATE o'zgarmaydi\n• ICU provayderi\n• uz-Latn-x-icu", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("ICU LOCALE", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("Deterministik vs CI", 1320, 440, { size: 32, color: C.green });
    text("• Deterministik: baytlar teng\n• Nondeterministik (ci)\n• 'Salom' = 'salom'\n• UNIQUE(email) himoyasi\n• LIKE qo'llab-quvvatlanadi", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("CASE-INSENSITIVE", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
