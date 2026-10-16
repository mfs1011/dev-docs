// SQL 19-bob 1-qism: "Tushuncha" — RETURNING va Yangi ID
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 22) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("19-bob. Tushuncha", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("RETURNING va Yangi ID", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Baza Hisoblagan Qiymatlar, Xavfsizlik va Atomar Qaytarish", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'avtomatik'), 0.8);
    withA(kBadges, () => {
      pill("INSERT: YANGI ID & DEFAULT", 380, 540, C.blue, kBadges, 20);
      pill("UPDATE: YANGI & ESKI (OLD/NEW)", 960, 540, C.green, kBadges, 20);
      pill("DELETE: O'CHIRILGAN QATOR NUSXASI", 1540, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'identifikatorini'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Yangi qator qo'shilganda uning birlamchi kaliti (ID) odatda baza tomonidan generatsiya qilinadi.", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Ilova keyingi amallar uchun shu ID ni bilishi shart, lekin uni olish qanday amalga oshiriladi?", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("PostgreSQL va zamonaviy SQL tizimlarida RETURNING bu muammoni tubdan hal etadi.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. RACE CONDITION
  function sRaceCondition(t) {
    heading("Muammo: Alohida SELECT va Poyga (Race Condition) Tuzog'i", t, TM.scenes.race_condition.s);

    const k1 = P(t, W('L2', 'Ay-di-ni'), 0.5);
    withA(k1, () => {
      card(120, 220, 800, 480, { fill: C.card, col: C.red, p: k1 });
      hand("Parallel So'rovlar Xavfi", 160, 280, { size: 28, color: C.red, p: k1 });

      card(160, 330, 720, 160, { fill: '#fff', col: C.red, p: k1 });
      text("Mijoz A: INSERT INTO mijozlar (ism) VALUES ('Ali');", 180, 375, { size: 17, fam: MONO, weight: 700, color: C.blue, wrap: 680 });
      text("Mijoz B: INSERT INTO mijozlar (ism) VALUES ('Vali'); (oraliqda)", 180, 415, { size: 17, fam: MONO, weight: 700, color: C.purple, wrap: 680 });
      text("Mijoz A: SELECT max(id) FROM mijozlar; --> 2 (Valining ID si!)", 180, 455, { size: 17, fam: MONO, weight: 700, color: C.red, wrap: 680 });

      card(160, 510, 720, 160, { fill: '#fff', col: C.red, p: k1 });
      text("Xatolik Oqibatlari:", 180, 555, { size: 20, weight: 700, color: C.red, wrap: 680 });
      text("• Mijoz A begona foydalanuvchining ID sini o'ziniki deb hisoblaydi.", 180, 600, { size: 18, color: C.ink, wrap: 680 });
      text("• Buyurtmalar va to'lovlar noto'g'ri odamga birikib ketadi.", 180, 635, { size: 17, color: C.soft, wrap: 680 });
    });

    const k2 = P(t, W('L2', 'poyga'), 0.5);
    withA(k2, () => {
      card(960, 220, 840, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("Nega Alohida SELECT Yaroqsiz?", 1000, 280, { size: 28, color: C.blue, p: k2 });

      card(1000, 330, 760, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Poyga Holati (Race Condition):", 1030, 375, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• Ikki tranzaksiya o'rtasidagi mikrosekundlik farq ma'lumotlarni buzadi.", 1030, 420, { size: 18, color: C.ink, wrap: 700 });
      text("• Yuqori yuklamali tizimlarda bu har kuni yuzlab xatolarga sabab bo'ladi.", 1030, 455, { size: 17, color: C.soft, wrap: 700 });

      card(1000, 510, 760, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Ortiqcha Tarmoq So'rovi (Round-Trip):", 1030, 555, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• Avval INSERT qilib, so'ng yana SELECT yuborish ilova tezligini 2 barobar pasaytiradi.", 1030, 600, { size: 18, color: C.ink, wrap: 700 });
      text("• Har bir qo'shimcha so'rov tarmoqda qimmatli millisekundlarni yo'qotadi.", 1030, 635, { size: 17, color: C.soft, wrap: 700 });
    });

    const kDesc = P(t, W('L2', 'bo‘ladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Muhim Xulosa:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("SELECT max(id) uslubi havaskorona va xavfli yondashuvdir. Multi-user muhitda faqat atomar usullarga tayanish shart.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. RETURNING CONCEPT
  function sReturningConcept(t) {
    heading("Yechim: RETURNING Klauzasining Ishlash Tamoyili", t, TM.scenes.returning_concept.s);

    const k1 = P(t, W('L3', 'Retyorning'), 0.5);
    withA(k1, () => {
      card(120, 220, 840, 480, { fill: C.card, col: C.green, p: k1 });
      hand("Bitta Atomar Buyruqda Qaytarish", 160, 280, { size: 28, color: C.green, p: k1 });

      card(160, 330, 760, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("Sintaksis Ko'rinishi:", 180, 375, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("INSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;", 180, 420, { size: 18, fam: MONO, weight: 700, color: C.ink, wrap: 700 });
      text("Baza qatorni yozadi va shu zahoti uning tayyor ID sini qaytaradi.", 180, 460, { size: 17, color: C.green, weight: 700, wrap: 700 });

      card(160, 510, 760, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Natija Formatlanishi:", 180, 555, { size: 20, weight: 700, color: C.green, wrap: 700 });
      text("• Xuddi SELECT buyrug'i kabi ustunlar ro'yxati, ifodalar yoki * beriladi.", 180, 600, { size: 18, color: C.ink, wrap: 700 });
      text("• RETURNING id, ism, yaratilgan, balans shaklida bir nechta qiymat olish mumkin.", 180, 635, { size: 17, color: C.soft, wrap: 700 });
    });

    const k2 = P(t, W('L3', 'xavfsizlikni'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("Asosiy Afzalliklari", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 130, { fill: '#fff', col: C.blue, p: k2 });
      text("1. 100% Izolyatsiya va Xavfsizlik:", 1060, 370, { size: 19, weight: 700, color: C.blue, wrap: 660 });
      text("Har bir ulanish faqat o'zi qo'shgan yoki o'zgartirgan qator ma'lumotini oladi. Begona so'rovlar aralasha olmaydi.", 1060, 410, { size: 17, color: C.ink, wrap: 660 });

      card(1040, 475, 720, 130, { fill: '#fff', col: C.green, p: k2 });
      text("2. Bitta Tarmoq Paketi (Zero Round-Trip):", 1060, 515, { size: 19, weight: 700, color: C.green, wrap: 660 });
      text("So'rov ketadi va natija darhol qaytadi. Tarmoq kechikishi va ma'lumotlar bazasi yuklamasi ikki barobar qisqaradi.", 1060, 555, { size: 17, color: C.ink, wrap: 660 });

      card(1040, 620, 720, 80, { fill: '#fff', col: C.purple, p: k2 });
      text("3. To'liq Atomarlik: O'zgarish va javob bir jarayonda bo'ladi.", 1060, 665, { size: 18, weight: 700, color: C.purple, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'kafolatlaydi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Amaliy Ta'rif:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("RETURNING — bu SQL da ma'lumot o'zgartiruvchi DML buyrug'ini bir vaqtning o'zida ma'lumot o'quvchi so'rovga aylantiruvchi eng qulay vositadir.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. COMMANDS SCOPE
  function sCommandsScope(t) {
    heading("INSERT, UPDATE va DELETE da RETURNING Qamrovi", t, TM.scenes.commands_scope.s);

    const k1 = P(t, W('L4', 'Insert'), 0.5);
    withA(k1, () => {
      card(120, 220, 520, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("1. INSERT RETURNING", 160, 280, { size: 28, color: C.blue, p: k1 });
      card(150, 330, 460, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("INSERT INTO mijozlar ...", 170, 375, { size: 18, fam: MONO, weight: 700, color: C.blue });
      text("RETURNING id, yaratilgan;", 170, 415, { size: 18, fam: MONO, weight: 700, color: C.blue });
      text("Baza hisoblagan qiymatlar: avtomatik ID, sukut bo'yicha now() sanasi.", 170, 455, { size: 17, color: C.ink, wrap: 420 });

      card(150, 510, 460, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("Qo'llanishi:", 170, 555, { size: 18, weight: 700, color: C.blue });
      text("• Front-end ga yangi yaratilgan obyekt ID sini qaytarish.", 170, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• Keyingi bog'liq yozuvlarni (foreign key) yaratishda ishlatish.", 170, 635, { size: 16, color: C.soft, wrap: 420 });
    });

    const k2 = P(t, W('L4', 'apdeyt'), 0.5);
    withA(k2, () => {
      card(680, 220, 520, 480, { fill: C.card, col: C.green, p: k2 });
      hand("2. UPDATE RETURNING", 720, 280, { size: 28, color: C.green, p: k2 });
      card(710, 330, 460, 160, { fill: '#fff', col: C.green, p: k2 });
      text("UPDATE mijozlar SET ...", 730, 375, { size: 18, fam: MONO, weight: 700, color: C.green });
      text("RETURNING balans, status;", 730, 415, { size: 18, fam: MONO, weight: 700, color: C.green });
      text("Sukut bo'yicha qatorning eng YANGI, o'zgargan holatini qaytaradi.", 730, 455, { size: 17, color: C.ink, wrap: 420 });

      card(710, 510, 460, 160, { fill: '#fff', col: C.green, p: k2 });
      text("Qo'llanishi:", 730, 555, { size: 18, weight: 700, color: C.green });
      text("• Hisoblangan yangi qoldiqni foydalanuvchi interfeysida yangilash.", 730, 595, { size: 16, color: C.ink, wrap: 420 });
      text("• Triggerlar kiritgan o'zgarishlarni bevosita kuzatish.", 730, 635, { size: 16, color: C.soft, wrap: 420 });
    });

    const k3 = P(t, W('L4', 'dilit'), 0.5);
    withA(k3, () => {
      card(1240, 220, 560, 480, { fill: C.card, col: C.purple, p: k3 });
      hand("3. DELETE RETURNING", 1280, 280, { size: 28, color: C.purple, p: k3 });
      card(1270, 330, 500, 160, { fill: '#fff', col: C.purple, p: k3 });
      text("DELETE FROM mijozlar ...", 1290, 375, { size: 18, fam: MONO, weight: 700, color: C.purple });
      text("RETURNING *;", 1290, 415, { size: 18, fam: MONO, weight: 700, color: C.purple });
      text("O'chirilayotgan qatorning to'liq nusxasi o'chishdan oldin ilovaga beriladi.", 1290, 455, { size: 17, color: C.ink, wrap: 460 });

      card(1270, 510, 500, 160, { fill: '#fff', col: C.purple, p: k3 });
      text("Qo'llanishi:", 1290, 555, { size: 18, weight: 700, color: C.purple });
      text("• Audit loglariga o'chirilgan ma'lumotlarni yozib qo'yish.", 1290, 595, { size: 16, color: C.ink, wrap: 460 });
      text("• Boshqa arxiv jadvaliga ko'chirish (CTE orqali).", 1290, 635, { size: 16, color: C.soft, wrap: 460 });
    });

    const kDesc = P(t, W('L4', 'etadi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim Eslatma:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Agar UPDATE yoki DELETE da shartga mos keladigan hech bir qator topilmasa, RETURNING hech qanday xatolik bermaydi — shunchaki 0 qatorli bo'sh natija qaytaradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. PG18 OLD NEW
  function sPg18OldNew(t) {
    heading("PostgreSQL 18: OLD va NEW Qiymatlarini Birga Qaytarish", t, TM.scenes.pg18_old_new.s);

    const k1 = P(t, W('L5', 'Postgres'), 0.5);
    withA(k1, () => {
      card(120, 220, 840, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Tarixiy Yangilik: OLD va NEW", 160, 280, { size: 28, color: C.blue, p: k1 });

      card(160, 330, 760, 180, { fill: '#fff', col: C.blue, p: k1 });
      text("PostgreSQL 18 Sintaksisi:", 180, 370, { size: 19, weight: 700, color: C.blue, wrap: 700 });
      text("UPDATE mijozlar SET balans = balans + 50000", 180, 410, { size: 17, fam: MONO, weight: 700, color: C.ink, wrap: 700 });
      text("RETURNING id, old.balans AS eski, new.balans AS yangi;", 180, 445, { size: 17, fam: MONO, weight: 700, color: C.blue, wrap: 700 });
      text("Natija: Har bir qatorning oldingi va yangilangan qiymati bitta jadvalda!", 180, 485, { size: 16, color: C.green, weight: 700, wrap: 700 });

      card(160, 530, 760, 140, { fill: '#fff', col: C.blue, p: k1 });
      text("Farqlarni Hisoblash Imkoniyati:", 180, 565, { size: 19, weight: 700, color: C.blue, wrap: 700 });
      text("RETURNING (new.balans - old.balans) AS farq deb to'g'ridan-to'g'ri hisoblash ifodalarini qo'llash mumkin.", 180, 605, { size: 17, color: C.ink, wrap: 700 });
    });

    const k2 = P(t, W('L5', 'solishtirib'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("Ilgari Qanday Qilinardi?", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("PostgreSQL 18 gacha Bo'lgan Muammo:", 1060, 375, { size: 19, weight: 700, color: C.red, wrap: 660 });
      text("• Eski qiymatni bilish uchun avval SELECT qilinardi (yana o'sha poyga xavfi!).", 1060, 420, { size: 17, color: C.ink, wrap: 660 });
      text("• Yoki maxsus trigger va audit jadvallari yozish talab etilardi.", 1060, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("Boshqa Buyruqlarda OLD va NEW:", 1060, 555, { size: 19, weight: 700, color: C.green, wrap: 660 });
      text("• INSERT da: old qiymatlar doimo NULL bo'ladi.", 1060, 600, { size: 17, color: C.ink, wrap: 660 });
      text("• DELETE da: new qiymatlar doimo NULL bo'ladi.", 1060, 635, { size: 17, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'bo‘ldi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Nomlarni Qayta Belgilash:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Agar jadvalda old yoki new nomli ustun bo'lsa, adashmaslik uchun RETURNING WITH (OLD AS o, NEW AS n) sintaksisi orqali boshqa alias berish mumkin.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: RETURNING Dasturlashning Oltin Qoidasi", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'retyorning'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.green, p: k1 });
      hand("Zamonaviy SQL Dasturlashda 3 Asosiy Qoida", 160, 280, { size: 30, color: C.green, p: k1 });

      card(160, 340, 500, 320, { fill: '#fff', col: C.blue, p: k1 });
      text("1. Yangi ID Olishda:", 190, 390, { size: 22, weight: 700, color: C.blue });
      text("Hech qachon SELECT max(id) qilmang.", 190, 440, { size: 18, color: C.red, weight: 700, wrap: 440 });
      text("Doimo INSERT ... RETURNING id ishlating. Bu poyga holatini butunlay yo'q qiladi.", 190, 490, { size: 17, color: C.ink, wrap: 440 });

      card(710, 340, 500, 320, { fill: '#fff', col: C.green, p: k1 });
      text("2. O'zgarishlarni Kuzatishda:", 740, 390, { size: 22, weight: 700, color: C.green });
      text("PostgreSQL 18 ning OLD va NEW imkoniyatidan foydalaning.", 740, 440, { size: 18, color: C.green, weight: 700, wrap: 440 });
      text("Bir vaqtning o'zida ham eski, ham yangi holatni olib audit va loglarni soddalashtiring.", 740, 490, { size: 17, color: C.ink, wrap: 440 });

      card(1260, 340, 500, 320, { fill: '#fff', col: C.purple, p: k1 });
      text("3. Tarmoq Unumdorligi:", 1290, 390, { size: 22, weight: 700, color: C.purple });
      text("Qo'shimcha so'rovlardan qoching.", 1290, 440, { size: 18, color: C.purple, weight: 700, wrap: 440 });
      text("RETURNING ilova va baza o'rtasidagi ortiqcha so'rovlarni qisqartirib, tezlikni oshiradi.", 1290, 490, { size: 17, color: C.ink, wrap: 440 });
    });

    const kDesc = P(t, W('L6', 'yondashuvdir.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("RETURNING klauzasi barcha zamonaviy yuqori yuklamali ilovalar uchun ajralmas standartdir. Keyingi amaliy qismda PostgreSQL 18.6 terminalida real so'rovlarni bajaramiz.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.race_condition.s) sIntro(t);
    else if (t < S.returning_concept.s) sRaceCondition(t);
    else if (t < S.commands_scope.s) sReturningConcept(t);
    else if (t < S.pg18_old_new.s) sCommandsScope(t);
    else if (t < S.xulosa.s) sPg18OldNew(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.returning_concept.s + 4.0;
    frame(t);
  };
})();
