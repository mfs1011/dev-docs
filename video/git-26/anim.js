// Git 26-bob videosi: "Murakkab merge"
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
  // 1-SAHNA: Kirish va ORT Strategiyasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Murakkab Merge: Strategiyalar va ORT", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge strategiyalari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: mavjud strategiyalarni ko'rish
      drawCommandLine("ombor $ ", "git merge -s invalid", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Could not find merge strategy 'invalid'.", 2.6, tu, 130, 230, { color: C.red, weight: 600 });
      drawOutputLine("Available strategies are: octopus ours recursive resolve subtree.", 2.9, tu, 130, 252, { color: C.yellow, weight: 600 });

      // 2-buyruq: standart merge va ort strategiyasi
      drawCommandLine("ombor $ ", "git merge tarjima", 4.2, 5.5, 5.7, tu, 130, 288);
      drawOutputLine("Auto-merging salom.txt", 6.0, tu, 130, 313, { color: C.cyan });
      drawOutputLine("Merge made by the 'ort' strategy.", 6.3, tu, 130, 335, { color: C.green, weight: 700 });
      drawOutputLine(" 1 file changed, 2 insertions(+)", 6.6, tu, 130, 357, { color: '#cbd5e1' });

      // 3-buyruq: strategiyani qo'lda ko'rsatish
      drawCommandLine("ombor $ ", "git merge -s ort tarjima", 8.2, 9.8, 10.0, tu, 130, 393);
      drawOutputLine("Already up to date. (ort — Ostensibly Recursive's Twin)", 10.3, tu, 130, 418, { color: C.purple, weight: 600 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.5, 0.5);
      withA(kCallout, () => {
        card(125, 455, 790, 195, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Merge Strategiyasi Asosi", 240, 490, C.cyan, { size: 16, mono: false });
        text("• Har bir merge ortida bitta algoritmik savol turadi:", 150, 530, { size: 16, color: C.text, align: 'left' });
        text("  'Ikki tarixdan bitta natija snapshotini qanday hosil qilamiz?'", 150, 560, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Git 2.34 dan boshlab sukut bo'yicha 'ort' algoritmi ishlaydi.", 150, 595, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• -s strategiyani o'zgartiradi; -X esa tanlangan strategiyaga parametr beradi.", 150, 625, { size: 15, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Merge Strategiyalari Tizimi", "-s (strategiya) va -X (opsiya)", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-s va -X O'rtasidagi Farq", 1120, 290, C.cyan, { size: 16, mono: false });
        text("• -s <nom> (--strategy): Butun merge algoritmini almashtiradi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  Misol: -s ort, -s ours, -s octopus, -s subtree", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• -X <opsiya> (--strategy-option): Strategiyaga beriladigan sozlama.", 1030, 400, { size: 16, color: C.text, align: 'left' });
        text("  Misol: -X ours, -X theirs, -X ignore-space-change", 1030, 425, { size: 15, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("ORT Strategiyasining Afzalliklari", 1160, 500, C.green, { size: 16, mono: false });
        text("• Tezkorlik: Eski 'recursive' strategiyasidan ancha samarali.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Rename Detection: Fayl ko'chirilishi va nom o'zgarishini aniqlaydi.", 1030, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Virtual Ajdod: Bir nechta merge-base bo'lsa, ularni avval birlashtiradi.", 1030, 605, { size: 16, color: '#cbd5e1', align: 'left' });
        text("• Xavfsizlik: Konfliktlarni 1/2/3 bosqichlarda toza belgilaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Strategiya opsiyalari: -X ours va -X theirs
  // ==========================================
  function sceneOptionsOursTheirs(u, bounds, o = {}) {
    chip(2, "Strategiya Opsiyalari: -X ours va theirs", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge -X opsiyalari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: -X ours bilan merge qilish
      drawCommandLine("ombor $ ", 'git merge -X ours tarjima -m "Merge -X ours"', 1.0, 3.2, 3.5, tu, 130, 205);
      drawOutputLine("Auto-merging salom.txt", 3.8, tu, 130, 230, { color: C.cyan });
      drawOutputLine("Merge made by the 'ort' strategy.", 4.1, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine(" salom.txt | 1 +", 4.4, tu, 130, 274, { color: '#cbd5e1' });
      drawOutputLine("  # ziddiyatli bo'lakda bizning variant olindi, qolgani birlashdi!", 4.7, tu, 130, 296, { color: C.mute });

      // 2-buyruq: natijaviy faylni ko'rish
      drawCommandLine("ombor $ ", "cat salom.txt", 6.0, 7.2, 7.4, tu, 130, 330);
      drawOutputLine("Assalomu alaykum, dunyo!    # HEAD o'zgarishi", 7.7, tu, 130, 355, { color: C.green, weight: 600 });
      drawOutputLine("Bu - 1-qator.              # HEAD o'zgarishi", 8.0, tu, 130, 377, { color: C.green, weight: 600 });
      drawOutputLine("Bu - oxirgi qator.", 8.3, tu, 130, 399, { color: '#94a3b8' });
      drawOutputLine("Yangi qator (tarjima).     # tarjima branchidan qo'shildi!", 8.6, tu, 130, 421, { color: C.cyan, weight: 700 });

      // 3-buyruq: bo'sh joy (whitespace) konfliktini hal qilish
      drawCommandLine("ombor $ ", 'git merge -X ignore-space-change format', 10.2, 12.0, 12.2, tu, 130, 455);
      drawOutputLine("Auto-merging hisob.js", 12.5, tu, 130, 480, { color: C.cyan });
      drawOutputLine("Merge made by the 'ort' strategy.", 12.8, tu, 130, 502, { color: C.green, weight: 700 });
      drawOutputLine("  # probel va chekinish farqlari konflikt keltirib chiqarmadi!", 13.1, tu, 130, 524, { color: C.yellow, weight: 600 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 545, 790, 135, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Bo'lak (Hunk) Darajasi Qoidasi", 260, 575, C.yellow, { size: 16, mono: false });
        text("• -X ours/theirs BUTUN faylni emas, faqat konfliktli qatorlarni oladi.", 150, 615, { size: 16, color: C.text, align: 'left' });
        text("• Konfliktsiz qo'shilgan yangi funksiyalar ikkala tomondan saqlanadi!", 150, 645, { size: 16, color: C.yellow, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Avtomatik Konflikt Tanlovi", "bo'lak darajasida ziddiyatni yechish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("-X ours vs -X theirs", 1100, 290, C.yellow, { size: 16, mono: false });
        text("• -X ours: Ziddiyatli joyda joriy branch (HEAD) ustun deb olinadi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• -X theirs: Ziddiyatli joyda qo'shilayotgan branch versiyasi tanlanadi.", 1030, 365, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Har ikki holatda ham konflikt belgilari (<<< === >>>) qo'yilmaydi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Boshqa joylardagi o'zgarishlar normal merge qilinadi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Whitespace (Bo'sh Joy) Opsiyalari", 1150, 500, C.purple, { size: 16, mono: false });
        text("• -X ignore-space-change: Probel soni o'zgarishini e'tiborsiz qiladi.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• -X ignore-all-space: Bo'sh joylardagi farqni butunlay tekshirmaydi.", 1030, 575, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Jamoada kimdir formatterni yurgizib yuborgan paytlarda najot beradi!", 1030, 605, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• -X find-renames: Rename chegarasini sozlash imkoniyati.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Soxta merge: -s ours strategiyasi
  // ==========================================
  function sceneStrategyOurs(u, bounds, o = {}) {
    chip(3, "Soxta Merge: -s ours Strategiyasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge -s ours amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: -s ours bilan merge qilish
      drawCommandLine("ombor $ ", 'git merge -s ours tarjima -m "Merge -s ours"', 1.0, 3.2, 3.5, tu, 130, 205);
      drawOutputLine("Merge made by the 'ours' strategy.", 3.8, tu, 130, 230, { color: C.purple, weight: 700 });
      drawOutputLine("  # tarjima branchi merge qilindi, lekin uning KODI OLINMADI!", 4.1, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git diff tekshirish
      drawCommandLine("ombor $ ", "git diff HEAD~ HEAD", 5.5, 6.8, 7.0, tu, 130, 288);
      drawOutputLine("  # (bo'sh chiqish — ishchi daraxtda 0 bayt o'zgarish!)", 7.3, tu, 130, 313, { color: C.cyan, weight: 600 });

      // 3-buyruq: branch holatini ko'rish
      drawCommandLine("ombor $ ", "git branch --merged", 8.8, 10.0, 10.2, tu, 130, 350);
      drawOutputLine("* main", 10.5, tu, 130, 375, { color: C.green, weight: 700 });
      drawOutputLine("  tarjima", 10.7, tu, 130, 397, { color: C.cyan, weight: 600 });

      // 4-buyruq: qayta merge sinovi
      drawCommandLine("ombor $ ", "git merge tarjima", 12.0, 13.2, 13.4, tu, 130, 432);
      drawOutputLine("Already up to date.", 13.7, tu, 130, 457, { color: C.yellow, weight: 700 });
      drawOutputLine("  # Git tarjimani to'liq birlashtirilgan ajdod deb biladi!", 14.0, tu, 130, 479, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 15.0, 0.5);
      withA(kCallout, () => {
        card(125, 510, 790, 170, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Eski Tarixni 'Yopish' (Supersede)", 250, 545, C.purple, { size: 16, mono: false });
        text("• Qachon kerak: Yon tarmoqdagi ishlar eskirgan yoki keraksiz bo'lsa,", 150, 585, { size: 16, color: C.text, align: 'left' });
        text("  lekin uni tarixdan 'birlashtirildi' deb belgilab qo'yish shart bo'lsa.", 150, 615, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Keyinchalik bu branch qayta konflikt keltirib chiqarmaydi.", 150, 645, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Tarixda Birlashtirish, Kodda Emas", "-s ours va -s theirs falsafasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("-s ours vs -X ours Solishtiruvi", 1130, 290, C.purple, { size: 16, mono: false });
        text("• -s ours (Strategiya): Boshqa tomonga UMUMAN qaramaydi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  Natija tree = Joriy tree. Boshqa branch kodlari kirmaydi.", 1030, 365, { size: 15, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("• -X ours (Opsiya): Faqat to'qnashgan bo'lakda biznikini oladi.", 1030, 400, { size: 16, color: C.text, align: 'left' });
        text("  Konfliktsiz o'zgarishlar esa natijaga to'liq qo'shiladi.", 1030, 425, { size: 15, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nega Git'da -s theirs Strategiyasi Yo'q?", 1170, 500, C.red, { size: 16, mono: false });
        text("• Git falsafasi: O'z tarixingizni butunlay begonaning holati bilan", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("  almashtirish 'merge' emas, balki tarmoqni qayta tiklashdir.", 1030, 575, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Buning uchun: 'git reset --hard <branch>' buyrug'i ishlatiladi.", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Yoki boshqa tomonga o'tib, 'git merge -s ours main' qilinadi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Ko'p Branchli Merge: Octopus Strategiyasi
  // ==========================================
  function sceneOctopusMerge(u, bounds, o = {}) {
    chip(4, "Ko‘p Branchli Merge: Octopus Strategiyasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — octopus merge amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: birdaniga 3 ta branchni merge qilish
      drawCommandLine("ombor $ ", "git merge header footer menyu", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Trying simple merge with header", 3.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("Trying simple merge with footer", 3.2, tu, 130, 252, { color: '#94a3b8' });
      drawOutputLine("Trying simple merge with menyu", 3.4, tu, 130, 274, { color: '#94a3b8' });
      drawOutputLine("Merge made by the 'octopus' strategy.", 3.7, tu, 130, 296, { color: C.green, weight: 700 });
      drawOutputLine(" 3 files changed, 3 insertions(+)", 4.0, tu, 130, 318, { color: '#cbd5e1' });

      // 2-buyruq: commit otalarini ko'rish
      drawCommandLine("ombor $ ", "git cat-file -p HEAD | grep parent", 5.5, 7.2, 7.4, tu, 130, 350);
      drawOutputLine("parent 59337c4...  # 1-ota (main)", 7.7, tu, 130, 375, { color: C.yellow, weight: 600 });
      drawOutputLine("parent 803940b...  # 2-ota (header)", 8.0, tu, 130, 397, { color: C.cyan });
      drawOutputLine("parent d7e12c9...  # 3-ota (footer)", 8.3, tu, 130, 419, { color: C.purple });
      drawOutputLine("parent 21268ec...  # 4-ota (menyu)", 8.6, tu, 130, 441, { color: C.green });

      // 3-buyruq: ziddiyat chiqsa octopusning rad etishi
      drawCommandLine("ombor $ ", "git merge ziddiyat1 ziddiyat2", 10.2, 11.8, 12.0, tu, 130, 475);
      drawOutputLine("ERROR: content conflict in README.md", 12.3, tu, 130, 500, { color: C.red, weight: 600 });
      drawOutputLine("fatal: merge program failed", 12.6, tu, 130, 522, { color: C.red, weight: 700 });
      drawOutputLine("Automatic merge failed; fix conflicts and then commit.", 12.9, tu, 130, 544, { color: '#cbd5e1' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.0, 0.5);
      withA(kCallout, () => {
        card(125, 575, 790, 105, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Octopus Qat'iy Cheklovi", 240, 605, C.red, { size: 16, mono: false });
        text("• Octopus qo'lda hal qilishni talab qiluvchi konfliktlarni rad etadi!", 150, 645, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Yechim: 'git merge --abort' qilib, branchlar 'ort' bilan birma-bir ulanadi.", 150, 670, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Octopus (Sakkizoyoq) Modeli", "ko'p ota-onali commit arxitekturasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ko'p Uchli Birlashuv", 1120, 290, C.green, { size: 16, mono: false });
        text("• 3 yoki undan ko'p mustaqil feature branchlarni bitta qadamda yig'adi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Graf ko'rinishi: Sakkizoyoq paypaslagichlari kabi markazga tutashadi.", 1030, 365, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Otalarga murojaat: HEAD^1, HEAD^2, HEAD^3, HEAD^4 sintaksisi.", 1030, 400, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Git loyihasining o'zi test branchlarini yig'ishda ishlatadi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Amaliyot Maslahati", 1100, 500, C.yellow, { size: 16, mono: false });
        text("• Kundalik loyihalarda ehtiyotkorlik bilan ishlatilishi kerak.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Ko'p ota 'git bisect' va 'git log --first-parent'ni murakkablashtiradi.", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bir-biriga tegmaydigan toza modullarni yig'ish uchun ideal.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Agar konflikt chiqsa, Git darhol to'xtaydi.", 1030, 630, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Merge'ni bekor qilish: Reset va Revert
  // ==========================================
  function sceneMergeBekorQilish(u, bounds, o = {}) {
    chip(5, "Mergeni Bekor Qilish: Reset va Revert", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — merge bekor qilish amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-holat: Lokal mergeni bekor qilish
      drawCommandLine("ombor $ ", "# 1-holat: Hali push qilinmagan lokal merge", 0.6, 1.8, 1.9, tu, 130, 205, { promptCol: C.yellow });
      drawCommandLine("ombor $ ", "git reset --hard ORIG_HEAD", 2.2, 3.8, 4.0, tu, 130, 235);
      drawOutputLine("HEAD is now at 9abe168 Sozlamalar", 4.3, tu, 130, 260, { color: C.green, weight: 700 });
      drawOutputLine("  # ORIG_HEAD mergdan oldingi commitni eslab qolgan edi!", 4.6, tu, 130, 282, { color: C.mute });

      // 2-holat: Serverga push qilingan mergeni bekor qilish
      drawCommandLine("ombor $ ", "# 2-holat: Serverga ketgan (push qilingan) merge", 6.0, 7.5, 7.6, tu, 130, 318, { promptCol: C.yellow });
      drawCommandLine("ombor $ ", "git revert -m 1 5701ab9", 8.0, 9.6, 9.8, tu, 130, 348);
      drawOutputLine("[main 14e0bf2] Revert \"Merge branch 'tolov'\"", 10.1, tu, 130, 373, { color: C.yellow, weight: 700 });
      drawOutputLine(" 1 file changed, 2 deletions(-)", 10.4, tu, 130, 395, { color: '#cbd5e1' });
      drawOutputLine("  # -m 1: 1-ota (main) yo'nalishini saqlab, tolov kodlarini bekor qildi!", 10.7, tu, 130, 417, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 195, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Nima Uchun -m 1 (Mainline) Shart?", 240, 485, C.cyan, { size: 16, mono: false });
        text("• Merge commitda 2 ta ota bor — Git qaysi biriga nisbatan teskari", 150, 525, { size: 16, color: C.text, align: 'left' });
        text("  o'zgarish yasashni bilmaydi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        text("• -m 1 ko'rsatilsa, 1-ota (asosiy branch) saqlanib, 2-ota o'zgarishlari o'chiriladi.", 150, 590, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Tarix buzilmaydi, yangi teskari commit yaratiladi.", 150, 620, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Xatolarni Xavfsiz Qaytarish", "lokal va ommaviy holatlar strategiyasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Lokal Merge: reset --hard ORIG_HEAD", 1160, 290, C.green, { size: 16, mono: false });
        text("• Merge faqat sizning kompyuteringizda bo'lsa, eng toza yechim.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git har bir merge oldidan eski HEADni .git/ORIG_HEAD ga yozadi.", 1030, 365, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Branch ko'rsatkichi toza orqaga suriladi, merge commit yo'qoladi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Lekin push qilingan bo'lsa: Hech qachon ishlatmang!", 1030, 425, { size: 15, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Revert Qilingan Mergeni Qaytarish", 1150, 500, C.yellow, { size: 16, mono: false });
        text("• Diqqat: Revert'dan keyin xatoni to'g'rilab yana merge qilsangiz,", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("  Git ikkinchi branchni allaqachon qo'shilgan deb biladi va kodni OLMAYDI!", 1030, 575, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• To'g'ri yechim: 'git revert <revert_commit_hashi>' — ya'ni revertni revert qilish!", 1030, 610, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Subtree va Rerere Imkoniyatlari
  // ==========================================
  function sceneSubtreeVaRerere(u, bounds, o = {}) {
    chip(6, "Rerere va Remote Repozitoriylar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — rerere va amaliyot',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: rerere ni yoqish
      drawCommandLine("ombor $ ", "git config --global rerere.enabled true", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("  # Rerere (Reuse Recorded Resolution) global yoqildi!", 3.3, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: konflikt paytida preimage yozilishi
      drawCommandLine("ombor $ ", "git merge feature", 4.5, 5.8, 6.0, tu, 130, 265);
      drawOutputLine("Recorded preimage for 'app.js'", 6.3, tu, 130, 290, { color: C.yellow, weight: 600 });
      drawOutputLine("CONFLICT (content): Merge conflict in app.js", 6.6, tu, 130, 312, { color: C.red, weight: 700 });

      // 3-buyruq: konflikt hal qilingandan keyingi qayta ishlatilish
      drawCommandLine("ombor $ ", "git reset --hard HEAD~ && git merge feature", 8.0, 10.2, 10.4, tu, 130, 348);
      drawOutputLine("Auto-merging app.js", 10.7, tu, 130, 373, { color: C.cyan });
      drawOutputLine("Resolved 'app.js' using previous resolution.", 11.0, tu, 130, 395, { color: C.green, weight: 700 });
      drawOutputLine("  # Git eski yechimni .git/rr-cache dan olib avtomatik qo'lladi!", 11.3, tu, 130, 417, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 12.5, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 195, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Rerere Mo'jizasi", 200, 485, C.green, { size: 16, mono: false });
        text("• Reuse Recorded Resolution: 'Yozib olingan yechimni qayta ishlatish'.", 150, 525, { size: 16, color: C.text, align: 'left' });
        text("• Uzoq davom etuvchi tarmoqlarda har rebase qilganda bir xil konfliktni", 150, 555, { size: 16, color: C.text, align: 'left' });
        text("  qayta-qayta yechish mashaqqatidan xalos etadi.", 150, 585, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• .git/rr-cache papkasida konflikt nusxasi va uning yechimi saqlanadi.", 150, 620, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Murakkab Mergelar Xulosasi", "26-bob yakunlari va keyingi qadam", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("O'rganilgan Asosiy Vositalar", 1130, 290, C.cyan, { size: 16, mono: false });
        text("• -s ort (standart) va -s ours (tarixni yopish uchun)", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• -X ours/theirs (bo'lak darajasida avtomatlashtirish)", 1030, 365, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• -X ignore-space-change (formatlashdagi konfliktlarni yutish)", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• octopus (ko'p tarmoqlarni birlashtirish) va git revert -m 1", 1030, 425, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Keyingi Bob: Masofaviy Tarmoqlar (Remote)", 1170, 500, C.purple, { size: 16, mono: false });
        text("• 27-bobda Git'ning eng muhim qismi — masofaviy repozitoriylar,", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("  remote-tracking branchlar va GitHub bilan bog'lanishni o'rganamiz.", 1030, 575, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• origin, fetch, push va tracking branch mexanizmlari.", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Jamoaviy ish va markazlashgan axborot almashinuvi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
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
      { id: 'options_ours_theirs', fn: sceneOptionsOursTheirs },
      { id: 'strategy_ours', fn: sceneStrategyOurs },
      { id: 'octopus_merge', fn: sceneOctopusMerge },
      { id: 'merge_bekor_qilish', fn: sceneMergeBekorQilish },
      { id: 'subtree_va_rerere', fn: sceneSubtreeVaRerere }
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
