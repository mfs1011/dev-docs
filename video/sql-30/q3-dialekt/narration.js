// SQL 30-bob 3-qism: Dialektlar — MySQL va SQLite da Rekursiv CTE
globalThis.NR = {
  scenes: ['kirish', 'mysql_limit_va_syntax', 'mysql_tiplar_va_limit', 'sqlite_queue_va_order_by', 'sqlite_ixtiyoriy_recursive'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite Farqlari",
    mysql_limit_va_syntax: "MySQL: VALUES ROW va SEARCH/CYCLE Yo'qligi",
    mysql_tiplar_va_limit: "MySQL: Tiplar Kengligi va Daraja Cheklovi",
    sqlite_queue_va_order_by: "SQLite: Navbat Algoritmi va Ichki ORDER BY",
    sqlite_ixtiyoriy_recursive: "SQLite: Ixtiyoriy RECURSIVE va Xulosa",
  },
  hold: {
    intro: 0.8,
    mysql_syntax: 1.2,
    mysql_tiplar: 1.2,
    sqlite_queue: 1.2,
    sqlite_ixtiyoriy: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "MySQL va SQLite tizimlarida rekursiv CTE mexanizmi va dialektlarga xos bo'lgan nozik jihatlarni tahlil qilamiz.",
    },
    {
      id: "mysql_syntax",
      scene: "mysql_limit_va_syntax",
      text: "MySQL da VALUES ROW shaklida yozilishi shart, SEARCH va CYCLE bandlari yo'qligi sababli yo'llar CONCAT orqali qo'lda yig'iladi.",
    },
    {
      id: "mysql_tiplar",
      scene: "mysql_tiplar_va_limit",
      text: "Ustun kengligi faqat boshlang'ich qismdan olingani uchun CAST yordamida zaxira joy ajratish kerak, shuningdek mingta qadamlik himoya chegarasi mavjud.",
    },
    {
      id: "sqlite_queue",
      scene: "sqlite_queue_va_order_by",
      text: "SQLite rekursiyani navbat orqali bajaradi va rekursiv qism ichida ORDER BY ishlatib chuqurlik yoki kenglik tartibini bevosita boshqarish mumkin.",
    },
    {
      id: "sqlite_ixtiyoriy",
      scene: "sqlite_ixtiyoriy_recursive",
      text: "Hatto RECURSIVE kalit so'zi yozilmasa ham SQLite da rekursiya ishlayveradi, biroq kod ko'chirilishi uchun doim standartga amal qiling.",
    },
  ],
};
