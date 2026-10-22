// anim.js — 39-bob: reset sirlari: uch daraxt
// Realistik split-screen: terminal va kontseptual infografika
(function () {
  const canvas = document.getElementById('c') || document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const kit = window.GITKIT(ctx);

  const {
    C,
    MONO,
    UI,
    bg,
    terminal,
    card,
    panel,
    pill,
    chip,
    text,
    tw,
    withA,
    P,
    eo,
    clamp
  } = kit;

  const TM = window.TM;

  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
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
  // 1-SAHNA: Gitning Uch Daraxti
  // ==========================================
  function sceneThreeTrees(u, bounds, o = {}) {
    chip(1, "Gitning Uch Daraxti: HEAD, Index va Working Tree", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse HEAD
      drawCommandLine("dev $ ", "git rev-parse HEAD", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("7e2d1ef8b9e81bf2e8e7b8fa3ff9020a338b6923 (v3)", 2.8, tu, 130, 228, { color: C.yellow });

      // 2-buyruq: git ls-files -s
      drawCommandLine("dev $ ", "git ls-files -s", 3.8, 5.2, 5.4, tu, 130, 265);
      drawOutputLine("100644 29ef827e8a45b1039d908884aae4490157bcb2b4 0 file.txt", 5.7, tu, 130, 288, { color: C.green });

      // 3-buyruq: cat file.txt
      drawCommandLine("dev $ ", "cat file.txt", 6.8, 7.9, 8.1, tu, 130, 325);
      drawOutputLine("v3", 8.4, tu, 130, 348, { color: '#cbd5e1' });

      // 4-buyruq: echo v4 > file.txt && git status -s
      drawCommandLine("dev $ ", "echo v4 > file.txt && git status -s", 9.4, 11.5, 11.7, tu, 130, 385);
      drawOutputLine(" M file.txt  # O'ng ustun: Working Tree o'zgargan (unstaged)", 12.0, tu, 130, 408, { color: C.red, weight: 600 });

      // 5-buyruq: git add file.txt && git status -s
      drawCommandLine("dev $ ", "git add file.txt && git status -s", 13.0, 15.0, 15.2, tu, 130, 445);
      drawOutputLine("M  file.txt  # Chap ustun: Index o'zgargan (staged)", 15.5, tu, 130, 468, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Git Boshqaradigan 3 Daraxt", "ma'lumotlarning uch holati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 195, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uchta Asosiy Qatlam", 1125, 290, C.cyan, { size: 16, mono: false });
        text("1. HEAD          : Oxirgi commit surati; keyingi commitning otasi.", 1030, 335, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("2. Index         : Keyingi commit taklifi (staging qoralamasi).", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("3. Working Tree  : Muharrirda ochiq, diskdagi tahrirlanadigan qum quti.", 1030, 395, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        text("• 'Daraxt' so'zi Gitda 'fayllar to'plamining surati' ma'nosida ishlatiladi.", 1030, 425, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 475, 790, 175, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ma'lumot Oqimi Yo'nalishi", 1125, 510, C.green, { size: 16, mono: false });
        text("• Odatdagi harakat: Working Tree → (add) → Index → (commit) → HEAD.", 1030, 550, { size: 14, color: C.text, align: 'left' });
        text("• 'git status -s': chap ustun HEAD↔Index, o'ng ustun Index↔Worktree.", 1030, 575, { size: 14, color: C.yellow, align: 'left' });
        text("• 'git reset' buyrug'i esa aynan shu oqimni teskarisiga qaytaradi!", 1030, 600, { size: 14, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Resetning Uch Qadami
  // ==========================================
  function sceneResetAlgorithm(u, bounds, o = {}) {
    chip(2, "Resetning Uch Qadami: --soft, --mixed va --hard", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git reset --soft HEAD~
      drawCommandLine("dev $ ", "git reset --soft HEAD~", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("HEAD is now at ff8cf5e (v2)", 3.0, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine("Index va Working Tree hali ham v3 holatida (staged qoldi!)", 3.2, tu, 130, 248, { color: C.cyan });

      // 2-buyruq: git reset --mixed HEAD~
      drawCommandLine("dev $ ", "git reset --mixed HEAD~", 4.5, 6.5, 6.7, tu, 130, 285);
      drawOutputLine("Unstaged changes after reset: M file.txt", 7.0, tu, 130, 308, { color: C.yellow });
      drawOutputLine("Index v2 ga qaytdi, Working Tree da v3 saqlanib qoldi!", 7.3, tu, 130, 328, { color: '#cbd5e1' });

      // 3-buyruq: git reset --hard HEAD~
      drawCommandLine("dev $ ", "git reset --hard HEAD~", 8.5, 10.5, 10.7, tu, 130, 365);
      drawOutputLine("HEAD is now at 4367f5c (v1)", 11.0, tu, 130, 388, { color: C.red, weight: 700 });
      drawOutputLine("cat file.txt -> v1 (Working Tree ham tozalandi!)", 11.3, tu, 130, 408, { color: C.red });

      // 4-buyruq: git reflog -1
      drawCommandLine("dev $ ", "git reflog -1", 12.5, 13.8, 14.0, tu, 130, 445);
      drawOutputLine("4367f5c HEAD@{0}: reset: moving to HEAD~", 14.3, tu, 130, 468, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Resetning Uch Qadamli Algoritmi", "siz to'xtash nuqtasini aytasiz", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 195, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Qadamlar Tartibi", 1130, 290, C.purple, { size: 16, mono: false });
        text("1. HEAD ko'rsatgan branchni ko'chirish   → --soft shu yerda to'xtaydi.", 1030, 335, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("2. Indexni yangi HEADga o'xshatish      → --mixed (standart) to'xtaydi.", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("3. Working Treeni Indexga o'xshatish    → faqat --hard bo'lganda!", 1030, 395, { size: 15, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("• Tartib tasodifiy emas: commit bekor bo'ladi, so'ng add, so'ng tahrir.", 1030, 425, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 475, 790, 175, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("--hard: Xavf Zonasi!", 1135, 510, C.red, { size: 16, mono: false });
        text("• '--hard' — Gitda ma'lumotni butunlay yo'q qiladigan kamdan-kam bayroq.", 1030, 550, { size: 14, color: C.red, align: 'left', weight: 600 });
        text("• Saqlanmagan (hech qachon add qilinmagan) kodni qaytarib bo'lmaydi!", 1030, 575, { size: 14, color: C.yellow, align: 'left' });
        text("• Agar commit qilingan bo'lsa: reflog orqali tiklash imkoni saqlanadi.", 1030, 600, { size: 14, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Yo'l Bilan Reset va Unstage
  // ==========================================
  function sceneResetPaths(u, bounds, o = {}) {
    chip(3, "Yo‘l Bilan Reset va Unstage Amali", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git add file.txt && git status -s
      drawCommandLine("dev $ ", "git add file.txt && git status -s", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("M  file.txt  (Indexga tushdi, staged)", 3.0, tu, 130, 228, { color: C.green, weight: 600 });

      // 2-buyruq: git reset file.txt
      drawCommandLine("dev $ ", "git reset file.txt", 4.2, 5.8, 6.0, tu, 130, 265);
      drawOutputLine("Unstaged changes after reset: M file.txt", 6.3, tu, 130, 288, { color: C.yellow });

      // 3-buyruq: git status -s
      drawCommandLine("dev $ ", "git status -s", 7.2, 8.4, 8.6, tu, 130, 325);
      drawOutputLine(" M file.txt  # Fayl indexdan chiqarildi (unstage bo'ldi!)", 8.9, tu, 130, 348, { color: C.cyan });

      // 4-buyruq: git restore --staged file.txt
      drawCommandLine("dev $ ", "git restore --staged file.txt", 10.0, 12.0, 12.2, tu, 130, 385);
      drawOutputLine("  # Zamonaviy Gitda tavsiya etiladigan rasmiy buyruq!", 12.5, tu, 130, 408, { color: C.green, weight: 600 });

      // 5-buyruq: git reset 4367f5c -- file.txt
      drawCommandLine("dev $ ", "git reset 4367f5c -- file.txt", 13.5, 15.2, 15.4, tu, 130, 445);
      drawOutputLine("  # Fayl indexga boshqa commitdagi (v1) holatda yozildi!", 15.7, tu, 130, 468, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Yo'l Bilan Reset Mantiqi", "fayl darajasida ishlash qoidalari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Nega 1-qadam Tashlab Ketiladi?", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• HEAD — butun branch ko'rsatkichi, commitning bir bo'lagiga ko'chmaydi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Shuning uchun fayl yo'li berilsa, 1-qadam (HEAD) o'zgarmasdan qoladi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Faqat 2-qadam: ko'rsatilgan fayl HEADdan Indexga nusxalanadi.", 1030, 395, { size: 15, color: C.cyan, align: 'left' });
        text("• Amalda bu 'git add' harakatining aynan teskarisi: unstage qilish!", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Zamonaviy Standart: git restore", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• 'git reset <fayl>' va 'git restore --staged <fayl>' bir xil ishlaydi.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• Bugungi Git konsoli restore buyrug'ini tavsiya etadi.", 1030, 570, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Yo'l berilganda '--soft' va '--hard' ishlatish taqiqlanadi (fatal xato).", 1030, 595, { size: 14, color: C.red, align: 'left' });
        text("• 'git reset -p' orqali hunklarni tanlab unstage qilish mumkin.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Commitlarni Birlashtirish va Bo'lish
  // ==========================================
  function sceneSquashSplit(u, bounds, o = {}) {
    chip(4, "Amaliyot: Commitlarni Birlashtirish va Bo‘lish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log --oneline -3
      drawCommandLine("dev $ ", "git log --oneline -3", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("a15849a oops (vaqtinchalik xato tuzatish)", 2.8, tu, 130, 228, { color: C.red });
      drawOutputLine("7adac3a WIP (chala yozilgan ish)", 3.0, tu, 130, 248, { color: C.yellow });
      drawOutputLine("87dc942 file-a qo'shildi", 3.2, tu, 130, 268, { color: C.cyan });

      // 2-buyruq: git reset --soft HEAD~2
      drawCommandLine("dev $ ", "git reset --soft HEAD~2", 4.5, 6.3, 6.5, tu, 130, 305);
      drawOutputLine("HEAD is at 87dc942; Indexda barcha tahrirlar saqlandi!", 6.8, tu, 130, 328, { color: C.green, weight: 600 });

      // 3-buyruq: git commit -m "file-a va file-b to'liq qo'shildi"
      drawCommandLine("dev $ ", "git commit -m 'file-a va file-b to\\'liq'", 8.0, 10.2, 10.4, tu, 130, 365);
      drawOutputLine("[main 8735164] file-a va file-b to'liq", 10.7, tu, 130, 388, { color: C.cyan });

      // 4-buyruq: git log --oneline -2
      drawCommandLine("dev $ ", "git log --oneline -2", 11.8, 13.0, 13.2, tu, 130, 425);
      drawOutputLine("8735164 file-a va file-b to'liq  # Bitta toza commit!", 13.5, tu, 130, 448, { color: C.green, weight: 700 });
      drawOutputLine("87dc942 file-a qo'shildi", 13.7, tu, 130, 468, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Squash va Commitlarni Bo'lish", "tarixni tozalash san'ati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Reset --soft bilan Tezkor Squash", 1125, 290, C.green, { size: 16, mono: false });
        text("• Push qilinmagan mayda, 'WIP' commitlarni bittaga birlashtirish.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• 'git reset --soft HEAD~N' → HEAD N commit orqaga suriladi.", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Index va Working Tree o'zgarmaydi — 'git commit' bilan bitta commit bo'ladi.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Interaktiv rebasedan ancha tez va oson amalga oshadi!", 1030, 420, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Bitta Commitni Qismlarga Bo'lish", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• 'git reset -N HEAD^' bilan commit bekor qilinadi.", 1030, 545, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• '-N' (intent-to-add) yangi fayllarni patch rejimi uchun ochiq qoldiradi.", 1030, 570, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• 'git add -p' yordamida mantiqiy bo'laklar navbatma-navbat stage qilinadi.", 1030, 595, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Natijada bitta aralash commit o'rniga bir nechta atomar commit yoziladi.", 1030, 620, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Reset va Switch Farqlari
  // ==========================================
  function sceneResetVsSwitch(u, bounds, o = {}) {
    chip(5, "Reset va Switch Farqlari: Branch va Xavfsizlik", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (develop)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch main (xavfsiz to'xtash)
      drawCommandLine("dev $ ", "git switch main", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("error: Your local changes to file.txt would be overwritten", 2.8, tu, 130, 228, { color: C.red, weight: 600 });
      drawOutputLine("Please commit your changes or stash them before you switch.", 3.0, tu, 130, 248, { color: C.yellow });
      drawOutputLine("Aborting (Switch tahrirlarni o'chirmasdan asrab qoldi!)", 3.2, tu, 130, 268, { color: C.green });

      // 2-buyruq: git reset --hard main
      drawCommandLine("dev $ ", "git reset --hard main", 4.5, 6.3, 6.5, tu, 130, 305);
      drawOutputLine("HEAD is now at 2ebb6b9 v1", 6.8, tu, 130, 328, { color: C.red, weight: 700 });
      drawOutputLine("file.txt dagi tahrir so'roqsiz yo'q qilindi!", 7.0, tu, 130, 348, { color: C.red });

      // 3-buyruq: cat .git/HEAD
      drawCommandLine("dev $ ", "cat .git/HEAD", 8.2, 9.4, 9.6, tu, 130, 385);
      drawOutputLine("ref: refs/heads/develop  # Branch almashmadi, faqat ko'chirildi!", 9.9, tu, 130, 408, { color: C.yellow });

      // 4-buyruq: git rev-parse develop
      drawCommandLine("dev $ ", "git rev-parse develop", 11.0, 12.5, 12.7, tu, 130, 445);
      drawOutputLine("2ebb6b9329e5ff36f30332094e4b874a3a0572ec (main bilan tenglashdi)", 13.0, tu, 130, 468, { color: C.cyan });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Switch vs Reset: Asosiy Farqlar", "buyruqlarning tub mohiyati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Working Tree Xavfsizligi", 1130, 290, C.red, { size: 16, mono: false });
        text("• git switch     : Trivial merge qiladi; o'zgarish xavf ostida qolsa to'xtaydi.", 1030, 335, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• reset --hard   : Hech narsani so'ramaydi va tekshirmaydi, yo'q qiladi!", 1030, 365, { size: 15, fam: MONO, color: C.red, align: 'left', weight: 600 });
        text("• Shuning uchun boshqa branchga o'tishda doim 'git switch' ishlating.", 1030, 395, { size: 14, color: C.yellow, align: 'left' });
        text("• Branch almashtirish uchun 'reset' ishlatish mutlaqo xatodir.", 1030, 420, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("HEAD Ko'rsatkichi Qanday O'zgaradi?", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• switch <branch> : HEAD'ning o'zini yangi branchga ulaydi.", 1030, 545, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        text("• reset <commit>  : HEAD ko'rsatib turgan branchni orqaga suradi.", 1030, 570, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• Ya'ni resetda branch nomi o'zgarmaydi, branchning o'zi ko'chadi!", 1030, 595, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Shuning uchun push qilingan branchlarda reset qilish taqiqlanadi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Ilg'or Rejimlar va Qaytarish
  // ==========================================
  function sceneKeepMergeRecovery(u, bounds, o = {}) {
    chip(6, "Ilg‘or Rejimlar: --keep, --merge va Qaytarish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git reset --keep HEAD~
      drawCommandLine("dev $ ", "git reset --keep HEAD~", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("HEAD is now at 2ebb6b9 v1", 3.0, tu, 130, 228, { color: C.green });
      drawOutputLine("Lokal tahrirlar saqlandi; agar to'qnashsa amaliyot bekor bo'lardi!", 3.2, tu, 130, 248, { color: C.cyan });

      // 2-buyruq: git reset --merge
      drawCommandLine("dev $ ", "git reset --merge", 4.5, 6.0, 6.2, tu, 130, 285);
      drawOutputLine("Unmerged index tozalandi, stage qilinmagan lokal kod qoldi!", 6.5, tu, 130, 308, { color: C.yellow });

      // 3-buyruq: git reflog -2
      drawCommandLine("dev $ ", "git reflog -2", 7.8, 9.0, 9.2, tu, 130, 345);
      drawOutputLine("2ebb6b9 HEAD@{0}: reset: moving to HEAD~", 9.5, tu, 130, 368, { color: '#94a3b8' });
      drawOutputLine("7e2d1ef HEAD@{1}: commit: v3 (eski commit hash)", 9.7, tu, 130, 388, { color: C.green });

      // 4-buyruq: git reset --hard ORIG_HEAD
      drawCommandLine("dev $ ", "git reset --hard ORIG_HEAD", 11.0, 12.8, 13.0, tu, 130, 425);
      drawOutputLine("HEAD is now at 7e2d1ef v3  # Barcha bekor qilingan ishlar qaytdi!", 13.3, tu, 130, 448, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Xavfsiz Qaytarish Usullari", "Gitda commitlar reflogda yashaydi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--keep va --merge Bayroqlari", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• --keep  : '--hard' kabi ishlaydi, lekin o'zgargan fayllarga tegilganda to'xtaydi.", 1030, 335, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("  Foydasi: commitlarni tashlashda '--hard' dan ko'ra ancha xavfsiz.", 1030, 360, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• --merge : Muvaffaqiyatsiz merge yoki pull dan xavfsiz chiqish.", 1030, 390, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("  Indexdagi konfliktlarni tozalaydi, lekin unstage tahrirlarni asraydi.", 1030, 415, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("ORIG_HEAD va Reflog bilan Qutqarish", 1125, 500, C.green, { size: 16, mono: false });
        text("1. Har qanday xavfli resetdan oldin Git eski uchini ORIG_HEAD ga yozadi.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("2. 'git reset --hard ORIG_HEAD' bilan resetni 1 soniyada bekor qiling!", 1030, 575, { size: 14, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("3. Agar ORIG_HEAD yangilanib ketgan bo'lsa: 'git reflog' → HEAD@{n}.", 1030, 600, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        text("4. Commit qilingan har qanday narsa kamida 30 kun omborda saqlanadi.", 1030, 625, { size: 14, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'three_trees', fn: sceneThreeTrees },
      { id: 'reset_algorithm', fn: sceneResetAlgorithm },
      { id: 'reset_paths', fn: sceneResetPaths },
      { id: 'squash_split', fn: sceneSquashSplit },
      { id: 'reset_vs_switch', fn: sceneResetVsSwitch },
      { id: 'keep_merge_recovery', fn: sceneKeepMergeRecovery }
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
    sceneThreeTrees(10.0, TM.scenes.three_trees, { isPoster: true });
  };
})();
