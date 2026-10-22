// anim.js — 32-bob: Taqsimlangan workflow'lar
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
  // 1-SAHNA: Taqsimlangan Modellar Asoslari
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Taqsimlangan Modellar Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — teng huquqli klonlar tarmog‘i',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: klonlar yaratish
      drawCommandLine("admin $ ", "git clone server.git ali && git clone server.git jasur", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine("Cloning into 'ali'...", 4.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("Cloning into 'jasur'...", 4.2, tu, 130, 252, { color: '#94a3b8' });
      drawOutputLine("  # Har bir klon — to'laqonli mustaqil repozitoriy!", 4.5, tu, 130, 274, { color: C.green, weight: 600 });

      // 2-buyruq: remote sozlamalarini ko'rish
      drawCommandLine("admin $ ", "git remote -v", 6.5, 8.5, 8.7, tu, 130, 310);
      drawOutputLine("origin  .../server.git (fetch)", 9.0, tu, 130, 335, { color: C.cyan, weight: 600 });
      drawOutputLine("origin  .../server.git (push)", 9.2, tu, 130, 357, { color: C.cyan, weight: 600 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kCallout, () => {
        card(125, 395, 790, 255, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Uchta Keng Tarqalgan Paradigma", 245, 430, C.cyan, { size: 16, mono: false });
        text("1. Markazlashgan (Centralized Hub & Spoke):", 150, 470, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("   Hamma bitta umumiy repo'ga yozadi (korxona jamoalari uchun).", 150, 498, { size: 15, color: C.text, align: 'left' });
        text("2. Integratsiya menejeri (Integration-Manager / Fork & PR):", 150, 532, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("   Har kim o'z ommaviy repo'siga yozadi, rasmiy repoga maintainer oladi.", 150, 560, { size: 15, color: '#cbd5e1', align: 'left' });
        text("3. Diktator va leytenantlar (Dictator & Lieutenants):", 150, 594, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("   Minglab dasturchilar ishlaydigan ierarxik tizimlar (Linux yadrosi).", 150, 622, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Taqsimlangan Tizim Xususiyati", "har klon — ham tugun, ham markaz", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Teng Huquqlilik Qoidasi", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Git'da 'Asosiy repo' — bu texnik tushuncha emas, kelishuvdir!", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Har bir dasturchi to'liq tarix va commitlar bazasiga ega.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Tarmoqsiz ham lokal commit qilish, branch ochish va testlash mumkin.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Yozish huquqi esa server darajasida (SSH, ruxsatlar) belgilanadi.", 1030, 420, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Bir Repo — Ko'p Remote", 1115, 500, C.green, { size: 16, mono: false });
        text("• Bir repo ichida istalgancha remote ulash mumkin.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Bitta manzilga yozib, boshqa bir nechta hamkasblardan o'qish mumkin.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Bu moslashuvchanlik turli tashkiliy arxitekturalarni yaratishga yo'l ochadi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Git bitta qat'iy modelni majburlamaydi — tanlov jamoa qo'lida.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Markazlashgan Ish Oqimi
  // ==========================================
  function sceneMarkaziyWorkflow(u, bounds, o = {}) {
    chip(2, "Markazlashgan Ish Oqimi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — to‘qnashuv va fast-forward yangilanish',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: push rad etilishi
      drawCommandLine("malika $ ", "git push origin main", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("To .../server.git", 3.0, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" ! [rejected]        main -> main (fetch first)", 3.2, tu, 130, 252, { color: C.red, weight: 700 });
      drawOutputLine("error: failed to push some refs (remote contains work you don't have)", 3.5, tu, 130, 274, { color: '#fca5a5' });

      // 2-buyruq: fetch va merge
      drawCommandLine("malika $ ", "git fetch && git merge --no-edit origin/main", 5.5, 9.0, 9.2, tu, 130, 310);
      drawOutputLine("Merge made by the 'ort' strategy.", 9.5, tu, 130, 335, { color: C.green, weight: 600 });
      drawOutputLine("  # Jasurning Savat sahifasi va Malikaning To'lov sahifasi birlashdi!", 9.8, tu, 130, 357, { color: C.mute });

      // 3-buyruq: qayta muvaffaqiyatli push
      drawCommandLine("malika $ ", "git push origin main", 11.5, 13.5, 13.7, tu, 130, 395);
      drawOutputLine("To .../server.git", 14.0, tu, 130, 420, { color: '#94a3b8' });
      drawOutputLine("   8db562f..9d806bb  main -> main", 14.3, tu, 130, 442, { color: C.cyan, weight: 700 });

      // 4-buyruq: Jasur yangilanishi
      drawCommandLine("jasur $ ", "git pull --ff-only", 16.0, 18.0, 18.2, tu, 130, 480);
      drawOutputLine("Updating 8db562f..9d806bb (Fast-forward)", 18.5, tu, 130, 505, { color: C.green, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Markazlashgan Model Qoidalari", "bitta server — bir vaqtda hamkorlik", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Fast-Forward Himoyasi", 1120, 290, C.yellow, { size: 16, mono: false });
        text("• Git hech qachon hamkasblar ishini ustidan yozib yuborishga yo'l qo'ymaydi.", 1030, 335, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Agar serverdagi commit sizning tarixingizda bo'lmasa — push rad etiladi.", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("• Yechim: avval 'git fetch' qilib boshqalar kodini olasiz,", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  so'ng o'zingizda birlashtirib (merge yoki rebase), keyin push qilasiz.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Kichik va O'rta Jamoalar Uchun", 1145, 500, C.green, { size: 16, mono: false });
        text("• Bitta umumiy repo + Topic branchlar = eng qulay kompaniya amaliyoti.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Hech qanday murakkab serverlararo marshrutlash talab etilmaydi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• GitHub'dagi 'Shared Repository' modeli aynan shu tamoyilga asoslanadi.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("• Dasturchilar topic branchlarda ishlab, pull request orqali birlashadi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Integratsiya Menejeri (Fork & PR)
  // ==========================================
  function sceneIntegratsiyaMenejeri(u, bounds, o = {}) {
    chip(3, "Integratsiya Menejeri (Fork & PR)", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ommaviy nusxaga push va request-pull',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: hissa qo'shuvchi o'z ommaviy repo'siga push qiladi
      drawCommandLine("dilnoza $ ", "git push ommaviy sana-format", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("To ../dilnoza-ommaviy.git", 3.7, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine(" * [new branch]      sana-format -> sana-format", 4.0, tu, 130, 252, { color: C.green, weight: 600 });

      // 2-buyruq: git request-pull bilan xat matnini tayyorlash
      drawCommandLine("dilnoza $ ", "git request-pull origin/main ../dilnoza-ommaviy.git sana-format", 5.5, 9.0, 9.2, tu, 130, 290);
      drawOutputLine("The following changes since commit 175aace are available at:", 9.5, tu, 130, 315, { color: C.cyan, weight: 600 });
      drawOutputLine("  ../dilnoza-ommaviy.git sana-format", 9.8, tu, 130, 337, { color: C.yellow, weight: 700 });
      drawOutputLine("Dilnoza Rahimova (2):", 10.1, tu, 130, 359, { color: C.text, weight: 600 });
      drawOutputLine("      Sanani ISO 8601 formatida chiqarish", 10.4, tu, 130, 381, { color: '#94a3b8' });
      drawOutputLine("      Sana formati uchun testlar", 10.6, tu, 130, 403, { color: '#94a3b8' });

      // 3-buyruq: Maintainer ko'rib chiqib merge qiladi
      drawCommandLine("ali $ ", "git pull --no-ff ../dilnoza-ommaviy.git sana-format", 12.5, 16.0, 16.2, tu, 130, 440);
      drawOutputLine("Merge made by the 'ort' strategy.", 16.5, tu, 130, 465, { color: C.green, weight: 700 });
      drawOutputLine("  # Maintainer o'zgarishlarni rasmiy loyiha.git ga chiqardi!", 16.8, tu, 130, 487, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Integration-Manager Modeli", "ochiq manbali loyihalar standarti", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("6 Bosqichli Sikl", 1100, 290, C.green, { size: 16, mono: false });
        text("1. Hissa qo'shuvchi loyihani o'ziga Fork (nusxa) qiladi.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("2. O'z ommaviy nusxasiga yangi topic branch push qiladi.", 1030, 365, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("3. Maintainer'ga Pull Request (yoki request-pull) yuboradi.", 1030, 395, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("4. Maintainer kodni tekshirib, rasmiy (kanonik) repoga merge qiladi.", 1030, 420, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Asosiy Yutug'i: To'liq Mustaqillik", 1150, 500, C.cyan, { size: 16, mono: false });
        text("• Hech kim hech kimni kutmaydi: dasturchi o'z ishini davom ettiraveradi.", 1030, 545, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        text("• Maintainer esa o'ziga qulay vaqtda review qilib qabul qiladi.", 1030, 575, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Kanonik repoga begona odamlarga to'g'ridan-to'g'ri push ruxsati berilmaydi.", 1030, 605, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Bu ochiq kodli va jamoat loyihalarining asosiy poydevoridir.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Diktator va Leytenantlar
  // ==========================================
  function sceneDiktatorVaLeytenantlar(u, bounds, o = {}) {
    chip(4, "Diktator va Leytenantlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — quyi tizimlar va ko‘p bosqichli integratsiya',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: dasturchi etalon ustiga rebase qilib leytenantga topshiradi
      drawCommandLine("sardor $ ", "git fetch etalon && git rebase etalon/main", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine("Successfully rebased refs/heads/tcp-timeout.", 4.0, tu, 130, 230, { color: C.green, weight: 600 });
      drawCommandLine("sardor $ ", "git push leytenant tcp-timeout", 4.8, 6.8, 7.0, tu, 130, 255);
      drawOutputLine(" * [new branch]      tcp-timeout -> tcp-timeout", 7.3, tu, 130, 280, { color: C.cyan });

      // 2-buyruq: Leytenant Nodira merge qiladi
      drawCommandLine("nodira $ ", "git merge --no-ff origin/tcp-timeout", 8.5, 11.0, 11.2, tu, 130, 315);
      drawOutputLine("Merge made by the 'ort' strategy.", 11.5, tu, 130, 340, { color: C.green, weight: 600 });

      // 3-buyruq: Bosh diktator bir nechta leytenantlardan yig'adi
      drawCommandLine("diktator $ ", "git fetch --multiple tarmoq ekran", 13.0, 15.5, 15.7, tu, 130, 375);
      drawOutputLine("Fetching tarmoq... Fetching ekran...", 16.0, tu, 130, 400, { color: '#94a3b8' });
      drawCommandLine("diktator $ ", "git merge --no-ff tarmoq/main && git merge --no-ff ekran/main", 17.0, 20.0, 20.2, tu, 130, 425);
      drawOutputLine("Merge made by the 'ort' strategy.", 20.5, tu, 130, 450, { color: C.green, weight: 700 });
      drawOutputLine("  # Diktator yakuniy etalon.git ga push qiladi!", 20.8, tu, 130, 472, { color: C.yellow });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Ierarxik Taqsimot Tizimi", "Linux yadrosi va gigant loyihalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Ierarxiya Qatlamlari", 1120, 290, C.purple, { size: 16, mono: false });
        text("• Dasturchi -> Leytenant -> Diktator -> Etalon repo.", 1030, 335, { size: 17, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("• Diktator minglab alohida dasturchilar bilan bevosita gaplashmaydi.", 1030, 370, { size: 15, color: C.text, align: 'left' });
        text("• U faqat o'z quyi tizimlariga (tarmoq, ekran, xotira) mas'ul leytenantlar bilan ishlaydi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Ish yuklamasi bir nechta darajaga taqsimlanadi.", 1030, 422, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Dasturchi va Leytenant Vazifalari", 1160, 500, C.cyan, { size: 16, mono: false });
        text("• Dasturchi: Topic branchini etalon ustiga rebase qilib toza saqlaydi.", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Leytenant: Quyi tizim kodlarini o'zida yig'ib tekshiradi va birlashtiradi.", 1030, 575, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Diktator: Faqat yirik quyi tizim branchlarini umumiy etalonga merge qiladi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• --first-parent ko'rinishida loyihaning eng yuqori darajadagi rivoji aks etadi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Merge va Patch Workflow Farqi
  // ==========================================
  function sceneMergeVaPatchFarqi(u, bounds, o = {}) {
    chip(5, "Merge va Patch Workflow Farqi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — patchlarni yaratish va qo‘llash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: format-patch yaratish
      drawCommandLine("dilnoza $ ", "git format-patch -M origin/main..tarjima", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine("0001-Yordamchi-funksiya.patch", 4.0, tu, 130, 230, { color: C.cyan });
      drawOutputLine("0002-Tarjima-matnlari.patch", 4.2, tu, 130, 252, { color: C.cyan });
      drawOutputLine("  # Merge commitlar tushib qoladi, faqat toza patchlar hosil bo'ladi!", 4.5, tu, 130, 274, { color: C.yellow, weight: 600 });

      // 2-buyruq: git am bilan qo'llash
      drawCommandLine("ali $ ", "git switch -c dr/tarjima && git am -3 ../0*.patch", 6.5, 10.0, 10.2, tu, 130, 310);
      drawOutputLine("Applying: Yordamchi funksiya", 10.5, tu, 130, 335, { color: C.green, weight: 600 });
      drawOutputLine("Applying: Tarjima matnlari", 10.8, tu, 130, 357, { color: C.green, weight: 600 });

      // 3-buyruq: logda muallif va qo'llagan odamni ko'rish
      drawCommandLine("ali $ ", "git log --format='%h %an | %cn: %s' -2", 12.5, 15.0, 15.2, tu, 130, 395);
      drawOutputLine("1d33299 Dilnoza Rahimova | Ali Valiyev: Tarjima matnlari", 15.5, tu, 130, 420, { color: C.text, weight: 600 });
      drawOutputLine("6d4af5c Dilnoza Rahimova | Ali Valiyev: Yordamchi funksiya", 15.8, tu, 130, 442, { color: C.text, weight: 600 });
      drawOutputLine("  # %an: haqiqiy muallif, %cn: patchni repo'ga qo'shgan maintainer!", 16.2, tu, 130, 464, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.blue, "Merge vs Patch Workflow", "o‘zgarishlarni uzatish shakllari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Merge Workflow Xususiyatlari", 1145, 290, C.blue, { size: 16, mono: false });
        text("• Vositalar: git push, git fetch, git pull, git request-pull.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        text("• To'liq tarmoq tarixi, barcha oraliq commitlar va merge nuqtalari o'tadi.", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("• Jamoa ichida va Git hostinglarda eng keng qo'llaniladigan usul.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Doimiy hissa qo'shuvchilar uchun qulay.", 1030, 420, { size: 15, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Patch Workflow (Email)", 1115, 500, C.yellow, { size: 16, mono: false });
        text("• Vositalar: git format-patch, git send-email, git am -3.", 1030, 545, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• Merge commitlar patchga aylanmaydi — faqat chiziqli diff fayllar.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Ommaviy serverga push qilish imkoni bo'lmaganda yoki email orqali", 1030, 605, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  boshqariladigan loyihalarda (Git, Linux) qo'llaniladi.", 1030, 630, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Model Tanlash
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Model Tanlash", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ierarxiya va reliz xulosasi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: first-parent bilan yakuniy ko'rish
      drawCommandLine("admin $ ", "git log --format='%h %an: %s' --first-parent main", 0.8, 3.5, 3.7, tu, 130, 205);
      drawOutputLine("e628f5e Ali Valiyev: Merge branch 'ekran/main'", 4.0, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("8364f01 Ali Valiyev: Merge branch 'tarmoq/main'", 4.3, tu, 130, 252, { color: C.cyan, weight: 600 });
      drawOutputLine("58e354d Ali Valiyev: Yadro: xotira boshqaruvi", 4.6, tu, 130, 274, { color: '#94a3b8' });
      drawOutputLine("f35cb8d Ali Valiyev: Yadro: boshlang'ich versiya", 4.9, tu, 130, 296, { color: C.yellow, weight: 600 });

      // 2-buyruq: status va masofa tekshiruvi
      drawCommandLine("admin $ ", "git status -sb", 6.5, 8.5, 8.7, tu, 130, 335);
      drawOutputLine("## main...origin/main [up to date]", 9.0, tu, 130, 360, { color: C.green, weight: 700 });
      drawOutputLine("nothing to commit, working tree clean", 9.3, tu, 130, 382, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Qaysi Modelni Tanlash Kerak?", "loyiha hajmiga mos strategiya", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Amaliy Tanlov Tavsiyalari", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• 1–20 kishilik korporativ jamoalar: Markazlashgan (Shared Repo).", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Bitta server, topic branchlar va pull requestlar orqali tezkor nazorat.", 1030, 365, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Ochiq manbali (Open Source) loyihalar: Integratsiya menejeri (Fork & PR).", 1030, 395, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("  Hech kim kutmaydi, har kim o'z ommaviy nusxasidan taklif yuboradi.", 1030, 420, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Ulkan Loyihalar Uchun", 1115, 500, C.purple, { size: 16, mono: false });
        text("• 1000+ dasturchilar ekotizimi: Diktator va Leytenantlar.", 1030, 545, { size: 16, color: C.purple, align: 'left', weight: 700 });
        text("  Mas'uliyat sohalarga bo'linadi, diktator faqat tayyor yirik oqimlarni oladi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Git'ning arzon branchlari va moslashuvchan remotes tizimi", 1030, 605, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("  istalgan ko'lamdagi jamoani osonlik bilan birlashtira oladi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
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
      { id: 'markaziy_workflow', fn: sceneMarkaziyWorkflow },
      { id: 'integratsiya_menejeri', fn: sceneIntegratsiyaMenejeri },
      { id: 'diktator_va_leytenantlar', fn: sceneDiktatorVaLeytenantlar },
      { id: 'merge_va_patch_farqi', fn: sceneMergeVaPatchFarqi },
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
