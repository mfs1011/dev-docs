// SQL 26-bob 3-qism: Dialektlar — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'mysql_xususiyatlari', 'mysql_filter_va_rollup', 'sqlite_bare_columns', 'xulosa'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite",
    mysql_xususiyatlari: "MySQL: ONLY_FULL_GROUP_BY va GROUP_CONCAT",
    mysql_filter_va_rollup: "MySQL da FILTER va ROLLUP farqi",
    sqlite_bare_columns: "SQLite: Yalang'och ustunlar va TOTAL",
    xulosa: "Xulosa va qiyosiy xulosa",
  },
  hold: {
    g1: 1.0,
    g3: 1.2,
    g5: 1.2,
    g8: 1.2,
    g9: 1.2,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "MySQL va SQLite tizimlarida agregatsiya va guruhlashda muhim o'ziga xosliklar mavjud." },
    { id: 'g2', scene: 'mysql_xususiyatlari', text: "MySQL da ONLY_FULL_GROUP_BY rejimi sukut bo'yicha yoqilgan, guruhlanmagan ustun uchun esa ANY_VALUE funksiyasi tavsiya qilinadi." },
    { id: 'g3', scene: 'mysql_xususiyatlari', text: "Satrlarni birlashtirishda string_agg o'rniga GROUP_CONCAT ishlatiladi, ammo uning maksimal uzunligi cheklangan." },
    { id: 'g4', scene: 'mysql_filter_va_rollup', text: "MySQL da FILTER sintaksisi mavjud emas, uning o'rniga CASE WHEN ifodasi yoki shartlar yig'indisi olinadi." },
    { id: 'g5', scene: 'mysql_filter_va_rollup', text: "ROLLUP va GROUPING qo'llab-quvvatlansa-da, CUBE va GROUPING SETS sintaksisda yo'q." },
    { id: 'g6', scene: 'sqlite_bare_columns', text: "SQLite da esa guruhlanmagan yalang'och ustunlarga ruxsat beriladi." },
    { id: 'g7', scene: 'sqlite_bare_columns', text: "Agar so'rovda bitta MAX yoki MIN bo'lsa, ustun qiymati aynan o'sha qatordan olinadi." },
    { id: 'g8', scene: 'sqlite_bare_columns', text: "Shuningdek, bo'sh to'plamda nol qaytaruvchi TOTAL funksiyasi ham bor." },
    { id: 'g9', scene: 'xulosa', text: "Uchala tizim farqlarini to'g'ri tushunish yozilgan so'rovlarning har doim aniq va xatosiz ishlashini kafolatlaydi." },
  ],
};
