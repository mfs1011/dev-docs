// SQL 40-bob 3-qism: "Dialektlar" — Vaqt, tarix va audit
(function () {
  const { L, W } = window.SY, TM = window.TM, TTY = window.TTY;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. DIALEKTLAR JADVALI (0 -> 15.54s)
  function sDialektlarJadvali(t) {
    const k = P(t, 0.3, 1.0);
    hand("40-bob. Dialektlar Solishtiruvi", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL, MySQL va SQLite: Vaqt va Audit Xaritasi", 960, 220, { size: 66, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Temporal kalitlar, avto-yangilanish, triggerlar va qisman indekslar", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // 3 ta karta
      // 1: Postgres
      card(120, 380, 520, 420, { fill: C.card, col: C.blue, p: kBox });
      text("PostgreSQL 18.6", 150, 430, { size: 25, weight: 700, color: C.blue, fam: UI });
      sline(150, 455, 610, 455, { col: C.pencil, w: 1.5 });

      text("• WITHOUT OVERLAPS kaliti (18)", 150, 500, { size: 19, weight: 600, color: C.green, fam: UI });
      text("• PERIOD tashqi kaliti (18)", 150, 540, { size: 19, weight: 600, color: C.green, fam: UI });
      text("• EXCLUDE USING GIST", 150, 580, { size: 19, fam: MONO, color: C.ink });
      text("• Bitta trigger: INSERT OR UPDATE", 150, 620, { size: 18, color: C.ink, fam: UI });
      text("  OR DELETE (TG_OP)", 150, 650, { size: 18, fam: MONO, color: C.soft });
      text("• Qisman unique indeks: BOR ✓", 150, 695, { size: 19, weight: 700, color: C.blue, fam: UI });
      pill("Eng boy temporal imkoniyatlar", 380, 765, C.blue, kBox, 16);

      // 2: MySQL
      const kMy = P(t, 5.0, 0.8);
      withA(kMy, () => {
        card(680, 380, 560, 420, { fill: C.card, col: C.orange, p: kMy });
        text("MySQL 9.7.2", 710, 430, { size: 25, weight: 700, color: C.orange, fam: UI });
        sline(710, 455, 1210, 455, { col: C.pencil, w: 1.5 });

        text("• Temporal kalitlar: YO'Q ✗", 710, 500, { size: 19, weight: 600, color: C.red, fam: UI });
        text("• ON UPDATE CURRENT_TIMESTAMP", 710, 540, { size: 18, weight: 700, fam: MONO, color: C.green });
        text("  (faqat qiymat o'zgarsa yangilaydi)", 710, 575, { size: 17, color: C.soft, fam: UI });
        text("• Har hodisaga alohida trigger", 710, 620, { size: 19, color: C.ink, fam: UI });
        text("• Qisman unique indeks: YO'Q ✗", 710, 665, { size: 19, weight: 600, color: C.red, fam: UI });
        pill("O'rnatilgan avto-yangilanish", 960, 765, C.orange, kMy, 16);
      });

      // 3: SQLite
      const kSq = P(t, 8.5, 0.8);
      withA(kSq, () => {
        card(1280, 380, 520, 420, { fill: C.card, col: C.green, p: kSq });
        text("SQLite 3.54.0", 1310, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        sline(1310, 455, 1770, 455, { col: C.pencil, w: 1.5 });

        text("• Temporal kalitlar: YO'Q ✗", 1310, 500, { size: 19, weight: 600, color: C.red, fam: UI });
        text("• AFTER UPDATE trigger + WHEN", 1310, 540, { size: 18, weight: 600, fam: MONO, color: C.green });
        text("  (cheksiz tsikldan himoya)", 1310, 575, { size: 17, color: C.soft, fam: UI });
        text("• UPDATE OF ustunlar filtri", 1310, 620, { size: 19, color: C.ink, fam: UI });
        text("• Qisman unique indeks: BOR ✓", 1310, 665, { size: 19, weight: 700, color: C.green, fam: UI });
        pill("Qisman indeks to'liq ishlaydi", 1540, 765, C.green, kSq, 16);
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 12.0, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Xulosa Solishtiruvi:", 160, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("PostgreSQL 18 temporal kalitlar va to'liq audit bo'yicha eng kuchli imkoniyatlarga ega.", 160, 920, { size: 20, color: C.ink, fam: UI });
        text("SQLite ham yumshoq o'chirish uchun zarur bo'lgan qisman unique indeksni to'liq quvvatlaydi.", 160, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. YANGILANISH MEXANIZMI (15.54 -> 31.56s)
  function sYangilanishMexanizmi(t) {
    heading("MySQL va SQLite: Avtomatik Yangilanish Sinovlari", t, TM.scenes.yangilanish_mexanizmi.s);

    const kCards = P(t, TM.scenes.yangilanish_mexanizmi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: MySQL ON UPDATE CURRENT_TIMESTAMP
      card(140, 380, 800, 420, { fill: C.card, col: C.orange, p: kCards });
      text("MySQL: ON UPDATE CURRENT_TIMESTAMP", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 455, 900, 455, { col: C.pencil, w: 1.5 });

      text("yangilangan DATETIME ON UPDATE CURRENT_TIMESTAMP", 180, 500, { size: 18, weight: 700, fam: MONO, color: C.ink });

      text("1. Qiymat o'zgarmasa (maosh = 5000):", 180, 555, { size: 20, weight: 600, color: C.red, fam: UI });
      text("   ROW_COUNT() = 0  -->  yangilandi = 0 (O'zgarmadi!)", 180, 595, { size: 18, fam: MONO, color: C.red });

      text("2. Qiymat haqiqatan o'zgarsa (maosh = 5500):", 180, 650, { size: 20, weight: 600, color: C.green, fam: UI });
      text("   ROW_COUNT() = 1  -->  yangilandi = 1 (Yangilandi!) ✓", 180, 690, { size: 18, weight: 700, fam: MONO, color: C.green });

      pill("Haqiqiy o'zgarish bo'lgandagina vaqt yangilanadi", 540, 765, C.orange, kCards, 16);

      // O'ng: SQLite Trigger + WHEN
      const kSq = P(t, 22.5, 0.8);
      withA(kSq, () => {
        card(980, 380, 800, 420, { fill: C.card, col: C.green, p: kSq });
        text("SQLite: AFTER UPDATE Trigger va WHEN", 1020, 430, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1020, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("CREATE TRIGGER x_yangilangan AFTER UPDATE ON xodimlar", 1020, 495, { size: 17, weight: 700, fam: MONO, color: C.blue });
        text("FOR EACH ROW WHEN NEW.yangilangan = OLD.yangilangan", 1020, 530, { size: 17, weight: 700, fam: MONO, color: C.green });
        text("BEGIN", 1020, 565, { size: 18, fam: MONO, color: C.ink });
        text("  UPDATE xodimlar SET yangilangan = datetime('now')", 1040, 600, { size: 17, fam: MONO, color: C.ink });
        text("  WHERE id = NEW.id;", 1040, 635, { size: 17, fam: MONO, color: C.ink });
        text("END;", 1020, 670, { size: 18, fam: MONO, color: C.ink });

        text("• WHEN sharti trigger o'zini qayta chaqirishini to'xtatadi.", 1020, 715, { size: 18, color: C.soft, fam: UI });
        pill("WHEN sharti cheksiz tsikldan saqlaydi", 1380, 765, C.green, kSq, 16);
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 27.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fbfbfb', col: C.pencil, p: kFoot });
        text("Amaliy Farq:", 180, 875, { size: 23, weight: 700, color: C.ink, fam: UI });
        text("MySQL'da ustun xususiyati yetarli bo'lsa, PostgreSQL da BEFORE trigger, SQLite'da esa WHEN shartli", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("AFTER trigger zarur bo'ladi. Har bir dialektning o'ziga xos mexanizmini to'g'ri qo'llash shart.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. ENG KATTA XATOLAR (31.56 -> 48.36s)
  function sEngKattaXatolar(t) {
    heading("Vaqt va Audit Loyihalashda Eng Katta Xatolar", t, TM.scenes.eng_katta_xatolar.s);

    const kCards = P(t, TM.scenes.eng_katta_xatolar.s + 0.3, 0.8);
    withA(kCards, () => {
      // 3 ta xato kartasi
      // 1: Yopiq oraliq
      card(120, 380, 520, 420, { fill: C.card, col: C.red, p: kCards });
      text("1. Davrlarni [a, b] Saqlash", 150, 430, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(150, 455, 610, 455, { col: C.pencil, w: 1.5 });

      text("Nega yomon:", 150, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("Ikkala chegara ham kirsa,", 150, 540, { size: 19, weight: 600, color: C.red, fam: UI });
      text("tutash kunda oraliqlar kesishadi.", 150, 575, { size: 19, weight: 600, color: C.red, fam: UI });
      text("Baza kiritishni rad etadi.", 150, 615, { size: 19, color: C.ink, fam: UI });

      text("To'g'ri yo'l:", 150, 670, { size: 20, weight: 700, color: C.green, fam: UI });
      text("Doimo [boshi, oxiri) ishlating.", 150, 705, { size: 19, fam: MONO, color: C.green });
      pill("Yarim ochiq oraliq qoidasi", 380, 765, C.red, kCards, 16);

      // 2: Oddiy unikal indeks
      const kX2 = P(t, 38.5, 0.8);
      withA(kX2, () => {
        card(680, 380, 560, 420, { fill: C.card, col: C.orange, p: kX2 });
        text("2. Soft Delete'da Oddiy UNIQUE", 710, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
        sline(710, 455, 1210, 455, { col: C.pencil, w: 1.5 });

        text("Nega yomon:", 710, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("O'chirilgan yozuv bazada yotadi.", 710, 540, { size: 19, weight: 600, color: C.red, fam: UI });
        text("Uning email'i bilan yangi foydalanuvchi", 710, 575, { size: 19, weight: 600, color: C.red, fam: UI });
        text("hech qachon ro'yxatdan o'ta olmaydi.", 710, 615, { size: 19, color: C.ink, fam: UI });

        text("To'g'ri yo'l:", 710, 670, { size: 20, weight: 700, color: C.green, fam: UI });
        text("UNIQUE INDEX ... WHERE ochirilgan IS NULL", 710, 705, { size: 16, fam: MONO, color: C.green });
        pill("Qisman unikal indeks zarur", 960, 765, C.orange, kX2, 16);
      });

      // 3: Bo'sh UPDATE audit
      const kX3 = P(t, 43.5, 0.8);
      withA(kX3, () => {
        card(1280, 380, 520, 420, { fill: C.card, col: C.purple, p: kX3 });
        text("3. O'zgarishsiz UPDATE Auditi", 1310, 430, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1310, 455, 1770, 455, { col: C.pencil, w: 1.5 });

        text("Nega yomon:", 1310, 500, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("Qiymat o'zgarmagan holatda ham", 1310, 540, { size: 19, weight: 600, color: C.red, fam: UI });
        text("audit jadvaliga yangi qator yoziladi.", 1310, 575, { size: 19, weight: 600, color: C.red, fam: UI });
        text("Audit axlat bilan to'ladi.", 1310, 615, { size: 19, color: C.ink, fam: UI });

        text("To'g'ri yo'l:", 1310, 670, { size: 20, weight: 700, color: C.green, fam: UI });
        text("WHEN (OLD.* IS DISTINCT FROM NEW.*)", 1310, 705, { size: 15, fam: MONO, color: C.green });
        pill("Faqat haqiqiy o'zgarishni yozing", 1540, 765, C.purple, kX3, 16);
      });

      // Pastki izoh
      const kFoot = P(t, 45.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("So'rovlarda Yumshoq O'chirishni Unutmang:", 160, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("SELECT so'rovlarida har doim WHERE ochirilgan IS NULL sharti bo'lishi shart. Buni osonlashtirish uchun", 160, 920, { size: 20, color: C.ink, fam: UI });
        text("alohida 'faol_foydalanuvchilar' deb nomlangan VIEW yaratib qo'yish eng toza arxitektura yechimidir.", 160, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. OLTIN TAVSIYALAR (48.36 -> 66.42s)
  function sOltinTavsiyalar(t) {
    heading("Vaqt, Tarix va Auditning Me'moriy Qoidalari", t, TM.scenes.oltin_tavsiyalar.s);

    const kCards = P(t, TM.scenes.oltin_tavsiyalar.s + 0.3, 0.8);
    withA(kCards, () => {
      // 2 ta katta blok
      // Chap: Temporal va Audit
      card(120, 380, 800, 420, { fill: C.card, col: C.blue, p: kCards });
      text("1. Temporal va Audit Arxitekturasi:", 160, 430, { size: 25, weight: 700, color: C.blue, fam: UI });
      sline(160, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Narxlar va Tariflar: WITHOUT OVERLAPS", 160, 505, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  O'tmishdagi narxlar o'zgarmasdan saqlanadi, har bir sana bo'yicha aniq.", 160, 540, { size: 19, color: C.soft, fam: UI });

      text("• Aloqador Muddatlar: PERIOD Tashqi Kaliti", 160, 600, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("  Aksiya va a'zolik faqat ota narx davrida amal qilishini kafolatlaydi.", 160, 635, { size: 19, color: C.soft, fam: UI });

      text("• Xavfsizlik va Tekshiruv: Universal Audit Jadvali", 160, 685, { size: 20, weight: 700, color: C.green, fam: UI });
      pill("Baza darajasidagi vaqt yaxlitligi", 520, 765, C.blue, kCards, 16);

      // O'ng: Soft delete va View
      const kRight = P(t, 55.5, 0.8);
      withA(kRight, () => {
        card(960, 380, 840, 420, { fill: C.card, col: C.green, p: kRight });
        text("2. Yumshoq O'chirish va So'rovlar:", 1000, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        sline(1000, 455, 1760, 455, { col: C.pencil, w: 1.5 });

        text("• Qisman Indeks (WHERE ochirilgan IS NULL):", 1000, 505, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("  Faqat tirik qatorlarni indekslaydi. Indeks ixcham va tez ishlaydi.", 1000, 540, { size: 19, color: C.soft, fam: UI });

        text("• So'rovlar Xavfsizligi: Faol VIEW'lar", 1000, 600, { size: 20, weight: 700, color: C.ink, fam: UI });
        text("  Ilovalar to'g'ridan-to'g'ri jadvalga emas, faol qatorlarni filtrlaydigan", 1000, 635, { size: 19, color: C.soft, fam: UI });
        text("  view orqali murojaat qilsa, o'chirilgan ma'lumot hisobotga tushmaydi.", 1000, 670, { size: 19, color: C.soft, fam: UI });

        pill("Ixcham indeks + Xatosiz hisobotlar", 1380, 765, C.green, kRight, 16);
      });

      // Pastki xulosa kartasi
      const kFoot = P(t, 60.5, 0.8);
      withA(kFoot, () => {
        card(120, 830, 1680, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Yakuniy Me'moriy Xulosa:", 160, 875, { size: 24, weight: 700, color: C.blue, fam: UI });
        text("Vaqt va tarixni to'g'ri loyihalash ma'lumotlar yo'qolishining oldini oladi va biznes hisobotlarining", 160, 920, { size: 21, weight: 600, color: C.ink, fam: UI });
        text("har doim yuz foiz ishonchli va tekshirilishi mumkin (audit qilinadigan) bo'lishini ta'minlaydi.", 160, 960, { size: 21, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.yangilanish_mexanizmi.s) {
      sDialektlarJadvali(t);
    } else if (t < TM.scenes.eng_katta_xatolar.s) {
      sYangilanishMexanizmi(t);
    } else if (t < TM.scenes.oltin_tavsiyalar.s) {
      sEngKattaXatolar(t);
    } else {
      sOltinTavsiyalar(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
