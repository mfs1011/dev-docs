// Git 01-bob videosi: "Versiya nazorati va Git nima" (content/git/01-versiya-nazorati.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'muammo_va_avlodlar',
    'snapshot_modeli',
    'lokal_amallar_va_butunlik',
    'faqat_qoshish_va_uch_hudud',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish',
    muammo_va_avlodlar: 'Muammo va Uch Avlod',
    snapshot_modeli: 'Snapshotlar, Farqlar Emas',
    lokal_amallar_va_butunlik: 'Lokal Amallar va Butunlik',
    faqat_qoshish_va_uch_hudud: 'Faqat Qo‘shish va Uch Hudud',
    xulosa: 'Xulosa'
  };

  const hold = {
    l1: 0.8,
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
      text: "Salom! Bu Git qo‘llanmasining birinchi bobi. Ushbu videoda versiya nazorati nima ekanini va Git ma’lumotni qanday saqlashini ko‘rib chiqamiz."
    },
    {
      id: 'l2',
      scene: 'muammo_va_avlodlar',
      text: "Ko‘pchilik fayllarni turli nomlar bilan nusxalaydi, ammo bu usulda qaysi biri oxirgisi ekanini va kim o‘zgartirganini bilish qiyin."
    },
    {
      id: 'l3',
      scene: 'muammo_va_avlodlar',
      text: "Lokal tizimlarda butun tarix bitta kompyuterda bo‘lsa, markazlashgan tizimlarda yagona server buzilsa butun jamoa ishi to‘xtab qoladi."
    },
    {
      id: 'l4',
      scene: 'muammo_va_avlodlar',
      text: "Taqsimlangan tizim bo‘lgan Gitda esa har bir dasturchi butun repozitoriyni to‘liq tarixi bilan nusxalab oladi va har bir klon to‘liq zaxira hisoblanadi."
    },
    {
      id: 'l5',
      scene: 'snapshot_modeli',
      text: "Boshqa tizimlar o‘zgarishlarni deltalarda, ya’ni fayllar farqi sifatida saqlasa, Git butun loyihaning to‘liq suratlari, ya’ni snepshotlar oqimi sifatida saqlaydi."
    },
    {
      id: 'l6',
      scene: 'snapshot_modeli',
      text: "Agar biror fayl o‘zgarmagan bo‘lsa, Git uni qayta nusxalamaydi, balki oldingi bir xil obyektga havola qo‘yadi."
    },
    {
      id: 'l7',
      scene: 'lokal_amallar_va_butunlik',
      text: "Gitda deyarli barcha amallar lokal bajariladi, shuning uchun tarixni ko‘rish yoki farqlarni hisoblash oflayn rejimda ham bir zumda ishlaydi."
    },
    {
      id: 'l8',
      scene: 'lokal_amallar_va_butunlik',
      text: "Har bir fayl va kommit uchun qirq xonali esh-ey-van hesh nazorat yig‘indisi hisoblanadi, shuning uchun ma’lumot butunligi qat’iy kafolatlanadi."
    },
    {
      id: 'l9',
      scene: 'faqat_qoshish_va_uch_hudud',
      text: "Git bazasiga faqat yangi ma’lumot qo‘shiladi, hatto kommitni o‘zgartirganda ham eski holat xotirada saqlanib qoladi."
    },
    {
      id: 'l10',
      scene: 'faqat_qoshish_va_uch_hudud',
      text: "Fayllar uchta hududdan o‘tadi: ishchi papkada tahrirlanadi, ed buyrug‘i bilan steyjingga qo‘yiladi va kommit orqali repozitoriyga muhrlanadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilsak, Git snepshotlar modeli, lokal tezlik va xavfsiz butunlik asosiga qurilgan."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda terminal va Gitni o‘rnatishni boshlaymiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
