// Git 01-bob videosi: "Versiya nazorati va Git nima"
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
  // 1-SAHNA: Versiya Nazorati Nima?
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("01-BOB · VERSIYA NAZORATI VA GIT NIMA", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Versiya Nazorati Nima?", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Fayllardagi o‘zgarishlarni vaqt bo‘yicha yozib boruvchi va xavfsiz saqlovchi tizim", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("VCS (Version Control System) Vazifasi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(239,68,68,0.10)', col: C.red });
          pill("VCS'siz Ishlash (Qo'lda)", 670, 615, C.red, { size: 18 });
          text("• Loyihani papka qilib nusxalash (loyiha_v1, final...)", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Qaysi biri oxirgisi va nima o'zgargani noma'lum", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(16,185,129,0.10)', col: C.green });
          pill("Git Bilan Ishlash (Tartibli)", 1250, 615, C.green, { size: 18 });
          text("• Bitta papka, lekin butun tarix xavfsiz va aniq", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Istalgan daqiqaga qaytish va farqlarni bir zumda ko'rish", 1010, 680, { size: 15, fam: MONO, color: C.green, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Versiya Nazorati Nima?", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: VCS imkoniyatlari
      panel(100, 140, 840, 680, C.blue, "VCS Nimalarga Qodir?", "dasturchining kundalik xavfsizlik kamaridir", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Oldingi Holatga Qaytish", 240, 290, C.cyan, { size: 16, mono: false });
        text("• Yangi yozilgan kod xato bersa, loyihani 1 soniyada orqaga qaytaramiz.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Hech bir yaxshi kod yo'qolib ketmaydi, xavfsizlik to'liq ta'minlanadi.", 150, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Vaqt Bo'yicha Farqlarni Solishtirish", 280, 470, C.green, { size: 16, mono: false });
        text("• Kechagi va bugungi kod orasida aynan qaysi satr o'zgarganini ko'ramiz.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Har bir o'zgarish diff orqali aniq ko'z oldimizda namoyon bo'ladi.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Mualliflik va Mas'uliyat", 230, 655, C.mute, { size: 16, mono: false });
        text("• Qaysi satrni kim, qachon va qanday sabab bilan yozgani yozib boriladi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Xatoliklarni tuzatish va jamoada birgalikda ishlash osonlashadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Git yondashuvi
      panel(980, 140, 840, 680, C.git, "Git — Dasturiy Vositalar Qiroli", "2005-yilda Linus Torvalds tomonidan yaratilgan", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Yuksak Tezlik va Kuchli Dizayn", 1165, 290, C.git, { size: 16, mono: false });
        text("• Katta loyihalarni (Linux yadrosi kabi) soniyalar ichida boshqara oladi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Arxitekturasi oddiy va nihoyatda samarali poydevorga qurilgan.", 1030, 375, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("To'liq Taqsimlangan Tizim", 1140, 470, C.yellow, { size: 16, mono: false });
        text("• Har bir dasturchi kompyuterida butun loyihaning to'liq tarixi bo'ladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Markaziy server bo'lmasa ham, oflayn rejimda bemalol ishlash mumkin.", 1030, 555, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Butunlik va Ishonchliligi", 1140, 655, C.mute, { size: 16, mono: false });
        text("• Hesh-kodlar yordamida har bir fayl yaxlitligi kafolatlanadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• O'tmishdagi hech qanday ma'lumot sezdirmasdan o'zgarib ketolmaydi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega Papkalarni Nusxalash Yetmaydi?
  // (SPLIT-SCREEN: Left Terminal, Right Problems)
  // ==========================================
  function sceneMuammoNusxalash(u, bounds, o = {}) {
    chip(2, "Nega Papkalarni Nusxalash Yetmaydi?", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap tomonda: Real Jonli Terminal!
      terminal(100, 140, 840, 680, {
        title: 'bash — ~/dasturlar/sayt (80x24)',
        p: kBox
      });

      // Terminal ichidagi buyruqlar va chiqishlar (vaqt bo'yicha bosqichma-bosqich)
      const t1 = P(u, 1.2, 0.4);
      if (t1 > 0) {
        withA(t1, () => {
          code("$ mkdir sayt && cd sayt", 130, 215, { color: C.cyan, size: 16 });
          code("$ echo '<h1>Salom</h1>' > index.html", 130, 245, { color: C.cyan, size: 16 });
        });
      }

      const t2 = P(u, 3.2, 0.4);
      if (t2 > 0) {
        withA(t2, () => {
          code("$ cd .. && cp -r sayt sayt-eski", 130, 285, { color: C.cyan, size: 16 });
          code("$ cp -r sayt sayt-yakuniy", 130, 315, { color: C.cyan, size: 16 });
          code("$ cp -r sayt 'sayt-yakuniy-2 (ishlaydigan)'", 130, 345, { color: C.cyan, size: 16 });
        });
      }

      const t3 = P(u, 5.5, 0.5);
      if (t3 > 0) {
        withA(t3, () => {
          code("$ ls -1", 130, 395, { color: C.yellow, size: 16 });
          code("sayt", 150, 425, { color: C.text, size: 15 });
          code("sayt-eski", 150, 450, { color: C.mute, size: 15 });
          code("sayt-yakuniy", 150, 475, { color: C.mute, size: 15 });
          code("sayt-yakuniy-2 (ishlaydigan)", 150, 500, { color: C.yellow, size: 15 });
        });
      }

      const t4 = P(u, 8.5, 0.5);
      if (t4 > 0) {
        withA(t4, () => {
          code("$ diff -u sayt/index.html sayt-yakuniy/index.html", 130, 550, { color: C.git, size: 16 });
          code("--- sayt/index.html    2026-10-21 10:15:00", 150, 580, { color: C.red, size: 14 });
          code("+++ sayt-yakuniy/...   2026-10-21 10:20:00", 150, 605, { color: C.green, size: 14 });
          code("@@ -1,1 +1,2 @@", 150, 630, { color: C.mute, size: 14 });
          code(" <h1>Salom</h1>", 150, 655, { color: C.text, size: 14 });
          code("+<p>Qaysi biri oxirgi versiya? Chalkashlik!</p>", 150, 680, { color: C.red, size: 14 });

          // Terminal pastida diqqat eslatmasi
          ctx.fillStyle = 'rgba(239,68,68,0.15)';
          rr(130, 715, 780, 75, 10); ctx.fill();
          ctx.strokeStyle = 'rgba(239,68,68,0.4)'; ctx.lineWidth = 1.2; ctx.stroke();
          text("DIQQAT: Qaysi faylda nima o'zgarganini eslab qolish amalda imkonsiz!", 150, 752, {
            size: 15,
            fam: MONO,
            color: C.red,
            weight: 700,
            align: 'left'
          });
        });
      }

      // O'ng tomonda: Muammoning tahlili paneli
      panel(980, 140, 840, 680, C.red, "Qo'lda Nusxalash Xavflari", "nima uchun bu usul jiddiy loyihalarda yaramaydi", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Qaysi Biri Oxirgisi?", 1120, 290, C.red, { size: 16, mono: false });
        text("• sayt-yakuniy, sayt-yakuniy-2, yangi-variant kabi nomlar ko'payadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bir necha kundan so'ng qaysi biri haqiqiy oxirgi kod ekanligi unutiladi.", 1030, 375, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("O'zgarishlar Ma'nosi Yo'q", 1145, 470, C.yellow, { size: 16, mono: false });
        text("• Papka nomidan kim, qachon va nima uchun o'zgartirganini bilib bo'lmaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ikkita papkani ochib, yuzlab fayllarni ko'z bilan solishtirishga to'g'ri keladi.", 1030, 555, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 7.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Ustiga Yozib Yo'qotish Xavfi", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Noto'g'ri papkaga yangi faylni ko'chirib, to'g'ri kodni o'chirib yuborish oson.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Aynan shu sababli dunyo bo'ylab versiya nazorati tizimlari yaratilgan.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Versiya Nazoratining Uch Avlodi
  // (FULL DIAGRAM: Local vs Centralized vs Distributed)
  // ==========================================
  function sceneUchAvlod(u, bounds, o = {}) {
    chip(3, "Versiya Nazoratining Uch Avlodi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Lokal va Markaziy (Eski avlod)
      panel(100, 140, 840, 680, C.yellow, "Lokal va Markazlashgan (Eski Avlod)", "RCS, CVS, Subversion (SVN)", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1. Lokal VCS (RCS)", 210, 290, C.yellow, { size: 16, mono: false });
        text("• Tarix faqat bitta kompyuter diskida patchlar ko'rinishida saqlanadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Boshqa odam bilan hamkorlik qilib bo'lmaydi; disk buzilsa — tarix yo'qoladi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.8, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2. Markazlashgan VCS (SVN / CVS)", 265, 470, C.cyan, { size: 16, mono: false });
        text("• Butun tarix yagona markaziy serverda turadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Dasturchilar har safar serverga ulanib, faqat oxirgi fayllarni oladi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 6.2, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Markazlashgan Xavf (SPOF)", 240, 655, C.red, { size: 16, mono: false });
        text("• Agar markaziy server bir soatga ishdan chiqsa, butun jamoa ishi to'xtaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Server qattiq diski buzilsa — butun loyiha tarixi yo'qolish xavfi bor.", 150, 735, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Taqsimlangan Git modeli
      panel(980, 140, 840, 680, C.green, "Taqsimlangan VCS — Git (Yangi Avlod)", "to'liq mustaqillik, xavfsizlik va erkinlik", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Har Bir Dasturchida To'liq Nusxa", 1160, 290, C.green, { size: 16, mono: false });
        text("• Git'da loyihani klon qilganingizda, faqat oxirgi kodni olmaysiz.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Loyihaning birinchi kunidan boshlab barcha tarixi kompyuteringizga keladi.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.8, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Har Bir Klon — To'liq Zaxira", 1145, 470, C.cyan, { size: 16, mono: false });
        text("• Agar server portlab ketsa ham, istalgan dasturchining noutbukidagi ombor", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Butun tizimni 100% tiklash uchun yetarli hisoblanadi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 6.2, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Oflayn Mustaqillik", 1100, 655, C.mute, { size: 16, mono: false });
        text("• Samolyotda yoki internetsiz tog'da ham commit qilish va shoxlar ochish mumkin.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Internet paydo bo'lganda o'zgarishlar bitta buyruq bilan sinxronlanadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Snapshotlar Modeli — Git Qanday O‘ylaydi
  // (FULL DIAGRAM: Delta vs Snapshot)
  // ==========================================
  function sceneSnapshotModeli(u, bounds, o = {}) {
    chip(4, "Snapshotlar Modeli — Git Qanday O‘ylaydi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Delta modeli
      panel(100, 140, 840, 680, C.yellow, "Delta Modeli (Boshqa Tizimlar)", "fayllar farqlari zanjiri", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Fayl Farqlari Ketma-ketligi", 250, 290, C.yellow, { size: 16, mono: false });
        text("• Tizim boshlang'ich faylni va keyingi o'zgarishlar ro'yxatini (delta) saqlaydi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Versiya 5 ni ko'rish uchun 1-dan 5-gacha bo'lgan barcha patchlar yig'iladi.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.0, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Qayta Qurish Sekinligi", 220, 470, C.red, { size: 16, mono: false });
        text("• Katta loyihalarda minglab farqlarni qayta hisoblash tizimni sekinlashtiradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Zanjirdagi bitta patch buzilsa, undan keyingi barcha versiyalar xavf ostida.", 150, 555, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 6.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Faylga Yo'naltirilgan Fikr", 230, 655, C.mute, { size: 16, mono: false });
        text("• Boshqa tizimlar loyihani emas, har bir alohida faylni alohida kuzatadi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Loyihaning umumiy yagona holatini aniqlash murakkablashadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Snapshotlar oqimi (Git)
      panel(980, 140, 840, 680, C.git, "Snapshot Modeli (Git)", "butun loyihaning to'liq suratlari oqimi", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("To'liq Loyiha Surati (Snapshot)", 1170, 290, C.git, { size: 16, mono: false });
        text("• Git har bir commit qilganingizda loyihaning to'liq suratini oladi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Patchlarni qayta hisoblash kerak emas — barcha fayllar tayyor holatda turadi.", 1030, 375, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 4.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("O'zgarmagan Fayllarga Havola", 1165, 470, C.green, { size: 16, mono: false });
        text("• Agar fayl o'zgarmagan bo'lsa, Git uni qaytadan diskka yozmaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Shunchaki oldingi bir xil saqlangan obyektga ko'rsatkich qo'yadi va joy tejaydi.", 1030, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 6.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Bir Zumlik Kommutatsiya Tezligi", 1180, 655, C.mute, { size: 16, mono: false });
        text("• Istalgan eski versiyaga yoki boshqa shoxga (branch) o'tish chaqmoqdek tez.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Git'ning mashhur tezkorligi aynan shu snapshot modeliga asoslangan.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Lokal Tezlik va Butunlik Kafolati
  // ==========================================
  function sceneLokalTezlik(u, bounds, o = {}) {
    chip(5, "Lokal Tezlik va Butunlik Kafolati", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Lokal tezlik
      panel(100, 140, 840, 680, C.cyan, "Lokal Amallar Tezligi", "tarmoqqa qaram bo'lmagan mustaqil quvvat", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("95% Amallar Kompyuteringizda", 270, 290, C.cyan, { size: 16, mono: false });
        text("• git log, git status, git diff kabi kundalik buyruqlar serverga bormaydi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Hammasi lokal diskdagi .git papkasidan mikrosaniyalarda o'qiladi.", 150, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 4.0, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Oflayn Mukammallik", 215, 470, C.green, { size: 16, mono: false });
        text("• Internet o'chib qolsa ham ishingiz aslo to'xtamaydi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Yangi xususiyatlar yozish, commit qilish va shoxlarni birlashtirish mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 6.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Tarmoq Faqat Almashish Uchun", 260, 655, C.mute, { size: 16, mono: false });
        text("• Internet faqat hamkasblar bilan sinxronlash (push va pull) paytida kerak.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Qolgan barcha operatsiyalar noutbukingizda to'liq mustaqil ishlaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: SHA-1 butunligi va faqat qo'shish
      panel(980, 140, 840, 680, C.purple, "SHA-1 Butunligi va Xavfsizlik", "ma'lumotlarni soxtalashtirib bo'lmaslik kafolati", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("40 Belgili SHA-1 Hesh Kod", 1150, 290, C.purple, { size: 16, mono: false });
        text("• Har bir fayl mazmuni 40 belgili heshga aylanadi: 24b9da655225...", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayldagi bitta vergul o'zgarsa ham, uning hesh kodi butunlay yangilanadi.", 1030, 375, { size: 17, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 4.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Faqat Qo'shish Rejimi (Append-Only)", 1180, 470, C.cyan, { size: 16, mono: false });
        text("• Git omboriga ma'lumotlar faqat qo'shiladi, eski narsalar o'chmaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Xato qilsangiz ham, eski versiyalar omborda xavfsiz saqlanib qoladi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 6.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Tarixni Yashirincha O'zgartirib Bo'lmaydi", 1210, 655, C.mute, { size: 16, mono: false });
        text("• O'tmishdagi bitta bayt o'zgarsa, butun keyingi zanjir buzilib, fosh bo'ladi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Bu Git tarixiga mutlaq kriptografik ishonch va butunlik beradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Tavsiyalar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Xulosa
      panel(100, 140, 840, 680, C.green, "1-Bob Asosiy Xulosalari", "versiya nazoratining poydevori", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Qo'lda Nusxalashdan Qutulish", 250, 290, C.green, { size: 16, mono: false });
        text("• Fayllarni eski, final deb nusxalash o'tmishda qoldi; Git tartib o'rnatadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Bitta papkada butun loyiha tarixi xavfsiz va aniq saqlanadi.", 150, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Taqsimlanganlik va Snapshotlar", 260, 470, C.cyan, { size: 16, mono: false });
        text("• Har bir kompyuter — to'liq zaxira ombori.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Git loyihaning to'liq suratlarini saqlab, yuksak tezlik va qulaylik beradi.", 150, 555, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Lokal Erkinlik", 195, 655, C.mute, { size: 16, mono: false });
        text("• Internetsiz ham barcha operatsiyalarni bajarish imkoniyati.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• SHA-1 butunlik nazorati tufayli ma'lumotlar buzilishidan himoyalangan.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tavsiyalar
      panel(980, 140, 840, 680, C.blue, "Yangi O'rganuvchilarga Tavsiyalar", "boshlang'ich qadamlar uchun muhim eslatmalar", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.blue });
        pill("Terminaldan Qo'rqmang", 1120, 290, C.blue, { size: 16, mono: false });
        text("• Git bilan ishlashning eng to'liq va kuchli yo'li — terminaldir.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir buyruqni sekin, nima qilishini tushunib terishni odat qiling.", 1030, 375, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Modelni Tushuning", 1110, 470, C.yellow, { size: 16, mono: false });
        text("• Git'ni boshqa tizimlar kabi tasavvur qilsangiz, buyruqlar g'alati tuyuladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Uning snapshot modelini tushunsangiz, barcha harakatlar mantiqiy bo'ladi.", 1030, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Ketma-ket Amaliyot Qiling", 1150, 655, C.mute, { size: 16, mono: false });
        text("• Har bir bobdagi buyruqlarni o'z kompyuteringizda takrorlab boring.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Amaliyot — eng tez va mustahkam o'rganish garovidir.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki tavsiya banneri
    const kAdv = P(u, 7.5, 0.5);
    withA(kAdv, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kAdv)) * 16);
      card(100, 840, 1720, 160, { fill: 'rgba(15,22,48,0.96)', col: C.git, lw: 2 });
      pill("Keyingi 02-bob", 220, 880, C.git, { size: 18, mono: false });
      text("Navbatdagi dars: Terminal asoslari va Git'ni o'rnatish", 150, 930, { size: 22, weight: 700, color: C.text, align: 'left' });
      text("Kompyuteringizda terminalni sozlash va Git'ni birinchi bor o'rnatib ishga tushirishni o'rganamiz.", 150, 968, { size: 17, color: C.mute, align: 'left' });
      ctx.restore();
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'muammo_nusxalash', fn: sceneMuammoNusxalash },
      { id: 'uch_avlod', fn: sceneUchAvlod },
      { id: 'snapshot_modeli', fn: sceneSnapshotModeli },
      { id: 'lokal_tezlik_va_butunlik', fn: sceneLokalTezlik },
      { id: 'xulosa', fn: sceneXulosa }
    ];

    for (const s of scenes) {
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
