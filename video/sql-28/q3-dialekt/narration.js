// SQL 28-bob 3-qism: Dialektlar — MySQL va SQLite da Set amallari farqlari
globalThis.NR = {
  scenes: ['kirish', 'mysql_xususiyatlari', 'sqlite_all_yoqligi', 'sqlite_ustuvorlik_yoqligi', 'sqlite_tartib_va_tiplar'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite Farqlari",
    mysql_xususiyatlari: "MySQL: Tiplar Kengayishi va Qulayliklar",
    sqlite_all_yoqligi: "SQLite: ALL Qo'shimchasi Yo'qligi",
    sqlite_ustuvorlik_yoqligi: "Katta Farq: SQLite da Ustuvorlik Yo'q!",
    sqlite_tartib_va_tiplar: "SQLite: Qismlarda Tartiblash va Tiplar",
  },
  hold: {
    intro: 0.8,
    mysql_tiplar: 1.0,
    mysql_order: 1.0,
    sqlite_all: 1.2,
    sqlite_precedence: 1.2,
    sqlite_subquery: 1.0,
    sqlite_tiplar: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "To'plam amallarida MySQL va SQLite tizimlarining xatti-harakatlari va jiddiy farqlarini ko'rib chiqamiz.",
    },
    {
      id: "mysql_tiplar",
      scene: "mysql_xususiyatlari",
      text: "MySQL da tiplar mos kelmasa xato bermaydi, balki umumiy matn tipiga o'tkazadi; shuningdek TABLE nom sintaksisini qo'llab-quvvatlaydi.",
    },
    {
      id: "mysql_order",
      scene: "mysql_xususiyatlari",
      text: "Bundan tashqari, MySQL da oxirgi ORDER BY da m qo'shuv n kabi ifodalar bilan bemalol saralash mumkin.",
    },
    {
      id: "sqlite_all",
      scene: "sqlite_all_yoqligi",
      text: "SQLite da INTERSECT ALL va EXCEPT ALL umuman mavjud emas va sintaksis xatosi beradi; faqat DISTINCT ko'rinishida ishlaydi.",
    },
    {
      id: "sqlite_precedence",
      scene: "sqlite_ustuvorlik_yoqligi",
      text: "Eng katta tuzoq: SQLite da INTERSECT ning ustuvorligi yo'q! Hammasi chapdan o'ngga bajariladi va PostgreSQL dan farqli ravishda ikki qator beradi.",
    },
    {
      id: "sqlite_subquery",
      scene: "sqlite_tartib_va_tiplar",
      text: "Alohida qismlarga LIMIT berish uchun qavs ishlamaydi, uni faqat FROM ichidagi hosila jadval orqali amalga oshirish mumkin.",
    },
    {
      id: "sqlite_tiplar",
      scene: "sqlite_tartib_va_tiplar",
      text: "Natijada har xil tiplar aralashib ketaveradi: bitta ustunda ham son, ham matn qiymati hech qanday konversiyasiz saqlanadi.",
    },
  ],
};
