// Git 15-bob videosi: "Tree va index"
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
  // 1-SAHNA: Tree va Index Tushunchasi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("15-BOB · TREE VA INDEX", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Tree va Index Tushunchasi", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Fayllarni kataloglar shaklida bog‘lovchi daraxt va staging maydonining binar asosi", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Blob va Tree Obyektlari Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(56,189,248,0.10)', col: C.cyan });
          pill("Blob (Fayl Mazmuni)", 670, 615, C.cyan, { size: 18 });
          text("• Faqat xom baytlarni saqlaydi (kontent)", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Fayl nomi va yo'li yo'q, faqat SHA-1 hash", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(16,185,129,0.10)', col: C.green });
          pill("Tree (Papka Yozuvi)", 1250, 615, C.green, { size: 18 });
          text("• UNIX katalog yozuvlari kabi ro'yxat", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Rejim (mode) + obyekt ID + fayl nomi", 1010, 680, { size: 15, fam: MONO, color: C.green, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Tree va Index Tushunchasi", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Tree strukturasi
      panel(100, 140, 840, 680, C.blue, "Tree — Papkalar Strukturasi", "rejim, nom va obyekt ID'lar ro'yxati", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Rejim va Obyekt ID", 240, 290, C.cyan, { size: 16, mono: false });
        text("• Har qatorda rejim (100644, 040000), ID va fayl nomi turadi.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl bo'lsa blob hash'i, ichki papka bo'lsa boshqa tree hash'i.", 150, 375, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Nomlar Tree'da Saqlanadi", 255, 470, C.green, { size: 16, mono: false });
        text("• Mazmun blob ichida, fayl nomi esa faqat tree ro'yxatida yoziladi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bitta blob bir nechta papkada turli nomlar bilan uchrashi mumkin.", 150, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmas Arxiv Obyekti", 230, 655, C.mute, { size: 16, mono: false });
        text("• Tree omborga bir marta yoziladi va abadiy o'zgarmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• U commit qilingan butun loyiha katalogining to'liq suratidir.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Index qatlami
      panel(980, 140, 840, 680, C.yellow, "Index — Staging Maydoni", ".git/index binar dircache fayli", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Tekis Ro'yxat (Flat List)", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• Tree'dan farqli ravishda index'da ichma-ich papkalar yo'q.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir fayl to'liq yo'li bilan tekis saqlanadi: bak/test.txt.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Keyingi Commit Qoralamasi", 1150, 470, C.git, { size: 16, mono: false });
        text("• Staging hududi keyingi commit'ga nimalar kirishini belgilaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Working tree'dagi xom o'zgarishlar faqat add orqali index'ga o'tadi.", 1030, 555, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Daraxtga Aylanish Ko'prigi", 1145, 655, C.mute, { size: 16, mono: false });
        text("• Commit paytida Git index'dagi tekis ro'yxatni tree'larga ajratadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shu tariqa tezkor ish stoli o'zgarmas arxiv daraxtiga aylanadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Nega To‘g‘ridan-to‘g‘ri Emas, Index Orqali?
  // ==========================================
  function sceneNegaIndex(u, bounds, o = {}) {
    chip(2, "Nega To‘g‘ridan-to‘g‘ri Emas, Index Orqali?", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Insoniy ehtiyoj
      panel(100, 140, 840, 680, C.yellow, "1. Odamlar Ehtiyoji — Qismlab Yig'ish", "commit qoralamasi va aniq nazorat", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("O'zgarishlarni Bo'laklash", 230, 290, C.yellow, { size: 16, mono: false });
        text("• Papkada 10 ta fayl o'zgargan bo'lsa ham, faqat 2 tasini tanlaymiz.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• git add --patch orqali hatto fayl ichidagi bitta satrni ajratish mumkin.", 150, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Mantiqiy va Toza Tarix", 225, 470, C.cyan, { size: 16, mono: false });
        text("• Har bir commit bitta aniq vazifa yoki tuzatishni aks ettiradi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Working tree'dagi keraksiz qoralamalar ombor tarixiga kirmaydi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Merge va Ziddiyat Holati", 230, 655, C.mute, { size: 16, mono: false });
        text("• Ziddiyat paytida bitta yo'l uchun stage 1, 2, 3 versiyalari yoziladi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Tree'da bunga joy yo'q, index esa bu oraliq holatni bemalol ushlaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Texnik zarurat va kesh
      panel(980, 140, 840, 680, C.green, "2. Texnik Zarurat — Stat Kesh va Tezlik", "git status va operatsiyalar chaqmoqdek tez", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Stat Metama'lumotlar Keshi", 1145, 290, C.green, { size: 16, mono: false });
        text("• Index har bir faylning ctime, mtime, hajmi va inode raqamini saqlaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Fayl hajmi va vaqti o'zgarmagan bo'lsa, uni qayta o'qish shart emas.", 1030, 375, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("100 000 Faylda Chaqmoq Tezlik", 1160, 470, C.cyan, { size: 16, mono: false });
        text("• git status har gal yuz minglab faylning SHA-1 hashini hisoblamaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Avval stat qiymatlarini solishtiradi va faqat shubhali fayllarni ochadi.", 1030, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmas vs O'zgaruvchan", 1140, 655, C.mute, { size: 16, mono: false });
        text("• Tree — qat'iy va o'zgarmas arxitektura; index — chaqqon ish stoli.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Ushbu ikki qavatli model Git'ga aqlbovar qilmas barqarorlik beradi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: update-index va .git/index Fayli
  // ==========================================
  function sceneUpdateIndex(u, bounds, o = {}) {
    chip(3, "update-index va .git/index Fayli", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: update-index buyrug'i
      panel(100, 140, 840, 680, C.blue, "update-index Plumbing Buyrug'i", "index'ga to'g'ridan-to'g'ri yozuv kiritish", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git update-index --cacheinfo", 260, 290, C.cyan, { size: 16, mono: false });
        code("$ git update-index --add --cacheinfo 100644,83baae6...,test.txt", 150, 335, { size: 16, color: C.text });
        text("• Diskdagi faylga qaramasdan ombordagi blob'ni index'ga biriktiradi.", 150, 375, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git ls-files -s (Stage)", 220, 470, C.yellow, { size: 16, mono: false });
        code("100644 83baae61804e65cc73a7201a7252750c76066a30 0  test.txt", 150, 515, { size: 15, color: C.yellow });
        text("• <rejim> <blob_hash> <stage_raqami> <yo'l> tartibida ko'rsatadi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Bir Vaqtda Ham Staged, Ham Modified", 280, 655, C.mute, { size: 16, mono: false });
        text("• Index'da test.txt = v1, lekin diskda test.txt = v2 bo'lsa:", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• git status uni ham Changes to be committed, ham not staged ko'rsatadi.", 150, 735, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: DIRC binar formati
      panel(980, 140, 840, 680, C.purple, "DIRC Binar Format Tuzilishi", ".git/index ichidagi 104 baytlik tuzilma", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("DIRC Sarlavhasi (12 Bayt)", 1140, 290, C.purple, { size: 16, mono: false });
        code("44 49 52 43  00 00 00 02  00 00 00 01  (DIRC, v2, 1 ta yozuv)", 1030, 335, { size: 15, color: C.purple });
        text("• 4 bayt imzo ('DIRC' = dircache), 4 bayt versiya, 4 bayt yozuvlar soni.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Yozuv Qismlari (Stat + Hash + Nom)", 1180, 470, C.cyan, { size: 16, mono: false });
        text("• 40 bayt stat ma'lumotlari: ctime, mtime, dev, ino, mode 0x81a4, hajm.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• 20 bayt xom SHA-1 hash + 2 bayt flags (stage, nom uzunligi) + fayl nomi.", 1030, 555, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Yaxlitlik Nazorati (20 Bayt SHA-1)", 1175, 655, C.mute, { size: 16, mono: false });
        code("83a8b4028da30cc7105d83e0db6c7a7dc915bd52  (oxirgi checksum)", 1030, 700, { size: 15, color: C.text });
        text("• Faylning barcha baytlari SHA-1 bilan tekshiriladi, buzilish seziladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: write-tree va Papkalar Daraxti
  // ==========================================
  function sceneWriteTree(u, bounds, o = {}) {
    chip(4, "write-tree va Papkalar Daraxti", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: write-tree jarayoni
      panel(100, 140, 840, 680, C.git, "write-tree Plumbing Buyrug'i", "tekis index ro'yxatidan tree yasash", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("git write-tree Natijasi", 225, 290, C.git, { size: 16, mono: false });
        code("$ git write-tree  ->  d8329fc1cc938780ffdd9f94e0d364e0ea74f579", 150, 335, { size: 15, color: C.git });
        text("• Index'dagi yozuvlar asosida omborda yangi tree obyekti yaratadi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git cat-file -p <tree_id>", 235, 470, C.cyan, { size: 16, mono: false });
        code("100644 blob 83baae61804e65cc73a7201a7252750c76066a30  test.txt", 150, 515, { size: 15, color: C.cyan });
        text("• Tree ichida rejim, obyekt turi (blob), hash va fayl nomi saqlanadi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Cache Tree (TREE Kengaytmasi)", 255, 655, C.mute, { size: 16, mono: false });
        text("• write-tree index ichiga TREE kengaytmasi eslatmasini qo'shadi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Keyingi commit'da faqat o'zgargan qismlar qayta hisoblanadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Ierarxiya va deduplikatsiya
      panel(980, 140, 840, 680, C.cyan, "Ierarxiya va Diskni Tejash", "ichki papkalar va hash qayta ishlatilishi", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Ichki Papkalar Daraxti", 1130, 290, C.cyan, { size: 16, mono: false });
        code("040000 tree d8329fc...  bak  (ichki papka boshqa tree'ga bog'lanadi)", 1030, 335, { size: 15, color: C.cyan });
        text("• Index tekis bo'lsa ham (bak/test.txt), write-tree uni papkalarga ajratadi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Hash Orqali Qayta Ishlatilish", 1150, 470, C.green, { size: 16, mono: false });
        text("• Agar bak papkasidagi fayllar o'zgarmasa, tree hash'i ham o'zgarmaydi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Ildiz tree shunchaki o'sha eski d8329fc hashiga ishora qilib qo'yadi.", 1030, 555, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Natija: Disk Joyining Maksimal Tejalishi", 1195, 655, C.mute, { size: 16, mono: false });
        text("• Minglab fayllardan iborat loyihada faqat 1 ta fayl o'zgarganda,", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Faqat o'sha fayl blob'i va uning yuqorisidagi ota tree'largina yoziladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: read-tree va checkout-index
  // ==========================================
  function sceneReadTree(u, bounds, o = {}) {
    chip(5, "read-tree va checkout-index", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: read-tree
      panel(100, 140, 840, 680, C.green, "read-tree — Ombordan Index'ga", "tree obyektini staging maydoniga yuklash", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("git read-tree --prefix=bak", 240, 290, C.green, { size: 16, mono: false });
        code("$ git read-tree --prefix=bak d8329fc...  (tree'ni papka qilib oladi)", 150, 335, { size: 15, color: C.green });
        text("• Saqlangan tree ichidagi fayllarni index'ga bak/ yo'li bilan qo'shadi.", 150, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Butun Index'ni Almashtirish", 240, 470, C.cyan, { size: 16, mono: false });
        code("$ git read-tree <tree_id>  (butun index'ni tree holatiga keltiradi)", 150, 515, { size: 15, color: C.cyan });
        text("• --prefix bo'lmasa index'ni tozalab, berilgan tree tarkibi bilan to'ldiradi.", 150, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("git reset --mixed Mexanizmi", 240, 655, C.mute, { size: 16, mono: false });
        text("• Porcelain git reset buyrug'i aynan shu poydevor ustida ishlaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Index'ni o'tgan commit daraxtiga qaytarib, diskdagi fayllarga tegmaydi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: checkout-index
      panel(980, 140, 840, 680, C.yellow, "checkout-index — Index'dan Ishchi Joyga", "staged fayllarni diskka chiqarib berish", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("read-tree Diskka Tegmaydi!", 1140, 290, C.yellow, { size: 16, mono: false });
        text("• read-tree faqat .git/index faylini o'zgartiradi, diskka yozmaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        code("AD bak/test.txt  (index'ga qo'shildi, lekin diskda hali yo'q)", 1030, 375, { size: 15, color: C.yellow });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git checkout-index -a -f", 1130, 470, C.cyan, { size: 16, mono: false });
        code("$ git checkout-index -a -f  (-a hamma fayllar, -f ustidan yozish)", 1030, 515, { size: 15, color: C.cyan });
        text("• Index'dagi barcha fayllarni ishchi katalogga jismonan chiqaradi.", 1030, 555, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("git restore va switch Pishiq Asosi", 1170, 655, C.mute, { size: 16, mono: false });
        text("• Yuqori darajadagi zamonaviy buyruqlar aynan shu plumbing zanjiri", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• (read-tree + checkout-index) yordamida fayllarni xavfsiz tiklaydi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
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
      // Chap panel: Asosiy xulosalar
      panel(100, 140, 840, 680, C.green, "Asosiy Xulosalar", "tree va index ning o'rni", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Tree — Papkalar Surati", 230, 290, C.green, { size: 16, mono: false });
        text("• Fayllarni rejim va nomlar bilan birlashtiruvchi o'zgarmas obyekt.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Unda muallif, sana va izoh yo'q — ular keyingi bobda commit'ga kiritiladi.", 150, 375, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Index — Chaqqon Ish Maydoni", 245, 470, C.cyan, { size: 16, mono: false });
        text("• .git/index (DIRC) binar formati, stat ma'lumotlar keshi va tezlik.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• O'zgarishlarni bo'laklab yig'ish va ziddiyatlarni hal qilish markazi.", 150, 555, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("To'liq Plumbing Sikli", 220, 655, C.mute, { size: 16, mono: false });
        text("• update-index (staging) -> write-tree (arxiv) -> read-tree -> checkout.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Git'ning barcha qulay porcelain buyruqlari shu zanjirga tayanadi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Tavsiyalar
      panel(980, 140, 840, 680, C.blue, "Amaliy Tavsiyalar", "kundalik dasturlashda esda tuting", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.blue });
        pill("git ls-files -s Bilan Ko'ring", 1145, 290, C.blue, { size: 16, mono: false });
        text("• Qaysi blob qaysi stage raqamida turganini ko'rish uchun eng qulay buyruq.", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("• Ziddiyat chiqqanda stage 1, 2, 3 farqlarini aynan shu orqali tekshirasiz.", 1030, 375, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Commit Aslida Tree Yozadi", 1140, 470, C.yellow, { size: 16, mono: false });
        text("• git commit har doim avval ichki write-tree ni chaqirib, index'dan tree yasaydi.", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("• Agar staging maydoni bo'sh bo'lsa, yangi o'zgarishlar commit'ga kirmaydi.", 1030, 555, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Stat Kesh Ahamiyati", 1115, 655, C.mute, { size: 16, mono: false });
        text("• Katta loyihalarda minglab fayllar tez tekshirilishi index keshiga bog'liq.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• .git/index fayli buzilsa yoki o'chsa, git reset orqali uni qayta tiklash oson.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });

    // Pastki tavsiya banneri
    const kAdv = P(u, 7.5, 0.5);
    withA(kAdv, () => {
      ctx.save(); ctx.translate(0, (1 - eo(kAdv)) * 16);
      card(100, 840, 1720, 160, { fill: 'rgba(15,22,48,0.96)', col: C.git, lw: 2 });
      pill("Keyingi 16-bob", 220, 880, C.git, { size: 18, mono: false });
      text("Navbatdagi dars: Commit obyekti va qo'lda commit yaratish", 150, 930, { size: 22, weight: 700, color: C.text, align: 'left' });
      text("Ushbu tree obyektiga muallif, sana va ota commit ko'rsatkichini qo'shib haqiqiy commit yasashni o'rganamiz.", 150, 968, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'nega_index', fn: sceneNegaIndex },
      { id: 'update_index_va_dirc', fn: sceneUpdateIndex },
      { id: 'write_tree_ierarxiya', fn: sceneWriteTree },
      { id: 'read_tree_va_checkout', fn: sceneReadTree },
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
