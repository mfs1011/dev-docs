// narration.js — 26-bob: Murakkab merge
(function (g) {
  const scenes = [
    'intro',
    'options_ours_theirs',
    'strategy_ours',
    'octopus_merge',
    'merge_bekor_qilish',
    'subtree_va_rerere'
  ];

  const sceneNames = {
    intro: 'Kirish: Merge strategiyalari va ORT',
    options_ours_theirs: 'Strategiya opsiyalari: -X ours va theirs',
    strategy_ours: 'Soxta merge: -s ours strategiyasi',
    octopus_merge: 'Ko‘p branchli merge: Octopus strategiyasi',
    merge_bekor_qilish: 'Mergeni bekor qilish: Reset va Revert',
    subtree_va_rerere: 'Rerere va Remote repozitoriylar'
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
      text: 'Salom! Ushbu yigirma oltinchi bobda Git\'da murakkab merge holatlari, turli merge strategiyalari va ularning maxsus opsiyalarini batafsil o‘rganamiz.'
    },
    {
      id: 'l2',
      scene: 'intro',
      text: 'Git sukut bo‘yicha ort strategiyasidan foydalanadi, ammo har bir murakkab vaziyat uchun alohida algoritm va qulay sozlamalar mavjud.'
    },
    {
      id: 'l3',
      scene: 'options_ours_theirs',
      text: 'Agar merge paytida konflikt chiqsa va ziddiyatli joylarda faqat bir tomon ustun bo‘lishi kerak bo‘lsa, -X ours yoki theirs opsiyasi ishlatiladi.'
    },
    {
      id: 'l4',
      scene: 'options_ours_theirs',
      text: 'Ushbu opsiya faqat ziddiyatli bo‘laklarni tanlangan tomondan oladi, konfliktsiz yangi o‘zgarishlar esa ikkala tomondan bekamu-ko‘st birlashtiriladi.'
    },
    {
      id: 'l5',
      scene: 'strategy_ours',
      text: '-s ours strategiyasi esa mutlaqo boshqa narsa bo‘lib, u ikkinchi branchdagi kodlarni umuman olmaydi va faqat joriy fayllar holatini saqlab qoladi.'
    },
    {
      id: 'l6',
      scene: 'strategy_ours',
      text: 'Natijada ikkinchi branch tarixda to‘liq birlashtirilgan deb belgilanadi, bu esa eski yoki eskirgan tarmoqlarni xavfsiz yopish uchun ayni muddao.'
    },
    {
      id: 'l7',
      scene: 'octopus_merge',
      text: 'Bir vaqtning o‘zida uchta yoki undan ortiq mustaqil branchlarni bitta commit bilan birlashtirish kerak bo‘lganda, Git avtomatik ravishda octopus strategiyasini tanlaydi.'
    },
    {
      id: 'l8',
      scene: 'octopus_merge',
      text: 'Natijaviy commitda birdaniga to‘rtta ota bog‘lanadi, biroq ziddiyat yuzaga kelsa, octopus merge jarayonini darhol to‘xtatadi.'
    },
    {
      id: 'l9',
      scene: 'merge_bekor_qilish',
      text: 'Xato qilingan mergeni serverga yuborishdan oldin bekor qilish uchun git reset --hard ORIG_HEAD buyrug‘i eng toza yechim hisoblanadi.'
    },
    {
      id: 'l10',
      scene: 'merge_bekor_qilish',
      text: 'Agar merge allaqachon serverga ketgan bo‘lsa, git revert -m 1 buyrug‘i orqali asosiy tarmoq yo‘nalishini saqlagan holda o‘zgarishlarni ortga qaytaramiz.'
    },
    {
      id: 'l11',
      scene: 'subtree_va_rerere',
      text: 'Shuningdek, git konfiguratsiyasida rerere imkoniyatini yoqish orqali bir xil konfliktlarni qayta-qayta qo‘lda hal qilish mashaqqatidan butunlay qutulamiz.'
    },
    {
      id: 'l12',
      scene: 'subtree_va_rerere',
      text: 'Keyingi bobda loyihani masofaviy serverlar va remote repozitoriylar bilan bog‘lab ishlash mexanizmlarini to‘liq o‘zlashtiramiz.'
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
