// Git 09-bob videosi: "Tarixni ko'rish: log"
// Canvas render (1920x1080, 30fps) — GIT-VIDEO-USLUBI.md
(function () {
  const ctx = document.getElementById('c').getContext('2d');
  const kit = window.GITKIT(ctx);
  const {
    W, H, C, UI, MONO,
    clamp, P, lerp, eo, eio, eback, font, withA, rr,
    tw, text, bg, ring, burst, link, pill,
    fileChip, chip, panel, card
  } = kit;

  const TM = window.TM, NR = window.NR;

  // ==========================================
  // 1-SAHNA: Kirish va Loyihaning O'tmish Xaritasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("09-BOB · TARIXNI KO'RISH: LOG", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("git log: Loyihaning O'tmish Xaritasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Kim, qachon, nimani o'zgartirgan va nega — loyihaning to'liq solnomasi", 960, 415, { size: 26, color: C.mute });

        // Markaziy zanjir kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Tarixiy Ota-Ona Zanjiri (Parent Hierarchy)", 960, 530, C.blue, { size: 22 });

          card(410, 580, 240, 110, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
          pill("C1 (Root)", 530, 615, C.mute, { size: 18 });
          text("Ilk poydevor", 530, 655, { size: 15, color: C.mute });

          text("◄── parent", 700, 635, { size: 16, fam: MONO, color: C.yellow, weight: 700 });

          card(760, 580, 240, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("C2 (Feature)", 880, 615, C.blue, { size: 18 });
          text("Yangi funksiya", 880, 655, { size: 15, color: C.text });

          text("◄── parent", 1050, 635, { size: 16, fam: MONO, color: C.yellow, weight: 700 });

          card(1110, 580, 240, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("C3 (HEAD -> main)", 1230, 615, C.green, { size: 18 });
          text("Eng so'nggi holat", 1230, 655, { size: 15, color: C.green, weight: 600 });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Loyihaning Butun O'tmish Xaritasi", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: git log nima beradi?
      panel(100, 140, 840, 680, C.yellow, "git log Nima Beradi?", "yagona haqiqat manbai", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("To'liq O'tmish Solnomasi", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Loyiha boshlangan ilk kundan to hozirgacha bo'lgan barcha commitlar ro'yxati.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir o'zgarishning muallifi, aniq sanasi va nima uchun qilingani saqlanadi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("100% Xavfsiz Tekshiruv (Read-Only)", 265, 470, C.green, { size: 16, mono: false });
        text("• git log hech narsani o'zgartirmaydi, hech narsani o'chirmaydi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Tarixni xohlagan parametrlarda qo'rqmasdan tahlil qilish mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarishlarga Qaytish Kaliti", 235, 655, C.mute, { size: 16, mono: false });
        text("• Har bir commitning noyob SHA-1 xesh kaliti ko'rinadi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Shu kalit orqali istalgan paytda o'sha paytdagi holatga qaytish mumkin.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 ta o'lcham
      panel(980, 140, 840, 680, C.blue, "git log ning 3 Asosiy O'lchami", "moslashuvchan qurol imkoniyatlari", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · Ko'rinish Formatlari (Display)", 1170, 290, C.blue, { size: 16, mono: false });
        text("• Har bir commit ekranda qanday formatda chiqishi:", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("  --oneline, --graph, --decorate, maxsus formatlar (--pretty).", 1030, 375, { size: 17, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("2 · Tarkib Tafsilotlari (Content)", 1160, 470, C.purple, { size: 16, mono: false });
        text("• Commit bilan birga uning ichidagi o'zgarishlarni ko'rish:", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("  --stat (qatorlar statistikasi), -p (to'liq kod diff yamoqlari).", 1030, 555, { size: 17, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Filtrlash va Saralash (Filtering)", 1165, 655, C.green, { size: 16, mono: false });
        text("• Minglab commitlar ichidan aynan keraklisini qidirib topish:", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  --author, --since, --grep va mashhur -S (pickaxe kod qidiruvi).", 1030, 740, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega Tarix Orqaga O'qiladi?
  // ==========================================
  function sceneOrqagaYurish(u, bounds, o = {}) {
    chip(2, "Nega Tarix Orqaga O'qiladi?", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Commitning ota-onasi
      panel(100, 140, 840, 680, C.purple, "Commit Faqat Ota-Onasini Biladi", "bolalarini emas, faqat o'tmishini", kBase, kBase);

      const kP1 = P(u, 0.6, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(125, 255, 790, 220, { fill: 'rgba(11,16,32,0.95)', col: C.purple });
        pill("Commit Obyektining Ichki Tuzilishi", 270, 290, C.purple, { size: 16, mono: false });
        text("tree 185155ca5c6cfa20...       (loyihaning to'liq surati)", 150, 335, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("parent 7407e42d087b815d...     (oldingi ota commit havolasi)", 150, 375, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("author Ali Valiyev <ali@...>   (muallif va vaqt tamg'asi)", 150, 415, { size: 16, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(125, 500, 790, 285, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Nega O'zgarmas (Immutable)?", 220, 535, C.purple, { size: 16, mono: false });
        text("• Commit xeshi uning mazmuni va ota-onasi asosida hisoblanadi.", 150, 580, { size: 17, color: C.text, align: 'left' });
        text("• Yangi kommit yaratilayotganda kelajakdagi bolalari hali mavjud emas!", 150, 620, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Shuning uchun keyinchalik ham kommitga yangi havola qo'shib bo'lmaydi.", 150, 660, { size: 17, color: C.text, align: 'left' });
        text("Yagona yo'l: Hozirgi nuqtadan o'tmishga tomon harakatlanish!", 150, 710, { size: 17, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      // O'ng panel: HEAD dan harakatlanish
      panel(980, 140, 840, 680, C.blue, "HEAD dan Boshlab Orqaga Yurish", "eng yangidan eng eskisiga", kBase, kBase);

      const kS1 = P(u, 7.5, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Teskari Xronologik Tartib", 1140, 290, C.blue, { size: 16, mono: false });
        text("1. Git avval HEAD ko'rsatayotgan commitni o'qiydi (eng oxirgisi).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("2. Uning 'parent' havolasi orqali bitta orqadagi commitga o'tadi.", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("3. Jarayon ilk boshlang'ich (root) commitgacha takrorlanadi.", 1030, 415, { size: 17, color: C.blue, align: 'left', weight: 600 });
        text("Natijada ekranda ENG YANGI commit har doim eng tepada chiqadi!", 1030, 460, { size: 17, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kS2 = P(u, 10.5, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Grafik Zanjir Ko'rinishi", 1120, 555, C.green, { size: 16, mono: false });
        text("HEAD -> [Commit D] ──► [Commit C] ──► [Commit B] ──► [Commit A]", 1030, 600, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Tarix chiziqli bo'lishi yoki branchlar orqali tarmoqlanishi mumkin.", 1030, 645, { size: 16, color: C.text, align: 'left' });
        text("• Merge commitlarida 2 ta ota (parent) bo'ladi — ikkala tarmoq o'qiladi.", 1030, 685, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• git log aynan shu to'rni mukammal saralab taqdim etadi.", 1030, 725, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Ko'rinish Formatlari: oneline va graph
  // ==========================================
  function sceneFormatlar(u, bounds, o = {}) {
    chip(3, "Ko'rinish Formatlari: oneline va graph", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: git log --oneline
      panel(100, 140, 840, 680, C.yellow, "Ixcham Qator: --oneline", "har bir commit bitta qatorda", kBase, kBase);

      const kF1 = P(u, 0.6, 0.5);
      withA(kF1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kF1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(11,16,32,0.95)', col: C.yellow });
        pill("$ git log --oneline", 220, 290, C.yellow, { size: 16, mono: false });
        text("2cc991b Ombor: o'chirish xatti-harakati hujjatlashtirildi", 150, 335, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("3c9796e Kitob: matn ko'rinishi (__str__) qo'shildi", 150, 375, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("7e654d9 Hisob: yangi testlar va tekshiruvlar", 150, 415, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("41bb09e Dastlabki commit: loyiha strukturasi", 150, 455, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kF2 = P(u, 3.5, 0.5);
      withA(kF2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kF2)) * 16);
        card(125, 520, 790, 265, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Nima Uchun Juda Qulay?", 230, 555, C.yellow, { size: 16, mono: false });
        text("• 7 belgili qisqa xesh va birinchi qator xabari.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• Yuzlab commitlar ichidan keraklisini ko'zdan kechirish o'ta tezlashadi.", 150, 640, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• -n 5 opsiyasi bilan birlashtirib, oxirgi 5 ta commitni ko'rish mumkin.", 150, 680, { size: 16, color: C.cyan, align: 'left' });
        text("$ git log --oneline -5", 150, 725, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      // O'ng panel: git log --graph
      panel(980, 140, 840, 680, C.green, "Tarmoqlar Daraxti: --graph", "branchlar va birlashish xaritasi", kBase, kBase);

      const kG1 = P(u, 7.5, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 280, { fill: 'rgba(11,16,32,0.95)', col: C.green });
        pill("$ git log --graph --oneline --all --decorate", 1240, 290, C.green, { size: 16, mono: false });

        text("*   2cc991b (HEAD -> main) Merge branch 'quickfix'", 1030, 340, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("|\\  ", 1030, 375, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("| * 9f9283d (quickfix) muhim tuzatish kiritildi", 1030, 410, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("* | 3c9796e Asosiy drayver yangilandi", 1030, 445, { size: 15, fam: MONO, color: C.blue, align: 'left' });
        text("|/  ", 1030, 480, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("* 7e654d9 Umumiy ajdod commit", 1030, 515, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 10.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 560, 790, 225, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Professional Dasturchilar Alias'i", 1170, 595, C.green, { size: 16, mono: false });
        text("• --all        -> barcha local va remote branchlarni ko'rsatadi.", 1030, 640, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("• --decorate   -> qaysi commitda qaysi teg yoki branch turganini ko'rsatadi.", 1030, 675, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("Buni ko'pincha 'git adog' yoki 'git l' deb alias qilib olinadi!", 1030, 720, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Tarkibni Ko'rish: stat va patch (-p)
  // ==========================================
  function sceneTarkib(u, bounds, o = {}) {
    chip(4, "Tarkibni Ko'rish: stat va patch (-p)", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: git log --stat
      panel(100, 140, 840, 680, C.blue, "Fayllar Statistikasi: --stat", "qancha qator o'zgargani", kBase, kBase);

      const kT1 = P(u, 0.6, 0.5);
      withA(kT1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("$ git log --stat -1", 210, 290, C.blue, { size: 16, mono: false });
        text("commit 3c9796e (Ali Valiyev, 2026-10-20)", 150, 335, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        text(" src/kutubxona/kitob.py | 12 +++++++++---", 150, 375, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text(" test/test_kitob.py     |  8 ++++++++", 150, 415, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text(" 2 files changed, 17 insertions(+), 3 deletions(-)", 150, 460, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kT2 = P(u, 3.5, 0.5);
      withA(kT2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kT2)) * 16);
        card(125, 520, 790, 265, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Qachon Ishlatiladi?", 210, 555, C.blue, { size: 16, mono: false });
        text("• Commitning umumiy hajmini tezkor baholash uchun.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• Kodning ichiga kirmasdan, qaysi modullar yangilanganini ko'rish.", 150, 640, { size: 17, color: C.blue, align: 'left', weight: 600 });
        text("• Qisqaroq ko'rinish uchun '--shortstat' yoki faqat nomlar uchun '--name-status'.", 150, 680, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: git log -p (patch)
      panel(980, 140, 840, 680, C.green, "To'liq Kod Diff: -p (Patch)", "har bir qator o'zgarishi", kBase, kBase);

      const kP1 = P(u, 7.5, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 260, { fill: 'rgba(11,16,32,0.95)', col: C.green });
        pill("$ git log -p -1", 1100, 290, C.green, { size: 16, mono: false });
        text("diff --git a/src/kitob.py b/src/kitob.py", 1030, 335, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        text("@@ -10,6 +10,8 @@ def nomini_ol(self):", 1030, 370, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("-    return self.nom", 1030, 410, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 700 });
        text("+    # nomni katta harfda qaytarish", 1030, 445, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("+    return self.nom.upper()", 1030, 480, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kP2 = P(u, 10.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 540, 790, 245, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Kod Tahlilining Eng Chuqur Usuli", 1180, 575, C.green, { size: 16, mono: false });
        text("• Xuddi har bir commit uchun 'git diff' qilingandek to'liq tafsilot.", 1030, 620, { size: 17, color: C.text, align: 'left' });
        text("• Biror fayl tarixini ko'rish: $ git log -p -- src/kitob.py", 1030, 660, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Aniq bir qator qachon va nega o'zgarganini fosh etadi.", 1030, 700, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Kuchli Qidiruv va Filtrlar
  // ==========================================
  function sceneQidiruvVaFiltr(u, bounds, o = {}) {
    chip(5, "Kuchli Qidiruv va Saralash", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Metama'lumot bo'yicha filtr
      panel(100, 140, 840, 680, C.purple, "Muallif, Vaqt va Xabar Bo'yicha", "minglab commitlar ichidan saralash", kBase, kBase);

      const kS1 = P(u, 0.6, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Muallif bo'yicha: --author", 230, 290, C.purple, { size: 16, mono: false });
        text("$ git log --author='Ali'", 150, 335, { size: 18, fam: MONO, color: C.cyan, align: 'left' });
        text("Faqat ko'rsatilgan dasturchi yozgan commitlarni chiqaradi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 2.8, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Vaqt oralig'i: --since va --until", 240, 470, C.blue, { size: 16, mono: false });
        text("$ git log --since='2.weeks' --until='yesterday'", 150, 515, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("Aniq sana (2026-10-01) yoki nisbiy vaqt ('3.days.ago') berish mumkin.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kS3 = P(u, 5.0, 0.5);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Commit xabari bo'yicha: --grep", 240, 655, C.mute, { size: 16, mono: false });
        text("$ git log --grep='xavfsizlik'", 150, 700, { size: 18, fam: MONO, color: C.green, align: 'left' });
        text("Xabarida ko'rsatilgan so'z uchragan commitlarni topadi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Pickaxe (-S) - Kod ichidan qidiruv
      panel(980, 140, 840, 680, C.green, "Detektiv Qurol: git log -S (Pickaxe)", "kodning ichidagi o'zgarishni topish", kBase, kBase);

      const kK1 = P(u, 7.5, 0.5);
      withA(kK1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kK1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Katta -S ning O'ziga Xosligi", 1140, 290, C.green, { size: 16, mono: false });
        text("$ git log -S 'hisobla_soliq'", 1030, 335, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("• Bu parametr commit xabarini emas, KODNING O'ZINI qidiradi!", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("• Shu funksiya qaysi commitda birinchi bor kiritilgan yoki o'chirilganini topadi.", 1030, 415, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Regressiya va xatolarni qidirishda tengsiz qurol.", 1030, 460, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kK2 = P(u, 10.5, 0.5);
      withA(kK2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kK2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("git show: Muayyan Bitta Obyekt", 1160, 555, C.blue, { size: 16, mono: false });
        text("$ git show 3c9796e", 1030, 600, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        text("• Aniq bitta commit haqidagi barcha ma'lumot va uning diff'ini ko'rsatadi.", 1030, 645, { size: 16, color: C.text, align: 'left' });
        text("• Shuningdek teglarni, daraxtlarni va bloblarni ham ochib beradi.", 1030, 685, { size: 16, color: C.mute, align: 'left' });
        text("• git log o'tmish xaritasi bo'lsa, git show — aniq manzil mikroskopidir.", 1030, 725, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: git log Buyruqlari Xaritasi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 ustunli tavsiyalar
      const kC1 = P(u, 0.5, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        panel(100, 140, 546, 500, C.yellow, "1 · Kundalik Ko'rish", "oneline va graph", kC1, kC1);
        card(120, 255, 506, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tezkor Xulosa", 200, 290, C.yellow, { size: 16, mono: false });
        text("Katta jamoalarda doimo", 140, 335, { size: 17, color: C.text, align: 'left' });
        text("'--oneline --graph' orqali", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("tarix daraxtini ko'zdan kechiring.", 140, 400, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 2.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        panel(686, 140, 546, 500, C.blue, "2 · Chuqur Tahlil", "stat va patch (-p)", kC2, kC2);
        card(706, 255, 506, 170, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Kod Kesimida", 780, 290, C.blue, { size: 16, mono: false });
        text("Qaysi qatorda xato ketganini", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("aniqlashda '-p' va '-S' qurollaridan", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("unumli foydalaning.", 726, 400, { size: 16, color: C.blue, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 4.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        panel(1272, 140, 546, 500, C.green, "3 · Aniq Manzil", "git show", kC3, kC3);
        card(1292, 255, 506, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yakka Commit", 1370, 290, C.green, { size: 16, mono: false });
        text("Kerakli commit xeshini topgach,", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("'git show <hash>' bilan", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("uni to'liq tahlil qiling.", 1312, 400, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 6.5, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Yaxshi Commit Yozish Madaniyati", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 10-bobda loyihaning tarixi chiroyli va tushunarli bo'lishi uchun commitlarni qanday yozishni o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("git log — o'tmishni unutmaslik va loyihani ishonch bilan oldinga boshlash kalitidir.", 960, 800, { size: 18, color: C.mute });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'orqaga_yurish', fn: sceneOrqagaYurish },
      { id: 'formatlar', fn: sceneFormatlar },
      { id: 'tarkib', fn: sceneTarkib },
      { id: 'qidiruv_va_filtr', fn: sceneQidiruvVaFiltr },
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

  // Poster uchun qulay kadr (1-sahna taqqoslashi)
  window.renderPoster = function () {
    bg();
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
