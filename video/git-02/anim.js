// Git 02-bob videosi: "Terminal va o'rnatish"
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

  // ==========================================
  // 1-SAHNA: Kirish va Buyruq Qatori
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("02-BOB · AMALIY MUHIT", 960, 280, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Terminal va Git'ni O'rnatish", 960, 360, { size: 56, weight: 800, color: C.text });
        text("Nega aynan buyruq qatori (CLI) va tizimda Git qanday ishlaydi?", 960, 430, { size: 28, color: C.mute });

        // Markaziy terminal timsoli
        const kTerm = P(u, 2.0, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(560, 500, 800, 220, { fill: 'rgba(11,16,32,0.92)', col: C.blue, lw: 2 });
          pill("$ git --version", 960, 560, C.blue, { size: 24 });
          text("git version 2.56.0", 960, 630, { size: 26, fam: MONO, color: C.green, weight: 700 });
          ctx.restore();
        });
      });
      return;
    }

    // Solishtirish bosqichi (u >= 7.5 yoki poster)
    chip(1, "Nega Buyruq Qatori (CLI)?", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.0, 0.6));
    withA(kBox, () => {
      // Chap: GUI kamchiliklari
      panel(100, 140, 840, 680, C.red, "Grafik Dasturlar (GUI)", "tugmalar va cheklangan imkoniyatlar", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 150, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("1 · Cheklangan imkoniyatlar", 300, 290, C.red, { size: 16, mono: false });
        text("• GUI vositalari Git imkoniyatlarining faqat bir qismini beradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• reflog, cat-file, bisect, plumbing kabi buyruqlar GUI'da yo'q!", 150, 370, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.orange });
        pill("2 · Takrorlash va skriptlash qiyin", 320, 470, C.orange, { size: 16, mono: false });
        text("• 'Mana bu menyuni bosing...' ko'rsatmasini takrorlash mushkul.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• GUI amallarini avtomatlashtirib yoki CI/CD tizimlariga berib bo'lmaydi.", 150, 555, { size: 17, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 625, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.purple });
        pill("3 · Shaxsiy didga bog'liqlik", 290, 660, C.purple, { size: 16, mono: false });
        text("• Har bir dasturchida har xil dastur: VS Code, GitKraken, SourceTree...", 150, 705, { size: 17, color: C.text, align: 'left' });
        text("• Har birining tugmalari va nomlari bir-biridan farq qiladi.", 150, 745, { size: 17, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: CLI afzalliklari
      panel(980, 140, 840, 680, C.green, "Buyruq Qatori (CLI)", "asl kuch, aniqlik va universallik", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 150, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · 100% To'liq Imkoniyat", 1160, 290, C.green, { size: 16, mono: false });
        text("• Git'ning barcha 190 dan ortiq buyruqlari terminalda mavjud.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Tizimning asl xatti-harakati va chuqur mexanizmlari to'liq ochiladi.", 1030, 370, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Buyruq bu Matn — Aniq va Takrorlanuvchi", 1240, 470, C.blue, { size: 16, mono: false });
        text("• Matnli buyruqni hujjatga nusxalash, do'stga jo'natish juda oson.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bash, CI/CD va Docker skriptlarida bir xil barqaror ishlaydi.", 1030, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 625, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Universal Bilim", 1120, 660, C.yellow, { size: 16, mono: false });
        text("• Buyruq qatorini bilsangiz, istalgan GUI'ni osongina tushunasiz.", 1030, 705, { size: 17, color: C.text, align: 'left' });
        text("• Aksincha emas: tugmani bosish ortidagi mantig'ni anglatmaydi.", 1030, 745, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 14.5, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Buyruq qatori — barcha dasturchilar va platformalar uchun yagona, aniq va universal til.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Barcha keyingi boblardagi amallar terminalda sinab ko'riladi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: O'rnatish va PATH Mexanizmi
  // ==========================================
  function sceneOrnatishPath(u, bounds) {
    chip(2, "O‘rnatish va PATH Mexanizmi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Platformalarda o'rnatish
      panel(100, 140, 840, 680, C.blue, "Platformalarda O'rnatish", "Linux, macOS va Windows", kBox, kBox);

      // Linux
      const kLin = P(u, 1.2, 0.6);
      withA(kLin, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kLin)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.yellow });
        pill("Linux (Paket Menejeri)", 250, 290, C.yellow, { size: 16, mono: false });
        text("$ sudo apt install git-all", 150, 335, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Fedora/RHEL: sudo dnf install git-all", 150, 375, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // macOS
      const kMac = P(u, 3.2, 0.6);
      withA(kMac, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMac)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.blue });
        pill("macOS (Xcode & Homebrew)", 270, 470, C.blue, { size: 16, mono: false });
        text("$ xcode-select --install", 150, 515, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Homebrew orqali eng so'nggi versiya: brew install git", 150, 555, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Windows
      const kWin = P(u, 5.2, 0.6);
      withA(kWin, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kWin)) * 16);
        card(125, 615, 790, 170, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
        pill("Windows (Git for Windows)", 265, 650, C.purple, { size: 16, mono: false });
        text("https://git-scm.com/download/win", 150, 695, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("Tarkibida qulay 'Git Bash' terminali bilan birga keladi", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: PATH va qaysi git ishlayapti
      panel(980, 140, 840, 680, C.orange, "Qaysi Git Ishlayapti? (PATH)", "$PATH o'zgaruvchisi tartibi", kBox, kBox);

      const kP1 = P(u, 6.8, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("1 · Versiyani tekshirish", 1150, 290, C.orange, { size: 16, mono: false });
        text("$ git --version", 1030, 335, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("git version 2.56.0", 1030, 375, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kP2 = P(u, 9.2, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 450, 790, 195, { fill: 'rgba(15,22,48,0.92)', col: C.git });
        pill("2 · PATH Tartibi Masalasi", 1145, 485, C.git, { size: 16, mono: false });
        text("$ type -a git  (Windows'da: where git)", 1030, 530, { size: 17, fam: MONO, color: C.git, align: 'left' });
        text("1: /opt/homebrew/bin/git (2.56.0)  <- birinchi topilgani ishlaydi!", 1030, 570, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("2: /usr/bin/git           (2.50.1)  <- tizimdagi eski versiya", 1030, 605, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.8, 0.6);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 665, 790, 125, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        text("Muhim qoida: Yangi Git o'rnatgach versiya o'zgarmasa,", 1030, 705, { size: 17, color: C.text, align: 'left' });
        text("terminalni qayta oching va $PATH tartibini tekshiring!", 1030, 745, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Kompyuterda bir nechta Git bo'lishi mumkin; har doim qaysi biri faol ekanini biling.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi Git buyruqlarining ichki sintaktik tuzilishi bilan tanishamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Git Buyrug'ining Anatomiyasi
  // ==========================================
  function sceneBuyruqTuzilishi(u, bounds) {
    chip(3, "Git Buyrug‘ining Anatomiyasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Buyruq strukturasi
      panel(100, 140, 1080, 680, C.blue, "Buyruq Sintaktik Strukturasi", "barcha Git buyruqlari yagona qoidaga bo'ysunadi", kBox, kBox);

      // Katta sintaksis bloki
      const kSyn = P(u, 1.2, 0.6);
      withA(kSyn, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kSyn)) * 16);
        card(125, 255, 1030, 145, { fill: 'rgba(11,16,32,0.92)', col: C.blue, lw: 2 });
        text("git  [global]  <buyruq>  [opsiyalar]  [args]  [--]  [yo'llar]", 640, 310, { size: 26, fam: MONO, color: C.yellow, weight: 700 });
        text("Dastur   -C, -c   subcommand   -m, --oneline  commit   ajratuvchi fayl nomlari", 640, 355, { size: 16, fam: MONO, color: C.mute });
        ctx.restore();
      });

      // Misol tahlili
      const kEx = P(u, 3.5, 0.6);
      withA(kEx, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kEx)) * 16);
        card(125, 420, 1030, 240, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Amaliy Misol Tahlili", 250, 455, C.green, { size: 16, mono: false });
        text("$ git -C loyiha log --oneline main -- README.md", 150, 505, { size: 20, fam: MONO, color: C.text, align: 'left', weight: 600 });
        text("• -C loyiha   -> 'loyiha' papkasida ishga tushirish (global)", 150, 550, { size: 17, color: C.mute, align: 'left' });
        text("• log         -> ichki buyruq (tarixni ko'rish)", 150, 580, { size: 17, color: C.mute, align: 'left' });
        text("• --oneline   -> qisqa bir qatorlik format opsiyasi", 150, 610, { size: 17, color: C.mute, align: 'left' });
        text("• main -- README.md -> main brenchidagi faqat README.md o'zgarishlari", 150, 640, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // Yordamchi -h opsiyasi
      const kH = P(u, 5.8, 0.6);
      withA(kH, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH)) * 16);
        card(125, 680, 1030, 115, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Tezkor Konspekt: -h", 250, 715, C.purple, { size: 16, mono: false });
        text("Har qanday buyruq ortidan '-h' yozsangiz qisqa foydalanish qo'llanmasi chiqadi.", 150, 760, { size: 17, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Exit Code
      panel(1210, 140, 610, 680, C.orange, "Exit Code (Chiqish Kodi)", "skriptlar va CI uchun signal", kBox, kBox);

      const kE1 = P(u, 7.5, 0.6);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 16);
        card(1235, 255, 560, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("0 · Muvaffaqiyat", 1340, 290, C.green, { size: 16, mono: false });
        text("$ echo $?  -> 0", 1260, 335, { size: 19, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("Buyruq to'liq va muvaffaqiyatli bajarildi.", 1260, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE2 = P(u, 9.5, 0.6);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 16);
        card(1235, 435, 560, 170, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("128 & 129 · Xatolik", 1350, 470, C.red, { size: 16, mono: false });
        text("128 -> fatal: repo topilmadi", 1260, 515, { size: 17, fam: MONO, color: C.red, align: 'left' });
        text("129 -> xato yoki noma'lum opsiya", 1260, 550, { size: 17, fam: MONO, color: C.red, align: 'left' });
        text("Skriptlar xatolikni shu kod orqali tutadi.", 1260, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kE3 = P(u, 11.5, 0.6);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 16);
        card(1235, 625, 560, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Avtomatlashtirish Asosi", 1370, 660, C.yellow, { size: 16, mono: false });
        text("CI/CD pipeline'lar har bir buyruqning", 1260, 705, { size: 16, color: C.text, align: 'left' });
        text("exit code'ini tekshirib, xato bo'lsa darhol to'xtaydi.", 1260, 745, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Standart buyruq tuzilishi va aniq chiqish kodlari Git'ni kuchli avtomatlashtirish vositasiga aylantiradi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Endi global opsiyalar va sozlamalarning ustunlik tartibini ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: Global Opsiyalar va Ustunlik
  // ==========================================
  function sceneGlobalUstunlik(u, bounds) {
    chip(4, "Global Opsiyalar va Ustunlik", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Global opsiyalar
      panel(100, 140, 840, 680, C.purple, "Global Opsiyalar (-C va -c)", "istalgan Git buyrug'i bilan ishlatish mumkin", kBox, kBox);

      const kG1 = P(u, 1.2, 0.6);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("-C <yo'l> · Boshqa papkada bajarish", 310, 290, C.purple, { size: 16, mono: false });
        text("$ git -C /var/www/app status", 150, 340, { size: 19, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("• Papkaga 'cd' qilmasdan turib boshqa repozitoriy bilan ishlash.", 150, 385, { size: 17, color: C.text, align: 'left' });
        text("• Cron vazifalari va tashqi skriptlar uchun eng qulay usul.", 150, 420, { size: 17, color: C.mute, align: 'left' });
        text("• Bir nechta -C berilsa nisbiy yo'llar qo'shib hisoblanadi.", 150, 455, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 3.8, 0.6);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 520, 790, 265, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("-c <nom>=<qiymat> · Bir martalik sozlama", 320, 555, C.blue, { size: 16, mono: false });
        text("$ git -c color.ui=always status", 150, 605, { size: 19, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("• Konfiguratsiya faylini o'zgartirmasdan vaqtinchalik parametr berish.", 150, 650, { size: 17, color: C.text, align: 'left' });
        text("• Masalan: faqat bitta commit uchun muallif yoki rangni belgilash.", 150, 685, { size: 17, color: C.text, align: 'left' });
        text("• Buyruq tugashi bilan bu sozlama o'z-o'zidan bekor bo'ladi.", 150, 720, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Ustunlik qoidasi
      panel(980, 140, 840, 680, C.yellow, "Oltin Qoida: Ustunlik Ierarxiyasi", "kim g'olib: opsiya, muhit yoki fayl?", kBox, kBox);

      // 1-o'rin: Buyruq opsiyasi
      const kP1 = P(u, 6.2, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.12)', col: C.green, lw: 2.2 });
        pill("1-O'RIN (ENG YUQORI) · Buyruq Opsiyasi", 1240, 290, C.green, { size: 16, mono: false });
        text("git commit --author='Vali <vali@misol.uz>'", 1030, 335, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("Buyruq qatoridagi parametr har qanday boshqa sozlamani bekor qiladi!", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // 2-o'rin: Muhit o'zgaruvchisi
      const kP2 = P(u, 8.5, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("2-O'RIN (O'RTA) · Muhit O'zgaruvchisi", 1210, 470, C.orange, { size: 16, mono: false });
        text("export GIT_AUTHOR_NAME='Ali Valiyev'", 1030, 515, { size: 18, fam: MONO, color: C.orange, align: 'left', weight: 600 });
        text("Agar terminalda o'rnatilgan bo'lsa, config faylidagi qiymatdan ustun turadi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // 3-o'rin: Config sozlamasi
      const kP3 = P(u, 10.8, 0.6);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 615, 790, 170, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3-O'RIN (POYDEVOR) · Config Sozlamasi", 1210, 650, C.mute, { size: 16, mono: false });
        text("git config user.name 'Asosiy Ism'", 1030, 695, { size: 18, fam: MONO, color: C.mute, align: 'left' });
        text("Faqat buyruq opsiyasi va muhit o'zgaruvchisi bo'lmagandagina o'qiladi.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.yellow });
      text("Ustunlik qoidasi: Buyruq opsiyasi  >  Muhit o'zgaruvchisi  >  Konfig sozlamasi.", 960, 895, { size: 24, weight: 700, color: C.yellow, align: 'center' });
      text("'Sozlamani o'zgartirdim, lekin ishlamadi' degan muammoning siri ko'pincha shu yerda!", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Ajratuvchi va Xavfsizlik
  // ==========================================
  function sceneAjratuvchiQoshtirnoq(u, bounds) {
    chip(5, "Nozik Qoidalar va Xavfsizlik", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Ajratuvchi '--'
      panel(100, 140, 840, 680, C.blue, "Ajratuvchi '--' Belgisi", "revision va fayl yo'lini aniq ajratish", kBox, kBox);

      const kD1 = P(u, 1.2, 0.6);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Muammo · Nomlar To'qnashuvi", 280, 290, C.red, { size: 16, mono: false });
        text("Faraz qiling, repo'da 'HEAD' nomli haqiqiy fayl bor:", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("$ git diff HEAD", 150, 375, { size: 19, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("fatal: ambiguous argument 'HEAD': both revision and filename", 150, 415, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("Git bu so'z commitmi yoki fayl nomi ekanini bilmay to'xtaydi!", 150, 455, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kD2 = P(u, 3.8, 0.6);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(125, 520, 790, 265, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yechim · '--' Chegarasi", 240, 555, C.green, { size: 16, mono: false });
        text("git diff HEAD --   -> HEAD kommiti bilan solishtirish", 150, 605, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("git diff -- HEAD   -> faqat 'HEAD' nomli faylni solishtirish", 150, 645, { size: 17, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("• Qoida: '--' dan oldingisi revision, keyingisi fayl yo'li!", 150, 695, { size: 17, color: C.yellow, align: 'left', weight: 700 });
        text("• Skriptlarda doim '--' qo'yish kutilmagan xatolardan asraydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Wildcard va Qo'shtirnoq
      panel(980, 140, 840, 680, C.git, "Wildcard va Qo'shtirnoqlar", "shell'mi yoki Git'mi?", kBox, kBox);

      const kW1 = P(u, 6.2, 0.6);
      withA(kW1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kW1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Xavf · Qo'shtirnoqsiz Wildcard", 1170, 290, C.red, { size: 16, mono: false });
        text("$ git restore *.c  (qo'shtirnoqsiz)", 1030, 335, { size: 19, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("• Terminal buyruqni ishlatishdan oldin diskdagi fayllarga almashtiradi.", 1030, 380, { size: 16, color: C.text, align: 'left' });
        text("• Natija: O'chirilgan fayllar tiklanmaydi, tahrirlar esa yo'qolishi mumkin!", 1030, 415, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• macOS zsh esa 'no matches found' xatosi bilan to'xtab qoladi.", 1030, 450, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kW2 = P(u, 8.8, 0.6);
      withA(kW2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kW2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To'g'ri Shakl · Har doim Qo'shtirnoqda", 1210, 555, C.green, { size: 16, mono: false });
        text("$ git restore '*.c'", 1030, 605, { size: 19, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("• Shablon terminaldan o'tib, to'g'ridan-to'g'ri Git index'iga boradi.", 1030, 650, { size: 16, color: C.text, align: 'left' });
        text("• Git barcha papkalardagi o'chirilgan fayllarni ham xavfsiz tiklaydi.", 1030, 685, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Qo'shimcha: --end-of-options opsiya inyeksiyasidan saqlaydi.", 1030, 725, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 11.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.git });
      text("Fayl yo'llarini '--' bilan ajrating, shablonlarni esa har doim qo'shtirnoqqa oling!", 960, 895, { size: 24, weight: 700, color: C.git, align: 'center' });
      text("Bu ikkala odat skriptlaringizni xato va zaifliklardan 100% himoya qiladi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "02-Bob Xulosasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      const cards = [
        {
          num: "1",
          title: "CLI Asosiy Vosita",
          col: C.blue,
          items: [
            "Barcha 190+ buyruq faqat CLI'da",
            "GUI vositalarining haqiqiy asosi",
            "Skript va CI/CD bilan 100% mos",
            "Universal va takrorlanuvchi til"
          ]
        },
        {
          num: "2",
          title: "PATH va Tuzilish",
          col: C.green,
          items: [
            "Terminal $PATH bo'yicha qidiradi",
            "type -a git bilan tekshirish",
            "Exit code: 0 muvaffaqiyat, 128 xato",
            "Global opsiyalar: -C papka, -c parametr"
          ]
        },
        {
          num: "3",
          title: "Xavfsizlik Qoidalari",
          col: C.git,
          items: [
            "Opsiya > Muhit > Config ustunligi",
            "'--' bilan revision va yo'lni ajratish",
            "Wildcard'larni '*.c' qo'shtirnoqqa olish",
            "--end-of-options bilan inyeksiyadan himoya"
          ]
        }
      ];

      const cW = 540, cH = 480;
      cards.forEach((c, i) => {
        const cx = 100 + i * 590;
        const cy = 160;
        const kc = P(u, 0.6 + i * 0.4, 0.6);
        withA(kc, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kc)) * 16);
          card(cx, cy, cW, cH, { fill: 'rgba(15,22,48,0.92)', col: c.col });
          pill(c.num + " · " + c.title, cx + cW / 2, cy + 45, c.col, { size: 20, mono: false });

          c.items.forEach((item, j) => {
            const iy = cy + 120 + j * 80;
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; rr(cx + 35, iy, cW - 70, 60, 10); ctx.fill();
            ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(cx + 55, iy + 30, 6, 0, 7); ctx.fill();
            text(item, cx + 78, iy + 31, { size: 17, weight: 600, align: 'left', color: C.text });
          });
          ctx.restore();
        });
      });

      // Pastki xulosa
      const kFoot = P(u, 2.5, 0.8);
      withA(kFoot, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 680, 1720, 320, { fill: 'rgba(18,26,58,0.95)', col: C.git });
        text("Keyingi bob: 03 — Birinchi Sozlash va Yordam", 960, 745, { size: 34, weight: 800, color: C.git, align: 'center' });
        text("Git'da ism va email kiritish, ranglarni sozlash va 'git help' orqali yordam olishni o'rganamiz.", 960, 810, { size: 22, color: C.text, align: 'center' });
        text("E'tiboringiz uchun rahmat! · dev-docs.uz", 960, 875, { size: 20, weight: 600, color: C.mute, align: 'center' });
        ctx.restore();
      });
    });
  }

  // Asosiy kadr chizuvchi
  window.renderFrame = function (t) {
    bg(t);
    const sc = TM.scenes;
    if (t < sc.ornatish_va_path.s) {
      sceneIntro(t - sc.intro.s, { s: sc.intro.s, e: sc.intro.e });
    } else if (t < sc.buyruq_tuzilishi.s) {
      sceneOrnatishPath(t - sc.ornatish_va_path.s, { s: sc.ornatish_va_path.s, e: sc.ornatish_va_path.e });
    } else if (t < sc.global_va_ustunlik.s) {
      sceneBuyruqTuzilishi(t - sc.buyruq_tuzilishi.s, { s: sc.buyruq_tuzilishi.s, e: sc.buyruq_tuzilishi.e });
    } else if (t < sc.ajratuvchi_va_qoshtirnoq.s) {
      sceneGlobalUstunlik(t - sc.global_va_ustunlik.s, { s: sc.global_va_ustunlik.s, e: sc.global_va_ustunlik.e });
    } else if (t < sc.xulosa.s) {
      sceneAjratuvchiQoshtirnoq(t - sc.ajratuvchi_va_qoshtirnoq.s, { s: sc.ajratuvchi_va_qoshtirnoq.s, e: sc.ajratuvchi_va_qoshtirnoq.e });
    } else {
      sceneXulosa(t - sc.xulosa.s, { s: sc.xulosa.s, e: sc.xulosa.e });
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    bg(0);
    // 02-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("02-BOB · AMALIY MUHIT", 960, 160, C.git, { size: 26, mono: false });
    text("Terminal va Git'ni O'rnatish", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("Buyruq qatori anatomiyasi, PATH mexanizmi va xavfsizlik", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy terminal kartasi
    card(480, 410, 960, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("$ git --version", 960, 480, C.blue, { size: 24 });
    text("git version 2.56.0", 960, 550, { size: 28, fam: MONO, color: C.green, weight: 700 });
    text("$ type -a git  ->  /opt/homebrew/bin/git", 960, 620, { size: 20, fam: MONO, color: C.mute });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Buyruq qatori — barcha dasturchilar va platformalar uchun yagona, aniq va universal til.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Barcha keyingi boblardagi amallar terminalda sinab ko'riladi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
