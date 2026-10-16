// SQL 14-bob 3-qism: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
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
    hand("14-bob. Dialektlar", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL, SQLite va Tipik Xatolar", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("CHECK, Avtomatik Indekslar, PRAGMA foreign_keys va Arxitektura Tuzoqlari", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 430, 1360 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'MySQL'), 0.8);
    withA(kBadges, () => {
      pill("1. MySQL 8.0+: CHECK & Avto-indeks", 400, 580, C.blue, kBadges, 21);
      pill("2. SQLite: PRAGMA foreign_keys = ON", 860, 580, C.green, kBadges, 21);
      pill("3. Taqqoslash Doskasi (3 Tizim)", 1300, 580, C.purple, kBadges, 21);
      pill("4. 6 Ta Tuzoq", 1640, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'tuzoqlarni'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion ma'lumotlar bazalarida cheklovlar umumiy SQL standartiga asoslansa-da,", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("MySQL va SQLite tizimlarida o'ziga xos farqlar, tarixiy o'zgarishlar va yashirin tuzoqlar mavjud:", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("Ularni chuqur bilmaslik kutilmagan xatoliklar yoki ma'lumotlar yaxlitligi buzilishiga olib keladi.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. MYSQL DEMO
  function sMysqlDemo(t) {
    heading("MySQL 8.0+: CHECK va Avtomatik FK Indekslari", t, TM.scenes.mysql_demo.s);

    const k1 = P(t, W('L2', 'chek'), 0.5);
    withA(k1, () => {
      const checkOut = MY.check_demo ? [MY.check_demo] : [
        "ERROR 3819 (HY000) at line 7: Check constraint 'mahsulot_my_chk_1' is violated."
      ];
      term(140, 220, 800, 450, "1. MySQL: CHECK Cheklovi Ishlashi", [{
        b: {
          cmd: "CREATE TABLE mahsulot_my (id int, narx decimal(10,2) CHECK (narx > 0));\nINSERT INTO mahsulot_my VALUES (1, -500);",
          out: checkOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L2', 'indeks'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("MySQL da Tashqi Kalit Avtomatik Indekslanadi", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("CREATE TABLE bola_my (id int PRIMARY KEY, ota_id int, FOREIGN KEY (ota_id) REFERENCES ota_my(id));", 1050, 360, { size: 16, fam: MONO, color: C.ink, wrap: 660 });
      text("SHOW INDEX FROM bola_my; natijasi:", 1050, 410, { size: 18, weight: 700, color: C.purple, wrap: 660 });
      text("• PRIMARY (id ustunida B-tree)\n• ota_id (ota_id ustunida B-tree) — MySQL o'zi yaratdi!", 1050, 450, { size: 18, fam: MONO, color: C.green, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("PostgreSQL dan Muhim Farqi:", 1050, 545, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("PostgreSQL tashqi kalit yaratilganda bola ustunga avtomatik indeks qo'ymaydi! Dasturchi o'zi CREATE INDEX qilishi shart. MySQL esa avtomatik qo'yadi.", 1050, 595, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L2', 'versiyalarda'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Tarixiy Noziklik: MySQL 8.0.16 gacha bo'lgan CHECK", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("MySQL 8.0.16 gacha bo'lgan versiyalarda CHECK sintaksisi yozilsa ham, server uni jimgina e'tiborsiz qoldirgan (pars qilgan, lekin tekshirmagan). Faqat 8.0.16 versiyasidan boshlab MySQL da CHECK to'liq va qat'iy tekshiriladi.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. SQLITE DEMO
  function sSqliteDemo(t) {
    heading("SQLite: PRAGMA foreign_keys = ON Xavfi", t, TM.scenes.sqlite_demo.s);

    const k1 = P(t, W('L3', 'pragma'), 0.5);
    withA(k1, () => {
      const sqliteOut = [
        "sqlite> PRAGMA foreign_keys;",
        "0 (Sukut bo'yicha O'CHIQLIGINI ko'rsatadi)",
        "sqlite> INSERT INTO bola VALUES (1, 999); -- Ota jadvalda 999 yo'q!",
        "(Qator qabul qilindi, hech qanday xato bermadi!)",
        "sqlite> PRAGMA foreign_keys = ON;",
        "sqlite> INSERT INTO bola VALUES (2, 888);",
        "Error: FOREIGN KEY constraint failed"
      ];
      term(140, 220, 800, 450, "SQLite da Tashqi Kalit Sinovi", [{
        b: {
          cmd: "sqlite3 xarid.db\nPRAGMA foreign_keys; -- 0\nINSERT INTO bola VALUES (1, 999);\nPRAGMA foreign_keys = ON;\nINSERT INTO bola VALUES (2, 888);",
          out: sqliteOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L3', 'xavfli'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.red, p: k2 });
      hand("Sukut Bo'yicha O'chiqlik Xavfi", 1020, 280, { size: 28, color: C.red, p: k2 });

      card(1020, 320, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("1. Yetim (Orphan) Qatorlar Paydo Bo'ladi:", 1050, 365, { size: 20, weight: 700, color: C.red, wrap: 660 });
      text("Agar ulanishda PRAGMA yoqilmasa, mavjud bo'lmagan ota_id bilan istalgancha qator kiritish mumkin bo'lib qoladi. Relyatsion butunlik butunlay yo'qoladi.", 1050, 410, { size: 18, color: C.ink, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("2. Yechim: Har Bir Ulanishda Yoqish:", 1050, 545, { size: 20, weight: 700, color: C.green, wrap: 660 });
      text("SQLite da bu parametr global emas, faqat joriy ulanish (connection) uchun amal qiladi. Connection pool yoki ORM ishlatganda 'PRAGMA foreign_keys = ON;' avtomatik yuborilishi shart!", 1050, 595, { size: 18, color: C.ink, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'himoya'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.green, p: kDesc });
      hand("Nega SQLite Uni Sukut Bo'yicha O'chirib Qo'ygan?", 180, 750, { size: 28, color: C.green, p: kDesc });
      text("SQLite arxitekturasi eski dasturlar bilan 100% orqaga moslikni (backward compatibility) saqlashni ustun qo'yadi. Eski dasturlar noto'g'ri FK lar bilan ishlagan bo'lsa birdan sinib qolmasligi uchun sukut bo'yicha 0 qo'yilgan. Zamonaviy ilovalarda buni albatta yoqish shart.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. TAQQOSLASH
  function sTaqqoslash(t) {
    heading("Taqqoslash: PostgreSQL vs MySQL vs SQLite", t, TM.scenes.taqqoslash.s);

    const k = P(t, W('L4', 'standart'), 0.5);
    withA(k, () => {
      const dbs = [
        {
          nom: "PostgreSQL 18",
          col: C.blue,
          badge: "Standart & Kuchli",
          items: [
            "CHECK: To'liq, NOT VALID qo'llab-quvvatlaydi",
            "UNIQUE NULL: Ko'p NULL, PG 15+ da NULLS NOT DISTINCT",
            "FOREIGN KEY: Standart, qo'lda indekslash shart",
            "DEFERRABLE: To'liq qo'llab-quvvatlanadi"
          ]
        },
        {
          nom: "MySQL 8.4 / 9",
          col: C.orange,
          badge: "Avtomatik Indekslar",
          items: [
            "CHECK: 8.0.16+ da ishlaydi, NOT ENFORCED bor",
            "UNIQUE NULL: Ko'p NULL (NULL != NULL deb qaraladi)",
            "FOREIGN KEY: Bola ustunga avtomatik indeks qo'yadi",
            "DEFERRABLE: Qo'llab-quvvatlanmaydi"
          ]
        },
        {
          nom: "SQLite 3",
          col: C.green,
          badge: "PRAGMA Shart",
          items: [
            "CHECK: To'liq ishlaydi (ustun va jadval darajasida)",
            "UNIQUE NULL: Ko'p NULL ga ruxsat beradi",
            "FOREIGN KEY: Sukut bo'yicha O'CHIQ (PRAGMA = ON shart)",
            "DEFERRABLE: DEFERRED tashqi kalitlar mavjud"
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
          title: "CHECK bor, lekin NOT NULL yo'q",
          desc: "CHECK (narx > 0) sharti NULL kelsa TRUE kabi o'tib ketadi. Majburiy ustunlarga har doim NOT NULL qo'ying.",
          col: C.red
        },
        {
          num: "2",
          title: "FK Indekssiz Qolishi (PostgreSQL)",
          desc: "Bola ustunda indeks bo'lmasa, ota qator o'chirilganda bola jadval Seq Scan qilinadi va qulflanib qoladi.",
          col: C.orange
        },
        {
          num: "3",
          title: "SQLite da PRAGMA Unutilishi",
          desc: "Ulanish paytida PRAGMA foreign_keys = ON berilmasa, butun baza yetim (xato) qatorlar bilan ifloslanadi.",
          col: C.red
        },
        {
          num: "4",
          title: "ON DELETE CASCADE Xavfi",
          desc: "Kaskadli o'chirish ehtiyotsizlik bilan ishlatilsa, bitta ota qator butun tranzaksiya tarixini yo'q qilishi mumkin.",
          col: C.purple
        },
        {
          num: "5",
          title: "Nomlanmagan Cheklovlar",
          desc: "CONSTRAINT nomi berilmasa, server bergan 't_chk_1' kabi xatoliklarni tahlil qilish juda mushkullashadi.",
          col: C.blue
        },
        {
          num: "6",
          title: "Aylanma Bog'liqlik Qotishi",
          desc: "Ikki jadval bir-biriga FK bo'lsa, DEFERRABLE mexanizmisiz ularga qator kiritishning iloji bo'lmay qoladi.",
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

    const k = P(t, W('L6', 'chuqur'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "CHECK Yoniga Doim NOT NULL",
          desc: "Mantiqiy shartlar NULL bilan ishlashda uch qiymatli mantiqqa (TRUE, FALSE, NULL) asoslanadi. NULL xavfidan faqat NOT NULL qutqaradi.",
          col: C.blue
        },
        {
          num: "2",
          title: "PostgreSQL da FK Ustunini Indekslash",
          desc: "MySQL o'zi indeks qo'yganidek, PostgreSQL da har bir tashqi kalit bola ustuniga alohida CREATE INDEX yarating.",
          col: C.purple
        },
        {
          num: "3",
          title: "SQLite da PRAGMA foreign_keys = ON",
          desc: "Har bir ulanishda (connection init) ushbu buyruqni avtomatik ishga tushirishni arxitekturangizga singdiring.",
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
      hand("Arxitektura Yaxlitligi — To'g'ri Sozlangan Cheklovlardan Boshlanadi!", 960, 755, { size: 34, align: 'center', color: C.blue, p: k });
      text("Ma'lumotlar bazasi darajasidagi cheklovlar dastur kodidagi xatolardan himoya qiluvchi eng so'nggi va eng mustahkam mudofaa chizig'idir.", 960, 825, { size: 23, align: 'center', color: C.ink, wrap: 1540 });
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
    // 4-sahna (Taqqoslash doskasi) bo'yicha chiroyli poster kadri
    const t = TM.scenes.taqqoslash.s + 5.0;
    frame(t);
  };
})();
