// Git 07-bob videosi: "diff: nima o'zgardi" (content/git/07-diff.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'uch_diff',
    'patch_formati',
    'stat_va_taqqoslash',
    'xavfsizlik_va_amaliyot',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'git diff: O‘zgarishlar Ko‘zgusi',
    uch_diff: 'Uch Hudud va Uchta Diff',
    patch_formati: 'Patch Formatini O‘qish',
    stat_va_taqqoslash: 'Statistika va Brenchlar Farqi',
    xavfsizlik_va_amaliyot: 'Xavfsizlik va Oltin Odat',
    xulosa: 'Xulosa'
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
      text: "Salom! Ushbu yettinchi bobda fayllar ichida aynan qaysi qatorlar o‘zgarganini aniq ko‘rsatuvchi git diff buyrug‘ini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "U ikki holatni qiyoslab, qo‘shilgan, o‘chirilgan va o‘zgargan kodlarni qulay patch shaklida namoyish etadi."
    },
    {
      id: 'l3',
      scene: 'uch_diff',
      text: "Oddiy git diff buyrug‘i diskdagi ishchi papkani indeks bilan solishtirib, hali stage qilinmagan qoralamalarni ko‘rsatadi."
    },
    {
      id: 'l4',
      scene: 'uch_diff',
      text: "git diff minus minus steyjd esa indeks va oxirgi kommit o‘rtasidagi farqni, ya’ni navbatdagi kommitga aynan nima kirishini bildiradi."
    },
    {
      id: 'l5',
      scene: 'patch_formati',
      text: "Diff natijasidagi minus belgili qizil qatorlar eskida bor bo‘lib o‘chirilganini, plyus belgili yashil qatorlar esa yangi qo‘shilganini bildiradi."
    },
    {
      id: 'l6',
      scene: 'patch_formati',
      text: "Boshidagi guruhli sonlar esa faylning qaysi qatorlar diapazoniga tegishli ekanini bildiruvchi xank koordinatalaridir."
    },
    {
      id: 'l7',
      scene: 'stat_va_taqqoslash',
      text: "Katta o‘zgarishlarda minus minus stat bayrog‘i orqali qaysi fayllarda qancha qator o‘zgarganini ixcham gistogrammada ko‘rish mumkin."
    },
    {
      id: 'l8',
      scene: 'stat_va_taqqoslash',
      text: "Shuningdek, git diff bilan istalgan ikki kommit yoki brenchlar orasidagi butun loyiha farqini ham tahlil qilish mumkin."
    },
    {
      id: 'l9',
      scene: 'xavfsizlik_va_amaliyot',
      text: "Eng muhim qoida: git diff faqat o‘qish rejimida ishlaydi, u fayllarga hech qachon zarar yetkazmaydi yoki o‘chirib yubormaydi."
    },
    {
      id: 'l10',
      scene: 'xavfsizlik_va_amaliyot',
      text: "Shuning uchun har bir kommitdan oldin git diff minus minus steyjd buyrug‘i bilan kodni ko‘zdan kechirish dasturchining oltin odatidir."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, git diff — o‘zgarishlarni ko‘r-ko‘rona emas, toza va ongli saqlashning eng ishonchli kompasidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi sakkizinchi bobda keraksiz fayllarni chetlab o‘tuvchi gitignore qoidalarini amalda o‘rganamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
