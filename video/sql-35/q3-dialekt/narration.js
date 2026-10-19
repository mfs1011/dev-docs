// SQL 35-bob 3-qism: "Dialektlar" — PostgreSQL, MySQL, SQLite
(function (g) {
  g.NR = {
    title: "SQL JSON Dialektlari: PostgreSQL, MySQL, SQLite",
    scenes: [
      "tiplar_va_tekshiruv",
      "operatorlar_va_yollar",
      "massivlar_va_qidiruv",
      "indekslash",
      "solishtirma_xulosa"
    ],
    sceneNames: {
      tiplar_va_tekshiruv: "Tiplar va Kiritishda Tekshiruv",
      operatorlar_va_yollar: "Operatorlar va JSON Yo'llari",
      massivlar_va_qidiruv: "Massivlar va Qidiruv Dialektlari",
      indekslash: "Indekslash Strategiyalari",
      solishtirma_xulosa: "Dialektlar Matritsasi va Xulosa"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l9: 1.0,
      l11: 1.5
    },
    lines: [
      {
        scene: "tiplar_va_tekshiruv",
        id: "l1",
        text: "PostgreSQL'da jsonb va MySQL'da JSON turlari kiritilayotgan hujjat sintaksisini darhol qat'iy tekshiradi."
      },
      {
        scene: "tiplar_va_tekshiruv",
        id: "l2",
        text: "SQLite esa JSONni oddiy matn sifatida saqlaydi, shuning uchun bazaga buzilgan JSON tushmasligi uchun cheklov shart."
      },
      {
        scene: "operatorlar_va_yollar",
        id: "l3",
        text: "PostgreSQL kalit nomini to'g'ridan-to'g'ri qabul qilsa, MySQL'da o'ng tomon doimo JSON yo'li bo'lishi talab qilinadi."
      },
      {
        scene: "operatorlar_va_yollar",
        id: "l4",
        text: "SQLite esa qulaylik uchun ikkala usulni ham birdek qo'llab-quvvatlaydi."
      },
      {
        scene: "massivlar_va_qidiruv",
        id: "l5",
        text: "PostgreSQL'dagi kuchukcha-katta va so'roq operatorlari o'rniga, MySQL'da JSON_CONTAINS hamda MEMBER OF ishlatiladi."
      },
      {
        scene: "massivlar_va_qidiruv",
        id: "l6",
        text: "SQLite'da esa JSON_TABLE o'rniga json_each jadval funksiyasi yordamida massiv qatorlarga yoyiladi."
      },
      {
        scene: "indekslash",
        id: "l7",
        text: "PostgreSQL butun hujjatga GIN indeksi qurish imkonini beradi, lekin ikkita tire-katta uchun ifoda indeksi kerak."
      },
      {
        scene: "indekslash",
        id: "l8",
        text: "MySQL'da to'g'ridan-to'g'ri indeks taqiqlanadi, faqat hosila ustun yoki ko'p qiymatli indeks orqali hal qilinadi."
      },
      {
        scene: "indekslash",
        id: "l9",
        text: "SQLite esa ikkita tire-katta ifodasi bo'yicha to'g'ridan-to'g'ri B-tree indeksi yaratishga ruxsat beradi."
      },
      {
        scene: "solishtirma_xulosa",
        id: "l10",
        text: "SQLite JSON5 formatidagi erkin sintaksisni o'qiy oladi, ammo uning jsonb formati PostgreSQL bilan mos emas."
      },
      {
        scene: "solishtirma_xulosa",
        id: "l11",
        text: "Loyihalashda har bir tizimning indekslash va tekshirish nozikliklarini bilish arxitektura barqarorligini ta'minlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
