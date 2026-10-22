// anim.js — 37-bob: Interaktiv staging
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
  // 1-SAHNA: Atomar Commit va Interaktiv Staging
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Atomar Commit va Interaktiv Staging", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status -s
      drawCommandLine("dev $ ", "git status -s", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine(" M README.md", 3.0, tu, 130, 228, { color: C.cyan });
      drawOutputLine(" M TODO", 3.2, tu, 130, 248, { color: C.cyan });
      drawOutputLine(" M hisob.py", 3.4, tu, 130, 268, { color: C.yellow, weight: 600 });
      drawOutputLine("?? tajriba.py", 3.6, tu, 130, 288, { color: '#94a3b8' });

      // 2-buyruq: git diff hisob.py
      drawCommandLine("dev $ ", "git diff hisob.py", 4.5, 6.5, 6.7, tu, 130, 325);
      drawOutputLine("@@ -1,9 +1,10 @@ def qoshish(a, b):", 7.0, tu, 130, 348, { color: C.cyan });
      drawOutputLine("+    \"\"\"Ikki sonni qo'shadi.\"\"\"", 7.2, tu, 130, 368, { color: C.green, weight: 600 });
      drawOutputLine("+    return a - b  # izoh: natija manfiy bo'lishi mumkin", 7.4, tu, 130, 388, { color: C.green });
      drawOutputLine("@@ -11,6 +12,9 @@ def bolish(a, b):", 7.7, tu, 130, 412, { color: C.cyan });
      drawOutputLine("+    print(\"DEBUG\", a, b)  # vaqtinchalik log", 8.0, tu, 130, 432, { color: C.red, weight: 600 });
      drawOutputLine("+    if b == 0: raise ZeroDivisionError(\"nol bo'lmasin\")", 8.2, tu, 130, 452, { color: C.green, weight: 700 });
      drawOutputLine("  # 1 faylda 4 xil mavzu: git add . aralash commit hosil qiladi!", 8.5, tu, 130, 478, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Index: Oraliq Qatlam Kuchi", "atomar commit yaratish falsafasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Faylning 3 Xil Holati", 1125, 290, C.cyan, { size: 16, mono: false });
        text("1. HEAD versiya    : Oxirgi commitda qotirilgan holat.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("2. Index versiya   : Keyingi commitga tushadigan qoralama (staging area).", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("3. Working tree    : Diskdagi fayl, muharrirda ochiq turgan ishchi nusxa.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Index alohida qatlam bo'lgani uchun faylni bo'laklab qo'shish mumkin!", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Nega Aralash Commit Yomon?", 1130, 500, C.red, { size: 16, mono: false });
        text("• Bitta commitda ham docstring, ham bug fix, ham debug log bo'lsa:", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("  - Kodni review qilish juda qiyinlashadi.", 1030, 570, { size: 14, color: C.red, align: 'left', weight: 600 });
        text("  - 'git revert' bilan faqat bir qismini bekor qilib bo'lmaydi.", 1030, 595, { size: 14, color: C.yellow, align: 'left' });
        text("  - 'git bisect' aybdor commitni topganda chalkashlik yuzaga keladi.", 1030, 620, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git add -i Menyu Tizimi
  // ==========================================
  function sceneGitAddI(u, bounds, o = {}) {
    chip(2, "git add -i Menyu Tizimi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git add -i
      drawCommandLine("dev $ ", "git add -i", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("           staged     unstaged path", 3.0, tu, 130, 228, { color: C.mute, weight: 600 });
      drawOutputLine("  1:    unchanged        +1/-1 README.md", 3.2, tu, 130, 248, { color: C.cyan });
      drawOutputLine("  2:    unchanged        +0/-1 TODO", 3.4, tu, 130, 268, { color: C.cyan });
      drawOutputLine("  3:    unchanged        +5/-1 hisob.py", 3.6, tu, 130, 288, { color: C.yellow });
      drawOutputLine("*** Commands ***", 3.9, tu, 130, 312, { color: C.green, weight: 700 });
      drawOutputLine("  1: [s]tatus  2: [u]pdate  3: [r]evert  4: [a]dd untracked", 4.1, tu, 130, 332, { color: '#cbd5e1' });
      drawOutputLine("  5: [p]atch   6: [d]iff    7: [q]uit    8: [h]elp", 4.3, tu, 130, 352, { color: '#cbd5e1' });

      // 2-buyruq: update
      drawCommandLine("What now> ", "u", 5.5, 6.2, 6.4, tu, 130, 390);
      drawOutputLine("Update>> 1,2", 6.8, tu, 130, 412, { color: C.cyan, weight: 600 });
      drawOutputLine("* 1: [R]EADME.md   * 2: [T]ODO", 7.1, tu, 130, 432, { color: C.green });
      drawOutputLine("updated 2 paths  # README va TODO to'liq stage qilindi!", 7.5, tu, 130, 452, { color: C.green, weight: 600 });

      // 3-buyruq: revert
      drawCommandLine("What now> ", "r", 8.8, 9.5, 9.7, tu, 130, 488);
      drawOutputLine("Revert>> 2", 10.0, tu, 130, 510, { color: C.yellow });
      drawOutputLine("reverted 1 path (TODO yana unstaged holatiga qaytdi)", 10.4, tu, 130, 530, { color: C.cyan });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Interaktiv Menyu Buyruqlari", "git add -i bilan qulay boshqaruv", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("8 Ta Asosiy Menyu Amallari", 1125, 290, C.yellow, { size: 16, mono: false });
        text("• status        : Qaysi fayllar staged va unstaged ekanini ko'rsatadi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• update        : Fayllarning joriy holatini indexga qo'shadi (add).", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• revert        : Stage qilingan faylni indexdan chiqaradi (restore --staged).", 1030, 395, { size: 15, color: C.cyan, align: 'left' });
        text("• add untracked : Yangi kuzatilmayotgan fayllarni qo'shadi.", 1030, 420, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Moslashuvchan Tanlash Sintaksisi", 1135, 500, C.cyan, { size: 16, mono: false });
        text("• '1,2' yoki '1 2' : 1 va 2-faylni bir vaqtda belgilash.", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• '2-'             : 2-fayldan boshlab ro'yxat oxirigacha tanlash.", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• '-2'             : 2-faylni tanlovdan chiqarib tashlash.", 1030, 605, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("• Nomlar bosh harfi bilan: '[R]' for README, '[h]' for hisob.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git add -p va Hunk Tanlash
  // ==========================================
  function sceneGitAddPHunks(u, bounds, o = {}) {
    chip(3, "git add -p va Hunk Tanlash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git add -p hisob.py
      drawCommandLine("dev $ ", "git add -p hisob.py", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("diff --git a/hisob.py b/hisob.py", 3.0, tu, 130, 228, { color: C.mute });
      drawOutputLine("@@ -1,9 +1,10 @@ def qoshish(a, b):", 3.2, tu, 130, 248, { color: C.cyan });
      drawOutputLine(" def qoshish(a, b):", 3.4, tu, 130, 268, { color: '#94a3b8' });
      drawOutputLine("+    \"\"\"Ikki sonni qo'shadi.\"\"\"", 3.6, tu, 130, 288, { color: C.green, weight: 600 });
      drawOutputLine(" def ayirish(a, b):", 3.8, tu, 130, 308, { color: '#94a3b8' });
      drawOutputLine("+    return a - b  # natija manfiy bo'lishi mumkin", 4.0, tu, 130, 328, { color: C.green });

      // Prompt 1
      drawCommandLine("(1/2) Stage this hunk [y,n,q,a,d,s,e,?]? ", "y", 5.5, 6.2, 6.4, tu, 130, 365);
      drawOutputLine("@@ -11,6 +12,9 @@ def bolish(a, b):", 6.8, tu, 130, 390, { color: C.cyan });
      drawOutputLine("+    print(\"DEBUG\", a, b)", 7.0, tu, 130, 410, { color: C.red });
      drawOutputLine("+    if b == 0: raise ZeroDivisionError(\"nol bo'lmasin\")", 7.2, tu, 130, 430, { color: C.green, weight: 600 });

      // Prompt 2
      drawCommandLine("(2/2) Stage this hunk [y,n,q,a,d,s,e,?]? ", "n", 8.5, 9.2, 9.4, tu, 130, 465);
      drawOutputLine("  # 1-hunk qabul qilindi (staged), 2-hunk tashlab ketildi (unstaged)!", 9.8, tu, 130, 490, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Hunk Tanlash Prompti", "har bir bo'lak uchun alohida qaror", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Hunk (Bo'lak) Tushunchasi", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• 'git diff' chiqishidagi har bir '@@ ... @@' bilan boshlangan qism — hunk.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• O'zgarish va uning atrofidagi 3 qator o'zgarmagan kontekstni o'z ichiga oladi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Fayl ichidagi uzoq o'zgarishlar alohida hunklarga o'zi avtomatik bo'linadi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Har biriga mustaqil qaror qabul qilish imkoniyati beriladi.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Asosiy Tugmalar Lug'ati", 1120, 500, C.green, { size: 16, mono: false });
        text("y (yes)  : Shu hunkni stage qilish (indexga olish).", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("n (no)   : Bu hunkni stage qilmaslik (working treeda qoladi).", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("q (quit) : Chiqish (oldin 'y' deganlaringiz to'liq saqlanadi).", 1030, 605, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("a (all)  : Shu va qolgan barcha hunklarni birdaniga olish.", 1030, 630, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Hunklarni Bo‘lish va Tahrirlash
  // ==========================================
  function sceneHunkSplitEdit(u, bounds, o = {}) {
    chip(4, "Hunklarni Bo‘lish va Tahrirlash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: 's' (split)
      drawCommandLine("(1/2) Stage this hunk? ", "s", 0.8, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Split into 2 hunks. (Oraliq kontekst bo'yicha bo'lindi)", 2.3, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine("(1/3) [docstring] Stage this hunk? y", 2.6, tu, 130, 248, { color: C.cyan });
      drawOutputLine("(2/3) [izoh]      Stage this hunk? n", 2.9, tu, 130, 268, { color: '#94a3b8' });

      // 2-buyruq: 'e' (manual edit)
      drawCommandLine("(3/3) Stage this hunk? ", "e", 4.2, 5.2, 5.4, tu, 130, 305);
      drawOutputLine("# Manual hunk edit mode (muharrirda tahrirlash):", 5.8, tu, 130, 328, { color: C.yellow, weight: 600 });
      drawOutputLine("- print(\"DEBUG\", a, b)    <-- O'CHIRILDI (stage qilinmaydi)", 6.1, tu, 130, 348, { color: C.red, weight: 600 });
      drawOutputLine("+ if b == 0: raise Zero... <-- SAQLANDI (stage qilinadi)", 6.4, tu, 130, 368, { color: C.green, weight: 700 });

      // 3-buyruq: git diff --cached
      drawCommandLine("dev $ ", "git diff --cached hisob.py", 8.0, 10.0, 10.2, tu, 130, 405);
      drawOutputLine("+++ b/hisob.py (Faqat toza kod indexda!)", 10.5, tu, 130, 428, { color: C.green, weight: 600 });
      drawOutputLine("+    \"\"\"Ikki sonni qo'shadi.\"\"\"", 10.7, tu, 130, 448, { color: C.cyan });
      drawOutputLine("+    if b == 0: raise ZeroDivisionError(\"nol bo'lmasin\")", 10.9, tu, 130, 468, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Hunkni Bo'lish (s) va Tahrirlash (e)", "mikroskopik darajada aniq staging", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("'s' (Split) — Hunkni Bo'lish", 1125, 290, C.purple, { size: 16, mono: false });
        text("• Agar o'zgarishlar orasida o'zgarmagan qator bo'lsa, 's' ishlaydi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Bitta katta hunkni 2 yoki undan ko'p kichik bo'laklarga ajratadi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Har bir kichik bo'lakka alohida 'y' yoki 'n' deb javob berasiz.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Natijada docstring olinadi, lekin izoh keyinga qoldiriladi.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("'e' (Edit) — Qo'lda Tahrirlash", 1120, 500, C.yellow, { size: 16, mono: false });
        text("• O'zgarishlar qo'shni qatorlarda tursa, 's' bo'lolmaydi — 'e' ishlatiladi.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Hunk muharrirda ochiladi: '+' qatorni o'chirsangiz, u indexga kirmaydi!", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Vaqtinchalik DEBUG qatorini o'chirasiz: u diskda qoladi, commitga kirmaydi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Bu o'ta aniq, professional darajadagi tozalik beradi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Bitta Fayl Ikki Holatda
  // ==========================================
  function sceneBittaFaylIkkiHolat(u, bounds, o = {}) {
    chip(5, "Bitta Fayl Ikki Holatda", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git status
      drawCommandLine("dev $ ", "git status", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Changes to be committed:", 3.0, tu, 130, 228, { color: C.green, weight: 700 });
      drawOutputLine("  modified:   hisob.py  # docstring va nolga bo'lish tekshiruvi", 3.2, tu, 130, 248, { color: C.green });
      drawOutputLine("Changes not staged for commit:", 3.6, tu, 130, 275, { color: C.red, weight: 700 });
      drawOutputLine("  modified:   hisob.py  # izoh va vaqtinchalik debug log", 3.8, tu, 130, 295, { color: C.red });

      // 2-buyruq: atomar commit
      drawCommandLine("dev $ ", 'git commit -m "bolish(): nolga bo\'lish tekshiruvi"', 5.2, 8.0, 8.2, tu, 130, 335);
      drawOutputLine("[main a37f19b] bolish(): nolga bo'lish tekshiruvi", 8.5, tu, 130, 358, { color: C.green, weight: 600 });
      drawOutputLine(" 1 file changed, 3 insertions(+)", 8.7, tu, 130, 378, { color: '#94a3b8' });

      // 3-buyruq: git status keyin
      drawCommandLine("dev $ ", "git status -s", 10.0, 11.5, 11.7, tu, 130, 415);
      drawOutputLine(" M hisob.py  # Qolgan o'zgarishlar diskda xavfsiz turibdi!", 12.0, tu, 130, 438, { color: C.yellow, weight: 600 });
      drawOutputLine("  # Keyingi mantiqiy qadam uchun navbatdagi commit tayyorlanadi.", 12.3, tu, 130, 460, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Bitta Fayl Ikki Holatda", "staged va unstaged simfoniyasi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bu Qanday Sodir Bo'ladi?", 1125, 290, C.green, { size: 16, mono: false });
        text("• Git status bitta faylni bir vaqtda ikkala bo'limda ham ko'rsatadi:", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("  - Changes to be committed     : Indexdagi toza qism.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  - Changes not staged for commit: Diskdagi qolgan o'zgarishlar.", 1030, 395, { size: 15, color: C.yellow, align: 'left' });
        text("• Bu xato emas — aynan interaktiv staging kuchi shunda!", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Toza Atomar Commit Foydasi", 1130, 500, C.cyan, { size: 16, mono: false });
        text("• Commit qilinganda faqat zarur tekshiruv tarixga muhrlanadi.", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Diskdagi ishchi nusxa esa buzilmasdan saqlanib qoladi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Hamkasblar review qilganda faqat kerakli o'zgarishni ko'radi.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• Keyinchalik bitta alohida commitni 'revert' qilish oson bo'ladi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Boshqa Patch Buyruqlari va Xulosa
  // ==========================================
  function sceneBoshqaPatchBuyruqlar(u, bounds, o = {}) {
    chip(6, "Boshqa Patch Buyruqlari va Xulosa", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/kalkulyator (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git restore -p
      drawCommandLine("dev $ ", "git restore -p hisob.py", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Discard this hunk from worktree [y,n,q,a,d,e,?]? y", 3.0, tu, 130, 228, { color: C.red, weight: 600 });
      drawOutputLine("  # Keraksiz debug log diskdan butunlay olib tashlandi!", 3.3, tu, 130, 248, { color: C.mute });

      // 2-buyruq: git stash -p
      drawCommandLine("dev $ ", "git stash -p", 4.5, 6.0, 6.2, tu, 130, 285);
      drawOutputLine("Stash this hunk [y,n,q,a,d,e,?]? y", 6.5, tu, 130, 308, { color: C.yellow, weight: 600 });
      drawOutputLine("Saved working directory and index state WIP on main", 6.8, tu, 130, 328, { color: C.cyan });

      // 3-buyruq: git status
      drawCommandLine("dev $ ", "git status -s", 8.0, 9.5, 9.7, tu, 130, 365);
      drawOutputLine("  # Working tree mutlaqo toza! (clean)", 10.0, tu, 130, 388, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Patch Rejimi Hamma Joyda", "Git qurol-aslahalari to'plami", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Boshqa '-p' Buyruqlari Oqimi", 1130, 290, C.cyan, { size: 16, mono: false });
        text("• git restore -p          : Diskdagi keraksiz hunkni tashlab yuborish.", 1030, 335, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("• git restore --staged -p : Hunkni indexdan chiqarish (reset -p).", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• git stash -p            : Faqat tanlangan qismni stashga saqlash.", 1030, 395, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• git commit -p           : Add qilmasdan to'g'ridan-to'g'ri commit yozish.", 1030, 420, { size: 15, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Dasturchining Oltin Qoidasi", 1125, 500, C.green, { size: 16, mono: false });
        text("1. Erkin kod yozing: fikringizni bo'lmang, tezkor ishlang.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("2. Commit qilishdan oldin 'git add -p' bilan har bir mavzuni ajrating.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("3. Keraksiz debug loglarni 'git restore -p' bilan darhol tozalang.", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("4. Natijada sizning Git tarixingiz san'at darajasida toza bo'ladi!", 1030, 630, { size: 15, color: C.cyan, align: 'left', weight: 600 });
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
      { id: 'git_add_i', fn: sceneGitAddI },
      { id: 'git_add_p_hunks', fn: sceneGitAddPHunks },
      { id: 'hunk_split_edit', fn: sceneHunkSplitEdit },
      { id: 'bitta_fayl_ikki_holat', fn: sceneBittaFaylIkkiHolat },
      { id: 'boshqa_patch_buyruqlar', fn: sceneBoshqaPatchBuyruqlar }
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
