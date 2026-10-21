// Git 02-bob videosi: "Terminal va o'rnatish"
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

  function code(str, x, y, opt = {}) {
    text(str, x, y, {
      size: opt.size || 16,
      fam: MONO,
      color: opt.color || C.cyan,
      weight: opt.weight || 500,
      align: 'left'
    });
  }

  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
    const tPrompt = opt.tPromptShow != null ? opt.tPromptShow : tStart - 0.4;
    if (u < tPrompt) return;

    const pCol = opt.promptCol || C.green;
    text(promptStr, x, y, { size: 15, fam: MONO, color: pCol, weight: 700, align: 'left' });
    const pw = tw(promptStr, 15, 700, MONO);

    if (u < tStart) {
      if (Math.floor(u * 3) % 2 === 0) {
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
      const isVisible = u < tTypeEnd ? true : (Math.floor(u * 4) % 2 === 0);
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
  // 1-SAHNA: Nega Buyruq Qatori (CLI)?
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("02-BOB · TERMINAL VA O'RNATISH", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Terminal va Git'ni O'rnatish", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Buyruq qatori imkoniyatlari, to'liq boshqaruv va har bir tizimda universal ishlash", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("GUI vs CLI (Buyruq Qatori) Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Grafik Interfeys (GUI)", 670, 615, C.yellow, { size: 18 });
          text("• Boshlanishida oson, lekin imkoniyatlari cheklangan", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Ko'p nozik buyruqlar va xatolarni tuzatish GUI'da yo'q", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Buyruq Qatori (CLI)", 1250, 615, C.cyan, { size: 18 });
          text("• 100% to'liq imkoniyatlar: reflog, cat-file, bisect...", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Har qanday serverda, Linux, macOS va Windowsda universal", 1010, 680, { size: 15, fam: MONO, color: C.cyan, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Nega Buyruq Qatori (CLI)?", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal afzalliklari
      panel(100, 140, 840, 680, C.blue, "Nega Aynan Terminal?", "professional dasturchining asosiy quroli", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("100% Imkoniyatlar Faqat Terminalda", 280, 290, C.cyan, { size: 16, mono: false });
        text("• Ko'p grafik dasturlar Git imkoniyatlarining faqat bir qismini ko'rsatadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Chuqur tuzatish vositalari (reflog, fsck, bisect) faqat CLI'da mavjud.", 150, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Aniq va Takrorlanuvchi Matn", 250, 470, C.green, { size: 16, mono: false });
        text("• Buyruq — bu matn: uni nusxalash, skriptga qo'yish yoki ulashish oson.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• 'Mana bu tugmani bosing' degan ko'rsatmadan ko'ra aniq va xatosiz.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Har Qanday Tizimda Bir Xil", 230, 655, C.mute, { size: 16, mono: false });
        text("• Masofaviy Linux serverda yoki bulutli muhitda grafik interfeys bo'lmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Terminalni bilsangiz, istalgan kompyuterda va serverda bemalol ishlaysiz.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: O'rnatish yo'llari
      panel(980, 140, 840, 680, C.git, "Operatsion Tizimlar Bo'yicha", "Linux, macOS va Windows", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Linux Tizimlarida", 1100, 290, C.yellow, { size: 16, mono: false });
        text("• Ubuntu/Debian: sudo apt install git", 1030, 335, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("• Fedora/CentOS: sudo dnf install git", 1030, 375, { size: 17, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("macOS Tizimlarida", 1100, 470, C.cyan, { size: 16, mono: false });
        text("• Terminalda git --version deb yozishning o'zi yetarli (Xcode taklif qiladi)", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Yoki Homebrew paket menejeri orqali: brew install git", 1030, 555, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Windows Tizimlarida", 1120, 655, C.git, { size: 16, mono: false });
        text("• git-scm.com/download/win saytidan Git for Windows yuklanadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• U o'zi bilan mashhur Git Bash va qulay vositalarni olib keladi.", 1030, 735, { size: 16, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: O‘rnatish va PATH Tahlili
  // (SPLIT-SCREEN: Real Terminal on Left, PATH on Right)
  // ==========================================
  function sceneOrnatishVaPath(u, bounds, o = {}) {
    chip(2, "O‘rnatish va PATH Tahlili", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git --version
      drawCommandLine("~ $ ", "git --version", 1.0, 2.2, 2.6, tu, 130, 205);
      drawOutputLine("git version 2.56.0", 2.7, tu, 150, 230, { color: C.cyan, weight: 600 });

      // 2-buyruq: git version
      drawCommandLine("~ $ ", "git version", 3.2, 4.3, 4.6, tu, 130, 258);
      drawOutputLine("git version 2.56.0  (git -v va git version bir xil)", 4.7, tu, 150, 283, { color: '#94a3b8' });

      // 3-buyruq: type -a git
      drawCommandLine("~ $ ", "type -a git", 5.2, 6.3, 6.7, tu, 130, 312);
      drawOutputLine("git is /opt/homebrew/bin/git", 6.8, tu, 150, 337, { color: C.green, weight: 600 });
      drawOutputLine("git is /usr/bin/git", 6.8, tu, 150, 357, { color: C.yellow, weight: 500 });

      // 4-buyruq: git --exec-path
      drawCommandLine("~ $ ", "git --exec-path", 7.4, 8.8, 9.2, tu, 130, 387);
      drawOutputLine("/opt/homebrew/libexec/git-core  (180+ ta ichki vosita)", 9.3, tu, 150, 412, { color: C.cyan });

      // 5-buyruq: PATH muhit o'zgaruvchisi tartibi
      drawCommandLine("~ $ ", "echo $PATH | tr ':' '\\n' | head -n 3", 10.0, 12.4, 12.8, tu, 130, 442, { promptCol: C.yellow });
      drawOutputLine("/opt/homebrew/bin   <- 1-bo'lib tekshiriladi!", 12.9, tu, 150, 468, { color: C.green, weight: 600 });
      drawOutputLine("/usr/local/bin", 12.9, tu, 150, 488, { color: '#94a3b8' });
      drawOutputLine("/usr/bin            <- Apple tizim Git'i", 12.9, tu, 150, 508, { color: C.yellow });

      // Faol prompt va miltillovchi kursor
      if (tu >= 13.5) {
        text("~ $ ", 130, 545, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("~ $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 545, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // Terminal pastida eslatma kartasi
      if (tu >= 14.5) {
        const kw = clamp((tu - 14.5) / 0.5);
        withA(kw, () => {
          ctx.fillStyle = 'rgba(56,189,248,0.10)';
          rr(130, 580, 780, 80, 10); ctx.fill();
          ctx.strokeStyle = 'rgba(56,189,248,0.35)'; ctx.lineWidth = 1.4; ctx.stroke();
          pill("PATH SIRI", 195, 620, C.cyan, { size: 13, mono: false });
          text("Yangi Git o'rnatgach versiya o'zgarmasa, sababi PATH tartibidir!", 255, 620, { size: 14, fam: MONO, color: C.text, weight: 600, align: 'left' });
        });
      }

      // O'ng tomonda: PATH va tizim tahlili paneli
      panel(980, 140, 840, 680, C.green, "PATH va Bir Nechta Git", "qaysi Git ishga tushishini nima hal qiladi", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Qaysi Git Ishga Tushadi?", 1140, 290, C.green, { size: 16, mono: false });
        text("• Kompyuterda tizim Git'i va alohida o'rnatilgan yangi Git bo'lishi mumkin.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Terminal PATH ro'yxatidagi papkalarni chapdan o'ngga qidirib, birinchisini oladi.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("type -a git Buyrug'i", 1120, 470, C.yellow, { size: 16, mono: false });
        text("• Tizimingizda nechta git dasturi borligini type -a git aniq ko'rsatadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Windows tizimida aynan shu ishni where git buyrug'i bajaradi.", 1030, 555, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 7.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Terminalni Qayta Ochish Kerak", 1160, 655, C.mute, { size: 16, mono: false });
        text("• Yangi paket o'rnatgach, ochiq turgan terminal yangi PATH'ni bilmasligi mumkin.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shuning uchun o'rnatgandan so'ng terminal oynasini qayta ochish tavsiya etiladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Buyruq Anatomiyasi va Exit Kod
  // (FULL DIAGRAM: Command formula and components)
  // ==========================================
  function sceneBuyruqAnatomiyasi(u, bounds, o = {}) {
    chip(3, "Buyruq Anatomiyasi va Exit Kod", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Buyruq strukturasi
      panel(100, 140, 840, 680, C.blue, "Git Buyrug'ining Formulasi", "aniq va tartibli mantiqiy tuzilma", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Kengaytirilgan Formula", 240, 290, C.cyan, { size: 16, mono: false });
        code("git [global] <buyruq> [opsiyalar] [argumentlar] [--] [yo'llar]", 150, 335, { size: 15, color: C.cyan });
        text("• Har bir Git buyrug'i qat'iy ushbu qoidalarga bo'ysunadi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 3.8, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Qisqa va To'liq Kalitlar", 240, 470, C.green, { size: 16, mono: false });
        text("• -m yoki --message (bitta tire bitta harf, ikkita tire to'liq so'z)", 150, 515, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• Qisqa kalitlar biriktirilishi mumkin: git commit -am 'xabar'", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG3 = P(u, 6.2, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Argumentlar va Yo'llar", 230, 655, C.mute, { size: 16, mono: false });
        text("• Argumentlar: branch nomi, commit hashi yoki tekshiriladigan obyekt.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Yo'llar: o'zgarish tegishi kerak bo'lgan aniq fayl yoki papkalar.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Exit kod
      panel(980, 140, 840, 680, C.yellow, "Exit Kod (Chiqish Kodi)", "skriptlar va avtomatlashtirish asosi", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Nol (0) — Muvaffaqiyat", 1120, 290, C.green, { size: 16, mono: false });
        code("$ echo $?  ->  0  (buyruq muvaffaqiyatli yakunlandi)", 1030, 335, { size: 15, color: C.green });
        text("• Terminalda buyruq xatosiz bajarganini 0 kodi bildiradi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.8, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Noldan Farqli — Xatolik (1, 128)", 1170, 470, C.red, { size: 16, mono: false });
        code("$ echo $?  ->  128  (fatal xatolik yuz berdi)", 1030, 515, { size: 15, color: C.red });
        text("• Git xato berganda maxsus kod qaytaradi, CI/CD skriptlar buni sezadi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 6.2, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Skriptlarda Bog'lash (&& va ||)", 1165, 655, C.mute, { size: 16, mono: false });
        code("git checkout main && git pull  (faqat 0 bo'lsa davom etadi)", 1030, 700, { size: 15, color: C.yellow });
        text("• && belgisi oldingi buyruq faqat 0 qaytarsagina keyingisini yurgazadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Global Opsiyalar va Ustunlik
  // (SPLIT-SCREEN: Real Terminal on Left, Hierarchy on Right)
  // ==========================================
  function sceneGlobalVaUstunlik(u, bounds, o = {}) {
    chip(4, "Global Opsiyalar va Ustunlik", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — global opsiyalar amalda (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git -C boshqa papkada ishlatish
      drawCommandLine("~ $ ", "git -C /var/www/loyiha status", 1.0, 3.0, 3.4, tu, 130, 210);
      drawOutputLine("On branch main  (papkaga kirmasdan tekshirildi)", 3.5, tu, 150, 238, { color: C.green, weight: 600 });
      drawOutputLine("nothing to commit, working tree clean", 3.5, tu, 150, 260, { color: '#94a3b8' });

      // 2-buyruq: git -c bir martalik sozlama
      drawCommandLine("~ $ ", "git -c user.name='Bot' commit -m 'avto'", 4.5, 7.2, 7.6, tu, 130, 295);
      drawOutputLine("[main 4c8e192] avto  (faqat shu buyruqda muallif Bot bo'ldi)", 7.7, tu, 150, 323, { color: C.yellow, weight: 600 });

      // 3-buyruq: git --no-pager
      drawCommandLine("~ $ ", "git --no-pager log -n 1 --oneline", 8.8, 11.2, 11.6, tu, 130, 358);
      drawOutputLine("4c8e192 avto  (less dasturiga kirmasdan to'g'ridan-to'g'ri chiqdi)", 11.7, tu, 150, 386, { color: C.cyan, weight: 600 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 12.5) {
        text("~ $ ", 130, 425, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("~ $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 425, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // Terminal pastida eslatma kartasi
      if (tu >= 13.5) {
        const kw = clamp((tu - 13.5) / 0.5);
        withA(kw, () => {
          ctx.fillStyle = 'rgba(255,209,102,0.10)';
          rr(130, 465, 780, 85, 10); ctx.fill();
          ctx.strokeStyle = 'rgba(255,209,102,0.35)'; ctx.lineWidth = 1.4; ctx.stroke();
          pill("GLOBAL PARAMETR", 220, 505, C.yellow, { size: 13, mono: false });
          text("Katta -C va kichik -c buyruqdan OLDIN qo'yiladi: git -C <yo'l> <buyruq>", 295, 505, { size: 14, fam: MONO, color: C.text, weight: 600, align: 'left' });
        });
      }

      // O'ng panel: Ustunlik Ierarxiyasi
      panel(980, 140, 840, 680, C.yellow, "Sozlamalar Ustunlik Ierarxiyasi", "bir xil parametr turli joyda berilsa", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("1-O'rin: Buyruq Kalitlari (Eng Yuqori)", 1190, 290, C.red, { size: 16, mono: false });
        text("• git -c user.name=... yoki buyruq ichidagi --author kaliti.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Qolgan barcha fayllar va muhit sozlamalarini ustidan yozadi.", 1030, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2-O'rin: Muhit O'zgaruvchilari", 1160, 470, C.yellow, { size: 16, mono: false });
        text("• GIT_AUTHOR_NAME, GIT_DIR kabi tizim o'zgaruvchilari.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Konfig fayllaridagi yozuvlardan ustun turadi, lekin kalitdan past.", 1030, 555, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 7.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3-O'rin: Konfig Fayllari (Bazaviy)", 1160, 655, C.mute, { size: 16, mono: false });
        text("• .git/config (lokal) -> ~/.gitconfig (global) -> /etc/gitconfig (tizim).", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Doimiy va standart sozlamalar shu fayllarda saqlanadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Ajratuvchi (--) va Glob Qashtirnoqlari
  // (SPLIT-SCREEN: Real Terminal on Left, Safety on Right)
  // ==========================================
  function sceneAjratuvchiVaQoshtirnoq(u, bounds, o = {}) {
    chip(5, "Ajratuvchi (--) va Glob Qashtirnoqlari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'zsh — ajratuvchi va xavfsizlik (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: ikki chiziqcha bilan ajratish
      drawCommandLine("loyiha $ ", "git checkout -- main.js", 1.0, 3.2, 3.6, tu, 130, 210);
      drawOutputLine("Updated 1 path from the index  (main branch emas, fayl tiklandi)", 3.7, tu, 150, 238, { color: C.green, weight: 600 });

      // 2-buyruq: glob qo'shtirnoqda
      drawCommandLine("loyiha $ ", "git log --oneline \"*.js\"", 4.8, 7.0, 7.4, tu, 130, 275, { promptCol: C.yellow });
      drawOutputLine("8a1b2c3 Yangi funksiyalar qo'shildi", 7.5, tu, 150, 303, { color: C.cyan, weight: 600 });
      drawOutputLine("1f7a7a4 Boshlang'ich skript", 7.5, tu, 150, 323, { color: '#94a3b8' });

      // Faol prompt va miltillovchi kursor
      if (tu >= 8.5) {
        text("loyiha $ ", 130, 360, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("loyiha $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 360, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // Terminal pastida xavfsizlik eslatmasi
      if (tu >= 9.5) {
        const kw = clamp((tu - 9.5) / 0.5);
        withA(kw, () => {
          ctx.fillStyle = 'rgba(239,68,68,0.12)';
          rr(130, 400, 780, 85, 10); ctx.fill();
          ctx.strokeStyle = 'rgba(239,68,68,0.35)'; ctx.lineWidth = 1.4; ctx.stroke();
          pill("XAVFSIZLIK QOIDASI", 230, 440, C.red, { size: 13, mono: false });
          text("Yulduzcha (*) har doim qo'shtirnoqda bo'lsin: git log \"*.js\"", 320, 440, { size: 14, fam: MONO, color: C.red, weight: 700, align: 'left' });
        });
      }

      // O'ng panel: Tushuntirish
      panel(980, 140, 840, 680, C.red, "Nomlar To'qnashuvi va Glob Xavfi", "adashishlar va xatolardan saqlanish", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ikki Chiziqcha (--) Kuch-Qudrati", 1180, 290, C.cyan, { size: 16, mono: false });
        text("• Agar loyihada main degan fayl va main degan branch bo'lsa:", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• git checkout -- main qilsangiz, Git uni aniq fayl deb biladi.", 1030, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.0, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nega Har Doim Qo'shtirnoq?", 1150, 470, C.red, { size: 16, mono: false });
        text("• Agar qo'shtirnoqsiz git add *.txt desangiz, terminal uni o'zi yoyadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Qo'shtirnoq ichida bo'lsa, Git barcha ichki papkalarni to'g'ri qamraydi.", 1030, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 6.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Skriptlarda Barqarorlik", 1140, 655, C.mute, { size: 16, mono: false });
        text("• Avtomatlashtirishda har doim -- va qat'iy nomlardan foydalaning.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Bu skriptlaringizni tasodifiy to'qnashuvlardan 100% himoya qiladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Tavsiyalar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Xulosalar
      panel(100, 140, 840, 680, C.green, "2-Bob Asosiy Xulosalari", "terminal va buyruq qoidalarining asosi", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Buyruq Qatori Universaldir", 250, 290, C.green, { size: 16, mono: false });
        text("• Git'ning barcha imkoniyatlari faqat terminalda to'liq ochiladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har qanday operatsion tizimda bir xil buyruqlar bilan ishlaysiz.", 150, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("PATH va Exec-Path Bilimi", 240, 470, C.cyan, { size: 16, mono: false });
        text("• type -a git orqali qaysi versiya birinchi ishga tushishini bilasiz.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi o'rnatgach, har doim terminal oynasini qayta ochish zarur.", 150, 555, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Anatomiya va Xavfsizlik", 230, 655, C.mute, { size: 16, mono: false });
        text("• Exit kod 0 muvaffaqiyat, -- ajratuvchisi xavfsizlik beradi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Glob shablonlarini har doim qo'shtirnoqqa olishni odat qiling.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tavsiyalar
      panel(980, 140, 840, 680, C.blue, "Kundalik Amaliy Tavsiyalar", "ish jarayonida doim yodda tuting", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.blue });
        pill("Eng So'nggi Versiyani Oling", 1150, 290, C.blue, { size: 16, mono: false });
        text("• Eski Git versiyalarida yangi buyruqlar (switch, restore) bo'lmasligi mumkin.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har doim rasmiy sayt yoki paket menejeri orqali yangilab turing.", 1030, 375, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Global -C Kalitidan Foydalaning", 1165, 470, C.yellow, { size: 16, mono: false });
        text("• Har safar cd qilib papkaga o'tish shart emas: git -C /yo'l status qulay.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bu skriptlar yozganda ayniqsa ko'p vaqt va xatolarni tejaydi.", 1030, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Keyingi Darsga Tayyorgarlik", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Git o'rnatilganini tekshirib oldik, endi uni sozlashga o'tamiz.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ism, email va boshqa qulay parametrlarni berishni o'rganamiz.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki tavsiya banneri
    const kAdv = P(u, 7.5, 0.5);
    withA(kAdv, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kAdv)) * 16);
      card(100, 840, 1720, 160, { fill: 'rgba(15,22,48,0.96)', col: C.git, lw: 2 });
      pill("Keyingi 03-bob", 220, 880, C.git, { size: 18, mono: false });
      text("Navbatdagi dars: Birinchi sozlash va yordam tizimi (git config)", 150, 930, { size: 22, weight: 700, color: C.text, align: 'left' });
      text("user.name, user.email, standart muharrir va git help yordam tizimidan foydalanishni to'liq o'rganamiz.", 150, 968, { size: 17, color: C.mute, align: 'left' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'ornatish_va_path', fn: sceneOrnatishVaPath },
      { id: 'buyruq_anatomiyasi', fn: sceneBuyruqAnatomiyasi },
      { id: 'global_va_ustunlik', fn: sceneGlobalVaUstunlik },
      { id: 'ajratuvchi_va_qoshtirnoq', fn: sceneAjratuvchiVaQoshtirnoq },
      { id: 'xulosa', fn: sceneXulosa }
    ];

    for (const s of scenes) {
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
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();
