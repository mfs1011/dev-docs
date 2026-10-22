// anim.js — 30-bob: SSH kalit va credential'lar
// Realistik terminal va zamonaviy split-screen video animatsiyasi
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
  // 1-SAHNA: Kirish va SSH/HTTPS Asoslari
  // ==========================================
  function sceneIntro(u, bounds, o = {}) {
    chip(1, "SSH va HTTPS Asoslari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — masofaviy transport protokollari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: masofaviy URL ni ko'rish (SSH)
      drawCommandLine("ali $ ", "git remote -v", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("origin  git@github.com:jamoa/loyiha.git (fetch)", 3.0, tu, 130, 230, { color: C.cyan, weight: 600 });
      drawOutputLine("origin  git@github.com:jamoa/loyiha.git (push)", 3.2, tu, 130, 252, { color: C.cyan, weight: 600 });
      drawOutputLine("  # SSH: server foydalanuvchisi 'git', shaxs kalit bilan taniladi", 3.5, tu, 130, 274, { color: C.mute });

      // 2-buyruq: HTTPS bilan solishtirish
      drawCommandLine("ali $ ", "git remote set-url origin https://github.com/jamoa/loyiha.git", 5.0, 8.0, 8.2, tu, 130, 310);
      drawCommandLine("ali $ ", "git remote -v", 9.0, 10.5, 10.7, tu, 130, 335);
      drawOutputLine("origin  https://github.com/jamoa/loyiha.git (fetch)", 11.0, tu, 130, 360, { color: C.green, weight: 600 });
      drawOutputLine("origin  https://github.com/jamoa/loyiha.git (push)", 11.2, tu, 130, 382, { color: C.green, weight: 600 });
      drawOutputLine("  # HTTPS: login va Personal Access Token (PAT) talab qilinadi", 11.5, tu, 130, 404, { color: C.mute });

      // Izoh kartasi
      const kCallout = o.isPoster ? 1 : P(u, 13.0, 0.5);
      withA(kCallout, () => {
        card(125, 435, 790, 215, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Transport Solishtiruvi", 225, 470, C.cyan, { size: 16, mono: false });
        text("• SSH (git@host:yo'l):", 150, 510, { size: 16, fam: MONO, color: C.yellow, align: 'left', weight: 600 });
        text("  Kalit juftligi: maxfiy kalit kompyuteringizda, ommaviy (.pub) serverda.", 150, 538, { size: 15, color: C.text, align: 'left' });
        text("  Parol tarmoqqa uzatilmaydi, server 'qulfni och' degan chaqiriq beradi.", 150, 565, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• HTTPS (https://host/yo'l):", 150, 598, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 600 });
        text("  Login va Personal Access Token (PAT) — Git Credential Helper saqlaydi.", 150, 626, { size: 15, color: '#cbd5e1', align: 'left' });
      });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Autentifikatsiya Arxitekturasi", "Git nega parollarni o'zi saqlamaydi?", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Git va Transport Aloqasi", 1115, 290, C.cyan, { size: 16, mono: false });
        text("• Git parollarni o'zida saqlashni ataylab tashqariga chiqargan:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  1. Xavfsiz saqlash — operatsion tizim omborlari ishi (Keychain, DPAPI).", 1030, 368, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  2. Har xil muhitda har xil talab: noutbukda Keychain, CI'da muhit o'zgaruvchisi.", 1030, 396, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  3. Yangi standartlar: OAuth, 2-bosqichli tekshiruv, tezkor tokenlar.", 1030, 424, { size: 15, color: C.green, align: 'left', weight: 600 });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 14.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("SSH Asimmetrik Mexanizmi", 1125, 500, C.green, { size: 16, mono: false });
        text("• Ommaviy kalit (.pub) — qulf: uni serverga erkin joylashtirasiz.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Maxfiy kalit — yagona kalit: u hech qachon tarmoqqa chiqmaydi!", 1030, 575, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• Ulanishda server raqamli imzoni tekshiradi, parol hech qachon so'ralmaydi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Eng xavfsiz va tezkor ulanish varianti hisoblanadi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 2-SAHNA: SSH Kalit Yaratish va Huquqlar
  // ==========================================
  function sceneSshKalitVaHuquqlar(u, bounds, o = {}) {
    chip(2, "SSH Kalit Yaratish va Huquqlar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ssh-keygen va ruxsatlarni sozlash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ssh-keygen ishga tushirish
      drawCommandLine("ali $ ", "ssh-keygen -t ed25519 -C 'ali@example.com' -f ~/.ssh/id_ed25519", 0.8, 4.0, 4.2, tu, 130, 205);
      drawOutputLine("Generating public/private ed25519 key pair.", 4.5, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("Your identification has been saved in ~/.ssh/id_ed25519", 4.8, tu, 130, 252, { color: C.green, weight: 600 });
      drawOutputLine("Your public key has been saved in ~/.ssh/id_ed25519.pub", 5.0, tu, 130, 274, { color: C.cyan, weight: 600 });
      drawOutputLine("The key fingerprint is: SHA256:4xK7z... ali@example.com", 5.3, tu, 130, 296, { color: C.yellow });

      // 2-buyruq: ruxsatlarni tekshirish
      drawCommandLine("ali $ ", "ls -l ~/.ssh/id_ed25519*", 7.5, 9.5, 9.7, tu, 130, 330);
      drawOutputLine("-rw-------  1 ali  staff  411 id_ed25519     # 600: faqat egasi!", 10.0, tu, 130, 355, { color: C.green, weight: 700 });
      drawOutputLine("-rw-r--r--  1 ali  staff   97 id_ed25519.pub # 644: ommaviy", 10.2, tu, 130, 377, { color: '#94a3b8' });

      // 3-buyruq: noto'g'ri ruxsat xavfi
      drawCommandLine("ali $ ", "chmod 644 ~/.ssh/id_ed25519 && ssh-keygen -y -f ~/.ssh/id_ed25519", 12.0, 15.5, 15.7, tu, 130, 412);
      drawOutputLine("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", 16.0, tu, 130, 437, { color: C.red, weight: 700 });
      drawOutputLine("@         WARNING: UNPROTECTED PRIVATE KEY FILE!    @", 16.2, tu, 130, 459, { color: C.red, weight: 700 });
      drawOutputLine("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", 16.4, tu, 130, 481, { color: C.red, weight: 700 });
      drawOutputLine("Permissions 0644 for 'id_ed25519' are too open.", 16.7, tu, 130, 503, { color: '#fca5a5' });
      drawOutputLine("This private key will be ignored.", 16.9, tu, 130, 525, { color: C.red, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.yellow, "Ed25519 va Ruxsat Qoidalari", "xavfsizlik talablari", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(255,209,102,0.08)', col: C.yellow });
        pill("Ed25519 ning Afzalliklari", 1125, 290, C.yellow, { size: 16, mono: false });
        text("• GitHub va sanoat standarti: zamonaviy Ed25519.", 1030, 335, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• RSA 4096 ga qaraganda ancha qisqa (256-bit), tez va kuchliroq.", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("• -C 'izoh' — kalitni osongina tanish uchun yorliq (odatda email).", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Eski DSA kalitlari butunlay bekor qilingan.", 1030, 420, { size: 15, color: C.red, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 11.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Qat'iy 600 Ruxsati va Passphrase", 1150, 500, C.red, { size: 16, mono: false });
        text("• chmod 600 ~/.ssh/id_ed25519 — faqat egasi o'qishi/yozishi shart!", 1030, 545, { size: 16, fam: MONO, color: C.green, align: 'left', weight: 700 });
        text("• Boshqa foydalanuvchilar o'qiy olsa, OpenSSH kalitdan voz kechadi.", 1030, 575, { size: 15, color: C.text, align: 'left' });
        text("• Parol iborasi (Passphrase): diskdagi faylni AES-256 bilan shifrlaydi.", 1030, 605, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        text("• Noutbuk yo'qolsa ham, maxfiy kalit ochilmaydi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 3-SAHNA: ssh-agent va SSH Config
  // ==========================================
  function sceneSshAgentVaConfig(u, bounds, o = {}) {
    chip(3, "ssh-agent va SSH Config", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — ssh-agent va ~/.ssh/config sozlash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: ssh-agent va ssh-add
      drawCommandLine("ali $ ", 'eval "$(ssh-agent -s)"', 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("Agent pid 48210", 3.2, tu, 130, 230, { color: C.green, weight: 600 });
      drawCommandLine("ali $ ", "ssh-add ~/.ssh/id_ed25519", 4.0, 6.0, 6.2, tu, 130, 255);
      drawOutputLine("Enter passphrase: [********]", 6.5, tu, 130, 280, { color: C.yellow });
      drawOutputLine("Identity added: /Users/ali/.ssh/id_ed25519 (ali@example.com)", 6.9, tu, 130, 302, { color: C.cyan, weight: 700 });

      // 2-buyruq: ~/.ssh/config fayli
      drawCommandLine("ali $ ", "cat ~/.ssh/config", 8.5, 10.0, 10.2, tu, 130, 335);
      drawOutputLine("Host github.com", 10.5, tu, 130, 360, { color: C.green, weight: 700 });
      drawOutputLine("  User git", 10.7, tu, 130, 382, { color: '#94a3b8' });
      drawOutputLine("  IdentityFile ~/.ssh/id_ed25519", 10.9, tu, 130, 404, { color: C.cyan });
      drawOutputLine("  IdentitiesOnly yes", 11.1, tu, 130, 426, { color: C.yellow, weight: 700 });
      drawOutputLine("Host github-ish", 11.5, tu, 130, 452, { color: C.green, weight: 700 });
      drawOutputLine("  HostName github.com", 11.7, tu, 130, 474, { color: '#94a3b8' });
      drawOutputLine("  User git", 11.9, tu, 130, 496, { color: '#94a3b8' });
      drawOutputLine("  IdentityFile ~/.ssh/id_ed25519_ish", 12.1, tu, 130, 518, { color: C.cyan });
      drawOutputLine("  IdentitiesOnly yes", 12.3, tu, 130, 540, { color: C.yellow, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.purple, "Multi-Akkaunt SSH Arxitekturasi", "bir serverda bir necha profil", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(180,108,255,0.08)', col: C.purple });
        pill("ssh-agent ning Vazifasi", 1115, 290, C.purple, { size: 16, mono: false });
        text("• Fonda ishlovchi xotira ombori:", 1030, 335, { size: 16, color: C.text, align: 'left' });
        text("  Kalit parolini bir marta kiritasiz, u kalitni RAM'da saqlab turadi.", 1030, 365, { size: 15, color: '#cbd5e1', align: 'left' });
        text("  Har bir 'git fetch' paytida parolni qayta so'ramaydi.", 1030, 395, { size: 15, color: C.green, align: 'left', weight: 600 });
        text("• Maxfiy kalit agentdan tashqariga chiqmaydi — faqat imzo beradi.", 1030, 422, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Host Taxallusi va IdentitiesOnly", 1145, 500, C.cyan, { size: 16, mono: false });
        text("• Bir GitHub serverida shaxsiy va korporativ hisoblar:", 1030, 545, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("  git remote set-url origin git@github-ish:korxona/loyiha.git", 1030, 575, { size: 15, fam: MONO, color: C.yellow, align: 'left' });
        text("• IdentitiesOnly yes: agentdagi boshqa kalitlarni sinamasdan,", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("  faqat ko'rsatilgan kalitni beradi va hisoblar chalkashishini oldini oladi.", 1030, 630, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 4-SAHNA: git credential Quyi Tizimi
  // ==========================================
  function sceneHttpsCredentialPlumbing(u, bounds, o = {}) {
    chip(4, "git credential Quyi Tizimi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — git credential plumbing buyruqlari',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: credential fill amali
      drawCommandLine("ali $ ", "printf 'protocol=https\\nhost=github.com\\n\\n' | git credential fill", 0.8, 3.8, 4.0, tu, 130, 205);
      drawOutputLine("protocol=https", 4.3, tu, 130, 230, { color: '#94a3b8' });
      drawOutputLine("host=github.com", 4.5, tu, 130, 252, { color: '#94a3b8' });
      drawOutputLine("username=ali", 4.7, tu, 130, 274, { color: C.green, weight: 600 });
      drawOutputLine("password=ghp_98aK2x... # Personal Access Token!", 5.0, tu, 130, 296, { color: C.yellow, weight: 700 });

      // 2-buyruq: xato token bo'lganda reject
      drawCommandLine("ali $ ", "printf 'protocol=https\\nhost=github.com\\n\\n' | git credential reject", 7.0, 10.0, 10.2, tu, 130, 335);
      drawOutputLine("  # 401 Unauthorized kelganda Git reject chaqiradi:", 10.5, tu, 130, 360, { color: C.red, weight: 600 });
      drawOutputLine("  # Ombordagi eskirgan yaroqsiz token avtomatik tozalanadi!", 10.8, tu, 130, 382, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.blue, "Credential Protokol Sikli", "fill, approve va reject mexanizmi", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(79,140,255,0.08)', col: C.blue });
        pill("Token Talabi va fill Amali", 1130, 290, C.blue, { size: 16, mono: false });
        text("• GitHub parollarni bekor qilgan — faqat Personal Access Token (PAT).", 1030, 335, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("• fill amali qidiruv zanjiri:", 1030, 365, { size: 15, color: C.text, align: 'left' });
        text("  1. Config sozlamalari -> 2. Helper dasturlar -> 3. Foydalanuvchi so'rovi.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• CI muhitida GIT_TERMINAL_PROMPT=0 bilan osilib qolish oldi olinadi.", 1030, 422, { size: 15, color: C.green, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 8.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("approve va reject Holatlari", 1135, 500, C.green, { size: 16, mono: false });
        text("• Server 200 OK qaytargach: Git approve yuboradi.", 1030, 545, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("  Helper yangi va to'g'ri tokenni xotiraga/omborga saqlaydi.", 1030, 575, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Server 401 Unauthorized qaytarsa: Git reject yuboradi.", 1030, 605, { size: 16, color: C.red, align: 'left', weight: 600 });
        text("  Eskirgan ma'lumot o'chiriladi va keyingi safar yangisi so'raladi.", 1030, 630, { size: 15, color: '#94a3b8', align: 'left' });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Credential Helper Turlari
  // ==========================================
  function sceneCredentialHelperlar(u, bounds, o = {}) {
    chip(5, "Credential Helper Turlari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — helper dasturlarini ko‘rish va sozlash',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: helper sozlash
      drawCommandLine("ali $ ", "git config --global credential.helper osxkeychain", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("ali $ ", "git config --show-origin --get-all credential.helper", 4.2, 6.5, 6.7, tu, 130, 235);
      drawOutputLine("file:/Users/ali/.gitconfig  credential.helper=osxkeychain", 7.0, tu, 130, 260, { color: C.cyan, weight: 700 });

      // 2-buyruq: test so'rov
      drawCommandLine("ali $ ", "git fetch origin", 8.5, 10.0, 10.2, tu, 130, 295);
      drawOutputLine("From https://github.com/jamoa/loyiha", 10.5, tu, 130, 320, { color: '#94a3b8' });
      drawOutputLine(" * [up to date]      main       -> origin/main", 10.8, tu, 130, 342, { color: C.green, weight: 600 });
      drawOutputLine("  # Keychain tokenni shifrlangan ombordan berdi, so'rov yo'q!", 11.2, tu, 130, 364, { color: C.mute });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.green, "Helper Turlari va Xavfsizlik", "tizim omborlari va cheklovlar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(52,211,153,0.08)', col: C.green });
        pill("Tizim Shifrlangan Omborlari", 1135, 290, C.green, { size: 16, mono: false });
        text("• macOS: osxkeychain — tizim Keychain omborida shifrlangan.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("• Windows: wincred / Git Credential Manager (GCM).", 1030, 365, { size: 16, color: C.cyan, align: 'left', weight: 600 });
        text("• Linux: libsecret — GNOME Keyring yoki KWallet bilan integratsiya.", 1030, 395, { size: 15, color: '#cbd5e1', align: 'left' });
        text("• Eng xavfsiz va tavsiya etiladigan amaliyot hisoblanadi.", 1030, 422, { size: 15, color: C.yellow, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 9.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Xavfli store va Vaqtinchalik cache", 1160, 500, C.red, { size: 16, mono: false });
        text("• cache helper: RAM da vaqtinchalik saqlaydi (standart: 15 daqiqa).", 1030, 545, { size: 15, color: C.text, align: 'left' });
        text("• store helper: tokenni ~/.git-credentials ga OCHIQ MATNDA yozadi!", 1030, 575, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("  Xavf: faylni o'qigan har qanday ilova yoki skript tokenni o'g'irlaydi.", 1030, 605, { size: 15, color: '#fca5a5', align: 'left' });
        text("  Shuning uchun store ni hech qachon shaxsiy noutbukda ishlatmang!", 1030, 630, { size: 15, color: C.yellow, align: 'left', weight: 600 });
        ctx.restore();
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Tavsiyalar
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Tavsiyalar", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Real Terminal
      terminal(100, 140, 840, 680, {
        title: 'zsh — yakuniy xavfsizlik tekshiruvi',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: SSH ulanishni tekshirish
      drawCommandLine("ali $ ", "ssh -T git@github.com", 0.8, 2.8, 3.0, tu, 130, 205);
      drawOutputLine("Hi ali! You've successfully authenticated,", 3.3, tu, 130, 230, { color: C.green, weight: 700 });
      drawOutputLine("but GitHub does not provide shell access.", 3.5, tu, 130, 252, { color: C.green, weight: 600 });

      // 2-buyruq: push amali
      drawCommandLine("ali $ ", "git push origin main", 5.0, 6.8, 7.0, tu, 130, 290);
      drawOutputLine("Everything up-to-date", 7.3, tu, 130, 315, { color: C.cyan, weight: 700 });

      // O'ng panel: Kontseptsiya
      panel(980, 140, 840, 680, C.cyan, "Xavfsizlik Bo'yicha Eng Yaxshi Qoidalar", "asosiy xulosalar", kBox, kBox);

      const kP1 = o.isPoster ? 1 : P(u, 1.2, 0.5);
      withA(kP1, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP1)) * 16);
        card(1005, 255, 790, 185, { fill: 'rgba(56,189,248,0.08)', col: C.cyan });
        pill("Autentifikatsiya Oltin Qoidalari", 1145, 290, C.cyan, { size: 16, mono: false });
        text("1. SSH uchun doim Ed25519 kaliti va parol iborasidan foydalaning.", 1030, 335, { size: 16, color: C.green, align: 'left', weight: 600 });
        text("2. Maxfiy kalit ruxsati faqat egasiga: chmod 600.", 1030, 365, { size: 16, color: C.yellow, align: 'left', weight: 600 });
        text("3. Bir nechta hisoblar uchun ~/.ssh/config va IdentitiesOnly yes.", 1030, 395, { size: 15, color: C.text, align: 'left' });
        text("4. HTTPS uchun tizimning shifrlangan Keychain / GCM helperini tanlang.", 1030, 422, { size: 15, color: C.cyan, align: 'left' });
        ctx.restore();
      });

      const kP2 = o.isPoster ? 1 : P(u, 7.0, 0.5);
      withA(kP2, () => {
        ctx.save(); if (!o.isPoster) ctx.translate(0, (1 - eo(kP2)) * 16);
        card(1005, 465, 790, 185, { fill: 'rgba(255,107,122,0.08)', col: C.red });
        pill("Qat'iyan Man Etiladi!", 1095, 500, C.red, { size: 16, mono: false });
        text("• Hech qachon URL ichiga parolni yozmang:", 1030, 545, { size: 16, color: C.red, align: 'left', weight: 700 });
        text("  https://ali:maxfiy-parol@github.com/loyiha.git  <-- XAVFLI!", 1030, 575, { size: 15, fam: MONO, color: '#fca5a5', align: 'left' });
        text("• Sababi: bu URL .git/config, shell tarixi va barcha loglarda saqlanadi.", 1030, 605, { size: 15, color: C.text, align: 'left' });
        text("• Maxfiy kalit va tokenlarni git status orqali tekshirib, commit qilmang!", 1030, 630, { size: 15, color: C.yellow, align: 'left', weight: 600 });
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
      { id: 'intro', fn: sceneIntro },
      { id: 'ssh_kalit_va_huquqlar', fn: sceneSshKalitVaHuquqlar },
      { id: 'ssh_agent_va_config', fn: sceneSshAgentVaConfig },
      { id: 'https_credential_plumbing', fn: sceneHttpsCredentialPlumbing },
      { id: 'credential_helperlar', fn: sceneCredentialHelperlar },
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
    sceneIntro(10.0, TM.scenes.intro, { isPoster: true });
  };
})();
