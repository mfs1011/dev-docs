// Git 25-bob videosi: "Tarixni qayta yozish"
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
  // 1-SAHNA: Tarixni Qayta Yozish: git rebase -i
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Tarixni Qayta Yozish: git rebase -i", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git log va kamchiliklar',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log --oneline -5
      drawCommandLine("ombor $ ", "git log --oneline -5", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("0634382 vaqtincha debug       # tarixda qolmasligi kerak", 2.2, tu, 130, 230, { color: C.red });
      drawOutputLine("dcc99d0 login va logout       # bitta commitda 2 xil vazifa", 2.4, tu, 130, 252, { color: C.yellow });
      drawOutputLine("83aea89 foydalanuvchi tset    # xabarda imlo xatosi bor!", 2.6, tu, 130, 274, { color: C.git, weight: 700 });
      drawOutputLine("d3c8ce7 foydalanuvchi modeli", 2.8, tu, 130, 296, { color: C.cyan });
      drawOutputLine("0a0ab06 loyiha boshlandi", 3.0, tu, 130, 318, { color: C.text });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kCallout, () => {
        card(125, 365, 790, 285, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Qarorni Eng Oxirgi Lahzada Qabul Qilish", 290, 400, C.yellow, { size: 16, mono: false });
        text("• Git'ning eng buyuk fazilati — tarixni tartibga solish erkinligi.", 150, 445, { size: 16, color: C.text, align: 'left' });
        text("• Dasturlash jarayonida xatoliklar, xom commitlar va testlar bo'lishi tabiiy.", 150, 480, { size: 16, color: C.text, align: 'left' });
        text("• Interaktiv rebase (-i) ularni serverga yuborishdan oldin tozalab,", 150, 515, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  professional va chiroyli holatga keltirish imkonini beradi.", 150, 545, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• reword, edit, squash, fixup, drop — sizning asosiy qurollaringizdir!", 150, 585, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Tarixni Tahrirlash Qurollari", "git rebase -i imkoniyatlari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Interaktiv Rebase Nima?", 1150, 290, C.yellow, { size: 16, mono: false });
        text("• Commitlarni o'sha eski asosning o'zi ustiga qayta quramiz.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Lekin jarayon oldidan Git bizga har bir qadam ro'yxatini beradi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Qaysi commitni o'zgartirishni o'zimiz belgilaymiz.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Asosiy Operatsiyalar", 1120, 490, C.green, { size: 16, mono: false });
        text("• reword — xabarni to'g'rilash.", 1030, 535, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• edit — commit ichiga yangi fayl qo'shish yoki bo'lish.", 1030, 565, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• squash / fixup — commitlarni birlashtirish.", 1030, 595, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• drop — keraksiz commitni tarixdan o'chirish.", 1030, 625, { size: 16, fam: MONO, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Faqat shaxsiy lokal branchlar uchun! Ommaviy tarixga tegilmaydi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Todo Ro‘yxati va reword Buyrug‘i
  // ==========================================
  function sceneTodoReword(u, bounds, o = {}) {
    chip(2, "Todo Ro‘yxati va reword Buyrug‘i", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git rebase -i HEAD~3 (todo fayli)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rebase -i HEAD~3
      drawCommandLine("ombor $ ", "git rebase -i HEAD~3", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("# git-rebase-todo fayli muharrirda ochildi:", 2.4, tu, 130, 230, { color: C.mute });
      drawOutputLine("reword 83aea89 foydalanuvchi uchun tset  # pick -> reword!", 2.7, tu, 130, 255, { color: C.yellow, weight: 700 });
      drawOutputLine("pick   dcc99d0 login va logout", 2.9, tu, 130, 277, { color: C.text });
      drawOutputLine("pick   0634382 vaqtincha debug", 3.1, tu, 130, 299, { color: C.text });

      // 2-bosqich: muharrirda xabar tuzatildi
      drawCommandLine("ombor $ ", "# xabar ochildi: 'tset' -> 'test' deb saqladik", 5.0, 7.0, 7.2, tu, 130, 335, { promptCol: C.cyan });
      drawOutputLine("[detached HEAD 4a8c03d] foydalanuvchi uchun test", 7.5, tu, 130, 360, { color: C.green, weight: 600 });
      drawOutputLine("Successfully rebased and updated refs/heads/main.", 7.8, tu, 130, 382, { color: C.green, weight: 700 });

      // 3-buyruq: git log --oneline -3
      drawCommandLine("ombor $ ", "git log --oneline -3", 9.5, 10.8, 11.0, tu, 130, 420);
      drawOutputLine("061528b vaqtincha debug", 11.2, tu, 130, 445, { color: C.text });
      drawOutputLine("7e20af0 login va logout", 11.4, tu, 130, 467, { color: C.text });
      drawOutputLine("4a8c03d foydalanuvchi uchun test  # to'g'rilandi!", 11.6, tu, 130, 489, { color: C.green, weight: 700 });

      const kDetail = P(u, 13.0, 0.5);
      withA(kDetail, () => {
        card(125, 525, 790, 135, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Tartib Teskari: Eng Eskisi Yuqorida!", 260, 560, C.cyan, { size: 16, mono: false });
        text("• git log'da eng yangi commit tepada bo'lsa, todo'da eng eskisi tepada.", 145, 600, { size: 15, color: C.text, align: 'left' });
        text("• Chunki Git buyruqlarni yuqoridan pastga qarab ketma-ket bajaradi.", 145, 630, { size: 15, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "reword Mexanizmi", "xabarni tuzatish va heshlar zanjiri", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("reword Qanday Ishlaydi?", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• Commitdagi fayllarga tegilmaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git shu commitga yetganda to'xtab, COMMIT_EDITMSG faylini ochadi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Imlo xatosini tuzatib saqlasangiz, yangi xabar bilan commit qilinadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega 3 Ta Hesh Yangilandi?", 1150, 490, C.green, { size: 16, mono: false });
        text("• Faqat birinchi commit xabari o'zgardi, lekin keyingi ikkitasi ham o'zgardi!", 1030, 535, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Chunki ularning ota-bobosi (parent) o'zgargani uchun yangi SHA-1 oldi.", 1030, 570, { size: 16, color: C.text, align: 'left' });
        text("• Tarix o'zgarmas bloklardan iborat — zanjir to'liq yangilanadi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("HEAD~3 berilganda oxirgi 3 ta commit tahrirlanadi, 4-commit o'zgarmas asos bo'ladi.", 1030, 715, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: edit: Commitni Bo‘lish va Tuzatish
  // ==========================================
  function sceneEditSplit(u, bounds, o = {}) {
    chip(3, "edit: Commitni Bo‘lish va Tuzatish", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — edit va commitni ikkiga bo‘lish',
        p: kBox
      });

      const tu = u;

      // 1-bosqich: edit buyrug'ida to'xtash
      drawCommandLine("ombor $ ", "git rebase -i HEAD~3  # edit dcc99d0", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("Stopped at dcc99d0... login va logout", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("You can amend the commit now, with: git commit --amend", 2.6, tu, 130, 252, { color: C.mute });

      // 2-bosqich: git reset HEAD~ orqali ochib yuborish
      drawCommandLine("ombor $ ", "git reset HEAD~  # commitni ochib yuborish", 4.0, 5.5, 5.7, tu, 130, 285);
      drawCommandLine("ombor $ ", "git add login.js && git commit -m \"Login tizimi\"", 6.2, 7.8, 8.0, tu, 130, 315);
      drawOutputLine("[detached HEAD 5b9c1a0] Login tizimi", 8.2, tu, 130, 340, { color: C.green, weight: 600 });

      // 3-bosqich: ikkinchi commit va davom ettirish
      drawCommandLine("ombor $ ", "git add logout.js && git commit -m \"Logout tizimi\"", 9.0, 10.8, 11.0, tu, 130, 375);
      drawOutputLine("[detached HEAD 9e8f4a1] Logout tizimi", 11.2, tu, 130, 400, { color: C.green, weight: 600 });
      drawCommandLine("ombor $ ", "git rebase --continue", 11.8, 13.0, 13.2, tu, 130, 430);
      drawOutputLine("Successfully rebased and updated refs/heads/main.", 13.4, tu, 130, 455, { color: C.green, weight: 700 });

      const kDetail = P(u, 14.0, 0.5);
      withA(kDetail, () => {
        card(125, 490, 790, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bitta Commitni Bo'lish Texnikasi", 250, 525, C.green, { size: 16, mono: false });
        text("• 1. Todo ro'yxatida bo'linishi kerak bo'lgan commit oldiga edit yozing.", 145, 565, { size: 15, color: C.text, align: 'left' });
        text("• 2. Git to'xtaganda, git reset HEAD~ qilib commitni stagingga qaytaring.", 145, 595, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• 3. Fayllarni alohida-alohida add qilib, bir nechta toza commit yasang!", 145, 625, { size: 15, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "edit Imkoniyatlari", "amend va commit bo'lish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Fayl Qo'shish: git commit --amend", 1210, 290, C.green, { size: 16, mono: false });
        text("• Eskiroq commitda biror faylni qo'shishni unutib qoldirdingizmi?", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• edit bilan o'sha nuqtada to'xtang, yangi faylni qo'shing va amend qiling.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• So'ng git rebase --continue bilan davom eting.", 1030, 405, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Atomik Commitlar Qoidasi", 1150, 490, C.yellow, { size: 16, mono: false });
        text("• Har bir commit faqat bitta mantiqiy vazifani bajarishi shart.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Login va logout birga bo'lsa, xatolik chiqqanda orqaga qaytarish qiyin.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• edit vositasida ularni ikkita mustaqil commitga ajratamiz.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("git rebase --continue buyrug'i keyingi todo qadamlariga yo'l ochadi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: squash va fixup: Birlashtirish
  // ==========================================
  function sceneSquashFixup(u, bounds, o = {}) {
    chip(4, "squash va fixup: Birlashtirish", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — squash va fixup bilan birlashtirish',
        p: kBox
      });

      const tu = u;

      // 1-bosqich: todo fayli
      drawCommandLine("ombor $ ", "git rebase -i HEAD~3", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("pick   7d92065 Asosiy login tizimi", 2.4, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("squash c5e91a0 Kichik tuzatish (login)  # xabarni qo'shadi", 2.6, tu, 130, 252, { color: C.yellow, weight: 600 });
      drawOutputLine("fixup  f1a04b2 Styling tuzatish         # xabarni tashlaydi!", 2.8, tu, 130, 274, { color: C.cyan, weight: 700 });

      // 2-bosqich: natija
      drawCommandLine("ombor $ ", "# muharrirda birlashgan commit xabari tasdiqlandi", 4.2, 6.2, 6.4, tu, 130, 310, { promptCol: C.cyan });
      drawOutputLine("[detached HEAD 9f3e1a0] Asosiy login tizimi", 6.6, tu, 130, 335, { color: C.green, weight: 700 });
      drawOutputLine(" 3 files changed, 45 insertions(+)", 6.9, tu, 130, 357, { color: C.mute });

      // 3-buyruq: git log --oneline -1
      drawCommandLine("ombor $ ", "git log --oneline -1", 8.2, 9.4, 9.6, tu, 130, 395);
      drawOutputLine("9f3e1a0 Asosiy login tizimi  # 3 ta commit bittaga aylandi!", 9.8, tu, 130, 420, { color: C.green, weight: 700 });

      const kDetail = P(u, 11.0, 0.5);
      withA(kDetail, () => {
        card(125, 460, 790, 200, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill("squash vs fixup Farqi", 210, 495, C.git, { size: 16, mono: false });
        text("• squash: ikkala commitning xabarini bitta xabarga birlashtiradi.", 145, 540, { size: 15, color: C.yellow, weight: 600, align: 'left' });
        text("• fixup: ikkinchi commit xabarini butunlay tashlab yuboradi,", 145, 575, { size: 15, color: C.cyan, weight: 600, align: 'left' });
        text("  faqat uning kod o'zgarishlarini birinchi commitga jimgina qo'shadi.", 145, 605, { size: 15, color: C.text, align: 'left' });
        text("• git commit --fixup <hesh> bilan avtomatik rebase qilish juda qulay!", 145, 635, { size: 15, fam: MONO, color: C.green, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.git, "Commitlarni Birlashtirish", "mayda chala ishlarni yagona commitga yig'ish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Nega Birlashtirish Kerak?", 1150, 290, C.yellow, { size: 16, mono: false });
        text("• Ish jarayonida 'wip', 'fix typo', 'test' kabi oraliq commitlar ko'payadi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Ular asosiy tarixda saqlanib qolsa, loyiha jurnali ifloslanadi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Birlashtirish orqali butun bir vazifani bitta toza commit qilib berasiz.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("fixup — Eng Ko'p Ishlatiladigan Usul", 1210, 490, C.green, { size: 16, mono: false });
        text("• Agar tuzatish commitining o'z nomi muhim bo'lmasa.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• fixup xabarlar muharririni ham ochmaydi — darhol birlashtiradi.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Vaqtni tejaydi va faqat asosiy commit sarlavhasi qoladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Birlashtirish jarayonida ham barcha fayl o'zgarishlari to'liq saqlanadi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: drop va Tartibni O‘zgartirish
  // ==========================================
  function sceneDropReorder(u, bounds, o = {}) {
    chip(5, "drop va Tartibni O‘zgartirish", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — drop va qatorlarni almashtirish',
        p: kBox
      });

      const tu = u;

      // 1-bosqich: todo faylida drop
      drawCommandLine("ombor $ ", "git rebase -i HEAD~3", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("pick 5b9c1a0 Login tizimi", 2.4, tu, 130, 230, { color: C.text });
      drawOutputLine("pick 9e8f4a1 Logout tizimi", 2.6, tu, 130, 252, { color: C.text });
      drawOutputLine("drop 0634382 vaqtincha debug  # butunlay o'chiramiz!", 2.9, tu, 130, 274, { color: C.red, weight: 700 });

      // 2-bosqich: natija
      drawCommandLine("ombor $ ", "git log --oneline -3", 4.5, 5.8, 6.0, tu, 130, 310);
      drawOutputLine("9e8f4a1 Logout tizimi", 6.2, tu, 130, 335, { color: C.green, weight: 600 });
      drawOutputLine("5b9c1a0 Login tizimi", 6.4, tu, 130, 357, { color: C.green, weight: 600 });
      drawOutputLine("4a8c03d foydalanuvchi uchun test", 6.6, tu, 130, 379, { color: C.text });
      drawOutputLine("  # 'vaqtincha debug' commiti tarixdan butunlay yo'qoldi!", 6.9, tu, 130, 401, { color: C.yellow, weight: 600 });

      const kDetail = P(u, 8.5, 0.5);
      withA(kDetail, () => {
        card(125, 435, 790, 225, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Qatorlar Tartibini Almashtirish", 240, 470, C.red, { size: 16, mono: false });
        text("• Todo ro'yxatidagi qatorlar o'rnini almashtirsangiz:", 145, 510, { size: 16, color: C.text, align: 'left' });
        text("  Git commitlarni aynan siz ko'rsatgan yangi ketma-ketlikda qayta qo'llaydi.", 145, 545, { size: 15, color: C.yellow, align: 'left' });
        text("• drop o'rniga qatorni ro'yxatdan shunchaki o'chirib tashlash ham mumkin.", 145, 580, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• Agar butun faylni bo'sh qilib saqlasangiz, rebase butunlay bekor qilinadi.", 145, 615, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Tarixni Saralash va Tozalash", "drop va qatorlar siljishi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("drop Buyrug'i", 1080, 290, C.red, { size: 16, mono: false });
        text("• Sinov kodlari, console.log lar yoki adashib qilingan commitlar.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• drop qilish bilan Git bu commitdagi o'zgarishlarni yangi tarixga kiritmaydi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• U ombordan butunlay chetlatiladi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Tartibni O'zgartirish", 1120, 490, C.green, { size: 16, mono: false });
        text("• Masalan: avval testlar, keyin funksiya kodi borishi kerak bo'lsa.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Qatorlarni yuqoriga yoki pastga ko'chirib, tarixiy tartibni o'zgartirasiz.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Ehtiyotkorlik: bir-biriga bog'liq o'zgarishlarda konflikt chiqishi mumkin.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Adashib ketsangiz: git rebase --abort bilan xotirjam to'xtating.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: exec va Lokal Gigiyena
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: exec va Lokal Gigiyena", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda exec
      terminal(100, 140, 840, 520, {
        title: 'zsh — exec parametri bilan testlarni tekshirish',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git rebase -i --exec \"npm test\" HEAD~3", 0.6, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Executing: npm test", 2.9, tu, 130, 230, { color: C.cyan });
      drawOutputLine("✓ All 14 tests passing", 3.2, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine("Executing: npm test", 3.5, tu, 130, 274, { color: C.cyan });
      drawOutputLine("✓ All 14 tests passing", 3.8, tu, 130, 296, { color: C.green, weight: 700 });
      drawOutputLine("Successfully rebased and updated refs/heads/main.", 4.1, tu, 130, 318, { color: C.green, weight: 700 });

      const kDetail = P(u, 6.0, 0.5);
      withA(kDetail, () => {
        card(125, 360, 790, 280, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Tarix Gigiyenasi Qoidalari", 240, 395, C.blue, { size: 16, mono: false });
        text("• 1. Shaxsiy branchda erkin ishlang, ammo PR ochishdan oldin tozalang.", 150, 440, { size: 15, color: C.text, align: 'left' });
        text("• 2. reword bilan tushunarli, aniq commit xabarlari qoldiring.", 150, 475, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• 3. fixup bilan chala va mayda commitslarni bitta yaxlit commitga yig'ing.", 150, 510, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• 4. exec 'npm test' orqali har bir commit ishlayotganiga ishonch hosil qiling.", 150, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• 5. Ommaviy (push qilingan) tarixni hech qachon qayta yozmang!", 150, 585, { size: 15, color: C.red, weight: 700, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Interaktiv Rebase Xulosasi", "mukammal commitlar tarixi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · O'z Ishingizdan Faxrlaning", 1150, 275, C.green, { size: 16, mono: false });
        text("• Siz yaratgan Git tarixi — dasturchilik mahoratingiz yuzidir.", 1030, 320, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Toza, tushunarli va tartibli commitlar kod sharhini (code review) osonlashtiradi.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• Jamoangiz sizga minnatdor bo'ladi.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Kuchli Ammo Xavfsiz Qurol", 1170, 480, C.yellow, { size: 16, mono: false });
        text("• git reflog yordamida har qanday o'zgarishni tiklash mumkin.", 1030, 525, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Shu sababli lokal interaktiv rebasedan cho'chishga aslo hojat yo'q.", 1030, 560, { size: 16, color: C.text, align: 'left' });
        text("• Erkin tajriba qiling va tarixingizni sayqallang!", 1030, 595, { size: 15, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.0, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 26-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Murakkab merge! Octopus merge, revert qilingan mergelar va Git'ning chuqur birlashtirish strategiyalari!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'todo_va_reword', fn: sceneTodoReword },
      { id: 'edit_va_bolish', fn: sceneEditSplit },
      { id: 'squash_va_fixup', fn: sceneSquashFixup },
      { id: 'drop_va_tartib', fn: sceneDropReorder },
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
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
