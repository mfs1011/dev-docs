// Git 22-bob videosi: "Konfliktlar"
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
  // 1-SAHNA: Konflikt Tushunchasi: Nega Chiqadi?
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Konflikt Tushunchasi: Nega Chiqadi?", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git merge to‘qnashuvi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git merge inglizcha
      drawCommandLine("ombor $ ", "git merge inglizcha", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("Auto-merging app.js", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("CONFLICT (content): Merge conflict in app.js", 2.7, tu, 130, 255, { color: C.red, weight: 700 });
      drawOutputLine("Automatic merge failed; fix conflicts and then commit the result.", 3.0, tu, 130, 280, { color: '#f87171' });

      // 2-buyruq: git diff --name-only --diff-filter=U
      drawCommandLine("ombor $ ", "git diff --name-only --diff-filter=U", 5.0, 7.0, 7.2, tu, 130, 320);
      drawOutputLine("app.js", 7.4, tu, 130, 345, { color: C.yellow, weight: 700 });
      drawOutputLine("  # U — unmerged: faqat to'qnashgan fayllar ro'yxati", 7.7, tu, 130, 368, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 9.5, 0.5);
      withA(kCallout, () => {
        card(125, 415, 790, 235, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Konflikt Tizim Xatosi Emas!", 260, 450, C.red, { size: 16, mono: false });
        text("• Konflikt — Git buzildi degani emas, balki bu oddiy ish holati.", 150, 495, { size: 16, color: C.text, align: 'left' });
        text("• Git bir xil qatorlarni ikki tomon har xil o'zgartirganini ko'radi.", 150, 530, { size: 16, color: C.text, align: 'left' });
        text("• O'zboshimchalik bilan taxmin qilmaydi, qarorni sizga ishonib topshiradi!", 150, 565, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• To'qnashmagan boshqa barcha fayllar allaqachon avtomatik birlashgan.", 150, 600, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Konfliktning Asl Sababi", "uch tomonlama taqqoslash va inson qarori", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Bir Qatorda Ikki Xil Haqiqat", 1160, 290, C.red, { size: 16, mono: false });
        text("• Umumiy ajdod (A): 'Salom, dunyo'", 1030, 335, { size: 16, fam: MONO, color: '#94a3b8', align: 'left' });
        text("• main (HEAD):     'Assalomu alaykum, dunyo'", 1030, 370, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• inglizcha:       'Hello, dunyo'", 1030, 405, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Nega Git O'zi Hal Qilmaydi?", 1160, 490, C.yellow, { size: 16, mono: false });
        text("• Git kodning biznes mantiqini va ma'nosini tushunmaydi.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi biri to'g'ri ekanini faqat dasturchi bila oladi.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Jimgina xato commit qilishdan ko'ra, to'xtab so'rash xavfsiz!", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Konflikt paytida repo qat'iy va tartibli holatda turadi — hech narsa buzilmaydi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Konflikt Belgilari va git status
  // ==========================================
  function sceneBelgilar(u, bounds, o = {}) {
    chip(2, "Konflikt Belgilari va git status", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git status va konflikt belgilari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status -s
      drawCommandLine("ombor $ ", "git status -s", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("UU app.js", 2.2, tu, 130, 230, { color: C.red, weight: 700 });
      drawOutputLine("  # UU = Unmerged, both modified (ikkala tomonda o'zgargan)", 2.5, tu, 130, 252, { color: C.mute });

      // 2-buyruq: cat app.js
      drawCommandLine("ombor $ ", "cat app.js", 3.8, 4.8, 5.0, tu, 130, 285);
      drawOutputLine("// Salomlashish moduli (v2)  # avtomatik birlashgan qism", 5.2, tu, 130, 310, { color: C.mute });
      drawOutputLine("function salom(ism) {", 5.5, tu, 130, 332, { color: C.text });
      drawOutputLine("<<<<<<< HEAD", 5.8, tu, 130, 355, { color: C.green, weight: 700 });
      drawOutputLine("  console.log('Assalomu alaykum, ' + ism);", 6.1, tu, 130, 377, { color: C.green });
      drawOutputLine("=======", 6.4, tu, 130, 400, { color: C.yellow, weight: 700 });
      drawOutputLine("  console.log('Hello, ' + ism);", 6.7, tu, 130, 422, { color: C.cyan });
      drawOutputLine(">>>>>>> inglizcha", 7.0, tu, 130, 445, { color: C.cyan, weight: 700 });
      drawOutputLine("}", 7.3, tu, 130, 467, { color: C.text });
      drawOutputLine("salom('Git');  # ikkinchi branchdan avtomatik qo'shilgan", 7.6, tu, 130, 489, { color: C.mute });

      const kDetail = P(u, 9.0, 0.5);
      withA(kDetail, () => {
        card(125, 520, 790, 140, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Belgilarning Tuzilishi", 220, 555, C.cyan, { size: 16, mono: false });
        text("• <<<<<<< HEAD: siz turgan joriy branchdagi o'zgarishlar (ours).", 145, 595, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• =======: ikki tomonni ajratib turuvchi chegara chizig'i.", 145, 620, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• >>>>>>> nom: siz qo'shayotgan branchdagi o'zgarishlar (theirs).", 145, 645, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Fayl Ichidagi Konflikt Hududi", "nima avtomatik birlashdi, nima to'xtadi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Avtomatik Birlashgan Joylar", 1170, 290, C.green, { size: 16, mono: false });
        text("• 1-qator: faqat main o'zgartirgan -> Git uni o'zi to'g'ri joyladi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Oxirgi qator: faqat inglizcha qo'shgan -> Git uni ham o'zi oldi.", 1030, 370, { size: 16, color: C.text, align: 'left' });
        text("• Butun faylni boshidan yozish shart emas, faqat belgilangan joyni tuzating!", 1030, 405, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Dasturchining Vazifasi", 1130, 490, C.yellow, { size: 16, mono: false });
        text("1. Belgilar orasidagi to'g'ri kodni tanlash yoki ikkalasini uyg'unlashtirish.", 1030, 535, { size: 16, color: C.text, align: 'left' });
        text("2. <<<<<<<, =======, >>>>>>> qatorlarini butunlay o'chirib tashlash.", 1030, 570, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("3. Faylni saqlab, git add orqali hal qilinganini bildirish.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Fayl ichidagi konflikt belgilari bilan commit qilib qo'yishdan saqlaning!", 1030, 715, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Index Bosqichlari: Stage 1, 2 va 3
  // ==========================================
  function sceneIndexStages(u, bounds, o = {}) {
    chip(3, "Index Bosqichlari: Stage 1, 2 va 3", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git ls-files -u (uchta stage tahlili)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git ls-files -u
      drawCommandLine("ombor $ ", "git ls-files -u", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("100644 3c4c9de... 1  app.js  # Stage 1: merge base (ajdod)", 2.3, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("100644 386dd0f... 2  app.js  # Stage 2: ours (HEAD / main)", 2.6, tu, 130, 255, { color: C.green, weight: 600 });
      drawOutputLine("100644 33e9f79... 3  app.js  # Stage 3: theirs (inglizcha)", 2.9, tu, 130, 280, { color: C.cyan, weight: 600 });

      // 2-buyruq: git show :1:app.js
      drawCommandLine("ombor $ ", "git show :1:app.js", 4.2, 5.5, 5.7, tu, 130, 315);
      drawOutputLine("console.log('Salom, ' + ism);  # asl umumiy ota kodi", 6.0, tu, 130, 340, { color: C.mute });

      // 3-buyruq: git show :2:app.js
      drawCommandLine("ombor $ ", "git show :2:app.js", 7.2, 8.5, 8.7, tu, 130, 375);
      drawOutputLine("console.log('Assalomu alaykum, ' + ism);  # bizning kod", 9.0, tu, 130, 400, { color: C.green });

      // 4-buyruq: git show :3:app.js
      drawCommandLine("ombor $ ", "git show :3:app.js", 10.2, 11.5, 11.7, tu, 130, 435);
      drawOutputLine("console.log('Hello, ' + ism);  # ularning kodi", 12.0, tu, 130, 460, { color: C.cyan });

      const kDetail = P(u, 13.0, 0.5);
      withA(kDetail, () => {
        card(125, 495, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uchta Toza Blob Saqlanadi!", 260, 530, C.cyan, { size: 16, mono: false });
        text("• Index ichida hech qanday belgisiz 3 ta toza variant mavjud.", 145, 570, { size: 16, color: C.text, align: 'left' });
        text("• :1: = merge base, :2: = ours (HEAD), :3: = theirs (MERGE_HEAD).", 145, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• git add qilguncha index'da bitta to'g'ri javob (Stage 0) bo'lmaydi.", 145, 635, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Index Nega 3 Stage Saqlaydi?", "flags maydonidagi 2 bitning siri", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Index Formatida Stage (Bosqich)", 1170, 290, C.yellow, { size: 16, mono: false });
        text("• .git/index faylida har yozuv uchun 16 bitli flags maydoni bor.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Uning 2 biti stage raqamiga (0, 1, 2, 3) ajratilgan.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Oddiy paytda faqat Stage 0 bo'ladi; konfliktda esa 1, 2, 3 paydo bo'ladi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Alohida Faylga Ajratish", 1120, 490, C.green, { size: 16, mono: false });
        text("• git show :1:fayl > fayl.base", 1030, 535, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• git show :2:fayl > fayl.ours", 1030, 570, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• git show :3:fayl > fayl.theirs", 1030, 605, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("Commit qilish uchun index'da faqat Stage 0 yozuvlar qolishi shart!", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: .git Papkasi: MERGE_HEAD va AUTO_MERGE
  // ==========================================
  function sceneGitFiles(u, bounds, o = {}) {
    chip(4, ".git Papkasi: MERGE_HEAD va AUTO_MERGE", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — .git ichidagi maxsus merge fayllari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ls .git/MERGE* .git/AUTO*
      drawCommandLine("ombor $ ", "ls .git/MERGE* .git/AUTO*", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine(".git/MERGE_HEAD  .git/MERGE_MODE  .git/MERGE_MSG  .git/AUTO_MERGE", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });

      // 2-buyruq: cat .git/MERGE_HEAD
      drawCommandLine("ombor $ ", "cat .git/MERGE_HEAD", 3.8, 5.0, 5.2, tu, 130, 265);
      drawOutputLine("8c6e5a13fdd3ba987ddb5e859f8ed2e8f8609bd5", 5.4, tu, 130, 290, { color: C.cyan, weight: 700 });
      drawOutputLine("  # qo'shilayotgan branch uchi — keyingi commitning 2-otasi!", 5.7, tu, 130, 312, { color: C.mute });

      // 3-buyruq: cat .git/MERGE_MSG
      drawCommandLine("ombor $ ", "cat .git/MERGE_MSG", 7.0, 8.2, 8.4, tu, 130, 345);
      drawOutputLine("Merge branch 'inglizcha'", 8.6, tu, 130, 370, { color: C.text, weight: 600 });
      drawOutputLine("# Conflicts:", 8.9, tu, 130, 392, { color: C.mute });
      drawOutputLine("#   app.js", 9.1, tu, 130, 412, { color: C.mute });

      // 4-buyruq: git diff
      drawCommandLine("ombor $ ", "git diff", 10.5, 11.5, 11.7, tu, 130, 445);
      drawOutputLine("diff --cc app.js  # combined diff (ikkala tomon bilan birga)", 12.0, tu, 130, 470, { color: C.yellow, weight: 600 });
      drawOutputLine("@@@ -1,7 -1,7 +1,11 @@@", 12.3, tu, 130, 492, { color: C.cyan });
      drawOutputLine("++<<<<<<< HEAD", 12.6, tu, 130, 514, { color: C.green });
      drawOutputLine("++=======", 12.9, tu, 130, 536, { color: C.yellow });

      const kDetail = P(u, 14.0, 0.5);
      withA(kDetail, () => {
        card(125, 565, 790, 95, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        text("combined diff (diff --cc) — faqat konfliktli qatorlarni ajratib ko'rsatadi!", 150, 615, { size: 16, color: C.git, weight: 700, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.git, ".git Ichidagi Xotira", "merge holatini eslab turuvchi mexanizm", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill(".git/MERGE_HEAD", 1100, 290, C.git, { size: 16, mono: false });
        text("• Bu fayl borligi — merge jarayoni to'xtab turganining asosiy belgisidir.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• IDE va terminal promptlari aynan shu fayl orqali merge holatini biladi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• git commit qilganda u ikkinchi ota sifatida saqlanadi.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill(".git/AUTO_MERGE", 1100, 490, C.cyan, { size: 16, mono: false });
        text("• ort strategiyasi yozadigan maxsus vaqtinchalik ref.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Konflikt chiqqan paytdagi working tree holatini saqlaydi.", 1030, 570, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• git diff AUTO_MERGE — o'zingiz kiritgan o'zgarishlarni tekshirish imkonini beradi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        text("Merge yakunlanganda ushbu vaqtinchalik fayllar avtomatik tozalanadi.", 1030, 715, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Konfliktni Hal Qilish va git merge --abort
  // ==========================================
  function sceneResolveAbort(u, bounds, o = {}) {
    chip(5, "Konfliktni Hal Qilish va git merge --abort", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git add va git merge --abort',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git add app.js
      drawCommandLine("ombor $ ", "git add app.js", 0.6, 1.8, 2.0, tu, 130, 205);
      drawCommandLine("ombor $ ", "git status -s", 2.2, 3.2, 3.4, tu, 130, 235);
      drawOutputLine("M  app.js", 3.6, tu, 130, 260, { color: C.green, weight: 700 });
      drawOutputLine("  # Stage 1, 2, 3 o'rniga yagona Stage 0 yozildi!", 3.9, tu, 130, 282, { color: C.yellow, weight: 600 });

      // 2-buyruq: git commit
      drawCommandLine("ombor $ ", "git commit -m \"Merge branch 'inglizcha'\"", 5.0, 6.8, 7.0, tu, 130, 315);
      drawOutputLine("[main be8cf0b] Merge branch 'inglizcha'", 7.2, tu, 130, 340, { color: C.green, weight: 600 });
      drawOutputLine("  # Merge commit yaratildi, .git/MERGE_* fayllari tozalandi", 7.5, tu, 130, 362, { color: C.mute });

      // 3-buyruq: git merge --abort (muqobil yo'l)
      drawCommandLine("ombor $ ", "git merge --abort", 9.0, 10.4, 10.6, tu, 130, 400);
      drawOutputLine("HEAD is now at 26a6328 README tavsifi", 10.8, tu, 130, 425, { color: C.cyan, weight: 600 });
      drawOutputLine("  # ORIG_HEAD orqali merge boshlanishidan oldingi holatga to'liq qaytish", 11.1, tu, 130, 447, { color: C.mute });

      const kDetail = P(u, 12.5, 0.5);
      withA(kDetail, () => {
        card(125, 485, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Xavfsiz Chiqish: --abort", 220, 520, C.green, { size: 16, mono: false });
        text("• Agar adashib ketsangiz yoki merge hozir kerak emasligini tushunsangiz:", 145, 560, { size: 16, color: C.text, align: 'left' });
        text("• git merge --abort buyrug'i bir zumda barchasini tozalaydi.", 145, 595, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Ishchi papka va index xuddi merge bo'lmagandek asl holiga qaytadi.", 145, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Yechimni Tasdiqlash", "git add va commit mexanizmi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git add Nima Qiladi?", 1120, 290, C.green, { size: 16, mono: false });
        text("• Fayldagi belgilarni tozalaganingizdan so'ng git add bajarasiz.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Git index'dagi 1, 2, 3 bosqichlarni o'chirib, bitta Stage 0 yozadi.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Bu Git uchun: 'fayl muvaffaqiyatli hal qilindi' degan belgidir.", 1030, 405, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(238,90,36,0.08)', col: C.git });
        pill("git commit Yakuni", 1100, 490, C.git, { size: 16, mono: false });
        text("• MERGE_HEAD dagi commit ikkinchi ota qilib biriktiriladi.", 1030, 535, { size: 17, color: C.text, align: 'left' });
        text("• Yangi birlashgan merge commit hosil qilinadi.", 1030, 570, { size: 16, color: C.git, align: 'left', weight: 600 });
        text("• .git dagi vaqtinchalik MERGE_* fayllari butunlay yo'qotiladi.", 1030, 605, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 12.0, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 110, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        text("git merge --abort — hech qanday iz qoldirmay toza orqaga qaytaradi.", 1030, 715, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa: zdiff3 va --ours / --theirs
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: zdiff3 va --ours / --theirs", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda zdiff3
      terminal(100, 140, 840, 520, {
        title: 'zsh — merge.conflictStyle zdiff3 afzalligi',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git config --global merge.conflictStyle zdiff3", 0.6, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("ombor $ ", "cat app.js", 3.0, 4.0, 4.2, tu, 130, 235);
      drawOutputLine("<<<<<<< HEAD", 4.4, tu, 130, 260, { color: C.green, weight: 700 });
      drawOutputLine("  console.log('Assalomu alaykum, ' + ism);", 4.7, tu, 130, 282, { color: C.green });
      drawOutputLine("||||||| 8fc4433 (base)", 5.0, tu, 130, 305, { color: C.yellow, weight: 700 });
      drawOutputLine("  console.log('Salom, ' + ism);  # asl umumiy ota matni!", 5.3, tu, 130, 327, { color: C.yellow });
      drawOutputLine("=======", 5.6, tu, 130, 350, { color: C.cyan, weight: 700 });
      drawOutputLine("  console.log('Hello, ' + ism);", 5.9, tu, 130, 372, { color: C.cyan });
      drawOutputLine(">>>>>>> inglizcha", 6.2, tu, 130, 395, { color: C.cyan, weight: 700 });

      const kDetail = P(u, 7.5, 0.5);
      withA(kDetail, () => {
        card(125, 420, 790, 220, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Nega zdiff3 Tavsiya Qilinadi?", 250, 455, C.blue, { size: 16, mono: false });
        text("• Standart merge uslubida faqat HEAD va inglizcha ko'rinadi.", 150, 500, { size: 16, color: C.text, align: 'left' });
        text("• Asl matn qanday bo'lganini bilmay qaror qabul qilish juda qiyin.", 150, 535, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• zdiff3 asl ota matnini ||||||| ostida ko'rsatib beradi!", 150, 570, { size: 16, color: C.green, align: 'left', weight: 700 });
        text("• Tezkor tanlash: git restore --ours yoki --theirs (butun fayl uchun).", 150, 605, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Konfliktlar Bo'yicha Xulosa", "ishonch bilan va xavfsiz hal qilish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Qo'rqishga Hech Qanday Sabab Yo'q", 1230, 275, C.green, { size: 16, mono: false });
        text("• Konflikt — har kungi tabiiy dasturlash jarayoni.", 1030, 320, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Git barcha toza versiyalarni index'dagi 3 ta stage'da asrab turadi.", 1030, 355, { size: 16, color: C.text, align: 'left' });
        text("• Istalgan paytda git merge --abort bilan toza qaytish mumkin.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Asosiy Qadamlar Zanjiri", 1150, 480, C.yellow, { size: 16, mono: false });
        text("• 1. git status orqali to'qnashgan fayllarni aniqlash.", 1030, 525, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• 2. Fayllarni ochib, to'g'ri kodni qoldirish va belgilarni o'chirish.", 1030, 560, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• 3. git add bilan tasdiqlab, git commit bilan yakunlash!", 1030, 595, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.0, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 23-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Branchlarni boshqarish! Ro'yxatlash, birlashtirilganlarini saralash va xavfsiz boshqaruv!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'belgilar_va_status', fn: sceneBelgilar },
      { id: 'uch_bosqich_indeks', fn: sceneIndexStages },
      { id: 'git_fayllari', fn: sceneGitFiles },
      { id: 'hal_qilish_va_abort', fn: sceneResolveAbort },
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
