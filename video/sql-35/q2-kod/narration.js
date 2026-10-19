// SQL 35-bob 2-qism: "Kod" — JSON
(function (g) {
  g.NR = {
    title: "SQL JSON Amaliyoti: Kod va Operatorlar",
    scenes: [
      "kirish",
      "containment_va_filter",
      "sql_json_functions",
      "json_table_va_agregatsiya",
      "update_va_gin"
    ],
    sceneNames: {
      kirish: "Qiymat ajratish: ->, ->>, #>>",
      containment_va_filter: "Filtrlash: @> va ? operatorlari",
      sql_json_functions: "SQL/JSON: JSON_VALUE va JSON_EXISTS",
      json_table_va_agregatsiya: "JSON_TABLE: Massivni qatorlarga",
      update_va_gin: "O'zgartirish va GIN indeksi"
    },
    hold: {
      l3: 1.0,
      l5: 1.0,
      l7: 1.0,
      l9: 1.0,
      l11: 1.5
    },
    lines: [
      {
        scene: "kirish",
        id: "l1",
        text: "Buyurtmalar jadvalimizda har bir mijoz hujjati jsonb formatida saqlanadi."
      },
      {
        scene: "kirish",
        id: "l2",
        text: "Tire-katta belgisi natijani JSON ko'rinishida qo'shtirnoq bilan, ikkita tire-katta esa toza matn sifatida qaytaradi."
      },
      {
        scene: "kirish",
        id: "l3",
        text: "Panjara operatori yordamida esa ichki massiv yoki ob'ekt yo'li bo'yicha qiymat olinadi."
      },
      {
        scene: "containment_va_filter",
        id: "l4",
        text: "Kuchukcha-katta operatori hujjat qidirilayotgan JSON fragmentini to'liq o'z ichiga olishini tekshiradi."
      },
      {
        scene: "containment_va_filter",
        id: "l5",
        text: "So'roq belgisi esa kalit yoki massiv elementi mavjudligini aniqlash uchun xizmat qiladi."
      },
      {
        scene: "sql_json_functions",
        id: "l6",
        text: "SQL/JSON standartidagi JSON_VALUE funksiyasi natijani darhol butun son yoki kerakli tipga o'girib beradi."
      },
      {
        scene: "sql_json_functions",
        id: "l7",
        text: "JSON_EXISTS esa jsonpath ifodasi bo'yicha mos element bor yoki yo'qligini tekshiradi."
      },
      {
        scene: "json_table_va_agregatsiya",
        id: "l8",
        text: "JSON_TABLE massiv ichidagi har bir ob'ektni relyatsion qatorlar va ustunlarga aylantiradi."
      },
      {
        scene: "json_table_va_agregatsiya",
        id: "l9",
        text: "Bunday virtual jadval orqali har bir buyurtmaning umumiy summasini hisoblash mumkin bo'ladi."
      },
      {
        scene: "update_va_gin",
        id: "l10",
        text: "Hujjatni o'zgartirish uchun jsonb_set yoki ikkita vertikal chiziq operatori ishlatiladi."
      },
      {
        scene: "update_va_gin",
        id: "l11",
        text: "GIN indeksi kuchukcha-katta qidiruvini tezlashtiradi, lekin ikkita tire-katta uchun ifoda indeksi zarur."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
