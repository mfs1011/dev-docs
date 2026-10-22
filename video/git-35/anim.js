// anim.js — 35-bob: GitHub: fork va pull request
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
  // 1-SAHNA: GitHub Flow va Fork Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "GitHub Flow va Fork Tushunchasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@laptop: ~/Projects (dev)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: forkni klonlash
      drawCommandLine("ali $ ", "git clone https://github.com/ali/blink.git", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Cloning into 'blink'...", 3.0, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("remote: Enumerating objects: 18, done.", 3.2, tu, 130, 248, { color: '#94a3b8' });
      drawOutputLine("Receiving objects: 100% (18/18), done.", 3.4, tu, 130, 268, { color: C.green, weight: 600 });

      // 2-buyruq: remote tekshirish
      drawCommandLine("ali $ ", "cd blink && git remote -v", 4.5, 6.5, 6.7, tu, 130, 305);
      drawOutputLine("origin  https://github.com/ali/blink.git (fetch)", 7.0, tu, 130, 328, { color: C.cyan });
      drawOutputLine("origin  https://github.com/ali/blink.git (push)", 7.2, tu, 130, 348, { color: C.cyan });
      drawOutputLine("  # origin — bu sizning forkingiz, asl loyiha emas!", 7.5, tu, 130, 370, { color: C.mute });

      // 3-buyruq: log ko'rish
      drawCommandLine("ali $ ", "git log --oneline -2", 9.0, 10.5, 10.7, tu, 130, 405);
      drawOutputLine("b9efdb1 (HEAD -> main, origin/main) Blink dasturi boshlandi", 11.0, tu, 130, 428, { color: C.green, weight: 600 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kCallout, () => {
        card(125, 460, 790, 235, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Fork va Upstream Modeli", 255, 495, C.cyan, { size: 16, mono: false });
        text("• Ochiq loyihalarda begona dasturchiga bevosita push huquqi berilmaydi.", 150, 535, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Fork — bu asl repozitoriyning GitHub'dagi sizga tegishli shaxsiy nusxasi.", 150, 563, { size: 15, color: C.text, align: 'left' });
        text("• Siz faqat o'z forkingizga (origin) xavfsiz push qila olasiz.", 150, 591, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Asl loyiha esa jamoada 'upstream' (bosh manba) deb nomlanadi.", 150, 619, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• O'zgarishlar esa Pull Request (PR) orqali taklif qilinadi.", 150, 645, { size: 15, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "GitHub Flow: Fork va Upstream", "zamonaviy jamoaviy ishlash oqimi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Huquqlarni Ajratish Siyosati", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Fork and Pull: Har kim loyihani ko'ra oladi va fork qila oladi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Har bir ishtirokchi faqat o'z forkiga yoza oladi (asl repo buzilmaydi).", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Asl repoga faqat maintainer ko'rib chiqqach merge qila oladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Natijada yuzlab odam xavfsiz va erkin hissa qo'sha oladi.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("GitHub Flow 5 Asosiy Bosqichi", 1135, 500, C.green, { size: 16, mono: false });
        text("1. Fork va Clone : Shaxsiy repo nusxasini kompyuterga olish.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("2. Topic Branch  : Alohida tarmoq ochib o'zgarish kiritish.", 1030, 575, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("3. Push va PR    : Forkka yuklab, asl repoga Pull Request ochish.", 1030, 605, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("4. Review va Merge: Sharhlash, testlar va muvaffaqiyatli birlashuv.", 1030, 630, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Topic Branch va PR Yaratish
  // ==========================================
  function sceneTopicVaPr(u, bounds, o = {}) {
    chip(2, "Topic Branch va PR Yaratish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@laptop: ~/Projects/blink (sekin-blink)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: topic branch ochish
      drawCommandLine("ali $ ", "git switch -c sekin-blink main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Switched to a new branch 'sekin-blink'", 3.0, tu, 130, 228, { color: C.green, weight: 600 });

      // 2-buyruq: o'zgarishni commit qilish
      drawCommandLine("ali $ ", 'git commit -a -m "Kechikishni 3 soniyaga oshirish"', 4.0, 6.5, 6.7, tu, 130, 265);
      drawOutputLine("[sekin-blink 13a8ce7] Kechikishni 3 soniyaga oshirish", 7.0, tu, 130, 288, { color: C.cyan, weight: 600 });
      drawOutputLine(" 1 file changed, 2 insertions(+), 2 deletions(-)", 7.2, tu, 130, 308, { color: '#94a3b8' });

      // 3-buyruq: forkka push qilish
      drawCommandLine("ali $ ", "git push -u origin sekin-blink", 8.5, 10.5, 10.7, tu, 130, 345);
      drawOutputLine("To https://github.com/ali/blink.git", 11.0, tu, 130, 368, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      sekin-blink -> sekin-blink", 11.2, tu, 130, 388, { color: C.green, weight: 600 });

      // 4-buyruq: gh orqali PR ochish
      drawCommandLine("ali $ ", 'gh pr create --title "Kechikishni 3 soniyaga oshirish" --body "Fixes #12"', 12.5, 16.0, 16.2, tu, 130, 425);
      drawOutputLine("Creating pull request for sekin-blink into main in muallif/blink", 16.5, tu, 130, 448, { color: '#94a3b8' });
      drawOutputLine("https://github.com/muallif/blink/pull/1", 16.7, tu, 130, 468, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Pull Request Yaratish Qoidalari", "topic branch va gh yordamida ochish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Nega Asosiy (main) Tarmoqdan Emas?", 1145, 290, C.yellow, { size: 16, mono: false });
        text("• Forkingizdagi main'dan PR ochsangiz, u yerda boshqa ish qilib bo'lmaydi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Yangi o'zgarishlar kiritilsa, eski ochiq PR ichiga avtomatik qo'shilib ketadi.", 1030, 365, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("• Topic branch bitta aniq mavzuga ataladi va ish tugagach o'chiriladi.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Branch nomi tushunarli bo'lsin: 'sekin-blink', 'fix-oauth-token'.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Avtomatik Bog'lash: 'Fixes #ID'", 1130, 500, C.cyan, { size: 16, mono: false });
        text("• Tavsifda 'Fixes #12' yoki 'Closes #12' kalit so'zini ishlating.", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• PR muvaffaqiyatli merge bo'lishi bilan bog'liq issue avtomatik yopiladi!", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• 'gh' (GitHub CLI) terminaldan chiqmasdan PR ochish imkonini beradi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Ish hali tugallanmagan bo'lsa: '--draft' bilan qoralama PR oching.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Review Jarayoni va Iteratsiya
  // ==========================================
  function sceneReviewVaIteratsiya(u, bounds, o = {}) {
    chip(3, "Review Jarayoni va Iteratsiya", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@laptop: ~/Projects/blink (sekin-blink)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: review izohlarini ko'rish
      drawCommandLine("ali $ ", "gh pr view 1 --comments", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("@bobur (Reviewer): 'Fikr yaxshi, lekin LED o'chiq turishi 4s bo'lsin'", 3.0, tu, 130, 228, { color: C.yellow, weight: 600 });

      // 2-buyruq: yangi commit qo'shish
      drawCommandLine("ali $ ", 'git commit -a -m "LED o\'chiq turishini 4 soniya qilish"', 4.2, 7.0, 7.2, tu, 130, 265);
      drawOutputLine("[sekin-blink bd9ee34] LED o'chiq turishini 4 soniya qilish", 7.5, tu, 130, 288, { color: C.cyan, weight: 600 });
      drawOutputLine(" 1 file changed, 1 insertion(+), 1 deletion(-)", 7.7, tu, 130, 308, { color: '#94a3b8' });

      // 3-buyruq: push qilish
      drawCommandLine("ali $ ", "git push origin sekin-blink", 9.0, 11.0, 11.2, tu, 130, 345);
      drawOutputLine("   13a8ce7..bd9ee34  sekin-blink -> sekin-blink", 11.5, tu, 130, 368, { color: C.green, weight: 600 });
      drawOutputLine("  # PR sahifasi o'z-o'zidan avtomatik yangilandi!", 11.8, tu, 130, 390, { color: C.mute });

      // 4-buyruq: diff tekshiruvi (uch nuqta)
      drawCommandLine("ali $ ", "git diff main...sekin-blink --stat", 13.0, 15.5, 15.7, tu, 130, 425);
      drawOutputLine(" blink.ino | 4 ++--", 16.0, tu, 130, 448, { color: C.green });
      drawOutputLine(" 1 file changed, 2 insertions(+), 2 deletions(-)", 16.2, tu, 130, 468, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "PR — Jonli Muloqot Maydoni", "review va o'zgarishlar kiritish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Takliflarga Qanday Javob Beriladi?", 1130, 290, C.purple, { size: 16, mono: false });
        text("• PR — bu shunchaki statik fayl emas, balki tarmoqning jonli holatidir.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Sharhlovchi taklif bildirsa, o'sha branchda commit qilib qayta push qilasiz.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Yangi PR ochish shart emas; eski izohlar avtomatik 'outdated' bo'ladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Tuzatgach: 'Taklifingiz kiritildi' deb izoh qoldirish xushmuomalalikdir.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Files Changed: Uch Nuqtali Diff", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• GitHub 'Files Changed' bo'limi 'git diff base...head' ni ko'rsatadi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Bu merge base (umumiy ajdod)dan boshlab kiritilgan haqiqiy sof o'zgarishdir.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Asosiy tarmoqda boshqalar qilgan ishlar PR diff'ini chalg'itmaydi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Reviewer faqat siz yozgan yangi qatorlarga diqqatini qaratadi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Upstream Bilan Yangilash va Konfliktlar
  // ==========================================
  function sceneUpstreamVaKonflikt(u, bounds, o = {}) {
    chip(4, "Upstream Bilan Yangilash va Konfliktlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@laptop: ~/Projects/blink (sekin-blink)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: upstream remote qo'shish va fetch
      drawCommandLine("ali $ ", "git remote add upstream https://github.com/muallif/blink.git", 0.8, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("ali $ ", "git fetch upstream", 3.2, 4.5, 4.7, tu, 130, 235);
      drawOutputLine(" * [new branch]      main       -> upstream/main", 5.0, tu, 130, 258, { color: C.green, weight: 600 });

      // 2-buyruq: merge upstream/main va konflikt
      drawCommandLine("ali $ ", "git merge upstream/main", 6.0, 7.8, 8.0, tu, 130, 290);
      drawOutputLine("Auto-merging blink.ino", 8.3, tu, 130, 313, { color: '#94a3b8' });
      drawOutputLine("CONFLICT (content): Merge conflict in blink.ino", 8.5, tu, 130, 333, { color: C.red, weight: 700 });
      drawOutputLine("Automatic merge failed; fix conflicts and then commit.", 8.7, tu, 130, 353, { color: C.yellow });

      // 3-buyruq: konfliktni yechish va commit
      drawCommandLine("ali $ ", "git add blink.ino && git commit --no-edit", 10.2, 12.5, 12.7, tu, 130, 390);
      drawOutputLine("[sekin-blink f912fa3] Merge branch 'upstream/main' into sekin-blink", 13.0, tu, 130, 413, { color: C.green, weight: 600 });

      // 4-buyruq: push qilish
      drawCommandLine("ali $ ", "git push origin sekin-blink", 14.0, 15.8, 16.0, tu, 130, 450);
      drawOutputLine("To https://github.com/ali/blink.git", 16.3, tu, 130, 473, { color: '#94a3b8' });
      drawOutputLine("   bd9ee34..f912fa3  sekin-blink -> sekin-blink", 16.5, tu, 130, 493, { color: C.green, weight: 600 });
      drawOutputLine("PR holati: All checks passed. This branch has no conflicts!", 16.8, tu, 130, 513, { color: C.cyan, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Konfliktlarni Bartaraf Etish", "upstream bilan doimiy aloqa", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nega Upstream Remote Kerak?", 1125, 290, C.red, { size: 16, mono: false });
        text("• origin — sizning forkingiz; upstream — asl kanonik loyiha.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Siz kod yozayotganda, boshqalar asl main'ga yangi commitlar qo'shgan.", 1030, 365, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• 'git fetch upstream' orqali eng yangi o'zgarishlar tortib olinadi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Topic branchni upstream/main bilan yangilash ziddiyatlarni bartaraf etadi.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Konfliktni Kim Yechishi Kerak?", 1130, 500, C.green, { size: 16, mono: false });
        text("• Maintainer emas, aynan hissa qo'shuvchi o'z PR'ini toza holga keltirishi shart.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Merge yo'li: 'git merge upstream/main' — tarix to'liq saqlanadi va xavfsiz.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Rebase yo'li: 'git rebase upstream/main' + 'git push --force-with-lease'.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Ziddiyat yechilib push qilingach, GitHub merge tugmasini yashil qiladi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Maintainer Tomoni va 3 Ta Merge Usuli
  // ==========================================
  function sceneMaintainerVaMerge(u, bounds, o = {}) {
    chip(5, "Maintainer Tomoni va 3 Ta Merge Usuli", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'muallif@maintainer: ~/blink (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: yashirin ref orqali PRni lokal olish
      drawCommandLine("muallif $ ", "git fetch origin pull/1/head:pr-1 && git switch pr-1", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("From github.com/muallif/blink", 3.0, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine(" * [new ref]         refs/pull/1/head -> pr-1", 3.2, tu, 130, 248, { color: C.green, weight: 600 });
      drawOutputLine("Switched to branch 'pr-1'", 3.4, tu, 130, 268, { color: C.cyan });

      // 2-buyruq: testlarni ishga tushirish
      drawCommandLine("muallif $ ", "npm test", 4.5, 6.0, 6.2, tu, 130, 305);
      drawOutputLine("PASS: 12 tests passed, 0 failed. All green!", 6.5, tu, 130, 328, { color: C.green, weight: 700 });

      // 3-buyruq: merge qilish
      drawCommandLine("muallif $ ", 'git switch main && git merge --no-ff -m "Merge PR #1" pr-1', 7.8, 10.8, 11.0, tu, 130, 365);
      drawOutputLine("Merge made by the 'ort' strategy.", 11.3, tu, 130, 388, { color: C.green, weight: 600 });
      drawOutputLine(" blink.ino | 7 ++++---", 11.5, tu, 130, 408, { color: '#94a3b8' });

      // 4-buyruq: serverga push qilish
      drawCommandLine("muallif $ ", "git push origin main", 12.8, 14.5, 14.7, tu, 130, 445);
      drawOutputLine("To github.com:muallif/blink.git", 15.0, tu, 130, 468, { color: '#94a3b8' });
      drawOutputLine("   32a9d8e..6041429  main -> main", 15.2, tu, 130, 488, { color: C.green, weight: 600 });
      drawOutputLine("GitHub: Pull request #1 successfully MERGED and closed!", 15.5, tu, 130, 508, { color: C.cyan, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "GitHub'da 3 Ta Merge Usuli", "loyiha siyosatiga ko'ra tanlash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1. Create a Merge Commit (--no-ff)", 1145, 290, C.green, { size: 16, mono: false });
        text("• Hamma individual commitlar va branch tarixi to'liq saqlanadi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Alohida merge commiti yaratiladi (Merge made by ort strategy).", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Har bir commit alohida ahamiyatga ega bo'lgan katta loyihalar uchun qulay.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• GitHub'da 'refs/pull/<ID>/head' orqali maintainer PRni lokal sinay oladi.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2. Squash va 3. Rebase Merge", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Squash and merge: PR dagi 10 ta oraliq commit bitta toza commitga siqiladi.", 1030, 545, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("  Tarix ixcham va toza bo'ladi (mayda tuzatishlar asosiy shajarani bulg'amaydi).", 1030, 570, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• Rebase and merge: Commitlar chiziqli holda asosiy main ustiga qayta qo'yiladi.", 1030, 600, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  Har doim yangi SHA xesh va yangi committer yaratiladi.", 1030, 625, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Forkni Sinxronlash va Oltin Qoidalar
  // ==========================================
  function sceneSinxronizatsiyaVaXulosa(u, bounds, o = {}) {
    chip(6, "Forkni Sinxronlash va Oltin Qoidalar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@laptop: ~/Projects/blink (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: main'ni yangilash
      drawCommandLine("ali $ ", "git switch main && git merge --ff-only upstream/main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Updating b9efdb1..6041429 (Fast-forward)", 3.0, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 4 insertions(+), 2 deletions(-)", 3.2, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: forkka push
      drawCommandLine("ali $ ", "git push origin main", 4.2, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("To https://github.com/ali/blink.git", 6.3, tu, 130, 308, { color: '#94a3b8' });
      drawOutputLine("   b9efdb1..6041429  main -> main (Forkingiz upstream bilan tenglashdi!)", 6.5, tu, 130, 328, { color: C.green, weight: 700 });

      // 3-buyruq: topic branchni tozalash
      drawCommandLine("ali $ ", "git branch -d sekin-blink", 8.0, 9.8, 10.0, tu, 130, 365);
      drawOutputLine("Deleted branch sekin-blink (was f912fa3).", 10.3, tu, 130, 388, { color: C.cyan });

      // 4-buyruq: remote branchni ham o'chirish
      drawCommandLine("ali $ ", "git push origin --delete sekin-blink", 11.5, 13.8, 14.0, tu, 130, 425);
      drawOutputLine(" - [deleted]         sekin-blink", 14.3, tu, 130, 448, { color: C.red, weight: 600 });
      drawOutputLine("  # Toza muhit: keyingi hissa uchun yangi topic branch ochiladi!", 14.6, tu, 130, 470, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "GitHub Flow Xulosasi", "muhandislik madaniyati va qoidalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Forkni Doimiy Sinxron Saqlash", 1130, 290, C.cyan, { size: 16, mono: false });
        text("• PR qabul qilingach, GitHub forkingizni o'z-o'zidan yangilamaydi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• 'git merge --ff-only upstream/main' orqali lokal main'ni yangilang.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• So'ngra 'git push origin main' qilib forkingizni upstream bilan tenglang.", 1030, 395, { size: 15, color: C.cyan, align: 'left' });
        text("• Ishlatib bo'lingan eski topic branchlarni o'chirib tozalikni saqlang.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Muvaffaqiyatli PRning 4 Oltin Qoidasi", 1145, 500, C.green, { size: 16, mono: false });
        text("1. Bitta PR — bitta vazifa (kichik va ixcham PR juda tez tasdiqlanadi).", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("2. Tavsifda maqsadni aniq yozing va 'Fixes #ID' bilan bog'lang.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Hech qachon main'dan PR ochmang — faqat topic branch yarating.", 1030, 605, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("4. Reviewer takliflarini yangi commitlar orqali xushmuomala qabul qiling.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
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
      { id: 'topic_va_pr', fn: sceneTopicVaPr },
      { id: 'review_va_iteratsiya', fn: sceneReviewVaIteratsiya },
      { id: 'upstream_va_konflikt', fn: sceneUpstreamVaKonflikt },
      { id: 'maintainer_va_merge', fn: sceneMaintainerVaMerge },
      { id: 'sinxronizatsiya_va_xulosa', fn: sceneSinxronizatsiyaVaXulosa }
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
