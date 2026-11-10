// SQL 48-bob 1-qism: "Tushuncha" — Sahifalash
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

  // 1. OFFSET VA UNING NARXI (0 -> 15.96s)
  function sOffsetVaUningNarxi(t) {
    const k = P(t, 0.3, 1.0);
    hand("48-bob. Sahifalash", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("OFFSET Nega Katta Hajmda Sekin?", 960, 195, { size: 60, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("LIMIT 20 OFFSET 900000 nima uchun serverni qiyin ahvolga soladi?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: OFFSET mexanizmi
      card(140, 340, 780, 480, { fill: C.card, col: C.red, p: kBox });
      text("Server Ichidagi Hisob-Kitob", 180, 390, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT id, sana FROM buyurtmalar", 180, 455, { size: 16, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20 OFFSET 900000;", 180, 485, { size: 16, weight: 700, fam: MONO, color: C.red });

      srect(180, 520, 700, 130, { fill: '#fff2f0', stroke: C.red });
      text("Baza nima ish qiladi?", 200, 555, { size: 18, weight: 700, fam: UI, color: C.red });
      text("• LIMIT 20 OFFSET 900000 aslida LIMIT 900020 deb hisoblanadi.", 200, 590, { size: 16, fam: UI, color: C.ink, wrap: 660 });
      text("• Server 900 020 ta qatorni o'qiydi va 900k qatorni tashlab yuboradi!", 200, 620, { size: 16, weight: 700, fam: UI, color: C.red, wrap: 660 });

      text("Vaqt taqqosi: 0.029 ms (1-sahifa) -> 36.26 ms (45000-sahifa)", 180, 680, { size: 17, weight: 700, color: C.red, fam: UI, wrap: 700 });
      text("Indeks bor bo'lsa ham 900 000 ta yozuvni skan qilish shart!", 180, 710, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("OFFSET chuqurlashgan sari vaqt unga proporsional o'sadi", 530, 780, C.red, kBox, 15);

      // O'ng: Nega bu samarasiz?
      const kRight = P(t, 8.0, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.orange, p: kRight });
        text("OFFSET Nega O(N) Murakkablikka Ega?", 1040, 390, { size: 24, weight: 700, color: C.orange, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Katta jadvallarda OFFSET ishlatganda:", 1040, 455, { size: 18, weight: 700, color: C.ink, fam: UI });

        srect(1040, 485, 700, 160, { fill: '#fffbe6', stroke: C.orange });
        text("1. Sahifa 1: OFFSET 0      -> 20 qator o'qildi (0.029 ms)", 1060, 520, { size: 15, fam: MONO, color: C.green });
        text("2. Sahifa 1000: OFFSET 20k -> 20 020 qator o'qildi (1.2 ms)", 1060, 555, { size: 15, fam: MONO, color: C.ink });
        text("3. Sahifa 45000: OFFSET 900k -> 900 020 qator o'qildi (36 ms)", 1060, 590, { size: 15, fam: MONO, color: C.red });
        text("Faqat 20 ta natija uchun 900 mingta qator elanadi!", 1060, 625, { size: 15, weight: 700, fam: UI, color: C.red });

        text("Disk va xotira keshiga katta bosim tushadi.", 1040, 680, { size: 17, color: C.soft, fam: UI, wrap: 700 });
        text("Ro'yxat oxiriga yetguncha har bir sahifa sekinlashib boradi.", 1040, 710, { size: 17, color: C.soft, fam: UI, wrap: 700 });

        pill("OFFSET o'tkazib yuborgan qatorlar ham serverda hisoblanadi", 1390, 780, C.orange, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.5, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Rasmiy hujjat (PostgreSQL 7.6): O'tkazib yuborilgan qatorlar ham server ichida hisoblanadi!", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Shuning uchun katta hajmli jadvallarda chuqur OFFSET ishlatish qat'iyan tavsiya etilmaydi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. YAGONA TARTIB VA KOMPOZIT KALIT (15.96 -> 33.38s)
  function sYagonaTartib(t) {
    heading("2. YAGONA TARTIB: ORDER BY sana, id", "Takrorlanuvchi qiymatlar va deterministik tartiblash", t, TM.scenes.yagona_tartib_va_kompozit_kalit);

    const kBox = P(t, 16.5, 0.8);
    withA(kBox, () => {
      // Chap: Xavfli saralash
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("Faqat sana Bo'yicha Saralash Xatosi", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("SELECT id, sana FROM buyurtmalar ORDER BY sana LIMIT 20;", 180, 355, { size: 13, fam: MONO, color: C.ink });

      srect(180, 390, 700, 150, { fill: '#fff2f0', stroke: C.red });
      text("Nega tartib noaniq (non-deterministic)?", 200, 425, { size: 18, weight: 700, fam: UI, color: C.red });
      text("• Bir daqiqada o'nlab yoki yuzlab buyurtmalar tushishi mumkin.", 200, 460, { size: 15, fam: UI, color: C.ink, wrap: 660 });
      text("• Qiymat bir xil bo'lsa, SQL standartiga ko'ra tartib ixtiyoriydir!", 200, 490, { size: 15, weight: 700, color: C.red, fam: UI, wrap: 660 });
      text("• Reja o'zgarsa, 1-sahifadagi qator 2-sahifaga ham tushishi mumkin.", 200, 520, { size: 15, fam: UI, color: C.soft, wrap: 660 });

      text("Hujjat ogohlantirishi (PostgreSQL & MySQL):", 180, 580, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("LIMIT ishlatganda doim qat'iy yagona tartib beruvchi ustun kerak.", 180, 615, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("Aks holda sahifalar orasida qatorlar yo'qoladi yoki takrorlanadi.", 180, 645, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("ORDER BY sana yetarli emas — bir xil sanada tartib buziladi", 530, 755, C.red, kBox, 15);
    });

    const kRight = P(t, 24.5, 0.8);
    withA(kRight, () => {
      // O'ng: Kompozit kalit
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("Yechim: Qator Konstruktori (sana, id)", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("ORDER BY sana, id LIMIT 20;", 1040, 355, { size: 15, weight: 700, fam: MONO, color: C.green });

      srect(1040, 390, 700, 150, { fill: '#f6ffed', stroke: C.green });
      text("Qator konstruktori (Row Constructor) qoidasi:", 1060, 425, { size: 17, weight: 700, fam: UI, color: C.green });
      text("(sana, id) > (x, y) ifodasining aniq ma'nosi:", 1060, 460, { size: 15, fam: MONO, color: C.blue });
      text("sana > x OR (sana = x AND id > y)", 1060, 490, { size: 16, weight: 700, fam: MONO, color: C.green });
      text("Leksikografik tartib: Sana teng bo'lsa, id kattasi keyin keladi!", 1060, 520, { size: 14, fam: UI, color: C.ink });

      text("Afzalliklari:", 1040, 580, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Indeks: CREATE INDEX b_sana_id ON buyurtmalar (sana, id);", 1040, 615, { size: 14, fam: MONO, color: C.ink });
      text("• Qatorlar tartibi 100% deterministik va barqaror bo'ladi.", 1040, 645, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Keyset sahifalashning poydevori aynan shu kompozit kalitdir.", 1040, 675, { size: 16, weight: 700, color: C.blue, fam: UI, wrap: 700 });

      pill("Yagona ustun (id) qo'shish tartibni to'liq mustahkamlaydi", 1390, 755, C.green, kRight, 15);
    });

    const kSum = P(t, 29.5, 0.8);
    withA(kSum, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kSum });
      text("Oltin qoida: Sahifalashda ORDER BY oxiriga albatta PRIMARY KEY (id) qo'shing!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Shunda bir xil sanali yozuvlar hech qachon sahifalar orasida sarson bo'lmaydi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. KEYSET SAHIFALASH MEXANIZMI (33.38 -> 49.66s)
  function sKeysetMexanizmi(t) {
    heading("3. KEYSET (KURSOR) SAHIFALASH USULI", "Sahifa raqami emas, oxirgi qator qiymatini eslab qolish", t, TM.scenes.keyset_sahifalash_mexanizmi);

    const kHow = P(t, 34.0, 0.8);
    withA(kHow, () => {
      // Chap: Keyset qanday ishlaydi
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kHow });
      text("1. Keyset Qanday Ishlaydi?", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("Oldingi sahifaning oxirgi qatori: sana='08:00:00', id=900000", 180, 355, { size: 14, fam: MONO, color: C.ink });

      srect(180, 390, 700, 150, { fill: '#e6f7ff', stroke: C.blue });
      text("Keyingi sahifa so'rovi:", 200, 420, { size: 16, weight: 700, fam: UI, color: C.blue });
      text("SELECT id, sana FROM buyurtmalar", 200, 450, { size: 14, fam: MONO, color: C.ink });
      text("WHERE (sana, id) > ('2025-07-28 08:00:00', 900000)", 200, 480, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("ORDER BY sana, id LIMIT 20;", 200, 510, { size: 14, fam: MONO, color: C.ink });

      text("Server nima qiladi?", 180, 580, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• B-tree indeksi ildizidan to'g'ridan-to'g'ri (sana, id) ga boradi.", 180, 615, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Oldingi 900 000 qator umuman o'qilmaydi!", 180, 645, { size: 16, weight: 700, color: C.green, fam: UI, wrap: 700 });
      text("• Indeksdan aynan kerakli keyingi 20 ta yozuv olinadi.", 180, 675, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("Keyset o'rinni emas, kalit qiymatini qidiradi", 530, 755, C.blue, kHow, 15);
    });

    const kSpeed = P(t, 41.5, 0.8);
    withA(kSpeed, () => {
      // O'ng: Doimiy O(1) tezlik
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kSpeed });
      text("2. Doimiy O(1) Tezlik: Har Safar 0.02 ms", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("PostgreSQL 18.6 EXPLAIN ANALYZE:", 1060, 375, { size: 15, weight: 700, fam: UI, color: C.green });
      text("Index Only Scan using b_sana_id (actual rows=20.00)", 1060, 410, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("Index Cond: (ROW(sana, id) > ROW('...'))", 1060, 440, { size: 13, fam: MONO, color: C.ink });
      text("Execution Time: 0.020 ms (Atigi 20 qator o'qildi!)", 1060, 470, { size: 15, weight: 700, fam: MONO, color: C.blue });

      text("Taqqoslash (1 million qatorda):", 1040, 540, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• OFFSET 900000: 900 020 qator o'qildi, 36.26 ms.", 1040, 575, { size: 16, color: C.red, fam: UI, weight: 700 });
      text("• Keyset: 20 qator o'qildi, 0.020 ms.", 1040, 610, { size: 16, color: C.green, fam: UI, weight: 700 });
      text("• Keyset 1800 baravar tezroq va xotirani band qilmaydi!", 1040, 645, { size: 16, color: C.blue, fam: UI, weight: 700 });

      pill("1800 baravar tezlashuv: 1-sahifadek chaqmoqdek tez", 1390, 755, C.green, kSpeed, 15);
    });

    const kBot = P(t, 46.5, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Cheklov: Keyset'da '45-sahifaga sakrash' bo'lmaydi — faqat Keyingi va Oldingi!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Cheksiz lenta (infinite scroll), 'Yana yuklash' tugmasi va mobil API lar uchun bu eng optimal usuldir.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. OFFSET VA DRIFT MUAMMOSI (49.66 -> 69.0s)
  function sOffsetVaDrift(t) {
    heading("4. O'ZGARUVCHAN MA'LUMOT VA SAHIFA SURILISHI", "OFFSET yangi ma'lumotlarda qanday dublikat keltirib chiqaradi?", t, TM.scenes.offset_va_drift_muammosi);

    const kDrift = P(t, 50.5, 0.8);
    withA(kDrift, () => {
      // Chap: OFFSET drift muammosi
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kDrift });
      text("OFFSET Bilan Sahifa Surilishi (Drift)", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      srect(180, 340, 700, 140, { fill: '#fff2f0', stroke: C.red });
      text("1-sahifa (LIMIT 3): 1000000, 999999, 999998 ko'rindi.", 200, 375, { size: 14, fam: MONO, color: C.ink });
      text("Shu payt jadvalga YANGI BUYURTMA (1000001) qo'shildi!", 200, 410, { size: 14, weight: 700, fam: UI, color: C.red });
      text("2-sahifa (OFFSET 3): 999998 yana chiqdi!", 200, 445, { size: 15, weight: 700, fam: MONO, color: C.red });

      text("Nega bunday bo'ldi?", 180, 510, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Yangi qator barcha oldingi qatorlarni bitta pastga surdi.", 180, 545, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• OFFSET 3 endi 999998 qatoriga to'g'ri kelib qoldi.", 180, 575, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Foydalanuvchi bitta buyurtmani ikki marta ko'rdi (dublikat)!", 180, 605, { size: 16, weight: 700, color: C.red, fam: UI, wrap: 700 });
      text("• Agar qator o'chirilganda edi — bittasi umuman tushib qolardi.", 180, 635, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("OFFSET yangi yozuvlar qo'shilganda qatorlarni surib yuboradi", 530, 755, C.red, kDrift, 15);
    });

    const kSafe = P(t, 57.5, 0.8);
    withA(kSafe, () => {
      // O'ng: Keyset barqarorligi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kSafe });
      text("Keyset: Qiymat Bo'yicha Mutlaq Barqaror", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 140, { fill: '#f6ffed', stroke: C.green });
      text("WHERE (sana, id) < ('2025-08-20 11:32:00', 999998)", 1060, 375, { size: 13, fam: MONO, color: C.blue });
      text("ORDER BY sana DESC, id DESC LIMIT 3;", 1060, 405, { size: 13, fam: MONO, color: C.blue });
      text("Natija: 999997, 999996, 999995 (Aniq va to'g'ri davom!)", 1060, 445, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("Keyset afzalliklari:", 1040, 510, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• O'rin raqamiga emas, aynan oxirgi ko'rilgan qiymatga tayanadi.", 1040, 545, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Yuqoriga 1000 ta yangi qator qo'shilsa ham sahifa buzilmaydi.", 1040, 575, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Hech qanday dublikat yoki yo'qolgan qatorlar bo'lmaydi.", 1040, 605, { size: 16, color: C.green, fam: UI, weight: 700, wrap: 700 });
      text("• REST va GraphQL API lar kursorli sahifalashni aynan shuning uchun tanlaydi.", 1040, 635, { size: 16, color: C.blue, fam: UI, wrap: 700 });

      pill("Keyset o'zgaruvchan ma'lumotlarda ham 100% ishonchli", 1390, 755, C.green, kSafe, 15);
    });

    const kFinal = P(t, 63.5, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Xulosa: Zamonaviy lentalar va API larda kursorli keyset sahifalashdan foydalaning!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("U ham serverni ortiqcha yukdan qutqaradi, ham foydalanuvchiga toza va aniq ma'lumot yetkazadi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.offset_va_uning_narxi.e) {
      sOffsetVaUningNarxi(t);
    } else if (t < TM.scenes.yagona_tartib_va_kompozit_kalit.e) {
      sYagonaTartib(t);
    } else if (t < TM.scenes.keyset_sahifalash_mexanizmi.e) {
      sKeysetMexanizmi(t);
    } else {
      sOffsetVaDrift(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
