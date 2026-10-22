// narration.js — 50-bob: Buyruqlar xaritasi va checklist
(function (g) {
  const scenes = [
    'model_mental',
    'four_questions',
    'safety_danger',
    'workflow_checklist',
    'git3_future',
    'xulosa'
  ];

  const sceneNames = {
    model_mental: "Git Mental Modeli: Uch Hudud va Obyektlar",
    four_questions: "Buyruqlarni Tahlil Qilish: To'rtta Oltin Savol",
    safety_danger: "Xavfsizlik Zonasi va Xavfli Buyruqlar",
    workflow_checklist: "Kundalik Checklist va Eng Yaxshi Amaliyotlar",
    git3_future: "Kelajak: Git Uchinchi Versiyasi va Yangi Standartlar",
    xulosa: "Yakun: 50 Boblik Sayohat Xulosasi"
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
      scene: 'model_mental',
      text: "Gitdagi har qanday murakkab buyruqni tushunish uch hudud va o'zgarmas obyektlar modeliga tayanadi."
    },
    {
      id: 'l2',
      scene: 'model_mental',
      text: "Ishchi maydon, indeks va ombor o'rtasidagi ma'lumot oqimini tasavvur qilish chalkashliklarning oldini oladi."
    },
    {
      id: 'l3',
      scene: 'four_questions',
      text: "Yuzlab buyruqlarni yodlamasdan, har qanday amal oldidan to'rtta oddiy savolga javob berish kifoyadir."
    },
    {
      id: 'l4',
      scene: 'four_questions',
      text: "Bu amal xedni suradimi, indeksni o'zgartiradimi, fayllarga tegadimi yoki masofaviy server bilan bog'lanadimi."
    },
    {
      id: 'l5',
      scene: 'safety_danger',
      text: "Commit qilingan obyektlar deyarli har doim ref-log orqali qayta tiklanishi kafolatlangan."
    },
    {
      id: 'l6',
      scene: 'safety_danger',
      text: "Lekin ishchi papkadagi saqlanmagan o'zgarishlarni o'chiruvchi xard reset va checkout kabi buyruqlar ehtiyotkorlik talab qiladi."
    },
    {
      id: 'l7',
      scene: 'workflow_checklist',
      text: "Har kuni ish boshlashdan oldin yangiliklarni tortib olish va kichik mantiqiy qismlarga bo'lib commit qilish qat'iy odat bo'lishi lozim."
    },
    {
      id: 'l8',
      scene: 'workflow_checklist',
      text: "Branchlarni qisqa umrli saqlash va konfliktlarni erta bartaraf etish jamoaviy integratsiyani osonlashtiradi."
    },
    {
      id: 'l9',
      scene: 'git3_future',
      text: "Yangi avlod Git tizimi eskirgan nomaqbul xatti-harakatlarni tozalab, svitch va restor buyruqlarini asosiy standartga aylantirmoqda."
    },
    {
      id: 'l10',
      scene: 'git3_future',
      text: "Xesh algoritmining sha ikkiyuz ellik oltiga ko'chishi va skalar kabi zamonaviy arxitektura tezlikni yangi bosqichga olib chiqadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Ellikta bob davomida biz Gitning tub poydevoridan tortib eng ilg'or professional sirlarigacha birgalikda o'rganib chiqdik."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Endi siz nafaqat buyruqlarni teruvchi, balki versiya nazoratining har bir bosqichini chuqur his qiluvchi tajribali mutaxassissiz."
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
