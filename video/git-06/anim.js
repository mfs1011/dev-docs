// Git 06-bob videosi: "O'zgarishlarni yozish: status, add, commit"
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
  // 1-SAHNA: O'zgarishlarni Yozish Sikli
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("06-BOB · KUNDALIK ISH SIKLI", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("O'zgarishlarni Yozish: status, add, commit", 960, 345, { size: 54, weight: 800, color: C.text });
        text("Kundalik dasturlashning 90% qismini tashkil qiluvchi asosiy trio", 960, 415, { size: 26, color: C.mute });

        // Markaziy sikl diagrammasi
        const kTerm = P(u, 2.0, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 240, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Kundalik Ish Oqimi", 960, 530, C.blue, { size: 22 });

          card(400, 575, 340, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
          pill("1 · git status", 570, 610, C.blue, { size: 17 });
          text("Nima o'zgardi? (Tekshiruv)", 570, 650, { size: 16, color: C.text });

          card(790, 575, 340, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
          pill("2 · git add", 960, 610, C.green, { size: 17 });
          text("Kommitga tayyorlash (Staging)", 960, 650, { size: 16, color: C.text });

          card(1180, 575, 340, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
          pill("3 · git commit", 1350, 610, C.orange, { size: 17 });
          text("Tarixga muhrlash (Snapshot)", 1350, 650, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Kundalik Ishning Asosiy Triosi", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap: 3 Ta Asosiy Buyruq
      panel(100, 140, 840, 680, C.blue, "Uchta Asosiy Harakat", "status, add va commit vazifasi", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · git status (Holat Nazorati)", 260, 290, C.blue, { size: 16, mono: false });
        text("• Hozir qaysi fayl qaysi holatda ekanini ko'rsatadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Working tree, index va repo'ni solishtiradi, hech narsani o'zgartirmaydi.", 150, 375, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.8, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · git add (Mazmunni Qoralamaga Olish)", 300, 470, C.green, { size: 16, mono: false });
        text("• Faylning aynan hozirgi mazmunini navbatdagi kommitga kiritadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi faylni kuzatadi, tahrirlanganini yangilaydi, o'chirilganni belgilaydi.", 150, 555, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("3 · git commit (Tarixga Muhrlash)", 260, 655, C.orange, { size: 16, mono: false });
        text("• Index'dagi barcha fayllarni olib, loyihaning yangi snapshot'ini yaratadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Muallif, sana va tavsif xabari bilan kriptografik hash biriktiriladi.", 150, 740, { size: 16, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng: Nega Git yangi fayllarni o'zi qo'shmaydi?
      panel(980, 140, 840, 680, C.yellow, "Nega Git Avtomatik Qo'shmaydi?", "ataylab qilinadigan xavfsizlik qarori", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.5, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Keraksiz Fayllardan Himoya", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• Build fayllari, vaqtinchalik loglar va maxfiy kalitlar (.env)", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("  tasodifan tarixga kirib ketmasligi uchun!", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Tarixdan O'chirish Qiyin", 1140, 470, C.red, { size: 16, mono: false });
        text("• Bir marta kommit qilingan fayl keyinchalik o'chirilsa ham,", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("  loyiha o'tmishida abadiy saqlanib qoladi.", 1030, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Qo'shish — Bu Ongli Tanlov", 1150, 655, C.green, { size: 16, mono: false });
        text("• 'git add' — har bir o'zgarishni tekshirib, ongli ravishda", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  kommitga kiritish imkoniyatidir.", 1030, 740, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 17.5, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Kundalik ish sikli: o'zgartirish -> status bilan tekshirish -> add bilan tayyorlash -> commit bilan muhrlash.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi 'git status' buyrug'ini real terminalda uzun va qisqa formatlarda ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: git status: Holatni Ko'rish (SPLIT SCREEN)
  // ==========================================
  function sceneGitStatus(u, bounds, o = {}) {
    chip(2, "git status: Holatni Ko‘rish", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/kutubxona (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git status toza holatda
      drawCommandLine("kutubxona $ ", "git status", 1.0, 2.2, 2.5, tu, 130, 205);
      drawOutputLine("On branch main", 2.7, tu, 150, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("Your branch is up to date with 'origin/main'.", 2.7, tu, 150, 250, { color: '#cbd5e1' });
      drawOutputLine("nothing to commit, working tree clean", 2.7, tu, 150, 270, { color: C.green, weight: 600 });

      // 2-buyruq: fayl yaratish
      drawCommandLine("kutubxona $ ", "echo 'MIT' > LICENSE && echo 'x' > app.js", 4.2, 6.8, 7.1, tu, 130, 300);

      // 3-buyruq: git status -s (qisqa format)
      drawCommandLine("kutubxona $ ", "git status -s", 8.0, 9.2, 9.5, tu, 130, 330, { promptCol: C.blue });
      drawOutputLine("?? LICENSE", 9.7, tu, 150, 355, { color: C.red, weight: 600 });
      drawOutputLine("?? app.js", 9.7, tu, 150, 375, { color: C.red, weight: 600 });

      // 4-buyruq: git status (to'liq format)
      drawCommandLine("kutubxona $ ", "git status", 10.8, 12.0, 12.3, tu, 130, 405);
      drawOutputLine("Untracked files:", 12.5, tu, 150, 430, { color: C.red, weight: 600 });
      drawOutputLine("  (use \"git add <file>...\" to include in what will be committed)", 12.5, tu, 150, 450, { color: '#94a3b8' });
      drawOutputLine("	LICENSE", 12.5, tu, 150, 470, { color: C.red });
      drawOutputLine("	app.js", 12.5, tu, 150, 490, { color: C.red });

      // Faol prompt va miltillovchi kursor
      if (tu >= 13.5) {
        text("kutubxona $ ", 130, 526, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("kutubxona $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 526, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: git status Shifrlari va Anatomiyasi
      panel(980, 140, 840, 680, C.blue, "git status: Qisqa Format (-s) Sirlari", "ikki ustunli ixcham xarita", kBox, kBox);

      const kS1 = P(u, 1.8, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 Ustunli Format: Chap = Index, O'ng = Disk", 1220, 290, C.blue, { size: 16, mono: false });
        text("• ?? <fayl> -> Untracked (Git hali kuzatmaydi, mutlaqo yangi).", 1030, 335, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• A  <fayl> -> Staged (yangi fayl index'ga qo'shildi, saqlashga tayyor).", 1030, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("•  M <fayl> -> Modified in working tree (diskda o'zgargan, lekin staged emas).", 1030, 415, { size: 16, color: C.orange, align: 'left' });
        text("• M  <fayl> -> Staged (o'zgarish index'ga olingan).", 1030, 455, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS2 = P(u, 6.5, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Nodir Holat: 'MM' Belgisi Nimani Bildiradi?", 1220, 550, C.yellow, { size: 16, mono: false });
        text("• 'MM fayl.txt' — fayl bir vaqtning o'zida ham staged, ham modified!", 1030, 595, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Sababi: Siz faylni 'git add' qilib, keyin diskda yana o'zgartirgansiz.", 1030, 635, { size: 16, color: C.text, align: 'left' });
        text("• Index'dagi nusxa birinchi o'zgarishni saqlaydi, diskda esa yangisi turadi.", 1030, 675, { size: 16, color: C.mute, align: 'left' });
        text("• Yangi o'zgarishni ham kiritish uchun yana 'git add' qilish kerak!", 1030, 715, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 15.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("git status uch hududni solishtirib beradi; qisqa -s opsiyasi esa holatni ixcham harflarda ko'rsatadi.", 960, 895, { size: 24, weight: 700, color: C.blue, align: 'center' });
      text("Endi fayllarni stage qilish uchun 'git add' buyrug'ini amalda sinaymiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: git add: Ko'p Vazifali Kuch (SPLIT SCREEN)
  // ==========================================
  function sceneGitAdd(u, bounds, o = {}) {
    chip(3, "git add: Ko‘p Vazifali Kuch", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/kutubxona (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git add LICENSE
      drawCommandLine("kutubxona $ ", "git add LICENSE", 1.0, 2.6, 2.9, tu, 130, 205);

      // 2-buyruq: git status -s
      drawCommandLine("kutubxona $ ", "git status -s", 3.6, 4.8, 5.1, tu, 130, 235);
      drawOutputLine("A  LICENSE  (staged: navbatga qo'yildi)", 5.3, tu, 150, 260, { color: C.green, weight: 600 });
      drawOutputLine("?? app.js   (hali untracked)", 5.3, tu, 150, 280, { color: C.red });

      // 3-buyruq: git add . (hamma narsani olish)
      drawCommandLine("kutubxona $ ", "git add .", 6.8, 7.8, 8.1, tu, 130, 310, { promptCol: C.yellow });

      // 4-buyruq: git status -s
      drawCommandLine("kutubxona $ ", "git status -s", 8.8, 10.0, 10.3, tu, 130, 340);
      drawOutputLine("A  LICENSE", 10.5, tu, 150, 365, { color: C.green, weight: 600 });
      drawOutputLine("A  app.js", 10.5, tu, 150, 385, { color: C.green, weight: 600 });

      // 5-buyruq: git ls-files -s tekshirish
      drawCommandLine("kutubxona $ ", "git ls-files -s", 11.4, 12.8, 13.1, tu, 130, 415, { promptCol: C.blue });
      drawOutputLine("100644 e69de29... 0	LICENSE", 13.3, tu, 150, 440, { color: '#38bdf8' });
      drawOutputLine("100644 587be6b... 0	app.js", 13.3, tu, 150, 460, { color: '#38bdf8' });

      // Faol prompt va miltillovchi kursor
      if (tu >= 14.5) {
        text("kutubxona $ ", 130, 496, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("kutubxona $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 496, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: git add ning Keng Imkoniyatlari
      panel(980, 140, 840, 680, C.green, "git add: Kuchli va Moslashuvchan", "shunchaki qo'shish emas, aniq stage qilish", kBox, kBox);

      const kA1 = P(u, 1.8, 0.6);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("4 Asosiy Qo'llanilish Shakli", 1160, 290, C.green, { size: 16, mono: false });
        text("• git add <fayl>   -> aniq bitta faylni stage qilish.", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git add .        -> joriy papkadagi barcha o'zgarishlarni olish.", 1030, 375, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• git add *.js     -> faqat shablonga mos fayllarni stage qilish.", 1030, 415, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git add -A       -> butun repozitoriy bo'ylab hamma narsani olish.", 1030, 455, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kA2 = P(u, 6.5, 0.6);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("O'chirilgan Fayllar Ham 'add' Qilinadi!", 1200, 550, C.blue, { size: 16, mono: false });
        text("• Agar faylni diskdan 'rm' bilan o'chirsangiz, u 'deleted' bo'ladi.", 1030, 595, { size: 16, color: C.text, align: 'left' });
        text("• 'git add <ochirilgan>' qilish orqali o'chirish amali stage qilinadi!", 1030, 635, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• 'add' so'zi fayl mazmunini emas, o'zgarish holatini index'ga kiritadi.", 1030, 675, { size: 16, color: C.text, align: 'left' });
        text("• Bu Git arxitekturasining eng universal va qulay mexanizmidir.", 1030, 715, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 15.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("git add yangi fayllarni kuzatadi, tahrirlanganini yangilaydi va o'chirilganni kommit rejasiga kiritadi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi tayyorlangan qoralamani 'git commit' orqali doimiy tarixga muhrlaymiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: git commit: Tarixga Muhrlash (SPLIT SCREEN)
  // ==========================================
  function sceneGitCommit(u, bounds, o = {}) {
    chip(4, "git commit: Tarixga Muhrlash", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/kutubxona (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git commit -m "..."
      drawCommandLine("kutubxona $ ", "git commit -m 'Litsenziya va app.js qo‘shildi'", 1.0, 3.8, 4.2, tu, 130, 205);
      drawOutputLine("[main 4f1a20b] Litsenziya va app.js qo‘shildi", 4.4, tu, 150, 230, { color: C.green, weight: 700 });
      drawOutputLine(" 2 files changed, 2 insertions(+)", 4.4, tu, 150, 250, { color: '#cbd5e1' });
      drawOutputLine(" create mode 100644 LICENSE", 4.4, tu, 150, 270, { color: '#94a3b8' });
      drawOutputLine(" create mode 100644 app.js", 4.4, tu, 150, 290, { color: '#94a3b8' });

      // 2-buyruq: git status (toza)
      drawCommandLine("kutubxona $ ", "git status", 5.8, 7.0, 7.3, tu, 130, 320);
      drawOutputLine("On branch main", 7.5, tu, 150, 345, { color: C.yellow, weight: 600 });
      drawOutputLine("nothing to commit, working tree clean", 7.5, tu, 150, 365, { color: C.green, weight: 600 });

      // 3-buyruq: git log --oneline -1
      drawCommandLine("kutubxona $ ", "git log --oneline -1", 8.8, 10.2, 10.5, tu, 130, 395, { promptCol: C.blue });
      drawOutputLine("* 4f1a20b (HEAD -> main) Litsenziya va app.js qo‘shildi", 10.7, tu, 150, 420, { color: '#38bdf8', weight: 600 });

      // 4-buyruq: git commit -a misoli
      drawCommandLine("kutubxona $ ", "git commit -a -m 'Tezkor tuzatish'", 11.8, 13.4, 13.7, tu, 130, 450, { promptCol: C.orange });
      drawOutputLine("[main 8c2d91e] Tezkor tuzatish (index'ni chetlab o'tdi!)", 13.9, tu, 150, 475, { color: C.orange, weight: 600 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 14.8) {
        text("kutubxona $ ", 130, 511, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("kutubxona $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 511, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Commitning Ichki Mohiyati
      panel(980, 140, 840, 680, C.orange, "git commit: Doimiy Snapshot", "kriptografik muhrlangan tarix", kBox, kBox);

      const kC1 = P(u, 1.8, 0.6);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Kommit Ob'ektining 4 Ustuni", 1160, 290, C.orange, { size: 16, mono: false });
        text("1. Tree (daraxt) — loyihadagi barcha fayllar va ularning bloblari.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("2. Muallif (Author va Committer) — ism, email va sana belgisi.", 1030, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("3. Tavsif xabari — qilingan o'zgarishning maqsadi va sababi.", 1030, 415, { size: 16, color: C.text, align: 'left' });
        text("4. Hash kaliti — SHA-1 yoki SHA-256 bilan qotirilgan xavfsizlik.", 1030, 455, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = P(u, 6.5, 0.6);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Tezkor 'commit -a' Opsiyasi", 1140, 550, C.green, { size: 16, mono: false });
        text("• 'git commit -a -m ...' — barcha tracked fayllarni avtomatik stage qiladi.", 1030, 595, { size: 16, color: C.text, align: 'left' });
        text("• 'git add'ni alohida yozish shart emas — vaqtni tejaydi.", 1030, 635, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• MUHIM CHEKLOV: Yangi (untracked) fayllarni qo'shmaydi!", 1030, 675, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("• Yangi fayllar paydo bo'lganda, baribir 'git add' qilish shart.", 1030, 715, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.orange });
      text("Har bir kommit o'z muallifi, sanasi, aniq tavsifi va xavfsiz hesh kaliti bilan tarixga muhrlanadi.", 960, 895, { size: 24, weight: 700, color: C.orange, align: 'center' });
      text("Endi fayllarning butun hayot sikli bo'ylab harakatlanish xaritasini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Fayllarning Hayot Sikli
  // ==========================================
  function sceneKuzatuvSikli(u, bounds) {
    chip(5, "Fayllarning Hayot Sikli", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // 4 Bosqichli Katta Hayot Sikli Xaritasi
      panel(100, 140, 1720, 680, C.blue, "Fayllarning To'liq Hayot Sikli Xaritasi", "untracked -> staged -> unmodified -> modified", kBox, kBox);

      // 4 ta ustun
      const states = [
        { name: "1 · Untracked", col: C.red, sub: "Yangi Yaratilgan", desc: "Git hali tanimaydi; faqat diskda mavjud.", act: "Harakat: git add <fayl>" },
        { name: "2 · Staged", col: C.green, sub: "Indeksga Olingan", desc: "Kommit qoralamasida tayyor turibdi.", act: "Harakat: git commit" },
        { name: "3 · Unmodified", col: C.blue, sub: "Tarixda Saqlangan", desc: "Oxirgi kommit bilan to'liq bir xil.", act: "Harakat: faylni tahrirlash" },
        { name: "4 · Modified", col: C.orange, sub: "Diskda O'zgargan", desc: "Tahrirlangan, lekin hali index'da yo'q.", act: "Harakat: yana git add" }
      ];

      states.forEach((st, idx) => {
        const x = 135 + idx * 415;
        const kS = P(u, 1.2 + idx * 1.6, 0.6);
        withA(kS, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kS)) * 16);
          card(x, 255, 385, 360, { fill: 'rgba(15,22,48,0.92)', col: st.col, lw: 2 });
          pill(st.name, x + 192, 295, st.col, { size: 18 });
          text(st.sub, x + 192, 345, { size: 20, weight: 700, color: C.text });
          text(st.desc, x + 192, 410, { size: 16, color: C.mute, align: 'center' });

          card(x + 20, 480, 345, 100, { fill: 'rgba(11,16,32,0.92)', col: st.col });
          text(st.act, x + 192, 530, { size: 16, fam: MONO, color: st.col, weight: 600 });
          ctx.restore();
        });
      });

      // Siklik bog'liqlik chizig'i
      const kArr = P(u, 8.5, 0.6);
      withA(kArr, () => {
        card(135, 645, 1650, 140, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Uzluksiz Sikl Qoidasi", 960, 680, C.yellow, { size: 18, mono: false });
        text("Untracked ──► git add ──► Staged ──► git commit ──► Unmodified ──► tahrirlash ──► Modified ──► qayta git add...", 960, 735, { size: 18, fam: MONO, color: C.green, weight: 600 });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Bu to'rt holat zanjiri loyiha davomida uzluksiz takrorlanadi va butun tarixni hosil qiladi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Endi bob bo'yicha asosiy xulosalar va tavsiyalarni jamlaymiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
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
      // Chap: 4 Ta Oltin Qoida
      panel(100, 140, 840, 680, C.blue, "Kundalik Ishning Oltin Qoidalari", "status, add va commit bilimi", kBox, kBox);

      const kX1 = P(u, 1.2, 0.5);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 16);
        card(125, 255, 790, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · 'git status' Bilan Boshlang va Tugating", 290, 285, C.blue, { size: 16, mono: false });
        text("Har qanday amal oldidan va keyin holatni tekshirib olish xatolardan asraydi.", 150, 335, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.5);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 16);
        card(125, 395, 790, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · git add = Aynan Shu Mazmunni Stage Qilish", 310, 425, C.green, { size: 16, mono: false });
        text("Faylni add qilgach yana o'zgartirsangiz, yangi o'zgarish uchun yana add kerak!", 150, 475, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.5);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 16);
        card(125, 535, 790, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("3 · Mazmunli Commit Xabarlari Yozing", 280, 565, C.orange, { size: 16, mono: false });
        text("Commit xabari nima va nega o'zgarganini kelajakdagi jamoangizga tushuntiradi.", 150, 615, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX4 = P(u, 7.2, 0.5);
      withA(kX4, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX4)) * 16);
        card(125, 675, 790, 120, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("4 · Qisqa Format: 'git status -s'", 260, 705, C.yellow, { size: 16, mono: false });
        text("??, A, M va MM belgilari orqali loyiha holatini bir qarashda ko'ring.", 150, 755, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng: Keyingi Bobga Yo'llanma
      panel(980, 140, 840, 680, C.git, "Keyingi Bosqich", "07-bob: diff — nima o'zgardi?", kBox, kBox);

      const kN1 = P(u, 9.2, 0.6);
      withA(kN1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Keyingi Bobda Ko'riladigan Amallar", 1170, 290, C.git, { size: 16, mono: false });
        text("• 'git diff': qatorlar kesimida nima o'zgarganini ko'rish", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("• 'git diff --staged': kommitga tayyorlangan o'zgarishlarni tekshirish", 1030, 385, { size: 17, color: C.text, align: 'left' });
        text("• Unified diff formati va rangli belgilarni o'qish san'ati", 1030, 430, { size: 17, color: C.text, align: 'left' });
        text("• Kod sifatini oshirishda diff ning beqiyos o'rni", 1030, 475, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kN2 = P(u, 11.5, 0.6);
      withA(kN2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN2)) * 16);
        card(1005, 525, 790, 255, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Mustaqil Amaliyot Uchun Topshiriq", 1170, 560, C.green, { size: 16, mono: false });
        text("1. Ikkita fayl ochib, 'git status -s' bilan ko'ring.", 1030, 605, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("2. Bittasini add qiling va 'A' hamda '??' farqini tasdiqlang.", 1030, 645, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("3. 'git commit -m ...' bilan birinchi kommitni yozing.", 1030, 685, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("Asosiy sikl o'zlashtirilgan bo'lsa, keyingi darsga o'tamiz!", 1030, 735, { size: 16, color: C.text, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("status, add va commit — har bir dasturchining eng asosiy, eng ko'p ishlatadigan qurollaridir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Keyingi bobda aynan nimalar o'zgarganini ko'rsatuvchi diff buyrug'ini ko'rib chiqamiz. Rahmat!", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY FRAME CHIZISH
  // ==========================================
  function frame(t, o = {}) {
    bg();
    const sc = o.scene || (TM ? Object.keys(TM.scenes).find((k) => t >= TM.scenes[k].s && t < TM.scenes[k].e) : 'intro') || 'intro';
    const bounds = TM ? TM.scenes[sc] : { s: 0, e: 120.8 };
    const u = t - bounds.s;

    switch (sc) {
      case 'intro': sceneIntro(u, bounds, o); break;
      case 'git_status': sceneGitStatus(u, bounds, o); break;
      case 'git_add': sceneGitAdd(u, bounds, o); break;
      case 'git_commit': sceneGitCommit(u, bounds, o); break;
      case 'kuzatuv_sikli': sceneKuzatuvSikli(u, bounds); break;
      case 'xulosa': sceneXulosa(u, bounds); break;
      default: sceneIntro(u, bounds, o);
    }
  }

  window.renderFrame = frame;
  window.drawFrame = frame;
  window.render = frame;

  window.renderPoster = function () {
    bg(0);
    // 06-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("06-BOB · KUNDALIK ISH SIKLI", 960, 160, C.git, { size: 26, mono: false });
    text("O'zgarishlarni Yozish: status, add, commit", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("Kundalik dasturlashning 90% qismini tashkil qiluvchi asosiy trio", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy taqqoslash kartasi
    card(400, 410, 1120, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("Kundalik Ish Oqimi", 960, 475, C.blue, { size: 24 });
    text("git status  ──►  git add <fayllar>  ──►  git commit -m '...'", 960, 545, { size: 26, fam: MONO, color: C.green, weight: 700 });
    text("Untracked, Staged, Unmodified va Modified holatlari", 960, 595, { size: 22, fam: MONO, color: '#38bdf8', weight: 600 });
    text("Qisqa format (-s) shifrlari va doimiy snapshotlar yaratish", 960, 645, { size: 20, fam: MONO, color: C.yellow });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("status, add va commit — har bir dasturchining eng asosiy, eng ko'p ishlatadigan qurollaridir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Toza ishchi papka, mantiqiy saralangan kommitlar va xavfsiz tarix poydevori.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
