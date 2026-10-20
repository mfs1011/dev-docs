// Git 01-bob videosi: "Versiya nazorati va Git nima"
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.GITKIT(ctx);
  const {
    C, UI, MONO, P, eo, eio, eback, withA, rr, tw, text, glow, bg,
    node, burst, link, pill, fileChip, chip, panel, card
  } = K;

  // 1. INTRO (0 -> 12.025s)
  function sIntro(t, o = {}) {
    const u = o.isPoster ? 8.0 : t;
    const gy = o.gy || 0;
    const ty = o.ty || 0;
    const kTitle = o.isPoster ? 1 : eo(P(u, 0.4, 0.8));
    withA(kTitle, () => {
      text("01-bob · Boshlash", 960, 125 + ty + (1 - kTitle) * 20, { size: 36, weight: 600, color: C.git, fam: UI });
      text("Versiya Nazorati va Git Nima?", 960, 190 + ty + (1 - kTitle) * 20, { size: 68, weight: 800, color: C.text, fam: UI });
      text("Taqsimlangan model, snapshot'lar va butunlik kafolati", 960, 252 + ty + (1 - kTitle) * 15, { size: 28, color: C.mute, fam: UI });
    });

    // Vizual commit zanjiri
    const kGraph = o.isPoster ? 1 : P(u, 1.2, 0.8);
    withA(kGraph, () => {
      const cy = 520 + gy;
      // Main branch tugunlari
      const c1 = [480, cy], c2 = [720, cy], c3 = [1140, cy], c4 = [1400, cy];
      // Feature branch tugunlari
      const f1 = [880, cy - 120], f2 = [1060, cy - 120];

      const pLink = (st, dur) => o.isPoster ? 1 : P(u, st, dur);
      const pBack = (st, dur) => o.isPoster ? 1 : eback(P(u, st, dur));

      // Aloqalar (boladan otaga)
      link(c2[0], c2[1], c1[0], c1[1], { r1: 30, r2: 30, col: C.blue, w: 5, p: pLink(2.0, 0.5) });
      link(f1[0], f1[1], c2[0], c2[1], { r1: 28, r2: 30, col: C.purple, w: 5, p: pLink(3.2, 0.5), bend: 25 });
      link(f2[0], f2[1], f1[0], f1[1], { r1: 28, r2: 28, col: C.purple, w: 5, p: pLink(4.0, 0.5) });
      link(c3[0], c3[1], c2[0], c2[1], { r1: 30, r2: 30, col: C.blue, w: 5, p: pLink(4.8, 0.5) });
      link(c4[0], c4[1], c3[0], c3[1], { r1: 34, r2: 30, col: C.git, w: 5, p: pLink(6.2, 0.5) });
      link(c4[0], c4[1], f2[0], f2[1], { r1: 34, r2: 28, col: C.purple, w: 5, p: pLink(6.6, 0.5), bend: -25 });

      // Tugunlar
      node(c1[0], c1[1], 30, C.blue, { label: 'b8d700', s: pBack(1.5, 0.5) });
      node(c2[0], c2[1], 30, C.blue, { label: 'a85ddc', s: pBack(2.3, 0.5) });
      node(f1[0], f1[1], 28, C.purple, { label: '3c4d5e', s: pBack(3.5, 0.5) });
      node(f2[0], f2[1], 28, C.purple, { label: '8a9b0c', s: pBack(4.3, 0.5) });
      node(c3[0], c3[1], 30, C.blue, { label: '2d5be8', s: pBack(5.1, 0.5) });
      node(c4[0], c4[1], 34, C.git, { label: '7f1a9c', s: pBack(6.8, 0.6) });

      // Pilla yorliqlari
      pill("main", c3[0], cy + 62, C.blue, { s: pBack(5.5, 0.5) });
      pill("feature", f2[0], cy - 175, C.purple, { s: pBack(4.6, 0.5) });
      pill("HEAD", c4[0], cy + 68, C.yellow, { s: pBack(7.3, 0.5), fg: C.dark });
    });

    // Pastki xulosa
    if (o.foot !== false) {
      const kFoot = o.isPoster ? 1 : P(u, 8.5, 0.8);
      withA(kFoot, () => {
        ctx.save();
        if (!o.isPoster) ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
        text("Git fayllarning shunchaki nusxasini emas, balki loyihaning to'liq suratlarini saqlaydi.", 960, 895, { size: 24, weight: 700, color: C.text, align: 'center' });
        text("Barcha o'zgarishlar lokal, bir zumda va yuqori xavfsizlik bilan amalga oshadi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
        ctx.restore();
      });
    }
  }

  // 2. MUAMMO VA UCH AVLOD (12.025 -> 39.209s)
  function sMuammoVaAvlodlar(t) {
    const sc = TM.scenes.muammo_va_avlodlar;
    const u = t - sc.s;
    chip(1, "Muammo va Uch Avlod", u);

    const kBox = P(u, 0.4, 0.6);
    withA(kBox, () => {
      // Chap panel: Papkalarni nusxalash
      panel(100, 140, 540, 680, C.orange, "Papkalarni Nusxalash", "an'anaviy xato usul", kBox, kBox);

      const fNames = [
        ["loyiha", C.mute],
        ["loyiha-eski", C.mute],
        ["loyiha-yakuniy", C.mute],
        ["loyiha-yakuniy-2", C.orange],
        ["loyiha-ENG-OXIRGI (ishchi)", C.red]
      ];
      fNames.forEach(([fn, col], i) => {
        const kf = P(u, 0.8 + i * 0.35, 0.5);
        withA(kf, () => fileChip(fn, 370, 265 + i * 58, { s: eback(kf), col, w: 440, h: 48, size: 18 }));
      });

      // Kamchiliklar kartasi (faqat o'z vaqtida fade + slide bo'ladi)
      const kWarn = P(u, 3.2, 0.6);
      withA(kWarn, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kWarn)) * 16);
        card(125, 565, 490, 235, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        text("Katta Kamchiliklar:", 370, 598, { size: 20, weight: 700, color: C.red, align: 'center' });
        text("• Qaysi biri oxirgisi ekanini bilib bo'lmaydi", 150, 640, { size: 16, color: C.text, align: 'left' });
        text("• Nima o'zgargani va kim yozgani noma'lum", 150, 678, { size: 16, color: C.text, align: 'left' });
        text("• Bir nechta dasturchi birga ishlay olmaydi", 150, 716, { size: 16, color: C.text, align: 'left' });
        text("• Xato fayl ustidan yozib yuborish juda oson", 150, 754, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      // O'ng panel: Versiya nazoratining 3 avlodi
      panel(670, 140, 1150, 680, C.blue, "Versiya Nazoratining Uch Avlodi", "lokal -> markazlashgan -> taqsimlangan", kBox, kBox);

      // 1. Lokal VCS
      const kL = P(u, 4.5, 0.6);
      withA(kL, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kL)) * 16);
        card(700, 245, 1090, 160, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
        pill("1 · Lokal VCS (RCS)", 860, 280, C.purple, { size: 18, mono: false });
        text("• Tarix faqat bitta kompyuter ichidagi lokal bazada patchlar shaklida saqlanadi.", 730, 325, { size: 17, color: C.text, align: 'left' });
        text("• Asosiy muammo: Jamoa bilan ishlab bo'lmaydi; disk buzilsa butun tarix yo'qoladi!", 730, 365, { size: 17, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      // 2. Markazlashgan VCS
      const kC = P(u, 9.0, 0.6);
      withA(kC, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kC)) * 16);
        card(700, 425, 1090, 175, { fill: 'rgba(15,22,48,0.92)', col: C.orange });
        pill("2 · Markazlashgan VCS (SVN, CVS)", 900, 460, C.orange, { size: 18, mono: false });
        text("• Bitta markaziy server. Dasturchilar faqat kerakli oxirgi versiyani yuklab oladi.", 730, 505, { size: 17, color: C.text, align: 'left' });
        text("• Yagona nosozlik nuqtasi (SPOF): Markaziy server o'chsa — hech kim kommit qila olmaydi!", 730, 545, { size: 17, color: C.orange, align: 'left', weight: 600 });
        text("• Server diski ishdan chiqsa — loyihaning butun o'tmishi bir zumda yo'qoladi.", 730, 575, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // 3. Taqsimlangan VCS
      const kD = P(u, 14.5, 0.6);
      withA(kD, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kD)) * 16);
        card(700, 620, 1090, 180, { fill: 'rgba(21,34,70,0.95)', col: C.green });
        pill("3 · Taqsimlangan VCS: Git (DVCS)", 905, 655, C.green, { size: 18, mono: false });
        text("• Dasturchi shunchaki fayllarni emas, butun repozitoriyni to'liq tarixi bilan ko'chiradi.", 730, 700, { size: 17, color: C.text, align: 'left' });
        text("• Har bir klon — markaziy serverning 100% to'liq zaxira nusxasidir!", 730, 735, { size: 18, color: C.green, align: 'left', weight: 700 });
        text("• Markaziy server ishdan chiqsa ham, istalgan kompyuterdan loyihani qayta tiklash mumkin.", 730, 770, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 19.0, 0.8);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Taqsimlanganlik tufayli Git'da ish to'xtamaydi: har bir dasturchi to'liq va mustaqil ishlay oladi.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi eng muhim savol: Git ma'lumotlarni qanday formatda o'ylaydi va saqlaydi?", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // 3. SNAPSHOT MODELI (39.209 -> 58.659s)
  function sSnapshotModeli(t) {
    const sc = TM.scenes.snapshot_modeli;
    const u = t - sc.s;
    chip(2, "Snapshot'lar Modeli", u);

    const kBox = P(u, 0.4, 0.6);
    withA(kBox, () => {
      // Chap: Delta-based (Boshqa VCS'lar)
      panel(100, 140, 840, 680, C.red, "Delta-based (Boshqa VCS'lar)", "fayllar va ularning farqlar (delta) ro'yxati", kBox, kBox);

      // Sarlavhalar
      text("1-versiya", 390, 270, { size: 18, color: C.mute, fam: MONO });
      text("2-versiya", 530, 270, { size: 18, color: C.mute, fam: MONO });
      text("3-versiya", 670, 270, { size: 18, color: C.mute, fam: MONO });
      text("4-versiya", 810, 270, { size: 18, color: C.mute, fam: MONO });

      const dRows = [
        { name: "Fayl A", vers: ["A", "+Δ1", "—", "+Δ2"] },
        { name: "Fayl B", vers: ["B", "—", "+Δ1", "—"] },
        { name: "Fayl C", vers: ["C", "+Δ1", "+Δ2", "+Δ3"] }
      ];

      dRows.forEach((r, i) => {
        const ry = 345 + i * 75;
        text(r.name, 210, ry, { size: 20, weight: 700, fam: MONO, align: 'center', color: C.text });
        r.vers.forEach((v, vi) => {
          const vx = 390 + vi * 140;
          const isDelta = v.startsWith('+');
          card(vx - 45, ry - 23, 90, 46, {
            fill: isDelta ? 'rgba(255,107,122,0.18)' : 'rgba(255,255,255,0.06)',
            col: isDelta ? C.red : C.mute
          });
          text(v, vx, ry, { size: 18, weight: 600, fam: MONO, color: isDelta ? C.red : C.mute });
        });
      });

      // Chap izoh kartasi (faqat u >= 2.0 da fade + slide bo'ladi)
      const kLeftCard = P(u, 2.0, 0.6);
      withA(kLeftCard, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kLeftCard)) * 16);
        card(130, 580, 780, 220, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        text("Qanday ishlaydi va asosiy kamchiligi:", 160, 615, { size: 18, weight: 700, color: C.red, align: 'left' });
        text("• Har bir versiya avvalgisiga nisbatan farq (patch) sifatida saqlanadi.", 160, 655, { size: 16, color: C.text, align: 'left' });
        text("• 4-versiyani ochish uchun: 1-faylga barcha deltalarni ketma-ket qo'shish shart!", 160, 695, { size: 16, color: C.text, align: 'left' });
        text("• Bitta delta buzilsa, undan keyingi butun tarix ishdan chiqadi.", 160, 735, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("• Loyiha kattalashgani sari versiyalarni tiklash sekinlashib boradi.", 160, 770, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng: Snapshot-based (Git)
      const kRight = P(u, 3.0, 0.6);
      withA(kRight, () => {
        panel(980, 140, 840, 680, C.green, "Snapshot-based (Git Modeli)", "har commit — butun loyihaning to'liq surati", kRight, kRight);

        text("1-commit", 1260, 270, { size: 18, color: C.green, fam: MONO });
        text("2-commit", 1400, 270, { size: 18, color: C.green, fam: MONO });
        text("3-commit", 1540, 270, { size: 18, color: C.green, fam: MONO });
        text("4-commit", 1680, 270, { size: 18, color: C.green, fam: MONO });

        const sRows = [
          { name: "Fayl A", vers: ["A", "A1", "havola ↗", "A2"] },
          { name: "Fayl B", vers: ["B", "havola ↗", "B1", "havola ↗"] },
          { name: "Fayl C", vers: ["C", "C1", "C2", "C3"] }
        ];

        sRows.forEach((r, i) => {
          const ry = 345 + i * 75;
          text(r.name, 1090, ry, { size: 20, weight: 700, fam: MONO, align: 'center', color: C.text });
          r.vers.forEach((v, vi) => {
            const vx = 1260 + vi * 140;
            const isLink = v.includes('havola');
            card(vx - 50, ry - 23, 100, 46, {
              fill: isLink ? 'rgba(79,140,255,0.14)' : 'rgba(52,211,153,0.22)',
              col: isLink ? C.blue : C.green
            });
            text(v, vx, ry, { size: isLink ? 14 : 18, weight: 700, fam: MONO, color: isLink ? C.blue : C.green });
          });
        });

        // O'ng izoh kartasi (faqat u >= 5.0 da fade + slide bo'ladi)
        const kRightCard = P(u, 5.0, 0.6);
        withA(kRightCard, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kRightCard)) * 16);
          card(1010, 580, 780, 220, { fill: 'rgba(52,211,153,0.08)', col: C.green });
          text("Git'ning ulkan afzalliklari:", 1040, 615, { size: 18, weight: 700, color: C.green, align: 'left' });
          text("• Har bir commit — loyihaning o'sha lahzadagi to'liq mustaqil suratidir.", 1040, 655, { size: 16, color: C.text, align: 'left' });
          text("• O'zgarmagan fayllar qayta nusxalanmaydi — oldingi obyektga havola qo'yiladi!", 1040, 695, { size: 16, color: C.blue, weight: 600, align: 'left' });
          text("• Commit ochishda deltalarni yig'ish yo'q: istalgan versiya bir zumda ochiladi.", 1040, 735, { size: 16, color: C.text, align: 'left' });
          text("• Snapshot modeli Git'ni yengil, juda tezkor va mustahkam qiladi.", 1040, 770, { size: 16, color: C.green, weight: 600, align: 'left' });
          ctx.restore();
        });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 9.0, 0.8);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.blue });
      text("1000 ta fayldan 2 tasi o'zgarsa: Git 2 ta yangi blob yaratadi, qolgan 998 tasi havolalanadi.", 960, 895, { size: 24, weight: 700, color: C.blue, align: 'center' });
      text("Shu sababli Git juda ulkan loyihalarda ham yashindek tez va ixcham ishlaydi.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // 4. LOKAL AMALLAR VA BUTUNLIK (58.659 -> 78.528s)
  function sLokalAmallarVaButunlik(t) {
    const sc = TM.scenes.lokal_amallar_va_butunlik;
    const u = t - sc.s;
    chip(3, "Lokal Amallar va Butunlik", u);

    const kBox = P(u, 0.4, 0.6);
    withA(kBox, () => {
      // Chap: Lokal amallar
      panel(100, 140, 840, 680, C.blue, "1. Deyarli Har Bir Amal Lokal", "serverga bog'lanmasdan to'liq mustaqil ishlash", kBox, kBox);

      const lPoints = [
        ["Tarixni ko'rish (git log)", "Serverdan so'ramaydi, butun tarix to'g'ridan-to'g'ri o'z diskingizdan o'qiladi."],
        ["Fayllarni solishtirish (git diff)", "Eski nusxalar ham lokal mavjud, ikki commit farqi bir zumda hisoblanadi."],
        ["Oflayn rejimda ishlash", "Internet yoki VPN yo'q paytda ham bemalol yangi commitlar yarata olasiz."],
        ["Faqat almashishda tarmoq", "Push va pull amallarigina tarmoq orqali uzoqdagi serverga ulanadi."]
      ];

      lPoints.forEach(([head, desc], i) => {
        const py = 250 + i * 135;
        const kp = P(u, 0.8 + i * 0.4, 0.5);
        withA(kp, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kp)) * 16);
          card(130, py, 780, 115, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(165, py + 36, 7, 0, 7); ctx.fill();
          text(head, 190, py + 36, { size: 20, weight: 700, fam: UI, align: 'left', color: C.text });
          text(desc, 190, py + 78, { size: 16, fam: UI, align: 'left', color: C.mute });
          ctx.restore();
        });
      });

      // O'ng: SHA-1 Butunlik
      const kRight = P(u, 3.2, 0.6);
      withA(kRight, () => {
        panel(980, 140, 840, 680, C.purple, "2. SHA-1 Kriptografik Butunlik", "mazmundan hisoblanadigan 40 xonali barmoq izi", kRight, kRight);

        // Box 1: Hesh ko'rinishi
        const kB1 = P(u, 3.2, 0.6);
        withA(kB1, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kB1)) * 16);
          card(1010, 250, 780, 120, { fill: 'rgba(15,22,48,0.92)', col: C.purple });
          text("SHA-1 Hesh Formati (40 ta o'n oltilik belgi):", 1040, 282, { size: 18, weight: 700, color: C.purple, align: 'left' });
          card(1040, 310, 720, 44, { fill: '#0a0f24', col: C.purple });
          text("a8345ce15a32566ca36b9e7779e3e08a2f294a55", 1400, 332, { size: 20, weight: 700, fam: MONO, color: C.yellow, align: 'center' });
          ctx.restore();
        });

        // Box 2: Qanday hisoblanadi? (u >= 4.5 da boshlanadi)
        const kB2 = P(u, 4.5, 0.6);
        withA(kB2, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kB2)) * 16);
          card(1010, 395, 780, 160, { fill: 'rgba(15,22,48,0.92)', col: C.blue });
          text("Hesh fayl mazmunidan generatsiya qilinadi:", 1040, 428, { size: 18, weight: 700, color: C.text, align: 'left' });
          card(1040, 455, 720, 80, { fill: '#0a0f24', col: C.blue });
          text("$ printf 'blob 27\\0console.log(\"salom\")' | shasum", 1060, 480, { size: 16, fam: MONO, align: 'left', color: C.green });
          text("-> a8345ce15a32566ca36b9e7779e3e08a2f294a55", 1060, 512, { size: 16, fam: MONO, align: 'left', color: C.yellow });
          ctx.restore();
        });

        // Box 3: Butunlik Kafolati (u >= 6.0 da boshlanadi)
        const kB3 = P(u, 6.0, 0.6);
        withA(kB3, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kB3)) * 16);
          card(1010, 580, 780, 220, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
          text("Kriptografik Butunlik Kafolati:", 1040, 615, { size: 18, weight: 700, color: C.purple, align: 'left' });
          text("• Fayldagi bitta bayt yoki probel o'zgarsa ham, butun hesh o'zgaradi.", 1040, 655, { size: 16, color: C.text, align: 'left' });
          text("• Git bilmasdan biror faylni yoki o'tmishni soxtalashtirib bo'lmaydi.", 1040, 695, { size: 16, color: C.text, align: 'left' });
          text("• git fsck buyrug'i har qanday zararlanish yoki xatoni darhol fosh qiladi.", 1040, 735, { size: 16, color: C.green, weight: 600, align: 'left' });
          text("• Tarix zanjiri har bir ota-onaning heshiga qat'iy bog'langan bo'ladi.", 1040, 770, { size: 15, color: C.mute, align: 'left' });
          ctx.restore();
        });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 9.5, 0.8);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.purple });
      text("ID fayl nomi bo'yicha emas, aynan uning mazmunidan hisoblanadi: mazmun o'zgarsa — yangi obyekt.", 960, 895, { size: 24, weight: 700, color: C.purple, align: 'center' });
      text("Natijada Git tarixi soxtalashtirishdan va tasodifiy buzilishlardan 100% himoyalangan.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // 5. FAQAT QO'SHISH VA UCH HUDUD (78.528 -> 97.655s)
  function sFaqatQoshishVaUchHudud(t) {
    const sc = TM.scenes.faqat_qoshish_va_uch_hudud;
    const u = t - sc.s;
    chip(4, "Faqat Qo'shish va Uch Hudud", u);

    const kBox = P(u, 0.4, 0.6);
    withA(kBox, () => {
      // Chap: Faqat qo'shish
      panel(100, 140, 520, 680, C.green, "Faqat Qo'shish Qoidasi", "ma'lumot yo'qolmaydi (append-only)", kBox, kBox);

      // Box 1 (u=0.4)
      card(125, 250, 470, 145, { fill: 'rgba(15,22,48,0.92)', col: C.green });
      text("Git bazasi — append-only:", 150, 282, { size: 19, weight: 700, color: C.green, align: 'left' });
      text("Bazada ma'lumotlar o'chirilmaydi,", 150, 320, { size: 16, color: C.text, align: 'left' });
      text("faqat yangi obyektlar qo'shiladi.", 150, 352, { size: 16, color: C.text, align: 'left' });

      // Box 2 (u=1.8 da boshlanadi)
      const kAmend = P(u, 1.8, 0.6);
      withA(kAmend, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kAmend)) * 16);
        card(125, 415, 470, 160, { fill: '#0a0f24', col: C.blue });
        text("$ git commit --amend", 150, 448, { size: 16, fam: MONO, align: 'left', color: C.green });
        text("Eski commit o'chmaydi!", 150, 485, { size: 17, weight: 700, align: 'left', color: C.orange });
        text("Yangi commit yaratiladi, eski commit", 150, 520, { size: 15, color: C.text, align: 'left' });
        text("esa xotirada saqlanib qolaveradi.", 150, 548, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // Box 3 (u=3.5 da boshlanadi)
      const kReflog = P(u, 3.5, 0.6);
      withA(kReflog, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kReflog)) * 16);
        card(125, 595, 470, 205, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        text("Reflog orqali qayta tiklash:", 150, 628, { size: 18, weight: 700, color: C.green, align: 'left' });
        text("Tarixda 'yo'qolgan' commitlarni ham", 150, 668, { size: 16, color: C.text, align: 'left' });
        text("reflog jurnali orqali 30-90 kun ichida", 150, 702, { size: 16, color: C.text, align: 'left' });
        text("bemalol qaytarib olish mumkin!", 150, 736, { size: 17, weight: 700, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // O'ng: Uchta hudud
      const kRight = P(u, 2.8, 0.6);
      withA(kRight, () => {
        panel(650, 140, 1170, 680, C.blue, "Git'ning Uchta Asosiy Hududi", "working tree -> staging area -> repository", kRight, kRight);

        // 3 zona ustuni
        const cols = [
          { x: 680, w: 340, col: C.orange, pill: "Ishchi Papka", sub: "working tree", desc: "Tahrirlash maydoni" },
          { x: 1065, w: 340, col: C.green, pill: "Staging Area", sub: "staging (index)", desc: "Tayyorlangan ro'yxat" },
          { x: 1450, w: 340, col: C.blue, pill: "Repozitoriy", sub: "repository (.git)", desc: "Doimiy xavfsiz arxiv" }
        ];

        cols.forEach((c, i) => {
          card(c.x, 250, c.w, 420, { fill: 'rgba(15,22,48,0.92)', col: c.col, p: kRight });
          pill(c.pill, c.x + c.w / 2, 290, c.col, { size: 18, mono: false });
          text(c.sub, c.x + c.w / 2, 330, { size: 15, fam: MONO, color: C.mute });
          text(c.desc, c.x + c.w / 2, 360, { size: 16, weight: 600, color: C.text });

          if (i === 0) {
            fileChip("index.html", c.x + c.w / 2, 420, { w: 290, h: 44, col: C.orange, tag: "o'zgargan" });
            fileChip("style.css", c.x + c.w / 2, 480, { w: 290, h: 44, col: C.orange, tag: "o'zgargan" });
            fileChip("app.js", c.x + c.w / 2, 540, { w: 290, h: 44, col: C.mute });
            text("Fayllar erkin tahrirlanadi", c.x + c.w / 2, 620, { size: 15, color: C.mute });
          } else if (i === 1) {
            fileChip("index.html", c.x + c.w / 2, 420, { w: 290, h: 44, col: C.green, tag: "staged" });
            fileChip("style.css", c.x + c.w / 2, 480, { w: 290, h: 44, col: C.green, tag: "staged" });
            text("Keyingi commit tarkibi", c.x + c.w / 2, 545, { size: 16, color: C.green, weight: 700 });
            text("app.js kiritilmadi (toza)", c.x + c.w / 2, 620, { size: 15, color: C.mute });
          } else {
            node(c.x + c.w / 2, 430, 26, C.blue, { label: 'a85ddc' });
            link(c.x + c.w / 2, 505, c.x + c.w / 2, 460, { col: C.blue, w: 4 });
            node(c.x + c.w / 2, 515, 28, C.git, { label: '2d5be8' });
            pill("HEAD -> main", c.x + c.w / 2, 605, C.yellow, { size: 16, fg: C.dark });
          }
        });

        // O'tish o'qlari
        link(1020, 450, 1065, 450, { col: C.green, w: 5, p: P(u, 4.0, 0.5) });
        pill("git add", 1042, 415, C.green, { size: 14, s: eback(P(u, 4.2, 0.4)) });

        link(1405, 450, 1450, 450, { col: C.blue, w: 5, p: P(u, 5.5, 0.5) });
        pill("git commit", 1427, 415, C.blue, { size: 14, s: eback(P(u, 5.7, 0.4)) });

        // Pastki eslatma (u=7.0 da boshlanadi)
        const kNote = P(u, 7.0, 0.6);
        withA(kNote, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kNote)) * 16);
          card(680, 690, 1110, 105, { fill: 'rgba(255,255,255,0.04)', col: C.mute });
          text("Qoida: Avval nima kirishini tanlaysiz (git add), so'ngra to'liq surat qilib muhrlaysiz (git commit)!", 1235, 742, { size: 18, weight: 700, color: C.yellow, align: 'center' });
          ctx.restore();
        });
      });
    });

    // Pastki xulosa
    const kFoot = P(u, 9.5, 0.8);
    withA(kFoot, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
      card(100, 845, 1720, 165, { fill: 'rgba(17,24,52,0.92)', col: C.green });
      text("Ikki bosqichli saqlash (add -> commit) tasodifiy xatolarni kiritmaslik uchun eng qulay mexanizmdir.", 960, 895, { size: 24, weight: 700, color: C.green, align: 'center' });
      text("Endi 01-bobning asosiy xulosalarini birgalikda umumlashtiramiz.", 960, 950, { size: 20, color: C.mute, align: 'center' });
      ctx.restore();
    });
  }

  // 6. XULOSA (97.655 -> 114.16s)
  function sXulosa(t) {
    const sc = TM.scenes.xulosa;
    const u = t - sc.s;
    chip(5, "Xulosa", u);

    const kBox = P(u, 0.4, 0.6);
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

      const cW = 540, cH = 490;
      cards.forEach((c, i) => {
        const cx = 100 + i * 590;
        const cy = 160;
        const kc = P(u, 0.6 + i * 0.4, 0.6);
        withA(kc, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kc)) * 16);
          card(cx, cy, cW, cH, { fill: 'rgba(15,22,48,0.92)', col: c.col });
          pill(c.num + " · " + c.title, cx + cW / 2, cy + 45, c.col, { size: 20, mono: false });

          c.items.forEach((item, j) => {
            const iy = cy + 105 + j * 85;
            card(cx + 25, iy, cW - 50, 65, { fill: 'rgba(255,255,255,0.04)', col: c.col });
            ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(cx + 55, iy + 32, 6, 0, 7); ctx.fill();
            text(item, cx + 78, iy + 33, { size: 17, weight: 600, align: 'left', color: C.text });
          });
          ctx.restore();
        });
      });

      // Pastki xulosa
      const kFoot = P(u, 2.5, 0.8);
      withA(kFoot, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kFoot)) * 16);
        card(100, 700, 1720, 310, { fill: 'rgba(18,26,58,0.95)', col: C.git });
        text("Keyingi bob: 02 — Terminal va Git'ni o'rnatish", 960, 765, { size: 34, weight: 800, color: C.git, align: 'center' });
        text("Kompyuteringizda terminalni sozlash, Git'ni o'rnatish va birinchi muhitni tayyorlaymiz.", 960, 830, { size: 22, color: C.text, align: 'center' });
        text("E'tiboringiz uchun rahmat! · dev-docs.uz", 960, 895, { size: 20, weight: 600, color: C.mute, align: 'center' });
        ctx.restore();
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
  window.renderPoster = function () {
    bg(2);
    sIntro(8.0, { isPoster: true, gy: 0, ty: 0, foot: true });
  };
})();