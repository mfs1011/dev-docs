// SQL 14-bob 1-qism: "Tushuncha" — Cheklovlar (Constraints)
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
    hand("14-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Cheklovlar (Constraints)", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Ma'lumotlar Yaxlitligi, Mantiqiy Qoidalar va Bog'liqliklar Nazorati", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(360, 430, 1200 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'yaxlitligini'), 0.8);
    withA(kBadges, () => {
      pill("1. CHECK & NOT NULL", 380, 580, C.blue, kBadges, 21);
      pill("2. UNIQUE & PRIMARY KEY", 800, 580, C.green, kBadges, 21);
      pill("3. FOREIGN KEY & ON DELETE", 1220, 580, C.purple, kBadges, 21);
      pill("4. DEFERRABLE", 1580, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'cheklov'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Ma'lumot tipi ustunga qanday qiymat yozish mumkinligini cheklaydi, ammo bu ko'pincha yetarli emas:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Narx faqat musbat bo'lishi, chegirma narxdan oshmasligi, qatorlar takrorlanmasligi va o'zaro bog'liqliklar", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("aynan SQL cheklovlari (constraints) orqali to'liq nazoratga olinadi.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. CHECK & NOT NULL
  function sCheckNotNull(t) {
    heading("CHECK va NOT NULL: Mantiqiy Shartlar va NULL Tuzog'i", t, TM.scenes.check_not_null.s);

    const k1 = P(t, W('L2', 'ifodani'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 450, { fill: C.card, col: C.blue, p: k1 });
      hand("CHECK Cheklovi Mantiqi", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 150, { fill: '#fff', col: C.soft, p: k1 });
      text("1. Ustun darajasidagi CHECK:", 210, 360, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("narx numeric CONSTRAINT musbat_narx CHECK (narx > 0)", 210, 405, { size: 18, fam: MONO, color: C.ink, wrap: 640 });
      text("• Narx faqat 0 dan katta bo'lishi talab qilinadi.", 210, 445, { size: 18, color: C.soft, wrap: 640 });

      card(180, 490, 700, 160, { fill: '#fff', col: C.soft, p: k1 });
      text("2. Jadval darajasidagi CHECK:", 210, 530, { size: 20, weight: 700, color: C.purple, wrap: 640 });
      text("CHECK (narx > chegirma)", 210, 575, { size: 19, fam: MONO, color: C.purple, wrap: 640 });
      text("• Bir nechta ustunlararo munosabatni tekshiradi.", 210, 620, { size: 18, color: C.ink, wrap: 640 });
    });

    const k2 = P(t, W('L3', 'fols'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 450, { fill: C.card, col: C.red, p: k2 });
      hand("Katta Tuzoq: NULL va CHECK", 1040, 280, { size: 28, color: C.red, p: k2 });

      card(1040, 320, 700, 150, { fill: '#fff', col: C.red, p: k2 });
      text("CHECK qachon xato beradi?", 1070, 360, { size: 21, weight: 700, color: C.red, wrap: 640 });
      text("• CHECK faqat ifoda FALSE bo'lgandagina xato beradi!", 1070, 405, { size: 19, color: C.ink, wrap: 640 });
      text("• Agar qiymat NULL bo'lsa: (NULL > 0) natijasi NULL bo'ladi.", 1070, 445, { size: 19, weight: 700, color: C.red, wrap: 640 });

      card(1040, 490, 700, 160, { fill: '#fff', col: C.green, p: k2 });
      text("Natija va Yechim: NOT NULL Zarurati", 1070, 530, { size: 21, weight: 700, color: C.green, wrap: 640 });
      text("• NULL natija FALSE emas, shuning uchun qator qabul qilinadi!", 1070, 575, { size: 18, color: C.ink, wrap: 640 });
      text("• Demak, majburiy qiymat uchun NOT NULL alohida shart!", 1070, 620, { size: 18, weight: 700, color: C.green, wrap: 640 });
    });

    const kDesc = P(t, W('L3', 'alohida'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Cheklovga Nom Berish: CONSTRAINT nom", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Cheklovga o'z nomingizni berish (masalan, musbat_narx) xatolik yuz berganda xabarda aynan shu nom chiqishini ta'minlaydi. Aks holda tizim tushunarsiz avtomatik nom beradi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. UNIQUE & PRIMARY KEY
  function sUniquePrimary(t) {
    heading("UNIQUE va PRIMARY KEY: Yagonalik va Indeks", t, TM.scenes.unique_primary.s);

    const k1 = P(t, W('L4', 'bi-tri'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 450, { fill: C.card, col: C.blue, p: k1 });
      hand("UNIQUE Cheklovi", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 150, { fill: '#fff', col: C.soft, p: k1 });
      text("E'lon qilish: sku text UNIQUE", 210, 365, { size: 20, fam: MONO, weight: 700, color: C.blue, wrap: 640 });
      text("• Jadvalning barcha qatorlarida qiymat takrorlanmasligini saqlaydi.", 210, 415, { size: 19, color: C.ink, wrap: 640 });
      text("• Bazada avtomatik ravishda B-tree indeks yaratiladi.", 210, 455, { size: 19, color: C.green, wrap: 640 });

      card(180, 490, 700, 160, { fill: '#fff', col: C.soft, p: k1 });
      text("NULL va UNIQUE Munosabati:", 210, 530, { size: 20, weight: 700, color: C.purple, wrap: 640 });
      text("• Standartda ikkita NULL teng hisoblanmaydi.", 210, 570, { size: 18, color: C.ink, wrap: 640 });
      text("• Shuning uchun UNIQUE ustunga bir nechta NULL yozish mumkin.", 210, 610, { size: 18, color: C.soft, wrap: 640 });
      text("• PostgreSQL 15+: UNIQUE NULLS NOT DISTINCT bilan taqiqlash mumkin.", 210, 640, { size: 17, weight: 700, color: C.purple, wrap: 640 });
    });

    const k2 = P(t, W('L4', 'ustunni'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 450, { fill: C.card, col: C.green, p: k2 });
      hand("PRIMARY KEY (Birlamchi Kalit)", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 320, 700, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("Tenglama: PRIMARY KEY = UNIQUE + NOT NULL", 1070, 365, { size: 20, weight: 700, color: C.green, wrap: 640 });
      text("• Har bir qatorni yagona aniqlaydigan asosiy identifikator.", 1070, 415, { size: 19, color: C.ink, wrap: 640 });
      text("• Ustunga avtomatik NOT NULL cheklovi qo'shiladi.", 1070, 455, { size: 19, color: C.ink, wrap: 640 });

      card(1040, 490, 700, 160, { fill: '#fff', col: C.soft, p: k2 });
      text("Asosiy Qoidalar:", 1070, 530, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• Jadvalda eng ko'pi bilan BITTA birlamchi kalit bo'ladi.", 1070, 575, { size: 19, color: C.ink, wrap: 640 });
      text("• Tashqi kalitlar (FOREIGN KEY) sukut bo'yicha birlamchi kalitga bog'lanadi.", 1070, 620, { size: 18, color: C.soft, wrap: 640 });
    });

    const kDesc = P(t, W('L4', 'praymari'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Relyatsion Nazariya Tavsiyasi", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("PostgreSQL har bir jadvalda PRIMARY KEY bo'lishini majburiy talab qilmaydi, biroq relyatsion modelning oltin qoidasi: har qanday relyatsion jadval o'z birlamchi kalitiga ega bo'lishi lozim!", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. FOREIGN KEY
  function sForeignKey(t) {
    heading("FOREIGN KEY va ON DELETE Amallari", t, TM.scenes.foreign_key.s);

    const k1 = P(t, W('L5', 'mavjud'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 450, { fill: C.card, col: C.purple, p: k1 });
      hand("FOREIGN KEY (Tashqi Kalit)", 180, 280, { size: 28, color: C.purple, p: k1 });

      card(180, 320, 700, 150, { fill: '#fff', col: C.soft, p: k1 });
      text("E'lon qilish: ota_id int REFERENCES ota(id)", 210, 365, { size: 19, fam: MONO, weight: 700, color: C.purple, wrap: 640 });
      text("• Bola jadvaldagi qiymat ota jadvalda bo'lishini talab qiladi.", 210, 415, { size: 19, color: C.ink, wrap: 640 });
      text("• Jadvallararo ma'lumot yaxlitligini (referential integrity) saqlaydi.", 210, 455, { size: 18, color: C.soft, wrap: 640 });

      card(180, 490, 700, 160, { fill: '#fff', col: C.soft, p: k1 });
      text("Xususiyatlari:", 210, 530, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• O'z jadvaliga murojaat qilishi mumkin (parent_id daraxti).", 210, 575, { size: 19, color: C.ink, wrap: 640 });
      text("• Bola ustun NULL bo'lsa, tekshiruv o'tadi (ixtiyoriy aloqa).", 210, 620, { size: 19, color: C.green, wrap: 640 });
    });

    const k2 = P(t, W('L6', 'kaskad'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 450, { fill: C.card, col: C.blue, p: k2 });
      hand("ON DELETE Harakatlari", 1040, 280, { size: 28, color: C.blue, p: k2 });

      const actions = [
        { name: "CASCADE", col: C.red, desc: "Ota o'chirilsa, unga bog'langan hamma bola qatorlar ham birga o'chiriladi." },
        { name: "RESTRICT / NO ACTION", col: C.purple, desc: "Bolasi bor ota qatorni o'chirishni taqiqlaydi va ERROR beradi." },
        { name: "SET NULL / SET DEFAULT", col: C.green, desc: "Ota o'chganda bola qatordagi bog'lovchi ustunni NULL ga yoki DEFAULT ga o'tkazadi." }
      ];

      actions.forEach((act, idx) => {
        const y = 320 + idx * 105;
        card(1040, y, 700, 95, { fill: '#fff', col: act.col, p: k2 });
        pill(act.name, 1150, y + 30, act.col, k2, 16);
        text(act.desc, 1070, y + 68, { size: 17, color: C.ink, wrap: 640 });
      });
    });

    const kDesc = P(t, W('L6', 'bo‘shatib'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Muhim: Bola Ustunga Indeks Qo'yish!", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("PostgreSQL tashqi kalit yaratilganda bola ustunga avtomatik indeks QO'YMAYDI. Ota qator o'chirilganda yoki yangilanganda tez ishlashi uchun bola ustunga qo'lda B-tree indeks yaratish zarur!", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 5. DEFERRABLE & NOT ENFORCED
  function sDeferrableEnforced(t) {
    heading("DEFERRABLE va PostgreSQL 18 da NOT ENFORCED", t, TM.scenes.deferrable_enforced.s);

    const k1 = P(t, W('L7', 'kechiktirishga'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 450, { fill: C.card, col: C.blue, p: k1 });
      hand("DEFERRABLE (Kechiktiriladigan)", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 150, { fill: '#fff', col: C.soft, p: k1 });
      text("Cheklovni COMMIT gacha kechiktirish:", 210, 365, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("DEFERRABLE INITIALLY DEFERRED", 210, 410, { size: 19, fam: MONO, color: C.purple, wrap: 640 });
      text("• Har bir so'rovda emas, faqat tranzaksiya yakunida tekshiriladi.", 210, 455, { size: 18, color: C.ink, wrap: 640 });

      card(180, 490, 700, 160, { fill: '#fff', col: C.soft, p: k1 });
      text("Qachon juda qo'l keladi?", 210, 530, { size: 20, weight: 700, color: C.green, wrap: 640 });
      text("• Aylana bog'liqliklar (A B ga, B esa A ga bog'langan paytda).", 210, 575, { size: 19, color: C.ink, wrap: 640 });
      text("• Faqat UNIQUE, PRIMARY KEY, EXCLUDE va REFERENCES kechiktirilishi mumkin.", 210, 620, { size: 17, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L7', 'qo‘shildi'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("NOT ENFORCED (PostgreSQL 18)", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 320, 700, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("Yangi imkoniyat: NOT ENFORCED", 1070, 365, { size: 20, weight: 700, color: C.purple, wrap: 640 });
      text("• Cheklov yaratiladi, ammo baza uni jismonan tekshirmaydi.", 1070, 415, { size: 19, color: C.ink, wrap: 640 });
      text("• Ma'lumotlarning to'g'riligiga ilova (application) javobgar.", 1070, 455, { size: 18, color: C.soft, wrap: 640 });

      card(1040, 490, 700, 160, { fill: '#fff', col: C.soft, p: k2 });
      text("Foydasi va Maqsadi:", 1070, 530, { size: 20, weight: 700, color: C.blue, wrap: 640 });
      text("• Juda katta hajmli tahliliy bazalarda (OLAP) tekshiruv vaqtini tejaydi.", 1070, 575, { size: 19, color: C.ink, wrap: 640 });
      text("• SQL so'rov optimizatoriga muhim metadata sifatida yordam beradi.", 1070, 620, { size: 18, color: C.green, wrap: 640 });
    });

    const kDesc = P(t, W('L7', 'hujjatlashtirish'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Xulosa: Cheklovlar — Ishonch Garovi", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("Oddiy ilovalarda cheklovlarni doimo ENFORCED (baza tomonidan tekshiriladigan) holatda qoldiring. Bu ilovadagi kutilmagan bug'lardan va xato ma'lumotlar saqlanishidan 100% himoya qiladi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L8', 'mustahkamligini'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "CHECK va NOT NULL",
          desc: "CHECK NULL da xato bermaydi! Majburiy shartlar uchun doimo NOT NULL bilan birga qo'llang.",
          col: C.blue
        },
        {
          num: "2",
          title: "Har Jadvalda PRIMARY KEY",
          desc: "Relyatsion nazariya asosi. Qatorlarni yagona identifikatsiya qiladi va indeks yaratadi.",
          col: C.green
        },
        {
          num: "3",
          title: "FOREIGN KEY va ON DELETE",
          desc: "CASCADE, RESTRICT yoki SET NULL dan to'g'ri foydalaning va bola ustunlarga indeks qo'ying.",
          col: C.purple
        },
        {
          num: "4",
          title: "Nomli Cheklovlar",
          desc: "Har doim CONSTRAINT nom berib yozing — bu xatoliklarni tahlil qilishni sezilarli osonlashtiradi.",
          col: C.orange
        }
      ];

      items.forEach((it, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const x = 140 + colIdx * 840;
        const y = 220 + rowIdx * 350;

        card(x, y, 800, 310, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, y + 55, it.col, k, 24);
        hand(it.title, x + 90, y + 62, { size: 26, color: it.col, p: k });

        card(x + 40, y + 105, 720, 175, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 65, y + 160, { size: 21, color: C.ink, wrap: 670 });
      });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.check_not_null.s) sIntro(t);
    else if (t < S.unique_primary.s) sCheckNotNull(t);
    else if (t < S.foreign_key.s) sUniquePrimary(t);
    else if (t < S.deferrable_enforced.s) sForeignKey(t);
    else if (t < S.xulosa.s) sDeferrableEnforced(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 2-sahna (CHECK & NOT NULL) bo'yicha chiroyli poster kadri
    const t = TM.scenes.check_not_null.s + 6.0;
    frame(t);
  };
})();
