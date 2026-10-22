// Git 19-bob videosi: "Revision'larni tanlash"
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
  // 1-SAHNA: Revision Tushunchasi va Qisqa Hashlar
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "Revision Tushunchasi va Qisqa Hashlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git rev-parse & qisqa hash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse HEAD
      drawCommandLine("dokon $ ", "git rev-parse HEAD", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("cf44e98cf640a7821d82b65223bbad323b7de1cd", 2.4, tu, 130, 230, { color: C.yellow, weight: 600 });
      drawOutputLine("  # to'liq 40 belgili hash (yagona va o'zgarmas nom)", 2.7, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git show -s --oneline a4c7
      drawCommandLine("dokon $ ", "git show -s --oneline a4c7", 4.0, 5.8, 6.0, tu, 130, 285);
      drawOutputLine("a4c79c7 Login xatosi tuzatildi", 6.2, tu, 130, 310, { color: C.green, weight: 600 });
      drawOutputLine("  # kamida 4 ta belgi yagona bo'lsa, commit to'liq ochiladi", 6.5, tu, 130, 332, { color: C.mute });

      // 3-buyruq: 3 belgili noaniq hash
      drawCommandLine("dokon $ ", "git rev-parse a4c", 8.0, 9.4, 9.6, tu, 130, 365);
      drawOutputLine("fatal: ambiguous argument 'a4c': unknown revision", 9.8, tu, 130, 390, { color: C.red, weight: 600 });
      drawOutputLine("  ✖ 3 ta belgi kamlik qiladi: Git 4 belgidan kamini hash demaydi", 10.1, tu, 130, 412, { color: '#f87171' });

      // 4-buyruq: describe chiqishi
      drawCommandLine("dokon $ ", "git describe HEAD", 11.5, 12.8, 13.0, tu, 130, 445);
      drawOutputLine("v1.0-6-gcf44e98", 13.2, tu, 130, 470, { color: C.cyan, weight: 700 });
      drawOutputLine("  # 'v1.0 dan keyin 6 commit, hash cf44e98' ham to'g'ri revision!", 13.5, tu, 130, 492, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 14.5, 0.5);
      withA(kCallout, () => {
        card(125, 530, 790, 180, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("git rev-parse — Asosiy Yechuvchi Asbob", 300, 565, C.yellow, { size: 16, mono: false });
        text("• rev-parse — har qanday revision yozuvini to'liq hash'ga aylantiradi.", 150, 610, { size: 16, color: C.text, align: 'left' });
        text("• --short opsiyasi esa yagona qisqa hashni hisoblab beradi.", 150, 645, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Katta repolarda Git to'qnashuv bo'lmasligi uchun uzunlikni o'zi oshiradi.", 150, 680, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Revision — Extended SHA-1 Tili", "Git obyekti nomini aniqlashning usullari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Revision Nima?", 1100, 290, C.yellow, { size: 16, mono: false });
        text("• Git'ga 'qaysi obyekt haqida gapiryapmiz' deb aytishning har qanday usuli.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Ko'pincha commit, lekin tree yoki blob ham bo'lishi mumkin.", 1030, 370, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Qisqa Hash Shartlari", 1120, 470, C.cyan, { size: 16, mono: false });
        text("• Kamida 4 ta belgi bo'lishi shart.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Shu bosh bilan boshlanuvchi boshqa obyekt bo'lmasligi kerak (yagonaliq).", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Nomlar Ierarxiyasi", 1120, 655, C.green, { size: 16, mono: false });
        text("• Git nom qidirganda: avval .git/HEAD, so'ng refs/tags, keyin refs/heads.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Agar teg va branch bir xil nomlansa, teg doimo ustun keladi!", 1030, 735, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Reflog Nomlari va @ Sintaksisi
  // ==========================================
  function sceneReflogAt(u, bounds, o = {}) {
    chip(2, "Reflog Nomlari va @ Sintaksisi", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — reflog va @ sintaksisi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse @
      drawCommandLine("dokon $ ", "git rev-parse @", 0.6, 1.8, 2.0, tu, 130, 205);
      drawOutputLine("cf44e98cf640a7821d82b65223bbad323b7de1cd", 2.2, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("  # @ belgisi yolg'iz o'zi — HEAD ning qisqa sinonimi", 2.5, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git rev-parse --short main@{1}
      drawCommandLine("dokon $ ", "git rev-parse --short main@{1}", 4.0, 6.0, 6.2, tu, 130, 285);
      drawOutputLine("a234310", 6.4, tu, 130, 310, { color: C.green, weight: 700 });
      drawOutputLine("  # main'ning 1 qadam oldingi qiymati (merge commit)", 6.7, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git rev-parse --abbrev-ref @{-1}
      drawCommandLine("dokon $ ", "git rev-parse --abbrev-ref @{-1}", 8.0, 10.0, 10.2, tu, 130, 365);
      drawOutputLine("topic", 10.4, tu, 130, 390, { color: C.yellow, weight: 700 });
      drawOutputLine("  # @{-1} — oxirgi turgan oldingi branch (git switch -)", 10.7, tu, 130, 412, { color: C.mute });

      // 4-buyruq: sana bo'yicha qidiruv
      drawCommandLine("dokon $ ", "git rev-parse --short 'main@{yesterday}'", 12.0, 14.2, 14.4, tu, 130, 445);
      drawOutputLine("warning: log for 'main' only goes back to Oct 7", 14.6, tu, 130, 470, { color: C.amber });
      drawOutputLine("39d613e", 15.0, tu, 130, 492, { color: C.yellow, weight: 600 });

      // Izoh kartasi
      const kDetail = P(u, 16.0, 0.5);
      withA(kDetail, () => {
        card(125, 530, 790, 180, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Reflog — Shaxsiy Qadamlar Tarixi", 280, 565, C.cyan, { size: 16, mono: false });
        text("• Reflog faqat sizning lokal omboringizda yuritiladi (clone da bo'sh).", 150, 610, { size: 16, color: C.text, align: 'left' });
        text("• @{n} — refning n qadam avvalgi qiymatini topish imkonini beradi.", 150, 645, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Xato commit yoki reset qilinganda qutqaruvchi asosiy vosita!", 150, 680, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: @ va Reflog
      panel(980, 140, 840, 680, C.cyan, "Reflog Nomlari va @ Belgisi", "vaqt va qadamlar bo'yicha navigatsiya", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("@ va @{1} — Qisqa Ko'rsatkichlar", 1200, 290, C.cyan, { size: 16, mono: false });
        text("• @ — HEAD ning rasmiy qisqa shakli.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• @{1} — joriy branchning bitta oldingi qadami (main@{1}).", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("@{-N} — Oldingi Branchlar", 1150, 470, C.yellow, { size: 16, mono: false });
        text("• @{-1} — siz avval ishlagan oldingi branch (git checkout -).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• @{-2} — undan ham oldingi branch: checkoutlar zanjiri.", 1030, 550, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("<ref>@{<sana>} — Vaqt Bo'yicha", 1180, 655, C.green, { size: 16, mono: false });
        text("• main@{yesterday}, main@{2 weeks ago}, main@{2026-10-07 10:00}.", 1030, 700, { size: 16, fam: MONO, color: C.green, align: 'left' });
        text("• Shu aniq vaqtda main qaysi commitda bo'lganini ko'rsatadi.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Ota Zanjiri: Caret (^) va Tilde (~)
  // ==========================================
  function sceneParents(u, bounds, o = {}) {
    chip(3, "Ota Zanjiri: Caret (^) va Tilde (~)", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — ota zanjiri (^ va ~)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git cat-file -p HEAD^
      drawCommandLine("dokon $ ", "git cat-file -p HEAD^", 0.6, 2.0, 2.2, tu, 130, 205);
      drawOutputLine("tree 59f05da5a1d2b2e854c8a8836217ca8ad558d212", 2.4, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("parent 0ea1e3afd6222c507876ba7cba4ae7e6cc76f8cd (1-ota)", 2.8, tu, 130, 252, { color: C.green, weight: 600 });
      drawOutputLine("parent 9efa9694ed049d4e2839f6c0a400b475a30349bc (2-ota)", 3.2, tu, 130, 274, { color: C.cyan, weight: 600 });

      // 2-buyruq: HEAD^2 vs HEAD~2
      drawCommandLine("dokon $ ", "git log -1 --format='%h %s' 'HEAD^2'", 4.5, 6.4, 6.6, tu, 130, 310);
      drawOutputLine("9efa969 Footer qo'shildi", 6.8, tu, 130, 335, { color: C.cyan, weight: 700 });
      drawOutputLine("  # HEAD^2 — 2-ota (merge qilingan topic branch uchidagi commit)", 7.1, tu, 130, 357, { color: C.mute });

      drawCommandLine("dokon $ ", "git log -1 --format='%h %s' 'HEAD~2'", 8.2, 10.0, 10.2, tu, 130, 390);
      drawOutputLine("0ea1e3a Header yangilandi", 10.4, tu, 130, 415, { color: C.green, weight: 700 });
      drawOutputLine("  # HEAD~2 — faqat 1-otalar bo'ylab 2 qadam orqaga (chuqurlik)", 10.7, tu, 130, 437, { color: C.mute });

      // 3-buyruq: HEAD~3
      drawCommandLine("dokon $ ", "git log -1 --format='%h %s' 'HEAD~3'", 12.0, 13.6, 13.8, tu, 130, 470);
      drawOutputLine("a4c79c7 Login xatosi tuzatildi", 14.0, tu, 130, 495, { color: C.yellow, weight: 700 });
      drawOutputLine("  # HEAD~3 = HEAD^^^ = HEAD^1^1^1", 14.3, tu, 130, 517, { color: C.mute });

      // Izoh kartasi
      const kDetail = P(u, 15.5, 0.5);
      withA(kDetail, () => {
        card(125, 550, 790, 160, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("Oltin Qoida: Eni vs Chuqurligi", 280, 585, C.purple, { size: 16, mono: false });
        text("• ^N (Caret) — ENI bo'yicha: merge'dagi N-chi otaga o'tish.", 150, 630, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• ~N (Tilde) — CHUQURLIGI bo'yicha: faqat 1-otalar bo'ylab N qadam.", 150, 665, { size: 16, color: C.green, align: 'left', weight: 600 });
      });

      // O'ng panel: Sxema
      panel(980, 140, 840, 680, C.purple, "Ota Zanjiri: ^ vs ~", "birlashish va ajdodlar yo'nalishi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("^N (Caret) — N-chi Ota", 1140, 290, C.cyan, { size: 16, mono: false });
        text("• HEAD^1 — asosiy tarmoq otasi (merge qilingan branch).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• HEAD^2 — qo'shilgan ikkinchi branch otasi (topic).", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("~N (Tilde) — N Avlod Orqaga", 1170, 470, C.green, { size: 16, mono: false });
        text("• Har doim faqat birinchi ota bo'ylab to'g'ri chiziqda yuradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• HEAD~2 = HEAD^^ | HEAD~3 = HEAD^^^.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("--first-parent — Asosiy Chiziq", 1180, 655, C.yellow, { size: 16, mono: false });
        text("• git log --first-parent: merge orqali kelgan commitlarni yashiradi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Faqat asosiy release liniyasida nimalar sodir bo'lganini ko'rsatadi.", 1030, 735, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Obyekt Turi va Fayl Yo‘llari
  // ==========================================
  function scenePaths(u, bounds, o = {}) {
    chip(4, "Obyekt Turi va Fayl Yo‘llari", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — ichki yo\'llar va obyekt turi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-parse 'v1.0^{commit}'
      drawCommandLine("dokon $ ", "git rev-parse 'v1.0^{commit}'", 0.6, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("be150f0149a5b3830118719d3841e4d4d1216f7c", 2.8, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # annotated tag obyekti commit hashiga yechildi", 3.1, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git show HEAD:VERSION
      drawCommandLine("dokon $ ", "git show HEAD:VERSION", 4.5, 6.0, 6.2, tu, 130, 285);
      drawOutputLine("1.1", 6.4, tu, 130, 310, { color: C.cyan, weight: 700, size: 16 });
      drawOutputLine("  # branch almashtirmasdan HEAD dagi faylni o'qish", 6.7, tu, 130, 332, { color: C.mute });

      // 3-buyruq: git show experiment:kesh.js
      drawCommandLine("dokon $ ", "git show experiment:kesh.js", 8.0, 9.8, 10.0, tu, 130, 365);
      drawOutputLine("kesh", 10.2, tu, 130, 390, { color: C.cyan, weight: 600 });
      drawOutputLine("  # boshqa branchdagi faylni ham to'g'ridan-to'g'ri ochish mumkin!", 10.5, tu, 130, 412, { color: C.mute });

      // 4-buyruq: index dagi fayl (:0:)
      drawCommandLine("dokon $ ", "git show :login.js", 12.0, 13.4, 13.6, tu, 130, 445);
      drawOutputLine("login", 13.8, tu, 130, 470, { color: '#94a3b8' });
      drawOutputLine("login fix", 14.1, tu, 130, 492, { color: C.green, weight: 600 });
      drawOutputLine("  # :fayl — staging (index) dagi joriy versiya", 14.4, tu, 130, 514, { color: C.mute });

      // Izoh kartasi
      const kDetail = P(u, 15.5, 0.5);
      withA(kDetail, () => {
        card(125, 545, 790, 165, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Konfliktda 3 Xil Stage Versiya", 280, 580, C.green, { size: 16, mono: false });
        text("• :1:fayl — umumiy ajdod (merge-base) holati.", 150, 625, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• :2:fayl — joriy branch (HEAD / 'bizniki') holati.", 150, 655, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• :3:fayl — qo'shilayotgan branch (MERGE_HEAD / 'ularniki') holati.", 150, 685, { size: 15, fam: MONO, color: C.red, align: 'left' });
      });

      // O'ng panel: Yechish va Yo'llar
      panel(980, 140, 840, 680, C.green, "Obyekt Turi va Fayl Yo‘llari", "snapshot ichiga kirish va taglarni yechish", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("^{tur} — Kerakli Turga Yechish", 1180, 290, C.green, { size: 16, mono: false });
        text("• v1.0^{commit} — tag obyektidan commit obyektiga o'tish.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• HEAD^{tree} — commitning ildiz tree papkasini olish.", 1030, 370, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("<rev>:<yo'l> — Tarixdagi Fayl", 1170, 470, C.cyan, { size: 16, mono: false });
        text("• HEAD:README.md — faylni commit snapshotidan o'qish.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Branch yoki commit almashtirmasdan eski kodni tekshirish.", 1030, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill(":<yo'l> — Index / Staging", 1140, 655, C.yellow, { size: 16, mono: false });
        text("• Revision nomi yo'q bo'lsa, fayl to'g'ridan-to'g'ri indexdan olinadi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• git add qilingan, lekin commit qilinmagan matnni ko'rish imkoni.", 1030, 735, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Diapazonlar: Ikki Nuqta va Uch Nuqta
  // ==========================================
  function sceneRanges(u, bounds, o = {}) {
    chip(5, "Diapazonlar: Ikki Nuqta va Uch Nuqta", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      terminal(100, 140, 840, 680, {
        title: 'zsh — commit diapazonlari (.. va ...)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log main..experiment
      drawCommandLine("dokon $ ", "git log --oneline main..experiment", 0.6, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("7a3751b Tajriba: kesh testlari", 2.8, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("74ff9bb Tajriba: kesh", 3.1, tu, 130, 252, { color: C.green, weight: 600 });
      drawOutputLine("  # main..experiment = experimentda bor, lekin mainda yo'q!", 3.4, tu, 130, 274, { color: C.mute });

      // 2-buyruq: git log --left-right main...experiment
      drawCommandLine("dokon $ ", "git log --oneline --left-right main...experiment", 4.8, 7.2, 7.4, tu, 130, 310);
      drawOutputLine("< cf44e98 Versiya 1.1", 7.6, tu, 130, 335, { color: C.cyan });
      drawOutputLine("< a234310 Merge branch 'topic'", 7.9, tu, 130, 357, { color: C.cyan });
      drawOutputLine("> 7a3751b Tajriba: kesh testlari", 8.2, tu, 130, 379, { color: C.green });
      drawOutputLine("> 74ff9bb Tajriba: kesh", 8.5, tu, 130, 401, { color: C.green });

      // 3-buyruq: ahead/behind hisobi
      drawCommandLine("dokon $ ", "git rev-list --count --left-right main...experiment", 9.8, 11.8, 12.0, tu, 130, 435);
      drawOutputLine("6    2", 12.2, tu, 130, 460, { color: C.yellow, weight: 700, size: 16 });
      drawOutputLine("  # main 6 ta oldinda, experiment 2 ta oldinda (ahead 2, behind 6)", 12.5, tu, 130, 482, { color: C.mute });

      // Izoh kartasi
      const kDetail = P(u, 13.5, 0.5);
      withA(kDetail, () => {
        card(125, 515, 790, 190, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Qisqa Shakllar: main.. va ..main", 290, 550, C.blue, { size: 16, mono: false });
        text("• main.. = main..HEAD: 'Men maindan ajralganimdan beri nima qildim?'", 150, 595, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• ..main = HEAD..main: 'Men ajralganimdan beri mainda nimalar bo'ldi?'", 150, 630, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Kundalik dasturchi hayotida eng ko'p ishlatiladigan ikki buyruq!", 150, 665, { size: 15, color: '#94a3b8', align: 'left' });
      });

      // O'ng panel: Diapazonlar tushunchasi
      panel(980, 140, 840, 680, C.blue, "Diapazonlar: Ikki va Uch Nuqta", "commitlar to'plamini filtrlash", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("A..B (Ikki Nuqta = ^A B)", 1160, 290, C.cyan, { size: 16, mono: false });
        text("• B dan yetib boriladi, lekin A dan yetib borilmaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• PR (Pull Request) ga kirgan commitlar aynan shunday ko'riladi.", 1030, 370, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("A...B (Uch Nuqta — Simmetrik Farq)", 1210, 470, C.green, { size: 16, mono: false });
        text("• A yoki B dan yetib boriladi, lekin ikkalasida ham borlari chiqariladi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ya'ni umumiy ajdoddan (merge base) keyin har ikki tarmoqdagi farq.", 1030, 550, { size: 16, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("^A ^B C va --not — Ko'p Tarmoqlar", 1210, 655, C.yellow, { size: 16, mono: false });
        text("• git log topic experiment ^main: bir nechta manbani filtrlash.", 1030, 700, { size: 16, fam: MONO, color: C.yellow, align: 'left' });
        text("• Qaysi brenchlarda main ga kiritilmagan ish borligini topadi.", 1030, 735, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Amaliy Maslahatlar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Amaliy Maslahatlar", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal qidiruv
      terminal(100, 140, 840, 520, {
        title: 'zsh — qidiruv va filtrlar',
        p: kBox
      });

      const tu = u;
      drawCommandLine("dokon $ ", "git log -1 --oneline ':/Login'", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("a4c79c7 Login xatosi tuzatildi", 2.6, tu, 130, 230, { color: C.green, weight: 600 });
      drawOutputLine("  # :/<regex> — xabari mos keluvchi eng so'nggi commit", 2.9, tu, 130, 252, { color: C.mute });

      drawCommandLine("dokon $ ", "git log --oneline --first-parent -3", 4.2, 6.0, 6.2, tu, 130, 290);
      drawOutputLine("cf44e98 Versiya 1.1", 6.4, tu, 130, 315, { color: C.cyan });
      drawOutputLine("a234310 Merge branch 'topic'", 6.7, tu, 130, 337, { color: C.cyan });
      drawOutputLine("0ea1e3a Header yangilandi", 7.0, tu, 130, 359, { color: C.cyan });

      const kDetail = P(u, 8.0, 0.5);
      withA(kDetail, () => {
        card(125, 400, 790, 230, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Kundalik Eng Foydali Sintaksislar", 300, 435, C.blue, { size: 16, mono: false });
        text("• @{-1} — oldingi branchga bir zumda switch qilish.", 150, 480, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• HEAD~ — bitta oldingi commit (amend yoki reset uchun).", 150, 515, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• origin/main..HEAD — serverga hali yuborilmagan commitlar.", 150, 550, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• HEAD:fayl — branch o'zgartirmay eski kodni o'qish.", 150, 585, { size: 16, color: C.text, align: 'left' });
      });

      // O'ng panel: Asosiy Xulosa
      panel(980, 140, 840, 520, C.blue, "Revision Sintaksisi Xulosasi", "qidiruv va navigatsiyaning to'liq vositalari", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 240, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Tabiiy O'ylash — Git Sintaksisi", 1210, 275, C.yellow, { size: 16, mono: false });
        text("• Odam hashni eslab qololmaydi: 'kechagi main', 'oldingi commit'.", 1030, 320, { size: 17, color: C.text, align: 'left' });
        text("• Git revision sintaksisi odamning har bir savoliga javob beradi.", 1030, 355, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• rev-parse bularning barchasini 40 belgili aniq hash'ga aylantiradi.", 1030, 390, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 445, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("2 · Diapazonlar — To'plamlar Mantiqi", 1210, 480, C.green, { size: 16, mono: false });
        text("• A..B va A...B orqali istalgan tarmoqlar farqini o'lchash mumkin.", 1030, 525, { size: 17, color: C.text, align: 'left' });
        text("• ahead va behind hisoblari aynan shu diapazonlar ustiga qurilgan.", 1030, 560, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Xulosa: Revision sintaksisi Git DAG grafigining kalitidir!", 1030, 595, { size: 16, color: C.cyan, align: 'left', weight: 700 });
        ctx.restore();
      });

      // Pastki banner
      const kBanner = P(u, 11.5, 0.6);
      withA(kBanner, () => {
        card(100, 680, 1720, 140, { fill: 'rgba(11,16,32,0.95)', col: C.git });
        pill("Keyingi dars: 20-bob", 210, 715, C.git, { size: 16, mono: false });
        text("Branch — bu ko'rsatkich! Nega Git'da branchlar 41 bayt va branch yaratish bir zumda bo'lishini o'rganamiz!", 130, 765, { size: 20, weight: 700, color: C.text, align: 'left' });
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
      { id: 'reflog_va_at', fn: sceneReflogAt },
      { id: 'ota_zanjiri', fn: sceneParents },
      { id: 'ichki_yollar', fn: scenePaths },
      { id: 'diapazonlar', fn: sceneRanges },
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
