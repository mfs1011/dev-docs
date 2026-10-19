// SQL 32-bob 1-qism: Tushuncha — Shartli ifodalar
globalThis.NR = {
  scenes: ['kirish', 'case_ifodasi', 'null_tuzogi', 'coalesce_va_nullif', 'greatest_va_least'],
  sceneNames: {
    kirish: "Shartli Ifodalar: SQL da If/Else",
    case_ifodasi: "CASE Ifodasi: Umumiy va Oddiy Shakllar",
    null_tuzogi: "NULL Tuzog'i: Nega = NULL Ishlamaydi?",
    coalesce_va_nullif: "COALESCE va NULLIF Funksiyalari",
    greatest_va_least: "GREATEST va LEAST: Qatordagi Solishtirish",
  },
  hold: {
    intro: 0.8,
    case: 1.2,
    null_trap: 1.2,
    funcs: 1.2,
    greatest: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "SQL da shartga qarab har xil natija qaytarish uchun CASE, COALESCE, NULLIF hamda GREATEST va LEAST ifodalaridan foydalaniladi.",
    },
    {
      id: "case",
      scene: "case_ifodasi",
      text: "CASE ifodasi shartlarni yuqoridan pastga ketma-ket tekshiradi va birinchi rost shart topilishi bilan hisoblashni to'xtatadi.",
    },
    {
      id: "null_trap",
      scene: "null_tuzogi",
      text: "Muhim qoida: SQL da NULL tenglik bilan tekshirilmaydi, shuning uchun CASE WHEN ustun = NULL emas, doimo IS NULL deb yoziladi.",
    },
    {
      id: "funcs",
      scene: "coalesce_va_nullif",
      text: "COALESCE birinchi mavjud qiymatni tanlaydi, NULLIF esa ikki qiymat teng bo'lsa NULL qaytarib, nolga bo'lishdan xalos etadi.",
    },
    {
      id: "greatest",
      scene: "greatest_va_least",
      text: "GREATEST va LEAST agregat emas, balki bitta qatordagi bir nechta ustun ichidan eng katta yoki eng kichik qiymatni topadi.",
    },
  ],
};
