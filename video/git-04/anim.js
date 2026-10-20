// Git 04-bob videosi: "Repo olish: init va clone"
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
  // 1-SAHNA: Repo Olishning 2 Yo'li
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("04-BOB · REPOZITORIY OLISH", 960, 280, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Repo Olish: init va clone", 960, 360, { size: 56, weight: 800, color: C.text });
        text("Yangi loyiha boshlash yoki masofaviy repozitoriyni to'liq nusxalash", 960, 430, { size: 28, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 2.0, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(480, 500, 960, 220, { fill: 'rgba(11,16,32,0.92)', col: C.blue, lw: 2 });
          pill("$ git init  vs  $ git clone <url>", 960, 555, C.blue, { size: 22 });
          text("git init   ->  lokal papkada yangi .git xotirasini boshlash", 960, 620, { size: 20, fam: MONO, color: C.yellow, weight: 600 });
          text("git clone  ->  serverdagi butun tarixni to'liq nusxalab olish", 960, 665, { size: 20, fam: MONO, color: C.green, weight: 600 });
          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Repo Olishning 2 Asosiy Yo‘li", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.0, 0.6));
    withA(kBox, () => {
      // Chap: git init
      panel(100, 140, 840, 680, C.yellow, "1 · Yangi Loyiha (git init)", "noldan yangi tarix boshlash", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Noldan Boshlash", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Kompyuteringizdagi oddiy papkani to'liq Git repo'siga aylantiradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Tarix hali hech qayerda yo'q — uni siz noldan boshlaysiz!", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Yashirin .git Papkasi", 240, 470, C.blue, { size: 16, mono: false });
        text("• Papkada barcha xotira saqlanadigan '.git' katalogi paydo bo'ladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Mavjud fayllaringizga tegilmaydi, ular kuzatilmaydigan (untracked) qoladi.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Mutlaqo Mustaqil", 220, 655, C.mute, { size: 16, mono: false });
        text("• Server yoki internet aloqasi mutlaqo shart emas.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Butun tarix o'z kompyuteringiz ichida lokal yuritiladi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: git clone
      panel(980, 140, 840, 680, C.green, "2 · Mavjud Loyiha (git clone)", "masofaviy repozitoriyni nusxalash", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To'liq Tarix Nusxasi", 1140, 290, C.green, { size: 16, mono: false });
        text("• Serverdagi barcha commitlar, branchlar va teglar ko'chirib olinadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Faqat oxirgi versiya emas, loyihaning BUTUN o'tmishi yuklanadi!", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Origin Remote Ulanishi", 1150, 470, C.purple, { size: 16, mono: false });
        text("• Server avtomatik 'origin' nomi bilan masofaviy ombor deb saqlanadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Kelgusida 'git pull' va 'git push' bilan ishlashga tayyor turadi.", 1030, 555, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Teng Huquqli Zaxira (Backup)", 1180, 655, C.git, { size: 16, mono: false });
        text("• Har bir klon — serverning to'laqonli mustaqil zaxirasidir.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Server buzilsa ham, istalgan dasturchining klonidan qayta tiklash mumkin.", 1030, 740, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 14.5, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Ikkala holatda ham natija bir xil: kompyuteringizda ishga tayyor to'laqonli lokal repozitoriy.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi git init buyrug'ining ishlashi va .git ichki tuzilishini ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: git init va .git Papkasi
  // ==========================================
  function sceneGitInit(u, bounds) {
    chip(2, "git init va .git Papkasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: git init amali
      panel(100, 140, 840, 680, C.yellow, "git init Buyrug'i", "loyihani repoga aylantirish", kBox, kBox);

      const kI1 = P(u, 1.2, 0.6);
      withA(kI1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI1)) * 16);
        card(125, 255, 790, 175, { fill: 'rgba(11,16,32,0.92)', col: C.yellow, lw: 2 });
        pill("Papkada Repozitoriy Ochish", 250, 290, C.yellow, { size: 16, mono: false });
        text("$ cd mening-loyiham && git init", 150, 340, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("Initialized empty Git repository in /mening-loyiham/.git/", 150, 385, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kI2 = P(u, 3.5, 0.6);
      withA(kI2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI2)) * 16);
        card(125, 450, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Qayta Init Qilish Xavfsiz", 240, 485, C.green, { size: 16, mono: false });
        text("Mavjud repoda 'git init' ni qayta chaqirish xavfsiz:", 150, 530, { size: 17, color: C.text, align: 'left' });
        text("Reinitialized existing Git repository in /.../.git/", 150, 565, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("U mavjud commitlar va konfiguratsiyani aslo o'chirib yubormaydi.", 150, 600, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kI3 = P(u, 5.8, 0.6);
      withA(kI3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI3)) * 16);
        card(125, 635, 790, 150, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Yangi Papka Yaratib Init Qilish", 260, 670, C.blue, { size: 16, mono: false });
        text("$ git init yangi-loyiha", 150, 715, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Agar papka mavjud bo'lmasa, Git uni o'zi avtomatik yaratadi.", 150, 755, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: .git ichki tuzilishi
      panel(980, 140, 840, 680, C.orange, ".git Papkasi — Repo Xotirasi", "ichida nimalar bor va nega tegilmaydi?", kBox, kBox);

      const kS1 = P(u, 7.5, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Skelet Kataloglar va Fayllar", 1150, 290, C.orange, { size: 16, mono: false });
        text("• HEAD     -> joriy qaysi branch faol ekanini saqlaydi", 1030, 340, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• config   -> shu reponing shaxsiy local sozlamalari", 1030, 380, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• objects/ -> barcha commitlar, bloblar va papkalar daraxti", 1030, 420, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• refs/    -> branchlar va teglar ko'rsatkichlari papkasi", 1030, 460, { size: 17, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 9.8, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,107,122,0.08)', col: C.red, lw: 2 });
        pill("Oltin Qoida: Qo'lda Tegilmaydi!", 1160, 550, C.red, { size: 16, mono: false });
        text("• .git papkasidagi barcha amallarni faqat Git buyruqlari boshqaradi.", 1030, 600, { size: 16, color: C.text, align: 'left' });
        text("• Agar '.git' papkasi o'chirilsa — butun tarix abadiy yo'qoladi!", 1030, 640, { size: 17, color: C.red, align: 'left', weight: 700 });
        text("• Qolgan fayllar esa oddiy, kuzatilmaydigan fayllar bo'lib qoladi.", 1030, 680, { size: 16, color: C.mute, align: 'left' });
        text("• Ehtiyot bo'ling: 'rm -rf .git' hech qachon qaytarilmaydi!", 1030, 720, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.yellow });
      text("Loyiha fayllari — ishchi maydon; .git papkasi esa loyihaning butun xotirasi va tarixidir.", 960, 895, { size: 24, weight: 700, color: C.yellow, align: 'center' });
      text("Endi yangi repo'dagi 'tug'ilmagan brench' va birinchi commitni ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Tug'ilmagan Brench va Ilk Commit
  // ==========================================
  function sceneUnbornCommit(u, bounds) {
    chip(3, "Tug‘ilmagan Brench va Ilk Commit", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Tug'ilmagan brench
      panel(100, 140, 840, 680, C.purple, "Tug'ilmagan Brench (Unborn)", "brench bor, lekin hali mavjud emas", kBox, kBox);

      const kU1 = P(u, 1.2, 0.6);
      withA(kU1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kU1)) * 16);
        card(125, 255, 790, 180, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("HEAD Noto'liq Ishora Qiladi", 250, 290, C.purple, { size: 16, mono: false });
        text("$ cat .git/HEAD", 150, 340, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("ref: refs/heads/main", 150, 380, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("Lekin '.git/refs/heads/' papkasi hozircha mutlaqo bo'sh!", 150, 415, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kU2 = P(u, 3.5, 0.6);
      withA(kU2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kU2)) * 16);
        card(125, 455, 790, 205, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Nega Brench Hali Yo'q?", 230, 490, C.red, { size: 16, mono: false });
        text("$ git log", 150, 535, { size: 18, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("fatal: your current branch 'main' does not have any commits yet", 150, 575, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("Qoida: Branch — bu commitga ko'rsatkich. Commit bo'lmagani uchun", 150, 615, { size: 16, color: C.text, align: 'left' });
        text("branch rasman hali 'tug'ilmagan' (unborn) hisoblanadi.", 150, 645, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kU3 = P(u, 5.8, 0.6);
      withA(kU3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kU3)) * 16);
        card(125, 680, 790, 115, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        text("Git bu holatda sizdan birinchi commitni amalga oshirishni kutadi.", 150, 740, { size: 17, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Birinchi commit
      panel(980, 140, 840, 680, C.green, "Birinchi Commit (Root Commit)", "tarix poydevorini qo'yish", kBox, kBox);

      const kR1 = P(u, 7.5, 0.6);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 200, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ilk Fayllarni Qo'shish va Muhrlash", 1210, 290, C.green, { size: 16, mono: false });
        text("$ git add .", 1030, 340, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("$ git commit -m 'Loyihaning birinchi versiyasi'", 1030, 380, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("[main (root-commit) 8d792ce] Loyihaning birinchi versiyasi", 1030, 425, { size: 16, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 9.8, 0.6);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 475, 790, 200, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Root-Commit Nima?", 1140, 510, C.blue, { size: 16, mono: false });
        text("• root-commit — ota commitga ega bo'lmagan ilk boshlang'ich nuqta.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        text("• Shu lahzada 'refs/heads/main' fayli yaratiladi va hash yoziladi.", 1030, 595, { size: 16, color: C.blue, align: 'left', weight: 600 });
        text("• Endi 'main' brenchi to'liq va rasman vujudga keldi!", 1030, 635, { size: 17, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kR3 = P(u, 11.8, 0.6);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 695, 790, 105, { fill: 'rgba(15,22,48,0.92)', col: C.yellow });
        text("Tarix boshlandi! Endi barcha keyingi buyruqlar odatiy ishlaydi.", 1030, 750, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Birinchi commit yaratilishi bilan loyihaning boshlang'ich tarixi va asosiy brenchi vujudga keladi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi masofadagi mavjud repozitoriylarni git clone orqali yuklashni o'rganamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: git clone Mexanizmi
  // ==========================================
  function sceneGitClone(u, bounds) {
    chip(4, "git clone Mexanizmi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: git clone buyrug'i
      panel(100, 140, 840, 680, C.blue, "git clone Buyrug'i", "masofaviy loyihani to'liq yuklash", kBox, kBox);

      const kC1 = P(u, 1.2, 0.6);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(125, 255, 790, 190, { fill: 'rgba(11,16,32,0.92)', col: C.blue, lw: 2 });
        pill("Asosiy Buyruq", 200, 290, C.blue, { size: 16, mono: false });
        text("$ git clone https://github.com/libgit2/libgit2", 150, 345, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Cloning into 'libgit2'...", 150, 385, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("Boshqa nom bilan yuklash: git clone <url> mening-papkam", 150, 420, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = P(u, 3.8, 0.6);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(125, 465, 790, 210, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega Checkout Emas, Aynan Clone?", 280, 500, C.green, { size: 16, mono: false });
        text("• SVN kabi tizimlarda serverdan faqat oxirgi versiya olinadi.", 150, 545, { size: 16, color: C.text, align: 'left' });
        text("• Git'da esa buyruq 'clone' deb ataladi, chunki u serverdagi", 150, 580, { size: 16, color: C.text, align: 'left' });
        text("  barcha commitlar va barcha fayllar tarixini to'liq ko'chiradi!", 150, 615, { size: 16, color: C.green, align: 'left', weight: 700 });
        text("• Klonlash tugashi bilan loyihani oflayn boshqara olasiz.", 150, 645, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 6.0, 0.6);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(125, 695, 790, 105, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        text("Mavjud papkaga klonlash faqat papka BO'SH bo'lgandagina mumkin.", 150, 750, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 5 ta ichki qadam
      panel(980, 140, 840, 680, C.green, "Git Clone Ichki 5 Qadami", "avtomatik bajariladigan amallar", kBox, kBox);

      const kS1 = P(u, 7.5, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 280, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("5 Ta Bosqich Ketma-Ketligi", 1160, 290, C.green, { size: 16, mono: false });
        text("1. Papkani yaratadi va ichida 'git init' qiladi", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("2. Manbani 'origin' nomli masofaviy remote qilib ulaydi", 1030, 380, { size: 17, color: C.blue, align: 'left', weight: 600 });
        text("3. Hamma commitlar va obyektlar arxivini (packfile) tortib oladi", 1030, 420, { size: 17, color: C.text, align: 'left' });
        text("4. Remote-tracking brenchlarni yaratadi (origin/main, origin/dev)", 1030, 460, { size: 17, color: C.purple, align: 'left' });
        text("5. Asosiy brenchni ishchi papkaga chiqaradi (checkout)", 1030, 500, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS2 = P(u, 10.0, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 555, 790, 230, { fill: 'rgba(15,22,48,0.92)', col: C.git });
        pill("Natijaviy Holat", 1100, 590, C.git, { size: 16, mono: false });
        text("$ git status", 1030, 635, { size: 18, fam: MONO, color: C.git, align: 'left', weight: 600 });
        text("On branch main", 1030, 675, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("Your branch is up to date with 'origin/main'.", 1030, 715, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("nothing to commit, working tree clean", 1030, 750, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 12.8, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Git clone masofaviy repozitoriyni to'liq nusxalab, mahalliy kompyuterni bir zumda ishga tayyorlaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Endi uzatish protokollari va sayoz (shallow) klon olishni ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Protokollar va Sayoz Klon
  // ==========================================
  function sceneProtokollarOpsiyalar(u, bounds) {
    chip(5, "Protokollar va Sayoz Klon", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Protokollar
      panel(100, 140, 840, 680, C.purple, "Uzatish Protokollari", "HTTPS, SSH va lokal yo'llar", kBox, kBox);

      const kP1 = P(u, 1.2, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("HTTPS Protokoli", 215, 290, C.blue, { size: 16, mono: false });
        text("https://github.com/libgit2/libgit2.git", 150, 335, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Eng keng tarqalgan; shaxsiy token (PAT) orqali avtorizatsiya.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("SSH Protokoli (Tavsiya Etiladi)", 270, 470, C.purple, { size: 16, mono: false });
        text("git@github.com:libgit2/libgit2.git", 150, 515, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("SSH kalitlar orqali parolsiz va yuqori xavfsizlikda ishlash.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.8, 0.6);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(125, 615, 790, 170, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Lokal Papkalar (/path yoki file://)", 275, 650, C.mute, { size: 16, mono: false });
        text("git clone /var/repos/loyiha", 150, 695, { size: 18, fam: MONO, color: C.mute, align: 'left' });
        text("Disk ichida hardlink yordamida joy tejab tez nusxalaydi.", 150, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Sayoz klon va bare
      panel(980, 140, 840, 680, C.git, "Klon Opsiyalari: Depth va Bare", "tezlik va server uchun maxsus rejimlar", kBox, kBox);

      const kO1 = P(u, 7.5, 0.6);
      withA(kO1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Sayoz Klon (--depth 1) · CI/CD Uchun Ideal", 1240, 290, C.green, { size: 16, mono: false });
        text("$ git clone --depth 1 https://...", 1030, 340, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("• Faqat eng oxirgi bitta commit tarixini tortib oladi.", 1030, 385, { size: 16, color: C.text, align: 'left' });
        text("• Katta repolarda yuklash hajmini gigabaytlardan megabaytlarga tushiradi!", 1030, 420, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• CI/CD serverlarda build va testlarni 10 barobar tezlashtiradi.", 1030, 455, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kO2 = P(u, 9.8, 0.6);
      withA(kO2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Bare Repozitoriy (--bare)", 1160, 550, C.git, { size: 16, mono: false });
        text("$ git init --bare server.git", 1030, 600, { size: 18, fam: MONO, color: C.git, align: 'left', weight: 600 });
        text("• Working tree'siz, faqat tarixni saqlovchi server repo turi.", 1030, 645, { size: 16, color: C.text, align: 'left' });
        text("• Nega serverda bare? Oddiy repo checked-out branchga push qabul qilmaydi!", 1030, 680, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• GitHub, GitLab va barcha git serverlar aynan bare formatida ishlaydi.", 1030, 715, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 12.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.git });
      text("Protokol va opsiyalarni to'g'ri tanlash tarmoq tezligi va loyihaning xavfsizligini ta'minlaydi.", 960, 895, { size: 24, weight: 700, color: C.git, align: 'center' });
      text("Endi 04-bobning barcha asosiy xulosalarini umumlashtiramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "04-Bob Xulosasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      const cards = [
        {
          num: "1",
          title: "git init",
          col: C.yellow,
          items: [
            "Yangi .git xotira papkasi",
            "Mavjud papkani repoga aylantirish",
            "Qayta init qilish xavfsiz",
            "Root-commit bilan main tug'iladi"
          ]
        },
        {
          num: "2",
          title: "git clone",
          col: C.green,
          items: [
            "Serverdagi butun tarix nusxasi",
            "origin masofaviy remote ulanishi",
            "Remote-tracking brenchlar",
            "Teng huquqli to'liq zaxira"
          ]
        },
        {
          num: "3",
          title: "Maxsus Rejimlar",
          col: C.git,
          items: [
            "--depth 1: CI/CD uchun sayoz klon",
            "-b <nom>: muayyan brenchni olish",
            "--bare: serverlar uchun worktree'siz",
            "HTTPS va SSH protokollari"
          ]
        }
      ];

      const cW = 540, cH = 480;
      cards.forEach((c, i) => {
        const cx = 100 + i * 590;
        const cy = 160;
        const kc = P(u, 0.6 + i * 0.4, 0.6);
        withA(kc, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kc)) * 16);
          card(cx, cy, cW, cH, { fill: 'rgba(15,22,48,0.92)', col: c.col });
          pill(c.num + " · " + c.title, cx + cW / 2, cy + 45, c.col, { size: 20, mono: false });

          c.items.forEach((item, j) => {
            const iy = cy + 120 + j * 80;
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; rr(cx + 35, iy, cW - 70, 60, 10); ctx.fill();
            ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(cx + 55, iy + 30, 6, 0, 7); ctx.fill();
            text(item, cx + 78, iy + 31, { size: 17, weight: 600, align: 'left', color: C.text });
          });
          ctx.restore();
        });
      });

      // Pastki xulosa
      const kFoot = P(u, 2.5, 0.8);
      withA(kFoot, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 680, 1720, 320, { fill: 'rgba(18,26,58,0.95)', col: C.git });
        text("Keyingi bob: 05 — Uchta Holat va Uchta Hudud", 960, 745, { size: 34, weight: 800, color: C.git, align: 'center' });
        text("Modified, Staged, Committed holatlari va Git fayllar bilan qanday ishlashini o'rganamiz.", 960, 810, { size: 22, color: C.text, align: 'center' });
        text("E'tiboringiz uchun rahmat! · dev-docs.uz", 960, 875, { size: 20, weight: 600, color: C.mute, align: 'center' });
        ctx.restore();
      });
    });
  }

  // Asosiy kadr chizuvchi
  window.renderFrame = function (t) {
    bg(t);
    const sc = TM.scenes;
    if (t < sc.git_init.s) {
      sceneIntro(t - sc.intro.s, { s: sc.intro.s, e: sc.intro.e });
    } else if (t < sc.unborn_va_birinchi_commit.s) {
      sceneGitInit(t - sc.git_init.s, { s: sc.git_init.s, e: sc.git_init.e });
    } else if (t < sc.git_clone.s) {
      sceneUnbornCommit(t - sc.unborn_va_birinchi_commit.s, { s: sc.unborn_va_birinchi_commit.s, e: sc.unborn_va_birinchi_commit.e });
    } else if (t < sc.protokollar_va_opsiyalar.s) {
      sceneGitClone(t - sc.git_clone.s, { s: sc.git_clone.s, e: sc.git_clone.e });
    } else if (t < sc.xulosa.s) {
      sceneProtokollarOpsiyalar(t - sc.protokollar_va_opsiyalar.s, { s: sc.protokollar_va_opsiyalar.s, e: sc.protokollar_va_opsiyalar.e });
    } else {
      sceneXulosa(t - sc.xulosa.s, { s: sc.xulosa.s, e: sc.xulosa.e });
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    bg(0);
    // 04-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("04-BOB · REPOZITORIY OLISH", 960, 160, C.git, { size: 26, mono: false });
    text("Repo Olish: init va clone", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("git init xotirasi, .git tuzilishi va git clone mexanizmi", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy taqqoslash kartasi
    card(480, 410, 960, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("$ git init  va  $ git clone", 960, 480, C.blue, { size: 24 });
    text("git init   ->  mening-loyiham/.git  (yangi tarix)", 960, 550, { size: 24, fam: MONO, color: C.yellow, weight: 700 });
    text("git clone  ->  server:loyiha.git   (to'liq nusxa)", 960, 615, { size: 24, fam: MONO, color: C.green, weight: 700 });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Ikkala holatda ham natija bir xil: kompyuteringizda ishga tayyor to'laqonli lokal repozitoriy.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Barcha keyingi amallar shu repozitoriy ichida bajariladi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
