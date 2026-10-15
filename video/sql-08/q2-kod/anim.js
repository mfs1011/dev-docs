// SQL 8-bob 2-qism: "Kod" — PostgreSQL terminalida jonli amallar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY?.pg || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO: SHOW TimeZone
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("8-bob. 2-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL Terminalida Jonli Kod", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("TimeZone, timestamptz, AT TIME ZONE va Interval Amallari", 960, 395, { size: 40, align: 'center', p: P(t, 1.2, 1.2) });
    marker(420, 430, 1080 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kTerm = P(t, W('L2', 'timezone'), 0.8);
    withA(kTerm, () => {
      // Chap: Terminal
      term(140, 480, 800, 440, "psql: Mintaqani tekshirish", [{
        b: {
          cmd: "SHOW TimeZone;",
          out: (TTY.sel_tz || "   TimeZone    \n---------------\n Asia/Tashkent\n(1 row)").split("\n")
        },
        t: kTerm,
        typeDur: 1.0
      }], { font: 16 });

      // O'ng: Tushuntirish kartasi
      card(980, 480, 800, 440, { fill: C.card, col: C.blue, p: kTerm });
      pill("SEANSNING TimeZone SOZLAMASI", 1280, 535, C.blue, kTerm, 22);
      text("• SHOW TimeZone joriy sessiyaning vaqt mintaqasini ko'rsatadi.", 1020, 605, { size: 23, color: C.ink, wrap: 720 });
      text("• Server sukut bo'yicha: Asia/Tashkent (UTC+05:00).", 1020, 660, { size: 23, weight: 700, color: C.green, wrap: 720 });
      text("• timestamptz o'qilganda aynan shu mintaqaga moslab ko'rsatiladi.", 1020, 715, { size: 22, color: C.ink, wrap: 720 });
      text("• Seans davomida SET TimeZone buyrug'i bilan xohlagan vaqt o'zgartirish mumkin.", 1020, 770, { size: 22, color: C.soft, wrap: 720 });
    });
  }

  // 2. TZ_SINOV: voqealar jadvali
  function sTzSinov(t) {
    heading("timestamp va timestamptz: Amaliy Sinov", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'timestamptz'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: Jadval yaratish va kiritish", [{
        b: {
          cmd: "CREATE TABLE voqealar (nom text, oddiy timestamp, zonali timestamptz);\nINSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');\nINSERT INTO voqealar VALUES ('qongiroq', '2026-10-12 09:00:00+03', '2026-10-12 09:00:00+03');\nSELECT * FROM voqealar;",
          out: [
            "   nom    |        oddiy        |         zonali         ",
            "----------+---------------------+------------------------",
            " dars     | 2026-10-12 09:00:00 | 2026-10-12 09:00:00+05 ",
            " qongiroq | 2026-10-12 09:00:00 | 2026-10-12 11:00:00+05 ",
            "(2 rows)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L4', 'tashlab'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Nega 11:00+05 Bo'lib Qoldi?", 1020, 290, { size: 30, color: C.purple, p: k2 });

      card(1020, 335, 720, 105, { fill: '#fff', col: C.red, p: k2 });
      text("oddiy: '...09:00:00+03'  -->  2026-10-12 09:00:00", 1050, 385, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("+03 mintaqasi shunchaki TASHAB YUBORILDI!", 1050, 420, { size: 18, color: C.soft });

      card(1020, 455, 720, 105, { fill: '#fff', col: C.green, p: k2 });
      text("zonali: '...09:00:00+03'  -->  2026-10-12 11:00:00+05", 1050, 505, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Moskvadagi 09:00 = Toshkentda 11:00 (lahza saqlandi!)", 1050, 540, { size: 18, color: C.green });

      text("timestamptz qiymatni UTC ga o'girib, Toshkentda to'g'ri ko'rsatdi.", 1020, 625, { size: 20, color: C.ink, wrap: 720 });
    });

    const kDesc = P(t, W('L4', 'toshkent'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff9e6', col: C.orange, p: kDesc });
      pill("ENG MUHIM TAHLIL", 270, 750, C.orange, kDesc, 22);
      text("• 'qongiroq' voqeasi +03 (Moskva) bilan yozilgan edi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• oddiy timestamp mintaqa farqini bilmaydi, faqat ko'ringan soatni qabul qilib xatolik tug'diradi.", 180, 860, { size: 23, color: C.red, weight: 700, wrap: 1560 });
      text("• timestamptz esa butun dunyo bo'ylab bitta xalqaro lahzani ifodalaydi!", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 3. UTC_SINOV: TimeZone = 'UTC'
  function sUtcSinov(t) {
    heading("Seansni UTC Ga O'zgartirib Tekshirish", t, L('L5').s - 0.4);

    const k1 = P(t, W('L5', 'mintaqasini'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: SET TimeZone = 'UTC'", [{
        b: {
          cmd: "SET TimeZone = 'UTC';\nSELECT * FROM voqealar;",
          out: (TTY.sel_voqealar_utc || "SET\n   nom    |        oddiy        |         zonali         \n----------+---------------------+------------------------\n dars     | 2026-10-12 09:00:00 | 2026-10-12 04:00:00+00\n qongiroq | 2026-10-12 09:00:00 | 2026-10-12 06:00:00+00\n(2 rows)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L6', 'u-te-se'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.blue, p: k2 });
      hand("UTC Ko'rinishining Ma'nosi", 1020, 290, { size: 30, color: C.blue, p: k2 });

      card(1020, 335, 720, 105, { fill: '#fff', col: C.blue, p: k2 });
      text("dars:     09:00:00+05  -->  04:00:00+00", 1050, 395, { size: 22, fam: MONO, weight: 700, color: C.blue });

      card(1020, 455, 720, 105, { fill: '#fff', col: C.purple, p: k2 });
      text("qongiroq: 11:00:00+05  -->  06:00:00+00", 1050, 515, { size: 22, fam: MONO, weight: 700, color: C.purple });

      text("Lahzalar o'zgarmadi! Har ikkisi UTC ga moslab ko'rsatildi.", 1020, 615, { size: 21, color: C.green, weight: 600, wrap: 720 });
    });

    const kDesc = P(t, W('L6', 'qotib'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#f0fdf4', col: C.green, p: kDesc });
      pill("XULOSA: QAYSI BIRIDAN FOYDALANISH KERAK?", 380, 750, C.green, kDesc, 22);
      text("• oddiy timestamp qotib turibdi (09:00:00). Mintaqa o'zgargani bilan uning farqi yo'q.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• timestamptz esa har bir foydalanuvchiga o'zining soat mintaqasiga moslab chiqariladi.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
      text("• Xalqaro tizimlar, to'lovlar, loglar va buyurtmalar uchun doimo timestamptz ishlating!", 180, 905, { size: 23, color: C.green, weight: 700, wrap: 1560 });
    });
  }

  // 4. AT_TIME_ZONE: operator
  function sAtTimeZone(t) {
    heading("AT TIME ZONE Operatori Sirlari", t, L('L7').s - 0.4);

    const k1 = P(t, W('L7', 'operatorini'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: AT TIME ZONE amallari", [{
        b: {
          cmd: "SET TimeZone = 'Asia/Tashkent';\nSELECT '2026-10-12 09:00:00+05'::timestamptz AT TIME ZONE 'Europe/Moscow' AS moskva_vaqti,\n       '2026-10-12 09:00:00'::timestamp AT TIME ZONE 'Europe/Moscow' AS moskvadagi_soat;",
          out: (TTY.at_time_zone || "    moskva_vaqti     |    moskvadagi_soat     \n---------------------+------------------------\n 2026-10-12 07:00:00 | 2026-10-12 11:00:00+05\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L8', 'moskvadagi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Ikki Xil Yo'nalishdagi O'girish", 1020, 290, { size: 30, color: C.purple, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.blue, p: k2 });
      text("1. timestamptz AT TIME ZONE 'zona'", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.blue });
      text("Ushbu lahzada Moskvada devor soati nechani ko'rsatadi? (07:00)", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.orange, p: k2 });
      text("2. timestamp AT TIME ZONE 'zona'", 1050, 500, { size: 21, fam: MONO, weight: 700, color: C.orange });
      text("Moskvadagi soat 09:00 bizning Toshkentda necha bo'ladi? (11:00+05)", 1050, 540, { size: 18, color: C.ink });

      text("Birinchi holda natija timestamp, ikkinchi holda timestamptz bo'ladi.", 1020, 625, { size: 20, color: C.soft, wrap: 720 });
    });

    const kDesc = P(t, W('L8', 'hisoblab'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#eff6ff', col: C.blue, p: kDesc });
      pill("AMALIY FOYDASI", 260, 750, C.blue, kDesc, 22);
      text("• Agar mijozning o'z mintaqasida hisobot shakllantirmoqchi bo'lsangiz, AT TIME ZONE eng qulay vosita.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Masalan: 'Bugun Toshkent vaqti bilan qilingan barcha to'lovlar' — UTC lahzalarini Toshkent vaqtiga o'girib guruhlash mumkin.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 5. INTERVAL_MATH: arifmetika va normallashuv
  function sIntervalMath(t) {
    heading("Interval Arifmetikasi va Normallashuvi", t, L('L9').s - 0.4);

    const k1 = P(t, W('L9', 'arifmetikasi'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: Oy qo'shish va normallashuv", [{
        b: {
          cmd: "SELECT date '2026-01-31' + interval '1 month' AS bir_oy,\n       date '2026-03-31' + interval '1 month' AS mart_oxiri;\nSELECT '2 years 15 months 100 weeks 99 hours'::interval AS normallashgan;",
          out: [
            "       bir_oy        |     mart_oxiri      ",
            "---------------------+---------------------",
            " 2026-02-28 00:00:00 | 2026-04-30 00:00:00 ",
            "(1 row)",
            "",
            "          normallashgan           ",
            "----------------------------------",
            " 3 years 3 mons 700 days 99:00:00 ",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L11', 'ayirmasi'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: Sanalarni ayirish", [{
        b: {
          cmd: "SELECT timestamp '2026-10-12 18:00' - timestamp '2026-10-10 09:30' AS farq;\nSELECT date '2026-10-12' - date '2026-01-01' AS kunlar;",
          out: (TTY.interval_math?.split("\n\n")[2] || "      farq       | kunlar \n-----------------+--------\n 2 days 08:30:00 |    284 \n(1 row)").split("\n")
        },
        t: k2,
        typeDur: 1.0
      }], { font: 16 });
    });

    const kDesc = P(t, W('L10', 'fevralda'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#f8fafc', col: C.blue, p: kDesc });
      pill("INTERVALNING 3 MAYDONI VA QOIDALARI", 360, 750, C.blue, kDesc, 22);
      text("• 31-yanvar + 1 oy = 28-fevral. Fevralda 31-kun yo'qligi sababli oyning oxirgi kuni olinadi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• 15 oy -> 1 yil 3 oy bo'ldi. 100 hafta -> 700 kunga aylandi. Lekin kunlar oylarga, soatlar kunlarga o'girilmaydi!", 180, 860, { size: 23, color: C.green, weight: 700, wrap: 1560 });
      text("• timestamp ayirmasi interval (2 days 08:30:00), date ayirmasi esa integer (284 kun) qaytaradi.", 180, 905, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 6. DST_NY: Yozgi vaqt (New York)
  function sDstNy(t) {
    heading("Nyu-Yorkda Yozgi Vaqt: 1 kun vs 24 soat", t, L('L12').s - 0.4);

    const k1 = P(t, W('L12', 'yozgi'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: America/New_York (2026-03-08)", [{
        b: {
          cmd: "SET TimeZone = 'America/New_York';\nSELECT timestamptz '2026-03-07 12:00' + interval '1 day' AS bir_kun,\n       timestamptz '2026-03-07 12:00' + interval '24 hours' AS yigirma_tort_soat;",
          out: (TTY.dst_ny || "SET\n        bir_kun         |   yigirma_tort_soat    \n------------------------+------------------------\n 2026-03-08 12:00:00-04 | 2026-03-08 13:00:00-04\n(1 row)").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L13', 'natijada'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.orange, p: k2 });
      hand("Bir Soatlik Sirli Farq!", 1020, 290, { size: 30, color: C.orange, p: k2 });

      card(1020, 335, 720, 110, { fill: '#fff', col: C.blue, p: k2 });
      text("interval '1 day'    -->  12:00:00-04", 1050, 375, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("Kalendar kuni qo'shildi: ertangi kun, aynan soat 12:00.", 1050, 415, { size: 18, color: C.ink });

      card(1020, 460, 720, 110, { fill: '#fff', col: C.red, p: k2 });
      text("interval '24 hours'  -->  13:00:00-04", 1050, 500, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Aniq 24 soat o'tdi. Soat 1 ga surilgani uchun 13:00 bo'ldi!", 1050, 540, { size: 18, color: C.ink });

      text("Yozgi vaqtga o'tish kuni 23 soat davom etdi!", 1020, 625, { size: 21, color: C.red, weight: 700, wrap: 720 });
    });

    const kDesc = P(t, W('L13', 'soatdan'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("AMALIY TAQSIMOT QOIDASI", 280, 750, C.red, kDesc, 22);
      text("• Kalendar bo'yicha 'har kuni soat 12:00 da dori ichish kerak' bo'lsa -> interval '1 day' ishlating.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• Aniq fizika yoki mashina vaqti 'server 24 soatdan keyin o'chsin' bo'lsa -> interval '24 hours' ishlating.", 180, 860, { size: 23, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 7. DATESTYLE_XATO: DateStyle va mavjud bo'lmagan sana
  function sDatestyleXato(t) {
    heading("DateStyle Va Mavjud Bo'lmagan Sanalar", t, L('L14').s - 0.4);

    const k1 = P(t, W('L14', 'sukut'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "1. psql: Format xatosi (MDY vs DMY)", [{
        b: {
          cmd: "SELECT '13/01/2026'::date;",
          out: (TTY.datestyle_err || "ERROR:  date/time field value out of range: \"13/01/2026\"\nLINE 1: SELECT '13/01/2026'::date;\n               ^\nHINT:  Perhaps you need a different \"DateStyle\" setting.").split("\n")
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L15', 'datestyle'), 0.5);
    withA(k2, () => {
      term(980, 230, 800, 440, "2. psql: DateStyle = 'ISO, DMY' va 30-fevral", [{
        b: {
          cmd: "SET DateStyle = 'ISO, DMY';\nSELECT '13/01/2026'::date AS dmy;\nSELECT '2026-02-30'::date;",
          out: [
            "SET",
            "    dmy     ",
            "------------",
            " 2026-01-13 ",
            "(1 row)",
            "",
            "ERROR:  date/time field value out of range: \"2026-02-30\"",
            "LINE 1: SELECT '2026-02-30'::date;"
          ]
        },
        t: k2,
        typeDur: 1.0
      }], { font: 15 });
    });

    const kDesc = P(t, W('L15', 'mutlaqo'), 0.5);
    withA(kDesc, () => {
      card(140, 700, 1640, 240, { fill: '#fff5f5', col: C.red, p: kDesc });
      pill("POSTGRESQL KALENDAR HIMOYASI", 310, 750, C.red, kDesc, 22);
      text("• Sukut bo'yicha DateStyle 'ISO, MDY' bo'lgani uchun 13-oy yo'q deb xato beradi.", 180, 810, { size: 23, color: C.ink, wrap: 1560 });
      text("• ISO formati ('2026-01-13') ishlatilsa DateStyle qanday bo'lishidan qat'i nazar har doim xatosiz o'qiladi!", 180, 860, { size: 23, color: C.green, weight: 700, wrap: 1560 });
      text("• 30-fevral kabi xato sanalarga PostgreSQL hech qachon yo'l qo'ymaydi va xato beradi.", 180, 905, { size: 23, color: C.red, weight: 700, wrap: 1560 });
    });
  }

  // 8. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Terminal Saboqlari", t, L('L16').s - 0.4);

    const pillars = [
      { tit: "TimeZone ga hushyor bo'ling", sub: "SHOW TimeZone orqali seans mintaqangizni biling. timestamptz shunga qarab ko'rinadi.", col: C.blue, at: W('L16', 'timezone') },
      { tit: "ISO 8601 qutqaradi", sub: "YYYY-MM-DD ko'rinishida yozsangiz DateStyle xatolariga mutlaqo duch kelmaysiz.", col: C.green, at: W('L16', 'iso') },
      { tit: "Interval farqlarini biling", sub: "DST kunlarida 1 day va 24 hours farq qiladi. Oylar esa oyning oxirgi kuniga to'g'rilanadi.", col: C.orange, at: L('L16').s + 4 },
      { tit: "Dialektlar va tuzoqlar", sub: "Keyingi qismda MySQL DATETIME vs TIMESTAMP, 2038 muammosi va SQLite tuzoqlarini ko'ramiz.", col: C.purple, at: L('L17').s }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, p.at, 0.5);
      withA(k, () => {
        const x = 140 + (i % 2) * 840, y = 260 + Math.floor(i / 2) * 330;
        card(x, y, 800, 280, { fill: C.card, col: p.col, p: k });
        pill(p.tit, x + 240, y + 55, p.col, k, 22);
        text(p.sub, x + 40, y + 130, { size: 23, color: C.ink, wrap: 720 });
      });
    });
  }

  // Asosiy chizish funksiyasi
  function draw(t) {
    window.CURRENT_T = t;
    bg();
    const sc = TM.scenes;
    if (t < sc.tz_sinov.s) sIntro(t);
    else if (t < sc.utc_sinov.s) sTzSinov(t);
    else if (t < sc.at_time_zone.s) sUtcSinov(t);
    else if (t < sc.interval_math.s) sAtTimeZone(t);
    else if (t < sc.dst_ny.s) sIntervalMath(t);
    else if (t < sc.datestyle_xato.s) sDstNy(t);
    else if (t < sc.xulosa.s) sDatestyleXato(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("8-bob: Sana va Vaqt — Jonli Kod", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("psql da TimeZone, timestamptz, AT TIME ZONE va Interval", 960, 290, { size: 40, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("TimeZone Sinovi", 180, 440, { size: 32, color: C.blue });
    text("• SHOW TimeZone;\n• +03 Moskva vaqti\n• timestamptz 11:00 bo'ldi\n• timestamp zonani o'chirdi\n• UTC da 04:00 va 06:00", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("POSTGRES CLI", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("AT TIME ZONE", 750, 440, { size: 32, color: C.purple });
    text("• Ikki tomonga ishlaydi\n• timestamptz -> timestamp\n• timestamp -> timestamptz\n• Moskvada soat 07:00\n• Toshkentda soat 11:00", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("OPERATOR CONVERSION", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.orange });
    hand("Interval va DST", 1320, 440, { size: 32, color: C.orange });
    text("• 31-yanvar + 1 oy = 28-fevral\n• 100 hafta = 700 kun\n• NY da 1 day = 12:00\n• NY da 24 hours = 13:00\n• 2026-02-30 out of range", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("INTERVAL & DST", 1530, 820, C.orange, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
