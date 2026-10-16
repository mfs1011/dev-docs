// SQL 15-bob 3-qism: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = (window.TTY && window.TTY) || {};
  const MY = TTY.mysql || {};
  const SL = TTY.sqlite || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("15-bob. Dialektlar", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL, SQLite va Tipik Xatolar", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Virtual Indekslar, Zanjirsimon Murojaat, ALTER TABLE Cheklovi va 6 Ta Tuzoq", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 430, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'May'), 0.8);
    withA(kBadges, () => {
      pill("1. MySQL: Virtual Indeks & Zanjir", 400, 580, C.blue, kBadges, 21);
      pill("2. SQLite: STORED Qo'shish Taqiqi", 860, 580, C.green, kBadges, 21);
      pill("3. Taqqoslash Doskasi (3 Tizim)", 1320, 580, C.purple, kBadges, 21);
      pill("4. 6 Ta Tuzoq", 1660, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'tuzoqlarni'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Generated ustunlar SQL standartida umumiy ko'rinsa ham, MySQL va SQLite tizimlarida", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("sintaksis ixchamligi, indekslash imkoniyatlari va jadvalni o'zgartirishda jiddiy farqlar bor:", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("Ularni to'g'ri tushunish kutilmagan cheklovlar va sekinlashuvlarning oldini oladi.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. MYSQL DEMO
  function sMysqlDemo(t) {
    heading("MySQL 8.4 / 9: Virtual Indeks va Zanjir Murojaati", t, TM.scenes.mysql_demo.s);

    const k1 = P(t, W('L2', 'virtual'), 0.5);
    withA(k1, () => {
      const out1 = [
        "id   narx     soni  summa     summa_s   jami_qqs",
        "1    4000.00  3     12000.00  12000.00  13440.00"
      ];
      term(140, 220, 800, 450, "MySQL da Generated Ustunlar", [{
        b: {
          cmd: "CREATE TABLE buyurtma_my (\n    id INT PRIMARY KEY,\n    narx DECIMAL(12,2) NOT NULL,\n    soni INT NOT NULL,\n    summa DECIMAL(14,2) AS (narx * soni),\n    summa_s DECIMAL(14,2) AS (narx * soni) STORED,\n    jami_qqs DECIMAL(14,2) AS (summa * 1.12),\n    INDEX (summa)\n);\nINSERT INTO buyurtma_my VALUES (1, 4000, 3);\nSELECT * FROM buyurtma_my;",
          out: out1
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L2', 'tayana'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("MySQL ning Ikki Katta Afzalligi", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("1. Zanjirsimon Murojaat Ruxsat Etilgan:", 1050, 365, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("jami_qqs DECIMAL(14,2) AS (summa * 1.12)", 1050, 410, { size: 17, fam: MONO, color: C.ink, wrap: 660 });
      text("• jami_qqs avval yaratilgan boshqa generated ustunga (summa) bemalol tayana oladi! (PostgreSQL da bu taqiqlangan).", 1050, 450, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("2. Virtual Ustunga InnoDB Indeksi:", 1050, 545, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("INDEX (summa) — MySQL InnoDB virtual ustunga ham to'liq B-tree indeks qo'yishga ruxsat beradi. Natijada qidiruv virtual bo'lsa ham chaqqon ishlaydi.", 1050, 595, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'indeks'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("MySQL Sintaksisi:", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("MySQL da GENERATED ALWAYS so'zlari ixtiyoriy: faqat AS (ifoda) deb yozish yetarli. Sukut bo'yicha u VIRTUAL hisoblanadi. Agar saqlanishi kerak bo'lsa oxiriga STORED qo'shiladi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. SQLITE DEMO
  function sSqliteDemo(t) {
    heading("SQLite: Qisqa Sintaksis va STORED Tuzog'i", t, TM.scenes.sqlite_demo.s);

    const k1 = P(t, W('L3', 'Es-kyu-layt'), 0.5);
    withA(k1, () => {
      const out2 = [
        "╭────┬──────┬──────┬───────┬─────────┬──────────────╮",
        "│ id │ narx │ soni │ summa │ summa_s │ ikki_baravar │",
        "╞════╪══════╪══════╪═══════╪═════════╪══════════════╡",
        "│  1 │ 4000 │    3 │ 12000 │   12000 │        24000 │",
        "╰────┴──────┴──────┴───────┴─────────┴──────────────╯"
      ];
      term(140, 220, 800, 450, "1. SQLite da Oddiy Yaratish", [{
        b: {
          cmd: "CREATE TABLE q (\n    id INTEGER PRIMARY KEY, narx NUMERIC, soni INT,\n    summa NUMERIC AS (narx * soni),\n    summa_s NUMERIC AS (narx * soni) STORED,\n    ikki_baravar AS (summa * 2)\n);\nINSERT INTO q (narx, soni) VALUES (4000, 3);\nSELECT * FROM q;",
          out: out2
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L3', 'stord'), 0.5);
    withA(k2, () => {
      const out3 = [
        "sqlite> CREATE TABLE q2 (id INTEGER PRIMARY KEY, soni INT);",
        "sqlite> INSERT INTO q2 (soni) VALUES (1);",
        "sqlite> ALTER TABLE q2 ADD COLUMN v2 AS (soni + 1); -- OK!",
        "sqlite> ALTER TABLE q2 ADD COLUMN s2 AS (soni + 1) STORED;",
        "Error near line 5: cannot add a STORED column"
      ];
      term(980, 220, 800, 450, "2. ALTER TABLE dagi Katta Cheklov", [{
        b: {
          cmd: "ALTER TABLE q2 ADD COLUMN s2 AS (soni + 1) STORED;",
          out: out3
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L3', 'bo‘lmaydi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.red, p: kDesc });
      hand("Nega SQLite da Ma'lumotli Jadvalga STORED Qo'shib Bo'lmaydi?", 180, 750, { size: 28, color: C.red, p: kDesc });
      text("SQLite arxitekturasida ALTER TABLE juda yengil operatsiya bo'lib, diskdagi mavjud qatorlarni qayta yozmaydi. STORED ustun esa qatorlarga fizik yozilishni talab qiladi. Shuning uchun SQLite ma'lumotli jadvalga faqat VIRTUAL ustun qo'shishga ruxsat beradi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. TAQQOSLASH
  function sTaqqoslash(t) {
    heading("Taqqoslash: PostgreSQL vs MySQL vs SQLite", t, TM.scenes.taqqoslash.s);

    const k = P(t, W('L4', 'barchasi'), 0.5);
    withA(k, () => {
      const dbs = [
        {
          nom: "PostgreSQL 18",
          col: C.blue,
          badge: "Standart & Qat'iy",
          items: [
            "Sukut bo'yicha: VIRTUAL (18-versiyadan)",
            "Zanjir murojaat: TAQIQLANADI",
            "O'zgaruvchan funksiya: TAQIQLANADI (now() xato)",
            "ALTER TABLE ADD: Ikkala tur ham qo'shiladi"
          ]
        },
        {
          nom: "MySQL 8.4 / 9",
          col: C.orange,
          badge: "Zanjir & Indeks",
          items: [
            "Sukut bo'yicha: VIRTUAL",
            "Zanjir murojaat: Oldingi ustunga MUMKIN",
            "Virtual indeks: InnoDB da to'liq ruxsat",
            "ALTER TABLE ADD: Ikkala tur ham qo'shiladi"
          ]
        },
        {
          nom: "SQLite 3",
          col: C.green,
          badge: "Ixcham & Cheklovli",
          items: [
            "Sukut bo'yicha: VIRTUAL",
            "Zanjir murojaat: MUMKIN (aylana bo'lmasa)",
            "Virtual indeks: Ifoda indeksi sifatida ishlaydi",
            "ALTER TABLE ADD: Faqat VIRTUAL qo'shish mumkin!"
          ]
        }
      ];

      dbs.forEach((db, i) => {
        const x = 140 + i * 560;
        card(x, 220, 520, 680, { fill: C.card, col: db.col, p: k });
        pill(db.badge, x + 260, 275, db.col, k, 20);
        hand(db.nom, x + 260, 335, { size: 32, align: 'center', color: db.col, p: k });

        db.items.forEach((it, idx) => {
          const cy = 390 + idx * 125;
          card(x + 25, cy, 470, 105, { fill: '#fff', col: C.soft, p: k });
          const parts = it.split(': ');
          text(parts[0] + ":", x + 45, cy + 40, { size: 19, weight: 700, color: db.col, wrap: 430 });
          text(parts[1], x + 45, cy + 75, { size: 17, color: C.ink, wrap: 430 });
        });
      });
    });
  }

  // 5. TUZOQLAR
  function sTuzoqlar(t) {
    heading("Tipik Xatolar va Arxitektura Tuzoqlari", t, TM.scenes.tuzoqlar.s);

    const k = P(t, W('L5', 'xato'), 0.5);
    withA(k, () => {
      const traps = [
        {
          num: "1",
          title: "Vaqtni now() Bilan Saqlash",
          desc: "now() o'zgarmas emas. Qator yaratilgan vaqt uchun doim DEFAULT now() ishlating.",
          col: C.red
        },
        {
          num: "2",
          title: "PostgreSQL da Zanjir Xatosi",
          desc: "PostgreSQL da bitta generated ustun boshqasiga tayana olmaydi. Asosiy ustunlardan yozing.",
          col: C.orange
        },
        {
          num: "3",
          title: "Og'ir Virtual Ustun Indekssiz",
          desc: "Ko'p o'qiladigan og'ir formulali virtual ustun har SELECT da qayta hisoblanib qotadi. Indeks qo'ying.",
          col: C.purple
        },
        {
          num: "4",
          title: "SQLite da STORED Qo'shish",
          desc: "Ma'lumotli jadvalga ALTER TABLE orqali STORED qo'shib bo'lmaydi. Faqat VIRTUAL qo'shish mumkin.",
          col: C.red
        },
        {
          num: "5",
          title: "Qo'lda Qiymat Kiritish",
          desc: "Generated ustunga qo'lda son yozib bo'lmaydi. Faqat DEFAULT kalit so'zi ruxsat etiladi.",
          col: C.blue
        },
        {
          num: "6",
          title: "MySQL da sql_mode O'zgarishi",
          desc: "Ifoda natijasi sql_mode ga bog'liq bo'lsa, rejim o'zgarganda hisob-kitoblar buzilishi mumkin.",
          col: C.green
        }
      ];

      traps.forEach((tr, idx) => {
        const colIdx = idx % 3;
        const rowIdx = Math.floor(idx / 3);
        const x = 140 + colIdx * 560;
        const y = 220 + rowIdx * 350;

        card(x, y, 520, 320, { fill: C.card, col: tr.col, p: k });
        pill(tr.num, x + 50, y + 55, tr.col, k, 24);
        hand(tr.title, x + 90, y + 62, { size: 21, color: tr.col, p: k });

        card(x + 25, y + 105, 470, 185, { fill: '#fff', col: C.soft, p: k });
        text(tr.desc, x + 45, y + 160, { size: 19, color: C.ink, wrap: 430 });
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L6', 'mustahkam'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "Virtual Ustun — Sukut Tanlovi",
          desc: "Zamonaviy bazalarda sukut bo'yicha Virtual yaratilib disk tejaladi.",
          col: C.blue
        },
        {
          num: "2",
          title: "Dialekt Farqlarini Eslang",
          desc: "MySQL da zanjir va virtual indeks bor, SQLite da STORED qo'shish cheklangan.",
          col: C.purple
        },
        {
          num: "3",
          title: "DEFAULT va GENERATED Farqi",
          desc: "Vaqt uchun DEFAULT, formulali hisob-kitob uchun GENERATED ALWAYS tanlang.",
          col: C.green
        }
      ];

      items.forEach((it, idx) => {
        const x = 140 + idx * 560;
        card(x, 220, 520, 430, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, 275, it.col, k, 24);
        hand(it.title, x + 90, 282, { size: 22, color: it.col, p: k });

        card(x + 25, 330, 470, 290, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 50, 395, { size: 21, color: C.ink, wrap: 420 });
      });

      card(140, 690, 1640, 220, { fill: C.card, col: C.blue, p: k });
      hand("Hisob-kitoblarni Baza Darajasida To'g'ri Loyihalash — Katta Yutuq!", 960, 755, { size: 34, align: 'center', color: C.blue, p: k });
      text("Generated ustunlar barcha ilovalar uchun yagona haqiqat manbai (single source of truth) bo'lib xizmat qiladi.", 960, 825, { size: 23, align: 'center', color: C.ink, wrap: 1540 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.mysql_demo.s) sIntro(t);
    else if (t < S.sqlite_demo.s) sMysqlDemo(t);
    else if (t < S.taqqoslash.s) sSqliteDemo(t);
    else if (t < S.tuzoqlar.s) sTaqqoslash(t);
    else if (t < S.xulosa.s) sTuzoqlar(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 4-sahna (Taqqoslash doskasi) bo'yicha chiroyli poster
    const t = TM.scenes.taqqoslash.s + 5.0;
    frame(t);
  };
})();
