// Git 04-bob videosi: "Repo olish: init va clone"
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
  // 1-SAHNA: Repo Olishning 2 Yo'li
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("04-BOB · REPOZITORIY OLISH", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Repo Olish: init va clone", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Yangi loyiha boshlash yoki masofaviy repozitoriyni to'liq nusxalash", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(440, 480, 1040, 240, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("$ git init  vs  $ git clone <url>", 960, 535, C.blue, { size: 22 });
          text("git init   ->  lokal papkada yangi .git xotirasini boshlash", 960, 605, { size: 22, fam: MONO, color: C.yellow, weight: 600 });
          text("git clone  ->  serverdagi butun tarixni to'liq nusxalab olish", 960, 650, { size: 22, fam: MONO, color: C.green, weight: 600 });
          text("Ikkala yo'l ham kompyuteringizda to'laqonli Git repo'sini hosil qiladi.", 960, 690, { size: 18, color: C.mute });
          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Repo Olishning 2 Asosiy Yo‘li", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 7.8, 0.6));
    withA(kBox, () => {
      // Chap: git init
      panel(100, 140, 840, 680, C.yellow, "1 · Yangi Loyiha (git init)", "noldan yangi tarix boshlash", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Noldan Boshlash", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Kompyuteringizdagi oddiy papkani to'liq Git repo'siga aylantiradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Tarix hali hech qayerda yo'q — uni siz noldan boshlaysiz!", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.4, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Yashirin .git Papkasi", 240, 470, C.blue, { size: 16, mono: false });
        text("• Papkada barcha xotira saqlanadigan '.git' katalogi paydo bo'ladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Mavjud fayllaringizga tegilmaydi, ular kuzatilmaydigan (untracked) qoladi.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Mutlaqo Mustaqil", 220, 655, C.mute, { size: 16, mono: false });
        text("• Server yoki internet aloqasi mutlaqo shart emas.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Butun tarix o'z kompyuteringiz ichida xavfsiz yuritiladi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: git clone
      panel(980, 140, 840, 680, C.green, "2 · Mavjud Loyiha (git clone)", "masofaviy repozitoriyni nusxalash", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To'liq Tarix Nusxasi", 1140, 290, C.green, { size: 16, mono: false });
        text("• Serverdagi barcha kommitlar, branchlar va teglar ko'chirib olinadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Faqat oxirgi versiya emas, loyihaning BUTUN o'tmishi yuklanadi!", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Origin Remote Ulanishi", 1150, 470, C.purple, { size: 16, mono: false });
        text("• Server avtomatik 'origin' nomi bilan masofaviy ombor deb saqlanadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Kelgusida 'git pull' va 'git push' bilan ishlashga tayyor turadi.", 1030, 555, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Teng Huquqli Nusxa", 1140, 655, C.blue, { size: 16, mono: false });
        text("• Klonlangan repo server bilan teng huquqli to'laqonli repodir.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Server diski shikastlansa ham, ixtiyoriy klondan qayta tiklasa bo'ladi.", 1030, 740, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 15.0, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Git'da repozitoriyga ega bo'lish: noldan boshlash (init) yoki serverdan to'liq nusxa olish (clone).", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi terminalda 'git init' buyrug'ini ishlatib, .git papkasi tuzilishini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: git init va .git Papkasi (SPLIT SCREEN)
  // ==========================================
  function sceneGitInit(u, bounds, o = {}) {
    chip(2, "git init va .git Papkasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/mening-loyiham (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: mkdir & cd
      drawCommandLine("~/dasturlar $ ", "mkdir mening-loyiham && cd mening-loyiham", 1.0, 3.2, 3.5, tu, 130, 205);

      // 2-buyruq: git init
      drawCommandLine("mening-loyiham $ ", "git init", 4.2, 5.4, 5.7, tu, 130, 235);
      drawOutputLine("Initialized empty Git repository in /.../mening-loyiham/.git/", 5.9, tu, 150, 260, { color: C.green, weight: 600 });

      // 3-buyruq: ls -la
      drawCommandLine("mening-loyiham $ ", "ls -la", 6.8, 7.8, 8.1, tu, 130, 290, { promptCol: C.yellow });
      drawOutputLine("drwxr-xr-x   .git/", 8.3, tu, 150, 314, { color: '#38bdf8', weight: 600 });

      // 4-buyruq: ls -1 .git
      drawCommandLine("mening-loyiham $ ", "ls -1 .git", 9.0, 10.2, 10.5, tu, 130, 344);
      drawOutputLine("HEAD", 10.7, tu, 150, 368, { color: C.yellow, weight: 600 });
      drawOutputLine("config", 10.7, tu, 150, 388, { color: '#e2e8f0' });
      drawOutputLine("description", 10.7, tu, 150, 408, { color: '#94a3b8' });
      drawOutputLine("hooks/", 10.7, tu, 150, 428, { color: '#94a3b8' });
      drawOutputLine("info/", 10.7, tu, 150, 448, { color: '#94a3b8' });
      drawOutputLine("objects/", 10.7, tu, 150, 468, { color: C.green, weight: 600 });
      drawOutputLine("refs/", 10.7, tu, 150, 488, { color: C.purple, weight: 600 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 12.0) {
        text("mening-loyiham $ ", 130, 524, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("mening-loyiham $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 524, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: .git Papkasi — Ichki Anatomiyasi
      panel(980, 140, 840, 680, C.yellow, ".git Papkasi — Repo Yuragi", "ichki kataloglar va ma'lumotlar bazasi", kBox, kBox);

      const kI1 = P(u, 1.8, 0.6);
      withA(kI1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("HEAD va config Fayllari", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• HEAD   -> joriy qaysi branch'daligingizni ko'rsatadi (ref: refs/heads/main).", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• config -> faqat shu loyihaga tegishli lokal sozlamalar (.git/config).", 1030, 375, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kI2 = P(u, 5.0, 0.6);
      withA(kI2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI2)) * 16);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("objects va refs Kataloglari", 1170, 470, C.green, { size: 16, mono: false });
        text("• objects/ -> barcha fayllar, kataloglar va kommitlar ombori (hozircha bo'sh).", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• refs/    -> branchlar va teglar ko'rsatkichlari saqlanadigan joy.", 1030, 555, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kI3 = P(u, 8.5, 0.6);
      withA(kI3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Qat'iy Tavsiya: Qo'lda Tegilmaydi!", 1190, 655, C.red, { size: 16, mono: false });
        text("• .git papkasi — Git'ning shaxsiy ma'lumotlar bazasi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Uni faqat Git buyruqlari bilan boshqaring; o'chirsangiz butun tarix ketadi!", 1030, 740, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.yellow });
      text("git init faqat .git papkasini yaratadi; mavjud fayllaringizga tegilmaydi va ular untracked qoladi.", 960, 895, { size: 24, weight: 700, color: C.yellow, align: 'center' });
      text("Endi tug'ilmagan brench holatini va birinchi 'root-commit'ni amalga oshiramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Tug'ilmagan Brench va Ilk Commit (SPLIT SCREEN)
  // ==========================================
  function sceneUnbornCommit(u, bounds, o = {}) {
    chip(3, "Tug‘ilmagan Brench va Ilk Commit", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/mening-loyiham (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git status
      drawCommandLine("mening-loyiham $ ", "git status", 1.0, 2.2, 2.5, tu, 130, 205);
      drawOutputLine("On branch main", 2.7, tu, 150, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("No commits yet", 2.7, tu, 150, 250, { color: C.red, weight: 600 });

      // 2-buyruq: fayl yaratish
      drawCommandLine("mening-loyiham $ ", "echo '# Salom Git' > README.md", 3.6, 5.4, 5.7, tu, 130, 280);

      // 3-buyruq: git add
      drawCommandLine("mening-loyiham $ ", "git add README.md", 6.2, 7.4, 7.7, tu, 130, 310);

      // 4-buyruq: git commit -m "Ilk commit"
      drawCommandLine("mening-loyiham $ ", "git commit -m 'Ilk commit'", 8.2, 9.8, 10.1, tu, 130, 340);
      drawOutputLine("[main (root-commit) 8d792ce] Ilk commit", 10.3, tu, 150, 366, { color: C.green, weight: 700 });
      drawOutputLine(" 1 file changed, 1 insertion(+)", 10.3, tu, 150, 388, { color: '#94a3b8' });

      // 5-buyruq: cat .git/refs/heads/main
      drawCommandLine("mening-loyiham $ ", "cat .git/refs/heads/main", 11.2, 12.6, 12.9, tu, 130, 418, { promptCol: C.blue });
      drawOutputLine("8d792cee11e02a695d37613916b4e0bd187e35c8", 13.1, tu, 150, 444, { color: '#38bdf8', weight: 600 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 14.0) {
        text("mening-loyiham $ ", 130, 480, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("mening-loyiham $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 480, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Tug'ilmagan Brenchdan Ilk Kommitga
      panel(980, 140, 840, 680, C.blue, "Tug‘ilmagan Brenchdan Ilk Kommitga", "anborn branch va root-commit mohiyati", kBox, kBox);

      const kU1 = P(u, 1.8, 0.6);
      withA(kU1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kU1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Tug'ilmagan Brench (Unborn Branch)", 1190, 290, C.blue, { size: 16, mono: false });
        text("• Yangi repoda HEAD 'refs/heads/main'ga qaraydi, lekin fayl yo'q!", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Brench — bu kommitga ko'rsatkich. Kommit bo'lmagani uchun brench hali yo'q.", 1030, 375, { size: 16, color: C.mute, align: 'left' });
        text("• Bu holat rasmiy Git terminologiyasida 'unborn branch' deyiladi.", 1030, 415, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• git log yoki rev-parse HEAD xato qaytaradi — bu mutlaqo tabiiy!", 1030, 455, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kU2 = P(u, 6.5, 0.6);
      withA(kU2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kU2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ilk Rut Kommit (root-commit)", 1170, 550, C.green, { size: 16, mono: false });
        text("• Tarixdagi birinchi kommit otasiz (parent'siz) yaratiladi: 'root-commit'.", 1030, 595, { size: 17, color: C.text, align: 'left' });
        text("• Shu lahzada .git/refs/heads/main fayli yaratiladi va brench tug'iladi!", 1030, 635, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• .git/objects ichida birinchi blob, tree va commit obyektlari paydo bo'ladi.", 1030, 675, { size: 16, color: C.text, align: 'left' });
        text("• Endi loyihaning haqiqiy tarixi boshlandi!", 1030, 715, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Rut kommit amalga oshirilgach, bosh brench rasman vujudga keladi va tarix boshlanadi.", 960, 895, { size: 24, weight: 700, color: C.blue, align: 'center' });
      text("Endi serverdagi mavjud loyihani 'git clone' orqali to'liq nusxalab olishni ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: git clone Mexanizmi (SPLIT SCREEN)
  // ==========================================
  function sceneGitClone(u, bounds, o = {}) {
    chip(4, "git clone Mexanizmi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/klonlash (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git clone
      drawCommandLine("~ $ ", "git clone https://github.com/loyiha/sayt.git", 1.0, 3.4, 3.7, tu, 130, 205);
      drawOutputLine("Cloning into 'sayt'...", 3.9, tu, 150, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("remote: Enumerating objects: 45, done.", 4.5, tu, 150, 250, { color: '#cbd5e1' });
      drawOutputLine("remote: Compressing objects: 100% (32/32), done.", 4.5, tu, 150, 270, { color: '#cbd5e1' });
      drawOutputLine("Receiving objects: 100% (45/45), 18.50 KiB, done.", 4.5, tu, 150, 290, { color: C.green, weight: 600 });

      // 2-buyruq: cd sayt
      drawCommandLine("~ $ ", "cd sayt", 5.5, 6.4, 6.7, tu, 130, 320);

      // 3-buyruq: git remote -v
      drawCommandLine("sayt $ ", "git remote -v", 7.2, 8.4, 8.7, tu, 130, 350, { promptCol: C.blue });
      drawOutputLine("origin  https://github.com/loyiha/sayt.git (fetch)", 8.9, tu, 150, 374, { color: '#38bdf8' });
      drawOutputLine("origin  https://github.com/loyiha/sayt.git (push)", 8.9, tu, 150, 394, { color: '#38bdf8' });

      // 4-buyruq: git log --oneline -2
      drawCommandLine("sayt $ ", "git log --oneline -2", 9.8, 11.2, 11.5, tu, 130, 424, { promptCol: C.green });
      drawOutputLine("* 9b4d1a2 (HEAD -> main, origin/main) Yangi funksiya", 11.7, tu, 150, 450, { color: C.green, weight: 600 });
      drawOutputLine("* 8d792ce Ilk commit", 11.7, tu, 150, 470, { color: '#94a3b8' });

      // Faol prompt va miltillovchi kursor
      if (tu >= 13.0) {
        text("sayt $ ", 130, 506, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("sayt $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 506, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Nega clone, checkout emas?
      panel(980, 140, 840, 680, C.green, "git clone Mexanizmi", "to'liq tarix va avtomatik remote", kBox, kBox);

      const kC1 = P(u, 1.8, 0.6);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega 'clone', 'checkout' emas?", 1160, 290, C.green, { size: 16, mono: false });
        text("• Eski markazlashgan tizimlar (SVN) faqat bitta versiyani olardi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git esa serverdagi DEYARLI BARCHA ma'lumotni to'liq ko'chiradi.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Har bir klon — mustaqil va to'liq zaxira nusxa hisoblanadi.", 1030, 415, { size: 16, color: C.text, align: 'left' });
        text("• Server buzilsa ham, ixtiyoriy klondan serverni qayta tiklash mumkin!", 1030, 455, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = P(u, 6.5, 0.6);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Avtomatik 'origin' Masofaviy Ombori", 1200, 550, C.blue, { size: 16, mono: false });
        text("• Klonlangan manzil avtomatik ravishda 'origin' nomi bilan saqlanadi.", 1030, 595, { size: 17, color: C.text, align: 'left' });
        text("• Kelgusida 'git fetch', 'git pull' va 'git push' shu nom orqali ishlaydi.", 1030, 635, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        text("• Boshqa papka nomiga klonlash: '$ git clone <url> boshqa-nom'.", 1030, 675, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• Papka nomi o'zgarsa ham, ichidagi tarix va remote bir xil qoladi.", 1030, 715, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Klonlash orqali butun o'tmish ko'chiriladi va server bilan bog'langan to'liq repo paydo bo'ladi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi tarmoq protokollari va katta repolar uchun sayoz klonlash (shallow clone) ni ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Protokollar va Sayoz Klon (SPLIT SCREEN)
  // ==========================================
  function sceneProtokollarOpsiyalar(u, bounds, o = {}) {
    chip(5, "Protokollar va Sayoz Klon", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/sayoz-klon (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 20.0 : u;

      // 1-buyruq: git clone --depth 1
      drawCommandLine("~ $ ", "git clone --depth 1 https://github.com/katta/loyiha.git", 1.0, 3.4, 3.7, tu, 130, 205, { promptCol: C.purple });
      drawOutputLine("Cloning into 'loyiha'...", 3.9, tu, 150, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("remote: Total 1 (delta 0), reused 0", 4.3, tu, 150, 250, { color: '#cbd5e1' });
      drawOutputLine("Receiving objects: 100% (12/12), 4.20 KiB, done.", 4.3, tu, 150, 270, { color: C.green, weight: 600 });

      // 2-buyruq: cd & git log
      drawCommandLine("~ $ ", "cd loyiha && git log --oneline", 5.5, 7.2, 7.5, tu, 130, 300);
      drawOutputLine("* 7c3e10f (grafted, HEAD -> main) Eng so'nggi reliz", 7.7, tu, 150, 326, { color: C.green, weight: 600 });
      drawOutputLine("(Eski tarix yuklanmadi — faqat 1 ta kommit!)", 7.7, tu, 150, 348, { color: C.yellow, weight: 600 });

      // 3-buyruq: du -sh .git
      drawCommandLine("loyiha $ ", "du -sh .git", 8.8, 10.0, 10.3, tu, 130, 378, { promptCol: C.blue });
      drawOutputLine("450K    .git  (2GB o'rniga soniyalarda yuklandi!)", 10.5, tu, 150, 404, { color: '#38bdf8', weight: 700 });

      // Faol prompt va miltillovchi kursor
      if (tu >= 12.0) {
        text("loyiha $ ", 130, 440, { size: 15, fam: MONO, color: C.green, weight: 700, align: 'left' });
        const pw = tw("loyiha $ ", 15, 700, MONO);
        if (Math.floor(tu * 2.5) % 2 === 0 || o.isPoster) {
          text('█', 130 + pw + 2, 440, { size: 15, fam: MONO, color: '#38bdf8', align: 'left' });
        }
      }

      // O'ng panel: Protokollar va Tezkor Yuklash
      panel(980, 140, 840, 680, C.purple, "Protokollar va Sayoz Klon", "tarmoq turlari va optimallashtirish", kBox, kBox);

      const kP1 = P(u, 1.8, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("3 Asosiy Tarmoq Protokoli", 1150, 290, C.purple, { size: 16, mono: false });
        text("• HTTPS: https://github.com/loyiha/sayt.git", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("  Eng keng tarqalgan, standart veb-portlar orqali ishlaydi.", 1030, 365, { size: 15, color: C.mute, align: 'left' });
        text("• SSH:   git@github.com:loyiha/sayt.git", 1030, 400, { size: 17, fam: MONO, color: '#38bdf8', align: 'left', weight: 600 });
        text("  Xavfsiz kalitlar bilan parolsiz avtomatik ishlash imkoni.", 1030, 430, { size: 15, color: C.mute, align: 'left' });
        text("• Fayl:  /yo'l/loyiha  yoki  file:///...", 1030, 465, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Sayoz Klon (--depth 1) va Filtrlar", 1180, 550, C.orange, { size: 16, mono: false });
        text("• --depth 1 faqat eng oxirgi kommitni yuklaydi (shallow clone).", 1030, 595, { size: 17, color: C.text, align: 'left' });
        text("• CI/CD quvurlarida va katta repolarni tezkor ko'rishda muhim.", 1030, 635, { size: 16, color: C.orange, align: 'left', weight: 600 });
        text("• --filter=blob:none katta fayllarni faqat kerak paytda yuklaydi.", 1030, 675, { size: 16, color: C.green, align: 'left' });
        text("• Vaqtni ham, internet trafigini ham bir necha barobar tejaydi!", 1030, 715, { size: 16, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.purple });
      text("To'g'ri protokol va sayoz klon katta loyihalarni soniyalarda ko'chirib olishga imkon beradi.", 960, 895, { size: 24, weight: 700, color: C.purple, align: 'center' });
      text("Endi to'rtinchi bob bo'yicha asosiy xulosalar va tavsiyalarni jamlaymiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
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
      panel(100, 140, 840, 680, C.blue, "Repo Boshqaruvi Poydevori", "amaliy eslatmalar va qoidalar", kBox, kBox);

      const kX1 = P(u, 1.2, 0.5);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 16);
        card(125, 255, 790, 120, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · git init Faqat .git Yaratadi", 260, 285, C.blue, { size: 16, mono: false });
        text("Mavjud fayllaringizga tegilmaydi; ularni kuzatish uchun git add kerak.", 150, 335, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.5);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 16);
        card(125, 395, 790, 120, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Ilk Kommit Brench Tug'diradi", 270, 425, C.green, { size: 16, mono: false });
        text("Rut kommitgacha brench unborn holatida bo'ladi; commit bilan tarix boshlanadi.", 150, 475, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.5);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 16);
        card(125, 535, 790, 120, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("3 · git clone Butun Tarixni Ko'chiradi", 290, 565, C.orange, { size: 16, mono: false });
        text("Har bir klon mustaqil zaxira nusxa; server bilan origin bog'lanishi ochiladi.", 150, 615, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX4 = P(u, 7.2, 0.5);
      withA(kX4, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX4)) * 16);
        card(125, 675, 790, 120, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("4 · Sayoz Klon: --depth 1", 240, 705, C.yellow, { size: 16, mono: false });
        text("Katta loyihalarda faqat oxirgi versiyani tez yuklash uchun ajoyib qulaylik.", 150, 755, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng: Keyingi Bobga Yo'llanma
      panel(980, 140, 840, 680, C.git, "Keyingi Bosqich", "05-bob: uch holat va uch hudud", kBox, kBox);

      const kN1 = P(u, 9.2, 0.6);
      withA(kN1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(240,81,51,0.08)', col: C.git });
        pill("Keyingi Bobda Ko'riladigan Amallar", 1170, 290, C.git, { size: 16, mono: false });
        text("• Git'ning 3 asosiy holati: Modified, Staged va Committed", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("• Git'ning 3 hududi: Working Tree, Staging Area (Index) va .git", 1030, 385, { size: 17, color: C.text, align: 'left' });
        text("• Fayllarning hayot sikli qanday kechadi?", 1030, 430, { size: 17, color: C.text, align: 'left' });
        text("• Git arxitekturasining eng markaziy konsepsiyasi!", 1030, 475, { size: 17, color: '#38bdf8', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kN2 = P(u, 11.5, 0.6);
      withA(kN2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kN2)) * 16);
        card(1005, 525, 790, 255, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Mustaqil Amaliyot Uchun Topshiriq", 1170, 560, C.green, { size: 16, mono: false });
        text("1. Yangi papka ochib, 'git init' bilan repozitoriy qiling.", 1030, 605, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("2. 'ls -1 .git' qilib, ichki fayllarni ko'zdan kechiring.", 1030, 645, { size: 16, fam: MONO, color: '#38bdf8', align: 'left' });
        text("3. Birinchi faylni yaratib, ilk kommitni amalga oshiring.", 1030, 685, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("Repozitoriyingiz tayyor bo'lsa, keyingi darsga o'tamiz!", 1030, 735, { size: 16, color: C.text, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 14.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Init va klon amallari har qanday dasturlash loyihasining eng muhim boshlang'ich poydevoridir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Keyingi bobda Gitdagi uch holat va uch hududni o'rganamiz. E'tiboringiz uchun rahmat!", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY FRAME CHIZISH
  // ==========================================
  function frame(t, o = {}) {
    bg();
    const sc = o.scene || (TM ? Object.keys(TM.scenes).find((k) => t >= TM.scenes[k].s && t < TM.scenes[k].e) : 'intro') || 'intro';
    const bounds = TM ? TM.scenes[sc] : { s: 0, e: 111.3 };
    const u = t - bounds.s;

    switch (sc) {
      case 'intro': sceneIntro(u, bounds, o); break;
      case 'git_init': sceneGitInit(u, bounds, o); break;
      case 'unborn_va_birinchi_commit': sceneUnbornCommit(u, bounds, o); break;
      case 'git_clone': sceneGitClone(u, bounds, o); break;
      case 'protokollar_va_opsiyalar': sceneProtokollarOpsiyalar(u, bounds, o); break;
      case 'xulosa': sceneXulosa(u, bounds); break;
      default: sceneIntro(u, bounds, o);
    }
  }

  window.renderFrame = frame;
  window.drawFrame = frame;
  window.render = frame;

  window.renderPoster = function () {
    bg(0);
    // 04-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("04-BOB · REPOZITORIY OLISH", 960, 160, C.git, { size: 26, mono: false });
    text("Repo Olish: init va clone", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("Yangi loyiha boshlash yoki masofaviy repozitoriyni to'liq nusxalash", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy taqqoslash kartasi
    card(440, 410, 1040, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("$ git init  vs  $ git clone <url>", 960, 475, C.blue, { size: 24 });
    text("git init   ->  lokal papkada yangi .git xotirasini boshlash", 960, 540, { size: 26, fam: MONO, color: C.yellow, weight: 700 });
    text("git clone  ->  serverdagi butun tarixni to'liq nusxalab olish", 960, 595, { size: 26, fam: MONO, color: C.green, weight: 700 });
    text("origin masofaviy ombori bilan bog'langan mustaqil to'liq repo", 960, 645, { size: 20, fam: MONO, color: '#38bdf8' });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Init va klon amallari har qanday dasturlash loyihasining eng muhim boshlang'ich poydevoridir!", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Lokal yaratish, tug'ilmagan brench, root-commit va sayoz klonlash imkoniyatlari.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
