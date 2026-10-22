// narration.js — 39-bob: reset sirlari: uch daraxt
(function (g) {
  const scenes = [
    'three_trees',
    'reset_algorithm',
    'reset_paths',
    'squash_split',
    'reset_vs_switch',
    'keep_merge_recovery'
  ];

  const sceneNames = {
    three_trees: "Gitning Uch Daraxti: HEAD, Index va Working Tree",
    reset_algorithm: "Resetning Uch Qadami: --soft, --mixed va --hard",
    reset_paths: "Yo‘l Bilan Reset va Unstage Amali",
    squash_split: "Amaliyot: Commitlarni Birlashtirish va Bo‘lish",
    reset_vs_switch: "Reset va Switch Farqlari: Branch va Xavfsizlik",
    keep_merge_recovery: "Ilg‘or Rejimlar: --keep, --merge va Qaytarish"
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
      scene: 'three_trees',
      text: "Gitning ishlash mexanizmini to'liq tushunish uchun uchta asosiy daraxt, ya'ni HEAD commit surati, Index oraliq qatlami va Working Tree ishchi nusxasini bilish shart."
    },
    {
      id: 'l2',
      scene: 'three_trees',
      text: "Oddiy ish oqimida o'zgarishlar ishchi papkadan git add orqali indexga o'tadi, so'ng git commit yordamida yangi HEAD commitiga aylanadi."
    },
    {
      id: 'l3',
      scene: 'reset_algorithm',
      text: "git reset bitta yagona uch bosqichli algoritm bo'lib, uning bayroqlari bu jarayon aynan qaysi qadamda to'xtashini belgilaydi."
    },
    {
      id: 'l4',
      scene: 'reset_algorithm',
      text: "Minus-minus soft faqat branch ko'rsatkichini suradi, standart mixed rejimi indexni ham yangilaydi, minus-minus hard esa ishchi katalogdagi tahrirlarni ham so'roqsiz almashtiradi."
    },
    {
      id: 'l5',
      scene: 'reset_paths',
      text: "Agar reset buyrug'iga aniq fayl yo'li berilsa, birinchi qadam tashlab ketiladi va faqat indexdagi fayl HEAD holatiga qaytariladi."
    },
    {
      id: 'l6',
      scene: 'reset_paths',
      text: "Bu amalda add harakatining teskarisi bo'lib, zamonaviy Gitda xuddi shu vazifani git restore minus-minus staged buyrug'i aniq bajaradi."
    },
    {
      id: 'l7',
      scene: 'squash_split',
      text: "Push qilinmagan bir nechta mayda commitlarni birlashtirish uchun git reset minus-minus soft bilan eski nuqtaga qaytib, bitta yaxlit commit qilish juda qulaydir."
    },
    {
      id: 'l8',
      scene: 'squash_split',
      text: "Aksincha, bitta katta commitni bo'lish uchun minus-minus mixed va intent to add bayrog'i yordamida patch rejimida alohida commitlar hosil qilinadi."
    },
    {
      id: 'l9',
      scene: 'reset_vs_switch',
      text: "git switch boshqa branchga o'tganda ishchi fayllarni xavfsiz merge qiladi, reset minus-minus hard esa saqlanmagan tahrirlarni yo'qotib yuborishi mumkin."
    },
    {
      id: 'l10',
      scene: 'reset_vs_switch',
      text: "Eng muhim farq shundaki, switch HEAD ko'rsatkichining o'zini yo'naltiradi, reset esa HEAD turgan joriy branchni orqaga yoki oldinga suradi."
    },
    {
      id: 'l11',
      scene: 'keep_merge_recovery',
      text: "Ishchi daraxtdagi o'zgarishlarni asragan holda commitlarni bekor qilish uchun keep, muammoli mergedan xavfsiz chiqish uchun esa merge bayrog'i ishlatiladi."
    },
    {
      id: 'l12',
      scene: 'keep_merge_recovery',
      text: "Kutilmagan xato yuz berganda Git ORIG_HEAD va reflog orqali barcha bekor qilingan commitlarni to'liq tiklash imkonini taqdim etadi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
