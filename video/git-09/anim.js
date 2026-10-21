// Git 09-bob videosi: "Tarixni ko'rish: log"
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

  // Terminalda matn va buyruqlarni real yozilish effekti bilan chizish yordamchilari
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
  // 1-SAHNA: Kirish va Loyihaning O'tmish Xaritasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("09-BOB · TARIXNI KO'RISH: LOG", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("git log: Loyihaning O'tmish Xaritasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Kim, qachon, nimani o'zgartirgan va nega — loyihaning to'liq solnomasi", 960, 415, { size: 26, color: C.mute });

        // Markaziy zanjir kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Tarixiy Ota-Ona Zanjiri (Parent Hierarchy)", 960, 530, C.blue, { size: 22 });

          card(410, 580, 240, 110, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
          pill("C1 (Root)", 530, 615, C.mute, { size: 18 });
          text("Ilk poydevor", 530, 655, { size: 15, color: C.mute });

          text("◄── parent", 700, 635, { size: 16, fam: MONO, color: C.yellow, weight: 700 });

          card(760, 580, 240, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("C2 (Feature)", 880, 615, C.blue, { size: 18 });
          text("Yangi funksiya", 880, 655, { size: 15, color: C.text });

          text("◄── parent", 1050, 635, { size: 16, fam: MONO, color: C.yellow, weight: 700 });

          card(1110, 580, 240, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("C3 (HEAD -> main)", 1230, 615, C.green, { size: 18 });
          text("Eng so'nggi holat", 1230, 655, { size: 15, color: C.green, weight: 600 });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Loyihaning Butun O'tmish Xaritasi", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: git log nima beradi?
      panel(100, 140, 840, 680, C.yellow, "git log Nima Beradi?", "yagona haqiqat manbai", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("To'liq O'tmish Solnomasi", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Loyiha boshlangan ilk kundan to hozirgacha bo'lgan barcha commitlar ro'yxati.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir o'zgarishning muallifi, aniq sanasi va nima uchun qilingani saqlanadi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("100% Xavfsiz Tekshiruv (Read-Only)", 265, 470, C.green, { size: 16, mono: false });
        text("• git log hech narsani o'zgartirmaydi, hech narsani o'chirmaydi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Tarixni xohlagan parametrlarda qo'rqmasdan tahlil qilish mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarishlarga Qaytish Kaliti", 235, 655, C.mute, { size: 16, mono: false });
        text("• Har bir commitning noyob SHA-1 xesh kaliti ko'rinadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Shu kalit orqali istalgan paytda o'sha paytdagi holatga qaytish mumkin.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 ta o'lcham
      panel(980, 140, 840, 680, C.blue, "git log ning 3 Asosiy O'lchami", "moslashuvchan qurol imkoniyatlari", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · Ko'rinish Formatlari (Display)", 1170, 290, C.blue, { size: 16, mono: false });
        text("• Har bir commit ekranda qanday formatda chiqishi:", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("  --oneline, --graph, --decorate, maxsus formatlar (--pretty).", 1030, 375, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("2 · Tarkib Tafsilotlari (Content)", 1160, 470, C.purple, { size: 16, mono: false });
        text("• Commit bilan birga uning ichidagi o'zgarishlarni ko'rish:", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("  --stat (qatorlar statistikasi), -p (to'liq kod diff yamoqlari).", 1030, 555, { size: 17, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Filtrlash va Saralash (Filtering)", 1165, 655, C.green, { size: 16, mono: false });
        text("• Minglab commitlar ichidan aynan keraklisini qidirib topish:", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  --author, --since, --grep va mashhur -S (pickaxe kod qidiruvi).", 1030, 740, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega Tarix Orqaga O'qiladi? (SPLIT SCREEN)
  // ==========================================
  function sceneOrqagaYurish(u, bounds, o = {}) {
    chip(2, "Tarixning Orqaga O'qilishi Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda commit obyekti va oddiy log
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/kutubxona (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git cat-file -p HEAD (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("kutubxona $ ", "git cat-file -p HEAD", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("tree 185155ca5c6cfa20d0f03267bdcfcbc1...", 2.9, tu, 130, 230, { color: '#64748b' });
      drawOutputLine("parent 7407e42d087b815d9533da5e4c39a6...", 3.3, tu, 130, 252, { color: C.yellow, weight: 700 });
      drawOutputLine("author Ali Valiyev <ali@example.com>", 3.7, tu, 130, 274, { color: C.green, weight: 600 });
      drawOutputLine("committer Ali Valiyev <ali@example.com>", 4.0, tu, 130, 296, { color: C.green });
      drawOutputLine("Ombor: o'chirish xatti-harakati hujjatlashtirildi", 4.4, tu, 130, 320, { color: C.text, weight: 600 });

      // 2-buyruq: git log -2 (u: 6.5 to 8.0, Enter at 8.2)
      drawCommandLine("kutubxona $ ", "git log -2", 6.5, 8.0, 8.2, tu, 130, 360);
      drawOutputLine("commit 2cc991b9e0224cb1... (HEAD -> main)", 8.5, tu, 130, 388, { color: C.yellow, weight: 700 });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 8.8, tu, 130, 410, { color: '#94a3b8' });
      drawOutputLine("Date:   Tue Oct 6 08:50:00 2026 +0500", 9.1, tu, 130, 432, { color: '#64748b' });
      drawOutputLine("    Ombor: o'chirish xatti-harakati", 9.4, tu, 130, 458, { color: C.text, weight: 600 });

      drawOutputLine("commit 7407e42d087b815d...", 10.0, tu, 130, 490, { color: C.yellow, weight: 700 });
      drawOutputLine("Merge: af7becc 666d7be", 10.3, tu, 130, 512, { color: '#38bdf8', weight: 600 });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 10.6, tu, 130, 534, { color: '#94a3b8' });
      drawOutputLine("    Merge branch 'qisman-qidiruv'", 10.9, tu, 130, 560, { color: C.text, weight: 600 });

      // Izoh
      drawOutputLine("--------------------------------------------------", 11.8, tu, 130, 595, { color: '#334155' });
      drawOutputLine("parent qatori — o'tmishga yo'naltirilgan yagona havola.", 12.3, tu, 130, 625, { color: C.yellow, weight: 600 });
      drawOutputLine("Git tarixni HEAD'dan boshlab yangidan eskiga qarab o'qiydi.", 12.8, tu, 130, 650, { color: C.green });

      // O'ng panel: Mantiqiy tushuntirish
      panel(980, 140, 840, 680, C.purple, "Commit Faqat Ota-Onasini Biladi", "bolalarini emas, faqat o'tmishini", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Commitning Ichki Havolasi (parent)", 1210, 290, C.purple, { size: 16, mono: false });
        text("• Yangi kommit yaratilayotganda oldingi kommit allaqachon mavjud.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Ammo kelajakda qanday kommitlar bo'lishini Git oldindan bilolmaydi.", 1030, 370, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Shu sababli har bir obyekt faqat o'z ota-onasining xeshini saqlaydi.", 1030, 405, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 450, 790, 175, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Nega O'zgarmas (Immutable)?", 1190, 485, C.blue, { size: 16, mono: false });
        text("• Kommit xeshi mazmun, muallif va ota-onadan kriptografik hisoblanadi.", 1030, 530, { size: 17, color: C.text, align: 'left' });
        text("• Keyinchalik unga 'yangi bola paydo bo'ldi' deb yozib bo'lmaydi.", 1030, 565, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• Shu sababli zanjir bo'ylab o'qish faqat bitta yo'nalishda: orqaga!", 1030, 600, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 645, 790, 140, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Teskari Xronologik Tartib", 1170, 680, C.green, { size: 16, mono: false });
        text("git log har doim eng yangi commitni ekranning eng tepasida ko'rsatadi.", 1030, 720, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("HEAD ko'rsatkichi aynan shu zanjirning eng so'nggi uchi hisoblanadi.", 1030, 750, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: oneline va graph Formatlari (SPLIT SCREEN)
  // ==========================================
  function sceneFormatlar(u, bounds, o = {}) {
    chip(3, "oneline va graph Formatlari Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda oneline va graph
      terminal(100, 140, 840, 680, {
        title: 'bash — git log formatlari (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git log --oneline -4 (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("kutubxona $ ", "git log --oneline -4", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("2cc991b (HEAD -> main) Ombor: o'chirish hujjati", 2.9, tu, 130, 235, { color: C.yellow, weight: 700 });
      drawOutputLine("7407e42 Merge branch 'qisman-qidiruv'", 3.3, tu, 130, 258, { color: '#38bdf8', weight: 600 });
      drawOutputLine("3c9796e README: o'rnatish bo'limi", 3.7, tu, 130, 281, { color: C.text });
      drawOutputLine("ff60b08 Ombor: kitobni o'chirish funksiyasi", 4.1, tu, 130, 304, { color: C.mute });

      // 2-buyruq: git log --graph --oneline --all (u: 6.0 to 8.2, Enter at 8.5)
      drawCommandLine("kutubxona $ ", "git log --graph --oneline --all -6", 6.0, 8.2, 8.5, tu, 130, 345);
      drawOutputLine("*   7407e42 (HEAD -> main) Merge branch 'qidiruv'", 8.8, tu, 130, 375, { color: C.green, weight: 700 });
      drawOutputLine("|\\  ", 9.1, tu, 130, 398, { color: C.yellow, weight: 700 });
      drawOutputLine("| * 666d7be (qidiruv) Qisman qidiruv qo'shildi", 9.4, tu, 130, 421, { color: C.yellow, weight: 600 });
      drawOutputLine("* | af7becc Yangi testlar va tekshiruvlar", 9.7, tu, 130, 444, { color: '#38bdf8' });
      drawOutputLine("|/  ", 10.0, tu, 130, 467, { color: C.yellow, weight: 700 });
      drawOutputLine("* 3198b44 Boshlang'ich arxitektura poydevori", 10.3, tu, 130, 490, { color: C.mute });

      // Izoh
      drawOutputLine("--------------------------------------------------", 11.2, tu, 130, 528, { color: '#334155' });
      drawOutputLine("--graph tarmoqlar qayerda ajralib, qayerda", 11.7, tu, 130, 558, { color: C.yellow, weight: 600 });
      drawOutputLine("birlashganini ASCII chiziqlari bilan yaqqol ko'rsatadi.", 12.2, tu, 130, 583, { color: C.text });
      drawOutputLine("Buni dasturchilar ko'pincha 'git adog' deb alias qilishadi.", 12.7, tu, 130, 610, { color: C.green, weight: 600 });

      // O'ng panel: Formatlar tahlili
      panel(980, 140, 840, 680, C.green, "Formatlar va Vizual Daraxt", "tezkor ko'rinish va tarmoqlar", kBox, kBox);

      const kF1 = P(u, 1.0, 0.5);
      withA(kF1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kF1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("--oneline (Ixcham Bitta Qator)", 1180, 290, C.yellow, { size: 16, mono: false });
        text("• Standart uzun commit yozuvini ixcham bitta qatorga keltiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• 7 belgili qisqa SHA xesh va xabarning birinchi sarlavha qatori.", 1030, 370, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Yuzlab commitlar ichidan keraklisini tezkor topish uchun eng qulay.", 1030, 405, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kF2 = P(u, 6.5, 0.5);
      withA(kF2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kF2)) * 16);
        card(1005, 450, 790, 175, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("--graph (Tarmoqlar Daraxti)", 1170, 485, C.green, { size: 16, mono: false });
        text("• Branchlarning ajralishi va merge bo'lishini chiroyli daraxtda chizadi.", 1030, 530, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi brench qayerdan boshlanib, qayerda tugaganini ko'rsatadi.", 1030, 565, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Jamoa bilan ishlaganda murakkab tarixni tushunishni osonlashtiradi.", 1030, 600, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kF3 = P(u, 11.5, 0.5);
      withA(kF3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kF3)) * 16);
        card(1005, 645, 790, 140, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("--all va --decorate", 1150, 680, C.blue, { size: 16, mono: false });
        text("• --all        -> barcha local va remote branchlarni qamrab oladi.", 1030, 720, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("• --decorate   -> har bir commitdagi teg va branch nomlarini ko'rsatadi.", 1030, 750, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Tarkibni Ko'rish: stat va patch (-p) (SPLIT SCREEN)
  // ==========================================
  function sceneTarkib(u, bounds, o = {}) {
    chip(4, "Tarkibni Ko'rish: stat va patch (-p)", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda stat va patch
      terminal(100, 140, 840, 680, {
        title: 'bash — git log tarkibi (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 16.0 : u;

      // 1-buyruq: git log --stat -1 (u: 0.8 to 2.2, Enter at 2.4)
      drawCommandLine("kutubxona $ ", "git log --stat -1", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("commit 2cc991b (HEAD -> main)", 2.6, tu, 130, 230, { color: C.yellow, weight: 700 });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 2.9, tu, 130, 252, { color: '#94a3b8' });
      drawOutputLine(" src/ombor.py | 4 ++--", 3.2, tu, 130, 276, { color: '#f59e0b', weight: 600 });
      drawOutputLine(" README.md    | 1 +", 3.5, tu, 130, 298, { color: C.green, weight: 600 });
      drawOutputLine(" 2 files changed, 3 insertions(+), 2 deletions(-)", 3.8, tu, 130, 322, { color: '#38bdf8', weight: 700 });

      // 2-buyruq: git log -p -1 (u: 5.5 to 7.0, Enter at 7.2)
      drawCommandLine("kutubxona $ ", "git log -p -1", 5.5, 7.0, 7.2, tu, 130, 360);
      drawOutputLine("diff --git a/src/ombor.py b/src/ombor.py", 7.5, tu, 130, 388, { color: '#64748b' });
      drawOutputLine("@@ -16,3 +16,3 @@ def ochirish(nom):", 7.8, tu, 130, 410, { color: '#38bdf8' });
      drawOutputLine("-    # TODO: bir xil nomli kitoblar bo'lsa?", 8.1, tu, 130, 434, { color: C.red, weight: 700 });
      drawOutputLine("+    \"\"\"Shu nomdagi hamma kitobni o'chiradi.\"\"\"", 8.4, tu, 130, 458, { color: C.green, weight: 700 });
      drawOutputLine("     kitoblar[:] = [k for k in kitoblar if k.nom != nom]", 8.7, tu, 130, 482, { color: '#94a3b8' });

      // Izoh
      drawOutputLine("--------------------------------------------------", 9.5, tu, 130, 520, { color: '#334155' });
      drawOutputLine("--stat: qaysi fayllar va qancha qator o'zgargani.", 10.0, tu, 130, 550, { color: '#38bdf8', weight: 600 });
      drawOutputLine("-p: xuddi har commit uchun diff qilingandek kod kesimi.", 10.5, tu, 130, 575, { color: C.green, weight: 600 });
      drawOutputLine("Bitta fayl tarixini ko'rish: $ git log -p -- src/ombor.py", 11.0, tu, 130, 605, { color: C.yellow });

      // O'ng panel: Tarkib tahlili
      panel(980, 140, 840, 680, C.blue, "stat va patch (-p) Tahlili", "qatorlar soni vs aniq kod", kBox, kBox);

      const kT1 = P(u, 1.0, 0.5);
      withA(kT1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("--stat (Diffstat Statistikasi)", 1200, 290, C.blue, { size: 16, mono: false });
        text("• Kodning ichiga kirmasdan umumiy hajmni baholash uchun ayni muddao.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi fayllar o'zgargani va ulardagi + va - balansi.", 1030, 370, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• Qisqa variantlari: '--shortstat' yoki faqat nomlar '--name-status'.", 1030, 405, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kT2 = P(u, 6.0, 0.5);
      withA(kT2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT2)) * 16);
        card(1005, 450, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("-p, --patch (To'liq Kod Diff)", 1210, 485, C.green, { size: 16, mono: false });
        text("• Har bir commit kiritgan aniq qatorlarni patch ko'rinishida chiqaradi.", 1030, 530, { size: 17, color: C.text, align: 'left' });
        text("• O'chirilgan (-) va qo'shilgan (+) qatorlarni to'liq fosh qiladi.", 1030, 565, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Code review va xatolarni chuqur tahlil qilishning eng asosiy usuli.", 1030, 600, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kT3 = P(u, 11.0, 0.5);
      withA(kT3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT3)) * 16);
        card(1005, 650, 790, 135, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Fayl Bo'yicha Cheklash", 1160, 685, C.yellow, { size: 16, mono: false });
        text("$ git log -p -- <fayl>   -> faqat shu fayl o'zgarishlari tarixi", 1030, 730, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Kuchli Qidiruv va Filtrlar (SPLIT SCREEN)
  // ==========================================
  function sceneQidiruvVaFiltr(u, bounds, o = {}) {
    chip(5, "Kuchli Qidiruv va Filtrlar Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda qidiruv va show
      terminal(100, 140, 840, 680, {
        title: 'bash — qidiruv va git show (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git log --author="Ali" --oneline -2 (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("kutubxona $ ", "git log --author='Ali' --oneline -2", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("2cc991b Ombor: o'chirish xatti-harakati", 2.9, tu, 130, 235, { color: C.green, weight: 600 });
      drawOutputLine("7407e42 Merge branch 'qisman-qidiruv'", 3.2, tu, 130, 258, { color: C.green, weight: 600 });

      // 2-buyruq: git log -S "def ochirish" (u: 5.0 to 6.8, Enter at 7.0)
      drawCommandLine("kutubxona $ ", "git log -S 'def ochirish' --oneline", 5.0, 6.8, 7.0, tu, 130, 295);
      drawOutputLine("ff60b08 Ombor: kitobni o'chirish funksiyasi", 7.3, tu, 130, 325, { color: '#38bdf8', weight: 700 });
      drawOutputLine("(Aynan shu funksiya qachon kiritilgani topildi!)", 7.8, tu, 130, 350, { color: C.yellow });

      // 3-buyruq: git show ff60b08 --stat (u: 9.2 to 11.0, Enter at 11.2)
      drawCommandLine("kutubxona $ ", "git show ff60b08 --stat", 9.2, 11.0, 11.2, tu, 130, 390);
      drawOutputLine("commit ff60b080f955... (Ali Valiyev, 2026-10-04)", 11.5, tu, 130, 420, { color: C.yellow, weight: 600 });
      drawOutputLine("    Ombor: kitobni o'chirish funksiyasi", 11.8, tu, 130, 442, { color: C.text, weight: 600 });
      drawOutputLine(" src/ombor.py | 8 ++++++++", 12.1, tu, 130, 466, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 8 insertions(+)", 12.4, tu, 130, 490, { color: '#38bdf8', weight: 700 });

      // Izoh
      drawOutputLine("--------------------------------------------------", 13.0, tu, 130, 528, { color: '#334155' });
      drawOutputLine("-S (Pickaxe) xabarni emas, KODNING ICHINI qidiradi!", 13.5, tu, 130, 558, { color: C.green, weight: 700 });
      drawOutputLine("git show esa aynan bitta commitni to'liq ochib beradi.", 14.0, tu, 130, 583, { color: '#38bdf8' });

      // O'ng panel: Qidiruv tahlili
      panel(980, 140, 840, 680, C.purple, "Kuchli Qidiruv Qurollari", "author, since, pickaxe va show", kBox, kBox);

      const kS1 = P(u, 1.0, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Metama'lumotlar Bo'yicha Filtrlar", 1210, 290, C.purple, { size: 16, mono: false });
        text("• --author='Ali'      -> faqat shu dasturchining commitlari.", 1030, 335, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• --since='2.weeks'   -> oxirgi 2 haftadagi o'zgarishlar.", 1030, 370, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• --grep='tuzatish'   -> xabarida shu so'z bo'lgan commitlar.", 1030, 405, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 6.5, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 450, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("-S <satr> (Pickaxe: Kod Ichidan Qidiruv)", 1230, 485, C.green, { size: 16, mono: false });
        text("• Bu parametr commit xabarini emas, KODNING O'ZINI qidiradi!", 1030, 530, { size: 17, color: C.green, align: 'left', weight: 700 });
        text("• Ma'lum bir funksiya yoki o'zgaruvchi qachon kiritilganini topadi.", 1030, 565, { size: 17, color: C.text, align: 'left' });
        text("• Regressiya va xatolarni qidirishda beqiyos qurol.", 1030, 600, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kS3 = P(u, 11.5, 0.5);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(1005, 650, 790, 135, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("git show: Muayyan Bitta Obyekt", 1190, 685, C.blue, { size: 16, mono: false });
        text("$ git show <commit_hash>   -> bitta commitning to'liq diff'i", 1030, 730, { size: 16, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: git log Buyruqlari Xaritasi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta xulosa paneli
      panel(100, 140, 1720, 500, C.blue, "Tarixni Tahlil Qilish Xaritasi", "kundalik ehtiyojlar uchun eng yaxshi buyruqlar", kBase, kBase);

      const kMap = P(u, 0.8, 0.6);
      withA(kMap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMap)) * 16);

        // 3 blok
        // Blok 1: --oneline --graph (x=140)
        card(140, 260, 480, 210, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill("Tezkor Manzara", 380, 305, C.yellow, { size: 20 });
        text("git log --oneline --graph", 380, 350, { size: 17, fam: MONO, weight: 700, color: C.yellow });
        text("Tarmoqlar va brenchlar daraxti", 380, 385, { size: 15, color: C.text });
        text("Kundalik eng ko'p ishlatiladigan ko'rinish", 380, 420, { size: 15, color: C.mute });

        // Blok 2: stat va patch (x=680)
        card(680, 260, 560, 210, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("Tarkib Tafsilotlari", 960, 305, C.blue, { size: 20 });
        text("git log --stat   va   git log -p", 960, 350, { size: 17, fam: MONO, weight: 700, color: '#38bdf8' });
        text("Fayllar statistikasi va aniq kod farqlari", 960, 385, { size: 15, color: C.text });
        text("Xatolarni kod kesimida aniqlash", 960, 420, { size: 15, color: C.mute });

        // Blok 3: Qidiruv va show (x=1300)
        card(1300, 260, 480, 210, { fill: 'rgba(52,211,153,0.10)', col: C.green, lw: 2 });
        pill("Aniq Qidiruv va Tekshiruv", 1540, 305, C.green, { size: 20 });
        text("git log -S va git show", 1540, 350, { size: 17, fam: MONO, weight: 700, color: C.green });
        text("Funksiyani kod ichidan qidirib topish", 1540, 385, { size: 15, color: C.text });
        text("Bitta commitni to'liq tekshirish", 1540, 420, { size: 15, color: C.mute });

        // Qo'shimcha qulay buyruqlar
        card(140, 490, 1640, 125, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qo'shimcha Qulay Buyruqlar", 300, 520, C.mute, { size: 16, mono: false });
        text("• $ git shortlog -sn             -> Mualliflar bo'yicha commitlar soni reytingi", 170, 558, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("• $ git log --since='2.weeks'    -> Oxirgi 2 haftada kiritilgan barcha o'zgarishlar", 170, 588, { size: 16, fam: MONO, color: C.green, align: 'left' });

        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 4.0, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Yaxshi Commit Yozish Madaniyati", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 10-bobda loyihaning tarixi chiroyli va tushunarli bo'lishi uchun commitlarni qanday yozishni o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("git log — o'tmishni unutmaslik va loyihani ishonch bilan oldinga boshlash kalitidir.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'orqaga_yurish', fn: sceneOrqagaYurish },
      { id: 'formatlar', fn: sceneFormatlar },
      { id: 'tarkib', fn: sceneTarkib },
      { id: 'qidiruv_va_filtr', fn: sceneQidiruvVaFiltr },
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
