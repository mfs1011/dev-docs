// SQL 39-bob 1-qism: "Tushuncha" — Birlamchi kalitni tanlash
(function (g) {
  g.NR = {
    title: "SQL Birlamchi Kalitni Tanlash: Tushuncha",
    scenes: [
      "tabiiy_vs_suniy",
      "son_vs_uuid",
      "uuid_v4_vs_v7",
      "innodb_klaster",
      "postgres_va_sqlite"
    ],
    sceneNames: {
      tabiiy_vs_suniy: "Tabiiy va Sun'iy Kalitlar",
      son_vs_uuid: "Butun Son yoki UUID Tanlovi",
      uuid_v4_vs_v7: "UUID v4 va v7 Farqlari",
      innodb_klaster: "InnoDB Klasterli Indeksi",
      postgres_va_sqlite: "Postgres va SQLite Yondashuvi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.0,
      l10: 1.5
    },
    lines: [
      {
        scene: "tabiiy_vs_suniy",
        id: "l1",
        text: "Birlamchi kalit qatorning yagona identifikatori bo'lib, tabiiy yoki sun'iy turlarga bo'linadi."
      },
      {
        scene: "tabiiy_vs_suniy",
        id: "l2",
        text: "Email yoki telefon kabi tabiiy ma'lumotlar o'zgarishi mumkin, shuning uchun alohida sun'iy kalit ishlatish xavfsizroq."
      },
      {
        scene: "son_vs_uuid",
        id: "l3",
        text: "Avtomatik oshuvchi bigint atigi sakkiz bayt joy oladi va bitta markaziy baza tomonidan ketma-ket yaratiladi."
      },
      {
        scene: "son_vs_uuid",
        id: "l4",
        text: "O'n olti baytli UUID esa istalgan mikroxizmat yoki mobil ilovada bazaga murojaat qilmasdan generatsiya qilinadi."
      },
      {
        scene: "uuid_v4_vs_v7",
        id: "l5",
        text: "Tasodifiy UUID v4 indeks daraxtida sahifa bo'linishi va xotira shishishiga olib keladi."
      },
      {
        scene: "uuid_v4_vs_v7",
        id: "l6",
        text: "Vaqt bo'yicha tartiblangan UUID v7 esa ixcham saqlanadi, ammo yozuv yaratilgan vaqtni oshkor qiladi."
      },
      {
        scene: "innodb_klaster",
        id: "l7",
        text: "MySQL InnoDB dvigatelida butun jadval bevosita birlamchi kalit tartibida klasterli indeksda saqlanadi."
      },
      {
        scene: "innodb_klaster",
        id: "l8",
        text: "Har bir ikkilamchi indeks birlamchi kalit nusxasini olib yurgani uchun, uzun kalit barcha indekslarni shishiradi."
      },
      {
        scene: "postgres_va_sqlite",
        id: "l9",
        text: "Postgresda jadval kalitga bog'lanmagan uyumda yotsa, SQLite oddiy jadvallarda tezkor rowid daraxtidan foydalanadi."
      },
      {
        scene: "postgres_va_sqlite",
        id: "l10",
        text: "To'g'ri tanlangan birlamchi kalit xotirani tejaydi va butun arxitekturaning yuqori unumdorligini kafolatlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
