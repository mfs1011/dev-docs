// Git 06-bob videosi: "O'zgarishlarni yozish: status, add, commit"
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
  // 1-SAHNA: Kirish va Asosiy Sikl
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("06-BOB · O'ZGARISHLARNI YOZISH", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("status, add va commit", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Kundalik dasturlash ishlarining 90 foizi shu uchlik bilan kechadi", 960, 415, { size: 26, color: C.mute });

        // Markaziy uchlik kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Kundalik Ish Siklining Asosiy Uchligi", 960, 530, C.blue, { size: 22 });

          card(410, 580, 320, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("$ git status", 570, 615, C.yellow, { size: 18 });
          text("Holatni tekshirish", 570, 655, { size: 16, color: C.text });

          text("──►", 780, 635, { size: 20, fam: MONO, color: C.blue, weight: 700 });

          card(830, 580, 320, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("$ git add <fayl>", 990, 615, C.blue, { size: 18 });
          text("Mazmunni stage qilish", 990, 655, { size: 16, color: C.text });

          text("──►", 1200, 635, { size: 20, fam: MONO, color: C.green, weight: 700 });

          card(1250, 580, 270, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("$ git commit", 1385, 615, C.green, { size: 18 });
          text("Tarixga muhrlash", 1385, 655, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "O'zgarishlarni Yozish Sikli", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: 3 buyruq mas'uliyati
      panel(100, 140, 840, 680, C.yellow, "Uch Asosiy Buyruq Mas'uliyati", "har birining alohida vazifasi", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · git status", 220, 290, C.yellow, { size: 16 });
        text("• 'Hozir qaysi fayl qaysi holatda?' degan savolga to'liq javob beradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Working Tree, Index va Reponi solishtiradi, hech narsani o'zgartirmaydi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · git add", 210, 470, C.blue, { size: 16 });
        text("• Faylning diskdagi aynan hozirgi mazmunini Index hududiga ko'chiradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi faylni kuzatadi, o'zgarganni stage qiladi, o'chirilganni belgilaydi.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · git commit", 225, 655, C.green, { size: 16 });
        text("• Indexdagi barcha qoralama fayllarni olib, tarixga yangi snapshot qiladi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Har bir commit o'z muallifi, sanasi va xabari bilan abadiy muhrlanadi.", 150, 740, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Tracked vs Untracked
      panel(980, 140, 840, 680, C.blue, "Tracked va Untracked", "fayllarning Git bilan aloqasi", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Tracked (Kuzatiladigan)", 1160, 290, C.blue, { size: 16, mono: false });
        text("• Oxirgi commitda bo'lgan yoki yangi stage qilingan, Git biladigan fayllar.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Ular unmodified (o'zgarmagan), modified yoki staged bo'lishi mumkin.", 1030, 375, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("Untracked (Kuzatilmaydigan)", 1180, 470, C.red, { size: 16, mono: false });
        text("• Loyihada yangi paydo bo'lgan, ammo Git hali bilmaydigan begona fayllar.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Git ularni ko'radi, lekin siz 'git add' demaguningizcha kuzatmaydi.", 1030, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Nega Git o'zi qo'shib yubormaydi?", 1210, 655, C.mute, { size: 16, mono: false });
        text("• Build fayllari, vaqtinchalik loglar va .env kabi maxfiy ma'lumotlar", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("  tasodifan tarixga tushib qolmasligi uchun qo'shish qat'iy ixtiyoriydir!", 1030, 740, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git status: Holatni Ko'rish
  // ==========================================
  function sceneGitStatus(u, bounds, o = {}) {
    chip(2, "git status: Holatni Nazorat Qilish", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Uzun (standart) format
      panel(100, 140, 840, 680, C.yellow, "Standart Format: git status", "batafsil ma'lumot va yo'l-yo'riqlar", kBase, kBase);

      const kL1 = P(u, 0.6, 0.5);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 16);
        card(125, 255, 790, 150, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("1 · Branch Holati", 220, 290, C.blue, { size: 16, mono: false });
        text("On branch main", 150, 330, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Your branch is up to date with 'origin/main'.", 150, 365, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 2.8, 0.5);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 16);
        card(125, 425, 790, 175, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Changes to be committed (Staged)", 305, 460, C.green, { size: 16, mono: false });
        text("(use 'git restore --staged <file>...' to unstage)", 150, 500, { size: 14, fam: MONO, color: C.mute, align: 'left' });
        text("new file:   LICENSE", 150, 535, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("modified:   src/index.js", 150, 565, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });

      const kL3 = P(u, 5.0, 0.5);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 16);
        card(125, 620, 790, 175, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("3 · Untracked files (Kuzatilmayotgan)", 300, 655, C.red, { size: 16, mono: false });
        text("(use 'git add <file>...' to include in what will be committed)", 150, 695, { size: 14, fam: MONO, color: C.mute, align: 'left' });
        text("todo.txt", 150, 730, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 700 });
        text("src/util/temp.js", 150, 760, { size: 16, fam: MONO, color: C.red, align: 'left', weight: 700 });
        ctx.restore();
      });

      // O'ng panel: Qisqa format git status -s
      panel(980, 140, 840, 680, C.blue, "Qisqa Format: git status -s", "ikki ustunli ixcham harflar", kBase, kBase);

      const kS1 = P(u, 7.5, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("Ikki Ustun Mantiqi (XY)", 1140, 290, C.blue, { size: 16, mono: false });
        text("• X (chap ustun)  = Staging Area (Index) holati", 1030, 335, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• Y (o'ng ustun)  = Working Tree (diskdagi) holati", 1030, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        text("--------------------------------------------------", 1030, 410, { size: 15, fam: MONO, color: C.mute, align: 'left' });
        text("?? fayl.txt   -> Untracked (Git hali kuzatmayapti)", 1030, 440, { size: 16, fam: MONO, color: C.red, align: 'left' });
        text("A  yangi.txt  -> Yangi fayl indexga qo'shildi (Staged)", 1030, 470, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 10.5, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Modified Farqlari: M va MM", 1150, 555, C.purple, { size: 16, mono: false });
        text(" M app.js  -> Diskda o'zgargan, lekin staged qilinmagan", 1030, 600, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("M  app.js  -> Staged qilingan, commitga tayyor", 1030, 640, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("MM app.js  -> Staged qilingan, so'ng diskda YANA tahrirlangan!", 1030, 680, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("Qisqa format yuzlab fayllar ichida ko'zni toliqtirmaydi.", 1030, 730, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git add: Mazmunni Stage Qilish
  // ==========================================
  function sceneGitAdd(u, bounds, o = {}) {
    chip(3, "git add: Mazmunni Stage Qilish", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Ko'p vazifali tabiat
      panel(100, 140, 840, 680, C.green, "Ko'p Vazifali Buyruq", "faqat qo'shish emas, mazmunni moslash", kBase, kBase);

      const kA1 = P(u, 0.6, 0.5);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Yangi fayllarni kuzatish", 270, 290, C.green, { size: 16, mono: false });
        text("$ git add newfile.js", 150, 335, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Untracked fayl rasman Git nazoratiga o'tadi va staged bo'ladi.", 150, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kA2 = P(u, 3.0, 0.5);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · O'zgargan faylni stage qilish", 280, 470, C.blue, { size: 16, mono: false });
        text("$ git add src/main.js", 150, 515, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Faylning aynan hozirgi ko'rinishi snapshot qoralamasiga olinadi.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kA3 = P(u, 5.5, 0.5);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("3 · O'chirilgan fayllarni tasdiqlash", 290, 655, C.purple, { size: 16, mono: false });
        text("$ git add eski_fayl.js", 150, 700, { size: 18, fam: MONO, color: C.text, align: 'left' });
        text("Diskdan o'chirilgan fayl Indexda ham o'chirilgan deb belgilanadi.", 150, 740, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Qo'llash usullari
      panel(980, 140, 840, 680, C.blue, "add Buyrug'ining Turli Shakllari", "tanlab yoki yoppasiga stage qilish", kBase, kBase);

      const kB1 = P(u, 7.5, 0.5);
      withA(kB1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kB1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(11,16,32,0.95)', col: C.yellow });
        pill("Muayyan fayl yoki papka", 1140, 290, C.yellow, { size: 16, mono: false });
        text("$ git add src/ components/ button.vue", 1030, 335, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text("Faqat ko'rsatilgan fayllar yoki papkalar ichidagilar stage qilinadi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kB2 = P(u, 9.5, 0.5);
      withA(kB2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kB2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("Barcha o'zgarishlarni olish", 1150, 470, C.blue, { size: 16, mono: false });
        text("$ git add .   yoki   $ git add -A", 1030, 515, { size: 18, fam: MONO, color: C.cyan, align: 'left' });
        text("Barcha yangi, tahrirlangan va o'chirilgan fayllarni yoppasiga stage qiladi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kB3 = P(u, 11.5, 0.5);
      withA(kB3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kB3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(11,16,32,0.95)', col: C.green });
        pill("Interaktiv bo'laklab olish (Patch)", 1170, 655, C.green, { size: 16, mono: false });
        text("$ git add -p", 1030, 700, { size: 18, fam: MONO, color: C.green, align: 'left' });
        text("Bitta fayl ichidagi ayrim o'zgarishlarni alohida tanlab stage qilish imkoni!", 1030, 740, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git commit: Tarixga Muhrlash
  // ==========================================
  function sceneGitCommit(u, bounds, o = {}) {
    chip(4, "git commit: Tarixga Muhrlash", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Commitning ichki tuzilishi
      panel(100, 140, 840, 680, C.green, "Commitning Ichki Anatomiyasi", "har bir commit nimani o'z ichiga oladi", kBase, kBase);

      const kC1 = P(u, 0.6, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Daraxt Surati (Tree Snapshot)", 290, 290, C.green, { size: 16, mono: false });
        text("Commit faqat farq (diff) emas, loyihaning to'liq suratini saqlaydi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("O'zgarmagan fayllar oldingi commit obyektiga havola qiladi.", 150, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = P(u, 3.0, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Muallif, Sana va Ota Commit", 270, 470, C.blue, { size: 16, mono: false });
        text("author: Ali Valiyev <ali@example.com>, sana: 2026-10-20", 150, 515, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("Har bir commit oldingi commit xeshini (parent) yodda tutadi.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = P(u, 5.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("3 · Noyob SHA-1 Xesh Kaliti", 260, 655, C.purple, { size: 16, mono: false });
        text("commit c6e10ac... (40 belgili betakror barmoq izi)", 150, 700, { size: 16, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("Ma'lumotlar o'zgarmasligi va yaxlitligi matematik kafolatlangan.", 150, 740, { size: 17, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Commit usullari
      panel(980, 140, 840, 680, C.blue, "Commit Qilish Usullari", "qulay buyruqlar va parametrlar", kBase, kBase);

      const kD1 = P(u, 7.5, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(11,16,32,0.95)', col: C.blue });
        pill("Tezkor xabar bilan: -m opsiyasi", 1170, 290, C.blue, { size: 16, mono: false });
        text("$ git commit -m 'feat: yangi qidiruv tizimi'", 1030, 335, { size: 18, fam: MONO, color: C.cyan, align: 'left' });
        text("Kichik va aniq o'zgarishlar uchun eng qulay bir qatorlik format.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kD2 = P(u, 9.5, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(11,16,32,0.95)', col: C.yellow });
        pill("Avtomatik stage qilish: -a opsiyasi", 1180, 470, C.yellow, { size: 16, mono: false });
        text("$ git commit -a -m 'fix: matn xatosi tuzatildi'", 1030, 515, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text("Tracked fayllarni add qilmasdan to'g'ridan-to'g'ri commitga kiritadi.", 1030, 555, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kD3 = P(u, 11.5, 0.5);
      withA(kD3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kD3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(11,16,32,0.95)', col: C.red });
        pill("Oxirgi commitni tuzatish: --amend", 1170, 655, C.red, { size: 16, mono: false });
        text("$ git commit --amend", 1030, 700, { size: 18, fam: MONO, color: C.red, align: 'left' });
        text("Unutilgan fayllarni oxirgi commitga qo'shish yoki xabarni o'zgartirish.", 1030, 740, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Faylning To'liq Hayot Sikli
  // ==========================================
  function sceneKuzatuvSikli(u, bounds, o = {}) {
    chip(5, "Faylning To'liq Hayot Sikli", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta sikl paneli
      panel(100, 140, 1720, 480, C.purple, "Fayllarning Holat Mashinasi (Lifecycle)", "fayl bosib o'tadigan 4 asosiy bosqich", kBase, kBase);

      const kFlow = P(u, 0.6, 0.6);
      withA(kFlow, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFlow)) * 16);

        // 4 blok
        // 1. Untracked
        card(140, 260, 360, 190, { fill: 'rgba(255,107,107,0.10)', col: C.red, lw: 2 });
        pill("Untracked", 320, 305, C.red, { size: 20 });
        text("Yangi Fayl", 320, 350, { size: 18, weight: 700, color: C.text });
        text("Git hali kuzatmayapti", 320, 385, { size: 15, color: C.mute });
        text("echo 'salom' > yangi.js", 320, 420, { size: 14, fam: MONO, color: C.red });

        text("git add ──►", 560, 355, { size: 16, fam: MONO, color: C.cyan, weight: 800 });

        // 2. Staged
        card(640, 260, 360, 190, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("Staged", 820, 305, C.blue, { size: 20 });
        text("Commitga Tayyor", 820, 350, { size: 18, weight: 700, color: C.text });
        text("Index qoralamasida", 820, 385, { size: 15, color: C.mute });
        text("git status: to be committed", 820, 420, { size: 14, fam: MONO, color: C.blue });

        text("commit ──►", 1060, 355, { size: 16, fam: MONO, color: C.green, weight: 800 });

        // 3. Unmodified
        card(1140, 260, 270, 190, { fill: 'rgba(52,211,153,0.10)', col: C.green, lw: 2 });
        pill("Unmodified", 1275, 305, C.green, { size: 20 });
        text("Tinch Holat", 1275, 350, { size: 18, weight: 700, color: C.text });
        text("Repo bilan bir xil", 1275, 385, { size: 15, color: C.mute });
        text("working tree clean", 1275, 420, { size: 14, fam: MONO, color: C.green });

        text("tahrir ──►", 1450, 355, { size: 15, fam: MONO, color: C.yellow, weight: 800 });

        // 4. Modified
        card(1510, 260, 270, 190, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill("Modified", 1645, 305, C.yellow, { size: 20 });
        text("O'zgargan", 1645, 350, { size: 18, weight: 700, color: C.text });
        text("Diskda yangilandi", 1645, 385, { size: 15, color: C.mute });
        text("not staged", 1645, 420, { size: 14, fam: MONO, color: C.yellow });

        ctx.restore();
      });

      // Pastki izoh kartasi
      const kCycleExp = P(u, 4.0, 0.5);
      withA(kCycleExp, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kCycleExp)) * 16);
        card(100, 650, 1720, 180, { fill: 'rgba(11,16,32,0.95)', col: C.purple, lw: 2 });
        pill("Uzluksiz Takrorlanuvchi Sikl", 960, 695, C.purple, { size: 20, mono: false });
        text("Fayl o'zgartirilishi bilan yana Modified holatiga o'tadi va uni yana 'git add' qilish talab etiladi.", 960, 745, { size: 20, weight: 700, color: C.text });
        text("Bu sikl butun dasturlash faoliyatingiz davomida millionlab marta bir maromda davom etadi.", 960, 785, { size: 18, color: C.mute });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Asosiy Qoidalar", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 ustunli tavsiyalar
      const kC1 = P(u, 0.5, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        panel(100, 140, 546, 500, C.yellow, "1 · Doim status qiling", "qayerda ekaningizni biling", kC1, kC1);
        card(120, 255, 506, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Oltin Odat", 200, 290, C.yellow, { size: 16, mono: false });
        text("Har qanday jiddiy amaldan avval", 140, 335, { size: 17, color: C.text, align: 'left' });
        text("va keyin 'git status' qilishni odat qiling.", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("Kutilmagan xatolar oldi olinadi.", 140, 400, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 2.5, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        panel(686, 140, 546, 500, C.blue, "2 · Mantiqiy stage qiling", "kerakli fayllarnigina oling", kC2, kC2);
        card(706, 255, 506, 170, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Toza Qoralama", 790, 290, C.blue, { size: 16, mono: false });
        text("Hamma narsani yoppasiga emas,", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("bitta mantiqqa ega bo'lgan o'zgarishlarni", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("bitta commitga jamlang.", 726, 400, { size: 16, color: C.blue, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 4.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        panel(1272, 140, 546, 500, C.green, "3 · Aniq xabar yozing", "kelajakdagi o'zingiz uchun", kC3, kC3);
        card(1292, 255, 506, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Tushunarli Tarix", 1385, 290, C.green, { size: 16, mono: false });
        text("Commit xabari nima va nega", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("o'zgarganini aniq tushuntirsin.", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("'update' yoki 'fix' deb yozmang!", 1312, 400, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 6.5, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: O'zgarishlarni Taqqoslash", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 7-bobda aynan qaysi qatorda nimalar o'zgarganini solishtiruvchi 'git diff' qurolini o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("status, add va commit buyruqlari — sizning har kungi eng ishonchli do'stingizdir.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'git_status', fn: sceneGitStatus },
      { id: 'git_add', fn: sceneGitAdd },
      { id: 'git_commit', fn: sceneGitCommit },
      { id: 'kuzatuv_sikli', fn: sceneKuzatuvSikli },
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
