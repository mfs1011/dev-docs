// SQL 8-bob 3-qism: "Dialektlar" — MySQL va SQLite dagi farqlar va 6 ta tuzoq
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("8-bob. 3-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Sana va Vaqt: Dialektlar", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MySQL, SQLite va 6 ta Xavfli Tuzoq", 960, 395, { size: 42, align: 'center', p: P(t, 1.2, 1.2) });
    marker(440, 430, 1040 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'may'), 0.8);
    withA(kBadges, () => {
      pill("MySQL: DATETIME, TIMESTAMP & 2038", 480, 600, C.orange, kBadges, 24);
      pill("SQLite: 3 ta saqlash klassi", 960, 600, C.green, kBadges, 24);
      pill("6 ta jiddiy amaliy tuzoq", 1440, 600, C.red, kBadges, 24);
    });

    const kDesc = P(t, W('L2', 'standartlarga'), 0.8);
    withA(kDesc, () => {
      card(200, 700, 1520, 240, { fill: C.card, col: C.blue, p: kDesc });
      text("Har bir ma'lumotlar bazasi vaqtga turlicha yondashadi:", 960, 760, { size: 28, weight: 700, align: 'center', color: C.ink });
      text("PostgreSQL standartlarga qat'iy amal qilsa, MySQL va SQLite o'ziga xos cheklovlar,", 960, 815, { size: 24, align: 'center', color: C.soft });
      text("sukut bo'yicha yaxlitlashlar va kutilmagan fe'l-atvorga ega.", 960, 865, { size: 24, weight: 700, align: 'center', color: C.red });
    });
  }

  // 2. MYSQL_DT_TS: DATETIME vs TIMESTAMP
  function sMysqlDtTs(t) {
    heading("MySQL: DATETIME va TIMESTAMP Farqi", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'datetime'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "MySQL: time_zone o'zgarishi sinovi", [{
        b: {
          cmd: "CREATE TABLE voqealar (nom VARCHAR(20), dt DATETIME, ts TIMESTAMP);\nSET time_zone = '+05:00';\nINSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');\nSET time_zone = '+00:00';\nSELECT * FROM voqealar;",
          out: (TTY.mysql?.dt_vs_ts ? [
            "+------+---------------------+---------------------+",
            "| nom  | dt                  | ts                  |",
            "+------+---------------------+---------------------+",
            "| dars | 2026-10-12 09:00:00 | 2026-10-12 04:00:00 |",
            "+------+---------------------+---------------------+"
          ] : [
            "dars\t2026-10-12 09:00:00\t2026-10-12 04:00:00"
          ])
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'muammosi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.orange, p: k2 });
      hand("DATETIME va TIMESTAMP Xususiyatlari", 1020, 290, { size: 28, color: C.orange, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.blue, p: k2 });
      text("DATETIME (Mahalliy vaqt)", 1050, 375, { size: 22, weight: 700, color: C.blue });
      text("• Oraliq: 1000-01-01 dan 9999-12-31 gacha.\n• Mintaqasiz saqlanadi, time_zone unga ta'sir qilmaydi.", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.purple, p: k2 });
      text("TIMESTAMP (UTC Lahza)", 1050, 500, { size: 22, weight: 700, color: C.purple });
      text("• time_zone o'zgarganda UTC dan qaytarib beradi.\n• Lekin oraliq: 1970 dan faqat 2038-yilgacha!", 1050, 540, { size: 18, color: C.red, weight: 600 });

      text("Har ikkisi ham PostgreSQL dagi kabi ishlaydi, ammo 2038 yili chegarasi bor!", 1020, 625, { size: 19, color: C.soft, wrap: 720 });
    });

    const kDesc = P(t, W('L4', 'u-te-se'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("MYSQL DA TANLOV QOIDASI", 290, 750, C.orange, kDesc, 22);
      text("• MySQL da timestamptz degan alohida tip yo'q. Lahza uchun TIMESTAMP ishlatiladi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Biroq kelajak sanalari uchun TIMESTAMP yaramaydi, chunki u 32-bitli butun son chegarasiga ega!", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• Shuning uchun uzoq muddatli ma'lumotlarda DATETIME ni UTC da saqlash tavsiya etiladi.", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 3. MYSQL_TUZOQ: 3 ta tuzoq
  function sMysqlTuzoq(t) {
    heading("MySQL dagi 3 ta Xavfli Tuzoq", t, L('L5').s - 0.4);

    const k1 = P(t, W('L5', 'xato'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. Tuzoq: 2038-yil chegarasi", [{
        b: {
          cmd: "SET time_zone = '+00:00';\nCREATE TABLE voqealar (ts TIMESTAMP);\nINSERT INTO voqealar VALUES ('2038-01-19 03:14:08');",
          out: (TTY.mysql?.year2038_err || "ERROR 1292 (22007) at line 5: Incorrect datetime value: '2038-01-19 03:14:08' for column 'ts' at row 1").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L6', 'sintaktik'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2 va 3. INTERVAL va Kasr yaxlitlash", [{
        b: {
          cmd: "CREATE TABLE i (x INTERVAL);\nCREATE TABLE kasr (a DATETIME, b DATETIME(3));\nINSERT INTO kasr VALUES ('2026-10-12 09:00:00.777', '2026-10-12 09:00:00.7777');\nSELECT * FROM kasr;",
          out: [
            "ERROR 1064 (42000): syntax error near 'INTERVAL)'",
            "",
            "a: 2026-10-12 09:00:01 (00.777 -> 01 yaxlitlandi!)",
            "b: 2026-10-12 09:00:00.778"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L7', 'yaxlitlab'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("MYSQL AMALIYOTIDAGI 3 OGOHLANTIRISH", 340, 750, C.red, kDesc, 22);
      text("1. 2038-yil: TIMESTAMP 2038-yil 19-yanvardan keyin qulab tushadi. Kredit va sug'urta muddatlarida ehtiyot bo'ling!", 180, 810, { size: 22, color: C.red, weight: 700, wrap: 1560 });
      text("2. INTERVAL ustun tipi emas: MySQL da INTERVAL faqat sana amallarida ishlatiladi, alohida ustun qilib bo'lmaydi.", 180, 855, { size: 22, color: C.ink, wrap: 1560 });
      text("3. Sukut bo'yicha kasr aniqligi 0: DATETIME ga millisekund bersangiz, xabarsiz keyingi sekundga yaxlitlanadi (DATETIME(3) bering!).", 180, 900, { size: 22, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 4. SQLITE_TIPLAR: 3 saqlash klassi
  function sSqliteTiplar(t) {
    heading("SQLite: Maxsus Tip Yo'q, 3 ta Saqlash Klassi", t, L('L8').s - 0.4);

    const k1 = P(t, W('L9', 'iso'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.green, p: k1 });
      pill("3 TA SAQLASH KLASSI", 300, 285, C.green, k1, 22);

      card(180, 335, 720, 95, { fill: '#fff', col: C.blue, p: k1 });
      text("1. TEXT (ISO 8601 matni)", 200, 370, { size: 21, fam: MONO, weight: 700, color: C.blue });
      text("Misol: '2026-10-12 09:00:00' (inson o'qishi uchun eng qulay)", 200, 405, { size: 18, color: C.ink });

      card(180, 445, 720, 95, { fill: '#fff', col: C.purple, p: k1 });
      text("2. INTEGER (Unix vaqti, UTC soniyalar)", 200, 480, { size: 21, fam: MONO, weight: 700, color: C.purple });
      text("Misol: 1791795600 (eng ixcham va tez solishtiriladi)", 200, 515, { size: 18, color: C.ink });

      card(180, 555, 720, 95, { fill: '#fff', col: C.orange, p: k1 });
      text("3. REAL (Julian kuni)", 200, 590, { size: 21, fam: MONO, weight: 700, color: C.orange });
      text("Misol: 2461325.875 (astronomik hisoblar uchun)", 200, 625, { size: 18, color: C.ink });
    });

    const k2 = P(t, W('L10', 'funksiyalar'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "SQLite: O'rnatilgan sana funksiyalari", [{
        b: {
          cmd: "CREATE TABLE voqealar (nom TEXT, vaqt TEXT, unix INT, julian REAL);\nINSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00',\n       unixepoch('2026-10-12 09:00:00'), julianday('2026-10-12 09:00:00'));\nSELECT * FROM voqealar;",
          out: (TTY.sqlite?.formats ? TTY.sqlite.formats.split("\n") : [
            "dars | 2026-10-12 09:00:00 | 1791795600 | 2461325.875"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L10', 'bir-biriga'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#f0fdf4', col: C.green, p: kDesc });
      pill("SQLITE DA VAQT BILAN ISHLASH ASOSI", 320, 750, C.green, kDesc, 22);
      text("• SQLite funksiyalari (date, time, datetime, julianday, unixepoch) qiymatni sukut bo'yicha UTC deb hisoblaydi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Mahalliy vaqt kerak bo'lsa 'localtime' modifikatori qo'shiladi: datetime('now', 'localtime').", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
      text("• Matn, soniya yoki Julian formatidan qat'i nazar, SQLite funksiyalari ularni osonlik bilan o'zgartiradi.", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 5. SQLITE_TUZOQ: 3 ta g'aroyib holat
  function sSqliteTuzoq(t) {
    heading("SQLite dagi G'aroyib Holatlar va Matn Tuzog'i", t, L('L11').s - 0.4);

    const k1 = P(t, W('L11', 'siling'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "4 va 5. ceiling vs floor & Rollover", [{
        b: {
          cmd: "SELECT date('2026-01-31', '+1 month') AS bir_oy,\n       date('2026-01-31', '+1 month', 'floor') AS floor;\nSELECT date('2026-02-30') AS fevral30, date('salom') AS notogri;",
          out: [
            "bir_oy:  2026-03-03  (ceiling — sukut bo'yicha!)",
            "floor:   2026-02-28  (oldingi oy oxiri)",
            "",
            "fevral30: 2026-03-02 (xato bermaydi, rollover!)",
            "notogri:  NULL"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L13', 'kichik'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "6. ENG XAVFLI TUZOQ: Matn solishtirish", [{
        b: {
          cmd: "SELECT '2026-10-12' < '2026-9-30' AS matn_solishtirish;",
          out: (TTY.sqlite?.str_cmp_pitfall ? [
            TTY.sqlite.str_cmp_pitfall,
            "",
            "# Natija: 1 (ROST!)",
            "# Matn bo'yicha '1' belgisi '9' dan kichik!",
            "# 12-oktabr 30-sentabrdan OLDIN deb topildi!"
          ] : [
            "matn_solishtirish: 1",
            "# Matn bo'yicha '1' < '9'!"
          ])
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L13', 'buzilib'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("SQLITE TUZOQLARIDAN HIMOYALANISH", 300, 750, C.red, kDesc, 22);
      text("• Oy qo'shishda ehtiyot bo'ling: SQLite da 31-yanvar + 1 oy 3-martga aylanadi! 28-fevral kerak bo'lsa 'floor' qo'shing.", 180, 810, { size: 22, color: C.ink, wrap: 1560 });
      text("• 30-fevral xato bermaydi, balki jimgina 2-martga o'tib ketadi. Ma'lumotlarni ilovaning o'zida validatsiya qiling!", 180, 855, { size: 22, color: C.red, weight: 700, wrap: 1560 });
      text("• Qat'iy ISO formati ('2026-09-30', nol bilan) saqlang! Aks holda matn solishtirishda tartib butunlay buziladi.", 180, 900, { size: 22, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 6. XULOSA: Taqqoslash jadvali
  function sXulosa(t) {
    heading("Taqqoslash Jadvali va Yakuniy Xulosalar", t, L('L14').s - 0.4);

    const kTable = P(t, W('L14', 'postgre'), 0.5);
    withA(kTable, () => {
      table(140, 240, "", [
        { label: "Xususiyat", w: 380 },
        { label: "PostgreSQL", w: 420 },
        { label: "MySQL", w: 420 },
        { label: "SQLite", w: 420 }
      ], [
        ["Mahalliy vaqt", "timestamp (8 bayt)", "DATETIME (1000..9999)", "TEXT / REAL / INTEGER"],
        ["UTC lahza", "timestamptz (8 bayt)", "TIMESTAMP (1970..2038)", "Unix vaqti yoki UTC matni"],
        ["Vaqt oralig'i", "interval (16 bayt)", "Tip yo'q (faqat ifoda)", "timediff(), modifikator"],
        ["31-yanvar + 1 oy", "2026-02-28", "2026-02-28", "2026-03-03 (floor bilan 02-28)"],
        ["30-fevral kiritilsa", "XATO beradi", "XATO (STRICT rejimda)", "2026-03-02 ga aylanadi"]
      ], { p: kTable });
    });

    const kDesc = P(t, W('L15', 'formatida'), 0.5);
    withA(kDesc, () => {
      card(140, 680, 1640, 260, { fill: '#f8fafc', col: C.blue, p: kDesc });
      pill("YAKUNIY TAVSIYALAR", 260, 730, C.blue, kDesc, 22);
      text("1. PostgreSQL: Eng xavfsiz va standartga mos baza. Voqealar uchun timestamptz, oraliqlar uchun interval.", 180, 785, { size: 23, color: C.green, weight: 700, wrap: 1560 });
      text("2. MySQL: TIMESTAMP ning 2038-yil chegarasini unutmang. Kasr kerak bo'lsa DATETIME(3) yoki DATETIME(6) deb yozing.", 180, 835, { size: 23, color: C.orange, weight: 700, wrap: 1560 });
      text("3. SQLite: Sanalarni har doim to'liq ISO 8601 ('YYYY-MM-DD HH:MI:SS') yoki Unix soniyalarida saqlang.", 180, 885, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // Asosiy chizish funksiyasi
  function draw(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.mysql_dt_ts.s) sIntro(t);
    else if (t < sc.mysql_tuzoq.s) sMysqlDtTs(t);
    else if (t < sc.sqlite_tiplar.s) sMysqlTuzoq(t);
    else if (t < sc.sqlite_tuzoq.s) sSqliteTiplar(t);
    else if (t < sc.xulosa.s) sSqliteTuzoq(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("8-bob: Sana va Vaqt — Dialektlar", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("MySQL, SQLite va 6 ta Xavfli Tuzoq", 960, 290, { size: 40, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.orange });
    hand("MySQL Dialekti", 180, 440, { size: 32, color: C.orange });
    text("• DATETIME: mintaqasiz\n• TIMESTAMP: 1970..2038\n• 2038 xatosi (32-bit)\n• INTERVAL tipi yo'q\n• Sekund kasri 0 ga yaxlitlanadi", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("MYSQL TUZOQLARI", 390, 820, C.orange, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.green });
    hand("SQLite Dialekti", 750, 440, { size: 32, color: C.green });
    text("• Alohida tip yo'q\n• TEXT, REAL, INTEGER\n• 31-yanvar + 1 oy = 03-03\n• floor: 2026-02-28\n• 30-fevral -> 02-mart", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("SQLITE FE'L-ATVORI", 960, 820, C.green, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.red });
    hand("Matn Solishtirish", 1320, 440, { size: 32, color: C.red });
    text("• '2026-10-12' < '2026-9-30'\n• Natija: 1 (ROST!)\n• Chunki '1' < '9'\n• Nolsiz sana halokatli\n• ISO 8601 qat'iy shart", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("STRING CMP TRAP", 1530, 820, C.red, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
