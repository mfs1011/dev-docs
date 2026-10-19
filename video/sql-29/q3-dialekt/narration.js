// SQL 29-bob 3-qism: Dialektlar — MySQL va SQLite da CTE farqlari
globalThis.NR = {
  scenes: ['kirish', 'mysql_limit_va_update', 'sqlite_materialized_hint', 'sqlite_forward_ref', 'chegaralar'],
  sceneNames: {
    kirish: "Dialektlar: MySQL va SQLite Farqlari",
    mysql_limit_va_update: "MySQL: INSERT va UPDATE dagi Xususiyatlar",
    sqlite_materialized_hint: "SQLite: MATERIALIZED Maslahati",
    sqlite_forward_ref: "SQLite: Oldinga Murojaat Xulqi",
    chegaralar: "O'zgartiruvchi CTE Cheklovlari",
  },
  hold: {
    intro: 0.8,
    mysql_insert: 1.2,
    sqlite_mat: 1.0,
    sqlite_forward: 1.2,
    chegaralar: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "MySQL va SQLite tizimlarida CTE sintaksisi va optimizatsiyasidagi asosiy farqlarni tahlil qilamiz.",
    },
    {
      id: "mysql_insert",
      scene: "mysql_limit_va_update",
      text: "MySQL da WITH bilan INSERT boshlab bo'lmaydi, lekin UPDATE ichida o'sha jadvaldan o'qishdagi ming to'qson uch xatosi CTE bilan ajoyib hal qilinadi.",
    },
    {
      id: "sqlite_mat",
      scene: "sqlite_materialized_hint",
      text: "SQLite da MATERIALIZED va NOT MATERIALIZED so'zlari bor, ammo ular majburiy emas, shunchaki optimizator uchun maslahat hisoblanadi.",
    },
    {
      id: "sqlite_forward",
      scene: "sqlite_forward_ref",
      text: "Qiziq jihati: PostgreSQL va MySQL xato bergan oldinga murojaat SQLite da jimgina xatosiz ishlab ketadi, ammo bunga tayanmaslik lozim.",
    },
    {
      id: "chegaralar",
      scene: "chegaralar",
      text: "Shuningdek, har ikki tizimda ham CTE ichida DELETE yoki UPDATE amallari qo'llab-quvvatlanmaydi: CTE faqat SELECT so'rovlari uchundir.",
    },
  ],
};
