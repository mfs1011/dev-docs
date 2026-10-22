// anim.js — 48-bob: Muhit o'zgaruvchilari
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
  // 1-SAHNA: Git Muhit O'zgaruvchilari: Xatti-harakatni Boshqarish
  // ==========================================
  function sceneEnvIntro(u, bounds, o = {}) {
    chip(1, "Git Muhit O'zgaruvchilari: Xatti-harakatni Boshqarish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@workstation: ~/projects (zsh)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git var -l
      drawCommandLine("dev $ ", "git var -l | head -n 4", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("GIT_COMMITTER_IDENT=Ali Valiyev <ali@dev.uz> 1774200000 +0500", 2.4, tu, 130, 228, { color: '#38bdf8' });
      drawOutputLine("GIT_AUTHOR_IDENT=Ali Valiyev <ali@dev.uz> 1774200000 +0500", 2.6, tu, 130, 248, { color: '#38bdf8' });
      drawOutputLine("GIT_EDITOR=code --wait", 2.8, tu, 130, 268, { color: '#f59e0b' });
      drawOutputLine("GIT_PAGER=less", 3.0, tu, 130, 288, { color: '#94a3b8' });

      // 2-buyruq: export GIT_PAGER="cat"
      drawCommandLine("dev $ ", "export GIT_PAGER=\"cat\"", 4.2, 5.8, 6.0, tu, 130, 325);
      drawCommandLine("dev $ ", "git log -n 1 --oneline", 6.8, 8.2, 8.4, tu, 130, 360);
      drawOutputLine("7f2b10a feat: muhit o'zgaruvchilari kiritildi", 8.7, tu, 130, 385, { color: C.green, weight: 600 });
      drawOutputLine("# Sahifalovchisiz to'g'ridan-to'g'ri terminalga chiqdi!", 9.2, tu, 130, 410, { color: '#64748b' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "PARAMETRLAR IERARXIYASI",
        badgeCol: C.blue,
        title: "Konfiguratsiyadan Ustunlik",
        desc: "Muhit o'zgaruvchilari (.git/config yoki ~/.gitconfig) fayllaridagi qiymatlarni bitta sessiya doirasida qayta belgilash kuchiga ega.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "MEROS BO'LIB O'TISH",
        badgeCol: C.purple,
        title: "Operatsion Tizim Jarayonlari",
        desc: "Eksport qilingan har qanday o'zgaruvchi terminaldan ishga tushirilgan barcha ichki buyruqlar va subshell'larga avtomatik uzatiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "USTUVORLIK TARTIBI",
        badgeCol: C.green,
        title: "1. CLI flag -> 2. ENV -> 3. Local -> 4. Global",
        desc: "Amal bajarilishida Git avval buyruq argumentlarini, so'ng GIT_* muhit o'zgaruvchilarini, keyin esa fayldagi sozlamalarni tekshiradi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Repozitoriy Joylashuvi: GIT_DIR va GIT_WORK_TREE
  // ==========================================
  function sceneRepoPaths(u, bounds, o = {}) {
    chip(2, "Repozitoriy Joylashuvi: GIT_DIR va GIT_WORK_TREE", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@server: /home/ali (bash)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: GIT_DIR va GIT_WORK_TREE o'rnatish
      drawCommandLine("ali $ ", "export GIT_DIR=/srv/git/production.git", 0.8, 2.8, 3.0, tu, 130, 205);
      drawCommandLine("ali $ ", "export GIT_WORK_TREE=/var/www/app", 3.8, 5.6, 5.8, tu, 130, 240);

      // 2-buyruq: git status istalgan joydan
      drawCommandLine("ali $ ", "git status", 6.6, 7.6, 7.8, tu, 130, 280);
      drawOutputLine("On branch production", 8.1, tu, 130, 305, { color: C.green, weight: 700 });
      drawOutputLine("Your branch is up to date with 'origin/production'.", 8.3, tu, 130, 325, { color: '#94a3b8' });
      drawOutputLine("nothing to commit, working tree clean", 8.6, tu, 130, 345, { color: '#94a3b8' });

      // 3-buyruq: tekshirish
      drawCommandLine("ali $ ", "git rev-parse --is-inside-work-tree", 9.6, 11.4, 11.6, tu, 130, 385);
      drawOutputLine("true", 11.9, tu, 130, 410, { color: '#38bdf8', weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "AJRATILGAN TUZILMA",
        badgeCol: C.blue,
        title: "GIT_DIR vs GIT_WORK_TREE",
        desc: "GIT_DIR Gitning obyektlar ombori (.git papka) qayerda joylashganini ko'rsatadi. GIT_WORK_TREE esa fayllar joylashgan ishchi maydondir.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "DOTFILES BOSHQARUVI",
        badgeCol: C.yellow,
        title: "Uy Katalogini Toza Saqlash",
        desc: "Foydalanuvchi uy papkasida keraksiz .git papkasini ko'paytirmasdan, ~/.dotfiles omborini to'g'ridan-to'g'ri boshqarish imkoniyati.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "DEPLOYMENT SKRIPTLARI",
        badgeCol: C.green,
        title: "Serverda Avtomatlashtirish",
        desc: "CI/CD serverlarida bitta markaziy repodan bir nechta ishchi papkalar (/staging, /production) ga versiyalarni mustaqil yoyish osonlashadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Mualliflik va Sanani O'zgartirish: GIT_AUTHOR va COMMITTER
  // ==========================================
  function sceneAuthorOverride(u, bounds, o = {}) {
    chip(3, "Mualliflik va Sanani O'zgartirish: GIT_AUTHOR va COMMITTER", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/app (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: inline env bilan commit qilish
      drawCommandLine("dev $ ", "GIT_AUTHOR_NAME=\"Zuxra Karimova\" \\", 0.8, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("> ", "GIT_AUTHOR_EMAIL=\"zuxra@dev.uz\" \\", 2.9, 4.5, 4.7, tu, 130, 230, { promptCol: '#64748b' });
      drawCommandLine("> ", "GIT_AUTHOR_DATE=\"2026-01-10 14:30:00\" \\", 4.9, 6.7, 6.9, tu, 130, 255, { promptCol: '#64748b' });
      drawCommandLine("> ", "git commit -m \"docs: eski arxitektura hujjati\"", 7.1, 9.2, 9.4, tu, 130, 280, { promptCol: '#64748b' });

      drawOutputLine("[main a84ef12] docs: eski arxitektura hujjati", 9.8, tu, 130, 310, { color: C.green, weight: 700 });
      drawOutputLine(" 1 file changed, 14 insertions(+)", 10.1, tu, 130, 330, { color: '#94a3b8' });

      // 2-buyruq: fuller ko'rinish
      drawCommandLine("dev $ ", "git log -1 --format=fuller", 10.9, 12.3, 12.5, tu, 130, 365);
      drawOutputLine("Author:     Zuxra Karimova <zuxra@dev.uz>", 12.8, tu, 130, 395, { color: '#38bdf8' });
      drawOutputLine("AuthorDate: Sat Jan 10 14:30:00 2026 +0500", 13.0, tu, 130, 415, { color: '#94a3b8' });
      drawOutputLine("Commit:     Ali Valiyev <ali@dev.uz>", 13.2, tu, 130, 435, { color: '#f59e0b' });
      drawOutputLine("CommitDate: Thu Oct 22 18:20:00 2026 +0500", 13.4, tu, 130, 455, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "MUALLIF vs TASDIQLOVCHI",
        badgeCol: C.blue,
        title: "Author vs Committer Farqi",
        desc: "GIT_AUTHOR_* kodni dastlab yozgan shaxsni belgilaydi. GIT_COMMITTER_* esa ushbu kodni repozitoriyga yozib tasdiqlagan odamni bildiradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "SANANI QAYTA TIKLASH",
        badgeCol: C.yellow,
        title: "GIT_AUTHOR_DATE va Xronologiya",
        desc: "O'tmishdagi yoki boshqa vcs (SVN, Mercurial) tizimlaridan kodlarni import qilganda asl sana va vaqtni aynan saqlab qolish imkoniyati.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "BIR MARTALIK TA'SIR",
        badgeCol: C.green,
        title: "Xavfsiz Prefiks Usuli",
        desc: "Buyruq oldidan o'zgaruvchilarni ko'rsatish faqat o'sha bitta jarayonga ta'sir qiladi, terminaldagi global profilga aslo zarar yetkazmaydi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Tarmoq va Xavfsizlik: GIT_SSH_COMMAND va ASKPASS
  // ==========================================
  function sceneNetworkSSH(u, bounds, o = {}) {
    chip(4, "Tarmoq va Xavfsizlik: GIT_SSH_COMMAND va ASKPASS", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@ci-runner: ~/build (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: GIT_SSH_COMMAND
      drawCommandLine("ci $ ", "export GIT_SSH_COMMAND=\"ssh -i ~/.ssh/id_deploy -o IdentitiesOnly=yes\"", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("ci $ ", "git fetch origin main", 4.2, 5.6, 5.8, tu, 130, 245);
      drawOutputLine("From github.com:company/core-repo", 6.2, tu, 130, 275, { color: '#94a3b8' });
      drawOutputLine(" * branch            main     -> FETCH_HEAD", 6.4, tu, 130, 295, { color: C.green });

      // 2-buyruq: GIT_TERMINAL_PROMPT va ASKPASS
      drawCommandLine("ci $ ", "export GIT_TERMINAL_PROMPT=0", 7.4, 9.0, 9.2, tu, 130, 335);
      drawCommandLine("ci $ ", "export GIT_ASKPASS=\"/usr/local/bin/token-helper\"", 9.8, 11.8, 12.0, tu, 130, 370);
      drawCommandLine("ci $ ", "git push origin main", 12.6, 13.8, 14.0, tu, 130, 405);
      drawOutputLine("Everything up-to-date (avtomatlashgan tokensiz sessiya)", 14.4, tu, 130, 435, { color: '#38bdf8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SSH MOSLASHUVCHANLIGI",
        badgeCol: C.blue,
        title: "Maxsus SSH Kalitlar va Portlar",
        desc: "GIT_SSH_COMMAND orqali ~/.ssh/config fayliga teginmasdan, skript ichida aniq bir Deploy Key yoki maxsus portni (-p 2222) ko'rsatish mumkin.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "HEADLESS CI/CD",
        badgeCol: C.yellow,
        title: "GIT_TERMINAL_PROMPT=0 Qoidasi",
        desc: "Agar avtomatlashtirilgan fonda Git parolni so'ramoqchi bo'lsa, server muzlab qolmasdan darhol xato bilan to'xtashi uchun prompt o'chiriladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "AVTOMATIK PAROLLAR",
        badgeCol: C.purple,
        title: "GIT_ASKPASS Va Maxfiy Yordamchilar",
        desc: "Parol yoki token kerak bo'lganda terminal interaktiv so'rov ochmasdan, ko'rsatilgan skript orqali Vault yoki Keychain'dan kalitni oladi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Nosozliklarni Izlash: GIT_TRACE va TRACE2
  // ==========================================
  function sceneDebugTrace(u, bounds, o = {}) {
    chip(5, "Nosozliklarni Izlash: GIT_TRACE va TRACE2", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/project (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: GIT_TRACE=1
      drawCommandLine("dev $ ", "GIT_TRACE=1 git status", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("22:15:01.120 trace: built-in: git status", 2.9, tu, 130, 230, { color: '#f59e0b' });
      drawOutputLine("22:15:01.122 trace: run_command: git status", 3.1, tu, 130, 250, { color: '#f59e0b' });
      drawOutputLine("On branch main — working tree clean", 3.3, tu, 130, 270, { color: '#94a3b8' });

      // 2-buyruq: GIT_TRACE_PERFORMANCE
      drawCommandLine("dev $ ", "GIT_TRACE_PERFORMANCE=1 git status", 4.5, 6.5, 6.7, tu, 130, 310);
      drawOutputLine("22:15:02.401 performance: 0.001842 s: read_index", 7.0, tu, 130, 335, { color: '#38bdf8' });
      drawOutputLine("22:15:02.404 performance: 0.003912 s: git command: status", 7.2, tu, 130, 355, { color: '#38bdf8' });

      // 3-buyruq: GIT_TRACE_PACKET
      drawCommandLine("dev $ ", "GIT_TRACE_PACKET=1 git ls-remote origin", 8.4, 10.5, 10.7, tu, 130, 395);
      drawOutputLine("packet: git< # service=git-upload-pack", 11.0, tu, 130, 420, { color: C.green });
      drawOutputLine("packet: git< 0000", 11.2, tu, 130, 440, { color: C.green });
      drawOutputLine("packet: git< 9b3f4... HEAD\\0symref=HEAD:refs/heads/main", 11.4, tu, 130, 460, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "ICHKI JARAYONLAR KO'ZGUSI",
        badgeCol: C.blue,
        title: "GIT_TRACE=1",
        desc: "Git qanday tashqi buyruqlarni chaqirayotgani, qaysi kataloglarni ochayotgani va bajarilayotgan aliaslarni to'liq ekranga chiqaradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "TEZLIK VA VAQT TAHLILI",
        badgeCol: C.yellow,
        title: "GIT_TRACE_PERFORMANCE=1",
        desc: "Har bir ichki operatsiya (indeksni o'qish, daraxtni aylanib chiqish) necha millisekund ketayotganini ko'rsatib, sekin repo sabablarini fosh qiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "PROTOKOL VA TELEMETRIYA",
        badgeCol: C.purple,
        title: "GIT_TRACE_PACKET va TRACE2",
        desc: "Server bilan uzatilayotgan har bir tarmoq paketini ko'rish va TRACE2 orqali korporativ telemetriya (JSON format) yig'ish imkoniyati.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Meros Qoidasi
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Meros Qoidasi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/projects (zsh)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: subshell bilan xavfsiz ishlash
      drawCommandLine("dev $ ", "(export GIT_DIR=/tmp/test.git && git rev-parse --git-dir)", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("/tmp/test.git", 3.7, tu, 130, 230, { color: '#38bdf8' });

      // 2-buyruq: asosiy terminal ta'sirlanmagan
      drawCommandLine("dev $ ", "git rev-parse --git-dir", 4.5, 5.8, 6.0, tu, 130, 265);
      drawOutputLine(".git", 6.3, tu, 130, 290, { color: C.green, weight: 700 });

      // 3-buyruq: unset orqali tozalash
      drawCommandLine("dev $ ", "unset GIT_DIR GIT_WORK_TREE GIT_SSH_COMMAND", 7.2, 9.5, 9.7, tu, 130, 330);
      drawCommandLine("dev $ ", "echo \"Atrof-muhit toza va xavfsiz holatda!\"", 10.3, 12.0, 12.2, tu, 130, 365);
      drawOutputLine("Atrof-muhit toza va xavfsiz holatda!", 12.5, tu, 130, 395, { color: C.green, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "MEROS BO'LISH ZIDDIYATI",
        badgeCol: C.red,
        title: "Kutilmagan Ta'sirlardan Saqlanish",
        desc: "Biror skriptda GIT_DIR eksport qilinsa va tozalanmasa, keyingi barcha boshqa Git amallari adashib o'sha repoga murojaat qiladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "SUBSHELL TAVSIYASI",
        badgeCol: C.blue,
        title: "Qavslar Ichida Izolyatsiya",
        desc: "(VAR=val git ...) ko'rinishida yozish yangi subshell ochadi va buyruq tugashi bilan o'zgaruvchilar asosiy tizimga qolmasdan o'chadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "TOZALASH GIGIYENASI",
        badgeCol: C.green,
        title: "unset Qoidasi",
        desc: "Murakkab CI yoki bash skriptlari so'ngida barcha maxsus o'zgaruvchilarni unset qilish tizim barqarorligining eng asosiy garovidir.",
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
      { id: 'env_intro', fn: sceneEnvIntro },
      { id: 'repo_paths', fn: sceneRepoPaths },
      { id: 'author_override', fn: sceneAuthorOverride },
      { id: 'network_ssh', fn: sceneNetworkSSH },
      { id: 'debug_trace', fn: sceneDebugTrace },
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
    sceneEnvIntro(8.5, TM.scenes.env_intro, { isPoster: true });
  };
})();
