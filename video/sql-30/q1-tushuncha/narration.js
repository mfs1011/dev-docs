// SQL 30-bob 1-qism: Tushuncha — Rekursiv CTE
globalThis.NR = {
  scenes: ['kirish', 'tuzilishi', 'algoritm_va_ishchi_jadval', 'daraxt_va_graf', 'chuqurlik_va_kenglik', 'aylanalar_va_xavfsizlik'],
  sceneNames: {
    kirish: "30-bob: Rekursiv CTE Tushunchasi",
    tuzilishi: "Rekursiv CTE ning Tuzilishi",
    algoritm_va_ishchi_jadval: "Bajarilish Algoritmi va Ishchi Jadval",
    daraxt_va_graf: "Ierarxiya: Daraxt va Graf Tuzilmalari",
    chuqurlik_va_kenglik: "Kenglik va Chuqurlik Bo'yicha Qidiruv",
    aylanalar_va_xavfsizlik: "Cheksiz Sikllar va Aylanalarni Aniqlash",
  },
  hold: {
    intro: 0.8,
    tuzilish: 1.2,
    algoritm: 1.2,
    daraxt: 1.2,
    tartib: 1.2,
    aylana: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "WITH RECURSIVE kalit so'zi CTE ni oddiy qulaylikdan standart SQL da boshqa yo'l bilan qilib bo'lmaydigan qudratli imkoniyatga aylantiradi.",
    },
    {
      id: "tuzilish",
      scene: "tuzilishi",
      text: "Uning tuzilishi uch qismdan iborat: boshlang'ich so'rov, birlashtiruvchi UNION ALL va o'z-o'ziga murojaat qiluvchi rekursiv qism.",
    },
    {
      id: "algoritm",
      scene: "algoritm_va_ishchi_jadval",
      text: "Baza ichida rekursiya ishchi jadval orqali iteratsiya bilan bajariladi: har qadamda chiqqan yangi qatorlar keyingi qadam uchun manba bo'ladi.",
    },
    {
      id: "daraxt",
      scene: "daraxt_va_graf",
      text: "Bu usul tashkilot tuzilmasi kabi bitta ota-onaga ega daraxtlarni ham, yo'llar tarmog'i kabi murakkab graflarni ham tahlil qilish imkonini beradi.",
    },
    {
      id: "tartib",
      scene: "chuqurlik_va_kenglik",
      text: "Ma'lumotlarni ikki tartibda olish mumkin: avval butun bir darajani ko'rish kenglik bo'yicha, har bir shoxni oxirigacha o'rganish esa chuqurlik bo'yicha qidiruvdir.",
    },
    {
      id: "aylana",
      scene: "aylanalar_va_xavfsizlik",
      text: "Grafda aylana mavjud bo'lsa, so'rov cheksiz aylanib qolmasligi uchun to'xtash sharti yoki yo'lni kuzatib boruvchi mexanizm shart.",
    },
  ],
};
