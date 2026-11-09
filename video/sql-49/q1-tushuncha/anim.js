// SQL 49-bob 1-qism: "Tushuncha" — To'liq matnli qidiruv
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 18) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. LIKE KAMCHILIKLARI (0 -> 16.26s)
  function sLikeKamchiliklari(t) {
    const k = P(t, 0.3, 1.0);
    hand("49-bob. To'liq Matnli Qidiruv", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("LIKE Nega To'liq Matnga Yetarli Emas?", 960, 195, { size: 60, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Nega oddiy LIKE '%...%' katta matnlarda samarasiz?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Oddiy LIKE muammolari
      card(140, 340, 780, 480, { fill: C.card, col: C.red, p: kBox });
      text("Oddiy LIKE '%so'z%' Cheklovlari", 180, 390, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT * FROM maqolalar", 180, 455, { size: 16, fam: MONO, color: C.ink });
      text("WHERE matn LIKE '%konteyner%';", 180, 485, { size: 16, weight: 700, fam: MONO, color: C.red });

      srect(180, 520, 700, 140, { fill: '#fff2f0', stroke: C.red });
      text("3 ta asosiy kamchilik:", 200, 555, { size: 18, weight: 700, fam: UI, color: C.red });
      text("1. Til bilmaydi: 'konteyner' va 'konteynerda' — boshqa satrlar.", 200, 585, { size: 15, fam: UI, color: C.ink, wrap: 660 });
      text("2. Tartiblamaydi: eng mos natija (relevance) birinchi chiqmaydi.", 200, 615, { size: 15, fam: UI, color: C.ink, wrap: 660 });
      text("3. Sekin: oldida '%' borligi sababli B-tree ishlamaydi (Seq Scan)!", 200, 645, { size: 15, weight: 700, fam: UI, color: C.red, wrap: 660 });

      text("Barcha 100 000 ta qatorni bittalab o'qib tekshirishga majbur bo'ladi.", 180, 695, { size: 16, color: C.soft, fam: UI, wrap: 700 });
      text("Bu esa qidiruv so'rovini bir necha yuz baravargacha sekinlashtiradi.", 180, 725, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("LIKE til qoidalarini ham, moslik reytingini ham bilmaydi", 530, 780, C.red, kBox, 15);

      // O'ng: Indeks bilan bog'liq muammo
      const kRight = P(t, 7.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.orange, p: kRight });
        text("B-tree Indeks Nega Yordam Bermaydi?", 1040, 390, { size: 24, weight: 700, color: C.orange, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Qidiruv shartlarining farqi:", 1040, 455, { size: 18, weight: 700, color: C.ink, fam: UI });

        srect(1040, 485, 700, 160, { fill: '#fffbe6', stroke: C.orange });
        text("A) LIKE 'konteyner%' (boshidan):", 1060, 520, { size: 16, weight: 700, fam: MONO, color: C.green });
        text("   B-tree oraliq qidiruv qila oladi (Index Range Scan).", 1060, 545, { size: 15, fam: UI, color: C.ink });
        text("B) LIKE '%konteyner%' (o'rtasida/ixtiyoriy joyda):", 1060, 580, { size: 16, weight: 700, fam: MONO, color: C.red });
        text("   Indeks saralashidan foydalanib bo'lmaydi. To'liq skan!", 1060, 605, { size: 15, weight: 700, fam: UI, color: C.red });
        text("   PostgreSQL 100 000 qatorni birma-bir ochib ko'radi.", 1060, 630, { size: 15, fam: UI, color: C.soft });

        text("Haqiqiy sinovda: LIKE 4.88 ms vaqt oldi.", 1040, 680, { size: 17, weight: 700, color: C.red, fam: UI });
        text("To'liq matnli GIN indeksi esa atigi 0.030 ms da bajardi (160x tezroq!).", 1040, 710, { size: 16, color: C.green, fam: UI, wrap: 700 });

        pill("To'liq matnli qidiruv maxsus teskari indeks talab qiladi", 1390, 780, C.orange, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("To'liq matnli qidiruv (Full-Text Search) matnni oldindan so'zlarga bo'ladi,", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("so'zlarni normallashtiradi va maxsus teskari indeks (tsvector + GIN) quradi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. FTS ARXITEKTURASI (16.26 -> 30.916s)
  function sFtsArxitekturasi(t) {
    heading("2. TO'LIQ MATNLI QIDIRUV (FTS) BOSQICHLARI", "Tokenizatsiya, normalizatsiya va teskari indeks", t, TM.scenes.fts_arxitekturasi);

    const kBox = P(t, 17.0, 0.8);
    withA(kBox, () => {
      // Chap: Bosqichlar
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("FTS Qayta Ishlash Konveyeri", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Asl matn: 'The container runs the application; containers are isolated.'", 180, 350, { size: 14, fam: MONO, color: C.ink, wrap: 700 });

      // Step 1: Token
      srect(180, 385, 700, 70, { fill: '#e6f4ff', stroke: C.blue });
      text("1. Tokenizatsiya: so'z, raqam va belgilarga ajratish", 200, 412, { size: 16, weight: 700, fam: UI, color: C.blue });
      text("Natija: 'The', 'container', 'runs', 'the', 'application', 'containers'...", 200, 440, { size: 13, fam: MONO, color: C.ink });

      // Step 2: Stop words & Lexemes
      srect(180, 470, 700, 90, { fill: '#f6ffed', stroke: C.green });
      text("2. Normalizatsiya va To'xtash so'zlari (Stop words)", 200, 497, { size: 16, weight: 700, fam: UI, color: C.green });
      text("• 'the', 'are' kabi ma'nosiz to'xtash so'zlari tashlab yuboriladi.", 200, 525, { size: 14, fam: UI, color: C.ink });
      text("• 'container' va 'containers' bitta leksemaga aylanadi: 'contain'.", 200, 548, { size: 14, weight: 700, fam: UI, color: C.green });

      // Step 3: tsvector
      srect(180, 575, 700, 85, { fill: '#fff7e6', stroke: C.orange });
      text("3. tsvector: Tartiblangan leksemalar va ularning o'rni", 200, 602, { size: 16, weight: 700, fam: UI, color: C.orange });
      text("'applic':5  'contain':2,6  'isol':8  'run':3", 200, 638, { size: 16, weight: 700, fam: MONO, color: C.orange });

      text("Har bir leksema o'zining so'zdagi o'rni (pozitsiyasi) bilan saqlanadi.", 180, 695, { size: 15, color: C.soft, fam: UI, wrap: 700 });
      text("Bu orqali so'zlarning oraliq masofasi va iboralar ham qidiriladi.", 180, 725, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("tsvector matnni ixcham va qidirishga tayyor leksemalarga aylantiradi", 530, 765, C.blue, kBox, 15);
    });

    const kRight = P(t, 23.5, 0.8);
    withA(kRight, () => {
      // O'ng: Teskari indeks (Inverted Index)
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("Teskari Indeks (Inverted Index / GIN)", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Kitob oxiridagi mundarija (alfabit ko'rsatkichi) kabi ishlaydi:", 1040, 350, { size: 17, weight: 700, color: C.ink, fam: UI });

      srect(1040, 385, 700, 200, { fill: '#f6ffed', stroke: C.green });
      text("Leksema (Kalit)    -> Qaysi maqolalarda bor (ID ro'yxati)", 1060, 415, { size: 15, weight: 700, fam: MONO, color: C.green });
      sline(1060, 428, 1720, 428, { col: C.pencil, w: 1 });
      text("'contain'           -> Doc 1, Doc 2, Doc 5, Doc 6", 1060, 455, { size: 15, fam: MONO, color: C.ink });
      text("'docker'            -> Doc 1", 1060, 485, { size: 15, fam: MONO, color: C.ink });
      text("'indeks'            -> Doc 3", 1060, 515, { size: 15, fam: MONO, color: C.ink });
      text("'tarmoq'            -> Doc 2", 1060, 545, { size: 15, fam: MONO, color: C.ink });
      text("'xabar'             -> Doc 4", 1060, 575, { size: 15, fam: MONO, color: C.ink });

      text("So'rov kelganda (masalan: 'contain'):", 1040, 615, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("1. Butun jadvaldagi matnlarni o'qib chiqish SHART EMAS.", 1060, 645, { size: 15, fam: UI, color: C.ink, wrap: 680 });
      text("2. GIN indeks 'contain' kaliti bo'yicha to'g'ri Doc ID larni oladi.", 1060, 675, { size: 15, weight: 700, fam: UI, color: C.green, wrap: 680 });
      text("3. Natija 100 minglab qatorda ham bir necha mikrosekundda tayyor!", 1060, 705, { size: 15, fam: UI, color: C.soft, wrap: 680 });

      pill("GIN indeksi har bir leksemaga bog'langan hujjatlar ro'yxatini ushlaydi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 27.5, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("tsquery va @@ operatori: tsvector @@ to_tsquery('simple', 'konteyner')", 960, 880, { size: 21, weight: 700, color: C.blue, fam: MONO, align: 'center', wrap: 1300 });
      text("Moslik topilsa rost (true) qaytaradi va GIN indeksi orqali bir zumda filtrlashni ta'minlaydi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. O'ZBEK TILI VA PREFIKS (30.916 -> 44.364s)
  function sOzbekTiliVaPrefiks(t) {
    heading("3. O'ZBEK TILI VA PREFIKS QIDIRUVI", "Lug'at yo'qligi sababli 'simple' va prefiks yechimi", t, TM.scenes.ozbek_tili_va_prefiks);

    const kBox = P(t, 31.5, 0.8);
    withA(kBox, () => {
      // Chap: O'zbek tili holati
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("Postgresda O'zbek Tili Lug'ati", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("pg_ts_config jadvalida 30 ta konfiguratsiya bor:", 180, 350, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("english, russian, french, german... lekin O'ZBEK TILI YO'Q!", 180, 380, { size: 16, weight: 700, fam: MONO, color: C.red });

      srect(180, 410, 700, 160, { fill: '#fff2f0', stroke: C.red });
      text("Shuning uchun 'simple' konfiguratsiyasi ishlatiladi:", 200, 440, { size: 16, weight: 700, fam: UI, color: C.red });
      text("• 'simple' matnni kichik harfga o'tkazadi va so'zlarga bo'ladi.", 200, 470, { size: 15, fam: UI, color: C.ink });
      text("• LEKIN qo'shimchalarni olib tashlamaydi (stemming yo'q)!", 200, 500, { size: 15, weight: 700, fam: UI, color: C.red });
      text("• 'konteyner' va 'konteynerda' ikki xil leksema bo'lib qoladi.", 200, 530, { size: 15, fam: UI, color: C.ink });

      text("Kutilmagan muammo:", 180, 600, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("to_tsquery('simple', 'konteyner') so'rovi faqat 1 va 2-maqolani topadi.", 180, 630, { size: 15, fam: UI, color: C.ink, wrap: 700 });
      text("5-maqoladagi 'Konteynerda baza' esa TOPILMAYDI!", 180, 660, { size: 16, weight: 700, color: C.red, fam: UI, wrap: 700 });

      pill("simple konfiguratsiyasida qo'shimchalar o'zgarishsiz saqlanadi", 530, 765, C.red, kBox, 15);
    });

    const kRight = P(t, 36.5, 0.8);
    withA(kRight, () => {
      // O'ng: Prefiks yechimi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("Amaliy Yechim: Prefiks Qidiruvi (:*)", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("So'z oxiriga ':*' (ikki nuqta yulduzcha) qo'shish:", 1040, 350, { size: 17, weight: 700, color: C.green, fam: UI });

      srect(1040, 385, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("to_tsquery('simple', 'konteyner:*')", 1060, 420, { size: 18, weight: 700, fam: MONO, color: C.green });
      text("Bu qidiruv 'konteyner' bilan boshlanuvchi har qanday so'zni topadi:", 1060, 455, { size: 15, fam: UI, color: C.ink });
      text("✓ 1: 'Docker konteynerlari'", 1060, 485, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("✓ 2: 'Konteyner tarmoqlari'", 1060, 510, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("✓ 5: 'Konteynerda baza'  <-- Endi bu ham topildi!", 1060, 535, { size: 15, weight: 700, fam: MONO, color: C.green });

      text("Foydalanuvchi qidiruvi uchun tavsiya:", 1040, 580, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("websearch_to_tsquery('simple', 'foydalanuvchi matni')", 1040, 615, { size: 16, weight: 700, fam: MONO, color: C.blue });
      text("Foydalanuvchi kiritgan matnda sintaksis xatosi chiqmaydi.", 1040, 645, { size: 15, fam: UI, color: C.soft, wrap: 700 });
      text("Minus belgisi (-docker) bilan keraksiz so'zlar inkor qilinadi.", 1040, 675, { size: 15, fam: UI, color: C.soft, wrap: 700 });

      pill("O'zbek tilida stemming yo'qligida prefiks (:*) asosiy qutqaruvchidir", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 41.5, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("O'zbek tilida qidiruv tizimi qurayotganda: 'simple' + prefiks (:*) kombinatsiyasi", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("qo'shimchalar bilan kelgan barcha o'zbekcha so'zlarni xatosiz qamrab oladi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. TRIGRAMMA VA O'XSHASHLIK (44.364 -> 62.74s)
  function sTrigrammaVaOxshashlik(t) {
    heading("4. TRIGRAMMA VA IMLO XATOLARI (pg_trgm)", "So'z o'xshashligi va bo'lak bo'yicha indeksli qidiruv", t, TM.scenes.trigramma_va_oxshashlik);

    const kBox = P(t, 45.0, 0.8);
    withA(kBox, () => {
      // Chap: Trigramma nima?
      card(140, 240, 780, 560, { fill: C.card, col: C.purple, p: kBox });
      text("Trigramma Nima va Qanday Ishlaydi?", 180, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Satr ketma-ket 3 ta belgidan iborat bo'laklarga ajratiladi:", 180, 350, { size: 17, weight: 700, color: C.ink, fam: UI });

      srect(180, 385, 700, 160, { fill: '#f9f0ff', stroke: C.purple });
      text("Misol: 'kontener' (bitta harfi xato yozilgan)", 200, 420, { size: 16, weight: 700, fam: UI, color: C.purple });
      text("Trigrammalar: {\"  k\", \" ko\", kon, ont, nte, ene, ner, \"er \"}", 200, 455, { size: 14, weight: 700, fam: MONO, color: C.ink });
      text("similarity('konteyner', 'kontener') = 0.5833", 200, 490, { size: 16, weight: 700, fam: MONO, color: C.purple });
      text("Standart chegara 0.3 dan yuqori bo'lgani uchun mos deb topiladi!", 200, 520, { size: 14, fam: UI, color: C.green });

      text("tsvector buni topa olmaydi — chunki leksemalar har xil bo'ladi.", 180, 580, { size: 15, color: C.soft, fam: UI, wrap: 700 });
      text("pg_trgm esa harflar mosligini o'lchab imlo xatolarini ham yengadi.", 180, 610, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      text("Qidiruv operatori: WHERE sarlavha % 'Kontener tarmoqlari'", 180, 660, { size: 15, weight: 700, fam: MONO, color: C.purple });
      text("Natija: 1 va 2-maqolani to'g'ri topib berdi!", 180, 695, { size: 16, weight: 700, color: C.green, fam: UI });

      pill("Trigramma harflar o'xshashligi orqali imlo xatolarini topadi", 530, 765, C.purple, kBox, 15);
    });

    const kRight = P(t, 51.0, 0.8);
    withA(kRight, () => {
      // O'ng: LIKE uchun GIN indeks
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("LIKE '%...%' Uchun GIN Trigramma Indeksi", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Oddiy LIKE qidiruvini indekslash siri:", 1040, 350, { size: 17, weight: 700, color: C.ink, fam: UI });

      srect(1040, 385, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("CREATE INDEX katta_trgm ON katta", 1060, 420, { size: 16, fam: MONO, color: C.ink });
      text("USING gin (matn gin_trgm_ops);", 1060, 450, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("SELECT count(*) FROM katta WHERE matn LIKE '%konteyner%';", 1060, 490, { size: 14, fam: MONO, color: C.ink, wrap: 660 });
      text("So'rov o'zgarmadi, lekin endi GIN indeksi ishlatiladi!", 1060, 525, { size: 15, weight: 700, fam: UI, color: C.green });

      text("Reja va tezlik taqqosi (100 000 qatorli jadvalda):", 1040, 580, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("• Indekssiz LIKE: Seq Scan — 4.88 ms (99 980 qator tekshirildi)", 1060, 615, { size: 15, fam: MONO, color: C.red });
      text("• Trigramma GIN bilan: Bitmap Index Scan — 0.038 ms!", 1060, 645, { size: 15, weight: 700, fam: MONO, color: C.green });
      text("130 baravar tezlashuv — hech qanday kod o'zgartirmasdan!", 1060, 675, { size: 15, weight: 700, fam: UI, color: C.green });

      pill("pg_trgm ixtiyoriy LIKE '%...%' so'rovlarini ham indekslay oladi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 56.5, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("Xulosa: So'zlar va mantiqiy qidiruv uchun tsvector va GIN,", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("imlo xatolari va o'zboshimcha qidiruv uchun esa pg_trgm eng kuchli vositadir.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  function renderScene(t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    if (t < TM.scenes.fts_arxitekturasi.s) {
      sLikeKamchiliklari(t);
    } else if (t < TM.scenes.ozbek_tili_va_prefiks.s) {
      sFtsArxitekturasi(t);
    } else if (t < TM.scenes.trigramma_va_oxshashlik.s) {
      sOzbekTiliVaPrefiks(t);
    } else {
      sTrigrammaVaOxshashlik(t);
    }
  }

  window.renderScene = window.render = window.renderFrame = renderScene;
  window.renderPoster = function () {
    window.renderFrame(10.0);
  };
})();
