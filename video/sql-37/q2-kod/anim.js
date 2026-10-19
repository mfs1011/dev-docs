// SQL 37-bob 2-qism: "Kod" — Aloqalar va tashqi kalitlar amaliyoti
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

  // 1. BOSHLANG'ICH TUZILMA VA 1:1 ALOQA (0 -> 15.8s)
  function sBoshlangich(t) {
    const k = P(t, 0.3, 1.0);
    hand("37-bob. Aloqalar va Tashqi Kalitlar", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Boshlang'ich Tuzilma va 1:1 Aloqa", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Mijoz va Profil: Birlamchi kalit hamda tashqi kalit uyg'unligi", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(320, 345, 1280 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // DDL kartasi
      card(120, 390, 810, 410, { fill: C.card, col: C.blue, p: kBox });
      text("1:1 Jadval Tuzilmasi (PostgreSQL):", 160, 440, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE mijozlar (", 160, 495, { size: 21, weight: 700, fam: MONO, color: C.ink });
      text("    id INT PRIMARY KEY,", 160, 535, { size: 21, fam: MONO, color: C.ink });
      text("    ism TEXT NOT NULL", 160, 575, { size: 21, fam: MONO, color: C.ink });
      text(");", 160, 615, { size: 21, weight: 700, fam: MONO, color: C.ink });

      text("CREATE TABLE mijoz_profil (", 160, 665, { size: 21, weight: 700, fam: MONO, color: C.ink });
      text("    mijoz_id INT PRIMARY KEY", 160, 705, { size: 21, weight: 700, fam: MONO, color: C.green });
      text("        REFERENCES mijozlar(id) ON DELETE CASCADE,", 160, 745, { size: 19, weight: 600, fam: MONO, color: C.green });
      text("    telefon TEXT, shahar TEXT);", 160, 785, { size: 20, fam: MONO, color: C.ink });

      // O'ng tomonda amaliy test va xato
      const kRight = P(t, 4.0, 0.8);
      withA(kRight, () => {
        card(990, 390, 810, 410, { fill: C.card, col: C.purple, p: kRight });
        text("Unikal Cheklov Sinovi (1:1 Kafolati):", 1030, 440, { size: 24, weight: 700, color: C.purple, fam: UI });

        text("-- 1-profil muvaffaqiyatli qo'shildi:", 1030, 495, { size: 19, color: C.soft, fam: MONO });
        text("INSERT INTO mijoz_profil VALUES", 1030, 530, { size: 20, weight: 600, fam: MONO, color: C.ink });
        text("    (1, '+998901234567', 'Toshkent'); -- OK", 1030, 565, { size: 20, weight: 700, fam: MONO, color: C.green });

        text("-- Aynan shu mijozga 2-profil urinishi:", 1030, 615, { size: 19, color: C.soft, fam: MONO });
        text("INSERT INTO mijoz_profil VALUES", 1030, 650, { size: 20, weight: 600, fam: MONO, color: C.ink });
        text("    (1, '+998909876543', 'Samarqand');", 1030, 685, { size: 20, weight: 700, fam: MONO, color: C.ink });

        card(1020, 720, 750, 65, { fill: '#fff8f6', col: C.red, p: kRight });
        text("ERROR: duplicate key value violates unique constraint", 1040, 745, { size: 17, weight: 700, fam: MONO, color: C.red });
        text("DETAIL: Key (mijoz_id)=(1) already exists.", 1040, 770, { size: 17, weight: 600, fam: MONO, color: C.red });
      });

      // Pastdagi xulosa kartasi
      const kFoot = P(t, W('l2', 'unikal'), 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 180, { fill: '#f0fdf4', col: C.green, p: kFoot });
        text("1:1 Aloqa Arxitekturasi Sirri:", 160, 880, { size: 24, weight: 700, color: C.green, fam: UI });
        text("Tashqi kalit ustunini birlamchi kalit (PRIMARY KEY) qilish orqali alohida UNIQUE qo'shish shart emas.", 160, 930, { size: 21, color: C.ink, fam: UI });
        text("Bu bir mijozga faqat va faqat bitta profil tegishli bo'lishini ma'lumotlar bazasi darajasida kafolatlaydi.", 160, 970, { size: 21, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  // 2. 1:N VA M:N ORALIQ JADVAL (15.8 -> 31.3s)
  function sBirgaKop(t) {
    heading("1:N va M:N Oraliq Jadval Tuzilishi", t, TM.scenes.birga_kop_va_oraliq_jadval.s);

    const kMain = P(t, TM.scenes.birga_kop_va_oraliq_jadval.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: 1:N va M:N sxemasi
      card(120, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Jadvallar DDL", 525, 250, C.blue, kMain, 20);
      text("Buyurtmalar va Mahsulotlar Oraliq Jadvali:", 160, 315, { size: 23, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE orders (", 160, 370, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("    order_id INT PRIMARY KEY,", 160, 405, { size: 20, fam: MONO, color: C.ink });
      text("    mijoz_id INT REFERENCES mijozlar(id) ON DELETE RESTRICT);", 160, 440, { size: 19, weight: 600, fam: MONO, color: C.blue });

      text("CREATE TABLE order_items (", 160, 485, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("    product_no INT REFERENCES products(product_no),", 160, 520, { size: 19, fam: MONO, color: C.ink });
      text("    order_id   INT REFERENCES orders(order_id) ON DELETE CASCADE,", 160, 555, { size: 18, weight: 600, fam: MONO, color: C.green });
      text("    quantity   INT NOT NULL CHECK (quantity > 0),", 160, 590, { size: 19, fam: MONO, color: C.ink });
      text("    price      NUMERIC(10,2) NOT NULL,", 160, 625, { size: 20, weight: 700, fam: MONO, color: C.purple });
      text("    PRIMARY KEY (product_no, order_id));", 160, 660, { size: 20, weight: 700, fam: MONO, color: C.ink });

      // O'ng: TTY dagi natijalar jadvali
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("PostgreSQL 18.6 Haqiqiy Natijasi", 1395, 250, C.green, kMain, 20);
      text("SELECT order_id, name, quantity, price, jami:", 1030, 315, { size: 23, weight: 700, color: C.green, fam: UI });

      // Natijalar jadvali
      text("order_id |  name  | quantity |  price   |   jami   ", 1030, 375, { size: 20, weight: 700, fam: MONO, color: C.soft });
      sline(1030, 395, 1750, 395, { col: C.pencil, w: 1.5 });
      text("     100 | Daftar |        2 | 12000.00 | 24000.00", 1030, 430, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("     100 | Ruchka |        5 |  3000.00 | 15000.00", 1030, 475, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("     101 | Kitob  |        1 | 85000.00 | 85000.00", 1030, 520, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("     102 | Daftar |        1 | 11500.00 | 11500.00", 1030, 565, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("(4 rows)", 1030, 615, { size: 19, fam: MONO, color: C.soft });

      pill("100-buyurtmada 2 ta turli mahsulot", 1395, 650, C.green, kMain, 18);

      // Pastki qism: Narx atributining ahamiyati
      const kPrice = P(t, W('l4', 'narx'), 0.8);
      withA(kPrice, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.purple, p: kPrice });
        text("Oraliq Jadvaldagi 'Price' Atributi Nega Shart?", 160, 785, { size: 26, weight: 700, color: C.purple, fam: UI });
        text("1. Mahsulot narxi vaqt o'tishi bilan o'zgaradi (Daftar bugun 12000, ertaga 15000 bo'lishi mumkin).", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Agar narx faqat products jadvalida bo'lsa, o'tgan yilgi barcha hisobot va kvitansiyalar buziladi!", 160, 895, { size: 21, weight: 700, color: C.red, fam: UI });
        text("3. Oraliq jadval sotilgan daqiqadagi aniq narxni (snapshot) tarixiy abadiy saqlab qoladi.", 160, 945, { size: 21, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  // 3. ON DELETE AMALLARI (31.3 -> 44.6s)
  function sOnDelete(t) {
    heading("ON DELETE: Kaskad va Taqiq Jarayoni", t, TM.scenes.on_delete_amallari.s);

    const kMain = P(t, TM.scenes.on_delete_amallari.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: CASCADE misoli
      card(120, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("ON DELETE CASCADE Jarayoni", 525, 250, C.green, kMain, 20);
      text("100-Buyurtma O'chirilganda:", 160, 315, { size: 24, weight: 700, color: C.green, fam: UI });

      text("DELETE FROM orders WHERE order_id = 100;", 160, 380, { size: 22, weight: 700, fam: MONO, color: C.ink });
      text("Natija: DELETE 1", 160, 425, { size: 20, weight: 700, fam: MONO, color: C.green });

      card(160, 470, 730, 180, { fill: '#f0fdf4', col: C.green, p: kMain });
      text("Kaskad ta'siri (order_items jadvalida):", 180, 510, { size: 19, weight: 700, color: C.green, fam: UI });
      text("SELECT count(*) FROM order_items; -- 4 tadan 2 ta qoldi!", 180, 560, { size: 19, weight: 700, fam: MONO, color: C.ink });
      text("100-buyurtmaga tegishli 2 ta qator avtomatik o'chirildi.", 180, 610, { size: 19, color: C.ink, fam: UI });

      // O'ng: RESTRICT misoli
      card(990, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("ON DELETE RESTRICT Taqiqlari", 1395, 250, C.red, kMain, 20);
      text("Bog'langan Mahsulotni O'chirish Urinishi:", 1030, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("DELETE FROM products WHERE product_no = 10;", 1030, 380, { size: 22, weight: 700, fam: MONO, color: C.ink });

      card(1020, 430, 750, 160, { fill: '#fff8f6', col: C.red, p: kMain });
      text("ERROR: update or delete on table \"products\"", 1040, 470, { size: 18, weight: 700, fam: MONO, color: C.red });
      text("violates RESTRICT setting of foreign key constraint", 1040, 505, { size: 17, weight: 600, fam: MONO, color: C.red });
      text("DETAIL: Key (product_no)=(10) is referenced from 'order_items'.", 1040, 545, { size: 16, weight: 600, fam: MONO, color: C.ink });

      text("Ma'lumotlar bazasi tarixiy sotuv mavjud bo'lgan mahsulotni o'chirishga ruxsat bermadi!", 1030, 630, { size: 18, weight: 600, color: C.red, fam: UI, maxW: 740 });

      // Pastki taqqoslash kartasi
      const kCompare = P(t, W('l6', 'bloklanadi'), 0.8);
      withA(kCompare, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kCompare });
        text("Mijozlarni O'chirish: Sobir vs Vali Sinovi", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });

        text("DELETE FROM mijozlar WHERE id = 3; -- DELETE 1 (Sobirda buyurtma yo'q, xatosiz o'chdi)", 160, 845, { size: 21, weight: 700, color: C.green, fam: MONO });
        text("DELETE FROM mijozlar WHERE id = 2; -- ERROR: RESTRICT (Valining 102-buyurtmasi bor, taqiqlandi)", 160, 895, { size: 21, weight: 700, color: C.red, fam: MONO });
        text("RESTRICT siyosati biznes ma'lumotlarining xavfsizligini ta'minlovchi asosiy qalqondir.", 160, 950, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. KOMPOZIT VA SET NULL (44.6 -> 59.8s)
  function sKompozit(t) {
    heading("Kompozit Kalit va SET NULL Siyosati", t, TM.scenes.kompozit_va_set_null.s);

    const kMain = P(t, TM.scenes.kompozit_va_set_null.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: Multi-tenant tuzilma
      card(120, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("PostgreSQL Kompozit Kaliti", 525, 250, C.blue, kMain, 20);
      text("Multi-tenant Postlar Jadvali Tuzilishi:", 160, 315, { size: 23, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE posts (", 160, 370, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("    tenant_id INT,", 160, 410, { size: 20, fam: MONO, color: C.ink });
      text("    post_id   INT,", 160, 450, { size: 20, fam: MONO, color: C.ink });
      text("    author_id INT,", 160, 490, { size: 20, weight: 700, fam: MONO, color: C.purple });
      text("    PRIMARY KEY (tenant_id, post_id),", 160, 530, { size: 20, fam: MONO, color: C.ink });
      text("    FOREIGN KEY (tenant_id, author_id)", 160, 570, { size: 20, weight: 700, fam: MONO, color: C.blue });
      text("        REFERENCES users(tenant_id, user_id)", 160, 605, { size: 19, fam: MONO, color: C.ink });
      text("        ON DELETE SET NULL (author_id));", 160, 640, { size: 20, weight: 700, fam: MONO, color: C.green });

      // O'ng: TTY natijasi
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("Foydalanuvchi O'chirilgandagi Natija", 1395, 250, C.green, kMain, 20);
      text("DELETE FROM users WHERE tenant_id=1 AND user_id=10:", 1030, 315, { size: 22, weight: 700, color: C.ink, fam: UI });

      text("SELECT tenant_id, post_id, author_id FROM posts;", 1030, 380, { size: 20, weight: 700, fam: MONO, color: C.soft });
      text(" tenant_id | post_id | author_id ", 1030, 430, { size: 22, weight: 700, fam: MONO, color: C.soft });
      sline(1030, 455, 1700, 455, { col: C.pencil, w: 1.5 });
      text("         1 |     500 |      NULL ", 1030, 495, { size: 22, weight: 700, fam: MONO, color: C.red });
      text("         2 |     600 |        10 ", 1030, 545, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("(2 rows)", 1030, 605, { size: 20, fam: MONO, color: C.soft });

      pill("tenant_id=1 o'zgarmadi, faqat author_id null bo'ldi!", 1395, 650, C.green, kMain, 18);

      // Pastki xulosa kartasi
      const kInsight = P(t, W('l8', 'saqlanadi'), 0.8);
      withA(kInsight, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.green, p: kInsight });
        text("SET NULL (ustunlar) Xususiyatining Afzalligi:", 160, 785, { size: 26, weight: 700, color: C.green, fam: UI });
        text("1. Kompozit kalitda barcha ustunlar emas, faqat kerakli maydon (author_id) NULL qilinadi.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Maqola o'chib ketmaydi va qaysi tashkilotga (tenant) tegishli ekani buzilmaydi.", 160, 895, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("3. Bu funksiya PostgreSQL 15 dan boshlab to'liq va mukammal qo'llab-quvvatlanadi.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. BOLA INDEKSI VA XULOSA (59.8 -> 77.7s)
  function sBolaIndeksi(t) {
    heading("Bola Ustuni Indeksi va Amaliy Xulosa", t, TM.scenes.bola_indeksi_va_xulosa.s);

    const kMain = P(t, TM.scenes.bola_indeksi_va_xulosa.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap karta: Indeks zarurligi
      card(120, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("Unumdorlik Masalasi", 525, 250, C.red, kMain, 20);
      text("Nega Tashqi Kalitga Qo'lda Indeks Kerak?", 160, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("• Ota jadvaldan DELETE qilinganda, Postgres bola jadvalni", 160, 380, { size: 21, color: C.ink, fam: UI });
      text("  tashqi kalit qiymati bo'yicha to'liq skanerlaydi (Seq Scan).", 160, 420, { size: 21, color: C.ink, fam: UI });
      text("• Millionlab qatorli jadvallarda bu soniyalarga cho'zilib,", 160, 470, { size: 21, color: C.ink, fam: UI });
      text("  butun jadval ustiga qulf (lock) qo'yadi va navbat paydo qiladi.", 160, 510, { size: 21, color: C.ink, fam: UI });
      text("• Bola ustuniga indeks qo'yish bu jarayonni Index Scan ga", 160, 560, { size: 21, weight: 700, color: C.green, fam: UI });
      text("  aylantirib, tezlikni 1000 barobargacha oshiradi!", 160, 600, { size: 21, weight: 700, color: C.green, fam: UI });

      // O'ng karta: Oraliq jadval indeksi
      card(990, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Oraliq Jadval Indekslash Qoidasi", 1395, 250, C.blue, kMain, 20);
      text("Chap Ustun Qoidasi va Qo'shimcha Indeks:", 1030, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("PRIMARY KEY (product_no, order_id)", 1030, 380, { size: 23, weight: 700, fam: MONO, color: C.ink });
      text("Bu birlamchi kalit faqat product_no bo'yicha indeks yaratadi.", 1030, 430, { size: 20, color: C.soft, fam: UI });

      card(1020, 470, 750, 160, { fill: '#f0fdf4', col: C.green, p: kMain });
      text("Zaruriy yechim — 2-ustunga alohida indeks qo'yish:", 1040, 510, { size: 19, weight: 700, color: C.green, fam: UI });
      text("CREATE INDEX ON order_items (order_id);", 1040, 565, { size: 22, weight: 700, fam: MONO, color: C.blue });
      text("Bu orqali buyurtmani kaskad o'chirish tezkor va yengil bo'ladi.", 1040, 610, { size: 19, color: C.ink, fam: UI });

      // Pastki xulosa kartasi
      const kFinal = P(t, W('l10', 'unumdorlik'), 0.8);
      withA(kFinal, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFinal });
        text("Amaliy Xulosa: Aloqalar va Tashqi Kalitlar Garovi", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Har bir bola FK ustuniga alohida indeks yaratishni odatga aylantiring.", 160, 845, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("2. RESTRICT — ma'lumotlar yaxlitligini saqlashda asosiy himoyachingiz.", 160, 895, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("3. To'g'ri loyihalangan sxema ma'lumotlar bazasining uzoq yillar xatosiz xizmat qilishini ta'minlaydi.", 160, 945, { size: 21, weight: 700, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.birga_kop_va_oraliq_jadval.s) sBoshlangich(t);
    else if (t < TM.scenes.on_delete_amallari.s) sBirgaKop(t);
    else if (t < TM.scenes.kompozit_va_set_null.s) sOnDelete(t);
    else if (t < TM.scenes.bola_indeksi_va_xulosa.s) sKompozit(t);
    else sBolaIndeksi(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
