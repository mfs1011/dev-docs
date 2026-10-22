// anim.js — 31-bob: Branch bilan ishlash uslublari
// Realistik terminal va zamonaviy split-screen video animatsiyasi
(function () {
  const canvas = document.getElementById('c') || document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const kit = window.GITKIT(ctx);

  const {
    C,
    MONO,
    UI,
    bg,
    terminal,
    card,
    panel,
    pill,
    chip,
    text,
    tw,
    withA,
    P,
    eo,
    clamp
  } = kit;

  const TM = window.TM;

  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
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
  // 1-SAHNA: Kirish va Workflow Asoslari
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Branch Workflow Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — branchlarni yaratish va solishtirish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: topic branch ochish
      drawCommandLine("dev $ ", "git switch -c iss91 main", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("Switched to a new branch 'iss91'", 3.5, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # 41 baytlik ko'rsatkich yaratildi, hech narsa nusxalanmadi!", 3.8, tu, 130, 252, { color: C.mute });

      // 2-buyruq: branchlarni ko'rish
      drawCommandLine("dev $ ", "git branch -v", 5.5, 7.5, 7.7, tu, 130, 290);
      drawOutputLine("* iss91  3c8955c iss91: vazifa bo'yicha ish boshlandi", 8.0, tu, 130, 315, { color: C.cyan, weight: 600 });
      drawOutputLine("  main   2af676d Barqaror reliz v1.0", 8.3, tu, 130, 337, { color: '#94a3b8' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 375, 790, 275, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ikki Asosiy Branch Toifasi", 235, 410, C.cyan, { size: 16, mono: false });
        text("• Uzoq yashovchi (Long-running) branchlar:", 150, 450, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  main, develop, maint, next — loyiha bilan yillab yashaydi.", 150, 478, { size: 15, color: C.text, align: 'left' });
        text("  Har biri kodning ma'lum barqarorlik darajasini aks ettiradi.", 150, 506, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Topic (vazifa) branchlari:", 150, 540, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("  Bitta aniq xususiyat yoki xato uchun ochiladi va tugagach o'chiriladi.", 150, 568, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  Siklli hayot: ochish -> ishlash -> merge -> o'chirish.", 150, 596, { size: 15, color: C.cyan, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Workflow Nega Git Markazida?", "arzon branch va masshtabli boshqaruv", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Eski Tizimlar va Git Farqi", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• CVS va SVN da branch — butun papkani nusxalash edi (juda qimmat).", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git'da branch — atigi bitta commit hash'ini saqlovchi 41 baytlik fayl!", 1030, 365, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Uch tomonlama merge: Git umumiy ajdodni (merge base) o'zi topadi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Natijada kuniga o'nlab branch ochib-yopish odatiy holatga aylanadi.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Merge vs Cherry-pick", 1105, 500, C.green, { size: 16, mono: false });
        text("• Merge: Branch darajasida ishlaydi — 1 yoki 1000 commitni bir xil o'tkazadi.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Cherry-pick: Commit darajasida ishlaydi — faqat bitta bo'lakni nusxalaydi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Merge commit — 'barcha otalarning o'zgarishlari endi shu yerda' degan va'da.", 1030, 605, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Shu sababli Git'da workflowlar asosan merge ustiga quriladi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Topic Branchlar Hayot Sikli
  // ==========================================
  function sceneTopicBranchlar(u, bounds, o = {}) {
    chip(2, "Topic Branchlar Hayot Sikli", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — topic branchlar va tozalash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: daraxt ko'rinishida ko'rish
      drawCommandLine("dev $ ", "git log --oneline --graph --all", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("* 3d2247a (iss91v2) iss91v2: testlar", 3.5, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("* accbb77 (iss91) iss91: birinchi yechim", 3.7, tu, 130, 252, { color: C.yellow });
      drawOutputLine("* 2af676d (HEAD -> main) Barqaror kod", 3.9, tu, 130, 274, { color: C.green, weight: 600 });

      // 2-buyruq: keraksiz branch o'chirish (-D)
      drawCommandLine("dev $ ", "git branch -d iss91", 5.5, 7.5, 7.7, tu, 130, 310);
      drawOutputLine("error: the branch 'iss91' is not fully merged", 8.0, tu, 130, 335, { color: C.red, weight: 600 });
      drawCommandLine("dev $ ", "git branch -D iss91", 9.0, 11.0, 11.2, tu, 130, 360);
      drawOutputLine("Deleted branch iss91 (was accbb77).", 11.5, tu, 130, 385, { color: C.yellow, weight: 700 });

      // 3-buyruq: ikkinchi yechimni merge qilish
      drawCommandLine("dev $ ", "git merge --no-edit iss91v2", 13.0, 15.5, 15.7, tu, 130, 420);
      drawOutputLine("Merge made by the 'ort' strategy.", 16.0, tu, 130, 445, { color: C.green, weight: 700 });
      drawOutputLine(" 1 file changed, 3 insertions(+)", 16.2, tu, 130, 467, { color: '#94a3b8' });
      drawCommandLine("dev $ ", "git branch -d iss91v2", 17.5, 19.5, 19.7, tu, 130, 502);
      drawOutputLine("Deleted branch iss91v2 (was 3d2247a).", 20.0, tu, 130, 527, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Topic Branch Strategiyasi", "ochish, ishlash, birlashtirish va o'chirish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Topic Branch Afzalliklari", 1120, 290, C.yellow, { size: 16, mono: false });
        text("• Kontekstni to'liq ajratish: har branch faqat bitta mavzuga tegishli.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Parallel tajribalar: bir muammoga ikki xil yechim (iss91 vs iss91v2).", 1030, 365, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("• Tartib erkinligi: qaysi biri tayyor bo'lsa, o'shani birinchi merge qilish.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Code review oson kechadi va commitlar aniq maqsadli bo'ladi.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("-d vs -D va Reflog Kafolati", 1130, 500, C.red, { size: 16, mono: false });
        text("• git branch -d: Merge qilinmagan branchlarni o'chirishdan saqlaydi.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• git branch -D: Majburan o'chiradi (rad etilgan tajribalar uchun).", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• -D faqat ko'rsatkichni o'chiradi, commitlar esa git reflog'da qoladi!", 1030, 605, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Noto'g'ri o'chirilsa ham ma'lum muddat ichida tiklab olish mumkin.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Barqarorlik Siloslari
  // ==========================================
  function sceneSilosVaDarajalar(u, bounds, o = {}) {
    chip(3, "Barqarorlik Siloslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — develop va main integratsiyasi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: developga topicni --no-ff bilan qo'shish
      drawCommandLine("dev $ ", "git switch develop && git merge --no-ff --no-edit izlash", 0.8, 3.8, 4.0, tu, 130, 205);
      drawOutputLine("Merge made by the 'ort' strategy.", 4.3, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # --no-ff: tarixda alohida integratsiya nuqtasi saqlanadi", 4.6, tu, 130, 252, { color: C.mute });

      // 2-buyruq: main va develop orasidagi farqni ko'rish
      drawCommandLine("dev $ ", "git log --oneline main..develop", 6.5, 9.0, 9.2, tu, 130, 290);
      drawOutputLine("130e9e2 Merge branch 'izlash' into develop", 9.5, tu, 130, 315, { color: C.cyan, weight: 600 });
      drawOutputLine("1db8c2a Izlash: interfeys", 9.7, tu, 130, 337, { color: '#94a3b8' });
      drawOutputLine("36bef58 Kesh qatlami", 9.9, tu, 130, 359, { color: '#94a3b8' });

      // 3-buyruq: main ga fast-forward qilish
      drawCommandLine("dev $ ", "git switch main && git merge --ff-only develop", 12.0, 15.0, 15.2, tu, 130, 395);
      drawOutputLine("Updating 6bd1edc..130e9e2", 15.5, tu, 130, 420, { color: C.yellow });
      drawOutputLine("Fast-forward", 15.7, tu, 130, 442, { color: C.green, weight: 700 });
      drawOutputLine("  # --ff-only: faqat toza oldinga siljish, tarmoqlanishsiz!", 16.0, tu, 130, 464, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Barqarorlik Qatlamlari", "kodning bosqichma-bosqich yetilishi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Silos Tushunchasi", 1095, 290, C.purple, { size: 16, mono: false });
        text("• Har bir branch — alohida barqarorlik ombori (silos):", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  1. Topic (tajriba) -> 2. Develop (sinov) -> 3. Main (barqaror reliz).", 1030, 365, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("• Kod to'liq sinovdan o'tgach, yuqoriroq silosga 'bitiradi' (graduates).", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Bu tizim ishlab chiqarishdagi xatolarni keskin kamaytiradi.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--no-ff va --ff-only Farqi", 1120, 500, C.cyan, { size: 16, mono: false });
        text("• --no-ff: Integratsiya branchlarida alohida birlashtirish nuqtasi yaratadi.", 1030, 545, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("  Zarur bo'lsa bitta 'git revert -m 1' bilan butun xususiyatni qaytarish mumkin.", 1030, 575, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• --ff-only: main developdan orqada bo'lsagina suriladi.", 1030, 605, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  Tarix ajralgan bo'lsa, xatolik berib to'xtaydi va intizomni saqlaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: gitworkflows Integratsiya Tizimi
  // ==========================================
  function sceneGitgitTizimi(u, bounds, o = {}) {
    chip(4, "gitworkflows Integratsiya Tizimi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git.git loyihasining 4 ta branchi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: branchlar ro'yxati
      drawCommandLine("maint $ ", "git branch -a", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("* master  # Keyingi asosiy reliz (1.1)", 3.0, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  maint   # Texnik tuzatishlar (1.0.x — eng barqaror)", 3.2, tu, 130, 252, { color: C.yellow, weight: 600 });
      drawOutputLine("  next    # Yaqin reliz uchun sinov integratsiyasi", 3.4, tu, 130, 274, { color: C.cyan, weight: 600 });
      drawOutputLine("  seen    # Maintainer ko'rgan eksperimentlar (bir martalik)", 3.6, tu, 130, 296, { color: C.purple, weight: 600 });

      // 2-buyruq: topicni to'g'ri branchdan ochish
      drawCommandLine("maint $ ", "git switch -c ab/nol-xato maint", 5.5, 8.5, 8.7, tu, 130, 335);
      drawOutputLine("Switched to a new branch 'ab/nol-xato'", 9.0, tu, 130, 360, { color: C.green });
      drawOutputLine("  # MUHIM: Xato tuzatish eng eski barqaror branchdan (maint) ochildi!", 9.3, tu, 130, 382, { color: C.yellow, weight: 600 });

      // 3-buyruq: noto'g'ri ochilganda rebase --onto
      drawCommandLine("maint $ ", "git rebase --onto maint master kl/yaxlitlash", 11.5, 15.0, 15.2, tu, 130, 420);
      drawOutputLine("Rebasing (1/1) Successfully rebased kl/yaxlitlash.", 15.5, tu, 130, 445, { color: C.cyan, weight: 700 });
      drawOutputLine("  # Masterdagi yangi reliz commitlari ajratib tashlandi!", 15.8, tu, 130, 467, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.blue, "To'rtta Integratsiya Branchi", "gitworkflows(7) rasmiy andozasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Qatlamlar Ketma-ketligi", 1130, 290, C.blue, { size: 16, mono: false });
        text("• maint  ⊂  master  ⊂  next  ⊂  seen", 1030, 335, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("• maint: faqat joriy versiya uchun tanqidiy tuzatishlar.", 1030, 370, { size: 15, color: C.text, align: 'left' });
        text("• master: keyingi asosiy reliz kodi.", 1030, 395, { size: 15, color: C.green, align: 'left' });
        text("• seen: maintainer patchlari — istalgan paytda noldan qayta quriladi.", 1030, 422, { size: 15, color: C.purple, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oltin Qoida: Eng Eski Branchdan Ajrating!", 1205, 500, C.green, { size: 16, mono: false });
        text("• Yangi topic branch oxir-oqibat kirishi kerak bo'lgan", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  ENG ESKI integratsiya branchidan ochilishi shart!", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 700 });
        text("• Sababi: Topic o'z ajdodlarini o'zi bilan birga ergashtirib olib keladi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Masterdan ochilgan tuzatish maint'ga relizga tayyor bo'lmagan kodni suqadi.", 1030, 630, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Merge Upwards Qoidasi
  // ==========================================
  function sceneMergeUpwards(u, bounds, o = {}) {
    chip(5, "Merge Upwards Qoidasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — tuzatishlarni yuqoriga oqizish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: maint ga merge qilish
      drawCommandLine("maint $ ", "git switch maint && git merge --no-ff ab/nol-xato", 0.8, 3.8, 4.0, tu, 130, 205);
      drawOutputLine("Merge made by the 'ort' strategy.", 4.3, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: master ga yuqoriga merge qilish
      drawCommandLine("maint $ ", "git switch master && git merge --no-ff maint", 5.5, 8.5, 8.7, tu, 130, 265);
      drawOutputLine("Merge made by the 'ort' strategy.", 9.0, tu, 130, 290, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Tuzatish masterga ham o'tdi (pastga emas, yuqoriga merge!)", 9.3, tu, 130, 312, { color: C.mute });

      // 3-buyruq: ajdodlikni tekshirish
      drawCommandLine("maint $ ", "git merge-base --is-ancestor maint master && echo 'OK'", 11.0, 14.0, 14.2, tu, 130, 350);
      drawOutputLine("OK  # maint to'liq master ichida joylashgan", 14.5, tu, 130, 375, { color: C.green, weight: 700 });

      // 4-buyruq: next ga ham yuqoriga merge
      drawCommandLine("maint $ ", "git switch next && git merge --no-ff master", 15.5, 18.5, 18.7, tu, 130, 410);
      drawOutputLine("Merge made by the 'ort' strategy.", 19.0, tu, 130, 435, { color: C.purple, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Merge Upwards Mexanizmi", "oqim faqat pastdan yuqoriga", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oqim Yo'nalishi", 1095, 290, C.green, { size: 16, mono: false });
        text("• maint   ●  git merge ab/nol-xato  (tuzatish shu yerga kiradi)", 1030, 335, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• master  ▲  git merge maint        (masterga ko'tariladi)", 1030, 365, { size: 15, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("• next    ▲  git merge master       (sinovga ko'tariladi)", 1030, 395, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• seen    ▲  next'ni noldan qayta qurganda yangilanadi.", 1030, 422, { size: 15, fam: MONO, color: C.purple, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Nega Pastga Merge Mumkin Emas?", 1150, 500, C.red, { size: 16, mono: false });
        text("• Agar next'ni masterga merge qilsangiz:", 1030, 545, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("  Next'dagi BARCHA beqaror, chala xususiyatlar ham relizga oqib o'tadi!", 1030, 575, { size: 15, color: C.yellow, align: 'left' });
        text("• Shuning uchun oqim FAQAT barqarordan beqarorga (pastdan yuqoriga) yuradi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Istisno holatda tuzatish adashib masterga tushsa: cherry-pick -x ishlatiladi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Amaliy Maslahatlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — toza va intizomli loyiha tarixi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: first-parent bilan reliz tarixini ko'rish
      drawCommandLine("dev $ ", "git log --oneline --graph --decorate --first-parent master", 0.8, 3.8, 4.0, tu, 130, 205);
      drawOutputLine("* e2f5cc2 (HEAD -> master) Merge branch 'cd/foiz'", 4.3, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("* 6698e36 Merge branch 'maint' (1.0.x tuzatishlari)", 4.6, tu, 130, 252, { color: C.cyan, weight: 600 });
      drawOutputLine("* 6901e91 1.1 reliz eslatmalari boshlandi", 4.9, tu, 130, 274, { color: '#94a3b8' });
      drawOutputLine("* 35cc492 (tag: v1.0) Versiya 1.0 relizi", 5.2, tu, 130, 296, { color: C.yellow, weight: 700 });

      // 2-buyruq: birlashgan branchlarni tozalash
      drawCommandLine("dev $ ", "git branch --merged master", 7.0, 9.5, 9.7, tu, 130, 335);
      drawOutputLine("  ab/nol-xato", 10.0, tu, 130, 360, { color: '#94a3b8' });
      drawOutputLine("  cd/foiz", 10.2, tu, 130, 382, { color: '#94a3b8' });
      drawOutputLine("* master", 10.4, tu, 130, 404, { color: C.green, weight: 700 });
      drawCommandLine("dev $ ", "git branch -d ab/nol-xato cd/foiz", 12.0, 14.5, 14.7, tu, 130, 440);
      drawOutputLine("Deleted branch ab/nol-xato.", 15.0, tu, 130, 465, { color: C.mute });
      drawOutputLine("Deleted branch cd/foiz.", 15.2, tu, 130, 487, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Workflow Oltin Qoidalari", "katta loyihalarda intizom", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Amaliyotdagi 4 Oltin Qoida", 1130, 290, C.cyan, { size: 16, mono: false });
        text("1. Har bir vazifa uchun alohida qisqa umrli topic branch oching.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("2. Topicni u kirishi kerak bo'lgan eng eski integratsiya branchidan ajrating.", 1030, 365, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Tuzatishlarni har doim 'Merge Upwards' bilan yuqoriga oqizing.", 1030, 395, { size: 15, color: C.text, align: 'left' });
        text("4. Vazifa tugagach, branchlarni vaqtida o'chirib tozalik saqlang.", 1030, 422, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 8.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Bir Martalik Branchlardan Ogoh Bo'ling!", 1175, 500, C.red, { size: 16, mono: false });
        text("• seen kabi bir martalik (throw-away) branchlar ustiga", 1030, 545, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("  HECH QACHON yangi ish qurmang!", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 700 });
        text("• Ular noldan qayta qurilganda barcha bog'langan ishlar ajralib qoladi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• O'z ishingizni doim master yoki maint asosida boshlang.", 1030, 630, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'topic_branchlar', fn: sceneTopicBranchlar },
      { id: 'silos_va_darajalar', fn: sceneSilosVaDarajalar },
      { id: 'gitgit_tizimi', fn: sceneGitgitTizimi },
      { id: 'merge_upwards', fn: sceneMergeUpwards },
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
