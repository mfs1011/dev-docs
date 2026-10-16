// SQL 15-bob, 3-video: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
(function (g) {
  const scenes = ['intro', 'mysql_demo', 'sqlite_demo', 'taqqoslash', 'tuzoqlar', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: Generated ustunlar',
    mysql_demo: 'MySQL: Virtual indeks va zanjir murojaati',
    sqlite_demo: 'SQLite: Qisqa sintaksis va STORED tuzog‘i',
    taqqoslash: 'Taqqoslash: PostgreSQL vs MySQL vs SQLite',
    tuzoqlar: 'Tipik xatolar va tavsiyalar',
    xulosa: 'Xulosa'
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
    ['L1', 'intro', 'Dialektlar qismida MySQL va SQLite ning hisoblanadigan ustunlar bilan ishlashdagi o‘ziga xos imkoniyatlari, solishtirish doskasi hamda asosiy tuzoqlarni ko‘rib chiqamiz.'],

    ['L2', 'mysql_demo', 'MySQL da virtual ustunlarga InnoDB ikkilamchi indeks qo‘yish mumkin va PostgreSQL dan farqli ravishda generated ustun o‘zidan oldin e\'lon qilingan boshqa generated ustunga tayana oladi.'],

    ['L3', 'sqlite_demo', 'SQLite da sintaksis juda sodda: GENERATED ALWAYS ixtiyoriy bo‘lib, faqat AS ifodasi yetarli. Biroq eng katta cheklov — ALTER TABLE orqali ma\'lumotli jadvalga STORED ustun qo‘shib bo‘lmaydi.'],

    ['L4', 'taqqoslash', 'Uch tizimni qiyoslasak: barchasi sukut bo‘yicha virtual ustun yaratadi, lekin zanjir murojaatlari, indekslash mexanizmlari va jadvalni o‘zgartirish qoidalarida muhim farqlar mavjud.'],

    ['L5', 'tuzoqlar', 'Eng keng tarqalgan xato — now() bilan vaqtni hisoblamoqchi bo‘lish, ko‘p o‘qiladigan og‘ir virtual ustunni indekssiz qoldirish hamda SQLite da STORED ustun qo‘shishda xatoga yo‘liqishdir.'],

    ['L6', 'xulosa', 'Har bir tizimning o‘ziga xos nozikliklarini bilish orqali hisob-kitoblari tez va arxitekturasi mustahkam ma\'lumotlar bazalarini qurasiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
