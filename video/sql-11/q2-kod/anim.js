// SQL 11-bob 2-qism: "Kod" — PostgreSQL 18 da jonli amallar
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

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("11-bob. 2-qism", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL Terminalida Jonli Kod", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("O'zbek alifbosi tartibi, turkcha ı va takrorlanmas email", 960, 395, { size: 40, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kTerm = P(t, W('L1', 'terminalida'), 0.8);
    withA(kTerm, () => {
      // Chap: Terminal
      term(140, 480, 800, 440, "psql: PostgreSQL 18.6 sozlamalari", [{
        b: {
          cmd: "SHOW server_encoding;\nSHOW client_encoding;\nSELECT datcollate, datlocprovider FROM pg_database WHERE datname = current_database();",
          out: [
            " server_encoding | client_encoding ",
            "-----------------+-----------------",
            " UTF8            | UTF8            ",
            "(1 row)",
            "",
            "  datcollate  | datlocprovider ",
            "--------------+----------------",
            " en_US.UTF-8  | c (libc)       ",
            "(1 row)"
          ]
        },
        t: kTerm,
        typeDur: 1.0
      }], { font: 16 });

      // O'ng: Reja kartasi
      card(980, 480, 800, 440, { fill: C.card, col: C.blue, p: kTerm });
      pill("JONLI SINAYDIGAN MAVZULARIMIZ", 1280, 535, C.blue, kTerm, 22);
      text("• O'zbekcha so'zlarni C, en_US va uz-Latn ICU bilan saralash.", 1020, 605, { size: 22, color: C.ink, wrap: 720 });
      text("• 'oʻ', 'gʻ', 'sh', 'ch' harflarining alifbo oxiriga joylashishi.", 1020, 660, { size: 22, weight: 700, color: C.green, wrap: 720 });
      text("• Turk tilida lower('ISTANBUL') -> 'ıstanbul' nuqtasiz ı.", 1020, 715, { size: 22, color: C.purple, wrap: 720 });
      text("• Nondeterministik CI collation orqali UNIQUE(email) himoyasi.", 1020, 770, { size: 22, color: C.red, weight: 600, wrap: 720 });
    });
  }

  // 2. UZ_SORT: O'ZBEKCHA SARALASH
  function sUzSort(t) {
    heading("O'zbekcha So'zlarni To'g'ri Saralash", t, L('L3').s - 0.4);

    const k1 = P(t, W('L3', 'kiritib'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "psql: 3 xil Collation bo'yicha saralash", [{
        b: {
          cmd: "SELECT string_agg(s, ', ' ORDER BY s COLLATE \"C\") AS c_tartib FROM sozlar;\nSELECT string_agg(s, ', ' ORDER BY s COLLATE \"uz-Latn-x-icu\") AS uz_icu FROM sozlar;",
          out: [
            "-- 1. COLLATE \"C\" (bayt kodi bo'yicha):",
            "Anor, Oʻrik, banan, choy, gilos, gʻoz, olma, sabzi, shaftoli, zarda",
            "",
            "-- 2. COLLATE \"uz-Latn-x-icu\" (O'zbek alifbosi!):",
            "Anor, banan, gilos, olma, sabzi, zarda, Oʻrik, gʻoz, shaftoli, choy",
            "(1 row)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L4', 'lotin'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.green, p: k2 });
      hand("Saralash Natijalari Farqi", 1020, 290, { size: 28, color: C.green, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.red, p: k2 });
      text("COLLATE \"C\" va en_US (Inglizcha)", 1050, 375, { size: 21, weight: 700, color: C.red });
      text("C tartibida katta harflar oldin chiqadi (Anor, Oʻrik, banan...).", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("en_US da esa 'choy' c da, 'oʻrik' o da turadi (o'zbek alifbosiga xilof).", 1050, 450, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("COLLATE \"uz-Latn-x-icu\" (O'zbek tili)", 1050, 540, { size: 21, weight: 700, color: C.green });
      text("O'zbek alifbosi: a, b, ..., z, oʻ, gʻ, sh, ch.", 1050, 580, { size: 20, color: C.ink, wrap: 660 });
      text("Oʻrik, gʻoz, shaftoli, choy to'g'ri eng oxiriga o'tdi!", 1050, 615, { size: 19, weight: 700, color: C.green, wrap: 660 });
    });

    const k3 = P(t, W('L4', 'joylashadi'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Amaliy qoida: O'zbekcha ro'yxatlarni to'g'ri tartiblash!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("Foydalanuvchilar, kitoblar yoki mahsulotlar ro'yxatini alifbo bo'yicha chiqarishda:", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("ORDER BY nom COLLATE \"uz-Latn-x-icu\" yozsangiz, o'zbek tilining barcha qoidalari 100% to'g'ri ishlaydi.", 180, 855, { size: 21, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 3. CASE TURK: KATTA-KICHIK HARF VA TURKCHA I
  function sCaseTurk(t) {
    heading("Katta-Kichik Harf va Mintaqaviy Xususiyatlar", t, L('L5').s - 0.4);

    const k1 = P(t, W('L5', 'kollatsiyasini'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "psql: lower() va turkcha ı", [{
        b: {
          cmd: "SELECT upper('oʻzbek') AS u, lower('ISTANBUL') AS l, lower('ISTANBUL' COLLATE \"tr-x-icu\") AS turk;",
          out: [
            "   u    |    l     |   turk   ",
            "--------+----------+----------",
            " OʻZBEK | istanbul | ıstanbul ",
            "(1 row)",
            "",
            "-- Turk tilida katta I ning kichigi: ı (nuqtasiz!)",
            "-- Standart en_US da esa: i (nuqtali)"
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 15 });
    });

    const k2 = P(t, W('L5', 'aylanadi'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Mintaqaga Bog'liq Registr", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("Turk Tili Qoidasi: I -> ı", 1050, 375, { size: 21, weight: 700, color: C.purple });
      text("Turk alifbosida ikkita mustaqil harf bor: I/ı (nuqtasiz) va İ/i (nuqtali).", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("Oddiy lower('ISTANBUL') -> 'istanbul' deb noto'g'ri o'giradi.", 1050, 445, { size: 19, color: C.soft, wrap: 660 });
      text("tr-x-icu kollatsiyasida esa to'g'ri 'ıstanbul' chiqadi!", 1050, 470, { size: 19, color: C.green, weight: 700, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.blue, p: k2 });
      text("O'zbekcha 'oʻ' va 'gʻ' Harflari", 1050, 540, { size: 21, weight: 700, color: C.blue });
      text("upper('oʻzbek') -> 'OʻZBEK' deb to'g'ri o'giriladi.", 1050, 580, { size: 20, color: C.ink, wrap: 660 });
      text("Teskari tutuq belgisi o'z joyida to'g'ri saqlanadi.", 1050, 615, { size: 19, color: C.soft, wrap: 660 });
    });

    const k3 = P(t, W('L5', 'aylanadi'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.purple, p: k3 });
      text("Xulosa: Harflarni o'zgartirish har doim ham oddiy ASCII emas!", 180, 755, { size: 25, weight: 700, color: C.purple });
      text("Ko'p tilli loyihalarda mijoz tiliga mos collation ko'rsatilsa, foydalanuvchi ismlari va manzillari aynan o'sha til madaniyatiga muvofiq qayta ishlanadi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("PostgreSQL 18 ning ICU integratsiyasi buni to'liq ta'minlaydi.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 4. CI UNIQUE: NONDETERMINISTIK COLLATION VA EMAIL
  function sCiUnique(t) {
    heading("Nondeterministik CI Collation va Takrorlanmas Email", t, L('L6').s - 0.4);

    const k1 = P(t, W('L6', 'yaratish'), 0.5);
    withA(k1, () => {
      term(140, 230, 800, 440, "psql: CI Collation va UNIQUE cheklovi", [{
        b: {
          cmd: "CREATE COLLATION ci (provider = icu, locale = 'und-u-ks-level2', deterministic = false);\nCREATE TABLE foydalanuvchilar (email text COLLATE ci UNIQUE);\nINSERT INTO foydalanuvchilar VALUES ('Ali@Mail.uz');\nINSERT INTO foydalanuvchilar VALUES ('ali@mail.uz');",
          out: [
            "CREATE COLLATION",
            "CREATE TABLE",
            "INSERT 0 1   -- 'Ali@Mail.uz' muvaffaqiyatli kiritildi",
            "",
            "ERROR:  duplicate key value violates unique constraint \"foydalanuvchilar_email_key\"",
            "DETAIL: Key (email)=(ali@mail.uz) already exists."
          ]
        },
        t: k1,
        typeDur: 1.0
      }], { font: 14 });
    });

    const k2 = P(t, W('L7', 'takroriy'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.blue, p: k2 });
      hand("CI Collation Qanday Ishlaydi?", 1020, 290, { size: 28, color: C.blue, p: k2 });

      card(1020, 335, 720, 150, { fill: '#fff', col: C.green, p: k2 });
      text("1. Nondeterministik Mantiq", 1050, 375, { size: 21, weight: 700, color: C.green });
      text("deterministic = false bo'lgani uchun baza harflar registriga qaramaydi.", 1050, 415, { size: 19, color: C.ink, wrap: 660 });
      text("'Ali@Mail.uz' va 'ali@mail.uz' bir xil qiymat deb topiladi.", 1050, 445, { size: 19, color: C.blue, weight: 700, wrap: 660 });
      text("Natijada UNIQUE cheklovi xavfsiz tarzda ishga tushadi!", 1050, 470, { size: 19, color: C.green, weight: 700, wrap: 660 });

      card(1020, 500, 720, 150, { fill: '#fff', col: C.purple, p: k2 });
      text("2. Ortiqcha Kod va Funksiyalardan Qutulish", 1050, 540, { size: 21, weight: 700, color: C.purple });
      text("Oldin har safar lower(email) deb indeks yaratish kerak edi.", 1050, 580, { size: 19, color: C.ink, wrap: 660 });
      text("Endi to'g'ridan-to'g'ri ustunga COLLATE ci berishning o'zi yetarli.", 1050, 615, { size: 19, color: C.purple, weight: 700, wrap: 660 });
    });

    const k3 = P(t, W('L7', 'xatosini'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Xavfsizlik: Foydalanuvchilar hisobini himoyalash!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("Bir xil elektron pochta katta va kichik harflar bilan ikki marta ochilishining oldi olinadi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("PostgreSQL 18 da bu kabi CI collation'lar bilan LIKE qidiruvi ham qo'llab-quvvatlanadi.", 180, 855, { size: 21, color: C.blue, weight: 700, wrap: 1560 });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L8').s - 0.4);

    const k = P(t, W('L8', 'saralash'), 0.6);
    withA(k, () => {
      card(140, 230, 520, 480, { fill: C.card, col: C.blue, p: k });
      pill("1. O'ZBEKCHA ICU", 400, 285, C.blue, k, 22);
      text("• uz-Latn-x-icu to'liq o'zbek alifbosi.", 170, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• 'oʻ', 'gʻ', 'sh', 'ch' eng oxiriga tushadi.", 170, 430, { size: 22, color: C.green, weight: 700, wrap: 460 });
      text("• ORDER BY da doimo aniq ko'rsating.", 170, 510, { size: 22, color: C.blue, weight: 700, wrap: 460 });

      card(700, 230, 520, 480, { fill: C.card, col: C.purple, p: k });
      pill("2. REGISTR AMALLARI", 960, 285, C.purple, k, 22);
      text("• upper() va lower() mintaqaga qaraydi.", 730, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• Turkcha I nuqtasiz ı ga aylanadi.", 730, 430, { size: 22, color: C.purple, weight: 700, wrap: 460 });
      text("• Unicode harflari to'liq saqlanadi.", 730, 510, { size: 22, color: C.ink, wrap: 460 });

      card(1260, 230, 520, 480, { fill: C.card, col: C.green, p: k });
      pill("3. CI UNIQUE HIMOYASI", 1520, 285, C.green, k, 22);
      text("• Nondeterministik ci collation.", 1290, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• Email takrorlanishining oldini oladi.", 1290, 430, { size: 22, color: C.green, weight: 700, wrap: 460 });
      text("• PostgreSQL 18 da LIKE bilan ishlaydi.", 1290, 510, { size: 22, color: C.blue, weight: 700, wrap: 460 });

      card(140, 740, 1640, 170, { fill: '#fff', col: C.blue, p: k });
      text("Keyingi qismda: Dialektlar taqqoslash doskasi!", 180, 790, { size: 25, weight: 700, color: C.blue });
      text("MySQL utf8mb4 vs utf8mb3 xatosi, sukut bo'yicha case-insensitive mantiq va SQLite NOCASE bilan tanishamiz.", 180, 840, { size: 22, color: C.ink, wrap: 1560 });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.uz_sort.s) sIntro(t);
    else if (t < TM.scenes.case_turk.s) sUzSort(t);
    else if (t < TM.scenes.ci_unique.s) sCaseTurk(t);
    else if (t < TM.scenes.xulosa.s) sCiUnique(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("11-bob: Kodlash va Collation — Kod", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("PostgreSQL 18 psql da o'zbekcha saralash va CI collation sinovlari", 960, 290, { size: 38, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("O'zbekcha Saralash", 180, 440, { size: 32, color: C.blue });
    text("• C tartib: baytlar bo'yicha\n• en_US: ingliz alifbosi\n• uz-Latn-x-icu: O'zbek tili\n• oʻ, gʻ, sh, ch oxirida\n• string_agg(ORDER BY ...)", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("UZBEK ICU SORT", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("lower() va Turkcha ı", 750, 440, { size: 32, color: C.purple });
    text("• upper('oʻzbek') -> OʻZBEK\n• lower('ISTANBUL')\n• tr-x-icu: ıstanbul\n• Nuqtasiz ı harfi\n• Xalqaro til qoidalari", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("TURKISH I MAPPING", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("CI UNIQUE(email)", 1320, 440, { size: 32, color: C.green });
    text("• deterministic = false\n• 'Ali' = 'ali' -> TRUE\n• UNIQUE cheklovi ishlaydi\n• Duplicate key xatosi\n• LIKE qidiruvi qo'llangan", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("CI EMAIL UNIQUE", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
