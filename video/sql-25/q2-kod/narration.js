// SQL 25-bob 2-qism: Kod — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'inner_va_natural', 'tashqi_birlashtirishlar', 'on_vs_where_va_filtrlash', 'lateral_demo'],
  sceneNames: {
    kirish: "PostgreSQL 18: t1 va t2 jadvallari",
    inner_va_natural: "INNER JOIN, USING va NATURAL",
    tashqi_birlashtirishlar: "LEFT, RIGHT va FULL JOIN",
    on_vs_where_va_filtrlash: "ON vs WHERE va juftsiz qatorlar",
    lateral_demo: "LATERAL: Guruhlardan TOP-2",
  },
  hold: {
    g1: 1.0,
    g3: 1.2,
    g5: 1.2,
    g7: 1.2,
    g8: 1.2,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "PostgreSQL 18 da t1 va t2 jadvallarini yaratib, turli birlashtirish amallarini real natijalar bilan ko'ramiz." },
    { id: 'g2', scene: 'inner_va_natural', text: "INNER JOIN faqat bir xil raqamli 1 va 3 qatorlarni qaytaradi." },
    { id: 'g3', scene: 'inner_va_natural', text: "USING yordamida takrorlanuvchi ustun qisqartiriladi, NATURAL esa umumiy nomli ustunlarni avtomatik topadi." },
    { id: 'g4', scene: 'tashqi_birlashtirishlar', text: "LEFT JOIN t1 dagi juftsiz 2 qatorini, RIGHT JOIN esa t2 dagi 5 qatorini NULL bilan saqlaydi." },
    { id: 'g5', scene: 'tashqi_birlashtirishlar', text: "FULL JOIN ikkala tomonning barcha qatorlarini to'liq birlashtiradi." },
    { id: 'g6', scene: 'on_vs_where_va_filtrlash', text: "Tashqi birlashtirishda shartni ON ga yozsak juftsiz qatorlar saqlanadi, WHERE ga yozsak elakdan o'tmay yo'qoladi." },
    { id: 'g7', scene: 'on_vs_where_va_filtrlash', text: "Juftsiz qatorlarni topish uchun esa o'ng kalitga IS NULL sharti beriladi." },
    { id: 'g8', scene: 'lateral_demo', text: "LATERAL yordamida esa har bir guruhdan eng yuqori 2 ta ball to'plagan talabalarni alohida ajratib oldik." },
  ],
};
