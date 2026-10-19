// SQL 37-bob 1-qism: "Tushuncha" — Aloqalar va tashqi kalitlar
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

  // 1. KIRISH (0 -> 14.6s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("37-bob. Aloqalar va Tashqi Kalitlar", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Tashqi Kalitlar (FOREIGN KEY) va Yaxlitlik", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Jadvallar o'rtasidagi munosabat va yetim qatorlardan himoya", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(320, 345, 1280 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Ota jadval: mijozlar
      card(140, 400, 720, 380, { fill: C.card, col: C.blue, p: kBox });
      text("Ota jadval: mijozlar (Parent Table)", 180, 450, { size: 24, weight: 700, color: C.blue, fam: UI });
      
      // Ustunlar va qatorlar
      text("id (PK)   ism        shahar", 180, 510, { size: 22, weight: 700, fam: MONO, color: C.soft });
      sline(180, 535, 800, 535, { col: C.pencil, w: 1.5 });
      text("1         Ali        Toshkent", 180, 575, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("2         Vali       Samarqand", 180, 630, { size: 22, weight: 600, fam: MONO, color: C.ink });
      text("3         Sobir      Buxoro", 180, 685, { size: 22, weight: 600, fam: MONO, color: C.ink });
      pill("PRIMARY KEY: id", 500, 735, C.blue, kBox, 18);

      // Bola jadval: orders
      const kChild = P(t, 3.5, 0.8);
      withA(kChild, () => {
        card(1060, 400, 720, 380, { fill: C.card, col: C.green, p: kChild });
        text("Bola jadval: orders (Child Table)", 1100, 450, { size: 24, weight: 700, color: C.green, fam: UI });

        text("order_id  mijoz_id (FK)  summa", 1100, 510, { size: 22, weight: 700, fam: MONO, color: C.soft });
        sline(1100, 535, 1720, 535, { col: C.pencil, w: 1.5 });
        text("100       1              24000.00", 1100, 575, { size: 22, weight: 600, fam: MONO, color: C.ink });
        text("101       1              85000.00", 1100, 630, { size: 22, weight: 600, fam: MONO, color: C.ink });
        text("102       2              12000.00", 1100, 685, { size: 22, weight: 600, fam: MONO, color: C.ink });
        pill("REFERENCES mijozlar(id)", 1420, 735, C.green, kChild, 18);
      });

      // Bog'lovchi o'q
      const kArrow = P(t, 5.0, 0.8);
      if (kArrow > 0) {
        arrow(1230, 575, 230, 575, { col: C.orange, w: 3.5, bend: -40, p: kArrow });
        text("Tashqi kalit aloqasi", 960, 470, { size: 22, weight: 700, color: C.orange, fam: UI, align: 'center', ignoreCardCheck: true });
      }

      // Pastki izoh: Yetim qatorlardan himoya
      const kAlert = P(t, 7.5, 0.8);
      withA(kAlert, () => {
        card(140, 830, 1640, 180, { fill: '#fff8f6', col: C.red, p: kAlert });
        text("Ma'lumotlar Yaxlitligi Kafolati:", 180, 880, { size: 24, weight: 700, color: C.red, fam: UI });
        text("INSERT INTO orders VALUES (103, 99, 50000.00);", 180, 935, { size: 22, weight: 700, fam: MONO, color: C.ink });
        pill("XATO: mijoz_id=99 ota jadvalda mavjud emas!", 1200, 935, C.red, kAlert, 18);
        text("Tashqi kalit mavjud bo'lmagan ota yozuvga bog'lanish va yetim qatorlar paydo bo'lishini qat'iy taqiqlaydi.", 180, 975, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. ALOQA TURLARI (14.6 -> 28.5s)
  function sAloqaTurlari(t) {
    heading("Asosiy Aloqa Turlari: 1:N, 1:1 va M:N", t, TM.scenes.aloqa_turlari.s);

    const kCards = P(t, TM.scenes.aloqa_turlari.s + 0.3, 0.8);
    withA(kCards, () => {
      // 3 ta karta: 1:N, 1:1, M:N
      const cards = [
        {
          tag: "1:N (Birga ko'p)",
          title: "Eng keng tarqalgan munosabat",
          col: C.blue,
          p1: "Bir mijoz ko'plab buyurtma bera oladi.",
          rule: "Qoida: Tashqi kalit ko'p tomonga (orders) qo'yiladi.",
          schema: "orders.mijoz_id -> mijozlar.id"
        },
        {
          tag: "1:1 (Birga bir)",
          title: "Qat'iy yagona munosabat",
          col: C.green,
          p1: "Bir mijoz faqat bitta profilga ega bo'ladi.",
          rule: "Qoida: FK ustuniga UNIQUE yoki PRIMARY KEY qo'shiladi.",
          schema: "mijoz_id PK REFERENCES mijozlar(id)"
        },
        {
          tag: "M:N (Ko'pga ko'p)",
          title: "Oraliq jadval orqali loyihalash",
          col: C.purple,
          p1: "Buyurtmada ko'p mahsulot, mahsulot ko'p buyurtmada.",
          rule: "Qoida: Alohida oraliq jadval (order_items) ochiladi.",
          schema: "order_items (order_id FK, product_no FK)"
        }
      ];

      cards.forEach((item, i) => {
        const bx = 120 + i * 570;
        card(bx, 200, 540, 480, { fill: C.card, col: item.col, p: kCards });
        pill(item.tag, bx + 270, 250, item.col, kCards, 22);
        text(item.title, bx + 30, 315, { size: 22, weight: 700, color: item.col, fam: UI });
        text(item.p1, bx + 30, 375, { size: 20, color: C.ink, fam: UI, maxW: 480 });
        text(item.rule, bx + 30, 450, { size: 20, weight: 600, color: C.ink, fam: UI, maxW: 480 });
        
        card(bx + 20, 540, 500, 100, { fill: '#f8fafc', col: item.col, p: kCards });
        text("Sxema tuzilishi:", bx + 40, 575, { size: 18, weight: 700, color: C.soft, fam: UI });
        text(item.schema, bx + 40, 615, { size: 18, weight: 700, color: C.ink, fam: MONO });
      });

      // Pastdagi umumlashtirish kartasi
      const kBottom = P(t, W('l4', 'oraliq'), 0.8);
      withA(kBottom, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kBottom });
        text("Ko'pga-ko'p (M:N) Aloqani To'g'ri Saqlash Usuli:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Hech qachon mahsulot ID larini massivda yoki vergul bilan bitta ustunda saqlamang!", 160, 845, { size: 22, weight: 600, color: C.red, fam: UI });
        text("2. Ikkita tashqi kalitli alohida oraliq jadval yarating: (product_no, order_id) kompozit PK bo'ladi.", 160, 895, { size: 22, weight: 600, color: C.green, fam: UI });
        text("3. Oraliq jadval yozuvlarning takrorlanishidan himoya qiladi va har bir mahsulotni alohida indekslaydi.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. ON DELETE SIYOSATI (28.5 -> 44.2s)
  function sOnDelete(t) {
    heading("ON DELETE Siyosatini Tanlash: Kaskad vs Taqiq", t, TM.scenes.on_delete_siyosati.s);

    const kCards = P(t, TM.scenes.on_delete_siyosati.s + 0.3, 0.8);
    withA(kCards, () => {
      // 3 ta siyosat
      const actions = [
        {
          name: "ON DELETE CASCADE",
          desc: "Bola ota qismiga ajralmas bog'liq bo'lsa",
          example: "Buyurtma o'chsa -> uning qatorlari (order_items) birga o'chadi.",
          col: C.red,
          danger: "Ehtiyot bo'ling: bitta buyruq katta ma'lumotlar zanjirini yo'q qilishi mumkin."
        },
        {
          name: "ON DELETE RESTRICT",
          desc: "Mustaqil mohiyat, tarixiy yaxlitlikni saqlash",
          example: "Mahsulot (products) o'chirilmaydi, agar unga buyurtma bog'langan bo'lsa.",
          col: C.blue,
          danger: "Xato beradi: 'violates foreign key constraint'. Ma'lumot yo'qolishidan asraydi."
        },
        {
          name: "ON DELETE SET NULL",
          desc: "Bog'liqlik ixtiyoriy bo'lsa",
          example: "Muallif o'chsa -> uning postlaridagi author_id maydoni NULL bo'ladi.",
          col: C.orange,
          danger: "Shart: tashqi kalit ustunida NOT NULL cheklovi bo'lmasligi kerak."
        }
      ];

      actions.forEach((act, i) => {
        const bx = 120 + i * 570;
        card(bx, 200, 540, 480, { fill: C.card, col: act.col, p: kCards });
        pill(act.name, bx + 270, 250, act.col, kCards, 20);
        text(act.desc, bx + 30, 315, { size: 20, weight: 700, color: act.col, fam: UI, maxW: 480 });
        
        text("Jonli misol:", bx + 30, 380, { size: 18, weight: 700, color: C.soft, fam: UI });
        text(act.example, bx + 30, 420, { size: 20, color: C.ink, fam: UI, maxW: 480 });

        card(bx + 20, 520, 500, 120, { fill: '#fff8f6', col: act.col, p: kCards });
        text("Tizim harakati:", bx + 40, 555, { size: 18, weight: 700, color: act.col, fam: UI });
        text(act.danger, bx + 40, 600, { size: 17, color: C.ink, fam: UI, maxW: 460 });
      });

      // Jonli SQL misol kartasi
      const kEx = P(t, W('l6', 'buyurtma'), 0.8);
      withA(kEx, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.ink, p: kEx });
        text("Biznes Mantig'i Misoli: Buyurtma va Mahsulot", 160, 785, { size: 26, weight: 700, color: C.ink, fam: UI });

        text("-- Buyurtma o'chirilganda uning qismlari kaskad o'chadi:", 160, 845, { size: 20, color: C.soft, fam: MONO });
        text("DELETE FROM orders WHERE order_id = 100; -- order_items dan 2 ta qator birga o'chdi (CASCADE)", 160, 885, { size: 21, weight: 700, color: C.green, fam: MONO });

        text("-- Ammo mahsulotni o'chirish taqiqlanadi (tarix saqlanadi):", 160, 935, { size: 20, color: C.soft, fam: MONO });
        text("DELETE FROM products WHERE product_no = 10; -- ERROR: RESTRICT taqiqlaydi!", 160, 975, { size: 21, weight: 700, color: C.red, fam: MONO });
      });
    });
  }

  // 4. INDEKSLASH VA CHAP USTUN (44.2 -> 57.8s)
  function sIndekslash(t) {
    heading("Tashqi Kalitlarni Indekslash va Chap Ustun Qoidasi", t, TM.scenes.indekslash_va_chap_ustun.s);

    const kMain = P(t, TM.scenes.indekslash_va_chap_ustun.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap karta: Avtomatik indeks yo'qligi
      card(120, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("Postgres va SQLite Xususiyati", 525, 250, C.red, kMain, 20);
      text("Bola Ustuniga Avtomatik Indeks Yaratilmaydi!", 160, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("• Ota jadval birlamchi kalitiga indeks avtomatik tushadi.", 160, 380, { size: 21, color: C.ink, fam: UI });
      text("• Ammo bola tomondagi FOREIGN KEY ustuni indekslanmaydi!", 160, 430, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• Oqibati: Ota yozuv o'chirilganda yoki yangilanganda bola", 160, 480, { size: 21, color: C.ink, fam: UI });
      text("  jadval to'liq skanerlanadi (Seq Scan) va ShareLock olinadi.", 160, 520, { size: 21, color: C.ink, fam: UI });
      text("• Katta tizimlarda bu jiddiy sekinlashuv va qulf tiqilishiga sabab bo'ladi.", 160, 570, { size: 20, weight: 600, color: C.orange, fam: UI });

      // O'ng karta: Chap ustun qoidasi
      card(990, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Kompozit Kalit va Chap Ustun", 1395, 250, C.blue, kMain, 20);
      text("Oraliq Jadvaldagi B-Tree Indeks Tuzog'i", 1030, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("PRIMARY KEY (product_no, order_id)", 1030, 380, { size: 24, weight: 700, color: C.ink, fam: MONO });
      text("• B-tree faqat birinchi (chapdagi) ustun: product_no ni indekslaydi.", 1030, 435, { size: 21, color: C.ink, fam: UI });
      text("• Ikkinchi ustun: order_id bo'yicha mustaqil qidiruv sekin ishlaydi!", 1030, 485, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• Buyurtmani o'chirishda kaskad qidiruvi butun jadvalni aylanadi.", 1030, 535, { size: 21, color: C.ink, fam: UI });
      text("• Yechim: Ikkinchi ustun uchun alohida indeks qo'yilishi shart!", 1030, 585, { size: 21, weight: 700, color: C.green, fam: UI });

      // Pastki amaliy yechim kartasi
      const kSol = P(t, W('l8', 'alohida'), 0.8);
      withA(kSol, () => {
        card(120, 730, 1680, 260, { fill: '#f0fdf4', col: C.green, p: kSol });
        text("Tavsiya Etilgan Amaliy Yechim:", 160, 785, { size: 26, weight: 700, color: C.green, fam: UI });

        text("-- Har doim bola tomondagi tashqi kalit ustunini indekslang:", 160, 845, { size: 20, color: C.soft, fam: MONO });
        text("CREATE INDEX ON orders (mijoz_id);", 160, 885, { size: 22, weight: 700, color: C.blue, fam: MONO });

        text("-- Oraliq jadvalda ikkinchi ustun uchun ham alohida indeks yarating:", 160, 935, { size: 20, color: C.soft, fam: MONO });
        text("CREATE INDEX ON order_items (order_id);", 160, 975, { size: 22, weight: 700, color: C.green, fam: MONO });
      });
    });
  }

  // 5. KOMPOZIT VA XULOSA (57.8 -> 75.2s)
  function sKompozit(t) {
    heading("Oraliq Jadval Atributlari va Arxitektura Xulosasi", t, TM.scenes.kompozit_va_xulosa.s);

    const kMain = P(t, TM.scenes.kompozit_va_xulosa.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap karta: Oraliq jadval faqat ID emas
      card(120, 200, 810, 480, { fill: C.card, col: C.purple, p: kMain });
      pill("Biznes Atributlari", 525, 250, C.purple, kMain, 20);
      text("Oraliq Jadvaldagi 'Tarixiy Narx' Fenomeni", 160, 315, { size: 24, weight: 700, color: C.purple, fam: UI });

      text("order_items (order_id, product_no, quantity, price)", 160, 375, { size: 21, weight: 700, color: C.ink, fam: MONO });
      text("• Savol: Mahsulot narxi products jadvalida bor-ku, nega bu yerda?", 160, 435, { size: 20, color: C.ink, fam: UI });
      text("• Javob: Mahsulot narxi kelajakda o'zgaradi (inflyatsiya, aksiya).", 160, 485, { size: 20, color: C.ink, fam: UI });
      text("• Oraliq jadval sotilgan paytdagi narxni (snapshot) saqlab qoladi.", 160, 535, { size: 20, weight: 700, color: C.purple, fam: UI });
      text("• Natijada o'tgan yilgi buyurtma hisoboti hech qachon buzilmaydi.", 160, 585, { size: 20, color: C.soft, fam: UI });

      // O'ng karta: Arxitektura oltin qoidalari
      card(990, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Arxitektura Qoidalari", 1395, 250, C.blue, kMain, 20);
      text("Aloqalarni Loyihalashning 3 Oltin Qoidasi", 1030, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      const rules = [
        { n: "1", title: "Har bir FK ga indeks qo'ying", sub: "Join va Delete operatsiyalari tez bo'lishi uchun." },
        { n: "2", title: "CASCADE siyosatini ehtiyotkorlik bilan tanlang", sub: "Faqat ajralmas mohiyatlarga qo'llang, qolganiga RESTRICT." },
        { n: "3", title: "Yetim qatorlarga yo'l qo'ymang", sub: "Ilova kodiga emas, ma'lumotlar bazasi cheklovlariga ishoning." }
      ];

      rules.forEach((r, i) => {
        const ry = 370 + i * 95;
        pill(r.n, 1060, ry + 15, C.blue, kMain, 18);
        text(r.title, 1110, ry, { size: 21, weight: 700, color: C.ink, fam: UI });
        text(r.sub, 1110, ry + 32, { size: 19, color: C.soft, fam: UI });
      });

      // Pastki xulosa kartasi
      const kFinal = P(t, W('l10', 'poydevor'), 0.8);
      withA(kFinal, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.green, p: kFinal });
        text("Xulosa: Ma'lumotlar Bazasi Poydevori", 160, 785, { size: 26, weight: 700, color: C.green, fam: UI });
        text("To'g'ri tanlangan tashqi kalitlar, cheklovlar va indekslar butun dasturiy", 160, 850, { size: 24, color: C.ink, fam: UI });
        text("tizimning tezkor, barqaror va xatosiz ishlashiga mustahkam poydevor yaratadi.", 160, 905, { size: 24, weight: 700, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.aloqa_turlari.s) sIntro(t);
    else if (t < TM.scenes.on_delete_siyosati.s) sAloqaTurlari(t);
    else if (t < TM.scenes.indekslash_va_chap_ustun.s) sOnDelete(t);
    else if (t < TM.scenes.kompozit_va_xulosa.s) sIndekslash(t);
    else sKompozit(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
