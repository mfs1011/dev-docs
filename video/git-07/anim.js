// Git 07-bob videosi: "diff: nima o'zgardi"
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
  // 1-SAHNA: Kirish va O'zgarishlar Ko'zgusi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("07-BOB · DIFF: NIMA O'ZGARDI", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("git diff: O'zgarishlar Ko'zgusi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Fayllar ichida aynan qaysi qator qo'shildi yoki o'chdi — patch ko'rinishida", 960, 415, { size: 26, color: C.mute });

        // Markaziy diff oqimi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 475, 1200, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Diff Taqqoslash Yo'nalishlari", 960, 520, C.blue, { size: 22 });

          card(410, 565, 320, 105, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Working Tree", 570, 598, C.yellow, { size: 18 });
          text("Diskdagi o'zgarishlar", 570, 638, { size: 16, color: C.text });

          text("◄─ git diff ─►", 780, 618, { size: 16, fam: MONO, color: '#38bdf8', weight: 700 });

          card(830, 565, 320, 105, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("Staging (Index)", 990, 598, C.blue, { size: 18 });
          text("Commit qoralamasi", 990, 638, { size: 16, color: C.text });

          text("◄─ --staged ─►", 1200, 618, { size: 16, fam: MONO, color: C.green, weight: 700 });

          card(1250, 565, 270, 105, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("HEAD Commit", 1385, 598, C.green, { size: 18 });
          text("Oxirgi arxiv", 1385, 638, { size: 16, color: C.text });

          text("◄──────────────────── git diff HEAD ────────────────────►", 960, 715, { size: 15, fam: MONO, color: '#f59e0b', weight: 700 });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "git diff: O'zgarishlar Ko'zgusi", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: status vs diff
      panel(100, 140, 840, 680, C.yellow, "status va diff Farqi", "qaysi fayl vs qaysi qator", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git status — Fayllar Ro'yxati", 255, 290, C.yellow, { size: 16, mono: false });
        text("• Faqat QAYSI fayllar o'zgarganini yuqoridan umumiy ko'rsatadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl ichida aynan qanday o'zgarish bo'lganini aytmaydi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git diff — Qatorlar Kesimi", 230, 470, C.green, { size: 16, mono: false });
        text("• Fayl ichidagi har bir qatordagi farqlarni aniq patch shaklida chiqaradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi qo'shilgan, o'chirilgan va o'zgargan har bir belgini ko'rsatadi.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Patch Tushunchasi", 200, 655, C.mute, { size: 16, mono: false });
        text("• Patch (yamoq) — ikki fayl orasidagi farqlar to'plamidir.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Dasturchilar uchun kodni tahlil qilishning xalqaro standart tili.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Kundalik 2 Asosiy Savol
      panel(980, 140, 840, 680, C.blue, "Kundalik 2 Asosiy Savol", "git diff nimaga javob beradi", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1-SAVOL · Nimani hali stage qilmadim?", 1210, 290, C.yellow, { size: 16, mono: false });
        text("$ git diff", 1030, 335, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("Diskdagi ishchi fayllar va Index o'rtasidagi farqni ko'rsatadi.", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("Yana nimalarni 'git add' qilishingiz mumkinligini bilib olasiz.", 1030, 410, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2-SAVOL · Keyingi commitga nima kiradi?", 1200, 490, C.blue, { size: 16, mono: false });
        text("$ git diff --staged  (yoki --cached)", 1030, 535, { size: 18, fam: MONO, color: '#38bdf8', align: 'left', weight: 700 });
        text("Indexdagi qoralama va oxirgi commit o'rtasidagi farq.", 1030, 575, { size: 17, color: C.text, align: 'left' });
        text("Aynan nima saqlanishini commitdan oldin so'nggi tekshirish!", 1030, 610, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 655, 790, 130, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Hammasini jamlab ko'rish", 1140, 690, C.green, { size: 16, mono: false });
        text("$ git diff HEAD   ->   Working Tree va HEAD orasidagi jami farq", 1030, 735, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Uch Hudud va Uchta Diff (REAL TERMINAL AMALIYOTI)
  // ==========================================
  function sceneUchDiff(u, bounds, o = {}) {
    chip(2, "Uch Hudud va Uchta Diff Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminal Oynasi
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/kalkulyator (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 18.0 : u;

      // 1-buyruq: git status -s (u: 0.8 to 2.2, Enter at 2.4)
      drawCommandLine("kalkulyator $ ", "git status -s", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("M  README.md   # Index'da (staged, commitga tayyor)", 2.6, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine(" M hisob.py    # Ishchi papkada (unstaged qoralama)", 2.9, tu, 130, 252, { color: C.red, weight: 600 });

      // 2-buyruq: git diff (u: 3.8 to 5.2, Enter at 5.5)
      drawCommandLine("kalkulyator $ ", "git diff", 3.8, 5.2, 5.5, tu, 130, 285);
      drawOutputLine("diff --git a/hisob.py b/hisob.py", 5.7, tu, 130, 310, { color: '#64748b' });
      drawOutputLine("--- a/hisob.py", 6.0, tu, 130, 330, { color: C.red, weight: 700 });
      drawOutputLine("+++ b/hisob.py", 6.2, tu, 130, 350, { color: C.green, weight: 700 });
      drawOutputLine("@@ -7,3 +7,3 @@ def kopaytirish(a, b):", 6.5, tu, 130, 372, { color: '#38bdf8', weight: 700 });
      drawOutputLine("-    natija = a * b", 6.8, tu, 130, 394, { color: C.red, weight: 600 });
      drawOutputLine("+    natija = a * b  # ko'paytma", 7.1, tu, 130, 416, { color: C.green, weight: 600 });
      drawOutputLine("(README.md bu yerda yo'q — u allaqachon staged!)", 7.6, tu, 130, 440, { color: C.yellow });

      // 3-buyruq: git diff --staged (u: 9.8 to 12.0, Enter at 12.3)
      drawCommandLine("kalkulyator $ ", "git diff --staged", 9.8, 12.0, 12.3, tu, 130, 475);
      drawOutputLine("diff --git a/README.md b/README.md", 12.5, tu, 130, 500, { color: '#64748b' });
      drawOutputLine("--- a/README.md", 12.8, tu, 130, 520, { color: C.red, weight: 700 });
      drawOutputLine("+++ b/README.md", 13.0, tu, 130, 540, { color: C.green, weight: 700 });
      drawOutputLine("@@ -2,2 +2,3 @@", 13.3, tu, 130, 562, { color: '#38bdf8', weight: 700 });
      drawOutputLine("+Python 3.10+ talab qilinadi.", 13.6, tu, 130, 584, { color: C.green, weight: 600 });
      drawOutputLine("(Navbatdagi commitga aynan shu qator kiradi)", 14.1, tu, 130, 608, { color: C.cyan });

      // 4-buyruq: git diff HEAD (u: 15.0 to 16.5, Enter at 16.8)
      drawCommandLine("kalkulyator $ ", "git diff HEAD --stat", 15.0, 16.5, 16.8, tu, 130, 642);
      drawOutputLine(" README.md | 1 +", 17.0, tu, 130, 665, { color: C.text });
      drawOutputLine(" hisob.py  | 2 +-", 17.2, tu, 130, 685, { color: C.text });
      drawOutputLine(" 2 files changed, 2 insertions(+), 1 deletion(-)", 17.5, tu, 130, 707, { color: C.green, weight: 700 });

      // O'ng panel: Tahlil va Qoidalar
      panel(980, 140, 840, 680, C.blue, "Uch Hudud va Taqqoslash Mantiqi", "qaysi buyruq qayerdan o'qiydi", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · git diff (Working Tree ↔ Index)", 1210, 290, C.yellow, { size: 16, mono: false });
        text("• Diskdagi tahrirlangan faylni Index bilan solishtiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Hali 'git add' qilinmagan qoralamalarni ko'rsatadi.", 1030, 370, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• 'add'dan keyin diff bo'sh qaytadi — chunki farq Index'ga o'tdi!", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 7.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · git diff --staged (Index ↔ HEAD)", 1200, 470, C.blue, { size: 16, mono: false });
        text("• Index'dagi snapshot qoralamasini oxirgi commit bilan solishtiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Keyingi commit'ga nimalar kirishini aniq belgilaydi.", 1030, 550, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• '--cached' va '--staged' — to'liq sinonimlar, bir xil ishlaydi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 13.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 615, 790, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · git diff HEAD (Working Tree ↔ HEAD)", 1210, 650, C.green, { size: 16, mono: false });
        text("• Staged va unstaged barcha o'zgarishlarni jamlab ko'rsatadi.", 1030, 695, { size: 17, color: C.text, align: 'left' });
        text("• Oxirgi commit'dan beri diskda nimalar sodir bo'lganini bilish", 1030, 730, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("  va 'git commit -a' nimani saqlashini oldindan ko'rish uchun eng qulay.", 1030, 760, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Patch Formatini O'qish (SPLIT SCREEN)
  // ==========================================
  function scenePatchFormati(u, bounds, o = {}) {
    chip(3, "Patch Formatini O'qish San'ati", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Haqiqiy Terminal Diff Chiqishi
      terminal(100, 140, 840, 680, {
        title: 'bash — unified diff (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 18.0 : u;

      // Buyruq yozilishi (u: 0.6 to 2.0, Enter at 2.2)
      drawCommandLine("kalkulyator $ ", "git diff hisob.py", 0.6, 2.0, 2.2, tu, 130, 205);

      // Diff qatorlari chiqishi
      drawOutputLine("diff --git a/hisob.py b/hisob.py", 2.4, tu, 130, 235, { color: '#64748b' });
      drawOutputLine("index 6444213..6c51cef 100644", 2.7, tu, 130, 258, { color: '#64748b' });
      drawOutputLine("--- a/hisob.py", 3.0, tu, 130, 285, { color: C.red, weight: 700 });
      drawOutputLine("+++ b/hisob.py", 3.3, tu, 130, 308, { color: C.green, weight: 700 });
      drawOutputLine("@@ -9,7 +9,7 @@ def bolish(a, b):", 3.6, tu, 130, 335, { color: '#38bdf8', weight: 700 });

      drawOutputLine(" def kopaytirish(a, b):", 4.0, tu, 130, 362, { color: '#e2e8f0' });
      drawOutputLine("-    natija = a * b", 4.4, tu, 130, 388, { color: C.red, weight: 700 });
      drawOutputLine("+    natija = a * b  # ko'paytma", 4.8, tu, 130, 414, { color: C.green, weight: 700 });
      drawOutputLine("     return natija", 5.2, tu, 130, 440, { color: '#94a3b8' });
      drawOutputLine(" def bolish(a, b):", 5.5, tu, 130, 466, { color: '#e2e8f0' });
      drawOutputLine("-        raise ValueError(\"nolga bo'lib bo'lmaydi\")", 5.9, tu, 130, 492, { color: C.red, weight: 700 });
      drawOutputLine("+        raise ValueError(\"nolga bo'lish mumkin emas\")", 6.3, tu, 130, 518, { color: C.green, weight: 700 });
      drawOutputLine("     return a / b", 6.7, tu, 130, 544, { color: '#94a3b8' });

      // Pastki vizual eslatma
      drawOutputLine("--------------------------------------------------", 7.5, tu, 130, 580, { color: '#334155' });
      drawOutputLine("Qizil (-) : eskida bor edi, yangisida o'chirildi", 8.0, tu, 130, 608, { color: C.red, weight: 600 });
      drawOutputLine("Yashil (+): yangi versiyada qo'shilgan qator", 8.4, tu, 130, 632, { color: C.green, weight: 600 });
      drawOutputLine("Bo'shliq  : o'zgarmagan kontekst (standart 3 qator)", 8.8, tu, 130, 656, { color: C.mute });

      // O'ng panel: Patch elementlari izohi
      panel(980, 140, 840, 680, C.green, "Patch Belgilari Izohi", "har bir qator nimani anglatadi", kBox, kBox);

      const kE1 = P(u, 1.5, 0.5);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 16);
        card(1005, 255, 790, 150, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("--- a/fayl va Qizil Qatorlar (-)", 1210, 290, C.red, { size: 16, mono: false });
        text("• 'a/' versiyasi — eski fayl holati (oldingi snapshot).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Minus (-) bilan boshlangan qatorlar o'chirilganini bildiradi.", 1030, 370, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kE2 = P(u, 5.5, 0.5);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 16);
        card(1005, 425, 790, 150, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("+++ b/fayl va Yashil Qatorlar (+)", 1215, 460, C.green, { size: 16, mono: false });
        text("• 'b/' versiyasi — yangi fayl holati (keyingi snapshot).", 1030, 505, { size: 17, color: C.text, align: 'left' });
        text("• Plyus (+) bilan boshlangan qatorlar yangi kiritilganini bildiradi.", 1030, 540, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kE3 = P(u, 9.5, 0.5);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 16);
        card(1005, 595, 790, 190, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("@@ -9,7 +9,7 @@ (Hunk Koordinatasi)", 1240, 630, C.blue, { size: 16, mono: false });
        text("• Hunk — yaqin o'zgarishlar va uning atrofi koordinatasi:", 1030, 675, { size: 17, color: C.text, align: 'left' });
        text("  '-9,7'  -> eski faylda 9-qatordan boshlab 7 ta qator,", 1030, 710, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("  '+9,7'  -> yangi faylda 9-qatordan boshlab 7 ta qator.", 1030, 745, { size: 16, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Statistika va Brenchlar Farqi (SPLIT SCREEN)
  // ==========================================
  function sceneStatVaTaqqoslash(u, bounds, o = {}) {
    chip(4, "Statistika va Brenchlar Farqi", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminal Oynasi
      terminal(100, 140, 840, 680, {
        title: 'bash — diffstat va brenchlar (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git diff HEAD --stat (u: 0.8 to 2.4, Enter at 2.6)
      drawCommandLine("kalkulyator $ ", "git diff HEAD --stat", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine(" README.md | 1 +", 2.9, tu, 130, 235, { color: C.green, weight: 600 });
      drawOutputLine(" hisob.py  | 4 ++--", 3.2, tu, 130, 258, { color: '#f59e0b', weight: 600 });
      drawOutputLine(" 2 files changed, 3 insertions(+), 2 deletions(-)", 3.6, tu, 130, 285, { color: '#38bdf8', weight: 700 });

      // 2-buyruq: git diff main..feature (u: 5.5 to 7.2, Enter at 7.5)
      drawCommandLine("kalkulyator $ ", "git diff main..feature", 5.5, 7.2, 7.5, tu, 130, 325);
      drawOutputLine("diff --git a/hisob.py b/hisob.py", 7.8, tu, 130, 350, { color: '#64748b' });
      drawOutputLine("@@ -20,3 +20,7 @@ def bolish(a, b):", 8.1, tu, 130, 372, { color: '#38bdf8' });
      drawOutputLine("+def daraja(a, n):", 8.4, tu, 130, 395, { color: C.green, weight: 600 });
      drawOutputLine("+    return a ** n", 8.7, tu, 130, 418, { color: C.green, weight: 600 });

      // 3-buyruq: git diff --name-only (u: 10.5 to 12.0, Enter at 12.2)
      drawCommandLine("kalkulyator $ ", "git diff --name-only HEAD~1", 10.5, 12.0, 12.2, tu, 130, 460);
      drawOutputLine("README.md", 12.5, tu, 130, 485, { color: C.text });
      drawOutputLine("hisob.py", 12.8, tu, 130, 508, { color: C.text });

      // 4-buyruq: git diff commit1 commit2 (u: 13.8 to 15.2, Enter at 15.4)
      drawCommandLine("kalkulyator $ ", "git diff 0da34c3 870427f --stat", 13.8, 15.2, 15.4, tu, 130, 545);
      drawOutputLine(" hisob.py | 8 ++++++--", 15.7, tu, 130, 570, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 6 insertions(+), 2 deletions(-)", 16.0, tu, 130, 595, { color: '#38bdf8', weight: 600 });

      // O'ng panel: Qisqa ko'rinish va Brenchlar
      panel(980, 140, 840, 680, C.purple, "Statistika va Brenchlar Farqi", "qisqa ko'rinish va taqqoslash", kBox, kBox);

      const kD1 = P(u, 1.0, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("--stat (Diffstat Gistogrammasi)", 1190, 290, C.yellow, { size: 16, mono: false });
        text("• Yuzlab qatorlarni o'qimasdan oldin umumiy manzarani beradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi fayllar o'zgargani va ulardagi + / - nisbatini ko'rsatadi.", 1030, 370, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• '--name-only' — faqat fayl nomlari ro'yxatini qaytaradi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kD2 = P(u, 6.0, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(1005, 435, 790, 180, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Ikki Nuqta (..) vs Uch Nuqta (...)", 1210, 470, C.purple, { size: 16, mono: false });
        text("• main..feature — ikki brench uchlarini to'g'ridan-to'g'ri solishtiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• main...feature — umumiy ajdoddan beri aynan feature'da qilingan ishlar.", 1030, 550, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• GitHub Pull Request'lari aynan uch nuqtali diffni namoyish etadi!", 1030, 580, { size: 15, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kD3 = P(u, 11.0, 0.5);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 16);
        card(1005, 630, 790, 155, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Ixtiyoriy Commitlarni Solishtirish", 1200, 665, C.blue, { size: 16, mono: false });
        text("$ git diff <commit1> <commit2>", 1030, 710, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        text("Tarix bo'ylab istalgan ikki commit orasidagi farqni bilish mumkin.", 1030, 750, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Xavfsizlik va Oltin Odat
  // ==========================================
  function sceneXavfsizlik(u, bounds, o = {}) {
    chip(5, "Xavfsizlik va Dasturchi Oltin Odati", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Mutlaq xavfsizlik
      panel(100, 140, 840, 680, C.green, "100% Xavfsiz Buyruq", "faqat o'qish rejimida ishlaydi", kBase, kBase);

      const kS1 = P(u, 0.6, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Faqat O'qish (Read-Only)", 240, 290, C.green, { size: 16, mono: false });
        text("• git diff kodingizga hech qachon teginmaydi va o'zgartirmaydi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• U faqat disk, index va obyektlar bazasini qiyoslab o'qiydi.", 150, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS2 = P(u, 2.8, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Xohlagancha Ishlatish Mumkin", 255, 470, C.blue, { size: 16, mono: false });
        text("• Loyihangiz holatidan shubhalansangiz, qo'rqmasdan diff qiling.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Boshqa jamoa a'zolari ishini tekshirish uchun ham eng xavfsiz yo'l.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS3 = P(u, 5.0, 0.5);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Tashqi vositalar bilan ochish", 250, 655, C.mute, { size: 16, mono: false });
        text("$ git difftool", 150, 700, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text("VS Code yoki boshqa grafik dasturlarda vizual yonma-yon ko'rish.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Professional dasturchi odati
      panel(980, 140, 840, 680, C.yellow, "Dasturchining Oltin Odati", "ko'r-ko'rona saqlashga yo'l qo'ymang", kBase, kBase);

      const kO1 = P(u, 7.5, 0.5);
      withA(kO1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO1)) * 16);
        card(1005, 255, 790, 220, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Commit Oldidan Tekshiruv", 1150, 290, C.yellow, { size: 16, mono: false });
        text("1. Fayllarni stage qildingiz: $ git add .", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("2. DARHOL commit qilmang! Avval tekshiring:", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 700 });
        text("   $ git diff --staged", 1030, 415, { size: 18, fam: MONO, color: '#38bdf8', align: 'left', weight: 800 });
        text("3. Har bir qatorni ko'zdan kechirib, so'ng commit qiling.", 1030, 455, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kO2 = P(u, 10.5, 0.5);
      withA(kO2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO2)) * 16);
        card(1005, 495, 790, 290, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Nimalardan Himoya Qiladi?", 1140, 530, C.purple, { size: 16, mono: false });
        text("• Test paytida yozilgan 'console.log' va debug kodlari qolib ketmaydi.", 1030, 575, { size: 17, color: C.text, align: 'left' });
        text("• Tasodifiy probellar va noto'g'ri formatlashlar tarixga kirmaydi.", 1030, 615, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Commit xabarini aniqroq va professionalroq yozishga yordam beradi.", 1030, 655, { size: 16, color: '#38bdf8', align: 'left' });
        text("• Jamoangizdagi Code Review jarayonini sezilarli yengillashtiradi.", 1030, 695, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Maxfiy kalitlar (.env) tasodifan commit bo'lishini to'xtatadi.", 1030, 735, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: diff Buyruqlari Xaritasi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta xulosa paneli
      panel(100, 140, 1720, 500, C.blue, "Diff Buyruqlari Jamlanmasi", "qaysi vaziyatda qaysi biri ishlatiladi", kBase, kBase);

      const kMap = P(u, 0.8, 0.6);
      withA(kMap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMap)) * 16);

        // 3 blok
        // Blok 1: Oddiy diff (x=140)
        card(140, 260, 480, 210, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill("git diff", 380, 305, C.yellow, { size: 20 });
        text("Stage Qilinmagan Farqlar", 380, 350, { size: 18, weight: 700, color: C.text });
        text("Working Tree ↔ Index", 380, 385, { size: 15, fam: MONO, color: C.mute });
        text("Yana nimani qo'shishim kerak?", 380, 420, { size: 16, color: C.yellow, weight: 600 });

        // Blok 2: diff --staged (x=680)
        card(680, 260, 560, 210, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("git diff --staged", 960, 305, C.blue, { size: 20 });
        text("Commitga Kiradigan O'zgarishlar", 960, 350, { size: 18, weight: 700, color: C.text });
        text("Index ↔ HEAD", 960, 385, { size: 15, fam: MONO, color: C.mute });
        text("Keyingi commitga nimalar kiradi?", 960, 420, { size: 16, color: C.blue, weight: 600 });

        // Blok 3: diff HEAD (x=1300)
        card(1300, 260, 480, 210, { fill: 'rgba(52,211,153,0.10)', col: C.green, lw: 2 });
        pill("git diff HEAD", 1540, 305, C.green, { size: 20 });
        text("Barcha O'zgarishlar Jamlanmasi", 1540, 350, { size: 18, weight: 700, color: C.text });
        text("Working Tree ↔ HEAD", 1540, 385, { size: 15, fam: MONO, color: C.mute });
        text("Oxirgi commitdan beri butun farq", 1540, 420, { size: 16, color: C.green, weight: 600 });

        // Qo'shimcha qulay bayroqlar
        card(140, 490, 1640, 125, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qo'shimcha Qulay Bayroqlar", 300, 520, C.mute, { size: 16, mono: false });
        text("• $ git diff --stat        -> O'zgargan fayllar va qatorlar soni gistogrammasi", 170, 558, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("• $ git diff main..feature -> Ikki brench orasidagi o'zgarishlarni solishtirish", 170, 588, { size: 16, fam: MONO, color: C.green, align: 'left' });

        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 4.0, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: .gitignore, rm va mv", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 8-bobda keraksiz fayllarni chetlab o'tuvchi .gitignore va fayllarni o'chirish/ko'chirishni o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("git diff — ongli, toza va professional dasturlashning eng asosiy qurolidir.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'uch_diff', fn: sceneUchDiff },
      { id: 'patch_formati', fn: scenePatchFormati },
      { id: 'stat_va_taqqoslash', fn: sceneStatVaTaqqoslash },
      { id: 'xavfsizlik_va_amaliyot', fn: sceneXavfsizlik },
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
