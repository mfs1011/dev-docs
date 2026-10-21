// Git 15-bob videosi: "Tree va index"
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
  // 1-SAHNA: Tree va Index Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("15-BOB · TREE VA INDEX", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Tree va Index Tushunchasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Fayllarni kataloglar shaklida bog‘lovchi daraxt va staging maydonining binar asosi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Blob va Tree Obyektlari Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Blob (Fayl Mazmuni)", 670, 615, C.cyan, { size: 18 });
          text("• Faqat xom baytlarni saqlaydi (kontent)", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Fayl nomi va yo'li yo'q, faqat SHA-1 hash", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(16,185,129,0.10)', col: C.green });
          pill("Tree (Papka Yozuvi)", 1250, 615, C.green, { size: 18 });
          text("• UNIX katalog yozuvlari kabi ro'yxat", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Rejim (mode) + obyekt ID + fayl nomi", 1010, 680, { size: 15, fam: MONO, color: C.green, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Tree va Index Tushunchasi", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Tree strukturasi
      panel(100, 140, 840, 680, C.blue, "Tree — Papkalar Strukturasi", "rejim, nom va obyekt ID'lar ro'yxati", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Rejim va Obyekt ID", 240, 290, C.cyan, { size: 16, mono: false });
        text("• Har qatorda rejim (100644, 040000), ID va fayl nomi turadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl bo'lsa blob hash'i, ichki papka bo'lsa boshqa tree hash'i.", 150, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Nomlar Tree'da Saqlanadi", 255, 470, C.green, { size: 16, mono: false });
        text("• Mazmun blob ichida, fayl nomi esa faqat tree ro'yxatida yoziladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bitta blob bir nechta papkada turli nomlar bilan uchrashi mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmas Arxiv Obyekti", 230, 655, C.mute, { size: 16, mono: false });
        text("• Tree omborga bir marta yoziladi va abadiy o'zgarmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• U commit qilingan butun loyiha katalogining to'liq suratidir.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Index qatlami
      panel(980, 140, 840, 680, C.yellow, "Index — Staging Maydoni", ".git/index binar dircache fayli", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tekis Ro'yxat (Flat List)", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• Tree'dan farqli ravishda index'da ichma-ich papkalar yo'q.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir fayl to'liq yo'li bilan tekis saqlanadi: bak/test.txt.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Keyingi Commit Qoralamasi", 1150, 470, C.git, { size: 16, mono: false });
        text("• Staging hududi keyingi commit'ga nimalar kirishini belgilaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Working tree'dagi xom o'zgarishlar faqat add orqali index'ga o'tadi.", 1030, 555, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Daraxtga Aylanish Ko'prigi", 1145, 655, C.mute, { size: 16, mono: false });
        text("• Commit paytida Git index'dagi tekis ro'yxatni tree'larga ajratadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shu tariqa tezkor ish stoli o'zgarmas arxiv daraxtiga aylanadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega To‘g‘ridan-to‘g‘ri Emas, Index Orqali?
  // ==========================================
  function sceneNegaIndex(u, bounds, o = {}) {
    chip(2, "Nega To‘g‘ridan-to‘g‘ri Emas, Index Orqali?", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Insoniy ehtiyoj
      panel(100, 140, 840, 680, C.yellow, "1. Odamlar Ehtiyoji — Qismlab Yig'ish", "commit qoralamasi va aniq nazorat", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("O'zgarishlarni Bo'laklash", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Papkada 10 ta fayl o'zgargan bo'lsa ham, faqat 2 tasini tanlaymiz.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• git add --patch orqali hatto fayl ichidagi bitta satrni ajratish mumkin.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Mantiqiy va Toza Tarix", 225, 470, C.cyan, { size: 16, mono: false });
        text("• Har bir commit bitta aniq vazifa yoki tuzatishni aks ettiradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Working tree'dagi keraksiz qoralamalar ombor tarixiga kirmaydi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Merge va Ziddiyat Holati", 230, 655, C.mute, { size: 16, mono: false });
        text("• Ziddiyat paytida bitta yo'l uchun stage 1, 2, 3 versiyalari yoziladi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Tree'da bunga joy yo'q, index esa bu oraliq holatni bemalol ushlaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Texnik zarurat va kesh
      panel(980, 140, 840, 680, C.green, "2. Texnik Zarurat — Stat Kesh va Tezlik", "git status va operatsiyalar chaqmoqdek tez", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Stat Metama'lumotlar Keshi", 1145, 290, C.green, { size: 16, mono: false });
        text("• Index har bir faylning ctime, mtime, hajmi va inode raqamini saqlaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl hajmi va vaqti o'zgarmagan bo'lsa, uni qayta o'qish shart emas.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("100 000 Faylda Chaqmoq Tezlik", 1160, 470, C.cyan, { size: 16, mono: false });
        text("• git status har gal yuz minglab faylning SHA-1 hashini hisoblamaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Avval stat qiymatlarini solishtiradi va faqat shubhali fayllarni ochadi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmas vs O'zgaruvchan", 1140, 655, C.mute, { size: 16, mono: false });
        text("• Tree — qat'iy va o'zgarmas arxitektura; index — chaqqon ish stoli.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ushbu ikki qavatli model Git'ga aqlbovar qilmas barqarorlik beradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: update-index va .git/index Fayli (REAL TERMINAL)
  // ==========================================
  function sceneUpdateIndex(u, bounds, o = {}) {
    chip(3, "update-index va .git/index Fayli", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda update-index va index binar tekshiruvi
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git update-index --add --cacheinfo (u: 0.6 to 2.8, Enter 3.0)
      drawCommandLine("ombor $ ", "git update-index --add --cacheinfo 100644,83baae6...,test.txt", 0.6, 2.8, 3.0, tu, 130, 205);

      // 2-buyruq: git ls-files -s (u: 4.2 to 5.4, Enter 5.6)
      drawCommandLine("ombor $ ", "git ls-files -s", 4.2, 5.4, 5.6, tu, 130, 235);
      drawOutputLine("100644 83baae61804e65cc73a7201a... 0\ttest.txt", 5.8, tu, 130, 260, { color: C.yellow, weight: 600 });

      // 3-buyruq: xxd .git/index | head -n 3 (u: 7.2 to 9.0, Enter 9.2)
      drawCommandLine("ombor $ ", "xxd .git/index | head -n 3", 7.2, 9.0, 9.2, tu, 130, 295);
      drawOutputLine("00000000: 4449 5243 0000 0002 0000 0001 0000 0000  DIRC............", 9.4, tu, 130, 320, { color: C.cyan });
      drawOutputLine("00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................", 9.7, tu, 130, 342, { color: C.mute });
      drawOutputLine("00000020: 0000 0000 0000 81a4 0000 0000 0000 0000  ................", 10.0, tu, 130, 364, { color: C.cyan });
      drawOutputLine("  # 'DIRC' (dircache), v2, 1 ta yozuv, rejim 0x81a4 (100644)", 10.3, tu, 130, 388, { color: C.green, weight: 600 });

      // 4-buyruq: git status holatini ko'rish (u: 12.0 to 13.2, Enter 13.4)
      drawCommandLine("ombor $ ", "git status -s", 12.0, 13.2, 13.4, tu, 130, 420);
      drawOutputLine("AM test.txt", 13.6, tu, 130, 445, { color: C.yellow, weight: 700 });
      drawOutputLine("  # 'A': index'ga qo'shilgan (v1); 'M': diskda o'zgargan (v2)!", 14.0, tu, 130, 470, { color: C.cyan });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 15.0, tu, 130, 505, { color: '#334155' });
      drawOutputLine("Xulosa: .git/index diskdagi fayllarga qaramasdan", 15.5, tu, 130, 535, { color: C.yellow, weight: 600 });
      drawOutputLine("har qanday bloblarni aniq yo'l bilan keshlay oladi!", 16.0, tu, 130, 560, { color: C.green, weight: 700 });

      // O'ng panel: DIRC binar formati va parametrlari
      panel(980, 140, 840, 680, C.purple, "DIRC Binar Format Tuzilishi", ".git/index ichidagi 104 baytlik tuzilma", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("DIRC Sarlavhasi (12 Bayt)", 1140, 290, C.purple, { size: 16, mono: false });
        code("44 49 52 43  00 00 00 02  00 00 00 01  (DIRC, v2, 1 ta yozuv)", 1030, 335, { size: 15, color: C.purple });
        text("• 4 bayt imzo ('DIRC' = dircache), 4 bayt versiya, 4 bayt yozuvlar soni.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Yozuv Qismlari (Stat + Hash + Nom)", 1180, 470, C.cyan, { size: 16, mono: false });
        text("• 40 bayt stat ma'lumotlari: ctime, mtime, dev, ino, mode 0x81a4, hajm.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• 20 bayt xom SHA-1 hash + 2 bayt flags (stage, nom uzunligi) + fayl nomi.", 1030, 555, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Yaxlitlik Nazorati (20 Bayt SHA-1)", 1175, 655, C.mute, { size: 16, mono: false });
        code("83a8b4028da30cc7105d83e0db6c7a7dc915bd52  (oxirgi checksum)", 1030, 700, { size: 15, color: C.text });
        text("• Faylning barcha baytlari SHA-1 bilan tekshiriladi, buzilish seziladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: write-tree va Papkalar Daraxti (REAL TERMINAL)
  // ==========================================
  function sceneWriteTree(u, bounds, o = {}) {
    chip(4, "write-tree va Papkalar Daraxti", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda write-tree va cat-file orqali daraxt ko'rish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git write-tree (u: 0.6 to 1.8, Enter 2.0)
      drawCommandLine("ombor $ ", "git write-tree", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("d8329fc1cc938780ffdd9f94e0d364e0ea74f579", 2.2, tu, 130, 230, { color: C.yellow, weight: 600 });

      // 2-buyruq: git cat-file -p d8329fc (u: 3.2 to 4.6, Enter 4.8)
      drawCommandLine("ombor $ ", "git cat-file -p d8329fc", 3.2, 4.6, 4.8, tu, 130, 260);
      drawOutputLine("100644 blob 83baae61804e65cc73a7201a...  test.txt", 5.0, tu, 130, 285, { color: C.green, weight: 600 });

      // 3-buyruq: yangi fayl qo'shish va ikkinchi tree (u: 6.6 to 9.2, Enter 9.4)
      drawCommandLine("ombor $ ", "echo 'new file' > new.txt && git update-index --add new.txt", 6.6, 9.2, 9.4, tu, 130, 320);

      // 4-buyruq: git write-tree yangi tree yaratadi (u: 10.4 to 11.6, Enter 11.8)
      drawCommandLine("ombor $ ", "git write-tree", 10.4, 11.6, 11.8, tu, 130, 350);
      drawOutputLine("0155eb4229851634a0f03eb265b69f5a2d56f341", 12.0, tu, 130, 375, { color: C.cyan, weight: 600 });

      // 5-buyruq: git cat-file -p 0155eb4 (u: 12.8 to 14.0, Enter 14.2)
      drawCommandLine("ombor $ ", "git cat-file -p 0155eb4", 12.8, 14.0, 14.2, tu, 130, 405);
      drawOutputLine("100644 blob fa49b077972391ad58037050...  new.txt", 14.4, tu, 130, 430, { color: C.text });
      drawOutputLine("100644 blob 1f7a7a472abf3dd9643fd615...  test.txt", 14.7, tu, 130, 452, { color: C.text });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 15.3, tu, 130, 490, { color: '#334155' });
      drawOutputLine("Har bir snapshot uchun o'zgarmas tree obyekti saqlanadi.", 15.7, tu, 130, 520, { color: C.yellow, weight: 600 });
      drawOutputLine("Eski tree (d8329fc) ham o'z holicha omborda abadiy qoladi!", 16.1, tu, 130, 545, { color: C.green, weight: 700 });

      // O'ng panel: Ierarxiya va deduplikatsiya
      panel(980, 140, 840, 680, C.cyan, "Ierarxiya va Diskni Tejash", "ichki papkalar va hash qayta ishlatilishi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ichki Papkalar Daraxti", 1130, 290, C.cyan, { size: 16, mono: false });
        code("040000 tree d8329fc...  bak  (ichki papka boshqa tree'ga bog'lanadi)", 1030, 335, { size: 15, color: C.cyan });
        text("• Index tekis bo'lsa ham (bak/test.txt), write-tree uni papkalarga ajratadi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Hash Orqali Qayta Ishlatilish", 1150, 470, C.green, { size: 16, mono: false });
        text("• Agar bak papkasidagi fayllar o'zgarmasa, tree hash'i ham o'zgarmaydi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Ildiz tree shunchaki o'sha eski d8329fc hashiga ishora qilib qo'yadi.", 1030, 555, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Natija: Disk Joyining Maksimal Tejalishi", 1195, 655, C.mute, { size: 16, mono: false });
        text("• Minglab fayllardan iborat loyihada faqat 1 ta fayl o'zgarganda,", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Faqat o'sha fayl blob'i va uning yuqorisidagi ota tree'largina yoziladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: read-tree va checkout-index (REAL TERMINAL)
  // ==========================================
  function sceneReadTree(u, bounds, o = {}) {
    chip(5, "read-tree va checkout-index", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda read-tree va checkout-index amaliyoti
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git read-tree --prefix=bak d8329fc (u: 0.6 to 2.8, Enter 3.0)
      drawCommandLine("ombor $ ", "git read-tree --prefix=bak d8329fc", 0.6, 2.8, 3.0, tu, 130, 205);

      // 2-buyruq: git write-tree bilan yangi daraxt yaratish (u: 4.2 to 5.4, Enter 5.6)
      drawCommandLine("ombor $ ", "git write-tree", 4.2, 5.4, 5.6, tu, 130, 235);
      drawOutputLine("3c4e9cdb788006d48e02d68e37b77b42f618b76c", 5.8, tu, 130, 260, { color: C.yellow, weight: 600 });

      // 3-buyruq: git cat-file -p 3c4e9cd (u: 7.0 to 8.4, Enter 8.6)
      drawCommandLine("ombor $ ", "git cat-file -p 3c4e9cd", 7.0, 8.4, 8.6, tu, 130, 295);
      drawOutputLine("040000 tree d8329fc1cc938780ffdd9f94...  bak", 8.8, tu, 130, 320, { color: C.cyan, weight: 700 });
      drawOutputLine("100644 blob fa49b077972391ad58037050...  new.txt", 9.1, tu, 130, 342, { color: C.text });
      drawOutputLine("100644 blob 1f7a7a472abf3dd9643fd615...  test.txt", 9.4, tu, 130, 364, { color: C.text });

      // 4-buyruq: git checkout-index -a -f (u: 11.0 to 12.6, Enter 12.8)
      drawCommandLine("ombor $ ", "git checkout-index -a -f", 11.0, 12.6, 12.8, tu, 130, 400);
      drawOutputLine("bak/test.txt diskka chiqarildi (version 1)", 13.0, tu, 130, 425, { color: C.green, weight: 600 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 13.8, tu, 130, 460, { color: '#334155' });
      drawOutputLine("Poydevor: git reset va git restore buyruqlari", 14.3, tu, 130, 490, { color: C.yellow, weight: 600 });
      drawOutputLine("aynan read-tree + checkout-index zanjirida ishlaydi!", 14.8, tu, 130, 515, { color: C.green, weight: 700 });

      // O'ng panel: checkout-index va reset mexanizmi
      panel(980, 140, 840, 680, C.yellow, "checkout-index — Ishchi Joyga", "staged fayllarni diskka chiqarib berish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("read-tree Diskka Tegmaydi!", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• read-tree faqat .git/index faylini o'zgartiradi, diskka yozmaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        code("AD bak/test.txt  (index'ga qo'shildi, lekin diskda hali yo'q)", 1030, 375, { size: 15, color: C.yellow });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git checkout-index -a -f", 1130, 470, C.cyan, { size: 16, mono: false });
        code("$ git checkout-index -a -f  (-a hamma fayllar, -f ustidan yozish)", 1030, 515, { size: 15, color: C.cyan });
        text("• Index'dagi barcha fayllarni ishchi katalogga jismonan chiqaradi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("git restore va switch Pishiq Asosi", 1170, 655, C.mute, { size: 16, mono: false });
        text("• Yuqori darajadagi zamonaviy buyruqlar aynan shu plumbing zanjiri", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• (read-tree + checkout-index) yordamida fayllarni xavfsiz tiklaydi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
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
      // Chap panel: Tree va Index xulosasi
      panel(100, 140, 840, 520, C.green, "Tree va Index Bo‘yicha Xulosa", "fayl nomlari va staging asosi", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("1 · Tree — Fayl Nomlari va Papkalar", 245, 275, C.green, { size: 15, mono: false });
        text("Blob faqat mazmunni saqlaydi, nomlar va ruxsatlar faqat tree ichida bo'ladi.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("2 · Index — Stat Keshi va Ish Maydoni", 250, 405, C.yellow, { size: 15, mono: false });
        text("DIRC binar formati stat ma'lumotlarini keshlab, git status'ni juda tezlashtiradi.", 150, 445, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("3 · write-tree va read-tree Juftligi", 240, 535, C.cyan, { size: 15, mono: false });
        text("Tekis index ro'yxatini tree'ga aylantiradi va teskarisiga qaytarib beradi.", 150, 575, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Amaliy ahamiyati
      panel(980, 140, 840, 520, C.blue, "Amaliy Ahamiyati", "ichki mexanizm va keyingi bosqich", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("1 · git ls-files -s Kuchli Qurol", 1160, 275, C.cyan, { size: 15, mono: false });
        text("Index'dagi har qanday faylning joriy blob hashi va stage bosqichini ko'ring.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("2 · Qayta Ishlatilishning Quvvati", 1170, 405, C.purple, { size: 15, mono: false });
        text("O'zgarmagan butun boshli kataloglar bitta o'sha eski tree hashi bilan tekinga saqlanadi.", 1030, 445, { size: 16, color: C.purple, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("3 · Keyingi Qadam: Commit Obyekti", 1175, 535, C.git, { size: 15, mono: false });
        text("Tree'ga muallif, sana, ota commitlar va xabarni qo'shib, to'liq commit yasaymiz.", 1030, 575, { size: 16, color: C.git, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Commit Obyekti", 240, 725, C.git, { size: 16, mono: false });
        text("Keyingi 16-bobda: Haqiqiy Git Commit Obyekti — commit-tree va commitning ichki tuzilishi!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Commit ichida nimalar bor, ota commit qanday ko'rsatiladi va commit nima uchun tarixning kalitidir?", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Blob va tree'dan so'ng, Git arxitekturasining uchinchi va eng mashhur ustunini kashf etamiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'nega_index', fn: sceneNegaIndex },
      { id: 'update_index_va_dirc', fn: sceneUpdateIndex },
      { id: 'write_tree_ierarxiya', fn: sceneWriteTree },
      { id: 'read_tree_va_checkout', fn: sceneReadTree },
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