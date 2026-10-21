// Git 08-bob videosi: ".gitignore, rm va mv" (content/git/08-gitignore-rm-mv.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'gitignore_qoidalari',
    'check_ignore',
    'git_rm',
    'git_mv',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Loyihani Toza Saqlash',
    gitignore_qoidalari: 'gitignore Qoidalari',
    check_ignore: 'git check-ignore Detektivi',
    git_rm: 'git rm va --cached Sehri',
    git_mv: 'git mv bilan Ko‘chirish',
    xulosa: 'Xulosa'
  };

  const hold = {
    l2: 1.0,
    l4: 1.0,
    l6: 1.0,
    l8: 1.0,
    l10: 1.0,
    l12: 1.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu sakkizinchi bobda loyihani keraksiz fayllardan tozalash va tartibga keltirish vositalari: gitignore, git rm va git mv buyruqlarini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Ushbu qurollar loyiha xotirasi shishib ketmasligi va maxfiy ma’lumotlar tasodifan omborga tushib qolmasligini ta’minlaydi."
    },
    {
      id: 'l3',
      scene: 'gitignore_qoidalari',
      text: "Nuqta gitignore fayli Gitga qaysi fayllarni butunlay e’tiborsiz qoldirish kerakligini aytuvchi qoidalar ro‘yxatidir."
    },
    {
      id: 'l4',
      scene: 'gitignore_qoidalari',
      text: "Yulduzcha, slesh va inkor belgisi kabi qulay shablonlar orqali papkalar yoki kengaytmalar osonlikcha filtrlanadi."
    },
    {
      id: 'l5',
      scene: 'check_ignore',
      text: "Agar biror fayl git statusda ko‘rinmay qolsa, git check-ignore buyrug‘i buni qaysi qoida sababli ekanini darhol aniqlab beradi."
    },
    {
      id: 'l6',
      scene: 'check_ignore',
      text: "Shuningdek, qisqa statusda minus minus ignord opsiyasidan foydalanib, chetlab o‘tilgan barcha fayllarni ko‘rish mumkin."
    },
    {
      id: 'l7',
      scene: 'git_rm',
      text: "Git rm buyrug‘i faylni nafaqat diskdan, balki Gitning indeks qoralamasidan ham rasman olib tashlaydi."
    },
    {
      id: 'l8',
      scene: 'git_rm',
      text: "Eng muhimi: minus minus keshd opsiyasi faylni diskda butun saqlagan holda, faqat Git nazoratidan xavfsiz chiqarib beradi."
    },
    {
      id: 'l9',
      scene: 'git_mv',
      text: "Git mv buyrug‘i fayl nomini o‘zgartirish yoki yangi papkaga ko‘chirishni bitta tezkor qadamda bajaradi."
    },
    {
      id: 'l10',
      scene: 'git_mv',
      text: "Aslida bu diskdagi ko‘chirish, eski faylni o‘chirish va yangisini qo‘shish amallarining qulay birlashmasidir."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, toza gitignore, oqilona o‘chirish va ko‘chirish — professional loyiha boshqaruvining asosidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda loyihaning butun o‘tmishini ko‘zdan kechiruvchi git log buyrug‘i bilan tanishamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
