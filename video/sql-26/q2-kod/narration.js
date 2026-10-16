// SQL 26-bob 2-qism: Kod — hikoya matni
globalThis.NR = {
  scenes: ['kirish', 'asosiy_va_bosh_toplam', 'group_by_va_having', 'funksional_boglanish_va_filter', 'rollup_demo'],
  sceneNames: {
    kirish: "PostgreSQL 18: baholar va guruhlar",
    asosiy_va_bosh_toplam: "Asosiy agregatlar va bo'sh to'plam",
    group_by_va_having: "GROUP BY va HAVING amaliyoti",
    funksional_boglanish_va_filter: "Funksional bog'liqlik va FILTER",
    rollup_demo: "ROLLUP va GROUPING jamilar",
  },
  hold: {
    g1: 1.0,
    g3: 1.2,
    g5: 1.2,
    g7: 1.2,
    g8: 1.2,
  },
  lines: [
    { id: 'g1', scene: 'kirish', text: "PostgreSQL 18 da baholar va guruhlar jadvallarini tuzib, asosiy agregat funksiyalarni amalda ko'ramiz." },
    { id: 'g2', scene: 'asosiy_va_bosh_toplam', text: "Barcha oltita qatordan COUNT yulduzcha 6, bali borlar soni 5, o'rtacha ball esa aynan 85 chiqdi." },
    { id: 'g3', scene: 'asosiy_va_bosh_toplam', text: "Mos qatorlar topilmaganda COUNT nol, SUM esa nol emas, balki NULL qaytardi." },
    { id: 'g4', scene: 'group_by_va_having', text: "GROUP BY guruh_id bo'yicha har bir guruh talabalari soni va eng yuqori ballini hisoblab berdi." },
    { id: 'g5', scene: 'group_by_va_having', text: "HAVING count yulduzcha birdan katta sharti bilan faqat ko'p talabali guruhlar ajratib olindi." },
    { id: 'g6', scene: 'funksional_boglanish_va_filter', text: "Birlamchi kalit guruh_id bo'yicha guruhlaganimizda nom ustuni funksional bog'liq bo'lgani uchun xatosiz ishladi." },
    { id: 'g7', scene: 'funksional_boglanish_va_filter', text: "FILTER esa bitta so'rov ichida a'lochilarni oddiy qatorlardan ajratib sanadi." },
    { id: 'g8', scene: 'rollup_demo', text: "ROLLUP esa har bir guruhning oraliq summasi va umumiy jami 355 ballni mukammal hisobladi." },
  ],
};
