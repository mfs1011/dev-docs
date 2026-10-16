// SQL 21-bob 1-qism: "Tushuncha" — Ommaviy Yuklash Arxitekturasi va Strategiyalari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("21-bob. Ommaviy yuklash", 960, 180, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Nega bittalab INSERT sekin?", 960, 280, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Har bir qatordagi ulanish, tarmoq, tahlil va fsync xarajatlari", 960, 375, { size: 34, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 410, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'bittalab'), 0.8);
    withA(kBadges, () => {
      pill("1. ULANISH VA TARMOQ", 340, 520, C.red, kBadges, 20);
      pill("2. SQL TAHLIL VA REJA", 760, 520, C.purple, kBadges, 20);
      pill("3. INDEKSLAR YANGILANISHI", 1200, 520, C.blue, kBadges, 20);
      pill("4. FSYNC & WAL COMMIT", 1620, 520, C.red, kBadges, 20);
    });

    const kDesc = P(t, W('L1', 'diskka'), 0.8);
    withA(kDesc, () => {
      card(180, 600, 1560, 320, { fill: C.card, col: C.red, p: kDesc });
      text("Bittalab INSERT yuborilganda vaqt qayerga sarflanadi? (MySQL tahlili):", 960, 660, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1480 });

      text("• Ulanish ochish va so'rovni serverga yetkazish: umumiy vaqtning ~50% qismi", 240, 720, { size: 22, color: C.soft, wrap: 1400 });
      text("• SQL so'rov sintaksisini tahlil qilish va tekshirish: ~20%", 240, 765, { size: 22, color: C.soft, wrap: 1400 });
      text("• Qatorning o'zini diskka yozish: atigi ~10%!", 240, 810, { size: 22, weight: 700, color: C.red, wrap: 1400 });
      text("• Indekslarni har qatorda qayta hisoblash va har safar commit qilish: qolgan ~20%", 240, 855, { size: 22, color: C.soft, wrap: 1400 });
    });
  }

  // 2. INSERT OVERHEAD & STRATEGIES
  function sInsertOverhead(t) {
    heading("Strategiya: Kichik Amallarni Birlashtirish", t, TM.scenes.insert_overhead.s);

    const k1 = P(t, W('L2', 'May'), 0.5);
    withA(k1, () => {
      // Comparison: Bad vs Better vs Best
      card(140, 220, 500, 740, { fill: C.card, col: C.red, p: k1 });
      pill("YOMON: Bittalab INSERT", 390, 270, C.red, k1, 19);

      text("Autocommit bilan har qatorda:", 170, 335, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("INSERT INTO t VALUES (1);", 170, 380, { size: 18, color: C.red, fam: MONO });
      text("INSERT INTO t VALUES (2);", 170, 415, { size: 18, color: C.red, fam: MONO });
      text("INSERT INTO t VALUES (3);", 170, 450, { size: 18, color: C.red, fam: MONO });

      text("Natija:", 170, 510, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• Har qatorda alohida commit", 170, 545, { size: 18, color: C.soft, fam: UI });
      text("• Har safar diskka fsync", 170, 580, { size: 18, color: C.soft, fam: UI });
      text("• 10,000 qator = 10,000 fsync!", 170, 615, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Juda sekin, diskni qizitadi", 170, 650, { size: 18, color: C.soft, fam: UI });
      text("• Xato bo'lsa yarmi qolib ketadi", 170, 685, { size: 18, color: C.red, fam: UI });
    });

    const k2 = P(t, W('L2', 'avtokommitni'), 0.5);
    withA(k2, () => {
      card(710, 220, 500, 740, { fill: C.card, col: C.blue, p: k2 });
      pill("YAXSHI: BEGIN ... COMMIT", 960, 270, C.blue, k2, 19);

      text("Bitta tranzaksiya ichida:", 740, 335, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("BEGIN;", 740, 380, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("INSERT INTO t VALUES (1);", 740, 415, { size: 18, color: C.ink, fam: MONO });
      text("INSERT INTO t VALUES (2);", 740, 450, { size: 18, color: C.ink, fam: MONO });
      text("COMMIT;", 740, 485, { size: 18, weight: 700, color: C.blue, fam: MONO });

      text("Natija:", 740, 545, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• Faqat oxirida bitta commit", 740, 580, { size: 18, color: C.green, fam: UI });
      text("• Fsync faqat 1 marta chaqiriladi", 740, 615, { size: 18, color: C.green, fam: UI });
      text("• Tezlik 10 barobargacha oshadi", 740, 650, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Atomarlik: xatoda orqaga qaytadi", 740, 685, { size: 18, color: C.ink, fam: UI });
      text("• Yarim yuklanish xavfi yo'q", 740, 720, { size: 18, color: C.soft, fam: UI });
    });

    const k3 = P(t, W('L2', 'tranzaksiyaga'), 0.5);
    withA(k3, () => {
      card(1280, 220, 500, 740, { fill: C.card, col: C.green, p: k3 });
      pill("ENG TEZ: COPY / LOAD DATA", 1530, 270, C.green, k3, 19);

      text("To'g'ridan-to'g'ri oqim:", 1310, 335, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("COPY jadval FROM 'fayl.csv'", 1310, 380, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("WITH (FORMAT csv, HEADER);", 1310, 415, { size: 18, weight: 700, color: C.green, fam: MONO });

      text("Natija:", 1310, 485, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• SQL tahlil (parsing) faqat 1 marta", 1310, 520, { size: 18, color: C.green, fam: UI });
      text("• Qatorlar to'g'ri sahifalarga yoziladi", 1310, 555, { size: 18, color: C.green, fam: UI });
      text("• INSERT dan 10-20 baravar tezroq!", 1310, 590, { size: 18, weight: 700, color: C.green, fam: UI });
      text("• Katta CSV va matn fayllari uchun", 1310, 625, { size: 18, color: C.ink, fam: UI });
      text("• Rasmiy tavsiya etilgan standart", 1310, 660, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 3. COPY MECHANISM
  function sCopyMechanism(t) {
    heading("PostgreSQL: COPY Buyrug'ining Ishlash Tizimi", t, TM.scenes.copy_mechanism.s);

    const k1 = P(t, W('L3', 'Postgres'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.blue, p: k1 });
      pill("COPY — Ommaviy Yuklash Standarti", 960, 270, C.blue, k1, 22);

      // Workflow Diagram
      // Box 1: File
      card(180, 340, 380, 220, { fill: '#f6f9fc', col: C.blue, p: k1 });
      text("Manba Fayl", 370, 390, { size: 22, weight: 700, align: 'center', color: C.blue, fam: UI });
      text("• CSV / Text / Binary", 210, 440, { size: 19, color: C.ink, fam: MONO });
      text("• Serverdagi qattiq disk", 210, 475, { size: 19, color: C.soft, fam: UI });
      text("• Millionlab qatorlar", 210, 510, { size: 19, color: C.soft, fam: UI });

      // Arrow 1
      arrow(580, 450, 740, 450, { col: C.blue, p: k1 });
      text("Tezkor oqim", 660, 430, { size: 17, align: 'center', color: C.blue, fam: UI });

      // Box 2: COPY Engine
      card(760, 340, 400, 220, { fill: '#f0fdf4', col: C.green, p: k1 });
      text("PostgreSQL COPY Engine", 960, 390, { size: 22, weight: 700, align: 'center', color: C.green, fam: UI });
      text("• SQL Rejalashtiruvchi aylanib o'tiladi", 780, 440, { size: 18, color: C.ink, fam: UI });
      text("• To'g'ridan-to'g'ri qator formatlash", 780, 475, { size: 18, color: C.ink, fam: UI });
      text("• Bloklar birdaniga to'ldiriladi", 780, 510, { size: 18, color: C.green, fam: UI });

      // Arrow 2
      arrow(1180, 450, 1340, 450, { col: C.green, p: k1 });
      text("Minimal WAL", 1260, 430, { size: 17, align: 'center', color: C.green, fam: UI });

      // Box 3: Table / Storage
      card(1360, 340, 380, 220, { fill: '#faf5ff', col: C.purple, p: k1 });
      text("Jadval (Disk Sahifalari)", 1550, 390, { size: 22, weight: 700, align: 'center', color: C.purple, fam: UI });
      text("• Heaptuple bloklar", 1390, 440, { size: 19, color: C.ink, fam: MONO });
      text("• Yuqori tezlikda saqlash", 1390, 475, { size: 19, color: C.soft, fam: UI });
      text("• Ketma-ket yozish", 1390, 510, { size: 19, color: C.purple, fam: UI });

      // Details below
      sline(180, 600, 1740, 600, { col: C.rule, p: k1 });

      text("PostgreSQL rasmiy hujjatidagi muhim xulosalar:", 180, 645, { size: 24, weight: 700, color: C.ink, fam: UI });

      text("1. COPY bitta tranzaksiya ichidagi INSERT lardan ham, PREPARE qilingan so'rovlardan ham deyarli har doim tezroq.", 200, 695, { size: 20, color: C.soft, fam: UI });
      text("2. Ikki yo'nalishda ishlaydi: COPY FROM (fayldan jadvalga) va COPY TO (jadval yoki so'rovdan faylga).", 200, 740, { size: 20, color: C.soft, fam: UI });
      text("3. FREEZE parametri: jadval shu tranzaksiyada yaratilgan bo'lsa, qatorlarni 'muzlatilgan' holda yozib, VACUUM yukini tejaydi.", 200, 785, { size: 20, color: C.purple, fam: UI });
      text("4. Diqqat: COPY SQL standarti emas, PostgreSQL ning maxsus ichki optimallashtirilgan buyrug'idir.", 200, 830, { size: 20, color: C.red, fam: UI });
    });
  }

  // 4. SERVER VS CLIENT
  function sServerVsClient(t) {
    heading("Fayl Qayerda? Server Fayli (COPY) vs Mijoz Fayli (\\copy)", t, TM.scenes.server_vs_client.s);

    const k1 = P(t, W('L4', 'Kopi'), 0.5);
    withA(k1, () => {
      // Left: Server File
      card(120, 220, 820, 750, { fill: C.card, col: C.red, p: k1 });
      pill("Server Fayli: COPY ... FROM 'fayl'", 530, 270, C.red, k1, 20);

      text("Faylni KIM o'qiydi?", 160, 335, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Faylni SERVER kompyuteri o'qiydi yoki yozadi.", 160, 375, { size: 20, color: C.soft, fam: UI });
      text("• Fayl serverning mahalliy papkasida bo'lishi shart.", 160, 410, { size: 20, color: C.soft, fam: UI });

      text("Xavfsizlik va Huquqlar:", 160, 470, { size: 22, weight: 700, color: C.red, fam: UI });
      text("• Bu buyruq server huquqi bilan istalgan faylni ochishi mumkin.", 160, 510, { size: 19, color: C.soft, fam: UI });
      text("• Shuning uchun faqat superuser'ga ruxsat beriladi.", 160, 545, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• Yoki pg_read_server_files maxsus roli berilgan bo'lishi shart.", 160, 580, { size: 19, color: C.red, fam: UI });

      card(160, 620, 740, 160, { fill: '#fff2f2', col: C.red, p: k1 });
      text("SET ROLE talaba;", 180, 660, { size: 18, color: C.soft, fam: MONO });
      text("COPY mahsulotlar FROM '/tmp/fayl.csv' ...;", 180, 695, { size: 18, color: C.red, fam: MONO });
      text("ERROR: permission denied to COPY from a file", 180, 740, { size: 18, weight: 700, color: C.red, fam: MONO });

      text("Oddiy foydalanuvchilar server fayliga murojaat qila olmaydi!", 160, 820, { size: 19, weight: 700, color: C.ink, fam: UI });
    });

    const k2 = P(t, W('L4', 'pi-es-kyu-el'), 0.5);
    withA(k2, () => {
      // Right: Client File
      card(980, 220, 820, 750, { fill: C.card, col: C.green, p: k2 });
      pill("Mijoz Fayli: \\copy (psql buyrug'i)", 1390, 270, C.green, k2, 20);

      text("Faylni KIM o'qiydi?", 1020, 335, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Faylni MIJOZ (dasturchi kompyuteri) o'qiydi.", 1020, 375, { size: 20, color: C.soft, fam: UI });
      text("• Fayl dasturchining o'z noutbukida yoki server tashqarisida.", 1020, 410, { size: 20, color: C.soft, fam: UI });

      text("Ishlash Mexanizmi:", 1020, 470, { size: 22, weight: 700, color: C.green, fam: UI });
      text("• psql dasturi faylni o'qib, tarmoq orqali uzatadi.", 1020, 510, { size: 19, color: C.soft, fam: UI });
      text("• Serverga COPY FROM STDIN protokolini yuboradi.", 1020, 545, { size: 19, color: C.green, fam: UI });
      text("• Maxsus superuser huquqlari TALAB QILINMAYDI!", 1020, 580, { size: 19, weight: 700, color: C.green, fam: UI });

      card(1020, 620, 740, 160, { fill: '#f0fdf4', col: C.green, p: k2 });
      text("psql qollanma", 1040, 660, { size: 18, color: C.soft, fam: MONO });
      text("\\copy mahsulotlar FROM 'noutbukdagi_fayl.csv' WITH (FORMAT csv);", 1040, 700, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("COPY 100000 -- Muvaffaqiyatli yuklandi!", 1040, 745, { size: 18, weight: 700, color: C.blue, fam: MONO });

      text("Tavsiya: Dastur va hisobotlar uchun har doim \\copy / STDIN ishlating!", 1020, 820, { size: 19, weight: 700, color: C.ink, fam: UI });
    });
  }

  // 5. INDEXES AND TUNING
  function sIndexesAndTuning(t) {
    heading("Maksimal Tezlik: Ketma-ketlik va Sozlamalar", t, TM.scenes.indexes_and_tuning.s);

    const k1 = P(t, W('L5', 'Maksimal'), 0.5);
    withA(k1, () => {
      card(120, 220, 1680, 750, { fill: C.card, col: C.purple, p: k1 });
      pill("Millionlab qatorlarni yuklash qoidalari", 960, 270, C.purple, k1, 22);

      // 4 Step Cards
      card(160, 330, 360, 360, { fill: '#f6f9fc', col: C.blue, p: k1 });
      pill("1-QADAM", 340, 370, C.blue, k1, 18);
      text("Bo'sh Jadval", 340, 420, { size: 22, weight: 700, align: 'center', color: C.ink, fam: UI });
      text("• Jadvalni avval bo'sh yarating", 180, 470, { size: 18, color: C.soft, fam: UI });
      text("• Indekslarni hali QO'YMANG", 180, 510, { size: 18, weight: 700, color: C.red, fam: UI });
      text("• Tashqi kalitlarni qo'ymang", 180, 550, { size: 18, color: C.soft, fam: UI });
      text("• Boshlang'ich struktura tayyor", 180, 590, { size: 18, color: C.soft, fam: UI });

      card(550, 330, 360, 360, { fill: '#f0fdf4', col: C.green, p: k1 });
      pill("2-QADAM", 730, 370, C.green, k1, 18);
      text("Xotirani Sozlash", 730, 420, { size: 22, weight: 700, align: 'center', color: C.ink, fam: UI });
      text("• maintenance_work_mem ni", 570, 470, { size: 18, color: C.soft, fam: UI });
      text("  vaqtincha oshiring (1GB+)", 570, 505, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("• max_wal_size ni oshiring", 570, 550, { size: 18, color: C.soft, fam: UI });
      text("• Ortiqcha checkpoint larni tejang", 570, 590, { size: 18, color: C.soft, fam: UI });

      card(940, 330, 360, 360, { fill: '#faf5ff', col: C.purple, p: k1 });
      pill("3-QADAM", 1120, 370, C.purple, k1, 18);
      text("Ommaviy COPY", 1120, 420, { size: 22, weight: 700, align: 'center', color: C.ink, fam: UI });
      text("• COPY bilan ma'lumotni to'kib oling", 960, 470, { size: 18, color: C.soft, fam: UI });
      text("• Har qatorda indeks yangilanmaydi", 960, 510, { size: 18, weight: 700, color: C.purple, fam: UI });
      text("• Tashqi kalit navbati to'lmaydi", 960, 550, { size: 18, color: C.soft, fam: UI });
      text("• Eng maksimal yozish tezligi", 960, 590, { size: 18, color: C.green, fam: UI });

      card(1330, 330, 360, 360, { fill: '#fff7ed', col: C.hl, p: k1 });
      pill("4-QADAM", 1510, 370, C.hl, k1, 18);
      text("Indeks va ANALYZE", 1510, 420, { size: 22, weight: 700, align: 'center', color: C.ink, fam: UI });
      text("• CREATE INDEX ni endi bajaring", 1350, 470, { size: 18, weight: 700, color: C.blue, fam: UI });
      text("  (b-tree bir yo'la tez quriladi!)", 1350, 505, { size: 18, color: C.soft, fam: UI });
      text("• Tashqi kalitlarni qo'shing", 1350, 550, { size: 18, color: C.soft, fam: UI });
      text("• ANALYZE jadval; — SHART!", 1350, 590, { size: 18, weight: 700, color: C.red, fam: MONO });

      sline(160, 720, 1760, 720, { col: C.rule, p: k1 });

      text("Nega oxirida ANALYZE qilish shart?", 160, 765, { size: 22, weight: 700, color: C.red, fam: UI });
      text("Baza 1 million yangi qator haqida statistikaga ega bo'lmasa, SQL rejalashtiruvchi uni bo'sh deb o'ylab,", 160, 805, { size: 20, color: C.soft, fam: UI });
      text("kelajakdagi SELECT so'rovlarida eng samarasiz qidiruv rejalarini (Seq Scan) tanlab qo'yadi!", 160, 845, { size: 20, weight: 700, color: C.red, fam: UI });
    });
  }

  // 6. ERROR HANDLING
  function sErrorHandling(t) {
    heading("PostgreSQL 18: Xatolarni Boshqarish Parametrlari", t, TM.scenes.error_handling.s);

    const k1 = P(t, W('L6', 'Postgres'), 0.5);
    withA(k1, () => {
      card(140, 220, 500, 740, { fill: C.card, col: C.red, p: k1 });
      pill("1. Sukut Bo'yicha Holat", 390, 270, C.red, k1, 19);

      text("Birinchi xatoda to'xtaydi:", 170, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Faylda 1 ta noto'g'ri qiymat", 170, 380, { size: 19, color: C.soft, fam: UI });
      text("  bo'lsa ham butun COPY xato beradi.", 170, 410, { size: 19, color: C.soft, fam: UI });

      card(170, 450, 440, 140, { fill: '#fff2f2', col: C.red, p: k1 });
      text("ERROR: invalid input syntax", 190, 490, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("for type numeric: \"abc\"", 190, 520, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("CONTEXT: line 4, col narx", 190, 555, { size: 17, color: C.soft, fam: MONO });

      text("• Oldingi to'g'ri qatorlar ham", 170, 630, { size: 19, color: C.soft, fam: UI });
      text("  tranzaksiya bilan bekor bo'ladi.", 170, 660, { size: 19, color: C.soft, fam: UI });
      text("• Jadval butunlay bo'sh qoladi.", 170, 700, { size: 19, weight: 700, color: C.red, fam: UI });
    });

    const k2 = P(t, W('L6', 'e’tiborsiz'), 0.5);
    withA(k2, () => {
      card(710, 220, 500, 740, { fill: C.card, col: C.blue, p: k2 });
      pill("2. ON_ERROR ignore", 960, 270, C.blue, k2, 19);

      text("PostgreSQL 17+ Imkoniyati:", 740, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("COPY ... WITH (ON_ERROR ignore,", 740, 380, { size: 18, weight: 700, color: C.blue, fam: MONO });
      text("  LOG_VERBOSITY verbose);", 740, 415, { size: 18, weight: 700, color: C.blue, fam: MONO });

      card(740, 450, 440, 140, { fill: '#f6f9fc', col: C.blue, p: k2 });
      text("NOTICE: skipping row line 4", 760, 490, { size: 17, color: C.soft, fam: MONO });
      text("NOTICE: skipping row line 6", 760, 520, { size: 17, color: C.soft, fam: MONO });
      text("COPY 3 (To'g'ri qatorlar)", 760, 555, { size: 17, weight: 700, color: C.green, fam: MONO });

      text("• Xato qatorlar tashlanadi", 740, 630, { size: 19, color: C.soft, fam: UI });
      text("• To'g'ri qatorlar yuklanadi", 740, 665, { size: 19, weight: 700, color: C.green, fam: UI });
      text("• verbose har bir tashlangan qator", 740, 705, { size: 19, color: C.soft, fam: UI });
      text("  haqida xabarnoma beradi.", 740, 735, { size: 19, color: C.soft, fam: UI });
    });

    const k3 = P(t, W('L6', 'chegarasini'), 0.5);
    withA(k3, () => {
      card(1280, 220, 500, 740, { fill: C.card, col: C.green, p: k3 });
      pill("3. REJECT_LIMIT (PG 18)", 1530, 270, C.green, k3, 19);

      text("PostgreSQL 18 Yangiligi:", 1310, 335, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("COPY ... WITH (ON_ERROR ignore,", 1310, 380, { size: 18, weight: 700, color: C.green, fam: MONO });
      text("  REJECT_LIMIT 1);", 1310, 415, { size: 18, weight: 700, color: C.green, fam: MONO });

      card(1310, 450, 440, 140, { fill: '#f0fdf4', col: C.green, p: k3 });
      text("ERROR: skipped more than", 1330, 490, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("REJECT_LIMIT (1) rows", 1330, 520, { size: 17, weight: 700, color: C.red, fam: MONO });
      text("Fayl tekshiruvga qaytadi!", 1330, 555, { size: 17, weight: 700, color: C.ink, fam: UI });

      text("• Chegarasiz ignore xavfli:", 1310, 630, { size: 19, weight: 700, color: C.red, fam: UI });
      text("  Butun fayl buzilgan bo'lsa ham", 1310, 665, { size: 18, color: C.soft, fam: UI });
      text("  yuklash 'yashil' o'tib ketishi mumkin.", 1310, 695, { size: 18, color: C.soft, fam: UI });
      text("• REJECT_LIMIT fayl sifatini", 1310, 735, { size: 19, weight: 700, color: C.green, fam: UI });
      text("  aniq nazorat ostida ushlab turadi.", 1310, 765, { size: 19, color: C.green, fam: UI });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.insert_overhead.s) sIntro(t);
    else if (t < S.copy_mechanism.s) sInsertOverhead(t);
    else if (t < S.server_vs_client.s) sCopyMechanism(t);
    else if (t < S.indexes_and_tuning.s) sServerVsClient(t);
    else if (t < S.error_handling.s) sIndexesAndTuning(t);
    else sErrorHandling(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    const t = TM.scenes.copy_mechanism.s + 3.0;
    frame(t);
  };
})();
