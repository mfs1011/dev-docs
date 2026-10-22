// anim.js — 42-bob: reflog va ma'lumotni tiklash
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
  // 1-SAHNA: Gitda Xavfsizlik To'ri va O'chmas Obyektlar
  // ==========================================
  function sceneReflogIntro(u, bounds, o = {}) {
    chip(1, "Gitda Xavfsizlik To'ri va O'chmas Obyektlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log --oneline -5
      drawCommandLine("dev $ ", "git log --oneline -5", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("d38d46b (HEAD -> main) qidir.py biroz o'zgardi", 2.6, tu, 130, 228, { color: C.yellow });
      drawOutputLine("d46b4d7 qidir.py yaratildi", 2.8, tu, 130, 248, { color: '#e2e8f0' });
      drawOutputLine("c2fd5b1 Uchinchi commit", 3.0, tu, 130, 268, { color: '#94a3b8' });
      drawOutputLine("02e88f3 Ikkinchi commit", 3.2, tu, 130, 288, { color: '#94a3b8' });
      drawOutputLine("6aa48d5 Birinchi commit", 3.4, tu, 130, 308, { color: '#64748b' });

      // 2-buyruq: git reset --hard HEAD~2
      drawCommandLine("dev $ ", "git reset --hard HEAD~2", 4.2, 5.8, 6.0, tu, 130, 345);
      drawOutputLine("HEAD is now at c2fd5b1 Uchinchi commit", 6.3, tu, 130, 370, { color: C.red, weight: 700 });

      // 3-buyruq: git log --oneline
      drawCommandLine("dev $ ", "git log --oneline -3", 7.5, 9.0, 9.2, tu, 130, 410);
      drawOutputLine("c2fd5b1 (HEAD -> main) Uchinchi commit", 9.5, tu, 130, 435, { color: C.cyan });
      drawOutputLine("02e88f3 Ikkinchi commit", 9.7, tu, 130, 455, { color: '#94a3b8' });
      drawOutputLine("6aa48d5 Birinchi commit", 9.9, tu, 130, 475, { color: '#64748b' });
      drawOutputLine("# DIQQAT: d38d46b va d46b4d7 logda ko'rinmay qoldi!", 10.4, tu, 130, 505, { color: C.orange });

      // O'ng panel: Kontseptual kartalar
      card(980, 140, 840, 205, {
        badge: "ARXITEKTURA",
        badgeCol: C.blue,
        title: "Git Hech Qachon Shoshilmaydi",
        desc: "Git asosan faqat yangi snapshotlar qo'shadi. reset --hard bajarilganda ham eski commitlar .git/objects ichida o'chmasdan qoladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "REFLAR MEXANIZMI",
        badgeCol: C.yellow,
        title: "Faqat Ko'rsatkich Siljiydi",
        desc: "HEAD va branch ko'rsatkichlari (refs/heads/main) orqaga suriladi. Commit obyektlari zanjirdan ajralsa ham bazada mavjud.",
        p: eo(P(u, 4.0, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "XAVFSIZLIK TO'RI",
        badgeCol: C.green,
        title: "Xeshni Topish — Qutqarish Kaliti",
        desc: "Yo'qolgan commitning SHA-1 xeshini aniqlash kifoya — Git uni bir soniyada joriy ishchi daraxtga to'liq qaytarib beradi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git reflog: HEAD va Shoxlarning Harakat Jurnali
  // ==========================================
  function sceneReflogBasics(u, bounds, o = {}) {
    chip(2, "git reflog: HEAD va Shoxlarning Harakat Jurnali", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git reflog
      drawCommandLine("dev $ ", "git reflog", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("c2fd5b1 HEAD@{0}: reset: moving to HEAD~2", 2.5, tu, 130, 228, { color: C.red });
      drawOutputLine("d38d46b HEAD@{1}: commit: qidir.py biroz o'zgardi", 2.7, tu, 130, 248, { color: C.green, weight: 700 });
      drawOutputLine("d46b4d7 HEAD@{2}: commit: qidir.py yaratildi", 2.9, tu, 130, 268, { color: '#e2e8f0' });
      drawOutputLine("c2fd5b1 HEAD@{3}: commit: Uchinchi commit", 3.1, tu, 130, 288, { color: '#94a3b8' });
      drawOutputLine("02e88f3 HEAD@{4}: commit: Ikkinchi commit", 3.3, tu, 130, 308, { color: '#94a3b8' });
      drawOutputLine("6aa48d5 HEAD@{5}: commit (initial): Birinchi commit", 3.5, tu, 130, 328, { color: '#64748b' });

      // 2-buyruq: git log -g -2
      drawCommandLine("dev $ ", "git log -g -2 --oneline", 5.0, 6.8, 7.0, tu, 130, 370);
      drawOutputLine("c2fd5b1 HEAD@{0}: reset: moving to HEAD~2", 7.3, tu, 130, 395, { color: C.yellow });
      drawOutputLine("d38d46b HEAD@{1}: commit: qidir.py biroz o'zgardi", 7.5, tu, 130, 415, { color: C.cyan });

      // 3-buyruq: cat .git/logs/HEAD
      drawCommandLine("dev $ ", "tail -n 2 .git/logs/HEAD", 9.0, 11.0, 11.2, tu, 130, 455);
      drawOutputLine("... d46b4d7 d38d46b Ali Valiyev ... commit: qidir.py biroz o'zgardi", 11.5, tu, 130, 480, { color: '#94a3b8', size: 12 });
      drawOutputLine("... d38d46b c2fd5b1 Ali Valiyev ... reset: moving to HEAD~2", 11.7, tu, 130, 500, { color: '#94a3b8', size: 12 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "REFLOG ASOSLARI",
        badgeCol: C.purple,
        title: "Harakatlar Jurnali",
        desc: "git reflog (yoki git log -g) HEAD qachon, qaysi commitdan qaysi commitga siljiganini teskari tartibda saqlaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "HEAD@{0} va HEAD@{1}",
        badgeCol: C.green,
        title: "Vaqt Koordinatalari",
        desc: "HEAD@{0} — ayni paytdagi bosh ko'rsatkichi. HEAD@{1} — bir qadam oldingi, ya'ni resetdan oldin yo'qotilgan aynan shu nuqta!",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "DISK DAGI FAYLLAR",
        badgeCol: C.cyan,
        title: ".git/logs/ Papkasi",
        desc: "core.logAllRefUpdates=true sozlamasi bilan har bir harakat .git/logs/HEAD va shox fayllarining oxiriga qat'iy yozib boriladi.",
        p: eo(P(u, 8.5, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Reflog Sintaksisi: HEAD@{n} va Vaqtli Murojaatlar
  // ==========================================
  function sceneReflogSyntax(u, bounds, o = {}) {
    chip(3, "Reflog Sintaksisi: HEAD@{n} va Vaqtli Murojaatlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse main@{1} HEAD@{1} @{1}
      drawCommandLine("dev $ ", "git rev-parse HEAD@{1} @{1}", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("d38d46b300472c1d6714b5a24ec7d1087c935b0a", 3.0, tu, 130, 228, { color: C.yellow });
      drawOutputLine("d38d46b300472c1d6714b5a24ec7d1087c935b0a", 3.2, tu, 130, 248, { color: C.yellow });

      // 2-buyruq: git show --stat HEAD@{1}
      drawCommandLine("dev $ ", "git show --stat HEAD@{1}", 4.2, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("commit d38d46b300472c1d (HEAD@{1})", 6.3, tu, 130, 310, { color: C.green });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 6.5, tu, 130, 330, { color: '#94a3b8' });
      drawOutputLine(" qidir.py | 2 +-", 6.7, tu, 130, 350, { color: '#cbd5e1' });
      drawOutputLine(" 1 file changed, 1 insertion(+), 1 deletion(-)", 6.9, tu, 130, 370, { color: C.cyan });

      // 3-buyruq: git log -1 'main@{yesterday}'
      drawCommandLine("dev $ ", "git log -1 --oneline 'main@{yesterday}'", 8.0, 10.2, 10.4, tu, 130, 410);
      drawOutputLine("d46b4d7 qidir.py yaratildi", 10.7, tu, 130, 435, { color: '#e2e8f0' });

      // 4-buyruq: git rev-parse --abbrev-ref @{-1}
      drawCommandLine("dev $ ", "git rev-parse --abbrev-ref @{-1}", 11.5, 13.5, 13.7, tu, 130, 475);
      drawOutputLine("feature/qidiruv", 14.0, tu, 130, 500, { color: C.purple, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SINTAKSIS",
        badgeCol: C.cyan,
        title: "HEAD@{n} va @{n}",
        desc: "HEAD@{n} — HEAD n marta oldin qayerda bo'lgan. @{n} esa joriy faol shoxning oxirgi n-chi holatiga to'g'ridan-to'g'ri ishoradir.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "VAQTLI SO'ROV",
        badgeCol: C.orange,
        title: "shox@{sana} Shakli",
        desc: "main@{yesterday} yoki HEAD@{5.minutes.ago} — Git aynan o'sha daqiqada sizning mahalliy kompyuteringizda ref qayerda bo'lganini hisoblaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "OLDINGI SHOX",
        badgeCol: C.blue,
        title: "@{-1} — Tezkor Qaytish",
        desc: "Oxirgi checkout qilingan shox nomini bildiradi (git switch - shu sintaksisga tayanadi). Lokal va shaxsiy jurnal hisoblanadi.",
        p: eo(P(u, 8.5, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Yo'qolgan Commitlarni Qaytarish: branch va reset
  // ==========================================
  function sceneReflogRestore(u, bounds, o = {}) {
    chip(4, "Yo'qolgan Commitlarni Qaytarish: branch va reset", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-usul: git branch tiklangan HEAD@{1}
      drawCommandLine("dev $ ", "git branch tiklangan HEAD@{1}", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("# Yangi shox yo'qolgan commitga biriktirildi!", 3.3, tu, 130, 228, { color: C.green });

      // 2-buyruq: git log --oneline --graph --all -4
      drawCommandLine("dev $ ", "git log --oneline --graph --all -4", 4.0, 5.8, 6.0, tu, 130, 265);
      drawOutputLine("* d38d46b (tiklangan) qidir.py biroz o'zgardi", 6.3, tu, 130, 290, { color: C.yellow });
      drawOutputLine("* d46b4d7 qidir.py yaratildi", 6.5, tu, 130, 310, { color: '#e2e8f0' });
      drawOutputLine("* c2fd5b1 (HEAD -> main) Uchinchi commit", 6.7, tu, 130, 330, { color: C.cyan });
      drawOutputLine("* 02e88f3 Ikkinchi commit", 6.9, tu, 130, 350, { color: '#94a3b8' });

      // 2-usul: git reset --hard HEAD@{1}
      drawCommandLine("dev $ ", "git reset --hard HEAD@{1}", 7.8, 9.6, 9.8, tu, 130, 390);
      drawOutputLine("HEAD is now at d38d46b qidir.py biroz o'zgardi", 10.1, tu, 130, 415, { color: C.green, weight: 700 });
      drawOutputLine("# main shoxi yo'qotilgan barcha commitlar bilan tiklandi!", 10.4, tu, 130, 435, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "1-USUL: XAVFSIZ",
        badgeCol: C.green,
        title: "git branch <nom> HEAD@{1}",
        desc: "Joriy shoxni o'zgartirmasdan, yo'qolgan commitdan yangi shox ochiladi. O'zgarishlar ko'zdan kechirilib, kerak bo'lsa merge qilinadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "2-USUL: TEZKOR",
        badgeCol: C.blue,
        title: "git reset --hard HEAD@{1}",
        desc: "Joriy shox ko'rsatkichini darhol adashib qoldirilgan commitga qaytaradi. Barcha fayllar va indeks avvalgi holatga qaytadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "O'CHIRILGAN SHOX",
        badgeCol: C.purple,
        title: "git branch -D Qutqarish",
        desc: "Agar butun shox o'chirib yuborilgan bo'lsa ham, uning uchi reflogda 'to <nom>' tarzida ko'rinadi va commit qaytarib olinadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: git fsck --lost-found: Dangling Obyektlar
  // ==========================================
  function sceneFsckLostFound(u, bounds, o = {}) {
    chip(5, "git fsck --lost-found: Dangling Obyektlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git fsck --lost-found
      drawCommandLine("dev $ ", "git fsck --lost-found", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Checking object directories: 100% (256/256), done.", 3.0, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("Checking objects: 100% (48/48), done.", 3.2, tu, 130, 248, { color: '#94a3b8' });
      drawOutputLine("dangling commit 4b825dc642cb6eb9a060e54bf8d69288fbee4904", 3.4, tu, 130, 270, { color: C.yellow, weight: 700 });
      drawOutputLine("dangling blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391", 3.6, tu, 130, 290, { color: C.cyan });

      // 2-buyruq: git show 4b825dc
      drawCommandLine("dev $ ", "git show --stat 4b825dc", 4.8, 6.5, 6.7, tu, 130, 330);
      drawOutputLine("commit 4b825dc642cb6eb9a060e54bf8d69288fbee4904", 7.0, tu, 130, 355, { color: C.green });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 7.2, tu, 130, 375, { color: '#94a3b8' });
      drawOutputLine("    Eksperimental modul kodi", 7.4, tu, 130, 395, { color: '#e2e8f0' });
      drawOutputLine(" modul.py | 15 +++++++++++++++", 7.6, tu, 130, 415, { color: C.cyan });

      // 3-buyruq: ls .git/lost-found
      drawCommandLine("dev $ ", "ls .git/lost-found/commit/", 8.8, 10.8, 11.0, tu, 130, 455);
      drawOutputLine("4b825dc642cb6eb9a060e54bf8d69288fbee4904", 11.3, tu, 130, 480, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "OXIRGI CHORA",
        badgeCol: C.red,
        title: "Dangling Obyekt Nima?",
        desc: "Reflog tozalangan yoki yo'q bo'lgan taqdirda, hech bir ref ko'rsatmaydigan osilib qolgan snapshotlar 'dangling' deb ataladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "git fsck",
        badgeCol: C.yellow,
        title: "Baza Butunligini Tekshirish",
        desc: "git fsck obyektlar bazasining (.git/objects) to'liq zanjirini tekshiradi va bog'lanmagan commit hamda fayllarni yuzaga chiqaradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: ".git/lost-found/",
        badgeCol: C.green,
        title: "Avtomatik Ajratib Qo'yish",
        desc: "--lost-found bayrog'i topilgan barcha osilgan commit va bloblarni diskdagi .git/lost-found papkasiga qulay fayllar shaklida yozadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Reflog Umri, gc va Katta Fayllarni Tozalash
  // ==========================================
  function sceneReflogGcCleanup(u, bounds, o = {}) {
    chip(6, "Reflog Umri, gc va Katta Fayllarni Tozalash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config get gc.reflogExpire
      drawCommandLine("dev $ ", "git config --get gc.reflogExpire || echo '90 days'", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("90 days (yetib bo'ladigan refloglar muddati)", 3.5, tu, 130, 228, { color: C.green });
      drawOutputLine("30 days (gc.reflogExpireUnreachable - tashlab ketilganlar)", 3.7, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: git filter-repo
      drawCommandLine("dev $ ", "git filter-repo --path maxfiy.key --invert-paths", 4.8, 7.5, 7.7, tu, 130, 285);
      drawOutputLine("Parsed 25 commits, rewritten 25 commits", 8.0, tu, 130, 310, { color: C.yellow });
      drawOutputLine("Committed new history without 'maxfiy.key'", 8.2, tu, 130, 330, { color: '#e2e8f0' });

      // 3-buyruq: git reflog expire & prune
      drawCommandLine("dev $ ", "git reflog expire --expire=now --all", 9.2, 11.2, 11.4, tu, 130, 370);
      drawCommandLine("dev $ ", "git prune --expire=now -v", 12.0, 13.8, 14.0, tu, 130, 410);
      drawOutputLine("Pruned 14 unreachable objects (disk hajmi 45% kamaydi)", 14.3, tu, 130, 435, { color: C.cyan, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SAQLASH MUDDATI",
        badgeCol: C.blue,
        title: "Standart 90 Kunlik Kafolat",
        desc: "Git xatolikdan keyin commitlarni darhol yo'qotmaydi. Reflogda yozuv tursa, gc axlat yig'uvchisi ularga mutlaqo tegmaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "KATTA FAYLLAR VA PAROLLAR",
        badgeCol: C.red,
        title: "Tarixni Tozalash",
        desc: "Tarixga tasodifan tushgan maxfiy kalit yoki gigabaytli faylni butunlay yo'qotish uchun rasmiy tavsiya etilgan asbob: git-filter-repo.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "TO'LIQ TOZALASH",
        badgeCol: C.orange,
        title: "expire va prune",
        desc: "Reflogdagi eski ko'rsatkichlar expire qilinib, git prune --expire=now bajarilgandagina eski obyektlar diskdan jismonan o'chadi.",
        p: eo(P(u, 8.5, 0.5))
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'reflog_intro', fn: sceneReflogIntro },
      { id: 'reflog_basics', fn: sceneReflogBasics },
      { id: 'reflog_syntax', fn: sceneReflogSyntax },
      { id: 'reflog_restore', fn: sceneReflogRestore },
      { id: 'fsck_lost_found', fn: sceneFsckLostFound },
      { id: 'reflog_gc_cleanup', fn: sceneReflogGcCleanup }
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
    sceneReflogBasics(10.0, TM.scenes.reflog_basics, { isPoster: true });
  };
})();
