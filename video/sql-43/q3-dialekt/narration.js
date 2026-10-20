// SQL 43-bob 3-qism: "Dialektlar" — Maxsus indekslar
(function (g) {
  g.NR = {
    title: "SQL Maxsus Indekslar: Dialektlar",
    scenes: [
      "mysql_kollatsiya_va_funksional",
      "sqlite_algebra_va_nocase",
      "qisman_indeks_farqlari",
      "dialektlar_jadvali_va_xatolar"
    ],
    sceneNames: {
      mysql_kollatsiya_va_funksional: "MySQL: Case-Insensitive Collation va Funksional Indeks",
      sqlite_algebra_va_nocase: "SQLite: Algebra Yo'qligi va NOCASE Collation",
      qisman_indeks_farqlari: "Qisman Indeks va INCLUDE Cheklovlari",
      dialektlar_jadvali_va_xatolar: "Dialektlar Taqqoslashi va Tipik Xatolar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_kollatsiya_va_funksional",
        id: "l1",
        text: "May es-kyu-elda sukut kollatsiyasi harf farqini inobatga olmagani uchun oddiy indeksning o'zi yetarli bo'ladi."
      },
      {
        scene: "mysql_kollatsiya_va_funksional",
        id: "l2",
        text: "Lekin ifoda qidiruvi kerak bo'lsa, ikki qavsli funksional indeks virtual ustun sifatida yaratiladi."
      },
      {
        scene: "sqlite_algebra_va_nocase",
        id: "l3",
        text: "Es-kyu-layt algebraik tengliklarni tushunmaydi va ifoda harfma-harf indeksdagidek yozilishini talab qiladi."
      },
      {
        scene: "sqlite_algebra_va_nocase",
        id: "l4",
        text: "Shuningdek, layk so'rovlarini tezlashtirish uchun ustunga nokase kollatsiyali indeks qurilishi zarur."
      },
      {
        scene: "qisman_indeks_farqlari",
        id: "l5",
        text: "Qisman indeks Postgres va Es-kyu-laytda mavjud bo'lib, May es-kyu-elda esa sintaksis xatoligi beradi."
      },
      {
        scene: "qisman_indeks_farqlari",
        id: "l6",
        text: "Inklud kalit so'zi ham faqat Postgresda mavjud bo'lib, boshqa bazalar ko'p ustunli indeksdan foydalanadi."
      },
      {
        scene: "dialektlar_jadvali_va_xatolar",
        id: "l7",
        text: "Har doim ifoda indeksini so'rovdagi ifoda bilan bir xil yozing va keshlanmaydigan tasodifiy funksiyalardan qoching."
      },
      {
        scene: "dialektlar_jadvali_va_xatolar",
        id: "l8",
        text: "Kam sonli qatorlarda qisman indeksdan foydalanib, tizim xotirasi va yozish resurslarini tejang."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
