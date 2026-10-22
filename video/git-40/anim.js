// anim.js — 40-bob: Qidiruv
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
  // 1-SAHNA: Qidiruv Savollari va git grep Asoslari
  // ==========================================
  function sceneGrepBasics(u, bounds, o = {}) {
    chip(1, "Qidiruv Savollari va git grep Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git grep -n hisoblaNarx
      drawCommandLine("dev $ ", "git grep -n hisoblaNarx", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("src/narx.js:4:function hisoblaNarx(narx, soni) {", 2.8, tu, 130, 228, { color: C.green });
      drawOutputLine("src/narx.js:17:module.exports = { hisoblaNarx, chegirma }", 3.0, tu, 130, 248, { color: '#cbd5e1' });
      drawOutputLine("src/savat.js:1:const { hisoblaNarx } = require('./narx')", 3.2, tu, 130, 268, { color: C.cyan });
      drawOutputLine("src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, ...)", 3.4, tu, 130, 288, { color: C.cyan });

      // 2-buyruq: git grep -c hisoblaNarx
      drawCommandLine("dev $ ", "git grep -c hisoblaNarx", 4.5, 6.0, 6.2, tu, 130, 325);
      drawOutputLine("src/narx.js:2", 6.5, tu, 130, 348, { color: C.yellow });
      drawOutputLine("src/savat.js:2", 6.7, tu, 130, 368, { color: C.yellow });

      // 3-buyruq: git grep -l SOLIQ
      drawCommandLine("dev $ ", "git grep -l SOLIQ", 7.8, 9.0, 9.2, tu, 130, 405);
      drawOutputLine("src/narx.js", 9.5, tu, 130, 428, { color: C.green, weight: 600 });

      // 4-buyruq: git grep --break --heading -n chegirma
      drawCommandLine("dev $ ", "git grep --break --heading -n chegirma", 10.5, 12.5, 12.7, tu, 130, 465);
      drawOutputLine("src/narx.js", 13.0, tu, 130, 488, { color: C.yellow, weight: 700 });
      drawOutputLine("6:  const sof = jami - chegirma(jami)", 13.2, tu, 130, 508, { color: '#cbd5e1' });
      drawOutputLine("10:function chegirma(jami) {", 13.4, tu, 130, 528, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Tezkor va Ko'p Oqimli Qidiruv", "oddiy grepdan nima afzal?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git grep Afzalliklari", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Tezkor: faqat Git kuzatadigan fayllarni ko'radi (node_modules/ chetda).", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Ko'p oqimli (multithreaded): barcha protsessor yadrolarini ishga soladi.", 1030, 365, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• -n (qator raqami), -c (sanoq), -l (fayl ro'yxati), -L (mos kelmaganlar).", 1030, 395, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• --heading va --break orqali fayllar bo'yicha chiroyli guruhlaydi.", 1030, 420, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Loyihadagi 3 Asosiy Savol", 1125, 500, C.green, { size: 16, mono: false });
        text("1. 'Qayerda?'     → git grep (kod hozir qaysi fayllarda e'lon qilingan).", 1030, 545, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("2. 'Qachon?'      → git log -S va git log -G (qachon paydo bo'ldi/o'zgardi).", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("3. 'Kim yozgan?'  → git blame (har bir qator muallifi va tarixi).", 1030, 605, { size: 15, fam: MONO, color: C.green, align: 'left' });
        text("• Har bir savolning o'z aniq va mos vositasi mavjud!", 1030, 630, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Turli Qatlamlar va Commitlarda Qidiruv
  // ==========================================
  function sceneGrepTrees(u, bounds, o = {}) {
    chip(2, "Turli Qatlamlar va Commitlarda Qidiruv", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git grep -n vaqtinchalik
      drawCommandLine("dev $ ", "git grep -n vaqtinchalik", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("src/savat.js:15:// ishlab chiqish: vaqtinchalik log", 2.8, tu, 130, 228, { color: C.yellow });

      // 2-buyruq: git grep -n --cached vaqtinchalik
      drawCommandLine("dev $ ", "git grep -n --cached vaqtinchalik", 4.0, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("# Topilmadi! (chiqish kodi: 1, chunki indexga add qilinmagan)", 6.5, tu, 130, 288, { color: C.red, weight: 600 });

      // 3-buyruq: git grep -n SOLIQ_FOIZI v1.0
      drawCommandLine("dev $ ", "git grep -n SOLIQ_FOIZI v1.0", 7.8, 9.8, 10.0, tu, 130, 325);
      drawOutputLine("v1.0:src/narx.js:1:const SOLIQ_FOIZI = 12", 10.3, tu, 130, 348, { color: C.green, weight: 600 });
      drawOutputLine("v1.0:src/narx.js:5:  return jami + jami * SOLIQ_FOIZI / 100", 10.5, tu, 130, 368, { color: C.cyan });

      // 4-buyruq: git grep -n --untracked SOLIQ
      drawCommandLine("dev $ ", "git grep -n --untracked SOLIQ", 11.8, 13.5, 13.7, tu, 130, 405);
      drawOutputLine("eslatma.txt:1:SOLIQ_FOIZI = 20 (qoralama)", 14.0, tu, 130, 428, { color: C.yellow });
      drawOutputLine("src/narx.js:1:const SOLIQ_FOIZI = 15", 14.2, tu, 130, 448, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Istalgan Daraxt va Qatlamda", "branch almashtirmasdan qidirish", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 195, { fill: 'rgba(168,85,247,0.08)', col: C.purple });
        pill("To'rtta Qidiruv Manbasi", 1130, 290, C.purple, { size: 16, mono: false });
        text("1. Working Tree (standart) : Diskdagi, siz tahrirlayotgan ishchi nusxa.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("2. --cached                : Faqat index (staging area) blob'larini o'qiydi.", 1030, 365, { size: 15, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("3. --untracked             : Git kuzatmayotgan yangi fayllarni ham qo'shadi.", 1030, 395, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("4. <commit/tag/branch>     : O'tmishdagi commit daraxtini to'g'ridan-to'g'ri ko'radi.", 1030, 425, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 475, 790, 175, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Eski Versiyalarni Tekshirish Kuchi", 1135, 510, C.cyan, { size: 16, mono: false });
        text("• 'git grep matn v1.0' — branch almashtirmasdan o'tmishni tekshiradi!", 1030, 550, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Git commit → tree → blob zanjiri bo'ylab obyektlar bazasidan o'qiydi.", 1030, 575, { size: 14, color: '#cbd5e1', align: 'left' });
        text("• Diskdagi fayllarga mutlaqo tegmaydi, checkout qilish shart emas.", 1030, 600, { size: 14, color: C.yellow, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Funksiya Konteksti va Mantiqiy Regex
  // ==========================================
  function sceneGrepContextLogic(u, bounds, o = {}) {
    chip(3, "Funksiya Konteksti va Mantiqiy Regex", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git grep -p -n jami src/savat.js
      drawCommandLine("dev $ ", "git grep -p -n jami src/savat.js", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("src/savat.js=3=function savatJami(savat) {  # Funksiya sarlavhasi!", 3.0, tu, 130, 228, { color: C.yellow, weight: 600 });
      drawOutputLine("src/savat.js:7:  let jami = 0", 3.2, tu, 130, 248, { color: '#cbd5e1' });
      drawOutputLine("src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)", 3.4, tu, 130, 268, { color: C.green });
      drawOutputLine("src/savat.js:11:  return jami", 3.6, tu, 130, 288, { color: '#cbd5e1' });

      // 2-buyruq: git grep -n -e function --and -e Narx
      drawCommandLine("dev $ ", "git grep -n -e function --and -e Narx", 4.8, 7.0, 7.2, tu, 130, 325);
      drawOutputLine("src/narx.js:4:function hisoblaNarx(narx, soni) {", 7.5, tu, 130, 348, { color: C.green, weight: 600 });

      // 3-buyruq: git grep -n -e function --and --not -e Narx
      drawCommandLine("dev $ ", "git grep -n -e function --and --not -e Narx", 8.5, 11.0, 11.2, tu, 130, 385);
      drawOutputLine("src/narx.js:10:function chegirma(jami) {", 11.5, tu, 130, 408, { color: C.cyan });
      drawOutputLine("src/savat.js:3:function savatJami(savat) {", 11.7, tu, 130, 428, { color: C.cyan });

      // 4-buyruq: git grep -E 'jami (\+|-)='
      drawCommandLine("dev $ ", "git grep -E 'jami (\\+|-)='", 12.8, 14.5, 14.7, tu, 130, 465);
      drawOutputLine("src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, ...)", 15.0, tu, 130, 488, { color: C.green });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Kontekst va Mantiqiy Qidiruv", "aqlli filtrlar tizimi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(234,179,8,0.08)', col: C.yellow });
        pill("Funksiya Konteksti (-p va -W)", 1130, 290, C.yellow, { size: 16, mono: false });
        text("• -p (--show-function) : Mos qator qaysi funksiyada ekanini ko'rsatadi.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• -W (--function-context): Moslik bor butun funksiya kodini chiqaradi.", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• .gitattributes faylida '*.py diff=python' kabi til driveri berilsa,", 1030, 395, { size: 14, color: '#cbd5e1', align: 'left' });
        text("  Git chekinishli sinf metodlarini ham xatosiz aniqlaydi.", 1030, 420, { size: 14, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Mantiqiy Operatorlar va Regex", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• --and       : Ikkala shartning bitta qatorda bajarilishini talab qiladi.", 1030, 545, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("• --not       : Belgilangan naqsh uchramagan qatorlarni ajratadi.", 1030, 570, { size: 14, fam: MONO, color: C.red, align: 'left' });
        text("• --all-match : Naqshlarning hammasi fayl ichida uchrashi shart bo'ladi.", 1030, 595, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• -E (Extended regex), -F (so'zma-so'z matn), -P (Perl PCRE).", 1030, 620, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git log -S (Pickaxe)
  // ==========================================
  function sceneLogPickaxe(u, bounds, o = {}) {
    chip(4, "git log -S (Pickaxe): Satr Qachon Qo'shildi / O'chdi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log -S TODO --oneline
      drawCommandLine("dev $ ", "git log -S TODO --oneline", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("99b7c86 Bo'sh savatni tekshirish  # TODO o'chirilgan!", 2.8, tu, 130, 228, { color: C.red, weight: 600 });
      drawOutputLine("aca6765 Savat moduli: savatJami   # TODO qo'shilgan!", 3.0, tu, 130, 248, { color: C.green, weight: 600 });

      // 2-buyruq: git log -S TODO --oneline -p
      drawCommandLine("dev $ ", "git log -S TODO --oneline -p -1", 4.2, 6.2, 6.4, tu, 130, 285);
      drawOutputLine("99b7c86 Bo'sh savatni tekshirish", 6.7, tu, 130, 308, { color: C.yellow });
      drawOutputLine("-// TODO: bo'sh savatni tekshirish", 6.9, tu, 130, 328, { color: C.red, weight: 700 });
      drawOutputLine("+  if (savat.length === 0) return 0", 7.1, tu, 130, 348, { color: C.green });

      // 3-buyruq: git log -S 'jami * 0.05' --oneline
      drawCommandLine("dev $ ", "git log -S 'jami * 0.05' --oneline", 8.2, 10.2, 10.4, tu, 130, 385);
      drawOutputLine("12d2254 Katta xaridga 5% chegirma  # Kod paydo bo'lgan commit!", 10.7, tu, 130, 408, { color: C.cyan, weight: 600 });

      // 4-buyruq: git log -S hisoblaNarx --oneline -- src/savat.js
      drawCommandLine("dev $ ", "git log -S hisoblaNarx --oneline -- src/savat.js", 11.8, 14.0, 14.2, tu, 130, 445);
      drawOutputLine("aca6765 Savat moduli: savatJami", 14.5, tu, 130, 468, { color: '#94a3b8' });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Pickaxe (Cho'kich) Mexanizmi", "kod qachon tug'ildi va qachon o'ldi?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Pickaxe Qanday Ishlaydi?", 1125, 290, C.green, { size: 16, mono: false });
        text("• 'git log -S<satr>' matnning fayldagi uchrashlar soni o'zgargan commitlarni topadi.", 1030, 335, { size: 14, color: C.text, align: 'left' });
        text("• Keraksiz yuzlab commitlarni chetlab o'tib, aynan qo'shilgan/o'chgan vaqtni topadi.", 1030, 365, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• So'zma-so'z qidiradi: maxsus belgilarni ekranlash shart emas.", 1030, 395, { size: 14, color: C.yellow, align: 'left' });
        text("• Regex kerak bo'lsa: '--pickaxe-regex' bayrog'i qo'shiladi.", 1030, 420, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Amaliy Foydalanish Holatlari", 1125, 500, C.cyan, { size: 16, mono: false });
        text("• 'Bu xatolik keltirgan kod qachon va kim tomonidan yozilgan?'", 1030, 545, { size: 14, color: C.yellow, align: 'left' });
        text("• 'Maxfiy API kaliti loyiha tarixiga qachon kirib, qachon o'chirilgan?'", 1030, 570, { size: 14, color: C.red, align: 'left', weight: 600 });
        text("• '--all' parametri barcha branchlar va teglarni birdek qidiradi.", 1030, 595, { size: 14, fam: MONO, color: C.green, align: 'left' });
        text("• '--pickaxe-all' esa topilgan commitning to'liq kontekstini ko'rsatadi.", 1030, 620, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: git log -G vs -S
  // ==========================================
  function sceneLogGDiff(u, bounds, o = {}) {
    chip(5, "git log -G vs -S: Qiymat O'zgarishi va Diff Tahlili", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log -S SOLIQ_FOIZI --oneline
      drawCommandLine("dev $ ", "git log -S SOLIQ_FOIZI --oneline", 0.8, 2.3, 2.5, tu, 130, 205);
      drawOutputLine("8155bc1 Narx hisoblash moduli  # Sanoq o'zgarmagan (2->2), 12->15 chiqmadi!", 2.8, tu, 130, 228, { color: C.yellow });

      // 2-buyruq: git log -G 'SOLIQ_FOIZI = [0-9]+' --oneline
      drawCommandLine("dev $ ", "git log -G 'SOLIQ_FOIZI = [0-9]+' --oneline", 4.0, 6.5, 6.7, tu, 130, 265);
      drawOutputLine("aebd0d4 Soliq foizini 15 ga oshirish  # -12 va +15 diffda topildi!", 7.0, tu, 130, 288, { color: C.green, weight: 700 });
      drawOutputLine("8155bc1 Narx hisoblash moduli", 7.2, tu, 130, 308, { color: '#94a3b8' });

      // 3-buyruq: git log -G chegirma --oneline
      drawCommandLine("dev $ ", "git log -G chegirma --oneline", 8.5, 10.2, 10.4, tu, 130, 345);
      drawOutputLine("b84f365 Chegirma chegarasini konstantaga chiqarish (ko'chirish)", 10.7, tu, 130, 368, { color: C.cyan });
      drawOutputLine("12d2254 Katta xaridga 5% chegirma", 10.9, tu, 130, 388, { color: '#94a3b8' });

      // 4-buyruq: git log -S chegirma --oneline
      drawCommandLine("dev $ ", "git log -S chegirma --oneline", 12.0, 13.5, 13.7, tu, 130, 425);
      drawOutputLine("12d2254 Katta xaridga 5% chegirma  # -S ko'chirishni e'tiborsiz qoldiradi!", 14.0, tu, 130, 448, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.red, "-S va -G Farqlari", "qaysi birini qachon ishlatish kerak?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(239,68,68,0.08)', col: C.red });
        pill("-S va -G Taqqoslash", 1130, 290, C.red, { size: 16, mono: false });
        text("• -S <satr>  : Matnning fayldagi soni o'zgarganda ishlaydi.", 1030, 335, { size: 15, fam: MONO, color: C.cyan, align: 'left' });
        text("• -G <regex> : Diff patchida '+' yoki '-' qatori mos kelganda topadi.", 1030, 365, { size: 15, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("• Qiymat o'zgarishi (12 → 15) satr sonini o'zgartirmaydi — faqat -G ko'radi!", 1030, 395, { size: 14, color: C.yellow, align: 'left' });
        text("• Fayl ichida kodni ko'chirish -G da shovqin beradi, -S da ko'rinmaydi.", 1030, 420, { size: 14, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Amaliy Oltin Qoida", 1125, 500, C.cyan, { size: 16, mono: false });
        text("1. Doimo avval '-S' ishlating: tezroq ishlaydi, natijasi toza.", 1030, 545, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("2. Agar qiymat o'zgarishi yoki regex diff kerak bo'lsa '-G' ga o'ting.", 1030, 575, { size: 15, color: C.yellow, align: 'left' });
        text("3. Qidiruvni tezlashtirish uchun 'pathspec' (-- src/) bilan chegaralang.", 1030, 605, { size: 15, color: C.cyan, align: 'left' });
        text("4. Aniq blob qidirishda esa '--find-object=<hash>' buyrug'i bor.", 1030, 630, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: git log -L va --grep
  // ==========================================
  function sceneLogLAndGrep(u, bounds, o = {}) {
    chip(6, "git log -L va --grep: Funksiya Tarixi va Xabarlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/dokon (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log -L :hisoblaNarx:src/narx.js --oneline
      drawCommandLine("dev $ ", "git log -L :hisoblaNarx:src/narx.js --oneline", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("12d2254 Katta xaridga 5% chegirma (funksiya yangilandi)", 3.3, tu, 130, 228, { color: C.green, weight: 600 });
      drawOutputLine("8155bc1 Narx hisoblash moduli (funksiya yaratildi)", 3.5, tu, 130, 248, { color: C.cyan });

      // 2-buyruq: git log -L 1,1:src/narx.js --oneline
      drawCommandLine("dev $ ", "git log -L 1,1:src/narx.js --oneline", 4.5, 6.5, 6.7, tu, 130, 285);
      drawOutputLine("aebd0d4 Soliq foizini 15 ga oshirish (-12, +15)", 7.0, tu, 130, 308, { color: C.yellow });
      drawOutputLine("8155bc1 Narx hisoblash moduli (1-qator paydo bo'ldi)", 7.2, tu, 130, 328, { color: '#94a3b8' });

      // 3-buyruq: git log --grep=chegirma -i --oneline
      drawCommandLine("dev $ ", "git log --grep=chegirma -i --oneline", 8.2, 10.2, 10.4, tu, 130, 365);
      drawOutputLine("b84f365 Chegirma chegarasini konstantaga chiqarish", 10.7, tu, 130, 388, { color: C.cyan });
      drawOutputLine("12d2254 Katta xaridga 5% chegirma", 10.9, tu, 130, 408, { color: C.cyan });

      // 4-buyruq: git log --grep=savat -i --all-match --grep=bo
      drawCommandLine("dev $ ", "git log --grep=savat -i --all-match --grep=bo --oneline", 12.0, 14.5, 14.7, tu, 130, 445);
      drawOutputLine("99b7c86 Bo'sh savatni tekshirish", 15.0, tu, 130, 468, { color: C.green, weight: 600 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Funksiya Evolyutsiyasi va Xabarlar", "aqlbovar qilmas darajada qulay", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("git log -L Imkoniyatlari", 1125, 290, C.cyan, { size: 16, mono: false });
        text("• Aniq qatorlar oralig'i yoki butun bir funksiya tarixini kuzatadi.", 1030, 335, { size: 15, color: C.text, align: 'left' });
        text("• Har bir commit uchun faqat o'sha funksiyaga tegishli diff patchini ko'rsatadi.", 1030, 365, { size: 14, color: C.green, align: 'left', weight: 600 });
        text("• Funksiyadagi nozik xatoliklarni tahlil qilishda eng kuchli vosita.", 1030, 395, { size: 14, color: C.yellow, align: 'left' });
        text("• 'git log -L :funksiya:fayl' — funksiya chegarasini Git avtomatik topadi.", 1030, 420, { size: 14, fam: MONO, color: '#cbd5e1', align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.5, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Commit Xabarlarida: --grep", 1125, 500, C.green, { size: 16, mono: false });
        text("• Kodda emas, aynan commit xabarida qidiradi: 'git log --grep=vazifa'.", 1030, 545, { size: 14, color: C.text, align: 'left' });
        text("• -i : katta-kichik harfni farqlamaslik uchun ishlatiladi.", 1030, 570, { size: 14, fam: MONO, color: C.yellow, align: 'left' });
        text("• --all-match : bir nechta --grep qoidasining bir vaqtda mos kelishi.", 1030, 595, { size: 14, fam: MONO, color: C.cyan, align: 'left' });
        text("• --invert-grep : xabari mos KELMAYDIGAN commitlarni ajratadi.", 1030, 620, { size: 14, fam: MONO, color: C.red, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // ASOSIY RENDER SIKLI
  // ==========================================
  window.renderFrame = function (t) {
    bg(t);

    const scenes = [
      { id: 'grep_basics', fn: sceneGrepBasics },
      { id: 'grep_trees', fn: sceneGrepTrees },
      { id: 'grep_context_logic', fn: sceneGrepContextLogic },
      { id: 'log_pickaxe', fn: sceneLogPickaxe },
      { id: 'log_g_diff', fn: sceneLogGDiff },
      { id: 'log_l_and_grep', fn: sceneLogLAndGrep }
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
    sceneGrepBasics(10.0, TM.scenes.grep_basics, { isPoster: true });
  };
})();
