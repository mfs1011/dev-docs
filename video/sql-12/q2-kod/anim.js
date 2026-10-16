// SQL 12-bob 2-qism: "Kod" — PostgreSQL 18 da amaliy testlar
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
    hand("12-bob: Kod", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18 da CREATE TABLE", 960, 300, { size: 80, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Amaliy Sinovlar, MVCC Versiyalari va Yashirin Tizim Ustunlari", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'jadvallar'), 0.8);
    withA(kBadges, () => {
      pill("1. DEFAULT & Dublikat Qatorlar", 440, 580, C.blue, kBadges, 22);
      pill("2. ctid & xmin: Qator Versiyalari", 960, 580, C.purple, kBadges, 22);
      pill("3. LIKE & UNLOGGED Jadvallar", 1480, 580, C.green, kBadges, 22);
    });

    const kDesc = P(t, W('L1', 'tizim'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Ushbu amaliy darsda PostgreSQL 18.6 terminalida jadvallarni real sinovdan o'tkazamiz:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("DEFAULT qiymatlarning qo'llanilishi, yashirin tizim ustunlarining (ctid, xmin) o'zgarishi,", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("LIKE bilan nusxalash va TEMPORARY hamda UNLOGGED jadvallarining xususiyatlarini ko'ramiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. CREATE TABLE & DEFAULT
  function sCreateDefault(t) {
    heading("Jadval Yaratish, DEFAULT va Dublikat Qatorlar", t, TM.scenes.create_default.s);

    const kTerm = P(t, TM.scenes.create_default.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "psql (PostgreSQL 18.6)",
        prompt: "postgres=# ",
        lines: [
          "-- Jadval yaratamiz:",
          "CREATE TABLE mahsulotlar (",
          "    id          integer,",
          "    nom         text,",
          "    narx        numeric(12,2) DEFAULT 0,",
          "    soni        integer DEFAULT 1,",
          "    yaratilgan  timestamptz DEFAULT now()",
          ");",
          "",
          "-- Qatorlar kiritamiz:",
          "INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non');",
          "INSERT INTO mahsulotlar VALUES (2, 'Sut', DEFAULT, 5, DEFAULT);",
          "INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');",
          "INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');",
          "",
          "-- Natija:",
          "SELECT id, nom, narx, soni, yaratilgan IS NOT NULL AS vaqt_bor FROM mahsulotlar;",
          " id | nom | narx | soni | vaqt_bor",
          "----+-----+------+------+----------",
          "  1 | Non | 0.00 |    1 | t",
          "  2 | Sut | 0.00 |    5 | t",
          "  3 | Non | 0.00 |    1 | t",
          "  3 | Non | 0.00 |    1 | t",
          "(4 rows)"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L2', 'narxga'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("DEFAULT Qiymatlari Qanday Ishlaydi?", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("1-qatorda faqat id va nom ko'rsatildi:", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• narx = 0.00 va soni = 1 avtomatik to'ldirildi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• yaratilgan ustuniga now() bilan joriy vaqt yozildi.", 1030, 430, { size: 19, color: C.ink, wrap: 720 });
      text("• 2-qatorda DEFAULT so'zi aynan sukut qiymatini qo'yishni talab qildi.", 1030, 475, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });

    const k2 = P(t, W('L3', 'ikki'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.red, p: k2 });
      hand("Katta Xavf: Dublikat Qatorlar", 1000, 655, { size: 28, color: C.red, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("3- va 4-qatorlarga diqqat qiling:", 1030, 735, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("• Bir xil '3, Non, 0.00, 1' qatori bazaga ikki marta yozildi!", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• Sababi: jadvalda PRIMARY KEY yoki UNIQUE cheklovi yo'q.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• Baza buni qabul qiladi, ammo haqiqiy tizimda bu qat'iy xatodir!", 1030, 855, { size: 19, weight: 700, color: C.red, wrap: 720 });
    });
  }

  // 3. SYSTEM COLUMNS: CTID & XMIN
  function sSysCols(t) {
    heading("Yashirin Tizim Ustunlari: ctid va MVCC xmin", t, TM.scenes.sys_cols.s);

    const kTerm = P(t, TM.scenes.sys_cols.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "psql (Yashirin Ustunlar va UPDATE)",
        prompt: "postgres=# ",
        lines: [
          "-- Yashirin ctid va xmin ni o'qiymiz:",
          "SELECT ctid, xmin, tableoid::regclass, id, nom",
          "FROM mahsulotlar;",
          " ctid  | xmin |  tableoid   | id | nom",
          "-------+------+-------------+----+-----",
          " (0,1) | 1472 | mahsulotlar |  1 | Non",
          " (0,2) | 1473 | mahsulotlar |  2 | Sut",
          " (0,3) | 1474 | mahsulotlar |  3 | Non",
          " (0,4) | 1475 | mahsulotlar |  3 | Non",
          "(4 rows)",
          "",
          "-- Bitta qatorni yangilaymiz:",
          "UPDATE mahsulotlar SET soni = 2 WHERE id = 1;",
          "UPDATE 1",
          "",
          "-- Qayta tekshiramiz:",
          "SELECT ctid, xmin, id, soni FROM mahsulotlar WHERE id = 1;",
          " ctid  | xmin | id | soni",
          "-------+------+----+------",
          " (0,5) | 1476 |  1 |    2",
          "(1 row)",
          "-- ctid (0,1) dan (0,5) ga ko'chdi!"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L4', 'yashirin'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.purple, p: k1 });
      hand("ctid va xmin Nimani Bildiradi?", 1000, 275, { size: 28, color: C.purple, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("ctid = (sahifa, joylashuv):", 1030, 355, { size: 21, weight: 700, color: C.purple, wrap: 720 });
      text("• (0,1) degani: 0-disk sahifasi, 1-yozuv koordinatasi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• xmin = 1472: shu qator versiyasini yaratgan tranzaksiya ID si.", 1030, 430, { size: 19, color: C.ink, wrap: 720 });
      text("• tableoid: qator qaysi jadvalga tegishli ekanining OID raqami.", 1030, 475, { size: 19, color: C.soft, wrap: 720 });
    });

    const k2 = P(t, W('L5', 'yangilaganimizda'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.blue, p: k2 });
      hand("UPDATE Qilinganda Nima Bo'ldi?", 1000, 655, { size: 28, color: C.blue, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("Qator (0,1) dan (0,5) ga ko'chdi, xmin = 1476 bo'ldi!", 1030, 735, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• PostgreSQL mavjud qatorni jismonan ustiga yozmaydi (MVCC).", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• Yangi versiya yangi disk joyiga (0,5) yozildi, eski qator o'chirilgan deb belgilandi.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• XULOSA: ctid hech qachon qator identifikatori bo'la olmaydi!", 1030, 855, { size: 19, weight: 700, color: C.red, wrap: 720 });
    });
  }

  // 4. SYSTEM COLUMN CONFLICT ERROR
  function sSysErr(t) {
    heading("Tizim Ustuni Nomi Bilan To'qnashuv Xatosi", t, TM.scenes.sys_err.s);

    const kTerm = P(t, TM.scenes.sys_err.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "psql (Tizim Ustuni To'qnashuvi)",
        prompt: "postgres=# ",
        lines: [
          "-- Tizim ustuni nomidan foydalanishga urinamiz:",
          "CREATE TABLE xato (",
          "    ctid integer",
          ");",
          "ERROR:  column name \"ctid\" conflicts with a",
          "system column name",
          "",
          "-- Boshqa tizim ustunlari bilan ham xuddi shunday:",
          "CREATE TABLE xato2 (xmin integer);",
          "ERROR:  column name \"xmin\" conflicts with a",
          "system column name",
          "",
          "CREATE TABLE xato3 (tableoid integer);",
          "ERROR:  column name \"tableoid\" conflicts with a",
          "system column name"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L6', 'to‘qnashuv'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 740, { fill: C.card, col: C.red, p: k1 });
      hand("PostgreSQL Tizim Ustunlari Ro'yxati", 1000, 280, { size: 28, color: C.red, p: k1 });

      const reserved = [
        { name: "ctid", desc: "Qatorning sahifa va joylashuv koordinatasi" },
        { name: "xmin", desc: "Qator versiyasini kiritgan tranzaksiya ID si" },
        { name: "xmax", desc: "Qatorni o'chirgan/yangilagan tranzaksiya ID si" },
        { name: "cmin, cmax", desc: "Tranzaksiya ichidagi buyruq raqamlari" },
        { name: "tableoid", desc: "Jadvalning PostgreSQL dagi OID raqami" }
      ];

      reserved.forEach((item, idx) => {
        const y = 340 + idx * 75;
        card(1000, y, 780, 65, { fill: '#fff', col: C.soft, p: k1 });
        pill(item.name, 1070, y + 32, C.red, k1, 18);
        text(item.desc, 1160, y + 32, { size: 19, color: C.ink, wrap: 600 });
      });

      card(1000, 740, 780, 180, { fill: C.hl, col: C.red, p: k1 });
      text("MUHIM QOIDA:", 1030, 780, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("Bu nomlar PostgreSQL tomonidan band qilingan. Hatto qo'shtirnoq ichida (\"ctid\") yozilganda ham baza xato qaytaradi!", 1030, 825, { size: 19, color: C.ink, wrap: 720 });
    });
  }

  // 5. LIKE INCLUDING DEFAULTS
  function sLikeDemo(t) {
    heading("LIKE INCLUDING DEFAULTS va Nusxalash", t, TM.scenes.like_demo.s);

    const kTerm = P(t, TM.scenes.like_demo.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "psql (LIKE va Nusxalash)",
        prompt: "postgres=# ",
        lines: [
          "-- 1. Oddiy LIKE bilan sxemani ko'chiramiz:",
          "CREATE TABLE nusxa (LIKE mahsulotlar);",
          "",
          "-- 2. INCLUDING DEFAULTS bilan ko'chiramiz:",
          "CREATE TABLE nusxa2 (",
          "    LIKE mahsulotlar INCLUDING DEFAULTS",
          ");",
          "",
          "-- Ikkalasiga qator qo'shamiz:",
          "INSERT INTO nusxa  (id, nom) VALUES (1, 'test');",
          "INSERT INTO nusxa2 (id, nom) VALUES (1, 'test');",
          "",
          "SELECT 'nusxa' AS jadval, narx, soni FROM nusxa",
          "UNION ALL",
          "SELECT 'nusxa2', narx, soni FROM nusxa2;",
          " jadval | narx | soni ",
          "--------+------+------",
          " nusxa  |      |     ",
          " nusxa2 | 0.00 |    1",
          "(2 rows)"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L7', 'nusxa'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("Oddiy LIKE vs INCLUDING DEFAULTS", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("Oddiy CREATE TABLE ... (LIKE eski):", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• Faqat ustun nomlari, ma'lumot tiplari va NOT NULL ko'chadi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• Sukut qiymatlar (DEFAULT) nusxaga O'TMAYDI (narx = NULL).", 1030, 435, { size: 19, weight: 700, color: C.red, wrap: 720 });
      text("• Agar DEFAULT kerak bo'lsa: INCLUDING DEFAULTS shart!", 1030, 480, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });

    const k2 = P(t, W('L7', 'saqlab'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.green, p: k2 });
      hand("Boshqa Qismlarni Ko'chirish", 1000, 655, { size: 28, color: C.green, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("PostgreSQL LIKE opsiyalari:", 1030, 735, { size: 21, weight: 700, color: C.green, wrap: 720 });
      text("• INCLUDING CONSTRAINTS — CHECK cheklovlarini ko'chiradi.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• INCLUDING INDEXES — B-tree indekslarini ham yaratadi.", 1030, 810, { size: 19, color: C.ink, wrap: 720 });
      text("• INCLUDING ALL — barcha xususiyatlarni birato'la to'liq ko'chiradi!", 1030, 855, { size: 19, weight: 700, color: C.green, wrap: 720 });
    });
  }

  // 6. TEMP AND UNLOGGED TABLES
  function sTempUnlogged(t) {
    heading("TEMPORARY va UNLOGGED Jadvallari", t, TM.scenes.temp_unlogged.s);

    const kTerm = P(t, TM.scenes.temp_unlogged.s + 0.3, 0.6);
    withA(kTerm, () => {
      term(100, 220, 820, 740, {
        title: "psql (relpersistence Sinovi)",
        prompt: "postgres=# ",
        lines: [
          "-- Maxsus jadvallar yaratamiz:",
          "CREATE TEMP TABLE vaqtinchalik (x int);",
          "CREATE UNLOGGED TABLE kesh (k text, v text);",
          "",
          "-- pg_class tizim katalogidan tekshiramiz:",
          "SELECT relname, relpersistence FROM pg_class",
          "WHERE relname IN ('mahsulotlar', 'vaqtinchalik', 'kesh');",
          "   relname    | relpersistence ",
          "--------------+----------------",
          " mahsulotlar  | p",
          " vaqtinchalik | t",
          " kesh         | u",
          "(3 rows)",
          "",
          "-- Belgilar ma'nosi:",
          "-- p = permanent (doimiy jadval, to'liq WAL)",
          "-- t = temporary (seansga tegishli vaqtinchalik)",
          "-- u = unlogged (WAL-siz, juda tezkor)"
        ],
        p: kTerm
      });
    });

    const k1 = P(t, W('L8', 'pe-ge-temp'), 0.5);
    withA(k1, () => {
      card(960, 220, 860, 350, { fill: C.card, col: C.blue, p: k1 });
      hand("TEMPORARY ('t') Xususiyatlari", 1000, 275, { size: 28, color: C.blue, p: k1 });

      card(1000, 315, 780, 225, { fill: '#fff', col: C.soft, p: k1 });
      text("Seansga tegishli maxsus jadval:", 1030, 355, { size: 21, weight: 700, color: C.blue, wrap: 720 });
      text("• Alohida 'pg_temp_...' sxemasida yaratiladi.", 1030, 395, { size: 19, color: C.ink, wrap: 720 });
      text("• Mijoz bazadan uzilganda avtomatik o'chiriladi.", 1030, 435, { size: 19, color: C.ink, wrap: 720 });
      text("• Oraliq hisob-kitoblar va ma'lumot tahlili uchun ideal.", 1030, 475, { size: 19, color: C.soft, wrap: 720 });
    });

    const k2 = P(t, W('L8', 'harfi'), 0.5);
    withA(k2, () => {
      card(960, 600, 860, 360, { fill: C.card, col: C.red, p: k2 });
      hand("UNLOGGED ('u') Xususiyatlari", 1000, 655, { size: 28, color: C.red, p: k2 });

      card(1000, 695, 780, 235, { fill: '#fff', col: C.soft, p: k2 });
      text("WAL (Write-Ahead Log) ga yozmaydi:", 1030, 735, { size: 21, weight: 700, color: C.red, wrap: 720 });
      text("• Diskka yozish minimal bo'lgani uchun oddiy jadvaldan ancha tez.", 1030, 775, { size: 19, color: C.ink, wrap: 720 });
      text("• KATTA XAVF: Server kutilmaganda o'chsa, jadval BO'SHATILADI!", 1030, 815, { size: 19, weight: 700, color: C.red, wrap: 720 });
      text("• Faqat kesh yoki qayta tiklanadigan vaqtinchalik ma'lumotlar uchun!", 1030, 860, { size: 18, color: C.soft, wrap: 720 });
    });
  }

  // 7. XULOSA
  function sOutro(t) {
    heading("Xulosa: PostgreSQL Amaliy Qoidalari", t, TM.scenes.xulosa.s);

    const k = P(t, TM.scenes.xulosa.s + 0.3, 0.8);
    withA(k, () => {
      card(140, 220, 500, 560, { fill: C.card, col: C.blue, p: k });
      hand("DEFAULT & Qatorlar", 170, 280, { size: 30, color: C.blue, p: k });
      card(170, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• DEFAULT berilmasa NULL qo'yiladi.", 190, 360, { size: 19, weight: 700, color: C.blue, wrap: 400 });
      text("• now() har qator yozilganda yangilanadi.", 190, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Dublikat qatorlar paydo bo'lmasligi uchun birlamchi kalit shart.", 190, 500, { size: 18, color: C.ink, wrap: 400 });

      card(710, 220, 500, 560, { fill: C.card, col: C.purple, p: k });
      hand("ctid & MVCC", 740, 280, { size: 30, color: C.purple, p: k });
      card(740, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• ctid disk koordinatasi, UPDATE da yangilanadi.", 760, 360, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• xmin qator versiyasining tranzaksiya ID si.", 760, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Tizim ustunlari nomini o'z ustuningizga berib bo'lmaydi.", 760, 500, { size: 18, color: C.ink, wrap: 400 });

      card(1280, 220, 500, 560, { fill: C.card, col: C.green, p: k });
      hand("Nusxa & Maxsuslik", 1310, 280, { size: 30, color: C.green, p: k });
      card(1310, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• LIKE INCLUDING ALL barcha qismlarni ko'chiradi.", 1330, 360, { size: 19, weight: 700, color: C.green, wrap: 400 });
      text("• TEMP jadval seans tugaganda yo'qoladi.", 1330, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• UNLOGGED jadval o'ta tezkor ammo crash-unsafe hisoblanadi.", 1330, 500, { size: 18, color: C.ink, wrap: 400 });

      const kBanner = P(t, W('L9', 'saqlanishi'), 0.6);
      withA(kBanner, () => {
        card(140, 810, 1640, 160, { fill: C.card, col: C.green, p: kBanner });
        text("Ushbu amaliy bilimlar PostgreSQL da ma'lumotlar jismoniy saqlanishi va jadvallarni to‘g‘ri boshqarishda juda qo‘l keladi.", 960, 895, { size: 26, weight: 700, align: 'center', color: C.green, wrap: 1560 });
      });
    });
  }

  function draw(t) {
    bg();
    const sc = TM.scenes;
    if (t < sc.create_default.s) sIntro(t);
    else if (t < sc.sys_cols.s) sCreateDefault(t);
    else if (t < sc.sys_err.s) sSysCols(t);
    else if (t < sc.like_demo.s) sSysErr(t);
    else if (t < sc.temp_unlogged.s) sLikeDemo(t);
    else if (t < sc.xulosa.s) sTempUnlogged(t);
    else sOutro(t);
  }

  function renderPoster() {
    bg();
    hand("12-bob: Kod", 960, 160, { size: 48, align: 'center', p: 1, color: C.soft });
    hand("PostgreSQL 18 da CREATE TABLE", 960, 245, { size: 74, align: 'center', p: 1, color: C.blue });
    hand("Amaliy Sinovlar, MVCC Versiyalari va Yashirin Tizim Ustunlari", 960, 325, { size: 32, align: 'center', p: 1 });
    marker(400, 355, 1120, 14, C.hl, 1);

    pill("1. DEFAULT & now() Testi", 440, 430, C.blue, 1, 22);
    pill("2. ctid & xmin MVCC Koordinatasi", 960, 430, C.purple, 1, 22);
    pill("3. LIKE & UNLOGGED Jadvallar", 1480, 430, C.green, 1, 22);

    card(140, 490, 780, 220, { fill: C.card, col: C.blue, p: 1 });
    hand("DEFAULT va Dublikat Qatorlar", 170, 540, { size: 26, color: C.blue, p: 1 });
    text("• Berilmagan ustunga DEFAULT (narx 0, soni 1, now()) qo'yiladi.", 170, 585, { size: 19, color: C.ink, wrap: 720 });
    text("• INSERT da aynan DEFAULT deb yozish mumkin.", 170, 625, { size: 19, color: C.green, wrap: 720 });
    text("• Birlamchi kalitsiz bir xil qator ikki marta yoziladi!", 170, 665, { size: 19, color: C.red, wrap: 720 });

    card(1000, 490, 780, 220, { fill: C.card, col: C.purple, p: 1 });
    hand("ctid va xmin MVCC O'zgarishi", 1030, 540, { size: 26, color: C.purple, p: 1 });
    text("• ctid diskdagi koordinata: (sahifa, joy).", 1030, 585, { size: 19, color: C.purple, wrap: 720 });
    text("• UPDATE qilinganda ctid (0,1) dan (0,5) ga o'zgaradi!", 1030, 625, { size: 19, weight: 700, color: C.blue, wrap: 720 });
    text("• Baza yangi versiyani yangi joyga yozadi, eskisini o'chiradi.", 1030, 665, { size: 19, color: C.soft, wrap: 720 });

    card(140, 740, 780, 220, { fill: C.card, col: C.red, p: 1 });
    hand("Tizim Ustuni To'qnashuvi", 170, 790, { size: 26, color: C.red, p: 1 });
    text("• CREATE TABLE xato (ctid int) -> ERROR qaytaradi.", 170, 835, { size: 19, color: C.red, wrap: 720 });
    text("• ctid, xmin, xmax, tableoid nomlarini o'z ustuningizga berib bo'lmaydi.", 170, 875, { size: 19, color: C.ink, wrap: 720 });
    text("• Hatto qo'shtirnoq ichida ham baza rad etadi.", 170, 915, { size: 19, color: C.soft, wrap: 720 });

    card(1000, 740, 780, 220, { fill: C.card, col: C.green, p: 1 });
    hand("Nusxalash va Maxsus Jadvallar", 1030, 790, { size: 26, color: C.green, p: 1 });
    text("• LIKE INCLUDING DEFAULTS: sukut qiymatlarni ham ko'chiradi.", 1030, 835, { size: 19, color: C.green, wrap: 720 });
    text("• TEMP jadval seans tugaganda o'chiriladi (pg_temp sxemasi).", 1030, 875, { size: 19, color: C.ink, wrap: 720 });
    text("• UNLOGGED jadval relpersistence = 'u' bilan tezkor ammo WAL-sizdir.", 1030, 915, { size: 19, color: C.soft, wrap: 720 });
  }

  window.render = draw;
  window.renderFrame = draw;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;
})();
