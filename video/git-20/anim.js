// Git 20-bob videosi: "Branch — bu ko'rsatkich"
// Canvas render (1920x1080, 30fps) — GIT-VIDEO-USLUBI.md
(function () {
  const ctx = document.getElementById('c').getContext('2d');
  const kit = window.GITKIT(ctx);
  const {
    W, H, C, UI, MONO,
    clamp, P, lerp, eo, eio, eback, font, withA, rr,
    tw, text, bg, ring, burst, link, pill,
    fileChip, chip, panel, card, terminal
  } = kit;

  const TM = window.TM, NR = window.NR;

  // Real terminalda buyruqlarni jonli harfma-harf yozish va kursor miltillashi
  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
    const tPrompt = opt.tPromptShow != null ? opt.tPromptShow : tStart - 0.3;
    if (u < tPrompt) return;

    const pCol = opt.promptCol || C.green;
    text(promptStr, x, y, { size: 15, fam: MONO, color: pCol, weight: 700, align: 'left' });
    const pw = tw(promptStr, 15, 700, MONO);

    if (u < tStart) {
      if (Math.floor(u * 2.5) % 2 === 0) {
        text('█', x + pw + 2, y, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
      }
      return;
    }

    const dur = Math.max(0.01, tTypeEnd - tStart);
    const progress = clamp((u - tStart) / dur);
    const charCount = Math.floor(progress * fullCmd.length);
    const typedStr = fullCmd.slice(0, charCount);

    text(typedStr, x + pw, y, { size: 15, fam: MONO, color: opt.cmdCol || '#e2e8f0', weight: 600, align: 'left' });
    const cmdW = tw(typedStr, 15, 600, MONO);

    if (u < tEnter) {
      const isVisible = u < tTypeEnd ? true : (Math.floor(u * 2.5) % 2 === 0);
      if (isVisible) {
        text('█', x + pw + cmdW + 2, y, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
      }
    }
  }

  function drawOutputLine(str, tAppear, u, x, y, opt = {}) {
    if (u < tAppear) return;
    text(str, x, y, {
      size: opt.size || 14,
      fam: MONO,
      color: opt.color || '#94a3b8',
      weight: opt.weight || 500,
      align: 'left'
    });
  }

  // ==========================================
  // 1-SAHNA: Branch Tushunchasi: 41 Baytlik Ko‘rsatkich
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Branch Tushunchasi: 41 Baytlik Ko‘rsatkich", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — .git/refs/heads tahlili',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ls -la .git/refs/heads
      drawCommandLine("ombor $ ", "ls -la .git/refs/heads", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("-rw-r--r-- 1 ali staff 41 main", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("  # branch fayli atigi 41 bayt!", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: cat .git/refs/heads/main
      drawCommandLine("ombor $ ", "cat .git/refs/heads/main", 4.0, 5.6, 5.8, tu, 130, 285);
      drawOutputLine("c5ccad86d8bca7ce858c4e680efd20319009feda", 6.0, tu, 130, 310, { color: C.green, weight: 700 });
      drawOutputLine("  # ichida faqat 40 ta hex belgi va yangi qator belgisi bor", 6.3, tu, 130, 332, { color: C.mute });

      // 3-buyruq: cat .git/HEAD
      drawCommandLine("ombor $ ", "cat .git/HEAD", 7.5, 8.8, 9.0, tu, 130, 365);
      drawOutputLine("ref: refs/heads/main", 9.2, tu, 130, 390, { color: C.cyan, weight: 700 });
      drawOutputLine("  # HEAD — joriy branch fayliga ko'rsatuvchi symbolic ref", 9.5, tu, 130, 412, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 200, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Branch Loyiha Nusxasi Emas!", 280, 485, C.yellow, { size: 16, mono: false });
        text("• Boshqa eski tizimlarda branch — barcha fayllarni boshqa papkaga ko'chirish.", 150, 530, { size: 16, color: C.text, align: 'left' });
        text("• Git'da branch — bitta commitga qaratilgan 41 baytlik siljuvchi ko'rsatkich!", 150, 565, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Fayllar allaqachon objects omborida bor; branch shunchaki yengil yorliq.", 150, 600, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Branch — Bu Shunchaki Ko'rsatkich", "Git'da tarmoqlanishning asl mohiyati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Ko'rsatkich Modeli", 1100, 290, C.yellow, { size: 16, mono: false });
        text("• Obyektlar o'zgarmas (immutable): commit, tree, blob.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Branchlar esa o'zgaruvchan: atigi 41 baytlik ko'rsatkich fayllar.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega Branch Arzon?", 1100, 470, C.green, { size: 16, mono: false });
        text("• Loyihada 10 ta yoki 100 000 ta fayl bo'lishining farqi yo'q.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Hech qanday fayl nusxalanmaydi, bir zumda yaratiladi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ota Zanjiri (DAG)", 1100, 655, C.cyan, { size: 16, mono: false });
        text("• Har commit o'z otasini biladi, ota esa bolalarini bilmaydi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Shu sababli branch faqat eng oxirgi commit (tip) hashini saqlaydi.", 1030, 735, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git branch va Arzon Yaratish
  // ==========================================
  function sceneCreateBranch(u, bounds, o = {}) {
    chip(2, "git branch va Arzon Yaratish", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch testing',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch testing
      drawCommandLine("ombor $ ", "git branch testing", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("  # jim va bir zumda bajariladi: yangi 41 baytlik fayl yozildi", 2.4, tu, 130, 230, { color: C.green });

      // 2-buyruq: cat .git/refs/heads/testing
      drawCommandLine("ombor $ ", "cat .git/refs/heads/testing", 3.8, 5.4, 5.6, tu, 130, 265);
      drawOutputLine("c5ccad86d8bca7ce858c4e680efd20319009feda", 5.8, tu, 130, 290, { color: C.yellow, weight: 700 });
      drawOutputLine("  # main bilan aynan bir xil hash!", 6.1, tu, 130, 312, { color: C.mute });

      // 3-buyruq: git log --oneline --decorate
      drawCommandLine("ombor $ ", "git log --oneline --decorate -1", 7.5, 9.2, 9.4, tu, 130, 345);
      drawOutputLine("c5ccad8 (HEAD -> main, testing) Ro'yxat funksiyasi", 9.6, tu, 130, 370, { color: C.cyan, weight: 700 });
      drawOutputLine("  # HEAD -> main (HEAD hali ham main ga ulanib turibdi)", 9.9, tu, 130, 392, { color: C.mute });

      // 4-buyruq: git branch ro'yxati
      drawCommandLine("ombor $ ", "git branch", 11.2, 12.4, 12.6, tu, 130, 425);
      drawOutputLine("* main", 12.8, tu, 130, 450, { color: C.green, weight: 700 });
      drawOutputLine("  testing", 13.1, tu, 130, 472, { color: '#94a3b8' });

      // Izoh kartasi
      const kDetail = P(u, 14.0, 0.5);
      withA(kDetail, () => {
        card(125, 510, 790, 190, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yodda Tutish Shart Bo'lgan Nuqta", 280, 545, C.green, { size: 16, mono: false });
        text("• git branch <nom> faqat YARATADI, unga o'tkazmaydi!", 150, 590, { size: 16, color: C.yellow, align: 'left', weight: 700 });
        text("• Yulduzcha (*) — HEAD hozir qaysi branchga ulanganini bildiradi.", 150, 625, { size: 16, color: C.text, align: 'left' });
        text("• Yaratish va o'tishni birga bajarish uchun: git switch -c <nom>.", 150, 660, { size: 15, color: C.cyan, align: 'left', weight: 600 });
      });

      // O'ng panel: branch arxitekturasi
      panel(980, 140, 840, 680, C.green, "git branch testing Jarayoni", "yangi yorliq osish mexanizmi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Faqat Yaratadi, O'tkazmaydi", 1160, 290, C.green, { size: 16, mono: false });
        text("• testing fayli yaratildi, lekin HEAD hali ham main'da.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Yangi commit qilinsa, u baribir main'ga yoziladi.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Plumbing Ekvivalenti", 1120, 470, C.cyan, { size: 16, mono: false });
        text("• git update-ref refs/heads/testing HEAD", 1030, 515, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• Git ichida aynan shu past darajali buyruq ishlaydi.", 1030, 550, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Boshqa Nuqtadan Yaratish", 1150, 655, C.yellow, { size: 16, mono: false });
        text("• git branch tuzatish HEAD~2 (ikki commit orqadan).", 1030, 700, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• git branch eski-versiya v1.0 (muayyan tegdan).", 1030, 735, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git switch va Ko‘rsatkich Siljishi
  // ==========================================
  function sceneSwitch(u, bounds, o = {}) {
    chip(3, "git switch va Ko‘rsatkich Siljishi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git switch testing & commit',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch testing
      drawCommandLine("ombor $ ", "git switch testing", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("Switched to branch 'testing'", 2.4, tu, 130, 230, { color: C.cyan, weight: 600 });

      // 2-buyruq: cat .git/HEAD
      drawCommandLine("ombor $ ", "cat .git/HEAD", 3.5, 4.8, 5.0, tu, 130, 265);
      drawOutputLine("ref: refs/heads/testing", 5.2, tu, 130, 290, { color: C.cyan, weight: 700 });
      drawOutputLine("  # HEAD endi testing branchiga ulandi!", 5.5, tu, 130, 312, { color: C.mute });

      // 3-buyruq: commit qilish
      drawCommandLine("ombor $ ", "git commit -am \"Testing'da o'zgarish\"", 7.0, 9.2, 9.4, tu, 130, 345);
      drawOutputLine("[testing 2cd6c35] Testing'da o'zgarish", 9.6, tu, 130, 370, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 1 insertion(+)", 9.9, tu, 130, 392, { color: '#94a3b8' });

      // 4-buyruq: branch fayllarini solishtirish
      drawCommandLine("ombor $ ", "cat .git/refs/heads/testing .git/refs/heads/main", 11.5, 13.5, 13.7, tu, 130, 425);
      drawOutputLine("2cd6c357ec88fd1b20790f81b3f638622576f946 (testing)", 13.9, tu, 130, 450, { color: C.green, weight: 700 });
      drawOutputLine("c5ccad86d8bca7ce858c4e680efd20319009feda (main)", 14.3, tu, 130, 472, { color: C.yellow, weight: 700 });

      // Izoh kartasi
      const kDetail = P(u, 15.5, 0.5);
      withA(kDetail, () => {
        card(125, 510, 790, 190, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ko'rsatkich Siljishi Qoidasi", 280, 545, C.cyan, { size: 16, mono: false });
        text("• Yangi commit qilinganda Git yangi commit obyektini yozadi.", 150, 590, { size: 16, color: C.text, align: 'left' });
        text("• Va faqat HEAD ulangan branch faylidagi hashni yangilaydi (testing)!", 150, 625, { size: 16, color: C.green, align: 'left', weight: 700 });
        text("• Boshqa barcha branchlar (main) o'z joyida daxlsiz qoladi.", 150, 660, { size: 15, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Sxema
      panel(980, 140, 840, 680, C.cyan, "Ko'rsatkich Siljishi Qoidasi", "commit faqat HEAD ulangan branch'ni siljitadi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git switch Vazifasi", 1120, 290, C.cyan, { size: 16, mono: false });
        text("• .git/HEAD dagi matnni yangi branch nomiga o'zgartiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Working tree fayllarini yangi branch snapshotiga moslaydi.", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yangi Commit Effekti", 1120, 470, C.green, { size: 16, mono: false });
        text("• testing ko'rsatkichi avtomatik ravishda 2cd6c35 ga siljidi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• main ko'rsatkichi esa c5ccad8 da mustahkam turibdi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Fayllar Holati", 1100, 655, C.yellow, { size: 16, mono: false });
        text("• main ga qaytganingizda testing'dagi yangi kodlar yo'qolmaydi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Git shunchaki working tree fayllarini main commitiga qaytaradi.", 1030, 735, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Tarix Ajralishi va Graf Chizmasi
  // ==========================================
  function sceneDiverge(u, bounds, o = {}) {
    chip(4, "Tarix Ajralishi va Graf Chizmasi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — tarixning ajralishi (diverged)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch main
      drawCommandLine("ombor $ ", "git switch main", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("Switched to branch 'main'", 2.4, tu, 130, 230, { color: C.cyan });

      // 2-buyruq: commit qilish main da
      drawCommandLine("ombor $ ", "git commit -am \"Main'da boshqa o'zgarish\"", 3.8, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("[main 44c9c64] Main'da boshqa o'zgarish", 6.4, tu, 130, 290, { color: C.green, weight: 600 });

      // 3-buyruq: git log --oneline --graph --all
      drawCommandLine("ombor $ ", "git log --oneline --graph --all", 8.0, 10.2, 10.4, tu, 130, 325);
      drawOutputLine("* 44c9c64 (HEAD -> main) Main'da boshqa o'zgarish", 10.6, tu, 130, 350, { color: C.green, weight: 700 });
      drawOutputLine("| * 2cd6c35 (testing) Testing'da o'zgarish", 11.0, tu, 130, 372, { color: C.cyan, weight: 700 });
      drawOutputLine("|/", 11.4, tu, 130, 394, { color: C.purple, weight: 700 });
      drawOutputLine("* c5ccad8 Ro'yxat funksiyasi (umumiy ajdod)", 11.8, tu, 130, 416, { color: C.yellow, weight: 600 });
      drawOutputLine("* d65e625 Qidiruv funksiyasi", 12.2, tu, 130, 438, { color: '#94a3b8' });
      drawOutputLine("* 2307bca Birinchi commit", 12.6, tu, 130, 460, { color: '#94a3b8' });

      // Izoh kartasi
      const kDetail = P(u, 13.5, 0.5);
      withA(kDetail, () => {
        card(125, 495, 790, 205, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Tarix Qanday Ajraldi?", 250, 530, C.purple, { size: 16, mono: false });
        text("• c5ccad8 commitidan ikki mustaqil tarmoq yo'li chiqdi.", 150, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• testing branchi o'z yo'lida, main branchi o'z yo'lida rivojlanmoqda.", 150, 610, { size: 16, color: C.text, align: 'left' });
        text("• Ikkala ish ham to'la izolyatsiyalangan va keyinroq bemalol merge qilinadi!", 150, 645, { size: 15, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Divergence
      panel(980, 140, 840, 680, C.purple, "Tarix Ajralishi (Divergence)", "mustaqil ish oqimlari grafigi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Mukammal Izolyatsiya", 1140, 290, C.cyan, { size: 16, mono: false });
        text("• Har bir xususiyat (feature) alohida branchda xavfsiz sinovdan o'tadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Ish buzilsa ham asosiy main branchiga zarracha ta'sir qilmaydi.", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Umumiy Ajdod (Merge Base)", 1170, 470, C.green, { size: 16, mono: false });
        text("• c5ccad8 — ikki branchning ajralish nuqtasi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Git keyingi merge jarayonida shu commitdan kelib chiqib birlashtiradi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("git log --graph --all", 1150, 655, C.purple, { size: 16, mono: false });
        text("• Kundalik ishda butun loyiha tarmoqlarini kuzatish uchun oltin kalit.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Dasturchilar ko'pincha buni git adog kabi alias qilib oladilar.", 1030, 735, { size: 16, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Switch Himoyasi va Detached HEAD
  // ==========================================
  function sceneSafety(u, bounds, o = {}) {
    chip(5, "Switch Himoyasi va Detached HEAD", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — switch himoyasi & detached',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: to'qnashadigan o'zgarishda switch
      drawCommandLine("ombor $ ", "echo 'chala' >> app.js && git switch testing", 0.6, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("error: Your local changes would be overwritten by checkout:", 3.5, tu, 130, 230, { color: C.red, weight: 700 });
      drawOutputLine("  app.js", 3.8, tu, 130, 252, { color: C.yellow });
      drawOutputLine("Please commit your changes or stash them before you switch.", 4.1, tu, 130, 274, { color: '#cbd5e1' });
      drawOutputLine("Aborting (Git ishingizni xavfsiz saqlab qoldi!)", 4.4, tu, 130, 296, { color: C.green, weight: 600 });

      // 2-buyruq: detached HEAD
      drawCommandLine("ombor $ ", "git switch --detach HEAD~1", 6.5, 8.5, 8.7, tu, 130, 335);
      drawOutputLine("HEAD is now at c5ccad8 Ro'yxat funksiyasi", 9.0, tu, 130, 360, { color: C.yellow, weight: 600 });
      drawOutputLine("* (HEAD detached at c5ccad8)", 9.4, tu, 130, 382, { color: C.red, weight: 700 });

      // 3-buyruq: cat .git/HEAD
      drawCommandLine("ombor $ ", "cat .git/HEAD", 11.0, 12.2, 12.4, tu, 130, 420);
      drawOutputLine("c5ccad86d8bca7ce858c4e680efd20319009feda", 12.6, tu, 130, 445, { color: C.yellow });
      drawOutputLine("  # ref: emas, to'g'ridan-to'g'ri commit hashi turibdi!", 12.9, tu, 130, 467, { color: C.mute });

      // Ogohlantirish kartasi
      const kDetail = P(u, 14.5, 0.5);
      withA(kDetail, () => {
        card(125, 510, 790, 190, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Detached HEAD Holatida Ehtiyot Bo'ling!", 300, 545, C.red, { size: 16, mono: false });
        text("• Bu holatda yangi commit qilsangiz, yangi commitga birorta ham branch qaramaydi.", 150, 590, { size: 15, color: '#fca5a5', align: 'left', weight: 600 });
        text("• Boshqa branchga o'tsangiz, u commit 'osilgan' bo'lib qoladi va gc uni o'chiradi.", 150, 625, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Qutqarish uchun darhol buyruq bering: git switch -c yangi-branch!", 150, 660, { size: 16, color: C.green, align: 'left', weight: 700 });
      });

      // O'ng panel: Himoya
      panel(980, 140, 840, 680, C.red, "Switch Himoyasi va Detached HEAD", "xavfsizlik mexanizmlari va ehtiyot choralari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To'qnashuvdan Himoya", 1140, 290, C.green, { size: 16, mono: false });
        text("• Ikki branchda farq qiladigan fayl tahrirlangan bo'lsa, switch to'xtaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Yechim: o'tishdan oldin commit qiling yoki git stash ishlating.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Detached HEAD Modeli", 1140, 470, C.red, { size: 16, mono: false });
        text("• HEAD symbolic ref emas, to'g'ridan-to'g'ri commit hashiga aylandi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Eski kodni ko'rib chiqish yoki bisect testlari uchun qulay.", 1030, 550, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--orphan — Yangi Tarix", 1150, 655, C.cyan, { size: 16, mono: false });
        text("• git switch --orphan sahifalar — butunlay bo'sh tarixdan boshlash.", 1030, 700, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• Hujjatlar yoki gh-pages saytlari uchun alohida tarmoq ochishda qo'l keladi.", 1030, 735, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: switch va checkout Farqi
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: switch va checkout Farqi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda zamonaviy buyruqlar
      terminal(100, 140, 840, 520, {
        title: 'zsh — switch -c va tezkor switch -',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git switch -c yangi-feature", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Switched to a new branch 'yangi-feature'", 2.6, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # branch yaratish va unga o'tish bir amalda (tranzaksion)", 2.9, tu, 130, 252, { color: C.mute });

      drawCommandLine("ombor $ ", "git switch -", 4.2, 5.5, 5.7, tu, 130, 290);
      drawOutputLine("Switched to branch 'main'", 5.9, tu, 130, 315, { color: C.cyan, weight: 600 });
      drawOutputLine("  # @{-1} — oldingi branchga bir zumda qaytish!", 6.2, tu, 130, 337, { color: C.mute });

      const kDetail = P(u, 7.5, 0.5);
      withA(kDetail, () => {
        card(125, 380, 790, 250, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Zamonaviy Git Standarti (Git 2.23+)", 300, 415, C.blue, { size: 16, mono: false });
        text("• Eski git checkout ikkita turli vazifani bajarib, chalkashlik tug'dirardi:", 150, 460, { size: 16, color: C.text, align: 'left' });
        text("  1. Branch almashtirish -> Endi: git switch <branch>", 150, 495, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("  2. Fayllarni tiklash -> Endi: git restore <fayl>", 150, 525, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Yangi buyruqlar xavfsiz va aniq maqsadli ishlab chiqilgan.", 150, 565, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Git 2.51 da switch va restore rasman barqaror (stable) deb e'lon qilindi.", 150, 595, { size: 15, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Branch Bo'yicha Asosiy Xulosa", "arzon, xavfsiz va qulay tarmoqlanish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Erkin Branch Ochish Madaniyati", 1210, 275, C.yellow, { size: 16, mono: false });
        text("• Branch ochishdan hech qachon cho'chimang!", 1030, 320, { size: 17, color: C.yellow, align: 'left', weight: 700 });
        text("• Har bir kichik g'oya, test yoki xato tuzatish uchun alohida branch oching.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• U diskdan joy olmaydi va asosiy kodingizni doimo toza saqlaydi.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Ko'rsatkichlar Sehr-Jodusi", 1210, 480, C.green, { size: 16, mono: false });
        text("• Branch — butun loyiha nusxasi emas, shunchaki 41 baytlik ko'rsatkich.", 1030, 525, { size: 17, color: C.text, align: 'left' });
        text("• HEAD qayerga qarasa, yangi commit o'sha ko'rsatkichni oldinga siljitadi.", 1030, 560, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Xulosa: Git modelini anglash branchlar bilan erkin ishlash kalitidir!", 1030, 595, { size: 16, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.5, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 21-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Branch yaratish va merge! Fast-forward, 3-way merge va konfliktlarning paydo bo'lishini o'rganamiz!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
      });
    });
  }

  // ==========================================
  // ASOSIY CHIZISH SIKLI (RENDER LOOP)
  // ==========================================
  window.renderFrame = function (t) {
    ctx.clearRect(0, 0, W, H);
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'branch_yaratish', fn: sceneCreateBranch },
      { id: 'switch_va_siljish', fn: sceneSwitch },
      { id: 'tarix_ajralishi', fn: sceneDiverge },
      { id: 'switch_himoyasi', fn: sceneSafety },
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

  // Poster uchun ko'rgazmali kadr (1-sahna taqqoslashi)
  window.renderPoster = function () {
    bg();
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();
