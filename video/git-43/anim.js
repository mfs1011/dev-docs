// anim.js — 43-bob: Submodule, bundle va replace
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
  // 1-SAHNA: Git Submodule: Repozitoriy Ichida Repozitoriy
  // ==========================================
  function sceneSubmoduleIntro(u, bounds, o = {}) {
    chip(1, "Git Submodule: Repozitoriy Ichida Repozitoriy", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git submodule add
      drawCommandLine("dev $ ", "git submodule add https://github.com/lib/db.git vendor/db", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("Cloning into 'vendor/db'...", 3.3, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("done.", 3.6, tu, 130, 248, { color: C.green });

      // 2-buyruq: git status -s
      drawCommandLine("dev $ ", "git status -s", 4.5, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("A  .gitmodules", 6.3, tu, 130, 310, { color: C.green });
      drawOutputLine("A  vendor/db", 6.5, tu, 130, 330, { color: C.green });

      // 3-buyruq: git ls-tree HEAD
      drawCommandLine("dev $ ", "git ls-tree HEAD", 7.8, 9.2, 9.4, tu, 130, 370);
      drawOutputLine("100644 blob 3e8a1f...  .gitmodules", 9.7, tu, 130, 395, { color: '#94a3b8' });
      drawOutputLine("100644 blob a91eac...  app.py", 9.9, tu, 130, 415, { color: '#94a3b8' });
      drawOutputLine("160000 commit 76ca944 vendor/db  (gitlink!)", 10.2, tu, 130, 435, { color: C.yellow, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "SUBMODULE NIMA?",
        badgeCol: C.blue,
        title: "Mustaqil Loyiha Aloqasi",
        desc: "Superproyekt ichida boshqa repozitoriyni aniq bir commit bog'lanmasi sifatida saqlash imkonini beradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "GITLINK (160000)",
        badgeCol: C.yellow,
        title: "Fayllar Emas, Faqat Hash",
        desc: "Superproyekt daraxtida submodul 160000 commit rejimi bilan qayd etiladi. Uning ichidagi fayllar superproyektga kirmaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: ".gitmodules",
        badgeCol: C.green,
        title: "Konfiguratsiya Fayli",
        desc: "Submodulning lokal yo'li (path) va masofaviy repozitoriy URL manzili avtomatik ravishda .gitmodules da saqlanadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Submodule Boshqaruvi: update va rekursiv klonlash
  // ==========================================
  function sceneSubmoduleManage(u, bounds, o = {}) {
    chip(2, "Submodule Boshqaruvi: update va rekursiv klonlash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git clone --recurse-submodules
      drawCommandLine("dev $ ", "git clone --recurse-submodules https://repo/loyiha.git", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("Cloning into 'loyiha'...", 3.7, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("Submodule 'vendor/db' registered for path 'vendor/db'", 4.0, tu, 130, 248, { color: C.cyan });
      drawOutputLine("Cloning into 'vendor/db'... Submodule path 'vendor/db': checked out '76ca944'", 4.3, tu, 130, 268, { color: C.green });

      // 2-buyruq: cd vendor/db && git status
      drawCommandLine("dev $ ", "cd vendor/db && git status", 5.5, 7.2, 7.4, tu, 130, 310);
      drawOutputLine("HEAD detached at 76ca944", 7.7, tu, 130, 335, { color: C.red, weight: 700 });
      drawOutputLine("nothing to commit, working tree clean", 7.9, tu, 130, 355, { color: '#94a3b8' });

      // 3-buyruq: git switch main
      drawCommandLine("db $ ", "git switch main", 9.0, 10.5, 10.7, tu, 130, 395);
      drawOutputLine("Switched to branch 'main'", 11.0, tu, 130, 420, { color: C.green });
      drawOutputLine("# Endi commit qilsangiz, o'zgarishlar shoxda saqlanadi!", 11.3, tu, 130, 440, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "KLONLASH USULI",
        badgeCol: C.cyan,
        title: "--recurse-submodules",
        desc: "Oddiy git clone submodul papkalarini bo'sh qoldiradi. Barcha ichki repolarni birato'la yuklash uchun rekursiv bayroq ishlatiladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "DIQQAT: DETACHED HEAD",
        badgeCol: C.red,
        title: "Shoxdan Tashqari Holat",
        desc: "Git submodule update doim aniq commit xeshiga o'tadi, shoxga emas. Kod yozishdan oldin uning asosiy branchiga o'tish zarur.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "submodule update --init",
        badgeCol: C.purple,
        title: "Bosqichma-bosqich Yuklash",
        desc: "Klonlab bo'lingan repoda submodullarni ishga tushirish uchun: git submodule init va git submodule update bajariladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git bundle: Tarmoqsiz Repozitoriy Fayli
  // ==========================================
  function sceneBundleBasics(u, bounds, o = {}) {
    chip(3, "git bundle: Tarmoqsiz Repozitoriy Fayli", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git bundle create
      drawCommandLine("dev $ ", "git bundle create loyiha.bundle HEAD main", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("Enumerating objects: 38, done.", 3.3, tu, 130, 228, { color: '#94a3b8' });
      drawOutputLine("Writing objects: 100% (38/38), 4.2 KiB, done.", 3.5, tu, 130, 248, { color: C.green });

      // 2-buyruq: git bundle verify
      drawCommandLine("dev $ ", "git bundle verify loyiha.bundle", 4.8, 6.5, 6.7, tu, 130, 285);
      drawOutputLine("The bundle records a complete history for refs/heads/main", 7.0, tu, 130, 310, { color: C.cyan });
      drawOutputLine("loyiha.bundle is okay", 7.2, tu, 130, 330, { color: C.green, weight: 700 });

      // 3-buyruq: git clone bundle
      drawCommandLine("offline $ ", "git clone loyiha.bundle yangi-repo", 8.5, 10.5, 10.7, tu, 130, 370);
      drawOutputLine("Cloning into 'yangi-repo'...", 11.0, tu, 130, 395, { color: '#94a3b8' });
      drawOutputLine("Receiving objects: 100% (38/38), done.", 11.2, tu, 130, 415, { color: C.green });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "OFLAYN REPO",
        badgeCol: C.blue,
        title: "Bitta Faylda Butun Repo",
        desc: "git bundle obyektlar bazasi va ref ko'rsatkichlarini tarmoqsiz bitta siqilgan binar faylga joylaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "XAVFSIZLIK VA VERIFY",
        badgeCol: C.green,
        title: "git bundle verify",
        desc: "Faylning butunligini va qabul qiluvchi tomonda zarur ota commitlar mavjudligini avvaldan tekshirish mumkin.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "FLESHKA YOKI EMAIL",
        badgeCol: C.orange,
        title: "Tarmoqsiz Tashish",
        desc: "Flesh-disk yoki elektron pochta orqali olib o'tilib, undan xuddi remote kabi clone yoki fetch qilib ishlatiladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git replace: Tarixni O'zgartirmasdan Ulash
  // ==========================================
  function sceneReplaceBasics(u, bounds, o = {}) {
    chip(4, "git replace: Tarixni O'zgartirmasdan Ulash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log
      drawCommandLine("dev $ ", "git log --oneline -2", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("df35e03 (HEAD -> main) Yangi qism boshlanishi", 2.7, tu, 130, 228, { color: C.yellow });
      drawOutputLine("708ef6c Dastlabki commit", 2.9, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: git replace df35e03 3317128
      drawCommandLine("dev $ ", "git replace df35e03 3317128", 4.2, 6.2, 6.4, tu, 130, 285);
      drawOutputLine("# df35e03 ga murojaat 3317128 ga yo'naltirildi!", 6.7, tu, 130, 310, { color: C.green });

      // 3-buyruq: git log --oneline
      drawCommandLine("dev $ ", "git log --oneline -3", 7.8, 9.2, 9.4, tu, 130, 350);
      drawOutputLine("3317128 (replaced) Ulangan eski tarix commiti", 9.7, tu, 130, 375, { color: C.cyan, weight: 700 });
      drawOutputLine("a182f0c Birinchi ajdod commiti", 9.9, tu, 130, 395, { color: '#cbd5e1' });
      drawOutputLine("708ef6c Dastlabki commit", 10.1, tu, 130, 415, { color: '#64748b' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "REPLACE MEXANIZMI",
        badgeCol: C.purple,
        title: "Shaffof Almashtirish",
        desc: "Obyekt xeshlarini qayta yozmasdan turib, bir commit yoki daraxt o'rniga boshqasini dinamik ko'rsatish vositasi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "TARIXNI PAYVANDLASH",
        badgeCol: C.green,
        title: "Ikki Repo Zanjiri",
        desc: "Alohida boshlangan ikki xil repozitoriy tarixini rebase qilmasdan bitta mantiqiy zanjirga ulash imkonini beradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "XAVFSIZLIK VA SHAFFOFLIK",
        badgeCol: C.blue,
        title: "Hech Narsa Buzilmaydi",
        desc: "Git buyruqlari almashtirilgan obyektni tabiiy qabul qiladi, lekin asl obyektlar bazada butunligicha saqlanib turadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Replace Reflari va Tarix Ko'rinishi
  // ==========================================
  function sceneReplaceInspect(u, bounds, o = {}) {
    chip(5, "Replace Reflari va Tarix Ko'rinishi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ls .git/refs/replace
      drawCommandLine("dev $ ", "ls .git/refs/replace/", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("df35e03d4c98a2e1", 2.7, tu, 130, 228, { color: C.yellow });

      // 2-buyruq: git replace -l
      drawCommandLine("dev $ ", "git replace -l", 3.8, 5.0, 5.2, tu, 130, 265);
      drawOutputLine("df35e03d4c98a2e1", 5.5, tu, 130, 290, { color: C.green });

      // 3-buyruq: git --no-replace-objects log
      drawCommandLine("dev $ ", "git --no-replace-objects log --oneline -2", 6.5, 8.8, 9.0, tu, 130, 330);
      drawOutputLine("df35e03 (asl commit, replace chetlab o'tildi)", 9.3, tu, 130, 355, { color: C.red, weight: 700 });
      drawOutputLine("708ef6c Dastlabki commit", 9.5, tu, 130, 375, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "REFLAR JOYLASHUVI",
        badgeCol: C.cyan,
        title: "refs/replace/*",
        desc: "Replace yozuvlari diskdagi .git/refs/replace/ papkasida manzil commit xeshi nomi bilan saqlanadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "--no-replace-objects",
        badgeCol: C.orange,
        title: "Asl Nusxani Ko'rish",
        desc: "Zarurat tug'ilganda --no-replace-objects global bayrog'i yordamida almashtirishlarni o'chirib, asl holatni tekshirish mumkin.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "MASOFAVIY REPO",
        badgeCol: C.purple,
        title: "Maxsus Push",
        desc: "Odatiy push bu reflarni uzatmaydi. Hamkorlar bilan ulashish uchun: git push origin 'refs/replace/*' bajariladi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Ilg'or Ish Oqimlari
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Ilg'or Ish Oqimlari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git submodule status
      drawCommandLine("dev $ ", "git submodule status", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine(" 76ca944 vendor/db (v1.2.0)", 3.0, tu, 130, 228, { color: C.green });

      // 2-buyruq: git bundle verify
      drawCommandLine("dev $ ", "git bundle verify loyiha.bundle", 4.2, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("loyiha.bundle is okay", 6.5, tu, 130, 290, { color: C.cyan });

      // 3-buyruq: git status
      drawCommandLine("dev $ ", "git status -s", 7.8, 9.0, 9.2, tu, 130, 330);
      drawOutputLine("# Barcha arxitektura qismlari sinxron va toza!", 9.5, tu, 130, 355, { color: C.yellow, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "ILG'OR MODELLAR",
        badgeCol: C.blue,
        title: "Chegaralardan Tashqarida",
        desc: "Submodule, bundle va replace — Gitning standart chegaralaridan tashqaridagi eng qudratli vositalari hisoblanadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "ARXITEKTURA INTIZOMI",
        badgeCol: C.green,
        title: "Tushunib Foydalanish",
        desc: "Har bir vositaning xeshlar va reflar bilan qanday ishlashini bilish xatoliklar va ziddiyatlarning oldini oladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "BARQAROR TIZIM",
        badgeCol: C.purple,
        title: "To'liq Nazorat",
        desc: "Modulli arxitektura va oflayn imkoniyatlar orqali loyihangiz istalgan muhitda barqaror rivojlanadi.",
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
      { id: 'submodule_intro', fn: sceneSubmoduleIntro },
      { id: 'submodule_manage', fn: sceneSubmoduleManage },
      { id: 'bundle_basics', fn: sceneBundleBasics },
      { id: 'replace_basics', fn: sceneReplaceBasics },
      { id: 'replace_inspect', fn: sceneReplaceInspect },
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
    sceneSubmoduleIntro(10.0, TM.scenes.submodule_intro, { isPoster: true });
  };
})();
