// SQL 6-bob 1-qism: "Tushuncha" — Raqamli ma'lumot turlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, codeCard, outCard, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("6-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Raqamli Ma'lumot Turlari", 960, 370, { size: 96, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Butun, Aniq va Taqribiy Kasr Sonlar", 960, 480, { size: 50, align: 'center', p: P(t, 1.2, 1.2) });
    marker(480, 520, 960 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L2', 'butun'), 0.8);
    withA(kBadges, () => {
      pill("1. Butun sonlar: INT", 460, 640, C.blue, kBadges, 26);
      pill("2. Aniq kasrlar: NUMERIC", 960, 640, C.green, kBadges, 26);
      pill("3. Taqribiy: FLOAT / DOUBLE", 1460, 640, C.orange, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'hisob-kitobdagi'), 0.8);
    withA(kDesc, () => {
      card(280, 740, 1360, 200, { fill: C.card, col: C.blue, p: kDesc });
      text("Xotira hajmi, oraliqdan chiqish xatosi va yaxlitlash qoidalari", 960, 800, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Nega 0.1 + 0.2 ≠ 0.3 va pul hisoblarida nima uchun faqat NUMERIC ishlatiladi?", 960, 860, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. INTEGERS
  function sIntegers(t) {
    heading("Butun Sonlar: smallint, integer, bigint", t, L('L3').s - 0.4);

    const types = [
      { name: "smallint", bytes: "2 bayt", range: "−32 768 … +32 767", desc: "Faqat disk joyi o'ta tanqis bo'lganda", col: C.purple, at: W('L3', 'smol-int') },
      { name: "integer", bytes: "4 bayt", range: "−2 147 483 648 … +2 147 483 647", desc: "Standart va eng yaxshi tanlov (miqdor, hisob)", col: C.blue, at: W('L3', 'intijer') },
      { name: "bigint", bytes: "8 bayt", range: "−9.22 × 10¹⁸ … +9.22 × 10¹⁸", desc: "Katta jadvallar va birlamchi kalitlar (ID) uchun", col: C.green, at: W('L3', 'big-int') }
    ];

    types.forEach((tp, i) => {
      const k = P(t, tp.at, 0.5);
      withA(k, () => {
        const x = 140 + i * 560, y = 230;
        card(x, y, 520, 440, { fill: C.card, col: tp.col, p: k });
        pill(tp.name, x + 160, y + 60, tp.col, k, 24);
        pill(tp.bytes, x + 400, y + 60, C.soft, k, 20);

        text("Oralig'i:", x + 40, y + 140, { size: 22, weight: 700, color: C.soft });
        text(tp.range, x + 40, y + 185, { size: 22, fam: MONO, weight: 600, color: C.ink, wrap: 440 });

        sline(x + 40, y + 250, x + 480, y + 250, { p: 1, w: 1, col: 'rgba(0,0,0,0.1)' });

        text("Qo'llanilishi:", x + 40, y + 290, { size: 22, weight: 700, color: C.soft });
        text(tp.desc, x + 40, y + 340, { size: 24, color: C.ink, wrap: 440 });
      });
    });

    // Ogohlantirish kartasi: ID to'lib qolishi
    const kWarn = P(t, W('L4', 'ikki'), 0.5);
    withA(kWarn, () => {
      card(140, 710, 1640, 230, { fill: '#fff9e6', col: C.orange, p: kWarn });
      pill("MUHIM TAVSIYA: ID VA BIGINT", 380, 760, C.orange, kWarn, 22);
      text("• Odatdagi miqdorlar (soni, yoshi) uchun integer ayni muddao.", 180, 815, { size: 24, color: C.ink });
      text("• Lekin katta jadvallarda (buyurtmalar, tranzaksiyalar) ID ni boshidanoq BIGINT qiling!", 180, 860, { size: 24, weight: 700, color: C.red });
      text("• Aks holda 2.14 milliard yozuvdan keyin har bir yangi INSERT xato berib tizim to'xtaydi.", 180, 905, { size: 22, color: C.soft });
    });
  }

  // 3. NUMERIC
  function sNumeric(t) {
    heading("Aniq Kasr Sonlar: numeric(precision, scale)", t, L('L5').s - 0.4);

    // Asosiy formula kartasi
    const kFormula = P(t, W('L5', 'nyumerik'), 0.6);
    withA(kFormula, () => {
      card(140, 230, 800, 440, { fill: '#f0fdf4', col: C.green, p: kFormula });
      hand("NUMERIC(precision, scale)", 180, 285, { size: 34, color: C.green, p: kFormula });
      pill("Masalan: numeric(10, 2)", 350, 350, C.green, kFormula, 22);

      text("• precision: Sondagi barcha raqamlar soni (jami 10 ta)", 180, 420, { size: 22, color: C.ink });
      text("• scale: Verguldan keyingi kasr xonalar soni (2 ta)", 180, 470, { size: 22, color: C.ink });
      text("• Butun qism: precision − scale = 8 ta raqam sig'adi", 180, 520, { size: 22, weight: 600, color: C.blue });
      text("• Oraliq: −99 999 999.99 dan +99 999 999.99 gacha", 180, 570, { size: 22, fam: MONO, color: C.ink });
    });

    // O'ng tomon: Yaxlitlash va xato misoli
    const kRules = P(t, W('L7', 'qiymat'), 0.5);
    withA(kRules, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.blue, p: kRules });
      hand("numeric(5, 2) qoidalari", 1020, 285, { size: 32, color: C.blue, p: kRules });

      card(1020, 340, 720, 80, { fill: '#fff', col: C.green, p: kRules });
      text("123.456 kiritilsa → 123.46 bo'lib yaxlitlanadi", 1050, 380, { size: 22, fam: MONO, weight: 600, color: C.green });

      card(1020, 440, 720, 80, { fill: '#fff', col: C.green, p: kRules });
      text("999.994 kiritilsa → 999.99 sig'adi", 1050, 480, { size: 22, fam: MONO, weight: 600, color: C.green });

      card(1020, 540, 720, 90, { fill: '#fef2f2', col: C.red, p: kRules });
      text("999.995 kiritilsa → 1000.00 bo'lib to'lib ketadi!", 1050, 575, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("ERROR: numeric field overflow", 1050, 605, { size: 18, fam: MONO, color: C.red });
    });

    // Pastki xulosa: Moliyaviy aniqlik
    const kFoot = P(t, W('L8', 'mutlaq'), 0.5);
    withA(kFoot, () => {
      card(140, 700, 1640, 240, { fill: '#eff6ff', col: C.blue, p: kFoot });
      pill("MOLIYA VA PUL STANDARTI", 340, 750, C.blue, kFoot, 22);
      text("• NUMERIC qo'shish, ayirish va ko'paytirishda mutlaq aniq natija beradi.", 180, 805, { size: 24, weight: 700, color: C.ink });
      text("• Bir tiyin ham yo'qolmaydi, yaxlitlash xatolari to'planib ketmaydi.", 180, 850, { size: 23, color: C.ink });
      text("• DECIMAL va NUMERIC sinonimdir — ikkalasi ham SQL standartida mavjud.", 180, 895, { size: 21, color: C.soft });
    });
  }

  // 4. FLOATS
  function sFloats(t) {
    heading("Taqribiy Kasrlar: real, double precision va 0.1 + 0.2", t, L('L9').s - 0.4);

    // Chap tomon: IEEE 754 ikkilik kasr siri
    const k1 = P(t, W('L9', 'rial'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 440, { fill: C.card, col: C.orange, p: k1 });
      hand("IEEE 754 Ikkilik Kasrlar", 180, 285, { size: 32, color: C.orange, p: k1 });

      text("• real (4 bayt): ~6 ta o'nlik raqam aniqligi", 180, 350, { size: 23, color: C.ink });
      text("• double precision (8 bayt): ~15 ta o'nlik raqam aniqligi", 180, 400, { size: 23, color: C.ink });
      text("• Kompyuter sonlarni 2 asosida (ikkilik) saqlaydi.", 180, 450, { size: 23, color: C.ink });
      text("• O'nlikdagi 0.1 ikkilikda cheksiz davriy songa aylanadi:", 180, 500, { size: 22, color: C.soft });
      text("0.000110011001100110011...", 180, 545, { size: 22, fam: MONO, weight: 700, color: C.purple });
      text("Chunki 1/10 kasr ikkining darajalariga to'liq bo'linmaydi!", 180, 595, { size: 21, color: C.red });
    });

    // O'ng tomon: 0.1 + 0.2 jonli taqqoslash
    const k2 = P(t, W('L11', 'to‘rt'), 0.5);
    withA(k2, () => {
      card(960, 230, 820, 440, { fill: '#fff9e6', col: C.red, p: k2 });
      hand("Kutilmagan Natija: 0.1 + 0.2", 1000, 285, { size: 32, color: C.red, p: k2 });

      // Terminal 1: numeric
      card(1000, 340, 740, 110, { fill: '#fff', col: C.green, p: k2 });
      text("SELECT 0.1 + 0.2;  (NUMERIC)", 1030, 375, { size: 20, fam: MONO, color: C.soft });
      text("→ 0.3              (MUTLAQ ANIQ!)", 1030, 415, { size: 26, fam: MONO, weight: 700, color: C.green });

      // Terminal 2: float8
      card(1000, 470, 740, 110, { fill: '#fff', col: C.red, p: k2 });
      text("SELECT 0.1::float8 + 0.2::float8;  (DOUBLE)", 1030, 505, { size: 20, fam: MONO, color: C.soft });
      text("→ 0.30000000000000004  (TAQRIBIY!)", 1030, 545, { size: 24, fam: MONO, weight: 700, color: C.red });

      // Tenglik
      card(1000, 600, 740, 60, { fill: '#fef2f2', col: C.red, p: k2 });
      text("0.1::float8 + 0.2::float8 = 0.3::float8  -->  FALSE!", 1030, 630, { size: 20, fam: MONO, weight: 700, color: C.red });
    });

    // Pastki xavfsizlik kartasi
    const kWarn = P(t, W('L12', 'xavfli'), 0.5);
    withA(kWarn, () => {
      card(140, 700, 1640, 240, { fill: '#fef2f2', col: C.red, p: kWarn });
      pill("QAT'IY QOIDA: PULGA FLOAT ISHLATILMAYDI!", 460, 750, C.red, kWarn, 22);
      text("1. Kasr sonlarni hech qachon tenglik (=) bilan solishtirmang (faqat oraliq: abs(a - b) < 0.0001).", 180, 805, { size: 23, weight: 700, color: C.ink });
      text("2. Pul, hisob-kitob, balans va narxlarga FLOAT yoki REAL qo'ymang — yig'indilarda pullar yo'qoladi!", 180, 850, { size: 23, weight: 700, color: C.red });
      text("3. Taqribiy sonlar faqat tezlik va xotira muhim bo'lgan ilmiy hisoblar va sensorlar uchundir.", 180, 895, { size: 21, color: C.soft });
    });
  }

  // 5. MONEY
  function sMoney(t) {
    heading("PostgreSQL money Tipi va Mintaqa Xavflari", t, L('L13').s - 0.4);

    // Chap tomon: money tipi va mintaqa sozlamasi (Daftar uslubi)
    const k1 = P(t, W('L13', 'mani'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 420, { fill: C.card, col: C.blue, p: k1 });
      hand("PostgreSQL money Tipi va Formatlash", 180, 280, { size: 30, color: C.blue, p: k1 });
      text("money tipi ko'rinishi serverning lc_monetary sozlamasiga bog'liq:", 180, 325, { size: 21, color: C.soft, wrap: 720 });

      // Kod bloki
      codeCard(170, 355, 740, [
        "SHOW lc_monetary;       -- en_US.UTF-8",
        "SELECT 12.345::money;   -- $12.35",
        "SELECT '1000'::money / 3; -- $333.33"
      ], { a: k1, size: 21 });

      card(170, 550, 740, 85, { fill: '#f8fafc', col: C.blue, p: k1 });
      text("Valyuta belgisi ($) va 2 xonali yaxlitlash bazaning o'zida yuz beradi.", 195, 595, { size: 19, color: C.ink, wrap: 690 });
    });

    // O'ng tomon: 2 ta jiddiy xavf
    const k2 = P(t, W('L14', 'lokaliga'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 420, { fill: '#fff9e6', col: C.orange, p: k2 });
      hand("money Tipining 2 ta Katta Xavfi", 1020, 285, { size: 30, color: C.orange, p: k2 });

      card(1020, 340, 720, 130, { fill: '#fff', col: C.red, p: k2 });
      pill("1. DUMP VA LOKAL XAVFI", 1180, 375, C.red, k2, 18);
      text("Server mintaqasi (lc_monetary) boshqacha bo'lsa,", 1040, 415, { size: 20, color: C.ink });
      text("zaxira nusxa (dump) tiklanmasdan xato berishi mumkin!", 1040, 445, { size: 20, weight: 700, color: C.red });

      card(1020, 490, 720, 140, { fill: '#fff', col: C.orange, p: k2 });
      pill("2. BO'LISHDA KASR KESILISHI", 1210, 525, C.orange, k2, 18);
      text("money butun songa bo'linganda kasr qismi yaxlitlanmaydi,", 1040, 565, { size: 20, color: C.ink });
      text("balki shafqatsizlarcha kesib tashlanadi (truncation).", 1040, 595, { size: 20, color: C.ink });
    });

    // Pastki xulosa
    const kFoot = P(t, W('L15', 'kesib'), 0.5);
    withA(kFoot, () => {
      card(140, 680, 1640, 260, { fill: C.card, col: C.green, p: kFoot });
      hand("Hujjat Tavsiyasi", 180, 735, { size: 30, color: C.green, p: kFoot });
      text("• Pul summalari uchun PostgreSQL rasmiy hujjati NUMERIC tipini tavsiya etadi.", 180, 790, { size: 23, weight: 700, color: C.ink });
      text("• NUMERIC mintaqaga (lokalga) bog'liq emas, barcha serverlarda bir xil ishlaydi va aniq yaxlitlaydi.", 180, 835, { size: 23, color: C.ink });
      text("• Valyuta belgisini ($ yoki so'm) bazada emas, frontendda formatlash eng to'g'ri arxitekturadir.", 180, 880, { size: 22, color: C.blue });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L16').s - 0.4);

    const pillars = [
      { tit: "Butun sonlar", sub: "INTEGER & BIGINT", desc: "Odatdagi hisobga integer, katta jadvallardagi identifikatorlarga (ID) esa boshidanoq bigint.", col: C.blue },
      { tit: "Aniq kasrlar", sub: "NUMERIC(p, s)", desc: "Pul, valyuta va barcha moliyaviy hisob-kitoblar uchun yagona to'g'ri tanlov. Tiyinlar yo'qolmaydi.", col: C.green },
      { tit: "Taqribiy kasrlar", sub: "REAL & DOUBLE", desc: "Faqat ilmiy hisoblar va fizik o'lchovlar uchun. 0.1 + 0.2 ≠ 0.3 sababli pul uchun aslo ishlatmang.", col: C.orange }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L16', 'butun') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 560, y = 250;
        card(x, y, 520, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 40, y + 60, { size: 36, color: p.col, p: k });
        pill(p.sub, x + 260, y + 120, p.col, k, 20);
        text(p.desc, x + 40, y + 210, { size: 24, color: C.ink, wrap: 440 });
      });
    });

    const kNext = P(t, W('L17', 'jonli'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 200, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 2-qismda: PostgreSQL psql Jonli Sinovlari", 180, 785, { size: 36, color: C.blue, p: kNext });
      text("0.1 + 0.2, oraliqdan chiqish (overflow), numeric yaxlitlash, 10 / 4 bo'lish va round() farqlarini terminalda ko'ramiz.", 180, 850, { size: 26, color: C.ink });
      pill("06-2 KOD", 1560, 785, C.blue, kNext, 22);
    });
  }

  function render(t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.integers.s) sIntro(t);
    else if (t < TM.scenes.numeric.s) sIntegers(t);
    else if (t < TM.scenes.floats.s) sNumeric(t);
    else if (t < TM.scenes.money.s) sFloats(t);
    else if (t < TM.scenes.xulosa.s) sMoney(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("6-bob: Raqamlar — Tushuncha", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("Butun sonlar, aniq kasrlar (numeric) va taqribiy kasrlar (float)", 960, 300, { size: 44, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.blue });
    hand("Butun Sonlar", 180, 460, { size: 34, color: C.blue });
    text("• smallint (2 bayt)\n• integer (4 bayt)\n• bigint (8 bayt)\n• ID uchun bigint shart!\n• Oraliqdan chiqish xatosi", 180, 540, { size: 22, fam: MONO, color: C.ink });
    pill("INT & BIGINT", 390, 830, C.blue, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.green });
    hand("Aniq Kasrlar", 750, 460, { size: 34, color: C.green });
    text("• NUMERIC(precision, scale)\n• Pul va moliya standarti\n• Mutlaq aniq hisob\n• Avtomatik yaxlitlash\n• Overflow xatosi", 750, 540, { size: 22, fam: MONO, color: C.ink });
    pill("NUMERIC / DECIMAL", 960, 830, C.green, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.orange });
    hand("Taqribiy Kasrlar", 1320, 460, { size: 34, color: C.orange });
    text("• real (4 bayt)\n• double precision (8 bayt)\n• 0.1 + 0.2 = 0.3000...04\n• Tenglik tekshirish xavfi\n• Pul uchun ishlatilmaydi!", 1320, 540, { size: 20, fam: MONO, color: C.ink });
    pill("FLOAT / DOUBLE", 1530, 830, C.orange, 1, 20);

    pill("SQL Ma'lumot Turlari", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
