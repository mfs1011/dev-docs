// SQL 4-bob 1-qism: "Tushuncha" — SQL sintaksisi, Tokenlar, Identifikatorlar, Literallar va Ustuvorlik
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("4-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("SQL sintaksisi", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Tokenlar, Identifikatorlar, Literallar va Ustuvorlik", 960, 510, { size: 54, align: 'center', p: P(t, 1.2, 1.2) });
    marker(500, 550, 920 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'sintaksisi'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL 18.6", 660, 680, C.blue, kBadges, 28);
      pill("MySQL 9.7.2", 960, 680, C.orange, kBadges, 28);
      pill("SQLite 3.54.0", 1260, 680, C.teal, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'qoidalarini'), 0.8);
    withA(kDesc, () => {
      card(380, 780, 1160, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("SQL tili leksik tuzilishi: buyruqlar, nuqtali vergul va tokenlar", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Katta-kichik harf qoidalari, qo'shtirnoq siri, escape satrlar va operatorlar tartibi", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. TOKENLAR
  function sTokenlar(t) {
    heading("Buyruq, Tokenlar va Nuqtali vergul", t, L('L2').s - 0.4);

    const kCmd = P(t, W('L2', 'buyruqlar'), 0.6);
    withA(kCmd, () => {
      card(140, 230, 1640, 170, { fill: C.card, col: C.blue, p: kCmd });
      hand("SQL buyrug'i nuqtali vergul bilan tugaydi", 180, 280, { size: 32, color: C.blue, p: kCmd });
      text("SELECT * FROM mahsulot;  UPDATE narx SET sum = 100;  INSERT INTO savat VALUES (1);", 180, 345, { size: 28, weight: 700, fam: MONO, color: C.ink });
      pill(";  (Buyruq chegarasi)", 1500, 280, C.blue, kCmd, 22);
    });

    const tokens = [
      { tit: "Kalit so'z", sub: "Qat'iy ma'noli so'z", ex: "SELECT, UPDATE, VALUES", col: C.blue, w: 'kalit' },
      { tit: "Identifikator", sub: "Obyekt nomi", ex: "mahsulot, narx, talaba", col: C.green, w: 'identifikatorlar' },
      { tit: "Literal", sub: "O'zgarmas qiymat", ex: "'Salom', 42, 3.14", col: C.orange, w: 'literallar' },
      { tit: "Maxsus belgi", sub: "Operatorlar va tinish", ex: "; , . ( ) + - * /", col: C.purple, w: 'maxsus' }
    ];

    tokens.forEach((tk, i) => {
      const k = P(t, W('L3', tk.w), 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 440;
        card(x, y, 380, 250, { fill: C.card, col: tk.col, p: k });
        hand(tk.tit, x + 30, y + 55, { size: 34, color: tk.col, p: k });
        text(tk.sub, x + 30, y + 105, { size: 22, weight: 600, color: C.soft });
        sline(x + 30, y + 135, x + 350, y + 135, { col: '#e5e7eb', w: 2 });
        text("Misol:", x + 30, y + 170, { size: 20, color: C.soft });
        pill(tk.ex, x + 190, y + 210, tk.col, k, 18);
      });
    });

    // Izohlar token emas
    const kComm = P(t, W('L4', 'izohlar'), 0.6);
    withA(kComm, () => {
      card(140, 730, 1640, 190, { fill: '#fef2f2', col: C.red, p: kComm });
      pill("DIQQAT", 230, 780, C.red, kComm, 22);
      text("Izohlar token emas — ular SQL tahlilchisi uchun oddiy bo'sh joyga teng!", 330, 785, { size: 26, weight: 700, color: C.red });
      
      text("-- Bir qatorli izoh (standart SQL)", 180, 840, { size: 24, fam: MONO, color: '#4b5563' });
      text("/* Ko'p qatorli izoh (PostgreSQL'da ichma-ich bo'lishi mumkin) */", 180, 885, { size: 24, fam: MONO, color: '#4b5563' });
      pill("Bo'sh joyga teng", 1520, 860, C.soft, kComm, 20);
    });
  }

  // 3. IDENTIFIKATOR
  function sIdentifikator(t) {
    heading("Kalit so'z vs Identifikator", t, L('L5').s - 0.4);

    // Chap: Kalit so'z
    const kKey = P(t, W('L5', 'kalit'), 0.6);
    withA(kKey, () => {
      card(140, 240, 780, 360, { fill: C.card, col: C.blue, p: kKey });
      hand("Kalit so'z (Key Word)", 180, 295, { size: 36, color: C.blue, p: kKey });
      text("SQL tilining grammatikasi va tuzilishi", 180, 350, { size: 24, color: C.soft });
      
      pill("SELECT", 280, 420, C.blue, kKey, 24);
      pill("UPDATE", 460, 420, C.blue, kKey, 24);
      pill("VALUES", 640, 420, C.blue, kKey, 24);

      pill("FROM", 280, 490, C.blue, kKey, 24);
      pill("WHERE", 460, 490, C.blue, kKey, 24);
      pill("ORDER BY", 650, 490, C.blue, kKey, 24);

      text("• Standart hech qachon raqamli yoki _ bilan boshlanuvchi kalit so'z kiritmaydi", 180, 560, { size: 20, color: C.soft });
    });

    // O'ng: Identifikator
    const kId = P(t, W('L6', 'identifikator'), 0.6);
    withA(kId, () => {
      card(980, 240, 800, 360, { fill: C.card, col: C.green, p: kId });
      hand("Identifikator (Identifier)", 1020, 295, { size: 36, color: C.green, p: kId });
      text("Baza obyektlarining nomi: jadval, ustun, indeks", 1020, 350, { size: 24, color: C.soft });

      pill("mahsulot", 1120, 420, C.green, kId, 24);
      pill("narx", 1300, 420, C.green, kId, 24);
      pill("talabalar", 1480, 420, C.green, kId, 24);

      pill("foydalanuvchi_id", 1190, 490, C.green, kId, 24);
      pill("yaratilgan_sana", 1490, 490, C.green, kId, 24);

      text("• Harf yoki _ bilan boshlanadi, davomida raqam va $ bo'lishi mumkin", 1020, 560, { size: 20, color: C.soft });
    });

    // Katta-kichik harf taqqoslash
    const kCase = P(t, W('L7', 'standartida'), 0.6);
    withA(kCase, () => {
      table(140, 640, "Katta-kichik harf: Standart vs PostgreSQL", [
        { label: "Yozilishi", w: 320 },
        { label: "SQL Standarti (ISO)", w: 460 },
        { label: "PostgreSQL qoidasi", w: 460 },
        { label: "Natija", w: 400 }
      ], [
        ['FOO', 'Katta harf: FOO', 'Kichik harfga o\'giradi: foo', 'Bitta nom: foo'],
        ['foo', 'Katta harfga o\'giradi: FOO', 'Kichik harf: foo', 'Bitta nom: foo'],
        ['"FOO"', 'Aynan FOO (sezgir)', 'Aynan FOO (sezgir)', 'Alohida nom!'],
        ['"Foo"', 'Aynan Foo (sezgir)', 'Aynan Foo (sezgir)', 'Yana alohida nom!']
      ], { p: kCase });
    });
  }

  // 4. QO'SHTIRNOQ
  function sQoshtirnoq(t) {
    heading("Qo'shtirnoq siri va 63 bayt chegara", t, L('L9').s - 0.4);

    const kQuote = P(t, W('L9', 'qo‘shtirnoq'), 0.6);
    withA(kQuote, () => {
      card(140, 240, 1640, 360, { fill: C.card, col: C.purple, p: kQuote });
      hand("Nom qo'shtirnoq ichida bo'lsa: \"...\"", 180, 295, { size: 36, color: C.purple, p: kQuote });
      text("Qo'shtirnoq nomni DOIM identifikator qiladi va uni kalit so'z bo'lishdan himoyalaydi", 180, 350, { size: 24, color: C.soft });

      const feats = [
        { tit: "Kalit so'zni nom qilish", ex: 'CREATE TABLE "order" (id int);', col: C.blue },
        { tit: "Bo'sh joyli nomlar", ex: 'SELECT * FROM "buyurtma sanasi";', col: C.green },
        { tit: "Katta-kichik harfga sezgirlik", ex: '"Mahsulot" !== "mahsulot"', col: C.orange }
      ];

      feats.forEach((f, i) => {
        const x = 180 + i * 530, y = 400;
        card(x, y, 490, 160, { fill: '#f8fafc', col: f.col, p: kQuote });
        hand(f.tit, x + 25, y + 45, { size: 24, color: f.col, p: kQuote });
        text(f.ex, x + 25, y + 105, { size: 20, fam: MONO, weight: 700, color: C.ink });
      });
    });

    // 63 bayt chegara
    const kLimit = P(t, W('L12', 'oltmish'), 0.6);
    withA(kLimit, () => {
      card(140, 640, 1640, 260, { fill: '#fff9e6', col: C.orange, p: kLimit });
      pill("CHEGARA: 63 BAYT", 270, 700, C.orange, kLimit, 24);
      text("PostgreSQL'da identifikator uzunligi ko'pi bilan 63 bayt bo'lishi mumkin!", 410, 705, { size: 26, weight: 700, color: C.ink });

      text("• Agar nom 63 baytdan uzun bo'lsa, PostgreSQL xato bermaydi, balki OGOHLANTIRISH (NOTICE) berib qisqartiradi.", 180, 770, { size: 24, color: C.ink });
      text("NOTICE: identifier \"aaaaaaaa...\" will be truncated to \"aaaaaaaa...\" (63 belgiga)", 180, 830, { size: 22, fam: MONO, weight: 700, color: '#b45309' });
      pill("Jimgina qisqarish xavfi", 1470, 830, C.red, kLimit, 20);
    });
  }

  // 5. LITERALLLAR
  function sLiterallar(t) {
    heading("Satr va Son literallari", t, L('L13').s - 0.4);

    // Chap: Satr literallari
    const kStr = P(t, W('L13', 'satr'), 0.6);
    withA(kStr, () => {
      card(140, 230, 800, 720, { fill: C.card, col: C.blue, p: kStr });
      hand("Satr literallari (String)", 180, 285, { size: 36, color: C.blue, p: kStr });
      text("Bitta tirnoq '...' ichidagi matn", 180, 335, { size: 24, color: C.soft });

      const sitems = [
        { tit: "Oddiy satr (Standard)", code: "SELECT 'Ma''ruf' AS ism;", desc: "Tirnoq ichidagi tirnoq ikki marta takrorlanadi", col: C.blue },
        { tit: "Escape satr (E'... ')", code: "SELECT E'a\\nb' AS escape;", desc: "\\n yangi qator, \\t tab, \\\\ teskari chiziq", col: C.green },
        { tit: "Dollar satr ($$...$$)", code: "SELECT $$Ma'ruf \"aka\" \\n$$;", desc: "Hech narsa maxsus emas — tirnoq va belgi erkin", col: C.purple },
        { tit: "Oraliq yangi qator", code: "'Salom, ' \\n 'dunyo'  --> 'Salom, dunyo'", desc: "Orasida yangi qator bor satrlar birlashadi", col: C.orange }
      ];

      sitems.forEach((si, i) => {
        const y = 370 + i * 135;
        card(170, y, 740, 115, { fill: '#f8fafc', col: si.col, p: kStr });
        hand(si.tit, 195, y + 35, { size: 22, color: si.col, p: kStr });
        text(si.code, 195, y + 70, { size: 20, fam: MONO, weight: 700, color: C.ink });
        text(si.desc, 195, y + 98, { size: 18, color: C.soft });
      });
    });

    // O'ng: Son literallari va tiplar
    const kNum = P(t, W('L16', 'sonlarda'), 0.6);
    withA(kNum, () => {
      card(980, 230, 800, 720, { fill: C.card, col: C.green, p: kNum });
      hand("Son literallari va Tiplar", 1020, 285, { size: 36, color: C.green, p: kNum });
      text("Butun, kasr va turli sanoq tizimlari", 1020, 335, { size: 24, color: C.soft });

      const nitems = [
        { tit: "Tagchiziq ajratuvchi", code: "1_000_000", desc: "Ko'z bilan o'qishni osonlashtiradi", col: C.green },
        { tit: "O'n oltilik (Hex)", code: "0xFF  --> 255", desc: "0x prefiksi bilan butun son", col: C.blue },
        { tit: "Ikkilik va Sakkizlik", code: "0b1010 (10),  0o755 (493)", desc: "0b va 0o prefikslari", col: C.teal },
        { tit: "Boshlang'ich tiplar (pg_typeof)", code: "42 (int) | 3_000_000_000 (bigint) | 3.5 (numeric)", desc: "Hajm va nuqtaga qarab avtomatik tip tanlanadi", col: C.orange }
      ];

      nitems.forEach((ni, i) => {
        const y = 370 + i * 135;
        card(1010, y, 740, 115, { fill: '#f8fafc', col: ni.col, p: kNum });
        hand(ni.tit, 1035, y + 35, { size: 22, color: ni.col, p: kNum });
        text(ni.code, 1035, y + 70, { size: 20, fam: MONO, weight: 700, color: C.ink });
        text(ni.desc, 1035, y + 98, { size: 18, color: C.soft });
      });
    });
  }

  // 6. USTUVORLIK
  function sUstuvorlik(t) {
    heading("Operatorlar ustuvorligi va Bog'lanish", t, L('L17').s - 0.4);

    const kTab = P(t, W('L17', 'operatorlarning'), 0.6);
    withA(kTab, () => {
      table(140, 230, "PostgreSQL operatorlari ustuvorlik tartibi (yuqoridan pastga)", [
        { label: 'Daraja', w: 140 },
        { label: 'Operator', w: 460 },
        { label: "Ma'nosi", w: 560 },
        { label: 'Misol', w: 480 }
      ], [
        ['1 (Kuchli)', '.  ::  [ ]', 'Ajratish, tip o\'zgartirish, massiv', 't.id, val::int, arr[1]'],
        ['2', 'unar +  -', 'Son ishorasi', '+5, -10'],
        ['3', '^', 'Darajaga ko\'tarish (chapdan bog\'lanadi!)', '2 ^ 3 = 8'],
        ['4', '*  /  %', 'Ko\'paytirish, bo\'lish, qoldiq', '10 * 2, 10 % 3'],
        ['5', '+  -', 'Qo\'shish, ayirish', '5 + 3, 10 - 2'],
        ['6', 'IS, BETWEEN, IN, LIKE', 'Taqqoslash va namunalar', 'x IS NULL, y IN (1,2)'],
        ['7', '<  >  =  <=  >=  <>', 'Taqqoslash operatorlari', 'a = b, x <> y'],
        ['8 (Kuchsiz)', 'NOT  -->  AND  -->  OR', 'Mantiqiy amallar', 'NOT true AND false']
      ], { p: kTab });
    });

    // Darajaga ko'tarish tuzog'i
    const kPower = P(t, W('L19', 'darajaga'), 0.6);
    withA(kPower, () => {
      card(140, 770, 1640, 180, { fill: '#fff9e6', col: C.orange, p: kPower });
      pill("CHAPDAN BOG'LANISH: 2 ^ 3 ^ 2 = 64", 390, 825, C.orange, kPower, 24);
      text("PostgreSQL'da daraja operatori chapdan bog'lanadi:  2 ^ 3 ^ 2  =  (2 ^ 3) ^ 2  =  8 ^ 2  =  64", 180, 890, { size: 28, fam: MONO, weight: 700, color: C.ink });
      text("O'ngdan bog'lanuvchi tillarda (Python, JS): 2 ** (3 ** 2) = 512 bo'ladi. Har doim QAVS qo'ying!", 180, 930, { size: 22, color: C.soft });
    });
  }

  // 7. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L20').s - 0.4);

    const rules = [
      { num: "1", tit: "Kichik harfda yozing", desc: "PostgreSQL hamma nomlarni kichik harfga o'tkazadi: mahsulot, order_item. Aralash harflardan saqlaning.", col: C.blue },
      { num: "2", tit: "Kalit so'zlarni nom qilmang", desc: "order, user, select kabi so'zlarni nom qilmang. Qo'shtirnoq talab qilib, kod ko'chirishni qiyinlashtiradi.", col: C.orange },
      { num: "3", tit: "Standart tirnoqlar", desc: "Satr ichida tirnoq uchun ikkita bitta tirnoq ('Ma''ruf') ishlating. \\' boshqa tizimlarda ishlamaydi.", col: C.green },
      { num: "4", tit: "Shubha bo'lsa qavs qo'ying", desc: "Operatorlar ustuvorligi va bog'lanishida adashmaslik uchun ifodalarni qavsga oling: (2 ^ 3) ^ 2.", col: C.purple }
    ];

    rules.forEach((r, i) => {
      const k = P(t, W('L20', 'xulosa') + i * 0.4, 0.6);
      withA(k, () => {
        const x = 140 + i * 420, y = 240;
        card(x, y, 380, 420, { fill: C.card, col: r.col, p: k });
        sellipse(x + 60, y + 65, 30, 30, { fill: r.col });
        text(r.num, x + 60, y + 74, { size: 28, weight: 700, color: '#fff', align: 'center', fam: MONO });
        hand(r.tit, x + 30, y + 140, { size: 30, color: r.col, p: k });
        text(r.desc, x + 30, y + 230, { size: 22, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L21', 'keyingi'), 0.6);
    withA(kNext, () => {
      card(140, 710, 1640, 180, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi qismda: Jonli kod va psql terminali", 180, 770, { size: 36, color: C.blue, p: kNext });
      text("PostgreSQL 18 psql terminalida kichik harfga aylanish, kalit so'zlar, escape satrlar, 5--1 tuzog'i va ustuvorlikni sinaymiz.", 180, 835, { size: 26, color: C.ink });
      pill("04-2 KOD", 1600, 770, C.blue, kNext, 22);
    });
  }

  function render(t) {
    bg();
    if (t < TM.scenes.tokenlar.s) sIntro(t);
    else if (t < TM.scenes.identifikator.s) sTokenlar(t);
    else if (t < TM.scenes.qoshtirnoq.s) sIdentifikator(t);
    else if (t < TM.scenes.literallar.s) sQoshtirnoq(t);
    else if (t < TM.scenes.ustuvorlik.s) sLiterallar(t);
    else if (t < TM.scenes.xulosa.s) sUstuvorlik(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("4-bob: SQL sintaksisi", 960, 220, { size: 80, align: 'center', color: C.blue });
    hand("Tokenlar, Identifikatorlar, Literallar va Ustuvorlik", 960, 320, { size: 48, align: 'center', color: C.ink });
    
    // 3 ta karta
    card(140, 420, 500, 460, { fill: C.card, col: C.blue });
    hand("Tokenlar va Qoidalar", 180, 480, { size: 34, color: C.blue });
    text("• Buyruqlar ; bilan tugaydi\n• Kalit so'z vs Identifikator\n• Izohlar token emas (bo'sh joy)", 180, 560, { size: 24, color: C.ink });
    pill(";  SELECT  UPDATE", 390, 810, C.blue, 1, 22);

    card(710, 420, 500, 460, { fill: C.card, col: C.green });
    hand("Qo'shtirnoq va 63 bayt", 750, 480, { size: 34, color: C.green });
    text("• \"order\" jadval nomi\n• \"Mahsulot\" !== mahsulot\n• 63 baytda qisqarish (NOTICE)", 750, 560, { size: 24, color: C.ink });
    pill("\"order\"  |  63 bytes", 960, 810, C.green, 1, 22);

    card(1280, 420, 500, 460, { fill: C.card, col: C.orange });
    hand("Literallar va Ustuvorlik", 1320, 480, { size: 34, color: C.orange });
    text("• E'\\n' escape va $$...$$ dollar satr\n• 1_000_000 va 0xFF sonlar\n• 2 ^ 3 ^ 2 = 64 (chapdan bog'lanish)", 1320, 560, { size: 24, color: C.ink });
    pill("E'\\n'  |  2 ^ 3 ^ 2 = 64", 1530, 810, C.orange, 1, 22);

    pill("PostgreSQL 18.6", 740, 970, C.blue, 1, 24);
    pill("MySQL 9.7.2", 960, 970, C.orange, 1, 24);
    pill("SQLite 3.54.0", 1180, 970, C.teal, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
