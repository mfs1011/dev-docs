// SQL 14-bob, 3-video: "Dialektlar" — MySQL, SQLite va Tipik Xatolar
(function (g) {
  const scenes = ['intro', 'mysql_demo', 'sqlite_demo', 'taqqoslash', 'tuzoqlar', 'xulosa'];
  const sceneNames = {
    intro: 'Dialektlar: Cheklovlar xususiyatlari',
    mysql_demo: 'MySQL: CHECK va avtomatik indekslash',
    sqlite_demo: 'SQLite: PRAGMA foreign_keys = ON',
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
    ['L1', 'intro', 'Dialektlar qismida MySQL va SQLite ning cheklovlar bilan ishlashdagi o‘ziga xos jihatlari, taqqoslash doskasi hamda asosiy tuzoqlarni ko‘rib chiqamiz.'],

    ['L2', 'mysql_demo', 'MySQL da CHECK cheklovi faqat yangi versiyalarda to‘liq ishlay boshladi, shuningdek MySQL tashqi kalit yaratilganda bola ustunga avtomatik indeks qo‘yishi bilan PostgreSQL dan farq qiladi.'],

    ['L3', 'sqlite_demo', 'SQLite dagi eng xavfli jihat: PRAGMA foreign_keys sukut bo‘yicha o‘chiq bo‘ladi va mavjud bo‘lmagan otaga ham qator qo‘shishga ruxsat beradi. U faqat ON buyrug‘i bilan yoqilgandagina himoya ishlaydi.'],

    ['L4', 'taqqoslash', 'Uch tizimni qiyoslasak: PostgreSQL da qat\'iy standart va boy imkoniyatlar, MySQL da avtomatik indekslash, SQLite da esa qat\'iy yoqilishi shart bo‘lgan tashqi kalitlar mexanizmi mavjud.'],

    ['L5', 'tuzoqlar', 'Eng keng tarqalgan xato — CHECK chekloviga tayanib, NOT NULL ni unutishdir. Shuningdek tashqi kalit ustunlarini indekslamaslik ota qator o‘chirilganda butun jadvalni qotirib qo‘yishi mumkin.'],

    ['L6', 'xulosa', 'Har bir ma\'lumotlar bazasining cheklov qoidalarini chuqur bilish orqali ishonchli va xatolarga chidamli arxitektura qurasiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
