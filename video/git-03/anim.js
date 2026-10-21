// Git 03-bob videosi: "Birinchi sozlash va yordam"
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
  // 1-SAHNA: Kirish va Sozlash
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("03-BOB · BIRINCHI SOZLASH VA YORDAM", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Birinchi Sozlash va Yordam", 960, 345, { size: 56, weight: 800, color: C.text });
        text("user.name, user.email, darajalar ierarxiyasi va oflayn yordam", 960, 415, { size: 26, color: C.mute });

        // Markaziy konfiguratsiya namunasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(440, 480, 1040, 240, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("$ git config list --show-origin", 960, 535, C.blue, { size: 22 });
          text("global  file:~/.gitconfig  user.name=Ali Valiyev", 960, 605, { size: 22, fam: MONO, color: C.green, weight: 600 });
          text("global  file:~/.gitconfig  user.email=ali@example.com", 960, 645, { size: 20, fam: MONO, color: '#38bdf8', weight: 500 });
          text("global  file:~/.gitconfig  init.defaultBranch=main", 960, 685, { size: 18, fam: MONO, color: C.mute });
          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Nega Sozlash Muhim?", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 7.8, 0.6));
    withA(kBox, () => {
      // Chap: Nega birinchi qadam?
      panel(100, 140, 840, 680, C.red, "Mualliflik Masalasi", "har bir kommitning ajralmas qismi", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("1 · Kriptografik Hash Poydevori", 290, 290, C.red, { size: 16, mono: false });
        text("• Muallif (author) va kommit qiluvchi (committer) to'liq yoziladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bu ma'lumotlar kommit obyektining kriptografik heshini hosil qiladi!", 150, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.4, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.orange });
        pill("2 · Shunchaki Tuzatib Bo'lmaydi", 280, 470, C.orange, { size: 16, mono: false });
        text("• Sozlamani keyin o'zgartirsangiz, u faqat kelgusi kommitlarga o'tadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Eski kommitdagi ismni tuzatish yangi hash yaratishni talab qiladi.", 150, 555, { size: 17, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(255,107,122,0.08)', col: C.purple });
        pill("3 · Jamoaviy Mas'uliyat va Statistika", 300, 655, C.purple, { size: 16, mono: false });
        text("• GitHub, GitLab va barcha CI tizimlari hisobni shu emailga bog'laydi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Noto'g'ri email bilan hissangiz (contributions) ko'rinmay qolishi mumkin.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: Git Config imkoniyatlari
      panel(980, 140, 840, 680, C.green, "Git Config Mexanizmi", "bitta buyruq, to'liq boshqaruv", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Bitta Yagona Buyruq", 1150, 290, C.green, { size: 16, mono: false });
        text("• Barcha sozlamalar 'git config' buyrug'i orqali boshqariladi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Juftlik ko'rinishida saqlanadi: bo'lim.kalit = qiymat", 1030, 375, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Oddiy Matnli Fayllar", 1150, 470, C.blue, { size: 16, mono: false });
        text("• Sozlamalar oddiy INI formatidagi ochiq fayllarda saqlanadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ularni ham terminaldan, ham sevimli matn muharririda ochsa bo'ladi.", 1030, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Doimiy Saqlanish", 1130, 655, C.yellow, { size: 16, mono: false });
        text("• Global sozlamalar bir marta kiritiladi va tizimda doimiy qoladi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Git dasturi yangilanganda ham sozlamalar hech qachon o'chib ketmaydi.", 1030, 740, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 14.8, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Git sozlamalari har bir kommitning tarixiy mualliflik poydevorini belgilaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi sozlamalarning 3 ta asosiy darajasi va ustunlik ierarxiyasini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: Konfiguratsiya Darajalari
  // ==========================================
  function sceneDarajalarUstunlik(u, bounds) {
    chip(2, "Konfiguratsiya Darajalari", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: 3 asosiy daraja
      panel(100, 140, 840, 680, C.blue, "Asosiy Konfiguratsiya Darajalari", "qaysi faylda va kimga ta'sir qiladi?", kBox, kBox);

      // System
      const kS1 = P(u, 1.2, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
        pill("1 · system (--system)", 230, 290, C.purple, { size: 16, mono: false });
        text("/etc/gitconfig", 150, 335, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("Kompyuterdagi barcha foydalanuvchilar va barcha repozitoriylar uchun.", 150, 375, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Global
      const kS2 = P(u, 3.8, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(125, 435, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · global (--global) · Eng Ko'p Ishlatiladigani", 330, 470, C.blue, { size: 16, mono: false });
        text("~/.gitconfig  yoki  ~/.config/git/config", 150, 515, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Faqat sizning shaxsiy foydalanuvchingiz va barcha loyihalaringiz uchun.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // Local
      const kS3 = P(u, 6.2, 0.6);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · local (--local) · Standart", 250, 655, C.green, { size: 16, mono: false });
        text(".git/config  (faqat shu repozitoriy ichida)", 150, 700, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Faqat bitta loyihaga tegishli; ish va shaxsiy loyihalarni ajratadi.", 150, 740, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ustunlik qoidasi
      panel(980, 140, 840, 680, C.yellow, "Oltin Qoida: Tor Daraja Ustun", "sozlamalar qanday tartibda o'qiladi?", kBox, kBox);

      const kP1 = P(u, 8.2, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("O'qilish Tartibi va Qayta Yozilish", 1210, 290, C.yellow, { size: 16, mono: false });
        text("system (/etc)  →  global (~/.gitconfig)  →  local (.git/config)", 1030, 340, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("Git fayllarni ketma-ket o'qiydi; eng oxirgi o'qilgan tor daraja g'olib bo'ladi!", 1030, 385, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 11.0, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 450, 790, 185, { fill: 'rgba(15,22,48,0.92)', col: C.git });
        pill("Amaliy Misol: Shaxsiy vs Ishchi Email", 1220, 485, C.git, { size: 16, mono: false });
        text("global: user.email = ali@shaxsiy.uz", 1030, 530, { size: 17, fam: MONO, color: C.mute, align: 'left' });
        text("local:  user.email = ali@ishxona.uz   ◄── G'OLIB!", 1030, 570, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("Natija: Ishchi repoda to'g'ri korporativ email bilan kommit qilinadi.", 1030, 605, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 13.8, 0.6);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 130, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Manbani Tekshirish Buyrug'i", 1180, 690, C.blue, { size: 16, mono: false });
        text("$ git config list --show-scope --show-origin", 1030, 735, { size: 18, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 16.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Qoida oddiy: Tor daraja keng darajadan ustun; lokal repozitoriy sozlamasi global sozlamani yengadi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi real terminalda identifikatsiyani o'rnatamiz va yangi Git 2.46+ subkomandalarini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Identifikatsiya va Sintaksis (SPLIT SCREEN)
  // ==========================================
  function sceneIdentifikatsiyaSintaksis(u, bounds, o = {}) {
    chip(3, "Identifikatsiya va Sintaksis", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/.gitconfig (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: user.name sozlash
      drawCommandLine("~ $ ", "git config set --global user.name 'Ali Valiyev'", 1.0, 3.4, 3.8, tu, 130, 205);

      // 2-buyruq: user.email sozlash
      drawCommandLine("~ $ ", "git config set --global user.email ali@example.com", 4.4, 6.8, 7.2, tu, 130, 235);

      // 3-buyruq: cat ~/.gitconfig ko'rish
      drawCommandLine("~ $ ", "cat ~/.gitconfig", 7.8, 8.9, 9.2, tu, 130, 265, { promptCol: C.yellow });
      drawOutputLine("[user]", 9.4, tu, 150, 292, { color: C.yellow, weight: 600 });
      drawOutputLine("	name = Ali Valiyev", 9.4, tu, 150, 314, { color: '#e2e8f0' });
      drawOutputLine("	email = ali@example.com", 9.4, tu, 150, 336, { color: '#38bdf8' });

      // 4-buyruq: git config get user.name
      drawCommandLine("~ $ ", "git config get user.name", 10.4, 12.0, 12.3, tu, 130, 366);
      drawOutputLine("Ali Valiyev", 12.5, tu, 150, 392, { color: C.green, weight: 600 });

      // 5-buyruq: git config list --global
      drawCommandLine("~ $ ", "git config list --global", 13.0, 14.8, 15.2, tu, 130, 422);
      drawOutputLine("user.name=Ali Valiyev", 15.4, tu, 150, 448, { color: '#cbd5e1' });
      drawOutputLine("user.email=ali@example.com", 15.4, tu, 150, 468, { color: '#38bdf8' });

      // Faol prompt va miltillovchi kursor
      if (tu >= 16.0) {
        text("~ $ ", 130, 502, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("~ $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 502, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Zamonaviy Sintaksis va Izoh
      panel(980, 140, 840, 680, C.orange, "Zamonaviy Git 2.46+ Subkomandalari", "aniq, xavfsiz va tizimli boshqaruv", kBox, kBox);

      const kS1 = P(u, 2.0, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("4 Ta Asosiy Subkomanda", 1140, 290, C.orange, { size: 16, mono: false });
        text("• git config set <kalit> <qiymat>   -> qiymat yozish", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config get <kalit>            -> qiymatni o'qish", 1030, 375, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config unset <kalit>          -> sozlamani o'chirish", 1030, 415, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config list                   -> barchasini ko'rish", 1030, 455, { size: 17, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 6.0, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yangi vs Eski Sintaksis Solishtiruvi", 1210, 550, C.green, { size: 16, mono: false });
        text("Yangi (2.46+):  git config get user.name", 1030, 595, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Eski shakl:     git config user.name (yoki --get)", 1030, 630, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("Eski shakllar hamon ishlaydi, ammo rasmiy hujjatda", 1030, 675, { size: 16, color: C.text, align: 'left' });
        text("eskirgan (deprecated) deb belgilangan.", 1030, 710, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("Tavsiya: Har doim yangi subkomandalarni ishlating!", 1030, 745, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 16.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Yangi subkomandalar konfiguratsiyani boshqarishni aniq, qulay va xavfsiz qiladi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Endi muharrir, standart brench va rang sozlamalarini amalda tekshiramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: Muhim Global Sozlamalar (SPLIT SCREEN)
  // ==========================================
  function sceneMuhimSozlamalar(u, bounds, o = {}) {
    chip(4, "Muhim Global Sozlamalar", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: init.defaultBranch main
      drawCommandLine("~ $ ", "git config set --global init.defaultBranch main", 1.0, 3.6, 4.0, tu, 130, 205);

      // 2-buyruq: core.editor "code --wait"
      drawCommandLine("~ $ ", "git config set --global core.editor 'code --wait'", 4.6, 7.2, 7.6, tu, 130, 235);

      // 3-buyruq: git config list --show-origin
      drawCommandLine("~ $ ", "git config list --show-origin", 8.2, 9.8, 10.1, tu, 130, 265, { promptCol: C.yellow });
      drawOutputLine("file:~/.gitconfig	user.name=Ali Valiyev", 10.3, tu, 150, 292, { color: '#94a3b8' });
      drawOutputLine("file:~/.gitconfig	user.email=ali@example.com", 10.3, tu, 150, 314, { color: '#94a3b8' });
      drawOutputLine("file:~/.gitconfig	init.defaultbranch=main", 10.3, tu, 150, 336, { color: C.green, weight: 600 });
      drawOutputLine("file:~/.gitconfig	core.editor=code --wait", 10.3, tu, 150, 358, { color: '#38bdf8', weight: 600 });

      // 4-buyruq: git var tekshiruvi
      drawCommandLine("~ $ ", "git var GIT_DEFAULT_BRANCH", 11.2, 12.8, 13.2, tu, 130, 390);
      drawOutputLine("main", 13.4, tu, 150, 416, { color: C.green, weight: 700 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 14.5) {
        text("~ $ ", 130, 452, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("~ $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 452, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Tushuntirish kartalari
      panel(980, 140, 840, 680, C.purple, "Standart Brench va Muharrir", "kundalik qulaylik va kelajak standartlari", kBox, kBox);

      const kM1 = P(u, 1.8, 0.6);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Standart Matn Muharriri (core.editor)", 1190, 290, C.purple, { size: 16, mono: false });
        text("$ git config set --global core.editor 'code --wait'", 1030, 340, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("• Kommit xabari va rebase amallari uchun VS Code ochiladi.", 1030, 385, { size: 17, color: C.text, align: 'left' });
        text("• Muhim: '--wait' kaliti kerak, aks holda kommit bo'sh qolib bekor bo'ladi!", 1030, 420, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Terminal ichida qolishni istasangiz: 'nano' yoki 'vim'.", 1030, 455, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kM2 = P(u, 6.5, 0.6);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Standart Brench Nomi: 'main'", 1160, 550, C.blue, { size: 16, mono: false });
        text("$ git config set --global init.defaultBranch main", 1030, 600, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("• Yangi repoda birinchi brench avtomatik ravishda 'main' bo'ladi.", 1030, 645, { size: 17, color: C.text, align: 'left' });
        text("• Git 3.0 da 'main' rasmiy standartga aylanadi.", 1030, 680, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• GitHub va GitLab standartlariga 100% to'liq mos keladi.", 1030, 715, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 16.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.git });
      text("Muharrir va standart brenchni oldindan belgilab qo'yish kundalik ishni ancha osonlashtiradi.", 960, 895, { size: 24, weight: 700, color: C.git, align: 'center' });
      text("Endi internetga ulanmasdan ishlaydigan rasmiy 'git help' tizimini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Git Help va Ma'lumotnoma (SPLIT SCREEN)
  // ==========================================
  function sceneYordamTizimi(u, bounds, o = {}) {
    chip(5, "Git Help va Ma’lumotnoma", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — git help (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git config -h (tezkor konspekt)
      drawCommandLine("~ $ ", "git config -h", 1.0, 2.4, 2.7, tu, 130, 205, { promptCol: C.purple });
      drawOutputLine("usage: git config [<options>]", 2.9, tu, 150, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("    --global      use global config file", 2.9, tu, 150, 250, { color: '#cbd5e1' });
      drawOutputLine("    --system      use system config file", 2.9, tu, 150, 270, { color: '#cbd5e1' });
      drawOutputLine("    --local       use repository config file", 2.9, tu, 150, 290, { color: '#cbd5e1' });
      drawOutputLine("    --show-origin show origin of config", 2.9, tu, 150, 310, { color: '#38bdf8' });

      // 2-buyruq: git help -g (konseptual qo'llanmalar)
      drawCommandLine("~ $ ", "git help -g", 4.5, 5.8, 6.2, tu, 130, 342, { promptCol: C.green });
      drawOutputLine("The Git concept guides are:", 6.4, tu, 150, 368, { color: C.green, weight: 600 });
      drawOutputLine("   everyday   A useful minimum set of commands", 6.4, tu, 150, 388, { color: '#cbd5e1' });
      drawOutputLine("   glossary   A Git Glossary and core concepts", 6.4, tu, 150, 408, { color: '#cbd5e1' });
      drawOutputLine("   workflows  An overview of recommended workflows", 6.4, tu, 150, 428, { color: '#cbd5e1' });

      // 3-buyruq: git help config (to'liq oflayn man page)
      drawCommandLine("~ $ ", "git help config", 8.2, 9.8, 10.2, tu, 130, 460, { promptCol: C.git });
      drawOutputLine("GIT-CONFIG(1)            Git Manual            GIT-CONFIG(1)", 10.4, tu, 150, 486, { color: '#38bdf8', weight: 700 });
      drawOutputLine("NAME", 10.4, tu, 150, 508, { color: C.yellow, weight: 600 });
      drawOutputLine("       git-config - Get and set options", 10.4, tu, 150, 528, { color: '#cbd5e1' });
      drawOutputLine("DESCRIPTION", 10.4, tu, 150, 548, { color: C.yellow, weight: 600 });
      drawOutputLine("       You can query/set/replace/unset options.", 10.4, tu, 150, 568, { color: '#94a3b8' });
      drawOutputLine("       (Chiqish uchun 'q' tugmasini bosing)", 10.4, tu, 150, 590, { color: C.red, weight: 600 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 13.5) {
        text("~ $ ", 130, 626, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("~ $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 626, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: 3 Ta Yordam Yo'li
      panel(980, 140, 840, 680, C.yellow, "Oflayn Yordam Tizimi", "internet talab qilmaydigan to'liq hujjatlar", kBox, kBox);

      const kH1 = P(u, 1.8, 0.6);
      withA(kH1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("1 · Tezkor Konspekt (-h)", 1130, 290, C.purple, { size: 16, mono: false });
        text("$ git config -h   yoki   $ git add -h", 1030, 335, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("Terminaldan chiqmasdan barcha opsiyalar ro'yxatini ko'rish.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kH2 = P(u, 5.5, 0.6);
      withA(kH2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · To'liq Ma'lumotnoma (man page)", 1160, 470, C.green, { size: 16, mono: false });
        text("$ git help config   yoki   $ git config --help", 1030, 515, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("To'liq rasmiy ma'lumotnoma; butunlay OFLAYN ishlaydi!", 1030, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kH3 = P(u, 9.5, 0.6);
      withA(kH3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("3 · Barcha Buyruqlar va Qo'llanmalar", 1175, 655, C.blue, { size: 16, mono: false });
        text("$ git help -a (barcha buyruqlar)  va  $ git help -g (konseptlar)", 1030, 700, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        text("Atamalar lug'ati (glossary) va kundalik buyruqlar (everyday) jamlangan.", 1030, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 16.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.yellow });
      text("Git yordam tizimi istalgan joyda internetsiz eng to'liq hujjatlarni qo'lingizda ushlab turadi.", 960, 895, { size: 24, weight: 700, color: C.yellow, align: 'center' });
      text("Chiqish uchun 'q' tugmasini bosishni unutmang. Endi xulosalarni chiqaramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
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
      // Chap: 4 Ta Asosiy Qoida
      panel(100, 140, 840, 680, C.blue, "Birinchi Sozlash Qoidalari", "kundalik ishonchli poydevor", kBox, kBox);

      const kX1 = P(u, 1.2, 0.5);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 16);
        card(125, 255, 790, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · Identifikatsiyani Boshida Sozlang", 290, 285, C.blue, { size: 16, mono: false });
        text("user.name va user.email kommitga muhrlanadi; oldindan qo'yib qo'ying.", 150, 335, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.5);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 16);
        card(125, 395, 790, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Tor Daraja Kengidan Ustun", 260, 425, C.green, { size: 16, mono: false });
        text("Lokal repo (.git/config) global sozlamalarni bemalol almashtira oladi.", 150, 475, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.5);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 16);
        card(125, 535, 790, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("3 · init.defaultBranch main va core.editor", 310, 565, C.orange, { size: 16, mono: false });
        text("Git 3.0 standarti 'main' va VS Code uchun 'code --wait' dan foydalaning.", 150, 615, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX4 = P(u, 7.2, 0.5);
      withA(kX4, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX4)) * 16);
        card(125, 675, 790, 120, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("4 · Oflayn Yordam Tizimidan Foydalaning", 300, 705, C.yellow, { size: 16, mono: false });
        text("Tezkor yordam uchun -h, to'liq qo'llanmalar uchun 'git help' yoningizda.", 150, 755, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng: Keyingi Bobga Yo'llanma
      panel(980, 140, 840, 680, C.git, "Keyingi Bosqich", "04-bob: repozitoriy olish (init va clone)", kBox, kBox);

      const kN1 = P(u, 9.2, 0.6);
      withA(kN1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Keyingi Bobda Ko'riladigan Amallar", 1170, 290, C.git, { size: 16, mono: false });
        text("• Noldan repozitoriy yaratish: git init va .git anatomiyasi", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("• Masofaviy repo'ni nusxalash: git clone va uning opsiyalari", 1030, 385, { size: 17, color: C.text, align: 'left' });
        text("• Loyiha boshlang'ich holatini tekshirish: git status", 1030, 430, { size: 17, color: C.text, align: 'left' });
        text("• Git ichki kataloglari bilan birinchi tanishuv", 1030, 475, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kN2 = P(u, 11.5, 0.6);
      withA(kN2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN2)) * 16);
        card(1005, 525, 790, 255, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Mustaqil Amaliyot Uchun Topshiriq", 1170, 560, C.green, { size: 16, mono: false });
        text("1. Terminalda 'git config list --show-origin' ni ishga tushiring.", 1030, 605, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("2. cat ~/.gitconfig orqali faylni ko'zdan kechiring.", 1030, 645, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("3. 'git help everyday' qo'llanmasini ochib, 'q' bilan chiqing.", 1030, 685, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("Sozlamalaringiz to'liq tayyor bo'lsa, keyingi darsga o'tamiz!", 1030, 735, { size: 16, color: C.text, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("To'g'ri sozlangan muhit va yordam tizimi professional ishning poydevoridir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Keyingi bobda ilk repozitoriy yaratishni boshlaymiz. E'tiboringiz uchun rahmat!", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY FRAME CHIZISH
  // ==========================================
  function frame(t, o = {}) {
    bg();
    const sc = o.scene || (TM ? Object.keys(TM.scenes).find((k) => t >= TM.scenes[k].s && t < TM.scenes[k].e) : 'intro') || 'intro';
    const bounds = TM ? TM.scenes[sc] : { s: 0, e: 120.6 };
    const u = t - bounds.s;

    switch (sc) {
      case 'intro': sceneIntro(u, bounds, o); break;
      case 'darajalar_va_ustunlik': sceneDarajalarUstunlik(u, bounds); break;
      case 'identifikatsiya_va_sintaksis': sceneIdentifikatsiyaSintaksis(u, bounds, o); break;
      case 'muhim_sozlamalar': sceneMuhimSozlamalar(u, bounds, o); break;
      case 'yordam_tizimi': sceneYordamTizimi(u, bounds, o); break;
      case 'xulosa': sceneXulosa(u, bounds); break;
      default: sceneIntro(u, bounds, o);
    }
  }

  window.renderFrame = frame;
  window.drawFrame = frame;
  window.render = frame;

  window.renderPoster = function () {
    bg(0);
    // 03-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("03-BOB · BIRINCHI SOZLASH", 960, 160, C.git, { size: 26, mono: false });
    text("Birinchi Sozlash va Yordam", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("user.name, user.email, darajalar ierarxiyasi va oflayn yordam", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy konfiguratsiya kartasi
    card(460, 410, 1000, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("$ git config list --show-origin", 960, 475, C.blue, { size: 24 });
    text("file:~/.gitconfig  user.name=Ali Valiyev", 960, 540, { size: 26, fam: MONO, color: C.green, weight: 700 });
    text("file:~/.gitconfig  user.email=ali@example.com", 960, 590, { size: 24, fam: MONO, color: '#38bdf8', weight: 600 });
    text("file:~/.gitconfig  init.defaultBranch=main", 960, 640, { size: 22, fam: MONO, color: C.yellow, weight: 600 });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Git sozlamalari har bir kommitning tarixiy mualliflik poydevorini belgilaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Yangi Git 2.46+ subkomandalari orqali xavfsiz va aniq boshqaring.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
