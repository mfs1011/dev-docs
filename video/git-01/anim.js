// Git 01-bob videosi: "Versiya nazorati va Git nima"
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.GITKIT(ctx);
  const {
    C, UI, MONO, P, eo, eio, eback, withA, rr, tw, text, glow, bg,
    node, burst, link, pill, fileChip, chip, panel, card, heading
  } = K;

  // 1. INTRO (0 -> 12.025s)
  function sIntro(t) {
    const u = t;
    const kTitle = eo(P(u, 0.4, 0.8));
    withA(kTitle, () => {
      text("01-bob · Boshlash", 960, 150 + (1 - kTitle) * 20, { size: 36, weight: 600, color: C.git, fam: UI });
      text("Versiya Nazorati va Git Nima?", 960, 220 + (1 - kTitle) * 20, { size: 68, weight: 800, color: C.text, fam: UI });
      text("Taqsimlangan model, snapshot'lar va butunlik kafolati", 960, 290 + (1 - kTitle) * 15, { size: 30, color: C.mute, fam: UI });
    });

    // Vizual commit zanjiri
    const kGraph = P(u, 1.2, 0.8);
    withA(kGraph, () => {
      const cy = 520;
      // Main branch tugunlari
      const c1 = [480, cy], c2 = [720, cy], c3 = [1140, cy], c4 = [1400, cy];
      // Feature branch tugunlari
      const f1 = [880, cy - 130], f2 = [1060, cy - 130];

      // Aloqalar (boladan otaga)
      link(c2[0], c2[1], c1[0], c1[1], { r1: 30, r2: 30, col: C.blue, w: 5, p: P(u, 2.0, 0.5) });
      link(f1[0], f1[1], c2[0], c2[1], { r1: 28, r2: 30, col: C.purple, w: 5, p: P(u, 3.2, 0.5), bend: 25 });
      link(f2[0], f2[1], f1[0], f1[1], { r1: 28, r2: 28, col: C.purple, w: 5, p: P(u, 4.0, 0.5) });
      link(c3[0], c3[1], c2[0], c2[1], { r1: 30, r2: 30, col: C.blue, w: 5, p: P(u, 4.8, 0.5) });
      link(c4[0], c4[1], c3[0], c3[1], { r1: 34, r2: 30, col: C.git, w: 5, p: P(u, 6.2, 0.5) });
      link(c4[0], c4[1], f2[0], f2[1], { r1: 34, r2: 28, col: C.purple, w: 5, p: P(u, 6.6, 0.5), bend: -25 });

      // Tugunlar
      node(c1[0], c1[1], 30, C.blue, { label: 'b8d700', s: eback(P(u, 1.5, 0.5)) });
      node(c2[0], c2[1], 30, C.blue, { label: 'a85ddc', s: eback(P(u, 2.3, 0.5)) });
      node(f1[0], f1[1], 28, C.purple, { label: '3c4d5e', s: eback(P(u, 3.5, 0.5)) });
      node(f2[0], f2[1], 28, C.purple, { label: '8a9b0c', s: eback(P(u, 4.3, 0.5)) });
      node(c3[0], c3[1], 30, C.blue, { label: '2d5be8', s: eback(P(u, 5.1, 0.5)) });
      node(c4[0], c4[1], 34, C.git, { label: '7f1a9c', s: eback(P(u, 6.8, 0.6)) });

      // Pilla yorliqlari
      pill("main", c3[0], cy + 62, C.blue, { s: eback(P(u, 5.5, 0.5)) });
      pill("feature", f2[0], cy - 192, C.purple, { s: eback(P(u, 4.6, 0.5)) });
      pill("HEAD", c4[0], cy + 68, C.yellow, { s: eback(P(u, 7.3, 0.5)), fg: C.dark });
    });

    // Pastki xulosa
    const kFoot = P(u, 8.5, 0.8);
    withA(kFoot, () => {
      card(260, 840, 1400, 140, { fill: 'rgba(17,24,52,0.85)', col: C.blue, p: kFoot });
      text("Git fayllarning shunchaki nusxasini emas, balki loyihaning to'liq suratlarini saqlaydi.", 960, 890, { size: 24, weight: 600, color: C.text, align: 'center' });
      text("Barcha o'zgarishlar lokal, bir zumda va yuqori xavfsizlik bilan amalga oshadi.", 960, 935, { size: 20, color: C.mute, align: 'center' });
    });
  }

  // 2. MUAMMO VA UCH AVLOD (12.025 -> 39.209s)
  function sMuammoVaAvlodlar(t) {
    const sc = TM.scenes.muammo_va_avlodlar;
    const u = t - sc.s;
    chip(1, "Muammo va Uch Avlod", t, sc.s);
    heading("1. MUAMMO VA VERSIYA NAZORATINING 3 AVLODI", "Nega papkalarni nusxalash yaramaydi va Git qanday farq qiladi?", t, sc);

    const kBox = P(u, 0.8, 0.8);
    withA(kBox, () => {
      // Chap panel: Papkalarni nusxalash
      panel(120, 180, 520, 620, C.orange, "Papkalarni Nusxalash", "an'anaviy xato usul", kBox, kBox);

      const fNames = [
        ["sayt", C.mute],
        ["sayt-eski", C.mute],
        ["sayt-yakuniy", C.mute],
        ["sayt-yakuniy-2", C.orange],
        ["sayt-yakuniy-2 (ishlaydigan)", C.red]
      ];
      fNames.forEach(([fn, col], i) => {
        const kf = P(u, 1.2 + i * 0.4, 0.5);
        withA(kf, () => fileChip(fn, 380, 270 + i * 64, { s: eback(kf), col, w: 420, h: 48, size: 18 }));
      });

      card(150, 600, 460, 175, { fill: 'rgba(255,107,122,0.12)', col: C.red, p: P(u, 4.0, 0.6) });
      text("Katta Kamchiliklar:", 380, 632, { size: 20, weight: 700, color: C.red, align: 'center' });
      text("• Qaysi biri oxirgisi ekanini bilib bo'lmaydi", 170, 668, { size: 16, color: C.text, align: 'left' });
      text("• Nima o'zgargani va kim yozgani noma'lum", 170, 698, { size: 16, color: C.text, align: 'left' });
      text("• Ikki kishi bir vaqtda ishlay olmaydi", 170, 728, { size: 16, color: C.text, align: 'left' });
      text("• Xato fayl ustidan yozib yuborish oson", 170, 756, { size: 16, color: C.red, align: 'left', weight: 600 });

      // O'ng panel: Versiya nazoratining 3 avlodi
      panel(680, 180, 1120, 620, C.blue, "Versiya Nazoratining Uch Avlodi", "lokal -> markazlashgan -> taqsimlangan", kBox, kBox);

      // 1. Lokal VCS
      const kL = P(u, 6.0, 0.6);
      withA(kL, () => {
        card(710, 260, 1060, 140, { fill: 'rgba(15,22,48,0.9)', col: C.purple, p: kL });
        pill("1. Lokal VCS (RCS)", 860, 292, C.purple, { size: 18, mono: false });
        text("• Tarix faqat bitta kompyuter ichidagi lokal bazada saqlanadi (fayl patchlari).", 735, 332, { size: 17, color: C.text, align: 'left' });
        text("• Muammo: Jamoa bilan birga ishlab bo'lmaydi; disk buzilsa butun tarix yo'qoladi!", 735, 366, { size: 17, color: C.red, align: 'left', weight: 600 });
      });

      // 2. Markazlashgan VCS
      const kC = P(u, 11.5, 0.6);
      withA(kC, () => {
        card(710, 425, 1060, 155, { fill: 'rgba(15,22,48,0.9)', col: C.orange, p: kC });
        pill("2. Markazlashgan VCS (SVN, CVS, Perforce)", 930, 458, C.orange, { size: 18, mono: false });
        text("• Bitta markaziy server bor. Dasturchilar faqat oxirgi versiyani yuklab oladi.", 735, 498, { size: 17, color: C.text, align: 'left' });
        text("• Yagona nosozlik nuqtasi (SPOF): Server o'chsa — hech kim commit qila olmaydi!", 735, 532, { size: 17, color: C.orange, align: 'left', weight: 600 });
        text("• Server diski buzilsa — loyihaning butun tarixi bir zumda yo'qoladi.", 735, 562, { size: 16, color: C.mute, align: 'left' });
      });

      // 3. Taqsimlangan VCS
      const kD = P(u, 17.0, 0.6);
      withA(kD, () => {
        card(710, 605, 1060, 170, { fill: 'rgba(21,34,70,0.95)', col: C.green, p: kD });
        pill("3. Taqsimlangan VCS: Git (DVCS)", 880, 638, C.green, { size: 18, mono: false });
        text("• Dasturchi shunchaki fayllarni emas, butun repozitoriyni to'liq tarixi bilan ko'chiradi.", 735, 678, { size: 17, color: C.text, align: 'left' });
        text("• Har bir klon — markaziy serverning 100% to'liq zaxira nusxasidir!", 735, 712, { size: 18, color: C.green, align: 'left', weight: 700 });
        text("• Server ishlamay qolsa ham, istalgan kompyuterdan butun loyihani tiklab bo'ladi.", 735, 746, { size: 17, color: C.mute, align: 'left' });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 23.0, 0.8);
    withA(kFoot, () => {
      card(200, 830, 1520, 170, { fill: 'rgba(17,24,52,0.9)', col: C.green, p: kFoot });
      text("Taqsimlanganlik tufayli Git'da ish to'xtamaydi: har bir dasturchi to'liq va mustaqil ishlay oladi.", 960, 885, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi eng muhim g'oya: Git ma'lumotlarni qanday formatda o'ylaydi va saqlaydi?", 960, 940, { size: 20, color: C.mute, align: 'center' });
    });
  }

  // 3. SNAPSHOT MODELI (39.209 -> 58.659s)
  function sSnapshotModeli(t) {
    const sc = TM.scenes.snapshot_modeli;
    const u = t - sc.s;
    chip(2, "Snapshot'lar Modeli", t, sc.s);
    heading("2. SNAPSHOT'LAR, FARQLAR EMAS", "Boshqa tizimlar kabi deltalarni emas, to'liq suratlarni saqlaydi", t, sc);

    const kBox = P(u, 0.8, 0.8);
    withA(kBox, () => {
      // Chap: Delta-based (Boshqa VCS'lar)
      panel(120, 180, 780, 620, C.red, "Delta-based (Boshqa VCS'lar)", "fayllar va ularning farqlar ro'yxati", kBox, kBox);

      card(150, 260, 720, 480, { fill: 'rgba(15,22,48,0.9)', col: C.red, p: kBox });

      const dRows = [
        { name: "A fayl", vers: ["A", "+Δ1", "—", "+Δ2"] },
        { name: "B fayl", vers: ["B", "—", "+Δ1", "—"] },
        { name: "C fayl", vers: ["C", "+Δ1", "+Δ2", "+Δ3"] }
      ];

      // Sarlavhalar
      text("1-versiya", 390, 305, { size: 18, color: C.mute, fam: MONO });
      text("2-versiya", 510, 305, { size: 18, color: C.mute, fam: MONO });
      text("3-versiya", 630, 305, { size: 18, color: C.mute, fam: MONO });
      text("4-versiya", 750, 305, { size: 18, color: C.mute, fam: MONO });

      dRows.forEach((r, i) => {
        const ry = 365 + i * 85;
        text(r.name, 230, ry, { size: 20, weight: 700, fam: MONO, align: 'center', color: C.text });
        r.vers.forEach((v, vi) => {
          const vx = 390 + vi * 120;
          const isDelta = v.startsWith('+');
          card(vx - 40, ry - 22, 80, 44, { fill: isDelta ? 'rgba(255,107,122,0.2)' : 'rgba(255,255,255,0.06)', col: isDelta ? C.red : C.mute });
          text(v, vx, ry, { size: 18, weight: 600, fam: MONO, color: isDelta ? C.red : C.mute });
        });
      });

      card(180, 620, 660, 95, { fill: 'rgba(255,107,122,0.1)', col: C.red });
      text("Har bir versiyani ko'rish uchun:", 200, 650, { size: 17, weight: 700, color: C.red, align: 'left' });
      text("Boshlang'ich faylga barcha deltalarni ketma-ket qo'shib chiqish shart!", 200, 685, { size: 16, color: C.text, align: 'left' });

      // O'ng: Snapshot-based (Git)
      const kRight = P(u, 3.5, 0.8);
      withA(kRight, () => {
        panel(980, 180, 820, 620, C.green, "Snapshot-based (Git Modeli)", "har commit — to'liq suratlar oqimi", kRight, kRight);

        card(1010, 260, 760, 480, { fill: 'rgba(15,22,48,0.9)', col: C.green, p: kRight });

        text("1-commit", 1230, 305, { size: 18, color: C.green, fam: MONO });
        text("2-commit", 1380, 305, { size: 18, color: C.green, fam: MONO });
        text("3-commit", 1530, 305, { size: 18, color: C.green, fam: MONO });
        text("4-commit", 1680, 305, { size: 18, color: C.green, fam: MONO });

        const sRows = [
          { name: "A fayl", vers: ["A", "A1", "A1·", "A2"], links: [false, true, false, true] },
          { name: "B fayl", vers: ["B", "B·", "B1", "B1·"], links: [false, false, true, false] },
          { name: "C fayl", vers: ["C", "C1", "C2", "C3"], links: [false, true, true, true] }
        ];

        sRows.forEach((r, i) => {
          const ry = 365 + i * 85;
          text(r.name, 1090, ry, { size: 20, weight: 700, fam: MONO, align: 'center', color: C.text });
          r.vers.forEach((v, vi) => {
            const vx = 1230 + vi * 150;
            const isLink = v.includes('·');
            card(vx - 45, ry - 22, 90, 44, {
              fill: isLink ? 'rgba(79,140,255,0.12)' : 'rgba(52,211,153,0.22)',
              col: isLink ? C.blue : C.green
            });
            text(v, vx, ry, { size: 18, weight: 700, fam: MONO, color: isLink ? C.blue : C.green });
          });
        });

        card(1040, 620, 700, 95, { fill: 'rgba(52,211,153,0.1)', col: C.green });
        text("• '·' belgisi — o'zgarmagan fayl qayta saqlanmaydi, faqat havola!", 1060, 650, { size: 16, weight: 700, color: C.green, align: 'left' });
        text("• Git commit'larida diff yo'q: to'liq surat darhol ochiladi!", 1060, 685, { size: 16, color: C.text, align: 'left' });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 9.5, 0.8);
    withA(kFoot, () => {
      card(200, 830, 1520, 170, { fill: 'rgba(17,24,52,0.9)', col: C.blue, p: kFoot });
      text("1000 ta fayldan 2 tasi o'zgarsa, Git 2 ta yangi blob yaratadi, qolgan 998 tasi avvalgisiga havolalanadi.", 960, 885, { size: 23, weight: 700, color: C.blue, align: 'center' });
      text("Shu sababli Git juda katta loyihalarda ham yashindek tez va ixcham ishlaydi.", 960, 940, { size: 19, color: C.mute, align: 'center' });
    });
  }

  // 4. LOKAL AMALLAR VA BUTUNLIK (58.659 -> 78.528s)
  function sLokalAmallarVaButunlik(t) {
    const sc = TM.scenes.lokal_amallar_va_butunlik;
    const u = t - sc.s;
    chip(3, "Lokal Amallar va Butunlik", t, sc.s);
    heading("3. LOKAL TEZLIK VA SHA-1 BUTUNLIK KAFOLATI", "Oflayn ishlash imkoniyati va har bir baytning nazorat yig'indisi", t, sc);

    const kBox = P(u, 0.8, 0.8);
    withA(kBox, () => {
      // Chap: Lokal amallar
      panel(120, 180, 780, 620, C.blue, "1. Deyarli Har Bir Amal Lokal", "serverga bog'lanmasdan ishlash", kBox, kBox);

      card(150, 260, 720, 510, { fill: 'rgba(15,22,48,0.9)', col: C.blue, p: kBox });

      const lPoints = [
        ["Tarixni ko'rish (git log)", "Serverdan so'ramaydi, to'g'ridan-to'g'ri lokal bazadan o'qiydi."],
        ["Fayllarni solishtirish (git diff)", "Eski versiyani lokal topib, farqni o'zi shu zahoti hisoblaydi."],
        ["Oflayn rejimda ishlash", "Internet yoki VPN yo'q paytda ham bemalol kommit qila olasiz."],
        ["Faqat almashishda tarmoq", "Push va pull amallarigina tarmoq orqali uzoq serverga ulanadi."]
      ];

      lPoints.forEach(([head, desc], i) => {
        const py = 295 + i * 115;
        card(180, py, 660, 95, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(210, py + 30, 7, 0, 7); ctx.fill();
        text(head, 230, py + 30, { size: 20, weight: 700, fam: UI, align: 'left', color: C.text });
        text(desc, 230, py + 65, { size: 16, fam: UI, align: 'left', color: C.mute });
      });

      // O'ng: SHA-1 Butunlik
      const kRight = P(u, 4.0, 0.8);
      withA(kRight, () => {
        panel(980, 180, 820, 620, C.purple, "2. SHA-1 Kriptografik Butunlik", "mazmundan hisoblanadigan barmoq izi", kRight, kRight);

        card(1010, 260, 760, 510, { fill: 'rgba(15,22,48,0.9)', col: C.purple, p: kRight });

        text("SHA-1 Hash Formati (40 ta o'n oltilik belgi):", 1040, 305, { size: 19, weight: 700, color: C.purple, align: 'left' });

        card(1040, 335, 700, 60, { fill: '#0a0f24', col: C.purple });
        text("a8345ce15a32566ca36b9e7779e3e08a2f294a55", 1390, 365, { size: 21, weight: 700, fam: MONO, color: C.yellow, align: 'center' });

        text("Qanday hisoblanadi?", 1040, 435, { size: 19, weight: 700, color: C.text, align: 'left' });
        card(1040, 460, 700, 75, { fill: '#0a0f24', col: C.blue });
        text("$ printf 'blob 27\\0console.log(\"salom\")' | shasum", 1060, 485, { size: 16, fam: MONO, align: 'left', color: C.green });
        text("-> a8345ce15a32566ca36b9e7779e3e08a2f294a55", 1060, 515, { size: 16, fam: MONO, align: 'left', color: C.yellow });

        card(1040, 560, 700, 180, { fill: 'rgba(180,108,255,0.1)', col: C.purple });
        text("Butunlik Kafolati:", 1065, 595, { size: 18, weight: 700, color: C.purple, align: 'left' });
        text("• Fayldagi bitta bayt o'zgarsa ham, butun hash o'zgaradi.", 1065, 630, { size: 16, color: C.text, align: 'left' });
        text("• Git bilmasdan biror faylni o'zgartirib bo'lmaydi.", 1065, 665, { size: 16, color: C.text, align: 'left' });
        text("• git fsck buyrug'i har qanday buzilishni darhol aniqlaydi.", 1065, 700, { size: 16, color: C.green, align: 'left', weight: 600 });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 10.0, 0.8);
    withA(kFoot, () => {
      card(200, 830, 1520, 170, { fill: 'rgba(17,24,52,0.9)', col: C.purple, p: kFoot });
      text("ID fayl nomi bo'yicha emas, aynan uning mazmunidan hisoblanadi: mazmun o'zgarsa, yangi obyekt bo'ladi.", 960, 885, { size: 24, weight: 700, color: C.purple, align: 'center' });
      text("Natijada Git tarixi soxtalashtirishdan va tasodifiy buzilishlardan 100% himoyalangan.", 960, 940, { size: 20, color: C.mute, align: 'center' });
    });
  }

  // 5. FAQAT QO'SHISH VA UCH HUDUD (78.528 -> 97.655s)
  function sFaqatQoshishVaUchHudud(t) {
    const sc = TM.scenes.faqat_qoshish_va_uch_hudud;
    const u = t - sc.s;
    chip(4, "Faqat Qo'shish va Uch Hudud", t, sc.s);
    heading("4. FAQAT QO'SHISH VA 3 ASOSIY HUDUD", "Fayllarning hayot sikli: Working Tree, Index va Repository", t, sc);

    const kBox = P(u, 0.8, 0.8);
    withA(kBox, () => {
      // Chap: Faqat qo'shish
      panel(120, 180, 520, 620, C.green, "Faqat Qo'shish Qoidasi", "ma'lumot yo'qolmaydi", kBox, kBox);

      card(150, 260, 460, 510, { fill: 'rgba(15,22,48,0.9)', col: C.green, p: kBox });

      text("Git bazasi — append-only:", 175, 305, { size: 20, weight: 700, color: C.green, align: 'left' });
      text("Bazada ma'lumotlar o'chirilmaydi,", 175, 345, { size: 17, color: C.text, align: 'left' });
      text("faqat yangi obyektlar qo'shiladi.", 175, 375, { size: 17, color: C.text, align: 'left' });

      card(175, 415, 410, 140, { fill: '#0a0f24', col: C.blue });
      text("$ git commit --amend", 195, 445, { size: 17, fam: MONO, align: 'left', color: C.green });
      text("Eski commit o'chmaydi!", 195, 480, { size: 16, weight: 700, align: 'left', color: C.orange });
      text("Obyektlar soni 8 dan 9 ga oshadi.", 195, 515, { size: 15, fam: MONO, align: 'left', color: C.mute });

      card(175, 580, 410, 160, { fill: 'rgba(52,211,153,0.1)', col: C.green });
      text("Reflog orqali tiklash:", 195, 615, { size: 17, weight: 700, color: C.green, align: 'left' });
      text("Tarixda 'yo'qolgan' kommitlarni ham", 195, 650, { size: 16, color: C.text, align: 'left' });
      text("reflog jurnali orqali qaytarib", 195, 680, { size: 16, color: C.text, align: 'left' });
      text("olish mumkin!", 195, 710, { size: 16, weight: 700, color: C.yellow, align: 'left' });

      // O'ng: Uchta hudud
      const kRight = P(u, 3.5, 0.8);
      withA(kRight, () => {
        panel(680, 180, 1120, 620, C.blue, "Git'ning Uchta Asosiy Hududi", "working tree -> staging area -> repository", kRight, kRight);

        const PX = [710, 1080, 1450], PW = 340, PH = 480;
        const hCols = [C.orange, C.green, C.blue];
        const hTitles = [
          ["Ishchi Papka", "working tree", "Tahrirlash joyi"],
          ["Staging Area", "index", "Tayyorlangan ro'yxat"],
          ["Repozitoriy", "repository (.git)", "Xavfsiz arxiv"]
        ];

        PX.forEach((x, i) => {
          card(x, 260, PW, PH, { fill: 'rgba(15,22,48,0.92)', col: hCols[i], p: kRight });
          pill(hTitles[i][0], x + PW / 2, 300, hCols[i], { size: 18, mono: false });
          text(hTitles[i][1], x + PW / 2, 335, { size: 15, fam: MONO, color: C.mute });
          text(hTitles[i][2], x + PW / 2, 365, { size: 16, weight: 600, color: C.text });

          // Fayllar ko'rinishi
          if (i === 0) {
            fileChip("index.html", x + PW / 2, 420, { w: 290, h: 44, col: C.orange, tag: "o'zgargan" });
            fileChip("style.css", x + PW / 2, 480, { w: 290, h: 44, col: C.orange, tag: "o'zgargan" });
            fileChip("app.js", x + PW / 2, 540, { w: 290, h: 44, col: C.mute });
          } else if (i === 1) {
            fileChip("index.html", x + PW / 2, 420, { w: 290, h: 44, col: C.green, tag: "staged" });
            fileChip("style.css", x + PW / 2, 480, { w: 290, h: 44, col: C.green, tag: "staged" });
            text("Keyingi commit'ga kiradi", x + PW / 2, 540, { size: 16, color: C.green, weight: 600 });
          } else {
            node(x + PW / 2, 430, 26, C.blue, { label: 'a85ddc' });
            node(x + PW / 2, 530, 28, C.git, { label: '2d5be8' });
            link(x + PW / 2, 502, x + PW / 2, 458, { col: C.blue, w: 4 });
            pill("main", x + PW / 2, 600, C.blue, { size: 16 });
          }
        });

        // O'tish strelkalari
        link(PX[0] + PW, 460, PX[1], 460, { col: C.green, w: 5, p: P(u, 5.0, 0.5) });
        pill("git add", 1065, 430, C.green, { size: 15, s: eback(P(u, 5.2, 0.4)) });

        link(PX[1] + PW, 460, PX[2], 460, { col: C.blue, w: 5, p: P(u, 6.5, 0.5) });
        pill("git commit", 1435, 430, C.blue, { size: 15, s: eback(P(u, 6.7, 0.4)) });

        card(740, 640, 1000, 80, { fill: 'rgba(255,255,255,0.04)', col: C.mute });
        text("Qoida: Avval nima kirishini tanlaysiz (git add), keyin surat qilib muhrlaysiz (git commit)!", 1240, 680, { size: 18, weight: 600, color: C.yellow, align: 'center' });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 9.5, 0.8);
    withA(kFoot, () => {
      card(200, 830, 1520, 170, { fill: 'rgba(17,24,52,0.9)', col: C.green, p: kFoot });
      text("Ikki bosqichli saqlash (add -> commit) tasodifiy kirlarni kiritmaslik uchun eng qulay mexanizmdir.", 960, 885, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi 01-bobning asosiy xulosalarini umumlashtiramiz.", 960, 940, { size: 20, color: C.mute, align: 'center' });
    });
  }

  // 6. XULOSA (97.655 -> 114.16s)
  function sXulosa(t) {
    const sc = TM.scenes.xulosa;
    const u = t - sc.s;
    chip(5, "Xulosa", t, sc.s);
    heading("01-BOB XULOSASI: GIT ASOSLARI", "Dasturchi tushunishi shart bo'lgan eng muhim g'oyalar", t, sc);

    const kBox = P(u, 0.5, 0.8);
    withA(kBox, () => {
      const cards = [
        {
          num: "1",
          title: "Snapshot Modeli",
          col: C.green,
          items: [
            "Fayllar farqi (delta) emas",
            "Butun loyihaning to'liq surati",
            "O'zgarmagan fayllar faqat havola",
            "Har qanday commit bir zumda ochiladi"
          ]
        },
        {
          num: "2",
          title: "Lokal va Taqsimlangan",
          col: C.blue,
          items: [
            "Har bir klon — to'liq zaxira nusxasi",
            "Server o'chsa ham ish to'xtamaydi",
            "Oflayn rejimda commit va diff",
            "Yagona nosozlik nuqtasi yo'q"
          ]
        },
        {
          num: "3",
          title: "Butunlik va Xavfsizlik",
          col: C.purple,
          items: [
            "40 xonali SHA-1 hesh nazorati",
            "Bir bayt o'zgarsa ham aniqlanadi",
            "Faqat ma'lumot qo'shish (append-only)",
            "3 hudud: working tree, index, .git"
          ]
        }
      ];

      const cW = 490, cH = 460;
      cards.forEach((c, i) => {
        const cx = 150 + i * 550;
        const cy = 200;
        const kc = P(u, 0.8 + i * 0.4, 0.6);
        withA(kc, () => {
          card(cx, cy, cW, cH, { fill: 'rgba(15,22,48,0.92)', col: c.col, p: kc });
          pill(c.num + " · " + c.title, cx + cW / 2, cy + 45, c.col, { size: 20, mono: false });

          c.items.forEach((item, j) => {
            const iy = cy + 115 + j * 75;
            card(cx + 25, iy, cW - 50, 60, { fill: 'rgba(255,255,255,0.04)', col: c.col });
            ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(cx + 50, iy + 30, 6, 0, 7); ctx.fill();
            text(item, cx + 70, iy + 30, { size: 17, weight: 600, align: 'left', color: C.text });
          });
        });
      });

      // Pastki xulosa
      const kFoot = P(u, 2.8, 0.8);
      withA(kFoot, () => {
        card(220, 710, 1480, 270, { fill: 'rgba(18,26,58,0.95)', col: C.git, p: kFoot });
        text("Keyingi bob: 02 — Terminal va Git'ni o'rnatish", 960, 765, { size: 32, weight: 800, color: C.git, align: 'center' });
        text("Kompyuteringizda terminalni sozlash, Git'ni o'rnatish va birinchi muhitni tayyorlaymiz.", 960, 820, { size: 21, color: C.text, align: 'center' });
        text("E'tiboringiz uchun rahmat! · dev-docs.uz", 960, 875, { size: 20, weight: 600, color: C.mute, align: 'center' });
      });
    });
  }

  // Asosiy kadr chizuvchi
  window.renderFrame = function (t) {
    bg(t);
    const { intro, muammo_va_avlodlar, snapshot_modeli, lokal_amallar_va_butunlik, faqat_qoshish_va_uch_hudud, xulosa } = TM.scenes;

    if (t < muammo_va_avlodlar.s) {
      sIntro(t);
    } else if (t < snapshot_modeli.s) {
      sMuammoVaAvlodlar(t);
    } else if (t < lokal_amallar_va_butunlik.s) {
      sSnapshotModeli(t);
    } else if (t < faqat_qoshish_va_uch_hudud.s) {
      sLokalAmallarVaButunlik(t);
    } else if (t < xulosa.s) {
      sFaqatQoshishVaUchHudud(t);
    } else {
      sXulosa(t);
    }
  };

  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
