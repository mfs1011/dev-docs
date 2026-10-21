// Git 01-bob videosi: "Versiya nazorati va Git nima" (content/git/01-versiya-nazorati.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'muammo_nusxalash',
    'uch_avlod',
    'snapshot_modeli',
    'lokal_tezlik_va_butunlik',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Versiya Nazorati Nima?',
    muammo_nusxalash: 'Nega Papkalarni Nusxalash Yetmaydi?',
    uch_avlod: 'Versiya Nazoratining Uch Avlodi',
    snapshot_modeli: 'Snapshotlar Modeli — Git Qanday O‘ylaydi',
    lokal_tezlik_va_butunlik: 'Lokal Tezlik va Butunlik Kafolati',
    xulosa: 'Xulosa va Tavsiyalar'
  };

  const hold = {
    l2: 1.5,
    l4: 2.2,
    l6: 1.5,
    l8: 1.5,
    l10: 1.5,
    l12: 2.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu birinchi bobda dasturlashda eng muhim vositalardan biri bo‘lgan versiya nazorati tizimi va Git nima ekanini tushunib olamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Keling, avval nima uchun fayllarni oddiygina papkaga ko‘chirib saqlash yetarli emasligini real misolda ko‘rib chiqamiz."
    },
    {
      id: 'l3',
      scene: 'muammo_nusxalash',
      text: "Ko‘pchilik boshida shunday qiladi: loyiha papkasini nusxalab, nomiga eski, yakuniy yoki sana qo‘shib qo‘yadi."
    },
    {
      id: 'l4',
      scene: 'muammo_nusxalash',
      text: "Lekin terminalda ko‘rib turganingizdek, qisqa vaqtda tartibsizlik paydo bo‘ladi; qaysi biri oxirgisi ekanini va nima o‘zgarganini bilishning iloji qolmaydi."
    },
    {
      id: 'l5',
      scene: 'uch_avlod',
      text: "Dastlab lokal tizimlarda butun tarix bitta kompyuterda saqlangan bo‘lsa, markazlashgan tizimlarda yagona server buzilsa butun jamoa ishi to‘xtab qolgan."
    },
    {
      id: 'l6',
      scene: 'uch_avlod',
      text: "Git kabi taqsimlangan tizimlarda esa har bir dasturchi butun repozitoriyni to‘liq tarixi bilan nusxalab oladi va har bir klon mustaqil zaxiraga aylanadi."
    },
    {
      id: 'l7',
      scene: 'snapshot_modeli',
      text: "Boshqa tizimlar fayllar orasidagi farqlarni, ya’ni deltalarni saqlasa, Git butun loyihaning to‘liq suratlari, ya’ni snepshotlar oqimi sifatida saqlaydi."
    },
    {
      id: 'l8',
      scene: 'snapshot_modeli',
      text: "Bunda o‘zgarmagan fayllar qayta nusxalanmasdan, oldingi obyektga ko‘rsatkich qo‘yiladi va natijada yuqori tezlikka erishiladi."
    },
    {
      id: 'l9',
      scene: 'lokal_tezlik_va_butunlik',
      text: "Gitda deyarli barcha amallar lokal bajariladi; hatto internet yo‘q paytda ham butun loyiha tarixini ko‘rish yoki solishtirish bir zumda kechadi."
    },
    {
      id: 'l10',
      scene: 'lokal_tezlik_va_butunlik',
      text: "Har bir fayl va kommit uchun esh-ey-van hesh nazorat yig‘indisi hisoblanadi, shuning uchun ma’lumotlar butunligi qat’iy himoyalangan."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilsak, Git snepshotlar modeli, to‘liq taqsimlanganlik va ma’lumotlar xavfsizligi ustiga qurilgan pishiq arxitekturadir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi ikkinchi bobda terminal bilan ishlash asoslarini va kompyuteringizga Gitni o‘rnatishni boshlaymiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '01-bob',
    title: "Versiya nazorati va Git nima",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);
