// anim.js — 50-bob: Buyruqlar xaritasi va checklist
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
  // 1-SAHNA: Git Mental Modeli: Uch Hudud va Obyektlar
  // ==========================================
  function sceneModelMental(u, bounds, o = {}) {
    chip(1, "Git Mental Modeli: Uch Hudud va Obyektlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-core (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status va uch hudud
      drawCommandLine("git $ ", "git status -s", 0.8, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("M  src/index.ts       # Index (Staged)", 2.5, tu, 130, 228, { color: C.green });
      drawOutputLine(" M README.md          # Working Tree (Unstaged)", 2.7, tu, 130, 248, { color: C.yellow });

      // 2-buyruq: cat-file obyekt tekshiruvi
      drawCommandLine("git $ ", "git cat-file -p HEAD", 3.8, 5.2, 5.4, tu, 130, 285);
      drawOutputLine("tree 8a34b2...         # Loyiha tuzilishi", 5.8, tu, 130, 310, { color: '#38bdf8' });
      drawOutputLine("parent 1f49c0...       # Ota commit xeshi", 6.0, tu, 130, 330, { color: '#94a3b8' });
      drawOutputLine("author Dev <dev@uz>    # O'zgarmas ma'lumot", 6.2, tu, 130, 350, { color: '#94a3b8' });

      drawCommandLine("git $ ", "# Obyektlar o'zgarmas! Har bir xesh kriptografik muhr:", 7.2, 9.6, 9.8, tu, 130, 385, { cmdCol: '#64748b' });
      drawOutputLine("commit -> tree -> blob (immutable DAG arxitekturasi)", 10.2, tu, 130, 415, { color: C.green, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "UCH ASOSIY HUDUD",
        badgeCol: C.blue,
        title: "Working Tree -> Index -> Repository",
        desc: "Fayllar uch bosqichdan o'tadi: diskdagi ishchi o'zgarishlar, navbatdagi commit tayyorgarligi (index) va .git ichidagi abadiy saqlanuvchi tarix.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "O'ZGARMAYDIGAN MA'LUMOT",
        badgeCol: C.purple,
        title: "Kriptografik Obyektlar (DAG)",
        desc: "Blob, Tree, Commit va Tag hech qachon tahrirlanmaydi. Tarixni o'zgartirish deb atalgan barcha amallar aslida yangi obyektlar zanjirini quradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "REF'LAR — KO'RSATKICHLAR",
        badgeCol: C.green,
        title: "Nomlar Faqat Ishoradir",
        desc: "Branch va teglar og'ir nusxa emas, balki atigi 40 baytlik commit xeshini saqlovchi yengil ko'rsatkichlardir. Ularni ko'chirish soniyadan tez kechadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Buyruqlarni Tahlil Qilish: To'rtta Oltin Savol
  // ==========================================
  function sceneFourQuestions(u, bounds, o = {}) {
    chip(2, "Buyruqlarni Tahlil Qilish: To'rtta Oltin Savol", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-core (main)',
        p: kBox
      });

      const tu = u;

      // 4 ta savol matritsasi
      drawCommandLine("q1 ? ", "HEAD yoki branch ko'rsatkichi suriladimi?", 0.8, 2.5, 2.7, tu, 130, 205, { promptCol: C.yellow });
      drawOutputLine("-> git switch, git commit, git reset, git merge", 3.0, tu, 130, 230, { color: '#38bdf8' });

      drawCommandLine("q2 ? ", "Index (staging) holati yangilanadimi?", 4.0, 5.6, 5.8, tu, 130, 265, { promptCol: C.yellow });
      drawOutputLine("-> git add, git restore --staged, git rm", 6.1, tu, 130, 290, { color: '#38bdf8' });

      drawCommandLine("q3 ? ", "Diskdagi fayllarga (working tree) tegadimi?", 7.1, 8.8, 9.0, tu, 130, 325, { promptCol: C.red });
      drawOutputLine("-> git restore, git checkout, git reset --hard (DIQQAT!)", 9.3, tu, 130, 350, { color: C.red, weight: 600 });

      drawCommandLine("q4 ? ", "Masofaviy server (remote) bilan bog'lanadimi?", 10.3, 12.0, 12.2, tu, 130, 385, { promptCol: C.green });
      drawOutputLine("-> git fetch, git push, git pull (faqat shu 3 buyruq)", 12.5, tu, 130, 410, { color: C.green, weight: 600 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "YODLASHNING KERAGI YO'Q",
        badgeCol: C.blue,
        title: "Tizimli Fikr Yuritish",
        desc: "Gitdagi 150 dan ortiq buyruq va minglab opsiyalarni yodlash shart emas. Har qanday amalda qaysi qatlam o'zgarayotganini tushunish kifoya.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "AMAL TA'SIR RADIUSI",
        badgeCol: C.yellow,
        title: "Lokal va Tarmoq Chegarasi",
        desc: "Buyruqlarning 95 foizi internet talab qilmaydi va to'liq oflayn ishlaydi. Faqat fetch va push masofaviy ombor bilan aloqa o'rnatadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "ISHLASH ISHONCHI",
        badgeCol: C.green,
        title: "Xatolardan Qo'rqmaslik",
        desc: "To'rtta savolga aniq javob bilgan dasturchi terminalda buyruqlarni ko'r-ko'rona emas, oqibatini oldindan to'liq ko'rib ongli bajaradi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Xavfsizlik Zonasi va Xavfli Buyruqlar
  // ==========================================
  function sceneSafetyDanger(u, bounds, o = {}) {
    chip(3, "Xavfsizlik Zonasi va Xavfli Buyruqlar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-core (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: xavfli harakat
      drawCommandLine("dev $ ", "git reset --hard HEAD~1", 0.8, 2.2, 2.4, tu, 130, 205, { cmdCol: C.red });
      drawOutputLine("HEAD is now at 38ac120 Oldingi barqaror versiya", 2.8, tu, 130, 230, { color: C.yellow });

      // 2-buyruq: reflog yordamida qutqarish
      drawCommandLine("dev $ ", "git reflog -n 3", 4.0, 5.0, 5.2, tu, 130, 265);
      drawOutputLine("38ac120 HEAD@{0}: reset: moving to HEAD~1", 5.6, tu, 130, 290, { color: '#94a3b8' });
      drawOutputLine("9f1109a HEAD@{1}: commit: muhim yangi algoritm", 5.8, tu, 130, 310, { color: C.green, weight: 700 });

      // 3-buyruq: tiklash
      drawCommandLine("dev $ ", "git reset --hard HEAD@{1}", 7.0, 8.4, 8.6, tu, 130, 345);
      drawOutputLine("HEAD is now at 9f1109a commit: muhim yangi algoritm", 9.0, tu, 130, 370, { color: C.green, weight: 700 });
      drawOutputLine("# Yo'qolgan deb o'ylangan commit 2 soniyada tiklandi!", 9.5, tu, 130, 395, { color: '#38bdf8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "REFLOG: QUTQARUV TO'RI",
        badgeCol: C.green,
        title: "Commit Qilingan Har Qanday Obyekt Qaytadi",
        desc: "Git hech qachon commit qilingan ma'lumotni darhol o'chirmaydi. Reflog jurnali orqali adashib qilingan reset yoki rebase'larni bir zumda tiklash mumkin.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "YAGONA HAQIQIY XAVF",
        badgeCol: C.red,
        title: "Commit Qilinmagan O'zgarishlar",
        desc: "Faqat working tree'da saqlanmasdan turgan kod ustiga git reset --hard yoki restore buyrug'i yurgizilsa, u qaytarib bo'lmas darajada yo'qoladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "XAVFSIZLIK QOIDASI",
        badgeCol: C.yellow,
        title: "Avval Saqla — Keyin Eksperiment Qil",
        desc: "Xavfli buyruqlarni berishdan oldin har doim qoralama commit yaratish yoki git stash push qilish ko'ngilsiz holatlarning oldini oladi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Kundalik Checklist va Eng Yaxshi Amaliyotlar
  // ==========================================
  function sceneWorkflowChecklist(u, bounds, o = {}) {
    chip(4, "Kundalik Checklist va Eng Yaxshi Amaliyotlar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-core (feature/token)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git pull --ff-only
      drawCommandLine("dev $ ", "git pull --ff-only origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Already up to date. (kunni doim toza boshlaymiz)", 3.0, tu, 130, 230, { color: C.green });

      // 2-buyruq: git add -p
      drawCommandLine("dev $ ", "git add -p src/auth.ts", 4.0, 5.4, 5.6, tu, 130, 265);
      drawOutputLine("Stage this hunk [y,n,q,a,d,s,e,?]? y", 6.0, tu, 130, 290, { color: '#38bdf8' });

      // 3-buyruq: git commit ma'noli xabar bilan
      drawCommandLine("dev $ ", "git commit -m \"feat(auth): token amal qilish muddatini tekshirish\"", 7.0, 9.6, 9.8, tu, 130, 325);
      drawOutputLine("[feature/token c9102ab] feat(auth): token amal qilish muddatini tekshirish", 10.2, tu, 130, 350, { color: C.green });
      drawOutputLine(" 1 file changed, 18 insertions(+)", 10.4, tu, 130, 370, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "ATOMIK COMMITLAR",
        badgeCol: C.blue,
        title: "Kichik va Mantiqiy Qismlar",
        desc: "Bitta commitda faqat bitta maqsad aks etsin. Git add -p yordamida diff'ni bo'laklab saqlash kod ko'rib chiqishni va qaytarishni oson qiladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "STANDART XABARLAR",
        badgeCol: C.purple,
        title: "Conventional Commits Madaniyati",
        desc: "feat, fix, refactor kabi prefikslar tarixni tushunishni osonlashtiradi, changelog va avtomatik versiyalash vositalarini quvvatlaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "QISQA UMRLI BRANCHLAR",
        badgeCol: C.green,
        title: "Erta va Tez Birlashtirish",
        desc: "Branchlarni haftalab ushlab turmasdan, kichik vazifalarni darhol asosiy branchga pull request orqali qo'shish katta konfliktlarning oldini oladi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Kelajak: Git Uchinchi Versiyasi va Yangi Standartlar
  // ==========================================
  function sceneGit3Future(u, bounds, o = {}) {
    chip(5, "Kelajak: Git Uchinchi Versiyasi va Yangi Standartlar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-3.0 (modern)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git switch va restore
      drawCommandLine("modern $ ", "git switch feature/ui", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("Switched to branch 'feature/ui'", 2.7, tu, 130, 230, { color: C.green });

      drawCommandLine("modern $ ", "git restore --staged config/app.json", 3.8, 5.8, 6.0, tu, 130, 265);
      drawOutputLine("# Eski noaniq 'git checkout' o'rnini yangi buyruqlar egalladi", 6.4, tu, 130, 290, { color: '#64748b' });

      // 2-buyruq: sha256 va reftable
      drawCommandLine("modern $ ", "git rev-parse --show-object-format", 7.5, 9.2, 9.4, tu, 130, 325);
      drawOutputLine("sha256", 9.8, tu, 130, 350, { color: '#38bdf8', weight: 700 });

      drawCommandLine("modern $ ", "git rev-parse --show-ref-format", 10.6, 12.0, 12.2, tu, 130, 385);
      drawOutputLine("reftable (millionlab branchlar uchun ikkilik jadval)", 12.6, tu, 130, 410, { color: C.green, weight: 600 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "ANIQ VA BIR MA'NOLI",
        badgeCol: C.blue,
        title: "switch va restore Yangi Standart",
        desc: "Git 2.23+ da taqdim etilgan git switch va restore buyruqlari checkout'ning 5 xil vazifasini ajratib, o'rganishni sezilarli soddalashtirdi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "XAVFSIZLIK VA XESH",
        badgeCol: C.yellow,
        title: "SHA-256 va Reftable Formati",
        desc: "Kriptografik jihatdan zaiflashgan SHA-1 o'rniga zamonaviy SHA-256 ga o'tilmoqda. Reftable esa millionlab ref'larni bir zumda indekslaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "GIT 3.0 GA TAYYORLIK",
        badgeCol: C.purple,
        title: "Zamonaviy Buyruqlar Madaniyati",
        desc: "Eskirgan buyruqlar va xatti-harakatlardan bugunoq voz kechish kelajakdagi yangilanishlarga og'riqsiz o'tishni kafolatlaydi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Yakun: 50 Boblik Sayohat Xulosasi
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Yakun: 50 Boblik Sayohat Xulosasi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@mastery: ~/git-mastery (complete)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log xulosasi
      drawCommandLine("git $ ", "git log --graph --oneline --all -n 4", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("* e9481a (HEAD -> main, v2.56) Git kitobi 50-bob: Yakun!", 3.0, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("* | 81bc02 feat: worktree va katta monorepolar", 3.2, tu, 130, 250, { color: '#38bdf8' });
      drawOutputLine("* | 4f981a feat: muhit o'zgaruvchilari va diagnostika", 3.4, tu, 130, 270, { color: '#38bdf8' });
      drawOutputLine("|/  59825e feat: poydevor va ichki arxitektura", 3.6, tu, 130, 290, { color: '#94a3b8' });

      // 2-buyruq: g'alaba tabrigi
      drawCommandLine("git $ ", "echo \"TABRIKLAYMIZ! Siz Git bo'yicha professional bilimlarga egasiz!\"", 4.8, 8.0, 8.2, tu, 130, 335, { promptCol: C.yellow, cmdCol: C.yellow });
      drawOutputLine("==========================================================", 8.6, tu, 130, 365, { color: C.green });
      drawOutputLine("TABRIKLAYMIZ! Siz Git bo'yicha professional bilimlarga egasiz!", 8.8, tu, 130, 385, { color: C.green, weight: 700 });
      drawOutputLine("50 ta bob, terminal videolari va amaliyot to'liq muvaffaqiyat!", 9.0, tu, 130, 405, { color: '#38bdf8' });
      drawOutputLine("==========================================================", 9.2, tu, 130, 425, { color: C.green });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "TO'LIQ METODIK POYDEVOR",
        badgeCol: C.blue,
        title: "Boshlang'ichdan Mutaxassisgacha",
        desc: "50 ta bob orqali Gitning har bir siri: ob'ektlar, ref'lar, merge, rebase, reflog, hooklar, submodullar va monorepolar to'liq egallandi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "KOMANDA VA MADANIYAT",
        badgeCol: C.green,
        title: "Yetuk Muhandislik Darajasi",
        desc: "Endi har qanday murakkab konflikt, yo'qolgan commit yoki yirik korporativ monorepo siz uchun oddiy va boshqariladigan jarayondir.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 205, {
        badge: "OMAD VA MUVAFFAQIYAT!",
        badgeCol: C.purple,
        title: "Kelgusi Loyihalarda Zafarlar!",
        desc: "O'zbek tilidagi eng to'liq va mukammal Git qo'llanmasi sizning kundalik ishonchli hamrohingiz bo'lib xizmat qilishda davom etadi.",
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
      { id: 'model_mental', fn: sceneModelMental },
      { id: 'four_questions', fn: sceneFourQuestions },
      { id: 'safety_danger', fn: sceneSafetyDanger },
      { id: 'workflow_checklist', fn: sceneWorkflowChecklist },
      { id: 'git3_future', fn: sceneGit3Future },
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
    sceneModelMental(8.5, TM.scenes.model_mental, { isPoster: true });
  };
})();
