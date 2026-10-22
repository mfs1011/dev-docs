// anim.js — 33-bob: Loyihaga hissa qo'shish
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
  // 1-SAHNA: Hissa Qo‘shish Tamoyillari
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Hissa Qo‘shish Tamoyillari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — toza va sifatli commitlar tarixi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: sifatli commitlar tarixini ko'rish
      drawCommandLine("dev $ ", "git log --oneline -3", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("3d2247a feat(auth): OAuth2 token muddati tekshiruvi", 3.0, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("76e7dd8 fix(db): bo'sh satr xatosini bartaraf etish", 3.2, tu, 130, 252, { color: C.cyan, weight: 600 });
      drawOutputLine("2af676d docs(readme): loyihani o'rnatish qo'llanmasi", 3.4, tu, 130, 274, { color: '#94a3b8' });
      drawOutputLine("  # Har bir commit bitta mantiqiy masala va aniq tavsifga ega!", 3.7, tu, 130, 296, { color: C.mute });

      // 2-buyruq: git diff --check bilan whitespace tekshiruvi
      drawCommandLine("dev $ ", "git diff --check", 5.5, 7.5, 7.7, tu, 130, 335);
      drawOutputLine("  # Bo'sh joylar va ortiqcha whitespace xatolari yo'q: toza kod!", 8.0, tu, 130, 360, { color: C.green, weight: 700 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kCallout, () => {
        card(125, 395, 790, 255, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Hissa Qo'shuvchining Asosiy Qoidasi", 255, 430, C.cyan, { size: 16, mono: false });
        text("• Birlashtirish qiyinligini kim ko'taradi?", 150, 470, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  Git'da birlashtirish serverda emas, klientda bajariladi.", 150, 498, { size: 15, color: C.text, align: 'left' });
        text("• Yaxshi dasturchi maintainer uchun ishlarni qabul qilishni", 150, 526, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  imkon qadar oson va arzon qiladi:", 150, 550, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  1. Eng yangi kod ustiga quradi  2. Alohida topic branch ochadi", 150, 580, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  3. Atomik commitlar tayyorlaydi  4. Konfliktlarni o'zi yechadi.", 150, 608, { size: 15, color: C.cyan, align: 'left', weight: 600 });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Contributorning 4 Omili", "loyihaga ta'sir qiluvchi mezonlar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Jamoa Ko'lami va Huquqlar", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Faol ishtirokchilar soni: 2-3 kishimi yoki minglab dasturchilarmi?", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Push huquqi bormi? Ha bo'lsa — to'g'ridan-to'g'ri push; yo'q bo'lsa — Fork.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Ishlash tartibi: Markazlashganmi yoki integratsiya menejeri bormi?", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Hissa shakli: Pull Request orqalimi yoki Email patchlarmi?", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yaxshi Commit Talablari", 1115, 500, C.green, { size: 16, mono: false });
        text("• Bitta commit — faqat bitta mantiqiy o'zgarish bo'lishi lozim.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Sarlavha ~50 belgi, bo'sh qator, keyin batafsil tushuntirish.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Nega bunday qilindi va nimani o'zgartirdi — aniq yoritilishi shart.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Yuborishdan oldin 'git rebase -i' bilan tarixni sarhisob qiling.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Kichik Xususiy Jamoa
  // ==========================================
  function sceneKichikJamoaWorkflow(u, bounds, o = {}) {
    chip(2, "Kichik Xususiy Jamoa", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — fetch first to‘qnashuvi va yechimi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: push rad etilishi
      drawCommandLine("javohir $ ", "git push origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("To ~/loyiha/server.git", 3.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" ! [rejected]        main -> main (fetch first)", 3.2, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("error: serverdagi o'zgarishlar sizda hali yo'q!", 3.5, tu, 130, 274, { color: '#fca5a5' });

      // 2-buyruq: fetch va farqlarni tekshirish
      drawCommandLine("javohir $ ", "git fetch origin && git log --no-merges HEAD..origin/main", 5.0, 9.0, 9.2, tu, 130, 310);
      drawOutputLine("commit 6facfea (Sevara) Reset vazifasini qo'shish", 9.5, tu, 130, 335, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Javohir Sevaraning nima yozganini ko'rib chiqdi!", 9.8, tu, 130, 357, { color: C.mute });

      // 3-buyruq: merge va test
      drawCommandLine("javohir $ ", "git merge --no-edit origin/main && npm test", 11.5, 14.5, 14.7, tu, 130, 395);
      drawOutputLine("Merge made by the 'ort' strategy.", 15.0, tu, 130, 420, { color: C.green, weight: 600 });
      drawOutputLine("PASS: Barcha testlar muvaffaqiyatli o'tdi (14/14)", 15.3, tu, 130, 442, { color: C.green, weight: 700 });

      // 4-buyruq: qayta push
      drawCommandLine("javohir $ ", "git push origin main", 16.5, 18.5, 18.7, tu, 130, 480);
      drawOutputLine("   6facfea..9affa25  main -> main", 19.0, tu, 130, 505, { color: C.cyan, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Kichik Jamoa Sikli", "hammaning push huquqi bor muhit", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Klient Tomonidagi Mas'uliyat", 1145, 290, C.yellow, { size: 16, mono: false });
        text("• Subversion serverda avtomatik birlashtirardi, Git esa yo'q!", 1030, 335, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Turli fayllar bo'lsa ham, Git har doim klientda merge talab qiladi.", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("• Sababi: birlashtirilgan kod testdan o'tishi va sifat kafolatlanishi shart.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Server faqat xatosiz fast-forward o'zgarishlarni qabul qiladi.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Amaliy Qadamlar Ketma-ketligi", 1140, 500, C.green, { size: 16, mono: false });
        text("1. Topic branchda vazifani bajarish.", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("2. git fetch origin — serverdagi yangiliklarni yuklab olish.", 1030, 575, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("3. git log HEAD..origin/main — qaysi kodlar qo'shilganini ko'rish.", 1030, 605, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("4. Merge qilish, testlarni ishga tushirish va so'ng git push.", 1030, 630, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Himoyalangan Boshqaruv
  // ==========================================
  function sceneBoshqariladiganJamoa(u, bounds, o = {}) {
    chip(3, "Himoyalangan Boshqaruv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — feature branchlar va himoyalangan main',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: feature branchga push qilish
      drawCommandLine("sevara $ ", "git switch -c hisobot && git push -u origin hisobot", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine(" * [new branch]      hisobot -> hisobot", 4.0, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: refspec bilan boshqa nomli branchga push
      drawCommandLine("sevara $ ", "git push -u origin eksport:eksport-ish", 5.5, 8.5, 8.7, tu, 130, 265);
      drawOutputLine("   a622b1e..a45b6e5  eksport -> eksport-ish", 9.0, tu, 130, 290, { color: C.cyan, weight: 600 });
      drawOutputLine("  # Sevara Dildora ochgan 'eksport-ish' branchiga bog'landi", 9.3, tu, 130, 312, { color: C.mute });

      // 3-buyruq: ruxsatsiz main ga push rad etilishi
      drawCommandLine("sevara $ ", "git push origin hisobot:main", 11.0, 13.5, 13.7, tu, 130, 350);
      drawOutputLine("remote: main'ni faqat integratorlar yangilay oladi", 14.0, tu, 130, 375, { color: C.red, weight: 700 });
      drawOutputLine(" ! [remote rejected] hisobot -> main (hook declined)", 14.3, tu, 130, 397, { color: C.red, weight: 700 });

      // 4-buyruq: Integrator birlashtiradi
      drawCommandLine("ali $ ", "git merge --no-ff origin/hisobot && git merge --no-ff origin/eksport-ish", 16.0, 19.5, 19.7, tu, 130, 435);
      drawOutputLine("Merge made by the 'ort' strategy. (main yangilandi)", 20.0, tu, 130, 460, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Protected Branch va Parallel Oqim", "katta guruhlarda tartib saqlash", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Main Himoyasi va Integrator Vazifasi", 1165, 290, C.purple, { size: 16, mono: false });
        text("• main branchiga to'g'ridan-to'g'ri push taqiqlanadi (server hook / GitHub rule).", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Barcha ishlar alohida jamoaviy feature branchlarda boradi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Integrator kod review qilib, barcha tayyor tarmoqlarni main'ga qo'shadi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Bu tizim barqaror reliz chizig'ini xatolardan ishonchli saqlaydi.", 1030, 422, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Kichik Guruhlar Hamkorligi", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• Kichik guruhlar bir-biriga xalaqit bermasdan parallel ishlaydi.", 1030, 545, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("• Masalan: Sevara va Javohir 'hisobot'da, Sevara va Dildora 'eksport'da.", 1030, 575, { size: 15, color: C.yellow, align: 'left' });
        text("• Refspec (local:remote) orqali branch nomlari moslashuvchan boshqariladi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Jamoa qanchalik katta bo'lmasin, ish chiziqlari bir-birini to'xtatmaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Fork va request-pull
  // ==========================================
  function sceneForkVaRequestPull(u, bounds, o = {}) {
    chip(4, "Fork va request-pull", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — fork qilish va pull so‘rovi yuborish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: topic branch ochish va forkka push
      drawCommandLine("sevara $ ", "git switch -c tarix-limit origin/main", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("sevara $ ", "git push -u fork tarix-limit", 4.2, 6.5, 6.7, tu, 130, 235);
      drawOutputLine("To ../sevara-fork.git", 7.0, tu, 130, 260, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      tarix-limit -> tarix-limit", 7.3, tu, 130, 282, { color: C.green, weight: 600 });

      // 2-buyruq: git request-pull
      drawCommandLine("sevara $ ", "git request-pull origin/main fork tarix-limit", 8.8, 12.0, 12.2, tu, 130, 320);
      drawOutputLine("The following changes since commit f312ce5 are available at:", 12.5, tu, 130, 345, { color: C.cyan, weight: 600 });
      drawOutputLine("  ../sevara-fork.git tarix-limit", 12.8, tu, 130, 367, { color: C.yellow, weight: 700 });
      drawOutputLine("Sevara Nazarova (2):", 13.1, tu, 130, 389, { color: C.text, weight: 600 });
      drawOutputLine("      tarix() ga limit qo'shish", 13.4, tu, 130, 411, { color: '#94a3b8' });
      drawOutputLine("      Log chiqishini 20 dan 30 ga oshirish", 13.6, tu, 130, 433, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Ochiq Loyihalarga Hissa", "Fork va Pull Request mexanizmi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega Main Emas, Topic Branch?", 1145, 290, C.green, { size: 16, mono: false });
        text("• Fork'dagi o'zgarishlarni har doim yangi topic branchda yuboring.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Agar maintainer faqat bitta commitni olsa yoki taklif rad etilsa,", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("  lokal main branch toza qoladi va hech qanday orqaga qaytarish talab etilmaydi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Yangi vazifalar uchun yana toza origin/main'dan yangi branch ochiladi.", 1030, 422, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git request-pull Anatomiyasi", 1135, 500, C.cyan, { size: 16, mono: false });
        text("• Buyruq 3 ta parametr oladi: <boshlang'ich-commit> <URL> <branch>.", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("• Xat matnida: commitlar farqi, diffstat va repo manzili avtomatik chiqadi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Bu matn maintainerga email orqali yuboriladi yoki GitHub PR sifatida topshiriladi.", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Muhim: request-pull qilishdan oldin kodni albatta fork'ga push qiling!", 1030, 630, { size: 15, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Rebase va Konfliktlarni Yechish
  // ==========================================
  function sceneRebaseVaPatchNavbati(u, bounds, o = {}) {
    chip(5, "Rebase va Konfliktlarni Yechish", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — konfliktlarni hal qilish va rebase',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: fetch va rebase qilish
      drawCommandLine("sevara $ ", "git fetch origin && git rebase origin/main", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine("Auto-merging hisob.py", 4.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("CONFLICT (content): Merge conflict in hisob.py", 4.3, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("  # Maintainerning kodi oldinga ketgan: konfliktni o'zimiz yechamiz!", 4.6, tu, 130, 274, { color: C.yellow, weight: 600 });

      // 2-buyruq: konfliktni yechib davom etish
      drawCommandLine("sevara $ ", "git add hisob.py && git rebase --continue", 6.5, 9.5, 9.7, tu, 130, 310);
      drawOutputLine("Applying: tarix() ga limit qo'shish", 10.0, tu, 130, 335, { color: C.green, weight: 600 });
      drawOutputLine("Successfully rebased and updated refs/heads/tarix-limit.", 10.3, tu, 130, 357, { color: C.green, weight: 700 });

      // 3-buyruq: forkka majburan yangilash
      drawCommandLine("sevara $ ", "git push -f fork tarix-limit", 12.0, 14.5, 14.7, tu, 130, 395);
      drawOutputLine(" + 51893ee...8d34e12 tarix-limit -> tarix-limit (forced update)", 15.0, tu, 130, 420, { color: C.cyan, weight: 700 });
      drawOutputLine("  # PR avtomatik toza holatga keldi, maintainer oson merge qila oladi!", 15.3, tu, 130, 442, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Rebase va Patch Navbati", "maintainer uchun eng toza tarix", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Konfliktni O'z Zimmingizga Oling", 1160, 290, C.yellow, { size: 16, mono: false });
        text("• Maintainer bitta, hissa qo'shuvchilar esa ko'p.", 1030, 335, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Agar har kim konfliktli pull request yuborsa, loyiha to'xtab qoladi.", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("• Shuning uchun topic'ingizni yangi origin/main ustiga rebase qiling.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Maintainer sizning kodingizni tugmachani bir bosish bilan merge qilsin.", 1030, 422, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Patch Navbati (Patch Queue)", 1135, 500, C.cyan, { size: 16, mono: false });
        text("• Har bir alohida vazifa — mustaqil topic branchda.", 1030, 545, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("• Bir vazifaning ustiga boshqa ikkinchi vazifani qurmang!", 1030, 575, { size: 15, color: C.red, align: 'left', weight: 700 });
        text("• Yangi masala uchun yana toza origin/main'dan branch oching.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Shunda har bir taklif mustaqil ko'rib chiqiladi va bir-biriga bog'lanmaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Oltin Qoidalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Oltin Qoidalar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — yakuniy sifat tekshiruvi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git diff --check
      drawCommandLine("dev $ ", "git diff --check", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("  # Whitespace xatolari yo'q (toza kod)", 3.0, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: git log ko'rinishi
      drawCommandLine("dev $ ", "git log --oneline -2", 4.5, 6.5, 6.7, tu, 130, 265);
      drawOutputLine("51893ee feat: tarix() chiqishiga limit qo'shish", 7.0, tu, 130, 290, { color: C.cyan, weight: 700 });
      drawOutputLine("3300cb7 fix: xotira tozalashdagi xatolikni tuzatish", 7.3, tu, 130, 312, { color: C.green, weight: 600 });

      // 3-buyruq: testlarni tekshirish
      drawCommandLine("dev $ ", "npm test", 9.0, 11.0, 11.2, tu, 130, 350);
      drawOutputLine("PASS: 18 tests passed, 0 failed. All green!", 11.5, tu, 130, 375, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Contributorning Oltin Qoidalari", "eng muhim xulosalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Amaliy Odob-Axloq Qoidalari", 1130, 290, C.cyan, { size: 16, mono: false });
        text("1. Har doim alohida topic branchda ishlang (main'da emas).", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("2. Bitta commit — bitta mantiqiy masala (katta chalkash commit qilmang).", 1030, 365, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("3. Commit xabarini aniq va tushunarli yozing (nima va nima uchun).", 1030, 395, { size: 15, color: C.text, align: 'left' });
        text("4. Yuborishdan oldin 'git diff --check' bilan bo'sh joylarni tekshiring.", 1030, 422, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Maintainerga Hurmat Ko'rsating", 1135, 500, C.green, { size: 16, mono: false });
        text("• Ishingizni qabul qiluvchi uchun imkon qadar yengil qiling.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Konfliktlarni o'zingiz rebase orqali hal qiling.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Barcha testlar yashil ekanligiga to'liq ishonch hosil qiling.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Shunda sizning kodingiz eng yuqori ehtimol bilan qabul qilinadi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
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
      { id: 'kichik_jamoa_workflow', fn: sceneKichikJamoaWorkflow },
      { id: 'boshqariladigan_jamoa', fn: sceneBoshqariladiganJamoa },
      { id: 'fork_va_request_pull', fn: sceneForkVaRequestPull },
      { id: 'rebase_va_patch_navbati', fn: sceneRebaseVaPatchNavbati },
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
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
