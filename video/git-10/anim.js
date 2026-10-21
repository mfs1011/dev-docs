// Git 10-bob videosi: "Yaxshi commit"
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
  // 1-SAHNA: Kirish va Yaxshi Commitning 3 Ustuni
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("10-BOB · YAXSHI COMMIT", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Yaxshi Commit Madaniyati va 3 Ustun", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Surat (kod) Git uchun, xabar esa kelajakdagi insonlar va asboblar uchun xizmat qiladi", 960, 415, { size: 26, color: C.mute });

        // Markaziy 3 ustun kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Yaxshi Commitning Uch Asosiy Ustuni", 960, 530, C.blue, { size: 22 });

          card(400, 580, 340, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("1 · Toza O'zgarish", 570, 615, C.green, { size: 18 });
          text("Whitespace xatolarisiz toza diff", 570, 655, { size: 15, color: C.text });

          card(790, 580, 340, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("2 · Atomar Commit", 960, 615, C.blue, { size: 18 });
          text("Bitta commit — bitta vazifa", 960, 655, { size: 15, color: C.text });

          card(1180, 580, 340, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("3 · Yaxshi Xabar", 1350, 615, C.yellow, { size: 18 });
          text("50/72 qoidasi va 'nega' sababi", 1350, 655, { size: 15, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Yaxshi Commit Madaniyati va 3 Ustun", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Commit kim uchun yoziladi?
      panel(100, 140, 840, 680, C.yellow, "Commit Kim Uchun Yoziladi?", "surat git uchun, xabar insonlar uchun", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Git Majburlamaydi", 210, 290, C.yellow, { size: 16, mono: false });
        text("• Git har qanday hajmdagi va istalgan xabardagi commitni qabul qiladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Unda 'wip', 'fix' yoki bo'sh joy qoidalarini to'xtatuvchi majburiyat yo'q.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Insonlar va Asboblar Uchun", 240, 470, C.cyan, { size: 16, mono: false });
        text("• Bir yildan keyin bu tarixni siz, hamkasbingiz yoki 'git blame' o'qiydi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Aniq commit xabari soatlab behuda tekshiruv vaqtini tejaydi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Avtomatlashtirishga Poydevor", 245, 655, C.mute, { size: 16, mono: false });
        text("• rebase, bisect, revert va CHANGELOG sifatli commitlarga tayanadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Kelishuvga rioya qilsangiz, barcha Git asboblari siz uchun xizmat qiladi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 ta ustun
      panel(980, 140, 840, 680, C.blue, "Yaxshi Commitning 3 Asosiy Ustuni", "pro git va git loyihasi standarti", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Toza O'zgarish (Clean Diff)", 1170, 290, C.green, { size: 16, mono: false });
        text("• Ortiqcha bo'shliqlar, trailing whitespace xatolari bo'lmasin.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Tekshiruv: git diff --check va git diff --cached --check.", 1030, 375, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Atomar Commit (Atomic Scope)", 1170, 470, C.blue, { size: 16, mono: false });
        text("• Bitta commit — faqat bitta mustaqil mantiqiy o'zgarish.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bitta fayldagi ishlarni ajratish uchun: git add -p (patch).", 1030, 555, { size: 17, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Yaxshi Xabar (50/72 Qoidasi)", 1170, 655, C.yellow, { size: 16, mono: false });
        text("• 50 belgigacha qisqa sarlavha, bo'sh qator va 72 belgili tana.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Tanada kod nima qilgani emas, aynan NEGA qilgani tushuntiriladi.", 1030, 740, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Toza O'zgarish va Whitespace (SPLIT SCREEN)
  // ==========================================
  function sceneTozaOzgarish(u, bounds, o = {}) {
    chip(2, "Toza O'zgarish va Whitespace Nazorati", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda whitespace xatolarini tekshirish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/app-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git diff --check (u: 0.8 to 2.2, Enter 2.4)
      drawCommandLine("loyiha $ ", "git diff --check", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("app.py:1: trailing whitespace.", 2.6, tu, 130, 230, { color: C.red, weight: 600 });
      drawOutputLine("+def salom(ism):   ", 2.9, tu, 130, 252, { color: '#f87171' });
      drawOutputLine("app.py:2: space before tab in indent.", 3.2, tu, 130, 274, { color: C.red, weight: 600 });
      drawOutputLine("+ \t  return \"Salom, \" + ism", 3.5, tu, 130, 296, { color: '#f87171' });
      drawOutputLine("app.py:3: new blank line at EOF.", 3.8, tu, 130, 318, { color: C.red, weight: 600 });

      // 2-buyruq: echo $? (u: 4.8 to 5.6, Enter 5.8)
      drawCommandLine("loyiha $ ", "echo $?", 4.8, 5.6, 5.8, tu, 130, 350);
      drawOutputLine("2  # nol emas: whitespace xatosi mavjud!", 6.0, tu, 130, 374, { color: C.yellow, weight: 600 });

      // 3-buyruq: git add app.py && git diff --cached --check (u: 7.2 to 9.2, Enter 9.4)
      drawCommandLine("loyiha $ ", "git add app.py && git diff --cached --check", 7.2, 9.2, 9.4, tu, 130, 410);
      drawOutputLine("app.py:1: trailing whitespace.", 9.6, tu, 130, 434, { color: C.red });
      drawOutputLine("app.py:2: space before tab in indent.", 9.9, tu, 130, 456, { color: C.red });

      // 4-buyruq: git commit (pre-commit hook bloklaydi) (u: 11.0 to 12.8, Enter 13.0)
      drawCommandLine("loyiha $ ", "git commit -m \"Yangi xususiyat\"", 11.0, 12.8, 13.0, tu, 130, 492);
      drawOutputLine("pre-commit: whitespace xatolari aniqlandi!", 13.3, tu, 130, 518, { color: C.red, weight: 700 });
      drawOutputLine("Commit bekor qilindi. Iltimos bo'shliqlarni tozalang.", 13.7, tu, 130, 542, { color: C.yellow });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 14.5, tu, 130, 580, { color: '#334155' });
      drawOutputLine("Kafolat: pre-commit hook buzuvchi belgilarni", 15.0, tu, 130, 610, { color: C.cyan, weight: 600 });
      drawOutputLine("repo tarixiga kirmasidan avval darhol to'xtatadi!", 15.4, tu, 130, 635, { color: C.green, weight: 700 });

      // O'ng panel: Qoidalar va xavf tahlili
      panel(980, 140, 840, 680, C.red, "Whitespace Qoidalari va Xavfi", "core.whitespace va pre-commit himoyasi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Keng Tarqalgan Xatolar: core.whitespace", 1230, 290, C.red, { size: 16, mono: false });
        text("• blank-at-eol: Qator oxiridagi keraksiz bo'sh joy yoki tablar.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• space-before-tab: Qator chekinishida tab oldidan probel qo'yish.", 1030, 370, { size: 17, color: C.text, align: 'left' });
        text("• blank-at-eof: Fayl oxiriga qo'shilgan ortiqcha bo'sh qatorlar.", 1030, 400, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Nega Bu Juda Xavfli?", 1140, 470, C.yellow, { size: 16, mono: false });
        text("• Ko'zga ko'rinmaydi, lekin diffda keraksiz o'zgarish bo'lib chiqadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Boshqa dasturchilar bilan birlashishda (merge) sun'iy konflikt beradi!", 1030, 550, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Review jarayonida hamkasblarni chalg'itib, vaqtni behuda sarflaydi.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Avtomatlashtirish: pre-commit hook", 1200, 655, C.green, { size: 16, mono: false });
        text("• .git/hooks/pre-commit fayliga tekshiruv kodi joylanadi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Har safar 'git commit' berilganda diff avtomatik tekshiriladi.", 1030, 735, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Natija: Omborga faqat toza, xatosiz va sifatli kod o'tadi.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Atomar Commit va git add -p (SPLIT SCREEN)
  // ==========================================
  function sceneAtomarCommit(u, bounds, o = {}) {
    chip(3, "Atomar Commit va git add -p", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda interaktiv patch staging
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/app-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git diff app.py (u: 0.8 to 2.0, Enter 2.2)
      drawCommandLine("loyiha $ ", "git diff app.py", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("@@ -1,3 +1,3 @@  # 1-o'zgarish: f-string qo'shish", 2.4, tu, 130, 230, { color: C.cyan });
      drawOutputLine("-    return \"Salom, \" + ism", 2.7, tu, 130, 252, { color: C.red });
      drawOutputLine("+    return f\"Salom, {ism}!\"", 3.0, tu, 130, 274, { color: C.green, weight: 600 });
      drawOutputLine("@@ -10,3 +10,5 @@ def ortacha(sonlar):  # 2-o'zgarish: xato tuzatish", 3.3, tu, 130, 296, { color: C.cyan });
      drawOutputLine("+    if not sonlar:", 3.6, tu, 130, 318, { color: C.green });
      drawOutputLine("+        return 0", 3.9, tu, 130, 340, { color: C.green, weight: 600 });

      // 2-buyruq: git add -p app.py (u: 4.8 to 6.2, Enter 6.4)
      drawCommandLine("loyiha $ ", "git add -p app.py", 4.8, 6.2, 6.4, tu, 130, 372);
      drawOutputLine("(1/2) Stage this hunk [y,n,q,a,d,e,?]? n  # keyingi commitga", 6.8, tu, 130, 396, { color: C.yellow, weight: 600 });
      drawOutputLine("(2/2) Stage this hunk [y,n,q,a,d,e,?]? y  # faqat tuzatishni olish", 7.8, tu, 130, 420, { color: C.green, weight: 700 });

      // 3-buyruq: git status -s (u: 9.0 to 10.0, Enter 10.2)
      drawCommandLine("loyiha $ ", "git status -s", 9.0, 10.0, 10.2, tu, 130, 452);
      drawOutputLine("MM app.py  # bir qismi stage bo'ldi, bir qismi ishchi katalogda", 10.5, tu, 130, 476, { color: C.yellow, weight: 600 });

      // 4-buyruq: git commit (atomar qadam) (u: 11.5 to 13.5, Enter 13.8)
      drawCommandLine("loyiha $ ", "git commit -m \"fix: bo'sh ro'yxatda ortacha() xatosini tuzatish\"", 11.5, 13.5, 13.8, tu, 130, 508);
      drawOutputLine("[main 9e0b3cc] fix: bo'sh ro'yxatda ortacha() xatosini tuzatish", 14.1, tu, 130, 534, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 2 insertions(+)", 14.5, tu, 130, 558, { color: '#64748b' });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 15.0, tu, 130, 590, { color: '#334155' });
      drawOutputLine("Muvaffaqiyat: Bitta fayldagi 2 ta turli ish", 15.4, tu, 130, 618, { color: C.cyan, weight: 600 });
      drawOutputLine("mustaqil atomar commitlarga ajratib olindi!", 15.8, tu, 130, 642, { color: C.green, weight: 700 });

      // O'ng panel: Atomar commit falsafasi
      panel(980, 140, 840, 680, C.blue, "Atomar Commit Falsafasi", "bitta commit — bitta mantiqiy o'zgarish", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Monolit Commit Xavfi", 1140, 290, C.red, { size: 16, mono: false });
        text("• Bir hafta davomida qilingan 5 xil vazifani bitta commitga qorishtirmang.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bunday ulkan o'zgarishni tekshirish (code review) o'ta qiyinlashadi.", 1030, 370, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Bitta funksiya xato bersa, butun haftalik mehnatni bekor qilishga to'g'ri keladi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 6.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oltin Qoida: Atomar Birlik", 1160, 470, C.green, { size: 16, mono: false });
        text("• Har bir commit o'z-o'zidan to'liq va ishlaydigan holatda bo'lsin.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Xato tuzatilsa — uning testi bilan; yangilik qo'shilsa — hujjati bilan.", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Yarim chala kod kiritilmasin: testlar doim yashil o'tishi shart.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Kuchli Asboblaruchun Qulaylik", 1170, 655, C.blue, { size: 16, mono: false });
        text("• git revert: Boshqa ishlarga tegmasdan bitta xatoni bekor qilish mumkin.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• git bisect: Nosozlik keltirib chiqargan commitni soniyalarda aniqlaydi.", 1030, 735, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• cherry-pick: Kerakli o'zgarishni boshqa branchga olib o'tish juda oson.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Commit Xabari: 50/72 Qoidasi (SPLIT SCREEN)
  // ==========================================
  function sceneXabarTuzilishi(u, bounds, o = {}) {
    chip(4, "Commit Xabari: 50/72 Qoidasi", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda commit xabarini ko'rish va taqqoslash
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/app-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git log -1 --format='%B' (u: 0.8 to 2.4, Enter 2.6)
      drawCommandLine("loyiha $ ", "git log -1 --format='%B'", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("Bo'sh ro'yxatda ortacha() xato bermasin  # 1: Sarlavha (<=50)", 2.9, tu, 130, 230, { color: C.yellow, weight: 700 });
      drawOutputLine("                                         # 2: BO'SH QATOR", 3.2, tu, 130, 252, { color: C.red, weight: 600 });
      drawOutputLine("ortacha([]) chaqirilganda ZeroDivisionError bilan yiqiladi.", 3.5, tu, 130, 274, { color: '#e2e8f0' });
      drawOutputLine("Hisobot sahifasi bo'sh turgan foydalanuvchida shu muammo bor.", 3.8, tu, 130, 296, { color: '#e2e8f0' });
      drawOutputLine("Bo'sh ro'yxatga 0 qaytaramiz (None varianti rad etildi).", 4.1, tu, 130, 318, { color: C.green, weight: 600 });

      // 2-buyruq: git log --oneline -2 (bo'sh qator ta'siri) (u: 5.5 to 7.0, Enter 7.2)
      drawCommandLine("loyiha $ ", "git log --oneline -2", 5.5, 7.0, 7.2, tu, 130, 350);
      drawOutputLine("9e0b3cc Bo'sh ro'yxatda ortacha() xato bermasin", 7.5, tu, 130, 374, { color: C.green, weight: 600 });
      drawOutputLine("d16f2cb Kirishni tuzatish Parol bo'sh bo'lsa forma yuborilmaydi.", 8.0, tu, 130, 398, { color: C.red });
      drawOutputLine("        ^ (bo'sh qatorsiz: tana sarlavhaga ulanib ketgan!)", 8.4, tu, 130, 420, { color: C.yellow });

      // 3-buyruq: git format-patch -1 --stdout (u: 9.8 to 11.6, Enter 11.8)
      drawCommandLine("loyiha $ ", "git format-patch -1 --stdout 9e0b3cc | head -5", 9.8, 11.6, 11.8, tu, 130, 452);
      drawOutputLine("Subject: [PATCH] Bo'sh ro'yxatda ortacha() xato bermasin", 12.1, tu, 130, 476, { color: C.cyan, weight: 600 });
      drawOutputLine("Date: Wed, 21 Oct 2026 12:00:00 +0500", 12.5, tu, 130, 498, { color: '#64748b' });
      drawOutputLine("(Email mavzusiga faqat 1-qator tushdi, tana xat matniga o'tdi)", 13.0, tu, 130, 522, { color: C.green });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 13.8, tu, 130, 560, { color: '#334155' });
      drawOutputLine("Xulosa: Git birinchi bo'sh qatorgacha matnni sarlavha deb", 14.3, tu, 130, 590, { color: C.yellow, weight: 600 });
      drawOutputLine("taniydi. 2-qator bo'sh bo'lishi barcha asboblar uchun shart!", 14.8, tu, 130, 615, { color: C.green, weight: 700 });

      // O'ng panel: Tim Pope 50/72 standarti
      panel(980, 140, 840, 680, C.yellow, "Tim Pope 50/72 Qoidasi", "xabar strukturasi va 'nega' sababi", kBox, kBox);

      const kL1 = P(u, 1.0, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Sarlavha ≤ 50 Belgi (Subject)", 1210, 290, C.yellow, { size: 16, mono: false });
        text("• Qisqa va lo'nda: 'git log --oneline' va GitHub ro'yxatlari uchun.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Buyruq maylida yozing: 'Tuzatish', 'Qo'shish' ('Tuzatildi' emas).", 1030, 370, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Oxiriga nuqta qo'yilmaydi. Sarlavha nima qilinishini ifodalaydi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 6.0, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("2 · Majburiy Bo'sh Qator (Empty Line)", 1210, 470, C.red, { size: 16, mono: false });
        text("• Sarlavhadan keyin 2-qator har doim mutlaqo bo'sh bo'lishi shart!", 1030, 515, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Bo'sh qator bo'lmasa, rebase va log butun tanani sarlavhaga qo'shib yuboradi.", 1030, 550, { size: 17, color: C.text, align: 'left' });
        text("• Bu Git'ning eng asosiy strukturaviy talabidir.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL3 = P(u, 11.5, 0.5);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Tana: 'Nega' Sababi (Body ~72)", 1200, 655, C.green, { size: 16, mono: false });
        text("• Kod 'nima' qilganini ko'rsatadi, lekin 'NEGA' faqat xabarda bo'ladi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Qaysi muammo hal qilindi va qanday muqobillar rad etilganini yozing.", 1030, 735, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Har qator taxminan 72 belgida yangi satrga ko'chiriladi.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Trailerlar va Conventional Commits (SPLIT SCREEN)
  // ==========================================
  function sceneMetamalumotlar(u, bounds, o = {}) {
    chip(5, "Trailer'lar va Conventional Commits", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda trailerlar va conventional commits
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/app-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git commit -s --trailer (u: 0.8 to 3.2, Enter 3.4)
      drawCommandLine("loyiha $ ", "git commit -s -m \"feat(auth): SMS orqali kirish\" --trailer \"Refs: #42\"", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("[main 4f1a23b] feat(auth): SMS orqali kirish", 3.7, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine(" 2 files changed, 28 insertions(+)", 4.0, tu, 130, 252, { color: '#64748b' });

      // 2-buyruq: git log -1 --format=%B (u: 5.0 to 6.4, Enter 6.6)
      drawCommandLine("loyiha $ ", "git log -1 --format=%B", 5.0, 6.4, 6.6, tu, 130, 284);
      drawOutputLine("feat(auth): SMS orqali kirish  # Conventional Commit (feat)", 6.9, tu, 130, 308, { color: C.yellow, weight: 600 });
      drawOutputLine("Signed-off-by: Ali Valiyev <ali@dev>    # -s mualliflik tasdig'i", 7.4, tu, 130, 332, { color: C.cyan });
      drawOutputLine("Reviewed-by: Vali Aliyev <vali@dev>    # kod taqrizi tasdig'i", 7.8, tu, 130, 356, { color: C.purple });
      drawOutputLine("Refs: #42                              # topshiriq havolasi", 8.2, tu, 130, 380, { color: C.green, weight: 600 });

      // 3-buyruq: git interpret-trailers --parse (u: 9.6 to 11.6, Enter 11.8)
      drawCommandLine("loyiha $ ", "git log -1 --format=%B | git interpret-trailers --parse", 9.6, 11.6, 11.8, tu, 130, 412);
      drawOutputLine("Signed-off-by: Ali Valiyev <ali@dev>", 12.1, tu, 130, 436, { color: C.cyan });
      drawOutputLine("Reviewed-by: Vali Aliyev <vali@dev>", 12.4, tu, 130, 458, { color: C.purple });
      drawOutputLine("Refs: #42", 12.7, tu, 130, 480, { color: C.green });

      // 4-buyruq: trailer qiymatini ajratish (u: 13.5 to 15.0, Enter 15.2)
      drawCommandLine("loyiha $ ", "git log -1 --format='%(trailers:key=Refs,valueonly)'", 13.5, 15.0, 15.2, tu, 130, 512);
      drawOutputLine("#42  # CI/CD va robotlar bevosita o'qiydi", 15.5, tu, 130, 536, { color: C.yellow, weight: 700 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 16.0, tu, 130, 570, { color: '#334155' });
      drawOutputLine("Natija: Rasmiy metama'lumotlar avtomatlashtirilgan", 16.5, tu, 130, 600, { color: C.cyan, weight: 600 });
      drawOutputLine("relizlar va changelog yaratishni to'liq osonlashtiradi!", 17.0, tu, 130, 625, { color: C.green, weight: 700 });

      // O'ng panel: Trailerlar va Conventional Commits tahlili
      panel(980, 140, 840, 680, C.green, "Metama'lumotlar va Kelishuvlar", "rasmiy trailerlar va semantic versiyalash", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Git Trailer'lari (Kalit: Qiymat)", 1210, 290, C.cyan, { size: 16, mono: false });
        text("• Signed-off-by: DCO va mualliflik tasdig'i (-s opsiyasi bilan).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Co-authored-by: GitHub tomonidan tan olinadigan hammualliflik.", 1030, 370, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• Refs / Closes: Avtomatik yopiladigan task va PR raqamlari.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 6.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Conventional Commits: <tur>[scope]: <tavsif>", 1240, 470, C.green, { size: 16, mono: false });
        text("• feat: Yangi funksionallik qo'shish (MINOR versiya, 1.1.0).", 1030, 515, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• fix: Xatolikni tuzatish (PATCH versiya, 1.0.1).", 1030, 550, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• feat!: yoki BREAKING CHANGE: Moslik buzilishi (MAJOR, 2.0.0).", 1030, 580, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kR3 = P(u, 11.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Avtomatlashtirishning Afzalliklari", 1200, 655, C.yellow, { size: 16, mono: false });
        text("• CHANGELOG reliz paytida robotlar tomonidan avtomatik yoziladi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Versiya raqamlari semver bo'yicha inson aralashuvisiz ko'tariladi.", 1030, 735, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Loyihada tartib, shaffoflik va barqarorlik ta'minlanadi.", 1030, 765, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Commit Oldi Checklist va Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Commit Oldi Checklist va Xulosa", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // 3 ta parallel ustun (har biri w=540, h=520, y=140)
      // 1-ustun: Toza va Atomar
      panel(100, 140, 540, 520, C.yellow, "1 · Toza va Atomar", "whitespace va patch", kBox, kBox);
      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(120, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Tekshiruv Bosqichlari", 230, 290, C.yellow, { size: 15, mono: false });
        text("• git status", 140, 340, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("  Kutilmagan fayllar stage bo'lmadimi?", 140, 370, { size: 15, color: C.text, align: 'left' });
        text("• git diff --cached", 140, 410, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("  Commitga aynan nima ketyapti?", 140, 440, { size: 15, color: C.text, align: 'left' });
        text("• git diff --cached --check", 140, 480, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("  Whitespace xatolari yo'qmi?", 140, 510, { size: 15, color: C.text, align: 'left' });
        text("• Bitta mantiqiy vazifami?", 140, 550, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Kerak bo'lsa: git add -p", 140, 580, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // 2-ustun: Mustahkam Kod
      panel(690, 140, 540, 520, C.blue, "2 · Mustahkam Kod", "har commit mustaqil ishlasin", kBox, kBox);
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(710, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.blue });
        pill("Ishlash Kafolati", 800, 290, C.blue, { size: 15, mono: false });
        text("• Testlar to'liq o'tadimi?", 730, 340, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Har commitda barcha avtotestlar yashil.", 730, 370, { size: 15, color: C.text, align: 'left' });
        text("• To'liq kompilyatsiya", 730, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Yarim chala, buzuq kod kiritilmasin.", 730, 440, { size: 15, color: C.text, align: 'left' });
        text("• Test va hujjat birga", 730, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Xato tuzatilsa test, yangilik bo'lsa doc.", 730, 510, { size: 15, color: C.text, align: 'left' });
        text("• Bisect xavfsizligi", 730, 550, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("  Kelgusida nosozlik keltirmasin.", 730, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // 3-ustun: Ma'noli Xabar
      panel(1280, 140, 540, 520, C.green, "3 · Ma'noli Xabar", "insonlar uchun qadriyat", kBox, kBox);
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1300, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.green });
        pill("Xabar Qoidalari", 1390, 290, C.green, { size: 15, mono: false });
        text("• Sarlavha ≤ 50 belgi", 1320, 340, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Buyruq shaklida yozilsin.", 1320, 370, { size: 15, color: C.text, align: 'left' });
        text("• Majburiy bo'sh qator", 1320, 410, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  2-qator mutlaqo bo'sh bo'lsin.", 1320, 440, { size: 15, color: C.text, align: 'left' });
        text("• Tanada 'Nega' sababi", 1320, 480, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Qaror va rad etilgan muqobillar.", 1320, 510, { size: 15, color: C.text, align: 'left' });
        text("• Conventional Commits", 1320, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  feat, fix, docs turlariga rioya qiling.", 1320, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.5, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Bekor Qilish va Tiklash", 290, 725, C.git, { size: 16, mono: false });
        text("Keyingi 11-bobda: Xato commitni tuzatish — 'git commit --amend' va 'git restore' sirlari!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Oxirgi commitni xavfsiz yangilash, staging hududidan chiqarish va o'zgarishlarni bekor qilishni to'liq o'rganamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Yaxshi commit madaniyati — sifatli dasturiy ta'minot yaratishning eng mustahkam poydevoridir.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'toza_ozgarish', fn: sceneTozaOzgarish },
      { id: 'atomar_commit', fn: sceneAtomarCommit },
      { id: 'xabar_tuzilishi', fn: sceneXabarTuzilishi },
      { id: 'metamalumotlar', fn: sceneMetamalumotlar },
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