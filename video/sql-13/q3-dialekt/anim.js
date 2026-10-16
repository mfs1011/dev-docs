// SQL 13-bob 3-qism: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("13-bob. Dialektlar", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite: O'ziga Xos Mexanizmlar", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("AUTO_INCREMENT, rowid, AUTOINCREMENT va Tipik Tuzoqlar", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(380, 430, 1160 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Avto-inkrement'), 0.8);
    withA(kBadges, () => {
      pill("1. MySQL: AUTO_INCREMENT & LAST_INSERT_ID", 440, 580, C.blue, kBadges, 21);
      pill("2. SQLite: rowid vs AUTOINCREMENT", 960, 580, C.purple, kBadges, 21);
      pill("3. Buxgalteriya va Hisoblagich Tuzoqlari", 1480, 580, C.red, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'rou-ayd'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion bazalarda avtomatik raqamlash har xil amalga oshirilgan:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("MySQL AUTO_INCREMENT orqali o'z hisoblagichini qanday surishi, SQLite nima uchun AUTOINCREMENT dan", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("qochishni tavsiya qilishi va buxgalteriya cheklaridagi xatolarni solishtiramiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. MYSQL DEMO
  function sMysqlDemo(t) {
    heading("MySQL: AUTO_INCREMENT va LAST_INSERT_ID()", t, TM.scenes.mysql_demo.s);

    const k1 = P(t, W('L2', 'last-insert-ayd'), 0.5);
    withA(k1, () => {
      const mysqlOut = (TTY.mysql && TTY.mysql.auto_demo) ? TTY.mysql.auto_demo.split('\n') : [
        "LAST_INSERT_ID()",
        "1",
        "id\tism",
        "1\tAli",
        "2\tVali",
        "3\tNol",
        "4\tNull",
        "100\tSobir",
        "101\tKeyingi"
      ];
      term(140, 220, 800, 450, "MySQL 9.7: AUTO_INCREMENT Sinovi", [{
        b: {
          cmd: "INSERT INTO mijozlar_my (id, ism) VALUES (0, 'Nol'), (NULL, 'Null');\nINSERT INTO mijozlar_my (id, ism) VALUES (100, 'Sobir');\nINSERT INTO mijozlar_my (ism) VALUES ('Keyingi');\nSELECT LAST_INSERT_ID();",
          out: mysqlOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 16 });
    });

    const k2 = P(t, W('L3', 'ergashadi'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.blue, p: k2 });
      hand("MySQL ning O'ziga Xos Qoidalari:", 1020, 280, { size: 28, color: C.blue, p: k2 });

      card(1020, 320, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("• 0 yoki NULL kiritilsa ham hisoblagich ishlaydi va avtomatik raqam beradi.", 1050, 365, { size: 19, color: C.ink, wrap: 660 });
      text("• Qo'lda 100 kiritilsa, hisoblagich unga ergashadi va keyingi qator 101 ni oladi!", 1050, 415, { size: 19, weight: 700, color: C.green, wrap: 660 });
      text("• LAST_INSERT_ID(): ko'p qatorli INSERT da birinchi yaratilgan ID ni qaytaradi.", 1050, 455, { size: 18, color: C.soft, wrap: 660 });

      card(1020, 490, 720, 160, { fill: '#fff', col: C.red, p: k2 });
      text("Tuzoq: Kichik Tip Tanlash (TINYINT):", 1050, 530, { size: 21, weight: 700, color: C.red, wrap: 660 });
      text("TINYINT maksimal 127 gacha boradi. Keyingi qatorda:", 1050, 570, { size: 19, color: C.ink, wrap: 660 });
      text("ERROR 1062: Duplicate entry '127' for key 'PRIMARY'!", 1050, 615, { size: 19, fam: MONO, weight: 700, color: C.red, wrap: 660 });
    });

    const kDesc = P(t, W('L3', 'to‘xtaydi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.blue, p: kDesc });
      hand("Tavsiya: MySQL da Doimo BIGINT Tanlang", 180, 750, { size: 28, color: C.blue, p: kDesc });
      text("AUTO_INCREMENT ustunlariga INT yoki BIGINT bering. Hisoblagich to'lib qolsa, butun dastur qator qo'sha olmay to'xtab qoladi!", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 3. SQLITE DEMO
  function sSqliteDemo(t) {
    heading("SQLite: rowid vs AUTOINCREMENT", t, TM.scenes.sqlite_demo.s);

    const k1 = P(t, W('L4', 'praymari'), 0.5);
    withA(k1, () => {
      const sqliteOut = (TTY.sqlite && TTY.sqlite.autoincrement_demo) ? TTY.sqlite.autoincrement_demo.split('\n') : [
        "oddiy  1  Ali",
        "oddiy  2  Vali",
        "oddiy  3  Yangi",
        "auto   1  Ali",
        "auto   2  Vali",
        "auto   4  Yangi",
        "sqlite_sequence: auto -> 4"
      ];
      term(140, 220, 800, 450, "SQLite 3.54: rowid vs AUTOINCREMENT", [{
        b: {
          cmd: "CREATE TABLE oddiy (id INTEGER PRIMARY KEY, ism TEXT);\nCREATE TABLE auto  (id INTEGER PRIMARY KEY AUTOINCREMENT, ism TEXT);\nDELETE FROM oddiy WHERE id = 3; DELETE FROM auto WHERE id = 3;\nINSERT INTO oddiy (ism) VALUES ('Yangi');\nINSERT INTO auto (ism) VALUES ('Yangi');",
          out: sqliteOut
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'es-kyu-layt-sikvens'), 0.5);
    withA(k2, () => {
      card(980, 220, 800, 450, { fill: C.card, col: C.purple, p: k2 });
      hand("Farq Nimada?", 1020, 280, { size: 28, color: C.purple, p: k2 });

      card(1020, 320, 720, 150, { fill: '#fff', col: C.soft, p: k2 });
      text("1. Oddiy INTEGER PRIMARY KEY:", 1050, 360, { size: 20, weight: 700, color: C.blue, wrap: 660 });
      text("rowid taxallusi. Agar oxirgi qator (3) o'chirilsa, yangi qator shu 3 raqamini qayta ishlatishi mumkin.", 1050, 405, { size: 19, color: C.ink, wrap: 660 });

      card(1020, 490, 720, 160, { fill: '#fff', col: C.purple, p: k2 });
      text("2. AUTOINCREMENT Kalit So'zi:", 1050, 530, { size: 20, weight: 700, color: C.purple, wrap: 660 });
      text("sqlite_sequence jadvali yuritiladi. O'chirilgan oxirgi son hech qachon qayta ishlatilmaydi (auto jadvalida 4 berildi!).", 1050, 575, { size: 19, color: C.ink, wrap: 660 });
      text("Rasmiy hujjat ogohlantiradi: Qat'iy zarur bo'lmasa, undan qoching!", 1050, 620, { size: 18, color: C.red, wrap: 660 });
    });

    const kDesc = P(t, W('L6', 'yozilishi'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 230, { fill: C.card, col: C.red, p: kDesc });
      hand("Muhim SQLite Qoidasi: Faqat Aynan INTEGER So'zi!", 180, 750, { size: 28, color: C.red, p: kDesc });
      text("SQLite da 'INT PRIMARY KEY' yoki 'BIGINT PRIMARY KEY' deb yozsangiz, u rowid taxallusi bo'lmaydi va avtomatik raqam bermaydi! Faqat to'liq 'INTEGER PRIMARY KEY' yozilishi shart.", 180, 810, { size: 21, color: C.ink, wrap: 1560 });
    });
  }

  // 4. TAQQOSLASH JADVALI
  function sTaqqoslash(t) {
    heading("Taqqoslash: PostgreSQL vs MySQL vs SQLite", t, TM.scenes.taqqoslash.s);

    const k = P(t, W('L7', 'standarti'), 0.5);
    withA(k, () => {
      const cols = [
        { label: "Xususiyat", w: 380 },
        { label: "PostgreSQL 18", w: 420 },
        { label: "MySQL 9.7", w: 420 },
        { label: "SQLite 3.54", w: 420 }
      ];
      const rows = [
        ["Standart usul", "GENERATED ALWAYS AS IDENTITY", "AUTO_INCREMENT atributi", "INTEGER PRIMARY KEY (rowid)"],
        ["Alohida Sequence", "Mavjud (CREATE SEQUENCE)", "Mavjud emas", "Mavjud emas"],
        ["Qo'lda kattaroq ID", "Sequence surilmaydi (xavf)", "Hisoblagich unga ergashadi", "rowid + 1 ga suriladi"],
        ["ROLLBACK oqibati", "Bo'shliq qoladi (gap)", "Bo'shliq qoladi (gap)", "Raqam qayta ishlatiladi"],
        ["Oxirgi ID ni olish", "RETURNING id yoki currval()", "LAST_INSERT_ID()", "last_insert_rowid()"]
      ];

      table(140, 230, "UCH TIZIMNING IDENTIFIKATSIYA SOLISHTIRUVI", cols, rows, {
        p: k,
        row: (i) => ({
          hl: i === 2 ? 0.2 : 0,
          hlCol: C.hl,
          cellCol: { 1: C.blue, 2: C.purple, 3: C.green }
        })
      });

      card(140, 670, 1640, 260, { fill: C.card, col: C.blue, p: k });
      hand("Arxitekturaviy Farqlar Xulosasi:", 180, 725, { size: 28, color: C.blue, p: k });
      text("• PostgreSQL: SQL standartiga to'liq sodiq, qat'iy va xavfsiz (ALWAYS).", 180, 780, { size: 21, color: C.ink, wrap: 1560 });
      text("• MySQL: qulay, lekin qo'lda berilgan qiymatlarga ergashib ketishi ehtiyotkorlik talab etadi.", 180, 825, { size: 21, color: C.ink, wrap: 1560 });
      text("• SQLite: eng yengil va tezkor, alohida sequence jadvali faqat AUTOINCREMENT yozilsagina yuritiladi.", 180, 870, { size: 21, weight: 700, color: C.green, wrap: 1560 });
    });
  }

  // 5. TUZOQLAR
  function sTuzoqlar(t) {
    heading("Tipik Xatolar va Buxgalteriya Tuzog'i", t, TM.scenes.tuzoqlar.s);

    const k = P(t, W('L8', 'tayanishdir'), 0.5);
    withA(k, () => {
      const traps = [
        {
          num: "1",
          title: "Buxgalteriya Cheklarida Identity Ishlatish",
          bad: "Xato: Invoys yoki chek raqami uzluksiz (1, 2, 3...) bo'lishi shart deb identity ga tayanish.",
          fix: "To'g'ri: ROLLBACK va xatolarda bo'shliq bo'lishi tabiiy. Uzluksizlik kerak bo'lsa, alohida hisoblagich jadvali va SELECT FOR UPDATE ishlatiladi.",
          col: C.red
        },
        {
          num: "2",
          title: "MySQL da Kichik Tip Tanlash (TINYINT)",
          bad: "Xato: Ustunga TINYINT yoki SMALLINT AUTO_INCREMENT berib qo'yish.",
          fix: "To'g'ri: 127 yoki 32767 dan keyin baza qator qabul qilmay to'xtaydi. Doimo INT yoki BIGINT tanlang.",
          col: C.orange
        },
        {
          num: "3",
          title: "SQLite da 'INT PRIMARY KEY' deb Yozish",
          bad: "Xato: INT yoki BIGINT PRIMARY KEY deb yozilsa, rowid taxallusi ishlamaydi.",
          fix: "To'g'ri: SQLite faqat to'liq 'INTEGER PRIMARY KEY' yozilganidagina avtomatik raqamlashni yoqadi.",
          col: C.purple
        }
      ];

      traps.forEach((tr, idx) => {
        const y = 220 + idx * 235;
        card(140, y, 1640, 215, { fill: C.card, col: tr.col, p: k });
        pill(tr.num, 190, y + 45, tr.col, k, 24);
        hand(tr.title, 240, y + 52, { size: 27, color: tr.col, p: k });

        card(180, y + 85, 1560, 110, { fill: '#fff', col: C.soft, p: k });
        text(tr.bad, 210, y + 120, { size: 19, weight: 600, color: C.red, wrap: 1500 });
        text(tr.fix, 210, y + 160, { size: 19, weight: 600, color: C.green, wrap: 1500 });
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Tavsiyalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L9', 'ishonchli'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "GENERATED ALWAYS AS IDENTITY",
          desc: "PostgreSQL da asosiy tanlov. Tasodifiy qo'lda kiritishlardan to'liq himoya qiladi.",
          col: C.blue
        },
        {
          num: "2",
          title: "MySQL: BIGINT AUTO_INCREMENT",
          desc: "Tip chegarasi to'lib qolmasligi uchun katta butun tiplardan foydalaning.",
          col: C.green
        },
        {
          num: "3",
          title: "SQLite: INTEGER PRIMARY KEY",
          desc: "AUTOINCREMENT dan faqat raqamlar qayta ishlatilishi qat'iyan taqiqlangan holatdagina foydalaning.",
          col: C.purple
        },
        {
          num: "4",
          title: "Bo'shliqlar — Xato Emas!",
          desc: "Identity va sequence surrogat kalit uchundir. Raqamlar uzilishidan hech qachon cho'chimang.",
          col: C.orange
        }
      ];

      items.forEach((it, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const x = 140 + colIdx * 840;
        const y = 220 + rowIdx * 350;

        card(x, y, 800, 310, { fill: C.card, col: it.col, p: k });
        pill(it.num, x + 50, y + 55, it.col, k, 24);
        hand(it.title, x + 90, y + 62, { size: 26, color: it.col, p: k });

        card(x + 40, y + 105, 720, 175, { fill: '#fff', col: C.soft, p: k });
        text(it.desc, x + 65, y + 160, { size: 21, color: C.ink, wrap: 670 });
      });
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
    // 4-sahna (Taqqoslash jadvali) bo'yicha chiroyli poster kadri
    const t = TM.scenes.taqqoslash.s + 6.0;
    frame(t);
  };
})();
