// narration.js — 37-bob: Interaktiv staging
(function (g) {
  const scenes = [
    'intro',
    'git_add_i',
    'git_add_p_hunks',
    'hunk_split_edit',
    'bitta_fayl_ikki_holat',
    'boshqa_patch_buyruqlar'
  ];

  const sceneNames = {
    intro: 'Atomar Commit va Interaktiv Staging',
    git_add_i: 'git add -i Menyu Tizimi',
    git_add_p_hunks: 'git add -p va Hunk Tanlash',
    hunk_split_edit: 'Hunklarni Bo‘lish va Tahrirlash',
    bitta_fayl_ikki_holat: 'Bitta Fayl Ikki Holatda',
    boshqa_patch_buyruqlar: 'Boshqa Patch Buyruqlari va Xulosa'
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
      text: "Salom! Ushbu o‘ttiz yettinchi bobda bir fayl ichidagi turli o‘zgarishlarni bo‘laklab indexga olish, ya'ni interaktiv staging usulini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Kod yozayotganda tuzatishlar va vaqtinchalik debug qatorlari aralashib ketadi, yaxshi commit esa faqat bitta mantiqiy mavzudan iborat bo‘lishi lozim."
    },
    {
      id: 'l3',
      scene: 'git_add_i',
      text: "Git add minus i buyrug‘i qulay matnli menyu ochib, fayllarni to‘liq yoki qisman boshqarish, stage qilish va bekor qilish imkonini beradi."
    },
    {
      id: 'l4',
      scene: 'git_add_i',
      text: "Ushbu menyudagi status va update amallari orqali istalgan fayllar guruhini raqamlar yoki oraliqlar yordamida tezda tanlab olish mumkin."
    },
    {
      id: 'l5',
      scene: 'git_add_p_hunks',
      text: "Kundalik ishda eng ko‘p qo‘llanadigan vosita bu git add minus p bo‘lib, u faylni alohida xanklarga ajratib, har birini so‘raydi."
    },
    {
      id: 'l6',
      scene: 'git_add_p_hunks',
      text: "Foydalanuvchi y harfi bilan kerakli bo‘lakni qabul qiladi, n bilan tashlab ketadi, q bilan esa jarayonni istalgan payt to‘xtata oladi."
    },
    {
      id: 'l7',
      scene: 'hunk_split_edit',
      text: "Agar bitta bo‘lak ichida bir nechta mustaqil o‘zgarish bo‘lsa, s harfi orqali uni yanada kichikroq xanklarga bo‘lib tashlaymiz."
    },
    {
      id: 'l8',
      scene: 'hunk_split_edit',
      text: "Qo‘shni qatorlardagi vaqtinchalik debug yozuvlarini esa e harfi yordamida muharrirda ochib, indexga kiritmasdan o‘chirib yuboramiz."
    },
    {
      id: 'l9',
      scene: 'bitta_fayl_ikki_holat',
      text: "Natijada bitta fayl bir vaqtning o‘zida ham staged, ham unstaged holatida bo‘lib, sof o‘zgarishlar alohida atomar commit qilinadi."
    },
    {
      id: 'l10',
      scene: 'bitta_fayl_ikki_holat',
      text: "Diskdagi ishchi nusxa esa buzilmasdan saqlanib qoladi va keyingi mantiqiy qadam uchun tayyor turadi."
    },
    {
      id: 'l11',
      scene: 'boshqa_patch_buyruqlar',
      text: "Xuddi shu patch rejimi git restore, reset, stash va hatto commit buyruqlarida ham to‘liq quvvat bilan ishlaydi."
    },
    {
      id: 'l12',
      scene: 'boshqa_patch_buyruqlar',
      text: "Xulosa qilganda, interaktiv staging vositalari sizga erkin kod yozish va har doim mukammal, toza tarix yaratish erkinligini beradi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
