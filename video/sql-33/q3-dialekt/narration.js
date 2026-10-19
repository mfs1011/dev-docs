// SQL 33-bob 3-qism: "Dialektlar" — Matn funksiyalari
(function (g) {
  g.NR = {
    title: "SQL Matn Funksiyalari: Dialekt Farqlari",
    scenes: [
      "kirish",
      "ulash_farqlari",
      "uzunlik_va_registr",
      "kesish_va_format",
      "regex_va_xulosa"
    ],
    sceneNames: {
      kirish: "Dialektlar: Matn Funksiyalaridagi Tafovutlar",
      ulash_farqlari: "Satr Birlashtirish va NULL Farqlari",
      uzunlik_va_registr: "Uzunlik (LENGTH vs CHAR_LENGTH) va Registr",
      kesish_va_format: "Satrni Bo'lish (SPLIT_PART) va LPAD",
      regex_va_xulosa: "RegEx Qo'llab-Quvvatlashi va Xulosa",
    },
    hold: {
      intro: 0.8,
      ulash: 1.2,
      uzunlik: 1.2,
      kesish: 1.2,
      regex: 1.2,
    },
    lines: [
      {
        scene: "kirish",
        id: "intro",
        text: "Matn funksiyalarida relyatsion bazalar o'rtasida juda jiddiy farqlar mavjud bo'lib, bitta tizimda ishlagan so'rov boshqasida xato berishi yoki kutilmagan natija qaytarishi mumkin."
      },
      {
        scene: "ulash_farqlari",
        id: "ulash",
        text: "MySQL da vertikal chiziqlar satr ulash emas, balki mantiqiy OR amali hisoblanib nol qaytaradi, shuningdek CONCAT funksiyasiga null uchrasa null beradi, faqat CONCAT_WS barcha tizimda bir xil ishlaydi."
      },
      {
        scene: "uzunlik_va_registr",
        id: "uzunlik",
        text: "MySQL dagi LENGTH funksiyasi belgilarni emas baytlarni sanaydi, shuning uchun belgilar soniga CHAR_LENGTH yozish shart, SQLite da esa UPPER va LOWER faqat ASCII harflarga ta'sir qiladi."
      },
      {
        scene: "kesish_va_format",
        id: "kesish",
        text: "Postgresdagi SPLIT_PART o'rniga MySQL da SUBSTRING_INDEX, SQLite da esa SUBSTR va INSTR birikmasi ishlatiladi, LPAD funksiyasi yo'q SQLite da esa PRINTF dan foydalaniladi."
      },
      {
        scene: "regex_va_xulosa",
        id: "regex",
        text: "Postgresda REGEXP_REPLACE da g bayrog'i shart bo'lsa, MySQL sukutda barchasini tozalaydi, SQLite da esa o'rnatilgan REGEXP yo'q bo'lib, portativ kodda har doim standart funksiyalarni tanlash zarur."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
