// SQL 38-bob 2-qism: "Kod" — Normalizatsiya va tuzilma amaliyoti
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

  // 1. TEKIS JADVAL VA ANOMALIYALAR (0 -> 16.5s)
  function sTekis(t) {
    const k = P(t, 0.3, 1.0);
    hand("38-bob. Normalizatsiya va Tuzilma", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Tekis Jadval va Anomaliyalar Sinovi", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.red });
    hand("PostgreSQL 18.6: Bitta tekis jadvalda yangilash va o'chirish anomaliyalari", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 345, 1400 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Yangilash muammosi
      card(120, 390, 810, 420, { fill: C.card, col: C.red, p: kBox });
      text("1. Yangilash Anomaliyasi (Ali ko'chdi):", 160, 440, { size: 24, weight: 700, color: C.red, fam: UI });

      text("UPDATE buyurtma_tekis SET", 160, 495, { size: 20, fam: MONO, color: C.ink });
      text("    mijoz_manzil = 'Toshkent, Amir Temur 1'", 160, 530, { size: 20, weight: 700, fam: MONO, color: C.blue });
      text("WHERE buyurtma_id = 2; -- Faqat 1 ta qator yangilandi!", 160, 565, { size: 19, weight: 600, fam: MONO, color: C.soft });

      card(150, 610, 750, 160, { fill: '#fff8f6', col: C.red, p: kBox });
      text("SELECT DISTINCT mijoz_ism, mijoz_manzil:", 170, 645, { size: 19, weight: 700, fam: MONO, color: C.soft });
      text("Ali | Toshkent, Amir Temur 1", 170, 690, { size: 21, weight: 700, fam: MONO, color: C.red });
      text("Ali | Toshkent, Navoiy 12", 170, 730, { size: 21, weight: 700, fam: MONO, color: C.red });

      // O'ng: O'chirish muammosi
      card(990, 390, 810, 420, { fill: C.card, col: C.orange, p: kBox });
      text("2. O'chirish Anomaliyasi (Vali buyurtmasi):", 1030, 440, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("DELETE FROM buyurtma_tekis WHERE buyurtma_id = 3;", 1030, 495, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("Natija: DELETE 1", 1030, 540, { size: 20, weight: 700, fam: MONO, color: C.green });

      card(1020, 600, 750, 170, { fill: '#fff8f6', col: C.orange, p: kBox });
      text("SELECT count(*) AS vali_haqida FROM buyurtma_tekis:", 1040, 640, { size: 18, weight: 700, fam: MONO, color: C.soft });
      text("vali_haqida: 0", 1040, 690, { size: 26, weight: 800, fam: MONO, color: C.red });
      text("Valining ismi, telefoni va manzili bazadan butunlay o'chib ketdi!", 1040, 735, { size: 17, weight: 600, color: C.red, fam: UI, maxW: 720 });

      // Pastki xulosa kartasi
      const kFoot = P(t, 5.0, 0.8);
      withA(kFoot, () => {
        card(120, 835, 1680, 180, { fill: '#fff', col: C.red, p: kFoot });
        text("Haqiqiy Xulosa: Tekis Jadval Tuzilmasi Ziddiyatli!", 160, 885, { size: 24, weight: 700, color: C.red, fam: UI });
        text("Ma'lumotlarni bitta jadvalga qo'shib saqlash yangilash xatolariga va kerakli ma'lumotlarning yo'qolishiga sabab bo'ladi.", 160, 935, { size: 21, color: C.ink, fam: UI });
        text("Cheklovlar (constraints) buni bartaraf etolmaydi — faqat jadvallarni normalizatsiya qilish yordam beradi.", 160, 975, { size: 20, weight: 600, color: C.soft, fam: UI });
      });
    });
  }

  // 2. NORMALLASHGAN SXEMA VA INSERT (16.5 -> 32.7s)
  function sNormallashganSxema(t) {
    heading("Normallashgan Sxema va Jadvallar", t, TM.scenes.normallashgan_sxema_va_insert.s);

    const kMain = P(t, TM.scenes.normallashgan_sxema_va_insert.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: 4 ta jadval ta'rifi
      card(120, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Toza Relyatsion Sxema", 525, 250, C.blue, kMain, 20);
      text("To'rtta Alohida Jadval DDL:", 160, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE mijozlar (id INT PRIMARY KEY, ism, tel, manzil);", 160, 375, { size: 18, weight: 700, fam: MONO, color: C.blue });
      text("CREATE TABLE mahsulotlar (id INT PRIMARY KEY, nom, narx);", 160, 420, { size: 18, weight: 700, fam: MONO, color: C.purple });
      text("CREATE TABLE buyurtmalar (id INT PRIMARY KEY, mijoz_id, sana);", 160, 465, { size: 18, weight: 700, fam: MONO, color: C.ink });

      text("CREATE TABLE buyurtma_qatorlari (", 160, 520, { size: 19, weight: 700, fam: MONO, color: C.green });
      text("    buyurtma_id INT REFERENCES buyurtmalar(id),", 160, 555, { size: 18, fam: MONO, color: C.ink });
      text("    mahsulot_id INT REFERENCES mahsulotlar(id),", 160, 590, { size: 18, fam: MONO, color: C.ink });
      text("    narx INT NOT NULL, soni INT NOT NULL,", 160, 625, { size: 18, weight: 700, fam: MONO, color: C.purple });
      text("    PRIMARY KEY (buyurtma_id, mahsulot_id));", 160, 660, { size: 18, weight: 700, fam: MONO, color: C.green });

      // O'ng: Yozuvlar va mantiq
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("Baza Ma'lumotlari Holati", 1395, 250, C.green, kMain, 20);
      text("Har Bir Jadvalda O'z Faktlari:", 1030, 315, { size: 24, weight: 700, color: C.green, fam: UI });

      text("• mijozlar: 1: Ali (Navoiy 12), 2: Vali (Registon 5)", 1030, 375, { size: 20, color: C.ink, fam: UI });
      text("• mahsulotlar: 1: Daftar (12000), 2: Kitob (85000)", 1030, 425, { size: 20, color: C.ink, fam: UI });
      text("• buyurtmalar: 1-2: Ali (sana: 01, 03-fev), 3: Vali (05-fev)", 1030, 475, { size: 20, color: C.ink, fam: UI });

      card(1020, 530, 750, 120, { fill: '#f0fdf4', col: C.purple, p: kMain });
      text("Oraliq jadvaldagi 'narx' atributi:", 1040, 565, { size: 19, weight: 700, color: C.purple, fam: UI });
      text("Bu takrorlash emas! Bu sotilgan paytdagi narx (snapshot).", 1040, 605, { size: 18, weight: 600, color: C.ink, fam: UI });
      text("Mahsulot narxi ertaga oshsa ham, o'tgan buyurtma buzilmaydi.", 1040, 630, { size: 18, color: C.soft, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l4', 'tarixiy'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("Normallashgan Sxemaning Ustunligi:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Mijozlar va mahsulotlar faqat bir marta yoziladi — hech qanday ortiqcha takrorlanish yo'q.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Bog'lanishlar faqat sonli ID lar orqali amalga oshadi, bu xotirani va diskni tejaydi.", 160, 895, { size: 21, weight: 600, color: C.blue, fam: UI });
        text("3. Har bir fakt o'z javobgarlik sohasiga ega: mijoz o'zgarsa mijozlar, narx o'zgarsa oraliq jadval.", 160, 945, { size: 20, color: C.green, fam: UI });
      });
    });
  }

  // 3. XAVFSIZ YANGILASH VA O'CHIRISH (32.7 -> 48.0s)
  function sXavfsizYangilash(t) {
    heading("Xavfsiz Yangilash va O'chirish", t, TM.scenes.xavfsiz_yangilash_va_ochirish.s);

    const kMain = P(t, TM.scenes.xavfsiz_yangilash_va_ochirish.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: Xavfsiz yangilash
      card(120, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("1. Yagona Joyda Yangilash", 525, 250, C.green, kMain, 20);
      text("Ali Ko'chdi: Manzil Bir Joyda O'zgaradi", 160, 315, { size: 23, weight: 700, color: C.green, fam: UI });

      text("UPDATE mijozlar", 160, 375, { size: 21, weight: 700, fam: MONO, color: C.ink });
      text("SET manzil = 'Toshkent, Amir Temur 1'", 160, 415, { size: 21, weight: 700, fam: MONO, color: C.blue });
      text("WHERE id = 1;", 160, 455, { size: 21, weight: 700, fam: MONO, color: C.ink });

      card(160, 500, 730, 140, { fill: '#f0fdf4', col: C.green, p: kMain });
      text("Natija: UPDATE 1", 180, 535, { size: 20, weight: 700, fam: MONO, color: C.green });
      text("Endi Alining barcha buyurtmalarida yangi manzil birdek ko'rinadi.", 180, 580, { size: 19, color: C.ink, fam: UI });
      text("Hech qanday ziddiyat yoki eski manzil qolib ketishi ro'y bermaydi!", 180, 615, { size: 18, weight: 600, color: C.green, fam: UI });

      // O'ng: Xavfsiz o'chirish
      card(990, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("2. Obyektni Saqlab O'chirish", 1395, 250, C.blue, kMain, 20);
      text("Valining Buyurtmasi Bekor Bo'ldi:", 1030, 315, { size: 23, weight: 700, color: C.blue, fam: UI });

      text("DELETE FROM buyurtma_qatorlari WHERE buyurtma_id = 3;", 1030, 375, { size: 19, fam: MONO, color: C.ink });
      text("DELETE FROM buyurtmalar WHERE id = 3;", 1030, 415, { size: 19, fam: MONO, color: C.ink });

      card(1020, 475, 750, 165, { fill: '#f0fdf4', col: C.blue, p: kMain });
      text("SELECT ism, tel FROM mijozlar WHERE id = 2:", 1040, 510, { size: 19, weight: 700, fam: MONO, color: C.soft });
      text("ism: Vali  |  tel: +998907654321", 1040, 560, { size: 22, weight: 800, fam: MONO, color: C.blue });
      text("Vali bazada saqlanib qoldi! U ertaga yana buyurtma bera oladi.", 1040, 605, { size: 18, color: C.ink, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l6', 'butun'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.green, p: kFoot });
        text("Xulosa: Relyatsion Tuzilma Anomaliyalarni Yo'qotdi", 160, 785, { size: 26, weight: 700, color: C.green, fam: UI });
        text("1. Yangilash: Har bir fakt yagona nuqtada yangilanadi (Single Source of Truth).", 160, 845, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("2. O'chirish: Buyurtma o'chirilishi mijozning shaxsiy profiliga mutlaqo ta'sir qilmaydi.", 160, 895, { size: 21, weight: 600, color: C.blue, fam: UI });
        text("3. Ma'lumotlar bazasi ziddiyatlardan xoli va barqaror holatda qoladi.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. JOIN SO'ROVI VA NATIJA (48.0 -> 62.7s)
  function sJoinSorovi(t) {
    heading("To'rt Jadvalni Birlashtirish (JOIN)", t, TM.scenes.join_sorovi_va_natija.s);

    const kMain = P(t, TM.scenes.join_sorovi_va_natija.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: SQL JOIN so'rovi
      card(120, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Birlashtiruvchi So'rov", 525, 250, C.blue, kMain, 20);
      text("To'liq Axborotni O'qish:", 160, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("SELECT b.id, b.sana, m.ism, m.manzil,", 160, 375, { size: 19, weight: 700, fam: MONO, color: C.ink });
      text("       p.nom, q.narx, q.soni", 160, 410, { size: 19, weight: 700, fam: MONO, color: C.ink });
      text("FROM buyurtmalar b", 160, 455, { size: 19, weight: 700, fam: MONO, color: C.blue });
      text("JOIN mijozlar m           ON m.id = b.mijoz_id", 160, 495, { size: 18, fam: MONO, color: C.ink });
      text("JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id", 160, 535, { size: 18, fam: MONO, color: C.ink });
      text("JOIN mahsulotlar p        ON p.id = q.mahsulot_id", 160, 575, { size: 18, fam: MONO, color: C.ink });
      text("ORDER BY b.id;", 160, 620, { size: 19, weight: 700, fam: MONO, color: C.blue });

      // O'ng: PostgreSQL 18.6 real chiqishi
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("PostgreSQL 18.6 Natijasi", 1395, 250, C.green, kMain, 20);
      text("Natijalar Matritsasi:", 1030, 315, { size: 24, weight: 700, color: C.green, fam: UI });

      text("id |    sana    | ism  |         manzil         |  nom   | narx  | soni", 1030, 375, { size: 17, weight: 700, fam: MONO, color: C.soft });
      sline(1030, 395, 1750, 395, { col: C.pencil, w: 1.5 });
      text(" 1 | 2026-02-01 | Ali  | Toshkent, Amir Temur 1 | Daftar | 12000 |    2", 1030, 430, { size: 17, fam: MONO, color: C.ink });
      text(" 2 | 2026-02-03 | Ali  | Toshkent, Amir Temur 1 | Kitob  | 85000 |    1", 1030, 475, { size: 17, fam: MONO, color: C.ink });
      text(" 3 | 2026-02-05 | Vali | Samarqand, Registon 5  | Daftar | 12000 |    3", 1030, 520, { size: 17, fam: MONO, color: C.ink });
      text("(3 rows)", 1030, 570, { size: 17, fam: MONO, color: C.soft });

      card(1020, 605, 750, 60, { fill: '#f0fdf4', col: C.green, p: kMain });
      text("Barcha buyurtmalarda Alining yangi manzili aks etdi!", 1040, 640, { size: 19, weight: 700, color: C.green, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l8', 'indekslar'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("JOIN Unumdorligi Qoidasi:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("• Relyatsion bazalar aynan indekslangan ID lar orqali jadvallarni birlashtirish uchun yaratilgan.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("• Tashqi kalit ustunlarida indeks bo'lsa (37-bob), 4 ta jadvalni JOIN qilish mikrosoniyalarda bajariladi.", 160, 895, { size: 21, weight: 600, color: C.green, fam: UI });
        text("• 'JOIN sekin ishlaydi' degan gap faqat indeks qo'yilmagan noto'g'ri loyihalarga tegishlidir.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. DENORMALIZATSIYA VA TAFOVUT (62.7 -> 80.4s)
  function sDenormalizatsiya(t) {
    heading("Yig'ma Jadval va Tafovut Sinovi", t, TM.scenes.denormalizatsiya_va_tafovut.s);

    const kMain = P(t, TM.scenes.denormalizatsiya_va_tafovut.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: Yig'ma jadval
      card(120, 200, 810, 480, { fill: C.card, col: C.orange, p: kMain });
      pill("Denormalizatsiya Amaliyoti", 525, 250, C.orange, kMain, 20);
      text("Oldindan Hisoblangan kunlik_savdo:", 160, 315, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("CREATE TABLE kunlik_savdo (", 160, 375, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("    sana DATE PRIMARY KEY,", 160, 410, { size: 20, fam: MONO, color: C.ink });
      text("    buyurtmalar INT NOT NULL, summa INT NOT NULL);", 160, 445, { size: 19, fam: MONO, color: C.ink });

      text("INSERT INTO kunlik_savdo SELECT ... GROUP BY sana;", 160, 500, { size: 19, weight: 600, fam: MONO, color: C.blue });
      text("Natija: 2026-02-01 da 24000 so'm yozildi.", 160, 545, { size: 20, color: C.ink, fam: UI });
      pill("JOIN siz o'qiladi — hisobot bir zumda chiqadi", 525, 620, C.blue, kMain, 18);

      // O'ng: Tafovut sinovi
      card(990, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("Nomuvofiqlik Xatari", 1395, 250, C.red, kMain, 20);
      text("Asl Jadvalga Yangi Buyurtma Tushganda:", 1030, 315, { size: 23, weight: 700, color: C.red, fam: UI });

      text("INSERT INTO b VALUES (2, '2026-02-01', 5000);", 1030, 375, { size: 19, weight: 700, fam: MONO, color: C.ink });

      card(1020, 430, 750, 160, { fill: '#fff8f6', col: C.red, p: kMain });
      text("Yig'ma jadval va asl jadvalni solishtiramiz:", 1040, 465, { size: 18, weight: 700, color: C.red, fam: UI });
      text("jadvalda: 24000  |  haqiqiy: 29000", 1040, 515, { size: 24, weight: 800, fam: MONO, color: C.red });
      text("Yig'ma jadval yangilanmadi! Hisobot 5000 so'mga adashdi.", 1040, 560, { size: 18, color: C.ink, fam: UI });

      text("Nusxalarni moslab turish xarajati — denormalizatsiya to'lovi!", 1030, 630, { size: 19, weight: 700, color: C.red, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l10', 'mexanizmi'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("Amaliy Xulosa: Denormalizatsiyani Qachon Tanlash Kerak?", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Hech qachon loyihaning boshida 'kelajakda sekin bo'ladi' deb ma'lumotni takrorlamang.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Faqat EXPLAIN ANALYZE bilan o'lchab ko'rilgan og'ir hisobotlardagina yig'ma jadval qiling.", 160, 895, { size: 21, weight: 600, color: C.green, fam: UI });
        text("3. Postgresda REFRESH MATERIALIZED VIEW, MySQL/SQLite da esa triggerlar bilan nusxalarni sinxronlang.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.normallashgan_sxema_va_insert.s) sTekis(t);
    else if (t < TM.scenes.xavfsiz_yangilash_va_ochirish.s) sNormallashganSxema(t);
    else if (t < TM.scenes.join_sorovi_va_natija.s) sXavfsizYangilash(t);
    else if (t < TM.scenes.denormalizatsiya_va_tafovut.s) sJoinSorovi(t);
    else sDenormalizatsiya(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
