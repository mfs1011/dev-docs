// Git 13-bob videosi: "Plumbing, porcelain va .git papkasi"
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
  // 1-SAHNA: Porcelain va Plumbing Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5 va poster emas)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("13-BOB · PLUMBING VA PORCELAIN", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Plumbing, Porcelain va .git Papkasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Git'ning ichki mexanizmlari, quvurlar qatlami va butun omborning asosi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Git Buyruqlarining Ikki Asosiy Qatlami", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Porcelain (Chinni Lavabo)", 670, 615, C.yellow, { size: 18 });
          text("• Foydalanuvchiga qulay: add, commit, status, log", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Chiroyli ranglar, maslahatlar va tushunarli matn", 430, 680, { size: 15, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Plumbing (Quvurlar)", 1250, 615, C.cyan, { size: 18 });
          text("• Tizim ostidagi poydevor: hash-object, cat-file", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Skriptlar uchun barqaror va qat'iy mashina tili", 1010, 680, { size: 15, color: C.cyan, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Porcelain va Plumbing Tushunchasi", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Porcelain qatlami
      panel(100, 140, 840, 680, C.yellow, "Porcelain — Foydalanuvchi Qatlami", "chinni lavabo: qulay, tushunarli va chiroyli", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Kundalik Asosiy Buyruqlar", 240, 290, C.yellow, { size: 16, mono: false });
        text("• git add, git commit, git status, git switch, git branch.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Biz har kuni terminalda ishlatadigan 20-30 ta qulay buyruq.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Inson Uchun Moslangan Chiqish", 255, 470, C.cyan, { size: 16, mono: false });
        text("• Xatolarni tushuntiruvchi maslahatlar va yo'naltiruvchi xabarlar.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Terminaldagi qulay ranglar va qisqartirilgan xulosalar.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgaruvchanlik Erkinligi", 230, 655, C.mute, { size: 16, mono: false });
        text("• Git jamoasi odamlar tajribasini oshirish uchun chiqishni yangilaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shu sababli skriptlar uchun porcelain chiqishiga tayanish xavfli.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Plumbing qatlami
      panel(980, 140, 840, 680, C.blue, "Plumbing — Tizim Quvurlari", "devor ichidagi quvurlar: barqaror va qat'iy", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Low-level Quvurlar", 1120, 290, C.green, { size: 16, mono: false });
        text("• hash-object, cat-file, write-tree, commit-tree, update-ref.", 1030, 335, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• Kapot ostida aynan shu buyruqlar ma'lumotlarni boshqaradi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Skriptlar Uchun 100% Barqaror", 1170, 470, C.blue, { size: 16, mono: false });
        text("• Chiqishi quruq, aniq va hech qachon o'zgarmas formatda bo'ladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• CI/CD, IDE va tashqi dasturlar aynan shu qatlamga tayanadi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 16.5, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Git Tarixi: VCS Uchun Asboblar", 1160, 655, C.mute, { size: 16, mono: false });
        text("• Git dastlab to'liq VCS emas, VCS yasash asbobi sifatida yozilgan.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Unix falsafasi: har bir buyruq faqat bitta ishni a'lo darajada bajaradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega Ikki Qatlam Kerak? (SPLIT SCREEN)
  // ==========================================
  function sceneNegaIkkiQatlam(u, bounds, o = {}) {
    chip(2, "Nega Ikki Qatlam Kerak?", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda status vs status --porcelain taqqoslashi
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ichki-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git status (odamlar uchun) (u: 0.8 to 2.0, Enter 2.2)
      drawCommandLine("loyiha $ ", "git status", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("On branch main", 2.5, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("Changes not staged for commit:", 2.8, tu, 130, 252, { color: C.yellow });
      drawOutputLine("  (use \"git add <file>...\" to update what will be committed)", 3.1, tu, 130, 274, { color: '#64748b' });
      drawOutputLine("\tmodified:   README.md", 3.4, tu, 130, 296, { color: C.red });
      drawOutputLine("Untracked files: (use \"git add\" to include)", 3.7, tu, 130, 318, { color: '#64748b' });
      drawOutputLine("\tyangi.txt", 4.0, tu, 130, 340, { color: C.red });

      // 2-buyruq: git status --porcelain (skriptlar uchun) (u: 5.5 to 7.2, Enter 7.4)
      drawCommandLine("loyiha $ ", "git status --porcelain", 5.5, 7.2, 7.4, tu, 130, 372);
      drawOutputLine(" M README.md  # 100% barqaror format (skriptlar uchun)", 7.8, tu, 130, 396, { color: C.yellow, weight: 600 });
      drawOutputLine("?? yangi.txt   # ortiqcha maslahatsiz mashina tili", 8.2, tu, 130, 420, { color: C.red, weight: 600 });

      // 3-buyruq: git status --porcelain=v2 --branch (u: 9.6 to 11.8, Enter 12.0)
      drawCommandLine("loyiha $ ", "git status --porcelain=v2 --branch", 9.6, 11.8, 12.0, tu, 130, 452);
      drawOutputLine("# branch.oid 9f648d789a4cb418adeb1b81154a9a74605d6751", 12.4, tu, 130, 476, { color: C.cyan });
      drawOutputLine("# branch.head main", 12.7, tu, 130, 498, { color: C.green, weight: 600 });
      drawOutputLine("1 .M N... 100644 100644 11d3bc... README.md", 13.0, tu, 130, 520, { color: C.yellow });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 13.8, tu, 130, 555, { color: '#334155' });
      drawOutputLine("Porcelain: Inson uchun chiroyli va o'zgaruvchan.", 14.3, tu, 130, 585, { color: C.yellow, weight: 600 });
      drawOutputLine("Plumbing: Skriptlar uchun doimiy va o'zgarmas kafolat!", 14.7, tu, 130, 610, { color: C.green, weight: 700 });

      // O'ng panel: Qoidalar tahlili
      panel(980, 140, 840, 680, C.green, "Ikki Qatlamning Maqsadi", "insoniy qulaylik va mashina barqarorligi", kBox, kBox);

      const kL1 = P(u, 1.0, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Porcelain: Odamlar Uchun Moslashuvchan", 1240, 290, C.purple, { size: 16, mono: false });
        text("• Git jamoasi odamlar tushunishini yaxshilash uchun matnni yangilaydi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Yangi maslahatlar, ranglar va qulay formatlar qo'shilib boradi.", 1030, 370, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Shu sababli skriptlar porcelain matniga tayanmasligi lozim.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 6.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Plumbing: Skriptlar Uchun Muzlatilgan", 1230, 470, C.green, { size: 16, mono: false });
        text("• Chiqish formati Git versiyalari almashsa ham 100% barqaror qoladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Skriptlar hech qachon buzilmaydi: --porcelain, rev-parse, ls-files.", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Ortiqcha ranglar va bezaklar olib tashlangan xom ma'lumot uzatiladi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL3 = P(u, 11.5, 0.5);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Yangi Asboblar Uchun SDK", 1160, 655, C.cyan, { size: 16, mono: false });
        text("• Git dasturlash tillari kabi quyi darajadagi API interfeysiga ega.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• IDE, GUI ilovalar va CI/CD tizimlari aynan shu qatlam ustiga quriladi.", 1030, 735, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• Siz ham o'z shaxsiy buyrug'ingizni plumbing yordamida yaratasiz.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: .git Papkasi — Omborning Asli (SPLIT SCREEN)
  // ==========================================
  function sceneGitPapkasi(u, bounds, o = {}) {
    chip(3, ".git Papkasi — Omborning Asli", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda .git papkasini ko'rish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ichki-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: ls -F1 .git (u: 0.8 to 2.0, Enter 2.2)
      drawCommandLine("loyiha $ ", "ls -F1 .git", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("HEAD          # hozirgi faol branch ko'rsatkichi", 2.5, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("config        # ombor sozlamalari va format versiyasi", 2.8, tu, 130, 252, { color: C.yellow });
      drawOutputLine("description   # faqat qadimgi GitWeb brauzeri uchun nom", 3.1, tu, 130, 274, { color: '#64748b' });
      drawOutputLine("hooks/        # avtomatlashtirish xuk skriptlari namunalari", 3.4, tu, 130, 296, { color: '#64748b' });
      drawOutputLine("info/         # shaxsiy ignore ro'yxati (info/exclude)", 3.7, tu, 130, 318, { color: '#64748b' });
      drawOutputLine("objects/      # KONTENT BAZASI: barcha fayl, tree, commitlar!", 4.0, tu, 130, 340, { color: C.green, weight: 700 });
      drawOutputLine("refs/         # COMMITLAR KO'RSATKICHLARI: heads/ va tags/", 4.3, tu, 130, 362, { color: C.green, weight: 700 });

      // 2-buyruq: cat .git/HEAD (u: 5.5 to 6.8, Enter 7.0)
      drawCommandLine("loyiha $ ", "cat .git/HEAD", 5.5, 6.8, 7.0, tu, 130, 396);
      drawOutputLine("ref: refs/heads/main  # ramziy ko'rsatkich (symbolic ref)", 7.3, tu, 130, 420, { color: C.yellow, weight: 600 });

      // 3-buyruq: cat .git/config (u: 8.4 to 9.8, Enter 10.0)
      drawCommandLine("loyiha $ ", "cat .git/config | head -4", 8.4, 9.8, 10.0, tu, 130, 452);
      drawOutputLine("[core]", 10.3, tu, 130, 476, { color: '#64748b' });
      drawOutputLine("\trepositoryformatversion = 0", 10.6, tu, 130, 498, { color: C.cyan });
      drawOutputLine("\tfilemode = true", 10.9, tu, 130, 520, { color: C.cyan });
      drawOutputLine("\tbare = false  # ishchi papkaga (working tree) ega", 11.2, tu, 130, 542, { color: C.yellow, weight: 600 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 12.0, tu, 130, 575, { color: '#334155' });
      drawOutputLine("Xulosa: .git papkasi — butun omborning o'zidir!", 12.5, tu, 130, 605, { color: C.green, weight: 700 });
      drawOutputLine("Diskdagi ishchi fayllar esa faqat undan olingan vaqtinchalik nusxa.", 12.9, tu, 130, 630, { color: C.yellow });

      // O'ng panel: 4 ta asosiy ustun
      panel(980, 140, 840, 680, C.blue, ".git Yadrosining 4 Asosiy Ustuni", "pro git ta'rifi bo'yicha markaziy tuzilma", kBox, kBox);

      const kD1 = P(u, 1.0, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · objects/ — Ma'lumotlar Bazasi", 1180, 290, C.yellow, { size: 16, mono: false });
        text("• Barcha kontent: fayllar (blob), papkalar (tree), commitlar va teglar.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Kontent-adreslanadigan o'zgarmas obyektlar ombori.", 1030, 375, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kD2 = P(u, 6.5, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · refs/ — Commit Ko'rsatkichlari", 1175, 470, C.green, { size: 16, mono: false });
        text("• refs/heads/ (branchlar) va refs/tags/ (teglar).", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Commit hash'larini o'z ichida saqlovchi 41 baytlik ko'rsatkich fayllar.", 1030, 555, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kD3 = P(u, 11.5, 0.5);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("3 · HEAD va index Fayli", 1130, 655, C.cyan, { size: 16, mono: false });
        text("• HEAD — hozir qaysi branchda turganingiz (ref: refs/heads/main).", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• index — staging area holatini saqlovchi ikkilik DIRC fayli.", 1030, 735, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: add va commit Ichkaridan Qanday Ishlaydi? (SPLIT SCREEN)
  // ==========================================
  function sceneAddVaCommitIchida(u, bounds, o = {}) {
    chip(4, "add va commit Ichkaridan Qanday Ishlaydi?", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda add va commitning izlarini ko'rish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ichki-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git add README.md va blob yaratilishi (u: 0.8 to 2.4, Enter 2.6)
      drawCommandLine("loyiha $ ", "git add README.md", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine(".git/objects/11/d3bc14...  # BLOB OBYEKTI YARATILDI!", 2.9, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine(".git/index                 # INDEX FAYLI YANGILANDI!", 3.2, tu, 130, 252, { color: C.yellow, weight: 600 });

      // 2-buyruq: git ls-files -s (index ichi) (u: 4.2 to 5.6, Enter 5.8)
      drawCommandLine("loyiha $ ", "git ls-files -s", 4.2, 5.6, 5.8, tu, 130, 284);
      drawOutputLine("100644 11d3bc143b7a... 0 README.md", 6.1, tu, 130, 308, { color: C.cyan });
      drawOutputLine("# Rejim (100644), blob hash'i va fayl yo'li", 6.4, tu, 130, 330, { color: '#64748b' });

      // 3-buyruq: git commit (u: 7.6 to 9.4, Enter 9.6)
      drawCommandLine("loyiha $ ", "git commit -m \"Birinchi commit\"", 7.6, 9.4, 9.6, tu, 130, 362);
      drawOutputLine("[main 9f648d7] Birinchi commit", 9.9, tu, 130, 386, { color: C.green, weight: 700 });
      drawOutputLine(" 1 file changed, 1 insertion(+)", 10.2, tu, 130, 408, { color: '#64748b' });

      // 4-buyruq: yaratilgan yangi obyektlar va ref (u: 11.4 to 13.0, Enter 13.2)
      drawCommandLine("loyiha $ ", "cat .git/refs/heads/main", 11.4, 13.0, 13.2, tu, 130, 440);
      drawOutputLine("9f648d789a4cb418adeb1b81154a9a74605d6751", 13.5, tu, 130, 464, { color: C.yellow, weight: 600 });
      drawOutputLine("# Branch fayli commit hash'iga ko'rsatib turibdi!", 13.8, tu, 130, 486, { color: C.cyan });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 14.4, tu, 130, 520, { color: '#334155' });
      drawOutputLine("Zanjir: add -> blob + index; commit -> tree + commit + ref!", 14.9, tu, 130, 550, { color: C.green, weight: 700 });
      drawOutputLine("Hech qanday sehr yo'q: oddiy fayllar va SHA-1 hashlar!", 15.3, tu, 130, 575, { color: C.yellow });

      // O'ng panel: Zanjir bosqichlari
      panel(980, 140, 840, 680, C.green, "Ichki Zanjir Qadamlari", "add va commit ostidagi plumbing harakatlari", kBox, kBox);

      const kA1 = P(u, 1.0, 0.5);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1-Qadam: git add (Blob va Index)", 1175, 290, C.green, { size: 16, mono: false });
        text("• Fayl mazmuni zlib bilan siqilib, .git/objects ga blob sifatida yoziladi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• .git/index fayliga fayl nomi, ruxsati va blob hash'i saqlanadi.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Plumbing ekvivalenti: git hash-object -w + git update-index.", 1030, 400, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kA2 = P(u, 6.5, 0.5);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2-Qadam: git commit (Tree va Commit)", 1180, 470, C.blue, { size: 16, mono: false });
        text("• Index'dan tree obyekti (katalog surati) yaratiladi: git write-tree.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Tree, muallif, sana va xabardan commit obyekti yasaladi: git commit-tree.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Yangi commit o'zidan oldingi commitni ota (parent) deb taniydi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kA3 = P(u, 11.5, 0.5);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3-Qadam: Ref va Reflog Yangilanishi", 1190, 655, C.yellow, { size: 16, mono: false });
        text("• .git/refs/heads/main yangi commit hash'iga siljitiladi: git update-ref.", 1030, 700, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• .git/logs/HEAD reflog fayliga ushbu siljish to'liq yozib qo'yiladi.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        text("• Barcha jarayon to'liq va shaffof: Git oddiy fayl tizimidir!", 1030, 765, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: O‘z Git Buyrug‘ingizni Yaratish (SPLIT SCREEN)
  // ==========================================
  function scenePlumbingAmalda(u, bounds, o = {}) {
    chip(5, "O‘z Git Buyrug‘ingizni Yaratish", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda plumbing vositalari va shaxsiy buyruq
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ichki-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git rev-parse va symbolic-ref (u: 0.8 to 2.4, Enter 2.6)
      drawCommandLine("loyiha $ ", "git rev-parse --short HEAD", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("9f648d7  # faqat hash (hech qanday ortiqcha so'zsiz)", 2.9, tu, 130, 230, { color: C.green, weight: 600 });

      drawCommandLine("loyiha $ ", "git symbolic-ref --short HEAD", 3.8, 5.6, 5.8, tu, 130, 260);
      drawOutputLine("main  # joriy branch nomi toza holda", 6.1, tu, 130, 284, { color: C.cyan, weight: 600 });

      // 2-buyruq: shaxsiy skriptni ko'rish (u: 7.2 to 8.6, Enter 8.8)
      drawCommandLine("loyiha $ ", "cat ~/bin/git-holat", 7.2, 8.6, 8.8, tu, 130, 318);
      drawOutputLine("#!/bin/sh", 9.1, tu, 130, 342, { color: '#64748b' });
      drawOutputLine("echo \"branch: $(git symbolic-ref --short HEAD)\"", 9.4, tu, 130, 364, { color: C.yellow });
      drawOutputLine("echo \"commit: $(git rev-parse --short HEAD)\"", 9.7, tu, 130, 386, { color: C.yellow });

      // 3-buyruq: shaxsiy git buyrug'ini ishga tushirish (u: 10.8 to 12.0, Enter 12.2)
      drawCommandLine("loyiha $ ", "git holat", 10.8, 12.0, 12.2, tu, 130, 420);
      drawOutputLine("branch: main", 12.5, tu, 130, 444, { color: C.green, weight: 700 });
      drawOutputLine("commit: 9f648d7", 12.8, tu, 130, 466, { color: C.green, weight: 700 });
      drawOutputLine("# Git uni xuddi o'zining rasmiy buyrug'idek bajardi!", 13.2, tu, 130, 488, { color: C.cyan });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 13.8, tu, 130, 525, { color: '#334155' });
      drawOutputLine("Mexanizm: PATH dagi 'git-<nom>' nomli har qanday fayl", 14.3, tu, 130, 555, { color: C.yellow, weight: 600 });
      drawOutputLine("'git <nom>' sifatida avtomatik ishlaydi!", 14.7, tu, 130, 580, { color: C.green, weight: 700 });
      drawOutputLine("Plumbing barqaror bo'lgani uchun skript hech qachon buzilmaydi.", 15.1, tu, 130, 605, { color: C.mute });

      // O'ng panel: Qoidalar va afzalliklar
      panel(980, 140, 840, 680, C.purple, "Shaxsiy Buyruqlar Yaratish", "PATH orqali Git imkoniyatlarini kengaytirish", kBox, kBox);

      const kM1 = P(u, 1.0, 0.5);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Unix Falsafasi va PATH Qoidasi", 1180, 290, C.purple, { size: 16, mono: false });
        text("• PATH muhit o'zgaruvchisida 'git-holat' nomli bajariladigan fayl bo'lsa:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git uni 'git holat' deb chaqirishga ruxsat beradi.", 1030, 370, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Git'ning o'zidagi 180 ta buyruq ham aynan shu sxemada joylashgan.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kM2 = P(u, 6.5, 0.5);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Skriptlar Uchun Plumbing Kuch-Quvvati", 1210, 470, C.cyan, { size: 16, mono: false });
        text("• rev-parse: branch yoki HEAD nomini toza hash kodga aylantiradi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• symbolic-ref: HEAD ko'rsatib turgan haqiqiy branch nomini oladi.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• cat-file va ls-tree: obyektlar va fayllar tuzilishini to'liq ko'rsatadi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kM3 = P(u, 11.5, 0.5);
      withA(kM3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Kompaniya Standartlari Uchun Qulaylik", 1220, 655, C.green, { size: 16, mono: false });
        text("• Jamoangiz uchun maxsus linter, deploy yoki tekshiruv skriptlarini", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("  Git buyrug'i shaklida tarqatishingiz mumkin.", 1030, 735, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Bu ishlab chiquvchilar tajribasini sezilarli darajada soddalashtiradi.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Keyingi Qadam
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xulosa va Keyingi Qadam", u, 0);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // 3 ta parallel ustun (har biri w=540, h=520, y=140)
      // 1-ustun: Ikki Qatlam
      panel(100, 140, 540, 520, C.yellow, "1 · Ikki Qatlam Vazifasi", "porcelain va plumbing", kBox, kBox);
      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(120, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Vazifalar Taqsimoti", 230, 290, C.yellow, { size: 15, mono: false });
        text("• Porcelain (Chinni)", 140, 340, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Inson uchun qulay, erkin yangilanadi.", 140, 370, { size: 15, color: C.text, align: 'left' });
        text("• Plumbing (Quvurlar)", 140, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Skriptlar uchun 100% barqaror format.", 140, 440, { size: 15, color: C.text, align: 'left' });
        text("• Asboblar Poydevori", 140, 480, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  IDE va GUI plumbing'ga tayanadi.", 140, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 140, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Skriptda faqat plumbing ishlating!", 140, 580, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 2-ustun: .git Yadrosi
      panel(690, 140, 540, 520, C.blue, "2 · .git Yadrosi", "haqiqiy ombor tuzilishi", kBox, kBox);
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(710, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.blue });
        pill("4 Asosiy Ustun", 800, 290, C.blue, { size: 15, mono: false });
        text("• objects/ — Baza", 730, 340, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Barcha blob, tree, commit va teglar.", 730, 370, { size: 15, color: C.text, align: 'left' });
        text("• refs/ — Ko'rsatkichlar", 730, 410, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Branch va teglarning hash fayllari.", 730, 440, { size: 15, color: C.text, align: 'left' });
        text("• HEAD va index", 730, 480, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Faol branch va staging hududi holati.", 730, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 730, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Ishchi fayllar faqat .git dan nusxadir.", 730, 580, { size: 15, color: C.blue, align: 'left' });
        ctx.restore();
      });

      // 3-ustun: Shaxsiy Buyruqlar
      panel(1280, 140, 540, 520, C.green, "3 · Shaxsiy Buyruqlar", "kengaytirish imkoniyati", kBox, kBox);
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1300, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.green });
        pill("O'z Asbobingizni Yaratish", 1400, 290, C.green, { size: 15, mono: false });
        text("• git-<nom> skripti", 1320, 340, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  PATH ga qo'ysangiz Git darhol taniydi.", 1320, 370, { size: 15, color: C.text, align: 'left' });
        text("• rev-parse va symbolic-ref", 1320, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Toza ma'lumot olish vositalari.", 1320, 440, { size: 15, color: C.text, align: 'left' });
        text("• 100% Barqarorlik", 1320, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Yangilanishlarda skript buzilmaydi.", 1320, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 1320, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Murakkab ishlarni avtomatlashtiring!", 1320, 580, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.5, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Obyektlar — Blob va Hash", 290, 725, C.git, { size: 16, mono: false });
        text("Keyingi 14-bobda: Git'ning eng birinchi g‘ishti — Blob obyektlari va SHA-1 hash hisoblash!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("git hash-object bilan fayl mazmunidan obyekt yasash, zlib siqilishi va objects papkasida qidirishni to'liq o'rganamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Git ichki arxitekturasi bilan tanishib, endi uning obyektlar omboriga to'g'ridan-to'g'ri qo'l tekkizamiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'nega_ikki_qatlam', fn: sceneNegaIkkiQatlam },
      { id: 'git_papkasi', fn: sceneGitPapkasi },
      { id: 'add_va_commit_ichida', fn: sceneAddVaCommitIchida },
      { id: 'plumbing_amalda', fn: scenePlumbingAmalda },
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
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();