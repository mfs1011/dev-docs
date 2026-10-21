// Git 08-bob videosi: ".gitignore, rm va mv"
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
  // 1-SAHNA: Kirish va Loyihani Toza Saqlash
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("08-BOB · .GITIGNORE, RM VA MV", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Loyihani Toza Saqlash", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Keraksiz fayllar, maxfiy kalitlar va xotira shishishidan himoya vositalari", 960, 415, { size: 26, color: C.mute });

        // Markaziy 3 qurol kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Loyihani Tartibga Soluvchi 3 Asosiy Qurol", 960, 530, C.blue, { size: 22 });

          card(410, 580, 320, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill(".gitignore", 570, 615, C.yellow, { size: 18 });
          text("Keraksizni chetlab o'tish", 570, 655, { size: 16, color: C.text });

          text("──►", 780, 635, { size: 20, fam: MONO, color: C.blue, weight: 700 });

          card(830, 580, 320, 110, { fill: 'rgba(255,107,107,0.10)', col: C.red });
          pill("git rm", 990, 615, C.red, { size: 18 });
          text("Ombordan olib tashlash", 990, 655, { size: 16, color: C.text });

          text("──►", 1200, 635, { size: 20, fam: MONO, color: C.green, weight: 700 });

          card(1250, 580, 270, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("git mv", 1385, 615, C.blue, { size: 18 });
          text("Xavfsiz ko'chirish", 1385, 655, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Loyihani Toza Saqlashning 3 Quroli", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Nega hamma narsa saqlanmaydi?
      panel(100, 140, 840, 680, C.yellow, "Nega Git Hamma Narsani Saqlamaydi?", "ortiqcha yuk va xavflar", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Ombor Shishishi (Bloat)", 250, 290, C.yellow, { size: 16, mono: false });
        text("• node_modules/, build/ yoki log'lar Git tarixini gigabaytlarga oshiradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git doim yangi snapshot qo'shadi, generatsiya fayllari hech qachon yo'qolmaydi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("2 · Maxfiy Kalitlar Xavfsizligi", 260, 470, C.red, { size: 16, mono: false });
        text("• .env faylidagi parollar, API tokenlar commitga tushib qolsa jiddiy xavf tug'iladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ularni tarixdan butunlay o'chirish o'ta og'ir va xatarli amaliyotdir.", 150, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3 · Ma'nosiz Birlashish Konfliktlari", 280, 655, C.mute, { size: 16, mono: false });
        text("• Dasturchilarning shaxsiy sozlamalari va build fayllari to'qnashadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• .gitignore esa butun jamoa uchun yagona filtr qoidalarini belgilaydi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 vosita vazifasi
      panel(980, 140, 840, 680, C.blue, "Uch Vositaning Chegaralari", "qaysi qurol qachon ishlatiladi", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill(".gitignore — Ko'rinmaslik Qoidasi", 1190, 290, C.yellow, { size: 16, mono: false });
        text("• Gitga 'bu fayllarni umuman ko'rma' deb aytadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Faqat UNTRACKED fayllarga ta'sir qiladi! Tracked faylga ta'sir qilmaydi.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("git rm — Repodan Olib Tashlash", 1180, 470, C.red, { size: 16, mono: false });
        text("• Kuzatilayotgan faylni indexdan (va xohlasangiz diskdan) o'chiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• --cached opsiyasi orqali faylni diskda saqlab, faqat Gitdan chiqarish mumkin.", 1030, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("git mv — Qayta Nomlash va Ko'chirish", 1200, 655, C.blue, { size: 16, mono: false });
        text("• Faylni ko'chirish yoki nomini o'zgartirishni bitta qadamda bajaradi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• O'zgarishni darhol Staged (renamed) qilib tayyorlab qo'yadi.", 1030, 740, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: .gitignore Qoidalari (SPLIT SCREEN)
  // ==========================================
  function sceneGitignoreQoidalari(u, bounds, o = {}) {
    chip(2, ".gitignore Pattern Sintaksisi Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda .gitignore faylini ochib ko'rish
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: cat .gitignore (u: 0.8 to 2.2, Enter at 2.4)
      drawCommandLine("loyiha $ ", "cat .gitignore", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("# kompilyatsiya va kutubxonalar", 2.6, tu, 130, 230, { color: '#64748b' });
      drawOutputLine("*.[oa]", 2.9, tu, 130, 252, { color: '#38bdf8', weight: 600 });
      drawOutputLine("!lib.a", 3.2, tu, 130, 274, { color: C.green, weight: 700 });
      drawOutputLine("build/", 3.5, tu, 130, 296, { color: C.yellow, weight: 600 });
      drawOutputLine("node_modules/", 3.8, tu, 130, 318, { color: C.yellow, weight: 600 });
      drawOutputLine("# maxfiy sozlamalar va loglar", 4.1, tu, 130, 340, { color: '#64748b' });
      drawOutputLine(".env", 4.4, tu, 130, 362, { color: C.red, weight: 700 });
      drawOutputLine("logs/", 4.7, tu, 130, 384, { color: C.yellow });

      // 2-buyruq: git status -s (u: 6.5 to 8.0, Enter at 8.2)
      drawCommandLine("loyiha $ ", "git status -s", 6.5, 8.0, 8.2, tu, 130, 420);
      drawOutputLine("?? .gitignore       # yangi filtr qoidalari fayli", 8.5, tu, 130, 448, { color: C.green, weight: 600 });
      drawOutputLine("?? src/app.js       # dastur kodi (ko'rinib turibdi)", 8.9, tu, 130, 472, { color: C.green, weight: 600 });
      drawOutputLine("?? lib.a            # !lib.a sababli qaytarildi", 9.3, tu, 130, 496, { color: C.cyan, weight: 600 });

      // Izoh
      drawOutputLine("--------------------------------------------------", 10.0, tu, 130, 530, { color: '#334155' });
      drawOutputLine("E'tibor bering: .env, build/ va *.o fayllar", 10.5, tu, 130, 560, { color: C.yellow, weight: 600 });
      drawOutputLine("statusda chiqmaydi — Git ularni butunlay chetlab o'tdi!", 11.0, tu, 130, 585, { color: C.mute });
      drawOutputLine(".gitignore faylining o'zi esa commit qilinishi shart.", 11.5, tu, 130, 615, { color: C.green, weight: 600 });

      // O'ng panel: Qoidalar tahlili
      panel(980, 140, 840, 680, C.yellow, "Pattern Qoidalari Tahlili", "shablonlar qanday ishlaydi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("*.[oa] va Joker Belgilar (*, ?)", 1210, 290, C.yellow, { size: 16, mono: false });
        text("• *.[oa]  -> barcha .o va .a kengaytmali fayllarni ushlaydi.", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• Yulduzcha (*) har qanday belgilarni, so'roq (?) bitta belgini bildiradi.", 1030, 370, { size: 16, color: C.yellow, align: 'left' });
        text("• Agar '/' belgisi bo'lmasa, har qanday ichki papkadan qidiradi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("/TODO va build/ (Slesh Ahamiyati)", 1200, 470, C.blue, { size: 16, mono: false });
        text("• /TODO   -> faqat loyiha ILDIZIDAGI TODO faylini ushlaydi (sub/TODO emas).", 1030, 515, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• build/  -> oxirida slesh bo'lsa, faqat shu nomdagi PAPKA va uning ichi.", 1030, 550, { size: 16, color: '#38bdf8', align: 'left' });
        text("• doc/**/*.pdf -> doc ichidagi barcha pdf fayllarni cheksiz chuqurlikda.", 1030, 580, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("! (Inkor) va Ota Papka Cheklovi", 1210, 655, C.green, { size: 16, mono: false });
        text("• !lib.a  -> oldingi qoida ignore qilgan faylni qaytadan ochadi.", 1030, 700, { size: 17, fam: MONO, color: C.green, align: 'left' });
        text("• MUHIM: agar ota papka ('logs/') butunlay chiqarilgan bo'lsa,", 1030, 735, { size: 16, color: C.text, align: 'left' });
        text("  ichidagi '!logs/keep.log' ishlamaydi! ('logs/*' deb yozish lozim).", 1030, 765, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git check-ignore (SPLIT SCREEN)
  // ==========================================
  function sceneCheckIgnore(u, bounds, o = {}) {
    chip(3, "git check-ignore: Nega Ko'rinmayapti?", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Haqiqiy Terminalda check-ignore
      terminal(100, 140, 840, 680, {
        title: 'bash — git check-ignore (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git check-ignore -v .env (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("loyiha $ ", "git check-ignore -v .env", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine(".gitignore:7:.env    .env", 2.9, tu, 130, 235, { color: C.green, weight: 700 });
      drawOutputLine("(Aniq javob: .gitignore ning 7-qatori to'smoqda!)", 3.4, tu, 130, 260, { color: '#38bdf8' });

      // 2-buyruq: git check-ignore -v build/out.js (u: 5.0 to 6.8, Enter at 7.0)
      drawCommandLine("loyiha $ ", "git check-ignore -v build/out.js", 5.0, 6.8, 7.0, tu, 130, 295);
      drawOutputLine(".gitignore:4:build/    build/out.js", 7.3, tu, 130, 325, { color: C.green, weight: 700 });

      // 3-buyruq: git status -s --ignored (u: 9.0 to 11.0, Enter at 11.2)
      drawCommandLine("loyiha $ ", "git status -s --ignored", 9.0, 11.0, 11.2, tu, 130, 365);
      drawOutputLine("?? .gitignore", 11.5, tu, 130, 395, { color: C.green, weight: 600 });
      drawOutputLine("?? src/app.js", 11.8, tu, 130, 420, { color: C.green, weight: 600 });
      drawOutputLine("!! .env             # yashirilgan maxfiy fayl", 12.2, tu, 130, 448, { color: '#c084fc', weight: 700 });
      drawOutputLine("!! build/           # chetlab o'tilgan build papkasi", 12.6, tu, 130, 473, { color: '#c084fc', weight: 700 });
      drawOutputLine("!! node_modules/    # kutubxonalar papkasi", 13.0, tu, 130, 498, { color: '#c084fc', weight: 700 });
      drawOutputLine("!! logs/app.log     # log fayli", 13.4, tu, 130, 523, { color: '#c084fc', weight: 700 });

      // Xulosa izohi
      drawOutputLine("--------------------------------------------------", 14.0, tu, 130, 560, { color: '#334155' });
      drawOutputLine("'!!' belgisi — qoidaga tushgan barcha fayllarni ko'rsatadi.", 14.5, tu, 130, 590, { color: C.yellow, weight: 600 });
      drawOutputLine("Chiqish kodi: 0 — ignore qilingan, 1 — mos kelmagan.", 15.0, tu, 130, 615, { color: C.mute });

      // O'ng panel: check-ignore tahlili
      panel(980, 140, 840, 680, C.purple, "check-ignore va --ignored Mantiqi", "fayl nega ko'rinmayapti?", kBox, kBox);

      const kD1 = P(u, 1.0, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("check-ignore -v (Detektiv Qurol)", 1210, 290, C.purple, { size: 16, mono: false });
        text("• 'Faylim statusda yo'q, nega?' degan savolga eng aniq javob.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi fayl, qaysi qator va qaysi shablon to'sayotganini ko'rsatadi.", 1030, 370, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• Katta jamoalarda murakkab qoidalarni tekshirish uchun zarur.", 1030, 405, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kD2 = P(u, 6.5, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(1005, 450, 790, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("--no-index Opsiyasi", 1150, 485, C.green, { size: 16, mono: false });
        text("• Standart holatda tracked fayllarni tekshirmaydi.", 1030, 530, { size: 17, color: C.text, align: 'left' });
        text("• Allaqachon commit qilib bo'lingan faylga nisbatan qoidani", 1030, 565, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("  tekshirmoqchi bo'lsangiz: $ git check-ignore -v --no-index fayl", 1030, 595, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kD3 = P(u, 11.5, 0.5);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 16);
        card(1005, 640, 790, 145, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git status --ignored", 1160, 675, C.yellow, { size: 16, mono: false });
        text("• E'tiborsiz qoldirilgan barcha fayllarni bir zumda ro'yxatlaydi.", 1030, 715, { size: 17, color: C.text, align: 'left' });
        text("• Keraksiz yoki adashib tushgan fayllar yo'qligini tekshirish usuli.", 1030, 750, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git rm va --cached Sehri (SPLIT SCREEN)
  // ==========================================
  function sceneGitRm(u, bounds, o = {}) {
    chip(4, "git rm va --cached Sehrli Kuchi", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda git rm amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'bash — git rm amaliyoti (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git rm eski_fayl.txt (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("loyiha $ ", "git rm eski_fayl.txt", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("rm 'eski_fayl.txt'", 2.8, tu, 130, 235, { color: C.red, weight: 600 });

      // 2-buyruq: git status -s (u: 3.8 to 5.0, Enter at 5.2)
      drawCommandLine("loyiha $ ", "git status -s", 3.8, 5.0, 5.2, tu, 130, 270);
      drawOutputLine("D  eski_fayl.txt    (ham diskdan, ham indexdan o'chdi)", 5.5, tu, 130, 300, { color: C.red, weight: 700 });

      // 3-buyruq: git rm --cached .env (u: 7.2 to 9.2, Enter at 9.5)
      drawCommandLine("loyiha $ ", "git rm --cached .env", 7.2, 9.2, 9.5, tu, 130, 345);
      drawOutputLine("rm '.env'", 9.8, tu, 130, 375, { color: '#38bdf8', weight: 700 });

      // 4-buyruq: git status -s (u: 11.0 to 12.2, Enter at 12.4)
      drawCommandLine("loyiha $ ", "git status -s", 11.0, 12.2, 12.4, tu, 130, 415);
      drawOutputLine("D  .env    # Index'dan olindi (keyingi commitda o'chadi)", 12.7, tu, 130, 445, { color: C.red, weight: 700 });
      drawOutputLine("?? .env    # Ammo fayl DISKDA BUTUN SAQLANIB QOLDI!", 13.1, tu, 130, 470, { color: C.green, weight: 700 });

      // Izoh
      drawOutputLine("--------------------------------------------------", 13.8, tu, 130, 508, { color: '#334155' });
      drawOutputLine("Endi .env ni .gitignore ga qo'shib commit qilinsa:", 14.2, tu, 130, 538, { color: C.yellow, weight: 600 });
      drawOutputLine("fayl kompyuteringizda yashaydi, ammo repo'ga kirmaydi!", 14.6, tu, 130, 563, { color: C.green, weight: 600 });

      // O'ng panel: rm va --cached qoidalari
      panel(980, 140, 840, 680, C.green, "git rm va --cached Sehri", "diskda qoldirib, Gitdan chiqarish", kBox, kBox);

      const kC1 = P(u, 1.0, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("Standart git rm (Disk + Index)", 1210, 290, C.red, { size: 16, mono: false });
        text("• Faylni ham ishchi papkadan, ham Git indexidan o'chiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• O'chirish darhol Staged bo'ladi (D yorlig'i bilan).", 1030, 370, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Saqlanmagan o'zgarish bo'lsa, xavfsizlik uchun rad etadi (-f kerak).", 1030, 405, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 7.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 450, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oltin Yechim: git rm --cached", 1210, 485, C.green, { size: 16, mono: false });
        text("• Muammo: .env fayli adashib commit qilib qo'yildi.", 1030, 530, { size: 17, color: C.text, align: 'left' });
        text("• Diskdan o'chirib bo'lmaydi — loyihaning ishlashi uchun zarur!", 1030, 565, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Yechim: $ git rm --cached .env  ->  faqat Git kuzatuvidan oladi!", 1030, 600, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kC3 = P(u, 12.0, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 655, 790, 130, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Papkalarni O'chirish (-r)", 1160, 690, C.blue, { size: 16, mono: false });
        text("$ git rm -r log/     va     $ git rm -n log/*.log", 1030, 735, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: git mv: Ko'chirish va Qayta Nomlash (SPLIT SCREEN)
  // ==========================================
  function sceneGitMv(u, bounds, o = {}) {
    chip(5, "git mv: Ko'chirish va Qayta Nomlash", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda git mv amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'bash — git mv amaliyoti (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 16.0 : u;

      // 1-buyruq: git mv README.md README (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("loyiha $ ", "git mv README.md README", 0.8, 2.4, 2.6, tu, 130, 205);

      // 2-buyruq: git status -s (u: 3.5 to 4.8, Enter at 5.0)
      drawCommandLine("loyiha $ ", "git status -s", 3.5, 4.8, 5.0, tu, 130, 245);
      drawOutputLine("R  README.md -> README  (staged, commitga tayyor!)", 5.3, tu, 130, 275, { color: C.green, weight: 700 });

      // 3-buyruq: git mv docs/*.txt archive/ (u: 7.0 to 9.0, Enter at 9.3)
      drawCommandLine("loyiha $ ", "git mv docs/*.txt archive/", 7.0, 9.0, 9.3, tu, 130, 320);

      // 4-buyruq: git status -s (u: 10.5 to 11.8, Enter at 12.0)
      drawCommandLine("loyiha $ ", "git status -s", 10.5, 11.8, 12.0, tu, 130, 360);
      drawOutputLine("R  docs/intro.txt -> archive/intro.txt", 12.3, tu, 130, 390, { color: C.green, weight: 600 });
      drawOutputLine("R  docs/usage.txt -> archive/usage.txt", 12.6, tu, 130, 415, { color: C.green, weight: 600 });

      // Izoh
      drawOutputLine("--------------------------------------------------", 13.2, tu, 130, 455, { color: '#334155' });
      drawOutputLine("Git fayl nomiga emas, uning MAZMUNIGA qaraydi.", 13.6, tu, 130, 485, { color: '#38bdf8', weight: 600 });
      drawOutputLine("Fayl qayerga ko'chsa ham, uning butun tarixi saqlanadi!", 14.0, tu, 130, 510, { color: C.text });

      // O'ng panel: git mv afzalliklari
      panel(980, 140, 840, 680, C.blue, "Bitta Buyruqda 3 Amaliyot", "git mv ning afzalliklari", kBox, kBox);

      const kM1 = P(u, 1.0, 0.5);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 16);
        card(1005, 255, 790, 220, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Qo'lda Bajarish vs git mv", 1180, 290, C.blue, { size: 16, mono: false });
        text("Agar qo'lda qilsangiz, uchta buyruq kerak bo'lardi:", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("1. $ mv eski.md yangi.md     (diskda nomini o'zgartirish)", 1030, 370, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("2. $ git rm eski.md          (eski nomni indexdan o'chirish)", 1030, 400, { size: 16, fam: MONO, color: C.red, align: 'left' });
        text("3. $ git add yangi.md        (yangi faylni stage qilish)", 1030, 430, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kM2 = P(u, 6.5, 0.5);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 16);
        card(1005, 495, 790, 200, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Kontent Xeshi (SHA-1 Blob)", 1150, 530, C.purple, { size: 16, mono: false });
        text("• Git faylning nomini emas, uning ichidagi MAZMUNINI saqlaydi.", 1030, 575, { size: 17, color: C.text, align: 'left' });
        text("• Fayl boshqa papkaga ko'chsa ham, uning blobi o'zgarmaydi.", 1030, 610, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Natijada faylning butun commit tarixi uzilmasdan qoladi!", 1030, 645, { size: 17, color: '#38bdf8', align: 'left', weight: 700 });
        ctx.restore();
      });

      const kM3 = P(u, 11.5, 0.5);
      withA(kM3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM3)) * 16);
        card(1005, 715, 790, 85, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        text("Bir nechta faylni papkaga: $ git mv fayl1 fayl2 papka/", 1030, 765, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Asosiy Qoidalar", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta xulosa paneli
      panel(100, 140, 1720, 500, C.blue, "Loyihani Tartibga Solish Xaritasi", "qaysi qurol nimaga javob beradi", kBase, kBase);

      const kMap = P(u, 0.8, 0.6);
      withA(kMap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMap)) * 16);

        // 3 blok
        // Blok 1: .gitignore (x=140)
        card(140, 260, 480, 210, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill(".gitignore", 380, 305, C.yellow, { size: 20 });
        text("Keraksizlarni Yashirish", 380, 350, { size: 18, weight: 700, color: C.text });
        text("Faqat Untracked Fayllarga", 380, 385, { size: 15, fam: MONO, color: C.mute });
        text("Ombor shishishidan saqlaydi", 380, 420, { size: 16, color: C.yellow, weight: 600 });

        // Blok 2: git rm --cached (x=680)
        card(680, 260, 560, 210, { fill: 'rgba(255,107,107,0.10)', col: C.red, lw: 2 });
        pill("git rm va --cached", 960, 305, C.red, { size: 20 });
        text("Ombordan Olib Tashlash", 960, 350, { size: 18, weight: 700, color: C.text });
        text("Diskda Qoldirib, Gitdan Chiqarish", 960, 385, { size: 15, fam: MONO, color: C.mute });
        text("Maxfiy .env xatolarining yechimi", 960, 420, { size: 16, color: C.red, weight: 600 });

        // Blok 3: git mv (x=1300)
        card(1300, 260, 480, 210, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("git mv", 1540, 305, C.blue, { size: 20 });
        text("Xavfsiz Ko'chirish va Nomlash", 1540, 350, { size: 18, weight: 700, color: C.text });
        text("Tarixni Yo'qotmasdan Saqlash", 1540, 385, { size: 15, fam: MONO, color: C.mute });
        text("Bitta buyruqda 3 ta amaliyot", 1540, 420, { size: 16, color: '#38bdf8', weight: 600 });

        // Qo'shimcha qulay buyruqlar
        card(140, 490, 1640, 125, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qo'shimcha Qulay Buyruqlar", 300, 520, C.mute, { size: 16, mono: false });
        text("• $ git check-ignore -v <fayl> -> Qaysi qoida to'sayotganini aniqlash", 170, 558, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("• $ git status -s --ignored     -> Chetlab o'tilgan barcha fayllar ro'yxati (!!)", 170, 588, { size: 16, fam: MONO, color: C.green, align: 'left' });

        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 4.0, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Tarixni Ko'rish (git log)", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 9-bobda loyihaning butun o'tmishini chuqur tahlil qiluvchi git log buyrug'ini o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("Toza gitignore, oqilona o'chirish va ko'chirish — professional loyiha poydevoridir.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'gitignore_qoidalari', fn: sceneGitignoreQoidalari },
      { id: 'check_ignore', fn: sceneCheckIgnore },
      { id: 'git_rm', fn: sceneGitRm },
      { id: 'git_mv', fn: sceneGitMv },
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
