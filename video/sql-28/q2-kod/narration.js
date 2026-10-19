// SQL 28-bob 2-qism: Kod — PostgreSQL 18 da Set amallari amaliyoti
globalThis.NR = {
  scenes: ['kirish', 'union_va_all', 'intersect_va_except', 'all_hisobi', 'ustuvorlik', 'order_va_xatolar'],
  sceneNames: {
    kirish: "PostgreSQL 18: Sinov Jadvallari",
    union_va_all: "UNION va UNION ALL",
    intersect_va_except: "INTERSECT va EXCEPT",
    all_hisobi: "ALL Bilan Takrorlar Matematikasi",
    ustuvorlik: "INTERSECT va UNION Ustuvorligi",
    order_va_xatolar: "ORDER BY Qoidalari va Xatolar",
  },
  hold: {
    intro: 0.8,
    union_all: 1.0,
    intersect_except: 1.0,
    all_hisob: 1.2,
    ustuvorlik: 1.2,
    order_nom: 1.0,
    xatolar: 1.0,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "PostgreSQL 18 da to'plam amallarini amalda tekshiramiz. Sinov uchun bir xil tuzilishga ega a, b va c jadvallaridan foydalanamiz.",
    },
    {
      id: "union_all",
      scene: "union_va_all",
      text: "UNION umumiy takrorlarni olib tashlab to'rtta qator berdi, UNION ALL esa barcha qatorlarni qo'shib oltita natija qaytardi.",
    },
    {
      id: "intersect_except",
      scene: "intersect_va_except",
      text: "INTERSECT ikkala jadvaldagi umumiy ikki qatorni ajratdi, EXCEPT esa faqat a jadvalida mavjud bo'lgan bitta qatorni chiqardi.",
    },
    {
      id: "all_hisob",
      scene: "all_hisobi",
      text: "ALL kalit so'zi bilan takrorlar aniq hisoblanadi: INTERSECT ALL har ikki tomondagi eng kam uchrash sonini, EXCEPT ALL esa ayirmani saqlaydi.",
    },
    {
      id: "ustuvorlik",
      scene: "ustuvorlik",
      text: "Uchala jadval aralashganda, INTERSECT ustunroq bo'lgani sababli avval kesishma, so'ng UNION hisoblanib to'rtta qator hosil bo'ladi.",
    },
    {
      id: "order_nom",
      scene: "order_va_xatolar",
      text: "ORDER BY faqat birinchi so'rov bergan natija ustun nomiga tayanadi. Boshqa qism ustun nomlari yoki ifodalar bo'yicha saralash xato beradi.",
    },
    {
      id: "xatolar",
      scene: "order_va_xatolar",
      text: "Ustunlar soni yoki tiplari mos kelmasa PostgreSQL darhol xato qaytaradi, ikkita NULL qatori esa bitta deb hisoblanadi.",
    },
  ],
};
