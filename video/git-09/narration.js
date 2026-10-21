// Git 09-bob videosi: "Tarixni ko'rish: log" (content/git/09-tarixni-korish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'orqaga_yurish',
    'formatlar',
    'tarkib',
    'qidiruv_va_filtr',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Loyihaning O‘tmish Xaritasi',
    orqaga_yurish: 'Tarixning Orqaga O‘qilishi',
    formatlar: 'oneline va graph Formatlari',
    tarkib: 'stat va patch (-p) Tarkibi',
    qidiruv_va_filtr: 'Kuchli Qidiruv va Filtrlar',
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
      text: "Salom! Ushbu to‘qqizinchi bobda loyihaning butun o‘tmishini ko‘rish, tahlil qilish va qidirishning eng asosiy quroli — git log buyrug‘ini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "U kommitlarning ota-ona zanjiri bo‘ylab orqaga yurib, loyiha qanday rivojlanganini to‘liq namoyon etadi."
    },
    {
      id: 'l3',
      scene: 'orqaga_yurish',
      text: "Har bir kommit faqat o‘zidan oldingi ota kommit havolasini saqlaydi, chunki kommit yaratilayotganda bolalari hali mavjud bo‘lmaydi."
    },
    {
      id: 'l4',
      scene: 'orqaga_yurish',
      text: "Shu sababli git log joriy HED ko‘rsatkichidan boshlab, eng yangi kommitdan eng eskisiga qarab orqaga harakatlanadi."
    },
    {
      id: 'l5',
      scene: 'formatlar',
      text: "Standart uzun ko‘rinishdan tashqari, minus minus onlayn opsiyasi har bir kommitni bitta ixcham qatorga jamlab beradi."
    },
    {
      id: 'l6',
      scene: 'formatlar',
      text: "Graf opsiyasi esa tarmoqlar qanday ajralgani va qayerda birlashganini chiroyli daraxt shaklida chizib ko‘rsatadi."
    },
    {
      id: 'l7',
      scene: 'tarkib',
      text: "Minus minus stat opsiyasi qaysi fayllarda nechtadan qator o‘zgarganini qisqacha statistika qilib chiqaradi."
    },
    {
      id: 'l8',
      scene: 'tarkib',
      text: "Minus p opsiyasi esa har bir kommit ichidagi barcha kod farqlarini to‘liq patch ko‘rinishida ochiqlaydi."
    },
    {
      id: 'l9',
      scene: 'qidiruv_va_filtr',
      text: "Git log yordamida muallif, sana, kommit xabari va hatto kod ichidagi o‘zgarishlar bo‘yicha aniq filtrlar qo‘llash mumkin."
    },
    {
      id: 'l10',
      scene: 'qidiruv_va_filtr',
      text: "Ayniqsa, katta es opsiyasi kod bazasidan istalgan funksiya yoki o‘zgaruvchi qachon kiritilganini bir zumda topib beradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, git log va git show — loyihada kim, qachon va nega o‘zgarish qilganini bilishning yagona haqiqat manbaidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda eng namunali va toza kommitlar yaratish madaniyatini o‘rganamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
