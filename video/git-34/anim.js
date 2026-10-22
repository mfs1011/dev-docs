// anim.js — 34-bob: Loyihani yuritish
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
  // 1-SAHNA: Maintainer va Topic Branchlar
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Maintainer va Topic Branchlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: mavjud repo tarixini ko'rish
      drawCommandLine("ali $ ", "git log --oneline -3", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("e06df87 (HEAD -> main) ayir(): izoh qo'shildi", 3.0, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("6787a92 Test: ayir()", 3.2, tu, 130, 252, { color: C.cyan, weight: 600 });
      drawOutputLine("ddadeeb (tag: v1.0) Loyiha boshlandi", 3.4, tu, 130, 274, { color: '#94a3b8' });
      drawOutputLine("  # Begona patch keldi: bevosita main'ga qo'shilmaydi!", 3.7, tu, 130, 296, { color: C.mute });

      // 2-buyruq: yangi topic branch ochish
      drawCommandLine("ali $ ", "git switch -c jt/bol main", 5.5, 7.8, 8.0, tu, 130, 335);
      drawOutputLine("Switched to a new branch 'jt/bol'", 8.3, tu, 130, 360, { color: C.green, weight: 600 });

      // 3-buyruq: branch ro'yxati
      drawCommandLine("ali $ ", "git branch", 10.0, 11.5, 11.7, tu, 130, 395);
      drawOutputLine("* jt/bol", 12.0, tu, 130, 420, { color: C.green, weight: 700 });
      drawOutputLine("  main", 12.2, tu, 130, 442, { color: '#94a3b8' });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kCallout, () => {
        card(125, 475, 790, 220, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Maintainerning Bosh Boshqaruv Qoidasi", 255, 510, C.cyan, { size: 16, mono: false });
        text("• Kelgan har qanday patch — hali ishonilmagan kod!", 150, 550, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  Uni hech qachon to'g'ridan-to'g'ri 'main'ga qo'llamang.", 150, 578, { size: 15, color: C.text, align: 'left' });
        text("• Alohida topic branch ochish bepul (kichik 41 baytlik ref fayl).", 150, 606, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Agar patch yomon bo'lsa: 'git branch -D' qilib osongina tashlanadi,", 150, 634, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  asosiy 'main' esa doim pokiza va barqaror qoladi.", 150, 658, { size: 15, color: C.cyan, align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Maintainer va Topic Branchlar", "ishni xavfsiz sinash maydoni", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Nega Bevosita 'main'ga Emas?", 1135, 290, C.cyan, { size: 16, mono: false });
        text("1. Patch ishlamasligi yoki testlarni buzishi mumkin.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("2. Agar rad etilsa, push qilingan main'ni tozalash juda qiyin.", 1030, 365, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Bir necha haftadan keyin qaysi commit begona ekanini ajratib bo'lmaydi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("4. Topic branchda patchni bemalol tahrirlash yoki bekor qilish mumkin.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nomlash Standartlari: <muallif>/<mavzu>", 1160, 500, C.green, { size: 16, mono: false });
        text("• Git maintainer tajribasi: hissa qo'shuvchining bosh harflari prefiks qilinadi:", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("  - jt/bol       → Javohir Tursunovning bo'lish funksiyasi", 1030, 575, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("  - dq/ayir      → Dildora Qosimovaning ayirish tuzatishi", 1030, 605, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("  - sn/foiz      → Sevara Nazarovaning foiz funksiyasi", 1030, 630, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Diff Patchlar va git apply
  // ==========================================
  function sceneGitApply(u, bounds, o = {}) {
    chip(2, "Diff Patchlar va git apply", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (jt/bol)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git apply --stat
      drawCommandLine("ali $ ", "git apply --stat ../bol-qoshish.patch", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine(" README.md |    2 +-", 3.0, tu, 130, 228, { color: C.cyan });
      drawOutputLine(" hisob.py  |    4 ++++", 3.2, tu, 130, 248, { color: C.cyan });
      drawOutputLine(" 2 files changed, 5 insertions(+), 1 deletion(-)", 3.4, tu, 130, 268, { color: '#94a3b8' });

      // 2-buyruq: git apply --check
      drawCommandLine("ali $ ", "git apply --check ../bol-qoshish.patch", 4.5, 6.5, 6.7, tu, 130, 305);
      drawOutputLine("  # Chiqish yo'q (exit 0) — patch joriy kodga toza qo'llanadi!", 7.0, tu, 130, 328, { color: C.green, weight: 600 });

      // 3-buyruq: git apply va commit
      drawCommandLine("ali $ ", "git apply ../bol-qoshish.patch && git add -A", 8.5, 11.0, 11.2, tu, 130, 365);
      drawCommandLine("ali $ ", 'git commit -m "bol() funksiyasi" --author="Javohir Tursunov <j@ex.com>"', 12.0, 15.0, 15.2, tu, 130, 400);
      drawOutputLine("[jt/bol dc8a1c5] bol() funksiyasi", 15.5, tu, 130, 425, { color: C.green, weight: 600 });
      drawOutputLine(" Author: Javohir Tursunov <j@ex.com>", 15.7, tu, 130, 445, { color: C.cyan });
      drawOutputLine(" 2 files changed, 5 insertions(+), 1 deletion(-)", 15.9, tu, 130, 465, { color: '#94a3b8' });

      // 4-buyruq: 3-way fallback
      drawCommandLine("ali $ ", "git apply -3 ../bol-qoshish.patch  # agar asos eskirgan bo'lsa", 17.5, 20.0, 20.2, tu, 130, 500);
      drawOutputLine("Applied patch to 'README.md' with conflicts (blob xeshlaridan tiklandi)", 20.5, tu, 130, 525, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "git apply Xususiyatlari", "diff fayllarini xavfsiz qo'llash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Atomarlik: 'Hammasi yoki Hech Narsa'", 1145, 290, C.yellow, { size: 16, mono: false });
        text("• 'git apply' commit yaratmaydi, faqat working tree fayllarini o'zgartiradi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Birorta bo'lak (hunk) mos kelmasa — birorta faylga tegilmaydi (toza qoladi).", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Diff patchda muallif va sana bo'lmagani uchun commit qo'lda yasaladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Tavsiya: iloji bo'lsa hamkorlardan format-patch so'rang!", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Muhim git apply Opsiyalari", 1120, 500, C.cyan, { size: 16, mono: false });
        text("--stat   : O'zgarishlarni ko'rsatadi, lekin qo'llamaydi.", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("--check  : Toza qo'llanishini oldindan tekshiradi (exit 0).", 1030, 575, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("-3, --3way : Blob xeshlaridan foydalanib 3 tomonlama merge qiladi.", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("--reject : Mos kelganini oladi, qolganini *.rej fayllarga yozadi.", 1030, 630, { size: 15, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Format-Patch va git am
  // ==========================================
  function sceneGitAm(u, bounds, o = {}) {
    chip(3, "Format-Patch va git am", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (jt/daraja)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: topic ochish va git am
      drawCommandLine("ali $ ", "git switch -c jt/daraja main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("ali $ ", "git am ../javohir/0001-daraja-funksiyasi.patch", 3.2, 5.5, 5.7, tu, 130, 235);
      drawOutputLine("Applying: daraja() funksiyasi", 6.0, tu, 130, 258, { color: C.green, weight: 600 });

      // 2-buyruq: ikkinchi patchni qo'llash
      drawCommandLine("ali $ ", "git am ../javohir/0002-Test-daraja.patch", 7.0, 9.2, 9.4, tu, 130, 290);
      drawOutputLine("Applying: Test: daraja()", 9.7, tu, 130, 313, { color: C.green, weight: 600 });

      // 3-buyruq: git log --pretty=fuller
      drawCommandLine("ali $ ", "git log --format='%h %an (%ad) | %cn: %s' -2", 11.0, 13.5, 13.7, tu, 130, 350);
      drawOutputLine("588e8be Javohir Tursunov | Ali Valiyev: Test: daraja()", 14.0, tu, 130, 375, { color: C.cyan, weight: 600 });
      drawOutputLine("7d4a30a Javohir Tursunov | Ali Valiyev: daraja() funksiyasi", 14.2, tu, 130, 395, { color: C.green, weight: 600 });
      drawOutputLine("  # Author: Javohir (10:00), Committer: Ali (10:30)", 14.5, tu, 130, 415, { color: C.mute });

      // 4-buyruq: sessiya boshqaruvi
      drawCommandLine("ali $ ", "git am -3 ../xat/*.patch  # konflikt chiqqanda sessiya to'xtaydi", 16.5, 19.5, 19.7, tu, 130, 450);
      drawOutputLine("Applying: ayir(): xatoni yaxlitlash", 20.0, tu, 130, 473, { color: '#94a3b8' });
      drawOutputLine("CONFLICT (content): Merge conflict in hisob.py", 20.2, tu, 130, 493, { color: C.red, weight: 700 });
      drawOutputLine("When resolved, run 'git am --continue' (yoki --skip / --abort)", 20.5, tu, 130, 513, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Pochta Qutisi va git am", "mbox seriyalarini avtomatik commit qilish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Avtomatik Mualliflik va Commit", 1125, 290, C.purple, { size: 16, mono: false });
        text("• 'git am' (apply mailbox) format-patch fayllarini o'qiydi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Xatdagi From: va Date: muallif (Author) maydoniga o'tadi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Subject: qatori commit sarlavhasi bo'ladi; commit avtomatik yasaladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Siz esa patchni qo'llagan Committer sifatida qayd etilasiz.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Sessiya Boshqaruvi Buyruqlari", 1130, 500, C.red, { size: 16, mono: false });
        text("git am --continue : Konflikt tuzatilib 'git add' qilingach davom ettirish.", 1030, 545, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("git am --skip     : Bu patchni tashlab, keyingisiga o'tish.", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("git am --abort    : Barcha amallarni bekor qilib dastlabki holga qaytish.", 1030, 605, { size: 15, fam: MONO, color: C.red, align: 'left' });
        text("git am -3         : Blob xeshlaridan foydalanib uch tomonlama merge.", 1030, 630, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Remote Branch va Uch Nuqtali Diff
  // ==========================================
  function sceneRemoteVaTekshirish(u, bounds, o = {}) {
    chip(4, "Remote Branch va Uch Nuqtali Diff", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (sn/foiz)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: remote qo'shish va fetch
      drawCommandLine("ali $ ", "git remote add sevara ../sevara.git && git fetch sevara", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine(" * [new branch]      foiz -> sevara/foiz", 3.0, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine(" * [new branch]      main -> sevara/main", 3.2, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: switch -c sn/foiz
      drawCommandLine("ali $ ", "git switch -c sn/foiz sevara/foiz", 4.5, 6.8, 7.0, tu, 130, 285);
      drawOutputLine("Switched to a new branch 'sn/foiz' tracking 'sevara/foiz'", 7.3, tu, 130, 308, { color: C.cyan, weight: 600 });

      // 3-buyruq: git log main..sn/foiz
      drawCommandLine("ali $ ", "git log --oneline main..sn/foiz", 8.5, 10.5, 10.7, tu, 130, 345);
      drawOutputLine("b4df5dd README: funksiyalar ro'yxati", 11.0, tu, 130, 368, { color: C.green, weight: 600 });
      drawOutputLine("f1c51d9 foiz() funksiyasi", 11.2, tu, 130, 388, { color: C.cyan, weight: 600 });

      // 4-buyruq: git diff main...sn/foiz
      drawCommandLine("ali $ ", "git diff --stat main...sn/foiz  # UCH NUQTA!", 12.5, 15.0, 15.2, tu, 130, 425);
      drawOutputLine(" README.md | 2 +-", 15.5, tu, 130, 448, { color: C.green });
      drawOutputLine(" hisob.py  | 4 ++++", 15.7, tu, 130, 468, { color: C.green });
      drawOutputLine(" 2 files changed, 5 insertions(+), 1 deletion(-)", 15.9, tu, 130, 488, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Tekshirish: Nima Kiritilmoqda?", "ikki va uch nuqtaning tub farqi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Doimiy Hamkorlar Remote Sifatida", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• O'z ommaviy repozitoriysi bo'lgan faol contributorlar uchun eng qulay yo'l.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• 'git remote add <nom> <url>' orqali ulanadi va muntazam fetch qilinadi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Commitlar asl xolicha, muallif va shajarasi bilan birga keladi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Bir martalik hissa uchun esa 'git fetch <URL> <branch>' kifoya.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Nega 'git diff main' Aldaydi?", 1115, 500, C.yellow, { size: 16, mono: false });
        text("• 'git diff main topic': ikkita oxirgi snapshotni solishtiradi.", 1030, 545, { size: 15, color: C.red, align: 'left', weight: 600 });
        text("  Agar main oldinga ketgan bo'lsa, main'dagi har yangilik go'yo topic tomonidan", 1030, 570, { size: 14, color: '#cbd5e1', align: 'left' });
        text("  o'chirilgandek noto'g'ri ko'rinadi!", 1030, 590, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• 'git diff main...topic' (uch nuqta): merge base ajdodidan keyingi farq!", 1030, 615, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  Aynan shu buyruq hissa qo'shuvchining asl mehnatini to'g'ri ko'rsatadi.", 1030, 638, { size: 14, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Rebase, FF va Cherry-pick
  // ==========================================
  function sceneIntegratsiyaUsullari(u, bounds, o = {}) {
    chip(5, "Rebase, FF va Cherry-pick", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: rebase main jt/daraja
      drawCommandLine("ali $ ", "git rebase main jt/daraja", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("Successfully rebased and updated refs/heads/jt/daraja.", 3.0, tu, 130, 228, { color: C.green, weight: 600 });

      // 2-buyruq: main'ni fast-forward qilish
      drawCommandLine("ali $ ", "git switch main && git merge --ff-only jt/daraja", 4.2, 6.8, 7.0, tu, 130, 265);
      drawOutputLine("Updating 0249304..830402c", 7.3, tu, 130, 288, { color: '#94a3b8' });
      drawOutputLine("Fast-forward: hisob.py (+4), tests/test_daraja.py (+1)", 7.5, tu, 130, 308, { color: C.green, weight: 600 });

      // 3-buyruq: cherry-pick -x
      drawCommandLine("ali $ ", "git cherry-pick -x f1c51d9", 9.0, 11.2, 11.4, tu, 130, 345);
      drawOutputLine("[main 2aa0c95] foiz() funksiyasi", 11.7, tu, 130, 368, { color: C.green, weight: 600 });
      drawOutputLine(" Author: Sevara Nazarova <sevara@example.com>", 11.9, tu, 130, 388, { color: C.cyan });
      drawOutputLine(" 1 file changed, 4 insertions(+)", 12.1, tu, 130, 408, { color: '#94a3b8' });

      // 4-buyruq: git log --pretty=fuller
      drawCommandLine("ali $ ", "git log -1 --pretty=fuller", 13.5, 15.0, 15.2, tu, 130, 445);
      drawOutputLine("    foiz() funksiyasi", 15.5, tu, 130, 468, { color: C.green, weight: 600 });
      drawOutputLine("    (cherry picked from commit f1c51d917ffaf1fdf4...)", 15.7, tu, 130, 488, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Integratsiya Strategiyalari", "chiziqli va toza tarix yaratish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Rebase + Fast-Forward Workflow", 1135, 290, C.green, { size: 16, mono: false });
        text("• Tarixni chiziqli va o'qishga oson saqlashni xohlovchi maintainerlar usuli.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• 'git rebase main topic' topic commitlarini joriy main ustiga ko'chiradi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• 'git merge --ff-only' orqali merge commit yasalmaydi, shunchaki pointer siljiydi.", 1030, 395, { size: 15, color: C.cyan, align: 'left' });
        text("• Topic lokal bo'lgani uchun rebase mutlaqo xavfsiz!", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git cherry-pick -x Imkoniyati", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Butun branch emas, balki faqat bitta kerakli commitni ajratib olish.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• Yangi commit yaratiladi: muallif saqlanadi, lekin yangi xesh beriladi.", 1030, 575, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• '-x' opsiyasi commit xabariga asl xesh izohini kiritadi (audit uchun juda muhim!).", 1030, 605, { size: 15, color: C.yellow, align: 'left' });
        text("• 'rerere.enabled true' takroriy konfliktlarni avtomatik hal qiladi.", 1030, 630, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Reliz: Tag, Describe va Arxiv
  // ==========================================
  function sceneRelizVaXulosa(u, bounds, o = {}) {
    chip(6, "Reliz: Tag, Describe va Arxiv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'ali@maintainer: ~/loyiha/ali (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git tag -a
      drawCommandLine("ali $ ", 'git tag -a v1.1 -m "Hisob 1.1 barqaror relizi"', 0.8, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("ali $ ", "git describe main", 3.2, 4.5, 4.7, tu, 130, 235);
      drawOutputLine("v1.1  # keyingi commitlarda: v1.1-2-g0a08e02", 5.0, tu, 130, 258, { color: C.green, weight: 700 });

      // 2-buyruq: git archive
      drawCommandLine("ali $ ", "git archive --prefix=hisob-1.1/ -o hisob-1.1.tar.gz v1.1", 6.5, 9.5, 9.7, tu, 130, 295);
      drawOutputLine("  # export-ignore bilan toza arxiv tayyorlandi (tar.gz)", 10.0, tu, 130, 318, { color: C.cyan, weight: 600 });

      // 3-buyruq: git shortlog
      drawCommandLine("ali $ ", "git shortlog v1.0..v1.1", 11.0, 13.0, 13.2, tu, 130, 355);
      drawOutputLine("Ali Valiyev (2):", 13.5, tu, 130, 378, { color: C.yellow, weight: 600 });
      drawOutputLine("      ayir(): izoh qo'shildi", 13.7, tu, 130, 396, { color: '#94a3b8' });
      drawOutputLine("Javohir Tursunov (2):", 14.0, tu, 130, 416, { color: C.green, weight: 600 });
      drawOutputLine("      bol() va daraja() funksiyalari", 14.2, tu, 130, 434, { color: '#94a3b8' });
      drawOutputLine("Sevara Nazarova (1):", 14.5, tu, 130, 454, { color: C.cyan, weight: 600 });
      drawOutputLine("      foiz() funksiyasi", 14.7, tu, 130, 472, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Maintainer Oltin Qoidalari", "eng muhim xulosalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Reliz Asboblari Majmuasi", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• git tag -a v1.1 : Rasmiy reliz uchun annotated teg (muallif, sana, imzo).", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• git describe    : Avtomatik o'suvchi build va versiya identifikatori.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• git archive     : Tarqatish uchun toza arxiv (tests/ va .gitattributes'siz).", 1030, 395, { size: 15, color: C.yellow, align: 'left' });
        text("• git shortlog    : Reliz xatida hissa qo'shuvchilar bo'yicha changelog.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Maintainerning 4 Ta Qoidasi", 1125, 500, C.green, { size: 16, mono: false });
        text("1. Har doim alohida topic branchda sinab ko'ring (main toza qolsin).", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("2. 'git diff main...topic' bilan faqat haqiqiy o'zgarishni tekshiring.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Tarixni toza saqlash uchun rebase + fast-forward yoki cherry-pick qiling.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("4. Rasmiy relizlarni annotated teglar bilan belgilab arxivlang.", 1030, 630, { size: 15, color: C.text, align: 'left' });
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
      { id: 'git_apply', fn: sceneGitApply },
      { id: 'git_am', fn: sceneGitAm },
      { id: 'remote_va_tekshirish', fn: sceneRemoteVaTekshirish },
      { id: 'integratsiya_usullari', fn: sceneIntegratsiyaUsullari },
      { id: 'reliz_va_xulosa', fn: sceneRelizVaXulosa }
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
