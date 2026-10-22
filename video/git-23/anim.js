// Git 23-bob videosi: "Branch'larni boshqarish"
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
  // 1-SAHNA: Branchlarni Boshqarish: git branch
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Branchlarni Boshqarish: git branch", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch ro‘yxati',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch
      drawCommandLine("ombor $ ", "git branch", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("  feature/login", 2.2, tu, 130, 230, { color: C.text });
      drawOutputLine("  feature/qidiruv", 2.4, tu, 130, 252, { color: C.text });
      drawOutputLine("  iss53", 2.6, tu, 130, 274, { color: C.text });
      drawOutputLine("* main", 2.8, tu, 130, 296, { color: C.green, weight: 700 });
      drawOutputLine("  testing", 3.0, tu, 130, 318, { color: C.text });

      // 2-buyruq: git branch --show-current
      drawCommandLine("ombor $ ", "git branch --show-current", 4.5, 6.0, 6.2, tu, 130, 355);
      drawOutputLine("main", 6.4, tu, 130, 380, { color: C.green, weight: 700 });
      drawOutputLine("  # * belgisi va yashil rang joriy HEAD branchini bildiradi", 6.7, tu, 130, 402, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kCallout, () => {
        card(125, 445, 790, 205, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Branchlar Ko'payganda Tartib Kerak!", 290, 480, C.yellow, { size: 16, mono: false });
        text("• Har bir topshiriq uchun alohida branch ochish eng yaxshi madaniyat.", 150, 525, { size: 16, color: C.text, align: 'left' });
        text("• Ammo vaqt o'tishi bilan o'nlab, yuzlab tarmoqlar to'planib qoladi.", 150, 560, { size: 16, color: C.text, align: 'left' });
        text("• git branch — butun ombordagi brenchlarni tahlil qilish va saralash markazidir!", 150, 595, { size: 16, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Branch Boshqaruvi", "ro'yxatlash, tahlil va nazorat", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Asosiy Vazifalar", 1100, 290, C.yellow, { size: 16, mono: false });
        text("• Ro'yxatlash va oxirgi commitlarni ko'rish (-v, -vv).", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Birlashtirilganlarni ajratish (--merged, --no-merged).", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Keraksizlarini xavfsiz tozalash (-d, -D) va qayta nomlash (-m).", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yodda Tuting", 1080, 490, C.green, { size: 16, mono: false });
        text("• Branch — faqat .git/refs/heads papkasidagi 41 baytlik fayl.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Boshqaruv buyruqlari commitlarni o'zgartirmaydi, faqat ref fayllari bilan ishlaydi.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Har bir amaliyot yengil va bir lahzada bajariladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("git branch buyrug'i yaratishdan ko'ra ko'proq tahlil qilish uchun ishlatiladi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Ro‘yxatlash, -v va --list Filtrlari
  // ==========================================
  function sceneListFilters(u, bounds, o = {}) {
    chip(2, "Ro‘yxatlash, -v va --list Filtrlari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch -v va --list',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch -v
      drawCommandLine("ombor $ ", "git branch -v", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("  feature/login   ea1ac76 Merge branch 'iss53'", 2.2, tu, 130, 230, { color: C.text });
      drawOutputLine("  feature/qidiruv 8f480b5 Qidiruv tizimi karkasi", 2.4, tu, 130, 252, { color: C.text });
      drawOutputLine("  iss53           596c833 Footer [issue 53]", 2.6, tu, 130, 274, { color: C.text });
      drawOutputLine("* main            ea1ac76 Merge branch 'iss53'", 2.8, tu, 130, 296, { color: C.green, weight: 700 });
      drawOutputLine("  testing         6feafda Test fayllari", 3.0, tu, 130, 318, { color: C.text });

      // 2-buyruq: git branch --list "feature/*"
      drawCommandLine("ombor $ ", "git branch --list \"feature/*\"", 4.5, 6.2, 6.4, tu, 130, 355);
      drawOutputLine("  feature/login", 6.6, tu, 130, 380, { color: C.cyan, weight: 600 });
      drawOutputLine("  feature/qidiruv", 6.8, tu, 130, 402, { color: C.cyan, weight: 600 });
      drawOutputLine("  # naqsh orqali faqat ma'lum guruhdagi brenchlarni ko'ramiz", 7.1, tu, 130, 424, { color: C.mute });

      const kDetail = P(u, 8.5, 0.5);
      withA(kDetail, () => {
        card(125, 465, 790, 195, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--list Qoidasi", 180, 500, C.cyan, { size: 16, mono: false });
        text("• Yulduzcha (*) naqshlarini doimo qo'shtirnoqqa oling: \"feature/*\".", 145, 545, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Aks holda terminal fayl nomlari bilan almashtirib yuborishi mumkin.", 145, 575, { size: 15, color: C.text, align: 'left' });
        text("• --list parametri yozilmasa, Git naqshni yangi branch nomi deb tushunadi!", 145, 605, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("• -vv esa masofaviy (upstream) branch bilan farqni [ahead/behind] ko'rsatadi.", 145, 635, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Verbose va Filtrlash", "brench ma'lumotlarini qulay o'qish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("-v (Verbose Rejimi)", 1120, 290, C.green, { size: 16, mono: false });
        text("• Har bir branch uchidagi commit hash'i va commit xabari.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Qaysi branchda nima ish qilinganini switch qilmasdan bilish oson.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• -vv bilan esa tracking branch holati ko'rinadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Guruhli Nomlash Madaniyati", 1170, 490, C.yellow, { size: 16, mono: false });
        text("• Jamoalarda prefikslar keng qo'llaniladi:", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("  feature/nom, fix/xato-id, release/v1.0", 1030, 570, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• --list 'fix/*' orqali faqat kerakli vazifalarni ko'rish mumkin.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("git branch -a — lokal va serverdagi (remote) barcha branchlarni chiqaradi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: --merged va --no-merged Tahlili
  // ==========================================
  function sceneMergedNoMerged(u, bounds, o = {}) {
    chip(3, "--merged va --no-merged Tahlili", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch --merged va --no-merged',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch --merged
      drawCommandLine("ombor $ ", "git branch --merged", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("  feature/login", 2.4, tu, 130, 230, { color: C.green });
      drawOutputLine("  iss53", 2.6, tu, 130, 252, { color: C.green });
      drawOutputLine("* main", 2.8, tu, 130, 274, { color: C.green, weight: 700 });
      drawOutputLine("  # bu branchlar allaqachon main tarkibiga qo'shilgan!", 3.1, tu, 130, 296, { color: C.mute });

      // 2-buyruq: git branch --no-merged
      drawCommandLine("ombor $ ", "git branch --no-merged", 4.2, 5.8, 6.0, tu, 130, 330);
      drawOutputLine("  feature/qidiruv", 6.2, tu, 130, 355, { color: C.yellow });
      drawOutputLine("  testing", 6.4, tu, 130, 377, { color: C.yellow });
      drawOutputLine("  # ularda hali main'ga o'tmagan mustaqil commitlar bor!", 6.7, tu, 130, 400, { color: C.mute });

      // 3-buyruq: git branch -d testing (rad etiladi)
      drawCommandLine("ombor $ ", "git branch -d testing", 8.0, 9.4, 9.6, tu, 130, 435);
      drawOutputLine("error: the branch 'testing' is not fully merged", 9.8, tu, 130, 460, { color: C.red, weight: 700 });
      drawOutputLine("hint: If you are sure you want to delete it, run 'git branch -D testing'", 10.1, tu, 130, 485, { color: '#f87171' });

      const kDetail = P(u, 11.5, 0.5);
      withA(kDetail, () => {
        card(125, 525, 790, 135, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Xavfsizlik Himoyasi", 200, 560, C.green, { size: 16, mono: false });
        text("• --merged dagi branchlarni bemalol o'chirish mumkin (ishi saqlangan).", 145, 600, { size: 15, color: C.green, weight: 600, align: 'left' });
        text("• --no-merged dagi branchlarni esa Git tasodifiy yo'qotishdan qat'iy himoya qiladi.", 145, 630, { size: 15, color: C.text, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Graf Bo'ylab Tekshirish", "qo'shilganlik qanday aniqlanadi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("--merged Mantiqi", 1100, 290, C.green, { size: 16, mono: false });
        text("• Git fayllarni emas, balki commitlar grafini tekshiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Agar branch uchi HEAD'dan orqaga yurganda topilsa -> MERGED.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Bunday branchni o'chirsangiz, barcha commitlar tarixdan yo'qolmaydi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Xavfsiz O'chirish: git branch -d", 1170, 490, C.red, { size: 16, mono: false });
        text("• -d parametri avtomatik ravishda --merged tekshiruvini o'tkazadi.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Agar branchda saqlanmagan commitlar bo'lsa, xato berib to'xtaydi.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bu ishlab chiquvchini bexosdan mehnatini yo'qotishdan saqlaydi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Boshqa branchga nisbatan: git branch --no-merged main", 1030, 715, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: --contains va --points-at Savollari
  // ==========================================
  function sceneContainsPointsAt(u, bounds, o = {}) {
    chip(4, "--contains va --points-at Savollari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch --contains va --points-at',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch --contains 6feafda
      drawCommandLine("ombor $ ", "git branch --contains 6feafda", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("  testing", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("  # 6feafda faqat testing branchi tarixida mavjud!", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git branch --contains HEAD
      drawCommandLine("ombor $ ", "git branch --contains HEAD", 4.0, 5.5, 5.7, tu, 130, 285);
      drawOutputLine("  feature/login", 5.9, tu, 130, 310, { color: C.cyan });
      drawOutputLine("  feature/qidiruv", 6.1, tu, 130, 332, { color: C.cyan });
      drawOutputLine("* main", 6.3, tu, 130, 355, { color: C.green, weight: 700 });

      // 3-buyruq: git branch --points-at HEAD
      drawCommandLine("ombor $ ", "git branch --points-at HEAD", 7.8, 9.2, 9.4, tu, 130, 390);
      drawOutputLine("  feature/login", 9.6, tu, 130, 415, { color: C.cyan, weight: 600 });
      drawOutputLine("* main", 9.9, tu, 130, 437, { color: C.green, weight: 700 });
      drawOutputLine("  # aniq HEAD commitida turgan branchlar (ajdod emas, to'g'ri tenglik)", 10.2, tu, 130, 460, { color: C.mute });

      const kDetail = P(u, 11.0, 0.5);
      withA(kDetail, () => {
        card(125, 495, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("To'rtta Savol — To'rtta Opsiya", 250, 530, C.cyan, { size: 16, mono: false });
        text("• --contains <commit>: qaysi branchlarda bu commit bor?", 145, 570, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• --no-contains <commit>: qaysi branchlarga bu commit hali bormagan?", 145, 600, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        text("• --points-at <commit>: aynan shu commitda turgan branchlar.", 145, 630, { size: 15, fam: MONO, color: C.green, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Teskari Qidiruv: --contains", "commit qayerga yetib borganini bilish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Reliz va Xatoliklar Tahlili", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• Muhim bir bugfix (xatolik tuzatish) commit qildingiz.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• U qaysi versiyalarga (v1.0, v2.0, release) tushganini qanday bilasiz?", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• git branch --contains <hesh> darhol barcha tarmoqlarni topib beradi!", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Git 2.56 Tezlashuvi", 1100, 490, C.green, { size: 16, mono: false });
        text("• Katta omborlarda minglab commitlar orasidan qidirish og'ir bo'lardi.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("• Git 2.56 da memoized graf algoritmi qo'shildi va qidiruv bir zumda ishlaydi.", 1030, 570, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Tez va aniq tahlil — vaqtni tejash kalitidir.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("--points-at: faqat joriy commitga qaragan branchlarni ajratadi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: O‘chirish, Qayta Nomlash: -d, -D va -m
  // ==========================================
  function sceneDeleteRename(u, bounds, o = {}) {
    chip(5, "O‘chirish, Qayta Nomlash: -d, -D va -m", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git branch -d, -D va -m',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git branch -d iss53
      drawCommandLine("ombor $ ", "git branch -d iss53", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Deleted branch iss53 (was 596c833).", 2.2, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # .git/refs/heads/iss53 fayli o'chirildi (xavfsiz)", 2.5, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git branch -D testing
      drawCommandLine("ombor $ ", "git branch -D testing", 3.8, 5.2, 5.4, tu, 130, 285);
      drawOutputLine("Deleted branch testing (was 6feafda).", 5.6, tu, 130, 310, { color: C.git, weight: 600 });
      drawOutputLine("  # -D (--delete --force): birlashtirilmagan bo'lsa ham majburiy o'chirish", 5.9, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git branch -m feature/qidiruv feature/search
      drawCommandLine("ombor $ ", "git branch -m feature/qidiruv feature/search", 7.2, 9.4, 9.6, tu, 130, 365);
      drawCommandLine("ombor $ ", "git branch --list \"feature/*\"", 10.0, 11.2, 11.4, tu, 130, 400);
      drawOutputLine("  feature/login", 11.6, tu, 130, 425, { color: C.cyan });
      drawOutputLine("  feature/search  # yangi nomga toza o'zgartirildi!", 11.8, tu, 130, 447, { color: C.green, weight: 700 });

      const kDetail = P(u, 12.5, 0.5);
      withA(kDetail, () => {
        card(125, 485, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill(".git Ichida Nima O'zgaradi?", 230, 520, C.green, { size: 16, mono: false });
        text("• O'chirish: faqat .git/refs/heads dagi fayl va uning reflog jurnali o'chadi.", 145, 560, { size: 15, color: C.text, align: 'left' });
        text("• Qayta nomlash (-m): ref fayli yangi nomga ko'chiriladi, reflog saqlanadi.", 145, 595, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• .git/config faylidagi branch tracking sozlamalari ham avtomatik yangilanadi.", 145, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Tozalash va Nomlash Qoidalari", "-d, -D va -m parametrlari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("-d vs -D", 1080, 290, C.green, { size: 16, mono: false });
        text("• Kichik -d: xavfsiz, faqat to'liq birlashtirilgan branchlarni o'chiradi.", 1030, 335, { size: 16, color: C.green, weight: 600, align: 'left' });
        text("• Katta -D: majburiy, keraksiz tajribalar va sinovlar uchun.", 1030, 370, { size: 16, color: C.git, weight: 600, align: 'left' });
        text("• Joriy HEAD branchini turgan joyingizda o'chirib bo'lmaydi (avval boshqasiga o'ting).", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-m (Move / Rename)", 1120, 490, C.cyan, { size: 16, mono: false });
        text("• git branch -m yangi-nom (joriy branchni qayta nomlash).", 1030, 535, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• git branch -m eski yangi (istalgan branchni qayta nomlash).", 1030, 570, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• -c (copy) esa mavjud branchdan nusxa ko'chirib beradi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        text("Git 2.56 da --delete-merged bilan barcha birlashganlarni bir zumda tozalash mumkin.", 1030, 715, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: --sort va Tartibli Tarmoqlar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: --sort va Tartibli Tarmoqlar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda --sort
      terminal(100, 140, 840, 520, {
        title: 'zsh — git branch --sort=-committerdate',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git branch -v --sort=-committerdate", 0.6, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("  feature/search  8f480b5 Qidiruv tizimi karkasi", 2.9, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("* main            ea1ac76 Merge branch 'iss53'", 3.1, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine("  feature/login   d0067f5 Ilova karkasi", 3.3, tu, 130, 274, { color: C.text });
      drawOutputLine("  # oxirgi kommit sanasi bo'yicha eng faol branchlar doim tepada!", 3.6, tu, 130, 296, { color: C.mute });

      drawCommandLine("ombor $ ", "git config --global branch.sort -committerdate", 4.8, 7.2, 7.4, tu, 130, 335);
      drawOutputLine("  # doimiy sozlama: endi git branch avtomatik sanasi bo'yicha saralanadi", 7.6, tu, 130, 360, { color: C.yellow, weight: 600 });

      const kDetail = P(u, 8.5, 0.5);
      withA(kDetail, () => {
        card(125, 400, 790, 240, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Tartibli Branch Madaniyati Qoidalari", 280, 435, C.blue, { size: 16, mono: false });
        text("• 1. Har bir yangi vazifa uchun qisqa va aniq nomli branch oching.", 150, 480, { size: 16, color: C.text, align: 'left' });
        text("• 2. Merge qilingan yoki tashlab ketilgan eski branchlarni darhol o'chiring.", 150, 515, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• 3. --merged va --no-merged orqali loyihani doimo toza holatda saqlang.", 150, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• 4. branch.sort sozlamasi orqali eng faol tarmoqlarni tezkor toping.", 150, 585, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Branch Boshqaruvi Xulosasi", "toza ombor va samarali jamoaviy ish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Branch Ochish Arzon, Saqlash Tartibli", 1240, 275, C.green, { size: 16, mono: false });
        text("• Branch ochishdan qo'rqmang — u diskdan joy olmaydi.", 1030, 320, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Lekin o'z vazifasini o'tab bo'lganidan so'ng -d bilan tozalashni unutmang.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• Toza repo — har bir jamoa a'zosi uchun qulay ish muhitidir.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Kuchli Filtr va Qidiruv", 1170, 480, C.yellow, { size: 16, mono: false });
        text("• --merged, --no-merged, --contains va --points-at.", 1030, 525, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Ushbu buyruqlar yordamida har qanday murakkab repoda adashmaysiz.", 1030, 560, { size: 16, color: C.text, align: 'left' });
        text("• Barcha ma'lumotlar bitta 'git branch' buyrug'i ichida mujassam!", 1030, 595, { size: 15, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.0, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 24-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Rebase! Tarixni to'g'ri chiziqqa keltirish, toza tarix va merge commitlarsiz birlashtirish san'ati!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'royxat_va_filtr', fn: sceneListFilters },
      { id: 'merged_va_xavfsizlik', fn: sceneMergedNoMerged },
      { id: 'contains_va_points_at', fn: sceneContainsPointsAt },
      { id: 'ochirish_va_nomlash', fn: sceneDeleteRename },
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
