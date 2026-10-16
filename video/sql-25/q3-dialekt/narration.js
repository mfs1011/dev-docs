// SQL 25-bob 3-qism: Dialektlar — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'mysql_xususiyatlari', 'sqlite_xususiyatlari', 'vergul_va_lateral', 'xulosa'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite",
    mysql_xususiyatlari: "MySQL: FULL JOIN yo'qligi va UNION",
    sqlite_xususiyatlari: "SQLite: FULL va CROSS JOIN",
    vergul_va_lateral: "Vergul ustuvorligi va LATERAL",
    xulosa: "Xulosa va amaliy tavsiyalar",
  },
  hold: {
    g1: 1.0,
    g4: 1.2,
    g6: 1.2,
    g8: 1.2,
    g9: 1.2,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "MySQL va SQLite tizimlarida JOIN sintaksisining o'ziga xos va xavfli jihatlari mavjud." },
    { id: 'g2', scene: 'mysql_xususiyatlari', text: "MySQL da JOIN, CROSS JOIN va INNER JOIN bir xil, shuning uchun ON siz ham qabul qilinib Dekart ko'paytma beradi." },
    { id: 'g3', scene: 'mysql_xususiyatlari', text: "Eng muhimi, MySQL da FULL JOIN umuman yo'q, FULL so'zi jadval tahlusiga aylanib qoladi." },
    { id: 'g4', scene: 'mysql_xususiyatlari', text: "Yechim — LEFT va RIGHT natijalarini UNION bilan birlashtirishdir." },
    { id: 'g5', scene: 'sqlite_xususiyatlari', text: "SQLite esa RIGHT va FULL JOIN ni to'liq qo'llab-quvvatlaydi." },
    { id: 'g6', scene: 'sqlite_xususiyatlari', text: "Biroq bu yerda CROSS JOIN optimizatorga jadvallar ketma-ketligini o'zgartirishni taqiqlash uchun xizmat qiladi." },
    { id: 'g7', scene: 'vergul_va_lateral', text: "Standartda JOIN verguldan oldin bajariladi, SQLite da esa barcha amallar chapdan o'ngga teng ustuvorlikda ishlaydi." },
    { id: 'g8', scene: 'vergul_va_lateral', text: "Shuningdek, LATERAL MySQL da mavjud bo'lsa-da, SQLite da bu imkoniyat yo'q." },
    { id: 'g9', scene: 'xulosa', text: "Har bir tizimning nozik jihatlarini hisobga olish so'rovlarning to'g'ri va xavfsiz ishlashini ta'minlaydi." },
  ],
};
