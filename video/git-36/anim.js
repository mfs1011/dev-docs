// anim.js — 36-bob: GitHub: repo va tashkilotni boshqarish
// Realistik terminal va zamonaviy split-screen video animatsiyasi
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
  // 1-SAHNA: Repo Boshqaruvi va Maxsus Fayllar
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Repo Boshqaruvi va Maxsus Fayllar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/Projects (gh)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: gh repo create
      drawCommandLine("ali $ ", "gh repo create dev-docs --public --clone", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("✓ Created repository mfs1011/dev-docs on GitHub", 3.0, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine("Cloning into 'dev-docs'...", 3.2, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: maxsus papka va fayllarni ko'rish
      drawCommandLine("ali $ ", "cd dev-docs && ls -la .github/", 4.5, 6.5, 6.7, tu, 130, 285);
      drawOutputLine("drwxr-xr-x  .github/", 7.0, tu, 130, 308, { color: C.cyan });
      drawOutputLine("-rw-r--r--  CODEOWNERS", 7.2, tu, 130, 328, { color: C.green, weight: 600 });
      drawOutputLine("-rw-r--r--  PULL_REQUEST_TEMPLATE.md", 7.4, tu, 130, 348, { color: C.yellow });
      drawOutputLine("drwxr-xr-x  workflows/ci.yml", 7.6, tu, 130, 368, { color: '#94a3b8' });

      // 3-buyruq: README sarlavhasi
      drawCommandLine("ali $ ", "head -n 2 README.md CONTRIBUTING.md", 9.0, 11.0, 11.2, tu, 130, 405);
      drawOutputLine("==> README.md <==", 11.5, tu, 130, 428, { color: C.cyan });
      drawOutputLine("# Dev Docs — O'zbek tilidagi dasturlash hujjatlari", 11.7, tu, 130, 448, { color: '#cbd5e1' });
      drawOutputLine("==> CONTRIBUTING.md <==", 11.9, tu, 130, 468, { color: C.yellow });
      drawOutputLine("Qoidalar: alohida topic branch, atomar commit va testlar!", 12.1, tu, 130, 488, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "GitHub Repo Boshqaruvi", "hissa qo'shish madaniyati va maxsus fayllar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Loyiha Tashkil Qilish Fayllari", 1130, 290, C.cyan, { size: 16, mono: false });
        text("• README.md       : Loyihaning tashrif qog'ozi, o'rnatish va foydalanish.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• CONTRIBUTING.md : Taklif kirituvchilar uchun qat'iy yo'riqnoma.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• .github/        : Shablonlar, avtomatlashtirish va CODEOWNERS makoni.", 1030, 395, { size: 15, color: C.yellow, align: 'left' });
        text("• Collaboratorlar : Shaxsiy repo'ga yozish huquqini berish.", 1030, 420, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("gh CLI Bilan Zamonaviy Boshqaruv", 1135, 500, C.green, { size: 16, mono: false });
        text("• 'gh repo create' : Brauzersiz yangi repozitoriy ochish va klonlash.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• 'gh repo edit'   : Default branchni sozlash yoki xususiyatlarni yoqish.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• 'gh pr list'     : Ochiq pull requestlarni darhol terminalda ko'rish.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("• Barcha boshqaruv amallari skriptlarga oson integratsiya qilinadi.", 1030, 630, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: PR Yashirin Reflari va Refspek
  // ==========================================
  function scenePrReflari(u, bounds, o = {}) {
    chip(2, "PR Yashirin Reflari va Refspek", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/dev-docs (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git ls-remote
      drawCommandLine("ali $ ", "git ls-remote origin", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("c3dd16a refs/heads/main", 3.0, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("0e802d6 refs/pull/1/head   # PR branch uchi (ochiq PR)", 3.2, tu, 130, 248, { color: C.green, weight: 600 });
      drawOutputLine("fba6b13 refs/pull/1/merge  # GitHub sinov merge commiti", 3.4, tu, 130, 268, { color: C.cyan });

      // 2-buyruq: refspec sozlash
      drawCommandLine("ali $ ", "git config --add remote.origin.fetch '+refs/pull/*/head:refs/remotes/origin/pr/*'", 4.5, 7.5, 7.7, tu, 130, 305);

      // 3-buyruq: fetch qilish
      drawCommandLine("ali $ ", "git fetch origin", 8.5, 10.0, 10.2, tu, 130, 345);
      drawOutputLine(" * [new ref] refs/pull/1/head -> origin/pr/1", 10.5, tu, 130, 368, { color: C.green, weight: 600 });

      // 4-buyruq: lokal tekshirish
      drawCommandLine("ali $ ", "git switch pr/1", 11.5, 13.0, 13.2, tu, 130, 405);
      drawOutputLine("Switched to a new branch 'pr/1' tracking 'origin/pr/1'", 13.5, tu, 130, 428, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Fork remote qo'shmasdan barcha PRlarni bitta buyruq bilan sinash!", 13.8, tu, 130, 450, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "refs/pull/* Yashirin Reflari", "barcha PRlarni qulay kuzatish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Nega Yashirin Reflar Mavjud?", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• Har bir contributor uchun yangi remote qo'shish maintainerga og'ir.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• GitHub asl repoda 'refs/pull/<N>/head' maxsus ref'ini yaratib beradi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Standart git fetch faqat 'refs/heads/*' ni oladi, bular esa chetda qoladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• 'refs/pull/*' faqat o'qish uchun: unga to'g'ridan-to'g'ri push taqiqlangan.", 1030, 420, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Refspek Sehri: Avtomatik PR Kuzatuvi", 1145, 500, C.cyan, { size: 16, mono: false });
        text("• '+refs/pull/*/head:refs/remotes/origin/pr/*' qatorini configga qo'shing.", 1030, 545, { size: 14, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Shunda har safar 'git fetch' qilinganda hamma ochiq PRlar keladi!", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• 'gh pr checkout <N>' esa buni bitta tezkor buyruqda amalga oshiradi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Kodni lokal ishga tushirib sinash imkoniyati 100% ta'minlanadi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Himoyalangan Branch va Rulesetlar
  // ==========================================
  function sceneHimoyalanganBranch(u, bounds, o = {}) {
    chip(3, "Himoyalangan Branch va Rulesetlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/dev-docs (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: to'g'ridan-to'g'ri push urinishi
      drawCommandLine("ali $ ", "git push --force origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("remote: error: denying non-fast-forward refs/heads/main", 3.0, tu, 130, 228, { color: C.red, weight: 700 });
      drawOutputLine("To github.com:mfs1011/dev-docs.git", 3.2, tu, 130, 248, { color: '#94a3b8' });
      drawOutputLine(" ! [remote rejected] main -> main (protected branch hook)", 3.4, tu, 130, 268, { color: C.red });

      // 2-buyruq: gh ruleset list
      drawCommandLine("ali $ ", "gh ruleset list", 4.5, 6.0, 6.2, tu, 130, 305);
      drawOutputLine("ID    NAME                          STATUS   TARGET", 6.5, tu, 130, 328, { color: C.cyan, weight: 600 });
      drawOutputLine("1042  Main Branch Strict Ruleset    active   default branch", 6.7, tu, 130, 348, { color: C.green, weight: 600 });

      // 3-buyruq: gh ruleset check
      drawCommandLine("ali $ ", "gh ruleset check main", 7.8, 9.5, 9.7, tu, 130, 385);
      drawOutputLine("✓ Require pull request before merging (1 approval)", 10.0, tu, 130, 408, { color: C.green });
      drawOutputLine("✓ Require status checks to pass (CI tests, lint)", 10.2, tu, 130, 428, { color: C.green });
      drawOutputLine("✓ Block force pushes (enabled)", 10.4, tu, 130, 448, { color: C.green });
      drawOutputLine("✓ Restrict branch deletions (enabled)", 10.6, tu, 130, 468, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "Himoyalangan Branch va Rulesetlar", "asosiy tarmoq daxlsizligi kafolati", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Server Darajasidagi Himoya", 1125, 290, C.red, { size: 16, mono: false });
        text("• Git taqsimlangan: har kim lokalda xohlagan commitni o'chira oladi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Shu sababli himoyani faqat umumiy server (GitHub) majburlay oladi.", 1030, 365, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• 'receive.denyNonFastForwards' force push qilib tarixni buzishni to'sadi.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• 'receive.denyDeletes' asosiy tarmoqni o'chirishni taqiqlaydi.", 1030, 420, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Zamonaviy Ruleset Qoidalari", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Require a pull request: Hech kim to'g'ridan-to'g'ri yozolmaydi.", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Status checks: CI testlari yashil bo'lmaguncha merge tugmasi bloklanadi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Rulesetlar qatlamlanadi va bir nechta tarmoqlarga oson tarqaladi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• 'Evaluate' rejimi qoidani yoqishdan oldin ta'sirini tekshirishga beradi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: CODEOWNERS va Avtomatik Review
  // ==========================================
  function sceneCodeowners(u, bounds, o = {}) {
    chip(4, "CODEOWNERS va Avtomatik Review", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/dev-docs (.github)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: CODEOWNERS ko'rish
      drawCommandLine("ali $ ", "cat .github/CODEOWNERS", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("# Butun repo uchun umumiy egalar", 3.0, tu, 130, 228, { color: C.mute });
      drawOutputLine("*                   @core-team", 3.2, tu, 130, 248, { color: C.cyan, weight: 600 });
      drawOutputLine("*.js                @frontend-leads", 3.4, tu, 130, 268, { color: C.green, weight: 600 });
      drawOutputLine("/infra/             @devops-team", 3.6, tu, 130, 288, { color: C.yellow, weight: 600 });
      drawOutputLine("/.github/CODEOWNERS @security-admin", 3.8, tu, 130, 308, { color: C.red, weight: 700 });

      // 2-buyruq: gh pr view review so'rovlari
      drawCommandLine("ali $ ", "gh pr view 42 --json reviewRequests", 5.5, 8.0, 8.2, tu, 130, 345);
      drawOutputLine('{"reviewRequests": ["devops-team", "security-admin"]}', 8.5, tu, 130, 368, { color: C.green, weight: 600 });
      drawOutputLine("  # infra fayllari o'zgargani uchun devopsga avtomatik so'rov ketdi!", 8.8, tu, 130, 390, { color: C.mute });

      // 3-buyruq: tekshirish
      drawCommandLine("ali $ ", "gh pr review 42 --approve", 10.5, 12.0, 12.2, tu, 130, 425);
      drawOutputLine("✓ Approved by @devops-team (Code Owner requirement met)", 12.5, tu, 130, 448, { color: C.cyan, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "CODEOWNERS Mas'uliyat Tizimi", "avtomatik ekspertiza va nazorat", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("CODEOWNERS Fayli Qoidalari", 1130, 290, C.purple, { size: 16, mono: false });
        text("• Joylashuvi: .github/CODEOWNERS, repo ildizi yoki docs/ papkasi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Har qator: <andoza> <mas'ullar...> shaklida belgilanadi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Oltin Qoida: Oxirgi mos kelgan qator yutadi (aniq yo'llar pastda).", 1030, 395, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• CODEOWNERS faylining o'ziga ham albatta ega qo'yish shart!", 1030, 420, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Avtomatik Review va Majburiy Tasdiq", 1145, 500, C.green, { size: 16, mono: false });
        text("• PR tegishli fayllarni o'zgartirsa, egalarga avtomatik xabar boradi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• 'Require review from Code Owners' yoqilsa, ularning tasdig'i shart bo'ladi.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Begona kod infratuzilma yoki nozik joylarga tasdiqsiz kira olmaydi.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("• Mas'ullar repo'da yozish (write) huquqiga ega bo'lishi lozim.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Tashkilot, Jamoalar va Rollar
  // ==========================================
  function sceneTashkilotVaJamoalar(u, bounds, o = {}) {
    chip(5, "Tashkilot, Jamoalar va Rollar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@admin: ~/dev-docs (org)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: jamoalar ro'yxati
      drawCommandLine("ali $ ", "gh api orgs/dev-docs-org/teams --jq '.[].name'", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Frontend Engineers", 3.0, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine("Backend Platform", 3.2, tu, 130, 248, { color: C.cyan, weight: 600 });
      drawOutputLine("Security & Infrastructure", 3.4, tu, 130, 268, { color: C.yellow, weight: 600 });

      // 2-buyruq: audit log
      drawCommandLine("ali $ ", "gh api orgs/dev-docs-org/audit-log --jq '.[0].action'", 4.5, 6.5, 6.7, tu, 130, 305);
      drawOutputLine("team.add_repository_permission (action: write, repo: dev-docs)", 7.0, tu, 130, 328, { color: C.green });

      // 3-buyruq: repo sozlamalari
      drawCommandLine("ali $ ", "gh repo edit --enable-squash-merge --delete-branch-on-merge", 8.0, 10.5, 10.7, tu, 130, 365);
      drawOutputLine("✓ Repository settings successfully updated on GitHub.", 11.0, tu, 130, 388, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Merge bo'lgan topic branchlar avtomatik o'chiriladi!", 11.3, tu, 130, 410, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Tashkilot (Organization) Boshqaruvi", "jamoalar va granular ruxsat rollari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("5 Ta Repozitoriy Ruxsat Rollari", 1135, 290, C.green, { size: 16, mono: false });
        text("• Read     : Faqat ko'rish, klonlash va issue ochish huquqi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Triage   : Labellar qo'yish va issuelarni tartibga solish.", 1030, 365, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Write    : Push qilish, PR merge qilish va relizlar chiqarish.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Maintain : Sozlamalarni boshqarish; Admin: To'liq boshqaruv.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Jamoalar (@org/team) va Xavfsizlik Auditi", 1145, 500, C.cyan, { size: 16, mono: false });
        text("• Odamlarga yakka-yakka emas, balki jamoalar orqali huquq beriladi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• '@org/team' orqali butun jamoaga bitta izoh bilan xabar yuboriladi.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Audit log: kim, qachon va qaysi harakatni bajarganini aniq ko'rsatadi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Tashqi pudratchilar Outside Collaborator sifatida cheklanadi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Webhook, REST API va Xulosa
  // ==========================================
  function sceneAvtomatlashtirishVaXulosa(u, bounds, o = {}) {
    chip(6, "Webhook, REST API va Xulosa", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/dev-docs (api)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: webhooklar
      drawCommandLine("ali $ ", "gh api repos/mfs1011/dev-docs/hooks --jq '.[0].config.url'", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("https://ci.example.com/github-webhook (HMAC-SHA256 himoyalangan)", 3.0, tu, 130, 228, { color: C.green, weight: 600 });

      // 2-buyruq: gh pr merge
      drawCommandLine("ali $ ", "gh pr merge 42 --squash --delete-branch", 4.0, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("✓ Squashed and merged pull request #42", 6.5, tu, 130, 288, { color: C.green, weight: 700 });
      drawOutputLine("✓ Deleted branch fix-typo on origin", 6.7, tu, 130, 308, { color: C.cyan });

      // 3-buyruq: holatni tekshirish
      drawCommandLine("ali $ ", "gh pr list --state open", 8.0, 9.5, 9.7, tu, 130, 345);
      drawOutputLine("No open pull requests in mfs1011/dev-docs (Hammasi toza va xavfsiz!)", 10.0, tu, 130, 368, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Maintainer Boshqaruv Xulosasi", "muhandislik intizomi va xavfsizlik", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Avtomatlashtirish Asboblari", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Webhook  : Push yoki PR paytida tashqi CI serverlarga tezkor JSON.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Xavfsizlik: X-Hub-Signature-256 bilan HMAC-SHA256 orqali tekshirish.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• REST API : 'gh api' orqali har qanday loyiha harakatini avtomatlash.", 1030, 395, { size: 15, color: C.yellow, align: 'left' });
        text("• Avtomatik branch tozalash: 'Delete branch on merge' bilan tozalik.", 1030, 420, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Loyiha Boshqaruvining 4 Ustuni", 1130, 500, C.green, { size: 16, mono: false });
        text("1. Asosiy tarmoqni qat'iy Ruleset orqali himoyalang (to'g'ridan-to'g'ri push yo'q).", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("2. CODEOWNERS orqali muhim yo'nalishlarga aniq egalar biriktiring.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Jamoalar tuzib, ruxsat rollarini markazlashgan holda bering.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("4. CI status checklari barcha testlar o'tganini kafolatlasin.", 1030, 630, { size: 15, color: C.text, align: 'left' });
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
      { id: 'intro', fn: sceneIntro },
      { id: 'pr_reflari', fn: scenePrReflari },
      { id: 'himoyalangan_branch', fn: sceneHimoyalanganBranch },
      { id: 'codeowners', fn: sceneCodeowners },
      { id: 'tashkilot_va_jamoalar', fn: sceneTashkilotVaJamoalar },
      { id: 'avtomatlashtirish_va_xulosa', fn: sceneAvtomatlashtirishVaXulosa }
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
