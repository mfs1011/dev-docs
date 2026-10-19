// SQL 27-bob 3-qism: Dialektlar — MySQL va SQLite da Subquery farqlari
globalThis.NR = {
  scenes: ['kirish', 'mysql_errors', 'mysql_limit_update', 'sqlite_any_all', 'sqlite_kengaytma'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite Farqlari",
    mysql_errors: "MySQL: 1242 va 1248 Xatolari",
    mysql_limit_update: "MySQL: LIMIT va UPDATE Cheklovlari",
    sqlite_any_all: "SQLite: ANY va ALL Yo'qligi",
    sqlite_kengaytma: "SQLite: Skalyar va Jadval Kengaytmasi",
  },
  hold: {
    intro: 0.8,
    mysql_errors: 1.0,
    mysql_limit: 1.0,
    mysql_update: 1.2,
    sqlite_any_all: 1.0,
    sqlite_bare_scalar: 1.2,
    sqlite_kengaytma: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "MySQL va SQLite tizimlarida subquery imkoniyatlari va ulardagi o'ziga xos cheklovlarni tahlil qilamiz.",
    },
    {
      id: "mysql_errors",
      scene: "mysql_errors",
      text: "MySQL da skalyar ko'p qator bersa ming ikki yuz qirq ikki xatosi chiqadi, hosila jadvalga alias berilmasa esa ming ikki yuz qirq sakkiz xatosi ro'y beradi.",
    },
    {
      id: "mysql_limit",
      scene: "mysql_limit_update",
      text: "MySQL da IN yoki ALL ichida LIMIT ishlatib bo'lmaydi. Yechim sifatida LIMIT li so'rovni qo'shimcha hosila jadvalga o'rab olish kerak.",
    },
    {
      id: "mysql_update",
      scene: "mysql_limit_update",
      text: "Eng mashhur cheklov: o'zgartirilayotgan jadvaldan subquery ichida to'g'ridan-to'g'ri o'qib bo'lmaydi. Buning uchun hosila jadval materializatsiyasidan foydalanamiz.",
    },
    {
      id: "sqlite_any_all",
      scene: "sqlite_any_all",
      text: "SQLite da ANY va ALL kalit so'zlari umuman yo'q. Ular o'rniga MAX yoki MIN agregatlari ishlatiladi, ammo NULL xususiyatlarini inobatga olish shart.",
    },
    {
      id: "sqlite_bare_scalar",
      scene: "sqlite_kengaytma",
      text: "Katta e'tibor: SQLite da skalyar subquery ko'p qator qaytarsa xato bermaydi, balki jimgina birinchi qator qiymatini tanlab oladi.",
    },
    {
      id: "sqlite_kengaytma",
      scene: "sqlite_kengaytma",
      text: "Shuningdek, SQLite da hosila jadvalga nom berish majburiy emas va to'g'ridan-to'g'ri jadval nomini IN dan keyin yozish imkoniyati mavjud.",
    },
  ],
};
