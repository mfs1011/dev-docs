// SQL 28-bob 1-qism: "Tushuncha" — To'plam amallari (UNION, INTERSECT, EXCEPT)
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. KIRISH
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("28-bob. Set amallari", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("SQL da To'plam Amallari (Set Operations)", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Ikki so'rov natijasini ustma-ust (qatorlar bo'yicha) birlashtirish", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBox = P(t, W('intro', 'Joyn'), 0.8);
    withA(kBox, () => {
      // Left: JOIN concept
      card(140, 440, 780, 500, { fill: C.card, col: C.purple, p: kBox });
      pill("JOIN (25-bob)", 530, 490, C.purple, kBox, 22);
      text("Jadvallarni YONMA-YON (ustunlar bo'yicha) qo'shadi:", 180, 560, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(180, 600, 700, 140, { fill: '#fff', col: C.purple, p: kBox });
      text("SELECT * FROM a JOIN b ON a.id = b.a_id;", 210, 650, { size: 20, color: C.purple, fam: MONO });
      text("Natija: [ a.ustun1, a.ustun2 | b.ustun1, b.ustun2 ]", 210, 700, { size: 19, weight: 700, color: C.ink, fam: MONO });

      text("• Ustunlar soni ko'payadi (yonma-yon kengayish).", 180, 790, { size: 20, color: C.ink, fam: UI });
      text("• Aloqador kalitlar (FOREIGN KEY) orqali bog'lanadi.", 180, 840, { size: 20, color: C.soft, fam: UI });

      // Right: SET Operations concept
      card(1000, 440, 780, 500, { fill: C.card, col: C.blue, p: kBox });
      pill("SET AMALLARI (28-bob)", 1390, 490, C.blue, kBox, 22);
      text("Natijalarni USTMA-UST (qatorlar bo'yicha) qo'shadi:", 1040, 560, { size: 21, weight: 700, color: C.ink, fam: UI });

      card(1040, 600, 700, 140, { fill: '#fff', col: C.blue, p: kBox });
      text("SELECT * FROM a  UNION  SELECT * FROM b;", 1070, 650, { size: 20, color: C.blue, fam: MONO });
      text("Natija: [ a qatorlari ] USTIGA [ b qatorlari ]", 1070, 700, { size: 19, weight: 700, color: C.ink, fam: MONO });

      text("• Ustunlar soni o'zgarmaydi, qatorlar soni oshadi.", 1040, 790, { size: 20, color: C.ink, fam: UI });
      text("• Kalit shart emas, faqat ustunlar mosligi (compatibility) kerak.", 1040, 840, { size: 20, color: C.soft, fam: UI });
    });
  }

  // 2. UCH AMAL
  function sUchAmal(t) {
    heading("Uch Asosiy To'plam Amali: UNION, INTERSECT va EXCEPT", t, TM.scenes.uch_amal.s);

    const k = P(t, TM.scenes.uch_amal.s + 0.3, 0.8);
    withA(k, () => {
      const ops = [
        {
          name: "UNION",
          uzb: "Birlashma (A ∪ B)",
          desc: "Ikkala so'rov natijasi qo'shiladi.",
          note: "Birinchi natijaga ikkinchi natija to'liq qo'shiladi.",
          col: C.blue,
          code: "SELECT * FROM a UNION SELECT * FROM b;"
        },
        {
          name: "INTERSECT",
          uzb: "Kesishma (A ∩ B)",
          desc: "Ikkala natijada HAM mavjud qatorlar.",
          note: "Faqat umumiy (kesishgan) elementlar ajratib olinadi.",
          col: C.green,
          code: "SELECT * FROM a INTERSECT SELECT * FROM b;"
        },
        {
          name: "EXCEPT",
          uzb: "Ayirma (A \\ B)",
          desc: "Birinchisida bor, ikkinchisida YO'Q qatorlar.",
          note: "O'rin almashtirilsa (b EXCEPT a) mutlaqo boshqa natija chiqadi!",
          col: C.red,
          code: "SELECT * FROM a EXCEPT SELECT * FROM b;"
        },
      ];

      ops.forEach((o, i) => {
        const bx = 100 + i * 585;
        card(bx, 210, 555, 730, { fill: C.card, col: o.col, p: k });
        pill(o.name, bx + 277, 260, o.col, k, 22);

        text(o.uzb, bx + 40, 330, { size: 22, weight: 700, color: o.col, fam: UI });
        text(o.desc, bx + 40, 380, { size: 19, weight: 600, color: C.ink, fam: UI, maxW: 480 });

        card(bx + 30, 430, 495, 120, { fill: '#fff', col: o.col, p: k });
        text(o.code, bx + 45, 495, { size: 16, weight: 700, color: C.ink, fam: MONO });

        text("Izoh:", bx + 40, 600, { size: 18, weight: 700, color: C.soft, fam: UI });
        text(o.note, bx + 40, 640, { size: 18, color: C.ink, fam: UI, maxW: 480 });
      });
    });
  }

  // 3. TAKRORLAR VA ALL
  function sTakrorlarVaAll(t) {
    heading("DISTINCT va ALL: Takror Qatorlar Hisobi", t, TM.scenes.takrorlar_va_all.s);

    const k = P(t, TM.scenes.takrorlar_va_all.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Default DISTINCT vs ALL
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Sukut Bo'yicha DISTINCT vs ALL Qo'shimchasi", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.blue, p: k });
      text("Sukut bo'yicha (DISTINCT):", 170, 355, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("• Uchala amal ham takror qatorlarni olib tashlaydi.", 170, 400, { size: 19, color: C.ink, fam: UI });
      text("• Agar jadvalda takror yo'qligi aniq bo'lsa, bu ortiqcha sarflash!", 170, 440, { size: 18, color: C.soft, fam: UI });

      card(140, 500, 760, 240, { fill: '#f0fdf4', col: C.green, p: k });
      text("ALL Kalit So'zi Bilan Aniq Matematika:", 170, 545, { size: 20, weight: 700, color: C.green, fam: UI });
      text("(Qator chapda m marta, o'ngda n marta uchrasa):", 170, 585, { size: 18, color: C.soft, fam: UI });
      text("• UNION ALL     ==>  m + n marta (barcha qatorlar)", 170, 630, { size: 20, weight: 700, color: C.blue, fam: MONO });
      text("• INTERSECT ALL ==>  min(m, n) marta", 170, 675, { size: 20, weight: 700, color: C.green, fam: MONO });
      text("• EXCEPT ALL    ==>  max(m - n, 0) marta", 170, 720, { size: 20, weight: 700, color: C.red, fam: MONO });

      card(140, 770, 760, 150, { fill: '#eff6ff', col: C.blue, p: k });
      text("Maslahat: Takror bo'lmasligi aniq bo'lsa doimo UNION ALL", 170, 815, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("ishlating — u takror qidirmaydi va juda tez ishlaydi!", 170, 855, { size: 18, color: C.ink, fam: UI });

      // Right: NULL rule
      card(1000, 200, 820, 760, { fill: C.card, col: C.orange, p: k });
      pill("NULL va Takrorlar Qoidasi", 1410, 250, C.orange, k, 19);

      card(1040, 310, 740, 180, { fill: '#fff', col: C.orange, p: k });
      text("SELECT NULL, NULL  UNION  SELECT NULL, NULL;", 1070, 365, { size: 18, weight: 700, color: C.orange, fam: MONO });
      text("Natija: Faqat 1 ta (NULL, NULL) qatori qoladi!", 1070, 415, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Chunki to'plam amallarida NULL = NULL teng deb hisoblanadi.", 1070, 455, { size: 17, color: C.soft, fam: UI });

      card(1040, 520, 740, 400, { fill: '#fffdfa', col: C.orange, p: k });
      text("Muhim taqqoslash:", 1070, 565, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("• Oddiy SQL shartlarida: NULL = NULL noma'lum (NULL).", 1070, 615, { size: 19, color: C.soft, fam: UI });
      text("• To'plam amallarida (UNION, INTERSECT, EXCEPT):", 1070, 665, { size: 19, weight: 700, color: C.blue, fam: UI });
      text("  ikkita NULL bir-biriga TENG deb olinadi!", 1070, 710, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• Shu sababli ikkita NULL li qator takror deb topilib,", 1070, 765, { size: 19, color: C.ink, fam: UI });
      text("  sukut bo'yicha bittasi olib tashlanadi.", 1070, 805, { size: 19, color: C.ink, fam: UI });
    });
  }

  // 4. MOSLIK VA USTUVORLIK
  function sMoslikVaUstuvorlik(t) {
    heading("Union Compatible (Moslik) va Ustuvorlik", t, TM.scenes.moslik_va_ustuvorlik.s);

    const k = P(t, TM.scenes.moslik_va_ustuvorlik.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Moslik shartlari
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Union Compatible (Moslik) Shartlari", 520, 250, C.blue, k, 19);

      const rules = [
        { badge: "1. Ustunlar Soni", text: "Ikkala so'rovda ustunlar soni aynan bir xil bo'lishi shart.", col: C.blue },
        { badge: "2. Ustun Tiplari", text: "Mos o'rindagi ustunlar tiplari bir-biriga keladigan (compatible) bo'lishi lozim.", col: C.green },
        { badge: "3. Ustun Nomlari", text: "Natija ustunlarining nomlari BIRINCHI so'rovdan olinadi!", col: C.purple },
      ];

      rules.forEach((r, i) => {
        const ry = 320 + i * 130;
        card(140, ry, 760, 110, { fill: '#fff', col: r.col, p: k });
        pill(r.badge, 260, ry + 35, r.col, k, 18);
        text(r.text, 170, ry + 80, { size: 18, weight: 600, color: C.ink, fam: UI, maxW: 700 });
      });

      card(140, 730, 760, 190, { fill: '#eff6ff', col: C.blue, p: k });
      text("SELECT m AS x, n FROM a UNION SELECT m, n FROM b;", 170, 780, { size: 18, color: C.blue, fam: MONO });
      text("Natija ustunlari nomi: 'x' va 'n' (birinchi so'rovdan!).", 170, 835, { size: 19, weight: 700, color: C.ink, fam: UI });
      text("Oxirgi ORDER BY ham shu 'x' nomi bo'yicha saralashi mumkin.", 170, 875, { size: 18, color: C.soft, fam: UI });

      // Right: Ustuvorlik (Precedence)
      card(1000, 200, 820, 760, { fill: C.card, col: C.purple, p: k });
      pill("Ustuvorlik: INTERSECT Har Doim Birinchi!", 1410, 250, C.purple, k, 19);

      card(1040, 310, 740, 160, { fill: '#fff', col: C.purple, p: k });
      text("SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c;", 1070, 360, { size: 16, color: C.ink, fam: MONO });
      text("Xuddi: a UNION (b INTERSECT c) kabi bajariladi!", 1070, 420, { size: 20, weight: 700, color: C.purple, fam: UI });

      card(1040, 500, 740, 210, { fill: '#fdf4ff', col: C.purple, p: k });
      text("Matematik qoidalar:", 1070, 545, { size: 21, weight: 700, color: C.purple, fam: UI });
      text("• INTERSECT ko'paytirish (×) kabi eng yuqori ustuvorlikka ega.", 1070, 595, { size: 19, color: C.ink, fam: UI });
      text("• UNION va EXCEPT esa qo'shish (+) va ayirish (-) kabidir.", 1070, 640, { size: 19, color: C.ink, fam: UI });
      text("• Tartibni o'zgartirish uchun QAVSLARDAN foydalaniladi.", 1070, 685, { size: 19, weight: 700, color: C.blue, fam: UI });

      card(1040, 735, 740, 185, { fill: '#fff5f5', col: C.red, p: k });
      text("Kommutativlik (O'rin almashtirish):", 1070, 780, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• x UNION y  ==  y UNION x (o'rin almashsa bo'ladi)", 1070, 825, { size: 18, color: C.green, fam: UI });
      text("• x EXCEPT y  !=  y EXCEPT x (O'RIN ALMASHTIRIB BO'LMAYDI!)", 1070, 870, { size: 18, weight: 700, color: C.red, fam: UI });
    });
  }

  // 5. TARTIBLASH VA LIMIT
  function sTartiblashVaLimit(t) {
    heading("ORDER BY va LIMIT Qoidalari", t, TM.scenes.tartiblash_va_limit.s);

    const k = P(t, TM.scenes.tartiblash_va_limit.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Whole query ORDER BY / LIMIT
      card(100, 200, 840, 760, { fill: C.card, col: C.blue, p: k });
      pill("Butun Birlashgan Natijaga ORDER BY / LIMIT", 520, 250, C.blue, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT m, n FROM a", 170, 355, { size: 20, color: C.ink, fam: MONO });
      text("UNION", 170, 395, { size: 20, color: C.blue, fam: MONO });
      text("SELECT m, n FROM b", 170, 435, { size: 20, color: C.ink, fam: MONO });
      text("ORDER BY m DESC, n LIMIT 3; -- Butun natijaga!", 170, 475, { size: 19, weight: 700, color: C.orange, fam: MONO });

      card(140, 510, 760, 220, { fill: '#eff6ff', col: C.blue, p: k });
      text("Muhim qoidalar:", 170, 555, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("• Oxirdagi ORDER BY/LIMIT faqat ikkinchi qismga emas, BUTUN natijaga qo'llanadi.", 170, 605, { size: 19, color: C.ink, fam: UI, maxW: 700 });
      text("• PostgreSQL da saralash faqat natija ustun nomi bo'yicha bo'lishi shart (ORDER BY m + n xato beradi).", 170, 675, { size: 19, color: C.red, fam: UI, maxW: 700 });

      // Right: Sub-part ORDER BY / LIMIT
      card(1000, 200, 820, 760, { fill: C.card, col: C.green, p: k });
      pill("Alohida Qismga LIMIT Qo'yish: Qavslar", 1410, 250, C.green, k, 19);

      card(1040, 310, 740, 240, { fill: '#fff', col: C.green, p: k });
      text("(SELECT m FROM a ORDER BY m DESC LIMIT 1)", 1070, 360, { size: 18, color: C.green, fam: MONO });
      text("UNION", 1070, 410, { size: 18, color: C.blue, fam: MONO });
      text("(SELECT m FROM b ORDER BY m ASC LIMIT 1)", 1070, 460, { size: 18, color: C.green, fam: MONO });
      text("ORDER BY m; -- Yakuniy saralash", 1070, 510, { size: 18, weight: 700, color: C.orange, fam: MONO });

      card(1040, 580, 740, 240, { fill: '#f0fdf4', col: C.green, p: k });
      text("Mantiqiy tahlil:", 1070, 625, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• a jadvalidan faqat eng kattasi (3) olinadi.", 1070, 670, { size: 19, color: C.ink, fam: UI });
      text("• b jadvalidan faqat eng kichigi (1) olinadi.", 1070, 715, { size: 19, color: C.ink, fam: UI });
      text("• So'ngra ikkalasi birlashtirilib yakuniy tartiblanadi (1, 3).", 1070, 760, { size: 19, weight: 700, color: C.blue, fam: UI });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.uch_amal.s) sIntro(t);
    else if (t < TM.scenes.takrorlar_va_all.s) sUchAmal(t);
    else if (t < TM.scenes.moslik_va_ustuvorlik.s) sTakrorlarVaAll(t);
    else if (t < TM.scenes.tartiblash_va_limit.s) sMoslikVaUstuvorlik(t);
    else sTartiblashVaLimit(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
