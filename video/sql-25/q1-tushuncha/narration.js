// SQL 25-bob 1-qism: Tushuncha — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'dekart', 'ichki_va_tashqi', 'on_va_where', 'lateral_va_xulosa'],
  sceneNames: {
    kirish: "Relyatsion model va JOIN",
    dekart: "Dekart ko'paytmasi va CROSS JOIN",
    ichki_va_tashqi: "INNER va Tashqi JOIN turlari",
    on_va_where: "ON va WHERE farqi",
    lateral_va_xulosa: "LATERAL subquery va xulosa",
  },
  hold: {
    g3: 1.2,
    g5: 1.5,
    g7: 1.2,
    g9: 1.0,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "Relyatsion modelda ma'lumotlar turli jadvallarga bo'lib saqlanadi, JOIN amali esa ularni bitta yaxlit natijaga birlashtiradi." },
    { id: 'g2', scene: 'dekart', text: "Barcha birlashtirishlarning negizida Dekart ko'paytmasi yotadi." },
    { id: 'g3', scene: 'dekart', text: "CROSS JOIN birinchi jadvalning har bir qatorini ikkinchi jadvalning har bir qatori bilan juftlab, N ko'paytirilgan M ta qator hosil qiladi." },
    { id: 'g4', scene: 'ichki_va_tashqi', text: "INNER JOIN ana shu ko'paytmadan faqat ON shartiga to'g'ri kelgan qatorlarni tanlab oladi." },
    { id: 'g5', scene: 'ichki_va_tashqi', text: "Tashqi birlashtirishlar, ya'ni LEFT, RIGHT va FULL JOIN esa juftsiz qolgan qatorlarni yo'qotmasdan, yetishmagan ustunlarni NULL bilan to'ldiradi." },
    { id: 'g6', scene: 'on_va_where', text: "Tashqi birlashtirishda ON va WHERE orasidagi farq prinsipial ahamiyatga ega." },
    { id: 'g7', scene: 'on_va_where', text: "ON sharti birlashtirish paytida juftlikni aniqlaydi, WHERE filtri esa butun natijaga birlashtirishdan keyin qo'llanadi." },
    { id: 'g8', scene: 'lateral_va_xulosa', text: "LATERAL kalit so'zi esa ichki so'rovga o'zidan oldingi jadval ustunlarini ko'rish imkonini beradi." },
    { id: 'g9', scene: 'lateral_va_xulosa', text: "Endi bu amallarni PostgreSQL 18 da sinab ko'ramiz." },
  ],
};
