// SQL 42-bob 3-qism: "Dialektlar" — Ko'p ustunli indeks
(function (g) {
  g.NR = {
    title: "SQL Ko'p Ustunli Indeks: Dialektlar",
    scenes: [
      "mysql_skip_scan_va_saralash",
      "sqlite_analiz_va_any_qoidasi",
      "multi_index_va_index_merge",
      "dialektlar_jadvali_va_xatolar"
    ],
    sceneNames: {
      mysql_skip_scan_va_saralash: "MySQL: Skip Scan va Aralash Saralash",
      sqlite_analiz_va_any_qoidasi: "SQLite: ANALYZE va ANY() Sharti",
      multi_index_va_index_merge: "OR Shartlari: Index Merge va MULTI-INDEX",
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
        scene: "mysql_skip_scan_va_saralash",
        id: "l1",
        text: "May es-kyu-elda skip skan faqat so'rovdagi barcha ustunlar indeks ichida mavjud bo'lgandagina ishlaydi."
      },
      {
        scene: "mysql_skip_scan_va_saralash",
        id: "l2",
        text: "Aralash saralashda esa mos indeks bo'lmasa, May es-kyu-el butun jadvalni to'liq skanerlashga majbur bo'ladi."
      },
      {
        scene: "sqlite_analiz_va_any_qoidasi",
        id: "l3",
        text: "Es-kyu-laytda skip skan faqat analayz buyrug'idan keyin va takrorlar soni yetarli bo'lganda yoqiladi."
      },
      {
        scene: "sqlite_analiz_va_any_qoidasi",
        id: "l4",
        text: "Statistikasiz u butun indeksni o'qiydi, analayzdan so'ng esa eni kaliti bilan haqiqiy sakrashni boshlaydi."
      },
      {
        scene: "multi_index_va_index_merge",
        id: "l5",
        text: "Or shartida May es-kyu-el indekslarni birlashtirib rou-ay-di bo'yicha saralash va dublikatni tozalashni qo'llaydi."
      },
      {
        scene: "multi_index_va_index_merge",
        id: "l6",
        text: "Es-kyu-layt esa multi-indeks or mexanizmi orqali har bir shartni o'z indeksi bilan alohida qidiradi."
      },
      {
        scene: "dialektlar_jadvali_va_xatolar",
        id: "l7",
        text: "Ko'p ustunli indeks bor joyda alohida chap ustun indeksini saqlash xotira va yozishni isrof qilishdir."
      },
      {
        scene: "dialektlar_jadvali_va_xatolar",
        id: "l8",
        text: "Doimo tenglik ustunlarini chapga qo'ying va har bir reja samaradorligini o'lchovlar bilan tekshiring."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
