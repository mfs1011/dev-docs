// Git 17-bob videosi: "Ref'lar, HEAD va teg obyekti"
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
  // 1-SAHNA: Ref‘lar va HEAD Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("17-BOB · REF'LAR VA HEAD", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Ref‘lar, HEAD va Teg Obyekti", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Qirq belgili heshlar ustiga inson tushunadigan nomlar va ko‘rsatkichlar tizimi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Obyektlar va Ref‘lar Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Obyektlar (Blob, Tree, Commit)", 670, 615, C.cyan, { size: 18 });
          text("• 40 belgili SHA-1 hash bilan saqlanadi", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• O'zgarmas arxitektura: hech qachon o'zgarmaydi", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Ref‘lar (Reference — Havola)", 1250, 615, C.yellow, { size: 18 });
          text("• Odam tushunadigan nom: main, v1.0, HEAD", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• O'zgaruvchan: atigi 41 baytlik ko'rsatkich fayllar", 1010, 680, { size: 15, fam: MONO, color: C.yellow, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Ref‘lar va HEAD Tushunchasi", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Ref tushunchasi
      panel(100, 140, 840, 680, C.yellow, "Ref — Obyektlarga Insoniy Nom", "telefon kitobidagi ismlar kabi havolalar", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Telefon Kitobi O'xshatishi", 240, 290, C.yellow, { size: 16, mono: false });
        text("• Obyekt — 40 xonali telefon raqami; ref — odamning ismi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Raqamni eslab qolish shart emas, Git ism orqali darhol topadi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Oddiy Ref va Symbolic Ref", 240, 470, C.cyan, { size: 16, mono: false });
        text("• Oddiy ref: ichida to'g'ridan-to'g'ri commit hashi yozilgan.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Symbolic ref (HEAD): ichida boshqa ref'ning nomi yozilgan.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Yengil va Tezkor Branching Asosi", 250, 655, C.mute, { size: 16, mono: false });
        text("• Branch yaratish — atigi 41 baytlik fayl yozish xolos.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Yangi commit qilganda Git faqat shu fayldagi hashni yangilaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ierarxik Ref Turlari
      panel(980, 140, 840, 680, C.blue, "Ref‘larning Ierarxik Tuzilishi", ".git/refs katalogi va asosiy guruhlar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("refs/heads/ (Lokal Branchlar)", 1170, 290, C.green, { size: 16, mono: false });
        text("• Har bir branch — shu tarmoqdagi eng oxirgi commitga ishora.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• HEAD ulangan bo'lsa, yangi commit bilan oldinga siljiydi.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("refs/tags/ (Teglar — Doimiy Xatcho'p)", 1210, 470, C.purple, { size: 16, mono: false });
        text("• Tarixdagi muayyan relizga qo'yiladigan o'zgarmas belgi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi commitlar qilinganda ham hech qachon siljimaydi.", 1030, 555, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("refs/remotes/ (Serverdagi Nusxa)", 1180, 655, C.git, { size: 16, mono: false });
        text("• Serverdagi branchlarning lokal ko'zgusi (origin/main).", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Faqat git fetch yoki push buyrug'i berilganda yangilanadi.", 1030, 735, { size: 16, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git update-ref va Xavfsizlik Kafolati (REAL TERMINAL)
  // ==========================================
  function sceneUpdateRef(u, bounds, o = {}) {
    chip(2, "git update-ref va Xavfsizlik Kafolati", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminalda update-ref va CAS
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .git/refs/heads/main (u: 0.6 to 2.0, Enter 2.2)
      drawCommandLine("ombor $ ", "cat .git/refs/heads/main", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("9fb24ac6bf55c9ca489787f18a6dbad620e7f320", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("  # atigi 41 bayt: 40 ta hex belgi va yangi qator", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git update-ref refs/heads/test ca137d1 (u: 4.0 to 6.2, Enter 6.4)
      drawCommandLine("ombor $ ", "git update-ref refs/heads/test ca137d1", 4.0, 6.2, 6.4, tu, 130, 285);
      drawOutputLine("ca137d1 -> to'liq 40 belgili hash'ga aylandi va reflog yozildi", 6.7, tu, 130, 310, { color: C.green });

      // 3-buyruq: compare-and-swap xatoligi (u: 8.2 to 10.8, Enter 11.0)
      drawCommandLine("ombor $ ", "git update-ref refs/heads/test df00a2d ca137d1", 8.2, 10.8, 11.0, tu, 130, 345);
      drawOutputLine("fatal: cannot lock ref: is at 9fb24ac but expected ca137d1", 11.3, tu, 130, 370, { color: C.red, weight: 600 });
      drawOutputLine("  ✖ Compare-and-swap rad etdi: poyga holatidan himoya!", 11.7, tu, 130, 392, { color: '#f87171' });

      // 4-buyruq: reflog jurnalini ko'rish (u: 13.0 to 14.4, Enter 14.6)
      drawCommandLine("ombor $ ", "cat .git/logs/refs/heads/main | tail -n 1", 13.0, 14.4, 14.6, tu, 130, 425);
      drawOutputLine("ca137d1... 9fb24ac... Ali Valiyev <ali@...> commit: Uchinchi commit", 14.9, tu, 130, 450, { color: C.cyan });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 15.6, tu, 130, 485, { color: '#334155' });
      drawOutputLine("update-ref ref fayllarini xavfsiz qulflaydi (.lock),", 16.0, tu, 130, 515, { color: C.yellow, weight: 600 });
      drawOutputLine("nomlarni tekshiradi va to'liq reflog yuritadi!", 16.4, tu, 130, 540, { color: C.green, weight: 700 });

      // O'ng panel: Nega qo'lda yozmaslik kerak
      panel(980, 140, 840, 680, C.red, "Nega Ref Qo‘lda Yozilmaydi?", "git update-ref beradigan 4 kafolat", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("1 · Qulflash (.lock Fayli)", 1140, 290, C.red, { size: 16, mono: false });
        text("• Ikki jarayon bir vaqtda bitta ref'ni yozishiga yo'l qo'ymaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Yangi qiymat main.lock fayliga yozilib, keyin rename qilinadi.", 1030, 370, { size: 16, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Compare-and-Swap (Eski Qiymat Sharti)", 1230, 470, C.yellow, { size: 16, mono: false });
        text("• Faqat hozirgi holat kutilganidek bo'lsagina yangilashga ruxsat.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Parallel jarayon refni o'zgartirib yuborgan bo'lsa, xato beradi.", 1030, 550, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Reflog va Format Mustaqilligi", 1180, 655, C.green, { size: 16, mono: false });
        text("• Har bir o'zgarish .git/logs jurnaliga qat'iy yozib boriladi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ref packed-refs yoki reftable ichida bo'lsa ham bir xil ishlaydi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: HEAD Ko‘rsatkichi va Symbolic Ref (REAL TERMINAL)
  // ==========================================
  function sceneHeadVaSymref(u, bounds, o = {}) {
    chip(3, "HEAD Ko‘rsatkichi va Symbolic Ref", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda HEAD va symbolic-ref
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .git/HEAD (u: 0.6 to 1.8, Enter 2.0)
      drawCommandLine("ombor $ ", "cat .git/HEAD", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("ref: refs/heads/main", 2.2, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("  # Simvolik ref: hash emas, branch nomi saqlanadi!", 2.5, tu, 130, 252, { color: C.cyan });

      // 2-buyruq: git symbolic-ref HEAD (u: 4.0 to 5.4, Enter 5.6)
      drawCommandLine("ombor $ ", "git symbolic-ref HEAD", 4.0, 5.4, 5.6, tu, 130, 285);
      drawOutputLine("refs/heads/main", 5.8, tu, 130, 310, { color: C.green, weight: 700 });

      // 3-buyruq: detached HEAD holati (u: 7.2 to 9.2, Enter 9.4)
      drawCommandLine("ombor $ ", "git checkout ca137d1", 7.2, 9.2, 9.4, tu, 130, 345);
      drawOutputLine("Note: switching to 'ca137d1'.", 9.7, tu, 130, 370, { color: C.yellow });
      drawOutputLine("You are in 'detached HEAD' state.", 10.0, tu, 130, 392, { color: C.red, weight: 600 });

      // 4-buyruq: cat .git/HEAD endi hash (u: 11.5 to 12.8, Enter 13.0)
      drawCommandLine("ombor $ ", "cat .git/HEAD", 11.5, 12.8, 13.0, tu, 130, 425);
      drawOutputLine("ca137d1bffec19ce1d1c6f481a2974aa26787e88", 13.2, tu, 130, 450, { color: C.cyan, weight: 700 });
      drawOutputLine("  # Detached: HEAD to'g'ridan-to'g'ri commit hashiga ulandi!", 13.6, tu, 130, 472, { color: C.yellow });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 14.5, tu, 130, 505, { color: '#334155' });
      drawOutputLine("git switch main qilganda HEAD yana 'ref: refs/heads/main'", 15.0, tu, 130, 535, { color: C.yellow, weight: 600 });
      drawOutputLine("holatiga qaytadi va brench bilan birga oldinga yuradi!", 15.5, tu, 130, 560, { color: C.green, weight: 700 });

      // O'ng panel: Symbolic ref va Detached tushunchasi
      panel(980, 140, 840, 680, C.cyan, "HEAD va Detached Holat Sirlari", "siz hozir qayerda turganingizning ko'zgusi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Symbolic Ref Qoidasi", 1130, 290, C.cyan, { size: 16, mono: false });
        code("ref: refs/heads/main", 1030, 335, { size: 16, color: C.yellow });
        text("• HEAD to'g'ridan-to'g'ri hashni emas, branch faylining nomini saqlaydi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Detached HEAD Holati", 1130, 470, C.red, { size: 16, mono: false });
        text("• Agar commit yoki teg hashiga to'g'ridan-to'g'ri o'tsangiz,", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• HEAD simvolik ref bo'lmay qoladi va bevosita commit hashini yozadi.", 1030, 550, { size: 16, color: C.yellow, align: 'left' });
        text("• Bu holatda yangi commit qilsangiz, hech qaysi branchga kirmaydi!", 1030, 580, { size: 15, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git switch Orqali Qaytish", 1145, 655, C.green, { size: 16, mono: false });
        code("$ git switch main", 1030, 700, { size: 16, color: C.cyan });
        text("• HEAD'ni qaytadan refs/heads/main simvolik havolasiga bog'laydi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Oddiy Teg va Annotated Teg Obyekti (REAL TERMINAL)
  // ==========================================
  function sceneTegObyektlari(u, bounds, o = {}) {
    chip(4, "Oddiy Teg va Annotated Teg Obyekti", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda yengil va annotated teglar
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: lightweight teg (u: 0.6 to 2.4, Enter 2.6)
      drawCommandLine("ombor $ ", "git update-ref refs/tags/v1.0-light ca137d1", 0.6, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("cat .git/refs/tags/v1.0-light -> ca137d1... (yengil teg)", 2.9, tu, 130, 230, { color: C.yellow });

      // 2-buyruq: annotated teg yaratish (u: 4.5 to 6.8, Enter 7.0)
      drawCommandLine("ombor $ ", "git tag -a v1.0 -m 'Birinchi reliz' 9fb24ac", 4.5, 6.8, 7.0, tu, 130, 265);
      drawOutputLine("cat .git/refs/tags/v1.0 -> b824365... (commit emas, teg hashi!)", 7.3, tu, 130, 290, { color: C.green, weight: 600 });

      // 3-buyruq: git cat-file -p v1.0 (u: 8.8 to 10.2, Enter 10.4)
      drawCommandLine("ombor $ ", "git cat-file -p v1.0", 8.8, 10.2, 10.4, tu, 130, 325);
      drawOutputLine("object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320", 10.7, tu, 130, 350, { color: C.cyan });
      drawOutputLine("type commit", 11.0, tu, 130, 372, { color: C.mute });
      drawOutputLine("tag v1.0", 11.3, tu, 130, 394, { color: C.yellow });
      drawOutputLine("tagger Ali Valiyev <ali@example.com> 1791349800 +0500", 11.6, tu, 130, 416, { color: C.green });
      drawOutputLine("Birinchi reliz", 12.0, tu, 130, 442, { color: C.text, weight: 600 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 12.8, tu, 130, 475, { color: '#334155' });
      drawOutputLine("Yengil teg faqat commitga havola qiluvchi oddiy ref;", 13.3, tu, 130, 505, { color: C.yellow, weight: 600 });
      drawOutputLine("Annotated teg esa Git'dagi 4-to'laqonli o'zgarmas obyektdir!", 13.8, tu, 130, 530, { color: C.green, weight: 700 });

      // O'ng panel: 2 xil teg farqi
      panel(980, 140, 840, 680, C.purple, "Ikki Xil Teg Turi", "lightweight ref vs annotated tag obyekti", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Lightweight Teg (Yengil)", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• Faqat .git/refs/tags/ ichidagi bitta 41 baytlik oddiy fayl.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• To'g'ridan-to'g'ri commit hashiga qaraydi, muallif va xabari yo'q.", 1030, 370, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Annotated Teg (To'laqonli Obyekt)", 1170, 470, C.purple, { size: 16, mono: false });
        text("• Git omboridagi 4-tur: blob, tree, commit va tag.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Obyekt ID + tagger + sana + xabar + GPG imzo saqlaydi.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Relizlar uchun doimo annotated teg tavsiya etiladi.", 1030, 580, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Peeled Tag Tushunchasi: ^{commit}", 1180, 655, C.green, { size: 16, mono: false });
        code("$ git rev-parse v1.0^{commit}", 1030, 700, { size: 16, color: C.yellow });
        text("• Teg obyekti orqasidagi haqiqiy commit hashini yechib beradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: packed-refs va Reftable Formati (REAL TERMINAL)
  // ==========================================
  function scenePackedRefs(u, bounds, o = {}) {
    chip(5, "packed-refs va Reftable Formati", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda pack-refs
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git pack-refs --all (u: 0.6 to 2.2, Enter 2.4)
      drawCommandLine("ombor $ ", "git pack-refs --all --prune", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Barcha alohida loose ref fayllari packed-refs ga yig'ildi.", 2.7, tu, 130, 230, { color: C.green });

      // 2-buyruq: cat .git/packed-refs (u: 4.5 to 6.0, Enter 6.2)
      drawCommandLine("ombor $ ", "cat .git/packed-refs", 4.5, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("# pack-refs with: peeled-tags fully-peeled sorted", 6.5, tu, 130, 290, { color: C.mute });
      drawOutputLine("9fb24ac6bf55c9ca... refs/heads/main", 6.8, tu, 130, 312, { color: C.yellow });
      drawOutputLine("b8243657b8508e67... refs/tags/v1.0", 7.1, tu, 130, 334, { color: C.green });
      drawOutputLine("^9fb24ac6bf55c9ca... (peeled commit hashi)", 7.4, tu, 130, 356, { color: C.cyan });

      // 3-buyruq: git rev-parse (u: 9.2 to 10.8, Enter 11.0)
      drawCommandLine("ombor $ ", "git rev-parse refs/tags/v1.0^{commit}", 9.2, 10.8, 11.0, tu, 130, 395);
      drawOutputLine("9fb24ac6bf55c9ca489787f18a6dbad620e7f320", 11.3, tu, 130, 420, { color: C.green, weight: 700 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 12.2, tu, 130, 455, { color: '#334155' });
      drawOutputLine("packed-refs 100 000 ta fayl o'rniga bitta ixcham ro'yxat beradi.", 12.7, tu, 130, 485, { color: C.yellow, weight: 600 });
      drawOutputLine("Kelajakda esa ikkilik reftable formati yanada tezlashtiradi!", 13.2, tu, 130, 510, { color: C.cyan, weight: 700 });

      // O'ng panel: packed-refs va reftable
      panel(980, 140, 840, 680, C.green, "Katta Repolarda Reflar Optimizatsiyasi", "files va reftable backend texnologiyalari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("packed-refs Fayli", 1120, 290, C.green, { size: 16, mono: false });
        text("• Katta repolarda o'n minglab branch va teglar bo'ladi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har biriga alohida fayl ochish fayl tizimini tormozlaydi.", 1030, 370, { size: 16, color: C.yellow, align: 'left' });
        text("• Barcha o'zgarmas reflar bitta matn fayliga tartiblab yoziladi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Zamonaviy Standart: Reftable", 1150, 470, C.cyan, { size: 16, mono: false });
        text("• Git 3.0 standarti uchun mo'ljallangan yangi ikkilik format.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Binar qidiruv, siqilgan bloklar va to'liq atomik tranzaksiyalar.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Millionlab reflari bor korporativ repolar uchun mo'ljallangan.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Shaffoflik Kafolati", 1120, 655, C.mute, { size: 16, mono: false });
        text("• Qaysi backend bo'lishidan qat'i nazar, Git buyruqlari bir xil ishlaydi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Plumbing update-ref va rev-parse ichki formatni o'zi hal qiladi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
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
      // Chap panel: Ref va HEAD xulosasi
      panel(100, 140, 840, 520, C.green, "Ref‘lar Bo‘yicha Asosiy Xulosa", "nomlar va ko'rsatkichlar tizimi", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("1 · Ref — Insoniy Ko'rsatkich", 240, 275, C.green, { size: 15, mono: false });
        text("Obyektlar o'zgarmas, ref'lar esa joriy holatni ko'rsatuvchi yengil fayllardir.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · update-ref — Xavfsiz Yangilash", 255, 405, C.yellow, { size: 15, mono: false });
        text(".lock qulfi, compare-and-swap va reflog orqali poyga xatolarini bartaraf etadi.", 150, 445, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("3 · HEAD — Simvolik Havola", 230, 535, C.cyan, { size: 15, mono: false });
        text("HEAD joriy branchga qaraydi, detached bo'lsa bevosita commitga ulanadi.", 150, 575, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Amaliy ahamiyati
      panel(980, 140, 840, 520, C.blue, "Amaliy Ahamiyati", "ichki mexanizm va keyingi bosqich", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("1 · 4-Obyekt: Annotated Teg", 1150, 275, C.purple, { size: 15, mono: false });
        text("Lightweight ref emas, to'laqonli tag obyekti orqali doimiy relizlar qiling.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2 · Qulflangan Fayllarni Tozalash", 1170, 405, C.cyan, { size: 16, mono: false });
        text("To'satdan uzilishlarda qolgan .lock fayllarni tushunib xavfsiz tozalash.", 1030, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("3 · Keyingi Qadam: Packfile va gc", 1165, 535, C.git, { size: 15, mono: false });
        text("Loose obyektlarni bitta siqilgan packfilega yig'ish va delta siqish sirlari.", 1030, 575, { size: 16, color: C.git, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Packfile'lar va gc", 240, 725, C.git, { size: 16, mono: false });
        text("Keyingi 18-bobda: Diskni 100 martagacha tejovchi Packfile'lar va Garbage Collector (git gc)!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Nega Git har bir faylni to'liq saqlasa ham joy kam egallaydi? Delta siqish va pack indeksi qanday ishlaydi?", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Loose obyektlar qanday qilib yagona ixcham .pack fayliga jamlanishini to'liq ko'rib chiqamiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'update_ref_xavfsizlik', fn: sceneUpdateRef },
      { id: 'head_va_symref', fn: sceneHeadVaSymref },
      { id: 'teg_obyektlari', fn: sceneTegObyektlari },
      { id: 'packed_refs', fn: scenePackedRefs },
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
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();
