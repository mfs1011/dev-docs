// SQL 27-bob 2-qism: Kod — PostgreSQL 18 amaliyoti
globalThis.NR = {
  scenes: ['kirish', 'skalyar', 'korrelyatsiya', 'exists_va_in', 'tuzoq_va_any_all', 'derived_va_update'],
  sceneNames: {
    kirish: "PostgreSQL 18: Jadvallar va Kirish",
    skalyar: "Skalyar Subquery va Xatolar",
    korrelyatsiya: "Korrelyatsiyalangan Subquery",
    exists_va_in: "EXISTS va IN Bilan Guruhlarni Topish",
    tuzoq_va_any_all: "NOT IN Tuzog'i va ANY / ALL",
    derived_va_update: "Hosila Jadval va UPDATE Operatori",
  },
  hold: {
    intro: 0.8,
    skalyar: 1.0,
    skalyar_xato: 1.2,
    korrelyatsiya: 1.0,
    exists_in: 0.8,
    not_in_trap: 1.2,
    any_all: 1.0,
    derived_update: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "PostgreSQL 18 da amaliy subquery so'rovlarini o'rganamiz. Bazamizda guruhlar va baholar jadvallari yaratilgan.",
    },
    {
      id: "skalyar",
      scene: "skalyar",
      text: "Skalyar subquery orqali o'rtacha balldan yuqori natija ko'rsatganlarni topamiz: Vali, Sobir va Dilnoza chiqdi.",
    },
    {
      id: "skalyar_xato",
      scene: "skalyar",
      text: "Agar skalyar o'rnida bir nechta qator yoki ustun qaytsa, PostgreSQL darhol xato beradi; qator topilmasa esa jimgina NULL beradi.",
    },
    {
      id: "korrelyatsiya",
      scene: "korrelyatsiya",
      text: "Korrelyatsiyalangan subquery har bir qator uchun alohida ishlaydi: har guruhning eng yuqori bali va o'z guruhida yetakchi bo'lganlar shu usulda topiladi.",
    },
    {
      id: "exists_in",
      scene: "exists_va_in",
      text: "Talabasi bor guruhlarni EXISTS yoki IN bilan topamiz. Birlashmadan farqli ravishda, guruhlar faqat bir marta chiqadi.",
    },
    {
      id: "not_in_trap",
      scene: "tuzoq_va_any_all",
      text: "Katta xato: talabasi yo'q guruhni NOT IN bilan qidirganda nolta qator chiqdi, chunki jadvalda bitta NULL bor edi. NOT EXISTS esa to'g'ri C guruhini qaytardi.",
    },
    {
      id: "any_all",
      scene: "tuzoq_va_any_all",
      text: "ALL barcha qiymatlardan, ANY esa kamida bittasidan kattalikni tekshiradi. ALL da ham NULL ehtiyotkorlik bilan filtrlanishi kerak.",
    },
    {
      id: "derived_update",
      scene: "derived_va_update",
      text: "Hosila jadval yordamida guruhlar bo'yicha talabalarning o'rtacha sonini hisoblaymiz, hamda UPDATE orqali eng yuqori ballni boshqasiga o'zlashtiramiz.",
    },
  ],
};
