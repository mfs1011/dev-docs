// SQL 39-bob 3-qism: "Dialektlar" — Birlamchi kalitni tanlash
(function (g) {
  g.NR = {
    title: "SQL Birlamchi Kalitni Tanlash: Dialektlar",
    scenes: [
      "dialektlar_taqqoslovi",
      "uuid_va_auto_son",
      "tipik_xatolar",
      "oltin_qoidalar"
    ],
    sceneNames: {
      dialektlar_taqqoslovi: "Postgres, MySQL va SQLite Taqqoslovi",
      uuid_va_auto_son: "UUID va Avtomatik Son Generatsiyasi",
      tipik_xatolar: "Tipik Xatolar va Muammolar",
      oltin_qoidalar: "Birlamchi Kalit Tanlash Qoidalari"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "dialektlar_taqqoslovi",
        id: "l1",
        text: "Postgresda jadval kalit tartibida saqlanmaydi, MySQL InnoDB da esa qat'iy klasterli indeksda saqlanadi."
      },
      {
        scene: "dialektlar_taqqoslovi",
        id: "l2",
        text: "SQLite esa oddiy jadvallarda rowid bo'yicha, WITHOUT ROWID jadvallarida esa to'g'ridan-to'g'ri kalit bo'yicha klasterlaydi."
      },
      {
        scene: "uuid_va_auto_son",
        id: "l3",
        text: "Postgresda uuid v7 funksiyasi va GENERATED AS IDENTITY standarti eng xavfsiz va qulay usuldir."
      },
      {
        scene: "uuid_va_auto_son",
        id: "l4",
        text: "MySQL'da esa UUID_TO_BIN orqali o'n olti baytli binar saqlash va AUTO_INCREMENT ishlatiladi."
      },
      {
        scene: "tipik_xatolar",
        id: "l5",
        text: "MySQL'da matnli char 36 kalit ishlatish barcha ikkilamchi indekslarni qariyb uch baravarga shishirib yuboradi."
      },
      {
        scene: "tipik_xatolar",
        id: "l6",
        text: "Tasodifiy UUID v4 esa keshni yuvib yuboradi, shuning uchun katta jadvallarda tartibli v7 yoki butun son tanlash zarur."
      },
      {
        scene: "oltin_qoidalar",
        id: "l7",
        text: "SQLite'da WITHOUT ROWID faqat kompozit yoki qisqa qatorli jadvallar uchun foydali, bitta sonli kalitda oddiy jadval tezroq ishlaydi."
      },
      {
        scene: "oltin_qoidalar",
        id: "l8",
        text: "Standart holatda bigint, tarqoq tizimlarda esa tartibli UUID v7 ishlatish eng to'g'ri me'moriy qarordir."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
