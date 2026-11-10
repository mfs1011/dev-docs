// SQL 48-bob 2-qism: "Kod" — Sahifalash
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

  // 1. PG_OFFSET_0_VA_900K (0 -> 19.65s)
  function sPgOffset0va900k(t) {
    const k = P(t, 0.3, 1.0);
    hand("48-bob. Sahifalash", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL: OFFSET 0 va OFFSET 900000", 960, 195, { size: 56, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("1 000 000 buyurtma jadvalida OFFSET tezligi sinovi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: OFFSET 0
      card(140, 340, 780, 480, { fill: C.card, col: C.green, p: kBox });
      text("1. OFFSET 0: Birinchi Sahifa (0.029 ms)", 180, 390, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("SELECT id, sana FROM buyurtmalar", 180, 450, { size: 14, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20 OFFSET 0;", 180, 475, { size: 14, fam: MONO, color: C.ink });

      srect(180, 500, 700, 130, { fill: '#f6ffed', stroke: C.green });
      text("Limit (cost=0.42..1.03 rows=20)", 200, 530, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("  -> Index Only Scan using b_sana_id on buyurtmalar", 200, 560, { size: 13, fam: MONO, color: C.ink });
      text("       Heap Fetches: 0 | actual rows=20.00 loops=1", 200, 590, { size: 13, fam: MONO, color: C.soft });
      text("Execution Time: 0.029 ms", 200, 620, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("• Indeksdan atigi 20 ta qator o'qildi.", 180, 660, { size: 16, weight: 700, color: C.green, fam: UI });
      text("• Xotiraga yuk deyarli nol, javob bir zumda qaytdi.", 180, 690, { size: 16, color: C.ink, fam: UI });

      pill("1-sahifa: 20 qator va 0.029 ms", 530, 780, C.green, kBox, 15);

      // O'ng: OFFSET 900000
      const kRight = P(t, 9.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.red, p: kRight });
        text("2. OFFSET 900000: 45 000-sahifa (36 ms)", 1040, 390, { size: 22, weight: 700, color: C.red, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("SELECT id, sana FROM buyurtmalar", 1040, 450, { size: 14, fam: MONO, color: C.ink });
        text("ORDER BY sana, id LIMIT 20 OFFSET 900000;", 1040, 475, { size: 14, weight: 700, fam: MONO, color: C.red });

        srect(1040, 500, 700, 130, { fill: '#fff2f0', stroke: C.red });
        text("Limit (cost=27371.22..27371.83 rows=20)", 1060, 530, { size: 14, weight: 700, fam: MONO, color: C.red });
        text("  -> Index Only Scan using b_sana_id on buyurtmalar", 1060, 560, { size: 13, fam: MONO, color: C.ink });
        text("       actual rows=900020.00 loops=1 (900k o'qildi!)", 1060, 590, { size: 13, weight: 700, fam: MONO, color: C.red });
        text("Execution Time: 36.260 ms (1200x sekinroq!)", 1060, 620, { size: 14, weight: 700, fam: MONO, color: C.red });

        text("• Ikkalasi ham 20 qator qaytardi, lekin ikkinchisida", 1040, 660, { size: 16, color: C.ink, fam: UI });
        text("  900 020 ta yozuv o'qilib, 900 000 tasi tashlandi!", 1040, 690, { size: 16, weight: 700, color: C.red, fam: UI });

        pill("900 020 qator o'qildi: 36.26 ms (1200 baravar sekin)", 1390, 780, C.red, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 16.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("Xulosa: OFFSET qiymati oshgani sari so'rov vaqti mutanosib ravishda o'sadi!", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Katta ma'lumotlar bazalarida bu server protsessori va xotirasini qattiq zo'riqtiradi.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. PG_KEYSET_ROW_CONSTRUCTOR (19.65 -> 36.96s)
  function sPgKeyset(t) {
    heading("2. KEYSET VA QATOR KONSTRUKTORI", "Oldingi sahifaning oxirgi qatoridan boshlab qidiruv", t, TM.scenes.pg_keyset_row_constructor);

    const kBox = P(t, 20.5, 0.8);
    withA(kBox, () => {
      // Chap: Oxirgi qatorni eslab qolish
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("1. Oldingi Sahifa Oxiri: (sana, id)", 180, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("900 000-o'rindagi oxirgi yozuv:", 180, 350, { size: 16, weight: 700, color: C.ink, fam: UI });

      srect(180, 375, 700, 140, { fill: '#e6f7ff', stroke: C.blue });
      text("   id   |        sana         ", 200, 410, { size: 14, weight: 700, fam: MONO, color: C.blue });
      sline(200, 425, 860, 425, { col: C.pencil, w: 1 });
      text(" 899998 | 2025-07-28 07:59:00", 200, 455, { size: 14, fam: MONO, color: C.ink });
      text(" 899999 | 2025-07-28 07:59:00", 200, 480, { size: 14, fam: MONO, color: C.ink });
      text(" 900000 | 2025-07-28 08:00:00 (OXIRGI QATOR)", 200, 505, { size: 14, weight: 700, fam: MONO, color: C.blue });

      text("Ilova eslab qoladigan kursor:", 180, 545, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("sana = '2025-07-28 08:00:00' va id = 900000", 180, 575, { size: 15, fam: MONO, color: C.green });

      text("Keyingi sahifa sharti:", 180, 615, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("WHERE (sana, id) > ('2025-07-28 08:00:00', 900000)", 180, 645, { size: 14, weight: 700, fam: MONO, color: C.blue });
      text("ORDER BY sana, id LIMIT 20;", 180, 675, { size: 14, fam: MONO, color: C.ink });

      pill("Kursor: Oxirgi qatordan keyingisini so'rash", 530, 755, C.blue, kBox, 15);
    });

    const kPlan = P(t, 28.5, 0.8);
    withA(kPlan, () => {
      // O'ng: Index Cond bilan tezkor natija
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kPlan });
      text("2. Index Cond va Atigi 0.020 ms!", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Index Only Scan using b_sana_id on buyurtmalar", 1060, 375, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("  Index Cond: (ROW(sana, id) > ROW('2025-07-28 08:00:00', 900000))", 1060, 410, { size: 13, fam: MONO, color: C.ink });
      text("  Heap Fetches: 0 | actual rows=20.00 loops=1", 1060, 440, { size: 14, fam: MONO, color: C.soft });
      text("Execution Time: 0.020 ms (1800x tezroq!)", 1060, 475, { size: 15, weight: 700, fam: MONO, color: C.green });

      text("Muhim xususiyat:", 1040, 530, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• 900001 va 900002 qatorlarining sanasi ham 08:00:00!", 1040, 565, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Lekin ularning id'si katta bo'lgani uchun tushib qolmaydi.", 1040, 595, { size: 16, color: C.green, fam: UI, weight: 700, wrap: 700 });
      text("• B-tree to'g'ridan-to'g'ri o'sha nuqtaga sakrab 20 qatorni oladi.", 1040, 625, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("45 000-sahifa ham birinchi sahifadek 0.02 ms da chiqadi", 1390, 755, C.green, kPlan, 15);
    });

    const kBot = P(t, 33.0, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Qator konstruktori ROW(sana, id) B-tree indeksining to'liq kuchini ishga soladi!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Hech qanday oldingi qatorlar hisoblanmaydi — murakkablik O(1) ga aylanadi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. PG_OR_YOZUVI_XATOSI (36.96 -> 55.24s)
  function sPgOrYozuvi(t) {
    heading("3. POSTGRESQL DA OR YOZUVI: 29 ms FILTER", "Teng mantiqiy ifoda nega indeksni to'xtatib qo'ydi?", t, TM.scenes.pg_or_yozuvi_xatosi);

    const kBox = P(t, 37.5, 0.8);
    withA(kBox, () => {
      // Chap: OR yozuvi Filter bo'ldi
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. OR Bilan Yozilganda: 29 ms Filter", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("WHERE sana > '2025-07-28 08:00:00'", 180, 345, { size: 13, fam: MONO, color: C.ink });
      text("   OR (sana = '2025-07-28 08:00:00' AND id > 900000)", 180, 370, { size: 13, fam: MONO, color: C.ink });
      text("ORDER BY sana, id LIMIT 20;", 180, 395, { size: 13, fam: MONO, color: C.ink });

      srect(180, 420, 700, 160, { fill: '#fff2f0', stroke: C.red });
      text("Index Only Scan using b_sana_id on buyurtmalar", 200, 455, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("  Filter: ((sana > ...) OR (sana = ... AND id > 900000))", 200, 485, { size: 12, fam: MONO, color: C.ink });
      text("  Rows Removed by Filter: 900000 (900k tashlandi!)", 200, 515, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("Execution Time: 29.192 ms (OFFSET darajasida sekin)", 200, 545, { size: 14, weight: 700, fam: MONO, color: C.red });

      text("Nega bunday bo'ldi?", 180, 605, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• PostgreSQL bu OR shartini Index Cond ga aylantira olmadi.", 180, 640, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Indeks boshidan o'qilib, 900 000 ta qator filtrda elandi.", 180, 670, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("PostgreSQL da OR yozuvi Index Cond emas, Filter bo'ladi", 530, 755, C.red, kBox, 15);
    });

    const kRow = P(t, 47.0, 0.8);
    withA(kRow, () => {
      // O'ng: Qator konstruktori afzalligi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRow });
      text("2. To'g'ri Sintaksis: (sana, id) > (?, ?)", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("WHERE (sana, id) > ('2025-07-28 08:00:00', 900000)", 1040, 355, { size: 14, weight: 700, fam: MONO, color: C.green });

      srect(1040, 390, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("Index Only Scan using b_sana_id", 1060, 425, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("  Index Cond: (ROW(sana, id) > ROW('...', 900000))", 1060, 455, { size: 13, fam: MONO, color: C.blue });
      text("  Rows Removed by Filter: 0 (Filtr umuman yo'q!)", 1060, 485, { size: 13, weight: 700, fam: MONO, color: C.green });
      text("Execution Time: 0.020 ms (1450 baravar tezroq!)", 1060, 515, { size: 14, weight: 700, fam: MONO, color: C.green });

      text("Postgres hujjati (9.25):", 1040, 580, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• Row and Array Comparisons qoidasi B-tree indekslariga mos.", 1040, 615, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Rejalashtiruvchi konstruktorni darhol indeks qidiruviga ulaydi.", 1040, 645, { size: 16, color: C.green, fam: UI, wrap: 700 });
      text("• Natija 29 ms dan 0.02 ms ga tushadi!", 1040, 675, { size: 16, weight: 700, color: C.blue, fam: UI, wrap: 700 });

      pill("Postgresda keyset uchun doim qator konstruktori yozing", 1390, 755, C.green, kRow, 15);
    });

    const kBot = P(t, 51.5, 0.8);
    withA(kBot, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kBot });
      text("Diqqat: Bir xil mantiqiy ma'noga ega ifodalar bazada turlicha bajarilishi mumkin!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Postgresda ROW(...) to'g'ri tanlov bo'lsa, MySQL da buning aksi (dialektlar qismida ko'ramiz).", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. PG_DRIFT_JONLI_SINOV (55.24 -> 74.85s)
  function sPgDrift(t) {
    heading("4. YANGI QATOR QO'SHILGANDA DRIFT SINOVI", "Jonli bazada OFFSET dublikati va Keyset barqarorligi", t, TM.scenes.pg_drift_jonli_sinov);

    const kBox = P(t, 56.0, 0.8);
    withA(kBox, () => {
      // Chap: OFFSET bilan dublikat
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. OFFSET Bilan Sahifa Surilishi (Drift)", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      srect(180, 340, 700, 160, { fill: '#fff2f0', stroke: C.red });
      text("1-sahifa (LIMIT 3): 1000000, 999999, 999998", 200, 375, { size: 14, fam: MONO, color: C.ink });
      text("-> Shu payt yangi buyurtma qo'shildi: INSERT (1000001, ...)", 200, 410, { size: 13, weight: 700, fam: MONO, color: C.red });
      text("2-sahifa (OFFSET 3): 999998, 999997, 999996", 200, 445, { size: 14, weight: 700, fam: MONO, color: C.red });
      text("999998 IKKALA SAHIFADA HAM CHIQDI (DUBLIKAT)!", 200, 475, { size: 14, weight: 700, fam: UI, color: C.red });

      text("Muammoning sababi:", 180, 530, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Yangi buyurtma ro'yxat boshiga tushdi.", 180, 565, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Natijada hamma qatorlar bitta o'ringa pastga surildi.", 180, 595, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• OFFSET 3 endi avvalgi 3-qatorni yana qayta o'qidi.", 180, 625, { size: 16, weight: 700, color: C.red, fam: UI, wrap: 700 });
      text("• Qator o'chirilganda esa bitta buyurtma tushib qolardi!", 180, 655, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("OFFSET o'rin raqamiga tayanadi: yangi qator surib yuboradi", 530, 755, C.red, kBox, 15);
    });

    const kKeyset = P(t, 64.0, 0.8);
    withA(kKeyset, () => {
      // O'ng: Keyset barqarorligi
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kKeyset });
      text("2. Keyset: Mutlaq Barqaror Natija", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      srect(1040, 340, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("WHERE (sana, id) < ('2025-08-20 11:32:00', 999998)", 1060, 375, { size: 13, fam: MONO, color: C.blue });
      text("ORDER BY sana DESC, id DESC LIMIT 3;", 1060, 405, { size: 13, fam: MONO, color: C.blue });
      text("Natija: 999997, 999996, 999995", 1060, 445, { size: 14, weight: 700, fam: MONO, color: C.green });
      text("HECH QANDAY DUBLIKAT YO'Q!", 1060, 475, { size: 14, weight: 700, fam: UI, color: C.green });

      text("Nega Keyset drift bo'lmaydi?", 1040, 530, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Keyset '3-o'rin' emas, aynan 999998 dan keyingisini qidiradi.", 1040, 565, { size: 16, color: C.ink, fam: UI, wrap: 700 });
      text("• Yuqoriga 100 ta yangi qator qo'shilsa ham, kursor to'g'ri boradi.", 1040, 595, { size: 16, color: C.green, fam: UI, wrap: 700 });
      text("• Real-time tizimlar va ijtimoiy lentalar uchun bu juda muhim.", 1040, 625, { size: 16, color: C.soft, fam: UI, wrap: 700 });

      pill("Keyset qiymat bo'yicha ishlaydi: 100% barqaror", 1390, 755, C.green, kKeyset, 15);
    });

    const kFinal = P(t, 68.5, 0.8);
    withA(kFinal, () => {
      card(280, 835, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFinal });
      text("Xulosa: Keyset sahifalash ham 1800x tezroq, ham ma'lumot surilishidan to'liq himoyalangan!", 960, 885, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Katta va tez o'zgaruvchi jadvallarda keyset pagination eng professional standartdir.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  window.renderScene = function (t) {
    bg();
    if (t < TM.scenes.pg_offset_0_va_900k.e) {
      sPgOffset0va900k(t);
    } else if (t < TM.scenes.pg_keyset_row_constructor.e) {
      sPgKeyset(t);
    } else if (t < TM.scenes.pg_or_yozuvi_xatosi.e) {
      sPgOrYozuvi(t);
    } else {
      sPgDrift(t);
    }
  };

  window.renderFrame = window.renderScene;
  window.render = window.renderScene;
  window.renderPoster = function () { window.renderFrame(10.0); };
})();
