// Git 10-bob videosi: "Yaxshi commit"
// Canvas render (1920x1080, 30fps) — GIT-VIDEO-USLUBI.md
(function () {
  const ctx = document.getElementById('c').getContext('2d');
  const kit = window.GITKIT(ctx);
  const {
    W, H, C, UI, MONO,
    clamp, P, lerp, eo, eio, eback, font, withA, rr,
    tw, text, bg, ring, burst, link, pill,
    fileChip, chip, panel, card
  } = kit;

  const TM = window.TM, NR = window.NR;

  function code(str, x, y, opt = {}) {
    text(str, x, y, {
      size: opt.size || 16,
      fam: MONO,
      color: opt.color || C.cyan,
      weight: opt.weight || 500,
      align: 'left'
    });
  }

  // ==========================================
  // 1-SAHNA: Kirish va Yaxshi Commitning 3 Ustuni
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("10-BOB · YAXSHI COMMIT", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Yaxshi Commit Madaniyati va 3 Ustun", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Surat (kod) Git uchun, xabar esa insonlar uchun xizmat qiladi", 960, 415, { size: 26, color: C.mute });

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
          text("50/72 qoidasi va 'nega'", 1350, 655, { size: 15, color: C.text });

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
        text("• Unda 'wip', 'fix' yoki bo'sh joy qoidalarini majburlaydigan to'siq yo'q.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
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
  // 2-SAHNA: Toza O'zgarish va Whitespace Nazorati
  // ==========================================
  function sceneTozaOzgarish(u, bounds) {
    chip(2, "Toza O'zgarish va Whitespace Nazorati", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Whitespace xatolari
      panel(100, 140, 840, 680, C.red, "Whitespace Xatolari Nima?", "ko'rinmas, lekin diffni buzuvchi belgilar", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(255,255,255,0.025)', col: C.yellow });
        pill("Keng Tarqalgan Xatolar: core.whitespace", 310, 290, C.yellow, { size: 16, mono: false });
        text("• blank-at-eol: Qator oxiridagi keraksiz probel yoki tablar.", 150, 340, { size: 17, color: C.text, align: 'left' });
        text("• space-before-tab: Chekinishda (indent) tabdan oldin probel ishlatish.", 150, 385, { size: 17, color: C.text, align: 'left' });
        text("• blank-at-eof: Fayl oxiriga qo'shilgan ortiqcha bo'sh qatorlar.", 150, 430, { size: 17, color: C.text, align: 'left' });
        text("• trailing-space: Barcha keraksiz bo'shliqlarning umumiy nomi.", 150, 465, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Nega Bu Juda Xavfli?", 235, 550, C.red, { size: 16, mono: false });
        text("• Ko'zga ko'rinmaydi, lekin diffda soxta o'zgarish bo'lib chiqadi.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• Boshqa dasturchilar bilan merge paytida sun'iy konflikt keltirib chiqaradi!", 150, 645, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Review jarayonida hamkasblarni chalg'itib, vaqtni behuda sarflaydi.", 150, 690, { size: 17, color: C.text, align: 'left' });
        text("• Pro Git qoidasi: Har bir commit oldidan whitespace tozalanadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tekshiruv va avtomatik bloklash
      panel(980, 140, 840, 680, C.green, "Tekshirish va Avtomatik Bloklash", "git diff --check va pre-commit hook", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 255, { fill: 'rgba(11,16,32,0.94)', col: C.cyan, lw: 2 });
        pill("Terminal: git diff --check", 1150, 290, C.cyan, { size: 16, mono: false });
        code("$ git diff --cached --check", 1030, 335, { size: 16, color: C.yellow });
        code("app.py:1: trailing whitespace.", 1030, 375, { size: 16, color: C.red });
        code("+def salom(ism):   ", 1030, 410, { size: 15, color: C.mute });
        code("app.py:3: new blank line at EOF.", 1030, 445, { size: 16, color: C.red });
        code("$ echo $?  -> 2 (xato mavjud!)", 1030, 485, { size: 16, color: C.cyan, weight: 600 });
        ctx.restore();
      });

      const kR2 = P(u, 11.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 530, 790, 255, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("Avtomatlashtirish: pre-commit hook", 1200, 565, C.green, { size: 16, mono: false });
        text("• .git/hooks/pre-commit fayliga tekshiruv qo'shilsa:", 1030, 615, { size: 17, color: C.text, align: 'left' });
        text("• Whitespace xatosi bor commitni Git yaratishdan to'xtatadi!", 1030, 660, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Xatolik ekranga chiqadi va chiqish kodi 1 bo'lib rad etiladi.", 1030, 705, { size: 17, color: C.text, align: 'left' });
        text("• Natija: Omborga faqat toza, sifatli va xatosiz kod o'tadi.", 1030, 745, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Atomar Commit va git add -p
  // ==========================================
  function sceneAtomarCommit(u, bounds) {
    chip(3, "Atomar Commit va git add -p", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Monolit commit muammosi
      panel(100, 140, 840, 680, C.yellow, "Muammo: Ulkan Qorishma Commit", "hamma narsani bittaga yig'ish xavfi", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Zararli Odat: Monolit Commit", 260, 290, C.red, { size: 16, mono: false });
        text("• Bir hafta davomida 5 xil vazifa va tuzatishlar ustida ishlash.", 150, 340, { size: 17, color: C.text, align: 'left' });
        text("• Oxirida 'Hamma o'zgarishlar' deb bitta ulkan commit qilish.", 150, 385, { size: 17, color: C.text, align: 'left' });
        text("• Oqibat: Diffni review qilib bo'lmaydi, xatoni bekor qilish imkonsiz.", 150, 430, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Biror funksiya buzilsa, butun haftalik mehnat xavf ostida qoladi.", 150, 465, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("Oltin Qoida: Bitta Mantiqiy Qadam", 270, 550, C.green, { size: 16, mono: false });
        text("• Har bir commit — mustaqil, ishlaydigan mantiqiy qadam bo'lsin.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• Xato tuzatilsa — shu xatoni ushlaydigan test ham shu commitda.", 150, 645, { size: 17, color: C.text, align: 'left' });
        text("• Yangi imkoniyat qo'shilsa — hujjat va test bilan birga.", 150, 690, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Har commitda kod to'liq kompilyatsiya bo'lsin va testlardan o'tsin!", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Yechim: git add -p
      panel(980, 140, 840, 680, C.blue, "Yechim: git add -p (Patch Staging)", "fayl ichidagi o'zgarishlarni bo'laklash", kBox, kBox);

      const kR1 = P(u, 6.5, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 270, { fill: 'rgba(11,16,32,0.94)', col: C.cyan, lw: 2 });
        pill("Terminal: Interaktiv Patch Staging", 1180, 290, C.cyan, { size: 16, mono: false });
        code("$ git add -p app.py", 1030, 335, { size: 16, color: C.yellow });
        code("(1/2) Stage this hunk [y,n,q,a,d,e,?]? n  # bu o'zgarish keyinga", 1030, 375, { size: 15, color: C.cyan });
        code("(2/2) Stage this hunk [y,n,q,a,d,e,?]? y  # faqat xato tuzatish", 1030, 415, { size: 15, color: C.green, weight: 600 });
        code("$ git status -s  -> MM app.py (qisman stage)", 1030, 455, { size: 15, color: C.yellow });
        code("$ git commit -m \"Faqat xatoni tuzatish\"", 1030, 495, { size: 16, color: C.green });
        ctx.restore();
      });

      const kR2 = P(u, 10.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 545, 790, 240, { fill: 'rgba(180,108,255,0.06)', col: C.purple });
        pill("Kuchli Asboblarga Foydasi", 1150, 580, C.purple, { size: 16, mono: false });
        text("• git revert: Bitta commitni boshqalarga tegmasdan xavfsiz bekor qilish.", 1030, 630, { size: 17, color: C.text, align: 'left' });
        text("• git bisect: Regressiya va xatolarni soniyalarda aniqlash.", 1030, 675, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Review: Hamkasblar har bir o'zgarish niyatini osonlikcha tushunadi.", 1030, 720, { size: 17, color: C.text, align: 'left' });
        text("• cherry-pick: Kerakli o'zgarishni boshqa branchga olib o'tish juda oson.", 1030, 755, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Commit Xabari: 50/72 Qoidasi
  // ==========================================
  function sceneXabarTuzilishi(u, bounds) {
    chip(4, "Commit Xabari: 50/72 Qoidasi", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Tim Pope standarti
      panel(100, 140, 840, 680, C.blue, "Klassik Tim Pope Standarti", "50 ta belgili sarlavha, bo'sh qator va tana", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 230, { fill: 'rgba(11,16,32,0.94)', col: C.cyan, lw: 2 });
        pill("Xabar Shablon Strukturasi", 250, 290, C.cyan, { size: 16, mono: false });
        code("Qisqa sarlavha (50 belgigacha)        <- 1-qator: subject", 150, 335, { size: 16, color: C.yellow });
        code("                                      <- 2-qator: BO'SH QATOR", 150, 375, { size: 16, color: C.red, weight: 700 });
        code("Batafsil tushuntirish, kerak bo'lsa.  <- 3-qator: body", 150, 415, { size: 16, color: C.text });
        code("Taxminan 72 belgidan keyin bo'ling.", 150, 450, { size: 15, color: C.mute });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 505, 790, 280, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Nega 2-Qator Bo'sh Bo'lishi Shart?", 280, 540, C.red, { size: 16, mono: false });
        text("• Git birinchi bo'sh qatorgacha bo'lgan matnni sarlavha deb taniydi.", 150, 590, { size: 17, color: C.text, align: 'left' });
        text("• Bo'sh qator bo'lmasa, butun tana bitta xunuk sarlavhaga ulanib ketadi!", 150, 635, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• git log --oneline va GitHub xunuk, o'qib bo'lmas satr ko'rsatadi.", 150, 680, { size: 17, color: C.text, align: 'left' });
        text("• git format-patch email yuborishda butun matnni mavzuga tiqib qo'yadi.", 150, 725, { size: 17, color: C.yellow, align: 'left' });
        text("• Shuning uchun: 2-qator har doim mutlaqo bo'sh bo'lishi shart!", 150, 760, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tanada nima yoziladi?
      panel(980, 140, 840, 680, C.green, "Tanada Nima Yozilishi Kerak?", "kod nima qilganini emas, NEGA qilganini yozing", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 255, { fill: 'rgba(52,211,153,0.06)', col: C.green, lw: 2 });
        pill("Namunali Real Xabar (Pro Git)", 1170, 290, C.green, { size: 16, mono: false });
        code("Bo'sh ro'yxatda ortacha() xato bermasin", 1030, 335, { size: 16, color: C.yellow, weight: 600 });
        code("ortacha([]) chaqirilganda ZeroDivisionError bilan", 1030, 385, { size: 15, color: C.text });
        code("yiqiladi. Hisobot sahifasi bo'sh holatda turgan", 1030, 420, { size: 15, color: C.text });
        code("foydalanuvchilar uchun shu xato chiqayotgan edi.", 1030, 455, { size: 15, color: C.text });
        code("Bo'sh ro'yxatga 0 qaytaramiz (None rad etildi).", 1030, 490, { size: 15, color: C.green, weight: 600 });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 530, 790, 255, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Xabar Yozishning 3 Qoidasi", 1150, 565, C.yellow, { size: 16, mono: false });
        text("1. Buyruq maylida yozing: 'Tuzatish', 'Qo'shish' ('Tuzatildi' emas).", 1030, 615, { size: 17, color: C.text, align: 'left' });
        text("2. Muammoni hozirgi zamonda ta'riflang: 'funksiya yiqiladi'.", 1030, 660, { size: 17, color: C.text, align: 'left' });
        text("3. Nega bu yechim tanlandi va qanday muqobillar rad etildi?", 1030, 705, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Diff 'nima'ni ko'rsatadi, xabar esa 'nega'ni kelajakka yetkazadi.", 1030, 745, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Trailerlar va Conventional Commits
  // ==========================================
  function sceneMetamalumotlar(u, bounds) {
    chip(5, "Trailer'lar va Conventional Commits", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Git trailerlari
      panel(100, 140, 840, 680, C.blue, "Git Trailer'lari (Metama'lumotlar)", "xabar oxiridagi rasmiy kalit-qiymat bloklari", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(11,16,32,0.94)', col: C.cyan, lw: 2 });
        pill("Keng Tarqalgan Trailer Turlari", 260, 290, C.cyan, { size: 16, mono: false });
        code("Signed-off-by: Ali <ali@mail>      # mualliflik tasdig'i (-s)", 150, 335, { size: 15, color: C.yellow });
        code("Reviewed-by: Vali <vali@mail>      # kod taqrizi tasdig'i", 150, 375, { size: 15, color: C.green });
        code("Co-authored-by: Dono <dono@mail>   # GitHub hammualliflik", 150, 415, { size: 15, color: C.purple });
        code("Refs: #42                          # topshiriq havolasi", 150, 455, { size: 15, color: C.cyan });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(180,108,255,0.06)', col: C.purple });
        pill("git interpret-trailers Asbobi", 260, 550, C.purple, { size: 16, mono: false });
        text("• Trailerlar bo'sh qatordan keyin Kalit: qiymat shaklida yoziladi.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• CI/CD va skriptlar trailerlarni avtomatik ajratib o'qiy oladi.", 150, 645, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Git va Linux kabi yirik loyihalar sign-off'siz patch qabul qilmaydi.", 150, 690, { size: 17, color: C.text, align: 'left' });
        text("• GitHub hammualliflikni aynan Co-authored-by orqali tanidi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Conventional Commits
      panel(980, 140, 840, 680, C.green, "Conventional Commits Standarti", "avtomatik changelog va semantic versioning", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 255, { fill: 'rgba(11,16,32,0.94)', col: C.green, lw: 2 });
        pill("Tuzilishi: <tur>[scope]: <tavsif>", 1180, 290, C.green, { size: 16, mono: false });
        code("feat(auth): foydalanuvchini SMS bilan tasdiqlash", 1030, 335, { size: 15, color: C.green });
        code("fix(cart): narx hisoblashdagi yaxlitlash xatosini tuzatish", 1030, 375, { size: 15, color: C.yellow });
        code("docs(readme): o'rnatish qo'llanmasiga yangi buyruq qo'shish", 1030, 415, { size: 15, color: C.cyan });
        code("feat(api)!: eski API endpointlarini olib tashlash", 1030, 455, { size: 15, color: C.red, weight: 600 });
        code("boshqa turlar: refactor, test, perf, build, ci, chore", 1030, 490, { size: 14, color: C.mute });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 530, 790, 255, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Semantic Versioning Bilan Bog'liqlik", 1200, 565, C.yellow, { size: 16, mono: false });
        text("• fix: xatolik tuzatildi -> PATCH reliz (1.0.0 -> 1.0.1)", 1030, 615, { size: 17, color: C.text, align: 'left' });
        text("• feat: yangi imkoniyat qo'shildi -> MINOR reliz (1.0.0 -> 1.1.0)", 1030, 660, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• BREAKING CHANGE yoki ! -> MAJOR reliz (1.0.0 -> 2.0.0)", 1030, 705, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Butun CHANGELOG reliz paytida robotlar orqali avtomatik yoziladi!", 1030, 745, { size: 16, color: C.mute, align: 'left' });
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
