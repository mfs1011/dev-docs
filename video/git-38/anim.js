// anim.js — 38-bob: Stash va Clean
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
  // 1-SAHNA: Stash Asoslari va Stack Tuzilishi
  // ==========================================
  function sceneIntroStash(u, bounds, o = {}) {
    chip(1, "Git Stash Asoslari va Stack Tuzilishi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status
      drawCommandLine("dev $ ", "git status", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("On branch main", 2.7, tu, 130, 228, { color: '#cbd5e1' });
      drawOutputLine("Changes to be committed:", 2.9, tu, 130, 248, { color: C.green, weight: 600 });
      drawOutputLine("	modified:   index.html", 3.1, tu, 130, 268, { color: C.green });
      drawOutputLine("Changes not staged for commit:", 3.3, tu, 130, 288, { color: C.yellow, weight: 600 });
      drawOutputLine("	modified:   lib/app.rb", 3.5, tu, 130, 308, { color: C.yellow });

      // 2-buyruq: git stash
      drawCommandLine("dev $ ", "git stash", 4.5, 6.0, 6.2, tu, 130, 345);
      drawOutputLine("Saved working directory and index state WIP on main: bb15882", 6.5, tu, 130, 368, { color: C.cyan, weight: 600 });

      // 3-buyruq: git status
      drawCommandLine("dev $ ", "git status", 7.5, 8.8, 9.0, tu, 130, 405);
      drawOutputLine("On branch main", 9.2, tu, 130, 428, { color: '#cbd5e1' });
      drawOutputLine("nothing to commit, working tree clean", 9.4, tu, 130, 448, { color: C.green, weight: 600 });

      // 4-buyruq: git stash list
      drawCommandLine("dev $ ", "git stash list", 10.5, 12.0, 12.2, tu, 130, 485);
      drawOutputLine("stash@{0}: WIP on main: bb15882 Bosh sahifa va kutubxona", 12.5, tu, 130, 508, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Stash Stack Tuzilishi", "chala ishlarni vaqtincha yashirish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Stash Qanday Ishlaydi?", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Working tree va Index o'zgarishlarini LIFO (stack) ro'yxatiga oladi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Saqlagach, ishchi daraxt va index toza HEAD commit holatiga keladi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Keraksiz, chala 'WIP' commitlar bilan Git tarixini ifloslantirmaydi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Saqlangan o'zgarishlarni keyinroq istalgan branchga qaytarish mumkin.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("LIFO Stack Xususiyatlari", 1125, 500, C.yellow, { size: 16, mono: false });
        text("• stash@{0} — eng so'nggi saqlangan ish (har doim stack tepasida).", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Yangi stash qo'shilganda eski indekslar suriladi: @{1}, @{2}...", 1030, 570, { size: 14, color: C.yellow, align: 'left', weight: 600 });
        text("• 'git stash push -m \"xabar\"' orqali ma'noli izoh qoldiring.", 1030, 595, { size: 14, color: C.green, align: 'left' });
        text("• Argumentsiz 'git stash' amalda 'git stash push' buyrug'ining qisqartmasi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Stash Ichki Arxitekturasi: H, I, W
  // ==========================================
  function sceneStashArchitecture(u, bounds, o = {}) {
    chip(2, "Stash Ichki Arxitekturasi: H, I, W Commitlari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .git/refs/stash
      drawCommandLine("dev $ ", "cat .git/refs/stash", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("b3987d3e31f11f56a7385345493485c6159cd56f", 2.8, tu, 130, 228, { color: C.yellow });

      // 2-buyruq: git log --graph --oneline stash
      drawCommandLine("dev $ ", "git log --graph --oneline stash", 3.8, 5.8, 6.0, tu, 130, 265);
      drawOutputLine("*   b3987d3 WIP on main: bb15882 Bosh sahifa", 6.3, tu, 130, 288, { color: C.cyan, weight: 700 });
      drawOutputLine("|\\", 6.5, tu, 130, 308, { color: '#94a3b8' });
      drawOutputLine("| * 7c970c0 index on main: bb15882 Bosh sahifa", 6.7, tu, 130, 328, { color: C.green, weight: 600 });
      drawOutputLine("|/", 6.9, tu, 130, 348, { color: '#94a3b8' });
      drawOutputLine("* bb15882 Bosh sahifa va kutubxona (HEAD)", 7.1, tu, 130, 368, { color: C.yellow });

      // 3-buyruq: git show stash^2:index.html
      drawCommandLine("dev $ ", "git show stash^2:index.html", 8.2, 10.2, 10.4, tu, 130, 405);
      drawOutputLine("<h1>Salom</h1>", 10.7, tu, 130, 428, { color: '#cbd5e1' });
      drawOutputLine("+<p>Yangi paragraf</p>  # Index commitdagi holat", 11.0, tu, 130, 448, { color: C.green });

      // 4-buyruq: git show stash:lib/app.rb
      drawCommandLine("dev $ ", "git show stash:lib/app.rb", 12.0, 13.8, 14.0, tu, 130, 485);
      drawOutputLine("+def xayr; end  # Working tree commitdagi holat", 14.3, tu, 130, 508, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Ikki yoki Uch Ota-Onali Commit", "Git yangi format o'ylab topmagan", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 195, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("H, I, W Commit Arxitekturasi", 1130, 290, C.purple, { size: 16, mono: false });
        text("• H (HEAD commit)  : Stash olingan paytdagi asosiy kommit.", 1030, 335, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• I (Index commit) : Staged qilingan o'zgarishlar (otasi H).", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• W (Worktree commit): Working tree holati; 1-otasi H, 2-otasi I.", 1030, 395, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• Shuning uchun stash — bu rasman 2 ota-onali Merge commit!", 1030, 425, { size: 15, color: '#f8fafc', align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 475, 790, 175, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uchinchi Ota (-u / --include-untracked)", 1135, 510, C.cyan, { size: 16, mono: false });
        text("• Agar '-u' berilsa, untracked fayllar uchun uchinchi ota (stash^3) paydo bo'ladi.", 1030, 550, { size: 14, color: C.text, align: 'left' });
        text("• Uchinchi commit ildiz commit bo'lib, uning otasi bo'lmaydi.", 1030, 575, { size: 14, color: C.cyan, align: 'left' });
        text("• Commit sifatida saqlangani bois: git log, git diff va fsck u bilan to'liq ishlaydi.", 1030, 600, { size: 14, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Tiklash va Ko'rish: apply, --index, pop, drop
  // ==========================================
  function sceneApplyPopDrop(u, bounds, o = {}) {
    chip(3, "Tiklash va Ko‘rish: apply, --index, pop, drop", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git stash show -p
      drawCommandLine("dev $ ", "git stash show -p", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("diff --git a/index.html b/index.html", 2.8, tu, 130, 228, { color: C.cyan });
      drawOutputLine("+<p>Yangi paragraf</p>", 3.0, tu, 130, 248, { color: C.green });
      drawOutputLine("diff --git a/lib/app.rb b/lib/app.rb", 3.2, tu, 130, 268, { color: C.cyan });
      drawOutputLine("+def xayr; end", 3.4, tu, 130, 288, { color: C.green });

      // 2-buyruq: git stash apply --index
      drawCommandLine("dev $ ", "git stash apply --index", 4.5, 6.3, 6.5, tu, 130, 325);
      drawOutputLine("On branch main", 6.8, tu, 130, 348, { color: '#cbd5e1' });
      drawOutputLine("Changes to be committed:    modified: index.html", 7.0, tu, 130, 368, { color: C.green });
      drawOutputLine("Changes not staged for commit: modified: lib/app.rb", 7.2, tu, 130, 388, { color: C.yellow });

      // 3-buyruq: git stash drop
      drawCommandLine("dev $ ", "git stash drop", 8.2, 9.6, 9.8, tu, 130, 425);
      drawOutputLine("Dropped refs/stash@{0} (b3987d3e31f11f56a7385345493485c6159cd56f)", 10.1, tu, 130, 448, { color: C.red });

      // 4-buyruq: git stash pop
      drawCommandLine("dev $ ", "git stash pop", 11.2, 12.6, 12.8, tu, 130, 485);
      drawOutputLine("Auto-merging... Applied changes and dropped refs/stash@{0}", 13.1, tu, 130, 508, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Tiklash Operatsiyalari Qoidalari", "apply va pop farqlari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("apply vs pop Farqi", 1125, 290, C.green, { size: 16, mono: false });
        text("• git stash apply : Ishni qaytaradi, lekin stash ro'yxatdan o'chmaydi.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• git stash pop   : apply + drop — qo'llaydi va stackdan o'chiradi.", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• MUHIM: Agar konflikt chiqsa, pop stashni o'chirmasdan asrab qoladi!", 1030, 395, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("• git stash drop  : Ko'rsatilgan stashni qo'lda o'chiradi.", 1030, 420, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--index Kalitining Rol", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Standart apply/pop faqat working tree fayllarini tiklaydi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Natijada oldin stage qilingan fayllar 'unstaged' bo'lib qoladi.", 1030, 570, { size: 14, color: C.yellow, align: 'left' });
        text("• '--index' qo'shilsa: index holati ham aniq o'z holicha qaytadi.", 1030, 595, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Git sozlamasi: 'git config stash.index true' buni doimiy yoqadi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Ilg'or Usullar: --keep-index, --staged, -u, -p
  // ==========================================
  function sceneAdvancedStash(u, bounds, o = {}) {
    chip(4, "Ilg‘or Usullar: --keep-index, --staged, -u, -p", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git stash push --keep-index
      drawCommandLine("dev $ ", "git stash push --keep-index", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Saved WIP on main: d44a221 (index diskda qoldi, test qilish mumkin)", 3.0, tu, 130, 228, { color: C.cyan });

      // 2-buyruq: git stash push --staged -m "faqat footer"
      drawCommandLine("dev $ ", "git stash push --staged -m 'faqat footer'", 4.2, 6.2, 6.4, tu, 130, 265);
      drawOutputLine("Saved On main: faqat footer  # Unstaged o'zgarishlarga tegmadi", 6.7, tu, 130, 288, { color: C.green });

      // 3-buyruq: git stash push -u -m "todo va yangi fayllar"
      drawCommandLine("dev $ ", "git stash push -u -m 'untracked bilan'", 7.8, 9.8, 10.0, tu, 130, 325);
      drawOutputLine("Saved On main: untracked bilan (?? todo.txt ham saqlandi)", 10.3, tu, 130, 348, { color: C.yellow });

      // 4-buyruq: git stash push -p
      drawCommandLine("dev $ ", "git stash push -p", 11.2, 12.8, 13.0, tu, 130, 385);
      drawOutputLine("@@ -1,4 +1,4 @@ -1 +BIR", 13.3, tu, 130, 408, { color: C.cyan });
      drawOutputLine("(1/2) Stash this hunk [y,n,q,a,d,e,?]? y", 13.6, tu, 130, 428, { color: C.green, weight: 600 });
      drawOutputLine("  # Faqat 1-hunk yashirildi, 2-hunk ishchi papkada qoldi!", 13.9, tu, 130, 448, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Moslashuvchan Stash Bayroqlari", "nozik vaziyatlar uchun kalitlar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("--keep-index va --staged", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• --keep-index (-k) : Indexdagi o'zgarishlarni diskda qoldiradi.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("  Foydasi: commit qilishdan oldin testlarni faqat staged qismda sinash.", 1030, 360, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• --staged (-S)     : Faqat indexdagi fayllarni stashga oladi.", 1030, 390, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("  Foydasi: ish o'rtasida shoshilinch kichik hotfixni ajratib olish.", 1030, 415, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Qamrovni Belgilash: -u, -a, -p, pathspec", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• -u (--include-untracked) : Kuzatilmayotgan (untracked) fayllarni ham oladi.", 1030, 545, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• -a (--all)               : Hatto .gitignore fayllarni ham tozalab stashlaydi.", 1030, 570, { size: 14, fam: MONO, color: C.red, align: 'left' });
        text("• -p (--patch)             : Hunkma-hunk interaktiv tanlab yashirish.", 1030, 595, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("• git stash push -- <yo'l> : Faqat ko'rsatilgan faylni stashga yo'llash.", 1030, 620, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Konfliktlar, Branch va fsck bilan Tiklash
  // ==========================================
  function sceneConflictsBranch(u, bounds, o = {}) {
    chip(5, "Konfliktlar, git stash branch va fsck bilan Tiklash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git stash pop (konflikt)
      drawCommandLine("dev $ ", "git stash pop", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Auto-merging raqam.txt", 2.6, tu, 130, 228, { color: '#cbd5e1' });
      drawOutputLine("CONFLICT (content): Merge conflict in raqam.txt", 2.8, tu, 130, 248, { color: C.red, weight: 700 });
      drawOutputLine("The stash entry is kept in case you need it again.", 3.0, tu, 130, 268, { color: C.yellow });

      // 2-buyruq: git stash branch bir-tajriba
      drawCommandLine("dev $ ", "git stash branch bir-tajriba", 4.2, 6.2, 6.4, tu, 130, 305);
      drawOutputLine("Switched to a new branch 'bir-tajriba'", 6.7, tu, 130, 328, { color: C.green });
      drawOutputLine("Modified: raqam.txt (muammosiz qo'llandi!)", 6.9, tu, 130, 348, { color: C.cyan });
      drawOutputLine("Dropped refs/stash@{0} (92b3e6ba1abdeb...)", 7.1, tu, 130, 368, { color: '#94a3b8' });

      // 3-buyruq: git fsck --unreachable
      drawCommandLine("dev $ ", "git fsck --unreachable | grep commit", 8.2, 10.4, 10.6, tu, 130, 405);
      drawOutputLine("unreachable commit 92b3e6b (o'chirilgan stash commit topildi!)", 11.0, tu, 130, 428, { color: C.yellow, weight: 600 });

      // 4-buyruq: git stash store
      drawCommandLine("dev $ ", "git stash store -m 'qaytarildi' 92b3e6b", 12.0, 14.0, 14.2, tu, 130, 465);
      drawOutputLine("stash@{0}: qaytarildi  # Ro'yxatga muvaffaqiyatli tiklandi!", 14.5, tu, 130, 488, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Xavfsizlik va Favqulodda Tiklash", "Gitda ma'lumot deyarli yo'qolmaydi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Konflikt va 'git stash branch'", 1130, 290, C.red, { size: 16, mono: false });
        text("• Stash eski commitda olingan bo'lsa, 'pop' osonlikcha konflikt beradi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Yechim: 'git stash branch <yangi-branch>'", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  1. Stash yaratilgan asl HEAD commitdan yangi shoxcha ochadi.", 1030, 395, { size: 14, color: C.green, align: 'left' });
        text("  2. Asos bir xil bo'lgani uchun o'zgarishlar 100% konflictsiz qo'llanadi!", 1030, 420, { size: 14, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("O'chirilgan Stashni Qutqarish", 1125, 500, C.green, { size: 16, mono: false });
        text("• 'drop' yoki 'clear' faqat 'refs/stash' reflog yozuvini olib tashlaydi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Asl commit obyektlari esa 'gc' tozalamaguncha bazada saqlanadi.", 1030, 570, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• 'git fsck --unreachable' orqali commit hashini topish mumkin.", 1030, 595, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• 'git stash store -m xabar <hash>' uni ro'yxatga qayta joylaydi!", 1030, 620, { size: 14, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: git clean: Untracked Fayllarni Tozalash
  // ==========================================
  function sceneGitClean(u, bounds, o = {}) {
    chip(6, "git clean: Untracked Fayllarni Tozalash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git clean -n
      drawCommandLine("dev $ ", "git clean -n", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Would remove build.TMP", 2.6, tu, 130, 228, { color: C.yellow });
      drawOutputLine("Would remove todo.txt", 2.8, tu, 130, 248, { color: C.yellow });

      // 2-buyruq: git clean -n -d
      drawCommandLine("dev $ ", "git clean -n -d", 3.8, 5.2, 5.4, tu, 130, 285);
      drawOutputLine("Would remove build/", 5.6, tu, 130, 308, { color: C.yellow });
      drawOutputLine("Would remove tmp/", 5.8, tu, 130, 328, { color: C.yellow });
      drawOutputLine("Would skip repository vendor/kutubxona", 6.0, tu, 130, 348, { color: C.cyan });

      // 3-buyruq: git clean -n -d -x
      drawCommandLine("dev $ ", "git clean -n -d -x", 7.0, 8.6, 8.8, tu, 130, 385);
      drawOutputLine("Would remove debug.log  # .gitignore dagi fayllar ham!", 9.0, tu, 130, 408, { color: C.red });
      drawOutputLine("Would remove xato.log", 9.2, tu, 130, 428, { color: C.red });

      // 4-buyruq: git clean -f -d
      drawCommandLine("dev $ ", "git clean -f -d", 10.2, 11.6, 11.8, tu, 130, 465);
      drawOutputLine("Removing build.TMP", 12.0, tu, 130, 488, { color: C.green });
      drawOutputLine("Removing build/ && Removing tmp/", 12.2, tu, 130, 508, { color: C.green, weight: 600 });
      drawOutputLine("  # Working tree to'liq tozalandi!", 12.5, tu, 130, 528, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "git clean Qoidalari va Xavfi", "qaytarib bo'lmaydigan tozalash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Asosiy Bayroqlar Ma'nosi", 1125, 290, C.red, { size: 16, mono: false });
        text("• -n (--dry-run) : DOIM birinchi bajaring! Nima o'chishini ko'rsatadi.", 1030, 335, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• -f (--force)   : Majburiy kalit, usiz Git fayllarni o'chirmaydi.", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• -d             : Bo'sh yoki to'la untracked papkalarni ham qo'shadi.", 1030, 395, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• -x             : .gitignore qoidalarini e'tiborsiz qoldirib tozalaydi (-X faqat ignore).", 1030, 420, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Stash va Clean Oltin Qoidasi", 1125, 500, C.cyan, { size: 16, mono: false });
        text("1. Clean o'chirgan untracked fayllarni Git umuman qaytara olmaydi!", 1030, 545, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("2. Agar shubhangiz bo'lsa: 'git stash push --all' buyrug'idan foydalaning.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("   (Natija bir xil toza bo'ladi, lekin hamma narsa stashda xavfsiz qoladi!)", 1030, 600, { size: 14, color: '#cbd5e1', align: 'left' });
        text("3. Interaktiv tozalash zarur bo'lsa, 'git clean -i' menyusini ishlating.", 1030, 625, { size: 14, color: C.yellow, align: 'left' });
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
      { id: 'intro_stash', fn: sceneIntroStash },
      { id: 'stash_architecture', fn: sceneStashArchitecture },
      { id: 'apply_pop_drop', fn: sceneApplyPopDrop },
      { id: 'advanced_stash', fn: sceneAdvancedStash },
      { id: 'conflicts_branch', fn: sceneConflictsBranch },
      { id: 'git_clean', fn: sceneGitClean }
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
    sceneIntroStash(10.0, TM.scenes.intro_stash, { isPoster: true });
  };
})();
