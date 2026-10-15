// SQL 7-bob, 3-video: "Dialektlar" — MySQL, SQLite va 6 ta tipik xato
(function (g) {
  const scenes = ['intro', 'mysql', 'sqlite', 'comparison', 'traps', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    mysql: 'MySQL: Qator hajmi va TEXT oilasi',
    sqlite: 'SQLite: Type Affinity va cheksiz VARCHAR',
    comparison: 'Uch tizim taqqoslash taxtasi',
    traps: '6 ta tipik xato',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L17: 1.0,
    L19: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Yettinchi bobning uchinchi qismida MySQL va SQLite tizimlarining matn hamda binar ma’lumotlar bilan ishlashdagi o‘ziga xosliklarini, va amaliyotdagi oltita xavfli xatoni ko‘rib chiqamiz.'],

    ['L2', 'mysql', 'MySQL da char va varchar turlari mavjud. Char saqlashda bo‘shliqlar bilan to‘ldirilib, o‘qishda oxiridagi bo‘shliqlar olib tashlanadi. Varchar esa oxiridagi probellarni saqlaydi.'],
    ['L3', 'mysql', 'Eng muhim cheklov — MySQL da qatorning umumiy hajmi oltmish besh ming besh yuz o‘ttiz besh baytdan oshmasligi kerak. Shu sababli bir nechta yirik varchar ustun yaratilsa, xatolik yuz beradi.'],
    ['L4', 'mysql', 'Katta matnlar uchun MySQL da tayni-tekst, tekst, mediyum-tekst va long-tekst oilasi ishlatiladi. Biroq ularga difolt qiymat berib bo‘lmaydi va indeks uchun prefiks uzunligi ko‘rsatilishi shart.'],
    ['L5', 'mysql', 'Bundan tashqari, MySQL dagi sukut bo‘yicha collation katta-kichik harflarni farqlamaydi, ya’ni katta harfli Salom kichik harfli salomga teng hisoblanadi.'],

    ['L6', 'sqlite', 'SQLite da esa qat’iy turlar yo‘q: qavs ichida yozilgan uzunlik, masalan varchar besh butunlay e’tiborsiz qoldiriladi.'],
    ['L7', 'sqlite', 'Siz varchar besh ustuniga o‘n sakkiz belgili matn yozsangiz ham, SQLite uni xatosiz qabul qiladi. Cheklov faqat umumiy bir milliard baytlik limitga bog‘liq.'],
    ['L8', 'sqlite', 'Shuningdek, SQLite matn ichida nol baytlarni saqlashga ruxsat beradi, PostgreSQL da esa bu qat’iy taqiqlangan.'],

    ['L9', 'comparison', 'Uchala tizimni taqqoslasak: PostgreSQL da har doim qat’iy uzunlik va aniq matn tekshiruvi amal qiladi.'],
    ['L10', 'comparison', 'MySQL da qat’iy rejim yoqilgan bo‘lishi zarur, aks holda uzun matnlar xatosiz jimgina kesib qo‘yilishi mumkin.'],
    ['L11', 'comparison', 'SQLite da esa uzunlikni cheklash uchun albatta chek cheklovini yozish kerak bo‘ladi.'],

    ['L12', 'traps', 'Endi matn va binar ma’lumotlar bilan ishlashdagi oltita eng ko‘p uchraydigan xatoni tahlil qilamiz.'],
    ['L13', 'traps', 'Birinchi xato: PostgreSQL da har bir matn ustuniga o‘ylab topilgan varchar ikki yuz ellik besh yozish. Bu yerda oddiy tekst ishlatish tavsiya etiladi.'],
    ['L14', 'traps', 'Ikkinchi xato: MySQL dagi tekst turiga oltmish besh mingta belgi sig‘adi deb o‘ylash. Limit baytlarda bo‘lgani uchun, ko‘p baytli belgilar ancha kam sig‘adi.'],
    ['L15', 'traps', 'Uchinchi xato: MySQL da bir nechta katta varchar ochib, umumiy oltmish besh ming baytlik qator chegarasiga urilish.'],
    ['L16', 'traps', 'To‘rtinchi xato: SQLite dagi varchar ustuni matn uzunligini o‘zi tekshiradi deb ishonish.'],
    ['L17', 'traps', 'Beshinchi xato: MySQL dan PostgreSQL ga o‘tganda katta-kichik harf farqini inobatga olmaslik.'],
    ['L18', 'traps', 'Oltinchi xato: binar fayllarni oddiy matn ustunida saqlashga urinish. Bu nol baytlar tufayli xatoliklarga olib keladi.'],

    ['L19', 'xulosa', 'Shu bilan matn va binar ma’lumotlar turlarini to‘liq tahlil qilib chiqdik. Keyingi bobda sana va vaqt turlari bilan tanishamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
