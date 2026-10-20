// SQL 39-bob 1-qism: "Tushuncha" — Birlamchi kalitni tanlash
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. TABIIY VA SUN'IY KALITLAR (0 -> 16.12s)
  function sTabiiyVsSuniy(t) {
    const k = P(t, 0.3, 1.0);
    hand("39-bob. Birlamchi Kalitni Tanlash", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Tabiiy va Sun'iy Kalitlar (Natural vs Surrogate)", 960, 230, { size: 70, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Qatorning yagona identifikatori: biznes ma'lumoti yoki texnik kalit?", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(320, 345, 1280 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Tabiiy Kalit
      card(140, 390, 780, 410, { fill: C.card, col: C.orange, p: kBox });
      text("Tabiiy Kalit (Natural Key)", 180, 440, { size: 26, weight: 700, color: C.orange, fam: UI });
      text("Ma'lumotning o'zidagi noyob biznes qiymati", 180, 475, { size: 19, color: C.soft, fam: UI });

      text("Ustunlar: email, pasport_raqami, mamlakat 'UZ'", 180, 530, { size: 21, weight: 600, fam: MONO, color: C.ink });
      sline(180, 555, 880, 555, { col: C.pencil, w: 1.5 });
      text("• Xavf: Email yoki pasport o'zgarishi mumkin!", 180, 600, { size: 21, weight: 600, color: C.red, fam: UI });
      text("• Tashqi kalitlar bog'langan bo'lsa, kaskadli", 180, 645, { size: 21, color: C.ink, fam: UI });
      text("  yangilanish butun bazaga qimmatga tushadi.", 180, 680, { size: 21, color: C.ink, fam: UI });
      pill("O'zgaruvchan biznes ustunlari", 530, 750, C.orange, kBox, 18);

      // O'ng: Sun'iy Kalit
      const kSurr = P(t, 7.0, 0.8);
      withA(kSurr, () => {
        card(1000, 390, 780, 410, { fill: C.card, col: C.green, p: kSurr });
        text("Sun'iy Kalit (Surrogate Key)", 1040, 440, { size: 26, weight: 700, color: C.green, fam: UI });
        text("Faqat identifikatsiya uchun qo'shilgan texnik qiymat", 1040, 475, { size: 19, color: C.soft, fam: UI });

        text("Ustunlar: id BIGINT IDENTITY, id UUID", 1040, 530, { size: 21, weight: 600, fam: MONO, color: C.ink });
        sline(1040, 555, 1740, 555, { col: C.pencil, w: 1.5 });
        text("• Afzallik: Mutlaqo o'zgarmas, mustaqil son.", 1040, 600, { size: 21, weight: 600, color: C.green, fam: UI });
        text("• Biznes o'zgarsa ham ichki aloqalar buzilmaydi.", 1040, 645, { size: 21, color: C.ink, fam: UI });
        text("• Email esa oddiy UNIQUE ustun bo'lib qoladi.", 1040, 690, { size: 21, color: C.ink, fam: UI });
        pill("Tavsiya: Sun'iy PK + UNIQUE(email)", 1390, 750, C.green, kSurr, 18);
      });

      // Pastki xulosa kartasi
      const kAlert = P(t, 11.5, 0.8);
      withA(kAlert, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.blue, p: kAlert });
        text("Oltin Qoida:", 180, 875, { size: 24, weight: 700, color: C.blue, fam: UI });
        text("Birlamchi kalit hech qachon o'zgarmasligi kerak. Tabiiy kalitni faqat mamlakat kodi ('UZ') kabi", 180, 920, { size: 21, color: C.ink, fam: UI });
        text("haqiqatan barqaror qiymatlarda ishlating, qolgan barcha hollarda sun'iy kalit tanlang.", 180, 960, { size: 21, color: C.soft, fam: UI });
      });
    });
  }

  // 2. BUTUN SON YOKI UUID TANLOVI (16.12 -> 34.78s)
  function sSonVsUuid(t) {
    heading("Butun Son (BIGINT) yoki UUID Tanlovi", t, TM.scenes.son_vs_uuid.s);

    const kCards = P(t, TM.scenes.son_vs_uuid.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Avtomatik oshuvchi son
      card(140, 390, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("Avtomatik oshuvchi son (BIGINT)", 180, 440, { size: 26, weight: 700, color: C.blue, fam: UI });
      text("Postgres IDENTITY / MySQL AUTO_INCREMENT", 180, 475, { size: 19, color: C.soft, fam: UI });

      text("Hajmi:   8 bayt (int da 4 bayt)", 180, 535, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("Tartibi: Qat'iy o'sib boradi (1, 2, 3...)", 180, 580, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("Manbasi: Bitta markaziy ma'lumotlar bazasi", 180, 625, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("Kamchiligi: Qatorlar soni oshkor bo'ladi", 180, 670, { size: 22, weight: 600, fam: MONO, color: C.red });
      sline(180, 710, 880, 710, { col: C.pencil, w: 1.5 });
      pill("Eng ixcham va eng tezkor B-tree", 530, 760, C.blue, kCards, 18);

      // O'ng: UUID
      const kUuid = P(t, 24.5, 0.8);
      withA(kUuid, () => {
        card(1000, 390, 780, 420, { fill: C.card, col: C.purple, p: kUuid });
        text("UUID (Universally Unique Identifier)", 1040, 440, { size: 26, weight: 700, color: C.purple, fam: UI });
        text("128 bitlik global takrorlanmas identifikator", 1040, 475, { size: 19, color: C.soft, fam: UI });

        text("Hajmi:   16 bayt (BIGINT dan 2 baravar katta)", 1040, 535, { size: 22, weight: 600, fam: MONO, color: C.ink });
        text("Tartibi: Versiyaga bog'liq (v4 tasodifiy, v7 vaqtli)", 1040, 580, { size: 22, weight: 600, fam: MONO, color: C.ink });
        text("Manbasi: Istalgan joyda (backend, mobil ilova oflayn)", 1040, 625, { size: 22, weight: 600, fam: MONO, color: C.green });
        text("Afzalligi: Bazaga so'rov yubormasdan ID yaratiladi", 1040, 670, { size: 22, weight: 600, fam: MONO, color: C.green });
        sline(1040, 710, 1740, 710, { col: C.pencil, w: 1.5 });
        pill("Mikroxizmatlar va oflayn ilovalar uchun ideal", 1390, 760, C.purple, kUuid, 18);
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 29.5, 0.8);
      withA(kFoot, () => {
        card(140, 840, 1640, 160, { fill: '#fbfbfb', col: C.pencil, p: kFoot });
        text("Mezon: Yagona manba bo'lsa BIGINT standart tanlov. Tarqoq tizimlarda UUID tanlanadi.", 180, 905, { size: 23, weight: 600, color: C.ink, fam: UI });
        text("Lekin UUID tanlanganda uning versiyasi hal qiluvchi ahamiyatga ega!", 180, 950, { size: 21, color: C.orange, fam: UI, weight: 600 });
      });
    });
  }

  // 3. UUID V4 VA V7 FARQLARI (34.78 -> 51.15s)
  function sUuidV4VsV7(t) {
    heading("UUID v4 (Tasodifiy) vs UUID v7 (Vaqt Bo'yicha Tartiblangan)", t, TM.scenes.uuid_v4_vs_v7.s);

    const kTree = P(t, TM.scenes.uuid_v4_vs_v7.s + 0.3, 0.8);
    withA(kTree, () => {
      // Chap: UUID v4
      card(140, 390, 780, 420, { fill: C.card, col: C.red, p: kTree });
      text("UUID v4: Butunlay Tasodifiy (Random)", 180, 440, { size: 25, weight: 700, color: C.red, fam: UI });
      text("Masalan: a6e29f8c-28df-48a1-b847-758992147ac3", 180, 475, { size: 18, fam: MONO, color: C.soft });

      text("• Kalitlar indeksning ixtiyoriy joyiga tushadi.", 180, 530, { size: 21, color: C.ink, fam: UI });
      text("• B-tree sahifalari to'lib, tez-tez bo'linadi (Page Split).", 180, 575, { size: 21, weight: 600, color: C.red, fam: UI });
      text("• Indeksda bo'shliqlar hosil bo'ladi va hajm shishadi.", 180, 620, { size: 21, color: C.ink, fam: UI });
      text("• RAM keshiga sig'may, diskka ortiqcha I/O yuki tushadi.", 180, 665, { size: 21, color: C.ink, fam: UI });
      sline(180, 705, 880, 705, { col: C.pencil, w: 1.5 });
      pill("O'lchovda: ~40% kattaroq indeks!", 530, 755, C.red, kTree, 18);

      // O'ng: UUID v7
      const kV7 = P(t, 41.5, 0.8);
      withA(kV7, () => {
        card(1000, 390, 780, 420, { fill: C.card, col: C.green, p: kV7 });
        text("UUID v7: Vaqt Bo'yicha Tartiblangan (Time-Ordered)", 1040, 440, { size: 25, weight: 700, color: C.green, fam: UI });
        text("Unix vaqti (ms) + aniqlik + tasodifiy qism", 1040, 475, { size: 18, color: C.soft, fam: UI });

        text("• Yangi kalitlar doimo indeks oxiriga yoziladi (Append-only).", 1040, 530, { size: 21, color: C.ink, fam: UI });
        text("• Sahifa bo'linishlari (Page Split) keskin kamayadi.", 1040, 575, { size: 21, weight: 600, color: C.green, fam: UI });
        text("• B-tree zich va ixcham to'ldiriladi, xotirani tejaydi.", 1040, 620, { size: 21, color: C.ink, fam: UI });
        text("• Kesh unumdorligi BIGINT darajasiga yaqinlashadi.", 1040, 665, { size: 21, color: C.ink, fam: UI });
        sline(1040, 705, 1740, 705, { col: C.pencil, w: 1.5 });
        pill("Zich indeks + Kesh uchun qulay", 1390, 755, C.green, kV7, 18);
      });

      // Pastki xavfsizlik kartasi
      const kLeak = P(t, 46.0, 0.8);
      withA(kLeak, () => {
        card(140, 840, 1640, 160, { fill: '#fff8f6', col: C.orange, p: kLeak });
        text("DIQQAT: UUID v7 yaratilgan aniq vaqtni fosh qiladi!", 180, 885, { size: 23, weight: 700, color: C.orange, fam: UI });
        text("uuid_extract_timestamp(uuidv7()) funksiyasi yordamida yozuvning aniq millisekund vaqti olinadi.", 180, 930, { size: 21, fam: MONO, color: C.ink });
        text("Agar yaratilish vaqti biznes siri bo'lsa, v7 qiymatini ochiq URL yoki API'da ko'rsatmang.", 180, 970, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. INNODB KLASTERLI INDEKS (51.15 -> 68.47s)
  function sInnodbKlaster(t) {
    heading("MySQL InnoDB: Klasterli Indeks va Ikkilamchi Indekslar", t, TM.scenes.innodb_klaster.s);

    const kInno = P(t, TM.scenes.innodb_klaster.s + 0.3, 0.8);
    withA(kInno, () => {
      // Chap: Klasterli indeks
      card(140, 390, 780, 420, { fill: C.card, col: C.blue, p: kInno });
      text("Klasterli Indeks (Clustered Index)", 180, 440, { size: 26, weight: 700, color: C.blue, fam: UI });
      text("Jadvalning o'zi Birlamchi Kalit tartibida saqlanadi", 180, 475, { size: 19, color: C.soft, fam: UI });

      text("• InnoDB har doim bitta klasterli indeksga ega.", 180, 535, { size: 21, color: C.ink, fam: UI });
      text("• Indeks barglarida barcha qator ustunlari yotadi.", 180, 580, { size: 21, color: C.ink, fam: UI });
      text("• PK bo'yicha qidiruv eng tez: to'g'ridan-to'g'ri qatorga boradi.", 180, 625, { size: 21, weight: 600, color: C.green, fam: UI });
      text("• PK bo'lmasa, InnoDB yashirin 6 baytli GEN_CLUST_INDEX ochadi.", 180, 670, { size: 20, color: C.soft, fam: UI });
      sline(180, 710, 880, 710, { col: C.pencil, w: 1.5 });
      pill("Birlamchi Kalit = Jadvalning jismoniy joylashuvi", 530, 760, C.blue, kInno, 18);

      // O'ng: Ikkilamchi Indeks
      const kSec = P(t, 59.5, 0.8);
      withA(kSec, () => {
        card(1000, 390, 780, 420, { fill: C.card, col: C.orange, p: kSec });
        text("Ikkilamchi Indekslar (Secondary Indexes)", 1040, 440, { size: 26, weight: 700, color: C.orange, fam: UI });
        text("Qolgan barcha indekslar (masalan KEY (x))", 1040, 475, { size: 19, color: C.soft, fam: UI });

        text("Tuzilishi: [ Indekslangan Ustun | BIRLAMCHI KALIT ]", 1040, 535, { size: 21, weight: 700, fam: MONO, color: C.ink });
        sline(1040, 560, 1740, 560, { col: C.pencil, w: 1.5 });
        text("• Har bir yozuvda birlamchi kalit nusxasi saqlanadi!", 1040, 605, { size: 21, weight: 600, color: C.red, fam: UI });
        text("• Qisqa PK (int 4B): ikkilamchi indekslar ixcham qoladi.", 1040, 650, { size: 21, color: C.green, fam: UI });
        text("• Uzun PK (char(36)): har bir yozuvga 36 bayt qo'shiladi!", 1040, 695, { size: 21, weight: 600, color: C.red, fam: UI });
        pill("Uzun PK barcha ikkilamchi indekslarni shishiradi", 1390, 760, C.orange, kSec, 18);
      });

      // Pastki taqqoslash o'lchovi
      const kExp = P(t, 63.5, 0.8);
      withA(kExp, () => {
        card(140, 840, 1640, 160, { fill: '#fff8f6', col: C.red, p: kExp });
        text("Amaliy O'lchov Natijasi (200 000 qatorda KEY (x) hajmi):", 180, 885, { size: 23, weight: 700, color: C.ink, fam: UI });
        text("INT kalitda: 3.5 MB   |   BINARY(16) da: 5.5 MB   |   CHAR(36) da: 9.6 MB (2.7 baravar katta!)", 180, 935, { size: 22, weight: 700, fam: MONO, color: C.red });
        text("MySQL InnoDB'da UUID kerak bo'lsa, hech qachon char(36) emas, balki BINARY(16) ishlating.", 180, 975, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. POSTGRES VA SQLITE YONDASHUVI (68.47 -> 88.72s)
  function sPostgresVaSqlite(t) {
    heading("PostgreSQL va SQLite: Boshqa Arxitekturalar", t, TM.scenes.postgres_va_sqlite.s);

    const kEng = P(t, TM.scenes.postgres_va_sqlite.s + 0.3, 0.8);
    withA(kEng, () => {
      // Chap: PostgreSQL
      card(140, 390, 780, 410, { fill: C.card, col: C.blue, p: kEng });
      text("PostgreSQL: Heap Jadval Arxitekturasi", 180, 440, { size: 25, weight: 700, color: C.blue, fam: UI });
      text("Jadval qatorlari kalitga qarab tartiblanmaydi", 180, 475, { size: 19, color: C.soft, fam: UI });

      text("• Qatorlar erkin sahifalarga (Heap) yoziladi.", 180, 530, { size: 21, color: C.ink, fam: UI });
      text("• Birlamchi kalit — alohida oddiy B-tree indeks.", 180, 575, { size: 21, color: C.ink, fam: UI });
      text("• Ikkilamchi indekslar PK nusxasini emas, to'g'ridan-to'g'ri", 180, 620, { size: 21, color: C.ink, fam: UI });
      text("  qator ko'rsatkichini (TID — tuple ID) saqlaydi.", 180, 655, { size: 21, color: C.ink, fam: UI });
      sline(180, 695, 880, 695, { col: C.pencil, w: 1.5 });
      pill("TID ko'rsatkichi tufayli ikkilamchi indekslar shishmaydi", 530, 750, C.blue, kEng, 18);

      // O'ng: SQLite
      const kSqlite = P(t, 73.0, 0.8);
      withA(kSqlite, () => {
        card(1000, 390, 780, 410, { fill: C.card, col: C.green, p: kSqlite });
        text("SQLite: rowid va WITHOUT ROWID", 1040, 440, { size: 25, weight: 700, color: C.green, fam: UI });
        text("Oddiy jadval rowid bo'yicha klasterlanadi", 1040, 475, { size: 19, color: C.soft, fam: UI });

        text("• INTEGER PRIMARY KEY — rowid ning boshqa nomi.", 1040, 530, { size: 21, color: C.ink, fam: UI });
        text("• Jadval 64 bitli rowid daraxtida klasterli saqlanadi.", 1040, 575, { size: 21, color: C.ink, fam: UI });
        text("• WITHOUT ROWID esa jadvalni to'g'ridan-to'g'ri PK", 1040, 620, { size: 21, weight: 600, color: C.green, fam: UI });
        text("  bo'yicha klasterlaydi (kompozit kalitlar uchun qulay).", 1040, 655, { size: 21, color: C.ink, fam: UI });
        sline(1040, 695, 1740, 695, { col: C.pencil, w: 1.5 });
        pill("INTEGER PRIMARY KEY bitta kalit uchun eng tezkori", 1390, 750, C.green, kSqlite, 18);
      });

      // Pastki xulosa kartasi
      const kSummary = P(t, 77.5, 0.8);
      withA(kSummary, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kSummary });
        text("Birlamchi Kalit Tanlashning Asosiy Xulosasi:", 180, 875, { size: 24, weight: 700, color: C.blue, fam: UI });
        text("1. Standart tanlov: BIGINT IDENTITY / AUTO_INCREMENT (ixcham, tezkor, B-tree do'sti).", 180, 920, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("2. Mikroxizmat / Oflayn yaratishda: UUID v7 (tartibli, kesh yuvilmaydi). MySQL da BINARY(16).", 180, 960, { size: 21, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.son_vs_uuid.s) {
      sTabiiyVsSuniy(t);
    } else if (t < TM.scenes.uuid_v4_vs_v7.s) {
      sSonVsUuid(t);
    } else if (t < TM.scenes.innodb_klaster.s) {
      sUuidV4VsV7(t);
    } else if (t < TM.scenes.postgres_va_sqlite.s) {
      sInnodbKlaster(t);
    } else {
      sPostgresVaSqlite(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
