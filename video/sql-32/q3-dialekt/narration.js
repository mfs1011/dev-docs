// SQL 32-bob 3-qism: Dialektlar — MySQL va SQLite da Shartli ifodalar
globalThis.NR = {
  scenes: ['kirish', 'greatest_null_farqi', 'mysql_qisqartmalari', 'sqlite_qisqartmalari', 'solishtirma_va_xulosa'],
  sceneNames: {
    kirish: "Dialektlar: Shartli Ifodalardagi Farqlar",
    greatest_null_farqi: "GREATEST va NULL: Standart va PostgreSQL",
    mysql_qisqartmalari: "MySQL: IF, IFNULL va Nolga Bo'lish",
    sqlite_qisqartmalari: "SQLite: iif, max/min va Tiplar",
    solishtirma_va_xulosa: "3 Dialekt Solishtirma Matritsasi va Xulosa",
  },
  hold: {
    intro: 0.8,
    greatest: 1.2,
    mysql: 1.2,
    sqlite: 1.2,
    xulosa: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "CASE, COALESCE va NULLIF barcha tizimlarda universal ishlaydi, ammo GREATEST va qisqartma funksiyalarda muhim farqlar bor.",
    },
    {
      id: "greatest",
      scene: "greatest_null_farqi",
      text: "PostgreSQL NULL qiymatni e'tiborsiz qoldirsa, MySQL va SQLite standart bo'yicha bitta NULL kelsa ham darhol NULL qaytaradi.",
    },
    {
      id: "mysql",
      scene: "mysql_qisqartmalari",
      text: "MySQL da IF va IFNULL qisqartmalari mavjud, nolga bo'lish ogohlantirish bilan NULL beradi, hamda CASE tiplari erkinroqdir.",
    },
    {
      id: "sqlite",
      scene: "sqlite_qisqartmalari",
      text: "SQLite da GREATEST o'rniga ko'p argumentli max funksiyasi ishlatiladi, hamda ixcham iif qisqartmasi to'liq mavjud.",
    },
    {
      id: "xulosa",
      scene: "solishtirma_va_xulosa",
      text: "Xulosa qilib aytganda, tizimlararo portativlik uchun standart CASE va COALESCE dan foydalanish eng to'g'ri strategiyadir.",
    },
  ],
};
