// SQL 38-bob 1-qism: "Tushuncha" — Normalizatsiya va tuzilma asoslari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. KIRISH (0 -> 16.6s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("38-bob. Normalizatsiya va Tuzilma", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Normalizatsiya Tushunchasi va Maqsadi", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Takrorlanishning oldini olish: Har bir mustaqil fakt aynan bir joyda saqlansin", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 345, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Noto'g'ri (Tekis jadval)
      card(140, 400, 780, 380, { fill: C.card, col: C.red, p: kBox });
      pill("Noto'g'ri: Tekis Jadval", 530, 450, C.red, kBox, 20);
      text("Bitta Jadvalda Hammasini Jamlash:", 180, 515, { size: 24, weight: 700, color: C.red, fam: UI });

      text("buyurtma_tekis (buyurtma_id, sana, mijoz_ism,", 180, 575, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("               mijoz_tel, mijoz_manzil, mahsulot, narx)", 180, 615, { size: 20, weight: 600, fam: MONO, color: C.ink });

      text("• Bir mijozning ismi va manzili har buyurtmada takrorlanadi.", 180, 675, { size: 20, color: C.ink, fam: UI });
      text("• Mahsulot narxi va nomi ham behuda nusxalanadi.", 180, 720, { size: 20, color: C.soft, fam: UI });

      // O'ng: To'g'ri (Normallashgan model)
      card(1000, 400, 780, 380, { fill: C.card, col: C.green, p: kBox });
      pill("To'g'ri: 3NF Relyatsion Model", 1390, 450, C.green, kBox, 20);
      text("Har Fakt — O'z Jadvalida:", 1040, 515, { size: 24, weight: 700, color: C.green, fam: UI });

      text("mijozlar       (id, ism, tel, manzil)", 1040, 575, { size: 20, weight: 700, fam: MONO, color: C.blue });
      text("mahsulotlar    (id, nom, narx)", 1040, 615, { size: 20, weight: 700, fam: MONO, color: C.purple });
      text("buyurtmalar    (id, mijoz_id, sana)", 1040, 655, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("buyurtma_qator (buyurtma_id, mahsulot_id, narx, soni)", 1040, 695, { size: 19, weight: 700, fam: MONO, color: C.green });

      text("Faktlar takrorlanmaydi, bog'lanish faqat ID orqali bo'ladi.", 1040, 740, { size: 20, color: C.green, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, 5.0, 0.8);
      withA(kFoot, () => {
        card(140, 820, 1640, 190, { fill: '#f0fdf4', col: C.blue, p: kFoot });
        text("Uchinchi Normal Shakl (3NF) ning Bosh Qoidasi:", 180, 875, { size: 24, weight: 700, color: C.blue, fam: UI });
        text("Har bir ustun birlamchi kalitga bevosita va to'liq bog'liq bo'lishi kerak.", 180, 925, { size: 21, color: C.ink, fam: UI });
        text("Nomzod kalit bo'lmagan ustun boshqa nomzod kalit bo'lmagan ustunga bog'lanmasligi shart.", 180, 965, { size: 20, weight: 600, color: C.soft, fam: UI });
      });
    });
  }

  // 2. ANOMALIYALAR (16.6 -> 32.4s)
  function sAnomaliyalar(t) {
    heading("Tekis Jadval va Ma'lumot Anomaliyalari", t, TM.scenes.anomaliyalar.s);

    const kMain = P(t, TM.scenes.anomaliyalar.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: Yangilash anomaliyasi
      card(120, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("1. Yangilash Anomaliyasi (Update Anomaly)", 525, 250, C.red, kMain, 20);
      text("Ali Ko'chdi: Manzil Faqat Bitta Qatorda O'zgardi", 160, 315, { size: 23, weight: 700, color: C.red, fam: UI });

      text("UPDATE buyurtma_tekis SET", 160, 375, { size: 20, fam: MONO, color: C.ink });
      text("    mijoz_manzil = 'Toshkent, Amir Temur 1'", 160, 410, { size: 20, weight: 700, fam: MONO, color: C.blue });
      text("WHERE buyurtma_id = 2;", 160, 445, { size: 20, fam: MONO, color: C.ink });

      card(160, 480, 730, 160, { fill: '#fff8f6', col: C.red, p: kMain });
      text("SELECT DISTINCT mijoz_ism, mijoz_manzil:", 180, 515, { size: 19, weight: 700, fam: MONO, color: C.soft });
      text("Ali | Toshkent, Amir Temur 1", 180, 560, { size: 20, weight: 700, fam: MONO, color: C.red });
      text("Ali | Toshkent, Navoiy 12", 180, 600, { size: 20, weight: 700, fam: MONO, color: C.red });

      text("Ziddiyat: Baza Alining ikkita manzilini biladi. Qaysi biri to'g'ri?!", 160, 660, { size: 18, weight: 600, color: C.red, fam: UI, maxW: 740 });

      // O'ng: O'chirish anomaliyasi
      card(990, 200, 810, 480, { fill: C.card, col: C.orange, p: kMain });
      pill("2. O'chirish Anomaliyasi (Delete Anomaly)", 1395, 250, C.orange, kMain, 20);
      text("Valining Yagona Buyurtmasi Bekor Bo'ldi", 1030, 315, { size: 23, weight: 700, color: C.orange, fam: UI });

      text("DELETE FROM buyurtma_tekis WHERE buyurtma_id = 3;", 1030, 380, { size: 20, weight: 700, fam: MONO, color: C.ink });

      card(1020, 440, 750, 160, { fill: '#fff8f6', col: C.orange, p: kMain });
      text("SELECT count(*) AS vali_haqida FROM buyurtma_tekis:", 1040, 480, { size: 19, weight: 700, fam: MONO, color: C.soft });
      text("vali_haqida: 0", 1040, 530, { size: 24, weight: 800, fam: MONO, color: C.red });
      text("Oqibat: Buyurtma o'chirilishi bilan Valining telefoni,", 1040, 575, { size: 18, color: C.ink, fam: UI });
      text("manzili va o'zi ham bazadan butunlay o'chib ketdi!", 1040, 605, { size: 18, weight: 700, color: C.red, fam: UI });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l4', 'bekor'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("Tekis Jadvallarning Asosiy Xavfi:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Hech qanday ma'lumotlar bazasi cheklovi (constraint) bu ziddiyatlarning oldini ololmaydi.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. Bitta faktni o'zgartirish har bir nusxani yangilashni talab qiladi (bitta xato — butun tizim yolg'on).", 160, 895, { size: 21, weight: 600, color: C.red, fam: UI });
        text("3. Yechim: Normalizatsiya orqali har bir mustaqil obyektni alohida jadvalga ajratish!", 160, 945, { size: 21, weight: 700, color: C.green, fam: UI });
      });
    });
  }

  // 3. NORMALLASHGAN MODEL (32.4 -> 49.3s)
  function sNormallashgan(t) {
    heading("Normallashgan Model va Relyatsion Tuzilma", t, TM.scenes.normallashgan_model.s);

    const kMain = P(t, TM.scenes.normallashgan_model.s + 0.3, 0.8);
    withA(kMain, () => {
      // 4 ta jadval kartasi
      card(120, 200, 810, 480, { fill: C.card, col: C.blue, p: kMain });
      pill("Toza Relyatsion Sxema", 525, 250, C.blue, kMain, 20);
      text("Faktlar O'z Uyida Saqlanadi:", 160, 315, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("mijozlar (id PK, ism, tel, manzil)", 160, 375, { size: 21, weight: 700, fam: MONO, color: C.blue });
      text("• Ali: Toshkent, Amir Temur 1 (bitta joyda yangilandi)", 160, 415, { size: 19, color: C.green, fam: UI });

      text("mahsulotlar (id PK, nom UNIQUE, narx)", 160, 465, { size: 21, weight: 700, fam: MONO, color: C.purple });
      text("• Daftar (12000), Kitob (85000)", 160, 505, { size: 19, color: C.soft, fam: UI });

      text("buyurtmalar (id PK, mijoz_id FK, sana)", 160, 555, { size: 21, weight: 700, fam: MONO, color: C.ink });
      text("buyurtma_qatorlari (buyurtma_id, mahsulot_id, narx, soni)", 160, 605, { size: 19, weight: 700, fam: MONO, color: C.green });
      text("• Sotilgan paytdagi narx oraliq jadvalda saqlanadi.", 160, 645, { size: 19, color: C.soft, fam: UI });

      // O'ng: JOIN orqali toza o'qish
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("Yaxlitlik va JOIN Natijasi", 1395, 250, C.green, kMain, 20);
      text("SELECT b.id, m.ism, m.manzil, p.nom, q.narx, q.soni:", 1030, 315, { size: 21, weight: 700, color: C.green, fam: UI });

      text("id | ism  |         manzil         |  nom   | narx  | soni", 1030, 375, { size: 19, weight: 700, fam: MONO, color: C.soft });
      sline(1030, 395, 1750, 395, { col: C.pencil, w: 1.5 });
      text(" 1 | Ali  | Toshkent, Amir Temur 1 | Daftar | 12000 |    2", 1030, 430, { size: 19, fam: MONO, color: C.ink });
      text(" 2 | Ali  | Toshkent, Amir Temur 1 | Kitob  | 85000 |    1", 1030, 475, { size: 19, fam: MONO, color: C.ink });
      text(" 3 | Vali | Samarqand, Registon 5  | Daftar | 12000 |    3", 1030, 520, { size: 19, fam: MONO, color: C.ink });

      card(1020, 570, 750, 95, { fill: '#f0fdf4', col: C.green, p: kMain });
      text("Buyurtma o'chirilsa ham Vali saqlanib qoladi:", 1040, 605, { size: 18, weight: 700, color: C.green, fam: UI });
      text("Vali | +998907654321 (mijozlar jadvalidan yo'qolmaydi!)", 1040, 640, { size: 19, weight: 700, fam: MONO, color: C.blue });

      // Pastki xulosa kartasi
      const kFoot = P(t, W('l6', 'sofligini'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("Normalizatsiyaning Narxi va Foydasi:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("• Narxi: So'rovlarda bitta SELECT o'rniga 3 ta JOIN yozish talab etiladi.", 160, 845, { size: 21, color: C.soft, fam: UI });
        text("• Foydasi: Anomaliyalar yo'qoladi, disk tejaladi, ma'lumotlarning mutlaq to'g'riligi ta'minlanadi.", 160, 895, { size: 21, weight: 700, color: C.green, fam: UI });
        text("• Baza dvigatellari (Postgres, MySQL) indeksli JOIN larni o'ta yuqori tezlikda bajarishga moslashgan.", 160, 945, { size: 20, color: C.ink, fam: UI });
      });
    });
  }

  // 4. MASSIV VA JSON TUZOG'I (49.3 -> 65.7s)
  function sMassivJson(t) {
    heading("Jadval, Massiv va JSON Tanlovi", t, TM.scenes.massiv_va_json_tuzogi.s);

    const kMain = P(t, TM.scenes.massiv_va_json_tuzogi.s + 0.3, 0.8);
    withA(kMain, () => {
      card(120, 200, 1680, 780, { fill: C.card, col: C.purple, p: kMain });
      pill("Rasmiy Qo'llanmalar Tavsiyasi", 960, 250, C.purple, kMain, 22);

      const startY = 320;
      card(160, startY, 1600, 65, { fill: '#f1f5f9', col: C.purple, p: kMain });
      text("Savol / Ehtiyoj", 200, startY + 32, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("Tavsiya Etilgan Tuzilma", 950, startY + 32, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("Nega aynan shu?", 1380, startY + 32, { size: 22, weight: 700, color: C.soft, fam: UI });

      const rules = [
        {
          q: "Element bo'yicha qidirasizmi yoki filtrlaysizmi?",
          sol: "Alohida jadval (massiv emas!)",
          why: "Indeks tezligi va B-tree afzalligi",
          col: C.green
        },
        {
          q: "Elementga tashqi kalit kerakmi (ruxsat etilgan teglar)?",
          sol: "Alohida jadval (REFERENCES)",
          why: "Yetim elementlardan to'liq himoya",
          col: C.blue
        },
        {
          q: "Elementni alohida yangilaysizmi yoki o'chirasizmi?",
          sol: "Alohida jadval yoki ustun",
          why: "Qatorni qulflamasdan tez yangilash",
          col: C.purple
        },
        {
          q: "Ma'lumot butunligicha o'qiladimi va tuzilishi o'zgaruvchanmi?",
          sol: "JSONB (Postgres)",
          why: "Moslashuvchan hujjat formati",
          col: C.orange
        },
        {
          q: "Maydon har bir qatorda bor va tipi aniqmi?",
          sol: "Oddiy relying ustuni (NOT NULL)",
          why: "Eng kam disk va eng yuqori unumdorlik",
          col: C.green
        }
      ];

      rules.forEach((r, i) => {
        const ry = startY + 75 + i * 74;
        if (i % 2 === 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(245,243,255,0.45)';
          ctx.fillRect(160, ry - 15, 1600, 70);
          ctx.restore();
        }
        text(r.q, 200, ry + 20, { size: 20, weight: 600, color: C.ink, fam: UI });
        pill(r.sol, 1100, ry + 20, r.col, kMain, 18);
        text(r.why, 1380, ry + 20, { size: 19, color: C.soft, fam: UI });
      });

      // Pastki eslatma
      text("Postgres hujjati ogohlantiradi: 'Massivlar to'plam emas; element qidirish noto'g'ri loyihalash belgisidir.'", 960, startY + 490, { size: 21, weight: 700, color: C.red, fam: UI, align: 'center', ignoreCardCheck: true });
    });
  }

  // 5. DENORMALIZATSIYA VA XULOSA (65.7 -> 84.5s)
  function sDenormalizatsiya(t) {
    heading("Denormalizatsiya Narxi va Arxitektura Xulosasi", t, TM.scenes.denormalizatsiya_va_xulosa.s);

    const kMain = P(t, TM.scenes.denormalizatsiya_va_xulosa.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: Yig'ma jadval va tafovut
      card(120, 200, 810, 480, { fill: C.card, col: C.orange, p: kMain });
      pill("Yig'ma Jadval (Summary Table)", 525, 250, C.orange, kMain, 20);
      text("Oldindan Hisoblangan Kunlik Savdo:", 160, 315, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("kunlik_savdo: sana=2026-02-01 | summa=24000", 160, 375, { size: 20, weight: 600, fam: MONO, color: C.blue });
      text("• Hisobot JOIN va GROUP BY siz tez o'qiladi.", 160, 420, { size: 20, color: C.ink, fam: UI });

      card(160, 465, 730, 180, { fill: '#fff8f6', col: C.red, p: kMain });
      text("Ammo yangi buyurtma tushganda:", 180, 505, { size: 19, weight: 700, color: C.red, fam: UI });
      text("INSERT INTO b VALUES (2, '2026-02-01', 5000);", 180, 545, { size: 19, weight: 700, fam: MONO, color: C.ink });
      text("kunlik_savdo jadvalida: 24000  |  haqiqiy summa: 29000", 180, 590, { size: 19, weight: 800, fam: MONO, color: C.red });
      text("Natija: 5000 so'm tafovut! Nusxa o'z-o'zidan yangilanmadi.", 180, 630, { size: 17, weight: 600, color: C.red, fam: UI });

      // O'ng: Oltin qoidalar
      card(990, 200, 810, 480, { fill: C.card, col: C.green, p: kMain });
      pill("Relyatsion Arxitektura Qoidalari", 1395, 250, C.green, kMain, 20);
      text("To'g'ri Loyihalashning 3 Oltin Bosqichi:", 1030, 315, { size: 24, weight: 700, color: C.green, fam: UI });

      const rules = [
        { n: "1", title: "Doimo 3NF bilan boshlang", desc: "Har fakt bitta joyda, barcha bog'liqliklar ID orqali." },
        { n: "2", title: "Erta optimallashdan qoching", desc: "Oldindan 'sekin bo'ladi' deb ma'lumotni takrorlamang." },
        { n: "3", title: "Denormalizatsiyani faqat o'lchab qo'llang", desc: "Materialized view yoki trigger xarajatini hisobga oling." }
      ];

      rules.forEach((r, i) => {
        const ry = 380 + i * 95;
        pill(r.n, 1060, ry + 15, C.blue, kMain, 18);
        text(r.title, 1110, ry, { size: 21, weight: 700, color: C.ink, fam: UI });
        text(r.desc, 1110, ry + 32, { size: 19, color: C.soft, fam: UI });
      });

      // Pastki yakuniy xulosa kartasi
      const kFinal = P(t, W('l10', 'arxitektura'), 0.8);
      withA(kFinal, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.green, p: kFinal });
        text("38-bob Xulosasi: Toza va Barqaror Baza Tuzilmasi", 160, 785, { size: 26, weight: 700, color: C.green, fam: UI });
        text("Uchinchi normal shaklga asoslangan toza arxitektura ma'lumotlar", 160, 850, { size: 23, color: C.ink, fam: UI });
        text("bazasining yillar davomida ziddiyatlarsiz, xavfsiz va barqaror ishlashiga poydevor bo'ladi.", 160, 905, { size: 23, weight: 700, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.anomaliyalar.s) sIntro(t);
    else if (t < TM.scenes.normallashgan_model.s) sAnomaliyalar(t);
    else if (t < TM.scenes.massiv_va_json_tuzogi.s) sNormallashgan(t);
    else if (t < TM.scenes.denormalizatsiya_va_xulosa.s) sMassivJson(t);
    else sDenormalizatsiya(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
