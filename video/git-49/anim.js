// anim.js — 49-bob: Worktree va katta repo'lar
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
  // 1-SAHNA: Git Worktree: Bir Repozitoriy va Bir Nechta Ishchi Maydon
  // ==========================================
  function sceneWorktreeIntro(u, bounds, o = {}) {
    chip(1, "Git Worktree: Bir Repozitoriy va Bir Nechta Ishchi Maydon", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/projects/core (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status
      drawCommandLine("core $ ", "git status -s", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine(" M src/router.ts", 2.5, tu, 130, 228, { color: '#f59e0b' });
      drawOutputLine(" M packages/api/auth.ts", 2.7, tu, 130, 248, { color: '#f59e0b' });
      drawOutputLine("?? draft-refactor.txt", 2.9, tu, 130, 268, { color: '#ef4444' });

      // 2-buyruq: muammo va yechim
      drawCommandLine("core $ ", "# Shoshilinch hotfix kerak! Stash xavflimi? Worktree osonroq:", 3.8, 6.2, 6.4, tu, 130, 305, { cmdCol: '#64748b' });
      drawCommandLine("core $ ", "git branch -v", 7.0, 8.2, 8.4, tu, 130, 340);
      drawOutputLine("* main 4f981ab [ahead 1] Oxirgi versiya", 8.8, tu, 130, 365, { color: C.green, weight: 600 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "MUAMMO VA EHTIYOJ",
        badgeCol: C.red,
        title: "Tugallanmagan Ish O'rtasida Shoshilinch Vazifa",
        desc: "Katta refactoring paytida shoshilinch production xatosi chiqsa, git stash qilish yoki boshqa klon yuklash noqulaylik va vaqt yo'qotishga olib keladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "YECHIM: WORKTREE",
        badgeCol: C.blue,
        title: "Bitta .git — Cheksiz Ishchi Papkalar",
        desc: "Git butun repozitoriyni qayta yuklamaydi. Obyektlar va branchlar umumiy bo'lib qoladi, har bir papkada esa boshqa branch to'liq ochiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "DISKDAGI TEJAMKORLIK",
        badgeCol: C.green,
        title: "Gigabaytlarni Takrorlamaslik",
        desc: "Qayta klonlashdan farqli ravishda .git/objects papkasi qayta ko'chirilmaydi, barcha branchlar bitta disk joyidan unumli foydalanadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Worktree Yaratish va Boshqarish: add, list va remove
  // ==========================================
  function sceneWorktreeOps(u, bounds, o = {}) {
    chip(2, "Worktree Yaratish va Boshqarish: add, list va remove", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/projects/core (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git worktree add
      drawCommandLine("core $ ", "git worktree add ../hotfix-login -b hotfix/auth main", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("Preparing worktree (new branch 'hotfix/auth')", 3.8, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("HEAD is now at 4f981ab Oxirgi versiya", 4.1, tu, 130, 250, { color: C.green, weight: 600 });

      // 2-buyruq: git worktree list
      drawCommandLine("core $ ", "git worktree list", 5.2, 6.6, 6.8, tu, 130, 285);
      drawOutputLine("/Users/dev/projects/core          4f981ab [main]", 7.2, tu, 130, 310, { color: '#38bdf8' });
      drawOutputLine("/Users/dev/projects/hotfix-login  4f981ab [hotfix/auth]", 7.5, tu, 130, 330, { color: '#f59e0b' });

      // 3-buyruq: git worktree remove
      drawCommandLine("core $ ", "git worktree remove ../hotfix-login", 8.8, 10.6, 10.8, tu, 130, 365);
      drawOutputLine("# Worktree tozalandi va o'chirildi", 11.2, tu, 130, 390, { color: '#64748b' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "BUYRUQ SINTAKSISI",
        badgeCol: C.blue,
        title: "git worktree add <yo'l> <branch>",
        desc: "Keltirilgan yo'lda yangi ishchi katalog ochilib, ko'rsatilgan commit yoki yangi branch bir zumda checkout qilib beriladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "RO'YXAT VA NAZORAT",
        badgeCol: C.purple,
        title: "git worktree list",
        desc: "Loyihada nechta parallel papkalar ochiq ekanini va ularning har biri qaysi commit hamda branchga ulanganini aniq ko'rsatadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "XAVFSIZ TOZALASH",
        badgeCol: C.green,
        title: "git worktree remove",
        desc: "Vazifa bajarilib pull request ochilgach, worktree'ni bitta buyruq bilan xavfsiz yo'qotish mumkin. Saqlanmagan o'zgarishlar bo'lsa ogohlantiradi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Xavfsizlik Qoidasi va Ichki Tuzilma
  // ==========================================
  function sceneBranchSafety(u, bounds, o = {}) {
    chip(3, "Xavfsizlik Qoidasi va Ichki Tuzilma", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/projects/hotfix-login (hotfix/auth)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: bitta branchni qayta ochishga urinish
      drawCommandLine("hotfix $ ", "git checkout main", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("fatal: 'main' is already checked out at '/projects/core'", 2.8, tu, 130, 235, { color: C.red, weight: 700 });

      // 2-buyruq: ichki .git tuzilishini tekshirish
      drawCommandLine("hotfix $ ", "ls -la .git", 4.2, 5.2, 5.4, tu, 130, 275);
      drawOutputLine("-rw-r--r-- 1 dev staff 52 Oct 22 .git", 5.8, tu, 130, 300, { color: '#94a3b8' });

      // 3-buyruq: cat .git
      drawCommandLine("hotfix $ ", "cat .git", 6.8, 7.6, 7.8, tu, 130, 335);
      drawOutputLine("gitdir: /Users/dev/projects/core/.git/worktrees/hotfix-login", 8.2, tu, 130, 360, { color: '#38bdf8', weight: 600 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "QAT'IY QOIDA",
        badgeCol: C.red,
        title: "Bitta Branch — Faqat Bitta Joyda",
        desc: "Bir branchni ikkita alohida worktree'da ochish mumkin emas. Aks holda commit qilinganda ikkinchi papkaning indexi chalg'ib qoladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "ICHKI TUZILMA",
        badgeCol: C.blue,
        title: ".git Papka Emas, Balki Fayl!",
        desc: "Bog'langan worktree ichidagi .git katalog emas, balki asosiy ombordagi .git/worktrees/<nom> papkasiga ishora qiluvchi yo'naltiruvchidir.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "MUSTAQIL VA UMUMIY RESURSLAR",
        badgeCol: C.yellow,
        title: "HEAD va Index Alohida, Obyektlar Birga",
        desc: "Har bir worktree o'zining mustaqil HEAD ko'rsatkichi va indeksiga ega. Lekin commit qilingan har bir yangi obyekt darhol umumiy omborga tushadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Sparse-Checkout: Faqat Kerakli Papkalarni Ochish
  // ==========================================
  function sceneSparseCheckout(u, bounds, o = {}) {
    chip(4, "Sparse-Checkout: Faqat Kerakli Papkalarni Ochish", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@workstation: ~/monorepo (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git sparse-checkout init --cone
      drawCommandLine("mono $ ", "git sparse-checkout init --cone", 0.8, 2.8, 3.0, tu, 130, 205);
      drawCommandLine("mono $ ", "git sparse-checkout set packages/frontend packages/shared", 3.8, 6.4, 6.6, tu, 130, 240);

      // 2-buyruq: ls -1
      drawCommandLine("mono $ ", "ls -1", 7.4, 8.2, 8.4, tu, 130, 275);
      drawOutputLine("packages/", 8.8, tu, 130, 300, { color: '#38bdf8' });
      drawOutputLine("package.json", 9.0, tu, 130, 320, { color: '#94a3b8' });
      drawOutputLine("pnpm-workspace.yaml", 9.2, tu, 130, 340, { color: '#94a3b8' });
      drawOutputLine("# Backend va mobil ilovalar fayllari diskka ochilmadi!", 9.6, tu, 130, 365, { color: C.green, weight: 600 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SELEKTIV OCHISH",
        badgeCol: C.blue,
        title: "Katta Loyihalarda Tejamkorlik",
        desc: "Yuz minglab faylli ulkan monorepolarda barcha fayllarni ochish diskni to'ldiradi va IDE'larni sekinlashtiradi. Sparse-checkout faqat kerakli papkalarni chiqaradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "CONE (KONUS) REJIMI",
        badgeCol: C.yellow,
        title: "--cone bilan Yuqori Samaradorlik",
        desc: "Kataloglar bo'yicha cheklovlar Git ichki algoritmlariga tezkor ishlash imkonini beradi. Har bir faylni glob bilan tekshirish o'rniga katalog darajasida saralaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "STATUS VA DIFF TEZLIGI",
        badgeCol: C.green,
        title: "O'nlab Barobar Tezkor Tekshiruv",
        desc: "Git status va checkout buyruqlari ochilmagan yuz minglab fayllarni aylanib chiqishga vaqt sarflamaydi, amallar soniyalarda yakunlanadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Katta Omborlar: Partial Clone va Skalar
  // ==========================================
  function scenePartialClone(u, bounds, o = {}) {
    chip(5, "Katta Omborlar: Partial Clone va Skalar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@workstation: ~/gigantic-repo (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git clone --filter=blob:none
      drawCommandLine("dev $ ", "git clone --filter=blob:none https://git.corp/huge.git", 0.8, 3.4, 3.6, tu, 130, 205);
      drawOutputLine("Receiving objects: 100% (faol fayllarsiz qisqa klon)", 4.0, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("Yuklangan hajm: 240 MB (asl hajmi: 45 GB)", 4.3, tu, 130, 250, { color: '#38bdf8' });

      // 2-buyruq: scalar register
      drawCommandLine("dev $ ", "scalar register", 5.5, 7.0, 7.2, tu, 130, 285);
      drawOutputLine("Registered current repository for background maintenance", 7.6, tu, 130, 310, { color: '#94a3b8' });

      // 3-buyruq: maintenance holati
      drawCommandLine("dev $ ", "git maintenance run --task=commit-graph", 8.8, 11.2, 11.4, tu, 130, 345);
      drawOutputLine("commit-graph: generation data v2 yangilandi", 11.8, tu, 130, 370, { color: C.green });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "TALAB BO'YICHA YUKLASH",
        badgeCol: C.blue,
        title: "Partial Clone: --filter=blob:none",
        desc: "Klonlashda faqat commitlar va daraxtlar olinadi. Tarixdagi og'ir binar yoki eski fayl bloblari faqat checkout qilingandagina yuklab olinadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "SCALAR DASTURI",
        badgeCol: C.purple,
        title: "Microsoft va Git Monorepo Vositalari",
        desc: "Scalar partial clone, sparse-checkout, FSMonitor va fondagi maintenance xizmatlarini bitta qulay qobiq ostida birlashtiradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "FONDAGI PARVARISH",
        badgeCol: C.green,
        title: "git maintenance",
        desc: "Cron yoki tizim xizmatlari orqali pack-file'lar va commit-graph indekslari avtomatik yangilanib, buyruqlar sekinlashuviga yo'l qo'ymaydi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Ish Oqimi Tavsiyalari
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Ish Oqimi Tavsiyalari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/projects/core (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git worktree prune
      drawCommandLine("core $ ", "git worktree prune -v", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Pruning worktrees: 0 qoldiq tozalandi", 3.1, tu, 130, 230, { color: C.green });

      // 2-buyruq: yakuniy holat
      drawCommandLine("core $ ", "git worktree list", 4.2, 5.5, 5.7, tu, 130, 265);
      drawOutputLine("/Users/dev/projects/core  4f981ab [main]", 6.1, tu, 130, 290, { color: '#38bdf8' });

      drawCommandLine("core $ ", "echo \"Katta loyihalar bilan ishlashga to'liq tayyormiz!\"", 7.2, 9.6, 9.8, tu, 130, 330);
      drawOutputLine("Katta loyihalar bilan ishlashga to'liq tayyormiz!", 10.2, tu, 130, 360, { color: C.green, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "TARTIB VA TOZALIK",
        badgeCol: C.blue,
        title: "git worktree prune",
        desc: "Diskdan o'chirilgan worktree papkalari bo'lsa, prune buyrug'i .git/worktrees ichidagi yetim yozuvlarni tozalab omborni ixcham saqlaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "QULAY MULTI-TASKING",
        badgeCol: C.green,
        title: "Parallel Ishlash Imkoniyati",
        desc: "Worktree yordamida context switch qilish qulaylashadi: asosiy branchda uzoq test yoki build ketayotganda parallel xatolarni tuzatish oson.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "GIGANT REPOLAR KALITI",
        badgeCol: C.purple,
        title: "Zamonaviy Muhandislik Madaniyati",
        desc: "Partial clone, sparse-checkout va scalar vositalari zamonaviy kompaniyalarning ulkan arxitekturasini qulay boshqarish poydevoridir.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'worktree_intro', fn: sceneWorktreeIntro },
      { id: 'worktree_ops', fn: sceneWorktreeOps },
      { id: 'branch_safety', fn: sceneBranchSafety },
      { id: 'sparse_checkout', fn: sceneSparseCheckout },
      { id: 'partial_clone', fn: scenePartialClone },
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

  window.draw = window.renderFrame;
  window.render = window.renderFrame;

  // Poster uchun ko'rgazmali kadr
  window.renderPoster = function () {
    bg();
    sceneWorktreeIntro(8.5, TM.scenes.worktree_intro, { isPoster: true });
  };
})();
