// SQL 46-bob 3-qism: "Dialektlar" — Planner va Statistika
(function (g) {
  g.NR = {
    title: "SQL Planner va Statistika: Dialektlar",
    scenes: [
      "mysql_gistogramma",
      "mysql_optimizer_hints",
      "sqlite_statistika_pragma",
      "sqlite_indexed_by"
    ],
    sceneNames: {
      mysql_gistogramma: "MySQL: Indekssiz Ustunlarda Gistogramma",
      mysql_optimizer_hints: "MySQL: Optimizer Hint va 3x Tezlashuv",
      sqlite_statistika_pragma: "SQLite: sqlite_stat1 va PRAGMA optimize",
      sqlite_indexed_by: "SQLite: INDEXED BY va NOT INDEXED"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_gistogramma",
        id: "l1",
        text: "May es-kyu-elda gistogrammalar asosan indeksi yo'q ustunlar uchun foydali bo'lib, tenglik va oraliq shartlarida to'g'ri selektivlik beradi."
      },
      {
        scene: "mysql_gistogramma",
        id: "l2",
        text: "Masalan, indekssiz holat ustuniga o'nta chelakli gistogramma qo'shilgach, filtr ko'rsatkichi o'n foizdan haqiqiy ikki foizga tushadi."
      },
      {
        scene: "mysql_optimizer_hints",
        id: "l3",
        text: "Agar ustunda indeks bo'lsa, rejalashtiruvchi uni noo'rin tanlaganda opti-mayzer hintlar orqali to'liq skanerlashga majburlash mumkin."
      },
      {
        scene: "mysql_optimizer_hints",
        id: "l4",
        text: "Sinovimizda no-indeks hinti tufayli so'rov bajarilish vaqti to'qson uch millisekunddan o'ttiz millisekundga qisqardi."
      },
      {
        scene: "sqlite_statistika_pragma",
        id: "l5",
        text: "Es-kyu-laytda esa statistika ma'lumotlari es-kyu-layt stat bir ichki jadvalida indekslar bo'yicha o'rtacha takrorlanish sifatida saqlanadi."
      },
      {
        scene: "sqlite_statistika_pragma",
        id: "l6",
        text: "Tizim ishlab chiquvchilari tavsiya etgan pragma opti-mayz buyrug'i kerakli analayz amallarini avtomatik va tezkor bajaradi."
      },
      {
        scene: "sqlite_indexed_by",
        id: "l7",
        text: "So'rovda aniq bir indeksni talab qilish uchun indeksd bay, yoki indekslarni chetlab o'tish uchun not indeksd direktivasi qo'llaniladi."
      },
      {
        scene: "sqlite_indexed_by",
        id: "l8",
        text: "Es-kyu-laytda bunday ko'rsatmalar maslahat emas, balki qat'iy buyruq bo'lib, hatto reja samarasiz bo'lsa ham unga bo'ysunadi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
