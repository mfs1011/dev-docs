// Git 06-bob videosi: "O'zgarishlarni yozish: status, add, commit" (content/git/06-ozgarishlarni-yozish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'git_status',
    'git_add',
    'git_commit',
    'kuzatuv_sikli',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'O‘zgarishlarni Yozish Sikli',
    git_status: 'git status: Holatni Ko‘rish',
    git_add: 'git add: Ko‘p Vazifali Kuch',
    git_commit: 'git commit: Tarixga Muhrlash',
    kuzatuv_sikli: 'Fayllarning Hayot Sikli',
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
      text: "Salom! Ushbu oltinchi bobda kundalik ishning to‘qson foizini tashkil qiluvchi uchta asosiy buyruqni o‘rganamiz: status, add va kommit."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Ushbu buyruqlar diskdagi fayllarni kuzatish, tayyorlash va doimiy tarixga snapshot sifatida muhrlash uchun xizmat qiladi."
    },
    {
      id: 'l3',
      scene: 'git_status',
      text: "Git status buyrug‘i uchala hududni o‘zaro solishtirib, qaysi fayl qanday holatda ekanini aniq ko‘rsatib beradi."
    },
    {
      id: 'l4',
      scene: 'git_status',
      text: "U treked va antreked fayllarni ajratadi, shuningdek qisqa minus s opsiyasi bilan holatni ixcham harflarda namoyish etadi."
    },
    {
      id: 'l5',
      scene: 'git_add',
      text: "Git add buyrug‘i shunchaki fayl qo‘shish emas, balki faylning aynan hozirgi mazmunini navbatdagi kommitga tayyorlashdir."
    },
    {
      id: 'l6',
      scene: 'git_add',
      text: "U yangi fayllarni kuzatishni boshlaydi, o‘zgarishlarni indeksga oladi va o‘chirilgan fayllarni ham qoralama rejasiga kiritadi."
    },
    {
      id: 'l7',
      scene: 'git_commit',
      text: "Git kommit buyrug‘i indeksdagi barcha tayyorlangan fayllarni olib, ulardan loyihaning o‘zgarmas yangi suratini yaratadi."
    },
    {
      id: 'l8',
      scene: 'git_commit',
      text: "Har bir kommit o‘z muallifi, sanasi, aniq tavsif xabari va noyob xesh kaliti bilan tarixga yoziladi."
    },
    {
      id: 'l9',
      scene: 'kuzatuv_sikli',
      text: "Fayllar hayot sikli juda ravshan: antreked fayl add qilingach steyjd bo‘ladi, kommitdan so‘ng esa anmodifayd holatiga o‘tadi."
    },
    {
      id: 'l10',
      scene: 'kuzatuv_sikli',
      text: "Tahrirlanganda yana modifayd bo‘ladi va bu sikl loyiha davomida uzluksiz takrorlanib boraveradi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, status, add va kommit — har bir dasturchining eng asosiy, eng ko‘p ishlatadigan qurollaridir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda aynan nimalar o‘zgarganini qatorlar kesimida ko‘rsatuvchi diff buyrug‘ini ko‘rib chiqamiz. Rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
