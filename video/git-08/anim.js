// Git 08-bob videosi: ".gitignore, rm va mv"
// Canvas render (1920x1080, 30fps) — GIT-VIDEO-USLUBI.md
(function () {
  const ctx = document.getElementById('c').getContext('2d');
  const kit = window.GITKIT(ctx);
  const {
    W, H, C, UI, MONO,
    clamp, P, lerp, eo, eio, eback, font, withA, rr,
    tw, text, bg, ring, burst, link, pill,
    fileChip, chip, panel, card
  } = kit;

  const TM = window.TM, NR = window.NR;

  // ==========================================
  // 1-SAHNA: Kirish va Loyihani Toza Saqlash
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("08-BOB · .GITIGNORE, RM VA MV", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Loyihani Toza Saqlash", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Keraksiz fayllar, maxfiy kalitlar va xotira shishishidan himoya vositalari", 960, 415, { size: 26, color: C.mute });

        // Markaziy 3 qurol kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Loyihani Tartibga Soluvchi 3 Asosiy Qurol", 960, 530, C.blue, { size: 22 });

          card(410, 580, 320, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill(".gitignore", 570, 615, C.yellow, { size: 18 });
          text("Keraksizni chetlab o'tish", 570, 655, { size: 16, color: C.text });

          text("──►", 780, 635, { size: 20, fam: MONO, color: C.blue, weight: 700 });

          card(830, 580, 320, 110, { fill: 'rgba(255,107,107,0.10)', col: C.red });
          pill("git rm", 990, 615, C.red, { size: 18 });
          text("Ombordan olib tashlash", 990, 655, { size: 16, color: C.text });

          text("──►", 1200, 635, { size: 20, fam: MONO, color: C.green, weight: 700 });

          card(1250, 580, 270, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("git mv", 1385, 615, C.blue, { size: 18 });
          text("Xavfsiz ko'chirish", 1385, 655, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Loyihani Toza Saqlashning 3 Quroli", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Nega hamma narsa saqlanmaydi?
      panel(100, 140, 840, 680, C.yellow, "Nega Git Hamma Narsani Saqlamaydi?", "ortiqcha yuk va xavflar", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Ombor Shishishi (Bloat)", 250, 290, C.yellow, { size: 16, mono: false });
        text("• node_modules/, build/ yoki log'lar Git tarixini gigabaytlarga oshiradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git doim yangi snapshot qo'shadi, generatsiya fayllari hech qachon yo'qolmaydi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("2 · Maxfiy Kalitlar Xavfsizligi", 260, 470, C.red, { size: 16, mono: false });
        text("• .env faylidagi parollar, API tokenlar commitga tushib qolsa jiddiy xavf tug'iladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ularni tarixdan butunlay o'chirish o'ta og'ir va xatarli amaliyotdir.", 150, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3 · Ma'nosiz Birlashish Konfliktlari", 280, 655, C.mute, { size: 16, mono: false });
        text("• Dasturchilarning shaxsiy sozlamalari va build fayllari to'qnashadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• .gitignore esa butun jamoa uchun yagona filtr qoidalarini belgilaydi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 vosita vazifasi
      panel(980, 140, 840, 680, C.blue, "Uch Vositaning Chegaralari", "qaysi qurol qachon ishlatiladi", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill(".gitignore — Ko'rinmaslik Qoidasi", 1190, 290, C.yellow, { size: 16, mono: false });
        text("• Gitga 'bu fayllarni umuman ko'rma' deb aytadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Faqat UNTRACKED fayllarga ta'sir qiladi! Tracked faylga ta'sir qilmaydi.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("git rm — Repodan Olib Tashlash", 1180, 470, C.red, { size: 16, mono: false });
        text("• Kuzatilayotgan faylni indexdan (va xohlasangiz diskdan) o'chiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• --cached opsiyasi orqali faylni diskda saqlab, faqat Gitdan chiqarish mumkin.", 1030, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("git mv — Qayta Nomlash va Ko'chirish", 1200, 655, C.blue, { size: 16, mono: false });
        text("• Faylni ko'chirish yoki nomini o'zgartirishni bitta qadamda bajaradi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• O'zgarishni darhol Staged (renamed) qilib tayyorlab qo'yadi.", 1030, 740, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: .gitignore Qoidalari va Patternlar
  // ==========================================
  function sceneGitignoreQoidalari(u, bounds, o = {}) {
    chip(2, ".gitignore Pattern Sintaksisi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Asosiy glob shablonlari
      panel(100, 140, 840, 680, C.yellow, "Asosiy Pattern Qoidalari", "eng ko'p ishlatiladigan shablonlar", kBase, kBase);

      const kP1 = P(u, 0.6, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("*.[oa] va Joker Belgilar (*, ?)", 270, 290, C.yellow, { size: 16, mono: false });
        text("• *.[oa]  -> barcha .o va .a fayllarni har qanday chuqurlikda ushlaydi.", 150, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• Yulduzcha (*) har qanday belgilarni, so'roq (?) esa bitta belgini bildiradi.", 150, 375, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 2.8, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("/TODO va build/ (Slesh Ahamiyati)", 280, 470, C.blue, { size: 16, mono: false });
        text("• /TODO   -> faqat loyiha ILDIZIDAGI TODO faylini ushlaydi (sub/TODO emas).", 150, 515, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• build/  -> oxirida slesh bo'lsa, faqat shu nomdagi PAPKA va uning ichidagilar.", 150, 555, { size: 16, color: C.blue, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("!lib.a (Inkor) va doc/**/*.pdf", 270, 655, C.green, { size: 16, mono: false });
        text("• !lib.a        -> oldingi qoida ignore qilgan faylni qayta ko'rsatadi.", 150, 700, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• doc/**/*.pdf  -> doc ichidagi barcha pdf fayllarni cheksiz chuqurlikda.", 150, 740, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Eng muhim qoida va ota papka cheklovi
      panel(980, 140, 840, 680, C.purple, "Eng Muhim Cheklovlar", "e'tibor bermasa xato bo'ladigan joylar", kBase, kBase);

      const kR1 = P(u, 7.5, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("1-QOIDA · Tracked Fayllar E'tiborsiz Qolmaydi!", 1250, 290, C.red, { size: 16, mono: false });
        text("• .gitignore faqat hali Git bilmaydigan (untracked) fayllarni to'sadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Allaqachon commit qilib bo'lingan fayl .gitignore'ga kiritilsa ham,", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("  Git uni kuzatishda davom etadi! (Uning uchun git rm --cached kerak).", 1030, 415, { size: 17, color: C.red, align: 'left', weight: 700 });
        text("• Bu yangi o'rganuvchilar eng ko'p adashadigan holatdir.", 1030, 460, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 10.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("2-QOIDA · Ota Papka Chiqarilsa, Ichini Qaytarib Bo'lmaydi", 1300, 555, C.purple, { size: 16, mono: false });
        text("• Agar 'build/' butunlay chiqarib tashlangan bo'lsa,", 1030, 600, { size: 17, color: C.text, align: 'left' });
        text("  '!build/keep.txt' qoidasi ISHLAMAYDI!", 1030, 640, { size: 17, color: C.yellow, align: 'left', weight: 700 });
        text("• Chunki Git tezlik uchun ignore qilingan papka ichiga umuman kirmaydi.", 1030, 680, { size: 16, color: C.text, align: 'left' });
        text("• Yechim: 'build/*' qilib, so'ng '!build/keep.txt' deb yozish lozim.", 1030, 720, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git check-ignore: Detektiv Buyruq
  // ==========================================
  function sceneCheckIgnore(u, bounds, o = {}) {
    chip(3, "git check-ignore: Nega Ko'rinmayapti?", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: check-ignore detektivi
      panel(100, 140, 840, 680, C.green, "check-ignore — Detektiv Qurol", "qaysi qoida to'sayotganini aniqlash", kBase, kBase);

      const kD1 = P(u, 0.6, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(125, 255, 790, 220, { fill: 'rgba(11,16,32,0.95)', col: C.green });
        pill("Muammoni Aniqlash Buyrug'i", 260, 290, C.green, { size: 16, mono: false });
        text("$ git check-ignore -v logs/app.log", 150, 335, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text(".gitignore:12:logs/    logs/app.log", 150, 375, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("Aniq javob beradi: .gitignore faylining 12-qatori to'smoqda!", 150, 420, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kD2 = P(u, 3.5, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(125, 500, 790, 285, { fill: 'rgba(52,211,153,0.08)', col: C.blue });
        pill("Foydali Opsiyalar", 200, 535, C.blue, { size: 16, mono: false });
        text("• -v, --verbose     -> qaysi fayl va qaysi qator ekanini ko'rsatadi.", 150, 580, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• --no-index        -> tracked fayllarni ham tekshiradi.", 150, 620, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• -n, --non-matching-> ignore qilinmagan fayllarni ham chiqaradi.", 150, 660, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("Chiqish kodi: 0 — ignore qilingan, 1 — mos kelmagan.", 150, 710, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: git status --ignored
      panel(980, 140, 840, 680, C.purple, "E'tiborsiz Qoldirilganlarni Ko'rish", "yashirin fayllar ro'yxati", kBase, kBase);

      const kS1 = P(u, 7.5, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 535, { fill: 'rgba(11,16,32,0.95)', col: C.purple });
        pill("$ git status --short --ignored", 1190, 290, C.purple, { size: 16, mono: false });

        text("?? .gitignore       (yangi yaratilgan qoidalar fayli)", 1030, 345, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("?? src/app.js       (loyihadagi oddiy fayl)", 1030, 385, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("-----------------------------------------------------", 1030, 425, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        text("!! .env             (maxfiy sozlamalar yashirildi)", 1030, 465, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("!! build/           (kompilyatsiya papkasi chetlab o'tildi)", 1030, 505, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("!! node_modules/    (kutubxonalar ignore qilindi)", 1030, 545, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("!! logs/app.log     (vaqtinchalik loglar to'sib qo'yildi)", 1030, 585, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("-----------------------------------------------------", 1030, 625, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        text("'!!' belgisi — qoidaga tushgan barcha fayllarni ko'rsatadi.", 1030, 675, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git rm va --cached Sehri
  // ==========================================
  function sceneGitRm(u, bounds, o = {}) {
    chip(4, "git rm va --cached Sehrli Kuchi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Oddiy git rm
      panel(100, 140, 840, 680, C.red, "Faylni O'chirish: git rm", "ham diskdan, ham indexdan", kBase, kBase);

      const kR1 = P(u, 0.6, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("Standart O'chirish", 220, 290, C.red, { size: 16, mono: false });
        text("$ git rm eski_fayl.txt", 150, 335, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Fayl diskdan o'chiriladi va o'chirish darhol stage qilinadi.", 150, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kR2 = P(u, 2.8, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Xavfsizlik Tekshiruvi va -f", 250, 470, C.yellow, { size: 16, mono: false });
        text("• Agar faylda saqlanmagan o'zgarish bo'lsa, Git o'chirishni rad etadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Majburiy o'chirish uchun '-f' (force) ishlatiladi, ehtiyot bo'ling!", 150, 555, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kR3 = P(u, 5.0, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Papkalarni o'chirish: -r", 220, 655, C.mute, { size: 16, mono: false });
        text("$ git rm -r papka/", 150, 700, { size: 18, fam: MONO, color: C.cyan, align: 'left' });
        text("Butun boshli papkani rekursiv tarzda ombordan chiqarib tashlash.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: git rm --cached
      panel(980, 140, 840, 680, C.green, "Oltin Vosita: git rm --cached", "diskda qoldirib, Gitdan chiqarish", kBase, kBase);

      const kC1 = P(u, 7.5, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Klassik Muammo va Yechim", 1140, 290, C.green, { size: 16, mono: false });
        text("Muammo: .env faylini bilmasdan commit qilib qo'ydingiz.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("Uni diskdan o'chirib bo'lmaydi — dastur ishlashi uchun kerak!", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("Yechim: $ git rm --cached .env", 1030, 420, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 800 });
        text("Natija: Fayl diskda QOLADI, ammo Git nazoratidan CHIQARILADI!", 1030, 460, { size: 17, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kC2 = P(u, 10.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Keyingi Majburiy Qadamlar", 1140, 555, C.blue, { size: 16, mono: false });
        text("1. Faylni .gitignore ga qo'shing: echo '.env' >> .gitignore", 1030, 600, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("2. O'zgarishlarni commit qiling: git commit -m 'env olindi'", 1030, 640, { size: 16, fam: MONO, color: C.blue, align: 'left' });
        text("3. Endi fayl faqat sizning kompyuteringizda yashaydi,", 1030, 680, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("   GitHub yoki serverga boshqa hech qachon chiqmaydi!", 1030, 720, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: git mv: Ko'chirish va Qayta Nomlash
  // ==========================================
  function sceneGitMv(u, bounds, o = {}) {
    chip(5, "git mv: Ko'chirish va Qayta Nomlash", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: 3 amaliyot bitta buyruqda
      panel(100, 140, 840, 680, C.blue, "Bitta Buyruqda 3 Amaliyot", "git mv ning qulayligi", kBase, kBase);

      const kM1 = P(u, 0.6, 0.5);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Buyruq Shakli", 190, 290, C.blue, { size: 16, mono: false });
        text("$ git mv README.md README", 150, 335, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("renamed: README.md -> README (darhol Staged bo'ladi)", 150, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kM2 = P(u, 3.0, 0.5);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 16);
        card(125, 435, 790, 350, { fill: 'rgba(11,16,32,0.95)', col: C.border });
        pill("Aslida Nima Sodir Bo'ladi?", 240, 470, C.mute, { size: 16, mono: false });
        text("Agar qo'lda qilsangiz, uchta buyruq kerak bo'lardi:", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("1. $ mv README.md README        (diskda nomini o'zgartirish)", 150, 560, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("2. $ git rm -q README.md        (eski nomni o'chirish)", 150, 600, { size: 16, fam: MONO, color: C.red, align: 'left' });
        text("3. $ git add README             (yangi faylni qo'shish)", 150, 640, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("git mv bularning barini xatosiz va bir zumda bajaradi!", 150, 700, { size: 17, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // O'ng panel: Kontent bo'yicha kuzatish
      panel(980, 140, 840, 680, C.purple, "Git Fayllarni Qanday Taniyadi?", "nomga emas, kontentga qarash", kBase, kBase);

      const kK1 = P(u, 7.5, 0.5);
      withA(kK1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kK1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Kontent Xeshi (SHA-1 Blob)", 1150, 290, C.purple, { size: 16, mono: false });
        text("• Git faylning nomini emas, uning ichidagi MAZMUNINI saqlaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl boshqa papkaga ko'chsa ham, uning blobi o'zgarmaydi.", 1030, 375, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Git solishtirish paytida 'bu fayl 100% o'sha fayl' deb tanib oladi.", 1030, 415, { size: 17, color: C.green, align: 'left' });
        text("• Natijada faylning butun commit tarixi uzilmasdan qoladi!", 1030, 460, { size: 17, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kK2 = P(u, 10.5, 0.5);
      withA(kK2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kK2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Bir Nechta Faylni Papkaga Ko'chirish", 1200, 555, C.blue, { size: 16, mono: false });
        text("$ git mv docs/intro.txt docs/usage.txt archive/", 1030, 600, { size: 17, fam: MONO, color: C.cyan, align: 'left' });
        text("• Oxirgi argument papka bo'lsa, bir nechta faylni birga ko'chirish mumkin.", 1030, 645, { size: 16, color: C.text, align: 'left' });
        text("• Agar manzil mavjud bo'lsa, Git xatolik berib to'xtaydi (ustidan yozmaydi).", 1030, 685, { size: 16, color: C.yellow, align: 'left' });
        text("• Majburlash uchun '-f' opsiyasi mavjud.", 1030, 725, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Asosiy Qoidalar", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 ustunli tavsiyalar
      const kC1 = P(u, 0.5, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        panel(100, 140, 546, 500, C.yellow, "1 · .gitignore Yarating", "boshidanoq filtr qiling", kC1, kC1);
        card(120, 255, 506, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Toza Boshlanish", 200, 290, C.yellow, { size: 16, mono: false });
        text("Loyiha boshlangan zahoti", 140, 335, { size: 17, color: C.text, align: 'left' });
        text(".gitignore faylini to'ldirib oling.", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("Axlat fayllar tarixga tushmaydi.", 140, 400, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 2.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        panel(686, 140, 546, 500, C.red, "2 · git rm --cached", "adashganda xaloskor", kC2, kC2);
        card(706, 255, 506, 170, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("Xavfsiz Qutulish", 790, 290, C.red, { size: 16, mono: false });
        text("Adashib commit qilingan .env", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("yoki loglarni '--cached' bilan chiqaring.", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("Fayl diskda xavfsiz qoladi.", 726, 400, { size: 16, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 4.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        panel(1272, 140, 546, 500, C.blue, "3 · git mv Ishlating", "nomlash va ko'chirish", kC3, kC3);
        card(1292, 255, 506, 170, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Qulay Birlashma", 1370, 290, C.blue, { size: 16, mono: false });
        text("Fayl nomini o'zgartirganda", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("oddiy 'mv' emas, 'git mv' qiling.", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("O'zgarish darhol stage bo'ladi.", 1312, 400, { size: 16, color: C.blue, align: 'left' });
        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 6.5, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Tarixni Ko'rish (git log)", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 9-bobda loyihaning butun o'tmishi va har bir commitini ko'zdan kechiruvchi 'git log' qurolini o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("Toza ombor, xavfsiz sozlamalar va tartibli loyiha — professional dasturchining belgisi.", 960, 800, { size: 18, color: C.mute });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'gitignore_qoidalari', fn: sceneGitignoreQoidalari },
      { id: 'check_ignore', fn: sceneCheckIgnore },
      { id: 'git_rm', fn: sceneGitRm },
      { id: 'git_mv', fn: sceneGitMv },
      { id: 'xulosa', fn: sceneXulosa }
    ];

    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const bounds = TM.scenes[s.id];
      if (!bounds) continue;

      if (t >= bounds.s && t <= bounds.e) {
        const u = t - bounds.s;
        s.fn(u, bounds);
        break;
      }
    }
  };

  window.render = window.renderFrame;

  // Poster uchun qulay kadr (1-sahna taqqoslashi)
  window.renderPoster = function () {
    bg();
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
