// Git 28-bob videosi: "Remote branch'lar va kuzatish"
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
  // 1-SAHNA: Kirish va 3 Xil Branch Turi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Kirish: Uch Xil Branch va Remote-Tracking", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch turlari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch -avv
      drawCommandLine("vali $ ", "git branch -avv", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("* main                3c8955c [origin/main] Boshlang'ich commit", 2.7, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  remotes/origin/HEAD -> origin/main", 3.0, tu, 130, 252, { color: C.cyan });
      drawOutputLine("  remotes/origin/main 3c8955c Boshlang'ich commit", 3.3, tu, 130, 274, { color: C.cyan });

      // 2-buyruq: to'g'ridan-to'g'ri o'tishga urinish
      drawCommandLine("vali $ ", "git switch origin/main", 4.8, 6.2, 6.4, tu, 130, 310);
      drawOutputLine("fatal: a branch is expected, got remote branch 'origin/main'", 6.7, tu, 130, 335, { color: C.red, weight: 700 });
      drawOutputLine("hint: If you want to detach HEAD, try again with --detach option.", 7.0, tu, 130, 357, { color: C.yellow });
      drawOutputLine("  # remote-tracking branch'ga to'g'ridan-to'g'ri commit qilib bo'lmaydi!", 7.3, tu, 130, 379, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 9.5, 0.5);
      withA(kCallout, () => {
        card(125, 410, 790, 240, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Remote-Tracking Branch — Bu Xatcho'p (Bookmark)", 270, 445, C.cyan, { size: 16, mono: false });
        text("• 'Oxirgi marta server bilan aloqa qilganimda, uning main'i shu yerda edi'.", 150, 485, { size: 16, color: C.text, align: 'left' });
        text("• Siz uni o'zingiz sura olmaysiz — faqat Git fetch va push paytida yangilaydi.", 150, 515, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Lokal branch: refs/heads/ da (siz o'zgartirasiz).", 150, 550, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Server branch: serverdagi refs/heads/ da (push bilan yangilanadi).", 150, 580, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Remote-tracking: refs/remotes/origin/* da (lokal xatcho'p).", 150, 610, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Git'dagi 3 Xil Branch Turi", "lokal, serverdagi va xatcho'p", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Branch Turlarining Vazifasi", 1120, 290, C.cyan, { size: 16, mono: false });
        text("• Lokal Branch: Har kuni ishlaydigan ishchi branchlaringiz.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Remote-Tracking Branch: Serverdagi holatning muzlatilgan nusxasi.", 1030, 365, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Server Branch: Masofaviy repozitoriyning o'zida yotgan haqiqiy ref.", 1030, 400, { size: 16, color: C.yellow, align: 'left' });
        text("• Hech qachon remote-tracking branch ustida bevosita kod yozilmaydi.", 1030, 425, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega Git Server Holatini Saqlaydi?", 1150, 500, C.green, { size: 16, mono: false });
        text("• Oflayn Ishlash: Poyezdda yoki internetsiz ham diff va log ishlayveradi.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Tezkorlik: git status har safar internetga chiqib kutib o'tirmaydi.", 1030, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Xavfsizlik: fetch ishingizga tegmaydi, faqat xatcho'pni yangilaydi.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Nazorat: Avval o'zgarishni ko'rib, keyin birlashtirish imkoniyati.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Tracking va Yangi Branch Ochish
  // ==========================================
  function sceneTrackingVaSwitch(u, bounds, o = {}) {
    chip(2, "Tracking va Yangi Branch Ochish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — tracking branch ochish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch qidiruv (avto taxmin)
      drawCommandLine("ali $ ", "git switch qidiruv", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("branch 'qidiruv' set up to track 'origin/qidiruv'.", 2.7, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("Switched to a new branch 'qidiruv'", 3.0, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine("  # --guess orqali Git lokal branchni yaratdi va tracking o'rnatdi!", 3.3, tu, 130, 274, { color: C.mute });

      // 2-buyruq: upstream qisqa ko'rinishi
      drawCommandLine("ali $ ", "git rev-parse --abbrev-ref @{u}", 5.0, 6.8, 7.0, tu, 130, 310);
      drawOutputLine("origin/qidiruv", 7.3, tu, 130, 335, { color: C.cyan, weight: 700 });
      drawOutputLine("  # @{u} — joriy branchning upstream nomidir", 7.6, tu, 130, 357, { color: C.mute });

      // 3-buyruq: config ichini ko'rish
      drawCommandLine("ali $ ", "sed -n '/branch \"qidiruv\"/,$p' .git/config", 9.2, 11.2, 11.4, tu, 130, 393);
      drawOutputLine('[branch "qidiruv"]', 11.7, tu, 130, 418, { color: C.yellow, weight: 600 });
      drawOutputLine('    remote = origin', 12.0, tu, 130, 440, { color: C.cyan });
      drawOutputLine('    merge = refs/heads/qidiruv', 12.3, tu, 130, 462, { color: '#cbd5e1' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kCallout, () => {
        card(125, 495, 790, 150, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Tracking Bog'lanishining Kuchi", 220, 525, C.green, { size: 16, mono: false });
        text("• argumentsiz 'git push' va 'git pull' qayerga borishni aniq biladi.", 150, 565, { size: 16, color: C.text, align: 'left' });
        text("• 'git merge @{u}' orqali upstream xatcho'pini bir zumda merge qilish oson.", 150, 595, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git status sizga necha commit farq borligini (ahead/behind) aytadi.", 150, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Tracking Branch Mexanizmi", ".git/config dagi 2 ta sehrli qator", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Git Switch --guess Xususiyati", 1130, 290, C.green, { size: 16, mono: false });
        text("• Sizda 'qidiruv' nomli lokal branch yo'q, lekin remote'da bor bo'lsa:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  'git switch qidiruv' avtomatik ravishda yangi lokal branch ochadi.", 1030, 365, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Va uning upstream'ini origin/qidiruv ga bog'lab qo'yadi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Boshqa nom bilan ochish: 'git switch -c yangi-nom origin/qidiruv'", 1030, 425, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Config Ichki Strukturasi", 1100, 500, C.yellow, { size: 16, mono: false });
        text("• branch.<nom>.remote = origin (qaysi server bilan ishlashi)", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• branch.<nom>.merge = refs/heads/qidiruv (serverdagi ref nomi)", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Upstream hatto boshqa lokal branch ham bo'lishi mumkin (remote = .)", 1030, 610, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Upstream'ni o'chirish: 'git branch --unset-upstream'", 1030, 635, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Ahead va Behind Hisobi
  // ==========================================
  function sceneAheadVaBehind(u, bounds, o = {}) {
    chip(3, "Ahead va Behind Hisobi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ahead va behind tahlili',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status -sb
      drawCommandLine("ali $ ", "git status -sb", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("## main...origin/main [ahead 2, behind 1]", 2.5, tu, 130, 230, { color: C.yellow, weight: 700 });
      drawOutputLine("  # sizda 2 ta yangi commit bor, serverda 1 ta yangi commit bor!", 2.8, tu, 130, 252, { color: C.mute });

      // 2-buyruq: commitlarni farqlash
      drawCommandLine("ali $ ", "git log --oneline --left-right main...origin/main", 4.5, 6.8, 7.0, tu, 130, 288);
      drawOutputLine("< bc6e608 Litsenziya qo'shish        # ahead 1", 7.3, tu, 130, 313, { color: C.cyan, weight: 600 });
      drawOutputLine("< a370af1 Muallif kiritildi          # ahead 2", 7.6, tu, 130, 335, { color: C.cyan, weight: 600 });
      drawOutputLine("> d9c2641 Kitoblar ro'yxati (Vali)   # behind 1", 7.9, tu, 130, 357, { color: C.yellow, weight: 600 });

      // 3-buyruq: birlashtirib push qilish
      drawCommandLine("ali $ ", "git pull --rebase && git push", 9.8, 11.8, 12.0, tu, 130, 393);
      drawOutputLine("Successfully rebased and updated refs/heads/main.", 12.3, tu, 130, 418, { color: C.green, weight: 700 });
      drawOutputLine("To ../server.git   d9c2641..46c3f9b  main -> main", 12.6, tu, 130, 440, { color: C.green, weight: 600 });
      drawOutputLine("  # muvaffaqiyatli sinxronlandi!", 12.9, tu, 130, 462, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.0, 0.5);
      withA(kCallout, () => {
        card(125, 495, 790, 150, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Raqamlar Qayerdan Keladi?", 210, 525, C.yellow, { size: 16, mono: false });
        text("• ahead N: Sizda bor, serverda yo'q N ta commit (push qilinishi kerak).", 150, 565, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• behind M: Serverda bor, sizda yo'q M ta commit (pull qilinishi kerak).", 150, 595, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Ikkisi ham bo'lsa: Tarix ajralgan (diverged) — pull --rebase qilinadi.", 150, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Ahead va Behind Mexanizmi", "uch nuqta (main...origin/main) oralig'i", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uch Nuqta Simmetrik Farqi", 1130, 290, C.cyan, { size: 16, mono: false });
        text("• rev-list --left-right --count main...origin/main buyrug'i", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("  ushbu ikki raqamni aniq hisoblab beradi.", 1030, 365, { size: 16, color: C.text, align: 'left' });
        text("• '<' belgisi: Chap branch (lokal) commitlari.", 1030, 400, { size: 15, color: C.green, align: 'left' });
        text("• '>' belgisi: O'ng branch (server) commitlari.", 1030, 425, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Eskirish (Staleness) Xavfi", 1110, 500, C.red, { size: 16, mono: false });
        text("• Diqqat: git status va git branch -vv SERVERGA ULANMAYDI!", 1030, 545, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Ular faqat oxirgi fetch paytidagi lokal xatcho'p bilan solishtiradi.", 1030, 575, { size: 16, color: C.text, align: 'left' });
        text("• Aniq manzara uchun: avval 'git fetch', keyin 'git status'.", 1030, 610, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• 'git fetch --all' barcha remotelarni birdaniga yangilaydi.", 1030, 635, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Yangi Branch Push va autoSetupRemote
  // ==========================================
  function sceneRemoteBranchPush(u, bounds, o = {}) {
    chip(4, "Yangi Branch Push va autoSetupRemote", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — yangi branch push qilish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: yangi branch ochish
      drawCommandLine("vali $ ", "git switch -c tolov", 0.8, 2.2, 2.4, tu, 130, 205, { promptCol: C.yellow });
      drawOutputLine("Switched to a new branch 'tolov'", 2.7, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: upstream yo'qligi sababli push rad etilishi
      drawCommandLine("vali $ ", "git push", 3.8, 4.8, 5.0, tu, 130, 265, { promptCol: C.yellow });
      drawOutputLine("fatal: The current branch tolov has no upstream branch.", 5.3, tu, 130, 290, { color: C.red, weight: 700 });
      drawOutputLine("hint: To push and set the remote as upstream, use:", 5.6, tu, 130, 312, { color: C.yellow });
      drawOutputLine("hint:     git push --set-upstream origin tolov", 5.9, tu, 130, 334, { color: C.cyan, weight: 600 });

      // 3-buyruq: autoSetupRemote yoqish
      drawCommandLine("vali $ ", "git config --global push.autoSetupRemote true", 7.5, 10.0, 10.2, tu, 130, 370, { promptCol: C.yellow });

      // 4-buyruq: endi oddiy git push ning o'zi ishlaydi
      drawCommandLine("vali $ ", "git push", 11.5, 12.5, 12.7, tu, 130, 405, { promptCol: C.yellow });
      drawOutputLine("To ../server.git", 13.0, tu, 130, 430, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      tolov -> tolov", 13.3, tu, 130, 452, { color: C.green, weight: 700 });
      drawOutputLine("branch 'tolov' set up to track 'origin/tolov'.", 13.6, tu, 130, 474, { color: C.cyan, weight: 600 });
      drawOutputLine("  # kelgusida har bir yangi branch birgina git push bilan ulanadi!", 13.9, tu, 130, 496, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 520, 790, 130, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("push.autoSetupRemote Sehrli Sozlamasi", 260, 550, C.cyan, { size: 16, mono: false });
        text("• Git 2.37 dan boshlab qo'shilgan eng qulay imkoniyatlardan biri.", 150, 590, { size: 16, color: C.text, align: 'left' });
        text("• Har safar '--set-upstream origin <nom>' deb yozish mashaqqatini yo'qotadi.", 150, 620, { size: 16, color: C.cyan, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Yangi Tarmoqni Serverga Uzatish", "upstream o'rnatish usullari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-u (--set-upstream) Nima Qiladi?", 1140, 290, C.cyan, { size: 16, mono: false });
        text("• 1. Serverda yangi refs/heads/<nom> ref'ini yaratadi.", 1030, 335, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• 2. Sizda refs/remotes/origin/<nom> xatcho'pini ochadi.", 1030, 365, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• 3. .git/config ga [branch \"<nom>\"] upstream qoidasini yozadi.", 1030, 400, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Natijada lokal va server tarmoqlari bir-birini doimiy kuzatadi.", 1030, 425, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Zamonaviy Standart", 1100, 500, C.green, { size: 16, mono: false });
        text("• 'git config --global push.autoSetupRemote true' buyrug'ini bir marta bering.", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Shundan so'ng yangi branch ochib, to'g'ridan-to'g'ri 'git push' qilavering.", 1030, 575, { size: 16, color: C.text, align: 'left' });
        text("• Git o'zi kerakli barcha upstream sozlamalarini bajaradi.", 1030, 610, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Jamoaviy workflowlar uchun eng tavsiya etilgan qulaylik.", 1030, 635, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Masofaviy Branchlarni O'chirish va Prune
  // ==========================================
  function sceneDeleteVaPrune(u, bounds, o = {}) {
    chip(5, "Masofaviy Branchlarni O‘chirish va Prune", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — branch o‘chirish va prune',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: masofaviy branchni o'chirish
      drawCommandLine("vali $ ", "git push origin --delete tolov", 0.8, 2.8, 3.0, tu, 130, 205, { promptCol: C.yellow });
      drawOutputLine("To ../server.git", 3.3, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" - [deleted]         tolov", 3.6, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("  # serverdagi 'tolov' branchi muvaffaqiyatli o'chirildi!", 3.9, tu, 130, 274, { color: C.mute });

      // 2-buyruq: boshqa dasturchida stale xatcho'p qolishi
      drawCommandLine("ali $ ", "git branch -avv", 5.2, 6.5, 6.7, tu, 130, 310);
      drawOutputLine("* main                 46c3f9b [origin/main] Litsenziya", 7.0, tu, 130, 335, { color: C.green, weight: 700 });
      drawOutputLine("  remotes/origin/tolov 8a9b94b  # serverda o'chgan, lekin Alida STALE!", 7.3, tu, 130, 357, { color: C.yellow, weight: 600 });

      // 3-buyruq: git fetch --prune
      drawCommandLine("ali $ ", "git fetch --prune", 8.8, 10.2, 10.4, tu, 130, 393);
      drawOutputLine("From ../server", 10.7, tu, 130, 418, { color: '#94a3b8' });
      drawOutputLine(" - [deleted]         (none) -> origin/tolov", 11.0, tu, 130, 440, { color: C.red, weight: 700 });
      drawOutputLine("  # o'chirilgan branch xatcho'pi tozalandi, ombor tartibga keldi!", 11.3, tu, 130, 462, { color: C.green, weight: 600 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 12.5, 0.5);
      withA(kCallout, () => {
        card(125, 485, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Prune — Eskirgan Xatcho'plarni Tozalash", 250, 515, C.red, { size: 16, mono: false });
        text("• Nega oddiy fetch o'chirmaydi? Git ma'lumotni saqlash tamoyiliga ega.", 150, 555, { size: 16, color: C.text, align: 'left' });
        text("• 'git fetch --prune' serverda mavjud bo'lmagan xatcho'plarni o'chiradi.", 150, 585, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Diqqat: Sizning LOKAL branchlaringiz o'chmaydi — faqat refs/remotes/ tozalanadi.", 150, 615, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Masofaviy Branchlarni Boshqarish", "o'chirish va tozalash madaniyati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Branch O'chirish Sintaksisi", 1130, 290, C.red, { size: 16, mono: false });
        text("• Yangi sintaksis: 'git push origin --delete <brench>'", 1030, 335, { size: 15, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("• Eski refspec sintaksisi: 'git push origin :<brench>'", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("  (ikki nuqtadan oldin bo'sh joy — 'hech narsani yoz' degani).", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Serverda faqat ref o'chadi, obyektlar gc gacha saqlanadi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Avtomatik Prune Sozlamasi", 1120, 500, C.green, { size: 16, mono: false });
        text("• 'git config --global fetch.prune true'", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Ushbu sozlama har bir 'git fetch' paytida eskirgan brenchlarni", 1030, 575, { size: 16, color: C.text, align: 'left' });
        text("  avtomatik tozalab boradi.", 1030, 605, { size: 16, color: C.green, align: 'left' });
        text("• Omboringizda 'arvoh' (stale) branchlar to'planib qolmaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Keyingi Qadam
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Keyingi Qadam", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — remote branch xulosalari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch -vv holati
      drawCommandLine("ali $ ", "git branch -vv", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("* main    46c3f9b [origin/main] Toza va sinxron ombor", 2.5, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  # barcha tracking tarmoqlar server bilan to'liq tenglashgan!", 2.8, tu, 130, 252, { color: C.mute });

      // 2-buyruq: remote show origin
      drawCommandLine("ali $ ", "git remote show origin", 4.0, 5.5, 5.7, tu, 130, 288);
      drawOutputLine("* remote origin", 6.0, tu, 130, 313, { color: C.cyan, weight: 600 });
      drawOutputLine("  HEAD branch: main", 6.3, tu, 130, 335, { color: '#cbd5e1' });
      drawOutputLine("  Remote branch: main tracked", 6.6, tu, 130, 357, { color: C.green, weight: 600 });
      drawOutputLine("  Local branch configured for 'git pull': main merges with remote main", 6.9, tu, 130, 379, { color: '#94a3b8' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 8.0, 0.5);
      withA(kCallout, () => {
        card(125, 410, 790, 240, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("28-bobda O'rganilgan Asosiy Vositalar", 250, 445, C.cyan, { size: 16, mono: false });
        text("• Uch xil branch: Lokal (heads/), Serverdagi, va Remote-tracking (remotes/).", 150, 485, { size: 16, color: C.text, align: 'left' });
        text("• git switch <nom>: --guess yordamida remote xatcho'pdan lokal branch ochish.", 150, 515, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• @{u} sintaksisi: Joriy branchning upstream manziliga qisqa murojaat.", 150, 550, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• ahead va behind: Serverdan qancha oldinda yoki orqadalikni aniq bilish.", 150, 580, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• git push --delete va git fetch --prune: Omborni toza saqlash madaniyati.", 150, 610, { size: 15, color: C.cyan, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Keyingi Bob: 29-bob", "fetch va push ichki protokollari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Remote Intizomi Xulosasi", 1120, 290, C.purple, { size: 16, mono: false });
        text("• Remote branchlar jamoaviy ishlashda tartib va xavfsizlikni ta'minlaydi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Har kim o'z branchida erkin kod yozadi va upstream orqali kuzatadi.", 1030, 365, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Ish bitgach, branch o'chiriladi va prune qilinadi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Git ombori doimo sarishta va ixcham bo'lib qoladi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("29-bob: fetch va push Ichidan", 1130, 500, C.green, { size: 16, mono: false });
        text("• Keyingi darsda tarmoq protokollari (Smart HTTP, SSH),", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Refspeklar sintaksisi (+refs/heads/*:refs/remotes/origin/*),", 1030, 575, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Server va mijoz o'rtasida packfile qanday kelishilishini (negotiation)", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("  va tarmoq trafigi qanday tejalishini ichkaridan ko'ramiz!", 1030, 630, { size: 15, color: '#cbd5e1', align: 'left' });
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
      { id: 'tracking_va_switch', fn: sceneTrackingVaSwitch },
      { id: 'ahead_va_behind', fn: sceneAheadVaBehind },
      { id: 'remote_branch_push', fn: sceneRemoteBranchPush },
      { id: 'delete_va_prune', fn: sceneDeleteVaPrune },
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
