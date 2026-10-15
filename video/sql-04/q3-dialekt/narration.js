// SQL 4-bob, 3-video: "Dialektlar" — MySQL, SQLite va 6 ta tipik sintaksis xatosi
(function (g) {
  const scenes = ['intro', 'identifiers_case', 'strings_length', 'numbers_comments', 'traps', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    identifiers_case: 'Identifikatorlar va Katta-kichik harf',
    strings_length: 'Nom uzunligi va Satr farqlari',
    numbers_comments: 'Sonlar, Izohlar va Operatorlar',
    traps: '6 ta tipik xato',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L5: 1.0,
    L8: 1.0,
    L12: 1.0,
    L18: 1.0,
    L20: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! To‘rtinchi bobning uchinchi qismida PostgreSQL, MySQL va SQLite tizimlari o‘rtasidagi muhim sintaksis farqlarini va oltita xavfli tuzoqni ko‘rib chiqamiz.'],

    ['L2', 'identifiers_case', 'Identifikatorlarni o‘rashda katta farq bor: PostgreSQL standart qo‘shtirnoq ishlatadi, MySQL da esa bektik belgisi qabul qilingan.'],
    ['L3', 'identifiers_case', 'SQLite esa har ikkala usulni, hamda kvadrat qavslarni ham tushunadi.'],
    ['L4', 'identifiers_case', 'Katta-kichik harf masalasida MySQL juda xavfli tuzoqqa ega: uning lower_case_table_names parametri operatsion tizimga bog‘liq.'],
    ['L5', 'identifiers_case', 'macOS va Windows da harflar farq qilmasligi mumkin, ammo Linux serveriga o‘tganda katta harfli va kichik harfli jadvallar ikki xil jadvalga aylanadi va kod xato beradi!'],

    ['L6', 'strings_length', 'Nom uzunligida: PostgreSQL 63 baytdan oshgan nomni jimgina qisqartiradi. MySQL esa 64 belgidan oshsa, darhol 1059 xatosini qaytaradi.'],
    ['L7', 'strings_length', 'Satrlarda esa teskari chiziq qoidasi farq qiladi: oddiy a teskari chiziq en satri PostgreSQL da to‘rtta belgi bo‘lib qoladi.'],
    ['L8', 'strings_length', 'MySQL da esa u oddiy satr ichida ham darhol yangi qatorga aylanadi.'],

    ['L9', 'numbers_comments', 'Sonlar borasida: nol iks ef-ef PostgreSQL da 255 soni bo‘lsa, MySQL da u binar satr hisoblanadi va son qilish uchun nol qo‘shish kerak.'],
    ['L10', 'numbers_comments', 'Tagchiziqli bir ming ifodasi PostgreSQL va SQLite da son bo‘lsa, MySQL uni ustun nomi deb o‘ylab xato beradi.'],
    ['L11', 'numbers_comments', 'Izohlarda esa besh minus minus bir ifodasi MySQL da olti natijasini beradi, chunki MySQL da minus-minusdan keyin probel bo‘lishi shart!'],
    ['L12', 'numbers_comments', 'Shuningdek, MySQL da daraja belgisi darajaga ko‘tarish emas, balki bitli XOR amali hisoblanadi va bir natijasini beradi.'],

    ['L13', 'traps', 'Endi amaliyotdagi eng ko‘p uchraydigan oltita tipik xatoni ko‘rib chiqamiz.'],
    ['L14', 'traps', 'Birinchi xato: jadvalni qo‘shtirnoq bilan Mahsulot deb yaratib, keyin qo‘shtirnoqsiz chaqirish. PostgreSQL uni topa olmaydi.'],
    ['L15', 'traps', 'Ikkinchi xato: ORM larda aralash harfli nomlar qo‘llash. Doim pastki chiziqli kichik harflardan foydalaning.'],
    ['L16', 'traps', 'Uchinchi xato: ORDER yoki USER kabi kalit so‘zlarni nom qilish. Ular boshqa tizimga ko‘chirishda muammo tug‘diradi.'],
    ['L17', 'traps', 'To‘rtinchi xato: satr ichidagi tirnoqni teskari chiziq bilan qochirish. Standart usul — ikkita bitta tirnoq yozishdir.'],
    ['L18', 'traps', 'Beshinchi xato: a minus minus b ifodasini bo‘sh joysiz yozish. Va oltinchi xato: daraja belgisi hamma tizimda daraja deb o‘ylash.'],

    ['L19', 'xulosa', 'Shu bilan SQL sintaksisi bobini yakunladik. Qoidalarni to‘g‘ri qo‘llash sizni yuzlab yashirin xatolardan asraydi.'],
    ['L20', 'xulosa', 'Keyingi beshinchi bobda baza, sxema va jadvallar tuzilishini batafsil o‘rganamiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
