// Git 16-bob videosi: "Commit obyekti"
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
  // 1-SAHNA: Commit Obyekti va Uning Mohiyati
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    // Sarlavha bosqichi (u < 10.5)
    if (u < 10.5 && !o.isPoster) {
      const kTitle = P(u, 0.4, 0.7);
      withA(kTitle, () => {
        pill("16-BOB · COMMIT OBYEKTI", 960, 260, C.git, { size: 24, mono: false, s: eback(kTitle) });
        text("Commit Obyekti va Uning Mohiyati", 960, 345, { size: 56, weight: 800, color: C.text });
        text("Loyiha holatini vaqtga joylovchi, muallif va sababni bog‘lovchi tarix kaliti", 960, 415, { size: 26, color: C.mute });

        // Markaziy taqqoslash kartasi
        const kTerm = P(u, 1.8, 0.6);
        withA(kTerm, () => {
          ctx.save(); ctx.translate(0, (1 - eo(kTerm)) * 20);
          card(360, 480, 1200, 260, { fill: 'rgba(11,16,32,0.94)', col: C.blue, lw: 2 });
          pill("Tree va Commit Obyektlari Farqi", 960, 530, C.blue, { size: 22 });

          card(400, 580, 540, 120, { fill: 'rgba(16,185,129,0.10)', col: C.green });
          pill("Tree (Katalog Holati)", 670, 615, C.green, { size: 18 });
          text("• Faqat fayllar ro'yxati va papkalar daraxti", 430, 655, { size: 16, color: C.text, align: 'left' });
          text("• Kim, qachon va nega o'zgartirganini bilmaydi", 430, 680, { size: 15, fam: MONO, color: C.mute, align: 'left' });

          card(980, 580, 540, 120, { fill: 'rgba(244,63,94,0.10)', col: C.git });
          pill("Commit (Tarix va Vaqt)", 1250, 615, C.git, { size: 18 });
          text("• Tree'ni ota commit, muallif va xabar bilan bog'laydi", 1010, 655, { size: 16, color: C.text, align: 'left' });
          text("• Loyihani vaqt o'qi bo'ylab zanjirga tizadi", 1010, 680, { size: 15, fam: MONO, color: C.git, align: 'left' });

          ctx.restore();
        });
      });
      return;
    }

    // Taqqoslash bosqichi (u >= 10.5 yoki poster)
    chip(1, "Commit Obyekti va Uning Mohiyati", u, 10.5);

    const kBox = o.isPoster ? 1 : eo(P(u, 10.8, 0.6));
    withA(kBox, () => {
      // Chap panel: Commit vazifasi
      panel(100, 140, 840, 680, C.git, "Commit — Vaqt va Tarix Kaliti", "loyiha suratini vaqt o'qiga joylash", kBox, kBox);

      const kG1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kG1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Suratni Vaqtga Joylash", 230, 290, C.git, { size: 16, mono: false });
        text("• Tree faqat katalogning ma'lum paytdagi muzlatilgan holatidir.", 150, 335, { size: 17, color: C.text, align: 'left' });
        text("• Commit shu holatni qat'iy vaqtga, muallifga va maqsadga biriktiradi.", 150, 375, { size: 17, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kG2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Nega Tree va Commit Alohida?", 255, 470, C.cyan, { size: 16, mono: false });
        text("• Tree'da sana yoki ism yo'qligi sababli bir xil papkalar birlashadi.", 150, 515, { size: 17, color: C.text, align: 'left' });
        text("• Bu Git'ga disk joyini va hisoblash quvvatini behad tejash beradi.", 150, 555, { size: 17, color: C.cyan, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kG3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kG3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("O'zgarmas Kriptografik Zanjir", 240, 655, C.mute, { size: 16, mono: false });
        text("• Commit yaratilgach, uning hech bir satri qayta o'zgarmaydi.", 150, 700, { size: 16, color: C.text, align: 'left' });
        text("• Tarix ota commitlar orqali uzluksiz bog'langan zanjirni hosil qiladi.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 ta asosiy obyekt birlashishi
      panel(980, 140, 840, 680, C.blue, "Git Yadrosining 3 Buyuk Ustuni", "blob, tree va commit birgalikda", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 11.4, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("1 · Blob (Mazmun)", 1110, 290, C.yellow, { size: 16, mono: false });
        text("• Xom fayl baytlari, nomi va huquqlari yo'q (14-bob).", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Faqat o'z mazmunining SHA-1 hashi bilan taniladi.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 13.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("2 · Tree (Katalog)", 1110, 470, C.green, { size: 16, mono: false });
        text("• Fayl nomlari, ruxsatlar (100644) va blob hashlar ro'yxati (15-bob).", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Loyihaning aniq bitta papka darajasidagi suratini beradi.", 1030, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = o.isPoster ? 1 : P(u, 15.5, 0.5);
      withA(kP3, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("3 · Commit (Snapshot + Tarix)", 1170, 655, C.git, { size: 16, mono: false });
        text("• Ildiz tree + ota commitlar + muallif + sana + commit xabari.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Versiyalar tarixini to'liq ifodalovchi yagona mustaqil obyekt.", 1030, 735, { size: 16, color: C.git, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Commit Ichida Nimalar Saqlanadi?
  // ==========================================
  function sceneCommitTuzilishi(u, bounds, o = {}) {
    chip(2, "Commit Ichida Nimalar Saqlanadi?", u, 0.4);

    const kBox = eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: 5 ta asosiy maydon
      panel(100, 140, 840, 680, C.purple, "Commitning 5 Ta Asosiy Maydoni", "rasmiy gitdatamodel spesifikatsiyasi", kBox, kBox);

      const kG1 = P(u, 1.2, 0.5);
      withA(kG1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG1)) * 16);
        card(125, 255, 790, 160, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("1. tree va 2. parent", 210, 290, C.purple, { size: 16, mono: false });
        code("tree 0155eb4229851634a0f03eb265b69f5a2d56f341", 150, 335, { size: 15, color: C.yellow });
        code("parent 35492cfd394c29c3ae03d9b527d8d8d9b1342749", 150, 370, { size: 15, color: C.cyan });
        text("• tree: ildiz katalog surati; parent: oldingi commit hashi.", 150, 400, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG2 = P(u, 3.5, 0.5);
      withA(kG2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG2)) * 16);
        card(125, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("3. author va 4. committer", 230, 470, C.cyan, { size: 16, mono: false });
        code("author Ali Valiyev <ali@example.com> 1791349500 +0500", 150, 515, { size: 15, color: C.green });
        code("committer Ali Valiyev <ali@example.com> 1791349500 +0500", 150, 545, { size: 15, color: C.green });
        text("• author: kodni yozgan odam; committer: commit qilgan odam.", 150, 575, { size: 15, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kG3 = P(u, 5.5, 0.5);
      withA(kG3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kG3)) * 16);
        card(125, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("5. Tushuntirish Xabari (Message)", 250, 655, C.mute, { size: 16, mono: false });
        code("Second commit  (bo'sh qatordan keyingi toza matn)", 150, 700, { size: 15, color: C.yellow });
        text("• Commitning nima maqsadda qilinganini tushuntiruvchi xabar.", 150, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: Diff saqlanmaslik qoidasi
      panel(980, 140, 840, 680, C.yellow, "Git Diff Saqlamaydi!", "snapshot modeli va dinamik taqqoslash", kBox, kBox);

      const kP1 = P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("To'liq Surat (Snapshot)", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• Git commit ichida faqat o'zgargan qatorlarni (diff) saqlamaydi.", 1030, 335, { size: 17, color: C.text, align: 'left' });
        text("• Har bir commit butun loyihaning to'liq tree suratiga ishora qiladi.", 1030, 375, { size: 17, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = P(u, 3.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Diff Qanday Hisoblanadi?", 1140, 470, C.green, { size: 16, mono: false });
        text("• git show yoki git log -p diff'ni joyida hisoblab beradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Buning uchun joriy tree ota commitning tree'si bilan solishtiriladi.", 1030, 555, { size: 17, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP3 = P(u, 5.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Natija: Istalgan Holatni Bir Zumda Tiklash", 1200, 655, C.mute, { size: 16, mono: false });
        text("• 1000 ta commit oldingi holatga qaytish uchun tarixni qayta o'qish shart emas.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• O'sha commit ko'rsatgan tree obyekti diskka bir zumda yoziladi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: git commit-tree Bilan Commit Yaratish (REAL TERMINAL)
  // ==========================================
  function sceneCommitTreeAmalda(u, bounds, o = {}) {
    chip(3, "git commit-tree Bilan Commit Yaratish", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda commit-tree va cat-file
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: echo 'First commit' | git commit-tree d8329f (u: 0.6 to 2.4, Enter 2.6)
      drawCommandLine("ombor $ ", "echo 'First commit' | git commit-tree d8329f", 0.6, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("35492cfd394c29c3ae03d9b527d8d8d9b1342749", 2.8, tu, 130, 230, { color: C.yellow, weight: 600 });

      // 2-buyruq: git cat-file -p 35492cf (u: 4.0 to 5.2, Enter 5.4)
      drawCommandLine("ombor $ ", "git cat-file -p 35492cf", 4.0, 5.2, 5.4, tu, 130, 260);
      drawOutputLine("tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579", 5.6, tu, 130, 285, { color: C.cyan });
      drawOutputLine("author Ali Valiyev <ali@example.com> 1791349200 +0500", 5.9, tu, 130, 307, { color: C.green });
      drawOutputLine("committer Ali Valiyev <ali@example.com> 1791349200 +0500", 6.2, tu, 130, 329, { color: C.green });
      drawOutputLine("First commit", 6.5, tu, 130, 355, { color: C.text, weight: 600 });

      // 3-buyruq: ikkinchi commit -p bilan (u: 8.0 to 10.4, Enter 10.6)
      drawCommandLine("ombor $ ", "echo 'Second commit' | git commit-tree 0155eb -p 35492cf", 8.0, 10.4, 10.6, tu, 130, 390);
      drawOutputLine("f1ad0c9778f71df4dd5c987597ed24518e65a927", 10.8, tu, 130, 415, { color: C.yellow, weight: 600 });

      // 4-buyruq: git cat-file -p f1ad0c9 (u: 12.0 to 13.2, Enter 13.4)
      drawCommandLine("ombor $ ", "git cat-file -p f1ad0c9 | head -n 3", 12.0, 13.2, 13.4, tu, 130, 445);
      drawOutputLine("tree 0155eb4229851634a0f03eb265b69f5a2d56f341", 13.6, tu, 130, 470, { color: C.cyan });
      drawOutputLine("parent 35492cfd394c29c3ae03d9b527d8d8d9b1342749", 13.9, tu, 130, 492, { color: C.yellow, weight: 700 });
      drawOutputLine("author Ali Valiyev <ali@example.com> 1791349500 +0500", 14.2, tu, 130, 514, { color: C.green });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 15.0, tu, 130, 545, { color: '#334155' });
      drawOutputLine("Birinchi commit otasiz (ildiz), ikkinchisi esa", 15.4, tu, 130, 575, { color: C.yellow, weight: 600 });
      drawOutputLine("-p orqali oldingi commit hashiga mustahkam ulandi!", 15.8, tu, 130, 600, { color: C.green, weight: 700 });

      // O'ng panel: commit-tree plumbing buyrug'i
      panel(980, 140, 840, 680, C.git, "git commit-tree Plumbing Buyrug'i", "to'g'ridan-to'g'ri commit obyekti yasash", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("Porcelain commit Nima Qiladi?", 1160, 290, C.git, { size: 16, mono: false });
        text("• Oddiy 'git commit' aslida kapot ostida 3 ta plumbing chaqiradi:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        code("1. write-tree  ->  2. commit-tree  ->  3. update-ref", 1030, 370, { size: 16, color: C.yellow });
        text("• Biz esa bularni xom plumbing darajasida o'z qo'limiz bilan qildik!", 1030, 400, { size: 15, color: C.git, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("-p Parametri (Parent — Ota)", 1140, 470, C.cyan, { size: 16, mono: false });
        text("• -p orqali yangi commit qaysi kommitdan keyin kelganini bildiradi.", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• Ildiz commitda -p bo'lmaydi; oddiy commitda 1 ta, mergeda 2 ta.", 1030, 550, { size: 17, color: C.cyan, align: 'left' });
        text("• Bitta commit bir nechta otaga ega bo'lishi ham mumkin.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Avtomatik Mualliflik", 1120, 655, C.mute, { size: 16, mono: false });
        text("• git commit-tree tizimdan ism, email, joriy vaqt va zonani o'qiydi.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Shu sababli bir xil tree'dan turli vaqtlarda har xil commit chiqadi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Ota Zanjiri va Kriptografik Butunlik (REAL TERMINAL)
  // ==========================================
  function sceneOtaZanjiri(u, bounds, o = {}) {
    chip(4, "Ota Zanjiri va Kriptografik Butunlik", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda git log va rev-list
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git rev-list --parents (u: 0.6 to 2.2, Enter 2.4)
      drawCommandLine("ombor $ ", "git rev-list --parents f1ad0c9", 0.6, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("f1ad0c9... 35492cf...  # f1ad0c9 ning otasi 35492cf", 2.6, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("35492cf...             # ildiz commit (otasi yo'q)", 2.9, tu, 130, 252, { color: C.mute });

      // 2-buyruq: git log --stat f1ad0c9 (u: 4.2 to 5.8, Enter 6.0)
      drawCommandLine("ombor $ ", "git log --stat f1ad0c9", 4.2, 5.8, 6.0, tu, 130, 290);
      drawOutputLine("commit f1ad0c9... (Second commit)", 6.2, tu, 130, 315, { color: C.yellow, weight: 600 });
      drawOutputLine(" new.txt  | 1 +", 6.5, tu, 130, 337, { color: C.green });
      drawOutputLine(" test.txt | 2 +-", 6.8, tu, 130, 359, { color: C.red });
      drawOutputLine(" 2 files changed, 2 insertions(+), 1 deletion(-)", 7.1, tu, 130, 381, { color: C.text });
      drawOutputLine("commit 35492cf... (First commit)", 7.5, tu, 130, 407, { color: C.yellow });

      // 3-buyruq: git rev-parse 'f1ad0c9^' (u: 9.0 to 10.4, Enter 10.6)
      drawCommandLine("ombor $ ", "git rev-parse 'f1ad0c9^'", 9.0, 10.4, 10.6, tu, 130, 440);
      drawOutputLine("35492cfd394c29c3ae03d9b527d8d8d9b1342749  # ota commit!", 10.8, tu, 130, 465, { color: C.green, weight: 700 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 11.8, tu, 130, 500, { color: '#334155' });
      drawOutputLine("Git tarixi faqat yangidan eskiga qarab yuradi.", 12.3, tu, 130, 530, { color: C.yellow, weight: 600 });
      drawOutputLine("Har bir commit o'zidan oldingi butun tarixni kafolatlaydi!", 12.8, tu, 130, 555, { color: C.green, weight: 700 });

      // O'ng panel: Zanjirli kafolat va DAG
      panel(980, 140, 840, 680, C.cyan, "Zanjirli Kriptografik Kafolat", "yo'naltirilgan asiklik graf (DAG)", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Orqaga Yo'naltirilgan Graf", 1150, 290, C.cyan, { size: 16, mono: false });
        code("Commit C  ──parent──>  Commit B  ──parent──>  Commit A", 1030, 335, { size: 15, color: C.yellow });
        text("• Commit otasini biladi, lekin kelajakdagi bolalarini bilmaydi.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 6.0, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Zanjirli Kafolat Kuchi", 1130, 470, C.green, { size: 16, mono: false });
        text("• O'tmishdagi bitta faylning bitta bayti o'zgarsa:", 1030, 515, { size: 17, color: C.text, align: 'left' });
        text("• O'sha blob -> uning tree'si -> o'sha commit -> barcha keyingi commitlar hashi o'zgaradi!", 1030, 550, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Tarixni jimgina soxtalashtirib bo'lmaydi.", 1030, 580, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 11.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Raqamli Imzo Imkoniyati", 1140, 655, C.mute, { size: 16, mono: false });
        text("• Bitta eng oxirgi commit'ga GPG yoki SSH imzo qo'ysangiz,", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Uning ortidagi butun loyiha tarixi bir vaqtda imzolanadi.", 1030, 735, { size: 16, color: C.mute, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Commit Obyektining Xom Baytlari (REAL TERMINAL)
  // ==========================================
  function sceneXomBaytlar(u, bounds, o = {}) {
    chip(5, "Commit Obyektining Xom Baytlari", u, 0.4);

    const kBox = eo(P(u, 0.2, 0.5));
    withA(kBox, () => {
      // Chap panel: Real Terminalda zlib ochish va update-ref
      terminal(100, 140, 840, 680, {
        title: 'zsh — ~/ombor (80x24)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: python orqali zlib decompress (u: 0.6 to 2.8, Enter 3.0)
      drawCommandLine("ombor $ ", "python3 -c \"import zlib; print(zlib.decompress(open('.git/objects/f1/ad0c9...','rb').read()))\"", 0.6, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("b'commit 220\\x00tree 0155eb42...\\nparent 35492cfd...\\n...'", 3.2, tu, 130, 230, { color: C.green, weight: 600 });

      // 2-buyruq: git update-ref bilan branch yaratish (u: 4.8 to 7.0, Enter 7.2)
      drawCommandLine("ombor $ ", "git update-ref refs/heads/main f1ad0c9", 4.8, 7.0, 7.2, tu, 130, 265);

      // 3-buyruq: git log --oneline (u: 8.4 to 9.6, Enter 9.8)
      drawCommandLine("ombor $ ", "git log --oneline", 8.4, 9.6, 9.8, tu, 130, 295);
      drawOutputLine("f1ad0c9 (HEAD -> main) Second commit", 10.0, tu, 130, 320, { color: C.yellow, weight: 700 });
      drawOutputLine("35492cf First commit", 10.3, tu, 130, 342, { color: C.text });

      // 4-buyruq: git status toza (u: 11.5 to 12.6, Enter 12.8)
      drawCommandLine("ombor $ ", "git status", 11.5, 12.6, 12.8, tu, 130, 375);
      drawOutputLine("On branch main", 13.0, tu, 130, 400, { color: C.green });
      drawOutputLine("nothing to commit, working tree clean", 13.3, tu, 130, 422, { color: C.cyan, weight: 600 });

      // Terminal xulosa izohi
      drawOutputLine("--------------------------------------------------", 14.0, tu, 130, 455, { color: '#334155' });
      drawOutputLine("Commit ham oddiy zlib fayl: 'commit <hajm>\\0<mazmun>'", 14.4, tu, 130, 485, { color: C.yellow, weight: 600 });
      drawOutputLine("Branch esa faqat bitta 40 belgili hashni saqlovchi matn fayl!", 14.8, tu, 130, 510, { color: C.green, weight: 700 });

      // O'ng panel: Branch va ref mexanizmi
      panel(980, 140, 840, 680, C.green, "Branch Ko'rsatkichi Mexanizmi", "commitlar va refs/heads/main aloqasi", kBox, kBox);

      const kP1 = P(u, 1.0, 0.5);
      withA(kP1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 160, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("Commitning Xom Matn Shakli", 1150, 290, C.green, { size: 16, mono: false });
        code("'commit 220\\0' + tree + parent + author + committer + msg", 1030, 335, { size: 14, color: C.yellow });
        text("• Tree'dan farqli ravishda commit butunlay o'qiladigan toza matndir.", 1030, 375, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kP2 = P(u, 5.5, 0.5);
      withA(kP2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 435, 790, 160, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Branch Nima O'zi?", 1100, 470, C.cyan, { size: 16, mono: false });
        text("• Branch bu og'ir narsa emas! U shunchaki .git/refs/heads/main", 1030, 515, { size: 16, color: C.text, align: 'left' });
        text("  ichidagi bitta 40 belgili commit hashiga ega oddiy fayl.", 1030, 545, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Yangi commit qilganda Git shunchaki shu fayldagi hashni yangilaydi.", 1030, 575, { size: 15, color: C.mute, align: 'left' });
        ctx.restore();
      });

      const kP3 = P(u, 10.5, 0.5);
      withA(kP3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kP3)) * 16);
        card(1005, 620, 790, 165, { fill: 'rgba(15,22,48,0.92)', col: C.mute });
        pill("Yengil va Tezkor Branching", 1145, 655, C.mute, { size: 16, mono: false });
        text("• 41 baytlik fayl: yangi branch yaratish va commit qo'shish bir zumda.", 1030, 700, { size: 16, color: C.text, align: 'left' });
        text("• Git'ning misli ko'rilmagan tezligi aynan shu yengillikdan kelib chiqadi.", 1030, 735, { size: 16, color: C.green, align: 'left' });
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
      // Chap panel: Commit xulosasi
      panel(100, 140, 840, 520, C.git, "Commit Bo‘yicha Asosiy Xulosa", "tarix va vaqtning mustahkam kaliti", kBox, kBox);

      const kX1 = P(u, 1.2, 0.45);
      withA(kX1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX1)) * 14);
        card(125, 245, 790, 115, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("1 · Commit — Surat va Vaqt", 230, 275, C.git, { size: 15, mono: false });
        text("Tree loyiha suratini saqlasa, commit uni vaqt o'qi bo'ylab zanjirga tizadi.", 150, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kX2 = P(u, 3.2, 0.45);
      withA(kX2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX2)) * 14);
        card(125, 375, 790, 115, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("2 · Zanjirli Kriptografik Kafolat", 255, 405, C.cyan, { size: 15, mono: false });
        text("Ota commit hashlari orqali butun tarix bitta qat'iy va o'zgarmas grafga aylanadi.", 150, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kX3 = P(u, 5.2, 0.45);
      withA(kX3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kX3)) * 14);
        card(125, 505, 790, 125, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("3 · git commit-tree Quroli", 230, 535, C.yellow, { size: 15, mono: false });
        text("Xom tree hashi va xabardan to'g'ridan-to'g'ri commit obyektini yasash imkoni.", 150, 575, { size: 16, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      // O'ng panel: 3 ustun uyg'unligi
      panel(980, 140, 840, 520, C.blue, "Uch Ustun Uyg'unligi", "blob, tree va commit birgalikda", kBox, kBox);

      const kY1 = P(u, 7.5, 0.45);
      withA(kY1, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY1)) * 14);
        card(1005, 245, 790, 115, { fill: 'rgba(16,185,129,0.08)', col: C.green });
        pill("1 · Blob + Tree + Commit", 1125, 275, C.green, { size: 15, mono: false });
        text("Mazmun blob'da, fayl nomlari tree'da, butun tarix esa commit zanjirida.", 1030, 315, { size: 16, color: C.text, align: 'left' });
        ctx.restore();
      });

      const kY2 = P(u, 9.5, 0.45);
      withA(kY2, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY2)) * 14);
        card(1005, 375, 790, 115, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("2 · Shaffof Ichki Mexanizm", 1140, 405, C.purple, { size: 15, mono: false });
        text("Endi git add va commit kapot ostida aynan nima qilishini 100% bilasiz.", 1030, 445, { size: 16, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kY3 = P(u, 11.5, 0.45);
      withA(kY3, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kY3)) * 14);
        card(1005, 505, 790, 125, { fill: 'rgba(244,63,94,0.08)', col: C.git });
        pill("3 · Keyingi Qadam: Reflar va HEAD", 1175, 535, C.git, { size: 15, mono: false });
        text("Commitlarga oson ishora qiluvchi branchlar, HEAD va teg obyektlarini o'rganamiz.", 1030, 575, { size: 16, color: C.git, align: 'left' });
        ctx.restore();
      });

      // Pastki ko'prik banner: Keyingi bob
      const kBanner = P(u, 9.0, 0.5);
      withA(kBanner, () => {
        ctx.save(); ctx.translate(0, (1 - eo(kBanner)) * 16);
        card(100, 690, 1720, 240, { fill: 'rgba(249,115,22,0.06)', col: C.git, lw: 2 });
        pill("Keyingi Bob: Ref'lar, HEAD va Teg Obyekti", 270, 725, C.git, { size: 16, mono: false });
        text("Keyingi 17-bobda: Commitlar ustidagi ko'rsatkichlar — Ref'lar, HEAD va Annotated Teg Obyektlari!", 130, 785, { size: 24, color: C.git, weight: 700, align: 'left' });
        text("Nega Git qirq belgili commit hashlarini eslab qolishni talab qilmaydi? .git/refs papkasi qanday ishlaydi?", 130, 830, { size: 18, color: C.text, align: 'left' });
        text("Branch va teglarning haqiqiy kuchi hamda HEAD ko'rsatkichining sirlarini ochib beramiz.", 130, 870, { size: 17, color: C.mute, align: 'left' });
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
      { id: 'commit_tuzilishi', fn: sceneCommitTuzilishi },
      { id: 'commit_tree_amalda', fn: sceneCommitTreeAmalda },
      { id: 'ota_zanjiri', fn: sceneOtaZanjiri },
      { id: 'xom_baytlar', fn: sceneXomBaytlar },
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
