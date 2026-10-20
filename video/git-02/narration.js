// Git 02-bob videosi: "Terminal va o'rnatish" (content/git/02-terminal-va-ornatish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'ornatish_va_path',
    'buyruq_tuzilishi',
    'global_va_ustunlik',
    'ajratuvchi_va_qoshtirnoq',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Kirish va Buyruq Qatori',
    ornatish_va_path: 'O‘rnatish va PATH',
    buyruq_tuzilishi: 'Buyruq Anatomiyasi',
    global_va_ustunlik: 'Global Opsiyalar va Ustunlik',
    ajratuvchi_va_qoshtirnoq: 'Ajratuvchi va Xavfsizlik',
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
      text: "Salom! Ushbu bobda Gitni kompyuterga o‘rnatish va terminal buyruqlari qanday tuzilganini o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Git bilan ishlashda grafik dasturlar bo‘lsa-da, barcha imkoniyatlar faqat buyruq qatorida to‘liq ochiladi va har bir tizimda bir xil ishlaydi."
    },
    {
      id: 'l3',
      scene: 'ornatish_va_path',
      text: "Gitni Linuxda paket menejeri orqali, macOSda buyruq qatori vositalari yoki Homebrew bilan, Windowsda esa Git for Windows orqali o‘rnatasiz."
    },
    {
      id: 'l4',
      scene: 'ornatish_va_path',
      text: "Kompyuterda bir nechta Git bo‘lishi mumkin va qaysi biri ishga tushishini Pas muhit o‘zgaruvchisidagi papkalar tartibi hal qiladi."
    },
    {
      id: 'l5',
      scene: 'buyruq_tuzilishi',
      text: "Har bir Git buyrug‘i aniq tuzilishga ega: global opsiyalar, ichki buyruq nomi, uning opsiyalari, argumentlar va fayl yo‘llari."
    },
    {
      id: 'l6',
      scene: 'buyruq_tuzilishi',
      text: "Har bir buyruq tugaganda ekzit kod qaytaradi: nol muvaffaqiyatni, yuz yigirma sakkiz esa xatolikni bildiradi."
    },
    {
      id: 'l7',
      scene: 'global_va_ustunlik',
      text: "Katta si opsiyasi Gitni boshqa papkaga kirmasdan ishlatishga, kichik si esa faqat bitta buyruq uchun sozlama berishga imkon beradi."
    },
    {
      id: 'l8',
      scene: 'global_va_ustunlik',
      text: "Agar bir xil sozlama turli joyda berilsa, eng yuqori ustunlik buyruq opsiyasiga, keyin muhit o‘zgaruvchisiga va eng oxirida konfig fayliga tegishli bo‘ladi."
    },
    {
      id: 'l9',
      scene: 'ajratuvchi_va_qoshtirnoq',
      text: "Ikkita chiziqcha belgisi kommit yoki brenchni fayl nomidan ajratib, nomlar to‘qnashganda adashishning oldini oladi."
    },
    {
      id: 'l10',
      scene: 'ajratuvchi_va_qoshtirnoq',
      text: "Yulduzcha kabi belgilarni esa har doim qo‘shtirnoqqa olish kerak, aks holda terminal fayllarni Gitga yetmasdan noto‘g‘ri almashtirib qo‘yadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilib aytganda, terminal sintaksisini puxta bilish keyingi boblardagi barcha amallarni to‘g‘ri tushunishga poydevor bo‘ladi."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi bobda Gitni birinchi marta sozlash va yordam tizimini o‘rganamiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
