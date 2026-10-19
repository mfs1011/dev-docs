// SQL 28-bob 1-qism: Tushuncha — Set amallari (UNION, INTERSECT, EXCEPT)
globalThis.NR = {
  scenes: ['kirish', 'uch_amal', 'takrorlar_va_all', 'moslik_va_ustuvorlik', 'tartiblash_va_limit'],
  sceneNames: {
    kirish: "Set Amallari Tushunchasi",
    uch_amal: "UNION, INTERSECT va EXCEPT",
    takrorlar_va_all: "DISTINCT va ALL Takrorlar Hisobi",
    moslik_va_ustuvorlik: "Moslik Shartlari va Ustuvorlik",
    tartiblash_va_limit: "ORDER BY va LIMIT Qoidalari",
  },
  hold: {
    intro: 0.8,
    uch_amal: 1.0,
    takrorlar: 1.0,
    null_takror: 0.8,
    moslik: 1.0,
    ustuvorlik: 1.2,
    order_limit: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "SQL da set amallari ikki so'rov natijasini bitta natijaga birlashtiradi. JOIN ustunlar bo'yicha yonma-yon qo'shsa, set amallari qatorlar bo'yicha ustma-ust qo'shadi.",
    },
    {
      id: "uch_amal",
      scene: "uch_amal",
      text: "Uchta asosiy amal mavjud: UNION barcha qatorlarni birlashtiradi, INTERSECT umumiy kesishmani oladi, EXCEPT esa birinchi natijadan ikkinchisini ayirib tashlaydi.",
    },
    {
      id: "takrorlar",
      scene: "takrorlar_va_all",
      text: "Sukut bo'yicha bu amallar takror qatorlarni olib tashlaydi. Agar ALL kalit so'zi qo'shilsa, barcha takrorlar matematik aniqlikda saqlanib qoladi.",
    },
    {
      id: "null_takror",
      scene: "takrorlar_va_all",
      text: "Set amallarida NULL qiymatlar teng deb hisoblanadi va takror deb topilib, bittasi qoldiriladi.",
    },
    {
      id: "moslik",
      scene: "moslik_va_ustuvorlik",
      text: "Ikki so'rov mos bo'lishi shart: ustunlar soni bir xil va tiplari bir-biriga to'g'ri kelishi kerak. Natija ustunlarining nomlari esa har doim birinchi so'rovdan olinadi.",
    },
    {
      id: "ustuvorlik",
      scene: "moslik_va_ustuvorlik",
      text: "Matematik ustuvorlikka ko'ra, INTERSECT amali har doim UNION va EXCEPT dan avval bajariladi. EXCEPT esa o'rin almashtirishga chidamsizdir.",
    },
    {
      id: "order_limit",
      scene: "tartiblash_va_limit",
      text: "Oxirdagi ORDER BY va LIMIT butun birlashgan natijaga tegishli bo'ladi. Alohida qismga cheklov berish uchun shu qism qavsga olinishi lozim.",
    },
  ],
};
