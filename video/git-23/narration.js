// Git 23-bob videosi: "Branch'larni boshqarish" (content/git/23-branch-boshqaruvi.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'royxat_va_filtr',
    'merged_va_xavfsizlik',
    'contains_va_points_at',
    'ochirish_va_nomlash',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Branchlarni Boshqarish: git branch',
    royxat_va_filtr: 'Ro‘yxatlash, -v va --list Filtrlari',
    merged_va_xavfsizlik: '--merged va --no-merged Tahlili',
    contains_va_points_at: '--contains va --points-at Savollari',
    ochirish_va_nomlash: 'O‘chirish, Qayta Nomlash: -d, -D va -m',
    xulosa: 'Xulosa: --sort va Tartibli Tarmoqlar'
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
      text: "Salom! Ushbu yigirma uchinchi bobda loyihada ko‘payib ketgan tarmoqlarni tartibli boshqarish va nazorat qilish vositalarini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "git branch buyrug‘i nafaqat tarmoq ochish, balki butun ombordagi brenchlarni tahlil qilish va saralashning asosiy kalitidir."
    },
    {
      id: 'l3',
      scene: 'royxat_va_filtr',
      text: "git branch buyrug‘iga minus v bayrog‘ini qo‘shsak, har bir brenchning oxirgi kommit heshi va uning xabari birga chiqadi."
    },
    {
      id: 'l4',
      scene: 'royxat_va_filtr',
      text: "list parametri va maxsus yulduzcha naqshlari orqali yuzlab brenchlar orasidan aynan kerakli guruhlarni bir zumda filtrlab olamiz."
    },
    {
      id: 'l5',
      scene: 'merged_va_xavfsizlik',
      text: "merged filtri asosiy brenchga to‘liq qo‘shilgan va xavfsiz o‘chirilishi mumkin bo‘lgan tarmoqlarni aniq ajratib beradi."
    },
    {
      id: 'l6',
      scene: 'merged_va_xavfsizlik',
      text: "no-merged esa hali birlashtirilmagan mustaqil ishlarni ko‘rsatadi va Git ularni tasodifan o‘chirib yuborishdan ishonchli himoya qiladi."
    },
    {
      id: 'l7',
      scene: 'contains_va_points_at',
      text: "contains opsiyasi ma’lum bir kommit aynan qaysi brenchlar tarixiga kirganini graf bo‘ylab tekshirish imkonini beradi."
    },
    {
      id: 'l8',
      scene: 'contains_va_points_at',
      text: "points-at esa hozirgi kommit ustida to‘g‘ridan-to‘g‘ri turgan tarmoqlarni aniqlab, brenchlar chalkashligining oldini oladi."
    },
    {
      id: 'l9',
      scene: 'ochirish_va_nomlash',
      text: "Vazifasi tugagan brenchni xavfsiz minus d bilan, birlashtirilmaganini esa majburiy katta minus D bilan o‘chiramiz."
    },
    {
      id: 'l10',
      scene: 'ochirish_va_nomlash',
      text: "minus m orqali brench nomini o‘zgartirganda esa, Git refs papkasidagi fayl va uning reflog jurnalini toza qayta nomlaydi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "sort committerdate sozlamasi yaqinda faol bo‘lgan brenchlarni doimo ro‘yxat boshida ko‘rsatib, vaqtingizni tejaydi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi yigirma to‘rtinchi bobda tarmoqlanish tarixini to‘g‘ri va tekis chiziqqa keltiruvchi rebase texnikasini o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '23-bob',
    title: "Branch'larni boshqarish",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);
