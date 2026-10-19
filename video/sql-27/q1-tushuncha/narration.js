// SQL 27-bob 1-qism: Tushuncha — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'skalyar_va_turlar', 'korrelyatsiya', 'exists_va_in', 'tuzoq_va_derived'],
  sceneNames: {
    kirish: "Subquery Tushunchasi va Asoslari",
    skalyar_va_turlar: "Subquery Turlari va Skalyar Qoida",
    korrelyatsiya: "Korrelyatsiyalangan Subquery",
    exists_va_in: "EXISTS, IN, ANY va ALL",
    tuzoq_va_derived: "NOT IN Tuzog'i va Hosila Jadvallar",
  },
  hold: {
    intro: 0.8,
    turlari: 0.8,
    skalyar: 1.0,
    korrelyatsiya: 1.0,
    exists: 0.8,
    in_any_all: 0.8,
    not_in_trap: 1.2,
    derived: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "Subquery — boshqa SQL so'rovi ichida qavsga olingan SELECT operatoridir. Tashqaridagi so'rov esa tashqi so'rov deyiladi.",
    },
    {
      id: "turlari",
      scene: "skalyar_va_turlar",
      text: "Natija shakliga ko'ra to'rt tur mavjud: bitta qiymatli skalyar, bitta ustunli, bitta qatorli, hamda ko'p qator va ustunli hosila jadval.",
    },
    {
      id: "skalyar",
      scene: "skalyar_va_turlar",
      text: "Skalyar subquery aynan bitta qator va bitta ustun qaytarishi shart. Agar ko'p qiymat qaytsa xato beradi, hech narsa topilmasa esa NULL qaytadi.",
    },
    {
      id: "korrelyatsiya",
      scene: "korrelyatsiya",
      text: "Tashqi so'rov ustuniga murojaat qiluvchi subquery korrelyatsiyalangan deyiladi va har bir tashqi qator uchun qaytadan hisoblanadi. Oddiy subquery esa faqat bir marta ishlaydi.",
    },
    {
      id: "exists",
      scene: "exists_va_in",
      text: "EXISTS operatori subquery kamida bitta qator qaytarsa rost qiymat beradi. U birinchi qator topilishi bilanoq to'xtaydi va hech qachon NULL bermaydi.",
    },
    {
      id: "in_any_all",
      scene: "exists_va_in",
      text: "IN operatori ANY bilan teng, NOT IN esa barcha qatorlardan farqli bo'lishni bildiruvchi ALL ga tengdir.",
    },
    {
      id: "not_in_trap",
      scene: "tuzoq_va_derived",
      text: "Katta tuzoq: agar subquery natijasida bitta bo'lsa ham NULL chiqsa, NOT IN hech narsa topilmaganda NULL qaytaradi va natija bo'shab qoladi. NOT EXISTS esa xavfsiz ishlaydi.",
    },
    {
      id: "derived",
      scene: "tuzoq_va_derived",
      text: "FROM ichidagi subquery hosila jadval deyiladi va agregat ustidan agregat hisoblash imkonini beradi. Standartga ko'ra unga doimo nom berilishi shart.",
    },
  ],
};
