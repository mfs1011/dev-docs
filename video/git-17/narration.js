// Git 17-bob videosi: "Ref'lar, HEAD va teg obyekti" (content/git/17-reflar-va-head.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'update_ref_xavfsizlik',
    'head_va_symref',
    'teg_obyektlari',
    'packed_refs',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Ref‘lar va HEAD Tushunchasi',
    update_ref_xavfsizlik: 'git update-ref va Xavfsizlik Kafolati',
    head_va_symref: 'HEAD Ko‘rsatkichi va Symbolic Ref',
    teg_obyektlari: 'Oddiy Teg va Annotated Teg Obyekti',
    packed_refs: 'packed-refs va Reftable Formati',
    xulosa: 'Xulosa va Tavsiyalar'
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
      text: "Salom! Ushbu o‘n yettinchi bobda qirq belgili heshlar ustiga inson tushunadigan nomlar qo‘yuvchi ref ko‘rsatkichlari va HEAD faylini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git'da barcha obyektlar o‘zgarmas bo‘lsa, ref'lar aksincha: ular joriy holatni saqlovchi o‘ta yengil va o‘zgaruvchan havolalardir."
    },
    {
      id: 'l3',
      scene: 'update_ref_xavfsizlik',
      text: "Reflar shunchaki fayl bo‘lsa-da, ularni qo‘lda emas, git update-ref buyrug‘i orqali xavfsiz qulflash va tekshiruv bilan yangilash shart."
    },
    {
      id: 'l4',
      scene: 'update_ref_xavfsizlik',
      text: "update-ref buyrug‘i poyga holatlarini oldini oluvchi compare-and-swap sharti va har bir qadamni yozib boruvchi reflog bilan himoyalangan."
    },
    {
      id: 'l5',
      scene: 'head_va_symref',
      text: "HEAD fayli ko‘pincha to‘g‘ridan-to‘g‘ri commitga emas, balki joriy branchga ishora qiluvchi simvolik ref hisoblanadi."
    },
    {
      id: 'l6',
      scene: 'head_va_symref',
      text: "git symbolic-ref buyrug‘i HEAD qaysi tarmoqqa bog‘langanini ko‘rsatadi, detached holatida esa HEAD to‘g‘ridan-to‘g‘ri commitga ulanadi."
    },
    {
      id: 'l7',
      scene: 'teg_obyektlari',
      text: "Git teglari ikki xil bo‘ladi: shunchaki commitga ishora qiluvchi yengil teglar hamda ichida muallif va xabari bor to‘laqonli teg obyektlari."
    },
    {
      id: 'l8',
      scene: 'teg_obyektlari',
      text: "Annotated teglar Git omborida to‘rtinchi mustaqil obyekt turi bo‘lib, ommaviy relizlar va kriptografik imzolar uchun xizmat qiladi."
    },
    {
      id: 'l9',
      scene: 'packed_refs',
      text: "Minglab ref fayllari diskni sekinlashtirmasligi uchun git pack-refs ularni bitta ixcham packed-refs fayliga jamlab beradi."
    },
    {
      id: 'l10',
      scene: 'packed_refs',
      text: "Zamonaviy Git tizimlarida esa yanada tezkor, tranzaksiyaviy va ikkilik ko‘rinishdagi reftable backend texnologiyasi joriy etilmoqda."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Reflar va HEAD mexanizmini chuqur tushunish branchlar, checkout va reset buyruqlarining qanday ishlashini to‘liq oydinlashtiradi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi o‘n sakkizinchi bobda omborni siqish, delta mexanizmi va avtomatik axlat yig‘uvchi git gc buyrug‘ini o‘rganamiz."
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '17-bob',
    title: "Ref'lar, HEAD va teg obyekti",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);
