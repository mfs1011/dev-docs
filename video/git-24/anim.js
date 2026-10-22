// Git 24-bob videosi: "Rebase"
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
  // 1-SAHNA: Rebase Tushunchasi: Transplantatsiya
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Rebase Tushunchasi: Transplantatsiya", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git rebase amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch feature
      drawCommandLine("ombor $ ", "git switch feature", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Switched to branch 'feature'", 2.2, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: git rebase main
      drawCommandLine("ombor $ ", "git rebase main", 3.8, 5.0, 5.2, tu, 130, 265);
      drawOutputLine("Successfully rebased and updated refs/heads/feature.", 5.6, tu, 130, 290, { color: C.yellow, weight: 700 });
      drawOutputLine("  # feature commitlari main uchi ustiga qaytadan terildi!", 5.9, tu, 130, 312, { color: C.mute });

      // 3-buyruq: git log --oneline --graph
      drawCommandLine("ombor $ ", "git log --oneline --graph", 7.5, 8.8, 9.0, tu, 130, 345);
      drawOutputLine("* 8dbb596 (HEAD -> feature) logout funksiyasi", 9.2, tu, 130, 370, { color: C.cyan, weight: 700 });
      drawOutputLine("* a8ddf1a login funksiyasi", 9.4, tu, 130, 392, { color: C.cyan, weight: 600 });
      drawOutputLine("* dd6d855 (main) litsenziya qo'shildi", 9.6, tu, 130, 414, { color: C.green, weight: 700 });
      drawOutputLine("* 86558c2 README qo'shildi", 9.8, tu, 130, 436, { color: C.text });
      drawOutputLine("  # tarmoqlanish yo'qoldi, tarix to'g'ri chiziqqa aylandi", 10.1, tu, 130, 458, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 485, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Transplantatsiya (Payvandlash)", 270, 520, C.yellow, { size: 16, mono: false });
        text("• Bog'bon novdani bir daraxtdan kesib, boshqasiga payvand qilgani kabi.", 150, 560, { size: 16, color: C.text, align: 'left' });
        text("• Rebase — commitlarni boshqa asos (base) uchi ustiga qayta qo'llashdir.", 150, 595, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Natijada go'yo ishni main yangilangandan keyin boshlagandek ko'rinadi.", 150, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Rebase Asosiy Mohiyati", "tarmoqlanishdan to'g'ri chiziqqa", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tarix Qiyofasi", 1100, 290, C.yellow, { size: 16, mono: false });
        text("Oldin:  A --- D (main)", 1030, 335, { size: 16, fam: MONO, color: '#94a3b8', align: 'left' });
        text("         \\", 1030, 360, { size: 16, fam: MONO, color: '#94a3b8', align: 'left' });
        text("          B --- C (feature)", 1030, 385, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("Keyin:  A --- D (main) --- B' --- C' (feature)", 1030, 420, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Merge vs Rebase", 1100, 490, C.green, { size: 16, mono: false });
        text("• Merge: ikkita ota (parent) orqali yangi merge commit yaratadi.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Rebase: bitta chiziq hosil qiladi, merge commit paydo bo'lmaydi.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• O'zgarishlar yangi commitlar sifatida noldan qayta teriladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Rebase commitni ko'chirmaydi — yangisini yasaydi, eskisi joyida qoladi!", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Hashlar O‘zgarishi va Commit Ichida
  // ==========================================
  function sceneHashesInside(u, bounds, o = {}) {
    chip(2, "Hashlar O‘zgarishi va Commit Ichida", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git cat-file va hesh tahlili',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse feature~1 ORIG_HEAD~1
      drawCommandLine("ombor $ ", "git rev-parse feature~1 ORIG_HEAD~1", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("a8ddf1aaf1...  # yangi login commit heshi", 2.4, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("7d920653f6...  # eski login commit heshi (ORIG_HEAD)", 2.6, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git cat-file -p a8ddf1a
      drawCommandLine("ombor $ ", "git cat-file -p a8ddf1a", 4.0, 5.4, 5.6, tu, 130, 285);
      drawOutputLine("tree adb6046c4c68d80a099e4f38480e2e72047d3f7a", 5.8, tu, 130, 310, { color: C.cyan });
      drawOutputLine("parent dd6d8558ddd895f0094bc3f57ed3dba8452922c3", 6.1, tu, 130, 332, { color: C.yellow, weight: 700 });
      drawOutputLine("author Ali Valiyev <ali@example.com> 1791349800 +0500", 6.4, tu, 130, 355, { color: C.green });
      drawOutputLine("committer Ali Valiyev <ali@example.com> 1791352800 +0500", 6.7, tu, 130, 377, { color: C.git, weight: 600 });
      drawOutputLine("", 7.0, tu, 130, 390);
      drawOutputLine("login funksiyasi", 7.2, tu, 130, 405, { color: C.text, weight: 600 });

      const kDetail = P(u, 9.0, 0.5);
      withA(kDetail, () => {
        card(125, 445, 790, 215, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Obyekt Ichidagi O'zgarishlar", 240, 480, C.cyan, { size: 16, mono: false });
        text("• parent: 86558c2 (README) edi, endi dd6d855 (litsenziya) bo'ldi.", 145, 525, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• author: o'zgarmadi (10:10) — kodni asl yozgan muallif saqlanadi.", 145, 555, { size: 15, color: C.green, align: 'left' });
        text("• committer: yangilandi (11:00) — yangi commit obyektini yasagan vaqt.", 145, 585, { size: 15, color: C.git, align: 'left' });
        text("• Parent o'zgargani uchun commit matnining SHA-1 heshi ham yangilandi!", 145, 620, { size: 15, color: C.text, weight: 600, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Nega Hesh O'zgaradi?", "kriptografik yaxlitlik va commit tabiati", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Git Obyektlari O'zgarmasdir (Immutable)", 1230, 290, C.yellow, { size: 16, mono: false });
        text("• Git'da mavjud commitni joyida tahrirlash mumkin emas.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Otasi boshqa bo'ldimi — demak u mutlaqo yangi commit obyekti!", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Shuning uchun rebase butun zanjirni boshidan qayta quradi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Author Date vs Committer Date", 1180, 490, C.green, { size: 16, mono: false });
        text("• Author (Muallif): kodni dastlab yozgan shaxs va o'sha paytdagi sana.", 1030, 535, { size: 16, color: C.green, align: 'left' });
        text("• Committer: rebase yoki patch qilgan odam va ayni qayta yozilgan soat.", 1030, 570, { size: 16, color: C.text, align: 'left' });
        text("• Git ikkala vaqtni ham alohida saqlab qoladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text(".git/ORIG_HEAD fayli rebasedan oldingi eski uchni eslab turadi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Toza Tarix va Fast-Forward Merge
  // ==========================================
  function sceneCleanHistory(u, bounds, o = {}) {
    chip(3, "Toza Tarix va Fast-Forward Merge", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge --ff-only feature',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch main
      drawCommandLine("ombor $ ", "git switch main", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Switched to branch 'main'", 2.2, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: git merge --ff-only feature
      drawCommandLine("ombor $ ", "git merge --ff-only feature", 3.8, 5.2, 5.4, tu, 130, 265);
      drawOutputLine("Updating dd6d855..8dbb596", 5.6, tu, 130, 290, { color: C.yellow, weight: 600 });
      drawOutputLine("Fast-forward", 5.8, tu, 130, 312, { color: C.green, weight: 700 });
      drawOutputLine(" login.js  | 1 +", 6.0, tu, 130, 334, { color: C.text });
      drawOutputLine(" logout.js | 1 +", 6.2, tu, 130, 356, { color: C.text });
      drawOutputLine(" 2 files changed, 2 insertions(+)", 6.4, tu, 130, 378, { color: C.mute });

      // 3-buyruq: git log --oneline --graph
      drawCommandLine("ombor $ ", "git log --oneline --graph", 7.8, 9.0, 9.2, tu, 130, 415);
      drawOutputLine("* 8dbb596 (HEAD -> main, feature) logout funksiyasi", 9.4, tu, 130, 440, { color: C.green, weight: 700 });
      drawOutputLine("* a8ddf1a login funksiyasi", 9.6, tu, 130, 462, { color: C.green });
      drawOutputLine("* dd6d855 litsenziya qo'shildi", 9.8, tu, 130, 484, { color: C.text });
      drawOutputLine("* 86558c2 README qo'shildi", 10.0, tu, 130, 506, { color: C.text });

      const kDetail = P(u, 11.5, 0.5);
      withA(kDetail, () => {
        card(125, 535, 790, 125, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Hech Qanday Merge Commitsiz!", 250, 570, C.green, { size: 16, mono: false });
        text("• Tarix chiroyli, chiziqli va ketma-ketlikda saqlanadi.", 145, 610, { size: 16, color: C.green, weight: 600, align: 'left' });
        text("• Ortiqcha shoxlanishlar yo'qoladi, loyiha evolyutsiyasini o'qish osonlashadi.", 145, 638, { size: 15, color: C.text, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Chiziqli Tarix Afzalligi", "rebase va fast-forward kombinatsiyasi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Toza Git Tarixi", 1080, 290, C.green, { size: 16, mono: false });
        text("• Git log ko'rganda murakkab merge tugunlari ko'rinmaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir commit o'zidan oldingisining ustiga toza qo'yilgan.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git bisect bilan xatoliklarni qidirish ancha yengillashadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Pull Request'dan Oldin Rebase", 1170, 490, C.yellow, { size: 16, mono: false });
        text("• O'z branchingizni asosiy main ustiga rebase qilib oling.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Konfliktlarni o'z kompyuteringizda hal qilib, keyin PR yuboring.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bu loyiha yetakchisi uchun merge qilishni o'ta osonlashtiradi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Fast-forward merge faqat ko'rsatkichni suradi, yangi obyekt yaratmaydi.", 1030, 715, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Rebase Konflikti: --continue va --abort
  // ==========================================
  function sceneConflictContinue(u, bounds, o = {}) {
    chip(4, "Rebase Konflikti: --continue va --abort", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — rebase paytida to‘qnashuv va davom etish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rebase main (konflikt)
      drawCommandLine("ombor $ ", "git rebase main", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Auto-merging server.js", 2.2, tu, 130, 230, { color: C.yellow });
      drawOutputLine("CONFLICT (content): Merge conflict in server.js", 2.4, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("error: could not apply a8ddf1a... login funksiyasi", 2.7, tu, 130, 274, { color: '#f87171' });

      // 2-buyruq: git add server.js
      drawCommandLine("ombor $ ", "git add server.js", 4.2, 5.4, 5.6, tu, 130, 310);
      drawOutputLine("  # fayl to'g'rilandi va indeksga qo'shildi (commit QILMANG!)", 5.8, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git rebase --continue
      drawCommandLine("ombor $ ", "git rebase --continue", 7.0, 8.4, 8.6, tu, 130, 365);
      drawOutputLine("Applying: login funksiyasi", 8.8, tu, 130, 390, { color: C.cyan });
      drawOutputLine("Applying: logout funksiyasi", 9.1, tu, 130, 412, { color: C.cyan });
      drawOutputLine("Successfully rebased and updated refs/heads/feature.", 9.5, tu, 130, 435, { color: C.green, weight: 700 });

      // 4-buyruq: git rebase --abort (eslatma)
      drawCommandLine("ombor $ ", "git rebase --abort  # xavfsiz bekor qilish", 11.0, 12.5, 12.7, tu, 130, 470);
      drawOutputLine("  # ORIG_HEAD yordamida rebase boshlanishidan oldingi holatga qaytadi", 12.9, tu, 130, 495, { color: C.mute });

      const kDetail = P(u, 13.5, 0.5);
      withA(kDetail, () => {
        card(125, 525, 790, 135, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill("Muhim Qoida: git commit Qilmang!", 260, 560, C.git, { size: 16, mono: false });
        text("• Konfliktni tuzatgach git add qiling, so'ng git rebase --continue deng.", 145, 600, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Agar git commit qilsangiz, rebase zanjirining navbati buziladi!", 145, 630, { size: 15, color: C.red, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.git, "Rebase Nazorati", "--continue, --skip va --abort", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git rebase --continue", 1130, 290, C.green, { size: 16, mono: false });
        text("• Konflikt hal bo'lgach keyingi commitga o'tish buyrug'i.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git qolgan commitlarni navbati bilan yangi asosga qo'llaydi.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Har bir commit alohida sinovdan o'tadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("git rebase --abort", 1120, 490, C.red, { size: 16, mono: false });
        text("• Agar rebase paytida qiyin ahvolga tushib qolsangiz:", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• --abort jarayonni to'xtatib, barchasini rebasedan oldingi holatga qaytaradi.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Hech qanday ma'lumot yo'qolmaydi, xavfsizlik to'liq kafolatlangan.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("--skip esa muammoli commitni tashlab o'tib ketish uchun ishlatiladi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Rebasening Oltin Qoidasi
  // ==========================================
  function sceneGoldenRule(u, bounds, o = {}) {
    chip(5, "Rebasening Oltin Qoidasi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ommaviy branch va rebase xavfi',
        p: kBox
      });

      const tu = u;

      drawCommandLine("ombor $ ", "git push --force origin main  # ASLO QILMANG!", 0.6, 2.5, 2.7, tu, 130, 205, { cmdCol: '#f87171' });
      drawOutputLine("! [rejected] (non-fast-forward)", 3.0, tu, 130, 235, { color: C.red, weight: 700 });
      drawOutputLine("error: failed to push some refs to 'origin'", 3.3, tu, 130, 260, { color: '#f87171' });

      const kDetail = P(u, 5.0, 0.5);
      withA(kDetail, () => {
        card(125, 300, 790, 350, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("QAT'IY QOIDA: Ommaviy Tarixni Qayta Yozmang!", 340, 335, C.red, { size: 16, mono: false });
        text("• Serverga yuborilgan (push qilingan) va jamoangiz foydalanayotgan", 150, 385, { size: 16, color: C.text, align: 'left' });
        text("  ommaviy branchlarni (main, master, release) ASLO rebase qilmang!", 150, 420, { size: 16, color: C.red, weight: 700, align: 'left' });
        text("• Nega? Chunki rebase commit heshlarini butunlay o'zgartiradi.", 150, 465, { size: 16, color: C.yellow, align: 'left' });
        text("• Natijada boshqa dasturchilar pull qilganda bir xil ishlar", 150, 500, { size: 16, color: C.text, align: 'left' });
        text("  duplikat bo'lib ketadi va hal qilib bo'lmas to'qnashuvlar yuzaga keladi.", 150, 535, { size: 16, color: C.text, align: 'left' });
        text("• Oltin qoida: faqat o'zingizning shaxsiy lokal branchlaringizni rebase qiling!", 150, 580, { size: 16, color: C.green, weight: 700, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Oltin Qoida (The Golden Rule)", "ommaviy tarix daxlsizligi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Xavf Sababi", 1080, 290, C.red, { size: 16, mono: false });
        text("• Agar siz C commitini C' qilib o'zgartirsangiz va force push qilsangiz:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Hamkasbingizda hali ham eski C commitiga ulangan ishlar bo'ladi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Ular qayta merge qilinganda tarix buziladi va loyiha ifloslanadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Qachon Rebase Mumkin?", 1150, 490, C.green, { size: 16, mono: false });
        text("• Faqat o'z kompyuteringizdagi shaxsiy feature branchda.", 1030, 535, { size: 16, color: C.green, weight: 600, align: 'left' });
        text("• Hali hech kim bu branchni serverdan tortib olmagan bo'lsa.", 1030, 570, { size: 16, color: C.text, align: 'left' });
        text("• Asosiy branchga qo'shishdan oldin chiroyli tartibga solish uchun.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        text("Oltin qoidaga rioya qilish — jamoada tinchlik va tartib garovidir!", 1030, 715, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: Rebase vs Merge Tanlovi
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: Rebase vs Merge Tanlovi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda xulosa
      terminal(100, 140, 840, 520, {
        title: 'zsh — git log va toza tarix madaniyati',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git log --oneline --graph --all", 0.6, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("* 8dbb596 (HEAD -> main) logout funksiyasi", 2.9, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("* a8ddf1a login funksiyasi", 3.1, tu, 130, 252, { color: C.green });
      drawOutputLine("* dd6d855 litsenziya qo'shildi", 3.3, tu, 130, 274, { color: C.text });
      drawOutputLine("* 86558c2 README qo'shildi", 3.5, tu, 130, 296, { color: C.text });
      drawOutputLine("  # Toza, tekis va chiroyli chiziqli rivojlanish!", 3.8, tu, 130, 318, { color: C.yellow, weight: 600 });

      const kDetail = P(u, 5.5, 0.5);
      withA(kDetail, () => {
        card(125, 360, 790, 280, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Rebase vs Merge: Qachon Qaysi Biri?", 280, 395, C.blue, { size: 16, mono: false });
        text("• Rebase — 'tarixni chiroyli va ravshan hikoya qiluvchi kitob' deb qarash:", 145, 440, { size: 15, color: C.text, align: 'left' });
        text("  shaxsiy branchlarni tartibga solish, keraksiz merge commitlardan qutulish.", 145, 470, { size: 14, color: C.green, align: 'left' });
        text("• Merge — 'bo'lib o'tgan voqealarning asl xronologik arxivi' deb qarash:", 145, 515, { size: 15, color: C.text, align: 'left' });
        text("  jamoaviy tarmoqlar qachon va qanday qo'shilganini aniq saqlash.", 145, 545, { size: 14, color: C.yellow, align: 'left' });
        text("• Ikkala vosita ham o'z o'rnida kerak — ularni to'g'ri uyg'unlashtiring!", 145, 590, { size: 15, color: C.cyan, weight: 700, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Rebase Asosiy Xulosasi", "toza kod va professional ish uslubi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Shaxsiy Branchlarni Yangilab Boring", 1230, 275, C.green, { size: 16, mono: false });
        text("• main yangilansa, o'z branchingizda git rebase main qilib turing.", 1030, 320, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• Natijada loyihangiz doimo eng oxirgi kod ustida xavfsiz rivojlanadi.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• Birlashish paytida hech qanday kutilmagan to'siq chiqmaydi.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Jamoa Kelishuvi Asosiy Qoidadir", 1200, 480, C.yellow, { size: 16, mono: false });
        text("• Ba'zi jamoalar toza chiziqli tarixni (rebase) qat'iy talab qiladi.", 1030, 525, { size: 16, color: C.text, align: 'left' });
        text("• Boshqalar esa har bir qo'shilish merge commit bilan bo'lishini ma'qul ko'radi.", 1030, 560, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Git ikkala yo'nalish uchun ham eng yuqori darajada moslashuvchandir!", 1030, 595, { size: 15, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.0, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 25-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Tarixni qayta yozish! git commit --amend, interaktiv rebase (rebase -i) va commitlarni birlashtirish san'ati!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'hashlar_va_ichki_tuzilish', fn: sceneHashesInside },
      { id: 'toza_tarix_va_fast_forward', fn: sceneCleanHistory },
      { id: 'konflikt_va_rebase_boshqaruvi', fn: sceneConflictContinue },
      { id: 'rebase_oltin_qoidasi', fn: sceneGoldenRule },
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
