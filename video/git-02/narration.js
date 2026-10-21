// Git 02-bob videosi: "Terminal va o'rnatish" (content/git/02-terminal-va-ornatish.md)
// Uslub va qoidalar: GIT-VIDEO-USLUBI.md
(function (g) {
  const scenes = [
    'intro',
    'ornatish_va_path',
    'buyruq_anatomiyasi',
    'global_va_ustunlik',
    'ajratuvchi_va_qoshtirnoq',
    'xulosa'
  ];

  const sceneNames = {
    intro: 'Nega Buyruq Qatori (CLI)?',
    ornatish_va_path: 'O‘rnatish va PATH Tahlili',
    buyruq_anatomiyasi: 'Buyruq Anatomiyasi va Exit Kod',
    global_va_ustunlik: 'Global Opsiyalar va Ustunlik',
    ajratuvchi_va_qoshtirnoq: 'Ajratuvchi (--) va Glob Qashtirnoqlari',
    xulosa: 'Xulosa va Tavsiyalar'
  };

  const hold = {
    l2: 1.5,
    l4: 2.0,
    l6: 1.5,
    l8: 1.8,
    l10: 1.8,
    l12: 2.5
  };

  const lines = [
    {
      id: 'l1',
      scene: 'intro',
      text: "Salom! Ushbu ikkinchi bobda Gitni kompyuterga o‘rnatish, uning terminaldagi anatomiyasi va buyruqlar tuzilishini amalda o‘rganamiz."
    },
    {
      id: 'l2',
      scene: 'intro',
      text: "Grafik interfeyslar qulay bo‘lsa-da, Gitning barcha imkoniyatlari faqat buyruq qatorida to‘liq ochiladi va har bir operatsion tizimda bir xil ishlaydi."
    },
    {
      id: 'l3',
      scene: 'ornatish_va_path',
      text: "Terminalda git minus minus vershn buyrug‘i orqali Git borligini va uning qaysi versiyasi ishlayotganini darhol tekshirishingiz mumkin."
    },
    {
      id: 'l4',
      scene: 'ornatish_va_path',
      text: "Agar kompyuteringizda bir nechta Git bo‘lsa, qaysi biri ishga tushishini Pas muhit o‘zgaruvchisidagi papkalar tartibi hal qiladi."
    },
    {
      id: 'l5',
      scene: 'buyruq_anatomiyasi',
      text: "Har bir Git buyrug‘i aniq tuzilishga ega: global opsiyalar, ichki buyruq nomi, uning kalitlari, argumentlar va fayl yo‘llari."
    },
    {
      id: 'l6',
      scene: 'buyruq_anatomiyasi',
      text: "Har bir buyruq tugaganda ekzit kod qaytaradi: nol muvaffaqiyatni, noldan farqli qiymat esa xatolik yuz berganini bildiradi."
    },
    {
      id: 'l7',
      scene: 'global_va_ustunlik',
      text: "Katta si opsiyasi Gitni boshqa papkaga kirmasdan turib boshqarishga, kichik si esa vaqtinchalik sozlama bilan ishlatishga imkon beradi."
    },
    {
      id: 'l8',
      scene: 'global_va_ustunlik',
      text: "Agar bir xil parametr turli joyda berilsa, eng yuqori ustunlik buyruq opsiyasiga, keyin muhit o‘zgaruvchisiga va eng oxirida konfig fayliga beriladi."
    },
    {
      id: 'l9',
      scene: 'ajratuvchi_va_qoshtirnoq',
      text: "Ikkita chiziqcha belgisi kommit yoki brenchni fayl nomidan ajratib, nomlar to‘qnashganda adashishning oldini oladi."
    },
    {
      id: 'l10',
      scene: 'ajratuvchi_va_qoshtirnoq',
      text: "Yulduzcha kabi shablon belgilarini esa har doim qo‘shtirnoqqa olish kerak, aks holda terminal ularni Gitga yetib bormasdan almashtirib qo‘yadi."
    },
    {
      id: 'l11',
      scene: 'xulosa',
      text: "Xulosa qilsak, terminal sintaksisini puxta tushunish keyingi barcha amaliy boblarda erkin va xatosiz ishlash garovidir."
    },
    {
      id: 'l12',
      scene: 'xulosa',
      text: "Keyingi uchinchi bobda Gitni birinchi marta o‘z ismingiz va emailingiz bilan sozlashni o‘rganamiz. E’tiboringiz uchun rahmat!"
    }
  ];

  g.NR = {
    course: 'Git darslari',
    chapter: '02-bob',
    title: "Terminal va o'rnatish",
    scenes,
    sceneNames,
    hold,
    lines
  };
})(typeof window !== 'undefined' ? window : globalThis);
