// Git 11-bob videosi: "Bekor qilish: amend va restore"
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

  function code(str, x, y, opt = {}) {
    text(str, x, y, {
      size: opt.size || 16,
      fam: MONO,
      color: opt.color || C.cyan,
      weight: opt.weight || 500,
      align: 'left'
    });
  }

  // ==========================================
  // 1-SAHNA: Kirish va Bekor Qilish Xaritasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("11-BOB · BEKOR QILISH: AMEND VA RESTORE", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Gitda Xatolarni Orqaga Qaytarish", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Xato qayerda ekaniga qarab tegishli bekor qilish vositalari", 960, 415, { size: 26, color: C.mute });

        // Markaziy 3 hudud kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("3 Hududdagi Bekor Qilish Amallari", 960, 530, C.blue, { size: 22 });

          card(400, 580, 340, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Oxirgi Commit", 570, 615, C.yellow, { size: 18 });
          code("git commit --amend", 570, 655, { size: 15, color: C.yellow });

          card(790, 580, 340, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("Index (Staging)", 960, 615, C.green, { size: 18 });
          code("git restore --staged", 960, 655, { size: 15, color: C.green });

          card(1180, 580, 340, 110, { fill: 'rgba(239,68,68,0.10)', col: C.red });
          pill("Working Tree", 1350, 615, C.red, { size: 18 });
          code("git restore <fayl>", 1350, 655, { size: 15, color: C.red });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Bekor Qilish Xaritasi va 3 Hudud", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Xato qayerda sodir bo'ldi?
      panel(100, 140, 840, 680, C.yellow, "Xato Qayerda Sodir Bo'ldi?", "har bir hudud o'z buyrug'iga ega", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 Ta Hudud Chegarasi", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Oxirgi commitda: Fayl unutilgan yoki xabarda imlo xatosi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Index hududida: Keraksiz fayl tasodifan 'git add' bilan qo'shilgan.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git status O'zi Yo'l Ko'rsatadi", 250, 470, C.green, { size: 16, mono: false });
        text("• git status o'zi bekor qilish yo'llarini qavs ichida eslatib turadi:", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("  'use \"git restore --staged <file>...\" to unstage'", 150, 555, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarishlar Xavfsizligi", 230, 655, C.mute, { size: 16, mono: false });
        text("• Indexdagi bekor qilishlar xavfsiz (fayl diskda butun saqlanadi).", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Working treedagi bekor qilish esa xavfli — kod qaytarilmas yo'qoladi!", 150, 740, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: 3 ta asosiy vosita
      panel(980, 140, 840, 680, C.blue, "Asosiy Bekor Qilish Buyruqlari", "kundalik amaliyotda eng ko'p ishlatiladiganlar", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · commit --amend (Commit uchun)", 1170, 290, C.yellow, { size: 16, mono: false });
        text("• Oxirgi commitni yangi o'zgarishlar bilan almashtirish.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("  $ git add unutilgan.py && git commit --amend", 1030, 375, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · restore --staged (Index uchun)", 1170, 470, C.green, { size: 16, mono: false });
        text("• Faylni indexdan chiqarish (unstage), faylga tegmasdan.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("  $ git restore --staged <fayl>  # 100% xavfsiz!", 1030, 555, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("3 · restore <fayl> (Working Tree)", 1160, 655, C.red, { size: 16, mono: false });
        text("• Fayldagi saqlanmagan barcha tahrirlarni butunlay tashlash.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  $ git restore <fayl>  # diqqat: o'zgarish yo'qoladi!", 1030, 740, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: commit --amend
  // ==========================================
  function sceneAmend(u, bounds) {
    chip(2, "commit --amend: Oxirgi Commitni Yangilash", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Unutilgan fayl yoki xabar
      panel(100, 140, 840, 680, C.yellow, "Unutilgan Fayl yoki Xatoni Tuzatish", "yangi commit yaratmasdan tarixni toza saqlash", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 250, { fill: 'rgba(11,16,32,0.94)', col: C.yellow, lw: 2 });
        pill("Terminal: Unutilgan Faylni Qo'shish", 270, 290, C.yellow, { size: 16, mono: false });
        code("$ git commit -m \"Ko'paytmani hisoblash\"", 150, 335, { size: 16, color: C.yellow });
        code("# hisob.py fayli qolib ketganini ko'rdingiz!", 150, 375, { size: 15, color: C.mute });
        code("$ git add hisob.py", 150, 415, { size: 16, color: C.cyan });
        code("$ git commit --amend --no-edit", 150, 455, { size: 16, color: C.green, weight: 600 });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 525, 790, 260, { fill: 'rgba(255,255,255,0.025)', col: C.cyan });
        pill("Foydali Amend Opsiyalari", 230, 560, C.cyan, { size: 16, mono: false });
        text("• --no-edit: Xabarni o'zgartirmasdan faqat fayllarni qo'shish.", 150, 610, { size: 17, color: C.text, align: 'left' });
        text("• -m \"yangi xabar\": Sarlavha yoki tanadagi imlo xatosini tuzatish.", 150, 655, { size: 17, color: C.yellow, align: 'left' });
        text("• --only: Boshqa stage qilingan fayllarni aralashtirmaslik.", 150, 700, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• --reset-author: Muallif ma'lumotlari va vaqt tamg'asini yangilash.", 150, 740, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ichki mexanizm va oltin qoida
      panel(980, 140, 840, 680, C.red, "Ichki Mexanizm va Oltin Qoida", "amend almashtiradi, tuzatmaydi", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(180,108,255,0.06)', col: C.purple });
        pill("Amend — Almashtirish Demakdir!", 1160, 290, C.purple, { size: 16, mono: false });
        text("• Amend eski commitni tuzatmaydi, butunlay yangi commit yaratadi.", 1030, 340, { size: 17, color: C.text, align: 'left' });
        text("• Yangi commit eskisining otasiga ulanadi, eskisiga emas!", 1030, 385, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Hash o'zgaradi, lekin eski commit hali reflogda saqlanadi.", 1030, 430, { size: 17, color: C.text, align: 'left' });
        text("• Amendni bekor qilish: git reset --soft HEAD@{1}", 1030, 470, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 525, 790, 260, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("QAT'IY QOIDA: Push Bo'lsa Amend Qilmang!", 1210, 560, C.red, { size: 16, mono: false });
        text("• Faqat hali lokal, hech qayerga yuborilmagan commitni amend qiling.", 1030, 610, { size: 17, color: C.text, align: 'left' });
        text("• Push qilingan commitni amend qilsangiz, tarix ajraladi (ahead/behind).", 1030, 655, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Hamkasblaringiz bilan ma'nosiz sun'iy konfliktlar yuzaga keladi!", 1030, 700, { size: 17, color: C.yellow, align: 'left' });
        text("• Push qilingan xatoni yangi commit yoki 'git revert' bilan tuzating.", 1030, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git restore --staged
  // ==========================================
  function sceneUnstage(u, bounds) {
    chip(3, "git restore --staged: Indexdan Chiqarish", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Muammo va yechim
      panel(100, 140, 840, 680, C.green, "Staging Hududidan Chiqarish (Unstage)", "keraksiz faylni commitga kiritmaslik", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Muammo: Tasodifiy git add .", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Ikki mustaqil faylni alohida commit qilmoqchi edingiz.", 150, 340, { size: 17, color: C.text, align: 'left' });
        text("• Lekin 'git add .' barcha o'zgarishlarni bittada stage qilib qo'ydi.", 150, 385, { size: 17, color: C.text, align: 'left' });
        text("• Yoki maxfiy sozlama fayli (.env) xatolik bilan indexga tushdi.", 150, 430, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(52,211,153,0.06)', col: C.green, lw: 2 });
        pill("Yechim: git restore --staged <fayl>", 260, 550, C.green, { size: 16, mono: false });
        code("$ git restore --staged README.md", 150, 600, { size: 16, color: C.yellow });
        text("• Fayl indexdan chiqarildi (unstage bo'ldi).", 150, 645, { size: 17, color: C.text, align: 'left' });
        text("• 100% Xavfsiz: Diskdagi o'zgarishlar o'z joyida to'liq saqlanadi!", 150, 690, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Bu 'git add' ning aynan teskarisi: HEAD dan indexga tiklaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Qulayliklar va birinchi commit
      panel(980, 140, 840, 680, C.blue, "Qulayliklar va Ilk Commit Holati", "turli vaziyatlarda to'g'ri qo'llash", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("Butun Papkani Chiqarish", 1150, 290, C.cyan, { size: 16, mono: false });
        code("$ git restore --staged .", 1030, 340, { size: 16, color: C.yellow });
        text("• Joriy papkadagi barcha stage qilingan fayllarni chiqaradi.", 1030, 385, { size: 17, color: C.text, align: 'left' });
        code("$ git restore --staged :/", 1030, 425, { size: 16, color: C.yellow });
        text("• Butun repo ildizidagi barcha fayllarni bir zumda unstage qiladi.", 1030, 465, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(255,255,255,0.025)', col: C.yellow });
        pill("Hali Ilk Commit Bo'lmagan Repoda", 1180, 550, C.yellow, { size: 16, mono: false });
        text("• Yangi repoda hali HEAD yo'q bo'lsa:", 1030, 600, { size: 17, color: C.text, align: 'left' });
        code("$ git restore --staged app.py  -> fatal: could not resolve 'HEAD'", 1030, 640, { size: 15, color: C.red });
        text("• Bunday paytda git status boshqa maslahat beradi:", 1030, 680, { size: 17, color: C.text, align: 'left' });
        code("$ git rm --cached app.py", 1030, 715, { size: 16, color: C.green, weight: 600 });
        text("• Fayl indexdan o'chadi va yana untracked holatiga qaytadi.", 1030, 755, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git restore (Working Tree)
  // ==========================================
  function sceneRestoreWorktree(u, bounds) {
    chip(4, "git restore: Diskdagi O‘zgarishni Tashlash", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Diskdagi o'zgarishni tashlash
      panel(100, 140, 840, 680, C.red, "Fayldagi O'zgarishni Tashlash", "ishchi papkani oxirgi holatga qaytarish", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 230, { fill: 'rgba(11,16,32,0.94)', col: C.cyan, lw: 2 });
        pill("Terminal: git restore <fayl>", 250, 290, C.cyan, { size: 16, mono: false });
        code("$ git status -s  -> M app.py", 150, 335, { size: 16, color: C.yellow });
        code("$ git restore app.py", 150, 375, { size: 16, color: C.red, weight: 600 });
        code("$ git status -s  -> (toza, hech narsa yo'q)", 150, 415, { size: 15, color: C.green });
        text("• Fayl index'dagi (oxirgi git add paytidagi) holatiga qaytadi.", 150, 455, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 505, 790, 280, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("QAT'IY OGOHLANTIRISH: Xavfli Buyruq!", 270, 540, C.red, { size: 16, mono: false });
        text("• Bu buyruq o'sha fayldagi barcha saqlanmagan tahrirlarni o'chiradi!", 150, 590, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("• Commit qilinmagan o'zgarishlar Git xotirasida saqlanmagan.", 150, 635, { size: 17, color: C.text, align: 'left' });
        text("• O'chirilgach, ularni qaytarib olishning MUTLAQO iloji yo'q!", 150, 680, { size: 17, color: C.yellow, align: 'left' });
        text("• O'zgarishlar kerak emasligiga 100% ishonmasangiz — ishlatmang.", 150, 725, { size: 17, color: C.text, align: 'left' });
        text("• Ehtiyotkor yo'l: Avval 'git stash' bilan saqlab qo'ying.", 150, 760, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ilg'or variantlar
      panel(980, 140, 840, 680, C.blue, "Ilg'or Variantlar va Bo'laklash", "aniq manba va hunk bo'yicha tiklash", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 250, { fill: 'rgba(255,209,102,0.06)', col: C.yellow });
        pill("Faylni To'liq HEAD Commitga Tenglash", 1200, 290, C.yellow, { size: 16, mono: false });
        code("$ git restore --source=HEAD --staged --worktree README.md", 1030, 335, { size: 14, color: C.yellow });
        code("qisqa shakli: git restore -s@ -SW README.md", 1030, 375, { size: 15, color: C.cyan, weight: 600 });
        text("• Faylni ham indexda, ham diskda oxirgi commit holatiga qaytaradi.", 1030, 420, { size: 17, color: C.text, align: 'left' });
        text("• Barcha yangi va stage qilingan tahrirlar to'liq bekor qilinadi.", 1030, 465, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 525, 790, 260, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("Bo'laklab Bekor Qilish: restore -p", 1180, 560, C.green, { size: 16, mono: false });
        code("$ git restore -p app.py", 1030, 610, { size: 16, color: C.yellow });
        code("(1/2) Discard this hunk from worktree [y,n,q,a,d,e,?]? y", 1030, 655, { size: 15, color: C.red });
        text("• Fayl ichidagi faqat keraksiz debug qatorlarini tashlash.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Foydali yozilgan yangi kod esa diskda butun saqlab qolinadi!", 1030, 740, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: checkout va restore Farqi
  // ==========================================
  function sceneEskiYol(u, bounds) {
    chip(5, "Eski Usul: checkout va restore Farqi", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // Chap panel: Eski buyruqlar va xavflar
      panel(100, 140, 840, 680, C.yellow, "Eski Buyruqlar: checkout va reset", "tarixiy meros va uning chalkashliklari", kBox, kBox);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(255,255,255,0.025)', col: C.yellow });
        pill("Eski Git Maqolalaridagi Buyruqlar", 260, 290, C.yellow, { size: 16, mono: false });
        code("git checkout -- <fayl>   ->  git restore <fayl>", 150, 340, { size: 15, color: C.yellow });
        code("git reset HEAD <fayl>     ->  git restore --staged <fayl>", 150, 380, { size: 15, color: C.green });
        code("git checkout -p           ->  git restore -p", 150, 420, { size: 15, color: C.cyan });
        text("• Internetdagi eski qo'llanmalarda hali ham ko'p uchraydi.", 150, 460, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.5, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 515, 790, 270, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Nega checkout Xavfli Edi?", 230, 550, C.red, { size: 16, mono: false });
        text("• checkout juda ko'p vazifali edi: ham branch almashar, ham fayl tiklardi.", 150, 600, { size: 17, color: C.text, align: 'left' });
        text("• Agar fayl nomi bilan bir xil branch bo'lsa (masalan: app.py branchi):", 150, 645, { size: 17, color: C.yellow, align: 'left' });
        code("$ git checkout app.py  -> Switched to branch 'app.py'!", 150, 685, { size: 15, color: C.red, weight: 600 });
        text("• Faylni tiklash o'rniga kutilmaganda branch almashtirib qo'yardi!", 150, 725, { size: 17, color: C.red, align: 'left' });
        text("• Shuning uchun majburiy '--' belgisi talab qilinar edi.", 150, 760, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Zamonaviy aniq taqsimot
      panel(980, 140, 840, 680, C.green, "Zamonaviy Git: Aniq Vazifalar", "Git 2.23+ va Git 2.51+ standarti", kBox, kBox);

      const kR1 = P(u, 7.0, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.06)', col: C.green, lw: 2 });
        pill("Vazifalar To'liq Ajratildi", 1150, 290, C.green, { size: 16, mono: false });
        code("git restore  ->  Faqat fayllarni tiklaydi", 1030, 340, { size: 16, color: C.green, weight: 600 });
        text("  Branchlarga umuman tegmaydi, chalkashlik yo'q.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        code("git switch   ->  Faqat branchlarni almashtiradi", 1030, 420, { size: 16, color: C.cyan, weight: 600 });
        text("  Fayllarni tasodifan o'chirib yuborish xavfi yo'q.", 1030, 455, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 11.0, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("No-Overlay Afzalligi", 1130, 550, C.cyan, { size: 16, mono: false });
        text("• checkout papkani tiklaganda, manbada yo'q fayllarni qoldirib ketardi.", 1030, 600, { size: 17, color: C.text, align: 'left' });
        text("• git restore --source esa papkani o'sha commitga ANIQ moslaydi:", 1030, 645, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        text("• Manbada bo'lmagan fayllar toza o'chiriladi (no-overlay).", 1030, 690, { size: 17, color: C.text, align: 'left' });
        text("• Git 2.51 rasmiy reliziga ko'ra restore to'liq barqaror va standart!", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xavflar Xaritasi va Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xavflar Xaritasi va Xulosa", u);

    const kBox = eo(P(u, 0.2, 0.6));
    withA(kBox, () => {
      // 3 ta parallel ustun (har biri w=540, h=520, y=140)
      // 1-ustun: restore --staged
      panel(100, 140, 540, 520, C.green, "1 · restore --staged", "index uchun (100% xavfsiz)", kBox, kBox);
      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(120, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.green });
        pill("100% Xavfsiz Buyruq", 230, 290, C.green, { size: 15, mono: false });
        text("• Faqat index o'zgaradi", 140, 340, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Fayl stagingdan chiqariladi.", 140, 370, { size: 15, color: C.text, align: 'left' });
        text("• Diskka aslo tegmaydi", 140, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Barcha yozilgan kod butun qoladi.", 140, 440, { size: 15, color: C.text, align: 'left' });
        text("• Qaytarish imkoni", 140, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Istalgan paytda qayta 'git add'.", 140, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 140, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Hech narsa yo'qolmaydi!", 140, 580, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      // 2-ustun: commit --amend
      panel(690, 140, 540, 520, C.yellow, "2 · commit --amend", "oxirgi commit uchun", kBox, kBox);
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(710, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.yellow });
        pill("Lokalda Juda Qulay", 800, 290, C.yellow, { size: 15, mono: false });
        text("• Commitni almashtiradi", 730, 340, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Yangi kommit obyekti yaratiladi.", 730, 370, { size: 15, color: C.text, align: 'left' });
        text("• Reflog eslab qoladi", 730, 410, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  Tiklash: git reset --soft HEAD@{1}", 730, 440, { size: 15, fam: MONO, color: C.text, align: 'left' });
        text("• Asosiy Cheklov", 730, 480, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Push qilingan bo'lsa amend qilmang!", 730, 510, { size: 15, color: C.red, align: 'left' });
        text("• Xulosa", 730, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Faqat shaxsiy lokal branchda qo'llang.", 730, 580, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // 3-ustun: restore <fayl>
      panel(1280, 140, 540, 520, C.red, "3 · restore <fayl>", "working tree uchun (xavfli)", kBox, kBox);
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1300, 255, 500, 380, { fill: 'rgba(11,16,32,0.94)', col: C.red });
        pill("Ehtiyotkorlik Talab Etadi", 1400, 290, C.red, { size: 15, mono: false });
        text("• O'zgarishlar o'chadi", 1320, 340, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Diskdagi kod index holatiga qaytadi.", 1320, 370, { size: 15, color: C.text, align: 'left' });
        text("• Qaytarib bo'lmaydi", 1320, 410, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Commit qilinmagan narsa yo'qoladi.", 1320, 440, { size: 15, color: C.text, align: 'left' });
        text("• Xavfsiz Muqobil", 1320, 480, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("  Shubhada: git stash bilan saqlang.", 1320, 510, { size: 15, color: C.text, align: 'left' });
        text("• Xulosa", 1320, 550, { size: 16, color: C.mute, align: 'left', weight: 600 });
        text("  Faqat 100% ishonch bilan ishlating!", 1320, 580, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.5, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Teglar va Aliaslar", 280, 725, C.git, { size: 16, mono: false });
        text("Keyingi 12-bobda: Muhim nuqtalar — 'git tag' va klaviatura unumdorligi uchun 'alias'lar!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Reliz teglari, annotatsiyali imzolar va eng kerakli Git aliaslarini sozlashni batafsil o'rganamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Gitda har bir bekor qilish buyrug'ining chegarasini bilish — xavfsiz va ishonchli dasturchilik kalitidir.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'amend', fn: sceneAmend },
      { id: 'unstage', fn: sceneUnstage },
      { id: 'restore_worktree', fn: sceneRestoreWorktree },
      { id: 'eski_yol', fn: sceneEskiYol },
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
