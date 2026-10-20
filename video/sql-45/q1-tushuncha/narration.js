// SQL 45-bob 1-qism: "Tushuncha" — EXPLAIN va Rejani O'qish
(function (g) {
  g.NR = {
    title: "SQL EXPLAIN: Tushuncha",
    scenes: [
      "reja_va_daraxt",
      "taxminiy_narx",
      "haqiqiy_natija_analyze",
      "ogohlantirish_va_dml"
    ],
    sceneNames: {
      reja_va_daraxt: "So'rov Rejasi va Daraxt Tuzilmasi",
      taxminiy_narx: "Taxminiy Narx (Cost, Rows, Width)",
      haqiqiy_natija_analyze: "Haqiqiy Natija: EXPLAIN ANALYZE",
      ogohlantirish_va_dml: "Ogohlantirish va DML Xavfsizligi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "reja_va_daraxt",
        id: "l1",
        text: "SQL deklarativ til bo'lib, biz nima kerakligini yozamiz, qanday bajarishni esa rejalashtiruvchi hal qiladi."
      },
      {
        scene: "reja_va_daraxt",
        id: "l2",
        text: "Ekspleyn so'rov rejasini tugunlar daraxti ko'rinishida beradi: pastda skanerlash, tepada esa birlashtirish va saralash amallari turadi."
      },
      {
        scene: "taxminiy_narx",
        id: "l3",
        text: "Oddiy ekspleyn so'rovni bajarmaydi, u faqat boshlash va to'liq bajarilish narxini hamda taxminiy qatorlar sonini ko'rsatadi."
      },
      {
        scene: "taxminiy_narx",
        id: "l4",
        text: "Baza hisoblaydigan narx birliklari millisekund emas, balki disk sahifalarini o'qishga asoslangan shartli bahodir."
      },
      {
        scene: "haqiqiy_natija_analyze",
        id: "l5",
        text: "Ekspleyn analayz esa so'rovni haqiqatda ishga tushirib, har bir tugun uchun real vaqt va qatorlar sonini chiqaradi."
      },
      {
        scene: "haqiqiy_natija_analyze",
        id: "l6",
        text: "Ichki tugunlardagi vaqt bitta tsiklga tegishli bo'lib, umumiy hisob uchun uni loops soniga ko'paytirish shart."
      },
      {
        scene: "ogohlantirish_va_dml",
        id: "l7",
        text: "O'ta muhim qoida: analayz buyrug'i ma'lumotlarni haqiqatan o'zgartiradi yoki o'chiradi."
      },
      {
        scene: "ogohlantirish_va_dml",
        id: "l8",
        text: "Shuning uchun o'chirish va yangilash so'rovlarini tahlil qilishda doimo begin va rollback blokidan foydalaning."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
