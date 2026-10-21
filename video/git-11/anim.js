// Git 11-bob videosi: "Bekor qilish: amend va restore"
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
  // 1-SAHNA: Kirish va Bekor Qilish Xaritasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("11-BOB · BEKOR QILISH: AMEND VA RESTORE", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Gitda Xatolarni Orqaga Qaytarish", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Xato qayerda ekaniga qarab tegishli bekor qilish vositalari", 960, 415, { size: 26, color: C.mute });

        // Markaziy 3 hudud kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("3 Hududdagi Bekor Qilish Amallari", 960, 530, C.blue, { size: 22 });

          card(400, 580, 340, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Oxirgi Commit", 570, 615, C.yellow, { size: 18 });
          text("git commit --amend", 570, 655, { size: 15, fam: MONO, color: C.yellow, weight: 600 });

          card(790, 580, 340, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("Index (Staging)", 960, 615, C.green, { size: 18 });
          text("git restore --staged", 960, 655, { size: 15, fam: MONO, color: C.green, weight: 600 });

          card(1180, 580, 340, 110, { fill: 'rgba(239,68,68,0.10)', col: C.red });
          pill("Working Tree", 1350, 615, C.red, { size: 18 });
          text("git restore <fayl>", 1350, 655, { size: 15, fam: MONO, color: C.red, weight: 600 });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Bekor Qilish Xaritasi va 3 Hudud", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Xato qayerda sodir bo'ldi?
      panel(100, 140, 840, 680, C.yellow, "Xato Qayerda Sodir Bo'ldi?", "har bir hudud o'z buyrug'iga ega", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 Ta Hudud Chegarasi", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Oxirgi commitda: Fayl unutilgan yoki xabarda imlo xatosi bor.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Index hududida: Keraksiz fayl tasodifan 'git add' bilan qo'shilgan.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git status O'zi Yo'l Ko'rsatadi", 250, 470, C.green, { size: 16, mono: false });
        text("• git status o'zi bekor qilish yo'llarini qavs ichida eslatib turadi:", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("  'use \"git restore --staged <file>...\" to unstage'", 150, 555, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarishlar Xavfsizligi", 230, 655, C.mute, { size: 16, mono: false });
        text("• Indexdagi bekor qilishlar xavfsiz (fayl diskda butun saqlanadi).", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Working treedagi bekor qilish esa xavfli — kod qaytarilmas yo'qoladi!", 150, 740, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: 3 ta asosiy vosita
      panel(980, 140, 840, 680, C.blue, "Asosiy Bekor Qilish Buyruqlari", "kundalik amaliyotda eng ko'p ishlatiladiganlar", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · commit --amend (Commit uchun)", 1170, 290, C.yellow, { size: 16, mono: false });
        text("• Oxirgi commitni yangi o'zgarishlar bilan almashtirish.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("  $ git add unutilgan.py && git commit --amend", 1030, 375, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · restore --staged (Index uchun)", 1170, 470, C.green, { size: 16, mono: false });
        text("• Faylni indexdan chiqarish (unstage), faylga tegmasdan.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("  $ git restore --staged <fayl>  # 100% xavfsiz!", 1030, 555, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("3 · restore <fayl> (Working Tree)", 1160, 655, C.red, { size: 16, mono: false });
        text("• Fayldagi saqlanmagan barcha tahrirlarni butunlay tashlash.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  $ git restore <fayl>  # diqqat: o'zgarish yo'qoladi!", 1030, 740, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: commit --amend (SPLIT SCREEN)
  // ==========================================
  function sceneAmend(u, bounds, o = {}) {
    chip(2, "commit --amend: Oxirgi Commitni Yangilash", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda amend amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/hisob-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git commit va unutilgan fayl (u: 0.8 to 2.4, Enter 2.6)
      drawCommandLine("loyiha $ ", "git commit -m \"Ko'paytmani hisoblash\"", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("[main 5c2f252] Ko'paytmani hisoblash", 2.9, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 2 insertions(+)  # faqat app.py kirdi!", 3.2, tu, 130, 252, { color: '#64748b' });

      // 2-buyruq: git status -s tekshiruvi (u: 4.0 to 4.8, Enter 5.0)
      drawCommandLine("loyiha $ ", "git status -s", 4.0, 4.8, 5.0, tu, 130, 284);
      drawOutputLine("?? hisob.py  # hisob moduli commitda unutilib qolgan!", 5.3, tu, 130, 308, { color: C.red, weight: 600 });

      // 3-buyruq: git add hisob.py && git commit --amend --no-edit (u: 6.5 to 8.5, Enter 8.7)
      drawCommandLine("loyiha $ ", "git add hisob.py && git commit --amend --no-edit", 6.5, 8.5, 8.7, tu, 130, 340);
      drawOutputLine("[main 4d5e0f1] Ko'paytmani hisoblash", 9.0, tu, 130, 364, { color: C.green, weight: 700 });
      drawOutputLine(" Date: Wed Oct 21 12:00:00 2026 +0500", 9.3, tu, 130, 386, { color: '#64748b' });
      drawOutputLine(" 2 files changed, 4 insertions(+)  # endi hisob.py ham bor!", 9.6, tu, 130, 408, { color: C.cyan, weight: 600 });

      // 4-buyruq: git reflog -2 (almashtirish isboti) (u: 10.8 to 12.0, Enter 12.2)
      drawCommandLine("loyiha $ ", "git reflog -2", 10.8, 12.0, 12.2, tu, 130, 440);
      drawOutputLine("4d5e0f1 HEAD@{0}: commit (amend): Ko'paytmani hisoblash", 12.5, tu, 130, 464, { color: C.yellow, weight: 600 });
      drawOutputLine("5c2f252 HEAD@{1}: commit: Ko'paytmani hisoblash", 12.9, tu, 130, 488, { color: '#64748b' });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 13.5, tu, 130, 525, { color: '#334155' });
      drawOutputLine("Isbot: Eski commit 5c2f252 chetga surilib,", 14.0, tu, 130, 555, { color: C.yellow, weight: 600 });
      drawOutputLine("butunlay yangi commit 4d5e0f1 uning o'rniga o'tdi!", 14.5, tu, 130, 580, { color: C.green, weight: 700 });
      drawOutputLine("Bekor qilish: git reset --soft HEAD@{1}", 15.0, tu, 130, 608, { color: C.cyan });

      // O'ng panel: Amend qoidalari va xavf tahlili
      panel(980, 140, 840, 680, C.yellow, "commit --amend Falsafasi", "oxirgi commitni almashtirish qoidalari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Qachon Ishlatiladi?", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• Commitga yangi fayl qo'shish unutilganda (git add + amend).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Xabardagi imlo xatosini tuzatishda: git commit --amend -m \"xabar\".", 1030, 370, { size: 17, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• --no-edit: Xabarga tegmasdan faqat o'zgargan fayllarni biriktiradi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Ichki Mexanizm: Almashtirish", 1170, 470, C.purple, { size: 16, mono: false });
        text("• Amend eski commitni tuzatmaydi, yangi commit obyekti yasaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi commit eskisining otasiga ulanadi, eskisiga emas!", 1030, 550, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Hash o'zgaradi, lekin eski commit reflogda 90 kun saqlanadi.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Qat'iy Qoida: Push Bo'lsa Amend Qilmang!", 1220, 655, C.red, { size: 16, mono: false });
        text("• Faqat shaxsiy, hali push qilinmagan kommitlarni amend qiling.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Push qilingan commit amend qilinsa, hamkasblar tarixi ajraladi!", 1030, 735, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Push qilingan xatoni faqat yangi commit yoki 'git revert' bilan hal qiling.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git restore --staged (SPLIT SCREEN)
  // ==========================================
  function sceneUnstage(u, bounds, o = {}) {
    chip(3, "git restore --staged: Indexdan Chiqarish", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda unstage amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/hisob-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git status tekshiruvi (u: 0.8 to 1.8, Enter 2.0)
      drawCommandLine("loyiha $ ", "git status", 0.8, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Changes to be committed:  (git add . barchasini qo'shgan)", 2.3, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  (use \"git restore --staged <file>...\" to unstage)", 2.6, tu, 130, 252, { color: '#64748b' });
      drawOutputLine("\tmodified:   app.py     # bu commitga kirishi kerak", 2.9, tu, 130, 274, { color: C.green });
      drawOutputLine("\tmodified:   README.md  # bu esa alohida commit bo'lishi lozim", 3.2, tu, 130, 296, { color: C.yellow, weight: 600 });

      // 2-buyruq: git restore --staged README.md (u: 4.5 to 6.2, Enter 6.4)
      drawCommandLine("loyiha $ ", "git restore --staged README.md", 4.5, 6.2, 6.4, tu, 130, 330);
      drawOutputLine("# Muvaffaqiyatli unstage bo'ldi (xatoliksiz)", 6.7, tu, 130, 354, { color: '#64748b' });

      // 3-buyruq: git status -s tekshiruvi (u: 7.6 to 8.6, Enter 8.8)
      drawCommandLine("loyiha $ ", "git status -s", 7.6, 8.6, 8.8, tu, 130, 390);
      drawOutputLine("M  app.py     # staged: faqat app.py commitga ketadi", 9.1, tu, 130, 414, { color: C.green, weight: 700 });
      drawOutputLine(" M README.md  # unstaged: diskdagi barcha o'zgarish joyida!", 9.5, tu, 130, 438, { color: C.yellow, weight: 700 });

      // 4-buyruq: butun papkani unstage qilish (u: 10.8 to 12.0, Enter 12.2)
      drawCommandLine("loyiha $ ", "git restore --staged .", 10.8, 12.0, 12.2, tu, 130, 474);
      drawOutputLine("# Joriy papkadagi barcha fayllar indexdan xavfsiz chiqarildi", 12.5, tu, 130, 498, { color: C.cyan });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 13.2, tu, 130, 535, { color: '#334155' });
      drawOutputLine("Xulosa: 'restore --staged' buyrug'i 100% xavfsiz!", 13.7, tu, 130, 565, { color: C.green, weight: 700 });
      drawOutputLine("Fayllardagi birorta ham qator o'chirilmaydi yoki yo'qolmaydi.", 14.1, tu, 130, 590, { color: C.yellow });
      drawOutputLine("Bu 'git add' ning teskarisi: HEAD versiyasini indexga tiklaydi.", 14.6, tu, 130, 615, { color: C.mute });

      // O'ng panel: Staging hududidan chiqarish tahlili
      panel(980, 140, 840, 680, C.green, "Staging Hududidan Chiqarish", "100% xavfsiz bekor qilish amali", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Muammo: Tasodifiy 'git add .'", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• Ikki mustaqil faylni alohida commit qilmoqchi edingiz.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Lekin 'git add .' barcha o'zgarishlarni bittada stage qilib qo'ydi.", 1030, 370, { size: 17, color: C.text, align: 'left' });
        text("• Yoki .env yoki maxfiy sozlama fayli indexga tushib qoldi.", 1030, 400, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kR2 = P(u, 6.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yechim: git restore --staged <fayl>", 1190, 470, C.green, { size: 16, mono: false });
        text("• Fayl indexdan chiqarildi (unstage bo'ldi).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• 100% Xavfsiz: Diskdagi o'zgarishlar o'z joyida to'liq saqlanadi!", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Bu 'git add' ning aynan teskarisi: HEAD dan indexga tiklaydi.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Hali Ilk Commit Bo'lmagan Repoda", 1180, 655, C.cyan, { size: 16, mono: false });
        text("• Yangi repoda hali HEAD bo'lmasa: git rm --cached <fayl>", 1030, 700, { size: 17, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("• Sababi: HEAD mavjud bo'lmagani uchun restore nusxa ololmaydi.", 1030, 735, { size: 17, color: C.text, align: 'left' });
        text("• git rm --cached faylni indexdan olib, qayta untracked holatga keltiradi.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git restore (Working Tree) (SPLIT SCREEN)
  // ==========================================
  function sceneRestoreWorktree(u, bounds, o = {}) {
    chip(4, "git restore: Diskdagi O‘zgarishni Tashlash", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda diskdagi o'zgarishni tashlash va o'chirilgan faylni qaytarish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/hisob-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git diff app.py keraksiz kodni ko'rish (u: 0.8 to 2.0, Enter 2.2)
      drawCommandLine("loyiha $ ", "git diff app.py", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("@@ -5,3 +5,5 @@ def hisobla():", 2.5, tu, 130, 230, { color: C.cyan });
      drawOutputLine("+print(\"DEBUG EXPERIMENT\")  # keraksiz sinov kodi", 2.8, tu, 130, 252, { color: C.red, weight: 600 });
      drawOutputLine("+raise Exception(\"xatolik\")  # bu kod kerak emas!", 3.1, tu, 130, 274, { color: C.red, weight: 600 });

      // 2-buyruq: git restore app.py (u: 4.5 to 5.8, Enter 6.0)
      drawCommandLine("loyiha $ ", "git restore app.py", 4.5, 5.8, 6.0, tu, 130, 308);
      drawOutputLine("# app.py indexdagi toza versiyasiga qaytarildi", 6.3, tu, 130, 332, { color: '#64748b' });

      // 3-buyruq: git status -s tekshiruvi (u: 7.2 to 8.2, Enter 8.4)
      drawCommandLine("loyiha $ ", "git status -s", 7.2, 8.2, 8.4, tu, 130, 366);
      drawOutputLine("# (toza — hech qanday o'zgarish qolmadi)", 8.7, tu, 130, 390, { color: C.green, weight: 600 });

      // 4-buyruq: tasodifan o'chirilgan faylni tiklash (u: 9.8 to 11.2, Enter 11.4)
      drawCommandLine("loyiha $ ", "rm hisob.py && git status -s", 9.8, 11.2, 11.4, tu, 130, 424);
      drawOutputLine(" D hisob.py  # fayl diskdan o'chirildi", 11.7, tu, 130, 448, { color: C.red });

      // 5-buyruq: glob bilan tiklash (u: 12.6 to 13.8, Enter 14.0)
      drawCommandLine("loyiha $ ", "git restore '*.py'", 12.6, 13.8, 14.0, tu, 130, 480);
      drawOutputLine("# hisob.py indexdan to'liq qaytarildi (qo'shtirnoq shart!)", 14.3, tu, 130, 504, { color: C.green, weight: 700 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 14.8, tu, 130, 540, { color: '#334155' });
      drawOutputLine("DIQQAT: 'git restore <fayl>' xavfli buyruq!", 15.2, tu, 130, 570, { color: C.red, weight: 700 });
      drawOutputLine("Commit qilinmagan lokal kod butunlay o'chib ketadi.", 15.6, tu, 130, 595, { color: C.yellow });
      drawOutputLine("Shubha bo'lsa: avval 'git stash' bilan saqlab qo'ying!", 16.0, tu, 130, 620, { color: C.green, weight: 600 });

      // O'ng panel: Working tree xavfi va nozikliklar
      panel(980, 140, 840, 680, C.red, "Fayldagi O'zgarishni Tashlash", "qaytarib bo'lmaydigan xavfli amal", kBox, kBox);

      const kL1 = P(u, 1.0, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Qat'iy Ogohlantirish: Xavfli Amal!", 1180, 290, C.red, { size: 16, mono: false });
        text("• Bu buyruq o'sha fayldagi barcha saqlanmagan tahrirlarni o'chiradi!", 1030, 335, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Commit qilinmagan o'zgarishlar Git xotirasida saqlanmagan.", 1030, 370, { size: 17, color: C.text, align: 'left' });
        text("• O'chirilgach, ularni qaytarib olishning MUTLAQO iloji yo'q!", 1030, 400, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 6.0, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Indexdan Tiklash Qoidasi", 1140, 470, C.yellow, { size: 16, mono: false });
        text("• git restore <fayl> HEAD dan emas, INDEX dan tiklaydi!", 1030, 515, { size: 17, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Agar fayl 'MM' bo'lsa, faqat stage qilinmagan qism tashlanadi.", 1030, 550, { size: 17, color: C.text, align: 'left' });
        text("• Ikkalasini ham HEAD ga tenglash: git restore -s@ -SW <fayl>", 1030, 580, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kL3 = P(u, 11.5, 0.5);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bo'laklab Bekor Qilish: restore -p", 1180, 655, C.green, { size: 16, mono: false });
        text("• git restore -p yordamida diffni bo'lakma-bo'lak ko'rish mumkin.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Keraksiz debug qatorlarni tashlab, foydali kodni saqlab qolasiz.", 1030, 735, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• O'chirilgan fayllarni tiklashda esa '*.py' qo'shtirnoqda beriladi.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: checkout va restore Farqi (SPLIT SCREEN)
  // ==========================================
  function sceneEskiYol(u, bounds, o = {}) {
    chip(5, "Eski Usul: checkout va restore Farqi", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda checkout xavfi va zamonaviy restore
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/hisob-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: branch va fayl nomi to'qnashuvi (u: 0.8 to 3.0, Enter 3.2)
      drawCommandLine("loyiha $ ", "git branch hisob.py && echo \"x\" >> hisob.py", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("# Fayl nomi bilan bir xil yangi branch yaratildi", 3.5, tu, 130, 230, { color: '#64748b' });

      // 2-buyruq: eski checkout xavfi (u: 4.5 to 6.0, Enter 6.2)
      drawCommandLine("loyiha $ ", "git checkout hisob.py  # faylni tiklamoqchisiz", 4.5, 6.0, 6.2, tu, 130, 264);
      drawOutputLine("Switched to branch 'hisob.py'  # XAVF: branch almashib ketdi!", 6.6, tu, 130, 288, { color: C.red, weight: 700 });
      drawOutputLine("M\thisob.py  # fayldagi o'zgarish esa aslo tiklanmadi!", 7.0, tu, 130, 312, { color: C.yellow, weight: 600 });

      // 3-buyruq: zamonaviy restore xavfsizligi (u: 8.2 to 10.4, Enter 10.6)
      drawCommandLine("loyiha $ ", "git switch main && git restore hisob.py", 8.2, 10.4, 10.6, tu, 130, 346);
      drawOutputLine("Switched to branch 'main'", 10.9, tu, 130, 370, { color: C.cyan });
      drawOutputLine("# hisob.py xavfsiz tiklandi (branch chalkashligi yo'q!)", 11.3, tu, 130, 394, { color: C.green, weight: 700 });

      // 4-buyruq: no-overlay taqqoslashi (u: 12.5 to 14.5, Enter 14.7)
      drawCommandLine("loyiha $ ", "git restore --source=HEAD~1 -SW .", 12.5, 14.5, 14.7, tu, 130, 430);
      drawOutputLine("# Papka HEAD~1 ga 100% ANIQ moslandi (no-overlay)", 15.0, tu, 130, 454, { color: C.cyan, weight: 600 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 15.5, tu, 130, 490, { color: '#334155' });
      drawOutputLine("Yechim: Git 2.23+ dan boshlab vazifalar ajratildi:", 16.0, tu, 130, 520, { color: C.yellow, weight: 600 });
      drawOutputLine("git restore -> faqat fayllarni tiklaydi.", 16.4, tu, 130, 545, { color: C.green, weight: 700 });
      drawOutputLine("git switch  -> faqat tarmoqlarni (branch) almashtiradi.", 16.8, tu, 130, 570, { color: C.cyan, weight: 700 });

      // O'ng panel: Zamonaviy Git taqsimoti
      panel(980, 140, 840, 680, C.green, "Zamonaviy Git: Aniq Ajratish", "Git 2.23+ va Git 2.51+ standarti", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,255,255,0.025)', col: C.yellow });
        pill("Eski Buyruqlar Chalkashligi", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• git checkout -- <fayl>   ->  git restore <fayl>", 1030, 335, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• git reset HEAD <fayl>     ->  git restore --staged <fayl>", 1030, 370, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• checkout ham branch almashar, ham fayl tiklardi (juda xavfli).", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 6.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Vazifalar To'liq Ajratildi", 1140, 470, C.green, { size: 16, mono: false });
        text("• git restore: Faqat fayllarni tiklaydi, branchga tegmaydi.", 1030, 515, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• git switch: Faqat branchlarni almashtiradi, faylni o'chirmaydi.", 1030, 550, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• Git 2.51 rasmiy reliziga ko'ra restore to'liq barqaror va standart!", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("No-Overlay Afzalligi", 1120, 655, C.cyan, { size: 16, mono: false });
        text("• checkout papkani tiklaganda, manbada yo'q fayllarni qoldirardi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• git restore --source esa papkani o'sha commitga ANIQ moslaydi.", 1030, 735, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• Manbada bo'lmagan fayllar toza o'chiriladi (no-overlay).", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xavflar Xaritasi va Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xavflar Xaritasi va Xulosa", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // 3 ta parallel ustun (har biri w=540, h=520, y=140)
      // 1-ustun: restore --staged
      panel(100, 140, 540, 520, C.green, "1 · restore --staged", "index uchun (100% xavfsiz)", kBox, kBox);
      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(120, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.green });
        pill("100% Xavfsiz Buyruq", 230, 290, C.green, { size: 15, mono: false });
        text("• Faqat index o'zgaradi", 140, 340, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Fayl stagingdan chiqariladi.", 140, 370, { size: 15, color: C.text, align: 'left' });
        text("• Diskka aslo tegmaydi", 140, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Barcha yozilgan kod butun qoladi.", 140, 440, { size: 15, color: C.text, align: 'left' });
        text("• Qaytarish imkoni", 140, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Istalgan paytda qayta 'git add'.", 140, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 140, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Hech narsa yo'qolmaydi!", 140, 580, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      // 2-ustun: commit --amend
      panel(690, 140, 540, 520, C.yellow, "2 · commit --amend", "oxirgi commit uchun", kBox, kBox);
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(710, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Lokalda Juda Qulay", 800, 290, C.yellow, { size: 15, mono: false });
        text("• Commitni almashtiradi", 730, 340, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Yangi kommit obyekti yaratiladi.", 730, 370, { size: 15, color: C.text, align: 'left' });
        text("• Reflog eslab qoladi", 730, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Tiklash: git reset --soft HEAD@{1}", 730, 440, { size: 15, fam: MONO, color: C.text, align: 'left' });
        text("• Asosiy Cheklov", 730, 480, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Push qilingan bo'lsa amend qilmang!", 730, 510, { size: 15, color: C.red, align: 'left' });
        text("• Xulosa", 730, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Faqat shaxsiy lokal branchda qo'llang.", 730, 580, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 3-ustun: restore <fayl>
      panel(1280, 140, 540, 520, C.red, "3 · restore <fayl>", "working tree uchun (xavfli)", kBox, kBox);
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1300, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.red });
        pill("Ehtiyotkorlik Talab Etadi", 1400, 290, C.red, { size: 15, mono: false });
        text("• O'zgarishlar o'chadi", 1320, 340, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Diskdagi kod index holatiga qaytadi.", 1320, 370, { size: 15, color: C.text, align: 'left' });
        text("• Qaytarib bo'lmaydi", 1320, 410, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Commit qilinmagan narsa yo'qoladi.", 1320, 440, { size: 15, color: C.text, align: 'left' });
        text("• Xavfsiz Muqobil", 1320, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Shubhada: git stash bilan saqlang.", 1320, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 1320, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Faqat 100% ishonch bilan ishlating!", 1320, 580, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.5, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Teglar va Aliaslar", 280, 725, C.git, { size: 16, mono: false });
        text("Keyingi 12-bobda: Muhim nuqtalar — 'git tag' va klaviatura unumdorligi uchun 'alias'lar!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Reliz teglari, annotatsiyali imzolar va eng kerakli Git aliaslarini sozlashni batafsil o'rganamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Gitda har bir bekor qilish buyrug'ining chegarasini bilish — xavfsiz va ishonchli dasturchilik kalitidir.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'amend', fn: sceneAmend },
      { id: 'unstage', fn: sceneUnstage },
      { id: 'restore_worktree', fn: sceneRestoreWorktree },
      { id: 'eski_yol', fn: sceneEskiYol },
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