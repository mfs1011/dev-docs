// narration.js — 48-bob: Muhit o'zgaruvchilari
(function (g) {
  const scenes = [
    'env_intro',
    'repo_paths',
    'author_override',
    'network_ssh',
    'debug_trace',
    'xulosa'
  ];

  const sceneNames = {
    env_intro: "Git Muhit O'zgaruvchilari: Xatti-harakatni Boshqarish",
    repo_paths: "Repozitoriy Joylashuvi: GIT_DIR va GIT_WORK_TREE",
    author_override: "Mualliflik va Sanani O'zgartirish: GIT_AUTHOR va COMMITTER",
    network_ssh: "Tarmoq va Xavfsizlik: GIT_SSH_COMMAND va ASKPASS",
    debug_trace: "Nosozliklarni Izlash: GIT_TRACE va TRACE2",
    xulosa: "Xulosa va Meros Qoidasi"
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
      scene: 'env_intro',
      text: "Muhit o'zgaruvchilari operatsion tizim tomonidan dasturga uzatiladigan bir martalik yoki meros bo'lib o'tuvchi parametrlardir."
    },
    {
      id: 'l2',
      scene: 'env_intro',
      text: "Gitda ushbu parametrlar konfiguratsiya fayllaridan ustun turib, skriptlar va avtomatlashtirishda beqiyos imkoniyatlar beradi."
    },
    {
      id: 'l3',
      scene: 'repo_paths',
      text: "Jiti dir va jiti vork tri o'zgaruvchilari orqali repozitoriy va ishchi papkani bir-biridan ajratilgan holda boshqarish mumkin."
    },
    {
      id: 'l4',
      scene: 'repo_paths',
      text: "Bu usul repozitoriy ichiga kirmasdan turib, istalgan katalogdan turib Git buyruqlarini xavfsiz bajarishga sharoit yaratadi."
    },
    {
      id: 'l5',
      scene: 'author_override',
      text: "Jiti avtor neym, i-meyl va sana parametrlari commit mualliflik ma'lumotlarini bir martalik buyruq darajasida o'zgartiradi."
    },
    {
      id: 'l6',
      scene: 'author_override',
      text: "Ushbu vosita tarixni import qilish yoki eski commitlar xronologiyasini qayta tiklashda keng foydalaniladi."
    },
    {
      id: 'l7',
      scene: 'network_ssh',
      text: "Jiti es-es-eych kommand o'zgaruvchisi orqali aniq bir maxfiy kalit bilan ulanish yoki tarmoq portini alohida belgilash mumkin."
    },
    {
      id: 'l8',
      scene: 'network_ssh',
      text: "Avtomatlashgan CI muhitlarida esa jiti ask-pas interaktiv so'rovlarsiz parollarni xavfsiz uzatishga xizmat qiladi."
    },
    {
      id: 'l9',
      scene: 'debug_trace',
      text: "Jiti treys barobar bir sozlamasi Gitning ichki amallari, bajarilgan tashqi buyruqlar va fayllar yo'lini to'liq fosh qiladi."
    },
    {
      id: 'l10',
      scene: 'debug_trace',
      text: "Jiti treys performens esa har bir operatsiyaning millisekundlardagi vaqtini ko'rsatib, sekinlashuvlarni aniqlashga yordam beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Muhit o'zgaruvchilarining bolalar jarayoniga meros qolishi skriptlarda yangi repo bilan ishlashda ehtiyotkorlikni talab etadi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Zarurat tug'ilganda un-set orqali ularni tozalash turli repozitoriylar o'rtasidagi ziddiyatlarning oldini oladi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
