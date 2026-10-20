// SQL 39-bob 3-qism: "Dialektlar" — Birlamchi kalitni tanlash
(function () {
  const { L, W } = window.SY, TM = window.TM, TTY = window.TTY;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. DIALEKTLAR TAQQOSLOVI (0 -> 18.21s)
  function sDialektlarTaqqoslovi(t) {
    const k = P(t, 0.3, 1.0);
    hand("39-bob. Dialektlar Solishtiruvi", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL, MySQL va SQLite: Klasterli Saqlash Farqi", 960, 220, { size: 66, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Jadval qatorlari kalit tartibida saqlanadimi va uzun kalit narxi qanday?", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // 3 ta karta: PostgreSQL, MySQL, SQLite
      // 1: Postgres
      card(120, 380, 520, 420, { fill: C.card, col: C.blue, p: kBox });
      text("PostgreSQL 18.6", 150, 430, { size: 25, weight: 700, color: C.blue, fam: UI });
      text("Heap Fayl + Alohida B-tree", 150, 465, { size: 18, color: C.soft, fam: UI });
      sline(150, 490, 610, 490, { col: C.pencil, w: 1.5 });

      text("• Jadval kalit tartibida saqlanmaydi.", 150, 535, { size: 19, color: C.ink, fam: UI });
      text("• CLUSTER buyrug'i bir martalik.", 150, 575, { size: 19, color: C.ink, fam: UI });
      text("• Ikkilamchi indekslar TID ko'rsatadi,", 150, 615, { size: 19, color: C.ink, fam: UI });
      text("  birlamchi kalit nusxasini emas.", 150, 650, { size: 19, color: C.ink, fam: UI });
      text("• Uzun kalit: faqat PK o'zi kattalashadi.", 150, 695, { size: 19, weight: 600, color: C.blue, fam: UI });
      pill("Jadval erkin sahifalarda", 380, 765, C.blue, kBox, 16);

      // 2: MySQL
      const kMy = P(t, 5.0, 0.8);
      withA(kMy, () => {
        card(680, 380, 560, 420, { fill: C.card, col: C.orange, p: kMy });
        text("MySQL 9.7.2 (InnoDB)", 710, 430, { size: 25, weight: 700, color: C.orange, fam: UI });
        text("Klasterli Indeks Arxitekturasi", 710, 465, { size: 18, color: C.soft, fam: UI });
        sline(710, 490, 1210, 490, { col: C.pencil, w: 1.5 });

        text("• Jadval Birlamchi Kalit bo'yicha yotadi.", 710, 535, { size: 19, color: C.ink, fam: UI });
        text("• PK yo'q bo'lsa: yashirin GEN_CLUST_INDEX.", 710, 575, { size: 19, color: C.ink, fam: UI });
        text("• Ikkilamchi indekslar har yozuvda", 710, 615, { size: 19, weight: 600, color: C.red, fam: UI });
        text("  birlamchi kalit nusxasini olib yuradi!", 710, 650, { size: 19, weight: 600, color: C.red, fam: UI });
        text("• Uzun kalit: barcha indekslar shishadi.", 710, 695, { size: 19, weight: 700, color: C.orange, fam: UI });
        pill("Birlamchi Kalit = Jadvalning o'zi", 960, 765, C.orange, kMy, 16);
      });

      // 3: SQLite
      const kSq = P(t, 9.0, 0.8);
      withA(kSq, () => {
        card(1280, 380, 520, 420, { fill: C.card, col: C.green, p: kSq });
        text("SQLite 3.54.0", 1310, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        text("rowid va WITHOUT ROWID", 1310, 465, { size: 18, color: C.soft, fam: UI });
        sline(1310, 490, 1770, 490, { col: C.pencil, w: 1.5 });

        text("• Oddiy jadval: 64 bit rowid bo'yicha klaster.", 1310, 535, { size: 19, color: C.ink, fam: UI });
        text("• INTEGER PRIMARY KEY = rowid aliasi.", 1310, 575, { size: 19, color: C.ink, fam: UI });
        text("• WITHOUT ROWID: jadvalni to'g'ridan-", 1310, 615, { size: 19, color: C.ink, fam: UI });
        text("  to'g'ri PK bo'yicha klasterlaydi.", 1310, 650, { size: 19, color: C.ink, fam: UI });
        text("• Uzun kalit: WITHOUT ROWID da qimmat.", 1310, 695, { size: 19, weight: 600, color: C.green, fam: UI });
        pill("INTEGER PRIMARY KEY eng tezkor", 1540, 765, C.green, kSq, 16);
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 12.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Muhim Xulosa:", 160, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("MySQL InnoDB'da kalit uzunligi butun bazadagi barcha ikkilamchi indekslar xotirasini belgilaydi.", 160, 920, { size: 20, color: C.ink, fam: UI });
        text("PostgreSQL'da esa TID ko'rsatkichi tufayli ikkilamchi indekslar birlamchi kalit hajmiga bog'liq emas.", 160, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. UUID VA AVTO SON (18.21 -> 34.28s)
  function sUuidVaAutoSon(t) {
    heading("UUID va Avtomatik Son Generatsiyasi: Dialektlar Sintaksisi", t, TM.scenes.uuid_va_auto_son.s);

    const kCards = P(t, TM.scenes.uuid_va_auto_son.s + 0.3, 0.8);
    withA(kCards, () => {
      // 3 ta ustun: Postgres, MySQL, SQLite
      // 1: Postgres
      card(120, 380, 520, 420, { fill: C.card, col: C.blue, p: kCards });
      text("PostgreSQL 18.6", 150, 430, { size: 25, weight: 700, color: C.blue, fam: UI });
      sline(150, 455, 610, 455, { col: C.pencil, w: 1.5 });

      text("Sonli Kalit:", 150, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("id bigint GENERATED ALWAYS", 150, 535, { size: 18, fam: MONO, color: C.blue });
      text("  AS IDENTITY PRIMARY KEY", 150, 565, { size: 18, fam: MONO, color: C.blue });

      text("UUID Kalit:", 150, 620, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("id uuid DEFAULT uuidv7() PK", 150, 655, { size: 18, fam: MONO, color: C.green });
      text("uuid_extract_timestamp(v7)", 150, 695, { size: 18, fam: MONO, color: C.soft });

      pill("uuidv7() ichki tayyor funksiya", 380, 765, C.blue, kCards, 16);

      // 2: MySQL
      const kMy = P(t, 23.5, 0.8);
      withA(kMy, () => {
        card(680, 380, 560, 420, { fill: C.card, col: C.orange, p: kMy });
        text("MySQL 9.7.2", 710, 430, { size: 25, weight: 700, color: C.orange, fam: UI });
        sline(710, 455, 1210, 455, { col: C.pencil, w: 1.5 });

        text("Sonli Kalit:", 710, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("id bigint AUTO_INCREMENT PK", 710, 535, { size: 18, fam: MONO, color: C.orange });

        text("UUID Kalit:", 710, 620, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("id binary(16) PRIMARY KEY", 710, 655, { size: 18, fam: MONO, color: C.green });
        text("UUID_TO_BIN(UUID(), 1)", 710, 695, { size: 18, fam: MONO, color: C.red });

        pill("16 baytli BINARY(16) tavsiya", 960, 765, C.orange, kMy, 16);
      });

      // 3: SQLite
      const kSq = P(t, 27.5, 0.8);
      withA(kSq, () => {
        card(1280, 380, 520, 420, { fill: C.card, col: C.green, p: kSq });
        text("SQLite 3.54.0", 1310, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        sline(1310, 455, 1770, 455, { col: C.pencil, w: 1.5 });

        text("Sonli Kalit:", 1310, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("id INTEGER PRIMARY KEY", 1310, 535, { size: 18, fam: MONO, color: C.green });
        text("(avtomatik 64-bit rowid)", 1310, 565, { size: 18, fam: MONO, color: C.soft });

        text("UUID Kalit:", 1310, 620, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("id BLOB / TEXT PK", 1310, 655, { size: 18, fam: MONO, color: C.ink });
        text("Alohida UUID tipi mavjud emas", 1310, 695, { size: 18, fam: MONO, color: C.soft });

        pill("INTEGER PRIMARY KEY avto-o'sadi", 1540, 765, C.green, kSq, 16);
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 30.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#fbfbfb', col: C.pencil, p: kFoot });
        text("Dialekt tavsiyasi:", 160, 875, { size: 23, weight: 700, color: C.ink, fam: UI });
        text("Postgresda rasmiy 'uuid' tipi va uuidv7() mavjud. MySQL'da esa matn emas, 'binary(16)' tipi zarur.", 160, 920, { size: 20, color: C.ink, fam: UI });
        text("SQLite'da 'INTEGER PRIMARY KEY' boshqa barcha turlardan ko'ra ixchamroq va eng tez ishlaydi.", 160, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. TIPIK XATOLAR (34.28 -> 52.30s)
  function sTipikXatolar(t) {
    heading("Birlamchi Kalitda Eng Katta Xatolar va Oqibatlar", t, TM.scenes.tipik_xatolar.s);

    const kCards = P(t, TM.scenes.tipik_xatolar.s + 0.3, 0.8);
    withA(kCards, () => {
      // 3 ta xato kartasi
      // Xato 1
      card(120, 380, 520, 420, { fill: C.card, col: C.red, p: kCards });
      text("1. MySQL'da char(36) UUID", 150, 430, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(150, 455, 610, 455, { col: C.pencil, w: 1.5 });

      text("Nega yomon:", 150, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Har bir ikkilamchi indeks 2.7x", 150, 540, { size: 19, weight: 600, color: C.red, fam: UI });
      text("katta joy oladi (3.5MB -> 9.6MB).", 150, 575, { size: 19, weight: 600, color: C.red, fam: UI });
      text("Disk va RAM zaxirasi isrof bo'ladi.", 150, 615, { size: 19, color: C.ink, fam: UI });

      text("To'g'ri yo'l:", 150, 670, { size: 20, weight: 700, color: C.green, fam: UI });
      text("BIGINT yoki BINARY(16) ishlating.", 150, 705, { size: 19, fam: MONO, color: C.green });
      pill("2.7 baravar xotira isrofi!", 380, 765, C.red, kCards, 16);

      // Xato 2
      const kX2 = P(t, 41.5, 0.8);
      withA(kX2, () => {
        card(680, 380, 560, 420, { fill: C.card, col: C.orange, p: kX2 });
        text("2. Tasodifiy UUID v4 Kalit", 710, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
        sline(710, 455, 1210, 455, { col: C.pencil, w: 1.5 });

        text("Nega yomon:", 710, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("Tasodifiy qiymat B-tree sahifalarini", 710, 540, { size: 19, weight: 600, color: C.red, fam: UI });
        text("parchalaydi (Page Split). Keshdan", 710, 575, { size: 19, weight: 600, color: C.red, fam: UI });
        text("ma'lumotlarni surib chiqaradi.", 710, 615, { size: 19, color: C.ink, fam: UI });

        text("To'g'ri yo'l:", 710, 670, { size: 20, weight: 700, color: C.green, fam: UI });
        text("Tartiblangan uuidv7() yoki son.", 710, 705, { size: 19, fam: MONO, color: C.green });
        pill("B-Tree sahifalari bo'linishi", 960, 765, C.orange, kX2, 16);
      });

      // Xato 3
      const kX3 = P(t, 46.5, 0.8);
      withA(kX3, () => {
        card(1280, 380, 520, 420, { fill: C.card, col: C.purple, p: kX3 });
        text("3. O'zgaruvchan Tabiiy Kalit", 1310, 430, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1310, 455, 1770, 455, { col: C.pencil, w: 1.5 });

        text("Nega yomon:", 1310, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("Email yoki telefon o'zgarganda", 1310, 540, { size: 19, weight: 600, color: C.red, fam: UI });
        text("barcha bog'liq jadvallar bo'ylab", 1310, 575, { size: 19, weight: 600, color: C.red, fam: UI });
        text("kaskadli yangilanish talab etiladi.", 1310, 615, { size: 19, color: C.ink, fam: UI });

        text("To'g'ri yo'l:", 1310, 670, { size: 20, weight: 700, color: C.green, fam: UI });
        text("Sun'iy PK + UNIQUE(email).", 1310, 705, { size: 19, fam: MONO, color: C.green });
        pill("Aloqalar zanjiri xavfi", 1540, 765, C.purple, kX3, 16);
      });

      // Pastki izoh
      const kFoot = P(t, 49.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("Eslatma: UUID v7 ochiq URL'da maxfiy emas!", 160, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("uuid_extract_timestamp() orqali aniq sana va millisekund oshkor bo'ladi. Maxfiy identifikator", 160, 920, { size: 20, color: C.ink, fam: UI });
        text("talab etilsa, ommaviy API uchun alohida token yoki v4 ishlatish tavsiya qilinadi.", 160, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. OLTIN QOIDALAR (52.30 -> 73.06s)
  function sOltinQoidalar(t) {
    heading("Birlamchi Kalit Tanlashning Me'moriy Qoidalari", t, TM.scenes.oltin_qoidalar.s);

    const kCards = P(t, TM.scenes.oltin_qoidalar.s + 0.3, 0.8);
    withA(kCards, () => {
      // 2 ta katta blok
      // Chap: Standart va UUID
      card(120, 380, 800, 420, { fill: C.card, col: C.blue, p: kCards });
      text("1. Standart va Tarqoq Tizimlar:", 160, 430, { size: 25, weight: 700, color: C.blue, fam: UI });
      sline(160, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Yagona Baza Standarti: BIGINT IDENTITY / AUTO_INCREMENT", 160, 505, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  8 bayt, o'suvchi tartib, eng ixcham va kesh do'sti.", 160, 540, { size: 19, color: C.soft, fam: UI });

      text("• Mikroxizmatlar va Oflayn Ilovalar: UUID v7", 160, 600, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  16 bayt, vaqt tartibida qo'shiladi, B-tree shishmaydi.", 160, 635, { size: 19, color: C.soft, fam: UI });
      text("  MySQL'da doimo BINARY(16) bilan saqlang.", 160, 670, { size: 19, weight: 600, color: C.orange, fam: UI });

      pill("BIGINT standart | UUID v7 mikroxizmatlar uchun", 520, 765, C.blue, kCards, 16);

      // O'ng: SQLite va Tabiiy kalitlar
      const kRight = P(t, 58.5, 0.8);
      withA(kRight, () => {
        card(960, 380, 840, 420, { fill: C.card, col: C.green, p: kRight });
        text("2. SQLite va Tabiiy Kalit Qoidalari:", 1000, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        sline(1000, 455, 1760, 455, { col: C.pencil, w: 1.5 });

        text("• SQLite WITHOUT ROWID ni qachon ishlatish kerak?", 1000, 505, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("  Faqat ixcham kompozit jadvallarda (order_items (order_id, prod_id)).", 1000, 540, { size: 19, color: C.soft, fam: UI });
        text("  Bitta butun sonli kalitda oddiy jadval tezroq ishlaydi.", 1000, 575, { size: 19, weight: 600, color: C.green, fam: UI });

        text("• Tabiiy Kalit faqat o'zgarmas qiymatlarda:", 1000, 635, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("  Mamlakat kodi ('UZ'), valyuta ('USD'). Email va telefon emas!", 1000, 670, { size: 19, color: C.soft, fam: UI });

        pill("Ixcham kompozit = WITHOUT ROWID nomzodi", 1380, 765, C.green, kRight, 16);
      });

      // Pastki xulosa kartasi
      const kFoot = P(t, 64.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Me'moriy Yakuniy Xulosa:", 160, 875, { size: 24, weight: 700, color: C.blue, fam: UI });
        text("Birlamchi kalit butun ma'lumotlar bazasining jismoniy saqlanishi va indekslar hajmiga bevosita ta'sir qiladi.", 160, 920, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("To'g'ri tanlov RAM tejaydi, disk I/O yukini kamaytiradi va tizimni cheksiz masshtablash imkonini beradi.", 160, 960, { size: 21, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.uuid_va_auto_son.s) {
      sDialektlarTaqqoslovi(t);
    } else if (t < TM.scenes.tipik_xatolar.s) {
      sUuidVaAutoSon(t);
    } else if (t < TM.scenes.oltin_qoidalar.s) {
      sTipikXatolar(t);
    } else {
      sOltinQoidalar(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
