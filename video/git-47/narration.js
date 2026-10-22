// narration.js — 47-bob: Hook'lar
(function (g) {
  const scenes = [
    'hook_intro',
    'client_hooks',
    'hooks_sharing',
    'server_hooks',
    'config_hooks',
    'xulosa'
  ];

  const sceneNames = {
    hook_intro: "Git Hooklari Nima: Avtomatik Qorovullar",
    client_hooks: "Klient Hooklari: pre-commit va commit-msg",
    hooks_sharing: "Hooklarni Ulashish: core.hooksPath",
    server_hooks: "Server Hooklari: pre-receive va update",
    config_hooks: "Git Konfiguratsiyasidagi Hooklar: hook.command",
    xulosa: "Xulosa va Xavfsizlik Zanjiri"
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
      scene: 'hook_intro',
      text: "Git hooklari repozitoriyda ro'y beradigan har bir muhim amal chog'ida avtomatik ishga tushuvchi skriptlardir."
    },
    {
      id: 'l2',
      scene: 'hook_intro',
      text: "Ular dasturchi xatosini erta aniqlash, formatlashni tekshirish yoki serverda qat'iy qoidalarni joriy qilish uchun xizmat qiladi."
    },
    {
      id: 'l3',
      scene: 'client_hooks',
      text: "Pre-commit hooki commit yaratilishidan oldin testlar, linter va sintaksis tozaligini avtomatik tekshirib chiqadi."
    },
    {
      id: 'l4',
      scene: 'client_hooks',
      text: "Commit-msg esa xabar formati, masalan Jira chipta raqami yoki standart talablariga mosligini qat'iy nazorat qiladi."
    },
    {
      id: 'l5',
      scene: 'hooks_sharing',
      text: "Nuqta git hooks papkasi klon bilan ko'chmagani sababli, skriptlarni loyiha ichidagi maxsus papkada saqlash qulaydir."
    },
    {
      id: 'l6',
      scene: 'hooks_sharing',
      text: "Core nuqta hooksPath sozlamasi orqali jamoaviy hooklar barcha ishlab chiquvchilar uchun osonlikcha faollashtiriladi."
    },
    {
      id: 'l7',
      scene: 'server_hooks',
      text: "Markaziy serverda ishlovchi pre-receive hooki butun push bo'yicha kirib kelayotgan barcha ref va commitlarni tekshiradi."
    },
    {
      id: 'l8',
      scene: 'server_hooks',
      text: "Agar birorta qoida buzilsa, butun push bekor qilinadi va mijoz konsoliga batafsil tushuntirish xabari qaytariladi."
    },
    {
      id: 'l9',
      scene: 'config_hooks',
      text: "Yangi Git versiyalarida alohida fayl yaratmasdan, bevosita git config orqali ham buyruqli hooklar biriktirish mumkin."
    },
    {
      id: 'l10',
      scene: 'config_hooks',
      text: "Ushbu moslashuvchan mexanizm bitta hodisaga bir nechta mustaqil tekshiruv skriptlarini navbat bilan ulash imkonini beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Klient hooklari dasturchiga yordam beradi, server hooklari esa ta'minot zanjiri va repo xavfsizligining so'nggi qalqonidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Ikkala bosqichni uyg'un qo'llash orqali jamoaviy kod sifati va ishlab chiqish madaniyati eng yuqori darajaga ko'tariladi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
