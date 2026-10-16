// SQL 16-bob 1-qism: "Tushuncha" — Jadvalni o'zgartirish (ALTER TABLE)
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
    hand("16-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Jadvalni O'zgartirish (ALTER TABLE)", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Ma'lumotni Yo'qotmasdan Sxema, Ustunlar va Cheklovlarni Yangilash", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 430, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'alter'), 0.8);
    withA(kBadges, () => {
      pill("1. Asosiy ALTER Amallari", 400, 580, C.blue, kBadges, 21);
      pill("2. DEFAULT Tezligi", 840, 580, C.green, kBadges, 21);
      pill("3. Bog'liqliklar & CASCADE", 1280, 580, C.purple, kBadges, 21);
      pill("4. TRUNCATE Xususiyatlari", 1660, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'tuzilmani'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Loyihalar rivojlanishi davomida jadval tuzilmasi muntazam o'zgarib turadi:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Jadvalni o'chirib qayta yaratish mavjud ma'lumotlarni yo'q qiladi va boshqa bog'langan jadvallarni buzadi.", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("ALTER TABLE ma'lumotlarni saqlab qolgan holda jadval sxemasini moslashuvchan boshqarish imkonini beradi.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. ASOSIY AMALLAR
  function sAsosiyAmallar(t) {
    heading("ALTER TABLE ning Asosiy Amallari", t, TM.scenes.asosiy_amallar.s);

    const k = P(t, W('L2', 'qo‘shish'), 0.5);
    withA(k, () => {
      const ops = [
        {
          num: "1",
          title: "Ustun Qo'shish",
          cmd: "ALTER TABLE t ADD COLUMN c tip [DEFAULT ...];",
          desc: "Yangi ustun qo'shiladi. DEFAULT bo'lmasa qatorlar NULL bilan to'ladi.",
          col: C.blue
        },
        {
          num: "2",
          title: "Ustunni O'chirish",
          cmd: "ALTER TABLE t DROP COLUMN c [CASCADE];",
          desc: "Ustun va unga tegishli cheklovlar o'chadi. Bog'liq obyektlar bo'lsa CASCADE talab qilinadi.",
          col: C.red
        },
        {
          num: "3",
          title: "Tipni O'zgartirish",
          cmd: "ALTER TABLE t ALTER COLUMN c TYPE tip [USING ...];",
          desc: "Ma'lumot tipi o'zgartiriladi. Avtomatik konvertatsiya bo'lmasa USING ifodasi beriladi.",
          col: C.purple
        },
        {
          num: "4",
          title: "NOT NULL Boshqaruvi",
          cmd: "ALTER TABLE t ALTER COLUMN c SET NOT NULL;",
          desc: "SET NOT NULL yoki DROP NOT NULL orqali bo'sh qiymatlar nazorati o'rnatiladi.",
          col: C.orange
        },
        {
          num: "5",
          title: "Cheklovlar Qo'shish",
          cmd: "ALTER TABLE t ADD CONSTRAINT nom CHECK (...);",
          desc: "Jadvalga nomli CHECK yoki FOREIGN KEY cheklovlari qo'shiladi.",
          col: C.green
        },
        {
          num: "6",
          title: "Nomlarni O'zgartirish",
          cmd: "ALTER TABLE t RENAME COLUMN a TO b;\nALTER TABLE t RENAME TO yangi_nom;",
          desc: "Ustun yoki butun jadval nomini xavfsiz qayta nomlash.",
          col: C.blue
        }
      ];

      ops.forEach((op, idx) => {
        const colIdx = idx % 3;
        const rowIdx = Math.floor(idx / 3);
        const x = 140 + colIdx * 560;
        const y = 220 + rowIdx * 350;

        card(x, y, 520, 320, { fill: C.card, col: op.col, p: k });
        pill(op.num, x + 50, y + 55, op.col, k, 24);
        hand(op.title, x + 90, y + 62, { size: 24, color: op.col, p: k });

        card(x + 25, y + 105, 470, 185, { fill: '#fff', col: C.soft, p: k });
        text(op.cmd, x + 45, y + 140, { size: 15, fam: MONO, weight: 700, color: op.col, wrap: 430 });
        text(op.desc, x + 45, y + 215, { size: 17, color: C.ink, wrap: 430 });
      });
    });
  }

  // 3. DEFAULT TEZLIGI
  function sDefaultTezligi(t) {
    heading("Katta Jadvallar va O'zgarmas DEFAULT Tezligi", t, TM.scenes.default_tezligi.s);

    const k1 = P(t, W('L3', 'o‘zgarmas'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.green, p: k1 });
      pill("TEZKOR METADATA", 530, 275, C.green, k1, 20);
      hand("O'zgarmas (Constant) DEFAULT", 530, 335, { size: 30, align: 'center', color: C.green, p: k1 });

      const goodItems = [
        { label: "Qanday ishlaydi:", val: "PostgreSQL 11+ da o'zgarmas qiymat (masalan DEFAULT 0 yoki 'faol') jadvalning fizik qatorlarini qayta yozmaydi!" },
        { label: "Qayerda saqlanadi:", val: "Qiymat tizim katalogida (metadata) bitta joyda saqlanadi." },
        { label: "O'qish paytida:", val: "Eski qatorlar o'qilganda ushbu qiymat avtomatik qaytariladi." },
        { label: "Katta jadvallarda:", val: "100 million qatorli jadvalda ham operatsiya 1 millisekundda tugaydi!" }
      ];

      goodItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(165, cy, 730, 105, { fill: '#fff', col: C.soft, p: k1 });
        text(it.label, 190, cy + 40, { size: 19, weight: 700, color: C.green, wrap: 680 });
        text(it.val, 190, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });

    const k2 = P(t, W('L3', 'millionlab'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.red, p: k2 });
      pill("XAVFLI QAYTA YOZISH", 1390, 275, C.red, k2, 20);
      hand("O'zgaruvchan (Volatile) DEFAULT", 1390, 335, { size: 30, align: 'center', color: C.red, p: k2 });

      const badItems = [
        { label: "Misollar:", val: "DEFAULT clock_timestamp(), random() kabi har chaqiruvda boshqa qiymat beruvchi ifodalar." },
        { label: "Nima sodir bo'ladi:", val: "Tizim har bir qator uchun alohida hisoblash uchun butun jadvalni fizik qayta yozishga majbur bo'ladi." },
        { label: "Katta xavf:", val: "Jadval soatlab to'liq qulflanadi (lock), server xotirasi va disk joyi to'lib tizim qotib qolishi mumkin." },
        { label: "Tavsiya:", val: "Avval ustunni DEFAULT siz qo'shing, so'ng qatorlarni to'ldiring." }
      ];

      badItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(1025, cy, 730, 105, { fill: '#fff', col: C.soft, p: k2 });
        text(it.label, 1050, cy + 40, { size: 19, weight: 700, color: C.red, wrap: 680 });
        text(it.val, 1050, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });
  }

  // 4. CASCADE VA TRUNCATE
  function sCascadeVaTruncate(t) {
    heading("Bog'liqliklar, CASCADE va TRUNCATE", t, TM.scenes.cascade_va_truncate.s);

    const k1 = P(t, W('L4', 'kaskad'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.purple, p: k1 });
      pill("BOG'LIQLIKLAR", 530, 275, C.purple, k1, 20);
      hand("DROP TABLE ... CASCADE Xavfi", 530, 335, { size: 30, align: 'center', color: C.purple, p: k1 });

      const casItems = [
        { label: "Oddiy DROP rad etiladi:", val: "Agar jadvalga tashqi kalit, view yoki trigger bog'langan bo'lsa, PostgreSQL uni o'chirishga yo'l qo'ymaydi." },
        { label: "CASCADE nima qiladi:", val: "Bog'langan barcha tashqi kalitlarni va view larni avtomatik rekursiv o'chirib yuboradi." },
        { label: "Muhim farq:", val: "Bola jadvalning o'zini o'chirmaydi, faqat undagi tashqi kalit cheklovini olib tashlaydi." },
        { label: "Oltin Qoida:", val: "Avval DROP ni CASCADE siz bajarib, DETAIL xabarini o'qing!" }
      ];

      casItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(165, cy, 730, 105, { fill: '#fff', col: C.soft, p: k1 });
        text(it.label, 190, cy + 40, { size: 19, weight: 700, color: C.purple, wrap: 680 });
        text(it.val, 190, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });

    const k2 = P(t, W('L4', 'Trankeyt'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.blue, p: k2 });
      pill("TEZKOR TOZALASH", 1390, 275, C.blue, k2, 20);
      hand("TRUNCATE vs DELETE", 1390, 335, { size: 30, align: 'center', color: C.blue, p: k2 });

      const trunItems = [
        { label: "Qator-qator ko'rmaydi:", val: "TRUNCATE butun ma'lumot bloklarini birdan bo'shatadi, shuning uchun DELETE dan minglab marta tez." },
        { label: "Disk joyini darhol bo'shatadi:", val: "VACUUM ni kutmasdan disk maydonini operatsion tizimga qaytaradi." },
        { label: "ACCESS EXCLUSIVE Qulfi:", val: "Jadval bilan ishlayotgan barcha parallel so'rovlarni to'xtatadi." },
        { label: "Tranzaksiyaviy Xavfsiz:", val: "PostgreSQL da BEGIN ... TRUNCATE ... ROLLBACK orqali ma'lumotlar qaytariladi!" }
      ];

      trunItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(1025, cy, 730, 105, { fill: '#fff', col: C.soft, p: k2 });
        text(it.label, 1050, cy + 40, { size: 19, weight: 700, color: C.blue, wrap: 680 });
        text(it.val, 1050, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L5', 'xavfsiz'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "DEFAULT ni O'zgarmas Qiling",
          desc: "Katta jadvallarga yangi ustun qo'shganda qatorlar qayta yozilmasligi uchun faqat o'zgarmas qiymat bering.",
          col: C.green
        },
        {
          num: "2",
          title: "CASCADE dan Ehtiyot Bo'ling",
          desc: "Ko'r-ko'rona CASCADE ishlatish muhim view va bog'liqliklarni o'chirib yuborishi mumkin. Avval DETAIL ni ko'ring.",
          col: C.red
        },
        {
          num: "3",
          title: "Migratsiyalarni ROLLBACK Qiling",
          desc: "PostgreSQL da DDL buyruqlari tranzaksiyada xavfsiz ishlaydi. Nozik sxema o'zgarishlarini BEGIN ichida sinab ko'ring.",
          col: C.blue
        }
      ];

      items.forEach((it, idx) => {
        const x = 140 + idx * 560;
        card(x, 220, 520, 430, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, 275, it.col, k, 24);
        hand(it.title, x + 90, 282, { size: 22, color: it.col, p: k });

        card(x + 25, 330, 470, 290, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 50, 395, { size: 21, color: C.ink, wrap: 420 });
      });

      card(140, 690, 1640, 220, { fill: C.card, col: C.blue, p: k });
      hand("Sxemani Xavfsiz O'zgartirish — Ishlab Turgan Tizimlar Barqarorligi Asosi!", 960, 755, { size: 34, align: 'center', color: C.blue, p: k });
      text("ALTER TABLE mexanizmlarini chuqur tushunish ishlab chiqarish (production) muhitida uzilishlarsiz migratsiya qilishga imkon beradi.", 960, 825, { size: 23, align: 'center', color: C.ink, wrap: 1540 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.asosiy_amallar.s) sIntro(t);
    else if (t < S.default_tezligi.s) sAsosiyAmallar(t);
    else if (t < S.cascade_va_truncate.s) sDefaultTezligi(t);
    else if (t < S.xulosa.s) sCascadeVaTruncate(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 2-sahna (Asosiy amallar kartalari) bo'yicha chiroyli poster
    const t = TM.scenes.asosiy_amallar.s + 5.0;
    frame(t);
  };
})();
