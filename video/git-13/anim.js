// Git 13-bob videosi: "Plumbing, porcelain va .git papkasi"
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
  // 1-SAHNA: Porcelain va Plumbing Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("13-BOB · PLUMBING VA PORCELAIN", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Plumbing, Porcelain va .git Papkasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Git'ning ichki mexanizmlari, quvurlar qatlami va butun omborning asosi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Git Buyruqlarining Ikki Asosiy Qatlami", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Porcelain (Chinni Lavabo)", 670, 615, C.yellow, { size: 18 });
          text("• Foydalanuvchiga qulay: add, commit, status, log", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Chiroyli ranglar, maslahatlar va tushunarli matn", 430, 680, { size: 15, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Plumbing (Quvurlar)", 1250, 615, C.cyan, { size: 18 });
          text("• Tizim ostidagi poydevor: hash-object, cat-file", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Skriptlar uchun barqaror va qat'iy mashina tili", 1010, 680, { size: 15, color: C.cyan, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Porcelain va Plumbing Tushunchasi", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Porcelain qatlami
      panel(100, 140, 840, 680, C.yellow, "Porcelain — Foydalanuvchi Qatlami", "chinni lavabo: qulay, tushunarli va chiroyli", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Kundalik Asosiy Buyruqlar", 240, 290, C.yellow, { size: 16, mono: false });
        text("• git add, git commit, git status, git switch, git branch.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Biz har kuni terminalda ishlatadigan 20-30 ta qulay buyruq.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Inson Uchun Moslangan Chiqish", 255, 470, C.cyan, { size: 16, mono: false });
        text("• Xatolarni tushuntiruvchi maslahatlar va yo'naltiruvchi xabarlar.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Terminaldagi qulay ranglar va qisqartirilgan xulosalar.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgaruvchanlik Erkinligi", 230, 655, C.mute, { size: 16, mono: false });
        text("• Git jamoasi odamlar tajribasini oshirish uchun chiqishni yangilaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shu sababli skriptlar uchun porcelain chiqishiga tayanish xavfli.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Plumbing qatlami
      panel(980, 140, 840, 680, C.blue, "Plumbing — Tizim Quvurlari", "devor ichidagi quvurlar: barqaror va qat'iy", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Low-level Quvurlar", 1120, 290, C.green, { size: 16, mono: false });
        code("hash-object, cat-file, write-tree, commit-tree, update-ref", 1030, 335, { size: 16, color: C.yellow });
        text("Kapot ostida aynan shu buyruqlar ma'lumotlarni boshqaradi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Skriptlar Uchun 100% Barqaror", 1170, 470, C.blue, { size: 16, mono: false });
        text("• Chiqishi quruq, aniq va hech qachon o'zgarmas formatda bo'ladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• CI/CD, IDE va tashqi dasturlar aynan shu qatlamga tayanadi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 16.5, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Git Tarixi: VCS Uchun Asboblar", 1160, 655, C.mute, { size: 16, mono: false });
        text("• Git dastlab to'liq VCS emas, VCS yasash asbobi sifatida yozilgan.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Unix falsafasi: har bir buyruq faqat bitta ishni a'lo darajada bajaradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega Ikki Qatlam Kerak?
  // ==========================================
  function sceneNegaIkkiQatlam(u, bounds) {
    chip(2, "Nega Ikki Qatlam Kerak?", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Odamlar ehtiyoji
      panel(100, 140, 840, 680, C.purple, "Odamlar Ehtiyoji (Porcelain)", "qulaylik, maslahat va erkin yangilanish", kBox, kBox);

      const kL1 = P(u, 1.2, 0.45);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Tushunarli Matn va Maslahat", 240, 290, C.purple, { size: 16, mono: false });
        code("$ git status", 150, 335, { size: 18, color: C.yellow });
        text("Inson uchun: 'use \"git add <file>...\" to update what will be committed'.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.2, 0.45);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("O'zgarishlar Xavfi", 200, 470, C.purple, { size: 16, mono: false });
        text("• Yangi versiyada so'zlar yoki ranglar o'zgarsa odam oson tushunadi.", 150, 515, { size: 16, color: C.text, align: 'left' });
        text("• Ammo shu matnga tayangan skript darhol xato bilan sinadi.", 150, 555, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kL3 = P(u, 5.2, 0.45);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Birlashtirilgan Qadamlar", 230, 655, C.mute, { size: 16, mono: false });
        text("• Bitta 'git commit' buyrug'i bir nechta pastki qadamni birlashtiradi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Bu foydalanuvchiga qulay, ammo ichki mexanizmni yashiradi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Skriptlar ehtiyoji
      panel(980, 140, 840, 680, C.green, "Skriptlar Ehtiyoji (Plumbing)", "mashina tili va 100% barqarorlik", kBox, kBox);

      const kR1 = P(u, 7.8, 0.45);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Hech Qachon O'zgarmas Format", 1165, 290, C.green, { size: 16, mono: false });
        code("$ git status --porcelain", 1030, 335, { size: 17, color: C.yellow });
        code("M  README.md   |   ?? yangi.txt", 1030, 370, { size: 17, color: C.green });
        ctx.restore();
      });

      const kR2 = P(u, 9.8, 0.45);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("Unix Falsafasi: Kichik va Aniq", 1150, 470, C.green, { size: 16, mono: false });
        text("• rev-parse faqat nomni to'liq hash'ga aylantiradi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• cat-file faqat obyekt turini yoki xom mazmunini chiqaradi.", 1030, 555, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.8, 0.45);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Muqobil Asboblar Poydevori", 1150, 655, C.mute, { size: 16, mono: false });
        text("• VS Code, GitKraken, GitHub hosting xizmatlari plumbing'ga tayanadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ular pastki qatlam orqali o'z shaxsiy interfeyslarini yaratadi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: .git Papkasi — Ombirning Asli
  // ==========================================
  function sceneGitPapkasi(u, bounds) {
    chip(3, ".git Papkasi — Omborning Asli", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: .git ombori
      panel(100, 140, 840, 680, C.blue, ".git Papkasi — Haqiqiy Repo", "fayllaringiz faqat undan olingan ish nusxasidir", kBox, kBox);

      const kP1 = P(u, 1.2, 0.45);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Omborning Yagona Manbasi", 230, 290, C.blue, { size: 16, mono: false });
        text("• Loyihangizdagi hamma tarix, branch va konfiguratsiyalar shu yerda.", 150, 335, { size: 16, color: C.text, align: 'left' });
        text("• Ishchi fayllar (working tree) — .git ma'lumotidan olingan nusxa xolos.", 150, 375, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.2, 0.45);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("config va Sozlamalar", 200, 470, C.cyan, { size: 16, mono: false });
        code(".git/config: [core] bare = false, filemode = true", 150, 515, { size: 16, color: C.yellow });
        text("Repo darajasidagi sozlamalar va format versiyasi saqlanadi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.2, 0.45);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Kam Ahamiyatli Fayllar", 210, 655, C.mute, { size: 16, mono: false });
        text("• description — faqat qadimgi GitWeb brauzeri uchun nom.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• info/exclude — commit qilinmaydigan shaxsiy ignore ro'yxati.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 4 ta ustun
      panel(980, 140, 840, 680, C.yellow, "Git Yadrosining 4 Asosiy Ustuni", "pro git ta'rifi bo'yicha markaziy tuzilma", kBox, kBox);

      const kD1 = P(u, 7.8, 0.45);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · objects/ — Ma'lumotlar Bazasi", 1180, 290, C.yellow, { size: 16, mono: false });
        text("• Barcha kontent: fayllar (blob), papkalar (tree), commitlar va teglar.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Kontent-adreslanadigan o'zgarmas obyektlar ombori.", 1030, 375, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kD2 = P(u, 9.8, 0.45);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · refs/ — Commit Ko'rsatkichlari", 1175, 470, C.green, { size: 16, mono: false });
        text("• refs/heads/ (branchlar) va refs/tags/ (teglar).", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Commit hash'larini o'z ichida saqlovchi 41 baytlik ko'rsatkich fayllar.", 1030, 555, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kD3 = P(u, 11.8, 0.45);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("3 · HEAD va index Fayli", 1130, 655, C.cyan, { size: 16, mono: false });
        text("• HEAD — hozir qaysi branchda turganingiz (ref: refs/heads/main).", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• index — staging area holatini saqlovchi ikkilik DIRC fayli.", 1030, 735, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: add va commit Ichkaridan Qanday Ishlaydi?
  // ==========================================
  function sceneAddVaCommitIchida(u, bounds) {
    chip(4, "add va commit Ichkaridan Qanday Ishlaydi?", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: git add
      panel(100, 140, 840, 680, C.green, "git add — Ichki Jarayon", "blob obyektini yozish va indexni yangilash", kBox, kBox);

      const kA1 = P(u, 1.2, 0.45);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Blob Obyekti Yaratiladi", 235, 290, C.green, { size: 16, mono: false });
        code(".git/objects/11/d3bc143b7a3f7ce57df79bc7db609d55208b1f", 150, 335, { size: 15, color: C.yellow });
        text("Fayl mazmuni zlib bilan siqilib, omborga yoziladi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kA2 = P(u, 3.2, 0.45);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("2 · .git/index Fayliga Yoziladi", 240, 470, C.green, { size: 16, mono: false });
        code("$ git ls-files -s", 150, 510, { size: 17, color: C.cyan });
        code("100644 11d3bc14... 0  README.md", 150, 545, { size: 16, color: C.green });
        text("Fayl ruxsati, yo'li va blob hash'i dircache'ga qo'shiladi.", 150, 575, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kA3 = P(u, 5.2, 0.45);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Plumbing Ekvivalenti", 200, 655, C.mute, { size: 16, mono: false });
        code("$ git hash-object -w README.md", 150, 700, { size: 16, color: C.yellow });
        code("$ git update-index --add README.md", 150, 735, { size: 16, color: C.cyan });
        ctx.restore();
      });

      // O'ng panel: git commit
      panel(980, 140, 840, 680, C.blue, "git commit — Ichki Jarayon", "tree, commit obyekti va ref siljishi", kBox, kBox);

      const kC1 = P(u, 7.8, 0.45);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("1 · write-tree (Katalog Surati)", 1160, 290, C.blue, { size: 16, mono: false });
        code("$ git write-tree  --> 2710338... (tree)", 1030, 335, { size: 16, color: C.yellow });
        text("Index'dagi barcha fayllar ro'yxatidan papka obyekti tuziladi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 9.8, 0.45);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2 · commit-tree (Commit Obyekti)", 1170, 470, C.cyan, { size: 16, mono: false });
        code("$ git commit-tree 2710338 -m \"Birinchi commit\"", 1030, 515, { size: 16, color: C.cyan });
        text("Tree hash'i, muallif, sana va xabardan commit obyekti yasaladi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 11.8, 0.45);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · update-ref va reflog", 1130, 655, C.green, { size: 16, mono: false });
        code("$ git update-ref refs/heads/main <yangi-hash>", 1030, 700, { size: 15, color: C.green });
        text("Branch ko'rsatkichi siljitiladi va .git/logs/HEAD ga qayd etiladi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: O‘z Git Buyrug‘ingizni Yaratish
  // ==========================================
  function scenePlumbingAmalda(u, bounds) {
    chip(5, "O‘z Git Buyrug‘ingizni Yaratish", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Skriptlar uchun plumbing
      panel(100, 140, 840, 680, C.cyan, "Skriptlar Uchun Plumbing", "mashina tili: toza, aniq va tezkor", kBox, kBox);

      const kE1 = P(u, 1.2, 0.45);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git status --porcelain=v2", 230, 290, C.cyan, { size: 16, mono: false });
        code("# branch.head main", 150, 335, { size: 16, color: C.yellow });
        code("1 .M 100644 11d3bc... README.md", 150, 365, { size: 16, color: C.green });
        text("Skriptlar uchun eng ishonchli va barqaror holat ma'lumoti.", 150, 395, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE2 = P(u, 3.2, 0.45);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("rev-parse va symbolic-ref", 230, 470, C.cyan, { size: 16, mono: false });
        code("$ git rev-parse --short HEAD  --> 9f648d7", 150, 515, { size: 16, color: C.cyan });
        code("$ git symbolic-ref --short HEAD --> main", 150, 550, { size: 16, color: C.yellow });
        text("Hech qanday ortiqcha matnsiz sof nomlar va hash'larni olish.", 150, 580, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE3 = P(u, 5.2, 0.45);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("cat-file va ls-tree", 200, 655, C.mute, { size: 16, mono: false });
        code("$ git cat-file -p HEAD  (commit tafsiloti)", 150, 700, { size: 16, color: C.yellow });
        code("$ git ls-tree HEAD      (fayllar va blob hashlar)", 150, 735, { size: 16, color: C.cyan });
        ctx.restore();
      });

      // O'ng panel: Shaxsiy buyruq
      panel(980, 140, 840, 680, C.purple, "Shaxsiy git-<nom> Buyrug'i", "PATH orqali Git'ni kengaytirish", kBox, kBox);

      const kM1 = P(u, 7.8, 0.45);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Bajariladigan Skript Yozish", 1160, 290, C.purple, { size: 16, mono: false });
        code("#!/bin/sh  (fayl: git-holat)", 1030, 335, { size: 16, color: C.yellow });
        code("echo \"branch: $(git symbolic-ref --short HEAD)\"", 1030, 365, { size: 15, color: C.green });
        code("echo \"commit: $(git rev-parse --short HEAD)\"", 1030, 395, { size: 15, color: C.cyan });
        ctx.restore();
      });

      const kM2 = P(u, 9.8, 0.45);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("PATH'ga Joylashtirish", 1125, 470, C.purple, { size: 16, mono: false });
        code("$ chmod +x ~/bin/git-holat", 1030, 515, { size: 17, color: C.yellow });
        text("Fayl nomi 'git-' bilan boshlansa va PATH'da bo'lsa, Git uni taniydi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kM3 = P(u, 11.8, 0.45);
      withA(kM3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Git Buyrug'idek Ishlatish", 1140, 655, C.green, { size: 16, mono: false });
        code("$ git holat", 1030, 700, { size: 18, color: C.yellow });
        code("branch: main  |  commit: 9f648d7", 1030, 735, { size: 16, color: C.green });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Keyingi Qadam
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xulosa va Keyingi Qadam", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Plumbing va .git xulosasi
      panel(100, 140, 840, 520, C.green, "Plumbing va .git Bo‘yicha Xulosa", "ichki mexanizmlar poydevori", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Ikki Qatlam Vazifasi", 230, 275, C.green, { size: 15, mono: false });
        text("Porcelain odam uchun qulay, Plumbing esa skript uchun 100% barqaror.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · .git Yadrosi: 4 Asosiy Ustun", 260, 405, C.blue, { size: 15, mono: false });
        text("objects (baza), refs (ko'rsatkichlar), HEAD va index (staging area).", 150, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Har Bir Qadam Shaffof", 235, 535, C.yellow, { size: 15, mono: false });
        text("add va commit sehrli emas; ular aniq obyektlar va ref fayllarini yangilaydi.", 150, 575, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tavsiyalar
      panel(980, 140, 840, 520, C.blue, "Amaliy Tavsiyalar", "chuqur bilim va avtomatlashtirish", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("1 · Skriptlarda Plumbing Ishlating", 1165, 275, C.cyan, { size: 15, mono: false });
        text("git status o'rniga git status --porcelain, rev-parse va for-each-ref tanlang.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("2 · Murakkab Muammolarni Hal Qilish", 1175, 405, C.purple, { size: 15, mono: false });
        text("Plumbing bilimi Git'da yuz berishi mumkin bo'lgan har qanday xatoni yechadi.", 1030, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · O'z Asboblaringizni Kengaytiring", 1160, 535, C.green, { size: 15, mono: false });
        text("Kompaniya yoki shaxsiy ish jarayonlaringiz uchun maxsus buyruqlar quring.", 1030, 575, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Obyektlar — Blob va Hash", 290, 725, C.git, { size: 16, mono: false });
        text("Keyingi 14-bobda: Git'ning eng birinchi g‘ishti — Blob obyektlari va SHA-1 hash hisoblash!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("git hash-object bilan fayl mazmunidan obyekt yasash, zlib siqilishi va objects papkasida qidirishni to'liq o'rganamiz.", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Git ichki arxitekturasi bilan tanishib, endi uning obyektlar omboriga to'g'ridan-to'g'ri qo'l tekkizamiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'nega_ikki_qatlam', fn: sceneNegaIkkiQatlam },
      { id: 'git_papkasi', fn: sceneGitPapkasi },
      { id: 'add_va_commit_ichida', fn: sceneAddVaCommitIchida },
      { id: 'plumbing_amalda', fn: scenePlumbingAmalda },
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
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();
