// SQL 43-bob 1-qism: "Tushuncha" — Maxsus indekslar
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

  // 1. MAXSUS INDEKSLAR XARITASI (0 -> 17.33s)
  function sMaxsusIndekslarXaritasi(t) {
    const k = P(t, 0.3, 1.0);
    hand("43-bob. Maxsus Indekslar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Maxsus Indekslar Xaritasi va Imkoniyatlari", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Nimaga, qaysi qatorlarga va qanday tartibda indeks qurish mumkin?", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: 4 ta asosiy tur
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kBox });
      text("4 Ta Maxsus Indeks Turi:", 180, 430, { size: 23, weight: 700, color: C.blue, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("1. Ifoda indeksi (Expression Index):", 180, 495, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   Ustundan hisoblangan qiymat: (lower(email))", 180, 525, { size: 17, fam: MONO, color: C.blue });

      text("2. Qisman indeks (Partial Index):", 180, 565, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   Faqat shartga mos qatorlar: WHERE holat = 'yangi'", 180, 595, { size: 17, fam: MONO, color: C.green });

      text("3. Qoplovchi INCLUDE indeksi:", 180, 635, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("   Qidiruv kalitiga kirmaydigan yuk: (id) INCLUDE (ism)", 180, 665, { size: 17, fam: MONO, color: C.purple });

      text("4. Operator klassi: (email text_pattern_ops)", 180, 705, { size: 17, fam: MONO, color: C.orange });
      pill("Aniq maqsadga yo'naltirilgan optimizatsiya", 530, 765, C.blue, kBox, 16);

      // O'ng: Natijalar va foyda
      const kBen = P(t, 8.5, 0.8);
      withA(kBen, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kBen });
        text("Maxsus Indekslarning Asosiy Foydasi:", 1040, 430, { size: 23, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("• Katta-kichik harf farqlarini (case-insensitivity)", 1040, 500, { size: 19, color: C.ink, fam: UI });
        text("  baza darajasida to'liq hal qiladi.", 1040, 530, { size: 19, color: C.ink, fam: UI });

        text("• Indeks hajmini 95% gacha qisqartiradi (qisman indeks).", 1040, 580, { size: 19, weight: 600, color: C.green, fam: UI });
        text("• Har bir INSERT va UPDATE yuklamasini tejaydi.", 1040, 615, { size: 19, color: C.ink, fam: UI });

        text("• Index-Only Scan orqali asosiy heap jadvalga", 1040, 665, { size: 19, color: C.soft, fam: UI });
        text("  tasodifiy disk murojaatlarini butunlay yo'qotadi.", 1040, 695, { size: 19, weight: 700, color: C.blue, fam: UI });
        pill("Kichik xotira, tejamkor yozish va yuqori tezlik", 1390, 765, C.green, kBen, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 13.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Oddiy Indeks Cheklovlari:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Oddiy indeks jadvalning barcha 100% qatorini va sof ustun qiymatlarini saqlaydi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Maxsus indekslar esa faqat so'rovlarga mos qator va ifodalarni saqlab, tizim yuklamasini keskin kamaytiradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. IFODA INDEKSI VA UNIQUE (17.33 -> 34.03s)
  function sIfodaIndeksi(t) {
    heading("Ifoda Indeksi va UNIQUE (lower)", t, TM.scenes.ifoda_indeksi_va_unique.s);

    const kCards = P(t, TM.scenes.ifoda_indeksi_va_unique.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Nega oddiy indeks ishlamaydi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kCards });
      text("Muammo: WHERE lower(email) = 'user@x'", 180, 430, { size: 21, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("CREATE INDEX f_email ON f (email);", 180, 495, { size: 17, fam: MONO, color: '#cdd6f4' });
      text("SELECT * FROM f WHERE lower(email) = 'user@x';", 180, 525, { size: 16, fam: MONO, color: '#f38ba8' });

      sline(180, 555, 880, 555, { col: '#45475a', w: 1 });
      text("EXPLAIN Natijasi: Parallel Seq Scan!", 180, 590, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
      text("• B-tree daraxtida sof 'User@Misol.UZ' saqlangan.", 180, 625, { size: 17, fam: UI, color: '#cdd6f4' });
      text("• 'lower()' amali natijasi esa daraxtda yo'q!", 180, 655, { size: 17, weight: 600, fam: UI, color: '#f38ba8' });
      text("• Baza butun jadvalni qatorma-qator tekshirishga majbur.", 180, 685, { size: 16, fam: UI, color: '#a6adc8' });
      pill("Sof ustun indeksi ifodaga mos kelmaydi: Seq Scan", 530, 765, C.red, kCards, 16);

      // O'ng: Ifoda indeksi va Unique
      const kFix = P(t, 25.5, 0.8);
      withA(kFix, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kFix });
        text("Yechim: Ifoda Indeksi va UNIQUE (lower)", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("CREATE INDEX f_lower_email ON f (lower(email));", 1040, 495, { size: 16, fam: MONO, color: '#89b4fa' });
        text("-> Index Scan using f_lower_email ✓", 1040, 525, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("Harf Farqi Bilan Takrorlanishni Taqiqilash:", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#fab387' });
        text("CREATE UNIQUE INDEX ON f (lower(email));", 1040, 625, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("INSERT INTO f VALUES (..., 'USER77@MISOL.UZ');", 1040, 655, { size: 16, fam: MONO, color: '#cdd6f4' });
        text("ERROR: duplicate key value violates unique constraint!", 1040, 690, { size: 15, weight: 700, fam: MONO, color: '#f38ba8' });
        pill("UNIQUE (lower) dublikatlardan to'liq himoyalaydi", 1390, 765, C.green, kFix, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 29.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Ifoda Indeksi Muhim Qoidalari:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Ifoda indeksi har bir INSERT va UPDATE amalida hisoblanadi. Qidiruvda esa qayta hisoblanmasdan tayyor olinadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Ifodada faqat deterministik (random bo'lmagan) funksiyalar ishlatilishi shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. QISMAN INDEKS MOHIYATI (34.03 -> 48.61s)
  function sQismanIndeks(t) {
    heading("Qisman Indeks (Partial Index): Hajm va Tezlik Tejamkorligi", t, TM.scenes.qisman_indeks_mohiyati.s);

    const kCards = P(t, TM.scenes.qisman_indeks_mohiyati.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: 21 baravar kichik hajm
      card(140, 380, 780, 420, { fill: C.card, col: C.green, p: kCards });
      text("21 Baravar Kichik Hajm (PostgreSQL 18):", 180, 430, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("Jadvalda 200 000 qator: holat = 'yangi' (1% / 2000 ta)", 180, 495, { size: 17, fam: MONO, color: C.ink });

      text("1. To'liq indeks: CREATE INDEX ON f (holat);", 180, 545, { size: 17, fam: MONO, color: C.red });
      text("   Diskdagi hajmi: 1 368 kB (barcha qatorlar)", 180, 575, { size: 17, weight: 600, color: C.red, fam: UI });

      text("2. Qisman indeks: CREATE INDEX ON f (id) WHERE holat='yangi';", 180, 625, { size: 16, fam: MONO, color: C.green });
      text("   Diskdagi hajmi: atigi 64 kB! (21x kichik)", 180, 655, { size: 17, weight: 700, color: C.green, fam: UI });
      pill("64 kB vs 1368 kB: 21 baravar kam disk IO", 530, 765, C.green, kCards, 16);

      // O'ng: Qachon ishlaydi (W => X qoidasi)
      const kRules = P(t, 41.5, 0.8);
      withA(kRules, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.blue, p: kRules });
        text("Qachon Ishlaydi? Mantiqiy Kafolat (W => X)", 1040, 430, { size: 21, weight: 700, color: '#89b4fa', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. WHERE holat = 'yangi' AND id > 199000;", 1040, 495, { size: 16, fam: MONO, color: '#a6e3a1' });
        text("-> Index Only Scan using f_yangi ✓", 1040, 525, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   So'rov sharti indeks shartini to'liq kafolatlaydi.", 1040, 555, { size: 16, fam: UI, color: '#cdd6f4' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("2. WHERE holat = 'faol' AND id > 199000;", 1040, 620, { size: 16, fam: MONO, color: '#f38ba8' });
        text("-> Index Scan using f_pkey (asosiy kalit!)", 1040, 650, { size: 16, fam: MONO, color: '#f38ba8' });
        text("   f_yangi da bunday qatorlar yo'q, shuning uchun ishlatilmaydi.", 1040, 680, { size: 15, fam: UI, color: '#a6adc8' });
        pill("So'rov sharti indeks shartini qamrab olishi shart", 1390, 765, C.blue, kRules, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 45.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Qisman Indeksning Oltin Foydasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Agar 99% buyurtmalar yopilgan bo'lib, siz faqat 1% yangi buyurtmalarni qidirsangiz,", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("qisman indeks eng ideal tanlovdir: disk tejaladi, qidiruv tezlashadi va 99% qatorlar yozilishida indeks yangilanmaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. INCLUDE VA INDEX-ONLY SCAN (48.61 -> 64.70s)
  function sIncludeVaIndexOnly(t) {
    heading("INCLUDE Ustunlari va Index-Only Scan", t, TM.scenes.include_va_index_only_scan.s);

    const kCards = P(t, TM.scenes.include_va_index_only_scan.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: INCLUDE sintaksisi va maqsadi
      card(140, 380, 780, 420, { fill: C.card, col: C.purple, p: kCards });
      text("INCLUDE: Qidiruv Kaliti Emas, Shunchaki 'Yuk':", 180, 430, { size: 21, weight: 700, color: C.purple, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("CREATE INDEX f_id_inc ON f (id) INCLUDE (ism);", 180, 495, { size: 16, fam: MONO, color: C.blue });
      sline(180, 520, 880, 520, { col: C.pencil, w: 1 });

      text("• 'id': B-Tree daraxti kaliti (saralash va qidiruv).", 180, 560, { size: 18, color: C.ink, fam: UI });
      text("• 'ism': Barg tugunlarida saqlanadigan qo'shimcha yuk.", 180, 595, { size: 18, color: C.ink, fam: UI });
      text("• So'rov: SELECT id, ism WHERE id BETWEEN 1000 AND 1100", 180, 635, { size: 16, fam: MONO, color: C.purple });
      text("• Natija: Asosiy jadval sahifasiga murojaat qilinmaydi!", 180, 675, { size: 18, weight: 700, color: C.green, fam: UI });
      pill("Index-Only Scan: jadval heap'iga kirmasdan javob", 530, 765, C.purple, kCards, 16);

      // O'ng: Visibility Map va Heap Fetches
      const kVis = P(t, 57.5, 0.8);
      withA(kVis, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kVis });
        text("PostgreSQL Visibility Map va Heap Fetches:", 1040, 430, { size: 21, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. Yangi Jadvalda (VACUUM'siz):", 1040, 495, { size: 18, weight: 700, fam: UI, color: '#fab387' });
        text("-> Index Only Scan ... Heap Fetches: 101", 1040, 525, { size: 16, fam: MONO, color: '#f38ba8' });
        text("   (Ko'rinuvchanlik noaniq, baribir diskka borildi!)", 1040, 555, { size: 16, fam: UI, color: '#a6adc8' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("2. VACUUM Buyrug'idan Keyin:", 1040, 620, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Index Only Scan ... Heap Fetches: 0 ✓", 1040, 650, { size: 17, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   (Visibility bitlari o'rnatildi, javob to'liq indeksdan!)", 1040, 680, { size: 16, fam: UI, color: '#cdd6f4' });
        pill("VACUUM Heap Fetches sonini 0 ga tushiradi", 1390, 765, C.green, kVis, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 61.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Index-Only Scan Haqiqati:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("PostgreSQL'da qatorlarning tranzaksiyalarga ko'rinuvchanligi asosiy jadvalda saqlanadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Shuning uchun haqiqiy 0 ta Heap Fetches tezligiga faqat muntazam VACUUM qilingan barqaror sahifalarda erishiladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. OPERATOR KLASSI VA LIKE (64.70 -> 83.56s)
  function sOperatorKlassi(t) {
    heading("Operator Klassi: text_pattern_ops va LIKE 'x%'", t, TM.scenes.operator_klassi_va_like.s);

    const kCards = P(t, TM.scenes.operator_klassi_va_like.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Collation muammosi
      card(140, 380, 780, 420, { fill: '#1e1e2e', col: C.red, p: kCards });
      text("Collation Muammosi (en_US.UTF-8)", 180, 430, { size: 22, weight: 700, color: '#f38ba8', fam: MONO });
      sline(180, 455, 880, 455, { col: '#45475a', w: 1.5 });

      text("SELECT id FROM f WHERE email LIKE 'user77%';", 180, 495, { size: 16, fam: MONO, color: '#cdd6f4' });
      sline(180, 520, 880, 520, { col: '#45475a', w: 1 });

      text("Oddiy f_email indeksi bor, lekin:", 180, 555, { size: 18, weight: 700, fam: UI, color: '#f38ba8' });
      text("-> Seq Scan on f (Filter: email ~~ 'user77%') ✗", 180, 590, { size: 16, fam: MONO, color: '#f38ba8' });
      text("• Sabab: Standart collation milliy til qoidalariga ko'ra", 180, 630, { size: 17, fam: UI, color: '#cdd6f4' });
      text("  tartiblangan bo'lib, qat'iy baytma-bayt taqqoslamaydi.", 180, 660, { size: 17, fam: UI, color: '#cdd6f4' });
      text("• Natijada B-tree LIKE prefiksini oraliqqa aylantira olmaydi.", 180, 690, { size: 16, color: '#a6adc8', fam: UI });
      pill("Standart B-tree LIKE ga mos kelmaydi", 530, 765, C.red, kCards, 16);

      // O'ng: text_pattern_ops yechimi
      const kOps = P(t, 73.5, 0.8);
      withA(kOps, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kOps });
        text("Yechim: text_pattern_ops", 1040, 430, { size: 22, weight: 700, color: '#a6e3a1', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("CREATE INDEX f_email_pattern", 1040, 495, { size: 17, fam: MONO, color: '#89b4fa' });
        text("ON f (email text_pattern_ops);", 1040, 525, { size: 17, fam: MONO, color: '#89b4fa' });

        sline(1040, 555, 1740, 555, { col: '#45475a', w: 1 });
        text("EXPLAIN Natijasi: Mukammal Oraliq!", 1040, 590, { size: 18, weight: 700, fam: UI, color: '#a6e3a1' });
        text("-> Index Scan using f_email_pattern on f ✓", 1040, 625, { size: 16, weight: 700, fam: MONO, color: '#a6e3a1' });
        text("   Index Cond: (email ~>=~ 'user77' AND email ~<~ 'user78')", 1040, 655, { size: 15, fam: MONO, color: '#cdd6f4' });
        text("• Belgima-belgi qat'iy solishtirib oraliq qidiruv qildi!", 1040, 690, { size: 16, fam: UI, color: '#a6adc8' });
        pill("LIKE 'user77%' oraliq Index Scanga aylandi", 1390, 765, C.green, kOps, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 78.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Operator Klassining Asosiy Vazifasi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Indeks qiymatlarni qaysi qoida bo'yicha saralagan bo'lsa, faqat o'sha qoidadagi taqqoslashlarga xizmat qila oladi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Agar sizga LIKE 'prefiks%' so'rovlari tez ishlashi kerak bo'lsa, PostgreSQL'da text_pattern_ops indeksini qo'yish shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.ifoda_indeksi_va_unique.s) {
      sMaxsusIndekslarXaritasi(t);
    } else if (t < TM.scenes.qisman_indeks_mohiyati.s) {
      sIfodaIndeksi(t);
    } else if (t < TM.scenes.include_va_index_only_scan.s) {
      sQismanIndeks(t);
    } else if (t < TM.scenes.operator_klassi_va_like.s) {
      sIncludeVaIndexOnly(t);
    } else {
      sOperatorKlassi(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
