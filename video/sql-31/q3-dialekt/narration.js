// SQL 31-bob 3-qism: Dialektlar — MySQL va SQLite da Window funksiyalar
globalThis.NR = {
  scenes: ['kirish', 'mysql_groups_va_exclude', 'mysql_filter_va_limitations', 'sqlite_mukammal_frame', 'solishtirma_va_xulosa'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite Farqlari",
    mysql_groups_va_exclude: "MySQL: GROUPS va EXCLUDE Yo'qligi (1235 Xatosi)",
    mysql_filter_va_limitations: "MySQL: FILTER Yo'qligi va Cheklovlar",
    sqlite_mukammal_frame: "SQLite: To'liq Frame va Oyna Zanjiri",
    solishtirma_va_xulosa: "3 Dialekt Solishtirma Matritsasi va Xulosa",
  },
  hold: {
    intro: 0.8,
    groups: 1.2,
    filter: 1.2,
    sqlite: 1.2,
    xulosa: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "MySQL va SQLite tizimlarida oyna funksiyalarining qo'llab-quvvatlanishi va ramka sintaksisidagi cheklovlarni solishtiramiz.",
    },
    {
      id: "groups",
      scene: "mysql_groups_va_exclude",
      text: "MySQL da GROUPS va EXCLUDE kalit so'zlari sintaksis tahlilidan o'tadi, ammo amalda bir ming ikki yuz o'ttiz besh xatosi bilan to'xtaydi.",
    },
    {
      id: "filter",
      scene: "mysql_filter_va_limitations",
      text: "Shuningdek, MySQL da FILTER bandi yo'qligi bois shartli sanash uchun CASE WHEN ishlatiladi, DISTINCT esa oyna ichida ruxsat etilmagan.",
    },
    {
      id: "sqlite",
      scene: "sqlite_mukammal_frame",
      text: "Kutilmaganda, SQLite da GROUPS, EXCLUDE va FILTER to'liq ishlaydi, hamda mavjud oynani kengaytiruvchi oyna zanjiri mavjud.",
    },
    {
      id: "xulosa",
      scene: "solishtirma_va_xulosa",
      text: "Xulosa qilib aytganda, sukutdagi ramka barcha tizimda bir xil, murakkab ramkalar uchun esa PostgreSQL va SQLite eng boy imkoniyatga ega.",
    },
  ],
};
