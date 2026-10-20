// Git 03-bob videosi: "Birinchi sozlash va yordam"
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
  // 1-SAHNA: Kirish va Sozlash
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 7.5)
    if (u < 7.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("03-BOB · IDENTIFIKATSIYA VA YORDAM", 960, 280, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Birinchi Sozlash va Yordam", 960, 360, { size: 56, weight: 800, color: C.text });
        text("user.name, user.email, darajalar ierarxiyasi va git help", 960, 430, { size: 28, color: C.mute });

        // Markaziy konfiguratsiya namunasi
        const kTerm = P(u, 2.0, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(520, 500, 880, 220, { fill: 'rgba(11,16,32,0.92)', col: C.blue, lw: 2 });
          pill("$ git config list --show-origin", 960, 560, C.blue, { size: 22 });
          text("global  ~/.gitconfig  user.name=Ali Valiyev", 960, 625, { size: 22, fam: MONO, color: C.green, weight: 600 });
          text("global  ~/.gitconfig  user.email=ali@example.com", 960, 665, { size: 20, fam: MONO, color: C.mute });
          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 7.5 yoki poster)
    chip(1, "Nega Sozlash Muhim?", u, 7.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.0, 0.6));
    withA(kBox, () => {
      // Chap: Nega birinchi qadam?
      panel(100, 140, 840, 680, C.red, "Mualliflik Masalasi", "har bir commit'ning ajralmas qismi", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 8.5, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("1 · Commit Hashiga Muhrlanadi", 290, 290, C.red, { size: 16, mono: false });
        text("• Muallif (author) va commit qiluvchi (committer) to'liq yoziladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bu ma'lumotlar commit obyektining kriptografik heshini hosil qiladi!", 150, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.orange });
        pill("2 · Shunchaki Tuzatib Bo'lmaydi", 280, 470, C.orange, { size: 16, mono: false });
        text("• Sozlamani keyin o'zgartirsangiz, u faqat kelgusi commitlarga o'tadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Eski commitdagi xato ismni tuzatish yangi hash yaratishni talab qiladi.", 150, 555, { size: 17, color: C.orange, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 12.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(255,107,122,0.08)', col: C.purple });
        pill("3 · Jamoaviy Mas'uliyat", 240, 655, C.purple, { size: 16, mono: false });
        text("• GitHub, GitLab va barcha CI tizimlari hisobni shu emailga bog'laydi.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Noto'g'ri email bilan hissangiz (contributions) ko'rinmay qolishi mumkin.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: Git Config imkoniyatlari
      panel(980, 140, 840, 680, C.green, "Git Config Mexanizmi", "bitta buyruq, to'liq boshqaruv", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 9.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Bitta Yagona Buyruq", 1150, 290, C.green, { size: 16, mono: false });
        text("• Barcha sozlamalar 'git config' buyrug'i orqali boshqariladi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Juftlik ko'rinishida saqlanadi: bo'lim.kalit = qiymat", 1030, 375, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Oddiy Matnli Fayllar", 1150, 470, C.blue, { size: 16, mono: false });
        text("• Sozlamalar oddiy INI formatidagi ochiq fayllarda saqlanadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ularni ham terminaldan, ham sevimli matn muharririda ochsa bo'ladi.", 1030, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Doimiy Saqlanish", 1130, 655, C.yellow, { size: 16, mono: false });
        text("• Global sozlamalar bir marta kiritiladi va tizimda abadiy qoladi.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Git dasturi yangilanganda ham sozlamalar hech qachon o'chib ketmaydi.", 1030, 740, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 14.5, 0.7);
      withA(kFoot, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Git sozlamalari har bir kommitning tarixiy mualliflik poydevorini belgilaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Endi sozlamalarning 3 ta asosiy darajasi va ustunlik qoidasini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // ==========================================
  // 2-SAHNA: Konfiguratsiya Darajalari
  // ==========================================
  function sceneDarajalarUstunlik(u, bounds) {
    chip(2, "Konfiguratsiya Darajalari", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: 3 asosiy daraja
      panel(100, 140, 840, 680, C.blue, "Asosiy Konfiguratsiya Darajalari", "qaysi faylda va kimga ta'sir qiladi?", kBox, kBox);

      // System
      const kS1 = P(u, 1.2, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
        pill("1 · system (--system)", 230, 290, C.purple, { size: 16, mono: false });
        text("/etc/gitconfig", 150, 335, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("Kompyuterdagi barcha foydalanuvchilar va barcha repozitoriylar uchun.", 150, 375, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Global
      const kS2 = P(u, 3.2, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(125, 435, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · global (--global) · Eng Ko'p Ishlatiladigani", 330, 470, C.blue, { size: 16, mono: false });
        text("~/.gitconfig  yoki  ~/.config/git/config", 150, 515, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Faqat sizning shaxsiy foydalanuvchingiz va barcha loyihalaringiz uchun.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // Local
      const kS3 = P(u, 5.2, 0.6);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · local (--local) · Standart", 250, 655, C.green, { size: 16, mono: false });
        text(".git/config  (faqat shu repozitoriy ichida)", 150, 700, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Faqat bitta loyihaga tegishli; ish va shaxsiy loyihalarni ajratadi.", 150, 740, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ustunlik qoidasi
      panel(980, 140, 840, 680, C.yellow, "Oltin Qoida: Tor Daraja Ustun", "sozlamalar qanday tartibda o'qiladi?", kBox, kBox);

      const kP1 = P(u, 6.8, 0.6);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 175, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("O'qilish Tartibi va Qayta Yozilish", 1210, 290, C.yellow, { size: 16, mono: false });
        text("system (/etc)  ->  global (~/.gitconfig)  ->  local (.git/config)", 1030, 340, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("Git fayllarni ketma-ket o'qiydi; eng oxirgi o'qilgan qiymat g'olib bo'ladi!", 1030, 385, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 9.2, 0.6);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 450, 790, 185, { fill: 'rgba(15,22,48,0.92)', col: C.git });
        pill("Amaliy Misol: Shaxsiy vs Ishchi Email", 1220, 485, C.git, { size: 16, mono: false });
        text("global: user.email = ali@shaxsiy.uz", 1030, 530, { size: 17, fam: MONO, color: C.mute, align: 'left' });
        text("local:  user.email = ali@kompaniya.uz   <- G'OLIB!", 1030, 570, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("Natija: Ishchi repoda to'g'ri korporativ email ishlatiladi.", 1030, 605, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.6);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 655, 790, 130, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Manbani Tekshirish Buyrug'i", 1180, 690, C.blue, { size: 16, mono: false });
        text("$ git config list --show-scope --show-origin", 1030, 735, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Qoida oddiy: Tor daraja keng darajadan ustun; lokal repo sozlamasi global sozlamani yengadi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi identifikatsiyani o'rnatish va yangi Git 2.46+ subkomandalarini ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 3-SAHNA: Identifikatsiya va Sintaksis
  // ==========================================
  function sceneIdentifikatsiyaSintaksis(u, bounds) {
    chip(3, "Identifikatsiya va Sintaksis", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Ism va email
      panel(100, 140, 840, 680, C.blue, "Identifikatsiyani Sozlash", "user.name va user.email", kBox, kBox);

      // Ism
      const kI1 = P(u, 1.2, 0.6);
      withA(kI1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.blue });
        pill("Ism Kiritish (user.name)", 240, 290, C.blue, { size: 16, mono: false });
        text("$ git config set --global user.name 'Ali Valiyev'", 150, 340, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Ushbu ism barcha kommitlaringizda muallif sifatida saqlanadi.", 150, 380, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Email
      const kI2 = P(u, 3.5, 0.6);
      withA(kI2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(15,22,48,0.92)', col: C.green });
        pill("Email Kiritish (user.email)", 250, 470, C.green, { size: 16, mono: false });
        text("$ git config set --global user.email 'ali@example.com'", 150, 520, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("GitHub yoki GitLab profilingizdagi email bilan bir xil bo'lsin.", 150, 560, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // ~/.gitconfig fayli
      const kI3 = P(u, 5.8, 0.6);
      withA(kI3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kI3)) * 16);
        card(125, 615, 790, 170, { fill: 'rgba(11,16,32,0.92)', col: C.yellow, lw: 2 });
        pill("Fayldagi Ko'rinishi (~/.gitconfig)", 270, 650, C.yellow, { size: 16, mono: false });
        text("[user]", 150, 695, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        text("    name = Ali Valiyev", 150, 725, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("    email = ali@example.com", 150, 755, { size: 17, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Yangi sintaksis
      panel(980, 140, 840, 680, C.orange, "Yangi Git 2.46+ Subkomandalari", "zamonaviy va aniq boshqaruv", kBox, kBox);

      const kS1 = P(u, 7.5, 0.6);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("4 Ta Asosiy Subkomanda", 1140, 290, C.orange, { size: 16, mono: false });
        text("• git config list       -> barcha sozlamalarni ko'rish", 1030, 340, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config get <nom>  -> bitta qiymatni o'qish", 1030, 380, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config set <nom>  -> qiymatni yozish", 1030, 420, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("• git config unset <nom> -> sozlamani o'chirish", 1030, 460, { size: 17, fam: MONO, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kS2 = P(u, 9.8, 0.6);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(1005, 515, 790, 270, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yangi vs Eski Sintaksis Solishtiruvi", 1210, 550, C.green, { size: 16, mono: false });
        text("Yangi (2.46+):  git config get user.name", 1030, 600, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("Eski shakl:     git config user.name (yoki --get)", 1030, 635, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("Eski shakllar ham ishlaydi, lekin ma'lumotnomada", 1030, 680, { size: 16, color: C.text, align: 'left' });
        text("eskirgan (deprecated) deb belgilangan.", 1030, 715, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.0, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("Yangi subkomandalar sintaksisi konfiguratsiyani boshqarishni aniq va xavfsiz qiladi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
      text("Endi muharrir, standart brench va rang sozlamalarini ko'rib chiqamiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 4-SAHNA: Muhim Global Sozlamalar
  // ==========================================
  function sceneMuhimSozlamalar(u, bounds) {
    chip(4, "Muhim Global Sozlamalar", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Muharrir va default branch
      panel(100, 140, 840, 680, C.purple, "Muharrir va Standart Brench", "core.editor va init.defaultBranch", kBox, kBox);

      const kM1 = P(u, 1.2, 0.6);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 16);
        card(125, 255, 790, 240, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Standart Matn Muharriri (core.editor)", 310, 290, C.purple, { size: 16, mono: false });
        text("$ git config set --global core.editor 'code --wait'", 150, 340, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("• Kommit xabari va rebase amallari uchun VS Code ochiladi.", 150, 385, { size: 17, color: C.text, align: 'left' });
        text("• Terminal ichida qolishni istasangiz: 'nano' yoki 'vim'.", 150, 420, { size: 17, color: C.mute, align: 'left' });
        text("• Belgilanmasa tizimning standart EDITOR o'zgaruvchisidan olinadi.", 150, 455, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kM2 = P(u, 3.8, 0.6);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 16);
        card(125, 520, 790, 265, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Standart Brench Nomi (init.defaultBranch)", 320, 555, C.blue, { size: 16, mono: false });
        text("$ git config set --global init.defaultBranch main", 150, 605, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("• Yangi yaratilgan repozitoriyda birinchi brench 'main' bo'ladi.", 150, 650, { size: 17, color: C.text, align: 'left' });
        text("• Tarixiy 'master' o'rniga bugungi zamonaviy standart.", 150, 685, { size: 17, color: C.text, align: 'left' });
        text("• GitHub va GitLab standartlariga 100% to'liq mos keladi.", 150, 720, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Ranglar va tahrirlash
      panel(980, 140, 840, 680, C.green, "Ranglar va To'g'ridan-to'g'ri Tahrir", "chiroyli terminal va tezkor ochish", kBox, kBox);

      const kR1 = P(u, 6.2, 0.6);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ranglar Tizimi (color.ui)", 1160, 290, C.green, { size: 16, mono: false });
        text("$ git config set --global color.ui auto", 1030, 340, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• git status, git diff va git branch chiqishlarini chiroyli ranglaydi.", 1030, 385, { size: 16, color: C.text, align: 'left' });
        text("• 'auto' opsiyasi chiqish faylga uzatilganda rang kodlarini o'chiradi.", 1030, 420, { size: 16, color: C.mute, align: 'left' });
        text("• Zamonaviy Git'da bu sozlama standart yoqilgan bo'ladi.", 1030, 455, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 8.8, 0.6);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Faylni Muharrirda Ochish (edit)", 1190, 555, C.yellow, { size: 16, mono: false });
        text("$ git config edit --global", 1030, 605, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("• ~/.gitconfig faylini to'g'ridan-to'g'ri matn muharririda ochadi.", 1030, 650, { size: 16, color: C.text, align: 'left' });
        text("• Bir nechta alias yoki sozlamani birdaniga tahrirlashda qulay.", 1030, 685, { size: 16, color: C.text, align: 'left' });
        text("• Saqlab yopishingiz bilan Git yangi qiymatlarni darhol qabul qiladi.", 1030, 720, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 11.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.git });
      text("Muharrir va standart brenchni oldindan belgilab qo'yish kundalik ishni ancha osonlashtiradi.", 960, 895, { size: 24, weight: 700, color: C.git, align: 'center' });
      text("Endi internetga ulanmasdan ishlaydigan rasmiy 'git help' tizimini ko'ramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 5-SAHNA: Git Help va Ma'lumotnoma
  // ==========================================
  function sceneYordamTizimi(u, bounds) {
    chip(5, "Git Help va Ma’lumotnoma", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      // Chap panel: Buyruq yordami
      panel(100, 140, 840, 680, C.blue, "Buyruq Bo'yicha Yordam", "3 xil yo'l bilan ma'lumot olish", kBox, kBox);

      const kH1 = P(u, 1.2, 0.6);
      withA(kH1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("1 · Tezkor Konspekt (-h)", 250, 290, C.purple, { size: 16, mono: false });
        text("$ git commit -h", 150, 335, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 600 });
        text("Terminaldan chiqmasdan barcha opsiyalar ro'yxatini ko'rish.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kH2 = P(u, 3.5, 0.6);
      withA(kH2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH2)) * 16);
        card(125, 435, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · To'liq Ma'lumotnoma (man page)", 280, 470, C.green, { size: 16, mono: false });
        text("$ git help commit   yoki   $ git commit --help", 150, 515, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("To'liq rasmiy ma'lumotnoma; butunlay OFLAYN ishlaydi!", 150, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kH3 = P(u, 5.8, 0.6);
      withA(kH3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("3 · Veb Ko'rinish (-w)", 230, 655, C.blue, { size: 16, mono: false });
        text("$ git help -w commit", 150, 700, { size: 18, fam: MONO, color: C.blue, align: 'left', weight: 600 });
        text("Qo'llanmani brauzerda chiroyli HTML formatida ochib beradi.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Qo'llanmalar to'plami
      panel(980, 140, 840, 680, C.git, "Tizimli Qo'llanmalar (Guides)", "git help -a va git help -g", kBox, kBox);

      const kG1 = P(u, 7.5, 0.6);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,107,122,0.08)', col: C.git });
        pill("Barcha 190+ Buyruqlar (-a)", 1170, 290, C.git, { size: 16, mono: false });
        text("$ git help -a", 1030, 335, { size: 18, fam: MONO, color: C.git, align: 'left', weight: 600 });
        text("Barcha kundalik (porcelain) va ichki (plumbing) buyruqlar ro'yxati.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 9.8, 0.6);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 435, 790, 175, { fill: 'rgba(255,181,71,0.08)', col: C.orange });
        pill("Mavzular va Tushunchalar (-g)", 1170, 470, C.orange, { size: 16, mono: false });
        text("$ git help -g", 1030, 515, { size: 18, fam: MONO, color: C.orange, align: 'left', weight: 600 });
        text("Alohida amaliy qo'llanmalar to'plamini ko'rsatadi:", 1030, 555, { size: 16, color: C.text, align: 'left' });
        text("everyday, tutorial, revisions, workflows, gitcli", 1030, 585, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 11.8, 0.6);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(1005, 630, 790, 155, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Masalan: Revision Sintaksisi", 1170, 665, C.green, { size: 16, mono: false });
        text("$ git help revisions", 1030, 710, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("HEAD~3, master..feature kabi barcha tanlash sirlari.", 1030, 745, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 13.5, 0.7);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Git yordam tizimi to'liq oflayn ishlaydi va har qanday savolga rasmiy javob beradi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi 03-bobning asosiy xulosalarini umumlashtiramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "03-Bob Xulosasi", u);

    const kBox = eo(P(u, 0.4, 0.6));
    withA(kBox, () => {
      const cards = [
        {
          num: "1",
          title: "Konfig Darajalari",
          col: C.blue,
          items: [
            "system (/etc) butun tizim",
            "global (~/.gitconfig) siz uchun",
            "local (.git/config) joriy repo",
            "Tor daraja kengidan ustun turadi"
          ]
        },
        {
          num: "2",
          title: "Asosiy Sozlamalar",
          col: C.green,
          items: [
            "user.name & user.email identifikatsiya",
            "core.editor: VS Code yoki nano",
            "init.defaultBranch: main nomi",
            "Yangi get, set, unset subkomandalari"
          ]
        },
        {
          num: "3",
          title: "Rasmiy Yordam",
          col: C.git,
          items: [
            "git help <buyruq> oflayn man",
            "git <buyruq> -h tezkor konspekt",
            "git help -a barcha 190+ buyruqlar",
            "git help -g nazariy qo'llanmalar"
          ]
        }
      ];

      const cW = 540, cH = 480;
      cards.forEach((c, i) => {
        const cx = 100 + i * 590;
        const cy = 160;
        const kc = P(u, 0.6 + i * 0.4, 0.6);
        withA(kc, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kc)) * 16);
          card(cx, cy, cW, cH, { fill: 'rgba(15,22,48,0.92)', col: c.col });
          pill(c.num + " · " + c.title, cx + cW / 2, cy + 45, c.col, { size: 20, mono: false });

          c.items.forEach((item, j) => {
            const iy = cy + 120 + j * 80;
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; rr(cx + 35, iy, cW - 70, 60, 10); ctx.fill();
            ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(cx + 55, iy + 30, 6, 0, 7); ctx.fill();
            text(item, cx + 78, iy + 31, { size: 17, weight: 600, align: 'left', color: C.text });
          });
          ctx.restore();
        });
      });

      // Pastki xulosa
      const kFoot = P(u, 2.5, 0.8);
      withA(kFoot, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 680, 1720, 320, { fill: 'rgba(18,26,58,0.95)', col: C.git });
        text("Keyingi bob: 04 — Repozitoriy Olish: init va clone", 960, 745, { size: 34, weight: 800, color: C.git, align: 'center' });
        text("Noldan repozitoriy yaratish va masofaviy loyihalarni klonlashni boshlaymiz.", 960, 810, { size: 22, color: C.text, align: 'center' });
        text("E'tiboringiz uchun rahmat! · dev-docs.uz", 960, 875, { size: 20, weight: 600, color: C.mute, align: 'center' });
        ctx.restore();
      });
    });
  }

  // Asosiy kadr chizuvchi
  window.renderFrame = function (t) {
    bg(t);
    const sc = TM.scenes;
    if (t < sc.darajalar_va_ustunlik.s) {
      sceneIntro(t - sc.intro.s, { s: sc.intro.s, e: sc.intro.e });
    } else if (t < sc.identifikatsiya_va_sintaksis.s) {
      sceneDarajalarUstunlik(t - sc.darajalar_va_ustunlik.s, { s: sc.darajalar_va_ustunlik.s, e: sc.darajalar_va_ustunlik.e });
    } else if (t < sc.muhim_sozlamalar.s) {
      sceneIdentifikatsiyaSintaksis(t - sc.identifikatsiya_va_sintaksis.s, { s: sc.identifikatsiya_va_sintaksis.s, e: sc.identifikatsiya_va_sintaksis.e });
    } else if (t < sc.yordam_tizimi.s) {
      sceneMuhimSozlamalar(t - sc.muhim_sozlamalar.s, { s: sc.muhim_sozlamalar.s, e: sc.muhim_sozlamalar.e });
    } else if (t < sc.xulosa.s) {
      sceneYordamTizimi(t - sc.yordam_tizimi.s, { s: sc.yordam_tizimi.s, e: sc.yordam_tizimi.e });
    } else {
      sceneXulosa(t - sc.xulosa.s, { s: sc.xulosa.s, e: sc.xulosa.e });
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    bg(0);
    // 03-bob muqovasi (Markaz pleyer tugmasi uchun qulay)
    pill("03-BOB · SOZLASH VA YORDAM", 960, 160, C.git, { size: 26, mono: false });
    text("Birinchi Sozlash va Yordam", 960, 230, { size: 64, weight: 800, color: C.text, fam: UI });
    text("user.name, user.email, 5 daraja ierarxiyasi va git help", 960, 290, { size: 28, color: C.mute, fam: UI });

    // Markaziy konfiguratsiya kartasi
    card(480, 410, 960, 280, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2.5 });
    pill("$ git config list --show-origin", 960, 480, C.blue, { size: 24 });
    text("global  ~/.gitconfig  user.name = Ali Valiyev", 960, 550, { size: 24, fam: MONO, color: C.green, weight: 700 });
    text("global  ~/.gitconfig  user.email = ali@example.com", 960, 615, { size: 22, fam: MONO, color: C.mute });

    // Pastki xulosa
    card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
    text("Git sozlamalari har bir kommitning tarixiy mualliflik poydevorini belgilaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
    text("Barcha keyingi boblardagi amallar shu sozlamalar asosida ishlaydi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
  };
})();
