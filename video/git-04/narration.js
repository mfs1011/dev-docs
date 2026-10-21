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
    l2: 1.5,
    l4: 2.0,
    l6: 2.0,
    l8: 2.0,
    l10: 2.0,
    l12: 2.0
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu to‘rtinchi bobda Git repozitoriysini noldan yaratish va masofadan klonlab olishni o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Repoga ega bo‘lishning ikkita asosiy yo‘li mavjud: yangi loyiha uchun init va mavjud loyiha tarixini ko‘chirish uchun klon."
    },
    {
      id: 'l3',
      scene: 'git_init',
      text: "Git init buyrug‘i joriy papkada yashirin nuqta git katalogini yaratadi va uni to‘liq Git omboriga aylantiradi."
    },
    {
      id: 'l4',
      scene: 'git_init',
      text: "Nuqta git papkasi loyihaning butun o‘tmishi va sozlamalarini saqlaydi; unga hech qachon qo‘lda tegmaslik kerak."
    },
    {
      id: 'l5',
      scene: 'unborn_va_birinchi_commit',
      text: "Yangi repozitoriyda hali kommit bo‘lmagani sababli asosiy brench tug‘ilmagan, ya’ni anborn brench holatida turadi."
    },
    {
      id: 'l6',
      scene: 'unborn_va_birinchi_commit',
      text: "Fayllarni qo‘shib ilk rut kommitni amalga oshirishingiz bilan bosh brench rasman vujudga keladi va tarix boshlanadi."
    },
    {
      id: 'l7',
      scene: 'git_clone',
      text: "Git klon buyrug‘i serverdagi loyihaning faqat bitta versiyasini emas, balki boshidan buyon yozilgan butun tarixini ko‘chiradi."
    },
    {
      id: 'l8',
      scene: 'git_clone',
      text: "Natijada lokal kompyuteringizda server bilan to‘laqonli bog‘langan, mustaqil orijin repozitoriyasi paydo bo‘ladi."
    },
    {
      id: 'l9',
      scene: 'protokollar_va_opsiyalar',
      text: "Klonlashda eych-ti-ti-pi-es yoki xavfsiz es-es-eych kabi bir nechta tarmoq protokollaridan foydalanish mumkin."
    },
    {
      id: 'l10',
      scene: 'protokollar_va_opsiyalar',
      text: "Katta va og‘ir repozitoriylarda esa depsh bir opsiyasi orqali faqat oxirgi kommitni sayoz klonlash juda qulay."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, init va klon amallari har qanday dasturlash loyihasining eng muhim boshlang‘ich poydevoridir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi beshinchi bobda Gitdagi uchta holat va uchta hudud mexanizmini o‘rganamiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
