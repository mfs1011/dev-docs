// anim.js — 46-bob: .gitattributes
// Realistik split-screen: terminal va kontseptual infografika
(function () {
  const canvas = document.getElementById('c') || document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const kit = window.GITKIT(ctx);

  const {
    C,
    MONO,
    UI,
    bg,
    terminal,
    card,
    panel,
    pill,
    chip,
    text,
    tw,
    withA,
    P,
    eo,
    clamp
  } = kit;

  const TM = window.TM;

  function drawCommandLine(promptStr, fullCmd, tStart, tTypeEnd, tEnter, u, x, y, opt = {}) {
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
  // 1-SAHNA: Git Atributlari Nima: Yo'l Bo'yicha Qoidalar
  // ==========================================
  function sceneAttrIntro(u, bounds, o = {}) {
    chip(1, "Git Atributlari Nima: Yo'l Bo'yicha Qoidalar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .gitattributes
      drawCommandLine("dev $ ", "cat .gitattributes", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("*.sh       text eol=lf", 2.7, tu, 130, 228, { color: C.green });
      drawOutputLine("*.png      binary", 2.9, tu, 130, 248, { color: C.yellow });
      drawOutputLine("*.c        diff=cpp whitespace=tab-in-indent", 3.1, tu, 130, 268, { color: C.cyan });

      // 2-buyruq: git add .gitattributes
      drawCommandLine("dev $ ", "git add .gitattributes && git commit -m 'Atributlar'", 4.2, 7.0, 7.2, tu, 130, 310);
      drawOutputLine("[main a82f1b0] Atributlar", 7.5, tu, 130, 335, { color: C.green });
      drawOutputLine("# .gitattributes repozitoriyga commit qilinadi!", 7.8, tu, 130, 355, { color: C.cyan, weight: 700 });
      drawOutputLine("# Barcha jamoadoshlar uchun bir xil qoidalar ta'minlanadi.", 8.1, tu, 130, 375, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "YO'LGA BIRIKTIRILGAN",
        badgeCol: C.blue,
        title: "Fayl Darajasidagi Qoidalar",
        desc: "Config butun repoga ta'sir qilsa, .gitattributes har bir fayl va papka uchun maxsus xatti-harakatni belgilaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "COMMIT QILINADI",
        badgeCol: C.green,
        title: "Jamoaviy Standart",
        desc: "Fayl repozitoriy ichida versiyalanadi. Klonlagan har bir dasturchida fayllar aynan bir xil qoidalar bilan ishlaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "XAVFSIZLIK AJRATMASI",
        badgeCol: C.purple,
        title: "Faqat Drayver Nomi",
        desc: "Atribut faqat driver nomini ko'rsatadi (diff=zip). Qaysi buyruq ishlashi esa shaxsiy xavfsiz configda saqlanadi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Atributlarni Tekshirish: git check-attr va sintaksis
  // ==========================================
  function sceneCheckAttr(u, bounds, o = {}) {
    chip(2, "Atributlarni Tekshirish: git check-attr va sintaksis", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git check-attr -a -- src/main.c doc/rasm.png
      drawCommandLine("dev $ ", "git check-attr -a -- src/main.c doc/rasm.png", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("src/main.c: diff: cpp", 3.7, tu, 130, 228, { color: C.cyan });
      drawOutputLine("src/main.c: whitespace: tab-in-indent", 3.9, tu, 130, 248, { color: C.yellow });
      drawOutputLine("doc/rasm.png: binary: set", 4.2, tu, 130, 268, { color: C.green, weight: 700 });
      drawOutputLine("doc/rasm.png: diff: unset", 4.4, tu, 130, 288, { color: C.red });
      drawOutputLine("doc/rasm.png: merge: unset", 4.6, tu, 130, 308, { color: C.red });
      drawOutputLine("doc/rasm.png: text: unset", 4.8, tu, 130, 328, { color: C.red });

      // 2-buyruq: git check-attr text -- README
      drawCommandLine("dev $ ", "git check-attr text -- README", 6.0, 7.8, 8.0, tu, 130, 370);
      drawOutputLine("README: text: unspecified (aytilmagan)", 8.3, tu, 130, 395, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "git check-attr -a",
        badgeCol: C.cyan,
        title: "Diagnostika Asbobi",
        desc: "Faylga qaysi atributlar biriktirilganini to'liq ko'rsatib, noaniq qoidalar chalkashligini fosh etadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "4 XIL HOLAT",
        badgeCol: C.purple,
        title: "Atribut Holatlari",
        desc: "set (yoqilgan), unset (o'chirilgan, masalan -diff), aniq qiymat (diff=cpp) yoki unspecified (aytilmagan).",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "PATTERN MOSLIGI",
        badgeCol: C.blue,
        title: "Wildcard Qoidalari",
        desc: ".gitignore kabi *, ?, [a-z] va ** patternlarini qo'llab-quvvatlaydi. Lekin inkor (!) belgisi taqiqlangan.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Qator Oxirlari va Binar Fayllar: eol va binary
  // ==========================================
  function sceneEolBinary(u, bounds, o = {}) {
    chip(3, "Qator Oxirlari va Binar Fayllar: eol va binary", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: echo * text=auto eol=lf
      drawCommandLine("dev $ ", "echo '* text=auto eol=lf' >> .gitattributes", 0.8, 3.0, 3.2, tu, 130, 205);
      drawCommandLine("dev $ ", "echo '*.png binary' >> .gitattributes", 3.8, 5.8, 6.0, tu, 130, 245);

      // 2-buyruq: git add --renormalize .
      drawCommandLine("dev $ ", "git add --renormalize .", 7.0, 9.0, 9.2, tu, 130, 285);
      drawOutputLine("# Barcha fayllar omborda toza LF bilan qayta normallashtirildi!", 9.5, tu, 130, 310, { color: C.green, weight: 700 });
      drawOutputLine("# Windows va Linux o'rtasida ziddiyatlar butunlay yo'qoldi.", 9.8, tu, 130, 330, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "text=auto eol=lf",
        badgeCol: C.green,
        title: "Qator Oxirlari Intizomi",
        desc: "Git matnli fayllarni avtomatik taniydi va omborga doim toza LF qilib yozadi. Windows CRLF muammolarini yechadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "binary MAKROSI",
        badgeCol: C.yellow,
        title: "Binar Xavfsizlik",
        desc: "binary — bu -diff -merge -text qisqartmasi. Rasmlar va arxivlarni tasodifiy matn konvertatsiyasidan himoyalaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "--renormalize",
        badgeCol: C.blue,
        title: "Qayta Normallashtirish",
        desc: "Atributlar yangilangach, git add --renormalize . buyrug'i mavjud fayllarni yangi qoidalar asosida to'g'rilaydi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Maxsus Diff Driverlar: diff va textconv
  // ==========================================
  function sceneDiffTextconv(u, bounds, o = {}) {
    chip(4, "Maxsus Diff Driverlar: diff va textconv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: config textconv
      drawCommandLine("dev $ ", "git config diff.zip.textconv 'zipinfo -1'", 0.8, 3.0, 3.2, tu, 130, 205);

      // 2-buyruq: git diff paket.zip
      drawCommandLine("dev $ ", "git diff arxiv.zip", 4.2, 5.8, 6.0, tu, 130, 245);
      drawOutputLine("diff --git a/arxiv.zip b/arxiv.zip", 6.3, tu, 130, 270, { color: '#94a3b8' });
      drawOutputLine("--- a/arxiv.zip (zipinfo)", 6.5, tu, 130, 290, { color: C.red });
      drawOutputLine("+++ b/arxiv.zip (zipinfo)", 6.7, tu, 130, 310, { color: C.green });
      drawOutputLine("@@ -1,3 +1,4 @@", 6.9, tu, 130, 330, { color: C.cyan });
      drawOutputLine(" asosiy.py", 7.1, tu, 130, 350, { color: '#e2e8f0' });
      drawOutputLine("+yangi_modul.sh", 7.3, tu, 130, 370, { color: C.green, weight: 700 });
      drawOutputLine("# Binar arxiv ichidagi o'zgarishlar matn kabi ko'rindi!", 7.6, tu, 130, 400, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "diff=<nom>",
        badgeCol: C.cyan,
        title: "Binar Diff Vositalari",
        desc: ".gitattributes da faylga maxsus drayver beriladi (*.zip diff=zip, *.pdf diff=pdf).",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "textconv DRAYVERI",
        badgeCol: C.green,
        title: "Matnga Aylantirish",
        desc: "zipinfo, pdftotext kabi vositalar orqali binar ma'lumot diff uchun o'qilishi oson matn shaklida uzatiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "XAVFSIZ VA QULAY",
        badgeCol: C.purple,
        title: "Baza O'zgarmaydi",
        desc: "Obyektlar bazasida binar arxiv saqlanib qoladi, textconv faqat konsolda taqqoslash paytida vaqtincha ishlaydi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Filtrlar: clean va smudge mexanizmi
  // ==========================================
  function sceneFilterCleanSmudge(u, bounds, o = {}) {
    chip(5, "Filtrlar: clean va smudge mexanizmi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .gitattributes
      drawCommandLine("dev $ ", "cat .gitattributes", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("*.py   filter=indent_clean", 2.7, tu, 130, 228, { color: C.cyan });

      // 2-buyruq: git config filter
      drawCommandLine("dev $ ", "git config filter.indent_clean.clean 'indent -kr'", 3.8, 6.2, 6.4, tu, 130, 265);
      drawCommandLine("dev $ ", "git config filter.indent_clean.smudge 'cat'", 7.0, 9.0, 9.2, tu, 130, 305);

      drawOutputLine("# Check-in: clean filtri orqali kod formatlab yoziladi.", 9.5, tu, 130, 340, { color: C.green, weight: 700 });
      drawOutputLine("# Checkout: smudge filtri orqali ishchi daraxtga chiqariladi.", 9.8, tu, 130, 360, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "CLEAN (CHECK-IN)",
        badgeCol: C.green,
        title: "Omborga Kirish Filtrlari",
        desc: "git add paytida faylni tozalash, ortiqcha bo'shliqlar yoki maxfiy kalitlarni olib tashlash imkonini beradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "SMUDGE (CHECKOUT)",
        badgeCol: C.orange,
        title: "Ishchi Daraxtga Chiqarish",
        desc: "git checkout yoki switch paytida faylga dinamik versiya raqami yoki lokal formatni qo'shib beradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "AVTOMATIK INTIZOM",
        badgeCol: C.blue,
        title: "Doimiy Standart",
        desc: "Dasturchilar qanday formatda yozishidan qat'i nazar, omborda kod doim ideal standartlashtirilgan bo'ladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Export Qoidalari
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Export Qoidalari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: echo export-ignore
      drawCommandLine("dev $ ", "echo 'tests/ export-ignore' >> .gitattributes", 0.8, 3.0, 3.2, tu, 130, 205);
      drawCommandLine("dev $ ", "git archive --format=zip HEAD -o reliz-v1.zip", 4.0, 6.8, 7.0, tu, 130, 245);
      drawOutputLine("reliz-v1.zip muvaffaqiyatli yaratildi!", 7.3, tu, 130, 270, { color: C.green, weight: 700 });
      drawOutputLine("# tests/ va .gitattributes arxiv paketiga kiritilmadi.", 7.6, tu, 130, 290, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "export-ignore",
        badgeCol: C.red,
        title: "Relizlarni Yengillatish",
        desc: "git archive komandasi reliz paketi tuzayotganda sinovlar, CI sozlamalari va ichki fayllarni chiqarib tashlaydi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "linguist-generated",
        badgeCol: C.blue,
        title: "GitHub Statistika",
        desc: "Auto-generatsiya qilingan fayllarni repo statistikasi va pull request ko'rinishidan yashirish imkoniyati.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "YAXLIT MUHIT",
        badgeCol: C.green,
        title: "Barcha OS larda Bir Xillik",
        desc: ".gitattributes fayli kross-platform loyihalarda binar va matnli fayllar yaxlitligining asosiy kafolatidir.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'attr_intro', fn: sceneAttrIntro },
      { id: 'check_attr', fn: sceneCheckAttr },
      { id: 'eol_binary', fn: sceneEolBinary },
      { id: 'diff_textconv', fn: sceneDiffTextconv },
      { id: 'filter_clean_smudge', fn: sceneFilterCleanSmudge },
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

  // Poster uchun ko'rgazmali kadr
  window.renderPoster = function () {
    bg();
    sceneAttrIntro(10.0, TM.scenes.attr_intro, { isPoster: true });
  };
})();
