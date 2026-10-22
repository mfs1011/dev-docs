// anim.js — 44-bob: Imzolash
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
  // 1-SAHNA: Nega Imzolash Kerak: Xesh va Mualliflik
  // ==========================================
  function sceneImzolashIntro(u, bounds, o = {}) {
    chip(1, "Nega Imzolash Kerak: Xesh va Mualliflik", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log -1 --pretty=fuller
      drawCommandLine("dev $ ", "git log -1 --pretty=fuller", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("commit 3cadc6d33292b30230f870184dcb5dbe05df687e", 3.0, tu, 130, 228, { color: C.yellow });
      drawOutputLine("Author:     Ali Valiyev <ali@example.com>", 3.2, tu, 130, 248, { color: '#e2e8f0' });
      drawOutputLine("Commit:     Ali Valiyev <ali@example.com>", 3.4, tu, 130, 268, { color: '#94a3b8' });
      drawOutputLine("    Muhim moliyaviy modul o'zgarishi", 3.6, tu, 130, 298, { color: C.cyan });

      // 2-buyruq: git config user.name "Boshqa Shaxs"
      drawCommandLine("dev $ ", "git config user.name 'Begona Foydalanuvchi'", 4.8, 7.0, 7.2, tu, 130, 340);
      drawOutputLine("# Muallif qatoriga istalgan nom va email yozish mumkin!", 7.5, tu, 130, 365, { color: C.red, weight: 700 });
      drawOutputLine("# Hash yaxlitlikni bildiradi, lekin haqiqiy muallifni emas.", 7.8, tu, 130, 385, { color: C.orange });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "XESH NIMA BERADI?",
        badgeCol: C.blue,
        title: "Yaxlitlik Kafolati",
        desc: "Git commit xeshi mazmun o'zgarmaganini tekshiradi. Ammo author va committer oddiy ochiq matn bo'lib, oson soxtalashtiriladi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "MUALLIFLIK ISBOTI",
        badgeCol: C.yellow,
        title: "Raqamli Imzo Ehtiyoji",
        desc: "Commit haqiqatan ishonchli shaxs tomonidan yaratilganini matematik isbotlash uchun kriptografik imzo talab etiladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "MAXFIY VA OMMAVIY KALIT",
        badgeCol: C.green,
        title: "Asimmetrik Kriptografiya",
        desc: "Maxfiy kalit faqat sizda qoladi va muhr bosadi. Ommaviy kalit esa hamkorlar yoki GitHub ga berilib, imzo tekshiriladi.",
        p: eo(P(u, 7.5, 0.5))
      });
    });
  }

  // ==========================================
  // 2-SAHNA: SSH Kalitlari Bilan Imzolash: gpg.format=ssh
  // ==========================================
  function sceneSshSigning(u, bounds, o = {}) {
    chip(2, "SSH Kalitlari Bilan Imzolash: gpg.format=ssh", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git config gpg.format ssh
      drawCommandLine("dev $ ", "git config gpg.format ssh", 0.8, 2.5, 2.7, tu, 130, 205);
      drawCommandLine("dev $ ", "git config user.signingkey ~/.ssh/ali_ed25519.pub", 3.2, 5.5, 5.7, tu, 130, 245);

      // 2-buyruq: ssh-keygen -lf
      drawCommandLine("dev $ ", "ssh-keygen -lf ~/.ssh/ali_ed25519.pub", 6.5, 8.5, 8.7, tu, 130, 285);
      drawOutputLine("256 SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPw... ali@example.com (ED25519)", 9.0, tu, 130, 310, { color: C.cyan, size: 12 });

      // 3-buyruq: git config --get gpg.format
      drawCommandLine("dev $ ", "git config --get gpg.format", 9.8, 11.2, 11.4, tu, 130, 350);
      drawOutputLine("ssh", 11.7, tu, 130, 375, { color: C.green, weight: 700 });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "GIT 2.34+ IMKONIYATI",
        badgeCol: C.cyan,
        title: "SSH Bilan Imzolash",
        desc: "Alohida GPG o'rnatmasdan, kundalik serverlarga ulanish uchun ishlatiladigan odatiy SSH kalitlari bilan imzo qo'yish mumkin.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "gpg.format = ssh",
        badgeCol: C.blue,
        title: "Standart Format",
        desc: "Nomida gpg saqlansa ham, format ssh ga o'rnatilgach Git barcha imzo amallarini ssh-keygen orqali amalga oshiradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "user.signingkey",
        badgeCol: C.purple,
        title: "Ommaviy Kalit Havolasi",
        desc: "Sozlamaga .pub ommaviy kalit fayli ko'rsatiladi. Maxfiy kalit diskda 600 huquqi bilan qat'iy himoyalangan bo'ladi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 3-SAHNA: Imzoli Commit va Teglar: -S va -s bayroqlari
  // ==========================================
  function sceneCommitTagSign(u, bounds, o = {}) {
    chip(3, "Imzoli Commit va Teglar: -S va -s bayroqlari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git commit -S -m
      drawCommandLine("dev $ ", "git commit -S -m 'Versiya 1.0 yakuni'", 0.8, 3.0, 3.2, tu, 130, 205);
      drawOutputLine("[main cf38cff] Versiya 1.0 yakuni", 3.5, tu, 130, 228, { color: C.green });

      // 2-buyruq: git cat-file -p HEAD
      drawCommandLine("dev $ ", "git cat-file -p HEAD", 4.5, 6.0, 6.2, tu, 130, 265);
      drawOutputLine("tree 91448fa58a4...", 6.5, tu, 130, 290, { color: '#94a3b8' });
      drawOutputLine("parent 3c892b10a...", 6.7, tu, 130, 310, { color: '#94a3b8' });
      drawOutputLine("author Ali Valiyev <ali@example.com>", 6.9, tu, 130, 330, { color: '#cbd5e1' });
      drawOutputLine("gpgsig -----BEGIN SSH SIGNATURE-----", 7.2, tu, 130, 350, { color: C.yellow, weight: 700 });
      drawOutputLine(" U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAg...", 7.4, tu, 130, 370, { color: '#64748b', size: 12 });
      drawOutputLine(" -----END SSH SIGNATURE-----", 7.6, tu, 130, 390, { color: C.yellow });

      // 3-buyruq: git tag -s
      drawCommandLine("dev $ ", "git tag -s v1.0.0 -m 'Rasmiy reliz'", 8.8, 11.0, 11.2, tu, 130, 430);
      drawOutputLine("# Annotated teg raqamli imzo bilan saqlandi!", 11.5, tu, 130, 455, { color: C.cyan });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "git commit -S",
        badgeCol: C.green,
        title: "Katta -S Bayrog'i",
        desc: "Commit obyektining gpgsig sarlavhasiga raqamli imzo joylaydi. Har commitda yozmaslik uchun: commit.gpgSign=true.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "git tag -s",
        badgeCol: C.yellow,
        title: "Kichik -s Bayrog'i",
        desc: "Rasmiy versiyalar (relizlar) uchun annotated tegga imzo chekadi. Imzo to'g'ridan-to'g'ri teg obyekti ichida turadi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "gpgsig SARLAVHASI",
        badgeCol: C.blue,
        title: "Obyekt Ichidagi Imzo",
        desc: "Imzo alohida fayl emas — commit matnining ajralmas qismiga aylanadi va commit xeshini shakllantirishda ishtirok etadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 4-SAHNA: Imzoni Tekshirish: git log --show-signature
  // ==========================================
  function sceneSignatureVerify(u, bounds, o = {}) {
    chip(4, "Imzoni Tekshirish: git log --show-signature", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git log --show-signature -1
      drawCommandLine("dev $ ", "git log --show-signature -1", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("commit cf38cff89a1...", 3.0, tu, 130, 228, { color: C.yellow });
      drawOutputLine("Good \"git\" signature for ali@example.com with ED25519 key ...", 3.3, tu, 130, 250, { color: C.green, weight: 700 });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 3.6, tu, 130, 270, { color: '#e2e8f0' });

      // 2-buyruq: git log --show-signature -1 begona
      drawCommandLine("dev $ ", "git log --show-signature -1 begona-shox", 4.8, 7.0, 7.2, tu, 130, 310);
      drawOutputLine("commit 3cadc6d33292...", 7.5, tu, 130, 335, { color: C.yellow });
      drawOutputLine("Good \"git\" signature with ED25519 key SHA256:Gk5Fk...", 7.8, tu, 130, 355, { color: C.orange });
      drawOutputLine("No principal matched.", 8.1, tu, 130, 375, { color: C.red, weight: 700 });
      drawOutputLine("Author: Ali Valiyev <ali@example.com>", 8.4, tu, 130, 395, { color: '#94a3b8' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "IKKI BOSQICH",
        badgeCol: C.blue,
        title: "To'g'rilik va Ishonch",
        desc: "Git avval imzo matematik to'g'riligini (Good signature), so'ngra kalit ruxsat etilgan shaxsga tegishliligini tekshiradi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "No principal matched",
        badgeCol: C.red,
        title: "Begona Kalit Xavfi",
        desc: "Muallif satrida Ali nomi bo'lsa ham, begona kalit bilan imzolangan bo'lsa Git 'No principal matched' ogohlantirishini beradi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "VERIFIED STATUSA",
        badgeCol: C.green,
        title: "Buzilmas Kafolat",
        desc: "Faqat ikkala shart bajarilgandagina commit to'liq ishonchli deb topiladi va jamoa bazasiga xavfsiz qabul qilinadi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 5-SAHNA: Ishonchli Imzolar Fayli: allowed_signers
  // ==========================================
  function sceneAllowedSigners(u, bounds, o = {}) {
    chip(5, "Ishonchli Imzolar Fayli: allowed_signers", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: cat .allowed_signers
      drawCommandLine("dev $ ", "cat .git_allowed_signers", 0.8, 2.5, 2.7, tu, 130, 205);
      drawOutputLine("ali@example.com  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMg...", 3.0, tu, 130, 228, { color: C.green, size: 12 });
      drawOutputLine("vali@example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPq...", 3.2, tu, 130, 248, { color: C.green, size: 12 });

      // 2-buyruq: git config gpg.ssh.allowedSignersFile
      drawCommandLine("dev $ ", "git config gpg.ssh.allowedSignersFile .git_allowed_signers", 4.2, 7.2, 7.4, tu, 130, 285);
      drawOutputLine("# Ishonchli kalitlar ro'yxati sozlandi!", 7.7, tu, 130, 310, { color: C.cyan });

      // 3-buyruq: git tag -v v1.0.0
      drawCommandLine("dev $ ", "git tag -v v1.0.0", 8.8, 10.5, 10.7, tu, 130, 350);
      drawOutputLine("Good \"git\" signature for ali@example.com with ED25519 key ...", 11.0, tu, 130, 375, { color: C.green, weight: 700 });
      drawOutputLine("tag v1.0.0, Rasmiy reliz", 11.3, tu, 130, 395, { color: '#e2e8f0' });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "allowed_signers",
        badgeCol: C.green,
        title: "Ishonchli Shaxslar Fayli",
        desc: "Jamoa a'zolarining email va ommaviy SSH kalitlarini bitta faylga jamlab, repoda yoki mahalliy tizimda saqlash mumkin.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "gpg.ssh.allowedSignersFile",
        badgeCol: C.purple,
        title: "Tekshiruv Manbai",
        desc: "Git ushbu fayldan foydalanib, kim qaysi commitga qonuniy imzo qo'yish vakolatiga ega ekanini aniqlaydi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "git tag -v",
        badgeCol: C.cyan,
        title: "Teglarni Tekshirish",
        desc: "git tag -v relizning soxtalashtirilmaganini va aynan ruxsat berilgan dasturchi tomonidan chiqarilganini tasdiqlaydi.",
        p: eo(P(u, 8.0, 0.5))
      });
    });
  }

  // ==========================================
  // 6-SAHNA: Xulosa va Jamoaviy Xavfsizlik Qoidalari
  // ==========================================
  function sceneXulosa(u, bounds, o = {}) {
    chip(6, "Xulosa va Jamoaviy Xavfsizlik Qoidalari", u, 0.4);

    const kBox = o.isPoster ? 1 : eo(P(u, 0.6, 0.6));
    withA(kBox, () => {
      // Chap panel: Terminal
      terminal(100, 140, 840, 680, {
        title: 'dev@laptop: ~/loyiha (main)',
        p: kBox
      });

      const tu = u;

      // 1-buyruq: git merge --verify-signatures
      drawCommandLine("dev $ ", "git merge --verify-signatures release-1.2", 0.8, 3.2, 3.4, tu, 130, 205);
      drawOutputLine("Signature verified: Ali Valiyev (ED25519)", 3.8, tu, 130, 228, { color: C.green, weight: 700 });
      drawOutputLine("Merge made by the 'ort' strategy.", 4.1, tu, 130, 248, { color: '#94a3b8' });

      // 2-buyruq: git log --show-signature
      drawCommandLine("dev $ ", "git log --oneline --show-signature -2", 5.5, 7.8, 8.0, tu, 130, 285);
      drawOutputLine("cf38cff (HEAD -> main) [Good signature] Versiya 1.0 yakuni", 8.3, tu, 130, 310, { color: C.cyan });
      drawOutputLine("3c892b1 [Good signature] Xavfsizlik moduli qo'shildi", 8.6, tu, 130, 330, { color: C.cyan });
      drawOutputLine("# Barcha commitlar tasdiqlangan va xavfsiz!", 9.0, tu, 130, 355, { color: C.green });

      // O'ng panel: Kartalar
      card(980, 140, 840, 205, {
        badge: "--verify-signatures",
        badgeCol: C.blue,
        title: "Avtomatik Darvoza",
        desc: "git merge --verify-signatures imzosiz yoki begona kalitli branchlarni asosiy zanjirga kirishini qat'iy to'xtatadi.",
        p: eo(P(u, 1.0, 0.5))
      });

      card(980, 375, 840, 205, {
        badge: "VERIFIED NISHONI",
        badgeCol: C.green,
        title: "GitHub va GitLab",
        desc: "Ommaviy kalitingizni serverga kiritgach, barcha imzolangan commitlar yonida yashil 'Verified' nishoni paydo bo'ladi.",
        p: eo(P(u, 4.5, 0.5))
      });

      card(980, 610, 840, 210, {
        badge: "ZANJIR XAVFSIZLIGI",
        badgeCol: C.purple,
        title: "Ta'minot Zanjiri Himoyasi",
        desc: "Raqamli imzo — ochiq kodli va korporativ loyihalarda begona soxta kodlar kirib qolishiga qarshi eng mustahkam qalqondir.",
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
      { id: 'imzolash_intro', fn: sceneImzolashIntro },
      { id: 'ssh_signing', fn: sceneSshSigning },
      { id: 'commit_tag_sign', fn: sceneCommitTagSign },
      { id: 'signature_verify', fn: sceneSignatureVerify },
      { id: 'allowed_signers', fn: sceneAllowedSigners },
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
    sceneCommitTagSign(10.0, TM.scenes.commit_tag_sign, { isPoster: true });
  };
})();
