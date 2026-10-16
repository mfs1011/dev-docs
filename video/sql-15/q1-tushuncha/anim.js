// SQL 15-bob 1-qism: "Tushuncha" — Generated ustunlar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("15-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("Generated Ustunlar (Generated Columns)", 960, 300, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Formula Asosida Avtomatik Hisoblanadigan Maydonlar va Baza Nazorati", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(260, 430, 1400 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'Jenerated'), 0.8);
    withA(kBadges, () => {
      pill("1. VIRTUAL vs STORED", 400, 580, C.blue, kBadges, 21);
      pill("2. DEFAULT bilan Taqqoslash", 860, 580, C.green, kBadges, 21);
      pill("3. O'zgarmaslik (Immutable)", 1320, 580, C.purple, kBadges, 21);
      pill("4. Baza Yaxlitligi", 1660, 580, C.orange, kBadges, 21);
    });

    const kDesc = P(t, W('L1', 'summani'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Hisoblanadigan qiymatlarni (masalan, summa = narx * soni) dastur kodida hisoblab yozish xavfli:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Biror joyda yangilash unutilsa, hisob-kitoblar buziladi va ma'lumotlar bir-biriga zid bo'lib qoladi.", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("Generated ustunlar yordamida barcha hisob-kitoblarni to'g'ridan-to'g'ri ma'lumotlar bazasining o'ziga topshiramiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. TURLAR
  function sTurlar(t) {
    heading("Ikki Xil Generated Ustun: VIRTUAL vs STORED", t, TM.scenes.turlar.s);

    const k1 = P(t, W('L2', 'stord'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.purple, p: k1 });
      pill("STORED", 530, 275, C.purple, k1, 20);
      hand("Saqlanadigan (Stored) Ustun", 530, 335, { size: 32, align: 'center', color: C.purple, p: k1 });

      const storedItems = [
        { label: "Qachon hisoblanadi:", val: "Qator INSERT yoki UPDATE qilinganda bir marta hisoblanadi." },
        { label: "Diskdagi joy:", val: "Oddiy ustun kabi diskda fizik joy egallaydi." },
        { label: "O'qish tezligi:", val: "Juda tez! O'qish paytida hisoblanmaydi, tayyor qiymat olinadi." },
        { label: "Sintaksis:", val: "GENERATED ALWAYS AS (narx * soni) STORED" }
      ];

      storedItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(165, cy, 730, 105, { fill: '#fff', col: C.soft, p: k1 });
        text(it.label, 190, cy + 40, { size: 19, weight: 700, color: C.purple, wrap: 680 });
        text(it.val, 190, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });

    const k2 = P(t, W('L2', 'Virtual'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.blue, p: k2 });
      pill("VIRTUAL (PG 18 Standart)", 1390, 275, C.blue, k2, 20);
      hand("Virtual (Virtual) Ustun", 1390, 335, { size: 32, align: 'center', color: C.blue, p: k2 });

      const virtualItems = [
        { label: "Qachon hisoblanadi:", val: "Faqat SELECT bilan qator o'qilayotganda parvozda hisoblanadi." },
        { label: "Diskdagi joy:", val: "Diskda mutlaqo joy egallamaydi (0 bayt) — xotirani tejaydi." },
        { label: "PostgreSQL 18:", val: "18-versiyadan boshlab sukut bo'yicha aynan VIRTUAL yaratiladi!" },
        { label: "Sintaksis:", val: "GENERATED ALWAYS AS (narx * soni) [VIRTUAL]" }
      ];

      virtualItems.forEach((it, idx) => {
        const cy = 390 + idx * 125;
        card(1025, cy, 730, 105, { fill: '#fff', col: C.soft, p: k2 });
        text(it.label, 1050, cy + 40, { size: 19, weight: 700, color: C.blue, wrap: 680 });
        text(it.val, 1050, cy + 75, { size: 17, color: C.ink, wrap: 680 });
      });
    });
  }

  // 3. DEFAULT SOLISHTIRISH
  function sDefaultSolishtirish(t) {
    heading("Generated Ustun va DEFAULT: Asosiy Farqlar", t, TM.scenes.default_solishtirish.s);

    const k = P(t, W('L3', 'Difolt'), 0.5);
    withA(k, () => {
      const rows = [
        {
          jihat: "Qachon hisoblanadi?",
          def: "Faqat 1 marta — qator yaratilganda.",
          gen: "Har safar asosiy ustunlar o'zgarganda (stored) yoki o'qilganda (virtual)."
        },
        {
          jihat: "Qo'lda qiymat yozish?",
          def: "MUMKIN. INSERT/UPDATE da ixtiyoriy qiymat berish mumkin.",
          gen: "TAQIQLANADI! Faqat DEFAULT kalit so'zi qabul qilinadi."
        },
        {
          jihat: "Boshqa ustunlarga murojaat?",
          def: "MUMKIN EMAS. DEFAULT boshqa ustun nomini ishlata olmaydi.",
          gen: "ASOSIY MAQSADI. Aynan shu qatordagi ustunlardan hisoblaydi."
        },
        {
          jihat: "O'zgaruvchan funksiyalar (now)?",
          def: "MUMKIN. now(), clock_timestamp() bemalol ishlaydi.",
          gen: "TAQIQLANADI! Faqat o'zgarmas (immutable) funksiyalar bo'lishi shart."
        }
      ];

      card(140, 220, 1640, 680, { fill: C.card, col: C.green, p: k });
      hand("Solishtirish Jadvali: DEFAULT vs GENERATED ALWAYS", 960, 280, { size: 28, align: 'center', color: C.green, p: k });

      rows.forEach((r, idx) => {
        const y = 330 + idx * 135;
        card(170, y, 1580, 115, { fill: '#fff', col: C.soft, p: k });

        card(190, y + 20, 360, 75, { fill: C.card, col: C.green, p: k });
        text(r.jihat, 370, y + 65, { size: 20, weight: 700, align: 'center', color: C.ink, wrap: 340 });

        card(570, y + 20, 560, 75, { fill: '#f8fafc', col: C.soft, p: k });
        text("DEFAULT:", 590, y + 45, { size: 16, weight: 700, color: C.soft });
        text(r.def, 590, y + 75, { size: 17, color: C.ink, wrap: 520 });

        card(1150, y + 20, 580, 75, { fill: '#f0fdf4', col: C.green, p: k });
        text("GENERATED ALWAYS:", 1170, y + 45, { size: 16, weight: 700, color: C.green });
        text(r.gen, 1170, y + 75, { size: 17, weight: 700, color: C.ink, wrap: 540 });
      });
    });
  }

  // 4. CHEKLOVLAR
  function sCheklovlar(t) {
    heading("PostgreSQL da Generated Ustun Cheklovlari", t, TM.scenes.cheklovlar.s);

    const k = P(t, W('L4', 'o‘zgarmas'), 0.5);
    withA(k, () => {
      const rules = [
        {
          num: "1",
          title: "Faqat O'zgarmas (Immutable) Ifodalar",
          desc: "now(), random(), clock_timestamp() kabi har chaqiruvda boshqa natija beruvchi funksiyalar mutlaqo taqiqlanadi.",
          col: C.red
        },
        {
          num: "2",
          title: "Boshqa Generated Ustunga Tayanmaslik",
          desc: "PostgreSQL da bitta generated ustun boshqa generated ustunning natijasiga murojaat qila olmaydi. Barcha ifodalar asosiy ustunlardan yozilishi shart.",
          col: C.orange
        },
        {
          num: "3",
          title: "Subquery va Tashqi Jadvallar Taqiqlangan",
          desc: "Ifoda ichida SELECT (subquery) yoki boshqa jadvallardagi ustunlar bo'lishi mumkin emas. Faqat joriy qator ustunlari qatnashadi.",
          col: C.blue
        },
        {
          num: "4",
          title: "Qo'lda Qiymat Yozib Bo'lmaydi",
          desc: "INSERT yoki UPDATE paytida ushbu ustunga son yoki matn berilsa tizim 'cannot insert a non-DEFAULT value' xatosini beradi.",
          col: C.purple
        }
      ];

      rules.forEach((r, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const x = 140 + colIdx * 840;
        const y = 220 + rowIdx * 350;

        card(x, y, 800, 310, { fill: C.card, col: r.col, p: k });
        pill(r.num, x + 50, y + 55, r.col, k, 24);
        hand(r.title, x + 90, y + 62, { size: 26, color: r.col, p: k });

        card(x + 40, y + 105, 720, 175, { fill: '#fff', col: C.soft, p: k });
        text(r.desc, x + 65, y + 160, { size: 21, color: C.ink, wrap: 670 });
      });
    });
  }

  // 5. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Asosiy Qoidalar", t, TM.scenes.xulosa.s);

    const k = P(t, W('L5', 'yaxlitligini'), 0.5);
    withA(k, () => {
      const items = [
        {
          num: "1",
          title: "Hisob-kitobni Bazaga Yuklang",
          desc: "Summa, to'liq ism, chegirmali narx kabi maydonlarni dastur kodida emas, baza darajasida hisoblang.",
          col: C.blue
        },
        {
          num: "2",
          title: "Virtual va Stored ni To'g'ri Tanlang",
          desc: "Oddiy hisob-kitoblar uchun Virtual (0 bayt joy). Agar ifoda og'ir bo'lsa va juda ko'p o'qilsa Stored.",
          col: C.purple
        },
        {
          num: "3",
          title: "O'zgarmaslik Qoidasiga Amal Qiling",
          desc: "Yaratilgan vaqt uchun DEFAULT now() ishlating, generated ustunda esa faqat deterministik amallardan foydalaning.",
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
      hand("Hisob-kitoblarni Bazada Avtomatlashtirish — Ma'lumotlar Nomuvofiqligini Yo'qotadi!", 960, 755, { size: 34, align: 'center', color: C.blue, p: k });
      text("Generated ustunlar har doim o'zaro mos va to'g'ri qiymatlarni kafolatlaydi, dasturiy ta'minot arxitekturasini soddalashtiradi.", 960, 825, { size: 23, align: 'center', color: C.ink, wrap: 1540 });
    });
  }

  function frame(t) {
    window.CURRENT_T = t;
    bg();
    const S = TM.scenes;
    if (t < S.turlar.s) sIntro(t);
    else if (t < S.default_solishtirish.s) sTurlar(t);
    else if (t < S.cheklovlar.s) sDefaultSolishtirish(t);
    else if (t < S.xulosa.s) sCheklovlar(t);
    else sXulosa(t);
  }

  window.render = frame;
  window.renderFrame = frame;

  window.renderPoster = function () {
    bg();
    // 2-sahna (VIRTUAL vs STORED) bo'yicha chiroyli poster
    const t = TM.scenes.turlar.s + 5.0;
    frame(t);
  };
})();
