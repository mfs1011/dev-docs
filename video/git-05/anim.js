// Git 05-bob videosi: "Uch holat va uch hudud"
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

  // Terminalda matn va buyruqlarni chizish yordamchilari
  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
    const tPrompt = opt.tPromptShow != null ? opt.tPromptShow : tStart - 0.4;
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
  // 1-SAHNA: Uch Holat va Uch Hudud
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("05-BOB · GIT POYDEVORI", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Uch Holat va Uch Hudud", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Git arxitekturasining eng muhim poydevori: Working Tree, Index va Repository", 960, 415, { size: 26, color: C.mute });

        // Markaziy model diagrammasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 240, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Git'ning Asosiy Uch Hududi", 960, 530, C.blue, { size: 22 });

          card(400, 575, 340, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
          pill("1 · Working Tree", 570, 610, C.orange, { size: 17 });
          text("Diskdagi ishchi fayllar", 570, 650, { size: 16, color: C.text });

          card(790, 575, 340, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
          pill("2 · Staging Area (Index)", 960, 610, C.green, { size: 17 });
          text("Kommit qoralamasi", 960, 650, { size: 16, color: C.text });

          card(1180, 575, 340, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
          pill("3 · Git Directory (.git)", 1350, 610, C.blue, { size: 17 });
          text("Xavfsiz snapshotlar ombori", 1350, 650, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Gitning Eng Asosiy Poydevori", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 7.8, 0.6));
    withA(kBox, () => {
      // Chap: Nega bu mavzu muhim?
      panel(100, 140, 840, 680, C.orange, "Nega Bu Mavzu Eng Muhim?", "keyingi barcha buyruqlar asosi", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("1 · Buyruqlarni Yodlashga Hojat Qolmaydi", 320, 290, C.orange, { size: 16, mono: false });
        text("• add, commit, diff, restore, reset, stash, switch buyruqlari", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• faqat shu uch hudud o'rtasida ma'lumot ko'chirishdan iborat!", 150, 375, { size: 17, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.4, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Mantiqiy Commitlar San'ati", 280, 470, C.green, { size: 16, mono: false });
        text("• Aralash o'zgarishlarni toza va aniq kommitlarga ajratish imkoni.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Faqat tayyor bo'lgan qismlarnigina saralab saqlash mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("3 · Kriptografik Xavfsizlik", 240, 655, C.blue, { size: 16, mono: false });
        text("• Committed holatdagi snapshotlar hech qachon o'z-o'zidan yo'qolmaydi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Istalgan daqiqada o'tmishdagi toza holatga qaytish kafolati bor.", 150, 740, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng: Oshxona metaforasi
      panel(980, 140, 840, 680, C.green, "Hayotiy Misol: Oshxona Metaforasi", "intuitiv va esda qolarli tushuncha", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Working Tree = Oshpazning Ish Stoli", 1210, 290, C.orange, { size: 16, mono: false });
        text("• Ustida xom masalliqlar, chala ishlar, tajribalar turadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bu yerda tartibsizlik bo'lishi mutlaqo tabiiy holat!", 1030, 375, { size: 17, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Staging Area = Tarqatish Stoli (Likopcha)", 1230, 470, C.green, { size: 16, mono: false });
        text("• Mijozga chiqadigan taomni aynan shu yerda did bilan yig'asiz.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Stol ustidagi hamma narsani emas, faqat tayyorini qo'yasiz.", 1030, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Repository = Taomlar Fotoalbomi", 1180, 655, C.blue, { size: 16, mono: false });
        text("• Likopcha tayyor bo'lgach, uni suratga olib albomga yopishtirasiz.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Albomdagi surat tarix bo'lib qoladi va hech qachon o'zgarmaydi!", 1030, 740, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 15.0, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Ushbu uch hudud modeli Git'ning barcha buyruqlarining markaziy o'qini tashkil etadi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi fayllarning 3 ta asosiy holatini va ularning belgilanishini ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: Faylning Uch Holati
  // ==========================================
  function sceneUchHolat(u, bounds) {
    chip(2, "Faylning Uch Holati", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: 3 Asosiy Holat
      panel(100, 140, 840, 680, C.orange, "Faylning Uch Asosiy Holati", "kuzatuvdagi fayl hayot sikli", kBox, kBox);

      // Modified
      const kH1 = P(u, 1.2, 0.6);
      withA(kH1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("1 · Modified (O'zgartirilgan)", 270, 290, C.orange, { size: 16, mono: false });
        text("• Fayl diskda tahrirlangan, lekin hali index'ga qo'shilmagan.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• O'zgarishlar faqat sizning ishchi papkangizda mavjud.", 150, 375, { size: 16, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      // Staged
      const kH2 = P(u, 4.0, 0.6);
      withA(kH2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Staged (Tayyorlangan)", 250, 470, C.green, { size: 16, mono: false });
        text("• O'zgartirilgan faylning aynan hozirgi versiyasi index'ga qo'shilgan.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• 'git add' qilingan; keyingi kommit uchun navbatda turibdi.", 150, 555, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      // Committed
      const kH3 = P(u, 6.8, 0.6);
      withA(kH3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("3 · Committed (Saqlangan)", 255, 655, C.blue, { size: 16, mono: false });
        text("• Ma'lumot lokal Git ma'lumotlar bazasida xavfsiz saqlangan.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Snapshot kriptografik hash bilan qotirilgan, o'zgarmasdir.", 150, 740, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Untracked va Holat O'tishlari
      panel(980, 140, 840, 680, C.yellow, "Holat O'tishlari va Untracked", "fayl qanday harakatlanadi?", kBox, kBox);

      const kT1 = P(u, 8.5, 0.6);
      withA(kT1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Untracked (Kuzatilmaydigan) Fayllar", 1210, 290, C.yellow, { size: 16, mono: false });
        text("• Yangi yaratilgan fayllar dastlab 'untracked' bo'ladi (git status: ??).", 1030, 340, { size: 16, color: C.text, align: 'left' });
        text("• Git fayl borligini ko'radi, lekin hali tarixga aloqasi yo'q.", 1030, 380, { size: 16, color: C.mute, align: 'left' });
        text("• 'git add' qilish bilan u darhol 'staged' va 'tracked'ga aylanadi.", 1030, 415, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kT2 = P(u, 11.5, 0.6);
      withA(kT2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT2)) * 16);
        card(1005, 455, 790, 210, { fill: 'rgba(15,22,48,0.92)', col: C.git });
        pill("Holatlar O'rtasidagi Ko'chish Zanjiri", 1210, 490, C.git, { size: 16, mono: false });
        text("Working tree (tahrir) ──► git add ──► Staging (index)", 1030, 540, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Staging (index) ──► git commit ──► Repository (.git)", 1030, 580, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        text("Repository (.git) ──► checkout/restore ──► Working tree", 1030, 620, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 15.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.orange });
      text("Fayl holati uning loyihadagi o'rnini belgilaydi: tahrirlandi (modified), tayyorlandi (staged), saqlandi (committed).", 960, 895, { size: 24, weight: 700, color: C.orange, align: 'center' });
      text("Endi loyihaning uchta mustaqil jismoniy hududini chuqur ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Git Loyihasining Uch Hududi
  // ==========================================
  function sceneUchHudud(u, bounds) {
    chip(3, "Git Loyihasining Uch Hududi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // 3 Ustunli Katta Hududlar Paneli
      // 1-Hudud: Working Tree
      panel(100, 140, 545, 680, C.orange, "1 · Working Tree", "diskdagi ishchi papka", kBox, kBox);
      const kW = P(u, 1.2, 0.6);
      withA(kW, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kW)) * 16);
        card(120, 255, 505, 180, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Diskdagi Oddiy Fayllar", 270, 290, C.orange, { size: 16, mono: false });
        text("• Loyihaning bitta versiyasi diskka", 140, 335, { size: 16, color: C.text, align: 'left' });
        text("  chiqarilgan holati.", 140, 365, { size: 16, color: C.text, align: 'left' });
        text("• Muharrirda ochib tahrirlaysiz.", 140, 400, { size: 15, color: C.orange, align: 'left', weight: 600 });

        card(120, 455, 505, 180, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Clean vs Dirty Holati", 250, 490, C.mute, { size: 16, mono: false });
        text("• Clean: kommit bilan to'liq bir xil.", 140, 535, { size: 16, color: C.green, align: 'left' });
        text("• Dirty: saqlanmagan o'zgarishlar bor.", 140, 575, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 2-Hudud: Staging Area (Index)
      panel(685, 140, 550, 680, C.green, "2 · Staging Area", ".git/index fayli", kBox, kBox);
      const kS = P(u, 4.0, 0.6);
      withA(kS, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS)) * 16);
        card(705, 255, 510, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Keyingi Kommit Qoralamasi", 870, 290, C.green, { size: 16, mono: false });
        text("• Kommitga nima kirishini belgilaydi.", 725, 335, { size: 16, color: C.text, align: 'left' });
        text("• Faylning 'stat' ma'lumotlari keshlanadi.", 725, 370, { size: 16, color: C.text, align: 'left' });
        text("• Diskda bitta fayl: .git/index", 725, 405, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });

        card(705, 455, 510, 180, { fill: 'rgba(15,22,48,0.92)', col: C.yellow });
        pill("git ls-files -s Bilan Ko'rish", 880, 490, C.yellow, { size: 16, mono: false });
        text("• Har bir fayl uchun blob heshi yoziladi.", 725, 535, { size: 16, color: C.text, align: 'left' });
        text("• Oshpazning tarqatish stoli kabi faqat", 725, 570, { size: 16, color: C.yellow, align: 'left' });
        text("  saralangan fayllarni jamlaydi.", 725, 600, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 3-Hudud: Git Directory (Repository)
      panel(1275, 140, 545, 680, C.blue, "3 · Git Directory", ".git papkasi (ombor)", kBox, kBox);
      const kR = P(u, 6.8, 0.6);
      withA(kR, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR)) * 16);
        card(1295, 255, 505, 180, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Obyektlar Bazasi (.git/objects)", 1470, 290, C.blue, { size: 16, mono: false });
        text("• Loyihaning butun o'tmishi va tarixi.", 1315, 335, { size: 16, color: C.text, align: 'left' });
        text("• Blob, tree, commit va teglar saqlanadi.", 1315, 370, { size: 16, color: C.text, align: 'left' });
        text("• Kriptografik yaxlitlik kafolatlangan.", 1315, 405, { size: 15, color: '#38bdf8', align: 'left', weight: 600 });

        card(1295, 455, 505, 180, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
        pill("Klonlanganda Ko'chadigan Qism", 1470, 490, C.purple, { size: 16, mono: false });
        text("• 'git clone' aynan shu papkani oladi.", 1315, 535, { size: 16, color: C.text, align: 'left' });
        text("• Server va lokal repo aynan shu baza", 1315, 570, { size: 16, color: C.purple, align: 'left' });
        text("  orqali sinxronlashadi.", 1315, 600, { size: 16, color: C.purple, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Working tree — ish joyingiz; index — keyingi kommit qoralamasi; .git esa butun arxiv omboridir.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi real terminalda fayl yaratib, add va commit amallarini amalda ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: Amaliy Oqim: add va commit (SPLIT SCREEN)
  // ==========================================
  function sceneIshOqimi(u, bounds, o = {}) {
    chip(4, "Amaliy Oqim: add va commit", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/oshxona (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: echo osh.md
      drawCommandLine("oshxona $ ", "echo 'Osh: guruch, sabzi, go‘sht' > osh.md", 1.0, 3.2, 3.5, tu, 130, 205);

      // 2-buyruq: git status -s
      drawCommandLine("oshxona $ ", "git status -s", 4.2, 5.2, 5.5, tu, 130, 235);
      drawOutputLine("?? osh.md  (untracked: faqat working tree'da bor)", 5.7, tu, 150, 260, { color: C.red, weight: 600 });

      // 3-buyruq: git add osh.md
      drawCommandLine("oshxona $ ", "git add osh.md", 6.5, 7.8, 8.1, tu, 130, 290);

      // 4-buyruq: git status -s
      drawCommandLine("oshxona $ ", "git status -s", 8.8, 9.8, 10.1, tu, 130, 320);
      drawOutputLine("A  osh.md  (staged: index'ga muhrlandi!)", 10.3, tu, 150, 345, { color: C.green, weight: 600 });

      // 5-buyruq: git ls-files -s
      drawCommandLine("oshxona $ ", "git ls-files -s", 11.0, 12.4, 12.7, tu, 130, 375, { promptCol: C.yellow });
      drawOutputLine("100644 d2708f9... 0	osh.md", 12.9, tu, 150, 400, { color: '#38bdf8', weight: 600 });

      // 6-buyruq: git commit -m "Osh retsepti"
      drawCommandLine("oshxona $ ", "git commit -m 'Osh retsepti'", 13.5, 15.0, 15.3, tu, 130, 430);
      drawOutputLine("[main 500363e] Osh retsepti (committed: repo'ga yozildi!)", 15.5, tu, 150, 455, { color: C.green, weight: 700 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 16.0) {
        text("oshxona $ ", 130, 492, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("oshxona $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 492, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Holatlar O'zgarishi va Oltin Qoida
      panel(980, 140, 840, 680, C.green, "Holatlar O'zgarishi va Oltin Qoida", "bir vaqtda ikki xil versiya qoidasi", kBox, kBox);

      const kO1 = P(u, 1.8, 0.6);
      withA(kO1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("'git add' Nima Qildi?", 1130, 290, C.green, { size: 16, mono: false });
        text("1. Fayl mazmunini siqib, .git/objects ichida 'blob' obyekti yaratdi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("2. .git/index fayliga yozuv kiritdi: 'osh.md yo'li -> blob hash'.", 1030, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Natijada fayl 'staged' holatiga o'tdi (status: A  osh.md).", 1030, 415, { size: 16, color: C.text, align: 'left' });
        text("• Bu hali kommit emas, faqat kommitga tayyorlangan nusxa!", 1030, 455, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kO2 = P(u, 6.5, 0.6);
      withA(kO2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Oltin Qoida: Mustaqil Ikki Versiya!", 1180, 550, C.red, { size: 16, mono: false });
        text("• 'git add' qilgach, faylni diskda yana o'zgartirsangiz nima bo'ladi?", 1030, 595, { size: 16, color: C.text, align: 'left' });
        text("• Index'dagi nusxa O'ZGARCHIQLARNI OLMAYDI; ikkisi mustaqil yashaydi!", 1030, 635, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("• Fayl bir vaqtning o'zida ham staged, ham modified bo'ladi (AM osh.md).", 1030, 675, { size: 16, color: C.yellow, align: 'left' });
        text("• Yangi o'zgarish ham kommitga kirishi uchun qayta 'git add' qilish shart!", 1030, 715, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Faylni indeksga qo'shgach diskda yana o'zgartirsangiz, indeksdagi nusxa o'zgarmaydi; ikkisi alohida yashaydi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi nima uchun Git o'rtada oraliq indeks hududini kiritganini tahlil qilamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Nega Oraliq Index Bor?
  // ==========================================
  function sceneNegaIndex(u, bounds) {
    chip(5, "Nega Oraliq Index Bor?", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // 4 Ta Katta Sabab (2x2 Panel Set)
      panel(100, 140, 840, 680, C.purple, "Nega Git Index Hududini Kiritgan?", "an'anaviy vcs'lardan asosiy ustunlik", kBox, kBox);

      const kN1 = P(u, 1.2, 0.6);
      withA(kN1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("1 · Commit'larni Mantiqiy Yig'ish (Selective Staging)", 360, 290, C.purple, { size: 16, mono: false });
        text("• Ish davomida 3 ta mustaqil o'zgarish qildingiz: xato tuzatish, yangi kod, format.", 150, 335, { size: 16, color: C.text, align: 'left' });
        text("• Index bo'lmasa, uchalasi bitta aralash kommitga aylanib ketardi.", 150, 375, { size: 16, color: C.mute, align: 'left' });
        text("• Index yordamida faqat tuzatishni stage qilib kommit qilasiz (git add -p).", 150, 415, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Har bir kommit aniq, toza va bitta vazifaga bag'ishlanadi!", 150, 455, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kN2 = P(u, 5.0, 0.6);
      withA(kN2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Saqlashdan Oldin Tekshirish (Pre-commit Review)", 360, 550, C.blue, { size: 16, mono: false });
        text("• Index — keyingi kommitning to'liq qoralamasi hisoblanadi.", 150, 595, { size: 16, color: C.text, align: 'left' });
        text("• 'git diff --staged' orqali aynan nima kommit bo'lishini ko'rasiz.", 150, 635, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        text("• Qoralama yoqmasa, uni xavfsiz bekor qilasiz; tarix hali tegilmagan!", 150, 675, { size: 16, color: C.text, align: 'left' });
        text("• Bu kommitlar sifatini keskin oshiradi.", 150, 715, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: 3 va 4-sabablar
      panel(980, 140, 840, 680, C.green, "Tezlik va Zidlashuvlarni Yechish", "texnik mukammallik", kBox, kBox);

      const kP1 = P(u, 2.5, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Kesh va Yuqori Tezlik", 1150, 290, C.green, { size: 16, mono: false });
        text("• Index har bir faylning hajmi va oxirgi o'zgartirilgan vaqtini (stat) saqlaydi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• 100 000 ta fayli bor gigant loyihada ham 'git status' bir zumda ishlaydi!", 1030, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Har bir faylni qayta o'qimasdan, faqat vaqti o'zgarganlarini tekshiradi.", 1030, 415, { size: 16, color: C.text, align: 'left' });
        text("• Bu Git'ni dunyodagi eng tezkor VCS'ga aylantirgan asosiy omildir.", 1030, 455, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.8, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("4 · Merge va Zidlashuvlarni (Conflict) Hal Qilish", 1240, 550, C.yellow, { size: 16, mono: false });
        text("• Ikki branch birlashganda konflikt chiqsa, index faylning 3 ta versiyasini", 1030, 595, { size: 16, color: C.text, align: 'left' });
        text("  bir vaqtda saqlab turadi: ajdod, 'bizniki' va 'ularniki'.", 1030, 630, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Konfliktni to'g'irlab, 'git add' qilsangiz, index'da yakuniy versiya qoladi.", 1030, 675, { size: 16, color: C.text, align: 'left' });
        text("• Merge'ni yakunlash — index'da bitta toza versiyani qoldirish demakdir!", 1030, 715, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.purple });
      text("Index — kommitlarni saralash, oldindan tekshirish, yuqori tezlik va konfliktlarni yechish garovidir.", 960, 895, { size: 24, weight: 700, color: C.purple, align: 'center' });
      text("Endi beshinchi bob bo'yicha yakuniy xulosalar va amaliy tavsiyalarni chiqaramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xulosa va Tavsiyalar", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap: 4 Ta Asosiy Qoida
      panel(100, 140, 840, 680, C.blue, "Uch Hududning Oltin Qoidalari", "har bir dasturchi bilishi shart", kBox, kBox);

      const kX1 = P(u, 1.2, 0.5);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 16);
        card(125, 255, 790, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · Har Bir Buyruq Hududlar O'rtasida Ko'chiradi", 320, 285, C.blue, { size: 16, mono: false });
        text("add diskdan index'ga, commit index'dan repo'ga, checkout/restore esa diskka.", 150, 335, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.5);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 16);
        card(125, 395, 790, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · git add O'sha Daqiqadagi Ko'rinishni Oladi", 310, 425, C.green, { size: 16, mono: false });
        text("Faylni add qilgach yana o'zgartirsangiz, yangi o'zgarish kommitga kirmaydi!", 150, 475, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.5);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 16);
        card(125, 535, 790, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("3 · Commit Doim Index'dan Yasaladi", 270, 565, C.orange, { size: 16, mono: false });
        text("git commit diskka emas, aynan .git/index fayliga qarab snapshot yaratadi.", 150, 615, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX4 = P(u, 7.2, 0.5);
      withA(kX4, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX4)) * 16);
        card(125, 675, 790, 120, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("4 · Kriptografik Xavfsizlik Kafolatlangan", 290, 705, C.yellow, { size: 16, mono: false });
        text("Committed bo'lgan har qanday kod bazada abadiy va buzilmas saqlanadi.", 150, 755, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng: Keyingi Bobga Yo'llanma
      panel(980, 140, 840, 680, C.git, "Keyingi Bosqich", "06-bob: status, add va commit", kBox, kBox);

      const kN1 = P(u, 9.2, 0.6);
      withA(kN1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Keyingi Bobda Ko'riladigan Amallar", 1170, 290, C.git, { size: 16, mono: false });
        text("• 'git status' va qisqa format (-s): fayllar holatini kuzatish", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("• 'git add': fayl, papka va fayl shablonlari bo'yicha stage qilish", 1030, 385, { size: 17, color: C.text, align: 'left' });
        text("• 'git commit': mazmunli kommit xabari yozish madaniyati", 1030, 430, { size: 17, color: C.text, align: 'left' });
        text("• 'git commit -a' (index'ni chetlab o'tish qoidalari)", 1030, 475, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kN2 = P(u, 11.5, 0.6);
      withA(kN2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN2)) * 16);
        card(1005, 525, 790, 255, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Mustaqil Amaliyot Uchun Topshiriq", 1170, 560, C.green, { size: 16, mono: false });
        text("1. Bitta fayl yaratib, 'git status -s' bilan ko'ring.", 1030, 605, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("2. 'git add' qiling va 'git ls-files -s' bilan blobni toping.", 1030, 645, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("3. Faylga yangi satr qo'shing va statusdagi 'AM' belgisini ko'ring.", 1030, 685, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("Uch hudud mohiyatini tushungan bo'lsangiz, keyingi darsga o'tamiz!", 1030, 735, { size: 16, color: C.text, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Git — bu uch hudud o'rtasida o'zgarishlarni xavfsiz va aniq boshqaruvchi qudratli tizimdir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Keyingi bobda ushbu hududlar bilan ishlaydigan status, add va commit buyruqlarini amalda sinaymiz. Rahmat!", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY FRAME CHIZISH
  // ==========================================
  function frame(t, o = {}) {
    bg();
    const sc = o.scene || (TM ? Object.keys(TM.scenes).find((k) => t >= TM.scenes[k].s && t < TM.scenes[k].e) : 'intro') || 'intro';
    const bounds = TM ? TM.scenes[sc] : { s: 0, e: 114.0 };
    const u = t - bounds.s;

    switch (sc) {
      case 'intro': sceneIntro(u, bounds, o); break;
      case 'uch_holat': sceneUchHolat(u, bounds); break;
      case 'uch_hudud': sceneUchHudud(u, bounds); break;
      case 'ish_oqimi': sceneIshOqimi(u, bounds, o); break;
      case 'nega_index': sceneNegaIndex(u, bounds); break;
      case 'xulosa': sceneXulosa(u, bounds); break;
      default: sceneIntro(u, bounds, o);
    }
  }

  window.renderFrame = frame;
  window.drawFrame = frame;
  window.render = frame;

  window.renderPoster = function () {
    bg(0);
    // 05-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("05-BOB · GIT POYDEVORI", 960, 160, C.git, { size: 26, mono: false });
    text("Uch Holat va Uch Hudud", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("Git arxitekturasining eng muhim poydevori: Working Tree, Index va Repository", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy taqqoslash kartasi
    card(400, 410, 1120, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("Git Loyihasining Uch Asosiy Hududi", 960, 475, C.blue, { size: 24 });
    text("Working Tree (ishchi papka)  ──►  git add  ──►  Staging Area (index)", 960, 545, { size: 24, fam: MONO, color: C.green, weight: 700 });
    text("Staging Area (.git/index)    ──►  git commit  ──►  Repository (.git)", 960, 595, { size: 24, fam: MONO, color: '#38bdf8', weight: 700 });
    text("Modified, Staged va Committed holatlari o'rtasidagi to'liq muvozanat", 960, 645, { size: 20, fam: MONO, color: C.yellow });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Ushbu uch hudud modeli Git'ning barcha buyruqlarining markaziy poydevorini tashkil etadi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Mantiqiy kommitlarni saralash, oldindan tekshirish va yuqori tezlikdagi kesh mexanizmi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
