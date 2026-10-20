// SQL 41-bob 3-qism: "Dialektlar" — Indeks qanday ishlaydi
(function (g) {
  g.NR = {
    title: "SQL Indeks Qanday Ishlaydi: Dialektlar",
    scenes: [
      "mysql_va_innodb_qoplamasi",
      "rejalashtiruvchi_xatosi_va_ignore_index",
      "sqlite_rowid_va_not_indexed",
      "solishtirma_va_tipik_xatolar"
    ],
    sceneNames: {
      mysql_va_innodb_qoplamasi: "MySQL InnoDB: Birlamchi Kalit va Qoplash",
      rejalashtiruvchi_xatosi_va_ignore_index: "Rejalashtiruvchi Xatosi va IGNORE INDEX",
      sqlite_rowid_va_not_indexed: "SQLite: rowid, SCAN/SEARCH va NOT INDEXED",
      solishtirma_va_tipik_xatolar: "Dialektlar Xulosasi va Tipik Xatolar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_va_innodb_qoplamasi",
        id: "l1",
        text: "May es-kyu-elda ikkilamchi indeks kalit bilan birga jadvalning birlamchi kalitini ham o'zida saqlaydi."
      },
      {
        scene: "mysql_va_innodb_qoplamasi",
        id: "l2",
        text: "Shu sababli birlamchi kalit ustunini so'rash avtomatik ravishda qoplovchi indeks qidiruviga aylanadi."
      },
      {
        scene: "rejalashtiruvchi_xatosi_va_ignore_index",
        id: "l3",
        text: "To'qson sakkiz foiz qator tanlanganda May es-kyu-el rejalashtiruvchisi xato hisoblab indeksni tanlab yubordi."
      },
      {
        scene: "rejalashtiruvchi_xatosi_va_ignore_index",
        id: "l4",
        text: "Oqibatda so'rov uch baravar sekinlashdi, ignor indeks buyrug'i esa to'liq skanerlash bilan tezlikni qaytardi."
      },
      {
        scene: "sqlite_rowid_va_not_indexed",
        id: "l5",
        text: "Es-kyu-laytda qidiruv rejasi skan va so'rch orqali ko'rsatilib, butun sonli kalit rou-ay-di deb ataladi."
      },
      {
        scene: "sqlite_rowid_va_not_indexed",
        id: "l6",
        text: "Indeks orqasiga rou-ay-di yopishgani uchun u ham qoplovchi rejimda ishlaydi, not indeksd esa uni chetlab o'tadi."
      },
      {
        scene: "solishtirma_va_tipik_xatolar",
        id: "l7",
        text: "Uchala ma'lumotlar bazasida ham indekslar bi-tri daraxti bo'lib, har bir ustunga indeks qo'yish xatodir."
      },
      {
        scene: "solishtirma_va_tipik_xatolar",
        id: "l8",
        text: "Ishlatilmaydigan indekslarni o'chirish va rejani ekspleyn analayz bilan tekshirish eng to'g'ri amaliyotdir."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
