// Git 14-bob videosi: "Obyektlar: blob va hash"
// Canvas render (1920x1080, 30fps) — GIT-VIDEO-USLUBI.md
(function () {
  const ctx = document.getElementById('c').getContext('2d');
  const kit = window.GITKIT(ctx);
  const {
    W, H, C, UI, MONO,
    clamp, P, lerp, eo, eio, eback, font, withA, rr,
    tw, text, bg, ring, burst, link, pill,
    fileChip, chip, panel, card, terminal
  } = kit;

  const TM = window.TM, NR = window.NR;

  // Real terminalda buyruqlarni jonli harfma-harf yozish va kursor miltillashi
  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
    const tPrompt = opt.tPromptShow != null ? opt.tPromptShow : tStart - 0.3;
    if (u < tPrompt) return;

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
  // 1-SAHNA: Git Kalit-Qiymat Ombori va Blob
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("14-BOB · OBYEKTLAR: BLOB VA HASH", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Git Kalit-Qiymat Ombori va Blob", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Manzili o‘z mazmunidan kelib chiqadigan kontent-adreslanuvchi ma’lumotlar bazasi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Fayl Tizimi va Git Kontent Ombori Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Oddiy Fayl Tizimi", 670, 615, C.yellow, { size: 18 });
          text("• Fayl qayerda joylashgani bilan topiladi", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• /home/user/loyiha/app.txt", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Git Kontent Ombori", 1250, 615, C.cyan, { size: 18 });
          text("• Fayl nima mazmundan iboratligi bilan topiladi", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• 83baae61804e65cc73a7201a... (SHA-1 hash)", 1010, 680, { size: 15, fam: MONO, color: C.cyan, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Git Kalit-Qiymat Ombori va Blob", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Kalit-qiymat ombori
      panel(100, 140, 840, 680, C.yellow, "Kalit-Qiymat Ombori", "content-addressable filesystem", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Mazmundan Olingan Kalit", 240, 290, C.yellow, { size: 16, mono: false });
        text("• Git'ga ixtiyoriy baytlarni berasiz, u kontentni saqlab kalit beradi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Kalit — saqlanayotgan baytlarning 40 belgili SHA-1 hashidir.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Kutubxona O'xshatishi", 215, 470, C.cyan, { size: 16, mono: false });
        text("• Kitobga javon raqami emas, matnining 'barmoq izi' yopishtiriladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bir xil matnli ikki kitob — bitta barmoq izi va bitta joy.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmaslik Qoidasi", 215, 655, C.mute, { size: 16, mono: false });
        text("• Obyekt bir marta omborga yozilgach, hech qachon o'zgarmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Bitta bayt o'zgarsa — hash o'zgaradi va u yangi obyektga aylanadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 4 ta obyekt turi
      panel(980, 140, 840, 680, C.blue, "Git'dagi 4 Xil Obyekt Turi", "har birining o'z aniq vazifasi bor", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 12.4, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · blob (Binary Large Object)", 1170, 290, C.green, { size: 16, mono: false });
        text("• Faqat fayl mazmunini saqlaydi (nomisiz va huquqlarisiz).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Git omboridagi eng sodda va poydevor obyekt turi.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · tree (Katalog Surati)", 1135, 470, C.blue, { size: 16, mono: false });
        text("• Papka tuzilishi: fayl nomlari, ruxsatlar (100644) va blob hashlar.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Blob va boshqa tree obyektlarini daraxt shaklida bog'laydi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 16.5, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3 · commit va 4 · tag", 1120, 655, C.mute, { size: 16, mono: false });
        text("• commit: tree obyekti + ota commitlar + muallif + sana + xabar.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• tag: annotated teg obyekti — relizga doimiy ko'rsatkich.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Hash Nega Mazmundan Olinadi?
  // ==========================================
  function sceneHashMohiyati(u, bounds) {
    chip(2, "Hash Nega Mazmundan Olinadi?", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Afzalliklari
      panel(100, 140, 840, 680, C.purple, "Afzalliklari", "mazmun heshiga tayanishning 4 qudrati", kBox, kBox);

      const kL1 = P(u, 1.2, 0.45);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("1 · Takrorlanish Yo'qoladi (Deduplication)", 290, 290, C.purple, { size: 16, mono: false });
        text("• Loyihada 50 ta bir xil fayl bo'lsa ham, Git'da faqat bitta blob saqlanadi.", 150, 335, { size: 16, color: C.text, align: 'left' });
        text("• 1000 ta fayldan 2 tasi o'zgarsa, keyingi commitda faqat 2 ta yangi blob paydo bo'ladi.", 150, 375, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.2, 0.45);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("2 · Butunlik Tekshiruvi Bepul", 240, 470, C.purple, { size: 16, mono: false });
        text("• Diskdagi birgina bit buzilsa ham, hash mos kelmay qoladi.", 150, 515, { size: 16, color: C.text, align: 'left' });
        text("• 'git fsck' har qanday yashirin buzilishni darhol fosh etadi.", 150, 555, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kL3 = P(u, 5.2, 0.45);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("3 · Taqsimlangan Tizimda Kelishuv", 265, 655, C.mute, { size: 16, mono: false });
        text("• Ikki dasturchi bir xil faylni yaratsa, bir xil hash chiqadi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Server bilan solishtirishda faqat hashlar almashiladi, fayl qayta yuborilmaydi.", 150, 735, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: SHA-1 standarti
      panel(980, 140, 840, 680, C.green, "SHA-1 Hash Standarti", "160 bitli barmoq izi va snapshot modeli", kBox, kBox);

      const kR1 = P(u, 7.8, 0.45);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("40 Belgili O'n Oltilik Satr", 1160, 290, C.green, { size: 16, mono: false });
        code("d670460b4b4aece5915caf5c68d12f560a9fe3e4", 1030, 335, { size: 17, color: C.yellow });
        text("Bitta kirish biti o'zgarsa, natija butunlay boshqacha bo'ladi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 9.8, 0.45);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("Diff Emas, To'liq Mazmun", 1140, 470, C.green, { size: 16, mono: false });
        text("• Git o'zgarishlar farqini (diff) emas, to'liq fayllarni saqlaydi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Joy tejash keyinroq, packfile'da delta siqish bilan amalga oshadi.", 1030, 555, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kR3 = P(u, 11.8, 0.45);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Kelajak Standarti: SHA-256", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Git yangi repolarda SHA-256 (64 belgili hash)ni qo'llab-quvvatlaydi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ammo bugungi kunda standart SHA-1 hali ham eng keng tarqalgan.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git hash-object va git cat-file (REAL TERMINAL)
  // ==========================================
  function sceneHashObjectCatFile(u, bounds) {
    chip(3, "git hash-object va git cat-file", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda blob yaratish va cat-file orqali tekshirish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: echo 'test content' | git hash-object -w --stdin (u: 0.6 to 2.4, Enter 2.6)
      drawCommandLine("ombor $ ", "echo 'test content' | git hash-object -w --stdin", 0.6, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("d670460b4b4aece5915caf5c68d12f560a9fe3e4", 2.8, tu, 130, 230, { color: C.yellow, weight: 600 });

      // 2-buyruq: git cat-file -t (u: 4.0 to 5.2, Enter 5.4)
      drawCommandLine("ombor $ ", "git cat-file -t d670460b", 4.0, 5.2, 5.4, tu, 130, 265);
      drawOutputLine("blob", 5.6, tu, 130, 290, { color: C.green, weight: 700 });

      // 3-buyruq: git cat-file -s (u: 6.8 to 8.0, Enter 8.2)
      drawCommandLine("ombor $ ", "git cat-file -s d670460b", 6.8, 8.0, 8.2, tu, 130, 325);
      drawOutputLine("13  # bayt hajmi ('test content' + \\n)", 8.4, tu, 130, 350, { color: C.cyan, weight: 600 });

      // 4-buyruq: git cat-file -p (u: 9.6 to 10.8, Enter 11.0)
      drawCommandLine("ombor $ ", "git cat-file -p d670460b", 9.6, 10.8, 11.0, tu, 130, 385);
      drawOutputLine("test content", 11.2, tu, 130, 410, { color: C.text, weight: 600 });

      // 5-buyruq: bir xil mazmunli boshqa fayl (u: 12.2 to 14.4, Enter 14.6)
      drawCommandLine("ombor $ ", "printf 'test content\\n' > boshqa.txt && git hash-object boshqa.txt", 12.2, 14.4, 14.6, tu, 130, 445);
      drawOutputLine("d670460b4b4aece5915caf5c68d12f560a9fe3e4", 14.8, tu, 130, 470, { color: C.green, weight: 700 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 15.4, tu, 130, 505, { color: '#334155' });
      drawOutputLine("Isbot: Fayl nomi boshqa bo'lsa ham mazmun bir xil", 15.8, tu, 130, 535, { color: C.cyan, weight: 600 });
      drawOutputLine("bo'lgani sababli aynan bitta SHA-1 kalit qaytdi!", 16.2, tu, 130, 560, { color: C.yellow, weight: 700 });

      // O'ng panel: Buyruq parametrlari va tahlil
      panel(980, 140, 840, 680, C.yellow, "Plumbing Buyruqlari Tahlili", "hash-object va cat-file imkoniyatlari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git hash-object Kalitlari", 1150, 290, C.yellow, { size: 16, mono: false });
        text("• -w (write): Obyektni omborga (.git/objects/) haqiqatda yozadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• --stdin: Mazmunni alohida faylsiz standart oqimdan qabul qiladi.", 1030, 370, { size: 16, color: C.yellow, align: 'left' });
        text("• -w qo'yilmasa, Git faqat potentsial hashni hisoblab chiqaradi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git cat-file: Obyektlar Ko'zgusi", 1170, 470, C.cyan, { size: 16, mono: false });
        text("• -t (type): Obyekt turi (blob, tree, commit, tag).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• -s (size): Mazmunning baytlardagi sof hajmi.", 1030, 550, { size: 17, color: C.cyan, align: 'left' });
        text("• -p (pretty-print): Inson o'qiy oladigan shaklda ekranga chiqarish.", 1030, 580, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Blob Nega Fayl Nomini Bilmaydi?", 1180, 655, C.green, { size: 16, mono: false });
        text("• Blob faqat baytlar to'plami bo'lib, unga fayl nomi qiziq emas.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Nomlar va katalog daraxti alohida 'tree' obyektida saqlanadi.", 1030, 735, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Obyekt Faylining Ichki Tuzilishi (REAL TERMINAL)
  // ==========================================
  function sceneObyektIchkiTuzilishi(u, bounds) {
    chip(4, "Obyekt Faylining Ichki Tuzilishi", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda .git/objects papkasini ochish va zlib'ni tekshirish
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: find .git/objects -type f (u: 0.6 to 1.8, Enter 2.0)
      drawCommandLine("ombor $ ", "find .git/objects -type f", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine(".git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4", 2.2, tu, 130, 230, { color: C.yellow });

      // 2-buyruq: xxd orqali xom siqilgan baytlarni ko'rish (u: 3.5 to 5.4, Enter 5.6)
      drawCommandLine("ombor $ ", "xxd .git/objects/d6/70460b* | head -n 2", 3.5, 5.4, 5.6, tu, 130, 265);
      drawOutputLine("00000000: 7801 4bca c94f 5230 3466 2849...  x.K..OR04f(I...", 5.8, tu, 130, 290, { color: C.cyan });
      drawOutputLine("  # 78 01: zlib siqish oqimining rasmiy boshlang'ich baytlari", 6.2, tu, 130, 315, { color: C.mute });

      // 3-buyruq: python yordamida zlib'dan ochish (u: 7.8 to 10.4, Enter 10.6)
      drawCommandLine("ombor $ ", "python3 -c \"import zlib; print(zlib.decompress(open('.git/objects/d6/70460b...','rb').read()))\"", 7.8, 10.4, 10.6, tu, 130, 350);
      drawOutputLine("b'blob 13\\x00test content\\n'", 10.9, tu, 130, 375, { color: C.green, weight: 700 });

      // 4-buyruq: ls -la bilan huquqlar va hajmni ko'rish (u: 12.2 to 13.6, Enter 13.8)
      drawCommandLine("ombor $ ", "ls -lh .git/objects/d6/", 12.2, 13.6, 13.8, tu, 130, 410);
      drawOutputLine("-r--r--r-- 1 dev staff 37B Oct 21 70460b4b4aece5915caf5c68d12f560a9fe3e4", 14.1, tu, 130, 435, { color: C.text });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 14.8, tu, 130, 470, { color: '#334155' });
      drawOutputLine("Tuzilma: [tur: blob] [bo'shliq] [hajm: 13] [\\0 bayt] [mazmun]", 15.3, tu, 130, 500, { color: C.yellow, weight: 700 });
      drawOutputLine("Fayl nomi esa 2 belgi (papka) + 38 belgi (fayl)ga bo'linadi.", 15.8, tu, 130, 525, { color: C.cyan, weight: 600 });

      // O'ng panel: 2 + 38 sxemasi va zlib
      panel(980, 140, 840, 680, C.green, "Ichki Fayl Sxemasi", "sarlavha, zlib va 2+38 fan-out katalogi", kBox, kBox);

      const kC1 = P(u, 1.0, 0.5);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Sarlavha Formati (Header)", 1160, 290, C.green, { size: 16, mono: false });
        code('"blob" + " " + "<hajm>" + "\\0" + <mazmun>', 1030, 335, { size: 17, color: C.yellow });
        text("Hajm — faqat mazmunniki (13 bayt), sarlavhaniki hisobga kirmaydi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 6.0, 0.5);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Nega 2 + 38 Papkalar Sxemasi?", 1180, 470, C.cyan, { size: 16, mono: false });
        text("• Bitta papkada millionlab fayl bo'lsa, fayl tizimi tormozlanadi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Dastlabki 2 belgi (00-ff) 256 ta mustaqil papka yaratadi.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Bu har bir papkadagi fayllar sonini 256 marta qisqartiradi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kC3 = P(u, 11.5, 0.5);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Loose Obyektlar Tushunchasi", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Alohida turgan har bir siqilgan obyekt 'loose' obyekt deyiladi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Keyinchalik ular git gc orqali bitta ixcham packfile'ga yig'iladi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Hash Kodni Qo‘lda Hisoblash (REAL TERMINAL)
  // ==========================================
  function sceneQoldaHashHisoblash(u, bounds) {
    chip(5, "Hash Kodni Qo‘lda Hisoblash", u, 0);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda oddiy shasum va Git shasum taqqoslashi
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: printf 'test content\n' | shasum (u: 0.6 to 2.2, Enter 2.4)
      drawCommandLine("ombor $ ", "printf 'test content\\n' | shasum", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("4fe2b8dd12cd9cd6a413ea960cd8c09c25f19527  -", 2.6, tu, 130, 230, { color: C.red, weight: 600 });
      drawOutputLine("  ✖ Xato! Git hashi (d67046...)ga mutlaqo to'g'ri kelmaydi.", 2.9, tu, 130, 252, { color: '#f87171' });

      // 2-buyruq: sarlavha bilan shasum (u: 4.2 to 6.2, Enter 6.4)
      drawCommandLine("ombor $ ", "printf 'blob 13\\0test content\\n' | shasum", 4.2, 6.2, 6.4, tu, 130, 290);
      drawOutputLine("d670460b4b4aece5915caf5c68d12f560a9fe3e4  -", 6.6, tu, 130, 315, { color: C.green, weight: 700 });
      drawOutputLine("  ✔ 100% mos! Git aynan mana shu sarlavhali SHA-1 ni hisoblaydi.", 7.0, tu, 130, 340, { color: C.cyan });

      // 3-buyruq: bo'sh fayl hashi (u: 8.4 to 10.2, Enter 10.4)
      drawCommandLine("ombor $ ", "printf '' | git hash-object --stdin", 8.4, 10.2, 10.4, tu, 130, 380);
      drawOutputLine("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391", 10.6, tu, 130, 405, { color: C.yellow, weight: 600 });
      drawOutputLine("  Bo'sh blob hashi: sha1('blob 0\\0') har doim e69de29... chiqadi.", 11.0, tu, 130, 430, { color: C.mute });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 12.0, tu, 130, 465, { color: '#334155' });
      drawOutputLine("Formula: SHA1('blob ' + hajm + '\\0' + mazmun)", 12.5, tu, 130, 495, { color: C.yellow, weight: 700 });
      drawOutputLine("Sarlavha har xil turdagi obyekt to'qnashuvini yo'q qiladi!", 13.0, tu, 130, 520, { color: C.green, weight: 600 });

      // O'ng panel: Matematika va Python formulasi
      panel(980, 140, 840, 680, C.purple, "Git SHA-1 Formulasi", "sarlavha ahamiyati va dasturiy hisoblash", kBox, kBox);

      const kM1 = P(u, 1.0, 0.5);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Sarlavha Nega Shart?", 1140, 290, C.purple, { size: 16, mono: false });
        text("• Agar bitta bo'sh fayl va bo'sh papka bo'lsa, ularning baytlari bir xil.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• 'blob 0\\0' va 'tree 0\\0' sarlavhalari ularni butunlay ajratib turadi.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Kriptografik turlar to'qnashuvi nolgacha pasaytiriladi.", 1030, 400, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kM2 = P(u, 5.5, 0.5);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("Python'da Hisoblash Kodingiz", 1165, 470, C.purple, { size: 16, mono: false });
        code("header = f'blob {len(data)}\\x00'.encode()", 1030, 515, { size: 16, color: C.yellow });
        code("store = header + data", 1030, 545, { size: 16, color: C.cyan });
        code("hashlib.sha1(store).hexdigest()", 1030, 575, { size: 16, color: C.green });
        ctx.restore();
      });

      const kM3 = P(u, 10.5, 0.5);
      withA(kM3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Kafolatlangan Butunlik", 1140, 655, C.green, { size: 16, mono: false });
        text("• Git omboridagi har qanday fayl o'z sarlavhasi bilan bir butundir.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Barcha tashqi vositalar va IDE'lar aynan shu algoritmga tayanadi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds) {
    chip(6, "Xulosa va Tavsiyalar", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Blob bo'yicha xulosa
      panel(100, 140, 840, 520, C.green, "Blob Bo‘yicha Asosiy Xulosa", "kontent omborining poydevori", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Blob — Faqat Mazmun", 230, 275, C.green, { size: 15, mono: false });
        text("Unda fayl nomi ham, katalogi ham yo'q. Bir xil fayllar tekinga birlashadi.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2 · Kalit Mazmundan Olinadi", 240, 405, C.blue, { size: 15, mono: false });
        text("Butunlik tekshiruvi bepul, tarix esa o'zgarmas kriptografik zanjirga aylanadi.", 150, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · Sarlavha + zlib Siqilishi", 250, 535, C.yellow, { size: 15, mono: false });
        text("Diskda 'blob <size>\\0<content>' zlib bilan siqilib 2+38 formatda saqlanadi.", 150, 575, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Amaliy ahamiyati
      panel(980, 140, 840, 520, C.blue, "Amaliy Ahamiyati", "ichki mexanizm va keyingi bosqich", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("1 · git cat-file — Obyektlar Ko'zgusi", 1180, 275, C.cyan, { size: 15, mono: false });
        text("Istalgan hash'ning turi (-t), hajmi (-s) va mazmunini (-p) bir zumda ko'ring.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("2 · Shaffof Obyektlar Ombori", 1150, 405, C.purple, { size: 15, mono: false });
        text(".git/objects papkasi endi qora quti emas, tushunarli kalit-qiymat bazasi.", 1030, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Keyingi Qadam: Tree va Index", 1165, 535, C.green, { size: 15, mono: false });
        text("Fayl nomlari va papkalar daraxtini keyingi bobda tree bilan bog'laymiz.", 1030, 575, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Tree va Index", 240, 725, C.git, { size: 16, mono: false });
        text("Keyingi 15-bobda: Papkalar tuzilishi — 'Tree' obyektlari va Staging Area'ning sirli 'Index' fayli!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Fayllar nomi qayerda saqlanadi, katalog ierarxiyasi qanday tuziladi va write-tree qanday ishlaydi?", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Blob bilan xom fayllarni saqlashni o'rganib, endi butun loyiha tuzilishini birlashtiramiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'hash_mohiyati', fn: sceneHashMohiyati },
      { id: 'hash_object_cat_file', fn: sceneHashObjectCatFile },
      { id: 'obyekt_ichki_tuzilishi', fn: sceneObyektIchkiTuzilishi },
      { id: 'qolda_hash_hisoblash', fn: sceneQoldaHashHisoblash },
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