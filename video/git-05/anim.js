// Git 05-bob videosi: "Uch holat va uch hudud"
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
  // 1-SAHNA: Kirish va Model Poydevori
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("05-BOB · UCH HOLAT VA UCH HUDUD", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Uch Holat va Uch Hudud", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Gitning eng muhim poydevori: har bir buyruq shu uch hudud o'rtasida ishlaydi", 960, 415, { size: 26, color: C.mute });

        // Markaziy arxitektura oqimi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Asosiy Arxitektura Oqimi", 960, 530, C.blue, { size: 22 });

          // 3 hudud bloklari
          card(410, 580, 320, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Working Tree", 570, 615, C.yellow, { size: 18 });
          text("Diskdagi ishchi fayllar", 570, 655, { size: 16, color: C.text });

          text("── git add ──►", 780, 635, { size: 16, fam: MONO, color: C.cyan, weight: 700 });

          card(830, 580, 320, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("Staging Area (Index)", 990, 615, C.blue, { size: 18 });
          text("Commit qoralamasi", 990, 655, { size: 16, color: C.text });

          text("── commit ──►", 1200, 635, { size: 16, fam: MONO, color: C.green, weight: 700 });

          card(1250, 580, 270, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("Git Directory", 1385, 615, C.green, { size: 18 });
          text(".git ombori", 1385, 655, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Git Arxitekturasining Oltin Modeli", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 7.8, 0.6));
    withA(kBox, () => {
      // Chap panel: 3 holat xulosasi
      panel(100, 140, 840, 680, C.yellow, "Faylning Uch Holati", "har bir o'zgarish bosqichlari", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Modified (O'zgartirilgan)", 270, 290, C.yellow, { size: 16, mono: false });
        text("• Fayl diskda tahrirlangan, lekin hali keyingi commitga belgilanmagan.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• O'zgarishlar faqat sizning shaxsiy ishchi papkangizda mavjud.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Staged (Tayyorlangan)", 255, 470, C.blue, { size: 16, mono: false });
        text("• Faylning aynan hozirgi versiyasi keyingi snapshot uchun ajratilgan.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• git add buyrug'i orqali Index hududiga qoralama sifatida kiritilgan.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Committed (Saqlangan)", 255, 655, C.green, { size: 16, mono: false });
        text("• Ma'lumot Git bazasida xavfsiz va butunlay muhrlangan.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Har bir commit loyihaning o'zgarmas to'liq suratidir (snapshot).", 150, 740, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Nega yodlash shart emas
      panel(980, 140, 840, 680, C.blue, "Nega Buyruqlarni Yodlamaysiz?", "hududlar o'rtasida ma'lumot ko'chirish", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Mantiqiy Harakat", 1120, 290, C.blue, { size: 16, mono: false });
        text("• Har qanday Git buyrug'i uch hudud o'rtasida ma'lumot harakatlantiradi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• add, commit, diff, restore, reset, switch — bari shu qonunga bo'ysunadi.", 1030, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Oshxona Analagiyasi", 1130, 470, C.purple, { size: 16, mono: false });
        text("• Working Tree — oshxona stoli (masalliqlar, chala ishlar).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Index — tarqatish stoli; Git Directory — tayyor taomlar fotoalbomi!", 1030, 555, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Doimiy Boshqaruv", 1120, 655, C.mute, { size: 16, mono: false });
        text("• Siz har bir o'zgarishni qachon va qanday saqlashni to'liq nazorat qilasiz.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Tasodifiy yoki aralash commitlar xavfi butunlay bartaraf etiladi.", 1030, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Faylning Uch Holati
  // ==========================================
  function sceneUchHolat(u, bounds, o = {}) {
    chip(2, "Faylning Uch Asosiy Holati", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 ustun: 546px kenglik, 40px oraliq
      // Ustun 1: Modified (x=100)
      const kM = P(u, 0.6, 0.5);
      withA(kM, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM)) * 20);
        panel(100, 140, 546, 680, C.yellow, "Modified", "o'zgartirilgan holat", kM, kM);

        card(120, 255, 506, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Holat Belgisi", 210, 290, C.yellow, { size: 16, mono: false });
        text("Fayl ishchi papkada o'zgartirildi,", 140, 335, { size: 17, color: C.text, align: 'left' });
        text("ammo Git bazasiga hali kiritilmadi.", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("git status: not staged", 140, 400, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });

        card(120, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qayerda joylashgan?", 240, 480, C.mute, { size: 16, mono: false });
        text("• Faqat diskdagi Working Tree'da.", 140, 525, { size: 16, color: C.text, align: 'left' });
        text("• Tarixga ta'sir qilmaydi.", 140, 560, { size: 16, color: C.mute, align: 'left' });
        text("• Istalgan payt bekor qilish mumkin.", 140, 595, { size: 16, color: C.yellow, align: 'left' });

        card(120, 675, 506, 125, { fill: 'rgba(255,209,102,0.05)', col: C.yellow });
        text("Keyingi qadam:", 140, 715, { size: 15, color: C.mute, align: 'left' });
        text("$ git add <fayl>", 140, 755, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Ustun 2: Staged (x=686)
      const kS = P(u, 4.0, 0.5);
      withA(kS, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS)) * 20);
        panel(686, 140, 546, 680, C.blue, "Staged", "tayyorlangan holat", kS, kS);

        card(706, 255, 506, 170, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Holat Belgisi", 796, 290, C.blue, { size: 16, mono: false });
        text("Faylning ayni shu versiyasi", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("keyingi commitga kiritishga tayyor.", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("git status: to be committed", 726, 400, { size: 15, fam: MONO, color: C.blue, align: 'left', weight: 600 });

        card(706, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qayerda joylashgan?", 826, 480, C.mute, { size: 16, mono: false });
        text("• Staging Area (.git/index) ichida.", 726, 525, { size: 16, color: C.text, align: 'left' });
        text("• Keyingi commitning qoralamasi.", 726, 560, { size: 16, color: C.mute, align: 'left' });
        text("• Aynan shu paytdagi holat muzlatilgan.", 726, 595, { size: 16, color: C.blue, align: 'left' });

        card(706, 675, 506, 125, { fill: 'rgba(79,140,255,0.05)', col: C.blue });
        text("Keyingi qadam:", 726, 715, { size: 15, color: C.mute, align: 'left' });
        text("$ git commit -m '...'", 726, 755, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Ustun 3: Committed (x=1272)
      const kC = P(u, 7.5, 0.5);
      withA(kC, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC)) * 20);
        panel(1272, 140, 546, 680, C.green, "Committed", "saqlangan holat", kC, kC);

        card(1292, 255, 506, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Holat Belgisi", 1382, 290, C.green, { size: 16, mono: false });
        text("Ma'lumot Git omboriga doimiy", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("snapshot sifatida xavfsiz yozilgan.", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("git status: working tree clean", 1312, 400, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });

        card(1292, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qayerda joylashgan?", 1412, 480, C.mute, { size: 16, mono: false });
        text("• Git Directory (.git/objects) ichida.", 1312, 525, { size: 16, color: C.text, align: 'left' });
        text("• SHA-1 xesh bilan doimiy muhrlangan.", 1312, 560, { size: 16, color: C.mute, align: 'left' });
        text("• O'chib ketmaydigan mustahkam tarix.", 1312, 595, { size: 16, color: C.green, align: 'left' });

        card(1292, 675, 506, 125, { fill: 'rgba(52,211,153,0.05)', col: C.green });
        text("Holati:", 1312, 715, { size: 15, color: C.mute, align: 'left' });
        text("Xavfsiz Arxivda Saqlangan", 1312, 755, { size: 18, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Git Loyihasining Uch Hududi
  // ==========================================
  function sceneUchHudud(u, bounds, o = {}) {
    chip(3, "Git Loyihasining Uch Mustaqil Hududi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 arxitekturaviy ustun
      // Hudud 1: Working Tree (x=100)
      const kW = P(u, 0.5, 0.5);
      withA(kW, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kW)) * 20);
        panel(100, 140, 546, 680, C.yellow, "1 · Working Tree", "ishchi papka", kW, kW);

        card(120, 255, 506, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Oshxona: Ish Stoli", 230, 290, C.yellow, { size: 16, mono: false });
        text("Loyihaning bitta versiyasi diskka", 140, 335, { size: 17, color: C.text, align: 'left' });
        text("chiqarilgan, ochilgan holati.", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("Fayllarni tahrirlash, qo'shish va o'chirish.", 140, 400, { size: 16, color: C.yellow, align: 'left' });

        card(120, 455, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Xususiyatlari", 200, 490, C.mute, { size: 16, mono: false });
        text("• Muharriringiz to'g'ridan-to'g'ri ko'radi.", 140, 535, { size: 16, color: C.text, align: 'left' });
        text("• Tartibsiz, chala ishlar bo'lishi tabiiy.", 140, 570, { size: 16, color: C.mute, align: 'left' });
        text("• Git bu yerdagi fayllarga xalaqit bermaydi.", 140, 605, { size: 16, color: C.text, align: 'left' });

        card(120, 685, 506, 115, { fill: 'rgba(255,209,102,0.05)', col: C.yellow });
        text("Jismoniy joylashuvi:", 140, 725, { size: 15, color: C.mute, align: 'left' });
        text("Oddiy loyiha papkasi", 140, 760, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // Hudud 2: Staging Area / Index (x=686)
      const kI = P(u, 4.0, 0.5);
      withA(kI, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI)) * 20);
        panel(686, 140, 546, 680, C.blue, "2 · Staging Area", "index / tarqatish stoli", kI, kI);

        card(706, 255, 506, 180, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Oshxona: Tarqatish Stoli", 840, 290, C.blue, { size: 16, mono: false });
        text("Keyingi commitga nima kirishini", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("saqlovchi oraliq saralash maydoni.", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("Faqat tayyor o'zgarishlar qo'yiladi.", 726, 400, { size: 16, color: C.cyan, align: 'left' });

        card(706, 455, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Xususiyatlari", 786, 490, C.mute, { size: 16, mono: false });
        text("• Commitning aniq qoralamasi saqlanadi.", 726, 535, { size: 16, color: C.text, align: 'left' });
        text("• Bir nechta commitsiz mustaqil tanlash.", 726, 570, { size: 16, color: C.mute, align: 'left' });
        text("• Kesh sifatida yuqori tezlik beradi.", 726, 605, { size: 16, color: C.blue, align: 'left' });

        card(706, 685, 506, 115, { fill: 'rgba(79,140,255,0.05)', col: C.blue });
        text("Jismoniy joylashuvi:", 726, 725, { size: 15, color: C.mute, align: 'left' });
        text(".git/index fayli", 726, 760, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      // Hudud 3: Git Directory / Repository (x=1272)
      const kR = P(u, 7.5, 0.5);
      withA(kR, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR)) * 20);
        panel(1272, 140, 546, 680, C.green, "3 · Git Directory", ".git arxivi", kR, kR);

        card(1292, 255, 506, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Oshxona: Fotoalbom", 1412, 290, C.green, { size: 16, mono: false });
        text("Loyihaning barcha metama'lumotlari,", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("obyektlar bazasi va butun tarixi.", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("Klon qilinganda aynan shu ko'chiriladi.", 1312, 400, { size: 16, color: C.green, align: 'left' });

        card(1292, 455, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Xususiyatlari", 1372, 490, C.mute, { size: 16, mono: false });
        text("• To'laqonli siqilgan obyektlar ombori.", 1312, 535, { size: 16, color: C.text, align: 'left' });
        text("• Reflar, branchlar va teglarni saqlaydi.", 1312, 570, { size: 16, color: C.mute, align: 'left' });
        text("• Qo'lda tegilmaydi, Git boshqaradi.", 1312, 605, { size: 16, color: C.green, align: 'left' });

        card(1292, 685, 506, 115, { fill: 'rgba(52,211,153,0.05)', col: C.green });
        text("Jismoniy joylashuvi:", 1312, 725, { size: 15, color: C.mute, align: 'left' });
        text(".git papkasi ($GIT_DIR)", 1312, 760, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Amaliy Oqim: add va commit
  // ==========================================
  function sceneIshOqimi(u, bounds, o = {}) {
    chip(4, "Amaliy Oqim: add va commit Mexanizmi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Standart ish oqimi
      panel(100, 140, 840, 680, C.blue, "Standart Ish Oqimi", "buyruqlar va o'tishlar", kBase, kBase);

      const kStep1 = P(u, 0.6, 0.5);
      withA(kStep1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kStep1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1-QADAM · Working Tree'da tahrirlash", 300, 290, C.yellow, { size: 16, mono: false });
        text("$ echo 'console.log(salom)' > app.js", 150, 335, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Fayl diskda o'zgardi. Holat: Modified.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kStep2 = P(u, 2.5, 0.5);
      withA(kStep2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kStep2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2-QADAM · git add bilan Index'ga olish", 300, 470, C.blue, { size: 16, mono: false });
        text("$ git add app.js", 150, 515, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Aynan shu ko'rinish Index'ga ko'chdi. Holat: Staged.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kStep3 = P(u, 5.0, 0.5);
      withA(kStep3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kStep3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3-QADAM · git commit bilan omborga muhrlash", 340, 655, C.green, { size: 16, mono: false });
        text("$ git commit -m 'feat: salom qo\\'shildi'", 150, 700, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Index'dagi snapshot Git Directory'ga doimiy yozildi. Holat: Committed.", 150, 740, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Eng muhim nozik nuqta (Trap/Rule)
      panel(980, 140, 840, 680, C.purple, "Muhim Qoida: Qayta Tahrirlash", "add qilgandan so'ng yana o'zgartirsak-chi?", kBase, kBase);

      const kTrap = P(u, 7.5, 0.5);
      withA(kTrap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kTrap)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("Klassik Savol va Tajriba", 1140, 290, C.red, { size: 16, mono: false });
        text("1. Faylni add qildingiz (Index'da: versiya-A)", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("2. Keyin diskda yana o'zgartirdingiz (Diskda: versiya-B)", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("3. Hozir 'git commit' qilsangiz, qaysi biri saqlanadi?", 1030, 420, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("Javob: FAQT versiya-A saqlanadi! Index'dagi narsa yoziladi.", 1030, 460, { size: 17, color: C.red, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kFix = P(u, 10.5, 0.5);
      withA(kFix, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFix)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Xulosa va Oltin Qoida", 1120, 555, C.purple, { size: 16, mono: false });
        text("• Git fayllarni emas, ularning AYNI SHU PAYTDAGI holatini stage qiladi.", 1030, 600, { size: 17, color: C.text, align: 'left' });
        text("• Yangi o'zgarishlar commitga kirishi uchun qayta 'git add' qilish shart!", 1030, 645, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Shu tufayli bir vaqtning o'zida fayl HAM staged, HAM modified bo'lishi mumkin.", 1030, 690, { size: 16, color: C.cyan, align: 'left' });
        text("• 'git status' buni ikkala bo'limda alohida ko'rsatadi.", 1030, 730, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Nega Oraliq Index Bor?
  // ==========================================
  function sceneNegaIndex(u, bounds, o = {}) {
    chip(5, "Nega Oraliq Index Hududi Bor?", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 2x2 to'r: har biri 840x320
      // 1. Tanlab yig'ish (Top-Left, x=100, y=140)
      const kC1 = P(u, 0.5, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(100, 140, 840, 320, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Commitlarni Tanlab Yig'ish", 260, 180, C.yellow, { size: 18, mono: false });
        text("• Bir soatda uchta mustaqil ish qildingiz: tuzatish, yangi funksiya, formatlash.", 130, 230, { size: 17, color: C.text, align: 'left' });
        text("• Index bo'lmasa, bari bitta qorishiq commitga tushib ketardi.", 130, 270, { size: 17, color: C.mute, align: 'left' });
        text("• Index bilan har birini alohida, toza mantiqiy commitlarga ajratasiz.", 130, 310, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        text("• Hatto bitta faylning ayrim qatorlarinigina stage qilish mumkin (git add -p).", 130, 350, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      // 2. Commitni oldindan ko'rish (Top-Right, x=980, y=140)
      const kC2 = P(u, 3.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(980, 140, 840, 320, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Commitni Oldindan Tekshirish", 1150, 180, C.blue, { size: 18, mono: false });
        text("• Index — keyingi commitning rasmiy qoralamasidir.", 1010, 230, { size: 17, color: C.text, align: 'left' });
        text("• Commit qilishdan oldin 'git diff --staged' bilan aynan nima kirishini tekshirasiz.", 1010, 270, { size: 17, color: C.text, align: 'left' });
        text("• Agar qoralama yoqmasa, bemalol bekor qilasiz — tarixga hali hech narsa yozilmagan.", 1010, 310, { size: 17, color: C.blue, align: 'left', weight: 600 });
        text("• Tarix tozaligini kafolatlovchi xavfsizlik buferi.", 1010, 350, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // 3. Tezlik va kesh (Bottom-Left, x=100, y=490)
      const kC3 = P(u, 6.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(100, 490, 840, 330, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Kesh va Yuksak Ish Unumi", 250, 530, C.green, { size: 18, mono: false });
        text("• Index faqat ro'yxat emas, u diskdagi o'ta tezkor kesh faylidir.", 130, 580, { size: 17, color: C.text, align: 'left' });
        text("• Har bir faylning oxirgi hajmi va o'zgarish vaqti (stat) saqlanadi.", 130, 620, { size: 17, color: C.mute, align: 'left' });
        text("• Natijada 100 000 ta faylli yirik loyihada ham 'git status' bir zumda bajariladi.", 130, 660, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Hamma faylni qayta o'qib hash hisoblashga hojat qolmaydi.", 130, 700, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // 4. Merge konfliktlarini yechish (Bottom-Right, x=980, y=490)
      const kC4 = P(u, 9.5, 0.5);
      withA(kC4, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC4)) * 16);
        card(980, 490, 840, 330, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("4 · Merge Konfliktlarini Yechish", 1150, 530, C.purple, { size: 18, mono: false });
        text("• Birlashish va konfliktlar paytida Index bir vaqtning o'zida", 1010, 580, { size: 17, color: C.text, align: 'left' });
        text("  bitta faylning uchta versiyasini (ajdod, bizniki, ularniki) saqlay oladi.", 1010, 615, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Konfliktni hal etib 'git add' qilsangiz, bitta yakuniy to'g'ri versiya qoladi.", 1010, 660, { size: 17, color: C.text, align: 'left' });
        text("• Index bo'lmaganda murakkab mergelarni avtomatlashtirish imkonsiz bo'lardi.", 1010, 700, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Buyruqlar Xaritasi
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: Uch Hudud Xaritasi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta xulosa kartasi: Uch hudud o'rtasidagi harakat xaritasi
      panel(100, 140, 1720, 500, C.cyan, "Uch Hudud va Asosiy Buyruqlar Xaritasi", "qaysi buyruq qayerga ma'lumot tashiydi", kBase, kBase);

      // 3 blok
      const kMap = P(u, 0.8, 0.6);
      withA(kMap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMap)) * 16);

        // Blok 1: Working Tree (x=140)
        card(140, 260, 420, 200, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill("Working Tree", 350, 305, C.yellow, { size: 20 });
        text("Diskdagi Ishchi Fayllar", 350, 350, { size: 18, weight: 700, color: C.text });
        text("Fayllarni tahrirlash va o'chirish", 350, 385, { size: 15, color: C.mute });
        text("Holat: Modified", 350, 420, { size: 16, color: C.yellow, weight: 600 });

        // O'tish 1: add va restore
        text("git add ──►", 685, 330, { size: 18, fam: MONO, color: C.cyan, weight: 800 });
        text("◄── git restore", 685, 390, { size: 16, fam: MONO, color: C.mute, weight: 600 });

        // Blok 2: Staging Area (x=790)
        card(790, 260, 420, 200, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("Staging Area (Index)", 1000, 305, C.blue, { size: 20 });
        text("Commit Qoralamasi", 1000, 350, { size: 18, weight: 700, color: C.text });
        text(".git/index fayli", 1000, 385, { size: 15, fam: MONO, color: C.mute });
        text("Holat: Staged", 1000, 420, { size: 16, color: C.blue, weight: 600 });

        // O'tish 2: commit va checkout
        text("git commit ──►", 1335, 330, { size: 18, fam: MONO, color: C.green, weight: 800 });
        text("◄── git switch", 1335, 390, { size: 16, fam: MONO, color: C.mute, weight: 600 });

        // Blok 3: Git Directory (x=1440)
        card(1440, 260, 340, 200, { fill: 'rgba(52,211,153,0.10)', col: C.green, lw: 2 });
        pill("Git Directory", 1610, 305, C.green, { size: 20 });
        text("Ombor (Arxiv)", 1610, 350, { size: 18, weight: 700, color: C.text });
        text(".git papkasi", 1610, 385, { size: 15, fam: MONO, color: C.mute });
        text("Holat: Committed", 1610, 420, { size: 16, color: C.green, weight: 600 });

        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 4.0, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Gitni O'rganishda Eng Asosiy Xulosa", 960, 715, C.git, { size: 20, mono: false });
        text("Uch hudud modelini tasavvur qila olsangiz, har qanday Git buyrug'ini o'zingiz mantiqan chiqara olasiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("Keyingi bobda ushbu hududlarni boshqaruvchi status, add va commit buyruqlari bilan amalda tanishamiz.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'uch_holat', fn: sceneUchHolat },
      { id: 'uch_hudud', fn: sceneUchHudud },
      { id: 'ish_oqimi', fn: sceneIshOqimi },
      { id: 'nega_index', fn: sceneNegaIndex },
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
