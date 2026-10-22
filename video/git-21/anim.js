// Git 21-bob videosi: "Branch yaratish va merge"
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
  // 1-SAHNA: Merge Tushunchasi va Yo‘nalish
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Merge Tushunchasi va Yo‘nalish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge yo‘nalishi va qoidalari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch main
      drawCommandLine("ombor $ ", "git switch main", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Switched to branch 'main'", 2.2, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # Qoida 1: avval qabul qiluvchi branchga o'tamiz (HEAD = main)", 2.5, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git merge iss53
      drawCommandLine("ombor $ ", "git merge iss53", 4.0, 5.5, 5.7, tu, 130, 285);
      drawOutputLine("Updating 59b6ff3..2ccf6c0", 6.0, tu, 130, 310, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Qoida 2: 'iss53 o'zgarishlarini joriy main branchiga qo'sh'", 6.3, tu, 130, 332, { color: C.mute });

      // 3-buyruq: cat .git/HEAD
      drawCommandLine("ombor $ ", "cat .git/HEAD", 7.8, 9.0, 9.2, tu, 130, 365);
      drawOutputLine("ref: refs/heads/main", 9.4, tu, 130, 390, { color: C.yellow, weight: 700 });
      drawOutputLine("  # Faqat HEAD qaragan branch (main) yangilanadi, iss53 o'zgarishsiz qoladi", 9.7, tu, 130, 412, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 200, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Merge Yo‘nalishi Juda Muhim!", 300, 485, C.yellow, { size: 16, mono: false });
        text("• git merge X buyrug'i: 'X tarixini hozirgi HEAD branchga qo'sh' degani.", 150, 530, { size: 16, color: C.text, align: 'left' });
        text("• O'zgaradigan yagona branch — joriy branch. X esa joyida qoladi.", 150, 565, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Natijani graf hal qiladi: fast-forward yoki 3 tomonlama merge commit.", 150, 600, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Tarixlarni Birlashtirish", "ikki xil natija va ularning farqi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Fast-Forward Merge", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• Agar joriy branchda ajralgan yangi ish bo'lmasa.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git ko'rsatkichni shunchaki yangi commitga oldinga suradi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Uch Tomonlama Merge (3-Way)", 1170, 470, C.green, { size: 16, mono: false });
        text("• Agar ikkala tomonda mustaqil yangi commitlar bo'lsa.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ikkita otaga (parent) ega yangi merge commit yaratiladi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 615, 790, 150, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Qaysi biri bo'lishini siz emas, tarix hal qiladi", 1240, 650, C.cyan, { size: 16, mono: false });
        text("• Tarix chizig'iga qarab Git avtomatik eng maqbul yo'lni tanlaydi.", 1030, 695, { size: 16, color: C.text, align: 'left' });
        text("• Opsiyalar: --ff-only yoki --no-ff bilan natijani boshqarish mumkin.", 1030, 730, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Fast-Forward Merge Mexanizmi
  // ==========================================
  function sceneFastForward(u, bounds, o = {}) {
    chip(2, "Fast-Forward Merge Mexanizmi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge hotfix (fast-forward tahlili)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git merge-base --is-ancestor main hotfix
      drawCommandLine("ombor $ ", "git merge-base --is-ancestor main hotfix", 0.6, 2.2, 2.4, tu, 130, 205);
      drawCommandLine("ombor $ ", "echo $?", 2.8, 3.8, 4.0, tu, 130, 235);
      drawOutputLine("0", 4.2, tu, 130, 260, { color: C.green, weight: 700 });
      drawOutputLine("  # 0 — ha! main commitlari hotfixning to'g'ridan-to'g'ri ajdodi", 4.5, tu, 130, 282, { color: C.mute });

      // 2-buyruq: git merge hotfix
      drawCommandLine("ombor $ ", "git merge hotfix", 5.5, 6.8, 7.0, tu, 130, 315);
      drawOutputLine("Updating 59b6ff3..36852c9", 7.2, tu, 130, 340, { color: C.yellow, weight: 600 });
      drawOutputLine("Fast-forward", 7.5, tu, 130, 362, { color: C.green, weight: 700 });
      drawOutputLine(" aloqa.html | 2 +-", 7.8, tu, 130, 384, { color: C.text });
      drawOutputLine(" 1 file changed, 1 insertion(+), 1 deletion(-)", 8.1, tu, 130, 406, { color: C.mute });

      // 3-buyruq: cat .git/refs/heads/main
      drawCommandLine("ombor $ ", "cat .git/refs/heads/main", 9.5, 10.8, 11.0, tu, 130, 440);
      drawOutputLine("36852c940f577415eabe9da3ce2c1b48085aa9a8", 11.2, tu, 130, 465, { color: C.green, weight: 700 });

      // 4-buyruq: git count-objects
      drawCommandLine("ombor $ ", "git count-objects", 12.5, 13.6, 13.8, tu, 130, 500);
      drawOutputLine("16 objects, 64 kilobytes", 14.0, tu, 130, 525, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Obyektlar soni o'zgarmadi (16 ta edi, 16 ta qoldi)!", 14.3, tu, 130, 547, { color: C.yellow, weight: 600 });

      const kDetail = P(u, 15.0, 0.5);
      withA(kDetail, () => {
        card(125, 575, 790, 85, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        text("Fast-forward — yangi commit yaratmaydi, faqat ref faylini almashtiradi!", 150, 620, { size: 16, color: C.green, weight: 700, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Fast-Forward Qanday Ishlaydi?", "fayl pointerining oldinga surilishi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Hech Qanday Yangi Obyekt Yo'q", 1180, 290, C.green, { size: 16, mono: false });
        text("• Yangi commit yo'q, yangi tree yo'q, yangi blob yo'q.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• O'zgargan narsa: .git/refs/heads/main ichidagi 41 baytlik hesh!", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Graf Ko'rinishi", 1100, 470, C.yellow, { size: 16, mono: false });
        text("Oldin: ... 59b6ff3 (main) ---> 36852c9 (hotfix)", 1030, 515, { size: 16, fam: MONO, color: '#cbd5e1', align: 'left' });
        text("Keyin: ... 59b6ff3 -----------> 36852c9 (main, hotfix)", 1030, 555, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("• Grafda hech qanday ikkilanish yo'q, chiziq to'g'ri bo'lib qoladi.", 1030, 595, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 635, 790, 130, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill(".git/ORIG_HEAD", 1100, 670, C.cyan, { size: 16, mono: false });
        text("• Merge'dan oldingi main uchi ORIG_HEAD fayliga eslab qolinadi.", 1030, 715, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Uch Tomonlama Merge va Merge Commit
  // ==========================================
  function sceneThreeWay(u, bounds, o = {}) {
    chip(3, "Uch Tomonlama Merge va Merge Commit", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge iss53 (uch tomonlama)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git merge iss53
      drawCommandLine("ombor $ ", "git merge iss53", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Merge made by the 'ort' strategy.", 2.2, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine(" index.html | 3 ++-", 2.5, tu, 130, 252, { color: C.text });
      drawOutputLine(" 1 file changed, 2 insertions(+), 1 deletion(-)", 2.8, tu, 130, 274, { color: C.mute });

      // 2-buyruq: git cat-file -p HEAD
      drawCommandLine("ombor $ ", "git cat-file -p HEAD", 4.0, 5.4, 5.6, tu, 130, 310);
      drawOutputLine("tree 86073633ed25e3538bb575fd8826ec97cf853284", 5.8, tu, 130, 335, { color: C.cyan, weight: 600 });
      drawOutputLine("parent 36852c940f577415eabe9da3ce2c1b48085aa9a8", 6.1, tu, 130, 357, { color: C.green, weight: 700 });
      drawOutputLine("parent 85ddfe476816c250596c427cf558083a8043f3c8", 6.4, tu, 130, 379, { color: C.magenta, weight: 700 });
      drawOutputLine("author Ali Valiyev <ali@example.com> 1791349680 +0500", 6.7, tu, 130, 401, { color: C.text });
      drawOutputLine("committer Ali Valiyev <ali@example.com> 1791349680 +0500", 7.0, tu, 130, 423, { color: C.text });
      drawOutputLine("", 7.2, tu, 130, 435);
      drawOutputLine("Merge branch 'iss53'", 7.4, tu, 130, 448, { color: C.yellow, weight: 700 });

      // 3-buyruq: git count-objects
      drawCommandLine("ombor $ ", "git count-objects", 9.0, 10.2, 10.4, tu, 130, 485);
      drawOutputLine("21 objects, 84 kilobytes  # +2 ta yangi obyekt (tree + commit)", 10.6, tu, 130, 510, { color: C.yellow, weight: 600 });

      // 4-buyruq: git rev-parse HEAD^1 HEAD^2
      drawCommandLine("ombor $ ", "git rev-parse HEAD^1 HEAD^2", 12.0, 13.5, 13.7, tu, 130, 545);
      drawOutputLine("36852c9...  # HEAD^1 — 1-ota (main)", 14.0, tu, 130, 570, { color: C.green, weight: 600 });
      drawOutputLine("85ddfe4...  # HEAD^2 — 2-ota (iss53)", 14.3, tu, 130, 592, { color: C.magenta, weight: 600 });

      const kDetail = P(u, 15.0, 0.5);
      withA(kDetail, () => {
        card(125, 620, 790, 60, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        text("Merge commit — ikkita otaga (parent) ega bo'lgan maxsus commit obyekti!", 150, 655, { size: 16, color: C.git, weight: 700, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.git, "Merge Commitning Tuzilishi", "ikki ota va yaxlitlangan snapshot", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill("Ikkita Ota (Two Parents)", 1160, 290, C.git, { size: 16, mono: false });
        text("• Birinchi ota (HEAD^1): siz turgan asosiy branch uchi (main).", 1030, 335, { size: 16, color: C.green, weight: 600, align: 'left' });
        text("• Ikkinchi ota (HEAD^2): qo'shilgan ikkinchi branch uchi (iss53).", 1030, 370, { size: 16, color: C.magenta, weight: 600, align: 'left' });
        text("• Har ikkala tarmoq tarixi shu nuqtada birlashadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Yangi Tree Obyekti", 1120, 490, C.cyan, { size: 16, mono: false });
        text("• Har ikkala branchdan yig'ilgan yakuniy loyiha holati.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Yangi tree obyekti yaratilib, unga commit ko'rsatadi.", 1030, 570, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Birorta ham fayl yo'qolmaydi, to'liq snapshot hosil bo'ladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        text("ort strategiyasi — zamonaviy Git'dagi o'ta tezkor birlashtirish algoritmi.", 1030, 715, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Merge Base: Umumiy Ajdod Snapshotlari
  // ==========================================
  function sceneMergeBase(u, bounds, o = {}) {
    chip(4, "Merge Base: Umumiy Ajdod Snapshotlari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge-base va uch tomonlama solishtirish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git merge-base main iss53
      drawCommandLine("ombor $ ", "git merge-base main iss53", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("59b6ff3dcae16c3d0426e175a694de87cdb0d43d", 2.4, tu, 130, 230, { color: C.yellow, weight: 700 });
      drawOutputLine("  # merge-base — ikkala branch ajralgan eng yaqin umumiy ota!", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git diff --stat main...iss53
      drawCommandLine("ombor $ ", "git diff --stat main...iss53", 4.0, 5.5, 5.7, tu, 130, 285);
      drawOutputLine(" index.html | 3 ++-", 6.0, tu, 130, 310, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 2 insertions(+), 1 deletion(-)", 6.3, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git cat-file -p HEAD^{tree}
      drawCommandLine("ombor $ ", "git cat-file -p HEAD^{tree}", 7.8, 9.2, 9.4, tu, 130, 365);
      drawOutputLine("100644 blob 45b4819...  aloqa.html  (main dan olingan)", 9.6, tu, 130, 390, { color: C.cyan, weight: 600 });
      drawOutputLine("100644 blob 013989e...  index.html  (iss53 dan olingan)", 9.9, tu, 130, 412, { color: C.green, weight: 600 });

      // Jadval / Tahlil kartasi
      const kTable = P(u, 11.0, 0.5);
      withA(kTable, () => {
        card(125, 450, 790, 210, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uch Tomonlama Solishtirish Mantiqi", 310, 485, C.cyan, { size: 16, mono: false });
        text("Fayl: index.html  | Base: asl | main: asl (tegmagan) | iss53: o'zgargan -> Natija: iss53!", 145, 535, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("Fayl: aloqa.html  | Base: asl | main: o'zgargan      | iss53: asl (tegmagan) -> Natija: main!", 145, 570, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        text("• Har bir faylni faqat bitta tomon o'zgartirgan, shuning uchun konflikt chiqmadi.", 145, 615, { size: 15, color: C.text, align: 'left' });
        text("• Git mavjud bloblarni qayta ishlatdi, ortiqcha blob yaratilmadi!", 145, 645, { size: 15, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Nega 3 Snapshot Kerak?", "ikki tomonlama solishtirish yetarli emas", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Muammo: Kim O'zgartirgan?", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• Agar faqat ikki faylni solishtirsangiz, ular har xilligini ko'rasiz.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Ammo qaysi biri yangi? Kim qator qo'shganu kim o'chirgan?", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bunga faqat ularning umumiy ajdodi (merge base) javob bera oladi!", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Avtomatik Merge Base Qidiruvi", 1170, 490, C.green, { size: 16, mono: false });
        text("• Git commitlarning ota zanjiri bo'ylab grafni tekshiradi.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Eng yaqin umumiy ajdod snapshotini bir zumda topadi.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Dasturchi qayerdan ajralganini eslab yurishi shart emas!", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("git diff A...B (uch nuqta) — aynan merge olib kiradigan o'zgarishlardir.", 1030, 715, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Branch Tozalash: git branch -d
  // ==========================================
  function sceneBranchCleanup(u, bounds, o = {}) {
    chip(5, "Branch Tozalash: git branch -d", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — birlashtirilgan branchlarni tozalash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch -d hotfix
      drawCommandLine("ombor $ ", "git branch -d hotfix", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("Deleted branch hotfix (was 36852c9).", 2.4, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # Faqat .git/refs/heads/hotfix fayli o'chdi!", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git branch -d iss53
      drawCommandLine("ombor $ ", "git branch -d iss53", 4.0, 5.4, 5.6, tu, 130, 285);
      drawOutputLine("Deleted branch iss53 (was 85ddfe4).", 5.8, tu, 130, 310, { color: C.green, weight: 600 });
      drawOutputLine("  # ikkinchi ota orqali iss53 commitlari main tarixiga ulanib ulgurgan", 6.1, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git log --oneline --graph --all
      drawCommandLine("ombor $ ", "git log --oneline --graph --all", 7.5, 9.0, 9.2, tu, 130, 365);
      drawOutputLine("*   be8cf0b (HEAD -> main) Merge branch 'iss53'", 9.4, tu, 130, 390, { color: C.yellow, weight: 700 });
      drawOutputLine("|\\", 9.6, tu, 130, 408, { color: C.mute });
      drawOutputLine("| * 85ddfe4 Footer tayyor [issue 53]", 9.8, tu, 130, 426, { color: C.magenta });
      drawOutputLine("| * 2ccf6c0 Yangi footer [issue 53]", 10.0, tu, 130, 444, { color: C.magenta });
      drawOutputLine("* | 36852c9 Email manzilini tuzatish", 10.2, tu, 130, 462, { color: C.green });
      drawOutputLine("|/", 10.4, tu, 130, 480, { color: C.mute });
      drawOutputLine("* 59b6ff3 Aloqa sahifasi", 10.6, tu, 130, 498, { color: C.text });

      const kDetail = P(u, 11.5, 0.5);
      withA(kDetail, () => {
        card(125, 525, 790, 125, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Commitlar Saqlanib Qoladi!", 260, 560, C.green, { size: 16, mono: false });
        text("• Branch ko'rsatkichini o'chirish commitlarni o'chirmaydi.", 150, 600, { size: 16, color: C.text, align: 'left' });
        text("• Chunki merge commit ularni o'z ota commitlari sifatida mahkam ushlab turadi.", 150, 630, { size: 15, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Xavfsiz Branch Tozalash", "git branch -d va -D farqi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git branch -d (Kichik d — Xavfsiz)", 1210, 290, C.green, { size: 16, mono: false });
        text("• Faqat to'liq birlashtirilgan branchlarni o'chiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Agar birlashtirilmagan ish bo'lsa: 'branch is not fully merged' deb rad etadi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Tasodifiy ish yo'qotilishidan mukammal himoya qiladi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill("git branch -D (Katta D — Majburiy)", 1210, 490, C.git, { size: 16, mono: false });
        text("• Keraksiz, sinov tariqasidagi yoki squash qilingan branchlar uchun.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Birlashtirilganligidan qat'i nazar ko'rsatkichni kuch bilan o'chiradi.", 1030, 570, { size: 16, color: C.git, align: 'left', weight: 600 });
        text("• Undan ehtiyotkorlik bilan foydalanish kerak.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("O'chirish faqat ref ko'rsatkichini yo'qotadi, commitlar omborda qoladi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: --no-ff, --squash va --ff-only
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: --no-ff, --squash va --ff-only", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda buyruqlar
      terminal(100, 140, 840, 520, {
        title: 'zsh — merge strategiyalari va nazorati',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git merge --ff-only katalog", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("fatal: Not possible to fast-forward, aborting.", 2.6, tu, 130, 230, { color: C.red, weight: 600 });
      drawOutputLine("  # tarix ajralgan bo'lsa merge bekor qilinadi (server pull uchun qulay)", 2.9, tu, 130, 252, { color: C.mute });

      drawCommandLine("ombor $ ", "git merge --no-ff qidiruv", 4.2, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("Merge made by the 'ort' strategy.", 6.2, tu, 130, 310, { color: C.green, weight: 600 });
      drawOutputLine("  # hatto fast-forward mumkin bo'lsa ham alohida merge commit yaratiladi", 6.5, tu, 130, 332, { color: C.mute });

      drawCommandLine("ombor $ ", "git log --oneline --first-parent", 7.8, 9.2, 9.4, tu, 130, 365);
      drawOutputLine("006ea37 Merge branch 'qidiruv'", 9.6, tu, 130, 390, { color: C.yellow, weight: 700 });
      drawOutputLine("be8cf0b Merge branch 'iss53'", 9.8, tu, 130, 412, { color: C.cyan });
      drawOutputLine("36852c9 Email manzilini tuzatish", 10.0, tu, 130, 434, { color: C.green });

      const kDetail = P(u, 11.0, 0.5);
      withA(kDetail, () => {
        card(125, 460, 790, 175, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("--first-parent Afzalligi", 240, 495, C.blue, { size: 16, mono: false });
        text("• --first-parent asosiy tarmoqqa qilingan har bir qadamni alohida ko'rsatadi.", 150, 540, { size: 16, color: C.text, align: 'left' });
        text("• Ichki mayda commitlar yashirilib, loyiha evolyutsiyasi toza va ravshan ko'rinadi.", 150, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• no-ff orqali butun bir feature (PR)ni revert -m 1 bilan bekor qilish oson.", 150, 605, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Merge Strategiyalari Xulosasi", "qachon qaysi bayroq ishlatiladi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Fast-Forward vs --no-ff", 1180, 275, C.green, { size: 16, mono: false });
        text("• Fast-forward: tarixni to'g'ri chiziqda saqlaydi, kichik ishlar uchun a'lo.", 1030, 320, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• --no-ff: har bir mustaqil topshiriq uchun aniq bitta merge commit hosil qiladi.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• Jamoangiz kelishuvi va GitFlow qoidalariga qarab tanlang.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · --squash Strategiyasi", 1150, 480, C.yellow, { size: 16, mono: false });
        text("• O'nlab oraliq commitlarni bitta yaxlit oddiy commitga birlashtiradi.", 1030, 525, { size: 16, color: C.text, align: 'left' });
        text("• Ikkinchi ota bo'lmaydi — asosiy tarix ixcham va qisqa qoladi.", 1030, 560, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• GitHub'dagi 'Squash and Merge' tugmasi aynan shu mexanizmdir.", 1030, 595, { size: 15, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.5, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 22-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Konfliktlar! Bir vaqtda bir xil fayl qatorlari o'zgarganda nima bo'ladi va ularni qanday to'g'ri hal qilamiz?", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'fast_forward', fn: sceneFastForward },
      { id: 'three_way_merge', fn: sceneThreeWay },
      { id: 'merge_base', fn: sceneMergeBase },
      { id: 'branch_tozalash', fn: sceneBranchCleanup },
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
