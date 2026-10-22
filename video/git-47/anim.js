// anim.js — 47-bob: Hook'lar
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
  // 1-SAHNA: Git Hooklari Nima: Avtomatik Qorovullar
  // ==========================================
  function sceneHookIntro(u, bounds, o = {}) {
    chip(1, "Git Hooklari Nima: Avtomatik Qorovullar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ls .git/hooks
      drawCommandLine("dev $ ", "ls -1 .git/hooks", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("pre-commit.sample", 2.5, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("commit-msg.sample", 2.7, tu, 130, 248, { color: '#94a3b8' });
      drawOutputLine("pre-push.sample", 2.9, tu, 130, 268, { color: '#94a3b8' });
      drawOutputLine("pre-receive.sample", 3.1, tu, 130, 288, { color: '#94a3b8' });

      // 2-buyruq: nusxa olish va chmod +x
      drawCommandLine("dev $ ", "cp .git/hooks/pre-commit.sample .git/hooks/pre-commit", 4.2, 6.8, 7.0, tu, 130, 325);
      drawCommandLine("dev $ ", "chmod +x .git/hooks/pre-commit", 7.8, 9.6, 9.8, tu, 130, 365);
      drawOutputLine("# Hook bajariladigan fayl sifatida faollashtirildi!", 10.1, tu, 130, 395, { color: C.green, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "AVTOMATIK QOROVULLAR",
        badgeCol: C.blue,
        title: "Hodisalarga Bog'langan Skriptlar",
        desc: "Git commit, merge yoki push paytida avval siz belgilagan skriptdan ruxsat so'raydi. Xatoda amal to'xtatiladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "CHIQISH KODI (EXIT CODE)",
        badgeCol: C.yellow,
        title: "0 yoki 1 Qoidasi",
        desc: "Skript exit 0 bilan tugasa amal muvaffaqiyatli davom etadi. Noldan farqli chiqish kodi berilsa Git ishni rad etadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "chmod +x",
        badgeCol: C.green,
        title: "Bajarilish Huquqi",
        desc: "Hook fayli albatta bajariladigan bo'lishi shart. Istalgan skript tilida (bash, python, node) yozilishi mumkin.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Klient Hooklari: pre-commit va commit-msg
  // ==========================================
  function sceneClientHooks(u, bounds, o = {}) {
    chip(2, "Klient Hooklari: pre-commit va commit-msg", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git commit (xato)
      drawCommandLine("dev $ ", "git commit -m 'fix: xato tuzatildi'", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("Running linter & test suite...", 3.3, tu, 130, 228, { color: C.cyan });
      drawOutputLine("ERROR: Syntax error in calc.sh on line 12!", 3.6, tu, 130, 250, { color: C.red, weight: 700 });
      drawOutputLine("Commit aborted by pre-commit hook.", 3.9, tu, 130, 270, { color: C.red });

      // 2-buyruq: git commit --no-verify
      drawCommandLine("dev $ ", "git commit --no-verify -m 'WIP: shoshilinch'", 5.0, 7.5, 7.7, tu, 130, 310);
      drawOutputLine("[main 7a12b9c] WIP: shoshilinch", 8.0, tu, 130, 335, { color: C.yellow });
      drawOutputLine("# --no-verify klient hooklarini chetlab o'tadi!", 8.3, tu, 130, 355, { color: C.orange, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "pre-commit",
        badgeCol: C.red,
        title: "Commitdan Oldingi Filtr",
        desc: "Kodni linterdan o'tkazadi, testlarni tekshiradi va format xatolari bo'lsa commit yaratilishini to'xtatadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "commit-msg",
        badgeCol: C.purple,
        title: "Xabar Formati Nazorati",
        desc: "Commit xabari talabga mosligini (Jira chipta raqami, Conventional Commits qoidalari) tekshiradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "--no-verify",
        badgeCol: C.yellow,
        title: "Chetlab O'tish Imkoni",
        desc: "Dasturchi klient hooklarini --no-verify bilan o'chirishi mumkin. Shuning uchun ular majburlovchi emas!",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Hooklarni Ulashish: core.hooksPath
  // ==========================================
  function sceneHooksSharing(u, bounds, o = {}) {
    chip(3, "Hooklarni Ulashish: core.hooksPath", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: mkdir .githooks & config
      drawCommandLine("dev $ ", "mkdir -p .githooks && cp pre-commit .githooks/", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("dev $ ", "git config core.hooksPath .githooks", 4.2, 6.5, 6.7, tu, 130, 245);

      // 2-buyruq: tekshiruv
      drawCommandLine("dev $ ", "git config get core.hooksPath", 7.5, 9.2, 9.4, tu, 130, 285);
      drawOutputLine(".githooks", 9.7, tu, 130, 310, { color: C.green, weight: 700 });
      drawOutputLine("# Endi hooklar repozitoriy bilan birga commit qilinadi!", 10.0, tu, 130, 335, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "NEGA KLONLANMAYDI?",
        badgeCol: C.blue,
        title: "Xavfsizlik Himoyasi",
        desc: "Begona repozitoriyni klonlaganda uning ichidagi zararli skriptlar avtomatik ishga tushib ketmasligi uchun .git/hooks klonlanmaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "core.hooksPath",
        badgeCol: C.green,
        title: "Umumiy Papka",
        desc: "Loyiha ichida .githooks papkasini ochib, core.hooksPath sozlamasi orqali barcha jamoaga bir xil hooklarni joriy etish mumkin.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "JAMOAVIY INTIZOM",
        badgeCol: C.purple,
        title: "Bir Xil Sifat",
        desc: "Har bir dasturchi kompyuterida kod commit qilinishidan oldin bir xil standart testlar va linterlardan o'tadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Server Hooklari: pre-receive va update
  // ==========================================
  function sceneServerHooks(u, bounds, o = {}) {
    chip(4, "Server Hooklari: pre-receive va update", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git push (rad etildi)
      drawCommandLine("dev $ ", "git push origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Enumerating objects: 8, done.", 3.0, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("remote: *** SERVER REJECTED PUSH ***", 3.3, tu, 130, 250, { color: C.red, weight: 700 });
      drawOutputLine("remote: Commit 3a1f89: Signed commits required on main branch!", 3.6, tu, 130, 270, { color: C.orange });
      drawOutputLine("remote: Please sign your commit with GPG or SSH.", 3.9, tu, 130, 290, { color: '#cbd5e1' });
      drawOutputLine(" ! [remote rejected] main -> main (pre-receive hook declined)", 4.2, tu, 130, 315, { color: C.red });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SERVER HOOKLARI",
        badgeCol: C.red,
        title: "Yagona Majburiy Joy",
        desc: "pre-receive va update markaziy serverda ishlaydi. Dasturchi ularni --no-verify bilan chetlab o'ta olmaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "pre-receive",
        badgeCol: C.yellow,
        title: "Barcha Reflar Nazorati",
        desc: "Push qilinayotgan barcha shox va commitlarni tekshiradi. Birorta xatoda butun push rad etiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "remote: PREFIKSI",
        badgeCol: C.cyan,
        title: "Mijozga Tushuntirish",
        desc: "Server skriptidagi barcha echo xabarlari dasturchi terminalida remote: ko'rinishida ochiq ko'rinadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Git Konfiguratsiyasidagi Hooklar: hook.command
  // ==========================================
  function sceneConfigHooks(u, bounds, o = {}) {
    chip(5, "Git Konfiguratsiyasidagi Hooklar: hook.command", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config hook.pre-commit.command
      drawCommandLine("dev $ ", "git config --add hook.pre-commit.command 'npm run lint'", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("dev $ ", "git config --add hook.pre-commit.command 'npm test'", 4.0, 6.2, 6.4, tu, 130, 245);

      // 2-buyruq: ro'yxatni ko'rish
      drawCommandLine("dev $ ", "git config --get-all hook.pre-commit.command", 7.2, 9.4, 9.6, tu, 130, 285);
      drawOutputLine("npm run lint", 9.9, tu, 130, 310, { color: C.green });
      drawOutputLine("npm test", 10.1, tu, 130, 330, { color: C.green });
      drawOutputLine("# Git 2.54+: fayllarsiz konfiguratsiyaviy hooklar zanjiri!", 10.4, tu, 130, 360, { color: C.yellow, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "GIT 2.54+ IMKONIYATI",
        badgeCol: C.cyan,
        title: "Konfiguratsiyadagi Hooklar",
        desc: "Fayl yaratmasdan, bevosita git config hook.<nom>.command orqali tekshiruv buyruqlarini ulash imkoniyati.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "ZANJIRLI BAJARILISH",
        badgeCol: C.purple,
        title: "Bir Nechta Buyruq",
        desc: "Bitta hodisaga (masalan pre-commit) bir nechta mustaqil buyruq biriktirilishi va navbat bilan bajarilishi mumkin.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "MOSLASHUVCHANLIK",
        badgeCol: C.blue,
        title: "Tezkor Boshqaruv",
        desc: "Skript fayllarini o'zgartirmasdan, buyruq satri orqali yangi tekshiruvlarni qo'shish va olib tashlash juda oson.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Xavfsizlik Zanjiri
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Xavfsizlik Zanjiri", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: muvaffaqiyatli commit va push
      drawCommandLine("dev $ ", "git commit -m 'feat: mukammal arxitektura'", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("[pre-commit] Linter & testlar: PASS", 3.3, tu, 130, 228, { color: C.green });
      drawOutputLine("[commit-msg] Format tekshiruvi: PASS", 3.5, tu, 130, 248, { color: C.green });
      drawOutputLine("[main e812ca4] feat: mukammal arxitektura", 3.8, tu, 130, 270, { color: C.yellow });

      // 2-buyruq: git push
      drawCommandLine("dev $ ", "git push origin main", 5.0, 6.8, 7.0, tu, 130, 310);
      drawOutputLine("remote: [pre-receive] Server xavfsizlik filtri: PASS", 7.4, tu, 130, 335, { color: C.cyan, weight: 700 });
      drawOutputLine("To github.com:org/loyiha.git  main -> main", 7.7, tu, 130, 355, { color: '#94a3b8' });
      drawOutputLine("# Barcha xavfsizlik darvozalari muvaffaqiyatli o'tildi!", 8.2, tu, 130, 385, { color: C.green });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "IKKI BOSQICHLI HIMOYASI",
        badgeCol: C.blue,
        title: "Klient va Server Hamkorligi",
        desc: "Klientda erta ogohlantirish, serverda esa buzg'unchiliklar va nosoz kodlarga qarshi mustahkam to'siq.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "CI/CD KELAJAGI",
        badgeCol: C.green,
        title: "Uzluksiz Zanjir",
        desc: "Hooklar mahalliy kompyuterdan to CI/CD quvurlarigacha bo'lgan to'liq avtomatlashtirilgan sifat nazoratini ta'minlaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "ENG YAXSHI AMALIYOT",
        badgeCol: C.purple,
        title: "Madaniyat va Intizom",
        desc: "Avtomatlashgan qoidalar dasturchilarni ortiqcha qo'lda tekshiruvlardan xalos etib, ijodiy jarayonga diqqat qaratishga yo'l ochadi.",
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
      { id: 'hook_intro', fn: sceneHookIntro },
      { id: 'client_hooks', fn: sceneClientHooks },
      { id: 'hooks_sharing', fn: sceneHooksSharing },
      { id: 'server_hooks', fn: sceneServerHooks },
      { id: 'config_hooks', fn: sceneConfigHooks },
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
    sceneHookIntro(10.0, TM.scenes.hook_intro, { isPoster: true });
  };
})();
