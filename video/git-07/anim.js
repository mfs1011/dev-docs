// Git 07-bob videosi: "diff: nima o'zgardi"
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
  // 1-SAHNA: Kirish va O'zgarishlar Ko'zgusi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 8.5)
    if (u < 8.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("07-BOB · DIFF: NIMA O'ZGARDI", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("git diff: O'zgarishlar Ko'zgusi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Fayllar ichida aynan qaysi qator qo'shildi yoki o'chdi — patch ko'rinishida", 960, 415, { size: 26, color: C.mute });

        // Markaziy diff oqimi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Diff Taqqoslash Yo'nalishlari", 960, 530, C.blue, { size: 22 });

          card(410, 580, 320, 110, { fill: 'rgba(255,209,102,0.10)', col: C.yellow });
          pill("Working Tree", 570, 615, C.yellow, { size: 18 });
          text("Diskdagi o'zgarishlar", 570, 655, { size: 16, color: C.text });

          text("◄─ git diff ─►", 780, 635, { size: 16, fam: MONO, color: C.cyan, weight: 700 });

          card(830, 580, 320, 110, { fill: 'rgba(79,140,255,0.10)', col: C.blue });
          pill("Staging (Index)", 990, 615, C.blue, { size: 18 });
          text("Commit qoralamasi", 990, 655, { size: 16, color: C.text });

          text("◄─ --staged ─►", 1200, 635, { size: 16, fam: MONO, color: C.green, weight: 700 });

          card(1250, 580, 270, 110, { fill: 'rgba(52,211,153,0.10)', col: C.green });
          pill("HEAD Commit", 1385, 615, C.green, { size: 18 });
          text("Oxirgi arxiv", 1385, 655, { size: 16, color: C.text });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 8.5 yoki poster)
    chip(1, "git diff: O'zgarishlar Ko'zgusi", u, 8.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 8.8, 0.6));
    withA(kBox, () => {
      // Chap panel: status vs diff
      panel(100, 140, 840, 680, C.yellow, "status va diff Farqi", "qaysi fayl vs qaysi qator", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 9.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git status — Ro'yxat Ko'rinishi", 255, 290, C.yellow, { size: 16, mono: false });
        text("• Faqat QAYSI fayllar o'zgarganini yuqoridan umumiy ko'rsatadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl ichida aynan qanday o'zgarish bo'lganini aytmaydi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 11.2, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("git diff — Qatorlar Kesimi", 230, 470, C.green, { size: 16, mono: false });
        text("• Fayl ichidagi har bir qatordagi farqlarni aniq patch shaklida chiqaradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi qo'shilgan, o'chirilgan va o'zgargan har bir belgini ko'rsatadi.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Patch Tushunchasi", 200, 655, C.mute, { size: 16, mono: false });
        text("• Patch (yamoq) — ikki fayl orasidagi farqlar to'plamidir.", 150, 700, { size: 17, color: C.text, align: 'left' });
        text("• Dasturchilar uchun kodni tahlil qilishning xalqaro standart tili.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Kundalik 2 Asosiy Savol
      panel(980, 140, 840, 680, C.blue, "Kundalik 2 Asosiy Savol", "git diff nimaga javob beradi", kBox, kBox);

      const kC1 = o.isPoster ? 1 : P(u, 10.2, 0.5);
      withA(kC1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC1)) * 16);
        card(1005, 255, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1-SAVOL · Nimani hali stage qilmadim?", 1210, 290, C.yellow, { size: 16, mono: false });
        text("$ git diff", 1030, 335, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        text("Diskdagi ishchi fayllar va Index o'rtasidagi farqni ko'rsatadi.", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("Yana nimalarni 'git add' qilishingiz mumkinligini bilib olasiz.", 1030, 410, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kC2 = o.isPoster ? 1 : P(u, 12.2, 0.5);
      withA(kC2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC2)) * 16);
        card(1005, 455, 790, 180, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("2-SAVOL · Keyingi commitga nima kiradi?", 1200, 490, C.blue, { size: 16, mono: false });
        text("$ git diff --staged  (yoki --cached)", 1030, 535, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        text("Indexdagi qoralama va oxirgi commit o'rtasidagi farq.", 1030, 575, { size: 17, color: C.text, align: 'left' });
        text("Aynan nima saqlanishini commitdan oldin so'nggi tekshirish!", 1030, 610, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kC3 = o.isPoster ? 1 : P(u, 14.2, 0.5);
      withA(kC3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kC3)) * 16);
        card(1005, 655, 790, 130, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Hammasini jamlab ko'rish", 1140, 690, C.green, { size: 16, mono: false });
        text("$ git diff HEAD   ->   Working Tree va HEAD orasidagi jami farq", 1030, 735, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Uch Hudud va Uchta Diff
  // ==========================================
  function sceneUchDiff(u, bounds, o = {}) {
    chip(2, "Uch Hudud va Uchta Diff Buyrug'i", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // 3 ustun
      // Ustun 1: git diff (x=100)
      const k1 = P(u, 0.6, 0.5);
      withA(k1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(k1)) * 20);
        panel(100, 140, 546, 680, C.yellow, "git diff", "stage qilinmagan o'zgarishlar", k1, k1);

        card(120, 255, 506, 170, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Working Tree ↔ Index", 250, 290, C.yellow, { size: 16, mono: false });
        text("Faylni tahrirladingiz, ammo hali", 140, 335, { size: 17, color: C.text, align: 'left' });
        text("'git add' qilmadingiz.", 140, 365, { size: 17, color: C.text, align: 'left' });
        text("Aynan shu farqni ko'rsatadi.", 140, 400, { size: 16, color: C.yellow, align: 'left', weight: 600 });

        card(120, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Nega add dan keyin bo'sh?", 250, 480, C.mute, { size: 16, mono: false });
        text("• 'git add' qilishingiz bilan farq yo'qolmaydi.", 140, 525, { size: 16, color: C.text, align: 'left' });
        text("• U shunchaki Indexga o'tadi.", 140, 560, { size: 16, color: C.mute, align: 'left' });
        text("• Shuning uchun oddiy diff bo'sh qaytadi!", 140, 595, { size: 16, color: C.yellow, align: 'left', weight: 600 });

        card(120, 675, 506, 125, { fill: 'rgba(255,209,102,0.05)', col: C.yellow });
        text("Buyruq:", 140, 715, { size: 15, color: C.mute, align: 'left' });
        text("$ git diff", 140, 755, { size: 18, fam: MONO, color: C.yellow, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Ustun 2: git diff --staged (x=686)
      const k2 = P(u, 4.0, 0.5);
      withA(k2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(k2)) * 20);
        panel(686, 140, 546, 680, C.blue, "git diff --staged", "stage qilingan o'zgarishlar", k2, k2);

        card(706, 255, 506, 170, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Index ↔ HEAD", 790, 290, C.blue, { size: 16, mono: false });
        text("Faylni 'git add' qilib stage qildingiz.", 726, 335, { size: 17, color: C.text, align: 'left' });
        text("Endi farq Index va oxirgi commit", 726, 365, { size: 17, color: C.text, align: 'left' });
        text("o'rtasida mavjud bo'ladi.", 726, 400, { size: 16, color: C.cyan, align: 'left', weight: 600 });

        card(706, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Commit Qoralamasi", 820, 480, C.mute, { size: 16, mono: false });
        text("• Keyingi commitga nima kirishini bildiradi.", 726, 525, { size: 16, color: C.text, align: 'left' });
        text("• Har doim commit oldidan tekshiring.", 726, 560, { size: 16, color: C.mute, align: 'left' });
        text("• '--cached' va '--staged' sinonimdir.", 726, 595, { size: 16, color: C.blue, align: 'left', weight: 600 });

        card(706, 675, 506, 125, { fill: 'rgba(79,140,255,0.05)', col: C.blue });
        text("Buyruq:", 726, 715, { size: 15, color: C.mute, align: 'left' });
        text("$ git diff --staged", 726, 755, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Ustun 3: git diff HEAD (x=1272)
      const k3 = P(u, 7.5, 0.5);
      withA(k3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(k3)) * 20);
        panel(1272, 140, 546, 680, C.green, "git diff HEAD", "barcha o'zgarishlar jamlanmasi", k3, k3);

        card(1292, 255, 506, 170, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Working Tree ↔ HEAD", 1420, 290, C.green, { size: 16, mono: false });
        text("Staged qilingan va qilinmagan", 1312, 335, { size: 17, color: C.text, align: 'left' });
        text("barcha o'zgarishlarni birlashtirib,", 1312, 365, { size: 17, color: C.text, align: 'left' });
        text("oxirgi commit bilan solishtiradi.", 1312, 400, { size: 16, color: C.green, align: 'left', weight: 600 });

        card(1292, 445, 506, 210, { fill: 'rgba(15,22,48,0.92)', col: C.border });
        pill("Qachon qulay?", 1380, 480, C.mute, { size: 16, mono: false });
        text("• Loyihada oxirgi commitdan beri", 1312, 525, { size: 16, color: C.text, align: 'left' });
        text("  qilingan hamma ishlarni bir qarashda", 1312, 560, { size: 16, color: C.text, align: 'left' });
        text("  to'liq ko'rish zarur bo'lganda.", 1312, 595, { size: 16, color: C.green, align: 'left', weight: 600 });

        card(1292, 675, 506, 125, { fill: 'rgba(52,211,153,0.05)', col: C.green });
        text("Buyruq:", 1312, 715, { size: 15, color: C.mute, align: 'left' });
        text("$ git diff HEAD", 1312, 755, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Patch Formatini O'qish
  // ==========================================
  function scenePatchFormati(u, bounds, o = {}) {
    chip(3, "Patch Formatini O'qish", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Haqiqiy Terminal Diff Chiqishi
      panel(100, 140, 940, 680, C.green, "Terminal Patch Namunasi", "diff natijasining tuzilishi", kBase, kBase);

      const kCode = P(u, 0.6, 0.6);
      withA(kCode, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kCode)) * 16);
        card(125, 255, 890, 535, { fill: 'rgba(11,16,32,0.95)', col: C.border });

        // Qatorlar
        text("diff --git a/hisob.py b/hisob.py", 150, 300, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("index e69de29..b74b39a 100644", 150, 335, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("--- a/hisob.py", 150, 370, { size: 17, fam: MONO, color: C.red, align: 'left', weight: 700 });
        text("+++ b/hisob.py", 150, 405, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("@@ -1,5 +1,6 @@", 150, 450, { size: 17, fam: MONO, color: C.cyan, align: 'left', weight: 700 });

        text(" def hisobla(a, b):", 150, 495, { size: 16, fam: MONO, color: C.text, align: 'left' });
        text("-    natija = a - b", 150, 535, { size: 17, fam: MONO, color: C.red, align: 'left', weight: 700 });
        text("+    natija = a + b", 150, 575, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("+    print(f'Natija: {natija}')", 150, 615, { size: 17, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("     return natija", 150, 655, { size: 16, fam: MONO, color: C.text, align: 'left' });

        ctx.restore();
      });

      // O'ng panel: Patch elementlari izohi
      panel(1080, 140, 740, 680, C.blue, "Patch Belgilari Izohi", "har bir qator nimani anglatadi", kBase, kBase);

      const kE1 = P(u, 2.5, 0.5);
      withA(kE1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE1)) * 16);
        card(1105, 255, 690, 150, { fill: 'rgba(255,107,107,0.08)', col: C.red });
        pill("--- a/fayl va Qizil Qatorlar (-)", 1270, 290, C.red, { size: 16, mono: false });
        text("• 'a/' versiyasi — eski fayl holati.", 1130, 335, { size: 17, color: C.text, align: 'left' });
        text("• Minus (-) bilan boshlangan qatorlar o'chirilganini bildiradi.", 1130, 370, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kE2 = P(u, 5.0, 0.5);
      withA(kE2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE2)) * 16);
        card(1105, 425, 690, 150, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("+++ b/fayl va Yashil Qatorlar (+)", 1275, 460, C.green, { size: 16, mono: false });
        text("• 'b/' versiyasi — yangi fayl holati.", 1130, 505, { size: 17, color: C.text, align: 'left' });
        text("• Plyus (+) bilan boshlangan qatorlar yangi qo'shilganini bildiradi.", 1130, 540, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kE3 = P(u, 7.5, 0.5);
      withA(kE3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kE3)) * 16);
        card(1105, 595, 690, 190, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("@@ -1,5 +1,6 @@ (Hunk Header)", 1280, 630, C.blue, { size: 16, mono: false });
        text("• Qatorlar koordinatasi (hunk):", 1130, 675, { size: 17, color: C.text, align: 'left' });
        text("  Eski faylda 1-qatordan 5 ta qator olingan,", 1130, 710, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        text("  Yangi faylda esa 1-qatordan 6 ta qator bo'ldi.", 1130, 745, { size: 16, fam: MONO, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Kommitlar va Brenchlar Farqi
  // ==========================================
  function sceneCommitlarFarqi(u, bounds, o = {}) {
    chip(4, "Kommitlar va Brenchlar Farqi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Ikki commit taqqoslash
      panel(100, 140, 840, 680, C.purple, "Ikki Commitni Solishtirish", "tarix bo'ylab istalgan nuqtalar", kBase, kBase);

      const kD1 = P(u, 0.6, 0.5);
      withA(kD1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Ikkita commit xeshi orasidagi farq", 280, 290, C.purple, { size: 16, mono: false });
        text("$ git diff 1a2b3c 4d5e6f", 150, 335, { size: 18, fam: MONO, color: C.purple, align: 'left', weight: 700 });
        text("Loyihaning ikki o'tmishdagi nuqtasi o'rtasida nimalar o'zgargani.", 150, 375, { size: 17, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kD2 = P(u, 2.8, 0.5);
      withA(kD2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Oxirgi commit nima qilganini ko'rish", 280, 470, C.blue, { size: 16, mono: false });
        text("$ git diff HEAD~1 HEAD", 150, 515, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        text("Eng so'nggi commit kiritgan aniq o'zgarishlarni bir zumda ko'rish.", 150, 555, { size: 17, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kD3 = P(u, 5.0, 0.5);
      withA(kD3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Faqat bitta fayl bo'yicha cheklash", 270, 655, C.mute, { size: 16, mono: false });
        text("$ git diff v1.0 v2.0 -- src/api.js", 150, 700, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text("Yuzlab fayllar ichidan faqat kerakli fayl tarixini tekshirish.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ikki branch taqqoslash
      panel(980, 140, 840, 680, C.blue, "Ikki Branchni Solishtirish", "ikki nuqta vs uch nuqta", kBase, kBase);

      const kR1 = P(u, 7.5, 0.5);
      withA(kR1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Ikki Nuqta (..) — Ikki Branch Uchlari", 1190, 290, C.blue, { size: 16, mono: false });
        text("$ git diff main..feature", 1030, 335, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 700 });
        text("• Main va Feature branchlarining eng oxirgi holatlarini solishtiradi.", 1030, 375, { size: 17, color: C.text, align: 'left' });
        text("• Agar main oldinga ketgan bo'lsa, main'dagi o'zgarishlar ham chiqadi.", 1030, 415, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kR2 = P(u, 10.5, 0.5);
      withA(kR2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kR2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Uch Nuqta (...) — PR va Code Review Uchun", 1210, 555, C.green, { size: 16, mono: false });
        text("$ git diff main...feature", 1030, 600, { size: 18, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("• Feature brenchi main'dan ajralgan umumiy ajdoddan beri", 1030, 640, { size: 17, color: C.text, align: 'left' });
        text("  aynan feature'da nimalar qilinganini ko'rsatadi!", 1030, 675, { size: 17, color: C.green, align: 'left', weight: 600 });
        text("• GitHub Pull Request'lari aynan shu uch nuqtali diffni namoyish etadi.", 1030, 720, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Xavfsizlik va Oltin Odat
  // ==========================================
  function sceneXavfsizlik(u, bounds, o = {}) {
    chip(5, "Xavfsizlik va Dasturchi Oltin Odati", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Chap panel: Mutlaq xavfsizlik
      panel(100, 140, 840, 680, C.green, "100% Xavfsiz Buyruq", "hech qachon kodingizga tegmaydi", kBase, kBase);

      const kS1 = P(u, 0.6, 0.5);
      withA(kS1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Faqat O'qish (Read-Only)", 240, 290, C.green, { size: 16, mono: false });
        text("• git diff hech narsani o'zgartirmaydi va hech narsani o'chirmaydi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• U faqat mavjud holatlarni tahlil qilib ekranga chiqaradi.", 150, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS2 = P(u, 2.8, 0.5);
      withA(kS2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Xohlagancha Ishlatish Mumkin", 255, 470, C.blue, { size: 16, mono: false });
        text("• Loyihangiz holatidan shubhalansangiz, qo'rqmasdan diff qiling.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Boshqa jamoa a'zolari ishini tekshirish uchun ham eng xavfsiz yo'l.", 150, 555, { size: 17, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kS3 = P(u, 5.0, 0.5);
      withA(kS3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kS3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Tashqi vositalar bilan ochish", 250, 655, C.mute, { size: 16, mono: false });
        text("$ git difftool", 150, 700, { size: 18, fam: MONO, color: C.yellow, align: 'left' });
        text("VS Code yoki boshqa grafik dasturlarda vizual yonma-yon ko'rish.", 150, 740, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Professional dasturchi odati
      panel(980, 140, 840, 680, C.yellow, "Dasturchining Oltin Odati", "ko'r-ko'rona saqlashga yo'l qo'ymang", kBase, kBase);

      const kO1 = P(u, 7.5, 0.5);
      withA(kO1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO1)) * 16);
        card(1005, 255, 790, 240, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Commit Oldidan Tekshiruv", 1150, 290, C.yellow, { size: 16, mono: false });
        text("1. Fayllarni stage qildingiz: $ git add .", 1030, 335, { size: 17, fam: MONO, color: C.text, align: 'left' });
        text("2. DARHOL commit qilmang! Avval tekshiring:", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 700 });
        text("   $ git diff --staged", 1030, 415, { size: 18, fam: MONO, color: C.cyan, align: 'left', weight: 800 });
        text("3. Har bir qatorni ko'zdan kechirib, so'ng commit qiling.", 1030, 460, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kO2 = P(u, 10.5, 0.5);
      withA(kO2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kO2)) * 16);
        card(1005, 520, 790, 265, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Nimalardan Himoya Qiladi?", 1140, 555, C.purple, { size: 16, mono: false });
        text("• Test paytida yozilgan 'console.log' va debug kodlari qolib ketmaydi.", 1030, 600, { size: 17, color: C.text, align: 'left' });
        text("• Tasodifiy probellar va noto'g'ri formatlashlar tarixga kirmaydi.", 1030, 640, { size: 17, color: C.purple, align: 'left', weight: 600 });
        text("• Commit xabarini aniqroq va professionalroq yozishga yordam beradi.", 1030, 680, { size: 16, color: C.cyan, align: 'left' });
        text("• Jamoangizdagi Code Review jarayonini yengillashtiradi.", 1030, 720, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa: diff Buyruqlari Xaritasi", u, 0);

    const kBase = eo(P(u, 0.2, 0.5));
    withA(kBase, () => {
      // Katta xulosa paneli
      panel(100, 140, 1720, 500, C.blue, "Diff Buyruqlari Jamlanmasi", "qaysi vaziyatda qaysi biri ishlatiladi", kBase, kBase);

      const kMap = P(u, 0.8, 0.6);
      withA(kMap, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kMap)) * 16);

        // 3 blok
        // Blok 1: Oddiy diff (x=140)
        card(140, 260, 420, 200, { fill: 'rgba(255,209,102,0.10)', col: C.yellow, lw: 2 });
        pill("git diff", 350, 305, C.yellow, { size: 20 });
        text("Stage Qilinmagan Farqlar", 350, 350, { size: 18, weight: 700, color: C.text });
        text("Working Tree ↔ Index", 350, 385, { size: 15, fam: MONO, color: C.mute });
        text("Yana nimani qo'shishim kerak?", 350, 420, { size: 16, color: C.yellow, weight: 600 });

        // Blok 2: diff --staged (x=686)
        card(686, 260, 546, 200, { fill: 'rgba(79,140,255,0.10)', col: C.blue, lw: 2 });
        pill("git diff --staged", 960, 305, C.blue, { size: 20 });
        text("Commitga Kiradigan O'zgarishlar", 960, 350, { size: 18, weight: 700, color: C.text });
        text("Index ↔ HEAD", 960, 385, { size: 15, fam: MONO, color: C.mute });
        text("Keyingi commitga nimalar kiradi?", 960, 420, { size: 16, color: C.blue, weight: 600 });

        // Blok 3: diff HEAD (x=1272)
        card(1272, 260, 508, 200, { fill: 'rgba(52,211,153,0.10)', col: C.green, lw: 2 });
        pill("git diff HEAD", 1526, 305, C.green, { size: 20 });
        text("Barcha O'zgarishlar Jamlanmasi", 1526, 350, { size: 18, weight: 700, color: C.text });
        text("Working Tree ↔ HEAD", 1526, 385, { size: 15, fam: MONO, color: C.mute });
        text("Oxirgi commitdan beri butun farq", 1526, 420, { size: 16, color: C.green, weight: 600 });

        ctx.restore();
      });

      // Pastki xulosa banneri
      const kFinal = P(u, 4.0, 0.5);
      withA(kFinal, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFinal)) * 16);
        card(100, 670, 1720, 160, { fill: 'rgba(11,16,32,0.95)', col: C.git, lw: 2 });
        pill("Keyingi Bob: .gitignore, rm va mv", 960, 715, C.git, { size: 20, mono: false });
        text("Keyingi 8-bobda keraksiz fayllarni chetlab o'tuvchi .gitignore va fayllarni o'chirish/ko'chirishni o'rganamiz!", 960, 765, { size: 22, weight: 700, color: C.text });
        text("git diff — ongli, toza va professional dasturlashning eng asosiy qurolidir.", 960, 800, { size: 18, color: C.mute });
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
      { id: 'uch_diff', fn: sceneUchDiff },
      { id: 'patch_formati', fn: scenePatchFormati },
      { id: 'commitlar_farqi', fn: sceneCommitlarFarqi },
      { id: 'xavfsizlik_va_amaliyot', fn: sceneXavfsizlik },
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
