// anim.js — 45-bob: git config chuqur
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
  // 1-SAHNA: Git Config Qatlamlari va Ierarxiyasi
  // ==========================================
  function sceneConfigIntro(u, bounds, o = {}) {
    chip(1, "Git Config Qatlamlari va Ierarxiyasi", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config --system --list
      drawCommandLine("dev $ ", "git config --system --list", 0.8, 2.4, 2.6, tu, 130, 205);
      drawOutputLine("credential.helper=osxkeychain (/etc/gitconfig)", 2.9, tu, 130, 228, { color: '#94a3b8' });

      // 2-buyruq: git config --global user.name
      drawCommandLine("dev $ ", "git config --global user.name 'Ali Valiyev'", 4.0, 6.2, 6.4, tu, 130, 265);
      drawOutputLine("~/.gitconfig ga yozildi", 6.7, tu, 130, 290, { color: C.green });

      // 3-buyruq: git config --local user.email
      drawCommandLine("dev $ ", "git config --local user.email 'ali@maxsus.uz'", 7.8, 10.0, 10.2, tu, 130, 330);
      drawOutputLine(".git/config ga yozildi (faqat shu repo uchun!)", 10.5, tu, 130, 355, { color: C.cyan, weight: 700 });

      // 4-buyruq: command line -c
      drawCommandLine("dev $ ", "git -c user.name='Vaqtincha' commit ...", 11.8, 14.0, 14.2, tu, 130, 395);
      drawOutputLine("# Command-line (-c) barcha qatlamlardan ustun!", 14.5, tu, 130, 420, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "5 TA DARAJA",
        badgeCol: C.blue,
        title: "Ierarxiya Qatlamlari",
        desc: "system (/etc/) -> global (~/.gitconfig) -> local (.git/config) -> worktree -> command (-c).",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "USTUNLIK QOIDASI",
        badgeCol: C.green,
        title: "Tor Doira G'olib",
        desc: "Torroq ko'lam (masalan local) kengroq ko'lamdagi (global) bir xil nomli parametrni to'liq almashtiradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "git config set/get",
        badgeCol: C.purple,
        title: "Yangi Sintaksis",
        desc: "Git 2.43+ versiyalarda eski --set, --get o'rniga zamonaviy subbuyruqlar: git config get/set/list/unset ishlatiladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: Sozlama Qayerdan Keldi: show-origin va show-scope
  // ==========================================
  function sceneOriginScope(u, bounds, o = {}) {
    chip(2, "Sozlama Qayerdan Keldi: show-origin va show-scope", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config list --show-scope --show-origin
      drawCommandLine("dev $ ", "git config list --show-scope --show-origin", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("global  file:~/.gitconfig        user.name=Ali Valiyev", 3.7, tu, 130, 228, { color: C.yellow });
      drawOutputLine("global  file:~/.gitconfig-ish    user.email=ali@ishxona.uz", 4.0, tu, 130, 248, { color: C.cyan });
      drawOutputLine("local   file:.git/config         core.bare=false", 4.3, tu, 130, 268, { color: '#94a3b8' });
      drawOutputLine("local   file:.git/config         core.logallrefupdates=true", 4.6, tu, 130, 288, { color: '#94a3b8' });

      // 2-buyruq: git config get --show-origin user.email
      drawCommandLine("dev $ ", "git config get --show-origin user.email", 5.8, 8.0, 8.2, tu, 130, 330);
      drawOutputLine("file:~/.gitconfig-ish\tali@ishxona.uz", 8.5, tu, 130, 355, { color: C.green, weight: 700 });
      drawOutputLine("# Shartli includeIf tufayli ishxona emaili qo'llandi!", 8.8, tu, 130, 375, { color: C.yellow });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "--show-origin",
        badgeCol: C.cyan,
        title: "Fayl Manzili",
        desc: "Parametr aynan qaysi disk faylidan o'qilganini ko'rsatib, noma'lum sozlamalar chalkashligini yechadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "--show-scope",
        badgeCol: C.blue,
        title: "Darajani Ko'rish",
        desc: "Qiymat global, local, system yoki command darajasiga tegishli ekanini aniq belgilab beradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "ZANJIR TARTIBI",
        badgeCol: C.green,
        title: "O'qish Ketma-ketligi",
        desc: "Git sozlamalarni yuqoridan pastga o'qiydi. Oxirgi kelgan qiymat avvalgilarining ustiga yoziladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Shartli Konfiguratsiya: include va includeIf
  // ==========================================
  function sceneIncludeConditions(u, bounds, o = {}) {
    chip(3, "Shartli Konfiguratsiya: include va includeIf", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat ~/.gitconfig
      drawCommandLine("dev $ ", "cat ~/.gitconfig", 0.8, 2.2, 2.4, tu, 130, 205);
      drawOutputLine("[includeIf \"gitdir:~/ish/\"]", 2.7, tu, 130, 228, { color: C.yellow, weight: 700 });
      drawOutputLine("    path = ~/.gitconfig-ish", 2.9, tu, 130, 248, { color: C.cyan });
      drawOutputLine("[includeIf \"onbranch:hotfix/*\"]", 3.2, tu, 130, 268, { color: C.yellow, weight: 700 });
      drawOutputLine("    path = ~/.gitconfig-hotfix", 3.4, tu, 130, 288, { color: C.cyan });

      // 2-buyruq: cd ~/ish/loyiha && git config get user.email
      drawCommandLine("dev $ ", "cd ~/ish/mijoz && git config get user.email", 4.8, 7.2, 7.4, tu, 130, 330);
      drawOutputLine("ali@ishxona.uz", 7.7, tu, 130, 355, { color: C.green, weight: 700 });

      // 3-buyruq: cd ~/shaxsiy/blog && git config get user.email
      drawCommandLine("dev $ ", "cd ~/shaxsiy/blog && git config get user.email", 9.0, 11.4, 11.6, tu, 130, 395);
      drawOutputLine("ali@example.com (standart global profil)", 11.9, tu, 130, 420, { color: '#e2e8f0' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "includeIf \"gitdir:...\"",
        badgeCol: C.green,
        title: "Papka Bo'yicha Shart",
        desc: "Agar repo ko'rsatilgan papka ichida bo'lsa, mos sozlamalar avtomatik ulanadi (ish vs shaxsiy).",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "includeIf \"onbranch:...\"",
        badgeCol: C.orange,
        title: "Shox Bo'yicha Shart",
        desc: "hotfix/* yoki release/* shoxlarida turganda qat'iy tekshiruvlar yoki maxsus imzo kalitlarini yoqish.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "AVTOMATIK AJRATISH",
        badgeCol: C.purple,
        title: "Nol Xatolik",
        desc: "Har safar emailni qo'lda o'zgartirish shart emas — katalogga kirish bilanoq kerakli profil faollashadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Mijoz Sozlamalari: autocrlf, whitespace va autocorrect
  // ==========================================
  function sceneClientTuning(u, bounds, o = {}) {
    chip(4, "Mijoz Sozlamalari: autocrlf, whitespace va autocorrect", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config core.autocrlf
      drawCommandLine("dev $ ", "git config --global core.autocrlf input", 0.8, 3.0, 3.2, tu, 130, 205);
      drawCommandLine("dev $ ", "git config --global help.autocorrect prompt", 3.8, 6.0, 6.2, tu, 130, 245);
      drawCommandLine("dev $ ", "git config --global core.whitespace trailing-space", 6.8, 9.2, 9.4, tu, 130, 285);

      // 2-buyruq: typo test
      drawCommandLine("dev $ ", "git statsu", 10.2, 11.6, 11.8, tu, 130, 330);
      drawOutputLine("WARNING: You called a Git command that does not exist.", 12.1, tu, 130, 355, { color: C.yellow });
      drawOutputLine("Run 'status' instead? [y/N]", 12.4, tu, 130, 375, { color: C.cyan, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "core.autocrlf",
        badgeCol: C.blue,
        title: "Qator Tugashlari",
        desc: "CRLF va LF moslashuvi: Linux/macOS da input, Windows da true sozlanishi orqali diff toza saqlanadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "help.autocorrect",
        badgeCol: C.green,
        title: "Imloviy Xatolarni Tuzatish",
        desc: "Buyruq adashib terilganda (masalan pushh), Git uni avtomatik taniydi yoki prompt orqali tasdiq so'raydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "core.whitespace",
        badgeCol: C.red,
        title: "Bo'shliqlar Nazorati",
        desc: "Qator oxiridagi ortiqcha probellarni qizil bilan belgilab, toza kod yozish intizomini ta'minlaydi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Server Xavfsizligi: receive sozlamalari va fsck
  // ==========================================
  function sceneServerSecurity(u, bounds, o = {}) {
    chip(5, "Server Xavfsizligi: receive sozlamalari va fsck", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'server@hub: /srv/git/repo.git (bare)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config receive.denyNonFastForwards
      drawCommandLine("srv $ ", "git config receive.denyNonFastForwards true", 0.8, 3.2, 3.4, tu, 130, 205);
      drawCommandLine("srv $ ", "git config receive.denyDeletes true", 4.0, 6.2, 6.4, tu, 130, 245);
      drawCommandLine("srv $ ", "git config receive.fsckObjects true", 7.0, 9.2, 9.4, tu, 130, 285);

      // 2-buyruq: tekshiruv xabari
      drawOutputLine("# Server himoyasi faollashtirildi:", 10.0, tu, 130, 330, { color: C.green, weight: 700 });
      drawOutputLine("- Majburiy push (force push) bloklandi", 10.3, tu, 130, 355, { color: '#e2e8f0' });
      drawOutputLine("- Shoxlarni masofadan o'chirish taqiqlandi", 10.6, tu, 130, 375, { color: '#e2e8f0' });
      drawOutputLine("- Obyektlar bazasi har pushda to'liq tekshiriladi", 10.9, tu, 130, 395, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "denyNonFastForwards",
        badgeCol: C.red,
        title: "Tarixni Himoyalash",
        desc: "git push --force orqali boshqa jamoa a'zolarining commitlari ustiga yozib yuborilishini butunlay to'xtatadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "denyDeletes",
        badgeCol: C.orange,
        title: "Shoxlarni Saqlash",
        desc: "git push origin --delete buyrug'i orqali muhim asosiy shoxlar yo'qotilishining oldini oladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "receive.fsckObjects",
        badgeCol: C.green,
        title: "Baza Butunligi",
        desc: "Serverga push qilinayotgan har bir blob va tree obyektini tekshirib, zararlangan fayllarni rad etadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Professional Sozlash Qoidalari
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Professional Sozlash Qoidalari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config alias
      drawCommandLine("dev $ ", "git config --global alias.st 'status -sb'", 0.8, 3.0, 3.2, tu, 130, 205);
      drawCommandLine("dev $ ", "git config --global alias.lg 'log --oneline --graph -8'", 3.8, 6.2, 6.4, tu, 130, 245);

      // 2-buyruq: git st
      drawCommandLine("dev $ ", "git st", 7.2, 8.2, 8.4, tu, 130, 290);
      drawOutputLine("## main...origin/main [ahead 1]", 8.7, tu, 130, 315, { color: C.green, weight: 700 });
      drawOutputLine(" M content/git/45-config-chuqur.md", 9.0, tu, 130, 335, { color: C.yellow });
      drawOutputLine("# Qulay aliaslar va shartli profillar faol!", 9.5, tu, 130, 365, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "QULAY TAXALLUSLAR",
        badgeCol: C.blue,
        title: "Foydali Aliaslar",
        desc: "Tez-tez takrorlanadigan uzun buyruqlarni st, lg, co kabi qulay va chiroyli formatda saqlash.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "DOTFILES BOSHQARUVI",
        badgeCol: C.green,
        title: "Versiyalangan Konfig",
        desc: "Shaxsiy .gitconfig fayllarini repo orqali versiyalab, har qanday yangi qurilmada bir zumda tiklash.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "TIZIMLI INTIZOM",
        badgeCol: C.purple,
        title: "Jamoaviy Standart",
        desc: "To'g'ri sozlangan Git mijoz va server qoidalari xatoliklarni kamaytiradi va mahsuldorlikni oshiradi.",
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
      { id: 'config_intro', fn: sceneConfigIntro },
      { id: 'origin_scope', fn: sceneOriginScope },
      { id: 'include_conditions', fn: sceneIncludeConditions },
      { id: 'client_tuning', fn: sceneClientTuning },
      { id: 'server_security', fn: sceneServerSecurity },
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
    sceneConfigIntro(10.0, TM.scenes.config_intro, { isPoster: true });
  };
})();
