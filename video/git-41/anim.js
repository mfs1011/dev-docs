// anim.js — 41-bob: blame va bisect
// Realistik split-screen: terminal va kontseptual infografika
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
  // 1-SAHNA: Debugging Asboblari va git blame Asoslari
  // ==========================================
  function sceneBlameBasics(u, bounds, o = {}) {
    chip(1, "Debugging Asboblari va git blame Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git blame kalk.sh
      drawCommandLine("dev $ ", "git blame kalk.sh", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("^708ef6c (Ali Valiyev      2026-10-07 10:00  1) #!/bin/sh", 2.8, tu, 130, 228, { color: C.yellow });
      drawOutputLine("^708ef6c (Ali Valiyev      2026-10-07 10:00  4) qoshish() {", 3.0, tu, 130, 248, { color: C.yellow });
      drawOutputLine("f6f822b7 (Bekzod Toshev    2026-10-07 10:50  5)     echo $(($1 + $2))", 3.2, tu, 130, 268, { color: '#cbd5e1' });
      drawOutputLine("7a396bbe (Dilnoza Karimova 2026-10-07 10:05  8) ayirish() {", 3.4, tu, 130, 288, { color: C.green });

      // 2-buyruq: git blame -L 8,12 kalk.sh
      drawCommandLine("dev $ ", "git blame -L 8,12 kalk.sh", 4.5, 6.2, 6.4, tu, 130, 325);
      drawOutputLine("7a396bb (Dilnoza Karimova 10:05  8) ayirish() {", 6.8, tu, 130, 348, { color: C.green });
      drawOutputLine("f6f822b (Bekzod Toshev    10:50  9)     a=${1:-0}", 7.0, tu, 130, 368, { color: C.cyan });
      drawOutputLine("f6f822b (Bekzod Toshev    10:50 10)     b=${2:-0}", 7.2, tu, 130, 388, { color: C.cyan });
      drawOutputLine("f6f822b (Bekzod Toshev    10:50 11)     echo $((b - a))  # Xato!", 7.4, tu, 130, 408, { color: C.red, weight: 600 });
      drawOutputLine("7a396bb (Dilnoza Karimova 10:05 12) }", 7.6, tu, 130, 428, { color: C.green });

      // 3-buyruq: git blame -e -s -L 8,10 kalk.sh
      drawCommandLine("dev $ ", "git blame -s -L 8,10 kalk.sh", 9.0, 10.5, 10.7, tu, 130, 465);
      drawOutputLine("7a396bb  8) ayirish() {", 11.0, tu, 130, 488, { color: '#94a3b8' });
      drawOutputLine("f6f822b  9)     a=${1:-0}", 11.2, tu, 130, 508, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Har Bir Qatorning Tarixi", "kim, qachon va qaysi commitda", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git blame Ustunlari Ma'nosi", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Hash         : Qatorni oxirgi marta o'zgartirgan commitning qisqa ID si.", 1030, 335, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• ^ (chegara)  : Qator loyihaning eng birinchi commitidan beri o'zgarmagan.", 1030, 365, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Muallif/Sana : Qatorni yozgan muallif va oxirgi o'zgartirilgan sana.", 1030, 395, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• -L <bosh,oxir>: Katta faylda faqat kerakli qatorlarni filtrlaydi.", 1030, 420, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Git Tarixni Saqlamaydi, Hisoblaydi!", 1125, 500, C.green, { size: 16, mono: false });
        text("• Git har bir qator tarixini alohida saqlamaydi, balki diff qilib hisoblaydi.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• blame faqat HOZIR faylda mavjud qatorlar egasini ko'rsatadi.", 1030, 570, { size: 14, color: C.yellow, align: 'left' });
        text("• O'chirilgan qatorlarni qidirish uchun 'git log -S' (pickaxe) ishlatiladi.", 1030, 595, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Asosiy maqsad: 'kim aybdor' emas, balki kod kontekstini tushunishdir!", 1030, 620, { size: 14, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Format Commitlarini Chetlab O'tish
  // ==========================================
  function sceneBlameIgnoreFormat(u, bounds, o = {}) {
    chip(2, "Format Commitlarini Chetlab O'tish: -w va ignore-revs", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git blame -w -L 8,12 kalk.sh
      drawCommandLine("dev $ ", "git blame -w -L 8,12 kalk.sh", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("7a396bb (Dilnoza Karimova 10:05  8) ayirish() {", 3.0, tu, 130, 228, { color: C.green });
      drawOutputLine("07cab72 (Dilnoza Karimova 10:40  9)     a=${1:-0}", 3.2, tu, 130, 248, { color: C.cyan });
      drawOutputLine("07cab72 (Dilnoza Karimova 10:40 10)     b=${2:-0}", 3.4, tu, 130, 268, { color: C.cyan });
      drawOutputLine("07cab72 (Dilnoza Karimova 10:40 11)     echo $((b - a))  # Asl aybdor commit!", 3.6, tu, 130, 288, { color: C.red, weight: 700 });
      drawOutputLine("7a396bb (Dilnoza Karimova 10:05 12) }", 3.8, tu, 130, 308, { color: C.green });

      // 2-buyruq: cat .git-blame-ignore-revs
      drawCommandLine("dev $ ", "cat .git-blame-ignore-revs", 4.8, 6.2, 6.4, tu, 130, 345);
      drawOutputLine("# Format: tab o'rniga 4 ta bo'sh joy", 6.7, tu, 130, 368, { color: '#94a3b8' });
      drawOutputLine("f6f822b7c3a4e3fa462d81f968032b75d552e6a5", 7.0, tu, 130, 388, { color: C.yellow });

      // 3-buyruq: git config blame.ignoreRevsFile .git-blame-ignore-revs
      drawCommandLine("dev $ ", "git config blame.ignoreRevsFile .git-blame-ignore-revs", 8.2, 11.2, 11.4, tu, 130, 425);
      drawOutputLine("  # Endi barcha jamoa a'zolari uchun format shovqini yo'qoldi!", 11.8, tu, 130, 448, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Shovqinsiz Aniq Tahlil", "format commitlarini chetlab o'tish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Muammo va -w Kaliti", 1130, 290, C.purple, { size: 16, mono: false });
        text("• Prettier, linter yoki tab-to-space commitlari butun faylni o'zgartiradi.", 1030, 335, { size: 14, color: C.text, align: 'left' });
        text("• Natijada haqiqiy mantiqiy kod muallifi format commit ortida yashirinadi.", 1030, 360, { size: 14, color: C.red, align: 'left' });
        text("• '-w' : Ota va bola orasidagi bo'sh joy (whitespace) farqlarini hisobga olmaydi.", 1030, 390, { size: 14, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Shuning uchun har doim 'git blame -w' ishlatish tavsiya etiladi.", 1030, 420, { size: 14, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill(".git-blame-ignore-revs Fayli", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Formatlash commitlarining to'liq 40 belgili hashlarini faylga yozing.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• 'git config blame.ignoreRevsFile .git-blame-ignore-revs' deb sozlang.", 1030, 570, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("• GitHub va zamonaviy IDE'lar ham ushbu faylni avtomatik taniydi!", 1030, 595, { size: 14, color: C.cyan, align: 'left', weight: 600 });
        text("• Jamoangiz kodi doimo toza va haqiqiy mualliflar bilan ko'rinadi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Ko'chirilgan Kodni Kuzatish: -M va -C
  // ==========================================
  function sceneBlameMovedCode(u, bounds, o = {}) {
    chip(3, "Ko'chirilgan Kodni Kuzatish: -M va -C", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git blame qoshimcha.sh
      drawCommandLine("dev $ ", "git blame qoshimcha.sh", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("1fa08ad (Ali Valiyev 10:55  3) foiz() { echo $(($1 * $2 / 100)) }", 2.8, tu, 130, 228, { color: C.yellow });
      drawOutputLine("  # Ali faqat faylga ko'chirgan, lekin dastlab yozmagan!", 3.1, tu, 130, 248, { color: C.mute });

      // 2-buyruq: git blame -w -C10 -L 1,8 qoshimcha.sh
      drawCommandLine("dev $ ", "git blame -w -C10 -L 1,8 qoshimcha.sh", 4.5, 6.8, 7.0, tu, 130, 285);
      drawOutputLine("1fa08ad qoshimcha.sh (Ali Valiyev   10:55 1) # qoshimcha.sh", 7.4, tu, 130, 308, { color: '#94a3b8' });
      drawOutputLine("9c9033f kalk.sh      (Ali Valiyev   10:25 3) foiz() {", 7.6, tu, 130, 328, { color: C.cyan });
      drawOutputLine("9c9033f kalk.sh      (Ali Valiyev   10:25 4)     echo $(($1 * $2 / 100))", 7.8, tu, 130, 348, { color: C.cyan });
      drawOutputLine("89f3411 kalk.sh      (Bekzod Toshev 10:30 7) kvadrat() {", 8.0, tu, 130, 368, { color: C.green });
      drawOutputLine("31d016b kalk.sh      (Bekzod Toshev 10:35 8)     echo $(($1 * $1))", 8.2, tu, 130, 388, { color: C.green });

      // 3-buyruq: --score-debug
      drawCommandLine("dev $ ", "git blame -C10 --score-debug -L 3,4 qoshimcha.sh", 9.5, 11.8, 12.0, tu, 130, 425);
      drawOutputLine("9c9033f 14 02 kalk.sh (Ali Valiyev 10:25 3) foiz() {", 12.4, tu, 130, 448, { color: C.yellow });
      drawOutputLine("  # 14 ball: mos kelgan harf-raqam belgilari soni", 12.7, tu, 130, 468, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Refaktoring va Ko'chirilgan Kod", "asl muallifni qidirish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("-M va -C Darajalari", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• -M        : Bitta fayl ichida ko'chirilgan bloklarni qidiradi.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• -C        : Shu commitda o'zgargan boshqa fayllardan ko'chirishni topadi.", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• -C -C     : Fayl yaratilgan commitdagi barcha fayllardan qidiradi.", 1030, 395, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• -C -C -C  : Loyiha tarixidagi ISTALGAN commit va fayldan qidiradi.", 1030, 420, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Threshold Chegarasi (-C10)", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Standart chegara kamida 40 ta harf-raqam belgisidan iborat bo'lishi kerak.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• Qisqa funksiyalar uchun '-C10' berib chegarani 10 belgiga tushirish mumkin.", 1030, 570, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• '--score-debug' har bir blokning o'xshashlik ballini chiqaradi.", 1030, 595, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• Kod boshqa faylga ko'chirilsa ham, uning ilk yaratuvchisi unutilmaydi!", 1030, 620, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git bisect: Qo'lda Ikkilik Qidiruv
  // ==========================================
  function sceneBisectManual(u, bounds, o = {}) {
    chip(4, "git bisect: Qo'lda Ikkilik Qidiruv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (bisect)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git bisect start HEAD v1.0
      drawCommandLine("dev $ ", "git bisect start HEAD v1.0", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Bisecting: 3 revisions left to test (roughly 2 steps)", 3.0, tu, 130, 228, { color: C.cyan });
      drawOutputLine("[07cab72] Ayirish: bo'sh argumentlar 0 deb olinadi", 3.2, tu, 130, 248, { color: C.yellow });

      // 2-buyruq: sh kalk.sh ayirish 10 3
      drawCommandLine("dev $ ", "sh kalk.sh ayirish 10 3", 4.2, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("-7  # Xato! 7 bo'lishi kerak edi", 6.3, tu, 130, 308, { color: C.red, weight: 600 });

      // 3-buyruq: git bisect bad
      drawCommandLine("dev $ ", "git bisect bad", 7.2, 8.4, 8.6, tu, 130, 345);
      drawOutputLine("Bisecting: 1 revision left to test (roughly 1 step)", 8.9, tu, 130, 368, { color: C.cyan });
      drawOutputLine("[89f3411] Kvadrat amali (qoralama)", 9.1, tu, 130, 388, { color: C.yellow });

      // 4-buyruq: git bisect skip
      drawCommandLine("dev $ ", "git bisect skip  # Syntax buzuq bo'lgani uchun", 10.0, 12.2, 12.4, tu, 130, 425);
      drawOutputLine("[31d016b] Kvadrat: qavs tuzatildi", 12.7, tu, 130, 448, { color: C.yellow });

      // 5-buyruq: git bisect good
      drawCommandLine("dev $ ", "git bisect good  # Bu commitda ayirish to'g'ri ishladi", 13.5, 15.5, 15.7, tu, 130, 485);
      drawOutputLine("07cab72 is the first 'bad' commit!", 16.0, tu, 130, 508, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Ikkilik Qidiruv Algoritmi", "log2(N) tezligida aybdorni topish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bisect Qanday Ishlaydi?", 1125, 290, C.green, { size: 16, mono: false });
        text("• 'Yaxshi' va 'yomon' commitlar o'rtasidagi o'rtacha nuqtani tanlaydi.", 1030, 335, { size: 14, color: C.text, align: 'left' });
        text("• Dasturchi dasturni sinaydi: 'git bisect good' yoki 'git bisect bad'.", 1030, 365, { size: 14, color: C.cyan, align: 'left' });
        text("• Git oraliqni 2 barobar qisqartiradi: 1000 ta commit atigi 10 qadamda topiladi!", 1030, 395, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Xato qayerda ekanini bilmaganda eng samarali quroldir.", 1030, 420, { size: 14, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Skip: Sinab Bo'lmaydigan Commitlar", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Oraliq commitda sintaksis xato bo'lsa yoki dastur yig'ilmasa:", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• Uni 'good' yoki 'bad' deyish noto'g'ri — 'git bisect skip' qilinadi.", 1030, 570, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• Git boshqa qo'shni commitni sinov uchun tavsiya etadi.", 1030, 595, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• Oxirida birinchi xato commit aniqlanadi: 'first bad commit'.", 1030, 620, { size: 14, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: git bisect run: To'liq Avtomatlashtirilgan
  // ==========================================
  function sceneBisectRunAuto(u, bounds, o = {}) {
    chip(5, "git bisect run: To'liq Avtomatik Qidiruv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat ../tekshir.sh
      drawCommandLine("dev $ ", "cat ../tekshir.sh", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("#!/bin/sh", 2.8, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("sh -n kalk.sh 2>/dev/null || exit 125  # Syntax buzuq bo'lsa skip!", 3.0, tu, 130, 248, { color: C.yellow });
      drawOutputLine("[ \"$(sh kalk.sh ayirish 10 3)\" = 7 ]   # 0 = good, 1 = bad", 3.2, tu, 130, 268, { color: C.green });

      // 2-buyruq: git bisect start HEAD v1.0
      drawCommandLine("dev $ ", "git bisect start HEAD v1.0", 4.5, 6.3, 6.5, tu, 130, 305);
      drawOutputLine("Bisecting: 3 revisions left to test (roughly 2 steps)", 6.8, tu, 130, 328, { color: C.cyan });

      // 3-buyruq: git bisect run ../tekshir.sh
      drawCommandLine("dev $ ", "git bisect run ../tekshir.sh", 8.0, 10.2, 10.4, tu, 130, 365);
      drawOutputLine("running '../tekshir.sh' ... Bisecting ...", 10.7, tu, 130, 388, { color: '#cbd5e1' });
      drawOutputLine("07cab72 is the first 'bad' commit!", 11.2, tu, 130, 408, { color: C.green, weight: 700 });
      drawOutputLine("commit 07cab7241b1 (Ayirish: bo'sh argumentlar 0 deb olinadi)", 11.5, tu, 130, 428, { color: C.yellow });

      // 4-buyruq: git bisect reset
      drawCommandLine("dev $ ", "git bisect reset", 12.8, 14.0, 14.2, tu, 130, 465);
      drawOutputLine("Switched to branch 'main'  # Boshlang'ich holatga qaytildi!", 14.5, tu, 130, 488, { color: C.cyan });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "To'liq Avtomatlashtirilgan Bisect", "inson aralashuvisiz qidiruv", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Skript Qoidalari va Chiqish Kodlari", 1125, 290, C.red, { size: 16, mono: false });
        text("• exit 0   : Yaxshi (good/old) — sinov muvaffaqiyatli o'tdi.", 1030, 335, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• exit 1   : Yomon (bad/new) — xatolik yuz berdi.", 1030, 365, { size: 15, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("• exit 125 : Sinab bo'lmaydi (skip) — oraliq commitni o'tkazib yuborish.", 1030, 395, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• DIQQAT: exit 255 yoki exit -1 butun bisect jarayonini to'xtatadi!", 1030, 420, { size: 14, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Tashqi Skript Oltin Qoidasi", 1125, 500, C.cyan, { size: 16, mono: false });
        text("1. Sinov skriptini repo papkasidan TASHQARIDA saqlang (../tekshir.sh).", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("2. Aks holda Git commitlarni almashtirganda skript yo'qoladi yoki buziladi.", 1030, 570, { size: 14, color: C.yellow, align: 'left' });
        text("3. 'npm test', 'pytest' kabi buyruqlarni to'g'ridan-to'g'ri ishga solish mumkin.", 1030, 595, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("4. Qidiruv bir necha soniyada tugab, aybdor commitni ko'rsatadi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Maxsus Terminlar, Bisect Log va Reset
  // ==========================================
  function sceneBisectTermsReset(u, bounds, o = {}) {
    chip(6, "Maxsus Terminlar, Bisect Log va Reset", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git bisect start --term-old=tez --term-new=sekin
      drawCommandLine("dev $ ", "git bisect start --term-old=tez --term-new=sekin", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("Your current terms are 'tez' for old and 'sekin' for new", 3.5, tu, 130, 228, { color: C.cyan });

      // 2-buyruq: git bisect log > bisect.log
      drawCommandLine("dev $ ", "git bisect log > bisect.log", 4.8, 6.5, 6.7, tu, 130, 265);
      drawOutputLine("# Barcha qadamlar qayta bajariladigan skript sifatida saqlandi!", 7.0, tu, 130, 288, { color: C.yellow });

      // 3-buyruq: git bisect replay bisect.log
      drawCommandLine("dev $ ", "git bisect replay bisect.log", 8.2, 10.0, 10.2, tu, 130, 325);
      drawOutputLine("Bisecting: 1 revision left to test (to'g'irlangan qadamlar o'tdi)", 10.5, tu, 130, 348, { color: C.green });

      // 4-buyruq: git bisect reset
      drawCommandLine("dev $ ", "git bisect reset", 11.5, 12.8, 13.0, tu, 130, 385);
      drawOutputLine("Previous HEAD position was 31d016b", 13.3, tu, 130, 408, { color: '#94a3b8' });
      drawOutputLine("Switched to branch 'main' (Barcha BISECT_* ref'lari tozalandi!)", 13.5, tu, 130, 428, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Terminlar, Tarix va Qaytarish", "muhim qoidalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Moslashuvchan Terminlar", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Doimo ham 'good/bad' mos kelmaydi (masalan: tezlik pasayishi).", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• '--term-old <nom> --term-new <nom>' orqali erkin nom tanlang.", 1030, 365, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• Misol: fast/slow, broken/fixed, yoq/bor kabi qulay juftliklar.", 1030, 395, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Doimiy qoida: 'old' = 0 (eski holat), 'new' = 1 (yangi holat).", 1030, 420, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bisect Reset Majburiyligi", 1125, 500, C.green, { size: 16, mono: false });
        text("1. Bisect tugagach, HEAD detached holatda qoladi.", 1030, 545, { size: 14, color: C.red, align: 'left', weight: 600 });
        text("2. 'git bisect reset' bajarish SHART: vaqtinchalik ref'larni tozalaydi.", 1030, 575, { size: 14, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("3. 'git bisect log' va 'replay' adashib ketgan qadamlarni oson tuzatadi.", 1030, 600, { size: 14, color: C.yellow, align: 'left' });
        text("4. Git 2.56+: '--reset-when-found' topilishi bilan avtomatik reset qiladi.", 1030, 625, { size: 14, color: C.cyan, align: 'left' });
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
      { id: 'blame_basics', fn: sceneBlameBasics },
      { id: 'blame_ignore_format', fn: sceneBlameIgnoreFormat },
      { id: 'blame_moved_code', fn: sceneBlameMovedCode },
      { id: 'bisect_manual', fn: sceneBisectManual },
      { id: 'bisect_run_auto', fn: sceneBisectRunAuto },
      { id: 'bisect_terms_reset', fn: sceneBisectTermsReset }
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
    sceneBlameBasics(10.0, TM.scenes.blame_basics, { isPoster: true });
  };
})();
