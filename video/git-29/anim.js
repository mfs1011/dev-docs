// Git 29-bob videosi: "`fetch` va `push` ichidan"
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
  // 1-SAHNA: Kirish va Refspec Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Kirish: Refspec va Protokol Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — refspec konfiguratsiyasi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: standart refspecni ko'rish
      drawCommandLine("ali $ ", "git config --get remote.origin.fetch", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("+refs/heads/*:refs/remotes/origin/*", 3.0, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  # + <src> : <dst> — manba va maqsad bog'lanishi!", 3.3, tu, 130, 252, { color: C.mute });

      // 2-buyruq: bir martalik refspec bilan fetch
      drawCommandLine("ali $ ", "git fetch origin main:refs/remotes/origin/mymain", 5.0, 7.5, 7.7, tu, 130, 290);
      drawOutputLine("From ../server", 8.0, tu, 130, 315, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      main       -> origin/mymain", 8.3, tu, 130, 337, { color: C.cyan, weight: 700 });
      drawOutputLine("   3c8955c..5d32771  main       -> origin/main", 8.6, tu, 130, 359, { color: C.green, weight: 600 });
      drawOutputLine("  # serverdagi main boshqa xatcho'p nomiga yozildi!", 8.9, tu, 130, 381, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 10.5, 0.5);
      withA(kCallout, () => {
        card(125, 415, 790, 235, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Refspec Qanday Tuzilgan?", 220, 450, C.cyan, { size: 16, mono: false });
        text("• +refs/heads/*:refs/remotes/origin/* qatori:", 150, 490, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  +   : Majburlash (fast-forward bo'lmasa ham yangilash).", 150, 520, { size: 15, color: C.text, align: 'left' });
        text("  <src>: Serverdagi refs/heads/ ostidagi har qanday branch (*).", 150, 550, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  <dst>: Lokal refs/remotes/origin/ ostiga aynan shu nomda yozish.", 150, 580, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Nega + xavfsiz? Chunki refs/remotes/ faqat server xatcho'pi, sizning ishingiz emas!", 150, 615, { size: 15, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Refspec Arxitekturasi", "tarmoq ko'rsatkichlari xaritasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Refspec Vazifasi", 1100, 290, C.cyan, { size: 16, mono: false });
        text("• Pochta bo'limidagi saralash jadvali kabi ishlaydi:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  'U tomondagi qaysi nomlar bu tomonda qayerga yozilsin?'", 1030, 365, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Qisqa nomlar to'liq ref nomiga kengaytiriladi:", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  main -> refs/heads/main", 1030, 425, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nomutanosiblik Sababi", 1120, 500, C.green, { size: 16, mono: false });
        text("• Fetch refspec'i: Standart holatda '+' bilan (majburiy ruxsat).", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Push refspec'i: Standart holatda '+' siz (qat'iy fast-forward).", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Chunki serverdagi refs/heads/ — barcha dasturchilarning umumiy xazinasi!", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Uni bexosdan buzib qo'ymaslik uchun Git qat'iy himoya o'rnatgan.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Refspec Turlari va Inkor Qoidalari
  // ==========================================
  function sceneRefspecTurlari(u, bounds, o = {}) {
    chip(2, "Refspec Turlari va Inkor Qoidalari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — qisman moslik va inkor refspec',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: inkor refspec qo'shish
      drawCommandLine("ali $ ", "git config --add remote.origin.fetch '^refs/heads/dev-*'", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("  # inkor (^) qoidasi: dev-* branchlari olinmaydi!", 3.7, tu, 130, 230, { color: C.yellow, weight: 600 });

      // 2-buyruq: boshqa nom bilan push qilish
      drawCommandLine("ali $ ", "git push origin main:refs/heads/qa/main", 5.2, 7.8, 8.0, tu, 130, 265);
      drawOutputLine("To ../server.git", 8.3, tu, 130, 290, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      main -> qa/main", 8.6, tu, 130, 312, { color: C.green, weight: 700 });
      drawOutputLine("  # o'z main branchingizni serverga qa/main qilib yukladingiz!", 8.9, tu, 130, 334, { color: C.mute });

      // 3-buyruq: serverdagi branchni o'chirish (bo'sh src)
      drawCommandLine("ali $ ", "git push origin :refs/heads/eski", 10.5, 12.5, 12.7, tu, 130, 370);
      drawOutputLine("To ../server.git", 13.0, tu, 130, 395, { color: '#94a3b8' });
      drawOutputLine(" - [deleted]         eski", 13.3, tu, 130, 417, { color: C.red, weight: 700 });
      drawOutputLine("  # ':nom' — manba bo'sh bo'lgani uchun serverda o'chirildi!", 13.6, tu, 130, 439, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 470, 790, 175, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ilg'or Refspec Imkoniyatlari", 230, 505, C.green, { size: 16, mono: false });
        text("• Inkor refspec (^): 'Hammasini ol, lekin dev-* tajribalarini emas'.", 150, 545, { size: 16, color: C.text, align: 'left' });
        text("• Qisman glob: '+refs/heads/qa*:refs/remotes/origin/qa*' (faqat qa branchlar).", 150, 575, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Bo'sh src bilan push: 'git push origin :branch' — serverdagi refni o'chirish.", 150, 610, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Refspeklar Xilma-xilligi", "filtrlash va qayta yo'naltirish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Inkor Qoidasi (^)", 1100, 290, C.green, { size: 16, mono: false });
        text("• Git 2.29 da qo'shilgan qulay sintaksis:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  ^refs/heads/dev-* (faqat manba yoziladi, dst yo'q).", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Katta korporativ repolarda yuzlab shaxsiy tajriba tarmoqlarini", 1030, 400, { size: 16, color: '#cbd5e1', align: 'left' });
        text("  lokalga tortib olmaslik uchun juda samarali.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Push Refspeklari", 1100, 500, C.cyan, { size: 16, mono: false });
        text("• git push origin main:qa/main (QA serverga topshirish)", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• git push origin HEAD:sinov (joriy branch uchi bilan push)", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Doimiy qoida: 'git config remote.origin.push refs/heads/main:...'", 1030, 605, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        text("• Har bir jamoa o'z ish oqimiga moslab refspek sozlay oladi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Uzatish Protokollari: Smart va Dumb Git
  // ==========================================
  function sceneTransferProtokol(u, bounds, o = {}) {
    chip(3, "Uzatish Protokollari: Smart va Dumb Git", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git uzatish protokoli amaliyoti',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git fetch va muzokara natijasi
      drawCommandLine("ali $ ", "git fetch origin", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("remote: Enumerating objects: 12, done.", 2.5, tu, 130, 230, { color: C.cyan });
      drawOutputLine("remote: Counting objects: 100% (12/12), done.", 2.8, tu, 130, 252, { color: C.cyan });
      drawOutputLine("remote: Compressing objects: 100% (8/8), done.", 3.1, tu, 130, 274, { color: C.cyan });
      drawOutputLine("remote: Total 8 (delta 4), reused 0 (delta 0), pack-reused 0", 3.4, tu, 130, 296, { color: C.green, weight: 700 });
      drawOutputLine("   3c8955c..2f0abc5  main -> origin/main", 3.7, tu, 130, 318, { color: C.yellow, weight: 600 });
      drawOutputLine("  # server va mijoz kelishib, faqat yetishmagan 8 ta obyektni yubordi!", 4.0, tu, 130, 340, { color: C.mute });

      // 2-buyruq: tranzaksion push
      drawCommandLine("ali $ ", "git push --atomic origin main v1.0", 5.5, 7.8, 8.0, tu, 130, 375);
      drawOutputLine("To ../server.git", 8.3, tu, 130, 400, { color: '#94a3b8' });
      drawOutputLine("   2f0abc5..8de5280  main -> main", 8.6, tu, 130, 422, { color: C.green, weight: 700 });
      drawOutputLine(" * [new tag]         v1.0 -> v1.0", 8.9, tu, 130, 444, { color: C.green, weight: 700 });
      drawOutputLine("  # --atomic: ikkala ref bitta butun tranzaksiyada o'tdi!", 9.2, tu, 130, 466, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 495, 790, 150, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Aqlli Protokol (Smart Protocol) Qanday Ishlaydi?", 290, 525, C.purple, { size: 16, mono: false });
        text("• Fetch da: 'fetch-pack' (mijoz) va 'upload-pack' (server) muzokara qiladi.", 150, 565, { size: 16, color: C.text, align: 'left' });
        text("• Push da: 'send-pack' (mijoz) va 'receive-pack' (server) ma'lumot uzatadi.", 150, 595, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Butun omborni emas, faqat yetishmagan obyektlarni bitta ixcham packfile qiladi.", 150, 625, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Smart va Dumb Protokollar", "tarmoq trafigini maksimal tejash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Dumb vs Smart Protokol", 1120, 290, C.purple, { size: 16, mono: false });
        text("• Dumb (Soqov): Serverda Git kodi yo'q, fayllar birma-bir olinadi.", 1030, 335, { size: 16, color: '#94a3b8', align: 'left' });
        text("• Smart (Aqlli): Serverda Git ishlaydi, mijoz holatini hisoblaydi.", 1030, 365, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Bugungi barcha serverlar (GitHub, GitLab) aqlli protokol ishlatadi.", 1030, 400, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• SSH, Smart HTTP va Git protokollari.", 1030, 425, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Tranzaksion Push (--atomic)", 1140, 500, C.cyan, { size: 16, mono: false });
        text("• Odatda bitta push'da bir nechta ref bo'lsa, biri o'tib, biri rad bo'lishi mumkin.", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• --atomic bilan 'hammasi yoki hech biri' qoidasi ishlaydi.", 1030, 575, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Agar biror ref fast-forward bo'lmasa, qolganlari ham bekor qilinadi.", 1030, 610, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• CI/CD va reliz avtomatlashtirishda juda zarur.", 1030, 635, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Xavfli Force va force-with-lease
  // ==========================================
  function sceneForceWithLease(u, bounds, o = {}) {
    chip(4, "Xavfli Force va force-with-lease", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — force va force-with-lease solishtiruvi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: xavfli git push --force
      drawCommandLine("ali $ ", "git push --force", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("To ../server.git", 2.5, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" + 53d10cf...c101f60 main -> main (forced update)", 2.8, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("  # XAVFLI! Serverda Vali yozgan 53d10cf commit butunlay o'chib ketdi!", 3.1, tu, 130, 274, { color: C.red, weight: 600 });

      // 2-buyruq: xavfsiz compare-and-swap
      drawCommandLine("ali $ ", "git push --force-with-lease", 4.8, 6.8, 7.0, tu, 130, 310);
      drawOutputLine("To ../server.git", 7.3, tu, 130, 335, { color: '#94a3b8' });
      drawOutputLine(" ! [rejected]        main -> main (stale info)", 7.6, tu, 130, 357, { color: C.yellow, weight: 700 });
      drawOutputLine("error: failed to push some refs to '../server.git'", 7.9, tu, 130, 379, { color: C.yellow });
      drawOutputLine("  # serverda yangi commit borligi aniqlandi, Vali'ning kodi saqlandi!", 8.2, tu, 130, 401, { color: C.green, weight: 700 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kCallout, () => {
        card(125, 435, 790, 210, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("--force-with-lease Mo'jizasi", 220, 470, C.yellow, { size: 16, mono: false });
        text("• Compare-and-Swap tamoyili: 'Men bilgan holat hali ham to'g'rimi?'", 150, 510, { size: 16, color: C.text, align: 'left' });
        text("• Serverdagi ref siz oxirgi ko'rgan xatcho'p (origin/main) bilan bir xil bo'lsagina majburlaydi.", 150, 540, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Agar hamkasbingiz yangi commit yuborib ulgurgan bo'lsa: 'stale info' deb rad etadi.", 150, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Natijada boshqalarning mehnati xatosiz asrab qolinadi!", 150, 605, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Xavfsiz Majburlash (Lease)", "boshqalarning kodini o'chirib yubormaslik", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nega --force Taqiqlanadi?", 1110, 290, C.red, { size: 16, mono: false });
        text("• --force ko'r-ko'rona ishlaydi: serverda nima borligiga qaramaydi.", 1030, 335, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Hamkasblaringiz yozgan commitlar serverdan uzilib 'osilib' qoladi.", 1030, 365, { size: 16, color: C.text, align: 'left' });
        text("• Va keyingi 'git gc' ularni butunlay o'chirib tashlaydi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Jamoalarda doimo --force-with-lease ishlatish qoidasi amal qiladi.", 1030, 425, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Compare-and-Swap (CAS)", 1130, 500, C.green, { size: 16, mono: false });
        text("• [17-bobdagi] update-ref <ref> <yangi> <eski> ning tarmoqdagi shakli.", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Agar serverdagi commit != siz kutgan commit -> rad etiladi.", 1030, 575, { size: 16, color: C.text, align: 'left' });
        text("• Faqat siz o'zgartirgan branch xavfsiz yangilanadi.", 1030, 610, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Hech qanday kutilmagan kod yo'qolishi ro'y bermaydi.", 1030, 635, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Fonda Fetch Xavfi va force-if-includes
  // ==========================================
  function sceneForceIfIncludes(u, bounds, o = {}) {
    chip(5, "Fonda Fetch Xavfi va force-if-includes", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — fon fetch xavfi va reflog tekshiruvi',
        p: kBox
      });

      const tu = u;

      // 1-holat: fon fetch aldovi
      drawCommandLine("ali $ ", "# IDE fonda yashirincha 'git fetch' qilib qo'ygan holat:", 0.8, 2.8, 3.0, tu, 130, 205, { promptCol: C.yellow });
      drawOutputLine("  # origin/main yangilangan, --force-with-lease aldanishi mumkin!", 3.3, tu, 130, 230, { color: C.yellow });

      // 2-buyruq: force-if-includes bilan himoya
      drawCommandLine("ali $ ", "git push --force-with-lease --force-if-includes", 4.8, 8.0, 8.2, tu, 130, 265);
      drawOutputLine("To ../server.git", 8.5, tu, 130, 290, { color: '#94a3b8' });
      drawOutputLine(" ! [rejected]        main -> main (remote ref updated since checkout)", 8.8, tu, 130, 312, { color: C.red, weight: 700 });
      drawOutputLine("error: failed to push some refs to '../server.git'", 9.1, tu, 130, 334, { color: C.red });
      drawOutputLine("  # Git reflog'dan tekshirdi: siz u commitni ko'rmagansiz, push to'xtatildi!", 9.4, tu, 130, 356, { color: C.green, weight: 700 });

      // 3-buyruq: reflog tekshiruvi
      drawCommandLine("ali $ ", "git reflog main -2", 11.0, 12.2, 12.4, tu, 130, 390);
      drawOutputLine("c101f60 main@{0}: commit (amend): Muallifni qo'shish", 12.7, tu, 130, 415, { color: C.cyan });
      drawOutputLine("cc71ff6 main@{1}: commit: Muallifni qo'shish", 13.0, tu, 130, 437, { color: '#cbd5e1' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 470, 790, 175, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("--force-if-includes Qanday Bildi?", 240, 505, C.green, { size: 16, mono: false });
        text("• Faqat remote xatcho'piga qaramaydi, balki lokal REFLOG'ingizni tekshiradi.", 150, 545, { size: 16, color: C.text, align: 'left' });
        text("• Agar serverdagi commit sizning lokal checkout yoki commit tarixingizdan", 150, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  haqiqatan o'tmagan bo'lsa, majburlashni darhol rad etadi!", 150, 605, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Eng Yuqori Himoya Qatlami", "reflog orqali haqiqiy ko'rganlikni isbotlash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Fonda Fetch Xavfi", 1100, 290, C.red, { size: 16, mono: false });
        text("• VS Code yoki boshqa IDE'lar fonda o'zlari 'git fetch' qilib turadi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Natijada origin/main yangilanib, siz ko'rmagan yangi commitga suriladi.", 1030, 365, { size: 16, color: C.yellow, align: 'left' });
        text("• Oddiy --force-with-lease bunga aldanib, boshqalarning kodini o'chirishi mumkin.", 1030, 400, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("• Git 2.30 dan beri ushbu muammoga qarshi yangi yechim berildi.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("--force-if-includes Qoidasi", 1140, 500, C.green, { size: 16, mono: false });
        text("• Remote uchi lokal reflog yozuvlaridan biridan yetib boriladimi?", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• Ha bo'lsa: demak siz uni ko'rgansiz va birlashtirgansiz -> push o'tadi.", 1030, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Yo'q bo'lsa: push to'xtatiladi va ogohlantirish beriladi.", 1030, 610, { size: 15, color: C.yellow, align: 'left' });
        text("• Eng professional va xavfsiz majburiy push usuli!", 1030, 635, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Keyingi Qadam
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Keyingi Qadam", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git tarmoq amallari xulosasi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git push --atomic
      drawCommandLine("ali $ ", "git push --atomic origin main v1.0", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("To ../server.git", 3.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("   5d32771..2f0abc5  main -> main", 3.3, tu, 130, 252, { color: C.green, weight: 700 });
      drawOutputLine(" * [new tag]         v1.0 -> v1.0", 3.6, tu, 130, 274, { color: C.green, weight: 700 });
      drawOutputLine("  # barcha o'zgarishlar bitta butun tranzaksiyada serverga o'tdi!", 3.9, tu, 130, 296, { color: C.mute });

      // 2-buyruq: dry-run bilan tekshirish
      drawCommandLine("ali $ ", "git push --dry-run origin", 5.2, 6.5, 6.7, tu, 130, 330);
      drawOutputLine("Everything up-to-date", 7.0, tu, 130, 355, { color: C.green, weight: 600 });
      drawOutputLine("  # dry-run serverga bog'lanadi, lekin hech narsani o'zgartirmaydi!", 7.3, tu, 130, 377, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kCallout, () => {
        card(125, 410, 790, 240, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("29-bobda O'rganilgan Asosiy Vositalar", 250, 445, C.cyan, { size: 16, mono: false });
        text("• Refspec: +<src>:<dst> sintaksisi orqali tarmoq ko'rsatkichlarini boshqarish.", 150, 485, { size: 16, color: C.text, align: 'left' });
        text("• Inkor refspec (^): Keraksiz tarmoqlarni o'tkazib yuborish va omborni ixchamlash.", 150, 515, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Smart Protocol: Server va mijoz o'rtasida faqat yetishmagan packfile uzatish.", 150, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Majburlash xavfsizligi: --force-with-lease va --force-if-includes intizomi.", 150, 580, { size: 15, color: C.yellow, align: 'left' });
        text("• --atomic: Hammasi yoki hech biri qoidasi bilan relizlarni xavfsiz push qilish.", 150, 610, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Keyingi Bob: 30-bob", "SSH kalitlari va credential'lar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(167,139,250,0.08)', col: C.purple });
        pill("Tarmoq Xavfsizligi Xulosasi", 1120, 290, C.purple, { size: 16, mono: false });
        text("• Git protokollari ma'lumotlarni minimal trafik bilan uzatishga mo'ljallangan.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Compare-and-swap va reflog tekshiruvlari jamoada kod yo'qolishining oldini oladi.", 1030, 365, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Tranzaksion imkoniyatlar esa relizlarni ishonchli qiladi.", 1030, 400, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Katta jamoalarda eng yuqori darajadagi xavfsizlik.", 1030, 425, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("30-bob: SSH va Credential'lar", 1130, 500, C.green, { size: 16, mono: false });
        text("• Keyingi darsda parollarni har safar kiritish mashaqqatidan qutulamiz,", 1030, 545, { size: 16, color: C.text, align: 'left' });
        text("• ed25519 va RSA kalitlarini yaratish va serverga ulash,", 1030, 575, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Git Credential Helper (cache, store, osxkeychain) mexanizmlari", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("  va GitHub/GitLab bilan parolsiz xavfsiz ishlashni o'rganamiz!", 1030, 630, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
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
      { id: 'refspec_turlari', fn: sceneRefspecTurlari },
      { id: 'transfer_protokol', fn: sceneTransferProtokol },
      { id: 'force_with_lease', fn: sceneForceWithLease },
      { id: 'force_if_includes', fn: sceneForceIfIncludes },
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

  // Poster uchun ko'rgazmali kadr
  window.renderPoster = function () {
    bg();
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
