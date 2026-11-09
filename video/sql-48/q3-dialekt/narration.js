// SQL 48-bob 3-qism: "Dialektlar" — Sahifalash
(function (g) {
  g.NR = {
    title: "SQL Sahifalash: Dialektlar",
    scenes: [
      "mysql_offset_va_row_constructor_scan",
      "mysql_or_yozuvi_150x_tezlashuv",
      "sqlite_row_values_va_search",
      "sahifalash_uch_tizim_xulosasi"
    ],
    sceneNames: {
      mysql_offset_va_row_constructor_scan: "MySQL: OFFSET va Qator Konstruktori",
      mysql_or_yozuvi_150x_tezlashuv: "MySQL: OR Yozuvi va 150x Tezlashuv",
      sqlite_row_values_va_search: "SQLite: Row Values va SEARCH Mexanizmi",
      sahifalash_uch_tizim_xulosasi: "Uch Tizim Taqqoslash Jadvali va Xulosa"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_offset_va_row_constructor_scan",
        id: "l1",
        text: "May es-kyu-elda ham to'qqiz yuz minginchi ofset yetmish uch millisekund vaqt olib, deyarli bir million yozuvni o'qiydi."
      },
      {
        scene: "mysql_offset_va_row_constructor_scan",
        id: "l2",
        text: "Biroq qator konstruktori berilganda May es-kyu-el undan indeks orqali foydalana olmay, to'qson millisekundlik to'liq skanga tushadi."
      },
      {
        scene: "mysql_or_yozuvi_150x_tezlashuv",
        id: "l3",
        text: "Aksincha, shartni o-er amali bilan teng ifodaga aylantirganimizda oraliq qidiruvi ishga tushib, vaqt nol butun ellik sakkiz millisekundga qisqaradi."
      },
      {
        scene: "mysql_or_yozuvi_150x_tezlashuv",
        id: "l4",
        text: "Bu Postgresga mutlaqo teskari natija bo'lib, May es-kyu-el hujjatida ham shartni o-er bilan yozish tavsiya qilingan."
      },
      {
        scene: "sqlite_row_values_va_search",
        id: "l5",
        text: "Es-kyu-laytda esa rou valyus mexanizmi xuddi Postgres kabi mukammal ishlaydi va indeksli qidiruvni faollashtiradi."
      },
      {
        scene: "sqlite_row_values_va_search",
        id: "l6",
        text: "Sinovimizda ofset yetti millisekund olgan bo'lsa, kursorli qidiruv atigi nol butun yuzdan uch millisekundda bajarildi."
      },
      {
        scene: "sahifalash_uch_tizim_xulosasi",
        id: "l7",
        text: "Xulosa qilib aytganda, Postgres va Es-kyu-laytda qator konstruktori, May es-kyu-elda esa o-er sharti eng tezkor natija beradi."
      },
      {
        scene: "sahifalash_uch_tizim_xulosasi",
        id: "l8",
        text: "Ilovangiz bir nechta bazani qo'llasa, sahifalash so'rovlarini har bir tizimning ekspleyn rejasi bilan alohida tekshiring."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
