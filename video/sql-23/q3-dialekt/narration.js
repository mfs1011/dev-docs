// SQL 23-bob, 3-video: "Dialektlar" — MySQL va SQLite da Filtrlash Farqlari
(function (g) {
  const scenes = ['intro', 'mysql_like_nullsafe', 'sqlite_ascii_unicode', 'sqlite_glob_escape', 'sqlite_is_not', 'xulosa'];
  const sceneNames = {
    intro: 'MySQL va SQLite da filtrlash farqlari',
    mysql_like_nullsafe: 'MySQL: LIKE registri va <=> tenglik',
    sqlite_ascii_unicode: 'SQLite: LIKE va ASCII vs Unicode tuzog‘i',
    sqlite_glob_escape: 'SQLite: GLOB va ESCAPE o‘ziga xosligi',
    sqlite_is_not: 'SQLite: IS NOT va REGEXP funksiyasi',
    xulosa: 'Uch tizim qiyosiy xulosasi'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Filtrlash operatorlari MySQL va SQLite tizimlarida o‘ziga xos farqlarga ega: ayniqsa registr sezgirligi, NULL bilan ishlash va qidiruv namunalarida.'],

    ['L2', 'mysql_like_nullsafe', 'MySQL da LIKE odatda registrga sezgir emas, ammo unda IS DISTINCT FROM mavjud bo‘lmagani sababli maxsus <=> operatori qo‘llaniladi.'],

    ['L3', 'sqlite_ascii_unicode', 'SQLite esa LIKE da faqat ASCII harflarining kattaligiga e’tibor bermaydi; o‘zbekcha yoki xalqaro unli harflarda esa u kutilmaganda registrga sezgir bo‘lib qoladi.'],

    ['L4', 'sqlite_glob_escape', 'Shuningdek, SQLite da teskari chiziq sukut bo‘yicha escape belgisi hisoblanmaydi, fayl nomlari uslubida qidirish uchun esa GLOB operatori xizmat qiladi.'],

    ['L5', 'sqlite_is_not', 'SQLite da IS NOT operatori to‘liq NULL-xavfsiz ishlaydi; REGEXP esa faqat dastur kodida maxsus funksiya ulangandagina natija beradi.'],

    ['L6', 'xulosa', 'Doimo tizimlararo tafovutlarni inobatga olish, escape belgilarini aniq ko‘rsatish va portabel SQL yozish loyihaning barqaror ishlash garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
