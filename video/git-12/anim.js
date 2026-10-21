// Git 12-bob videosi: "Teglar va alias'lar"
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
  // 1-SAHNA: Teglar Nima va Doimiy Belgilar
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("12-BOB · TEGLAR VA ALIAS'LAR", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Teglar Nima va Doimiy Belgilar", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Tarixdagi muhim reliz va burilish nuqtalariga qo‘yiladigan o‘zgarmas xatcho‘p", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Branch va Teg: Asosiy Farq", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("Branch (Shox)", 670, 615, C.blue, { size: 18 });
          text("• Yangi commit qilganda oldinga siljiydi", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Kitobda hozir o‘qiyotgan joyingiz", 430, 680, { size: 15, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("Teg (Tag)", 1250, 615, C.green, { size: 18 });
          text("• Tarixdagi commitda qimirlamay joyida qoladi", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Kitobdagi doimiy qistirib qo‘yilgan xatcho‘p", 1010, 680, { size: 15, color: C.green, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "Teglar Nima va Doimiy Belgilar", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Tegning maqsadi
      panel(100, 140, 840, 680, C.yellow, "Teg — O‘zgarmas Xatcho‘p", "relizlar va tarixiy bosqichlar uchun", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tarixdagi Muhim Nuqta", 230, 290, C.yellow, { size: 16, mono: false });
        text("• '1.0 reliz shu yerda chiqdi' degan nuqtaga doimiy nom beriladi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• 40 belgili hash'ni eslab qolish o‘rniga qisqa nom: v1.0, v2.3.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Branch bilan Asosiy Farqi", 240, 470, C.cyan, { size: 16, mono: false });
        text("• Branch kommit qilganda oldinga siljib boraveradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Teg esa har doim ko‘rsatilgan kommit ustida mahkam turadi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Qo‘llanish Sohalari", 220, 655, C.mute, { size: 16, mono: false });
        text("• Ishlab chiqarish relizlari (Semantic Versioning: v1.4.2).", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Xavfsizlik auditi, mijozga topshirilgan versiyalar va demo holatlar.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 2 xil teg
      panel(980, 140, 840, 680, C.blue, "Git'da 2 Xil Teg Mavjud", "lightweight va annotated", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Lightweight (Yengil)", 1130, 290, C.green, { size: 16, mono: false });
        text("• Faqat nom va kommit hash'idan iborat oddiy faylcha.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Shaxsiy, vaqtinchalik yoki mahalliy testlar uchun mo‘ljallangan.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Annotated (Izohli)", 1120, 470, C.blue, { size: 16, mono: false });
        text("• To‘liq Git obyekti: tagger ismi, sana, reliz xabari va imzo.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Rasmiy ommaviy relizlar uchun tavsiya etiladigan asosiy tur.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.0, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Bobning Ikkinchi Qismi: Aliaslar", 1180, 655, C.mute, { size: 16, mono: false });
        text("• Tez-tez teriladigan uzun buyruqlarga qisqa taxallus qo‘yish.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Masalan: 'git st' status uchun, 'git last' oxirgi kommit uchun.", 1030, 740, { size: 17, fam: MONO, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Annotated va Lightweight Teglar
  // ==========================================
  function sceneAnnotatedVsLw(u, bounds) {
    chip(2, "Annotated va Lightweight Teglar", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Lightweight teg
      panel(100, 140, 840, 680, C.purple, "Lightweight Teg (Yengil)", "faqat .git/refs/tags/<nom> fayli", kBox, kBox);

      const kL1 = P(u, 1.2, 0.45);
      withA(kL1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("Yaratish: Hech Qanday Opsiya Yo‘q", 270, 290, C.purple, { size: 16, mono: false });
        code("$ git tag v1.0-lw", 150, 335, { size: 18, color: C.yellow });
        text("Faqat teg nomi kiritiladi; hech qanday -a, -s yoki -m berilmaydi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kL2 = P(u, 3.2, 0.45);
      withA(kL2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(168,85,247,0.06)', col: C.purple });
        pill("Fayl Tizimida 41 Bayt", 220, 470, C.purple, { size: 16, mono: false });
        code("$ cat .git/refs/tags/v1.0-lw", 150, 510, { size: 16, color: C.cyan });
        code("6a1d9ca994b575e2479418dc2b1124a887889b27", 150, 540, { size: 15, color: C.text });
        code("$ git cat-file -t v1.0-lw  --> commit", 150, 570, { size: 15, color: C.green });
        ctx.restore();
      });

      const kL3 = P(u, 5.2, 0.45);
      withA(kL3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Xususiyatlari va Cheklovlari", 240, 655, C.mute, { size: 16, mono: false });
        text("• Omborda alohida teg obyekti yaratilmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Tegning o‘z sanasi va muallifi yo‘q; faqat kommitga ko‘rsatkich.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Annotated teg
      panel(980, 140, 840, 680, C.green, "Annotated Teg (Izohli Obyekt)", "to‘liq git obyekti, sana, muallif va imzo", kBox, kBox);

      const kR1 = P(u, 7.8, 0.45);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Yaratish: -a va -m Opsiyalari", 1150, 290, C.green, { size: 16, mono: false });
        code("$ git tag -a v1.0 -m \"1.0 reliz xabari\"", 1030, 335, { size: 17, color: C.yellow });
        text("Agar -m berilsa, hatto -a unutilsa ham avtomatik annotated yaratiladi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 9.8, 0.45);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.06)', col: C.green });
        pill("To‘laqonli Tag Obyekti", 1120, 470, C.green, { size: 16, mono: false });
        code("$ git cat-file -t v1.0  --> tag (b824365...)", 1030, 510, { size: 16, color: C.cyan });
        code("tagger Ali Valiyev <ali@example.com>", 1030, 540, { size: 15, color: C.text });
        code("object 6a1d9ca... | type commit", 1030, 570, { size: 15, color: C.green });
        ctx.restore();
      });

      const kR3 = P(u, 11.8, 0.45);
      withA(kR3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Rasmiy Tavsiya", 1090, 655, C.mute, { size: 16, mono: false });
        text("• Ommaviy relizlar uchun doimo annotated teglardan foydalaning.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Kriptografik isbot uchun GPG yoki SSH imzo qo‘shish mumkin (-s).", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Teglarni Push Qilish va O‘chirish
  // ==========================================
  function scenePushVaDelete(u, bounds) {
    chip(3, "Teglarni Push Qilish va O‘chirish", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Push qilish
      panel(100, 140, 840, 680, C.blue, "Teglarni Remote Omborga Yuborish", "standart push teglarni yubormaydi!", kBox, kBox);

      const kP1 = P(u, 1.2, 0.45);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Standart Qoida: git push teglarni olmaydi", 280, 290, C.blue, { size: 16, mono: false });
        code("$ git push origin main", 150, 335, { size: 18, color: C.red });
        text("Faqat brench kommitlari ketadi, teglar esa lokal omborda qolib ketadi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.2, 0.45);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Aniq Teg Yuborish yoki --follow-tags", 270, 470, C.green, { size: 16, mono: false });
        code("$ git push origin v1.0", 150, 510, { size: 17, color: C.yellow });
        code("$ git push --follow-tags origin main", 150, 545, { size: 17, color: C.green });
        text("--follow-tags faqat relizga tegishli annotated teglarni yuboradi.", 150, 575, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.2, 0.45);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Global Sozlama", 190, 655, C.mute, { size: 16, mono: false });
        code("$ git config --global push.followTags true", 150, 700, { size: 16, color: C.cyan });
        text("Shunda oddiy 'git push' har safar yangi reliz teglaringizni olib ketadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: O'chirish
      panel(980, 140, 840, 680, C.red, "Teglarni O‘chirish (Delete)", "lokal va masofaviy ombordan xavfsiz tozalash", kBox, kBox);

      const kD1 = P(u, 7.8, 0.45);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Lokal Tegni O‘chirish: -d", 1130, 290, C.red, { size: 16, mono: false });
        code("$ git tag -d v1.0-lw", 1030, 335, { size: 18, color: C.yellow });
        code("Deleted tag 'v1.0-lw' (was 28d5d36)", 1030, 370, { size: 15, color: C.green });
        ctx.restore();
      });

      const kD2 = P(u, 9.8, 0.45);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.06)', col: C.red });
        pill("Masofaviy Tegni O‘chirish", 1140, 470, C.red, { size: 16, mono: false });
        code("$ git push origin --delete v1.0", 1030, 510, { size: 17, color: C.yellow });
        text("Yoki qadimgi refspec sintaksisi:", 1030, 545, { size: 15, color: C.mute, align: 'left' });
        code("$ git push origin :refs/tags/v1.0", 1030, 570, { size: 16, color: C.cyan });
        ctx.restore();
      });

      const kD3 = P(u, 11.8, 0.45);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.yellow });
        pill("Muhim Ogohlantirish: Qayta Teglamang!", 1200, 655, C.yellow, { size: 16, mono: false });
        text("• E’lon qilingan tegni 'git tag -f' bilan o‘zgartirishdan saqlaning.", 1030, 700, { size: 16, color: C.yellow, weight: 600, align: 'left' });
        text("• Boshqa dasturchilarda xatolik chiqadi. Buning o‘rniga v1.0.1 chiqaring.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git describe va Detached HEAD
  // ==========================================
  function sceneDescribeVaDetached(u, bounds) {
    chip(4, "git describe va Detached HEAD", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: git describe
      panel(100, 140, 840, 680, C.yellow, "git describe — Tushunarli Versiya", "eng yaqin teggacha bo‘lgan masofa", kBox, kBox);

      const kS1 = P(u, 1.2, 0.45);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Natija Formati", 190, 290, C.yellow, { size: 16, mono: false });
        code("$ git describe", 150, 335, { size: 18, color: C.cyan });
        code("v0.9-4-ge97a3f5", 150, 370, { size: 20, color: C.green, weight: 700 });
        ctx.restore();
      });

      const kS2 = P(u, 3.2, 0.45);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Formatning Tahlili", 200, 470, C.cyan, { size: 16, mono: false });
        text("• v0.9 — eng yaqin annotated teg nomi.", 150, 510, { size: 16, color: C.text, align: 'left' });
        text("• 4 — shu tegdang keyin qo‘shilgan kommitlar soni.", 150, 540, { size: 16, color: C.yellow, align: 'left' });
        text("• ge97a3f5 — joriy kommitning qisqa hash'i (g harfi 'git' ma’nosida).", 150, 570, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kS3 = P(u, 5.2, 0.45);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Amaliy Foydasi: CI/CD Build", 230, 655, C.mute, { size: 16, mono: false });
        code("$ git describe --dirty", 150, 700, { size: 17, color: C.cyan });
        text("O‘zgarish bo‘lsa: 'v1.1-dirty'. Dastur versiyasi uchun ayni muddao!", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Detached HEAD va tegdan brench
      panel(980, 140, 840, 680, C.orange, "Tegga O‘tish va Detached HEAD", "teg brench emas, undan yangi brench oching", kBox, kBox);

      const kH1 = P(u, 7.8, 0.45);
      withA(kH1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(249,115,22,0.08)', col: C.git });
        pill("Tegga Switch Qilish", 1120, 290, C.git, { size: 16, mono: false });
        code("$ git switch --detach v1.0", 1030, 335, { size: 18, color: C.yellow });
        text("HEAD to‘g‘ridan-to‘g‘ri kommitga ulanadi: 'HEAD detached at v1.0'.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kH2 = P(u, 9.8, 0.45);
      withA(kH2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Detached HEAD Xavfi", 1120, 470, C.red, { size: 16, mono: false });
        text("• Bu holatda yangi kommit qilsangiz, hech bir brenchga kirmaydi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Boshqa joyga o‘tsangiz, o‘sha kommit yo‘qolib (havoda osilib) qoladi.", 1030, 555, { size: 16, color: C.red, weight: 600, align: 'left' });
        ctx.restore();
      });

      const kH3 = P(u, 11.8, 0.45);
      withA(kH3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kH3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("To‘g‘ri Yo‘l: Tegdan Yangi Brench Ochish", 1210, 655, C.green, { size: 16, mono: false });
        code("$ git switch -c hotfix-1.0 v1.0", 1030, 700, { size: 18, color: C.yellow });
        text("Eski reliz ustida xatolarni tuzatib, bemalol yangi kommitlar qilasiz.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Git Aliaslari va Qulaylik
  // ==========================================
  function sceneAliaslar(u, bounds) {
    chip(5, "Git Aliaslari va Qulaylik", u, 0);

    const kBox = eo(P(u, 0.3, 0.5));
    withA(kBox, () => {
      // Chap panel: Alias nima?
      panel(100, 140, 840, 680, C.cyan, "Git Alias Taxalluslari", "tez-tez yoziladigan buyruqlarga qisqa nom", kBox, kBox);

      const kA1 = P(u, 1.2, 0.45);
      withA(kA1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA1)) * 14);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Nima Uchun Kerak?", 210, 290, C.cyan, { size: 16, mono: false });
        text("• Git noto‘g‘ri yozilgan buyruqlarni o‘zi mustaqil taxmin qilmaydi.", 150, 335, { size: 16, color: C.text, align: 'left' });
        text("• Alias yordamida tez-tez teriladigan buyruqlarni qisqartirasiz.", 150, 375, { size: 16, color: C.cyan, weight: 600, align: 'left' });
        ctx.restore();
      });

      const kA2 = P(u, 3.2, 0.45);
      withA(kA2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA2)) * 14);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.06)', col: C.cyan });
        pill("Klassik Aliaslar", 190, 470, C.cyan, { size: 16, mono: false });
        code("$ git config --global alias.st status", 150, 510, { size: 17, color: C.yellow });
        code("$ git config --global alias.co checkout", 150, 545, { size: 17, color: C.green });
        code("$ git config --global alias.br branch", 150, 580, { size: 17, color: C.cyan });
        ctx.restore();
      });

      const kA3 = P(u, 5.2, 0.45);
      withA(kA3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kA3)) * 14);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Saqlanish Joyi", 185, 655, C.mute, { size: 16, mono: false });
        text("• Barcha global aliaslar ~/.gitconfig faylida saqlanadi:", 150, 700, { size: 16, color: C.text, align: 'left' });
        code("[alias]  st = status  |  co = checkout", 150, 735, { size: 16, color: C.yellow });
        ctx.restore();
      });

      // O'ng panel: Kuchli alias misollari
      panel(980, 140, 840, 680, C.green, "Foydali Professional Aliaslar", "samaradorlikni oshiruvchi tayyor andozalar", kBox, kBox);

      const kE1 = P(u, 7.8, 0.45);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 14);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Staging'dan Chiqarish: git unstage", 1175, 290, C.green, { size: 16, mono: false });
        code("$ git config --global alias.unstage \"restore --staged --\"", 1030, 335, { size: 16, color: C.yellow });
        text("Natijada: 'git unstage app.txt' buyrug‘i bilan bemalol chiqarasiz.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE2 = P(u, 9.8, 0.45);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 14);
        card(1005, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Oxirgi Kommit: git last", 1130, 470, C.blue, { size: 16, mono: false });
        code("$ git config --global alias.last \"log -1 HEAD\"", 1030, 515, { size: 17, color: C.yellow });
        text("Oxirgi kommit ma’lumotini bir zumda to‘liq ko‘rish uchun qulay.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kE3 = P(u, 11.8, 0.45);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 14);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Chiroyli Log Grafiki: git lg", 1140, 655, C.yellow, { size: 16, mono: false });
        code("$ git config --global alias.lg \"log --oneline --graph --decorate -5\"", 1030, 700, { size: 15, color: C.yellow });
        text("Barcha brench va teglarni chiroyli daraxt shaklida ko‘rsatadi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
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
      // Chap panel: Teglar bo'yicha checklist
      panel(100, 140, 840, 520, C.green, "Teglar Bo‘yicha Asosiy Xulosa", "ishonchli relizlar uchun", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("1 · Reliz Uchun Doim Annotated", 260, 275, C.green, { size: 15, mono: false });
        text("Rasmiy versiyalarda muallif, sana va reliz xabari saqlanishi shart.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("2 · E’lon Qilingan Tegni O‘zgartirmang", 275, 405, C.red, { size: 15, mono: false });
        text("Remote'ga borgan tegni qayta qo‘ymang; zarur bo‘lsa yangi patch chiqaring.", 150, 445, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("3 · Push Qilishda Xavfsiz Usul", 250, 535, C.blue, { size: 15, mono: false });
        text("push.followTags sozlamasidan foydalanib, faqat annotated teglarni yuboring.", 150, 575, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Aliaslar va kundalik unumdorlik
      panel(980, 140, 840, 520, C.blue, "Kundalik Unumdorlik", "tezkor va qulay terminal muhiti", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · git describe bilan Versiyalash", 1155, 275, C.yellow, { size: 15, mono: false });
        text("CI/CD pipeline va build tizimlariga aniq versiya nomini berishda tengsiz.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2 · Tegdan Yangi Brench Ochish", 1145, 405, C.cyan, { size: 15, mono: false });
        text("Detached HEAD holatida qolib ketmaslik uchun doim yangi brench oching.", 1030, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("3 · Shaxsiy Qulay Aliaslar", 1125, 535, C.green, { size: 15, mono: false });
        text("st, lg, unstage kabi aliaslar yordamida ishingizni tezlashtiring.", 1030, 575, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Plumbing, Porcelain va .git Papkasi", 340, 725, C.git, { size: 16, mono: false });
        text("Keyingi 13-bobda: Git'ning ichki mexanizmi — 'Plumbing', 'Porcelain' va sirli '.git' papkasi!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Git kapoti ostida qanday fayllar yotadi, obyektlar qanday saqlanadi va Git aslida kontent bilan qanday ishlaydi?", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Teglar va aliaslar bilan reliz madaniyatini mustahkamlab, endi Git ichki arxitekturasiga chuqur sho‘ng‘iymiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'annotated_vs_lw', fn: sceneAnnotatedVsLw },
      { id: 'push_va_delete', fn: scenePushVaDelete },
      { id: 'describe_va_detached', fn: sceneDescribeVaDetached },
      { id: 'aliaslar', fn: sceneAliaslar },
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
