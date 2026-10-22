// narration.js — 46-bob: .gitattributes
(function (g) {
  const scenes = [
    'attr_intro',
    'check_attr',
    'eol_binary',
    'diff_textconv',
    'filter_clean_smudge',
    'xulosa'
  ];

  const sceneNames = {
    attr_intro: "Git Atributlari Nima: Yo'l Bo'yicha Qoidalar",
    check_attr: "Atributlarni Tekshirish: git check-attr va sintaksis",
    eol_binary: "Qator Oxirlari va Binar Fayllar: eol va binary",
    diff_textconv: "Maxsus Diff Driverlar: diff va textconv",
    filter_clean_smudge: "Filtrlar: clean va smudge mexanizmi",
    xulosa: "Xulosa va Export Qoidalari"
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
      scene: 'attr_intro',
      text: "Nuqta gitattributes fayli har bir fayl va papka uchun maxsus xatti-harakat qoidalarini belgilashga xizmat qiladi."
    },
    {
      id: 'l2',
      scene: 'attr_intro',
      text: "Oddiy configdan farqli ravishda ushbu atributlar repozitoriy ichida commit qilinadi va barcha jamoadoshlar uchun bir xil ishlaydi."
    },
    {
      id: 'l3',
      scene: 'check_attr',
      text: "Git check-attr buyrug'i berilgan yo'lga qaysi atributlar biriktirilganini va ularning faol holatini aniq ko'rsatib beradi."
    },
    {
      id: 'l4',
      scene: 'check_attr',
      text: "Atributlar set, unset, aniq qiymat yoki aytilmagan unspecified kabi to'rtta holatdan birida bo'lishi mumkin."
    },
    {
      id: 'l5',
      scene: 'eol_binary',
      text: "Barcha platformalarda bir xillikni ta'minlash uchun text barobar avto hamda eol barobar el-ef qoidasi o'rnatiladi."
    },
    {
      id: 'l6',
      scene: 'eol_binary',
      text: "Rasmlar va siqilgan arxivlar uchun esa binary makrosi orqali matnli konvertatsiyalar va diff butunlay o'chirib qo'yiladi."
    },
    {
      id: 'l7',
      scene: 'diff_textconv',
      text: "Diff barobar zip yoki pdf atributlari orqali binar formatlarni avval matnga aylantirib, so'ngra qulay solishtirish mumkin."
    },
    {
      id: 'l8',
      scene: 'diff_textconv',
      text: "Bunda textconv drayveri tashqi utilitani ishga tushirib, noqulay binar o'zgarishlarni o'qilishi oson matn ko'rinishida chiqaradi."
    },
    {
      id: 'l9',
      scene: 'filter_clean_smudge',
      text: "Filter atributi check-in paytida clean orqali kodni tozalash, checkout paytida esa smudge orqali ma'lumot kiritish imkonini beradi."
    },
    {
      id: 'l10',
      scene: 'filter_clean_smudge',
      text: "Ushbu mexanizm kod formatlash, kalit so'zlarni joylash yoki avtomatik indentatsiya qilishda keng qo'llaniladi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Export-ignore atributi arxiv yaratganda yoki reliz paketlaganda keraksiz sinov fayllarini chetlab o'tishni ta'minlaydi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "To'g'ri sozlangan gitattributes loyiha fayllarining turli operatsion tizimlarda buzilmasdan, yaxlit saqlanishini kafolatlaydi."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
