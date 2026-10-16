// SQL 10-bob 1-qism: "Tushuncha" — NULL va tip konversiyasi
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("10-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("NULL va Tip Konversiyasi", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Uch qiymatli mantiq, taqqoslash qoidalari va tiplar xavfsizligi", 960, 395, { size: 38, align: 'center', p: P(t, 1.2, 1.2) });
    marker(380, 430, 1160 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'nul'), 0.8);
    withA(kBadges, () => {
      pill("1. NULL: aniq qiymat yo'qligi", 440, 580, C.blue, kBadges, 24);
      pill("2. 3VL: uch qiymatli mantiq", 960, 580, C.purple, kBadges, 24);
      pill("3. CAST: qat'iy tiplash", 1480, 580, C.green, kBadges, 24);
    });

    const kDesc = P(t, W('L1', 'konversiyasi'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion nazariya va SQL'dagi eng nozik, eng ko'p xato keltirib chiqaradigan mavzular:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("NULL hech qachon 0 yoki bo'sh satr emas; oddiy tenglik operatori bilan taqqoslanmaydi,", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("hamda ma'lumot turlari kutilmagan oqibatlarning oldini olish uchun aniq boshqarilishi lozim.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. NULL NATURE
  function sNullNature(t) {
    heading("NULL nima: Qiymatning yo'qligi", t, L('L2').s - 0.4);

    const k1 = P(t, W('L2', 'yo‘qligini'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      pill("UCHTA TUBDAN FARQLI HOLAT", 440, 285, C.blue, k1, 22);

      card(180, 335, 720, 95, { fill: '#fff', col: C.purple, p: k1 });
      text("NULL  -->  Noma'lum / mavjud emas", 210, 375, { size: 22, weight: 700, color: C.purple });
      text("Qiymat umuman belgilanmagan yoki noma'lum.", 210, 410, { size: 20, color: C.soft, wrap: 660 });

      card(180, 445, 720, 95, { fill: '#fff', col: C.soft, p: k1 });
      text("'' (Bo'sh satr)  -->  Aniq ma'lum bo'sh matn", 210, 485, { size: 22, weight: 700, color: C.ink });
      text("Matn tipi mavjud, uzunligi 0 bayt.", 210, 520, { size: 20, color: C.soft, wrap: 660 });

      card(180, 555, 720, 95, { fill: '#fff', col: C.soft, p: k1 });
      text("0 (Nol)  -->  Aniq ma'lum sonli miqdor", 210, 595, { size: 22, weight: 700, color: C.ink });
      text("Hisoblash mumkin bo'lgan raqam.", 210, 630, { size: 20, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L3', 'telefon'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.green, p: k2 });
      hand("Hayotiy Misol: Telefon Ustuni", 1020, 290, { size: 28, color: C.green, p: k2 });

      card(1020, 335, 720, 140, { fill: '#fff', col: C.purple, p: k2 });
      text("INSERT INTO mijozlar VALUES (..., NULL);", 1050, 375, { size: 20, fam: MONO, weight: 700, color: C.purple });
      text("Ma'nosi: telefon raqami noma'lum.", 1050, 420, { size: 21, weight: 700, color: C.ink });
      text("Mijozda telefon bo'lishi mumkin, ammo u hali kiritilmagan.", 1050, 455, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 490, 720, 140, { fill: '#fff', col: C.blue, p: k2 });
      text("INSERT INTO mijozlar VALUES (..., '');", 1050, 530, { size: 20, fam: MONO, weight: 700, color: C.blue });
      text("Ma'nosi: aniq ma'lumki, telefoni yo'q.", 1050, 575, { size: 21, weight: 700, color: C.ink });
      text("Foydalanuvchi qasddan bo'sh satr qoldirgan.", 1050, 610, { size: 19, color: C.soft, wrap: 660 });
    });

    const k3 = P(t, W('L3', 'ma’lum'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.blue, p: k3 });
      text("Xulosa: NULL na nol, na bo'sh satr!", 180, 755, { size: 26, weight: 700, color: C.blue });
      text("SQL standartiga ko'ra NULL — qiymat emas, balki qiymatning mavjud emaslik holati (state of missing value) hisoblanadi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Unga qo'shilgan, ko'paytirilgan yoki oddiy solishtirilgan har qanday ifoda yana NULL beradi.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 3. THREE-VALUED LOGIC (3VL)
  function sThreeLogic(t) {
    heading("Uch Qiymatli Mantiq (3VL) va Haqiqat Jadvallari", t, L('L4').s - 0.4);

    const k1 = P(t, W('L4', 'uchta'), 0.5);
    withA(k1, () => {
      card(140, 230, 780, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("Mantiqiy Holatlar (TRUE, FALSE, NULL)", 180, 290, { size: 26, color: C.blue, p: k1 });

      const cols = [{ label: 'Ifoda', w: 220 }, { label: 'Natija', w: 140 }, { label: 'Qoida', w: 360 }];
      const rows = [
        ['TRUE AND NULL', 'NULL', "Noma'lumga bog'liq"],
        ['FALSE AND NULL', 'FALSE', "Yolg'on yengadi"],
        ['TRUE OR NULL', 'TRUE', "Bitta TRUE yetarli"],
        ['FALSE OR NULL', 'NULL', "Noma'lumga bog'liq"],
        ['NOT NULL', 'NULL', "Natija ham noma'lum"]
      ];
      table(170, 330, "Mantiqiy amallar jadvali", cols, rows, {
        row: (i) => ({
          hl: i === 1 || i === 2,
          hlCol: i === 1 ? C.red : C.green,
          cellCol: (j) => j === 1 ? (i === 1 ? C.red : (i === 2 ? C.green : C.purple)) : C.ink
        })
      });
    });

    const k2 = P(t, W('L5', 'fols'), 0.5);
    withA(k2, () => {
      card(960, 230, 820, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Oddiy Tushunish Qoidasi", 1000, 290, { size: 26, color: C.purple, p: k2 });

      card(1000, 335, 740, 140, { fill: '#fff', col: C.red, p: k2 });
      text("FALSE AND noma'lum  -->  FALSE", 1030, 380, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Noma'lum rost bo'lsa ham, yolg'on bo'lsa ham — natija aniq yolg'on!", 1030, 425, { size: 20, color: C.ink, wrap: 680 });
      text("Shuning uchun FALSE and har qanday narsa = FALSE.", 1030, 455, { size: 19, color: C.soft, wrap: 680 });

      card(1000, 490, 740, 140, { fill: '#fff', col: C.green, p: k2 });
      text("TRUE OR noma'lum  -->  TRUE", 1030, 535, { size: 22, fam: MONO, weight: 700, color: C.green });
      text("Bitta rost shart yetarli bo'lgani uchun, noma'lum ahamiyatsiz bo'lib qoladi.", 1030, 580, { size: 20, color: C.ink, wrap: 680 });
      text("Natija barqaror rost qiymat oladi.", 1030, 610, { size: 19, color: C.soft, wrap: 680 });
    });

    const k3 = P(t, W('L5', 'tru'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.purple, p: k3 });
      text("Eslab qoling: NULL o'rniga 'rost yoki yolg'on — bilmayman' deb o'qing!", 180, 755, { size: 25, weight: 700, color: C.purple });
      text("TRUE AND bilmayman --> bilmayman (chunki ikkinchi qiymatga bog'liq).", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("FALSE AND bilmayman --> yolg'on (chunki birinchi qiymatning o'zi yolg'on bo'lish uchun yetarli).", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 4. COMPARISON & PREDICATES
  function sCmpPredicates(t) {
    heading("Taqqoslash va Predikatlar", t, L('L6').s - 0.4);

    const k1 = P(t, W('L6', 'tenglik'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.red, p: k1 });
      pill("ENG KATTA TUZOQ: = VA <>", 440, 285, C.red, k1, 22);

      card(180, 335, 720, 120, { fill: '#fff', col: C.red, p: k1 });
      text("7 = NULL  -->  NULL", 210, 375, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("NULL = NULL  -->  NULL", 210, 415, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Ikki noma'lum qiymat tengmi yoki yo'qmi — noma'lum!", 210, 445, { size: 19, color: C.soft, wrap: 660 });

      card(180, 470, 720, 175, { fill: '#fff', col: C.red, p: k1 });
      text("WHERE ustun = NULL  -->  0 rows!", 210, 515, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("WHERE filtri faqat TRUE bo'lgan qatorlarni oladi.", 210, 560, { size: 20, weight: 700, color: C.ink, wrap: 660 });
      text("NULL hech qachon TRUE bo'lmagani uchun, so'rov hech qachon birorta ham qator qaytarmaydi!", 210, 600, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L8', 'distinkt'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.green, p: k2 });
      hand("To'g'ri Predikatlar", 1020, 290, { size: 28, color: C.green, p: k2 });

      card(1020, 335, 720, 95, { fill: '#fff', col: C.green, p: k2 });
      text("x IS NULL  va  x IS NOT NULL", 1050, 375, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("NULL mavjudligini xavfsiz va aniq tekshiradi.", 1050, 410, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 440, 720, 105, { fill: '#fff', col: C.blue, p: k2 });
      text("a IS DISTINCT FROM b", 1050, 480, { size: 21, fam: MONO, weight: 700, color: C.blue });
      text("<> kabi, lekin NULL ni oddiy qiymatdek ko'radi. Ikkalasi NULL bo'lsa FALSE beradi.", 1050, 520, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 555, 720, 95, { fill: '#fff', col: C.purple, p: k2 });
      text("a IS NOT DISTINCT FROM b", 1050, 595, { size: 21, fam: MONO, weight: 700, color: C.purple });
      text("= kabi, lekin ikkalasi NULL bo'lsa TRUE beradi (NULL-xavfsiz tenglik).", 1050, 630, { size: 19, color: C.soft, wrap: 660 });
    });

    const k3 = P(t, W('L8', 'predikatlar'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.green, p: k3 });
      text("Tavsiya: 'WHERE tel <> 123' yozganda ehtiyot bo'ling!", 180, 755, { size: 25, weight: 700, color: C.green });
      text("Agar ustunda NULL bo'lsa, <> uni tashlab yuboradi va siz kutgan qatorlar chiqmay qoladi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Buning o'rniga 'WHERE tel IS DISTINCT FROM 123' predikatini ishlating.", 180, 855, { size: 21, weight: 700, color: C.blue, wrap: 1560 });
    });
  }

  // 5. TYPE CONVERSION
  function sTypeConv(t) {
    heading("Tip Konversiyasi Qoidalari", t, L('L9').s - 0.4);

    const k1 = P(t, W('L9', 'tiplangan'), 0.5);
    withA(k1, () => {
      card(140, 230, 800, 440, { fill: C.card, col: C.blue, p: k1 });
      hand("Aniq Konversiya (Explicit CAST)", 180, 290, { size: 28, color: C.blue, p: k1 });

      card(180, 335, 720, 130, { fill: '#fff', col: C.blue, p: k1 });
      text("CAST(ifoda AS tip)   -- SQL standart", 210, 380, { size: 21, fam: MONO, weight: 700, color: C.blue });
      text("ifoda::tip            -- PostgreSQL tarixiy yozuvi", 210, 425, { size: 21, fam: MONO, weight: 700, color: C.purple });
      text("Ikkalasi ham bir xil natija beradi.", 210, 455, { size: 19, color: C.soft, wrap: 660 });

      card(180, 480, 720, 165, { fill: '#fff', col: C.green, p: k1 });
      text("Misol: '42'::int + 1  -->  43", 210, 525, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("CAST('3.5' AS numeric) * 2  -->  7.0", 210, 565, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Funksiya shaklidagi int4('7') dan qoching, chunki u ko'p so'zli tiplarda ishlamaydi.", 210, 615, { size: 19, color: C.soft, wrap: 660 });
    });

    const k2 = P(t, W('L10', 'literal'), 0.5);
    withA(k2, () => {
      card(980, 230, 800, 440, { fill: C.card, col: C.purple, p: k2 });
      hand("Noma'lum Literallar va Ustunlar", 1020, 290, { size: 28, color: C.purple, p: k2 });

      card(1020, 335, 720, 130, { fill: '#fff', col: C.green, p: k2 });
      text("1 + '1'  -->  2 (Ishlaydi!)", 1050, 380, { size: 21, fam: MONO, weight: 700, color: C.green });
      text("Tirnoqdagi '1' tipi avval noma'lum (unknown) bo'ladi.", 1050, 420, { size: 20, color: C.ink, wrap: 660 });
      text("Kontekstda butun son kutilgani uchun u songa aylanadi.", 1050, 450, { size: 19, color: C.soft, wrap: 660 });

      card(1020, 480, 720, 165, { fill: '#fff', col: C.red, p: k2 });
      text("WHERE text_ustun = 42  -->  ERROR!", 1050, 525, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("PostgreSQL ustun tipi aniq bo'lganda yashirin o'girmaydi.", 1050, 565, { size: 20, weight: 700, color: C.ink, wrap: 660 });
      text("xato: operator does not exist: text = integer", 1050, 600, { size: 19, fam: MONO, color: C.red, wrap: 660 });
      text("Aniq yozing: WHERE text_ustun = 42::text", 1050, 630, { size: 18, color: C.soft, wrap: 660 });
    });

    const k3 = P(t, W('L11', 'xato'), 0.5);
    withA(k3, () => {
      card(140, 700, 1640, 210, { fill: '#fff', col: C.purple, p: k3 });
      text("Xavfsizlik: PostgreSQL yashirin o'girishlarni cheklaydi!", 180, 755, { size: 25, weight: 700, color: C.purple });
      text("Kutilmagan konversiyalar jimgina bajarilib, xato hisob-kitoblar chiqmasligi uchun faqat tizim katalogida ruxsat berilganlar o'giriladi.", 180, 805, { size: 21, color: C.ink, wrap: 1560 });
      text("Turli tiplarni solishtirishda doimo aniq CAST yoki :: operatoridan foydalaning.", 180, 855, { size: 21, color: C.soft, wrap: 1560 });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, L('L12').s - 0.4);

    const k = P(t, W('L12', 'mantiqni'), 0.6);
    withA(k, () => {
      card(140, 230, 520, 480, { fill: C.card, col: C.blue, p: k });
      pill("1. NULL — NOMA'LUM", 400, 285, C.blue, k, 22);
      text("• NULL nol ham, bo'sh satr ham emas.", 170, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• 'WHERE ustun = NULL' hech qachon ishlamaydi.", 170, 430, { size: 22, color: C.red, weight: 700, wrap: 460 });
      text("• Doimo IS NULL yoki IS DISTINCT FROM ishlating.", 170, 510, { size: 22, color: C.green, weight: 700, wrap: 460 });

      card(700, 230, 520, 480, { fill: C.card, col: C.purple, p: k });
      pill("2. 3VL QOIDALARI", 960, 285, C.purple, k, 22);
      text("• SQL mantiqida uchta holat: TRUE, FALSE va NULL.", 730, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• FALSE AND NULL = FALSE (yolg'on yengadi).", 730, 430, { size: 22, color: C.ink, wrap: 460 });
      text("• TRUE AND NULL = NULL (natija noma'lum).", 730, 510, { size: 22, color: C.purple, weight: 700, wrap: 460 });

      card(1260, 230, 520, 480, { fill: C.card, col: C.green, p: k });
      pill("3. ANIQ TIP CONVERSIONS", 1520, 285, C.green, k, 22);
      text("• SQL qat'iy tiplangan til hisoblanadi.", 1290, 360, { size: 22, color: C.ink, wrap: 460 });
      text("• Matn va sonni solishtirishda aniq CAST ishlating.", 1290, 430, { size: 22, color: C.ink, wrap: 460 });
      text("• PostgreSQL yashirin xatolarni oldini oladi.", 1290, 510, { size: 22, color: C.blue, weight: 700, wrap: 460 });

      card(140, 740, 1640, 170, { fill: '#fff', col: C.blue, p: k });
      text("Keyingi qismda:", 180, 790, { size: 25, weight: 700, color: C.blue });
      text("Ushbu qoidalarni PostgreSQL 18 psql terminalida real ma'lumotlar bilan sinab ko'ramiz.", 180, 840, { size: 22, color: C.ink, wrap: 1560 });
    });
  }

  function draw(t) {
    bg();
    if (t < TM.scenes.null_nature.s) sIntro(t);
    else if (t < TM.scenes.three_logic.s) sNullNature(t);
    else if (t < TM.scenes.cmp_predicates.s) sThreeLogic(t);
    else if (t < TM.scenes.type_conv.s) sCmpPredicates(t);
    else if (t < TM.scenes.xulosa.s) sTypeConv(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("10-bob: NULL va Tip Konversiyasi — Tushuncha", 960, 200, { size: 76, align: 'center', color: C.blue });
    hand("Relyatsion nazariya, uch qiymatli mantiq (3VL) va tiplar xavfsizligi", 960, 290, { size: 38, align: 'center', color: C.ink });

    card(140, 380, 500, 500, { fill: C.card, col: C.blue });
    hand("NULL — Noma'lum", 180, 440, { size: 32, color: C.blue });
    text("• Aniq qiymat yo'qligi\n• 0 va bo'sh satrdan farqli\n• 7 = NULL natijasi: NULL\n• WHERE ustun = NULL ishlamaydi\n• IS NULL va IS NOT NULL", 180, 520, { size: 22, fam: MONO, color: C.ink });
    pill("MISSING VALUES", 390, 820, C.blue, 1, 20);

    card(710, 380, 500, 500, { fill: C.card, col: C.purple });
    hand("3VL Mantiq", 750, 440, { size: 32, color: C.purple });
    text("• TRUE, FALSE, UNKNOWN\n• FALSE AND NULL = FALSE\n• TRUE AND NULL = NULL\n• TRUE OR NULL = TRUE\n• IS DISTINCT FROM", 750, 520, { size: 22, fam: MONO, color: C.ink });
    pill("THREE-VALUED LOGIC", 960, 820, C.purple, 1, 20);

    card(1280, 380, 500, 500, { fill: C.card, col: C.green });
    hand("CAST & Konversiya", 1320, 440, { size: 32, color: C.green });
    text("• CAST(x AS tip) / x::tip\n• Noma'lum literallar: '1'\n• Ustunlar qat'iy tekshiriladi\n• text = integer -> ERROR\n• Yashirin o'girish taqiqlangan", 1320, 520, { size: 22, fam: MONO, color: C.ink });
    pill("EXPLICIT CAST", 1530, 820, C.green, 1, 20);

    pill("SQL Darslari", 960, 960, C.blue, 1, 24);
  }

  window.render = draw;
  window.renderPoster = renderPoster;
  window.__renderFrame = function (t) { draw(t); };
  window.__getDuration = function () { return TM.end; };
  window.DURATION = TM.end;
})();
