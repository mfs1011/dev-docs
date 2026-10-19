// SQL 31-bob 2-qism: Kod — PostgreSQL 18 da Window funksiyalar amaliyoti
globalThis.NR = {
  scenes: ['kirish', 'bolim_ortachasi_va_over', 'reyting_va_window', 'top2_va_where_xatosi', 'osib_boruvchi_yigindi', 'lag_lead_va_last_value'],
  sceneNames: {
    kirish: "PostgreSQL 18: Sinov Jadvali",
    bolim_ortachasi_va_over: "Bo'lim O'rtachasini Har Bir Xodim Yonida Chiqarish",
    reyting_va_window: "row_number, rank, dense_rank va WINDOW Bandi",
    top2_va_where_xatosi: "Har Bo'limdan Top 2 Xodim va WHERE Xatosi",
    osib_boruvchi_yigindi: "RANGE vs ROWS: O'sib Boruvchi Yig'indi",
    lag_lead_va_last_value: "lag, lead va last_value Tuzog'ining Yechimi",
  },
  hold: {
    intro: 0.8,
    ortacha: 1.2,
    reyting: 1.2,
    top2: 1.2,
    yigindi: 1.2,
    lag: 1.2,
  },
  lines: [
    {
      id: "intro",
      scene: "kirish",
      text: "PostgreSQL 18 da oyna funksiyalarini sinab ko'ramiz: bazamizda xodimlarning bo'limi va maoshlari jadvali tayyorlangan.",
    },
    {
      id: "ortacha",
      scene: "bolim_ortachasi_va_over",
      text: "PARTITION BY yordamida qatorlarni qisqartirmasdan, har bir xodim yoniga uning o'z bo'limidagi o'rtacha maoshni joylashtirdik.",
    },
    {
      id: "reyting",
      scene: "reyting_va_window",
      text: "Teng maoshlarda rank oraliq tashlab to'rtga sakradi, dense_rank esa zich davom etdi; WINDOW bandi esa kodni chiroyli qisqartirdi.",
    },
    {
      id: "top2",
      scene: "top2_va_where_xatosi",
      text: "To'g'ridan-to'g'ri WHERE ichida filtrlash xato beradi, ammo ichki so'rov orqali har bo'limdan eng ko'p oluvchi ikki xodimni ajratdik.",
    },
    {
      id: "yigindi",
      scene: "osib_boruvchi_yigindi",
      text: "Sukut bo'yicha RANGE teng maoshlarni bitta umumiy yig'indi qiladi, qat'iy ROWS esa har bir qatorni alohida qo'shib boradi.",
    },
    {
      id: "lag",
      scene: "lag_lead_va_last_value",
      text: "lag orqali maoshlar farqini hisobladik, last_value to'g'ri ishlashi uchun esa chegarani UNBOUNDED FOLLOWING gacha kengaytirish shart.",
    },
  ],
};
