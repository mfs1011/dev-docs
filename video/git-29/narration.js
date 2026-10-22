// narration.js — 29-bob: `fetch` va `push` ichidan
(function (g) {
  const scenes = [
    'intro',
    'refspec_turlari',
    'transfer_protokol',
    'force_with_lease',
    'force_if_includes',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish: Refspec va Protokol Asoslari',
    refspec_turlari: 'Refspec Turlari va Inkor Qoidalari',
    transfer_protokol: 'Uzatish Protokollari: Smart va Dumb Git',
    force_with_lease: 'Xavfli Force va force-with-lease',
    force_if_includes: 'Fonda Fetch Xavfi va force-if-includes',
    xulosa: 'Xulosa va Keyingi Qadam'
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
      text: 'Salom! Ushbu yigirma to‘qqizinchi bobda Git\'da fetch va push amallarining ichki arxitekturasi, refspeklar va tarmoq protokollarini batafsil o‘rganamiz.'
    },
    {
      id: 'l2',
      scene: 'intro',
      text: 'Refspec — masofaviy ombordagi qaysi ko‘rsatkich lokal kompyuterimizdagi qaysi manzilga yozilishini belgilab beruvchi maxsus qoidadir.'
    },
    {
      id: 'l3',
      scene: 'refspec_turlari',
      text: 'Qisman moslik va inkor refspeklari orqali keraksiz tarmoqlarni chetlab o‘tib, faqat kerakli loyiha branchlarini saralab olish mumkin.'
    },
    {
      id: 'l4',
      scene: 'refspec_turlari',
      text: 'Shuningdek, push paytida refspec yordamida o‘z lokal branchimizni serverga butunlay boshqa nom bilan xavfsiz yuklash imkoniyati mavjud.'
    },
    {
      id: 'l5',
      scene: 'transfer_protokol',
      text: 'Git\'ning zamonaviy aqlli protokoli server va mijoz o‘rtasida kamchilik obyektlarni hisoblab, ularni bitta ixcham packfile ichida uzatadi.'
    },
    {
      id: 'l6',
      scene: 'transfer_protokol',
      text: 'Fetch paytida fetch-pack va upload-pack, push jarayonida esa send-pack va receive-pack vositalari o‘zaro tezkor aloqa o‘rnatadi.'
    },
    {
      id: 'l7',
      scene: 'force_with_lease',
      text: 'Ko‘r-ko‘rona ishlatilgan --force buyrug‘i serverdagi boshqa hamkasblar yozgan yangi commitlarni butunlay o‘chirib yuborishi mumkin.'
    },
    {
      id: 'l8',
      scene: 'force_with_lease',
      text: '--force-with-lease esa serverdagi holat siz oxirgi marta ko‘rgan joyda tursagina o‘zgarishni qabul qilib, begona kodlarni asrab qoladi.'
    },
    {
      id: 'l9',
      scene: 'force_if_includes',
      text: 'Biroq muharrir fonda o‘zi fetch qilib tursa, lease sharti aldanib qolmasligi uchun --force-if-includes qo‘shimcha tekshiruvidan foydalanamiz.'
    },
    {
      id: 'l10',
      scene: 'force_if_includes',
      text: 'Ushbu bayroq serverdagi commit sizning lokal tarixingiz va reflogingizdan haqiqatan o‘tganligini to‘liq kafolatlaydi.'
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: 'Ushbu ichki mexanizmlarni bilish katta jamoalarda o‘zaro kod almashish xavfsizligini eng yuqori darajaga ko‘taradi.'
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: 'Keyingi o‘ttizinchi bobda masofaviy repozitoriylar bilan xavfsiz autentifikatsiya o‘rnatish va SSH kalitlarini sozlashni ko‘rib chiqamiz.'
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
