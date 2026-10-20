// SQL 38-bob 3-qism: "Dialektlar" — Normalizatsiya va tizimlararo xususiyatlar
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

  // 1. DIALEKTLAR KIRISH (0 -> 15.5s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("38-bob. Normalizatsiya va Tuzilma", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Tizimlararo Muvofiqlik va Normalizatsiya", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL, MySQL va SQLite: Yagona relyatsion mantiq va o'ziga xos farqlar", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 345, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // 3 ta tizim kartalari
      const systems = [
        {
          name: "PostgreSQL",
          sub: "Materialized View va to'liq quvvat",
          col: C.blue,
          points: [
            "Tashqi kalitlar doimo sukut bo'yicha faol",
            "REFRESH MATERIALIZED VIEW imkoniyati",
            "Massiv va JSONB bor, lekin jadval tavsiya qilinadi",
            "Murakkab JOIN larda yuqori optimizator"
          ]
        },
        {
          name: "MySQL (InnoDB)",
          sub: "Normalizatsiya rasmiy standarti",
          col: C.orange,
          points: [
            "Qo'llanmada 3NF qat'iy tavsiya etiladi",
            "Materialized view mavjud emas (oddiy jadval)",
            "Yangilash trigger yoki EVENT orqali bo'ladi",
            "JOIN ustunlari bir xil tipda bo'lishi shart"
          ]
        },
        {
          name: "SQLite",
          sub: "PRAGMA bilan to'liq 3NF kafolati",
          col: C.purple,
          points: [
            "Tashqi kalit uchun PRAGMA foreign_keys = ON shart",
            "Materialized view yo'q (jadval + trigger)",
            "Yengil va ixcham normallashgan tuzilma",
            "Muntazam ulanishlarda cheklovni yoqish zarur"
          ]
        }
      ];

      systems.forEach((sys, i) => {
        const bx = 120 + i * 570;
        card(bx, 400, 540, 580, { fill: C.card, col: sys.col, p: kBox });
        pill(sys.name, bx + 270, 450, sys.col, kBox, 22);
        text(sys.sub, bx + 30, 515, { size: 20, weight: 700, color: sys.col, fam: UI });

        sys.points.forEach((pt, j) => {
          const py = 575 + j * 75;
          srect(bx + 30, py - 10, 16, 16, { col: sys.col, w: 2.5, p: kBox });
          text(pt, bx + 60, py, { size: 19, color: C.ink, fam: UI, maxW: 450 });
        });
      });
    });
  }

  // 2. MYSQL VA MATERIALIZED VIEW (15.5 -> 32.3s)
  function sMysql(t) {
    heading("MySQL: Yig'ma Jadvallar va Cheklovlar", t, TM.scenes.mysql_va_materialized_view.s);

    const kMain = P(t, TM.scenes.mysql_va_materialized_view.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: MySQL rasmiy tavsiyasi
      card(120, 200, 810, 480, { fill: C.card, col: C.orange, p: kMain });
      pill("MySQL Qo'llanmasi (Optimizing Data Size)", 525, 250, C.orange, kMain, 20);
      text("Rasmiy Tavsiya: 3NF ga Qat'iy Amal Qiling!", 160, 315, { size: 23, weight: 700, color: C.orange, fam: UI });

      text("• Barcha ma'lumotni takrorsiz saqlang (3NF).", 160, 375, { size: 20, color: C.ink, fam: UI });
      text("• Ism va manzil kabi uzun matnlarni har safar takrorlamang.", 160, 420, { size: 20, color: C.ink, fam: UI });
      text("• Ularga yagona sonli ID bering va JOIN orqali bog'lang.", 160, 465, { size: 20, color: C.green, fam: UI });
      text("• JOIN ustunlari bir xil tipda (INTEGER) va bir xil", 160, 510, { size: 20, color: C.ink, fam: UI });
      text("  collation'da bo'lishi tezlik uchun shart.", 160, 545, { size: 20, color: C.ink, fam: UI });
      text("• Har bir ustunni iloji boricha NOT NULL qilib e'lon qiling.", 160, 595, { size: 20, weight: 600, color: C.soft, fam: UI });

      // O'ng: Materialized view yo'qligi
      card(990, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("Materialized View Cheklovi", 1395, 250, C.red, kMain, 20);
      text("Yig'ma Jadvallarni Qo'lda Boshqarish:", 1030, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("MySQL da MATERIALIZED VIEW mavjud emas!", 1030, 375, { size: 21, weight: 700, color: C.red, fam: UI });
      text("Hisobotlar uchun denormalizatsiya qilingan jadvallar oddiy", 1030, 420, { size: 19, color: C.ink, fam: UI });
      text("jadval sifatida saqlanadi:", 1030, 455, { size: 19, color: C.ink, fam: UI });

      card(1020, 495, 750, 145, { fill: '#fff8f6', col: C.orange, p: kMain });
      text("Yangilash usullari:", 1040, 525, { size: 18, weight: 700, color: C.orange, fam: UI });
      text("1. Triggerlar (AFTER INSERT ON buyurtma_qatorlari)", 1040, 565, { size: 18, fam: MONO, color: C.ink });
      text("2. Rejalashtirilgan hodisalar (CREATE EVENT ... ON SCHEDULE)", 1040, 605, { size: 18, fam: MONO, color: C.ink });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l4', 'yangilanadi'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("MySQL Uchun Muhim Xulosa:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. MySQL relyatsion model va normalizatsiyani eng ko'p targ'ib qiluvchi dvigatellardan biri.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Yig'ma jadvallar qilganda, ularning asl jadvallarga mosligini ilova yoki trigger orqali nazorat qiling.", 160, 895, { size: 21, weight: 600, color: C.orange, fam: UI });
        text("3. Tahliliy BI so'rovlari bo'lmasa, doimo toza 3NF jadvallarida qoling.", 160, 945, { size: 20, color: C.green, fam: UI });
      });
    });
  }

  // 3. SQLITE VA PRAGMA SHARTI (32.3 -> 47.1s)
  function sSqlite(t) {
    heading("SQLite: PRAGMA va Normallashgan Yaxlitlik", t, TM.scenes.sqlite_va_pragma_sharti.s);

    const kMain = P(t, TM.scenes.sqlite_va_pragma_sharti.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: PRAGMA shartligi
      card(120, 200, 810, 480, { fill: C.card, col: C.purple, p: kMain });
      pill("SQLite Xavfsizlik Qoidasi", 525, 250, C.purple, kMain, 20);
      text("Tashqi Kalitlar Sukut Bo'yicha O'chiq!", 160, 315, { size: 24, weight: 700, color: C.purple, fam: UI });

      text("• Tarixiy moslik sababli SQLite da FK avtomatik tekshirilmaydi.", 160, 380, { size: 20, color: C.ink, fam: UI });
      text("• Agar PRAGMA yoqilmasa, hatto 4 ta normal jadval qursangiz ham,", 160, 430, { size: 20, color: C.ink, fam: UI });
      text("  baza mavjud bo'lmagan mijoz_id ga buyurtma yozishga yo'l qo'yadi!", 160, 470, { size: 20, weight: 700, color: C.red, fam: UI });

      card(160, 520, 730, 85, { fill: '#f5f3ff', col: C.purple, p: kMain });
      text("PRAGMA foreign_keys = ON; -- Har ulanishda shart!", 180, 560, { size: 22, weight: 700, fam: MONO, color: C.purple });

      text("• Shu buyruq berilgandagina relyatsion yaxlitlik kafolatlanadi.", 160, 640, { size: 19, color: C.green, fam: UI });

      // O'ng: SQLite da yig'ma jadval
      card(990, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("SQLite Yig'ma Jadvallari", 1395, 250, C.blue, kMain, 20);
      text("Triggerlar Bilan Yig'ma Jadvalni Yangilash:", 1030, 315, { size: 23, weight: 700, color: C.blue, fam: UI });

      text("CREATE TRIGGER trg_savdo_yangila", 1030, 375, { size: 19, weight: 700, fam: MONO, color: C.ink });
      text("AFTER INSERT ON buyurtma_qatorlari", 1030, 410, { size: 19, fam: MONO, color: C.ink });
      text("BEGIN", 1030, 445, { size: 19, fam: MONO, color: C.ink });
      text("    INSERT INTO kunlik_savdo VALUES (new.sana, 1, new.narx * new.soni)", 1030, 480, { size: 17, weight: 600, fam: MONO, color: C.blue });
      text("    ON CONFLICT(sana) DO UPDATE SET", 1030, 515, { size: 17, fam: MONO, color: C.ink });
      text("    summa = summa + (new.narx * new.soni);", 1030, 550, { size: 17, fam: MONO, color: C.ink });
      text("END;", 1030, 585, { size: 19, fam: MONO, color: C.ink });

      pill("UPSERT trigger yordamida yig'ma jadval yangilanadi", 1395, 640, C.green, kMain, 18);

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l6', 'shartdir'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.purple, p: kFoot });
        text("SQLite Loyihalash Xulosasi:", 160, 785, { size: 26, weight: 700, color: C.purple, fam: UI });
        text("1. Mobil va desktop ilovalarda SQLite ochilishi bilanoq PRAGMA foreign_keys = ON berilishi shart.", 160, 845, { size: 21, weight: 600, color: C.red, fam: UI });
        text("2. Normalizatsiya qoidalari SQLite da ham PostgreSQL dagi kabi to'liq va mukammal ishlaydi.", 160, 895, { size: 21, color: C.ink, fam: UI });
        text("3. Yig'ma jadvallar zarur bo'lsa, oddiy triggerlar orqali sinxronlashtirish eng to'g'ri yo'ldir.", 160, 945, { size: 20, color: C.green, fam: UI });
      });
    });
  }

  // 4. QIYOSIY MATRITSA (47.1 -> 63.4s)
  function sMatritsa(t) {
    heading("Uch Dialektning Qiyosiy Matritsasi", t, TM.scenes.qiyosiy_matritsa.s);

    const kMain = P(t, TM.scenes.qiyosiy_matritsa.s + 0.3, 0.8);
    withA(kMain, () => {
      card(120, 200, 1680, 780, { fill: C.card, col: C.blue, p: kMain });
      pill("Tuzilma va Normalizatsiya Matritsasi", 960, 250, C.blue, kMain, 22);

      const startY = 320;
      card(160, startY, 1600, 65, { fill: '#f1f5f9', col: C.blue, p: kMain });
      text("Xususiyat", 200, startY + 32, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("PostgreSQL", 660, startY + 32, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("MySQL (InnoDB)", 1050, startY + 32, { size: 22, weight: 700, color: C.orange, fam: UI });
      text("SQLite", 1460, startY + 32, { size: 22, weight: 700, color: C.purple, fam: UI });

      const rows = [
        {
          feature: "Tashqi kalit bilan yaxlitlik",
          pg: "Doim faol (sukut bo'yicha)",
          my: "InnoDB'da doim faol",
          sq: "PRAGMA foreign_keys = ON shart"
        },
        {
          feature: "Yig'ma ma'lumot (denormalizatsiya)",
          pg: "MATERIALIZED VIEW / jadval",
          my: "Jadval + Trigger / EVENT",
          sq: "Jadval + Trigger"
        },
        {
          feature: "Massiv va JSON o'rniga",
          pg: "Alohida jadval (tavsiya)",
          my: "Alohida jadval",
          sq: "Alohida jadval"
        },
        {
          feature: "JOIN kalitlari mosligi",
          pg: "Mos tiplar bo'lishi shart",
          my: "Tip va collation bir xil bo'lishi shart",
          sq: "Mos tiplar tavsiya qilinadi"
        },
        {
          feature: "NULL ustunlar tavsiyasi",
          pg: "Iloji boricha NOT NULL",
          my: "NOT NULL (indeks yaxshiroq)",
          sq: "NOT NULL tavsiya"
        },
        {
          feature: "3NF arxitektura afzalligi",
          pg: "Mutlaq ma'lumot sofligi",
          my: "Rasmiy qo'llanma tavsiyasi",
          sq: "Ortiqcha hajmdan tejash"
        }
      ];

      rows.forEach((r, i) => {
        const ry = startY + 75 + i * 62;
        if (i % 2 === 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(240,245,255,0.45)';
          ctx.fillRect(160, ry - 15, 1600, 58);
          ctx.restore();
        }
        text(r.feature, 200, ry + 15, { size: 20, weight: 600, color: C.ink, fam: UI });
        text(r.pg, 660, ry + 15, { size: 19, weight: 600, color: C.blue, fam: UI });
        text(r.my, 1050, ry + 15, { size: 19, weight: 600, color: C.orange, fam: UI });
        text(r.sq, 1460, ry + 15, { size: 19, weight: 600, color: C.purple, fam: UI });
      });

      // Pastdagi eslatma
      text("Xulosa: Tizimdan qat'i nazar, loyihalashda uchinchi normal shakl (3NF) eng xavfsiz tanlovdir.", 960, startY + 450, { size: 20, weight: 700, color: C.green, fam: UI, align: 'center', ignoreCardCheck: true });
    });
  }

  // 5. XULOSA VA LOYIHA (63.4 -> 82.5s)
  function sXulosa(t) {
    heading("Tipik Xatolar va Arxitektura Xulosasi", t, TM.scenes.xulosa_va_loyiha.s);

    const kMain = P(t, TM.scenes.xulosa_va_loyiha.s + 0.3, 0.8);
    withA(kMain, () => {
      // 4 ta tipik xato kartasi
      const mistakes = [
        {
          mistake: "Mijoz ma'lumotini har buyurtmada takrorlash",
          bad: "Bir mijozda ikkita manzil bo'lib qoladi, buyurtma o'chsa mijoz yo'qoladi.",
          fix: "mijozlar jadvali quring va buyurtmada faqat mijoz_id saqlang.",
          col: C.red
        },
        {
          mistake: "Oldindan 'sekin bo'ladi' deb denormalizatsiya qilish",
          bad: "Nusxalarni moslab turish kodi murakkablashadi, ma'lumotlar buziladi.",
          fix: "Avval 3NF quring, faqat o'lchab ko'rib keyin yig'ma jadval oching.",
          col: C.orange
        },
        {
          mistake: "Buyurtma qatorida narxni saqlamaslik",
          bad: "Mahsulot narxi oshganda eski yillardagi hisobotlar ham o'zgarib ketadi.",
          fix: "Sotilgan paytdagi narxni oraliq jadvalda alohida fakt qilib saqlang.",
          col: C.blue
        },
        {
          mistake: "Teg va rollarni massiv yoki JSON da saqlab qidirish",
          bad: "Postgres hujjati ogohlantiradi: bu noto'g'ri loyihalash belgisidir.",
          fix: "Filtrlash va tashqi kalit kerak bo'lsa, doimo alohida jadval quring.",
          col: C.green
        }
      ];

      mistakes.forEach((m, i) => {
        const bx = 120 + (i % 2) * 850;
        const by = 200 + Math.floor(i / 2) * 260;
        card(bx, by, 830, 240, { fill: C.card, col: m.col, p: kMain });

        pill(`Xato #${i + 1}`, bx + 70, by + 35, m.col, kMain, 18);
        text(m.mistake, bx + 160, by + 35, { size: 21, weight: 700, color: C.ink, fam: UI });

        text("Oqibati:", bx + 40, by + 90, { size: 19, weight: 700, color: C.red, fam: UI });
        text(m.bad, bx + 130, by + 90, { size: 19, color: C.ink, fam: UI, maxW: 660 });

        text("Yechim:", bx + 40, by + 145, { size: 19, weight: 700, color: C.green, fam: UI });
        text(m.fix, bx + 130, by + 145, { size: 20, weight: 600, color: C.green, fam: UI, maxW: 660 });
      });

      // Pastdagi yakuniy xulosa kartasi
      const kFinal = P(t, W('l10', 'qo\'llang'), 0.8);
      withA(kFinal, () => {
        card(120, 740, 1680, 250, { fill: '#f0fdf4', col: C.green, p: kFinal });
        text("38-bob Xulosasi: Professional Relyatsion Ma'lumotlar Bazasi", 160, 795, { size: 26, weight: 700, color: C.green, fam: UI });
        text("Uchinchi normal shakl (3NF) — ma'lumotlar bazasining uzoq yillar xatosiz,", 160, 855, { size: 23, color: C.ink, fam: UI });
        text("ziddiyatlarsiz va barqaror rivojlanishiga eng mustahkam kafolatdir.", 160, 905, { size: 23, weight: 700, color: C.blue, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.mysql_va_materialized_view.s) sIntro(t);
    else if (t < TM.scenes.sqlite_va_pragma_sharti.s) sMysql(t);
    else if (t < TM.scenes.qiyosiy_matritsa.s) sSqlite(t);
    else if (t < TM.scenes.xulosa_va_loyiha.s) sMatritsa(t);
    else sXulosa(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
