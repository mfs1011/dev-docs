// SQL 26-bob 1-qism: Tushuncha — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'null_va_bosh_toplam', 'group_by_va_having', 'funksional_bogliqlik', 'qoshimchalar_va_xulosa'],
  sceneNames: {
    kirish: "Agregatsiya Asoslari va Funksiyalar",
    null_va_bosh_toplam: "NULL Qoidasi va Bo'sh To'plam",
    group_by_va_having: "GROUP BY va HAVING Mexanizmi",
    funksional_bogliqlik: "Guruhlash va Funksional Bog'liqlik",
    qoshimchalar_va_xulosa: "FILTER, ROLLUP va Xulosa",
  },
  hold: {
    g2: 1.0,
    g4: 1.2,
    g6: 1.2,
    g8: 1.2,
    g10: 1.0,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "Agregat funksiyalar ko'plab qatorlar qiymatini bitta yakuniy qiymatga qisqartiradi." },
    { id: 'g2', scene: 'kirish', text: "COUNT, SUM, AVG, MIN va MAX eng asosiy agregatlardir." },
    { id: 'g3', scene: 'null_va_bosh_toplam', text: "COUNT yulduzcha barcha qatorlarni sanaydi, qolgan barcha agregatlar esa NULL qiymatlarni tashlab yuboradi." },
    { id: 'g4', scene: 'null_va_bosh_toplam', text: "Qatorlar topilmasa, COUNT nol qaytaradi, SUM va boshqa funksiyalar esa nol emas, aynan NULL qaytaradi." },
    { id: 'g5', scene: 'group_by_va_having', text: "GROUP BY bir xil qiymatli qatorlarni guruhlaydi va agregatlar har bir guruh uchun alohida hisoblanadi." },
    { id: 'g6', scene: 'group_by_va_having', text: "Guruhlangan natijani filtrlash uchun WHERE emas, balki HAVING ishlatiladi." },
    { id: 'g7', scene: 'funksional_bogliqlik', text: "Guruhlashda qatnashmagan ustunlarni SELECT da to'g'ridan-to'g'ri ko'rsatib bo'lmaydi." },
    { id: 'g8', scene: 'funksional_bogliqlik', text: "Faqat guruhlangan ustun birlamchi kalit bo'lsa, unga funksional bog'liq ustunlarga ruxsat beriladi." },
    { id: 'g9', scene: 'qoshimchalar_va_xulosa', text: "Shuningdek, FILTER sharti, agregat ichidagi ORDER BY va ROLLUP kabi ko'p darajali jamilar mavjud." },
    { id: 'g10', scene: 'qoshimchalar_va_xulosa', text: "Endi bu qoidalarni PostgreSQL 18 da amalda tekshiramiz." },
  ],
};
