// SQL 46-bob 1-qism: "Tushuncha" — Planner va Statistika
(function (g) {
  g.NR = {
    title: "SQL Planner va Statistika: Tushuncha",
    scenes: [
      "planner_va_selektivlik",
      "pg_stats_tuzilishi",
      "bogliq_ustunlar_create_stats",
      "rejaga_tasir_va_dialektlar"
    ],
    sceneNames: {
      planner_va_selektivlik: "Planner va Shartlar Selektivligi",
      pg_stats_tuzilishi: "PostgreSQL Statistikasi: pg_stats",
      bogliq_ustunlar_create_stats: "Bog'liq Ustunlar: CREATE STATISTICS",
      rejaga_tasir_va_dialektlar: "Rejaga Ta'sir Qilish va Dialektlar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "planner_va_selektivlik",
        id: "l1",
        text: "Rejalashtiruvchi so'rov narxini hisoblashda eng avvalo bitta savolga javob izlaydi: nechta qator qaytadi?"
      },
      {
        scene: "planner_va_selektivlik",
        id: "l2",
        text: "Buning uchun har bir shartning selektivligi, ya'ni mos keluvchi qatorlar ulushi oldindan yig'ilgan statistika orqali taxmin qilinadi."
      },
      {
        scene: "pg_stats_tuzilishi",
        id: "l3",
        text: "Postgresda pi-ji stats ko'rinishi eng ko'p uchraydigan qiymatlar chastotasi, gistogramma chegaralari va korrelyatsiyani saqlaydi."
      },
      {
        scene: "pg_stats_tuzilishi",
        id: "l4",
        text: "Ushbu ma'lumotlar avtovakuum va analayz tomonidan tasodifiy namunalar asosida davriy ravishda yangilanib boradi."
      },
      {
        scene: "bogliq_ustunlar_create_stats",
        id: "l5",
        text: "Ammo rejalashtiruvchi ustunlarni bir-biriga bog'liq emas deb hisoblaydi, masalan tuman va viloyat shartlarida o'n baravar adashishi mumkin."
      },
      {
        scene: "bogliq_ustunlar_create_stats",
        id: "l6",
        text: "Bunday muammoni hal qilish uchun krieyt statistiks buyrug'i bilan maxsus funksional bog'liqlik statistikasi yaratiladi."
      },
      {
        scene: "rejaga_tasir_va_dialektlar",
        id: "l7",
        text: "Rejani majburlashda Postgresda ineybl parametrlari vaqtinchalik sinov uchun berilgan bo'lsa, May es-kyu-elda opti-mayzer hintlar ishlatiladi."
      },
      {
        scene: "rejaga_tasir_va_dialektlar",
        id: "l8",
        text: "Es-kyu-laytda esa indeksd bay kalit so'zi va pragma opti-mayz buyrug'i statistika yig'ishni tartibga soladi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
