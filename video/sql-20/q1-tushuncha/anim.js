// SQL 20-bob 1-qism: "Tushuncha" — UPSERT va MERGE
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
    hand("20-bob. Tushuncha", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("UPSERT va MERGE", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Qator Bo'lmasa Qo'sh, Bo'lsa Yangila: Atomar Yondashuv", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'mavjud'), 0.8);
    withA(kBadges, () => {
      pill("1. UPSERT: ATOMAR INSERT YOKI UPDATE", 400, 540, C.blue, kBadges, 20);
      pill("2. EXCLUDED: YANGI CHETLATILGAN QIYMAT", 960, 540, C.green, kBadges, 20);
      pill("3. MERGE: STANDART SQL BOG'LASH", 1520, 540, C.purple, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'yangilashdir.'), 0.8);
    withA(kDesc, () => {
      card(180, 640, 1560, 260, { fill: C.card, col: C.blue, p: kDesc });
      text("Amaliyotda eng ko'p uchraydigan vazifalardan biri — 'qator yo'q bo'lsa qo'sh, bor bo'lsa yangila':", 960, 710, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });
      text("Savatchaga tovar qo'shish, tashriflar hisoblagichi yoki tashqi tizim narxlarini sinxronlash.", 960, 765, { size: 22, align: 'center', color: C.soft, wrap: 1480 });
      text("Buni bitta xavfsiz so'rovda bajarish poyga holati va takror kalit xatolarini butunlay bartaraf etadi.", 960, 815, { size: 22, weight: 700, align: 'center', color: C.blue, wrap: 1480 });
    });
  }

  // 2. SELECT INSERT TRAP
  function sSelectInsertTrap(t) {
    heading("Muammo: SELECT + INSERT/UPDATE Poyga (Race Condition) Tuzog'i", t, TM.scenes.select_insert_trap.s);

    const k1 = P(t, W('L2', 'selekt'), 0.5);
    withA(k1, () => {
      card(120, 220, 800, 480, { fill: C.card, col: C.red, p: k1 });
      hand("Parallel So'rovlar Xatosi", 160, 280, { size: 28, color: C.red, p: k1 });

      card(160, 330, 720, 160, { fill: '#fff', col: C.red, p: k1 });
      text("Sessiya 1: SELECT * FROM savatcha WHERE tovar_id = 42; (topilmadi)", 180, 375, { size: 16, fam: MONO, weight: 700, color: C.blue, wrap: 680 });
      text("Sessiya 2: SELECT * FROM savatcha WHERE tovar_id = 42; (topilmadi)", 180, 415, { size: 16, fam: MONO, weight: 700, color: C.purple, wrap: 680 });
      text("Sessiya 1: INSERT INTO savatcha VALUES (42, 1); --> OK!", 180, 455, { size: 16, fam: MONO, weight: 700, color: C.green, wrap: 680 });

      card(160, 510, 720, 160, { fill: '#fff', col: C.red, p: k1 });
      text("Sessiya 2: INSERT INTO savatcha VALUES (42, 1);", 180, 555, { size: 16, fam: MONO, weight: 700, color: C.red, wrap: 680 });
      text("--> ERROR: duplicate key value violates unique constraint!", 180, 600, { size: 17, weight: 700, color: C.red, wrap: 680 });
      text("Natijada foydalanuvchiga 500 xatolik ko'rsatiladi yoki ma'lumot yo'qoladi.", 180, 635, { size: 17, color: C.ink, wrap: 680 });
    });

    const k2 = P(t, W('L2', 'to‘qnashuvi'), 0.5);
    withA(k2, () => {
      card(960, 220, 840, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("Nega Ikki Buyruq Yaroqsiz?", 1000, 280, { size: 28, color: C.blue, p: k2 });

      card(1000, 330, 760, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. So'rovlar Oralig'idagi Mikrosekundlar:", 1030, 375, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• SELECT va INSERT buyruqlari mustaqil tranzaksiyalarda ishlaydi.", 1030, 420, { size: 18, color: C.ink, wrap: 700 });
      text("• Ular orasida boshqa so'rov xuddi shu qatorni qo'shib ulguradi.", 1030, 455, { size: 17, color: C.soft, wrap: 700 });

      card(1000, 510, 760, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Ortiqcha Tarmoq Kechikishi (Round-Trip):", 1030, 555, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("• Har bir tekshirish uchun alohida tarmoq paketi ketishi server yukini oshiradi.", 1030, 600, { size: 18, color: C.ink, wrap: 700 });
      text("• Yechim: Ikkala amalni bitta atomar buyruqqa birlashtirish — UPSERT!", 1030, 635, { size: 17, color: C.green, weight: 700, wrap: 700 });
    });

    const kDesc = P(t, W('L2', 'bo‘ladi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.red, p: kDesc });
      hand("Muhim Xulosa:", 160, 780, { size: 26, color: C.red, p: kDesc });
      text("Ilova kodida 'avval SELECT qilib ko'rib, keyin INSERT yozish' odatidan butunlay voz kechish kerak. Buning uchun bazaning o'zi taqdim etgan atomar vositalar mavjud.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 3. UPSERT ON CONFLICT
  function sUpsertOnConflict(t) {
    heading("Yechim: INSERT ... ON CONFLICT (UPSERT) Mohiyati", t, TM.scenes.upsert_on_conflict.s);

    const k1 = P(t, W('L3', 'Apsert'), 0.5);
    withA(k1, () => {
      card(120, 220, 840, 480, { fill: C.card, col: C.green, p: k1 });
      hand("PostgreSQL ON CONFLICT Sintaksisi", 160, 280, { size: 28, color: C.green, p: k1 });

      card(160, 330, 760, 160, { fill: '#fff', col: C.blue, p: k1 });
      text("Buyruq Shakli:", 180, 375, { size: 20, weight: 700, color: C.blue, wrap: 700 });
      text("INSERT INTO lugat (soz) VALUES ('olma')", 180, 415, { size: 18, fam: MONO, weight: 700, color: C.ink, wrap: 700 });
      text("ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1;", 180, 455, { size: 18, fam: MONO, weight: 700, color: C.green, wrap: 700 });

      card(160, 510, 760, 160, { fill: '#fff', col: C.green, p: k1 });
      text("Ikki Xil Natija Kafolati:", 180, 555, { size: 20, weight: 700, color: C.green, wrap: 700 });
      text("• Qator yo'q bo'lsa: oddiy INSERT bajariladi va yangi qator yoziladi.", 180, 600, { size: 18, color: C.ink, wrap: 700 });
      text("• Qator bor bo'lsa (konflikt chiqsa): DO UPDATE bandi ishga tushadi.", 180, 635, { size: 17, color: C.soft, wrap: 700 });
    });

    const k2 = P(t, W('L3', 'takrorlanmas'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.blue, p: k2 });
      hand("Konflikt Maqsadi va Qoidalar", 1040, 280, { size: 28, color: C.blue, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("1. Hakam Indeks (Arbiter Index):", 1070, 375, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• (soz) qavs ichidagi ustunlarda UNIQUE yoki PRIMARY KEY bo'lishi shart.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• Baza aynan shu indeks bo'yicha to'qnashuvni aniqlaydi.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("2. ON CONFLICT DO NOTHING Muqobili:", 1070, 555, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• Agar yangilash kerak bo'lmasa, shunchaki xatosiz o'tkazib yuborish mumkin.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Hech qanday xatolik qaytmaydi, mavjud qator o'zgarishsiz qoladi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'kafolatlaydi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.green, p: kDesc });
      hand("Atomarlik Kafolati:", 160, 780, { size: 26, color: C.green, p: kDesc });
      text("PostgreSQL hujjatiga ko'ra: yuqori parallellik ostida ham ikkala natijadan biri albatta to'liq va xatosiz bajarilishi kafolatlanadi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 4. EXCLUDED TABLE
  function sExcludedTable(t) {
    heading("EXCLUDED: Chetlatilgan Yangi Qiymatlar Jadvali", t, TM.scenes.excluded_table.s);

    const k1 = P(t, W('L4', 'Eksklyuded'), 0.5);
    withA(k1, () => {
      card(120, 220, 840, 480, { fill: C.card, col: C.green, p: k1 });
      hand("EXCLUDED Qanday Ishlaydi?", 160, 280, { size: 28, color: C.green, p: k1 });

      card(160, 330, 760, 180, { fill: '#fff', col: C.green, p: k1 });
      text("So'rov Misoli:", 180, 370, { size: 19, weight: 700, color: C.green, wrap: 700 });
      text("INSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5)", 180, 410, { size: 17, fam: MONO, weight: 700, color: C.ink, wrap: 700 });
      text("ON CONFLICT (soz) DO UPDATE", 180, 445, { size: 17, fam: MONO, weight: 700, color: C.blue, wrap: 700 });
      text("SET soni = lugat.soni + EXCLUDED.soni;", 180, 480, { size: 17, fam: MONO, weight: 700, color: C.green, wrap: 700 });

      card(160, 530, 760, 140, { fill: '#fff', col: C.blue, p: k1 });
      text("Farqni Tushunish:", 180, 565, { size: 19, weight: 700, color: C.blue, wrap: 700 });
      text("• lugat.soni — jadvaldagi eski qiymat (masalan, 2).", 180, 605, { size: 17, color: C.ink, wrap: 700 });
      text("• EXCLUDED.soni — hozir kiritilayotgan yangi qiymat (5). Natija: 7 bo'ladi!", 180, 635, { size: 17, color: C.green, weight: 700, wrap: 700 });
    });

    const k2 = P(t, W('L4', 'imkonini'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.purple, p: k2 });
      hand("EXCLUDED Ning Qulayliklari", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("1. Qiymatni Qayta Yozmaslik:", 1070, 375, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("• VALUES da yozilgan murakkab ifodalarni SET da takrorlash shart emas.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• EXCLUDED orqali barcha maydonlarga murojaat qilish mumkin.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Ko'p Qatorli Ommaviy UPSERT:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• Har bir qator o'zining mos yangi qiymatiga ega bo'ladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Bitta buyruq bilan yuzlab qatorlarni sinxronlash mumkin.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L4', 'beradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Qat'iy Cheklov:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("ON CONFLICT DO UPDATE deterministikdir: bitta INSERT buyrug'i bitta qatorni faqat bir marta o'zgartira oladi. Agar kiritilayotgan qatorlar orasida bir xil kalit ikki marta kelsa, xatolik beradi.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 5. MERGE STANDARD
  function sMergeStandard(t) {
    heading("Standart SQL: MERGE Buyrug'ining Imkoniyatlari", t, TM.scenes.merge_standard.s);

    const k1 = P(t, W('L5', 'myorj'), 0.5);
    withA(k1, () => {
      card(120, 220, 840, 480, { fill: C.card, col: C.blue, p: k1 });
      hand("Standart MERGE Sintaksisi", 160, 280, { size: 28, color: C.blue, p: k1 });

      card(160, 330, 760, 180, { fill: '#fff', col: C.blue, p: k1 });
      text("MERGE INTO ombor o USING yangi_kelgan y ON o.sku = y.sku", 180, 370, { size: 17, fam: MONO, weight: 700, color: C.blue, wrap: 700 });
      text("WHEN MATCHED AND y.ochirilsin THEN DELETE", 180, 410, { size: 17, fam: MONO, weight: 700, color: C.red, wrap: 700 });
      text("WHEN MATCHED THEN UPDATE SET soni = o.soni + y.soni", 180, 445, { size: 17, fam: MONO, weight: 700, color: C.green, wrap: 700 });
      text("WHEN NOT MATCHED THEN INSERT VALUES (y.sku, y.soni);", 180, 480, { size: 17, fam: MONO, weight: 700, color: C.purple, wrap: 700 });

      card(160, 530, 760, 140, { fill: '#fff', col: C.green, p: k1 });
      text("Uch Amal Bitta Buyruqda:", 180, 565, { size: 19, weight: 700, color: C.green, wrap: 700 });
      text("DELETE, UPDATE va INSERT har bir qator holatiga qarab avtomatik tanlanadi va bajariladi.", 180, 605, { size: 17, color: C.ink, wrap: 700 });
    });

    const k2 = P(t, W('L5', 'dilit'), 0.5);
    withA(k2, () => {
      card(1000, 220, 800, 480, { fill: C.card, col: C.green, p: k2 });
      hand("MERGE va ON CONFLICT Farqi", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 330, 720, 160, { fill: '#fff', col: C.green, p: k2 });
      text("1. DELETE Qobiliyati:", 1070, 375, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("• ON CONFLICT faqat INSERT va UPDATE qila oladi, DELETE qila olmaydi.", 1070, 420, { size: 18, color: C.ink, wrap: 660 });
      text("• MERGE esa keraksiz qatorlarni to'g'ridan-to'g'ri o'chirishga qodir.", 1070, 455, { size: 17, color: C.soft, wrap: 660 });

      card(1040, 510, 720, 160, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Parallellik va Standart:", 1070, 555, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("• MERGE ANSI SQL standartiga to'liq mos keladi.", 1070, 600, { size: 18, color: C.ink, wrap: 660 });
      text("• Ammo yuqori parallel INSERT larda ON CONFLICT ko'proq tavsiya etiladi.", 1070, 635, { size: 17, color: C.soft, wrap: 660 });
    });

    const kDesc = P(t, W('L5', 'bajaradi.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("merge_action() Yordamchisi:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("PostgreSQL 17 dan boshlab MERGE buyrug'ida RETURNING merge_action() orqali aynan qaysi amal (INSERT, UPDATE yoki DELETE) bajarilganini qaytarib olish mumkin.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: UPSERT va MERGE Ning Oltin Qoidalari", t, TM.scenes.xulosa.s);

    const k1 = P(t, W('L6', 'poyga'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 480, { fill: C.card, col: C.green, p: k1 });
      hand("Ma'lumotlar Bazasida Qatorlarni Birlashtirish Qoidalari", 160, 280, { size: 30, color: C.green, p: k1 });

      card(160, 340, 500, 320, { fill: '#fff', col: C.blue, p: k1 });
      text("1. Har Doim Bitta Buyruq", 190, 390, { size: 22, weight: 700, color: C.blue });
      text("SELECT + INSERT zanjiridan butunlay voz keching.", 190, 440, { size: 18, color: C.red, weight: 700, wrap: 440 });
      text("Doimo atomar ON CONFLICT yoki MERGE dan foydalaning.", 190, 490, { size: 17, color: C.ink, wrap: 440 });

      card(710, 340, 500, 320, { fill: '#fff', col: C.green, p: k1 });
      text("2. EXCLUDED Dan Foydalaning", 740, 390, { size: 22, weight: 700, color: C.green });
      text("Yangi kiritilgan qiymatni mavjud ustunga qo'shish.", 740, 440, { size: 18, color: C.green, weight: 700, wrap: 440 });
      text("Hisoblagichlar va ommaviy yuklashlarda EXCLUDED eng toza vositadir.", 740, 490, { size: 17, color: C.ink, wrap: 440 });

      card(1260, 340, 500, 320, { fill: '#fff', col: C.purple, p: k1 });
      text("3. MERGE Bilan Sinxronlash", 1290, 390, { size: 22, weight: 700, color: C.purple });
      text("Tashqi jadvallarni to'liq solishtirish.", 1290, 440, { size: 18, color: C.purple, weight: 700, wrap: 440 });
      text("DELETE, UPDATE va INSERT amallarini bitta umumiy oqimga bog'lang.", 1290, 490, { size: 17, color: C.ink, wrap: 440 });
    });

    const kDesc = P(t, W('L6', 'chorasidir.'), 0.5);
    withA(kDesc, () => {
      card(120, 730, 1680, 200, { fill: C.card, col: C.blue, p: kDesc });
      hand("Yakuniy Xulosa:", 160, 780, { size: 26, color: C.blue, p: kDesc });
      text("Keyingi amaliy qismda PostgreSQL 18.6 terminalida real so'zlar lug'ati hisoblagichi va ombor mahsulotlarini MERGE qilish amaliyotini bajaramiz.", 160, 835, { size: 20, color: C.ink, wrap: 1600 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.select_insert_trap.s) sIntro(t);
    else if (t < S.upsert_on_conflict.s) sSelectInsertTrap(t);
    else if (t < S.excluded_table.s) sUpsertOnConflict(t);
    else if (t < S.merge_standard.s) sExcludedTable(t);
    else if (t < S.xulosa.s) sMergeStandard(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.upsert_on_conflict.s + 4.0;
    frame(t);
  };
})();
