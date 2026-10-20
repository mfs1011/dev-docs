// Git 07-bob videosi: "diff: nima o'zgardi" (content/git/07-diff.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'uch_diff',
    'patch_formati',
    'commitlar_farqi',
    'xavfsizlik_va_amaliyot',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'git diff: O‘zgarishlar Ko‘zgusi',
    uch_diff: 'Uch Hudud va Uchta Diff',
    patch_formati: 'Patch Formatini O‘qish',
    commitlar_farqi: 'Kommitlar va Brenchlar Farqi',
    xavfsizlik_va_amaliyot: 'Xavfsizlik va Oltin Odat',
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
      text: "Salom! Ushbu yettinchi bobda fayllar ichida aynan nimalar o‘zgarganini qatorlar kesimida ko‘rsatuvchi git diff buyrug‘ini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "U ikki holatni solishtirib, qo‘shilgan, o‘chirilgan va o‘zgargan kodlarni aniq patch shaklida namoyish etadi."
    },
    {
      id: 'l3',
      scene: 'uch_diff',
      text: "Oddiy git diff buyrug‘i diskdagi ishchi papkani indeks bilan solishtirib, hali stage qilinmagan o‘zgarishlarni ko‘rsatadi."
    },
    {
      id: 'l4',
      scene: 'uch_diff',
      text: "git diff minus minus steyjd esa indeks va oxirgi kommit o‘rtasidagi farqni, ya’ni navbatdagi kommitga aynan nima kirishini bildiradi."
    },
    {
      id: 'l5',
      scene: 'patch_formati',
      text: "Diff natijasidagi minus belgili qizil qatorlar eskida bor bo‘lib o‘chirilganini, plyus belgili yashil qatorlar esa yangi qo‘shilganini anglatadi."
    },
    {
      id: 'l6',
      scene: 'patch_formati',
      text: "Boshidagi guruhli sonlar esa faylning qaysi qatorlar diapazoniga daxldor ekanini bildiruvchi xank koordinatalaridir."
    },
    {
      id: 'l7',
      scene: 'commitlar_farqi',
      text: "Git diff yordamida nafaqat ishchi hududlarni, balki istalgan ikkita kommit yoki brenchlar orasidagi farqni ham tekshirish mumkin."
    },
    {
      id: 'l8',
      scene: 'commitlar_farqi',
      text: "Masalan, meyn va ficher brenchlari orasidagi farqni bilish loyihada nimalar yangilanganini bir zumda ochib beradi."
    },
    {
      id: 'l9',
      scene: 'xavfsizlik_va_amaliyot',
      text: "Eng muhim xususiyat: git diff faqat o‘qish rejimida ishlaydi, u kodingizga hech qachon zarar yetkazmaydi."
    },
    {
      id: 'l10',
      scene: 'xavfsizlik_va_amaliyot',
      text: "Shuning uchun har bir kommitdan oldin git diff minus minus steyjd bilan tekshirib olish eng toza odatdir."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, git diff — o‘zgarishlarni ko‘r-ko‘rona emas, ongli va xatosiz saqlashning eng ishonchli kompasidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda keraksiz fayllarni chetlab o‘tuvchi gitignore qoidalarini ko‘rib chiqamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
