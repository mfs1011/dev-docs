// Git 04-bob videosi: "Repo olish: init va clone" (content/git/04-repo-olish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'git_init',
    'unborn_va_birinchi_commit',
    'git_clone',
    'protokollar_va_opsiyalar',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Repo Olishning 2 Yo‘li',
    git_init: 'git init va .git Papkasi',
    unborn_va_birinchi_commit: 'Tug‘ilmagan Brench va Ilk Commit',
    git_clone: 'git clone Mexanizmi',
    protokollar_va_opsiyalar: 'Protokollar va Sayoz Klon',
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
      text: "Salom! Ushbu to‘rtinchi bobda Git repozitoriysini yaratish va masofadan klonlab olishni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Gitda repozitoriyga ega bo‘lishning ikkita asosiy yo‘li bor: yangi loyiha uchun init va mavjud loyiha uchun klon."
    },
    {
      id: 'l3',
      scene: 'git_init',
      text: "Git init buyrug‘i joriy papkada yashirin nuqta git katalogini yaratadi va uni to‘liq repozitoriyga aylantiradi."
    },
    {
      id: 'l4',
      scene: 'git_init',
      text: "Nuqta git papkasi loyihaning butun o‘tmishini saqlaydi va unga qo‘lda tegmaslik qat’iy tavsiya etiladi."
    },
    {
      id: 'l5',
      scene: 'unborn_va_birinchi_commit',
      text: "Yangi repozitoriyda kommit bo‘lmagani uchun brench hali tug‘ilmagan holatda bo‘ladi."
    },
    {
      id: 'l6',
      scene: 'unborn_va_birinchi_commit',
      text: "Ilk fayllarni qo‘shib birinchi rut kommitni yaratishingiz bilan asosiy meyn brenchi rasman vujudga keladi."
    },
    {
      id: 'l7',
      scene: 'git_clone',
      text: "Git klon buyrug‘i esa boshqa serverdagi loyihaning nafaqat oxirgi fayllarini, balki butun tarixini to‘liq nusxalab oladi."
    },
    {
      id: 'l8',
      scene: 'git_clone',
      text: "Natijada lokal kompyuteringizda server bilan to‘laqonli bog‘langan oridjin repozitoriyasi paydo bo‘ladi."
    },
    {
      id: 'l9',
      scene: 'protokollar_va_opsiyalar',
      text: "Klonlashda eych-ti-ti-pi-es yoki xavfsiz es-es-eych protokollaridan foydalanish mumkin."
    },
    {
      id: 'l10',
      scene: 'protokollar_va_opsiyalar',
      text: "Katta loyihalarda faqat oxirgi versiya kerak bo‘lsa, depsh bir opsiyasi bilan sayoz klon olish qulay."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, init va klon buyruqlari har qanday loyiha bilan ishlashning eng birinchi debochasidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda Gitdagi uchta holat va uchta hududni tushunib olamiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
