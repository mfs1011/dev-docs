// Git 18-bob videosi: "Packfile'lar va gc"
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

  // ==========================================
  // 1-SAHNA: Loose Obyektlar va Disk Isrofi
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Loose Obyektlar va Disk Isrofi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (count-objects)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git count-objects -v
      drawCommandLine("ombor $ ", "git count-objects -v", 0.6, 2.0, 2.3, tu, 130, 205);
      drawOutputLine("count: 27", 2.5, tu, 130, 230, { color: C.yellow, weight: 700 });
      drawOutputLine("size: 116", 2.9, tu, 130, 255, { color: C.yellow, weight: 700 });
      drawOutputLine("in-pack: 0", 3.3, tu, 130, 280, { color: '#94a3b8' });
      drawOutputLine("packs: 0", 3.7, tu, 130, 305, { color: '#94a3b8' });
      drawOutputLine("size-pack: 0", 4.1, tu, 130, 330, { color: '#94a3b8' });

      // 2-buyruq: cat .git/objects/??/* | wc -c
      drawCommandLine("ombor $ ", "cat .git/objects/??/* | wc -c", 6.0, 8.2, 8.5, tu, 130, 375);
      drawOutputLine("    2145", 8.8, tu, 130, 405, { color: C.cyan, weight: 700, size: 16 });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 10.0, 0.5);
      withA(kCallout, () => {
        card(125, 450, 790, 200, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Disk Klasteri Isrofi (Sector Overhead)", 300, 485, C.yellow, { size: 16, mono: false });
        text("• Haqiqiy ma'lumot hajmi: atigi 2145 bayt (~2.1 KiB)", 150, 530, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Diskdagi joy: 116 KiB (chunki har loose fayl kamida 4 KiB oladi!)", 150, 565, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• 27 ta mayda loose fayl diskni 50 barobar isrof qilmoqda.", 150, 600, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Loose Obyektlar va Klaster Isrofi", "nega Git barcha versiyalarni alohida saqlamaydi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Loose Obyektlar Modeli", 1120, 290, C.yellow, { size: 16, mono: false });
        text("• Har bir commit, tree va blob .git/objects ichida alohida fayl.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har versiya to'liq saqlanadi: 1000 marta o'zgargan fayl = 1000 nusxa.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("4 KiB Blok Cheklovi", 1110, 470, C.red, { size: 16, mono: false });
        text("• Fayl tizimi har bir faylga kamida bitta to'liq sektor ajratadi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• 20 baytlik fayl ham 4096 bayt disk maydonini to'liq band qiladi.", 1030, 550, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Packfile Yechimi", 1100, 655, C.cyan, { size: 16, mono: false });
        text("• Barcha loose fayllarni bitta ixcham .pack fayliga birlashtirish.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• O'xshash obyektlarni delta bilan siqib, diskni 90%+ tejash.", 1030, 735, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: git gc va Packfile Arxitekturasi
  // ==========================================
  function scenePackfile(u, bounds, o = {}) {
    chip(2, "git gc va Packfile Arxitekturasi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git gc (axlat yig\'ish)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git gc
      drawCommandLine("ombor $ ", "git gc", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("Enumerating objects: 15, done.", 2.2, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("Counting objects: 100% (15/15), done.", 2.6, tu, 130, 252, { color: '#94a3b8' });
      drawOutputLine("Delta compression using up to 10 threads", 3.0, tu, 130, 274, { color: '#64748b' });
      drawOutputLine("Compressing objects: 100% (11/11), done.", 3.4, tu, 130, 296, { color: '#94a3b8' });
      drawOutputLine("Writing objects: 100% (15/15), done.", 3.8, tu, 130, 318, { color: '#94a3b8' });
      drawOutputLine("Total 15 (delta 2), reused 0 (delta 0)", 4.2, tu, 130, 340, { color: C.green, weight: 700 });

      // 2-buyruq: git count-objects -v
      drawCommandLine("ombor $ ", "git count-objects -v", 6.0, 7.8, 8.0, tu, 130, 380);
      drawOutputLine("count: 0", 8.2, tu, 130, 405, { color: C.green, weight: 700 });
      drawOutputLine("size: 0", 8.5, tu, 130, 427, { color: C.green, weight: 700 });
      drawOutputLine("in-pack: 27", 8.8, tu, 130, 449, { color: C.cyan, weight: 700 });
      drawOutputLine("packs: 2", 9.1, tu, 130, 471, { color: C.cyan });
      drawOutputLine("size-pack: 8.38 KiB", 9.4, tu, 130, 493, { color: C.yellow, weight: 700 });

      // Natija kartasi
      const kRes = P(u, 11.0, 0.5);
      withA(kRes, () => {
        card(125, 530, 790, 180, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Ajoyib Natija: 93% Tejamkorlik!", 280, 565, C.green, { size: 16, mono: false });
        text("• 116 KiB (27 loose fayl) disk maydoni 8.38 KiB ga tushdi.", 150, 610, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Barcha loose fayllar .pack va .idx juftligiga aylandi.", 150, 645, { size: 16, color: C.text, align: 'left' });
        text("• cat-file va log buyruqlari uchun hech narsa o'zgarmadi.", 150, 680, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Packfile va Index
      panel(980, 140, 840, 680, C.blue, "Packfile va Index Arxitekturasi", ".pack va .idx juftligi qanday ishlaydi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("pack-<hash>.pack (Obyektlar)", 1140, 290, C.blue, { size: 16, mono: false });
        text("• Barcha obyektlar bitta uzluksiz oqimda delta bilan siqilgan.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Sarlavha: 'PACK', versiya 2 va jami obyektlar soni.", 1030, 370, { size: 16, color: C.blue, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("pack-<hash>.idx (Qidiruv Indeksi)", 1170, 470, C.green, { size: 16, mono: false });
        text("• 256 ta katakli fan-out jadvali qidiruvni 256 barobar tezlashtiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• 40 belgili hash -> pack ichidagi bayt ofsetiga mikrosekundda o'tadi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("pack-<hash>.rev (Teskari Indeks)", 1170, 655, C.purple, { size: 16, mono: false });
        text("• Pack faylidagi ofsetlar bo'yicha teskari hash jadvali.", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Git 2.31+ da diskda saqlanadi va push/fetch tezligini oshiradi.", 1030, 735, { size: 16, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Delta Siqish va verify-pack
  // ==========================================
  function sceneDelta(u, bounds, o = {}) {
    chip(3, "Delta Siqish va verify-pack", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git verify-pack tahlili',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git verify-pack -v
      drawCommandLine("ombor $ ", "git verify-pack -v .git/objects/pack/*.idx", 0.6, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("83ea834 blob 29010 3714 799", 3.2, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("  ↑ v2 (yangi versiya) — to'liq saqlangan (29 010 bayt)", 3.6, tu, 130, 252, { color: '#94a3b8' });

      drawOutputLine("9f32a04 blob 9 20 4852 1 83ea834...", 4.2, tu, 130, 280, { color: C.cyan, weight: 700 });
      drawOutputLine("  ↑ v1 (eski versiya) — atigi 9 baytlik delta! Asos: 83ea834", 4.6, tu, 130, 302, { color: C.yellow });

      drawOutputLine("non delta: 13 objects", 5.2, tu, 130, 330, { color: '#64748b' });
      drawOutputLine("chain length = 1: 2 objects", 5.6, tu, 130, 352, { color: C.purple, weight: 600 });

      // 2-buyruq: git cat-file --batch-check
      drawCommandLine("ombor $ ", "git cat-file --batch-check='%(deltabase)'", 7.0, 9.2, 9.5, tu, 130, 395);
      drawOutputLine("83ea834: 0000000000000000000000000000000000000000 (asos)", 9.8, tu, 130, 420, { color: C.green });
      drawOutputLine("9f32a04: 83ea834c15d18eccbc8f35d830e53745dce5e88e (delta)", 10.4, tu, 130, 442, { color: C.cyan });

      // Delta tahlili
      const kP = P(u, 11.5, 0.5);
      withA(kP, () => {
        card(125, 485, 790, 215, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("9 Baytlik Delta Ichida Nima Bor?", 280, 520, C.cyan, { size: 16, mono: false });
        text("• Python tahlili: d2 e2 01 ca e2 01 b0 4a 71", 150, 565, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• Asos hajmi: 29010 bayt | Natija hajmi: 29002 bayt", 150, 600, { size: 16, color: C.text, align: 'left' });
        text("• Buyruq: 'b0 4a 71' = Asos boshidan 29002 baytni nusxala (COPY).", 150, 635, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Git eski versiyani saqlash uchun nol qo'shimcha joy sarfladi!", 150, 670, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Delta mexanizmi
      panel(980, 140, 840, 680, C.green, "Delta Siqish va verify-pack", "nega yangi versiya asos qilib olinadi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nega Yangi Versiya To'liq?", 1140, 290, C.green, { size: 16, mono: false });
        text("• Dasturchi deyarli doim eng oxirgi HEAD kodini o'qiydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Oxirgi kod hech qanday deltasiz bir zumda ochilishi shart.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Kattaroq Obyekt Asos Bo'ladi", 1170, 470, C.yellow, { size: 16, mono: false });
        text("• Git o'xshash obyektlar orasida eng kattasini asos qilib oladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Kod vaqt o'tishi bilan o'sgani uchun bu odatda yangi versiya bo'ladi.", 1030, 550, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Delta Formatidagi Ikki Buyruq", 1170, 655, C.cyan, { size: 16, mono: false });
        text("• COPY <ofset> <hajm>: Asosdan bayt oralig'ini ko'chirib olish.", 1030, 700, { size: 16, fam: MONO, color: C.cyan, align: 'left' });
        text("• INSERT <baytlar>: Yangi qo'shilgan matnni yozish.", 1030, 735, { size: 16, fam: MONO, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Delta Zanjirlari: window va depth
  // ==========================================
  function sceneChains(u, bounds, o = {}) {
    chip(4, "Delta Zanjirlari: window va depth", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git repack sozlamalari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git repack --depth=1
      drawCommandLine("ombor $ ", "git repack -a -d -f --depth=1 -q", 0.6, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("chain length = 1: 5 objects (barcha deltalar to'g'ridan-to'g'ri v1 ga)", 3.3, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("Packfile hajmi: 5047 bayt (+30 bayt kattalashdi)", 3.8, tu, 130, 252, { color: '#94a3b8' });

      // 2-buyruq: git repack --window=0
      drawCommandLine("ombor $ ", "git repack -a -d -f --window=0 -q", 5.5, 7.8, 8.0, tu, 130, 290);
      drawOutputLine("non delta: 18 objects (barcha deltalar bekor qilindi!)", 8.3, tu, 130, 315, { color: C.red, weight: 700 });
      drawOutputLine("Packfile hajmi: 23 434 bayt (4.7 barobar kattaroq!)", 8.8, tu, 130, 337, { color: C.red, weight: 700 });

      // Zanjir grafigi kartasi
      const kP = P(u, 10.5, 0.5);
      withA(kP, () => {
        card(125, 380, 790, 320, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Delta Zanjiri Qanday Tuziladi?", 280, 415, C.purple, { size: 16, mono: false });
        text("9f32a04 (v1, to'liq asos)", 150, 460, { size: 16, fam: MONO, color: C.green, weight: 700, align: 'left' });
        text(" ├── d20937c (v2, chuqurlik 1)", 150, 490, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text(" ├── 5f01b65 (v3, chuqurlik 1)", 150, 520, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text(" └── 674c69e (v4, chuqurlik 1)", 150, 550, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("      ├── 0acbbf2 (v5, chuqurlik 2)", 150, 580, { size: 15, fam: MONO, color: C.purple, align: 'left' });
        text("      └── 4719230 (v6, chuqurlik 2)", 150, 610, { size: 15, fam: MONO, color: C.purple, align: 'left' });
        text("v6 ni o'qish uchun Git v1 asosidan boshlab v4 va v6 ni ketma-ket qo'llaydi.", 150, 655, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Parametrlar
      panel(980, 140, 840, 680, C.purple, "Delta Zanjirlari: window va depth", "saqlash hajmi va o'qish tezligi balansi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("--window=<n> (standart: 10)", 1170, 290, C.cyan, { size: 16, mono: false });
        text("• Obyektlar saralanib, o'zidan oldingi n ta qo'shni bilan taqqoslanadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Eng kichik delta bergan obyekt asos qilib tanlanadi.", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("--depth=<n> (standart: 50)", 1160, 470, C.purple, { size: 16, mono: false });
        text("• Delta zanjirining ruxsat etilgan maksimal chuqurligi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Juda chuqur zanjir diskni tejaydi, lekin o'qishda CPU ni sekinlashtiradi.", 1030, 550, { size: 16, color: C.purple, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Deltasiz Reponing Narxi", 1140, 655, C.red, { size: 16, mono: false });
        text("• --window=0 deltalarni o'chiradi: 5 KB o'rniga 23.4 KB bo'lib ketadi!", 1030, 700, { size: 17, color: C.text, align: 'left' });
        text("• Standart parametrlar tezlik va hajm o'rtasidagi oltin muvozanatdir.", 1030, 735, { size: 16, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Cruft Pack va Xavfsiz Tozalash
  // ==========================================
  function sceneCruft(u, bounds, o = {}) {
    chip(5, "Cruft Pack va Xavfsiz Tozalash", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — git prune va cruft pack',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git prune --dry-run --expire=2.weeks.ago
      drawCommandLine("ombor $ ", "git prune --dry-run --expire=2.weeks.ago", 0.6, 2.6, 2.8, tu, 130, 205);
      drawOutputLine("(hech qanday obyekt o'chirilmaydi — 2 haftadan yangi)", 3.1, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: git prune --dry-run
      drawCommandLine("ombor $ ", "git prune --dry-run", 4.5, 6.0, 6.2, tu, 130, 270);
      drawOutputLine("1351844 commit (unreachable — hech qaysi ref ko'rsatmaydi)", 6.5, tu, 130, 295, { color: C.yellow });
      drawOutputLine("2885f9c commit (unreachable)", 6.9, tu, 130, 317, { color: C.yellow });
      drawOutputLine("32eb30f tree   (unreachable)", 7.3, tu, 130, 339, { color: C.yellow });

      // 3-buyruq: git gc --prune=now
      drawCommandLine("ombor $ ", "git gc -q --prune=now", 8.8, 10.4, 10.6, tu, 130, 380);
      drawCommandLine("ombor $ ", "git cat-file -t d670460b", 11.2, 12.6, 12.8, tu, 130, 410);
      drawOutputLine("fatal: git cat-file: could not get object info", 13.1, tu, 130, 435, { color: C.red, weight: 700 });
      drawOutputLine("✖ Obyekt butunlay o'chirildi! Qayta tiklab bo'lmaydi.", 13.6, tu, 130, 457, { color: '#f87171' });

      // Ogohlantirish kartasi
      const kP = P(u, 14.5, 0.5);
      withA(kP, () => {
        card(125, 495, 790, 205, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("DIQQAT: --prune=now XAVFI!", 250, 530, C.red, { size: 16, mono: false });
        text("• Kundalik ishda hech qachon --prune=now ishlatmang!", 150, 575, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("• Parallel Git jarayonlari hali commit yoki ref bog'lab ulgurmagan bo'lishi mumkin.", 150, 610, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• 2 haftalik standart muhlat (gc.pruneExpire) omborni buzilishdan saqlaydi.", 150, 645, { size: 15, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Cruft Pack kafolati
      panel(980, 140, 840, 680, C.red, "Cruft Pack va Xavfsizlik Kafolati", "unreachable obyektlar va 2 haftalik himoya", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Cruft Pack Mexanizmi (Git 2.37+)", 1170, 290, C.cyan, { size: 16, mono: false });
        text("• Hech qaysi ref ko'rsatmayotgan obyektlar cruft pack'ga olinadi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• .mtimes fayli har bir obyektning oxirgi tegish vaqtini saqlaydi.", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 Haftalik Himoya (gc.pruneExpire)", 1170, 470, C.green, { size: 16, mono: false });
        text("• Yangi yaratilgan obyektlar ikki hafta davomida o'chirilmaydi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Reflog'lar 30-90 kun davomida reset bo'lgan commitlarni asraydi.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("Tozalash Zanjiri (Lifecycle)", 1160, 655, C.red, { size: 16, mono: false });
        text("1. Commit amend bo'ladi -> Reflog unga 30/90 kun ishora qiladi.", 1030, 700, { size: 15, color: '#cbd5e1', align: 'left' });
        text("2. Reflog muddati o'tgach -> Cruft pack -> 2 haftadan so'ng o'chiriladi.", 1030, 735, { size: 15, color: C.red, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va git maintenance
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va git maintenance", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminalda fon parvarishi
      terminal(100, 140, 840, 520, {
        title: 'zsh — git maintenance (Git 2.56)',
        p: kBox
      });

      const tu = u;
      drawCommandLine("ombor $ ", "git maintenance run --auto", 0.6, 2.2, 2.5, tu, 130, 205);
      drawOutputLine("maintenance: commit-graph updated.", 2.8, tu, 130, 230, { color: C.cyan });
      drawOutputLine("maintenance: incremental loose-objects repacked.", 3.3, tu, 130, 252, { color: C.green });
      drawOutputLine("maintenance: packed-refs maintained in background.", 3.8, tu, 130, 274, { color: '#94a3b8' });

      const kDetail = P(u, 5.0, 0.5);
      withA(kDetail, () => {
        card(125, 310, 790, 320, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("maintenance Avtomatikasi", 260, 345, C.blue, { size: 16, mono: false });
        text("• Har commit va fetch oxirida Git fonda tekshiradi:", 150, 390, { size: 16, color: C.text, align: 'left' });
        text("  - loose obyektlar soni ~6700 dan oshdimi?", 150, 425, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("  - pack fayllar soni 50 dan oshdimi?", 150, 455, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("  - commit-graph indeksini yangilash kerakmi?", 150, 485, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• Barcha ishlar dasturchini to'xtatmasdan (--detach) fonda bajariladi.", 150, 530, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Omborni qo'lda gc qilish deyarli talab etilmaydi!", 150, 565, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Loose vs Packfile
      panel(980, 140, 840, 520, C.blue, "Ikki Qavatli Arxitektura", "loose va packfile o'rtasidagi hamkorlik", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Loose Format (Tezkor Yozish Qatlami)", 1210, 275, C.yellow, { size: 16, mono: false });
        text("• git add va git commit deltasiz, darhol yangi obyekt yozadi.", 1030, 320, { size: 17, color: C.text, align: 'left' });
        text("• Delta hisoblashga vaqt ketmaydi: dasturchi ishida kechikish yo'q.", 1030, 355, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Xavfsiz: har bir loose obyekt o'zicha mustaqil va to'liq.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Packfile (Ixcham Saqlash va Tarmoq)", 1210, 480, C.green, { size: 16, mono: false });
        text("• 90%+ tejamkorlik bilan siqilgan delta va tezkor .idx indeksi.", 1030, 525, { size: 17, color: C.text, align: 'left' });
        text("• Tarmoq orqali git push va fetch faqat pack ko'rinishida uzatiladi.", 1030, 560, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Xulosa: Git modelda to'liq suratlar, diskda esa aqlli deltalarni saqlaydi!", 1030, 595, { size: 16, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 12.0, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 19-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Revision'larni tanlash: commit oraliqlari (HEAD~, HEAD^, A..B, A...B) va maxsus qidiruv sintaksislari!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
      });
    });
  }

  // ==========================================
  // ASOSIY CHIZISH SIKLI (RENDER LOOP)
  // ==========================================
  window.renderFrame = function (t) {
    ctx.clearRect(0, 0, W, H);
    bg();

    const scenes = [
      { id: 'intro', fn: sceneIntro },
      { id: 'packfile_va_idx', fn: scenePackfile },
      { id: 'delta_siqish', fn: sceneDelta },
      { id: 'delta_zanjirlari', fn: sceneChains },
      { id: 'cruft_pack_va_prune', fn: sceneCruft },
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

  // Poster uchun ko'rgazmali kadr (1-sahna taqqoslashi)
  window.renderPoster = function () {
    bg();
    sceneIntro(12.0, TM.scenes.intro, { isPoster: true });
  };
})();
