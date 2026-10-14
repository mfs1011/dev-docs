// Umumiy vaqt jadvali: animatsiya (brauzer) va musiqa (node) ikkalasi shundan foydalanadi.
(function (g) {
  const CPS = 20; // terminalda yozish tezligi (belgi/soniya)
  const S = { intro: 0, muammo: 9, hudud: 22, commit: 52, branch: 72, remote: 115, xulosa: 140, end: 156 };
  const cmd = (t, text, out) => ({ t, text, out, end: t + text.length / CPS });

  const intro = { nodes: [0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8], title: 2.0, sub: 2.8 };
  const muammo = { files: [0.4, 1.2, 2.0, 2.8, 3.6], worry: 5.2, fly: 7.8, nodes: [8.7, 8.85, 9.0, 9.15, 9.3], head: 9.6 };

  const hudud = {
    cmds: [
      cmd(7, 'git add index.html style.css'),
      cmd(12, 'git commit -m "Bosh sahifa"', '[main a1b2c3d] Bosh sahifa'),
      cmd(19, 'git add app.js'),
      cmd(22, 'git commit -m "Tugma qo‘shildi"', '[main e4f5a6b] Tugma qo‘shildi'),
    ],
    files: 2.5, edit1: 4, edit2: 17.8,
  };
  hudud.fly1 = hudud.cmds[0].end + 0.3;
  hudud.snap1 = hudud.cmds[1].end + 0.3;
  hudud.node1 = hudud.snap1 + 1.4;
  hudud.fly2 = hudud.cmds[2].end + 0.3;
  hudud.snap2 = hudud.cmds[3].end + 0.3;
  hudud.node2 = hudud.snap2 + 1.4;

  const commit = { rows: [1, 1.55, 2.1, 2.65, 3.2, 3.75], chain: [7, 7.3, 7.6], link: 8.6, parent: 9.5, travel: 15 };

  const branch = {
    cmds: [
      cmd(6, 'git branch feature'),
      cmd(9.5, 'git switch feature', "Switched to branch 'feature'"),
      cmd(12.5, 'git commit -m "Yangi menyu"', '[feature 3c4d5e6] Yangi menyu'),
      cmd(16.5, 'git commit -m "Menyu stili"', '[feature 8a9b0c1] Menyu stili'),
      cmd(26, 'git switch main', "Switched to branch 'main'"),
      cmd(29, 'git commit -m "Tezkor tuzatish"', '[main 5f6a7b8] Tezkor tuzatish'),
      cmd(33.5, 'git merge feature', "Merge made by the 'ort' strategy."),
    ],
    base: [0.2, 0.5, 0.8], mainPill: 1.3, head: 1.8, mergeChip: 25, conflict: 38.5,
  };
  const bc = branch.cmds;
  branch.feat = bc[0].end + 0.2;
  branch.sw1 = bc[1].end + 0.2;
  branch.f1 = bc[2].end + 0.25;
  branch.f2 = bc[3].end + 0.25;
  branch.sw2 = bc[4].end + 0.2;
  branch.c4 = bc[5].end + 0.25;
  branch.m = bc[6].end + 0.25;

  const remote = {
    cmds: [
      cmd(3, 'git push origin main', '   e4f5a6b..9d0e1f2  main -> main'),
      cmd(13, 'git pull', 'Fast-forward'),
    ],
    mate: 8.5, mateSend: 10, fetchMerge: 18.3,
  };
  remote.push = remote.cmds[0].end + 0.25;
  remote.pull = remote.cmds[1].end + 0.3;

  const xulosa = { stations: [0.4, 0.75, 1.1, 1.45, 1.8], outro: 9.5, thanks: 10.5 };

  // Subtitrlar (sahna ichidagi vaqt, soniya): [boshlanish, tugash, matn]. `...` — buyruq/kod.
  // Ovoz (voice.mjs), VTT va vaqtni cho'zish (warp) shu ro'yxatdan o'qiydi.
  const captions = {
    muammo: [
      [0.3, 5.0, 'Tanish holat: bitta faylning o‘nlab nusxalari…'],
      [5.0, 7.8, 'Qaysi biri oxirgisi? Nima o‘zgardi? Kim o‘zgartirdi?'],
      [7.8, 12.6, 'Git har bir holatni tartibli tarixga yozadi — nusxa ko‘paytirish shart emas.'],
    ],
    hudud: [
      [0.3, 3.6, 'Git’da o‘zgarish uch joydan o‘tadi.'],
      [3.6, 7.0, 'Ishchi papka — fayllarni tahrirlaydigan joyingiz.'],
      [7.0, 12.0, '`git add` o‘zgarishni staging’ga qo‘yadi: «keyingi commit’ga shu kirsin».'],
      [12.0, 17.6, '`git commit` staging’dagi holatni surat (snapshot) qilib, tarixga yozadi.'],
      [17.6, 26.0, 'Yana tahrirlash → `git add` → `git commit`. Yangi commit oldingisiga bog‘lanadi.'],
      [26.0, 29.6, 'Tahrirlash → add → commit: Git bilan ishlashning asosiy sikli.'],
    ],
    commit: [
      [0.3, 4.4, 'Commit — loyihaning ma’lum paytdagi to‘liq surati (snapshot).'],
      [4.4, 9.4, 'Unda muallif, sana, xabar va ota-commit saqlanadi; nomi — noyob hash.'],
      [9.4, 15.0, 'Har commit o‘z ota-commit’ini ko‘rsatadi — shu tariqa tarix zanjiri hosil bo‘ladi.'],
      [15.0, 19.6, 'Shu zanjir tufayli istalgan avvalgi holatni ko‘rish yoki unga qaytish mumkin.'],
    ],
    branch: [
      [0.3, 3.0, 'Bu — main branch’dagi commit’lar.'],
      [3.0, 6.0, 'Branch — commit’ni ko‘rsatib turuvchi yengil ko‘rsatkich.\nHEAD — hozir qaysi branch’da turganingiz.'],
      [6.0, 9.5, '`git branch feature` — yangi ko‘rsatkich yaratadi. Fayllar nusxalanmaydi.'],
      [9.5, 12.5, '`git switch feature` — HEAD endi feature’ni ko‘rsatadi.'],
      [12.5, 19.0, 'Yangi commit’lar feature’ni oldinga suradi, HEAD unga ergashadi.'],
      [19.0, 24.6, 'main esa joyida qoldi: yangi ishni asosiy koddan alohida, xavfsiz qilasiz.'],
      [25.0, 29.0, 'Ish tayyor. Uni main’ga qo‘shamiz: avval `git switch main`.'],
      [29.0, 33.5, 'Bu orada main’da ham yangi commit paydo bo‘ldi.'],
      [33.5, 38.5, '`git merge feature` — ikki tarixni birlashtiradi.\nMerge commit’ning ikkita ota-commit’i bor.'],
      [38.5, 42.6, 'Ikki branch bir qatorni turlicha o‘zgartirgan bo‘lsa — konflikt.\nGit to‘xtaydi va qaysi variant qolishini sizga qoldiradi.'],
    ],
    remote: [
      [0.3, 3.0, 'Git taqsimlangan: har kompyuterda tarixning to‘liq nusxasi bor.'],
      [3.0, 8.4, '`git push` — commit’laringizni remote’ga (masalan, GitHub’ga) yuboradi.'],
      [8.4, 13.0, 'Jamoadoshingiz ham o‘z commit’ini push qildi…'],
      [13.0, 18.2, '`git pull` — remote’dagi yangi commit’larni olib, branch’ingizga qo‘shadi.'],
      [18.2, 24.6, 'Aslida pull ikki qadam: `git fetch` (yuklab olish) + `git merge` (birlashtirish).'],
    ],
    xulosa: [
      [0.4, 5.0, 'Har kungi sikl: tahrirlash → `git add` → `git commit` → `git push`.'],
      [5.0, 9.4, 'Jamoadan yangilik olish — `git pull`. Alohida ish uchun — branch.'],
    ],
  };

  // Ovozli hikoya matni — eshitish uchun yozilgan (subtitr ko'z uchun, bu quloq uchun): to'liq jumlalar,
  // belgilarsiz. Oynalar captions bilan bir xil + kirish va xotima. CC subtitri ham shu matnni ko'rsatadi.
  const narration = {
    intro: [
      [1.0, 8.6, 'Salom! Bu videoda Git qanday ishlashini oddiy misollar bilan ko‘rib chiqamiz.'],
    ],
    muammo: [
      [0.3, 5.0, 'Ko‘pchilikka tanish holat: bitta faylning nusxalari ko‘payib ketaveradi. Yangisi, yakuniysi, yana bitta yakuniysi…'],
      [5.0, 7.8, 'Endi qaysi biri oxirgisi? Nima o‘zgardi, kim o‘zgartirdi? Buni bilish qiyin.'],
      [7.8, 12.6, 'Git aynan shu muammoni hal qiladi. U loyihaning har bir holatini tartib bilan tarixga yozib boradi.'],
    ],
    hudud: [
      [0.3, 3.6, 'Git’da har bir o‘zgarish uch bosqichdan o‘tadi.'],
      [3.6, 7.0, 'Birinchisi — ishchi papka. Siz fayllarni shu yerda tahrirlaysiz.'],
      [7.0, 12.0, 'Keyin git add buyrug‘i bilan o‘zgarishni staging degan joyga qo‘yasiz. Bu bilan Git’ga aytasiz: keyingi commit’ga mana shular kirsin.'],
      [12.0, 17.6, 'git commit buyrug‘i esa staging’dagi holatni suratga oladi va uni tarixga saqlab qo‘yadi.'],
      [17.6, 26.0, 'Yana bitta faylni o‘zgartiramiz, add qilamiz va commit qilamiz. Yangi commit avvalgisiga ulanadi.'],
      [26.0, 29.6, 'Tahrirlash, add, commit. Git bilan ishlash asosan shu uch qadamdan iborat.'],
    ],
    commit: [
      [0.3, 4.4, 'Xo‘sh, commit’ning o‘zi nima? Bu loyihaning ma’lum bir paytdagi to‘liq surati.'],
      [4.4, 9.4, 'Unda kim, qachon va nima uchun o‘zgartirgani yoziladi. Har bir commit’ning o‘z noyob raqami bor, uni hash deyiladi.'],
      [9.4, 15.0, 'Har bir commit o‘zidan oldingisiga, ya’ni ota commit’ga ishora qiladi. Shu tarzda tarix zanjiri hosil bo‘ladi.'],
      [15.0, 19.6, 'Shu zanjir tufayli istalgan paytda avvalgi holatga qarash yoki unga qaytish mumkin.'],
    ],
    branch: [
      [0.3, 3.0, 'Mana, main branch’dagi commit’lar.'],
      [3.0, 6.0, 'Branch — bu bitta commit’ni ko‘rsatib turadigan yengil belgi, xolos. HEAD esa siz hozir qaysi branch’da turganingizni bildiradi.'],
      [6.0, 9.5, 'git branch feature buyrug‘i yangi branch yaratadi. Bunda fayllar nusxalanmaydi, faqat yangi belgi paydo bo‘ladi.'],
      [9.5, 12.5, 'git switch bilan feature’ga o‘tamiz. Endi HEAD feature’ni ko‘rsatadi.'],
      [12.5, 19.0, 'Yangi commit’lar feature’ni oldinga suradi. HEAD ham u bilan birga yuradi.'],
      [19.0, 24.6, 'main esa joyida qoldi. Demak, yangi ishni asosiy kodga tegmasdan, xavfsiz sinab ko‘rishingiz mumkin.'],
      [25.0, 29.0, 'Ish tayyor bo‘lgach, uni main’ga qo‘shamiz. Buning uchun avval main’ga qaytamiz.'],
      [29.0, 33.5, 'Bu orada main’da ham yangi commit paydo bo‘ldi.'],
      [33.5, 38.5, 'git merge feature buyrug‘i ikki tarixni birlashtiradi. Hosil bo‘lgan merge commit’ning ikkita ota commit’i bo‘ladi.'],
      [38.5, 42.6, 'Agar ikkala branch bitta qatorni har xil o‘zgartirgan bo‘lsa, konflikt yuz beradi. Shunda Git to‘xtaydi va qaysi variant qolishini sizdan so‘raydi.'],
    ],
    remote: [
      [0.3, 3.0, 'Git — taqsimlangan tizim. Har bir kompyuterda loyiha tarixining to‘liq nusxasi saqlanadi.'],
      [3.0, 8.4, 'git push buyrug‘i sizning commit’laringizni masofaviy repozitoriyga, masalan GitHub’ga yuboradi.'],
      [8.4, 13.0, 'Bu orada jamoadoshingiz ham o‘z commit’ini yubordi.'],
      [13.0, 18.2, 'git pull esa masofaviy repozitoriydagi yangi commit’larni olib keladi va sizning branch’ingizga qo‘shadi.'],
      [18.2, 24.6, 'Aslida pull ikki ishni bajaradi. Avval fetch bilan yangiliklarni yuklab oladi, keyin merge bilan birlashtiradi.'],
    ],
    xulosa: [
      [0.4, 5.0, 'Xulosa qilsak, kundalik ish shunday: tahrirlaysiz, add qilasiz, commit qilasiz va push qilasiz.'],
      [5.0, 9.4, 'Jamoadan yangiliklarni olish uchun pull qilasiz. Yangi ishni esa alohida branch’da boshlaysiz.'],
      [10.6, 15.4, 'E’tiboringiz uchun rahmat! Batafsil ma’lumotni saytdagi Git qo‘llanmasidan topasiz.'],
    ],
  };

  // Ovoz effektlari uchun belgilar (global vaqtda)
  const cues = [];
  const add = (t, type) => cues.push({ t, type });
  [S.muammo, S.hudud, S.commit, S.branch, S.branch + branch.mergeChip, S.remote, S.xulosa].forEach((t) => add(t + 0.15, 'chime'));
  const typing = (base, cmds) => cmds.forEach((c) => {
    for (let i = 0; i < c.text.length; i++) if (c.text[i] !== ' ') add(base + c.t + i / CPS, 'tick');
  });
  typing(S.hudud, hudud.cmds); typing(S.branch, branch.cmds); typing(S.remote, remote.cmds);

  add(S.intro + intro.title - 0.05, 'swell');
  intro.nodes.forEach((t) => add(S.intro + t, 'pop'));
  add(S.muammo + muammo.worry, 'worry');
  add(S.muammo + muammo.fly, 'whoosh');
  muammo.nodes.forEach((t) => add(S.muammo + t, 'pop'));
  add(S.hudud + hudud.fly1, 'whoosh'); add(S.hudud + hudud.fly2, 'whoosh');
  add(S.hudud + hudud.snap1 + 0.45, 'snap'); add(S.hudud + hudud.snap2 + 0.45, 'snap');
  add(S.hudud + hudud.node1, 'pop'); add(S.hudud + hudud.node2, 'pop');
  [hudud.edit1, hudud.edit2].forEach((t) => add(S.hudud + t, 'blip'));
  commit.chain.forEach((t) => add(S.commit + t, 'pop'));
  add(S.commit + commit.parent, 'blip'); add(S.commit + commit.travel + 0.3, 'whoosh');
  branch.base.forEach((t) => add(S.branch + t, 'pop'));
  [branch.feat, branch.f1, branch.f2, branch.c4].forEach((t) => add(S.branch + t, 'pop'));
  [branch.sw1, branch.sw2].forEach((t) => add(S.branch + t, 'whoosh'));
  add(S.branch + branch.m, 'big');
  add(S.branch + branch.conflict, 'worry');
  add(S.remote + remote.push, 'whoosh');
  add(S.remote + remote.push + 1.1, 'pop'); add(S.remote + remote.push + 1.35, 'pop');
  add(S.remote + remote.mateSend, 'whoosh'); add(S.remote + remote.mateSend + 1.0, 'pop');
  add(S.remote + remote.pull, 'whoosh'); add(S.remote + remote.pull + 1.1, 'pop');
  xulosa.stations.forEach((t) => add(S.xulosa + t, 'pop'));
  add(S.xulosa + xulosa.thanks - 0.05, 'swell');
  cues.sort((a, b) => a.t - b.t);

  // Vaqtni cho'zish: build-voice.mjs ovozga moslab yaratgan voice/warp.js — [[yangi, eski], ...] tugunlar.
  // Animatsiya va effektlar eski vaqtda yozilgan; video yangi vaqtda. warp bo'lmasa — o'zgarishsiz.
  const lerpKnots = (knots, x, from, to) => {
    if (!knots) return x;
    for (let i = 1; i < knots.length; i++) {
      const a = knots[i - 1], b = knots[i];
      if (x <= b[from] || i === knots.length - 1) return a[to] + ((x - a[from]) / (b[from] - a[from] || 1)) * (b[to] - a[to]);
    }
    return x;
  };
  const toOld = (t) => lerpKnots(g.TL.warp, t, 0, 1);
  const toNew = (t) => lerpKnots(g.TL.warp, t, 1, 0);

  g.TL = { CPS, S, intro, muammo, hudud, commit, branch, remote, xulosa, captions, narration, cues, burnCaptions: true, warp: g.TL?.warp ?? null, toOld, toNew };
})(typeof window !== 'undefined' ? window : globalThis);
