// SQL 40-bob 1-qism: "Tushuncha" — Vaqt, tarix va audit
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

  // 1. VAQTGA BOG'LIQ MA'LUMOT (0 -> 16.99s)
  function sVaqtBogliq(t) {
    const k = P(t, 0.3, 1.0);
    hand("40-bob. Vaqt, Tarix va Audit", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("Vaqtga Bog'liq Ma'lumotlarni Loyihalash", 960, 220, { size: 68, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Narxlar o'zgarishi, to'liq amallar tarixi va yumshoq o'chirish usullari", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: Xavf
      card(140, 380, 780, 420, { fill: C.card, col: C.red, p: kBox });
      text("Eski Yondashuv: Ustiga Yozish (Overwrite)", 180, 430, { size: 25, weight: 700, color: C.red, fam: UI });
      text("UPDATE narxlar SET narx = 15000 WHERE id = 1;", 180, 465, { size: 18, color: C.soft, fam: MONO });

      sline(180, 495, 880, 495, { col: C.pencil, w: 1.5 });
      text("• O'tgan oydagi buyurtmalar narxi buziladi.", 180, 540, { size: 21, weight: 600, color: C.red, fam: UI });
      text("• Kim qachon o'zgartirgani haqida iz qolmaydi.", 180, 585, { size: 21, color: C.ink, fam: UI });
      text("• O'chirilgan foydalanuvchi ma'lumoti butunlay yo'qoladi.", 180, 630, { size: 21, color: C.ink, fam: UI });
      text("• Moliyaviy va huquqiy audit talablari bajarilmaydi.", 180, 675, { size: 21, color: C.ink, fam: UI });
      pill("Tarix yo'qolishi va hisobot buzilishi", 530, 755, C.red, kBox, 18);

      // O'ng: 3 ta to'g'ri loyihalash usuli
      const kSol = P(t, 7.5, 0.8);
      withA(kSol, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kSol });
        text("Uchta Asosiy Loyihalash Usuli:", 1040, 430, { size: 25, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1. Temporal Kalitlar (WITHOUT OVERLAPS):", 1040, 500, { size: 21, weight: 700, color: C.blue, fam: UI });
        text("   Qiymat qaysi davrda amal qilishini kesishmasdan saqlash.", 1040, 535, { size: 19, color: C.ink, fam: UI });

        text("2. Audit Jadvali va Triggerlar (History):", 1040, 585, { size: 21, weight: 700, color: C.purple, fam: UI });
        text("   Har bir INSERT, UPDATE, DELETE amalini to'liq qayd etish.", 1040, 620, { size: 19, color: C.ink, fam: UI });

        text("3. Yumshoq O'chirish (Soft Delete):", 1040, 670, { size: 21, weight: 700, color: C.orange, fam: UI });
        text("   Qatorni o'chirmay, ochirilgan vaqti va qisman indeks qo'llash.", 1040, 705, { size: 19, color: C.ink, fam: UI });
        pill("Shaffof va xavfsiz ma'lumotlar bazasi", 1390, 755, C.green, kSol, 18);
      });

      // Pastki xulosa
      const kFoot = P(t, 12.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Asosiy Tamoyil:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Vaqtga bog'liq ma'lumotlar ustiga yozilmaydi — ular davrlar orqali kengaytiriladi yoki auditda muhrlanadi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Bu yondashuv istalgan o'tmishdagi sana bo'yicha aniq holatni tiklash imkonini beradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. TEMPORAL KALITLAR (16.99 -> 33.21s)
  function sTemporalKalitlar(t) {
    heading("Temporal Kalitlar: WITHOUT OVERLAPS (PostgreSQL 18)", t, TM.scenes.temporal_kalitlar.s);

    const kCards = P(t, TM.scenes.temporal_kalitlar.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Sintaksis va mohiyat
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("PRIMARY KEY (id, amal_davri WITHOUT OVERLAPS)", 180, 430, { size: 22, weight: 700, color: C.blue, fam: MONO });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Kalitning oxirgi ustuni daterange / tsrange bo'ladi.", 180, 500, { size: 21, color: C.ink, fam: UI });
      text("• Tenglik emas, oraliqlar kesishishi tekshiriladi.", 180, 545, { size: 21, weight: 600, color: C.blue, fam: UI });
      text("• Bitta mahsulot uchun oraliqlar kesishmasligi kafolatlanadi.", 180, 590, { size: 21, color: C.ink, fam: UI });
      text("• Amalda EXCLUDE USING GIST (... WITH &&) ishlatiladi.", 180, 635, { size: 20, fam: MONO, color: C.soft });
      text("• Bo'sh oraliqqa (empty range) ruxsat berilmaydi.", 180, 680, { size: 21, color: C.ink, fam: UI });
      pill("Baza darajasida vaqt kesishmasligi", 530, 755, C.blue, kCards, 18);

      // O'ng: Visual oraliqlar chizmasi
      const kVis = P(t, 24.5, 0.8);
      withA(kVis, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.purple, p: kVis });
        text("Oraliqlar Tuzilishi: [boshi, oxiri)", 1040, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1-qator: [2026-01-01, 2026-02-01) -> 12 000 so'm", 1040, 500, { size: 20, fam: MONO, color: '#a6e3a1' });
        text("2-qator: [2026-02-01, )           -> 13 000 so'm", 1040, 545, { size: 20, fam: MONO, color: '#89b4fa' });

        sline(1040, 585, 1740, 585, { col: '#45475a', w: 1 });
        text("Yangi kiritish (Xato!):", 1040, 625, { size: 20, weight: 600, color: '#f38ba8', fam: UI });
        text("INSERT: [2026-01-15, 2026-01-20) -> 11 000", 1040, 665, { size: 20, fam: MONO, color: '#f38ba8' });
        text("--> ERROR: conflicting key value violates exclusion", 1040, 715, { size: 18, fam: MONO, color: '#f38ba8' });
      });

      // Pastki izoh
      const kFoot = P(t, 28.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.orange, p: kFoot });
        text("Yarim-ochiq oraliq [boshi, oxiri) afzalligi:", 180, 875, { size: 23, weight: 700, color: C.orange, fam: UI });
        text("1-fevral soat 00:00 da yanvar narxi tugaydi va fevral narxi boshlanadi. Agar yopiq [boshi, oxiri]", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("ishlatilsa, 1-fevral sanasida ikki narx to'qnashib, tizim xato bergan bo'lar edi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. PERIOD TASHQI KALIT (33.21 -> 48.70s)
  function sPeriodTashqiKalit(t) {
    heading("Temporal Tashqi Kalit: PERIOD (PostgreSQL 18)", t, TM.scenes.period_tashqi_kalit.s);

    const kCards = P(t, TM.scenes.period_tashqi_kalit.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Bola va Ota jadval aloqasi
      card(140, 380, 780, 420, { fill: C.card, col: C.blue, p: kCards });
      text("FOREIGN KEY (id, PERIOD davr) REFERENCES ...", 180, 430, { size: 21, weight: 700, color: C.blue, fam: MONO });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• Tashqi kalitning oxirgi ustuniga PERIOD qo'shiladi.", 180, 500, { size: 21, color: C.ink, fam: UI });
      text("• Oddiy ustunlar tenglik bo'yicha bog'lanadi.", 180, 545, { size: 21, color: C.ink, fam: UI });
      text("• PERIOD ustuni esa to'liq qamrov bo'yicha tekshiriladi.", 180, 590, { size: 21, weight: 600, color: C.blue, fam: UI });
      text("• Ota qatorlar bola davrini 100% qoplashi shart!", 180, 635, { size: 21, weight: 600, color: C.green, fam: UI });
      text("• Ota jadvalda kalit WITHOUT OVERLAPS bo'lishi kerak.", 180, 680, { size: 21, color: C.ink, fam: UI });
      pill("Davriy bog'liqlik yaxlitligi", 530, 755, C.blue, kCards, 18);

      // O'ng: Qamrov misollari
      const kCov = P(t, 40.5, 0.8);
      withA(kCov, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.purple, p: kCov });
        text("Aksiyalar Qamrovi Sinovi:", 1040, 430, { size: 24, weight: 700, color: C.purple, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("1-Aksiya: [2026-01-25, 2026-02-10)", 1040, 500, { size: 20, weight: 600, fam: MONO, color: C.green });
        text("• Yanvar va fevral narxlari birlashib to'liq qoplaydi.", 1040, 535, { size: 19, color: C.ink, fam: UI });
        text("--> Qabul qilindi (OK) ✓", 1040, 570, { size: 19, weight: 700, color: C.green, fam: UI });

        sline(1040, 605, 1740, 605, { col: C.pencil, w: 1 });
        text("2-Aksiya: [2025-12-25, 2026-01-10)", 1040, 640, { size: 20, weight: 600, fam: MONO, color: C.red });
        text("• 2025-yil dekabrda mahsulotning narxi yo'q!", 1040, 675, { size: 19, color: C.ink, fam: UI });
        text("--> ERROR: violates foreign key constraint ✗", 1040, 710, { size: 19, weight: 700, color: C.red, fam: UI });
      });

      // Pastki xulosa
      const kFoot = P(t, 44.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.green, p: kFoot });
        text("Biznes Mantig'i Baza Darajasida:", 180, 875, { size: 23, weight: 700, color: C.green, fam: UI });
        text("Hech qanday dasturchi yoki ilova mahsulot narxi belgilanmagan muddatga aksiya e'lon qila olmaydi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("Ma'lumotlar yaxlitligi SQL darajasida qat'iy himoyalangan.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. AUDIT VA TARIX (48.70 -> 65.03s)
  function sAuditVaTarix(t) {
    heading("Audit Ustunlari va Universal Audit Jadvali", t, TM.scenes.audit_va_tarix.s);

    const kCards = P(t, TM.scenes.audit_va_tarix.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Audit ustunlari
      card(140, 380, 780, 420, { fill: C.card, col: C.orange, p: kCards });
      text("Audit Ustunlari (Har Bir Jadvalda):", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("• yaratilgan timestamptz DEFAULT now()", 180, 505, { size: 20, fam: MONO, color: C.blue });
      text("• yangilangan timestamptz DEFAULT now()", 180, 545, { size: 20, fam: MONO, color: C.blue });

      text("Yangilanish mexanizmi:", 180, 605, { size: 21, weight: 700, color: C.ink, fam: UI });
      text("• Postgres: BEFORE UPDATE trigger (NEW.yangilangan = now())", 180, 645, { size: 19, color: C.ink, fam: UI });
      text("• MySQL: ON UPDATE CURRENT_TIMESTAMP", 180, 685, { size: 19, color: C.ink, fam: UI });
      pill("Yaratilish va oxirgi o'zgarish vaqti", 530, 755, C.orange, kCards, 18);

      // O'ng: Universal Audit jadvali
      const kAud = P(t, 56.5, 0.8);
      withA(kAud, () => {
        card(1000, 380, 780, 420, { fill: '#1e1e2e', col: C.green, p: kAud });
        text("xodimlar_audit (Amallar Tarixi):", 1040, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1040, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("amal | kim      | id | ism  | maosh", 1040, 500, { size: 20, weight: 700, fam: MONO, color: '#89b4fa' });
        sline(1040, 520, 1740, 520, { col: '#45475a', w: 1 });
        text(" I   | postgres |  1 | Ali  | 5000", 1040, 560, { size: 20, fam: MONO, color: '#a6e3a1' });
        text(" I   | postgres |  2 | Vali | 4000", 1040, 605, { size: 20, fam: MONO, color: '#a6e3a1' });
        text(" U   | postgres |  1 | Ali  | 5500", 1040, 650, { size: 20, fam: MONO, color: '#f9e2af' });
        text(" D   | postgres |  2 | Vali | 4000", 1040, 695, { size: 20, fam: MONO, color: '#f38ba8' });

        pill("TG_OP, OLD va NEW qatorlar", 1390, 755, C.green, kAud, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 61.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Audit Jadvalining Afzalligi:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Qator o'chirilsa ham, uning butun hayotiy sikli (kim yaratdi, qachon oyligi oshdi, kim o'chirdi)", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("audit jadvalida abadiy saqlanadi. Ilova kodiga tayanmasdan xavfsizlik ta'minlanadi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 5. YUMSHOQ O'CHIRISH (65.03 -> 81.64s)
  function sYumshoqOchirish(t) {
    heading("Yumshoq O'chirish (Soft Delete) va Qisman Indeks", t, TM.scenes.yumshoq_ochirish.s);

    const kCards = P(t, TM.scenes.yumshoq_ochirish.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: Yumshoq o'chirish mohiyati
      card(140, 380, 780, 420, { fill: C.card, col: C.orange, p: kCards });
      text("Yumshoq O'chirish (Soft Delete):", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 455, 880, 455, { col: C.pencil, w: 1.5 });

      text("CREATE TABLE foydalanuvchilar (", 180, 500, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id int PRIMARY KEY, email text NOT NULL,", 200, 535, { size: 19, fam: MONO, color: C.blue });
      text("  ochirilgan timestamptz", 200, 570, { size: 19, fam: MONO, color: C.blue });
      text(");", 180, 605, { size: 20, fam: MONO, color: C.ink });

      text("O'chirish amali: DELETE emas, UPDATE:", 180, 655, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("UPDATE foydalanuvchilar SET ochirilgan = now();", 180, 690, { size: 18, fam: MONO, color: C.orange });
      pill("Qator jismonan o'chirilmaydi", 530, 755, C.orange, kCards, 18);

      // O'ng: Qisman unique indeks
      const kPart = P(t, 71.5, 0.8);
      withA(kPart, () => {
        card(1000, 380, 780, 420, { fill: C.card, col: C.green, p: kPart });
        text("Qisman Unique Indeks (Partial Index):", 1040, 430, { size: 24, weight: 700, color: C.green, fam: UI });
        sline(1040, 455, 1740, 455, { col: C.pencil, w: 1.5 });

        text("CREATE UNIQUE INDEX ... ON foydalanuvchilar (email)", 1040, 500, { size: 18, weight: 700, fam: MONO, color: C.blue });
        text("  WHERE ochirilgan IS NULL;", 1060, 535, { size: 20, weight: 700, fam: MONO, color: C.green });

        sline(1040, 570, 1740, 570, { col: C.pencil, w: 1 });
        text("• Ikkita faol ali@misol.uz -> XATO (rad etiladi)!", 1040, 610, { size: 20, weight: 600, color: C.red, fam: UI });
        text("• Birinchi Ali o'chirilgach, yangi Ali ro'yxatdan", 1040, 655, { size: 20, color: C.ink, fam: UI });
        text("  o'ta oladi, chunki eski Ali indeksga kirmaydi.", 1040, 690, { size: 20, color: C.ink, fam: UI });
        pill("WHERE shartli ixcham va xavfsiz indeks", 1390, 755, C.green, kPart, 18);
      });

      // Pastki xulosa
      const kFoot = P(t, 75.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("Xulosa: Zamonaviy Ma'lumotlar Arxitekturasi", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("1. Davriy narx va tariflar uchun: WITHOUT OVERLAPS va PERIOD tashqi kaliti.", 180, 920, { size: 20, weight: 600, color: C.ink, fam: UI });
        text("2. Amallar auditi uchun: Tarix jadvali.  3. Xavfsiz o'chirish uchun: Qisman indeksli soft delete.", 180, 960, { size: 20, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.temporal_kalitlar.s) {
      sVaqtBogliq(t);
    } else if (t < TM.scenes.period_tashqi_kalit.s) {
      sTemporalKalitlar(t);
    } else if (t < TM.scenes.audit_va_tarix.s) {
      sPeriodTashqiKalit(t);
    } else if (t < TM.scenes.yumshoq_ochirish.s) {
      sAuditVaTarix(t);
    } else {
      sYumshoqOchirish(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
