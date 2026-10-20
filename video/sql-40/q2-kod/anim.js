// SQL 40-bob 2-qism: "Kod" — Vaqt, tarix va audit
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

  // 1. TEMPORAL NARXLAR (0 -> 15.27s)
  function sTemporalNarxlar(t) {
    const k = P(t, 0.3, 1.0);
    hand("40-bob. Amaliy Kod va Tajribalar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18.6: WITHOUT OVERLAPS Kaliti", 960, 220, { size: 66, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Mahsulot narxlari tarixida kesishuvchi davrlarni cheklash", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: SQL kod
      card(140, 380, 800, 420, { fill: C.card, col: C.blue, p: kBox });
      text("PostgreSQL 18.6 da Jadval Yaratish:", 180, 430, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE narxlar (", 180, 480, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  mahsulot_id int,", 200, 515, { size: 19, fam: MONO, color: C.ink });
      text("  amal_davri  daterange,", 200, 550, { size: 19, fam: MONO, color: C.ink });
      text("  narx        int NOT NULL,", 200, 585, { size: 19, fam: MONO, color: C.ink });
      text("  PRIMARY KEY (mahsulot_id, amal_davri WITHOUT OVERLAPS)", 200, 620, { size: 17, weight: 700, fam: MONO, color: C.blue });
      text(");", 180, 655, { size: 20, fam: MONO, color: C.ink });

      sline(180, 690, 900, 690, { col: C.pencil, w: 1.5 });
      text("INSERT INTO narxlar VALUES", 180, 725, { size: 19, fam: MONO, color: C.soft });
      text("  (1, '[2026-01-01, 2026-02-01)', 12000), (1, '[2026-02-01,)', 13000);", 180, 755, { size: 16, fam: MONO, color: C.green });
      pill("WITHOUT OVERLAPS kaliti", 540, 780, C.blue, kBox, 16);

      // O'ng: TTY Natijasi va Xato
      const kRes = P(t, 6.0, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.red, p: kRes });
        text("Terminal: Kesishuvchi Oraliq Kiritish", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("INSERT INTO narxlar VALUES", 1020, 500, { size: 19, fam: MONO, color: '#cdd6f4' });
        text("  (1, '[2026-01-15, 2026-01-20)', 11000);", 1020, 535, { size: 19, weight: 700, fam: MONO, color: '#f38ba8' });

        sline(1020, 570, 1740, 570, { col: '#45475a', w: 1 });
        text("ERROR: conflicting key value violates exclusion constraint", 1020, 615, { size: 18, weight: 700, fam: MONO, color: '#f38ba8' });
        text("DETAIL: Key (mahsulot_id, amal_davri)=(1, [2026-01-15, 2026-01-20))", 1020, 655, { size: 16, fam: MONO, color: '#f38ba8' });
        text("conflicts with existing key (1, [2026-01-01, 2026-02-01)).", 1020, 690, { size: 16, fam: MONO, color: '#f38ba8' });

        sline(1020, 725, 1740, 725, { col: '#45475a', w: 1 });
        text("EXCLUDE USING GIST avtomatik ishga tushdi!", 1020, 765, { size: 18, weight: 600, color: '#a6e3a1', fam: UI });
      });

      // Pastki izoh kartasi
      const kFoot = P(t, 10.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.blue, p: kFoot });
        text("Sanadagi Narxni Topish: amal_davri @> date '2026-01-20'", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("SELECT narx FROM narxlar WHERE mahsulot_id = 1 AND amal_davri @> date '2026-01-20'; --> 12000 so'm.", 180, 920, { size: 20, fam: MONO, color: C.ink });
        text("Daterange oraliqlari GIST indeksi bilan zaryadlangan bo'lib, sanalar bo'yicha qidiruv bir zumda ishlaydi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. PERIOD AKSIYALAR (15.27 -> 29.03s)
  function sPeriodAksiyalar(t) {
    heading("PostgreSQL 18.6: PERIOD Tashqi Kaliti Sinovi", t, TM.scenes.period_aksiyalar.s);

    const kCards = P(t, TM.scenes.period_aksiyalar.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: SQL jadvallar
      card(140, 380, 800, 420, { fill: C.card, col: C.purple, p: kCards });
      text("Aksiyalar Jadvaliga PERIOD Bog'lash:", 180, 430, { size: 24, weight: 700, color: C.purple, fam: UI });

      text("CREATE TABLE aksiyalar (", 180, 480, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id int PRIMARY KEY,", 200, 515, { size: 19, fam: MONO, color: C.ink });
      text("  mahsulot_id int,", 200, 550, { size: 19, fam: MONO, color: C.ink });
      text("  davr daterange,", 200, 585, { size: 19, fam: MONO, color: C.ink });
      text("  FOREIGN KEY (mahsulot_id, PERIOD davr)", 200, 620, { size: 18, weight: 700, fam: MONO, color: C.purple });
      text("    REFERENCES narxlar (mahsulot_id, PERIOD amal_davri)", 200, 655, { size: 17, weight: 700, fam: MONO, color: C.purple });
      text(");", 180, 690, { size: 20, fam: MONO, color: C.ink });

      sline(180, 720, 900, 720, { col: C.pencil, w: 1.5 });
      pill("Ota qatorlar bola davrini to'liq qoplashi shart", 540, 770, C.purple, kCards, 16);

      // O'ng: TTY Natijasi
      const kRes = P(t, 20.5, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.green, p: kRes });
        text("Terminal: Qamrov Sinovlari", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("-- 1-Aksiya: Yanvar va Fevral narxlari qoplaydi", 1020, 495, { size: 18, fam: MONO, color: '#a6adc8' });
        text("INSERT: (1, 1, '[2026-01-25, 2026-02-10)')", 1020, 530, { size: 19, fam: MONO, color: '#a6e3a1' });
        text("--> INSERT 0 1 (Qabul qilindi!) ✓", 1020, 565, { size: 19, weight: 700, fam: MONO, color: '#a6e3a1' });

        sline(1020, 600, 1740, 600, { col: '#45475a', w: 1 });
        text("-- 2-Aksiya: 2025-yil dekabrda narx yo'q!", 1020, 635, { size: 18, fam: MONO, color: '#f38ba8' });
        text("INSERT: (2, 2, '[2025-12-25, 2026-01-10)')", 1020, 670, { size: 19, fam: MONO, color: '#f38ba8' });
        text("--> ERROR: violates foreign key constraint", 1020, 715, { size: 19, weight: 700, fam: MONO, color: '#f38ba8' });
        text("    Key (2, davr) is not present in table narxlar.", 1020, 755, { size: 17, fam: MONO, color: '#f38ba8' });
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 24.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.purple, p: kFoot });
        text("Muhim Xususiyat: Birgalikdagi Qamrov (Combined Coverage)", 180, 875, { size: 23, weight: 700, color: C.purple, fam: UI });
        text("1-aksiya bitta emas, ikkita alohida narx qatorini kesib o'tdi, ammo ular uzluksiz bo'lgani uchun qabul qilindi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("PERIOD kaliti ko'p davrli uzluksiz qamrovni o'zi avtomatik tahlil qila oladi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. AUDIT JADVALI VA TRIGGER (29.03 -> 43.53s)
  function sAuditTrigger(t) {
    heading("Xodimlar Audit Tizimi: BEFORE va AFTER Triggerlar", t, TM.scenes.audit_jadvali_va_trigger.s);

    const kAudit = P(t, TM.scenes.audit_jadvali_va_trigger.s + 0.3, 0.8);
    withA(kAudit, () => {
      // Chap: Trigger funksiyasi
      card(140, 380, 800, 420, { fill: C.card, col: C.green, p: kAudit });
      text("Universal Audit Trigger Funksiyasi:", 180, 430, { size: 24, weight: 700, color: C.green, fam: UI });

      text("IF (TG_OP = 'DELETE') THEN", 180, 480, { size: 19, weight: 700, fam: MONO, color: C.red });
      text("  INSERT INTO xodimlar_audit SELECT 'D', now(), current_user, OLD.*;", 200, 515, { size: 17, fam: MONO, color: C.ink });
      text("ELSIF (TG_OP = 'UPDATE') THEN", 180, 555, { size: 19, weight: 700, fam: MONO, color: C.orange });
      text("  INSERT INTO xodimlar_audit SELECT 'U', now(), current_user, NEW.*;", 200, 590, { size: 17, fam: MONO, color: C.ink });
      text("ELSIF (TG_OP = 'INSERT') THEN", 180, 630, { size: 19, weight: 700, fam: MONO, color: C.blue });
      text("  INSERT INTO xodimlar_audit SELECT 'I', now(), current_user, NEW.*;", 200, 665, { size: 17, fam: MONO, color: C.ink });
      text("END IF; RETURN NULL; -- AFTER trigger", 180, 705, { size: 19, color: C.soft, fam: MONO });

      sline(180, 735, 900, 735, { col: C.pencil, w: 1.5 });
      pill("Barcha amallar bitta triggerda", 540, 775, C.green, kAudit, 16);

      // O'ng: TTY Natijasi
      const kRes = P(t, 34.5, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.blue, p: kRes });
        text("Terminal: xodimlar_audit Jadvali", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("amal | kim      | id | ism  | maosh", 1020, 495, { size: 21, weight: 700, fam: MONO, color: '#89b4fa' });
        sline(1020, 515, 1740, 515, { col: '#45475a', w: 1 });
        text(" I   | postgres |  1 | Ali  | 5000", 1020, 560, { size: 21, fam: MONO, color: '#a6e3a1' });
        text(" I   | postgres |  2 | Vali | 4000", 1020, 615, { size: 21, fam: MONO, color: '#a6e3a1' });
        text(" U   | postgres |  1 | Ali  | 5500", 1020, 670, { size: 21, fam: MONO, color: '#f9e2af' });
        text(" D   | postgres |  2 | Vali | 4000", 1020, 725, { size: 21, weight: 700, fam: MONO, color: '#f38ba8' });

        sline(1020, 755, 1740, 755, { col: '#45475a', w: 1 });
        pill("Vali asosiy jadvaldan o'chdi, lekin auditda saqlanib qoldi!", 1380, 775, C.blue, kRes, 15);
      });

      // Pastki izoh kartasi
      const kFoot = P(t, 39.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("O'zgarishsiz UPDATE'larni Filtrlash:", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Agar UPDATE ma'lumotni o'zgartirmasa (SET maosh = 5000), audit jadvali behuda to'lmasligi uchun", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("triggerga WHEN (OLD.* IS DISTINCT FROM NEW.*) shartini berish tavsiya qilinadi.", 180, 960, { size: 20, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  // 4. YUMSHOQ O'CHIRISH VA QISMAN INDEKS (43.53 -> 60.58s)
  function sYumshoqQisman(t) {
    heading("Yumshoq O'chirish: Qisman Unique Indeks Sinovi", t, TM.scenes.yumshoq_ochirish_qisman.s);

    const kSoft = P(t, TM.scenes.yumshoq_ochirish_qisman.s + 0.3, 0.8);
    withA(kSoft, () => {
      // Chap: Qisman unique indeks
      card(140, 380, 800, 420, { fill: C.card, col: C.orange, p: kSoft });
      text("Foydalanuvchilar va Qisman Indeks:", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("CREATE TABLE foydalanuvchilar (", 180, 480, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id int PRIMARY KEY, email text NOT NULL,", 200, 515, { size: 19, fam: MONO, color: C.ink });
      text("  ochirilgan timestamptz", 200, 550, { size: 19, fam: MONO, color: C.ink });
      text(");", 180, 585, { size: 20, fam: MONO, color: C.ink });

      text("CREATE UNIQUE INDEX foydalanuvchilar_email_faol", 180, 630, { size: 18, weight: 700, fam: MONO, color: C.blue });
      text("  ON foydalanuvchilar (email)", 180, 665, { size: 18, weight: 700, fam: MONO, color: C.blue });
      text("  WHERE ochirilgan IS NULL;", 180, 700, { size: 19, weight: 700, fam: MONO, color: C.green });

      sline(180, 730, 900, 730, { col: C.pencil, w: 1.5 });
      pill("Faqat faol foydalanuvchilar orasida unikal", 540, 775, C.orange, kSoft, 16);

      // O'ng: TTY Natijasi
      const kRes = P(t, 49.5, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.green, p: kRes });
        text("Terminal: Yumshoq O'chirish va Qayta Qo'shish", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("1. Ikkinchi faol Ali kiritilganda:", 1020, 495, { size: 19, weight: 600, color: '#f38ba8', fam: UI });
        text("   --> ERROR: Key (email)=(ali@misol.uz) already exists.", 1020, 530, { size: 16, fam: MONO, color: '#f38ba8' });

        sline(1020, 565, 1740, 565, { col: '#45475a', w: 1 });
        text("2. 1-Ali o'chirildi (UPDATE ... SET ochirilgan = now()):", 1020, 600, { size: 19, color: '#89b4fa', fam: UI });
        text("3. Endi 2-Ali qayta kiritildi: Qabul qilindi! ✓", 1020, 640, { size: 19, weight: 700, color: '#a6e3a1', fam: UI });

        text(" id |    email     | ochirilganmi", 1020, 685, { size: 20, weight: 700, fam: MONO, color: '#89b4fa' });
        text("  1 | ali@misol.uz | t (o'chirilgan)", 1020, 720, { size: 19, fam: MONO, color: '#a6adc8' });
        text("  2 | ali@misol.uz | f (faol!)", 1020, 755, { size: 19, weight: 700, fam: MONO, color: '#a6e3a1' });
      });

      // Pastki xulosa kartasi
      const kFoot = P(t, 55.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fbfbfb', col: C.green, p: kFoot });
        text("Qisman Indeksning Yutuqlari:", 180, 875, { size: 23, weight: 700, color: C.green, fam: UI });
        text("1. O'chirilgan yozuvlar indeksdan avtomatik chiqariladi — indeks hajmi ixcham qoladi.", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("2. Eski foydalanuvchi tizimdan ketsa, uning email'i boshqa yangi mijoz uchun bo'shab beriladi.", 180, 960, { size: 20, weight: 600, color: C.green, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.period_aksiyalar.s) {
      sTemporalNarxlar(t);
    } else if (t < TM.scenes.audit_jadvali_va_trigger.s) {
      sPeriodAksiyalar(t);
    } else if (t < TM.scenes.yumshoq_ochirish_qisman.s) {
      sAuditTrigger(t);
    } else {
      sYumshoqQisman(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
