// SQL 46-bob 2-qism: "Kod" — Planner va Statistika
(function (g) {
  g.NR = {
    title: "SQL Planner va Statistika: Kod",
    scenes: [
      "pg_stats_korinishi",
      "bogliq_ustunlar_xatosi",
      "create_statistics_yechimi",
      "eskirgan_statistika_va_enable"
    ],
    sceneNames: {
      pg_stats_korinishi: "pg_stats: Statistikani O'qish",
      bogliq_ustunlar_xatosi: "Bog'liq Ustunlar: 11x Xatolik",
      create_statistics_yechimi: "CREATE STATISTICS va To'g'ri Taxmin",
      eskirgan_statistika_va_enable: "Eskirgan Statistika va enable_*"
    },
    hold: {
      l2: 1.0,
      l3: 1.0,
      l5: 1.0,
      l7: 1.5
    },
    lines: [
      {
        scene: "pg_stats_korinishi",
        id: "l1",
        text: "Postgresda pi-ji stats ko'rinishi jadvaldagi ustunlar bo'yicha eng muhim statistik ko'rsatkichlarni beradi."
      },
      {
        scene: "pg_stats_korinishi",
        id: "l2",
        text: "Yuz ming qatorli manzillar jadvalida holat ustuni uchun unikal qiymatlar soni va ularning uchrash foizlari aniq qayd etilgan."
      },
      {
        scene: "bogliq_ustunlar_xatosi",
        id: "l3",
        text: "Ammo tuman va viloyat birgalikda so'ralganda, rejalashtiruvchi mustaqil ko'paytma hisoblab sakson to'qqiz qator kutadi, aslida esa mingta qator chiqadi."
      },
      {
        scene: "create_statistics_yechimi",
        id: "l4",
        text: "Bu o'n bir baravar xatolikni tuzatish uchun krieyt statistiks orqali funksional bog'liqlik statistikasi kiritiladi."
      },
      {
        scene: "create_statistics_yechimi",
        id: "l5",
        text: "Natijada tuman viloyatni to'liq belgilashi hisobga olinib, rejalashtiruvchi taxmini to'qqiz yuz oltmish uch qatorga yetadi."
      },
      {
        scene: "eskirgan_statistika_va_enable",
        id: "l6",
        text: "Jadvalga ikki yuz ming yangi qator qo'shilib analayz qilinmasa, rejalashtiruvchi o'ttiz uch baravar adashishi mumkin."
      },
      {
        scene: "eskirgan_statistika_va_enable",
        id: "l7",
        text: "Va nihoyat, ineybl parametrlari orqali ketma-ket skanerlash narxini oshirib, indeksli rejani amalda solishtirib ko'rish mumkin."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
