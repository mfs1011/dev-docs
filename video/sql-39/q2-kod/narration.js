// SQL 39-bob 2-qism: "Kod" — Birlamchi kalitni tanlash
(function (g) {
  g.NR = {
    title: "SQL Birlamchi Kalitni Tanlash: Kod",
    scenes: [
      "pg_indeks_hajmi",
      "mysql_ikkilamchi",
      "sqlite_without_rowid",
      "sqlite_cheklovlar"
    ],
    sceneNames: {
      pg_indeks_hajmi: "PostgreSQL: Kalit Indeksi O'lchami",
      mysql_ikkilamchi: "MySQL InnoDB: Ikkilamchi Indeks",
      sqlite_without_rowid: "SQLite: WITHOUT ROWID Sintaksisi",
      sqlite_cheklovlar: "SQLite Cheklovlari va Xatolar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "pg_indeks_hajmi",
        id: "l1",
        text: "Postgresda yuz ming qatorda bigint kalit indeksi 2.2 megabayt, uuid v7 esa 3.1 megabayt joy oldi."
      },
      {
        scene: "pg_indeks_hajmi",
        id: "l2",
        text: "Uuid v4 ham o'n olti bayt bo'lsa-da, tasodifiy tartibi tufayli indeksi 4.4 megabaytga yetib qirq foizga shishdi."
      },
      {
        scene: "mysql_ikkilamchi",
        id: "l3",
        text: "MySQL InnoDB jadvallarida x ustunidagi bir xil ikkilamchi indeks hajmini tekshiramiz."
      },
      {
        scene: "mysql_ikkilamchi",
        id: "l4",
        text: "Butun sonli kalitda indeks 1.5 megabayt bo'lsa, char 36 matnli kalitda 2.5 megabaytga ko'paydi."
      },
      {
        scene: "sqlite_without_rowid",
        id: "l5",
        text: "SQLite'da WITHOUT ROWID bilan yaratilgan jadvalda tizimli rowid ustuni bo'lmaydi."
      },
      {
        scene: "sqlite_without_rowid",
        id: "l6",
        text: "Bunday jadvalga rowid so'rovi berilsa xato qaytadi va qatorlar to'g'ridan-to'g'ri kalit bo'yicha klasterlanadi."
      },
      {
        scene: "sqlite_cheklovlar",
        id: "l7",
        text: "WITHOUT ROWID jadvallarida AUTOINCREMENT taqiqlangan va birlamchi kalit majburiy hisoblanadi."
      },
      {
        scene: "sqlite_cheklovlar",
        id: "l8",
        text: "Oddiy jadvaldan farqli o'laroq, bo'sh qoldirilgan sonli kalit avtomatik to'lmaydi va NOT NULL xatosi beradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
