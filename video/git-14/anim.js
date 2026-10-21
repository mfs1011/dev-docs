// Git 14-bob videosi: "Obyektlar: blob va hash"
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
  // 3-SAHNA: git hash-object va git cat-file
  // ==========================================
  function sceneHashObjectCatFile(u, bounds) {
    chip(3, "git hash-object va git cat-file", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: git hash-object
      panel(100, 140, 840, 680, C.blue, "git hash-object — Yozish", "xom ma'lumotdan Git obyekti yaratish", kBox, kBox);

      const kP1 = P(u, 1.2, 0.45);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Faqat Hash Hisoblash", 220, 290, C.blue, { size: 16, mono: false });
        code("$ echo 'test content' | git hash-object --stdin", 150, 335, { size: 16, color: C.cyan });
        code("d670460b4b4aece5915caf5c68d12f560a9fe3e4", 150, 370, { size: 16, color: C.yellow });
        ctx.restore();
      });

      const kP2 = P(u, 3.2, 0.45);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Omborga Yozish: -w (write)", 235, 470, C.green, { size: 16, mono: false });
        code("$ git hash-object -w test.txt", 150, 510, { size: 17, color: C.yellow });
        code(".git/objects/83/baae61804e65cc73a7201a...", 150, 545, { size: 16, color: C.green });
        text("Fayl mazmuni omborga yoziladi va uning hash'i qaytariladi.", 150, 575, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.2, 0.45);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Bo'sh Faylning Mashhur Hashi", 250, 655, C.mute, { size: 16, mono: false });
        code("$ printf '' | git hash-object --stdin", 150, 700, { size: 16, color: C.cyan });
        code("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391", 150, 735, { size: 16, color: C.yellow });
        ctx.restore();
      });

      // O'ng panel: git cat-file
      panel(980, 140, 840, 680, C.yellow, "git cat-file — O'qish", "shveytsar pichog'i: obyektlarni tekshirish", kBox, kBox);

      const kD1 = P(u, 7.8, 0.45);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("-t (Turini Aniqlash)", 1120, 290, C.yellow, { size: 16, mono: false });
        code("$ git cat-file -t 83baae6", 1030, 335, { size: 17, color: C.yellow });
        code("blob", 1030, 370, { size: 18, color: C.green });
        ctx.restore();
      });

      const kD2 = P(u, 9.8, 0.45);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-s (Hajmi Baytlarda)", 1130, 470, C.cyan, { size: 16, mono: false });
        code("$ git cat-file -s 83baae6", 1030, 515, { size: 17, color: C.cyan });
        code("10  (bayt)", 1030, 550, { size: 18, color: C.yellow });
        ctx.restore();
      });

      const kD3 = P(u, 11.8, 0.45);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("-p (Mazmunini Chiroyli Chiqarish)", 1180, 655, C.green, { size: 16, mono: false });
        code("$ git cat-file -p 83baae6 > tiklangan.txt", 1030, 700, { size: 16, color: C.green });
        text("Obyektning asl baytlarini faylga qaytarib tiklash imkoniyati.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Obyekt Faylining Ichki Tuzilishi
  // ==========================================
  function sceneObyektIchkiTuzilishi(u, bounds) {
    chip(4, "Obyekt Faylining Ichki Tuzilishi", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Sarlavha formati
      panel(100, 140, 840, 680, C.green, "Obyekt Sarlavhasi (Header)", "tur, hajm va NUL bayti", kBox, kBox);

      const kA1 = P(u, 1.2, 0.45);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Sarlavha Qoidasi", 200, 290, C.green, { size: 16, mono: false });
        code('"<tur>" + " " + "<hajm>" + "\\0" + <mazmun>', 150, 335, { size: 16, color: C.yellow });
        text("Hajm — faqat mazmunniki (sarlavhaniki emas).", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kA2 = P(u, 3.2, 0.45);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("zlib bilan Siqilgan Baytlar", 240, 470, C.green, { size: 16, mono: false });
        code("00000000: 7801 4bca c94f 5230 3466... (zlib)", 150, 515, { size: 16, color: C.cyan });
        text("Barcha loose obyektlar diskda zlib bilan siqilgan holda turadi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kA3 = P(u, 5.2, 0.45);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Ochilgandagi Haqiqiy Baytlar", 250, 655, C.mute, { size: 16, mono: false });
        code("b'blob 13\\x00test content\\n'", 150, 700, { size: 18, color: C.green });
        text("Mana bu xom baytlar ketma-ketligi!", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 2 + 38 sxemasi
      panel(980, 140, 840, 680, C.cyan, "2 + 38 Belgili Papka Sxemasi", ".git/objects ichidagi fan-out katalogi", kBox, kBox);

      const kC1 = P(u, 7.8, 0.45);
      withA(kC1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Papka va Fayl Taqsimoti", 1140, 290, C.cyan, { size: 16, mono: false });
        code(".git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4", 1030, 335, { size: 14, color: C.yellow });
        text("Dastlabki 2 belgi ('d6') — papka nomi, qolgan 38 belgi — fayl nomi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kC2 = P(u, 9.8, 0.45);
      withA(kC2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("Nega 256 Ta Papkaga Bo'linadi?", 1175, 470, C.cyan, { size: 16, mono: false });
        text("• Bitta papkada millionlab fayl tursa, fayl tizimlari juda sekinlashadi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• 256 ta papkaga bo'lish har papkadagi fayllar sonini 256 marta kamaytiradi.", 1030, 555, { size: 15, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = P(u, 11.8, 0.45);
      withA(kC3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Loose Objects Tushunchasi", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Bu alohida siqilgan fayllar 'loose obyektlar' deb ataladi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Keyinchalik ular bitta katta packfile'ga birlashtiriladi (18-bob).", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Hash Kodni Qo‘lda Hisoblash
  // ==========================================
  function sceneQoldaHashHisoblash(u, bounds) {
    chip(5, "Hash Kodni Qo‘lda Hisoblash", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Oddiy SHA-1 va Git SHA-1 farqi
      panel(100, 140, 840, 680, C.cyan, "Oddiy SHA-1 Nega Mos Kelmaydi?", "sarlavha ahamiyati", kBox, kBox);

      const kE1 = P(u, 1.2, 0.45);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Faqat Mazmunning SHA-1'i", 230, 290, C.red, { size: 16, mono: false });
        code("$ printf 'test content\\n' | shasum", 150, 335, { size: 16, color: C.yellow });
        code("4fe2b8dd12cd9cd6a413ea960cd8c09c25f19527", 150, 365, { size: 16, color: C.red });
        text("Git hash'iga mutlaqo to'g'ri kelmaydi!", 150, 395, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE2 = P(u, 3.2, 0.45);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Sarlavha Qo'shilganda (Git SHA-1)", 270, 470, C.green, { size: 16, mono: false });
        code("$ printf 'blob 13\\0test content\\n' | shasum", 150, 510, { size: 16, color: C.cyan });
        code("d670460b4b4aece5915caf5c68d12f560a9fe3e4", 150, 545, { size: 16, color: C.green, weight: 700 });
        text("Aynan 'git hash-object' bergan natija bilan 100% bir xil!", 150, 580, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE3 = P(u, 5.2, 0.45);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Kriptografik Saboq", 200, 655, C.mute, { size: 16, mono: false });
        text("• Git hash'i faqat fayl emas, balki tur va hajm bilan birga hisoblanadi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Bu ikki xil turdagi obyektlarning tasodifiy to'qnashuvini yo'q qiladi.", 150, 735, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Python / skript orqali
      panel(980, 140, 840, 680, C.purple, "Python'da Hash Hisoblash", "Git'siz to'g'ridan-to'g'ri obyekt yasash", kBox, kBox);

      const kM1 = P(u, 7.8, 0.45);
      withA(kM1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Sarlavha Shakllantirish", 1140, 290, C.purple, { size: 16, mono: false });
        code("content = b'what is up, doc?'", 1030, 335, { size: 16, color: C.cyan });
        code("header = b'blob %d\\x00' % len(content)", 1030, 365, { size: 16, color: C.yellow });
        ctx.restore();
      });

      const kM2 = P(u, 9.8, 0.45);
      withA(kM2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("Birlashtirish va SHA-1", 1135, 470, C.purple, { size: 16, mono: false });
        code("store = header + content", 1030, 515, { size: 16, color: C.yellow });
        code("hashlib.sha1(store).hexdigest()", 1030, 550, { size: 16, color: C.green });
        ctx.restore();
      });

      const kM3 = P(u, 11.8, 0.45);
      withA(kM3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kM3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Natija", 1060, 655, C.green, { size: 16, mono: false });
        code("bd9dbf5aae1a3862dd1526723246b20206e5fc37", 1030, 700, { size: 16, color: C.yellow });
        text("Git'ning o'zi ham xuddi shu formulani ishlatadi!", 1030, 735, { size: 16, color: C.green, align: 'left' });
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
