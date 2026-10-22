// Git 27-bob videosi: "Remote'lar"
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
  // 1-SAHNA: Kirish va Remote Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Remote Tushunchasi va Maqsadi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git remote amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git remote (boshida bo'sh)
      drawCommandLine("ali $ ", "git remote", 0.8, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("  # (hozircha bo'sh — hech qanday remote ulanmagan)", 2.3, tu, 130, 230, { color: C.mute });

      // 2-buyruq: remote qo'shish
      drawCommandLine("ali $ ", "git remote add origin ../server.git", 3.5, 5.2, 5.4, tu, 130, 265);

      // 3-buyruq: git remote -v
      drawCommandLine("ali $ ", "git remote -v", 6.5, 7.5, 7.7, tu, 130, 300);
      drawOutputLine("origin  ../server.git (fetch)", 8.0, tu, 130, 325, { color: C.green, weight: 600 });
      drawOutputLine("origin  ../server.git (push)", 8.3, tu, 130, 347, { color: C.green, weight: 600 });
      drawOutputLine("  # origin — server manzilining qulay qisqa nomidir!", 8.6, tu, 130, 369, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kCallout, () => {
        card(125, 410, 790, 240, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Remote Nima?", 190, 445, C.cyan, { size: 16, mono: false });
        text("• Boshqa joyda turgan xuddi shu loyiha repo'sining QISQA NOMI.", 150, 485, { size: 16, color: C.text, align: 'left' });
        text("• Har safar uzun URL yozish o'rniga 'origin', 'upstream' ishlatiladi.", 150, 515, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• 'Remote' so'zi majburan uzoqda degani emas — boshqa papka ham bo'lishi mumkin.", 150, 550, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Server odatda bare (ishchi papkasi bo'lmagan toza .git) ko'rinishida bo'ladi.", 150, 580, { size: 15, color: C.yellow, align: 'left' });
        text("• Jamoaviy almashinuv aynan shu remote orqali amalga oshadi.", 150, 610, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Masofaviy Repozitoriy (Remote)", "taqsimlangan hamkorlik poydevori", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Asosiy Amallar Uchligi", 1120, 290, C.cyan, { size: 16, mono: false });
        text("• git fetch: Remotedan yangi obyektlarni olib keladi (xavfsiz).", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git pull: Olib keladi va joriy branch bilan birlashtiradi (fetch + merge).", 1030, 365, { size: 16, color: C.text, align: 'left' });
        text("• git push: Sizning yangi commitlaringizni serverga yuboradi.", 1030, 400, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bitta repoda bir nechta remote (origin, upstream) bo'lishi mumkin.", 1030, 425, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ichki Model: Remote Nimalardan Tashkil Topgan?", 1210, 500, C.green, { size: 16, mono: false });
        text("• 1. .git/config: [remote \"origin\"] bo'limi (URL va refspec qoidasi).", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• 2. .git/refs/remotes/origin/*: Serverdagi holat ko'rsatkichlari.", 1030, 575, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• 3. .git/objects: Kelgan umumiy obyektlar (commit, tree, blob).", 1030, 605, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        text("• Git taqsimlangan: Har bir klon — mustaqil va to'liq ombordir.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Remote Boshqaruvi
  // ==========================================
  function sceneRemoteBoshqaruvi(u, bounds, o = {}) {
    chip(2, "Remote Boshqaruvi: Ko‘rish, Qo‘shish va Set-url", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — remote konfiguratsiyasi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: .git/config da ko'rish
      drawCommandLine("ali $ ", "sed -n '/remote/,$p' .git/config", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine('[remote "origin"]', 3.3, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine('    url = ../server.git', 3.6, tu, 130, 252, { color: C.cyan });
      drawOutputLine('    fetch = +refs/heads/*:refs/remotes/origin/*', 3.9, tu, 130, 274, { color: '#cbd5e1' });

      // 2-buyruq: set-url bilan manzilni yangilash
      drawCommandLine("ali $ ", "git remote set-url origin git@github.com:ali/loyiha.git", 5.5, 7.8, 8.0, tu, 130, 310);

      // 3-buyruq: git remote -v tekshirish
      drawCommandLine("ali $ ", "git remote -v", 9.2, 10.2, 10.4, tu, 130, 345);
      drawOutputLine("origin  git@github.com:ali/loyiha.git (fetch)", 10.7, tu, 130, 370, { color: C.green, weight: 600 });
      drawOutputLine("origin  git@github.com:ali/loyiha.git (push)", 11.0, tu, 130, 392, { color: C.green, weight: 600 });
      drawOutputLine("  # repo boshqa serverga ko'chganda set-url eng toza yechim!", 11.3, tu, 130, 414, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 195, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Amaliyot Maslahati: set-url Afzalligi", 260, 485, C.yellow, { size: 16, mono: false });
        text("• Loyiha boshqa manzilga ko'chsa, remoteni o'chirib qayta qo'shish shart emas.", 150, 525, { size: 16, color: C.text, align: 'left' });
        text("• 'git remote set-url' barcha mavjud ref'lar va sozlamalarni buzmasdan saqlaydi.", 150, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Masalan: HTTPS dan SSH ga xavfsiz o'tishda keng ishlatiladi.", 150, 590, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• 'git remote rename' orqali esa remote nomini osongina o'zgartirish mumkin.", 150, 620, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Remote Boshqaruvi va Protokollar", "manzillar va transport turlari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Asosiy Buyruqlar Ro'yxati", 1120, 290, C.yellow, { size: 16, mono: false });
        text("• git remote: Barcha mavjud remotelar ro'yxatini chiqaradi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• git remote add <nom> <URL>: Yangi remote ulaydi.", 1030, 365, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git remote set-url <nom> <yangi-URL>: Manzilni yangilaydi.", 1030, 400, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• git remote rm <nom>: Eskirgan remoteni o'chiradi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Transport Protokollari", 1100, 500, C.cyan, { size: 16, mono: false });
        text("• HTTPS: https://github.com/ali/loyiha.git (oddiy, token bilan)", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• SSH: git@github.com:ali/loyiha.git (xavfsiz, kalit bilan)", 1030, 575, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Lokal yo'l: /srv/git/loyiha.git yoki ../server.git", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Git protokoli: git://example.com/loyiha.git (autentifikatsiyasiz)", 1030, 630, { size: 15, fam: MONO, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Git Fetch: Xavfsiz Yuklash Mexanizmi
  // ==========================================
  function sceneFetchIchkiTuzilishi(u, bounds, o = {}) {
    chip(3, "Git Fetch: Xavfsiz Yuklash Mexanizmi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git fetch va ko‘zdan kechirish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git fetch origin
      drawCommandLine("ali $ ", "git fetch origin", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("From ../server", 2.7, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("   3c8955c..9bca200  main       -> origin/main", 3.0, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine("  # serverdagi yangi commitlar olib kelindi, lekin birlashmadi!", 3.3, tu, 130, 274, { color: C.mute });

      // 2-buyruq: ishchi papka o'zgarmaganligini ko'rish
      drawCommandLine("ali $ ", "git status", 4.5, 5.5, 5.7, tu, 130, 310);
      drawOutputLine("On branch main", 6.0, tu, 130, 335, { color: C.green, weight: 600 });
      drawOutputLine("nothing to commit, working tree clean", 6.3, tu, 130, 357, { color: '#cbd5e1' });
      drawOutputLine("  # ishchi fayllaringiz va main branch 100% o'zgarmay qoldi!", 6.6, tu, 130, 379, { color: C.yellow, weight: 600 });

      // 3-buyruq: yangiliklarni ko'rish
      drawCommandLine("ali $ ", "git log --oneline main..origin/main", 8.0, 9.8, 10.0, tu, 130, 415);
      drawOutputLine("9bca200 Kitoblar ro'yxatini qo'shish", 10.3, tu, 130, 440, { color: C.cyan, weight: 700 });

      // 4-buyruq: xavfsiz merge
      drawCommandLine("ali $ ", "git merge origin/main", 11.5, 12.8, 13.0, tu, 130, 475);
      drawOutputLine("Updating 3c8955c..9bca200", 13.3, tu, 130, 500, { color: '#cbd5e1' });
      drawOutputLine("Fast-forward", 13.6, tu, 130, 522, { color: C.green, weight: 700 });
      drawOutputLine(" kitoblar.txt | 1 +", 13.9, tu, 130, 544, { color: '#cbd5e1' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 570, 790, 110, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Fetch — Git'dagi Eng Xavfsiz Buyruq", 260, 600, C.green, { size: 16, mono: false });
        text("• Istalgan vaqtda, hatto chala ish ustida tursangiz ham fetch qilish mumkin.", 150, 640, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Ishchi fayllar buzilmaydi, yangiliklar faqat origin/main da turadi.", 150, 665, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Fetch va Birlashtirish Farqi", "nega Git buni ikkiga bo'ladi?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1-qoida: Fetch Ishingizga Tegmaydi", 1150, 290, C.green, { size: 16, mono: false });
        text("• Markazlashgan tizimlarda (SVN) yangilash darhol kod ustiga tushardi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git buni ikkiga bo'ladi: 1) ma'lumotni olish, 2) birlashtirish.", 1030, 365, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Yangi obyektlar .git/objects ga tushadi, origin/main suriladi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Sizning main, index va working tree o'zgarmasdan turadi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2-qoida: Avval Ko'zdan Kechirish", 1140, 500, C.cyan, { size: 16, mono: false });
        text("• git log main..origin/main: 'Serverda bor, menda yo'q' commitlar.", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• git diff main origin/main: Qaysi fayllar o'zgarganini solishtirish.", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Shundan so'ng: merge yoki rebase qilishni erkin hal qilasiz.", 1030, 605, { size: 16, color: C.text, align: 'left' });
        text("• Hech qanday kutilmagan konflikt ish jarayonini to'xtatmaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Git Push va Fast-forward Himoyasi
  // ==========================================
  function scenePushVaFastForward(u, bounds, o = {}) {
    chip(4, "Git Push va Fast-forward Himoyasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git push va rad etilish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git push -u origin main
      drawCommandLine("ali $ ", "git push -u origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("To ../server.git", 3.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      main -> main", 3.3, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine("branch 'main' set up to track 'origin/main'.", 3.6, tu, 130, 274, { color: C.cyan, weight: 600 });

      // 2-buyruq: ikkinchi dasturchining push qilishi (rad etiladi)
      drawCommandLine("vali $ ", "git push origin main", 5.5, 7.0, 7.2, tu, 130, 310, { promptCol: C.yellow });
      drawOutputLine("! [rejected]        main -> main (fetch first)", 7.5, tu, 130, 335, { color: C.red, weight: 700 });
      drawOutputLine("error: failed to push some refs to '../server.git'", 7.8, tu, 130, 357, { color: C.red });
      drawOutputLine("hint: Updates were rejected because the remote contains work", 8.1, tu, 130, 379, { color: C.yellow });
      drawOutputLine("hint: that you do not have locally.", 8.4, tu, 130, 401, { color: C.yellow });

      // 3-buyruq: fetch qilib ajralgan tarixni ko'rish
      drawCommandLine("vali $ ", "git fetch && git status", 10.0, 11.5, 11.7, tu, 130, 435, { promptCol: C.yellow });
      drawOutputLine("Your branch and 'origin/main' have diverged,", 12.0, tu, 130, 460, { color: C.red, weight: 600 });
      drawOutputLine("and have 1 and 1 different commits each, respectively.", 12.3, tu, 130, 482, { color: C.text });
      drawOutputLine("  # serverda Ali'ning commit'i bor, Vali'da esa o'ziniki!", 12.6, tu, 130, 504, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kCallout, () => {
        card(125, 530, 790, 150, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nima Uchun Push Rad Etiladi?", 230, 560, C.red, { size: 16, mono: false });
        text("• Push faqat FAST-FORWARD bo'lsagina ruxsat beriladi.", 150, 600, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Agar Git buni qabul qilsa, Ali yozgan commit serverdan o'chib ketardi!", 150, 630, { size: 16, color: C.text, align: 'left' });
        text("• Shuning uchun: avval serverdagi o'zgarishlarni olib birlashtirish shart.", 150, 660, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Push va Fast-forward Himoyasi", "ma'lumotlar yo'qolishining oldini olish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-u (--set-upstream) ning Vazifasi", 1140, 290, C.cyan, { size: 16, mono: false });
        text("• Lokal branchni serverdagi remote-tracking branchga bog'laydi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• .git/config ga [branch \"main\"] sozlamasini kiritadi.", 1030, 365, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• Kelgusida shunchaki 'git push' va 'git pull' deb yozish yetarli bo'ladi.", 1030, 400, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• git status siz necha commit oldinda yoki orqadaligingizni aytadi.", 1030, 425, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Ajralgan Tarix (Diverged)", 1110, 500, C.red, { size: 16, mono: false });
        text("Serverda:         9bca200 --- 0e4e6f7 (Ali commit'i)", 1030, 545, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("Vali lokalida:    9bca200 --- 5a3175a (Vali commit'i)", 1030, 575, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• Vali o'z commitini to'g'ridan-to'g'ri serverga yoza olmaydi.", 1030, 610, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Yechim: 'git pull' orqali ikkala tarixni birlashtirish kerak.", 1030, 635, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Git Pull: Rebase va Merge Strategiyalari
  // ==========================================
  function scenePullStrategiyalari(u, bounds, o = {}) {
    chip(5, "Git Pull: Rebase va Merge Strategiyalari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git pull usullari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git pull --rebase
      drawCommandLine("vali $ ", "git pull --rebase", 0.8, 2.2, 2.4, tu, 130, 205, { promptCol: C.yellow });
      drawOutputLine("Successfully rebased and updated refs/heads/main.", 2.8, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  # Vali'ning commit'i serverdagi yangi commit ustiga qayta terildi!", 3.1, tu, 130, 252, { color: C.mute });

      // 2-buyruq: logni ko'rish
      drawCommandLine("vali $ ", "git log --oneline --graph", 4.5, 6.0, 6.2, tu, 130, 288, { promptCol: C.yellow });
      drawOutputLine("* 8fb312a (HEAD -> main) Birinchi kitob (Vali)", 6.5, tu, 130, 313, { color: C.cyan, weight: 700 });
      drawOutputLine("* 0e4e6f7 (origin/main) README ga muallif qo'shish (Ali)", 6.8, tu, 130, 335, { color: C.yellow, weight: 600 });
      drawOutputLine("* 9bca200 Kitoblar ro'yxatini qo'shish", 7.1, tu, 130, 357, { color: '#cbd5e1' });
      drawOutputLine("  # tarmoqlanish yo'q, tarix chiroyli va to'g'ri chiziq!", 7.4, tu, 130, 379, { color: C.green });

      // 3-buyruq: muvaffaqiyatli push
      drawCommandLine("vali $ ", "git push", 8.8, 9.8, 10.0, tu, 130, 415, { promptCol: C.yellow });
      drawOutputLine("To ../server.git", 10.3, tu, 130, 440, { color: '#94a3b8' });
      drawOutputLine("   0e4e6f7..8fb312a  main -> main", 10.6, tu, 130, 462, { color: C.green, weight: 700 });
      drawOutputLine("  # endi bu toza fast-forward bo'lgani uchun server qabul qildi!", 10.9, tu, 130, 484, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kCallout, () => {
        card(125, 510, 790, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nima Uchun Jamoalarda pull --rebase Tavsiya Qilinadi?", 300, 545, C.green, { size: 16, mono: false });
        text("• Har safar pull qilganda ortiqcha 'Merge branch of...' commitlari yig'ilmaydi.", 150, 585, { size: 16, color: C.text, align: 'left' });
        text("• Tarix chiziqli qoladi va git bisect yoki git log orqali tekshirish oson bo'ladi.", 150, 615, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Sozlash: 'git config --global pull.rebase true'", 150, 645, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Git Pull Variantlari", "ajralgan tarixni qanday yarashtirish kerak?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 Xil Pull Strategiyasi", 1110, 290, C.green, { size: 16, mono: false });
        text("• git pull --rebase: O'z commitlaringizni remote uchi ustiga qayta teradi.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git pull --no-rebase: An'anaviy 3-tomonlama merge commit yasaydi.", 1030, 365, { size: 16, color: C.text, align: 'left' });
        text("• git pull --ff-only: Faqat toza fast-forward bo'lsagina ruxsat beradi.", 1030, 400, { size: 16, color: C.yellow, align: 'left' });
        text("• Git 2.27+ da sozlanmagan bo'lsa, xato beradi (aniq tanlovni talab qiladi).", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Qaysi Biri Qachon Yaxshi?", 1100, 500, C.yellow, { size: 16, mono: false });
        text("• Shaxsiy feature branchlarda: doimo 'pull --rebase' maqsadga muvofiq.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Umumiy asosiy branchlarda: ba'zan merge commitlar orqali kim qachon", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  birlashtirganini saqlab qolish uchun '--no-rebase' ishlatiladi.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Jamoa qoidasiga qarab global sozlamani belgilab oling.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Keyingi Qadam
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Remote Branchlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git sinxronizatsiya yakunlari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status -sb
      drawCommandLine("ali $ ", "git status -sb", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("## main...origin/main", 2.5, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  # local main va remote origin/main to'liq sinxron holatda!", 2.8, tu, 130, 252, { color: C.mute });

      // 2-buyruq: barcha branchlarni ko'rish
      drawCommandLine("ali $ ", "git branch -a", 4.0, 5.0, 5.2, tu, 130, 288);
      drawOutputLine("* main", 5.5, tu, 130, 313, { color: C.green, weight: 700 });
      drawOutputLine("  remotes/origin/HEAD -> origin/main", 5.8, tu, 130, 335, { color: C.cyan, weight: 600 });
      drawOutputLine("  remotes/origin/main", 6.1, tu, 130, 357, { color: C.cyan });
      drawOutputLine("  # remote-tracking branchlar server nusxasini ko'rsatib turadi!", 6.4, tu, 130, 379, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 8.0, 0.5);
      withA(kCallout, () => {
        card(125, 410, 790, 240, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("27-bobda O'rganilgan Asosiy Vositalar", 250, 445, C.cyan, { size: 16, mono: false });
        text("• git remote add / -v / set-url: Remotelar bilan to'liq ishlash.", 150, 485, { size: 16, color: C.text, align: 'left' });
        text("• git fetch: Obyektlarni xavfsiz yuklab oladi, ishchi kodga tegmaydi.", 150, 515, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git push -u: Yangi tarmoqni upstream bilan birga yuborish.", 150, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Fast-forward himoyasi: Birovning kodini ustiga yozib yubormaslik.", 150, 580, { size: 15, color: C.yellow, align: 'left' });
        text("• git pull --rebase: Chiziqli va o'qishga oson toza tarix yaratish.", 150, 610, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Keyingi Bosqich: 28-bob", "remote-tracking branchlar dunyosi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Taqsimlangan Tizim Kuchi", 1120, 290, C.purple, { size: 16, mono: false });
        text("• Markazlashgan tizimlardan farqli ravishda, Git har bir dasturchiga", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  lokal mustaqillik va xavfsiz integratsiya erkinligini beradi.", 1030, 365, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Internet yo'q paytda ham to'liq quvvat bilan ishlash imkoni mavjud.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Aloqa tiklanganda fetch va push orqali sinxronlanadi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("28-bob: Remote Branchlar va Kuzatuv", 1160, 500, C.green, { size: 16, mono: false });
        text("• Keyingi darsda refs/remotes/ katalogining ichki sirlari,", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("  upstream branchlarni belgilash va kuzatish holatlari,", 1030, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Masofaviy branchlarni push qilish va xavfsiz o'chirish (--delete),", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Hamda 'git fetch --prune' tozalash amaliyotini o'rganamiz.", 1030, 630, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
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
      { id: 'remote_boshqaruvi', fn: sceneRemoteBoshqaruvi },
      { id: 'fetch_ichki_tuzilishi', fn: sceneFetchIchkiTuzilishi },
      { id: 'push_va_fast_forward', fn: scenePushVaFastForward },
      { id: 'pull_strategiyalari', fn: scenePullStrategiyalari },
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

  // Poster uchun ko'rgazmali kadr
  window.renderPoster = function () {
    bg();
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
