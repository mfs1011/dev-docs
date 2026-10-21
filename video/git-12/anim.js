// Git 12-bob videosi: "Teglar va alias'lar"
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
  // 1-SAHNA: Teglar Nima va Doimiy Belgilar
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5 va poster emas)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("12-BOB · TEGLAR VA ALIAS'LAR", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Teglar Nima va Doimiy Belgilar", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Tarixdagi muhim reliz va burilish nuqtalariga qo‘yiladigan o‘zgarmas xatcho‘p", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Branch va Teg: Asosiy Farq", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("Branch (Tarmoq)", 670, 615, C.blue, { size: 18 });
          text("• Yangi commit qilganda oldinga siljiydi", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Kitobda hozir o‘qiyotgan joyingiz", 430, 680, { size: 15, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("Teg (Tag)", 1250, 615, C.green, { size: 18 });
          text("• Tarixdagi commitda qimirlamay joyida qoladi", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Kitobdagi doimiy qistirib qo‘yilgan xatcho‘p", 1010, 680, { size: 15, color: C.green, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Teglar Nima va Doimiy Belgilar", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Tegning maqsadi
      panel(100, 140, 840, 680, C.yellow, "Teg — O‘zgarmas Xatcho‘p", "relizlar va tarixiy bosqichlar uchun", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tarixdagi Muhim Nuqta", 230, 290, C.yellow, { size: 16, mono: false });
        text("• '1.0 reliz shu yerda chiqdi' degan nuqtaga doimiy nom beriladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• 40 belgili hash'ni eslab qolish o‘rniga qisqa nom: v1.0, v2.3.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Branch bilan Asosiy Farqi", 240, 470, C.cyan, { size: 16, mono: false });
        text("• Branch kommit qilganda oldinga siljib boraveradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Teg esa har doim ko‘rsatilgan kommit ustida mahkam turadi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Qo‘llanish Sohalari", 220, 655, C.mute, { size: 16, mono: false });
        text("• Ishlab chiqarish relizlari (Semantic Versioning: v1.4.2).", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Xavfsizlik auditi, mijozga topshirilgan versiyalar va demo holatlar.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 2 xil teg
      panel(980, 140, 840, 680, C.blue, "Git'da 2 Xil Teg Mavjud", "lightweight va annotated", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Lightweight (Yengil)", 1130, 290, C.green, { size: 16, mono: false });
        text("• Faqat nom va kommit hash'idan iborat oddiy faylcha.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Shaxsiy, vaqtinchalik yoki mahalliy testlar uchun mo‘ljallangan.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Annotated (Izohli)", 1120, 470, C.blue, { size: 16, mono: false });
        text("• To‘liq Git obyekti: tagger ismi, sana, reliz xabari va imzo.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Rasmiy ommaviy relizlar uchun tavsiya etiladigan asosiy tur.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.yellow });
        pill("Bobning Ikkinchi Qismi: Aliaslar", 1180, 655, C.yellow, { size: 16, mono: false });
        text("• Tez-tez teriladigan uzun buyruqlarga qisqa taxallus qo‘yish.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Masalan: 'git st' status uchun, 'git last' oxirgi kommit uchun.", 1030, 740, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Annotated va Lightweight Teglar (SPLIT SCREEN)
  // ==========================================
  function sceneAnnotatedVsLw(u, bounds, o = {}) {
    chip(2, "Annotated va Lightweight Teglar Amaliyoti", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda lightweight va annotated teglarni yaratish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/reliz-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: lightweight teg yaratish (u: 0.8 to 2.2, Enter 2.4)
      drawCommandLine("loyiha $ ", "git tag v1.0-lw", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("# Faqat nom berildi (-a yoki -m berilmadi)", 2.7, tu, 130, 230, { color: '#64748b' });

      // 2-buyruq: fayl tizimidagi 41 baytlik ko'rsatkich (u: 3.6 to 5.0, Enter 5.2)
      drawCommandLine("loyiha $ ", "cat .git/refs/tags/v1.0-lw", 3.6, 5.0, 5.2, tu, 130, 260);
      drawOutputLine("6a1d9ca994b575e2479418dc2b1124a887889b27", 5.5, tu, 130, 284, { color: C.cyan, weight: 600 });
      drawOutputLine("# Ichida faqat commit hash'i bor (obyekt yaratilmadi!)", 5.9, tu, 130, 306, { color: '#64748b' });

      // 3-buyruq: annotated teg yaratish (u: 7.2 to 9.6, Enter 9.8)
      drawCommandLine("loyiha $ ", "git tag -a v1.0 -m \"1.0 reliz: login va profil\"", 7.2, 9.6, 9.8, tu, 130, 340);
      drawOutputLine("# To'liq annotated teg yaratildi (-a va -m bilan)", 10.1, tu, 130, 364, { color: '#64748b' });

      // 4-buyruq: cat-file -t tekshiruvi (u: 11.0 to 12.2, Enter 12.4)
      drawCommandLine("loyiha $ ", "git cat-file -t v1.0", 11.0, 12.2, 12.4, tu, 130, 396);
      drawOutputLine("tag  # commit emas, alohida mustaqil TAG OBYEKTI!", 12.7, tu, 130, 420, { color: C.green, weight: 700 });

      // 5-buyruq: cat-file -p ko'rish (u: 13.6 to 15.0, Enter 15.2)
      drawCommandLine("loyiha $ ", "git cat-file -p v1.0 | head -3", 13.6, 15.0, 15.2, tu, 130, 452);
      drawOutputLine("object 6a1d9ca994b575e2479418dc2b1124a887889b27", 15.5, tu, 130, 476, { color: C.cyan });
      drawOutputLine("type commit", 15.8, tu, 130, 498, { color: '#64748b' });
      drawOutputLine("tagger Ali Valiyev <ali@dev> 1791352800 +0500", 16.1, tu, 130, 520, { color: C.yellow, weight: 600 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 16.7, tu, 130, 560, { color: '#334155' });
      drawOutputLine("Farq: Lightweight — oddiy havola; Annotated —", 17.1, tu, 130, 590, { color: C.yellow, weight: 600 });
      drawOutputLine("muallif, sana va reliz xabariga ega rasmiy obyekt!", 17.5, tu, 130, 615, { color: C.green, weight: 700 });

      // O'ng panel: Qoidalar va farqlar
      panel(980, 140, 840, 680, C.green, "Ikki Xil Tegning Ichki Tuzilishi", "lightweight vs annotated taqqoslashi", kBox, kBox);

      const kR1 = P(u, 1.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Lightweight: Shaxsiy Ko'rsatkich", 1210, 290, C.purple, { size: 16, mono: false });
        text("• Yaratish: git tag <nom> (hech qanday -a yoki -m berilmaydi).", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• .git/refs/tags/<nom> ichida 41 baytlik fayl: faqat hash yoziladi.", 1030, 370, { size: 16, color: C.purple, align: 'left', weight: 600 });
        text("• Tegning o'z sanasi va muallifi yo'q; vaqtinchalik sinov uchun qulay.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 6.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Annotated: Rasmiy Reliz Obyekti", 1210, 470, C.green, { size: 16, mono: false });
        text("• Yaratish: git tag -a <nom> -m \"reliz xabari\"", 1030, 515, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("• Alohida Git obyekti: tagger ismi, email, sana va xabar saqlanadi.", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Agar -m berilsa, hatto -a yozilmasa ham avtomatik annotated bo'ladi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.5, 0.5);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Rasmiy Tavsiya va Xavfsizlik", 1180, 655, C.cyan, { size: 16, mono: false });
        text("• Barcha ommaviy relizlar uchun doimo annotated teglardan foydalaning.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Kriptografik tasdiq uchun -s (GPG/SSH imzo) qo'shish mumkin.", 1030, 735, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• git describe kabi vositalar odatda faqat annotated teglarga tayanadi.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Teglarni Push Qilish va O‘chirish (SPLIT SCREEN)
  // ==========================================
  function scenePushVaDelete(u, bounds, o = {}) {
    chip(3, "Teglarni Push Qilish va O‘chirish", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda push va delete amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/reliz-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: oddiy push teglarni olmaydi (u: 0.8 to 2.2, Enter 2.4)
      drawCommandLine("loyiha $ ", "git push origin main", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Everything up-to-date  # Diqqat: teglar serverga bormadi!", 2.7, tu, 130, 230, { color: C.red, weight: 600 });

      // 2-buyruq: follow-tags bilan xavfsiz push (u: 4.0 to 6.2, Enter 6.4)
      drawCommandLine("loyiha $ ", "git push --follow-tags origin main", 4.0, 6.2, 6.4, tu, 130, 260);
      drawOutputLine(" * [new tag] v1.0 -> v1.0  # faqat annotated reliz tegi ketdi!", 6.8, tu, 130, 284, { color: C.green, weight: 700 });
      drawOutputLine("# Lightweight teglar esa serverga yuborilmadi (toza qoldi)", 7.2, tu, 130, 306, { color: '#64748b' });

      // 3-buyruq: lokal tegni o'chirish (u: 8.5 to 9.8, Enter 10.0)
      drawCommandLine("loyiha $ ", "git tag -d v1.0-lw", 8.5, 9.8, 10.0, tu, 130, 340);
      drawOutputLine("Deleted tag 'v1.0-lw' (was 6a1d9ca)", 10.3, tu, 130, 364, { color: C.yellow, weight: 600 });

      // 4-buyruq: masofaviy tegni o'chirish (u: 11.5 to 13.2, Enter 13.4)
      drawCommandLine("loyiha $ ", "git push origin --delete v1.0", 11.5, 13.2, 13.4, tu, 130, 396);
      drawOutputLine(" - [deleted] v1.0  # masofaviy serverdan xavfsiz o'chirildi", 13.8, tu, 130, 420, { color: C.red, weight: 600 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 14.5, tu, 130, 460, { color: '#334155' });
      drawOutputLine("Maslahat: 'git config --global push.followTags true'", 15.0, tu, 130, 490, { color: C.yellow, weight: 600 });
      drawOutputLine("Shunda oddiy 'git push' reliz teglaringizni doim olib ketadi.", 15.4, tu, 130, 515, { color: C.green });
      drawOutputLine("E'lon qilingan tegni qayta surmang: o'rniga v1.0.1 chiqaring!", 15.8, tu, 130, 540, { color: C.cyan, weight: 600 });

      // O'ng panel: Qoidalar tahlili
      panel(980, 140, 840, 680, C.blue, "Push va O‘chirish Qoidalari", "server bilan xavfsiz sinxronlash", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Standart Qoida: Push Teglarni Olmaydi", 1230, 290, C.red, { size: 16, mono: false });
        text("• 'git push' faqat branch commitlarini yuboradi, teglar qolib ketadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bitta tegni yuborish: git push origin v1.0", 1030, 370, { size: 17, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Barcha teglarni yuborish: git push origin --tags (lightweight ham ketadi).", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oltin Opsiya: --follow-tags", 1170, 470, C.green, { size: 16, mono: false });
        text("• Serverda yo'q va jo'natilayotgan commitga tegishli annotated teglarni oladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Shaxsiy lightweight teglarni chetlab o'tib, faqat relizlarni yuboradi.", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Doimiy qilish: git config --global push.followTags true", 1030, 580, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Teglarni O'chirish va Qayta Teglamaslik", 1230, 655, C.yellow, { size: 16, mono: false });
        text("• Lokal o'chirish: git tag -d <nom>  |  Serverdan: git push origin --delete <nom>", 1030, 700, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• Qat'iy qoida: E'lon qilingan tegni 'git tag -f' bilan qayta surmang!", 1030, 735, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Bu hamkasblar tarixini buzadi. Xato bo'lsa yangi v1.0.1 chiqaring.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git describe va Detached HEAD (SPLIT SCREEN)
  // ==========================================
  function sceneDescribeVaDetached(u, bounds, o = {}) {
    chip(4, "git describe va Detached HEAD", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda git describe va detached HEAD
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/reliz-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: git describe (u: 0.8 to 2.0, Enter 2.2)
      drawCommandLine("loyiha $ ", "git describe", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("v1.0-4-ge97a3f5  # inson tushunadigan versiya nomi", 2.6, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("# v1.0 tegi + 4 ta yangi commit + commit xeshi e97a3f5", 3.0, tu, 130, 252, { color: '#64748b' });

      // 2-buyruq: git describe --dirty (u: 4.2 to 5.6, Enter 5.8)
      drawCommandLine("loyiha $ ", "git describe --dirty", 4.2, 5.6, 5.8, tu, 130, 284);
      drawOutputLine("v1.0-4-ge97a3f5-dirty  # diskda saqlanmagan kod bor!", 6.2, tu, 130, 308, { color: C.yellow, weight: 600 });

      // 3-buyruq: tegga switch qilish (detached HEAD) (u: 7.5 to 9.2, Enter 9.4)
      drawCommandLine("loyiha $ ", "git switch --detach v1.0", 7.5, 9.2, 9.4, tu, 130, 340);
      drawOutputLine("HEAD is now at 6a1d9ca Xatolar tuzatildi", 9.8, tu, 130, 364, { color: C.cyan });
      drawOutputLine("HEAD detached at v1.0  # HEAD branchga emas, commitga ulandi!", 10.2, tu, 130, 386, { color: C.red, weight: 600 });

      // 4-buyruq: tegdan xavfsiz yangi branch ochish (u: 11.6 to 13.6, Enter 13.8)
      drawCommandLine("loyiha $ ", "git switch -c hotfix-1.0 v1.0", 11.6, 13.6, 13.8, tu, 130, 420);
      drawOutputLine("Switched to a new branch 'hotfix-1.0'  # to'g'ri xavfsiz yo'l!", 14.2, tu, 130, 444, { color: C.green, weight: 700 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 14.8, tu, 130, 480, { color: '#334155' });
      drawOutputLine("Qoida: Teg — branch emas, unga 'o'tib' commit qilib bo'lmaydi.", 15.2, tu, 130, 510, { color: C.yellow, weight: 600 });
      drawOutputLine("Eski reliz ustida ishlash uchun tegdan YANGI BRANCH oching!", 15.6, tu, 130, 535, { color: C.green, weight: 700 });

      // O'ng panel: Tahlil
      panel(980, 140, 840, 680, C.yellow, "Versiyalash va Detached HEAD", "inson o'qiydigan nom va xavfsiz tuzatish", kBox, kBox);

      const kS1 = P(u, 1.0, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git describe Formati Tahlili", 1210, 290, C.yellow, { size: 16, mono: false });
        text("• v1.0-4-ge97a3f5: eng yaqin teg (v1.0), masofa (4 commit), hash (e97a3f5).", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• 'g' harfi Git ma'nosida qo'shiladi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Bu nom dasturiy relizlar va CI/CD build raqami uchun ayni muddao!", 1030, 400, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 6.5, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Detached HEAD Holati Nima?", 1170, 470, C.red, { size: 16, mono: false });
        text("• HEAD biror branch nomiga emas, commit hashiga to'g'ridan-to'g'ri ko'rsatadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Kodni ko'rish yoki sinash mumkin, lekin yangi commitlar havoda qoladi!", 1030, 550, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Boshqa joyga o'tsangiz, o'sha commitlar yo'qolib ketishi mumkin.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kS3 = P(u, 11.5, 0.5);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To'g'ri Yo'l: Tegdan Branch Ochish", 1210, 655, C.green, { size: 16, mono: false });
        text("• git switch -c hotfix-1.0 v1.0", 1030, 700, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("• Eski relizdagi xatoni to'g'rilab, bemalol yangi commitlar qilasiz.", 1030, 735, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• v1.0 tegi o'z joyida qoladi, branch esa xavfsiz rivojlanadi.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Git Aliaslari va Qulaylik (SPLIT SCREEN)
  // ==========================================
  function sceneAliaslar(u, bounds, o = {}) {
    chip(5, "Git Aliaslari va Qulaylik", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda alias sozlash va ishlatish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/reliz-loyiha (80x24)',
        p: kBox
      });

      const tu = o.isPoster ? 17.0 : u;

      // 1-buyruq: alias sozlash (u: 0.8 to 2.6, Enter 2.8)
      drawCommandLine("loyiha $ ", "git config --global alias.st status", 0.8, 2.6, 2.8, tu, 130, 205);
      drawCommandLine("loyiha $ ", "git config --global alias.unstage \"restore --staged --\"", 3.4, 5.8, 6.0, tu, 130, 235);
      drawCommandLine("loyiha $ ", "git config --global alias.last \"log -1 HEAD\"", 6.6, 8.4, 8.6, tu, 130, 265);

      // 2-buyruq: alias bilan statusni ko'rish (u: 9.4 to 10.4, Enter 10.6)
      drawCommandLine("loyiha $ ", "git st -s", 9.4, 10.4, 10.6, tu, 130, 305);
      drawOutputLine("M  app.txt  # 'git status -s' bilan bir xil ishlaydi!", 10.9, tu, 130, 329, { color: C.green, weight: 600 });

      // 3-buyruq: git last ishlatish (u: 11.8 to 12.8, Enter 13.0)
      drawCommandLine("loyiha $ ", "git last --oneline", 11.8, 12.8, 13.0, tu, 130, 361);
      drawOutputLine("e97a3f5 (HEAD -> main, tag: v1.1) Profil sahifasi", 13.3, tu, 130, 385, { color: C.cyan, weight: 600 });

      // 4-buyruq: git unstage amaliyoti (u: 14.0 to 15.2, Enter 15.4)
      drawCommandLine("loyiha $ ", "git unstage app.txt && git st -s", 14.0, 15.2, 15.4, tu, 130, 417);
      drawOutputLine(" M app.txt  # indexdan muvaffaqiyatli chiqarildi!", 15.7, tu, 130, 441, { color: C.yellow, weight: 700 });

      // Terminal xulosasi
      drawOutputLine("--------------------------------------------------", 16.0, tu, 130, 475, { color: '#334155' });
      drawOutputLine("Barcha aliaslar ~/.gitconfig fayliga yoziladi.", 16.3, tu, 130, 505, { color: C.yellow, weight: 600 });
      drawOutputLine("Kundalik 100 martalab yoziladigan buyruqlarni 2 ta harfga", 16.6, tu, 130, 530, { color: C.cyan });
      drawOutputLine("tushirish orqali ishingizni 3 barobar tezlashtirasiz!", 16.9, tu, 130, 555, { color: C.green, weight: 700 });

      // O'ng panel: Alias qoidalari
      panel(980, 140, 840, 680, C.cyan, "Git Alias Taxalluslari", "samaradorlikni oshiruvchi tayyor andozalar", kBox, kBox);

      const kA1 = P(u, 1.0, 0.5);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Klassik Vaqt Tejamkorlari", 1180, 290, C.cyan, { size: 16, mono: false });
        text("• git st  -> status   |   git co  -> checkout/switch", 1030, 335, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("• git br  -> branch   |   git ci  -> commit", 1030, 370, { size: 17, fam: MONO, color: C.green, align: 'left' });
        text("• Git mavjud buyruqlarni taxmin qilmaydi, alias esa buni hal etadi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kA2 = P(u, 6.5, 0.5);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 14);
        card(1005, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Kuchli Professional Aliaslar", 1190, 470, C.green, { size: 16, mono: false });
        text("• git unstage: 'restore --staged --' (stagingdan chiqarish).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• git last: 'log -1 HEAD' (oxirgi commitni tezkor ko'rish).", 1030, 550, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• git lg: 'log --oneline --graph --all' (chiroyli daraxt).", 1030, 580, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kA3 = P(u, 11.5, 0.5);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Qoidalar va Saqlanish Joyi", 1170, 655, C.yellow, { size: 16, mono: false });
        text("• Barcha global aliaslar ~/.gitconfig faylida [alias] ostida saqlanadi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Mavjud Git buyruqlarini (masalan status) yashirib bo'lmaydi.", 1030, 735, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Alias orqasidan berilgan barcha argumentlar buyruq oxiriga ulanadi.", 1030, 765, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xulosa va Tavsiyalar", u, 0);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // 3 ta parallel ustun (har biri w=540, h=520, y=140)
      // 1-ustun: Doimo Annotated
      panel(100, 140, 540, 520, C.green, "1 · Doimo Annotated", "rasmiy relizlar uchun", kBox, kBox);
      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(120, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.green });
        pill("To'laqonli Git Obyekti", 230, 290, C.green, { size: 15, mono: false });
        text("• git tag -a -m", 140, 340, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("  Muallif, sana va izoh saqlanadi.", 140, 370, { size: 15, color: C.text, align: 'left' });
        text("• Relizlar standarti", 140, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Ommaviy versiyalar uchun qat'iy tavsiya.", 140, 440, { size: 15, color: C.text, align: 'left' });
        text("• Raqamli Imzo", 140, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Kriptografik isbot uchun: git tag -s.", 140, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 140, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Shaxsiy testlar uchun lightweight kifoya.", 140, 580, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      // 2-ustun: Push va Xavfsizlik
      panel(690, 140, 540, 520, C.yellow, "2 · Push va Xavfsizlik", "--follow-tags va o'zgarmaslik", kBox, kBox);
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(710, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Server Bilan Ishlash", 810, 290, C.yellow, { size: 15, mono: false });
        text("• push.followTags = true", 730, 340, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  Faqat annotated relizlarni jo'natadi.", 730, 370, { size: 15, color: C.text, align: 'left' });
        text("• Qayta teglamang!", 730, 410, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  E'lon qilingan tegni -f bilan surmang.", 730, 440, { size: 15, color: C.red, align: 'left' });
        text("• O'chirish", 730, 480, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  git push origin --delete <nom>.", 730, 510, { size: 15, fam: MONO, color: C.text, align: 'left' });
        text("• Xulosa", 730, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Xato bo'lsa yangi patch reliz chiqaring.", 730, 580, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 3-ustun: Unumdor Aliaslar
      panel(1280, 140, 540, 520, C.cyan, "3 · Unumdor Aliaslar", "vaqt va kuchni tejash", kBox, kBox);
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1300, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.cyan });
        pill("Shaxsiy Qulaylik", 1390, 290, C.cyan, { size: 15, mono: false });
        text("• git st, git co, git br", 1320, 340, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("  Kundalik 2-3 harfli qisqartmalar.", 1320, 370, { size: 15, color: C.text, align: 'left' });
        text("• git last va git unstage", 1320, 410, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("  Murakkab buyruqlarni osonlashtiradi.", 1320, 440, { size: 15, color: C.text, align: 'left' });
        text("• git lg", 1320, 480, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  Chiroyli grafik ko'rinish beradi.", 1320, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 1320, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  ~/.gitconfig da o'zingizga moslang!", 1320, 580, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.5, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Plumbing va Porcelain", 280, 725, C.git, { size: 16, mono: false });
        text("Keyingi 13-bobda: Git ichki arxitekturasi — Plumbing, Porcelain va .git papkasi sirlari!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Git qanday qilib oddiy fayl tizimi asosida ishlaydi, .git ichidagi obyektlar va ma'lumotlar bazasi bilan tanishamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Teglar va aliaslarni puxta o'zlashtirish — har qanday loyihada professional dasturchilikning ajralmas belgisidir.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'annotated_vs_lw', fn: sceneAnnotatedVsLw },
      { id: 'push_va_delete', fn: scenePushVaDelete },
      { id: 'describe_va_detached', fn: sceneDescribeVaDetached },
      { id: 'aliaslar', fn: sceneAliaslar },
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